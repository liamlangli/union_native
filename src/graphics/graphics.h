#ifndef Graphics_H
#define Graphics_H

#include "../common/common.h"

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
extern void 	vec_reflect(vec * out, vec in, vec n);
extern void 	vec_barycoordinate_locate(vec * out, vec p, vec a, vec b, vec c);

typedef struct {
	int r, g, b;
} color;

extern void 	color_clamp(color * c);
extern void 	color_new(color * c, int r, int g, int b);
extern void 	color_scale(color * out, color c, float factor);

typedef struct {
	vec pos, dir;
} ray;

extern void 	ray_new(ray * r, vec pos, vec dir);

typedef enum {
	Sphere,
	Plane
} ThingType;

typedef struct {
	ThingType type;
	char name[123];
} ThingHead;

typedef struct {
	ThingHead head;
	vec pos;
	float radius;
	color c;
} sphere;

extern void 	sphere_new(sphere * s, const char * name, vec pos, float radius, color c);
extern void 	sphere_normal(vec * normal, sphere s, vec pos);
extern int 		sphere_intersect(float * t, sphere s, ray r);

typedef struct {
	ThingHead head;
	vec pos;
	vec normal;
	color c;
} plane;

extern void 	plane_new(plane * p, vec pos, vec normal, color c);
extern void 	plane_normal(vec * out, plane p);
extern void 	plane_intersect(float * t, plane, ray r);
#endif
