#include "os_window.h"

#define WIN32_LEAN_AND_MEAN
#include <Windows.h>
#include <windowsx.h>

#pragma comment(lib, "user32.lib")
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "shell32.lib")

#define HARD_CODED_WINDOW_ICON_RESOURCE 101

struct window_t {
    HWND hwnd;
    DWORD style;
    bool request_close;
};

enum { MAX_WINDOWS = 4 };
static window_t window_pool[MAX_WINDOWS] = { 0 };
static u32 active_window_idx = 0;

static LRESULT CALLBACK __wnd_proc(HWND hwnd, UINT umsg, WPARAM wparam, LPARAM lparam)
{
    if (umsg == WM_NCCREATE) {
        EnableNonClientDpiScaling(hwnd);
        return DefWindowProc(hwnd, umsg, wparam, lparam);
    }

    window_t* win = (window_t*)(GetWindowLongPtr(hwnd, GWLP_USERDATA));
    if (!win)
        return DefWindowProc(hwnd, umsg, wparam, lparam);

    switch (umsg) {
        case WM_CLOSE:
            win->request_close = true;
        default: break;
    }

    return DefWindowProc(hwnd, umsg, wparam, lparam);
}

static void __register_wnd_class(void)
{
    static bool wnd_class_registered = false;
    if (wnd_class_registered)
        return;

    // Hardcoded to use
    const HICON custom_icon = LoadIcon(GetModuleHandle(NULL), MAKEINTRESOURCE(HARD_CODED_WINDOW_ICON_RESOURCE));
    const HICON default_icon = LoadIcon(NULL, IDI_APPLICATION);

    const WNDCLASS wc = {
        .hInstance = GetModuleHandle(NULL),
        .hIcon = custom_icon ? custom_icon : default_icon,
        .lpszClassName = TEXT("union native"),
        .lpfnWndProc = __wnd_proc,
        .style = CS_OWNDC | CS_DBLCLKS,
    };

    RegisterClass(&wc);
    // const ATOM atom = 
    wnd_class_registered = true;
}

window_t* platform_window_create(const char* title, rect_t rect)
{
    __register_wnd_class();

    u32 win_idx = 0;
    for(; win_idx != active_window_idx; ++win_idx) {
        if (window_pool[win_idx].hwnd == 0)
            break;
    }
    
    window_t* win = &window_pool[win_idx];
    DWORD ex_style = WS_EX_ACCEPTFILES;
    
    RECT win_rect;
    SetRect(&win_rect, (int)rect.x, (int)rect.y, (int)(rect.x + rect.w), (int)(rect.y + rect.h));
    win->hwnd = CreateWindowEx(ex_style, TEXT("title"), title, win->style, win_rect.left, win_rect.top,
        win_rect.right - win_rect.left, win_rect.bottom - win_rect.top, NULL, NULL, GetModuleHandle(NULL), NULL);
    SetWindowLongPtr(win->hwnd, GWLP_WNDPROC, (LONG_PTR)win);

    SetFocus(win->hwnd);
    // SetWindowPos();
    ShowWindow(win->hwnd, SW_SHOW);
    UpdateWindow(win->hwnd);

    return win;
}

bool platform_window_update(window_t* window)
{
    MSG msg;
    while (PeekMessage(&msg, NULL, 0, 0, PM_REMOVE) != 0) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return window->request_close;
}

void platform_window_destroy(window_t* window)
{

}
