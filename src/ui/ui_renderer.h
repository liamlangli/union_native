#pragma once

#include "foundation/global.h"
#include "ui/ui_type.h"
#include "gpu/gpu.h"

#define MAX_UI_LAYERS 4

typedef struct ui_layer {
    u32 *index_data;
    u32 *primitive_data;
    u32 index_offset, primitive_offset;
    u32 last_index_offset, last_primitive_offset;
} ui_layer;

typedef struct ui_renderer_t {
    // cpu side
    ui_layer layers[MAX_UI_LAYERS];
    u32 *index_data;
    u32 *primitive_data;
    u32 index_offset, primitive_offset;
    u32 last_index_offset, last_primitive_offset;
    u32 preserved_primitive_offset;

    // gpu side
    float4 window_size;
    u32 primitive_data_texture_width;
    gpu_texture primitive_data_texture;
    gpu_buffer index_buffer;
    gpu_buffer uniform_buffer;
    gpu_texture icon_texture;
    gpu_binding binding;
    gpu_pipeline pipeline;
} ui_renderer_t;

typedef struct ui_rect_vertex {
    f32 x, y, w, h;
    u32 color, clip;
} ui_rect_vertex;

typedef struct ui_triangle_vertex {
    f32 x, y;
    u32 color, clip;
    f32 u, v;
    u32 type;
    f32 offset;
} ui_triangle_vertex;

typedef struct ui_glyph_header {
    f32 x, y;
    u32 font;
    f32 clip;
} ui_glyph_header;

typedef struct ui_glyph_vertex {
    f32 xoffset;
    u32 glyph_index;
    u32 color;
    f32 scale;
} ui_glyph_vertex;

typedef struct ui_font_glyph_vertex {
    f32 x, y, w, h, xoffset, yoffset, xadvance, page;
} ui_font_glyph_vertex;

UN_EXPORT void ui_layer_write_index(u32 layer_index, u32 index);
u32 ui_layer_write_rect_vertex(u32 layer_index, ui_rect_vertex vertex);
u32 ui_layer_write_triangle_vertex(u32 layer_index, ui_triangle_vertex vertex, bool advanced);
u32 ui_layer_write_glyph_header(u32 layer_index, ui_glyph_header header);
u32 ui_layer_write_glyph_vertex(u32 layer_index, ui_glyph_vertex vertex);
u32 ui_layer_write_clip(u32 layer_index, ui_rect rect, u32 parent);
u32 ui_layer_get_primitive_offset(int layer_index);
ui_rect ui_layer_read_clip(u32 layer_index, u32 clip);
void ui_layer_clear(ui_layer *layer);

// renderer func
UN_EXPORT void ui_renderer_init();
UN_EXPORT void ui_renderer_free();
UN_EXPORT void ui_renderer_render();
UN_EXPORT void ui_renderer_set_size(u32 width, u32 height);

