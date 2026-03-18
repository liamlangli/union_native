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
#include "foundation/global.h"
#include "foundation/ustring.h"
#include "foundation/network.h"
#include "foundation/logger.h"
#include "foundation/io.h"
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
    script_gpu_setup();
}

int script_eval(ustring source, ustring_view filename) {
    if (source.length == 0) {
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
    Local<String> src_str  = String::NewFromUtf8(iso, source.data,
        NewStringType::kNormal, (int)source.length).ToLocalChecked();
    Local<String> file_str = String::NewFromUtf8(iso,
        filename.base.data ? filename.base.data : "<eval>").ToLocalChecked();

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

int script_eval_direct(ustring source, ustring *result) {
    if (source.length == 0) return -1;

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
    Local<String> src_str = String::NewFromUtf8(iso, source.data,
        NewStringType::kNormal, (int)source.length).ToLocalChecked();
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
        size_t len = utf8.length();
        char  *buf = (char*)malloc(len + 1);
        memcpy(buf, *utf8, len);
        buf[len] = '\0';
        *result = (ustring){ .data = buf, .length = (u32)len, .null_terminated = true, .is_static = false };
    }
    return 0;
}

static void on_remote_script_download(net_request_t request, net_response_t response) {
    LOG_INFO("script.v8", "remote script downloaded");
    g_ctx.invalid_script =
        script_eval(ustring_view_to_ustring(&response.body), request.url.url) != 0;

    os_window_t *window = g_ctx.window;
    os_window_on_resize(window, window->width, window->height);
}

int script_eval_uri(ustring_view uri) {
    if (ustring_view_start_with_ustring(uri, ustring_STR("http"))) {
        url_t url = url_parse(uri);
        if (!url.valid) {
            LOG_WARN("script.v8", "invalid url");
            return -1;
        }
        net_download_async(url, on_remote_script_download);
    } else {
        ustring content = io_read_file(os_get_bundle_path(ustring_view_to_ustring(&uri)));
        if (content.length == 0) {
            LOG_WARN("script.v8", "failed to read file");
            return -1;
        }
        g_ctx.invalid_script = script_eval(content, uri) != 0;
        ustring_free(&content);
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

    uv_run(uv_default_loop(), UV_RUN_NOWAIT);
}

void script_key_action(KEYCODE key, BUTTON_ACTION action)    {}
void script_mouse_move(f32 x, f32 y)                         {}
void script_resize(i32 width, i32 height)                    {}
void script_mouse_button(MOUSE_BUTTON button, BUTTON_ACTION action) {}

#endif // SCRIPT_BACKEND_V8
