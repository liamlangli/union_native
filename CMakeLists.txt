cmake_minimum_required(VERSION 3.20)

project(un LANGUAGES C CXX OBJC OBJCXX)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# cmake options
set(CMAKE_SUPPRESS_REGENERATION true)

include(${CMAKE_SOURCE_DIR}/cmake/Platform.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Options.cmake)

set(THIRD_PARTY ${CMAKE_SOURCE_DIR}/third_party)

# -----------------------------------------------------------------------
# Main entry (C++)
# -----------------------------------------------------------------------
set(MAIN_ENTRY src/main.cpp)
set(PROJECT_SRC ${MAIN_ENTRY})

# -----------------------------------------------------------------------
# ImGui layer (C++)
# -----------------------------------------------------------------------
set(IMGUI_LAYER_SRC
    src/imgui_layer.h
    src/imgui_layer.cpp)
list(APPEND PROJECT_SRC ${IMGUI_LAYER_SRC})
source_group(imgui_layer FILES ${IMGUI_LAYER_SRC})

# -----------------------------------------------------------------------
# Foundation (C)
# -----------------------------------------------------------------------
aux_source_directory(src/foundation FOUNDATION_SOURCES)
file(GLOB FOUNDATION_HEADERS src/foundation/*.h)
list(APPEND PROJECT_SRC ${FOUNDATION_SOURCES})

# -----------------------------------------------------------------------
# OS abstraction (C)
# -----------------------------------------------------------------------
aux_source_directory(src/os OS_SOURCES)
file(GLOB OS_HEADERS src/os/*.h)
list(APPEND PROJECT_SRC ${OS_SOURCES})

# -----------------------------------------------------------------------
# GPU abstraction utilities (C) + Dawn backend (C++)
# -----------------------------------------------------------------------
set(GPU_SOURCES
    src/gpu/gpu.c
    src/gpu/gpu.dawn.cpp)
file(GLOB GPU_HEADERS src/gpu/*.h)
list(APPEND PROJECT_SRC ${GPU_SOURCES})

# -----------------------------------------------------------------------
# UI framework (C)
# -----------------------------------------------------------------------
aux_source_directory(src/ui UI_SOURCES)
file(GLOB UI_HEADERS src/ui/*.h)
list(APPEND PROJECT_SRC ${UI_SOURCES})

# -----------------------------------------------------------------------
# Script engine (C) — backend selected in Options.cmake
# -----------------------------------------------------------------------
file(GLOB SCRIPT_HEADERS src/script/*.h)
if (SCRIPT_BACKEND STREQUAL "JavaScriptCore")
    set(SCRIPT_SOURCES src/script/script.jsc.c)
elseif (SCRIPT_BACKEND STREQUAL "V8")
    set(SCRIPT_SOURCES src/script/script.v8.cpp)
else()
    set(SCRIPT_SOURCES src/script/script.qjs.c)
endif()
list(APPEND SCRIPT_SOURCES src/script/script_gpu.c)
list(APPEND PROJECT_SRC ${SCRIPT_SOURCES})

# -----------------------------------------------------------------------
# Platform window layer (Objective-C/Objective-C++ on Apple, C++ elsewhere)
# -----------------------------------------------------------------------
if (APPLE)
    set(APPLE_SOURCES
        src/apple/os.m
        src/apple/os.macos.mm)   # Objective-C++ — no Metal, uses CAMetalLayer for Dawn
    file(GLOB APPLE_HEADERS src/apple/*.h)
    list(APPEND PROJECT_SRC ${APPLE_SOURCES})
    source_group(apple FILES ${APPLE_SOURCES} ${APPLE_HEADERS})
elseif (WIN32)
    set(WIN_SOURCES
        src/os/os.win.c)
    list(APPEND PROJECT_SRC ${WIN_SOURCES})
    source_group(win FILES ${WIN_SOURCES})
else() # LINUX
    # Linux window layer would go here
endif()

# -----------------------------------------------------------------------
# ImGui source files (compiled directly into the project)
# -----------------------------------------------------------------------
set(IMGUI_DIR ${THIRD_PARTY}/source/imgui)
if (EXISTS ${IMGUI_DIR})
    set(IMGUI_SRC
        ${IMGUI_DIR}/imgui.cpp
        ${IMGUI_DIR}/imgui_draw.cpp
        ${IMGUI_DIR}/imgui_tables.cpp
        ${IMGUI_DIR}/imgui_widgets.cpp
        ${IMGUI_DIR}/backends/imgui_impl_wgpu.cpp)
    list(APPEND PROJECT_SRC ${IMGUI_SRC})
    source_group(third_party\\imgui FILES ${IMGUI_SRC})
    set_source_files_properties(${IMGUI_SRC} PROPERTIES UNITY_GROUP "imgui")
endif()

# -----------------------------------------------------------------------
# Third-party (zip, stb, cgltf)
# -----------------------------------------------------------------------
include(${CMAKE_SOURCE_DIR}/cmake/ThirdParty.cmake)

# -----------------------------------------------------------------------
# Source groups
# -----------------------------------------------------------------------
source_group(foundation FILES ${FOUNDATION_SOURCES} ${FOUNDATION_HEADERS})
source_group(os FILES ${OS_SOURCES} ${OS_HEADERS})
source_group(gpu FILES ${GPU_SOURCES} ${GPU_HEADERS})
source_group(ui FILES ${UI_SOURCES} ${UI_HEADERS})
source_group(script FILES ${SCRIPT_SOURCES} ${SCRIPT_HEADERS})
source_group(main FILES ${MAIN_ENTRY})

# -----------------------------------------------------------------------
# Build
# -----------------------------------------------------------------------
include(${CMAKE_SOURCE_DIR}/cmake/Include.cmake)
add_executable(${PROJECT_NAME} ${PROJECT_SRC})
include(${CMAKE_SOURCE_DIR}/cmake/UnityBuild.cmake)

include(${CMAKE_SOURCE_DIR}/cmake/Link.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Lib.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/PostBuild.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Install.cmake)
