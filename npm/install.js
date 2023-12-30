const platform_binary = {
    "win32_x64": "@union_native/un_win32_x64",
    "linux_x64": "@union_native/un_linux_x64",
    "darwin_x64": "@union_native/un_darwin_x64"
};

const os = require('os');
const binary_path = `${os.platform()}_${os.arch()}`;
const dep = platform_binary[binary_path];
console.log(`Installing ${dep}`);
