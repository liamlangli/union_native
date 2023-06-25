#ifndef _render_system_h_
#define _render_system_h_

#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#include "types.h"

typedef struct swapchain_o swapchain_o;

void render_system_init(void);

void* render_system_get_gpu_device(void);
swapchain_o* render_system_create_swapchain(GLFWwindow *window);

void render_system_present(void);

void render_system_terminate(void);

#endif
