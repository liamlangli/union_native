#include "graphics.h"

extern void color_clamp(color * c) {
	c->r = clamp<int>(c->r, 0, 255);
	c->g = clamp<int>(c->g, 0, 255);
	c->b = clamp<int>(c->b, 0, 255);
}

extern void color_new(color * c, int r, int g, int b) {
	c->r = r;
	c->g = g;
	c->b = b;
	color_clamp(c);
}

extern void color_scale(color * out, color c, float factor) {
	out->r = c.r * factor;
	out->g = c.g * factor;
	out->b = c.b * factor;
	color_clamp(out);
}
