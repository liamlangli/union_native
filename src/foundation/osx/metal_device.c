#include "metal_device.h"

#ifdef OS_OSX

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

// metal bindings
id MTLCreateSystemDefaultDevice();
typedef enum MTLPixelFormat {
    MTLPixelFormatBGRA8Unorm = 80,
    MTLPixelFormatRGBA8Unorm = 70,
} MTLPixelFormat;
typedef enum MTLCPUCacheMode {
    MTLCPUCacheModeDefaultCache = 0,
    MTLCPUCacheModeWriteCombined = 1,
} MTLCPUCacheMode;
#define MTLResourceCPUCacheModeShift 0
#define MTLResourceCPUCacheModeMask  (0xfUL << MTLResourceCPUCacheModeShift)
#define MTLResourceStorageModeShift  4
#define MTLResourceStorageModeMask   (0xfUL << MTLResourceStorageModeShift)
typedef enum MTLResourceOptions {
    MTLResourceCPUCacheModeDefaultCache  = MTLCPUCacheModeDefaultCache << MTLResourceCPUCacheModeShift,
    MTLResourceCPUCacheModeWriteCombined = MTLCPUCacheModeWriteCombined << MTLResourceCPUCacheModeShift,
} MTLResourceOptions;
typedef enum MTLLoadAction {
    MTLLoadActionDontCare = 0,
    MTLLoadActionLoad     = 1,
    MTLLoadActionClear    = 2,
} MTLLoadAction;
typedef struct MTLClearColor {
    double red;
    double green;
    double blue;
    double alpha;
} MTLClearColor;
typedef enum MTLPrimitiveType {
    MTLPrimitiveTypePoint         = 0,
    MTLPrimitiveTypeLine          = 1,
    MTLPrimitiveTypeLineStrip     = 2,
    MTLPrimitiveTypeTriangle      = 3,
    MTLPrimitiveTypeTriangleStrip = 4,
} MTLPrimitiveType;

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

    // CAMetalLayer
    id metalLayer;

    // MTLCommandQueue
    id cmdQueue;

    // MTLRenderPipelineState
    id pipelineState;

    // MTLBuffer
    id vertexBuffer; // the thing the app wants to render for this frame
} AppData;

// app delegate bits from https://gist.github.com/andsve/2a154a82faa806b3b1d6d71f18a2ad24
Class AppDelegate;
Ivar AppDelegate_AppData;
SEL AppDelegate_windowObserve;
SEL AppDelegate_frameSel;

BOOL delegate_method_yes(id self, SEL cmd)
{
    return YES;
}

// self is AppDelegate instance
// NSNotification nsNotification
void on_window_notification(id self, SEL cmd, id nsNotification) {
    printf("window notification\n");
    id eventName = msg(nsNotification, name);
    NSLog(nsstring("event: %@"), eventName);
    // AppData *appData = (AppData *) object_getIvar(self, AppDelegate_AppData);
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

        // draw with metal
        {
            id drawable = msg(appData->metalLayer, sel("nextDrawable"));
            // MTLRenderPassDescriptor
            id renderPassDesc = cls_msg(cls("MTLRenderPassDescriptor"), sel("renderPassDescriptor"));
            // renderPassDesc.colorAttachments[0]
            id renderPassColor0 = msg(msg(renderPassDesc, sel("colorAttachments")), sel("objectAtIndexedSubscript:"), 0);
            msg(renderPassColor0, sel("setTexture:"), msg(drawable, sel("texture")));
            msg(renderPassColor0, sel("setLoadAction:"), MTLLoadActionClear);
            msg(renderPassColor0, sel("setClearColor:"), (MTLClearColor) { .red = 0, .green = 104.0/255.0, .blue = 55.0/255.0, .alpha = 1.0 });

            // MTLCommandBuffer
            id cmdBuffer = msg(appData->cmdQueue, sel("commandBuffer"));
            id cmdEnc = msg(cmdBuffer, sel("renderCommandEncoderWithDescriptor:"), renderPassDesc);
            msg(cmdEnc, sel("setRenderPipelineState:"), appData->pipelineState);
            msg(cmdEnc, sel("setVertexBuffer:offset:atIndex:"), appData->vertexBuffer, 0, 0);
            msg(cmdEnc, sel("drawPrimitives:vertexStart:vertexCount:"), MTLPrimitiveTypeTriangle, 0, 3, 1);
            msg(cmdEnc, sel("endEncoding"));

            msg(cmdBuffer, sel("presentDrawable:"), drawable);
            msg(cmdBuffer, sel("commit"));
        }
    }
    msg(autoreleasePool, drain);
}

static void init_delegate_class()
{
    AppData app_data_instance;
    AppDelegate = objc_allocateClassPair(objc_getClass("NSObject"), "AppDelegate", 0);
    AppDelegate_windowObserve = sel("windowObserve:");
    AppDelegate_frameSel = sel("frame:");
    class_addMethod(AppDelegate, sel("applicationShouldTerminateAfterLastWindowClosed:"), (IMP) delegate_method_yes, "B@:");
    class_addMethod(AppDelegate, AppDelegate_windowObserve, (IMP) on_window_notification, "v@:@");
    class_addMethod(AppDelegate, AppDelegate_frameSel, (IMP) render_frame, "v@:@");
    class_addIvar(AppDelegate, "app_data", sizeof(AppData *), log2(sizeof(AppData *)), "@");
    objc_registerClassPair(AppDelegate);
    AppDelegate_AppData = class_getInstanceVariable(AppDelegate, "app_data");
    printf("AppDelegate_AppData: %lx\n", (uintptr_t) AppDelegate_AppData);
}

void *metal_device_create()
{
    return NULL;
}

#endif // OS_OSX