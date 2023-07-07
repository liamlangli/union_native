#pragma once

// RENDER_BACKEND_VULKAN
// RENDER_BACKEND_METAL
// RENDER_BACKEND_WOOD

#if defined(OS_WINDOWS) || defined(OS_LINUX)
    #define RENDER_BACKEND_VULKAN
#elif defined(OS_OSX)
    #define RENDER_BACKEND_METAL
#endif