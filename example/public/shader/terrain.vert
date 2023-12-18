

layout(location = 0) in highp float altitude;
layout(location = 1) in mediump uvec2 yaw_pitch;

#define DEBUG

uniform mat4 world_matrix;

layout(std140) uniform frame_block {
    mat4 view_matrix;
    mat4 projection_matrix;
};

layout(std140) uniform terrain_block {
    vec2 chunk_location;
};

#ifdef DEBUG
    flat out vec4 color;
#endif

void main() {
    int vid = gl_VertexID;
    int line_vid = vid % 18;
    float line = float(vid / 18);
    float x = float(line_vid / 2);
    float z = float(line_vid % 2) + line;
#ifdef DEBUG
    color = vec4(float(line_vid / 2) / 8.0, line / 8.0, 0.0, 1.0);
#endif
    gl_Position = projection_matrix * view_matrix * world_matrix * vec4(x, 0.0, z, 1.0);
}