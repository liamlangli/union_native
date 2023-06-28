#ifndef _render_types_h_
#define _render_types_h_

#include "foundation/types.h"

typedef struct render_resource_o {
    u32 id;
    u32 bindless_srv;
    u32 bindless_uav;
} render_resource_o;

typedef enum render_shader_stage {
    SHADER_STAGE_VERTEX,
    SHADER_STAGE_HULL,
    SHADER_STAGE_DOMAIN,
    SHADER_STAGE_GEOMETRY,
    SHADER_STAGE_PIXEL,
    
    SHADER_STAGE_COMPUTE,
    
    SHADER_STAGE_RAYGEN,
    SHADER_STAGE_ANY_HIT,
    SHADER_STAGE_CLOSEST_HIT,
    SHADER_STAGE_MISS,
    SHADER_STAGE_INTERSECTION,
    SHADER_STAGE_MAX
} render_shader_stage;

typedef enum render_state {
    RENDER_STATE_TESSELLATION,
    RENDER_STATE_RASTER
} render_state;

#endif // _render_types_h_
