#include "glm_ext.h"

void ray_extend(vec3 dst, vec3 origin, vec3 direction, f64 t)
{
  glm_vec3_mul_f(dst, direction, t);
  glm_vec3_add(dst, dst, origin);
}

void ray_reflect(vec3 dst, vec3 direction, vec3 N)
{
  f32 dot_v_n = glm_vec3_dot(direction, N);
  glm_vec3_mul_f(dst, N, 2.0 * dot_v_n);
  glm_vec3_sub(dst, direction, dst);
  glm_vec3_normalize(dst);
}

bool ray_refract(vec3 dst, vec3 direction, vec3 N, f64 ior)
{
  vec3 v;

  f64 dt = glm_vec3_dot(direction, N);
  f64 discriminant = 1.0 - ior * ior * (1.0 - dt * dt);
  if (discriminant > 0.0)
  {
    glm_vec3_mul_f(dst, N, dt);
    glm_vec3_sub(dst, direction, dst);
    glm_vec3_mul_f(dst, dst, ior);
    glm_vec3_mul_f(v, N, sqrt(discriminant));
    glm_vec3_sub(dst, dst, v);
    glm_vec3_normalize(dst);
    return true;
  }
  return false;
}