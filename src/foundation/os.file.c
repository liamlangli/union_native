#include "os.h"

#include <uv.h>

extern bool os_file_exists(ustring path) {
    uv_fs_t req;
    int result = uv_fs_stat(NULL, &req, path.data, NULL);
    uv_fs_req_cleanup(&req);
    
    if (result == 0) {
        return true;
    } else {
        return false;;
    }
}