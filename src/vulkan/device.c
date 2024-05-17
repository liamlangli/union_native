#include "gpu/gpu.h"
#include <minwindef.h>
#include <vulkan/vulkan_core.h>

#if defined(OS_WINDOWS)

    #define VK_USE_PLATFORM_WIN32_KHR

    #include <vulkan/vulkan.h>
    #include <windows.h>

    #include "foundation/global.h"
    #include "foundation/logger.h"

    #define MAX_SWAP_VIEW_COUNT 3

typedef struct gpu_device_d3d11_t {
    // device region
    VkInstance instance;
    VkDebugUtilsMessengerEXT msger;
    VkSurfaceKHR surface;
    VkPhysicalDevice physical_device;
    VkDevice device;
    VkQueue queue_gfx;
    VkQueue queue_present;

    // swapchain region
    VkSwapchainKHR swapchain;
    VkImage swapchain_images[MAX_SWAP_VIEW_COUNT];
    VkImageView swapchain_image_views[MAX_SWAP_VIEW_COUNT];
    u32 swapchain_image_count;
    VkFormat swapchain_format;
    VkExtent2D swapchain_extent;

    // command buffe region
    VkSemaphore render_sem[MAX_SWAP_VIEW_COUNT];
    VkSemaphore presend_sem[MAX_SWAP_VIEW_COUNT];
    VkCommandPool cmd_pool;
    VkCommandBuffer cmd_buffers[MAX_SWAP_VIEW_COUNT];
    VkFence wait_fences[MAX_SWAP_VIEW_COUNT];
    u32 curr_frame;
} gpu_device_d3d11_t;

static gpu_device_d3d11_t _device;

void vk_create_instance() {
    VkApplicationInfo info = {};
    info.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    info.pApplicationName = "un";
    info.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
    info.pEngineName = "No Engine";
    info.engineVersion = VK_MAKE_VERSION(1, 1, 0);
    info.apiVersion = VK_API_VERSION_1_1;

    VkInstanceCreateInfo ins_info = {};
    ins_info.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    ins_info.pApplicationInfo = &info;
    const char *extensions[] = { "VK_KHR_swapchain", "VK_KHR_win32_surface" };
    ins_info.enabledExtensionCount = 1;
    ins_info.ppEnabledExtensionNames = extensions;

    if (vkCreateInstance(&ins_info, NULL, &_device.instance) != VK_SUCCESS) {
        ULOG_ERROR("Failed to create Vulkan instance");
    }
    ULOG_INFO("vk instance created.");
}

void vk_create_surface(os_window_t *window) {
    VkWin32SurfaceCreateInfoKHR info = {};
    info.sType = VK_STRUCTURE_TYPE_WIN32_SURFACE_CREATE_INFO_KHR;
    info.hwnd = window->native_window;
    info.hinstance = GetModuleHandle(NULL);

    if (vkCreateWin32SurfaceKHR(_device.instance, &info, NULL, &_device.surface) != VK_SUCCESS) {
        ULOG_ERROR("failed to create window surface");
    }

    ULOG_INFO("vk surface created.");
}

void vk_select_physical_device() {
    u32 device_count = 0;
    vkEnumeratePhysicalDevices(_device.instance, &device_count, NULL);
    if (device_count == 0) {
        ULOG_ERROR("failed to find GPUs with Vulkan support.");
    }

    VkPhysicalDevice devices[device_count];
    vkEnumeratePhysicalDevices(_device.instance, &device_count, devices);

    u32 selected_device = 0;
    // for (uint32_t i = 0; i < device_count; i++) {
    // }
    _device.physical_device = devices[selected_device];

    if (_device.physical_device == VK_NULL_HANDLE) {
        ULOG_ERROR("failed to find a suitable GPU\n");
    }

    ULOG_INFO("vk compatable physical device selected.");
}

void vk_create_logical_device() {
    VkDeviceQueueCreateInfo queue_info = {};
    queue_info.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
    queue_info.queueFamilyIndex = 0; // In a real application, find the correct queue family
    queue_info.queueCount = 1;
    float queue_riority = 1.0f;
    queue_info.pQueuePriorities = &queue_riority;

    VkDeviceCreateInfo info = {};
    info.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
    info.queueCreateInfoCount = 1;
    info.pQueueCreateInfos = &queue_info;

    if (vkCreateDevice(_device.physical_device, &info, NULL, &_device.device) != VK_SUCCESS) {
        ULOG_ERROR("failed to create logical device\n");
    }

    vkGetDeviceQueue(_device.device, 0, 0, &_device.queue_gfx);
    vkGetDeviceQueue(_device.device, 0, 0, &_device.queue_present);

    ULOG_INFO("vk logical device created.");
}

void vk_create_swapchain() {
    VkSurfaceCapabilitiesKHR capabilities;
    vkGetPhysicalDeviceSurfaceCapabilitiesKHR(_device.physical_device, _device.surface, &capabilities);

    VkSwapchainCreateInfoKHR info = {};
    info.sType = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
    info.surface = _device.surface;
    info.minImageCount = capabilities.minImageCount + 1;
    info.imageFormat = VK_FORMAT_B8G8R8A8_UNORM;
    info.imageColorSpace = VK_COLOR_SPACE_SRGB_NONLINEAR_KHR;
    info.imageExtent = capabilities.currentExtent;
    info.imageArrayLayers = 1;
    info.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;
    info.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
    info.queueFamilyIndexCount = 0;
    info.preTransform = capabilities.currentTransform;
    info.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
    info.presentMode = VK_PRESENT_MODE_FIFO_KHR;
    info.clipped = VK_TRUE;
    info.oldSwapchain = VK_NULL_HANDLE;

    if (vkCreateSwapchainKHR(_device.device, &info, NULL, &_device.swapchain) != VK_SUCCESS) {
        ULOG_ERROR("failed to create swap chain\n");
    }

    vkGetSwapchainImagesKHR(_device.device, _device.swapchain, &_device.swapchain_image_count, NULL);
    vkGetSwapchainImagesKHR(_device.device, _device.swapchain, &_device.swapchain_image_count, &_device.swapchain_images[0]);

    _device.swapchain_format = info.imageFormat;
    _device.swapchain_extent = info.imageExtent;

    ULOG_INFO("vk swapchain created.");
}

void vk_create_image_views() {
    for (size_t i = 0; i < _device.swapchain_image_count; i++) {
        VkImageViewCreateInfo info = {};
        info.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
        info.image = _device.swapchain_images[i];
        info.viewType = VK_IMAGE_VIEW_TYPE_2D;
        info.format = _device.swapchain_format;
        info.components.r = VK_COMPONENT_SWIZZLE_IDENTITY;
        info.components.g = VK_COMPONENT_SWIZZLE_IDENTITY;
        info.components.b = VK_COMPONENT_SWIZZLE_IDENTITY;
        info.components.a = VK_COMPONENT_SWIZZLE_IDENTITY;
        info.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        info.subresourceRange.baseMipLevel = 0;
        info.subresourceRange.levelCount = 1;
        info.subresourceRange.baseArrayLayer = 0;
        info.subresourceRange.layerCount = 1;

        if (vkCreateImageView(_device.device, &info, NULL, &_device.swapchain_image_views[i]) != VK_SUCCESS) {
            ULOG_ERROR("failed to create image views.");
        }
    }

    ULOG_INFO("vk swapchain image views created.");
}

void vk_create_command_pool() {
    VkCommandPoolCreateInfo info = {};
    info.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
    info.queueFamilyIndex = 0;
    info.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
    if(vkCreateCommandPool(_device.device, &info, NULL, &_device.cmd_pool) != VK_SUCCESS) {
        ULOG_ERROR("failed to create command pool.");
    }
}

bool gpu_request_device(os_window_t *window) {
    vk_create_instance();
    vk_create_surface(window);
    vk_select_physical_device();
    vk_create_logical_device();
    vk_create_swapchain();
    vk_create_image_views();
    vk_create_command_pool();

    return true;
}

void gpu_destroy_device(void) {
    for (size_t i = 0; i < _device.swapchain_image_count; i++) {
        vkDestroyImageView(_device.device, _device.swapchain_image_views[i], NULL);
    }
    free(_device.swapchain_image_views);

    vkDestroySwapchainKHR(_device.device, _device.swapchain, NULL);
    vkDestroyDevice(_device.device, NULL);
    vkDestroySurfaceKHR(_device.instance, _device.surface, NULL);

    if (_device.msger != VK_NULL_HANDLE) {
        PFN_vkDestroyDebugUtilsMessengerEXT func =
            (PFN_vkDestroyDebugUtilsMessengerEXT)vkGetInstanceProcAddr(_device.instance, "vkDestroyDebugUtilsMessengerEXT");
        if (func != NULL) {
            func(_device.instance, _device.msger, NULL);
        }
    }

    vkDestroyInstance(_device.instance, NULL);
}

gpu_texture gpu_create_texture(gpu_texture_desc *desc) { return (gpu_texture){0}; }
gpu_sampler gpu_create_sampler(gpu_sampler_desc *desc) { return (gpu_sampler){0}; }
gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc) { return (gpu_buffer){0}; }
gpu_shader gpu_create_shader(gpu_shader_desc *desc) { return (gpu_shader){0}; }
gpu_pipeline gpu_create_pipeline(gpu_pipeline_desc *desc) { return (gpu_pipeline){0}; }
gpu_attachments gpu_create_attachments(gpu_attachments_desc *desc) { return (gpu_attachments){0}; }

void gpu_destroy_texture(gpu_texture texture) {}
void gpu_destroy_sampler(gpu_sampler sampler) {}
void gpu_destroy_buffer(gpu_buffer buffer) {}
void gpu_destroy_shader(gpu_shader shader) {}
void gpu_destroy_pipeline(gpu_pipeline pipeline) {}
void gpu_destroy_attachments(gpu_attachments attachments) {}

void gpu_update_texture(gpu_texture texture, udata data) {}
void gpu_update_buffer(gpu_buffer buffer, udata data) {}

bool gpu_begin_pass(gpu_pass *pass) { return true; }
void gpu_set_viewport(int x, int y, int width, int height) {}
void gpu_set_scissor(int x, int y, int width, int height) {}
void gpu_set_pipeline(gpu_pipeline pipeline) {}
void gpu_set_binding(const gpu_binding *binding) {}
void gpu_draw(int base, int count, int instance_count) {}
void gpu_end_pass(void) {}
void gpu_commit(void) {}

#endif