#include "ui/ui_renderer.h"
#include "foundation/io.h"

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
    printf(vert_shader_code.data);

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

void ui_renderer_render(ui_renderer_t* renderer)
{
    if (renderer->index_offset <= 0) return;
    glBindBuffer(GL_ARRAY_BUFFER, renderer->index_buffer);
    glBufferSubData(GL_ARRAY_BUFFER, 0, renderer->index_offset, renderer->index_data);

    glBindTexture(GL_TEXTURE_2D, renderer->primitive_data_texture_width);
    GLsizei height = ceil(renderer->primitive_offset / renderer->primitive_data_texture_width);
    glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, renderer->primitive_data_texture_width, height, GL_RGBA, GL_FLOAT, renderer->primitive_data);

    glDisable(GL_DEPTH_TEST);
    glDisable(GL_CULL_FACE);
    glUseProgram(renderer->program);

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, renderer->primitive_data_texture);
    glUniform1i(renderer->primitive_data_texture_location, 0);

    glUniform3fv(renderer->window_size_location, 1, (const GLfloat*)&renderer->window_size);
    glDrawArrays(GL_TRIANGLES, 0, renderer->index_offset);
}

void ui_renderer_add_font(ui_renderer_t *renderer, gpu_font *font);
