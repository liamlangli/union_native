#pragma once

#include "foundation/global.h"
#include <string.h>

typedef struct ustring {
    i8* data;
    u32 length;
    u32 null_terminated;
} ustring;

#define ustring_str(s) ((ustring) {.data = s, .length = s ? (u32)strlen(s) : 0, .null_terminated = 1})
#define ustring_STR(s) ((ustring) {.data = ("" s ""), .length = (u32)(sizeof("" s "") - 1), .null_terminated = 1})
#define ustring_range(s, e) ((ustring) {.data = (s), length = (u32)((e) - (s)) })