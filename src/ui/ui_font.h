#pragma once

#include "ui/msdf_font.h"

typedef struct ui_font {
    msdf_font *font;
    f32 scale;
} ui_font;

// font func
void ui_font_init(ui_font *font, msdf_font *gpu_font, u32 font_size);
ui_font *ui_font_system_font();
float2 ui_font_compute_size_and_offset(ui_font *font, ustring_view text, f32 *offsets);