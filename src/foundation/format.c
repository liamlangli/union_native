#include "foundation/format.h"

#include <math.h>
#include <stdarg.h>

int find_char(const char *fmt, char c) {
    int i = 0;
    int r = -1;
    while (fmt[i] != '\0') {
        if (fmt[i] == c) {
            r = i;
            break;
        }
        i++;
    }
    return r;
}

int find_char_range(const char *fmt, int start, int end, char c) {
    int i = start;
    int r = -1;
    while (i < end) {
        if (fmt[i] == c) {
            r = i;
            break;
        }
        i++;
    }
    return r;
}

char* itoa(int num, char* str, int base) {
    int i = 0;
    int isNegative = 0;

    /* Handle 0 explicitely, otherwise empty string is printed for 0 */
    if (num == 0) {
        str[i++] = '0';
        str[i] = '\0';
        return str;
    }

    // In standard itoa(), negative numbers are handled only with base 10. 
    // Otherwise numbers are considered unsigned.
    if (num < 0 && base == 10) {
        isNegative = 1;
        num = -num;
    }

    // Process individual digits
    while (num != 0) {
        int rem = num % base;
        str[i++] = (rem > 9)? (rem-10) + 'a' : rem + '0';
        num = num/base;
    }

    // If number is negative, append '-'
    if (isNegative)
        str[i++] = '-';

    str[i] = '\0'; // Append string terminator

    // Reverse the string
    int start = 0;
    int end = i - 1;
    while (start < end) {
        char temp = str[start];
        str[start] = str[end];
        str[end] = temp;
        start++;
        end--;
    }

    return str;
}

char* ftoa(float num, char* str, int precision) {
    int ipart = (int)num;
    float fpart = num - (float)ipart;
    char* ipart_str = itoa(ipart, str, 10);
    int i = 0;
    while (ipart_str[i] != '\0') {
        i++;
    }
    str[i++] = '.';
    int fpart_int = (int)(fpart * pow(10, precision));
    char* fpart_str = itoa(fpart_int, str + i, 10);
    return str;
}

int atoi_range(const char *fmt, int from, int size) {
    int i = from;
    int r = 0;
    while (i < size) {
        r = r * 10 + (fmt[i] - '0');
        i++;
    }
    return r;
}

ustring format(const char *fmt, ...) {
    ustring_view view = ustring_view_STR(fmt);
    int size = (int)strlen(fmt);
    if (size == 0)
        return view.base;

    int i, start, end, count;
    va_list args;
    char buff[65];

    va_start(args, fmt);
    i = 0;

    while (i < size) {
        start = find_char_range(fmt, i, size, '{');
        if (start == -1) break;
        end = find_char_range(fmt, start, size, '}');
        if (end == -1) break;

        char *str = "";
        u32 len = 0;
        if (end - start == 1) { // char * for {}
            str = va_arg(args, char *);
            if (str == NULL) str = "";
            len = (u32)strlen(str);
        } else {
            if (fmt[end - 1] == 'd') {
                if (end - start == 2) {
                    str = itoa(va_arg(args, int), buff, 10);
                } else {
                    // parse base
                    int base = atoi_range(fmt, start + 1, end - start - 2);
                    str = itoa(va_arg(args, int), buff, base);
                }
                len = (u32)strlen(str);
            } else if (fmt[end - 1] == 'f') {
                if (end - start == 2) {
                    str = ftoa(va_arg(args, f64), buff, 10);
                } else {
                    int precision = atoi_range(fmt, start + 1, end - start - 2);
                    str = ftoa(va_arg(args, f64), buff, precision);
                }
                len = (u32)strlen(str);
            } else if (fmt[end - 1] == 'v') {
                ustring_view arg = va_arg(args, ustring_view);
                str = arg.base.data + arg.start;
                len = arg.length;
            } else if (fmt[end - 1] == 'u') {
                ustring arg = va_arg(args, ustring);
                str = arg.data;
                len = (u32)strlen(str);
            } else {
                // parse range
                str = va_arg(args, char *);
                int colon = find_char_range(fmt, start, end, ':');
                if (colon == -1)  {
                    len = (u32)strlen(str);
                } else {
                    int from = atoi_range(fmt, start + 1, colon);
                    int len = atoi_range(fmt, colon + 1, end - 1);
                    str += from;
                    len = len ? len : (int)strlen(str);
                }
            }
        }

        ustring_view_erase(&view, start, end + 1);
        ustring_view_insert_STR_length(&view, start, str, len);
        size += start - end - 1 + len;
        i = start + len;
        fmt = (const char *)view.base.data;
    }
    va_end(args);
    ustring_view_set_null_terminated(&view);
    return view.base;
}