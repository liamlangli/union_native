#include "foundation/ustring.h"

u32 ustring_safe_growth(ustring* s, u32 n) {
    if (s->data == NULL) {
        s->data = malloc(n);
        s->length = 0;
        s->null_terminated = 1;
        return n;
    }

    u32 size = strlen(s->data);
    u32 new_size = size + n;
    if (new_size >= s->length) {
        u32 new_length = s->length * 2;
        while (new_length < new_size) new_length *= 2;
        char* new_data = malloc(new_length);
        memcpy(new_data, s->data, size);
        if (!s->is_static) free((void*)s->data);
        s->data = new_data;
        s->length = new_length;
    }
    return new_size;
}
