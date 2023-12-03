#include "script.h"
#include "foundation/script/webgl2/webgl2.h"
#include <GLFW/glfw3.h>

#define MAX_FRAME_CALLBACKS 16

JSValue js_add_event_listener(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 2) 
    {
        const char* event = JS_ToCString(context, argv[0]);
        const char* callback = JS_ToCString(context, argv[1]);
        // fprintf(stdout, "addEventListener: %s, %s\n", event, callback);
    }

    return JS_UNDEFINED;
}

JSValue js_get_context(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        const char* id = JS_ToCString(context, argv[0]);
        fprintf(stdout, "get_context: %s\n", id);

        return JS_GetPropertyStr(context, JS_GetGlobalObject(context), "gl");
    }

    return JS_UNDEFINED;
}

JSValue js_get_element_by_id(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        const char* id = JS_ToCString(context, argv[0]);
        fprintf(stdout, "get_element_by_id: %s\n", id);

        JSValue canvas = JS_NewObject(context);
        JS_SetPropertyStr(context, canvas, "getContext", JS_NewCFunction(context, js_get_context, "getContext", 1));
        JS_SetPropertyStr(context, canvas, "addEventListener", JS_NewCFunction(context, js_add_event_listener, "addEventListener", 2));
        return canvas;
    } else {
        return JS_UNDEFINED;
    }
}

JSValue js_get_elements_by_tag_name(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue arr = JS_NewArray(context);
    JSValue canvas = JS_NewObject(context);
    JS_SetPropertyStr(context, canvas, "getContext", JS_NewCFunction(context, js_get_context, "getContext", 1));
    JS_SetPropertyStr(context, canvas, "addEventListener", JS_NewCFunction(context, js_add_event_listener, "addEventListener", 2));
    JS_SetPropertyUint32(context, arr, 0, canvas);
    return arr;
}

static JSValue _frame_callback;
JSValue js_request_animation_frame(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        JSValue callback = argv[0];
        if (JS_IsFunction(context, callback)) 
        {
            _frame_callback = callback;
        }
    }

    return JS_UNDEFINED;
}

static JSValue js_console_log(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv)
{
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s\n", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}
static JSValue js_console_warn(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv)
{
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s\n", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}
static JSValue js_console_error(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv)
{
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s\n", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_performance_now(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv)
{
    return JS_NewFloat64(ctx, glfwGetTime());
}

script_context_t script_context_create(void)
{
    JSRuntime *runtime = JS_NewRuntime();
    JSContext *ctx = JS_NewContext(runtime);
    JSValue global = JS_GetGlobalObject(ctx);

    js_init_module_std(ctx, "std");
    js_init_module_os(ctx, "os");

    JS_SetPropertyStr(ctx, global, "requestAnimationFrame", JS_NewCFunction(ctx, js_request_animation_frame, "requestAnimationFrame", 1));

    JSValue document = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "document", document);
    JS_SetPropertyStr(ctx, document, "getElementById", JS_NewCFunction(ctx, js_get_element_by_id, "getElementById", 1));
    JS_SetPropertyStr(ctx, document, "getElementsByTagName", JS_NewCFunction(ctx, js_get_elements_by_tag_name, "getElementsByTagName", 1));
    JS_SetPropertyStr(ctx, document, "addEventListener", JS_NewCFunction(ctx, js_add_event_listener, "addEventListener", 1));

    JSValue window = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "window", window);
    JS_SetPropertyStr(ctx, window, "addEventListener", JS_NewCFunction(ctx, js_add_event_listener, "addEventListener", 2));
    JS_SetPropertyStr(ctx, window, "innerWidth", JS_NewInt32(ctx, 1080));
    JS_SetPropertyStr(ctx, window, "innerHeight", JS_NewInt32(ctx, 720));

    JSValue performance = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "performance", performance);
    JS_SetPropertyStr(ctx, performance, "now", JS_NewCFunction(ctx, js_performance_now, "now", 0));

    JSValue console = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "console", console);
    JS_SetPropertyStr(ctx, console, "log", JS_NewCFunction(ctx, js_console_log, "log", 1));
    JS_SetPropertyStr(ctx, console, "warn", JS_NewCFunction(ctx, js_console_warn, "warn", 1));
    JS_SetPropertyStr(ctx, console, "error", JS_NewCFunction(ctx, js_console_error, "error", 1));

    JSValue self = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "self", self);

    JS_FreeValue(ctx, global);
    script_context_t context = { .context = ctx, .runtime = runtime };
    script_module_webgl2_register(context);

    return context;
}

int script_eval(script_context_t context, ustring_t source, ustring_t filename)
{
    JSValue val;
    int ret;

    JSContext *ctx = context.context;
    val = JS_Eval(context.context, source.data, source.length, filename.data, 0);

    if (JS_IsException(val)) {
        js_std_dump_error(ctx);
        ret = -1;
    } else {
        ret = 0;
    }

    JS_FreeValue(ctx, val);
    return ret;
}

void script_frame_tick(script_context_t context)
{
    if (JS_IsFunction(context.context, _frame_callback)) 
    {
        JS_Call(context.context, _frame_callback, JS_UNDEFINED, 0, NULL);
    }
}

void script_context_destroy(script_context_t context)
{
    JS_FreeContext(context.context);
    JS_RunGC(context.runtime);
    JS_FreeRuntime(context.runtime);
}