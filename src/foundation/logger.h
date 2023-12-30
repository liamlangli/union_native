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

typedef struct logger_config_t {
    bool std_out, write_to_file;
    ustring file_path;
    u32 max_lines;
} logger_config_t;

typedef struct logger_t {
    logger_config_t config;
    ustring *lines;
    u32 new_line_count;
} logger_t;

void logger_init(logger_t *logger);
void logger_destroy(logger_t *logger);

logger_t *logger_global(void);

void logger_info(logger_t *logger, const char* message);
void logger_warning(logger_t *logger, const char* message);
void logger_error(logger_t *logger, const char* message);