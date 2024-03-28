
#include "foundation/udata.h"
#include "foundation/ustring.h"
#include "os/os.h"
#include "gpu_const.h"

#include <sokol_gfx.h>

typedef struct gpu_device_t gpu_device_t;
typedef struct gpu_texture { u32 id; } gpu_texture;
typedef struct gpu_buffer { u32 id; } gpu_buffer;

gpu_device_t* gpu_create_device(os_window_t *window);
void gpu_destroy_device(gpu_device_t *device);

typedef struct gpu_texture_desc {
    int width, height, depth;
    udata data;
    gpu_pixel_format format;
    gpu_texture_type type;
} gpu_texture_desc;
gpu_texture gpu_create_texture(gpu_device_t *device, gpu_texture_desc *desc);

typedef struct gpu_buffer_desc {
    int size;
    udata data;
    gpu_buffer_type type;
} gpu_buffer_desc;
gpu_buffer gpu_create_buffer(gpu_device_t *device, gpu_buffer_desc *desc);

typedef struct gpu_attribute_desc {
} gpu_attribute_desc;

typedef struct gpu_shader_vertex_desc {
    ustring source;
} gpu_shader_vertex_desc;

typedef struct gpu_shader_fragment_desc {
    ustring source;
} gpu_shader_fragment_desc;

typedef struct gpu_shader_desc {
    gpu_shader_vertex_desc vertex;

} gpu_shader_desc;