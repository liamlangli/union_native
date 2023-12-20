#pragma once

#include "foundation/simd.h"
#include "foundation/ustring.h"

typedef struct ui_style {
    f32 line_width, line_feather;
    u32 color, hover_color, active_color, outline_color;
} ui_style;

typedef struct ui_rect {
    f32 x, y, w, h;
} ui_rect;

u32 ui_id_create();
void ui_id_reset();
