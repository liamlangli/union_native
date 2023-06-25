#include "simd.h"
#include "array.inl"

#include "os_window.h"
#include "foundation/render_system/render_system.h"
#include "foundation/os.h"
#include "script/script.h"

#include <string.h>

int main(int argc, char **argv) {
    printf("start creating context\n");
    script_context_t context = script->create_context();
    printf("context created\n");

    script_value_t value = script->eval(&context, "1 + 2", 5);
    printf("script eval successs.\n");
    printf("eval returns: %d\n", script->to_int(&context, value));

    render_system_init();

    rect_t window_rect = (rect_t){.x = 0.f, .y = 0.f, .w = 800, .h = 600 };
    window_t *window = platform_window_create("Hello World", window_rect);
    while(platform_window_update(window)) {
        render_system_present();
    }
    platform_window_destroy(window);


    return 0;
}
