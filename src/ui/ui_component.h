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
} ui_label_t;

typedef struct ui_input_t {
    ui_element element;
    ui_label_t label;
    float4 radiuses;
    ustring unmodified_text;
    bool editing;
    bool outline;
} ui_input_t;

typedef struct ui_button_t {
    ui_element element;
    ui_label_t label;
    float4 radiuses;
} ui_button_t;

extern void ui_label_init(ui_label_t *label, ustring text);
extern void ui_input_init(ui_input_t *input, ustring text);
extern void ui_button_init(ui_button_t *button, ustring text);

extern void ui_label(ui_state_t *state, ui_label_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip);
extern bool ui_input(ui_state_t *state, ui_input_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip);
extern bool ui_button(ui_state_t *state, ui_button_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip);