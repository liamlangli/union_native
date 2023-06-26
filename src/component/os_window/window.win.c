#if defined(OS_WINDOWS) || defined(OS_LINUX)

#include "os_window.h"

#include "component/render_system/vulkan/vulkan_backend.h"
#include "foundation/array.inl"

typedef struct window_t {
    GLFWwindow *native_window;
} window_t;

window_t *platform_window_create(const char *title, rect_t rect) {
    window_t *win = (window_t*)malloc(sizeof(window_t));
    
    int x = (int)rect.x;
    int y = (int)rect.y;
    int width = (int)rect.w;
    int height = (int)rect.h;

    glfwWindowHint(GLFW_CLIENT_API,GLFW_NO_API);
	glfwWindowHint(GLFW_RESIZABLE,GLFW_FALSE);
    GLFWwindow *native_window = glfwCreateWindow(width, height, title, VK_NULL_HANDLE, VK_NULL_HANDLE);
    const GLFWvidmode *video_mode = glfwGetVideoMode(glfwGetPrimaryMonitor());
	glfwSetWindowPos(native_window, x, y);
    win->native_window = native_window;

    return win;
}

void *platform_window_get_native_handle(window_t *window) {
    return (void*)window->native_window;
}

bool platform_window_update(window_t *window) {
    glfwPollEvents();
    return !glfwWindowShouldClose(window->native_window);
}

void platform_window_destroy(window_t *window) {
    glfwDestroyWindow(window->native_window);
    window->native_window = 0;
}

#endif
