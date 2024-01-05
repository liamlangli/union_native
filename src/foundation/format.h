#pragma once

int find_char(const char *fmt, char c);
int find_char_range(const char *fmt, int start, int end, char c);
int atoi_range(const char *str, int start, int end);

char* itoa(int num, char* str, int base);
char* ftoa(float num, char* str, int precision);