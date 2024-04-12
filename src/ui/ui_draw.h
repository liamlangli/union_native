#pragma once

#include "foundation/global.h"
#include "ui/ui_renderer.h"
#include "ui/ui_font.h"

enum UI_PRIMITIVE_TYPE {
    UI_PRIMITIVE_TYPE_RECTANGLE = (1 << 26),
    UI_PRIMITIVE_TYPE_TRIANGLE = (2 << 26),
    UI_PRIMITIVE_TYPE_TRIANGLE_ADVANCED = (3 << 26)
};

enum UI_TRIANGLE_TYPE {
    TRIANGLE_SOLID = 2,
    TRIANGLE_DASH,
    TRIANGLE_ICON,
    TRIANGLE_SCREEN,
    TRIANGLE_ENTITY,
    TRIANGLE_ATLAS
};

enum UI_CLIP_RESULT {
    CLIP_RESULT_DISCARD = -1,
    CLIP_RESULT_KEEP = 0,
    CLIP_RESULT_CLIP = 1,
};

/**
 * vertex_id uint32 index
 * | 0 00000|     00| 00000000 00000000 00000000|
 * |  6 bits| 2 bits|                     24 bit|
 * |    type| corner|           primitive offset|
 */
static inline u32 encode_vertex_id(u32 type, u32 corner, u32 offset) {
    return type | corner | (offset >> 2);
}

/**
 * glyph_id uint32 index
 * |     1|         00000|     00| 00000000 00000000 00000000|
 * | 1 bit|        5 bits| 2 bits|                     24bits|
 * |  flag| header offset| corner|           primitive offset|
 */
static inline u32 encode_glyph_id(u32 header_offset, u32 corner, u32 offset) {
    return 0x80000000 | (header_offset << 26) | corner | (offset >> 2);
}

static inline u32 decode_vertex_type(u32 i) {
    return (i >> 26) & 0x3f;
}

static inline u32 decode_corner_id(u32 i) {
    return (i >> 24) & 0x3;
}

static inline u32 decode_vertex_offset(u32 i) {
    return (i & 0xffffff) << 2;
}

static inline u32 ui_rect_clip(ui_rect rect, ui_rect clip) {
    if (rect.x + rect.w < clip.x || rect.x > clip.x + clip.w) return CLIP_RESULT_DISCARD;
    if (rect.y + rect.h < clip.y || rect.y > clip.y + clip.h) return CLIP_RESULT_DISCARD;
    if (rect.x >= clip.x && rect.x + rect.w <= clip.x + clip.w && rect.y >= clip.y && rect.y + rect.h < clip.y + clip.h) return CLIP_RESULT_KEEP;
    return CLIP_RESULT_CLIP;
}


// ui draw commands
UN_EXPORT void fill_rect(u32 layer_index, ui_style style, ui_rect rect, u32 clip);
UN_EXPORT void fill_round_rect(u32 layer_index, ui_style style, ui_rect rect, f32 radius, u32 clip, u32 triangle_type);
UN_EXPORT void fill_round_rect_pre_corner(u32 layer_index, ui_style style, ui_rect rect, float4 radiusese, u32 clip, u32 triangle_type);

UN_EXPORT void stroke_rect(u32 layer_index, ui_style style, ui_rect rect, u32 clip);
UN_EXPORT void stroke_round_rect(u32 layer_index, ui_style style, ui_rect rect, f32 radius, u32 clip, u32 triangle_type);
UN_EXPORT void stroke_round_rect_pre_corner(u32 layer_index, ui_style style, ui_rect rect, float4 radiusese, u32 clip, u32 triangle_type);


UN_EXPORT void draw_glyph(u32 layer_index, float2 origin, ui_font *font, ustring_view text, u32 clip, f32 scale, ui_style style);