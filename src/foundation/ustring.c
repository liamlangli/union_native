#include "foundation/ustring.h"

#include <stdlib.h>

#define MIN_CAPACITY 64

u32 ustring_safe_growth(ustring *s, u32 n) {
    if (n <= 0)
        return 0;

    if (s->data == NULL) {
        s->data = malloc(n);
        s->length = n;
        s->null_terminated = 1;
        return n;
    }

    u32 new_size = MACRO_MAX(0, n);
    if (new_size >= s->length) {
        u32 new_length = MACRO_MAX(s->length * 2, 64);
        while (new_length < new_size)
            new_length *= 2;
        char *new_data = malloc(new_length);
        memcpy(new_data, s->data, s->length);
        if (!s->is_static)
            free((void *)s->data);
        s->data = new_data;
        s->length = new_length;
    }
    return new_size;
}

ustring_view ustring_view_STR(const char *src) {
    ustring_view view;
    size_t len = strlen(src);
    size_t new_size = MACRO_MAX(len + 1, MIN_CAPACITY);
    view.base.data = malloc(new_size);
    memcpy(view.base.data, src, strlen(src) + 1);
    view.base.length = new_size;
    view.base.null_terminated = 1;
    view.start = 0;
    view.length = len;
    return view;
}

u32 ustring_view_set_ustring_view(ustring_view *a, ustring_view *b) {
    if (b->length == 0)
        return a->length;
    u32 new_size = b->length;
    ustring_safe_growth(&a->base, new_size);
    memcpy((void *)a->base.data + a->start, (void *)b->base.data + b->start, b->length);
    a->length = b->length;
    a->base.data[a->start + a->length] = 0;
    return new_size;
}

u32 ustring_view_append_ustring_view(ustring_view *a, ustring_view *b) {
    if (b->length <= 0)
        return a->length;
    u32 new_size = a->start + a->length + b->length;
    ustring_safe_growth(&a->base, new_size);
    if (b->length < 8) {
        for (int i = 0; i < b->length; i++) {
            a->base.data[a->start + a->length + i] = b->base.data[b->start + i];
        }
    } else {
        memcpy((void *)a->base.data + a->start + a->length, (void *)b->base.data + b->start, b->length);
    }
    a->length += b->length;
    return new_size;
}

u32 ustring_view_insert_ustring_view(ustring_view *a, u32 index, ustring_view *b) {
    if (b->length == 0)
        return a->length;
    u32 new_size = a->start + a->length + b->length;
    ustring_safe_growth(&a->base, new_size);
    memmove((void *)a->base.data + a->start + index + b->length, (void *)a->base.data + a->start + index, a->length - index);
    memcpy((void *)a->base.data + a->start + index, (void *)b->base.data + b->start, b->length);
    a->length += b->length;
    return new_size;
}