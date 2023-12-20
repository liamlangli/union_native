#include "foundation/io.h"
#include "foundation/network.h"
#include "foundation/script.h"
#include "foundation/logger.h"
#include "foundation/webgl2.h"

#include "ui/ui.h"

#include <string.h>

#define GLFW_INCLUDE_ES3
#include <GLFW/glfw3.h>
#include <GLES3/gl3.h>
#include <stdlib.h>
#include <stdio.h>

static ui_renderer_t renderer;
static ui_state_t state;

static ui_style panel_0;
static ui_style panel_1;
static ui_style panel_2;
static ui_style panel_3;
static ui_style panel_4;

static void error_callback(int error, const char* description)
{
    fprintf(stderr, "Error: %s\n", description);
}
 
static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GLFW_TRUE);
}

static void set_content_scale(GLFWwindow *window, float xscale, float yscale) {
    printf("set_content_scale: %f, %f\n", xscale, yscale);
}

static void size_callback(GLFWwindow* window, int width, int height)
{
    script_window_resize(script_context_share(), width, height);
}

static void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    printf("scroll_callback: %f, %f\n", xoffset, yoffset);
}

static void renderer_init(GLFWwindow* window, script_context_t *script_context) {
    ui_renderer_init(&renderer);
    ui_state_init(&state, &renderer);
    renderer.window_size.x = (f32)script_context->width;
    renderer.window_size.y = (f32)script_context->height;
    f32 context_scale_x, context_scale_y;
    glfwGetWindowContentScale(window, &context_scale_x, &context_scale_y);
    renderer.window_size.z = context_scale_y;
}

static void render_location_bar() {
    // fill_round_rect
    fill_rect(&renderer, 0, panel_0, (ui_rect){.x = 0, .y = 0, .w = state.window_rect.w, .h = 32}, 0);
    ui_renderer_render(&renderer);
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

#if defined(OS_MACOS) || defined(OS_WINDOWS)
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
    glfwWindowHint(GLFW_RESIZABLE, GLFW_TRUE);
    glfwWindowHint(GLFW_DECORATED, GLFW_FALSE);
    glfwWindowHint(GLFW_TRANSPARENT_FRAMEBUFFER, GLFW_TRUE);

    window = glfwCreateWindow(1920, 1080, "union_native", NULL, NULL);
    if (!window)
    {
        glfwTerminate();
        exit(EXIT_FAILURE);
    }

    glfwSetWindowPos(window, 400, 200);
    glfwSetWindowContentScaleCallback(window, set_content_scale);
    glfwSetScrollCallback(window, scroll_callback);
    glfwSetWindowSizeCallback(window, size_callback);
    glfwSetKeyCallback(window, key_callback);
    glfwMakeContextCurrent(window);

    printf("GL_VERSION: %s\n", glGetString(GL_VERSION));
    printf("GL_RENDERER: %s\n", glGetString(GL_RENDERER));

    logger_init();

    script_context_t *script_context = script_context_share();
    int width, height, left, top, right, bottom;
    glfwGetFramebufferSize(window, &width, &height);
    script_module_browser_register(script_context);
    script_module_webgl2_register(script_context);
    glfwGetWindowFrameSize(window, &left, &top, &right, &bottom);
    script_window_resize(script_context, width - left - right, height - top - bottom);

    ustring content;
    ustring source = ustring_str(argv[1]);
    url_t url = url_parse(source);
    if (url.valid) {
        printf("protocol: %s\n host: %s port: %d, path: %s\n", url.protocol.data, url.host.data, url.port, url.path.data);
        content = io_http_get(url);
    } else {
        content = io_read_file(source);
    }
    script_eval(script_context, content, source);

    renderer_init(window, script_context);

    panel_0 = ui_style_from_hex(0x3a3b3cff, 0x404142ff, 0x4c4d4eff, 0xe1e1e1ab);
    glfwSwapInterval(1);

    while (!glfwWindowShouldClose(window))
    {
        double mouse_x, mouse_y;
        glfwGetCursorPos(window, &mouse_x, &mouse_y);
        state.window_rect = (ui_rect){
            .x = (f32)mouse_x,
            .y = (f32)mouse_y,
            .w = (f32)script_context->width,
            .h = (f32)script_context->height
        };

        script_frame_tick(script_context);
        render_location_bar();
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    script_context_destroy(script_context);
    ui_renderer_free(&renderer);
 
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}