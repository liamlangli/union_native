#include "foundation/io.h"
#include "foundation/network.h"
#include "foundation/ustring.h"
#include <stdio.h>
#include <stdlib.h>

#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>

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

ustring io_read_file(ustring path) {
    FILE *file = fopen(path.data, "rb");
    if (!file) {
        return ustring_str("");
    }

    fseek(file, 0, SEEK_END);
    u32 size = ftell(file);
    fseek(file, 0, SEEK_SET);

    char *buffer = malloc(size + 1);
    fread(buffer, 1, size, file);
    buffer[size] = 0;

    fclose(file);

    return ustring_str(buffer);
}

#define BUFFER_SIZE 1024
#define ACCEPT                                                                 \
    "Accept: "                                                                   \
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/"    \
    "webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
#define ACCEPT_ENCODING "Accept-Encoding: gzip, deflate, br"
#define ACCEPT_LANGUAGE "Accept-Language: en-US,en;q=0.9"
#define CACHE_CONTROL "Cache-Control: no-cache"
#define USER_AGENT                                                             \
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "  \
    "(KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"

ustring io_http_get(url_t url) {
    int sockfd;
    struct sockaddr_in server_addr;
    struct hostent *host;
    char request[BUFFER_SIZE];
    char response[BUFFER_SIZE];
    char host_buff[256];
    char *file_content = NULL;

    // Create socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd == -1) {
        perror("Socket creation failed");
        return ustring_str("");
    }

    // Get host information
    memcpy(host_buff, url.host.data, url.host.length);
    host_buff[url.host.length] = '\0';
    host = gethostbyname(host_buff);
    if (host == NULL) {
        perror("Failed to get host information");
        return ustring_str("");
    }

    // Set server address
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(80);
    server_addr.sin_addr = *((struct in_addr *)host->h_addr);
    memset(&(server_addr.sin_zero), 0, 8);

    // Connect to server
    if (connect(sockfd, (struct sockaddr *)&server_addr,
                sizeof(struct sockaddr)) == -1) {
        perror("Connection failed");
        return ustring_str("");
    }

    // Send HTTP GET request
    snprintf(request, BUFFER_SIZE,
            "GET /%s HTTP/1.1\r\nHost: %s\r\n%s\r\n%s\r\n%s\r\n%s\r\n%s\r\n\r\n",
            url.path.data, host_buff, ACCEPT, ACCEPT_ENCODING, ACCEPT_LANGUAGE,
            CACHE_CONTROL, USER_AGENT);

    if (send(sockfd, request, strlen(request), 0) == -1) {
        perror("Failed to send request");
        return ustring_str("");
    }

    // Receive response
    memset(response, 0, BUFFER_SIZE);
    if (recv(sockfd, response, BUFFER_SIZE - 1, 0) == -1) {
        perror("Failed to receive response");
        return ustring_str("");
    }

    // Extract file content from response
    char *content_start = strstr(response, "\r\n\r\n");
    if (content_start != NULL) {
        content_start += 4; // Skip the "\r\n\r\n"
        size_t content_length = strlen(content_start);
        file_content = (char *)malloc(content_length + 1);
        strncpy(file_content, content_start, content_length);
        file_content[content_length] = '\0';
    }

    // Close socket
    close(sockfd);
    return ustring_str(file_content);
}


u8* io_load_image(ustring path, int* width, int* height, int *channel, int request_channel) {
    return stbi_load(path.data, width, height, channel, request_channel);
}

u8* io_load_image_memory(u8* data, size_t length, int* width, int* height, int *channel, int request_channel) {
    return stbi_load_from_memory(data, length, width, height, channel, request_channel);
}