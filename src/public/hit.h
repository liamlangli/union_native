#ifndef _hit_
#define _hit_

#include "global.h"
#include "glm_ext.h"

typedef struct Hit_t Hit;
typedef struct Hitable_t Hitable;
typedef void(*hit_func)(Ray *ray, struct Hitable_t *hitable, Hit *hit);
typedef struct Material_t Material;
typedef bool(*scatter_func)(rgb color, rgb attenuation, Ray *ray, Hit *hit);

typedef struct Material_t {
  rgb albedo;
  scatter_func scatter;
} Material;

typedef struct {
  Material super;
} MaterialDiffuse;

typedef struct {
  Material super;
  f64 roughness;
} MaterialMetal;

typedef struct {
  Material super;
  f64 roughness, ior, refractRoughness;
} MaterialDielectric;

typedef struct Hitable_t
{
  hit_func hit;
  struct Material_t *material;
} Hitable;

typedef struct
{
  Hitable super;
  vec3 normal;
  f64 offset;
} Plane;

typedef struct
{
  Hitable super;
  vec3 center;
  f64 radius;
} Sphere;

typedef struct Hit_t
{
  f64 t;
  vec3 p;
  vec3 N;
  Hitable *target;
} Hit;

extern f64 hit_sphere(Ray *ray, vec3 center, f64 radius);
extern f64 hit_plane(Ray *ray, vec3 normal, f64 offset);

extern Material *material_diffuse_create(rgb albedo);
extern Material *material_metal_create(rgb albedo, f64 roughness);
extern Material *material_dielectric_create(rgb albedo, f64 roughness, f64 ior, f64 refractRoughness);

#endif