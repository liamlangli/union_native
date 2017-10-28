#include "../graphics/graphics.h"
#include "../io/io.h"
#include "../dtype/dtype.h"

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

    array * arr = array_new();
    array_print(*arr);

}

int main() {

    array_case();

    return 0;
}
