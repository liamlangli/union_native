#pragma once

#define GLFW_INCLUDE_ES3
#include <GLFW/glfw3.h>
#include <GLES3/gl3.h>

#include "foundation/global.h"
#include "foundation/ustring.h"

enum CURSOR_TYPE {
    CURSOR_Default = 0x00036001,
    CURSOR_Text = 0x00036002,
    CURSOR_ResizeH = 0x00036005,
    CURSOR_ResizeV = 0x00036006
};

extern GLFWwindow* os_create_window(ustring title, int width, int height);
extern void os_run_window_loop(GLFWwindow *window, void (*fn)(void));
extern void os_set_window_cursor(GLFWwindow *window, int cursor_type);
extern void os_close_window(GLFWwindow *window);