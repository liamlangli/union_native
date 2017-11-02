#include "graphics.h"

extern void light_new(light * l, vec pos, color c, int type) {
    l->pos = pos;
    l->c = c;
    l->type = type;
}
