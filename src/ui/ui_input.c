#include "ui/ui_input.h"
#include "ui/ui_draw.h"
#include "ui/ui_keycode.h"
#include "ui/ui_label.h"
#include "ui/ui_state.h"
#include "ui/ui_style_default.h"

#include <stb_ds.h>

void ui_input_init(ui_input_t *input, ustring text) {
    ui_label_init(&input->label, text);
    ui_element_init(&input->element);
    input->radiuses = (float4){6.f, 6.f, 6.f, 6.f};
    input->editing = false;
    input->outline = true;
    input->label.element.constraint.alignment = CENTER_VERTICAL | LEFT;
    input->label.element.constraint.margin.left = 5.f;
}

void ui_input_render_cursor(ui_state_t *state, ui_input_t *input, ui_rect rect, u32 clip) {
    ui_rect cursor_rect = rect;
    f32 scale = input->label.scale;
    f32 cursor_offset = ui_input_cursor_offset(&input->label);
    int alignment = input->label.element.constraint.alignment;

    if (alignment & LEFT) {
        cursor_rect.x += cursor_offset;
    } else if (alignment & RIGHT) {
        cursor_rect.x += rect.w - (input->label.element.constraint.margin.right + input->label.text_size.x) * scale - cursor_offset;
    } else {
        cursor_rect.x += (rect.w - input->label.text_size.x * scale) * 0.5f + cursor_offset;
    }

    const f32 shrink = 3;
    cursor_rect.w = 1.2 * scale;
    cursor_rect.h -= shrink * 2.f * scale;
    cursor_rect.y += shrink * scale;
    fill_rect(state->renderer, 0, text_primary, cursor_rect, clip);
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
        if (state->left_mouse_press) {
            state->last_active = id;
        }
    }

    if (active || focus) {
        draw_style.color = style.active_color;
        // handle edit;

        if (ui_state_is_key_press(state, KEY_ENTER)) {
            result = true;
            ui_state_clear_active(state);
            ui_state_clear_focus(state);
            hmdel(state->key_press, KEY_ENTER);
            input->label.cursor_index = input->label.text.length;
            input->label.render_selected = false;
        }

        if (ui_state_is_key_press(state, KEY_ESCAPE)) {
            result = !ustring_equals(&input->unmodified_text, &input->label.text);
            ui_state_clear_active(state);
            ui_state_clear_focus(state);
            hmdel(state->key_press, KEY_ESCAPE);
            input->label.cursor_index = input->label.text.length;
            input->label.render_selected = false;
        }
    }

    if (active && state->left_mouse_press) {
        input->label.start_index = ui_label_locate_cursor(&input->label, rect, state->mouse_location);
    }

    if (hover && (ui_state_is_key_press(state, KEY_ENTER) || (state->left_mouse_release && last_active))) {
        ui_state_set_active(state, id);
        ui_state_set_focus(state, id);
        ustring_set(&input->unmodified_text, &input->label.text);
    }

    if (active) {
        if (state->left_mouse_is_pressed) {
            input->label.cursor_index = ui_label_locate_cursor(&input->label, rect, state->mouse_location);
            input->label.render_selected = true;
        }
        if (!ui_state_hovering(state, rect, layer_index)) {
            ui_state_clear_active(state);
            input->label.render_selected = false;
        }
    }

    ui_style fill_style = style;
    fill_style.color = hover && state->hover == id && state->active == -1 ? style.hover_color : style.color;
    fill_round_rect_pre_corner(state->renderer, 0, fill_style, rect, input->radiuses, clip, TRIANGLE_SOLID);

    if (input->outline && (state->active == id || state->focus == id || state->hover == id)) {
        ui_style outline_style = (ui_style){ .color = style.outline_color, .line_width = 2.f, .line_feather = 1.f };
        stroke_round_rect_pre_corner(state->renderer, 0, outline_style, rect, input->radiuses, clip, TRIANGLE_SOLID);
    }

    ui_label(state, &input->label, text_primary, rect, layer_index, clip);
    if (state->active == id || state->focus == id) {
        ui_input_render_cursor(state, input, rect, clip);
    }

    return result;
}