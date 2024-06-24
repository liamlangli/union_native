#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"
#include "foundation/format.h"

enum ULOG_TYPE {
    ULOG_INFO,
    ULOG_WARN,
    ULOG_ERROR
};

#define ULOG_DUMP_STRIDE 1024

typedef struct ULOG_line_t {
    ustring line;
    int type;
    f64 time;
} ULOG_line_t;

typedef struct logger_config_t {
    bool std_out, write_to_file;
    ustring file_path;
    u32 max_lines;
} logger_config_t;

typedef struct logger_t {
    logger_config_t config;
    ULOG_line_t *lines;
    u32 last_dump, new_line_count;
} logger_t;

void logger_init(logger_t *logger);
void logger_destroy(logger_t *logger);
logger_t *logger_global(void);

void logger_input(logger_t *logger, int type, ustring message);

#define ULOG_INFO(...) logger_input(logger_global(), ULOG_INFO, uformat(__VA_ARGS__))
#define ULOG_WARN(...) logger_input(logger_global(), ULOG_WARN, uformat(__VA_ARGS__))
#define ULOG_ERROR(...) logger_input(logger_global(), ULOG_ERROR, uformat(__VA_ARGS__))
#define ULOG_INFO_FMT(fmt, ...) logger_input(logger_global(), ULOG_INFO, uformat(fmt, __VA_ARGS__))
#define ULOG_WARN_FMT(fmt, ...) logger_input(logger_global(), ULOG_WARN, uformat(fmt, __VA_ARGS__))
#define ULOG_ERROR_FMT(fmt, ...) logger_input(logger_global(), ULOG_ERROR, uformat(fmt, __VA_ARGS__))
