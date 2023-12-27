#pragma once

typedef struct job_handle_t {
    void *data;
    void *fn;
} job_handle_t;

job_handle_t job_create(void *fn, void *data);
