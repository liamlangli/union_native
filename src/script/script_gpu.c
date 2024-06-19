#include "script_gpu.h"
#include "script/script_context.h"
#include "foundation/global.h"
#include "gpu/gpu.h"

#include <quickjs/quickjs-libc.h>
#include <quickjs/quickjs.h>

static JSValue js_gpu_request_device(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_func(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_create_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue desc = argv[0];

    gpu_buffer_desc _desc;
    gpu_buffer buffer = gpu_create_buffer(&_desc);

    JSValue obj = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, obj, "id", JS_NewInt32(ctx, buffer.id));
    return obj;
}

static JSValue js_gpu_create_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue desc = argv[0];

    gpu_texture_desc _desc;
    gpu_texture texture = gpu_create_texture(&_desc);

    JSValue obj = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, obj, "id", JS_NewInt32(ctx, texture.id));
    return obj;
}

static JSValue js_gpu_create_sampler(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue desc = argv[0];

    gpu_sampler_desc _desc;
    gpu_sampler sampler = gpu_create_sampler(&_desc);

    JSValue obj = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, obj, "id", JS_NewInt32(ctx, sampler.id));
    return obj;
}

static JSValue js_gpu_create_pipeline(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue desc = argv[0];

    gpu_pipeline_desc _desc;
    gpu_pipeline pipeline = gpu_create_pipeline(&_desc);

    JSValue obj = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, obj, "id", JS_NewInt32(ctx, pipeline.id));
    return obj;
}

static JSValue js_gpu_create_binding(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue desc = argv[0];

    gpu_binding_desc _desc;
    gpu_binding binding = gpu_create_binding(&_desc);

    JSValue obj = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, obj, "id", JS_NewInt32(ctx, binding.id));
    return obj;
}

static JSValue js_gpu_create_mesh(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue desc = argv[0];

    gpu_mesh_desc _desc;
    gpu_mesh mesh = gpu_create_mesh(&_desc);

    JSValue obj = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, obj, "id", JS_NewInt32(ctx, mesh.id));
    return obj;
}

static JSValue js_gpu_create_render_pass(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue desc = argv[0];

    gpu_render_pass_desc _desc;
    gpu_render_pass render_pass = gpu_create_render_pass(&_desc);

    JSValue obj = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, obj, "id", JS_NewInt32(ctx, render_pass.id));
    return obj;
}

static JSValue js_gpu_pipeline_get_reflection(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue pipeline = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, pipeline);

    gpu_pipeline_reflection reflection = gpu_pipeline_get_reflection((gpu_pipeline){id});

    JSValue obj = JS_NewObject(ctx);
    // JS_SetPropertyStr(ctx, obj, "num_bindings", JS_NewInt32(ctx, reflection.num_bindings));
    // JS_SetPropertyStr(ctx, obj, "num_attributes", JS_NewInt32(ctx, reflection.num_attributes));
    // JS_SetPropertyStr(ctx, obj, "num_uniforms", JS_NewInt32(ctx, reflection.num_uniforms));
    return obj;
}

static JSValue js_gpu_destroy_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue buffer = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, buffer);
    gpu_destroy_buffer((gpu_buffer){id});
    return JS_UNDEFINED;
}

static JSValue js_gpu_destroy_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue texture = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, texture);
    gpu_destroy_texture((gpu_texture){id});
    return JS_UNDEFINED;
}

static JSValue js_gpu_destroy_sampler(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue sampler = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, sampler);
    gpu_destroy_sampler((gpu_sampler){id});
    return JS_UNDEFINED;
}

static JSValue js_gpu_destroy_pipeline(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue pipeline = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, pipeline);
    gpu_destroy_pipeline((gpu_pipeline){id});
    return JS_UNDEFINED;
}

static JSValue js_gpu_destroy_binding(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue binding = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, binding);
    gpu_destroy_binding((gpu_binding){id});
    return JS_UNDEFINED;
}

static JSValue js_gpu_destroy_mesh(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue mesh = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, mesh);
    gpu_destroy_mesh((gpu_mesh){id});
    return JS_UNDEFINED;
}

static JSValue js_gpu_destroy_render_pass(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue render_pass = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, render_pass);
    gpu_destroy_render_pass((gpu_render_pass){id});
    return JS_UNDEFINED;
}

static JSValue js_gpu_update_buffer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_update_texture(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_gpu_texture_set_sampler(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_begin_render_pass(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_end_pass(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_set_pipeline(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_set_binding(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_UNDEFINED;
}

static JSValue js_gpu_set_mesh(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue mesh = argv[0];
    u32 id;
    JS_ToUint32(ctx, &id, mesh);
    gpu_set_mesh((gpu_mesh){id});
    return JS_UNDEFINED;
}

static JSValue js_gpu_commit(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    gpu_commit();
    return JS_UNDEFINED;
}


static const JSCFunctionListEntry js_union_proto_func[] = {
    JS_CFUNC_DEF("gpu_request_device", 0, js_gpu_request_device),
    JS_CFUNC_DEF("gpu_create_buffer", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_create_texture", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_create_sampler", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_create_pipeline", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_create_binding", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_create_mesh", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_create_render_pass", 1, js_gpu_func),

    JS_CFUNC_DEF("gpu_pipeline_get_reflection", 1, js_gpu_func),

    JS_CFUNC_DEF("gpu_destroy_buffer", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_destroy_texture", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_destroy_sampler", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_destroy_pipeline", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_destroy_binding", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_destroy_mesh", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_destroy_render_pass", 1, js_gpu_func),

    JS_CFUNC_DEF("gpu_update_buffer", 0, js_gpu_func),
    JS_CFUNC_DEF("gpu_update_texture", 0, js_gpu_func),
    JS_CFUNC_DEF("gpu_gpu_texture_set_sampler", 0, js_gpu_func),

    JS_CFUNC_DEF("gpu_begin_render_pass", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_end_pass", 1, js_gpu_func),

    JS_CFUNC_DEF("gpu_set_pipeline", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_set_binding", 1, js_gpu_func),
    JS_CFUNC_DEF("gpu_set_mesh", 1, js_gpu_func),

    JS_CFUNC_DEF("gpu_commit", 1, js_gpu_func),
};

static const JSCFunctionListEntry js_union_func[] = {
    JS_OBJECT_DEF("native_adapter", js_union_proto_func, count_of(js_union_proto_func), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};

void script_gpu_setup(void) {
    JSContext *ctx = script_context_internal();                                                                                \
    JSRuntime *rt = script_runtime_internal();                                                                                 \
    if (ctx == NULL || rt == NULL)                                                                                             \
        return;
    JSValue global = JS_GetGlobalObject(ctx);
    JS_SetPropertyFunctionList(ctx, global, js_union_func, count_of(js_union_func));
    JS_FreeValue(ctx, global);
}

void script_gpu_cleanup(void) {
    
}