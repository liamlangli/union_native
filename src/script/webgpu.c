#include "script/api.h"
#include <quickjs/quickjs.h>

#define CHECK_SCOPE                                                                                                            \
    JSContext *ctx = script_context_internal();                                                                                \
    JSRuntime *rt = script_runtime_internal();                                                                                 \
    if (ctx == NULL || rt == NULL)                                                                                             \
        return;

static JSValue script_webgpu_request_adapter(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue resolve, reject;
    JSValue promise = JS_NewPromiseCapability(ctx, (JSValue[]){resolve, reject});
    
    JSValue device = JS_NewObject(ctx);
    JS_Call(ctx, resolve, JS_UNDEFINED, 1, &device);
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

void script_webgpu_register(void) {
    CHECK_SCOPE

    JSValue global = JS_GetGlobalObject(ctx);
    JSValue navigator = JS_GetPropertyStr(ctx, global, "navigator");
    JS_SetPropertyFunctionList(ctx, navigator, js_gpu_funcs, count_of(js_gpu_funcs));
    JS_FreeValue(ctx, navigator);
    JS_FreeValue(ctx, global);
}

void script_webgpu_cleanup(void) {
    CHECK_SCOPE
}