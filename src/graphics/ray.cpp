#include "graphics.h"

extern void ray_new(ray * r, vec pos, vec dir) {
	r->pos = pos;
	vec_normal(&dir);
	r->dir = dir;
}
