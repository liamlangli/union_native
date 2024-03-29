
#include "gpu/gpu.h"
#include "macos/metal.h"
#include <TargetConditionals.h>
#import <Cocoa/Cocoa.h>
#import <QuartzCore/QuartzCore.h>

#import <Metal/Metal.h>
#import <MetalKit/MetalKit.h>
#import <dispatch/semaphore.h>

#include "foundation/api.h"
#include "os/os.h"

@interface UNApp : NSApplication
@end

@interface UNAppDelegate : NSObject<NSApplicationDelegate>
@end

@interface UNWindowDelegate : NSObject<NSWindowDelegate>
@end

static NSWindow* window;
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

static os_window_t *_window;
static os_on_launch launch_func = NULL;
static os_on_frame frame_func = NULL;
static os_on_terminate terminate_func = NULL;

//------------------------------------------------------------------------------
@implementation UNApp
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

//------------------------------------------------------------------------------
@implementation UNAppDelegate
- (void)applicationDidFinishLaunching:(NSNotification*)aNotification {
    (void)aNotification;

    window_delegate = [[UNWindowDelegate alloc] init];
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

    [window setContentView:mtk_view];
    CGSize drawable_size = { (CGFloat) width, (CGFloat) height };
    [mtk_view setDrawableSize:drawable_size];
    [[mtk_view layer] setMagnificationFilter:kCAFilterNearest];
    NSApp.activationPolicy = NSApplicationActivationPolicyRegular;
    [NSApp activateIgnoringOtherApps:YES];
    [window makeKeyAndOrderFront:nil];

    _window->width = width;
    _window->height = height;
    _window->native_window = mtk_view;
    gpu_device_t *device = gpu_create_device(_window);
    _window->gpu_device = device;

    // call the init function
    if (launch_func) {
        launch_func(_window);
    }
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication*)sender {
    (void)sender;
    return YES;
}
@end

//------------------------------------------------------------------------------
@implementation UNWindowDelegate
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
        if (frame_func != NULL) {
            frame_func(_window);
        }
    }
}
@end

//------------------------------------------------------------------------------
@implementation UNMTKView

- (BOOL) isOpaque {
    return YES;
}

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
@end

//------------------------------------------------------------------------------
void osx_start(int w, int h, const char* title) {
    width = w;
    height = h;
    window_title = title;
    [UNApp sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    id delg = [[UNAppDelegate alloc] init];
    [NSApp setDelegate:delg];
    [NSApp run];
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

    os_window_t* window = malloc(sizeof(os_window_t));
    window->width = width;
    window->height = height;
    window->ui_scale = 2.0;
    window->title = title;
    _window = window;
    osx_start(width, height, title.data);
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
