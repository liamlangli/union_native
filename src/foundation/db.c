#include "foundation/db.h"

#include <stdio.h>

db_t db_open(ustring name) {
    db_t db = {0};
    db.o = leveldb_options_create();
    leveldb_options_set_create_if_missing(db.o, 1);
    db.ow = leveldb_writeoptions_create();
    db.or = leveldb_readoptions_create();

    leveldb_readoptions_set_verify_checksums(db.or, 1);
    leveldb_readoptions_set_fill_cache(db.or, 0);

    char *err = NULL;
    db.db = leveldb_open(db.o, name.data, &err);
    if (err != NULL) {
        printf("db open error: %s\n", err);
        leveldb_free(err);
        return db;
    }

    db.opened = true;
    return db;
}

void db_close(db_t db) {
    if (!db.opened) return;
    leveldb_close(db.db);
    leveldb_options_destroy(db.o);
    leveldb_writeoptions_destroy(db.ow);
    leveldb_readoptions_destroy(db.or);
}

ustring db_read(db_t db, ustring key) {
    if (!db.opened) return ustring_NULL;
    size_t len;
    char *err = NULL;
    char *value = leveldb_get(db.db, db.or, key.data, key.length, &len, &err);
    if (err != NULL) {
        printf("db read error: %s\n", err);
        leveldb_free(err);
        return ustring_NULL;
    }
    leveldb_free(value);
    return ustring_str(value);
}

bool db_write(db_t db, ustring key, ustring value) {
    if (!db.opened) return false;
    char *err = NULL;
    leveldb_put(db.db, db.ow, key.data, key.length, value.data, value.length, &err);
    if (err != NULL) {
        printf("db write error: %s\n", err);
        leveldb_free(err);
        return false;
    }
    return true;
}
