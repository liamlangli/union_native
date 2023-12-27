#include "ui_type.h"
#include <math.h>

static u32 ui_id = 0;
u32 ui_id_create() { return ui_id++; }

void ui_id_reset() { ui_id = 0; }

ui_rect ui_constraint_layout(ui_constraint *constraint, ui_rect parent) {
    ui_rect rect = (ui_rect){.x = 0.f, .y = 0.f, .w = constraint->width, .h = constraint->height};
    ui_margin margin = constraint->margin;
    u32 alignment = constraint->alignment;
    if (alignment & LEFT) {
        rect.x = parent.x + margin.left;
    }
    if (alignment & BOTTOM) {
        rect.y = parent.y + parent.h - rect.h - margin.bottom;
    }
    if (alignment & RIGHT) {
        rect.x = parent.x + parent.w - rect.w - margin.right;
    }
    if (alignment & TOP) {
        rect.y = parent.y + margin.top;
    }
    if (alignment & CENTER_VERTICAL) {
        rect.y = parent.y + fmaxf((parent.h - rect.h) * 0.5f, 0.f);
    }
    if (alignment & CENTER_HORIZONTAL) {
        rect.x = parent.x + fmaxf((parent.w - rect.w) * 0.5f, 0.f);
    }

    return rect;
}