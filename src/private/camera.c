#include "camera.h"
#include "sampler.h"

PointCamera *camera_point_create(vec3 position, vec3 target, vec3 up, f64 fov, f64 aspect, f64 aperture, f64 focus_dist)
{
  vec3 v1, v2;

  PointCamera *camera = (PointCamera*)malloc(sizeof(PointCamera));
  glm_vec3_copy(camera->position, position);
  glm_vec3_copy(camera->target, target);
  glm_vec3_copy(camera->up, up);
  camera->fov = fov;
  camera->aspect = aspect;
  camera->focus_dist = focus_dist;
  camera->lens_radius = aperture * 0.5;

  f64 theta = fov * GLM_PI / 180.0;
  f64 half_height = tan(theta * 0.5);
  f64 half_width = aspect * half_height;

  glm_vec3_sub(camera->w, position, target);
  glm_vec3_normalize(camera->w);

  glm_vec3_cross(camera->u, up, camera->w);
  glm_vec3_normalize(camera->u);

  glm_vec3_cross(camera->v, camera->w, camera->u);

  glm_vec3_mul_f(v1, camera->u, -half_width * focus_dist);
  glm_vec3_mul_f(v2, camera->v, -half_height * focus_dist);
  glm_vec3_add(v1, v1, v2);
  glm_vec3_add(v1, v1, position);
  glm_vec3_mul_f(v2, camera->w, focus_dist);
  glm_vec3_sub(camera->lower, v1, v2);

  glm_vec3_mul_f(camera->hori, camera->u, half_width * 2.0 * focus_dist);
  glm_vec3_mul_f(camera->vert, camera->v, half_height * 2.0 * focus_dist);

  return camera;
}

void camera_point_get_ray(Ray *ray, PointCamera *camera, f64 s, f64 t)
{
  vec3 o, rd, offset, v1, v2;
  sampler_uniform(rd);
  glm_vec3_mul_f(rd, rd, camera->lens_radius);
  glm_vec3_mul_f(v1, camera->u, rd[0]);
  glm_vec3_mul_f(v2, camera->v, rd[1]);
  glm_vec3_add(offset, v1, v2);

  glm_vec3_add(ray->origin, camera->position, offset);

  glm_vec3_mul_f(v1, camera->hori, s);
  glm_vec3_mul_f(v2, camera->vert, t);
  glm_vec3_add(o, v1, v2);
  glm_vec3_add(o, o, camera->lower);
  glm_vec3_sub(ray->direction, o, camera->position);
  glm_vec3_sub(ray->direction, ray->direction, offset);
  glm_vec3_normalize(ray->direction);
}