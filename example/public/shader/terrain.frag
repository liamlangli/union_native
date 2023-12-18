in vec2 spherical;

#define DEBUG

#ifdef DEBUG
    flat in vec4 color;
#endif 

out vec4 frag_data;

void main() {
    #ifdef DEBUG
    frag_data = vec4(sqrt(color.xyz), 1.0);
    #else
    frag_data = vec4(spherical, 0.0, 1.0);
    #endif
}