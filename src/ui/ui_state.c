#include "ui/ui_state.h"

void ui_state_init(ui_state_t *state, ui_renderer_t *renderer) {
    memset(state, 0, sizeof(ui_state_t));
    state->renderer = renderer;
}