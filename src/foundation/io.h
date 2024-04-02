#pragma once

#include "foundation/ustring.h"
#include "foundation/udata.h"

ustring io_read_file(ustring path);

u8 *io_load_image(ustring path, int *width, int *height, int *channel, int request_channel);
u8 *io_load_image_memory(udata data, int *width, int *height, int *channel, int request_channel);
int io_save_png(ustring path, int width, int height, int channel, u8 *data);
int io_save_jpg(ustring path, int width, int height, int channel, u8 *data);

// base64
ustring io_base64_encode(udata data);
udata io_base64_decode(ustring data);

