#include "foundation/global.h"
#include "foundation/udata.h"
#include "gpu/gpu.h"
#include "foundation/logger.h"
#include "gpu/gpu_const.h"

#include <Foundation/Foundation.h>
#include <TargetConditionals.h>
#include <AvailabilityMacros.h>
#import <Metal/Metal.h>
#include <objc/objc.h>
#include <assert.h>
#include <stdlib.h>
#import <QuartzCore/CoreAnimation.h> // needed for CAMetalDrawable
#import "metal.h"

typedef struct gpu_shader_mtl {
    id<MTLLibrary> vertex_lib;
    id<MTLLibrary> fragment_lib;
    id<MTLFunction> vertex_func;
    id<MTLFunction> fragment_func;
} gpu_shader_mtl;

typedef struct gpu_texture_mtl {
    id<MTLTexture> texture;
    NSUInteger width, height, depth;
    gpu_pixel_format format;
    gpu_texture_type type;
    MTLResourceOptions resource_options;
} gpu_texture_mtl;

typedef struct gpu_sampler_mtl {
    id<MTLSamplerState> sampler;
    gpu_filter min_filter, mag_filter, mip_filter;
    gpu_wrap wrap_u, wrap_v, wrap_w;
} gpu_sampler_mtl;

typedef struct gpu_buffer_mtl {
    id<MTLBuffer> buffer;
    MTLResourceOptions options;
} gpu_buffer_mtl;

typedef struct gpu_mesh_mtl {
    gpu_buffer buffers[GPU_SHADER_BUFFER_COUNT];
    u32 buffer_offsets[GPU_SHADER_BUFFER_COUNT];
    gpu_buffer index_buffer;
    u32 index_buffer_offset;
} gpu_mesh_mtl;

typedef struct gpu_binding_buffer_desc_mtl {
    gpu_buffer buffer;
    u32 offset;
    u32 index;
} gpu_binding_buffer_desc_mtl;

typedef struct gpu_binding_texture_desc_mtl {
    gpu_texture texture;
    u32 index;
} gpu_binding_texture_desc_mtl;

typedef struct gpu_binding_mtl {
    u32 vertex_buffer_count;
    u32 fragment_buffer_count;
    u32 vertex_texture_count;
    u32 fragment_texture_count;
    gpu_binding_buffer_desc_mtl vertex_buffers[GPU_SHADER_BUFFER_COUNT];
    gpu_binding_buffer_desc_mtl fragment_buffers[GPU_SHADER_BUFFER_COUNT];
    gpu_binding_texture_desc_mtl vertex_textures[GPU_SHADER_TEXTURE_COUNT];
    gpu_binding_texture_desc_mtl fragment_textures[GPU_SHADER_TEXTURE_COUNT];
} gpu_binding_mtl;

typedef struct gpu_render_pass_mtl {
    MTLRenderPassDescriptor* desc;
    bool screen;
} gpu_render_pass_mtl;

typedef struct gpu_pipeline_mtl {
    id<MTLRenderPipelineState> pso;
    id<MTLDepthStencilState> dso;
    MTLRenderPipelineReflection* reflection;
    bool instanced, indexed;

    MTLPrimitiveType primitive_type;
    MTLIndexType index_type;
    MTLCullMode cull_mode;
    MTLWinding winding;
    MTLPixelFormat depth_stencil_format;
    u32 stencil_ref;
} gpu_pipeline_mtl;

typedef struct gpu_pass_mtl {
    int width, height;
} gpu_pass_mtl;

typedef struct gpu_swapchain_mtl {
    int width, height, sample_count;
    gpu_pixel_format color_format;
    gpu_pixel_format depth_stencil_format;
    id<MTLTexture> color_texture;
    id<MTLTexture> depth_stencil_texture;
} gpu_swapchain_mtl;

typedef struct gpu_device_mtl {
    id<MTLDevice> device;
} gpu_device_mtl;

typedef struct gpu_state_mtl {
    bool valid;
    int frame_index;
    gpu_device_mtl device;
    dispatch_semaphore_t semaphore;

    gpu_swapchain_mtl swapchain;

    gpu_pipeline_mtl cur_pipeline;
    gpu_render_pass_mtl cur_render_pass;
    gpu_mesh_mtl cur_mesh;
    
    id<MTLCommandQueue> cmd_queue;
    id<MTLCommandBuffer> cmd_buffer;
    id<MTLRenderCommandEncoder> cmd_encoder;
    id<CAMetalDrawable> cur_drawable;
    
    gpu_shader_mtl shaders[GPU_RESOURCE_POOL_SIZE];
    gpu_texture_mtl textures[GPU_RESOURCE_POOL_SIZE];
    gpu_sampler_mtl samplers[GPU_RESOURCE_POOL_SIZE];
    gpu_buffer_mtl buffers[GPU_RESOURCE_POOL_SIZE];
    gpu_pipeline_mtl pipelines[GPU_RESOURCE_POOL_SIZE];
    gpu_binding_mtl bindings[GPU_RESOURCE_POOL_SIZE];
    gpu_mesh_mtl meshes[GPU_RESOURCE_POOL_SIZE];
    gpu_render_pass_mtl render_passes[GPU_RESOURCE_POOL_SIZE];
    
    u32 shader_count;
    u32 texture_count;
    u32 sampler_count;
    u32 buffer_count;
    u32 pipeline_count;
    u32 binding_count;
    u32 mesh_count;
    u32 render_pass_count;

} gpu_state_mtl;

static gpu_state_mtl _state = {0};

bool gpu_request_device(os_window_t *window) {
    _state.semaphore = dispatch_semaphore_create(1);
    _state.device.device = MTLCreateSystemDefaultDevice();

    if (nil == _state.device.device) {
        _state.valid = false;
        return false;
    }

    _state.cmd_queue = [_state.device.device newCommandQueue];
    _state.cmd_buffer = nil;
    _state.cmd_encoder = nil;
    _state.cur_drawable = nil;
    _state.frame_index = 0;
    
    _state.shader_count = 1;
    _state.texture_count = 1;
    _state.sampler_count = 1;
    _state.buffer_count = 1;
    _state.pipeline_count = 1;
    _state.binding_count = 1;
    _state.mesh_count = 1;
    _state.render_pass_count = 1;
    
    return true;
}

void gpu_destroy_device() {
#ifndef ENABLE_ARC
    [_state.cmd_encoder release];
    [_state.cmd_buffer release];
    [_state.cmd_queue release];
    [_state.device.device release];
    dispatch_release(_state.semaphore);
#endif
}

gpu_texture gpu_create_texture(gpu_texture_desc *desc) {
    assert(desc->width > 0);
    assert(desc->height > 0);
    MTLTextureDescriptor *_desc = [MTLTextureDescriptor new];
    _desc.textureType = _mtl_texture_type(desc->type);
    _desc.pixelFormat = _mtl_pixel_format(desc->format);
    _desc.width = (NSUInteger)desc->width;
    _desc.height = (NSUInteger)desc->height;
    if (desc->type == TEXTURE_3D)
        _desc.depth = (NSUInteger)desc->depth;
    else
        _desc.arrayLength = 1;
    
    _desc.resourceOptions = _mtl_resource_options(desc->resource_usage);
    _desc.usage = MTLTextureUsageShaderRead;

    id<MTLTexture> texture = [_state.device.device newTextureWithDescriptor: _desc];
    gpu_texture_mtl _texture = (gpu_texture_mtl){
        .texture = texture,
        .width = _desc.width,
        .height = _desc.height,
        .depth = _desc.depth,
        .format = desc->format,
        .type = desc->type,
        .resource_options = _desc.resourceOptions,
    };

    _state.textures[_state.texture_count] = _texture;
    gpu_texture result = { .id = _state.texture_count++ };

    if (desc->data.length > 0) {
        gpu_update_texture(result, desc->data);
    }

    return result;
}

void gpu_update_texture(gpu_texture texture, udata data) {
    gpu_texture_mtl _texture = _state.textures[texture.id];
    int width = (int)_texture.width;
    int height = (int)_texture.height;
    gpu_pixel_format format = _texture.format;

    int bytes_per_row = 0;
    int bytes_per_slice = 0;
    if (!_mtl_pixel_format_is_pvrtc(format)) {
        bytes_per_row = gpu_pixel_format_row_pitch(format, width, 1);
        bytes_per_slice = gpu_pixel_format_surface_pitch(format, width, height, 1);
    }

    MTLRegion region;
    int bytes_per_image;
    if (_texture.type == TEXTURE_3D) {
        region = MTLRegionMake3D(0, 0, 0, width, height, _texture.depth);
        bytes_per_image = bytes_per_slice;
    } else {
        region = MTLRegionMake2D(0, 0, width, height);
        bytes_per_image = 0;
    }

    if (_texture.resource_options & MTLResourceStorageModePrivate) {
        id<MTLBuffer> staging_buffer = [_state.device.device newBufferWithLength: data.length options: MTLResourceStorageModeShared];
        memcpy([staging_buffer contents], data.data, data.length);
        id<MTLCommandBuffer> cmd_buffer = [_state.cmd_queue commandBuffer];
        id<MTLBlitCommandEncoder> blit_encoder = [cmd_buffer blitCommandEncoder];
        [blit_encoder copyFromBuffer: staging_buffer
            sourceOffset: 0
            sourceBytesPerRow: bytes_per_row
            sourceBytesPerImage: bytes_per_image
            sourceSize: MTLSizeMake(width, height, _texture.depth)
            toTexture: _texture.texture
            destinationSlice: 0
            destinationLevel: 0
            destinationOrigin: MTLOriginMake(0, 0, 0)];
        [blit_encoder endEncoding];
        [cmd_buffer commit];
        [cmd_buffer waitUntilCompleted];
    } else {
        [_texture.texture replaceRegion: MTLRegionMake2D(0, 0, _texture.width, _texture.height)
            mipmapLevel: 0
            withBytes: data.data
            bytesPerRow: (NSUInteger)bytes_per_row];
    }
}

gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc) {
    assert(desc->size > 0);

    MTLResourceOptions options = _mtl_resource_options(desc->usage);
    if (desc->type == BUFFER_UNIFORM || desc->type == BUFFER_STORAGE || desc) {
        options = MTLResourceStorageModeShared;
        if (desc->type == BUFFER_UNIFORM) options |= MTLResourceCPUCacheModeWriteCombined;
    }

    id<MTLBuffer> buffer = [_state.device.device newBufferWithLength: desc->size options: options];
    gpu_buffer_mtl _buffer = (gpu_buffer_mtl){ .buffer = buffer, .options = options };
    _state.buffers[_state.buffer_count] = _buffer;
    return (gpu_buffer){ .id = _state.buffer_count++ };
}

void gpu_update_buffer(gpu_buffer buffer, udata data) {
    gpu_buffer_mtl _buffer = _state.buffers[buffer.id];
#if defined(OS_MACOS)
    memcpy([_buffer.buffer contents], data.data, data.length);
    if (_buffer.options & MTLResourceStorageModeManaged) {
        [_buffer.buffer didModifyRange: NSMakeRange(0, data.length)];
    }
#elif defined(OS_IOS)
    
#endif
}

bool ustring_match(ustring a, NSString *b) {
    if (a.length != b.length) return false;
    return strncmp(a.data, [b UTF8String], a.length) == 0;
}

i32 get_parameter_index(ustring a, MTLRenderPipelineReflection *reflection) {
    if (@available(iOS 16.0, *)) {
        for (u32 i = 0; i < reflection.vertexBindings.count; ++i) {
            id<MTLBinding> binding = reflection.vertexBindings[i];
            if (ustring_match(a, binding.name)) {
                return (i32)binding.index + 1;
            }
        }
        for (u32 i = 0; i < reflection.fragmentBindings.count; ++i) {
            
            id<MTLBinding> binding = reflection.fragmentBindings[i];
            if (ustring_match(a, binding.name)) {
                return - ((i32)binding.index + 1);
            }
        }
    }
    return 0;
}

gpu_binding gpu_create_binding(gpu_binding_desc *desc) {
    gpu_binding_mtl _binding = {0};
    gpu_pipeline_mtl pipeline = _state.pipelines[desc->pipeline.id];

    MTLRenderPipelineReflection *reflection = pipeline.reflection;
    for (i32 i = 0; GPU_SHADER_BUFFER_COUNT; ++i) {
        const gpu_binding_buffer_desc *buffer_state = &desc->buffers[i];
        if (buffer_state->buffer.id == 0) break;
        i32 index = get_parameter_index(buffer_state->name, reflection);
        if (index == 0) continue;
        gpu_binding_buffer_desc_mtl _desc = (gpu_binding_buffer_desc_mtl){.buffer = buffer_state->buffer, .offset = buffer_state->offset };
        if (index > 0) {
            _desc.index = (u32)(index - 1);
            _binding.vertex_buffers[_binding.vertex_buffer_count++] = _desc;
        } else {
            _desc.index = (u32)(-index - 1);
            _binding.fragment_buffers[_binding.fragment_buffer_count++] = _desc;
        }
    }

    for (i32 i = 0; GPU_SHADER_TEXTURE_COUNT; ++i) {
        const gpu_binding_texture_desc *texture_state = &desc->textures[i];
        if (texture_state->texture.id == 0) break;
        i32 index = get_parameter_index(texture_state->name, reflection);
        if (index == 0) continue;
        gpu_binding_texture_desc_mtl _desc = (gpu_binding_texture_desc_mtl){ .texture = texture_state->texture };
        if (index > 0) {
            _desc.index = (u32)(index - 1);
            _binding.vertex_textures[_binding.vertex_texture_count++] = _desc;
        } else {
            _desc.index = (u32)(-index - 1);
            _binding.fragment_textures[_binding.fragment_texture_count++] = _desc;
        }
    }

    _state.bindings[_state.binding_count] = _binding;
    return (gpu_binding){ .id = _state.binding_count++ };
}

gpu_mesh gpu_create_mesh(gpu_mesh_desc *desc) {
    gpu_mesh_mtl _mesh = {0};
    
    for (int i = 0; i < GPU_VERTEX_BUFFER_COUNT; ++i) {
        gpu_buffer buffer = desc->buffers[i];
        if (buffer.id == 0) break;
        _mesh.buffers[i] = buffer;
        _mesh.buffer_offsets[i] = desc->buffer_offsets[i];
    }

    if (desc->index_buffer.id != 0) {
        _mesh.index_buffer = desc->index_buffer;
        _mesh.index_buffer_offset = desc->index_buffer_offset;
    }
    
    _state.meshes[_state.mesh_count] = _mesh;
    return (gpu_mesh){ .id = _state.mesh_count++ };
}

gpu_render_pass gpu_create_render_pass(gpu_render_pass_desc *desc) {
    gpu_render_pass_mtl _pass;
    if (desc->screen) {
        MTLRenderPassDescriptor *pass_desc = [MTLRenderPassDescriptor new];
        pass_desc.colorAttachments[0].texture = _state.cur_drawable.texture;
        pass_desc.colorAttachments[0].storeAction = MTLStoreActionStore;
        pass_desc.colorAttachments[0].loadAction = _mtl_load_action(desc->colors[0].load_action);
        gpu_color c = desc->colors[0].clear_value;
        pass_desc.colorAttachments[0].clearColor = MTLClearColorMake(c.r, c.g, c.b, c.a);
    
        if (_state.swapchain.depth_stencil_texture) {
            pass_desc.depthAttachment.texture = _state.swapchain.depth_stencil_texture;
            pass_desc.depthAttachment.storeAction = MTLStoreActionStore;
            pass_desc.depthAttachment.loadAction = _mtl_load_action(desc->depth.load_action);
            pass_desc.depthAttachment.clearDepth = desc->depth.clear_value;
            if (_mtl_stencil_enabled_format(_state.swapchain.depth_stencil_format)) {
                pass_desc.stencilAttachment.texture = _state.swapchain.depth_stencil_texture;
                pass_desc.stencilAttachment.storeAction = MTLStoreActionStore;
                pass_desc.stencilAttachment.loadAction = _mtl_load_action(desc->stencil.load_action);
                pass_desc.stencilAttachment.clearStencil = desc->stencil.clear_value;
            }
        }
        _pass.screen = true;
        _pass.desc = pass_desc;
    } else {
        MTLRenderPassDescriptor *pass_desc = [MTLRenderPassDescriptor new];
        for (int i = 0; GPU_SHADER_TEXTURE_COUNT; ++i) {
            const gpu_render_pass_color_attachment *color = &desc->colors[i];
            if (color->desc.texture.id == 0) break;
            pass_desc.colorAttachments[i].texture = _state.textures[color->desc.texture.id].texture;
            pass_desc.colorAttachments[i].storeAction = MTLStoreActionStore;
            pass_desc.colorAttachments[i].loadAction = _mtl_load_action(color->load_action);
            gpu_color c = color->clear_value;
            pass_desc.colorAttachments[i].clearColor = MTLClearColorMake(c.r, c.g, c.b, c.a);
        }
        if (desc->depth.desc.texture.id == 0) {
            const gpu_texture_mtl depth_stencil_texture = _state.textures[desc->depth.desc.texture.id];
            pass_desc.depthAttachment.texture = depth_stencil_texture.texture;
            pass_desc.depthAttachment.storeAction = MTLStoreActionStore;
            pass_desc.depthAttachment.loadAction = _mtl_load_action(desc->depth.load_action);
            pass_desc.depthAttachment.clearDepth = desc->depth.clear_value;
            if (_mtl_stencil_enabled_format(depth_stencil_texture.format)) {
                pass_desc.stencilAttachment.texture = depth_stencil_texture.texture;
                pass_desc.stencilAttachment.storeAction = MTLStoreActionStore;
                pass_desc.stencilAttachment.loadAction = _mtl_load_action(desc->stencil.load_action);
                pass_desc.stencilAttachment.clearStencil = desc->stencil.clear_value;
            }
        }
        _pass.screen = false;
        _pass.desc = pass_desc;
    }

    _state.render_passes[_state.render_pass_count] = _pass;
    return (gpu_render_pass){ .id = _state.render_pass_count++ };
}

void gpu_mtl_begin_frame(MTKView *view) {
    _state.swapchain = (gpu_swapchain_mtl) {
        .width = (int) [view drawableSize].width,
        .height = (int) [view drawableSize].height,
        .sample_count = (int) [view sampleCount],
        .color_format = PIXELFORMAT_BGRA8,
        .depth_stencil_format = PIXELFORMAT_NONE,
        .color_texture = [view multisampleColorTexture],
        .depth_stencil_texture = [view depthStencilTexture],
    };
    
    dispatch_semaphore_wait(_state.semaphore, DISPATCH_TIME_FOREVER);
    _state.cmd_buffer = [_state.cmd_queue commandBuffer];
    [_state.cmd_buffer addCompletedHandler:^(id<MTLCommandBuffer> _) { dispatch_semaphore_signal(_state.semaphore); }];
    _state.cur_drawable = [view currentDrawable];
}

void gpu_begin_render_pass(gpu_render_pass pass) {
    assert(_state.cmd_encoder == nil);
    assert(_state.cur_drawable != nil);

    gpu_render_pass_mtl _pass = _state.render_passes[pass.id];
    if (_pass.screen) {
        _pass.desc.colorAttachments[0].texture = _state.cur_drawable.texture;
        _pass.desc.depthAttachment.texture = _state.swapchain.depth_stencil_texture;
        _pass.desc.depthAttachment.storeAction = MTLStoreActionDontCare;
    }
    _state.cmd_encoder = [_state.cmd_buffer renderCommandEncoderWithDescriptor: _pass.desc];
}

void gpu_end_pass() {
    if (nil != _state.cmd_encoder) {
        [_state.cmd_encoder endEncoding];
        _state.cmd_encoder = nil;
    }
}

void gpu_commit() {
    assert(nil != _state.cmd_buffer);
    assert(nil == _state.cmd_encoder);

    if (nil != _state.cur_drawable) {
        [_state.cmd_buffer presentDrawable: _state.cur_drawable];
        _state.cur_drawable = nil;
    }

    [_state.cmd_buffer commit];
    _state.cmd_buffer = nil;
}

id<MTLLibrary> _mtl_library_from_bytecode(udata src) {
    NSError *err = nil;
    dispatch_data_t data = dispatch_data_create(src.data, src.length, nil, DISPATCH_DATA_DESTRUCTOR_DEFAULT);
    id<MTLLibrary> lib = [_state.device.device newLibraryWithData: data error: &err];
    if (nil == lib) {
        NSLog(@"Error: %@", err);
        NSLog(@"Source: %s", [err.localizedDescription UTF8String]);
    }
#ifndef ENABLE_ARC
    dispatch_release(data);
#endif
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
#ifndef ENABLE_ARC
            if (vertex_lib) [vertex_lib release];
            if (fragment_lib) [fragment_lib release];
#endif
            return (gpu_shader){ .id = 0 };
        }
        vertex_func = [vertex_lib newFunctionWithName: [NSString stringWithUTF8String: desc->vertex.entry.data]];
        fragment_func = [fragment_lib newFunctionWithName: [NSString stringWithUTF8String:desc->fragment.entry.data]];
    } else if (desc->vertex.source.length > 0 && desc->fragment.source.length > 0) {
        vertex_lib = _mtl_library_from_code(desc->vertex.source);
        fragment_lib = _mtl_library_from_code(desc->fragment.source);
#ifndef ENABLE_ARC
        if (vertex_lib) [vertex_lib release];
        if (fragment_lib) [fragment_lib release];
#endif
        return (gpu_shader){ .id = 0 };
        vertex_func = [vertex_lib newFunctionWithName: [NSString stringWithUTF8String: desc->vertex.entry.data]];
        fragment_func = [fragment_lib newFunctionWithName: [NSString stringWithUTF8String:desc->fragment.entry.data]];
    } else {
        return (gpu_shader){ .id = 0 };
    }

    if (nil == vertex_func) {
        ULOG_ERROR("Failed to create vertex function");
#ifndef ENABLE_ARC
        if (vertex_func) [vertex_func release];
#endif
        return (gpu_shader){ .id = 0 };
    }

    if (nil == fragment_func) {
#ifndef ENABLE_ARC
        if (fragment_func) [fragment_func release];
#endif
        return (gpu_shader){ .id = 0 };
    }

    gpu_shader_mtl _shader = (gpu_shader_mtl){
        .vertex_lib = vertex_lib,
        .fragment_lib = fragment_lib,
        .vertex_func = vertex_func,
        .fragment_func = fragment_func,
    };
    
    _state.shaders[_state.shader_count] = _shader;
    return (gpu_shader){.id = _state.shader_count};
}

gpu_pipeline gpu_create_pipeline(gpu_pipeline_desc *desc) {
    MTLVertexDescriptor *vertex_desc = [MTLVertexDescriptor vertexDescriptor];
    gpu_pipeline_mtl _pipeline;
    bool vertex_buffer_enabled[GPU_VERTEX_BUFFER_COUNT];
    memset(vertex_buffer_enabled, 0, sizeof(vertex_buffer_enabled));
    for (NSUInteger attr_index = 0; attr_index < GPU_ATTRIBUTE_COUNT; ++attr_index) {
        const gpu_vertex_attribute_state *attr_state = &desc->layout.attributes[attr_index];
        if (attr_state->format == ATTRIBUTE_FORMAT_INVALID) {
            break;
        }
        assert(attr_state->buffer_index < GPU_VERTEX_BUFFER_COUNT);
        vertex_desc.attributes[attr_index].format = _mtl_vertex_format(attr_state->format, attr_state->size);
        vertex_desc.attributes[attr_index].offset = attr_state->offset;
        vertex_desc.attributes[attr_index].bufferIndex = attr_state->buffer_index;
        vertex_buffer_enabled[attr_state->buffer_index] = true;
    }

    for (NSUInteger buffer_index = 0; buffer_index < GPU_VERTEX_BUFFER_COUNT; ++buffer_index) {
        if (!vertex_buffer_enabled[buffer_index]) break;
        const gpu_vertex_buffer_layout_state *buffer_state = &desc->layout.buffers[buffer_index];
        assert(buffer_state->stride > 0);
        vertex_desc.layouts[buffer_index].stride = buffer_state->stride;
        vertex_desc.layouts[buffer_index].stepRate = buffer_state->step_rate;
        vertex_desc.layouts[buffer_index].stepFunction = _mtl_vertex_step_function(buffer_state->step_func);
        if (buffer_state->step_func == VERTEX_STEP_PER_INSTANCE) {
            _pipeline.instanced = true;
        }
    }

    gpu_shader_mtl shader = _state.shaders[desc->shader.id];
    MTLRenderPipelineDescriptor *pip_desc = [MTLRenderPipelineDescriptor new];
    pip_desc.vertexDescriptor = vertex_desc;
    pip_desc.vertexFunction = shader.vertex_func;
    pip_desc.fragmentFunction = shader.fragment_func;
    pip_desc.rasterSampleCount = desc->sample_count > 1 ? desc->sample_count : 1;
    pip_desc.alphaToCoverageEnabled = desc->alpha_to_coverage;
    pip_desc.alphaToOneEnabled = NO;
    pip_desc.rasterizationEnabled = YES;
    pip_desc.depthAttachmentPixelFormat = _mtl_pixel_format(desc->depth.format);
    if (desc->depth.format == PIXELFORMAT_DEPTH_STENCIL) {
        pip_desc.stencilAttachmentPixelFormat = _mtl_pixel_format(desc->depth.format);
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
    MTLRenderPipelineReflection *reflection = nil;
    id<MTLRenderPipelineState> pso = [_state.device.device newRenderPipelineStateWithDescriptor: pip_desc options: MTLPipelineOptionBindingInfo reflection: &reflection error: &err];
#ifndef ENABLE_ARC
    [pip_desc release];
#endif
    _pipeline.reflection = reflection;

    if (nil == pso) {
        NSLog(@"Error: %@", err);
        NSLog(@"Source: %s", [err.localizedDescription UTF8String]);
        return (gpu_pipeline){ .id = 0 };
    }
    _pipeline.pso = pso;
    
    if (desc->depth.format != PIXELFORMAT_NONE) {
        MTLDepthStencilDescriptor *ds_desc = [MTLDepthStencilDescriptor new];
        ds_desc.depthCompareFunction = _mtl_compare_function(desc->depth.compare_func);
        ds_desc.depthWriteEnabled = desc->depth.write_enabled;
        
        if (desc->stencil.enabled) {
            const gpu_stencil_state *stencil = &desc->stencil;
            ds_desc.backFaceStencil = [MTLStencilDescriptor new];
            ds_desc.backFaceStencil.stencilFailureOperation = _mtl_stencil_operation(stencil->back.fail_op);
            ds_desc.backFaceStencil.depthFailureOperation = _mtl_stencil_operation(stencil->back.depth_fail_op);
            ds_desc.backFaceStencil.depthStencilPassOperation = _mtl_stencil_operation(stencil->back.pass_op);
            ds_desc.backFaceStencil.stencilCompareFunction = _mtl_compare_function(stencil->back.compare_func);
            ds_desc.backFaceStencil.readMask = stencil->read_mask;
            ds_desc.backFaceStencil.writeMask = stencil->write_mask;
            ds_desc.frontFaceStencil = [MTLStencilDescriptor new];
            ds_desc.frontFaceStencil.stencilFailureOperation = _mtl_stencil_operation(stencil->front.fail_op);
            ds_desc.frontFaceStencil.depthFailureOperation = _mtl_stencil_operation(stencil->front.depth_fail_op);
            ds_desc.frontFaceStencil.depthStencilPassOperation = _mtl_stencil_operation(stencil->front.pass_op);
            ds_desc.frontFaceStencil.stencilCompareFunction = _mtl_compare_function(stencil->front.compare_func);
            ds_desc.frontFaceStencil.readMask = stencil->read_mask;
            ds_desc.frontFaceStencil.writeMask = stencil->write_mask;
        }
        id<MTLDepthStencilState> dso = [_state.device.device newDepthStencilStateWithDescriptor: ds_desc];
#ifndef ENABLE_ARC
        [ds_desc release];
#endif
        if (nil == dso) {
            return (gpu_pipeline){ .id = 0 };
        }
        _pipeline.dso = dso;
    }

    _pipeline.depth_stencil_format = _mtl_pixel_format(desc->depth.format);
    _pipeline.cull_mode = _mtl_cull_mode(desc->cull_mode);
    _pipeline.winding = _mtl_winding(desc->face_winding);
    _pipeline.primitive_type = _mtl_primitive_type(desc->primitive_type);
    _pipeline.index_type = _mtl_index_type(desc->index_type);
    _pipeline.indexed = desc->index_type != INDEX_NONE;
    _pipeline.stencil_ref = desc->stencil.ref;
    
    _state.pipelines[_state.pipeline_count] = _pipeline;
    return (gpu_pipeline){ .id = _state.pipeline_count++ };
}

void gpu_set_viewport(int x, int y, int width, int height) {
    assert(nil != _state.cmd_encoder);
    MTLViewport viewport = {
        .originX = (double)x,
        .originY = (double)y,
        .width = (double)width,
        .height = (double)height,
        .znear = 0.0,
        .zfar = 1.0,
    };
    [_state.cmd_encoder setViewport: viewport];
}

void gpu_set_scissor(int x, int y, int width, int height) {
    assert(nil != _state.cmd_encoder);
    MTLScissorRect scissor = {
        .x = x,
        .y = y,
        .width = width,
        .height = height,
    };
    [_state.cmd_encoder setScissorRect: scissor];
}

void gpu_set_pipeline(gpu_pipeline pipeline) {
    assert(nil != _state.cmd_encoder);

    gpu_pipeline_mtl _pipeline = _state.pipelines[pipeline.id];
    _state.cur_pipeline = _pipeline;

    [_state.cmd_encoder setCullMode: _pipeline.cull_mode];
    [_state.cmd_encoder setFrontFacingWinding: _pipeline.winding];
    [_state.cmd_encoder setRenderPipelineState: _pipeline.pso];
    if (_pipeline.depth_stencil_format != MTLPixelFormatInvalid) {
        [_state.cmd_encoder setDepthStencilState: _pipeline.dso];
    }
}

void gpu_set_binding(gpu_binding binding) {
    assert(nil != _state.cmd_encoder);
    gpu_binding_mtl _binding = _state.bindings[binding.id];

    for (int i = 0; i < _binding.vertex_buffer_count; ++i) {
        const gpu_binding_buffer_desc_mtl desc = _binding.vertex_buffers[i];
        gpu_buffer_mtl buffer = _state.buffers[desc.buffer.id];
        [_state.cmd_encoder setVertexBuffer: buffer.buffer offset: desc.offset atIndex: desc.index ];
    }

    for (int i = 0; i < _binding.fragment_buffer_count; ++i) {
        const gpu_binding_buffer_desc_mtl desc = _binding.fragment_buffers[i];
        gpu_buffer_mtl buffer = _state.buffers[desc.buffer.id];
        [_state.cmd_encoder setFragmentBuffer: buffer.buffer offset: desc.offset atIndex: desc.index];
    }

    for (int i = 0; i < _binding.vertex_texture_count; ++i) {
        const gpu_binding_texture_desc_mtl desc = _binding.vertex_textures[i];
        gpu_texture_mtl texture = _state.textures[desc.texture.id];
        [_state.cmd_encoder setVertexTexture: texture.texture atIndex: desc.index];
    }

    for (int i = 0; i < _binding.fragment_texture_count; ++i) {
        const gpu_binding_texture_desc_mtl desc = _binding.fragment_textures[i];
        gpu_texture_mtl texture = _state.textures[desc.texture.id];
        [_state.cmd_encoder setFragmentTexture: texture.texture atIndex: desc.index];
    }
}

void gpu_set_mesh(gpu_mesh mesh) {
    assert(nil != _state.cmd_encoder);

    gpu_mesh_mtl _mesh = _state.meshes[mesh.id];
    for (int i = 0; i < GPU_VERTEX_BUFFER_COUNT; ++i) {
        if (_mesh.buffers[i].id == 0) break;
        gpu_buffer_mtl buffer = _state.buffers[_mesh.buffers[i].id];
        NSUInteger offset = _mesh.buffer_offsets[i];
        [_state.cmd_encoder setVertexBuffer: buffer.buffer offset: offset atIndex: i];
    }
    
    _state.cur_mesh = _mesh;
}

void gpu_draw(int base, int count, int instance_count) {
    if (_state.cur_pipeline.indexed) {
        [_state.cmd_encoder
            drawIndexedPrimitives: _state.cur_pipeline.primitive_type
            indexCount: count
            indexType: _state.cur_pipeline.index_type
            indexBuffer: _state.buffers[_state.cur_mesh.index_buffer.id].buffer
            indexBufferOffset: 0
            instanceCount: instance_count];
    } else {
        [_state.cmd_encoder
            drawPrimitives: _state.cur_pipeline.primitive_type
            vertexStart: base
            vertexCount: count
            instanceCount: instance_count];
    }
}
