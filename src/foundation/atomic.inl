#include "public/global.h"

#if defined(_MSC_VER) && !defined(__clang__)

typedef u64 atomic_uint_least64_t;
typedef u32 atomic_uint_least32_t;
typedef char atomic_flag;

static inline u64 atomic_fetch_add_u64(volatile atomic_uint_least64_t *obj, u64 val);
static inline u64 atomic_fetch_sub_u64(volatile atomic_uint_least64_t *obj, u64 val);
static inline u32 atomic_fetch_add_u32(volatile atomic_uint_least32_t *obj, u32 val);
static inline u32 atomic_fetch_sub_u32(volatile atomic_uint_least32_t *obj, u32 val);
static inline void *atomic_exchange_pointer(void *volatile *obj, void *desired);
static inline bool atomic_compare_exchange_weak_pointer(void *volatile *obj, void **expected, void *desired);
static inline bool atomic_flag_test_and_set(volatile atomic_flag *obj);
static inline void atomic_flag_clear(volatile atomic_flag *obj);
static inline bool atomic_compare_exchange_weak_uint32_t(volatile atomic_uint_least32_t *obj, u32 *expected, u32 desired);
static inline u32 atomic_exchange_uint32_t(volatile atomic_uint_least32_t *obj, u32 exchange);

#define WIN32_LEAN_AND_MEAN
#include <Windows.h>

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


static inline void *atomic_exchange_pointer(void *volatile *obj, void *desired)
{
    return InterlockedExchangePointer(obj, desired);
}

static inline bool atomic_compare_exchange_weak_pointer(void *volatile *obj, void **expected, void *desired)
{
    return InterlockedCompareExchangePointer(obj, desired, *expected) == *expected;
}

static inline bool atomic_flag_test_and_set(volatile atomic_flag *obj)
{
    return InterlockedExchange8(obj, 1);
}

static inline void atomic_flag_clear(volatile atomic_flag *obj)
{
    InterlockedExchange8(obj, 0);
}

static inline bool atomic_compare_exchange_weak_uint32_t(volatile atomic_uint_least32_t *obj, u32 *expected, u32 desired)
{
    return InterlockedCompareExchange((volatile long *)obj, desired, *expected) == *(long *)expected;
}

static inline u32 atomic_exchange_uint32_t(volatile atomic_uint_least32_t *obj, u32 exchange)
{
    return InterlockedExchange(obj, exchange);
}

#else

#include <stdatomic.h>

#define atomic_fetch_add_u64 atomic_fetch_add
#define atomic_fetch_add_u32 atomic_fetch_add

#define atomic_fetch_sub_u64 atomic_fetch_sub
#define atomic_fetch_sub_u32 atomic_fetch_sub

#define atomic_exchange_pointer atomic_exchange
#define atomic_compare_exchange_weak_pointer atomic_compare_exchange_weak

#define atomic_compare_exchange_weak_u32 atomic_compare_exchange_weak
#define atomic_exchange_u32 atomic_exchange

#endif
