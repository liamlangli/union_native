set(VERSION 1.0)

set(USER_AGENT "union_native/${VERSION} ${CMAKE_SYSTEM_NAME}")
message(STATUS "USER_AGENT: ${USER_AGENT}")
add_definitions(-DUSER_AGENT="${USER_AGENT}")

if(APPLE)
    execute_process(
        COMMAND xcrun --sdk macosx --show-sdk-path
        OUTPUT_VARIABLE CMAKE_OSX_SYSROOT
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )
    # enable_language(Swift)
    message(STATUS "CMAKE_OSX_SYSROOT: ${CMAKE_OSX_SYSROOT}")
endif()

set(PROC_ARCH x86_64)
if (CMAKE_SYSTEM_PROCESSOR MATCHES "arm64")
    set(PROC_ARCH arm64)
    add_definitions(-DARM64)
endif()

message(STATUS "PROC_ARCH: ${PROC_ARCH}")