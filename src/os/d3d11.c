#include "gpu/gpu.h"

#ifdef OS_WINDOWS

bool gpu_request_device(os_window_t *window) { return true; }
void gpu_destroy_device(void) {}

gpu_texture gpu_create_texture(gpu_texture_desc *desc) {
    return (gpu_texture){0};
}
gpu_sampler gpu_create_sampler(gpu_sampler_desc *desc) {
    return (gpu_sampler){0};
}
gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc) {
    return (gpu_buffer){0};
}
gpu_shader gpu_create_shader(gpu_shader_desc *desc) {
    return (gpu_shader){0};
}
gpu_pipeline gpu_create_pipeline(gpu_pipeline_desc *desc) {
    return (gpu_pipeline){0};
}
gpu_attachments gpu_create_attachments(gpu_attachments_desc *desc) {
    return (gpu_attachments){0};
}

void gpu_destroy_texture(gpu_texture texture) {}
void gpu_destroy_sampler(gpu_sampler sampler) {}
void gpu_destroy_buffer(gpu_buffer buffer) {} 
void gpu_destroy_shader(gpu_shader shader) {}
void gpu_destroy_pipeline(gpu_pipeline pipeline) {}
void gpu_destroy_attachments(gpu_attachments attachments) {}

void gpu_update_texture(gpu_texture texture, udata data) {}
void gpu_update_buffer(gpu_buffer buffer, udata data) {}

bool gpu_begin_pass(gpu_pass *pass) {
    return true;
}
void gpu_set_viewport(int x, int y, int width, int height) {}
void gpu_set_scissor(int x, int y, int width, int height) {}
void gpu_set_pipeline(gpu_pipeline pipeline) {}
void gpu_set_binding(const gpu_binding* binding) {}
void gpu_draw(int base, int count, int instance_count) {}
void gpu_end_pass(void) {}
void gpu_commit(void) {}

#endif