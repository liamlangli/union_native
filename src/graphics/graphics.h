#ifndef Graphics_H
#define Graphics_H

#include "../common/common.h"
#include "../dtype/dtype.h"

extern int 		iclamp(int  in, int b, int  t);
extern float 	fclamp(float  in, float b, float  t);

extern const float Pi;

typedef struct {
	float x, y, z;
} vec;

typedef struct {
	int r, g, b;
} color;

typedef struct {
	vec pos, dir;
} ray;

typedef struct {
	void * thing;
	ray r;
	float t;
} intersect;

typedef struct {
	color diffuse;
	color specular;
	float roughness;
	float refraction;
	float diffuse_factor;
	float reflect_factor;
	float refraction_factor;
} surface;

typedef struct {
	vec pos;
	color c;
	float intensity;
	int type;
} light;

typedef struct {
	int type;
	char name[123];
	surface sface;
} ThingHead;

typedef struct {
	ThingHead head;
	vec pos;
	float radius;
} sphere;

typedef struct {
	ThingHead head;
	vec pos;
	vec normal;
} plane;

typedef struct {
	char name[127];
	array things;
	array lights;
	color clear_color;
} scene;

extern void     	vec_new(vec * out, float x, float y, float z);
extern void     	vec_add(vec * out, vec a, vec b);
extern void     	vec_sub(vec * out, vec a, vec b);
extern void     	vec_scale(vec * out, vec in, float factor);
extern void     	vec_mul(vec * out, vec a, vec b);
extern float    	vec_dot(vec a, vec b);
extern void     	vec_cross(vec * out, vec a, vec b);
extern float    	vec_mag(vec in);
extern void     	vec_normal(vec * out);
extern float 		vec_distance(vec a, vec b);
extern void 		vec_reflect(vec * out, vec in, vec n);
extern int 			vec_transmission(vec * out, vec in, vec normal, float n);
extern void 		vec_barycoordinate_locate(vec * out, vec p, vec a, vec b, vec c);
extern void     	vec_print(vec in);

extern void 		color_clamp(color * c);
extern void 		color_new(color * c, int r, int g, int b);
extern void 		color_add(color * c, color a, color b);
extern void 		color_scale(color * out, color c, float factor);
extern void 		color_print(color c);

extern void 		ray_new(ray * r, vec pos, vec dir);

extern void 		sphere_new(sphere * s, const char * name, vec pos, float radius, surface sf);
extern void 		sphere_normal(vec * normal, sphere s, vec pos);
extern intersect	sphere_intersect(sphere * s, ray r);

extern void 		plane_new(plane * p, const char * name, vec pos, vec normal, surface sf);
extern void 		plane_normal(vec * out, plane p, vec pos);
extern intersect 	plane_intersect(plane * p, ray r);

extern void  		scene_new(scene * scne, const char * name);
extern intersect	scene_intersect(scene scne, ray r);
extern void 		scene_free(scene * scne);

extern int 			ray_test(vec hit, light l, scene scne);
extern void 		ray_trace(color * c, ray r, scene scne, int depth);

extern void 		surface_new(surface * s, color diffuse, color specular, float roughness, float refraction, float diffuse_factor, float reflect_factor, float refraction_factor);
extern void 		surface_shader(color *c, surface s, vec hit, vec normal, vec reflect_dir, scene scne);

extern void 		light_new(light * l, vec pos, color c, float intensity, int type);
extern void 		light_reduce(color * c, vec hit, vec reflect_dir, vec normal, surface s, light l);

extern void 		thing_normal(vec * normal, ThingHead * head, vec pos);
extern void 		thing_shader(color * c, intersect isec, scene scne, int depth);



#endif
