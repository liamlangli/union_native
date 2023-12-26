#include "ui/ui_state.h"

#include <stb_ds.h>
#include <GLFW/glfw3.h>
#include "ui/ui_keycode.h"

void ui_state_init(ui_state_t *state, ui_renderer_t *renderer) {
    state->renderer = renderer;

    state->next_hover = -1;
    state->next_hover_layer_index = -1;
    state->active = -1;
    state->hover = -1;
    state->focus = -1;

    ustring_view_reserve(&state->edit_str, 32);

    hmdefault(state->key_press, false);
    hmdefault(state->key_pressed, false);
}

void ui_state_reset_mouse_state(ui_state_t *state) {
    state->left_mouse_release = false;
    state->left_mouse_press = false;
    state->right_mouse_press = false;
    state->right_mouse_release = false;
    state->middle_mouse_press = false;
    state->middle_mouse_release = false;
}

bool ui_state_update(ui_state_t *state) 
{
    memset(state->key_press, 0, MAX_KEY_COUNT);
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

    bool updated = state->defer_update_frame_index > 0;
    if (updated) state->defer_update_frame_index--;
    state->updated = updated;

    if (state->active != -1) state->active_frame_count++;
    return updated;
}

bool ui_state_hovering(ui_state_t *state, ui_rect rect, int layer_index) {
    if (layer_index < state->next_hover_layer_index || layer_index < state->hover_layer) return false;
    return ui_rect_contains(rect, state->mouse_location);
}

void ui_state_key_press(ui_state_t *state, int key) {
    hmput(state->key_press, key, true);
}

void ui_state_key_release(ui_state_t *state, int key) {
    hmput(state->key_release, key, true);
    hmdel(state->key_pressed, key);
}

bool ui_state_is_key_press(ui_state_t *state, int key) {
    return hmgeti(state->key_press, key) != -1;
}

bool ui_state_is_key_pressed(ui_state_t *state, int key) {
    return hmgeti(state->key_pressed, key) != -1;
}

bool ui_state_is_key_release(ui_state_t *state, int key) {
    return hmgeti(state->key_release, key) != -1;
}

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

void ui_state_clear_focus(ui_state_t *state) {
    state->focus = -1;
}

u32 ui_state_parse_char(ui_state_t *state) {
    ustring_view *dst = &state->edit_str;
    ustring_view_clear(dst);
    const bool shift = ui_state_is_key_press(state, KEY_LEFT_SHIFT) || ui_state_is_key_press(state, KEY_RIGHT_SHIFT);
    u32 valid_char_count = 0;
    for (int i = 0, l = hmlen(state->key_press); i < l; i++) {
        int key = state->key_press[i].key;
        if (key >= KEY_A && key <= KEY_Z) {
            if (!shift) {
                key = key - KEY_A + KEY_LOWER_CASE_A;
            }
            ustring_view_push(dst, key);
            valid_char_count++;
        } else {
            switch (key) {
                case KEY_0:
                    key = shift ? ')' : '0';
                case KEY_1:
                    key = shift ? '!' : '1';
                case KEY_2:
                    key = shift ? '@' : '2';
                case KEY_3:
                    key = shift ? '#' : '3';
                case KEY_4:
                    key = shift ? '$' : '4';
                case KEY_5:
                    key = shift ? '%' : '5';
                case KEY_6:
                    key = shift ? '^' : '6';
                case KEY_7:
                    key = shift ? '&' : '7';
                case KEY_8:
                    key = shift ? '*' : '8';
                case KEY_9:
                    key = shift ? '(' : '9';
                case KEY_MINUS:
                    key = shift ? '_' : '-';
                case KEY_EQUAL:
                    key = shift ? '+' : '=';
                case KEY_LEFT_BRACKET:
                    key = shift ? '{' : '[';
                case KEY_RIGHT_BRACKET:
                    key = shift ? '}' : ']';
                case KEY_BACKSLASH:
                    key = shift ? '|' : '\\';
                case KEY_COMMA:
                    key = shift ? '<' : ',';
                case KEY_PERIOD:
                    key = shift ? '>' : '.';
                case KEY_SLASH:
                    key = shift ? '?' : '/';
                case KEY_GRAVE_ACCENT:
                    key = shift ? '~' : '`';
                case KEY_SEMICOLON:
                    key = shift ? ':' : ';';
                case GLFW_KEY_APOSTROPHE   :
                    key = shift ? 34 : 39; // 34 = ", 39 = '
                case KEY_SPACE:
                    key = ' ';
                case KEY_TAB:
                    key = '\t';
                default:
                    break;
            }
            valid_char_count++;
        }
    }
    return valid_char_count;
}