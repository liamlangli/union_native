#include "foundation/udata.h"

#include <stdlib.h>
#include <string.h>

u32 udata_safe_growth(udata_t *u, u32 n) {
    if (n <= 0) 
        return u->length;

    if (u->data == NULL) {
        u->data = malloc(n);
        return n;
    }

    u32 new_size = u->length;
    while (new_size < n) {
        new_size *= 2;
    }

    if (new_size != u->length) {
        void *new_data = malloc(new_size);
        memcpy(new_data, u->data, u->length);
        free(u->data);
        u->data = new_data;
    }

    return new_size;
}

udata_t udata_create(void *data, u32 size) {
    if (size <= 0) 
        return (udata_t){0};
    udata_t u = {.length = size};
    udata_safe_growth(&u, size);
    memcpy(u.data, data, size);
    return u;
}

void udata_free(udata_t *u) {
    if (u->length <= 0) return;
    free(u->data);
    u->data = NULL;
    u->length = 0;
}

u32 udata_append_raw(udata_t *u, void *data, u32 size) {
    u32 start = u->length;
    udata_safe_growth(u, start + size);
    memcpy(u->data + start, data, size);
    u->length += size;
    return start;
}
