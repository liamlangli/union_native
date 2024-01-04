#pragma once

void script_browser_register(void);
void script_browser_cleanup(void);
void script_browser_tick(void);

void script_browser_document_key_down(int key);
void script_browser_document_key_up(int key);

void script_browser_window_resize(int width, int height);
void script_browser_window_mouse_move(double x, double y);
void script_browser_window_mouse_down(int button);
void script_browser_window_mouse_up(int button);
void script_browser_window_mouse_scroll(double x, double y);