#include "foundation/ustring.h"

#include <stdlib.h>

#define MIN_CAPACITY 64
#define MIN_MEMORY_OP_SIZE 8

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
    if (new_size > s->length) {
        u32 new_length = MACRO_MAX(s->length * 2, MIN_CAPACITY);
        while (new_length < new_size)
            new_length *= 2;
        char *new_data = malloc(new_length);
        memcpy(new_data, s->data, s->length);
        if (!s->is_static && s->length > 0)
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
    view.base.length = (u32)new_size;
    view.base.null_terminated = 1;
    view.start = 0;
    view.length = (u32)len;
    return view;
}

ustring ustring_view_sub_ustring(ustring_view *v, u32 from, u32 to) {
    if (from >= to)
        return ustring_str("");
    ustring s;
    s.data = malloc(to - from + 1);
    s.length = to - from;
    s.null_terminated = 1;
    memcpy(s.data, v->base.data + v->start + from, to - from);
    s.data[s.length] = 0;
    return s;
}

ustring ustring_view_to_ustring(ustring_view *v) {
    ustring s;
    if (!v->base.null_terminated) {
        ustring_view_set_null_terminated(v);
    }
    s.data = v->base.data + v->start;
    s.length = v->length;
    s.null_terminated = 1;
    return s;
}

u32 ustring_view_erase(ustring_view *v, u32 from, u32 to) {
    if (from >= to)
        return v->length;
    u32 new_size = v->length - (to - from);
    if (to - from < MIN_MEMORY_OP_SIZE) {
        for (int i = to; i < v->length; i++) {
            v->base.data[v->start + from + i - to] = v->base.data[v->start + i];
        }
    } else {
        memmove((void *)v->base.data + v->start + from, (void *)v->base.data + v->start + to, v->length - to);
    }
    v->length = new_size;
    return new_size;
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
    if (b->length < MIN_MEMORY_OP_SIZE) {
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

u32 ustring_view_insert_ustring(ustring_view *a, u32 index, ustring *b) {
    if (b->length == 0)
        return a->length;
    u32 new_size = a->start + a->length + b->length;
    ustring_safe_growth(&a->base, new_size);
    memmove((void *)a->base.data + a->start + index + b->length, (void *)a->base.data + a->start + index, a->length - index);
    memcpy((void *)a->base.data + a->start + index, (void *)b->data, b->length);
    a->length += b->length;
    return new_size;
}

u32 ustring_view_insert_STR_length(ustring_view *a, u32 index, const char *b, u32 length) {
    if (length <= 0)
        return a->length;
    u32 new_size = a->start + a->length + length;
    ustring_safe_growth(&a->base, new_size);
    memmove((void *)a->base.data + a->start + index + length, (void *)a->base.data + a->start + index, a->length - index);
    memcpy((void *)a->base.data + a->start + index, b, length);
    a->length += length;
    return new_size;
}

u32 ustring_view_insert_STR(ustring_view *a, u32 index, const char *b) {
    return ustring_view_insert_STR_length(a, index, b, (u32)strlen(b));
}

u32 ustring_view_insert_STR_range(ustring_view *a, u32 index, const char *b, u32 start, u32 end) {
    return ustring_view_insert_STR_length(a, index, b + start, end - start);
}

u32 ustring_view_append_STR(ustring_view *a, const char *b) {
    u32 b_length = (u32)strlen(b);
    if (b_length <= 0)
        return a->length;
    u32 new_size = a->start + a->length + b_length;
    ustring_safe_growth(&a->base, new_size);
    memcpy((void *)a->base.data + a->start + a->length, b, b_length);
    a->length += b_length;
    return new_size;
}

