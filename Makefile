
# detect current os and set the correct path
ifeq ($(OS),Windows_NT)
	OS=Windows
else
	OS=$(shell uname -s)
endif

ifeq ($(OS),Windows)
	include build_tool/win/Makefile
	CCFLAGS = -pedantic -std=c11 -g -O0 -DOS_WINDOWS
	PLATFORM=OS_WINDOWS
else ifeq ($(OS),Linux)
	include build_tool/linux/Makefile
	CCFLAGS = -pedantic -std=c11 -g -O0 -DOS_LINUX
	PLATFORM=OS_LINUX
else ifeq ($(OS),Darwin)
	include build_tool/osx/Makefile
	CCFLAGS = -pedantic -std=c11 -g -O0 -DOS_OSX
	PLATFORM=OS_OSX
else
	$(error OS not supported)
endif

-include build/Makefile_source

INC += -Iexternal/quickjs/include
CCFLAGS += -DSCRIPT_BACKEND_JS