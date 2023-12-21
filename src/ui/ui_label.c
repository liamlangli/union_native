#include "ui/ui_component.h"
#include "ui/ui_renderer.h"
#include "ui/ui_draw.h"

void ui_label_init(ui_label_t *label, ustring text) {
    label->text = text;
    label->element.id = ui_id_create();
    label->element.constraint.alignment = CENTER;
    ui_label_update_text(label, text);
}

void ui_label_update_text(ui_label_t *label, ustring text) {
    ui_font *sys_font = ui_font_system_font();
    ui_font_compute_size_and_offset(sys_font, text, label->char_offsets);
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