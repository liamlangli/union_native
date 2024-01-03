#include "foundation/db.h"

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
        printf("db open error: %s\n", err);
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
        printf("db read error: %s\n", err);
        leveldb_free(err);
        return udata_NULL;
    }
    return (udata) { .data = value, .length = len };
}

bool db_put(db_t db, ustring key, udata value) {
    if (!db.opened) return false;
    db_o *conn = db.conn;

    char *err = NULL;
    leveldb_put(conn->db, conn->ow, key.data, key.length, value.data, value.length, &err);
    if (err != NULL) {
        printf("db write error: %s\n", err);
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
        printf("db delete error: %s\n", err);
        leveldb_free(err);
        return false;
    }
    return true;
}

bool db_save_dump_file(db_t db, ustring path) {
    leveldb_t *conn = db.conn->db;

    leveldb_readoptions_t* read_options = leveldb_readoptions_create();
    leveldb_iterator_t* iter = leveldb_create_iterator(conn, read_options);

    FILE* file = fopen(path.data, "wb");
    if (!file) {
        fprintf(stderr, "Error opening output file: %s\n", path.data);
        return false;
    }

    leveldb_iter_seek_to_first(iter);
    while (leveldb_iter_valid(iter)) {
        size_t key_len, value_len;
        const char* key = leveldb_iter_key(iter, &key_len);
        const char* value = leveldb_iter_value(iter, &value_len);

        // Write key and value to the file
        fwrite(key, 1, key_len, file);
        fwrite(value, 1, value_len, file);

        leveldb_iter_next(iter);
    }

    fclose(file);
    leveldb_iter_destroy(iter);
    leveldb_readoptions_destroy(read_options);
    return true;
}

bool db_load_dump_file(db_t db, ustring path) {
    leveldb_t *conn = db.conn->db;
    FILE* file = fopen(path.data, "rb");
    if (!file) {
        fprintf(stderr, "Error opening input file: %s\n", path.data);
        return false;
    }

    char* buffer = NULL;
    size_t buffer_size = 0;
    size_t key_len, value_len;

    while (fread(&key_len, sizeof(size_t), 1, file) == 1) {
        fread(&value_len, sizeof(size_t), 1, file);

        // Allocate memory for key and value
        buffer = (char*)malloc(key_len + value_len);
        if (!buffer) {
            fprintf(stderr, "Memory allocation error\n");
            fclose(file);
            return false;
        }

        fread(buffer, 1, key_len + value_len, file);

        leveldb_writeoptions_t* write_options = leveldb_writeoptions_create();
        leveldb_put(conn, write_options, buffer, key_len, buffer + key_len, value_len, NULL);
        leveldb_writeoptions_destroy(write_options);

        free(buffer);
    }

    fclose(file);
    return true;
}