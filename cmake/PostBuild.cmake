add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/npm/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/../Resources/public)

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
    ${CMAKE_SOURCE_DIR}/app/Info.plist $<TARGET_FILE_DIR:${PROJECT_NAME}>/Info.plist)