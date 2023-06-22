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
typedef struct metal_library_t metal_library_t;
typedef struct metal_render_pass_t metal_render_pass_t;
typedef struct metal_compute_pass_t metal_compute_pass_t;

metal_device_t* metal_create_default_device(void);
GLFWwindow* metal_create_window(const char* title, rect_t rect);

metal_library_t* metal_create_library_from_source(metal_device_t* device, const char* source);


void metal_present(void);

#endif // OS_OSX
#endif
