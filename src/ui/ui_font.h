#pragma once

#include "ui/msdf_font.h"

typedef struct ui_font {
    msdf_font *font;
    f32 scale;
} ui_font;

// font func
UN_EXPORT void ui_font_init(ui_font *font, msdf_font *gpu_font, u32 font_size);
UN_EXPORT ui_font *ui_font_shared();

UN_EXPORT float2 ui_font_compute_size_and_offset(ui_font *font, ustring_view text, f32 *offsets);