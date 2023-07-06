union_native
==========

> Cross-Platform script driven application framework.

# Intro

# Core Components
- Native window management.
- Native render system.
    - Vulkan [Windows/Linux]
    - Metal [MacOS]
- Script layer, port cross platform system interface to script environment.
    - Script backend [Javascript]
    - Rendering abstract layer.
    - Network abstract layer. [tcp/udp/http]
    - Basic primitive drawing layer.
    - User interface rendering layer.

# Build
- Collect source files.   
    `make collect`
- Convert shader files.   
    `make convert`
- Build & Run.   
    `make run`
    