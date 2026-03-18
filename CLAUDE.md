# union_native — Claude Code Memory

Project: `@unionengine/native` — script-driven application framework.
Repo: `liamlangli/union_native`
Active branch: `claude/simplify-webgpu-dawn-cVEUO`

---

## Architecture decisions (as of last session)

### GPU: Dawn (WebGPU) only
- **Single backend**: Dawn (`src/gpu/gpu.dawn.cpp`) via WebGPU C API.
- No Metal, Vulkan, or D3D code in application layer — Dawn handles that internally.
- `os_window_t::native_window` holds a `CAMetalLayer*` on macOS (set by `os.macos.mm`),
  a `HWND` on Windows, and an X11 window handle on Linux.
- Dawn surface created from the native handle in `gpu_request_device()`.
- `gpu_dawn_device()`, `gpu_dawn_queue()`, `gpu_dawn_pass_encoder()` expose raw Dawn
  handles for `imgui_impl_wgpu`.

### Script engines
| Platform | Engine | CMake define | Source file |
|----------|--------|-------------|-------------|
| macOS    | JavaScriptCore | `SCRIPT_BACKEND_JSC` | `script.jsc.c` |
| Windows  | V8     | `SCRIPT_BACKEND_V8`  | `script.v8.cpp` |
| Linux    | Stub | `SCRIPT_BACKEND_STUB` | `script.stub.c` |

Auto-selected in `cmake/Options.cmake` — do not override manually.

### URL address bar (self-hosted, no ImGui)
- `src/imgui_layer.h` / `src/imgui_layer.cpp`
- Shows a floating URL bar at top of window on launch.
- Built entirely on the project's own native UI system — **no Dear ImGui**.
- Key widgets used: `ui_input_t` (text field), `ui_button_t` (Load / Hide),
  `fill_round_rect` (panel background), `ui_theme_t` (colours).
- Rendered at `BAR_LAYER = 3` (top-most layer) so it appears above script content.
- `imgui_layer_new_frame(window)` draws bar widgets into the native UI buffers.
- `imgui_layer_render()` is a no-op — `ui_renderer_render()` inside `script_tick()` flushes everything.
- On Enter / Load: calls `script_eval_uri(s_url_input.label.text)` directly.
- Entry contract: only `.js` / `.mjs` script URLs or files are supported; no HTML scraping or wasm entry pipeline.

### Frame loop (main.cpp)
```
on_frame():
  gpu_begin_render_pass(screen_pass)
  imgui_layer_new_frame(window)   ← build ImGui URL bar
  script_tick()                   ← run loaded JS
  imgui_layer_render()            ← flush ImGui → WebGPU pass
  gpu_end_pass()
  gpu_commit()
```

### macOS window (os.macos.mm)
- **File**: `src/apple/os.macos.mm` (Objective-C++, renamed from `.m`)
- Uses a plain `NSView` with `wantsLayer=YES` + `CAMetalLayer` (no `MTKView`).
- Frame loop: `CVDisplayLink` → `dispatch_async(main_queue, frame_callback)`.
- `os_get_bundle_path` implemented here (removed duplicate from `os.m`).

---

## Key files

| File | Role |
|------|------|
| `src/main.cpp` | C++ entry point — on_launch / on_frame / on_terminate |
| `src/gpu/gpu.h` | GPU abstraction API (platform-agnostic) |
| `src/gpu/gpu.c` | Pixel-format math utilities |
| `src/gpu/gpu.dawn.cpp` | Dawn WebGPU backend (implements gpu.h) |
| `src/imgui_layer.h/cpp` | ImGui URL address bar |
| `src/script/script.h` | Script engine API |
| `src/script/script.v8.cpp` | V8 backend (Windows) |
| `src/script/script.jsc.c` | JSC backend (macOS) |
| `src/script/script.stub.c` | Stub backend (Linux) |
| `src/apple/os.macos.mm` | macOS window / event layer (Obj-C++) |
| `src/apple/os.m` | Shared Apple OS utilities |
| `src/os/os.h` | os_window_t + OS abstraction API |
| `CMakeLists.txt` | Main build — C CXX OBJC OBJCXX |
| `cmake/Options.cmake` | Script backend auto-selection + GPU define |
| `cmake/Link.cmake` | Dawn libs + per-platform links |
| `cmake/Include.cmake` | Dawn + ImGui include dirs |
| `script/dep.py` | Dependency manager (Dawn, V8) |

---

## Dependency layout

```
third_party/
  include/
    dawn/          ← Dawn + WebGPU headers (from dep.py compile)
    v8/            ← V8 headers (Windows)
    stb/           ← stb_image, stb_ds (header-only)
  lib/
    libdawn_native.a / dawn_native.lib
    libdawn_proc.a  / dawn_proc.lib
    libwebgpu_dawn.a / webgpu_dawn.lib
    v8.lib / libv8.a (Windows)
  source/
    dawn/          ← Dawn source (built via dep.py)
    imgui/         ← ImGui source (compiled into project via CMakeLists)
    v8/
```

---

## CMake notes

- Project languages: `C CXX OBJC OBJCXX`
- `CMAKE_CXX_STANDARD 17`
- `GPU_BACKEND_DAWN` preprocessor define is always set (Options.cmake).
- ImGui `.cpp` files are added to `PROJECT_SRC` directly from
  `third_party/source/imgui/` when that directory exists.
- Unity build enabled by default (`ENABLE_UNITY_BUILD ON`).

---

## Build workflow

```bash
# First time
python script/dep.py download
python script/dep.py compile

# Build
mkdir build && cd build && cmake .. && make -j$(nproc)
./un

# Dev (hot reload via esbuild on :3003)
npm install && npm run dev
# in another terminal:
mkdir -p build && cd build && cmake .. && make && ./un
```

---

## Removed (compared to original)

| What | Why |
|------|-----|
| `src/apple/metal.m` | Replaced by Dawn |
| `src/apple/metal_type.m` | Replaced by Dawn |
| `src/apple/metal.h` | Replaced by Dawn |
| `src/vulkan/device.c` | Replaced by Dawn |
| `MTKView` / MetalKit in window | Replaced by NSView + CAMetalLayer |
| QuickJS runtime dependency | Removed; Linux uses the stub backend |
| `ios` target (iOS.cmake) | Simplified to desktop only |

---

## Things to do / known gaps

- `gpu.dawn.cpp`: `wgpuAdapterRequestDeviceSync` is Dawn-specific — may need
  updating if Dawn API changes. Use `wgpuAdapterRequestDevice` + callback for
  standard WebGPU compliance.
- V8 build is extremely heavy (~20 GB). Consider shipping a prebuilt binary
  for Windows or documenting the depot_tools setup in more detail.
- ImGui platform backend is custom (no GLFW/SDL). Mouse/keyboard events are
  forwarded via `imgui_layer_on_*` calls from `os.c` — those calls should be
  wired in `os_window_on_*` functions once ImGui is confirmed working.
- `os.ios.m` still exists but iOS build path is untested after the Dawn migration.
- Dawn `chromium/6736` tag: verify against actual Dawn repo tag names
  (may need to use a commit hash instead of branch name).
