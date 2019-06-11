#ifndef _glm_
#define _glm_

/**
 * https://github.com/recp/cglm
 * MIT LICENSE
 **/

#include "global.h"
#include <math.h>
#include <float.h>

typedef f32 vec2[2];
typedef f32 vec3[3];
typedef vec3 spherical;
typedef f32 vec4[4];
typedef vec4 quaternion;
typedef vec3 mat3[3];
typedef vec4 mat4[4];

#define GLM_VERSION_MAJOR 0
#define GLM_VERSION_MINOR 3

#define GLM_MIN(X, Y) (((X) < (Y)) ? (X) : (Y))
#define GLM_MAX(X, Y) (((X) > (Y)) ? (X) : (Y))

#define GLM_E 2.71828182845904523536028747135266250        /* e           */
#define GLM_LOG2E 1.44269504088896340735992468100189214    /* log2(e)     */
#define GLM_LOG10E 0.434294481903251827651128918916605082  /* log10(e)    */
#define GLM_LN2 0.693147180559945309417232121458176568     /* loge(2)     */
#define GLM_LN10 2.30258509299404568401799145468436421     /* loge(10)    */
#define GLM_PI 3.14159265358979323846264338327950288       /* pi          */
#define GLM_PI_2 1.57079632679489661923132169163975144     /* pi/2        */
#define GLM_PI_4 0.785398163397448309615660845819875721    /* pi/4        */
#define GLM_1_PI 0.318309886183790671537767526745028724    /* 1/pi        */
#define GLM_2_PI 0.636619772367581343075535053490057448    /* 2/pi        */
#define GLM_2_SQRTPI 1.12837916709551257389615890312154517 /* 2/sqrt(pi)  */
#define GLM_SQRT2 1.41421356237309504880168872420969808    /* sqrt(2)     */
#define GLM_SQRT1_2 0.707106781186547524400844362104849039 /* 1/sqrt(2)   */

#define GLM_Ef ((f32)GLM_E)
#define GLM_LOG2Ef ((f32)GLM_LOG2E)
#define GLM_LOG10Ef ((f32)GLM_LOG10E)
#define GLM_LN2f ((f32)GLM_LN2)
#define GLM_LN10f ((f32)GLM_LN10)
#define GLM_PIf ((f32)GLM_PI)
#define GLM_PI_2f ((f32)GLM_PI_2)
#define GLM_PI_4f ((f32)GLM_PI_4)
#define GLM_1_PIf ((f32)GLM_1_PI)
#define GLM_2_PIf ((f32)GLM_2_PI)
#define GLM_2_SQRTPIf ((f32)GLM_2_SQRTPI)
#define GLM_SQRT2f ((f32)GLM_SQRT2)
#define GLM_SQRT1_2f ((f32)GLM_SQRT1_2)

FORCE_INLINE i32 glm_sign(i32 val)
{
  return ((val >> 31) - (-val >> 31));
}

FORCE_INLINE f32 glm_signf(f32 val)
{
  return (f32)((val > 0.0f) - (val < 0.0f));
}

FORCE_INLINE f32 glm_min(f32 a, f32 b)
{
  if (a < b)
    return a;
  return b;
}

FORCE_INLINE f32 glm_max(f32 a, f32 b)
{
  if (a > b)
    return a;
  return b;
}

FORCE_INLINE f32 glm_pow2(f32 x)
{
  return x * x;
}

FORCE_INLINE f32 glm_rad(f32 deg)
{
  return deg * GLM_PIf / 180.0f;
}

FORCE_INLINE f32 glm_deg(f32 rad)
{
  return rad * 180.0f / GLM_PIf;
}

FORCE_INLINE f32 glm_clamp(f32 val, f32 minVal, f32 maxVal)
{
  return glm_min(glm_max(val, minVal), maxVal);
}

FORCE_INLINE f32 glm_clamp_zo(f32 val)
{
  return glm_clamp(val, 0.0f, 1.0f);
}

FORCE_INLINE f32 glm_lerp(f32 from, f32 to, f32 t)
{
  return from + glm_clamp_zo(t) * (to - from);
}

FORCE_INLINE bool glm_eq(f32 a, f32 b)
{
  return fabsf(a - b) <= FLT_EPSILON;
}

/**
 * vec2
 **/
FORCE_INLINE void glm_vec2_set(vec2 dst, f32 x, f32 y)
{
  dst[0] = x;
  dst[1] = y;
}

FORCE_INLINE void glm_vec2_copy(vec2 dst, vec2 src)
{
  dst[0] = src[0];
  dst[1] = src[1];
}

FORCE_INLINE void glm_vec2_add(vec2 dst, vec2 a, vec2 b)
{
  dst[0] = a[0] + b[0];
  dst[1] = a[1] + b[1];
}

FORCE_INLINE void glm_vec2_sub(vec2 dst, vec2 a, vec2 b)
{
  dst[0] = a[0] - b[0];
  dst[1] = a[1] - b[1];
}

FORCE_INLINE void glm_vec2_div(vec2 dst, vec2 a, vec2 b)
{
  dst[0] = a[0] / b[0];
  dst[1] = a[1] / b[1];
}

FORCE_INLINE void glm_vec2_mul(vec2 dst, vec2 a, vec2 b)
{
  dst[0] = a[0] * b[0];
  dst[1] = a[1] * b[1];
}

FORCE_INLINE void glm_vec2_mul_f(vec2 dst, vec2 src, f32 factor)
{
  src[0] = dst[0] * factor;
  src[1] = dst[1] * factor;
}

FORCE_INLINE void glm_vec2_rotate(vec2 dst, vec2 src, f32 radians)
{
  f32 x = src[0];
  f32 y = src[1];
  f32 c = cosf(radians);
  f32 s = sinf(radians);
  dst[0] = x * c - y * s;
  dst[1] = x * s + y * c;
}

FORCE_INLINE f32 glm_vec2_length(vec2 src)
{
  return sqrtf(src[0] * src[0] + src[1] * src[1]);
}

FORCE_INLINE void glm_vec2_dump(vec2 dst)
{
  fprintf(stdout, "vec2<%.2f %.2f>\n", dst[0], dst[1]);
}

FORCE_INLINE bool glm_vec2_contains(vec2 center, vec2 size, vec2 p)
{
  vec2 v;
  glm_vec2_sub(v, p, center);
  glm_vec2_mul_f(v, v, 2.0f);
  return v[0] > -size[0] && v[0] < size[0] && v[1] > -size[1] && v[1] < size[1];
}

FORCE_INLINE bool glm_vec2_contains_circle(vec2 center, f32 radius, vec2 p)
{
  vec2 v;
  glm_vec2_sub(v, p, center);
  return glm_vec2_length(v) < (radius * 0.5f);
}

/**
 * spherical
 * <radius, polar, azim>
 **/
FORCE_INLINE void glm_spherical_set(spherical s, f32 radius, f32 polar, f32 azim)
{
  s[0] = radius;
  s[1] = polar;
  s[2] = azim;
}

FORCE_INLINE void glm_spherical_copy(spherical dst, spherical src)
{
  dst[0] = src[0];
  dst[1] = src[1];
  dst[2] = src[2];
}

/**
 * vec3 math
 **/
FORCE_INLINE void glm_vec3_dump(vec3 src)
{
  fprintf(stdout, "vec3<x:%.2f %.2f %.2f>\n", src[0], src[1], src[2]);
}

FORCE_INLINE void glm_vec3_set(vec3 dst, f32 x, f32 y, f32 z)
{
  dst[0] = x;
  dst[1] = y;
  dst[2] = z;
}

FORCE_INLINE void glm_vec3_copy(vec3 dst, vec3 src)
{
  dst[0] = src[0];
  dst[1] = src[1];
  dst[2] = src[2];
}

FORCE_INLINE void glm_vec3_zero(vec3 v)
{
  v[0] = v[1] = v[2] = 0.0f;
}

FORCE_INLINE void glm_vec3_one(vec3 v)
{
  v[0] = v[1] = v[2] = 1.0f;
}

FORCE_INLINE f32 glm_vec3_dot(vec3 a, vec3 b)
{
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

FORCE_INLINE f32 glm_vec3_mag(vec3 v)
{
  return glm_vec3_dot(v, v);
}

FORCE_INLINE f32 glm_vec3_length(vec3 v)
{
  return sqrtf(glm_vec3_mag(v));
}

FORCE_INLINE void glm_vec3_add(vec3 dst, vec3 a, vec3 b)
{
  dst[0] = a[0] + b[0];
  dst[1] = a[1] + b[1];
  dst[2] = a[2] + b[2];
}

FORCE_INLINE void glm_vec3_add_f(vec3 dst, vec3 v, f32 s)
{
  dst[0] = v[0] + s;
  dst[1] = v[1] + s;
  dst[2] = v[2] + s;
}

FORCE_INLINE void glm_vec3_sub(vec3 dst, vec3 a, vec3 b)
{
  dst[0] = a[0] - b[0];
  dst[1] = a[1] - b[1];
  dst[2] = a[2] - b[2];
}

FORCE_INLINE void glm_vec3_sub_f(vec3 dst, vec3 v, f32 s)
{
  dst[0] = v[0] - s;
  dst[1] = v[1] - s;
  dst[2] = v[2] - s;
}

FORCE_INLINE void glm_vec3_mul(vec3 dst, vec3 a, vec3 b)
{
  dst[0] = a[0] * b[0];
  dst[1] = a[1] * b[1];
  dst[2] = a[2] * b[2];
}

FORCE_INLINE void glm_vec3_mul_f(vec3 dst, vec3 v, f32 s)
{
  dst[0] = v[0] * s;
  dst[1] = v[1] * s;
  dst[2] = v[2] * s;
}

FORCE_INLINE void glm_vec3_normalize_to(vec3 dst, vec3 v)
{
  f32 l = glm_vec3_length(v);
  if (l == 0.0f)
  {
    glm_vec3_set(dst, 0.0f, 0.0f, 0.0f);
    return;
  }
  glm_vec3_mul_f(dst, v, 1.0f / l);
}

FORCE_INLINE void glm_vec3_normalize(vec3 dst)
{
  glm_vec3_normalize_to(dst, dst);
}

FORCE_INLINE void glm_vec3_cross(vec3 dst, vec3 a, vec3 b)
{
  /* (u2.v3 - u3.v2, u3.v1 - u1.v3, u1.v2 - u2.v1) */
  dst[0] = a[1] * b[2] - a[2] * b[1];
  dst[1] = a[2] * b[0] - a[0] * b[2];
  dst[2] = a[0] * b[1] - a[1] * b[0];
}

FORCE_INLINE f32 glm_vec3_distance(vec3 a, vec3 b)
{
  return sqrtf(glm_pow2(b[0] - a[0] + glm_pow2(b[1] - a[1]) + glm_pow2(b[2] - a[2])));
}

FORCE_INLINE void glm_vec3_clamp(vec3 dst, f32 minVal, f32 maxVal)
{
  dst[0] = glm_clamp(dst[0], minVal, maxVal);
  dst[1] = glm_clamp(dst[1], minVal, maxVal);
  dst[2] = glm_clamp(dst[2], minVal, maxVal);
}

FORCE_INLINE void glm_vec3_from_spherical(vec3 dst, spherical src)
{
  f32 sinRadius = sinf(src[1]) * src[0];
  dst[0] = sinRadius * sinf(src[2]);
  dst[1] = cosf(src[1]) * src[0];
  dst[2] = sinRadius * cosf(src[2]);
}

FORCE_INLINE void glm_spherical_from_vec3(spherical dst, vec3 src)
{
  f32 radius = glm_vec3_length(src);
  if (radius == 0.0f) {
    glm_spherical_set(dst, 0.0f, 0.0f, 0.0f);
  } else {
    dst[0] = radius;
    dst[1] = acosf(glm_clamp(src[1] / radius, -1.0f, 1.0f));
    dst[2] = atan2f(src[0], src[2]);
  }
}

/**
 * vec4
 **/
FORCE_INLINE void glm_vec4_copy(vec4 dst, vec4 src)
{
  dst[0] = src[0];
  dst[1] = src[1];
  dst[2] = src[2];
  dst[3] = src[3];
}

FORCE_INLINE void glm_vec4_set(vec4 dst, f32 x, f32 y, f32 z, f32 w)
{
  dst[0] = x;
  dst[1] = y;
  dst[2] = z;
  dst[3] = w;
}

FORCE_INLINE void glm_vec4_dump(vec4 src)
{
  fprintf(stdout, "vec4<x:%.2f, y:%.2f, z:%.2f, w:%.2f>\n", src[0], src[1], src[2], src[3]);
}

/**
 * quaternion
 **/
FORCE_INLINE void glm_quaternion_copy(vec4 dst, vec4 src)
{
  glm_vec4_copy(dst, src);
}

FORCE_INLINE void glm_quaternion_set(vec4 dst, f32 x, f32 y, f32 z, f32 w)
{
  glm_vec4_set(dst, x, y, z, w);
}

FORCE_INLINE void glm_quaternion_from_mat4(quaternion dst, mat4 matrix)
{
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
  // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

  f32 m11 = matrix[0][0], m12 = matrix[1][0], m13 = matrix[2][0];
  f32 m21 = matrix[0][1], m22 = matrix[1][1], m23 = matrix[2][1];
  f32 m31 = matrix[0][2], m32 = matrix[1][2], m33 = matrix[2][2];
  f32 trace = m11 + m22 + m33;
  f32 s;

  if (trace > 0.0f)
  {
    s = 0.5f / sqrtf(trace + 1.0f);
    dst[3] = 0.25f / s;
    dst[0] = (m32 - m23) * s;
    dst[1] = (m13 - m31) * s;
    dst[2] = (m21 - m12) * s;
  }
  else if (m11 > m22 && m11 > m33)
  {
    s = 2.0f * sqrtf(1.0f + m11 - m22 - m33);
    dst[3] = (m32 - m23) / s;
    dst[0] = 0.25f * s;
    dst[1] = (m12 + m21) / s;
    dst[2] = (m13 + m31) / s;
  }
  else if (m22 > m33)
  {
    s = 2.0f * sqrtf(1.0f + m22 - m11 - m33);
    dst[3] = (m13 - m31) / s;
    dst[0] = (m12 + m21) / s;
    dst[1] = 0.25f * s;
    dst[2] = (m23 + m32) / s;
  }
  else
  {
    s = 2.0f * sqrtf(1.0f + m33 - m11 - m22);
    dst[3] = (m21 - m12) / s;
    dst[0] = (m13 + m31) / s;
    dst[1] = (m23 + m32) / s;
    dst[2] = 0.25f * s;
  }
}

/**
 * mat4
 **/
FORCE_INLINE void glm_mat4_copy(mat4 dst, mat4 src)
{
  dst[0][0] = src[0][0];
  dst[1][0] = src[1][0];
  dst[0][1] = src[0][1];
  dst[1][1] = src[1][1];
  dst[0][2] = src[0][2];
  dst[1][2] = src[1][2];
  dst[0][3] = src[0][3];
  dst[1][3] = src[1][3];

  dst[2][0] = src[2][0];
  dst[3][0] = src[3][0];
  dst[2][1] = src[2][1];
  dst[3][1] = src[3][1];
  dst[2][2] = src[2][2];
  dst[3][2] = src[3][2];
  dst[2][3] = src[2][3];
  dst[3][3] = src[3][3];
}

FORCE_INLINE void glm_mat4_dump(mat4 m)
{
  fprintf(stdout, "mat4<\n");
  fprintf(stdout, " [%.2f %.2f %.2f %.2f]\n", m[0][0], m[1][0], m[2][0], m[3][0]);
  fprintf(stdout, " [%.2f %.2f %.2f %.2f]\n", m[0][1], m[1][1], m[2][1], m[3][1]);
  fprintf(stdout, " [%.2f %.2f %.2f %.2f]\n", m[0][2], m[1][2], m[2][2], m[3][2]);
  fprintf(stdout, " [%.2f %.2f %.2f %.2f]\n", m[0][3], m[1][3], m[2][3], m[3][3]);
  fprintf(stdout, ">\n");
}

FORCE_INLINE void glm_mat4_identity(mat4 dst)
{
  mat4 t = {{1.0f, 0.0f, 0.0f, 0.0f}, {0.0f, 1.0f, 0.0f, 0.0f}, {0.0f, 0.0f, 1.0f, 0.0f}, {0.0f, 0.0f, 0.0f, 1.0f}};
  glm_mat4_copy(dst, t);
}

FORCE_INLINE void glm_mat4_mulv(vec4 dst, mat4 m, vec4 v)
{
  vec4 res;
  res[0] = m[0][0] * v[0] + m[1][0] * v[1] + m[2][0] * v[2] + m[3][0] * v[3];
  res[1] = m[0][1] * v[0] + m[1][1] * v[1] + m[2][1] * v[2] + m[3][1] * v[3];
  res[2] = m[0][2] * v[0] + m[1][2] * v[1] + m[2][2] * v[2] + m[3][2] * v[3];
  res[3] = m[0][3] * v[0] + m[1][3] * v[1] + m[2][3] * v[2] + m[3][3] * v[3];
  glm_vec4_copy(dst, res);
}

FORCE_INLINE void glm_mat4_transpose_to(mat4 dst, mat4 m)
{
  dst[0][0] = m[0][0];
  dst[1][0] = m[0][1];
  dst[0][1] = m[1][0];
  dst[1][1] = m[1][1];
  dst[0][2] = m[2][0];
  dst[1][2] = m[2][1];
  dst[0][3] = m[3][0];
  dst[1][3] = m[3][1];
  dst[2][0] = m[0][2];
  dst[3][0] = m[0][3];
  dst[2][1] = m[1][2];
  dst[3][1] = m[1][3];
  dst[2][2] = m[2][2];
  dst[3][2] = m[2][3];
  dst[2][3] = m[3][2];
  dst[3][3] = m[3][3];
}

FORCE_INLINE void glm_mat4_scale_p(mat4 dst, f32 s)
{
  dst[0][0] *= s;
  dst[0][1] *= s;
  dst[0][2] *= s;
  dst[0][3] *= s;
  dst[1][0] *= s;
  dst[1][1] *= s;
  dst[1][2] *= s;
  dst[1][3] *= s;
  dst[2][0] *= s;
  dst[2][1] *= s;
  dst[2][2] *= s;
  dst[2][3] *= s;
  dst[3][0] *= s;
  dst[3][1] *= s;
  dst[3][2] *= s;
  dst[3][3] *= s;
}

FORCE_INLINE void glm_mat4_scale(mat4 dst, vec3 s)
{
  f32 x = s[0], y = s[1], z = s[2];
  dst[0][0] *= x;
}

FORCE_INLINE void glm_mat4_position(mat4 dst, vec3 position)
{
  dst[3][0] = position[0];
  dst[3][1] = position[1];
  dst[3][2] = position[2];
}

FORCE_INLINE void glm_mat4_mul(mat4 dst, mat4 m1, mat4 m2)
{
  f32 a00 = m1[0][0], a01 = m1[0][1], a02 = m1[0][2], a03 = m1[0][3],
      a10 = m1[1][0], a11 = m1[1][1], a12 = m1[1][2], a13 = m1[1][3],
      a20 = m1[2][0], a21 = m1[2][1], a22 = m1[2][2], a23 = m1[2][3],
      a30 = m1[3][0], a31 = m1[3][1], a32 = m1[3][2], a33 = m1[3][3],

      b00 = m2[0][0], b01 = m2[0][1], b02 = m2[0][2], b03 = m2[0][3],
      b10 = m2[1][0], b11 = m2[1][1], b12 = m2[1][2], b13 = m2[1][3],
      b20 = m2[2][0], b21 = m2[2][1], b22 = m2[2][2], b23 = m2[2][3],
      b30 = m2[3][0], b31 = m2[3][1], b32 = m2[3][2], b33 = m2[3][3];

  dst[0][0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  dst[0][1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  dst[0][2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  dst[0][3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
  dst[1][0] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  dst[1][1] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  dst[1][2] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  dst[1][3] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
  dst[2][0] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  dst[2][1] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  dst[2][2] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  dst[2][3] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
  dst[3][0] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  dst[3][1] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  dst[3][2] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  dst[3][3] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
}

FORCE_INLINE void glm_mat4_inv(mat4 dst, mat4 mat)
{
  f32 t[6];
  f32 det;
  f32 a = mat[0][0], b = mat[0][1], c = mat[0][2], d = mat[0][3],
      e = mat[1][0], f = mat[1][1], g = mat[1][2], h = mat[1][3],
      i = mat[2][0], j = mat[2][1], k = mat[2][2], l = mat[2][3],
      m = mat[3][0], n = mat[3][1], o = mat[3][2], p = mat[3][3];

  t[0] = k * p - o * l;
  t[1] = j * p - n * l;
  t[2] = j * o - n * k;
  t[3] = i * p - m * l;
  t[4] = i * o - m * k;
  t[5] = i * n - m * j;

  dst[0][0] = f * t[0] - g * t[1] + h * t[2];
  dst[1][0] = -(e * t[0] - g * t[3] + h * t[4]);
  dst[2][0] = e * t[1] - f * t[3] + h * t[5];
  dst[3][0] = -(e * t[2] - f * t[4] + g * t[5]);

  dst[0][1] = -(b * t[0] - c * t[1] + d * t[2]);
  dst[1][1] = a * t[0] - c * t[3] + d * t[4];
  dst[2][1] = -(a * t[1] - b * t[3] + d * t[5]);
  dst[3][1] = a * t[2] - b * t[4] + c * t[5];

  t[0] = g * p - o * h;
  t[1] = f * p - n * h;
  t[2] = f * o - n * g;
  t[3] = e * p - m * h;
  t[4] = e * o - m * g;
  t[5] = e * n - m * f;

  dst[0][2] = b * t[0] - c * t[1] + d * t[2];
  dst[1][2] = -(a * t[0] - c * t[3] + d * t[4]);
  dst[2][2] = a * t[1] - b * t[3] + d * t[5];
  dst[3][2] = -(a * t[2] - b * t[4] + c * t[5]);

  t[0] = g * l - k * h;
  t[1] = f * l - j * h;
  t[2] = f * k - j * g;
  t[3] = e * l - i * h;
  t[4] = e * k - i * g;
  t[5] = e * j - i * f;

  dst[0][3] = -(b * t[0] - c * t[1] + d * t[2]);
  dst[1][3] = a * t[0] - c * t[3] + d * t[4];
  dst[2][3] = -(a * t[1] - b * t[3] + d * t[5]);
  dst[3][3] = a * t[2] - b * t[4] + c * t[5];

  det = 1.0f / (a * dst[0][0] + b * dst[1][0] + c * dst[2][0] + d * dst[3][0]);

  glm_mat4_scale_p(dst, det);
}

FORCE_INLINE void glm_mat4_from_quaternion(mat4 dst, quaternion q)
{
  f32 x = q[0], y = q[1], z = q[2], w = q[3];
  f32 x2 = x + x, y2 = y + y, z2 = z + z;
  f32 xx = x * x2, xy = x * y2, xz = x * z2;
  f32 yy = y * y2, yz = y * z2, zz = z * z2;
  f32 wx = w * x2, wy = w * y2, wz = w * z2;

  dst[0][0] = 1.0f - (yy + zz);
  dst[1][0] = xy - wz;
  dst[2][0] = xz + wy;

  dst[0][1] = xy + wz;
  dst[1][1] = 1.0f - (xx + zz);
  dst[2][1] = yz - wx;

  dst[0][2] = xz - wy;
  dst[1][2] = yz + wx;
  dst[2][2] = 1.0f - (xx + yy);

  // last column
  dst[0][3] = 0.0f;
  dst[1][3] = 0.0f;
  dst[2][3] = 0.0f;

  // bottom row
  dst[3][0] = 0.0f;
  dst[3][1] = 0.0f;
  dst[3][2] = 0.0f;
  dst[3][3] = 1.0f;
}

FORCE_INLINE void glm_mat4_compose(mat4 dst, vec3 position, vec3 scale, quaternion rotation)
{
  glm_mat4_from_quaternion(dst, rotation);
  glm_mat4_position(dst, position);
  glm_mat4_scale(dst, scale);
}

FORCE_INLINE void glm_mat4_perspective(mat4 dst, f32 fov, f32 aspect, f32 near, f32 far)
{
  f32 top = near * tanf(glm_rad(fov) * 0.5f);
  f32 bottom = -top;
  f32 left = top * aspect;
  f32 right = -left;

  f32 x = 2.0f * near / (right - left);
  f32 y = 2.0f * near / (top - bottom);

  f32 a = (right + left) / (right - left);
  f32 b = (top + bottom) / (top - bottom);
  f32 c = -(far + near) / (far - near);
  f32 d = -2.0f * far * near / (far - near);

  dst[0][0] = x;
  dst[1][0] = 0.0f;
  dst[2][0] = a;
  dst[3][0] = 0.0f;
  dst[0][1] = 0.0f;
  dst[1][1] = y;
  dst[2][1] = b;
  dst[3][1] = 0.0f;
  dst[0][2] = 0.0f;
  dst[1][2] = 0.0f;
  dst[2][2] = c;
  dst[3][2] = d;
  dst[0][3] = 0.0f;
  dst[1][3] = 0.0f;
  dst[2][3] = -1.0f;
  dst[3][3] = 0.0f;
}

FORCE_INLINE void glm_mat4_lookat(mat4 dst, vec3 eye, vec3 center, vec3 up)
{
  vec3 x, y, z;

  glm_vec3_sub(z, eye, center);
  glm_vec3_normalize(z);

  glm_vec3_cross(x, up, z);
  glm_vec3_normalize(x);
  glm_vec3_cross(y, z, x);

  dst[0][0] = x[0];
  dst[0][1] = x[1];
  dst[0][2] = x[2];

  dst[1][0] = y[0];
  dst[1][1] = y[1];
  dst[1][2] = y[2];

  dst[2][0] = z[0];
  dst[2][1] = z[1];
  dst[2][2] = z[2];
}

#endif