#include "../graphics/graphics.h"
#include "../io/io.h"
#include "../dtype/dtype.h"
#include "../common/common.h"

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
    vec s_v;
    vec_new(&s_v, 0, 0, 0);
    color s_c;
    color_new(&s_c, 255, 255, 255);
    sphere s;
    sphere_new(&s, "demo sphere", s_v, 10, s_c);

    array arr;
    array_new(&arr);
    array_push_back(&arr, &s);
    printf("%s\n", s.head.name);
    array_print(arr);

    ThingHead * head = (ThingHead *)(arr.items[0]);

    fprintf(stdout, "item_name:%s  item_type:%d\n", head->name, head->type);
    if (head->type == Type_Sphere) {
        sphere * s = (sphere *) (arr.items[0]);
        vec_print(s->pos);
    }

    array_free(&arr);

}

void vec_reflect_case() {
    vec n   = {0,  1,  0};
    vec in  = {1, -2,  0};
    vec out;
    vec_reflect(&out, in, n);
    vec_print(out);
}

int main() {

    // vec_barycoordinate_locate_case();
    // array_case();
    vec_reflect_case();

    return 0;
}
