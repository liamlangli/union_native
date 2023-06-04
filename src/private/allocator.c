#include "allocator.h"
#include "atomic.inl"

#include <stdlib.h>

static allocator_state_t g_allocator_state;

static void *internal_alloc(void *allocator, void* old_ptr, u64 old_size, u64 new_size, const char *file, u32 line)
{
    atomic_fetch_add_u64(&g_allocator_state.allocation_count, 1);
    atomic_fetch_add_u64(&g_allocator_state.allocation_bytes, new_size - old_size);

    void *new_ptr = 0;
    if (new_size) {
        new_ptr = realloc(old_ptr, new_size);
    } else {
        free(old_ptr);
    }
    return new_ptr;
}

allocator_api *g_allocator = &(allocator_api){
    .realloc = internal_alloc,
};