#pragma once

#include "foundation/udata.h"
#include "foundation/ustring.h"
#include "os/os.h"
#include "gpu_const.h"

typedef struct gpu_texture { u32 id; } gpu_texture;
typedef struct gpu_sampler { u32 id; } gpu_sampler;
typedef struct gpu_buffer { u32 id; } gpu_buffer;
typedef struct gpu_shader { u32 id; } gpu_shader;
typedef struct gpu_pipeline { u32 id; } gpu_pipeline;
typedef struct gpu_attachments { u32 id; } gpu_attachments;
typedef struct gpu_color { f32 r, g, b, a; } gpu_color;

typedef struct gpu_texture_desc {
    int width, height, depth;
    udata data;
    gpu_pixel_format format;
    gpu_texture_type type;
} gpu_texture_desc;

typedef struct gpu_sampler_desc {
    gpu_filter min_filter, mag_filter, mip_filter;
    gpu_wrap wrap_u, wrap_v, wrap_w;
    float min_lod;
    float max_lod;
    gpu_compare_func compare_func;
    u32 max_anisotropy;
    ustring label;
} gpu_sampler_desc;

typedef struct gpu_buffer_desc {
    int size;
    udata data;
    gpu_buffer_type type;
} gpu_buffer_desc;

typedef struct gpu_attribute_desc {
    ustring name;
    gpu_attribute_type type;
    int size;
    int stride;
} gpu_attribute_desc;

typedef struct gpu_uniform_desc {
    ustring name;
    gpu_uniform_type type;
    int size;
} gpu_uniform_desc;

typedef struct gpu_shader_uniform_block_desc {
    int size;
    ustring name;
    gpu_uniform_layout layout;
    gpu_uniform_desc uniforms[GPU_BLOCK_UNIFORM_COUNT];
} gpu_shader_uniform_block_desc;

typedef struct gpu_shader_texture_desc {
    bool used;
    gpu_texture_type type;
    gpu_texture_sample_type sample_type;
} gpu_shader_texture_desc;

typedef struct gpu_shader_sampler_desc {
    bool used;
    gpu_sampler_type type;
} gpu_shader_sampler_desc;

typedef struct gpu_shader_texture_sampler_mapping {
    bool used;
    int texture_slot;
    int sampler_slot;
} gpu_shader_texture_sampler_mapping;

typedef struct gpu_shader_stage_desc {
    ustring source;
    udata bytecode;
    ustring entry;
    gpu_shader_uniform_block_desc blocks[GPU_BLOCK_COUNT];
    gpu_shader_texture_desc textures[GPU_SHADER_TEXTURE_COUNT];
    gpu_shader_sampler_desc samplers[GPU_SHADER_SAMPLER_COUNT];
    gpu_shader_texture_sampler_mapping mappings[GPU_SHADER_TEXTURE_COUNT];
} gpu_shader_stage_desc;

typedef struct gpu_shader_desc {
    gpu_attribute_desc attributes[GPU_ATTRIBUTE_COUNT];
    gpu_shader_stage_desc vertex;
    gpu_shader_stage_desc fragment;
    ustring label;
} gpu_shader_desc;

typedef struct gpu_pipeline_desc {
    gpu_primitive_type primitive_type;
    gpu_cull_mode cull_mode;
    gpu_face_winding face_winding;
    gpu_index_type index_type;
    gpu_shader shader;
} gpu_pipeline_desc;

typedef struct gpu_stage_binding {
    gpu_texture textures[GPU_SHADER_TEXTURE_COUNT];
    gpu_sampler samplers[GPU_SHADER_SAMPLER_COUNT];
} gpu_stage_binding;

typedef struct gpu_binding {
    gpu_buffer buffers[GPU_ATTRIBUTE_COUNT];
    int buffer_offsets[GPU_ATTRIBUTE_COUNT];
    gpu_buffer index_buffer;
    int index_buffer_offset;
    gpu_stage_binding vertex;
    gpu_stage_binding fragment;
} gpu_binding;

typedef struct gpu_color_attachment_action {
    gpu_load_action load_action;
    gpu_store_action store_action;
    gpu_color clear_value;
} gpu_color_attachment_action;

typedef struct gpu_depth_attachment_action {
    gpu_load_action load_action;
    gpu_store_action store_action;
    f32 clear_value;
} gpu_depth_attachment_action;

typedef struct gpu_stencil_attachment_action {
    gpu_load_action load_action;
    gpu_store_action store_action;
    u8 clear_value;
} gpu_stencil_attachment_action;

typedef struct gpu_pass_action {
    gpu_color_attachment_action color_action[GPU_ATTACHMENT_COUNT];
    gpu_depth_attachment_action depth_action;
    gpu_stencil_attachment_action stencil_action;
} gpu_pass_action;

typedef struct gpu_pass {
    gpu_pass_action action;
    gpu_attachments attachments;
} gpu_pass;

bool gpu_request_device(os_window_t *window);
void gpu_destroy_device();

gpu_texture gpu_create_texture(gpu_texture_desc *desc);
gpu_texture gpu_create_sampler(gpu_sampler_desc *desc);
gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc);
gpu_pipeline gpu_create_pipeline(gpu_pipeline_desc *desc);

bool gpu_begin_pass(gpu_pass *pass);
void gpu_end_pass();
void gpu_commit();