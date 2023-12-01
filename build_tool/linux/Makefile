.PHONY: all clean

CC=gcc
APP=build/app
ENTRY_POINT=src/app/main_linux.c

INC=-I/usr/local/include -Isrc
LIBS=-L/usr/local/lib

# glad deps
INC+= -Ithird_party/glad/include 
SOURCE_FILES+=third_party/glad/src/glad.c

# quickjs deps
INC+=-Ithird_party/quickjs/include
LIBS+=-Lthird_party/quickjs/lib/linux -lquickjs -lm

# glfw deps
LIBS+=-lglfw

all:
	$(CC) $(CCFLAGS) $(INC) -o $(APP) $(ENTRY_POINT) $(SOURCE_FILES) $(LIBS)

run: all
	$(APP)

clear:
	rm -rf build