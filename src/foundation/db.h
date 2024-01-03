#pragma once

#include "foundation/global.h" // IWYU pragma: export
#include "foundation/ustring.h"
#include "foundation/udata.h"

typedef struct db_o db_o;
typedef struct db_t {
    bool opened;
    ustring name;
    db_o *conn;
} db_t;

db_t db_open(ustring name);
void db_close(db_t db);

udata db_get(db_t db, ustring key);
bool db_put(db_t db, ustring key, udata value);
bool db_delete(db_t db, ustring key);

bool db_save_dump_file(db_t db, ustring path);
bool db_load_dump_file(db_t db, ustring path);
