#pragma once

#include "ui/ui_state.h"
#include "ui/ui_type.h"

#define MAX_CHAR_LENGTH 256

typedef struct ui_label_t {
    ui_element element;
    ustring_view text;
    float2 text_size;
    f32 scale;
    f32 char_offsets[MAX_CHAR_LENGTH];

    int start_index, cursor_index;
    bool render_selected;
    ui_style text_style;
} ui_label_t;

UN_EXPORT void ui_label_init(ui_label_t *label, ustring_view text);
UN_EXPORT void ui_label_update_text(ui_label_t *label, ustring_view text);
UN_EXPORT void ui_label_compute_size_and_offset(ui_label_t *label);

UN_EXPORT u32 ui_label_locate_cursor(ui_label_t *label, ui_rect rect, float2 location);
UN_EXPORT float2 ui_label_text_origin(ui_label_t *label, ui_rect rect);
UN_EXPORT f32 ui_label_cursor_offset(ui_label_t *label);

UN_EXPORT void ui_label(ui_label_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip);