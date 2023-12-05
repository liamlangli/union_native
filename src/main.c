#include "foundation/io.h"
#include "foundation/script.h"
#include "foundation/logger.h"
#include "foundation/webgl2.h"

#define GLFW_INCLUDE_ES3
#include <GLFW/glfw3.h>
#include <GLES3/gl3.h>
#include <stdlib.h>
#include <stdio.h>
 
static void error_callback(int error, const char* description)
{
    fprintf(stderr, "Error: %s\n", description);
}
 
static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GLFW_TRUE);
}
 
int main(int argc, char** argv)
{
    if (argc < 2) {
        fprintf(stderr, "Usage: un /path/to/sample.js\n");
        return 0;
    }

    GLFWwindow* window;
    glfwSetErrorCallback(error_callback);
 
    if (!glfwInit())
        exit(EXIT_FAILURE);

#if defined(OS_MACOS)
    glfwWindowHint(GLFW_CONTEXT_CREATION_API, GLFW_EGL_CONTEXT_API);
    glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_ES_API);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
#elif defined(OS_LINUX)
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_FALSE);
    glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_ES_API);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
#endif
    glfwWindowHint(GLFW_SAMPLES, 1);
    glfwWindowHint(GLFW_RESIZABLE, GLFW_TRUE);
    
    GLFWmonitor* monitor = glfwGetPrimaryMonitor();
    window = glfwCreateWindow(1080, 720, "union_native", NULL, NULL);
    if (!window)
    {
        glfwTerminate();
        exit(EXIT_FAILURE);
    }
    glfwSetKeyCallback(window, key_callback);
    glfwMakeContextCurrent(window);

    printf("GL_VERSION: %s\n", glGetString(GL_VERSION));
    printf("GL_RENDERER: %s\n", glGetString(GL_RENDERER));

    logger_init();

    script_context_t context = script_context_create();
    int left, top, right, bottom;
    glfwGetFramebufferSize(window, &context.frame_buffer_width, &context.frame_buffer_height);

    script_module_browser_register(&context);
    script_module_webgl2_register(&context);

    ustring_t script_path = ustring_str(argv[1]);
    ustring_t source = io_read_file(script_path);
    script_eval(context, source, script_path);

    glfwSwapInterval(2);
    while (!glfwWindowShouldClose(window))
    {
        glClearColor(.0, .0, .0, 1.);
        glViewport(0, 0, context.frame_buffer_width, context.frame_buffer_height);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        // script_frame_tick(context);
        glfwSwapBuffers(window);
        glfwPollEvents();
    }
    script_context_destroy(context);
 
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}