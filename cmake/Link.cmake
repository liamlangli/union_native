if (ENABLE_MIMALLOC)
    target_link_libraries(${PROJECT_NAME} mimalloc)
endif()

if (WIN32)
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 m dl ws2_32 uv leveldb)
elseif (APPLE)
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw.3 m dl ${LIBUV_LIBRARIES} leveldb)
    if (${SCRIPT_BACKEND} STREQUAL "Quickjs")
        target_link_libraries(${PROJECT_NAME} "-framework JavaScriptCore")
    endif()
else() # LINUX
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 rt m dl uv)
endif()

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/npm/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/npm/example/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)