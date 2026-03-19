#pragma once

#include "core/global.h"

#include <string>
#include <vector>

enum ULOG_TYPE {
    ULOG_INFO = 0,
    ULOG_WARN = 1,
    ULOG_ERROR = 2,
};

typedef struct ULOG_line_t {
    std::string line;
    int type;
    f64 time;
} ULOG_line_t;

typedef struct logger_config_t {
    bool std_out, write_to_file;
    std::string file_path;
    u32 max_lines;
} logger_config_t;

typedef struct logger_t {
    logger_config_t config;
    std::vector<ULOG_line_t> lines;
    u32 last_dump, new_line_count;
} logger_t;

void logger_init(logger_t *logger);
void logger_destroy(logger_t *logger);
logger_t *logger_global(void);

void logger_input(logger_t *logger, int type, const char *message);
void logger_input_tag(logger_t *logger, int type, const char *tag, const char *message);

#define ULOG_INFO(msg) logger_input(logger_global(), ULOG_INFO, (msg))
#define ULOG_WARN(msg) logger_input(logger_global(), ULOG_WARN, (msg))
#define ULOG_ERROR(msg) logger_input(logger_global(), ULOG_ERROR, (msg))

#define LOG_INFO(tag, msg) logger_input_tag(logger_global(), ULOG_INFO, (tag), (msg))
#define LOG_WARN(tag, msg) logger_input_tag(logger_global(), ULOG_WARN, (tag), (msg))
#define LOG_ERROR(tag, msg) logger_input_tag(logger_global(), ULOG_ERROR, (tag), (msg))