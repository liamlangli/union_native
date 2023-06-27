#ifndef _metal_backend_h_
#define _metal_backend_h_

#if defined(OS_OSX)

#define GLFW_INCLUDE_NONE
#define GLFW_EXPOSE_NATIVE_COCOA
#include <GLFW/glfw3.h>
#include <GLFW/glfw3native.h>

#include "public/global.h"
#include "foundation/types.h"

typedef struct metal_device_t metal_device_t;
typedef struct metal_swapchain_t metal_swapchain_t;
typedef struct metal_pipeline_t metal_pipeline_t;
typedef struct metal_library_t metal_library_t;
typedef struct metal_render_pass_t metal_render_pass_t;
typedef struct metal_compute_pass_t metal_compute_pass_t;

metal_device_t* metal_create_default_device(void);
void metal_delete_device(metal_device_t* device);

metal_swapchain_t* metal_create_swapchain(metal_device_t* device, GLFWwindow* native_window);
void metal_delete_swapchain(metal_swapchain_t* swapchain);

metal_library_t* metal_create_library_from_source(metal_device_t* device, const char* filename);
void metal_delete_library(metal_library_t* library);

void metal_present(metal_swapchain_t* swapchain);

#endif // OS_OSX
#endif
