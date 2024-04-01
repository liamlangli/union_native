#pragma once

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
    void *gpu_device;

    bool capture_required, capture_started;

    void *on_launch;
    void *on_frame;
    void *on_terminate;
} os_window_t;

extern void os_setup(int argc, char **argv);
extern void os_terminate();

typedef void(*os_on_launch)(os_window_t*);
typedef void(*os_on_frame)(os_window_t*);
typedef void(*os_on_terminate)(os_window_t*);

extern os_window_t* os_window_create(ustring title, int width, int height, os_on_launch on_launch, os_on_frame on_frame, os_on_terminate on_terminate);
extern void os_window_set_cursor(os_window_t *window, int cursor_type);
extern void os_window_close(os_window_t *window);
extern void os_window_capture_require(os_window_t *window);

extern void os_window_on_resize(os_window_t *window, int width, int height);

extern void os_window_set_clipboard(os_window_t *window, ustring_view text);
extern ustring os_window_get_clipboard(os_window_t *window);

extern bool os_file_exists(ustring path);
extern ustring os_cwd();
extern ustring os_get_bundle_path(ustring path);

extern void os_time_init();
extern long os_time();