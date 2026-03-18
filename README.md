@unionengine/native
-------------------

> Script-driven application framework — WebGPU native via Dawn.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Application                     │
│  main.cpp  →  on_launch / on_frame / on_terminate│
└───────────────────┬─────────────────────────────┘
                    │
       ┌────────────┼────────────────┐
       ▼            ▼                ▼
  ┌─────────┐  ┌─────────┐   ┌──────────────┐
  │  ImGui  │  │ Script  │   │  GPU (Dawn)  │
  │ URL bar │  │ Engine  │   │  WebGPU API  │
  └─────────┘  └────┬────┘   └──────────────┘
                    │               │
            ┌───────┴──────┐   Dawn dispatches to:
            │  macOS: JSC  │   macOS  → Metal
            │  Windows: V8 │   Windows → D3D12
            │  Linux: QJS  │   Linux  → Vulkan
            └──────────────┘
```

## Core Components

| Component | Location | Description |
|-----------|----------|-------------|
| Entry point | `src/main.cpp` | C++ lifecycle: launch / frame / terminate |
| GPU backend | `src/gpu/gpu.dawn.cpp` | WebGPU via Dawn — single backend for all platforms |
| GPU abstraction | `src/gpu/gpu.h` | Platform-agnostic GPU API |
| ImGui layer | `src/imgui_layer.cpp` | URL input bar (imgui_impl_wgpu) |
| OS / window | `src/os/` + `src/apple/` | Native window, input, clipboard |
| Script engine | `src/script/` | JSC (macOS) · V8 (Windows) · Stub (Linux) |
| UI framework | `src/ui/` | Immediate-mode UI renderer |
| Foundation | `src/foundation/` | Strings, I/O, networking, logging, jobs |
| Networking | `src/foundation/network.c` | Native sockets + worker thread queue |

## GPU Backend — Dawn (WebGPU)

The only GPU backend is **Dawn**, Google's reference WebGPU implementation.
Dawn translates WebGPU calls to the platform's native graphics API:

| Platform | Native API |
|----------|-----------|
| macOS    | Metal (via `CAMetalLayer`) |
| Windows  | Direct3D 12 |
| Linux    | Vulkan |

Application code only uses the WebGPU C API (`webgpu/webgpu.h`).
No Metal, Vulkan, or D3D code exists in the application layer.

## Script Engines

| Platform | Engine | Notes |
|----------|--------|-------|
| macOS    | JavaScriptCore | System framework, zero extra build step |
| Windows  | V8 | Requires separate V8 build (see dep.py) |
| Linux    | Stub | No embedded script runtime dependency |

The script engine is auto-selected by CMake based on the host platform.
Scripts are loaded from a JavaScript URL or file entry (default: `http://127.0.0.1:3003/main.js`)
entered via the ImGui address bar at runtime.

## URL Address Bar

On launch a floating address bar appears at the top of the window.
Enter a `.js` or `.mjs` URL and press **Enter** or **Load** to fetch and
execute the JavaScript entry. HTML pages and wasm bundles are not supported.
Press **Hide** to dismiss the bar.

The bar is implemented entirely with the project's own native UI system
(`ui_input_t`, `ui_button_t`, `fill_round_rect`) — no external GUI
library is required.

## Build

```shell
# 1. Clone / pin dependency sources
python script/dep.py download

# 2. Compile dependencies (Dawn and platform script engine)
python script/dep.py compile
# or debug build:
python script/dep.py --debug compile

# 3. Configure and build
mkdir build && cd build
cmake ..
make -j$(nproc)

# 4. Run
./un
```

> **Note:** Dawn requires `DAWN_FETCH_DEPENDENCIES=ON` (set automatically
> by dep.py) which downloads additional third-party sources via CMake on
> first configure.

## Development (hot reload)

```shell
# Start the esbuild dev server on :3003
npm install
npm run dev

# In another terminal — build and run the native app
mkdir -p build && cd build && cmake .. && make && ./un
```

The app loads `http://127.0.0.1:3003/main.js` by default.  Edit TypeScript
in `node/src/` and the dev server hot-reloads instantly.

## Project Structure

```
union_native/
├── src/
│   ├── main.cpp              # Entry point (C++)
│   ├── imgui_layer.h/cpp     # ImGui URL address bar
│   ├── foundation/           # Core utilities (strings, I/O, net, log)
│   ├── os/                   # Cross-platform OS abstraction
│   ├── gpu/
│   │   ├── gpu.h             # GPU API (platform-agnostic)
│   │   ├── gpu.c             # Pixel-format helpers
│   │   └── gpu.dawn.cpp      # Dawn WebGPU backend
│   ├── ui/                   # Immediate-mode UI framework
│   ├── script/
│   │   ├── script.h          # Script engine API
│   │   ├── script.jsc.c      # JavaScriptCore backend (macOS)
│   │   ├── script.v8.cpp     # V8 backend (Windows)
│   │   └── script.stub.c     # Stub backend (Linux)
│   └── apple/
│       ├── os.m              # Shared Apple OS utils
│       └── os.macos.mm       # macOS window (NSView + CAMetalLayer)
├── cmake/                    # CMake modules
├── script/
│   └── dep.py                # Dependency manager (Dawn, V8)
├── third_party/              # Headers + compiled libs (generated)
│   └── source/imgui/         # ImGui source (compiled into project)
└── node/                     # TypeScript / esbuild dev toolchain
```

## Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| Dawn | chromium/6736 | WebGPU implementation |
| JavaScriptCore | system | JS engine (macOS) |
| V8 | 12.3 | JS engine (Windows) |
| stb | header | Image loading, data structures |
