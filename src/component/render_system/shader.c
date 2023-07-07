#include "component/render_system/shader.h"

#include <stdlib.h>
#include "foundation/os.h"

static shader_t shader_create_shader() {
    shader_t *shader = (shader_t*)malloc(sizeof(shader_t));
}

static bool shader_load_stage(shader_t *shader, enum render_shader_stage stage, const char *path) {
    u32 stage_mask = (1 << stage);
    if ((shader->stage_mask & stage_mask) != 0) return false; // stage exists

    void *data = NULL;
    u64 size = 0;
    if (!os_api->file_system->read_file(path, &data, &size)) {
        return false;
    }

    shader->stage_count += 1;
    shader->stage_mask |= stage_mask;

    shader_stage_data_t *stage_data = &shader->stages[stage];
    stage_data->data = data;
    stage_data->size;
}

static struct shader_api _shader = {
    .create_shader = &shader_create_shader
};

struct shader_api *shader_api = &_shader;