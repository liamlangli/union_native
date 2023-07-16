#include "component/ui/ui_draw.h"

#include "foundation/types.h"

#include <stdint.h>
#include <string.h>

enum ui_clip_result {
    CLIP_RESULT_DISCARD = 0,
    CLIP_RESULT_KEEP,
    CLIP_RESULT_CLIP,
};

static inline enum ui_clip_result clip_rect_test(rect_t rect, rect_t clip) {
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
    u32 stride;

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
    if (clip.w <= 0 || clip.h <= 0)
        return 0;
    rect_t *rect = ui_primitive_layer_alloc_rect(layer, 4);
    *rect = clip;
    return layer->vertex_offset;
}

static u32 add_sub_clip_rect(ui_primitive_layer_t *layer, u32 parent, rect_t clip) {
    if (!parent)
        return add_clip_rect(layer, clip);
    rect_t *parent_rect = (rect_t *)&layer->vertex_data[parent];
    return add_clip_rect(layer, intersect_rect(*parent_rect, clip));
}

static rect_t ui_clip_rect(ui_primitive_layer_t *layer, u32 clip) {
    if (!clip) return (rect_t){ 0 };
    return *(rect_t *)&layer->vertex_data[clip];
}

static ui_count_t internal_fill_convex_polyline(ui_primitive_layer_t *layer, const polyline_t *pl) {
    const u32 type = pl->type;
    const u32 stride = 4;
    const color_srgb_t solid = pl->color;
    const color_srgb_t transparent = (color_srgb_t){ .r = solid.r, .g = solid.g, .b = solid.b, .a = 0 };
    const f32 a = pl->feather * 0.5f;
    const u32 type = pl->type;

    u32 origin_offset = layer->vertex_offset;

    u32 total_offset = 0;
    u32 index_count = 0;

    ui_vertex_triangle_t *vertex = (ui_vertex_triangle_t *)&layer->vertex_data[layer->vertex_offset];

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

        vertex->point = float2_mul_add(point, n, a);
        vertex->color = transparent;
        vertex = (ui_vertex_triangle_t *)((u32 *)vertex + stride);

        vertex->point = float2_mul_add(point, n, -a);
        vertex->color = solid;
        vertex = (ui_vertex_triangle_t *)((u32 *)vertex + stride);

        total_offset += 2 * stride;

        u32 left = origin_offset + i * stride * 2;
        u32 right = origin_offset + ((i + 1) % point_count) * stride * 2;

        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, left));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, right));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, left + stride));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, left + stride));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, right));
        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, right + stride));

        index_count += 6;

        if (left != origin_offset && right != origin_offset) {
            ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, origin_offset + stride));
            ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, left + stride));
            ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, right + stride));

            index_count += 3;
        }
    }
    return (struct ui_count_t){ total_offset, index_count};
}

static ui_count_t internal_fill_convex_polyline_no_feather(ui_primitive_layer_t *layer, const polyline_t *pl) {
    const u32 type = pl->type;
    const u32 stride = 8;
    const color_srgb_t solid = pl->color;
    const u32 clip = pl->clip;

    u32 offset = layer->vertex_offset;
    u32 start_offset = offset;
    u32 index_count = 0;

    ui_vertex_triangle_t *vertex = (ui_vertex_triangle_t *)(u32 *)&layer->vertex_data[layer->vertex_offset];

    const u32 point_count = pl->point_count;
    for (u32 i = 0; i < point_count; ++i) {

        vertex->point = pl->points[i];
        vertex->color = solid;
        vertex->clip = clip;
        vertex++;

        u32 left = start_offset + i * stride;
        u32 right = start_offset + ((i + 1) % point_count) * stride;
        if (left != start_offset && right != start_offset) {
            ui_primitive_layer_write_index(layer, start_offset);
            ui_primitive_layer_write_index(layer, left);
            ui_primitive_layer_write_index(layer, right);
            index_count += 3;
        }

        offset += stride;
    }

    return (ui_count_t){ .total_offset = start_offset - offset, index_count };
}

// struct
static ui_count_t internal_stroke_polyline(ui_primitive_layer_t *layer, const polyline_t *pl) {
    u32 prev_index = UINT32_MAX;
    u32 next_index = UINT32_MAX;
    float2_t prev_point, next_point, point;

    const bool closed = pl->closed;
    const u32 point_data_count = pl->point_count;
    const u32 point_count = point_data_count + (closed ? 1 : 0);
    const u32 stride = 4;
    const float2_t *points = pl->points;
    const f32 line_width = pl->width;
    const f32 feather = pl->feather;
    const color_srgb_t solid = pl->color;
    const color_srgb_t transparent = { .r = solid.r, .g = solid.g, .b = solid.b, .a = 0 };
    const u32 type = pl->type;
    const u32 clip = pl->clip;

    ui_vertex_triangle_t *vertex = (ui_vertex_triangle_t *)&layer->vertex_data[layer->vertex_offset];
    vertex->color = pl->color;

    u32 offset = layer->vertex_offset;
    u32 start_offset = offset;
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

            vertex->point = float2_add(float2_mul(left, w + a), point);
            vertex->color = transparent;
            vertex->clip = clip;
            vertex++;

            vertex->point = float2_add(float2_mul(left, w), point);
            vertex->color = solid;
            vertex->clip = clip;
            vertex++;

            vertex->point = float2_add(float2_mul(left, -w), point);
            vertex->color = solid;
            vertex->clip = clip;
            vertex++;

            vertex->point = float2_add(float2_mul(left, -w - a), point);
            vertex->color = transparent;
            vertex++;

            last_edge = (struct edge_t){ offset, offset + stride, offset + stride * 2, offset + stride * 3 };

            offset += stride * 4;
        }
        // line end
        else if (next_index == UINT32_MAX) {
            float2_t v = float2_normalize(float2_sub(point, prev_point));
            float2_t left = {.x = v.y, .y = -v.x};

            vertex->point = float2_add(float2_mul(left, w + a), point);
            vertex->color = transparent;
            vertex->clip = clip;
            vertex++;

            vertex->point = float2_add(float2_mul(left, w), point);
            vertex->color = solid;
            vertex->clip = clip;
            vertex++;

            vertex->point = float2_add(float2_mul(left, -w), point);
            vertex->color = solid;
            vertex->clip = clip;
            vertex++;

            vertex->point = float2_add(float2_mul(left, -w - a), point);
            vertex->color = transparent;
            vertex->clip = clip;
            vertex++;

            struct edge_t edge = (struct edge_t){ offset, offset + stride, offset + stride * 2, offset + stride * 3 };
            
            if (point_index != UINT32_MAX) {
                const u32 v[8] = { last_edge.e[0], last_edge.e[1], last_edge.e[2], edge.e[0], edge.e[1], edge.e[2], edge.e[3], last_edge.e[3] };
                const u32 tri[18] = { 0U, 4, 5, 0U, 5, 1, 1U, 5, 6, 1U, 6, 2, 2U, 6, 7, 2U, 7, 3 };
                for (u32 j = 0; j < 18; ++j) {
                    ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                }
                index_count += 18;
            }

            offset += stride * 4;

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

                vertex->point = float2_add(float2_mul(left, w + a), point);
                vertex->color = transparent;
                vertex->clip = clip;
                vertex++;

                vertex->point = float2_add(float2_mul(left, w), point);
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = float2_add(float2_mul(left, -w), point);
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = float2_add(float2_mul(left, -w - a), point);
                vertex->color = transparent;
                vertex->clip = clip;
                vertex++;

                struct edge_t edge = { offset, offset + stride, offset + stride * 2, offset * stride * 3 };
                if (i) {
                    const u32 v[8] = { last_edge.e[0], last_edge.e[1], last_edge.e[2], last_edge.e[3], edge.e[0], edge.e[1], edge.e[2], edge.e[3] };
                    const u32 tri[18] = {  0U, 4, 5, 0U, 5, 1, 1U, 5, 6, 1U, 6, 2, 2U, 6, 7, 2U, 7, 3 };
                    for (u32 j = 0; j < 18; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                    }
                    index_count += 18;
                }

                offset += stride * 4;

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

                vertex->point = left_a;
                vertex->color = transparent;
                vertex->clip = clip;
                vertex++;

                vertex->point = left_w;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_w_0;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_a_0;
                vertex->color = transparent;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_w_1;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_a_1;
                vertex->color = transparent;
                vertex->clip = clip;
                vertex++;


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

                offset += stride * 6;

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

                vertex->point = left_a_0;
                vertex->color = transparent;
                vertex->clip = clip;
                vertex++;

                vertex->point = left_w_0;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = left_a_1;
                vertex->color = transparent;
                vertex->clip = clip;
                vertex++;

                vertex->point = left_w_1;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_w;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_a;
                vertex->color = transparent;
                vertex->clip = clip;
                vertex++;

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

                offset += stride * 6;

                memcpy(&last_edge, &second_edge, sizeof(second_edge));
            }
        }
    }

    return (ui_count_t){ .total_offset = offset - start_offset, index_count };
}

static ui_count_t internal_stroke_polyline_no_feather(ui_primitive_layer_t *layer, const polyline_t *pl) {
    u32 prev_index = UINT32_MAX;
    u32 next_index = UINT32_MAX;
    float2_t prev_point, next_point, point;

    const bool closed = pl->closed;
    const u32 point_data_count = pl->point_count;
    const u32 point_count = point_data_count + (closed ? 1 : 0);
    const u32 stride = pl->dashed ? 8 : 4;
    const float2_t *points = pl->points;
    const f32 width = pl->width;
    const u32 type = pl->type;
    const u32 clip = pl->clip;
    const color_srgb_t solid = pl->color;

    ui_vertex_triangle_t *vertex = (ui_vertex_triangle_t *)(u32*)&layer->vertex_data[layer->vertex_offset];

    u32 offset = layer->vertex_offset;
    u32 start_offset = offset;
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

            vertex->point = float2_add(float2_mul(left, w), point);
            vertex->color = solid;
            vertex->clip = clip;
            vertex++;

            vertex->point = float2_add(float2_mul(left, -w), point);
            vertex->color = solid;
            vertex->clip = clip;
            vertex++;

            last_edge = (struct edge_t){ offset, offset + stride };

            offset += stride * 2;
        }
        // line end
        else if (next_index == UINT32_MAX) {
            float2_t v = float2_normalize(float2_sub(point, prev_point));
            float2_t left = {.x = v.y, .y = -v.x};

            vertex->point = float2_add(float2_mul(left, w), point);
            vertex->color = solid;
            vertex->clip = clip;
            vertex++;

            vertex->point = float2_add(float2_mul(left, -w), point);
            vertex->color = solid;
            vertex->clip = clip;
            vertex++;

            struct edge_t edge = (struct edge_t){ offset, offset + stride };

            if (point_index != UINT32_MAX) {
                const u32 v[4] = { last_edge.e[0], last_edge.e[1], edge.e[0], edge.e[1] };
                const u32 tri[6] = { 0, 2, 3, 0, 3, 1 };
                for (u32 j = 0; j < 6; ++j) {
                    ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                }
                index_count += 6;
            }

            offset += stride * 2;

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

                vertex->point = float2_add(float2_mul(left, w), point);
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = float2_add(float2_mul(left, -w), point);
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                struct edge_t edge = { offset, offset + stride };
                if (i) {
                    const u32 v[8] = { last_edge.e[0], last_edge.e[1], edge.e[0], edge.e[1] };
                    const u32 tri[18] = {   0, 2, 3, 0, 3, 1 };
                    for (u32 j = 0; j < 18; ++j) {
                        ui_primitive_layer_write_index(layer, ui_encode_vertex_id(type, 0, v[tri[j]]));
                    }
                    index_count += 6;
                }

                offset += stride * 2;

                memcpy(&last_edge, &edge, sizeof(edge));
            }
            // curving left
            else if (curve > 0.f) {
                const f32 s_l = float2_dot(dir_prev, left_next);
                const f32 t_w = MACRO_CLAMP((float2_dot(float2_sub(next_point, prev_point), left_next) + (1 - float2_dot(left_prev, left_next)) * (w)) / s_l, 0, 1);
                const float2_t left_w = float2_mul_add(float2_mul_add(prev_point, left_prev, w), dir_prev, t_w);

                const float2_t right_w_0 = float2_mul_add(point, left_prev, -w);
                const float2_t right_w_1 = float2_mul_add(point, left_next, -w);

                vertex->point = left_w;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_w_0;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_w_1;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

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

                offset += stride * 3;

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

                vertex->point = left_w_0;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = left_w_1;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

                vertex->point = right_w;
                vertex->color = solid;
                vertex->clip = clip;
                vertex++;

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

                offset += stride * 3;

                memcpy(&last_edge, &second_edge, sizeof(second_edge));
            }
        }
    }

    return (ui_count_t){ .total_offset = offset - start_offset, index_count };
}

static u32 fill_convex_polyline(ui_primitive_layer_t *layer, const ui_style_t *style, const float2_t *points, u32 point_count, u32 clip) {
    if (clip) {
        bounds2_t bounds = bounds2_points(points, point_count);
        const rect_t clip_rect = { .x = bounds.min.x, .y = bounds.min.y, .w = bounds.max.x - bounds.min.x, .h = bounds.max.y - bounds.min.y };
        const rect_t rect = ui_clip_rect(layer, clip);
        enum ui_clip_result result = clip_rect_test(clip_rect, rect);
        if (result == CLIP_RESULT_DISCARD)
            return;
        if (result == CLIP_RESULT_KEEP)
            clip = 0;
    }

    const polyline_t pl = {
        .clip = clip,
        .points = points,
        .point_count = point_count,
        .color = style->color,
        .feather = style->feather,
        .stride = (u32)sizeof(ui_vertex_triangle_t),
        .type = UI_PRIMITIVE_TYPE_TRIANGLE,
    };

    const bool feather = pl.feather > 0.f;
    const struct ui_count_t count = feather ? internal_fill_convex_polyline(layer, &pl) : internal_fill_convex_polyline_no_feather(layer, &pl);

}
