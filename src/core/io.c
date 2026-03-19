#include "core/io.h"

#include <cstdio>
#include <vector>

#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>

std::string io_read_file(std::string_view path) {
    FILE *file = fopen(std::string(path).c_str(), "rb");
    if (!file) return {};

    fseek(file, 0, SEEK_END);
    size_t size = ftell(file);
    fseek(file, 0, SEEK_SET);

    std::string buffer(size, '\0');
    fread(buffer.data(), 1, size, file);
    fclose(file);

    return buffer;
}

u8 *io_load_image(std::string_view path, int *width, int *height, int *channel, int request_channel) {
    return stbi_load(std::string(path).c_str(), width, height, channel, request_channel);
}

int io_save_png(std::string_view path, int width, int height, int channel, u8 *data) {
    return stbi_write_png(std::string(path).c_str(), width, height, channel, data, width * channel);
}

int io_save_jpg(std::string_view path, int width, int height, int channel, u8 *data) {
    return stbi_write_jpg(std::string(path).c_str(), width, height, channel, data, 100);
}