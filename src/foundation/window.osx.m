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
    bool window_request_closed = glfwWindowShouldClose(window->native_window);
    glfwPollEvents();

    return window_request_closed ? false : true;
}

void platform_window_destroy(window_t *window) {
    glfwDestroyWindow(window->native_window);
    glfwTerminate();

    free(window);
}

#endif
