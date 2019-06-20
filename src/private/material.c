#include "hit.h"
#include <stdlib.h>
#include <math.h>
#include "sampler.h"

bool material_diffuse_scatter(rgb color, rgb attenuation, Ray *ray, Hit *hit)
{
  rgb albedo;
  vec3 unit;
  MaterialDiffuse *material;

  material = (MaterialDiffuse*)hit->target->material;

  sampler_uniform(unit);
  glm_vec3_add(unit, unit, hit->N);

  glm_vec3_copy(ray->direction, unit);
  glm_vec3_copy(ray->origin, hit->p);

  glm_vec3_mul(attenuation, material->super.albedo, attenuation);
  glm_vec3_mul_f(attenuation, attenuation, GLM_1_PI);
  glm_vec3_add(color, color, attenuation);
  return true;
}

bool material_metal_scatter(rgb color, rgb attenuation, Ray *ray, Hit *hit)
{
  vec3 unit;
  vec3 reflect;
  MaterialMetal *material;
  rgb albedo;

  material = (MaterialMetal*)hit->target->material;
  ray_reflect(reflect, ray->direction, hit->N);

  sampler_uniform(unit);
  glm_vec3_mul_f(unit, unit, material->roughness);
  glm_vec3_add(unit, unit, reflect);

  glm_vec3_copy(ray->direction, unit);
  glm_vec3_normalize(ray->direction);
  glm_vec3_copy(ray->origin, hit->p);

  glm_vec3_mul(attenuation, material->super.albedo, attenuation);
  glm_vec3_add(color, color, attenuation);
  return glm_vec3_dot(ray->direction, hit->N) > 0.0;
}

bool material_dielectric_scatter(rgb color, rgb attenuation, Ray *ray, Hit *hit)
{
  MaterialDielectric *material;
  vec3 unit, out_normal, out_direction;
  rgb albedo;
  f64 ior, roughness;

  material = (MaterialDielectric*)hit->target->material;
  if (glm_vec3_dot(ray->direction, hit->N) > 0.0)
  {
    glm_vec3_mul_f(out_normal, hit->N, -1.0);
    ior = material->ior;
  }
  else
  {
    glm_vec3_copy(out_normal, hit->N);
    ior = 1.0 / material->ior;
  }

  glm_vec3_copy(ray->origin, hit->p);

  if (ray_refract(out_direction, ray->direction, out_normal, ior))
  {
    roughness = material->refractRoughness;
  }
  else
  {
    ray_reflect(out_direction, ray->direction, hit->N);
    roughness = material->roughness;
    return false;
  }

  sampler_uniform(unit);
  glm_vec3_mul_f(unit, unit, roughness);
  glm_vec3_add(ray->direction, unit, out_direction);
  glm_vec3_normalize(ray->direction);

  glm_vec3_mul(albedo, material->super.albedo, attenuation);
  glm_vec3_mul_f(attenuation, attenuation, GLM_1_PI);
  glm_vec3_add(color, color, albedo);
  return true;
}

Material *material_diffuse_create(rgb albedo)
{
  MaterialDiffuse *material = (MaterialDiffuse*)malloc(sizeof(MaterialDiffuse));
  glm_vec3_copy(material->super.albedo, albedo);
  material->super.scatter = material_diffuse_scatter;
  return (Material*)material;
}
Material *material_metal_create(rgb albedo, f64 roughness)
{
  MaterialMetal *material = (MaterialMetal*)malloc(sizeof(MaterialMetal));
  glm_vec3_copy(material->super.albedo, albedo);
  material->roughness = roughness;
  material->super.scatter = material_metal_scatter;
  return (Material*)material;
}

Material *material_dielectric_create(rgb albedo, f64 roughness, f64 ior, f64 refractRoughness)
{
  MaterialDielectric *material = (MaterialDielectric*)malloc(sizeof(MaterialDielectric));
  glm_vec3_copy(material->super.albedo, albedo);
  material->super.scatter = material_dielectric_scatter;
  material->roughness = roughness;
  material->ior = ior;
  material->refractRoughness = refractRoughness;
  return (Material*)material;
}