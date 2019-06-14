#include <stdlib.h>
#include <string.h>

#include "glm_ext.h"
#include "global.h"
#include "io.h"
#include "hit.h"

const i32 W = 512;
const i32 H = 512;
const i32 N_SAMPLES = 4;

vec3 v1;
vec3 v2;

void rand_unit_sphere(vec3 dst)
{
  drand48();
}

f32 randf()
{
  return (f32)(rand() % 1024)/ (f32)1024 - 0.5f; 
}

void shader(rgb color, vec3 N)
{
  glm_vec3_mul_f(N, N, 0.5f);
  glm_vec3_add_f(color, N, 0.5f);
}

int main()
{

  size_t pixels_size = sizeof(u8) * W * H * 3;
  u8 pixels[H][W][3];
  memset(pixels, 0, pixels_size);

  vec3 lower_corner = {-1.0f, -1.0f, -1.0f};
  vec3 hori = {2.0f, 0.0f, 0.0f};
  vec3 vert = {0.0f, 2.0f, 0.0f};
  Ray ray;
  glm_vec3_set(ray.origin, 0.0f, 0.0f, 0.0f);
  rgb color;

  vec3 center = {0.0f, 0.0, -5.0f};
  f32 radius = 1.0f;
  vec3 p;

  vec3 sky_u = {1.0f, 1.0f, 1.0f};
  vec3 sky_d = {0.5f, 0.7f, 1.0f};

  for (i32 j = 0; j < H; ++j)
  {
    for (i32 i = 0; i < W; ++i)
    {
      f32 u = (f32)(i + drand48())/ (f32)W;
      f32 v = 1.0f - (f32)(j + drand48()) / (f32)H;
      glm_vec3_mul_f(v1, hori, u);
      glm_vec3_mul_f(v2, vert, v);
      glm_vec3_add(v2, v1, v2);
      glm_vec3_add(ray.direction, v2, lower_corner);
      glm_vec3_normalize(ray.direction);

      vec3 outColor = {0.0f, 0.0f, 0.0f};
      for (i32 k = 0; k < N_SAMPLES; ++k)
      {
        f32 t = hit_sphere(&ray, center, radius);
        if (t > 0.0f)
        {
          ray_extend(p, &ray, t);
          glm_vec3_sub(p, p, center);
          glm_vec3_normalize(p);
          shader(color, p);
        }
        else
        {
          glm_vec3_lerp(color, sky_u, sky_d, v);
        }
        glm_vec3_add(outColor, outColor, color);
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
