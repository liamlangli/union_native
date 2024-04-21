#pragma once

#include "ui/ui_renderer.h"
#include "ui/ui_type.h"
#include "ui/ui_keycode.h"

typedef struct ui_state_t {
    ui_rect window_rect;

    float2 pointer_location;
    float2 pointer_start, pointer_delta, pointer_scroll, pointer_offset;

    i32 next_hover, next_hover_layer_index;
    i32 focus, hover, hover_layer;
    i32 active, last_active;

    bool left_mouse_press, left_mouse_release;
    bool right_mouse_press, right_mouse_release;
    bool middle_mouse_press, middle_mouse_release;
    bool left_mouse_is_pressed, right_mouse_is_pressed, middle_mouse_is_pressed;

    u8 key_press[MAX_KEY_COUNT];
    u8 key_release[MAX_KEY_COUNT];
    u8 key_pressed[MAX_KEY_COUNT];
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

UN_EXPORT void ui_state_init();
ui_state_t *ui_state_get();

UN_EXPORT void ui_state_set_size(u32 width, u32 height);
UN_EXPORT bool ui_state_set_active(i32 id);
UN_EXPORT i32 ui_state_get_active();
UN_EXPORT i32 ui_state_get_last_active();
UN_EXPORT i32 ui_state_get_focus();
UN_EXPORT i32 ui_state_get_hover();
UN_EXPORT void ui_state_clear_active();
UN_EXPORT void ui_state_set_mouse_location(f32 x, f32 y);

UN_EXPORT bool ui_state_set_focus(i32 id);
UN_EXPORT void ui_state_clear_focus();

UN_EXPORT void ui_state_delete_key_press(i32 key);
UN_EXPORT void ui_state_key_press(i32 key);
UN_EXPORT void ui_state_key_release(i32 key);
UN_EXPORT bool ui_state_is_key_press(i32 key);
UN_EXPORT bool ui_state_is_key_pressed(i32 key);

UN_EXPORT void ui_state_mouse_down(i32 button);
UN_EXPORT void ui_state_mouse_up(i32 button);
UN_EXPORT bool ui_state_is_mouse_down(i32 button);
UN_EXPORT bool ui_state_is_mouse_pressed(i32 button);

UN_EXPORT bool ui_state_update();
UN_EXPORT bool ui_state_hovering(ui_rect rect, i32 layer_index);