#ifndef _hit_
#define _hit_

#include "global.h"
#include "glm_ext.h"

typedef struct Hit_t Hit;
typedef void(*hit_func)(Ray *ray, void *hitable, Hit *hit);

typedef struct
{
  hit_func hit;
  vec3 color;
} Hitable;

typedef struct
{
  Hitable super;
  vec3 normal;
  f32 offset;
} Plane;

typedef struct
{
  Hitable super;
  vec3 center;
  f32 radius;
} Sphere;

typedef struct Hit_t
{
  f32 t;
  vec3 p;
  vec3 N;
  Hitable *target;
} Hit;

f32 hit_sphere(Ray *ray, vec3 center, f32 radius);
f32 hit_plane(Ray *ray, vec3 normal, f32 offset);

#endif