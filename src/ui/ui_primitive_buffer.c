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

static const int num_corner_point = 4;
static const f32 rr_cos[4] = {
    0.3141592653589793f,
    0.6283185307179586f,
    0.9424777960769379f,
    1.2566370614359172f
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
    bool closed;
    u32 clip;
    f32 width, feather;
    color_srgb_t color;

    u32 num_point;
    float2_t points[64];
} polyline_t;

static polyline_t __polyline;


// struct 
static u32 stroke_polyline(void) {
    u32 prev_index = UINT32_MAX;
    u32 next_index = UINT32_MAX;
    u32 num_point = __polyline.num_point;

}

static u32 fill_polyline(void) {

}

static void round_rect_corner(float2_t *points, u32 offset, float2_t center, float2_t c, float2_t s) {
    points[offset + 0] = (float2_t){center.x + c.x * rr_cos[0] + s.x * rr_cos[3], center.y + c.y * rr_cos[0] + s.y * rr_cos[3]};
    points[offset + 1] = (float2_t){center.x + c.x * rr_cos[1] + s.x * rr_cos[2], center.y + c.y * rr_cos[1] + s.y * rr_cos[2]};
    points[offset + 2] = (float2_t){center.x + c.x * rr_cos[2] + s.x * rr_cos[1], center.y + c.y * rr_cos[2] + s.y * rr_cos[1]};
    points[offset + 3] = (float2_t){center.x + c.x * rr_cos[3] + s.x * rr_cos[0], center.y + c.y * rr_cos[3] + s.y * rr_cos[0]};
}

static void round_rect_path(rect_t rect, float4_t radiuses) {
    f32 max_radius = MACRO_MIN(rect.w * 0.25f, rect.h * 0.25f);
    radiuses.x = MACRO_MIN(radiuses.x, max_radius);
    radiuses.y = MACRO_MIN(radiuses.y, max_radius);
    radiuses.z = MACRO_MIN(radiuses.z, max_radius);
    radiuses.w = MACRO_MIN(radiuses.w, max_radius);

    float2_t p0 = (float2_t){rect.x + radiuses.x, rect.y + radiuses.y};
    float2_t p1 = (float2_t){rect.x + rect.w - radiuses.y, rect.y + radiuses.y};
    float2_t p2 = (float2_t){rect.x + radiuses.z, rect.y + rect.h - radiuses.z};
    float2_t p3 = (float2_t){rect.x + rect.w - radiuses.w, rect.y + rect.h - radiuses.w};

    float2_t *data = __polyline.points;
    u32 offset = 0;

    u32 num_point = 0;
    if (radiuses.x <= EPSILON) {
        data[offset++] = p0;
        num_point++;
    } else {
        data[offset++] = (float2_t){ rect.x, p0.y };
        float2_t c = (float2_t){ -radiuses.x, 0.f };
        float2_t s = (float2_t){ 0.f, -radiuses.x };
        round_rect_corner(data, offset, p0, c, s);
        offset += 4;
        data[offset++] = (float2_t){ p0.x, rect.y };
        num_point += 6;
    }

    if (radiuses.y <= EPSILON) {
        data[offset++] = p1;
        num_point++;
    } else {
        data[offset++] = (float2_t){ rect.x + rect.w, p1.y };
        float2_t c = (float2_t){ 0.f, -radiuses.y };
        float2_t s = (float2_t){ radiuses.y, 0.f };
        round_rect_corner(data, offset, p1, c, s);
        offset += 4;
        data[offset++] = (float2_t){ p1.x, rect.y };
        num_point += 6;
    }

    if (radiuses.w <= EPSILON) {
        data[offset++] = p3;
        num_point++;
    } else {
        data[offset++] = (float2_t){ rect.x + rect.w, p3.y };
        float2_t c = (float2_t){ radiuses.w, 0.f };
        float2_t s = (float2_t){ 0.f, radiuses.w };
        round_rect_corner(data, offset, p3, c, s);
        offset += 4;
        data[offset++] = (float2_t){ p3.x, rect.y + rect.h };
        num_point += 6;
    }

    if (radiuses.z <= EPSILON) {
        data[offset++] = p2;
        num_point++;
    } else {
        data[offset++] = (float2_t){ rect.x, p2.y };
        float2_t c = (float2_t){ 0.f, radiuses.z };
        float2_t s = (float2_t){ -radiuses.z, 0.f };
        round_rect_corner(data, offset, p2, c, s);
        offset += 4;
        data[offset++] = (float2_t){ p2.x, rect.y + rect.h };
        num_point += 6;
    }
    __polyline.num_point = num_point;
}
