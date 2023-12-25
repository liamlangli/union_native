#include "script.h"
#include "foundation/webgl2.h"

#include <GLFW/glfw3.h>
#include <quickjs/quickjs.h>
#include <stb_ds.h>

static script_context_t shared_context;

static const char* resize_event = "resize";
static const char* mousedown_event = "mousedown";
static const char* mouseup_event = "mouseup";
static const char* mousemove_event = "mousemove";
static const char* wheel_event = "wheel";
static const char* keydown_event = "keydown";
static const char* keyup_event = "keyup";

JSValue js_window_add_event_listener(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 2) 
    {
        const char* event_name = JS_ToCString(context, argv[0]);
        char* name = ( char*)malloc(strlen(event_name) + 1);
        strcpy(name, event_name);

        JSValue handler = argv[1];
        js_scope scope = { .this = this_val, .func = handler };
        shput(shared_context.window_event_listeners, name, scope);
    }

    return JS_UNDEFINED;
}

JSValue js_document_add_event_listener(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 2) 
    {
        const char* event_name = JS_ToCString(context, argv[0]);
        char* name = ( char*)malloc(strlen(event_name) + 1);
        strcpy(name, event_name);

        JSValue handler = argv[1];
        js_scope scope = { .this = this_val, .func = handler };
        shput(shared_context.document_event_listeners, name, scope);
    }

    return JS_UNDEFINED;
}

JSValue js_canvas_add_event_listener(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv)
{
    if (argc >= 2) 
    {
        const char* event_name = JS_ToCString(context, argv[0]);
        char* name = ( char*)malloc(strlen(event_name) + 1);
        strcpy(name, event_name);

        JSValue handler = argv[1];
        js_scope scope = { .this = this_val, .func = handler };
        shput(shared_context.canvas_event_listeners, name, scope);
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
        JS_SetPropertyStr(context, canvas, "addEventListener", JS_NewCFunction(context, js_canvas_add_event_listener, "addEventListener", 2));
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
        JS_SetPropertyStr(context, canvas, "addEventListener", JS_NewCFunction(context, js_canvas_add_event_listener, "addEventListener", 2));
        return canvas;
    } else {
        return JS_UNDEFINED;
    }
}

JSValue js_get_elements_by_tag_name(JSContext *context, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue arr = JS_NewArray(context);
    JSValue canvas = JS_NewObject(context);
    JS_SetPropertyStr(context, canvas, "getContext", JS_NewCFunction(context, js_get_context, "getContext", 1));
    JS_SetPropertyStr(context, canvas, "addEventListener", JS_NewCFunction(context, js_canvas_add_event_listener, "addEventListener", 2));
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

static JSValue js_get_window_device_pixel_ratio(JSContext *ctx, JSValueConst this_val) {
    return JS_NewFloat64(ctx, shared_context.display_ratio);
}

static JSValue js_set_window_device_pixel_ratio(JSContext *ctx, JSValueConst this_val, JSValueConst val)
{
    JS_ToFloat64(ctx, &shared_context.display_ratio, val);
    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_window_proto_funcs[] = {
    JS_CFUNC_DEF("addEventListener", 2, js_window_add_event_listener),
    JS_PROP_INT64_DEF("opacity", 0, JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
    JS_CGETSET_DEF("innerWidth", js_get_window_inner_width, js_set_window_inner_width),
    JS_CGETSET_DEF("innerHeight", js_get_window_inner_height, js_set_window_inner_height),
    JS_CGETSET_DEF("devicePixelRatio", js_get_window_device_pixel_ratio, js_set_window_device_pixel_ratio),
};

static const JSCFunctionListEntry js_window_funcs[] = {
    JS_OBJECT_DEF("window", js_window_proto_funcs, countof(js_window_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_document_proto_funcs[] = {
    JS_CFUNC_DEF("addEventListener", 2, js_document_add_event_listener),
    JS_CFUNC_DEF("createElement", 1, js_document_create_element),
    JS_CFUNC_DEF("getElementById", 1, js_get_element_by_id),
    JS_CFUNC_DEF("getElementsByTagName", 1, js_get_elements_by_tag_name),
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

void script_module_browser_register() {
    script_context_t *context = script_context_share();
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

int script_eval(ustring source, ustring filename)
{
    JSValue val;
    int ret;

    JSContext *ctx = script_context_share()->context;
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

void script_window_resize(int width, int height)
{
    script_context_t *context = script_context_share();
    context->width = width;
    context->height = height;
    context->framebuffer_width = width * context->display_ratio;
    context->framebuffer_height = height * context->display_ratio;
    int i = shgeti(context->window_event_listeners, resize_event);
    if (i != -1) {
        js_scope scope = shared_context.window_event_listeners[i].value;
        JSValue event = JS_NewObject(context->context);
        JS_SetPropertyStr(context->context, event, "type", JS_NewString(context->context, resize_event));
        JS_SetPropertyStr(context->context, event, "width", JS_NewInt32(context->context, width));
        JS_SetPropertyStr(context->context, event, "height", JS_NewInt32(context->context, height));
        JS_Call(context->context, scope.func, scope.this, 1, &event);
        JS_FreeValue(context->context, event);
    }
}

void script_window_mouse_move(double x, double y) {
    script_context_t *context = script_context_share();
    context->mouse_x = x;
    context->mouse_y = y;
    int i = shgeti(shared_context.window_event_listeners, mousemove_event);
    if (i != -1) {
        js_scope scope = shared_context.window_event_listeners[i].value;
        JSValue event = JS_NewObject(context->context);
        JS_SetPropertyStr(context->context, event, "type", JS_NewString(context->context, mousemove_event));
        JS_SetPropertyStr(context->context, event, "clientX", JS_NewFloat64(context->context, x));
        JS_SetPropertyStr(context->context, event, "clientY", JS_NewFloat64(context->context, y));
        JS_Call(context->context, scope.func, scope.this, 1, &event);
        JS_FreeValue(context->context, event);
    }
}

void script_window_mouse_down(int button) {
    script_context_t *context = script_context_share();
    int i = shgeti(shared_context.window_event_listeners, mousedown_event);
    if (i != -1) {
        js_scope scope = shared_context.window_event_listeners[i].value;
        JSValue event = JS_NewObject(context->context);
        JS_SetPropertyStr(context->context, event, "type", JS_NewString(context->context, mousedown_event));
        JS_SetPropertyStr(context->context, event, "button", JS_NewInt32(context->context, button));
        JS_SetPropertyStr(context->context, event, "clientX", JS_NewFloat64(context->context, context->mouse_x));
        JS_SetPropertyStr(context->context, event, "clientY", JS_NewFloat64(context->context, context->mouse_y));
        JS_Call(context->context, scope.func, scope.this, 1, &event);
        JS_FreeValue(context->context, event);
    }
}

void script_window_mouse_up(int button) {
    script_context_t *context = script_context_share();
    int i = shgeti(shared_context.window_event_listeners, mouseup_event);
    if (i != -1) {
        js_scope scope = shared_context.window_event_listeners[i].value;
        JSValue event = JS_NewObject(context->context);
        JS_SetPropertyStr(context->context, event, "type", JS_NewString(context->context, mouseup_event));
        JS_SetPropertyStr(context->context, event, "button", JS_NewInt32(context->context, button));
        JS_SetPropertyStr(context->context, event, "clientX", JS_NewFloat64(context->context, context->mouse_x));
        JS_SetPropertyStr(context->context, event, "clientY", JS_NewFloat64(context->context, context->mouse_y));
        JS_Call(context->context, scope.func, scope.this, 1, &event);
        JS_FreeValue(context->context, event);
    }
}

void script_window_mouse_scroll(double x, double y) {
    script_context_t *context = script_context_share();
    int i = shgeti(shared_context.window_event_listeners, wheel_event);
    if (i != -1) {
        js_scope scope = shared_context.window_event_listeners[i].value;
        JSValue event = JS_NewObject(context->context);
        JS_SetPropertyStr(context->context, event, "type", JS_NewString(context->context, wheel_event));
        JS_SetPropertyStr(context->context, event, "deltaX", JS_NewFloat64(context->context, x));
        JS_SetPropertyStr(context->context, event, "deltaY", JS_NewFloat64(context->context, y));
        JS_Call(context->context, scope.func, scope.this, 1, &event);
        JS_FreeValue(context->context, event);
    }
}

void script_document_key_down(int key) {
    script_context_t *context = script_context_share();
    int i = shgeti(shared_context.document_event_listeners, keydown_event);
    if (i != -1) {
        js_scope scope = shared_context.document_event_listeners[i].value;
        JSValue event = JS_NewObject(context->context);
        JS_SetPropertyStr(context->context, event, "type", JS_NewString(context->context, keydown_event));
        JS_SetPropertyStr(context->context, event, "key", JS_NewInt32(context->context, key));
        JS_Call(context->context, scope.func, scope.this, 1, &event);
        JS_FreeValue(context->context, event);
    }
}

void script_document_key_up(int key) {
    script_context_t *context = script_context_share();
    int i = shgeti(shared_context.document_event_listeners, keyup_event);
    if (i != -1) {
        js_scope scope = shared_context.document_event_listeners[i].value;
        JSValue event = JS_NewObject(context->context);
        JS_SetPropertyStr(context->context, event, "type", JS_NewString(context->context, keyup_event));
        JS_SetPropertyStr(context->context, event, "key", JS_NewInt32(context->context, key));
        JS_Call(context->context, scope.func, scope.this, 1, &event);
        JS_FreeValue(context->context, event);
    }
}

void script_frame_tick()
{
    JSContext *ctx = script_context_share()->context;
    if (JS_IsFunction(ctx, _frame_callback)) 
    {
        JS_Call(ctx, _frame_callback, JS_UNDEFINED, 0, NULL);
    }
}

void script_context_destroy()
{
    script_context_t *context = script_context_share();
    JS_FreeContext(context->context);
    JS_RunGC(context->runtime);
    JS_FreeRuntime(context->runtime);
    free(context);
}