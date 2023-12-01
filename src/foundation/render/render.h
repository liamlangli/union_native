#pragma once

#include "foundation/render/type.h"
#include "foundation/render/pipeline.h"
#include "public/global.h"

encoder_o* render_encoder_create();
void render_clear_color(encoder_o *encoder, f32 r, f32 g, f32 b, f32 a);
void render_clear_depth(encoder_o *encoder, f32 depth);
void render_clear(encoder_o *encoder);
void render_viewport(encoder_o *encoder, u32 x, u32 y, u32 width, u32 height);

void encoder_set_pipeline(encoder_o *encoder, pipeline_o *pipeline);