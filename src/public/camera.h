#ifndef _camera_
#define _camera_

#include "glm_ext.h"

typedef struct {
  vec3 position, target, up, lower, hori, vert, u, v, w;
  f64 fov, aspect, focus_dist, lens_radius;
} PointCamera;

PointCamera *camera_point_create(vec3 position, vec3 target, vec3 up, f64 fov, f64 aspect, f64 aperture, f64 focus_dist);
void camera_point_get_ray(Ray *ray, PointCamera *camera, f64 s, f64 t);

#endif