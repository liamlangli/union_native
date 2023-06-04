#include "simd.h"
#include "array.inl"

int main() {
    Float3 a;

    Float3 *points = 0;
    array_ensure(points, 100, g_allocator);
    array_push(points, (Float3){.x = 100}, g_allocator);

    printf("%lu\n", array_size(points)); // prints "0"

    return 0;
}