cmake_minimum_required(VERSION 3.10.2)

project(rayt LANGUAGES C)

if(UNIX AND NOT APPLE)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -lm")
endif()

# pkg config
find_package(PkgConfig)
pkg_check_modules(WEBP REQUIRED libwebp)

aux_source_directory(src/private PROJECT_PRIVATE_SRC)
set(PROJECT_SRC ${PROJECT_PRIVATE_SRC})

include_directories(/usr/include /usr/local/include src/public)

add_executable(${PROJECT_NAME} src/main.c ${PROJECT_SRC})
target_link_libraries(${PROJECT_NAME} ${WEBP_LDFLAGS})

add_executable(${PROJECT_NAME}_new src/main_new.c ${PROJECT_SRC})
target_link_libraries(${PROJECT_NAME}_new ${WEBP_LDFLAGS})
