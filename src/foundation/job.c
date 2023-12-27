#include "foundation/job.h"

job_handle_t job_create(void *fn, void *data) {
    job_handle_t handle = {data, fn};
    return handle;
}