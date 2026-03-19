/**
 * script.v8.cpp — V8 JavaScript engine backend (Windows)
 *
 * Implements the script.h API using the V8 embedding API.
 *
 * Build dependency:
 *   Run `python script/dep.py download && python script/dep.py compile`
 *   to fetch pre-built V8 libraries before compiling this target.
 *
 * V8 headers are expected at:   third_party/include/v8/
 * V8 libraries are expected at: third_party/lib/v8.lib (Windows)
 *                               third_party/lib/libv8.a  (others)
 */
#if defined(SCRIPT_BACKEND_V8)

#include "script/script.h"
#include "script/script_gpu.h"
#include "core/global.h"
#include "core/text.h"
#include "core/network.h"
#include "core/logger.h"
#include "core/io.h"
#include "ui/ui_dev_tool.h"
#include "ui/ui_renderer.h"
#include "ui/ui_state.h"

#include <v8/v8.h>
#include <v8/libplatform/libplatform.h>

#include <cassert>
#include <cstring>
#include <cstdlib>
#include <string>

using namespace v8;

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

struct V8Module {
    std::unique_ptr<Platform>  platform;
    Isolate::CreateParams      create_params;
    Isolate*                   isolate  = nullptr;
    Global<Context>            context;
};

static script_t  g_ctx    = {};
static V8Module  g_mod    = {};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

static bool has_script_extension(const char *path, u32 length) {
    if (path == nullptr || length < 3) return false;
    if (length >= 3 && strncmp(path + length - 3, ".js", 3) == 0) return true;
    if (length >= 4 && strncmp(path + length - 4, ".mjs", 4) == 0) return true;
    return false;
}

static std::string v8_to_std(Isolate* iso, Local<Value> val) {
    String::Utf8Value utf8(iso, val);
    return *utf8 ? *utf8 : "(v8 string error)";
}

static void v8_log_exception(TryCatch &tc, Isolate *iso) {
    if (!tc.HasCaught()) return;
    Local<Value> exc = tc.Exception();
    std::string msg = v8_to_std(iso, exc);
    LOG_ERROR("script.v8", msg.c_str());

    Local<Message> message = tc.Message();
    if (!message.IsEmpty()) {
        std::string file = v8_to_std(iso, message->GetScriptResourceName());
        int line = message->GetLineNumber(iso->GetCurrentContext()).FromMaybe(0);
        LOG_ERROR("script.v8", (file + ":" + std::to_string(line)).c_str());
    }

    Local<Value> trace;
    if (tc.StackTrace(iso->GetCurrentContext()).ToLocal(&trace)) {
        LOG_ERROR("script.v8", v8_to_std(iso, trace).c_str());
    }
}

// ---------------------------------------------------------------------------
// console.log / warn / error
// ---------------------------------------------------------------------------

static void cb_console_log(const FunctionCallbackInfo<Value> &args) {
    Isolate *iso = args.GetIsolate();
    for (int i = 0; i < args.Length(); ++i) {
        auto s = v8_to_std(iso, args[i]);
        LOG_INFO("script.v8", s.c_str());
    }
}

static void cb_console_warn(const FunctionCallbackInfo<Value> &args) {
    Isolate *iso = args.GetIsolate();
    for (int i = 0; i < args.Length(); ++i) {
        auto s = v8_to_std(iso, args[i]);
        LOG_WARN("script.v8", s.c_str());
    }
}

static void cb_console_error(const FunctionCallbackInfo<Value> &args) {
    Isolate *iso = args.GetIsolate();
    for (int i = 0; i < args.Length(); ++i) {
        auto s = v8_to_std(iso, args[i]);
        LOG_ERROR("script.v8", s.c_str());
    }
}

static void v8_bind_console(Isolate *iso, Local<Context> ctx) {
    HandleScope scope(iso);
    Local<Object> global  = ctx->Global();
    Local<Object> console = Object::New(iso);

    auto set_fn = [&](const char *name, FunctionCallback cb) {
        Local<String> key = String::NewFromUtf8(iso, name).ToLocalChecked();
        Local<Function> fn = Function::New(ctx, cb).ToLocalChecked();
        console->Set(ctx, key, fn).Check();
    };
    set_fn("log",   cb_console_log);
    set_fn("warn",  cb_console_warn);
    set_fn("error", cb_console_error);

    global->Set(ctx,
        String::NewFromUtf8(iso, "console").ToLocalChecked(),
        console).Check();
}

// ---------------------------------------------------------------------------
// fetch() — returns Promise<Response>; Response has .arrayBuffer()/.text()/.json()
// ---------------------------------------------------------------------------

struct V8FetchCtx {
    Global<Promise::Resolver> resolver;
    Global<Context>           js_ctx;
};

static void cb_response_array_buffer(const FunctionCallbackInfo<Value> &args) {
    Isolate *iso = args.GetIsolate();
    Local<Context> ctx = iso->GetCurrentContext();
    Local<Object> self = args.This();
    Local<Value> body = self->Get(ctx,
        String::NewFromUtf8(iso, "_body").ToLocalChecked()).ToLocalChecked();
    Local<Promise::Resolver> resolver = Promise::Resolver::New(ctx).ToLocalChecked();
    resolver->Resolve(ctx, body).Check();
    args.GetReturnValue().Set(resolver->GetPromise());
}

static void cb_response_text(const FunctionCallbackInfo<Value> &args) {
    Isolate *iso = args.GetIsolate();
    Local<Context> ctx = iso->GetCurrentContext();
    Local<Object> self = args.This();
    Local<Value> body_val = self->Get(ctx,
        String::NewFromUtf8(iso, "_body").ToLocalChecked()).ToLocalChecked();
    Local<ArrayBuffer> ab = Local<ArrayBuffer>::Cast(body_val);
    auto store = ab->GetBackingStore();
    Local<String> text = String::NewFromUtf8(iso,
        (const char *)store->Data(), NewStringType::kNormal,
        (int)store->ByteLength()).ToLocalChecked();
    Local<Promise::Resolver> resolver = Promise::Resolver::New(ctx).ToLocalChecked();
    resolver->Resolve(ctx, text).Check();
    args.GetReturnValue().Set(resolver->GetPromise());
}

static void cb_response_json(const FunctionCallbackInfo<Value> &args) {
    Isolate *iso = args.GetIsolate();
    Local<Context> ctx = iso->GetCurrentContext();
    Local<Object> self = args.This();
    Local<Value> body_val = self->Get(ctx,
        String::NewFromUtf8(iso, "_body").ToLocalChecked()).ToLocalChecked();
    Local<ArrayBuffer> ab = Local<ArrayBuffer>::Cast(body_val);
    auto store = ab->GetBackingStore();
    Local<String> text = String::NewFromUtf8(iso,
        (const char *)store->Data(), NewStringType::kNormal,
        (int)store->ByteLength()).ToLocalChecked();
    Local<Value> json;
    if (JSON::Parse(ctx, text).ToLocal(&json)) {
        Local<Promise::Resolver> resolver = Promise::Resolver::New(ctx).ToLocalChecked();
        resolver->Resolve(ctx, json).Check();
        args.GetReturnValue().Set(resolver->GetPromise());
    }
}

static void on_v8_fetch_done(net_request_t request, net_response_t response, void *userdata) {
    V8FetchCtx *fc = (V8FetchCtx *)userdata;
    Isolate *iso = g_mod.isolate;
    Isolate::Scope iso_scope(iso);
    HandleScope scope(iso);
    Local<Context> ctx = fc->js_ctx.Get(iso);
    Context::Scope ctx_scope(ctx);
    Local<Promise::Resolver> resolver = fc->resolver.Get(iso);

    if (response.status == 0) {
        Local<String> err = String::NewFromUtf8(iso, "network error").ToLocalChecked();
        resolver->Reject(ctx, err).Check();
    } else {
        const char *body = response.body.data();
        u32 body_len = (u32)response.body.size();

        Local<ArrayBuffer> ab = ArrayBuffer::New(iso, body_len);
        memcpy(ab->GetBackingStore()->Data(), body, body_len);

        Local<Object> resp = Object::New(iso);
        resp->Set(ctx, String::NewFromUtf8(iso, "status").ToLocalChecked(),
                  Integer::New(iso, response.status)).Check();
        resp->Set(ctx, String::NewFromUtf8(iso, "ok").ToLocalChecked(),
                  Boolean::New(iso, response.status >= 200 && response.status < 300)).Check();
        resp->Set(ctx, String::NewFromUtf8(iso, "_body").ToLocalChecked(), ab).Check();

        auto add_method = [&](const char *name, FunctionCallback cb) {
            Local<Function> fn = Function::New(ctx, cb).ToLocalChecked();
            resp->Set(ctx, String::NewFromUtf8(iso, name).ToLocalChecked(), fn).Check();
        };
        add_method("arrayBuffer", cb_response_array_buffer);
        add_method("text",        cb_response_text);
        add_method("json",        cb_response_json);

        resolver->Resolve(ctx, resp).Check();
    }

    fc->resolver.Reset();
    fc->js_ctx.Reset();
    delete fc;
}

static void cb_fetch(const FunctionCallbackInfo<Value> &args) {
    Isolate *iso = args.GetIsolate();
    Local<Context> ctx = iso->GetCurrentContext();

    Local<Promise::Resolver> resolver = Promise::Resolver::New(ctx).ToLocalChecked();

    if (args.Length() < 1 || !args[0]->IsString()) {
        Local<String> err = String::NewFromUtf8(iso, "fetch: expected URL string").ToLocalChecked();
        resolver->Reject(ctx, err).Check();
        args.GetReturnValue().Set(resolver->GetPromise());
        return;
    }

    String::Utf8Value url_utf8(iso, args[0]);
    std::string_view url_view(*url_utf8, url_utf8.length());
    url_t url = url_parse(url_view);

    if (!url.valid) {
        Local<String> err = String::NewFromUtf8(iso, "fetch: invalid URL").ToLocalChecked();
        resolver->Reject(ctx, err).Check();
        args.GetReturnValue().Set(resolver->GetPromise());
        return;
    }

    V8FetchCtx *fc = new V8FetchCtx;
    fc->resolver.Reset(iso, resolver);
    fc->js_ctx.Reset(iso, ctx);

    // net_download_async copies the URL string internally.
    net_download_async(url, on_v8_fetch_done, fc);
    args.GetReturnValue().Set(resolver->GetPromise());
}

static void v8_bind_fetch(Isolate *iso, Local<Context> ctx) {
    Local<Function> fn = Function::New(ctx, cb_fetch).ToLocalChecked();
    ctx->Global()->Set(ctx,
        String::NewFromUtf8(iso, "fetch").ToLocalChecked(), fn).Check();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

void script_init(os_window_t *window) {
    g_ctx.window = window;
    g_ctx.invalid_script = true;

    // Initialise V8 platform once
    if (!g_mod.platform) {
        V8::InitializeICUDefaultLocation(nullptr);
        V8::InitializeExternalStartupData(nullptr);
        g_mod.platform = platform::NewDefaultPlatform();
        V8::InitializePlatform(g_mod.platform.get());
        V8::Initialize();
    }

    g_mod.create_params.array_buffer_allocator =
        ArrayBuffer::Allocator::NewDefaultAllocator();
    g_mod.isolate = Isolate::New(g_mod.create_params);

    std::string bundle_path = os_get_bundle_path("db");
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
    {
        Isolate::Scope iso_scope(g_mod.isolate);
        g_mod.context.Reset();
    }
    if (g_mod.isolate) {
        g_mod.isolate->Dispose();
        g_mod.isolate = nullptr;
    }
    delete g_mod.create_params.array_buffer_allocator;
    g_mod.create_params.array_buffer_allocator = nullptr;

    V8::Dispose();
    V8::DisposePlatform();

    ui_renderer_free();
    db_close(g_ctx.db);
}

script_t *script_shared(void)         { return &g_ctx; }
void     *script_internal(void)       { return g_mod.isolate ? g_mod.isolate->GetCurrentContext()->GetIsolate() : nullptr; }
void     *script_runtime_internal(void) { return g_mod.isolate; }

static void _destroy_context(void) {
    if (g_mod.context.IsEmpty()) return;
    Isolate::Scope iso_scope(g_mod.isolate);
    g_mod.context.Reset();
}

void script_cleanup(void) {
    script_gpu_cleanup();
    _destroy_context();
}

void script_setup(void) {
    Isolate *iso = g_mod.isolate;
    Isolate::Scope iso_scope(iso);
    HandleScope handle_scope(iso);
    Local<Context> ctx = Context::New(iso);
    g_mod.context.Reset(iso, ctx);

    Context::Scope ctx_scope(ctx);
    v8_bind_console(iso, ctx);
    v8_bind_fetch(iso, ctx);
    script_gpu_setup();
}

int script_eval(std::string_view source, std::string_view filename) {
    if (source.empty()) {
        LOG_INFO("script.v8", "source is empty");
        return -1;
    }

    script_cleanup();
    script_setup();

    Isolate *iso = g_mod.isolate;
    Isolate::Scope iso_scope(iso);
    HandleScope handle_scope(iso);
    Local<Context> ctx = g_mod.context.Get(iso);
    Context::Scope ctx_scope(ctx);

    TryCatch tc(iso);
    Local<String> src_str  = String::NewFromUtf8(iso, source.data(),
        NewStringType::kNormal, (int)source.size()).ToLocalChecked();
    Local<String> file_str = String::NewFromUtf8(iso,
        filename.empty() ? "<eval>" : std::string(filename).c_str()).ToLocalChecked();

    ScriptOrigin origin(iso, file_str);
    Local<Script> script;
    if (!Script::Compile(ctx, src_str, &origin).ToLocal(&script)) {
        v8_log_exception(tc, iso);
        return -1;
    }

    Local<Value> result;
    if (!script->Run(ctx).ToLocal(&result)) {
        v8_log_exception(tc, iso);
        return -1;
    }
    return 0;
}

int script_eval_direct(std::string_view source, std::string *result) {
    if (source.empty()) return -1;

    Isolate *iso = g_mod.isolate;
    if (!iso) return -1;

    if (g_mod.context.IsEmpty()) {
        script_setup();
    }

    Isolate::Scope iso_scope(iso);
    HandleScope handle_scope(iso);
    Local<Context> ctx = g_mod.context.Get(iso);
    Context::Scope ctx_scope(ctx);

    TryCatch tc(iso);
    Local<String> src_str = String::NewFromUtf8(iso, source.data(),
        NewStringType::kNormal, (int)source.size()).ToLocalChecked();
    ScriptOrigin origin(iso, String::NewFromUtf8(iso, "<direct>").ToLocalChecked());
    Local<Script> script;
    if (!Script::Compile(ctx, src_str, &origin).ToLocal(&script)) {
        v8_log_exception(tc, iso);
        return -1;
    }
    Local<Value> val;
    if (!script->Run(ctx).ToLocal(&val)) {
        v8_log_exception(tc, iso);
        return -1;
    }

    if (result) {
        String::Utf8Value utf8(iso, val);
        *result = *utf8 ? std::string(*utf8, utf8.length()) : std::string();
    }
    return 0;
}

static void on_remote_script_download(net_request_t request, net_response_t response, void *userdata) {
    LOG_INFO("script.v8", "remote script downloaded");

    if (response.status < 200 || response.status >= 300) {
        LOG_WARN("script.v8", "failed to download remote script");
        g_ctx.invalid_script = true;
    } else {
        g_ctx.invalid_script =
            script_eval(response.body, request.url.url) != 0;
    }

    os_window_t *window = g_ctx.window;
    os_window_on_resize(window, window->width, window->height);
}

int script_eval_uri(std::string_view uri) {
    if (text_starts_with(uri, "http")) {
        url_t url = url_parse(uri);
        if (!url.valid) {
            LOG_WARN("script.v8", "invalid url");
            return -1;
        }
        if (!has_script_extension(url.path.c_str(), (u32)url.path.size())) {
            LOG_WARN("script.v8", "only .js and .mjs URLs are supported");
            return -1;
        }
        net_download_async(url, on_remote_script_download, NULL);
    } else {
        if (!has_script_extension(uri.data(), (u32)uri.size())) {
            LOG_WARN("script.v8", "only .js and .mjs files are supported");
            return -1;
        }
        std::string content = io_read_file(os_get_bundle_path(uri));
        if (content.empty()) {
            LOG_WARN("script.v8", "failed to read file");
            return -1;
        }
        g_ctx.invalid_script = script_eval(content, uri) != 0;
    }
    os_window_t *window = g_ctx.window;
    os_window_on_resize(window, window->width, window->height);
    return 0;
}

void script_tick(void) {
    if (!g_ctx.invalid_script) script_gpu_tick();
#ifdef UI_NATIVE
    ui_dev_tool(&g_ctx.dev_tool);
#endif
    ui_renderer_render();
    ui_state_update();

    // Drain microtasks / promises
    if (g_mod.isolate) {
        g_mod.isolate->PerformMicrotaskCheckpoint();
    }

    net_poll();
}

void script_key_action(KEYCODE key, BUTTON_ACTION action)    {}
void script_mouse_move(f32 x, f32 y)                         {}
void script_resize(i32 width, i32 height)                    {}
void script_mouse_button(MOUSE_BUTTON button, BUTTON_ACTION action) {}

#endif // SCRIPT_BACKEND_V8
