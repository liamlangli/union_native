#include "component/render_system/shader.h"

#include <stdlib.h>

static shader_t create_shader() {
    shader_t *shader = (shader_t*)malloc(sizeof(shader_t));
}

static struct shader_api _shader = {
    .create_shader = &create_shader
};

struct shader_api *shader_api = &_shader;