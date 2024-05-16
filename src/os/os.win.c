#include "os/os.h"

static os_window_t _window;

os_window_t* os_window_create(ustring title, int width, int height, os_on_launch on_launch, os_on_frame on_frame, os_on_terminate on_terminate) {
    return &_window;
}

void os_window_set_cursor(os_window_t *window, int cursor_type) {

}

void os_window_close(os_window_t *window) {

}

void os_window_capture_require(os_window_t *window) {

}

void os_window_set_clipboard(os_window_t *window, ustring_view text) {

}

ustring os_window_get_clipboard(os_window_t *window) {
    return ustring_NULL;
}