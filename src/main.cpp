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

// ---------------------------------------------------------------------------
// Lifecycle callbacks (called from the platform OS layer)
// ---------------------------------------------------------------------------

extern "C" void on_launch(os_window_t *window) {
    logger_init(logger_global());

    // Initialise the script runtime (sets up ui_renderer, ui_state, etc.)
    // No URL is loaded yet — the user enters one via the address bar.
    script_init(window);

    // Native URL address bar (built on the project's own UI system, no ImGui)
    imgui_layer_init(window);

}

extern "C" void on_frame(os_window_t *window) {
    (void)window;

    WGPUColor clear_color = {0.1, 0.1, 0.1, 1.0};
    if (!webgpu_begin_frame(WGPULoadOp_Clear, WGPUStoreOp_Store, clear_color)) {
        return;
    }

    // Build the ImGui URL bar for this frame
    imgui_layer_new_frame(window);

    // Execute loaded script
    script_tick();

    // Flush ImGui draw data into the active render pass
    imgui_layer_render();

    webgpu_end_frame();
}

extern "C" void on_terminate(os_window_t *window) {
    imgui_layer_destroy();
    script_cleanup();
    script_terminate();
    webgpu_context_shutdown();
    logger_destroy(logger_global());
    os_window_close(window);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

int main(int argc, char **argv) {
    const int window_width  = 1280;
    const int window_height = 800;
    static i8 window_title[] = "union native";

    os_setup(argc, argv);
    os_window_create(
        window_title,
        window_width, window_height,
        on_launch, on_frame, on_terminate);
    return 0;
}
