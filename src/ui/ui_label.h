#pragma once

#include "ui/ui_type.h"
#include "ui/ui_state.h"

#define MAX_CHAR_LENGTH 256

typedef struct ui_label_t {
    ui_element element;
    ustring text;
    float2 text_size;
    f32 scale;
    f32 char_offsets[MAX_CHAR_LENGTH];

    int start_index, cursor_index;
} ui_label_t;

void ui_label_init(ui_label_t *label, ustring text);
void ui_label_update_text(ui_label_t *label, ustring text);
void ui_label(ui_state_t *state, ui_label_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip);

f32 ui_input_cursor_offset(ui_label_t *label);