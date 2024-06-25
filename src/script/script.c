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

#include <quickjs/quickjs.h>
#include <stb/stb_ds.h>
#include <stdio.h>
#include <unistd.h>
#include <uv.h>
#include <assert.h>
#include <sys/stat.h>

typedef struct qjs_module {
    JSRuntime *runtime;
    JSContext *context;
} qjs_module;

static script_t shared_context = {0};
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

void script_init(os_window_t *window) {
    shared_module.runtime = JS_NewRuntime();
    shared_context.module = (void *)&shared_module;
    shared_context.window = window;

    ustring bundle_path = os_get_bundle_path(ustring_STR("db"));
    shared_context.db = db_open(bundle_path);

    shared_context.invalid_script = true;
    ui_renderer_init();
    ui_renderer_set_size(window->width, window->height);
    ui_state_init();
    ui_state_set_size(window->width, window->height);
#ifdef UI_NATIVE
    ui_dev_tool_init(&shared_context.dev_tool);
#endif
}

void script_terminate(void) {
    if (shared_module.runtime == NULL)
        return;
    JS_FreeRuntime(shared_module.runtime);
    shared_module.runtime = NULL;

    ui_renderer_free();
    db_close(shared_context.db);
}

script_t *script_shared(void) { return &shared_context; }
void *script_internal(void) { return shared_module.context; }
void *script_runtime_internal(void) { return shared_module.runtime; }

void script_destroy(void) {
    if (shared_module.context == NULL)
        return;
    JS_FreeContext(shared_module.context);
    shared_module.context = NULL;
}

void script_cleanup(void) {
    script_gpu_cleanup();
    script_destroy();
}

static JSValue js_console_log(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i) {
        const char *str = JS_ToCString(ctx, argv[i]);
        ULOG_INFO(str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_console_warn(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i) {
        const char *str = JS_ToCString(ctx, argv[i]);
        ULOG_WARN(str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static JSValue js_console_error(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    for (int i = 0; i < argc; ++i) {
        const char *str = JS_ToCString(ctx, argv[i]);
        ULOG_ERROR("{}", str);
        JS_FreeCString(ctx, str);
    }
    return JS_UNDEFINED;
}

static const JSCFunctionListEntry js_console_proto_funcs[] = {
    JS_CFUNC_DEF("log", 1, js_console_log),
    JS_CFUNC_DEF("warn", 1, js_console_warn),
    JS_CFUNC_DEF("error", 1, js_console_error),
};

static const JSCFunctionListEntry js_console_funcs[] = {
    JS_OBJECT_DEF("console", js_console_proto_funcs, count_of(js_console_proto_funcs), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE),
};


void script_setup(void) {
    shared_module.context = JS_NewContext(shared_module.runtime);

    JSContext *ctx = shared_module.context;
    JSValue global = JS_GetGlobalObject(ctx);
    JS_SetPropertyFunctionList(ctx, global, js_console_funcs, count_of(js_console_funcs));
    JS_FreeValue(ctx, global);

    script_gpu_setup();
}

int script_eval(ustring source, ustring_view filename) {
    int ret;
    assert(source.null_terminated == true);

    if (source.length == 0) {
        ULOG_INFO("source is empty");
        return -1;
    }

    script_cleanup();
    script_setup();
    JSContext *ctx = script_internal();
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

    JSContext *ctx = script_internal();
    if (ctx == NULL) {
        script_setup();
        ctx = script_internal();
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
    // ULOG_INFO_FMT("remote script downloaded: {v}", request.url);
    ULOG_INFO_FMT("status: {d}", response.status);
    ULOG_INFO_FMT("content_length: {d}", response.content_length);
    ULOG_INFO_FMT("header_length: {d}", response.header_length);
    shared_context.invalid_script = script_eval(ustring_view_to_ustring(&response.body), request.url.url) != 0;
    script_t *ctx = script_shared();

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
        if (content.length == 0) {
            ULOG_WARN_FMT("failed to read file: {v}", uri);
            return -1;
        }
        shared_context.invalid_script = script_eval(content, uri) != 0;
        ustring_free(&content);
    }

    os_window_t *window = shared_context.window;
    os_window_on_resize(window, window->width, window->height);
    return 0;
}

void script_tick() {
    if (!shared_context.invalid_script) script_gpu_tick();
#ifdef UI_NATIVE
    ui_dev_tool(&shared_context.dev_tool);
#endif
    ui_renderer_render();
    ui_state_update();

    int finished;
    JSContext *ctx;
    while ((finished = JS_ExecutePendingJob(script_runtime_internal(), &ctx)) != 0) {
        if (finished < 0) {
            script_dump_error(script_internal());
            break;
        }
    }

    uv_run(uv_default_loop(), UV_RUN_NOWAIT);
}

void script_key_action(KEYCODE key, BUTTON_ACTION action) {
    
}

void script_mouse_move(f32 x, f32 y) {

}

void script_resize(i32 width, i32 height) {

}

void script_mouse_button(MOUSE_BUTTON button, BUTTON_ACTION action) {

}