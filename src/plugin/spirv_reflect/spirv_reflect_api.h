#pragma once

#include "foundation/types.h"
#include "plugin/spirv_reflect/spirv_reflect.h"

#if defined(RENDER_BACKEND_VULKAN)

enum {
    SPIRV_REFLECT_VERTEX_BIND_COUNT = 16,
    SPIRV_REFLECT_VERTEX_ATTRIBUTE_COUNT = 16,
};

typedef struct reflected_shader_module_t {
    u32 vertex_bind_count;
    u32 vertex_attribute_count;
    
} reflected_shader_module_t;

struct spirv_reflect_api {
    SpvReflectShaderModule (*create_module)(const void *source, u64 size);
};

extern struct spir_reflect_api_t *spirv_reflect;

#endif