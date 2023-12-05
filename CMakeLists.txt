cmake_minimum_required(VERSION 3.10)

project(un)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

set(THIRD_PARTY ${CMAKE_SOURCE_DIR}/third_party)

aux_source_directory(src/foundation FOUNDATION_SOURCES)
set(MAIN_ENTRY src/main.c)

include_directories(src)

if (APPLE)
    include_directories(
        ${THIRD_PARTY}/angle/include
        /usr/local/include)

    link_directories(
        ${THIRD_PARTY}/angle/bin
        ${THIRD_PARTY}/angle/lib/macos
        /usr/local/lib
        /usr/local/lib/quickjs
    )
    add_definitions(-DOS_MACOS)
elseif (LINUX)
    include_directories(
        ${THIRD_PARTY}/glfw/include)

    link_directories(
        /usr/local/lib
        /usr/local/lib/quickjs
        ${THIRD_PARTY}/glfw/lib/linux
    )
    add_definitions(-DOS_LINUX)
endif()

add_executable(${PROJECT_NAME} ${MAIN_ENTRY} ${FOUNDATION_SOURCES})

if (APPLE)
    target_link_libraries(${PROJECT_NAME} c++_chrome chrome_zlib EGL GLESv2 third_party_abseil-cpp_absl quickjs glfw m dl)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${THIRD_PARTY}/angle/lib/macos $<TARGET_FILE_DIR:${PROJECT_NAME}>)
elseif (LINUX)
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 rt m dl)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${THIRD_PARTY}/angle/lib/linux $<TARGET_FILE_DIR:${PROJECT_NAME}>)
endif()