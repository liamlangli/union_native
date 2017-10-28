Ray Tracing
==========

v0.0.1 Alpha

##### output
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
