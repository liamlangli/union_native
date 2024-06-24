#pragma once

#include "foundation/global.h"
#include "foundation/udata.h"
#include "foundation/ustring.h"

#include <libuv/uv.h>

typedef struct url_t {
    bool valid;
    ustring_view url;
    ustring_view protocol;
    ustring_view host;
    i32 port;
    ustring_view path;
    ustring_view query;
} url_t;

typedef struct net_request_t {
    uv_tcp_t socket;
    url_t url;
} net_request_t;

typedef struct net_response_t {
    udata data;
    u32 status;
    u32 content_length, header_length;
    bool header_parsed;
    ustring_view body, header;
    ustring_view error;
} net_response_t;

url_t url_parse(ustring_view url);
void url_dump(url_t url);

typedef void(*url_session_cb)(net_request_t request, net_response_t response);
int net_download_async(url_t url, url_session_cb cb);
