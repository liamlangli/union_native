#ifndef Graphics_H
#define Graphics_H

#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>

#define true 1
#define false 0

extern int 		iclamp(int  in, int b, int  t);
extern float 	fclamp(float  in, float b, float  t);

typedef struct {
	float x, y, z;
} vec;

extern void     vec_new(vec * out, float x, float y, float z);
extern void     vec_add(vec * out, vec a, vec b);
extern void     vec_sub(vec * out, vec a, vec b);
extern void     vec_scale(vec * out, vec in, float factor);
extern void     vec_mul(vec * out, vec a, vec b);
extern float    vec_dot(vec a, vec b);
extern void     vec_cross(vec * out, vec a, vec b);
extern float    vec_mag(vec in);
extern void     vec_normal(vec * out);
extern void     vec_print(vec in);

typedef struct {
	int r, g, b;
} color;

extern void color_clamp(color * c);
extern void color_new(color * c, int r, int g, int b);
extern void color_scale(color * out, color c, float factor);

typedef struct {
	vec pos, dir;
} ray;

extern void ray_new(ray * r, vec pos, vec dir);

typedef struct sphere {
	vec pos;
	float radius;
	color c;
} sphere;

extern void 	sphere_new(sphere * s, vec pos, float radius, color c);
extern void 	sphere_normal(vec * normal, sphere s, vec pos);
extern int 		sphere_intersect(sphere s, ray r, float * t);

#endif
