#include "os.h"

#define SOKOL_TIME_IMPL
#include <sokol_time.h>

void os_time_init() {
    stm_setup();
}

long os_time() {
    return stm_now();
}