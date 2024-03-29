#pragma once

#include "gpu/gpu_const.h"
#import <Metal/Metal.h>
#import <QuartzCore/CoreAnimation.h> 

typedef struct gpu_device_mtl_t {
    dispatch_semaphore_t sem;
    id<MTLDevice> device;
    id<MTLCommandQueue> cmd_queue;
    id<MTLCommandBuffer> cmd_buffer;
    id<MTLRenderCommandEncoder> cmd_encoder;
    id<CAMetalDrawable> cur_drawable;
    id<MTLBuffer> uniform_buffers[GPU_SWAP_BUFFER_COUNT];
} gpu_device_mtl_t;

MTLPixelFormat _gpu_mtl_pixel_format(gpu_pixel_format fmt);
MTLTextureType _gpu_mtl_texture_type(gpu_texture_type type);
