build union_native
==================

> use cmake as default build tool
### install dependencies
- Windows install dependencies with msys2 
    - clang
    - libuv
    - leveldb
- Linux
    - `sudo apt-get install libuv1 libleveldb-dev`
    - [`optional`] clang
- Macos
    - `brew install mimalloc libuv leveldb`