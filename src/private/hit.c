#include "hit.h"

f32 hit_sphere(Ray *ray, vec3 center, f32 radius)
{
  vec3 oc;
  glm_vec3_sub(oc, ray->origin, center);
  f32 a = glm_vec3_dot(ray->direction, ray->direction);
  f32 b = 2.0f * glm_vec3_dot(oc, ray->direction);
  f32 c = glm_vec3_dot(oc, oc) - radius * radius;
  f32 d = b * b - 4.0f * a * c;
  if (d < 0.0f)
  {
    return -1.0f;
  }
  else
  {
    return (-b - sqrtf(d)) / (2.0f * a);
  }
}

f32 hit_plane(Ray *ray, vec3 normal, f32 offset)
{
  return -(glm_vec3_dot(ray->origin, normal) + offset) / glm_vec3_dot(ray->direction, normal);
}