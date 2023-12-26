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

#define ustring_view_ustring(v) ((ustring_view) {.base = v, .start = 0, .length = v.length})
#define ustring_view_alloc_STR(v) ((ustring_view) {.base = ustring_STR(v), .start = 0, .length = ustring_STR(v).length })
#define ustring_view_str(v) ((ustring_view) {.base = ustring_str(v), .start = 0, .length = ustring_str(v).length })
#define ustring_view_STR(v) ((ustring_view) {.base = ustring_STR(v), .start = 0, .length = ustring_STR(v).length })
#define ustring_view_reserve(v, n) (ustring_safe_growth(&(v)->base, (v)->start + (v)->length + (n)))
#define ustring_view_range(b, s, e) ((ustring_view) {.base = (b), .start = (v), .length = (e) - (v) })
#define ustring_view_clear(v) ((v)->start = 0, (v)->length = 0)
#define ustring_view_erase(v, f, t) (memmove((void*)(v)->base.data + (v)->start + (f), (void*)(v)->base.data + (v)->start + (t), (v)->length - (t)), (v)->length -= (t) - (f))
#define ustring_view_equals(a, b) ((a)->start == (b)->start && (a)->length == (b)->length && strncmp((a)->base.data + (a)->start, (b)->base.data + (b)->start, (a)->length) == 0)
#define ustring_view_pop(v) ((v)->length = (v)->length > 0 ? (v)->length - 1 : 0)
#define ustring_view_push(v, c) (ustring_safe_growth(&(v)->base, (v)->start + (v)->length + 1), (v)->length++, (v)->base.data[(v)->start + (v)->length - 1] = (c))
#define ustring_view_free(v) (free((void*)(v)->base.data), (v)->base.data = NULL, (v)->base.length = 0, (v)->base.null_terminated = 0, (v)->start = 0, (v)->length = 0)
#define ustring_view_set_null_terminated(v) (ustring_safe_growth(&(v)->base, (v)->start + (v)->length + 1), (v)->base.null_terminated = true, (v)->base.data[(v)->start + (v)->length] = 0)

u32 ustring_view_insert_ustring_view(ustring_view *a, u32 index, ustring_view *b);
u32 ustring_view_set_ustring_view(ustring_view *a, ustring_view *b);
u32 ustring_view_append_ustring_view(ustring_view *a, ustring_view *b);