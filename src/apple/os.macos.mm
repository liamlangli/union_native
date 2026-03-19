/**
 * os.macos.mm — macOS window/event layer (Objective-C++)
 *
 * Uses a plain NSView backed by a CAMetalLayer so Dawn can create a
 * WebGPU surface from the layer without importing any Metal rendering code.
 * The frame loop is driven by a CVDisplayLink.
 */

#include <TargetConditionals.h>
#import <Cocoa/Cocoa.h>
#import <QuartzCore/CAMetalLayer.h>
#import <Metal/Metal.h>

#include "os/os.h"
#include "core/logger.h"
#include "webgpu_context.h"
#include "script/script.h"
#include "ui/ui_keycode.h"
#include "ui/ui_state.h"

#include <CoreVideo/CVDisplayLink.h>
#include <string.h>

// ---------------------------------------------------------------------------
// Forward declarations
// ---------------------------------------------------------------------------
static void _osx_frame(void);

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------
static NSWindow*        g_window       = nil;
static CAMetalLayer*    g_metal_layer  = nil;
static CVDisplayLinkRef g_display_link = nullptr;

static int         g_width  = 1080;
static int         g_height = 720;
static const char* g_title  = "union native";

static os_window_t      g_os_window   = {};
static os_on_launch     g_launch_func    = nullptr;
static os_on_frame      g_frame_func     = nullptr;
static os_on_terminate  g_terminate_func = nullptr;

// ---------------------------------------------------------------------------
// Key mapping
// ---------------------------------------------------------------------------
static int osx_key_map(int k) {
    switch (k) {
        case 51:  return KEY_BACKSPACE;
        case 53:  return KEY_ESCAPE;
        case 123: return KEY_LEFT;
        case 124: return KEY_RIGHT;
        case 125: return KEY_DOWN;
        case 126: return KEY_UP;
        case 36:  return KEY_ENTER;
        case 48:  return KEY_TAB;
        case 49:  return KEY_SPACE;
        case 117: return KEY_DELETE;
        case 115: return KEY_HOME;
        case 119: return KEY_END;
        case 116: return KEY_PAGE_UP;
        case 121: return KEY_PAGE_DOWN;
        default:  return -1;
    }
}

// ---------------------------------------------------------------------------
// Content view — plain NSView with CAMetalLayer
// ---------------------------------------------------------------------------
@interface UNView : NSView
@end

@implementation UNView

- (BOOL)isOpaque              { return YES; }
- (BOOL)canBecomeKeyView      { return YES; }
- (BOOL)acceptsFirstResponder { return YES; }
- (BOOL)wantsUpdateLayer      { return YES; }

- (CALayer*)makeBackingLayer {
    g_metal_layer = [CAMetalLayer layer];
    g_metal_layer.pixelFormat         = MTLPixelFormatBGRA8Unorm;
    g_metal_layer.drawableSize        = CGSizeMake(g_width * 2, g_height * 2);
    g_metal_layer.magnificationFilter = kCAFilterNearest;
    g_metal_layer.framebufferOnly     = YES;
    return g_metal_layer;
}

- (void)mouseDown:(NSEvent*)event {
    (void)event;
    os_window_on_mouse_btn(&g_os_window, MOUSE_BUTTON_LEFT, BUTTON_ACTION_PRESS);
}
- (void)mouseDragged:(NSEvent*)event { [self mouseMoved:event]; }
- (void)mouseUp:(NSEvent*)event {
    (void)event;
    os_window_on_mouse_btn(&g_os_window, MOUSE_BUTTON_LEFT, BUTTON_ACTION_RELEASE);
}
- (void)mouseMoved:(NSEvent*)event {
    const NSRect  rect  = [self frame];
    const NSPoint point = [event locationInWindow];
    float x = (float)point.x;
    float y = (float)(rect.size.height - point.y);
    os_window_on_mouse_move(&g_os_window, x, y);
}
- (void)rightMouseDown:(NSEvent*)event {
    (void)event;
    os_window_on_mouse_btn(&g_os_window, MOUSE_BUTTON_RIGHT, BUTTON_ACTION_PRESS);
}
- (void)rightMouseDragged:(NSEvent*)event { [self mouseMoved:event]; }
- (void)rightMouseUp:(NSEvent*)event {
    (void)event;
    os_window_on_mouse_btn(&g_os_window, MOUSE_BUTTON_RIGHT, BUTTON_ACTION_RELEASE);
}

- (void)keyDown:(NSEvent*)event {
    const NSString* characters = [event characters];
    const NSUInteger length = [characters length];
    for (NSUInteger i = 0; i < length; i++) {
        const unichar code = [characters characterAtIndex:i];
        if ((code & 0xFF00) == 0xF700) continue;
        int c = (int)code;
        if (c >= 'a' && c <= 'z') c -= 32;
        os_window_on_key_action(&g_os_window, c, BUTTON_ACTION_PRESS);
    }
    int k = osx_key_map([event keyCode]);
    if (k != -1) os_window_on_key_action(&g_os_window, k, BUTTON_ACTION_PRESS);
}
- (void)keyUp:(NSEvent*)event {
    const NSString* characters = [event characters];
    const NSUInteger length = [characters length];
    for (NSUInteger i = 0; i < length; i++) {
        const unichar code = [characters characterAtIndex:i];
        if ((code & 0xFF00) == 0xF700) continue;
        int c = (int)code;
        if (c >= 'a' && c <= 'z') c -= 32;
        os_window_on_key_action(&g_os_window, c, BUTTON_ACTION_RELEASE);
    }
    int k = osx_key_map([event keyCode]);
    if (k != -1) os_window_on_key_action(&g_os_window, k, BUTTON_ACTION_RELEASE);
}
- (void)flagsChanged:(NSEvent*)event {
    NSEventModifierFlags flags = [event modifierFlags];
    bool cmd  = os_window_is_key_pressed(&g_os_window, KEY_LEFT_SUPER);
    bool ctrl = os_window_is_key_pressed(&g_os_window, KEY_LEFT_CONTROL);
    bool shft = os_window_is_key_pressed(&g_os_window, KEY_LEFT_SHIFT);
    bool alt  = os_window_is_key_pressed(&g_os_window, KEY_LEFT_ALT);

#define FLAG_CHECK(mask, key, prev) \
    if ((flags & (mask)) && !(prev)) os_window_on_key_action(&g_os_window, (key), BUTTON_ACTION_PRESS); \
    if (!((flags) & (mask)) && (prev)) os_window_on_key_action(&g_os_window, (key), BUTTON_ACTION_RELEASE);

    FLAG_CHECK(NSEventModifierFlagCommand, KEY_LEFT_SUPER,   cmd)
    FLAG_CHECK(NSEventModifierFlagControl, KEY_LEFT_CONTROL, ctrl)
    FLAG_CHECK(NSEventModifierFlagShift,   KEY_LEFT_SHIFT,   shft)
    FLAG_CHECK(NSEventModifierFlagOption,  KEY_LEFT_ALT,     alt)
#undef FLAG_CHECK
}
- (void)scrollWheel:(NSEvent*)event {
    os_window_on_scroll(&g_os_window,
        [event scrollingDeltaX], [event scrollingDeltaY]);
}
@end

// ---------------------------------------------------------------------------
// Application delegate
// ---------------------------------------------------------------------------
@interface UNAppDelegate : NSObject<NSApplicationDelegate>
@end

@implementation UNAppDelegate

- (void)applicationDidFinishLaunching:(NSNotification*)note {
    (void)note;

    const NSUInteger style =
        NSWindowStyleMaskTitled      |
        NSWindowStyleMaskClosable    |
        NSWindowStyleMaskMiniaturizable |
        NSWindowStyleMaskResizable;

    g_window = [[NSWindow alloc]
        initWithContentRect:NSMakeRect(0, 0, g_width, g_height)
        styleMask:style
        backing:NSBackingStoreBuffered
        defer:NO];
    [g_window setTitle:[NSString stringWithUTF8String:g_title]];
    [g_window setAcceptsMouseMovedEvents:YES];
    [g_window center];
    [g_window setRestorable:YES];

    // Create content view — this triggers makeBackingLayer → g_metal_layer
    UNView *view = [[UNView alloc] initWithFrame:NSMakeRect(0, 0, g_width, g_height)];
    view.wantsLayer = YES;
    [view makeBackingLayer]; // force layer creation before gpu_request_device
    [g_window setContentView:view];

    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    [NSApp activateIgnoringOtherApps:YES];
    [g_window makeKeyAndOrderFront:nil];
    [g_window setAppearance:[NSAppearance appearanceNamed:NSAppearanceNameVibrantDark]];

    // Populate os_window_t — native_window is the CAMetalLayer for Dawn
    g_os_window.width              = g_width;
    g_os_window.height             = g_height;
    g_os_window.framebuffer_width  = g_width  * 2;
    g_os_window.framebuffer_height = g_height * 2;
    g_os_window.ui_scale           = 2.0;
    g_os_window.native_window      = (__bridge void*)g_metal_layer;

    if (!webgpu_context_init(&g_os_window)) {
        NSLog(@"[un] webgpu_context_init failed — aborting");
        [NSApp terminate:nil];
        return;
    }

    if (g_launch_func) g_launch_func(&g_os_window);

    // CVDisplayLink drives the render loop at the display refresh rate
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    CVDisplayLinkCreateWithActiveCGDisplays(&g_display_link);
    CVDisplayLinkSetOutputCallback(g_display_link,
        [](CVDisplayLinkRef, const CVTimeStamp*, const CVTimeStamp*,
           CVOptionFlags, CVOptionFlags*, void*) -> CVReturn {
            dispatch_async(dispatch_get_main_queue(), ^{ _osx_frame(); });
            return kCVReturnSuccess;
        }, nullptr);
    CVDisplayLinkStart(g_display_link);
#pragma clang diagnostic pop
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication*)sender {
    (void)sender;
    return YES;
}

- (NSApplicationTerminateReply)applicationShouldTerminate:(NSApplication*)sender {
    (void)sender;
    if (g_display_link) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
        CVDisplayLinkStop(g_display_link);
        CVDisplayLinkRelease(g_display_link);
#pragma clang diagnostic pop
        g_display_link = nullptr;
    }
    if (g_terminate_func) g_terminate_func(&g_os_window);
    return NSTerminateNow;
}
@end

// ---------------------------------------------------------------------------
// Frame tick
// ---------------------------------------------------------------------------
static void _osx_frame(void) {
    @autoreleasepool {
        if (g_frame_func) g_frame_func(&g_os_window);
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

os_window_t* os_window_create(std::string_view title, int width, int height,
                               os_on_launch    on_launch,
                               os_on_frame     on_frame,
                               os_on_terminate on_terminate) {
    g_width          = width;
    g_height         = height;
    g_title          = title.data();
    g_launch_func    = on_launch;
    g_frame_func     = on_frame;
    g_terminate_func = on_terminate;

    g_os_window.width              = width;
    g_os_window.height             = height;
    g_os_window.ui_scale           = 2.0;
    g_os_window.framebuffer_width  = width  * 2;
    g_os_window.framebuffer_height = height * 2;
    g_os_window.title              = title;

    [NSApplication sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    id delegate = [[UNAppDelegate alloc] init];
    [NSApp setDelegate:delegate];
    [NSApp run];

    return &g_os_window;
}

std::string os_window_get_clipboard(os_window_t *window) {
    (void)window;
    NSPasteboard *pb  = [NSPasteboard generalPasteboard];
    NSString     *str = [pb stringForType:NSPasteboardTypeString];
    if (!str) return {};
    const char *cstr = [str UTF8String];
    return cstr != nullptr ? std::string(cstr) : std::string();
}

void os_window_set_clipboard(os_window_t *window, std::string_view text) {
    (void)window;
    NSPasteboard *pb  = [NSPasteboard generalPasteboard];
    [pb clearContents];
    NSString *str = [[NSString alloc] initWithBytes:text.data()
                                             length:text.size()
                                           encoding:NSUTF8StringEncoding];
    [pb setString:str forType:NSPasteboardTypeString];
}

void os_window_close(os_window_t *window) {
    (void)window;
    [g_window close];
}

void os_window_capture_require(os_window_t *window) {
    window->capture_required = true;
}

void os_window_set_cursor(os_window_t *window, int cursor_type) {
    (void)window;
    switch (cursor_type) {
    case CURSOR_Text:    [[NSCursor IBeamCursor] set];            break;
    case CURSOR_ResizeH: [[NSCursor resizeLeftRightCursor] set];  break;
    case CURSOR_ResizeV: [[NSCursor resizeUpDownCursor] set];     break;
    default:             [[NSCursor arrowCursor] set];            break;
    }
}

std::string os_get_bundle_path(std::string_view path) {
    NSString *res  = [[NSBundle mainBundle] resourcePath];
    NSString *sub  = [NSString stringWithUTF8String:std::string(path).c_str()];
    NSString *full = [res stringByAppendingPathComponent:sub];
    const char *cstr = [full UTF8String];
    return cstr != nullptr ? std::string(cstr) : std::string();
}
