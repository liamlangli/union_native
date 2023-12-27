#pragma once

#include "ui/ui_renderer.h"
#include "ui/ui_type.h"

#define MAX_KEY_COUNT 16

enum CURSOR_TYPE {
    CURSOR_Default = 0x00036001,
    CURSOR_Text = 0x00036002,
    CURSOR_Hand = 0x00036004,
    CURSOR_ResizeHori = 0x00036005,
    CURSOR_ResizeVert = 0x00036006
};

typedef struct ui_key_map_t {
    int key;
    f64 value; // last active time
} ui_key_map_t;

typedef struct ui_state_t {
    ui_rect window_rect;

    float2 mouse_location;
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

    f32 smooth_factor;
    ui_renderer_t *renderer;

    u32 active_frame_count;
    u32 defer_update_frame_count;
    u32 defer_update_frame_index;

    f64 time; // time in seconds
    f64 last_time;
    f64 delta_time;
} ui_state_t;

void ui_state_init(ui_state_t *state, ui_renderer_t *renderer);

bool ui_state_set_active(ui_state_t *state, u32 id);
void ui_state_set_active_force(ui_state_t *state, u32 id);
void ui_state_clear_active(ui_state_t *state);

bool ui_state_set_focus(ui_state_t *state, u32 id);
void ui_state_clear_focus(ui_state_t *state);

void ui_state_key_press(ui_state_t *state, int key);
void ui_state_key_release(ui_state_t *state, int key);
bool ui_state_is_key_press(ui_state_t *state, int key);
bool ui_state_is_key_pressed(ui_state_t *state, int key);
bool ui_state_is_key_release(ui_state_t *state, int key);

bool ui_state_update(ui_state_t *state);
bool ui_state_hovering(ui_state_t *state, ui_rect rect, int layer_index);

u32 ui_state_parse_char(ui_state_t *state);