import { Camera, ColorRGBA, Engine, EngineEvent, EventHub, GFXDevice, GPUAction, GPUActionType, SphericalControl, ZERO, create_box_mesh, create_gpu_mesh } from "@union_native/core";
import { create_default_pipeline } from "./pipeline";

const device = new GFXDevice();
const encoder = device.encoder;
const engine = new Engine();

const camera = new Camera();
camera.location.set(4, 4, 4);
camera.look_at(ZERO);
camera.perspective(45, window.innerWidth / window.innerHeight, 1, 1000);
const control = new SphericalControl(camera);
const pipeline = create_default_pipeline();

const action = {
    clear_color: new ColorRGBA(0.1, 0.1, 0.3, 1),
    clear_depth: 1,
    type: GPUActionType.ClearAll
} as GPUAction;

const cube = create_box_mesh();
function frame() {
    control.update();
    encoder.clear(action);
    encoder.set_pipeline(pipeline);
    encoder.set_camera(camera);
    encoder.draw_mesh(create_gpu_mesh(cube));
    encoder.commit();
}

EventHub.on(EngineEvent.Frame, frame);

engine.start();