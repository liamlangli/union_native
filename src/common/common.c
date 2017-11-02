#include "common.h"

void error(const char * msg) {
    fprintf(stderr, "%s\n", msg);
    exit(1);
}

extern const int Type_Sphere = 0;
extern const int Type_Plane = 1;
