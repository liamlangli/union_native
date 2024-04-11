#include "ui/ui_state.h"
#include "os/os.h"

#include <stb_ds.h>

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

void ui_state_reset_mouse_state() {
    _state.left_mouse_release = false;
    _state.left_mouse_press = false;
    _state.right_mouse_press = false;
    _state.right_mouse_release = false;
    _state.middle_mouse_press = false;
    _state.middle_mouse_release = false;
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
    for (int i = 0, l = (int)hmlen(_state.key_press); i < l; i++) {
        hmdel(_state.key_press, _state.key_press[i].key);
    }

    for (int i = 0, l = (int)hmlen(_state.key_release); i < l; i++) {
        hmdel(_state.key_release, _state.key_release[i].key);
    }

    for (int i = 0, l = (int)hmlen(_state.key_pressed); i < l; i++) {
        ui_key_map_t *pair = &_state.key_pressed[i];
        if (_state.time - pair->value > LONG_PRESS_TIME) {
            hmput(_state.key_press, pair->key, _state.time);
            pair->value = _state.time - LONG_PRESS_TIME + LONG_PRESS_COLD_DOWN;
        }
    }

    bool updated = _state.defer_update_frame_index > 0;
    if (updated)
        _state.defer_update_frame_index--;
    _state.updated = updated;

    if (_state.active != -1)
        _state.active_frame_count++;
    return updated;
}

bool ui_state_hovering(ui_rect rect, int layer_index) {
    if (layer_index < _state.next_hover_layer_index || layer_index < _state.hover_layer)
        return false;
    return ui_rect_contains(rect, _state.pointer_location);
}

void ui_state_delete_key_press(int key) { hmdel(_state.key_press, key); }

void ui_state_key_press(int key) {
    hmput(_state.key_press, key, _state.time);
    hmput(_state.key_pressed, key, _state.time);
}

void ui_state_key_release(int key) {
    hmput(_state.key_release, key, _state.time);
    hmdel(_state.key_pressed, key);
}

bool ui_state_is_key_press(int key) { return hmgeti(_state.key_press, key) != -1; }

bool ui_state_is_key_pressed(int key) { return hmgeti(_state.key_pressed, key) != -1; }

bool ui_state_is_key_release(int key) { return hmgeti(_state.key_release, key) != -1; }

bool ui_state_set_active(u32 id) {
    if (_state.active == -1) {
        _state.last_active = _state.active;
        _state.active = (int)id;
        return true;
    }
    return false;
}

void ui_state_clear_active() {
    _state.last_active = _state.active;
    _state.active = -1;
    _state.active_frame_count = 0;
    _state.cursor_type = CURSOR_Default;
}

bool ui_state_set_focus(u32 id) {
    _state.focus = (int)id;
    return true;
}

void ui_state_clear_focus() { _state.focus = -1; }


