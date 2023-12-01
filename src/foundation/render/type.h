#pragma once

typedef struct encoder_o encoder_o;
typedef struct pipeline_o pipeline_o;

typedef enum pipeline_uniform_type_t {
    UNIFORM_TYPE_INT,
    UNIFORM_TYPE_FLOAT,
    UNIFORM_TYPE_VEC2,
    UNIFORM_TYPE_VEC3,
    UNIFORM_TYPE_VEC4,
    UNIFORM_TYPE_MAT4,
    UNIFORM_TYPE_SAMPLER2D,
    UNIFORM_TYPE_SAMPLER3D,
    UNIFORM_TYPE_SAMPLERCUBE,
} pipeline_uniform_type_t;
