#pragma once

#include <stdio.h>
#include "foundation/network.h"
#include "foundation/ustring.h"

ustring_t io_read_file(ustring_t path);
ustring_t io_http_get(url_t url);