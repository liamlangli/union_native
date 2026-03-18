#if defined(SCRIPT_BACKEND_QJS)

#include "script/script.h"
#include "script/script_gpu.h"
#include "foundation/global.h"
#include "foundation/ustring.h"
#include "foundation/network.h"
#include "foundation/html_parser.h"
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
    JS_SetPropertyStr(ctx, global, "fetch", JS_NewCFunction(ctx, js_fetch, "fetch", 1));
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

// ---------------------------------------------------------------------------
// fetch() — returns Promise<Response>; Response has .arrayBuffer()/.text()/.json()
// ---------------------------------------------------------------------------

typedef struct qjs_fetch_ctx_t {
    JSContext *ctx;
    JSValue resolve;
    JSValue reject;
} qjs_fetch_ctx_t;

static JSValue js_response_array_buffer(JSContext *ctx, JSValueConst this_val,
                                         int argc, JSValueConst *argv,
                                         int magic, JSValue *func_data) {
    JSValue ab = JS_DupValue(ctx, func_data[0]);
    JSValue resolving_funcs[2];
    JSValue promise = JS_NewPromiseCapability(ctx, resolving_funcs);
    JS_Call(ctx, resolving_funcs[0], JS_UNDEFINED, 1, &ab);
    JS_FreeValue(ctx, resolving_funcs[0]);
    JS_FreeValue(ctx, resolving_funcs[1]);
    JS_FreeValue(ctx, ab);
    return promise;
}

static JSValue js_response_text(JSContext *ctx, JSValueConst this_val,
                                 int argc, JSValueConst *argv,
                                 int magic, JSValue *func_data) {
    size_t byte_len;
    JS_GetArrayBuffer(ctx, &byte_len, func_data[0]);
    uint8_t *buf = JS_GetArrayBuffer(ctx, &byte_len, func_data[0]);
    JSValue text = JS_NewStringLen(ctx, (const char *)buf, byte_len);
    JSValue resolving_funcs[2];
    JSValue promise = JS_NewPromiseCapability(ctx, resolving_funcs);
    JS_Call(ctx, resolving_funcs[0], JS_UNDEFINED, 1, &text);
    JS_FreeValue(ctx, resolving_funcs[0]);
    JS_FreeValue(ctx, resolving_funcs[1]);
    JS_FreeValue(ctx, text);
    return promise;
}

static JSValue js_response_json(JSContext *ctx, JSValueConst this_val,
                                 int argc, JSValueConst *argv,
                                 int magic, JSValue *func_data) {
    size_t byte_len;
    uint8_t *buf = JS_GetArrayBuffer(ctx, &byte_len, func_data[0]);
    JSValue json = JS_ParseJSON(ctx, (const char *)buf, byte_len, "<fetch>");
    JSValue resolving_funcs[2];
    JSValue promise = JS_NewPromiseCapability(ctx, resolving_funcs);
    JS_Call(ctx, resolving_funcs[0], JS_UNDEFINED, 1, &json);
    JS_FreeValue(ctx, resolving_funcs[0]);
    JS_FreeValue(ctx, resolving_funcs[1]);
    JS_FreeValue(ctx, json);
    return promise;
}

static void on_qjs_fetch_done(net_request_t request, net_response_t response, void *userdata) {
    qjs_fetch_ctx_t *fc = (qjs_fetch_ctx_t *)userdata;
    JSContext *ctx = fc->ctx;

    if (response.status == 0) {
        JSValue err = JS_NewString(ctx, "network error");
        JS_Call(ctx, fc->reject, JS_UNDEFINED, 1, &err);
        JS_FreeValue(ctx, err);
    } else {
        const char *body = response.body.base.data + response.body.start;
        u32 body_len = response.body.length;

        JSValue ab = JS_NewArrayBufferCopy(ctx, (const uint8_t *)body, body_len);

        JSValue resp = JS_NewObject(ctx);
        JS_SetPropertyStr(ctx, resp, "status", JS_NewInt32(ctx, (i32)response.status));
        JS_SetPropertyStr(ctx, resp, "ok",
            JS_NewBool(ctx, response.status >= 200 && response.status < 300));
        JS_SetPropertyStr(ctx, resp, "arrayBuffer",
            JS_NewCFunctionData(ctx, js_response_array_buffer, 0, 0, 1, &ab));
        JS_SetPropertyStr(ctx, resp, "text",
            JS_NewCFunctionData(ctx, js_response_text, 0, 0, 1, &ab));
        JS_SetPropertyStr(ctx, resp, "json",
            JS_NewCFunctionData(ctx, js_response_json, 0, 0, 1, &ab));
        JS_FreeValue(ctx, ab);

        JS_Call(ctx, fc->resolve, JS_UNDEFINED, 1, &resp);
        JS_FreeValue(ctx, resp);
    }

    JS_FreeValue(ctx, fc->resolve);
    JS_FreeValue(ctx, fc->reject);
    free(fc);
}

static JSValue js_fetch(JSContext *ctx, JSValueConst _, int argc, JSValueConst *argv) {
    JSValue resolving_funcs[2];
    JSValue promise = JS_NewPromiseCapability(ctx, resolving_funcs);

    if (argc < 1 || !JS_IsString(argv[0])) {
        JSValue err = JS_NewString(ctx, "fetch: expected URL string");
        JS_Call(ctx, resolving_funcs[1], JS_UNDEFINED, 1, &err);
        JS_FreeValue(ctx, err);
        JS_FreeValue(ctx, resolving_funcs[0]);
        JS_FreeValue(ctx, resolving_funcs[1]);
        return promise;
    }

    const char *url_str = JS_ToCString(ctx, argv[0]);
    ustring url_ustring = ustring_str(url_str);
    ustring_view url_view = ustring_view_from_ustring(url_ustring);
    url_t url = url_parse(url_view);

    if (!url.valid) {
        JSValue err = JS_NewString(ctx, "fetch: invalid URL");
        JS_Call(ctx, resolving_funcs[1], JS_UNDEFINED, 1, &err);
        JS_FreeValue(ctx, err);
        JS_FreeCString(ctx, url_str);
        JS_FreeValue(ctx, resolving_funcs[0]);
        JS_FreeValue(ctx, resolving_funcs[1]);
        return promise;
    }

    qjs_fetch_ctx_t *fc = malloc(sizeof(qjs_fetch_ctx_t));
    fc->ctx = ctx;
    fc->resolve = JS_DupValue(ctx, resolving_funcs[0]);
    fc->reject  = JS_DupValue(ctx, resolving_funcs[1]);

    // net_download_async copies the URL string internally, safe to free url_str after.
    net_download_async(url, on_qjs_fetch_done, fc);
    JS_FreeCString(ctx, url_str);

    JS_FreeValue(ctx, resolving_funcs[0]);
    JS_FreeValue(ctx, resolving_funcs[1]);
    return promise;
}

// ---------------------------------------------------------------------------
// HTML / script download callbacks
// ---------------------------------------------------------------------------

static void on_html_script_download(net_request_t request, net_response_t response, void *userdata) {
    ULOG_INFO_FMT("status: {d}", response.status);
    ustring source = ustring_view_to_ustring(&response.body);
    shared_context.invalid_script = script_eval(source, request.url.url) != 0;

    os_window_t *window = shared_context.window;
    os_window_on_resize(window, window->width, window->height);
}

static void on_remote_script_download(net_request_t request, net_response_t response, void *userdata) {
    ULOG_INFO_FMT("status: {d}", response.status);
    ULOG_INFO_FMT("content_length: {d}", response.content_length);
    ULOG_INFO_FMT("header_length: {d}", response.header_length);

    const char *body_data = response.body.base.data + response.body.start;
    u32 body_len = response.body.length;

    if (html_is_html(body_data, body_len)) {
        ULOG_INFO("html_parser: detected HTML page, extracting scripts");
        html_parse_result_t parsed = html_parse_scripts(body_data, body_len, request.url);
        for (u32 i = 0; i < parsed.count; i++) {
            html_script_t *s = &parsed.scripts[i];
            if (s->src.length > 0) {
                ustring_view src_view = ustring_view_from_ustring(s->src);
                url_t script_url = url_parse(src_view);
                if (script_url.valid) {
                    ULOG_INFO_FMT("html_parser: loading script: {}", s->src.data);
                    // net_download_async copies the URL, safe to free s->src after.
                    net_download_async(script_url, on_html_script_download, NULL);
                }
                ustring_free(&s->src);
            } else if (s->code.length > 0) {
                ustring_view filename = ustring_view_STR("<inline>");
                shared_context.invalid_script = script_eval(s->code, filename) != 0;
                ustring_free(&s->code);
            }
        }
    } else {
        shared_context.invalid_script = script_eval(ustring_view_to_ustring(&response.body), request.url.url) != 0;
    }

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
        net_download_async(url, on_remote_script_download, NULL);
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

#endif