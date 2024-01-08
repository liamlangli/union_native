#pragma once

#if defined(OS_MACOS)

#ifdef __cplusplus
extern "C" {
#endif

void metal_capture_start(void);
void metal_capture_end(void);

#ifdef __cplusplus
} // extern "C"
#endif

#endif

#if defined(OS_LINUX)

void render_doc_capture_start(void);
void render_doc_capture_end(void);

#endif
