#include "sampler.h"

vec3 one = {1.0, 1.0, 1.0};
void sampler_uniform(vec3 dst)
{
  do {
    glm_vec3_set(dst, drand48(), drand48(), drand48());
    glm_vec3_mul_f(dst, dst, 2.0);
    glm_vec3_sub(dst, dst, one);
  } while (glm_vec3_dot(dst, dst) >= 1.0);
  glm_vec3_normalize(dst);
}
