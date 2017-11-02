#include "graphics.h"

extern void sphere_new(sphere * s, const char * name, vec pos, float radius, color c) {
	s->head.type = Type_Sphere;
	sprintf(s->head.name, "%s", name);
	s->pos = pos;
	s->radius = radius;
	s->c = c;
}

extern void sphere_normal(vec * normal, sphere s, vec pos) {
	vec_sub(normal, pos, s.pos);
	vec_normal(normal);
}

// assume ray = pos + t * dir
extern intersect sphere_intersect(sphere * s, ray r) {
	vec os;
	intersect oisec;
	vec_sub(&os, s->pos, r.pos);				// vec origin to sphere
	float om = vec_dot(os, r.dir);
	float dq = vec_dot(os, os) - om * om;   // distance quad
	float d = sqrt(dq);
	float radius = s->radius;
	if (d > radius) {
		oisec.t = FLT_MAX;
		return oisec;
	}

	float c = sqrt(radius * radius - d * d);
	float t0 = om - c;
	float t1 = om + c;
 	oisec.t = t0 < t1 ? t0 : t1;
	oisec.r = r;
	oisec.thing = s;
	return oisec;
}

extern void plane_new(plane * p, vec pos, vec normal, color c) {

}

extern void plane_normal(vec * out, plane p) {

}

extern intersect plane_intersect(plane * p, ray r) {
	intersect i;
	i.t = FLT_MAX;
	return i;
}
