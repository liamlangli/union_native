import { gpu_request_device } from "@union_native/core/src/gpu";

async function main() {
    console.log('simple example.');
    const result = await gpu_request_device({ force_webgpu: true });
    console.log('resolved');
}

main().then(console.log);