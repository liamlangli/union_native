#include "ui/ui_label.h"
#include "ui/ui_renderer.h"
#include "ui/ui_draw.h"
#include "ui/ui_theme.h"

void ui_label_init(ui_label_t *label, ustring_view text) {
    ui_element_init(&label->element);
    label->text = text;
    label->scale = 1.0f;
    label->cursor_index = 0;
    label->start_index = 0;
    label->render_selected = false;
    memset(label->char_offsets, 0, MAX_CHAR_LENGTH);
    ui_label_compute_size_and_offset(label);
    label->cursor_index = (int)label->text.length;
    label->text_style = ui_theme_shared()->text;
}

void ui_label_update_text(ui_label_t *label, ustring_view text) {
    if (ustring_view_equals(&label->text, &text)) return;
    label->text = text;
    ui_label_compute_size_and_offset(label);
}

void ui_label_compute_size_and_offset(ui_label_t *label) {
    ui_font *sys_font = ui_font_shared();
    label->text_size = ui_font_compute_size_and_offset(sys_font, label->text, label->char_offsets);
    label->cursor_index = MACRO_MIN(label->cursor_index, (int)label->text.length);
    label->start_index = MACRO_MIN(label->start_index, (int)label->text.length);
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

f32 ui_label_offset_at(ui_label_t *label, int index) {
    if (index <= 0) return 0.f;
    int text_length = (int)label->text.length;
    index = MACRO_CLAMP(index - 1, 0, text_length);
    return label->char_offsets[index] * label->scale;
}

f32 ui_label_cursor_offset(ui_label_t *label) {
    return ui_label_offset_at(label, label->cursor_index);
}

void ui_label(ui_label_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip) {
    if (label->text.length == 0) return;
    ui_rect clip_rect;

    f32 scale = label->scale;

    if (clip != 0) {
        clip_rect = ui_layer_read_clip(layer_index, clip);
        if (ui_rect_clip(rect, clip_rect) == CLIP_RESULT_DISCARD) return;
    }

    float2 origin = ui_label_text_origin(label, rect);
    if (label->render_selected) {
        ui_rect selection_rect = rect;
        int s = label->start_index;
        int c = label->cursor_index;
        selection_rect.x = origin.x + ui_label_offset_at(label, MACRO_MIN(s, c));
        selection_rect.w = ui_label_offset_at(label, MACRO_MAX(s, c)) - selection_rect.x + origin.x;
        selection_rect.y = origin.y;
        selection_rect.h = label->text_size.y;
        fill_rect(layer_index, ui_theme_shared()->text_selected, selection_rect, clip);
    }

    draw_glyph(layer_index, origin, ui_font_shared(), label->text, clip, scale, label->text_style);
}