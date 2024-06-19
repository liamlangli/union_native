#include "foundation/api.h"
#include "os/os.h"
#include "script/api.h"
#include "gpu/gpu.h"

#define STB_DS_IMPLEMENTATION
#include <stb_ds.h>
#include <uv.h>

void on_launch(os_window_t* window) {
    logger_init(logger_global());
    script_context_init(window);
    ustring_view uri = ustring_view_from_ustring(ustring_STR("public/main.js"));
    script_eval_uri(uri);
}

// static gpu_pass pass = {
//     .action = {
//         .color_action = {
//             [0] = {
//                 .clear_value = (gpu_color){.r=0.21, .g=0.212, .b=0.223, .a=1}
//             }
//         },
//         .depth_action = {
//             .store_action = STORE_ACTION_DONTCARE
//         }
//     }
// };

void on_frame(os_window_t* window) {
    // gpu_begin_pass(&pass);
    script_context_loop_tick();
    gpu_end_pass();
    gpu_commit();
}

void on_terminate(os_window_t* window) {
    logger_destroy(logger_global());
    script_context_cleanup();
    script_context_terminate();
    os_window_close(window);
}

int main(int argc, char** argv) {
    int window_width = 1080;
    int window_height = 720;
    os_setup(argc, argv);
    os_window_create(ustring_STR("union_native"), window_width, window_height, on_launch, on_frame, on_terminate);
    return 0;
}
