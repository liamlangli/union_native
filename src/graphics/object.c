#include "graphics.h"

void surface_new(surface * s, color c, color diffuse, color specular,float roughness, float refaction_factor) {
	s->c = c;
	s->diffuse = diffuse;
	s->specular = specular;
	s->roughness = roughness;
	s->refaction_factor = refaction_factor;
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

			vec hit_to_light;
			vec_sub(&hit_to_light, lit.pos, hit);
			vec_normal(&hit_to_light);

			light_reduce(&in, hit_to_light, reflect_dir, normal, s, lit);
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
	vec ex_dir;
	vec_scale(&ex_dir, isec.r.dir, isec.t);

	vec hit;
	vec_add(&hit, isec.r.pos, ex_dir);

	vec n;				// hit point normal
	thing_normal(&n, isec.thing, hit);

	vec rd;				// ray reflect direction
	vec_reflect(&rd, isec.r.dir, n);
	ray ray_reflect = {hit, rd};

	// TODO natural shader
	color natural_color = {0, 0, 0};

	surface_shader(&natural_color, ((ThingHead *)(isec.thing))->sface, hit, n, rd, scne);

	color reflect_color = {0, 0, 0};
	if(depth > 0 ) {
		// TODO reflect shader;
		ray_trace(&reflect_color, ray_reflect, scne, depth - 1);
	}

	color_scale(&reflect_color, reflect_color, 0.4);
	color_add(c, natural_color, reflect_color);
}
