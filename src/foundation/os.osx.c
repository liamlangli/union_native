#if defined(OS_OSX)

#include "os.h"
#include "array.inl"
#include "allocator.h"

#include <errno.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <stdio.h>
#include <stdlib.h>
#include <strings.h>
#include <sys/file.h>
#include <sys/mman.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include <time.h>
#include <assert.h>

#pragma region File

static file_o file_io_open_input(const char *path) {
    const int h = open(path, O_RDONLY);
    const int lock = flock(h, LOCK_SH | LOCK_NB);
    return (file_o){ .handle = h, .valid = h != -1 && lock == 0 };
}

static file_o file_io_open_output(const char *path) {
    const int h = open(path, O_CREAT | O_RDWR | O_TRUNC, 0777);
    const int lock = flock(h, LOCK_EX | LOCK_NB);
    return (file_o){ .handle = h, .valid = h != -1 && lock == 0 };
}

static file_o file_io_open_append(const char *path) {
    const int h = open(path, O_CREAT | O_RDWR, 0777);
    const int lock = flock(h, LOCK_EX | LOCK_NB);
    return (file_o){ .handle = h, .valid = h != -1 && lock == 0 };
}

static void file_io_set_position(file_o file, u64 position) {
    if (!file.valid)
        return;
    lseek((i32)file.handle, (i64)position, SEEK_SET);
}

static u64 file_io_size(file_o file) {
    if (!file.valid)
        return 0;
    struct stat buf = { 0 };
    fstat((i32)file.handle, &buf);
    return (u64)buf.st_size;
}

static i64 file_io_read(file_o file, void *buffer, u64 size) {
    if (!file.valid)
        return -1;
    return (i64)read((i32)file.handle, buffer, size);
}

static bool file_io_write(file_o file, const void *buffer, u64 size) {
    if (!file.valid)
        return false;
    const i64 res = (i64)write((i32)file.handle, buffer, size) == (i64)size;
    assert((u64)res == size || res < 0);
    return res >= 0;
}

static i64 file_io_read_at(file_o file, u64 offset, void *buffer, u64 size) {
    if (!file.valid)
        return -1;
    return (i64)pread((i32)file.handle, buffer, size, offset);
}

static bool file_io_write_at(file_o file, u64 offset, const void *buffer, u64 size) {
    if (!file.valid)
        return false;
    const i64 res = (i64)pwrite((i32)file.handle, buffer, size, offset) == (i64)size;
    assert((u64)res == size || res < 0);
    return res >= 0;
}

static void file_io_set_last_modified_time(file_o file, struct file_time_o time) {
    if (!file.valid)
        return;
    struct timespec tv = { .tv_sec = time.opaque };
    struct timespec times[2] = { tv, tv };
    futimens((i32)file.handle, times);
}

static void file_io_close(file_o file) {
    if (!file.valid)
        return;
    close((i32)file.handle);
}

static struct os_file_io_api file_io = {
    .open_input = file_io_open_input,
    .open_output = file_io_open_output,
    .open_append = file_io_open_append,
    .set_position = file_io_set_position,
    .size = file_io_size,
    .read = file_io_read,
    .write = file_io_write,
    .read_at = file_io_read_at,
    .write_at = file_io_write_at,
    .set_last_modified_time = file_io_set_last_modified_time,
    .close = file_io_close,
};

#pragma endregion File

#pragma region File System

static file_stat_t file_system_stat(const char *path) {
    struct stat s;
    if (stat(path, &s)) {
        file_stat_t res = { .exists = false };
        return res;
    }
    return (file_stat_t){
        .exists = S_ISREG(s.st_mode) || S_ISDIR(s.st_mode),
        .is_directory = S_ISDIR(s.st_mode),
        .last_modified_time.opaque = (u64)s.st_mtimespec.tv_sec,
        .size = (u64)s.st_size
    };
}

static bool read_file(const char *path, void **buffer, u64 *size)
{
    file_stat_t stat = file_system_stat(path);
    if (!stat.exists || stat.is_directory)
        return false;

    char* source = malloc(stat.size);
    file_o file = file_io_open_input(path);
    file_io_read(file, source, stat.size);

    *buffer = source;
    *size = stat.size;
    return true;
}

static struct os_file_system_api file_system = {
    .stat = &file_system_stat,
    .read_file = &read_file,
};

#pragma region Socket

static i32 to_socket(socket_o opaque) {
    return opaque.valid ? opaque.handle : -1;
}

static socket_o socket_to_opaque(i32 handle) {
    return (socket_o){ .handle = handle, .valid = handle != -1 };
}

static struct sockaddr_in to_sockaddr_in(socket_address_t addr) {
    struct sockaddr_in sin = {
        .sin_len = sizeof(sin),
        .sin_family = AF_INET,
        .sin_port = htons(addr.port),
        .sin_addr.s_addr = htonl(addr.ip)
    };
    return sin;
}

static socket_address_t to_socket_address(struct sockaddr_in sin) {
    socket_address_t addr;
    addr.port = ntohs(sin.sin_port);
    addr.ip = ntohl(sin.sin_addr.s_addr);
    return addr;
}

static void set_default_socket_options(i32 s) {
    if (s == -1) return;
    setsockopt(s, IPPROTO_TCP, TCP_NODELAY, (char *)(i32[]){ 1 }, sizeof(i32));
    setsockopt(s, SOL_SOCKET, SO_REUSEADDR, (char *)(i32[]){ 1 }, sizeof(i32));
    setsockopt(s, SOL_SOCKET, SO_BROADCAST, (char *)(i32[]){ 1 }, sizeof(i32));
    fcntl(s, F_SETFL, O_NONBLOCK);
}

static void socket_init(void) {}

static void socket_shutdown(void) {}

static socket_o socket_socket(enum os_socket_type type) {
    const i32 internal_type = type == OS_SOCKET_TYPE_UDP ? SOCK_DGRAM : SOCK_STREAM;
    i32 s = socket(AF_INET, internal_type, 0);
    set_default_socket_options(s);
    return socket_to_opaque(s);
}

static void socket_set_option(socket_o socket, enum os_socket_option option, bool enabled) {
    const i32 s = to_socket(socket);
    switch (option) {
        case OS_SOCKET_OPTION_NODELAY:
            setsockopt(s, IPPROTO_TCP, TCP_NODELAY, (char *)(i32[]){ enabled  ? 1 : 0}, sizeof(i32));
            break;
        case OS_SOCKET_OPTION_NONBLOCK: {
            const i32 flags = fcntl(s, F_GETFL);
            fcntl(s, F_SETFL, enabled ? (flags | O_NONBLOCK) : (flags & ~O_NONBLOCK));
            break;
        }
    }
}

static bool socket_bind(socket_o socket, socket_address_t address) {
    if (!socket.valid)
        return false;
    struct sockaddr_in addr = to_sockaddr_in(address);
    return bind(to_socket(socket), (struct sockaddr *)&addr, sizeof(addr)) == 0;
}

static bool socket_getsockname(socket_o socket, socket_address_t *address) {
    if (!socket.valid)
        return false;
    struct sockaddr_in addr;
    u32 len = sizeof(addr);
    i32 res = getsockname(to_socket(socket), (struct sockaddr *)&addr, &len);
    *address = to_socket_address(addr);
    return res == 0;
}

static i32 errmap(ssize_t e) {
    if (e > 0)
        return (i32)e;
    if (e == 0)
        return OS_SOCKET_ERROR_CLOSED;
    if (errno == EWOULDBLOCK || errno == EAGAIN)
        return OS_SOCKET_ERROR_WOULD_BLOCK;
    return OS_SOCKET_ERROR_UNKNOWN;
}

static i32 socket_send(socket_o socket, const void *buffer, u32 size) {
    if (!socket.valid)
        return OS_SOCKET_ERROR_INVALID;
    return errmap(send(to_socket(socket), buffer, size, 0));
}

static i32 socket_sendto(socket_o socket, const void *buffer, u32 size, socket_address_t target) {
    if (!socket.valid)
        return OS_SOCKET_ERROR_INVALID;
    struct sockaddr_in addr = to_sockaddr_in(target);
    return errmap(sendto(to_socket(socket), buffer, size, 0, (struct sockaddr *)&addr, sizeof(addr)));
}

static i32 socket_recv(socket_o socket, void *buffer, u32 size) {
    if (!socket.valid)
        return OS_SOCKET_ERROR_INVALID;
    return errmap(recv(to_socket(socket), buffer, size, 0));
}

static i32 socket_recvfrom(socket_o socket, void *buffer, u32 size, socket_address_t *source) {
    if (!socket.valid)
        return OS_SOCKET_ERROR_INVALID;
    struct sockaddr_in addr = { 0 };
    u32 len = sizeof(addr);

    ssize_t result = recvfrom(to_socket(socket), buffer, size, 0, (struct sockaddr *)&addr, &len);
    if (result > 0)
        *source = to_socket_address(addr);
    return errmap(result);
}

static bool socket_listen(socket_o socket, u32 queue_size) {
    if (!socket.valid)
        return false;
    return listen(to_socket(socket), queue_size) == 0;
}

static socket_o socket_accept(socket_o socket, socket_address_t *address) {
    if (!socket.valid)
        return (socket_o){ 0 };
    struct sockaddr_in addr = { 0 };
    u32 len = sizeof(addr);

    i32 s = accept(to_socket(socket), (struct sockaddr *)&addr, &len);
    set_default_socket_options(s);
    if (s > 0)
        *address = to_socket_address(addr);
    return socket_to_opaque(s);
}

static enum os_socket_connect socket_connect(socket_o socket, socket_address_t target) {
    if (!socket.valid)
        return OS_SOCKET_CONNECT_FAILED;

    struct sockaddr_in addr = to_sockaddr_in(target);
    const i32 res = connect(to_socket(socket), (struct sockaddr *)&addr, sizeof(addr));

    if (res == 0)
        return OS_SOCKET_CONNECT_ESTABLISHED;

    int err = errno;
    if (err == EINVAL || err == EWOULDBLOCK || err == EALREADY || err == EINPROGRESS)
        return OS_SOCKET_CONNECT_PENDING;

    if (err == EISCONN)
        return OS_SOCKET_CONNECT_ESTABLISHED;

    if (err == ECONNREFUSED || err == ENETUNREACH || err == ETIMEDOUT)
        return OS_SOCKET_CONNECT_FAILED;

    return OS_SOCKET_CONNECT_FAILED;
}

static bool socket_close(socket_o socket) {
    if (!socket.valid)
        return false;
    return close(to_socket(socket)) == 0;
}

#include <netdb.h>

static u32 socket_getaddrinfo(const char *host, const char *service, socket_address_t *addresses, u32 size) {
    struct addrinfo hints = { 0 };
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;

    struct addrinfo *result = NULL;
    const int res = getaddrinfo(host, service, &hints, &result);
    if (res != 0)
        return 0;

    u32 count = 0;
    for (struct addrinfo *ptr = result; ptr != NULL && count < size; ptr = ptr->ai_next) {
        struct sockaddr_in *addr = (struct sockaddr_in *)ptr->ai_addr;
        addresses[count++] = to_socket_address(*addr);
    }

    freeaddrinfo(result);
    return count;
}

struct getaddrinfo_async_query {
    allocator_api *allocator;
    char *host; // array
    char *service; // array
    struct socket_address_t *address; // array

    semaphore_o sem;
    thread_o thread;
};

static struct os_socket_api socket_api = {
    .init = socket_init,
    .shutdown = socket_shutdown,
    .socket = socket_socket,
    .set_option = socket_set_option,
    .bind = socket_bind,
    .getsockname = socket_getsockname,
    .listen = socket_listen,
    .accept = socket_accept,
    .connect = socket_connect,
    .send = socket_send,
    .recv = socket_recv,
    .sendto = socket_sendto,
    .recvfrom = socket_recvfrom,
    .close = socket_close,
    .getaddrinfo = socket_getaddrinfo,
};

#pragma endregion

#pragma region Thread

#include <mach/mach.h>
#include <mach/mach_traps.h>
#include <mach/semaphore.h>
#include <pthread.h>
#include <sched.h>

static void thread_create_critical_section(critical_section_o *cs) {
    assert(sizeof(pthread_mutex_t) <= sizeof(cs));
    i32 res = pthread_mutex_init((pthread_mutex_t *)cs, NULL);
    assert(res == 0);
}

static void thread_enter_critical_section(critical_section_o *cs) {
    i32 res = pthread_mutex_lock((pthread_mutex_t *)cs);
    assert(res == 0);
}

static void thread_leave_critical_section(critical_section_o *cs) {
    i32 res = pthread_mutex_unlock((pthread_mutex_t *)cs);
    assert(res == 0);
}

static void thread_destroy_critical_section(critical_section_o *cs) {
    i32 res = pthread_mutex_destroy((pthread_mutex_t *)cs);
    assert(res == 0);
}

static semaphore_o thread_create_semaphore(u32 initial_count) {
    semaphore_t sem;
    kern_return_t res = semaphore_create(mach_task_self(), &sem, SYNC_POLICY_FIFO, initial_count);
    assert(res == KERN_SUCCESS);

    semaphore_o sem_o = { 0 };
    assert(sizeof(sem_o) >= sizeof(sem));
    memcpy(&sem_o, &sem, sizeof(sem));
    return sem_o;
}

static void thread_semaphore_wait(semaphore_o sem_o) {
    semaphore_t sem;
    memcpy(&sem, &sem_o, sizeof(sem));

    kern_return_t res = semaphore_wait(sem);
    assert(res == KERN_SUCCESS);
}

static bool thread_semaphore_poll(semaphore_o sem_o) {
    semaphore_t sem;
    memcpy(&sem, &sem_o, sizeof(sem));
    mach_timespec_t timeout = { 0, 0 };
    return semaphore_timedwait(sem, timeout) != KERN_OPERATION_TIMED_OUT;
}

static void thread_destroy_semaphore(semaphore_o sem_o) {
    semaphore_t sem;
    memcpy(&sem, &sem_o, sizeof(sem));
    kern_return_t res = semaphore_destroy(mach_task_self(), sem);
    assert(res == KERN_SUCCESS);
}

struct thread_data_t {
    allocator_api *allocator;
    thread_entry_f *entry_point;
    void *user_data;
    const char *name;
};

static void *thread_entry(void *data) {
    struct thread_data_t *tdp = (struct thread_data_t *)data;
    struct thread_data_t td = *tdp;
    // free(tdp->allocator);
    td.entry_point(td.user_data);
    if (td.name)
        pthread_setname_np(td.name);
    return NULL;
}

static inline u32 mix(u32 h, u32 k) {
    const u32 m = 0x5bd1e995;
    const i32 r = 24;

    k *= m;
    k ^= k >> r;
    k *= m;

    h *= m;
    h ^= k;

    return h;
}

static u32 thread_thread_id(void) {
    pthread_t tid = pthread_self();
    u64 id;
    memcpy(&id, &tid, sizeof(id));
    return mix((u32)id, (u32)(id >> 32));
}

static u32 thread_processor_id(void) {
    // volatile u32 id = 0;
    // asm("mov $1 %%eax\n\t"
    //     "cpuid\n\t"
    //     "mov %%ebx, %0\n\t"
    //     : "=r"(id)
    //     :
    //     : "%eax", "%ebx", "%ecx", "%edx");
    // return (id & 0xff000000) >> 24;
    return 0; // TODO implement
}

static thread_o thread_create_thread(thread_entry_f *entry, void *user_data, u32 stack_size, const char *name) {
    struct thread_data_t *td = malloc(sizeof(struct thread_data_t));
    td->allocator = g_allocator;
    td->entry_point = entry;
    td->user_data = user_data;
    td->name = name;

    pthread_attr_t attr;
    pthread_attr_init(&attr);
    pthread_attr_setstacksize(&attr, stack_size);
    pthread_t thread;
    pthread_create(&thread, &attr, thread_entry, td);
    pthread_attr_destroy(&attr);

    thread_o thread_o = { 0 };
    assert(sizeof(thread_o) >= sizeof(thread));
    memcpy(&thread_o, &thread, sizeof(thread));
    return thread_o;
}

static void thread_set_thread_priority(thread_o thread, enum os_thread_priority priority) {
    // needs implementation
}

static void thread_wait_for_thread(thread_o thread) {
    pthread_t t;
    memcpy(&t, &thread, sizeof(t));
    int res = pthread_join(t, NULL);
    assert(res == 0);
}

static u32 thread_thread_id_from_thread_o(thread_o thread) {
    return mix((u32)thread.opaque[0], (u32)(thread.opaque[0] >> 32));
}

#define HAVE_SETJMP_H
#define HAVE_SIGALTSTACK

#include "libcoro.inl"

static critical_section_o fiber_cs = { 0 };
static critical_section_o nil_cs = { 0 };

enum { MAX_FIBERS = 1024 };
struct fiber_data_t {
    coro_context ctx;
    MACRO_PAD(4);
    fiber_entry_f *entry;
    void *user_data;
    MACRO_PAD(4);
    void *stack;
};

static struct fiber_data_t fibers[MAX_FIBERS];
static u32 num_fibers = 1;

static bool thread_fiber_key_inited = false;
static pthread_key_t thread_fiber_key;

static bool thread_main_fiber_key_inited;
static pthread_key_t thread_main_fiber_key;

static u32 thread_fiber(void) {
    return (u32)((char *)pthread_getspecific(thread_fiber_key) - (char *)0);
}

static void set_thread_fiber(u32 i) {
    if (!thread_fiber_key_inited) {
        pthread_key_create(&thread_fiber_key, NULL);
        thread_fiber_key_inited = true;
    }
    pthread_setspecific(thread_fiber_key, (char *)(uintptr_t)i);
}

static u32 thread_main_fiber(void) {
    return (u32)((char *)pthread_getspecific(thread_main_fiber_key) - (char *)0);
}

static void set_thread_main_fiber(u32 i) {
    if (!thread_main_fiber_key_inited) {
        pthread_key_create(&thread_main_fiber_key, NULL);
        thread_main_fiber_key_inited = true;
    }
    pthread_setspecific(thread_main_fiber_key, (char *)(uintptr_t)i);
}

static void *fiber_realloc(void *ptr, u64 old_size, u64 new_size) {
    // return realloc(ptr, new_size);
    return ptr; // TODO: implement
}


static fiber_o thread_convert_thread_to_fiber(void *user_data) {
    if (!memcmp(&fiber_cs, &nil_cs, sizeof(fiber_cs)))
        thread_create_critical_section(&fiber_cs);

    thread_enter_critical_section(&fiber_cs);
    u32 i = num_fibers++;
    struct fiber_data_t *fiber = fibers + i;
    memset(fiber, 0, sizeof(*fiber));
    fiber->user_data = user_data;
    coro_create(&fiber->ctx, NULL, NULL, NULL, 0);
    set_thread_fiber(i);
    set_thread_main_fiber(i);
    thread_leave_critical_section(&fiber_cs);

    fiber_o fiber_o = { i };
    return fiber_o;
}

static void thread_switch_to_fiber(fiber_o fiber_o);

static void thread_convert_fiber_to_thread(void) {
    if (thread_main_fiber() != thread_fiber())
        thread_switch_to_fiber((fiber_o){ thread_main_fiber() });
}

static fiber_o thread_create_fiber(fiber_entry_f *entry, void *user_data, u32 stack_size) {
    if (!memcmp(&fiber_cs, &nil_cs, sizeof(fiber_cs)))
        thread_create_critical_section(&fiber_cs);

    thread_enter_critical_section(&fiber_cs);
    u32 i = num_fibers++;
    struct fiber_data_t *fiber = fibers + i;
    memset(fiber, 0, sizeof(*fiber));
    fiber->entry = entry;
    fiber->user_data = user_data;
    fiber->stack = malloc(stack_size);
    coro_create(&fiber->ctx, entry, user_data, fiber->stack, stack_size);
    thread_leave_critical_section(&fiber_cs);

    fiber_o fiber_o = { i };
    return fiber_o;
}

static void thread_destroy_fiber(fiber_o fiber_o) {
    struct fiber_data_t *fiber = fibers + fiber_o.opaque;
    coro_destroy(&fiber->ctx);
}

static void thread_switch_to_fiber(fiber_o fiber_o) {
    u32 current_i = thread_fiber();
    u32 target_i = fiber_o.opaque;
    struct fiber_data_t *current = fibers + current_i;
    struct fiber_data_t *target = fibers + target_i;
    set_thread_fiber(target_i);
    coro_transfer(&current->ctx, &target->ctx);
}

static void *thread_fiber_user_data(void) {
    struct fiber_data_t *fiber = fibers + thread_fiber();
    return fiber->user_data;
}

static void thread_yield_processor(void) {
    sched_yield();
}

static void thread_sleep(double seconds) {
    usleep((u32)(seconds * 1e6 + 0.5));
}

static struct os_thread_api thread = {
    .create_critical_section = thread_create_critical_section,
    .enter_critical_section = thread_enter_critical_section,
    .leave_critical_section = thread_leave_critical_section,
    .destroy_critical_section = thread_destroy_critical_section,
    .semaphore_create = thread_create_semaphore,
    .semaphore_wait = thread_semaphore_wait,
    .semaphore_poll = thread_semaphore_poll,
    .semaphore_destroy = thread_destroy_semaphore,
    .create_thread = thread_create_thread,
    .thread_set_priority = thread_set_thread_priority,
    .thread_wait = thread_wait_for_thread,
    .thread_id = thread_thread_id,
    .processor_id = thread_processor_id,
    .thread_to_fiber = thread_convert_thread_to_fiber,
    .fiber_to_thread = thread_convert_fiber_to_thread,
    .create_fiber = thread_create_fiber,
    .fiber_destroy = thread_destroy_fiber,
    .fiber_switch = thread_switch_to_fiber,
    .fiber_user_data = thread_fiber_user_data,
    .yield_processor = thread_yield_processor,
    .sleep = thread_sleep,
};

#pragma endregion

#pragma region Time

#include <mach/mach_time.h>

static clock_o time_now(void) {
    clock_o time;
    time.opaque = mach_absolute_time();
    return time;
}

static f64 time_delta(clock_o from, clock_o to) {
    u64 delta = to.opaque - from.opaque;

    mach_timebase_info_data_t timebase;
    mach_timebase_info(&timebase);

    return (f64)delta * (f64)timebase.numer / (f64)timebase.denom / 1e9;
}

static clock_o time_add(clock_o from, f64 delta) {
    mach_timebase_info_data_t timebase;
    mach_timebase_info(&timebase);

    clock_o clock;
    clock.opaque = from.opaque + (u64)(delta * 1e9 * (f64)timebase.denom / (f64)timebase.numer);
    return clock;
}

static file_time_o time_file_time_now(void) {
    struct timespec now;
    clock_gettime(CLOCK_REALTIME, &now);
    return (file_time_o){ .opaque = (u64)now.tv_sec };
}

static f64 time_file_time_delta(file_time_o from, file_time_o to) {
    return (f64)(to.opaque - from.opaque);
}

static struct os_time_api time_api = {
    .now = time_now,
    .delta = time_delta,
    .add = time_add,
    .file_time_now = time_file_time_now,
    .file_time_delta = time_file_time_delta,
};

#pragma endregion

#pragma region API 

static struct os_api os = {
    .file_io = &file_io,
    .file_system = &file_system,
    .socket = &socket_api,
    .thread = &thread,
    .time = &time_api,
};

struct os_api *os_api = &os;

#pragma endregion

#endif
