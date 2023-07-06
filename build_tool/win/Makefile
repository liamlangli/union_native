.PHONY: all clean

VULKAN_INSTALL_PATH=D:/VulkanSDK/1.3.250.0

CC=clang
BUILD_PATH=build/
APP=$(BUILD_PATH)app.exe
ENTRY_POINT=src/main.c

CCFLAGS += -Wgnu-include-next

MINGW_INC=-I"D:/mingw_w64/include"
MINGW_LIB=-L"D:/mingw_w64/x86_64-w64-mingw32/lib"

GLFW_INC=-I"external/glfw/3.3.8/include"
GLFW_LIB=-L"external/glfw/3.3.8/lib-vc2019" -lglfw3dll
GLFW_DLL="external/glfw/3.3.8/lib-vc2019/glfw3.dll"

VULKAN_INC=-I$(VULKAN_INSTALL_PATH)/Include
VULKAN_LIB=-L$(VULKAN_INSTALL_PATH)/Lib -l"vulkan-1"

QUICKJS_INC=-I"external/quickjs/include"
QUICKJS_LIB=-L"external/quickjs/lib/mingw_w64" -lquickjs -lpthread

INC +=-Isrc -Isrc/foundation -Isrc/public $(MINGW_INC)
LIBS = $(MINGW_LIB)

INC += $(GLFW_INC) $(VULKAN_INC) $(QUICKJS_INC)
LIBS += $(GLFW_LIB) $(VULKAN_LIB) $(QUICKJS_LIB)

all:
	MSYS_NO_PATHCONV=1 $(CC) $(CCFLAGS) -o $(APP) $(INC) $(ENTRY_POINT) $(SOURCE_FILES) $(LIBS)

run: all
	cp $(GLFW_DLL) $(BUILD_PATH)
	./$(APP)

clear:
	rm build