#ifndef _metal_backend_h_
#define _metal_backend_h_

typedef struct metal_device_t metal_device_t;
typedef struct metal_pipeline_t metal_pipeline_t;
typedef struct metal_render_pass_t metal_render_pass_t;
typedef struct metal_compute_pass_t metal_compute_pass_t;

metal_device_t* metal_create_default_device();

#endif