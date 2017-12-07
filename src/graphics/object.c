#include "graphics.h"

const float epsilon = 0.0001f;

void surface_new(surface * s, color diffuse, color specular, float roughness, float refraction, float diffuse_factor, float reflect_factor, float refraction_factor) {
	s->diffuse = diffuse;
	s->specular = specular;
	s->roughness = roughness;
	s->refraction = refraction;
	s->diffuse_factor = diffuse_factor;
	s->reflect_factor = reflect_factor;
	s->refraction_factor = refraction_factor;
}

void surface_shader(color *c, surface s, vec hit, vec normal, vec reflect_dir, scene scne) {
	// L = k_d * I * max(0, dot(n, l))
	color in = {0, 0, 0};
	for(int l = 0; l < scne.lights.nItems; ++l) {
		light lit = *(light *)scne.lights.items[l];
		int in_shadow = ray_test(hit, lit, scne);
		if (in_shadow) {
			continue;
		} else {
			light_reduce(&in, hit, reflect_dir, normal, s, lit);
		}
	}
	color_add(c, *c, in);
}

void sphere_new(sphere * s, const char * name, vec pos, float radius, surface sf) {
	s->head.type = Type_Sphere;
	sprintf(s->head.name, "%s", name);
	s->pos = pos;
	s->radius = radius;
	s->head.sface = sf;
}

void sphere_normal(vec * normal, sphere s, vec pos) {
	vec_sub(normal, pos, s.pos);
	vec_normal(normal);
}

// assume ray = pos + t * dir
intersect sphere_intersect(sphere * s, ray r) {
	vec os;
	intersect oisec;
	vec_sub(&os, s->pos, r.pos);				// vec origin to sphere
	float om = vec_dot(os, r.dir);
	float dq = vec_dot(os, os) - om * om;   // distance quad
	float d = sqrt(dq);
	float radius = s->radius;
	if (d > radius) {
		oisec.t = FLT_MAX;
		return oisec;
	}

	float c = sqrt(radius * radius - d * d);
	float t0 = om - c;
	float t1 = om + c;
	oisec.t = t0 < t1 ? t0 : t1;
	oisec.r = r;
	oisec.thing = s;

	float distance = vec_distance(s->pos, r.pos);
	if (distance < radius) {
		oisec.t = t1;
	}

	return oisec;
}

void plane_new(plane * p, const char * name, vec pos, vec normal, surface sf) {
	p->head.type = Type_Plane;
	sprintf(p->head.name, "%s", name);
	p->pos = pos;
	p->normal = normal;
	p->head.sface = sf;
}

void plane_normal(vec * out, plane p, vec pos) {
	out->x = p.normal.x;
	out->y = p.normal.y;
	out->z = p.normal.z;
}

intersect plane_intersect(plane * p, ray r) {
	intersect i;
	vec ep;
	vec_sub(&ep, p->pos, r.pos);
	i.t = vec_dot(p->normal, ep) / vec_dot(p->normal, r.dir);
	i.thing = p;
	i.r = r;
	return i;
}

void triangle_new(triangle * t, const char * name, vec a, vec b, vec c, surface s) {
	t->head.type = Type_Triangle;
	sprintf(t->head.name, "%s", name);
	t->head.sface = s;
	t->a = a;
	t->b = b;
	t->c = c;

	vec ab;
	vec_sub(&ab, b, a);
	vec ac;
	vec_sub(&ac, c, a);
	vec_cross(&t->normal, ab, bc);
	vec_normal(&t->normal);
}

void triangle_normal(vec * out, triangle t, vec pos) {

}

intersect triangle_intersect(triangle * t, ray) {

}

void thing_normal(vec * normal, ThingHead * head, vec pos) {
	if (head->type == Type_Sphere) {
		sphere_normal(normal, *((sphere *)head), pos);
	} else if (head->type == Type_Plane) {
		plane_normal(normal, *((plane *)head), pos);
	} else {
		// TODO: other object type
	}
}

void thing_shader(color * c, intersect isec, scene scne, int depth) {

	if (depth <= 0) return;

	vec hit_ext;
	vec_scale(&hit_ext, isec.r.dir, isec.t);
	vec reflect_ext;
	vec_scale(&reflect_ext, isec.r.dir, isec.t - epsilon);
	vec refract_ext;
	vec_scale(&refract_ext, isec.r.dir, isec.t + epsilon);

	vec hit;
	vec_add(&hit, isec.r.pos, hit_ext);
	vec hit_reflect;
	vec_add(&hit_reflect, isec.r.pos, reflect_ext);
	vec hit_refract;
	vec_add(&hit_refract, isec.r.pos, refract_ext);

	vec n;				// hit point normal
	thing_normal(&n, isec.thing, hit);

	// shader process
	// color = natural + lambda_reflet * reflect + lambda_transmit * transmit
	// TODO set lambdas as surface attribute
	// lambda_reflet = 0.4
	// lambda_transmit = 0.3

	surface sface = ((ThingHead *)(isec.thing))->sface;

	// reflect ray
	vec dir_reflect;
	vec_reflect(&dir_reflect, isec.r.dir, n);
	ray ray_reflect = {hit_reflect, dir_reflect};

	// natural shader
	color natural_color = {0, 0, 0};
	surface_shader(&natural_color, sface, hit_reflect, n, dir_reflect, scne);
	color_scale(&natural_color, natural_color, sface.diffuse_factor);

	// reflect shader
	color reflect_color = {0, 0, 0};
	ray_trace(&reflect_color, ray_reflect, scne, depth - 1);
	color_scale(&reflect_color, reflect_color, sface.reflect_factor);

	// refraction shader
	color refraction_color = {0, 0, 0};
	vec dir_refraction;
	int isTransimit = vec_transmission(&dir_refraction, isec.r.dir, n, sface.refraction);
	ray ray_refract = {hit_refract, dir_refraction};
	if (isTransimit) {
		ray_trace(&refraction_color, ray_refract, scne, depth - 1);
		color_scale(&refraction_color, refraction_color, sface.refraction_factor);
	}

	color_add(&reflect_color, reflect_color, refraction_color);
	color_add(c, natural_color, reflect_color);
}
