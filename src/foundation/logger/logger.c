#include "logger.h"



#include <stdio.h>
static FILE *dst;

void logger_init()
{
    dst = fopen("log.txt", "ab+");
}

void logger_write_to_file(const char* message)
{
    if (message == NULL)
    {
        return;
    }

    fputs(message, dst);
    fflush(dst);
}