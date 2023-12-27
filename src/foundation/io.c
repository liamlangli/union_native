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

#define HEADER_BUFFER_SIZE 1024
#define BUFFER_SIZE 16384

#define ACCEPT                                                                                                                 \
    "Accept: "                                                                                                                 \
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/"                                                  \
    "webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
#define ACCEPT_ENCODING "Accept-Encoding: gzip, deflate, br"
#define ACCEPT_LANGUAGE "Accept-Language: en-US,en;q=0.9"
#define CACHE_CONTROL "Cache-Control: no-cache"
#define USER_AGENT                                                                                                             \
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "                                                \
    "(KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"

ustring io_http_download(url_t url) {
    int sockfd;
    struct sockaddr_in server_addr;
    struct hostent *host;
    char *request = malloc(HEADER_BUFFER_SIZE);
    char host_buff[256];
    char *file_content = malloc(BUFFER_SIZE);
    ustring file_data = ustring_STR("");

    // Create socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd == -1) {
        perror("Socket creation failed");
        return file_data;
    }

    // Get host information
    memcpy(host_buff, url.host.data, url.host.length);
    host_buff[url.host.length] = '\0';
    host = gethostbyname(host_buff);
    if (host == NULL) {
        perror("Failed to get host information");
        return file_data;
    }

    // Set server address
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(80);
    server_addr.sin_addr = *((struct in_addr *)host->h_addr);
    memset((void*)&(server_addr.sin_zero), 0, 8);

    // Connect to server
    if (connect(sockfd, (struct sockaddr *)&server_addr, sizeof(struct sockaddr)) == -1) {
        perror("Connection failed");
        return file_data;
    }

    // Send HTTP GET request
    snprintf(request, HEADER_BUFFER_SIZE, "GET %s HTTP/1.1\r\nHost: %s\r\n%s\r\n\r\n", url.path.data, url.host.data, USER_AGENT);
    if (send(sockfd, request, strlen(request), 0) == -1) {
        perror("Failed to send request");
        return file_data;
    }

    // Receive file data
    ssize_t bytes_received;
    while ((bytes_received = recv(sockfd, file_content, BUFFER_SIZE, 0)) > 0) {
        ustring_append_length(&file_data, file_content, bytes_received);
    }

    // Close socket
    close(sockfd);

    return file_data;
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

void io_clipboard_set(ustring text) {
    script_context_t *ctx = script_context_share();
    glfwSetClipboardString(ctx->window, text.data);
}

ustring io_clipboard_get(void) {
    script_context_t *ctx = script_context_share();
    const char *text = glfwGetClipboardString(ctx->window);
    return ustring_str((i8*)text);
}