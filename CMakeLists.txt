cmake_minimum_required(VERSION 3.10.2)

project(rayt)
set(CMAKE_C_STANDARD 99)

# if macOS platform
if(APPLE)
  add_definitions(-DOS_OSX)
elseif(UNIX)
  add_definitions(-DOS_LINUX)
elseif(WIN32)
  add_definitions(-DOS_WIN)
endif()

if(UNIX AND NOT APPLE)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -lm")
endif()

# pkg config
find_package(PkgConfig)
pkg_check_modules(WEBP REQUIRED libwebp)
# ${WEBP_LDFLAGS}

aux_source_directory(src/private PRIVATE_SRC)
aux_source_directory(src/io IO_SRC)
aux_source_directory(src/foundation FOUNDATION_SRC)

if(APPLE)
  aux_source_directory(src/foundation/osx OSX_SRC)
  list(APPEND FOUNDATION_SRC ${OSX_SRC})
endif()

include_directories(
  /usr/include
  /usr/local/include
  src/public
  src/foundation
  src/io)

if(APPLE)
  aux_source_directory(src/foundation/osx OSX_SRC)
  list(APPEND FOUNDATION_SRC ${OSX_SRC})

  #append external
  list(APPEND FOUNDATION_SRC ${DEVICE_HEADER})
endif()

add_executable(${PROJECT_NAME} src/main_new.c ${FOUNDATION_SRC})
target_link_libraries(${PROJECT_NAME})

if(APPLE)
  target_link_libraries(${PROJECT_NAME} "-framework Cocoa")
  target_link_libraries(${PROJECT_NAME} "-framework Metal")
endif()