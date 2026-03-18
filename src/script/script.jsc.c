#if defined(SCRIPT_BACKEND_JSC)

#include "script/script.h"
#include "script/script_gpu.h"
#include "foundation/global.h"
#include "foundation/ustring.h"
#include "foundation/network.h"
#include "foundation/logger.h"
#include "foundation/io.h"
#include "ui/ui_dev_tool.h"
#include "ui/ui_renderer.h"
#include "ui/ui_state.h"

static script_t g_ctx = {0};

static bool jsc_has_script_extension(const char *path, u32 length) {
    if (path == NULL || length < 3) return false;
    if (length >= 3 && strncmp(path + length - 3, ".js", 3) == 0) return true;
    if (length >= 4 && strncmp(path + length - 4, ".mjs", 4) == 0) return true;
    return false;
}

void script_init(os_window_t *window) {
    g_ctx.window = window;
    g_ctx.invalid_script = true;

    ustring bundle_path = os_get_bundle_path(ustring_STR("db"));
    g_ctx.db = db_open(bundle_path);

    ui_renderer_init();
    ui_renderer_set_size(window->width, window->height);
    ui_state_init();
    ui_state_set_size(window->width, window->height);
#ifdef UI_NATIVE
    ui_dev_tool_init(&g_ctx.dev_tool);
#endif
}

void script_terminate(void) {
    ui_renderer_free();
    db_close(g_ctx.db);
    g_ctx = (script_t){0};
}

script_t *script_shared(void) { return &g_ctx; }

void *script_internal(void) { return NULL; }
void *script_runtime_internal(void) { return NULL; }

void script_cleanup(void) {
    script_gpu_cleanup();
}
void script_setup(void) {}

int script_eval(ustring source, ustring_view filename) {
    return 0;
}

int script_eval_uri(ustring_view uri) {
    if (ustring_view_start_with_ustring(uri, ustring_STR("http"))) {
        url_t url = url_parse(uri);
        if (!url.valid || !jsc_has_script_extension(url.path.base.data + url.path.start, url.path.length)) {
            ULOG_WARN_FMT("script.jsc: only .js and .mjs URLs are supported: {v}", uri);
            return -1;
        }
    } else if (!jsc_has_script_extension(uri.base.data + uri.start, uri.length)) {
        ULOG_WARN_FMT("script.jsc: only .js and .mjs files are supported: {v}", uri);
        return -1;
    }
    return 0;
}

int script_eval_direct(ustring source, ustring *result) {
    return 0;
}

void script_mouse_move(f32 x, f32 y) {
    
}

void script_mouse_button(MOUSE_BUTTON button, BUTTON_ACTION action) {}
void script_key_action(KEYCODE key, BUTTON_ACTION action) {}
void script_resize(i32 width, i32 height) {
    ui_renderer_set_size(width, height);
    ui_state_set_size(width, height);
}
void script_tick() {
    net_poll();
}

#endif