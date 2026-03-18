#include "os.h"

#include <sys/stat.h>

extern bool os_file_exists(ustring path) {
    struct stat path_stat;
    return path.data != NULL && stat(path.data, &path_stat) == 0;
}