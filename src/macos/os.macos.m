
#include <TargetConditionals.h>
#if !TARGET_OS_IPHONE
#import <Cocoa/Cocoa.h>
#import <QuartzCore/QuartzCore.h>
#else
#import <UIKit/UIKit.h>
#endif

#import <Metal/Metal.h>
#import <MetalKit/MetalKit.h>

#define SOKOL_GFX_IMPL
#define SOKOL_METAL
#include <sokol_gfx.h>
#include <sokol_log.h>

#include "foundation/api.h"
#include "os/os.h"


#if !TARGET_OS_IPHONE
@interface SokolApp : NSApplication
@end
@interface SokolAppDelegate : NSObject<NSApplicationDelegate>
@end
@interface SokolWindowDelegate : NSObject<NSWindowDelegate>
@end
static NSWindow* window;
#else
@interface SokolAppDelegate : NSObject<UIApplicationDelegate>
@end
static UIWindow* window;
#endif
@interface SokolViewDelegate : NSObject<MTKViewDelegate>
@end
@interface SokolMTKView : MTKView
@end

static int width;
static int height;
static int sample_count;
static sg_pixel_format depth_format;
static const char* window_title;
static id window_delegate;
static id<MTLDevice> mtl_device;
static id mtk_view_delegate;
static MTKView* mtk_view;

static os_window_t *_window;
static os_on_launch launch_func = NULL;
static os_on_frame frame_func = NULL;
static os_on_terminate terminate_func = NULL;


#if TARGET_OS_IPHONE
static id mtk_view_controller;
#endif

sg_swapchain osx_swapchain(void);
sg_environment osx_environment(void);

#if !TARGET_OS_IPHONE
//------------------------------------------------------------------------------
@implementation SokolApp
// From http://cocoadev.com/index.pl?GameKeyboardHandlingAlmost
// This works around an AppKit bug, where key up events while holding
// down the command key don't get sent to the key window.
- (void)sendEvent:(NSEvent*) event {
    if ([event type] == NSEventTypeKeyUp && ([event modifierFlags] & NSEventModifierFlagCommand)) {
        [[self keyWindow] sendEvent:event];
    }
    else {
        [super sendEvent:event];
    }
}
@end
#endif

//------------------------------------------------------------------------------
@implementation SokolAppDelegate
#if !TARGET_OS_IPHONE
- (void)applicationDidFinishLaunching:(NSNotification*)aNotification {
    (void)aNotification;
#else
- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    (void)application;
    (void)launchOptions;
#endif
    // window delegate and main window
    #if TARGET_OS_IPHONE
        CGRect mainScreenBounds = [[UIScreen mainScreen] bounds];
        window = [[UIWindow alloc] initWithFrame:mainScreenBounds];
        (void)window_delegate;
    #else
        window_delegate = [[SokolWindowDelegate alloc] init];
        const NSUInteger style =
            NSWindowStyleMaskTitled |
            NSWindowStyleMaskClosable |
            NSWindowStyleMaskMiniaturizable |
            NSWindowStyleMaskResizable;
        window = [[NSWindow alloc]
            initWithContentRect:NSMakeRect(0, 0, width, height)
            styleMask:style
            backing:NSBackingStoreBuffered
            defer:NO];
        [window setTitle:[NSString stringWithUTF8String:window_title]];
        [window setAcceptsMouseMovedEvents:YES];
        [window center];
        [window setRestorable:YES];
        [window setDelegate:window_delegate];
    #endif

    // view delegate, MTKView and Metal device
    mtk_view_delegate = [[SokolViewDelegate alloc] init];
    mtl_device = MTLCreateSystemDefaultDevice();
    mtk_view = [[SokolMTKView alloc] init];
    [mtk_view setPreferredFramesPerSecond:60];
    [mtk_view setDelegate:mtk_view_delegate];
    [mtk_view setDevice: mtl_device];
    [mtk_view setColorPixelFormat:MTLPixelFormatBGRA8Unorm];
    switch (depth_format) {
        case SG_PIXELFORMAT_DEPTH_STENCIL:
            [mtk_view setDepthStencilPixelFormat:MTLPixelFormatDepth32Float_Stencil8];
            break;
        case SG_PIXELFORMAT_DEPTH:
            [mtk_view setDepthStencilPixelFormat:MTLPixelFormatDepth32Float];
            break;
        default:
            [mtk_view setDepthStencilPixelFormat:MTLPixelFormatInvalid];
            break;
    }
    [mtk_view setSampleCount:(NSUInteger)sample_count];
    #if !TARGET_OS_IPHONE
        [window setContentView:mtk_view];
        CGSize drawable_size = { (CGFloat) width, (CGFloat) height };
        [mtk_view setDrawableSize:drawable_size];
        [[mtk_view layer] setMagnificationFilter:kCAFilterNearest];
        NSApp.activationPolicy = NSApplicationActivationPolicyRegular;
        [NSApp activateIgnoringOtherApps:YES];
        [window makeKeyAndOrderFront:nil];
    #else
        [mtk_view setContentScaleFactor:1.0f];
        [mtk_view setUserInteractionEnabled:YES];
        [mtk_view setMultipleTouchEnabled:YES];
        [window addSubview:mtk_view];
        mtk_view_controller = [[UIViewController<MTKViewDelegate> alloc] init];
        [mtk_view_controller setView:mtk_view];
        [window setRootViewController:mtk_view_controller];
        [window makeKeyAndVisible];
    #endif

    sg_setup(&(sg_desc){
        .environment = osx_environment(),
        .logger.func = slog_func,
    });

    // call the init function
    if (launch_func) {
        launch_func(_window);
    }


    #if TARGET_OS_IPHONE
        return YES;
    #endif
}

#if !TARGET_OS_IPHONE
- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication*)sender {
    (void)sender;
    return YES;
}
#endif
@end

//------------------------------------------------------------------------------
#if !TARGET_OS_IPHONE
@implementation SokolWindowDelegate
- (BOOL)windowShouldClose:(id)sender {
    (void)sender;
    // shutdown_func();
    if (terminate_func) {
        terminate_func(_window);
    }
    return YES;
}

- (void)windowDidResize:(NSNotification*)notification {
    (void)notification;
    // FIXME
}

- (void)windowDidMove:(NSNotification*)notification {
    (void)notification;
    // FIXME
}

- (void)windowDidMiniaturize:(NSNotification*)notification {
    (void)notification;
    // FIXME
}

- (void)windowDidDeminiaturize:(NSNotification*)notification {
    (void)notification;
    // FIXME
}

- (void)windowDidBecomeKey:(NSNotification*)notification {
    (void)notification;
    // FIXME
}

- (void)windowDidResignKey:(NSNotification*)notification {
    (void)notification;
    // FIXME
}
@end
#endif

//------------------------------------------------------------------------------
@implementation SokolViewDelegate

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
            frame_func(_window);
        }
        static sg_pass_action action = {0};
        sg_begin_pass(&(sg_pass){.action = action, .swapchain = osx_swapchain()});
        sg_end_pass();
        sg_commit();
    }
}
@end

//------------------------------------------------------------------------------
@implementation SokolMTKView

- (BOOL) isOpaque {
    return YES;
}

#if !TARGET_OS_IPHONE
- (BOOL)canBecomeKeyView {
    return YES;
}

- (BOOL)acceptsFirstResponder {
    return YES;
}

- (void)mouseDown:(NSEvent*)event {
    (void)event;
    // if (mouse_btn_down_func) {
    //     mouse_btn_down_func(0);
    // }
}

- (void)mouseDragged:(NSEvent*)event {
    [self mouseMoved:event];
}

- (void)mouseUp:(NSEvent*)event {
    (void)event;
    // if (mouse_btn_up_func) {
    //     mouse_btn_up_func(0);
    // }
}

- (void)mouseMoved:(NSEvent*)event {
    // if (mouse_pos_func) {
    //     const NSRect content_rect = [mtk_view frame];
    //     const NSPoint pos = [event locationInWindow];
    //     mouse_pos_func(pos.x, content_rect.size.height - pos.y);
    // }
}

- (void)rightMouseDown:(NSEvent*)event {
    (void)event;
    // if (mouse_btn_down_func) {
    //     mouse_btn_down_func(1);
    // }
}

- (void)rightMouseDragged:(NSEvent*)event {
    [self mouseMoved:event];
}

- (void)rightMouseUp:(NSEvent*)event {
    (void)event;
    // if (mouse_btn_up_func) {
    //     mouse_btn_up_func(1);
    // }
}

- (void)keyDown:(NSEvent*)event {
    // if (key_down_func) {
    //     key_down_func([event keyCode]);
    // }
    // if (char_func) {
    //     const NSString* characters = [event characters];
    //     const NSUInteger length = [characters length];
    //     for (NSUInteger i = 0; i < length; i++) {
    //         const unichar codepoint = [characters characterAtIndex:i];
    //         if ((codepoint & 0xFF00) == 0xF700) {
    //             continue;
    //         }
    //         char_func(codepoint);
    //     }
    // }
}

- (void)flagsChanged:(NSEvent*)event {
    // if (key_up_func) {
    //     key_up_func([event keyCode]);
    // }
}

- (void)keyUp:(NSEvent*)event {
    // if (key_up_func) {
    //     key_up_func([event keyCode]);
    // }
}

- (void)scrollWheel:(NSEvent*)event {
    // if (mouse_wheel_func) {
    //     double dy = [event scrollingDeltaY];
    //     if ([event hasPreciseScrollingDeltas]) {
    //         dy *= 0.1;
    //     }
    //     mouse_wheel_func(dy);
    // }
}
#endif
@end

//------------------------------------------------------------------------------
void osx_start(int w, int h, int smp_count, sg_pixel_format depth_fmt, const char* title) {
    assert((depth_fmt == SG_PIXELFORMAT_DEPTH_STENCIL) || (depth_fmt == SG_PIXELFORMAT_DEPTH) || (depth_fmt == SG_PIXELFORMAT_NONE));
    width = w;
    height = h;
    sample_count = smp_count;
    depth_format = depth_fmt;
    window_title = title;
    #if !TARGET_OS_IPHONE
    [SokolApp sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    id delg = [[SokolAppDelegate alloc] init];
    [NSApp setDelegate:delg];
    [NSApp run];
    #else
    @autoreleasepool {
        int argc = 0;
        char* argv[] = {};
        UIApplicationMain(argc, argv, nil, NSStringFromClass([SokolAppDelegate class]));
    }
    #endif
}

sg_environment osx_environment(void) {
    return (sg_environment) {
        .defaults = {
            .sample_count = sample_count,
            .color_format = SG_PIXELFORMAT_BGRA8,
            .depth_format = depth_format,
        },
        .metal = {
            .device = (__bridge const void*) mtl_device,
        }
    };
}

sg_swapchain osx_swapchain(void) {
    return (sg_swapchain) {
        .width = (int) [mtk_view drawableSize].width,
        .height = (int) [mtk_view drawableSize].height,
        .sample_count = sample_count,
        .color_format = SG_PIXELFORMAT_BGRA8,
        .depth_format = depth_format,
        .metal = {
            .current_drawable = (__bridge const void*) [mtk_view currentDrawable],
            .depth_stencil_texture = (__bridge const void*) [mtk_view depthStencilTexture],
            .msaa_color_texture = (__bridge const void*) [mtk_view multisampleColorTexture],
        }
    };
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
    sg_pixel_format depth_fmt = SG_PIXELFORMAT_NONE;
    osx_start(width, height,  1, depth_fmt, title.data);

    os_window_t* window = malloc(sizeof(os_window_t));
    window->width = width;
    window->height = height;
    window->ui_scale = 2.0;
    window->title = title;
    window->native_window = mtk_view;
    window->native_context = mtl_device;
    _window = window;

    launch_func = on_launch;
    frame_func = on_frame;
    terminate_func = on_terminate;

    return window;
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