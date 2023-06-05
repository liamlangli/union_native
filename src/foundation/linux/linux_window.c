#include "linux_window.h"

#ifdef OS_LINUX

#define GLFW_INCLUDE_ES32 
#include "GLFW/glfw3.h"
window_t* platform_window_create(const char* title, int width, int height)
{
    glfwInit();
    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);

    GLFWwindow* native_window = glfwCreateWindow(width, height, title, NULL, NULL);

    window_t* window = malloc(sizeof(window_t));
    window->native_handle = native_window;
    window->title = string_str(title);
    window->width = width;
    window->height = height;
    return window;
}

#endif
