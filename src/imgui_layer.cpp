/**
 * imgui_layer.cpp — ImGui integration for the web-page URL input bar.
 *
 * Renders a small persistent window at the top of the screen.  The user
 * types a URL and presses Enter (or clicks Load); the URL is forwarded
 * to script_init() / script_eval_uri().
 *
 * GPU backend: imgui_impl_wgpu using the Dawn WebGPU device.
 * Platform:    custom (no GLFW/SDL dependency).
 */

#include "imgui_layer.h"
#include "script/script.h"
#include "foundation/ustring.h"
#include "foundation/logger.h"

#include <imgui.h>
#include <backends/imgui_impl_wgpu.h>

#include <webgpu/webgpu.h>

// Exposed by gpu.dawn.cpp
extern "C" WGPUDevice  gpu_dawn_device(void);
extern "C" WGPUQueue   gpu_dawn_queue(void);
// Pass-encoder is only valid between gpu_begin_render_pass / gpu_end_pass.
// ImGui draw calls are submitted via ImGui_ImplWGPU_RenderDrawData which
// takes the encoder directly.
extern "C" WGPURenderPassEncoder gpu_dawn_pass_encoder(void);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
static char  s_url[2048]      = "http://127.0.0.1:3003/main.js";
static bool  s_show_bar       = true;
static bool  s_script_loaded  = false;
static bool  s_initialized    = false;

static os_window_t *s_window  = nullptr;

// Simulated time (seconds) used by ImGui's io.DeltaTime
static double s_last_time = 0.0;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

void imgui_layer_init(os_window_t *window) {
    s_window = window;

    IMGUI_CHECKVERSION();
    ImGui::CreateContext();

    ImGuiIO &io = ImGui::GetIO();
    io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;
    io.DisplaySize  = ImVec2((float)window->width, (float)window->height);
    io.DeltaTime    = 1.0f / 60.0f;

    // Dark theme with slightly rounded windows
    ImGui::StyleColorsDark();
    ImGuiStyle &style = ImGui::GetStyle();
    style.WindowRounding   = 6.0f;
    style.FrameRounding    = 4.0f;
    style.GrabRounding     = 3.0f;
    style.WindowPadding    = ImVec2(10.f, 8.f);

    // --- WebGPU backend ---
    ImGui_ImplWGPU_InitInfo wgpu_info = {};
    wgpu_info.Device              = gpu_dawn_device();
    wgpu_info.NumFramesInFlight   = 3;
    wgpu_info.RenderTargetFormat  = WGPUTextureFormat_BGRA8Unorm;
    wgpu_info.DepthStencilFormat  = WGPUTextureFormat_Undefined;
    ImGui_ImplWGPU_Init(&wgpu_info);

    s_initialized = true;
}

void imgui_layer_new_frame(os_window_t *window) {
    if (!s_initialized) return;

    ImGuiIO &io = ImGui::GetIO();
    io.DisplaySize = ImVec2((float)window->width, (float)window->height);

    ImGui_ImplWGPU_NewFrame();
    ImGui::NewFrame();

    // -----------------------------------------------------------------
    // URL input bar
    // -----------------------------------------------------------------
    if (s_show_bar) {
        const float bar_width  = (float)window->width - 20.0f;
        const float bar_height = 64.0f;
        ImGui::SetNextWindowPos(ImVec2(10.f, 10.f), ImGuiCond_Always);
        ImGui::SetNextWindowSize(ImVec2(bar_width, bar_height), ImGuiCond_Always);
        ImGui::SetNextWindowBgAlpha(0.90f);

        ImGuiWindowFlags flags =
            ImGuiWindowFlags_NoCollapse |
            ImGuiWindowFlags_NoMove     |
            ImGuiWindowFlags_NoResize   |
            ImGuiWindowFlags_NoScrollbar;

        ImGui::Begin("##url_bar", nullptr, flags);

        ImGui::Text("URL:");
        ImGui::SameLine();

        ImGui::SetNextItemWidth(bar_width - 130.f);
        bool enter = ImGui::InputText("##url_input", s_url, sizeof(s_url),
                                      ImGuiInputTextFlags_EnterReturnsTrue);
        ImGui::SameLine();
        bool load = ImGui::Button("Load", ImVec2(80.f, 0.f));

        if (enter || load) {
            LOG_INFO("imgui_layer", s_url);
            script_init(s_window);
            ustring_view uri = { .data = s_url, .length = (u32)strlen(s_url) };
            script_eval_uri(uri);
            s_script_loaded = true;
            s_show_bar      = false;
        }

        ImGui::SameLine();
        if (ImGui::Button("Hide", ImVec2(50.f, 0.f))) {
            s_show_bar = false;
        }

        ImGui::End();
    }
}

void imgui_layer_render(void) {
    if (!s_initialized) return;
    ImGui::Render();
    WGPURenderPassEncoder enc = gpu_dawn_pass_encoder();
    if (enc) {
        ImGui_ImplWGPU_RenderDrawData(ImGui::GetDrawData(), enc);
    }
}

void imgui_layer_destroy(void) {
    if (!s_initialized) return;
    ImGui_ImplWGPU_Shutdown();
    ImGui::DestroyContext();
    s_initialized = false;
}

// ---------------------------------------------------------------------------
// Input forwarding
// ---------------------------------------------------------------------------

void imgui_layer_on_mouse_move(float x, float y) {
    ImGuiIO &io = ImGui::GetIO();
    io.AddMousePosEvent(x, y);
}

void imgui_layer_on_mouse_btn(int button, bool pressed) {
    ImGuiIO &io = ImGui::GetIO();
    io.AddMouseButtonEvent(button, pressed);
}

void imgui_layer_on_scroll(float dx, float dy) {
    ImGuiIO &io = ImGui::GetIO();
    io.AddMouseWheelEvent(dx, dy);
}

void imgui_layer_on_key(int key, bool pressed) {
    // Map our custom key codes to ImGui keys where applicable
    ImGuiIO &io = ImGui::GetIO();
    ImGuiKey imgui_key = ImGuiKey_None;

    switch (key) {
    case KEY_BACKSPACE: imgui_key = ImGuiKey_Backspace; break;
    case KEY_ESCAPE:    imgui_key = ImGuiKey_Escape;    break;
    case KEY_ENTER:     imgui_key = ImGuiKey_Enter;     break;
    case KEY_TAB:       imgui_key = ImGuiKey_Tab;       break;
    case KEY_LEFT:      imgui_key = ImGuiKey_LeftArrow; break;
    case KEY_RIGHT:     imgui_key = ImGuiKey_RightArrow;break;
    case KEY_UP:        imgui_key = ImGuiKey_UpArrow;   break;
    case KEY_DOWN:      imgui_key = ImGuiKey_DownArrow; break;
    case KEY_DELETE:    imgui_key = ImGuiKey_Delete;    break;
    case KEY_HOME:      imgui_key = ImGuiKey_Home;      break;
    case KEY_END:       imgui_key = ImGuiKey_End;       break;
    case KEY_PAGE_UP:   imgui_key = ImGuiKey_PageUp;    break;
    case KEY_PAGE_DOWN: imgui_key = ImGuiKey_PageDown;  break;
    default: break;
    }

    if (imgui_key != ImGuiKey_None)
        io.AddKeyEvent(imgui_key, pressed);
}

void imgui_layer_on_char(unsigned int c) {
    ImGui::GetIO().AddInputCharacter(c);
}
