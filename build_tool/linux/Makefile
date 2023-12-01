.PHONY: all clean

CC=gcc
APP=build/app
ENTRY_POINT=src/app/main_linux.c

# glad deps
INC=-Isrc -Iexternal/glad/include 
SOURCE_FILES+=external/glad/src/glad.c

# quickjs deps
INC+=-Iexternal/quickjs/include
LIBS+=-Lexternal/quickjs/lib/linux -lquickjs -lm

LIBS+=-L/usr/local/lib -lglfw

all:
	$(CC) $(CCFLAGS) $(INC) -o $(APP) $(ENTRY_POINT) $(SOURCE_FILES) $(LIBS)

run: all
	$(APP)

clear:
	rm -rf build