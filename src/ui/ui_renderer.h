#pragma once

#include "ui/ui_font.h"
#include "ui/ui_type.h"

#define MAX_UI_LAYERS 4

typedef struct ui_layer {
    u32 *index_data;
    u32 *primitive_data;
    u32 index_offset, primitive_offset;
    u32 last_index_offset, last_primitive_offset;
} ui_layer;

typedef struct ui_renderer_t {
    // cpu side
    ui_layer layers[MAX_UI_LAYERS];
    u32 *index_data;
    u32 *primitive_data;
    u32 index_offset, primitive_offset;
    u32 last_index_offset, last_primitive_offset;
    u32 preserved_primitive_offset;

    // gpu side
    u32 program;
    u32 vao;
    float4 window_size;
    u32 window_size_location;
    u32 primitive_data_texture;
    u32 primitive_data_texture_location;
    u32 primitive_data_texture_width;
    u32 icon_texture;
    u32 icon_texture_location;
    u32 font_texture_location;
    u32 index_buffer;
} ui_renderer_t;

typedef struct ui_rect_vertex {
    f32 x, y, w, h;
    u32 color, clip;
} ui_rect_vertex;

typedef struct ui_triangle_vertex {
    f32 x, y;
    u32 color, clip;
    f32 u, v;
    u32 type;
    f32 offset;
} ui_triangle_vertex;

typedef struct ui_glyph_header {
    f32 x, y;
    u32 font;
    f32 clip;
} ui_glyph_header;

typedef struct ui_glyph_vertex {
    f32 xoffset;
    u32 glyph_index;
    u32 color;
    f32 scale;
} ui_glyph_vertex;

typedef struct ui_font_glyph_vertex {
    f32 x, y, w, h, xoffset, yoffset, xadvance, page;
} ui_font_glyph_vertex;

void ui_layer_write_index(ui_layer *layer, u32 index);
u32 ui_layer_write_rect_vertex(ui_layer *layer, ui_rect_vertex vertex);
u32 ui_layer_write_triangle_vertex(ui_layer *layer, ui_triangle_vertex vertex, bool advanced);
u32 ui_layer_write_glyph_header(ui_layer *layer, ui_glyph_header header);
u32 ui_layer_write_glyph_vertex(ui_layer *layer, ui_glyph_vertex vertex);
u32 ui_layer_write_clip(ui_layer *layer, ui_rect rect, u32 parent);
ui_rect ui_layer_read_clip(ui_layer *layer, u32 clip);
void ui_layer_clear(ui_layer *layer);

// renderer func
void ui_renderer_init(ui_renderer_t *renderer);
void ui_renderer_free(ui_renderer_t *renderer);
void ui_renderer_render(ui_renderer_t *renderer);

