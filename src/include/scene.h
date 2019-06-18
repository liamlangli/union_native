#ifndef _scene_
#define _scene_

#include "glm_ext.h"
#include "hit.h"
#include "container.h"

Hitable *hitable_plane_create(vec3 normal, f32 offset, vec3 diffuse);
Hitable *hitable_sphere_create(vec3 normal, f32 offset, vec3 diffuse);
void scene_traverse(Array *scene, Ray *ray, Hit *hit);

#endif