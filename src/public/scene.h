#ifndef _scene_
#define _scene_

#include "glm_ext.h"
#include "hit.h"
#include "container.h"

Hitable *hitable_plane_create(vec3 normal, f64 offset, Material *material);
Hitable *hitable_sphere_create(vec3 normal, f64 offset, Material *material);
void scene_traverse(rgb color, rgb attenuation, Array *scene, Ray *ray, Hit *hit, u32 depth);

#endif