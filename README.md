union_native
==========

> Cross-Platform script driven application framework.

## Core Components
- Native window management. [GLFW3]
- Render system.
    - [WebGL2.0] google chromium angle.
    - [WebGPU] google chromium dawn.

- Script layer, port cross platform system interface to script environment.
    - Script backend [Javascript]
    - Rendering abstract layer.
    - Network abstract layer. [tcp/udp/http]

## Build
- Collect source files.   
    `make collect`
- Build & Run.   
    `make run`
