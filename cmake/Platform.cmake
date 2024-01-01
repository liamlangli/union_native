set(VERSION 0.0.2)

set(USER_AGENT "union_native/${VERSION} ${CMAKE_SYSTEM_NAME}")
message(STATUS "USER_AGENT: ${USER_AGENT}")
add_definitions(-DUSER_AGENT="${USER_AGENT}")