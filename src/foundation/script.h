#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"

#include <quickjs/quickjs.h>
#include <quickjs/quickjs-libc.h>
#include <GLFW/glfw3.h>
#include <stb_ds.h>

typedef struct js_scope {
    JSValue this, func;
} js_scope;

typedef struct js_listener_hm {
    const char *key;
    js_scope *value;
} js_listener_hm;

typedef struct script_context_t {
    JSRuntime* runtime;
    JSContext* context;
    int width;
    int height;
    int framebuffer_width;
    int framebuffer_height;
    f64 display_ratio, ui_scale;
    f64 mouse_x, mouse_y;

    js_listener_hm *window_event_listeners;
    js_listener_hm *document_event_listeners;
    js_listener_hm *canvas_event_listeners;
} script_context_t;

script_context_t* script_context_share(void);
void script_context_destroy();

void script_value_ref(JSValue value);
void script_value_unref(JSValue value);

void script_module_browser_register();
int script_eval( ustring source, ustring filename);
void script_window_resize(int width, int height);
void script_window_mouse_move(double x, double y);
void script_window_mouse_down(int button);
void script_window_mouse_up(int button);
void script_window_mouse_scroll(double x, double y);
void script_document_key_down(int key);
void script_document_key_up(int key);

void script_frame_tick();