#pragma once

#include "gpu/gpu_const.h"
#import <Metal/Metal.h>
#include <MetalKit/MetalKit.h>
#import <QuartzCore/CoreAnimation.h> 

void gpu_mtl_begin_frame(MTKView *view);
MTLPixelFormat _mtl_pixel_format(gpu_pixel_format fmt);
MTLTextureType _mtl_texture_type(gpu_texture_type type);
MTLLoadAction _mtl_load_action(gpu_load_action action);
MTLStoreAction _mtl_store_action(gpu_store_action action);
bool _mtl_stencil_enabled_format(gpu_pixel_format fmt);
