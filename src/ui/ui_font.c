#include "ui/ui_font.h"

void ui_font_init(ui_font *font, msdf_font *gpu_font, u32 font_size) {
    font->font = gpu_font;
    font->scale = (f32)font_size / (f32)gpu_font->size;
}