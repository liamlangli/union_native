import { request_native_adapter } from "../api";

async function main() {
    console.log("main func");
    const api = request_native_adapter();
    console.log(api?.gpu.gpu_request_device());
}

main().then();