#include "foundation/logger.h"
#include "foundation/format.h"
#include "script/script_context.h"

#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>

#define LOG_COLOR "\033[0;37m"
#define INFO_COLOR "\033[0;32m"
#define WARN_COLOR "\033[0;33m"
#define ERROR_COLOR "\033[0;31m"

static logger_t global_logger;

void logger_init(logger_t *logger) {
    logger->config.std_out = true;
    logger->config.write_to_file = false;
    logger->config.file_path = ustring_STR("");
    logger->lines = NULL;
    logger->new_line_count = 0;
    logger->last_dump = 0;
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

void logger_input(logger_t *logger, int type, ustring message) {
    if (logger->config.std_out) {
        switch (type) {
        case LOG_INFO:
            printf(INFO_COLOR "[INF]" LOG_COLOR " %s\n", message.data);
            break;
        case LOG_WARN:
            printf(WARN_COLOR "[WRN]" LOG_COLOR " %s\n", message.data);
            break;
        case LOG_ERROR:
            printf(ERROR_COLOR "[ERR]" LOG_COLOR " %s\n", message.data);
            break;
        default:
            printf(LOG_COLOR "[MSG]" LOG_COLOR " %s\n", message.data);
            break;
        }
    }

    u32 count = (u32)arrlen(logger->lines);
    u32 last_dump = logger->last_dump;
    if (count - last_dump > LOG_DUMP_STRIDE) {
        ustring_view dump = ustring_view_STR("");
        for (u32 i = last_dump; i < count; i++) {
            ustring_view_append_STR(&dump, logger->lines[i].line.data);
        }
        if (logger->config.write_to_file) {
            FILE *file = fopen(logger->config.file_path.data, "a");
            fprintf(file, "%s\n", dump.base.data);
            fclose(file);
        }
        logger->last_dump = count;
        ustring_view_free(&dump);
        logger->last_dump = logger->last_dump + LOG_DUMP_STRIDE;
        logger->new_line_count = 0;
    }
    f64 time = 0;
    script_context_t *ctx = script_context_shared();
    if (ctx != NULL) {
        time = ctx->state.time;
    }
    log_line_t line = { .line = message, .type = type, .time = time };
    arrpush(logger->lines, line);
    logger->new_line_count++;
}