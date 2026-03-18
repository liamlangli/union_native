#pragma once

#include "foundation/global.h"
#include "foundation/ustring.h"
#include "foundation/network.h"

#define HTML_MAX_SCRIPTS 32

// A parsed <script> entry: either external (src set) or inline (code set).
// src is a heap-allocated null-terminated ustring — caller must ustring_free it.
// code points into the original content buffer — no allocation.
typedef struct html_script_t {
    ustring src;   // external: resolved absolute URL; empty if inline
    ustring code;  // inline: script text; empty if external
} html_script_t;

typedef struct html_parse_result_t {
    html_script_t scripts[HTML_MAX_SCRIPTS];
    u32 count;
} html_parse_result_t;

// Returns true if the content looks like an HTML document.
bool html_is_html(const char *data, u32 length);

// Parse all <script> tags from HTML content.
html_parse_result_t html_parse_scripts(const char *data, u32 length, url_t base_url);

// Resolve a (possibly relative) src against the base URL into a new heap string.
// Caller must ustring_free the result.
ustring html_resolve_url(url_t base, const char *src, u32 src_len);
