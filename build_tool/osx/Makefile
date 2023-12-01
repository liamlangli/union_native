.PHONY: all clean

CCFLAGS+=-Wno-newline-eof -Wno-pedantic

CC=clang
APP=build/app
ENTRY_POINT=src/app/main_linux.c

INC=-I/usr/local/include -Isrc
LIBS=-L/usr/local/lib

# glad deps
INC+=-Ithird_party/glad/include 
SOURCE_FILES+=third_party/glad/src/glad.c

# quickjs deps
INC+=-Ithird_party/quickjs/include
LIBS+=-L/usr/local/lib/quickjs -lquickjs -lm

LIBS+=-lglfw

all:
	$(CC) $(CCFLAGS) $(INC) -o $(APP) $(ENTRY_POINT) $(SOURCE_FILES) $(LIBS)

run: all
	$(APP)

clear:
	rm -rf build