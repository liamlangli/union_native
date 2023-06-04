.PHONY: all clean

CC=clang
APP=build/app
XCRUN=xcrun -sdk macosx
ENTRY_POINT=src/main_new.c

INC=-Isrc/foundation -Isrc/public
LIBS=-framework Metal -framework Cocoa
FOUNDATION_SRC=src/foundation/allocator.c src/foundation/worker.c

all: build/base.metallib $(FOUNDATION_SRC)
	$(CC) -g -O0 $(INC) ${LIBS} -o $(APP) $(ENTRY_POINT) $(FOUNDATION_SRC)

run: all
	$(APP)

build/base.metallib: resource/shader/metal/base.metal
	$(XCRUN) metal -c $^ -o build/base.air
	$(XCRUN) metallib build/base.air -o $@

