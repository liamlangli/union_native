#pragma once

#include "foundation/global.h"

#include <math.h>

typedef struct float2 {
    f32 x, y;
} float2;

static inline float2 float2_sub(float2 a, float2 b) {
    return (float2){.x = a.x - b.x, .y = a.y - b.y};
}

static inline f32 float2_length(float2 a) {
    return sqrtf(a.x * a.x + a.y * a.y);
}

static inline float2 float2_normalize(float2 a) {
    f32 length = float2_length(a);
    if (length == 0.f) return (float2){.x = 0.f, .y = 0.f};
    return (float2){.x = a.x / length, .y = a.y / length};
}

static inline f32 float2_dot(float2 a, float2 b) {
    return a.x * b.x + a.y * b.y;
}

typedef struct float3 {
    f32 x, y, z, w;
} float3;

typedef struct float4 {
    float x, y, z, w;
} float4, quaternion;
