/**
 * gpu.dawn.cpp — WebGPU GPU backend using Dawn
 *
 * Implements the gpu.h abstraction layer on top of the WebGPU C API provided
 * by Dawn (https://dawn.googlesource.com/dawn).
 *
 * Dawn acts as the single GPU backend and dispatches to Metal (macOS/iOS),
 * D3D12 (Windows) or Vulkan (Linux) internally — the application code only
 * ever speaks WebGPU.
 *
 * Build dependency: run `python script/dep.py download && python script/dep.py compile`
 *                   to fetch and build Dawn before compiling this target.
 */

#ifdef GPU_BACKEND_DAWN

#include "gpu/gpu.h"
#include "foundation/global.h"
#include "foundation/logger.h"
#include "os/os.h"

#include <webgpu/webgpu.h>
#include <dawn/dawn_proc.h>
#include <dawn/native/DawnNative.h>

#include <cassert>
#include <cstdlib>
#include <cstring>
#include <vector>
#include <unordered_map>

// ---------------------------------------------------------------------------
// Internal resource tables
// ---------------------------------------------------------------------------

struct GpuTexture  { WGPUTexture     handle; WGPUTextureView view; WGPUTextureDescriptor desc; };
struct GpuSampler  { WGPUSampler     handle; };
struct GpuBuffer   { WGPUBuffer      handle; WGPUBufferDescriptor desc; };
struct GpuShader   { WGPUShaderModule vert; WGPUShaderModule frag; gpu_shader_desc orig; };
struct GpuPipeline { WGPURenderPipeline handle; WGPUPipelineLayout layout; gpu_pipeline_desc orig; };
struct GpuBinding  { WGPUBindGroup    handle; gpu_binding_desc orig; };
struct GpuMesh     { gpu_mesh_desc    orig; };
struct GpuPass     { WGPUTextureView  color_view; WGPUTextureView depth_view; bool screen; int width; int height; };

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

struct GpuState {
    dawn::native::Instance* dawn_instance = nullptr;
    WGPUInstance     instance  = nullptr;
    WGPUAdapter      adapter   = nullptr;
    WGPUDevice       device    = nullptr;
    WGPUQueue        queue     = nullptr;
    WGPUSurface      surface   = nullptr;
    WGPUSwapChain    swapchain = nullptr;

    int surface_width  = 0;
    int surface_height = 0;

    // Active frame
    WGPUCommandEncoder    cmd_encoder = nullptr;
    WGPURenderPassEncoder pass_encoder = nullptr;

    // Resource pools (id → resource)
    std::unordered_map<u32, GpuTexture>  textures;
    std::unordered_map<u32, GpuSampler>  samplers;
    std::unordered_map<u32, GpuBuffer>   buffers;
    std::unordered_map<u32, GpuShader>   shaders;
    std::unordered_map<u32, GpuPipeline> pipelines;
    std::unordered_map<u32, GpuBinding>  bindings;
    std::unordered_map<u32, GpuMesh>     meshes;
    std::unordered_map<u32, GpuPass>     passes;

    u32 next_id = 1;

    // Current render state
    u32  active_pipeline = 0;
    u32  active_pass     = 0;
};

static GpuState g;

// ---------------------------------------------------------------------------
// Helper: expose raw handles for ImGui backend
// ---------------------------------------------------------------------------

extern "C" {
    WGPUDevice       gpu_dawn_device(void)              { return g.device; }
    WGPUQueue        gpu_dawn_queue(void)               { return g.queue; }
    WGPURenderPassEncoder gpu_dawn_pass_encoder(void)   { return g.pass_encoder; }
}

// ---------------------------------------------------------------------------
// Helper: WebGPU format / enum conversions
// ---------------------------------------------------------------------------

static WGPUTextureFormat wgpu_pixel_format(gpu_pixel_format fmt) {
    switch (fmt) {
    case PIXELFORMAT_RGBA8:         return WGPUTextureFormat_RGBA8Unorm;
    case PIXELFORMAT_SRGB8A8:       return WGPUTextureFormat_RGBA8UnormSrgb;
    case PIXELFORMAT_BGRA8:         return WGPUTextureFormat_BGRA8Unorm;
    case PIXELFORMAT_R8:            return WGPUTextureFormat_R8Unorm;
    case PIXELFORMAT_R16F:          return WGPUTextureFormat_R16Float;
    case PIXELFORMAT_R32F:          return WGPUTextureFormat_R32Float;
    case PIXELFORMAT_RG8:           return WGPUTextureFormat_RG8Unorm;
    case PIXELFORMAT_RG16F:         return WGPUTextureFormat_RG16Float;
    case PIXELFORMAT_RG32F:         return WGPUTextureFormat_RG32Float;
    case PIXELFORMAT_RGBA16F:       return WGPUTextureFormat_RGBA16Float;
    case PIXELFORMAT_RGBA32F:       return WGPUTextureFormat_RGBA32Float;
    case PIXELFORMAT_DEPTH:         return WGPUTextureFormat_Depth32Float;
    case PIXELFORMAT_DEPTH_STENCIL: return WGPUTextureFormat_Depth24PlusStencil8;
    default:                        return WGPUTextureFormat_Undefined;
    }
}

static WGPUFilterMode wgpu_filter(gpu_filter f) {
    return (f == FILTER_LINEAR) ? WGPUFilterMode_Linear : WGPUFilterMode_Nearest;
}

static WGPUAddressMode wgpu_wrap(gpu_wrap w) {
    switch (w) {
    case WRAP_CLAMP_TO_EDGE:   return WGPUAddressMode_ClampToEdge;
    case WRAP_MIRRORED_REPEAT: return WGPUAddressMode_MirrorRepeat;
    default:                   return WGPUAddressMode_Repeat;
    }
}

static WGPUCompareFunction wgpu_compare(gpu_compare_func f) {
    switch (f) {
    case COMPARE_NEVER:         return WGPUCompareFunction_Never;
    case COMPARE_LESS:          return WGPUCompareFunction_Less;
    case COMPARE_EQUAL:         return WGPUCompareFunction_Equal;
    case COMPARE_LESS_EQUAL:    return WGPUCompareFunction_LessEqual;
    case COMPARE_GREATER:       return WGPUCompareFunction_Greater;
    case COMPARE_NOT_EQUAL:     return WGPUCompareFunction_NotEqual;
    case COMPARE_GREATER_EQUAL: return WGPUCompareFunction_GreaterEqual;
    case COMPARE_ALWAYS:        return WGPUCompareFunction_Always;
    default:                         return WGPUCompareFunction_Always;
    }
}

static WGPUBlendFactor wgpu_blend_factor(gpu_blend_factor f) {
    switch (f) {
    case BLEND_FACTOR_ZERO:                return WGPUBlendFactor_Zero;
    case BLEND_FACTOR_ONE:                 return WGPUBlendFactor_One;
    case BLEND_FACTOR_SRC_COLOR:           return WGPUBlendFactor_Src;
    case BLEND_FACTOR_ONE_MINUS_SRC_COLOR: return WGPUBlendFactor_OneMinusSrc;
    case BLEND_FACTOR_SRC_ALPHA:           return WGPUBlendFactor_SrcAlpha;
    case BLEND_FACTOR_ONE_MINUS_SRC_ALPHA: return WGPUBlendFactor_OneMinusSrcAlpha;
    case BLEND_FACTOR_DST_COLOR:           return WGPUBlendFactor_Dst;
    case BLEND_FACTOR_ONE_MINUS_DST_COLOR: return WGPUBlendFactor_OneMinusDst;
    case BLEND_FACTOR_DST_ALPHA:           return WGPUBlendFactor_DstAlpha;
    case BLEND_FACTOR_ONE_MINUS_DST_ALPHA: return WGPUBlendFactor_OneMinusDstAlpha;
    default:                               return WGPUBlendFactor_One;
    }
}

static WGPUBlendOperation wgpu_blend_op(gpu_blend_op op) {
    switch (op) {
    case BLEND_OP_ADD:              return WGPUBlendOperation_Add;
    case BLEND_OP_SUBTRACT:         return WGPUBlendOperation_Subtract;
    case BLEND_OP_REVERSE_SUBTRACT: return WGPUBlendOperation_ReverseSubtract;
    case BLEND_OP_MIN:              return WGPUBlendOperation_Min;
    case BLEND_OP_MAX:              return WGPUBlendOperation_Max;
    default:                        return WGPUBlendOperation_Add;
    }
}

static WGPUPrimitiveTopology wgpu_primitive(gpu_primitive_type t) {
    switch (t) {
    case PRIMITIVE_POINTS:         return WGPUPrimitiveTopology_PointList;
    case PRIMITIVE_LINES:          return WGPUPrimitiveTopology_LineList;
    case PRIMITIVE_LINE_STRIP:     return WGPUPrimitiveTopology_LineStrip;
    case PRIMITIVE_TRIANGLE_STRIP: return WGPUPrimitiveTopology_TriangleStrip;
    default:                            return WGPUPrimitiveTopology_TriangleList;
    }
}

static WGPUCullMode wgpu_cull(gpu_cull_mode m) {
    switch (m) {
    case CULL_FRONT: return WGPUCullMode_Front;
    case CULL_BACK:  return WGPUCullMode_Back;
    default:              return WGPUCullMode_None;
    }
}

static WGPUFrontFace wgpu_winding(gpu_face_winding w) {
    return (w == FACE_WINDING_CCW) ? WGPUFrontFace_CCW : WGPUFrontFace_CW;
}

static WGPUVertexFormat wgpu_vertex_format(gpu_attribute_format fmt, int size) {
    switch (fmt) {
    case ATTRIBUTE_FORMAT_FLOAT:
        if (size == 1) return WGPUVertexFormat_Float32;
        if (size == 2) return WGPUVertexFormat_Float32x2;
        if (size == 3) return WGPUVertexFormat_Float32x3;
        return WGPUVertexFormat_Float32x4;
    case ATTRIBUTE_FORMAT_INT:
        if (size == 1) return WGPUVertexFormat_Sint32;
        if (size == 2) return WGPUVertexFormat_Sint32x2;
        if (size == 3) return WGPUVertexFormat_Sint32x3;
        return WGPUVertexFormat_Sint32x4;
    case ATTRIBUTE_FORMAT_UINT:
        if (size == 1) return WGPUVertexFormat_Uint32;
        if (size == 2) return WGPUVertexFormat_Uint32x2;
        if (size == 3) return WGPUVertexFormat_Uint32x3;
        return WGPUVertexFormat_Uint32x4;
    default:
        return WGPUVertexFormat_Float32x4;
    }
}

static WGPUIndexFormat wgpu_index_format(gpu_index_type t) {
    return (t == INDEX_UINT32) ? WGPUIndexFormat_Uint32 : WGPUIndexFormat_Uint16;
}

// ---------------------------------------------------------------------------
// Device initialisation
// ---------------------------------------------------------------------------

bool gpu_request_device(os_window_t *window) {
    dawn::native::Adapter selected_adapter;

    // Install Dawn proc table so that raw webgpu.h calls work
    dawnProcSetProcs(&dawn::native::GetProcs());

    // Create Dawn instance
    g.dawn_instance = new dawn::native::Instance();
    g.instance = g.dawn_instance->Get();

    g.surface_width  = window->framebuffer_width  ? window->framebuffer_width  : window->width;
    g.surface_height = window->framebuffer_height ? window->framebuffer_height : window->height;

    // Create a surface from the native window handle stored in os_window_t
    {
        WGPUSurfaceDescriptor surf_desc = {};
        surf_desc.label = "main_surface";

#if defined(OS_MACOS)
        // native_window is a CAMetalLayer* (set by os.macos.mm)
        WGPUSurfaceDescriptorFromMetalLayer metal_desc = {};
    metal_desc.chain.sType = WGPUSType_SurfaceSourceMetalLayer;
        metal_desc.layer       = window->native_window;
        surf_desc.nextInChain  = &metal_desc.chain;
#elif defined(OS_WINDOWS)
        WGPUSurfaceDescriptorFromWindowsHWND win_desc = {};
    win_desc.chain.sType   = WGPUSType_SurfaceSourceWindowsHWND;
        win_desc.hwnd          = window->native_window;
        win_desc.hinstance     = GetModuleHandle(nullptr);
        surf_desc.nextInChain  = &win_desc.chain;
#elif defined(OS_LINUX)
        WGPUSurfaceDescriptorFromXlibWindow x11_desc = {};
    x11_desc.chain.sType   = WGPUSType_SurfaceSourceXlibWindow;
        x11_desc.window        = (uint32_t)(uintptr_t)window->native_window;
        surf_desc.nextInChain  = &x11_desc.chain;
#endif
        g.surface = wgpuInstanceCreateSurface(g.instance, &surf_desc);
    }

    // Request adapter (synchronous via Dawn's C++ API)
    {
        WGPURequestAdapterOptions opts = {};
        opts.compatibleSurface    = g.surface;
        opts.powerPreference      = WGPUPowerPreference_HighPerformance;
        opts.backendType          = WGPUBackendType_Undefined; // let Dawn pick

        std::vector<dawn::native::Adapter> adapters = g.dawn_instance->EnumerateAdapters(&opts);
        if (adapters.empty()) {
            ULOG_ERROR("gpu.dawn: no WebGPU adapters found");
            return false;
        }
        selected_adapter = adapters[0];
        g.adapter = selected_adapter.Get();
    }

    // Request device (synchronous)
    {
        WGPUDeviceDescriptor dev_desc = {};
        dev_desc.label = "dawn_device";
        dev_desc.defaultQueue.label = "dawn_queue";
        g.device = selected_adapter.CreateDevice(&dev_desc);
        if (!g.device) {
            ULOG_ERROR("gpu.dawn: failed to create WebGPU device");
            return false;
        }
        wgpuDeviceSetUncapturedErrorCallback(g.device,
            [](WGPUErrorType type, const char* msg, void*) {
                (void)type;
                ULOG_ERROR_FMT("gpu.dawn: {}", msg ? msg : "uncaptured WebGPU error");
            }, nullptr);
    }

    g.queue = wgpuDeviceGetQueue(g.device);

    // Create swap chain
    {
        WGPUSwapChainDescriptor sc_desc = {};
        sc_desc.label       = "main_swapchain";
        sc_desc.usage       = WGPUTextureUsage_RenderAttachment;
        sc_desc.format      = WGPUTextureFormat_BGRA8Unorm;
        sc_desc.width       = (uint32_t)g.surface_width;
        sc_desc.height      = (uint32_t)g.surface_height;
        sc_desc.presentMode = WGPUPresentMode_Fifo;
        g.swapchain = wgpuDeviceCreateSwapChain(g.device, g.surface, &sc_desc);
    }

    window->gpu_device = g.device;
    ULOG_INFO("gpu.dawn: WebGPU device created via Dawn");
    return true;
}

void gpu_destroy_device(void) {
    if (g.swapchain) { wgpuSwapChainRelease(g.swapchain); g.swapchain = nullptr; }
    if (g.surface)   { wgpuSurfaceRelease(g.surface);     g.surface   = nullptr; }
    if (g.queue)     { wgpuQueueRelease(g.queue);         g.queue     = nullptr; }
    if (g.device)    { wgpuDeviceRelease(g.device);       g.device    = nullptr; }
    if (g.adapter)   { wgpuAdapterRelease(g.adapter);     g.adapter   = nullptr; }
    if (g.instance)  { wgpuInstanceRelease(g.instance);   g.instance  = nullptr; }
    delete g.dawn_instance;
    g.dawn_instance = nullptr;
}

// ---------------------------------------------------------------------------
// Texture
// ---------------------------------------------------------------------------

gpu_texture gpu_create_texture(gpu_texture_desc *desc) {
    WGPUTextureDescriptor td = {};
    td.label         = "texture";
    td.usage         = WGPUTextureUsage_TextureBinding | WGPUTextureUsage_CopyDst;
    if ((desc->usage & TEXTURE_USAGE_RENDER_TARGET) != 0)
        td.usage |= WGPUTextureUsage_RenderAttachment;
    td.dimension     = WGPUTextureDimension_2D;
    td.size          = { (uint32_t)desc->width, (uint32_t)desc->height, 1 };
    td.format        = wgpu_pixel_format(desc->format);
    td.mipLevelCount = 1;
    td.sampleCount   = 1;

    GpuTexture t;
    t.desc    = td;
    t.handle  = wgpuDeviceCreateTexture(g.device, &td);

    WGPUTextureViewDescriptor vd = {};
    vd.format          = td.format;
    vd.dimension       = WGPUTextureViewDimension_2D;
    vd.mipLevelCount   = 1;
    vd.arrayLayerCount = 1;
    t.view = wgpuTextureCreateView(t.handle, &vd);

    if (desc->data.data && desc->data.length > 0) {
        WGPUImageCopyTexture dst = {};
        dst.texture  = t.handle;
        dst.mipLevel = 0;
        WGPUTextureDataLayout layout = {};
        layout.bytesPerRow  = (uint32_t)gpu_pixel_format_row_pitch(desc->format, desc->width, 1);
        layout.rowsPerImage = (uint32_t)desc->height;
        WGPUExtent3D extent = { (uint32_t)desc->width, (uint32_t)desc->height, 1 };
        wgpuQueueWriteTexture(g.queue, &dst, desc->data.data, desc->data.length, &layout, &extent);
    }

    u32 id = g.next_id++;
    g.textures[id] = t;
    return {id};
}

void gpu_destroy_texture(gpu_texture texture) {
    auto it = g.textures.find(texture.id);
    if (it == g.textures.end()) return;
    wgpuTextureViewRelease(it->second.view);
    wgpuTextureRelease(it->second.handle);
    g.textures.erase(it);
}

void gpu_update_texture(gpu_texture texture, udata data) {
    auto it = g.textures.find(texture.id);
    if (it == g.textures.end()) return;
    GpuTexture &t = it->second;
    WGPUImageCopyTexture dst = {};
    dst.texture  = t.handle;
    dst.mipLevel = 0;
    WGPUTextureDataLayout layout = {};
    layout.bytesPerRow  = t.desc.size.width * 4; // assumed RGBA8
    layout.rowsPerImage = t.desc.size.height;
    WGPUExtent3D extent = t.desc.size;
    wgpuQueueWriteTexture(g.queue, &dst, data.data, data.length, &layout, &extent);
}

// ---------------------------------------------------------------------------
// Sampler
// ---------------------------------------------------------------------------

gpu_sampler gpu_create_sampler(gpu_sampler_desc *desc) {
    WGPUSamplerDescriptor sd = {};
    sd.addressModeU  = wgpu_wrap(desc->wrap_u);
    sd.addressModeV  = wgpu_wrap(desc->wrap_v);
    sd.addressModeW  = wgpu_wrap(desc->wrap_w);
    sd.magFilter     = wgpu_filter(desc->mag_filter);
    sd.minFilter     = wgpu_filter(desc->min_filter);
    sd.mipmapFilter  = WGPUMipmapFilterMode_Nearest;
    sd.maxAnisotropy = desc->max_anisotropy > 0 ? (uint16_t)desc->max_anisotropy : 1;
    if (desc->compare_func != COMPARE_AUTO)
        sd.compare = wgpu_compare(desc->compare_func);

    GpuSampler s;
    s.handle = wgpuDeviceCreateSampler(g.device, &sd);

    u32 id = g.next_id++;
    g.samplers[id] = s;
    return {id};
}

void gpu_destroy_sampler(gpu_sampler sampler) {
    auto it = g.samplers.find(sampler.id);
    if (it == g.samplers.end()) return;
    wgpuSamplerRelease(it->second.handle);
    g.samplers.erase(it);
}

// ---------------------------------------------------------------------------
// Buffer
// ---------------------------------------------------------------------------

gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc) {
    WGPUBufferUsage usage = WGPUBufferUsage_CopyDst;
    if (desc->type == BUFFER_VERTEX)  usage |= WGPUBufferUsage_Vertex;
    if (desc->type == BUFFER_INDEX)   usage |= WGPUBufferUsage_Index;
    if (desc->type == BUFFER_UNIFORM) usage |= WGPUBufferUsage_Uniform;
    if (desc->type == BUFFER_STORAGE) usage |= WGPUBufferUsage_Storage;

    WGPUBufferDescriptor bd = {};
    bd.label = "buffer";
    bd.usage = usage;
    bd.size  = (uint64_t)((desc->size + 3) & ~3); // align to 4 bytes

    GpuBuffer b;
    b.handle = wgpuDeviceCreateBuffer(g.device, &bd);
    b.desc   = bd;

    if (desc->data.data && desc->data.length > 0)
        wgpuQueueWriteBuffer(g.queue, b.handle, 0, desc->data.data, desc->data.length);

    u32 id = g.next_id++;
    g.buffers[id] = b;
    return {id};
}

void gpu_destroy_buffer(gpu_buffer buffer) {
    auto it = g.buffers.find(buffer.id);
    if (it == g.buffers.end()) return;
    wgpuBufferRelease(it->second.handle);
    g.buffers.erase(it);
}

void gpu_update_buffer(gpu_buffer buffer, udata data) {
    auto it = g.buffers.find(buffer.id);
    if (it == g.buffers.end()) return;
    wgpuQueueWriteBuffer(g.queue, it->second.handle, 0, data.data, data.length);
}

// ---------------------------------------------------------------------------
// Shader
// ---------------------------------------------------------------------------

gpu_shader gpu_create_shader(gpu_shader_desc *desc) {
    auto make_module = [&](const gpu_shader_stage_desc &stage) -> WGPUShaderModule {
        WGPUShaderSourceWGSL wgsl = {};
        wgsl.chain.sType = WGPUSType_ShaderSourceWGSL;
        wgsl.code.data   = stage.source.data;
        wgsl.code.length = stage.source.length;

        WGPUShaderModuleDescriptor smd = {};
        smd.nextInChain = &wgsl.chain;
        return wgpuDeviceCreateShaderModule(g.device, &smd);
    };

    GpuShader s;
    s.orig = *desc;
    s.vert = make_module(desc->vertex);
    s.frag = make_module(desc->fragment);

    u32 id = g.next_id++;
    g.shaders[id] = s;
    return {id};
}

void gpu_destroy_shader(gpu_shader shader) {
    auto it = g.shaders.find(shader.id);
    if (it == g.shaders.end()) return;
    wgpuShaderModuleRelease(it->second.vert);
    wgpuShaderModuleRelease(it->second.frag);
    g.shaders.erase(it);
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

gpu_pipeline gpu_create_pipeline(gpu_pipeline_desc *desc) {
    auto sit = g.shaders.find(desc->shader.id);
    if (sit == g.shaders.end()) return {0};
    GpuShader &sh = sit->second;

    // Build vertex attribute / buffer layouts
    std::vector<WGPUVertexAttribute> vert_attrs;
    std::vector<WGPUVertexBufferLayout> vert_bufs;

    for (int bi = 0; bi < GPU_VERTEX_BUFFER_COUNT; ++bi) {
        const auto &buf_layout = desc->layout.buffers[bi];
        if (buf_layout.stride == 0) continue;

        std::vector<WGPUVertexAttribute> attrs_for_buf;
        for (int ai = 0; ai < GPU_ATTRIBUTE_COUNT; ++ai) {
            const auto &attr = desc->layout.attributes[ai];
            if (attr.buffer_index != bi || attr.format == ATTRIBUTE_FORMAT_INVALID) continue;
            WGPUVertexAttribute wa = {};
            wa.format         = wgpu_vertex_format(attr.format, attr.size);
            wa.offset         = (uint64_t)attr.offset;
            wa.shaderLocation = (uint32_t)ai;
            attrs_for_buf.push_back(wa);
        }
        if (attrs_for_buf.empty()) continue;

        // Copy into persistent storage owned by vert_attrs
        size_t base = vert_attrs.size();
        for (auto &a : attrs_for_buf) vert_attrs.push_back(a);

        WGPUVertexBufferLayout vbl = {};
        vbl.arrayStride    = (uint64_t)buf_layout.stride;
        vbl.stepMode       = (buf_layout.step_func == VERTEX_STEP_PER_INSTANCE)
                             ? WGPUVertexStepMode_Instance : WGPUVertexStepMode_Vertex;
        vbl.attributeCount = (uint32_t)attrs_for_buf.size();
        vbl.attributes     = vert_attrs.data() + base;
        vert_bufs.push_back(vbl);
    }

    // Colour target states
    std::vector<WGPUColorTargetState> color_targets;
    std::vector<WGPUBlendState>       blend_states;
    for (int ci = 0; ci < desc->color_count; ++ci) {
        const auto &ct = desc->colors[ci];
        WGPUBlendState bs = {};
        if (ct.blend.enabled) {
            bs.color.operation = wgpu_blend_op(ct.blend.op);
            bs.color.srcFactor = wgpu_blend_factor(ct.blend.src_factor);
            bs.color.dstFactor = wgpu_blend_factor(ct.blend.dst_factor);
            bs.alpha.operation = wgpu_blend_op(ct.blend.op_alpha);
            bs.alpha.srcFactor = wgpu_blend_factor(ct.blend.src_factor_alpha);
            bs.alpha.dstFactor = wgpu_blend_factor(ct.blend.dst_factor_alpha);
        }
        blend_states.push_back(bs);

        WGPUColorTargetState cts = {};
        cts.format    = wgpu_pixel_format(ct.format != _PIXELFORMAT_DEFAULT
                            ? ct.format : PIXELFORMAT_BGRA8);
        cts.blend     = ct.blend.enabled ? &blend_states.back() : nullptr;
        cts.writeMask = WGPUColorWriteMask_All;
        color_targets.push_back(cts);
    }
    if (color_targets.empty()) {
        WGPUColorTargetState cts = {};
        cts.format    = WGPUTextureFormat_BGRA8Unorm;
        cts.writeMask = WGPUColorWriteMask_All;
        color_targets.push_back(cts);
    }

    // Depth/stencil
    WGPUDepthStencilState ds_state = {};
    bool has_depth = (desc->depth.format != PIXELFORMAT_NONE && desc->depth.format != _PIXELFORMAT_DEFAULT);
    if (has_depth) {
        ds_state.format            = wgpu_pixel_format(desc->depth.format);
        ds_state.depthWriteEnabled = desc->depth.write_enabled ? WGPUOptionalBool_True : WGPUOptionalBool_False;
        ds_state.depthCompare      = wgpu_compare(desc->depth.compare_func);
    }

    WGPUVertexState vert_state = {};
    vert_state.module     = sh.vert;
    vert_state.entryPoint = sh.orig.vertex.entry.data ? sh.orig.vertex.entry.data : "vs_main";
    vert_state.bufferCount = (uint32_t)vert_bufs.size();
    vert_state.buffers     = vert_bufs.data();

    WGPUFragmentState frag_state = {};
    frag_state.module      = sh.frag;
    frag_state.entryPoint  = sh.orig.fragment.entry.data ? sh.orig.fragment.entry.data : "fs_main";
    frag_state.targetCount = (uint32_t)color_targets.size();
    frag_state.targets     = color_targets.data();

    WGPURenderPipelineDescriptor rp_desc = {};
    rp_desc.label     = desc->label.data ? desc->label.data : "pipeline";
    rp_desc.vertex    = vert_state;
    rp_desc.primitive = {
        .topology         = wgpu_primitive(desc->primitive_type),
        .stripIndexFormat = (desc->primitive_type == PRIMITIVE_TRIANGLE_STRIP ||
                             desc->primitive_type == PRIMITIVE_LINE_STRIP)
                            ? wgpu_index_format(desc->index_type) : WGPUIndexFormat_Undefined,
        .frontFace        = wgpu_winding(desc->face_winding),
        .cullMode         = wgpu_cull(desc->cull_mode),
    };
    if (has_depth) rp_desc.depthStencil = &ds_state;
    rp_desc.multisample = { .count = 1, .mask = 0xFFFFFFFF };
    rp_desc.fragment    = &frag_state;

    GpuPipeline p;
    p.orig   = *desc;
    p.layout = nullptr;
    p.handle = wgpuDeviceCreateRenderPipeline(g.device, &rp_desc);

    u32 id = g.next_id++;
    g.pipelines[id] = p;
    return {id};
}

void gpu_destroy_pipeline(gpu_pipeline pipeline) {
    auto it = g.pipelines.find(pipeline.id);
    if (it == g.pipelines.end()) return;
    wgpuRenderPipelineRelease(it->second.handle);
    g.pipelines.erase(it);
}

gpu_pipeline_reflection gpu_pipeline_get_reflection(gpu_pipeline pipeline) {
    gpu_pipeline_reflection r = {};
    auto it = g.pipelines.find(pipeline.id);
    if (it != g.pipelines.end()) {
        r.layout     = it->second.orig.layout;
        r.index_type = it->second.orig.index_type;
    }
    return r;
}

// ---------------------------------------------------------------------------
// Binding (BindGroup)
// ---------------------------------------------------------------------------

gpu_binding gpu_create_binding(gpu_binding_desc *desc) {
    auto pit = g.pipelines.find(desc->pipeline.id);
    if (pit == g.pipelines.end()) return {0};

    std::vector<WGPUBindGroupEntry> entries;

    for (int i = 0; i < GPU_SHADER_BUFFER_COUNT; ++i) {
        if (desc->buffers[i].buffer.id == 0) continue;
        auto bit = g.buffers.find(desc->buffers[i].buffer.id);
        if (bit == g.buffers.end()) continue;
        WGPUBindGroupEntry e = {};
        e.binding = (uint32_t)i;
        e.buffer  = bit->second.handle;
        e.offset  = desc->buffers[i].offset;
        e.size    = bit->second.desc.size;
        entries.push_back(e);
    }

    int base = (int)entries.size();
    for (int i = 0; i < GPU_SHADER_TEXTURE_COUNT; ++i) {
        if (desc->textures[i].texture.id == 0) continue;
        auto tit = g.textures.find(desc->textures[i].texture.id);
        if (tit == g.textures.end()) continue;
        WGPUBindGroupEntry e = {};
        e.binding     = (uint32_t)(base + i * 2);
        e.textureView = tit->second.view;
        entries.push_back(e);

        auto sit = g.samplers.find(desc->textures[i].sampler.id);
        if (sit != g.samplers.end()) {
            WGPUBindGroupEntry se = {};
            se.binding = (uint32_t)(base + i * 2 + 1);
            se.sampler = sit->second.handle;
            entries.push_back(se);
        }
    }

    WGPUBindGroupLayout bgl = wgpuRenderPipelineGetBindGroupLayout(pit->second.handle, desc->group);
    WGPUBindGroupDescriptor bgd = {};
    bgd.label      = desc->label.data ? desc->label.data : "binding";
    bgd.layout     = bgl;
    bgd.entryCount = (uint32_t)entries.size();
    bgd.entries    = entries.data();

    GpuBinding b;
    b.orig   = *desc;
    b.handle = wgpuDeviceCreateBindGroup(g.device, &bgd);

    wgpuBindGroupLayoutRelease(bgl);

    u32 id = g.next_id++;
    g.bindings[id] = b;
    return {id};
}

void gpu_destroy_binding(gpu_binding binding) {
    auto it = g.bindings.find(binding.id);
    if (it == g.bindings.end()) return;
    wgpuBindGroupRelease(it->second.handle);
    g.bindings.erase(it);
}

// ---------------------------------------------------------------------------
// Mesh (vertex/index buffer references)
// ---------------------------------------------------------------------------

gpu_mesh gpu_create_mesh(gpu_mesh_desc *desc) {
    GpuMesh m;
    m.orig = *desc;
    u32 id = g.next_id++;
    g.meshes[id] = m;
    return {id};
}

void gpu_destroy_mesh(gpu_mesh mesh) {
    g.meshes.erase(mesh.id);
}

// ---------------------------------------------------------------------------
// Render Pass
// ---------------------------------------------------------------------------

gpu_render_pass gpu_create_render_pass(gpu_render_pass_desc *desc) {
    GpuPass p;
    p.screen      = desc->screen;
    p.width       = desc->width;
    p.height      = desc->height;
    p.color_view  = nullptr;
    p.depth_view  = nullptr;

    if (!desc->screen) {
        // offscreen — build texture views from the attachment descriptors
        if (desc->colors[0].desc.texture.id != 0) {
            auto it = g.textures.find(desc->colors[0].desc.texture.id);
            if (it != g.textures.end()) p.color_view = it->second.view;
        }
        if (desc->depth.desc.texture.id != 0) {
            auto it = g.textures.find(desc->depth.desc.texture.id);
            if (it != g.textures.end()) p.depth_view = it->second.view;
        }
    }

    u32 id = g.next_id++;
    g.passes[id] = p;
    return {id};
}

void gpu_destroy_render_pass(gpu_render_pass pass) {
    g.passes.erase(pass.id);
}

// ---------------------------------------------------------------------------
// Frame commands
// ---------------------------------------------------------------------------

void gpu_begin_render_pass(gpu_render_pass pass) {
    assert(!g.cmd_encoder && "gpu_begin_render_pass: already in a pass");

    auto pit = g.passes.find(pass.id);
    if (pit == g.passes.end()) return;
    GpuPass &p = pit->second;
    g.active_pass = pass.id;

    WGPUCommandEncoderDescriptor ced = {};
    ced.label       = "frame_encoder";
    g.cmd_encoder   = wgpuDeviceCreateCommandEncoder(g.device, &ced);

    WGPUTextureView color_view;
    if (p.screen) {
        color_view = wgpuSwapChainGetCurrentTextureView(g.swapchain);
    } else {
        color_view = p.color_view;
    }

    WGPURenderPassColorAttachment color_att = {};
    color_att.view          = color_view;
    color_att.loadOp        = WGPULoadOp_Clear;
    color_att.storeOp       = WGPUStoreOp_Store;
    color_att.clearValue    = {0.1, 0.1, 0.1, 1.0};

    WGPURenderPassDepthStencilAttachment depth_att = {};
    bool has_depth = (p.depth_view != nullptr);
    if (has_depth) {
        depth_att.view              = p.depth_view;
        depth_att.depthLoadOp       = WGPULoadOp_Clear;
        depth_att.depthStoreOp      = WGPUStoreOp_Discard;
        depth_att.depthClearValue   = 1.0f;
    }

    WGPURenderPassDescriptor rp_desc = {};
    rp_desc.label                  = "render_pass";
    rp_desc.colorAttachmentCount   = 1;
    rp_desc.colorAttachments       = &color_att;
    rp_desc.depthStencilAttachment = has_depth ? &depth_att : nullptr;

    g.pass_encoder = wgpuCommandEncoderBeginRenderPass(g.cmd_encoder, &rp_desc);

    if (p.screen) {
        // Release the swap-chain view; Dawn will internally ref it via the pass
        wgpuTextureViewRelease(color_view);
    }
}

void gpu_set_viewport(int x, int y, int width, int height) {
    if (!g.pass_encoder) return;
    wgpuRenderPassEncoderSetViewport(g.pass_encoder,
        (float)x, (float)y, (float)width, (float)height, 0.0f, 1.0f);
}

void gpu_set_scissor(int x, int y, int width, int height) {
    if (!g.pass_encoder) return;
    wgpuRenderPassEncoderSetScissorRect(g.pass_encoder,
        (uint32_t)x, (uint32_t)y, (uint32_t)width, (uint32_t)height);
}

void gpu_set_pipeline(gpu_pipeline pipeline) {
    if (!g.pass_encoder) return;
    auto it = g.pipelines.find(pipeline.id);
    if (it == g.pipelines.end()) return;
    g.active_pipeline = pipeline.id;
    wgpuRenderPassEncoderSetPipeline(g.pass_encoder, it->second.handle);
}

void gpu_set_binding(gpu_binding binding) {
    if (!g.pass_encoder) return;
    auto it = g.bindings.find(binding.id);
    if (it == g.bindings.end()) return;
    wgpuRenderPassEncoderSetBindGroup(g.pass_encoder,
        it->second.orig.group, it->second.handle, 0, nullptr);
}

void gpu_set_mesh(gpu_mesh mesh) {
    if (!g.pass_encoder) return;
    auto mit = g.meshes.find(mesh.id);
    if (mit == g.meshes.end()) return;
    const gpu_mesh_desc &md = mit->second.orig;

    for (int i = 0; i < GPU_VERTEX_BUFFER_COUNT; ++i) {
        if (md.buffers[i].id == 0) continue;
        auto bit = g.buffers.find(md.buffers[i].id);
        if (bit == g.buffers.end()) continue;
        wgpuRenderPassEncoderSetVertexBuffer(g.pass_encoder,
            (uint32_t)i, bit->second.handle, md.buffer_offsets[i], WGPU_WHOLE_SIZE);
    }

    if (md.index_buffer.id != 0) {
        auto iit = g.buffers.find(md.index_buffer.id);
        if (iit != g.buffers.end()) {
            wgpuRenderPassEncoderSetIndexBuffer(g.pass_encoder,
                iit->second.handle,
                wgpu_index_format(md.index_type),
                md.index_buffer_offset, WGPU_WHOLE_SIZE);
        }
    }
}

void gpu_draw(int base, int count, int instance_count) {
    if (!g.pass_encoder) return;
    auto pit = g.pipelines.find(g.active_pipeline);
    bool indexed = (pit != g.pipelines.end() && pit->second.orig.index_type != INDEX_NONE);
    if (indexed) {
        wgpuRenderPassEncoderDrawIndexed(g.pass_encoder,
            (uint32_t)count, (uint32_t)instance_count, (uint32_t)base, 0, 0);
    } else {
        wgpuRenderPassEncoderDraw(g.pass_encoder,
            (uint32_t)count, (uint32_t)instance_count, (uint32_t)base, 0);
    }
}

void gpu_end_pass(void) {
    if (!g.pass_encoder) return;
    wgpuRenderPassEncoderEnd(g.pass_encoder);
    wgpuRenderPassEncoderRelease(g.pass_encoder);
    g.pass_encoder   = nullptr;
    g.active_pass    = 0;
    g.active_pipeline = 0;
}

void gpu_commit(void) {
    if (!g.cmd_encoder) return;
    WGPUCommandBufferDescriptor cbd = {};
    WGPUCommandBuffer cmd_buf = wgpuCommandEncoderFinish(g.cmd_encoder, &cbd);
    wgpuCommandEncoderRelease(g.cmd_encoder);
    g.cmd_encoder = nullptr;

    wgpuQueueSubmit(g.queue, 1, &cmd_buf);
    wgpuCommandBufferRelease(cmd_buf);
    wgpuSwapChainPresent(g.swapchain);
}

#endif // GPU_BACKEND_DAWN
