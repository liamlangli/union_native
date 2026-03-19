#pragma once

#include "core/global.h"

#include <string>
#include <string_view>

typedef struct url_t {
    bool valid;
    std::string url;
    std::string protocol;
    std::string host;
    i32 port;
    std::string path;
    std::string query;
} url_t;

typedef struct net_request_t {
    url_t url;
    int socket_fd;
} net_request_t;

typedef struct net_response_t {
    u32 status;
    bool header_parsed;
    u32 content_length;
    u32 header_length;
    std::string body;
    std::string header;
    std::string error;
} net_response_t;

url_t url_parse(std::string_view url);
void url_dump(url_t url);

typedef void(*url_session_cb)(net_request_t request, net_response_t response, void *userdata);
int net_download_async(url_t url, url_session_cb cb, void *userdata);
void net_poll(void);