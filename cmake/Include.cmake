include_directories(src)
include_directories(${LIBUV_INCLUDE_DIRS})

set(LINK_DIR ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})

if (ENABLE_RENDER_DOC)
    add_definitions(-DRENDER_DOC_CAPTURE)
    include_directories(${THIRD_PARTY}/renderdoc/include)
endif()

include_directories(
    /usr/local/include
    /opt/homebrew/include
    ${THIRD_PARTY}/angle/include
    ${THIRD_PARTY}/glfw/include
    ${THIRD_PARTY}/quickjs/include
    ${THIRD_PARTY}/mimalloc/include)
if (WIN32)
    list(APPEND LINK_DIR /usr/lib)
    list(APPEND LINK_DIR ${THIRD_PARTY}/quickjs/lib/mingw64)
    list(APPEND LINK_DIR ${THIRD_PARTY}/mimalloc/lib/mingw64/${UN_BUILD_TYPE})
    add_definitions(-DOS_WINDOWS)
elseif (APPLE)
    list(APPEND LINK_DIR
        /usr/local/lib
        ${THIRD_PARTY}/angle/lib/macos/${PROC_ARCH}
        ${THIRD_PARTY}/glfw/lib/macos
        ${THIRD_PARTY}/quickjs/lib/macos/${PROC_ARCH}
    )
    add_definitions(-DOS_MACOS)
    add_definitions(-DGL_SILENCE_DEPRECATION)
else() # LINUX
    list(APPEND LINK_DIR
        /usr/lib
        /usr/local/lib
        /usr/local/lib/quickjs
        ${THIRD_PARTY}/glfw/lib/linux)
    list(APPEND LINK_DIR ${THIRD_PARTY}/mimalloc/lib/linux/${UN_BUILD_TYPE})
    
    add_definitions(-DOS_LINUX)
endif()

link_directories(${LINK_DIR})