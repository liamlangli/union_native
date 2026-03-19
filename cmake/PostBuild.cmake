macro(set_xcode_property TARGET XCODE_PROPERTY XCODE_VALUE)
    set_property(TARGET ${TARGET} PROPERTY XCODE_ATTRIBUTE_${XCODE_PROPERTY} ${XCODE_VALUE})
endmacro()

file(GLOB_RECURSE PUBLIC_ASSETS CONFIGURE_DEPENDS ${CMAKE_SOURCE_DIR}/node/public/*)
set(PUBLIC_ASSET_STAMP ${CMAKE_BINARY_DIR}/public-assets.stamp)

if (APPLE)
    add_custom_command(
        OUTPUT ${PUBLIC_ASSET_STAMP}
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/node/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/../Resources/public)
    add_custom_command(
        OUTPUT ${PUBLIC_ASSET_STAMP}
        APPEND
        COMMAND ${CMAKE_COMMAND} -E touch ${PUBLIC_ASSET_STAMP}
        DEPENDS ${PUBLIC_ASSETS})
    add_custom_target(copy_public_assets ALL DEPENDS ${PUBLIC_ASSET_STAMP})
    add_dependencies(${PROJECT_NAME} copy_public_assets)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
        ${CMAKE_SOURCE_DIR}/app/AppIcon.icns $<TARGET_FILE_DIR:${PROJECT_NAME}>/../Resources/AppIcon.icns)
else()
    add_custom_command(
        OUTPUT ${PUBLIC_ASSET_STAMP}
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/node/public $<TARGET_FILE_DIR:${PROJECT_NAME}>/public)
    add_custom_command(
        OUTPUT ${PUBLIC_ASSET_STAMP}
        APPEND
        COMMAND ${CMAKE_COMMAND} -E touch ${PUBLIC_ASSET_STAMP}
        DEPENDS ${PUBLIC_ASSETS})
    add_custom_target(copy_public_assets ALL DEPENDS ${PUBLIC_ASSET_STAMP})
    add_dependencies(${PROJECT_NAME} copy_public_assets)
endif()
