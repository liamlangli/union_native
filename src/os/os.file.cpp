#include "os.h"

#include <sys/stat.h>

bool os_file_exists(std::string_view path) {
    struct stat path_stat;
    return !path.empty() && stat(std::string(path).c_str(), &path_stat) == 0;
}