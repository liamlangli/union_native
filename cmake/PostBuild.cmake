if (APPLE)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/node/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/../Resources/public)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
        ${CMAKE_SOURCE_DIR}/app/AppIcon.icns $<TARGET_FILE_DIR:${PROJECT_NAME}>/../Resources/AppIcon.icns)
else()
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/node/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)
endif()