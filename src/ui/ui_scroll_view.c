#include "ui/ui_scroll_view.h"
#include "ui/ui_theme.h"
#include "ui/ui_draw.h"

#define UI_SCROLL_VIEW_SCROLL_BAR_WIDTH 10.f
#define UI_SCROLL_BAR_DEFAULT_WIDTH 6.f
#define UI_SCROLL_BAR_ACTIVE_WIDTH 7.f

void ui_scroll_view_init(ui_scroll_view_t *scroll_view, u32 item_height) {
    ui_element_init(&scroll_view->element);
    scroll_view->item_height = item_height;
    scroll_view->offset_y = 0.f;
}

void ui_scroll_view(ui_state_t *state, ui_scroll_view_t *view, ui_rect rect, u32 layer_index, u32 clip) {
    const u32 id = view->element.id;

    const bool hover = state->hover == id;
    const bool active = state->active == id;
    const f32 content_height = view->item_height * view->item_count;
    const f32 max_scroll_y = MACRO_MAX(0.f, content_height - rect.h);

    if (ui_state_hovering(state, rect, layer_index)) {
        state->next_hover_layer_index = layer_index;
        state->next_hover = id;
    }

    if (hover || active) {
        view->offset_y = MACRO_CLAMP(view->offset_y + state->pointer_scroll.y * 10.0f, 0.f, max_scroll_y);
    }

    if (!view->scroll_bar)
        return;
    if (rect.h > content_height)
        return;

    const f32 scroll_bar_height = MACRO_MIN(1.f, rect.h / content_height) * rect.h;
    ui_rect bar_rect = (ui_rect){
        .x = rect.x + rect.w - (hover || active ? UI_SCROLL_BAR_ACTIVE_WIDTH : UI_SCROLL_BAR_DEFAULT_WIDTH),
        .y = rect.y + view->offset_y / content_height * rect.h,
        .w = UI_SCROLL_BAR_DEFAULT_WIDTH,
        .h = scroll_bar_height};
    
    const ui_theme_t *theme = ui_theme_shared();
    ui_style style = theme->scroll_bar;
    style.color = active ? theme->scroll_bar.active_color : hover ? theme->scroll_bar.hover_color : theme->scroll_bar.color;
    fill_round_rect(state->renderer, layer_index, style, bar_rect, active || hover ? 2.f : 1.0f, clip, TRIANGLE_SOLID);

    if (hover && ui_state_hovering(state, bar_rect, layer_index) && state->left_mouse_press) {
        ui_state_set_active(state, id);
    }

    if (active) {
        const f32 dy = state->pointer_delta.y / (rect.h - scroll_bar_height) * max_scroll_y;
        view->offset_y = MACRO_CLAMP(view->offset_y + dy, 0.f, max_scroll_y);
        if (state->left_mouse_release) {
            ui_state_set_active(state, 0);
        }
    }
}

u32 ui_scroll_view_item_start(ui_scroll_view_t *view, ui_rect rect) {
    u32 start = (u32)(view->offset_y / view->item_height);
    u32 count = ui_scroll_view_item_count(view, rect);
    return MACRO_CLAMP(start, 0, MACRO_MAX(0, view->item_count - count));
}

u32 ui_scroll_view_item_count(ui_scroll_view_t *view, ui_rect rect) {
    return MACRO_MIN(view->item_count, (u32)(rect.h / view->item_height) + 1);
}