#pragma once

#include "core/global.h"
#include "core/simd.h"
#include <webgpu/webgpu.h>

#include <string>
#include <string_view>

#define MAX_GLYPH_COUNT 256

typedef struct msdf_glyph {
    bool valid;
    int id, index, xoffset, yoffset, xadvance, width, height, x, y;
    u32 gpu_index;
} msdf_glyph;

typedef struct msdf_font {
    std::string name;
    msdf_glyph glyphs[MAX_GLYPH_COUNT];
    int kernings[MAX_GLYPH_COUNT][MAX_GLYPH_COUNT];
    u32 line_height, size;

    u32 gpu_font_start;
    u32 gpu_font_id;

    u32 texture_width, texture_height;

#ifdef UI_NATIVE
    WGPUTexture texture;
    WGPUTextureView texture_view;
#endif
} msdf_font;

UN_EXPORT msdf_font *msdf_font_load(std::string_view json_path, std::string_view image_path);
UN_EXPORT msdf_font *msdf_font_system_font();

float2 msdf_font_compute_size_and_offset(msdf_font *font, std::string_view text, f32 *offsets);
msdf_glyph msdf_font_get_glyph(msdf_font *font, int index);
int msdf_font_computer_kerning(msdf_font *font, int prev, int next);
