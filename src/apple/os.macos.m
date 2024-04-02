
#include <TargetConditionals.h>
#import <Cocoa/Cocoa.h>
#import <QuartzCore/QuartzCore.h>

#import <Metal/Metal.h>
#import <MetalKit/MetalKit.h>
#import <dispatch/semaphore.h>

#include "os/os.h"
#include "foundation/ustring.h"
#include "foundation/logger.h"
#include "gpu/gpu.h"
#include "apple/metal.h"
#include "script/script_context.h"
#include "script/browser.h"
#include "ui/ui_keycode.h"

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

int osx_key_map(int k) {
    switch (k) {
        case 51: return KEY_BACKSPACE;
        case 53: return KEY_ESCAPE;
        case 123: return KEY_LEFT;
        case 124: return KEY_RIGHT;
        case 125: return KEY_DOWN;
        case 126: return KEY_UP;
        case 36: return KEY_ENTER;
        case 48: return KEY_TAB;
        case 49: return KEY_SPACE;
        case 117: return KEY_DELETE;
        case 115: return KEY_HOME;
        case 119: return KEY_END;
        case 116: return KEY_PAGE_UP;
        case 121: return KEY_PAGE_DOWN;
        case 122: return KEY_F1;
        case 120: return KEY_F2;
        case 99: return KEY_F3;
        case 118: return KEY_F4;
        case 96: return KEY_F5;
        case 97: return KEY_F6;
        case 98: return KEY_F7;
        case 100: return KEY_F8;
        case 101: return KEY_F9;
        case 109: return KEY_F10;
        case 103: return KEY_F11;
        case 111: return KEY_F12;
        case 59: return KEY_LEFT_CONTROL;
        case 57: return KEY_LEFT_SHIFT;
        case 60: return KEY_RIGHT_SHIFT;
        case 58: return KEY_LEFT_ALT;
        case 56: return KEY_LEFT_SUPER;
        default: return -1;
    }
}

static os_window_t _window;
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
        styleMask: style
        backing: NSBackingStoreBuffered
        defer: NO];
    [window setTitle:[NSString stringWithUTF8String: window_title]];
    [window setAcceptsMouseMovedEvents: YES];
    [window center];
    [window setRestorable: YES];
    [window setDelegate: window_delegate];

    // view delegate, MTKView and Metal device
    mtk_view_delegate = [[UNViewDelegate alloc] init];
    mtl_device = MTLCreateSystemDefaultDevice();
    mtk_view = [[UNMTKView alloc] init];
    [mtk_view setPreferredFramesPerSecond: 60];
    [mtk_view setDelegate: mtk_view_delegate];
    [mtk_view setDevice: mtl_device];
    [mtk_view setColorPixelFormat: MTLPixelFormatBGRA8Unorm];
    [mtk_view setDepthStencilPixelFormat: MTLPixelFormatInvalid];
    [mtk_view setSampleCount:(NSUInteger)1];

    [window setContentView:mtk_view];
    CGSize drawable_size = { (CGFloat) width * 2.f, (CGFloat) height * 2.f};
    [mtk_view setDrawableSize: drawable_size];
    [[mtk_view layer] setMagnificationFilter:kCAFilterNearest];
    NSApp.activationPolicy = NSApplicationActivationPolicyRegular;
    [NSApp activateIgnoringOtherApps:YES];
    [window makeKeyAndOrderFront:nil];

    _window.width = width;
    _window.height = height;
    _window.native_window = mtk_view;
    if(!gpu_request_device(&_window)) {
        assert(false);
    }

    // call the init function
    if (launch_func) {
        launch_func(&_window);
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
        terminate_func(&_window);
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
        gpu_mtl_begin_frame(view);
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

- (BOOL)canBecomeKeyView {
    return YES;
}

- (BOOL)acceptsFirstResponder {
    return YES;
}

- (void)mouseDown:(NSEvent*)event {
    (void)event;
    os_window_on_mouse_btn(&_window, MOUSE_BUTTON_LEFT, BUTTON_ACTION_PRESS);
}

- (void)mouseDragged:(NSEvent*)event {
    [self mouseMoved:event];
}

- (void)mouseUp:(NSEvent*)event {
    (void)event;
    os_window_on_mouse_btn(&_window, MOUSE_BUTTON_LEFT, BUTTON_ACTION_RELEASE);
}

- (void)mouseMoved:(NSEvent*)event {
    script_context_t *ctx = script_context_shared();
    if (ctx == NULL) return;
    ui_state_t *state = &ctx->state;
    const NSRect rect = [mtk_view frame];
    const NSPoint point = [event locationInWindow];
    float x = (float)point.x;
    float y = (float)(rect.size.height - point.y);
    state->pointer_location = (float2){.x = x, .y = y};
    script_browser_window_mouse_move(x, y);
}

- (void)rightMouseDown:(NSEvent*)event {
    (void)event;
    os_window_on_mouse_btn(&_window, MOUSE_BUTTON_RIGHT, BUTTON_ACTION_PRESS);
}

- (void)rightMouseDragged:(NSEvent*)event {
    [self mouseMoved:event];
}

- (void)rightMouseUp:(NSEvent*)event {
    (void)event;
    os_window_on_mouse_btn(&_window, MOUSE_BUTTON_RIGHT, BUTTON_ACTION_RELEASE);
}

- (void)keyDown:(NSEvent*)event {
    script_context_t *ctx = script_context_shared();
    if (ctx == NULL) return;
    ui_state_t *state = &ctx->state;
    const NSString* characters = [event characters];
    const NSUInteger length = [characters length];
    for (NSUInteger i = 0; i < length; i++) {
        const unichar code = [characters characterAtIndex:i];
        if ((code & 0xFF00) == 0xF700) {
            continue;
        }
        int c = (int)code;
        if (c >= 'a' && c <= 'z') c -= 32;
        os_window_on_key_action(&_window, c, BUTTON_ACTION_PRESS);
    }
    int k = osx_key_map([event keyCode]);
    if (k != -1) os_window_on_key_action(&_window, k, BUTTON_ACTION_PRESS);
}

- (void)flagsChanged:(NSEvent*)event {
}

- (void)keyUp:(NSEvent*)event {
    script_context_t *ctx = script_context_shared();
    if (ctx == NULL) return;
    ui_state_t *state = &ctx->state;
    const NSString* characters = [event characters];
    const NSUInteger length = [characters length];
    for (NSUInteger i = 0; i < length; i++) {
        const unichar code = [characters characterAtIndex:i];
        if ((code & 0xFF00) == 0xF700) {
            continue;
        }
        int c = (int)code;
        if (c >= 'a' && c <= 'z') c -= 32;
        os_window_on_key_action(&_window, c, BUTTON_ACTION_RELEASE);
    }
    int k = osx_key_map([event keyCode]);
    if (k != -1) os_window_on_key_action(&_window, k, BUTTON_ACTION_RELEASE);
}

- (void)scrollWheel:(NSEvent*)event {
    double dy = [event scrollingDeltaY];
    double dx = [event scrollingDeltaX];
    os_window_on_scroll(&_window, dx, dy);
}
@end

//------------------------------------------------------------------------------
void osx_start(int w, int h, const char* title) {
    width = w;
    height = h;
    window_title = title;
    [UNApp sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    id delegate = [[UNAppDelegate alloc] init];
    [NSApp setDelegate:delegate];
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

    _window.width = width;
    _window.height = height;
    _window.ui_scale = 2.0;
    _window.framebuffer_width = width * _window.ui_scale;
    _window.framebuffer_height = height * _window.ui_scale;
    _window.title = title;
    osx_start(width, height, title.data);
    return &_window;
}

ustring os_window_get_clipboard(os_window_t *window) {
    return ustring_NULL;
}

void os_window_set_clipboard(os_window_t *window, ustring_view text) {}

void os_window_close(os_window_t *window) {

}

void os_window_capture_require(os_window_t *window) {
    window->capture_required = true;
}
