#include "ui.h"

enum ui_corner {
    TOP_LEFT = 0 << 24,
    TOP_RIGHT = 1 << 24,
    BOTTOM_LEFT = 2 << 24,
    BOTTOM_RIGHT = 3 << 24,
};

enum ui_primitive_type {
    UI_PRIMITIVE_TYPE_TRIANGLE = 1 << 26,
    UI_PRIMITIVE_TYPE_TRIANGLE_TEXTURED = 2 << 26,
    UI_PRIMITIVE_TYPE_RECTANGLE = 3 << 26,
    UI_PRIMITIVE_TYPE_RECTANGLE_TEXTURED = 4 << 26,
    UI_PRIMITIVE_TYPE_SCREEN = 7 << 26,
    UI_PRIMITIVE_TYPE_ICON = 8 << 26,
    UI_PRIMITIVE_TYPE_ATLAS = 9 << 26,
    UI_PRIMITIVE_TYPE_DASH = 10 << 26,
    UI_PRIMITIVE_TYPE_ENTITY = 11 << 26,
    UI_PRIMITIVE_TYPE_DASH_ANIMATED = 12 << 26,
    UI_PRIMITIVE_TYPE_GLYPH = 32 << 26,
    UI_PRIMITIVE_TYPE_GLYPH_CODE = 33 << 26,
};

enum ui_clip_result {
    CLIP_RESULT_DISCARD = 0,
    CLIP_RESULT_KEEP,
    CLIP_RESULT_CLIP,
};

typedef struct ui_primitive_layer_t {
    f32* vertices;
    u32* indices;

    u32 vertex_count;
    u32 index_count;

    u32 last_vertex_count;
    u32 last_index_count;
} ui_primitive_layer_t;

const i32 MAX_UI_PRIMITIVE_LAYERS = 4;

typedef struct ui_primitive_buffer_t {
    ui_primitive_layer_t layers[4];
} ui_primitive_buffer_t;

static inline u32 encode_vertex_id(enum ui_primitive_type type, enum ui_corner corner, u32 index) {
    return type | corner | (index >> 2);
}

static inline u32 decode_vertex_type(u32 id) {
    return (id >> 26) & 0x3f;
}

static inline u32 decode_vertex_corner(u32 id) {
    return (id >> 24) & 0x3;
}

static inline u32 decode_vertex_index(u32 id) {
    return (id & 0x3ffffff) << 2;
}

static inline enum ui_clip_result clip_rect(rect_t rect, rect_t clip) {
    if(rect.x + rect.w < clip.x || rect.x > clip.x + clip.w ||
       rect.y + rect.h < clip.y || rect.y > clip.y + clip.h) {
        return CLIP_RESULT_DISCARD;
    }

    if(rect.x >= clip.x && rect.x + rect.w <= clip.x + clip.w &&
       rect.y >= clip.y && rect.y + rect.h <= clip.y + clip.h) {
        return CLIP_RESULT_KEEP;
    }

    return CLIP_RESULT_CLIP;
}

static inline rect_t rect_intersect(rect_t r1, rect_t r2) {
    float l = MACRO_MAX(r1.x, r2.x);
    float r = MACRO_MIN(r1.x + r1.w, r2.x + r2.w);
    float t = MACRO_MAX(r1.y, r2.y);
    float b = MACRO_MIN(r1.y + r1.h, r2.y + r2.h);
    if (l >= r || t >= b) {
        return (rect_t){0};
    }
    return (rect_t){.x = l, .y = t, .w = r - l, .h = b - t};
}

static inline u32 prev(u32 i, u32 n, bool closed) {
    if (i == UINT32_MAX)
        return UINT32_MAX;
    else if (i > 0)
        return i - 1;
    else if (!closed)
        return UINT32_MAX;
    else
        return n - 1;
}

static inline u32 next(u32 i, u32 n, bool closed) {
    if (i == UINT32_MAX)
        return UINT32_MAX;
    else if (i + 1 < n)
        return i + 1;
    else if (!closed)
        return UINT32_MAX;
    else
        return 0;
}

typedef struct polyline_t {
    ui_style_t style;
    float2_t *points;
    f32 width, feather;
} polyline_t;

// struct 
static u32 stroke_polyline(const polyline_t *polyline) {

}