include_directories(src)
include_directories(${LIBUV_INCLUDE_DIRS})

include_directories(
    ${THIRD_PARTY}/include
    ${THIRD_PARTY}/include/libuv
)
list(APPEND LINK_DIR ${THIRD_PARTY}/lib)
