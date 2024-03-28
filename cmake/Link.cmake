if (ENABLE_MIMALLOC)
    target_link_libraries(${PROJECT_NAME} mimalloc)
endif()

if (WIN32)
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 m dl ws2_32 uv leveldb)
elseif (APPLE)
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw.3 m dl ${LIBUV_LIBRARIES} leveldb)
    target_link_libraries(${PROJECT_NAME} "-framework Foundation")
    target_link_libraries(${PROJECT_NAME} "-framework Metal")
    # framework
    if (${SCRIPT_BACKEND} STREQUAL "Quickjs")
        target_link_libraries(${PROJECT_NAME} "-framework JavaScriptCore")
    endif()
else() # LINUX
    target_link_libraries(${PROJECT_NAME} GLESv2 quickjs glfw3 rt m dl uv leveldb)
endif()
