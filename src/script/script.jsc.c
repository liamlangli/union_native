#if defined(SCRIPT_BACKEND_JSC)

#include "script/script.h"
#include "script/script_gpu.h"
#include "foundation/global.h"
#include "foundation/ustring.h"
#include "foundation/network.h"
#include "foundation/logger.h"
#include "foundation/io.h"
#include "ui/ui_dev_tool.h"
#include "ui/ui_renderer.h"
#include "ui/ui_state.h"

void script_init(os_window_t *window) {}
void script_terminate(void) {}

script_t *script_shared(void) {}

void *script_internal(void) {}
void *script_runtime_internal(void) {}

void script_cleanup(void) {}
void script_setup(void) {}

int script_eval(ustring source, ustring_view filename) {
    return 0;
}

int script_eval_uri(ustring_view uri) {
    return 0;
}

int script_eval_direct(ustring source, ustring *result) {
    return 0;
}

void script_mouse_move(f32 x, f32 y) {
    
}

void script_mouse_button(MOUSE_BUTTON button, BUTTON_ACTION action) {}
void script_key_action(KEYCODE key, BUTTON_ACTION action) {}
void script_resize(i32 width, i32 height) {}
void script_tick() {}

#endif