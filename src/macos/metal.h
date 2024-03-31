#pragma once

#include "gpu/gpu_const.h"
#import <Metal/Metal.h>
#import <QuartzCore/CoreAnimation.h> 

typedef struct gpu_swapchain_mtl_t {
    int width, height, sample_count;
    gpu_pixel_format color_format;
    gpu_pixel_format depth_stencil_format;
    id<CAMetalDrawable> drawable;
    id<MTLTexture> color_texture;
    id<MTLTexture> depth_stencil_texture;
} gpu_swapchain_mtl_t;

typedef struct gpu_device_mtl_t {
    dispatch_semaphore_t semaphore;
    int frame_index, frame_swap_count;

    id<MTLDevice> device;
    id<MTLCommandQueue> cmd_queue;
    id<MTLCommandBuffer> cmd_buffer;
    id<MTLRenderCommandEncoder> cmd_encoder;
    id<CAMetalDrawable> cur_drawable;
    id<MTLBuffer> uniform_buffers[GPU_SWAP_BUFFER_COUNT];
} gpu_device_mtl_t;

MTLPixelFormat _gpu_mtl_pixel_format(gpu_pixel_format fmt);
MTLTextureType _gpu_mtl_texture_type(gpu_texture_type type);
