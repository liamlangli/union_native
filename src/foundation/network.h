#pragma once

#include "foundation/ustring.h"
#include "foundation/global.h"

typedef struct url_t {
    u16 valid, port;
    ustring protocol;
    ustring host;
    ustring path;
    ustring query;
} url_t;

int url_is(ustring src);
url_t url_parse(ustring url);