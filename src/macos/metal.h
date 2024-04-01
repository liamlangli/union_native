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
MTLPrimitiveType _mtl_primitive_type(gpu_primitive_type type);
MTLWinding _mtl_winding(gpu_face_winding winding);
MTLVertexFormat _mtl_vertex_format(gpu_attribute_format fmt, int size);
MTLVertexStepFunction _mtl_vertex_step_function(gpu_vertex_step step);
MTLBlendOperation _mtl_blend_operation(gpu_blend_op op);
MTLBlendFactor _mtl_blend_factor(gpu_blend_factor factor);

bool _mtl_stencil_enabled_format(gpu_pixel_format fmt);