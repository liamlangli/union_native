#include "os/os.h"

#include "core/global.h"
#include "core/network.h"
#include "os.h"
#include "script/script.h"
#include "ui/ui_keycode.h"
#include "webgpu_context.h"

#include <cstring>
#include <string>
#include <unistd.h>

void os_setup(int argc, char **argv) {
    (void)argc;
    (void)argv;
}

void os_terminate() {}

static i8 shared_buffer[512];

std::string os_cwd() {
    getcwd(shared_buffer, 512);
    return std::string(shared_buffer);
}

void os_window_on_mouse_move(os_window_t *window, f64 x, f64 y) {
    ui_state_t *state = ui_state_get();
    state->pointer_location.x = (f32)x;
    state->pointer_location.y = (f32)y;
    window->mouse_x = x;
    window->mouse_y = y;
    script_mouse_move((f32)x, (f32)y);
}

void os_window_on_scroll(os_window_t *window, f64 x, f64 y) {
    (void)window;
    ui_state_t *state = ui_state_get();
    const bool shift = ui_state_is_key_pressed(KEY_LEFT_SHIFT) || ui_state_is_key_pressed(KEY_RIGHT_SHIFT);
    state->pointer_scroll.x = (f32)(x * (shift ? state->smooth_factor : 1.f));
    state->pointer_scroll.y = (f32)(-y * (shift ? state->smooth_factor : 1.f));
}

void os_window_on_mouse_btn(os_window_t *window, MOUSE_BUTTON button, BUTTON_ACTION action) {
    if (script_shared() == NULL) return;

    if (action == BUTTON_ACTION_PRESS) {
        ui_state_mouse_down(button);
    } else if (action == BUTTON_ACTION_RELEASE) {
        ui_state_mouse_up(button);
    }
    script_mouse_button(button, action);
    ui_state_set_mouse_location((f32)window->mouse_x, (f32)window->mouse_y);
}

void os_window_on_key_action(os_window_t *window, int key, BUTTON_ACTION action) {
    (void)window;
    if (script_shared() == NULL) return;

    if (action == BUTTON_ACTION_PRESS) {
        ui_state_key_press(key);
        script_key_action((KEYCODE)key, BUTTON_ACTION_PRESS);
    } else if (action == BUTTON_ACTION_RELEASE) {
        ui_state_key_release(key);
        script_key_action((KEYCODE)key, BUTTON_ACTION_RELEASE);
    }
}

bool os_window_is_key_pressed(os_window_t *window, int key) {
    (void)window;
    if (script_shared() == NULL) return false;
    return ui_state_is_key_pressed(key);
}

void os_window_on_resize(os_window_t *window, int width, int height) {
    window->width = width;
    window->height = height;
    webgpu_context_resize(window);
    ui_renderer_set_size((u32)width, (u32)height);

    ui_state_t *state = ui_state_get();
    state->window_rect = (ui_rect){
        .x = 0.f,
        .y = 0.f,
        .w = (f32)width,
        .h = (f32)height,
    };
    script_resize(width, height);
}

#if !defined(OS_MACOS) && !defined(OS_IOS)
std::string os_get_bundle_path(std::string_view path) {
    return std::string(path);
}
#endif