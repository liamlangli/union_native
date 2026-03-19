#include "core/logger.h"

#include <cstdio>

static logger_t global_logger;

void logger_init(logger_t *logger) {
    logger->config.std_out = true;
    logger->config.write_to_file = false;
    logger->config.file_path.clear();
    logger->lines.clear();
    logger->new_line_count = 0;
    logger->last_dump = 0;
}

void logger_destroy(logger_t *logger) {
    logger->lines.clear();
}

logger_t *logger_global(void) {
    static bool initialized = false;
    if (!initialized) {
        logger_init(&global_logger);
        initialized = true;
    }
    return &global_logger;
}

void logger_input(logger_t *logger, int type, const char *message) {
    const char *prefix = type == ULOG_ERROR ? "[ERR]" : (type == ULOG_WARN ? "[WRN]" : "[INF]");
    if (logger->config.std_out) {
        std::printf("%s %s\n", prefix, message != NULL ? message : "");
    }

    ULOG_line_t line = {.line = message != NULL ? message : "", .type = type, .time = 0};
    logger->lines.push_back(line);
    logger->new_line_count++;
}

void logger_input_tag(logger_t *logger, int type, const char *tag, const char *message) {
    char buffer[2048];
    std::snprintf(buffer, sizeof(buffer), "%s: %s", tag != NULL ? tag : "log", message != NULL ? message : "");
    logger_input(logger, type, buffer);
}