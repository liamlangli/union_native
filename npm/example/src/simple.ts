import { ColorRGBA, Engine, EngineEvent, EventHub, GFXDevice, GPUAction, GPUActionType } from "@union_native/core";

const device = new GFXDevice();
const encoder = device.encoder;
const engine = new Engine();

const action = {
    clear_color: new ColorRGBA(0.1, 0.1, 0.1, 1),
    clear_depth: 1,
    type: GPUActionType.ClearAll
} as GPUAction;

function frame() {
    encoder.set_viewport(0, 0, device.width, device.height);
    encoder.clear(action);
    encoder.commit();
}

EventHub.on(EngineEvent.Frame, frame);
engine.start();