#include "linux_window.h"

#ifdef OS_LINUX

#define GLFW_INCLUDE_ES32 
#include "GLFW/glfw3.h"
window_t* platform_window_create(const char* title, int width, int height)
{
    glfwInit();
    // glfwWindowHint(GLFW_DECORATED, GLFW_FALSE);

    GLFWwindow* native_window = glfwCreateWindow(width, height, title, NULL, NULL);
    window_t* window = malloc(sizeof(window_t));
    window->native_handle = native_window;
    window->title = string_str(title);
    window->width = width;
    window->height = height;

    glfwMakeContextCurrent(native_window);
    glfwSwapInterval(1);
    return window;
}

void platform_window_update(window_t* window)
{
    while (!glfwWindowShouldClose(window->native_handle))
    {
        glfwSwapBuffers(window->native_handle);
        glfwPollEvents();
    }
}

void platform_window_destroy(window_t* window)
{
    glfwDestroyWindow(window->native_handle);
    free(window);
}

#endif
