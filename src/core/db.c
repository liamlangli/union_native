#include "core/db.h"

db_t db_open(std::string_view name) {
    db_t db = {0};
    db.name = std::string(name);
    return db;
}

void db_close(db_t db) {
    (void)db;
}