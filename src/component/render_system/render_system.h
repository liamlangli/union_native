#pragma once

#include "component/os_window/os_window.h"
#include "component/render_system/shader.h"
#include "foundation/types.h"

typedef struct swapchain_o swapchain_o;
typedef struct render_pass_o render_pass_o;
typedef struct shader_o shader_o;
typedef struct graphics_pipeline_o graphics_pipeline_o;
typedef struct compute_pipeline_o compute_pipeline_o;

struct render_system_api {
    void (*init)(void);
    void (*terminate)(void);

    swapchain_o* (*create_swapchain)(window_t *window);
    void (*present_swapchain)(swapchain_o *swapchain);
    void (*delete_swapchain)(swapchain_o *swapchain);

    render_pass_o* (*get_swapchain_render_pass)(swapchain_o *swapchain_o);
    render_pass_o* (*create_render_pass)(void);
    void (*delete_render_pass)(render_pass_o *pass);

    graphics_pipeline_o* (*create_graphics_pipline)(render_pass_o *pass, shader_t *shader);
    void (*delete_graphics_pipline)(graphics_pipeline_o *pipeline);
};

extern struct render_system_api *render_system;
