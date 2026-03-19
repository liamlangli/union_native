#include "ui/ui_renderer.h"

#include "core/io.h"
#include "core/logger.h"
#include "script/script.h"
#include "ui/ui_font.h"
#include "webgpu_context.h"

#include <algorithm>
#include <array>
#include <cstring>
#include <fstream>
#include <string>
#include <vector>

namespace {

constexpr u32 kInitialPrimitiveWordCapacity = 262144;
constexpr u32 kInitialIndexCapacity = kInitialPrimitiveWordCapacity * 3;
constexpr u32 kTextureWidth = 4096;
constexpr u32 kIconTextureExtent = 1024;
constexpr std::array<u32, MAX_UI_LAYERS> kLayerPrimitiveBase = {0u, 237568u, 241664u, 258048u};
constexpr const char *kUiShaderPath = "public/shader/ui.wgsl";

struct LayerStorage {
    std::vector<u32> primitive_data;
    std::vector<u32> index_data;
    u32 primitive_base = 0;
    u32 primitive_offset = 0;

    void reset() {
        primitive_data.clear();
        index_data.clear();
        primitive_offset = primitive_base;
    }
};

static std::string read_text_file(std::string_view path) {
    std::ifstream stream(std::string(path), std::ios::binary);
    return std::string((std::istreambuf_iterator<char>(stream)), std::istreambuf_iterator<char>());
}

static WGPUTexture create_texture(const char *label, u32 width, u32 height, WGPUTextureFormat format) {
    WGPUTextureDescriptor desc = {};
    desc.label = label;
    desc.usage = WGPUTextureUsage_TextureBinding | WGPUTextureUsage_CopyDst;
    desc.dimension = WGPUTextureDimension_2D;
    desc.size = (WGPUExtent3D){width, height, 1};
    desc.format = format;
    desc.mipLevelCount = 1;
    desc.sampleCount = 1;
    return wgpuDeviceCreateTexture(webgpu_device(), &desc);
}

static WGPUTextureView create_texture_view(WGPUTexture texture, WGPUTextureFormat format) {
    WGPUTextureViewDescriptor desc = {};
    desc.format = format;
    desc.dimension = WGPUTextureViewDimension_2D;
    desc.baseMipLevel = 0;
    desc.mipLevelCount = 1;
    desc.baseArrayLayer = 0;
    desc.arrayLayerCount = 1;
    return wgpuTextureCreateView(texture, &desc);
}

static WGPUBuffer create_buffer(const char *label, u64 size, WGPUBufferUsage usage) {
    WGPUBufferDescriptor desc = {};
    desc.label = label;
    desc.size = size;
    desc.usage = usage | WGPUBufferUsage_CopyDst;
    return wgpuDeviceCreateBuffer(webgpu_device(), &desc);
}

static WGPUShaderModule create_shader_module(const std::string &source) {
    WGPUShaderSourceWGSL wgsl = {};
    wgsl.chain.sType = WGPUSType_ShaderSourceWGSL;
    wgsl.code.data = source.c_str();
    wgsl.code.length = source.size();

    WGPUShaderModuleDescriptor desc = {};
    desc.nextInChain = &wgsl.chain;
    desc.label = "ui_shader";
    return wgpuDeviceCreateShaderModule(webgpu_device(), &desc);
}

class UiRenderer {
public:
    void init() {
        shutdown();

        merged_primitive_data_.reserve(kInitialPrimitiveWordCapacity);
        merged_index_data_.reserve(kInitialIndexCapacity);
        primitive_upload_data_.reserve(kInitialPrimitiveWordCapacity);

        ui_font_init(ui_font_shared(), msdf_font_system_font(), 16);
        write_msdf_font(ui_font_shared()->font);
        reset_layers();

#ifdef UI_NATIVE
        create_uniform_buffer();
        create_icon_texture();
        create_sampler();

        std::string ui_shader_source = read_text_file(os_get_bundle_path(kUiShaderPath));
        shader_ = create_shader_module(ui_shader_source);

        create_pipeline();
        ensure_gpu_capacity(kInitialPrimitiveWordCapacity, kInitialIndexCapacity);
#endif
        initialized_ = true;
    }

    void shutdown() {
#ifdef UI_NATIVE
        release_gpu_resources();
#endif
        for (LayerStorage &layer : layers_) {
            layer.reset();
        }
        preserved_primitive_data_.clear();
        merged_primitive_data_.clear();
        merged_index_data_.clear();
        primitive_upload_data_.clear();
        last_primitive_offset_ = 0;
        last_index_offset_ = 0;
        window_size_ = {0.f, 0.f, 0.f, 0.f};
        initialized_ = false;
    }

    void set_size(u32 width, u32 height) {
        window_size_.x = (f32)width;
        window_size_.y = (f32)height;
    }

    u32 write_clip(u32 layer_index, ui_rect rect, u32 parent) {
        LayerStorage &layer = layer_for(layer_index);
        const u32 offset = layer.primitive_offset;
        ensure_words(layer.primitive_data, local_offset(layer, offset) + 4);

        if (parent != 0) {
            rect = ui_rect_intersect(rect, read_clip(layer_index, parent));
        }
        write_clip_words(layer, offset, rect);
        layer.primitive_offset += 4;
        return offset;
    }

    ui_rect read_clip(u32 layer_index, u32 clip) const {
        const LayerStorage &layer = layer_for(layer_index);
        ui_rect rect = {};
        const u32 offset = local_offset(layer, clip);
        if (offset + 4 > layer.primitive_data.size()) {
            return rect;
        }
        std::memcpy(&rect, layer.primitive_data.data() + offset, sizeof(rect));
        return rect;
    }

    void write_index(u32 layer_index, u32 index) {
        LayerStorage &layer = layer_for(layer_index);
        layer.index_data.push_back(index);
    }

    u32 write_rect_vertex(u32 layer_index, ui_rect_vertex vertex) {
        LayerStorage &layer = layer_for(layer_index);
        const u32 offset = layer.primitive_offset;
        ensure_words(layer.primitive_data, local_offset(layer, offset) + 8);
        write_rect_words(layer, offset, vertex);
        layer.primitive_offset += 8;
        return offset;
    }

    u32 write_triangle_vertex(u32 layer_index, ui_triangle_vertex vertex, bool advanced) {
        LayerStorage &layer = layer_for(layer_index);
        const u32 word_count = advanced ? 8u : 4u;
        const u32 offset = layer.primitive_offset;
        ensure_words(layer.primitive_data, local_offset(layer, offset) + word_count);
        write_triangle_words(layer, offset, vertex, advanced);
        layer.primitive_offset += word_count;
        return offset;
    }

    u32 write_glyph_header(u32 layer_index, ui_glyph_header header) {
        LayerStorage &layer = layer_for(layer_index);
        const u32 offset = layer.primitive_offset;
        ensure_words(layer.primitive_data, local_offset(layer, offset) + 4);
        write_glyph_header_words(layer, offset, header);
        layer.primitive_offset += 4;
        return offset;
    }

    u32 write_glyph_vertex(u32 layer_index, ui_glyph_vertex vertex) {
        LayerStorage &layer = layer_for(layer_index);
        const u32 offset = layer.primitive_offset;
        ensure_words(layer.primitive_data, local_offset(layer, offset) + 4);
        write_glyph_vertex_words(layer, offset, vertex);
        layer.primitive_offset += 4;
        return offset;
    }

    u32 get_primitive_offset(u32 layer_index) const {
        return layer_for(layer_index).primitive_offset;
    }

    void render() {
#ifdef UI_NATIVE
        merge_layers();
        if (last_index_offset_ == 0) {
            return;
        }

        script_t *ctx = script_shared();
        WGPURenderPassEncoder pass_encoder = webgpu_current_pass_encoder();
        if (ctx == NULL || pass_encoder == NULL) {
            return;
        }

        ensure_gpu_capacity(last_primitive_offset_, last_index_offset_);
        if (uniform_buffer_ == NULL || vertex_id_buffer_ == NULL || primitive_data_texture_ == NULL || binding_ == NULL) {
            return;
        }

        wgpuQueueWriteBuffer(webgpu_queue(), uniform_buffer_, 0, &window_size_, sizeof(float) * 4);
        wgpuQueueWriteBuffer(webgpu_queue(), vertex_id_buffer_, 0, merged_index_data_.data(), (size_t)last_index_offset_ * sizeof(u32));

        primitive_upload_data_.assign(primitive_capacity_words_, 0);
        std::copy(merged_primitive_data_.begin(), merged_primitive_data_.end(), primitive_upload_data_.begin());

        WGPUImageCopyTexture texture_dst = {};
        texture_dst.texture = primitive_data_texture_;

        WGPUTextureDataLayout layout = {};
        layout.bytesPerRow = primitive_texture_width_ * 4 * sizeof(f32);
        layout.rowsPerImage = primitive_texture_height_;

        WGPUExtent3D extent = {primitive_texture_width_, primitive_texture_height_, 1};
        wgpuQueueWriteTexture(
            webgpu_queue(),
            &texture_dst,
            primitive_upload_data_.data(),
            primitive_upload_data_.size() * sizeof(u32),
            &layout,
            &extent);

        wgpuRenderPassEncoderSetViewport(
            pass_encoder,
            0.0f,
            0.0f,
            (float)ctx->window->framebuffer_width,
            (float)ctx->window->framebuffer_height,
            0.0f,
            1.0f);
        wgpuRenderPassEncoderSetPipeline(pass_encoder, pipeline_);
        wgpuRenderPassEncoderSetBindGroup(pass_encoder, 0, binding_, 0, NULL);
        wgpuRenderPassEncoderSetVertexBuffer(pass_encoder, 0, vertex_id_buffer_, 0, WGPU_WHOLE_SIZE);
        wgpuRenderPassEncoderDraw(pass_encoder, last_index_offset_, 1, 0, 0);
#endif
    }

private:
    static u32 local_offset(const LayerStorage &layer, u32 absolute_offset) {
        return absolute_offset - layer.primitive_base;
    }

    static void ensure_words(std::vector<u32> &buffer, u32 required_words) {
        if (buffer.size() < required_words) {
            buffer.resize(required_words);
        }
    }

    static void write_float_word(u32 *destination, u32 index, f32 value) {
        std::memcpy(destination + index, &value, sizeof(value));
    }

    static void write_clip_words(LayerStorage &layer, u32 offset, const ui_rect &rect) {
        u32 *destination = layer.primitive_data.data() + local_offset(layer, offset);
        std::memcpy(destination, &rect, sizeof(rect));
    }

    static void write_rect_words(LayerStorage &layer, u32 offset, const ui_rect_vertex &vertex) {
        u32 *destination = layer.primitive_data.data() + local_offset(layer, offset);
        std::fill(destination, destination + 8, 0u);
        write_float_word(destination, 0, vertex.x);
        write_float_word(destination, 1, vertex.y);
        write_float_word(destination, 2, vertex.w);
        write_float_word(destination, 3, vertex.h);
        destination[4] = vertex.color;
        destination[5] = vertex.clip;
    }

    static void write_triangle_words(LayerStorage &layer, u32 offset, const ui_triangle_vertex &vertex, bool advanced) {
        u32 *destination = layer.primitive_data.data() + local_offset(layer, offset);
        const u32 word_count = advanced ? 8u : 4u;
        std::fill(destination, destination + word_count, 0u);
        write_float_word(destination, 0, vertex.x);
        write_float_word(destination, 1, vertex.y);
        destination[2] = vertex.color;
        destination[3] = vertex.clip;
        if (advanced) {
            write_float_word(destination, 4, vertex.u);
            write_float_word(destination, 5, vertex.v);
            destination[6] = vertex.type;
            write_float_word(destination, 7, vertex.offset);
        }
    }

    static void write_glyph_header_words(LayerStorage &layer, u32 offset, const ui_glyph_header &header) {
        u32 *destination = layer.primitive_data.data() + local_offset(layer, offset);
        write_float_word(destination, 0, header.x);
        write_float_word(destination, 1, header.y);
        destination[2] = header.font;
        write_float_word(destination, 3, header.clip);
    }

    static void write_glyph_vertex_words(LayerStorage &layer, u32 offset, const ui_glyph_vertex &vertex) {
        u32 *destination = layer.primitive_data.data() + local_offset(layer, offset);
        write_float_word(destination, 0, vertex.xoffset);
        destination[1] = vertex.glyph_index;
        destination[2] = vertex.color;
        write_float_word(destination, 3, vertex.scale);
    }

    LayerStorage &layer_for(u32 layer_index) {
        return layers_[layer_index];
    }

    const LayerStorage &layer_for(u32 layer_index) const {
        return layers_[layer_index];
    }

    void write_msdf_font(msdf_font *font) {
        const u32 offset = (u32)preserved_primitive_data_.size();
        const u32 gpu_font_id = gpu_font_id_++;
        const u32 glyph_stride = 8;
        const u32 font_stride = 8;
        const u32 primitive_end = offset + font_stride + MAX_GLYPH_COUNT * glyph_stride;

        ensure_words(preserved_primitive_data_, primitive_end);

        font->gpu_font_id = gpu_font_id;
        font->gpu_font_start = offset >> 2;

        f32 *font_start = reinterpret_cast<f32 *>(preserved_primitive_data_.data() + offset);
        font_start[0] = (f32)font->texture_width;
        font_start[1] = (f32)font->texture_height;
        preserved_primitive_data_[offset + 2] = gpu_font_id;

        ui_font_glyph_vertex vertex = {};
        ui_font_glyph_vertex *glyph_start = reinterpret_cast<ui_font_glyph_vertex *>(font_start + font_stride);
        for (int i = 0; i < MAX_GLYPH_COUNT; ++i) {
            msdf_glyph g = font->glyphs[i];
            vertex.x = (f32)g.x;
            vertex.y = (f32)g.y;
            vertex.w = (f32)g.width;
            vertex.h = (f32)g.height;
            vertex.xoffset = (f32)g.xoffset;
            vertex.yoffset = (f32)g.yoffset;
            glyph_start[i] = vertex;
            font->glyphs[i].gpu_index = i;
        }
    }

    void reset_layers() {
        for (u32 i = 0; i < MAX_UI_LAYERS; ++i) {
            LayerStorage &layer = layers_[i];
            layer.primitive_base = kLayerPrimitiveBase[i];
            layer.reset();
        }
        layers_[0].primitive_data = preserved_primitive_data_;
        layers_[0].primitive_offset = kLayerPrimitiveBase[0] + (u32)preserved_primitive_data_.size();
    }

    void merge_layers() {
        u32 primitive_size = 0;
        for (const LayerStorage &layer : layers_) {
            primitive_size = std::max(primitive_size, layer.primitive_base + (u32)layer.primitive_data.size());
        }

        merged_primitive_data_.assign(primitive_size, 0u);
        merged_index_data_.clear();

        for (u32 layer_index = 0; layer_index < MAX_UI_LAYERS; ++layer_index) {
            LayerStorage &layer = layers_[layer_index];
            if (!layer.primitive_data.empty()) {
                std::copy(layer.primitive_data.begin(), layer.primitive_data.end(), merged_primitive_data_.begin() + layer.primitive_base);
            }
            merged_index_data_.insert(merged_index_data_.end(), layer.index_data.begin(), layer.index_data.end());
        }

        last_primitive_offset_ = (u32)merged_primitive_data_.size();
        last_index_offset_ = (u32)merged_index_data_.size();
        reset_layers();
    }

#ifdef UI_NATIVE
    void create_uniform_buffer() {
        uniform_buffer_ = create_buffer("ui_uniforms", sizeof(float) * 4, WGPUBufferUsage_Uniform);
    }

    void create_icon_texture() {
        icon_texture_ = create_texture("ui_icon_texture", kIconTextureExtent, kIconTextureExtent, WGPUTextureFormat_RGBA8Unorm);
        icon_texture_view_ = create_texture_view(icon_texture_, WGPUTextureFormat_RGBA8Unorm);
    }

    void create_sampler() {
        WGPUSamplerDescriptor sampler_desc = {};
        sampler_desc.minFilter = WGPUFilterMode_Linear;
        sampler_desc.magFilter = WGPUFilterMode_Linear;
        sampler_desc.mipmapFilter = WGPUMipmapFilterMode_Linear;
        sampler_desc.addressModeU = WGPUAddressMode_ClampToEdge;
        sampler_desc.addressModeV = WGPUAddressMode_ClampToEdge;
        sampler_desc.addressModeW = WGPUAddressMode_ClampToEdge;
        sampler_desc.maxAnisotropy = 1;
        sampler_ = wgpuDeviceCreateSampler(webgpu_device(), &sampler_desc);
    }

    void create_pipeline() {
        WGPUVertexAttribute vertex_attribute = {};
        vertex_attribute.format = WGPUVertexFormat_Uint32;
        vertex_attribute.offset = 0;
        vertex_attribute.shaderLocation = 0;

        WGPUVertexBufferLayout vertex_buffer_layout = {};
        vertex_buffer_layout.arrayStride = sizeof(u32);
        vertex_buffer_layout.stepMode = WGPUVertexStepMode_Vertex;
        vertex_buffer_layout.attributeCount = 1;
        vertex_buffer_layout.attributes = &vertex_attribute;

        WGPUVertexState vertex_state = {};
        vertex_state.module = shader_;
        vertex_state.entryPoint = "vertex_main";
        vertex_state.bufferCount = 1;
        vertex_state.buffers = &vertex_buffer_layout;

        WGPUBlendState blend_state = {};
        blend_state.color.operation = WGPUBlendOperation_Add;
        blend_state.color.srcFactor = WGPUBlendFactor_SrcAlpha;
        blend_state.color.dstFactor = WGPUBlendFactor_OneMinusSrcAlpha;
        blend_state.alpha.operation = WGPUBlendOperation_Add;
        blend_state.alpha.srcFactor = WGPUBlendFactor_One;
        blend_state.alpha.dstFactor = WGPUBlendFactor_OneMinusSrcAlpha;

        WGPUColorTargetState color_target = {};
        color_target.format = webgpu_surface_format();
        color_target.blend = &blend_state;
        color_target.writeMask = WGPUColorWriteMask_All;

        WGPUFragmentState fragment_state = {};
        fragment_state.module = shader_;
        fragment_state.entryPoint = "fragment_main";
        fragment_state.targetCount = 1;
        fragment_state.targets = &color_target;

        WGPURenderPipelineDescriptor desc = {};
        desc.label = "ui_pipeline";
        desc.layout = NULL;
        desc.vertex = vertex_state;
        desc.primitive.topology = WGPUPrimitiveTopology_TriangleList;
        desc.primitive.stripIndexFormat = WGPUIndexFormat_Undefined;
        desc.primitive.frontFace = WGPUFrontFace_CCW;
        desc.primitive.cullMode = WGPUCullMode_None;
        desc.multisample.count = 1;
        desc.multisample.mask = 0xffffffffu;
        desc.fragment = &fragment_state;
        pipeline_ = wgpuDeviceCreateRenderPipeline(webgpu_device(), &desc);
    }

    void recreate_bind_group() {
        if (binding_ != NULL) {
            wgpuBindGroupRelease(binding_);
            binding_ = NULL;
        }
        if (pipeline_ == NULL || uniform_buffer_ == NULL || primitive_data_texture_view_ == NULL || icon_texture_view_ == NULL || sampler_ == NULL) {
            return;
        }

        WGPUBindGroupLayout bind_group_layout = wgpuRenderPipelineGetBindGroupLayout(pipeline_, 0);

        WGPUBindGroupEntry entries[5] = {};
        entries[0].binding = 0;
        entries[0].buffer = uniform_buffer_;
        entries[0].offset = 0;
        entries[0].size = sizeof(float) * 4;
        entries[1].binding = 1;
        entries[1].textureView = primitive_data_texture_view_;
        entries[2].binding = 2;
        entries[2].textureView = ui_font_shared()->font->texture_view;
        entries[3].binding = 3;
        entries[3].textureView = icon_texture_view_;
        entries[4].binding = 4;
        entries[4].sampler = sampler_;

        WGPUBindGroupDescriptor desc = {};
        desc.label = "ui_bind_group";
        desc.layout = bind_group_layout;
        desc.entryCount = 5;
        desc.entries = entries;
        binding_ = wgpuDeviceCreateBindGroup(webgpu_device(), &desc);

        wgpuBindGroupLayoutRelease(bind_group_layout);
    }

    void ensure_gpu_capacity(u32 primitive_words, u32 index_count) {
        ensure_primitive_texture_capacity(std::max(primitive_words, (u32)preserved_primitive_data_.size()));
        ensure_index_buffer_capacity(std::max(index_count, 1u));
    }

    void ensure_primitive_texture_capacity(u32 required_words) {
        if (required_words <= primitive_capacity_words_ && primitive_data_texture_ != NULL) {
            return;
        }

        u32 next_capacity = primitive_capacity_words_ == 0 ? kInitialPrimitiveWordCapacity : primitive_capacity_words_;
        while (next_capacity < required_words) {
            next_capacity *= 2;
        }

        const u32 texels = (next_capacity + 3) / 4;
        const u32 height = std::max(1u, (texels + kTextureWidth - 1) / kTextureWidth);

        if (primitive_data_texture_view_ != NULL) {
            wgpuTextureViewRelease(primitive_data_texture_view_);
            primitive_data_texture_view_ = NULL;
        }
        if (primitive_data_texture_ != NULL) {
            wgpuTextureRelease(primitive_data_texture_);
            primitive_data_texture_ = NULL;
        }

        primitive_texture_width_ = kTextureWidth;
        primitive_texture_height_ = height;
        primitive_capacity_words_ = primitive_texture_width_ * primitive_texture_height_ * 4;
        primitive_data_texture_ = create_texture("ui_primitive_texture", primitive_texture_width_, primitive_texture_height_, WGPUTextureFormat_RGBA32Float);
        primitive_data_texture_view_ = create_texture_view(primitive_data_texture_, WGPUTextureFormat_RGBA32Float);
        primitive_upload_data_.resize(primitive_capacity_words_);
        recreate_bind_group();
    }

    void ensure_index_buffer_capacity(u32 required_indices) {
        if (required_indices <= index_capacity_ && vertex_id_buffer_ != NULL) {
            return;
        }

        u32 next_capacity = index_capacity_ == 0 ? kInitialIndexCapacity : index_capacity_;
        while (next_capacity < required_indices) {
            next_capacity *= 2;
        }

        if (vertex_id_buffer_ != NULL) {
            wgpuBufferRelease(vertex_id_buffer_);
            vertex_id_buffer_ = NULL;
        }

        index_capacity_ = next_capacity;
        vertex_id_buffer_ = create_buffer("ui_vertex_ids", (u64)index_capacity_ * sizeof(u32), WGPUBufferUsage_Vertex);
    }

    void release_gpu_resources() {
        if (binding_ != NULL) wgpuBindGroupRelease(binding_);
        if (pipeline_ != NULL) wgpuRenderPipelineRelease(pipeline_);
        if (shader_ != NULL) wgpuShaderModuleRelease(shader_);
        if (sampler_ != NULL) wgpuSamplerRelease(sampler_);
        if (icon_texture_view_ != NULL) wgpuTextureViewRelease(icon_texture_view_);
        if (icon_texture_ != NULL) wgpuTextureRelease(icon_texture_);
        if (primitive_data_texture_view_ != NULL) wgpuTextureViewRelease(primitive_data_texture_view_);
        if (primitive_data_texture_ != NULL) wgpuTextureRelease(primitive_data_texture_);
        if (vertex_id_buffer_ != NULL) wgpuBufferRelease(vertex_id_buffer_);
        if (uniform_buffer_ != NULL) wgpuBufferRelease(uniform_buffer_);

        binding_ = NULL;
        pipeline_ = NULL;
        shader_ = NULL;
        sampler_ = NULL;
        icon_texture_view_ = NULL;
        icon_texture_ = NULL;
        primitive_data_texture_view_ = NULL;
        primitive_data_texture_ = NULL;
        vertex_id_buffer_ = NULL;
        uniform_buffer_ = NULL;
        primitive_texture_width_ = 0;
        primitive_texture_height_ = 0;
        primitive_capacity_words_ = 0;
        index_capacity_ = 0;
    }

    WGPUTexture primitive_data_texture_ = NULL;
    WGPUTextureView primitive_data_texture_view_ = NULL;
    WGPUBuffer vertex_id_buffer_ = NULL;
    WGPUBuffer uniform_buffer_ = NULL;
    WGPUTexture icon_texture_ = NULL;
    WGPUTextureView icon_texture_view_ = NULL;
    WGPUSampler sampler_ = NULL;
    WGPUBindGroup binding_ = NULL;
    WGPURenderPipeline pipeline_ = NULL;
    WGPUShaderModule shader_ = NULL;
    u32 primitive_texture_width_ = 0;
    u32 primitive_texture_height_ = 0;
    u32 primitive_capacity_words_ = 0;
    u32 index_capacity_ = 0;
#endif

    std::array<LayerStorage, MAX_UI_LAYERS> layers_;
    std::vector<u32> preserved_primitive_data_;
    std::vector<u32> merged_primitive_data_;
    std::vector<u32> merged_index_data_;
    std::vector<u32> primitive_upload_data_;
    float4 window_size_ = {0.f, 0.f, 0.f, 0.f};
    u32 last_primitive_offset_ = 0;
    u32 last_index_offset_ = 0;
    u32 gpu_font_id_ = 0;
    bool initialized_ = false;
};

UiRenderer &renderer() {
    static UiRenderer instance;
    return instance;
}

} // namespace

extern "C" {

void ui_renderer_init() {
    renderer().init();
}

void ui_renderer_free() {
    renderer().shutdown();
}

void ui_renderer_set_size(u32 width, u32 height) {
    renderer().set_size(width, height);
}

void ui_renderer_render() {
    renderer().render();
}

u32 ui_layer_write_clip(u32 layer_index, ui_rect rect, u32 parent) {
    return renderer().write_clip(layer_index, rect, parent);
}

ui_rect ui_layer_read_clip(u32 layer_index, u32 clip) {
    return renderer().read_clip(layer_index, clip);
}

void ui_layer_write_index(u32 layer_index, u32 index) {
    renderer().write_index(layer_index, index);
}

u32 ui_layer_write_rect_vertex(u32 layer_index, ui_rect_vertex vertex) {
    return renderer().write_rect_vertex(layer_index, vertex);
}

u32 ui_layer_write_triangle_vertex(u32 layer_index, ui_triangle_vertex vertex, bool advanced) {
    return renderer().write_triangle_vertex(layer_index, vertex, advanced);
}

u32 ui_layer_write_glyph_header(u32 layer_index, ui_glyph_header header) {
    return renderer().write_glyph_header(layer_index, header);
}

u32 ui_layer_write_glyph_vertex(u32 layer_index, ui_glyph_vertex vertex) {
    return renderer().write_glyph_vertex(layer_index, vertex);
}

u32 ui_layer_get_primitive_offset(int layer_index) {
    return renderer().get_primitive_offset((u32)layer_index);
}

}