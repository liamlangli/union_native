#include "core/network.h"

#include "core/logger.h"

#include <string>

url_t url_parse(std::string_view url) {
    url_t parsed = {0};
    parsed.url = std::string(url);

    const size_t scheme_index = url.find("://");
    if (scheme_index == std::string_view::npos) return parsed;

    size_t host_start = scheme_index + 3;
    size_t path_start = url.find('/', host_start);
    size_t query_start = url.find('?', host_start);
    if (path_start == std::string_view::npos) path_start = url.size();
    if (query_start == std::string_view::npos) query_start = url.size();
    if (query_start < path_start) path_start = query_start;

    parsed.valid = true;
    parsed.protocol = std::string(url.substr(0, scheme_index));
    parsed.host = std::string(url.substr(host_start, path_start - host_start));
    parsed.port = parsed.protocol == "https" ? 443 : 80;
    parsed.path = path_start < url.size() ? std::string(url.substr(path_start, query_start - path_start)) : std::string("/");
    if (parsed.path.empty()) parsed.path = "/";
    if (query_start < url.size()) parsed.query = std::string(url.substr(query_start + 1));
    return parsed;
}

void url_dump(url_t url) {
    (void)url;
}

int net_download_async(url_t url, url_session_cb cb, void *userdata) {
    (void)url;
    (void)cb;
    (void)userdata;
    LOG_WARN("network", "async download is currently disabled");
    return -1;
}

void net_poll(void) {}