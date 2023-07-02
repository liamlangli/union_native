#pragma once

#include "component/render_system/render_types.h"
#include "foundation/types.h"

struct allocator_i;

enum {
    RENDER_SHADER_RESOURCE_HLSL
};

typedef render_shader_compiler_o render_shader_compiler_o;

typedef struct render_state_value_pair_t {
    u32 state;
    MACRO_PAD(4);
    union {
        u32 enum_value;
        u32 uint32_value;
        f32 floa32_value;
        struct render_state_value_pair_t *sub_states;
    };
} render_state_value_pair_t;

enum {
    RENDER_STATE_BLOCK_COMPLETE,
    RENDER_STATE_BLOCK_OVERRIDE
};

typedef struct render_bindless_accessor_t {
    u16 set;
    u16 slot;
} render_bindless_accessor_t;

typedef struct render_shader_compiler_api {
    render_shader_compiler_o *(*create)(struct allocator_i *allocator);
    void (*shutdown)(render_shader_compiler_o *compiler);

    u32 (*num_state_block_types)(render_shader_compiler_o *compiler);
    u32 (*state_block_type)(render_shader_compiler_o *compiler, u32 state_block_index);
    const char *(*state_block_name)(render_shader_compiler_o *compiler, u32 state_block_type);
    u32 (*num_state)(render_shader_compiler_o *compiler, u32 state_block_type);
    const char *(*state_name)(render_shader_compiler_o *compiler, u32 state_block_type, u32 state);
    u32 (*value_type)(render_shader_compiler_o *compiler, u32 state_block_type, u32 state);
    u32 (*value_count)(render_shader_compiler_o *compiler, u32 value_type);
    const char *(*value_name)(render_shader_compiler_o *compiler, u32 value_type, u32 value);
    u32 (*enum_value)(render_shader_compiler_o *compiler, u32 value_type, u32 value);

    render_shader_blob_t (*compile_state_block)(render_shader_compiler_o *compiler, u32 bind_type, u32 block_type, const render_state_value_pair_t *states, u32 raster_state_count);
    render_shader_blob_t (*compile_shader)(render_shader_compiler_o *compiler, const char *source, const char *entry_point, u32 source_language, u32 stage);

    bool (*bindless)(render_shader_compiler_o *compiler);

    render_bindless_accessor_t (*bindless_access_buffer)(render_shader_compiler_o *compiler, u32 usage_flags);
    render_bindless_accessor_t (*bindless_access_image)(render_shader_compiler_o *compiler, u32 type, u32 usage_flags);
    render_bindless_accessor_t (*bindless_access_sampler)(render_shader_compiler_o *compiler);
    render_bindless_accessor_t (*bindless_access_acceleration_structure)(render_shader_compiler_o *compiler);
    void (*release_blob)(render_shader_compiler_o *compiler, render_shader_blob_t blob);
} render_shader_compiler_api;

typedef struct render_shader_compiler_i {
    render_shader_compiler_api *api;
    render_shader_compiler_o *compiler;
} render_shader_compiler_i;
