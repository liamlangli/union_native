#include "metal_backend.h"

#import <Metal/Metal.h>
#import <QuartzCore/CAMetalLayer.h>

#import "foundation/os.h"   

typedef struct metal_device_t {
    id<MTLDevice> gpu;
    id<MTLCommandQueue> queue;
    CAMetalLayer *swapchain;
} metal_device_t;

typedef struct metal_swapchain_t {
    NSWindow *nswindow;
    CAMetalLayer *layer;
} metal_swapchain_t;

static metal_device_t *g_metal_device;

typedef struct metal_library_t {
    id<MTLLibrary> library;
} metal_library_t;

metal_device_t* metal_create_default_device(void) {
    const id<MTLDevice> device = MTLCreateSystemDefaultDevice();
    const id<MTLCommandQueue> queue = [device newCommandQueue];
    CAMetalLayer *swapchain = [CAMetalLayer layer];
    swapchain.device = device;
    swapchain.opaque = YES;

    metal_device_t *metal_device = (metal_device_t*)malloc(sizeof(metal_device_t));
    metal_device->gpu = device;
    metal_device->queue = queue;
    metal_device->swapchain = swapchain;
    g_metal_device = metal_device;
    return metal_device;
}

void metal_destroy_device(metal_device_t* device) {
    free(device);
}

metal_swapchain_t* metal_create_swapchain(metal_device_t* device, GLFWwindow* native_window) {
    metal_swapchain_t *swapchain = (metal_swapchain_t*)malloc(sizeof(metal_swapchain_t));
    swapchain->layer = g_metal_device->swapchain;
    NSWindow *nswindow = glfwGetCocoaWindow(native_window);
    nswindow.contentView.layer = g_metal_device->swapchain;
    nswindow.contentView.wantsLayer = YES;
    swapchain->nswindow = nswindow;
    return swapchain;
}

void metal_delete_swapchain(metal_swapchain_t* swapchain) {
    free(swapchain);
}

metal_library_t* metal_create_library_from_source(metal_device_t* device, const char* filename)
{
    // char *source = os_read_file(filename);
    void *source = NULL;
    u64 size = 0;
    if (!os_api->file_system->read_file(filename, &source, &size)) {
        return NULL;
    }

    // load metallib from data
    NSError *error = nil;
    dispatch_data_t data = dispatch_data_create(source, size, dispatch_get_main_queue(), DISPATCH_DATA_DESTRUCTOR_DEFAULT);
    id<MTLLibrary> library = [g_metal_device->gpu newLibraryWithData:data error:&error];
    dispatch_release(data);
    free(source);
    if (error) {
        NSLog(@"Error compiling shader: %@", error.localizedDescription);
        return NULL;
    }

    metal_library_t *metal_library = (metal_library_t*)malloc(sizeof(metal_library_t));
    metal_library->library = library;
    return metal_library;
}

void metal_delete_library(metal_library_t* library) {
    free(library);
}

void metal_present(metal_swapchain_t *swapchain) {
    @autoreleasepool {
        id<CAMetalDrawable> surface = [swapchain->layer nextDrawable];

        MTLRenderPassDescriptor *pass = [MTLRenderPassDescriptor renderPassDescriptor];
        pass.colorAttachments[0].clearColor = MTLClearColorMake(1, 0, 0, 1);
        pass.colorAttachments[0].loadAction = MTLLoadActionClear;
        pass.colorAttachments[0].storeAction = MTLStoreActionStore;
        pass.colorAttachments[0].texture = surface.texture;

        id<MTLCommandBuffer> buffer = [g_metal_device->queue commandBuffer];
        id<MTLRenderCommandEncoder> encoder = [buffer renderCommandEncoderWithDescriptor:pass];
        [encoder endEncoding];
        [buffer presentDrawable:surface];
        [buffer commit];
    }
}
