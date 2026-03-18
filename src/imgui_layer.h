#pragma once

#include "os/os.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * imgui_layer — thin ImGui integration for the URL input bar.
 *
 * Provides a persistent input window where the user can type a web-page URL.
 * Pressing Enter (or clicking Load) feeds the URL into the script engine.
 *
 * All rendering is done with the imgui_impl_wgpu backend using the Dawn
 * device exposed by gpu_dawn_device() / gpu_dawn_queue().
 */

void imgui_layer_init(os_window_t *window);
void imgui_layer_new_frame(os_window_t *window);
void imgui_layer_render(void);
void imgui_layer_destroy(void);

/* Forward input events so ImGui can react to them */
void imgui_layer_on_mouse_move(float x, float y);
void imgui_layer_on_mouse_btn(int button, bool pressed);
void imgui_layer_on_scroll(float dx, float dy);
void imgui_layer_on_key(int key, bool pressed);
void imgui_layer_on_char(unsigned int c);

#ifdef __cplusplus
}
#endif
