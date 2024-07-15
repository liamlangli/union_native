#ifdef UI_NATIVE
#include "ui/ui_dev_tool.h"
#include "foundation/ustring.h"
#include "foundation/logger.h"
#include "script/script.h"

#include "ui/ui_draw.h"
#include "ui/ui_label.h"
#include "ui/ui_theme.h"
#include "ui/ui_type.h"
#include "ui/ui_input.h"
#include "ui/ui_button.h"
#include "ui/ui_scroll_view.h"

#include <stb/stb_ds.h>

// tab ui
static ui_button_t console_tab;
static ui_button_t network_tab;
static ui_button_t memory_tab;
static ui_button_t graphics_tab;
static ui_button_t source_tab;
static ui_button_t performance_tab;

// console ui
static ui_input_t console_input;
static ui_scroll_view_t console_view;
static ui_label_t *console_labels;
static u32 console_label_count = 0;

void ui_dev_tool_init(ui_dev_tool_t* dev_tool) {
    dev_tool->snap_align = BOTTOM;
    dev_tool->width = 480;
    dev_tool->height = 320;
    dev_tool->visible = true;
    dev_tool->tab = DEVTOOL_CONSOLE;

    ui_input_init(&console_input, ustring_view_STR(""));
    console_input.label.element.constraint.margin.left = 3.f;
    console_input.label.scale = 0.8f;

    ui_scroll_view_init(&console_view, 20);

    console_labels = (ui_label_t*)malloc(sizeof(ui_label_t) * 127);
    for (u32 i = console_label_count; i < 127; i++) {
        ui_label_init(&console_labels[i], ustring_view_STR(""));
        console_labels[i].element.constraint.alignment = LEFT | CENTER_VERTICAL;
        console_labels[i].element.constraint.margin.left = 4.f;
        console_labels[i].scale = 0.7f;
    }
}

void ui_dev_tool_resize(ui_dev_tool_t* dev_tool) {
    script_t *context = script_shared();
    int align = dev_tool->snap_align;
    f64 width = dev_tool->width;
    f64 height = dev_tool->height;

    ui_rect rect = ui_state_get()->window_rect;
    if (align & LEFT) {
        rect = (ui_rect){ 0, 0, width, rect.h};
    } else if (align & RIGHT) {
        rect = (ui_rect){ rect.w - width, 0, width, rect.h};
    } else if (align & TOP) {
        rect = (ui_rect){ 0, 0, rect.w, height};
    } else if (align & BOTTOM) {
        rect = (ui_rect){ 0, rect.h - height, rect.w, height};
    }
    rect = ui_rect_shrink(rect, 8.f, 8.f);
    dev_tool->rect = rect;
}

void ui_dev_tool_set_visible(ui_dev_tool_t* dev_tool, bool visible) {
    script_t *context = script_shared();
    dev_tool->visible = visible;

    if (!visible) {
        dev_tool->rect = (ui_rect){ 0, 0, 0, 0 };
        ui_state_clear_active();
        ui_state_clear_focus();
        return;
    }

    ui_dev_tool_resize(dev_tool);
    if (dev_tool->tab == DEVTOOL_CONSOLE) {
        ui_state_set_focus(console_input.element.id);
    }
}

void ui_dev_tool_console(ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_source(ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_network(ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_graphics(ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_memory(ui_dev_tool_t* dev_tool, ui_rect rect);
void ui_dev_tool_performance(ui_dev_tool_t* dev_tool, ui_rect rect);

void ui_dev_tool(ui_dev_tool_t* dev_tool) {
    if (!dev_tool->visible)
        return;

    ui_dev_tool_resize(dev_tool);
    script_t *context = script_shared();

    fill_round_rect(0, ui_theme_shared()->bg, dev_tool->rect, 6.f, 0, TRIANGLE_SOLID);
    stroke_round_rect(0, ui_theme_shared()->panel_1, dev_tool->rect, 6.f, 0, TRIANGLE_SOLID);
    switch (dev_tool->tab) {
    case DEVTOOL_CONSOLE:
        ui_dev_tool_console(dev_tool, dev_tool->rect);
        break;
    default:
        break;
    }
}

static ustring command_open = ustring_STR("open ");
static ustring command_close = ustring_STR("close");
static ustring command_exit = ustring_STR("exit");
static ustring command_capture = ustring_STR("gpu.capture");
#define DEV_TOOL_INPUT_HEIGHT 32.f

void ui_dev_tool_console(ui_dev_tool_t* dev_tool, ui_rect rect) {
    ui_rect input_rect = rect;
    input_rect.h = DEV_TOOL_INPUT_HEIGHT;
    input_rect.y = rect.y + rect.h - input_rect.h;
    input_rect = ui_rect_shrink(input_rect, 4.f, 4.f);
    if (ui_input(&console_input, ui_theme_shared()->panel_0, input_rect, 0, 0)) {
        ustring_view text = console_input.label.text;
        if (ustring_view_start_with_ustring(text, command_open)) {
            int start = command_open.length;
            while (start < text.length && text.base.data[start] == ' ') start++;
            ustring_view uri = ustring_view_sub_view(&text, start, text.length);
            ULOG_INFO_FMT("try load script: {v}", uri);
            script_eval_uri(uri);
        } else if (ustring_view_start_with_ustring(text, command_close)) {
            ui_dev_tool_set_visible(dev_tool, false);
        } else if (ustring_view_start_with_ustring(text, command_capture)) {
            os_window_capture_require(script_shared()->window);
        } else {
            ustring result = ustring_NULL;
            ustring content = ustring_view_to_ustring(&text);
            int err = script_eval_direct(content, &result);
            if (err != -1 && result.length > 0) {
                ULOG_INFO_FMT("{u}", result);
            }
            ULOG_INFO("do eval: {u}", content);
            ustring_free(&result);
        }

        ustring_view_clear(&console_input.label.text);
        ui_label_compute_size_and_offset(&console_input.label);
    }

    // render scroll_view
    ui_rect scroll_view_rect = rect;
    scroll_view_rect.h -= DEV_TOOL_INPUT_HEIGHT;
    ui_rect clip_rect = scroll_view_rect;
    clip_rect.y += 3.f;
    clip_rect.h -= 3.f;
    u32 clip = ui_layer_write_clip(0, clip_rect, 0);

    logger_t *logger = logger_global();
    u32 line_count = (u32)arrlen(logger->lines);
    console_view.item_count = line_count;
    u32 start = ui_scroll_view_item_start(&console_view, scroll_view_rect);
    u32 count = ui_scroll_view_item_count(&console_view, scroll_view_rect);

    ui_rect label_rect = scroll_view_rect;
    label_rect.y -= fmodf(console_view.offset_y, console_view.item_height);
    label_rect.h = console_view.item_height;
    for (int i = start; i < start + count; i++) {
        ui_label_t *label = &console_labels[i];
        ui_label_update_text(label, ustring_view_from_ustring(logger->lines[i].line));
        ui_label(label, ui_theme_shared()->text, label_rect, 0, clip);
        label_rect.y += console_view.item_height;
    }
    ui_scroll_view(&console_view, scroll_view_rect, 0, clip);
}
#endif
