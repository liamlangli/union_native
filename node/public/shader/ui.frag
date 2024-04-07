#version 300 es
precision highp float;
precision highp sampler2D;

#define UI_PRIM_RECTANGLE 1u
#define UI_PRIM_TRIANGLE 2u
#define UI_PRIM_TRIANGLE_ADVANCED 3u

#define UI_PRIM_TRIANGLE_ADVANCED_ICON 4u
#define UI_PRIM_TRIANGLE_ADVANCED_SCREEN 5u
#define UI_PRIM_TRIANGLE_ADVANCED_ENTITY 6u
#define UI_PRIM_TRIANGLE_ADVANCED_ATLAS 7u

#define UI_PRIM_GLYPH 32u
#define UI_PRIM_GLYPH_CODE 33u

uniform sampler2D font_texture;
uniform sampler2D icon_texture;
uniform vec3 window_size;

in vec4 color;
in vec4 clip_rect;
in vec2 sample_point;
in vec2 screen_point;
flat in highp uint type;
flat in uint clip;

out vec4 frag_data;

const float dash_stride = 12.f;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

bool contains(vec2 p, vec4 r) {
    return p.x >= r.x && p.y >= r.y && p.x <= (r.x + r.z) && p.y <= (r.y + r.w);
}

vec3 hsl_to_rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

float radical_inverse(uint i) {
  i = (i << 16u) | (i >> 16u);
  i = ((i & 0x55555555u) << 1u) | ((i & 0xAAAAAAAAu) >> 1u);
  i = ((i & 0x33333333u) << 2u) | ((i & 0xCCCCCCCCu) >> 2u);
  i = ((i & 0x0F0F0F0Fu) << 4u) | ((i & 0xF0F0F0F0u) >> 4u);
  i = ((i & 0x00FF00FFu) << 8u) | ((i & 0xFF00FF00u) >> 8u);
  return float(i) * 2.32830643653086963e-10;
}

void main()
{
    if (clip != 0u) {
        if (!contains(screen_point, clip_rect)) discard;
    }

    switch(type) {
        case UI_PRIM_GLYPH:
        {
            // fwidth version
            vec3 msdf = texture(font_texture, sample_point).xyz;
            float sd = median(msdf.r, msdf.g, msdf.b);
            float w = fwidth(sd);
            float opacity = smoothstep(0.5 - w, 0.5 + w, sd);
            frag_data = vec4(color.xyz, opacity);
            break;
        }
        case UI_PRIM_TRIANGLE_ADVANCED_ICON:
        {
            frag_data = texture(icon_texture, vec2(sample_point.x, 1.0 - sample_point.y));
            break;
        }
        default: {
            frag_data = color;
            break;
        }
    }
}
