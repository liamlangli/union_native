#include "ui_type.h"

static u32 ui_id = 0;
u32 ui_id_create() {
    return ui_id++;
}

void ui_id_reset() {
    ui_id = 0;
}
