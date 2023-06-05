#include "osx_window.h"

#define GLFW_INCLUDE_NONE
#define GLFW_EXPOSE_NATIVE_COCOA
#include <GLFW/glfw3.h>
#include <GLFW/glfw3native.h>

#import <Metal/Metal.h>
#import <QuartzCore/CAMetalLayer.h>

static void quit(GLFWwindow *window, int key, int scancode, int action, int mods)
{
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS) {
        glfwSetWindowShouldClose(window, GLFW_TRUE);
    }
}

typedef struct {
    id<MTLDevice> gpu;
    id<MTLCommandQueue> queue;
    CAMetalLayer *swapchain;
    GLFWwindow *native_window;
} metal_device_t;

window_t *platform_window_create(const char* title, i32 width, i32 height) {
    const id<MTLDevice> gpu = MTLCreateSystemDefaultDevice();
    const id<MTLCommandQueue> queue = [gpu newCommandQueue];
    CAMetalLayer *swapchain = [CAMetalLayer layer];
    swapchain.device = gpu;
    swapchain.opaque = YES;

    glfwInit();
    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);

    GLFWwindow *native_window = glfwCreateWindow(width, height, title, NULL, NULL);
    NSWindow *nswindow = glfwGetCocoaWindow(native_window);
    nswindow.contentView.layer = swapchain;
    nswindow.contentView.wantsLayer = YES;
    glfwSetKeyCallback(native_window, quit);

    metal_device_t *metal_device = malloc(sizeof(metal_device_t));
    metal_device->gpu = gpu;
    metal_device->queue = queue;
    metal_device->swapchain = swapchain;
    metal_device->native_window = native_window;

    window_t *window = malloc(sizeof(window_t));
    window->title = string_str(title);
    window->width = width;
    window->height = height;
    window->native_handle = metal_device;

    return window;
}

void platform_window_update(window_t *window) {
    MTLClearColor color = MTLClearColorMake(0, 0, 0, 1);
    metal_device_t *metal_device = window->native_handle;
    id<MTLCommandQueue> queue = metal_device->queue;
    CAMetalLayer *swapchain = metal_device->swapchain;

    while (!glfwWindowShouldClose(metal_device->native_window)) {
        glfwPollEvents();
        @autoreleasepool {
            color.red = (color.red > 1.0) ? 0 : color.red + 0.01;

            id<CAMetalDrawable> surface = [swapchain nextDrawable];

            MTLRenderPassDescriptor *pass = [MTLRenderPassDescriptor renderPassDescriptor];
            pass.colorAttachments[0].clearColor = color;
            pass.colorAttachments[0].loadAction  = MTLLoadActionClear;
            pass.colorAttachments[0].storeAction = MTLStoreActionStore;
            pass.colorAttachments[0].texture = surface.texture;

            id<MTLCommandBuffer> buffer = [queue commandBuffer];
            id<MTLRenderCommandEncoder> encoder = [buffer renderCommandEncoderWithDescriptor:pass];
            [encoder endEncoding];
            [buffer presentDrawable:surface];
            [buffer commit];
        }
    }
}

void platform_window_destroy(window_t *window) {
    glfwDestroyWindow(window->native_handle);
    glfwTerminate();

    metal_device_t *metal_device = window->native_handle;
    free(metal_device);
    free(window);
}
