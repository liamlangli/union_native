#include "gpu/gpu.h"
#include "foundation/logger.h"
#include "gpu/gpu_const.h"

// see https://clang.llvm.org/docs/LanguageExtensions.html#automatic-reference-counting
#include <Foundation/Foundation.h>
#include <TargetConditionals.h>
#include <AvailabilityMacros.h>
#import <Metal/Metal.h>
#include <objc/objc.h>
#include <assert.h>
#include <stdlib.h>
#import <QuartzCore/CoreAnimation.h> // needed for CAMetalDrawable
#import "metal.h"

typedef struct gpu_shader_mtl_t {
    id<MTLLibrary> vertex_lib;
    id<MTLLibrary> fragment_lib;
    id<MTLFunction> vertex_func;
    id<MTLFunction> fragment_func;
} gpu_shader_mtl_t;

typedef struct gpu_texture_mtl_t {
    id<MTLTexture> texture;
} gpu_texture_mtl_t;

typedef struct gpu_buffer_mtl_t {
    id<MTLBuffer> buffer;
} gpu_buffer_mtl_t;

typedef struct gpu_pipeline_mtl_t {
    id<MTLRenderPipelineState> pso;
    bool instanced;
} gpu_pipeline_mtl_t;

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
    id<MTLHeap> heap;
    id<MTLCommandQueue> cmd_queue;
    id<MTLCommandBuffer> cmd_buffer;
    id<MTLRenderCommandEncoder> cmd_encoder;
    id<CAMetalDrawable> cur_drawable;
    id<MTLBuffer> uniform_buffers[GPU_SWAP_BUFFER_COUNT];

    gpu_shader_mtl_t shaders[GPU_SHADER_POOL_SIZE];
    gpu_texture_mtl_t textures[GPU_TEXTURE_POOL_SIZE];
    gpu_buffer_mtl_t buffers[GPU_BUFFER_POOL_SIZE];
    gpu_pipeline_mtl_t pipelines[GPU_PIPELINE_POOL_SIZE];
} gpu_device_mtl_t;

typedef struct gpu_state_mtl_t {
    bool valid;
    int frame_index;
    gpu_device_mtl_t device;
} gpu_state_mtl_t;

static gpu_state_mtl_t _state;

#define _mtl_invalid_id 0
static int _mtl_shader_id = 1;
static int _mtl_texture_id = 1;
static int _mtl_buffer_id = 1;
static int _mtl_pipeline_id = 1;

int _mtl_add_texture(gpu_texture_mtl_t texture) {
    int id = _mtl_texture_id++;
    _state.device.textures[id] = texture;
    return id;
}

gpu_texture_mtl_t _mtl_get_texture(int id) { return _state.device.textures[id]; }

int _mtl_add_buffer(gpu_buffer_mtl_t buffer) {
    int id = _mtl_buffer_id++;
    _state.device.buffers[id] = buffer;
    return id;
}

gpu_buffer_mtl_t _mtl_get_buffer(int id) { return _state.device.buffers[id]; }

int _mtl_add_shader(gpu_shader_mtl_t shader) {
    int id = _mtl_shader_id++;
    _state.device.shaders[id] = shader;
    return id;
}

gpu_shader_mtl_t _mtl_get_shader(int id) { return _state.device.shaders[id]; }

int _mtl_add_pipeline(gpu_pipeline_mtl_t pipeline) {
    int id = _mtl_pipeline_id++;
    _state.device.pipelines[id] = pipeline;
    return id;
}

gpu_pipeline_mtl_t _mtl_get_pipeline(int id) { return _state.device.pipelines[id]; }

bool gpu_request_device(os_window_t *window) {
    _state.device.semaphore = dispatch_semaphore_create(GPU_SWAP_BUFFER_COUNT);
    _state.device.device = MTLCreateSystemDefaultDevice();

    if (nil == _state.device.device) {
        _state.valid = false;
        return false;
    }

    uint slot_count = GPU_SWAP_BUFFER_COUNT * (
        GPU_BUFFER_POOL_SIZE + 
        GPU_TEXTURE_POOL_SIZE + 
        GPU_PIPELINE_POOL_SIZE +
        GPU_SHADER_POOL_SIZE + 
        GPU_ATTACHMENTS_POOL_SIZE
    );

    _state.device.heap = nil;
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

    id<MTLTexture> texture = [_state.device.device newTextureWithDescriptor: mtl_desc];
    gpu_texture_mtl_t mtl_texture = (gpu_texture_mtl_t){ .texture = texture };
    return (gpu_texture){ .id = _mtl_add_texture(mtl_texture) };
}

gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc) {
    assert(desc->size > 0);
    id<MTLBuffer> buffer = [_state.device.device newBufferWithLength: desc->size options: MTLResourceStorageModeShared];
    gpu_buffer_mtl_t mtl_buffer = (gpu_buffer_mtl_t){ .buffer = buffer };
    return (gpu_buffer){ .id = _mtl_add_buffer(mtl_buffer) };
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

id<MTLLibrary> _mtl_library_from_bytecode(udata src) {
    NSError *err = nil;
    dispatch_data_t data = dispatch_data_create(src.data, src.length, nil, DISPATCH_DATA_DESTRUCTOR_DEFAULT);
    id<MTLLibrary> lib = [_state.device.device newLibraryWithData: data error: &err];
    if (nil == lib) {
        NSLog(@"Error: %@", err);
        NSLog(@"Source: %s", [err.localizedDescription UTF8String]);
    }
    [data release];
    return lib;
}

id<MTLLibrary> _mtl_library_from_code(ustring src) {
    NSError *err = nil;
    id<MTLLibrary> lib = [_state.device.device
        newLibraryWithSource: [NSString stringWithUTF8String: src.data]
        options: nil
        error: &err];
    if (nil == lib) {
        NSLog(@"Error: %@", err);
        NSLog(@"Source: %s", [err.localizedDescription UTF8String]);
    }
    return lib;
}

gpu_shader gpu_create_shader(gpu_shader_desc *desc) {
    id<MTLLibrary> vertex_lib = nil;
    id<MTLLibrary> fragment_lib = nil;
    id<MTLFunction> vertex_func = nil;
    id<MTLFunction> fragment_func = nil;

    if (desc->vertex.bytecode.length > 0 && desc->fragment.bytecode.length > 0) {
        vertex_lib = _mtl_library_from_bytecode(desc->vertex.bytecode);
        fragment_lib = _mtl_library_from_bytecode(desc->fragment.bytecode);
        if (nil == vertex_lib || nil == fragment_lib) {
            goto failed;
        }
        vertex_func = [vertex_lib newFunctionWithName: [NSString stringWithUTF8String: desc->vertex.entry.data]];
        fragment_func = [fragment_lib newFunctionWithName: [NSString stringWithUTF8String:desc->fragment.entry.data]];
    } else if (desc->vertex.source.length > 0 && desc->fragment.source.length > 0) {
        vertex_lib = _mtl_library_from_code(desc->vertex.source);
        fragment_lib = _mtl_library_from_code(desc->fragment.source);
        if (nil == vertex_lib || nil == fragment_lib) {
            goto failed;
        }
        vertex_func = [vertex_lib newFunctionWithName: [NSString stringWithUTF8String: desc->vertex.entry.data]];
        fragment_func = [fragment_lib newFunctionWithName: [NSString stringWithUTF8String:desc->fragment.entry.data]];
    } else {
        goto failed;
    }

    if (nil == vertex_func) {
        ULOG_ERROR("Failed to create vertex function");
        goto failed;
    }

    if (nil == fragment_func) {
        ULOG_ERROR("Failed to create fragment function");
        goto failed;
    }

    gpu_shader_mtl_t mtl_shader = (gpu_shader_mtl_t){
        .vertex_lib = vertex_lib,
        .fragment_lib = fragment_lib,
        .vertex_func = vertex_func,
        .fragment_func = fragment_func,
    };
    return (gpu_shader){.id = _mtl_add_shader(mtl_shader)};

failed:
    if (vertex_lib) [vertex_lib release];
    if (fragment_lib) [fragment_lib release];
    if (vertex_func) [vertex_func release];
    if (fragment_func) [fragment_func release];
    return (gpu_shader){ .id = _mtl_invalid_id };
}

gpu_pipeline gpu_create_pipeline(gpu_pipeline_desc *desc) {
    MTLVertexDescriptor *vertex_desc = [MTLVertexDescriptor vertexDescriptor];
    gpu_pipeline_mtl_t mtl_pipeline;
    for (NSUInteger attr_index = 0; attr_index < GPU_ATTRIBUTE_COUNT; ++attr_index) {
        const gpu_vertex_attribute_state *attr_state = &desc->layout.attributes[attr_index];
        if (attr_state->format == ATTRIBUTE_FORMAT_INVALID) {
            break;
        }
        assert(attr_state->buffer_index < GPU_VERTEX_BUFFER_COUNT);
        vertex_desc.attributes[attr_index].format = _mtl_vertex_format(attr_state->format, attr_state->size);
        vertex_desc.attributes[attr_index].offset = attr_state->offset;
        vertex_desc.attributes[attr_index].bufferIndex = attr_state->buffer_index;
    }

    for (NSUInteger buffer_index = 0; buffer_index < GPU_VERTEX_BUFFER_COUNT; ++buffer_index) {
        const gpu_vertex_buffer_layout_state *buffer_state = &desc->layout.buffers[buffer_index];
        assert(buffer_state->stride > 0);
        vertex_desc.layouts[buffer_index].stride = buffer_state->stride;
        vertex_desc.layouts[buffer_index].stepRate = buffer_state->step_rate;
        vertex_desc.layouts[buffer_index].stepFunction = _mtl_vertex_step_function(buffer_state->step_func);
        // TODO: mark instanced drawing
        if (buffer_state->step_func == VERTEX_STEP_PER_INSTANCE) {
            mtl_pipeline.instanced = true;
        }
    }

    gpu_shader_mtl_t shader = _mtl_get_shader(desc->shader.id);
    MTLRenderPipelineDescriptor *pip_desc = [[MTLRenderPipelineDescriptor alloc] init];
    pip_desc.vertexDescriptor = vertex_desc;
    pip_desc.vertexFunction = shader.vertex_func;
    pip_desc.fragmentFunction = shader.fragment_func;
    pip_desc.rasterSampleCount = desc->sample_count;
    pip_desc.alphaToCoverageEnabled = desc->alpha_to_coverage;
    pip_desc.alphaToOneEnabled = NO;
    pip_desc.rasterizationEnabled = YES;
    pip_desc.depthAttachmentPixelFormat = _mtl_pixel_format(desc->depth.format);
    if (desc->depth.format == PIXELFORMAT_DEPTH_STENCIL) {
        pip_desc.depthAttachmentPixelFormat = _mtl_pixel_format(desc->depth.format);
    }

    for (NSUInteger i = 0; i < desc->color_count; ++i) {
        const gpu_color_target_state *color_state = &desc->colors[i];
        pip_desc.colorAttachments[i].pixelFormat = _mtl_pixel_format(color_state->format);
        pip_desc.colorAttachments[i].blendingEnabled = color_state->blend.enabled;
        pip_desc.colorAttachments[i].alphaBlendOperation = _mtl_blend_operation(color_state->blend.op_alpha);
        pip_desc.colorAttachments[i].rgbBlendOperation = _mtl_blend_operation(color_state->blend.op);
        pip_desc.colorAttachments[i].sourceRGBBlendFactor = _mtl_blend_factor(color_state->blend.src_factor);
        pip_desc.colorAttachments[i].destinationRGBBlendFactor = _mtl_blend_factor(color_state->blend.dst_factor);
        pip_desc.colorAttachments[i].sourceAlphaBlendFactor = _mtl_blend_factor(color_state->blend.src_factor_alpha);
        pip_desc.colorAttachments[i].destinationAlphaBlendFactor = _mtl_blend_factor(color_state->blend.dst_factor_alpha);
    }

    NSError *err = nil;
    id<MTLRenderPipelineState> pso = [_state.device.device newRenderPipelineStateWithDescriptor: pip_desc error: &err];
    if (nil == pso) {
        NSLog(@"Error: %@", err);
        NSLog(@"Source: %s", [err.localizedDescription UTF8String]);
        return (gpu_pipeline){ .id = _mtl_invalid_id };
    }
    mtl_pipeline.pso = pso;
    return (gpu_pipeline){ .id = _mtl_add_pipeline(mtl_pipeline) };
}
