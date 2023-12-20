#pragma once

#include "ui/ui_type.h"

typedef struct ui_layer {
    u32 *index_data;
    f32 *primitive_data;
    u32 index_offset, primitive_offset;
} ui_layer;

#define MAX_UI_LAYERS 4

typedef struct ui_renderer_t {
    // cpu side
    ui_layer layers[MAX_UI_LAYERS];
    u32 *index_data;
    f32 *primitive_data;
    u32 index_offset, primitive_offset;
    u32 last_index_offset, last_primitive_offset;
    u32 preserved_primitive_offset;

    // gpu side
    float3 window_size;
    u32 window_size_location;
    u32 program;
    u32 primitive_data_texture;
    u32 primitive_data_texture_location;
    u32 primitive_data_texture_width;
    u32 index_buffer;
} ui_renderer_t;

typedef struct gpu_glyph {
    u32 id, index;
    f32 xadvance, xoffset, yoffset, width, height;
} gpu_glyph;

typedef struct gpu_font_header {
    u32 texture_width, texture_height, id;
} gpu_font_header;

typedef struct gpu_font {
    u32 id;
    u32 gpu_tetxure;
    u32 texture_width;
    u32 texture_height;
} gpu_font;

typedef struct ui_font {
    gpu_font *gpu_font;
} ui_font;

// renderer func
void ui_renderer_init(ui_renderer_t* renderer);
void ui_renderer_free(ui_renderer_t* renderer);
void ui_renderer_render(ui_renderer_t* renderer);
void ui_renderer_add_font(ui_renderer_t *renderer, gpu_font *font);

// font func
void gpu_font_load(ustring json_path, ustring font_map_path);
void ui_font_init(ui_font *font, gpu_font *gpu_font, u32 font_size);

