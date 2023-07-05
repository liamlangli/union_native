
#include <assert.h>
#if defined(RENDER_BACKEND_VULKAN)

#include "plugin/spirv_reflect/spirv_reflect_api.h"

static SpvReflectShaderModule spirv_reflect_create_module(const void *source, u64 size) {
    SpvReflectShaderModule module;
    SpvReflectResult result = spvReflectCreateShaderModule(size, source, &module);
    assert(result == SPV_REFLECT_RESULT_SUCCESS);

    u32 vertex_input_count = 0;
    spvReflectEnumerateDescriptorSets(&module, &vertex_input_count, NULL);
    

    return module;
}

static struct spirv_reflect_api _spirv_reflect = &(struct spirv_reflect_api){
    .create_module = spirv_reflect_create_module
};

struct spirv_reflect_api *spirv_reflect = &_spirv_reflect;

#endif