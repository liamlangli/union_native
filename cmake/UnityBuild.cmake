set_target_properties(${PROJECT_NAME} PROPERTIES UNITY_BUILD ON)
set_target_properties(${PROJECT_NAME} PROPERTIES UNITY_BUILD_MODE GROUP)
set_source_files_properties(${FOUNDATION_SOURCES} PROPERTIES UNITY_GROUP "foundation")
set_source_files_properties(${UI_SOURCES} PROPERTIES UNITY_GROUP "ui")