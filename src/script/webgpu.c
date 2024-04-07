#include "foundation/logger.h"
#include "script/api.h"
#include <quickjs/quickjs.h>

#define CHECK_SCOPE                                                                                                            \
    JSContext *ctx = script_context_internal();                                                                                \
    JSRuntime *rt = script_runtime_internal();                                                                                 \
    if (ctx == NULL || rt == NULL)                                                                                             \
        return;

static const JSCFunctionListEntry _gpu_texture_usage_proto[] = {
    JS_PROP_INT32_DEF("COPY_SRC", 0x01, JS_PROP_ENUMERABLE),
    JS_PROP_INT32_DEF("COPY_DST", 0x02, JS_PROP_ENUMERABLE),
    JS_PROP_INT32_DEF("TEXTURE_BINDING ", 0x04, JS_PROP_ENUMERABLE),
    JS_PROP_INT32_DEF("STORAGE_BINDING ", 0x08, JS_PROP_ENUMERABLE),
    JS_PROP_INT32_DEF("RENDER_ATTACHMENT", 0x10, JS_PROP_ENUMERABLE),
};
static const JSCFunctionListEntry _gpu_texture_usage[] = {
    JS_OBJECT_DEF("GPUTextureUsage", _gpu_texture_usage_proto, count_of(_gpu_texture_usage_proto),  0)
};

void _webgpu_register_constants(JSContext *ctx) {
    JSValue global = JS_GetGlobalObject(ctx);

    JS_SetPropertyFunctionList(ctx, global, _gpu_texture_usage, count_of(_gpu_texture_usage));

    JS_FreeValue(ctx, global);
}

static JSValue _gpu_texture_magic_get(JSContext *ctx, JSValueConst this_val, int magic) {
    switch (magic) {
        case 0: return JS_NewInt32(ctx, 0);
        case 1: return JS_NewInt32(ctx, 0);
    }
    return JS_UNDEFINED;
}

static JSValue _gpu_texture_magic_set(JSContext *ctx, JSValueConst this_val, JSValueConst val, int magic) {
    return JS_UNDEFINED;
}

static JSValue _gpu_texture_create_view(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_texture_proto_funcs[] = {
    JS_CFUNC_DEF("createView", 0, _gpu_texture_create_view),
    JS_CGETSET_MAGIC_DEF("width", _gpu_texture_magic_get, _gpu_texture_magic_set, 0),
    JS_CGETSET_MAGIC_DEF("height", _gpu_texture_magic_get, _gpu_texture_magic_set, 1),
    JS_CGETSET_MAGIC_DEF("depth", _gpu_texture_magic_get, _gpu_texture_magic_set, 2),
    JS_CGETSET_MAGIC_DEF("arrayLayerCount", _gpu_texture_magic_get, _gpu_texture_magic_set, 3),
    JS_CGETSET_MAGIC_DEF("mipLevelCount", _gpu_texture_magic_get, _gpu_texture_magic_set, 4),
    JS_CGETSET_MAGIC_DEF("sampleCount", _gpu_texture_magic_get, _gpu_texture_magic_set, 5),
    JS_CGETSET_MAGIC_DEF("dimension", _gpu_texture_magic_get, _gpu_texture_magic_set, 6),
    JS_CGETSET_MAGIC_DEF("format", _gpu_texture_magic_get, _gpu_texture_magic_set, 7),
};

static JSValue _gpu_device_create_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue texture = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, texture, js_texture_proto_funcs, count_of(js_texture_proto_funcs));
    return texture;
}

static const JSCFunctionListEntry js_device_proto_funcs[] = {
    JS_CFUNC_DEF("createTexture", 1, _gpu_device_create_texture)
};

static JSValue script_adapter_request_device(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    // Create a new promise
    JSValue resolver[2];
    JSValue promise = JS_NewPromiseCapability(ctx, resolver);

    if (JS_IsException(promise) || !JS_IsFunction(ctx, resolver[0]) || !JS_IsFunction(ctx, resolver[1])) {
        JS_FreeValue(ctx, promise);
        return JS_EXCEPTION;
    }
    JSValue device = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, device, js_device_proto_funcs, count_of(js_device_proto_funcs));
    JS_Call(ctx, resolver[0], JS_UNDEFINED, 1, &device);

    JS_FreeValue(ctx, resolver[0]);
    JS_FreeValue(ctx, resolver[1]);
    return promise;
}

static const JSCFunctionListEntry js_adapter_proto_funcs[] = {
    JS_CFUNC_DEF("requestDevice", 0, script_adapter_request_device)
};

static JSValue script_webgpu_request_adapter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    // Create a new promise
    JSValue resolver[2];
    JSValue promise = JS_NewPromiseCapability(ctx, resolver);
    ULOG_INFO("requesting gpu adapter begin.");

    if (JS_IsException(promise) || !JS_IsFunction(ctx, resolver[0]) || !JS_IsFunction(ctx, resolver[1])) {
        JS_FreeValue(ctx, promise);
        return JS_EXCEPTION;
    }
    ULOG_INFO("requesting gpu adapter");
    JSValue adapter = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, adapter, js_adapter_proto_funcs, count_of(js_adapter_proto_funcs));
    JS_Call(ctx, resolver[0], JS_UNDEFINED, 1, &adapter);
    JS_FreeValue(ctx, adapter);
    JS_FreeValue(ctx, resolver[0]);
    JS_FreeValue(ctx, resolver[1]);
    return promise;
}

static JSValue script_webgpu_get_preferred_canvas_format(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
  return JS_NewString(ctx, "bgra8unorm");
}

static const JSCFunctionListEntry js_gpu_proto_funcs[] = {
    JS_CFUNC_DEF("requestAdapter", 0, script_webgpu_request_adapter),
    JS_CFUNC_DEF("getPreferredCanvasFormat", 0, script_webgpu_get_preferred_canvas_format)
};

static const JSCFunctionListEntry js_gpu_funcs[] = {
    JS_OBJECT_DEF("gpu", js_gpu_proto_funcs, count_of(js_gpu_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE)
};

static JSValue script_webgpu_gpu_context_set_configure(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue _context_get_current_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue texture = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, texture, js_texture_proto_funcs, count_of(js_texture_proto_funcs));
    return texture;
}

static const JSCFunctionListEntry js_gpu_context_proto_funcs[] = {
    JS_CFUNC_DEF(.name="configure", 1, script_webgpu_gpu_context_set_configure),
    JS_CFUNC_DEF(.name="getCurrentTexture", 0, _context_get_current_texture),
};

void script_webgpu_register(void) {
    CHECK_SCOPE

    _webgpu_register_constants(ctx);

    JSValue global = JS_GetGlobalObject(ctx);
    // set gpu to navigator
    JSValue navigator = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, navigator, js_gpu_funcs, count_of(js_gpu_funcs));
    JS_SetPropertyStr(ctx, global, "navigator", navigator);

    // set gpu context to global
    JSValue gpu_ctx = JS_NewObject(ctx);
    JS_SetPropertyFunctionList(ctx, gpu_ctx, js_gpu_context_proto_funcs, count_of(js_gpu_context_proto_funcs));
    JS_SetPropertyStr(ctx, global, "GPUContext", gpu_ctx);

    JS_FreeValue(ctx, global);
}

void script_webgpu_cleanup(void) {
    CHECK_SCOPE
}