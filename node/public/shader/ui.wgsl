struct UiUniform {
    window_size: vec4<f32>,
}

@group(0) @binding(0) var<uniform> material_block: UiUniform;
@group(0) @binding(1) var primitive_buffer: texture_2d<f32>;
@group(0) @binding(2) var font_texture: texture_2d<f32>;
@group(0) @binding(3) var icon_texture: texture_2d<f32>;
@group(0) @binding(4) var linear_sampler: sampler;

const GLYPH_MASK: u32 = 0x80000000u;
const UI_PRIM_GLYPH: u32 = 32u;
const UI_PRIM_TRIANGLE_ADVANCED_ICON: u32 = 4u;

struct VertexInput {
    @location(0) index: u32,
}

struct VertexOutput {
    @location(0) clip_rect: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) sample_point: vec2<f32>,
    @location(3) screen_point: vec2<f32>,
    @location(4) @interpolate(flat) primitive_type: u32,
    @location(5) @interpolate(flat) clip: u32,
    @builtin(position) position: vec4<f32>,
}

fn fetch_primitive_buffer(pixel_index: u32) -> vec4<f32> {
    let size = textureDimensions(primitive_buffer);
    let x = pixel_index % size.x;
    let y = pixel_index / size.x;
    return textureLoad(primitive_buffer, vec2<i32>(i32(x), i32(y)), 0);
}

fn decode_primitive_type(id: u32) -> u32 {
    return (id >> 26u) & 0x3fu;
}

fn decode_primitive_buffer_offset(id: u32) -> u32 {
    return id & 0x00ffffffu;
}

fn decode_corner_id(id: u32) -> u32 {
    return (id >> 24u) & 0x3u;
}

fn decode_header_offset(id: u32) -> u32 {
    return (id >> 26u) & 0x1fu;
}

fn decode_color(color: u32) -> vec4<f32> {
    return vec4<f32>(
        f32((color >> 24u) & 0xffu) / 255.0,
        f32((color >> 16u) & 0xffu) / 255.0,
        f32((color >> 8u) & 0xffu) / 255.0,
        f32(color & 0xffu) / 255.0);
}

fn rect_vertex(rect: vec4<f32>, corner_id: u32) -> vec4<f32> {
    let x = rect.x + select(0.0, rect.z, corner_id == 1u || corner_id == 3u);
    let y = rect.y + select(0.0, rect.w, corner_id == 2u || corner_id == 3u);
    return vec4<f32>(x, y, 0.0, 1.0);
}

@vertex
fn vertex_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    var vertex = vec4<f32>(0.0, 0.0, 0.0, 1.0);

    let ui_vertex_id = in.index;
    let ptr = decode_primitive_buffer_offset(ui_vertex_id);

    if ((ui_vertex_id & GLYPH_MASK) != 0u) {
        let corner_id = decode_corner_id(ui_vertex_id);
        let header_offset = decode_header_offset(ui_vertex_id);
        let header_ptr = ptr - header_offset - 1u;

        let glyph_data = fetch_primitive_buffer(ptr);
        let glyph_header = fetch_primitive_buffer(header_ptr);
        let glyph_scale = glyph_data.w;

        let font_ptr = bitcast<u32>(glyph_header.z);
        let font_data = fetch_primitive_buffer(font_ptr);
        let glyph_ptr = font_ptr + 2u + bitcast<u32>(glyph_data.y) * 2u;
        let font_texture_size = font_data.xy;

        let glyph_origin = glyph_header.xy;
        let glyph_sample_rect = fetch_primitive_buffer(glyph_ptr);
        let glyph_sample_data = fetch_primitive_buffer(glyph_ptr + 1u);
        let primitive_rect = vec4<f32>(
            glyph_origin + vec2<f32>(glyph_data.x, glyph_sample_data.y * glyph_scale),
            glyph_sample_rect.zw * glyph_scale);

        vertex = rect_vertex(primitive_rect, corner_id);
        out.color = decode_color(bitcast<u32>(glyph_data.z));

        let raw_clip = u32(glyph_header.w);
        out.clip = select(header_ptr - raw_clip, 0u, raw_clip == 0u);
        out.sample_point = rect_vertex(glyph_sample_rect, corner_id).xy / font_texture_size;
        out.primitive_type = UI_PRIM_GLYPH + u32(font_data.z);
    } else {
        out.primitive_type = decode_primitive_type(ui_vertex_id);

        if (out.primitive_type == 1u) {
            let corner_id = decode_corner_id(ui_vertex_id);
            let primitive_data = fetch_primitive_buffer(ptr);
            let rect_data = fetch_primitive_buffer(ptr + 1u);

            vertex = rect_vertex(primitive_data, corner_id);
            out.color = decode_color(bitcast<u32>(rect_data.x));
            let raw_clip = u32(rect_data.y);
            out.clip = select(ptr - raw_clip, 0u, raw_clip == 0u);
        } else {
            let primitive_data = fetch_primitive_buffer(ptr);
            vertex = vec4<f32>(primitive_data.xy, 0.0, 1.0);
            out.color = decode_color(bitcast<u32>(primitive_data.z));
            let raw_clip = bitcast<u32>(primitive_data.w);
            out.clip = select(ptr - raw_clip, 0u, raw_clip == 0u);

            if (out.primitive_type != 2u) {
                let sample_data = fetch_primitive_buffer(ptr + 1u);
                out.sample_point = sample_data.xy;
                out.primitive_type = bitcast<u32>(sample_data.z);
            }
        }
    }

    if (out.clip != 0u) {
        out.clip_rect = fetch_primitive_buffer(out.clip);
    } else {
        out.clip_rect = vec4<f32>(0.0);
    }

    out.screen_point = vertex.xy;

    let window_size = material_block.window_size.xy;
    var clip_position = vec4<f32>(vertex.x * 2.0 - window_size.x, window_size.y - vertex.y * 2.0, 0.0, 1.0);
    out.position = vec4<f32>(clip_position.xy / window_size, clip_position.z, clip_position.w);
    return out;
}

fn median3(value: vec3<f32>) -> f32 {
    return max(min(value.x, value.y), min(max(value.x, value.y), value.z));
}

fn contains(point: vec2<f32>, rect: vec4<f32>) -> bool {
    return point.x >= rect.x && point.y >= rect.y && point.x <= rect.x + rect.z && point.y <= rect.y + rect.w;
}

@fragment
fn fragment_main(in: VertexOutput) -> @location(0) vec4<f32> {
    if (in.clip != 0u && !contains(in.screen_point, in.clip_rect)) {
        discard;
    }

    if (in.primitive_type == UI_PRIM_GLYPH) {
        let msdf = textureSampleLevel(font_texture, linear_sampler, in.sample_point, 0.0).xyz;
        let sd = median3(msdf);
        let opacity = smoothstep(0.45, 0.55, sd);
        return vec4<f32>(in.color.xyz, opacity);
    }

    if (in.primitive_type == UI_PRIM_TRIANGLE_ADVANCED_ICON) {
        return textureSampleLevel(icon_texture, linear_sampler, in.sample_point, 0.0);
    }

    return in.color;
}