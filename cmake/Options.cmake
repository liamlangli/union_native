set(ENABLE_UNITY_BUILD ON CACHE BOOL "Enable group based unity build")
set(ENABLE_MIMALLOC OFF CACHE BOOL "Enable mimalloc")

set(SCRIPT_BACKEND "QuickJS" CACHE STRING "Script backend")
set_property(CACHE SCRIPT_BACKEND PROPERTY STRINGS "QuickJS" "JavaScriptCore")

if (SCRIPT_BACKEND STREQUAL "QuickJS")
    add_definitions(-DSCRIPT_BACKEND_QJS)
elseif (SCRIPT_BACKEND STREQUAL "JavaScriptCore")
    add_definitions(-DSCRIPT_BACKEND_JSC)
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
