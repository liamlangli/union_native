#include "foundation/io.h"
#include "foundation/network.h"
#include "foundation/ustring.h"
#include "foundation/script.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb_image_write.h>

#if defined(OS_WINDOWS)
    int betriebssystem = 1;
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #include <iphlpapi.h>
    #include <ws2def.h>
    #pragma comment(lib, "Ws2_32.lib")
    #include <windows.h>
    #include <io.h>
#else
    #include <netdb.h>
    #include <netinet/in.h>
    #include <string.h>
    #include <sys/socket.h>
#endif
#include <sys/types.h>
#include <unistd.h>

ustring io_read_file(ustring_view path) {
    ustring_view_set_null_terminated(&path);
    FILE *file = fopen(path.base.data, "rb");
    if (!file) {
        return ustring_str("");
    }

    fseek(file, 0, SEEK_END);
    size_t size = ftell(file);
    fseek(file, 0, SEEK_SET);

    char *buffer = malloc(size + 1);
    fread(buffer, 1, size, file);
    buffer[size] = 0;

    fclose(file);

    return ustring_str(buffer);
}

u8 *io_load_image(ustring_view path, int *width, int *height, int *channel, int request_channel) {
    ustring_view_set_null_terminated(&path);
    return stbi_load(path.base.data, width, height, channel, request_channel);
}

u8 *io_load_image_memory(u8 *data, size_t length, int *width, int *height, int *channel, int request_channel) {
    return stbi_load_from_memory(data, (int)length, width, height, channel, request_channel);
}

int io_save_png(ustring_view path, int width, int height, int channel, u8 *data) {
    ustring_view_set_null_terminated(&path);
    return stbi_write_png(path.base.data, width, height, channel, data, width * channel);
}

int io_save_jpg(ustring_view path, int width, int height, int channel, u8 *data) {
    ustring_view_set_null_terminated(&path);
    return stbi_write_jpg(path.base.data, width, height, channel, data, 100);
}

void io_clipboard_set(ustring_view text) {
    script_context_t *ctx = script_context_share();
    ustring data = ustring_view_to_new_ustring(&text);
    glfwSetClipboardString(ctx->window, data.data);
    ustring_view_free(&text);
}

ustring io_clipboard_get(void) {
    script_context_t *ctx = script_context_share();
    const char *text = glfwGetClipboardString(ctx->window);
    return ustring_str((i8*)text);
}