#include <stdlib.h>
#include <string.h>

#include "glm_ext.h"
#include "global.h"
#include "io.h"
#include "hit.h"
#include "container.h"
#include "scene.h"
#include "sampler.h"
#include "camera.h"

const i32 W = 512;
const i32 H = 512;
const f64 FOV = 90.0;
const i32 N_SAMPLES = 4;

vec3 v1;
vec3 v2;
PointCamera *camera;

int main()
{
  size_t pixels_size = sizeof(u8) * W * H * 3;
  u8 pixels[H][W][3];
  memset(pixels, 0, pixels_size);

  vec3 center = {0.0, 0.0, -5.0};
  vec3 center_1 = {3.0, 0.0, -5.0};
  vec3 center_2 = {-1.0, 0.0, -3.0};
  vec3 normal = {0.0, 1.0, 0.0};
  Array *scene = array_create();

  rgb ground_diffuse = {0.2, 0.2, 0.2},
      sphere_diffuse = {0.3, 0.2, 0.1};

  array_push(scene, hitable_sphere_create(center, 1.0, material_diffuse_create(sphere_diffuse)));
  array_push(scene, hitable_sphere_create(center_1, 1.0, material_metal_create(sphere_diffuse, 0.1)));
  array_push(scene, hitable_sphere_create(center_2, 1.0, material_dielectric_create(sphere_diffuse, 0.0, 1.4, 0.0)));
  array_push(scene, hitable_plane_create(normal, 1.0, material_diffuse_create(ground_diffuse)));

  Hit hit;
  Ray ray;
  rgb outColor;
  vec3 attenuation;

  vec3 camera_position = {0.0, 0.0, -5.0};
  vec3 camera_target = {0.0, 0.0, 0.0};
  vec3 camera_up = {0.0, 1.0, 0.0};
  camera = camera_point_create(camera_position, camera_target, camera_up, FOV, (f64)W / (f64)H);

  for (i32 j = 0; j < H; ++j)
  {
    for (i32 i = 0; i < W; ++i)
    {
      glm_vec3_set(outColor, 0.0, 0.0, 0.0);
      glm_vec3_set(attenuation, 1.0, 1.0, 1.0);
      for (i32 k = 0; k < N_SAMPLES; ++k)
      {
        f64 u = (i + drand48())/ W;
        f64 v = 1.0 - (j + drand48()) / H;
        camera_point_get_ray(&ray, camera, v, u);
        scene_traverse(outColor, attenuation, scene, &ray, &hit, 0);
      }
      glm_vec3_mul_f(outColor, outColor, 1.0 / (f64)N_SAMPLES);

      pixels[j][i][0] = (u8)(sqrt(outColor[0]) * 255.99);
      pixels[j][i][1] = (u8)(sqrt(outColor[1]) * 255.99);
      pixels[j][i][2] = (u8)(sqrt(outColor[2]) * 255.99);
    }
  }

  image_save_webp("out.webp", (u8 *)pixels, W, H, pixels_size);

  return 0;
}
