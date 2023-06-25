#if defined(OS_WINDOWS) || defined(OS_LINUX)

#include "os_window.h"

#include "foundation/vulkan/vulkan_backend.h"
#include "foundation/array.inl"

typedef struct window_t {
    GLFWwindow *native_window;
    VkSurfaceKHR surface;
    VkSwapchainKHR swapchain;

    u32 swap_image_count;
    VkImage swap_images[3];
} window_t;

static void __glfw_init(void) {
    static bool __glfw_initialized = false;
    if (__glfw_initialized) return;
    glfwInit();

	glfwWindowHint(GLFW_CLIENT_API,GLFW_NO_API);
	glfwWindowHint(GLFW_RESIZABLE,GLFW_FALSE);

    __glfw_initialized = true;
}

window_t *platform_window_create(const char *title, rect_t rect) {
    __glfw_init();

    window_t *win = (window_t*)malloc(sizeof(window_t));
    
    int x = (int)rect.x;
    int y = (int)rect.y;
    int width = (int)rect.w;
    int height = (int)rect.h;
    GLFWwindow *native_window = glfwCreateWindow(width, height, title, VK_NULL_HANDLE, VK_NULL_HANDLE);
    const GLFWvidmode *video_mode = glfwGetVideoMode(glfwGetPrimaryMonitor());
	glfwSetWindowPos(native_window, x, y);

    // win->surface = vk_create_surface(native_window, );

    return win;
}

void *platform_window_get_native_window(window_t *window) {
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
