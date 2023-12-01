#pragma once

#include "public/global.h"
#include "foundation/string/ustring.h"

#include <quickjs.h>

typedef struct script_context_t {
    JSRuntime* runtime;
    JSContext* context;
} script_context_t;

script_context_t script_context_create(void);
JSValue script_eval(script_context_t context, ustring_t source);
void script_frame_tick(script_context_t context);