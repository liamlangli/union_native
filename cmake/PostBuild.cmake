macro (set_xcode_property TARGET XCODE_PROPERTY XCODE_VALUE)
    set_property (TARGET ${TARGET} PROPERTY XCODE_ATTRIBUTE_${XCODE_PROPERTY} ${XCODE_VALUE})
endmacro (set_xcode_property)

if (APPLE)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/node/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/../Resources/public)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
        ${CMAKE_SOURCE_DIR}/app/AppIcon.icns $<TARGET_FILE_DIR:${PROJECT_NAME}>/../Resources/AppIcon.icns)

    if (IOS)
        set(ENTITLEMENTS_FILE "${CMAKE_SOURCE_DIR}/app/un.entitlements")
        set_xcode_property(${PROJECT_NAME} CODE_SIGN_IDENTITY "Apple Developer")
        set_xcode_property(${PROJECT_NAME} DEVELOPMENT_TEAM "Lang Li (UNQ9CMR8W6)")
        set_xcode_property(${PROJECT_NAME} PRODUCT_BUNDLE_IDENTIFIER "com.liamlangli.${PROJECT_NAME}")

        add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND codesign --entitlements ${ENTITLEMENTS_FILE} --sign - $<TARGET_FILE:${PROJECT_NAME}>
            COMMENT "Signing the application with entitlements"
        )
    endif()
else()
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/node/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)
endif()


