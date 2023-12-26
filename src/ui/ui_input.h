#pragma once

#include "ui/ui_label.h"

typedef struct ui_input_t {
    ui_element element;
    ui_label_t label;
    float4 radiuses;
    ustring_view unmodified_text;
    bool editing;
    bool outline;
} ui_input_t;

void ui_input_init(ui_input_t *input, ustring_view text);
bool ui_input(ui_state_t *state, ui_input_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip);