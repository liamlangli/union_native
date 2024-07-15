set(VERSION 1.0)

set(USER_AGENT "union_native/${VERSION} ${CMAKE_SYSTEM_NAME}")
message(STATUS "USER_AGENT: ${USER_AGENT}")
add_definitions(-DUSER_AGENT="${USER_AGENT}")

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

message(STATUS "OS: ${PLATFORM}")
link_directories(${LINK_DIR})

if(APPLE)
    if(NOT IOS)
        execute_process(
            COMMAND xcrun --sdk macosx --show-sdk-path
            OUTPUT_VARIABLE CMAKE_OSX_SYSROOT
            OUTPUT_STRIP_TRAILING_WHITESPACE
        )
        message(STATUS "CMAKE_OSX_SYSROOT: ${CMAKE_OSX_SYSROOT}")
    endif()
endif()

set(PROC_ARCH x86_64)
if (CMAKE_SYSTEM_PROCESSOR MATCHES "arm64")
    set(PROC_ARCH arm64)
    add_definitions(-DARM64)
endif()

message(STATUS "PROC_ARCH: ${PROC_ARCH}")