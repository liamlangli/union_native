.PHONY: all run clean
CC=clang++
app=bin/app

graphics=src/graphics/
objs=$(graphics)vec.cpp \
	 $(graphics)color.cpp \
	 $(graphics)ray.cpp \
	 $(graphics)object.cpp

all:
	$(CC) src/main.cpp $(objs) -o $(app)
run: all
	$(app)
clean:
	rm -i -rf $(app)
