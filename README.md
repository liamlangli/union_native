@unionengine/native
-------------------

> script driven application framework.

## Core Components
- Native window management.
- Script graphics api. [`webgpu`]
- Event loop [`libuv`]
- Native graphics api. [`vulkan`, `metal`, `d3d12`]

## Build
```shell
# download dep repos
python script/dep.py download

# compile deps
python script/dep.py compile
# or
python script/dep.py --debug compile

# build with cmake
mkdir build && cd build && cmake .. && make
```