#include "foundation/network.h"
#include "foundation/global.h"
#include "foundation/ustring.h"
#include <stdlib.h>

#include <uv.h>

url_t url_parse(ustring_view url) {
    url_t body = {0};
    body.url = url;
    char *data = url.base.data + url.start;

    u32 length = url.length;
    u32 index = 0;
    u32 colon = 0;
    u32 port_colon = 0;
    u32 slash = 0;
    u32 question = 0;
    u32 terminate = 0;

protocol:
    for (index = 0; index < length; index++) {
        if (data[index] == ':') {
            if (index < length - 2 && data[index + 1] == '/' && data[index + 2] == '/') {
                colon = index;
                goto domain;
            } else {
                goto fail;
            }
        }
    }
    goto fail;

domain:
    for (index = colon + 3; index < length; index++) {
        if (data[index] == ':') {
            port_colon = index;
            goto port;
        } else if (data[index] == '/') {
            slash = index;
            goto path;
        } else if (data[index] == '?') {
            question = index;
            goto query;
        }
    }
    goto fail;

port:
    for (index = port_colon + 1; index < length; index++) {
        if (data[index] == '/') {
            slash = index;
            goto path;
        } else if (data[index] == '?') {
            question = index;
            goto query;
        }
    }
    goto fail;

path:
    for (index = slash + 1; index < length; index++) {
        if (data[index] == '?') {
            question = index;
            goto query;
        }
    }
    question = length;
    goto end;

query:
    for (index = question + 1; index < length; index++) {
        if (data[index] == '#') {
            terminate = index;
            goto end;
        }
    }
    terminate = length;
    goto end;

fail:
    return body;

end:
    body.valid = 1;
    body.protocol = ustring_view_range(&url, 0, colon);
    body.host = ustring_view_range(&url, colon + 3, port_colon ? port_colon : slash);
    body.port = port_colon ? ustring_view_range(&url, port_colon + 1, slash) : ustring_view_STR("80");
    body.path = ustring_view_range(&url, slash, question);
    body.query = ustring_view_range(&url, question, terminate);
    return body;
}

void url_dump(url_t url) {
    printf("url_t {\n");
    printf("  valid: %d\n", url.valid);
    printf("  protocol: %.*s\n", url.protocol.length, url.protocol.base.data + url.protocol.start);
    printf("  host: %.*s\n", url.host.length, url.host.base.data + url.host.start);
    printf("  port: %.*s\n", url.port.length, url.port.base.data + url.port.start);
    printf("  path: %.*s\n", url.path.length, url.path.base.data + url.path.start);
    printf("  query: %.*s\n", url.query.length, url.query.base.data + url.query.start);
    printf("}\n");
}

#define ACCEPT                                                                                                                 \
    "Accept: "                                                                                                                 \
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/"                                                  \
    "webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
#define ACCEPT_ENCODING "Accept-Encoding: gzip, deflate, br"
#define ACCEPT_LANGUAGE "Accept-Language: en-US,en;q=0.9"
#define CACHE_CONTROL "Cache-Control: no-cache"
#define USER_AGENT                                                                                                             \
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "                                                \
    "(KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"


typedef struct net_download_request_t {
    uv_tcp_t socket;
    url_t url;
} net_download_request_t;

static ustring_view net_url_to_req_body(url_t url) {
    ustring_view body = ustring_view_STR("");
    ustring_view_append_STR(&body, "GET ");
    ustring_view_append_ustring_view(&body, &url.path);
    ustring_view_append_ustring_view(&body, &url.query);
    ustring_view_append_STR(&body, " HTTP/1.1\r\n");
    ustring_view_append_STR(&body, "Host: ");
    ustring_view_append_ustring_view(&body, &url.host);
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_append_STR(&body, USER_AGENT);
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_append_STR(&body, ACCEPT);
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_append_STR(&body, ACCEPT_ENCODING);
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_append_STR(&body, ACCEPT_LANGUAGE);
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_append_STR(&body, CACHE_CONTROL);
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_set_null_terminated(&body);
    return body;
}


static void on_write(uv_write_t *write, int status) {
    if (status < 0) {
        fprintf(stderr, "write error %s\n", uv_err_name(status));
    }
    free(write);
    printf("request body written.\n");
}

static void on_alloc(uv_handle_t *handle, size_t suggested_size, uv_buf_t *buf) {
    buf->base = malloc(suggested_size);
    buf->len = suggested_size;
}

static void on_read(uv_stream_t *stream, ssize_t nread, const uv_buf_t *buf) {
    if (nread < 0) {
        if (nread != UV_EOF) {
            fprintf(stderr, "read error %s\n", uv_err_name(nread));
        }
        uv_close((uv_handle_t *)stream, NULL);
    } else if (nread > 0) {
        printf("%.*s", (int)nread, buf->base);
    }

    free(buf->base);
}

static void on_connect(uv_connect_t *conn, int status) {
    if (status < 0) {
        fprintf(stderr, "connection error %s\n", uv_err_name(status));
        return;
    }
    printf("connected to server.\n");

    uv_stream_t *stream = conn->handle;
    net_download_request_t *request = conn->data;
    free(conn);

    uv_write_t *write_req = malloc(sizeof(uv_write_t));
    write_req->data = request;

    ustring_view body = net_url_to_req_body(request->url);
    uv_buf_t buf = uv_buf_init((char *)body.base.data, body.base.length);
    uv_write(write_req, stream, &buf, 1, on_write);
    uv_run(uv_default_loop(), UV_RUN_DEFAULT);
}

int net_download_async(url_t uri, url_download_cb cb) {
    uv_loop_t *loop = uv_default_loop();

    uv_getaddrinfo_t resolver;
    ustring host = ustring_view_to_new_ustring(&uri.host);
    ustring port = ustring_view_to_new_ustring(&uri.port);

    int r = uv_getaddrinfo(loop, &resolver, NULL, host.data, port.data, NULL);
    ustring_free(&host);
    ustring_free(&port);

    if (r) {
        fprintf(stderr, "getaddrinfo call error %s\n", uv_err_name(r));
        return 1;
    }

    struct sockaddr_in addr = *((struct sockaddr_in *)resolver.addrinfo->ai_addr);
    uv_freeaddrinfo(resolver.addrinfo);

    net_download_request_t *request = malloc(sizeof(net_download_request_t));
    uv_tcp_init(loop, &request->socket);
    request->url = uri;

    uv_connect_t *connect = malloc(sizeof(uv_connect_t));
    connect->data = request;
    uv_tcp_connect(connect, &request->socket, (const struct sockaddr *)&addr, on_connect);
    uv_run(loop, UV_RUN_DEFAULT);
    return 0;
}