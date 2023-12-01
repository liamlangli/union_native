union_native
==========

> Cross-Platform script driven application framework.

## Core Components
- Native window management.
- Render system.
    - gles3.2
- Script layer, port cross platform system interface to script environment.
    - Script backend [Javascript]
    - Rendering abstract layer.
    - Network abstract layer. [tcp/udp/http]
    - Basic primitive drawing layer.
    - User interface rendering layer.

## Build
- Collect source files.   
    `make collect`
- Build & Run.   
    `make run`
    

## Dependencies
- Linux
    ```base
    sudo apt install libglfw3-dev
    ```
- Windows platform currently unavaliable, highly recommend use wsl instead.