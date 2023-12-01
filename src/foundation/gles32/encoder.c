#include "encoder.h"

#if defined(RENDER_BACKEND_GLES)

#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <stdlib.h>

typedef struct encoder_o {
    int version;
} encoder_o;

static struct encoder_o _encoder;

encoder_o* gles_init() {
    gladLoadGLES2Loader((GLADloadproc)glfwGetProcAddress);
    printf("GL_VERSION  : %s\n", glGetString(GL_VERSION) );
    printf("GL_RENDERER : %s\n", glGetString(GL_RENDERER) );
    return &_encoder;
}

void gles_clear(encoder_o *encoder)
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void gles_viewport(encoder_o *encoder, u32 x, u32 y, u32 width, u32 height)
{
    glViewport(x, y, width, height);
}

void gles_clear_color(encoder_o *encoder, f32 r, f32 g, f32 b, f32 a)
{
    glClearColor(r, g, b, a);
}

void gles_clear_depth(encoder_o *encoder, f32 depth)
{
    glClearDepthf(depth);
}

#endif