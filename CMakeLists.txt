cmake_minimum_required(VERSION 3.10)

project(un)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

# cmake options
set(CMAKE_SUPPRESS_REGENERATION true)

include(${CMAKE_SOURCE_DIR}/cmake/Platform.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Options.cmake)

set(THIRD_PARTY ${CMAKE_SOURCE_DIR}/third_party)

# collect source files
set(MAIN_ENTRY src/main.c)
set(PROJECT_SRC ${MAIN_ENTRY})

# foundation
aux_source_directory(src/foundation FOUNDATION_SOURCES)
file(GLOB FOUNDATION_HEADERS src/foundation/*.h)
list(APPEND PROJECT_SRC ${FOUNDATION_SOURCES})

# os
aux_source_directory(src/os OS_SOURCES)
file(GLOB OS_HEADERS src/os/*.h)
list(APPEND PROJECT_SRC ${OS_SOURCES})

# ui
aux_source_directory(src/gpu UI_SOURCES)
file(GLOB GPU_HEADERS src/gpu/*.h)
list(APPEND PROJECT_SRC ${GPU_SOURCES})

# ui
aux_source_directory(src/ui UI_SOURCES)
file(GLOB UI_HEADERS src/ui/*.h)
list(APPEND PROJECT_SRC ${UI_SOURCES})

# script
aux_source_directory(src/script SCRIPT_SOURCES)
file(GLOB SCRIPT_HEADERS src/script/*.h)
list(APPEND PROJECT_SRC ${SCRIPT_SOURCES})

# macos
set(APPLE_SOURCES
    src/apple/metal.m
    src/apple/metal_type.m)
file(GLOB APPLE_HEADERS src/apple/*.h)
if (APPLE)
    list(APPEND APPLE_SOURCES src/apple/os.m)
    if (IOS)
        list(APPEND APPLE_SOURCES src/apple/os.ios.m)
    else()
        list(APPEND APPLE_SOURCES src/apple/os.macos.m)
    endif()
    list(APPEND PROJECT_SRC ${APPLE_SOURCES})
endif()

# include third party
include(${CMAKE_SOURCE_DIR}/cmake/ThirdParty.cmake)

# source groups
source_group(foundation FILES ${FOUNDATION_SOURCES} ${FOUNDATION_HEADERS})
source_group(os FILES ${OS_SOURCES} ${OS_HEADERS})
source_group(ui FILES ${UI_SOURCES} ${UI_HEADERS})
source_group(script FILES ${SCRIPT_SOURCES} ${SCRIPT_HEADERS})
source_group(apple FILE ${APPLE_SOURCES} ${APPLE_HEADERS})
source_group(main FILES ${MAIN_ENTRY})

include(${CMAKE_SOURCE_DIR}/cmake/Include.cmake)
add_executable(${PROJECT_NAME} ${PROJECT_SRC})
include(${CMAKE_SOURCE_DIR}/cmake/UnityBuild.cmake)

include(${CMAKE_SOURCE_DIR}/cmake/Link.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Lib.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/PostBuild.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Install.cmake)