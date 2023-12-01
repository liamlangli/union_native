#pragma once

#include "public/global.h"
#include "foundation/string/ustring.h"

#include <quickjs/quickjs.h>
#include <quickjs/quickjs-libc.h>

typedef struct script_context_t {
    JSRuntime* runtime;
    JSContext* context;
} script_context_t;

script_context_t script_context_create(void);
void script_context_destroy(script_context_t context);

int script_eval(script_context_t context, ustring_t source);
void script_frame_tick(script_context_t context);