#pragma once

#include "core/global.h"

#include <string>
#include <string_view>

typedef struct db_t {
    bool opened;
    std::string name;
    void *conn;
} db_t;

db_t db_open(std::string_view name);
void db_close(db_t db);