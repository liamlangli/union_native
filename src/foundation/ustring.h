#pragma once

#include "foundation/global.h"
#include <string.h>

typedef struct ustring {
    const i8* data;
    u32 length;
    u32 null_terminated;
} ustring;

u32 ustring_safe_growth(ustring* s, u32 n);

#define ustring_str(s) ((ustring) {.data = s, .length = s ? (u32)strlen(s) : 0, .null_terminated = 1})
#define ustring_STR(s) ((ustring) {.data = ("" s ""), .length = (u32)(sizeof("" s "") - 1), .null_terminated = 1})
#define ustring_range(s, e) ((ustring) {.data = (s), length = (u32)((e) - (s)) })
#define ustring_equals(a, b) (strcmp((a)->data, (b)->data) == 0)
#define ustring_set(a, b) (ustring_safe_growth((a), (b)->length), memcpy((void*)(a)->data, (b)->data, (b)->length + 1), (a)->length = (b)->length)
