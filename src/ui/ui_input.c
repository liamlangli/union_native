#include "ui/ui_input.h"
#include "ui/ui_draw.h"
#include "ui/ui_style_default.h"

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

    bool hover = ui_state_hovering(state, rect, layer_index);
    if (hover) {
        state->next_hover = id;
        state->next_hover_layer_index = layer_index;
    }

    if (state->hover == id) {
        if (state->left_mouse_press) {
            state->last_active = id;
        }
    }

    ui_style fill_style = style;
    fill_style.color = hover && state->hover == id && state->active == -1 ? style.hover_color : style.color;
    fill_round_rect_pre_corner_solid(state->renderer, 0, fill_style, rect, input->radiuses, clip);

    if (state->active == id || state->focus == id || input->outline) {
        ui_style outline_style = (ui_style){ .color = style.outline_color, .line_width = 2.f, .line_feather = 1.f };
        stroke_round_rect_pre_corner_solid(state->renderer, 0, outline_style, rect, input->radiuses, clip);
    }

    ui_label(state, &input->label, text_primary, rect, layer_index, clip);
    if (state->active == id || state->focus == id) {
        ui_input_render_cursor(state, input, rect, clip);
    }

    return result;
}