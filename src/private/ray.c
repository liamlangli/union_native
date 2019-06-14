#include "glm_ext.h"

void ray_extend(vec3 dst, Ray *ray, f32 t)
{
  glm_vec3_mul_f(dst, ray->direction, t);
  glm_vec3_add(dst, dst, ray->origin);
}