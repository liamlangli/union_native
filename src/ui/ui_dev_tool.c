#include "ui/ui_dev_tool.h"
#include "script/script_context.h"
#include "ui/ui_draw.h"
#include "ui/ui_theme.h"
#include "ui/ui_type.h"

void ui_dev_tool_init(ui_dev_tool_t* dev_tool) {
    dev_tool->snap_align = RIGHT;
    // dev_tool->ui_rect = (){ 0, 0, 0, 0 };
    dev_tool->width = 320;
    dev_tool->height = 240;
}

void ui_dev_tool_set_visible(ui_dev_tool_t* dev_tool, bool visible) {
    script_context_t *context = script_context_share();
    dev_tool->visible = visible;

    int align = dev_tool->snap_align;
    f64 width = dev_tool->width;
    f64 height = dev_tool->height;
    
    ui_rect rect = context->state.window_rect;
    if (align & LEFT) {
        rect = (ui_rect){ 0, 0, width, rect.h};
    } else if (align & RIGHT) {
        rect = (ui_rect){ rect.w - width, 0, width, rect.h};
    } else if (align & TOP) {
        rect = (ui_rect){ 0, 0, rect.w, height};
    } else if (align & BOTTOM) {
        rect = (ui_rect){ 0, rect.h - height, rect.w, height};
    }

    dev_tool->rect = rect;
}

void ui_dev_tool(ui_state_t *state, ui_dev_tool_t* dev_tool) {
    script_context_t *context = script_context_share();
    ui_renderer_t* renderer = &context->renderer;

    fill_rect(renderer, 0, ui_theme_share()->text, dev_tool->rect, 0);
}

// static void renderer_init(GLFWwindow* window, ustring_view uri) {
//     ui_input_init(&source_input, uri);
//     ui_label_init(&copyright, ustring_view_STR("@2023 union native"));
//     ui_scroll_view_init(&log_view, 20);
//     copyright.element.constraint.alignment = CENTER;
//     copyright.element.constraint.margin.top = 10;
//     copyright.scale = 0.7f;

//     fps_str.base.data = malloc(MAX_FPX_BITS);
//     memset((void*)fps_str.base.data, 0, MAX_FPX_BITS);
//     fps_str.length = MAX_FPX_BITS;
//     ui_label_init(&fps_label, fps_str);
//     fps_label.element.constraint.alignment = TOP | LEFT;
//     fps_label.element.constraint.margin.left = 4.f;
//     fps_label.element.constraint.margin.top = 24.f;
//     fps_label.scale = 0.7f;

//     status_str.base.data = malloc(MAX_STATUS_BITS);
//     memset((void*)status_str.base.data, 0, MAX_STATUS_BITS);
//     status_str.length = MAX_STATUS_BITS;
//     ui_label_init(&status_label, status_str);
//     status_label.element.constraint.alignment = TOP | LEFT;
//     status_label.element.constraint.margin.left = 4.f;
//     status_label.element.constraint.margin.top = 4.f;
//     status_label.scale = 0.7f;
// }

// #define STATUS_WIDTH 100.f
// #define STATUS_HEIGHT 32.f

// static void ui_render(GLFWwindow *window) {
//     script_context_t *ctx = script_context_share();
//     ui_state_t *state = &ctx->state;
//     ui_renderer_t *renderer = &ctx->renderer;

//     state->cursor_type = CURSOR_Default;
//     ui_rect rect = ui_rect_shrink((ui_rect){.x = 0.f, .y = state->window_rect.h - 48.f, .w = state->window_rect.w, .h = 46.f}, 8.0f, 8.0f);
//     if (ui_input(state, &source_input, ui_theme_share()->panel_0, rect, 0, 0)) {
//         LOG_INFO_FMT("try load script: %s\n", source_input.label.text.base.data);
//         script_init(window, source_input.label.text);
//     }

//     // rect = ui_rect_shrink((ui_rect){.x = 0, .y = state->window_rect.h - 22.f, .w = state->window_rect.w, .h = 22.f}, 8.0f, 8.0f);
//     // ui_label(&state, &copyright, ui_theme_share()->text, rect, 0, 0);

//     ui_rect status_rect = (ui_rect){.x = state->window_rect.w - STATUS_WIDTH - 8.f, .y = 8.f, .w = STATUS_WIDTH, .h = STATUS_HEIGHT };
//     fill_round_rect(renderer, 0, ui_theme_share()->panel_0, status_rect, 4.f, 0, TRIANGLE_SOLID);
//     ui_label(state, &fps_label, ui_theme_share()->transform_y, status_rect, 0, 0);
//     ui_label(state, &status_label, ui_theme_share()->text, status_rect, 0, 0);
// }

// static void on_remote_script_download(net_request_t request, net_response_t response) {
//     LOG_INFO_FMT("download remote script: %s\n", request.url.url.base.data);
//     LOG_INFO_FMT("status: %d\n", response.status);
//     LOG_INFO_FMT("content_length: %d\n", response.content_length);
//     invalid_script = script_eval(ustring_view_to_ustring(&response.body), request.url.url) != 0;
//     script_context_t *ctx = script_context_share();
// }

// static void script_init(ustring_view uri) {
//     if (strncasecmp(uri.base.data, "http", 4) == 0) {
//         url_t url = url_parse(uri);
//         if (!url.valid) {
//             LOG_WARNING_FMT("invalid url: %s\n", uri.base.data);
//             return;
//         }
//         LOG_INFO_FMT("download remote script: %s\n", uri.base.data);
//         url_dump(url);
//         net_download_async(url, on_remote_script_download);
//     } else {
//         ustring content = io_read_file(uri);
//         invalid_script = script_eval(content, uri) != 0;
//         ustring_free(&content);

//         // watch file change

//     }

//     // glfwGetWindowSize(window, &ctx->width, &ctx->height);
//     // os_window_tn_resize(window, ctx->width, ctx->height);
// }