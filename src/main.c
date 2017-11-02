#include "graphics/graphics.h"

const int W = 512;
const int H = 512;

int main () {

	FILE * out = fopen("out.ppm", "w");
	fprintf(out, "P3\n%d %d 255\n", W, H);

	// line init
	light l;
	// vec light_dir;
	// vec_new(&light_dir, 0, 0.2, 0.8);
	vec light_pos = {100, 100, 100};
	vec light_dir = {0, 0.2, 0.8};
	color light_color = {255, 255, 255};
	light_new(&l, light_pos, light_color, 0);

	// camera init
	vec origin = {0, 0, -W};

	// obj init
	vec s_pos = {0, 0, W};
	color c = {255, 0, 0};
	sphere s;
	sphere_new(&s, "s", s_pos, W / 2, c);

	vec s1_pos = {0, -10, W};
	sphere s1;
	sphere_new(&s1, "s1", s1_pos, W / 2, c);

	color clear_color = {120, 130, 150};


	scene scne;
	scene_new(&scne, "main");
	array_push_back(&scne.things, &s);
	array_push_back(&scne.things, &s1);
	printf("nitem:%d\n", scne.things.nItems);

	// perspective viewing mode
	for (int y = 0; y < H; ++y) {
		// fprintf(stderr, "\rrender: %5.2f%%", 100.0 * W / y);
		for (int x = 0; x < W; ++x) {
			vec e, dir;
			vec_new(&e, (W / 2 - x), (H / 2 - y), 0);
			vec_sub(&dir, e, origin);

			ray r;
			ray_new(&r, origin, dir);

			color c;
			intersect isec = scene_intersect(scne, r);
			if (isec.t == FLT_MAX) {
				c = clear_color;
			} else {
				color_new(&c, 255, 0, 0);
			}
			fprintf(out, "%d %d %d\n", c.r, c.g, c.b);
		}
	}

	fclose(out);

	return 0;
}
