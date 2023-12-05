#include "script.h"
#include "foundation/webgl2.h"
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
    script_context_t context = { .context = ctx, .runtime = runtime };
    return context;
}

static JSValue js_window_inner_width_get(JSContext *ctx, JSValueConst this_val)
{
    return JS_NewInt32(ctx, 1280);
}

static JSValue js_window_inner_height_get(JSContext *ctx, JSValueConst this_val)
{
    return JS_NewInt32(ctx, 720);
}

static JSValue js_window_inner_width_set(JSContext *ctx, JSValueConst this_val, JSValueConst val)
{
    return JS_UNDEFINED;
}

static JSValue js_window_inner_height_set(JSContext *ctx, JSValueConst this_val, JSValueConst val)
{
    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_window_proto_funcs[] = {
    JS_CFUNC_DEF("addEventListener", 2, js_add_event_listener),
    JS_PROP_INT64_DEF("opacity", 0, JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
    JS_CGETSET_DEF("innerWidth", js_window_inner_width_get, js_window_inner_width_set),
    JS_CGETSET_DEF("innerHeight", js_window_inner_height_get, js_window_inner_height_set),
};

static const JSCFunctionListEntry js_window_funcs[] = {
    JS_OBJECT_DEF("window", js_window_proto_funcs, countof(js_window_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_document_proto_funcs[] = {
    JS_CFUNC_DEF("getElementById", 1, js_get_element_by_id),
    JS_CFUNC_DEF("getElementsByTagName", 1, js_get_elements_by_tag_name),
    JS_CFUNC_DEF("addEventListener", 2, js_add_event_listener),
};

static const JSCFunctionListEntry js_document_funcs[] = {
    JS_OBJECT_DEF("document", js_document_proto_funcs, countof(js_document_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_console_proto_funcs[] = {
    JS_CFUNC_DEF("log", 1, js_console_log),
    JS_CFUNC_DEF("warn", 1, js_console_warn),
    JS_CFUNC_DEF("error", 1, js_console_error),
};

static const JSCFunctionListEntry js_console_funcs[] = {
    JS_OBJECT_DEF("console", js_console_proto_funcs, countof(js_console_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_performance_proto_funcs[] = {
    JS_CFUNC_DEF("now", 0, js_performance_now),
};

static const JSCFunctionListEntry js_performance_funcs[] = {
    JS_OBJECT_DEF("performance", js_performance_proto_funcs, countof(js_performance_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

void script_module_browser_register(script_context_t *context) {
    JSContext *ctx = context->context;
    JSValue global = JS_GetGlobalObject(ctx);

    JS_SetPropertyStr(ctx, global, "requestAnimationFrame", JS_NewCFunction(ctx, js_request_animation_frame, "requestAnimationFrame", 1));
    JS_SetPropertyFunctionList(ctx, global, js_document_funcs, countof(js_document_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_window_funcs, countof(js_window_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_performance_funcs, countof(js_performance_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_console_funcs, countof(js_console_funcs));
    JS_SetPropertyStr(ctx, global, "self",  JS_NewObject(ctx));

    JS_FreeValue(ctx, global);
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