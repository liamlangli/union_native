set(PROJECT_VERSION 0.1.0)
set(PROJECT_MAJOR_VERSION 0)
set(PROJECT_MINOR_VERSION 1)

if (APPLE)
    source_group("Resources" FILES ${CMAKE_CURRENT_SOURCE_DIR}/app/Info.plist)
    set_target_properties(${PROJECT_NAME} PROPERTIES
        MACOSX_BUNDLE TRUE
        MACOSX_PACKAGE_LOCATION Resources
        MACOSX_BUNDLE_GUI_IDENTIFIER "io.unionengine.un"
        MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
        MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
        XCODE_ATTRIBUTE_OTHER_CODE_SIGN_FLAGS "--deep"
        XCODE_ATTRIBUTE_ASSETCATALOG_COMPILER_APPICON_NAME "AppIcon"
        MACOSX_BUNDLE_INFO_PLIST "${CMAKE_CURRENT_SOURCE_DIR}/app/Info.plist"
    )
    target_sources(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/app/AppIcon.icns)
    set_target_properties(${PROJECT_NAME} PROPERTIES INSTALL_RPATH "@loader_path/../Frameworks")
    set_target_properties(${PROJECT_NAME} PROPERTIES XCODE_ATTRIBUTE_OTHER_LDFLAGS "-w")
endif()