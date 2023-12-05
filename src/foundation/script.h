#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"

#include <quickjs/quickjs.h>
#include <quickjs/quickjs-libc.h>

typedef struct script_context_t {
    JSRuntime* runtime;
    JSContext* context;
    int frame_buffer_width;
    int frame_buffer_height;
} script_context_t;

script_context_t script_context_create(void);
void script_context_destroy(script_context_t context);

void script_module_browser_register(script_context_t* context);

int script_eval(script_context_t context, ustring_t source, ustring_t filename);
void script_frame_tick(script_context_t context);