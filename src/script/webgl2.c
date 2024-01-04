#include "script/webgl2.h"

#include "foundation/global.h"
#include "foundation/logger.h"
#include "script/script.h"

#include <GLES3/gl3.h>
#include <quickjs/quickjs.h>
#include <stdlib.h>

const char * gl_err_msg(GLenum err) {
        switch (err) {
        case GL_INVALID_ENUM:
                return "GL_INVALID_ENUM";
        case GL_INVALID_VALUE:
                return "GL_INVALID_VALUE";
        case GL_INVALID_OPERATION:
                return "GL_INVALID_OPERATION";
        case GL_INVALID_FRAMEBUFFER_OPERATION:
                return "GL_INVALID_FRAMEBUFFER_OPERATION";
        case GL_OUT_OF_MEMORY:
                return "GL_OUT_OF_MEMORY";
        default:
                return "UNKNOWN";
        }
}

static int gl_check_error(const char *msg, int line) {
    GLenum err = glGetError();
    if (err != GL_NO_ERROR) {
        fprintf(stderr, "gl error: %s, %s, %d\n", gl_err_msg(err), msg, line);
        return 1;
    }
    return 0;
}

static int gl_get_shader_info_log(GLuint shader) {
    GLint length = 0;
    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &length);
    if (length > 0) {
        char *info_log = (char *)malloc(length);
        glGetShaderInfoLog(shader, length, NULL, info_log);
        printf("shader info log: %s\n", info_log);
        free(info_log);
        return -1;
    }
    return 0;
}

static JSValue js_gl_get_extension(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_NewObject(ctx);
}

static JSValue js_gl_get_parameter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    u32 pname;
    JS_ToUint32(ctx, &pname, argv[0]);
    if (pname == GL_RENDERER || pname == GL_VENDOR) {
        const GLubyte *gl_str = glGetString(pname);
        return JS_NewString(ctx, (const char *)gl_str);
    }

    GLint param;
    glGetIntegerv(pname, &param);
    if (gl_check_error("glGetIntegerv", __LINE__) != 0) {
        printf("glGetIntegerv error: %d\n", pname);
        return JS_UNDEFINED;
    }
    return JS_NewInt32(ctx, param);
}

static JSValue js_gl_clear(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    return JS_UNDEFINED;
}

static JSValue js_gl_viewport(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    u32 x, y, width, height;
    JS_ToUint32(ctx, &x, argv[0]);
    JS_ToUint32(ctx, &y, argv[1]);
    JS_ToUint32(ctx, &width, argv[2]);
    JS_ToUint32(ctx, &height, argv[3]);
    glViewport(x, y, width, height);
    return JS_UNDEFINED;
}

static JSValue js_gl_clear_color(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    f64 r, g, b, a;
    JS_ToFloat64(ctx, &r, argv[0]);
    JS_ToFloat64(ctx, &g, argv[1]);
    JS_ToFloat64(ctx, &b, argv[2]);
    JS_ToFloat64(ctx, &a, argv[3]);
    glClearColor(r, g, b, a);
    return JS_UNDEFINED;
}

static JSValue js_gl_clear_depth(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    f64 depth;
    JS_ToFloat64(ctx, &depth, argv[0]);
    glClearDepthf(depth);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint buffer;
    glGenBuffers(1, &buffer);
    gl_check_error("glGenBuffers", __LINE__);
    return JS_NewInt32(ctx, buffer);
}

static JSValue js_gl_bind_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, buffer;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &buffer, argv[1]);
    glBindBuffer(target, buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_buffer_data(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, usage;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &usage, argv[2]);
    JSValue data = argv[1];

    if (JS_IsNumber(data)) {
        GLuint size;
        JS_ToUint32(ctx, &size, data);
        glBufferData(target, size, NULL, usage);
    } else {
        JSValue buffer = JS_GetPropertyStr(ctx, data, "buffer");
        size_t length;
        u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, buffer);
        glBufferData(target, length, data_buffer, usage);
    }
    return JS_UNDEFINED;
}

static JSValue js_gl_buffer_sub_data(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, dst_offset, src_offset, length;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &dst_offset, argv[1]);
    JSValue data = argv[2];
    if (JS_IsNumber(data)) {
        GLuint size;
        JS_ToUint32(ctx, &size, data);
        glBufferSubData(target, dst_offset, size, NULL);
    } else {
        JSValue buffer = JS_GetPropertyStr(ctx, data, "buffer");
        size_t length;
        u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, buffer);
        glBufferSubData(target, dst_offset, length, data_buffer);
    }

    return JS_UNDEFINED;
}

static JSValue js_gl_bind_buffer_range(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, index, buffer, offset, length;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &index, argv[1]);
    JS_ToUint32(ctx, &buffer, argv[2]);
    JS_ToUint32(ctx, &offset, argv[3]);
    JS_ToUint32(ctx, &length, argv[4]);
    glBindBufferRange(target, index, buffer, offset, length);
    return JS_UNDEFINED;
}

static JSValue js_gl_delete_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint buffer;
    JS_ToUint32(ctx, &buffer, argv[0]);
    glDeleteBuffers(1, &buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_shader(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
    shader = glCreateShader(shader);
    gl_check_error("glCreateShader", __LINE__);
    return JS_NewInt32(ctx, shader);
}

static JSValue js_gl_shader_source(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
    JSValue source = argv[1];
    if (JS_IsString(source)) {
        const char *str = JS_ToCString(ctx, source);
        glShaderSource(shader, 1, &str, NULL);
        if (gl_check_error("glShaderSource", __LINE__) != 0) {
            // printf("glShaderSource error: %s\n", str);
            gl_get_shader_info_log(shader);
        }
        JS_FreeCString(ctx, str);
    } else {
        JSValue buffer = JS_GetPropertyStr(ctx, source, "buffer");
        size_t length;
        u8 *str = JS_GetArrayBuffer(ctx, &length, buffer);
        glShaderSource(shader, 1, (const char *const *)&str, NULL);
    }
    return JS_UNDEFINED;
}

static JSValue js_gl_compile_shader(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
    glCompileShader(shader);
    gl_check_error("glCompileShader", __LINE__);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_shader_parameter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint shader, pname;
    JS_ToUint32(ctx, &shader, argv[0]);
    JS_ToUint32(ctx, &pname, argv[1]);
    GLint param;
    glGetShaderiv(shader, pname, &param);
    return JS_NewInt32(ctx, param);
}

static JSValue js_gl_get_shader_info_log(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
    GLint length = 0;
    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &length);
    if (length == 0) {
        return JS_NewAtomString(ctx, "");
    }

    char *info_log = (char *)malloc(length);
    glGetShaderInfoLog(shader, length, NULL, info_log);
    JSValue ret = JS_NewString(ctx, info_log);
    free(info_log);
    return ret;
}

static JSValue js_gl_create_program(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    program = glCreateProgram();
    return JS_NewInt32(ctx, program);
}

static JSValue js_gl_attach_shader(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program, shader;
    JS_ToUint32(ctx, &program, argv[0]);
    JS_ToUint32(ctx, &shader, argv[1]);
    glAttachShader(program, shader);
    return JS_UNDEFINED;
}

static JSValue js_gl_link_program(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    glLinkProgram(program);

    GLuint err = glGetError();
    if (err != GL_NO_ERROR) {
        fprintf(stderr, "glLinkProgram error: %d\n", err);
    }

    return JS_UNDEFINED;
}

static JSValue js_gl_delete_program(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    glDeleteProgram(program);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_uniform_block_index(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    const char *uniformBlockName = JS_ToCString(ctx, argv[1]);
    GLuint index = glGetUniformBlockIndex(program, uniformBlockName);
    if (index == GL_INVALID_INDEX) {
        fprintf(stderr, "invalid uniform block name: %s\n", uniformBlockName);
    }

    JS_FreeCString(ctx, uniformBlockName);
    return JS_NewInt32(ctx, index);
}

static JSValue js_gl_get_active_uniform_block_parameter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program, uniformBlockIndex, pname;
    JS_ToUint32(ctx, &program, argv[0]);
    JS_ToUint32(ctx, &uniformBlockIndex, argv[1]);
    JS_ToUint32(ctx, &pname, argv[2]);
    GLint param;
    glGetActiveUniformBlockiv(program, uniformBlockIndex, pname, &param);
    return JS_NewInt32(ctx, param);
}

static JSValue js_gl_get_uniform_indices(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JSValue uniformNames = argv[1];
    JS_ToUint32(ctx, &program, argv[0]);
    GLuint uniformCount;
    JS_ToUint32(ctx, &uniformCount, JS_GetPropertyStr(ctx, uniformNames, "length"));
    const char **uniformNamesArray = (const char **)malloc(sizeof(const char *) * uniformCount);
    for (int i = 0; i < uniformCount; i++) {
        JSValue name = JS_GetPropertyUint32(ctx, uniformNames, i);
        uniformNamesArray[i] = JS_ToCString(ctx, name);
    }
    GLuint *uniformIndices = (GLuint *)malloc(sizeof(GLuint) * uniformCount);
    glGetUniformIndices(program, uniformCount, uniformNamesArray, uniformIndices);
    JSValue ret = JS_NewArray(ctx);
    for (int i = 0; i < uniformCount; i++) {
        JS_SetPropertyUint32(ctx, ret, i, JS_NewInt32(ctx, uniformIndices[i]));
    }
    free(uniformIndices);
    return ret;
}

static JSValue js_gl_get_active_uniforms(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JSValue uniformIndices = argv[1];
    JS_ToUint32(ctx, &program, argv[0]);
    GLuint uniformCount;
    JS_ToUint32(ctx, &uniformCount, JS_GetPropertyStr(ctx, uniformIndices, "length"));
    GLuint *uniformIndicesArray = (GLuint *)malloc(sizeof(GLuint) * uniformCount);
    for (int i = 0; i < uniformCount; i++) {
        JSValue index = JS_GetPropertyUint32(ctx, uniformIndices, i);
        JS_ToUint32(ctx, &uniformIndicesArray[i], index);
    }
    GLuint pname;
    JS_ToUint32(ctx, &pname, argv[2]);
    GLint *params = (GLint *)malloc(sizeof(GLint) * uniformCount);
    glGetActiveUniformsiv(program, uniformCount, uniformIndicesArray, pname, params);
    JSValue ret = JS_NewArray(ctx);
    for (int i = 0; i < uniformCount; i++) {
        JS_SetPropertyUint32(ctx, ret, i, JS_NewInt32(ctx, params[i]));
    }
    free(uniformIndicesArray);
    free(params);
    return ret;
}

static JSValue js_gl_uniform1f(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    f64 v0;
    JS_ToUint32(ctx, &location, argv[0]);
    JS_ToFloat64(ctx, &v0, argv[1]);
    glUniform1f(location, v0);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform1fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[1], "buffer"));
    glUniform1fv(location, (GLsizei)length >> 2, (GLfloat *)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform2fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[1], "buffer"));
    glUniform2fv(location, (GLsizei)(length >> 3), (GLfloat *)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform3fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[1], "buffer"));
    glUniform3fv(location, (GLsizei)(length >> 2) / 3, (GLfloat *)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform4fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[1], "buffer"));
    glUniform4fv(location, (GLsizei)length >> 4, (GLfloat *)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform_1i(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    GLint v0;
    JS_ToUint32(ctx, &location, argv[0]);
    JS_ToInt32(ctx, &v0, argv[1]);
    glUniform1i(location, v0);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform_1u(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    GLuint v0;
    JS_ToUint32(ctx, &location, argv[0]);
    JS_ToUint32(ctx, &v0, argv[1]);
    glUniform1ui(location, v0);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform_matrix_4fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[2], "buffer"));
    glUniformMatrix4fv(location, (GLsizei)length >> 6, JS_ToBool(ctx, argv[1]), (const GLfloat *)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform_matrix_3fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[2], "buffer"));
    glUniformMatrix3fv(location, (GLsizei)(length >> 2) / 9, JS_ToBool(ctx, argv[1]), (const GLfloat *)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_program_parameter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program, pname;
    JS_ToUint32(ctx, &program, argv[0]);
    JS_ToUint32(ctx, &pname, argv[1]);
    GLint param;
    glGetProgramiv(program, pname, &param);
    return JS_NewInt32(ctx, param);
}

static JSValue js_gl_get_program_info_log(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    GLint length;
    glGetProgramiv(program, GL_INFO_LOG_LENGTH, &length);
    char *info_log = (char *)malloc(length);
    glGetProgramInfoLog(program, length, NULL, info_log);
    JSValue ret = JS_NewString(ctx, info_log);
    free(info_log);
    return ret;
}

static JSValue js_gl_use_program(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    glUseProgram(program);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_unifom_location(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    const char *name = JS_ToCString(ctx, argv[1]);
    GLint location = glGetUniformLocation(program, name);
    JS_FreeCString(ctx, name);
    if (location == -1)
        return JS_NULL;
    return JS_NewInt32(ctx, location);
}

static JSValue js_gl_uniform_block_binding(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program, uniformBlockIndex, uniformBlockBinding;
    JS_ToUint32(ctx, &program, argv[0]);
    JS_ToUint32(ctx, &uniformBlockIndex, argv[1]);
    JS_ToUint32(ctx, &uniformBlockBinding, argv[2]);
    glUniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_attrib_location(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    const char *name = JS_ToCString(ctx, argv[1]);
    GLint location = glGetAttribLocation(program, name);
    JS_FreeCString(ctx, name);
    return JS_NewInt32(ctx, location);
}

static JSValue js_gl_vertex_attrib_pointer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint index, size, type, normalized, stride;
    JS_ToUint32(ctx, &index, argv[0]);
    JS_ToUint32(ctx, &size, argv[1]);
    JS_ToUint32(ctx, &type, argv[2]);
    JS_ToUint32(ctx, &normalized, argv[3]);
    JS_ToUint32(ctx, &stride, argv[4]);
    glVertexAttribPointer(index, size, type, normalized, stride, NULL);
    return JS_UNDEFINED;
}

static JSValue js_gl_vertex_attribi_pointer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint index, size, type, stride;
    JS_ToUint32(ctx, &index, argv[0]);
    JS_ToUint32(ctx, &size, argv[1]);
    JS_ToUint32(ctx, &type, argv[2]);
    JS_ToUint32(ctx, &stride, argv[3]);
    glVertexAttribIPointer(index, size, type, stride, NULL);
    return JS_UNDEFINED;
}

static JSValue js_gl_enable_vertex_attrib_array(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint index;
    JS_ToUint32(ctx, &index, argv[0]);
    glEnableVertexAttribArray(index);
    return JS_UNDEFINED;
}

static JSValue js_gl_draw_arrays(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint mode, first, count;
    JS_ToUint32(ctx, &mode, argv[0]);
    JS_ToUint32(ctx, &first, argv[1]);
    JS_ToUint32(ctx, &count, argv[2]);
    glDrawArrays(mode, first, count);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint texture;
    glGenTextures(1, &texture);
    return JS_NewInt32(ctx, texture);
}

static JSValue js_gl_bind_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, texture;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &texture, argv[1]);
    glBindTexture(target, texture);
    return JS_UNDEFINED;
}

static JSValue js_gl_active_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint texture;
    JS_ToUint32(ctx, &texture, argv[0]);
    glActiveTexture(texture);
    return JS_UNDEFINED;
}

static JSValue js_gl_tex_image2d(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, level, internalformat, width, height, border, format, type;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &level, argv[1]);
    JS_ToUint32(ctx, &internalformat, argv[2]);
    JS_ToUint32(ctx, &width, argv[3]);
    JS_ToUint32(ctx, &height, argv[4]);
    JS_ToUint32(ctx, &border, argv[5]);
    JS_ToUint32(ctx, &format, argv[6]);
    JS_ToUint32(ctx, &type, argv[7]);
    JSValue data = argv[8];

    JSValue buffer = JS_GetPropertyStr(ctx, data, "buffer");
    size_t length;
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, buffer);
    glTexImage2D(target, level, internalformat, width, height, border, format, type, data_buffer);

    return JS_UNDEFINED;
}

static JSValue js_gl_tex_sub_image2d(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, level, xoffset, yoffset, width, height, format, type;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &level, argv[1]);
    JS_ToUint32(ctx, &xoffset, argv[2]);
    JS_ToUint32(ctx, &yoffset, argv[3]);
    JS_ToUint32(ctx, &width, argv[4]);
    JS_ToUint32(ctx, &height, argv[5]);
    JS_ToUint32(ctx, &format, argv[6]);
    JS_ToUint32(ctx, &type, argv[7]);
    JSValue data = argv[8];

    JSValue buffer = JS_GetPropertyStr(ctx, data, "buffer");
    size_t length;
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, buffer);
    glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, data_buffer);

    return JS_UNDEFINED;
}

static JSValue js_gl_tex_storage2d(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, levels, internalformat, width, height;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &levels, argv[1]);
    JS_ToUint32(ctx, &internalformat, argv[2]);
    JS_ToUint32(ctx, &width, argv[3]);
    JS_ToUint32(ctx, &height, argv[4]);
    glTexStorage2D(target, levels, internalformat, width, height);
    return JS_UNDEFINED;
}

static JSValue js_gl_tex_storage3d(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, levels, internalformat, width, height, depth;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &levels, argv[1]);
    JS_ToUint32(ctx, &internalformat, argv[2]);
    JS_ToUint32(ctx, &width, argv[3]);
    JS_ToUint32(ctx, &height, argv[4]);
    JS_ToUint32(ctx, &depth, argv[5]);
    glTexStorage3D(target, levels, internalformat, width, height, depth);
    return JS_UNDEFINED;
}

static JSValue js_gl_tex_parameteri(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, pname, param;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &pname, argv[1]);
    JS_ToUint32(ctx, &param, argv[2]);
    glTexParameteri(target, pname, param);
    return JS_UNDEFINED;
}

static JSValue js_gl_delete_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint texture;
    JS_ToUint32(ctx, &texture, argv[0]);
    glDeleteTextures(1, &texture);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_framebuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint framebuffer;
    glGenFramebuffers(1, &framebuffer);
    return JS_NewInt32(ctx, framebuffer);
}

static JSValue js_gl_bind_framebuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, framebuffer;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &framebuffer, argv[1]);
    glBindFramebuffer(target, framebuffer);
    return JS_UNDEFINED;
}

static GLenum draw_buffers[4] = {
    GL_COLOR_ATTACHMENT0,
    GL_COLOR_ATTACHMENT1,
    GL_COLOR_ATTACHMENT2,
    GL_COLOR_ATTACHMENT3,
};
static JSValue js_gl_draw_buffers(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint n;
    JSValue arr = argv[0];
    JS_ToUint32(ctx, &n, JS_GetPropertyStr(ctx, arr, "length"));
    glDrawBuffers(n, draw_buffers);
    return JS_UNDEFINED;
}

static JSValue js_gl_framebuffer_texture2d(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, attachment, textarget, texture, level;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &attachment, argv[1]);
    JS_ToUint32(ctx, &textarget, argv[2]);
    JS_ToUint32(ctx, &texture, argv[3]);
    JS_ToUint32(ctx, &level, argv[4]);
    glFramebufferTexture2D(target, attachment, textarget, texture, level);
    return JS_UNDEFINED;
}

static JSValue js_gl_check_framebuffer_status(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target;
    JS_ToUint32(ctx, &target, argv[0]);
    GLenum status = glCheckFramebufferStatus(target);
    return JS_NewInt32(ctx, status);
}

static JSValue js_gl_delete_framebuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint framebuffer;
    JS_ToUint32(ctx, &framebuffer, argv[0]);
    glDeleteFramebuffers(1, &framebuffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_renderbuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint renderbuffer;
    glGenRenderbuffers(1, &renderbuffer);
    return JS_NewInt32(ctx, renderbuffer);
}

static JSValue js_gl_bind_renderbuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, renderbuffer;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &renderbuffer, argv[1]);
    glBindRenderbuffer(target, renderbuffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_renderbuffer_storage(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, internalformat, width, height;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &internalformat, argv[1]);
    JS_ToUint32(ctx, &width, argv[2]);
    JS_ToUint32(ctx, &height, argv[3]);
    glRenderbufferStorage(target, internalformat, width, height);
    return JS_UNDEFINED;
}

static JSValue js_gl_framebuffer_renderbuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint target, attachment, renderbuffertarget, renderbuffer;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &attachment, argv[1]);
    JS_ToUint32(ctx, &renderbuffertarget, argv[2]);
    JS_ToUint32(ctx, &renderbuffer, argv[3]);
    glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_vertex_array(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint vertex_array;
    glGenVertexArrays(1, &vertex_array);
    return JS_NewInt32(ctx, vertex_array);
}

static JSValue js_gl_bind_vertex_array(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint array;
    JS_ToUint32(ctx, &array, argv[0]);
    glBindVertexArray(array);
    return JS_UNDEFINED;
}

static JSValue js_gl_enable(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint cap;
    JS_ToUint32(ctx, &cap, argv[0]);
    glEnable(cap);
    return JS_UNDEFINED;
}

static JSValue js_gl_disable(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint cap;
    JS_ToUint32(ctx, &cap, argv[0]);
    glDisable(cap);
    return JS_UNDEFINED;
}

static JSValue js_gl_blend_func(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint sfactor, dfactor;
    JS_ToUint32(ctx, &sfactor, argv[0]);
    JS_ToUint32(ctx, &dfactor, argv[1]);
    glBlendFunc(sfactor, dfactor);
    return JS_UNDEFINED;
}

static JSValue js_gl_blend_equation(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint mode;
    JS_ToUint32(ctx, &mode, argv[0]);
    glBlendEquation(mode);
    return JS_UNDEFINED;
}

static JSValue js_gl_blend_func_separate(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint srcRGB, dstRGB, srcAlpha, dstAlpha;
    JS_ToUint32(ctx, &srcRGB, argv[0]);
    JS_ToUint32(ctx, &dstRGB, argv[1]);
    JS_ToUint32(ctx, &srcAlpha, argv[2]);
    JS_ToUint32(ctx, &dstAlpha, argv[3]);
    glBlendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
    return JS_UNDEFINED;
}

static JSValue js_gl_blend_equation_separate(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint modeRGB, modeAlpha;
    JS_ToUint32(ctx, &modeRGB, argv[0]);
    JS_ToUint32(ctx, &modeAlpha, argv[1]);
    glBlendEquationSeparate(modeRGB, modeAlpha);
    return JS_UNDEFINED;
}

static JSValue js_gl_depth_func(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint func;
    JS_ToUint32(ctx, &func, argv[0]);
    glDepthFunc(func);
    return JS_UNDEFINED;
}

static JSValue js_gl_depth_mask(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint flag;
    JS_ToUint32(ctx, &flag, argv[0]);
    glDepthMask(flag);
    return JS_UNDEFINED;
}

static JSValue js_gl_cull_face(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint mode;
    JS_ToUint32(ctx, &mode, argv[0]);
    glCullFace(mode);
    return JS_UNDEFINED;
}

static JSValue js_gl_front_face(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint mode;
    JS_ToUint32(ctx, &mode, argv[0]);
    glFrontFace(mode);
    return JS_UNDEFINED;
}

static JSValue js_gl_polygon_offset(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    f64 factor, units;
    JS_ToFloat64(ctx, &factor, argv[0]);
    JS_ToFloat64(ctx, &units, argv[1]);
    glPolygonOffset((f32)factor, (f32)units);
    return JS_UNDEFINED;
}

static JSValue js_gl_draw_elements(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    GLuint mode, count, type;
    JS_ToUint32(ctx, &mode, argv[0]);
    JS_ToUint32(ctx, &count, argv[1]);
    JS_ToUint32(ctx, &type, argv[2]);
    glDrawElements(mode, count, type, NULL);
    return JS_UNDEFINED;
}

void script_webgl2_register() {
    JSContext *ctx = (JSContext *)script_context_internal();
    JSValue global = JS_GetGlobalObject(ctx);
    static JSCFunctionListEntry gl_proto_funcs[] = {
        JS_CFUNC_DEF("getExtension", 1, js_gl_get_extension),
        JS_CFUNC_DEF("getParameter", 1, js_gl_get_parameter),

        JS_CFUNC_DEF("clear", 0, js_gl_clear),
        JS_CFUNC_DEF("viewport", 4, js_gl_viewport),
        JS_CFUNC_DEF("clearColor", 4, js_gl_clear_color),
        JS_CFUNC_DEF("clearDepth", 1, js_gl_clear_depth),
        JS_CFUNC_DEF("createBuffer", 0, js_gl_create_buffer),
        JS_CFUNC_DEF("bindBuffer", 2, js_gl_bind_buffer),
        JS_CFUNC_DEF("bindBufferRange", 5, js_gl_bind_buffer_range),
        JS_CFUNC_DEF("bufferData", 3, js_gl_buffer_data),
        JS_CFUNC_DEF("bufferSubData", 5, js_gl_buffer_sub_data),
        JS_CFUNC_DEF("deleteBuffer", 1, js_gl_delete_buffer),

        JS_CFUNC_DEF("createShader", 1, js_gl_create_shader),
        JS_CFUNC_DEF("shaderSource", 2, js_gl_shader_source),
        JS_CFUNC_DEF("compileShader", 1, js_gl_compile_shader),
        JS_CFUNC_DEF("getShaderParameter", 2, js_gl_get_shader_parameter),
        JS_CFUNC_DEF("getShaderInfoLog", 1, js_gl_get_shader_info_log),
        JS_CFUNC_DEF("createProgram", 0, js_gl_create_program),
        JS_CFUNC_DEF("attachShader", 2, js_gl_attach_shader),
        JS_CFUNC_DEF("linkProgram", 1, js_gl_link_program),
        JS_CFUNC_DEF("deleteProgram", 1, js_gl_delete_program),
        JS_CFUNC_DEF("getProgramParameter", 2, js_gl_get_program_parameter),
        JS_CFUNC_DEF("getProgramInfoLog", 1, js_gl_get_program_info_log),
        JS_CFUNC_DEF("useProgram", 1, js_gl_use_program),
        JS_CFUNC_DEF("getUniformLocation", 2, js_gl_get_unifom_location),
        JS_CFUNC_DEF("getUniformBlockIndex", 4, js_gl_get_uniform_block_index),
        JS_CFUNC_DEF("getActiveUniformBlockParameter", 3, js_gl_get_active_uniform_block_parameter),
        JS_CFUNC_DEF("getUniformIndices", 3, js_gl_get_uniform_indices),
        JS_CFUNC_DEF("getActiveUniforms", 4, js_gl_get_active_uniforms),

        JS_CFUNC_DEF("getAttribLocation", 2, js_gl_get_attrib_location),
        JS_CFUNC_DEF("vertexAttribPointer", 6, js_gl_vertex_attrib_pointer),
        JS_CFUNC_DEF("vertexAttribIPointer", 5, js_gl_vertex_attribi_pointer),
        JS_CFUNC_DEF("enableVertexAttribArray", 1, js_gl_enable_vertex_attrib_array),
        JS_CFUNC_DEF("drawArrays", 3, js_gl_draw_arrays),
        JS_CFUNC_DEF("createTexture", 0, js_gl_create_texture),
        JS_CFUNC_DEF("bindTexture", 2, js_gl_bind_texture),
        JS_CFUNC_DEF("activeTexture", 1, js_gl_active_texture),
        JS_CFUNC_DEF("texImage2D", 9, js_gl_tex_image2d),
        JS_CFUNC_DEF("texSubImage2D", 9, js_gl_tex_sub_image2d),
        JS_CFUNC_DEF("texStorage2D", 5, js_gl_tex_storage2d),
        JS_CFUNC_DEF("texStorage3D", 6, js_gl_tex_storage3d),
        JS_CFUNC_DEF("texParameteri", 3, js_gl_tex_parameteri),
        JS_CFUNC_DEF("deleteTexture", 1, js_gl_delete_texture),

        JS_CFUNC_DEF("createFramebuffer", 0, js_gl_create_framebuffer),
        JS_CFUNC_DEF("bindFramebuffer", 2, js_gl_bind_framebuffer),
        JS_CFUNC_DEF("framebufferTexture2D", 5, js_gl_framebuffer_texture2d),
        JS_CFUNC_DEF("drawBuffers", 1, js_gl_draw_buffers),
        JS_CFUNC_DEF("checkFramebufferStatus", 1, js_gl_check_framebuffer_status),
        JS_CFUNC_DEF("deleteFramebuffer", 1, js_gl_delete_framebuffer),

        JS_CFUNC_DEF("createRenderbuffer", 0, js_gl_create_renderbuffer),
        JS_CFUNC_DEF("bindRenderbuffer", 2, js_gl_bind_renderbuffer),
        JS_CFUNC_DEF("renderbufferStorage", 4, js_gl_renderbuffer_storage),
        JS_CFUNC_DEF("framebufferRenderbuffer", 4, js_gl_framebuffer_renderbuffer),
        JS_CFUNC_DEF("createVertexArray", 0, js_gl_create_vertex_array),
        JS_CFUNC_DEF("bindVertexArray", 1, js_gl_bind_vertex_array),
        JS_CFUNC_DEF("enable", 1, js_gl_enable),
        JS_CFUNC_DEF("disable", 1, js_gl_disable),
        JS_CFUNC_DEF("blendFunc", 2, js_gl_blend_func),
        JS_CFUNC_DEF("blendEquation", 1, js_gl_blend_equation),
        JS_CFUNC_DEF("blendFuncSeparate", 4, js_gl_blend_func_separate),
        JS_CFUNC_DEF("blendEquationSeparate", 2, js_gl_blend_equation_separate),
        JS_CFUNC_DEF("depthFunc", 1, js_gl_depth_func),
        JS_CFUNC_DEF("depthMask", 1, js_gl_depth_mask),
        JS_CFUNC_DEF("cullFace", 1, js_gl_cull_face),
        JS_CFUNC_DEF("frontFace", 1, js_gl_front_face),
        JS_CFUNC_DEF("polygonOffset", 2, js_gl_polygon_offset),
        JS_CFUNC_DEF("drawElements", 4, js_gl_draw_elements),

        JS_CFUNC_DEF("uniform1f", 2, js_gl_uniform1f),
        JS_CFUNC_DEF("uniform1fv", 2, js_gl_uniform1fv),
        JS_CFUNC_DEF("uniform2fv", 2, js_gl_uniform2fv),
        JS_CFUNC_DEF("uniform3fv", 2, js_gl_uniform3fv),
        JS_CFUNC_DEF("uniform4fv", 2, js_gl_uniform4fv),
        JS_CFUNC_DEF("uniform1i", 2, js_gl_uniform_1i),
        JS_CFUNC_DEF("uniform1u", 2, js_gl_uniform_1u),
        JS_CFUNC_DEF("uniformMatrix4fv", 3, js_gl_uniform_matrix_4fv),
        JS_CFUNC_DEF("uniformMatrix3fv", 3, js_gl_uniform_matrix_3fv),
        JS_CFUNC_DEF("uniformBlockBinding", 3, js_gl_uniform_block_binding),

        JS_PROP_INT32_DEF("VERTEX_SHADER", GL_VERTEX_SHADER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("FRAGMENT_SHADER", GL_FRAGMENT_SHADER, JS_PROP_CONFIGURABLE),

        JS_PROP_INT32_DEF("UNIFORM_BUFFER", GL_UNIFORM_BUFFER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("ARRAY_BUFFER", GL_ARRAY_BUFFER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("ELEMENT_ARRAY_BUFFER", GL_ELEMENT_ARRAY_BUFFER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("STATIC_DRAW", GL_STATIC_DRAW, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DYNAMIC_DRAW", GL_DYNAMIC_DRAW, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("STREAM_DRAW", GL_STREAM_DRAW, JS_PROP_CONFIGURABLE),

        JS_PROP_INT32_DEF("FLOAT", GL_FLOAT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNSIGNED_BYTE", GL_UNSIGNED_BYTE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNSIGNED_SHORT", GL_UNSIGNED_SHORT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNSIGNED_INT", GL_UNSIGNED_INT, JS_PROP_CONFIGURABLE),

        JS_PROP_INT32_DEF("TEXTURE_2D", GL_TEXTURE_2D, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TEXTURE0", GL_TEXTURE0, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TEXTURE_CUBE_MAP", GL_TEXTURE_CUBE_MAP, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TEXTURE_CUBE_MAP_POSITIVE_X", GL_TEXTURE_CUBE_MAP_POSITIVE_X, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TEXTURE_2D_ARRAY", GL_TEXTURE_2D_ARRAY, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TEXTURE_3D", GL_TEXTURE_3D, JS_PROP_CONFIGURABLE),

        JS_PROP_INT32_DEF("RGBA", GL_RGBA, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB", GL_RGB, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGBA8", GL_RGBA8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB8", GL_RGB8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_COMPONENT16", GL_DEPTH_COMPONENT16, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_COMPONENT24", GL_DEPTH_COMPONENT24, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_COMPONENT32F", GL_DEPTH_COMPONENT32F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH24_STENCIL8", GL_DEPTH24_STENCIL8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH32F_STENCIL8", GL_DEPTH32F_STENCIL8, JS_PROP_CONFIGURABLE),

        JS_PROP_INT32_DEF("FRAMEBUFFER", GL_FRAMEBUFFER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RENDERBUFFER", GL_RENDERBUFFER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("COLOR_ATTACHMENT0", GL_COLOR_ATTACHMENT0, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_ATTACHMENT", GL_DEPTH_ATTACHMENT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("STENCIL_ATTACHMENT", GL_STENCIL_ATTACHMENT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_STENCIL_ATTACHMENT", GL_DEPTH_STENCIL_ATTACHMENT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("FRAMEBUFFER_COMPLETE", GL_FRAMEBUFFER_COMPLETE, JS_PROP_CONFIGURABLE),

        JS_PROP_INT32_DEF("TEXTURE_MIN_FILTER", GL_TEXTURE_MIN_FILTER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TEXTURE_MAG_FILTER", GL_TEXTURE_MAG_FILTER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("NEAREST", GL_NEAREST, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("LINEAR", GL_LINEAR, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("NEAREST_MIPMAP_NEAREST", GL_NEAREST_MIPMAP_NEAREST, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("LINEAR_MIPMAP_NEAREST", GL_LINEAR_MIPMAP_NEAREST, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("NEAREST_MIPMAP_LINEAR", GL_NEAREST_MIPMAP_LINEAR, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("LINEAR_MIPMAP_LINEAR", GL_LINEAR_MIPMAP_LINEAR, JS_PROP_CONFIGURABLE),

        // texture wrap
        JS_PROP_INT32_DEF("TEXTURE_WRAP_S", GL_TEXTURE_WRAP_S, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TEXTURE_WRAP_T", GL_TEXTURE_WRAP_T, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TEXTURE_WRAP_R", GL_TEXTURE_WRAP_R, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("REPEAT", GL_REPEAT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("CLAMP_TO_EDGE", GL_CLAMP_TO_EDGE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MIRRORED_REPEAT", GL_MIRRORED_REPEAT, JS_PROP_CONFIGURABLE),

        // texture format
        JS_PROP_INT32_DEF("RED", GL_RED, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RG", GL_RG, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB", GL_RGB, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGBA", GL_RGBA, JS_PROP_CONFIGURABLE),

        // texture type
        JS_PROP_INT32_DEF("UNSIGNED_BYTE", GL_UNSIGNED_BYTE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNSIGNED_SHORT_5_6_5", GL_UNSIGNED_SHORT_5_6_5, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNSIGNED_SHORT_4_4_4_4", GL_UNSIGNED_SHORT_4_4_4_4, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNSIGNED_SHORT_5_5_5_1", GL_UNSIGNED_SHORT_5_5_5_1, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNSIGNED_SHORT", GL_UNSIGNED_SHORT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("FLOAT", GL_FLOAT, JS_PROP_CONFIGURABLE),

        // texture internal format
        JS_PROP_INT32_DEF("DEPTH_COMPONENT", GL_DEPTH_COMPONENT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_STENCIL", GL_DEPTH_STENCIL, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_COMPONENT16", GL_DEPTH_COMPONENT16, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_COMPONENT24", GL_DEPTH_COMPONENT24, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH_COMPONENT32F", GL_DEPTH_COMPONENT32F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH24_STENCIL8", GL_DEPTH24_STENCIL8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DEPTH32F_STENCIL8", GL_DEPTH32F_STENCIL8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("R8", GL_R8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("R8_SNORM", GL_R8_SNORM, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RG8", GL_RG8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RG8_SNORM", GL_RG8_SNORM, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB8", GL_RGB8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB8_SNORM", GL_RGB8_SNORM, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGBA8", GL_RGBA8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGBA8_SNORM", GL_RGBA8_SNORM, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB10_A2", GL_RGB10_A2, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB10_A2UI", GL_RGB10_A2UI, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("SRGB8", GL_SRGB8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("SRGB8_ALPHA8", GL_SRGB8_ALPHA8, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("R16F", GL_R16F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RG16F", GL_RG16F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB16F", GL_RGB16F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGBA16F", GL_RGBA16F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("R32F", GL_R32F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RG32F", GL_RG32F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB32F", GL_RGB32F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGBA32F", GL_RGBA32F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("R11F_G11F_B10F", GL_R11F_G11F_B10F, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("RGB9_E5", GL_RGB9_E5, JS_PROP_CONFIGURABLE),

        // blend equations
        JS_PROP_INT32_DEF("FUNC_ADD", GL_FUNC_ADD, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("FUNC_SUBTRACT", GL_FUNC_SUBTRACT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("FUNC_REVERSE_SUBTRACT", GL_FUNC_REVERSE_SUBTRACT, JS_PROP_CONFIGURABLE),

        // blend factors
        JS_PROP_INT32_DEF("ZERO", GL_ZERO, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("ONE", GL_ONE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("SRC_COLOR", GL_SRC_COLOR, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("ONE_MINUS_SRC_COLOR", GL_ONE_MINUS_SRC_COLOR, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DST_COLOR", GL_DST_COLOR, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("ONE_MINUS_DST_COLOR", GL_ONE_MINUS_DST_COLOR, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("SRC_ALPHA", GL_SRC_ALPHA, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("ONE_MINUS_SRC_ALPHA", GL_ONE_MINUS_SRC_ALPHA, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("DST_ALPHA", GL_DST_ALPHA, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("ONE_MINUS_DST_ALPHA", GL_ONE_MINUS_DST_ALPHA, JS_PROP_CONFIGURABLE),

        // depth functions
        JS_PROP_INT32_DEF("NEVER", GL_NEVER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("LESS", GL_LESS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("EQUAL", GL_EQUAL, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("LEQUAL", GL_LEQUAL, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("GREATER", GL_GREATER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("NOTEQUAL", GL_NOTEQUAL, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("GEQUAL", GL_GEQUAL, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("ALWAYS", GL_ALWAYS, JS_PROP_CONFIGURABLE),

        // primitive type
        JS_PROP_INT32_DEF("POINTS", GL_POINTS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("LINES", GL_LINES, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("LINE_LOOP", GL_LINE_LOOP, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("LINE_STRIP", GL_LINE_STRIP, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TRIANGLES", GL_TRIANGLES, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TRIANGLE_STRIP", GL_TRIANGLE_STRIP, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("TRIANGLE_FAN", GL_TRIANGLE_FAN, JS_PROP_CONFIGURABLE),

        // cull face
        JS_PROP_INT32_DEF("FRONT", GL_FRONT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("BACK", GL_BACK, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("FRONT_AND_BACK", GL_FRONT_AND_BACK, JS_PROP_CONFIGURABLE),

        // triangle winding
        JS_PROP_INT32_DEF("CW", GL_CW, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("CCW", GL_CCW, JS_PROP_CONFIGURABLE),

        // parameters
        JS_PROP_INT32_DEF("DEPTH_TEST", GL_DEPTH_TEST, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("BLEND", GL_BLEND, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("CULL_FACE", GL_CULL_FACE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("SCISSOR_TEST", GL_SCISSOR_TEST, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("STENCIL_TEST", GL_STENCIL_TEST, JS_PROP_CONFIGURABLE),

        // limits
        JS_PROP_INT32_DEF("MAX_TEXTURE_SIZE", GL_MAX_TEXTURE_SIZE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_RENDERBUFFER_SIZE", GL_MAX_RENDERBUFFER_SIZE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_TEXTURE_IMAGE_UNITS", GL_MAX_TEXTURE_IMAGE_UNITS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_CUBE_MAP_TEXTURE_SIZE", GL_MAX_CUBE_MAP_TEXTURE_SIZE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_VERTEX_UNIFORM_BLOCKS", GL_MAX_VERTEX_UNIFORM_BLOCKS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_VERTEX_TEXTURE_IMAGE_UNITS", GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_FRAGMENT_UNIFORM_BLOCKS", GL_MAX_FRAGMENT_UNIFORM_BLOCKS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_UNIFORM_BUFFER_BINDINGS", GL_MAX_UNIFORM_BUFFER_BINDINGS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_UNIFORM_BLOCK_SIZE", GL_MAX_UNIFORM_BLOCK_SIZE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_COMBINED_UNIFORM_BLOCKS", GL_MAX_COMBINED_UNIFORM_BLOCKS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_VERTEX_UNIFORM_COMPONENTS", GL_MAX_VERTEX_UNIFORM_COMPONENTS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_FRAGMENT_UNIFORM_COMPONENTS", GL_MAX_FRAGMENT_UNIFORM_COMPONENTS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("MAX_VARYING_COMPONENTS", GL_MAX_VARYING_COMPONENTS, JS_PROP_CONFIGURABLE),

        // uniform block
        JS_PROP_INT32_DEF("UNIFORM_BUFFER_OFFSET_ALIGNMENT", GL_UNIFORM_BUFFER_OFFSET_ALIGNMENT, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_BLOCK_DATA_SIZE", GL_UNIFORM_BLOCK_DATA_SIZE, JS_PROP_CONFIGURABLE),

        // getActiveUniforms pname
        JS_PROP_INT32_DEF("UNIFORM_TYPE", GL_UNIFORM_TYPE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_SIZE", GL_UNIFORM_SIZE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_BLOCK_INDEX", GL_UNIFORM_BLOCK_INDEX, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_OFFSET", GL_UNIFORM_OFFSET, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_ARRAY_STRIDE", GL_UNIFORM_ARRAY_STRIDE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_MATRIX_STRIDE", GL_UNIFORM_MATRIX_STRIDE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_IS_ROW_MAJOR", GL_UNIFORM_IS_ROW_MAJOR, JS_PROP_CONFIGURABLE),

        // getActiveUniformBlock pname
        JS_PROP_INT32_DEF("UNIFORM_BLOCK_BINDING", GL_UNIFORM_BLOCK_BINDING, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_BLOCK_DATA_SIZE", GL_UNIFORM_BLOCK_DATA_SIZE, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_BLOCK_ACTIVE_UNIFORMS", GL_UNIFORM_BLOCK_ACTIVE_UNIFORMS, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES", GL_UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES,
                          JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER", GL_UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER,
                          JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER", GL_UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER,
                          JS_PROP_CONFIGURABLE),

        JS_PROP_INT32_DEF("RENDERER", GL_RENDERER, JS_PROP_CONFIGURABLE),
        JS_PROP_INT32_DEF("VENDOR", GL_VENDOR, JS_PROP_CONFIGURABLE),
    };

    static JSCFunctionListEntry gl_funcs[] = {
        JS_OBJECT_DEF("gl", gl_proto_funcs, countof(gl_proto_funcs), JS_PROP_CONFIGURABLE),
    };

    JS_SetPropertyFunctionList(ctx, global, gl_funcs, countof(gl_funcs));
    JS_FreeValue(ctx, global);
}

void script_webgl2_cleanup(void) {
    // delete all webgl2 objects
}