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
    ${THIRD_PARTY}/quickjs/include
    ${THIRD_PARTY}/mimalloc/include)
list(APPEND LINK_DIR /usr/local/lib /opt/homebrew/lib)

if (WIN32)
    list(APPEND LINK_DIR /usr/lib)
    list(APPEND LINK_DIR ${THIRD_PARTY}/quickjs/lib/mingw64)
    list(APPEND LINK_DIR ${THIRD_PARTY}/mimalloc/lib/mingw64/${UN_BUILD_TYPE})
    add_definitions(-DOS_WINDOWS)
    set(PLATFORM "OS_WINDOWS")
elseif (APPLE)
    list(APPEND LINK_DIR ${THIRD_PARTY}/quickjs/lib/macos/${PROC_ARCH})
    if (IOS)
        add_definitions(-DOS_IOS)
        set(PLATFORM "OS_IOS")
    else()
        add_definitions(-DOS_MACOS)
        set(PLATFORM "OS_MACOS")
    endif()
else() # LINUX
    list(APPEND LINK_DIR
        /usr/lib
        /usr/local/lib
        /usr/local/lib/quickjs)
    list(APPEND LINK_DIR ${THIRD_PARTY}/mimalloc/lib/linux/${UN_BUILD_TYPE})
    add_definitions(-DOS_LINUX)
endif()

message(STATUS "OS: ${PLATFORM}")
link_directories(${LINK_DIR})