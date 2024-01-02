include_directories(src)
include_directories(${THIRD_PARTY}/stb)
include_directories(${LIBUV_INCLUDE_DIRS})

set(LINK_DIR ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})

if (ENABLE_RENDER_DOC)
    add_definitions(-DRENDER_DOC_CAPTURE)
    include_directories(${THIRD_PARTY}/renderdoc/include)
endif()

if (WIN32)
    include_directories(
        /usr/include
        ${THIRD_PARTY}/glfw/include
        ${THIRD_PARTY}/quickjs/include
    )

    list(APPEND LINK_DIR
        /usr/lib
        ${THIRD_PARTY}/quickjs/lib/mingw64
    )
    add_definitions(-DOS_WINDOWS)
elseif (APPLE)
    include_directories(
        /usr/local/include
        /opt/homebrew/include
        ${THIRD_PARTY}/angle/include
        ${THIRD_PARTY}/glfw/include
        ${THIRD_PARTY}/quickjs/include
    )
    list(APPEND LINK_DIR
        ${THIRD_PARTY}/angle/lib/macos/${PROC_ARCH}
        ${THIRD_PARTY}/glfw/lib/macos
        ${THIRD_PARTY}/quickjs/lib/macos/${PROC_ARCH}
    )
    add_definitions(-DOS_MACOS)
    add_definitions(-DGL_SILENCE_DEPRECATION)
else() # LINUX
    include_directories(
        /usr/include
        /usr/local/include
        ${THIRD_PARTY}/mimalloc/include
        ${THIRD_PARTY}/glfw/include
    )
    list(APPEND LINK_DIR
        /usr/lib
        /usr/local/lib
        /usr/local/lib/quickjs
        ${THIRD_PARTY}/glfw/lib/linux
    )
    if (CMAKE_BUILD_TYPE STREQUAL "Debug")
        list(APPEND LINK_DIR
            ${THIRD_PARTY}/mimalloc/lib/linux/debug
        )
    else()
        list(APPEND LINK_DIR
            ${THIRD_PARTY}/mimalloc/lib/linux/release
        )
    endif()
    
    add_definitions(-DOS_LINUX)
endif()

link_directories(${LINK_DIR})