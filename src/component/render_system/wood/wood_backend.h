#pragma once

/**
 * @brief self implemented wood backend, which doesn' require any physical graphcics devices or integrated graphics
 * Use cpu to simulate the graphics rendering.
*/

#include "foundation/types.h"

typedef struct wood_backend_o wood_backend_o;

struct wood_api {
    void (*init)(u32 width, u32 height);
    color_srgb_t *(*get_framebuffer)(void);
    void (*shutdown)(void);
};