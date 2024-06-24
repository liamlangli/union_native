import { is_union_native } from "../api";

async function main() {
    console.log("main func");
    const api = is_union_native();
    console.log(api);
}

main().then();