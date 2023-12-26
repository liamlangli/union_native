#include "ui/ui_input.h"
#include "ui/ui_renderer.h"
#include "ui/ui_draw.h"

void ui_label_init(ui_label_t *label, ustring text) {
    ui_element_init(&label->element);
    label->text = text;
    label->scale = 1.0f;
    label->cursor_index = 0;
    label->start_index = 0;
    label->render_selected = false;
    memset(label->char_offsets, 0, MAX_CHAR_LENGTH);
    ui_label_update_text(label, text);
}

void ui_label_update_text(ui_label_t *label, ustring text) {
    ui_font *sys_font = ui_font_system_font();
    label->text_size = ui_font_compute_size_and_offset(sys_font, text, label->char_offsets);
    label->text = text;
}

void ui_label(ui_state_t *state, ui_label_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip) {
    if (label->text.length == 0) return;
    ui_rect clip_rect;
    ui_renderer_t *renderer = state->renderer;
    f32 scale = label->scale;

    if (clip != 0) {
        clip_rect = ui_renderer_read_clip(renderer, clip);
        if (ui_rect_clip(rect, clip_rect) == CLIP_RESULT_DISCARD) return;
    }

    label->element.constraint.width = label->text_size.x * scale;
    label->element.constraint.height = label->text_size.y * scale;
    ui_constraint constraint = label->element.constraint;
    ui_constraint_scale(&constraint, scale);
    clip_rect = ui_constraint_layout(&constraint, rect);
    float2 text_origin = (float2){.x = clip_rect.x, .y = clip_rect.y};
    draw_glyph(renderer, layer_index, text_origin, &renderer->system_font, label->text, clip, scale, style);
}

u32 ui_label_locate_cursor(ui_label_t *label, ui_rect rect, float2 location) {
    f32 cursor_offset = ui_input_cursor_offset(label);
    f32 scale = label->scale;
    f32 text_width = label->text_size.x * scale;
    f32 text_height = label->text_size.y * scale;
    f32 text_x = rect.x + (rect.w - text_width) * 0.5f;
    f32 text_y = rect.y + (rect.h - text_height) * 0.5f;
    f32 text_left = text_x - cursor_offset;
    f32 text_right = text_x + text_width - cursor_offset;
    f32 text_top = text_y;
    f32 text_bottom = text_y + text_height;
    if (location.x < text_left) {
        return 0;
    } else if (location.x > text_right) {
        return label->text.length;
    } else {
        f32 cursor_x = location.x - text_left;
        int index = 0;
        while (index < label->text.length && cursor_x > label->char_offsets[index] * scale) {
            index++;
        }
        return index;
    }

}

f32 ui_input_cursor_offset(ui_label_t *label) {
    int text_length = label->text.length;
    int index = MACRO_CLAMP(label->cursor_index - 1, 0, text_length);
    return label->char_offsets[index] * label->scale;
}