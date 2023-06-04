// How to build:
// clang small.c -framework Cocoa
//
// Small example to demonstrate a cocoa app in pure C with a frame render callback
//

#include <objc/runtime.h>
#include <objc/message.h>

#include <Carbon/Carbon.h>

#define cls objc_getClass
#define sel sel_getUid

typedef id (*object_message_send)(id, SEL, ...);
typedef id (*class_message_send)(Class, SEL, ...);

#define msg ((object_message_send)objc_msgSend)
#define cls_msg ((class_message_send)objc_msgSend)

typedef id (*MethodImp)(id, SEL, ...);
typedef MethodImp (*get_method_imp)(Class, SEL);
#define method ((get_method_imp)class_getMethodImplementation)

// poor man's bindings!
void NSLog(id format, ...);
typedef enum NSApplicationActivationPolicy {
    NSApplicationActivationPolicyRegular,
    NSApplicationActivationPolicyAccessory,
    NSApplicationActivationPolicyERROR,
} NSApplicationActivationPolicy;

typedef enum NSWindowStyleMask {
    NSWindowStyleMaskBorderless     = 0,
    NSWindowStyleMaskTitled         = 1 << 0,
    NSWindowStyleMaskClosable       = 1 << 1,
    NSWindowStyleMaskMiniaturizable = 1 << 2,
    NSWindowStyleMaskResizable      = 1 << 3,
} NSWindowStyleMask;

typedef enum NSBackingStoreType {
    NSBackingStoreBuffered = 2,
} NSBackingStoreType;

Class NSString;
SEL stringWithUTF8String;

SEL init;
SEL alloc;
SEL name;

Class NSAutoreleasePool;
SEL drain;

Class NSApplication;

id NSDefaultRunLoopMode;

id nsstring(const char *str) {
    return cls_msg(NSString, stringWithUTF8String, str);
}

Class NSApp;
SEL selNextEvent;
MethodImp App_NextEvent_Imp;

void init_refs() {
    NSString = cls("NSString");
    stringWithUTF8String = sel("stringWithUTF8String:");

    NSApplication = cls("NSApplication");
    selNextEvent = sel("nextEventMatchingMask:untilDate:inMode:dequeue:");
    App_NextEvent_Imp = method(NSApplication, selNextEvent);

    NSAutoreleasePool = cls("NSAutoreleasePool");
    drain = sel("drain");

    init = sel("init");
    alloc = sel("alloc");
    name = sel("name");

    NSApplication = cls("NSApplication");

    NSDefaultRunLoopMode = nsstring("kCFRunLoopDefaultMode");
}

typedef struct AppData {
    id app;
    id window;
    BOOL terminate_after_last_window;
} AppData;

// app delegate bits from https://gist.github.com/andsve/2a154a82faa806b3b1d6d71f18a2ad24
Class AppDelegate;
Ivar AppDelegate_AppData;
SEL AppDelegate_frameSel;

BOOL app_should_terminate_after_last_window(id self, SEL cmd)
{
    AppData *appData = (AppData *) object_getIvar(self, AppDelegate_AppData);
    return appData->terminate_after_last_window;
}

// displayLink: CADisplayLink
void render_frame(id self, SEL cmd, id displayLink) {
    // printf("self: %lx\n", (uintptr_t) self);
    AppData *appData = (AppData *) object_getIvar(self, AppDelegate_AppData);
    // printf("appData: %lx\n", (uintptr_t) appData);

    id autoreleasePool = msg(cls_msg(NSAutoreleasePool, alloc), init);
    {
        // read events
        id event = App_NextEvent_Imp(appData->app, selNextEvent, INT_MAX, 0, NSDefaultRunLoopMode, 1);
        if (event) {
            printf("event: %lx\n", (uintptr_t) event);
            // TODO!
        }
        // TODO: handle frame!
    }
    msg(autoreleasePool, drain);
}

static void init_delegate_class()
{
    AppData app_data_instance;
    AppDelegate = objc_allocateClassPair(objc_getClass("NSObject"), "AppDelegate", 0);
    AppDelegate_frameSel = sel("frame:");
    class_addMethod(AppDelegate, sel("applicationShouldTerminateAfterLastWindowClosed:"), (IMP) app_should_terminate_after_last_window, "B@:");
    class_addMethod(AppDelegate, AppDelegate_frameSel, (IMP) render_frame, "v@:@");
    class_addIvar(AppDelegate, "app_data", sizeof(AppData *), log2(sizeof(AppData *)), "@");
    objc_registerClassPair(AppDelegate);
    AppDelegate_AppData = class_getInstanceVariable(AppDelegate, "app_data");
    printf("AppDelegate_AppData: %lx\n", (uintptr_t) AppDelegate_AppData);
}

// based on https://stackoverflow.com/a/30269562/35364
int main(int argc, char *argv[])
{
    init_refs();
    init_delegate_class();

    AppData appData;
    appData.terminate_after_last_window = true;

    // [NSApplication sharedApplication];
    id app = cls_msg(NSApplication, sel("sharedApplication"));
    appData.app = app;

    // [app setActivationPolicy:NSApplicationActivationPolicyRegular];
    msg(app, sel("setActivationPolicy:"), NSApplicationActivationPolicyRegular);

    struct CGRect frameRect = {0, 0, 600, 500};

    // id window = [[NSWindow alloc] initWithContentRect:frameRect styleMask:NSWindowStyleMaskTitled backing:NSBackingStoreBuffered defer:NO];
    Class NSWindow = cls("NSWindow");
    id window = msg(cls_msg(NSWindow, alloc),
                    sel("initWithContentRect:styleMask:backing:defer:"),
                    frameRect,
                    NSWindowStyleMaskTitled|NSWindowStyleMaskClosable|NSWindowStyleMaskResizable,
                    NSBackingStoreBuffered,
                    false);
    appData.window = window;
    msg(window, sel("setTitle:"), nsstring("Pure C App"));

    // [window makeKeyAndOrderFront:nil];
    msg(window, sel("makeKeyAndOrderFront:"), nil);

    // [app activateIgnoringOtherApps:YES];
    msg(app, sel("activateIgnoringOtherApps:"), true);

    // id delegate = [[AppDelegate alloc] init]
    // [app setDelegate:delegate]
    id delegate = msg(cls_msg(AppDelegate, alloc), init);
    msg(app, sel("setDelegate:"), delegate);

    // delegate.app_data = &appData;
    object_setIvar(delegate, AppDelegate_AppData, (id) &appData);

    // call us on every frame!
    Class CADisplayLink = cls("CADisplayLink");
    id timer = cls_msg(CADisplayLink, sel("displayLinkWithTarget:selector:"), delegate, AppDelegate_frameSel);
    msg(timer, sel("addToRunLoop:forMode:"),
        cls_msg(cls("NSRunLoop"), sel("mainRunLoop")), // NSRunLoop.mainRunLoop
        NSDefaultRunLoopMode);

    msg(app, sel("run"));
}