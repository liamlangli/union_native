cmake_minimum_required(VERSION 3.20)

project(un LANGUAGES C CXX OBJC OBJCXX)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 20)
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
# Core runtime support (C)
# -----------------------------------------------------------------------
aux_source_directory(src/core CORE_SOURCES)
file(GLOB CORE_HEADERS src/core/*.h)
list(APPEND PROJECT_SRC ${CORE_SOURCES})
set(CORE_CXX_SOURCES
    src/core/db.c
    src/core/io.c
    src/core/logger.c
    src/core/network.c)
set_source_files_properties(${CORE_CXX_SOURCES} PROPERTIES LANGUAGE CXX)

# -----------------------------------------------------------------------
# OS abstraction (C++)
# -----------------------------------------------------------------------
set(OS_SOURCES
    src/os/os.cpp
    src/os/os.file.cpp
    src/os/os.time.cpp)
file(GLOB OS_HEADERS src/os/*.h)
list(APPEND PROJECT_SRC ${OS_SOURCES})

# -----------------------------------------------------------------------
# WebGPU context (C++)
# -----------------------------------------------------------------------
set(WEBGPU_SOURCES src/webgpu_context.cpp)
set(WEBGPU_HEADERS src/webgpu_context.h)
list(APPEND PROJECT_SRC ${WEBGPU_SOURCES})

# -----------------------------------------------------------------------
# UI framework (mixed C/C++)
# -----------------------------------------------------------------------
aux_source_directory(src/ui UI_SOURCES)
list(REMOVE_ITEM UI_SOURCES ${CMAKE_SOURCE_DIR}/src/ui/ui_renderer.c)
list(APPEND UI_SOURCES src/ui/ui_renderer.cpp)
file(GLOB UI_HEADERS src/ui/*.h)
list(APPEND PROJECT_SRC ${UI_SOURCES})
set_source_files_properties(${UI_SOURCES} PROPERTIES LANGUAGE CXX)

# -----------------------------------------------------------------------
# Script engine (C++) — backend selected in Options.cmake
# -----------------------------------------------------------------------
file(GLOB SCRIPT_HEADERS src/script/*.h)
if (SCRIPT_BACKEND STREQUAL "Stub")
    set(SCRIPT_SOURCES src/script/script.stub.cpp)
elseif (SCRIPT_BACKEND STREQUAL "JavaScriptCore")
    set(SCRIPT_SOURCES src/script/script.jsc.mm)
elseif (SCRIPT_BACKEND STREQUAL "V8")
    set(SCRIPT_SOURCES src/script/script.v8.cpp)
else()
    message(FATAL_ERROR "Unsupported script backend: ${SCRIPT_BACKEND}")
endif()
list(APPEND SCRIPT_SOURCES src/script/script_gpu.cpp)
list(APPEND PROJECT_SRC ${SCRIPT_SOURCES})

# -----------------------------------------------------------------------
# Platform window layer (Objective-C/Objective-C++ on Apple, C++ elsewhere)
# -----------------------------------------------------------------------
if (APPLE)
    set(APPLE_SOURCES
        src/apple/os.macos.mm)   # Objective-C++ — no Metal, uses CAMetalLayer for Dawn
    file(GLOB APPLE_HEADERS src/apple/*.h)
    list(APPEND PROJECT_SRC ${APPLE_SOURCES})
    source_group(apple FILES ${APPLE_SOURCES} ${APPLE_HEADERS})
elseif (WIN32)
    set(WIN_SOURCES
        src/os/os.win.cpp)
    list(APPEND PROJECT_SRC ${WIN_SOURCES})
    source_group(win FILES ${WIN_SOURCES})
else() # LINUX
    # Linux window layer would go here
endif()

# -----------------------------------------------------------------------
# Third-party (zip, stb)
# -----------------------------------------------------------------------
include(${CMAKE_SOURCE_DIR}/cmake/ThirdParty.cmake)

# -----------------------------------------------------------------------
# Source groups
# -----------------------------------------------------------------------
source_group(core FILES ${CORE_SOURCES} ${CORE_HEADERS})
source_group(os FILES ${OS_SOURCES} ${OS_HEADERS})
source_group(webgpu FILES ${WEBGPU_SOURCES} ${WEBGPU_HEADERS})
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
