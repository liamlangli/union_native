#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"
#include "foundation/format.h"

#include <stb_ds.h>

enum LOG_TYPE {
    LOG_INFO,
    LOG_WARN,
    LOG_ERROR
};

#define LOG_DEFAULT_MAX_LINES 1024

typedef struct log_line_t {
    ustring line;
    int type;
    f64 time;
} log_line_t;

typedef struct logger_config_t {
    bool std_out, write_to_file;
    ustring file_path;
    u32 max_lines;
} logger_config_t;

typedef struct logger_t {
    logger_config_t config;
    log_line_t *lines;
    u32 new_line_count;
} logger_t;

void logger_init(logger_t *logger);
void logger_destroy(logger_t *logger);
logger_t *logger_global(void);

void logger_input(logger_t *logger, int type, ustring message);

#define LOG_INFO(...) logger_input(logger_global(), LOG_INFO, format(__VA_ARGS__))
#define LOG_WARN(...) logger_input(logger_global(), LOG_WARN, format(__VA_ARGS__))
#define LOG_ERROR(...) logger_input(logger_global(), LOG_ERROR, format(__VA_ARGS__))
#define LOG_INFO_FMT(fmt, ...) logger_input(logger_global(), LOG_INFO, format(fmt, __VA_ARGS__))
#define LOG_WARN_FMT(fmt, ...) logger_input(logger_global(), LOG_WARN, format(fmt, __VA_ARGS__))
#define LOG_ERROR_FMT(fmt, ...) logger_input(logger_global(), LOG_ERROR, format(fmt, __VA_ARGS__))
