#pragma once

#include "foundation/simd.h"

typedef struct ui_style {
    f32 line_width, line_feather;
    u32 color, hover_color, active_color, outline_color;
} ui_style;

typedef struct ui_rect {
    f32 x, y, w, h;
} ui_rect;

enum {
    CENTER_VERTICAL = 1,
    CENTER_HORIZONTAL = 1 << 1,
    CENTER = CENTER_VERTICAL | CENTER_HORIZONTAL,
    TOP = 1 << 2,
    RIGHT = 1 << 3,
    BOTTOM = 1 << 4,
    LEFT = 1 << 5,
};

typedef struct ui_margin {
    f32 top, right, bottom, left;
} ui_margin;

typedef struct ui_constraint {
    f32 width, height;
    ui_margin margin;
    u32 alignment;
} ui_constraint;

typedef struct ui_key_map_t {
    int key;
    f64 value; // last active time
} ui_key_map_t;

typedef struct ui_element {
    u32 id;
    ui_constraint constraint;
} ui_element;

u32 ui_id_create();
void ui_id_reset();

static inline ui_rect ui_rect_intersect(ui_rect a, ui_rect b) {
    f32 left = a.x > b.x ? a.x : b.x;
    f32 top = a.y > b.y ? a.y : b.y;
    f32 right = a.x + a.w > b.x + b.w ? a.x + a.w : b.x + b.w;
    f32 bottom = a.y + a.h > b.y + b.h ? a.y + a.h : b.y + b.h;
    if (left >= right || top >= bottom) {
        return (ui_rect){.x = 0.f, .y = 0.f, .w = 0.f, .h = 0.f};
    } else {
        return (ui_rect){.x = left, .y = top, .w = right - left, .h = bottom - top};
    }
}

static inline void ui_element_init(ui_element *element) {
    element->constraint.alignment = CENTER;
    element->id = ui_id_create();
}

static inline ui_rect ui_rect_shrink(ui_rect a, f32 h, f32 v) {
    return (ui_rect){.x = a.x + h, .y = a.y + v, .w = a.w - v * 2.f, .h = a.h - v * 2.f};
}

static inline bool ui_rect_contains(ui_rect rect, float2 point) {
    return point.x >= rect.x && point.y >= rect.y && point.x < rect.x + rect.w && point.y < rect.y + rect.h;
}

static inline void ui_constraint_scale(ui_constraint *constraint, f32 scale) {
    constraint->width *= scale;
    constraint->height *= scale;
    constraint->margin.top *= scale;
    constraint->margin.right *= scale;
    constraint->margin.bottom *= scale;
    constraint->margin.left *= scale;
}

static inline ui_style ui_style_from_hex(u32 color, u32 hover_color, u32 active_color, u32 outline_color) {
    ui_style style = (ui_style){
        .line_width = 2.f,
        .line_feather = 1.f,
        .color = color,
        .hover_color = hover_color,
        .active_color = active_color,
        .outline_color = outline_color};
    return style;
}

UN_EXPORT ui_rect ui_constraint_layout(ui_constraint *constraint, ui_rect parent);
