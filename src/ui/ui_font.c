#include "ui/ui_font.h"

void ui_font_init(ui_font *font, msdf_font *gpu_font, u32 font_size) {
    font->font = gpu_font;
    font->scale = (f32)font_size / (f32)gpu_font->size;
}

float2 ui_font_compute_size_and_offset(ui_font *font, ustring text, f32* offsets) {
    float2 size = msdf_font_compute_size_and_offset(font->font, text, offsets);
    f32 font_scale = font->scale;
    size = float2_mul_f32(size, font_scale);
    for (int i = 0, l = text.length; i < l; ++i) {
        offsets[i] *= font_scale;
    }
    return size;
}

static ui_font _system_font;
ui_font* ui_font_system_font() {
    static bool system_font_initialized = false;
    if (system_font_initialized) return &_system_font;
    ui_font_init(&_system_font, msdf_font_system_font(), 16);
    system_font_initialized = true;
    return &_system_font;
}