#include "graphics.h"

void light_new(light * l, vec pos, color c, float intensity, int type) {
    l->pos = pos;
    l->c = c;
    l->intensity = intensity;
    l->type = type;
}

void light_reduce(color * c, vec hit, vec reflect_dir, vec normal, surface s, light l) {

    vec hit_to_light;
    vec_sub(&hit_to_light, l.pos, hit);
    vec_normal(&hit_to_light);
    float distance = vec_distance(hit, l.pos);
    float sq_distance = distance * distance;

    float illum = vec_dot(hit_to_light, normal);
    color lcolor = {0, 0, 0};
    if(illum > 0 ) {
        color_scale(&lcolor, s.diffuse, illum * l.intensity / sq_distance * 100);
    }

    float specular = vec_dot(hit_to_light, reflect_dir);
    color scolor = {0, 0, 0};
    if(specular > 0) {
        color_scale(&scolor, s.specular,  powf(specular, s.roughness));
    }

    color c_combine = {0, 0, 0};
    color_add(&c_combine, lcolor, scolor);
    color_add(c, *c , c_combine);
}
