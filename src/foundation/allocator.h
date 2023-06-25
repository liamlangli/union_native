#ifndef _allocator_h_
#define _allocator_h_

#include "public/global.h"
#include "foundation/types.h"

typedef struct {
    void* allocator;
    u32 mem_scope;
    MACRO_PAD(4);

    void *(*realloc)(void* allocator, void *ptr, u64 old_size, u64 new_size, const char *file, u32 line);
} allocator_api;

typedef struct {
    ATOMIC u64 allocation_count;
    ATOMIC u64 allocation_bytes;
} allocator_state_t;

extern allocator_api *g_allocator;

#endif
