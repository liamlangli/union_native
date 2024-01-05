#include "foundation/format.h"

#include <math.h>

int find_char(const char *fmt, char c) {
    int i = 0;
    int r = -1;
    while (fmt[i] != '\0') {
        i++;
        if (fmt[i] == c) {
            r = i;
            break;
        }
    }
    return r;
}

int find_char_range(const char *fmt, int start, int end, char c) {
    int i = start;
    int r = -1;
    while (i < end) {
        i++;
        if (fmt[i] == c) {
            r = i;
            break;
        }
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