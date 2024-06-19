#pragma once

#include "foundation/udata.h"
#include "foundation/ustring.h"
#include "os/os.h"
#include "gpu_const.h"

typedef enum gpu_backend {
    none,
    webgl,
    webgpu,
    union_gpu,
} gpu_backend;

typedef struct gpu_texture { u32 id; } gpu_texture;
typedef struct gpu_sampler { u32 id; } gpu_sampler;
typedef struct gpu_buffer { u32 id; } gpu_buffer;
typedef struct gpu_shader { u32 id; } gpu_shader;
typedef struct gpu_pipeline { u32 id; } gpu_pipeline;
typedef struct gpu_binding { u32 id; } gpu_binding;
typedef struct gpu_render_pass { u32 id; } gpu_render_pass;
typedef struct gpu_mesh { u32 id; } gpu_mesh;
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
    gpu_attribute_format type;
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

typedef struct gpu_vertex_buffer_layout_state {
    int stride;
    gpu_vertex_step step_func;
    int step_rate;
} gpu_vertex_buffer_layout_state;

typedef struct gpu_vertex_attribute_state {
    int buffer_index;
    int offset;
    int size;
    gpu_attribute_format format;
} gpu_vertex_attribute_state;

typedef struct gpu_vertex_layout_state {
    gpu_vertex_buffer_layout_state buffers[GPU_VERTEX_BUFFER_COUNT];
    gpu_vertex_attribute_state attributes[GPU_ATTRIBUTE_COUNT];
} gpu_vertex_layout_state;

typedef struct gpu_stencil_face_state {
    gpu_compare_func compare_func;
    gpu_stencil_op fail_op;
    gpu_stencil_op pass_op;
    gpu_stencil_op depth_fail_op;
} gpu_stencil_face_state;

typedef struct gpu_stencil_state {
    bool enabled;
    gpu_stencil_face_state front;
    gpu_stencil_face_state back;
    u8 read_mask;
    u8 write_mask;
    u8 ref;
} gpu_stencil_state;

typedef struct gpu_depth_state {
    gpu_pixel_format format;
    gpu_compare_func compare_func;
    bool write_enabled;
    f32 bias, bias_slope_scale, bias_clamp;
} gpu_depth_state;

typedef struct gpu_blend_state {
    bool enabled;
    gpu_blend_factor src_factor;
    gpu_blend_factor dst_factor;
    gpu_blend_op op;
    gpu_blend_factor src_factor_alpha;
    gpu_blend_factor dst_factor_alpha;
    gpu_blend_op op_alpha;
} gpu_blend_state;

typedef struct gpu_color_target_state {
    gpu_pixel_format format;
    gpu_color_mask color_mask;
    gpu_blend_state blend;
} gpu_color_target_state;

typedef struct gpu_pipeline_desc {
    gpu_shader shader;
    gpu_vertex_layout_state layout;
    gpu_depth_state depth;
    gpu_stencil_state stencil;

    int color_count;
    gpu_color_target_state colors[GPU_ATTACHMENT_COUNT];

    gpu_primitive_type primitive_type;
    gpu_index_type index_type;
    gpu_cull_mode cull_mode;
    gpu_face_winding face_winding;

    int sample_count;
    gpu_color blend_color;
    bool alpha_to_coverage;
    ustring label;
} gpu_pipeline_desc;

typedef struct gpu_stage_binding {
    gpu_texture textures[GPU_SHADER_TEXTURE_COUNT];
    gpu_sampler samplers[GPU_SHADER_SAMPLER_COUNT];
} gpu_stage_binding;

typedef struct gpu_binding_texture_desc {
    gpu_texture texture;
    gpu_sampler sampler;
} gpu_binding_texture_desc;

typedef struct gpu_binding_desc {
    gpu_pipeline pipeline;
    gpu_buffer buffers[GPU_SHADER_BUFFER_COUNT];
    u32 buffer_offsets[GPU_SHADER_BUFFER_COUNT];
    gpu_binding_texture_desc textures[GPU_SHADER_TEXTURE_COUNT];
    u32 group;
    ustring label;
} gpu_binding_desc;

typedef struct gpu_mesh_desc {
    gpu_buffer buffers[GPU_VERTEX_BUFFER_COUNT];
    u32 buffer_offsets[GPU_VERTEX_BUFFER_COUNT];
    ustring buffers_names[GPU_VERTEX_BUFFER_COUNT];
    gpu_pipeline pipeline;
    gpu_buffer index_buffer;
    u32 index_buffer_offset;
    gpu_index_type index_type;
    ustring label;
} gpu_mesh_desc;

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

typedef struct gpu_attachment_desc {
    gpu_texture texture;
    int mip_level;
    int slice;
} gpu_attachment_desc;

typedef struct gpu_render_pass_color_attachment {
    gpu_attachment_desc desc;
    gpu_load_action load_action;
    gpu_store_action store_action;
    gpu_color clear_value;
} gpu_render_pass_color_attachment;

typedef struct gpu_render_pass_depth_stencil_attachment {
    gpu_attachment_desc desc;
    gpu_load_action load_action;
    gpu_store_action store_action;
    f32 clear_value;
    bool private;
} gpu_render_pass_depth_stencil_attachment;

typedef struct gpu_render_pass_desc {
    int width;
    int height;
    gpu_render_pass_color_attachment colors[GPU_ATTACHMENT_COUNT];
    gpu_render_pass_depth_stencil_attachment depth;
    gpu_render_pass_depth_stencil_attachment stencil;
    bool screen;
    ustring label;
    u32 id;
} gpu_render_pass_desc;

typedef struct gpu_pipeline_reflection {
    gpu_vertex_layout_state layout;
    gpu_uniform_desc global_uniforms[GPU_BLOCK_UNIFORM_COUNT];
    gpu_shader_uniform_block_desc uniform_blocks[GPU_BLOCK_UNIFORM_COUNT];
    gpu_shader_texture_desc textures[GPU_SHADER_TEXTURE_COUNT];
    gpu_index_type index_type;
} gpu_pipeline_reflection;

bool gpu_request_device(os_window_t *window);
void gpu_destroy_device(void);

gpu_texture gpu_create_texture(gpu_texture_desc *desc);
gpu_sampler gpu_create_sampler(gpu_sampler_desc *desc);
gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc);
gpu_shader gpu_create_shader(gpu_shader_desc *desc);
gpu_pipeline gpu_create_pipeline(gpu_pipeline_desc *desc);
gpu_binding gpu_create_binding(gpu_binding_desc *desc);
gpu_mesh gpu_create_mesh(gpu_mesh_desc *desc);
gpu_render_pass gpu_create_render_pass(gpu_render_pass_desc *desc);

void gpu_destroy_texture(gpu_texture texture);
void gpu_destroy_sampler(gpu_sampler sampler);
void gpu_destroy_buffer(gpu_buffer buffer);
void gpu_destroy_shader(gpu_shader shader);
void gpu_destroy_pipeline(gpu_pipeline pipeline);
void gpu_destroy_binding(gpu_binding binding);
void gpu_destroy_mesh(gpu_mesh mesh);
void gpu_destroy_render_pass(gpu_render_pass pass);

gpu_pipeline_reflection gpu_pipeline_get_reflection(gpu_pipeline pipeline);
void gpu_update_texture(gpu_texture texture, udata data);
void gpu_update_buffer(gpu_buffer buffer, udata data);

void gpu_begin_render_pass(gpu_render_pass pass);
void gpu_set_viewport(int x, int y, int width, int height);
void gpu_set_scissor(int x, int y, int width, int height);
void gpu_set_pipeline(gpu_pipeline pipeline);
void gpu_set_binding(gpu_binding binding);
void gpu_set_mesh(gpu_mesh mesh);
void gpu_draw(int base, int count, int instance_count);
void gpu_end_pass(void);
void gpu_commit(void);

int gpu_pixel_format_row_count(gpu_pixel_format format, int height);
int gpu_pixel_format_size(gpu_pixel_format format);
int gpu_pixel_format_surface_pitch(gpu_pixel_format format, int width, int height, int row_alignment);
int gpu_pixel_format_row_pitch(gpu_pixel_format format, int width, int row_alignment);
