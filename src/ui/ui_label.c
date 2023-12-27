#include "ui/ui_label.h"
#include "ui/ui_renderer.h"
#include "ui/ui_draw.h"

void ui_label_init(ui_label_t *label, ustring_view text) {
    ui_element_init(&label->element);
    label->text = text;
    label->scale = 1.0f;
    label->cursor_index = 0;
    label->start_index = 0;
    label->render_selected = false;
    memset(label->char_offsets, 0, MAX_CHAR_LENGTH);
    ui_label_update_text(label, text);
}

void ui_label_update_text(ui_label_t *label, ustring_view text) {
    ui_font *sys_font = ui_font_system_font();
    label->text_size = ui_font_compute_size_and_offset(sys_font, text, label->char_offsets);
    label->text = text;
    label->cursor_index = text.length;
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

    draw_glyph(renderer, layer_index, ui_label_text_origin(label, rect), &renderer->system_font, label->text, clip, scale, style);
}

float2 ui_label_text_origin(ui_label_t *label, ui_rect rect) {
    f32 scale = label->scale;
    ui_constraint constraint = label->element.constraint;
    constraint.width = label->text_size.x * scale;
    constraint.height = label->text_size.y * scale;
    ui_constraint_scale(&constraint, scale);
    ui_rect clip_rect = ui_constraint_layout(&constraint, rect);
    return (float2){.x = clip_rect.x, .y = clip_rect.y};
}

u32 ui_label_locate_cursor(ui_label_t *label, ui_rect rect, float2 location) {
    if (label->text.length == 0) return 0;
    f32 scale = label->scale;

    float2 text_origin = ui_label_text_origin(label, rect);
    f32 relative_x = location.x - text_origin.x;

    int index = 0;
    while (index < label->text.length) {
        if (relative_x < label->char_offsets[index] * scale) break;
        index++;
    }

    return index;
}

f32 ui_input_cursor_offset(ui_label_t *label) {
    if (label->cursor_index <= 0) return 0.f;
    int text_length = label->text.length;
    int index = MACRO_CLAMP(label->cursor_index - 1, 0, text_length);
    return label->char_offsets[index] * label->scale;
}