#include "script/script.h"
#include <quickjs/quickjs-libc.h>
#include <quickjs/quickjs.h>

typedef struct qjs_module {
  JSRuntime *runtime;
  JSContext *context;
} qjs_module;

static script_context_t shared_context = {0};
static qjs_module shared_module = {0};

void script_context_init(GLFWwindow *window) {
  shared_context.module = (void *)&shared_module;
  shared_context.ui_scale = 2.0f;
  shared_module.runtime = JS_NewRuntime();
  shared_module.context = JS_NewContext(shared_module.runtime);
}

script_context_t *script_context_share(void) { return &shared_context; }
void *script_context_internal(void) { return shared_module.context; }
void *script_runtime_internal(void) { return shared_module.runtime; }

void script_context_destroy(void) {
  if (shared_module.context == NULL)
    return;
  JS_FreeContext(shared_module.context);
  shared_module.context = NULL;
  JS_RunGC(shared_module.runtime);
  // JS_FreeRuntime(context->runtime);
}

void script_context_cleanup(void) {
  script_context_share();
  if (shared_module.context == NULL)
    return;
  JS_FreeContext(shared_module.context);
  JS_RunGC(shared_module.runtime);
  shared_module.context = JS_NewContext(shared_module.runtime);
}