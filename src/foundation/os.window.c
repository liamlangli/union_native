#include "foundation/os.h"
#include "foundation/logger.h"
#include "script/script_context.h"

#include "ui/ui_keycode.h"

static void error_callback(int error, const char* description) {
    LOG_ERROR_FMT("Error: %s\n", description);
}

static int cursor_type = CURSOR_Default;
static GLFWcursor *default_cursor;
static GLFWcursor *text_input_cursor;
static GLFWcursor *resize_h_cursor;
static GLFWcursor *resize_v_cursor;

static void mouse_button(GLFWwindow* window, int button, int action, int mods) {
    script_context_t *ctx = script_context_share();
    if (ctx == NULL) return;
    ui_state_t *state = &ctx->state;

    if (action == GLFW_PRESS) {
        if (button == GLFW_MOUSE_BUTTON_LEFT) {
            state->left_mouse_press = true;
            state->left_mouse_is_pressed = true;
            script_window_mouse_down(0);
            state->pointer_start = state->pointer_location;
        } else if (button == GLFW_MOUSE_BUTTON_RIGHT) {
            state->right_mouse_press = true;
            state->right_mouse_is_pressed = true;
            script_window_mouse_down(1);
        } else {
            state->middle_mouse_press = true;
            state->middle_mouse_is_pressed = true;
            script_window_mouse_down(2);
        }
    } else if (action == GLFW_RELEASE) {
        if (button == GLFW_MOUSE_BUTTON_LEFT) {
            state->left_mouse_release = true;
            state->left_mouse_is_pressed = false;
            script_window_mouse_up(0);
        } else if (button == GLFW_MOUSE_BUTTON_RIGHT) {
            state->right_mouse_release = true;
            state->right_mouse_is_pressed = false;
            script_window_mouse_up(1);
        } else {
            state->middle_mouse_release = true;
            state->middle_mouse_is_pressed = false;
            script_window_mouse_up(2);
        }
    }
}

static void scroll_callback(GLFWwindow* window, double offset_x, double offset_y) {
    script_context_t *ctx = script_context_share();
    ui_state_t *state = &ctx->state;
    if (state->active == -1 && state->hover == -1) script_window_mouse_scroll(offset_x, offset_y);
    const bool shift = ui_state_is_key_pressed(state, KEY_LEFT_SHIFT) || ui_state_is_key_pressed(state, KEY_RIGHT_SHIFT);
    state->pointer_scroll.x = (f32)(offset_x * (shift ? state->smooth_factor : 1.f));
    state->pointer_scroll.y = (f32)(offset_y * (shift ? state->smooth_factor : 1.f));
}

static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods) {
    script_context_t *ctx = script_context_share();
    if (ctx == NULL) return;
    ui_state_t *state = &ctx->state;
    //printf("key: %d, scancode: %d, action: %d, mods: %d\n", key, scancode, action, mods);
    // if (key == KEY_GRAVE_ACCENT && action == GLFW_RELEASE) {
    //     ui_visible = !ui_visible;
    // }

    if (action == GLFW_PRESS) {
        ui_state_key_press(state, key);
        script_document_key_down(key);
    } else if (action == GLFW_RELEASE) {
        ui_state_key_release(state, key);
        script_document_key_up(key);
    }
    
    const bool control_pressed = ui_state_is_key_pressed(state, KEY_LEFT_CONTROL) ||
        ui_state_is_key_pressed(state, KEY_RIGHT_CONTROL) ||
        ui_state_is_key_pressed(state, KEY_LEFT_SUPER) ||
        ui_state_is_key_pressed(state, KEY_RIGHT_SUPER);

    if (control_pressed && ui_state_is_key_pressed(state, KEY_Q)) {
        glfwSetWindowShouldClose(window, GLFW_TRUE);
    }
}

GLFWwindow * os_create_window(ustring title, int width, int height) {
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
    glfwWindowHint(GLFW_SCALE_TO_MONITOR, GLFW_TRUE);
    window = glfwCreateWindow(width, height, title.data, NULL, NULL);

    if (!window) {
        glfwTerminate();
        exit(EXIT_FAILURE);
    }

    glfwSetMouseButtonCallback(window, mouse_button);
    glfwSetScrollCallback(window, scroll_callback);
    glfwSetKeyCallback(window, key_callback);

    glfwMakeContextCurrent(window);
    glfwSwapInterval(1);

    glFrontFace(GL_CCW);
    glDepthRangef(0.0f, 1.0f);
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_DEPTH_BUFFER_BIT | GL_COLOR_BUFFER_BIT);

    LOG_INFO_FMT("USER_AGENT: %s\n", USER_AGENT);
    LOG_INFO_FMT("GL_VERSION: %s\n", glGetString(GL_VERSION));
    LOG_INFO_FMT("GL_RENDERER: %s\n", glGetString(GL_RENDERER));
    LOG_INFO_FMT("GL_VENDOR: %s\n", glGetString(GL_VENDOR));

    default_cursor = glfwCreateStandardCursor(CURSOR_Default);
    text_input_cursor = glfwCreateStandardCursor(CURSOR_Text);
    resize_h_cursor = glfwCreateStandardCursor(CURSOR_ResizeH);
    resize_v_cursor = glfwCreateStandardCursor(CURSOR_ResizeV);

    return window;
}

extern void os_set_window_cursor(GLFWwindow *window, int type) {
    cursor_type = type;
    switch (cursor_type) {
        case CURSOR_Default:
            glfwSetCursor(window, default_cursor);
            break;
            case CURSOR_Text:
            glfwSetCursor(window, text_input_cursor);
            break;
                case CURSOR_ResizeH:
            glfwSetCursor(window, resize_h_cursor);
            break;
                case CURSOR_ResizeV:
            glfwSetCursor(window, resize_v_cursor);
            break;
        default:
            break;
    }
}

extern void os_run_window_loop(GLFWwindow *window, void (*fn)(void)) {
    while (!glfwWindowShouldClose(window)) {
        fn();
        glfwSwapBuffers(window);
        glfwPollEvents();
    }
}

extern void os_close_window(GLFWwindow *window) {
    glfwDestroyCursor(default_cursor);
    glfwDestroyCursor(text_input_cursor);
    glfwDestroyCursor(resize_h_cursor);
    glfwDestroyCursor(resize_v_cursor);
    glfwDestroyWindow(window);
    glfwTerminate();
}