#pragma once

#include "foundation/global.h"
#include "ui/ui_state.h"
#include "ui/ui_type.h"

enum DEVTOOL_TAB {
    DEVTOOL_CONSOLE,
    DEVTOOL_NETWORK,
    DEVTOOL_MEMORY,
    DEVTOOL_GRAPHICS
};

typedef struct ui_dev_tool_t {
    int snap_align; // ALIGNMENT
    int tab;
    bool visible;
    ui_rect rect;
    f64 width, height;
} ui_dev_tool_t;

void ui_dev_tool_init(ui_dev_tool_t* dev_tool);
void ui_dev_tool_set_visible(ui_dev_tool_t* dev_tool, bool visible);

void ui_dev_tool(ui_state_t *state, ui_dev_tool_t* dev_tool);