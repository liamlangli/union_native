#pragma once

#include "foundation/ustring.h"
#include "foundation/db.h"
#include "os/os.h"
#include "ui/ui_dev_tool.h"
#include "ui/ui_state.h"

#include <stb_ds.h>

typedef struct script_context_t {
    os_window_t *window;
    void *module;

    db_t db;
    ui_state_t state;
#ifdef UI_NATIVE
    ui_dev_tool_t dev_tool;
#endif

    // script section
    bool invalid_script;
} script_context_t;

void script_context_init(os_window_t *window);
void script_context_terminate(void);

script_context_t *script_context_shared(void);

void *script_context_internal(void);
void *script_runtime_internal(void);

void script_context_cleanup(void);
void script_context_setup(void);

int script_eval(ustring source, ustring_view filename);
int script_eval_uri(ustring_view uri);
int script_eval_direct(ustring source, ustring *result);

void script_context_loop_tick();
