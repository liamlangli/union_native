#ifndef _script_h_
#define _script_h_

typedef struct script_context_t {
    u64 opaque;
} script_context_t;


typedef struct script_api {
    script_context_t (*create_context)(void);
    void (*destroy_context)(script_context_t *context);

    void (*eval)(script_context_t *context, const char *script);
    void (*eval_file)(script_context_t *context, const char *filename);
} script_api;

#endif _script_h_