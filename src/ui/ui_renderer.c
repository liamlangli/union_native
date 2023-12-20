#include "ui/ui_renderer.h"
#include "foundation/io.h"

#include <GL/gl.h>
#include <GLES3/gl3.h>
#include <stdlib.h>
#include <math.h>

#define PRIMITVE_DATA_INIT_COUNT 262144 // 1M
#define UI_LAYER_1_OFFSET 237568 // size 4096
#define UI_LAYER_2_OFFSET 241664 // size 16384
#define UI_LAYER_3_OFFSET 258048 // size 4096

// renderer func
void ui_renderer_init(ui_renderer_t* renderer)
{
    // 4M ui data
    // 1M for primitive buffer 3M for index data
    renderer->primitive_data = (f32*)malloc(PRIMITVE_DATA_INIT_COUNT * sizeof(f32) * 4);
    renderer->index_data = (u32*)(renderer->primitive_data + PRIMITVE_DATA_INIT_COUNT / sizeof(f32));

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

    // gpu
    GLint max_texture_size = 4096;
    glGetIntegerv(GL_MAX_TEXTURE_SIZE, &max_texture_size);

    GLsizei texture_width = max_texture_size;
    GLsizei texture_height = PRIMITVE_DATA_INIT_COUNT / 4 / texture_width;

    GLuint primitive_buffer_map;
    glGenTextures(1, &primitive_buffer_map);
    glBindTexture(GL_TEXTURE_2D, primitive_buffer_map);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, texture_width, texture_height, 0, GL_RGBA, GL_FLOAT, NULL);
    renderer->primitive_data_texture = primitive_buffer_map;
    renderer->primitive_data_texture_width = texture_width;

    GLuint index_buffer;
    glGenBuffers(1, &index_buffer);
    glBindBuffer(GL_ARRAY_BUFFER, index_buffer);
    glBufferData(GL_ARRAY_BUFFER, PRIMITVE_DATA_INIT_COUNT * 3, NULL, GL_DYNAMIC_DRAW);
    renderer->index_buffer = index_buffer;

    ustring vert_shader_code = io_read_file(ustring_STR("ui.vert"));
    ustring frag_shader_code = io_read_file(ustring_STR("ui.frag"));
    GLuint program = glCreateProgram();

    GLuint vert_shader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vert_shader, 1, (const GLchar *const *)vert_shader_code.data, (const GLint *)&vert_shader_code.length);
    glCompileShader(vert_shader);

    GLuint frag_shader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(frag_shader, 1, (const GLchar *const *)frag_shader_code.data, (const GLint *)&frag_shader_code.length);
    glCompileShader(frag_shader);

    glAttachShader(GL_VERTEX_SHADER, vert_shader);
    glAttachShader(GL_FRAGMENT_SHADER, frag_shader);

    glLinkProgram(program);
    renderer->window_size_location = glGetUniformLocation(program, "window_size");
    renderer->primitive_data_texture_location = glGetUniformLocation(program, "primitive_buffer");
    renderer->program = program;
}

void ui_renderer_free(ui_renderer_t* renderer) {
    free(renderer->primitive_data);
}

void ui_renderer_clear(ui_renderer_t* renderer) {
    ui_layer *layer = &renderer->layers[0];
    layer->last_primitive_offset = layer->primitive_offset;
    layer->last_index_offset = layer->index_offset;
    layer->primitive_offset = renderer->preserved_primitive_offset;
    layer->index_offset = 0;

    for (int i = 1; i < MAX_UI_LAYERS; ++i) {
        ui_layer_clear(&renderer->layers[i]);
    }
}

void ui_renderer_render(ui_renderer_t* renderer)
{
    if (renderer->index_offset <= 0) return;
    glBindBuffer(GL_ARRAY_BUFFER, renderer->index_buffer);
    glBufferSubData(GL_ARRAY_BUFFER, 0, renderer->index_offset, renderer->index_data);

    glBindTexture(GL_TEXTURE_2D, renderer->primitive_data_texture_width);
    GLsizei height = (GLsizei)ceil((f64)renderer->primitive_offset / (f64)renderer->primitive_data_texture_width);
    glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, renderer->primitive_data_texture_width, height, GL_RGBA, GL_FLOAT, renderer->primitive_data);

    glDisable(GL_DEPTH_TEST);
    glDisable(GL_CULL_FACE);
    glUseProgram(renderer->program);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, renderer->primitive_data_texture);
    glUniform1i(renderer->primitive_data_texture_location, 0);

    glUniform3fv(renderer->window_size_location, 1, (const GLfloat*)&renderer->window_size);
    glDrawArrays(GL_TRIANGLES, 0, renderer->index_offset);

    ui_renderer_clear(renderer);
}

u32 ui_renderer_write_clip(ui_renderer_t* renderer, ui_rect rect, u32 parent) {
    u32 offset = renderer->primitive_offset;
    if (parent == 0) {
        *(ui_rect*)(renderer->primitive_data + offset) = rect;
    } else {
        ui_rect parent_rect = ui_renderer_read_clip(renderer, parent);
        *(ui_rect*)(renderer->primitive_data + offset) = ui_rect_intersect(rect, parent_rect);
    }
    return offset;
}

ui_rect ui_renderer_read_clip(ui_renderer_t* renderer, u32 clip) {
    return *(ui_rect*)(renderer->primitive_data + clip);
}


void ui_layer_write_index(ui_layer *layer, u32 index) {
    layer->index_data[layer->index_offset++] = index;
}

u32 ui_layer_write_rect_vertex(ui_layer *layer, ui_rect_vertex vertex) {
    u32 offset = layer->primitive_offset;
    *(ui_rect_vertex*)(layer->primitive_data + layer->primitive_offset) = vertex;
    layer->primitive_offset += 8; 
    return offset;
}

u32 ui_layer_write_triangle_vertex(ui_layer *layer, ui_triangle_vertex vertex, bool advanced) {
    u32 offset = layer->primitive_offset;
    *(ui_triangle_vertex*)(layer->primitive_data + layer->primitive_offset) = vertex;
    layer->primitive_offset += advanced ? 4 : 8;
    return offset;
}

u32 ui_layer_write_glyph_header(ui_layer *layer, ui_glyph_header header) {
    u32 offset = layer->primitive_offset;
    *(ui_glyph_header*)(layer->primitive_data + layer->primitive_offset) = header;
    layer->primitive_offset += 4;
    return offset;
}

u32 ui_layer_write_glyph_vertex(ui_layer *layer, ui_glyph_vertex vertex) {
    u32 offset = layer->primitive_offset;
    *(ui_glyph_vertex*)(layer->primitive_data + layer->primitive_offset) = vertex;
    layer->primitive_offset += 4;
    return offset;
}

void ui_layer_clear(ui_layer *layer) {
    layer->last_index_offset = layer->index_offset;
    layer->last_primitive_offset = layer->primitive_offset;
    layer->index_offset = 0;
    layer->primitive_offset = 0;
}

void ui_renderer_add_font(ui_renderer_t *renderer, gpu_font *font);
