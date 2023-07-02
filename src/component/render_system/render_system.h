#pragma once

#include "component/os_window/os_window.h"
#include "foundation/types.h"

typedef struct swapchain_o swapchain_o;
typedef struct render_pass_o render_pass_o;
typedef struct graphic_pipeline_o graphic_pipeline_o;
typedef struct compute_pipeline_o compute_pipeline_o;

void render_system_init(void);
swapchain_o* render_system_create_swapchain(window_t *window);
void render_system_delete_swapchain(swapchain_o *swapchain);
void render_system_swapchain_present(swapchain_o *swapchain);

graphic_pipeline_o *render_system_create_graphics_pipeline(render_pass_o *pass, rect_t viewport, char* vertex_source, const char* pixel_source);
void render_system_delete_graphics_pipeline(graphic_pipeline_o *pipeline);

void render_system_terminate(void);

