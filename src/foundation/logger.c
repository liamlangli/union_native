#include "foundation/logger.h"

#include <stdio.h>

#define LOG_COLOR "\033[0;37m"
#define INFO_COLOR "\033[0;32m"
#define ERROR_COLOR "\033[0;31m"
#define WARNING_COLOR "\033[0;33m"

static logger_t global_logger;

void logger_init(logger_t *logger) {
    logger->config.std_out = true;
    logger->config.write_to_file = false;
    logger->config.file_path = ustring_STR("");
    logger->lines = NULL;
}

void logger_destroy(logger_t *logger) {
    if (logger->lines) {
        arrfree(logger->lines);
    }
}

logger_t *logger_global(void) {
    static bool initialized = false;
    if (initialized) return &global_logger;
    initialized = true;
    logger_init(&global_logger);
    return &global_logger;
}

void logger_input(logger_t *logger, int type, const char* message) {
    if (logger->config.std_out) {
        printf("[INPUT] %s\n", message);
    }

    u32 count = (u32)arrlen(logger->lines);
    if (logger->config.write_to_file) {
        FILE *file = fopen(logger->config.file_path.data, "a");
        fprintf(file, "[INPUT] %s\n", message);
        fclose(file);
        logger->new_line_count = 0;
    } else {
        // loop through lines and remove the oldest ones
        while (count >= logger->config.max_lines) {
            arrdel(logger->lines, 0);
            count--;
        }
    }
}

void logger_format_input(logger_t *logger, int type, const char* fmt, ...) {
}
