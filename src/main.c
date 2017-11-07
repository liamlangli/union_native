#include "graphics/graphics.h"

const int W = 512;
const int H = 512;

int main () {

	FILE * out = fopen("out.ppm", "w");
	fprintf(out, "P3\n%d %d 255\n", W, H);

	// line init
	light lit;
	vec light_pos = {30, 30, 30};
	vec light_dir = {0, 0.2, 0.8};
	color light_color = {220, 250, 230};
	light_new(&lit, light_pos, light_color, 2, 0);

	// camera init
	vec origin = {0, 0, -1.0};

	//surface init;
	color sc = {120, 255, 130};
	surface sf = {sc, 10, 10, 100, 10};

	// obj init
	vec s_pos = {2.5, 0, 10};
	color c = {255, 0, 0};
	sphere s;
	sphere_new(&s, "s", s_pos, 2, sf);

	vec s1_pos = {-2.5, 0, 12};
	sphere s1;
	sphere_new(&s1, "s1", s1_pos, 2, sf);

	vec p_pos = {0, -2, 0};
	vec p_n = {0, 1, 0};
	plane pl;
	plane_new(&pl, "demo plane", p_pos, p_n, sf);

	// clear color
	color clear_color = {0, 0, 0};


	scene scne;
	scene_new(&scne, "main");
	array_push_back(&scne.things, &pl);
	array_push_back(&scne.things, &s);
	array_push_back(&scne.things, &s1);
	array_push_back(&scne.lights, &lit);
	printf("nitem:%d\n", scne.things.nItems);

	float ambient = 0.0f;

	// perspective viewing mode
	for (int y = 0; y < H; ++y) {
		// fprintf(stderr, "\rrender: %5.2f%%", 100.0 * W / y);
		for (int x = 0; x < W; ++x) {
			vec p, dir;
			vec_new(&p, (x - W / 2.0) / W, (H / 2.0 - y)/ H, 0);
			vec_sub(&dir, p, origin);

			ray r;
			ray_new(&r, origin, dir);

			color cl_out = {0, 0, 0};
			intersect isec = scene_intersect(scne, r);
			if (isec.t == FLT_MAX || isec.t < 0) {
				cl_out = clear_color;
			} else {
				vec hit_pos;
				vec_scale(&hit_pos, isec.r.dir, isec.t);
				int in_shadow = ray_test(hit_pos, lit, scne);
				if (in_shadow) {
					color_new(&cl_out, 0, 0, 0);
				} else {
					thing_shader(&cl_out, isec.thing, isec, scne.lights);
				}
			}
			// printf("distance: %5.2f\n", isec.t);
			fprintf(out, "%d %d %d ", cl_out.r, cl_out.g, cl_out.b);
		}
	}

	fclose(out);

	return 0;
}
