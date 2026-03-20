#include "webgpu_context.h"

#include "core/logger.h"

#include <dawn/dawn_proc.h>
#include <dawn/native/DawnNative.h>

#include <vector>

#if defined(OS_WINDOWS)
#include <windows.h>
#endif

struct WebGpuContextState {
    dawn::native::Instance *dawn_instance = nullptr;
    WGPUInstance instance = nullptr;
    WGPUAdapter adapter = nullptr;
    WGPUDevice device = nullptr;
    WGPUQueue queue = nullptr;
    WGPUSurface surface = nullptr;
    WGPUSwapChain swapchain = nullptr;

    WGPUTextureView frame_view = nullptr;

    u32 surface_width = 0;
    u32 surface_height = 0;
};

static WebGpuContextState g_webgpu = {};
static constexpr WGPUTextureFormat kSurfaceFormat = WGPUTextureFormat_BGRA8Unorm;

static bool webgpu_recreate_swapchain(void) {
    if (g_webgpu.device == nullptr || g_webgpu.surface == nullptr) {
        return false;
    }

    if (g_webgpu.swapchain != nullptr) {
        wgpuSwapChainRelease(g_webgpu.swapchain);
        g_webgpu.swapchain = nullptr;
    }

    WGPUSwapChainDescriptor swapchain_desc = {};
    swapchain_desc.label = "main_swapchain";
    swapchain_desc.usage = WGPUTextureUsage_RenderAttachment;
    swapchain_desc.format = kSurfaceFormat;
    swapchain_desc.width = g_webgpu.surface_width;
    swapchain_desc.height = g_webgpu.surface_height;
    swapchain_desc.presentMode = WGPUPresentMode_Fifo;
    g_webgpu.swapchain = wgpuDeviceCreateSwapChain(g_webgpu.device, g_webgpu.surface, &swapchain_desc);
    return g_webgpu.swapchain != nullptr;
}

bool webgpu_context_init(os_window_t *window) {
    dawn::native::Adapter selected_adapter;

    dawnProcSetProcs(&dawn::native::GetProcs());

    g_webgpu.dawn_instance = new dawn::native::Instance();
    g_webgpu.instance = g_webgpu.dawn_instance->Get();

    g_webgpu.surface_width = window->framebuffer_width > 0 ? (u32)window->framebuffer_width : (u32)window->width;
    g_webgpu.surface_height = window->framebuffer_height > 0 ? (u32)window->framebuffer_height : (u32)window->height;

    WGPUSurfaceDescriptor surface_desc = {};
    surface_desc.label = "main_surface";

#if defined(OS_MACOS)
    WGPUSurfaceDescriptorFromMetalLayer metal_desc = {};
    metal_desc.chain.sType = WGPUSType_SurfaceSourceMetalLayer;
    metal_desc.layer = window->native_window;
    surface_desc.nextInChain = &metal_desc.chain;
#elif defined(OS_WINDOWS)
    WGPUSurfaceDescriptorFromWindowsHWND window_desc = {};
    window_desc.chain.sType = WGPUSType_SurfaceSourceWindowsHWND;
    window_desc.hwnd = window->native_window;
    window_desc.hinstance = GetModuleHandle(nullptr);
    surface_desc.nextInChain = &window_desc.chain;
#elif defined(OS_LINUX)
    WGPUSurfaceDescriptorFromXlibWindow x11_desc = {};
    x11_desc.chain.sType = WGPUSType_SurfaceSourceXlibWindow;
    x11_desc.window = (uint32_t)(uintptr_t)window->native_window;
    surface_desc.nextInChain = &x11_desc.chain;
#endif

    g_webgpu.surface = wgpuInstanceCreateSurface(g_webgpu.instance, &surface_desc);
    if (g_webgpu.surface == nullptr) {
        ULOG_ERROR("webgpu: failed to create surface");
        return false;
    }

    WGPURequestAdapterOptions adapter_opts = {};
    adapter_opts.compatibleSurface = g_webgpu.surface;
    adapter_opts.powerPreference = WGPUPowerPreference_HighPerformance;
    adapter_opts.backendType = WGPUBackendType_Undefined;

    std::vector<dawn::native::Adapter> adapters = g_webgpu.dawn_instance->EnumerateAdapters(&adapter_opts);
    if (adapters.empty()) {
        ULOG_ERROR("webgpu: no adapters found");
        return false;
    }

    selected_adapter = adapters[0];
    g_webgpu.adapter = selected_adapter.Get();

    WGPUDeviceDescriptor device_desc = {};
    device_desc.label = "dawn_device";
    device_desc.defaultQueue.label = "dawn_queue";
    g_webgpu.device = selected_adapter.CreateDevice(&device_desc);
    if (g_webgpu.device == nullptr) {
        ULOG_ERROR("webgpu: failed to create device");
        return false;
    }

    wgpuDeviceSetUncapturedErrorCallback(
        g_webgpu.device,
        [](WGPUErrorType, const char *message, void *) {
            ULOG_ERROR(message != nullptr ? message : "webgpu: uncaptured error");
        },
        nullptr);

    g_webgpu.queue = wgpuDeviceGetQueue(g_webgpu.device);
    if (!webgpu_recreate_swapchain()) {
        ULOG_ERROR("webgpu: failed to create swapchain");
        return false;
    }

    window->gpu_device = g_webgpu.device;
    return true;
}

void webgpu_context_shutdown(void) {
    if (g_webgpu.frame_view != nullptr) {
        wgpuTextureViewRelease(g_webgpu.frame_view);
        g_webgpu.frame_view = nullptr;
    }

    if (g_webgpu.swapchain != nullptr) {
        wgpuSwapChainRelease(g_webgpu.swapchain);
        g_webgpu.swapchain = nullptr;
    }
    if (g_webgpu.surface != nullptr) {
        wgpuSurfaceRelease(g_webgpu.surface);
        g_webgpu.surface = nullptr;
    }
    if (g_webgpu.queue != nullptr) {
        wgpuQueueRelease(g_webgpu.queue);
        g_webgpu.queue = nullptr;
    }
    if (g_webgpu.device != nullptr) {
        wgpuDeviceRelease(g_webgpu.device);
        g_webgpu.device = nullptr;
    }
    if (g_webgpu.adapter != nullptr) {
        wgpuAdapterRelease(g_webgpu.adapter);
        g_webgpu.adapter = nullptr;
    }
    if (g_webgpu.instance != nullptr) {
        wgpuInstanceRelease(g_webgpu.instance);
        g_webgpu.instance = nullptr;
    }
    delete g_webgpu.dawn_instance;
    g_webgpu.dawn_instance = nullptr;
}

void webgpu_context_resize(os_window_t *window) {
    g_webgpu.surface_width = window->framebuffer_width > 0 ? (u32)window->framebuffer_width : (u32)window->width;
    g_webgpu.surface_height = window->framebuffer_height > 0 ? (u32)window->framebuffer_height : (u32)window->height;
    webgpu_recreate_swapchain();
}

WGPUDevice webgpu_device(void) {
    return g_webgpu.device;
}

WGPUQueue webgpu_queue(void) {
    return g_webgpu.queue;
}

WGPUTextureFormat webgpu_surface_format(void) {
    return kSurfaceFormat;
}

WGPUTextureView webgpu_current_texture_view(void) {
    return g_webgpu.frame_view;
}

bool webgpu_begin_frame(void) {
    if (g_webgpu.device == nullptr || g_webgpu.swapchain == nullptr) {
        return false;
    }

    if (g_webgpu.frame_view != nullptr) {
        wgpuTextureViewRelease(g_webgpu.frame_view);
        g_webgpu.frame_view = nullptr;
    }

    g_webgpu.frame_view = wgpuSwapChainGetCurrentTextureView(g_webgpu.swapchain);
    if (g_webgpu.frame_view == nullptr) {
        ULOG_ERROR("webgpu: failed to acquire frame view");
        return false;
    }
    return true;
}

void webgpu_end_frame(void) {
    wgpuSwapChainPresent(g_webgpu.swapchain);
    if (g_webgpu.frame_view != nullptr) {
        wgpuTextureViewRelease(g_webgpu.frame_view);
        g_webgpu.frame_view = nullptr;
    }
}
