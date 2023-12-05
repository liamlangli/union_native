#pragma once

#include <stdio.h>
#include <stdbool.h>

#include "foundation/platform.h"

#define false 0
#define true 1

#define EXPORT
#define FORCE_INLINE static inline

typedef char * string;

typedef unsigned char u8;
typedef char i8;
typedef unsigned short u16;
typedef short i16;
typedef unsigned int u32;
typedef int i32;
typedef unsigned long u64;
typedef long i64;
typedef float f32;
typedef double f64;

#define EPSILON 0.00001f

#define countof(x) (sizeof(x) / sizeof((x)[0]))

#define MACRO_CONCAT_IMPL(a, b) a##b
#define MACRO_CONCAT(a, b) MACRO_CONCAT_IMPL(a, b)
#define MACRO_VAR(name) MACRO_CONCAT(name, __LINE__)
#define MACRO_PAD(n) char MACRO_VAR(_padding_)[n]

#define MACRO_MIN(a, b) ((a) < (b) ? (a) : (b))
#define MACRO_MAX(a, b) ((a) > (b) ? (a) : (b))
#define MACRO_CLAMP(x, a, b) MACRO_MIN(MACRO_MAX(x, a), b)
#define MACRO_MEDIAN(a, b, c) MACRO_MAX(MACRO_MIN(a, b), MACRO_MIN(MACRO_MAX(a, b), c))
#define MACRO_BETWEEN(x, a, b) ((x) >= (a) && (x) <= (b))

#define MACRO_OFFSET_OF_MEMEBER(structure, member) (u32)((char *)&((structure *)0)->member - (char *)0)
#define MACRO_SIZEOF_MEMBER(structure, member) ((u32)sizeof(((structure *)0)->member))

#define MACRO_REINTERPRET_CAST(new_type, value) (*((new_type *)&(value)))

