#include "ui/ui_state.h"

#include <GLFW/glfw3.h>
#include <stb_ds.h>

#define LONG_PRESS_TIME 0.5
#define LONG_PRESS_COLD_DOWN 0.02

void ui_state_init(ui_state_t *state, ui_renderer_t *renderer) {
    state->renderer = renderer;
    state->next_hover = -1;
    state->next_hover_layer_index = -1;
    state->active = -1;
    state->hover = -1;
    state->focus = -1;
    state->time = glfwGetTime();

    ustring_view_reserve(&state->edit_str, 32);
}

void ui_state_reset_mouse_state(ui_state_t *state) {
    state->left_mouse_release = false;
    state->left_mouse_press = false;
    state->right_mouse_press = false;
    state->right_mouse_release = false;
    state->middle_mouse_press = false;
    state->middle_mouse_release = false;
}

bool ui_state_update(ui_state_t *state) {
    state->last_time = state->time;
    state->time = glfwGetTime();
    state->delta_time = state->time - state->last_time;

    state->hover = state->next_hover;
    state->hover_layer = state->next_hover_layer_index;
    state->next_hover = -1;
    state->next_hover_layer_index = -1;

    ui_state_reset_mouse_state(state);
    for (int i = 0, l = (int)hmlen(state->key_press); i < l; i++) {
        hmdel(state->key_press, state->key_press[i].key);
    }

    for (int i = 0, l = (int)hmlen(state->key_release); i < l; i++) {
        hmdel(state->key_release, state->key_release[i].key);
    }

    for (int i = 0, l = (int)hmlen(state->key_pressed); i < l; i++) {
        ui_key_map_t *pair = &state->key_pressed[i];
        if (state->time - pair->value > LONG_PRESS_TIME) {
            hmput(state->key_press, pair->key, state->time);
            pair->value = state->time - LONG_PRESS_TIME + LONG_PRESS_COLD_DOWN;
        }
    }

    bool updated = state->defer_update_frame_index > 0;
    if (updated)
        state->defer_update_frame_index--;
    state->updated = updated;

    if (state->active != -1)
        state->active_frame_count++;
    return updated;
}

bool ui_state_hovering(ui_state_t *state, ui_rect rect, int layer_index) {
    if (layer_index < state->next_hover_layer_index || layer_index < state->hover_layer)
        return false;
    return ui_rect_contains(rect, state->mouse_location);
}

void ui_state_key_press(ui_state_t *state, int key) {
    hmput(state->key_press, key, state->time);
    hmput(state->key_pressed, key, state->time);
}

void ui_state_key_release(ui_state_t *state, int key) {
    hmput(state->key_release, key, state->time);
    hmdel(state->key_pressed, key);
}

bool ui_state_is_key_press(ui_state_t *state, int key) { return hmgeti(state->key_press, key) != -1; }

bool ui_state_is_key_pressed(ui_state_t *state, int key) { return hmgeti(state->key_pressed, key) != -1; }

bool ui_state_is_key_release(ui_state_t *state, int key) { return hmgeti(state->key_release, key) != -1; }

bool ui_state_set_active(ui_state_t *state, u32 id) {
    if (state->active == -1) {
        state->last_active = state->active;
        state->active = id;
        return true;
    }
    return false;
}

void ui_state_set_active_force(ui_state_t *state, u32 id) {
    state->last_active = state->active;
    state->active = id;
}

void ui_state_clear_active(ui_state_t *state) {
    state->last_active = state->active;
    state->active = -1;
    state->active_frame_count = 0;
    state->cursor_type = CURSOR_Default;
}

bool ui_state_set_focus(ui_state_t *state, u32 id) {
    state->focus = id;
    return true;
}

void ui_state_clear_focus(ui_state_t *state) { state->focus = -1; }


