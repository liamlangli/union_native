#include "container.h"

#include <stdlib.h>
#include <string.h>

Array* array_create()
{
  Array *arr = (Array*)malloc(sizeof(Array));
  arr->size = 0;
  arr->capacity = 100;
  arr->buffer = (void**)calloc(arr->capacity, sizeof(void*));
  return arr;
}

void array_free(Array *arr)
{
  free(arr->buffer);
  free(arr);
}

bool array_push(Array * arr, void *element)
{
  if (arr->size >= arr->capacity)
  {
    fprintf(stderr, "upto max array size.");
    return false;
  }

  arr->buffer[arr->size] = element;
  ++(arr->size);
  return true;
}

bool array_remove_at(Array *arr, u32 index, void **data)
{
  if (index >= arr->size)
  {
    fprintf(stderr, "out of range");
    return false;
  }

  if (data)
  {
    *data = arr->buffer[index];
  }

  if (index != arr->size -1)
  {
    u32 block_size = (arr->size - 1 - index) * sizeof(void *);

    memmove(
      &(arr->buffer[index]),
      &(arr->buffer[index + 1]),
      block_size
    );
  }

  --(arr->size);
  return true;
}

bool array_get(Array *arr, u32 index, void **data)
{
  if (index >= arr->size)
  {
    return false;
  }
  *data = arr->buffer[index];
  return true;
}