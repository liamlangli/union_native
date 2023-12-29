#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"

typedef struct url_t {
    bool valid;
    ustring_view url;
    ustring_view protocol;
    ustring_view host;
    ustring_view port;
    ustring_view path;
    ustring_view query;
} url_t;

url_t url_parse(ustring_view url);
void url_dump(url_t url);

typedef void(*url_download_cb)(url_t url, ustring data);
int net_download_async(url_t uri, url_download_cb cb);