#include "gpu/gpu.h"

// see https://clang.llvm.org/docs/LanguageExtensions.html#automatic-reference-counting
#include <TargetConditionals.h>
#include <AvailabilityMacros.h>
#import <Metal/Metal.h>
#import <QuartzCore/CoreAnimation.h> // needed for CAMetalDrawable
#import "metal.h"

gpu_device_t *gpu_create_device(os_window_t *window) {
    gpu_device_mtl_t *device = (gpu_device_mtl_t*) malloc(sizeof(gpu_device_mtl_t));
    device->sem = dispatch_semaphore_create(GPU_SWAP_BUFFER_COUNT);
    device->device = MTLCreateSystemDefaultDevice();
    device->cmd_queue = [device->device newCommandQueue];
    device->cmd_buffer = [device->cmd_queue commandBuffer];
    device->cmd_encoder = nil;
    device->cur_drawable = nil;
    for (int i = 0; i < GPU_SWAP_BUFFER_COUNT; i++) {
        device->uniform_buffers[i] = nil;
    }
    return (gpu_device_t*)device;
}

void gpu_destroy_device(gpu_device_t *device) {
    gpu_device_mtl_t *mtl_device = (gpu_device_mtl_t*)device;
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
    free(device);
}

int _gpu_mtl_add_resource(id res) {
    int slot = -1;
    return slot;
}
gpu_texture gpu_create_texture(gpu_device_t *device, gpu_texture_desc *desc) {
    gpu_device_mtl_t *mtl_device = (gpu_device_mtl_t*)device;
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

gpu_buffer gpu_create_buffer(gpu_device_t *device, gpu_buffer_desc *desc) {
    assert(desc->size > 0);
    gpu_device_mtl_t *mtl_device = (gpu_device_mtl_t*)device;
    id<MTLBuffer> buffer = [mtl_device->device newBufferWithLength: desc->size options: MTLResourceStorageModeShared];
    return (gpu_buffer){ .id = _gpu_mtl_add_resource(buffer) };
}
