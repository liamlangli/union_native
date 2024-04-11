#pragma once

#include "ui/ui_label.h"

typedef struct ui_button_t {
    ui_element element;
    ui_label_t label;
    float4 radiuses;
} ui_button_t;

UN_EXPORT void ui_button_init(ui_button_t *button, ustring_view text);
UN_EXPORT bool ui_button(ui_button_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip);