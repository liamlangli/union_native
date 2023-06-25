#if defined(SCRIPT_BACKEND_JS)

#include "script.h"
#include "quickjs.h"

static script_context_t script_create_context(void) {
    script_context_t context = {0};
    context.runtime = JS_NewRuntime();
    context.context = JS_NewContext(context.runtime);
    return context;
}

static void script_destroy_context(script_context_t *context) {
    JS_FreeContext(context->context);
    JS_FreeRuntime(context->runtime);
}

static script_value_t script_eval_js(script_context_t *context, const char *script, u32 size) {
    return (script_value_t){ .value = JS_Eval(context->context, script, size, "<eval>", JS_EVAL_TYPE_GLOBAL) };
}

static bool script_is_null(script_context_t *context, script_value_t value) {
    return JS_IsNull(value.value);
}

static bool script_to_bool(script_context_t *context, script_value_t value) {
    return JS_ToBool(context->context, value.value);
}

static i32 script_to_int(script_context_t *context, script_value_t value) {
    i32 pres = 0;
    JS_ToInt32(context->context, &pres, value.value);
    return pres;
}

static f64 script_to_double(script_context_t *context, script_value_t value) {
    f64 pres = 0;
    JS_ToFloat64(context->context, &pres, value.value);
    return pres;
}

static struct script_api script_js = {
    .create_context = &script_create_context,
    .eval = &script_eval_js,
    .is_null = &script_is_null,
    .to_bool = &script_to_bool,
    .to_int = &script_to_int,
    .to_double = &script_to_double,
};

struct script_api *script = &script_js;

#endif // SCRIPT_BACKEND_JS
