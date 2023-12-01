#include "render.h"
#include "public/platform.h"

#if defined(RENDER_BACKEND_GLES)
#include "foundation/gles32/encoder.h"


encoder_o* render_encoder_create()
{
    return gles_init();
}

void render_viewport(encoder_o *encoder, u32 x, u32 y, u32 width, u32 height)
{
    gles_viewport(encoder, x, y, width, height);
}

void render_clear_color(encoder_o *encoder, f32 r, f32 g, f32 b, f32 a)
{
    gles_clear_color(encoder, r, g, b, a);
}

void render_clear_depth(encoder_o *encoder, f32 depth)
{
    gles_clear_depth(encoder, depth);
}

void render_clear(encoder_o *encoder)
{
    gles_clear(encoder);
}

#endif