#ifndef Common_H
#define Common_H

#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <float.h>
#include <assert.h>

#define true 1
#define false 0

void error(const char * msg);
float max(float a, float b);

#define Type_Sphere 0
#define Type_Plane 1
#define Type_Triangle 2

#endif
