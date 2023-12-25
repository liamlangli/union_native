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

#define STB_DS_IMPLEMENTATION
#include <stb_ds.h>

#ifdef RENDER_DOC_CAPTURE
    #include <dlfcn.h>
    #include "renderdoc_app.h"
    #include <assert.h>
#endif

static ui_renderer_t renderer;
static ui_state_t state;
static ui_input_t search_input;
static ui_label_t copyright;

static ui_style panel_0;
static ui_style panel_1;
static ui_style panel_2;
static ui_style panel_3;
static ui_style text_style;

static bool empty_launch = true;

static void error_callback(int error, const char* description)
{
    fprintf(stderr, "Error: %s\n", description);
}
 
static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GLFW_TRUE);

    if (action == GLFW_PRESS) {
        ui_state_key_press(&state, key);
    } else if (action == GLFW_RELEASE) {
        ui_state_key_release(&state, key);
    }
}

static void mouse_button(GLFWwindow* window, int button, int action, int mods) {
    if (action == GLFW_PRESS) {
        if (button == GLFW_MOUSE_BUTTON_LEFT) {
            state.left_mouse_press = true;
            state.left_mouse_is_pressed = true;
            script_window_mouse_down(0);
        } else if (button == GLFW_MOUSE_BUTTON_RIGHT) {
            state.right_mouse_press = true;
            state.right_mouse_is_pressed = true;
            script_window_mouse_down(1);
        } else {
            state.middle_mouse_press = true;
            state.middle_mouse_is_pressed = true;
            script_window_mouse_down(2);
        }
    } else if (action == GLFW_RELEASE) {
        if (button == GLFW_MOUSE_BUTTON_LEFT) {
            state.left_mouse_release = true;
            state.left_mouse_is_pressed = false;
            script_window_mouse_up(0);
        } else if (button == GLFW_MOUSE_BUTTON_RIGHT) {
            state.right_mouse_release = true;
            state.right_mouse_is_pressed = false;
            script_window_mouse_up(1);
        } else {
            state.middle_mouse_release = true;
            state.middle_mouse_is_pressed = false;
            script_window_mouse_up(2);
        }
    }
}

static void set_content_scale(GLFWwindow *window, float xscale, float yscale) {
    script_context_t *ctx = script_context_share();
    ctx->display_ratio = yscale;
}

static void size_callback(GLFWwindow* window, int width, int height) {
    script_window_resize( width, height);
}

static void scroll_callback(GLFWwindow* window, double xoffset, double yoffset) {
    script_window_mouse_scroll(xoffset, yoffset);
}

static ustring script_init(GLFWwindow *window, int argc, char **argv) {
    script_context_t *script_context = script_context_share();
    f32 scale_x, scale_y;
    glfwGetFramebufferSize(window, &script_context->width, &script_context->height);
    glfwGetWindowContentScale(window, &scale_x, &scale_y);
    script_context->display_ratio = scale_y;
    script_module_browser_register();
    script_module_webgl2_register();

    ustring path = argc >= 2 ? ustring_str(argv[1]) : ustring_str("public/terrain.js");
    ustring content;
    url_t url = url_parse(path);
    if (url.valid) {
        printf("protocol: %s\n host: %s port: %d, path: %s\n", url.protocol.data, url.host.data, url.port, url.path.data);
        content = io_http_get(url);
    } else {
        printf("load file: %s\n", path.data);
        content = io_read_file(path);
    }
    script_eval(content, path);
    empty_launch = false;
    return path;
}

static void renderer_init(GLFWwindow* window, ustring path) {
    ui_renderer_init(&renderer);
    ui_state_init(&state, &renderer);
    f32 context_scale_x, context_scale_y;
    glfwGetWindowContentScale(window, &context_scale_x, &context_scale_y);
    renderer.window_size.z = context_scale_y;
    ui_input_init(&search_input, path);
    ui_label_init(&copyright, ustring_STR("@2023 union native"));
    copyright.element.constraint.alignment = CENTER;
}

static void render_location_bar() {
    ui_rect rect = ui_rect_shrink((ui_rect){.x = 0, .y = 0, .w = state.window_rect.w, .h = 46.f}, 8.0f, 8.0f);
    if (ui_input(&state, &search_input, panel_0, rect, 0, 0)) {
        printf("search_input: %s\n", search_input.label.text.data);
    }

    rect = ui_rect_shrink((ui_rect){.x = 0, .y = state.window_rect.h - 44.f, .w = state.window_rect.w, .h = state.window_rect.h}, 8.0f, 8.0f);
    ui_label(&state, &search_input.label, text_style, rect, 0, 0);
    ui_renderer_render(&renderer);
}

static void state_update(GLFWwindow *window) {
    int width, height, framebuffer_width, framebuffer_height;
    double mouse_x, mouse_y;

    script_context_t *ctx = script_context_share();
    glfwGetCursorPos(window, &mouse_x, &mouse_y);

    glfwGetFramebufferSize(window, &framebuffer_width, &framebuffer_height);
    if (ctx->framebuffer_width != framebuffer_width || ctx->framebuffer_height != framebuffer_height) {
        glfwGetWindowSize(window, &width, &height);
        renderer.window_size.x = (f32)width;
        renderer.window_size.y = (f32)height;
        state.window_rect = (ui_rect){
            .x = 0.f,
            .y = 0.f,
            .w = (f32)width,
            .h = (f32)height
        };
        glfwGetWindowContentScale(window, &renderer.window_size.z, &renderer.window_size.w);
        script_window_resize(width, height);
        ctx->display_ratio = (f64)framebuffer_height / (f64)height;
    }

    if (state.mouse_location.x != mouse_x || state.mouse_location.y != mouse_y) {
        script_window_mouse_move(mouse_x, mouse_y);
        state.mouse_location = (float2){.x = (f32)mouse_x, .y = (f32)mouse_y};
    }
    ui_state_update(&state);
} 

int main(int argc, char** argv)
{
#ifdef RENDER_DOC_CAPTURE
    RENDERDOC_API_1_1_2 *rdoc_api = NULL;
    void *mod = dlopen("librenderdoc.so", RTLD_NOW | RTLD_NOLOAD);
    if(mod != NULL)
    {
        pRENDERDOC_GetAPI RENDERDOC_GetAPI = (pRENDERDOC_GetAPI)dlsym(mod, "RENDERDOC_GetAPI");
        int ret = RENDERDOC_GetAPI(eRENDERDOC_API_Version_1_1_2, (void **)&rdoc_api);
        assert(ret == 1);
    }
#endif

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

    int window_width = 1080;
    int window_height = 720;

    window = glfwCreateWindow(window_width, window_height, "union_native", NULL, NULL);
    if (!window)
    {
        glfwTerminate();
        exit(EXIT_FAILURE);
    }

    glfwSetWindowContentScaleCallback(window, set_content_scale);
    glfwSetScrollCallback(window, scroll_callback);
    glfwSetWindowSizeCallback(window, size_callback);
    glfwSetKeyCallback(window, key_callback);
    glfwSetMouseButtonCallback(window, mouse_button);
    glfwMakeContextCurrent(window);

    printf("GL_VERSION: %s\n", glGetString(GL_VERSION));
    printf("GL_RENDERER: %s\n", glGetString(GL_RENDERER));

    logger_init();
    ustring path = script_init(window, argc, argv);
    renderer_init(window, path);

    panel_0 = ui_style_from_hex(0x28292aab, 0x2b2c2dab, 0x313233ab, 0xe1e1e1ab);
    panel_1 = ui_style_from_hex(0x414243ff, 0x4a4b4cff, 0x515253ff, 0xe1e1e1ab);
    panel_2 = ui_style_from_hex(0x474849ff, 0x515253ff, 0x6c6d6eff, 0xe1e1e1ab);
    panel_3 = ui_style_from_hex(0x505152ff, 0x575859ff, 0x6c6d6eff, 0xe1e1e1ab);
    text_style = ui_style_from_hex(0xe1e1e1ff, 0xe1e1e1ff, 0xe1e1e1ff, 0xe1e1e1ff);

    glfwSwapInterval(1);
    glFrontFace(GL_CCW);

    while (!glfwWindowShouldClose(window))
    {
        state_update(window);
        if (empty_launch) {
            glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
        } else {
            script_frame_tick();
        }

        render_location_bar();
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    script_context_destroy();
    ui_renderer_free(&renderer);

    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}