
CCFLAGS = -pedantic -std=c11 -g -O0

# detect current os and set the correct path
ifeq ($(OS),Windows_NT)
	OS=Windows
else
	OS=$(shell uname -s)
endif

ifeq ($(OS),Windows)
	include Makefile_win
	CCFLAGS += -DOS_WINDOWS
	PLATFORM=OS_WINDOWS
else ifeq ($(OS),Linux)
	include Makefile_linux
	CCFLAGS += -DOS_LINUX
	PLATFORM=OS_LINUX
else ifeq ($(OS),Darwin)
	include Makefile_osx
	CCFLAGS += -DOS_OSX
	PLATFORM=OS_OSX
else
	$(error OS not supported)
endif

-include build/Makefile_source

collect:
	mkdir -p build
	python build_tool/collect_source.py $(PLATFORM)

clear:
	rm -rf build