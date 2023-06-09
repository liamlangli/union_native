#include "os_window.h"

#include "Windows.h"

typedef struct {
    HWND hwnd;
    DWORD style;
} window_t;

enum { MAX_WINDOWS = 4 };
static window_t window_pool[MAX_WINDOWS] = { 0 };
static u32 active_window_idx = 0;

static LRESULT CALLBACK __wnd_proc(HWND hwnd, UINT umsg, WPARAM wparam, LPARAM lparam)
{
    
}

window_t* platform_window_create(const char* title, i32 width, i32 height)
{
    // window_t* window = (window_t*)malloc(sizeof(window_t));
    // printf(title);
    // return window;  
    u32 win_idx = 0;
    for(; win_idx != active_window_idx; ++win_idx) {
        if (window_pool[win_idx].hwnd == 0)
            break;
    }
    
}

void platform_window_update(window_t* window)
{

}

void platform_window_destroy(window_t* window)
{

}
