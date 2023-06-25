#if defined(OS_WINDOWS) || defined(OS_LINUX)

#include "os_window.h"

#include "foundation/vulkan/vulkan_backend.h"
#include "foundation/array.inl"

typedef struct window_t {
    GLFWwindow *native_window;
    VkSurfaceKHR surface;
    VkSwapchainKHR swapchain;

    u32 swap_image_count;
    VkImage swap_images[3];
} window_t;

typedef struct vk_device_t {
    VkInstance instance;

    VkPhysicalDevice physical_device;
    u32 queue_family_index;

    VkDevice device;
    VkQueue gfx_queue, pres_queue;
    bool double_queue;
} vk_device_t;

#define MAX_WINDOW_COUNT 4
static window_t __windows[MAX_WINDOW_COUNT];
static i32 __highest_window_index = 0;

static vk_device_t vk_device;

static void __glfw_init(void) {
    static bool __glfw_initialized = false;
    if (__glfw_initialized) return;

    glfwInit();
    if (GLFW_FALSE == glfwVulkanSupported()) {
        printf("vulkan unsupported\n");
        glfwTerminate();
        exit(2);
    }

    VkApplicationInfo application_info  = (VkApplicationInfo){ 0 };
    application_info.sType              = VK_STRUCTURE_TYPE_APPLICATION_INFO;
    application_info.pNext              = NULL;
    application_info.apiVersion         = VK_MAKE_VERSION(1, 0, 2);
    application_info.applicationVersion = VK_MAKE_VERSION(0, 0, 1);
    application_info.engineVersion      = VK_MAKE_VERSION(0, 0, 1);
    application_info.pApplicationName   = "union native";
    application_info.pEngineName        = "union native";


    u32 instance_extension_count = 0;
    const char **instance_extension_buffer = glfwGetRequiredInstanceExtensions(&instance_extension_count);

    VkInstanceCreateInfo instance_creation_info     = (VkInstanceCreateInfo){ 0 };
    instance_creation_info.sType                    = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
    instance_creation_info.pNext                    = NULL;
    instance_creation_info.flags                    = VK_INSTANCE_CREATE_ENUMERATE_PORTABILITY_BIT_KHR;
    instance_creation_info.pApplicationInfo         = &application_info;
    instance_creation_info.enabledExtensionCount    = instance_extension_count;
    instance_creation_info.ppEnabledExtensionNames  = instance_extension_buffer;
    instance_creation_info.enabledLayerCount        = 0; // do not enable any layer for now
    instance_creation_info.ppEnabledLayerNames      = NULL;

    VkResult result = vkCreateInstance(&instance_creation_info, NULL, &vk_device.instance);
    if (result != VK_SUCCESS) {
        printf("vulkan initialize failed.\n");
        exit(2);
    }

    u32 physical_device_count = 0;
    VkPhysicalDevice physical_devices[4];
    result = vkEnumeratePhysicalDevices(vk_device.instance, &physical_device_count, NULL);
    if (physical_device_count == 0 || result != VK_SUCCESS) {
        printf("failed to find GPUs with vulkan supported.\n");
        exit(2);
    }
    vkEnumeratePhysicalDevices(vk_device.instance, &physical_device_count, physical_devices);

    VkPhysicalDeviceProperties physical_device_properties[4];
    u32 discrete_gpu_list[4];
    u32 discrete_gpu_count = 0;
    u32 integrated_gpu_list[4];
    u32 integrated_gpu_count = 0;

    VkPhysicalDeviceMemoryProperties physical_device_memory_properties[4];
    u32 physical_device_memory_count[4];
    VkDeviceSize physical_device_memory_totals[4];

    for (u32 i = 0; i < physical_device_count; ++i) {
        vkGetPhysicalDeviceProperties(physical_devices[i], &physical_device_properties[i]);
        if (physical_device_properties[i].deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU) {
            discrete_gpu_list[discrete_gpu_count] = i;
            discrete_gpu_count++;
        } else if (physical_device_properties[i].deviceType == VK_PHYSICAL_DEVICE_TYPE_INTEGRATED_GPU) {
            integrated_gpu_list[integrated_gpu_count] = i;
            integrated_gpu_count++;
        }

        vkGetPhysicalDeviceMemoryProperties(physical_devices[i], &physical_device_memory_properties[i]);
        physical_device_memory_count[i] = physical_device_memory_properties[i].memoryHeapCount;
        physical_device_memory_totals[i] = 0;
        for (u32 j = 0; j < physical_device_memory_count[i]; ++j) {
            physical_device_memory_totals[i] += physical_device_memory_properties[i].memoryHeaps[j].size;
        }
    }

    VkDeviceSize max_memory_size = 0;
    u32 physical_device_best_index = 0;
    if (discrete_gpu_count != 0)
        for (u32 i = 0; i < discrete_gpu_count; ++i) {
            u32 physical_device_index = discrete_gpu_list[i];
            u32 physical_device_memory_total = physical_device_memory_totals[physical_device_index];
            if (physical_device_memory_total > max_memory_size) {
                physical_device_best_index = physical_device_index;
                max_memory_size = physical_device_memory_total;
            }
        }
    else if (integrated_gpu_count != 0) {
        for (u32 i = 0; i < integrated_gpu_count; ++i) {
            u32 physical_device_index = integrated_gpu_list[i];
            u32 physical_device_memory_total = physical_device_memory_totals[physical_device_index];
            if (physical_device_memory_total > max_memory_size) {
                physical_device_best_index = physical_device_index;
                max_memory_size = physical_device_memory_total;
            }
        }
    }
    
    printf("best device index %u\n", physical_device_best_index);
    printf("device name: %s\n", physical_device_properties[physical_device_best_index].deviceName);

    u32 queue_family_count = 0;
    VkPhysicalDevice *gpu = &physical_devices[physical_device_best_index];
    vkGetPhysicalDeviceQueueFamilyProperties(*gpu, &queue_family_count, NULL);
    VkQueueFamilyProperties queue_family_properties[16];
    vkGetPhysicalDeviceQueueFamilyProperties(*gpu, &queue_family_count, queue_family_properties);

    u32 family_queue_counts[16];
    for (u32 i = 0; i < queue_family_count; ++i)
        family_queue_counts[i] = queue_family_properties[i].queueCount;
    
    VkDeviceQueueCreateInfo device_queue_creation_info[16];
    for (u32 i = 0; i < queue_family_count; ++i) {
        device_queue_creation_info[i].sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        device_queue_creation_info[i].pNext = 0;
        device_queue_creation_info[i].flags = 0;
        device_queue_creation_info[i].queueFamilyIndex = i;
        device_queue_creation_info[i].queueCount = family_queue_counts[i];
        float queue_priority[1] = {1.f};
        device_queue_creation_info[i].pQueuePriorities = queue_priority;
    }
    printf("using %d queue families.\n", queue_family_count);

    VkDeviceCreateInfo device_creation_info = (VkDeviceCreateInfo){ 0 };
    device_creation_info.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
    device_creation_info.pNext = NULL;
    device_creation_info.flags = 0;
    device_creation_info.queueCreateInfoCount = queue_family_count;
    device_creation_info.pQueueCreateInfos = device_queue_creation_info;
    device_creation_info.enabledLayerCount = 0;
    device_creation_info.ppEnabledLayerNames = NULL;

    device_creation_info.enabledExtensionCount = 1;
    char* device_creation_extensions[1];
    device_creation_extensions[0] = "VK_KHR_swapchain";
    device_creation_info.ppEnabledExtensionNames = (const char *const *)device_creation_extensions;

    VkPhysicalDeviceFeatures physical_device_feature;
    vkGetPhysicalDeviceFeatures(*gpu, &physical_device_feature);
    device_creation_info.pEnabledFeatures = &physical_device_feature;

    result = vkCreateDevice(*gpu, &device_creation_info, NULL, &vk_device.device);
    if (result != VK_SUCCESS) {
        printf("device creation failed.");
        exit(2);
    }

    u32 queue_family_gfx_count = 0;
    u32 queue_family_gfx_list[16];
    for (u32 i = 0; i < queue_family_count; ++i) {
        // if (queue_f)
        if ((queue_family_properties[i].queueFlags & VK_QUEUE_GRAPHICS_BIT) != 0) {
            queue_family_gfx_list[queue_family_gfx_count] = i;
            queue_family_gfx_count++;
        }
    }

    u32 max_queue_count = 0;
    u32 queue_family_best_index = 0;
    for (u32 i = 0; i < queue_family_gfx_count; ++i) {
        u32 queue_family_index = queue_family_gfx_list[i];
        u32 queue_count = queue_family_properties[queue_family_index].queueCount;
        if (queue_count > max_queue_count) {
            queue_family_best_index = queue_family_index;
            max_queue_count = queue_count;
        }
    }
    printf("best queue family index %d\n", queue_family_best_index);
    vk_device.queue_family_index = queue_family_best_index;

    vkGetDeviceQueue(vk_device.device, queue_family_best_index, 0, &vk_device.gfx_queue);
    bool double_queue = false;
    if (queue_family_properties[queue_family_best_index].queueCount < 2) {
        vkGetDeviceQueue(vk_device.device, queue_family_best_index, 0, &vk_device.pres_queue);
        printf("using single queue for rendering.\n");
    } else {
        double_queue = true;
        vkGetDeviceQueue(vk_device.device, queue_family_best_index, 1, &vk_device.pres_queue);
        printf("using double queue for rendering.\n");
    }
    vk_device.double_queue = double_queue;

    glfwWindowHint(GLFW_CLIENT_API,GLFW_NO_API);
    glfwWindowHint(GLFW_RESIZABLE,GLFW_FALSE);

    vk_device.physical_device = *gpu;
    __glfw_initialized = true;
}

window_t *platform_window_create(const char *title, rect_t rect) {
    __glfw_init();

    i32 window_index = 0;
    for(;window_index != __highest_window_index; ++window_index) {
        if (__windows[window_index].native_window == 0)
            break;
    }

    window_t *win = (window_t *)&__windows[window_index];
    win->native_window = glfwCreateWindow((int)rect.w, (int)rect.h, title, NULL, NULL);

    glfwCreateWindowSurface(vk_device.instance, win->native_window, NULL, &win->surface);
    printf("create window surface.\n");

    VkBool32 physical_surface_supported;
    vkGetPhysicalDeviceSurfaceSupportKHR(vk_device.physical_device, vk_device.queue_family_index, win->surface, &physical_surface_supported);
    if (physical_surface_supported == VK_TRUE) {
        printf("surface supported.\n");
    } else {
        printf("warning: surface unsupported.\n");
    }

    VkSurfaceCapabilitiesKHR surface_caps;
    vkGetPhysicalDeviceSurfaceCapabilitiesKHR(vk_device.physical_device, win->surface, &surface_caps);

    char extent_suitable = 1;
    int window_width, window_height;
    glfwGetFramebufferSize(win->native_window, &window_width, &window_height);
    VkExtent2D actual_extent;
    actual_extent.width = window_width;
    actual_extent.height = window_height;
    if (surface_caps.currentExtent.width != window_width ||
        surface_caps.currentExtent.height != window_height)
    {
        extent_suitable = 0;
        printf("actual extent size doesn't match framebuffers, resizing.... \n");
        actual_extent.width = MACRO_CLAMP(window_width, surface_caps.minImageExtent.width, surface_caps.maxImageExtent.width);
        actual_extent.height = MACRO_CLAMP(window_height, surface_caps.minImageExtent.height, surface_caps.maxImageExtent.height);
    }

    u32 surface_format_count;
    vkGetPhysicalDeviceSurfaceFormatsKHR(vk_device.physical_device, win->surface, &surface_format_count, NULL);
    VkSurfaceFormatKHR surface_formats[4];
    vkGetPhysicalDeviceSurfaceFormatsKHR(vk_device.physical_device, win->surface, &surface_format_count, surface_formats);
    
    // VkFormat
    for (u32 i = 0; i < surface_format_count; ++i) {
        printf("format: %d, colorspace: %d\n", surface_formats[i].format, surface_formats[i].colorSpace);
    }
    VkSurfaceFormatKHR surface_format = surface_formats[0];

    u32 present_mode_count;
    vkGetPhysicalDeviceSurfacePresentModesKHR(vk_device.physical_device, win->surface, &present_mode_count, NULL);
    VkPresentModeKHR present_modes[4];
    vkGetPhysicalDeviceSurfacePresentModesKHR(vk_device.physical_device, win->surface, &present_mode_count, present_modes);
    printf("fetched %d present modes.\n", present_mode_count);

    bool mailbox_mode_supported = false;
    for (u32 i = 0; i < present_mode_count; ++i) {
        printf("present mode %d\n", present_modes[i]);
        if (present_modes[i] == VK_PRESENT_MODE_MAILBOX_KHR) {
            printf("mailbox present mode supported.\n");
            mailbox_mode_supported = true;
        }
    }

    VkSwapchainCreateInfoKHR swap_chain_creation_info = (VkSwapchainCreateInfoKHR){ 0 };
    swap_chain_creation_info.sType = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
    swap_chain_creation_info.pNext = NULL;
    swap_chain_creation_info.surface = win->surface;
    swap_chain_creation_info.minImageCount = surface_caps.minImageCount + 1;
    swap_chain_creation_info.imageFormat = surface_formats[0].format;
    swap_chain_creation_info.imageColorSpace = surface_formats[0].colorSpace;
    swap_chain_creation_info.imageExtent = extent_suitable ? surface_caps.currentExtent : actual_extent;
    swap_chain_creation_info.imageArrayLayers = 1;
    swap_chain_creation_info.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;
    swap_chain_creation_info.imageSharingMode = vk_device.double_queue ? VK_SHARING_MODE_CONCURRENT : VK_SHARING_MODE_EXCLUSIVE;
    swap_chain_creation_info.queueFamilyIndexCount = vk_device.double_queue ? 2 : 0;
    u32 queue_family_indices[2] = {0, 1};
    swap_chain_creation_info.pQueueFamilyIndices = vk_device.double_queue ? queue_family_indices : NULL;
    swap_chain_creation_info.preTransform = surface_caps.currentTransform;
    swap_chain_creation_info.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
    swap_chain_creation_info.presentMode = mailbox_mode_supported ? VK_PRESENT_MODE_MAILBOX_KHR : VK_PRESENT_MODE_FIFO_KHR;
    swap_chain_creation_info.clipped = VK_TRUE;
    swap_chain_creation_info.oldSwapchain = VK_NULL_HANDLE;

    vkCreateSwapchainKHR(vk_device.device, &swap_chain_creation_info, NULL, &win->swapchain);
    
    vkGetSwapchainImagesKHR(vk_device.device, win->swapchain, &win->swap_image_count, NULL);
    vkGetSwapchainImagesKHR(vk_device.device, win->swapchain, &win->swap_image_count, win->swap_images);


    VkComponentMapping image_view_rgba_comp;
    image_view_rgba_comp.r = VK_COMPONENT_SWIZZLE_IDENTITY;
    image_view_rgba_comp.g = VK_COMPONENT_SWIZZLE_IDENTITY;
    image_view_rgba_comp.b = VK_COMPONENT_SWIZZLE_IDENTITY;
    image_view_rgba_comp.a = VK_COMPONENT_SWIZZLE_IDENTITY;

    VkImageSubresourceRange image_view_subresource;
    image_view_subresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
    image_view_subresource.baseMipLevel = 0;
    image_view_subresource.levelCount = 1;
    image_view_subresource.baseArrayLayer = 0;
    image_view_subresource.layerCount = swap_chain_creation_info.imageArrayLayers;


    VkImageView image_views[3];
    VkImageViewCreateInfo image_view_creation_infos[3];
    for (u32 i = 0; i < win->swap_image_count; ++i) {
        image_view_creation_infos[i].sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
        image_view_creation_infos[i].image = win->swap_images[i];
        image_view_creation_infos[i].viewType = VK_IMAGE_VIEW_TYPE_2D;
        image_view_creation_infos[i].format = surface_format.format;
        image_view_creation_infos[i].subresourceRange = image_view_subresource;
        vkCreateImageView(vk_device.device, &image_view_creation_infos[i], NULL, &image_views[i]);
    }

    VkAttachmentDescription attach_desc;
    attach_desc.flags = 0;
    attach_desc.format = swap_chain_creation_info.imageFormat;
    attach_desc.samples = VK_SAMPLE_COUNT_1_BIT;
    attach_desc.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
    attach_desc.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
    attach_desc.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
    attach_desc.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
    attach_desc.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
    attach_desc.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

    VkAttachmentReference attach_ref;
    attach_ref.attachment = 0;
    attach_ref.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

    VkSubpassDescription subpass_desc;
    subpass_desc.flags = 0;
    subpass_desc.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
    subpass_desc.inputAttachmentCount = 0;
    subpass_desc.colorAttachmentCount = 1;
    subpass_desc.pColorAttachments = &attach_ref;
    subpass_desc.pResolveAttachments = NULL;
    subpass_desc.pDepthStencilAttachment = NULL;
    subpass_desc.preserveAttachmentCount = 0;
    subpass_desc.pPreserveAttachments = NULL;

    VkSubpassDependency subpass_dep;
    subpass_dep.srcSubpass = VK_SUBPASS_EXTERNAL;
    subpass_dep.dstSubpass = 0;
    subpass_dep.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    subpass_dep.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    subpass_dep.srcAccessMask = 0;
    subpass_dep.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
    subpass_dep.dependencyFlags = 0;

    VkRenderPassCreateInfo renderpass_creation_info;
    renderpass_creation_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
    renderpass_creation_info.pNext = NULL;
    renderpass_creation_info.flags = 0;
    renderpass_creation_info.attachmentCount = 1;
    renderpass_creation_info.pAttachments = &attach_desc;
    renderpass_creation_info.subpassCount = 1;
    renderpass_creation_info.pSubpasses = &subpass_desc;
    renderpass_creation_info.dependencyCount = 1;
    renderpass_creation_info.pDependencies = &subpass_dep;

    VkRenderPass renderpass;
    vkCreateRenderPass(vk_device.device, &renderpass_creation_info, NULL, &renderpass);


    return win;
}

bool platform_window_update(window_t *window) {
    glfwPollEvents();
    return !glfwWindowShouldClose(window->native_window);
}

void platform_window_destroy(window_t *window) {
    glfwDestroyWindow(window->native_window);
    window->native_window = 0;
}

#endif
