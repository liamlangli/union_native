#pragma once

#include "public/global.h"

struct imageio_api {
    bool (*is_supported_format)(const char *extension);
};

extern struct imageio_api *imageio;
