#pragma once

#include "foundation/types.h"
#include "foundation/simd.h"

struct autorelease_allocator_i;

enum {
    COLOR_SPACE_SETTINGS_COLOR_PRIMARY,
    COLOR_SPACE_SETTINGS_TRANSFER_FUNCTION,
    COLOR_SPACE_SETTINGS_COLOR_MODEL,
    COLOR_SPACE_SETTINGS_COLOR_DEPTH,
    COLOR_SPACE_SETTINGS_AUTO_TRANSFER
};

typedef enum color_space_primary {
    COLOR_SPACE_PRIMARY_UNKNOWN,
    COLOR_SPACE_PRIMARY_BT709,
    COLOR_SPACE_PRIMARY_BT2020,
    COLOR_SPACE_PRIMARY_PAL,
    COLOR_SPACE_PRIMARY_ACES,
    COLOR_SPACE_PRIMARY_ACESCC,
    COLOR_SPACE_PRIMARY_P3,
    COLOR_SPACE_PRIMARY_ADOBE_RGB
} color_space_primary;

typedef enum color_space_transfer_func {
    COLOR_SPACE_TRANSFER_FUNCTION_UNKNOWN,
    COLOR_SPACE_TRANSFER_FUNCTION_LINEAR,
    COLOR_SPACE_TRANSFER_FUNCTION_SRGB,
    COLOR_SPACE_TRANSFER_FUNCTION_SLOG,
    COLOR_SPACE_TRANSFER_FUNCTION_BT1886,
    COLOR_SPACE_TRANSFER_FUNCTION_HLG,
    COLOR_SPACE_TRANSFER_FUNCTION_PQ,
    COLOR_SPACE_TRANSFER_FUNCTION_DCI_P3,
    COLOR_SPACE_TRANSFER_FUNCTION_PAL,
    COLOR_SPACE_TRANSFER_FUNCTION_ST240,
    COLOR_SPACE_TRANSFER_FUNCTION_ACESCC,
    COLOR_SPACE_TRANSFER_FUNCTION_ACES_RGB,
} color_space_transfer_func;

typedef enum color_space_color_model {
    COLOR_SPACE_COLOR_MODEL_UNKNOWN,
    COLOR_SPACE_COLOR_MODEL_RGB,
    COLOR_SPACE_COLOR_MODEL_YCBCR,
    COLOR_SPACE_COLOR_MODEL_HSV,
    COLOR_SPACE_COLOR_MODEL_HSL,
    COLOR_SPACE_COLOR_MODEL_CMYK
} color_space_color_model;

typedef struct color_space_desc_t {
    color_space_primary primary;
    color_space_transfer_func transfer_func;
    color_space_color_model color_model;
    u8 color_depth;
    bool auto_transfer_func;
    MACRO_PAD(2);
} color_space_desc_t;

struct color_space_api {
    bool (*color_space_equal)(const color_space_desc_t *a, const color_space_desc_t *b);
    const char *(*human_readable)(const color_space_desc_t *color_space, struct autorelease_allocator_i *allocator);
    void (*color_space_to_cie_xyz)(f32 xr, f32 yr, f32 xg, f32 tg, f32 xb, f32 yb, f32 xw, f32 yw, float4x4_t *res);
};

extern struct color_space_api *color_space_api;
