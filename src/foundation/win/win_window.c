#include "os_window.h"

#include <vulkan/vulkan.h>
#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#include "foundation/array.inl"

typedef struct window_t {
    GLFWwindow *native_window;
} window_t;

#define MAX_WINDOW_COUNT 4
static window_t __windows[MAX_WINDOW_COUNT];
static i32 __highest_window_index = 0;

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
    instance_creation_info.flags                    = 0;
    instance_creation_info.pApplicationInfo         = &application_info;
    instance_creation_info.enabledExtensionCount    = instance_extension_count;
    instance_creation_info.ppEnabledExtensionNames  = instance_extension_buffer;
    instance_creation_info.enabledLayerCount        = 0; // do not enable any layer for now
    instance_creation_info.ppEnabledLayerNames      = NULL;

    VkInstance instance = VK_NULL_HANDLE;
    VkResult result = vkCreateInstance(&instance_creation_info, NULL, &instance);
    if (result != VK_SUCCESS) {
        printf("vulkan initialize failed.\n");
        exit(2);
    }

    u32 physical_device_count = 0;
    VkPhysicalDevice physical_devices[4];
    result = vkEnumeratePhysicalDevices(instance, &physical_device_count, physical_devices);
    if (physical_device_count == 0 || result != VK_SUCCESS) {
        printf("failed to find GPUs with vulkan supported.\n");
        exit(2);
    }

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
    return win;
}

bool platform_window_update(window_t *window) {
    return true;
}

void platform_window_destroy(window_t *window) {
    glfwDestroyWindow(window->native_window);
    window->native_window = 0;
}
