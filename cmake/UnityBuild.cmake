if (ENABLE_UNITY_BUILD)
    set_target_properties(${PROJECT_NAME} PROPERTIES UNITY_BUILD ON)
    set_target_properties(${PROJECT_NAME} PROPERTIES UNITY_BUILD_MODE GROUP)
endif()

if(WIN32)
    set_source_files_properties(${VULKAN_SOURCES} PROPERTIES UNITY_GROUP "vulkan")
endif()

set_source_files_properties(${FOUNDATION_SOURCES} PROPERTIES UNITY_GROUP "foundation")
set_source_files_properties(${OS_SOURCES} PROPERTIES UNITY_GROUP "os")
set_source_files_properties(${GPU_SOURCES} PROPERTIES UNITY_GROUP "gpu")
set_source_files_properties(${UI_SOURCES} PROPERTIES UNITY_GROUP "ui")
set_source_files_properties(${SCRIPT_SOURCES} PROPERTIES UNITY_GROUP "script")