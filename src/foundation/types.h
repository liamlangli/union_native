#ifndef _types_h_
#define _types_h_

#include "simd.h"
#include <string.h>
#include <stdlib.h>

typedef struct {
    float3_t location;
    quaternion_t rotation;
    float3_t scale;
} transform_t;

typedef struct {
    f32 x, y, w, h;
} rect_t;

typedef struct {
    const char* data;
    u32 size;
    u32 null_terminated;
} string_t;

#define string_str(s) ((string_t) {.data = s, .size = s ? (u32)strlen(s) : 0, .null_terminated = 1})
#define string_STR(s) ((string_t) {.data = ("" s ""), .size = (u32)(sizeof("" s "") - 1), .null_terminated = 1})
#define string_range(s, e) ((string_t) {.data = (s), size = (u32)((e) - (s)) })

typedef struct clock_o {
    u64 opaque;
} clock_o;

typedef struct un_uuid_t {
    u64 a, b;
} un_uuid_t;

typedef struct color_srgb_t {
    u8 r, g, b, a;
} color_srgb_t;

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
