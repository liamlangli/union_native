#pragma once

#include "foundation/network.h"
#include "foundation/ustring.h"
#include "foundation/udata.h"

ustring io_read_file(ustring_view path);

u8 *io_load_image(ustring_view path, int *width, int *height, int *channel, int request_channel);
u8 *io_load_image_memory(udata data, int *width, int *height, int *channel, int request_channel);
int io_save_png(ustring_view path, int width, int height, int channel, u8 *data);
int io_save_jpg(ustring_view path, int width, int height, int channel, u8 *data);

// clipboard
void io_clipboard_set(ustring_view text);
ustring io_clipboard_get(void);

// base64
ustring io_base64_encode(udata data);
udata io_base64_decode(ustring data);