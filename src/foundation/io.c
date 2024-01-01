#include "foundation/io.h"
#include "foundation/network.h"
#include "foundation/ustring.h"
#include "script/script.h"

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
    ustring_free(&data);
}

ustring io_clipboard_get(void) {
    script_context_t *ctx = script_context_share();
    const char *text = glfwGetClipboardString(ctx->window);
    return ustring_str((i8*)text);
}


static char base64_encoding_table[] = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                                'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
                                'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                                'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
                                'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
                                'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
                                'w', 'x', 'y', 'z', '0', '1', '2', '3',
                                '4', '5', '6', '7', '8', '9', '+', '/'};
static char *base64_decoding_table = NULL;
static int base64_mod_table[] = {0, 2, 1};

ustring io_base64_encode(udata data) {
    ustring encoded = ustring_str("");
    u8 *bytes = (u8*)data.data;
    u32 length = data.length;
    u32 encoded_length = (length + 2) / 3 * 4;
    ustring_safe_growth(&encoded, encoded_length);
    encoded.data[encoded_length] = 0;
    for (u32 i = 0, j = 0; i < length;) {
        u32 octet_a = i < length ? bytes[i++] : 0;
        u32 octet_b = i < length ? bytes[i++] : 0;
        u32 octet_c = i < length ? bytes[i++] : 0;
        u32 triple = (octet_a << 0x10) + (octet_b << 0x08) + octet_c;
        encoded.data[j++] = base64_encoding_table[(triple >> 3 * 6) & 0x3F];
        encoded.data[j++] = base64_encoding_table[(triple >> 2 * 6) & 0x3F];
        encoded.data[j++] = base64_encoding_table[(triple >> 1 * 6) & 0x3F];
        encoded.data[j++] = base64_encoding_table[(triple >> 0 * 6) & 0x3F];
    }
    for (int i = 0; i < base64_mod_table[length % 3]; i++)
        encoded.data[encoded_length - 1 - i] = '=';
    return encoded;
}

udata io_base64_decode(ustring data) {
    if (base64_decoding_table == NULL) {
        base64_decoding_table = malloc(256);
        for (int i = 0; i < 64; i++)
            base64_decoding_table[(unsigned char)base64_encoding_table[i]] = i;
    }
    ustring decoded = ustring_str("");
    u32 length = data.length;
    if (length % 4 != 0)
        return (udata){.data = NULL, .length = 0};
    u32 decoded_length = length / 4 * 3;
    if (data.data[length - 1] == '=')
        decoded_length--;
    if (data.data[length - 2] == '=')
        decoded_length--;
    ustring_safe_growth(&decoded, decoded_length);
    decoded.data[decoded_length] = 0;
    for (u32 i = 0, j = 0; i < length;) {
        u32 sextet_a = data.data[i] == '=' ? 0 & i++ : base64_decoding_table[data.data[i++]];
        u32 sextet_b = data.data[i] == '=' ? 0 & i++ : base64_decoding_table[data.data[i++]];
        u32 sextet_c = data.data[i] == '=' ? 0 & i++ : base64_decoding_table[data.data[i++]];
        u32 sextet_d = data.data[i] == '=' ? 0 & i++ : base64_decoding_table[data.data[i++]];
        u32 triple = (sextet_a << 3 * 6) + (sextet_b << 2 * 6) + (sextet_c << 1 * 6) + (sextet_d << 0 * 6);
        if (j < decoded_length)
            decoded.data[j++] = (triple >> 2 * 8) & 0xFF;
        if (j < decoded_length)
            decoded.data[j++] = (triple >> 1 * 8) & 0xFF;
        if (j < decoded_length)
            decoded.data[j++] = (triple >> 0 * 8) & 0xFF;
    }
    return (udata){.data = decoded.data, .length = decoded_length};
}