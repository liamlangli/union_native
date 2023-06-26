.PHONY: all clean

CC=clang
APP=build/app
XCRUN=xcrun -sdk macosx
ENTRY_POINT=src/main.c

INC += -Isrc

LIBS = `pkg-config --cflags --libs glfw3` -L/usr/local/lib -lm
LIBS += -Lexternal/quickjs/lib/osx -lquickjs
LIBS += -framework AppKit -framework Metal -framework QuartzCore

all: collect
	$(CC) $(CCFLAGS) $(INC) -o $(APP) $(ENTRY_POINT) $(SOURCE_FILES) $(LIBS)

run: all
	$(APP)

clear:
	rm -rf build