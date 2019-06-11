#ifndef _container_
#define _container_

#include "global.h"

typedef struct Array_t
{
  u32 size;
  u32 capacity;
  void **buffer;
} Array;

extern Array* array_create();
extern void array_free(Array *arr);
extern bool array_push(Array * arr, void *element);
extern bool array_remove_at(Array *arr, u32 index, void **data);
extern bool array_get(Array *arr, u32 index, void **data);

#endif