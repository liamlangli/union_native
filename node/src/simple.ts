import { gpu_request_device } from "@union_native/core/src/gpu";

async function main() {
    console.log('simple example.');
    gpu_request_device({ force_webgpu: true }).then(() => {}).catch(() => {});
}

main().then();