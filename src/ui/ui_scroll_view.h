#pragma once

#include "ui/ui_type.h"
#include "ui/ui_state.h"

typedef struct ui_scroll_view_t {
    ui_element element;
    u32 item_height, item_count;
    f64 offset_y;
    bool scroll_bar;
} ui_scroll_view_t;

void ui_scroll_view_init(ui_scroll_view_t *view, u32 item_height);
void ui_scroll_view(ui_state_t *state, ui_scroll_view_t *view, ui_rect rect, u32 layer_index, u32 clip);

u32 ui_scroll_view_item_start(ui_scroll_view_t *view, ui_rect rect);
u32 ui_scroll_view_item_count(ui_scroll_view_t *view, ui_rect rect);
