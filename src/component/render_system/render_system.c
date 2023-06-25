#include "render_system.h"

#if defined(OS_OSX)
#include "component/render_system/metal/metal_backend.h"
#else // OS_WINDOWS or OS_LINUX
#include "component/render_system/vulkan/vulkan_backend.h"
#endif

#include "component/os_window/os_window.h"

#if defined(OS_OSX)

typedef struct swapchain_o {
    metal_swapchain_t *swapchain;
} swapchain_o;

typedef struct render_system_t {
    metal_device_t *gpu_device;
} render_system_t;

static render_system_t g_render_system;

void render_system_init(void) {
    g_render_system.gpu_device = metal_create_default_device();
}

void render_system_swapchain_present(swapchain_o *swapchain) {
    metal_present(swapchain->swapchain);
}

swapchain_o* render_system_create_swapchain(window_t *window)
{
    GLFWwindow *native_window = (GLFWwindow*)platform_window_get_native_handle(window);
    swapchain_o *swapchain = malloc(sizeof(swapchain_o));
    swapchain->swapchain = metal_create_swapchain(g_render_system.gpu_device, native_window);
    return swapchain;
}

void render_system_terminate(void) {
    
}

#else // OS_WINDOWS or OS_LINUX

typedef struct render_system_t {
    VkInstance instance;
    VkDevice device;
    VkQueue graphics_queue, presenting_queue;
    VkPhysicalDevice *physical_devices;
    VkPhysicalDevice *best_physical_device;
    u32 best_physical_device_index;

} render_system_t;
static render_system_t g_render_system;

typedef struct swapchain_o {
    VkSurfaceKHR surface;
    VkSwapchainKHR swapchain;
    u32 swap_image_count;
    VkImage swap_images[3];
} swapchain_o;

void render_system_init(void) {
    g_render_system.instance = vk_create_instance();
    u32 physical_device_number = vk_get_physical_device_number(&g_render_system.instance);
    VkPhysicalDevice *physical_devices = vk_get_physical_devices(&g_render_system.instance, physical_device_number);
    u32 best_physical_device_index = vk_get_best_physical_device_index(physical_devices, physical_device_number);
    VkPhysicalDevice *best_physical_device = &physical_devices[best_physical_device_index];
    g_render_system.physical_devices = physical_devices;
    g_render_system.best_physical_device = best_physical_device;
    g_render_system.best_physical_device_index = best_physical_device_index;

    u32 queue_family_number = vk_get_queue_family_number(best_physical_device);
    VkQueueFamilyProperties *queue_family_props = vk_get_queue_family_properties(best_physical_device, queue_family_number);

    VkDevice device = vk_create_device(best_physical_device, queue_family_props, queue_family_number);
    g_render_system.device = device;

    u32 best_queue_family_index = vk_get_best_graphics_queue_family_index(queue_family_props, queue_family_number);
    VkQueue graphics_queue = vk_get_drawing_queue(device, best_queue_family_index);
    u32 graphics_queue_mode = vk_get_graphics_queue_mode(queue_family_props, best_queue_family_index);
    g_render_system.graphics_queue = graphics_queue;
    VkQueue presenting_queue = vk_get_presenting_queue(device, best_queue_family_index, graphics_queue_mode);
    g_render_system.presenting_queue = presenting_queue;
    vk_delete_queue_family_properties(queue_family_props);
}

swapchain_o* render_system_create_swapchain(window_t *window)
{
    GLFWwindow *native_window = (GLFWwindow*)window;
    swapchain_o *swapchain = (swapchain_o*)malloc(sizeof(swapchain_o));
    VkSurfaceKHR surface = vk_create_surface(native_window, &g_render_system.instance);
    VkBool32 surface_supported = vk_get_surface_supported(&surface, &g_render_system.best_physical_device, g_render_system.best_physical_device_index);
    if (!surface_supported) {
        printf("vulkan surface not supported!\n");
        render_system_terminate();
        exit(2);
    }

    VkSurfaceCapabilitiesKHR surface_capabilities = vk_get_surface_capabilities(&surface, &g_render_system.best_physical_device, g_render_system.best_physical_device_index);
    VkSurfaceFormatKHR best_furface_format = vk_get_best_surface_format(&surface, &g_render_system.best_physical_device, g_render_system.best_physical_device_index);
}

void *render_system_get_gpu_device(void) {
    return NULL;
}

void render_system_swapchain_present(swapchain_o *swapchain) {
    
}

void render_system_terminate(void) {

}

#endif

