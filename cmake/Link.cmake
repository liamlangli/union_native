# -----------------------------------------------------------------------
# Link Dawn WebGPU libraries
# -----------------------------------------------------------------------
set(DAWN_LIB_DIR ${CMAKE_SOURCE_DIR}/third_party/lib)

if (EXISTS ${DAWN_LIB_DIR}/libdawn_native.a)
    target_link_libraries(${PROJECT_NAME}
        ${DAWN_LIB_DIR}/libdawn_native.a
        ${DAWN_LIB_DIR}/libdawn_proc.a
        ${DAWN_LIB_DIR}/libwebgpu_dawn.a)
elseif (EXISTS ${DAWN_LIB_DIR}/dawn_native.lib)
    target_link_libraries(${PROJECT_NAME}
        ${DAWN_LIB_DIR}/dawn_native.lib
        ${DAWN_LIB_DIR}/dawn_proc.lib
        ${DAWN_LIB_DIR}/webgpu_dawn.lib)
else()
    message(WARNING "Dawn libraries not found. Run: python script/dep.py compile")
endif()

# -----------------------------------------------------------------------
# mimalloc (optional)
# -----------------------------------------------------------------------
if (ENABLE_MIMALLOC)
    if (WIN32)
        target_link_libraries(${PROJECT_NAME} mimalloc-static)
    else()
        target_link_libraries(${PROJECT_NAME} mimalloc)
    endif()
endif()

# -----------------------------------------------------------------------
# Platform-specific links
# -----------------------------------------------------------------------
if (WIN32)
    # libuv
    target_link_libraries(${PROJECT_NAME} uv ws2_32 userenv iphlpapi dbghelp pthread)

    # V8 script engine
    if (EXISTS ${DAWN_LIB_DIR}/v8.lib)
        target_link_libraries(${PROJECT_NAME} ${DAWN_LIB_DIR}/v8.lib)
    elseif (EXISTS ${DAWN_LIB_DIR}/libv8.a)
        target_link_libraries(${PROJECT_NAME} ${DAWN_LIB_DIR}/libv8.a)
    endif()

    # Dawn on Windows uses D3D12
    target_link_libraries(${PROJECT_NAME} d3d12 dxgi dxguid)

    target_link_libraries(${PROJECT_NAME} m dl)

elseif (APPLE)
    target_link_libraries(${PROJECT_NAME} m dl uv)

    # macOS frameworks needed by Dawn (uses Metal internally) and the OS layer
    target_link_libraries(${PROJECT_NAME}
        "-framework Cocoa"
        "-framework CoreAudio"
        "-framework Foundation"
        "-framework Metal"
        "-framework QuartzCore"
        "-framework IOSurface")

    # JavaScriptCore (built into macOS)
    if (SCRIPT_BACKEND STREQUAL "JavaScriptCore")
        target_link_libraries(${PROJECT_NAME} "-framework JavaScriptCore")
    endif()

else() # LINUX
    target_link_libraries(${PROJECT_NAME} rt m dl uv)

    # QuickJS for Linux
    target_link_libraries(${PROJECT_NAME} quickjs)

    # Dawn on Linux uses Vulkan internally
    find_package(Vulkan)
    if (Vulkan_FOUND)
        target_link_libraries(${PROJECT_NAME} Vulkan::Vulkan)
    endif()
endif()
