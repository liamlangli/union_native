cmake_minimum_required(VERSION 3.10)

project(un)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

include(${CMAKE_SOURCE_DIR}/cmake/Platform.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Options.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Findlibuv.cmake)

set(THIRD_PARTY ${CMAKE_SOURCE_DIR}/third_party)

# collect source files
set(MAIN_ENTRY src/main.c)
set(PROJECT_SRC ${MAIN_ENTRY})
aux_source_directory(src/foundation FOUNDATION_SOURCES)
list(APPEND PROJECT_SRC ${FOUNDATION_SOURCES})
aux_source_directory(src/ui UI_SOURCES)
list(APPEND PROJECT_SRC ${UI_SOURCES})
aux_source_directory(src/script SCRIPT_SOURCES)
list(APPEND PROJECT_SRC ${SCRIPT_SOURCES})

# include third party
include(${CMAKE_SOURCE_DIR}/cmake/ThirdParty.cmake)

# source groups
source_group(foundation FILES ${FOUNDATION_SOURCES})
source_group(ui FILES ${UI_SOURCES})
source_group(script FILES ${SCRIPT_SOURCES})
source_group(main FILES ${MAIN_ENTRY})

include(${CMAKE_SOURCE_DIR}/cmake/Include.cmake)
add_executable(${PROJECT_NAME} ${PROJECT_SRC})
include(${CMAKE_SOURCE_DIR}/cmake/UnityBuild.cmake)

include(${CMAKE_SOURCE_DIR}/cmake/Link.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/PostBuild.cmake)
include(${CMAKE_SOURCE_DIR}/cmake/Install.cmake)