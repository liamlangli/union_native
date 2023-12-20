#pragma once

#include <stdio.h>
#include "foundation/network.h"
#include "foundation/ustring.h"

ustring io_read_file(ustring path);
ustring io_http_get(url_t url);