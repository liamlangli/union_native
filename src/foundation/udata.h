#pragma once

#include "foundation/global.h"

typedef struct udata_t {
    i8 *data;
    u32 length;
} udata_t;

udata_t udata_create(void *data, u32 length);
void udata_free(udata_t *udata);

u32 udata_append_raw(udata_t *udata, void *data, u32 length);
#define udata_append(u, d) (udata_append_raw((u), (d)->data, (d)->length))