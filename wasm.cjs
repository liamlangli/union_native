const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const source_path = path.join(__dirname, "third_party/source");
const sdks = {
    linux:
        "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/wasi-sdk-22.0-linux.tar.gz",
    darwin:
        "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/wasi-sdk-22.0-macos.tar.gz",
    windows:
        "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/wasi-sdk-22.0.m-mingw.tar.gz",
};

const rt_url =
    "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/libclang_rt.builtins-wasm32-wasi-22.0.tar.gz";

function download() {
    // download source
    if (!fs.existsSync(source_path)) {
        fs.mkdirSync(source_path, { recursive: true });
    }

    const wasi_path = path.join(source_path, "wasi-sdk");
    if (fs.existsSync(wasi_path)) {
        console.log(`wasi path exists, skip download`);
        return;
    }

    const platform = process.platform;
    if (platform === "win32") {
        console.log("windows is not supported");
        process.exit(1);
    }

    const sdk = sdks[platform];
    if (!sdk) {
        console.log(`unsupported platform: ${platform}`);
        process.exit(1);
    }

    // download sdk
    const sdk_path = path.join(source_path, "wasi-sdk.tar.gz");
    const cmd = `curl -L ${sdk} -o ${sdk_path}`;
    console.log(cmd);
    execSync(cmd);

    // extract sdk
    const extract_cmd = `tar -xzf ${sdk_path} -C ${source_path}`;
    console.log(extract_cmd);
    execSync(extract_cmd);

    // download runtime
    const rt_path = path.join(
        source_path,
        "libclang_rt.builtins-wasm32-wasi-22.0.tar.gz",
    );
    const rt_cmd = `curl -L ${rt_url} -o ${rt_path}`;
    console.log(rt_cmd);
    execSync(rt_cmd);

    // extract runtime
    const rt_extract_cmd = `tar -xzf ${rt_path} -C ${source_path}`;
    console.log(rt_extract_cmd);
    execSync(rt_extract_cmd);

    // cleanup
    fs.rmSync(sdk_path);
    fs.rmSync(rt_path);
}

function compile() {
    const build_path = path.join(__dirname, "build");
    if (!fs.existsSync(build_path)) {
        fs.mkdirSync(build_path, { recursive: true });
    }

    // export WASI_SDK_PATH
    const wasi_path = path.join(source_path, "wasi-sdk-22.0");
    const sysroot_path = path.join(wasi_path, "share/wasi-sysroot");
    process.env.WASI_SDK_PATH = wasi_path;

    const src_path = path.join(__dirname, "src");
    const ui_path = path.join(src_path, "ui");
    // end with .c
    const ui_sources = fs
        .readdirSync(ui_path)
        .filter((file) => file.endsWith(".c"))
        .map((file) => path.join(ui_path, file));
    // compile all source to one wasm with cmake file in cmake/ui.cmake
    const clang = `${wasi_path}/bin/clang\
    --sysroot=${sysroot_path}\
    --target=wasm32-wasi\
    -Wl,--no-entry\
    -Wl,--export-all\
    -Wl,--allow-undefined\
    -Wl,--lto-O3\
    -Wl,--strip-all\
    -o ${build_path}/ui.wasm\
    -I${src_path} -Ithird_party/stb\
    ${ui_sources.join(" ")}`;
    console.log(clang);
    execSync(clang);

    // compress wasm to brotli
    const br = `brotli ${build_path}/ui.wasm -o ${build_path}/ui.wasm.br`;
    console.log(br);
    execSync(br);
}

// parse arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("usage: node build.js [--debug] download|compile");
    process.exit(1);
} else {
    for (const arg of args) {
        if (arg.startsWith("--") || arg.startsWith("-")) {
            const flag_name = arg.slice(arg.lastIndexOf("-") + 1);
            if (flag_name === "debug") {
                debug = true;
            }
        }
    }

    const cmd = args[args.length - 1];
    if (cmd === "download") {
        download();
    } else if (cmd === "compile") {
        compile();
    } else if (cmd === "clean") {
        clean();
    } else {
        console.log(`unknown command: ${cmd}`);
        process.exit(1);
    }
}
