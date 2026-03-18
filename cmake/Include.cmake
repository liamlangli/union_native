include_directories(src)

# Dawn WebGPU headers
set(DAWN_INCLUDE_DIR ${CMAKE_SOURCE_DIR}/third_party/include/dawn)
if (EXISTS ${DAWN_INCLUDE_DIR})
    include_directories(${DAWN_INCLUDE_DIR})
else()
    message(WARNING "Dawn headers not found at ${DAWN_INCLUDE_DIR}. Run: python script/dep.py download && python script/dep.py compile")
endif()

include_directories(
    ${THIRD_PARTY}/include
)
list(APPEND LINK_DIR ${THIRD_PARTY}/lib)
