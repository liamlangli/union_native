#include "graphics.h"

extern void light_new(light * l, vec pos, color c, float intensity, int type) {
    l->pos = pos;
    l->c = c;
    l->intensity = intensity;
    l->type = type;
}

extern void light_reduce(color * c, vec hit_to_light, vec reflect_dir, vec normal, surface s, light l) {

    float illum = vec_dot(hit_to_light, normal);
    color lcolor = {0, 0, 0};
    if(illum > 0 ) {
        color_scale(&lcolor, l.c, illum * l.intensity / 20);
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
