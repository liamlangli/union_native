#include "foundation/db.h"
#include "foundation/logger.h"

#include <zip.h>
#include <leveldb/c.h>
#include <stdio.h>

typedef struct db_o {
    leveldb_t *db;
    leveldb_options_t *o;
    leveldb_writeoptions_t *ow;
    leveldb_readoptions_t *or;
} db_o;

db_t db_open(ustring name) {
    db_t db = {0};
    db_o *conn = malloc(sizeof(db_o));

    conn->o = leveldb_options_create();
    leveldb_options_set_create_if_missing(conn->o, 1);
    conn->ow = leveldb_writeoptions_create();
    conn->or = leveldb_readoptions_create();

    leveldb_readoptions_set_verify_checksums(conn->or, 1);
    leveldb_readoptions_set_fill_cache(conn->or, 0);

    char *err = NULL;
    conn->db = leveldb_open(conn->o, name.data, &err);
    if (err != NULL) {
        ULOG_ERROR_FMT("db open error: {}", err);
        leveldb_free(err);
        return db;
    }

    db.opened = true;
    db.conn = conn;
    return db;
}

void db_close(db_t db) {
    if (!db.opened) return;
    leveldb_close(db.conn->db);
    leveldb_options_destroy(db.conn->o);
    leveldb_writeoptions_destroy(db.conn->ow);
    leveldb_readoptions_destroy(db.conn->or);
    free(db.conn);
    db.opened = false;
    db.conn = NULL;
}

udata db_get(db_t db, ustring key) {
    if (!db.opened) return udata_NULL;
    db_o *conn = db.conn;

    size_t len;
    char *err = NULL;
    char *value = leveldb_get(conn->db, conn->or, key.data, key.length, &len, &err);
    if (err != NULL) {
        ULOG_ERROR_FMT("db read error: {}", err);
        leveldb_free(err);
        return udata_NULL;
    }
    return (udata) { .data = value, .length = (u32)len };
}

bool db_put(db_t db, ustring key, udata value) {
    if (!db.opened) return false;
    db_o *conn = db.conn;

    char *err = NULL;
    leveldb_put(conn->db, conn->ow, key.data, key.length, value.data, value.length, &err);
    if (err != NULL) {
        ULOG_ERROR_FMT("db write error: {}", err);
        leveldb_free(err);
        return false;
    }
    return true;
}

bool db_delete(db_t db, ustring key) {
    if (!db.opened) return false;
    db_o *conn = db.conn;

    char *err = NULL;
    leveldb_delete(conn->db, conn->ow, key.data, key.length, &err);
    if (err != NULL) {
        ULOG_ERROR_FMT("db delete error: {}", err);
        leveldb_free(err);
        return false;
    }
    return true;
}
