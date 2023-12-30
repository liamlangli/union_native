#include "foundation/network.h"
#include "foundation/global.h"
#include "foundation/ustring.h"
#include <stdlib.h>

#include <uv.h>

typedef struct net_session_t {
    net_request_t request;
    net_response_t response;
    url_session_cb cb;
} net_session_t;

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
    terminate = length;
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

static ustring_view net_url_to_req_body(url_t url) {
    ustring_view body = ustring_view_STR("");
    ustring_view_append_STR(&body, "GET ");
    ustring_view_append_ustring_view(&body, &url.path);
    ustring_view_append_ustring_view(&body, &url.query);
    ustring_view_append_STR(&body, " HTTP/1.1\r\n");
    ustring_view_append_STR(&body, "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/" \
        "webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\n");
    ustring_view_append_STR(&body, "Accept-Encoding: gzip, deflate, br\r\n");
    ustring_view_append_STR(&body, "Accept-Language: en,zh-CN;q=0.9,zh;q=0.8\r\n");
    ustring_view_append_STR(&body, "Host: ");
    ustring_view_append_ustring_view(&body, &url.host);
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_append_STR(&body, "Connection: keep-alive\r\n");
    ustring_view_append_STR(&body, "Upgrade-Insecure-Requests: 1\r\n");
    ustring_view_append_STR(&body, "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) " \
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n");
    ustring_view_append_STR(&body, "\r\n");
    printf("%.*s\n", body.length, body.base.data);
    return body; 
}

static void on_write(uv_write_t *write, int status) {
    if (status < 0) {
        fprintf(stderr, "write error %s\n", uv_err_name(status));
    }
    free(write);
}

static void on_alloc(uv_handle_t *handle, size_t suggested_size, uv_buf_t *buf) {
    buf->base = malloc(suggested_size);
    buf->len = suggested_size;
}

static void on_close(uv_handle_t *handle) {
    free(handle);
    printf("closed.\n");
}

static bool try_parse_response_header(net_response_t *response, ustring header) {
    if (header.length < 12) return false;
    if (strncmp(header.data, "HTTP/1.1 ", 9) != 0) return false;

    ustring status_code = ustring_range(header.data + 9, 3);
    response->status = atoi(status_code.data);

    // find content length length
    const char *length = strstr(header.data, "Content-Length: ");
    if (length == NULL) return false;
    length += 16;

    // find content length end
    const char *end = strstr(length, "\r\n");
    if (end == NULL) return false;

    // fined the end of header
    const char *header_end = strstr(header.data, "\r\n\r\n");
    if (header_end == NULL) return false;

    u32 header_length = header_end - header.data + 4;
    response->header_length = header_length;

    // parse content length
    ustring content_length = ustring_range((i8*)header.data + (length - header.data), end - length);
    response->content_length = atoi(content_length.data);
    response->headr_parsed = true;
    return true;
}

static void parse_response(net_response_t *response) {
    response->header = (ustring_view) {
        .base = ustring_range(response->data.data, response->header_length),
        .start = 0,
        .length = response->header_length
    };
    response->body = (ustring_view) {
        .base = ustring_range(response->data.data + response->header_length, response->content_length),
        .start = 0,
        .length = response->content_length
    };
}

static bool body_read_end(net_response_t *response) {
    return response->data.length >= response->content_length + response->header_length;
}

static void on_read(uv_stream_t *stream, ssize_t nread, const uv_buf_t *buf) {
    net_session_t *session = stream->data;
    if (nread < 0) {
        if (nread != UV_EOF) {
            fprintf(stderr, "read error %s\n", uv_err_name(nread));
        }
        session->cb(session->request, session->response);
        uv_close((uv_handle_t *)stream, on_close);
    } else if (nread > 0) {
        if (!session->response.headr_parsed) {
            ustring header = ustring_range(buf->base, nread);
            try_parse_response_header(&session->response, header);
        }

        udata_append_raw(&session->response.data, buf->base, nread);

        if (body_read_end(&session->response)) {
            parse_response(&session->response);
            session->cb(session->request, session->response);
            uv_read_stop(stream);
            uv_close((uv_handle_t *)stream, on_close);
        }
    }

    free(buf->base);
}

static void on_connect(uv_connect_t *conn, int status) {
    if (status < 0) {
        fprintf(stderr, "connection error %s\n", uv_err_name(status));
        return;
    }
    printf("connected to server.\n");

    net_session_t *session = conn->data;
    uv_stream_t *stream = conn->handle;
    stream->data = session;

    uv_write_t *write_req = malloc(sizeof(uv_write_t));
    write_req->data = session;

    ustring_view body = net_url_to_req_body(session->request.url);
    uv_buf_t buf = uv_buf_init((char *)body.base.data, body.base.length);
    uv_write(write_req, stream, &buf, 1, on_write);
    uv_read_start(stream, on_alloc, on_read);
}

int net_download_async(url_t url, url_session_cb cb) {
    uv_getaddrinfo_t resolver;
    ustring host = ustring_view_to_new_ustring(&url.host);
    ustring port = ustring_view_to_new_ustring(&url.port);

    int r = uv_getaddrinfo(uv_default_loop(), &resolver, NULL, host.data, port.data, NULL);
    ustring_free(&host);
    ustring_free(&port);

    if (r) {
        fprintf(stderr, "getaddrinfo call error %s\n", uv_err_name(r));
        return 1;
    }

    struct sockaddr_in addr = *((struct sockaddr_in *)resolver.addrinfo->ai_addr);
    uv_freeaddrinfo(resolver.addrinfo);

    net_session_t *session = malloc(sizeof(net_session_t));
    session->response.data = (udata_t){.data = NULL, .length = 0};
    session->response.error = ustring_view_STR("");
    session->response.headr_parsed = false;
    session->cb = cb;

    uv_tcp_init(uv_default_loop(), &session->request.socket);
    session->request.url = url;

    uv_connect_t *connect = malloc(sizeof(uv_connect_t));
    connect->data = session;
    uv_tcp_connect(connect, &session->request.socket, (const struct sockaddr *)&addr, on_connect);
    return 0;
}