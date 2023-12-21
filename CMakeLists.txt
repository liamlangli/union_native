cmake_minimum_required(VERSION 3.10)

project(un)

set(RENDER_DOC OFF CACHE BOOL "Enable RenderDoc support")

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

set(THIRD_PARTY ${CMAKE_SOURCE_DIR}/third_party)

aux_source_directory(src/foundation FOUNDATION_SOURCES)
aux_source_directory(src/ui UI_SOURCES)
set(MAIN_ENTRY src/main.c)

include_directories(src)
include_directories(${THIRD_PARTY}/stb)

if (RENDER_DOC)
    add_definitions(-DRENDER_DOC_CAPTURE)
    include_directories(${THIRD_PARTY}/renderdoc/include)
endif()

if (APPLE)
    include_directories(
        ${THIRD_PARTY}/angle/include
        ${THIRD_PARTY}/glfw/include
        ${THIRD_PARTY}/quickjs/include
    )

    link_directories(
        ${THIRD_PARTY}/angle/lib/macos
        ${THIRD_PARTY}/glfw/lib/macos
        ${THIRD_PARTY}/quickjs/lib/macos
    )
    add_definitions(-DOS_MACOS)
    add_definitions(-DGL_SILENCE_DEPRECATION)
    if (RENDER_DOC)
        link_directories(${THIRD_PARTY}/renderdoc/lib/macos)
    endif()
elseif (LINUX)
    include_directories(
        ${THIRD_PARTY}/glfw/include)

    link_directories(
        /usr/local/lib
        /usr/local/lib/quickjs
        ${THIRD_PARTY}/glfw/lib/linux
    )
    add_definitions(-DOS_LINUX)
    if (RENDER_DOC)
        link_directories(${THIRD_PARTY}/renderdoc/lib/linux)
    endif()
else() # OS_WINDOWS
    include_directories(
        /usr/include
        ${THIRD_PARTY}/glfw/include
        ${THIRD_PARTY}/quickjs/include)
    link_directories(
        /usr/lib
        ${THIRD_PARTY}/quickjs/lib/mingw64)
    add_definitions(-DOS_WINDOWS)
endif()

add_executable(${PROJECT_NAME} ${MAIN_ENTRY} ${FOUNDATION_SOURCES} ${UI_SOURCES})

if(APPLE)
    target_link_libraries(${PROJECT_NAME} c++_chrome chrome_zlib EGL GLESv2 third_party_abseil-cpp_absl quickjs glfw.3 m dl)
    if (RENDER_DOC)
        target_link_libraries(${PROJECT_NAME} renderdoc)
        add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy
            ${THIRD_PARTY}/renderdoc/lib/macos/librenderdoc.dylib $<TARGET_FILE_DIR:${PROJECT_NAME}>)
    endif()
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${THIRD_PARTY}/angle/lib/macos $<TARGET_FILE_DIR:${PROJECT_NAME}>)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
        ${THIRD_PARTY}/glfw/lib/macos/libglfw.3.dylib $<TARGET_FILE_DIR:${PROJECT_NAME}>)
elseif(LINUX)
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 rt m dl)
    if (RENDER_DOC)
        add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy
            ${THIRD_PARTY}/renderdoc/lib/linux/librenderdoc.so $<TARGET_FILE_DIR:${PROJECT_NAME}>)
    endif()
else()
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 m dl ws2_32)
endif()

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/font $<TARGET_FILE_DIR:${PROJECT_NAME}>/font)