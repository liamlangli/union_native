#pragma once

#include "component/ui/ui_primitive_buffer.h"

typedef struct ui_count_t {
    u32 vertex_count;
    u32 index_count;
} ui_count_t;

struct ui_draw_api {
    u32 (*add_clip_rect)(ui_primitive_layer_t *layer, rect_t clip);
    u32 (*add_sub_clip_rect)(ui_primitive_layer_t *layer, rect_t clip);
    rect_t (*clip_rect)(ui_primitive_layer_t *layer, u32 clip);

    void (*fill_rect)(ui_primitive_layer_t *layer, const ui_style_t *style, rect_t rect);
    void (*stroke_rect)(ui_primitive_layer_t *layer, const ui_style_t *style, rect_t rect);

    void (*texture_rect)(ui_primitive_layer_t *layer, const ui_style_t *style, rect_t rect, u32 texture, rect_t uv);

    void (*fill_round_rect)(ui_primitive_layer_t *layer, const ui_style_t *style, rect_t rect, f32 radius);
    void (*fill_round_rect_pre_corner)(ui_primitive_layer_t *layer, const ui_style_t *style, rect_t rect, float4_t radiuses);
    void (*stroke_round_rect)(ui_primitive_layer_t *layer, const ui_style_t *style, rect_t rect, f32 radius);
    void (*stroke_round_rect_pre_corner)(ui_primitive_layer_t *layer, const ui_style_t *style, rect_t rect, float4_t radiuses);

    void (*fill_circle)(ui_primitive_layer_t *layer, const ui_style_t *style, float2_t center, f32 radius);
    void (*stroke_circle)(ui_primitive_layer_t *layer, const ui_style_t *style, float2_t center, f32 radius);

    void (*fill_triangles)(ui_primitive_layer_t *layer, const ui_style_t *style, const float2_t *points, u32 point_count, const u32 *indices, u32 index_count);
    void (*fill_convex_polyline)(ui_primitive_layer_t *layer, const ui_style_t *style, const float2_t *points, u32 point_count);

    void (*stroke_polyline)(ui_primitive_layer_t *layer, const ui_style_t *style, const float2_t *points, u64 point_count, bool closed);
    void (*stroke_polyline_widths)(ui_primitive_layer_t *layer, const ui_style_t *style, const float2_t *points, const f32 *widths, u64 point_count, bool closed);

    void (*draw_glyphs)(ui_primitive_layer_t *layer, const ui_style_t *style, float2_t origin, const u16 *glyphs, u32 glyph_count);
};  

extern struct ui_draw_api *ui_draw;
