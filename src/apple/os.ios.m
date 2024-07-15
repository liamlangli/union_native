#include <TargetConditionals.h>
#import <UIKit/UIKit.h>

#import <Metal/Metal.h>
#import <MetalKit/MetalKit.h>

#include "foundation/api.h"
#include "os/os.h"

@interface UNAppDelegate : NSObject<UIApplicationDelegate>
@end
static UIWindow* window;

@interface UNViewDelegate : NSObject<MTKViewDelegate>
@end
@interface UNMTKView : MTKView
@end

static int width;
static int height;
static int sample_count;
static const char* window_title;
static id window_delegate;
static id<MTLDevice> mtl_device;
static id mtk_view_delegate;
static MTKView* mtk_view;

static os_window_t _window;
static os_on_launch launch_func = NULL;
static os_on_frame frame_func = NULL;
static os_on_terminate terminate_func = NULL;

static id mtk_view_controller;

//------------------------------------------------------------------------------
@implementation UNAppDelegate
- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    (void)application;
    (void)launchOptions;
    // window delegate and main window
    CGRect mainScreenBounds = [[UIScreen mainScreen] bounds];
    window = [[UIWindow alloc] initWithFrame:mainScreenBounds];
    (void)window_delegate;

    // view delegate, MTKView and Metal device
    mtk_view_delegate = [[UNViewDelegate alloc] init];
    mtl_device = MTLCreateSystemDefaultDevice();
    mtk_view = [[UNMTKView alloc] init];
    [mtk_view setPreferredFramesPerSecond:60];
    [mtk_view setDelegate:mtk_view_delegate];
    [mtk_view setDevice: mtl_device];
    [mtk_view setColorPixelFormat:MTLPixelFormatBGRA8Unorm];
    [mtk_view setDepthStencilPixelFormat:MTLPixelFormatDepth32Float_Stencil8];
    [mtk_view setSampleCount:(NSUInteger)1];

    [mtk_view setContentScaleFactor:1.0f];
    [mtk_view setUserInteractionEnabled:YES];
    [mtk_view setMultipleTouchEnabled:YES];
    [window addSubview:mtk_view];
    mtk_view_controller = [[UIViewController<MTKViewDelegate> alloc] init];
    [mtk_view_controller setView:mtk_view];
    [window setRootViewController:mtk_view_controller];
    [window makeKeyAndVisible];

    _window.width = width;
    _window.height = height;

    // call the init function
    if (launch_func) {
        launch_func(&_window);
    }

    return YES;
}
@end

//------------------------------------------------------------------------------
@implementation UNViewDelegate

- (void)mtkView:(nonnull MTKView*)view drawableSizeWillChange:(CGSize)size {
    (void)view;
    (void)size;
    // FIXME
}

- (void)drawInMTKView:(nonnull MTKView*)view {
    (void)view;
    @autoreleasepool {
        //frame_func();
        if (frame_func != NULL) {
            frame_func(&_window);
        }
    }
}

@end

//------------------------------------------------------------------------------
@implementation UNMTKView

- (BOOL) isOpaque {
    return YES;
}

@end

//------------------------------------------------------------------------------
void osx_start(int w, int h, const char* title) {
    width = w;
    height = h;
    window_title = title;
    #if !OS_IOS
    [UNApp sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    id delg = [[UNAppDelegate alloc] init];
    [NSApp setDelegate:delg];
    [NSApp run];
    #else
    @autoreleasepool {
        int argc = 0;
        char* argv[] = {};
        UIApplicationMain(argc, argv, nil, NSStringFromClass([UNAppDelegate class]));
    }
    #endif
}

/* return current MTKView drawable width */
int osx_width() {
    return (int) [mtk_view drawableSize].width;
}

/* return current MTKView drawable height */
int osx_height() {
    return (int) [mtk_view drawableSize].height;
}

#if defined(__OBJC__)
id<MTLDevice> osx_mtl_device() {
    return mtl_device;
}
#endif

void metal_capture_start(void) {
    MTLCaptureDescriptor *desc = [MTLCaptureDescriptor new];
    desc.captureObject = MTLCreateSystemDefaultDevice();
    desc.destination = MTLCaptureDestinationGPUTraceDocument;
    desc.outputURL = [NSURL fileURLWithPath:@"./capture.gputrace"];
    MTLCaptureManager *mgr = [MTLCaptureManager sharedCaptureManager];
    [mgr supportsDestination: MTLCaptureDestinationGPUTraceDocument];
    NSError *error = nil;
    [mgr startCaptureWithDescriptor:desc error: &error];
    if (error) {
        NSLog(@"start capture error: %@", error);
    }
}

void metal_capture_end(void) {
    MTLCaptureManager *mgr = [MTLCaptureManager sharedCaptureManager];
    if (mgr.isCapturing) {
        [mgr stopCapture];
    }
}

os_window_t* os_window_create(ustring title, int width, int height, os_on_launch on_launch, os_on_frame on_frame, os_on_terminate on_terminate) {
    launch_func = on_launch;
    frame_func = on_frame;
    terminate_func = on_terminate;

    _window.width = width;
    _window.height = height;
    _window.ui_scale = 2.0;
    _window.title = title;
    osx_start(width, height, title.data);
    return &_window;
}

ustring os_window_get_clipboard(os_window_t *window) {
    return ustring_NULL;
}

void os_window_set_clipboard(os_window_t *window, ustring_view text) {}

void os_window_close(os_window_t *window) {
    free(window);
}

void os_window_capture_require(os_window_t *window) {
    window->capture_required = true;
}

void os_window_on_resize(os_window_t *window, int width, int height) {

}
