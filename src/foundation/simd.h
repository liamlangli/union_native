#pragma once

#include "public/global.h"
#include <math.h>
#include <float.h>

#define SIMD_E 2.71828182845904523536028747135266250        /* e           */
#define SIMD_LOG2E 1.44269504088896340735992468100189214    /* log2(e)     */
#define SIMD_LOG10E 0.434294481903251827651128918916605082  /* log10(e)    */
#define SIMD_LN2 0.693147180559945309417232121458176568     /* loge(2)     */
#define SIMD_LN10 2.30258509299404568401799145468436421     /* loge(10)    */
#define SIMD_PI 3.14159265358979323846264338327950288       /* pi          */
#define SIMD_PI_2 1.57079632679489661923132169163975144     /* pi/2        */
#define SIMD_PI_4 0.785398163397448309615660845819875721    /* pi/4        */
#define SIMD_1_PI 0.318309886183790671537767526745028724    /* 1/pi        */
#define SIMD_2_PI 0.636619772367581343075535053490057448    /* 2/pi        */
#define SIMD_2_SQRTPI 1.12837916709551257389615890312154517 /* 2/sqrt(pi)  */
#define SIMD_SQRT2 1.41421356237309504880168872420969808    /* sqrt(2)     */
#define SIMD_SQRT1_2 0.707106781186547524400844362104849039 /* 1/sqrt(2)   */

typedef struct {
    f32 x, y;
} float2_t;

typedef struct {
    f32 x, y, z;
} float3_t;

typedef struct {
    f32 x, y, z, w;
} float4_t;

typedef float4_t quaternion_t;

typedef struct {
    float xx, xy, xz, xw;
    float yx, yy, yz, yw;
    float zx, zy, zz, zw;
    float wx, wy, wz, ww;
} float4x4_t;

static inline f32 fast_inv_sqrt(f32 n) {
    f32 half_n = n * 0.5f;
    i32 i = *(i32*)&n;
    i = 0x5f3759df - (i >> 1);
    n = *(f32*)&i;
    n = n * (1.5f - half_n * n * n);
    return n;
}

static inline float2_t float2_min(float2_t a, float2_t b) {
    return (float2_t){fminf(a.x, b.x), fminf(a.y, b.y)};
}

static inline float2_t float2_max(float2_t a, float2_t b) {
    return (float2_t){fmaxf(a.x, b.x), fmaxf(a.y, b.y)};
}

static inline float2_t float2_sub(float2_t a, float2_t b) {
    return (float2_t){a.x - b.x, a.y - b.y};
}

static inline float2_t float2_add(float2_t a, float2_t b) {
    return (float2_t){a.x + b.x, a.y + b.y};
}

static inline float2_t float2_mul(float2_t a, float b) {
    return (float2_t){a.x * b, a.y * b};
}

static inline float2_t float2_mul_add(float2_t a, float2_t b, f32 s) {
    return (float2_t){ a.x + b.x * s, a.y + b.y * s };
}

static inline float2_t float2_mul_another(float2_t a, float2_t b) {
    return (float2_t){a.x * b.x, a.y * b.y};
}

static inline f32 float2_dot(float2_t a, float2_t b) {
    return a.x * b.x + a.y * b.y;
}

static inline float2_t float2_normalize(float2_t a) {
    float inv_sqrt = fast_inv_sqrt(a.x * a.x + a.y * a.y);
    return (float2_t){a.x * inv_sqrt, a.y * inv_sqrt};
}

static inline float2_t float2_normalize_safe(float2_t a) {
    if (a.x == 0.0f && a.y == 0.0f) {
        return (float2_t){1.0f, 1.0f};
    }
    float inv_sqrt = fast_inv_sqrt(a.x * a.x + a.y * a.y);
    return (float2_t){a.x * inv_sqrt, a.y * inv_sqrt};
}

static inline float3_t float3_min(float3_t a, float3_t b) {
    return (float3_t){fminf(a.x, b.x), fminf(a.y, b.y), fminf(a.z, b.z)};
}

static inline float3_t float3_max(float3_t a, float3_t b) {
    return (float3_t){fmaxf(a.x, b.x), fmaxf(a.y, b.y), fmaxf(a.z, b.z)};
}