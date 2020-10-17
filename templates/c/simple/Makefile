CC=gcc
CFLAGS=-Isrc/
DEPS =
OBJ = build/main.o

build/%.o: src/%.c $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)

main: $(OBJ)
	$(CC) -o $@ $^ $(CFLAGS)