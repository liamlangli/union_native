union_native
==========

> Cross-Platform script driven application framework.

## Core Components
- Native window management.
- Script graphics api. [`webgpu`]
- Event loop [`libuv`]
- Native graphics api. [`vulkan`, `metal`, `d3d12`]

## Build
```shell
# download dep repos
node build.js download

# compile deps
node build.js compile
# or
node build.js --debug compile

# build with cmake
mkdir build && cd build && cmake .. && make
```