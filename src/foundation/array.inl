#ifndef _array_h_
#define _array_h_

#include "global.h"
#include "allocator.h"

#include <string.h>

typedef struct {
    u64 capacity;
    u64 size;
} array_header_t;

#define array_header(a) ((array_header_t *)((u8 *)(a) - sizeof(array_header_t)))
#define array_size(a) ((a) ? array_header(a)->size : 0)
#define array_bytes(a) ((Array_size(a)) * sizeof(*(a)))

#define array_end(a) ((a) ? (a) + array_size(a) : 0)
#define array_last(a) ((a) ? (a) + array_size(a) - 1 : 0)

#define array_capacity(a) ((a) ? array_header(a)->capacity : 0)
#define array_needs_to_grow(a, n) ((n) > array_capacity(a))

#define array_pop(a) ((a)[--array_header(a)->size])
#define array_shrink(a, n) ((a) ? array_header(a)->size = n : 0)

#define array_grow_at(a, n, allocator, file, line) ((a) = array_grow_internal(a, n, sizeof(*(a)), allocator, file, line))
#define array_grow(a, n, allocator) array_grow_at(a, n, allocator, __FILE__, __LINE__)

#define array_ensure_at(a, n, allocator, file, line) (array_needs_to_grow(a, n) ? array_grow_at(a, n, allocator, file, line) : 0)
#define array_ensure(a, n, allocator) array_ensure_at(a, n, allocator, __FILE__, __LINE__)

#define array_set_capacity_at(a, n, allocator, file, line) ((*(void**)&(a)) = array_set_capacity_internal((void*)a, n, sizeof(*(a)), allocator, file, line))
#define array_set_capacity(a, n, allocator) array_set_capacity_at(a, n, allocator, __FILE__, __LINE__)

#define array_push_at(a, v, allocator, file, line) (array_ensure_at(a, array_size(a) + 1, allocator, file, line), (a)[array_header(a)->size++] = (v), (a) + array_header(a)->size - 1)
#define array_push(a, v, allocator) array_push_at(a, v, allocator, __FILE__, __LINE__)

#define array_push_array_at(a, v, n, allocator, file, line) ((n) ? (array_ensure_at(a, array_size(a) + (n), allocator, file, line), memcpy((a) + array_header(a)->size, (v), (n) * sizeof(*(a))), array_header(a)->size += (n), (a) + array_header(a)->size - (n), 0) : 0)
#define array_push_array(a, v, n, allocator) array_push_array_at(a, v, n, allocator, __FILE__, __LINE__)

#define array_resize_at(a, n, allocator, file, line) ((array_needs_to_grow(n) ? array_set_capacity_at(a, n, allocator, file, line) : 0), (a) ? array_header(a)->size = (n) : 0)
#define array_resize(a, n, allocator) array_resize_at(a, n, allocator, __FILE__, __LINE__)

#define array_resize_geom_at(a, n, allocator, file, line) (tm_carray_ensure_at(a, n, allocator, file, line), (a) ? array_header(a)->size = (n) : 0)
#define array_resize_geom(a, n, allocator) array_resize_geom_at(a, n, allocator, __FILE__, __LINE__)

#define array_free_at(a, allocator, file, line) ((*(void**)&(a)) = array_set_capacity_internal((void*)a, 0, sizeof(*(a)), allocator, file, line))
#define array_free(a, allocator) array_free_at(a, allocator, __FILE__, __LINE__)

static inline void *array_set_capacity_internal(void* arr, u64 new_capacity, u64 item_size,
    allocator_api *allocator, const char* file, u32 line)
{
    u8 *p = arr ? (u8*)array_header(arr) : 0;
    const u64 extra = sizeof(array_header_t);
    const u64 size = array_size(arr);
    const u64 bytes_before = arr ? item_size * array_capacity(arr) + extra : 0;
    const u64 bytes_after = new_capacity ? item_size * new_capacity + extra : 0;
    if (p && !array_capacity(arr)) {
        u8 *old_p = p;
        p = (u8*)allocator->realloc(allocator, p, bytes_before, bytes_after, file, line);
        const u64 static_bytes = item_size * size + extra;
        const u64 to_copy = bytes_after < static_bytes ? bytes_after : static_bytes;
        memcpy(p, old_p, to_copy);
    } else 
        p = (u8*)allocator->realloc(allocator, p, bytes_before, bytes_after, file, line);

    void *new_a = p ? p + extra : p;
    if (new_a) {
        array_header(new_a)->capacity = new_capacity;
        array_header(new_a)->size = size;
    }
    return new_a;
}

static inline void *array_grow_internal(void* arr, u64 to_at_least, u64 item_size,
    allocator_api *allocator, const char *file, u32 line)
{
    const u64 capacity = arr ? array_capacity(arr) : 0;
    if (capacity >= to_at_least)
        return arr;

    const u64 min_new_capacity = capacity ? capacity * 2 : 16;
    const u64 new_capacity = MACRO_MAX(min_new_capacity, to_at_least);
    return array_set_capacity_internal(arr, new_capacity, item_size, allocator, file, line);
}


#endif