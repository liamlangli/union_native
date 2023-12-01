#include "script.h"
#include "script.gles.h"

#define MAX_FRAME_CALLBACKS 16

JSValue get_context(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        const char* id = JS_ToCString(context, argv[0]);
        fprintf(stdout, "get_context: %s\n", id);

        return JS_GetPropertyStr(context, JS_GetGlobalObject(context), "gl");
    }

    return JS_UNDEFINED;
}

JSValue get_element_by_id(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        const char* id = JS_ToCString(context, argv[0]);
        fprintf(stdout, "get_element_by_id: %s\n", id);

        JSValue canvas = JS_NewObject(context);
        JS_SetPropertyStr(context, canvas, "getContext", JS_NewCFunction(context, get_context, "getContext", 1));
        return canvas;
    } else {
        return JS_UNDEFINED;
    }
}

JSValue js_print(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    for (int i = 0; i < argc; i++) 
    {
        const char* str = JS_ToCString(context, argv[i]);
        fprintf(stdout, "%s", str);
        JS_FreeCString(context, str);
    }
    fprintf(stdout, "\n");
    return JS_UNDEFINED;
}

JSValue js_window_add_event_listener(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 2) 
    {
        const char* event = JS_ToCString(context, argv[0]);
        const char* callback = JS_ToCString(context, argv[1]);
        fprintf(stdout, "addEventListener: %s, %s\n", event, callback);
    }

    return JS_UNDEFINED;
}

static JSValue _frame_callbacks[MAX_FRAME_CALLBACKS];
JSValue js_request_animation_frame(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        JSValue callback = argv[0];
        for (int i = 0; i < MAX_FRAME_CALLBACKS; i++) 
        {
            if (JS_IsUndefined(_frame_callbacks[i])) 
            {
                _frame_callbacks[i] = callback;
                break;
            }
        }
    }

    return JS_UNDEFINED;
}

static JSValue js_console_log(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv)
{
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}
static JSValue js_console_warn(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv)
{
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}
static JSValue js_console_error(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv)
{
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

script_context_t script_context_create()
{
    JSRuntime *runtime = JS_NewRuntime();
    JSContext *ctx = JS_NewContext(runtime);
    JSValue global = JS_GetGlobalObject(ctx);
    JS_SetPropertyStr(ctx, global, "requestAnimationFrame", JS_NewCFunction(ctx, js_request_animation_frame, "requestAnimationFrame", 1));

    JSValue document = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "document", document);
    JS_SetPropertyStr(ctx, document, "getElementById", JS_NewCFunction(ctx, get_element_by_id, "getElementById", 1));

    JSValue window = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "window", window);
    JS_SetPropertyStr(ctx, window, "addEventListener", JS_NewCFunction(ctx, js_window_add_event_listener, "addEventListener", 2));

    JSValue console = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "console", console);
    JS_SetPropertyStr(ctx, console, "log", JS_NewCFunction(ctx, js_console_log, "log", 1));
    JS_SetPropertyStr(ctx, console, "warn", JS_NewCFunction(ctx, js_console_warn, "warn", 1));
    JS_SetPropertyStr(ctx, console, "error", JS_NewCFunction(ctx, js_console_error, "error", 1));

    JSValue self = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, global, "self", self);

    JS_FreeValue(ctx, global);
    script_context_t context = { .context = ctx, .runtime = runtime };
    script_module_gles_register(context);

    return context;
}

JSValue script_eval(script_context_t context, ustring_t source)
{
    return JS_Eval(context.context, source.data, source.length, "<eval>", JS_EVAL_FLAG_BACKTRACE_BARRIER);
}

void script_frame_tick(script_context_t context)
{
    for (int i = 0; i < MAX_FRAME_CALLBACKS; i++) 
    {
        if (!JS_IsUndefined(_frame_callbacks[i])) 
        {
            JS_Call(context.context, _frame_callbacks[i], JS_UNDEFINED, 0, NULL);
        }
    }
}

void script_context_destroy(script_context_t context)
{
    JS_FreeContext(context.context);
    JS_FreeRuntime(context.runtime);
}