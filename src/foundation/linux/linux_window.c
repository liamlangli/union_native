#include "os_window.h"

#ifdef OS_LINUX

#include "glad/gles2.h"
#define GLFW_INCLUDE_ES32 
#include "GLFW/glfw3.h"

window_t* platform_window_create(const char* title, int width, int height)
{
    glfwInit();
    // glfwWindowHint(GLFW_DECORATED, GLFW_FALSE);

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);

    GLFWwindow* native_window = glfwCreateWindow(width, height, title, NULL, NULL);
    window_t* window = malloc(sizeof(window_t));
    window->native_handle = native_window;
    window->title = string_str(title);
    window->width = width;
    window->height = height;

    glfwMakeContextCurrent(native_window);
    glfwSwapInterval(1);

    int version = gladLoadGLES2(glfwGetProcAddress);
    if (version == 0) {
        printf("Failed to initialize OpenGL context\n");
        exit(-1);
    }
    glClearColor(1.0, 1.0, 1.0, 1.0);
    return window;
}

void platform_window_update(window_t* window)
{
    while (!glfwWindowShouldClose(window->native_handle))
    {
        glClear(GL_COLOR_BUFFER_BIT);
        glfwSwapBuffers(window->native_handle);
        glfwPollEvents();
    }
}

void platform_window_destroy(window_t* window)
{
    glfwDestroyWindow(window->native_handle);
    glfwTerminate();
    free(window);
}

#endif
