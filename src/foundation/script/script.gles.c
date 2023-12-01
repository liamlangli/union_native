#include "script.gles.h"

#if defined(RENDER_BACKEND_GLES)
#include <glad/glad.h>

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

#endif
void script_module_gles_register(script_context_t context)
{
    JSValue global_obj = JS_GetGlobalObject(context.context);
    JSValue gl = JS_NewObject(context.context);

    JS_SetPropertyStr(context.context, global_obj, "gl", gl);
    JS_SetPropertyStr(context.context, gl, "clear", JS_NewCFunction(context.context, js_gl_clear, "clear", 0));
    JS_SetPropertyStr(context.context, gl, "viewport", JS_NewCFunction(context.context, js_gl_viewport, "viewport", 4));
    JS_SetPropertyStr(context.context, gl, "clearColor", JS_NewCFunction(context.context, js_gl_clear_color, "clearColor", 4));
    JS_SetPropertyStr(context.context, gl, "clearDepth", JS_NewCFunction(context.context, js_gl_clear_depth, "clearDepth", 1));

    JS_FreeValue(context.context, global_obj);
}
