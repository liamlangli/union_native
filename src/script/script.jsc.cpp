#if defined(SCRIPT_BACKEND_JSC)

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

static script_t g_ctx = {};
static i8 g_db_bundle_name[] = "db";
static i8 g_http_prefix[] = "http";

static bool jsc_has_script_extension(const char *path, u32 length) {
    if (path == NULL || length < 3) return false;
    if (length >= 3 && strncmp(path + length - 3, ".js", 3) == 0) return true;
    if (length >= 4 && strncmp(path + length - 4, ".mjs", 4) == 0) return true;
    return false;
}

void script_init(os_window_t *window) {
    g_ctx.window = window;
    g_ctx.invalid_script = true;

    std::string bundle_path = os_get_bundle_path(g_db_bundle_name);
    g_ctx.db = db_open(bundle_path);

    ui_renderer_init();
    ui_renderer_set_size((u32)window->width, (u32)window->height);
    ui_state_init();
    ui_state_set_size((u32)window->width, (u32)window->height);
#ifdef UI_NATIVE
    ui_dev_tool_init(&g_ctx.dev_tool);
#endif
}

void script_terminate(void) {
    ui_renderer_free();
    db_close(g_ctx.db);
    g_ctx = {};
}

script_t *script_shared(void) { return &g_ctx; }

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
        if (!url.valid || !jsc_has_script_extension(url.path.c_str(), (u32)url.path.size())) {
            ULOG_WARN(uri_string.c_str());
            return -1;
        }
    } else if (!jsc_has_script_extension(uri.data(), (u32)uri.size())) {
        ULOG_WARN(uri_string.c_str());
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
    ui_renderer_set_size((u32)width, (u32)height);
    ui_state_set_size((u32)width, (u32)height);
}

void script_tick() {
    net_poll();
}

#endif