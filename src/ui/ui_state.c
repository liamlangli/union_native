#include "ui/ui_state.h"

void ui_state_init(ui_state_t *state, ui_renderer_t *renderer) {
    state->renderer = renderer;

    state->next_hover = -1;
    state->next_hover_layer_index = -1;
    state->active = -1;
    state->hover = -1;
    state->focus = -1;
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

    bool updated = state->defer_update_frame_index > 0;
    if (updated) state->defer_update_frame_index--;
    state->updated = updated;

    if (state->active != -1) state->active_frame_count++;
    return updated;
}

bool ui_state_hovering(ui_state_t *state, ui_rect rect, int layer_index) {
    if (layer_index < state->next_hover_layer_index) return false;
    return ui_rect_contains(rect, state->mouse_location);
}