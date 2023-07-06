#pragma once

#include "public/global.h"

enum { ARG_PARSE_MAX_OPTIONS_COUNT = 32 };

typedef enum arg_parse_option_type {
    ARG_PARSE_OPTION_UNDEFINED = 0,
    ARG_PARSE_OPTION_FLAG,
    ARG_PARSE_OPTION_STRING,
    ARG_PARSE_OPTION_INT,
    ARG_PARSE_OPTION_FLOAT
} arg_parse_option_type;

typedef struct arg_parse_option_value_t {
    char *str;
    union {
        i32 int_value;
        f32 float_value;
    };
} arg_parse_option_value_t;

typedef struct arg_parse_option_t {
    const char *short_name;
    const char *long_name;
    const char *description;
    enum arg_parse_option_type type;
    arg_parse_option_value_t value;
    bool parsed;
} arg_parse_option_t;

typedef struct arg_parser_o arg_parser_o;

struct arg_parse_api {
    arg_parser_o *(*create_parser)(void);
    void (*set_description)(arg_parser_o *parser, const char *description);
    void (*delete_parser)(arg_parser_o *parser);

    bool (*add_flag)(arg_parser_o *parser, const char *short_name, const char *long_name, const char* description);
    bool (*add_string)(arg_parser_o *parser, const char *short_name, const char *long_name, const char* description, char *default_value);
    bool (*add_int)(arg_parser_o *parser, const char *short_name, const char *long_name, const char* description, i32 default_value);
    bool (*add_float)(arg_parser_o *parser, const char *short_name, const char *long_name, const char* description, f32 default_value);

    bool (*parse)(arg_parser_o *parser, int argc, char** argv);
    
    bool (*get_flag)(arg_parser_o *parser, const char *short_name, const char *long_name);
    bool (*get_string)(arg_parser_o *parser, const char *short_name, const char *long_name, char **value);
    bool (*get_int)(arg_parser_o *parser, const char *short_name, const char *long_name, i32 *value);
    bool (*get_float)(arg_parser_o *parser, const char *short_name, const char *long_name, f32 *value);
    void (*help)(arg_parser_o *parser);
};

extern struct arg_parse_api *arg_parse;
