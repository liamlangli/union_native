#if defined(OS_WINDOWS) || defined(OS_LINUX)

#include "vulkan_backend.h"

VkInstance vk_create_instance() {
    VkApplicationInfo app_info = {
        VK_STRUCTURE_TYPE_APPLICATION_INFO,
        VK_NULL_HANDLE,
        VK_NULL_HANDLE,
        0,
        VK_NULL_HANDLE,
        0,
        VK_API_VERSION_1_0
    };

    const char layer_list[][VK_MAX_EXTENSION_NAME_SIZE] = {
        "VK_LAYER_KHRONOS_validation"
    };
    const char *layers[] = {
        layer_list[0]
    };

    u32 num_ext = 0;
    const char *const *extensions = glfwGetRequiredInstanceExtensions(&num_ext);

    VkInstanceCreateInfo instanceCreateInfo = {
        VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO,
        VK_NULL_HANDLE,
        0,
        &app_info,
        1,
        layers,
        num_ext,
        extensions
    };

    VkInstance instance;
    vkCreateInstance(&instanceCreateInfo, VK_NULL_HANDLE, &instance);
    return instance;
}

void vk_destroy_instance(VkInstance *instance) {
    vkDestroyInstance(*instance, NULL);
}

u32 vk_get_physical_device_number(VkInstance *instance) {
    u32 physical_device_number = 0;
    vkEnumeratePhysicalDevices(*instance, &physical_device_number, VK_NULL_HANDLE);
    return physical_device_number;
}

VkPhysicalDevice *vk_get_physical_devices(VkInstance *instance, u32 physical_device_number) {
    VkPhysicalDevice *physical_devices = (VkPhysicalDevice*)malloc(physical_device_number * sizeof(VkPhysicalDevice));
    vkEnumeratePhysicalDevices(*instance, &physical_device_number, physical_devices);
    return physical_devices;
}

void vk_delete_physical_device(VkPhysicalDevice **physical_devices) {
    free(*physical_devices);
}

u32 vk_get_best_physical_device_index(VkPhysicalDevice *physical_devices, u32 physical_device_number) {
    VkPhysicalDeviceProperties *physical_device_props = (VkPhysicalDeviceProperties *)malloc(physical_device_number * sizeof(VkPhysicalDeviceProperties));
    VkPhysicalDeviceMemoryProperties *physical_device_mem_props = (VkPhysicalDeviceMemoryProperties *)malloc(physical_device_number * sizeof(VkPhysicalDeviceMemoryProperties));

    u32 discrete_gpu_number = 0;
    u32 integrated_gpu_number = 0;
    u32 *discrete_gpu_indices = (uint32_t *)malloc(physical_device_number * sizeof(uint32_t));
    u32 *integrated_gpu_indices = (uint32_t *)malloc(physical_device_number * sizeof(uint32_t));

    for(uint32_t i = 0; i < physical_device_number; i++){
        vkGetPhysicalDeviceProperties(physical_devices[i], &physical_device_mem_props[i]);
        vkGetPhysicalDeviceMemoryProperties(physical_devices[i], &physical_device_mem_props[i]);

        if(physical_device_props[i].deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU){
            discrete_gpu_indices[discrete_gpu_number] = i;
            discrete_gpu_number++;
        }

        if(physical_device_props[i].deviceType == VK_PHYSICAL_DEVICE_TYPE_INTEGRATED_GPU){
            integrated_gpu_indices[integrated_gpu_number] = i;
            integrated_gpu_number++;
        }
    }

    uint32_t best_physical_device_index = 0;
    VkDeviceSize best_physical_device_memory = 0;

    if(discrete_gpu_number != 0){
        for(uint32_t i = 0; i < discrete_gpu_number; i++){
            if(best_physical_device_memory < getPhysicalDeviceTotalMemory(&physical_device_mem_props[discrete_gpu_indices[i]])){
                best_physical_device_memory = getPhysicalDeviceTotalMemory(&physical_device_mem_props[discrete_gpu_indices[i]]);
                best_physical_device_index = discrete_gpu_indices[i];
            }
        }
    }else if(integrated_gpu_number != 0){
        for(uint32_t i = 0; i < integrated_gpu_number; i++){
            if(best_physical_device_memory < getPhysicalDeviceTotalMemory(&physical_device_mem_props[integrated_gpu_indices[i]])){
                best_physical_device_memory = getPhysicalDeviceTotalMemory(&physical_device_mem_props[integrated_gpu_indices[i]]);
                best_physical_device_index = integrated_gpu_indices[i];
            }
        }
    }

    free(discrete_gpu_indices);
    free(integrated_gpu_indices);
    free(physical_device_mem_props);
    free(physical_device_props);

    return best_physical_device_index;
}

u32 vk_get_physical_device_total_memory(VkPhysicalDeviceMemoryProperties *physical_device_mem_props) {
    uint32_t physical_device_total_mem = 0;
    for(int i = 0; i < physical_device_mem_props->memoryHeapCount; i++){
        if((physical_device_mem_props->memoryHeaps[i].flags & VK_MEMORY_HEAP_DEVICE_LOCAL_BIT) != 0){
            physical_device_total_mem += physical_device_mem_props->memoryHeaps[i].size;
        }
    }
    return physical_device_total_mem;
}

u32 vk_get_queue_family_number(VkPhysicalDevice *physical_device) {
    uint32_t queue_family_number = 0;
    vkGetPhysicalDeviceQueueFamilyProperties(*physical_device, &queue_family_number, VK_NULL_HANDLE);
    return queue_family_number;
}

VkQueueFamilyProperties *vk_get_queue_family_properties(VkPhysicalDevice *physical_device, u32 queue_family_number) {
    VkQueueFamilyProperties *queue_family_props = (VkQueueFamilyProperties *)malloc(queue_family_number * sizeof(VkQueueFamilyProperties));
    vkGetPhysicalDeviceQueueFamilyProperties(*physical_device, &queue_family_number, queue_family_props);
    return queue_family_props;
}

void delete_queue_family_properties(VkQueueFamilyProperties **queue_family_props) {
    free(*queue_family_props);
}

u32 vk_get_best_graphics_queue_family_index(VkQueueFamilyProperties *queue_family_props, u32 queue_family_number) {
    u32 graphics_queue_family_number = 0;
    u32 *graphics_queue_family_indices = (u32 *)malloc(queue_family_number * sizeof(u32));

    for(u32 i = 0; i < queue_family_number; i++){
        if((queue_family_props[i].queueFlags & VK_QUEUE_GRAPHICS_BIT) != 0){
            graphics_queue_family_indices[graphics_queue_family_number] = i;
            graphics_queue_family_number++;
        }
    }

    u32 best_graphics_queue_family_queue_count = 0;
    u32 best_graphics_queue_family_index = 0;

    for(u32 i = 0; i < graphics_queue_family_number; i++){
        if(queue_family_props[graphics_queue_family_indices[i]].queueCount > best_graphics_queue_family_queue_count){
            best_graphics_queue_family_queue_count = queue_family_props[graphics_queue_family_indices[i]].queueCount;
            best_graphics_queue_family_index = i;
        }
    }

    free(graphics_queue_family_indices);
    return best_graphics_queue_family_index;
}

u32 vk_get_graphics_queue_mode(VkQueueFamilyProperties *queue_family_props, u32 graphics_queue_family_index) {
    if (queue_family_props[graphics_queue_family_index].queueCount == 1) {
        return SINGLE_QUEUE_MODE;
    } else if (queue_family_props[graphics_queue_family_index].queueCount > 1) {
        return DOUBLE_QUEUE_MODE;
    } else {
        return INVALID_QUEUE_MODE;
    }
}

VkQueue vk_get_drawing_queue(VkDevice *device, u32 graphics_queue_family_index) {
    VkQueue drawing_queue = VK_NULL_HANDLE;
    vkGetDeviceQueue(*device, graphics_queue_family_index, 0, &drawing_queue);
    return drawing_queue;
}

VkQueue vk_get_presenting_queue(VkDevice *device, u32 graphics_queue_family_index, u32 graphics_queue_mode) {
    VkQueue presenting_queue = VK_NULL_HANDLE;
    if (graphics_queue_mode == 0) {
        vkGetDeviceQueue(*device, graphics_queue_family_index, 0, &presenting_queue);
    } else if (graphics_queue_mode == 1) {
        vkGetDeviceQueue(*device, graphics_queue_family_index, 1, &presenting_queue);
    }
    return presenting_queue;
}

VkDevice vk_create_device(VkPhysicalDevice *physical_device, u32 queue_family_number, VkQueueFamilyProperties *queue_family_props) {
    VkDeviceQueueCreateInfo *device_queue_create_info = (VkDeviceQueueCreateInfo *)malloc(queue_family_number * sizeof(VkDeviceQueueCreateInfo));
    float **queue_priorities = (float **)malloc(queue_family_number * sizeof(float *));

    for(u32 i = 0; i < queue_family_number; i++){
		queue_priorities[i] = (float *)malloc(queue_family_props[i].queueCount * sizeof(float));
		for(u32 j = 0; j < queue_family_props[i].queueCount; j++){
			queue_priorities[i][j] = 1.0f;
		}

		device_queue_create_info[i].sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
		device_queue_create_info[i].pNext = VK_NULL_HANDLE;
		device_queue_create_info[i].flags = 0;
		device_queue_create_info[i].queueFamilyIndex = i;
		device_queue_create_info[i].queueCount = queue_family_props[i].queueCount;
		device_queue_create_info[i].pQueuePriorities = queue_priorities[i];
	}

	const char extensionList[][VK_MAX_EXTENSION_NAME_SIZE] = {
		"VK_KHR_swapchain"
	};
	const char *extensions[] = {
		extensionList[0]
	};
	VkPhysicalDeviceFeatures physicalDeviceFeatures;
	vkGetPhysicalDeviceFeatures(*physical_device, &physicalDeviceFeatures);

	VkDeviceCreateInfo deviceCreateInfo = {
		VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		queue_family_number,
		device_queue_create_info,
		0,
		VK_NULL_HANDLE,
		1,
		extensions,
		&physicalDeviceFeatures
	};

	VkDevice device;
	vkCreateDevice(*physical_device, &deviceCreateInfo, VK_NULL_HANDLE, &device);

	for(uint32_t i = 0; i < queue_family_number; i++){
		free(queue_priorities[i]);
	}

	free(queue_priorities);
	free(device_queue_create_info);
	return device;
}

void vk_delete_device(VkDevice *device) {
    vkDestroyDevice(*device, VK_NULL_HANDLE);
}

VkSurfaceKHR vk_create_surface(GLFWwindow* native_window, VkInstance *instance) {

}

void vk_delete_surface(VkSurfaceKHR *surface, VkInstance *instance);
VkBool32 vk_get_surface_supported(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device, u32 graphics_queue_family_index);

#endif
