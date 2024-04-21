#pragma once

#ifdef UI_NATIVE
#include "foundation/global.h"
#include "ui/ui_state.h"
#include "ui/ui_type.h"

enum DEVTOOL_TAB {
    DEVTOOL_CONSOLE,
    DEVTOOL_NETWORK,
    DEVTOOL_MEMORY,
    DEVTOOL_GRAPHICS,
    DEVTOOL_SOURCE,
    DEVTOOL_PERFORMANCE,
};

typedef struct ui_dev_tool_t {
    int snap_align; // ALIGNMENT
    int tab;
    bool visible;
    ui_rect rect;
    f64 width, height;
} ui_dev_tool_t;

UN_EXPORT void ui_dev_tool_init(ui_dev_tool_t* dev_tool);
UN_EXPORT void ui_dev_tool_set_visible(ui_dev_tool_t* dev_tool, bool visible);

UN_EXPORT void ui_dev_tool(ui_dev_tool_t* dev_tool);
#endif