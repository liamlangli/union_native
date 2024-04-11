#include "ui/ui_button.h"

void ui_button_init(ui_button_t *button, ustring_view text) {
    ui_label_init(&button->label, text);
    button->element.constraint.alignment = CENTER;
    button->element.id = ui_id_create();
    button->radiuses = (float4){.x = 3.f, .y = 3.f, .z = 3.f, .w = 3.f};
}

bool ui_button(ui_button_t *label, ui_style style, ui_rect rect, u32 layer_index, u32 clip) {
    bool result = false;

    return result;
}