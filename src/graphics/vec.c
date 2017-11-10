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

void vec_transmission(vec * out, vec in, vec normal, float n_in, float n_trans) {
	// t = n_in * ( v_in + normal * cos(theta) ) / n_trans  - normal * cos(theta);

	float n_factor = n_in / n_trans;
	float in_n_map = vec_dot(in, normal);

	vec n_scale;
	vec_scale(&n_scale, normal, in_n_map);
	vec left;
	vec_sub(&left, in, n_scale);
	vec_scale(&left, left, n_factor);

	vec right;
	vec_scale(&right, normal, sqrtf( 1 - powf(n_factor, 2) * (1 - powf(in_n_map, 2)) ) );

	vec_sub(out, left, right);
	vec_normal(out);
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
