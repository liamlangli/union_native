#pragma once

#include "foundation/ustring.h"
#include "foundation/global.h"

typedef struct url_t {
    u16 valid, port;
    ustring_t protocol;
    ustring_t host;
    ustring_t path;
    ustring_t query;
} url_t;

int url_is(ustring_t src);
url_t url_parse(ustring_t url);