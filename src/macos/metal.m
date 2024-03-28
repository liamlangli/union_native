#include "gpu/gpu.h"

// see https://clang.llvm.org/docs/LanguageExtensions.html#automatic-reference-counting
#if !defined(__cplusplus)
    #if __has_feature(objc_arc) && !__has_feature(objc_arc_fields)
        #error "sokol_gfx.h requires __has_feature(objc_arc_field) if ARC is enabled (use a more recent compiler version)"
    #endif
#endif
#include <TargetConditionals.h>
#include <AvailabilityMacros.h>
#if defined(TARGET_OS_IPHONE) && !TARGET_OS_IPHONE
    #define _SG_TARGET_MACOS (1)
#else
    #define _SG_TARGET_IOS (1)
    #if defined(TARGET_IPHONE_SIMULATOR) && TARGET_IPHONE_SIMULATOR
        #define _SG_TARGET_IOS_SIMULATOR (1)
    #endif
#endif
#import <Metal/Metal.h>
#import <QuartzCore/CoreAnimation.h> // needed for CAMetalDrawable

typedef struct gpu_device_t {
    dispatch_semaphore_t sem;
    id<MTLDevice> device;
    id<MTLCommandQueue> cmd_queue;
    id<MTLCommandBuffer> cmd_buffer;
    id<MTLRenderCommandEncoder> cmd_encoder;
    id<CAMetalDrawable> cur_drawable;
    id<MTLBuffer> uniform_buffers[GPU_SWAP_BUFFER_COUNT];
} gpu_device_t;

gpu_device_t *gpu_create_device(os_window_t *window) {
    gpu_device_t *dev = (gpu_device_t*) malloc(sizeof(gpu_device_t));
    dev->sem = dispatch_semaphore_create(GPU_SWAP_BUFFER_COUNT);
    dev->device = MTLCreateSystemDefaultDevice();
    dev->cmd_queue = [dev->device newCommandQueue];
    dev->cmd_buffer = [dev->cmd_queue commandBuffer];
    dev->cmd_encoder = nil;
    dev->cur_drawable = nil;
    for (int i = 0; i < GPU_SWAP_BUFFER_COUNT; i++) {
        dev->uniform_buffers[i] = nil;
    }
    return dev;
}

void gpu_destroy_device(gpu_device_t *device) {
    for (int i = 0; i < GPU_SWAP_BUFFER_COUNT; i++) {
        if (device->uniform_buffers[i]) {
            [device->uniform_buffers[i] release];
        }
    }
    [device->cmd_encoder release];
    [device->cmd_buffer release];
    [device->cmd_queue release];
    [device->device release];
    dispatch_release(device->sem);
    free(device);
}

int _gpu_mtl_add_resource(id res) {
    int slot = -1;

    return slot;
}

MTLTextureType _gpu_mtl_texture_type(gpu_texture_type type) {
    switch (type) {
        case GPU_TEXTURE_2D: return MTLTextureType2D;
        case GPU_TEXTURE_CUBE: return MTLTextureTypeCube;
        case GPU_TEXTURE_3D: return MTLTextureType3D;
        case GPU_TEXTURE_ARRAY: return MTLTextureType2DArray;
        default: return MTLTextureType2D;
    }
}

MTLPixelFormat _gpu_mtl_pixel_format(gpu_pixel_format fmt) {
    switch (fmt) {
        case PIXELFORMAT_R8:                     return MTLPixelFormatR8Unorm;
        case PIXELFORMAT_R8SN:                   return MTLPixelFormatR8Snorm;
        case PIXELFORMAT_R8UI:                   return MTLPixelFormatR8Uint;
        case PIXELFORMAT_R8SI:                   return MTLPixelFormatR8Sint;
        case PIXELFORMAT_R16:                    return MTLPixelFormatR16Unorm;
        case PIXELFORMAT_R16SN:                  return MTLPixelFormatR16Snorm;
        case PIXELFORMAT_R16UI:                  return MTLPixelFormatR16Uint;
        case PIXELFORMAT_R16SI:                  return MTLPixelFormatR16Sint;
        case PIXELFORMAT_R16F:                   return MTLPixelFormatR16Float;
        case PIXELFORMAT_RG8:                    return MTLPixelFormatRG8Unorm;
        case PIXELFORMAT_RG8SN:                  return MTLPixelFormatRG8Snorm;
        case PIXELFORMAT_RG8UI:                  return MTLPixelFormatRG8Uint;
        case PIXELFORMAT_RG8SI:                  return MTLPixelFormatRG8Sint;
        case PIXELFORMAT_R32UI:                  return MTLPixelFormatR32Uint;
        case PIXELFORMAT_R32SI:                  return MTLPixelFormatR32Sint;
        case PIXELFORMAT_R32F:                   return MTLPixelFormatR32Float;
        case PIXELFORMAT_RG16:                   return MTLPixelFormatRG16Unorm;
        case PIXELFORMAT_RG16SN:                 return MTLPixelFormatRG16Snorm;
        case PIXELFORMAT_RG16UI:                 return MTLPixelFormatRG16Uint;
        case PIXELFORMAT_RG16SI:                 return MTLPixelFormatRG16Sint;
        case PIXELFORMAT_RG16F:                  return MTLPixelFormatRG16Float;
        case PIXELFORMAT_RGBA8:                  return MTLPixelFormatRGBA8Unorm;
        case PIXELFORMAT_SRGB8A8:                return MTLPixelFormatRGBA8Unorm_sRGB;
        case PIXELFORMAT_RGBA8SN:                return MTLPixelFormatRGBA8Snorm;
        case PIXELFORMAT_RGBA8UI:                return MTLPixelFormatRGBA8Uint;
        case PIXELFORMAT_RGBA8SI:                return MTLPixelFormatRGBA8Sint;
        case PIXELFORMAT_BGRA8:                  return MTLPixelFormatBGRA8Unorm;
        case PIXELFORMAT_RGB10A2:                return MTLPixelFormatRGB10A2Unorm;
        case PIXELFORMAT_RG11B10F:               return MTLPixelFormatRG11B10Float;
        case PIXELFORMAT_RGB9E5:                 return MTLPixelFormatRGB9E5Float;
        case PIXELFORMAT_RG32UI:                 return MTLPixelFormatRG32Uint;
        case PIXELFORMAT_RG32SI:                 return MTLPixelFormatRG32Sint;
        case PIXELFORMAT_RG32F:                  return MTLPixelFormatRG32Float;
        case PIXELFORMAT_RGBA16:                 return MTLPixelFormatRGBA16Unorm;
        case PIXELFORMAT_RGBA16SN:               return MTLPixelFormatRGBA16Snorm;
        case PIXELFORMAT_RGBA16UI:               return MTLPixelFormatRGBA16Uint;
        case PIXELFORMAT_RGBA16SI:               return MTLPixelFormatRGBA16Sint;
        case PIXELFORMAT_RGBA16F:                return MTLPixelFormatRGBA16Float;
        case PIXELFORMAT_RGBA32UI:               return MTLPixelFormatRGBA32Uint;
        case PIXELFORMAT_RGBA32SI:               return MTLPixelFormatRGBA32Sint;
        case PIXELFORMAT_RGBA32F:                return MTLPixelFormatRGBA32Float;
        case PIXELFORMAT_DEPTH:                  return MTLPixelFormatDepth32Float;
        case PIXELFORMAT_DEPTH_STENCIL:          return MTLPixelFormatDepth32Float_Stencil8;
        #if defined(OS_MACOS)
        case PIXELFORMAT_BC1_RGBA:               return MTLPixelFormatBC1_RGBA;
        case PIXELFORMAT_BC2_RGBA:               return MTLPixelFormatBC2_RGBA;
        case PIXELFORMAT_BC3_RGBA:               return MTLPixelFormatBC3_RGBA;
        case PIXELFORMAT_BC3_SRGBA:              return MTLPixelFormatBC3_RGBA_sRGB;
        case PIXELFORMAT_BC4_R:                  return MTLPixelFormatBC4_RUnorm;
        case PIXELFORMAT_BC4_RSN:                return MTLPixelFormatBC4_RSnorm;
        case PIXELFORMAT_BC5_RG:                 return MTLPixelFormatBC5_RGUnorm;
        case PIXELFORMAT_BC5_RGSN:               return MTLPixelFormatBC5_RGSnorm;
        case PIXELFORMAT_BC6H_RGBF:              return MTLPixelFormatBC6H_RGBFloat;
        case PIXELFORMAT_BC6H_RGBUF:             return MTLPixelFormatBC6H_RGBUfloat;
        case PIXELFORMAT_BC7_RGBA:               return MTLPixelFormatBC7_RGBAUnorm;
        case PIXELFORMAT_BC7_SRGBA:              return MTLPixelFormatBC7_RGBAUnorm_sRGB;
        #else
        case PIXELFORMAT_PVRTC_RGB_2BPP:         return MTLPixelFormatPVRTC_RGB_2BPP;
        case PIXELFORMAT_PVRTC_RGB_4BPP:         return MTLPixelFormatPVRTC_RGB_4BPP;
        case PIXELFORMAT_PVRTC_RGBA_2BPP:        return MTLPixelFormatPVRTC_RGBA_2BPP;
        case PIXELFORMAT_PVRTC_RGBA_4BPP:        return MTLPixelFormatPVRTC_RGBA_4BPP;
        case PIXELFORMAT_ETC2_RGB8:              return MTLPixelFormatETC2_RGB8;
        case PIXELFORMAT_ETC2_SRGB8:             return MTLPixelFormatETC2_RGB8_sRGB;
        case PIXELFORMAT_ETC2_RGB8A1:            return MTLPixelFormatETC2_RGB8A1;
        case PIXELFORMAT_ETC2_RGBA8:             return MTLPixelFormatEAC_RGBA8;
        case PIXELFORMAT_ETC2_SRGB8A8:           return MTLPixelFormatEAC_RGBA8_sRGB;
        case PIXELFORMAT_ETC2_RG11:              return MTLPixelFormatEAC_RG11Unorm;
        case PIXELFORMAT_ETC2_RG11SN:            return MTLPixelFormatEAC_RG11Snorm;
        case PIXELFORMAT_ASTC_4x4_RGBA:          return MTLPixelFormatASTC_4x4_LDR;
        case PIXELFORMAT_ASTC_4x4_SRGBA:         return MTLPixelFormatASTC_4x4_sRGB;
        #endif
        default: return MTLPixelFormatInvalid;
    }
}

gpu_texture gpu_create_texture(gpu_device_t *device, gpu_texture_desc *desc) {
    MTLTextureDescriptor *mtl_desc = [[MTLTextureDescriptor alloc] init];
    mtl_desc.textureType = _gpu_mtl_texture_type(desc->type);
    mtl_desc.pixelFormat = _gpu_mtl_pixel_format(desc->format);
    mtl_desc.width = (NSUInteger)desc->width;
    mtl_desc.height = (NSUInteger)desc->height;
    if (desc->type == GPU_TEXTURE_3D)
        mtl_desc.depth = (NSUInteger)desc->depth;
    else
        mtl_desc.arrayLength = (NSUInteger)desc->depth;
    mtl_desc.usage = MTLTextureUsageShaderRead;

    [device->device newTextureWithDescriptor: mtl_desc];
    return tex;
}