set(ENABLE_RENDER_DOC OFF CACHE BOOL "Enable renderdoc support")
set(ENABLE_UNITY_BUILD ON CACHE BOOL "Enable group based unity build")

set(SCRIPT_BACKEND "QuickJS" CACHE STRING "Script backend")
set_property(CACHE SCRIPT_BACKEND PROPERTY STRINGS "QuickJS" "JavaScriptCore")

set(INSTALL_PATH "${CMAKE_INSTALL_PREFIX}" CACHE STRING "Install path")

if (SCRIPT_BACKEND STREQUAL "QuickJS")
    add_definitions(-DSCRIPT_BACKEND_QUICKJS)
elseif (SCRIPT_BACKEND STREQUAL "JavaScriptCore")
    add_definitions(-DSCRIPT_BACKEND_JAVASCRIPTCORE)
else()
    message(FATAL_ERROR "Unknown script backend: ${SCRIPT_BACKEND}")
endif()

message(STATUS "Script backend: ${SCRIPT_BACKEND}")
