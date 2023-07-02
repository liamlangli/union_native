#pragma once

#include "types.h"

enum json_type {
    JSON_TYPE_NULL,
    JSON_TYPE_FALSE,
    JSON_TYPE_TRUE,
    JSON_TYPE_NUMBER,
    JSON_TYPE_STRING,
    JSON_TYPE_ARRAY,
    JSON_TYPE_OBJECT,
};

#ifndef __ZIG__

typedef struct json_item_t {
    u32 type : 3;
    u32 offset : 29;
} json_item_t;

#else 

typedef struct json_item_t {
    u32 data;
} json_item_t;

#endif

enum json_parse_ext {
    JSON_PARSE_EXT_ALLOW_UNQUOTED_KEYS = 0x1,
    JSON_PARSE_EXT_ALLOW_COMMENTS = 0x2,
    JSON_PARSE_EXT_IMPLICIT_ROOT_OBJECT = 0x4,
    JSON_PARSE_EXT_OPTIONAL_COMMAS = 0x8,
    JSON_PARSE_EXT_EQUALS_FOR_COLON = 0x10,
    JSON_PARSE_EXT_LUA_QUOTING = 0x20,
};

enum json_generate_ext {
    JSON_GENERATE_EXT_PREFER_UNQUOTED_KEYS = 0x1,
    JSON_GENERATE_EXT_IMPLICIT_ROOT_OBJECT = 0x4,
    JSON_GENERATE_EXT_NO_COMMAS = 0x8,
    JSON_GENERATE_EXT_COLONS_FOR_EQUALS = 0x10,
    JSON_GENERATE_EXT_LUA_QUOTING = 0x20,
    JSON_GENERATE_INLINE_SMALL_ARRAYS = 0x40,
    JSON_GENERATE_INLINE_SMALL_OBJECTS = 0x80,
    JSON_GENERATE_INDENT_WITH_TABS = 0x100,
};

#define JSON_ERROR_STRING_LENGTH 79

typedef struct json_line_info_t {
    u32 config_item;
    u32 line_number;
} json_line_info_t;

typedef struct json_parse_info_t {
    bool success;
    char error[JSON_ERROR_STRING_LENGTH + 1];
    MACRO_PAD(3);

    u32 num_line_info;
    u32 allocated_line_info;

    json_line_info_t line_info[1];
} json_parse_result_t;

typedef struct json_generate_t {
    char *s;
    u32 len;
    u32 allocated;
} json_generate_t;

struct json_api {
    // void (*parse)(const char *json, struct );
    void (*print)(void);
};
