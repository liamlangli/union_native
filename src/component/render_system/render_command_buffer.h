#ifndef _render_command_buffer_h_
#define _render_command_buffer_h_

#include "foundation/types.h"
#include "component/render_system/render_types.h"

struct render_pass_bind_t;

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
} render_command_buffer_api;

#endif // _render_command_buffer_h_