.PHONY: all run clean
CC=clang
app=bin/app
test=bin/test

graphics=src/graphics/
io=src/io/

objs=$(graphics)vec.c \
	 $(graphics)color.c  \
	 $(graphics)ray.c \
	 $(graphics)object.c \
	 $(graphics)math.c 

all:
	$(CC) src/main.c $(objs) -o $(app)

run: all
	$(app)

run_test: test
	$(test)

test: src/test/test.c $(objs)
	$(CC) $< $(objs) -o $(test)


clean:
	rm -i -rf $(app)
