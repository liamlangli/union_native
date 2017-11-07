Ray Tracing
==========

v0.0.1 Alpha

##### output
pic 01 simple sphere render
image missed, you `make run` the init commit to build that.

pic 02 reconstruct data structure and render two sphere
![](http://li-lang.oss-cn-shanghai.aliyuncs.com/scene.png)

pic 03 render real light and shadow
![](http://li-lang.oss-cn-shanghai.aliyuncs.com/out.png)


##### Basic Ray tracing algorithm
1. ray generation
2. ray intersection
3. shading
pseudocode:
```
for each pixel do:
        compute viewing ray
        find first object hit by ray and its surface normal n
        set pixel color to value compute from hit point, light, and n
```

```
Scene.trace(Ray ray, tMin, tMax) {
    surface, t = hit(ray, tMin, tMax);
    if surface is not null {
        point = ray.evaluate(t);
        normal = surface.getNormal(point);
        return surface.shade(ray, point, normal, light);
    } else
        return backgroundColor;
}

Surface.shade(ray, point, normal, light) {
    v = –normalize(ray.direction);
    l = normalize(light.pos – point);
    // compute shading
}
```
