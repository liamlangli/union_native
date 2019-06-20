#include "scene.h"

#include <stdlib.h>

const f64 epsilon = 0.000001;

void sphere_hit_func(Ray *ray, Hitable *hitable, Hit *hit)
{
  Sphere *s = (Sphere*)hitable; 
  f64 t = hit_sphere(ray, s->center, s->radius);
  if (t > epsilon && t < hit->t)
  {
    hit->t = t;
    hit->target = (Hitable*)hitable;
    ray_extend(hit->p, ray->origin, ray->direction, t);
    glm_vec3_copy(hit->N, hit->p);
    glm_vec3_sub(hit->N, hit->N, s->center);
    glm_vec3_normalize(hit->N);
  }
}

void plane_hit_func(Ray *ray, Hitable *hitable, Hit *hit)
{
  Plane *p = (Plane*)hitable;
  f64 t = hit_plane(ray, p->normal, p->offset);
  if (t > epsilon && t < hit->t)
  {
    hit->t = t;
    hit->target = (Hitable*)hitable;
    ray_extend(hit->p, ray->origin, ray->direction, t);
    glm_vec3_copy(hit->N, p->normal);
  }
}

Hitable *hitable_plane_create(vec3 normal, f64 offset, Material *material)
{
  Plane *plane = (Plane*)malloc(sizeof(Plane));
  glm_vec3_copy(plane->normal, normal);
  plane->offset = offset;
  plane->super.hit = plane_hit_func;
  plane->super.material = material;
  return (Hitable *)plane;
}

Hitable *hitable_sphere_create(vec3 center, f64 radius, Material *material)
{
  Sphere *sphere = (Sphere*)malloc(sizeof(Sphere));
  glm_vec3_copy(sphere->center, center);
  sphere->radius = radius;
  sphere->super.hit = sphere_hit_func;
  sphere->super.material = material;
  return (Hitable*)sphere;
}

vec3 sky_u = {1.0, 1.0, 1.0};
vec3 sky_d = {0.5, 0.7, 1.0};
const u32 MAX_DEPTH = 9;
void scene_traverse(rgb outColor, rgb attenuation, Array *scene, Ray *ray, Hit *hit, u32 depth)
{
  if (depth > MAX_DEPTH)
  {
    return;
  }

  rgb color = {0.0, 0.0, 0.0};
  hit->t = DBL_MAX;
  Hitable *hitable;
  for (i32 i = 0; i < scene->size; ++i)
  {
    array_get(scene, i, (void**)&hitable);
    hitable->hit(ray, hitable, hit);
  }

  if (hit->t > epsilon && hit->t < 100.0 && hit->target->material->scatter(color, attenuation, ray, hit))
  { 
    glm_vec3_add(outColor, outColor, color);
    scene_traverse(outColor, attenuation, scene, ray, hit, depth + 1);
  }
  else
  {
    if (depth == 0) {
      glm_vec3_lerp(color, sky_d, sky_u, ray->direction[1]);
      glm_vec3_mul(color, color, attenuation);
      glm_vec3_add(outColor, outColor, color);
    }
  }
}
