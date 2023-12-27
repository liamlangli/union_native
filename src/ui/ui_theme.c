#include "ui/ui_theme.h"

static ui_theme_t system_theme;

ui_theme_t *ui_theme_system_share() {
    static bool initialized = false;
    if (initialized) return &system_theme;
    initialized = true;
    system_theme.panel_0 = ui_style_from_hex(0x28292aab, 0x2b2c2dab, 0x313233ab, 0xe1e1e166);
    system_theme.panel_1 = ui_style_from_hex(0x414243ff, 0x4a4b4cff, 0x515253ff, 0xe1e1e166);
    system_theme.panel_2 = ui_style_from_hex(0x474849ff, 0x515253ff, 0x6c6d6eff, 0xe1e1e166);
    system_theme.panel_3 = ui_style_from_hex(0x505152ff, 0x575859ff, 0x6c6d6eff, 0xe1e1e166);
    system_theme.text = ui_style_from_hex(0xe1e1e1ff, 0xe1e1e1ff, 0xe1e1e1ff, 0xe1e1e166);
    system_theme.transform_y = ui_style_from_hex(0x4dbe63ff, 0x313233ff, 0x3c3d3eff, 0x4dbe63ff);
    return &system_theme;
}