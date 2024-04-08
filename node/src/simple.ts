import { gpu_request_device } from "@unionengine/core";

async function main() {
    console.log('simple example.');
    await gpu_request_device({force_webgpu: true});
}

main().then();