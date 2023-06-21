#ifndef _metal_backend_h_
#define _metal_backend_h_

#if defined(OS_OSX)
#define GLFW_INCLUDE_NONE
#define GLFW_EXPOSE_NATIVE_COCOA
#include <GLFW/glfw3.h>
#include <GLFW/glfw3native.h>

#include "global.h"
#include "types.h"

typedef struct metal_device_t metal_device_t;
typedef struct metal_pipeline_t metal_pipeline_t;
typedef struct metal_render_pass_t metal_render_pass_t;
typedef struct metal_compute_pass_t metal_compute_pass_t;

metal_device_t* metal_create_default_device(void);
GLFWwindow* metal_create_window(const char* title, rect_t rect);

#endif // OS_OSX
#endif
