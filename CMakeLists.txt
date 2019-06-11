cmake_minimum_required(VERSION 3.12.3)

project(rayt LANGUAGES C)

# pkg config
find_package(PkgConfig)
pkg_check_modules(WEBP REQUIRED libwebp)

aux_source_directory(src/private PROJECT_PRIVATE_SRC)
set(PROJECT_SRC src/main.c ${PROJECT_PRIVATE_SRC})

include_directories(/usr/local/include src/include)

add_executable(${PROJECT_NAME} ${PROJECT_SRC})
target_link_libraries(${PROJECT_NAME} ${WEBP_LDFLAGS})