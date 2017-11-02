#include "graphics/graphics.h"

const int W = 512;
const int H = 512;

int main () {

	FILE * out = fopen("out.ppm", "w");
	fprintf(out, "P3\n%d %d 255\n", W, H);

	// line init
	light lit;
	// vec light_dir;
	// vec_new(&light_dir, 0, 0.2, 0.8);
	vec light_pos = {30, 30, 1};
	vec light_dir = {0, 0.2, 0.8};
	color light_color = {255, 255, 255};
	light_new(&lit, light_pos, light_color, 0);

	// camera init
	vec origin = {0, 0, -1.0};

	// obj init
	vec s_pos = {2.5, 0, 10};
	color c = {255, 0, 0};
	sphere s;
	sphere_new(&s, "s", s_pos, 2, c);

	vec s1_pos = {-2.5, 0, 12};
	sphere s1;
	sphere_new(&s1, "s1", s1_pos, 2, c);

	color clear_color = {120, 130, 150};


	scene scne;
	scene_new(&scne, "main");
	array_push_back(&scne.things, &s);
	array_push_back(&scne.things, &s1);
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

			color cl_out;
			intersect isec = scene_intersect(scne, r);
			if (isec.t == FLT_MAX) {
				cl_out = clear_color;
			} else {
				color c = {120, 250, 130};
				vec pos;
				vec_scale(&pos, isec.r.dir, isec.t);
				vec n;
				thing_normal(&n, (ThingHead *)isec.thing, pos);
				vec ldir;
				vec_sub(&ldir, lit.pos, pos);
				vec_normal(&ldir);

				// vec sight;
				// vec_scale(&sight, isec.r.dir, -1);
				printf("intensity:%5.2f\n", vec_dot(n, ldir));
				float i = max(0, vec_dot(n, ldir));
				color cl, ca;
				color_scale(&cl, c, i);   		// light
				color_scale(&ca, c, ambient);	// ambient
				color_add(&cl_out, cl, ca);
			}
			fprintf(out, "%d %d %d\n", cl_out.r, cl_out.g, cl_out.b);
		}
	}

	fclose(out);

	return 0;
}
