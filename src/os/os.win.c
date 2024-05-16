#include "os.h"

#ifdef OS_WINDOWS

#include <windows.h>
#include "gpu/gpu.h"

#include <assert.h>

static os_window_t _os_window;

typedef struct native_window_t {

} native_window_t;
native_window_t _window;

LRESULT CALLBACK win_proc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_DESTROY:
            PostQuitMessage(0);
            return 0;
        case WM_MOUSEMOVE:
            break;
        default:
            return DefWindowProc(hwnd, uMsg, wParam, lParam);
    }
    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

os_window_t* os_window_create(ustring title, int width, int height, os_on_launch on_launch, os_on_frame on_frame, os_on_terminate on_terminate) {
    _os_window.title = title;
    _os_window.width = width;
    _os_window.height = height;

    HINSTANCE hInstance = GetModuleHandle(NULL);
    // Define the window class
    WNDCLASS wc = {0};
    const char CLASS_NAME[] = "un";

    wc.lpfnWndProc = win_proc;
    wc.hInstance = hInstance;
    wc.lpszClassName = CLASS_NAME;

    // Register the window class
    RegisterClass(&wc);

    // Create the window
    HWND hwnd = CreateWindowEx(0, CLASS_NAME,title.data,
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, width, height,
        NULL,
        NULL,
        hInstance,
        NULL
    );
    _os_window.native_window = hwnd;

    if (hwnd == NULL) {
        return 0;
    }

    ShowWindow(hwnd, SW_SHOW);
    
    if(!gpu_request_device(&_os_window)) {
        assert(false);
    }

    if (on_launch) on_launch(&_os_window);

    MSG msg = {0};
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
        if (on_frame) on_frame(&_os_window);
    }
    if (on_terminate) on_terminate(&_os_window);
    return &_os_window;
}

void os_window_set_cursor(os_window_t *window, int cursor_type) {

}

void os_window_close(os_window_t *window) {

}

void os_window_capture_require(os_window_t *window) {

}

void os_window_set_clipboard(os_window_t *window, ustring_view text) {

}

ustring os_window_get_clipboard(os_window_t *window) {
    return ustring_NULL;
}

#endif