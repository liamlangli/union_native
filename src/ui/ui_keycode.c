#include "ui_keycode.h"

#include <stb_ds.h>

u32 ui_keycode_parse(ustring_view *view, ui_key_map_t *keys, bool shift) {
    ustring_view_clear(view);
    u32 valid_char_count = 0;
    for (int i = 0, l = (int)hmlen(keys); i < l; i++) {
        int key = keys[i].key;
        if (key == 0)
            continue;
        if (key >= KEY_A && key <= KEY_Z) {
            if (!shift) {
                key = key - KEY_A + KEY_LOWER_CASE_A;
            }
            ustring_view_push(view, key);
            valid_char_count++;
        } else {
            bool valid = true;
            switch (key) {
            case KEY_0:
                key = shift ? ')' : '0';
                break;
            case KEY_1:
                key = shift ? '!' : '1';
                break;
            case KEY_2:
                key = shift ? '@' : '2';
                break;
            case KEY_3:
                key = shift ? '#' : '3';
                break;
            case KEY_4:
                key = shift ? '$' : '4';
                break;
            case KEY_5:
                key = shift ? '%' : '5';
                break;
            case KEY_6:
                key = shift ? '^' : '6';
                break;
            case KEY_7:
                key = shift ? '&' : '7';
                break;
            case KEY_8:
                key = shift ? '*' : '8';
                break;
            case KEY_9:
                key = shift ? '(' : '9';
                break;
            case KEY_MINUS:
                key = shift ? '_' : '-';
                break;
            case KEY_EQUAL:
                key = shift ? '+' : '=';
                break;
            case KEY_LEFT_BRACKET:
                key = shift ? '{' : '[';
                break;
            case KEY_RIGHT_BRACKET:
                key = shift ? '}' : ']';
                break;
            case KEY_BACKSLASH:
                key = shift ? '|' : '\\';
                break;
            case KEY_COMMA:
                key = shift ? '<' : ',';
                break;
            case KEY_PERIOD:
                key = shift ? '>' : '.';
                break;
            case KEY_SLASH:
                key = shift ? '?' : '/';
                break;
            case KEY_GRAVE_ACCENT:
                key = shift ? '~' : '`';
                break;
            case KEY_SEMICOLON:
                key = shift ? ':' : ';';
                break;
            case 39:
                key = shift ? 34 : 39;
                break; // 34 = ", 39 = '
            case KEY_SPACE:
            case KEY_SPACE_MACOS:
                key = ' ';
                break;
            case KEY_TAB:
                key = '\t';
                break;
            default:
                valid = false;
                break;
            }
            if (valid) {
                ustring_view_push(view, key);
                valid_char_count++;
            }
        }
    }
    return valid_char_count;
}