.PHONY: all clean

CC=clang
BUILD_PATH=build/
APP=$(BUILD_PATH)app.exe
ENTRY_POINT=src/main.c

CCFLAGS += -Wgnu-include-next

WINDOWS_SDK_INC=-I"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/ucrt" \
	-I"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/um" \
	-I"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/shared"
WINDOWS_SDK_LIB=-L"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/LIB/10.0.19041.0/ucrt/x64" \
	-L"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/LIB/10.0.19041.0/um/x64"
MSVS_INC=-I"C:/Program\ Files\ \(x86\)/Microsoft\ Visual\ Studio/2019/Community/VC/Tools/MSVC/14.29.30133/include"
MSVS_LIB=-L"C:/Program\ Files\ \(x86\)/Microsoft\ Visual\ Studio/2019/Community/VC/Tools/MSVC/14.29.30133/lib/x64"

GLFW_INC=-I"external/glfw/3.3.8/include"
GLFW_LIB=-L"external/glfw/3.3.8/lib-vc2019" -lglfw3dll
GLFW_DLL="external/glfw/3.3.8/lib-vc2019/glfw3.dll"

CLANG_INC=-I"D:/LLVM/clang/17/include"

VULKAN_INC=-I"D:/VulkanSDK/1.3.250.0/Include"
VULKAN_LIB=-L"D:/VulkanSDK/1.3.250.0/Lib" -l"vulkan-1"

INC=-Isrc -Isrc/foundation -Isrc/public $(WINDOWS_SDK_INC) $(MSVS_INC) $(CLANG_INC) $(GLFW_INC) $(VULKAN_INC)
LINK=$(WINDOWS_SDK_LIB) $(MSVS_LIB) $(GLFW_LIB) $(VULKAN_LIB)

all:
	MSYS_NO_PATHCONV=1 $(CC) $(CCFLAGS) -o $(APP) $(INC) $(ENTRY_POINT) $(SOURCE_FILES) $(LINK)

run: all
	cp $(GLFW_DLL) $(BUILD_PATH)
	./$(APP)

collect:
	python build_tool/collect_source.py $(PLATFORM)

clear:
	rm build