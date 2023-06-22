#ifndef _render_system_h_
#define _render_system_h_

#include "global.h"

void render_system_init(void);
void* render_system_get_gpu_device(void);

void render_system_present(void);

#endif
