#include "ui/ui_state.h"
#include "os/os.h"

#define LONG_PRESS_TIME 0.5
#define LONG_PRESS_COLD_DOWN 0.02

static ui_state_t _state;

void ui_state_init() {
    _state.next_hover = -1;
    _state.next_hover_layer_index = -1;
    _state.active = -1;
    _state.hover = -1;
    _state.focus = -1;
    _state.smooth_factor = 0.1;

    ustring_view_reserve(&_state.edit_str, 32);
}

ui_state_t *ui_state_get() { return &_state; }

void ui_state_reset_mouse_state() {
    _state.left_mouse_release = false;
    _state.left_mouse_press = false;
    _state.right_mouse_press = false;
    _state.right_mouse_release = false;
    _state.middle_mouse_press = false;
    _state.middle_mouse_release = false;
}

void ui_state_set_size(u32 width, u32 height) {
    _state.window_rect = (ui_rect){.x = 0, .y = 0, .w = (f32)width, .h = (f32)height};
}

bool ui_state_update() {
    _state.last_time = _state.time;
    // _state.time = glfwGetTime();
    _state.delta_time = _state.time - _state.last_time;

    _state.hover = _state.next_hover;
    _state.hover_layer = _state.next_hover_layer_index;
    _state.next_hover = -1;
    _state.next_hover_layer_index = -1;

    _state.pointer_delta = float2_sub(_state.pointer_location, _state.pointer_start);
    _state.pointer_scroll = float2_zero();

    ui_state_reset_mouse_state();
    memset(_state.key_press, 0, sizeof(_state.key_press));
    memset(_state.key_release, 0, sizeof(_state.key_release));

    bool updated = _state.defer_update_frame_index > 0;
    if (updated)
        _state.defer_update_frame_index--;
    _state.updated = updated;

    if (_state.active != -1)
        _state.active_frame_count++;
    return updated;
}

bool ui_state_hovering(ui_rect rect, i32 layer_index) {
    if (layer_index < _state.next_hover_layer_index || layer_index < _state.hover_layer)
        return false;
    return ui_rect_contains(rect, _state.pointer_location);
}

void ui_state_delete_key_press(i32 key) { _state.key_press[key] = 0; }

void ui_state_key_press(i32 key) {
    _state.key_press[key] = 1;
    _state.key_pressed[key] = 1;
}

void ui_state_key_release(i32 key) {
    _state.key_release[key] = 1;
    _state.key_pressed[key] = 0;
}

bool ui_state_is_key_press(i32 key) { return _state.key_press[key] == 1; }

bool ui_state_is_key_pressed(i32 key) { return _state.key_pressed[key] == 1; }

bool ui_state_is_key_release(i32 key) { return _state.key_release[key] == 1; }

bool ui_state_set_active(i32 id) {
    if (_state.active == -1) {
        _state.last_active = _state.active;
        _state.active = id;
        return true;
    }
    return false;
}

void ui_state_mouse_down(i32 button) {
    if (button == MOUSE_BUTTON_LEFT) {
        _state.left_mouse_press = true;
        _state.left_mouse_is_pressed = true;
        _state.pointer_start = _state.pointer_location;
    } else if (button == MOUSE_BUTTON_RIGHT) {
        _state.right_mouse_press = true;
        _state.right_mouse_is_pressed = true;
    } else {
        _state.middle_mouse_press = true;
        _state.middle_mouse_is_pressed = true;
    }
}

void ui_state_mouse_up(i32 button) {
    if (button == MOUSE_BUTTON_LEFT) {
        _state.left_mouse_release = true;
        _state.left_mouse_is_pressed = false;
    } else if (button == MOUSE_BUTTON_RIGHT) {
        _state.right_mouse_release = true;
        _state.right_mouse_is_pressed = false;
    } else {
        _state.middle_mouse_release = true;
        _state.middle_mouse_is_pressed = false;
    }
}

bool ui_state_is_mouse_down(i32 button) {
    if (button == MOUSE_BUTTON_LEFT) {
        return _state.left_mouse_press;
    } else if (button == MOUSE_BUTTON_RIGHT) {
        return _state.right_mouse_press;
    } else {
        return _state.middle_mouse_press;
    }
}

bool ui_state_is_mouse_pressed(i32 button) {
    if (button == MOUSE_BUTTON_LEFT) {
        return _state.left_mouse_is_pressed;
    } else if (button == MOUSE_BUTTON_RIGHT) {
        return _state.right_mouse_is_pressed;
    } else {
        return _state.middle_mouse_is_pressed;
    }
}

void ui_state_set_mouse_location(f32 x, f32 y) {
    float2 point = (float2){x, y};
    _state.pointer_delta = float2_sub(point, _state.pointer_start);
    _state.pointer_location = point;
    _state.pointer_offset = float2_sub(_state.pointer_location, _state.pointer_start);
}

i32 ui_state_get_active() { return _state.active; }
i32 ui_state_get_last_active() { return _state.last_active; }
i32 ui_state_get_focus() { return _state.focus; }
i32 ui_state_get_hover() { return _state.hover; }

void ui_state_clear_active() {
    _state.last_active = _state.active;
    _state.active = -1;
    _state.active_frame_count = 0;
    _state.cursor_type = CURSOR_Default;
}

bool ui_state_set_focus(i32 id) {
    _state.focus = (i32)id;
    return true;
}

void ui_state_clear_focus() { _state.focus = -1; }


