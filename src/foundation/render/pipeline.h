#pragma once

#include "public/global.h"
#include "foundation/render/type.h"
#include "foundation/string/ustring.h"

#define MAX_UNIFORMS 32

typedef struct uniform_descriptor_t {
    ustring_t name;
    pipeline_uniform_type_t type;
    u32 size;
} uniform_descriptor_t;

typedef struct blend_state_descriptor_t {
    bool enabled;
    u32 src_rgb, dst_rgb, src_alpha, dst_alpha;
} blend_state_descriptor_t;

typedef struct pipeline_descriptor_t {
    ustring_t name;
    ustring_t vertex_shader, fragment_shader;
    uniform_descriptor_t uniforms[MAX_UNIFORMS];
    blend_state_descriptor_t blend_state;
    bool depth_write, depth_test;
    u32 depth_test_func;
    u32 color_write_mask;
} pipeline_descriptor_t;

pipeline_o* pipeline_create(pipeline_descriptor_t *descriptor);
void pipeline_destroy(pipeline_o *pipeline);