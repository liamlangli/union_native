.PHONY: all clean

CCFLAGS+=-Wno-newline-eof

CC=gcc
APP=build/app
ENTRY_POINT=src/app/main_linux.c

INC=-I/usr/local/include -Isrc
LIBS=-L/usr/local/lib

# glad deps
INC+=-Iexternal/glad/include 
SOURCE_FILES+=external/glad/src/glad.c

# quickjs deps
INC+=-Iexternal/quickjs/include
LIBS+=-Lexternal/quickjs/lib/osx -lquickjs -lm

LIBS+=-lglfw

all:
	$(CC) $(CCFLAGS) $(INC) -o $(APP) $(ENTRY_POINT) $(SOURCE_FILES) $(LIBS)

run: all
	$(APP)

clear:
	rm -rf build