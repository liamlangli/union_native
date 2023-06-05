#ifndef _worker_h_
#define _worker_h_

#include "global.h"

typedef struct {
    // dispatch 
    u64 (*thread_dispatch)(u64 (*execute)(void *data, u64 id), void *data, const char* worker_name);
    u64 (*async_dispathch)(u64 (*execute)(void *data, u64 id), void *data, const char* worker_name);
} job_system_api;

job_system_api* job_system_default(void);

#endif
