#ifndef _glm_ext_
#define _glm_ext_

#include "glm.h"

typedef struct
{
  vec3 origin;
  vec3 direction;
} Ray;

typedef vec4 rgba;
typedef vec3 rgb;

extern void ray_extend(vec3 dst, vec3 origin, vec3 direction, f64 t);
extern void ray_reflect(vec3 dst, vec3 direction, vec3 N);
extern bool ray_refract(vec3 dst, vec3 direction, vec3 N, f64 ior);

#endif