#ifndef _worker_h_
#define _worker_h_

#include "global.h"

typedef struct {
    u64 dispatch(u64 (*execute)(void *data, u64 id), void *data, const char* worker_name);
} WorkerAPI;

#endif