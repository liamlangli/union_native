#include "scene.h"

#include <stdlib.h>

void sphere_hit_func(Ray *ray, void *hitable, Hit *hit)
{
  Sphere *s = (Sphere*)hitable; 
  f32 t = hit_sphere(ray, s->center, s->radius);
  if (t > 0.0f && t < hit->t)
  {
    hit->t = t;
    ray_extend(hit->p, ray, t);
    glm_vec3_copy(hit->N, hit->p);
    glm_vec3_sub(hit->N, hit->N, s->center);
    glm_vec3_normalize(hit->N);
  }
}

void plane_hit_func(Ray *ray, void *hitable, Hit *hit)
{
  Plane *p = (Plane*)hitable;
  f32 t = hit_plane(ray, p->normal, p->offset);
  if (t > 0.0f && t < hit->t)
  {
    hit->t = t;
    ray_extend(hit->p, ray, t);
    glm_vec3_copy(hit->N, p->normal);
  }
}

Hitable *hitable_plane_create(vec3 normal, f32 offset)
{
  Plane *plane = (Plane*)malloc(sizeof(Plane));
  glm_vec3_copy(plane->normal, normal);
  plane->offset = offset;
  plane->super.hit = plane_hit_func;
  return (Hitable *)plane;
}

Hitable *hitable_sphere_create(vec3 center, f32 radius)
{
  Sphere *sphere = (Sphere*)malloc(sizeof(Sphere));
  glm_vec3_copy(sphere->center, center);
  sphere->radius = radius;
  sphere->super.hit = sphere_hit_func; 
  return (Hitable*)sphere;
}


void scene_traverse(Array *scene, Ray *ray, Hit *hit)
{
  Hitable *hitable;
  for (i32 i = 0; i < scene->size; ++i)
  {
    array_get(scene, i, (void**)&hitable);
    hitable->hit(ray, hitable, hit);
  }
}
