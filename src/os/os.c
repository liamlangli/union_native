#include "os/os.h"
#include "foundation/global.h"
#include "os.h"
#include "script/script_context.h"
#include "script/browser.h"
#include "ui/ui_keycode.h"

#include <unistd.h>

void os_setup(int argc, char **argv) {}
void os_terminate() {}

static i8 shared_buffer[512];
ustring os_cwd() {
    getcwd(shared_buffer, 512);
    return (ustring){ .data = shared_buffer, .length = (u32)strlen(shared_buffer) };
}

void os_window_on_scroll(os_window_t* window, double x, double y) {
    script_context_t *ctx = script_context_shared();
    ui_state_t *state = ui_state_get();
    if (state->active == -1 && state->hover == -1) script_browser_window_mouse_scroll(x, y);
    const bool shift = ui_state_is_key_pressed(KEY_LEFT_SHIFT) || ui_state_is_key_pressed(KEY_RIGHT_SHIFT);
    state->pointer_scroll.x = (f32)(x * (shift ? state->smooth_factor : 1.f));
    state->pointer_scroll.y = (f32)(-y * (shift ? state->smooth_factor : 1.f));
}

void os_window_on_mouse_btn(os_window_t* window, MOUSE_BUTTON button, BUTTON_ACTION action) {
    script_context_t *ctx = script_context_shared();
    if (ctx == NULL) return;

    if (action == BUTTON_ACTION_PRESS) {
        if (button == MOUSE_BUTTON_LEFT) {
            ui_state_mouse_down(0);
            script_browser_window_mouse_down(0);
        } else if (button == MOUSE_BUTTON_RIGHT) {
            ui_state_mouse_down(1);
            script_browser_window_mouse_down(1);
        } else {
            ui_state_mouse_down(2);
            script_browser_window_mouse_down(2);
        }
        ui_state_set_mouse_location(window->mouse_x, window->mouse_y);
    } else if (action == BUTTON_ACTION_RELEASE) {
        if (button == MOUSE_BUTTON_LEFT) {
            ui_state_mouse_up(0);
            script_browser_window_mouse_up(0);
        } else if (button == MOUSE_BUTTON_RIGHT) {
            ui_state_mouse_up(1);
            script_browser_window_mouse_up(1);
        } else {
            ui_state_mouse_up(2);
            script_browser_window_mouse_up(2);
        }
        ui_state_set_mouse_location(window->mouse_x, window->mouse_y);
    }
}

void os_window_on_key_action(os_window_t* window, int key, BUTTON_ACTION action) {
    script_context_t *ctx = script_context_shared();
    if (ctx == NULL) return;

    if (action == BUTTON_ACTION_PRESS) {
        ui_state_key_press(key);
        script_browser_document_key_down(key);
    } else if (action == BUTTON_ACTION_RELEASE) {
        ui_state_key_release(key);
        script_browser_document_key_up(key);
    }
}

bool os_window_is_key_pressed(os_window_t* window, int key) {
    script_context_t *ctx = script_context_shared();
    if (ctx == NULL) return false;
    return ui_state_is_key_pressed(key);
}

void os_window_on_resize(os_window_t *window, int width, int height) {
    script_context_t *ctx = script_context_shared();
    window->width = width;
    window->height = height;
    ui_renderer_set_size(width, height);
    ui_state_t* state = ui_state_get();
    state->window_rect = (ui_rect){
        .x = 0.f,
        .y = 0.f,
        .w = width,
        .h = height
    };
    script_browser_window_resize(width, height);
}

#if !defined(OS_MACOS) && !defined(OS_IOS)
ustring os_get_bundle_path(ustring path) {
    return path;
}
#endif
