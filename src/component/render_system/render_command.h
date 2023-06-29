#ifndef _render_command_h_
#define _render_command_h_

#include "foundation/types.h"

typedef enum render_queue {
    RENDER_QUEUE_GRAPHICS,
    RENDER_QUEUE_COMPUTE,
    RENDER_QUEUE_TRANSFER
} render_queue;

typedef struct texture_offset {
    u16 x, y, z;
} texture_offset;

typedef struct texture_extent {
    u16 width, height, depth;
} texture_extent;

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

typedef enum render_dispatch_type {
    RENDER_DISPATCH_TYPE_DISPATCH_NORMAL,
    RENDER_DISPATCH_TYPE_DISPATCH_INDIRECT
} render_dispatch_type;

typedef struct render_dispatch_command_t {
    u32 group_count[3];
} render_dispatch_command_t;

#endif