#include <metal_stdlib>
using namespace metal;

struct ui_uniform {
    float4 window_size;
};

#define UI_PRIM_RECTANGLE 1u
#define UI_PRIM_TRIANGLE 2u
#define UI_PRIM_TRIANGLE_ADVANCED 3u
#define GLYPH_MASK 0x80000000u

#define UI_PRIM_GLYPH 32u
#define UI_PRIM_GLYPH_CODE 33u

#define UI_PRIM_TRIANGLE_ADVANCED_ICON 4u

struct vertex_data {
    uint vertex_id [[attribute(0)]];
};

struct vertex_output {
    float4 clip_rect;
    float4 color;
    float2 sample_point;
    float2 screen_point;
    uint type [[flat]];
    uint clip [[flat]];
    float4 position [[position]];
};

float4 fetch_primitive_buffer(texture2d<float, access::read> buffer, uint pixel_index) {
    uint width = buffer.get_width();
    uint y = pixel_index / width;
    uint x = pixel_index % width;
    return buffer.read(uint2(x, y));
}

uint decode_primitive_type(uint id) {
    return (id >> 26) & 0x3Fu;
}

uint decode_primitive_buffer_offset(uint id) {
    return id & 0xFFFFFFu;
}

uint decode_corner_id(uint id) {
    return (id >> 24) & 0x3u;
}

uint decode_header_offset(uint id)
{
    return (id >> 26) & 0x1fu;
}

float4 decode_color(uint c) {
    return float4(float((c >> 24) & 0xFF) / 255.0, float((c >> 16) & 0xFF) / 255.0, float((c >> 8) & 0xFF) / 255.0, float(c & 0xFF) / 255.0);
}

float4 rect_vertex(float4 r, uint corner_id) {
    return float4(r.x + ((corner_id == 1u || corner_id == 3u) ? r.z : 0.), r.y + ((corner_id == 2u || corner_id == 3u) ? r.w : 0.), 0., 1.);
}

vertex vertex_output vertex_main(
    vertex_data in [[stage_in]],
    texture2d<float, access::read> primitive_buffer [[texture(0)]],
    constant ui_uniform &uniforms [[buffer(1)]]
) {
    vertex_output out;

    uint vertex_id = in.vertex_id;
    uint ptr = decode_primitive_buffer_offset(vertex_id);
    float4 v = float4(0., 0., 0., 1.0);

    if ((vertex_id & GLYPH_MASK) != 0u) {
        // draw glyph
        uint corner_id = decode_corner_id(vertex_id);
        uint header_offset = decode_header_offset(vertex_id);
        uint header_ptr = ptr - header_offset - 1u;

        float4 glyph_data = fetch_primitive_buffer(primitive_buffer, ptr);
        float4 glyph_header = fetch_primitive_buffer(primitive_buffer, header_ptr);
        float glpyh_scale = glyph_data.w;

        uint font_ptr = as_type<uint>(glyph_header.z);
        float4 font_data = fetch_primitive_buffer(primitive_buffer, font_ptr);
        uint glyph_ptr = font_ptr + 2u + as_type<uint>(glyph_data.y) * 2u;
        float2 font_texture_size = font_data.xy;

        float2 glyph_origin = glyph_header.xy;
        float4 glyph_sample_rect = fetch_primitive_buffer(primitive_buffer, glyph_ptr);
        float4 glyph_sample_data = fetch_primitive_buffer(primitive_buffer, glyph_ptr + 1u);

        float4 primitive_rect = float4(glyph_origin + float2(glyph_data.x, glyph_sample_data.y * glpyh_scale), glyph_sample_rect.zw * glpyh_scale);

        v.xy = rect_vertex(primitive_rect, corner_id).xy;
        out.color = decode_color(as_type<uint>(glyph_data.z));
        uint raw_clip = uint(glyph_header.w);
        out.clip = raw_clip == 0u ? 0u : header_ptr - raw_clip;

        out.sample_point = rect_vertex(glyph_sample_rect, corner_id).xy / font_texture_size;
        out.type = UI_PRIM_GLYPH + uint(font_data.z);

    } else {

        out.type = decode_primitive_type(vertex_id);
        if (out.type == UI_PRIM_RECTANGLE) {

            uint corner_id = decode_corner_id(vertex_id);
            float4 primitive_data = fetch_primitive_buffer(primitive_buffer, ptr);
            float4 rect_data = fetch_primitive_buffer(primitive_buffer, ptr + 1u);

            v = rect_vertex(primitive_data, corner_id);
            out.color = decode_color(as_type<uint>(rect_data.x));
            uint raw_clip = uint(rect_data.y);
            out.clip = raw_clip == 0u ? 0u : ptr - raw_clip;

        } else if (out.type == UI_PRIM_TRIANGLE) {

            float4 primitive_data = fetch_primitive_buffer(primitive_buffer, ptr);
            v.xy = primitive_data.xy;
            out.color = decode_color(as_type<uint>(primitive_data.z));
            uint raw_clip = as_type<uint>(primitive_data.w);
            out.clip = raw_clip == 0u ? 0u : ptr - raw_clip;

        } else {

            float4 primitive_data = fetch_primitive_buffer(primitive_buffer, ptr);
            v.xy = primitive_data.xy;
            out.color = decode_color(as_type<uint>(primitive_data.z));
            uint raw_clip = as_type<uint>(primitive_data.w);
            out.clip = raw_clip == 0u ? 0u : ptr - raw_clip;

            float4 sample_data = fetch_primitive_buffer(primitive_buffer, ptr + 1u);
            out.sample_point = sample_data.xy;

            out.type = as_type<uint>(sample_data.z);
        }
    }

    if (out.clip != 0u) {
        out.clip_rect = fetch_primitive_buffer(primitive_buffer, out.clip);
    }

    out.screen_point = v.xy;

    float2 window_size = uniforms.window_size.xy;
    out.position = float4(v.x * 2.0 - window_size.x, window_size.y - v.y * 2.0, 0.0, 1.0);
    out.position.xy /= window_size.xy;
    return out;
}


float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

bool contains(float2 p, float4 r) {
    return p.x >= r.x && p.y >= r.y && p.x <= (r.x + r.z) && p.y <= (r.y + r.w);
}

fragment float4 fragment_main(
    vertex_output in [[stage_in]],
    texture2d<float> font_texture [[texture(0)]],
    texture2d<float> icon_texture [[texture(1)]])
{
    if (in.clip != 0u && !contains(in.screen_point, in.clip_rect)) discard_fragment();
    sampler linear_sampler(mag_filter::linear, min_filter::linear);
    if (in.type == UI_PRIM_GLYPH) {
        float3 msdf = font_texture.sample(linear_sampler, in.sample_point).xyz;
        float sd = median(msdf.r, msdf.g, msdf.b);
        float w = fwidth(sd);
        float opacity = smoothstep(0.5 - w, 0.5 + w, sd);
        return float4(in.color.xyz, opacity);
    } else if (in.type == UI_PRIM_TRIANGLE_ADVANCED_ICON) {
        return icon_texture.sample(linear_sampler, in.sample_point);
    } else {
        return in.color;
    }
}

