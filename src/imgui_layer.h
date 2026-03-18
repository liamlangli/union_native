#pragma once

/**
 * imgui_layer — self-hosted URL address bar.
 *
 * Implemented entirely with the project's own native UI system
 * (ui_input, ui_button, fill_round_rect, ui_state, …).
 * No external ImGui dependency.
 */

#include "os/os.h"

#ifdef __cplusplus
extern "C" {
#endif

void imgui_layer_init(os_window_t *window);

/**
 * Build and draw the URL address bar for this frame.
 * Must be called BEFORE script_tick() so the native UI renderer
 * includes the bar in the same draw call flush.
 */
void imgui_layer_new_frame(os_window_t *window);

/**
 * No-op — rendering is flushed by ui_renderer_render() inside script_tick().
 * Kept so main.cpp call-sites do not need to change.
 */
void imgui_layer_render(void);

void imgui_layer_destroy(void);

#ifdef __cplusplus
}
#endif
