#include "graphics/graphics.h"

const int W = 512;
const int H = 512;

int main () {

	FILE * out = fopen("out.ppm", "w");
	fprintf(out, "P3\n%d %d 255\n", W, H);

	// light init
	light lit;
	vec light_pos = {30, 30, -30};
	vec light_dir = {0, 0.2, 0.8};
	color light_color = {200, 200, 200};
	light_new(&lit, light_pos, light_color, 20, 0);

	light lit1;
	vec light_pos1 = {30, 30, 30};
	color light_color1 = {150, 170, 200};
	light_new(&lit1, light_pos1, light_color1, 12, 0);

	// camera init
	vec origin = {0, 0, -1.0};

	//surface init;
	color c_diffuse = {140, 220, 150};
	color c_specular = {100, 100, 100};
	color plane_diffuse = {120, 120, 120};
	surface sf			= {c_diffuse, c_specular, 50, 1.4, 0.0, 0.3, 1.0};
	surface sf2 		= {c_diffuse, c_specular, 50, 1.0, 1.0, 0.0, 0.0};
	surface plane_sf 	= {plane_diffuse, c_specular, 50, 1.0, 1.0, 0.0, 0.0};

	// obj init
	vec s_pos = {-0.5, 2, 10};
	color c = {255, 0, 0};
	sphere s;
	sphere_new(&s, "s", s_pos, 2, sf);

	vec s1_pos = {6, 0, 30};
	sphere s1;
	sphere_new(&s1, "s1", s1_pos, 2, sf2);

	vec p_pos = {0, -2, 0};
	vec p_n = {0, 1, 0};
	plane pl;
	plane_new(&pl, "demo plane", p_pos, p_n, plane_sf);

	vec p2_pos = {0, 0, 300};
	vec p2_n = {0, 0, -1};
	vec_normal(&p2_n);
	plane pl2;
	plane_new(&pl2, "back plane", p2_pos, p2_n, plane_sf);

	// clear color
	color clear_color = {0, 0, 0};


	scene scne;
	scene_new(&scne, "main");
	array_push_back(&scne.things, &s);
	array_push_back(&scne.things, &s1);
	array_push_back(&scne.lights, &lit);
	array_push_back(&scne.lights, &lit1);
	array_push_back(&scne.things, &pl);
	// array_push_back(&scne.things, &pl2);

	float ambient = 0.0f;

	// perspective viewing mode
	for (int y = 0; y < H; ++y) {
		for (int x = 0; x < W; ++x) {
			// TODO generate ray
			vec p, dir;
			vec_new(&p, (x - W / 2.0) / W, (H / 2.0 - y)/ H, 0);
			vec_sub(&dir, p, origin);
			ray r;
			ray_new(&r, origin, dir);

			color cl_out = {0, 0, 0};
			ray_trace(&cl_out, r, scne, 4);
			fprintf(out, "%d %d %d ", cl_out.r, cl_out.g, cl_out.b);
		}
	}

	fclose(out);
	scene_free(&scne);

	return 0;
}
