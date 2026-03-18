# -----------------------------------------------------------------------
# Link Dawn WebGPU libraries
# -----------------------------------------------------------------------
set(DAWN_LIB_DIR ${CMAKE_SOURCE_DIR}/third_party/lib)

if (EXISTS ${DAWN_LIB_DIR}/libdawn_native.a)
    set(DAWN_NATIVE_LIB ${DAWN_LIB_DIR}/libdawn_native.a)
elseif (EXISTS ${DAWN_LIB_DIR}/dawn_native.lib)
    set(DAWN_NATIVE_LIB ${DAWN_LIB_DIR}/dawn_native.lib)
endif()

if (EXISTS ${DAWN_LIB_DIR}/libdawn_proc.a)
    set(DAWN_PROC_LIB ${DAWN_LIB_DIR}/libdawn_proc.a)
elseif (EXISTS ${DAWN_LIB_DIR}/dawn_proc.lib)
    set(DAWN_PROC_LIB ${DAWN_LIB_DIR}/dawn_proc.lib)
endif()

if (EXISTS ${DAWN_LIB_DIR}/libwebgpu_dawn.a)
    set(WEBGPU_DAWN_LIB ${DAWN_LIB_DIR}/libwebgpu_dawn.a)
elseif (EXISTS ${DAWN_LIB_DIR}/webgpu_dawn.lib)
    set(WEBGPU_DAWN_LIB ${DAWN_LIB_DIR}/webgpu_dawn.lib)
elseif (EXISTS ${DAWN_LIB_DIR}/libwebgpu_dawn.dylib)
    set(WEBGPU_DAWN_LIB ${DAWN_LIB_DIR}/libwebgpu_dawn.dylib)
elseif (EXISTS ${DAWN_LIB_DIR}/libwebgpu_dawn.so)
    set(WEBGPU_DAWN_LIB ${DAWN_LIB_DIR}/libwebgpu_dawn.so)
endif()

if (DAWN_NATIVE_LIB AND DAWN_PROC_LIB AND WEBGPU_DAWN_LIB)
    target_link_libraries(${PROJECT_NAME}
        ${DAWN_NATIVE_LIB}
        ${DAWN_PROC_LIB}
        ${WEBGPU_DAWN_LIB})
else()
    message(WARNING "Dawn libraries not found. Run: python script/dep.py compile")
endif()

# -----------------------------------------------------------------------
# Platform-specific links
# -----------------------------------------------------------------------
if (WIN32)
    target_link_libraries(${PROJECT_NAME} ws2_32 userenv iphlpapi dbghelp)

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
    target_link_libraries(${PROJECT_NAME} m dl)

    # macOS frameworks needed by Dawn (uses Metal internally) and the OS layer
    target_link_libraries(${PROJECT_NAME}
        "-framework Cocoa"
        "-framework CoreAudio"
        "-framework Foundation"
        "-framework IOKit"
        "-framework Metal"
        "-framework QuartzCore"
        "-framework IOSurface")

    # JavaScriptCore (built into macOS)
    if (SCRIPT_BACKEND STREQUAL "JavaScriptCore")
        target_link_libraries(${PROJECT_NAME} "-framework JavaScriptCore")
    endif()

else() # LINUX
    target_link_libraries(${PROJECT_NAME} rt m dl pthread)

    # Dawn on Linux uses Vulkan internally
    find_package(Vulkan)
    if (Vulkan_FOUND)
        target_link_libraries(${PROJECT_NAME} Vulkan::Vulkan)
    endif()
endif()
