#if defined(OS_WINDOWS) || defined(OS_LINUX)

#include "vulkan_backend.h"

#include "foundation/os.h"

#include <stdlib.h>

VkInstance vk_create_instance(void) {
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
    free((void*)*physical_devices);
}

u32 vk_get_best_physical_device_index(VkPhysicalDevice *physical_devices, u32 physical_device_number) {
    VkPhysicalDeviceProperties *physical_device_props = (VkPhysicalDeviceProperties *)malloc(physical_device_number * sizeof(VkPhysicalDeviceProperties));
    VkPhysicalDeviceMemoryProperties *physical_device_mem_props = (VkPhysicalDeviceMemoryProperties *)malloc(physical_device_number * sizeof(VkPhysicalDeviceMemoryProperties));

    u32 discrete_gpu_number = 0;
    u32 integrated_gpu_number = 0;
    u32 *discrete_gpu_indices = (uint32_t *)malloc(physical_device_number * sizeof(uint32_t));
    u32 *integrated_gpu_indices = (uint32_t *)malloc(physical_device_number * sizeof(uint32_t));

    for(uint32_t i = 0; i < physical_device_number; i++){
        vkGetPhysicalDeviceProperties(physical_devices[i], &physical_device_props[i]);
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
            if(best_physical_device_memory < vk_get_physical_device_total_memory(&physical_device_mem_props[discrete_gpu_indices[i]])){
                best_physical_device_memory = vk_get_physical_device_total_memory(&physical_device_mem_props[discrete_gpu_indices[i]]);
                best_physical_device_index = discrete_gpu_indices[i];
            }
        }
    } else if (integrated_gpu_number != 0){
        for(uint32_t i = 0; i < integrated_gpu_number; i++){
            if(best_physical_device_memory < vk_get_physical_device_total_memory(&physical_device_mem_props[integrated_gpu_indices[i]])){
                best_physical_device_memory = vk_get_physical_device_total_memory(&physical_device_mem_props[integrated_gpu_indices[i]]);
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

void vk_delete_queue_family_properties(VkQueueFamilyProperties **queue_family_props) {
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
    VkSurfaceKHR surface;
    glfwCreateWindowSurface(*instance, native_window, VK_NULL_HANDLE, &surface);
    return surface;
}

void vk_delete_surface(VkSurfaceKHR *surface, VkInstance *instance) {
    vkDestroySurfaceKHR(*instance, *surface, VK_NULL_HANDLE);
}

VkBool32 vk_get_surface_supported(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device, u32 graphics_queue_family_index) {
    VkBool32 surface_supported = 0;
    vkGetPhysicalDeviceSurfaceSupportKHR(physical_device, graphics_queue_family_index, *surface, &surface_supported);
    return surface_supported;
}

VkSurfaceCapabilitiesKHR vk_get_surface_capabilities(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device) {
    VkSurfaceCapabilitiesKHR surface_caps;
    vkGetPhysicalDeviceSurfaceCapabilitiesKHR(physical_device, *surface, &surface_caps);
    return surface_caps;
}

VkSurfaceFormatKHR vk_get_best_surface_format(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device) {
    u32 surface_format_count = 0;
    vkGetPhysicalDeviceSurfaceFormatsKHR(*physical_device, *surface, &surface_format_count, VK_NULL_HANDLE);
    VkSurfaceFormatKHR *formats = (VkSurfaceFormatKHR *)malloc(surface_format_count * sizeof(VkSurfaceFormatKHR));
    vkGetPhysicalDeviceSurfaceFormatsKHR(*physical_device, *surface, &surface_format_count, formats);
    VkSurfaceFormatKHR best_format = formats[0];
    free(formats);
    return best_format;
}

VkPresentModeKHR vk_get_best_present_mode(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device) {
    u32 present_mode_count = 0;
	vkGetPhysicalDeviceSurfacePresentModesKHR(*physical_device, *surface, &present_mode_count, VK_NULL_HANDLE);
	VkPresentModeKHR *present_modes = (VkPresentModeKHR *)malloc(present_mode_count * sizeof(VkPresentModeKHR));
	vkGetPhysicalDeviceSurfacePresentModesKHR(*physical_device, *surface, &present_mode_count, present_modes);

	VkPresentModeKHR best_present_mode = VK_PRESENT_MODE_FIFO_KHR;
	for(u32 i = 0; i < present_mode_count; i++){
		if(present_modes[i] == VK_PRESENT_MODE_MAILBOX_KHR){
			best_present_mode = VK_PRESENT_MODE_MAILBOX_KHR;
		}
	}

	free(present_modes);
	return best_present_mode;
}

VkExtent2D vk_get_best_swapchain_extent(VkSurfaceCapabilitiesKHR *surface_caps, GLFWwindow *native_window) {
    i32 frame_buffer_width = 0;
    i32 frame_buffer_height = 0;
	glfwGetFramebufferSize(native_window, &frame_buffer_width, &frame_buffer_height);

	VkExtent2D best_swapchain_extent;
	best_swapchain_extent.width = MACRO_MIN(frame_buffer_width, surface_caps->currentExtent.width);
	best_swapchain_extent.height = MACRO_MIN(frame_buffer_height, surface_caps->currentExtent.height);
	return best_swapchain_extent;
}

VkSwapchainKHR vk_create_swapchain(VkDevice *device, VkSurfaceKHR *surface, VkSurfaceCapabilitiesKHR *surface_caps,
    VkSurfaceFormatKHR *surface_format, VkExtent2D *extent, VkPresentModeKHR *present_mode, u32 image_array_layers, u32 graphics_queue_mode) {
    
    VkSharingMode image_sharing_mode = VK_SHARING_MODE_EXCLUSIVE;
	u32 queue_family_index_count = 0;
    u32 *ptr_queue_family_indices = VK_NULL_HANDLE;
	u32 queue_family_indices[] = {0, 1};
	if(graphics_queue_mode == 1){
		image_sharing_mode = VK_SHARING_MODE_CONCURRENT;
		queue_family_index_count = 2;
		ptr_queue_family_indices = queue_family_indices;
	}

	VkSwapchainCreateInfoKHR swapchain_create_info = {
		VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR,
		VK_NULL_HANDLE,
		0,
		*surface,
		surface_caps->minImageCount + 1,
		surface_format->format,
		surface_format->colorSpace,
		*extent,
		image_array_layers,
		VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
		image_sharing_mode,
		queue_family_index_count,
		ptr_queue_family_indices,
		surface_caps->currentTransform,
		VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR,
		*present_mode,
		VK_TRUE,
		VK_NULL_HANDLE
	};

	VkSwapchainKHR swapchain;
	vkCreateSwapchainKHR(*device, &swapchain_create_info, VK_NULL_HANDLE, &swapchain);
	return swapchain;
}

void vk_delete_swapchain(VkDevice *device, VkSwapchainKHR *swapchain) {
    vkDestroySwapchainKHR(*device, *swapchain, VK_NULL_HANDLE);
}

u32 vk_get_swapchain_image_count(VkDevice *device, VkSwapchainKHR *swapchain) {
    uint32_t swapchain_image_count;
	vkGetSwapchainImagesKHR(*device, *swapchain, &swapchain_image_count, VK_NULL_HANDLE);
	return swapchain_image_count;
}

VkImage *vk_get_swapchain_images(VkDevice *device, VkSwapchainKHR *swapchain, u32 swapchain_image_count) {
    VkImage *swapchain_images = (VkImage *)malloc(swapchain_image_count * sizeof(VkImage));
	vkGetSwapchainImagesKHR(*device, *swapchain, &swapchain_image_count, swapchain_images);
	return swapchain_images;
}

void vk_delete_swapchain_images(VkImage **images) {
    free(*images);
}

VkImageView *vk_create_image_views(VkDevice *device, VkImage **images, VkSurfaceFormatKHR *format, u32 image_count, u32 image_array_layers) {
    	VkComponentMapping componentMapping = {
		VK_COMPONENT_SWIZZLE_IDENTITY,
		VK_COMPONENT_SWIZZLE_IDENTITY,
		VK_COMPONENT_SWIZZLE_IDENTITY,
		VK_COMPONENT_SWIZZLE_IDENTITY
	};

	VkImageSubresourceRange imageSubresourceRange = {
		VK_IMAGE_ASPECT_COLOR_BIT,
		0,
		1,
		0,
		image_array_layers
	};

	VkImageViewCreateInfo *image_view_create_infos = (VkImageViewCreateInfo *)malloc(image_count * sizeof(VkImageViewCreateInfo));
	VkImageView *image_views = (VkImageView *)malloc(image_count * sizeof(VkImageView));

	for(uint32_t i = 0; i < image_count; i++){
		image_view_create_infos[i].sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
		image_view_create_infos[i].pNext = VK_NULL_HANDLE;
		image_view_create_infos[i].flags = 0;
		image_view_create_infos[i].image = (*images)[i];
		image_view_create_infos[i].viewType = VK_IMAGE_VIEW_TYPE_2D;
		image_view_create_infos[i].format = format->format;
		image_view_create_infos[i].components = componentMapping;
		image_view_create_infos[i].subresourceRange = imageSubresourceRange;

		vkCreateImageView(*device, &(image_view_create_infos[i]), VK_NULL_HANDLE, &(image_views[i]));
	}

	free(image_view_create_infos);
	return image_views;
}

void vk_delete_image_views(VkDevice *device, VkImageView **image_views, u32 image_view_count) {
    for(uint32_t i = 0; i < image_view_count; i++){
		vkDestroyImageView(*device, (*image_views)[i], VK_NULL_HANDLE);
	}
}

VkRenderPass vk_create_render_pass(VkDevice *device, VkSurfaceFormatKHR *format) {
    	VkAttachmentDescription attachment_desc = {
		0,
		format->format,
		VK_SAMPLE_COUNT_1_BIT,
		VK_ATTACHMENT_LOAD_OP_CLEAR,
		VK_ATTACHMENT_STORE_OP_STORE,
		VK_ATTACHMENT_LOAD_OP_DONT_CARE,
		VK_ATTACHMENT_STORE_OP_DONT_CARE,
		VK_IMAGE_LAYOUT_UNDEFINED,
		VK_IMAGE_LAYOUT_PRESENT_SRC_KHR
	};

	VkAttachmentReference attachment_ref = {
		0,
		VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL
	};

	VkSubpassDescription subpass_desc = {
		0,
		VK_PIPELINE_BIND_POINT_GRAPHICS,
		0,
		VK_NULL_HANDLE,
		1,
		&attachment_ref,
		VK_NULL_HANDLE,
		VK_NULL_HANDLE,
		0,
		VK_NULL_HANDLE
	};

	VkSubpassDependency subpass_dep = {
		VK_SUBPASS_EXTERNAL,
		0,
		VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT,
		VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT,
		0,
		VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT,
		0
	};

	VkRenderPassCreateInfo render_pass_create_info = {
		VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		1,
		&attachment_desc,
		1,
		&subpass_desc,
		1,
		&subpass_dep
	};

	VkRenderPass render_pass;
	vkCreateRenderPass(*device, &render_pass_create_info, VK_NULL_HANDLE, &render_pass);
	return render_pass;
}

void vk_delete_render_pass(VkDevice *device, VkRenderPass *pass) {
    vkDestroyRenderPass(*device, *pass, VK_NULL_HANDLE);
}

VkFramebuffer *vk_create_framebuffers(VkDevice *device, VkRenderPass *render_pass, VkExtent2D *extent, VkImageView **image_views, u32 image_view_count) {
    VkFramebufferCreateInfo *framebuffer_create_infos = (VkFramebufferCreateInfo *)malloc(image_view_count * sizeof(VkFramebufferCreateInfo));
	VkFramebuffer *framebuffers = (VkFramebuffer *)malloc(image_view_count * sizeof(VkFramebuffer));

	for(uint32_t i = 0; i < image_view_count; i++){
		framebuffer_create_infos[i].sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
		framebuffer_create_infos[i].pNext = VK_NULL_HANDLE;
		framebuffer_create_infos[i].flags = 0;
		framebuffer_create_infos[i].renderPass = *render_pass;
		framebuffer_create_infos[i].attachmentCount = 1;
		framebuffer_create_infos[i].pAttachments = &(*image_views)[i];
		framebuffer_create_infos[i].width = extent->width;
		framebuffer_create_infos[i].height = extent->height;
		framebuffer_create_infos[i].layers = 1;
		vkCreateFramebuffer(*device, &framebuffer_create_infos[i], VK_NULL_HANDLE, &framebuffers[i]);
	}

	free(framebuffer_create_infos);
	return framebuffers;
}

void vk_delete_framebuffers(VkDevice *device, VkFramebuffer **framebuffers, u32 framebuffer_count) {
    for(uint32_t i = 0; i < framebuffer_count; i++){
		vkDestroyFramebuffer(*device, (*framebuffers)[i], VK_NULL_HANDLE);
	}
	free(*framebuffers);
}

char* vk_get_shader_code(const char *filename, u32 *shader_size) {
    file_o file = os_api->file_io->open_input(filename);
    os_api->file_io->read(file, shader_size, sizeof(u32));
}

void vk_delete_shader_code(char **shader_code) {
    free(*shader_code);
}

VkShaderModule vk_create_shader_module(VkDevice *device, char* shader_code, u32 shader_size) {
    VkShaderModuleCreateInfo shader_module_create_info = {
		VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		shader_size,
		(const uint32_t *)shader_code
	};

	VkShaderModule shader_module;
	vkCreateShaderModule(*device, &shader_module_create_info, VK_NULL_HANDLE, &shader_module);
	return shader_module;
}

void vk_delete_shader_module(VkDevice *device, VkShaderModule *shader_module) {
    vkDestroyShaderModule(*device, *shader_module, VK_NULL_HANDLE);
}

VkPipelineLayout vk_create_pipeline_layout(VkDevice *device) {
    VkPipelineLayoutCreateInfo pipeline_layout_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		0,
		VK_NULL_HANDLE,
		0,
		VK_NULL_HANDLE
	};

	VkPipelineLayout layout;
	vkCreatePipelineLayout(*device, &pipeline_layout_create_info, VK_NULL_HANDLE, &layout);
	return layout;
}

void vk_delete_pipeline_layout(VkDevice *device, VkPipelineLayout *layout) {
    vkDestroyPipelineLayout(*device, *layout, VK_NULL_HANDLE);
}

VkPipelineShaderStageCreateInfo vk_configure_vertex_shader_stage_create_info(VkShaderModule *module, const char *entry_name) {
    VkPipelineShaderStageCreateInfo vertex_shader_stage_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		VK_SHADER_STAGE_VERTEX_BIT,
		*module,
		entry_name,
		VK_NULL_HANDLE
	};
	return vertex_shader_stage_create_info;
}

VkPipelineShaderStageCreateInfo vk_configure_fragment_shader_stage_create_info(VkShaderModule *module, const char *entry_name) {
    VkPipelineShaderStageCreateInfo fragment_shader_stage_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		VK_SHADER_STAGE_FRAGMENT_BIT,
		*module,
		entry_name,
		VK_NULL_HANDLE
	};
	return fragment_shader_stage_create_info;
}

VkPipelineVertexInputStateCreateInfo vk_configure_vertex_input_state_create_info(void) {
    VkPipelineVertexInputStateCreateInfo vertex_input_state_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		0,
		VK_NULL_HANDLE,
		0,
		VK_NULL_HANDLE
	};
	return vertex_input_state_create_info;
}

VkPipelineInputAssemblyStateCreateInfo vk_configure_input_assembly_state_create_info(void) {
    VkPipelineInputAssemblyStateCreateInfo input_assembly_state_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST,
		VK_FALSE
	};
	return input_assembly_state_create_info;
}

VkViewport vk_configure_viewport(VkExtent2D *extent) {
    VkViewport viewport = {
		1.0f,
		1.0f,
		extent->width,
		extent->height,
		0.0f,
		1.0f
	};
	return viewport;
}

VkRect2D vk_configure_scissor(VkExtent2D *extent, u32 left, u32 right, u32 up, u32 down) {
    left = MACRO_MIN(left, extent->width);
    right = MACRO_MIN(right, extent->width);
    up = MACRO_MIN(up, extent->height);
    down = MACRO_MIN(down, extent->height);

	VkOffset2D _offset = { left, up };
	VkExtent2D _extent = {
		extent->width - left - right,
		extent->height - up - down
	};
	VkRect2D scissor = {
		_offset,
		_extent
	};
	return scissor;
}

VkPipelineViewportStateCreateInfo vk_configure_viewport_state_create_info(VkViewport *viewport, VkRect2D *scissor) {
    VkPipelineViewportStateCreateInfo viewport_state_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		1,
		viewport,
		1,
		scissor
	};

	return viewport_state_create_info;
}

VkPipelineRasterizationStateCreateInfo vk_configure_rasterization_state_create_info(void) {
    VkPipelineRasterizationStateCreateInfo rasterization_state_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		VK_FALSE,
		VK_FALSE,
		VK_POLYGON_MODE_FILL,
		VK_CULL_MODE_BACK_BIT,
		VK_FRONT_FACE_CLOCKWISE,
		VK_FALSE,
		0.0f,
		0.0f,
		0.0f,
		1.0f
	};
	return rasterization_state_create_info;
}

VkPipelineMultisampleStateCreateInfo vk_configure_multisample_state_create_info(void) {
    	VkPipelineMultisampleStateCreateInfo multisample_state_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		VK_SAMPLE_COUNT_1_BIT,
		VK_FALSE,
		1.0f,
		VK_NULL_HANDLE,
		VK_FALSE,
		VK_FALSE
	};
	return multisample_state_create_info;
}

VkPipelineColorBlendAttachmentState vk_configure_color_blend_attachment_state(void) {
    VkPipelineColorBlendAttachmentState color_blend_attachment_state = {
		VK_FALSE,
		VK_BLEND_FACTOR_ONE,
		VK_BLEND_FACTOR_ZERO,
		VK_BLEND_OP_ADD,
		VK_BLEND_FACTOR_ONE,
		VK_BLEND_FACTOR_ZERO,
		VK_BLEND_OP_ADD,
		VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT | VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT
	};
	return color_blend_attachment_state;
}

VkPipelineColorBlendStateCreateInfo vk_configure_color_blend_state_create_info(VkPipelineColorBlendAttachmentState *color_blend_attachment_state) {
    VkPipelineColorBlendStateCreateInfo color_blend_state_create_info = {
		VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		VK_FALSE,
		VK_LOGIC_OP_COPY,
		1,
		color_blend_attachment_state,
		{0.0f, 0.0f, 0.0f, 0.0f}
	};
	return color_blend_state_create_info;
}

VkPipeline vk_create_graphics_pipeline(VkDevice *device, VkPipelineLayout *pipeline_layout,
    VkShaderModule *vertex_shader_module, const char *vertex_entry,
    VkShaderModule *fragment_shader_module, const char *fragment_entry,
    VkRenderPass *pass, VkExtent2D *extent) {
    char entryName[] = "main";
	VkPipelineShaderStageCreateInfo shader_stage_create_info[] = {
		configureVertexShaderStageCreateInfo(vertex_shader_module, vertex_entry),
		configureFragmentShaderStageCreateInfo(fragment_shader_module, fragment_entry)
	};
	VkPipelineVertexInputStateCreateInfo vertex_input_state_create_info = vk_configure_vertex_input_state_create_info();
	VkPipelineInputAssemblyStateCreateInfo input_assembly_state_create_info = vk_configure_input_assembly_state_create_info();
	VkViewport viewport = vk_configure_viewport(extent);
	VkRect2D scissor = vk_configure_scissor(extent, 0, 0, 0, 0);
	VkPipelineViewportStateCreateInfo viewport_state_create_info = vk_configure_viewport_state_create_info(&viewport, &scissor);
	VkPipelineRasterizationStateCreateInfo rasterization_state_create_info = vk_configure_rasterization_state_create_info();
	VkPipelineMultisampleStateCreateInfo multisample_state_create_info = vk_configure_multisample_state_create_info();
	VkPipelineColorBlendAttachmentState color_blend_attachment_state = vk_configure_color_blend_attachment_state();
	VkPipelineColorBlendStateCreateInfo color_blend_state_create_info = vk_configure_color_blend_state_create_info(&color_blend_attachment_state);

	VkGraphicsPipelineCreateInfo graphics_pipeline_create_info = {
		VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		2,
		shader_stage_create_info,
		&vertex_input_state_create_info,
		&input_assembly_state_create_info,
		VK_NULL_HANDLE,
		&viewport_state_create_info,
		&rasterization_state_create_info,
		&multisample_state_create_info,
		VK_NULL_HANDLE,
		&color_blend_state_create_info,
		VK_NULL_HANDLE,
		*pipeline_layout,
		*pass,
		0,
		VK_NULL_HANDLE,
		-1
	};

	VkPipeline graphics_pipeline;
	vkCreateGraphicsPipelines(*device, VK_NULL_HANDLE, 1, &graphics_pipeline_create_info, VK_NULL_HANDLE, &graphics_pipeline);
	return graphics_pipeline;
}

void vk_delete_graphics_pipeline(VkDevice *device, VkPipeline *graphics_pipeline) {
    vkDestroyPipeline(*device, *graphics_pipeline, VK_NULL_HANDLE);
}

VkCommandPool vk_create_command_pool(VkDevice *device, u32 queue_family_index) {
    	VkCommandPoolCreateInfo command_pool_create_info = {
		VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO,
		VK_NULL_HANDLE,
		0,
		queue_family_index
	};

	VkCommandPool pool;
	vkCreateCommandPool(*device, &command_pool_create_info, VK_NULL_HANDLE, &pool);
	return pool;
}

void vk_delete_command_pool(VkDevice *device, VkCommandPool *command_pool) {
    vkDestroyCommandPool(*device, *command_pool, VK_NULL_HANDLE);
}

VkCommandBuffer *vk_create_command_buffers(VkDevice *device, VkCommandPool *command_pool, u32 command_buffer_count) {
    VkCommandBufferAllocateInfo command_buffer_allocate_info = {
		VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO,
		VK_NULL_HANDLE,
		*command_pool,
		VK_COMMAND_BUFFER_LEVEL_PRIMARY,
		command_buffer_count
	};

	VkCommandBuffer *command_buffers = (VkCommandBuffer *)malloc(command_buffer_count * sizeof(VkCommandBuffer));
	vkAllocateCommandBuffers(*device, &command_buffer_allocate_info, command_buffers);
	return command_buffers;
}

void vk_delete_command_buffers(VkDevice *device, VkCommandBuffer **command_buffers, VkCommandPool *command_pool, u32 command_buffer_count) {
    vkFreeCommandBuffers(*device, *command_pool, command_buffer_count, *command_buffers);
	free(*command_buffers);
}
void vk_record_command_buffers(VkCommandBuffer **command_buffers, VkRenderPass *render_pass, VkFramebuffer **framebuffers, VkExtent2D *extent, VkPipeline *pipeline, u32 command_buffer_count) {
    VkCommandBufferBeginInfo *command_buffer_begin_infos = (VkCommandBufferBeginInfo *)malloc(command_buffer_count * sizeof(VkCommandBufferBeginInfo));
	VkRenderPassBeginInfo *render_pass_begin_infos = (VkRenderPassBeginInfo *)malloc(command_buffer_count *sizeof(VkRenderPassBeginInfo));
	VkRect2D render_area = {
		{0, 0},
		{extent->width, extent->height}
	};
	VkClearValue clear_value = {0.6f, 0.2f, 0.8f, 0.0f};

	for(uint32_t i = 0; i < command_buffer_count; i++){
		command_buffer_begin_infos[i].sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
		command_buffer_begin_infos[i].pNext = VK_NULL_HANDLE;
		command_buffer_begin_infos[i].flags = 0;
		command_buffer_begin_infos[i].pInheritanceInfo = VK_NULL_HANDLE;

		render_pass_begin_infos[i].sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
		render_pass_begin_infos[i].pNext = VK_NULL_HANDLE;
		render_pass_begin_infos[i].renderPass = *render_pass;
		render_pass_begin_infos[i].framebuffer = (*framebuffers)[i];
		render_pass_begin_infos[i].renderArea = render_area;
		render_pass_begin_infos[i].clearValueCount = 1;
		render_pass_begin_infos[i].pClearValues = &clear_value;

		vkBeginCommandBuffer((*command_buffers)[i], &command_buffer_begin_infos[i]);
		vkCmdBeginRenderPass((*command_buffers)[i], &render_pass_begin_infos[i], VK_SUBPASS_CONTENTS_INLINE);
		vkCmdBindPipeline((*command_buffers)[i], VK_PIPELINE_BIND_POINT_GRAPHICS, *pipeline);
		vkCmdDraw((*command_buffers)[i], 3, 1, 0, 0);
		vkCmdEndRenderPass((*command_buffers)[i]);
		vkEndCommandBuffer((*command_buffers)[i]);
	}

	free(render_pass_begin_infos);
	free(command_buffer_begin_infos);
}



#endif
