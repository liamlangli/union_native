import { ColorRGBA, Engine, EngineEvent, EventHub, GFXBackend, GPUAction, GPUActionType, gfx_request_device } from "@union_native/core";

const device = gfx_request_device({ backend: GFXBackend.WebGPU });
const engine = new Engine();

const action = {
    clear_color: new ColorRGBA(0.1, 0.1, 0.1, 1),
    clear_depth: 1,
    type: GPUActionType.ClearAll
} as GPUAction;

function frame() {
}

EventHub.on(EngineEvent.Frame, frame);
engine.start();