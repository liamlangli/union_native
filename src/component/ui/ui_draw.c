#include "component/ui/ui_draw.h"

#include <stdint.h>
#include <string.h>

enum ui_clip_result {
    CLIP_RESULT_DISCARD = 0,
    CLIP_RESULT_KEEP,
    CLIP_RESULT_CLIP,
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

    u32 type;

    u32 point_count;
    float2_t *points;
    f32 *widths;
} polyline_t;

static inline rect_t intersect_rect(rect_t r1, rect_t r2)
{
    float l = r1.x > r2.x ? r1.x : r2.x;
    float r = r1.x + r1.w < r2.x + r2.w ? r1.x + r1.w : r2.x + r2.w;
    float t = r1.y > r2.y ? r1.y : r2.y;
    float b = r1.y + r1.h < r2.y + r2.h ? r1.y + r1.h : r2.y + r2.h;
    if (l >= r || t >= b)
        return (rect_t){ 0 };
    return (rect_t){ .x = l, .y = t, .w = r - l, .h = b - t };
}

static u32 add_clip_rect(ui_primitive_layer_t *layer, rect_t clip) {
    ui_vertex_t vertex = { 0 };
    vertex.rect_vertex.rect = clip;
    return ui_primitive_layer_write_vertex(layer, vertex);
}

static u32 add_sub_clip_rect(ui_primitive_layer_t *layer, u32 parent, rect_t clip) {
    if (!parent)
        return add_clip_rect(layer, clip);
    rect_t parent_rect = layer->vertex_data[parent].rect_vertex.rect;
    return add_clip_rect(layer, intersect_rect(parent_rect, clip));
}

static rect_t clip_rect(ui_primitive_layer_t *layer, u32 clip) {
    if (!clip) return (rect_t){ 0 };
    return layer->vertex_data[clip].rect_vertex.rect;
}

static ui_count_t fill_convex_polyline_internal(ui_primitive_layer_t *layer, const polyline_t *pl) {
    const u32 type = pl->type;
    const u32 stride = 1;
    const f32 a = pl->feather * 0.5f;
    const f32 alpha = u8_to_color_float(pl->color.a);
    const u32 type = pl->type;

    u32 origin_offset = layer->vertex_offset;

    u32 vertex_count = 0;
    u32 index_count = 0;

    ui_vertex_t vertex = { 0 };

    const u32 point_count = pl->point_count;
    for (u32 i = 0; i < point_count; ++i) {
        const u32 prev_index = (i + point_count - 1) % point_count;
        const u32 next_index = (i + 1) % point_count;
        const float2_t prev_point = pl->points[prev_index];
        const float2_t next_point = pl->points[next_index];
        const float2_t point = pl->points[i];
        const float2_t da = float2_normalize_safe(float2_sub(point, prev_point));
        const float2_t db = float2_normalize_safe(float2_sub(point, next_point));
        const float2_t na = { .x = -da.y, .y = da.x };
        const float2_t nb = { .x = db.y, .y = -db.x };
        const f32 dadb = float2_dot(da, db);
        const f32 x = (float2_dot(nb, da) + float2_dot(na, db) * dadb) / (1.f - dadb *dadb);
        float2_t n = {.x = na.x + x * da.x, .y = na.y + x * da.y};
        const f32 n_len = sqrtf(n.x * n.x + n.y * n.y);
        const f32 miter_limit = 5.0f;
        if (n_len > miter_limit)
            n.x *= miter_limit / n_len, n.y *= miter_limit / n_len;

        vertex_count += 2;
        vertex.triangle_vertex.point = float2_mul_add(point, n, a);
        vertex.triangle_vertex.alpha = 0.f;
        u32 offset = ui_primitive_layer_write_vertex(layer, vertex);

        vertex.triangle_vertex.point = float2_mul_add(point, n, -a);
        vertex.triangle_vertex.alpha = alpha;
        ui_primitive_layer_write_vertex(layer, vertex);

        index_count += 6;

        u32 left = origin_offset + i * stride * 2;
        u32 right = origin_offset + ((i + 1) % point_count) * stride * 2;

        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, left));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, right));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, left + stride));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, left + stride));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, right));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, right + stride));

        if (left != origin_offset && right != origin_offset) {
            ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, origin_offset + stride));
            ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, left + stride));
            ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, right + stride));
        }
    }
    return (struct ui_count_t){ vertex_count, index_count};
}

static ui_count_t fill_convex_polyline_no_feather_internal(ui_primitive_layer_t *layer, const polyline_t *pl) {
    const u32 type = pl->type;
    const u32 stride = 1;
    const f32 alpha = u8_to_color_float(pl->color.a);

    u32 origin_offset = layer->vertex_offset;

    u32 vertex_count = 0;
    u32 index_count = 0;

    ui_vertex_t vertex = { 0 };
    vertex.triangle_vertex.alpha = alpha;

    const u32 point_count = pl->point_count;
    for (u32 i = 0; i < point_count; ++i) {
        vertex.triangle_vertex.point = pl->points[i];
        u32 offset = ui_primitive_layer_write_vertex(layer, vertex);
        vertex_count += 1;

        u32 left = origin_offset + i * stride;
        u32 right = origin_offset + ((i + 1) % point_count) * stride;
        if (left != origin_offset && right != origin_offset) {
            ui_primitive_layer_write_index(layer, origin_offset);
            ui_primitive_layer_write_index(layer, left);
            ui_primitive_layer_write_index(layer, right);
        }
    }
}

// struct
static ui_count_t stroke_polyline_internal(ui_primitive_layer_t *layer, const polyline_t *pl) {
    u32 prev_index = UINT32_MAX;
    u32 next_index = UINT32_MAX;
    float2_t prev_point, next_point, point;

    const bool closed = pl->closed;
    const u32 point_data_count = pl->point_count;
    const u32 point_count = point_data_count + (closed ? 1 : 0);
    const u32 stride = 1;
    const float2_t *points = pl->points;
    const f32 line_width = pl->width;
    const f32 feather = pl->feather;
    const f32 alpha =  u8_to_color_float(pl->color.a);
    const u32 type = pl->type;

    ui_vertex_t vertex = { 0 };
    vertex.triangle_vertex.color = pl->color;
    vertex.triangle_vertex.clip = pl->clip;
    vertex.triangle_vertex.dash_offset = pl->dash_offset;

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

        const f32 width = pl->widths != NULL ? pl->widths[i] : line_width;
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

static ui_count_t stroke_polyline_no_feather_internal(ui_primitive_layer_t *layer, const polyline_t *pl) {
    u32 prev_index = UINT32_MAX;
    u32 next_index = UINT32_MAX;
    float2_t prev_point, next_point, point;

    const bool closed = pl->closed;
    const u32 point_data_count = pl->point_count;
    const u32 point_count = point_data_count + (closed ? 1 : 0);
    const u32 stride = 1;
    const float2_t *points = pl->points;
    const f32 width = pl->width;
    const f32 alpha = u8_to_color_float(pl->color.a);
    const u32 type = pl->type;

    ui_vertex_t vertex = { 0 };
    vertex.triangle_vertex.color = pl->color;
    vertex.triangle_vertex.clip = pl->clip;
    vertex.triangle_vertex.dash_offset = pl->dash_offset;
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

        const f32 width = pl->widths != NULL ? pl->widths[i] : pl->width;
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
