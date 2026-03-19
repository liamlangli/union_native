#pragma once

#include "core/global.h"
#include "core/text.h"

std::string io_read_file(std::string_view path);
u8 *io_load_image(std::string_view path, int *width, int *height, int *channel, int request_channel);
int io_save_png(std::string_view path, int width, int height, int channel, u8 *data);
int io_save_jpg(std::string_view path, int width, int height, int channel, u8 *data);