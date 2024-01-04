#include "foundation/foundation.h"
#include "script/script.h"

#define GLFW_INCLUDE_ES3
#include <GLFW/glfw3.h>
#include <GLES3/gl3.h>

#define STB_DS_IMPLEMENTATION
#include <stb_ds.h>

#include <uv.h>

int main(int argc, char** argv) {
    int window_width = 1080;
    int window_height = 720;
    logger_init(logger_global());

    os_window_t* window = os_window_create(ustring_STR("union_native"), window_width, window_height);
    script_context_init(window);
    ustring_view uri = argc >= 2 ? ustring_view_STR(argv[1]) : ustring_view_STR("public/index.js");
    script_eval_uri(uri);

    os_window_run_loop(window, script_context_loop_tick); // loop

    logger_destroy(logger_global());
    script_context_cleanup();
    script_context_terminate();

    os_window_close(window);
    return 0;
}
