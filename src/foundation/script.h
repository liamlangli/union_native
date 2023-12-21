#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"

#include <quickjs/quickjs.h>
#include <quickjs/quickjs-libc.h>
#include <GLFW/glfw3.h>
#include <stb_ds.h>

typedef struct js_listener_hm {
    ustring key;
    JSValue value;
} js_listener_hm;

typedef struct script_context_t {
    JSRuntime* runtime;
    JSContext* context;
    int width;
    int height;

    js_listener_hm *window_event_listeners;
    js_listener_hm *document_event_listeners;
} script_context_t;

script_context_t* script_context_share(void);
void script_context_destroy(script_context_t *context);

void script_module_browser_register(script_context_t* context);

int script_eval(script_context_t *context, ustring source, ustring filename);

void script_window_resize(script_context_t *context, int width, int height);
void script_frame_tick(script_context_t *context);