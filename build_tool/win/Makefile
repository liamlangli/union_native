.PHONY: all clean

CC=clang
APP=build/app.exe
ENTRY_POINT=src/main.c

WINDOWS_SDK_INC=-I"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/ucrt" \
	-I"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/um" \
	-I"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/shared"
WINDOWS_SDK_LIB=-L"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/LIB/10.0.19041.0/ucrt/x64" \
	-L"C:/Program\ Files\ \(x86\)/Windows\ Kits/10/LIB/10.0.19041.0/um/x64"
MSVS_INC=-I"C:/Program\ Files\ \(x86\)/Microsoft\ Visual\ Studio/2019/Community/VC/Tools/MSVC/14.29.30133/include"
MSVS_LIB=-L"C:/Program\ Files\ \(x86\)/Microsoft\ Visual\ Studio/2019/Community/VC/Tools/MSVC/14.29.30133/lib/x64"

CLANG_INC=-I"D:/LLVM/clang/17/include"

INC=-Isrc/foundation -Isrc/public $(WINDOWS_SDK_INC) $(MSVS_INC) $(CLANG_INC)
LINK=$(WINDOWS_SDK_LIB) $(MSVS_LIB)

all:
	MSYS_NO_PATHCONV=1 $(CC) -o $(APP) $(INC) $(ENTRY_POINT) $(SOURCE_FILES) $(LINK)

run: all
	./$(APP)

collect:
	python build_tool/collect_source.py $(PLATFORM)

clear:
	rm build