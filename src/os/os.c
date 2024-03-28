#include "os.h"

#ifdef OS_MACOS
    #define SOKOL_METAL
#else
    #define SOKOL_GLES3
    #define SOKOL_GFX_IMPL
#endif

#define SOKOL_APP_IMPL
#define SOKOL_ARGS_IMPL
// #define SOKOL_AUDIO_IMPL
#define SOKOL_FETCH_IMPL
#define SOKOL_LOG_IMPL

#include <sokol_gfx.h>
#include <sokol_args.h>
// #include <sokol_audio.h>
#include <sokol_fetch.h>

#include <sokol_log.h>

void os_setup(int argc, char **argv) {
    os_time_init();
    sfetch_setup(&(sfetch_desc_t){0});
    sargs_setup(&(sargs_desc){
        .argc = argc,
        .argv = argv
    });
    // saudio_setup(&(saudio_desc){0});
}

void os_terminate() {
    sg_shutdown();
}