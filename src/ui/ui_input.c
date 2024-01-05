#include "foundation/io.h"
#include "foundation/os.h"
#include "foundation/ustring.h"
#include "script/script.h"
#include "ui/ui_input.h"
#include "ui/ui_draw.h"
#include "ui/ui_keycode.h"
#include "ui/ui_label.h"
#include "ui/ui_state.h"
#include "ui/ui_theme.h"

#include <stb_ds.h>

void ui_input_init(ui_input_t *input, ustring_view text) {
    ui_label_init(&input->label, text);
    ui_element_init(&input->element);
    input->radiuses = (float4){4.f, 4.f, 4.f, 4.f};
    input->editing = false;
    input->outline = true;
    input->label.element.constraint.alignment = CENTER_VERTICAL | LEFT;
    input->label.element.constraint.margin.left = 5.f;
    input->cursor_style = ui_theme_shared()->text;
}

void ui_input_render_cursor(ui_state_t *state, ui_input_t *input, ui_rect rect, u32 clip) {
    ui_rect cursor_rect = rect;
    f32 scale = input->label.scale;
    f32 cursor_offset = ui_label_cursor_offset(&input->label);
    int alignment = input->label.element.constraint.alignment;

    if (alignment & LEFT) {
        cursor_rect.x += cursor_offset + input->label.element.constraint.margin.left * scale;
    } else if (alignment & RIGHT) {
        cursor_rect.x +=
            rect.w - (input->label.element.constraint.margin.right + input->label.text_size.x) * scale - cursor_offset;
    } else {
        cursor_rect.x += (rect.w - input->label.text_size.x * scale) * 0.5f + cursor_offset;
    }

    ui_style cursor_style = input->cursor_style;
    cursor_rect.w = cursor_style.line_width * scale;
    cursor_rect.h = input->label.text_size.y * scale;
    cursor_rect.y += (rect.h - cursor_rect.h) * 0.5f;
    fill_rect(state->renderer, 0, cursor_style, cursor_rect, clip);
}

void ui_input_handle_edit(ui_state_t *state, ui_input_t *input) {
    const bool control_pressed =
        ui_state_is_key_pressed(state, KEY_LEFT_CONTROL) || ui_state_is_key_pressed(state, KEY_RIGHT_CONTROL) ||
        ui_state_is_key_pressed(state, KEY_LEFT_SUPER) || ui_state_is_key_pressed(state, KEY_RIGHT_SUPER);
    const int start = input->label.start_index;
    const int end = input->label.cursor_index;
    const int from = MACRO_MIN(start, end);
    const int to = MACRO_MAX(start, end);

    if (ui_state_is_key_press(state, KEY_BACKSPACE)) {
        if (control_pressed) {
            to == input->label.text.length ? ustring_view_clear(&input->label.text)
                                           : ustring_view_erase(&input->label.text, 0, to);
            input->label.cursor_index = 0;
            input->label.start_index = 0;
        } else {
            if (from == to) {
                if (from > 0) {
                    ustring_view_erase(&input->label.text, from - 1, from);
                    input->label.cursor_index = from - 1;
                    input->label.start_index = from - 1;
                }
            } else {
                ustring_view_erase(&input->label.text, from, to);
                input->label.cursor_index = from;
                input->label.start_index = from;
            }
        }
        hmdel(state->key_press, KEY_BACKSPACE);
        input->label.render_selected = false;
        ui_label_update_text(&input->label, input->label.text);
    }

    if (control_pressed) {
        if (ui_state_is_key_press(state, KEY_A)) {
            input->label.cursor_index = 0;
            input->label.start_index = input->label.text.length;
            input->label.render_selected = true;
            hmdel(state->key_press, KEY_A);
        }
        if (ui_state_is_key_press(state, KEY_LEFT)) {
            input->label.cursor_index = 0;
            input->label.render_selected = false;
        }
        if (ui_state_is_key_press(state, KEY_RIGHT)) {
            input->label.cursor_index = input->label.text.length;
            input->label.render_selected = false;
        }
        if (ui_state_is_key_press(state, KEY_C)) {
            os_window_set_clipboard(script_context_shared()->window, input->label.text);
            hmdel(state->key_press, KEY_C);
        }
        if (ui_state_is_key_press(state, KEY_X)) {
            os_window_set_clipboard(script_context_shared()->window, ustring_view_sub_view(&input->label.text, from, to));
            ustring_view_erase(&input->label.text, from, to);
            input->label.cursor_index = from;
            input->label.start_index = from;
            input->label.render_selected = false;
            ui_label_update_text(&input->label, input->label.text);
            hmdel(state->key_press, KEY_X);
        }
        if (ui_state_is_key_press(state, KEY_V)) {
            if (from != to)
                ustring_view_erase(&input->label.text, from, to);
            ustring pasted = os_window_get_clipboard(script_context_shared()->window);
            ustring_view_insert_ustring(&input->label.text, from, &pasted);
            input->label.cursor_index = from + pasted.length;
            input->label.start_index = from + pasted.length;
            input->label.render_selected = false;
            ui_label_update_text(&input->label, input->label.text);
            hmdel(state->key_press, KEY_V);
        }

    } else {
        if (ui_state_is_key_press(state, KEY_LEFT)) {
            if (input->label.cursor_index > 0) {
                input->label.cursor_index = MACRO_MAX(input->label.cursor_index - 1, 0);
                input->label.start_index = input->label.cursor_index;
            }
        }

        if (ui_state_is_key_press(state, KEY_RIGHT)) {
            if (input->label.cursor_index < input->label.text.length) {
                input->label.cursor_index = MACRO_MIN(input->label.cursor_index + 1, input->label.text.length);
                input->label.start_index = input->label.cursor_index;
            }
        }

        const bool shift = hmgeti(state->key_pressed, KEY_LEFT_SHIFT) != -1 || hmgeti(state->key_pressed, KEY_RIGHT_SHIFT) != -1;
        u32 count = ui_keycode_parse(&state->edit_str, state->key_press, shift);
        if (count <= 0) return;

        if (from != to) {
            ustring_view_erase(&input->label.text, from, to);
            input->label.cursor_index = from;
            input->label.start_index = from;
            input->label.render_selected = false;
        }

        if (input->label.cursor_index == input->label.text.length) {
            ustring_view_append_ustring_view(&input->label.text, &state->edit_str);
        } else {
            ustring_view_insert_ustring_view(&input->label.text, input->label.cursor_index, &state->edit_str);
        }
        input->label.cursor_index += count;
        input->label.start_index = input->label.cursor_index;

        if (count > 0)
            ui_label_update_text(&input->label, input->label.text);
    }
}

bool ui_input(ui_state_t *state, ui_input_t *input, ui_style style, ui_rect rect, u32 layer_index, u32 clip) {
    bool result = false;
    u32 id = input->element.id;

    ui_style draw_style;

    bool hover = ui_state_hovering(state, rect, layer_index);
    bool active = state->active == id;
    bool focus = state->focus == id;
    bool last_active = state->last_active == id;

    if (hover) {
        state->next_hover = id;
        state->next_hover_layer_index = layer_index;
    }

    if (hover) {
        state->cursor_type = CURSOR_Text;
        if (state->left_mouse_press) {
            state->last_active = id;
        }
    }

    if (active || focus) {
        draw_style.color = style.active_color;
        ui_input_handle_edit(state, input);
        if (ui_state_is_key_press(state, KEY_ENTER)) {
            result = true;
            ui_state_clear_active(state);
            ui_state_clear_focus(state);
            hmdel(state->key_press, KEY_ENTER);
            input->label.cursor_index = input->label.text.length;
            input->label.render_selected = false;
            ustring_view_set_null_terminated(&input->label.text);
        }

        if (ui_state_is_key_press(state, KEY_ESCAPE)) {
            result = !ustring_view_equals(&input->unmodified_text, &input->label.text);
            ui_state_clear_active(state);
            ui_state_clear_focus(state);
            hmdel(state->key_press, KEY_ESCAPE);
            ustring_view_set_ustring_view(&input->label.text, &input->unmodified_text);
            ui_label_update_text(&input->label, input->label.text);
            input->label.cursor_index = input->label.text.length;
            input->label.render_selected = false;
        }
    }

    if (hover && (ui_state_is_key_press(state, KEY_ENTER) || (state->left_mouse_release && last_active))) {
        ui_state_set_active(state, id);
        ui_state_set_focus(state, id);
        ustring_view_set_ustring_view(&input->unmodified_text, &input->label.text);
        input->label.start_index = input->label.cursor_index;
    }

    if (active && state->left_mouse_press) {
        input->label.start_index = ui_label_locate_cursor(&input->label, rect, state->pointer_location);
    }

    if (active) {
        if (state->left_mouse_is_pressed) {
            input->label.cursor_index = ui_label_locate_cursor(&input->label, rect, state->pointer_location);
            input->label.render_selected = true;
        }

        if (!ui_state_hovering(state, rect, layer_index) && state->left_mouse_press) {
            ui_state_clear_active(state);
            ui_state_clear_focus(state);
            input->label.render_selected = false;
        }
    }

    ui_style fill_style = style;
    fill_style.color = hover && state->hover == id && state->active == -1 ? style.hover_color : style.color;
    fill_round_rect_pre_corner(state->renderer, 0, fill_style, rect, input->radiuses, clip, TRIANGLE_SOLID);

    if (input->outline && (state->active == id || state->focus == id || state->hover == id)) {
        ui_style outline_style = (ui_style){.color = style.outline_color, .line_width = 2.f, .line_feather = 1.f};
        stroke_round_rect_pre_corner(state->renderer, 0, outline_style, rect, input->radiuses, clip, TRIANGLE_SOLID);
    }

    ui_label(state, &input->label, ui_theme_shared()->text, rect, layer_index, clip);
    if (active || focus) {
        ui_input_render_cursor(state, input, rect, clip);
    }

    return result;
}
