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
        switch (type) {
        case LOG_INFO:
            printf(INFO_COLOR "[INF]" LOG_COLOR " %s\n", message);
            break;
        case LOG_WARN:
            printf(WARN_COLOR "[WRN]" LOG_COLOR " %s\n", message);
            break;
        case LOG_ERROR:
            printf(ERROR_COLOR "[ERR]" LOG_COLOR " %s\n", message);
            break;
        default:
            printf(LOG_COLOR "[MSG]" LOG_COLOR " %s\n", message);
            break;
        }
    }

    u32 count = (u32)arrlen(logger->lines);
    if (logger->config.write_to_file) {
        FILE *file = fopen(logger->config.file_path.data, "a");
        fprintf(file, "%s\n", message);
        fclose(file);
        logger->new_line_count = 0;
    } else {
        f64 time = 0;
        script_context_t *ctx = script_context_shared();
        if (ctx != NULL) {
            time = ctx->state.time;
        }
        log_line_t line = { .line = ustring_str((i8*)message), .type = type, .time = time };
        arrpush(logger->lines, line);
    }
}

/**
 * string:
 *   {} {[\d]:[\d]}
 * 
 * integer:
 *   {d} {[\d]d}
 * 
 * float:
 *   {f} {[\d].[\d]f}
*/
void logger_format_input(logger_t *logger, int type, const char* fmt, ...) {
    int size = (int)strlen(fmt);
    if (size == 0)
        return;

    int i, start, end, count;
    va_list args;
    char buff[65];

    va_start(args, fmt);
    i = 0;
    ustring_view view = ustring_view_STR(fmt);
    while (i < size) {
        start = find_char_range(fmt, i, size, '{');
        if (start == -1) break;
        end = find_char_range(fmt, start, size, '}');
        if (end == -1) break;

        ustring_view_erase(&view, start, end + 1);
        if (end - start == 1) { // char * for {}
            char *str = va_arg(args, char *);
            ustring_view_insert_STR(&view, start, str);
        } else {
            if (fmt[end - 1] == 'd') {
                if (end - start == 2) {
                    ustring_view_insert_STR(&view, start, itoa(va_arg(args, int), buff, 10));
                } else {
                    // parse base
                    int base = atoi_range(fmt, start + 1, end - start - 2);
                    ustring_view_insert_STR(&view, start, itoa(va_arg(args, int), buff, base));
                }
            } else if (fmt[end - 1] == 'f') {
                if (end - start == 2) {
                    ustring_view_insert_STR(&view, start, ftoa(va_arg(args, int), buff, 10));
                } else {
                    // parse base
                    int precision = atoi_range(fmt, start + 1, end - start - 2);
                    ustring_view_insert_STR(&view, start, ftoa(va_arg(args, int), buff, precision));
                }
            } else if (fmt[end - 1] == 'v') {
                ustring_view arg = va_arg(args, ustring_view);
                ustring_view_insert_ustring_view(&view, start, &arg);
            } else if (fmt[end - 1] == 'u') {
                ustring arg = va_arg(args, ustring);
                ustring_view_insert_ustring(&view, start, &arg);
            } else {
                // parse range
                char *str = va_arg(args, char *);
                int colon = find_char_range(fmt, start, end, ':');
                if (colon == -1)  {
                    ustring_view_insert_STR(&view, start, str);
                } else {
                    int from = atoi_range(fmt, start + 1, colon);
                    int len = atoi_range(fmt, colon + 1, end - 1);
                    len = len ? len : (int)strlen(str);
                    ustring_view_insert_STR_range(&view, start, str, from, from + len);
                }
            }
        }

        i = end + 1;
    }
    va_end(args);
    logger_input(logger, type, view.base.data);
}
