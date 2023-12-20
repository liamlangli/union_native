#include "foundation/network.h"
#include "foundation/global.h"
#include "foundation/ustring.h"
#include <stdlib.h>

url_t url_parse(ustring url) {
    url_t result = {0};
    const char *data = url.data;
    u32 length = url.length;
    u32 index = 0;
    u32 colon = 0;
    u32 port_colon = 0;
    u32 slash = 0;
    u32 question = 0;
    u32 terminate = 0;

protocol:
    for (index = 0; index < length; index++) {
        if (data[index] == ':') {
            if(index < length - 2 && data[index + 1] == '/' && data[index + 2] == '/') {
                colon = index;
                goto domain;
            } else {
                goto fail;
            }
        }
    }
    goto fail;

domain:
    for (index = colon + 3; index < length; index++) {
        if (data[index] == ':') {
            port_colon = index;
            goto port;
        } else if (data[index] == '/') {
            slash = index;
            goto path;
        } else if (data[index] == '?') {
            question = index;
            goto query;
        }
    }
    goto fail;

port:
    for (index = port_colon + 1; index < length; index++) {
        if (data[index] == '/') {
            slash = index;
            goto path;
        } else if (data[index] == '?') {
            question = index;
            goto query;
        }
    }
    goto fail;

path:
    for (index = slash + 1; index < length; index++) {
        if (data[index] == '?') {
            question = index;
            goto query;
        }
    }
    question = length;
    goto end;

query:
    for (index = question + 1; index < length; index++) {
        if (data[index] == '#') {
            terminate = index;
            goto end;
        }
    }
    terminate = length;
    goto end;

fail:
    return result;

end:
    result.valid = 1;
    result.protocol = ustring_range(data, data + colon);
    result.host = port_colon ? ustring_range(data + colon + 3, data + port_colon) : ustring_range(data + colon + 3, data + slash);
    result.port = port_colon ? atoi(data + port_colon + 1) : 80;
    result.path = ustring_range(data + slash + 1, data + question);
    result.query = ustring_range(data + question + 1, data + terminate);

    return result;
}