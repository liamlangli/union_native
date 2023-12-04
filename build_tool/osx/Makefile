.PHONY: all clean

CCFLAGS+=-Wno-newline-eof -Wno-pedantic -rpath @executable_path/

CC=clang
APP=$(OUTPUT_DIR)/app
ENTRY_POINT=src/app/main_linux.c

INC=-I/usr/local/include -Isrc
LIBS=-L/usr/local/lib

# angle
INC+=-Ithird_party/angle/include 
LIBS+=-Lthird_party/angle/lib/osx -lGLESv2 -lEGL

# quickjs deps
INC+=-Ithird_party/quickjs/include
LIBS+=-L/usr/local/lib/quickjs -lquickjs -lm

LIBS+=-lglfw

all:
	cp third_party/angle/lib/osx/* $(OUTPUT_DIR)/
	$(CC) $(CCFLAGS) $(INC) -o $(APP) $(ENTRY_POINT) $(SOURCE_FILES) $(LIBS)

run: all
	$(APP) example/public/index.js

clear:
	rm -rf build
