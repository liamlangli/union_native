#include "graphics.h"

void vec_new(vec * out, float x, float y, float z) {
	out->x = x;
	out->y = y;
	out->z = z;
}

void vec_add(vec * out, vec a, vec b) {
	out->x = a.x + b.x;
	out->y = a.y + b.y;
	out->z = a.z + b.z;
}

void vec_sub(vec * out, vec a, vec b) {
	out->x = a.x - b.x;
	out->y = a.y - b.y;
	out->z = a.z - b.z;
}

void vec_scale(vec * out, vec in, float factor) {
	out->x = in.x * factor;
	out->y = in.y * factor;
	out->z = in.z * factor;
}

void vec_mul(vec * out, vec a, vec b) {
	out->x = a.x * b.x;
	out->y = a.y * b.y;
	out->z = a.z * b.z;
}

float vec_dot(vec a, vec b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

void vec_cross(vec * out, vec a, vec b) {
	out->x = a.y * b.z - a.z * b.y;
    out->y = a.x * b.z - a.z * b.x;
    out->z = a.x * b.y - a.y * b.x;
}

float vec_mag(vec in) {
	return in.x * in.x + in.y * in.y + in.z * in.z;
}

void vec_normal(vec * out) {
	float mag = vec_mag(*out);
	vec_scale(out, *out, 1.0 / sqrt(mag));
}

float vec_distance(vec a, vec b) {
	vec s;
	vec_sub(&s, a, b);
	return sqrt(vec_mag(s));
}

void vec_reflect(vec * out, vec in, vec n) {
	vec_normal(&in);
	vec_normal(&n);

	float map = vec_dot(n, in);
	vec mapv;
	vec_scale(&mapv, n, map * 2.0f);
	vec_sub(out, in, mapv);

	vec_normal(out);
}

int vec_transmission(vec * out, vec in, vec normal, float n) {
	float inDn = vec_dot(in, normal);
	float factor = 1.0f / n;
	if (inDn > 0) {
		vec_scale(&normal, normal, -1);
		factor = n;
		inDn = vec_dot(in, normal);
	}

	float k = 1.0f - factor * factor * (1.0f - inDn * inDn);
	if (k < 0.0f) {
		return 0;
	}

	float a = factor * inDn + sqrtf(k);
	vec in_map, normal_map;
	vec_scale(&in_map, in, factor);
	vec_scale(&normal_map, normal, a);
	vec_sub(out, in_map, normal_map);
	vec_normal(out);
	return 1;
}

void vec_barycoordinate_locate(vec * out, vec p, vec a, vec b, vec c) {
	vec ab;
	vec_sub(&ab, b, a);
	vec ac;
	vec_sub(&ac, c, a);
	vec bc, ca;
	vec_sub(&bc, c, b);
	vec_scale(&ca, ac, -1);
	vec n;
	vec_cross(&n, ab, ac);

	vec ap, bp, cp;
	vec_sub(&ap, p, a);
	vec_sub(&bp, p, b);
	vec_sub(&cp, p, c);

	vec na, nb, nc;
	vec_cross(&na, bc, bp);
	vec_cross(&nb, ca, cp);
	vec_cross(&nc, ab, ap);

	float re_length_n_squa = 1 / vec_mag(n);

	float alpha, beta, gamma;

	alpha 	= vec_dot(na, n) * re_length_n_squa;
	beta 	= vec_dot(nb, n) * re_length_n_squa;
	gamma 	= vec_dot(nc, n) * re_length_n_squa;

	out->x = alpha;
	out->y = beta;
	out->z = gamma;
}

void vec_print(vec in) {
	fprintf(stdout, "<vec x:%.2f y:%.2f z:%.2f>\n", in.x, in.y, in.z);
}
