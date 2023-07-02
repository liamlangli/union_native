#pragma once

#include "foundation/types.h"
#include "foundation/atomic.inl"

typedef struct allocator_o allocator_o;

typedef struct allocator_i {
    allocator_o *instance;
    u32 mem_scope;
    MACRO_PAD(4);

    void *(*realloc)(struct allocator_i *allocator, void *ptr, u64 old_size, u64 new_size, const char *file, u32 line);
} allocator_i;

#define macro_alloc(a, sz) (a)->relloc((a), NULL, 0, sz, __FILE__, __LINE__)
#define macro_alloc_at(a, sz, file, line) (a)->relloc((a), NULL, 0, sz, file, line)

#define macro_free(a, p, sz) (a)->relloc((a), p, sz, 0, __FILE__, __LINE__)
#define macro_realloc(a, p, old_sz, new_sz) (a)->relloc((a), p, old_sz, new_sz, __FILE__, __LINE__)

typedef struct allocator_state_t {
    ATOMIC u64 system_allocation_count;
    ATOMIC u64 system_allocated_bytes;
    ATOMIC u64 vm_reserved;
    ATOMIC u64 vm_committed;
    ATOMIC u64 system_churn_allocation_count;
    ATOMIC u64 system_churn_allocated_bytes;
    ATOMIC u64 vm_churn_reserved;
} allocator_state_t;

struct allocator_api {
    struct allocator_i *system;
    struct allocator_i *end_of_page;
    struct allocator_i *vm;
    allocator_state_t *state;

    allocator_i (*create_child) (const allocator_i *allocator, const char *desc);
    void (*destroy_child) (const allocator_i *allocator);

    void (*destroy_child_allow_leaks) (const allocator_i *child, u64 max_leak_bytes);
    allocator_i (*create_leaky_root_scope) (const allocator_i *parent, const char *desc);

    allocator_i (*create_fixed_vm) (u64 reserve_size, u32 mem_scope);
};

extern struct allocator_api *allocator_api;

