#ifndef _types_h_
#define _types_h_

#include "simd.h"
#include <string.h>
#include <stdlib.h>

typedef struct {
    Float3 location;
    Quaternion rotation;
    Float3 scale;
} Transform;

typedef struct {
    f32 x, y, w, h;
} Rect;

typedef struct {
    const char* data;
    u32 size;
    u32 null_terminated;
} String;

#define String_str(s) ((String) {.data = s, .size = s ? (u32)strlen(s) : 0, .null_terminated = 1})
#define String_STR(s) ((String) {.data = ("" s ""), .size = (u32)(sizeof("" s "") - 1), .null_terminated = 1})
#define String_range(s, e) ((String) {.data = (s), size = (u32)((e) - (s)) })

#if defined(_MSC_VER)
#define TM_DLL_EXPORT __declspec(dllexport)
#else
#define TM_DLL_EXPORT __attribute__((visibility("default")))
#endif

#if defined(_MSC_VER) && !defined(__clang__)
#define ATOMIC
#else
#define ATOMIC _Atomic
#endif

#endif