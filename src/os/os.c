#include "os.h"

#include <unistd.h>

void os_setup(int argc, char **argv) {

}

void os_terminate() {
}

static i8 shared_buffer[512];
ustring os_cwd() {
    getcwd(shared_buffer, 512);
    return (ustring){ .data = shared_buffer, .length = (u32)strlen(shared_buffer) };
}
