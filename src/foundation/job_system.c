#include "job_system.h"
#include "atomic.inl"

typedef struct {
    void (*execute)(void *, u64);
    void *data;
    u64 id;
} worker_t;
