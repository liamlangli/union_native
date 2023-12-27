union_native
==========

> Cross-Platform script driven application framework.

## Core Components
- Native window management. [`GLFW3`]
- Render system. [`OpenGL`/`WebGPU`/`Metal`]
- Event loop [`libuv`]

## Graphics API
|Platform/GraphicsAPI|GLES3/WebGL2|WebGPU|Metal|
|:----:|:------:|:---:|:---:|
|Window|complete|  WIP|     |
| MacOS|complete|  WIP|  WIP|
| Linux|complete|  WIP|     |

## Build
> use cmake as default build tool
### install dependencies
- Winoows install dependencies with msys2 
    - clang
    - glfw3
    - libuv
    - build & install [Angle](https://chromium.googlesource.com/angle/angle) project.
- Linux
    - `sudo apt-get install libglfw3-dev libgles2-mesa-dev libuv1`
    - build & install [Angle](https://chromium.googlesource.com/angle/angle) project.
- Macos
    - `brew install glfw3`
    - `brew install libuv`
    - project provide a precompiled [MetalANGLE](https://github.com/kakashidinho/metalangle) library