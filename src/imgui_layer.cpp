/**
 * imgui_layer.cpp — self-hosted URL address bar.
 *
 * Uses the project's own native UI system exclusively:
 *   ui_input_t      — editable URL text field
 *   ui_button_t     — "Load" / "Hide" buttons
 *   fill_round_rect — panel background
 *   ui_theme_t      — colours / style
 *   ui_state_t      — input state tracking
 *
 * No Dear ImGui or any external GUI library is required.
 */

#include "imgui_layer.h"
#include "script/script.h"
#include "foundation/ustring.h"
#include "foundation/logger.h"

/* Native UI system */
#include "ui/ui_draw.h"
#include "ui/ui_input.h"
#include "ui/ui_button.h"
#include "ui/ui_theme.h"
#include "ui/ui_state.h"
#include "ui/ui_type.h"
#include "ui/ui_renderer.h"

#include <cstring>

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

static constexpr int   BAR_LAYER  = 3;     // top-most UI layer
static constexpr float BAR_HEIGHT = 36.0f;
static constexpr float BAR_PAD_X  = 10.0f;
static constexpr float BAR_PAD_Y  = 8.0f;
static constexpr float BTN_WIDTH  = 64.0f;
static constexpr float INNER_PAD  = 6.0f;
static constexpr float RADIUS     = 5.0f;

// ---------------------------------------------------------------------------
// Mutable URL buffer (ui_input edits in-place)
// ---------------------------------------------------------------------------
static char s_url_buf[2048] = "http://127.0.0.1:3003/main.js";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
static bool         s_visible     = true;
static bool         s_initialized = false;
static os_window_t *s_window      = nullptr;

static ui_input_t   s_url_input   = {};
static ui_button_t  s_load_btn    = {};
static ui_button_t  s_hide_btn    = {};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

void imgui_layer_init(os_window_t *window) {
    s_window = window;

    /* ui_input needs a mutable ustring_view backed by s_url_buf */
    ustring url_ustr = ustring_str(s_url_buf);
    ustring_view url_view = ustring_view_from_ustring(url_ustr);
    ui_input_init(&s_url_input, url_view);
    s_url_input.radiuses = (float4){ RADIUS, RADIUS, RADIUS, RADIUS };

    ui_button_init(&s_load_btn, ustring_view_STR("Load"));
    s_load_btn.radiuses = (float4){ RADIUS, RADIUS, RADIUS, RADIUS };

    ui_button_init(&s_hide_btn, ustring_view_STR("Hide"));
    s_hide_btn.radiuses = (float4){ RADIUS, RADIUS, RADIUS, RADIUS };

    s_initialized = true;
}

void imgui_layer_new_frame(os_window_t *window) {
    if (!s_initialized || !s_visible) return;

    ui_theme_t *theme = ui_theme_shared();
    const float win_w = (float)window->width;

    /* Bar background panel */
    ui_rect bar = {
        BAR_PAD_X,
        BAR_PAD_Y,
        win_w - BAR_PAD_X * 2.0f,
        BAR_HEIGHT
    };
    fill_round_rect(BAR_LAYER, theme->panel_1, bar, RADIUS, 0, TRIANGLE_SOLID);

    /* Layout: [  URL input field  ][Load][Hide] */
    const float btn_area  = (BTN_WIDTH + INNER_PAD) * 2.0f;
    const float field_x   = bar.x + INNER_PAD;
    const float field_y   = bar.y + INNER_PAD * 0.5f;
    const float field_w   = bar.w - btn_area - INNER_PAD * 2.0f;
    const float field_h   = bar.h - INNER_PAD;

    ui_rect field_rect = { field_x, field_y, field_w, field_h };

    ui_rect load_rect = {
        field_x + field_w + INNER_PAD,
        field_y, BTN_WIDTH, field_h
    };
    ui_rect hide_rect = {
        load_rect.x + BTN_WIDTH + INNER_PAD,
        field_y, BTN_WIDTH, field_h
    };

    /* Styles derived from theme */
    ui_style field_style = ui_style_from_hex(
        theme->panel_2.color,
        theme->panel_3.color,
        theme->panel_3.active_color,
        theme->dev_tool_input.outline_color);

    ui_style btn_style = ui_style_from_hex(
        theme->panel_2.color,
        theme->panel_3.hover_color,
        theme->panel_3.active_color,
        0);

    /* Draw widgets */
    bool submitted    = ui_input (&s_url_input, field_style, field_rect, BAR_LAYER, 0);
    bool load_clicked = ui_button(&s_load_btn,  btn_style,   load_rect,  BAR_LAYER, 0);
    bool hide_clicked = ui_button(&s_hide_btn,  btn_style,   hide_rect,  BAR_LAYER, 0);

    /* On Enter / Load: evaluate the URL */
    if (submitted || load_clicked) {
        /* s_url_input.label.text is the live ustring_view — pass it directly */
        ustring_view uri = s_url_input.label.text;
        ULOG_INFO_FMT("url_bar: {}", uri.base.data ? uri.base.data + uri.start : "(empty)");
        script_eval_uri(uri);
        s_visible = false;
    }

    if (hide_clicked) {
        s_visible = false;
    }
}

void imgui_layer_render(void) {
    /* No-op: the native UI is flushed by ui_renderer_render() in script_tick(). */
}

void imgui_layer_destroy(void) {
    s_initialized = false;
    s_window      = nullptr;
}
