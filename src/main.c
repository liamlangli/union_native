#include <stdlib.h>
#include "graphics.h"
#include "global.h"
#include "io.h"

const int W = 512;
const int H = 512;

int main()
{

  size_t pixels_size = sizeof(u8) * W * H * 3;
  u8 pixels[H][W][3];
  memset(pixels, 255, pixels_size);

  // light init
  light lit;
  vec light_pos = {0, 60, 30};
  color light_color = {120, 120, 120};
  light_new(&lit, light_pos, light_color, 3000, 0);

  light lit1;
  vec light_pos1 = {0, 10, -40};
  color light_color1 = {60, 60, 60};
  light_new(&lit1, light_pos1, light_color1, 4000, 0);

  // camera init
  vec origin = {0, 0, -1.0};

  //surface init;
  color c_diffuse = {220, 220, 220};
  color c_specular = {100, 100, 100};
  color plane_diffuse = {20, 20, 20};
  color rosette_diffuse = {255, 0, 0};
  surface sf = {c_diffuse, c_specular, 4, 1.0, 1.0, 0.0, 0.0};
  surface sf2 = {c_diffuse, c_specular, 100, 1.0, 1.0, 0.1, 0.0};
  surface plane_sf = {plane_diffuse, c_specular, 100, 1.0, 2.0, 0.1, 0.0};
  surface rosette_sf = {rosette_diffuse, c_diffuse, 100, 0.0, 2.0, 0.0, 0.0};

  // obj init
  vec s_pos = {0.0, 0.0, 10};
  color c = {100, 100, 100};
  sphere s;
  sphere_new(&s, "s", s_pos, 2, sf);

  vec s1_pos = {2.0, 1.0, 10};
  sphere s1;
  sphere_new(&s1, "s1", s1_pos, 1.2, sf);

  vec s2_pos = {-2.0, 1.0, 10};
  sphere s2;
  sphere_new(&s2, "s2", s2_pos, 1.2, sf);

  vec p_pos = {0, -2, 0};
  vec p_n = {0, 1, 0};
  plane pl;
  plane_new(&pl, "demo plane", p_pos, p_n, plane_sf);

  triangle tri_left;
  vec lpa = {0, 1.8, 9}, lpb = {-1.4, 2.4, 10}, lpc = {-1.5, 1.6, 9};
  triangle_new(&tri_left, "rosette left", lpa, lpb, lpc, rosette_sf);

  triangle tri_right;
  vec rpa = {0, 1.8, 9}, rpb = {1.4, 2.4, 10}, rpc = {1.5, 1.6, 9};
  triangle_new(&tri_right, "rosette right ", rpa, rpc, rpb, rosette_sf);

  // clear color
  color clear_color = {12, 12, 12};

  scene scne;
  scene_new(&scne, "main");
  array_push_back(&scne.things, &tri_left);
  array_push_back(&scne.things, &tri_right);
  array_push_back(&scne.things, &s);
  array_push_back(&scne.things, &s1);
  array_push_back(&scne.things, &s2);
  array_push_back(&scne.lights, &lit);
  array_push_back(&scne.lights, &lit1);
  array_push_back(&scne.things, &pl);

  float ambient = 0.2f;

  // perspective viewing mode
  for (int y = 0; y < H; ++y)
  {
    for (int x = 0; x < W; ++x)
    {
      // TODO generate ray
      vec p, dir;
      vec_new(&p, (x - W / 2.0) / W, (H / 2.0 - y) / H, 0);
      vec_sub(&dir, p, origin);
      ray r;
      ray_new(&r, origin, dir);

      color cl_out = {0, 0, 0};
      ray_trace(&cl_out, r, scne, 4);

      pixels[y][x][0] = cl_out.r;
      pixels[y][x][1] = cl_out.g;
      pixels[y][x][2] = cl_out.b;
    }
  }

  image_save_webp("out.webp", (u8 *)pixels, W, H, pixels_size);
  scene_free(&scne);

  return 0;
}
