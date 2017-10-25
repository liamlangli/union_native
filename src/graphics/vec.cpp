#include "graphics.h"

extern void vec_new(vec * out, float x, float y, float z) {
	out->x = x;
	out->y = y;
	out->z = z;
}

extern void vec_add(vec * out, vec a, vec b) {
	out->x = a.x + b.x;
	out->y = a.y + b.y;
	out->z = a.z + b.z;
}

extern void vec_sub(vec * out, vec a, vec b) {
	out->x = a.x - b.x;
	out->y = a.y - b.y;
	out->z = a.z - b.z;
}

extern void vec_scale(vec * out, vec in, float factor) {
	out->x = in.x * factor;
	out->y = in.y * factor;
	out->z = in.z * factor;
}

extern void vec_mul(vec * out, vec a, vec b) {
	out->x = a.x * b.x;
	out->y = a.y * b.y;
	out->z = a.z * b.z;
}

extern float vec_dot(vec a, vec b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

extern void vec_cross(vec * out, vec a, vec b) {
	out->x = a.y * b.z - a.z * b.y;
    out->y = a.x * b.z - a.z * b.x;
    out->z = a.x * b.y - a.y * b.x;
}

extern float vec_mag(vec in) {
	return in.x * in.x + in.y * in.y + in.z * in.z;
}

extern void vec_normal(vec * out) {
	float mag = vec_mag(*out);
	vec_scale(out, *out, 1.0 / sqrt(mag));
}

extern void vec_print(vec in) {
	fprintf(stdout, "(%.2f, %.2f, %.2f)\n", in.x, in.y, in.z);
}
