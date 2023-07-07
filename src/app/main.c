#include "foundation/simd.h"
#include "foundation/array.inl"
#include "foundation/os.h"

#include "component/os_window/os_window.h"
#include "component/render_system/render_system.h"
#include "component/script/script.h"

#include "plugin/arg_parse/arg_parse.h"

#include <string.h>

const char *description = """[union native]"""
""" Cross-platform script driven application framework. \n""";

int main(int argc, char **argv) {
    arg_parser_o *parser = arg_parse->create_parser();
    arg_parse->set_description(parser, description); 
    arg_parse->add_string(parser, "w", "workspace", "set working directory.", "./");
    arg_parse->help(parser);
    arg_parse->parse(parser, argc, argv);

    char *workspace;
    if (arg_parse->get_string(parser, "w", "workspace", &workspace)) {
        printf("workspace: %s\n", workspace);
    }

    script_context_t context = script->create_context();
    // script_value_t value = script->eval(&context, "1 + 2", 5);
    char *content = NULL;
    u64 size = 0;
    if(os_api->file_system->read_file("example/triangle/triangle.js", (void**)&content, &size)) {
        script_value_t value = script->eval(&context, content, size);
        printf("eval returns: %d\n", script->to_int(&context, value));
    }

    render_system->init();
    rect_t window_rect = (rect_t){.x = 100.f, .y = 100.f, .w = 800, .h = 600 };
    window_t *window = platform_window_create("Hello World", window_rect);
    swapchain_o *swapchain = render_system->create_swapchain(window);
    render_pass_o *render_pass = render_system->get_swapchain_render_pass(swapchain);

    while(platform_window_update(window)) {
        render_system->present_swapchain(swapchain);
    }

    render_system->delete_swapchain(swapchain);
    render_system->terminate();

    platform_window_destroy(window);
    return 0;
}
