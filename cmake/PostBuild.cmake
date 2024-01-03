if (WIN32)
elseif (APPLE)
    add_custom_command(TARGET ${PROJECT_NAME} PRE_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${THIRD_PARTY}/angle/lib/macos/${PROC_ARCH} $<TARGET_FILE_DIR:${PROJECT_NAME}>)
    add_custom_command(TARGET ${PROJECT_NAME} PRE_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
        ${THIRD_PARTY}/glfw/lib/macos/libglfw.3.dylib $<TARGET_FILE_DIR:${PROJECT_NAME}>)
else() # Linux
endif()

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/npm/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/npm/example/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)