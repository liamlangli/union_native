#ifndef _window_h_
#define _window_h_

#include "types.h"

typedef struct {
    string_t title;
    i32 width, height;
    void* native_handle;
} window_t;

extern window_t* platform_window_create(const char* title, i32 width, i32 height);

#endif // _window_h_
