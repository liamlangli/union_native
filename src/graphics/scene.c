#include "graphics.h"

extern void scene_new(scene * scn, const char * name) {
    strcpy(scn->name, name);
    array_new(&scn->things);
    array_new(&scn->lights);
}

extern intersect scene_intersect(scene scn, ray r) {
    intersect oisec;
    oisec.t = FLT_MAX;
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
        
        if (isec.t < oisec.t) {
            oisec = isec;
        }
    }

    return oisec;
}
