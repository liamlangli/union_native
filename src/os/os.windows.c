#include "os/os.h"
#include "foundation/logger.h"
#include "script/script_context.h"
#include "script/browser.h"
#include "ui/ui_keycode.h"
#include "ui/ui_dev_tool.h"

#include <stdio.h>

#ifdef OS_WINDOWS

static void error_callback(int error, const char* description) {
    ULOG_ERROR_FMT("Error: {}", description);
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

    // glfwGetCursorPos((GLFWwindow*)window->native_window, &mouse_x, &mouse_y);
    // mouse_x = mouse_x * window->display_ratio;
    // mouse_y = mouse_y * window->display_ratio;

    // if (state->pointer_location.x != mouse_x || state->pointer_location.y != mouse_y) {
    //     if (state->active == -1 && state->hover == -1) script_browser_window_mouse_move(mouse_x, mouse_y);
    //     state->pointer_location = (float2){.x = (f32)(mouse_x / window->ui_scale), .y = (f32)(mouse_y / window->ui_scale)};
    // }
    // window->mouse_x = mouse_x;
    // window->mouse_y = mouse_y;
 
    // glfwGetFramebufferSize((GLFWwindow*)window->native_window, &framebuffer_width, &framebuffer_height);
    // if (window->framebuffer_width != framebuffer_width || window->framebuffer_height != framebuffer_height) {
    //     glfwGetWindowSize((GLFWwindow*)window->native_window, &width, &height);
    //     os_window_on_resize(window, width, height);
    // }

    ui_state_update(state);
    os_window_set_cursor(window, state->cursor_type);

    // compute fps
    // double current_time = glfwGetTime();
    // last_time[nb_frames % FPS_MA] = current_time;
    // nb_frames++;

    // if (nb_frames > FPS_MA) {
    //     double fps = FPS_MA / (current_time - last_time[(nb_frames - FPS_MA) % FPS_MA]);
    //     // sprintf((void*)fps_str.base.data, "%16.f", fps);
    //     // ui_label_update_text(&fps_label, fps_str);
    // }

    // static ustring_view status_str = 
    // sprintf((void*)status_str.base.data, "h: %d, a: %d, f: %d, l: %d", state->hover, state->active, state->focus, state->left_mouse_is_pressed);
}


os_window_t* os_window_create(ustring title, int width, int height) {

//     os_window_t* window = malloc(sizeof(os_window_t));
//     window->ui_scale = 2.0;
//     window->title = title;
//     glfwSetErrorCallback(error_callback);

//     if (!glfwInit())
//         exit(EXIT_FAILURE);

// #if defined(OS_MACOS) || defined(OS_WINDOWS)
//     glfwWindowHint(GLFW_CONTEXT_CREATION_API, GLFW_EGL_CONTEXT_API);
//     glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_ES_API);
//     glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
//     glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
// #elif defined(OS_LINUX)
//     glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_FALSE);
//     glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_ES_API);
//     glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
//     glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
// #endif
//     glfwWindowHint(GLFW_SCALE_TO_MONITOR, GLFW_TRUE);
//     GLFWwindow *native_window = glfwCreateWindow(width, height, title.data, NULL, NULL);

//     if (!window) {
//         glfwTerminate();
//         exit(EXIT_FAILURE);
//     }

//     glfwSetMouseButtonCallback(native_window, glfw_on_mouse_button);
//     glfwSetScrollCallback(native_window, glfw_on_scroll);
//     glfwSetKeyCallback(native_window, glfw_on_key_action);
//     glfwSetWindowSizeCallback(native_window, glfw_on_resize);

//     glfwMakeContextCurrent(native_window);
//     glfwSwapInterval(1);
//     window->native_window = (void*)native_window;
//     glfwSetWindowUserPointer(native_window, window);
//     glfwGetWindowSize(native_window, &window->width, &window->height);

//     glFrontFace(GL_CCW);
//     glDepthRangef(0.0f, 1.0f);
//     glClearDepthf(1.0f);
//     glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
//     glClear(GL_DEPTH_BUFFER_BIT | GL_COLOR_BUFFER_BIT);

//     ULOG_INFO_FMT("USER_AGENT: {}", USER_AGENT);
//     ULOG_INFO_FMT("GL_VERSION: {}", glGetString(GL_VERSION));
//     ULOG_INFO_FMT("GL_RENDERER: {}", glGetString(GL_RENDERER));
//     ULOG_INFO_FMT("GL_VENDOR: {}", glGetString(GL_VENDOR));

//     default_cursor = glfwCreateStandardCursor(CURSOR_Default);
//     text_input_cursor = glfwCreateStandardCursor(CURSOR_Text);
//     resize_h_cursor = glfwCreateStandardCursor(CURSOR_ResizeH);
//     resize_v_cursor = glfwCreateStandardCursor(CURSOR_ResizeV);

    return NULL;
}

void os_window_set_cursor(os_window_t *window, int type) {
    // cursor_type = type;
    // switch (cursor_type) {
    //     case CURSOR_Default:
    //         glfwSetCursor((GLFWwindow*)window->native_window, default_cursor);
    //         break;
    //         case CURSOR_Text:
    //         glfwSetCursor((GLFWwindow*)window->native_window, text_input_cursor);
    //         break;
    //             case CURSOR_ResizeH:
    //         glfwSetCursor((GLFWwindow*)window->native_window, resize_h_cursor);
    //         break;
    //             case CURSOR_ResizeV:
    //         glfwSetCursor((GLFWwindow*)window->native_window, resize_v_cursor);
    //         break;
    //     default:
    //         break;
    // }
}

void os_window_run_loop(os_window_t *window, void (*fn)(void)) {
//     while (!glfwWindowShouldClose((GLFWwindow*)window->native_window)) {
// #if defined(OS_MACOS)
//         if (window->capture_required && !window->capture_started) {
//             metal_capture_start();
//             ULOG_INFO("Metal capture start");
//             window->capture_started = true;
//         }
// #endif
//         fn();
//         os_window_tick(window);
//         glfwSwapBuffers((GLFWwindow*)window->native_window);
//         glfwPollEvents();
// #if defined(OS_MACOS)
//         if (window->capture_required && window->capture_started) {
//             window->capture_started = false;
//             window->capture_required = false;
//             metal_capture_end();
//             ULOG_INFO("Metal capture end");
//         }
// #endif
//     }
}

void os_window_capture_require(os_window_t *window) {
    window->capture_required = true;
}

void os_window_close(os_window_t *window) {
    // glfwDestroyCursor(default_cursor);
    // glfwDestroyCursor(text_input_cursor);
    // glfwDestroyCursor(resize_h_cursor);
    // glfwDestroyCursor(resize_v_cursor);
    // glfwDestroyWindow((GLFWwindow*)window->native_window);
    // glfwTerminate();
    // free(window);
}

extern void os_window_set_clipboard(os_window_t *window, ustring_view text) {
    // ustring str = ustring_view_to_new_ustring(&text);
    // glfwSetClipboardString((GLFWwindow*)window->native_window, str.data);
    // ustring_free(&str);
}

extern ustring os_window_get_clipboard(os_window_t *window) {
    // return ustring_str((i8*)glfwGetClipboardString((GLFWwindow*)window->native_window));
    return ustring_NULL;
}

#endif