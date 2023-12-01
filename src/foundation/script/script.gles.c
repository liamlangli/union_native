#include "script.gles.h"

#if defined(RENDER_BACKEND_GLES)
#include <glad/glad.h>
#include <stdlib.h>

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
    JS_ToUint32(ctx, &usage, argv[1]);
    JSValue data = argv[2];

    JSValue buffer = JS_GetPropertyStr(ctx, data, "buffer");
    size_t length;
    u8 *data_buffer = JS_GetArrayBuffer(ctx, &length, buffer);
    glBufferData(target, length, data_buffer, usage);

    return JS_UNDEFINED;
}

static JSValue js_gl_create_shader(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint shader;
    JS_ToUint32(ctx, &shader, argv[0]);
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
    GLint length;
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
    GLuint index, size, type, normalized, stride, offset;
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
    GLuint index, size, type, stride, offset;
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

static JSValue js_gl_depth_func(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    GLuint func;
    JS_ToUint32(ctx, &func, argv[0]);
    glDepthFunc(func);
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
    GLuint mode, count, type, offset;
    JS_ToUint32(ctx, &mode, argv[0]);
    JS_ToUint32(ctx, &count, argv[1]);
    JS_ToUint32(ctx, &type, argv[2]);
    glDrawElements(mode, count, type, NULL);
    return JS_UNDEFINED;
}

#endif
void script_module_gles_register(script_context_t context)
{
    JSContext *ctx = context.context;
    JSValue global_obj = JS_GetGlobalObject(ctx);
    JSValue gl = JS_NewObject(ctx);

    JS_SetPropertyStr(ctx, global_obj, "gl", gl);
    JS_SetPropertyStr(ctx, gl, "clear", JS_NewCFunction(ctx, js_gl_clear, "clear", 0));
    JS_SetPropertyStr(ctx, gl, "viewport", JS_NewCFunction(ctx, js_gl_viewport, "viewport", 4));
    JS_SetPropertyStr(ctx, gl, "clearColor", JS_NewCFunction(ctx, js_gl_clear_color, "clearColor", 4));
    JS_SetPropertyStr(ctx, gl, "clearDepth", JS_NewCFunction(ctx, js_gl_clear_depth, "clearDepth", 1));
    JS_SetPropertyStr(ctx, gl, "createBuffer", JS_NewCFunction(ctx, js_gl_create_buffer, "createBuffer", 1));
    JS_SetPropertyStr(ctx, gl, "bindBuffer", JS_NewCFunction(ctx, js_gl_bind_buffer, "bindBuffer", 2));
    JS_SetPropertyStr(ctx, gl, "bufferData", JS_NewCFunction(ctx, js_gl_buffer_data, "bufferData", 3));
    JS_SetPropertyStr(ctx, gl, "createShader", JS_NewCFunction(ctx, js_gl_create_shader, "createShader", 1));
    JS_SetPropertyStr(ctx, gl, "shaderSource", JS_NewCFunction(ctx, js_gl_shader_source, "shaderSource", 2));
    JS_SetPropertyStr(ctx, gl, "compileShader", JS_NewCFunction(ctx, js_gl_compile_shader, "compileShader", 1));
    JS_SetPropertyStr(ctx, gl, "getShaderParameter", JS_NewCFunction(ctx, js_gl_get_shader_parameter, "getShaderParameter", 2));
    JS_SetPropertyStr(ctx, gl, "getShaderInfoLog", JS_NewCFunction(ctx, js_gl_get_shader_info_log, "getShaderInfoLog", 1));
    JS_SetPropertyStr(ctx, gl, "createProgram", JS_NewCFunction(ctx, js_gl_create_program, "createProgram", 0));
    JS_SetPropertyStr(ctx, gl, "attachShader", JS_NewCFunction(ctx, js_gl_attach_shader, "attachShader", 2));
    JS_SetPropertyStr(ctx, gl, "linkProgram", JS_NewCFunction(ctx, js_gl_link_program, "linkProgram", 1));
    JS_SetPropertyStr(ctx, gl, "getProgramParameter", JS_NewCFunction(ctx, js_gl_get_program_parameter, "getProgramParameter", 2));
    JS_SetPropertyStr(ctx, gl, "getProgramInfoLog", JS_NewCFunction(ctx, js_gl_get_program_info_log, "getProgramInfoLog", 1));
    JS_SetPropertyStr(ctx, gl, "useProgram", JS_NewCFunction(ctx, js_gl_use_program, "useProgram", 1));
    JS_SetPropertyStr(ctx, gl, "getAttribLocation", JS_NewCFunction(ctx, js_gl_get_attrib_location, "getAttribLocation", 2));
    JS_SetPropertyStr(ctx, gl, "vertexAttribPointer", JS_NewCFunction(ctx, js_gl_vertex_attrib_pointer, "vertexAttribPointer", 6));
    JS_SetPropertyStr(ctx, gl, "enableVertexAttribArray", JS_NewCFunction(ctx, js_gl_enable_vertex_attrib_array, "enableVertexAttribArray", 1));
    JS_SetPropertyStr(ctx, gl, "drawArrays", JS_NewCFunction(ctx, js_gl_draw_arrays, "drawArrays", 3));
    JS_SetPropertyStr(ctx, gl, "createTexture", JS_NewCFunction(ctx, js_gl_create_texture, "createTexture", 0));
    JS_SetPropertyStr(ctx, gl, "bindTexture", JS_NewCFunction(ctx, js_gl_bind_texture, "bindTexture", 2));
    JS_SetPropertyStr(ctx, gl, "texImage2D", JS_NewCFunction(ctx, js_gl_tex_image2d, "texImage2D", 9));
    JS_SetPropertyStr(ctx, gl, "texParameteri", JS_NewCFunction(ctx, js_gl_tex_parameteri, "texParameteri", 3));
    JS_SetPropertyStr(ctx, gl, "createFramebuffer", JS_NewCFunction(ctx, js_gl_create_framebuffer, "createFramebuffer", 0));
    JS_SetPropertyStr(ctx, gl, "bindFramebuffer", JS_NewCFunction(ctx, js_gl_bind_framebuffer, "bindFramebuffer", 2));
    JS_SetPropertyStr(ctx, gl, "framebufferTexture2D", JS_NewCFunction(ctx, js_gl_framebuffer_texture2d, "framebufferTexture2D", 5));
    JS_SetPropertyStr(ctx, gl, "checkFramebufferStatus", JS_NewCFunction(ctx, js_gl_check_framebuffer_status, "checkFramebufferStatus", 1));
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
    JS_SetPropertyStr(ctx, gl, "depthFunc", JS_NewCFunction(ctx, js_gl_depth_func, "depthFunc", 1));
    JS_SetPropertyStr(ctx, gl, "cullFace", JS_NewCFunction(ctx, js_gl_cull_face, "cullFace", 1));
    JS_SetPropertyStr(ctx, gl, "frontFace", JS_NewCFunction(ctx, js_gl_front_face, "frontFace", 1));
    JS_SetPropertyStr(ctx, gl, "polygonOffset", JS_NewCFunction(ctx, js_gl_polygon_offset, "polygonOffset", 2));
    JS_SetPropertyStr(ctx, gl, "drawElements", JS_NewCFunction(ctx, js_gl_draw_elements, "drawElements", 4));
    JS_FreeValue(ctx, global_obj);
}
