if (ENABLE_MIMALLOC)
    if (WIN32)
        target_link_libraries(${PROJECT_NAME} mimalloc-static)
    else()
        target_link_libraries(${PROJECT_NAME} mimalloc)
    endif()
endif()

if (WIN32)
    # libuv deps
    target_link_libraries(${PROJECT_NAME} uv ws2_32 userenv iphlpapi dbghelp pthread)
    
    # graphics
    target_link_libraries(${PROJECT_NAME} d3d11)

    target_link_libraries(${PROJECT_NAME} quickjs m dl)
elseif (APPLE)
    target_link_libraries(${PROJECT_NAME} quickjs m dl uv)
    target_link_libraries(${PROJECT_NAME} "-framework Cocoa")
    target_link_libraries(${PROJECT_NAME} "-framework CoreAudio")
    target_link_libraries(${PROJECT_NAME} "-framework Foundation")
    target_link_libraries(${PROJECT_NAME} "-framework Metal")
    target_link_libraries(${PROJECT_NAME} "-framework MetalKit")
    target_link_libraries(${PROJECT_NAME} "-framework QuartzCore")
else() # LINUX
    target_link_libraries(${PROJECT_NAME} quickjs rt m dl uv)
endif()
