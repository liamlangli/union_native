#include "script.h"
#include "foundation/webgl2.h"
#include <GLFW/glfw3.h>
#include <quickjs/quickjs.h>

static script_context_t shared_context;

JSValue js_add_event_listener(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 2) 
    {
        const char* name = JS_ToCString(context, this_val);
        const char* event = JS_ToCString(context, argv[0]);
        fprintf(stdout, "addEventListener: %s, %s\n", name, event);
    }

    return JS_UNDEFINED;
}

JSValue js_get_context(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        const char* id = JS_ToCString(context, argv[0]);
        fprintf(stdout, "get_context: %s\n", id);
        JSValue global = JS_GetGlobalObject(context);
        JSValue gl = JS_GetPropertyStr(context, global, "gl");
        JS_FreeValue(context, global);
        return gl;
    }

    return JS_UNDEFINED;
}

JSValue js_document_create_element(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        const char* id = JS_ToCString(context, argv[0]);
        fprintf(stdout, "create_element: %s\n", id);

        JSValue canvas = JS_NewObject(context);
        JS_SetPropertyStr(context, canvas, "getContext", JS_NewCFunction(context, js_get_context, "getContext", 1));
        return canvas;
    } else {
        return JS_UNDEFINED;
    }
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

static JSValue js_console_log(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s\n", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_console_warn(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s\n", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_console_error(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i)
    {
        const char *str = JS_ToCString(ctx, argv[i]);
        fprintf(stdout, "%s\n", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_performance_now(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv) {
    return JS_NewFloat64(ctx, glfwGetTime());
}

script_context_t* script_context_share(void) {
    static int _initialized = 0;
    if (_initialized) {
        return &shared_context;
    }

    shared_context.runtime = JS_NewRuntime();
    shared_context.context = JS_NewContext(shared_context.runtime);
    _initialized = 1;
    return &shared_context;
}

static JSValue js_get_window_inner_width(JSContext *ctx, JSValueConst this_val) {
    return JS_NewInt32(ctx, shared_context.width);
}

static JSValue js_get_window_inner_height(JSContext *ctx, JSValueConst this_val) {
    return JS_NewInt32(ctx, shared_context.height);
}

static JSValue js_set_window_inner_width(JSContext *ctx, JSValueConst this_val, JSValueConst val)
{
    JS_ToInt32(ctx, &shared_context.width, val);
    return JS_UNDEFINED;
}

static JSValue js_set_window_inner_height(JSContext *ctx, JSValueConst this_val, JSValueConst val)
{
    JS_ToInt32(ctx, &shared_context.height, val);
    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_window_proto_funcs[] = {
    JS_CFUNC_DEF("addEventListener", 2, js_add_event_listener),
    JS_PROP_INT64_DEF("opacity", 0, JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
    JS_CGETSET_DEF("innerWidth", js_get_window_inner_width, js_set_window_inner_width),
    JS_CGETSET_DEF("innerHeight", js_get_window_inner_height, js_set_window_inner_height),
};

static const JSCFunctionListEntry js_window_funcs[] = {
    JS_OBJECT_DEF("window", js_window_proto_funcs, countof(js_window_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_document_proto_funcs[] = {
    JS_CFUNC_DEF("createElement", 1, js_document_create_element),
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

static JSClassID js_text_decoder_class_id;
static JSClassDef js_unreal_class = {
    "TextDecoder",
    .finalizer = NULL,
    .gc_mark = NULL,
    .call = NULL,
    .exotic = NULL,
};

static JSValue js_text_decoder_decode(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 1) 
    {
        const char* str = JS_ToCString(ctx, argv[0]);
        fprintf(stdout, "text_decoder_decode: %s\n", str);
    }

    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_text_decoder_proto_funcs[] = {
    JS_CFUNC_DEF("decode", 1, js_text_decoder_decode),
};

static JSValue js_text_decoder_ctor(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv)
{
    return JS_NewObjectProtoClass(ctx, new_target, js_text_decoder_class_id);
}

static JSClassID js_weak_ref_class_id;
static JSClassDef js_weak_ref_class = {
    "WeakRef",
    .finalizer = NULL,
    .gc_mark = NULL,
    .call = NULL,
    .exotic = NULL,
};

static JSValue js_weak_ref_deref(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_weak_ref_proto_funcs[] = {
    JS_CFUNC_DEF("deref", 0, js_weak_ref_deref),
};

static JSValue js_weak_ref_ctor(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv)
{
    return JS_NewObjectProtoClass(ctx, new_target, js_weak_ref_class_id);
}

void script_module_browser_register(script_context_t *context) {
    JSContext *ctx = context->context;
    JSRuntime *rt = context->runtime;
    JSValue global = JS_GetGlobalObject(ctx);

    JS_SetPropertyStr(ctx, global, "requestAnimationFrame", JS_NewCFunction(ctx, js_request_animation_frame, "requestAnimationFrame", 1));
    JS_SetPropertyFunctionList(ctx, global, js_document_funcs, countof(js_document_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_window_funcs, countof(js_window_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_performance_funcs, countof(js_performance_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_console_funcs, countof(js_console_funcs));
    JS_SetPropertyStr(ctx, global, "self",  JS_NewObject(ctx));

    // class defined
    JS_NewClassID(&js_text_decoder_class_id);
    JS_NewClass(rt, js_text_decoder_class_id, &js_unreal_class);
    JSValue text_decoder_proto = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, text_decoder_proto, js_text_decoder_proto_funcs, countof(js_text_decoder_proto_funcs));
    JS_SetClassProto(ctx, js_text_decoder_class_id, text_decoder_proto);
    JSValue text_decoder_ctor = JS_NewCFunction2(ctx, js_text_decoder_ctor, "TextDecoder", 1, JS_CFUNC_constructor, 0);
    JS_SetConstructor(ctx, text_decoder_ctor, text_decoder_proto);
    JS_SetPropertyStr(ctx, global, "TextDecoder", text_decoder_ctor);

    JS_NewClassID(&js_weak_ref_class_id);
    JS_NewClass(rt, js_weak_ref_class_id, &js_weak_ref_class);
    JSValue weak_ref_proto = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, weak_ref_proto, js_weak_ref_proto_funcs, countof(js_weak_ref_proto_funcs));
    JS_SetClassProto(ctx, js_weak_ref_class_id, weak_ref_proto);
    JSValue weak_ref_ctor = JS_NewCFunction2(ctx, js_weak_ref_ctor, "WeakRef", 1, JS_CFUNC_constructor, 0);
    JS_SetConstructor(ctx, weak_ref_ctor, weak_ref_proto);
    JS_SetPropertyStr(ctx, global, "WeakRef", weak_ref_ctor);
    
    JS_FreeValue(ctx, global);
}

int script_eval(script_context_t *context, ustring_t source, ustring_t filename)
{
    JSValue val;
    int ret;

    JSContext *ctx = context->context;
    val = JS_Eval(ctx, source.data, source.length, filename.data, 0);

    if (JS_IsException(val)) {
        js_std_dump_error(ctx);
        ret = -1;
    } else {
        ret = 0;
    }

    JS_FreeValue(ctx, val);
    return ret;
}

void script_window_resize(script_context_t *context, int width, int height)
{
    shared_context.width = width;
    shared_context.height = height;
}

void script_frame_tick(script_context_t *context)
{
    JSContext *ctx = context->context;
    if (JS_IsFunction(ctx, _frame_callback)) 
    {
        JS_Call(ctx, _frame_callback, JS_UNDEFINED, 0, NULL);
    }
}

void script_context_destroy(script_context_t *context)
{
    JS_FreeContext(context->context);
    JS_RunGC(context->runtime);
    JS_FreeRuntime(context->runtime);
    free(context);
}