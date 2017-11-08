#include "common.h"

void error(const char * msg) {
    fprintf(stderr, "%s\n", msg);
    exit(1);
}

float max(float a, float b) {
    return a ? a > b : b;
}
