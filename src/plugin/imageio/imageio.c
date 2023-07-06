#include "plugin/imageio/imageio.h"

#include <stdio.h>

#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "plugin/imageio/stb_image.h"
#include "plugin/imageio/stb_image_write.h"

static bool imageio_is_supported_format(const char *extension) {
    if (strcasecmp(extension, "jpeg") ||
        strcasecmp(extension, "jpg") ||
        strcasecmp(extension, "tga") ||
        strcasecmp(extension, "bmp") ||
        strcasecmp(extension, "hdr") ||
        strcasecmp(extension, "gif") ||

        strcasecmp(extension, "basis") ||

        strcasecmp(extension, "psd") ||
        strcasecmp(extension, "pic") ||
        strcasecmp(extension, "pnm") ||
        strcasecmp(extension, "pgm") ||
        strcasecmp(extension, "ppm") ) return true;
    return false;
}

static struct imageio_api _imageio = {
    .is_supported_format = &imageio_is_supported_format
};

struct imageio_api *imageio = &_imageio;
