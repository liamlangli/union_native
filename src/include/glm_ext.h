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

void ray_extend(vec3 dst, Ray *ray, f32 t);

#endif