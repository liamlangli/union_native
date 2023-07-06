#include "plugin/arg_parse/arg_parse.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

typedef struct arg_parser_o {
    u32 option_count;
    arg_parse_option_t options[ARG_PARSE_MAX_OPTIONS_COUNT];
    const char *description;
} arg_parser_o;

static arg_parser_o* arg_parse_create_parser(void) {
    arg_parser_o *parser = (arg_parser_o*)malloc(sizeof(arg_parser_o));
    memset(parser, 0, sizeof(arg_parser_o));
    return parser;
}

static void arg_parse_set_description(arg_parser_o *parser, const char *description) {
    assert(parser != NULL);
    parser->description = description;
}

static void arg_parse_delete_parser(arg_parser_o *parser) {
    free(parser);
}

static bool arg_parse_find_option_by_short_name(arg_parser_o *parser, const char *name, u32 *index) {
    if (parser == NULL || parser->option_count == 0) return false;
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 count = parser->option_count;
    for (int i = 0; i < count; ++i) {
        arg_parse_option_t *option = &parser->options[i];
        if (strcasecmp(option->short_name, name) == 0) {
            *index = (u32)i;
            return true;
        }
    }

    return false;
}

static bool arg_parse_find_option_by_long_name(arg_parser_o *parser, const char *name, u32 *index) {
    if (parser == NULL || parser->option_count == 0) return false;
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 count = parser->option_count;
    for (int i = 0; i < count; ++i) {
        arg_parse_option_t *option = &parser->options[i];
        if (strcasecmp(option->long_name, name) == 0) {
            *index = (u32)i;
            return true;
        }
    }
    return false;
}

static bool arg_parse_add_option_flag(arg_parser_o *parser, const char *short_name, const char *long_name, const char *description) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 index = parser->option_count;
    if (arg_parse_find_option_by_short_name(parser, short_name, &index)) {
        return false;
    }

    if (arg_parse_find_option_by_long_name(parser, long_name, &index)) {
        return false;
    }

    arg_parse_option_t *option = &parser->options[index];
    option->short_name = short_name;
    option->long_name = long_name;
    option->type = ARG_PARSE_OPTION_FLAG;
    option->description = description;

    parser->option_count++;

    return true;
}

static bool arg_parse_add_option_string(arg_parser_o *parser, const char *short_name, const char *long_name, const char *description, char *default_value) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 index = parser->option_count;
    if (arg_parse_find_option_by_short_name(parser, short_name, &index)) {
        return false;
    }

    if (arg_parse_find_option_by_long_name(parser, long_name, &index)) {
        return false;
    }

    arg_parse_option_t *option = &parser->options[index];
    option->short_name = short_name;
    option->long_name = long_name;
    option->type = ARG_PARSE_OPTION_STRING;
    option->description = description;
    option->value.str = default_value;

    parser->option_count++;

    return true;
}

static bool arg_parse_add_option_int(arg_parser_o *parser, const char *short_name, const char *long_name, const char *description, i32 default_value) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 index = parser->option_count;
    if (arg_parse_find_option_by_short_name(parser, short_name, &index)) {
        return false;
    }

    if (arg_parse_find_option_by_long_name(parser, long_name, &index)) {
        return false;
    }

    arg_parse_option_t *option = &parser->options[index];
    option->short_name = short_name;
    option->long_name = long_name;
    option->type = ARG_PARSE_OPTION_INT;
    option->description = description;
    option->value.int_value = default_value;

    parser->option_count++;

    return true;
}

static bool arg_parse_add_option_float(arg_parser_o *parser, const char *short_name, const char *long_name, const char *description, f32 default_value) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 index = parser->option_count;
    if (arg_parse_find_option_by_short_name(parser, short_name, &index)) {
        return false;
    }

    if (arg_parse_find_option_by_long_name(parser, long_name, &index)) {
        return false;
    }

    arg_parse_option_t *option = &parser->options[index];
    option->short_name = short_name;
    option->long_name = long_name;
    option->type = ARG_PARSE_OPTION_INT;
    option->description = description;
    option->value.float_value = default_value;

    parser->option_count++;

    return true;
}

static bool arg_parse_get_option_flag(arg_parser_o *parser, const char *short_name, const char* long_name) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 short_index = 0;
    u32 long_index = 0;
    bool short_found = arg_parse_find_option_by_short_name(parser, short_name, &short_index);
    bool long_found = arg_parse_find_option_by_long_name(parser, long_name, &long_index);

    if (!short_found && !long_found) return false;

    u32 index = short_found ? short_index : long_index;
    arg_parse_option_t *option = &parser->options[index];
    if (!option->parsed || option->type != ARG_PARSE_OPTION_FLAG) return false;

    return true;
}

static bool arg_parse_get_option_string(arg_parser_o *parser, const char *short_name, const char* long_name, char **value) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 short_index = 0;
    u32 long_index = 0;
    bool short_found = arg_parse_find_option_by_short_name(parser, short_name, &short_index);
    bool long_found = arg_parse_find_option_by_long_name(parser, long_name, &long_index);

    if (!short_found && !long_found) return false;

    u32 index = short_found ? short_index : long_index;
    arg_parse_option_t *option = &parser->options[index];
    if (!option->parsed || option->type != ARG_PARSE_OPTION_STRING) return false;

    if (value != NULL) *value = option->value.str;

    return true;
}

static bool arg_parse_get_option_int(arg_parser_o *parser, const char *short_name, const char* long_name, i32 *value) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 short_index = 0;
    u32 long_index = 0;
    bool short_found = arg_parse_find_option_by_short_name(parser, short_name, &short_index);
    bool long_found = arg_parse_find_option_by_long_name(parser, long_name, &long_index);

    if (!short_found && !long_found) return false;

    u32 index = short_found ? short_index : long_index;
    arg_parse_option_t *option = &parser->options[index];
    if (!option->parsed || option->type != ARG_PARSE_OPTION_INT) return false;

    if (value != NULL) *value = option->value.int_value;

    return true;
}

static bool arg_parse_get_option_float(arg_parser_o *parser, const char *short_name, const char* long_name, f32 *value) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    u32 short_index = 0;
    u32 long_index = 0;
    bool short_found = arg_parse_find_option_by_short_name(parser, short_name, &short_index);
    bool long_found = arg_parse_find_option_by_long_name(parser, long_name, &long_index);

    if (!short_found && !long_found) return false;

    u32 index = short_found ? short_index : long_index;
    arg_parse_option_t *option = &parser->options[index];
    if (!option->parsed || option->type != ARG_PARSE_OPTION_FLOAT) return false;

    if (value != NULL) *value = option->value.float_value;

    return true;
}


static bool arg_parse_parse(arg_parser_o *parser, int argc, char **argv) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    i32 i = 1;
    while (i < argc) {
        const char *s = argv[i];
        if (s[0] == '-') {
            bool valid = false;
            u32 index = 0;
            
            if ((strlen(s) >= 2) && ((s[0] == '-') && (s[1] == '-'))) {
                const char *long_name = s + 2;
                valid = arg_parse_find_option_by_long_name(parser, long_name, &index);
            } else {
                const char *short_name = s + 1;
                valid = arg_parse_find_option_by_short_name(parser, short_name, &index);
            }

            if (valid == false) {
                printf("ERROR: invalid argument %s\n", s);
                return false;
            }

            arg_parse_option_t *option = &parser->options[index];
            switch (option->type)
            {
            case ARG_PARSE_OPTION_FLAG: {
                option->parsed = true;
                i += 1;
            } break;

            case ARG_PARSE_OPTION_STRING: {
                if (i + 1 >= argc) {
                    printf("ERROR: missing option data for %s\n", s);
                    return false;
                }

                option->value.str = argv[i + 1];
                option->parsed = true;

                i += 2;
            } break;

            case ARG_PARSE_OPTION_INT: {
                if (i + 1 >= argc) {
                    printf("ERROR: missing option data for %s\n", s);
                    return false;
                }

                option->value.int_value = atoi(argv[i + 1]);
                option->parsed = true;
                i += 2;
            } break;

            case ARG_PARSE_OPTION_FLOAT: {
                if (i + 1 >= argc) {
                    printf("ERROR: missing option data for %s\n", s);
                    return false;
                }

                option->value.float_value = atof(argv[i + 1]);
                option->parsed = true;
                i += 2;
            } break;

            case ARG_PARSE_OPTION_UNDEFINED: break;
            default: break;
            }

        } else {
            i += 1;
        }
    }

    return true;
}

static void arg_parse_help(arg_parser_o *parser) {
    assert(parser != NULL);
    assert(parser->option_count < ARG_PARSE_MAX_OPTIONS_COUNT);

    if (parser->description) {
        printf(parser->description);
    }

    printf("Options:\n");

    u32 count = parser->option_count;
    for (u32 i = 0; i < count; ++i) {
        arg_parse_option_t *option = &parser->options[i];
        printf("    [-%s|--%s] %s\n", option->short_name, option->long_name, option->description);
    }
}

static struct arg_parse_api _arg_parse = {
    .create_parser = &arg_parse_create_parser,
    .set_description = &arg_parse_set_description,
    .delete_parser = &arg_parse_delete_parser,

    .parse = &arg_parse_parse,

    .add_flag = &arg_parse_add_option_flag,
    .add_string = &arg_parse_add_option_string,
    .add_int = &arg_parse_add_option_int,
    .add_float = &arg_parse_add_option_float,

    .get_flag = &arg_parse_get_option_flag,
    .get_string = &arg_parse_get_option_string,
    .get_int = &arg_parse_get_option_int,
    .get_float = &arg_parse_get_option_float,

    .help = &arg_parse_help
};

struct arg_parse_api *arg_parse = &_arg_parse;
