#include "gpu/gpu.h"

// see https://clang.llvm.org/docs/LanguageExtensions.html#automatic-reference-counting
#include <TargetConditionals.h>
#include <AvailabilityMacros.h>
#import <Metal/Metal.h>
#include <stdlib.h>
#import <QuartzCore/CoreAnimation.h> // needed for CAMetalDrawable
#import "metal.h"

static gpu_device_mtl_t *mtl_device = nil;
bool gpu_request_device(os_window_t *window) {
    mtl_device = (gpu_device_mtl_t*) malloc(sizeof(gpu_device_mtl_t));
    mtl_device->sem = dispatch_semaphore_create(GPU_SWAP_BUFFER_COUNT);
    mtl_device->device = MTLCreateSystemDefaultDevice();
    mtl_device->cmd_queue = [mtl_device->device newCommandQueue];
    mtl_device->cmd_buffer = [mtl_device->cmd_queue commandBuffer];
    mtl_device->cmd_encoder = nil;
    mtl_device->cur_drawable = nil;
    for (int i = 0; i < GPU_SWAP_BUFFER_COUNT; i++) {
        mtl_device->uniform_buffers[i] = nil;
    }
    return true;
}

void gpu_destroy_device() {
    if (mtl_device == nil) return;
    for (int i = 0; i < GPU_SWAP_BUFFER_COUNT; i++) {
        if (mtl_device->uniform_buffers[i]) {
            [mtl_device->uniform_buffers[i] release];
        }
    }
    [mtl_device->cmd_encoder release];
    [mtl_device->cmd_buffer release];
    [mtl_device->cmd_queue release];
    [mtl_device->device release];
    dispatch_release(mtl_device->sem);
    free(mtl_device);
    mtl_device = nil;
}

int _gpu_mtl_add_resource(id res) {
    int slot = -1;
    return slot;
}
gpu_texture gpu_create_texture(gpu_texture_desc *desc) {
    assert(desc->width > 0);
    assert(desc->height > 0);
    MTLTextureDescriptor *mtl_desc = [[MTLTextureDescriptor alloc] init];
    mtl_desc.textureType = _gpu_mtl_texture_type(desc->type);
    mtl_desc.pixelFormat = _gpu_mtl_pixel_format(desc->format);
    mtl_desc.width = (NSUInteger)desc->width;
    mtl_desc.height = (NSUInteger)desc->height;
    if (desc->type == TEXTURE_3D)
        mtl_desc.depth = (NSUInteger)desc->depth;
    else
        mtl_desc.arrayLength = 1;
    mtl_desc.usage = MTLTextureUsageShaderRead;

    [mtl_device->device newTextureWithDescriptor: mtl_desc];
    return (gpu_texture){ .id = 0 };
}

gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc) {
    assert(desc->size > 0);
    id<MTLBuffer> buffer = [mtl_device->device newBufferWithLength: desc->size options: MTLResourceStorageModeShared];
    return (gpu_buffer){ .id = _gpu_mtl_add_resource(buffer) };
}
