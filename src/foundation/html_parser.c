#include "foundation/html_parser.h"
#include "foundation/logger.h"

#include <stdlib.h>
#include <string.h>
#include <ctype.h>

// ---- helpers ----------------------------------------------------------------

static int str_iequal_n(const char *a, const char *b, u32 n) {
    for (u32 i = 0; i < n; i++) {
        if (tolower((unsigned char)a[i]) != tolower((unsigned char)b[i]))
            return 0;
    }
    return 1;
}

// Case-insensitive search of `needle` (length nlen) inside [haystack, end).
// Returns pointer to first match or NULL.
static const char *mem_istr(const char *haystack, const char *end, const char *needle, u32 nlen) {
    if (nlen == 0 || haystack + nlen > end)
        return NULL;
    for (const char *p = haystack; p + nlen <= end; p++) {
        if (str_iequal_n(p, needle, nlen))
            return p;
    }
    return NULL;
}

// ---- public API -------------------------------------------------------------

bool html_is_html(const char *data, u32 length) {
    if (length < 5)
        return false;
    // Skip optional BOM / whitespace
    u32 skip = 0;
    while (skip < length && (data[skip] == ' ' || data[skip] == '\r' || data[skip] == '\n' || data[skip] == '\t'))
        skip++;
    const char *d = data + skip;
    u32 rem = length - skip;
    if (rem >= 9 && str_iequal_n(d, "<!doctype", 9))
        return true;
    if (rem >= 6 && str_iequal_n(d, "<html", 5))
        return true;
    // Fallback: scan first 512 bytes for <html tag
    u32 scan = rem < 512 ? rem : 512;
    if (mem_istr(d, d + scan, "<html", 5) != NULL)
        return true;
    return false;
}

ustring html_resolve_url(url_t base, const char *src, u32 src_len) {
    // Absolute URL
    if (src_len >= 7 && (str_iequal_n(src, "http://", 7) || str_iequal_n(src, "https:/", 7))) {
        char *buf = (char *)malloc(src_len + 1);
        memcpy(buf, src, src_len);
        buf[src_len] = '\0';
        return (ustring){.data = buf, .length = src_len, .null_terminated = true, .is_static = false};
    }

    // Build base prefix: "http://host:port"
    ustring_view host = base.url;  // full original URL available through url.url
    // Reconstruct origin from parts
    const char *proto_data = base.protocol.base.data + base.protocol.start;
    u32 proto_len = base.protocol.length;
    const char *host_data = base.host.base.data + base.host.start;
    u32 host_len = base.host.length;
    const char *path_data = base.path.base.data + base.path.start;
    u32 path_len = base.path.length;

    char port_str[8] = {0};
    u32 port_len = 0;
    if (base.port != 80 && base.port != 443) {
        port_len = (u32)snprintf(port_str, sizeof(port_str), ":%d", base.port);
    }

    // Protocol-relative: //host/path
    if (src_len >= 2 && src[0] == '/' && src[1] == '/') {
        u32 total = proto_len + 1 + src_len + 1; // proto + ":" + src + NUL
        char *buf = (char *)malloc(total);
        u32 off = 0;
        memcpy(buf + off, proto_data, proto_len); off += proto_len;
        buf[off++] = ':';
        memcpy(buf + off, src, src_len); off += src_len;
        buf[off] = '\0';
        return (ustring){.data = buf, .length = off, .null_terminated = true, .is_static = false};
    }

    // Root-relative: /path
    if (src_len >= 1 && src[0] == '/') {
        u32 total = proto_len + 3 + host_len + port_len + src_len + 1;
        char *buf = (char *)malloc(total);
        u32 off = 0;
        memcpy(buf + off, proto_data, proto_len); off += proto_len;
        buf[off++] = ':'; buf[off++] = '/'; buf[off++] = '/';
        memcpy(buf + off, host_data, host_len); off += host_len;
        if (port_len) { memcpy(buf + off, port_str, port_len); off += port_len; }
        memcpy(buf + off, src, src_len); off += src_len;
        buf[off] = '\0';
        return (ustring){.data = buf, .length = off, .null_terminated = true, .is_static = false};
    }

    // Relative: resolve against directory of base path
    // Find last '/' in base path
    u32 dir_len = 0;
    for (u32 i = 0; i < path_len; i++) {
        if (path_data[i] == '/')
            dir_len = i + 1;
    }

    u32 total = proto_len + 3 + host_len + port_len + dir_len + src_len + 1;
    char *buf = (char *)malloc(total);
    u32 off = 0;
    memcpy(buf + off, proto_data, proto_len); off += proto_len;
    buf[off++] = ':'; buf[off++] = '/'; buf[off++] = '/';
    memcpy(buf + off, host_data, host_len); off += host_len;
    if (port_len) { memcpy(buf + off, port_str, port_len); off += port_len; }
    memcpy(buf + off, path_data, dir_len); off += dir_len;
    memcpy(buf + off, src, src_len); off += src_len;
    buf[off] = '\0';
    return (ustring){.data = buf, .length = off, .null_terminated = true, .is_static = false};
}

html_parse_result_t html_parse_scripts(const char *data, u32 length, url_t base_url) {
    html_parse_result_t result = {0};
    const char *end = data + length;
    const char *p = data;

    while (result.count < HTML_MAX_SCRIPTS) {
        // Find next <script
        const char *tag_start = mem_istr(p, end, "<script", 7);
        if (!tag_start)
            break;

        // Find end of opening tag
        const char *tag_end = tag_start + 7;
        while (tag_end < end && *tag_end != '>')
            tag_end++;
        if (tag_end >= end)
            break;

        // Check for src= attribute within opening tag
        const char *src_attr = mem_istr(tag_start + 7, tag_end, "src=", 4);

        if (src_attr) {
            src_attr += 4; // skip "src="
            char quote = (src_attr < tag_end) ? *src_attr : 0;
            if (quote == '"' || quote == '\'') {
                src_attr++; // skip quote
                const char *src_end = src_attr;
                while (src_end < tag_end && *src_end != quote)
                    src_end++;
                u32 src_len = (u32)(src_end - src_attr);
                if (src_len > 0) {
                    ustring resolved = html_resolve_url(base_url, src_attr, src_len);
                    result.scripts[result.count].src = resolved;
                    result.scripts[result.count].code = ustring_NULL;
                    result.count++;
                    ULOG_INFO_FMT("html_parser: found script src: {}", resolved.data);
                }
            }
        } else {
            // Inline script: extract content between > and </script>
            const char *body_start = tag_end + 1;
            const char *close_tag = mem_istr(body_start, end, "</script>", 9);
            if (!close_tag)
                close_tag = end;
            u32 code_len = (u32)(close_tag - body_start);
            if (code_len > 0) {
                char *buf = (char *)malloc(code_len + 1);
                memcpy(buf, body_start, code_len);
                buf[code_len] = '\0';
                result.scripts[result.count].src = ustring_NULL;
                result.scripts[result.count].code = (ustring){.data = buf, .length = code_len, .null_terminated = true, .is_static = false};
                result.count++;
                ULOG_INFO_FMT("html_parser: found inline script ({d} bytes)", code_len);
            }
            p = close_tag + 9;
            continue;
        }

        p = tag_end + 1;
    }

    return result;
}
