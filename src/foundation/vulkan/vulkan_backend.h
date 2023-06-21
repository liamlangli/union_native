#ifndef _vulkan_backend_h_
#define _vulkan_backend_h_

#include <vulkan/vulkan.h>
#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#include "global.h"

enum VK_QUEUE_MODE {
    SINGLE_QUEUE_MODE = 0,
    DOUBLE_QUEUE_MODE = 1,
    INVALID_QUEUE_MODE = 2
};

VkInstance vk_create_instance();
void vk_destroy_instance(VkInstance *instance);

u32 vk_get_physical_device_number(VkInstance *instance);
VkPhysicalDevice *vk_get_physical_devices(VkInstance *instance, u32 physical_device_number);
void vk_delete_physical_device(VkPhysicalDevice **physical_devices);

u32 vk_get_best_physical_device_index(VkPhysicalDevice *physical_devices, u32 physical_device_number);
u32 vk_get_physical_device_total_memory(VkPhysicalDeviceMemoryProperties *physical_device_mem_props);

u32 vk_get_queue_family_number(VkPhysicalDevice *physical_device);
VkQueueFamilyProperties *vk_get_queue_family_properties(VkPhysicalDevice *physical_device, u32 queue_family_number);
void delete_queue_family_properties(VkQueueFamilyProperties **queue_family_props);

VkDevice vk_create_device(VkPhysicalDevice *physical_device, u32 queue_family_number, VkQueueFamilyProperties *queue_family_props);
void vk_delete_device(VkDevice *device);

u32 vk_get_best_graphics_queue_family_index(VkQueueFamilyProperties *queue_family_props, u32 queue_family_number);
u32 vk_get_graphics_queue_mode(VkQueueFamilyProperties *queue_family_props, u32 graphics_queue_family_index);
VkQueue vk_get_drawing_queue(VkDevice *device, u32 graphics_queue_family_index);
VkQueue vk_get_presenting_queue(VkDevice *device, u32 graphics_queue_family_index, u32 graphics_queue_mode);

VkSurfaceKHR vk_create_surface(GLFWwindow* native_window, VkInstance *instance);
void vk_delete_surface(VkSurfaceKHR *surface, VkInstance *instance);
VkBool32 vk_get_surface_supported(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device, u32 graphics_queue_family_index);

VkSurfaceCapabilitiesKHR vk_get_surface_capabilities(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device);
VkSurfaceFormatKHR vk_get_surface_format(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device);
VkPresentModeKHR vk_get_best_present_mode(VkSurfaceKHR *surface, VkPhysicalDevice *physical_device);
VkExtent2D vk_get_best_swapchain_extent(VkSurfaceCapabilitiesKHR *surface_caps, GLFWwindow *native_window);

VkSwapchainKHR vk_create_swapchain(VkDevice *device, VkSurfaceKHR *surface, VkSurfaceCapabilitiesKHR *surface_caps, VkSurfaceFormatKHR *surface_format, VkExtent2D *extent, VkPresentModeKHR *present_mode, u32 image_array_layers, u32 graphics_queue_mode);
void vk_delete_swapchain(VkDevice *device, VkSwapchainKHR *swapchain);

u32 vk_get_swapchain_image_number(VkDevice *device, VkSwapchainKHR *swapchain);
VkImage *vk_get_swapchain_images(VkDevice *device, VkSwapchainKHR *swapchain, u32 swapchain_image_number);
void vk_delete_swapchain_images(VkImage *images);

VkImageView *vk_create_image_views(VKDevice *device, VKImage **images, VkSurfaceFormatKHR *format, u23 image_number, u32 image_array_layers);
void vk_delete_image_views(VkDevice *device, VkImageView **image_views, u32 image_view_number);

VkRenderPass vk_create_render_pass(VkDevice *device, VkSurfaceFormatKHR *format);
void vk_delete_render_pass(VkDevice *device, VkRenderPass *pass);
VkFramebuffer *vk_create_framebuffers(VkDevice *device, VkRenderPass *render_pass, VkExtent2D *extent, VkImageView **image_views, u32 image_view_number);
void vk_delete_framebuffers(VkDevice *device, VkFramebuffer **framebuffers, u32 framebuffer_number);

char* vk_get_shader_code(const char *filename, u32 *shader_size);
void vk_delete_shader_code(char **shader_code);
VkShaderModule vk_create_shader_module(VkDevice *device, char* shader_code, u32 shader_size);
void vk_delete_shader_module(VkDevice *device, VkShaderModule *shader_module);

VkPipelineLayout vk_create_pipeline_layout(VkDevice *device);
void vk_delete_pipeline_layout(VkDevice *device, VkPipelineLayout *layout);
VkPipelineShaderStageCreateInfo vk_configure_vertex_shader_stage_create_info(VkShaderModule *module, const char *entry_name);
VkPipelineShaderStageCreateInfo vk_configure_fragment_shader_stage_create_info(VkShaderModule *module, const char *entry_name);
VkPipelineVertexInputStateCreateInfo vk_configure_vertex_input_state_create_info();
VkPipelineInputAssemblyStateCreateInfo vk_configure_input_assembly_state_create_info();
VkViewport vk_configure_viewport(VkExtent2D *extent);
VkRect2D vk_configure_scissor(VkExtent2D *extent, u32 left, u32 right, u32 up, u32 down);
VkPipelineViewportStateCreateInfo vk_configure_viewport_state_create_info(VkViewport *viewport, VkRect2D *scissor);
VkPipelineRasterizationStateCreateInfo vk_configure_rasterization_state_create_info();
VkPipelineMultisampleStateCreateInfo vk_configure_multisample_state_create_info();
VkPipelineColorBlendAttachmentState vk_configure_color_blend_attachment_state();
VkPipelineColorBlendStateCreateInfo vk_configure_color_blend_state_create_info(VkPipelineColorBlendAttachmentState *color_blend_attachment_state);
VkPipeline vk_create_graphics_pipeline(VkDevice *device, VkPipelineLayout *pipeline_layout, VkShaderModule *vertex_shader_module, VkShaderModule *fragment_shader_module, VkrenderPass *pass, VkExtent2D *extent);
void vk_delete_graphics_pipeline(VkDevice *device, VkPipeline *graphics_pipeline);

VkCommandPool vk_create_command_pool(VkDevice *device, u32 queue_family_index);
void vk_delete_command_pool(VkDevice * device, VkCommandPool *command_pool);
VkCommandBuffer *vk_create_command_buffers(VkDevice *device, VkCommandPool *command_pool, u32 command_buffer_number);
void vk_delete_command_buffers(VkDevice *device, VkCommandBuffer **command_buffers, VkCommandPool *command_pool, u32 command_buffer_number);
void vk_record_command_buffers(VkCommandBuffer **command_buffers, VkRenderPass *render_pass, VkFramebuffer **framebuffer, VkExtent2D *extent, VkPipeline *pipeline, u32 command_buffer_number);

VkSemaphore *vk_create_semaphores(VkDevice *device, u32 max_frames);
void vk_delete_semaphores(VkDevice *device, VkSemaphore **semaphores, u32 max_frames);
VkFence *vk_create_fences(VkDevice *device, u32 max_frames);
void vk_delete_fences(VkDevice *device, VkFence **fences, u32 max_frames);
VKFence *vk_create_empty_fences(u32 max_frames);
void vk_delete_empty_fences(VkFence **fences);

void vk_present_image(VkDevice *device, GLFWwindow *native_window, VkCommandBuffer *command_buffer, VkFence *front_fence, VkFence *bacK_fence, VkSemaphore *wait_semaphores, VkSemaphore *signal_semaphores, VkSwapchainKHR *swapchain, VKqueue *drawing_queue, VkQueue *presenting_queue, u32 max_frames);
void test_loop(GLFWwindow *native_window);

#endif