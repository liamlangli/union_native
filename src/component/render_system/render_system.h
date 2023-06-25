#ifndef _render_system_h_
#define _render_system_h_

#include "foundation/types.h"

typedef struct window_t window_t;
typedef struct swapchain_o swapchain_o;

void render_system_init(void);
swapchain_o* render_system_create_swapchain(window_t *window);
void render_system_swapchain_present(swapchain_o *swapchain);
void render_system_terminate(void);

#endif
