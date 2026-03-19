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
WGPURenderPassEncoder webgpu_current_pass_encoder(void);

bool webgpu_begin_frame(WGPULoadOp load_op, WGPUStoreOp store_op, WGPUColor clear_color);
void webgpu_end_frame(void);

#ifdef __cplusplus
}
#endif