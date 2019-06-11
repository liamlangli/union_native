#include "graphics.h"
#include "io.h"
#include "dtype.h"

void vec_barycoordinate_locate_case() {
    vec ax, ay, az, p;
    vec_new(&ax, 1, 0, 0);
    vec_new(&ay, 0, 1, 0);
    vec_new(&az, 0, 0, 1);
    vec_new(&p,  0, 0, 0);

    vec co;
    vec_barycoordinate_locate(&co, p, ax, ay, az);
    vec_print(co);
}

void array_case() {
    // vec s_v;
    // vec_new(&s_v, 0, 0, 0);
    // color s_c;
    // color_new(&s_c, 255, 255, 255);
    // sphere s;
    // sphere_new(&s, "demo sphere", s_v, 10, s_c);
    //
    // array arr;
    // array_new(&arr);
    // array_push_back(&arr, &s);
    // printf("%s\n", s.head.name);
    // array_print(arr);
    //
    // ThingHead * head = (ThingHead *)(arr.items[0]);
    //
    // fprintf(stdout, "item_name:%s  item_type:%d\n", head->name, head->type);
    // if (head->type == Type_Sphere) {
    //     sphere * s = (sphere *) (arr.items[0]);
    //     vec_print(s->pos);
    // }
    //
    // array_free(&arr);

}

void vec_reflect_case() {
    vec n   = { 0,  1, 0};
    vec in  = { 1, -1, 0};
    vec out;
    vec_reflect(&out, in, n);
    vec_print(out);
}

void plane_intersect_case() {
    color c = {255, 0, 0};
    surface s = {c, 1, 1, 1};
    vec pos = {0.0, -3.0, 0.0};
    vec normal = {0.0, 1.0, 0.0};
    plane p;
    plane_new(&p, "demo", pos, normal, s);

    vec rpos = {0,  0, 0};
    vec rdir = {0, -1, 0};
    ray r = {rpos, rdir};

    intersect isec = plane_intersect(&p, r);
    printf("%5.2f\n", isec.t);
}

void iclamp_case() {
    int out = iclamp(300, 0, 255);
    printf("output: %d\n", out);
}

void vec_transmission_case() {
    vec out;
    vec in = {1, 1, 0};
    vec_normal(&in);
    vec n = {0, 1, 0};
    float n_trans = 1.2;
    int res = vec_transmission(&out, in, n, n_trans);
    vec_print(out);

    printf("isTransimit: %s\n", res ? "true" : "false");
    printf("transimission equation: %5.2f\n", in.x * 1.2 - out.x);
}

void sphere_intersect_case() {
    vec pos = {0, 0, 2 - 0.0000001f};
    vec direction = {0, 0, -1};
    ray r = {pos, direction};
    surface plane_sf = {{0, 0, 0}, {0, 0, 0}, 50, 1.0, 1.0, 0.0, 0.0};
    sphere s = {{0, "demo", plane_sf}, {0, 0, 1}, 1.0f};
    intersect isec = sphere_intersect(&s, r);
    printf("%5.2f\n", isec.t);
}

void triangle_intersect_case() {
    vec pos = {1,  1, 1},
        dir = {0, -1, 0};
    ray r = {pos, dir};
    vec a = {0, 0, 0},
        b = {4, 0, 0},
        c = {0, 0, 4};
    triangle tri;
    surface sface = {{0, 0, 0}, {0, 0, 0}, 50, 1.0, 1.0, 0.0, 0.0};
    triangle_new( &tri, "demo triangle", a, b, c, sface);
    intersect isec = triangle_intersect( &tri, r);
    printf( "distance: %.2f\n", isec.t);
}

int main() {

    // vec_barycoordinate_locate_case();
    // array_case();
    // vec_reflect_case();
    // plane_intersect_case();
    // iclamp_case();
    // vec_transmission_case();
    // sphere_intersect_case();
    triangle_intersect_case();

    return 0;
}
