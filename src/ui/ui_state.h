#pragma once

#include "ui/ui_type.h"

#include <string.h>

#define MAX_KEY_COUNT 16

#include "ui/ui_renderer.h"

typedef struct ui_state_t {
    float2 mouse_location;
    int next_hover, next_hover_layer_index;
    int focus, hover, hover_layer;
    int active, last_active;

    bool left_mouse_press, left_mouse_release;
    bool right_mouse_press, right_mouse_release;
    bool middle_mouse_press, middle_mouse_release;
    bool left_mouse_is_pressed, right_mouse_is_pressed, middle_mouse_is_pressed;
    u32 key_press[MAX_KEY_COUNT];
    u32 key_pressed[MAX_KEY_COUNT];

    bool needs_update;
    u32 cursor_type;

    f32 smooth_factor;
    ui_renderer_t *renderer;
} ui_state_t;

void ui_state_init(ui_state_t *state, ui_renderer_t *renderer);