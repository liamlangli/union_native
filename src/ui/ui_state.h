#pragma once

#include "ui/ui_renderer.h"
#include "ui/ui_type.h"

typedef struct ui_state_t {
    ui_rect window_rect;

    float2 pointer_location;
    float2 pointer_start, pointer_delta, pointer_scroll;

    int next_hover, next_hover_layer_index;
    int focus, hover, hover_layer;
    int active, last_active;

    bool left_mouse_press, left_mouse_release;
    bool right_mouse_press, right_mouse_release;
    bool middle_mouse_press, middle_mouse_release;
    bool left_mouse_is_pressed, right_mouse_is_pressed, middle_mouse_is_pressed;

    ui_key_map_t *key_press;
    ui_key_map_t *key_release;
    ui_key_map_t *key_pressed;
    ustring_view edit_str;

    bool updated;
    u32 cursor_type;

    ui_renderer_t *renderer;

    u32 active_frame_count;
    u32 defer_update_frame_count;
    u32 defer_update_frame_index;

    f64 time; // time in seconds
    f64 last_time;
    f64 delta_time;
    f64 smooth_factor;
} ui_state_t;

void ui_state_init();

void ui_state_set_size(u32 width, u32 height);
bool ui_state_set_active(u32 id);
void ui_state_clear_active();

bool ui_state_set_focus(u32 id);
void ui_state_clear_focus();

void ui_state_delete_key_press(int key);
void ui_state_key_press(int key);
void ui_state_key_release(int key);
bool ui_state_is_key_press(int key);
bool ui_state_is_key_pressed(int key);

bool ui_state_update();
bool ui_state_hovering(ui_rect rect, int layer_index);