#pragma once

#include "public/global.h"
#include <string.h>

typedef struct ustring_t {
    const i8* data;
    u32 length;
    u32 null_terminated;
} ustring_t;

#define ustring_str(s) ((ustring_t) {.data = s, .length = s ? (u32)strlen(s) : 0, .null_terminated = 1})
#define ustring_STR(s) ((ustring_t) {.data = ("" s ""), .length = (u32)(sizeof("" s "") - 1), .null_terminated = 1})
#define ustring_range(s, e) ((ustring_t) {.data = (s), length = (u32)((e) - (s)) })