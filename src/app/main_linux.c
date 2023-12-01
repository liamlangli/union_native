#include "foundation/io/io.h"
#include "foundation/render/render.h"
#include "foundation/render/pipeline.h"
#include "foundation/script/script.h"
#include "foundation/logger/logger.h"

#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>
 
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
 
int main(void)
{
    GLFWwindow* window;
    glfwSetErrorCallback(error_callback);
 
    if (!glfwInit())
        exit(EXIT_FAILURE);
 
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
 
    window = glfwCreateWindow(1080, 720, "union_native", NULL, NULL);
    if (!window)
    {
        glfwTerminate();
        exit(EXIT_FAILURE);
    }
    glfwSetKeyCallback(window, key_callback);
    glfwMakeContextCurrent(window);

    encoder_o* encoder = render_encoder_create();
    render_clear_depth(encoder, 1.0f);
    render_clear_color(encoder, 0.0f, 0.0f, 0.0f, 1.0f);

    pipeline_descriptor_t descriptor = {0};
    descriptor.vertex_shader = io_read_file("public/shader/base.vert");
    descriptor.fragment_shader = io_read_file("public/shader/base.frag");

    logger_init();

    script_context_t context = script_context_create();
    ustring_t source = io_read_file("public/example/triangle.js");
    logger_write_to_file(source.data);
    script_eval(context, source);

    glfwSwapInterval(1);
    while (!glfwWindowShouldClose(window))
    {
        script_frame_tick(context);
        render_clear(encoder);
        glfwSwapBuffers(window);
        glfwPollEvents();
    }
 
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}