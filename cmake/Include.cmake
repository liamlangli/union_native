include_directories(src)
include_directories(${LIBUV_INCLUDE_DIRS})

include_directories(
    ${THIRD_PARTY}/include
    ${THIRD_PARTY}/include/leveldb
    ${THIRD_PARTY}/include/libuv)
list(APPEND LINK_DIR ${THIRD_PARTY}/lib)

if (WIN32)
    add_definitions(-DOS_WINDOWS)
    set(PLATFORM "OS_WINDOWS")
    set(MINGW_PATH D:/msys64/mingw64)
    list(APPEND LINK_DIR ${MINGW_PATH}/lib)
elseif (APPLE)
    if (IOS)
        add_definitions(-DOS_IOS)
        set(PLATFORM "OS_IOS")
    else()
        add_definitions(-DOS_MACOS)
        set(PLATFORM "OS_MACOS")
    endif()
else() # LINUX
    add_definitions(-DOS_LINUX)
endif()

message(STATUS "OS: ${LINK_DIR}")
link_directories(${LINK_DIR})