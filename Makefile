.PHONY: all run clean so test run_test

# config
CC=clang
app=bin/app
test=bin/test

# objects group
common=src/common/common.c
graphics=src/graphics/
io=src/io/
dtype=src/dtype/


include=-I$(common)common.h -I$(graphics)graphics.h -I$(io)io.h -I$(dtype)dtype.h
libs=

# shared library name
so=dist/rt.so

objs=$(common) \
	 $(graphics)vec.c \
	 $(graphics)color.c  \
	 $(graphics)ray.c \
	 $(graphics)object.c \
	 $(graphics)math.c \
	 $(dtype)array.c

all:
	$(CC) src/main.c $(include) $(objs) -o $(app)

run: all
	$(app)

run_test: test
	$(test)

test:src/test/test.c $(objs)
	$(CC) $< $(include) $(objs) -o $(test)

so:$(objs)
	$(CC) -shared -fPIC $^ -o $(so)

clean:
	rm -i -rf $(app)
