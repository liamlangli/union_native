#ifndef _allocator_h_
#define _allocator_h_

#include "global.h"
#include "types.h"

typedef struct Allocator Allocator;
typedef struct {
    Allocator* allocator;
    u32 mem_scope;
    MACRO_PAD(4);

    void *(*realloc)(Allocator* allocator, void *ptr, u64 old_size, u64 new_size, const char *file, u32 line);
} IAllocator;

typedef struct {
    ATOMIC u64 allocation_count;
    ATOMIC u64 allocation_bytes;
} AllocatorState;

#endif