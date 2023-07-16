#pragma once

#include "foundation/simd.h"
#include <string.h>
#include <stdlib.h>
#include <stdint.h>

typedef struct transform_t {
    float3_t location;
    quaternion_t rotation;
    float3_t scale;
} transform_t;

typedef struct rect_t {
    f32 x, y, w, h;
} rect_t;

typedef struct string_t {
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

typedef union color_srgb_t {
    struct {
        u8 r, g, b, a;
    };
    u32 rgba;
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

typedef struct bounds2_t {
    float2_t min, max;
} bounds2_t;

typedef struct bounds3_t {
    float3_t min, max;
} bounds3_t;

static inline bounds2_t bounds2_empty(void) {
    return (bounds2_t){.min = float2(FLT_MAX, FLT_MAX), .max = float2(-FLT_MAX, -FLT_MAX)};
}

static inline bounds2_t bounds2_points(const float2_t *points, u32 point_count) {
    bounds2_t result = bounds2_empty();
    for (u32 i = 0; i < point_count; ++i) {
        result.min = float2_min(result.min, points[i]);
        result.max = float2_max(result.max, points[i]);
    }
    return result;
}

static inline bounds3_t bounds3_empty(void) {
    return (bounds3_t){.min = float3(FLT_MAX, FLT_MAX, FLT_MAX), .max = float3(-FLT_MAX, -FLT_MAX, -FLT_MAX)};
}

static inline bounds3_t bounds3_points(const float3_t *points, u32 point_count) {
    bounds3_t result = bounds3_empty();
    for (u32 i = 0; i < point_count; ++i) {
        result.min = float3_min(result.min, points[i]);
        result.max = float3_max(result.max, points[i]);
    }
    return result;
}
