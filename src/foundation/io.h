#pragma once

#include "foundation/network.h"
#include "foundation/ustring.h"

ustring io_read_file(ustring_view path);
ustring io_http_get(url_t url);

u8 *io_load_image(ustring_view path, int *width, int *height, int *channel, int request_channel);
u8 *io_load_image_memory(u8 *data, size_t length, int *width, int *height, int *channel, int request_channel);
int io_save_png(ustring_view path, int width, int height, int channel, u8 *data);
int io_save_jpg(ustring_view path, int width, int height, int channel, u8 *data);