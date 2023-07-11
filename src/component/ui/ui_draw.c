#include "component/ui/ui_draw.h"

#include <stdint.h>
#include <string.h>

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

static inline f32 u8_to_color_float(u8 c) {
    return ((f32)c) / 255.f;
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
    bool closed, dashed;
    u32 clip;
    f32 width, feather, dash_offset;
    color_srgb_t color;

    u32 point_count;
    float2_t *points;
    f32 *widths;
} polyline_t;

static polyline_t __polyline;

typedef struct round_rect_t {
    bool dashed;
    u32 clip;
    f32 width, feather, dash_offset;
    color_srgb_t color;
    float4_t radiuses;
    rect_t rect;
} round_rect_t;

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


    u32 point_count = 0;
    if (radiuses.x <= EPSILON) {
        data[offset++] = p0;
        point_count++;
    } else {
        data[offset++] = (float2_t){ rect.x, p0.y };
        float2_t c = (float2_t){ -radiuses.x, 0.f };
        float2_t s = (float2_t){ 0.f, -radiuses.x };
        round_rect_corner(data, offset, p0, c, s);
        offset += 4;
        data[offset++] = (float2_t){ p0.x, rect.y };
        point_count += 6;
    }

    if (radiuses.y <= EPSILON) {
        data[offset++] = p1;
        point_count++;
    } else {
        data[offset++] = (float2_t){ rect.x + rect.w, p1.y };
        float2_t c = (float2_t){ 0.f, -radiuses.y };
        float2_t s = (float2_t){ radiuses.y, 0.f };
        round_rect_corner(data, offset, p1, c, s);
        offset += 4;
        data[offset++] = (float2_t){ p1.x, rect.y };
        point_count += 6;
    }

    if (radiuses.w <= EPSILON) {
        data[offset++] = p3;
        point_count++;
    } else {
        data[offset++] = (float2_t){ rect.x + rect.w, p3.y };
        float2_t c = (float2_t){ radiuses.w, 0.f };
        float2_t s = (float2_t){ 0.f, radiuses.w };
        round_rect_corner(data, offset, p3, c, s);
        offset += 4;
        data[offset++] = (float2_t){ p3.x, rect.y + rect.h };
        point_count += 6;
    }

    if (radiuses.z <= EPSILON) {
        data[offset++] = p2;
        point_count++;
    } else {
        data[offset++] = (float2_t){ rect.x, p2.y };
        float2_t c = (float2_t){ 0.f, radiuses.z };
        float2_t s = (float2_t){ -radiuses.z, 0.f };
        round_rect_corner(data, offset, p2, c, s);
        offset += 4;
        data[offset++] = (float2_t){ p2.x, rect.y + rect.h };
        point_count += 6;
    }
    __polyline.point_count = point_count;
}

// struct
static ui_count_t stroke_polyline_internal(enum ui_primitive_type type, ui_primitive_layer_t *layer) {
    u32 prev_index = UINT32_MAX;
    u32 next_index = UINT32_MAX;
    float2_t prev_point, next_point, point;

    const bool closed = __polyline.closed;
    const u32 point_data_count = __polyline.point_count;
    const u32 point_count = point_data_count + (closed ? 1 : 0);
    const u32 stride = 1;
    const float2_t *points = __polyline.points;
    const f32 line_width = __polyline.width;
    const f32 feather = __polyline.feather;
    const f32 alpha =  u8_to_color_float(__polyline.color.a);

    ui_vertex_t vertex = { 0 };
    vertex.triangle_vertex.color = __polyline.color;
    vertex.triangle_vertex.clip = __polyline.clip;
    vertex.triangle_vertex.dash_offset = __polyline.dash_offset;

    u32 vertex_count = 0;
    u32 index_count = 0;

    struct edge_t
    {
        uint32_t e[4];
    };
    struct edge_t last_edge = { 0 };

    for (u32 i = 0; i < point_count; ++i) {
        const u32 point_index = i % point_data_count;
        prev_index = prev(point_index, point_data_count, closed);
        while (prev_index != UINT32_MAX &&
               prev_index != point_index &&
               memcmp(&points[prev_index], &points[point_index], sizeof(float2_t)) == 0)
            prev_index = prev(prev_index, point_data_count, closed);
        next_index = next(point_index, point_data_count, closed);
        while (next_index != UINT32_MAX &&
               next_index != point_index &&
               memcmp(&points[next_index], &points[next_index], sizeof(float2_t)) == 0)
            next_index = next(next_index, point_data_count, closed);

        if (point_index == prev_index || point_index == next_index) continue;
        if (prev_index == UINT32_MAX && next_index == UINT32_MAX) continue;

        prev_point = prev_index == UINT32_MAX ? (float2_t){ .x = 0, .y = 0} : points[prev_index];
        point = points[point_index];
        next_point = next_index == UINT32_MAX ? (float2_t){ .x = 0, .y = 0} : points[next_index];

        const f32 width = __polyline.widths != NULL ? __polyline.widths[i] : line_width;
        const f32 w = width > feather ? (width - feather) / 2.0f : 0.0f;
        const f32 a = width > feather ? feather : width;

        if (prev_index == UINT32_MAX) {
            float2_t v = float2_normalize(float2_sub(next_point, point));
            float2_t left = {.x = v.y, .y = -v.x};

            vertex.triangle_vertex.point = float2_add(float2_mul(left, w + a), point);
            vertex.triangle_vertex.alpha = 0.f;
            u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

            vertex.triangle_vertex.point = float2_add(float2_mul(left, w), point);
            vertex.triangle_vertex.alpha = alpha;
            ui_primitive_layer_write_vertex(layer, vertex);

            vertex.triangle_vertex.point = float2_add(float2_mul(left, -w), point);
            vertex.triangle_vertex.alpha = alpha;
            ui_primitive_layer_write_vertex(layer, vertex);

            vertex.triangle_vertex.point = float2_add(float2_mul(left, -w - a), point);
            vertex.triangle_vertex.alpha = 0.f;

            last_edge = (struct edge_t){ offset, offset + stride, offset + stride * 2, offset + stride * 3 };

            vertex_count += 4;
        }
        // line end
        else if (next_index == UINT32_MAX) {
            float2_t v = float2_normalize(float2_sub(point, prev_point));
            float2_t left = {.x = v.y, .y = -v.x};

            vertex.triangle_vertex.point = float2_add(float2_mul(left, w + a), point);
            vertex.triangle_vertex.alpha = 0.f;
            u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

            vertex.triangle_vertex.point = float2_add(float2_mul(left, w), point);
            vertex.triangle_vertex.alpha = alpha;
            ui_primitive_layer_write_vertex(layer, vertex);

            vertex.triangle_vertex.point = float2_add(float2_mul(left, -w), point);
            vertex.triangle_vertex.alpha = alpha;
            ui_primitive_layer_write_vertex(layer, vertex);

            vertex.triangle_vertex.point = float2_add(float2_mul(left, -w - a), point);
            vertex.triangle_vertex.alpha = 0.f;
            ui_primitive_layer_write_vertex(layer, vertex);

            struct edge_t edge = (struct edge_t){ offset, offset + stride, offset + stride * 2, offset + stride * 3 };

            if (point_index != UINT32_MAX) {
                const u32 v[8] = { last_edge.e[0], last_edge.e[1], last_edge.e[2], edge.e[0], edge.e[1], edge.e[2], edge.e[3], last_edge.e[3] };
                const u32 tri[18] = { 0U, 4, 5, 0U, 5, 1, 1U, 5, 6, 1U, 6, 2, 2U, 6, 7, 2U, 7, 3 };
                for (u32 j = 0; j < 18; ++j) {
                    ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                }
                index_count += 18;
            }

            vertex_count += 4;

            memcpy(&last_edge, &edge, sizeof(struct edge_t));
        } else {
            const float2_t dir_prev = float2_normalize(float2_sub(point, prev_point));
            const float2_t dir_next = float2_normalize(float2_sub(next_point, point));
            const float2_t left_prev = { dir_prev.y, -dir_prev.x };
            const float2_t left_next = { dir_next.y, -dir_next.x };

            const f32 curve = float2_dot(dir_next, left_prev);

            // straight
            if (curve == 0.f) { 
                const float2_t left = left_prev;

                vertex.triangle_vertex.point = float2_add(float2_mul(left, w + a), point);
                vertex.triangle_vertex.alpha = 0.f;
                u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = float2_add(float2_mul(left, w), point);
                vertex.triangle_vertex.alpha = alpha;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = float2_add(float2_mul(left, -w), point);
                vertex.triangle_vertex.alpha = alpha;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = float2_add(float2_mul(left, -w - a), point);
                vertex.triangle_vertex.alpha = 0.f;
                ui_primitive_layer_write_vertex(layer, vertex);

                struct edge_t edge = { offset, offset + stride, offset + stride * 2, offset * stride * 3 };
                if (i) {
                    const u32 v[8] = { last_edge.e[0], last_edge.e[1], last_edge.e[2], last_edge.e[3], edge.e[0], edge.e[1], edge.e[2], edge.e[3] };
                    const u32 tri[18] = {  0U, 4, 5, 0U, 5, 1, 1U, 5, 6, 1U, 6, 2, 2U, 6, 7, 2U, 7, 3 };
                    for (u32 j = 0; j < 18; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                    }
                    index_count += 18;
                }

                vertex_count += 4;

                memcpy(&last_edge, &edge, sizeof(edge));
            }
            // curving left
            else if (curve > 0.f) {
                const f32 s_l = float2_dot(dir_prev, left_next);
                const f32 t_a = MACRO_CLAMP((float2_dot(float2_sub(next_point, prev_point), left_next) + (1 - float2_dot(left_prev, left_next)) * (w + a)) / s_l, 0, 1);
                const float2_t left_a = float2_mul_add(float2_mul_add(prev_point, left_prev, w + a), dir_prev, t_a);

                const f32 t_w = MACRO_CLAMP((float2_dot(float2_sub(next_point, prev_point), left_next) + (1 - float2_dot(left_prev, left_next)) * (w)) / s_l, 0, 1);
                const float2_t left_w = float2_mul_add(float2_mul_add(prev_point, left_prev, w), dir_prev, t_w);

                const float2_t right_w_0 = float2_mul_add(point, left_prev, -w);
                const float2_t right_w_1 = float2_mul_add(point, left_next, -w);
                const float2_t right_a_0 = float2_mul_add(point, left_prev, -w - a);
                const float2_t right_a_1 = float2_mul_add(point, left_next, -w - a);

                vertex.triangle_vertex.point = left_a;
                vertex.triangle_vertex.alpha = 0.f;
                u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = left_w;
                vertex.triangle_vertex.alpha = alpha;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_w_0;
                vertex.triangle_vertex.alpha = alpha;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_a_0;
                vertex.triangle_vertex.alpha = 0.f;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_w_1;
                vertex.triangle_vertex.alpha = alpha;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_a_1;
                vertex.triangle_vertex.alpha = 0.f;
                ui_primitive_layer_write_vertex(layer, vertex);

                struct edge_t first_edge = { offset, offset + stride, offset + stride * 2, offset + stride * 3 };
                struct edge_t second_edge = { offset, offset + stride, offset + stride * 4, offset + stride * 5 };
                
                if (i) {
                    const u32 v[8] = { last_edge.e[0], last_edge.e[1], last_edge.e[2], last_edge.e[3], first_edge.e[0], first_edge.e[1], first_edge.e[2], first_edge.e[3] };
                    const u32 tri[18] = { 0U, 4, 5, 0U, 5, 1, 1U, 5, 6, 1U, 6, 2, 2U, 6, 7, 2U, 7, 3 };
                    for (u32 j = 0; j < 18; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                    }

                    const u32 wedge[9] = { first_edge.e[2], second_edge.e[2], first_edge.e[1], first_edge.e[3], second_edge.e[2], first_edge.e[2], first_edge.e[3], second_edge.e[3], second_edge.e[2] };
                    for (u32 j = 0; j < 9; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[wedge[j]]));
                    }

                    index_count += 27;
                }   

                vertex_count += 6;

                memcpy(&last_edge, &second_edge, sizeof(second_edge));      
            }
            // curving right
            else {
                const float2_t right_prev = { -left_prev.x, -left_prev.y };
                const float2_t right_next = { -left_next.x, -left_next.y };

                const f32 s_l = float2_dot(dir_prev, right_next);
                const f32 t_a = MACRO_CLAMP((float2_dot(float2_sub(next_point, prev_point), right_next) + (1 - float2_dot(right_prev, right_next)) * (w + a)) / s_l, 0, 1);
                const float2_t right_a = float2_mul_add(float2_mul_add(prev_point, right_prev, w + a), dir_prev, t_a);

                const f32 t_w = MACRO_CLAMP((float2_dot(float2_sub(next_point, prev_point), right_next) + (1 - float2_dot(right_prev, right_next)) * (w)) / s_l, 0, 1);
                const float2_t right_w = float2_mul_add(float2_mul_add(prev_point, right_prev, w), dir_prev, t_w);

                const float2_t left_w_0 = float2_mul_add(point, left_prev, w);
                const float2_t left_w_1 = float2_mul_add(point, left_next, w);
                const float2_t left_a_0 = float2_mul_add(point, left_prev, w + a);
                const float2_t left_a_1 = float2_mul_add(point, left_next, w + a);


                vertex.triangle_vertex.point = left_a_0;
                vertex.triangle_vertex.alpha = 0.f;
                u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = left_w_0;
                vertex.triangle_vertex.alpha = alpha;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = left_a_1;
                vertex.triangle_vertex.alpha = 0.f;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = left_w_1;
                vertex.triangle_vertex.alpha = alpha;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_w;
                vertex.triangle_vertex.alpha = alpha;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_a;
                vertex.triangle_vertex.alpha = 0.f;
                ui_primitive_layer_write_vertex(layer, vertex);

                struct edge_t first_edge = { offset, offset + stride, offset + stride * 2, offset + stride * 3 };
                struct edge_t second_edge = { offset, offset + stride, offset + stride * 4, offset + stride * 5 };

                if (i) {
                    const u32 v[8] = { last_edge.e[0], last_edge.e[1], last_edge.e[2], last_edge.e[3], first_edge.e[0], first_edge.e[1], first_edge.e[2], first_edge.e[3] };
                    const u32 tri[18] = { 0U, 4, 5, 0U, 5, 1, 1U, 5, 6, 1U, 6, 2, 2U, 6, 7, 2U, 7, 3 };
                    for (u32 j = 0; j < 18; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                    }

                    const u32 wedge[9] = { first_edge.e[1], first_edge.e[2], second_edge.e[1], first_edge.e[0], first_edge.e[1], second_edge.e[1], first_edge.e[0], second_edge.e[1], second_edge.e[0] };
                    for (u32 j = 0; j < 9; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[wedge[j]]));
                    }

                    index_count += 27;
                }

                vertex_count += 6;

                memcpy(&last_edge, &second_edge, sizeof(second_edge));
            }
        }
    }

    return (ui_count_t){ vertex_count, index_count };
}

static ui_count_t stroke_polyline_no_feather_internal(enum ui_primitive_type type, ui_primitive_layer_t *layer) {
    u32 prev_index = UINT32_MAX;
    u32 next_index = UINT32_MAX;
    float2_t prev_point, next_point, point;

    const bool closed = __polyline.closed;
    const u32 point_data_count = __polyline.point_count;
    const u32 point_count = point_data_count + (closed ? 1 : 0);
    const u32 stride = 1;
    const float2_t *points = __polyline.points;
    const f32 width = __polyline.width;
    const f32 alpha = u8_to_color_float(__polyline.color.a);

    ui_vertex_t vertex = { 0 };
    vertex.triangle_vertex.color = __polyline.color;
    vertex.triangle_vertex.clip = __polyline.clip;
    vertex.triangle_vertex.dash_offset = __polyline.dash_offset;
    vertex.triangle_vertex.alpha = alpha;

    u32 vertex_count = 0;
    u32 index_count = 0;

    struct edge_t
    {
        uint32_t e[2];
    };
    struct edge_t last_edge = { 0 };

    for (u32 i = 0; i < point_count; ++i) {
        const u32 point_index = i % point_data_count;
        prev_index = prev(point_index, point_data_count, closed);
        while (prev_index != UINT32_MAX &&
               prev_index != point_index &&
               memcmp(&points[prev_index], &points[point_index], sizeof(float2_t)) == 0)
            prev_index = prev(prev_index, point_data_count, closed);
        next_index = next(point_index, point_data_count, closed);
        while (next_index != UINT32_MAX &&
               next_index != point_index &&
               memcmp(&points[next_index], &points[next_index], sizeof(float2_t)) == 0)
            next_index = next(next_index, point_data_count, closed);

        if (point_index == prev_index || point_index == next_index) continue;
        if (prev_index == UINT32_MAX && next_index == UINT32_MAX) continue;

        prev_point = prev_index == UINT32_MAX ? (float2_t){ .x = 0, .y = 0} : points[prev_index];
        point = points[point_index];
        next_point = next_index == UINT32_MAX ? (float2_t){ .x = 0, .y = 0} : points[next_index];

        const f32 width = __polyline.widths != NULL ? __polyline.widths[i] : __polyline.width;
        const f32 w = width / 2.0f;

        if (prev_index == UINT32_MAX) {
            float2_t v = float2_normalize(float2_sub(next_point, point));
            float2_t left = {.x = v.y, .y = -v.x};

            vertex.triangle_vertex.point = float2_add(float2_mul(left, w), point);
            u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

            vertex.triangle_vertex.point = float2_add(float2_mul(left, -w), point);
            ui_primitive_layer_write_vertex(layer, vertex);

            last_edge = (struct edge_t){ offset, offset + stride };

            vertex_count += 2;
        }
        // line end
        else if (next_index == UINT32_MAX) {
            float2_t v = float2_normalize(float2_sub(point, prev_point));
            float2_t left = {.x = v.y, .y = -v.x};

            vertex.triangle_vertex.point = float2_add(float2_mul(left, w), point);
            u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

            vertex.triangle_vertex.point = float2_add(float2_mul(left, -w), point);
            ui_primitive_layer_write_vertex(layer, vertex);

            struct edge_t edge = (struct edge_t){ offset, offset + stride };

            if (point_index != UINT32_MAX) {
                const u32 v[4] = { last_edge.e[0], last_edge.e[1], edge.e[0], edge.e[1] };
                const u32 tri[6] = { 0, 2, 3, 0, 3, 1 };
                for (u32 j = 0; j < 6; ++j) {
                    ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                }
                index_count += 6;
            }

            vertex_count += 2;

            memcpy(&last_edge, &edge, sizeof(struct edge_t));
        } else {
            const float2_t dir_prev = float2_normalize(float2_sub(point, prev_point));
            const float2_t dir_next = float2_normalize(float2_sub(next_point, point));
            const float2_t left_prev = { dir_prev.y, -dir_prev.x };
            const float2_t left_next = { dir_next.y, -dir_next.x };

            const f32 curve = float2_dot(dir_next, left_prev);

            // straight
            if (curve == 0.f) { 
                const float2_t left = left_prev;

                vertex.triangle_vertex.point = float2_add(float2_mul(left, w), point);
                u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = float2_add(float2_mul(left, -w), point);
                ui_primitive_layer_write_vertex(layer, vertex);

                struct edge_t edge = { offset, offset + stride };
                if (i) {
                    const u32 v[8] = { last_edge.e[0], last_edge.e[1], edge.e[0], edge.e[1] };
                    const u32 tri[18] = {   0, 2, 3, 0, 3, 1 };
                    for (u32 j = 0; j < 18; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                    }
                    index_count += 6;
                }

                vertex_count += 2;

                memcpy(&last_edge, &edge, sizeof(edge));
            }
            // curving left
            else if (curve > 0.f) {
                const f32 s_l = float2_dot(dir_prev, left_next);
                const f32 t_w = MACRO_CLAMP((float2_dot(float2_sub(next_point, prev_point), left_next) + (1 - float2_dot(left_prev, left_next)) * (w)) / s_l, 0, 1);
                const float2_t left_w = float2_mul_add(float2_mul_add(prev_point, left_prev, w), dir_prev, t_w);

                const float2_t right_w_0 = float2_mul_add(point, left_prev, -w);
                const float2_t right_w_1 = float2_mul_add(point, left_next, -w);

                vertex.triangle_vertex.point = left_w;
                u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_w_0;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_w_1;
                ui_primitive_layer_write_vertex(layer, vertex);

                struct edge_t first_edge = { offset, offset + stride };
                struct edge_t second_edge = { offset, offset + stride * 2 };
                
                if (i) {
                    const u32 v[4] = { last_edge.e[0], last_edge.e[1], first_edge.e[0], first_edge.e[1] };
                    const u32 tri[6] = { 0, 2, 3, 0, 3, 1 };
                    for (u32 j = 0; j < 6; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                    }

                    const u32 wedge[3] = { first_edge.e[0], second_edge.e[1], first_edge.e[1] };
                    for (u32 j = 0; j < 3; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[wedge[j]]));
                    }

                    index_count += 9;
                }   

                vertex_count += 3;

                memcpy(&last_edge, &second_edge, sizeof(second_edge));      
            }
            // curving right
            else {
                const float2_t right_prev = { -left_prev.x, -left_prev.y };
                const float2_t right_next = { -left_next.x, -left_next.y };

                const f32 s_l = float2_dot(dir_prev, right_next);
                const f32 t_w = MACRO_CLAMP((float2_dot(float2_sub(next_point, prev_point), right_next) + (1 - float2_dot(right_prev, right_next)) * (2)) / s_l, 0, 1);
                const float2_t right_w = float2_mul_add(float2_mul_add(prev_point, right_prev, w), dir_prev, t_w);

                const float2_t left_w_0 = float2_mul_add(point, left_prev, w);
                const float2_t left_w_1 = float2_mul_add(point, left_next, w);

                vertex.triangle_vertex.point = left_w_0;
                u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = left_w_1;
                ui_primitive_layer_write_vertex(layer, vertex);

                vertex.triangle_vertex.point = right_w;
                ui_primitive_layer_write_vertex(layer, vertex);

                struct edge_t first_edge = { offset, offset + stride * 2 };
                struct edge_t second_edge = { offset + stride, offset + stride * 2 };

                if (i) {
                    const u32 v[4] = { last_edge.e[0], last_edge.e[1], first_edge.e[0], first_edge.e[1] };
                    const u32 tri[6] = { 0, 2, 3, 0, 3, 1 };
                    for (u32 j = 0; j < 6; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                    }

                    const u32 wedge[3] = { first_edge.e[0], second_edge.e[0], first_edge.e[1] };
                    for (u32 j = 0; j < 3; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[wedge[j]]));
                    }

                    index_count += 9;
                }

                vertex_count += 3;

                memcpy(&last_edge, &second_edge, sizeof(second_edge));
            }
        }
    }

    return (ui_count_t){ vertex_count, index_count };
}

static u32 fill_polyline(void) {
    return 0;
}
