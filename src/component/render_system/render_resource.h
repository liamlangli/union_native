#pragma once

#include "foundation/types.h"
#include "component/render_system/render_types.h"

typedef enum render_resource_type {
    RENDER_RESOURCE_TYPE_NONE,
    RENDER_RESOURCE_TYPE_BUFFER,
    RENDER_RESOURCE_TYPE_TEXTURE,
    RENDER_RESOURCE_TYPE_IMAGE,
    RENDER_RESOURCE_TYPE_IMAGE_VIEWS,
    RENDER_RESOURCE_TYPE_SAMPLER,
    RENDER_RESOURCE_TYPE_QUEUE_FENCE,
    RENDER_RESOURCE_TYPE_SHADER,
    RENDER_RESOURCE_TYPE_SHADER_STATE_OVERRIDE,
    RENDER_RESOURCE_TYPE_RESOURCE_BINDER,
    RENDER_RESOURCE_TYPE_BACK_BUFFER,
    RENDER_RESOURCE_TYPE_ACCELERATION_STRUCTURE,
    RENDER_RESOURCE_TYPE_RAY_TRACING_PIPELINE
} render_resource_type;

typedef enum render_buffer_usage_flags {
    RENDER_BUFFER_USAGE_UNIFORM = 0x1,
    RENDER_BUFFER_USAGE_STORAGE = 0x2,
    RENDER_BUFFER_USAGE_UPDATABLE = 0x4,
    RENDER_BUFFER_USAGE_UAV = 0x8,
    RENDER_BUFFER_USAGE_INDEX = 0x10,
    RENDER_BUFFER_USAGE_VERTEX = 0x20,
    RENDER_BUFFER_USAGE_INDIRECT = 0x40,
    RENDER_BUFFER_USAGE_ACCELERATION_STRUCTURE = 0x80,
} render_resource_usage_flags;

typedef struct render_buffer_desc_t {
    u32 size;
    render_buffer_usage_flags usage_flags;
    const char *tag;
} render_buffer_desc_t;

typedef enum render_image_usage_flags {
    RENDER_IMAGE_USAGE_RENDER_TARGET = 0x1,
    RENDER_IMAGE_USAGE_UAV = 0x2,
} render_image_usage_flags;

typedef enum render_image_type {
    RENDER_IMAGE_TYPE_1D,
    RENDER_IMAGE_TYPE_2D,
    RENDER_IMAGE_TYPE_3D,
    RENDER_IMAGE_TYPE_CUBE,
    RENDER_IMAGE_TYPE_MAX_VIEWS
} render_image_type;

typedef union render_clear_value_t {
    struct {
        f32 r;
        f32 g;
        f32 b;
        f32 a;
    } color;
    struct {
        f32 depth;
        u32 stencil;
    } depth_stencil;
} render_clear_value_t;

typedef struct render_image_desc_t {
    render_image_type type;
    render_image_usage_flags usage_flags;
    u32 format;
    u32 width;
    u32 height;
    u32 depth;
    u32 mip_levels;
    u32 layer_count;
    u32 sample_count;
    render_clear_value_t clear_value;
    MACRO_PAD(4);
    const char *tag;
} render_image_desc_t;

typedef struct render_image_view_t {
    u16 first_layer;
    u16 layer_count;
    u8 first_mip;
    u8 aspect : 4;
    u8 padding : 4;
    MACRO_PAD(1);
} render_image_view_t;

typedef struct render_shader_t {
    render_shader_blob_t tesselation_states;
    render_shader_blob_t vertex_states;
    render_shader_blob_t depth_stencil_states;
    render_shader_blob_t blend_states;
    render_shader_blob_t multi_sample_states;
    render_shader_blob_t stages[RENDER_SHADER_STAGE_MAX];
    const char *tag;
} render_shader_t;

typedef struct render_sampler_t {
    render_shader_blob_t sampler_states;
} render_sampler_t;

// ray tracing resources

typedef enum render_acceleration_structure_type {
    RENDER_ACCELERATION_STRUCTURE_TYPE_BOTTOM_LEVEL,
    RENDER_ACCELERATION_STRUCTURE_TYPE_TOP_LEVEL
} render_acceleration_structure_type;

typedef enum render_acceleration_structure_build_flags {
    RENDER_ACCELERATION_STRUCTURE_BUILD_FLAG_PREFER_FAST_TRACE = 0x1,
    RENDER_ACCELERATION_STRUCTURE_BUILD_FLAG_PREFER_FAST_BUILD = 0x2,
    RENDER_ACCELERATION_STRUCTURE_BUILD_FLAG_MINIMIZE_MEMORY = 0x4,
    RENDER_ACCELERATION_STRUCTURE_BUILD_FLAG_ALLOW_UPDATE = 0x8,
    RENDER_ACCELERATION_STRUCTURE_BUILD_FLAG_ALLOW_COMPACTION = 0x10,
} render_acceleration_structure_build_flags;

typedef enum render_geometry_type {
    RENDER_GEOMETRY_TYPE_TRIANGLES,
    RENDER_GEOMETRY_TYPE_AABBS
} render_geometry_type;

typedef enum render_geometry_flags {
    RENDER_GEOMETRY_FLAG_OPAQUE = 0x1,
    RENDER_GEOMETRY_FLAG_NO_DUPLICATE_ANYHIT_INVOCATION = 0x2
} render_geometry_flags;

typedef enum render_geometry_index_type {
    RENDER_GEOMETRY_INDEX_TYPE_NONE,
    RENDER_GEOMETRY_INDEX_TYPE_UINT16,
    RENDER_GEOMETRY_INDEX_TYPE_UINT32
} render_geometry_index_type;

typedef enum render_geometry_instance_flags {
    RENDER_GEOMETRY_INSTANCE_FLAG_TRIANGLE_CULL_DISABLE = 0x1,
    RENDER_GEOMETRY_INSTANCE_FLAG_TRIANGLE_FRONT_COUNTERCLOCKWISE = 0x2,
    RENDER_GEOMETRY_INSTANCE_FLAG_FORCE_OPAQUE = 0x4,
    RENDER_GEOMETRY_INSTANCE_FLAG_FORCE_NO_OPAQUE = 0x8
} render_geometry_instance_flags;

typedef struct render_geometry_triangle_desc_t {
    u32 format;
    render_handle_t vertex_data;
    u32 vertex_offset;
    u32 vertex_stride;
    u32 vertex_count;
    u32 primitive_count;
    render_geometry_index_type index_type;
    render_handle_t index_data;
    u32 index_offset;
    render_handle_t transform_data;
    u32 transform_offset;
} render_geometry_triangle_desc_t;

typedef struct render_geometry_aabb_desc_t {
    render_handle_t aabb_data;
    u32 data_offset;
} render_geometry_aabb_desc_t;

typedef struct render_geometry_desc_t {
    render_geometry_type type;
    render_geometry_flags flags;
    union {
        render_geometry_triangle_desc_t triangle_desc;
        render_geometry_aabb_desc_t aabb_desc;
    };
} render_geometry_desc_t;

typedef struct render_top_level_acceleration_structure_instace_t {
    float4x4_t transform;
    u32 shader_info_index;
    u32 instance_id : 24;
    u32 mask : 8;
    MACRO_PAD(3);
    render_geometry_instance_flags flags: 8;
    render_handle_t blas_handle; 
} render_top_level_acceleration_structure_instace_t;

typedef struct render_acceleration_structure_desc_t {
    render_acceleration_structure_build_flags build_flags;
    render_geometry_flags geometry_flags;
    u32 instance_count;
    MACRO_PAD(4);
    const render_top_level_acceleration_structure_instace_t *instances;
    const char *tag;
} render_acceleration_structure_desc_t;

typedef struct render_shader_binding_table_dest_t {
    render_handle_t pipeline;
    u32 shader_info_count;
    const struct render_shader_info_t *shader_infos;
    const char *tag;
} render_shader_binding_table_dest_t; 

typedef struct render_ray_tracing_pipeline_desc_t {
    u32 max_recursion_depth;
    u32 shader_count;
    const struct render_shader_info_t *shader_infos;
    const char *tag;
} render_ray_tracing_pipeline_desc_t;

// render states

typedef struct render_shader_state_override_t {
    render_shader_blob_t tessellation_states;
    render_shader_blob_t raster_states;
    render_shader_blob_t depth_stencil_states;
    render_shader_blob_t blend_states;
    render_shader_blob_t multi_sample_states;
} render_shader_state_overrider_t;

typedef enum render_shader_stage_flag {
    RENDER_SHADER_STAGE_FLAG_VERTEX= 0b000001,
    RENDER_SHADER_STAGE_FLAG_HULL = 0b000010,
    RENDER_SHADER_STAGE_FLAG_DOMAIN = 0b000100,
    RENDER_SHADER_STAGE_FLAG_GEOMETRY = 0b001000,
    RENDER_SHADER_STAGE_FLAG_PIXEL = 0b010000,
    RENDER_SHADER_STAGE_FLAG_COMPUTE = 0b100000,
    RENDER_SHADER_STAGE_FLAG_ALL = 0b111111
} render_shader_stage_flag_t;

typedef enum render_resource_bind_usage_flag {
    RENDER_RESOURCE_BIND_USAGE_FLAG_UAV = 0b1,
} render_resource_bind_usage_flag_t;

typedef struct render_resource_bind_point_t {
    u32 bind_point;
    u32 stage_flags;
    u32 type;
    u32 view;
    u32 usage; // render_resource_bind_usage_flag_t
    u32 count;
} render_resource_bind_point_t;
