#include <stdio.h>

#if defined(OS_WINDOWS)

#include "foundation/os.h"

#include <assert.h>
#include <dirent.h>
#include <errno.h>
#include <fcntl.h>
#include <ftw.h>

#include <semaphore.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <sys/file.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <time.h>
#include <unistd.h>

#pragma region File

static file_o file_io_open_input(const char *path) {
    const int h = open(path, O_RDONLY);
    return (file_o){ .handle = h, .valid = h != -1 };
}

static file_o file_io_open_output(const char *path) {
    const int h = open(path, O_CREAT | O_RDWR | O_TRUNC, 0777);
    return (file_o){ .handle = h, .valid = h != -1 };
}

static file_o file_io_open_append(const char *path) {
    const int h = open(path, O_CREAT | O_RDWR, 0777);
    return (file_o){ .handle = h, .valid = h != -1 };
}

static void file_io_set_position(file_o file, u64 position) {
    if (!file.valid)
        return;
    lseek((i32)file.handle, (i64)position, SEEK_SET);
}

static u64 file_io_size(file_o file) {
    if (!file.valid)
        return 0;
    struct stat buf = { 0 };
    fstat((i32)file.handle, &buf);
    return (u64)buf.st_size;
}

static i64 file_io_read(file_o file, void *buffer, u64 size) {
    if (!file.valid)
        return -1;
    return (i64)read((i32)file.handle, buffer, size);
}

static bool file_io_write(file_o file, const void *buffer, u64 size) {
    if (!file.valid)
        return false;
    const i64 res = (i64)write((i32)file.handle, buffer, size) == (i64)size;
    assert((u64)res == size || res < 0);
    return res >= 0;
}

// static i64 file_io_read_at(file_o file, u64 offset, void *buffer, u64 size) {
//     if (!file.valid)
//         return -1;
//     return (i64)pread((i32)file.handle, buffer, size, offset);
// }

// static bool file_io_write_at(file_o file, u64 offset, const void *buffer, u64 size) {
//     if (!file.valid)
//         return false;
//     const i64 res = (i64)pwrite((i32)file.handle, buffer, size, offset) == (i64)size;
//     assert((u64)res == size || res < 0);
//     return res >= 0;
// }

// static void file_io_set_last_modified_time(file_o file, struct file_time_o time) {
//     if (!file.valid)
//         return;
//     struct timespec tv = { .tv_sec = time.opaque };
//     struct timespec times[2] = { tv, tv };
//     futimens((i32)file.handle, times);
// }

static void file_io_close(file_o file) {
    if (!file.valid)
        return;
    close((i32)file.handle);
}

static struct os_file_io_api file_io = {
    .open_input = file_io_open_input,
    .open_output = file_io_open_output,
    .open_append = file_io_open_append,
    .set_position = file_io_set_position,
    .size = file_io_size,
    .read = file_io_read,
    .write = file_io_write,
    // .read_at = file_io_read_at,
    // .write_at = file_io_write_at,
    // .set_last_modified_time = file_io_set_last_modified_time,
    .close = file_io_close,
};

#pragma endregion File

#pragma region File System

static file_stat_t file_system_stat(const char *path)
{
    struct stat s;
    if (stat(path, &s)) {
        file_stat_t res = { .exists = false };
        return res;
    }

    file_stat_t res = {
        .exists = S_ISREG(s.st_mode) || S_ISDIR(s.st_mode),
        .is_directory = S_ISDIR(s.st_mode),
        .last_modified_time.opaque = (uint64_t)s.st_mtime,
        .size = (uint64_t)s.st_size
    };
    return res;
}

static struct os_file_system_api file_system = {
    .stat = file_system_stat,
};

#pragma endregion

#pragma region API 

static struct os_api os = {
    .file_io = &file_io,
    .file_system = &file_system,
};

struct os_api *os_api = &os;

#pragma endregion

#endif // OS_WINDOWS
