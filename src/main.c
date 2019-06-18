#include <stdlib.h>
#include <string.h>

#include "glm_ext.h"
#include "global.h"
#include "io.h"
#include "hit.h"
#include "container.h"
#include "scene.h"

const i32 W = 512;
const i32 H = 512;
const i32 N_SAMPLES = 4;

vec3 v1;
vec3 v2;

vec3 one = {1.0f, 1.0f, 1.0f};
void rand_unit_sphere(vec3 dst)
{
  do {
    glm_vec3_set(dst, drand48(), drand48(), drand48());
    glm_vec3_mul_f(dst, dst, 2.0f);
    glm_vec3_sub(dst, dst, one);
  } while (glm_vec3_dot(dst, dst) >= 1.0f);
}

f32 randf()
{
  return (f32)(rand() % 1024)/ (f32)1024 - 0.5f; 
}

vec3 sky_u = {1.0f, 1.0f, 1.0f};
vec3 sky_d = {0.5f, 0.7f, 1.0f};
bool shader(rgb color, Hit *hit, f32 v)
{
  glm_vec3_set(color, 0.0, 0.0, 0.0);
  if (hit->t > 0.0f && hit->t < FLT_MAX)
  {
    glm_vec3_copy(color, hit->target->color);
    return true;
  }
  else
  {
    glm_vec3_lerp(color, sky_u, sky_d, v);
    return false;
  }
  return false;
}

int main()
{

  size_t pixels_size = sizeof(u8) * W * H * 3;
  u8 pixels[H][W][3];
  memset(pixels, 0, pixels_size);

  vec3 origin = {0.0f, 0.0f, 0.0f};
  vec3 lower_corner = {-1.0f, -1.0f, -1.0f};
  vec3 hori = {2.0f, 0.0f, 0.0f};
  vec3 vert = {0.0f, 2.0f, 0.0f};
  Ray ray;
  rgb color, reflect_color;

  vec3 center = {0.0f, 0.0f, -5.0f};
  vec3 normal = {0.0f, 1.0f, 0.0f};
  Array *scene = array_create();

  rgb ground_diffuse = {0.1f, 0.2f, 0.3f},
      sphere_diffuse = {0.3f, 0.2f, 0.1f};

  array_push(scene, hitable_sphere_create(center, 1.0f, sphere_diffuse));
  array_push(scene, hitable_plane_create(normal, 1.0f, ground_diffuse));

  Hit hit;

  vec3 unit;
  vec3 target;
  vec3 outColor;

  for (i32 j = 0; j < H; ++j)
  {
    for (i32 i = 0; i < W; ++i)
    {
      glm_vec3_set(outColor, 0.0f, 0.0f, 0.0f);
      for (i32 k = 0; k < N_SAMPLES; ++k)
      {
        f32 u = (f32)(i + drand48())/ (f32)W;
        f32 v = 1.0f - (f32)(j + drand48()) / (f32)H;
        glm_vec3_mul_f(v1, hori, u);
        glm_vec3_mul_f(v2, vert, v);
        glm_vec3_add(v2, v1, v2);
        glm_vec3_add(ray.direction, v2, lower_corner);
        glm_vec3_normalize(ray.direction);

        hit.t = FLT_MAX;
        scene_traverse(scene, &ray, &hit);
        glm_vec3_copy(ray.origin, origin);
        if (shader(color, &hit, v))
        {
          glm_vec3_add(outColor, outColor, color);
          rand_unit_sphere(unit);
          glm_vec3_add(unit, unit, hit.N);
          glm_vec3_add(unit, unit, hit.p);
          glm_vec3_sub(unit, unit, hit.p);
          glm_vec3_normalize(unit);
          glm_vec3_copy(ray.direction, unit);
          glm_vec3_copy(ray.origin, hit.p);
          scene_traverse(scene, &ray, &hit);
          // shader(reflect_color, &hit, v);
          // glm_vec3_mul_f(reflect_color, reflect_color, 0.5f);
          // glm_vec3_add(outColor, outColor, reflect_color);
        } else {
          // glm_vec3_add(outColor, outColor, color);
        }
      }
      glm_vec3_mul_f(outColor, outColor, 1.0f / (f32)N_SAMPLES);

      pixels[j][i][0] = (u8)(outColor[0] * 255.99f);
      pixels[j][i][1] = (u8)(outColor[1] * 255.99f);
      pixels[j][i][2] = (u8)(outColor[2] * 255.99f);
    }
  }

  image_save_webp("out.webp", (u8 *)pixels, W, H, pixels_size);

  return 0;
}
