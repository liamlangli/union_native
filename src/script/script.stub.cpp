#if defined(SCRIPT_BACKEND_STUB)

#include "script/script.h"

#include "core/global.h"
#include "core/io.h"
#include "core/logger.h"
#include "core/network.h"
#include "core/text.h"
#include "script/script_gpu.h"
#include "ui/ui_dev_tool.h"
#include "ui/ui_renderer.h"
#include "ui/ui_state.h"

#include <cstring>

static script_t g_stub_context = {};
static i8 g_http_prefix[] = "http";

static bool stub_has_script_extension(const char *path, u32 length) {
    if (path == NULL || length < 3) return false;
    if (length >= 3 && strncmp(path + length - 3, ".js", 3) == 0) return true;
    if (length >= 4 && strncmp(path + length - 4, ".mjs", 4) == 0) return true;
    return false;
}

void script_init(os_window_t *window) {
    g_stub_context = {};
    g_stub_context.window = window;
    script_gpu_setup();
}

void script_terminate(void) {}

script_t *script_shared(void) { return &g_stub_context; }

void *script_internal(void) { return NULL; }
void *script_runtime_internal(void) { return NULL; }

void script_cleanup(void) {
    script_gpu_cleanup();
}

void script_setup(void) {}

int script_eval(std::string_view source, std::string_view filename) {
    (void)source;
    (void)filename;
    return 0;
}

int script_eval_uri(std::string_view uri) {
    std::string uri_string(uri);
    if (text_starts_with(uri, g_http_prefix)) {
        url_t url = url_parse(uri);
        if (!url.valid || !stub_has_script_extension(url.path.c_str(), (u32)url.path.size())) {
            ULOG_WARN(uri_string.c_str());
            return -1;
        }
        ULOG_WARN("script.stub: remote JavaScript loading is disabled on this backend");
        return -1;
    }

    if (!stub_has_script_extension(uri.data(), (u32)uri.size())) {
        ULOG_WARN(uri_string.c_str());
        return -1;
    }

    std::string content = io_read_file(os_get_bundle_path(uri));
    if (content.empty()) {
        ULOG_WARN("script.stub: failed to read file");
        return -1;
    }

    return 0;
}

int script_eval_direct(std::string_view source, std::string *result) {
    (void)source;
    (void)result;
    return 0;
}

void script_mouse_move(f32 x, f32 y) {
    (void)x;
    (void)y;
}

void script_mouse_button(MOUSE_BUTTON button, BUTTON_ACTION action) {
    (void)button;
    (void)action;
}

void script_key_action(KEYCODE key, BUTTON_ACTION action) {
    (void)key;
    (void)action;
}

void script_resize(i32 width, i32 height) {
    (void)width;
    (void)height;
}

void script_tick(void) {
#ifdef UI_NATIVE
    ui_dev_tool(&g_stub_context.dev_tool);
#endif
    ui_renderer_render();
    ui_state_update();
    net_poll();
}

#endif