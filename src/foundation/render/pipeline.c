#include "foundation/render/render.h"
#include "foundation/render/pipeline.h"

#if defined(RENDER_BACKEND_GLES)

#include <glad/glad.h>
#include <stdlib.h>

typedef struct pipeline_o {
    GLuint program;
    pipeline_descriptor_t *descriptor;
} pipeline_o;

pipeline_o* pipeline_create(pipeline_descriptor_t *descriptor) {
    pipeline_o *pip = (pipeline_o*)malloc(sizeof(pipeline_o));
    GLuint vertex_shader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertex_shader, 1, (const GLchar * const*)&descriptor->vertex_shader.data, (const GLint*)&descriptor->vertex_shader.length);
    glCompileShader(vertex_shader);

    GLuint fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragment_shader, 1, (const GLchar * const*)&descriptor->fragment_shader.data, (const GLint*)&descriptor->fragment_shader.length);
    glCompileShader(fragment_shader);

    GLuint program = glCreateProgram();
    glAttachShader(program, vertex_shader);
    glAttachShader(program, fragment_shader);
    glLinkProgram(program);

    GLint status;
    glGetProgramiv(program, GL_LINK_STATUS, &status);
    if (status == GL_FALSE) {
        GLint info_log_length;
        glGetProgramiv(program, GL_INFO_LOG_LENGTH, &info_log_length);
        GLchar *info_log = (GLchar*)malloc(info_log_length);
        glGetProgramInfoLog(program, info_log_length, NULL, info_log);
        printf("Error linking program:\n%s\n", info_log);
        free(info_log);
    }

    glDeleteShader(vertex_shader);
    glDeleteShader(fragment_shader);

    for (int i = 0; i < MAX_UNIFORMS; ++i) {
        uniform_descriptor_t *uniform = &descriptor->uniforms[i];
        if (uniform->name.length == 0) {
            break;
        }

        GLint location = glGetUniformLocation(program, uniform->name.data);
        if (location == -1) {
            printf("Error getting uniform location for %s\n", uniform->name.data);
            continue;
        }
    }

    pip->program = program;
    pip->descriptor = descriptor;
    return pip;
}

void pipeline_destroy(pipeline_o *pipeline) {
    glDeleteProgram(pipeline->program);
}

void encoder_set_pipeline(encoder_o *encoder, pipeline_o *pipeline)
{
    glUseProgram(pipeline->program);
    pipeline_descriptor_t *descriptor = pipeline->descriptor;

    if (descriptor->blend_state.enabled)
    {
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    }
    else
    {
        glDisable(GL_BLEND);
    }

    if (descriptor->depth_write)
    {
        glDepthMask(GL_TRUE);
    }
    else
    {
        glDepthMask(GL_FALSE);
    }

    if (descriptor->depth_test)
    {
        glEnable(GL_DEPTH_TEST);
        glDepthFunc(pipeline->descriptor->depth_test_func);
    }
    else
    {
        glDisable(GL_DEPTH_TEST);
    }

    glColorMask(
        (descriptor->color_write_mask & 0x1) != 0,
        (descriptor->color_write_mask & 0x2) != 0,
        (descriptor->color_write_mask & 0x4) != 0,
        (descriptor->color_write_mask & 0x8) != 0
    );
}

#endif