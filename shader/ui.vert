#define UI_PRIM_RECTANGLE 1u
#define UI_PRIM_TRIANGLE 2u
#define UI_PRIM_TRIANGLE_ADVANCED 3u
#define GLYPH_MASK 0x80000000u

#define UI_PRIM_GLYPH 32u
#define UI_PRIM_GLYPH_CODE 33u

layout(location = 0) in uint vertex_id; // x, y, w, h

uniform sampler2D primitive_buffer;
uniform vec3 window_size;
uniform float time;

out vec4 clip_rect;
out vec4 color;
out vec2 sample_point;
out vec2 screen_point;
flat out highp uint type;
flat out highp uint clip;

vec4 fetch_primitive_buffer(const uint pixel_index) {
    uint width = uint(textureSize(primitive_buffer, 0).x);
    uint y = pixel_index / width;
    uint x = pixel_index % width;
    return texelFetch(primitive_buffer, ivec2(x, y), 0);
}

uint decode_primitive_type(uint id)
{
    return (id >> 26) & 0x3fu;
}

highp uint decode_primitive_buffer_offset(uint id)
{
    return id & 0xffffffu;
}

uint decode_corner_idx(uint id)
{
    return (id >> 24) & 0x3u;
}

uint decode_header_offset(uint id)
{
    return (id >> 26) & 0x1fu;
}

vec4 decode_color(float color)
{
    uint c = floatBitsToUint(color);
    return vec4(float((c >> 24) & 0xffu) / 255.0, float((c >> 16) & 0xffu) / 255.0, float((c >> 8) & 0xffu) / 255.0, float(c & 0xffu) / 255.0);
}

vec4 rect_vertex(vec4 r, uint corner_idx)
{
    return vec4(r.x + ((corner_idx == 1u || corner_idx == 3u) ? r.z : 0.), r.y + ((corner_idx == 2u || corner_idx == 3u) ? r.w : 0.), 0., 1.);     
}

void main()
{
    highp uint ptr = decode_primitive_buffer_offset(vertex_id);
    vec4 v = vec4(0., 0., 0., 1.0);

    if ((vertex_id & GLYPH_MASK) != 0u) {
        // draw glyph
        uint corner_id = decode_corner_idx(vertex_id);
        uint header_offset = decode_header_offset(vertex_id);
        uint header_ptr = ptr - header_offset - 1u;

        vec4 glyph_data = fetch_primitive_buffer(ptr);
        vec4 glyph_header = fetch_primitive_buffer(header_ptr);
        float glpyh_scale = glyph_data.w;

        uint font_ptr = uint(glyph_header.z);
        vec4 font_data = fetch_primitive_buffer(font_ptr);
        uint glyph_ptr = font_ptr + 2u + uint(glyph_data.y) * 2u;
        vec2 font_texture_size = font_data.xy;

        vec2 glyph_origin = glyph_header.xy;
        vec4 glyph_sample_rect = fetch_primitive_buffer(glyph_ptr);
        vec4 glyph_sample_data = fetch_primitive_buffer(glyph_ptr + 1u);

        vec4 primitive_rect = vec4(glyph_origin + vec2(glyph_data.x, glyph_sample_data.y * glpyh_scale), glyph_sample_rect.zw * glpyh_scale);

        v.xy = rect_vertex(primitive_rect, corner_id).xy;
        color = decode_color(glyph_data.z);
        uint raw_clip = uint(glyph_header.w);
        clip = raw_clip == 0u ? 0u : header_ptr - raw_clip;

        sample_point = rect_vertex(glyph_sample_rect, corner_id).xy / font_texture_size;
        type = UI_PRIM_GLYPH + uint(font_data.z);

    } else {

        type = decode_primitive_type(vertex_id);
        if (type == UI_PRIM_RECTANGLE) {

            uint corner_id = decode_corner_idx(vertex_id);
            vec4 primitive_data = fetch_primitive_buffer(ptr);
            vec4 rect_data = fetch_primitive_buffer(ptr + 1u);

            v = rect_vertex(primitive_data, corner_id);
            color = decode_color(rect_data.x);
            uint raw_clip = uint(rect_data.y);
            clip = raw_clip == 0u ? 0u : ptr - raw_clip;

        } else if (type == UI_PRIM_TRIANGLE) {
        
            vec4 primitive_data = fetch_primitive_buffer(ptr);
            v.xy = primitive_data.xy;
            color = decode_color(primitive_data.z);
            uint raw_clip = uint(primitive_data.w);
            clip = raw_clip == 0u ? 0u : ptr - raw_clip;

        } else {

            vec4 primitive_data = fetch_primitive_buffer(ptr);
            v.xy = primitive_data.xy;
            color = decode_color(primitive_data.z);
            uint raw_clip = uint(primitive_data.w);
            clip = raw_clip == 0u ? 0u : ptr - raw_clip;

            vec4 sample_data = fetch_primitive_buffer(ptr + 1u);
            sample_point = sample_data.xy;

            type = uint(sample_data.z);
        }
    }

    if (clip != 0u) {
        clip_rect = fetch_primitive_buffer(clip);
    }

    screen_point = v.xy;

    gl_Position = vec4(v.x * 2.0 - window_size.x, window_size.y - v.y * 2.0, 0.0, 1.0);
    gl_Position.xy /= window_size.xy;
}
