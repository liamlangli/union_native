#ifndef _global_
#define _global_

#include <stdio.h>

#define bool int
#define false 0
#define true 1

#define EXPORT
#define FORCE_INLINE static inline

#define MACRO_CONCAT_IMPL(a, b) a##b
#define MACRO_CONCAT(a, b) MACRO_CONCAT_IMPL(a, b)
#define MACRO_VAR(name) MACRO_CONCAT(name, __LINE__)
#define MACRO_PAD(n) char MACRO_VAR(_padding_)[n]

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

#endif