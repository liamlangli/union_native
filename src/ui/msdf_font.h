#pragma once

#include "ui/ui_type.h"
#include "foundation/simd.h"

typedef struct msdf_glyph {
    int id, index, xoffset, yoffset, xadvance, width, height, x, y;
    u32 gpu_index;
} msdf_glyph;

typedef struct kerning_key {
    int first, second;
} kerning_key;

typedef struct kerning_map_hm {
    kerning_key key;
    int value;
} kerning_map_hm;

typedef struct char_map_hm {
    int key;
    msdf_glyph value;
} char_map_hm;

typedef struct msdf_font {
    ustring name;
    char_map_hm *char_map;
    kerning_map_hm *kerning_map;
    u32 line_height, size;
    u32 texture_handle, texture_width, texture_height;

    u32 gpu_font_id;
    u32 gpu_font_start;
} msdf_font;

msdf_font* msdf_font_load(ustring json_path, ustring image_path);
msdf_font* msdf_font_system_font();

float2 msdf_font_compute_size_and_offset(msdf_font *font, ustring_view text, f32* offsets);
msdf_glyph msdf_font_get_glyph(msdf_font *font, int index);
int msdf_font_computer_kerning(msdf_font *font, int prev, int next);
