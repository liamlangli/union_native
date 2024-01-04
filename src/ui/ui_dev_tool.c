#include "ui/ui_dev_tool.h"
#include "foundation/ustring.h"
#include "foundation/logger.h"
#include "script/script_context.h"
#include "ui/ui_draw.h"
#include "ui/ui_label.h"
#include "ui/ui_theme.h"
#include "ui/ui_type.h"
#include "ui/ui_input.h"
#include "ui/ui_button.h"

#include <stdio.h>

// tab ui
static ui_button_t console_tab;
static ui_button_t network_tab;
static ui_button_t memory_tab;
static ui_button_t graphics_tab;
static ui_button_t source_tab;
static ui_button_t performance_tab;

// console ui
static ui_input_t console_input;

void ui_dev_tool_init(ui_dev_tool_t* dev_tool) {
    dev_tool->snap_align = RIGHT;
    dev_tool->width = 320;
    dev_tool->height = 240;
    dev_tool->visible = false;
    dev_tool->tab = DEVTOOL_CONSOLE;

    ui_input_init(&console_input, ustring_view_STR(""));
    console_input.outline = false;
    console_input.cursor_style = ui_theme_share()->panel_0;
    console_input.label.element.constraint.margin.left = 3.f;
    console_input.label.text_style = ui_theme_share()->text_dark;
}

void ui_dev_tool_resize(ui_dev_tool_t* dev_tool) {
    script_context_t *context = script_context_share();
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

void ui_dev_tool_set_visible(ui_dev_tool_t* dev_tool, bool visible) {
    script_context_t *context = script_context_share();
    ui_state_t *state = &context->state;
    dev_tool->visible = visible;

    if (!visible) {
        dev_tool->rect = (ui_rect){ 0, 0, 0, 0 };
        ui_state_clear_active(state);
        ui_state_clear_focus(state);
        return;
    }

    ui_dev_tool_resize(dev_tool);
    if (dev_tool->tab == DEVTOOL_CONSOLE) {
        ui_state_set_focus(state, console_input.element.id);
    }
}

void ui_dev_tool_console(ui_state_t *state, ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_source(ui_state_t *state, ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_network(ui_state_t *state, ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_graphics(ui_state_t *state, ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_memory(ui_state_t *state, ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_performance(ui_state_t *state, ui_dev_tool_t* dev_tool, ui_rect rect);

void dev_tool_tab_well(ui_state_t *state, ui_dev_tool_t* dev_tool, ui_rect rect) {

    // if (ui_button(state, ui_theme_share()->panel_0, tab_rect, 0, 0)) {
    //     dev_tool->tab = DEVTOOL_CONSOLE;
    // }
    // tab_rect.x += tab_rect.w + 8.f;
    // if (ui_button(state, ui_theme_share()->panel_0, tab_rect, 0, 0)) {
    //     dev_tool->tab = DEVTOOL_NETWORK;
    // }
    // tab_rect.x += tab_rect.w + 8.f;
    // if (ui_button(state, ui_theme_share()->panel_0, tab_rect, 0, 0)) {
    //     dev_tool->tab = DEVTOOL_MEMORY;
    // }
    // tab_rect.x += tab_rect.w + 8.f;
    // if (ui_button(state, ui_theme_share()->panel_0, tab_rect, 0, 0)) {
    //     dev_tool->tab = DEVTOOL_GRAPHICS;
    // }
    // tab_rect.x += tab_rect.w + 8.f;
    // if (ui_button(state, ui_theme_share()->panel_0, tab_rect, 0, 0)) {
    //     dev_tool->tab = DEVTOOL_SOURCE;
    // }
    // tab_rect.x += tab_rect.w + 8.f;
    // if (ui_button(state, ui_theme_share()->panel_0, tab_rect, 0, 0)) {
    //     dev_tool->tab = DEVTOOL_PERFORMANCE;
    // }
}

void ui_dev_tool(ui_state_t *state, ui_dev_tool_t* dev_tool) {
    if (!dev_tool->visible)
        return;

    ui_dev_tool_resize(dev_tool);

    script_context_t *context = script_context_share();
    ui_renderer_t* renderer = &context->renderer;

    fill_rect(renderer, 0, ui_theme_share()->text, dev_tool->rect, 0);
    switch (dev_tool->tab) {
    case DEVTOOL_CONSOLE:
        ui_dev_tool_console(state, dev_tool, dev_tool->rect);
        break;
    default:
        break;
    }
}

static ustring command_open = ustring_STR("open ");
static ustring eval = ustring_STR("<eval>");

void ui_dev_tool_console(ui_state_t *state, ui_dev_tool_t* dev_tool, ui_rect rect) {
    ui_renderer_t *renderer = state->renderer;

    ui_rect input_rect = (ui_rect){.x = rect.x, .y = rect.y + rect.h - 24.f, .w = rect.w, .h = 24.f};
    input_rect = ui_rect_shrink(input_rect, 2.f, 2.f);
    if (ui_input(state, &console_input, ui_theme_share()->dev_tool_input, input_rect, 0, 0)) {
        // LOG_INFO_FMT("try load script: %s\n", console_input.label.text.base.data);
        // script_init(console_input.label.text);
        ustring_view text = console_input.label.text;
        if (ustring_view_start_with_ustring(text, command_open)) {
            int start = command_open.length;
            while (start < text.length && text.base.data[start] == ' ') start++;
            ustring_view uri = ustring_view_sub_view(&text, start, text.length - start);
            printf("try load script: %s\n", uri.base.data);
            script_eval_uri(uri);
        } else {
            ustring content = ustring_view_to_ustring(&text);
            script_eval(ustring_view_to_ustring(&text), ustring_view_from_ustring(eval));
        }

        ustring_view_clear(&console_input.label.text);
        ui_label_update_text(&console_input.label, console_input.label.text);
        ui_state_set_focus(state, console_input.element.id);
    }

    ui_rect line = (ui_rect){rect.x, rect.y + rect.h - 26.f, rect.w, 1.f};
    fill_rect(renderer, 0, ui_theme_share()->panel_0, line, 0);
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