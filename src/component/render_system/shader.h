#pragma once

#include "component/render_system/render_types.h"

typedef struct shader_stage_data_t {
    void *data;
    u64 size;
} shader_stage_data_t;

typedef struct shader_t {
    shader_stage_data_t stages[RENDER_SHADER_STAGE_MAX];
    u32 stage_count;
    u32 stage_mask;
} shader_t;

struct shader_api {
    shader_t* (*create_shader)(void);
    bool (*add_stage)(shader_t *shader, enum render_shader_stage stage, void *data, u64 size);
    bool (*load_stage)(shader_t *shader, enum render_shader_stage stage, const char *path);
    bool (*remove_stage)(shader_t *shader, enum render_shader_stage stage);
};
