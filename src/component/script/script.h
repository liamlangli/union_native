#ifndef _script_h_
#define _script_h_

#include "public/global.h"

#if defined(SCRIPT_BACKEND_JS)
#include "quickjs.h"

typedef struct script_context_t {
    JSRuntime *runtime;
    JSContext *context;
} script_context_t;

typedef struct script_value_t {
    JSValue value;
} script_value_t;

#else 
typedef struct script_context_t {
    u64 runtime, scope;
} script_context_t;

typedef struct script_value_t {
    u64 opaque;
} script_value_t;

#endif

typedef struct script_api {
    script_context_t (*create_context)(void);
    void (*destroy_context)(script_context_t *context);

    script_value_t (*eval)(script_context_t *context, const char *script, u32 size);
    script_value_t (*eval_file)(script_context_t *context, const char *filename);

    bool (*is_null)(script_context_t *context, script_value_t value);
    bool (*to_bool)(script_context_t *context, script_value_t value);
    i32 (*to_int)(script_context_t *context, script_value_t value);
    f64 (*to_double)(script_context_t *context, script_value_t value);
    const char* (*get_string)(script_context_t *context, script_value_t value);
} script_api;

extern struct script_api* script;

#endif // _script_h_
