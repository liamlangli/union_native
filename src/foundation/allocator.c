#include "allocator.h"
#include "atomic.inl"

#include <stdlib.h>

static allocator_state_t g_allocator_state;

static void *system_realloc(void *allocator, void* old_ptr, u64 old_size, u64 new_size, const char *file, u32 line)
{
    atomic_fetch_add_u64(&g_allocator_state.system_allocation_count, (new_size ? 1 : 0) - (old_size ? 1 : 0));
    atomic_fetch_add_u64(&g_allocator_state.system_allocated_bytes, new_size - old_size);

    void *new_ptr = 0;
    if (new_size) {
        new_ptr = realloc(old_ptr, new_size);
        atomic_fetch_add_u64(&g_allocator_state.system_churn_allocation_count, 1);
        atomic_fetch_add_u64(&g_allocator_state.system_churn_allocated_bytes, new_size - old_size);
    } else {
        free(old_ptr);
    }
    return new_ptr;
}

static void *end_of_page_realloc(struct allocator_i *allocator,
    void *old_ptr, u64 old_size, u64 new_size,
    const char *file, u32 line) {
    const u32 page_size = 4096;

    if (old_size && new_size && new_size <= old_size) {
        return old_ptr;
    }

    void *new_ptr = 0;
    if (new_size) {
        const u64 new_size_up = (new_size + page_size - 1) / page_size * page_size;
        // void *base =  os memory map
    } else {
        // tracking memory
    }

    if (old_size && new_size) 
        memcpy(new_ptr, old_ptr, old_size);

    if (old_ptr) {
        const u64 old_size_up = (old_size + page_size - 1) / page_size * page_size;
        const u64 offset = old_size_up - old_size;
        void *base = (u8 *)old_ptr - offset;
        // os unmap
    }

    return new_ptr;
}

static allocator_i system_allocator = { .realloc = system_realloc };

struct allocator_api *allocator_api = &(struct allocator_api) {
    .system = &system_allocator
};
