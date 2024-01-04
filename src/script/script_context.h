#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"
#include "foundation/db.h"
#include "ui/ui_dev_tool.h"
#include "ui/ui_state.h"

#include <GLFW/glfw3.h>
#include <stb_ds.h>

typedef struct script_context_t {
    int width;
    int height;
    int framebuffer_width;
    int framebuffer_height;
    f64 display_ratio, ui_scale;
    f64 mouse_x, mouse_y;
    GLFWwindow *window;
    void *module;
    db_t db;
    ui_state_t state;
    ui_renderer_t renderer;
    ui_dev_tool_t dev_tool;

    // script section
    bool invalid_script;
} script_context_t;

void script_context_init(GLFWwindow *window);
void script_context_terminate(void);

script_context_t *script_context_share(void);

void *script_context_internal(void);
void *script_runtime_internal(void);

void script_context_cleanup(void);
void script_context_setup(void);

int script_eval(ustring source, ustring_view filename);

void script_window_resize(int width, int height);
void script_window_mouse_move(double x, double y);
void script_window_mouse_down(int button);
void script_window_mouse_up(int button);
void script_window_mouse_scroll(double x, double y);
void script_document_key_down(int key);
void script_document_key_up(int key);

void script_context_loop_tick();