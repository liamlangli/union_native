#include "graphics.h"

void scene_new(scene * scne, const char * name) {
    strcpy(scne->name, name);
    array_new(&scne->things);
    array_new(&scne->lights);
}

intersect scene_intersect(scene scn, ray r) {
    intersect oisec;
    oisec.t = FLT_MAX;
    oisec.r = r;
    oisec.thing = NULL;
    for(int i = 0, il = scn.things.nItems; i < il; ++i) {
        ThingHead * head = (ThingHead *)scn.things.items[i];
        intersect isec;
        if (head->type == Type_Sphere) {
            sphere * s = (sphere *)scn.things.items[i];
            isec = sphere_intersect(s, r);
        } else if (head->type == Type_Plane) {
            plane * p = (plane *)scn.things.items[i];
            isec = plane_intersect(p, r);
        }

        if (isec.t < oisec.t &&  isec.t > 0) {
            oisec = isec;
        }
    }

    return oisec;
}

void scene_free(scene * scne) {
    array_free(&scne->things);
    array_free(&scne->lights);
}
