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
#define ustring_equals(a, b) (strcmp((a)->data, (b)->data) == 0 && (a)->length == (b)->length && (a)->null_terminated == (b)->null_terminated)

typedef struct ustring_view {
    ustring base;
    u32 start;
    u32 length;
} ustring_view;

#define ustring_view_ustring(s) ((ustring_view) {.base = s, .start = 0, .length = s.length })
#define ustring_view_str(s) ((ustring_view) {.base = ustring_str(s), .start = 0, .length = ustring_str(s).length })
#define ustring_view_STR(s) ((ustring_view) {.base = ustring_STR(s), .start = 0, .length = ustring_STR(s).length })
#define ustring_view_range(b, s, e) ((ustring_view) {.base = (b), .start = (s), .length = (e) - (s) })
#define ustring_view_clear(v) ((v)->start = 0, (v)->length = 0)
#define ustring_view_equals(a, b) ((a)->start == (b)->start && (a)->length == (b)->length && strncmp((a)->base.data + (a)->start, (b)->base.data + (b)->start, (a)->length) == 0)
#define ustring_view_set_ustring_view(a, b) (ustring_safe_growth(&(a)->base, (b)->length), memcpy((void*)(a)->base.data + (a)->start, (b)->base.data + (b)->start, (b)->length), (a)->length = (b)->length)
#define ustring_view_pop(v) ((v)->length = (v)->length > 0 ? (v)->length - 1 : 0)
#define ustring_view_push(v, c) (ustring_safe_growth(&(v)->base, (v)->length + 1), (v)->length++, (v)->base.data[(v)->start + (v)->length - 1] = (c))
#define ustring_view_push_ustring(v, s) (ustring_safe_growth(&(v)->base, (v)->length + (s)->length), memcpy((void*)(v)->base.data + (v)->start + (v)->length, (s)->data, (s)->length), (v)->length += (s)->length)
#define ustring_view_push_str(v, s) (ustring_safe_growth(&(v)->base, (v)->length + (u32)strlen(s)), memcpy((void*)(v)->base.data + (v)->start + (v)->length, s, strlen(s)), (v)->length += (u32)strlen(s))
#define ustring_view_free(s) (free((void*)(s)->base.data), (s)->base.data = NULL, (s)->base.length = 0, (s)->base.null_terminated = 0, (s)->start = 0, (s)->length = 0)