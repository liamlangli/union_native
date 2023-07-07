#pragma ps pixel_main
#pragma vs vertex_main

struct vertex_input {
    float3 position : POSITION;
    float3 normal : NORMAL;
    float2 uv : TEXCOORD;
};

struct varying {
    float4 position : SV_POSITION;
    float2 uv : TEXCOORD;
};

float4x4 world_matrix;
float4x4 view_matrix;
float4x4 projection_matrix;

varying vertex_main(vertex_input input) {
    varying output;
    float4 position = float4(input.position, 1.0f);
    position = mul(position, world_matrix);
    position = mul(position, view_matrix);
    position = mul(position, projection_matrix);

    output.position = position;
    output.uv = input.uv;
    return output;
}

float4 pixel_main(varying input) : SV_TARGET {
    return float4(input.uv, 0.0f, 1.0f);
}
