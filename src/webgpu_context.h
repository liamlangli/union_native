#pragma once

#include "os/os.h"

#include <webgpu/webgpu.h>

#ifdef __cplusplus
extern "C" {
#endif

bool webgpu_context_init(os_window_t *window);
void webgpu_context_shutdown(void);
void webgpu_context_resize(os_window_t *window);

WGPUDevice webgpu_device(void);
WGPUQueue webgpu_queue(void);
WGPUTextureFormat webgpu_surface_format(void);
WGPUTextureView webgpu_current_texture_view(void);

bool webgpu_begin_frame(void);
void webgpu_end_frame(void);

#ifdef __cplusplus
}
#endif
