#include "script/script_context.h"
#include "script/browser.h"
#include "script/webgl2.h"
#include "ui/ui_dev_tool.h"
#include "foundation/network.h"
#include "foundation/logger.h"
#include "foundation/io.h"

#include <quickjs/quickjs-libc.h>
#include <quickjs/quickjs.h>
#include <stb_ds.h>
#include <uv.h>

typedef struct qjs_module {
    JSRuntime *runtime;
    JSContext *context;
} qjs_module;

static script_context_t shared_context = {0};
static qjs_module shared_module = {0};

void script_context_init(os_window_t *window) {
    shared_module.runtime = JS_NewRuntime();
    shared_context.module = (void *)&shared_module;
    shared_context.window = window;
    shared_context.db = db_open(ustring_STR("union"));
    shared_context.invalid_script = true;
    ui_renderer_init(&shared_context.renderer);
    ui_state_init(&shared_context.state, &shared_context.renderer);
    ui_dev_tool_init(&shared_context.dev_tool);
}

void script_context_terminate(void) {
    if (shared_module.runtime == NULL)
        return;
    JS_FreeRuntime(shared_module.runtime);
    shared_module.runtime = NULL;

    ui_renderer_free(&shared_context.renderer);
    db_close(shared_context.db);
}

script_context_t *script_context_shared(void) { return &shared_context; }
void *script_context_internal(void) { return shared_module.context; }
void *script_runtime_internal(void) { return shared_module.runtime; }

void script_context_destroy(void) {
    if (shared_module.context == NULL)
        return;
    JS_FreeContext(shared_module.context);
    shared_module.context = NULL;
}

void script_context_cleanup(void) {
    script_browser_cleanup();
    script_webgl2_cleanup();
    script_context_destroy();
}

void script_context_setup(void) {
    shared_module.context = JS_NewContext(shared_module.runtime);
    script_browser_register();
    script_webgl2_register();
}

int script_eval(ustring source, ustring_view filename) {
    int ret;

    if (source.length == 0) {
        LOG_INFO("source is empty");
        return -1;
    }

    script_context_cleanup();
    script_context_setup();
    JSContext *ctx = script_context_internal();
    JSValue val = JS_Eval(ctx, source.data, source.length, filename.base.data, 0);

    if (JS_IsException(val)) {
        js_std_dump_error(ctx);
        ret = -1;
    } else {
        ret = 0;
    }

    JS_FreeValue(ctx, val);
    return ret;
}

static void on_remote_script_download(net_request_t request, net_response_t response) {
    LOG_INFO_FMT("download remote script: {v}", request.url);
    LOG_INFO_FMT("status: {d}", response.status);
    LOG_INFO_FMT("content_length: {d}", response.content_length);
    shared_context.invalid_script = script_eval(ustring_view_to_ustring(&response.body), request.url.url) != 0;
    script_context_t *ctx = script_context_shared();

    os_window_t *window = shared_context.window;
    os_window_on_resize(window, window->width, window->height);
}

int script_eval_uri(ustring_view uri) {
    if (strncasecmp(uri.base.data, "http", 4) == 0) {
        url_t url = url_parse(uri);
        if (!url.valid) {
            LOG_WARN_FMT("invalid url: {v}", uri);
            return -1;
        }
        LOG_INFO_FMT("download remote script: {v}", uri);
        url_dump(url);
        net_download_async(url, on_remote_script_download);
    } else {
        ustring content = io_read_file(uri);
        shared_context.invalid_script = script_eval(content, uri) != 0;
        ustring_free(&content);
    }

    os_window_t *window = shared_context.window;
    os_window_on_resize(window, window->width, window->height);
    return 0;
}

void script_context_loop_tick() {
    if (shared_context.invalid_script) {
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        glClear(GL_DEPTH_BUFFER_BIT | GL_COLOR_BUFFER_BIT);
        ui_dev_tool(&shared_context.state, &shared_context.dev_tool);
        ui_renderer_render(&shared_context.renderer);
        return;
    }

    script_browser_tick();
    ui_dev_tool(&shared_context.state, &shared_context.dev_tool);
    ui_renderer_render(&shared_context.renderer);

    int finished;
    JSContext *ctx;
    while ((finished = JS_ExecutePendingJob(script_runtime_internal(), &ctx)) != 0) {
        if (finished < 0) {
            js_std_dump_error(script_context_internal());
            break;
        }
    }

    uv_run(uv_default_loop(), UV_RUN_NOWAIT);
}
