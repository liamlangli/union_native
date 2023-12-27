#pragma once

#include "ui/ui_type.h"

typedef struct ui_theme_t {
    ui_style panel_0;
    ui_style panel_1;
    ui_style panel_2;
    ui_style panel_3;
    ui_style text;
    ui_style text_selected;
    ui_style transform_y;
} ui_theme_t;

ui_theme_t *ui_theme_share();