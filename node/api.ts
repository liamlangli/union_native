import { gpu_backend, gpu_binding, gpu_binding_desc, gpu_buffer, gpu_buffer_desc, gpu_mesh, gpu_mesh_desc, gpu_pipeline, gpu_pipeline_desc, gpu_sampler, gpu_sampler_desc, gpu_shader, gpu_shader_desc, gpu_texture, gpu_texture_desc } from "@unionengine/core";
import { gpu_extent3d, gpu_pipeline_reflection, gpu_render_pass, gpu_render_pass_desc } from "@unionengine/core/src/gpu/gpu_type";

export function is_union_native(): native_api | undefined {
   if (!/union_native/i.test(navigator.userAgent)) return;
   return (navigator as any).native_adapter as native_api;
}

export interface native_gpu_api {
    gpu_backend: gpu_backend;
    gpu_renderer: string;
    gpu_vendor: string;

    gpu_request_device(): void;
    gpu_create_buffer(desc: gpu_buffer_desc): gpu_buffer;
    gpu_create_texture(desc: gpu_texture_desc): gpu_texture;
    gpu_create_sampler(desc: gpu_sampler_desc): gpu_sampler;
    gpu_create_shader(desc: gpu_shader_desc): gpu_shader;
    gpu_create_pipeline(desc: gpu_pipeline_desc, on_complete?: (pipeline: gpu_pipeline) => void): gpu_pipeline;
    gpu_create_binding(desc: gpu_binding_desc): gpu_binding;
    gpu_create_mesh(desc: gpu_mesh_desc): gpu_mesh;
    gpu_create_render_pass(desc: gpu_render_pass_desc): gpu_render_pass;

    gpu_pipeline_get_reflection(pipeline: gpu_pipeline): gpu_pipeline_reflection | undefined;

    gpu_destroy_device(): void;
    gpu_destroy_buffer(buffer: gpu_buffer): void;
    gpu_destroy_texture(texture: gpu_texture): void;
    gpu_destroy_sampler(sampler: gpu_sampler): void;
    gpu_destroy_shader(shader: gpu_shader): void;
    gpu_destroy_pipeline(pipeline: gpu_pipeline): void;
    gpu_destroy_binding(binding: gpu_binding): void;
    gpu_destroy_mesh(mesh: gpu_mesh): void;
    gpu_destroy_render_pass(render_pass: gpu_render_pass): void;

    gpu_update_buffer(buffer: gpu_buffer, data: ArrayBufferView): void;
    gpu_update_texture(texture: gpu_texture, data: ArrayBufferView, size: gpu_extent3d): void;
    gpu_texture_set_sampler(texture: gpu_texture, sampler: gpu_sampler): void;

    gpu_begin_render_pass(render_pass: gpu_render_pass): void;
    gpu_end_pass(): void;

    gpu_set_pipeline(pipeline: gpu_pipeline): void;
    gpu_set_binding(binding: gpu_binding): void;
    gpu_set_mesh(mesh: gpu_mesh): void;

    gpu_commit(): void;
}

export interface native_window_api {
    on_key_action(callback: (key: number, action: number) => void): void;
    on_mouse_button(callback: (button: number, action: number) => void): void;
    on_mouse_move(callback: (x: number, y: number) => void): void;
    on_frame_tick(callback: (time: number, delta_time: number) => void): void;
}

export interface native_os_api {
    readfile_async(uri: string): Promise<string>;
}

export interface native_api {
    gpu: native_gpu_api;
    window: native_window_api;
    os: native_os_api;
    toggle_dev_tools(): void;
}
