#pragma once

#include "foundation/global.h" // IWYU pragma: export
#include <leveldb/c.h>

typedef struct db_t {
    leveldb_t *db;
    leveldb_options_t *o;
    leveldb_writeoptions_t *ow;
    leveldb_readoptions_t *or;
    bool opened;
} db_t;

db_t *db_share_open();
void db_share_close();

