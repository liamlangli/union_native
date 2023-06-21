#include "os_window.h"

#ifdef OS_OSX

#define GLFW_INCLUDE_NONE
#define GLFW_EXPOSE_NATIVE_COCOA
#include <GLFW/glfw3.h>
#include <GLFW/glfw3native.h>

#import <Metal/Metal.h>
#import <QuartzCore/CAMetalLayer.h>

#include "render_system.h"
#include "metal_backend.h"

typedef struct window_t {
    string_t title;
    i32 width, height;
    GLFWwindow *native_window;
} window_t;

static void __glfw_init(void) {
    static bool __glfw_initialized = false;
    if (__glfw_initialized) return;

    glfwInit();
    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
    __glfw_initialized = true;
}

window_t *platform_window_create(const char* title, rect_t rect) {
    __glfw_init();

    GLFWwindow *native_window = metal_create_window(title, rect);
    window_t *window = malloc(sizeof(window_t));
    window->title = string_str(title);
    window->width = rect.w;
    window->height = rect.h;
    window->native_window = native_window;

    return window;
}

bool platform_window_update(window_t *window) {
    // MTLClearColor color = MTLClearColorMake(0, 0, 0, 1);
    // metal_device_t *metal_device = window->native_handle;
    // id<MTLCommandQueue> queue = metal_device->queue;
    // CAMetalLayer *swapchain = metal_device->swapchain;

    // while (!glfwWindowShouldClose(metal_device->native_window)) {
    //     glfwPollEvents();
    //     @autoreleasepool {
    //         color.red = (color.red > 1.0) ? 0 : color.red + 0.01;

    //         id<CAMetalDrawable> surface = [swapchain nextDrawable];

    //         MTLRenderPassDescriptor *pass = [MTLRenderPassDescriptor renderPassDescriptor];
    //         pass.colorAttachments[0].clearColor = color;
    //         pass.colorAttachments[0].loadAction  = MTLLoadActionClear;
    //         pass.colorAttachments[0].storeAction = MTLStoreActionStore;
    //         pass.colorAttachments[0].texture = surface.texture;

    //         id<MTLCommandBuffer> buffer = [queue commandBuffer];
    //         id<MTLRenderCommandEncoder> encoder = [buffer renderCommandEncoderWithDescriptor:pass];
    //         [encoder endEncoding];
    //         [buffer presentDrawable:surface];
    //         [buffer commit];
    //     }
    // }
    return true;
}

void platform_window_destroy(window_t *window) {
    // glfwDestroyWindow(window->native_handle);
    // glfwTerminate();

    // metal_device_t *metal_device = window->native_handle;
    // free(metal_device);
    // free(window);
}

#endif
