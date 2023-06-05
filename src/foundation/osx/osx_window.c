#include "osx_window.h"

window_t *platform_window_create(const char* title, i32 width, i32 height) {
    window_t *window = malloc(sizeof(window_t));
    window->title = string_str(title);
    window->width = width;
    window->height = height;
    window->native_handle = NULL;
    return window;
}

void platform_window_update(window_t *window) {

}

void platform_window_destroy(window_t *window) {
    free(window);
}