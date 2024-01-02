if (WIN32)
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 m dl ws2_32 uv)
elseif (APPLE)
    target_link_libraries(${PROJECT_NAME} EGL GLESv2 quickjs glfw.3 m dl ${LIBUV_LIBRARIES})
    if (${SCRIPT_BACKEND} STREQUAL "Quickjs")
        target_link_libraries(${PROJECT_NAME} quickjs)
    elseif(${SCRIPT_BACKEND} STREQUAL "JavaScriptCore")
        target_link_libraries(${PROJECT_NAME} "-framework JavaScriptCore")
    endif()

    target_link_libraries(${PROJECT_NAME} "-framework JavaScriptCore")
else() # LINUX
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 rt m dl uv)
    if (ENABLE_RENDER_DOC)
        add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy
            ${THIRD_PARTY}/renderdoc/lib/linux/librenderdoc.so $<TARGET_FILE_DIR:${PROJECT_NAME}>)
    endif()
endif()

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/npm/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/npm/example/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)