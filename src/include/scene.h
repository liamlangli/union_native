#ifndef _scene_
#define _scene_

#include "glm_ext.h"
#include "hit.h"
#include "container.h"

typedef void(*hit_func)(Ray *ray, void *hitable, Hit *hit);

typedef struct
{
  hit_func hit;
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

Hitable *hitable_plane_create(vec3 normal, f32 offset);
Hitable *hitable_sphere_create(vec3 normal, f32 offset);
void scene_traverse(Array *scene, Ray *ray, Hit *hit);

#endif