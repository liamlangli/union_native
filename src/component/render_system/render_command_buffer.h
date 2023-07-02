#pragma once

#include "foundation/types.h"
#include "component/render_system/render_types.h"

struct allocator_i;
struct render_image_view_t;
struct render_buffer_desc_t;
struct render_command_buffer_pool_o;
struct render_copy_buffer_t;
struct render_copy_image_t;
struct render_draw_call_info_t;
struct render_image_desc_t;
struct render_image_extent_t;
struct render_image_extent_t;
struct render_image_offset_t;
struct render_image_subresource_layers_t;
struct render_index_buffer_bind_t;
struct render_queue_bind_t;
struct render_read_buffer_t;
struct render_read_image_t;
struct render_pass_bind_t;
struct render_set_viewports_t;
struct render_set_scissors_t;
struct render_resource_barrier_t;
struct render_resource_bind_point_t;
struct render_resource_command_buffer_o;
struct render_resource_command_buffer_pool_o;
struct render_sampler_t;
struct render_shader_info_t;
struct render_shader_t;
struct render_swapchain_o;
struct render_shader_state_override_t;
struct render_build_acceleration_structure_t;
struct render_ray_tracing_pipeline_t;
struct render_shader_bind_table_desc_t;
struct render_top_level_acceleration_structure_t;
struct render_bottom_level_acceleration_structure_t;
struct render_trace_call_t;


typedef struct render_command_buffer_o render_command_buffer_o;
typedef struct render_resource_command_buffer_o render_resource_command_buffer_o;

enum render_command {
    RENDER_COMMAND_BIND_RENDER_PASS,
    RENDER_COMMAND_SET_VIEWPORTS,
    RENDER_COMMAND_SET_SCISSORS,
    RENDER_COMMAND_DRAW_CALL,
    RENDER_COMMAND_BEGIN_PROFILE,
    RENDER_COMMAND_END_PROFILE,
    RENDER_COMMAND_BIND_QUEUE,
    RENDER_COMMAND_COMPUTE,
    RENDER_COMMAND_TRANSITION_RESOURCES,
    RENDER_COMMAND_COPY_IMAGE,
    RENDER_COMMAND_COPY_BUFFER,
    RENDER_COMMAND_READ_IMAGE,
    RENDER_COMMAND_READ_BUFFER,
    RENDER_COMMAND_TRACE
} render_command;

typedef enum render_map_flags {
    RENDER_MAP_FLAGS_CPU_CACHED = 0x1,
} render_map_flags;

enum render_profile_flags {
    RENDER_GPU_TIMINGS = 0x1
};

typedef struct render_command_t {
    u64 *sort_keys;
    u64 *types;
    void **data;
} render_command_t;

struct render_command_buffer_api {
    void (*bind_render_pass)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_pass_bind_t render_pass);
    void (*set_viewports)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_set_viewports_t *viewports);
    void (*set_scissors)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_set_scissors_t *scissors);
    void (*draw_call)(struct render_command_buffer_o *command_buffer, u64 *sort_keys, const struct render_draw_call_info_t *draw_call, const struct render_shader_info_t *shaders, u32 draw_call_count);
    void (*bind_queue)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_bind_queue_t *queue_bind);
    u64 (*begin_profile_scope)(struct render_command_buffer_o *command_buffer, u64 sort_key, const char* category, const char *name, u32 flags);
    void (*end_profile_scope)(struct render_command_buffer_o *command_buffer, u64 sort_key, u64 profile_scope);
    void (*compute_dispatches)(struct render_command_bufer_o *command_buffer, u64 *sort_keys, const struct render_compute_dispatch_t *dispatches, const struct render_shader_info_t *shader, u32 dispatch_count);
    void (*transition_resources)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_resource_barrier_t *barriers, u32 barrier_count);
    void (*copy_image)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_copy_image_t *copy_image);
    void (*copy_buffer)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_copy_buffer_t *copy_buffer);
    void (*read_image)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_read_image_t *read_image);
    void (*read_buffer)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_read_buffer_t *read_buffer);
    void (*trace_dispatches)(struct render_command_buffer_o *command_buffer, u64 sort_key, const struct render_trace_call_t *trace_call, u32 trace_call_count);
    u32 (*command_count)(struct render_command_buffer_o *command_buffer);
    void *(*user_data)(struct render_command_buffer_o *command_buffer);
    void (*append_buffers)(struct render_command_buffer_o *command_buffer, struct render_command_buffer_o *others, u32 count);
};

struct render_command_buffer_pool_api {
    struct render_command_buffer_o *(*create)(struct render_command_buffer_pool_o *pool);
    void (*destroy)(struct render_command_buffer_pool_o *pool, struct render_command_buffer_o *command_buffer);
    u64 (*user_data_size)(struct render_command_buffer_pool_o *pool);
};

struct render_command_buffer_pool_o render_create_command_buffer_pool(struct render_memeory_block_pool_o *memory_block_pool, u64 user_data_size, struct allocator_i *allocator, u32 memory_footprint_scope);

void render_destroy_command_buffer_pool(struct render_command_buffer_pool_o *pool);

struct render_command_buffer_sort_api {
    u64 (*sort_memory_needed)(const struct render_command_buffer_o **command_buffer, u32 command_count);
    void (*sort)(struct render_command_buffer_o **command_buffer, u32 buffer_count, void *sort_memory, render_command_t **sorted, u32 *command_count);
};

enum render_resource {
    RENDER_RESOURCE_CREATE_BUFFER,
    RENDER_RESOURCE_MAP_CREATE_BUFFER,
    RENDER_RESOURCE_RESIZE_BUFFER,
    RENDER_RESOURCE_FILL_BUFFER,
    RENDER_RESOURCE_CREATE_IMAGE,
    RENDER_RESOURCE_MAP_CREATE_IMAGE,
    RENDER_RESOURCE_UPDATE_IMAGE,
    RENDER_RESOURCE_CREATE_IMAGE_VIEWS,
    RENDER_RESOURCE_CREATE_SHADER,
    RENDER_RESOURCE_CREATE_SHADER_STATE_OVERRIDE,
    RENDER_RESOURCE_CREATE_SAMPLER,
    RENDER_RESOURCE_CREATE_QUEUE_FENCE,
    RENDER_RESOURCE_CREATE_RESOURCE_BINDER,
    RENDER_RESOURCE_CREATE_RAY_TRACING_PIPELINE,
    RENDER_RESOURCE_CREATE_SHADER_BINDING_TABLE,
    RENDER_RESOURCE_CREATE_TOP_LEVEL_ACCELERATION_STRUCTURE,
    RENDER_RESOURCE_CREATE_BOTTOM_LEVEL_ACCELERATION_STRUCTURE,
    RENDER_RESOURCE_SET_RESOURCE,
    RENDER_RESOURCE_SET_RESOURCE_LIST,
    RENDER_RESOURCE_DESTROY,
    RENDER_RESOURCE_COMMAND_TYPE_MAX
};

typedef struct render_resource_command_t {
    u32 *types;
    render_handle_t handles;
    void **data;
} render_resource_command_t;

struct render_resource_command_buffer_api {
    render_handle_t (*create_buffer)(struct render_resource_command_buffer_o *command_buffer, const struct render_buffer_desc_t *buffer, u32 device_affinity_mask);
    render_handle_t (*map_create_buffer)(struct render_resource_command_buffer_o *command_buffer, const struct render_buffer_desc_t *buffer, u32 device_affinity_mask, render_map_flags flags, void **data);
    void (*resize_buffer)(struct render_resource_command_buffer_o *command_buffer, render_handle_t *handle, u64 size);
    void (*update_buffer)(struct render_resource_command_buffer_o *command_buffer, render_handle_t handle, u64 offset, u64 size, u32 device_affinity_mask, render_map_flags flags, void ** data);
    void (*fill_buffer)(struct render_resource_command_buffer_o *command_buffer, render_handle_t handle, u64 offset, u64 size, u32 value, u32 device_affinity_mask);
    render_handle_t (*create_image)(struct render_resource_command_buffer_o *command_buffer, const struct render_image_desc_t *image, u32 device_affinity_mask);
    render_handle_t (*map_create_image)(struct render_resource_command_buffer_o *command_buffer, const struct render_image_desc_t *image, u32 device_affinity_mask, render_map_flags flags, void **data);
    void (*update_image)(struct render_resource_command_buffer_o *command_buffer, render_handle_t handle, u16 resource_state, u32 format, const struct render_image_subresource_data_t *subresources, const struct render_image_offset_t *offset, const struct render_image_extent_t *extent, u32 device_affinity_mask, render_map_flags flags, void **data);
    render_handle_t (*create_image_view)(struct render_resource_command_buffer_o *command_buffer, render_handle_t image, const struct render_image_view_desc_t *image_view, u32 device_affinity_mask, const struct render_image_view_t *views, u32 view_count);
    render_handle_t (*create_shader)(struct render_resource_command_buffer_o *command_buffer, const struct render_shader_t *shader, u32 device_affinity_mask);
    render_handle_t (*create_shader_state_override)(struct render_resource_command_buffer_o *command_buffer, const struct render_shader_state_override_desc_t *shader_state_override, u32 device_affinity_mask);
    render_handle_t (*create_sampler)(struct render_resource_command_buffer_o *command_buffer, const struct render_sampler_t *sampler, u32 device_affinity_mask);
    render_handle_t (*create_queue_fence)(struct render_resource_command_buffer_o *command_buffer, u32 device_affinity_mask);
    render_handle_t (*create_resource_binder)(struct render_resource_command_buffer_o *command_buffer, const struct render_resource_bind_point_t *bind_points, u32 bind_point_count, u32 device_affinity_mask);
    render_handle_t (*create_ray_tracing_pipeline)(struct render_resource_command_buffer_o *command_buffer, const struct render_ray_tracing_pipeline_desc_t *pipeline, u32 device_affinity_mask);
    render_handle_t (*create_shader_binding_table)(struct render_resource_command_buffer_o *command_buffer, const struct render_shader_binding_table_desc_t *shader_binding_table, u32 device_affinity_mask);
    render_handle_t (*create_top_level_acceleration_structure)(struct render_resource_command_buffer_o *command_buffer, const struct render_top_level_acceleration_structure_desc_t *top_level_acceleration_structure, u32 device_affinity_mask);
    render_handle_t (*create_bottom_level_acceleration_structure)(struct render_resource_command_buffer_o *command_buffer, const struct render_bottom_level_acceleration_structure_desc_t *bottom_level_acceleration_structure, u32 device_affinity_mask);
    void (*set_resource)(struct render_resource_command_buffer_o *command_buffer, render_handle_t resource_binder, u32 bind_point, render_handle_t resource_handles, u32 resource_aspect_flags);
    void (*set_resource_list)(struct render_resource_command_buffer_o *command_buffer, render_handle_t resource_binder, u32 bind_point, render_handle_t *resource_handles, u32 first_element, const u32 handle_count, const u32 *resource_aspect_flags);
    void (*destroy_resource)(struct render_resource_command_buffer_o *command_buffer, render_handle_t handle);
    u32 (*command_count)(struct render_resource_command_buffer_o *command_buffer, u32 count_pre_command_type[RENDER_RESOURCE_COMMAND_TYPE_MAX]);
    render_resource_command_t (*commands)(struct render_resource_command_buffer_o *command_buffer);
    void (*append_buffers)(struct render_resource_command_buffer_o *command_buffer, struct tm_renderer_resource_command_buffer_o *buffers, u32 buffer_count);
};

struct render_resource_command_buffer_pool_api {
    struct render_resource_command_buffer_o *(*create)(struct render_resource_command_buffer_pool_o *pool);
    void (*destroy)(struct render_resource_command_buffer_pool_o *pool, struct render_resource_command_buffer_o *buffer);
    u64 (*user_data_size)(struct render_resource_command_buffer_pool_o *pool);
};
