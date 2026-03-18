#if defined(SCRIPT_BACKEND_STUB)

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

static script_t g_stub_context = {0};

static bool stub_has_script_extension(const char *path, u32 length) {
    if (path == NULL || length < 3) return false;
    if (length >= 3 && strncmp(path + length - 3, ".js", 3) == 0) return true;
    if (length >= 4 && strncmp(path + length - 4, ".mjs", 4) == 0) return true;
    return false;
}

void script_init(os_window_t *window) {
    g_stub_context = (script_t){0};
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

int script_eval(ustring source, ustring_view filename) {
    (void)source;
    (void)filename;
    return 0;
}

int script_eval_uri(ustring_view uri) {
    if (ustring_view_start_with_ustring(uri, ustring_STR("http"))) {
        url_t url = url_parse(uri);
        if (!url.valid || !stub_has_script_extension(url.path.base.data + url.path.start, url.path.length)) {
            ULOG_WARN_FMT("script.stub: only .js and .mjs URLs are supported: {v}", uri);
            return -1;
        }
        ULOG_WARN_FMT("script.stub: remote JavaScript loading is disabled on this backend: {v}", uri);
        return -1;
    }

    if (!stub_has_script_extension(uri.base.data + uri.start, uri.length)) {
        ULOG_WARN_FMT("script.stub: only .js and .mjs files are supported: {v}", uri);
        return -1;
    }

    ustring content = io_read_file(os_get_bundle_path(ustring_view_to_new_ustring(&uri)));
    if (content.length == 0) {
        ULOG_WARN_FMT("script.stub: failed to read file: {v}", uri);
        return -1;
    }

    ustring_free(&content);
    return 0;
}

int script_eval_direct(ustring source, ustring *result) {
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