#ifndef _container_
#define _container_

#include "global.h"

/**
 *
 *  Data Structure Define
 *  Array
 *  Map
 *  Set
 *
 **/

typedef struct
{
    u32 nItems;
    u32 nSize;
    void **items;
} array;

extern bool array_new(array *a);
extern bool array_push_back(array *a, void *item);
extern u32 array_is_empty(array *a);
extern void array_clear(array *a);
extern void array_free(array *a);
extern void array_print(array a);

#endif
