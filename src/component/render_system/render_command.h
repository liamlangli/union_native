#ifndef _render_command_h_
#define _render_command_h_

#include "foundation/types.h"
#include "component/render_system/render_types.h"

typedef enum render_queue {
    RENDER_QUEUE_GRAPHICS,
    RENDER_QUEUE_COMPUTE,
    RENDER_QUEUE_TRANSFER
} render_queue;

typedef struct render_image_subresource_layers_t {
    u16 first_layer;
    u16 layer_count;
    u16 first_mip;
    u16 mip_levels;
} render_image_subresource_layers_t;

typedef struct render_image_offset_t {
    u16 x, y, z;
} render_image_offset_t;

typedef struct render_image_extent_t {
    u16 width, height, depth;
} render_image_extent_t;

typedef enum render_resource_load_op {
    RENDER_RESOURCE_LOAD_OP_LOAD,
    RENDER_RESOURCE_LOAD_OP_CLEAR,
    RENDER_RESOURCE_LOAD_OP_DONT_CARE
} render_resource_load_op;

typedef enum render_resource_store_op {
    RENDER_RESOURCE_STORE_OP_STORE,
    RENDER_RESOURCE_STORE_OP_DONT_CARE
} render_resource_store_op;

typedef enum render_resource_state {
    RENDER_RESOURCE_STAGE_VERTEX_INPUT = 0x1,
    RENDER_RESOURCE_STAGE_RENDER_TARGET = 0x2,
    RENDER_RESOURCE_STAGE_UAV = 0x4,
    RENDER_RESOURCE_STAGE_RESOURCE = 0x8,
    RENDER_RESOURCE_STAGE_VERTEX_SHADER = 0x10,
    RENDER_RESOURCE_STAGE_HULL_SHADER = 0x20,
    RENDER_RESOURCE_STAGE_DOMAIN_SHADER = 0x40,
    RENDER_RESOURCE_STAGE_GEOMETRY_SHADER = 0x80,
    RENDER_RESOURCE_STAGE_PIXEL_SHADER = 0x100,
    RENDER_RESOURCE_STAGE_COMPUTE_SHADER = 0x200,
    RENDER_RESOURCE_STAGE_RAY_TRACING_SHADER = 0x400,
    RENDER_RESOURCE_STAGE_COPY_SOURCE = 0x800,
    RENDER_RESOURCE_STAGE_COPY_DESTINATION = 0x1000,
    RENDER_RESOURCE_STAGE_INDRIECT_ARGUMENT = 0x2000,
    RENDER_RESOURCE_STAGE_PRESENT = 0x4000,
} render_resource_state;

typedef struct render_pass_bind_render_target_t {
    render_handle_t render_target;
    u32 aspect;
    u16 initial_state;
    u16 final_state;
    u8 load_op;
    u8 store_op;
    u8 stencil_load_op;
    u8 stencil_store_op;
} render_pass_bind_render_target_t;

enum { RENDER_MAX_RENDER_TARGETS = 8 };
enum { RENDER_MAX_QUEUE_FENCES = 4 }; 

typedef struct render_schedule_t {
    render_handle_t wait_queue_fences[RENDER_MAX_QUEUE_FENCES];
    u32 wait_device_affinity_masks[RENDER_MAX_QUEUE_FENCES];
    u32 wait_fence_count;
    MACRO_PAD(4);
    render_handle_t signal_queue_fence;
    u32 signal_device_affinity_mask;
    MACRO_PAD(4);
} render_schedule_t;

typedef struct render_pass_bind_t {
    u32 device_affinity_mask;
    MACRO_PAD(4);
    render_pass_bind_render_target_t render_targets[RENDER_MAX_RENDER_TARGETS];
    render_pass_bind_render_target_t depth_stencil_target;
    render_schedule_t schedule;
} render_pass_bind_t;

typedef struct render_queue_bind_t {
    u32 device_affinity_mask;
    u8 queue_family;
    u8 queue_index;
    MACRO_PAD(2);
    render_schedule_t schedule;
} render_queue_bind_t;

enum { RENDER_MAX_VIEWPORT_SCISSOR_RECTS = 8 };

typedef struct render_set_viewport_t {
    rect_t viewports[RENDER_MAX_VIEWPORT_SCISSOR_RECTS];
    u32 viewport_count;
} render_viewport_t;

typedef struct render_set_scissor_t {
    rect_t scissors[RENDER_MAX_VIEWPORT_SCISSOR_RECTS];
    u32 scissor_count;
} render_scissor_t;

typedef struct render_profile_begin_t {
    const char* category;
    const char* name;
    u32 flags;
    MACRO_PAD(4);
    u64 uid;
    u32 data[8];
} render_profile_begin_t;

typedef struct render_profile_end_t {
    u64 uid;
    u32 data[8];
} render_profile_end_t;

typedef enum render_dispatch_type {
    RENDER_DISPATCH_TYPE_DISPATCH_NORMAL,
    RENDER_DISPATCH_TYPE_DISPATCH_INDIRECT
} render_dispatch_type;

typedef struct render_dispatch_command_t {
    u32 group_count[3];
} render_dispatch_command_t;

typedef struct render_dispatch_indirect_command_t {
    render_handle_t buffer;
    MACRO_PAD(4);
    u64 offset;
} render_dispatch_indirect_command_t;

typedef struct render_compute_info_t {
    u8 dispatch_type;
    MACRO_PAD(7);
} render_compute_info_t;

typedef enum render_primitive_type {
    RENDER_PRIMITIVE_TYPE_TRIANGLE_LIST,
    RENDER_PRIMITIVE_TYPE_LINE_LIST,
    RENDER_PRIMITIVE_TYPE_POINT_LIST,
    RENDER_PRIMITIVE_TYPE_MAX
} render_primitive_type;

typedef enum render_draw_type {
    RENDER_DRAW_TYPE_NON_INDEXED,
    RENDER_DRAW_TYPE_INDEXED,
    RENDER_DRAW_TYPE_NON_INDEXED_INDIRECT,
    RENDER_DRAW_TYPE_INDEXED_INDIRECT,
} render_draw_type;

typedef enum render_index_type {
    RENDER_INDEX_TYPE_UINT16,
    RENDER_INDEX_TYPE_UINT32
} render_index_type;

typedef struct render_draw_command_t {
    u32 vertex_count;
    u32 instance_count;
    u32 first_vertex;
    u32 first_instance;
} render_draw_command_t;

typedef struct render_draw_indexed_command_t {
    u32 index_count;
    u32 instance_count;
    u32 first_index;
    u32 vertex_offset;
    u32 first_instance;
} render_draw_indexed_command_t;

typedef struct render_draw_indirect_command_t {
    render_handle_t indirect_buffer;
    MACRO_PAD(4);
    u64 offset;
    u32 stride;
    u32 draw_count;
} render_draw_indexed_command_t;

typedef struct render_draw_call_t {
    union {
        render_draw_command_t non_indexed;
        render_draw_indexed_command_t indexed;
        render_draw_indirect_command_t indirect;
    };
    render_handle_t index_buffer;
    u8 primitive_type;
    u8 draw_type;
    u8 index_type;
    MACRO_PAD(1);
} render_draw_call_t;

enum {
    RENDER_MAX_RESOURCE_BINDERS = 8,
    RENDER_MAX_PUSH_CONSTANTS = 16,
    RENDER_MAX_SHADER_STAGE_OVERRIDE_BLOCKS = 4
};

typedef struct render_shader_state_override_blocks_t {
    u8 block_count;
    MACRO_PAD(7);
    render_handle_t blocks[RENDER_MAX_SHADER_STAGE_OVERRIDE_BLOCKS];
} render_shader_state_override_blocks_t;

typedef struct render_shader_resource_binders_t {
    u8 resource_binder_count;
    MACRO_PAD(7);
    render_handle_t resource_binders[RENDER_MAX_RESOURCE_BINDERS];
} render_shader_resource_binders_t;

typedef struct render_shader_push_constants_t {
    u8 constants_count;
    MACRO_PAD(7);
    u32 data[RENDER_MAX_PUSH_CONSTANTS];
} render_shader_push_constants_t;

typedef struct render_shader_info_t {
    render_handle_t shader;
    render_shader_state_override_blocks_t override_blocks;
    render_shader_resource_binders_t resource_binders;
    render_shader_push_constants_t push_constants;
    u64 sort_key;
} render_shader_info_t;

typedef struct render_shader_header_t {
    render_handle_t shader;
    u16 state_override_block_count;
    u16 resource_binder_count;
    u16 push_constant_count;
    MACRO_PAD(2);
} render_shader_header_t;

typedef enum render_image_aspect {
    RENDER_IMAGE_ASPECT_DEFAULT = 0,
    RENDER_IMAGE_ASPECT_SRGB = 1,
    RENDER_IMAGE_ASPECT_DEPTH = 2,
    RENDER_IMAGE_ASPECT_STENCIL = 3,
    RENDER_IMAGE_ASPECT_ADDTIONAL_VIEW = 0x8000000,
} render_image_aspect;

typedef struct render_set_resource_t {
    u32 bind_port;
    MACRO_PAD(4);
    render_handle_t handle;
    u32 resourec_aspect_flag;
    MACRO_PAD(4);
} render_set_resource_t;

typedef struct render_handle_aspect_pair_t {
    render_handle_t handle;
    u32 aspect;
} render_handle_aspect_pair_t;

typedef struct render_set_array_resource_t {
    u32 bind_port;
    u32 first_element;
    u32 handle_count;
} render_set_array_resource_t;

typedef struct render_update_buffer_command_t {
    u64 offset;
    u64 size;
    u32 device_affinity_mask;
    MACRO_PAD(4);
} render_update_buffer_command_t;

typedef struct render_fill_buffer_command_t {
    u64 offset;
    u64 size;
    u32 data;
    u32 device_affinity_mask;
} render_fill_buffer_command_t;

typedef struct render_update_image_command_t {
    u16 resourec_state;
    render_image_subresource_layers_t subresource;
    render_image_offset_t offset;
    render_image_extent_t extent;
    MACRO_PAD(2);
    u64 size;
    u32 device_affinity_mask;
    MACRO_PAD(4);
} render_update_image_command_t;

typedef struct render_resource_barrier_header_t {
    u32 barrier_count;
} render_resource_barrier_header_t;

typedef enum render_resource_barrier_flag {
    RENDER_RESOURCE_BARRIER_FLAG_IMAGE_ASPECT_STENCIL = 0x1,
    RENDER_RESOURCE_BARRIER_FLAG_SUBRESOURCE = 0x2,
} render_resource_barrier_flag;

typedef struct render_resource_barrier_t {
    render_handle_t handle;
    u16 source_state;
    u16 destination_state;
    u16 source_queue;
    u16 destination_queue;
    u16 barrier_flags;
    MACRO_PAD(2);

    union {
        struct {
            u16 first_layer;
            u16 layer_count;
            u16 first_mip_level;
            u16 mip_count;
        } subresource_image;

        struct {
            u16 offset;
            u16 size;
        } subresource_buffer;
    };
} render_resource_barrier_t;

typedef enum render_copy_image_flags {
    RENDER_COPY_IMAGE_FLAG_ASPECT_STENCIL = 0x1,
    RENDER_COPY_IMAGE_FLAG_ASPECT_SUBRESOURCE = 0x2,
} render_copy_image_flags;

typedef struct render_copy_image_t {
    render_handle_t source;
    render_handle_t destination;
    u16 copy_flags;
    render_image_subresource_layers_t src_subresource_layers;
    render_image_offset_t src_offset;
    render_image_subresource_layers_t dst_subresource_layers;
    render_image_offset_t dst_offset;
    render_image_extent_t extent;
} render_copy_image_t;

typedef struct render_copy_buffer_t {
    render_handle_t source;
    render_handle_t destination;
    u64 source_offset;
    u64 destination_offset;
    u64 size;
} render_copy_buffer_t;

typedef enum render_read_image_flags {
    RENDER_READ_IMAGE_FLAG_ASPECT_STENCIL = 0x1,
    RENDER_READ_IMAGE_FLAG_SUBRESOURCE = 0x2,
} render_read_image_flags;

typedef struct render_read_image_t {
    u32 device_affinity_mask;
    MACRO_PAD(4);
    render_handle_t resource_handle;
    u16 resource_state;
    u16 resource_queue;
    u16 read_flags;

    render_image_subresource_layers_t subresource_layers;
    render_image_offset_t offset;
    render_image_extent_t extent;
    MACRO_PAD(2);
    void *data;
    u64 size;
} render_read_image_t;

typedef struct render_read_buffer_t {
    u32 device_affinity_mask;
    MACRO_PAD(4);
    render_handle_t resource_handle;
    u16 resource_state;
    u16 resource_queue;
    u64 offset;
    u64 size;
    void *data;
} render_read_buffer_t;

typedef struct render_resize_buffer_t {
    u32 bindless_srv;
    u32 bindless_uav;
    u64 size;
} render_resize_buffer_t;

typedef struct render_trace_call_t {
    render_handle_t pipeline;
    render_handle_t raygen_sbt;
    render_handle_t miss_sbt;
    render_handle_t hit_sbt;
    u32 group_count[3];
    u32 raygen_index;
    render_shader_resource_binders_t binders;
} render_trace_call_t;

#endif