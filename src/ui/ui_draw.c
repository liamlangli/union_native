#include "ui/ui_draw.h"
#include "ui/ui_renderer.h"
#include <math.h>

enum DRAW_CORNER {
    TOP_LEFT = 0 << 24,
    TOP_RIGHT = 1 << 24,
    BOTTOM_LEFT = 2 << 24,
    BOTTOM_RIGHT = 3 << 24,
};

// cos(PI * 0.5) / 5.0 * i)
static f64 rr_cos[] = {
    0.9510565162951535,
    0.8090169943749478,
    0.5877852522924731,
    0.30901699437494745
};

#define RR_CORNER_POINTS 4

typedef struct polyline_t {
    bool closed;
    float2 points[1024];
    u32 point_count;

    ui_rect rect, uv_rect;
    f32 line_width, line_feather;
    u32 color, clip;
} polyline_t;

static polyline_t polyline;

void round_rect_corner(float2 *data, int offset, float2 center, float2 cos_point, float2 sin_point) {
    for (int i = 0; i < RR_CORNER_POINTS; ++i) {
        data[offset + i].x = center.x + cos_point.x * rr_cos[i] + sin_point.x * rr_cos[RR_CORNER_POINTS - 1 - i];
        data[offset + i].y = center.y + cos_point.y * rr_cos[i] + sin_point.y * rr_cos[RR_CORNER_POINTS - 1 - i];
    }
}

void round_rect_path(ui_rect rect, float4 radiuses) {
    float2* data = polyline.points;
    int offset = 0;

    f32 max_radiuses = fminf(rect.w * 0.25, rect.h * 0.25);
    radiuses.x = fminf(radiuses.x, max_radiuses);
    radiuses.y = fminf(radiuses.y, max_radiuses);
    radiuses.z = fminf(radiuses.z, max_radiuses);
    radiuses.w = fminf(radiuses.w, max_radiuses);

    float2 p0 = (float2){.x = rect.x + radiuses.x, .y = rect.y + radiuses.x};
    float2 p1 = (float2){.x = rect.x + rect.w - radiuses.y, .y = rect.y + radiuses.y};
    float2 p2 = (float2){.x = rect.x + radiuses.z, .y = rect.y + rect.h - radiuses.z};
    float2 p3 = (float2){.x = rect.x + rect.w - radiuses.w, .y = rect.y + rect.h - radiuses.w};

    if (radiuses.x < EPSILON) {
        data[offset++] = p0;
    } else {
        data[offset++] = (float2) {.x = rect.x, .y = p0.y};
        float2 cos_point = (float2){.x = -radiuses.x, .y = 0.f};
        float2 sin_point = (float2){.x = 0.f, .y = -radiuses.x};
        round_rect_corner(data, offset, p0, cos_point, sin_point);
        offset += RR_CORNER_POINTS;
        data[offset++] = (float2) {.x = p0.x, .y = rect.y};
    }

    if (radiuses.y < EPSILON) {
        data[offset++] = p1;
    } else {
        data[offset++] = (float2) {.x = p1.x, .y = rect.y};
        float2 cos_point = (float2){.x = 0, .y = -radiuses.y};
        float2 sin_point = (float2){.x = radiuses.y, .y = 0};
        round_rect_corner(data, offset, p1, cos_point, sin_point);
        offset += RR_CORNER_POINTS;
        data[offset++] = (float2) {.x = rect.x + rect.w, .y = p1.y};
    }

    if (radiuses.w < EPSILON) {
        data[offset++] = p3;
    } else {
        data[offset++] = (float2) {.x = rect.x + rect.w, .y = p3.y};
        float2 cos_point = (float2){.x = radiuses.w, .y = 0.f};
        float2 sin_point = (float2){.x = 0.f, .y = radiuses.w};
        round_rect_corner(data, offset, p3, cos_point, sin_point);
        offset += RR_CORNER_POINTS;
        data[offset++] = (float2) {.x = p3.x, .y = rect.y + rect.h};
    }

    if (radiuses.z < EPSILON) {
        data[offset++] = p2;
    } else {
        data[offset++] = (float2) {.x = p2.x, .y = rect.y + rect.h};
        float2 cos_point = (float2){.x = 0.f, .y = radiuses.z};
        float2 sin_point = (float2){.x = -radiuses.z, .y = 0.f};
        round_rect_corner(data, offset, p2, cos_point, sin_point);
        offset += RR_CORNER_POINTS;
        data[offset++] = (float2) {.x = rect.x, .y = p2.y};
    }

    polyline.point_count = offset;
}


static inline int prev(int i, int n, bool closed) {
    if (i == -1) return -1;
    else if (i > 0) return i - 1;
    else if (!closed) return -1;
    else return n - 1;
}

static inline int next(int i, int n, bool closed) {
    if (i == -1) return -1;
    else if (i + 1 < n) return i + 1;
    else if (!closed) return -1;
    else return 0;
}

static inline bool point_equals(float2 *points, int i, int j) {
    return memcmp(&points[i], &points[j], sizeof(float2)) == 0;
}

void fill_convex_polyline(ui_renderer_t *renderer, u32 layer_index, u32 type) {
    ui_layer *layer = &renderer->layers[layer_index];
    ui_rect uv_rect = polyline.uv_rect;
    ui_rect rect = polyline.rect;
    float2 *points = polyline.points;
    u32 point_count = polyline.point_count;
    u32 clip = polyline.clip >> 2;
    f32 a = polyline.line_feather * 0.5f;
    bool advanced = type != TRIANGLE_SOLID;
    bool textured = type > TRIANGLE_DASH;
    u32 primitive_type = advanced ? UI_PRIMITIVE_TYPE_TRIANGLE_ADVANCED : UI_PRIMITIVE_TYPE_TRIANGLE;
    u32 stride = advanced ? 8 : 4;

    u32 solid_color = polyline.color;
    u32 transparent_color = solid_color & 0xffffff00;

    ui_triangle_vertex vertex;
    vertex.clip = polyline.clip >> 2;
    vertex.color = transparent_color;
    vertex.type = type;

    u32 offset = layer->primitive_offset;
    for (int i = 0; i < polyline.point_count; ++i) {
        int pi = (i + point_count - 1) % point_count;
        int ni = (i + 1) % point_count;

        float2 point = points[i];
        float2 next_point = points[ni];
        float2 prev_point = points[pi];
        float2 da = float2_normalize(float2_sub(prev_point, point));
        float2 db = float2_normalize(float2_sub(next_point, point));
        float2 na = (float2){.x = -da.y, .y = da.x};
        float2 nb = (float2){.x = db.y, .y = -db.x};
        f32 d = float2_dot(da, db);
        f32 x = (float2_dot(nb, da) + float2_dot(na, db) * d) / (1 - d * d);
        float2 n = (float2){.x = x * da.x + na.x, .y = x * da.y + na.y};
        vertex.x = point.x + n.x * a;
        vertex.y = point.y + n.y * a;
        vertex.color = transparent_color;
        if (textured) {
            vertex.u = (vertex.x - rect.x) / rect.w * uv_rect.w + uv_rect.x;
            vertex.v = (rect.h - (vertex.y - rect.y)) / rect.h * uv_rect.h + uv_rect.y;
        }
        ui_layer_write_triangle_vertex(layer, vertex, advanced);
        vertex.x = point.x - n.x * a;
        vertex.y = point.y - n.y * a;
        vertex.color = solid_color;
        if (textured) {
            vertex.u = (vertex.x - rect.x) / rect.w * uv_rect.w + uv_rect.x;
            vertex.v = (rect.h - (vertex.y - rect.y)) / rect.h * uv_rect.h + uv_rect.y;
        }
        ui_layer_write_triangle_vertex(layer, vertex, advanced);

        u32 left_offset = offset + i * 2 * stride;
        u32 right_offset = offset + ni * 2 * stride;

        ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, left_offset));
        ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, left_offset + stride));
        ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, right_offset));
        ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, left_offset + stride));
        ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, right_offset + stride));
        ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, right_offset));

        if (left_offset != offset && right_offset != offset) {
            ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, offset + stride));
            ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, right_offset + stride));
            ui_layer_write_index(layer, encode_vertex_id(primitive_type, 0, left_offset + stride));
        }
    }
}

typedef struct edge_t {
    u32 e[4];
} edge_t;

static edge_t last_edge = {0};

void stroke_polyline(ui_renderer_t *renderer, u32 layer_index, bool dash, f32 dash_offset) {
    int prev_index = -1;
    int next_index = -1;
    ui_layer *layer = &renderer->layers[layer_index];
    float2 *points = polyline.points;
    u32 point_count = polyline.point_count + (polyline.closed ? 1 : 0);
    u32 clip = polyline.clip >> 2;
    u32 stride = dash ? 8 : 4;
    bool closed = polyline.closed;
    f32 width = polyline.line_width;
    f32 feather = polyline.line_feather;
    u32 type = dash ? UI_PRIMITIVE_TYPE_TRIANGLE_ADVANCED : UI_PRIMITIVE_TYPE_TRIANGLE;

    f32 w = width > feather ? (width - feather) / 2.0 : 0.0;
    f32 a = width > feather ? feather : width;

    u32 solid_color = polyline.color;
    u32 transparent_color = solid_color & 0xffffff00;
    ui_triangle_vertex vertex;
    if (dash) vertex.offset = dash_offset;
    vertex.clip = clip >> 2;

    for (int i = 0; i < point_count; ++i) {
        int point_index = i % polyline.point_count;
        prev_index = prev(point_index, polyline.point_count, closed);
        while (prev_index != -1 && prev_index != point_index && point_equals(points, point_index, prev_index)) prev_index = prev(prev_index, polyline.point_count, closed);
        next_index = next(point_index, polyline.point_count, closed);
        while (next_index != -1 && next_index != point_index && point_equals(points, point_index, next_index)) next_index = next(next_index, polyline.point_count, closed);
        
        if (prev_index == -1 && next_index == -1) continue;
        if (prev_index == point_index || next_index == point_index) continue;

        float2 prev_point = prev_index == -1 ? (float2){.x = 0.f, .y = 0.f} : points[prev_index];
        float2 point = points[point_index];
        float2 next_point = next_index == -1 ? (float2){.x = 0.f, .y = 0.f} : points[next_index];

        if (prev_index == -1) {
            float2 da = float2_normalize(float2_sub(next_point, point));
            float2 n = (float2){.x = -da.y, .y = da.x};
            vertex.x = point.x + n.x * (w + a);
            vertex.y = point.y + n.y * (w + a);
            vertex.color = transparent_color;
            u32 offset = ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x + n.x * w;
            vertex.y = point.y + n.y * w;
            vertex.color = solid_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x - n.x * w;
            vertex.y = point.y - n.y * w;
            vertex.color = solid_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x - n.x * (w + a);
            vertex.y = point.y - n.y * (w + a);
            vertex.color = transparent_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            last_edge = (edge_t){ offset, offset + stride, offset + stride * 2, offset + stride * 3 };
        } else if (next_index == -1) {
            float2 da = float2_normalize(float2_sub(point, prev_point));
            float2 db = float2_normalize(float2_sub(next_point, point));
            float2 na = (float2){.x = -da.y, .y = da.x};
            float2 nb = (float2){.x = -db.y, .y = db.x};
            f32 d = float2_dot(da, db);
            f32 x = (float2_dot(nb, da) + float2_dot(na, db) * d) / (1 - d * d);
            float2 n = (float2){.x = x * da.x + na.x, .y = x * da.y + na.y};
            vertex.x = point.x + n.x * (w + a);
            vertex.y = point.y + n.y * (w + a);
            vertex.color = transparent_color;
            u32 offset = ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x + n.x * w;
            vertex.y = point.y + n.y * w;
            vertex.color = solid_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x - n.x * w;
            vertex.y = point.y - n.y * w;
            vertex.color = solid_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x - n.x * (w + a);
            vertex.y = point.y - n.y * (w + a);
            vertex.color = transparent_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            edge_t edge = (edge_t){ offset, offset + stride, offset + stride * 2, offset + stride * 3 };
            if (point_index != -1) {
                const u32 merge[8] =  { last_edge.e[0], last_edge.e[1], last_edge.e[2], last_edge.e[3], edge.e[0], edge.e[1], edge.e[2], edge.e[3] };
                const u32 tri[18] = { 0U, 4, 5, 0U, 5, 1, 1U, 5, 6, 1U, 6, 2, 2U, 6, 7, 2U, 7, 3 };
                for (int i = 0; i < 18; ++i) {
                    ui_layer_write_index(layer, encode_vertex_id(type, 0, merge[tri[i]]));
                }
            }
            memcpy(&last_edge, &edge, sizeof(edge_t));
        } else {

            float2 da = float2_normalize(float2_sub(point, prev_point));
            float2 db = float2_normalize(float2_sub(next_point, point));
            float2 na = (float2){.x = -da.y, .y = da.x};
            float2 nb = (float2){.x = -db.y, .y = db.x};
            f32 d = float2_dot(da, db);
            f32 x = (float2_dot(nb, da) + float2_dot(na, db) * d) / (1 - d * d);
            float2 n = (float2){.x = x * da.x + na.x, .y = x * da.y + na.y};
            vertex.x = point.x + n.x * (w + a);
            vertex.y = point.y + n.y * (w + a);
            vertex.color = transparent_color;
            u32 offset = ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x + n.x * w;
            vertex.y = point.y + n.y * w;
            vertex.color = solid_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x - n.x * w;
            vertex.y = point.y - n.y * w;
            vertex.color = solid_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            vertex.x = point.x - n.x * (w + a);
            vertex.y = point.y - n.y * (w + a);
            vertex.color = transparent_color;
            ui_layer_write_triangle_vertex(layer, vertex, dash);

            edge_t edge = (edge_t){ offset, offset + stride, offset + stride * 2, offset + stride * 3 };
            if (i) {
                const u32 merge[8] =  { last_edge.e[0], last_edge.e[1], last_edge.e[2], last_edge.e[3], edge.e[0], edge.e[1], edge.e[2], edge.e[3] };
                const u32 tri[18] = { 0U, 4, 5, 0U, 5, 1, 1U, 5, 6, 1U, 6, 2, 2U, 6, 7, 2U, 7, 3 };
                for (int i = 0; i < 18; ++i) {
                    ui_layer_write_index(layer, encode_vertex_id(type, 0, merge[tri[i]]));
                }
            }
            memcpy(&last_edge, &edge, sizeof(edge_t));
        }
    }
}

void fill_rect(ui_renderer_t *renderer, u32 layer_index, ui_style style, ui_rect rect, u32 clip) {
    ui_rect clip_rect;
    ui_layer *layer = &renderer->layers[layer_index];
    if (clip != 0) {
        clip_rect = ui_renderer_read_clip(renderer, clip);
        int result = ui_rect_clip(rect, clip_rect);
        if (result == CLIP_RESULT_DISCARD) return;
        else if (result == CLIP_RESULT_KEEP) clip = 0;
    }
    ui_rect_vertex vertex;
    vertex.color = style.color;
    vertex.x = rect.x;
    vertex.y = rect.y;
    vertex.w = rect.w;
    vertex.h = rect.h;
    vertex.clip = clip >> 2;

    u32 type = UI_PRIMITIVE_TYPE_RECTANGLE;
    u32 offset = ui_layer_write_rect_vertex(&renderer->layers[layer_index], vertex);
    ui_layer_write_index(layer, encode_vertex_id(type, TOP_LEFT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, BOTTOM_LEFT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, TOP_RIGHT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, BOTTOM_LEFT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, BOTTOM_RIGHT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, TOP_RIGHT, offset));
}

void fill_round_rect(ui_renderer_t *renderer, u32 layer_index, ui_style style, ui_rect rect, f32 radius, u32 clip, u32 triangle_type) {
    fill_round_rect_pre_corner(renderer, layer_index, style, rect, (float4){radius, radius, radius, radius}, clip, triangle_type);
}

void fill_round_rect_pre_corner(ui_renderer_t *renderer, u32 layer_index, ui_style style, ui_rect rect, float4 radiuses, u32 clip, u32 triangle_type) {
    ui_rect clip_rect;
    ui_layer *layer = &renderer->layers[layer_index];
    if (clip != 0) {
        clip_rect = ui_renderer_read_clip(renderer, clip);
        int result = ui_rect_clip(rect, clip_rect);
        if (result == CLIP_RESULT_DISCARD) return;
        else if (result == CLIP_RESULT_KEEP) clip = 0;
    }

    polyline.closed = true;
    polyline.color = style.color;
    polyline.clip = clip;
    polyline.line_width = style.line_width;
    polyline.line_feather = style.line_feather;

    round_rect_path(rect, radiuses);
    fill_convex_polyline(renderer, layer_index, triangle_type);
}

void stroke_rect(ui_renderer_t *renderer, u32 layer_index, ui_style style, ui_rect rect, u32 clip) {
    ui_rect clip_rect;
    ui_layer *layer = &renderer->layers[layer_index];
    if (clip != 0) {
        clip_rect = ui_renderer_read_clip(renderer, clip);
        int result = ui_rect_clip(rect, clip_rect);
        if (result == CLIP_RESULT_DISCARD) return;
        else if (result == CLIP_RESULT_KEEP) clip = 0;
    }
    ui_rect_vertex vertex;
    vertex.color = style.color;
    vertex.x = rect.x;
    vertex.y = rect.y;
    vertex.w = rect.w;
    vertex.h = rect.h;
    vertex.clip = clip >> 2;

    u32 type = UI_PRIMITIVE_TYPE_RECTANGLE;
    u32 offset = ui_layer_write_rect_vertex(&renderer->layers[layer_index], vertex);
    ui_layer_write_index(layer, encode_vertex_id(type, TOP_LEFT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, BOTTOM_LEFT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, TOP_RIGHT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, BOTTOM_LEFT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, BOTTOM_RIGHT, offset));
    ui_layer_write_index(layer, encode_vertex_id(type, TOP_RIGHT, offset));
}

void stroke_round_rect(ui_renderer_t *renderer, u32 layer_index, ui_style style, ui_rect rect, f32 radius, u32 clip, u32 triangle_type) {
    stroke_round_rect_pre_corner(renderer, layer_index, style, rect, (float4){radius, radius, radius, radius}, clip, triangle_type);
}

void stroke_round_rect_pre_corner(ui_renderer_t *renderer, u32 layer_index, ui_style style, ui_rect rect, float4 radiusese, u32 clip, u32 triangle_type) {
    ui_rect clip_rect;
    ui_layer *layer = &renderer->layers[layer_index];
    if (clip != 0) {
        clip_rect = ui_renderer_read_clip(renderer, clip);
        int result = ui_rect_clip(rect, clip_rect);
        if (result == CLIP_RESULT_DISCARD) return;
        else if (result == CLIP_RESULT_KEEP) clip = 0;
    }

    polyline.closed = true;
    polyline.color = style.color;
    polyline.clip = clip;
    polyline.line_width = style.line_width;
    polyline.line_feather = style.line_feather;

    round_rect_path(rect, radiusese);
    stroke_polyline(renderer, layer_index, false, 0.f);
}

#define GLYPH_BATCH_SIZE 32

void draw_glyph(ui_renderer_t *renderer, u32 layer_index, float2 origin, ui_font *font, ustring_view text, u32 clip, f32 scale, ui_style style) {
    ui_layer *layer = &renderer->layers[layer_index];
    
    ui_glyph_header header;
    header.x = origin.x;
    header.y = origin.y;
    header.clip = clip >> 2;
    header.font = font->font->gpu_font_start;

    float2 glyph_origin = origin;

    ui_glyph_vertex vertex;
    vertex.color = style.color;

    f32 ratio = font->scale * scale;
    vertex.scale = ratio;

    int prev_id = -1;
    u32 header_offset = GLYPH_BATCH_SIZE;
    for (int i = 0; i < text.length; ++i) {
        const int c = (int)text.base.data[i + text.start];
        if (c == 0) return;
        const msdf_glyph g = msdf_font_get_glyph(font->font, c);
        if (g.id == 0) continue;

        if (header_offset >= GLYPH_BATCH_SIZE) {
            ui_layer_write_glyph_header(layer, header);
            header_offset = 0;
        }

        f32 kerning = msdf_font_computer_kerning(font->font, prev_id, g.id) * ratio;
        prev_id = g.id;

        vertex.xoffset = ((f32)glyph_origin.x - (f32)origin.x) + ((f32)g.xoffset + (f32)kerning) * ratio;
        vertex.glyph_index = g.gpu_index;

        const u32 offset = ui_layer_write_glyph_vertex(layer, vertex);
        ui_layer_write_index(layer, encode_glyph_id(header_offset, TOP_LEFT, offset));
        ui_layer_write_index(layer, encode_glyph_id(header_offset, BOTTOM_LEFT, offset));
        ui_layer_write_index(layer, encode_glyph_id(header_offset, TOP_RIGHT, offset));
        ui_layer_write_index(layer, encode_glyph_id(header_offset, BOTTOM_LEFT, offset));
        ui_layer_write_index(layer, encode_glyph_id(header_offset, BOTTOM_RIGHT, offset));
        ui_layer_write_index(layer, encode_glyph_id(header_offset, TOP_RIGHT, offset));

        glyph_origin.x += (g.xadvance + kerning) * ratio;
        header_offset++;
    }
}
