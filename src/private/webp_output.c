#include "io.h"
#include "webp/encode.h"
#include <stdlib.h>

bool image_save_webp(string filename, u8 * data, i32 width, i32 height, size_t len)
{
  FILE * fd = fopen(filename, "wb");
  if (fd == NULL)
  {
    printf("file open error");
    exit(2);
  }

  u8 *binary;

  size_t binary_size = WebPEncodeRGB(data, width, height, width * 3, 75.0f, &binary);
  fwrite(binary, binary_size, 1, fd);
  WebPFree(binary);

  return true;
}