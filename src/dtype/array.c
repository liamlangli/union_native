#include "dtype.h"

extern array * array_new() {
    void ** aptr = (void **)malloc(sizeof(void *) * 64);
    array * ptr = (array *)malloc(sizeof(array));
    ptr->items = aptr;
    ptr->nItems = 0;
    ptr->nSize = 64;
    return ptr;
}

extern int array_push_back(array * a, void * item) {
    if (a->nItems < a->nSize - 1) {
        ++a->nItems;
        *(a->items + a->nItems) = item;
    } else {
        // TODO realloc array size;
    }
    return true;
}

extern int array_is_empty(array a) {
    return a.nItems == 0;
}

extern void array_clear(array * a) {

}

extern void array_free(array * a) {
}

extern void array_print(array a) {
    fprintf(stdout, "Array size: %d\n", a.nSize);
    fprintf(stdout, "Number of items in Array: %d\n", a.nItems);
}
