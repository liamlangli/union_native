#pragma once

#include "foundation/global.h"
#include <string.h>

typedef struct ustring {
    i8* data;
    u32 length;
    bool null_terminated;
    bool is_static;
} ustring;

u32 ustring_safe_growth(ustring* s, u32 n);

#define ustring_str(s) ((ustring) {.data = s, .length = s ? (u32)strlen(s) : 0, .null_terminated = true, .is_static = false})
#define ustring_STR(s) ((ustring) {.data = ("" s ""), .length = (u32)(sizeof("" s "") - 1), .null_terminated = 1, .is_static = 1})
#define ustring_range(s, e) ((ustring) {.data = (s), length = (u32)((e) - (s)),.is_static = true})
#define ustring_equals(a, b) (strcmp((a)->data, (b)->data) == 0 && (a)->length == (b)->length && (a)->null_terminated == (b)->null_terminated)

typedef struct ustring_view {
    ustring base;
    u32 start;
    u32 length;
} ustring_view;

#define ustring_view_ustring(s) ((ustring_view) {.base = s, .start = 0, .length = s.length})
#define ustring_view_alloc_STR(s) ((ustring_view) {.base = ustring_STR(s), .start = 0, .length = ustring_STR(s).length })
#define ustring_view_str(s) ((ustring_view) {.base = ustring_str(s), .start = 0, .length = ustring_str(s).length })
#define ustring_view_STR(s) ((ustring_view) {.base = ustring_STR(s), .start = 0, .length = ustring_STR(s).length })
#define ustring_view_reserve(s, n) (ustring_safe_growth(&(s)->base, (s)->start + (s)->length + (n)))
#define ustring_view_range(b, s, e) ((ustring_view) {.base = (b), .start = (s), .length = (e) - (s) })
#define ustring_view_clear(v) ((v)->start = 0, (v)->length = 0)
#define ustring_view_erase(v, f, t) (memmove((void*)(v)->base.data + (v)->start + (f), (void*)(v)->base.data + (v)->start + (t), (v)->length - (t)), (v)->length -= (t) - (f))
#define ustring_view_equals(a, b) ((a)->start == (b)->start && (a)->length == (b)->length && strncmp((a)->base.data + (a)->start, (b)->base.data + (b)->start, (a)->length) == 0)
#define ustring_view_set_ustring_view(a, b) (ustring_safe_growth(&(a)->base, (b)->length), memcpy((void*)(a)->base.data + (a)->start, (b)->base.data + (b)->start, (b)->length), (a)->length = (b)->length)
#define ustring_view_pop(v) ((v)->length = (v)->length > 0 ? (v)->length - 1 : 0)
#define ustring_view_push(v, c) (ustring_safe_growth(&(v)->base, (v)->length + 1), (v)->length++, (v)->base.data[(v)->start + (v)->length - 1] = (c))
#define ustring_view_append_ustring(v, s) (ustring_safe_growth(&(v)->base, (v)->length + (s)->length), memcpy((void*)(v)->base.data + (v)->start + (v)->length, (s)->data, (s)->length), (v)->length += (s)->length)
#define ustring_view_append_ustring_view(a, b) (ustring_safe_growth(&(a)->base, (a)->start + (a)->length + (b)->length), memcpy((void*)(a)->base.data + (a)->start + (a)->length, (b)->base.data + (b)->start, (b)->length), (a)->length += (b)->length)
#define ustring_view_push_str(v, s) (ustring_safe_growth(&(v)->base, (v)->length + (u32)strlen(s)), memcpy((void*)(v)->base.data + (v)->start + (v)->length, s, strlen(s)), (v)->length += (u32)strlen(s))
#define ustring_view_insert_ustring_view(v, i, s) (ustring_safe_growth(&(v)->base, (v)->length + (s)->length), memmove((void*)(v)->base.data + (v)->start + (i) + (s)->length, (void*)(v)->base.data + (v)->start + (i), (v)->length - (i)), memcpy((void*)(v)->base.data + (v)->start + (i), (s)->base.data + (s)->start, (s)->length), (v)->length += (s)->length)
#define ustring_view_free(s) (free((void*)(s)->base.data), (s)->base.data = NULL, (s)->base.length = 0, (s)->base.null_terminated = 0, (s)->start = 0, (s)->length = 0)