#include "foundation/network.h"
#include "foundation/global.h"
#include "foundation/logger.h"
#include "foundation/ustring.h"

#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#if defined(_WIN32)
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#else
#include <netdb.h>
#include <pthread.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>
#endif

typedef struct net_session_t {
    net_request_t request;
    net_response_t response;
    url_session_cb cb;
    void *userdata;
    ustring url_buf;
} net_session_t;

typedef struct net_completion_t {
    net_session_t *session;
    struct net_completion_t *next;
} net_completion_t;

#if defined(_WIN32)
static CRITICAL_SECTION g_net_lock;
static INIT_ONCE g_net_init_once = INIT_ONCE_STATIC_INIT;

static BOOL CALLBACK net_init_once(PINIT_ONCE once, PVOID param, PVOID *context) {
    (void)once;
    (void)param;
    (void)context;

    WSADATA wsa_data;
    WSAStartup(MAKEWORD(2, 2), &wsa_data);
    InitializeCriticalSection(&g_net_lock);
    return TRUE;
}

static void net_lock(void) {
    InitOnceExecuteOnce(&g_net_init_once, net_init_once, NULL, NULL);
    EnterCriticalSection(&g_net_lock);
}

static void net_unlock(void) {
    LeaveCriticalSection(&g_net_lock);
}

static void net_close_socket(int socket_fd) {
    if (socket_fd >= 0) {
        closesocket((SOCKET)socket_fd);
    }
}

static const char *net_last_error_string(void) {
    static char buffer[64];
    _snprintf(buffer, sizeof(buffer), "winsock error %d", WSAGetLastError());
    return buffer;
}
#else
static pthread_mutex_t g_net_lock = PTHREAD_MUTEX_INITIALIZER;

static void net_lock(void) {
    pthread_mutex_lock(&g_net_lock);
}

static void net_unlock(void) {
    pthread_mutex_unlock(&g_net_lock);
}

static void net_close_socket(int socket_fd) {
    if (socket_fd >= 0) {
        close(socket_fd);
    }
}

static const char *net_last_error_string(void) {
    return strerror(errno);
}
#endif

static net_completion_t *g_completion_head = NULL;
static net_completion_t *g_completion_tail = NULL;

static void net_set_error(net_response_t *response, const char *message) {
    ustring_view_free(&response->error);
    response->error = ustring_view_STR(message != NULL ? message : "network error");
}

static void net_queue_completion(net_session_t *session) {
    net_completion_t *completion = malloc(sizeof(net_completion_t));
    completion->session = session;
    completion->next = NULL;

    net_lock();
    if (g_completion_tail != NULL) {
        g_completion_tail->next = completion;
    } else {
        g_completion_head = completion;
    }
    g_completion_tail = completion;
    net_unlock();
}

static net_completion_t *net_pop_completion(void) {
    net_lock();
    net_completion_t *completion = g_completion_head;
    if (completion != NULL) {
        g_completion_head = completion->next;
        if (g_completion_head == NULL) {
            g_completion_tail = NULL;
        }
    }
    net_unlock();
    return completion;
}

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
    body.port = port_colon ? atoi(data + port_colon + 1) : 80;
    body.path = ustring_view_range(&url, slash, question);
    body.query = ustring_view_range(&url, question, terminate);
    return body;
}

void url_dump(url_t url) {
    ULOG_INFO("url_t {");
    ULOG_INFO_FMT("  valid: {d}", url.valid);
    ULOG_INFO_FMT("  protocol: {v}", url.protocol);
    ULOG_INFO_FMT("  host: {v}", url.host);
    ULOG_INFO_FMT("  port: {d}", url.port);
    ULOG_INFO_FMT("  path: {v}", url.path);
    ULOG_INFO_FMT("  query: {v}", url.query);
    ULOG_INFO("}");
}

static ustring_view net_url_to_req_body(url_t url) {
    ustring_view body = ustring_view_STR("");
    ustring_view_append_STR(&body, "GET ");
    ustring_view_append_ustring_view(&body, &url.path);
    if (url.query.length > 0) {
        ustring_view_append_STR(&body, "?");
        ustring_view_append_ustring_view(&body, &url.query);
    }
    ustring_view_append_STR(&body, " HTTP/1.1\r\n");
    ustring_view_append_STR(&body, "Accept: text/javascript,application/xhtml+xml,application/xml;q=0.9,image/avif,image/"
                                   "webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\n");
    ustring_view_append_STR(&body, "Accept-Encoding: gzip, deflate, br, zstd\r\n");
    ustring_view_append_STR(&body, "Accept-Language: en,zh-CN;q=0.9,zh;q=0.8\r\n");
    ustring_view_append_STR(&body, "Host: ");
    ustring_view_append_ustring_view(&body, &url.host);
    if (url.port != 80 && url.port != 443) {
        char port_str[16];
        snprintf(port_str, sizeof(port_str), ":%d", url.port);
        ustring_view_append_STR(&body, port_str);
    }
    ustring_view_append_STR(&body, "\r\n");
    ustring_view_append_STR(&body, "Connection: close\r\n");
    ustring_view_append_STR(&body, "Upgrade-Insecure-Requests: 1\r\n");
    ustring_view_append_STR(&body, "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                   "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n");
    ustring_view_append_STR(&body, "\r\n");
    return body;
}

static bool try_parse_response_header(net_response_t *response, ustring header) {
    ustring_view header_view = ustring_view_from_ustring(header);
    ustring_view content_length_keyword = ustring_view_STR("Content-Length: ");
    i32 index;
    const char *header_end;

    if (header.length < 12) {
        ustring_view_free(&content_length_keyword);
        return false;
    }
    if (strncmp(header.data, "HTTP/1.1 ", 9) != 0 && strncmp(header.data, "HTTP/1.0 ", 9) != 0) {
        ustring_view_free(&content_length_keyword);
        return false;
    }

    response->status = (u32)atoi(header.data + 9);

    header_end = strstr(header.data, "\r\n\r\n");
    if (header_end == NULL) {
        ustring_view_free(&content_length_keyword);
        return false;
    }

    response->header_length = (u32)(header_end - header.data + 4);
    index = ustring_view_find_ignore_case(&header_view, &content_length_keyword);
    if (index != -1) {
        response->content_length = (u32)atoi(header.data + index + 16);
    }

    ustring_view_free(&content_length_keyword);
    response->header_parsed = true;
    return true;
}

static void parse_response(net_response_t *response) {
    response->header = (ustring_view){
        .base = ustring_range(response->data.data, response->header_length), .start = 0, .length = response->header_length};
    response->body =
        (ustring_view){.base = ustring_range(response->data.data + response->header_length, response->content_length), .start = 0, .length = response->content_length};
}

static bool body_read_end(net_response_t *response) {
    if (response->content_length == 0) {
        return response->header_parsed && response->data.length >= response->header_length;
    }
    return response->data.length >= response->content_length + response->header_length;
}

static void net_finalize_response(net_session_t *session) {
    if (!session->response.header_parsed) {
        session->response.header_parsed = try_parse_response_header(
            &session->response,
            ustring_range(session->response.data.data, session->response.data.length));
    }

    if (!session->response.header_parsed) {
        net_set_error(&session->response, "invalid HTTP response");
        return;
    }

    if (session->response.content_length == 0 && session->response.data.length >= session->response.header_length) {
        session->response.content_length = session->response.data.length - session->response.header_length;
    }

    if (!body_read_end(&session->response)) {
        net_set_error(&session->response, "incomplete HTTP response");
        return;
    }

    parse_response(&session->response);
}

static int net_open_socket(net_session_t *session) {
    char port_str[16];
    struct addrinfo hints;
    struct addrinfo *result = NULL;
    int socket_fd = -1;
    ustring host = ustring_view_to_new_ustring(&session->request.url.host);

    snprintf(port_str, sizeof(port_str), "%d", session->request.url.port);
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;

    if (getaddrinfo(host.data, port_str, &hints, &result) != 0) {
        net_set_error(&session->response, "failed to resolve host");
        ustring_free(&host);
        return -1;
    }
    ustring_free(&host);

    for (struct addrinfo *addr = result; addr != NULL; addr = addr->ai_next) {
        socket_fd = (int)socket(addr->ai_family, addr->ai_socktype, addr->ai_protocol);
        if (socket_fd < 0) {
            continue;
        }
        if (connect(socket_fd, addr->ai_addr, (socklen_t)addr->ai_addrlen) == 0) {
            break;
        }
        net_close_socket(socket_fd);
        socket_fd = -1;
    }

    freeaddrinfo(result);

    if (socket_fd < 0) {
        net_set_error(&session->response, net_last_error_string());
        return -1;
    }

    session->request.socket_fd = socket_fd;
    return 0;
}

static int net_send_request(net_session_t *session) {
    ustring_view body = net_url_to_req_body(session->request.url);
    const char *cursor = body.base.data + body.start;
    u32 remaining = body.length;

    while (remaining > 0) {
#if defined(_WIN32)
        int sent = send((SOCKET)session->request.socket_fd, cursor, (int)remaining, 0);
#else
        ssize_t sent = send(session->request.socket_fd, cursor, remaining, 0);
#endif
        if (sent <= 0) {
            ustring_view_free(&body);
            net_set_error(&session->response, net_last_error_string());
            return -1;
        }
        cursor += sent;
        remaining -= (u32)sent;
    }

    ustring_view_free(&body);
    return 0;
}

static int net_read_response(net_session_t *session) {
    char buffer[8192];

    for (;;) {
#if defined(_WIN32)
        int received = recv((SOCKET)session->request.socket_fd, buffer, (int)sizeof(buffer), 0);
#else
        ssize_t received = recv(session->request.socket_fd, buffer, sizeof(buffer), 0);
#endif
        if (received == 0) {
            break;
        }
        if (received < 0) {
            net_set_error(&session->response, net_last_error_string());
            return -1;
        }
        udata_append_raw(&session->response.data, buffer, (u32)received);
    }

    net_finalize_response(session);
    return session->response.error.length > 0 ? -1 : 0;
}

static void net_session_run(net_session_t *session) {
    if (net_open_socket(session) == 0 && net_send_request(session) == 0) {
        net_read_response(session);
    }

    net_close_socket(session->request.socket_fd);
    session->request.socket_fd = -1;
    net_queue_completion(session);
}

#if defined(_WIN32)
static DWORD WINAPI net_worker_thread(LPVOID param) {
    net_session_t *session = (net_session_t *)param;
    net_session_run(session);
    return 0;
}
#else
static void *net_worker_thread(void *param) {
    net_session_t *session = (net_session_t *)param;
    net_session_run(session);
    return NULL;
}
#endif

int net_download_async(url_t url, url_session_cb cb, void *userdata) {
    ustring url_copy = ustring_view_to_new_ustring(&url.url);
    ustring_view url_view = ustring_view_from_ustring(url_copy);
    url_t url_owned = url_parse(url_view);

    if (!url_owned.valid) {
        ustring_free(&url_copy);
        return -1;
    }

    net_session_t *session = malloc(sizeof(net_session_t));
    memset(session, 0, sizeof(*session));
    session->request.socket_fd = -1;
    session->request.url = url_owned;
    session->response.data = (udata){.data = NULL, .length = 0};
    session->response.error = ustring_view_STR("");
    session->response.header_parsed = false;
    session->cb = cb;
    session->userdata = userdata;
    session->url_buf = url_copy;

#if defined(_WIN32)
    HANDLE thread = CreateThread(NULL, 0, net_worker_thread, session, 0, NULL);
    if (thread == NULL) {
        ustring_view_free(&session->response.error);
        ustring_free(&session->url_buf);
        free(session);
        return -1;
    }
    CloseHandle(thread);
#else
    pthread_t thread;
    if (pthread_create(&thread, NULL, net_worker_thread, session) != 0) {
        ustring_view_free(&session->response.error);
        ustring_free(&session->url_buf);
        free(session);
        return -1;
    }
    pthread_detach(thread);
#endif

    return 0;
}

void net_poll(void) {
    net_completion_t *completion;
    while ((completion = net_pop_completion()) != NULL) {
        net_session_t *session = completion->session;
        session->cb(session->request, session->response, session->userdata);
        udata_free(&session->response.data);
        ustring_view_free(&session->response.error);
        ustring_free(&session->url_buf);
        free(session);
        free(completion);
    }
}
