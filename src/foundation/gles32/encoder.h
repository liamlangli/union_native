#pragma once

#include "public/global.h"
#if defined(RENDER_BACKEND_GLES)

#include "foundation/render/render.h"

encoder_o* gles_init();

void gles_clear(encoder_o *encoder);
void gles_viewport(encoder_o *encoder, u32 x, u32 y, u32 width, u32 height);
void gles_clear_color(encoder_o *encoder, f32 r, f32 g, f32 b, f32 a);
void gles_clear_depth(encoder_o *encoder, f32 depth);

#endif // OS_LINUX