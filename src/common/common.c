#include "common.h"

void error(const char * msg) {
    fprintf(stderr, "%s\n", msg);
    exit(1);
}
