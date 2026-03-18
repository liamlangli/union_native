set(ENABLE_UNITY_BUILD ON CACHE BOOL "Enable group based unity build")
set(ENABLE_MIMALLOC OFF CACHE BOOL "Enable mimalloc")

# GPU backend — Dawn (WebGPU) only
add_definitions(-DGPU_BACKEND_DAWN)

# Script backend — auto-select by platform
if (APPLE AND NOT IOS)
    set(SCRIPT_BACKEND "JavaScriptCore" CACHE STRING "Script backend" FORCE)
elseif (WIN32)
    set(SCRIPT_BACKEND "V8" CACHE STRING "Script backend" FORCE)
else()
    set(SCRIPT_BACKEND "QuickJS" CACHE STRING "Script backend" FORCE)
endif()
set_property(CACHE SCRIPT_BACKEND PROPERTY STRINGS "QuickJS" "JavaScriptCore" "V8")

if (SCRIPT_BACKEND STREQUAL "QuickJS")
    add_definitions(-DSCRIPT_BACKEND_QJS)
elseif (SCRIPT_BACKEND STREQUAL "JavaScriptCore")
    add_definitions(-DSCRIPT_BACKEND_JSC)
elseif (SCRIPT_BACKEND STREQUAL "V8")
    add_definitions(-DSCRIPT_BACKEND_V8)
else()
    message(FATAL_ERROR "Unknown script backend: ${SCRIPT_BACKEND}")
endif()

if (ENABLE_MIMALLOC)
    add_definitions(-DENABLE_MIMALLOC)
endif()

if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(UN_BUILD_TYPE "debug")
else()
    set(UN_BUILD_TYPE "release")
endif()

add_definitions(-DUI_NATIVE)
message(STATUS "Script backend: ${SCRIPT_BACKEND}")
message(STATUS "GPU backend: Dawn (WebGPU)")
