#include "graphics.h"

extern void light_new(light * l, vec pos, color c, float intensity, int type) {
    l->pos = pos;
    l->c = c;
    l->intensity = intensity;
    l->type = type;
}

extern void light_reduce(color * c, vec in, vec pos, vec normal, surface s, light l) {
    vec pl;
    vec_sub(&pl, l.pos, pos);
    vec_normal(&pl);

    float illum = vec_dot(pl, normal);
    color lcolor = {0, 0, 0};
    if(illum > 0 ) {
        color_scale(&lcolor, l.c, illum * l.intensity / 20);
    }

    vec rd;
    vec_reflect(&rd, in, normal);
    float specular = vec_dot(pl, rd);
    color scolor = {0, 0, 0};
    if(specular > 0) {
        color_scale(&scolor, s.specular,  powf(specular, s.roughness));
    }

    color c_combine = {0, 0, 0};
    color_add(&c_combine, lcolor, scolor);
    color_add(c, *c , c_combine);
}
