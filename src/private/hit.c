#include "hit.h"

f64 hit_sphere(Ray *ray, vec3 center, f64 radius)
{
  vec3 oc;
  glm_vec3_sub(oc, ray->origin, center);
  f64 a = glm_vec3_dot(ray->direction, ray->direction);
  f64 b = 2.0 * glm_vec3_dot(oc, ray->direction);
  f64 c = glm_vec3_dot(oc, oc) - radius * radius;
  f64 d = b * b - 4.0 * a * c;
  if (d < 0.0)
  {
    return -1.0;
  }
  else
  {
    return (-b - sqrt(d)) / (2.0 * a);
  }
}

f64 hit_plane(Ray *ray, vec3 normal, f64 offset)
{
  return -(glm_vec3_dot(ray->origin, normal) + offset) / glm_vec3_dot(ray->direction, normal);
}