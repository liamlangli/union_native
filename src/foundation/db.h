#pragma once

#include "foundation/global.h" // IWYU pragma: export
#include "foundation/ustring.h"

#include <leveldb/c.h>

typedef struct db_t {
    leveldb_t *db;
    leveldb_options_t *o;
    leveldb_writeoptions_t *ow;
    leveldb_readoptions_t *or;
    bool opened;
} db_t;

db_t db_open(ustring name);
void db_close(db_t db);

ustring db_read(db_t db, ustring key);
bool db_write(db_t db, ustring key, ustring value);

