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
#define ustring_set_str(a, b) (ustring_safe_growth((a), strlen(b)), memcpy((void*)(a)->data, b, strlen(b) + 1), (a)->length = (u32)strlen(b))
#define ustring_empty(s) ((s)->data == NULL || (s)->data[0] == '\0', (s)->length == 0)
#define ustring_from(s, i) ((ustring) {.data = (s)->data + (i), .length = (s)->length - (i), .null_terminated = 0})
#define ustring_substr(s, start, end) ((ustring) {.data = (s)->data + (start), .length = (end) - (start), .null_terminated = 0})


typedef struct ustring_view {
    ustring base;
    u32 start;
    u32 end;
} ustring_view;

#define ustring_view_from(b, s, e) ((ustring_view) {.base = (b), .start = MACRO_CLAMP(s, 0, (b).length), .end = MACRO_CLAMP(e, 0, (b).length)})