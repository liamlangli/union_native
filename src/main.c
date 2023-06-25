#include "simd.h"
#include "array.inl"

#include "os_window.h"
#include "foundation/render_system/render_system.h"
#include "foundation/os.h"


int main(int argc, char **argv) {
    render_system_init();

    rect_t window_rect = (rect_t){.x = 0.f, .y = 0.f, .w = 800, .h = 600 };
    window_t *window = platform_window_create("Hello World", window_rect);
    while(platform_window_update(window)) {
        render_system_present();
    }

    platform_window_destroy(window);
    return 0;
}
