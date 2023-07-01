#ifndef _render_backend_h_
#define _render_backend_h_

#include "component/render_system/render_types.h"
#include "component/render_system/render_command_buffer.h"
#include "component/os_window/os_window.h"

typedef struct render_swapchain_o {
    u64 opaque;
} render_swapchain_o;

typedef struct render_device_memory_o {
    u64 opaque[8];
} render_device_memory_o;

#define RENDER_DEVICE_AFFINITY_MAKS_ALL 0xff

typedef struct render_backend_o render_backend_o;

typedef struct render_backend_i {
    render_backend_o *instace;
    render_swapchain_o (*create_swapchain)(render_backend_o *instance, const window_t *window, u32 device_affinity);
    void (*destory_swapchain)(render_backend_o *instance, render_swapchain_o swapchain);
    void (*resize_swapchain)(render_backend_o *instance, render_swapchain_o swapchain, u32 width, u32 height);
    void (*present_swapchain)(render_backend_o *instance, render_swapchain_o swapchain);
    render_handle_t (*swapchain_resource)(render_backend_o *instance, render_swapchain_o swapchain);

    void (*create_command_buffers)(render_backend_o *instance, render_command_t swapchain, u32 count);
} render_backend_i;
#endif // _render_backend_h_