interface Device {
    version(): string;
}

declare function create_device(): Device | undefined;