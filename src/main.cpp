/**
 * main.cpp — application entry point (C++)
 *
 * Lifecycle:
 *   on_launch   — initialise logger, GPU render pass, and the ImGui URL bar.
 *   on_frame    — begin render pass → ImGui new-frame+render → script tick → end pass → commit.
 *   on_terminate — clean up script, ImGui, logger.
 */

#include "union.h"
#include "imgui_layer.h"

#define STB_DS_IMPLEMENTATION
#include <stb/stb_ds.h>

extern "C" {
#include <uv.h>
}

// ---------------------------------------------------------------------------
// Frame-level GPU render pass
// ---------------------------------------------------------------------------
static gpu_render_pass screen_pass;

// ---------------------------------------------------------------------------
// Lifecycle callbacks (called from the platform OS layer)
// ---------------------------------------------------------------------------

extern "C" void on_launch(os_window_t *window) {
    logger_init(logger_global());

    // ImGui URL bar — must be initialised after the GPU device is ready
    imgui_layer_init(window);

    // Main screen render pass
    gpu_render_pass_desc desc = {};
    desc.width                  = window->width;
    desc.height                 = window->height;
    desc.colors[0].clear_value  = (gpu_color){0.1f, 0.1f, 0.1f, 1.0f};
    desc.colors[0].load_action  = LOAD_ACTION_CLEAR;
    desc.colors[0].store_action = STORE_ACTION_STORE;
    desc.depth.clear_value      = 1.0f;
    desc.depth.load_action      = LOAD_ACTION_CLEAR;
    desc.depth.store_action     = STORE_ACTION_DONTCARE;
    desc.screen                 = true;
    screen_pass = gpu_create_render_pass(&desc);
}

extern "C" void on_frame(os_window_t *window) {
    gpu_begin_render_pass(screen_pass);

    // Build the ImGui URL bar for this frame
    imgui_layer_new_frame(window);

    // Execute loaded script
    script_tick();

    // Flush ImGui draw data into the active render pass
    imgui_layer_render();

    gpu_end_pass();
    gpu_commit();
}

extern "C" void on_terminate(os_window_t *window) {
    imgui_layer_destroy();
    logger_destroy(logger_global());
    script_cleanup();
    script_terminate();
    os_window_close(window);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

int main(int argc, char **argv) {
    const int window_width  = 1280;
    const int window_height = 800;

    os_setup(argc, argv);
    os_window_create(
        ustring_STR("union native"),
        window_width, window_height,
        on_launch, on_frame, on_terminate);
    return 0;
}
