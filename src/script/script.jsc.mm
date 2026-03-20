#if defined(SCRIPT_BACKEND_JSC)

#import <JavaScriptCore/JavaScriptCore.h>

#include "script/script.h"
#include "core/global.h"
#include "core/io.h"
#include "core/logger.h"
#include "core/network.h"
#include "core/text.h"
#include "script/script_gpu.h"
#include "ui/ui_dev_tool.h"
#include "ui/ui_renderer.h"
#include "ui/ui_state.h"
#include "webgpu_context.h"

#include <chrono>
#include <cstring>
#include <string>
#include <vector>

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

static script_t g_ctx = {};
static i8 g_db_bundle_name[] = "db";
static i8 g_http_prefix[] = "http";

struct JscModule {
    JSContextGroupRef group = nullptr;
    JSGlobalContextRef ctx  = nullptr;
};
static JscModule g_mod = {};
static std::vector<JSObjectRef> s_raf_queue;
static double s_start_ms = 0.0;

static double now_ms() {
    using namespace std::chrono;
    return (double)duration_cast<microseconds>(
        high_resolution_clock::now().time_since_epoch()).count() / 1000.0;
}

// ---------------------------------------------------------------------------
// JSC helper utilities
// ---------------------------------------------------------------------------

static JSStringRef jsc_str(const char *s) {
    return JSStringCreateWithUTF8CString(s ? s : "");
}

static void jsc_set_prop(JSContextRef ctx, JSObjectRef obj, const char *name, JSValueRef val) {
    JSStringRef key = jsc_str(name);
    JSObjectSetProperty(ctx, obj, key, val, kJSPropertyAttributeNone, nullptr);
    JSStringRelease(key);
}

static void jsc_set_fn(JSContextRef ctx, JSObjectRef obj, const char *name,
                       JSObjectCallAsFunctionCallback cb) {
    JSStringRef nameStr = jsc_str(name);
    JSObjectRef fn = JSObjectMakeFunctionWithCallback(ctx, nameStr, cb);
    JSStringRelease(nameStr);
    jsc_set_prop(ctx, obj, name, fn);
}

static JSValueRef jsc_get_prop(JSContextRef ctx, JSObjectRef obj, const char *name) {
    JSStringRef key = jsc_str(name);
    JSValueRef val = JSObjectGetProperty(ctx, obj, key, nullptr);
    JSStringRelease(key);
    return val;
}

static std::string jsc_to_std(JSContextRef ctx, JSValueRef val) {
    if (!val || JSValueIsNull(ctx, val) || JSValueIsUndefined(ctx, val)) return "";
    JSStringRef str = JSValueToStringCopy(ctx, val, nullptr);
    if (!str) return "";
    size_t len = JSStringGetMaximumUTF8CStringSize(str);
    std::string result(len, '\0');
    size_t actual = JSStringGetUTF8CString(str, result.data(), len);
    JSStringRelease(str);
    if (actual > 0) result.resize(actual - 1);
    return result;
}

static double jsc_to_double(JSContextRef ctx, JSValueRef val) {
    if (!val) return 0.0;
    return JSValueToNumber(ctx, val, nullptr);
}

// Create a promise using JS Promise constructor (JSObjectMakePromise not in C API here)
static JSObjectRef jsc_make_promise(JSContextRef ctx, JSObjectRef *out_resolve, JSObjectRef *out_reject) {
    const char *src =
        "(function(){"
        "var r,j;"
        "var p=new Promise(function(a,b){r=a;j=b;});"
        "return [p,r,j];"
        "})()";
    JSStringRef srcStr = jsc_str(src);
    JSValueRef exc = nullptr;
    JSValueRef arr = JSEvaluateScript(ctx, srcStr, nullptr, nullptr, 1, &exc);
    JSStringRelease(srcStr);
    if (exc || !arr || !JSValueIsObject(ctx, arr)) return nullptr;
    JSObjectRef arrObj = (JSObjectRef)arr;
    JSValueRef p = JSObjectGetPropertyAtIndex(ctx, arrObj, 0, nullptr);
    JSValueRef r = JSObjectGetPropertyAtIndex(ctx, arrObj, 1, nullptr);
    JSValueRef j = JSObjectGetPropertyAtIndex(ctx, arrObj, 2, nullptr);
    if (out_resolve) *out_resolve = r ? (JSObjectRef)r : nullptr;
    if (out_reject)  *out_reject  = j ? (JSObjectRef)j : nullptr;
    return (p && JSValueIsObject(ctx, p)) ? (JSObjectRef)p : nullptr;
}

static JSObjectRef jsc_resolved_promise(JSContextRef ctx, JSValueRef value) {
    JSObjectRef resolve = nullptr, reject = nullptr;
    JSObjectRef promise = jsc_make_promise(ctx, &resolve, &reject);
    if (!promise) return (JSObjectRef)JSValueMakeNull(ctx);
    if (resolve) {
        JSValueRef args[] = { value };
        JSObjectCallAsFunction(ctx, resolve, nullptr, 1, args, nullptr);
    }
    return promise;
}

static void jsc_log_exception(JSContextRef ctx, JSValueRef exception, const char *tag) {
    if (!exception) return;
    std::string msg = jsc_to_std(ctx, exception);
    LOG_ERROR(tag ? tag : "jsc", msg.c_str());
}

// ---------------------------------------------------------------------------
// String → WebGPU enum helpers
// ---------------------------------------------------------------------------

static WGPUTextureFormat str_to_texture_format(const std::string &s) {
    if (s == "bgra8unorm")           return WGPUTextureFormat_BGRA8Unorm;
    if (s == "rgba8unorm")           return WGPUTextureFormat_RGBA8Unorm;
    if (s == "rgba8unorm-srgb")      return WGPUTextureFormat_RGBA8UnormSrgb;
    if (s == "rgba16float")          return WGPUTextureFormat_RGBA16Float;
    if (s == "rgba32float")          return WGPUTextureFormat_RGBA32Float;
    if (s == "r32float")             return WGPUTextureFormat_R32Float;
    if (s == "depth24plus")          return WGPUTextureFormat_Depth24Plus;
    if (s == "depth24plus-stencil8") return WGPUTextureFormat_Depth24PlusStencil8;
    if (s == "depth32float")         return WGPUTextureFormat_Depth32Float;
    return WGPUTextureFormat_BGRA8Unorm;
}

static WGPUPrimitiveTopology str_to_topology(const std::string &s) {
    if (s == "point-list")     return WGPUPrimitiveTopology_PointList;
    if (s == "line-list")      return WGPUPrimitiveTopology_LineList;
    if (s == "line-strip")     return WGPUPrimitiveTopology_LineStrip;
    if (s == "triangle-strip") return WGPUPrimitiveTopology_TriangleStrip;
    return WGPUPrimitiveTopology_TriangleList;
}

static WGPUCullMode str_to_cull_mode(const std::string &s) {
    if (s == "front") return WGPUCullMode_Front;
    if (s == "back")  return WGPUCullMode_Back;
    return WGPUCullMode_None;
}

static WGPUFrontFace str_to_front_face(const std::string &s) {
    if (s == "cw") return WGPUFrontFace_CW;
    return WGPUFrontFace_CCW;
}

static WGPULoadOp str_to_load_op(const std::string &s) {
    if (s == "load") return WGPULoadOp_Load;
    return WGPULoadOp_Clear;
}

static WGPUStoreOp str_to_store_op(const std::string &s) {
    if (s == "discard") return WGPUStoreOp_Discard;
    return WGPUStoreOp_Store;
}

static WGPUFilterMode str_to_filter(const std::string &s) {
    if (s == "linear") return WGPUFilterMode_Linear;
    return WGPUFilterMode_Nearest;
}

static WGPUMipmapFilterMode str_to_mipmap_filter(const std::string &s) {
    if (s == "linear") return WGPUMipmapFilterMode_Linear;
    return WGPUMipmapFilterMode_Nearest;
}

static WGPUAddressMode str_to_address_mode(const std::string &s) {
    if (s == "repeat")        return WGPUAddressMode_Repeat;
    if (s == "mirror-repeat") return WGPUAddressMode_MirrorRepeat;
    return WGPUAddressMode_ClampToEdge;
}

static WGPUIndexFormat str_to_index_format(const std::string &s) {
    if (s == "uint32") return WGPUIndexFormat_Uint32;
    return WGPUIndexFormat_Uint16;
}

static WGPUVertexFormat str_to_vertex_format(const std::string &s) {
    if (s == "float32")   return WGPUVertexFormat_Float32;
    if (s == "float32x2") return WGPUVertexFormat_Float32x2;
    if (s == "float32x3") return WGPUVertexFormat_Float32x3;
    if (s == "float32x4") return WGPUVertexFormat_Float32x4;
    if (s == "uint32")    return WGPUVertexFormat_Uint32;
    if (s == "uint32x2")  return WGPUVertexFormat_Uint32x2;
    if (s == "uint32x3")  return WGPUVertexFormat_Uint32x3;
    if (s == "uint32x4")  return WGPUVertexFormat_Uint32x4;
    if (s == "sint32")    return WGPUVertexFormat_Sint32;
    if (s == "sint32x2")  return WGPUVertexFormat_Sint32x2;
    if (s == "sint32x3")  return WGPUVertexFormat_Sint32x3;
    if (s == "sint32x4")  return WGPUVertexFormat_Sint32x4;
    if (s == "uint8x4")   return WGPUVertexFormat_Uint8x4;
    if (s == "unorm8x4")  return WGPUVertexFormat_Unorm8x4;
    return WGPUVertexFormat_Float32x4;
}

static WGPUVertexStepMode str_to_step_mode(const std::string &s) {
    if (s == "instance") return WGPUVertexStepMode_Instance;
    return WGPUVertexStepMode_Vertex;
}

static WGPUBlendFactor str_to_blend_factor(const std::string &s) {
    if (s == "zero")                return WGPUBlendFactor_Zero;
    if (s == "one")                 return WGPUBlendFactor_One;
    if (s == "src-alpha")           return WGPUBlendFactor_SrcAlpha;
    if (s == "one-minus-src-alpha") return WGPUBlendFactor_OneMinusSrcAlpha;
    if (s == "dst-alpha")           return WGPUBlendFactor_DstAlpha;
    if (s == "one-minus-dst-alpha") return WGPUBlendFactor_OneMinusDstAlpha;
    if (s == "src-color")           return WGPUBlendFactor_Src;
    if (s == "dst-color")           return WGPUBlendFactor_Dst;
    return WGPUBlendFactor_One;
}

static WGPUBlendOperation str_to_blend_op(const std::string &s) {
    if (s == "subtract")         return WGPUBlendOperation_Subtract;
    if (s == "reverse-subtract") return WGPUBlendOperation_ReverseSubtract;
    if (s == "min")              return WGPUBlendOperation_Min;
    if (s == "max")              return WGPUBlendOperation_Max;
    return WGPUBlendOperation_Add;
}

// ---------------------------------------------------------------------------
// Descriptor field helpers
// ---------------------------------------------------------------------------

static JSObjectRef jsc_get_obj(JSContextRef ctx, JSObjectRef obj, const char *name) {
    JSValueRef val = jsc_get_prop(ctx, obj, name);
    if (!val || !JSValueIsObject(ctx, val)) return nullptr;
    return (JSObjectRef)val;
}

static std::string jsc_get_str(JSContextRef ctx, JSObjectRef obj, const char *name,
                                const char *def = "") {
    JSValueRef val = jsc_get_prop(ctx, obj, name);
    if (!val || JSValueIsUndefined(ctx, val) || JSValueIsNull(ctx, val)) return def;
    return jsc_to_std(ctx, val);
}

static double jsc_get_num(JSContextRef ctx, JSObjectRef obj, const char *name, double def = 0.0) {
    JSValueRef val = jsc_get_prop(ctx, obj, name);
    if (!val || JSValueIsUndefined(ctx, val)) return def;
    return jsc_to_double(ctx, val);
}

static bool jsc_get_bool(JSContextRef ctx, JSObjectRef obj, const char *name, bool def = false) {
    JSValueRef val = jsc_get_prop(ctx, obj, name);
    if (!val || JSValueIsUndefined(ctx, val)) return def;
    return JSValueToBoolean(ctx, val);
}

// ---------------------------------------------------------------------------
// GPU wrapper structs
// ---------------------------------------------------------------------------

struct JscGpuBuffer           { WGPUBuffer handle; bool owned; };
struct JscGpuTexture          { WGPUTexture handle; bool owned; };
struct JscGpuTextureView      { WGPUTextureView handle; bool owned; };
struct JscGpuSampler          { WGPUSampler handle; bool owned; };
struct JscGpuShaderModule     { WGPUShaderModule handle; bool owned; };
struct JscGpuBindGroupLayout  { WGPUBindGroupLayout handle; bool owned; };
struct JscGpuPipelineLayout   { WGPUPipelineLayout handle; bool owned; };
struct JscGpuBindGroup        { WGPUBindGroup handle; bool owned; };
struct JscGpuRenderPipeline   { WGPURenderPipeline handle; bool owned; };
struct JscGpuComputePipeline  { WGPUComputePipeline handle; bool owned; };
struct JscGpuCommandEncoder   { WGPUCommandEncoder handle; bool owned; };
struct JscGpuCommandBuffer    { WGPUCommandBuffer handle; bool owned; };
struct JscGpuRenderPassEncoder  { WGPURenderPassEncoder handle; bool ended; };
struct JscGpuComputePassEncoder { WGPUComputePassEncoder handle; bool ended; };
struct JscGpuSurfaceTexture     { WGPUTextureView view; }; // not owned

// JSClassRef globals
static JSClassRef s_class_buffer            = nullptr;
static JSClassRef s_class_texture           = nullptr;
static JSClassRef s_class_texture_view      = nullptr;
static JSClassRef s_class_sampler           = nullptr;
static JSClassRef s_class_shader_module     = nullptr;
static JSClassRef s_class_bind_group_layout = nullptr;
static JSClassRef s_class_pipeline_layout   = nullptr;
static JSClassRef s_class_bind_group        = nullptr;
static JSClassRef s_class_render_pipeline   = nullptr;
static JSClassRef s_class_compute_pipeline  = nullptr;
static JSClassRef s_class_command_encoder   = nullptr;
static JSClassRef s_class_command_buffer    = nullptr;
static JSClassRef s_class_render_pass       = nullptr;
static JSClassRef s_class_compute_pass      = nullptr;
static JSClassRef s_class_surface_texture   = nullptr;

// ---------------------------------------------------------------------------
// Finalizers
// ---------------------------------------------------------------------------

static void jsc_finalize_buffer(JSObjectRef o)
    { auto *p=(JscGpuBuffer*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuBufferRelease(p->handle);delete p;} }
static void jsc_finalize_texture(JSObjectRef o)
    { auto *p=(JscGpuTexture*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuTextureRelease(p->handle);delete p;} }
static void jsc_finalize_texture_view(JSObjectRef o)
    { auto *p=(JscGpuTextureView*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuTextureViewRelease(p->handle);delete p;} }
static void jsc_finalize_sampler(JSObjectRef o)
    { auto *p=(JscGpuSampler*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuSamplerRelease(p->handle);delete p;} }
static void jsc_finalize_shader_module(JSObjectRef o)
    { auto *p=(JscGpuShaderModule*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuShaderModuleRelease(p->handle);delete p;} }
static void jsc_finalize_bind_group_layout(JSObjectRef o)
    { auto *p=(JscGpuBindGroupLayout*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuBindGroupLayoutRelease(p->handle);delete p;} }
static void jsc_finalize_pipeline_layout(JSObjectRef o)
    { auto *p=(JscGpuPipelineLayout*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuPipelineLayoutRelease(p->handle);delete p;} }
static void jsc_finalize_bind_group(JSObjectRef o)
    { auto *p=(JscGpuBindGroup*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuBindGroupRelease(p->handle);delete p;} }
static void jsc_finalize_render_pipeline(JSObjectRef o)
    { auto *p=(JscGpuRenderPipeline*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuRenderPipelineRelease(p->handle);delete p;} }
static void jsc_finalize_compute_pipeline(JSObjectRef o)
    { auto *p=(JscGpuComputePipeline*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuComputePipelineRelease(p->handle);delete p;} }
static void jsc_finalize_command_buffer(JSObjectRef o)
    { auto *p=(JscGpuCommandBuffer*)JSObjectGetPrivate(o); if(p){if(p->owned&&p->handle)wgpuCommandBufferRelease(p->handle);delete p;} }
static void jsc_finalize_command_encoder(JSObjectRef o) {
    auto *p=(JscGpuCommandEncoder*)JSObjectGetPrivate(o);
    if(p){if(p->owned&&p->handle)wgpuCommandEncoderRelease(p->handle);delete p;}
}
static void jsc_finalize_render_pass(JSObjectRef o) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(o);
    if(p){if(p->handle&&!p->ended)wgpuRenderPassEncoderEnd(p->handle);if(p->handle)wgpuRenderPassEncoderRelease(p->handle);delete p;}
}
static void jsc_finalize_compute_pass(JSObjectRef o) {
    auto *p=(JscGpuComputePassEncoder*)JSObjectGetPrivate(o);
    if(p){if(p->handle&&!p->ended)wgpuComputePassEncoderEnd(p->handle);if(p->handle)wgpuComputePassEncoderRelease(p->handle);delete p;}
}
static void jsc_finalize_surface_texture(JSObjectRef o)
    { delete (JscGpuSurfaceTexture*)JSObjectGetPrivate(o); }

// ---------------------------------------------------------------------------
// make_* / unwrap_* helpers
// ---------------------------------------------------------------------------

#define DEF_GPU_WRAP(Name, Struct, ClassRef, HandleType) \
static JSObjectRef jsc_make_##Name(JSContextRef ctx, HandleType h, bool owned=true) { \
    return JSObjectMake(ctx, ClassRef, new Struct{h,owned}); \
} \
static HandleType jsc_unwrap_##Name(JSContextRef ctx, JSValueRef val) { \
    if(!val||!JSValueIsObject(ctx,val)) return nullptr; \
    auto *p=(Struct*)JSObjectGetPrivate((JSObjectRef)val); \
    return p?p->handle:nullptr; \
}

DEF_GPU_WRAP(buffer,           JscGpuBuffer,          s_class_buffer,            WGPUBuffer)
DEF_GPU_WRAP(texture,          JscGpuTexture,         s_class_texture,           WGPUTexture)
DEF_GPU_WRAP(texture_view,     JscGpuTextureView,     s_class_texture_view,      WGPUTextureView)
DEF_GPU_WRAP(sampler,          JscGpuSampler,         s_class_sampler,           WGPUSampler)
DEF_GPU_WRAP(shader_module,    JscGpuShaderModule,    s_class_shader_module,     WGPUShaderModule)
DEF_GPU_WRAP(bind_group_layout,JscGpuBindGroupLayout, s_class_bind_group_layout, WGPUBindGroupLayout)
DEF_GPU_WRAP(pipeline_layout,  JscGpuPipelineLayout,  s_class_pipeline_layout,   WGPUPipelineLayout)
DEF_GPU_WRAP(bind_group,       JscGpuBindGroup,       s_class_bind_group,        WGPUBindGroup)
DEF_GPU_WRAP(render_pipeline,  JscGpuRenderPipeline,  s_class_render_pipeline,   WGPURenderPipeline)
DEF_GPU_WRAP(compute_pipeline, JscGpuComputePipeline, s_class_compute_pipeline,  WGPUComputePipeline)
DEF_GPU_WRAP(command_buffer,   JscGpuCommandBuffer,   s_class_command_buffer,    WGPUCommandBuffer)

static JSObjectRef jsc_make_command_encoder(JSContextRef ctx, WGPUCommandEncoder h) {
    return JSObjectMake(ctx, s_class_command_encoder, new JscGpuCommandEncoder{h,true});
}
static WGPUCommandEncoder jsc_unwrap_command_encoder(JSContextRef ctx, JSValueRef val) {
    if(!val||!JSValueIsObject(ctx,val)) return nullptr;
    auto *p=(JscGpuCommandEncoder*)JSObjectGetPrivate((JSObjectRef)val);
    return p?p->handle:nullptr;
}
static JSObjectRef jsc_make_render_pass(JSContextRef ctx, WGPURenderPassEncoder h) {
    return JSObjectMake(ctx, s_class_render_pass, new JscGpuRenderPassEncoder{h,false});
}
static JSObjectRef jsc_make_compute_pass(JSContextRef ctx, WGPUComputePassEncoder h) {
    return JSObjectMake(ctx, s_class_compute_pass, new JscGpuComputePassEncoder{h,false});
}
static JSObjectRef jsc_make_surface_texture(JSContextRef ctx, WGPUTextureView view) {
    return JSObjectMake(ctx, s_class_surface_texture, new JscGpuSurfaceTexture{view});
}

// ---------------------------------------------------------------------------
// console
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_console_log(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    for(size_t i=0;i<argc;++i) LOG_INFO("script.jsc", jsc_to_std(ctx,argv[i]).c_str());
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_console_warn(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    for(size_t i=0;i<argc;++i) LOG_WARN("script.jsc", jsc_to_std(ctx,argv[i]).c_str());
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_console_error(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    for(size_t i=0;i<argc;++i) LOG_ERROR("script.jsc", jsc_to_std(ctx,argv[i]).c_str());
    return JSValueMakeUndefined(ctx);
}
static void jsc_bind_console(JSContextRef ctx) {
    JSObjectRef global = JSContextGetGlobalObject(ctx);
    JSObjectRef console = JSObjectMake(ctx, nullptr, nullptr);
    jsc_set_fn(ctx, console, "log",   jsc_cb_console_log);
    jsc_set_fn(ctx, console, "warn",  jsc_cb_console_warn);
    jsc_set_fn(ctx, console, "error", jsc_cb_console_error);
    jsc_set_prop(ctx, global, "console", console);
}

// ---------------------------------------------------------------------------
// performance
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_perf_now(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    return JSValueMakeNumber(ctx, now_ms() - s_start_ms);
}
static void jsc_bind_performance(JSContextRef ctx) {
    JSObjectRef global = JSContextGetGlobalObject(ctx);
    JSObjectRef perf = JSObjectMake(ctx, nullptr, nullptr);
    jsc_set_fn(ctx, perf, "now", jsc_cb_perf_now);
    jsc_set_prop(ctx, global, "performance", perf);
}

// ---------------------------------------------------------------------------
// requestAnimationFrame
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_raf(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNumber(ctx,0);
    JSObjectRef cb = (JSObjectRef)argv[0];
    JSValueProtect(ctx, cb);
    s_raf_queue.push_back(cb);
    return JSValueMakeNumber(ctx,(double)s_raf_queue.size());
}
static void jsc_bind_raf(JSContextRef ctx) {
    jsc_set_fn(ctx, JSContextGetGlobalObject(ctx), "requestAnimationFrame", jsc_cb_raf);
}

// ---------------------------------------------------------------------------
// fetch
// ---------------------------------------------------------------------------

struct FetchCallbackData {
    JSGlobalContextRef ctx;
    JSObjectRef resolve;
    JSObjectRef reject;
};

static JSValueRef jsc_cb_response_array_buffer(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    return jsc_resolved_promise(ctx, jsc_get_prop(ctx, thisObj, "_body"));
}
static JSValueRef jsc_cb_response_text(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    std::string text = jsc_to_std(ctx, jsc_get_prop(ctx, thisObj, "_body"));
    JSStringRef str = jsc_str(text.c_str());
    JSValueRef val = JSValueMakeString(ctx, str);
    JSStringRelease(str);
    return jsc_resolved_promise(ctx, val);
}
static JSValueRef jsc_cb_response_json(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    std::string text = jsc_to_std(ctx, jsc_get_prop(ctx, thisObj, "_body"));
    JSStringRef src = jsc_str(text.c_str());
    JSValueRef parsed = JSValueMakeFromJSONString(ctx, src);
    JSStringRelease(src);
    if(!parsed) parsed = JSValueMakeNull(ctx);
    return jsc_resolved_promise(ctx, parsed);
}

static void on_jsc_fetch_done(net_request_t, net_response_t response, void *userdata) {
    auto *data = (FetchCallbackData*)userdata;
    if(!g_mod.ctx) { delete data; return; }
    JSContextRef ctx = data->ctx;

    if(response.status>=200 && response.status<300 && response.error.empty()) {
        JSObjectRef resp = JSObjectMake(ctx, nullptr, nullptr);
        jsc_set_prop(ctx, resp, "status", JSValueMakeNumber(ctx, response.status));
        jsc_set_prop(ctx, resp, "ok",     JSValueMakeBoolean(ctx, true));

        const std::string &body = response.body;
        JSValueRef exc = nullptr;
        JSObjectRef ab = JSObjectMakeArrayBufferWithBytesNoCopy(
            ctx, (void*)body.data(), body.size(),
            [](void*,void*){}, nullptr, &exc);
        if(exc||!ab) {
            JSStringRef s = jsc_str(body.c_str());
            JSValueRef sv = JSValueMakeString(ctx, s); JSStringRelease(s);
            jsc_set_prop(ctx, resp, "_body", sv);
        } else {
            jsc_set_prop(ctx, resp, "_body", ab);
        }
        jsc_set_fn(ctx, resp, "arrayBuffer", jsc_cb_response_array_buffer);
        jsc_set_fn(ctx, resp, "text",        jsc_cb_response_text);
        jsc_set_fn(ctx, resp, "json",        jsc_cb_response_json);

        JSValueRef args[] = { resp };
        JSObjectCallAsFunction(ctx, data->resolve, nullptr, 1, args, nullptr);
    } else {
        const char *msg = response.error.empty() ? "fetch failed" : response.error.c_str();
        JSStringRef s = jsc_str(msg); JSValueRef v = JSValueMakeString(ctx, s); JSStringRelease(s);
        JSValueRef args[] = { v };
        JSObjectCallAsFunction(ctx, data->reject, nullptr, 1, args, nullptr);
    }
    JSValueUnprotect(ctx, data->resolve);
    JSValueUnprotect(ctx, data->reject);
    delete data;
}

static JSValueRef jsc_cb_fetch(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1) return JSValueMakeNull(ctx);
    std::string url_str = jsc_to_std(ctx, argv[0]);

    JSObjectRef resolve=nullptr, reject=nullptr;
    JSObjectRef promise = jsc_make_promise(ctx, &resolve, &reject);
    if(!promise) return JSValueMakeNull(ctx);
    if(resolve) JSValueProtect(ctx, resolve);
    if(reject)  JSValueProtect(ctx, reject);

    url_t url = url_parse(url_str);
    if(!url.valid) {
        JSStringRef s=jsc_str("fetch: invalid URL"); JSValueRef v=JSValueMakeString(ctx,s); JSStringRelease(s);
        if(reject) { JSValueRef a[]={v}; JSObjectCallAsFunction(ctx,reject,nullptr,1,a,nullptr); JSValueUnprotect(ctx,reject); }
        if(resolve) JSValueUnprotect(ctx, resolve);
        return promise;
    }

    auto *data = new FetchCallbackData{g_mod.ctx, resolve, reject};
    net_download_async(url, on_jsc_fetch_done, data);
    return promise;
}
static void jsc_bind_fetch(JSContextRef ctx) {
    jsc_set_fn(ctx, JSContextGetGlobalObject(ctx), "fetch", jsc_cb_fetch);
}

// ---------------------------------------------------------------------------
// GPUTexture methods
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_texture_create_view(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuTexture*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle) return JSValueMakeNull(ctx);
    WGPUTextureViewDescriptor desc={};
    desc.dimension=WGPUTextureViewDimension_2D;
    desc.mipLevelCount=1;
    desc.arrayLayerCount=1;
    if(argc>0&&JSValueIsObject(ctx,argv[0])) {
        JSObjectRef d=(JSObjectRef)argv[0];
        std::string fmt=jsc_get_str(ctx,d,"format");
        if(!fmt.empty()) desc.format=str_to_texture_format(fmt);
        std::string dim=jsc_get_str(ctx,d,"dimension");
        if(dim=="cube") desc.dimension=WGPUTextureViewDimension_Cube;
        else if(dim=="2d-array") desc.dimension=WGPUTextureViewDimension_2DArray;
        desc.baseMipLevel=(uint32_t)jsc_get_num(ctx,d,"baseMipLevel",0);
        desc.mipLevelCount=(uint32_t)jsc_get_num(ctx,d,"mipLevelCount",1);
        desc.baseArrayLayer=(uint32_t)jsc_get_num(ctx,d,"baseArrayLayer",0);
        desc.arrayLayerCount=(uint32_t)jsc_get_num(ctx,d,"arrayLayerCount",1);
    }
    return jsc_make_texture_view(ctx, wgpuTextureCreateView(p->handle,&desc), true);
}

static JSStaticFunction s_fns_texture[] = {
    {"createView", jsc_cb_texture_create_view, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {nullptr,nullptr,0}
};

// ---------------------------------------------------------------------------
// GPUSurfaceTexture methods
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_surface_texture_create_view(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    auto *p=(JscGpuSurfaceTexture*)JSObjectGetPrivate(thisObj);
    if(!p) return JSValueMakeNull(ctx);
    return jsc_make_texture_view(ctx, p->view, false);
}

static JSStaticFunction s_fns_surface_texture[] = {
    {"createView", jsc_cb_surface_texture_create_view, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {nullptr,nullptr,0}
};

// ---------------------------------------------------------------------------
// GPURenderPassEncoder methods
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_rp_set_pipeline(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<1) return JSValueMakeUndefined(ctx);
    WGPURenderPipeline pl=jsc_unwrap_render_pipeline(ctx,argv[0]);
    if(pl) wgpuRenderPassEncoderSetPipeline(p->handle,pl);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_rp_set_bind_group(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<2) return JSValueMakeUndefined(ctx);
    WGPUBindGroup bg=jsc_unwrap_bind_group(ctx,argv[1]);
    if(bg) wgpuRenderPassEncoderSetBindGroup(p->handle,(uint32_t)jsc_to_double(ctx,argv[0]),bg,0,nullptr);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_rp_set_vertex_buffer(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<2) return JSValueMakeUndefined(ctx);
    WGPUBuffer buf=jsc_unwrap_buffer(ctx,argv[1]);
    uint64_t offset=argc>2?(uint64_t)jsc_to_double(ctx,argv[2]):0;
    uint64_t size=argc>3?(uint64_t)jsc_to_double(ctx,argv[3]):WGPU_WHOLE_SIZE;
    if(buf) wgpuRenderPassEncoderSetVertexBuffer(p->handle,(uint32_t)jsc_to_double(ctx,argv[0]),buf,offset,size);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_rp_set_index_buffer(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<2) return JSValueMakeUndefined(ctx);
    WGPUBuffer buf=jsc_unwrap_buffer(ctx,argv[0]);
    uint64_t offset=argc>2?(uint64_t)jsc_to_double(ctx,argv[2]):0;
    uint64_t size=argc>3?(uint64_t)jsc_to_double(ctx,argv[3]):WGPU_WHOLE_SIZE;
    if(buf) wgpuRenderPassEncoderSetIndexBuffer(p->handle,buf,str_to_index_format(jsc_to_std(ctx,argv[1])),offset,size);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_rp_set_viewport(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<6) return JSValueMakeUndefined(ctx);
    wgpuRenderPassEncoderSetViewport(p->handle,
        (float)jsc_to_double(ctx,argv[0]),(float)jsc_to_double(ctx,argv[1]),
        (float)jsc_to_double(ctx,argv[2]),(float)jsc_to_double(ctx,argv[3]),
        (float)jsc_to_double(ctx,argv[4]),(float)jsc_to_double(ctx,argv[5]));
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_rp_set_scissor_rect(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<4) return JSValueMakeUndefined(ctx);
    wgpuRenderPassEncoderSetScissorRect(p->handle,
        (uint32_t)jsc_to_double(ctx,argv[0]),(uint32_t)jsc_to_double(ctx,argv[1]),
        (uint32_t)jsc_to_double(ctx,argv[2]),(uint32_t)jsc_to_double(ctx,argv[3]));
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_rp_draw(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<1) return JSValueMakeUndefined(ctx);
    wgpuRenderPassEncoderDraw(p->handle,
        (uint32_t)jsc_to_double(ctx,argv[0]),
        argc>1?(uint32_t)jsc_to_double(ctx,argv[1]):1,
        argc>2?(uint32_t)jsc_to_double(ctx,argv[2]):0,
        argc>3?(uint32_t)jsc_to_double(ctx,argv[3]):0);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_rp_draw_indexed(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<1) return JSValueMakeUndefined(ctx);
    wgpuRenderPassEncoderDrawIndexed(p->handle,
        (uint32_t)jsc_to_double(ctx,argv[0]),
        argc>1?(uint32_t)jsc_to_double(ctx,argv[1]):1,
        argc>2?(uint32_t)jsc_to_double(ctx,argv[2]):0,
        argc>3?(int32_t)jsc_to_double(ctx,argv[3]):0,
        argc>4?(uint32_t)jsc_to_double(ctx,argv[4]):0);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_rp_end(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    auto *p=(JscGpuRenderPassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||p->ended) return JSValueMakeUndefined(ctx);
    wgpuRenderPassEncoderEnd(p->handle);
    wgpuRenderPassEncoderRelease(p->handle);
    p->handle=nullptr; p->ended=true;
    return JSValueMakeUndefined(ctx);
}

static JSStaticFunction s_fns_render_pass[] = {
    {"setPipeline",     jsc_cb_rp_set_pipeline,     kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"setBindGroup",    jsc_cb_rp_set_bind_group,   kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"setVertexBuffer", jsc_cb_rp_set_vertex_buffer,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"setIndexBuffer",  jsc_cb_rp_set_index_buffer, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"setViewport",     jsc_cb_rp_set_viewport,     kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"setScissorRect",  jsc_cb_rp_set_scissor_rect, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"draw",            jsc_cb_rp_draw,             kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"drawIndexed",     jsc_cb_rp_draw_indexed,     kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"end",             jsc_cb_rp_end,              kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {nullptr,nullptr,0}
};

// ---------------------------------------------------------------------------
// GPUComputePassEncoder methods
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_cp_set_pipeline(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuComputePassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<1) return JSValueMakeUndefined(ctx);
    WGPUComputePipeline pl=jsc_unwrap_compute_pipeline(ctx,argv[0]);
    if(pl) wgpuComputePassEncoderSetPipeline(p->handle,pl);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_cp_set_bind_group(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuComputePassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<2) return JSValueMakeUndefined(ctx);
    WGPUBindGroup bg=jsc_unwrap_bind_group(ctx,argv[1]);
    if(bg) wgpuComputePassEncoderSetBindGroup(p->handle,(uint32_t)jsc_to_double(ctx,argv[0]),bg,0,nullptr);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_cp_dispatch(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuComputePassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<1) return JSValueMakeUndefined(ctx);
    wgpuComputePassEncoderDispatchWorkgroups(p->handle,
        (uint32_t)jsc_to_double(ctx,argv[0]),
        argc>1?(uint32_t)jsc_to_double(ctx,argv[1]):1,
        argc>2?(uint32_t)jsc_to_double(ctx,argv[2]):1);
    return JSValueMakeUndefined(ctx);
}
static JSValueRef jsc_cb_cp_end(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    auto *p=(JscGpuComputePassEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||p->ended) return JSValueMakeUndefined(ctx);
    wgpuComputePassEncoderEnd(p->handle);
    wgpuComputePassEncoderRelease(p->handle);
    p->handle=nullptr; p->ended=true;
    return JSValueMakeUndefined(ctx);
}

static JSStaticFunction s_fns_compute_pass[] = {
    {"setPipeline",        jsc_cb_cp_set_pipeline,  kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"setBindGroup",       jsc_cb_cp_set_bind_group,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"dispatchWorkgroups", jsc_cb_cp_dispatch,      kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"end",                jsc_cb_cp_end,            kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {nullptr,nullptr,0}
};

// ---------------------------------------------------------------------------
// GPUCommandEncoder methods
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_enc_begin_render_pass(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuCommandEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    JSObjectRef desc=(JSObjectRef)argv[0];

    JSObjectRef caArr=jsc_get_obj(ctx,desc,"colorAttachments");
    uint32_t caCount=caArr?(uint32_t)jsc_get_num(ctx,caArr,"length"):0;
    std::vector<WGPURenderPassColorAttachment> atts(caCount);

    for(uint32_t i=0;i<caCount;++i) {
        JSValueRef elem=JSObjectGetPropertyAtIndex(ctx,caArr,i,nullptr);
        if(!elem||!JSValueIsObject(ctx,elem)) continue;
        JSObjectRef att=(JSObjectRef)elem;
        atts[i]=WGPU_RENDER_PASS_COLOR_ATTACHMENT_INIT;
        atts[i].view=jsc_unwrap_texture_view(ctx,jsc_get_prop(ctx,att,"view"));
        atts[i].loadOp=str_to_load_op(jsc_get_str(ctx,att,"loadOp","clear"));
        atts[i].storeOp=str_to_store_op(jsc_get_str(ctx,att,"storeOp","store"));
        JSObjectRef cv=jsc_get_obj(ctx,att,"clearValue");
        if(cv) {
            atts[i].clearValue.r=jsc_get_num(ctx,cv,"r",0.0);
            atts[i].clearValue.g=jsc_get_num(ctx,cv,"g",0.0);
            atts[i].clearValue.b=jsc_get_num(ctx,cv,"b",0.0);
            atts[i].clearValue.a=jsc_get_num(ctx,cv,"a",1.0);
        }
    }

    WGPURenderPassDescriptor rp=WGPU_RENDER_PASS_DESCRIPTOR_INIT;
    rp.colorAttachmentCount=caCount;
    rp.colorAttachments=atts.data();
    WGPURenderPassEncoder pass=wgpuCommandEncoderBeginRenderPass(p->handle,&rp);
    return pass ? jsc_make_render_pass(ctx,pass) : JSValueMakeNull(ctx);
}

static JSValueRef jsc_cb_enc_begin_compute_pass(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    auto *p=(JscGpuCommandEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle) return JSValueMakeNull(ctx);
    WGPUComputePassDescriptor desc={};
    WGPUComputePassEncoder pass=wgpuCommandEncoderBeginComputePass(p->handle,&desc);
    return pass ? jsc_make_compute_pass(ctx,pass) : JSValueMakeNull(ctx);
}

static JSValueRef jsc_cb_enc_copy_buf_to_buf(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    auto *p=(JscGpuCommandEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle||argc<5) return JSValueMakeUndefined(ctx);
    WGPUBuffer src=jsc_unwrap_buffer(ctx,argv[0]);
    WGPUBuffer dst=jsc_unwrap_buffer(ctx,argv[2]);
    if(src&&dst) wgpuCommandEncoderCopyBufferToBuffer(p->handle,src,
        (uint64_t)jsc_to_double(ctx,argv[1]),dst,
        (uint64_t)jsc_to_double(ctx,argv[3]),
        (uint64_t)jsc_to_double(ctx,argv[4]));
    return JSValueMakeUndefined(ctx);
}

static JSValueRef jsc_cb_enc_finish(JSContextRef ctx, JSObjectRef thisObj, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    auto *p=(JscGpuCommandEncoder*)JSObjectGetPrivate(thisObj);
    if(!p||!p->handle) return JSValueMakeNull(ctx);
    WGPUCommandBufferDescriptor desc={};
    WGPUCommandBuffer cb=wgpuCommandEncoderFinish(p->handle,&desc);
    wgpuCommandEncoderRelease(p->handle);
    p->handle=nullptr; p->owned=false;
    return cb ? jsc_make_command_buffer(ctx,cb,true) : JSValueMakeNull(ctx);
}

static JSStaticFunction s_fns_command_encoder[] = {
    {"beginRenderPass",    jsc_cb_enc_begin_render_pass,  kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"beginComputePass",   jsc_cb_enc_begin_compute_pass, kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"copyBufferToBuffer", jsc_cb_enc_copy_buf_to_buf,    kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {"finish",             jsc_cb_enc_finish,             kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete},
    {nullptr,nullptr,0}
};

// ---------------------------------------------------------------------------
// GPUQueue
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_queue_submit(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeUndefined(ctx);
    JSObjectRef arr=(JSObjectRef)argv[0];
    uint32_t count=(uint32_t)jsc_get_num(ctx,arr,"length");
    std::vector<WGPUCommandBuffer> cbs;
    for(uint32_t i=0;i<count;++i) {
        JSValueRef elem=JSObjectGetPropertyAtIndex(ctx,arr,i,nullptr);
        WGPUCommandBuffer cb=jsc_unwrap_command_buffer(ctx,elem);
        if(cb) cbs.push_back(cb);
        if(elem&&JSValueIsObject(ctx,elem)) {
            auto *p=(JscGpuCommandBuffer*)JSObjectGetPrivate((JSObjectRef)elem);
            if(p) p->handle=nullptr;
        }
    }
    if(!cbs.empty()) wgpuQueueSubmit(webgpu_queue(),(uint32_t)cbs.size(),cbs.data());
    for(WGPUCommandBuffer cb:cbs) wgpuCommandBufferRelease(cb);
    return JSValueMakeUndefined(ctx);
}

static JSValueRef jsc_cb_queue_write_buffer(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<3) return JSValueMakeUndefined(ctx);
    WGPUBuffer buf=jsc_unwrap_buffer(ctx,argv[0]);
    if(!buf) return JSValueMakeUndefined(ctx);
    uint64_t offset=(uint64_t)jsc_to_double(ctx,argv[1]);
    const void *dataPtr=nullptr; size_t dataSize=0;
    if(JSValueIsObject(ctx,argv[2])) {
        JSObjectRef dataObj=(JSObjectRef)argv[2];
        JSValueRef exc=nullptr;
        void *ptr=JSObjectGetArrayBufferBytesPtr(ctx,dataObj,&exc);
        if(!exc&&ptr) { dataPtr=ptr; dataSize=JSObjectGetArrayBufferByteLength(ctx,dataObj,nullptr); }
        else {
            exc=nullptr;
            JSObjectRef ab=JSObjectGetTypedArrayBuffer(ctx,dataObj,&exc);
            if(!exc&&ab) { dataPtr=JSObjectGetArrayBufferBytesPtr(ctx,ab,nullptr); dataSize=JSObjectGetArrayBufferByteLength(ctx,ab,nullptr); }
        }
    }
    if(dataPtr&&dataSize>0) {
        uint64_t dataOff=argc>3?(uint64_t)jsc_to_double(ctx,argv[3]):0;
        uint64_t sz=argc>4?(uint64_t)jsc_to_double(ctx,argv[4]):dataSize-dataOff;
        wgpuQueueWriteBuffer(webgpu_queue(),buf,offset,(const uint8_t*)dataPtr+dataOff,sz);
    }
    return JSValueMakeUndefined(ctx);
}

static JSObjectRef jsc_make_gpu_queue(JSContextRef ctx) {
    JSObjectRef q=JSObjectMake(ctx,nullptr,nullptr);
    jsc_set_fn(ctx,q,"submit",      jsc_cb_queue_submit);
    jsc_set_fn(ctx,q,"writeBuffer", jsc_cb_queue_write_buffer);
    return q;
}

// ---------------------------------------------------------------------------
// GPUDevice create* methods
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_device_create_buffer(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    JSObjectRef d=(JSObjectRef)argv[0];
    WGPUBufferDescriptor desc={};
    desc.size=(uint64_t)jsc_get_num(ctx,d,"size");
    desc.usage=(WGPUBufferUsage)(uint32_t)jsc_get_num(ctx,d,"usage");
    desc.mappedAtCreation=jsc_get_bool(ctx,d,"mappedAtCreation");
    return jsc_make_buffer(ctx,wgpuDeviceCreateBuffer(webgpu_device(),&desc),true);
}

static JSValueRef jsc_cb_device_create_texture(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    JSObjectRef d=(JSObjectRef)argv[0];
    WGPUTextureDescriptor desc={};
    desc.usage=(WGPUTextureUsage)(uint32_t)jsc_get_num(ctx,d,"usage");
    desc.format=str_to_texture_format(jsc_get_str(ctx,d,"format"));
    desc.mipLevelCount=(uint32_t)jsc_get_num(ctx,d,"mipLevelCount",1);
    desc.sampleCount=(uint32_t)jsc_get_num(ctx,d,"sampleCount",1);
    desc.dimension=WGPUTextureDimension_2D;
    std::string dim=jsc_get_str(ctx,d,"dimension");
    if(dim=="3d") desc.dimension=WGPUTextureDimension_3D;
    JSObjectRef sz=jsc_get_obj(ctx,d,"size");
    if(sz) {
        desc.size.width=(uint32_t)jsc_get_num(ctx,sz,"width",1);
        desc.size.height=(uint32_t)jsc_get_num(ctx,sz,"height",1);
        desc.size.depthOrArrayLayers=(uint32_t)jsc_get_num(ctx,sz,"depthOrArrayLayers",1);
    }
    return jsc_make_texture(ctx,wgpuDeviceCreateTexture(webgpu_device(),&desc),true);
}

static JSValueRef jsc_cb_device_create_sampler(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    WGPUSamplerDescriptor desc={};
    desc.maxAnisotropy=1;
    if(argc>0&&JSValueIsObject(ctx,argv[0])) {
        JSObjectRef d=(JSObjectRef)argv[0];
        desc.minFilter=str_to_filter(jsc_get_str(ctx,d,"minFilter","nearest"));
        desc.magFilter=str_to_filter(jsc_get_str(ctx,d,"magFilter","nearest"));
        desc.mipmapFilter=str_to_mipmap_filter(jsc_get_str(ctx,d,"mipmapFilter","nearest"));
        desc.addressModeU=str_to_address_mode(jsc_get_str(ctx,d,"addressModeU","clamp-to-edge"));
        desc.addressModeV=str_to_address_mode(jsc_get_str(ctx,d,"addressModeV","clamp-to-edge"));
        desc.addressModeW=str_to_address_mode(jsc_get_str(ctx,d,"addressModeW","clamp-to-edge"));
        desc.maxAnisotropy=(uint16_t)jsc_get_num(ctx,d,"maxAnisotropy",1);
    }
    return jsc_make_sampler(ctx,wgpuDeviceCreateSampler(webgpu_device(),&desc),true);
}

static JSValueRef jsc_cb_device_create_shader_module(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    std::string code=jsc_get_str(ctx,(JSObjectRef)argv[0],"code");
    WGPUShaderSourceWGSL wgsl={};
    wgsl.chain.sType=WGPUSType_ShaderSourceWGSL;
    wgsl.code.data=code.c_str(); wgsl.code.length=code.size();
    WGPUShaderModuleDescriptor desc={}; desc.nextInChain=&wgsl.chain;
    return jsc_make_shader_module(ctx,wgpuDeviceCreateShaderModule(webgpu_device(),&desc),true);
}

static JSValueRef jsc_cb_device_create_bgl(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    JSObjectRef desc=(JSObjectRef)argv[0];
    JSObjectRef arr=jsc_get_obj(ctx,desc,"entries");
    uint32_t count=arr?(uint32_t)jsc_get_num(ctx,arr,"length"):0;
    std::vector<WGPUBindGroupLayoutEntry> entries(count);
    for(uint32_t i=0;i<count;++i) {
        JSValueRef elem=JSObjectGetPropertyAtIndex(ctx,arr,i,nullptr);
        if(!elem||!JSValueIsObject(ctx,elem)) continue;
        JSObjectRef e=(JSObjectRef)elem;
        entries[i].binding=(uint32_t)jsc_get_num(ctx,e,"binding");
        entries[i].visibility=(WGPUShaderStage)(uint32_t)jsc_get_num(ctx,e,"visibility");
        JSObjectRef bufObj=jsc_get_obj(ctx,e,"buffer");
        if(bufObj) {
            entries[i].buffer.type=WGPUBufferBindingType_Uniform;
            std::string bt=jsc_get_str(ctx,bufObj,"type","uniform");
            if(bt=="storage") entries[i].buffer.type=WGPUBufferBindingType_Storage;
            else if(bt=="read-only-storage") entries[i].buffer.type=WGPUBufferBindingType_ReadOnlyStorage;
            entries[i].buffer.hasDynamicOffset=jsc_get_bool(ctx,bufObj,"hasDynamicOffset");
        }
        if(jsc_get_obj(ctx,e,"texture")) { entries[i].texture.sampleType=WGPUTextureSampleType_Float; entries[i].texture.viewDimension=WGPUTextureViewDimension_2D; }
        if(jsc_get_obj(ctx,e,"sampler")) { entries[i].sampler.type=WGPUSamplerBindingType_Filtering; }
    }
    WGPUBindGroupLayoutDescriptor d={}; d.entryCount=count; d.entries=entries.data();
    return jsc_make_bind_group_layout(ctx,wgpuDeviceCreateBindGroupLayout(webgpu_device(),&d),true);
}

static JSValueRef jsc_cb_device_create_pipeline_layout(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    JSObjectRef desc=(JSObjectRef)argv[0];
    JSObjectRef arr=jsc_get_obj(ctx,desc,"bindGroupLayouts");
    uint32_t count=arr?(uint32_t)jsc_get_num(ctx,arr,"length"):0;
    std::vector<WGPUBindGroupLayout> bgls(count);
    for(uint32_t i=0;i<count;++i)
        bgls[i]=jsc_unwrap_bind_group_layout(ctx,JSObjectGetPropertyAtIndex(ctx,arr,i,nullptr));
    WGPUPipelineLayoutDescriptor d={}; d.bindGroupLayoutCount=count; d.bindGroupLayouts=bgls.data();
    return jsc_make_pipeline_layout(ctx,wgpuDeviceCreatePipelineLayout(webgpu_device(),&d),true);
}

static JSValueRef jsc_cb_device_create_bind_group(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    JSObjectRef desc=(JSObjectRef)argv[0];
    WGPUBindGroupLayout layout=jsc_unwrap_bind_group_layout(ctx,jsc_get_prop(ctx,desc,"layout"));
    JSObjectRef arr=jsc_get_obj(ctx,desc,"entries");
    uint32_t count=arr?(uint32_t)jsc_get_num(ctx,arr,"length"):0;
    std::vector<WGPUBindGroupEntry> entries(count);
    for(uint32_t i=0;i<count;++i) {
        JSValueRef elem=JSObjectGetPropertyAtIndex(ctx,arr,i,nullptr);
        if(!elem||!JSValueIsObject(ctx,elem)) continue;
        JSObjectRef e=(JSObjectRef)elem;
        entries[i].binding=(uint32_t)jsc_get_num(ctx,e,"binding");
        JSValueRef res=jsc_get_prop(ctx,e,"resource");
        WGPUBuffer buf=jsc_unwrap_buffer(ctx,res);
        WGPUTextureView tv=jsc_unwrap_texture_view(ctx,res);
        WGPUSampler samp=jsc_unwrap_sampler(ctx,res);
        if(buf) {
            entries[i].buffer=buf; entries[i].offset=0; entries[i].size=WGPU_WHOLE_SIZE;
            if(res&&JSValueIsObject(ctx,res)) {
                JSObjectRef ro=(JSObjectRef)res;
                JSValueRef ov=jsc_get_prop(ctx,ro,"offset"), sv=jsc_get_prop(ctx,ro,"size");
                if(ov&&!JSValueIsUndefined(ctx,ov)) entries[i].offset=(uint64_t)jsc_to_double(ctx,ov);
                if(sv&&!JSValueIsUndefined(ctx,sv)) entries[i].size=(uint64_t)jsc_to_double(ctx,sv);
            }
        } else if(tv) { entries[i].textureView=tv; }
        else if(samp) { entries[i].sampler=samp; }
    }
    WGPUBindGroupDescriptor d={}; d.layout=layout; d.entryCount=count; d.entries=entries.data();
    return jsc_make_bind_group(ctx,wgpuDeviceCreateBindGroup(webgpu_device(),&d),true);
}

static JSValueRef jsc_cb_device_create_render_pipeline(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    JSObjectRef desc=(JSObjectRef)argv[0];

    WGPUPipelineLayout layout=nullptr;
    JSValueRef layoutVal=jsc_get_prop(ctx,desc,"layout");
    if(!JSValueIsString(ctx,layoutVal)) layout=jsc_unwrap_pipeline_layout(ctx,layoutVal);

    JSObjectRef vertObj=jsc_get_obj(ctx,desc,"vertex");
    if(!vertObj) return JSValueMakeNull(ctx);
    WGPUShaderModule vertMod=jsc_unwrap_shader_module(ctx,jsc_get_prop(ctx,vertObj,"module"));
    std::string vertEntry=jsc_get_str(ctx,vertObj,"entryPoint","main");

    JSObjectRef vbArr=jsc_get_obj(ctx,vertObj,"buffers");
    uint32_t vbCount=vbArr?(uint32_t)jsc_get_num(ctx,vbArr,"length"):0;
    std::vector<WGPUVertexBufferLayout> vbLayouts(vbCount);
    std::vector<std::vector<WGPUVertexAttribute>> vbAttribs(vbCount);
    for(uint32_t i=0;i<vbCount;++i) {
        JSValueRef elem=JSObjectGetPropertyAtIndex(ctx,vbArr,i,nullptr);
        if(!elem||!JSValueIsObject(ctx,elem)) continue;
        JSObjectRef vb=(JSObjectRef)elem;
        vbLayouts[i].arrayStride=(uint64_t)jsc_get_num(ctx,vb,"arrayStride");
        vbLayouts[i].stepMode=str_to_step_mode(jsc_get_str(ctx,vb,"stepMode","vertex"));
        JSObjectRef attrArr=jsc_get_obj(ctx,vb,"attributes");
        uint32_t attrCount=attrArr?(uint32_t)jsc_get_num(ctx,attrArr,"length"):0;
        vbAttribs[i].resize(attrCount);
        for(uint32_t j=0;j<attrCount;++j) {
            JSValueRef ae=JSObjectGetPropertyAtIndex(ctx,attrArr,j,nullptr);
            if(!ae||!JSValueIsObject(ctx,ae)) continue;
            JSObjectRef a=(JSObjectRef)ae;
            vbAttribs[i][j].format=str_to_vertex_format(jsc_get_str(ctx,a,"format"));
            vbAttribs[i][j].offset=(uint64_t)jsc_get_num(ctx,a,"offset");
            vbAttribs[i][j].shaderLocation=(uint32_t)jsc_get_num(ctx,a,"shaderLocation");
        }
        vbLayouts[i].attributeCount=attrCount;
        vbLayouts[i].attributes=vbAttribs[i].data();
    }

    WGPUVertexState vertState={};
    vertState.module=vertMod; vertState.entryPoint=vertEntry.c_str();
    vertState.bufferCount=vbCount; vertState.buffers=vbLayouts.data();

    JSObjectRef fragObj=jsc_get_obj(ctx,desc,"fragment");
    WGPUFragmentState fragState={};
    std::vector<WGPUColorTargetState> targets;
    std::vector<WGPUBlendState> blends;
    std::string fragEntry;
    WGPUShaderModule fragMod=nullptr;

    if(fragObj) {
        fragMod=jsc_unwrap_shader_module(ctx,jsc_get_prop(ctx,fragObj,"module"));
        fragEntry=jsc_get_str(ctx,fragObj,"entryPoint","main");
        JSObjectRef tgtsArr=jsc_get_obj(ctx,fragObj,"targets");
        uint32_t tgtCount=tgtsArr?(uint32_t)jsc_get_num(ctx,tgtsArr,"length"):0;
        targets.resize(tgtCount); blends.resize(tgtCount);
        for(uint32_t i=0;i<tgtCount;++i) {
            JSValueRef te=JSObjectGetPropertyAtIndex(ctx,tgtsArr,i,nullptr);
            if(!te||!JSValueIsObject(ctx,te)) continue;
            JSObjectRef t=(JSObjectRef)te;
            targets[i].format=str_to_texture_format(jsc_get_str(ctx,t,"format","bgra8unorm"));
            targets[i].writeMask=WGPUColorWriteMask_All;
            JSObjectRef blendObj=jsc_get_obj(ctx,t,"blend");
            if(blendObj) {
                JSObjectRef cb=jsc_get_obj(ctx,blendObj,"color");
                JSObjectRef ab=jsc_get_obj(ctx,blendObj,"alpha");
                if(cb) { blends[i].color.srcFactor=str_to_blend_factor(jsc_get_str(ctx,cb,"srcFactor","one")); blends[i].color.dstFactor=str_to_blend_factor(jsc_get_str(ctx,cb,"dstFactor","zero")); blends[i].color.operation=str_to_blend_op(jsc_get_str(ctx,cb,"operation","add")); }
                if(ab) { blends[i].alpha.srcFactor=str_to_blend_factor(jsc_get_str(ctx,ab,"srcFactor","one")); blends[i].alpha.dstFactor=str_to_blend_factor(jsc_get_str(ctx,ab,"dstFactor","zero")); blends[i].alpha.operation=str_to_blend_op(jsc_get_str(ctx,ab,"operation","add")); }
                targets[i].blend=&blends[i];
            }
        }
        fragState.module=fragMod; fragState.entryPoint=fragEntry.c_str();
        fragState.targetCount=tgtCount; fragState.targets=targets.data();
    }

    JSObjectRef primObj=jsc_get_obj(ctx,desc,"primitive");
    WGPUPrimitiveState primState={};
    primState.topology=WGPUPrimitiveTopology_TriangleList;
    if(primObj) {
        primState.topology=str_to_topology(jsc_get_str(ctx,primObj,"topology","triangle-list"));
        primState.cullMode=str_to_cull_mode(jsc_get_str(ctx,primObj,"cullMode","none"));
        primState.frontFace=str_to_front_face(jsc_get_str(ctx,primObj,"frontFace","ccw"));
    }

    JSObjectRef msObj=jsc_get_obj(ctx,desc,"multisample");
    WGPUMultisampleState msState={};
    msState.count=msObj?(uint32_t)jsc_get_num(ctx,msObj,"count",1):1;
    msState.mask=0xFFFFFFFF;

    WGPURenderPipelineDescriptor d={};
    d.layout=layout; d.vertex=vertState;
    d.fragment=fragObj?&fragState:nullptr;
    d.primitive=primState; d.multisample=msState;

    WGPURenderPipeline pl=wgpuDeviceCreateRenderPipeline(webgpu_device(),&d);
    if(!pl) { LOG_ERROR("script.jsc","createRenderPipeline failed"); return JSValueMakeNull(ctx); }
    return jsc_make_render_pipeline(ctx,pl,true);
}

static JSValueRef jsc_cb_device_create_compute_pipeline(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t argc, const JSValueRef argv[], JSValueRef*) {
    if(argc<1||!JSValueIsObject(ctx,argv[0])) return JSValueMakeNull(ctx);
    JSObjectRef desc=(JSObjectRef)argv[0];
    WGPUPipelineLayout layout=nullptr;
    JSValueRef layoutVal=jsc_get_prop(ctx,desc,"layout");
    if(!JSValueIsString(ctx,layoutVal)) layout=jsc_unwrap_pipeline_layout(ctx,layoutVal);
    JSObjectRef computeObj=jsc_get_obj(ctx,desc,"compute");
    if(!computeObj) return JSValueMakeNull(ctx);
    WGPUShaderModule mod=jsc_unwrap_shader_module(ctx,jsc_get_prop(ctx,computeObj,"module"));
    std::string entry=jsc_get_str(ctx,computeObj,"entryPoint","main");
    WGPUComputePipelineDescriptor d={};
    d.layout=layout; d.compute.module=mod; d.compute.entryPoint=entry.c_str();
    return jsc_make_compute_pipeline(ctx,wgpuDeviceCreateComputePipeline(webgpu_device(),&d),true);
}

static JSValueRef jsc_cb_device_create_command_encoder(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    WGPUCommandEncoderDescriptor d={};
    return jsc_make_command_encoder(ctx,wgpuDeviceCreateCommandEncoder(webgpu_device(),&d));
}

static JSObjectRef jsc_make_gpu_device(JSContextRef ctx) {
    JSObjectRef dev=JSObjectMake(ctx,nullptr,nullptr);
    jsc_set_fn(ctx,dev,"createBuffer",          jsc_cb_device_create_buffer);
    jsc_set_fn(ctx,dev,"createTexture",         jsc_cb_device_create_texture);
    jsc_set_fn(ctx,dev,"createSampler",         jsc_cb_device_create_sampler);
    jsc_set_fn(ctx,dev,"createShaderModule",    jsc_cb_device_create_shader_module);
    jsc_set_fn(ctx,dev,"createBindGroupLayout", jsc_cb_device_create_bgl);
    jsc_set_fn(ctx,dev,"createPipelineLayout",  jsc_cb_device_create_pipeline_layout);
    jsc_set_fn(ctx,dev,"createBindGroup",       jsc_cb_device_create_bind_group);
    jsc_set_fn(ctx,dev,"createRenderPipeline",  jsc_cb_device_create_render_pipeline);
    jsc_set_fn(ctx,dev,"createComputePipeline", jsc_cb_device_create_compute_pipeline);
    jsc_set_fn(ctx,dev,"createCommandEncoder",  jsc_cb_device_create_command_encoder);
    jsc_set_prop(ctx,dev,"queue",jsc_make_gpu_queue(ctx));
    return dev;
}

// ---------------------------------------------------------------------------
// Class initialization (call once)
// ---------------------------------------------------------------------------

static JSClassRef jsc_make_class(const char *name, JSObjectFinalizeCallback fin,
                                  JSStaticFunction *fns=nullptr) {
    JSClassDefinition def=kJSClassDefinitionEmpty;
    def.className=name; def.finalize=fin; def.staticFunctions=fns;
    return JSClassCreate(&def);
}

static void jsc_init_classes() {
    if(s_class_buffer) return;
    s_class_buffer           =jsc_make_class("GPUBuffer",          jsc_finalize_buffer);
    s_class_texture          =jsc_make_class("GPUTexture",         jsc_finalize_texture,          s_fns_texture);
    s_class_texture_view     =jsc_make_class("GPUTextureView",     jsc_finalize_texture_view);
    s_class_sampler          =jsc_make_class("GPUSampler",         jsc_finalize_sampler);
    s_class_shader_module    =jsc_make_class("GPUShaderModule",    jsc_finalize_shader_module);
    s_class_bind_group_layout=jsc_make_class("GPUBindGroupLayout", jsc_finalize_bind_group_layout);
    s_class_pipeline_layout  =jsc_make_class("GPUPipelineLayout",  jsc_finalize_pipeline_layout);
    s_class_bind_group       =jsc_make_class("GPUBindGroup",       jsc_finalize_bind_group);
    s_class_render_pipeline  =jsc_make_class("GPURenderPipeline",  jsc_finalize_render_pipeline);
    s_class_compute_pipeline =jsc_make_class("GPUComputePipeline", jsc_finalize_compute_pipeline);
    s_class_command_encoder  =jsc_make_class("GPUCommandEncoder",  jsc_finalize_command_encoder,  s_fns_command_encoder);
    s_class_command_buffer   =jsc_make_class("GPUCommandBuffer",   jsc_finalize_command_buffer);
    s_class_render_pass      =jsc_make_class("GPURenderPassEncoder",  jsc_finalize_render_pass,   s_fns_render_pass);
    s_class_compute_pass     =jsc_make_class("GPUComputePassEncoder", jsc_finalize_compute_pass,  s_fns_compute_pass);
    s_class_surface_texture  =jsc_make_class("GPUSurfaceTexture",  jsc_finalize_surface_texture,  s_fns_surface_texture);
}

// ---------------------------------------------------------------------------
// navigator.gpu + gpu_surface binding
// ---------------------------------------------------------------------------

static JSValueRef jsc_cb_gpu_get_preferred_canvas_format(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    JSStringRef str=jsc_str("bgra8unorm");
    JSValueRef val=JSValueMakeString(ctx,str); JSStringRelease(str);
    return val;
}

static JSValueRef jsc_cb_adapter_request_device(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    return jsc_resolved_promise(ctx, jsc_make_gpu_device(ctx));
}

static JSValueRef jsc_cb_gpu_request_adapter(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    JSObjectRef adapter=JSObjectMake(ctx,nullptr,nullptr);
    jsc_set_fn(ctx,adapter,"requestDevice",jsc_cb_adapter_request_device);
    return jsc_resolved_promise(ctx,adapter);
}

static JSValueRef jsc_cb_surface_get_current_texture(JSContextRef ctx, JSObjectRef, JSObjectRef,
    size_t, const JSValueRef[], JSValueRef*) {
    return jsc_make_surface_texture(ctx,webgpu_current_texture_view());
}

static void jsc_bind_webgpu(JSContextRef ctx) {
    JSObjectRef global=JSContextGetGlobalObject(ctx);
    JSObjectRef gpu=JSObjectMake(ctx,nullptr,nullptr);
    jsc_set_fn(ctx,gpu,"requestAdapter",jsc_cb_gpu_request_adapter);
    jsc_set_fn(ctx,gpu,"getPreferredCanvasFormat",jsc_cb_gpu_get_preferred_canvas_format);
    JSObjectRef nav=JSObjectMake(ctx,nullptr,nullptr);
    jsc_set_prop(ctx,nav,"gpu",gpu);
    jsc_set_prop(ctx,global,"navigator",nav);
    JSObjectRef surface=JSObjectMake(ctx,nullptr,nullptr);
    jsc_set_fn(ctx,surface,"getCurrentTexture",jsc_cb_surface_get_current_texture);
    jsc_set_prop(ctx,global,"gpu_surface",surface);
}

// ---------------------------------------------------------------------------
// Script extension check
// ---------------------------------------------------------------------------

static bool jsc_has_script_extension(const char *path, u32 length) {
    if(!path||length<3) return false;
    if(length>=3&&strncmp(path+length-3,".js",3)==0) return true;
    if(length>=4&&strncmp(path+length-4,".mjs",4)==0) return true;
    return false;
}

// ---------------------------------------------------------------------------
// script_setup / script_cleanup
// ---------------------------------------------------------------------------

void script_setup() {
    jsc_init_classes();
    s_start_ms=now_ms();
    g_mod.group=JSContextGroupCreate();
    g_mod.ctx=JSGlobalContextCreateInGroup(g_mod.group,nullptr);
    JSContextRef ctx=g_mod.ctx;
    jsc_bind_console(ctx);
    jsc_bind_performance(ctx);
    jsc_bind_raf(ctx);
    jsc_bind_fetch(ctx);
    jsc_bind_webgpu(ctx);
}

void script_cleanup() {
    if(g_mod.ctx) {
        for(JSObjectRef fn:s_raf_queue) JSValueUnprotect(g_mod.ctx,fn);
        s_raf_queue.clear();
        JSGlobalContextRelease(g_mod.ctx);
        g_mod.ctx=nullptr;
    }
    if(g_mod.group) {
        JSContextGroupRelease(g_mod.group);
        g_mod.group=nullptr;
    }
    script_gpu_cleanup();
}

// ---------------------------------------------------------------------------
// Public script API
// ---------------------------------------------------------------------------

void script_init(os_window_t *window) {
    g_ctx.window=window;
    g_ctx.invalid_script=true;
    std::string bundle_path=os_get_bundle_path(g_db_bundle_name);
    g_ctx.db=db_open(bundle_path);
    ui_renderer_init();
    ui_renderer_set_size((u32)window->width,(u32)window->height);
    ui_state_init();
    ui_state_set_size((u32)window->width,(u32)window->height);
#ifdef UI_NATIVE
    ui_dev_tool_init(&g_ctx.dev_tool);
#endif
}

void script_terminate(void) {
    script_cleanup();
    ui_renderer_free();
    db_close(g_ctx.db);
    g_ctx={};
}

script_t *script_shared(void)        { return &g_ctx; }
void *script_internal(void)          { return (void*)g_mod.ctx; }
void *script_runtime_internal(void)  { return (void*)g_mod.group; }

int script_eval(std::string_view source, std::string_view filename) {
    script_cleanup();
    script_setup();
    g_ctx.invalid_script=false;
    JSStringRef src=JSStringCreateWithUTF8CString(std::string(source).c_str());
    JSStringRef file=JSStringCreateWithUTF8CString(std::string(filename).c_str());
    JSValueRef exc=nullptr;
    JSEvaluateScript(g_mod.ctx,src,nullptr,file,1,&exc);
    JSStringRelease(src); JSStringRelease(file);
    if(exc) { jsc_log_exception(g_mod.ctx,exc,"script.eval"); g_ctx.invalid_script=true; return -1; }
    return 0;
}

int script_eval_uri(std::string_view uri) {
    std::string uri_string(uri);
    if(text_starts_with(uri,g_http_prefix)) {
        url_t url=url_parse(uri);
        if(!url.valid||!jsc_has_script_extension(url.path.c_str(),(u32)url.path.size())) {
            ULOG_WARN(uri_string.c_str()); return -1;
        }
        net_download_async(url,[](net_request_t,net_response_t response,void *userdata){
            auto *uri_copy=(std::string*)userdata;
            if(response.status>=200&&response.status<300&&response.error.empty())
                script_eval(response.body,*uri_copy);
            else
                LOG_ERROR("script.jsc",response.error.empty()?"download failed":response.error.c_str());
            delete uri_copy;
        },new std::string(uri_string));
        return 0;
    }
    if(!jsc_has_script_extension(uri.data(),(u32)uri.size())) { ULOG_WARN(uri_string.c_str()); return -1; }
    std::string source=io_read_file(uri_string);
    if(source.empty()) { LOG_ERROR("script.jsc",uri_string.c_str()); return -1; }
    return script_eval(source,uri_string);
}

int script_eval_direct(std::string_view source, std::string *result) {
    if(!g_mod.ctx) return -1;
    JSStringRef src=JSStringCreateWithUTF8CString(std::string(source).c_str());
    JSValueRef exc=nullptr;
    JSValueRef ret=JSEvaluateScript(g_mod.ctx,src,nullptr,nullptr,1,&exc);
    JSStringRelease(src);
    if(exc) { jsc_log_exception(g_mod.ctx,exc,"script.direct"); return -1; }
    if(result&&ret) *result=jsc_to_std(g_mod.ctx,ret);
    return 0;
}

void script_mouse_move(f32 x, f32 y) { (void)x; (void)y; }
void script_mouse_button(MOUSE_BUTTON button, BUTTON_ACTION action) { (void)button; (void)action; }
void script_key_action(KEYCODE key, BUTTON_ACTION action) { (void)key; (void)action; }

void script_resize(i32 width, i32 height) {
    ui_renderer_set_size((u32)width,(u32)height);
    ui_state_set_size((u32)width,(u32)height);
}

void script_tick() {
    if(!g_ctx.invalid_script&&g_mod.ctx&&!s_raf_queue.empty()) {
        auto q=std::move(s_raf_queue);
        s_raf_queue.clear();
        double ts=now_ms()-s_start_ms;
        JSValueRef ts_val=JSValueMakeNumber(g_mod.ctx,ts);
        for(JSObjectRef fn:q) {
            JSValueRef exc=nullptr;
            JSObjectCallAsFunction(g_mod.ctx,fn,nullptr,1,&ts_val,&exc);
            if(exc) jsc_log_exception(g_mod.ctx,exc,"rAF");
            JSValueUnprotect(g_mod.ctx,fn);
        }
    }
    ui_renderer_render();
    ui_state_update();
    net_poll();
}

#endif // SCRIPT_BACKEND_JSC
