#include "os/os.h"
#include "Cocoa/Cocoa.h"

ustring os_get_bundle_path(ustring path) {
    NSString* bundle_path = [[NSBundle mainBundle] bundlePath];
    NSString* file_path = [bundle_path stringByAppendingPathComponent:[NSString stringWithUTF8String: path.data]];
    const i8* cstr = [file_path UTF8String];
    const u32 length = (u32)strlen(cstr);
    i8* data = malloc(length + 1);
    memcpy(data, cstr, length);
    data[length] = '\0';
    return (ustring){.data = data, .length = length, .null_terminated = true };
}
