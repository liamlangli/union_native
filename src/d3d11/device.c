#include "gpu/gpu.h"

#ifdef OS_WINDOWS

#include "d3d11.h"

typedef struct gpu_device_d3d11_t {
    IDXGISwapChain *swapchain;
    ID3D11Device *dev;
    ID3D11DeviceContext *ctx;
    ID3D11RenderTargetView *back;
} gpu_device_d3d11_t;

static gpu_device_d3d11_t _device;

bool gpu_request_device(os_window_t *window) {

    HRESULT hr;

    HWND hwnd = window->native_window;
    // Swap chain description
    DXGI_SWAP_CHAIN_DESC scd = {0};
    scd.BufferCount = 3;                                    // one back buffer
    scd.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;     // use 32-bit color
    scd.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;      // how swap chain is to be used
    scd.OutputWindow = hwnd;                                // the window to be used
    scd.SampleDesc.Count = 1;                               // how many multisamples
    scd.Windowed = TRUE;                                    // windowed/full-screen mode

    // Create device and swap chain
    hr = D3D11CreateDeviceAndSwapChain(NULL, D3D_DRIVER_TYPE_HARDWARE, NULL, 0, NULL, 0,
                                       D3D11_SDK_VERSION, &scd, &_device.swapchain, &_device.dev, NULL, &_device.ctx);
    if (FAILED(hr)) {
        return hr;
    }

    IDXGISwapChain *swapchain = _device.swapchain;
    ID3D11Device *dev = _device.dev;
    ID3D11DeviceContext *ctx = _device.ctx;

    ID3D11Texture2D *back_buffer_ptr;
    swapchain->lpVtbl->GetBuffer(swapchain, 0, &IID_ID3D11Texture2D, (LPVOID*)&back_buffer_ptr);

    // Create the render target view
    hr = dev->lpVtbl->CreateRenderTargetView(dev, (ID3D11Resource*)back_buffer_ptr, NULL, &_device.back);
    back_buffer_ptr->lpVtbl->Release(back_buffer_ptr);
    if (FAILED(hr)) {
        return hr;
    }

    // Set the render target as the back buffer
    ctx->lpVtbl->OMSetRenderTargets(ctx, 1, &_device.back, NULL);

    // Set the viewport
    D3D11_VIEWPORT viewport = {0};
    viewport.TopLeftX = 0;
    viewport.TopLeftY = 0;
    viewport.Width = window->width;
    viewport.Height = window->height;
    ctx->lpVtbl->RSSetViewports(ctx, 1, &viewport);
    return true;
}

void gpu_destroy_device(void) {
    IDXGISwapChain *swapchain = _device.swapchain;
    if (swapchain) {
        swapchain->lpVtbl->SetFullscreenState(swapchain, FALSE, NULL); // switch to windowed mode
    }
    if (_device.back) _device.back->lpVtbl->Release(_device.back);
    if (swapchain) swapchain->lpVtbl->Release(swapchain);
    if (_device.dev) _device.dev->lpVtbl->Release(_device.dev);
    if (_device.ctx) _device.ctx->lpVtbl->Release(_device.ctx);
}

gpu_texture gpu_create_texture(gpu_texture_desc *desc) {
    return (gpu_texture){0};
}
gpu_sampler gpu_create_sampler(gpu_sampler_desc *desc) {
    return (gpu_sampler){0};
}
gpu_buffer gpu_create_buffer(gpu_buffer_desc *desc) {
    return (gpu_buffer){0};
}
gpu_shader gpu_create_shader(gpu_shader_desc *desc) {
    return (gpu_shader){0};
}
gpu_pipeline gpu_create_pipeline(gpu_pipeline_desc *desc) {
    return (gpu_pipeline){0};
}
gpu_attachments gpu_create_attachments(gpu_attachments_desc *desc) {
    return (gpu_attachments){0};
}

void gpu_destroy_texture(gpu_texture texture) {}
void gpu_destroy_sampler(gpu_sampler sampler) {}
void gpu_destroy_buffer(gpu_buffer buffer) {} 
void gpu_destroy_shader(gpu_shader shader) {}
void gpu_destroy_pipeline(gpu_pipeline pipeline) {}
void gpu_destroy_attachments(gpu_attachments attachments) {}

void gpu_update_texture(gpu_texture texture, udata data) {}
void gpu_update_buffer(gpu_buffer buffer, udata data) {}

bool gpu_begin_pass(gpu_pass *pass) {
    _device.ctx->lpVtbl->ClearRenderTargetView(_device.ctx, _device.back, (f32*)&pass->action.color_action[0].clear_value);
    return true;
}
void gpu_set_viewport(int x, int y, int width, int height) {}
void gpu_set_scissor(int x, int y, int width, int height) {}
void gpu_set_pipeline(gpu_pipeline pipeline) {}
void gpu_set_binding(const gpu_binding* binding) {}
void gpu_draw(int base, int count, int instance_count) {}
void gpu_end_pass(void) {}
void gpu_commit(void) {
    _device.swapchain->lpVtbl->Present(_device.swapchain, 0, 0);
}

#endif