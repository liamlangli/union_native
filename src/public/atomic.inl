#include <stdatomic.h>

#define atomic_fetch_add_u64 atomic_fetch_add
#define atomic_fetch_add_u32 atomic_fetch_add

#define atomic_fetch_sub_u64 atomic_fetch_sub
#define atomic_fetch_sub_u32 atomic_fetch_sub

#define atomic_exchange_ptr atomic_exchange
#define atomic_exchange_weak_ptr atomic_compare_exchange_weak
