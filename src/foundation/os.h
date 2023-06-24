#ifndef _os_h_
#define _os_h_

#include "global.h"
#include "allocator.h"
#include "types.h"

typedef struct file_o {
    u64 handle;
    bool valid;
    MACRO_PAD(7);
} file_o;

typedef struct file_time_o {
    u64 opaque;
} file_time_o;

typedef struct os_file_io_api {
    file_o (*open_input)(const char *path);
    file_o (*open_output)(const char *path);
    file_o (*open_append)(const char *path);
    void (*set_position)(file_o file, u64 position);
    u64 (*size)(file_o file);
    i64 (*read)(file_o file, void *buffer, u64 size);
    bool (*write)(file_o file, const void *buffer, u64 size);
    i64 (*read_at)(file_o file, u64 offset, void *buffer, u64 size);
    bool (*write_at)(file_o file, u64 offset, const void *buffer, u64 size);
    void (*set_last_modified_time)(file_o file, file_time_o time);
    void (*close)(file_o file);
} os_file_io_api;

typedef struct file_stat_t {
    bool exists;
    bool is_directory;
    MACRO_PAD(6);
    struct file_time_o last_modified_time;
    u64 size;
} file_stat_t;

typedef struct file_system_watcher_t {
    u64 opaque;
} file_system_watcher_t;

typedef struct file_system_detailed_watcher_t file_system_detailed_watcher_t;

enum file_system_event_type_t {
    FILE_SYSTEM_EVENT_TYPE_ADDED,
    FILE_SYSTEM_EVENT_TYPE_DELETED,
    FILE_SYSTEM_EVENT_TYPE_MODIFIED,
};

typedef struct file_system_change_t {
    const char *relative_path;
    enum file_system_event_type_t type;
    MACRO_PAD(4);
} file_system_change_t;

typedef struct os_file_system_api {
    file_stat_t (*stat)(const char *path);

    bool (*make_directory)(const char *path);
    bool (*remove_file)(const char *path);
    bool (*remove_directory)(const char *path);
    bool (*rename)(const char *old_name, const char *new_name);
    bool (*copy_file)(const char *from, const char *to);
    const char *(*getcwd)(allocator_api *allocator);
} os_file_system_api;

typedef struct socket_o {
    u64 handle;
    bool valid;
    MACRO_PAD(7);
} socket_o;

typedef struct socket_address_t {
    union {
        u32 ip;
        u8 ip_bytes[4];
    };
    u32 port;
} socket_address_t;

#define SOCKET_IP_LOCALHOST {1, 0, 0, 127}
#define SOCKET_IP_BROADCAST {255, 255, 255, 255}

enum os_socket_type {
    OS_SOCKET_TYPE_TCP = 1,
    OS_SOCKET_TYPE_UDP = 2,
};

enum os_socket_error {
    OS_SOCKET_ERROR_WOULD_BLOCK = -1000,
    OS_SOCKET_ERROR_CLOSED = -1001,
    OS_SOCKET_ERROR_INVALID = -1002,
    OS_SOCKET_ERROR_UNKNOWN = -1,
};

enum os_socket_connect {
    OS_SOCKET_CONNECT_PENDING,
    OS_SOCKET_CONNECT_ESTABLISHED,
    OS_SOCKET_CONNECT_FAILED,
};

enum os_socket_getaddrinfo {
    OS_SOCKET_GETADDRINFO_PENDING,
    OS_SOCKET_GETADDRINFO_SUCCESS,
    OS_SOCKET_GETADDRINFO_FAILED,
};

enum os_socket_option {
    OS_SOCKET_OPTION_NODELAY,
    OS_SOCKET_OPTION_NONBLOCK,
};

typedef struct os_socket_api {
    void (*init)(void);
    void (*shutdown)(void);
    socket_o (*socket)(enum os_socket_type type);
    void (*set_option)(socket_o socket, enum os_socket_option option, bool enabled);
    bool (*bind)(socket_o socket, socket_address_t address);
    bool (*getsockname)(socket_o socket, socket_address_t *address);
    bool (*listen)(socket_o socket, u32 queue_size);
    socket_o (*accept)(socket_o socket, socket_address_t *address);
    enum os_socket_connect (*connect)(socket_o socket, socket_address_t target);
    i32 (*send)(socket_o socket, const void *buffer, u32 size);
    i32 (*recv)(socket_o socket, void *buffer, u32 size);
    i32 (*sendto)(socket_o socket, const void *buffer, u32 size, socket_address_t target);
    i32 (*recvfrom)(socket_o socket, void *buffer, u32 size, socket_address_t *source);
    bool (*close)(socket_o socket);

    u32 (*getaddrinfo)(const char *host, const char *service, socket_address_t *addresses, u32 size);
    // void *(*getaddrinfo_async)(const char *host, const char *service);
    enum os_socket_getaddrinfo (*getaddrinfo_result)(void *request, socket_address_t *addresses, u32 size);
} os_socket_api;

enum os_thread_priority {
    OS_THREAD_PRIORITY_LOWEST,
    OS_THREAD_PRIORITY_LOW,
    OS_THREAD_PRIORITY_NORMAL,
    OS_THREAD_PRIORITY_HIGH,
    OS_THREAD_PRIORITY_HIGHEST,
    OS_THREAD_PRIORITY_TIME_CRITICAL,
};

typedef void thread_entry_f(void *user_data);
typedef void fiber_entry_f(void *user_data);

typedef struct critical_section_o {
#if defined(OS_WINDOWS)
    u64 opaque;
#else
    u64 opaque[8];
#endif
} critical_section_o;

typedef struct semaphore_o {
    u64 opaque;
} semaphore_o;

typedef struct thread_o {
    u64 opaque[2];
} thread_o;

typedef struct fiber_o {
    u64 opaque;
} fiber_o;

typedef struct os_thread_api {
    // critical sections
    void (*create_critical_section)(critical_section_o *cs);
    void (*enter_critical_section)(critical_section_o *cs);
    void (*leave_critical_section)(critical_section_o *cs);
    void (*destroy_critical_section)(critical_section_o *cs);

    // semaphores
    semaphore_o (*semaphore_create)(u32 initial_count);
    void (*semaphore_add)(semaphore_o sem, u32 count);
    void (*semaphore_wait)(semaphore_o sem);
    bool (*semaphore_poll)(semaphore_o sem);
    void (*semaphore_destroy)(semaphore_o sem);

    // threads
    u32 (*thread_id)(void);
    u32 (*processor_id)(void);
    thread_o (*create_thread)(thread_entry_f *entry, void *user_data, u32 stack_size, const char *name);
    void (*thread_set_priority)(thread_o thread, enum os_thread_priority priority);
    void (*thread_wait)(thread_o thread);
    u32 (*thread_id_from_handle)(thread_o thread);

    // fibers
    fiber_o (*thread_to_fiber)(void *user_data);
    void (*fiber_to_thread)(void);
    fiber_o (*create_fiber)(fiber_entry_f *entry, void *user_data, u32 stack_size);
    void (*fiber_destroy)(fiber_o fiber);
    void (*fiber_switch)(fiber_o fiber);
    void *(*fiber_user_data)(void);

    void (*yield_processor)(void);
    void (*sleep)(double seconds);
} os_thread_api;

typedef struct os_system_api {
    void (*open_url)(const char *url);
    bool (*open_file)(const char *file);
} os_system_api;

typedef struct os_time_api {
    clock_o (*now)(void);
    f64 (*delta)(clock_o from, clock_o to);
    clock_o (*add)(clock_o from, f64 delta);

    file_time_o (*file_time_now)(void);
    f64 (*file_time_delta)(file_time_o from, file_time_o to);
} os_time_api;

struct os_api {
    struct os_file_io_api *file_io;
    struct os_file_system_api *file_system;
    struct os_socket_api *socket;
    struct os_thread_api *thread;
    struct os_time_api *time;
    struct os_system_api *system;
};

extern struct os_api *os_api;

#endif // _os_h_
