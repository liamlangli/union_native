#pragma once

#define GLFW_INCLUDE_ES3
#include <GLFW/glfw3.h>
#include <GLES3/gl3.h>

#include "foundation/global.h"
#include "foundation/ustring.h"

enum CURSOR_TYPE {
    CURSOR_Default = 0x00036001,
    CURSOR_Text = 0x00036002,
    CURSOR_ResizeH = 0x00036005,
    CURSOR_ResizeV = 0x00036006
};

typedef struct os_window_t {
    ustring title;
    int width;
    int height;
    int framebuffer_width;
    int framebuffer_height;

    f64 mouse_x, mouse_y;

    f64 display_ratio;
    f64 ui_scale;
    void* native_window;
} os_window_t;

extern os_window_t* os_window_create(ustring title, int width, int height);
extern void os_window_run_loop(os_window_t *window, void (*fn)(void));
extern void os_window_set_cursor(os_window_t *window, int cursor_type);
extern void os_window_close(os_window_t *window);

extern void os_window_tn_resize(os_window_t *window, int width, int height);

extern void os_window_set_clipboard(os_window_t *window, ustring_view text);
extern ustring os_window_get_clipboard(os_window_t *window);