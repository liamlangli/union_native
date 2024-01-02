set(VERSION 0.0.2)

set(USER_AGENT "union_native/${VERSION} ${CMAKE_SYSTEM_NAME}")
message(STATUS "USER_AGENT: ${USER_AGENT}")
add_definitions(-DUSER_AGENT="${USER_AGENT}")

set(PROC_ARCH x86_64)
if (CMAKE_SYSTEM_PROCESSOR MATCHES "arm64")
    set(PROC_ARCH arm64)
endif()

message(STATUS "PROC_ARCH: ${PROC_ARCH}")