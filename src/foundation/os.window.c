#include "foundation/os.h"
#include "GLFW/glfw3.h"
#include "foundation/logger.h"
#include "script/script_context.h"
#include "script/browser.h"
#include "ui/ui_keycode.h"
#include "ui/ui_dev_tool.h"

#include <stdio.h>

static void error_callback(int error, const char* description) {
    LOG_ERROR_FMT("Error: {}", description);
}

static int cursor_type = CURSOR_Default;
static GLFWcursor *default_cursor;
static GLFWcursor *text_input_cursor;
static GLFWcursor *resize_h_cursor;
static GLFWcursor *resize_v_cursor;

static void os_window_on_mouse_button(os_window_t* window, int button, int action, int mods) {
    script_context_t *ctx = script_context_shared();
    if (ctx == NULL) return;
    ui_state_t *state = &ctx->state;

    if (action == GLFW_PRESS) {
        if (button == GLFW_MOUSE_BUTTON_LEFT) {
            state->left_mouse_press = true;
            state->left_mouse_is_pressed = true;
            script_browser_window_mouse_down(0);
            state->pointer_start = state->pointer_location;
        } else if (button == GLFW_MOUSE_BUTTON_RIGHT) {
            state->right_mouse_press = true;
            state->right_mouse_is_pressed = true;
            script_browser_window_mouse_down(1);
        } else {
            state->middle_mouse_press = true;
            state->middle_mouse_is_pressed = true;
            script_browser_window_mouse_down(2);
        }
    } else if (action == GLFW_RELEASE) {
        if (button == GLFW_MOUSE_BUTTON_LEFT) {
            state->left_mouse_release = true;
            state->left_mouse_is_pressed = false;
            script_browser_window_mouse_up(0);
        } else if (button == GLFW_MOUSE_BUTTON_RIGHT) {
            state->right_mouse_release = true;
            state->right_mouse_is_pressed = false;
            script_browser_window_mouse_up(1);
        } else {
            state->middle_mouse_release = true;
            state->middle_mouse_is_pressed = false;
            script_browser_window_mouse_up(2);
        }
    }
}

static void os_window_on_scroll(os_window_t* window, double offset_x, double offset_y) {
    script_context_t *ctx = script_context_shared();
    ui_state_t *state = &ctx->state;
    if (state->active == -1 && state->hover == -1) script_browser_window_mouse_scroll(offset_x, offset_y);
    const bool shift = ui_state_is_key_pressed(state, KEY_LEFT_SHIFT) || ui_state_is_key_pressed(state, KEY_RIGHT_SHIFT);
    state->pointer_scroll.x = (f32)(offset_x * (shift ? state->smooth_factor : 1.f));
    state->pointer_scroll.y = (f32)(offset_y * (shift ? state->smooth_factor : 1.f));
}

static void os_window_on_key_action(os_window_t* window, int key, int scancode, int action, int mods) {
    script_context_t *ctx = script_context_shared();
    if (ctx == NULL) return;
    ui_state_t *state = &ctx->state;

    if (action == GLFW_PRESS) {
        ui_state_key_press(state, key);
        script_browser_document_key_down(key);
    } else if (action == GLFW_RELEASE) {
        ui_state_key_release(state, key);
        script_browser_document_key_up(key);
    }

    const bool control_pressed = ui_state_is_key_pressed(state, KEY_LEFT_CONTROL) ||
        ui_state_is_key_pressed(state, KEY_RIGHT_CONTROL) ||
        ui_state_is_key_pressed(state, KEY_LEFT_SUPER) ||
        ui_state_is_key_pressed(state, KEY_RIGHT_SUPER);

    const bool alt_pressed = ui_state_is_key_pressed(state, KEY_LEFT_ALT) ||
        ui_state_is_key_pressed(state, KEY_RIGHT_ALT);

    if (action == GLFW_RELEASE && ((control_pressed && alt_pressed && key == KEY_I) || key == KEY_F12)) {
        ui_dev_tool_set_visible(&ctx->dev_tool, !ctx->dev_tool.visible);
        LOG_INFO("toggle dev tool");
    }

    if (control_pressed && ui_state_is_key_pressed(state, KEY_Q)) {
        glfwSetWindowShouldClose((GLFWwindow*)window->native_window, GLFW_TRUE);
    }
}

void os_window_on_resize(os_window_t *window, int width, int height) {
    script_context_t *ctx = script_context_shared();
    glfwGetFramebufferSize(window->native_window, &window->framebuffer_width, &window->framebuffer_height);
    window->display_ratio = (f64)window->framebuffer_height / (f64)window->height;
    f32 ui_width = (f32)(width / window->ui_scale * window->display_ratio);
    f32 ui_height = (f32)(height / window->ui_scale * window->display_ratio);
    ctx->renderer.window_size.x = ui_width;
    ctx->renderer.window_size.y = ui_height;
    ctx->state.window_rect = (ui_rect){
        .x = 0.f,
        .y = 0.f,
        .w = ui_width,
        .h = ui_height
    };
    script_browser_window_resize(width, height);
}

static ustring_view fps_str;
#define FPS_MA 10
static double last_time[FPS_MA];
static int nb_frames = 0;

static void os_window_tick(os_window_t *window) {
    double mouse_x, mouse_y;
    int width, height, framebuffer_width, framebuffer_height;
    script_context_t *ctx = script_context_shared();
    ui_state_t *state = &ctx->state;

    glfwGetCursorPos((GLFWwindow*)window->native_window, &mouse_x, &mouse_y);
    mouse_x = mouse_x * window->display_ratio;
    mouse_y = mouse_y * window->display_ratio;

    if (state->pointer_location.x != mouse_x || state->pointer_location.y != mouse_y) {
        if (state->active == -1 && state->hover == -1) script_browser_window_mouse_move(mouse_x, mouse_y);
        state->pointer_location = (float2){.x = (f32)(mouse_x / window->ui_scale), .y = (f32)(mouse_y / window->ui_scale)};
    }
    window->mouse_x = mouse_x;
    window->mouse_y = mouse_y;
 
    glfwGetFramebufferSize((GLFWwindow*)window->native_window, &framebuffer_width, &framebuffer_height);
    if (window->framebuffer_width != framebuffer_width || window->framebuffer_height != framebuffer_height) {
        glfwGetWindowSize((GLFWwindow*)window->native_window, &width, &height);
        os_window_on_resize(window, width, height);
    }

    ui_state_update(state);
    os_window_set_cursor(window, state->cursor_type);

    // compute fps
    double current_time = glfwGetTime();
    last_time[nb_frames % FPS_MA] = current_time;
    nb_frames++;

    if (nb_frames > FPS_MA) {
        double fps = FPS_MA / (current_time - last_time[(nb_frames - FPS_MA) % FPS_MA]);
        // sprintf((void*)fps_str.base.data, "%16.f", fps);
        // ui_label_update_text(&fps_label, fps_str);
    }

    // static ustring_view status_str = 
    // sprintf((void*)status_str.base.data, "h: %d, a: %d, f: %d, l: %d", state->hover, state->active, state->focus, state->left_mouse_is_pressed);
}

static void glfw_on_mouse_button(GLFWwindow *window, int button, int action, int mods) {
    os_window_t *os_window = glfwGetWindowUserPointer(window);
    os_window_on_mouse_button(os_window, button, action, mods);
}

static void glfw_on_scroll(GLFWwindow *window, double offset_x, double offset_y) {
    os_window_t *os_window = glfwGetWindowUserPointer(window);
    os_window_on_scroll(os_window, offset_x, offset_y);
}

static void glfw_on_key_action(GLFWwindow *window, int key, int scancode, int action, int mods) {
    os_window_t *os_window = glfwGetWindowUserPointer(window);
    os_window_on_key_action(os_window, key, scancode, action, mods);
}

static void glfw_on_resize(GLFWwindow *window, int width, int height) {
    os_window_t *os_window = glfwGetWindowUserPointer(window);
    os_window_on_resize(os_window, width, height);
}

os_window_t* os_window_create(ustring title, int width, int height) {
    os_window_t* window = malloc(sizeof(os_window_t));
    window->ui_scale = 2.0;
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
    glfwWindowHint(GLFW_SCALE_TO_MONITOR, GLFW_TRUE);
    GLFWwindow *native_window = glfwCreateWindow(width, height, title.data, NULL, NULL);

    if (!window) {
        glfwTerminate();
        exit(EXIT_FAILURE);
    }

    glfwSetMouseButtonCallback(native_window, glfw_on_mouse_button);
    glfwSetScrollCallback(native_window, glfw_on_scroll);
    glfwSetKeyCallback(native_window, glfw_on_key_action);
    glfwSetWindowSizeCallback(native_window, glfw_on_resize);

    glfwMakeContextCurrent(native_window);
    glfwSwapInterval(1);
    window->native_window = (void*)native_window;
    glfwSetWindowUserPointer(native_window, window);
    glfwGetWindowSize(native_window, &window->width, &window->height);

    glFrontFace(GL_CCW);
    glDepthRangef(0.0f, 1.0f);
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_DEPTH_BUFFER_BIT | GL_COLOR_BUFFER_BIT);

    LOG_INFO_FMT("USER_AGENT: {}", USER_AGENT);
    LOG_INFO_FMT("GL_VERSION: {}", glGetString(GL_VERSION));
    LOG_INFO_FMT("GL_RENDERER: {}", glGetString(GL_RENDERER));
    LOG_INFO_FMT("GL_VENDOR: {}", glGetString(GL_VENDOR));

    default_cursor = glfwCreateStandardCursor(CURSOR_Default);
    text_input_cursor = glfwCreateStandardCursor(CURSOR_Text);
    resize_h_cursor = glfwCreateStandardCursor(CURSOR_ResizeH);
    resize_v_cursor = glfwCreateStandardCursor(CURSOR_ResizeV);

    return window;
}

void os_window_set_cursor(os_window_t *window, int type) {
    cursor_type = type;
    switch (cursor_type) {
        case CURSOR_Default:
            glfwSetCursor((GLFWwindow*)window->native_window, default_cursor);
            break;
            case CURSOR_Text:
            glfwSetCursor((GLFWwindow*)window->native_window, text_input_cursor);
            break;
                case CURSOR_ResizeH:
            glfwSetCursor((GLFWwindow*)window->native_window, resize_h_cursor);
            break;
                case CURSOR_ResizeV:
            glfwSetCursor((GLFWwindow*)window->native_window, resize_v_cursor);
            break;
        default:
            break;
    }
}

void os_window_run_loop(os_window_t *window, void (*fn)(void)) {
    while (!glfwWindowShouldClose((GLFWwindow*)window->native_window)) {
        fn();
        os_window_tick(window);
        glfwSwapBuffers((GLFWwindow*)window->native_window);
        glfwPollEvents();
    }
}

void os_window_close(os_window_t *window) {
    glfwDestroyCursor(default_cursor);
    glfwDestroyCursor(text_input_cursor);
    glfwDestroyCursor(resize_h_cursor);
    glfwDestroyCursor(resize_v_cursor);
    glfwDestroyWindow((GLFWwindow*)window->native_window);
    glfwTerminate();
    free(window);
}

extern void os_window_set_clipboard(os_window_t *window, ustring_view text) {
    ustring str = ustring_view_to_new_ustring(&text);
    glfwSetClipboardString((GLFWwindow*)window->native_window, str.data);
    ustring_free(&str);
}

extern ustring os_window_get_clipboard(os_window_t *window) {
    return ustring_str((i8*)glfwGetClipboardString((GLFWwindow*)window->native_window));
}