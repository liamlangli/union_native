#include "dtype.h"

int array_new(array * a) {
    a->items = malloc(sizeof(void *)* 10);
    a->nItems = 0;
    a->nSize = 10;
    return true;
}

int array_push_back(array * a, void * item) {
    if (a->nItems < a->nSize) {
        a->items[a->nItems] = item;
        a->nItems++;
    } else {
        // TODO realloc array size;
    }
    return true;
}

int array_is_empty(array * a) {
    return a->nItems == 0;
}

void array_clear(array * a) {

}

void array_free(array * a) {
    free(a->items);
}

void array_print(array a) {
    fprintf(stdout, "<Array size: %d items:%d>\n", a.nSize, a.nItems);
}
