#include "script/api.h"
#include <quickjs/quickjs.h>

#define CHECK_SCOPE                                                                                                            \
    JSContext *ctx = script_context_internal();                                                                                \
    JSRuntime *rt = script_runtime_internal();                                                                                 \
    if (ctx == NULL || rt == NULL)                                                                                             \
        return;

void webgpu_register(void) {
    CHECK_SCOPE

    JSValue global = JS_GetGlobalObject(ctx);
    JSValue navigator = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, navigator, "gpu", JS_NewObject(ctx));
    JS_SetPropertyStr(ctx, global, "navigator", navigator);
}

void webgpu_cleanup(void) {}