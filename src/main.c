#include "union.h"

#define STB_DS_IMPLEMENTATION
#include <stb/stb_ds.h>
#include <uv.h>

static gpu_render_pass screen_pass;

void on_launch(os_window_t* window) {
    logger_init(logger_global());
    script_init(window);
    ustring_view uri = ustring_view_from_ustring(ustring_STR("http://127.0.0.1:3003/main.js"));
    script_eval_uri(uri);

    gpu_render_pass_desc desc;
    desc.width = window->width;
    desc.height = window->height;
    desc.colors[0].clear_value = (gpu_color){.r = 0.1, .g = 0.1, .b = 0.1, .a = 1.0 };
    desc.colors[0].load_action = LOAD_ACTION_CLEAR;
    desc.colors[0].store_action = STORE_ACTION_STORE;
    desc.depth.clear_value = 1;
    desc.depth.load_action = LOAD_ACTION_CLEAR;
    desc.depth.store_action = STORE_ACTION_DONTCARE;
    desc.screen = true;
    screen_pass = gpu_create_render_pass(&desc);
}

void on_frame(os_window_t* window) {
    gpu_begin_render_pass(screen_pass);
    script_tick();
    gpu_end_pass();
    gpu_commit();
}

void on_terminate(os_window_t* window) {
    logger_destroy(logger_global());
    script_cleanup();
    script_terminate();
    os_window_close(window);
}

int main(int argc, char** argv) {
    int window_width = 1080;
    int window_height = 720;
    os_setup(argc, argv);
    os_window_create(ustring_STR("union native"), window_width, window_height, on_launch, on_frame, on_terminate);
    return 0;
}
