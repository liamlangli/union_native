#include "gpu/gpu.h"
#include "foundation/global.h"
#include <assert.h>

int _round_up(int i, int align) { return (i + (align - 1)) & ~(align - 1); }

int gpu_pixel_format_size(gpu_pixel_format format) {
    switch (format) {
    case PIXELFORMAT_R8:
    case PIXELFORMAT_R8SN:
    case PIXELFORMAT_R8UI:
    case PIXELFORMAT_R8SI:
        return 1;
    case PIXELFORMAT_R16:
    case PIXELFORMAT_R16SN:
    case PIXELFORMAT_R16UI:
    case PIXELFORMAT_R16SI:
    case PIXELFORMAT_R16F:
    case PIXELFORMAT_RG8:
    case PIXELFORMAT_RG8SN:
    case PIXELFORMAT_RG8UI:
    case PIXELFORMAT_RG8SI:
        return 2;
    case PIXELFORMAT_R32UI:
    case PIXELFORMAT_R32SI:
    case PIXELFORMAT_R32F:
    case PIXELFORMAT_RG16:
    case PIXELFORMAT_RG16SN:
    case PIXELFORMAT_RG16UI:
    case PIXELFORMAT_RG16SI:
    case PIXELFORMAT_RG16F:
    case PIXELFORMAT_RGBA8:
    case PIXELFORMAT_SRGB8A8:
    case PIXELFORMAT_RGBA8SN:
    case PIXELFORMAT_RGBA8UI:
    case PIXELFORMAT_RGBA8SI:
    case PIXELFORMAT_BGRA8:
    case PIXELFORMAT_RGB10A2:
    case PIXELFORMAT_RG11B10F:
    case PIXELFORMAT_RGB9E5:
        return 4;
    case PIXELFORMAT_RG32UI:
    case PIXELFORMAT_RG32SI:
    case PIXELFORMAT_RG32F:
    case PIXELFORMAT_RGBA16:
    case PIXELFORMAT_RGBA16SN:
    case PIXELFORMAT_RGBA16UI:
    case PIXELFORMAT_RGBA16SI:
    case PIXELFORMAT_RGBA16F:
        return 8;
    case PIXELFORMAT_RGBA32UI:
    case PIXELFORMAT_RGBA32SI:
    case PIXELFORMAT_RGBA32F:
        return 16;
    case PIXELFORMAT_DEPTH:
    case PIXELFORMAT_DEPTH_STENCIL:
        return 4;
    default:
        assert(false);
        return 0;
    }
}

int gpu_pixel_format_row_pitch(gpu_pixel_format format, int width, int row_alignment) {
    int pitch;
    switch (format) {
    case PIXELFORMAT_BC1_RGBA:
    case PIXELFORMAT_BC4_R:
    case PIXELFORMAT_BC4_RSN:
    case PIXELFORMAT_ETC2_RGB8:
    case PIXELFORMAT_ETC2_SRGB8:
    case PIXELFORMAT_ETC2_RGB8A1:
        pitch = ((width + 3) / 4) * 8;
        pitch = pitch < 8 ? 8 : pitch;
        break;
    case PIXELFORMAT_BC2_RGBA:
    case PIXELFORMAT_BC3_RGBA:
    case PIXELFORMAT_BC3_SRGBA:
    case PIXELFORMAT_BC5_RG:
    case PIXELFORMAT_BC5_RGSN:
    case PIXELFORMAT_BC6H_RGBF:
    case PIXELFORMAT_BC6H_RGBUF:
    case PIXELFORMAT_BC7_RGBA:
    case PIXELFORMAT_BC7_SRGBA:
    case PIXELFORMAT_ETC2_RGBA8:
    case PIXELFORMAT_ETC2_SRGB8A8:
    case PIXELFORMAT_ETC2_RG11:
    case PIXELFORMAT_ETC2_RG11SN:
    case PIXELFORMAT_ASTC_4x4_RGBA:
    case PIXELFORMAT_ASTC_4x4_SRGBA:
        pitch = ((width + 3) / 4) * 16;
        pitch = pitch < 16 ? 16 : pitch;
        break;
    case PIXELFORMAT_PVRTC_RGB_4BPP:
    case PIXELFORMAT_PVRTC_RGBA_4BPP:
        pitch = (MACRO_MAX(width, 8) * 4 + 7) / 8;
        break;
    case PIXELFORMAT_PVRTC_RGB_2BPP:
    case PIXELFORMAT_PVRTC_RGBA_2BPP:
        pitch = (MACRO_MAX(width, 16) * 2 + 7) / 8;
        break;
    default:
        pitch = width * gpu_pixel_format_size(format);
        break;
    }
    pitch = _round_up(pitch, row_alignment);
    return pitch;
}

int gpu_pixel_format_surface_pitch(gpu_pixel_format format, int width, int height, int row_alignment) {
    return gpu_pixel_format_row_pitch(format, width, row_alignment) * height;
}

int gpu_pixel_format_row_count(gpu_pixel_format format, int height) {
    int count;
    switch (format) {
        case PIXELFORMAT_BC1_RGBA:
        case PIXELFORMAT_BC4_R:
        case PIXELFORMAT_BC4_RSN:
        case PIXELFORMAT_ETC2_RGB8:
        case PIXELFORMAT_ETC2_SRGB8:
        case PIXELFORMAT_ETC2_RGB8A1:
        case PIXELFORMAT_ETC2_RGBA8:
        case PIXELFORMAT_ETC2_SRGB8A8:
        case PIXELFORMAT_ETC2_RG11:
        case PIXELFORMAT_ETC2_RG11SN:
        case PIXELFORMAT_BC2_RGBA:
        case PIXELFORMAT_BC3_RGBA:
        case PIXELFORMAT_BC3_SRGBA:
        case PIXELFORMAT_BC5_RG:
        case PIXELFORMAT_BC5_RGSN:
        case PIXELFORMAT_BC6H_RGBF:
        case PIXELFORMAT_BC6H_RGBUF:
        case PIXELFORMAT_BC7_RGBA:
        case PIXELFORMAT_BC7_SRGBA:
        case PIXELFORMAT_ASTC_4x4_RGBA:
        case PIXELFORMAT_ASTC_4x4_SRGBA:
            count = ((height + 3) / 4);
            break;
        case PIXELFORMAT_PVRTC_RGB_4BPP:
        case PIXELFORMAT_PVRTC_RGBA_4BPP:
        case PIXELFORMAT_PVRTC_RGB_2BPP:
        case PIXELFORMAT_PVRTC_RGBA_2BPP:
            /* NOTE: this is most likely not correct because it ignores any
                PVCRTC block size, but multiplied with _sg_row_pitch()
                it gives the correct surface pitch.

                See: https://www.khronos.org/registry/OpenGL/extensions/IMG/IMG_texture_compression_pvrtc.txt
            */
            count = ((MACRO_MAX(height, 8) + 7) / 8) * 8;
            break;
        default:
            count = height;
            break;
    }
    if (count < 1) {
        count = 1;
    }
    return count;
}