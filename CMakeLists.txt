cmake_minimum_required(VERSION 3.10)

project(union_native)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

set(THIRD_PARTY ${CMAKE_SOURCE_DIR}/third_party)
include_directories(src
    ${THIRD_PARTY}/angle/include
    /usr/local/include
)

aux_source_directory(src/foundation FOUNDATION_SOURCES)
set(MAIN_ENTRY src/main.c)

if (APPLE)
    link_directories(
        ${THIRD_PARTY}/angle/bin
        ${THIRD_PARTY}/angle/lib/win
        /usr/local/lib
    )
    add_definitions(-DOS_MACOS)
elseif (LINUX)
    link_directories(
        ${THIRD_PARTY}/angle/bin
        ${THIRD_PARTY}/angle/lib/linux
        /usr/local/lib
        /usr/local/lib/quickjs
    )
    add_definitions(-DOS_LINUX)
endif()

add_executable(${PROJECT_NAME} ${MAIN_ENTRY} ${FOUNDATION_SOURCES})

if (APPLE)
target_link_libraries(${PROJECT_NAME})
elseif (LINUX)
target_link_libraries(${PROJECT_NAME} c++ chrome_zlib EGL GLESv2 quickjs glfw rt m dl)
endif()