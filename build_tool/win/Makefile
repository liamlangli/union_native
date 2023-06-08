.PHONY: all clean

CC=cl.exe
APP=build/app.exe
ENTRY_POINT=src/main.c

WINDOWS_SDK_INC=/IC:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/ucrt \
	/IC:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/um \
	/IC:/Program\ Files\ \(x86\)/Windows\ Kits/10/Include/10.0.19041.0/shared
WINDOWS_SDK_LIB=/LIBPATH:C:/Program\ Files\ \(x86\)/Windows\ Kits/10/LIB/10.0.19041.0/ucrt/x64 \
	/LIBPATH:C:/Program\ Files\ \(x86\)/Windows\ Kits/10/LIB/10.0.19041.0/um/x64
MSVS_INC=/IC:/Program\ Files\ \(x86\)/Microsoft\ Visual\ Studio/2019/Community/VC/Tools/MSVC/14.29.30133/include
MSVS_LIB=/LIBPATH:C:/Program\ Files\ \(x86\)/Microsoft\ Visual\ Studio/2019/Community/VC/Tools/MSVC/14.29.30133/lib/x64

INC=/Isrc/foundation /Isrc/public $(WINDOWS_SDK_INC) $(MSVS_INC)
LINK=/link $(WINDOWS_SDK_LIB) $(MSVS_LIB)

all: $(APP)
	MSYS_NO_PATHCONV=1 $(CC) /Fe:$(APP) $(INC) $(ENTRY_POINT) $(SOURCE_FILES) $(LINK)
	mv *.obj build

run: all
	./$(APP)

collect:
	python build_tool/collect_source.py $(PLATFORM)

clear:
	rm build