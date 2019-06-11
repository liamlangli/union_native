#include "graphics.h"

i32 iclamp(i32 i, i32 b, i32 t)
{
  if (i > t) return t;
  if (i < b) return b;
  return i;
}

void color_clamp(color * c) {
	c->r = iclamp(c->r, 0, 255);
	c->g = iclamp(c->g, 0, 255);
	c->b = iclamp(c->b, 0, 255);
}

void color_new(color * c, int r, int g, int b) {
	c->r = r;
	c->g = g;
	c->b = b;
	color_clamp(c);
}

void color_add(color * c, color a, color b) {
	c->r = a.r + b.r;
	c->g = a.g + b.g;
	c->b = a.b + b.b;
	color_clamp(c);
}

void color_scale(color * out, color c, float factor) {
	out->r = c.r * factor;
	out->g = c.g * factor;
	out->b = c.b * factor;
	color_clamp(out);
}

void color_mix(color * out, color a, color b, float factor) {
	out->r = a.r * (1.0f - factor) + b.r * factor;
	out->g = a.g * (1.0f - factor) + b.g * factor;
	out->b = a.b * (1.0f - factor) + b.b * factor;
	color_clamp(out);
}

void color_print(color c) {
	printf("<color r:%d g:%d b:%d>\n", c.r, c.g, c.b);
}
