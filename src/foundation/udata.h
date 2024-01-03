#pragma once

#include "foundation/global.h"

typedef struct udata {
    i8 *data;
    u32 length;
} udata;

udata udata_create(void *data, u32 length);
void udata_free(udata *udata);

u32 udata_append_raw(udata *udata, void *data, u32 length);
#define udata_NULL ((udata){ .data = NULL, .length = 0 })
#define udata_append(u, d) (udata_append_raw((u), (d)->data, (d)->length))