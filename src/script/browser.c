#include "foundation/io.h"
#include "foundation/logger.h"
#include "foundation/ustring.h"
#include "gpu/gpu.h"
#include "script/api.h"

#include <assert.h>
#include <quickjs/quickjs-libc.h>
#include <quickjs/quickjs.h>
#include <stb_ds.h>

typedef struct JSGCObjectHeader {
    int ref_count; /* must come first, 32-bit */
} JSGCObjectHeader;

static int ref_count = 0;
static int deref_count = 0;

static void js_value_ref(JSRuntime *_, JSGCObjectHeader *p) {
    p->ref_count++;
    ref_count++;
}

static void js_value_deref(JSRuntime *_, JSGCObjectHeader *p) {
    // p->ref_count = MACRO_MAX(0, p->ref_count - 1);
    deref_count++;
}
void script_value_ref(JSValue value) { JS_MarkValue((JSRuntime *)script_runtime_internal(), value, js_value_ref); }
void script_value_deref(JSValue value) { JS_MarkValue((JSRuntime *)script_runtime_internal(), value, js_value_deref); }

typedef struct js_scope {
    JSValue this, func;
} js_scope;

typedef struct js_listener_hm {
    const char *key;
    js_scope *value;
} js_listener_hm;

typedef struct js_frame_callback {
    JSValue key;
    js_scope value;
} js_frame_callback;

typedef struct browser_module {
    js_listener_hm *window_event_listeners;
    js_listener_hm *document_event_listeners;
    js_listener_hm *canvas_event_listeners;
    js_frame_callback *frame_callbacks;
    gpu_backend backend;
} browser_module;

static browser_module browser = {0};

static const char *resize_event = "resize";
static const char *mousedown_event = "mousedown";
static const char *mouseup_event = "mouseup";
static const char *mousemove_event = "mousemove";
static const char *wheel_event = "mousewheel";
static const char *keydown_event = "keydown";
static const char *keyup_event = "keyup";
static const char *touch_start_event = "touchstart";
static const char *touch_move_event = "touchmove";
static const char *touch_end_event = "touchend";
static const char *touch_cancel_event = "touchcancel";

JSValue js_window_add_event_listener(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 2)
        return JS_UNDEFINED;
    const char *event_name = JS_ToCString(ctx, argv[0]);
    char *name = (char *)malloc(strlen(event_name) + 1);
    strcpy(name, event_name);
    JS_FreeCString(ctx, event_name);

    JSValue handler = argv[1];
    assert(JS_IsFunction(ctx, handler));
    script_value_ref(handler);

    js_scope *scopes = shget(browser.window_event_listeners, name);
    js_scope scope = {.this = this_val, .func = handler};
    arrpush(scopes, scope);
    shput(browser.window_event_listeners, name, scopes);

    return JS_UNDEFINED;
}

JSValue js_window_remove_event_listener(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    if (argc < 2)
        return JS_UNDEFINED;
    const char *event_name = JS_ToCString(ctx, argv[0]);
    js_scope *scopes = shget(browser.window_event_listeners, event_name);
    JS_FreeCString(ctx, event_name);

    JSValue handler = argv[1];
    assert(JS_IsFunction(ctx, handler));

    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        if (JS_VALUE_GET_PTR(scope.func) == JS_VALUE_GET_PTR(handler)) {
            script_value_deref(handler);
            JS_FreeValue(ctx, scope.func);
            arrdel(scopes, i);
            break;
        }
    }

    return JS_UNDEFINED;
}

JSValue js_document_add_event_listener(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 2)
        return JS_UNDEFINED;
    const char *event_name = JS_ToCString(ctx, argv[0]);
    char *name = (char *)malloc(strlen(event_name) + 1);
    strcpy(name, event_name);
    JS_FreeCString(ctx, event_name);

    JSValue handler = argv[1];
    assert(JS_IsFunction(ctx, handler));
    script_value_ref(handler);

    js_scope *scopes = shget(browser.document_event_listeners, name);
    js_scope scope = {.this = this_val, .func = handler};
    arrpush(scopes, scope);
    shput(browser.document_event_listeners, name, scopes);

    return JS_UNDEFINED;
}

JSValue js_document_remove_event_listener(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 2)
        return JS_UNDEFINED;
    const char *event_name = JS_ToCString(ctx, argv[0]);
    js_scope *scopes = shget(browser.document_event_listeners, event_name);
    JS_FreeCString(ctx, event_name);

    JSValue handler = argv[1];
    assert(JS_IsFunction(ctx, handler));

    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        if (JS_VALUE_GET_PTR(scope.func) == JS_VALUE_GET_PTR(handler)) {
            script_value_deref(handler);
            JS_FreeValue(ctx, scope.func);
            arrdel(scopes, i);
            break;
        }
    }

    return JS_UNDEFINED;
}

JSValue js_canvas_add_event_listener(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 2)
        return JS_UNDEFINED;
    const char *event_name = JS_ToCString(ctx, argv[0]);
    char *name = (char *)malloc(strlen(event_name) + 1);
    strcpy(name, event_name);
    JS_FreeCString(ctx, event_name);

    JSValue handler = argv[1];
    assert(JS_IsFunction(ctx, handler));
    script_value_ref(handler);

    js_scope *scopes = shget(browser.canvas_event_listeners, name);
    js_scope scope = {.this = this_val, .func = handler};
    arrpush(scopes, scope);
    shput(browser.canvas_event_listeners, name, scopes);

    return JS_UNDEFINED;
}

JSValue js_canvas_remove_event_listener(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    if (argc < 2)
        return JS_UNDEFINED;
    const char *event_name = JS_ToCString(ctx, argv[0]);
    js_scope *scopes = shget(browser.canvas_event_listeners, event_name);
    JS_FreeCString(ctx, event_name);

    JSValue handler = argv[1];
    assert(JS_IsFunction(ctx, handler));

    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        if (JS_VALUE_GET_PTR(scope.func) == JS_VALUE_GET_PTR(handler)) {
            script_value_deref(handler);
            JS_FreeValue(ctx, scope.func);
            arrdel(scopes, i);
            break;
        }
    }

    return JS_UNDEFINED;
}

JSValue js_request_animation_frame(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 1)
        return JS_UNDEFINED;
    JSValue fn = argv[0];
    size_t index = hmgeti(browser.frame_callbacks, fn);
    if (index != -1)
        return JS_NewInt64(ctx, index);

    js_scope scope = {.this = this_val, .func = fn};
    script_value_ref(fn);
    hmput(browser.frame_callbacks, fn, scope);
    index = hmgeti(browser.frame_callbacks, fn);
    return JS_NewInt64(ctx, index);
}

JSValue js_cancel_animation_frame(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc >= 1) {
        int64_t index;
        JS_ToInt64(ctx, (int64_t *)&index, argv[0]);
        if (index == -1)
            return JS_UNDEFINED;
        JSValue callback = browser.frame_callbacks[index].key;
        hmdel(browser.frame_callbacks, callback);
    }
    return JS_UNDEFINED;
}

static JSValue js_console_log(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i) {
        const char *str = JS_ToCString(ctx, argv[i]);
        ULOG_INFO(str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_console_warn(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i) {
        const char *str = JS_ToCString(ctx, argv[i]);
        ULOG_WARN(str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_console_error(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i) {
        const char *str = JS_ToCString(ctx, argv[i]);
        ULOG_ERROR("{}", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_performance_now(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    // return JS_NewFloat64(ctx, glfwGetTime());
    return JS_NewFloat64(ctx, 0);
}

static JSValue js_get_window_inner_width(JSContext *ctx, JSValueConst _) {
    return JS_NewInt32(ctx, script_context_shared()->window->width);
}

static JSValue js_set_window_inner_width(JSContext *ctx, JSValueConst _, JSValueConst val) {
    JS_ToInt32(ctx, &script_context_shared()->window->width, val);
    return JS_UNDEFINED;
}

static JSValue js_get_window_inner_height(JSContext *ctx, JSValueConst _) {
    return JS_NewInt32(ctx, script_context_shared()->window->height);
}

static JSValue js_set_window_inner_height(JSContext *ctx, JSValueConst _, JSValueConst val) {
    JS_ToInt32(ctx, &script_context_shared()->window->height, val);
    return JS_UNDEFINED;
}

static JSValue js_get_window_device_pixel_ratio(JSContext *ctx, JSValueConst _) {
    return JS_NewFloat64(ctx, script_context_shared()->window->display_ratio);
}

static JSValue js_set_window_device_pixel_ratio(JSContext *ctx, JSValueConst _, JSValueConst val) {
    JS_ToFloat64(ctx, &script_context_shared()->window->display_ratio, val);
    return JS_UNDEFINED;
}

static JSClassID js_image_class_id;

static void js_image_finalizer(JSRuntime *rt, JSValue val) {
    js_image *image = JS_GetOpaque(val, js_image_class_id);
    if (!image)
        return;
    if (image->data)
        free(image->data);
    js_free_rt(rt, image);
    js_scope *scope = image->onload;
    if (JS_IsFunction(script_context_internal(), scope->func)) {
        script_value_deref(scope->func);
        JS_FreeValue(script_context_internal(), scope->func);
    }
    free(scope);
}

static JSValue js_image_ctor(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    js_image *image;
    JSValue obj = JS_UNDEFINED;
    JSValue proto;

    image = js_mallocz(ctx, sizeof(*image));
    image->channel = 4;
    if (!image)
        return JS_EXCEPTION;
    proto = JS_GetPropertyStr(ctx, new_target, "prototype");
    if (JS_IsException(proto))
        goto fail;
    obj = JS_NewObjectProtoClass(ctx, proto, js_image_class_id);
    JS_FreeValue(ctx, proto);
    if (JS_IsException(obj))
        goto fail;
    JS_SetOpaque(obj, image);
    return obj;

fail:
    js_free(ctx, image);
    JS_FreeValue(ctx, obj);
    return JS_EXCEPTION;
}

static JSClassDef js_image_class = {
    "Image", .finalizer = js_image_finalizer, .gc_mark = NULL, .call = NULL, .exotic = NULL,
};

static JSValue _image_set_src(JSContext *ctx, JSValueConst this_val, JSValueConst val) {
    js_image *image = JS_GetOpaque2(ctx, this_val, js_image_class_id);
    if (image == NULL)
        return JS_EXCEPTION;

    size_t len;
    JS_ToCStringLen(ctx, &len, val);
    const char *path = JS_ToCString(ctx, val);

    // check base64 header
    ustring base64;
    udata data;
    bool is_base64 = false;

    if (strncmp(path, "data:image", 10) == 0) {
        base64 = ustring_range((i8 *)path + 10, len);
        is_base64 = true;
        if (strncmp(path, "data:image/png;base64,", 22) == 0) {
            base64 = ustring_range((i8 *)path + 22, len);
        } else if (strncmp(path, "data:image/jpeg;base64,", 23) == 0) {
            base64 = ustring_range((i8 *)path + 23, len);
        }
        data = io_base64_decode(base64);
        image->data = io_load_image_memory(data, &image->width, &image->height, &image->channel, 4);
    } else {
        if (strncmp(path, "http", 4) == 0) {
            assert(false);
        } else {
            image->data = io_load_image(ustring_str((i8*)path), &image->width, &image->height, &image->channel, 4);
        }
    }

    JS_FreeCString(ctx, path);
    if (image->data == NULL) {
        ULOG_ERROR_FMT("Failed to load image: {}", path);
        return JS_EXCEPTION;
    }

    js_scope* scope = (js_scope*)image->onload;
    if (JS_IsFunction(script_context_internal(), scope->func))
        JS_Call(script_context_internal(), scope->func, this_val, 1, &this_val);

    return JS_UNDEFINED;
}

static JSValue _image_get_src(JSContext *ctx, JSValueConst this_val) {
    return JS_UNDEFINED;
}

static JSValue _image_magic_set_func(JSContext *ctx, JSValueConst this_val, JSValueConst val, int magic) {
    return JS_UNDEFINED;
}

static JSValue _image_magic_get_func(JSContext *ctx, JSValueConst this_val, int magic) {
    js_image *image = JS_GetOpaque2(ctx, this_val, js_image_class_id);
    switch (magic) {
        case 0:
            return JS_NewInt32(ctx, image->width);
        case 1:
            return JS_NewInt32(ctx, image->height);
        default:
            return JS_UNDEFINED;
    }
    return JS_UNDEFINED;
}

static JSValue js_set_image_onload(JSContext *ctx, JSValueConst this_val, JSValueConst val) {
    js_image *image = JS_GetOpaque2(ctx, this_val, js_image_class_id);
    if (image == NULL)
        return JS_EXCEPTION;
    script_value_ref(val);
    js_scope *onload = malloc(sizeof(js_scope));
    *onload = (js_scope){.this = this_val, .func = val};
    image->onload = onload;
    return JS_UNDEFINED;
}

static JSValue js_get_image_onload(JSContext *ctx, JSValueConst this_val) {
    js_image *image = JS_GetOpaque2(ctx, this_val, js_image_class_id);
    if (image == NULL)
        return JS_EXCEPTION;
    js_scope *onload = image->onload;
    return onload->func;
}

js_image *js_image_from_opaque(void *opaque) {
    JSValue val = *(JSValue*)opaque;
    return JS_GetOpaque(val, js_image_class_id);
}

static JSValue js_set_style_cursor(JSContext *ctx, JSValueConst this_val, JSValueConst val) { return JS_UNDEFINED; }

static JSValue js_get_style_cursor(JSContext *ctx, JSValueConst this_val) { return JS_UNDEFINED; }

static const JSCFunctionListEntry js_style_proto_funcs[] = {
    JS_CGETSET_DEF("cursor", js_get_style_cursor, js_set_style_cursor),
};

static const JSCFunctionListEntry js_image_proto_funcs[] = {
    JS_CGETSET_DEF("src", _image_get_src, _image_set_src),
    JS_CGETSET_MAGIC_DEF("width", _image_magic_get_func, _image_magic_set_func, 0),
    JS_CGETSET_MAGIC_DEF("height", _image_magic_get_func, _image_magic_set_func, 1),
    JS_CGETSET_DEF("onload", js_get_image_onload, js_set_image_onload),
};

static const JSCFunctionListEntry js_image_funcs[] = {
    JS_OBJECT_DEF("Image", js_image_proto_funcs, count_of(js_image_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static JSValue js_local_storage_set_item(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}
static JSValue js_local_storage_get_item(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_local_storage_proto_funcs[] = {
    JS_CFUNC_DEF("setItem", 2, js_local_storage_set_item),
    JS_CFUNC_DEF("getItem", 1, js_local_storage_get_item),
};

static const JSCFunctionListEntry js_window_proto_funcs[] = {
    JS_CFUNC_DEF("addEventListener", 3, js_window_add_event_listener),
    JS_CFUNC_DEF("removeEventListener", 2, js_window_remove_event_listener),
    JS_PROP_INT64_DEF("opacity", 0, JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
    JS_CGETSET_DEF("innerWidth", js_get_window_inner_width, js_set_window_inner_width),
    JS_CGETSET_DEF("innerHeight", js_get_window_inner_height, js_set_window_inner_height),
    JS_CGETSET_DEF("devicePixelRatio", js_get_window_device_pixel_ratio, js_set_window_device_pixel_ratio),
};

static const JSCFunctionListEntry js_window_funcs[] = {
    JS_OBJECT_DEF("window", js_window_proto_funcs, count_of(js_window_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_document_proto_funcs[] = {
    JS_CFUNC_DEF("addEventListener", 3, js_document_add_event_listener),
    JS_CFUNC_DEF("removeEventListener", 3, js_document_remove_event_listener),
};

static const JSCFunctionListEntry js_document_funcs[] = {
    JS_OBJECT_DEF("document", js_document_proto_funcs, count_of(js_document_proto_funcs),
                  JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_console_proto_funcs[] = {
    JS_CFUNC_DEF("log", 1, js_console_log),
    JS_CFUNC_DEF("warn", 1, js_console_warn),
    JS_CFUNC_DEF("error", 1, js_console_error),
};

static const JSCFunctionListEntry js_console_funcs[] = {
    JS_OBJECT_DEF("console", js_console_proto_funcs, count_of(js_console_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_performance_proto_funcs[] = {
    JS_CFUNC_DEF("now", 0, js_performance_now),
};

static const JSCFunctionListEntry js_performance_funcs[] = {
    JS_OBJECT_DEF("performance", js_performance_proto_funcs, count_of(js_performance_proto_funcs),
                  JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_canvas_proto_funcs[] = {
    JS_CFUNC_DEF("addEventListener", 3, js_canvas_add_event_listener),
    JS_CFUNC_DEF("removeEventListener", 2, js_canvas_remove_event_listener),
    JS_OBJECT_DEF("style", js_style_proto_funcs, count_of(js_style_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static const JSCFunctionListEntry js_canvas_funcs[] = {
    JS_OBJECT_DEF("canvas", js_canvas_proto_funcs, count_of(js_canvas_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

static JSClassID js_text_decoder_class_id;
static JSClassDef js_text_decode_class = {
    "TextDecoder", .finalizer = NULL, .gc_mark = NULL, .call = NULL, .exotic = NULL,
};

static JSValue js_text_decoder_decode(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    if (argc >= 1) {
        const char *str = JS_ToCString(ctx, argv[0]);
        ULOG_INFO("text_decoder_decode: {}", str);
    }

    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_text_decoder_proto_funcs[] = {
    JS_CFUNC_DEF("decode", 1, js_text_decoder_decode),
};

static JSValue js_text_decoder_ctor(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    return JS_NewObjectProtoClass(ctx, new_target, js_text_decoder_class_id);
}

static JSClassID js_weak_ref_class_id;
static JSClassDef js_weak_ref_class = {
    "WeakRef", .finalizer = NULL, .gc_mark = NULL, .call = NULL, .exotic = NULL,
};

static JSValue js_weak_ref_deref(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) { return JS_UNDEFINED; }

static const JSCFunctionListEntry js_weak_ref_proto_funcs[] = {
    JS_CFUNC_DEF("deref", 0, js_weak_ref_deref),
};

static JSValue js_weak_ref_ctor(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    return JS_NewObjectProtoClass(ctx, new_target, js_weak_ref_class_id);
}

#define CHECK_SCOPE                                                                                                            \
    JSContext *ctx = script_context_internal();                                                                                \
    JSRuntime *rt = script_runtime_internal();                                                                                 \
    if (ctx == NULL || rt == NULL)                                                                                             \
        return;

void script_browser_window_resize(int width, int height) {
    CHECK_SCOPE
    int index = (int)shgeti(browser.window_event_listeners, resize_event);
    if (index == -1)
        return;

    JSValue event = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, event, "type", JS_NewString(ctx, resize_event));
    JS_SetPropertyStr(ctx, event, "width", JS_NewInt32(ctx, width));
    JS_SetPropertyStr(ctx, event, "height", JS_NewInt32(ctx, height));
    js_scope *scopes = browser.window_event_listeners[index].value;
    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        if (JS_IsFunction(ctx, scope.func))
            JS_Call(ctx, scope.func, scope.this, 1, &event);
    }
    JS_FreeValue(ctx, event);
}

void script_browser_window_mouse_move(double x, double y) {
    CHECK_SCOPE

    script_context_t *context = script_context_shared();
    int index = (int)shgeti(browser.window_event_listeners, mousemove_event);
    if (index == -1)
        return;

    JSValue event = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, event, "type", JS_NewString(ctx, mousemove_event));
    JS_SetPropertyStr(ctx, event, "clientX", JS_NewFloat64(ctx, context->window->mouse_x));
    JS_SetPropertyStr(ctx, event, "clientY", JS_NewFloat64(ctx, context->window->mouse_y));
    js_scope *scopes = browser.window_event_listeners[index].value;

    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        assert(JS_IsLiveObject(rt, scope.func));
        if (JS_IsFunction(ctx, scope.func))
            JS_Call(ctx, scope.func, scope.this, 1, &event);
    }
    JS_FreeValue(ctx, event);
}

void script_browser_window_mouse_down(int button) {
    CHECK_SCOPE

    script_context_t *context = script_context_shared();
    int index = (int)shgeti(browser.window_event_listeners, mousedown_event);
    if (index == -1)
        return;

    JSValue event = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, event, "type", JS_NewString(ctx, mousedown_event));
    JS_SetPropertyStr(ctx, event, "button", JS_NewInt32(ctx, button));
    JS_SetPropertyStr(ctx, event, "clientX", JS_NewFloat64(ctx, context->window->mouse_x));
    JS_SetPropertyStr(ctx, event, "clientY", JS_NewFloat64(ctx, context->window->mouse_y));
    js_scope *scopes = browser.window_event_listeners[index].value;
    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        assert(JS_IsLiveObject(rt, scope.func));
        if (JS_IsFunction(ctx, scope.func))
            JS_Call(ctx, scope.func, scope.this, 1, &event);
    }
    JS_FreeValue(ctx, event);
}

void script_browser_window_mouse_up(int button) {
    CHECK_SCOPE

    script_context_t *context = script_context_shared();
    int index = (int)shgeti(browser.window_event_listeners, mouseup_event);
    if (index == -1)
        return;

    JSValue event = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, event, "type", JS_NewString(ctx, mouseup_event));
    JS_SetPropertyStr(ctx, event, "button", JS_NewInt32(ctx, button));
    JS_SetPropertyStr(ctx, event, "clientX", JS_NewFloat64(ctx, context->window->mouse_x));
    JS_SetPropertyStr(ctx, event, "clientY", JS_NewFloat64(ctx, context->window->mouse_y));
    js_scope *scopes = browser.window_event_listeners[index].value;
    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        JS_Call(ctx, scope.func, scope.this, 1, &event);
    }
    JS_FreeValue(ctx, event);
}

void script_browser_window_mouse_scroll(double x, double y) {
    CHECK_SCOPE

    int index = (int)shgeti(browser.window_event_listeners, wheel_event);
    if (index == -1)
        return;

    JSValue event = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, event, "type", JS_NewString(ctx, wheel_event));
    JS_SetPropertyStr(ctx, event, "deltaX", JS_NewFloat64(ctx, x));
    JS_SetPropertyStr(ctx, event, "deltaY", JS_NewFloat64(ctx, y));
    js_scope *scopes = browser.window_event_listeners[index].value;
    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        assert(JS_IsLiveObject(rt, scope.func));
        JS_Call(ctx, scope.func, scope.this, 1, &event);
    }
    JS_FreeValue(ctx, event);
}

void script_browser_document_key_down(int key) {
    CHECK_SCOPE

    int index = (int)shgeti(browser.document_event_listeners, keydown_event);
    if (index == -1)
        return;

    JSValue event = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, event, "type", JS_NewString(ctx, keydown_event));
    JS_SetPropertyStr(ctx, event, "key", JS_NewInt32(ctx, key));
    js_scope *scopes = browser.document_event_listeners[index].value;
    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        assert(JS_IsLiveObject(rt, scope.func));
        JS_Call(ctx, scope.func, scope.this, 1, &event);
    }
    JS_FreeValue(ctx, event);
}

void script_browser_document_key_up(int key) {
    CHECK_SCOPE

    int index = (int)shgeti(browser.document_event_listeners, keyup_event);
    if (index == -1)
        return;

    JSValue event = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, event, "type", JS_NewString(ctx, keyup_event));
    JS_SetPropertyStr(ctx, event, "key", JS_NewInt32(ctx, key));
    js_scope *scopes = browser.document_event_listeners[index].value;
    for (int i = 0, l = (int)arrlen(scopes); i < l; ++i) {
        js_scope scope = scopes[i];
        assert(JS_IsLiveObject(rt, scope.func));
        JS_Call(ctx, scope.func, scope.this, 1, &event);
    }
    JS_FreeValue(ctx, event);
}

void script_browser_tick(void) {
    CHECK_SCOPE

    JSValue ret;
    for (int i = 0, l = (int)hmlen(browser.frame_callbacks); i < l; ++i) {
        js_frame_callback cb = browser.frame_callbacks[i];
        if (!JS_IsFunction(ctx, cb.key))
            continue;
        assert(JS_IsLiveObject(rt, cb.value.func));
        ret = JS_Call(ctx, cb.value.func, cb.value.this, 0, NULL);
        if (JS_IsException(ret)) {
            js_std_dump_error(ctx);
            break;
        }
    }
}

void create_classes(JSRuntime *rt) {
    JS_NewClassID(&js_image_class_id);
    JS_NewClass(rt, js_image_class_id, &js_image_class);

    JS_NewClassID(&js_text_decoder_class_id);
    JS_NewClass(rt, js_text_decoder_class_id, &js_text_decode_class);

    JS_NewClassID(&js_weak_ref_class_id);
    JS_NewClass(rt, js_weak_ref_class_id, &js_weak_ref_class);
}

void script_browser_setup(void) {
    CHECK_SCOPE

    JSValue global = JS_GetGlobalObject(ctx);
    create_classes(rt);

    JS_SetPropertyStr(ctx, global, "requestAnimationFrame",
                      JS_NewCFunction(ctx, js_request_animation_frame, "requestAnimationFrame", 1));
    JS_SetPropertyStr(ctx, global, "cancelAnimationFrame",
                      JS_NewCFunction(ctx, js_request_animation_frame, "cancelAnimationFrame", 1));

    JS_SetPropertyFunctionList(ctx, global, js_document_funcs, count_of(js_document_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_window_funcs, count_of(js_window_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_canvas_funcs, count_of(js_canvas_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_performance_funcs, count_of(js_performance_funcs));
    JS_SetPropertyFunctionList(ctx, global, js_console_funcs, count_of(js_console_funcs));
    JS_SetPropertyStr(ctx, global, "self", JS_NewObject(ctx));

    // Image class
    JSValue image_proto = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, image_proto, js_image_proto_funcs, count_of(js_image_proto_funcs));
    JSValue image_class = JS_NewCFunction2(ctx, js_image_ctor, "Image", 0, JS_CFUNC_constructor, 0);
    JS_SetConstructor(ctx, image_class, image_proto);
    JS_SetClassProto(ctx, js_image_class_id, image_proto);
    JS_SetPropertyStr(ctx, global, "Image", image_class);

    // class defined
    JSValue text_decoder_proto = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, text_decoder_proto, js_text_decoder_proto_funcs, count_of(js_text_decoder_proto_funcs));
    JS_SetClassProto(ctx, js_text_decoder_class_id, text_decoder_proto);
    JSValue text_decoder_ctor = JS_NewCFunction2(ctx, js_text_decoder_ctor, "TextDecoder", 1, JS_CFUNC_constructor, 0);
    JS_SetConstructor(ctx, text_decoder_ctor, text_decoder_proto);
    JS_SetPropertyStr(ctx, global, "TextDecoder", text_decoder_ctor);

    JSValue weak_ref_proto = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, weak_ref_proto, js_weak_ref_proto_funcs, count_of(js_weak_ref_proto_funcs));
    JS_SetClassProto(ctx, js_weak_ref_class_id, weak_ref_proto);
    JSValue weak_ref_ctor = JS_NewCFunction2(ctx, js_weak_ref_ctor, "WeakRef", 1, JS_CFUNC_constructor, 0);
    JS_SetConstructor(ctx, weak_ref_ctor, weak_ref_proto);
    JS_SetPropertyStr(ctx, global, "WeakRef", weak_ref_ctor);

    JSValue navigator = JS_GetPropertyStr(ctx, global, "navigator");
    JS_SetPropertyStr(ctx, navigator, "userAgent", JS_NewString(ctx, USER_AGENT));
    JS_FreeValue(ctx, navigator);

    JSValue localStorage = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, localStorage, js_local_storage_proto_funcs, count_of(js_local_storage_proto_funcs));
    JS_SetPropertyStr(ctx, global, "localStorage", localStorage);

    JS_FreeValue(ctx, global);
}

#define LISTENER_CLR(listeners)                                                                                                \
    for (int i = 0, il = (int)shlen((listeners)); i < il; ++i) {                                                               \
        js_scope *scopes = (listeners)[i].value;                                                                               \
        for (int j = 0, jl = (int)arrlen(scopes); j < jl; ++j) {                                                               \
            js_scope scope = scopes[j];                                                                                        \
            script_value_deref(scope.func);                                                                                    \
            JS_FreeValue(ctx, scope.func);                                                                                     \
        }                                                                                                                      \
        arrsetlen(scopes, 0);                                                                                                  \
    }

void script_listeners_cleanup() {
    JSContext *ctx = script_context_internal();
    if (ctx == NULL)
        return;

    js_listener_hm *window_event_listeners = browser.window_event_listeners;
    js_listener_hm *document_event_listeners = browser.document_event_listeners;
    js_listener_hm *canvas_event_listeners = browser.canvas_event_listeners;
    js_frame_callback *frame_callbacks = browser.frame_callbacks;

    LISTENER_CLR(window_event_listeners);
    LISTENER_CLR(document_event_listeners);
    LISTENER_CLR(canvas_event_listeners);

    for (int i = 0, il = (int)hmlen(frame_callbacks); i < il; ++i) {
        js_frame_callback cb = frame_callbacks[i];
        script_value_deref(cb.value.func);
        JS_FreeValue(ctx, cb.key);
        hmdel(frame_callbacks, cb.key);
    }
}

void script_browser_cleanup(void) {
    script_listeners_cleanup();
}
