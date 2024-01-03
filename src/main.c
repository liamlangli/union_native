#include "foundation/foundation.h"
#include "foundation/os.h"
#include "foundation/ustring.h"
#include "ui/ui.h"
#include "script/script.h"

#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#define GLFW_INCLUDE_ES3
#include <GLFW/glfw3.h>
#include <GLES3/gl3.h>

#define STB_DS_IMPLEMENTATION
#include <stb_ds.h>

#include <uv.h>

static ui_input_t source_input;
static ui_label_t copyright;
static ui_label_t fps_label;
static ui_label_t status_label;
static ui_scroll_view_t log_view;

static uv_fs_poll_t *file_watcher;

static ustring_view fps_str;
#define MAX_FPX_BITS 16
static ustring_view status_str;
#define MAX_STATUS_BITS 256
static ustring_view watched_file;

static bool invalid_script = false;
static bool ui_visible = true;

static void resize_callback(GLFWwindow *window, int width, int height) {
    script_context_t *ctx = script_context_share();
    glfwGetFramebufferSize(window, &ctx->framebuffer_width, &ctx->framebuffer_height);
    ctx->display_ratio = (f64)ctx->framebuffer_height / (f64)ctx->height;
    f32 ui_width = (f32)(width / ctx->ui_scale * ctx->display_ratio);
    f32 ui_height = (f32)(height / ctx->ui_scale * ctx->display_ratio);
    ctx->renderer.window_size.x = ui_width;
    ctx->renderer.window_size.y = ui_height;
    ctx->state.window_rect = (ui_rect){
        .x = 0.f,
        .y = 0.f,
        .w = ui_width,
        .h = ui_height
    };
    script_window_resize(width, height);
}

static void script_init(GLFWwindow *window, ustring_view uri);
static void on_local_script_changed(uv_fs_poll_t* handle, int status, const uv_stat_t* prev, const uv_stat_t* curr) {
    ustring_view uri = *(ustring_view *)handle->data;
    script_init(script_context_share()->window, uri);
}

static void on_remote_script_download(net_request_t request, net_response_t response) {
    LOG_INFO_FMT("download remote script: %s\n", request.url.url.base.data);
    LOG_INFO_FMT("status: %d\n", response.status);
    LOG_INFO_FMT("content_length: %d\n", response.content_length);
    //printf("response: %.*s\n", response.body.length, (const char *)response.body.base.data);
    invalid_script = script_eval(ustring_view_to_ustring(&response.body), request.url.url) != 0;
    script_context_t *ctx = script_context_share();
    GLFWwindow *window = ctx->window;
    glfwGetWindowSize(window, &ctx->width, &ctx->height);
    resize_callback(window, ctx->width, ctx->height);
}

static void script_init(GLFWwindow *window, ustring_view uri) {
    script_context_t *ctx = script_context_share();
    ctx->window = window;

    if (strncasecmp(uri.base.data, "http", 4) == 0) {
        url_t url = url_parse(uri);
        if (!url.valid) {
            LOG_WARNING_FMT("invalid url: %s\n", uri.base.data);
            return;
        }
        LOG_INFO_FMT("download remote script: %s\n", uri.base.data);
        url_dump(url);
        net_download_async(url, on_remote_script_download);
    } else {
        ustring content = io_read_file(uri);
        invalid_script = script_eval(content, uri) != 0;
        ustring_free(&content);

        // watch file change
        if (!ustring_view_equals(&watched_file, &uri) && !invalid_script) {
#if defined(OS_WINDOWS)
            if (file_watcher != NULL) {
                uv_fs_poll_stop(file_watcher);
                uv_run(uv_default_loop(), UV_RUN_NOWAIT);
                free(file_watcher);
            }
            watched_file = ustring_view_sub_view(&uri, 0, uri.length);
            file_watcher = malloc(sizeof(uv_fs_poll_t));
            uv_fs_poll_init(uv_default_loop(), file_watcher);
            file_watcher->data = &watched_file;
            uv_fs_poll_start(file_watcher, on_local_script_changed, watched_file.base.data, 1000);
#endif
        }
    }

    glfwGetWindowSize(window, &ctx->width, &ctx->height);
    resize_callback(window, ctx->width, ctx->height);
}

static void renderer_init(GLFWwindow* window, ustring_view uri) {
    ui_input_init(&source_input, uri);
    ui_label_init(&copyright, ustring_view_STR("@2023 union native"));
    ui_scroll_view_init(&log_view, 20);
    copyright.element.constraint.alignment = CENTER;
    copyright.element.constraint.margin.top = 10;
    copyright.scale = 0.7f;

    fps_str.base.data = malloc(MAX_FPX_BITS);
    memset((void*)fps_str.base.data, 0, MAX_FPX_BITS);
    fps_str.length = MAX_FPX_BITS;
    ui_label_init(&fps_label, fps_str);
    fps_label.element.constraint.alignment = TOP | LEFT;
    fps_label.element.constraint.margin.left = 4.f;
    fps_label.element.constraint.margin.top = 24.f;
    fps_label.scale = 0.7f;

    status_str.base.data = malloc(MAX_STATUS_BITS);
    memset((void*)status_str.base.data, 0, MAX_STATUS_BITS);
    status_str.length = MAX_STATUS_BITS;
    ui_label_init(&status_label, status_str);
    status_label.element.constraint.alignment = TOP | LEFT;
    status_label.element.constraint.margin.left = 4.f;
    status_label.element.constraint.margin.top = 4.f;
    status_label.scale = 0.7f;
}

#define STATUS_WIDTH 100.f
#define STATUS_HEIGHT 32.f

static void ui_render(GLFWwindow *window) {
    script_context_t *ctx = script_context_share();
    ui_state_t *state = &ctx->state;
    ui_renderer_t renderer = ctx->renderer;

    state->cursor_type = CURSOR_Default;
    ui_rect rect = ui_rect_shrink((ui_rect){.x = 0.f, .y = state->window_rect.h - 48.f, .w = state->window_rect.w, .h = 46.f}, 8.0f, 8.0f);
    if (ui_input(state, &source_input, ui_theme_share()->panel_0, rect, 0, 0)) {
        LOG_INFO_FMT("try load script: %s\n", source_input.label.text.base.data);
        script_init(window, source_input.label.text);
    }

    // rect = ui_rect_shrink((ui_rect){.x = 0, .y = state->window_rect.h - 22.f, .w = state->window_rect.w, .h = 22.f}, 8.0f, 8.0f);
    // ui_label(&state, &copyright, ui_theme_share()->text, rect, 0, 0);

    ui_rect status_rect = (ui_rect){.x = state->window_rect.w - STATUS_WIDTH - 8.f, .y = 8.f, .w = STATUS_WIDTH, .h = STATUS_HEIGHT };
    fill_round_rect(&renderer, 0, ui_theme_share()->panel_0, status_rect, 4.f, 0, TRIANGLE_SOLID);
    ui_label(state, &fps_label, ui_theme_share()->transform_y, status_rect, 0, 0);
    ui_label(state, &status_label, ui_theme_share()->text, status_rect, 0, 0);

    ui_renderer_render(&renderer);
}

#define FPS_MA 10
static double last_time[FPS_MA];
static int nb_frames = 0;
static void state_update(GLFWwindow *window) {
    int width, height, framebuffer_width, framebuffer_height;
    double mouse_x, mouse_y;
    script_context_t *ctx = script_context_share();
    ui_state_t *state = &ctx->state;

    glfwGetCursorPos(window, &mouse_x, &mouse_y);
    mouse_x = mouse_x * ctx->display_ratio;
    mouse_y = mouse_y * ctx->display_ratio;

    if (state->pointer_location.x != mouse_x || state->pointer_location.y != mouse_y) {
        if (state->active == -1 && state->hover == -1) script_window_mouse_move(mouse_x, mouse_y);
        state->pointer_location = (float2){.x = (f32)(mouse_x / ctx->ui_scale), .y = (f32)(mouse_y / ctx->ui_scale)};
    }
 
    glfwGetFramebufferSize(window, &framebuffer_width, &framebuffer_height);
    if (ctx->framebuffer_width != framebuffer_width || ctx->framebuffer_height != framebuffer_height) {
        glfwGetWindowSize(window, &width, &height);
        resize_callback(window, width, height);
    }

    ui_state_update(state);
    os_set_window_cursor(window, state->cursor_type);

    // compute fps
    double current_time = glfwGetTime();
    last_time[nb_frames % FPS_MA] = current_time;
    nb_frames++;

    if (nb_frames > FPS_MA) {
        double fps = FPS_MA / (current_time - last_time[(nb_frames - FPS_MA) % FPS_MA]);
        sprintf((void*)fps_str.base.data, "%16.f", fps);
        ui_label_update_text(&fps_label, fps_str);
    }

    // update status label
    sprintf((void*)status_str.base.data, "h: %d, a: %d, f: %d, l: %d", state->hover, state->active, state->focus, state->left_mouse_is_pressed);
    ui_label_update_text(&status_label, status_str);
}

void tick(GLFWwindow *window) {
    if (invalid_script) {
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        glClear(GL_DEPTH_BUFFER_BIT | GL_COLOR_BUFFER_BIT);
    } else {
        script_frame_tick();
        script_loop_tick();
    }

    if (ui_visible) ui_render(window);
    state_update(window);
    uv_run(uv_default_loop(), UV_RUN_NOWAIT);
}

int main(int argc, char** argv) {
    int window_width = 1080;
    int window_height = 720;
    GLFWwindow* window = os_create_window(ustring_STR("union_native"), window_width, window_height);

    glfwSetWindowSizeCallback(window, resize_callback);

    script_context_init(window);
    // db_put(script_context_share()->db, ustring_STR("app_name"), (udata){.data = "hello", .length = 5});
    db_load_dump_file(script_context_share()->db, ustring_STR("dump.bin"));
    udata value = db_get(script_context_share()->db, ustring_STR("app_name"));
    printf("app_name: %.*s\n", value.length, value.data);
    db_save_dump_file(script_context_share()->db, ustring_STR("dump.bin"));

    ustring_view uri = argc >= 2 ? ustring_view_STR(argv[1]) : ustring_view_STR("os/index.js");
    renderer_init(window, uri);
    tick(window);

    script_init(window, uri);
    os_run_window_loop(window, tick); // loop

    logger_destroy(logger_global());
    script_context_cleanup();
    script_context_terminate();

    os_close_window(window);
    return 0;
}
