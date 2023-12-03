#include "webgl2.h"

#if defined(RENDER_BACKEND_GLES)
#include <GLES3/gl3.h>

#include <stdlib.h>

static void gl_check_error(const char *msg)
{
    GLenum err = glGetError();
    if (err != GL_NO_ERROR) {
        fprintf(stderr, "gl error: %d, %s\n", err, msg);
    }
}

static JSValue js_gl_get_extension(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_NewObject(ctx);
}

static JSValue js_gl_get_parameter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    u32 pname;
    JS_ToUint32(ctx, &pname, argv[0]);
    GLint param;
    glGetIntegerv(pname, &param);
    gl_check_error("glGetIntegerv");
    return JS_NewInt32(ctx, param);
}

static JSValue js_gl_clear(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    return JS_UNDEFINED;
}

static JSValue js_gl_viewport(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    u32 x, y, width, height;
    JS_ToUint32(ctx, &x, argv[0]);
    JS_ToUint32(ctx, &y, argv[1]);
    JS_ToUint32(ctx, &width, argv[2]);
    JS_ToUint32(ctx, &height, argv[3]);
    glViewport(x, y, width, height);
    return JS_UNDEFINED;
}

static JSValue js_gl_clear_color(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    f64 r, g, b, a;
    JS_ToFloat64(ctx, &r, argv[0]);
    JS_ToFloat64(ctx, &g, argv[1]);
    JS_ToFloat64(ctx, &b, argv[2]);
    JS_ToFloat64(ctx, &a, argv[3]);
    glClearColor(r, g, b, a);
    return JS_UNDEFINED;
}

static JSValue js_gl_clear_depth(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    f64 depth;
    JS_ToFloat64(ctx, &depth, argv[0]);
    glClearDepthf(depth);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint buffer;
    glGenBuffers(1, &buffer);
    gl_check_error("glGenBuffers");
    return JS_NewInt32(ctx, buffer);
}

static JSValue js_gl_bind_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, buffer;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &buffer, argv[1]);
    glBindBuffer(target, buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_buffer_data(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
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

static JSValue js_gl_buffer_sub_data(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
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

static JSValue js_gl_bind_buffer_range(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, index, buffer, offset, length;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &index, argv[1]);
    JS_ToUint32(ctx, &buffer, argv[2]);
    JS_ToUint32(ctx, &offset, argv[3]);
    JS_ToUint32(ctx, &length, argv[4]);
    glBindBufferRange(target, index, buffer, offset, length);
    return JS_UNDEFINED;
}

static JSValue js_gl_delete_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint buffer;
    JS_ToUint32(ctx, &buffer, argv[0]);
    glDeleteBuffers(1, &buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_shader(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
    shader = glCreateShader(shader);
    return JS_NewInt32(ctx, shader);
}

static JSValue js_gl_shader_source(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
    JSValue source = argv[1];
    if (JS_IsString(source)) {
        const char *str = JS_ToCString(ctx, source);
        glShaderSource(shader, 1, &str, NULL);
        JS_FreeCString(ctx, str);
        gl_check_error("glShaderSource");
    } else {
        JSValue buffer = JS_GetPropertyStr(ctx, source, "buffer");
        size_t length;
        u8* str = JS_GetArrayBuffer(ctx, &length, buffer);
        glShaderSource(shader, 1, (const char * const*)&str, NULL);
    }
    return JS_UNDEFINED;
}

static JSValue js_gl_compile_shader(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
    glCompileShader(shader);
    gl_check_error("glCompileShader");
    return JS_UNDEFINED;
}

static JSValue js_gl_get_shader_parameter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint shader, pname;
    JS_ToUint32(ctx, &shader, argv[0]);
    JS_ToUint32(ctx, &pname, argv[1]);
    GLint param;
    glGetShaderiv(shader, pname, &param);
    return JS_NewInt32(ctx, param);
}

static JSValue js_gl_get_shader_info_log(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
    GLint length = 0;
    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &length);
    char *info_log = (char*)malloc(length);
    glGetShaderInfoLog(shader, length, NULL, info_log);
    JSValue ret = JS_NewString(ctx, info_log);
    free(info_log);
    return ret;
}

static JSValue js_gl_create_program(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    program = glCreateProgram();
    return JS_NewInt32(ctx, program);
}

static JSValue js_gl_attach_shader(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program, shader;
    JS_ToUint32(ctx, &program, argv[0]);
    JS_ToUint32(ctx, &shader, argv[1]);
    glAttachShader(program, shader);
    return JS_UNDEFINED;
}

static JSValue js_gl_link_program(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    glLinkProgram(program);

    GLuint err = glGetError();
    if (err != GL_NO_ERROR) {
        fprintf(stderr, "glLinkProgram error: %d\n", err);
    }

    return JS_UNDEFINED;
}

static JSValue js_gl_delete_program(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    glDeleteProgram(program);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_uniform_block_index(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
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

static JSValue js_gl_get_active_uniform_block_parameter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program, uniformBlockIndex, pname;
    JS_ToUint32(ctx, &program, argv[0]);
    JS_ToUint32(ctx, &uniformBlockIndex, argv[1]);
    JS_ToUint32(ctx, &pname, argv[2]);
    GLint param;
    glGetActiveUniformBlockiv(program, uniformBlockIndex, pname, &param);
    return JS_NewInt32(ctx, param);
}

static JSValue js_gl_get_uniform_indices(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    JSValue uniformNames = argv[1];
    JS_ToUint32(ctx, &program, argv[0]);
    GLuint uniformCount;
    JS_ToUint32(ctx, &uniformCount, JS_GetPropertyStr(ctx, uniformNames, "length"));
    const char **uniformNamesArray = (const char**)malloc(sizeof(const char*) * uniformCount);
    for (int i = 0; i < uniformCount; i++) {
        JSValue name = JS_GetPropertyUint32(ctx, uniformNames, i);
        uniformNamesArray[i] = JS_ToCString(ctx, name);
    }
    GLuint *uniformIndices = (GLuint*)malloc(sizeof(GLuint) * uniformCount);
    glGetUniformIndices(program, uniformCount, uniformNamesArray, uniformIndices);
    JSValue ret = JS_NewArray(ctx);
    for (int i = 0; i < uniformCount; i++) {
        JS_SetPropertyUint32(ctx, ret, i, JS_NewInt32(ctx, uniformIndices[i]));
    }
    free(uniformIndices);
    return ret;
}

static JSValue js_gl_get_active_uniforms(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    JSValue uniformIndices = argv[1];
    JS_ToUint32(ctx, &program, argv[0]);
    GLuint uniformCount;
    JS_ToUint32(ctx, &uniformCount, JS_GetPropertyStr(ctx, uniformIndices, "length"));
    GLuint *uniformIndicesArray = (GLuint*)malloc(sizeof(GLuint) * uniformCount);
    for (int i = 0; i < uniformCount; i++) {
        JSValue index = JS_GetPropertyUint32(ctx, uniformIndices, i);
        JS_ToUint32(ctx, &uniformIndicesArray[i], index);
    }
    GLuint pname;
    JS_ToUint32(ctx, &pname, argv[2]);
    GLint *params = (GLint*)malloc(sizeof(GLint) * uniformCount);
    glGetActiveUniformsiv(program, uniformCount, uniformIndicesArray, pname, params);
    JSValue ret = JS_NewArray(ctx);
    for (int i = 0; i < uniformCount; i++) {
        JS_SetPropertyUint32(ctx, ret, i, JS_NewInt32(ctx, params[i]));
    }
    free(uniformIndicesArray);
    free(params);
    return ret;
}

static JSValue js_gl_uniform1f(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    f64 v0;
    JS_ToUint32(ctx, &location, argv[0]);
    JS_ToFloat64(ctx, &v0, argv[1]);
    glUniform1f(location, v0);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform1fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[2], "buffer"));
    glUniform1fv(location, length >> 2, (GLfloat*)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform2fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[2], "buffer"));
    glUniform2fv(location, (length >> 3), (GLfloat*)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform3fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[2], "buffer"));
    glUniform3fv(location, (length >> 2) / 3, (GLfloat*)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform4fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[2], "buffer"));
    glUniform4fv(location, length >> 4, (GLfloat*)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform_1i(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    GLint v0;
    JS_ToUint32(ctx, &location, argv[0]);
    JS_ToInt32(ctx, &v0, argv[1]);
    glUniform1i(location, v0);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform_1u(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    GLuint v0;
    JS_ToUint32(ctx, &location, argv[0]);
    JS_ToUint32(ctx, &v0, argv[1]);
    glUniform1ui(location, v0);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform_matrix_4fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[2], "buffer"));
    glUniformMatrix4fv(location, length >> 6, JS_ToBool(ctx, argv[1]), (const GLfloat*)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_uniform_matrix_3fv(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint location;
    size_t length;
    JS_ToUint32(ctx, &location, argv[0]);
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, JS_GetPropertyStr(ctx, argv[2], "buffer"));
    glUniformMatrix3fv(location, (length >> 2) / 9, JS_ToBool(ctx, argv[1]), (const GLfloat*)data_buffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_program_parameter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program, pname;
    JS_ToUint32(ctx, &program, argv[0]);
    JS_ToUint32(ctx, &pname, argv[1]);
    GLint param;
    glGetProgramiv(program, pname, &param);
    return JS_NewInt32(ctx, param);
}

static JSValue js_gl_get_program_info_log(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    GLint length;
    glGetProgramiv(program, GL_INFO_LOG_LENGTH, &length);
    char *info_log = (char*)malloc(length);
    glGetProgramInfoLog(program, length, NULL, info_log);
    JSValue ret = JS_NewString(ctx, info_log);
    free(info_log);
    return ret;
}

static JSValue js_gl_use_program(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    glUseProgram(program);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_unifom_location(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    const char *name = JS_ToCString(ctx, argv[1]);
    GLint location = glGetUniformLocation(program, name);
    JS_FreeCString(ctx, name);
    return JS_NewInt32(ctx, location);
}

static JSValue js_gl_uniform_block_binding(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program, uniformBlockIndex, uniformBlockBinding;
    JS_ToUint32(ctx, &program, argv[0]);
    JS_ToUint32(ctx, &uniformBlockIndex, argv[1]);
    JS_ToUint32(ctx, &uniformBlockBinding, argv[2]);
    glUniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding);
    return JS_UNDEFINED;
}

static JSValue js_gl_get_attrib_location(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint program;
    JS_ToUint32(ctx, &program, argv[0]);
    const char *name = JS_ToCString(ctx, argv[1]);
    GLint location = glGetAttribLocation(program, name);
    JS_FreeCString(ctx, name);
    return JS_NewInt32(ctx, location);
}

static JSValue js_gl_vertex_attrib_pointer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint index, size, type, normalized, stride;
    JS_ToUint32(ctx, &index, argv[0]);
    JS_ToUint32(ctx, &size, argv[1]);
    JS_ToUint32(ctx, &type, argv[2]);
    JS_ToUint32(ctx, &normalized, argv[3]);
    JS_ToUint32(ctx, &stride, argv[4]);
    glVertexAttribPointer(index, size, type, normalized, stride, NULL);
    return JS_UNDEFINED;
}

static JSValue js_gl_vertex_attribi_pointer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint index, size, type, stride;
    JS_ToUint32(ctx, &index, argv[0]);
    JS_ToUint32(ctx, &size, argv[1]);
    JS_ToUint32(ctx, &type, argv[2]);
    JS_ToUint32(ctx, &stride, argv[3]);
    glVertexAttribIPointer(index, size, type, stride, NULL);
    return JS_UNDEFINED;
}

static JSValue js_gl_enable_vertex_attrib_array(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint index;
    JS_ToUint32(ctx, &index, argv[0]);
    glEnableVertexAttribArray(index);
    return JS_UNDEFINED;
}

static JSValue js_gl_draw_arrays(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint mode, first, count;
    JS_ToUint32(ctx, &mode, argv[0]);
    JS_ToUint32(ctx, &first, argv[1]);
    JS_ToUint32(ctx, &count, argv[2]);
    glDrawArrays(mode, first, count);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint texture;
    glGenTextures(1, &texture);
    return JS_NewInt32(ctx, texture);
}

static JSValue js_gl_bind_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, texture;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &texture, argv[1]);
    glBindTexture(target, texture);
    return JS_UNDEFINED;
}

static JSValue js_gl_tex_image2d(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
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

static JSValue js_gl_tex_parameteri(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, pname, param;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &pname, argv[1]);
    JS_ToUint32(ctx, &param, argv[2]);
    glTexParameteri(target, pname, param);
    return JS_UNDEFINED;
}

static JSValue js_gl_delete_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint texture;
    JS_ToUint32(ctx, &texture, argv[0]);
    glDeleteTextures(1, &texture);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_framebuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint framebuffer;
    glGenFramebuffers(1, &framebuffer);
    return JS_NewInt32(ctx, framebuffer);
}

static JSValue js_gl_bind_framebuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, framebuffer;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &framebuffer, argv[1]);
    glBindFramebuffer(target, framebuffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_framebuffer_texture2d(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, attachment, textarget, texture, level;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &attachment, argv[1]);
    JS_ToUint32(ctx, &textarget, argv[2]);
    JS_ToUint32(ctx, &texture, argv[3]);
    JS_ToUint32(ctx, &level, argv[4]);
    glFramebufferTexture2D(target, attachment, textarget, texture, level);
    return JS_UNDEFINED;
}

static JSValue js_gl_check_framebuffer_status(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target;
    JS_ToUint32(ctx, &target, argv[0]);
    GLenum status = glCheckFramebufferStatus(target);
    return JS_NewInt32(ctx, status);
}

static JSValue js_gl_delete_framebuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint framebuffer;
    JS_ToUint32(ctx, &framebuffer, argv[0]);
    glDeleteFramebuffers(1, &framebuffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_renderbuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint renderbuffer;
    glGenRenderbuffers(1, &renderbuffer);
    return JS_NewInt32(ctx, renderbuffer);
}

static JSValue js_gl_bind_renderbuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, renderbuffer;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &renderbuffer, argv[1]);
    glBindRenderbuffer(target, renderbuffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_renderbuffer_storage(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, internalformat, width, height;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &internalformat, argv[1]);
    JS_ToUint32(ctx, &width, argv[2]);
    JS_ToUint32(ctx, &height, argv[3]);
    glRenderbufferStorage(target, internalformat, width, height);
    return JS_UNDEFINED;
}

static JSValue js_gl_framebuffer_renderbuffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint target, attachment, renderbuffertarget, renderbuffer;
    JS_ToUint32(ctx, &target, argv[0]);
    JS_ToUint32(ctx, &attachment, argv[1]);
    JS_ToUint32(ctx, &renderbuffertarget, argv[2]);
    JS_ToUint32(ctx, &renderbuffer, argv[3]);
    glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer);
    return JS_UNDEFINED;
}

static JSValue js_gl_create_vertex_array(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint vertex_array;
    glGenVertexArrays(1, &vertex_array);
    return JS_NewInt32(ctx, vertex_array);
}

static JSValue js_gl_bind_vertex_array(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint array;
    JS_ToUint32(ctx, &array, argv[0]);
    glBindVertexArray(array);
    return JS_UNDEFINED;
}

static JSValue js_gl_enable(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint cap;
    JS_ToUint32(ctx, &cap, argv[0]);
    glEnable(cap);
    return JS_UNDEFINED;
}

static JSValue js_gl_disable(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint cap;
    JS_ToUint32(ctx, &cap, argv[0]);
    glDisable(cap);
    return JS_UNDEFINED;
}

static JSValue js_gl_blend_func(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint sfactor, dfactor;
    JS_ToUint32(ctx, &sfactor, argv[0]);
    JS_ToUint32(ctx, &dfactor, argv[1]);
    glBlendFunc(sfactor, dfactor);
    return JS_UNDEFINED;
}

static JSValue js_gl_blend_equation(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint mode;
    JS_ToUint32(ctx, &mode, argv[0]);
    glBlendEquation(mode);
    return JS_UNDEFINED;
}

static JSValue js_gl_blend_func_separate(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint srcRGB, dstRGB, srcAlpha, dstAlpha;
    JS_ToUint32(ctx, &srcRGB, argv[0]);
    JS_ToUint32(ctx, &dstRGB, argv[1]);
    JS_ToUint32(ctx, &srcAlpha, argv[2]);
    JS_ToUint32(ctx, &dstAlpha, argv[3]);
    glBlendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
    return JS_UNDEFINED;
}

static JSValue js_gl_blend_equation_separate(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint modeRGB, modeAlpha;
    JS_ToUint32(ctx, &modeRGB, argv[0]);
    JS_ToUint32(ctx, &modeAlpha, argv[1]);
    glBlendEquationSeparate(modeRGB, modeAlpha);
    return JS_UNDEFINED;
}

static JSValue js_gl_depth_func(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint func;
    JS_ToUint32(ctx, &func, argv[0]);
    glDepthFunc(func);
    return JS_UNDEFINED;
}

static JSValue js_gl_depth_mask(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint flag;
    JS_ToUint32(ctx, &flag, argv[0]);
    glDepthMask(flag);
    return JS_UNDEFINED;
}

static JSValue js_gl_cull_face(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint mode;
    JS_ToUint32(ctx, &mode, argv[0]);
    glCullFace(mode);
    return JS_UNDEFINED;
}

static JSValue js_gl_front_face(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint mode;
    JS_ToUint32(ctx, &mode, argv[0]);
    glFrontFace(mode);
    return JS_UNDEFINED;
}

static JSValue js_gl_polygon_offset(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint factor, units;
    JS_ToUint32(ctx, &factor, argv[0]);
    JS_ToUint32(ctx, &units, argv[1]);
    glPolygonOffset(factor, units);
    return JS_UNDEFINED;
}

static JSValue js_gl_draw_elements(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint mode, count, type;
    JS_ToUint32(ctx, &mode, argv[0]);
    JS_ToUint32(ctx, &count, argv[1]);
    JS_ToUint32(ctx, &type, argv[2]);
    glDrawElements(mode, count, type, NULL);
    return JS_UNDEFINED;
}

void script_module_webgl2_register(script_context_t context)
{
    JSContext *ctx = context.context;
    JSValue global_obj = JS_GetGlobalObject(ctx);
    JSValue gl = JS_NewObject(ctx);

    JS_SetPropertyStr(ctx, global_obj, "gl", gl);

    JS_SetPropertyStr(ctx, gl, "getExtension", JS_NewCFunction(ctx, js_gl_get_extension, "getExtension", 1));
    JS_SetPropertyStr(ctx, gl, "getParameter", JS_NewCFunction(ctx, js_gl_get_parameter, "getParameter", 1));

    JS_SetPropertyStr(ctx, gl, "clear", JS_NewCFunction(ctx, js_gl_clear, "clear", 0));
    JS_SetPropertyStr(ctx, gl, "viewport", JS_NewCFunction(ctx, js_gl_viewport, "viewport", 4));
    JS_SetPropertyStr(ctx, gl, "clearColor", JS_NewCFunction(ctx, js_gl_clear_color, "clearColor", 4));
    JS_SetPropertyStr(ctx, gl, "clearDepth", JS_NewCFunction(ctx, js_gl_clear_depth, "clearDepth", 1));
    JS_SetPropertyStr(ctx, gl, "createBuffer", JS_NewCFunction(ctx, js_gl_create_buffer, "createBuffer", 0));
    JS_SetPropertyStr(ctx, gl, "bindBuffer", JS_NewCFunction(ctx, js_gl_bind_buffer, "bindBuffer", 2));
    JS_SetPropertyStr(ctx, gl, "bindBufferRange", JS_NewCFunction(ctx, js_gl_bind_buffer_range, "bindBufferRange", 5));
    JS_SetPropertyStr(ctx, gl, "bufferData", JS_NewCFunction(ctx, js_gl_buffer_data, "bufferData", 3));
    JS_SetPropertyStr(ctx, gl, "bufferSubData", JS_NewCFunction(ctx, js_gl_buffer_sub_data, "bufferSubData", 5));
    JS_SetPropertyStr(ctx, gl, "deleteBuffer", JS_NewCFunction(ctx, js_gl_delete_buffer, "deleteBuffer", 1));

    JS_SetPropertyStr(ctx, gl, "createShader", JS_NewCFunction(ctx, js_gl_create_shader, "createShader", 1));
    JS_SetPropertyStr(ctx, gl, "shaderSource", JS_NewCFunction(ctx, js_gl_shader_source, "shaderSource", 2));
    JS_SetPropertyStr(ctx, gl, "compileShader", JS_NewCFunction(ctx, js_gl_compile_shader, "compileShader", 1));
    JS_SetPropertyStr(ctx, gl, "getShaderParameter", JS_NewCFunction(ctx, js_gl_get_shader_parameter, "getShaderParameter", 2));
    JS_SetPropertyStr(ctx, gl, "getShaderInfoLog", JS_NewCFunction(ctx, js_gl_get_shader_info_log, "getShaderInfoLog", 1));
    JS_SetPropertyStr(ctx, gl, "createProgram", JS_NewCFunction(ctx, js_gl_create_program, "createProgram", 0));
    JS_SetPropertyStr(ctx, gl, "attachShader", JS_NewCFunction(ctx, js_gl_attach_shader, "attachShader", 2));
    JS_SetPropertyStr(ctx, gl, "linkProgram", JS_NewCFunction(ctx, js_gl_link_program, "linkProgram", 1));
    JS_SetPropertyStr(ctx, gl, "deleteProgram", JS_NewCFunction(ctx, js_gl_delete_program, "deleteProgram", 1));
    JS_SetPropertyStr(ctx, gl, "getProgramParameter", JS_NewCFunction(ctx, js_gl_get_program_parameter, "getProgramParameter", 2));
    JS_SetPropertyStr(ctx, gl, "getProgramInfoLog", JS_NewCFunction(ctx, js_gl_get_program_info_log, "getProgramInfoLog", 1));
    JS_SetPropertyStr(ctx, gl, "useProgram", JS_NewCFunction(ctx, js_gl_use_program, "useProgram", 1));
    JS_SetPropertyStr(ctx, gl, "getUniformLocation", JS_NewCFunction(ctx, js_gl_get_unifom_location, "getUniformLocation", 2));
    JS_SetPropertyStr(ctx, gl, "getUniformBlockIndex", JS_NewCFunction(ctx, js_gl_get_uniform_block_index, "getUniformBlockIndex", 4));
    JS_SetPropertyStr(ctx, gl, "getActiveUniformBlockParameter", JS_NewCFunction(ctx, js_gl_get_active_uniform_block_parameter, "getActiveUniformBlockParameter", 3));
    JS_SetPropertyStr(ctx, gl, "getUniformIndices", JS_NewCFunction(ctx, js_gl_get_uniform_indices, "getUniformIndices", 3));
    JS_SetPropertyStr(ctx, gl, "getActiveUniforms", JS_NewCFunction(ctx, js_gl_get_active_uniforms, "getActiveUniforms", 4));

    JS_SetPropertyStr(ctx, gl, "getAttribLocation", JS_NewCFunction(ctx, js_gl_get_attrib_location, "getAttribLocation", 2));
    JS_SetPropertyStr(ctx, gl, "vertexAttribPointer", JS_NewCFunction(ctx, js_gl_vertex_attrib_pointer, "vertexAttribPointer", 6));
    JS_SetPropertyStr(ctx, gl, "enableVertexAttribArray", JS_NewCFunction(ctx, js_gl_enable_vertex_attrib_array, "enableVertexAttribArray", 1));
    JS_SetPropertyStr(ctx, gl, "drawArrays", JS_NewCFunction(ctx, js_gl_draw_arrays, "drawArrays", 3));
    JS_SetPropertyStr(ctx, gl, "createTexture", JS_NewCFunction(ctx, js_gl_create_texture, "createTexture", 0));
    JS_SetPropertyStr(ctx, gl, "bindTexture", JS_NewCFunction(ctx, js_gl_bind_texture, "bindTexture", 2));
    JS_SetPropertyStr(ctx, gl, "texImage2D", JS_NewCFunction(ctx, js_gl_tex_image2d, "texImage2D", 9));
    JS_SetPropertyStr(ctx, gl, "texParameteri", JS_NewCFunction(ctx, js_gl_tex_parameteri, "texParameteri", 3));
    JS_SetPropertyStr(ctx, gl, "deleteTexture", JS_NewCFunction(ctx, js_gl_delete_texture, "deleteTexture", 1));

    JS_SetPropertyStr(ctx, gl, "createFramebuffer", JS_NewCFunction(ctx, js_gl_create_framebuffer, "createFramebuffer", 0));
    JS_SetPropertyStr(ctx, gl, "bindFramebuffer", JS_NewCFunction(ctx, js_gl_bind_framebuffer, "bindFramebuffer", 2));
    JS_SetPropertyStr(ctx, gl, "framebufferTexture2D", JS_NewCFunction(ctx, js_gl_framebuffer_texture2d, "framebufferTexture2D", 5));
    JS_SetPropertyStr(ctx, gl, "checkFramebufferStatus", JS_NewCFunction(ctx, js_gl_check_framebuffer_status, "checkFramebufferStatus", 1));
    JS_SetPropertyStr(ctx, gl, "deleteFramebuffer", JS_NewCFunction(ctx, js_gl_delete_framebuffer, "deleteFramebuffer", 1));

    JS_SetPropertyStr(ctx, gl, "createRenderbuffer", JS_NewCFunction(ctx, js_gl_create_renderbuffer, "createRenderbuffer", 0));
    JS_SetPropertyStr(ctx, gl, "bindRenderbuffer", JS_NewCFunction(ctx, js_gl_bind_renderbuffer, "bindRenderbuffer", 2));
    JS_SetPropertyStr(ctx, gl, "renderbufferStorage", JS_NewCFunction(ctx, js_gl_renderbuffer_storage, "renderbufferStorage", 4));
    JS_SetPropertyStr(ctx, gl, "framebufferRenderbuffer", JS_NewCFunction(ctx, js_gl_framebuffer_renderbuffer, "framebufferRenderbuffer", 4));
    JS_SetPropertyStr(ctx, gl, "createVertexArray", JS_NewCFunction(ctx, js_gl_create_vertex_array, "createVertexArray", 0));
    JS_SetPropertyStr(ctx, gl, "bindVertexArray", JS_NewCFunction(ctx, js_gl_bind_vertex_array, "bindVertexArray", 1));
    JS_SetPropertyStr(ctx, gl, "enable", JS_NewCFunction(ctx, js_gl_enable, "enable", 1));
    JS_SetPropertyStr(ctx, gl, "disable", JS_NewCFunction(ctx, js_gl_disable, "disable", 1));
    JS_SetPropertyStr(ctx, gl, "blendFunc", JS_NewCFunction(ctx, js_gl_blend_func, "blendFunc", 2));
    JS_SetPropertyStr(ctx, gl, "blendEquation", JS_NewCFunction(ctx, js_gl_blend_equation, "blendEquation", 1));
    JS_SetPropertyStr(ctx, gl, "blendFuncSeparate", JS_NewCFunction(ctx, js_gl_blend_func_separate, "blendFuncSeparate", 4));
    JS_SetPropertyStr(ctx, gl, "blendEquationSeparate", JS_NewCFunction(ctx, js_gl_blend_equation_separate, "blendEquationSeparate", 2));
    JS_SetPropertyStr(ctx, gl, "depthFunc", JS_NewCFunction(ctx, js_gl_depth_func, "depthFunc", 1));
    JS_SetPropertyStr(ctx, gl, "depthMask", JS_NewCFunction(ctx, js_gl_depth_mask, "depthMask", 1));
    JS_SetPropertyStr(ctx, gl, "cullFace", JS_NewCFunction(ctx, js_gl_cull_face, "cullFace", 1));
    JS_SetPropertyStr(ctx, gl, "frontFace", JS_NewCFunction(ctx, js_gl_front_face, "frontFace", 1));
    JS_SetPropertyStr(ctx, gl, "polygonOffset", JS_NewCFunction(ctx, js_gl_polygon_offset, "polygonOffset", 2));
    JS_SetPropertyStr(ctx, gl, "drawElements", JS_NewCFunction(ctx, js_gl_draw_elements, "drawElements", 4));

    JS_SetPropertyStr(ctx, gl, "uniform1f", JS_NewCFunction(ctx, js_gl_uniform1f, "uniform1f", 2));
    JS_SetPropertyStr(ctx, gl, "uniform1fv", JS_NewCFunction(ctx, js_gl_uniform1fv, "uniform1fv", 2));
    JS_SetPropertyStr(ctx, gl, "uniform2fv", JS_NewCFunction(ctx, js_gl_uniform2fv, "uniform2fv", 2));
    JS_SetPropertyStr(ctx, gl, "uniform3fv", JS_NewCFunction(ctx, js_gl_uniform3fv, "uniform3fv", 2));
    JS_SetPropertyStr(ctx, gl, "uniform4fv", JS_NewCFunction(ctx, js_gl_uniform4fv, "uniform4fv", 2));
    JS_SetPropertyStr(ctx, gl, "uniform1i", JS_NewCFunction(ctx, js_gl_uniform_1i, "uniform1i", 2));
    JS_SetPropertyStr(ctx, gl, "uniform1u", JS_NewCFunction(ctx, js_gl_uniform_1u, "uniform1u", 2));
    JS_SetPropertyStr(ctx, gl, "uniformMatrix4fv", JS_NewCFunction(ctx, js_gl_uniform_matrix_4fv, "uniformMatrix4fv", 3));
    JS_SetPropertyStr(ctx, gl, "uniformMatrix3fv", JS_NewCFunction(ctx, js_gl_uniform_matrix_3fv, "uniformMatrix3fv", 3));
    JS_SetPropertyStr(ctx, gl, "uniformBlockBinding", JS_NewCFunction(ctx, js_gl_uniform_block_binding, "uniformBlockBinding", 3));

    // export webgl2 constants
    JS_SetPropertyStr(ctx, gl, "VERTEX_SHADER", JS_NewInt32(ctx, GL_VERTEX_SHADER));
    JS_SetPropertyStr(ctx, gl, "FRAGMENT_SHADER", JS_NewInt32(ctx, GL_FRAGMENT_SHADER));

    JS_SetPropertyStr(ctx, gl, "UNIFORM_BUFFER", JS_NewInt32(ctx, GL_UNIFORM_BUFFER));
    JS_SetPropertyStr(ctx, gl, "ARRAY_BUFFER", JS_NewInt32(ctx, GL_ARRAY_BUFFER));
    JS_SetPropertyStr(ctx, gl, "ELEMENT_ARRAY_BUFFER", JS_NewInt32(ctx, GL_ELEMENT_ARRAY_BUFFER));
    JS_SetPropertyStr(ctx, gl, "STATIC_DRAW", JS_NewInt32(ctx, GL_STATIC_DRAW));
    JS_SetPropertyStr(ctx, gl, "DYNAMIC_DRAW", JS_NewInt32(ctx, GL_DYNAMIC_DRAW));
    JS_SetPropertyStr(ctx, gl, "STREAM_DRAW", JS_NewInt32(ctx, GL_STREAM_DRAW));

    JS_SetPropertyStr(ctx, gl, "FLOAT", JS_NewInt32(ctx, GL_FLOAT));
    JS_SetPropertyStr(ctx, gl, "UNSIGNED_BYTE", JS_NewInt32(ctx, GL_UNSIGNED_BYTE));
    JS_SetPropertyStr(ctx, gl, "UNSIGNED_SHORT", JS_NewInt32(ctx, GL_UNSIGNED_SHORT));
    JS_SetPropertyStr(ctx, gl, "UNSIGNED_INT", JS_NewInt32(ctx, GL_UNSIGNED_INT));

    JS_SetPropertyStr(ctx, gl, "TEXTURE_2D", JS_NewInt32(ctx, GL_TEXTURE_2D));
    JS_SetPropertyStr(ctx, gl, "TEXTURE_CUBE_MAP", JS_NewInt32(ctx, GL_TEXTURE_CUBE_MAP));
    JS_SetPropertyStr(ctx, gl, "TEXTURE_CUBE_MAP_POSITIVE_X", JS_NewInt32(ctx, GL_TEXTURE_CUBE_MAP_POSITIVE_X));
    JS_SetPropertyStr(ctx, gl, "TEXTURE_2D_ARRAY", JS_NewInt32(ctx, GL_TEXTURE_2D_ARRAY));
    JS_SetPropertyStr(ctx, gl, "TEXTURE_3D", JS_NewInt32(ctx, GL_TEXTURE_3D));

    JS_SetPropertyStr(ctx, gl, "RGBA", JS_NewInt32(ctx, GL_RGBA));
    JS_SetPropertyStr(ctx, gl, "RGB", JS_NewInt32(ctx, GL_RGB));
    JS_SetPropertyStr(ctx, gl, "RGBA8", JS_NewInt32(ctx, GL_RGBA8));
    JS_SetPropertyStr(ctx, gl, "RGB8", JS_NewInt32(ctx, GL_RGB8));
    JS_SetPropertyStr(ctx, gl, "DEPTH_COMPONENT16", JS_NewInt32(ctx, GL_DEPTH_COMPONENT16));
    JS_SetPropertyStr(ctx, gl, "DEPTH_COMPONENT24", JS_NewInt32(ctx, GL_DEPTH_COMPONENT24));
    JS_SetPropertyStr(ctx, gl, "DEPTH_COMPONENT32F", JS_NewInt32(ctx, GL_DEPTH_COMPONENT32F));
    JS_SetPropertyStr(ctx, gl, "DEPTH24_STENCIL8", JS_NewInt32(ctx, GL_DEPTH24_STENCIL8));
    JS_SetPropertyStr(ctx, gl, "DEPTH32F_STENCIL8", JS_NewInt32(ctx, GL_DEPTH32F_STENCIL8));
    
    JS_SetPropertyStr(ctx, gl, "FRAMEBUFFER", JS_NewInt32(ctx, GL_FRAMEBUFFER));
    JS_SetPropertyStr(ctx, gl, "RENDERBUFFER", JS_NewInt32(ctx, GL_RENDERBUFFER));
    JS_SetPropertyStr(ctx, gl, "COLOR_ATTACHMENT0", JS_NewInt32(ctx, GL_COLOR_ATTACHMENT0));
    JS_SetPropertyStr(ctx, gl, "DEPTH_ATTACHMENT", JS_NewInt32(ctx, GL_DEPTH_ATTACHMENT));
    JS_SetPropertyStr(ctx, gl, "STENCIL_ATTACHMENT", JS_NewInt32(ctx, GL_STENCIL_ATTACHMENT));
    JS_SetPropertyStr(ctx, gl, "DEPTH_STENCIL_ATTACHMENT", JS_NewInt32(ctx, GL_DEPTH_STENCIL_ATTACHMENT));
    JS_SetPropertyStr(ctx, gl, "FRAMEBUFFER_COMPLETE", JS_NewInt32(ctx, GL_FRAMEBUFFER_COMPLETE));

    JS_SetPropertyStr(ctx, gl, "TEXTURE_MIN_FILTER", JS_NewInt32(ctx, GL_TEXTURE_MIN_FILTER));
    JS_SetPropertyStr(ctx, gl, "TEXTURE_MAG_FILTER", JS_NewInt32(ctx, GL_TEXTURE_MAG_FILTER));
    JS_SetPropertyStr(ctx, gl, "NEAREST", JS_NewInt32(ctx, GL_NEAREST));
    JS_SetPropertyStr(ctx, gl, "LINEAR", JS_NewInt32(ctx, GL_LINEAR));
    JS_SetPropertyStr(ctx, gl, "NEAREST_MIPMAP_NEAREST", JS_NewInt32(ctx, GL_NEAREST_MIPMAP_NEAREST));
    JS_SetPropertyStr(ctx, gl, "LINEAR_MIPMAP_NEAREST", JS_NewInt32(ctx, GL_LINEAR_MIPMAP_NEAREST));
    JS_SetPropertyStr(ctx, gl, "NEAREST_MIPMAP_LINEAR", JS_NewInt32(ctx, GL_NEAREST_MIPMAP_LINEAR));
    JS_SetPropertyStr(ctx, gl, "LINEAR_MIPMAP_LINEAR", JS_NewInt32(ctx, GL_LINEAR_MIPMAP_LINEAR));

    // texture wrap
    JS_SetPropertyStr(ctx, gl, "TEXTURE_WRAP_S", JS_NewInt32(ctx, GL_TEXTURE_WRAP_S));
    JS_SetPropertyStr(ctx, gl, "TEXTURE_WRAP_T", JS_NewInt32(ctx, GL_TEXTURE_WRAP_T));  
    JS_SetPropertyStr(ctx, gl, "TEXTURE_WRAP_R", JS_NewInt32(ctx, GL_TEXTURE_WRAP_R));

    JS_SetPropertyStr(ctx, gl, "REPEAT", JS_NewInt32(ctx, GL_REPEAT));
    JS_SetPropertyStr(ctx, gl, "CLAMP_TO_EDGE", JS_NewInt32(ctx, GL_CLAMP_TO_EDGE));
    JS_SetPropertyStr(ctx, gl, "MIRRORED_REPEAT", JS_NewInt32(ctx, GL_MIRRORED_REPEAT));

    JS_SetPropertyStr(ctx, gl, "DEPTH_TEST", JS_NewInt32(ctx, GL_DEPTH_TEST));
    JS_SetPropertyStr(ctx, gl, "BLEND", JS_NewInt32(ctx, GL_BLEND));
    JS_SetPropertyStr(ctx, gl, "CULL_FACE", JS_NewInt32(ctx, GL_CULL_FACE));
    JS_SetPropertyStr(ctx, gl, "FRONT", JS_NewInt32(ctx, GL_FRONT));
    JS_SetPropertyStr(ctx, gl, "BACK", JS_NewInt32(ctx, GL_BACK));
    JS_SetPropertyStr(ctx, gl, "FRONT_AND_BACK", JS_NewInt32(ctx, GL_FRONT_AND_BACK));

    // blend equations
    JS_SetPropertyStr(ctx, gl, "FUNC_ADD", JS_NewInt32(ctx, GL_FUNC_ADD));
    JS_SetPropertyStr(ctx, gl, "FUNC_SUBTRACT", JS_NewInt32(ctx, GL_FUNC_SUBTRACT));
    JS_SetPropertyStr(ctx, gl, "FUNC_REVERSE_SUBTRACT", JS_NewInt32(ctx, GL_FUNC_REVERSE_SUBTRACT));

    // blend factors
    JS_SetPropertyStr(ctx, gl, "ZERO", JS_NewInt32(ctx, GL_ZERO));
    JS_SetPropertyStr(ctx, gl, "ONE", JS_NewInt32(ctx, GL_ONE));
    JS_SetPropertyStr(ctx, gl, "SRC_COLOR", JS_NewInt32(ctx, GL_SRC_COLOR));
    JS_SetPropertyStr(ctx, gl, "ONE_MINUS_SRC_COLOR", JS_NewInt32(ctx, GL_ONE_MINUS_SRC_COLOR));
    JS_SetPropertyStr(ctx, gl, "SRC_ALPHA", JS_NewInt32(ctx, GL_SRC_ALPHA));
    JS_SetPropertyStr(ctx, gl, "ONE_MINUS_SRC_ALPHA", JS_NewInt32(ctx, GL_ONE_MINUS_SRC_ALPHA));
    JS_SetPropertyStr(ctx, gl, "DST_ALPHA", JS_NewInt32(ctx, GL_DST_ALPHA));
    JS_SetPropertyStr(ctx, gl, "ONE_MINUS_DST_ALPHA", JS_NewInt32(ctx, GL_ONE_MINUS_DST_ALPHA));
    JS_SetPropertyStr(ctx, gl, "DST_COLOR", JS_NewInt32(ctx, GL_DST_COLOR));
    JS_SetPropertyStr(ctx, gl, "ONE_MINUS_DST_COLOR", JS_NewInt32(ctx, GL_ONE_MINUS_DST_COLOR));
    JS_SetPropertyStr(ctx, gl, "SRC_ALPHA_SATURATE", JS_NewInt32(ctx, GL_SRC_ALPHA_SATURATE));

    // depth function
    JS_SetPropertyStr(ctx, gl, "NEVER", JS_NewInt32(ctx, GL_NEVER));
    JS_SetPropertyStr(ctx, gl, "LESS", JS_NewInt32(ctx, GL_LESS));
    JS_SetPropertyStr(ctx, gl, "EQUAL", JS_NewInt32(ctx, GL_EQUAL));
    JS_SetPropertyStr(ctx, gl, "LEQUAL", JS_NewInt32(ctx, GL_LEQUAL));
    JS_SetPropertyStr(ctx, gl, "GREATER", JS_NewInt32(ctx, GL_GREATER));
    JS_SetPropertyStr(ctx, gl, "NOTEQUAL", JS_NewInt32(ctx, GL_NOTEQUAL));
    JS_SetPropertyStr(ctx, gl, "GEQUAL", JS_NewInt32(ctx, GL_GEQUAL));
    JS_SetPropertyStr(ctx, gl, "ALWAYS", JS_NewInt32(ctx, GL_ALWAYS));

    // parameters
    JS_SetPropertyStr(ctx, gl, "MAX_TEXTURE_SIZE", JS_NewInt32(ctx, GL_MAX_TEXTURE_SIZE));
    JS_SetPropertyStr(ctx, gl, "MAX_VERTEX_TEXTURE_IMAGE_UNITS", JS_NewInt32(ctx, GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS));
    JS_SetPropertyStr(ctx, gl, "MAX_TEXTURE_IMAGE_UNITS", JS_NewInt32(ctx, GL_MAX_TEXTURE_IMAGE_UNITS));
    JS_SetPropertyStr(ctx, gl, "MAX_RENDERBUFFER_SIZE", JS_NewInt32(ctx, GL_MAX_RENDERBUFFER_SIZE));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BUFFER_OFFSET_ALIGNMENT", JS_NewInt32(ctx, GL_UNIFORM_BUFFER_OFFSET_ALIGNMENT));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BUFFER_SIZE", JS_NewInt32(ctx, GL_UNIFORM_BUFFER_SIZE));
    JS_SetPropertyStr(ctx, gl, "MAX_UNIFORM_BLOCK_SIZE", JS_NewInt32(ctx, GL_MAX_UNIFORM_BLOCK_SIZE));

    // getActiveUniforms pname
    JS_SetPropertyStr(ctx, gl, "UNIFORM_TYPE", JS_NewInt32(ctx, GL_UNIFORM_TYPE));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_SIZE", JS_NewInt32(ctx, GL_UNIFORM_SIZE));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_OFFSET", JS_NewInt32(ctx, GL_UNIFORM_OFFSET));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BLOCK_INDEX", JS_NewInt32(ctx, GL_UNIFORM_BLOCK_INDEX));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_ARRAY_STRIDE", JS_NewInt32(ctx, GL_UNIFORM_ARRAY_STRIDE));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_MATRIX_STRIDE", JS_NewInt32(ctx, GL_UNIFORM_MATRIX_STRIDE));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_IS_ROW_MAJOR", JS_NewInt32(ctx, GL_UNIFORM_IS_ROW_MAJOR));

    // getActiveUniformBlock pname
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BLOCK_BINDING", JS_NewInt32(ctx, GL_UNIFORM_BLOCK_BINDING));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BLOCK_DATA_SIZE", JS_NewInt32(ctx, GL_UNIFORM_BLOCK_DATA_SIZE));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BLOCK_NAME_LENGTH", JS_NewInt32(ctx, GL_UNIFORM_BLOCK_NAME_LENGTH));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BLOCK_ACTIVE_UNIFORMS", JS_NewInt32(ctx, GL_UNIFORM_BLOCK_ACTIVE_UNIFORMS));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES", JS_NewInt32(ctx, GL_UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER", JS_NewInt32(ctx, GL_UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER));
    JS_SetPropertyStr(ctx, gl, "UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER", JS_NewInt32(ctx, GL_UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER));
    JS_FreeValue(ctx, global_obj);
}

#endif
