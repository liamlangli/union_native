#include "window.h"

window_t* platform_window_create(const char* title, i32 width, i32 height)
{
    window_t* window = (window_t*)malloc(sizeof(window_t));
    printf(title);
    return window;
}

void platform_window_update(window_t* window)
{

}

void platform_window_destroy(window_t* window)
{

}