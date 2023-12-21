#pragma once

#include "ui/ui_type.h"
#include "ui/msdf_font.h"

typedef struct gpu_glyph {
    u32 id, index;
    f32 xadvance, xoffset, yoffset, width, height;
} gpu_glyph;

typedef struct gpu_font_header {
    u32 texture_width, texture_height, id;
} gpu_font_header;

typedef struct gpu_font {
    u32 id;
    u32 gpu_tetxure;
    u32 texture_width;
    u32 texture_height;
} gpu_font;

typedef struct ui_font {
    msdf_font *font;
    f32 scale;
} ui_font;

// font func
void ui_font_init(ui_font *font, msdf_font *gpu_font, u32 font_size);