#ifndef Dtype_H
#define Dtype_H

/**
 *
 *  Data Structure Define
 *  Array
 *  Map
 *  Set
 *
 */

#include "../common/common.h"

typedef struct {
    int nItems;
    int nSize;
    void ** items;
} array;

extern int      array_new(array * a);
extern int      array_push_back(array * a, void * item);
extern int      array_is_empty(array * a);
extern void     array_clear(array * a);
extern void     array_free(array * a);
extern void     array_print(array a);

#endif
