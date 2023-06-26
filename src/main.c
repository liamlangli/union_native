#include "foundation/simd.h"
#include "foundation/array.inl"
#include "foundation/os.h"

#include "component/os_window/os_window.h"
#include "component/render_system/render_system.h"
#include "component/script/script.h"

#include <string.h>

int main(int argc, char **argv) {
    script_context_t context = script->create_context();
    script_value_t value = script->eval(&context, "1 + 2", 5);
    printf("eval 1 + 2 returns: %d\n", script->to_int(&context, value));

    render_system_init();
    rect_t window_rect = (rect_t){.x = 0.f, .y = 0.f, .w = 800, .h = 600 };
    window_t *window = platform_window_create("Hello World", window_rect);
    swapchain_o *swapchain = render_system_create_swapchain(window);
    while(platform_window_update(window)) {
        render_system_swapchain_present(swapchain);
    }
    platform_window_destroy(window);
    return 0;
}
