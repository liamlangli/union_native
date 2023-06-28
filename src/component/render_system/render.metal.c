#if defined(OS_OSX)

#include "component/render_system/render_system.h"
#include "component/render_system/metal/metal_backend.h"

typedef struct swapchain_o {
    metal_swapchain_t *swapchain;
} swapchain_o;

typedef struct render_system_t {
    metal_device_t *gpu_device;
    metal_library_t *library;
} render_system_t;

static render_system_t render_system;

void render_system_init(void) {
    render_system.gpu_device = metal_create_default_device();
    render_system.library = metal_create_library_from_source(render_system.gpu_device, "build/metallib/default.metallib");
}

void render_system_swapchain_present(swapchain_o *swapchain) {
    metal_present(swapchain->swapchain);
}

swapchain_o* render_system_create_swapchain(window_t *window)
{
    GLFWwindow *native_window = (GLFWwindow*)platform_window_get_native_handle(window);
    swapchain_o *swapchain = malloc(sizeof(swapchain_o));
    swapchain->swapchain = metal_create_swapchain(render_system.gpu_device, native_window);
    return swapchain;
}

void render_system_terminate(void) {
    
}

#endif