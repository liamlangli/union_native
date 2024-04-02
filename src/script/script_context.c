#include "script/script_context.h"
#include "foundation/global.h"
#include "foundation/ustring.h"
#include "script/browser.h"
#include "ui/ui_dev_tool.h"
#include "foundation/network.h"
#include "foundation/logger.h"
#include "foundation/io.h"

#include <quickjs/quickjs.h>
#include <stb_ds.h>
#include <stdio.h>
#include <unistd.h>
#include <uv.h>
#include <assert.h>
#include <sys/stat.h>

typedef struct qjs_module {
    JSRuntime *runtime;
    JSContext *context;
} qjs_module;

static script_context_t shared_context = {0};
static qjs_module shared_module = {0};

static void script_dump_obj(JSContext *ctx, JSValueConst val) {
    const char *str;
    str = JS_ToCString(ctx, val);
    if (str) {
        ULOG_ERROR(str);
        JS_FreeCString(ctx, str);
    } else {
        ULOG_ERROR("[exception]]");
    }
}

void script_dump_error(JSContext *ctx) {
    bool is_error;
    
    JSValue exception = JS_GetException(ctx);
    is_error = JS_IsError(ctx, exception);
    script_dump_obj(ctx, exception);
    if (is_error) {
        JSValue val = JS_GetPropertyStr(ctx, val, "stack");
        if (!JS_IsUndefined(val)) {
            script_dump_obj(ctx, val);
        }
        JS_FreeValue(ctx, val);
    }
    JS_FreeValue(ctx, exception);
} 

void script_context_init(os_window_t *window) {
    shared_module.runtime = JS_NewRuntime();
    shared_context.module = (void *)&shared_module;
    shared_context.window = window;

    ustring bundle_path = os_get_bundle_path(ustring_STR("db"));
    shared_context.db = db_open(bundle_path);

    shared_context.invalid_script = true;
    ui_renderer_init(&shared_context.renderer);
    shared_context.renderer.window_size = (float4){.x = window->width, .y = window->height, .z = 1.0f, .w = 1.0f};
    shared_context.state.window_rect = (ui_rect){0, 0, window->width, window->height};
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
    script_context_destroy();
}

void script_context_setup(void) {
    shared_module.context = JS_NewContext(shared_module.runtime);
    script_browser_register();
}

int script_eval(ustring source, ustring_view filename) {
    int ret;
    assert(source.null_terminated == true);

    if (source.length == 0) {
        ULOG_INFO("source is empty");
        return -1;
    }

    script_context_cleanup();
    script_context_setup();
    JSContext *ctx = script_context_internal();
    JSValue val = JS_Eval(ctx, source.data, source.length, filename.base.data, 0);

    if (JS_IsException(val)) {
        script_dump_error(ctx);
        ret = -1;
    } else {
        ret = 0;
    }

    JS_FreeValue(ctx, val);
    return ret;
}

int script_eval_direct(ustring source, ustring *result) {
    int ret;
    assert(source.null_terminated == true);

    if (source.length == 0) {
        return -1;
    }

    JSContext *ctx = script_context_internal();
    if (ctx == NULL) {
        script_context_setup();
        ctx = script_context_internal();
    }
    JSValue val = JS_Eval(ctx, source.data, source.length, "<eval>", 0);
    if (JS_IsException(val)) {
        script_dump_error(ctx);
        ret = -1;
    } else {
        ret = 0;
    }

    size_t len;
    JS_ToCStringLen(ctx, &len, val);
    const i8* str = JS_ToCString(ctx, val);
    if (str) {
        i8* data = malloc(len + 1);
        memcpy(data, str, len);
        data[len] = '\0';
        *result = (ustring){.data = data, .length = (u32)len, .null_terminated = true, .is_static = false};
        JS_FreeCString(ctx, str);
    }

    JS_FreeValue(ctx, val);
    return ret;
}

static void on_remote_script_download(net_request_t request, net_response_t response) {
    ULOG_INFO_FMT("download remote script: {v}", request.url);
    ULOG_INFO_FMT("status: {d}", response.status);
    ULOG_INFO_FMT("content_length: {d}", response.content_length);
    shared_context.invalid_script = script_eval(ustring_view_to_ustring(&response.body), request.url.url) != 0;
    script_context_t *ctx = script_context_shared();

    os_window_t *window = shared_context.window;
    os_window_on_resize(window, window->width, window->height);
}

int script_eval_uri(ustring_view uri) {
    if (ustring_view_start_with_ustring(uri, ustring_STR("http"))) {
        url_t url = url_parse(uri);
        if (!url.valid) {
            ULOG_WARN_FMT("invalid url: {v}", uri);
            return -1;
        }
        ULOG_INFO_FMT("download remote script: {v}", uri);
        url_dump(url);
        net_download_async(url, on_remote_script_download);
    } else {
        ustring content = io_read_file(os_get_bundle_path(ustring_view_to_ustring(&uri)));
        shared_context.invalid_script = script_eval(content, uri) != 0;
        ustring_free(&content);
    }

    os_window_t *window = shared_context.window;
    os_window_on_resize(window, window->width, window->height);
    return 0;
}

void script_context_loop_tick() {
    if (!shared_context.invalid_script) script_browser_tick();
    ui_dev_tool(&shared_context.state, &shared_context.dev_tool);
    ui_renderer_render(&shared_context.renderer);
    ui_state_update(&shared_context.state);
    
    int finished;
    JSContext *ctx;
    while ((finished = JS_ExecutePendingJob(script_runtime_internal(), &ctx)) != 0) {
        if (finished < 0) {
            script_dump_error(script_context_internal());
            break;
        }
    }

    uv_run(uv_default_loop(), UV_RUN_NOWAIT);
}
