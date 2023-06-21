#include "render_system.h"

#if defined(OS_OSX)
#include "metal_backend.h"
#else // OS_WINDOWS or OS_LINUX
#include "vulkan_backend.h"
#endif

typedef struct render_system_t {
    void *gpu_device;
} render_system_t;

static render_system_t g_render_system;


#if defined(OS_OSX)
void render_system_init(void) {
    g_render_system.gpu_device = metal_create_default_device();
}

void *render_system_get_gpu_device(void) {
    return g_render_system.gpu_device;
}

#else // OS_WINDOWS or OS_LINUX

void render_system_init(void) {

}

void *render_system_get_gpu_device(void) {
    return NULL;
}

#endif

