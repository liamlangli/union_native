#include "ui/ui_renderer.h"
#include "foundation/udata.h"
#include "foundation/ustring.h"
#include "gpu/gpu_const.h"
#include "ui/ui_font.h"
#include "foundation/io.h"
#include "foundation/logger.h"
#include "gpu/gpu.h"
#include "script/script_context.h"

#if OS_MACOS
#include <unistd.h>
#endif

#include <stdlib.h>

#include <stb_ds.h>

#define PRIMITIVE_DATA_INIT_COUNT 262144 // 1M
#define UI_LAYER_1_OFFSET 237568        // size 4096
#define UI_LAYER_2_OFFSET 241664        // size 16384
#define UI_LAYER_3_OFFSET 258048        // size 4096

static u32 _gpu_font_id = 0;

void ui_renderer_write_msdf_font(ui_renderer_t *renderer, msdf_font *font) {
    u32 offset = renderer->preserved_primitive_offset;
    u32 width = font->texture_width;
    u32 height = font->texture_height;

    u32 gpu_font_id = _gpu_font_id++;
    font->gpu_font_id = gpu_font_id;
    font->gpu_font_start = offset >> 2;
    const u32 glyph_stride = 8;
    const u32 font_stride = 8;
    const u32 glyph_count = (int)hmlen(font->char_map);
    const u32 primitive_end = offset + font_stride + glyph_count * glyph_stride;

    renderer->preserved_primitive_offset = primitive_end;
    f32 *font_start = (f32 *)renderer->primitive_data + offset;
    font_start[0] = (f32)width;
    font_start[1] = (f32)height;
    renderer->primitive_data[offset + 2] = gpu_font_id;

    ui_font_glyph_vertex vertex = {0};
    ui_font_glyph_vertex *glyph_start = (ui_font_glyph_vertex *)((f32 *)font_start + font_stride);
    for (int i = 0; i < glyph_count; ++i) {
        msdf_glyph g = font->char_map[i].value;
        const u32 index = i;
        vertex.x = (f32)g.x;
        vertex.y = (f32)g.y;
        vertex.w = (f32)g.width;
        vertex.h = (f32)g.height;
        vertex.xoffset = (f32)g.xoffset;
        vertex.yoffset = (f32)g.yoffset;
        glyph_start[i] = vertex;
        font->char_map[i].value.gpu_index = i;
    }

    renderer->primitive_offset = primitive_end;
    renderer->layers[0].primitive_offset = renderer->preserved_primitive_offset;
}

// renderer func
void ui_renderer_init(ui_renderer_t *renderer) {
    // 4M ui data
    // 1M for primitive buffer 3M for index data
    renderer->primitive_data = (u32 *)malloc(PRIMITIVE_DATA_INIT_COUNT * sizeof(f32) * 4);
    renderer->index_data = (u32 *)(renderer->primitive_data + PRIMITIVE_DATA_INIT_COUNT / sizeof(f32));

    int primitive_offsets[] = {0, 237568, 241664, 258048};
    int index_offsets[] = {0, 237568 * 3, 241664 * 3, 258048 * 3};

    for (int i = 0; i < MAX_UI_LAYERS; ++i) {
        ui_layer *layer = &renderer->layers[i];
        layer->primitive_data = renderer->primitive_data + primitive_offsets[i];
        layer->index_data = renderer->index_data + index_offsets[i];
        layer->index_offset = 0;
        layer->primitive_offset = 0;
    }

    renderer->last_index_offset = 0;
    renderer->last_primitive_offset = 0;
    renderer->index_offset = 0;
    renderer->primitive_offset = 0;
    renderer->preserved_primitive_offset = 0;

    ui_font_init(ui_font_shared(), msdf_font_system_font(), 14);
    ui_renderer_write_msdf_font(renderer, ui_font_shared()->font);

    // gpu
    int max_texture_size = 4096;

    int texture_width = max_texture_size;
    int texture_height = PRIMITIVE_DATA_INIT_COUNT / 4 / texture_width;

    gpu_texture_desc primitive_data_desc = {0};
    primitive_data_desc.width = texture_width;
    primitive_data_desc.height = texture_height;
    primitive_data_desc.format = PIXELFORMAT_RGBA32F;
    primitive_data_desc.data = (udata){.data = (i8*)renderer->primitive_data, .length = PRIMITIVE_DATA_INIT_COUNT * 4 * sizeof(f32)};
    
    renderer->primitive_data_texture = gpu_create_texture(&primitive_data_desc);
    renderer->primitive_data_texture_width = texture_width;

    gpu_texture_desc icon_texture_desc = {0};
    icon_texture_desc.width = 1024;
    icon_texture_desc.height = 1024;
    icon_texture_desc.format = PIXELFORMAT_RGBA8;
    renderer->icon_texture = gpu_create_texture(&icon_texture_desc);

    renderer->index_buffer = gpu_create_buffer(&(gpu_buffer_desc){
        .size = PRIMITIVE_DATA_INIT_COUNT * 4,
        .type = BUFFER_VERTEX,
        .data = (udata){.data = (i8*)renderer->index_data, PRIMITIVE_DATA_INIT_COUNT * 4},
    });

    renderer->uniform_buffer = gpu_create_buffer(&(gpu_buffer_desc){
        .size = sizeof(float) * 4,
        .type = BUFFER_UNIFORM,
        .data = (udata){.data = (i8*)&renderer->window_size, sizeof(float) * 4},
    });

    ustring ui_shader = io_read_file(os_get_bundle_path(ustring_STR("public/shader/ui.metal")));

    gpu_shader shader = gpu_create_shader(&(gpu_shader_desc){
        .attributes = {
            [0] = {.name = "index", .type = ATTRIBUTE_FORMAT_UINT, .size = 1, .stride = 0},
        },
        .vertex = {
            .entry = "vertex_main",
            .source = ui_shader,
        },
        .fragment = {
            .entry = "fragment_main",
            .source = ui_shader,
        },
        .label = ustring_STR("ui_shader"),
    });

    gpu_pipeline pipeline = gpu_create_pipeline(&(gpu_pipeline_desc){
        .layout = {
            .attributes = {
                [0] = {.format = ATTRIBUTE_FORMAT_UINT, .size = 1, .buffer_index = 0 },
            },
            .buffers = {
                [0] = {.stride = 4, .step_rate = 1, .step_func = VERTEX_STEP_PER_VERTEX },
            }
        },
        .primitive_type = PRIMITIVE_TRIANGLES,
        .shader = shader,
        .colors = {
            [0] = {
                .blend = {
                    .enabled = true,
                    .src_factor_alpha = BLEND_FACTOR_ONE,
                    .dst_factor_alpha = BLEND_FACTOR_ONE_MINUS_SRC_ALPHA,
                    .src_factor = BLEND_FACTOR_SRC_ALPHA,
                    .dst_factor = BLEND_FACTOR_ONE_MINUS_SRC_ALPHA,
                    .op_alpha = BLEND_OP_ADD,
                    .op = BLEND_OP_ADD,
                },
                .format = PIXELFORMAT_BGRA8
            }
        },
        .color_count = 1,
        .index_type = INDEX_NONE,
        .cull_mode = CULL_NONE,
        .depth = { .write_enabled = false, .compare_func = COMPARE_LESS_EQUAL, .format = PIXELFORMAT_NONE },
    });

    renderer->binding = (gpu_binding){
        .vertex.textures = {
            [0] = renderer->primitive_data_texture,
        },
        .fragment.textures = {
            [0] = ui_font_shared()->font->texture,
            [1] = renderer->icon_texture,
        },
        .buffers = {
            [0] = renderer->index_buffer,
            [1] = renderer->uniform_buffer,
        },
    };

    renderer->pipeline = pipeline;
}

void ui_renderer_free(ui_renderer_t *renderer) { free(renderer->primitive_data); }

void ui_renderer_clear(ui_renderer_t *renderer) {
    for (int i = 0; i < MAX_UI_LAYERS; ++i) {
        ui_layer_clear(&renderer->layers[i]);
    }
    renderer->layers[0].primitive_offset = renderer->preserved_primitive_offset;
}

void ui_renderer_merge_layers(ui_renderer_t *renderer) {
    ui_layer *layer = &renderer->layers[0];
    renderer->index_offset = layer->index_offset;
    renderer->primitive_offset = layer->primitive_offset;

    for (int i = 1; i < MAX_UI_LAYERS; ++i) {
        ui_layer *layer = &renderer->layers[i];
        memcpy(renderer->index_data + renderer->index_offset, layer->index_data, layer->index_offset * sizeof(u32));
        memcpy(renderer->primitive_data + renderer->primitive_offset, layer->primitive_data,
               layer->primitive_offset * sizeof(f32));
        renderer->index_offset += layer->index_offset;
        renderer->primitive_offset += layer->primitive_offset;
    }

    renderer->last_primitive_offset = renderer->primitive_offset;
    renderer->last_index_offset = renderer->index_offset;
    ui_renderer_clear(renderer);

    gpu_update_buffer(renderer->uniform_buffer, (udata){.data = (i8 *)&renderer->window_size, sizeof(float) * 4});
    gpu_update_buffer(renderer->index_buffer, (udata){.data = (i8 *)renderer->index_data, renderer->last_index_offset * 4});
    gpu_update_texture(renderer->primitive_data_texture, (udata){.data = (i8 *)renderer->primitive_data, renderer->last_primitive_offset * 4 * sizeof(f32)});
}

void ui_renderer_render(ui_renderer_t *renderer) {
    ui_renderer_merge_layers(renderer);
    if (renderer->last_index_offset <= 0)
        return;

    script_context_t *ctx = script_context_shared();

    gpu_set_viewport(0, 0, ctx->window->framebuffer_width, ctx->window->framebuffer_height);
    gpu_set_pipeline(renderer->pipeline);
    gpu_set_binding(&renderer->binding);
    gpu_draw(0, renderer->last_index_offset, 1);
}

u32 ui_layer_write_clip(ui_layer *layer, ui_rect rect, u32 parent) {
    u32 offset = layer->primitive_offset;
    if (parent == 0) {
        *(ui_rect *)(layer->primitive_data + offset) = rect;
    } else {
        ui_rect parent_rect = ui_layer_read_clip(layer, parent);
        *(ui_rect *)(layer->primitive_data + offset) = ui_rect_intersect(rect, parent_rect);
    }
    layer->primitive_offset += 4;
    return offset;
}

ui_rect ui_layer_read_clip(ui_layer *layer, u32 clip) { return *(ui_rect *)(layer->primitive_data + clip); }

void ui_layer_write_index(ui_layer *layer, u32 index) { layer->index_data[layer->index_offset++] = index; }

u32 ui_layer_write_rect_vertex(ui_layer *layer, ui_rect_vertex vertex) {
    u32 offset = layer->primitive_offset;
    *(ui_rect_vertex *)(layer->primitive_data + layer->primitive_offset) = vertex;
    layer->primitive_offset += 8;
    return offset;
}

u32 ui_layer_write_triangle_vertex(ui_layer *layer, ui_triangle_vertex vertex, bool advanced) {
    u32 offset = layer->primitive_offset;
    *(ui_triangle_vertex *)(layer->primitive_data + layer->primitive_offset) = vertex;
    layer->primitive_offset += advanced ? 8 : 4;
    return offset;
}

u32 ui_layer_write_glyph_header(ui_layer *layer, ui_glyph_header header) {
    u32 offset = layer->primitive_offset;
    *(ui_glyph_header *)(layer->primitive_data + layer->primitive_offset) = header;
    layer->primitive_offset += 4;
    return offset;
}

u32 ui_layer_write_glyph_vertex(ui_layer *layer, ui_glyph_vertex vertex) {
    u32 offset = layer->primitive_offset;
    *(ui_glyph_vertex *)(layer->primitive_data + layer->primitive_offset) = vertex;
    layer->primitive_offset += 4;
    return offset;
}

void ui_layer_clear(ui_layer *layer) {
    layer->last_index_offset = layer->index_offset;
    layer->last_primitive_offset = layer->primitive_offset;
    layer->index_offset = 0;
    layer->primitive_offset = 0;
}
