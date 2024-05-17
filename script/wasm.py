import os
import shutil
import subprocess
import sys

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)

source_path = os.path.join(parent_dir, "third_party", "source")

sdks = {
    "linux": "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/wasi-sdk-22.0-linux.tar.gz",
    "darwin": "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/wasi-sdk-22.0-macos.tar.gz",
    "win32": "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/wasi-sdk-22.0.m-mingw.tar.gz",
}

rt_url = "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-22/libclang_rt.builtins-wasm32-wasi-22.0.tar.gz"

def run_cmd(cmd, cwd=None):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True, cwd=cwd)

def download():
    # Download source
    os.makedirs(source_path, exist_ok=True)

    wasi_path = os.path.join(source_path, "wasi-sdk")
    if os.path.exists(wasi_path):
        print("wasi path exists, skip download")
        return

    platform = sys.platform

    sdk = sdks.get(platform)
    if not sdk:
        print(f"unsupported platform: {platform}")
        sys.exit(1)

    # Download SDK
    sdk_path = os.path.join(source_path, "wasi-sdk.tar.gz")
    run_cmd(f"curl -L {sdk} -o {sdk_path}")

    # Extract SDK
    run_cmd(f"tar -xzf {sdk_path} -C {source_path}")

    # Download runtime
    rt_path = os.path.join(source_path, "libclang_rt.builtins-wasm32-wasi-22.0.tar.gz")
    run_cmd(f"curl -L {rt_url} -o {rt_path}")

    # Extract runtime
    run_cmd(f"tar -xzf {rt_path} -C {source_path}")

    # Cleanup
    os.remove(sdk_path)
    os.remove(rt_path)

def compile():
    build_path = os.path.join(parent_dir, "build")
    os.makedirs(build_path, exist_ok=True)

    # Export WASI_SDK_PATH
    wasi_path = os.path.join(source_path, "wasi-sdk-22.0")
    if sys.platform == "win32":
        wasi_path = os.path.join(source_path, "wasi-sdk-22.0+m")

    sysroot_path = os.path.join(wasi_path, "share", "wasi-sysroot")
    os.environ["WASI_SDK_PATH"] = wasi_path

    src_path = os.path.join(parent_dir, "src")
    ui_path = os.path.join(src_path, "ui")

    # Get all .c files in ui directory
    ui_sources = [os.path.join(ui_path, file) for file in os.listdir(ui_path) if file.endswith(".c")]

    # Add ustring dependency
    ui_sources.append(os.path.join(src_path, "foundation", "ustring.c"))

    # Compile all source files to one wasm file
    clang_cmd = f"""{wasi_path}/bin/clang \
    --sysroot={sysroot_path} \
    --target=wasm32-wasi \
    -Wl,--no-entry \
    -Wl,--export-all \
    -Wl,--allow-undefined \
    -Wl,--lto-O3 \
    -Wl,--strip-all \
    -o {build_path}/ui.wasm \
    -I{src_path} -Ithird_party/stb \
    {" ".join(ui_sources)}"""
    run_cmd(clang_cmd)

    # Compress wasm to brotli
    br_cmd = f"brotli {build_path}/ui.wasm -f -o {build_path}/ui.wasm.br"
    run_cmd(br_cmd)

def clean():
    if os.path.exists(build_path):
        shutil.rmtree(build_path)

# Parse arguments
args = sys.argv[1:]
if not args:
    print("usage: python build.py [--debug] download|compile|clean")
    sys.exit(1)

debug = "--debug" in args or "-d" in args

cmd = args[-1]
if cmd == "download":
    download()
elif cmd == "compile":
    compile()
elif cmd == "clean":
    clean()
else:
    print(f"unknown command: {cmd}")
    sys.exit(1)
