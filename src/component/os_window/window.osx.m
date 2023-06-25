#include "os_window.h"

#ifdef OS_OSX

#define GLFW_INCLUDE_NONE
#define GLFW_EXPOSE_NATIVE_COCOA
#include <GLFW/glfw3.h>
#include <GLFW/glfw3native.h>

typedef struct window_t {
    GLFWwindow *native_window;
    string_t title;
    i32 width, height;
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

    GLFWwindow *native_window = glfwCreateWindow((int)rect.w, (int)rect.h, title, NULL, NULL);
    window_t *window = (window_t*)malloc(sizeof(window_t));
    window->native_window = native_window;
    window->title = string_str(title);
    window->width = (i32)rect.w;
    window->height = (i32)rect.h;
    return window;
}

void *platform_window_get_native_handle(window_t *window) {
    return (void*)window->native_window;
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
