#pragma once

#include "foundation/ustring.h"
#include "foundation/db.h"
#include "os/os.h"
#include "ui/ui_dev_tool.h"
#include "ui/ui_state.h"
#include "ui/ui_keycode.h"

typedef struct script_t {
    os_window_t *window;
    void *module;

    db_t db;
#ifdef UI_NATIVE
    ui_dev_tool_t dev_tool;
#endif

    // script section
    bool invalid_script;
} script_t;

void script_init(os_window_t *window);
void script_terminate(void);

script_t *script_shared(void);

void *script_internal(void);
void *script_runtime_internal(void);

void script_cleanup(void);
void script_setup(void);

int script_eval(ustring source, ustring_view filename);
int script_eval_uri(ustring_view uri);
int script_eval_direct(ustring source, ustring *result);

void script_mouse_move(f32 x, f32 y);
void script_mouse_button(MOUSE_BUTTON button, BUTTON_ACTION action);
void script_key_action(KEYCODE key, BUTTON_ACTION action);
void script_resize(i32 width, i32 height);

void script_tick();
