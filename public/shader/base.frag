#version 300 es
precision mediump float;

in v_uv;

out vec4 frag_data;

void main() {
    frag_data = vec4(v_uv, 0.0, 1.0);
}