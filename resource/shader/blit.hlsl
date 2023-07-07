#pragma ps pixel_main
#pragma vs vertex_main

#define STARTS_AT_TOP 1

float2 fullscreen_triangle_texcoord(uint vertex_id) {
#if STARTS_AT_TOP
    return float2((vertex_id << 1) & 2, 1.0 - (vertex_id & 2));
#else
    return float2((vertex_id << 1) & 2, vertex_id & 2);
#endif
}

float4 fullscreen_triangle_vertex(uint vertex_id) {
    float2 uv = float2((vertex_id << 1) & 2, vertex_id & 2);
    return float4(uv * 2.0 - 1.0, 0.0, 1.0);
}

struct varying {
    float4 position : SV_POSITION;
    float2 uv : TEXCOORD;
};

float4x4 world_matrix;
float4x4 view_matrix;
float4x4 projection_matrix;

varying vertex_main(uint vertex_id : SV_VertexID) {
    varying output;
    output.position = fullscreen_triangle_vertex(vertex_id);
    output.uv = fullscreen_triangle_texcoord(vertex_id);
    return output;
}

float4 pixel_main(varying input) : SV_TARGET {
    return float4(input.uv, 0.0f, 1.0f);
}
