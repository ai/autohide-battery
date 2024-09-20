.PHONY: test clean build local

test: build

clean:
	rm -f *.zip

build: clean
	gnome-extensions pack ./

local: build
	gnome-extensions install -f *.zip
