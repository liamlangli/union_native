include_directories(src)
include_directories(${THIRD_PARTY}/stb)
include_directories(${LIBUV_INCLUDE_DIRS})

if (ENABLE_RENDER_DOC)
    add_definitions(-DRENDER_DOC_CAPTURE)
    include_directories(${THIRD_PARTY}/renderdoc/include)
endif()

if (ENABLE_GLES)
    add_definitions(-DRENDER_BACKEND_GLES)
endif()

if (WIN32)
    include_directories(
        /usr/include
        ${THIRD_PARTY}/glfw/include
        ${THIRD_PARTY}/quickjs/include)
    link_directories(
        /usr/lib
        ${THIRD_PARTY}/quickjs/lib/mingw64)
    add_definitions(-DOS_WINDOWS)
elseif (APPLE)
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
    set(CMAKE_INSTALL_RPATH "/usr/local/lib")
    set(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)
    add_definitions(-DOS_MACOS)
    add_definitions(-DGL_SILENCE_DEPRECATION)
else() # LINUX
    include_directories(
        /usr/include
        /usr/local/include)
        # ${THIRD_PARTY}/glfw/include)

    link_directories(
        /usr/local/lib
        /usr/local/lib/quickjs
        # ${THIRD_PARTY}/glfw/lib/linux
    )
    add_definitions(-DOS_LINUX)
    if (ENABLE_RENDER_DOC)
        link_directories(${THIRD_PARTY}/renderdoc/lib/linux)
    endif()
endif()