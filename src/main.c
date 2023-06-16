#include "simd.h"
#include "array.inl"

#include "os_window.h"

int main(int argc, char **argv) {
    rect_t window_rect = (rect_t){.x = 0.f, .y = 0.f, .w = 800, .h = 600 };
    window_t *window = platform_window_create("Hello World", window_rect);
    while(!platform_window_update(window));
    platform_window_destroy(window);
    return 0;
}
