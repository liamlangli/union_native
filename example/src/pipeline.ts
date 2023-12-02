import { DepthCompareFunc, Pipeline, create_pipeline } from "@union_native/core";

export function create_default_pipeline(): Pipeline {
    const vertex_shader = `#version 300 es
    precision highp float;
    precision highp int;
    layout(location = 0) in vec3 position;
    layout(location = 1) in vec2 uv;

    out vec2 v_uv;

    void main() {
        v_uv = uv;
        gl_Position = vec4(position, 1.0);
    }
    `;

    const fragment_shader = `#version 300 es
    precision highp float;
    precision highp int;
    in vec2 v_uv;
    out vec4 frag_data;

    void main() {
        frag_data = vec4(v_uv, 0.0, 1.0);
    }
    `;

    return create_pipeline({
        name: "default pipeline",
        vertex_shader,
        fragment_shader,
        depth_write: true,
        depth_compare_func: DepthCompareFunc.Always
    })!;
}
