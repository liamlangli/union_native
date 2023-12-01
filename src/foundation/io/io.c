#include "io.h"
#include <stdlib.h>

ustring_t io_read_file(const char* path)
{
    FILE* file = fopen(path, "rb");
    if (!file) {
        return string_str("");
    }

    fseek(file, 0, SEEK_END);
    u32 size = ftell(file);
    fseek(file, 0, SEEK_SET);

    char* buffer = malloc(size + 1);
    fread(buffer, 1, size, file);
    buffer[size] = 0;

    fclose(file);

    return string_str(buffer);
}