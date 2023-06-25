#ifndef _ui_h_
#define _ui_h_

#include "types.h"

typedef struct ui_style_t {
    f32 line_width;
    f32 feather;
    color_srgb_t color, hover, active, outline;
} ui_style_t;

typedef struct ui_renderer_api {
    i32 (*draw_rect)(rect_t rect, u32 color);
} ui_renderer_api;

typedef struct ui_api {
    void (*init)(void);
} ui_api;

extern ui_api* ui;

#endif
