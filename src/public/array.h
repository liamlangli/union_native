#ifndef _array_h_
#define _array_h_

#include "global.h"
#include "allocator.h"

typedef struct {
    u64 capacity;
    u64 size;
} ArrayHeader;

#define Array_header(a) ((ArrayHeader *)((u8 *)(a) - sizeof(ArrayHeader)))
#define Array_size(a) ((a) ? Array_header(a)->size : 0)
#define Array_bytes(a) ((Array_size(a)) * sizeof(*(a)))
#define Array_end(a) ((a) ? (a) + Array_size(a) : 0)
#define Array_last(a) ((a) ? (a) + Array_size(a) - 1 : 0)
#define Array_capacity(a) ((a) ? Array_header(a)->capacity : 0)
#define Array_needs_to_grow(a, n) ((n) > Array_capacity(a))
#define Array_pop(a) ((a)[--Array_header(a)->size])
#define Array_shrink(a, n) ((a) ? Array_header(a)->size = n : 0)

#define Array_grow_at(a, n, allocator, file, line) ((a) = array_grow(a, n, sizeof(*(a)), allocator, file, line))

static inline void *Array_grow_internal(void* arr, u64 to_at_least, u64 item_size, \
    Allocator *allocator, const char *file, u32 line)
{
    u8 *p  = arr ? (u8*)Array_header(arr) : 0;
    const u64 extra = sizeof(ArrayHeader);
    const u64 size = Array_size(arr);
    const u64 before = arr ? item_size * Array_capacity(arr) + extra : 0;
    const u64 after = item_size * to_at_least + extra;
    if (p && !Array_capacity(arr)) {
        u8 *old_p = p;
        p = (u8*)allocator->realloc(allocator, p, after, file, line);
    }
}
#endif