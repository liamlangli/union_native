#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"

#include <stb_ds.h>

enum LOG_TYPE {
    LOG_INFO,
    LOG_WARNING,
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

void logger_input(logger_t *logger, int type, const char* message);
void logger_format_input(logger_t *logger, int type, const char* fmt, ...);

#define LOG_INFO(...) logger_format_input(logger_global(), LOG_INFO, __VA_ARGS__)
#define LOG_WARNING(...) logger_format_input(logger_global(), LOG_WARNING, __VA_ARGS__)
#define LOG_ERROR(...) logger_format_input(logger_global(), LOG_ERROR, __VA_ARGS__)
#define LOG_INFO_FMT(fmt, ...) logger_format_input(logger_global(), LOG_INFO, fmt, __VA_ARGS__)
#define LOG_WARNING_FMT(fmt, ...) logger_format_input(logger_global(), LOG_WARNING, fmt, __VA_ARGS__)
#define LOG_ERROR_FMT(fmt, ...) logger_format_input(logger_global(), LOG_ERROR, fmt, __VA_ARGS__)
