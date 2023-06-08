#if defined(_MSC_VER) && !defined(__clang__)


typedef u64 atomic_uint_least64_t;
typedef u32 atomic_uint_least32_t;
typedef char atomic_flag;

static inline u64 atomic_fetch_add_u64(volatile atomic_uint_least64_t *obj, u64 val);
static inline u64 atomic_fetch_sub_u64(volatile atomic_uint_least64_t *obj, u64 val);
static inline u32 atomic_fetch_add_u32(volatile atomic_uint_least32_t *obj, u32 val);
static inline u32 atomic_fetch_sub_u32(volatile atomic_uint_least32_t *obj, u32 val);

#define WIN32_LEAN_AND_MEAN
#include <windows.h>

#define _Atomic(x) x

static inline u64 atomic_fetch_add_u64(volatile atomic_uint_least64_t *obj, u64 val)
{
    return InterlockedExchangeAdd64((volatile LONG64 *)obj, val);
}

static inline u64 atomic_fetch_sub_u64(volatile atomic_uint_least64_t *obj, u64 val)
{
    return InterlockedExchangeAdd64((volatile LONG64 *)obj, -(i64)val);
}

static inline u32 atomic_fetch_add_u32(volatile atomic_uint_least32_t *obj, u32 val)
{
    return InterlockedExchangeAdd(obj, val);
}

static inline u32 atomic_fetch_sub_u32(volatile atomic_uint_least32_t *obj, u32 val)
{
    return InterlockedExchangeAdd(obj, -(i32)val);
}

#else

#include <stdatomic.h>

#define atomic_fetch_add_u64 atomic_fetch_add
#define atomic_fetch_add_u32 atomic_fetch_add

#define atomic_fetch_sub_u64 atomic_fetch_sub
#define atomic_fetch_sub_u32 atomic_fetch_sub

#endif