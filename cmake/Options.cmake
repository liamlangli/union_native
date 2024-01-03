set(ENABLE_UNITY_BUILD ON CACHE BOOL "Enable group based unity build")
set(ENABLE_MIMALLOC ON CACHE BOOL "Enable group based unity build")

set(SCRIPT_BACKEND "QuickJS" CACHE STRING "Script backend")
set_property(CACHE SCRIPT_BACKEND PROPERTY STRINGS "QuickJS" "JavaScriptCore")

if (SCRIPT_BACKEND STREQUAL "QuickJS")
    add_definitions(-DSCRIPT_BACKEND_QUICKJS)
elseif (SCRIPT_BACKEND STREQUAL "JavaScriptCore")
    add_definitions(-DSCRIPT_BACKEND_JAVASCRIPTCORE)
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

message(STATUS "Script backend: ${SCRIPT_BACKEND}")
