#ifndef _ui_draw_h_
#define _ui_draw_h_

#include "types.h"

typedef struct ui_triangle_vertex_t { // 16 bytes
    float2_t position;
    color_srgb_t color;
    u32 clip;
} ui_triangle_vertex_t;

typedef struct ui_rect_vertex_t { // 24 bytes
    rect_t rect;
    color_srgb_t color;
    u32 clip;
} ui_rect_vertex_t;


#endif