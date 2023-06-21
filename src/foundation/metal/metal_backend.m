#include "metal_backend.h"

#import <Metal/Metal.h>
#import <QuartzCore/CAMetalLayer.h>


typedef struct metal_device_t {
    id<MTLDevice> gpu;
    id<MTLCommandQueue> queue;
    CAMetalLayer *swapchain;
} metal_device_t;
static metal_device_t *g_metal_device;

metal_device_t* metal_create_default_device(void) {
    const id<MTLDevice> device = MTLCreateSystemDefaultDevice();
    const id<MTLCommandQueue> queue = [device newCommandQueue];
    CAMetalLayer *swapchain = [CAMetalLayer layer];
    swapchain.device = device;
    swapchain.opaque = YES;

    metal_device_t *metal_device = (metal_device_t*)malloc(sizeof(metal_device_t));
    metal_device->gpu = device;
    metal_device->queue = queue;
    metal_device->swapchain = swapchain;
    g_metal_device = metal_device;
    return metal_device;
}

GLFWwindow* metal_create_window(const char* title, rect_t rect) {
    GLFWwindow *native_window = glfwCreateWindow((i32)rect.w, (i32)rect.h, title, NULL, NULL);
    NSWindow *nswindow = glfwGetCocoaWindow(native_window);
    nswindow.contentView.layer = g_metal_device->swapchain;
    nswindow.contentView.wantsLayer = YES;
    return native_window;
}
