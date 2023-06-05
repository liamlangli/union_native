#include "simd.h"
#include "array.inl"

#include "window.h"

int main(int argc, char **argv) {
    window_t *window = platform_window_create("Hello World", 800, 600);
    platform_window_update(window);
    platform_window_destroy(window);
    return 0;
}
