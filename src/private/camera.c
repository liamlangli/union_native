#include "camera.h"

PointCamera *camera_point_create(vec3 position, vec3 target, vec3 up, f64 fov, f64 aspect)
{
  vec3 u = {1.0, 0.0, 0.0};
  vec3 v = {0.0, 1.0, 0.0};

  PointCamera *camera = (PointCamera*)malloc(sizeof(PointCamera));
  glm_vec3_copy(camera->position, position);
  glm_vec3_copy(camera->target, target);
  glm_vec3_copy(camera->up, up);

  glm_mat4_identity(camera->view_matrix);
  glm_mat4_lookat(camera->view_matrix, position, target, up);

  f64 theta = fov * M_PI / 180.0;
  f64 half_width = tan(theta * 0.5);
  f64 half_height = aspect * half_height;

  glm_vec3_set(camera->lower, -half_width, -half_height, -1.0);
  glm_mat4_mulv(camera->lower, camera->view_matrix, camera->lower);

  glm_mat4_mulv(u, camera->view_matrix, u);
  glm_mat4_mulv(v, camera->view_matrix, v);

  glm_vec3_mul_f(camera->hori, u, half_width * 2.0);
  glm_vec3_mul_f(camera->vert, v, half_height * 2.0);

  return camera;
}

void camera_point_get_ray(Ray *ray, PointCamera *camera, f64 s, f64 t)
{
  vec3 u, v, o;
  glm_vec3_copy(ray->origin, camera->position);
  glm_vec3_mul_f(u, camera->hori, s);
  glm_vec3_mul_f(v, camera->vert, t);
  glm_vec3_add(o, u, v);
  glm_vec3_add(o, o, camera->lower);
  glm_vec3_sub(o, o, camera->position);
  glm_vec3_normalize_to(ray->direction, o);
}