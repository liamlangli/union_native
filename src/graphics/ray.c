#include "graphics.h"

extern void ray_new(ray * r, vec pos, vec dir) {
	r->pos = pos;
	vec_normal(&dir);
	r->dir = dir;
}

extern int ray_test(vec hit, light l, scene scne) {
	vec dir_hit_light;
	vec_sub(&dir_hit_light, l.pos, hit);
	vec_normal(&dir_hit_light);

	ray hit_to_light;
	ray_new(&hit_to_light, hit, dir_hit_light);

	intersect isec = scene_intersect(scne, hit_to_light);

	if (isec.t > 0 && isec.t < FLT_MAX) {
		return true;
	}

	return false;
}
