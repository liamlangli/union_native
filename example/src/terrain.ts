import { Camera, ColorRGBA, CullMode, DepthCompareFunc, Engine, EngineEvent, EventHub, Float3, GFXDevice, GPUAction, GPUActionType, GlobalEvent, Mat4, MaterialBlock, QUATERNION_IDENTITY, SphericalControl, UniformType, WebGLEncoder, ZERO, create_pipeline } from "@union_native/core";
import terrain_frag from '../public/shader/terrain.frag';
import terrain_vert from '../public/shader/terrain.vert';

const device = new GFXDevice({display_ratio: window.devicePixelRatio });
const encoder = device.encoder;
const engine = new Engine();
const gl = (encoder as WebGLEncoder).gl;

window.addEventListener('resize', () => {
    device.display_ratio = window.devicePixelRatio;
    device.set_size(window.innerWidth, window.innerHeight);
    console.log('resize ', window.innerWidth, window.innerHeight, window.devicePixelRatio);
});

window.addEventListener('mousemove', (e) => {
    console.log('mouse move', e.clientX, e.clientY);
});

const action = {
    clear_color: new ColorRGBA(0, 0, 0, 0),
    clear_depth: 1,
    type: GPUActionType.ClearAll
} as GPUAction;

const camera = new Camera();
camera.location.set(30, 30, 30);
camera.perspective(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.look_at(ZERO);
const control = new SphericalControl(camera);

EventHub.on(GlobalEvent.MouseDrag, (payload) => {
    const delta = payload.delta;
    control.rotate_horizontal(delta.x / window.innerWidth);
    control.rotate_vertical(delta.y / window.innerHeight);
});

EventHub.on(GlobalEvent.MouseWheel, (payload) => {
    control.zoom(payload.delta_y > 0 ? 0.9 : 1.1);
});

const scale = new Float3(2, 2, 2);
const material_block = new MaterialBlock();
material_block.set_mat4('world_matrix', new Mat4().compose(ZERO, QUATERNION_IDENTITY, scale));

const pipeline = create_pipeline({
    name: 'terrain pipeline',
    vertex_shader: terrain_vert,
    fragment_shader: terrain_frag,
    uniforms: [
        { name: 'world_matrix', type: UniformType.Mat4 },
        { name: 'frame_block.view_matrix', type: UniformType.Mat4 },
        { name: 'frame_block.projection_matrix', type: UniformType.Mat4 }
    ],
    cull_mode: CullMode.None,
    depth_compare_func: DepthCompareFunc.Always
})!;

function frame() {
    control.update();
    encoder.clear(action);
    encoder.set_viewport(0, 0, device.width, device.height);
    encoder.set_pipeline(pipeline);
    encoder.set_camera(camera);
    encoder.set_material_block(material_block);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 20 * 8);
    encoder.commit();
}

EventHub.on(EngineEvent.Frame, frame);
engine.start();