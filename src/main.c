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
const f64 FOV = 40.0;
const i32 N_SAMPLES = 64;

vec3 v1;
vec3 v2;
PointCamera *camera;

int main()
{
    size_t pixels_size = sizeof(u8) * W * H * 3;
    u8 pixels[H][W][3];
    memset(pixels, 0, pixels_size);

    vec3 center = {4, 5.0, 0};
    vec3 center_1 = {-4, 5.0, 0};
    vec3 center_2 = {0, 3, 0};
    vec3 normal = {0.0, 1.0, 0.0};
    Array *scene = array_create();

    rgb ground_diffuse = {0.5, 0.5, 0.54},
        sphere_diffuse = {0.92, 0.21, 0.24};

    u32 rand_scale = 20;
    for (u32 i = 0; i < rand_scale; ++i)
    {
        for (u32 j = 0; j < rand_scale; ++j)
        {
            vec3 c = {drand48() * 4.0 - 2.0, 0, drand48() * 4.0 - 2.0};
            vec3 d = {drand48(), drand48(), drand48()};
            glm_vec3_mul_f(c, c, 20);
            if (glm_vec3_length(c) < 0.14)
            {
                continue;
            }
            f64 m = drand48();
            if (m < 0.5)
            {
                array_push(scene, hitable_sphere_create(c, 1, material_diffuse_create(d)));
            }
            else if (m < 0.75)
            {
                array_push(scene, hitable_sphere_create(c, 1, material_metal_create(d, m - 0.75)));
            }
            else
            {
                array_push(scene, hitable_sphere_create(c, 1, material_dielectric_create(d, drand48(), 1.4, drand48())));
            }
        }
    }

    printf("scene generated");

    array_push(scene, hitable_sphere_create(center, 2.4, material_metal_create(sphere_diffuse, 0.1)));
    array_push(scene, hitable_sphere_create(center_1, 2.4, material_metal_create(sphere_diffuse, 0.1)));
    array_push(scene, hitable_sphere_create(center_2, 4, material_metal_create(sphere_diffuse, 0.1)));
    array_push(scene, hitable_plane_create(normal, 1.0, material_metal_create(ground_diffuse, 0.2)));

    Hit hit;
    Ray ray;
    rgb outColor;
    vec3 attenuation;

    vec3 camera_position = {0, 6, -36};
    vec3 camera_target = {0, 0, 0};
    vec3 camera_up = {0, 1, 0};
    f64 camera_aperture = 0.6;
    f64 focus_dist = glm_vec3_distance(camera_position, camera_target);
    camera = camera_point_create(camera_position, camera_target, camera_up, FOV, (f64)W / (f64)H, camera_aperture, focus_dist);

    for (i32 j = 0; j < H; ++j)
    {
        for (i32 i = 0; i < W; ++i)
        {
            glm_vec3_set(outColor, 0.0, 0.0, 0.0);
            for (i32 k = 0; k < N_SAMPLES; ++k)
            {
                glm_vec3_set(attenuation, 1.0, 1.0, 1.0);
                f64 u = (i + drand48()) / (f64)W;
                f64 v = 1.0 - (j + drand48()) / (f64)H;
                camera_point_get_ray(&ray, camera, u, v);
                scene_traverse(outColor, attenuation, scene, &ray, &hit, 0);
            }
            glm_vec3_mul_f(outColor, outColor, 1.0 / (f64)N_SAMPLES);

            pixels[j][i][0] = (u8)glm_min(sqrt(outColor[0]) * 255.99, 255);
            pixels[j][i][1] = (u8)glm_min(sqrt(outColor[1]) * 255.99, 255);
            pixels[j][i][2] = (u8)glm_min(sqrt(outColor[2]) * 255.99, 255);
        }
        fprintf(stdout, "progress %.2f\r", (f64)j / (f64)H);
    }

    image_save_webp("out.webp", (u8 *)pixels, W, H, pixels_size);

    return 0;
}
