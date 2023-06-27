#include "component/render_system/render_system.h"

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
    metal_library_t *library;
} render_system_t;

static render_system_t render_system;

void render_system_init(void) {
    render_system.gpu_device = metal_create_default_device();
    render_system.library = metal_create_library_from_source(render_system.gpu_device, "build/metallib/default.metallib");
}

void render_system_swapchain_present(swapchain_o *swapchain) {
    metal_present(swapchain->swapchain);
}

swapchain_o* render_system_create_swapchain(window_t *window)
{
    GLFWwindow *native_window = (GLFWwindow*)platform_window_get_native_handle(window);
    swapchain_o *swapchain = malloc(sizeof(swapchain_o));
    swapchain->swapchain = metal_create_swapchain(render_system.gpu_device, native_window);
    return swapchain;
}

void render_system_terminate(void) {
    
}

#else // OS_WINDOWS or OS_LINUX

typedef struct render_system_t {
    VkInstance instance;
    VkDevice device;
    u32 graphics_queue_mode;
    VkQueue graphics_queue, presenting_queue;
    VkPhysicalDevice *physical_devices;
    VkPhysicalDevice *best_physical_device;
    u32 best_physical_device_index;
    VkCommandPool command_pool;
} render_system_t;

static render_system_t render_system;

typedef struct swapchain_o {
    u32 max_frames;
    u32 current_frame;
    u32 swapchain_image_count;
    VkSurfaceKHR surface;
    VkSwapchainKHR swapchain;
    VkRenderPass render_pass;

    VkImage *swapchain_images;
    VkImageView *swapchain_image_views;
    VkFramebuffer *framebuffers;

    VkCommandBuffer *command_buffers;
    VkSemaphore *wait_semaphores, *signal_semaphores;
    VkFence *front_fences, *back_fences;
} swapchain_o;

void render_system_init(void) {
    glfwInit();

    render_system.instance = vk_create_instance();
    u32 physical_device_number = vk_get_physical_device_number(&render_system.instance);
    VkPhysicalDevice *physical_devices = vk_get_physical_devices(&render_system.instance, physical_device_number);
    u32 best_physical_device_index = vk_get_best_physical_device_index(physical_devices, physical_device_number);
    VkPhysicalDevice *best_physical_device = &physical_devices[best_physical_device_index];
    render_system.physical_devices = physical_devices;
    render_system.best_physical_device = best_physical_device;
    render_system.best_physical_device_index = best_physical_device_index;

    u32 queue_family_count = vk_get_queue_family_number(best_physical_device);
    VkQueueFamilyProperties *queue_family_props = vk_get_queue_family_properties(best_physical_device, queue_family_count);

    VkDevice device = vk_create_device(best_physical_device, queue_family_count, queue_family_props);
    render_system.device = device;

    u32 best_queue_family_index = vk_get_best_graphics_queue_family_index(queue_family_props, queue_family_count);
    VkQueue graphics_queue = vk_get_drawing_queue(&device, best_queue_family_index);
    u32 graphics_queue_mode = vk_get_graphics_queue_mode(queue_family_props, best_queue_family_index);
    render_system.graphics_queue = graphics_queue;
    VkQueue presenting_queue = vk_get_presenting_queue(&device, best_queue_family_index, graphics_queue_mode);
    render_system.presenting_queue = presenting_queue;
    render_system.graphics_queue_mode = graphics_queue_mode;
    vk_delete_queue_family_properties(&queue_family_props);

    render_system.command_pool = vk_create_command_pool(&render_system.device, best_queue_family_index);
}

swapchain_o* render_system_create_swapchain(window_t *window)
{
    GLFWwindow *native_window = (GLFWwindow *)platform_window_get_native_handle(window);
    swapchain_o *render_swapchain = (swapchain_o *)malloc(sizeof(swapchain_o));
    VkSurfaceKHR surface = vk_create_surface(native_window, &render_system.instance);
    VkBool32 surface_supported = vk_get_surface_supported(&surface, render_system.best_physical_device, render_system.best_physical_device_index);
    if (!surface_supported) {
        printf("vulkan surface not supported!\n");
        render_system_terminate();
        exit(2);
    }

    VkSurfaceCapabilitiesKHR surface_caps = vk_get_surface_capabilities(&surface, render_system.best_physical_device);
    VkSurfaceFormatKHR best_furface_format = vk_get_best_surface_format(&surface, render_system.best_physical_device);
    VkPresentModeKHR best_present_mode = vk_get_best_present_mode(&surface, render_system.best_physical_device);
    VkExtent2D extent = vk_get_best_swapchain_extent(&surface_caps, native_window);
    u32 image_array_layers = 1;
    VkSwapchainKHR swapchain = vk_create_swapchain(&render_system.device, &surface, &surface_caps, &best_furface_format, &extent, &best_present_mode, image_array_layers, render_system.graphics_queue_mode);
    
    u32 swapchain_image_count = vk_get_swapchain_image_count(&render_system.device, &swapchain);
    VkImage *swapchain_images = vk_get_swapchain_images(&render_system.device, &swapchain, swapchain_image_count);
    VkImageView *swapchain_image_views = vk_create_image_views(&render_system.device, &swapchain_images, &best_furface_format, swapchain_image_count, image_array_layers);
    VkRenderPass render_pass = vk_create_render_pass(&render_system.device, &best_furface_format);
    VkFramebuffer *framebuffers = vk_create_framebuffers(&render_system.device, &render_pass, &extent, &swapchain_image_views, swapchain_image_count);
    VkCommandBuffer *command_buffer = vk_create_command_buffers(&render_system.device, &render_system.command_pool, swapchain_image_count);

    u32 max_frames = 3;
    VkSemaphore *wait_semaphores = vk_create_semaphores(&render_system.device, max_frames);
    VkSemaphore *signal_semaphores = vk_create_semaphores(&render_system.device, max_frames);
    VkFence *front_fences = vk_create_fences(&render_system.device, max_frames);
    VkFence *back_fences = vk_create_empty_fences(max_frames);
    render_swapchain->surface = surface;
    render_swapchain->swapchain = swapchain;
    render_swapchain->max_frames = max_frames;
    render_swapchain->current_frame = 0;
    render_swapchain->framebuffers = framebuffers;
    render_swapchain->command_buffers = command_buffer;
    render_swapchain->wait_semaphores = wait_semaphores;
    render_swapchain->signal_semaphores = signal_semaphores;
    render_swapchain->front_fences = front_fences;
    render_swapchain->back_fences = back_fences;
    render_swapchain->swapchain_image_count = swapchain_image_count;
    render_swapchain->swapchain_images = swapchain_images;
    render_swapchain->swapchain_image_views = swapchain_image_views;
    render_swapchain->render_pass = render_pass;

    return render_swapchain;
}

void render_system_destroy_swapchain(swapchain_o *swapchain) {
    u32 max_frames = swapchain->max_frames;
    u32 swapchain_image_count = swapchain->swapchain_image_count;
    vk_delete_empty_fences(&swapchain->back_fences);
    vk_delete_fences(&render_system.device, &swapchain->front_fences, max_frames);
    vk_delete_semaphores(&render_system.device, &swapchain->signal_semaphores, max_frames);
    vk_delete_semaphores(&render_system.device, &swapchain->wait_semaphores, max_frames);
    vk_delete_command_buffers(&render_system.device, &swapchain->command_buffers, &render_system.command_pool, swapchain_image_count);
    vk_delete_framebuffers(&render_system.device, &swapchain->framebuffers, swapchain_image_count);
    vk_delete_render_pass(&render_system.device, &swapchain->render_pass);
    vk_delete_image_views(&render_system.device, &swapchain->swapchain_image_views, swapchain_image_count);
    vk_delete_swapchain_images(&swapchain->swapchain_images);
    vk_delete_swapchain(&render_system.device, &swapchain->swapchain);
    vk_delete_surface(&swapchain->surface, &render_system.instance);
}

void render_system_swapchain_present(swapchain_o *swapchain) {
    VkFence *back_fences = swapchain->back_fences;
    VkFence *front_fences = swapchain->front_fences;
    VkSemaphore *wait_semaphores = swapchain->wait_semaphores;
    VkSemaphore *signal_semaphores = swapchain->signal_semaphores;
    VkCommandBuffer *command_buffers = swapchain->command_buffers;
    u32 current_frame = swapchain->current_frame;
    u32 max_frames = swapchain->max_frames;

    vkWaitForFences(render_system.device, 1, &front_fences[current_frame], VK_TRUE, UINT64_MAX);
    u32 image_index = 0;
    vkAcquireNextImageKHR(render_system.device, swapchain->swapchain, UINT64_MAX, wait_semaphores[current_frame], VK_NULL_HANDLE, &image_index);

    if(back_fences[image_index] != VK_NULL_HANDLE){
		vkWaitForFences(render_system.device, 1, &back_fences[image_index], VK_TRUE, UINT64_MAX);
	}

    back_fences[image_index] = front_fences[current_frame];
	VkPipelineStageFlags pipeline_stage = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;

	VkSubmitInfo submitInfo = {
		VK_STRUCTURE_TYPE_SUBMIT_INFO,
		VK_NULL_HANDLE,
		1,
		&wait_semaphores[current_frame],
		&pipeline_stage,
		1,
		&command_buffers[image_index],
		1,
		&signal_semaphores[current_frame]
	};
	vkResetFences(render_system.device, 1, &front_fences[current_frame]);
	vkQueueSubmit(render_system.graphics_queue, 1, &submitInfo, front_fences[current_frame]);

	VkPresentInfoKHR present_info = {
		VK_STRUCTURE_TYPE_PRESENT_INFO_KHR,
		VK_NULL_HANDLE,
		1,
		&signal_semaphores[current_frame],
		1,
		&(swapchain->swapchain),
		&image_index,
		VK_NULL_HANDLE
	};
	vkQueuePresentKHR(render_system.presenting_queue, &present_info);
	swapchain->current_frame = (current_frame + 1) % max_frames;
}

void render_system_terminate(void) {
    vk_delete_command_pool(&render_system.device, &render_system.command_pool);
    vk_delete_device(&render_system.device);
    vk_delete_physical_devices(&render_system.physical_devices);
    vk_delete_instance(&render_system.instance);
}

#endif

