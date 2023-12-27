import { Camera, ColorRGBA, create_box_mesh, create_gpu_mesh, Engine, EngineEvent, EventHub, GFXDevice, GlobalEvent, GPUAction, GPUActionType, Mat4, MaterialBlock, SphericalControl, ZERO } from "@union_native/core";
import { create_default_pipeline } from "./pipeline";

const device = new GFXDevice({display_ratio: window.devicePixelRatio});
const encoder = device.encoder;
const engine = new Engine();

const action = {
    clear_color: new ColorRGBA(0.1, 0.2, 0.3, 1),
    clear_depth: 1,
    type: GPUActionType.ClearAll
} as GPUAction;

const camera = new Camera();
camera.location.set(4, 4, 4);
camera.look_at(ZERO);
camera.perspective(60, window.innerWidth / window.innerHeight, 1, 1000);
const control = new SphericalControl(camera);
const pipeline = create_default_pipeline();
const material = new MaterialBlock();
material.set_mat4("world_matrix", new Mat4());

EventHub.on(GlobalEvent.MouseDrag, (payload) => {
    const delta = payload.delta;
    control.rotate_horizontal(delta.x / window.innerWidth);
    control.rotate_vertical(delta.y / window.innerHeight);
});

EventHub.on(GlobalEvent.MouseWheel, (payload) => {
    control.zoom(payload.delta_y > 0 ? 0.9 : 1.1);
});

window.addEventListener('resize', () => {
    device.display_ratio = window.devicePixelRatio;
    device.set_size(window.innerWidth, window.innerHeight);
    camera.perspective(60, window.innerWidth / window.innerHeight, 0.1, 1000);
});

const cube = create_box_mesh();
function frame() {
    control.update();
    encoder.set_viewport(0, 0, device.width, device.height);
    encoder.clear(action);
    encoder.set_pipeline(pipeline);
    encoder.set_camera(camera);
    encoder.set_material_block(material);
    encoder.draw_mesh(create_gpu_mesh(cube));
    encoder.commit();
}

EventHub.on(EngineEvent.Frame, frame);

engine.start();