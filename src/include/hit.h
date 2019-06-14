#ifndef _hit_
#define _hit_

#include "global.h"
#include "glm_ext.h"

f32 hit_sphere(Ray *ray, vec3 center, f32 radius);

f32 hit_plane(Ray *ray, vec3 normal, f32 offset);

#endif