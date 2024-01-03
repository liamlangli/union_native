
# zip
include_directories(${THIRD_PARTY}/zip)
aux_source_directory(${THIRD_PARTY}/zip ZIP_SRC)
message(STATUS "zip src: ${ZIP_SRC}")
list(APPEND PROJECT_SRC ${ZIP_SRC})
source_group(third_party\\zip FILES ${ZIP_SRC})
set_source_files_properties(${ZIP_SRC} PROPERTIES UNITY_GROUP "zip")

# stb
include_directories(${THIRD_PARTY}/stb)
set(STB_SRC
    ${THIRD_PARTY}/stb/stb_ds.h
    ${THIRD_PARTY}/stb/stb_image.h
    ${THIRD_PARTY}/stb/stb_image_write.h)
source_group(third_party\\stb FILES ${STB_SRC})