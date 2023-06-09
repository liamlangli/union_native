#ifndef _window_h_
#define _window_h_

#include "types.h"

typedef struct window_t window_t;

enum OS_WINDOW_CURSOR {
    OS_WINDOW_CURSOR_DEFAULT,

    // Hovering over a link (hand).
    OS_WINDOW_CURSOR_POINTER,

    // Text selection cursor (I-beam).
    OS_WINDOW_CURSOR_TEXT,

    // Move cursor (4-way arrow).
    OS_WINDOW_CURSOR_MOVE,

    // Scroll in any direction.
    OS_WINDOW_CURSOR_ALL_SCROLL,

    // Resize column.
    OS_WINDOW_CURSOR_COL_RESIZE,

    // Resize row.
    OS_WINDOW_CURSOR_ROW_RESIZE,

    // Bidirectional resize.
    OS_WINDOW_CURSOR_EW_RESIZE,
    OS_WINDOW_CURSOR_NS_RESIZE,
    OS_WINDOW_CURSOR_NESW_RESIZE,
    OS_WINDOW_CURSOR_NWSE_RESIZE,

    // Drag cursors.
    OS_WINDOW_CURSOR_DRAG_AND_DROP,
    OS_WINDOW_CURSOR_DRAG_NO_DROP,

    // Hide the cursor.
    OS_WINDOW_CURSOR_HIDE,
};

enum OS_WINDOW_STYLE {
        // If set, the window position will be adjusted to center on screen.
    OS_WINDOW_STYLE_CENTERED = 1,

    // If set, the window will be created with a custom border that will follow the metrics
    // specified by the `set_border_metrics` function. If you don't provide custom metrics, the
    // window will have a default resize margin of 1 pixel, and no caption.
    OS_WINDOW_STYLE_CUSTOM_BORDER = 2,

    // If set, the window will ignore DPI scaling changes. If not set, the window will react to
    // system DPI scaling changes.
    //
    // (Note: Only Windows currently supports windows reacting to DPI scaling changes.)
    OS_WINDOW_STYLE_IGNORE_DPI_SCALING = 4,

    // If set, the window will be created without any border and reszing will be disabled.
    OS_WINDOW_STYLE_BORDERLESS = 8
};

extern window_t* platform_window_create(const char* title, rect_t rect);
extern void platform_window_update(window_t* window);
extern void platform_window_destroy(window_t* window);

#endif // _window_h_
