#include "gpu/gpu.h"

// see https://clang.llvm.org/docs/LanguageExtensions.html#automatic-reference-counting
#include <TargetConditionals.h>
#include <AvailabilityMacros.h>
#import <Metal/Metal.h>
#include <assert.h>
#include <stdlib.h>
#import <QuartzCore/CoreAnimation.h> // needed for CAMetalDrawable
#import "metal.h"

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
    gpu_swapchain_mtl_t swapchain;

    id<MTLDevice> device;
    id<MTLCommandQueue> cmd_queue;
    id<MTLCommandBuffer> cmd_buffer;
    id<MTLRenderCommandEncoder> cmd_encoder;
    id<CAMetalDrawable> cur_drawable;
    id<MTLBuffer> uniform_buffers[GPU_SWAP_BUFFER_COUNT];
} gpu_device_mtl_t;

typedef struct gpu_state_mtl_t {
    bool valid;
    int frame_index;
    gpu_device_mtl_t device;
} gpu_state_mtl_t;

static gpu_state_mtl_t _state;

bool gpu_request_device(os_window_t *window) {
    _state.device.semaphore = dispatch_semaphore_create(GPU_SWAP_BUFFER_COUNT);
    _state.device.device = MTLCreateSystemDefaultDevice();
    if (nil == _state.device.device) {
        _state.valid = false;
        return false;
    }
    _state.device.cmd_queue = [_state.device.device newCommandQueue];
    _state.device.cmd_buffer = nil;
    _state.device.cmd_encoder = nil;
    _state.device.cur_drawable = nil;
    _state.device.frame_index = 0;
    _state.device.frame_swap_count = GPU_SWAP_BUFFER_COUNT;
    for (int i = 0; i < GPU_SWAP_BUFFER_COUNT; i++) {
        _state.device.uniform_buffers[i] = nil;
    }
    return true;
}

void gpu_destroy_device() {
    for (int i = 0; i < GPU_SWAP_BUFFER_COUNT; i++) {
        if (_state.device.uniform_buffers[i]) {
            [_state.device.uniform_buffers[i] release];
        }
    }
    [_state.device.cmd_encoder release];
    [_state.device.cmd_buffer release];
    [_state.device.cmd_queue release];
    [_state.device.device release];
    dispatch_release(_state.device.semaphore);
}

int _mtl_add_resource(id res) {
    int slot = -1;
    return slot;
}
gpu_texture gpu_create_texture(gpu_texture_desc *desc) {
    assert(desc->width > 0);
    assert(desc->height > 0);
    MTLTextureDescriptor *mtl_desc = [[MTLTextureDescriptor alloc] init];
    mtl_desc.textureType = _mtl_texture_type(desc->type);
    mtl_desc.pixelFormat = _mtl_pixel_format(desc->format);
    mtl_desc.width = (NSUInteger)desc->width;
    mtl_desc.height = (NSUInteger)desc->height;
    if (desc->type == TEXTURE_3D)
        mtl_desc.depth = (NSUInteger)desc->depth;
    else
        mtl_desc.arrayLength = 1;
    mtl_desc.usage = MTLTextureUsageShaderRead;

    [_state.device.device newTextureWithDescriptor: mtl_desc];
    return (gpu_texture){ .id = 0 };
}

gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc) {
    assert(desc->size > 0);
    id<MTLBuffer> buffer = [_state.device.device newBufferWithLength: desc->size options: MTLResourceStorageModeShared];
    return (gpu_buffer){ .id = _mtl_add_resource(buffer) };
}

void gpu_mtl_begin_frame(MTKView *view) {
    _state.device.swapchain = (gpu_swapchain_mtl_t) {
        .width = (int) [view drawableSize].width,
        .height = (int) [view drawableSize].height,
        .sample_count = (int) [view sampleCount],
        .color_format = PIXELFORMAT_BGRA8,
        .depth_stencil_format = PIXELFORMAT_DEPTH_STENCIL,
        .drawable = [view currentDrawable],
        .color_texture = [view multisampleColorTexture],
        .depth_stencil_texture = [view depthStencilTexture],
    };
}

bool gpu_begin_pass(gpu_pass *pass) {
    assert(_state.device.cmd_encoder == nil);
    assert(_state.device.cur_drawable == nil);

    if (nil == _state.device.cmd_buffer) {
        dispatch_semaphore_wait(_state.device.semaphore, DISPATCH_TIME_FOREVER);
        _state.device.cmd_buffer = [_state.device.cmd_queue commandBuffer];
        [_state.device.cmd_buffer enqueue];
        [_state.device.cmd_buffer addCompletedHandler:^(id<MTLCommandBuffer> cmd_buf) {
            dispatch_semaphore_signal(_state.device.semaphore);
        }];
    }

    MTLRenderPassDescriptor *pass_desc = [MTLRenderPassDescriptor renderPassDescriptor];
    assert(pass_desc);
    gpu_attachments *attachments = &pass->attachments;
    if (true) {
        // render to screen
        gpu_swapchain_mtl_t *swapchain = &_state.device.swapchain;
        if (0 == swapchain->drawable) {
            return false;
        }

        _state.device.cur_drawable = swapchain->drawable;
        pass_desc.colorAttachments[0].texture = _state.device.cur_drawable.texture;
        pass_desc.colorAttachments[0].storeAction = MTLStoreActionStore;
        pass_desc.colorAttachments[0].loadAction = _mtl_load_action(pass->action.color_action[0].load_action);
        gpu_color c = pass->action.color_action[0].clear_value;
        pass_desc.colorAttachments[0].clearColor = MTLClearColorMake(c.r, c.g, c.b, c.a);

        if (swapchain->depth_stencil_texture) {
            pass_desc.depthAttachment.texture = swapchain->depth_stencil_texture;
            pass_desc.depthAttachment.storeAction = MTLStoreActionDontCare;
            pass_desc.depthAttachment.loadAction = _mtl_load_action(pass->action.depth_action.load_action);
            pass_desc.depthAttachment.clearDepth = pass->action.depth_action.clear_value;
            if (_mtl_stencil_enabled_format(swapchain->depth_stencil_format)) {
                pass_desc.stencilAttachment.texture = swapchain->depth_stencil_texture;
                pass_desc.stencilAttachment.storeAction = MTLStoreActionDontCare;
                pass_desc.stencilAttachment.loadAction = _mtl_load_action(pass->action.stencil_action.load_action);
                pass_desc.stencilAttachment.clearStencil = pass->action.stencil_action.clear_value;
            }
        }
    }

    _state.device.cmd_encoder = [_state.device.cmd_buffer renderCommandEncoderWithDescriptor: pass_desc];
    if (nil == _state.device.cmd_encoder) {
        return false;
    }

    return true;
}

void gpu_end_pass() {
    if (nil != _state.device.cmd_encoder) {
        [_state.device.cmd_encoder endEncoding];
        _state.device.cmd_encoder = nil;
    }

    if (nil != _state.device.cur_drawable) {
        [_state.device.cmd_buffer presentDrawable: _state.device.cur_drawable];
        _state.device.cur_drawable = nil;
    }
}

void gpu_commit() {
    assert(nil != _state.device.cmd_buffer);
    assert(nil == _state.device.cmd_encoder);

    [_state.device.cmd_buffer commit];
    _state.device.frame_index = (_state.device.frame_index + 1) % _state.device.frame_swap_count;
    _state.device.cmd_buffer = nil;
}