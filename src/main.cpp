#include "graphics/graphics.h"

const int W = 512;
const int H = 512;

int main () {

	ofstream out("out.ppm");
	out << "P3\n" << W << ' ' << H << ' ' << "255\n";

	vec light_dir;
	vec_new(&light_dir, 0, 0.2, 0.8);

	vec origin;
	vec_new(&origin, 0, 0, -W);

	sphere s;
	vec s_pos;
	color c;
	vec_new(&s_pos, 0, 0, W);
	color_new(&c, 255, 0, 0);
	sphere_new(&s, s_pos, W / 2, c);

	color clear_color;
	color_new(&clear_color, 120, 130, 150);

	for (int y = 0; y < H; ++y) {
		for (int x = 0; x < W; ++x) {
			vec e, dir;
			vec_new(&e, (W / 2 - x), (H / 2 - y), 0);
			vec_sub(&dir, e, origin);

			ray r;
			ray_new(&r, origin, dir);

			color c;
			float t;
			if (sphere_intersect(s, r, &t)) {
				vec hit;
				vec_scale(&hit, r.dir, t);
				vec_add(&hit, r.pos, hit);
				vec n;
				sphere_normal(&n, s, hit);
				float p;
				p = vec_dot(n, light_dir);
				// vec_print(n);
				if (p > 0) {
					color_new(&c, 0, 0, 0);
				} else {
					color_new(&c, 255, 0, 0);
					color_scale(&c, c, sin(abs(p)));
				}

			} else {
				c = clear_color;
			}


			out << (int)c.r << ' '
				<< (int)c.g << ' '
				<< (int)c.b << '\n';
		}
	}

	return 0;
}
