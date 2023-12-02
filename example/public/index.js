"use strict";
(() => {
  // node_modules/@union_native/core/src/adt/flex_buffer_view.js
  var FlexBufferView = class _FlexBufferView {
    constructor(buffer, offset = 0, byte_length = buffer.byteLength) {
      this.buffer = buffer;
      this.f32_view = new Float32Array(buffer, offset, byte_length / 4);
      this.u32_view = new Uint32Array(buffer, offset, byte_length / 4);
      this.u8_view = new Uint8Array(buffer, offset, byte_length);
    }
    sub_view(range) {
      return new _FlexBufferView(this.buffer, range.byte_offset, range.byte_length);
    }
  };

  // node_modules/@union_native/core/src/adt/ordered_map.js
  var OrderedMap = class {
    constructor(source) {
      this.map = /* @__PURE__ */ new Map();
      this.list = [];
      if (source) {
        if (source instanceof Array) {
          source.forEach((pair) => {
            this.map.set(pair.key, pair.value);
            this.list.push(pair.key);
          });
        } else if (typeof source[Symbol.iterator] === "function") {
          for (const pair of source) {
            this.map.set(pair.key, pair.value);
            this.list.push(pair.key);
          }
        } else if (typeof source === "object") {
          this.list = Object.getOwnPropertyNames(source).sort();
          const obj = source;
          for (const name of this.list) {
            this.map.set(name, obj[name]);
          }
        }
      }
    }
    get size() {
      return this.list.length;
    }
    set(key, value) {
      if (!this.map.has(key)) {
        this.list.push(key);
      }
      this.map.set(key, value);
    }
    get(key) {
      return this.map.get(key);
    }
    index_of(value) {
      return this.list.indexOf(value);
    }
    at(index) {
      if (index < 0 || index > this.list.length - 1)
        return;
      return this.map.get(this.list[index]);
    }
    replace_at(index, new_key, value) {
      if (index < 0 || index > this.list.length - 1)
        return;
      const old_key = this.list[index];
      this.list[index] = new_key;
      value = value ?? this.map.get(old_key);
      this.map.delete(old_key);
      this.map.set(new_key, value);
    }
    replace(old_key, new_key, value) {
      const index = this.list.indexOf(old_key);
      if (index < 0)
        return;
      this.replace_at(index, new_key, value);
    }
    swap(index_a, index_b) {
      if (index_a < 0 || index_a > this.list.length - 1)
        return;
      if (index_b < 0 || index_b > this.list.length - 1)
        return;
      if (index_a === index_b)
        return;
      const key_a = this.list[index_a];
      const key_b = this.list[index_b];
      this.list[index_a] = key_b;
      this.list[index_b] = key_a;
    }
    delete(key) {
      if (this.map.has(key)) {
        this.map.delete(key);
        this.list.splice(this.list.indexOf(key), 1);
      }
    }
    delete_value(value) {
      const index = this.list.indexOf(value);
      if (index < 0)
        return;
      this.delete_at(index);
    }
    delete_at(index) {
      if (index < 0 || index > this.list.length - 1)
        return;
      this.delete(this.list[index]);
    }
    has(key) {
      return this.map.has(key);
    }
    clear() {
      this.list = [];
      this.map.clear();
    }
    *[Symbol.iterator]() {
      for (let i = 0; i < this.list.length; ++i) {
        const key = this.list[i];
        yield [key, this.map.get(key)];
      }
    }
  };

  // node_modules/@union_native/core/src/adt/pool.js
  var _trace_enabled = false;
  var _pool_map = /* @__PURE__ */ new Map();
  var _object_map = /* @__PURE__ */ new WeakMap();
  var _object_trace = /* @__PURE__ */ new Map();
  function pool_get(constructor) {
    let pool = _pool_map.get(constructor);
    if (!pool) {
      pool = {
        free: /* @__PURE__ */ new Set(),
        preserved: /* @__PURE__ */ new Set()
      };
      _pool_map.set(constructor, pool);
    }
    let instance;
    if (pool.free.size > 0) {
      instance = pool.free.values().next().value;
      pool.free.delete(instance);
      pool.preserved.add(instance);
    } else {
      instance = new constructor();
      _object_map.set(instance, pool);
      pool.preserved.add(instance);
    }
    if (_trace_enabled) {
      _object_trace.set(instance, new Error().stack);
    }
    return instance;
  }
  function pool_return(instance) {
    const pool = _object_map.get(instance);
    if (!pool) {
      console.log(`[pool] pool_return: pool for ${instance} not found`);
      return;
    }
    if (!pool.preserved.has(instance)) {
      console.log(`[pool] pool_return: instance not found in pool`);
      return;
    }
    pool.preserved.delete(instance);
    pool.free.add(instance);
    if (_trace_enabled)
      _object_trace.delete(instance);
  }

  // node_modules/@union_native/core/src/adt/ptree.js
  var PolyNode = class {
    constructor() {
      this.children = [];
    }
    get is_root() {
      return this.parent === void 0;
    }
    add(node) {
      if (this.can_add && this.can_add(node)) {
        return;
      }
      if (node.parent) {
        node.parent.remove(node);
      }
      this.children.push(node);
      node.parent = this;
    }
    remove(node) {
      const index = this.children.indexOf(node);
      if (index > -1) {
        this.children.splice(index, 1);
        node.parent = void 0;
      }
    }
    has(node) {
      return this.children.indexOf(node) > -1;
    }
    serialize() {
      return void 0;
    }
    deserialize(data) {
    }
  };

  // node_modules/@union_native/core/src/animation/animation_channel.js
  var AnimationDataType;
  (function(AnimationDataType2) {
    AnimationDataType2[AnimationDataType2["Float"] = 0] = "Float";
    AnimationDataType2[AnimationDataType2["Float2"] = 1] = "Float2";
    AnimationDataType2[AnimationDataType2["Float3"] = 2] = "Float3";
    AnimationDataType2[AnimationDataType2["Float4"] = 3] = "Float4";
    AnimationDataType2[AnimationDataType2["Quaternion"] = 4] = "Quaternion";
    AnimationDataType2[AnimationDataType2["Euler"] = 5] = "Euler";
    AnimationDataType2[AnimationDataType2["Mat4"] = 6] = "Mat4";
    AnimationDataType2[AnimationDataType2["Mat3"] = 7] = "Mat3";
    AnimationDataType2[AnimationDataType2["Color"] = 8] = "Color";
    AnimationDataType2[AnimationDataType2["Generic"] = 9] = "Generic";
  })(AnimationDataType || (AnimationDataType = {}));

  // node_modules/@union_native/core/src/math/axis.js
  var Axis;
  (function(Axis2) {
    Axis2[Axis2["X"] = 0] = "X";
    Axis2[Axis2["Y"] = 1] = "Y";
    Axis2[Axis2["Z"] = 2] = "Z";
  })(Axis || (Axis = {}));

  // node_modules/@union_native/core/src/memory/footprint.js
  var global_foot_print = 0;
  function footprint_alloc(size) {
    global_foot_print += size;
  }

  // node_modules/@union_native/core/src/math/math.js
  var DegreeToRadian = Math.PI / 180;
  var RadianToDegree = 180 / Math.PI;
  function clamp(i, b2, t2) {
    return Math.max(Math.min(i, t2), b2);
  }
  function lerp(a, b2, i) {
    return a + (b2 - a) * i;
  }

  // node_modules/@union_native/core/src/math/simd.js
  var Float2 = class _Float2 {
    get x() {
      return this.elements[0];
    }
    set x(value) {
      this.elements[0] = value;
    }
    get y() {
      return this.elements[1];
    }
    set y(value) {
      this.elements[1] = value;
    }
    constructor(x2 = 0, y2 = 0) {
      this.size = 2;
      this.elements = new Float32Array(2);
      this.set(x2, y2);
      footprint_alloc(2);
    }
    read(buffer, offset = 0) {
      this.elements[0] = buffer[offset];
      this.elements[1] = buffer[offset + 1];
      return this;
    }
    write(buffer, offset = 0) {
      buffer[offset] = this.elements[0];
      buffer[offset + 1] = this.elements[1];
      return this;
    }
    set(x2, y2) {
      this.elements[0] = x2;
      this.elements[1] = y2;
      return this;
    }
    copy(a) {
      this.elements.set(a.elements);
      return this;
    }
    clone() {
      return new _Float2(this.elements[0], this.elements[1]);
    }
    rotate(angle, center) {
      if (center === void 0) {
        center = _center;
      }
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const x2 = this.elements[0] - center.x;
      const y2 = this.elements[1] - center.y;
      this.elements[0] = x2 * c - y2 * s + center.x;
      this.elements[1] = x2 * s + y2 * c + center.y;
      return this;
    }
    distance(a) {
      return Math.sqrt(this.distance_squared(a));
    }
    get length() {
      return Math.sqrt(this.elements[0] * this.elements[0] + this.elements[1] * this.elements[1]);
    }
    normalize() {
      const inv_length = 1 / this.length;
      this.elements[0] *= inv_length;
      this.elements[1] *= inv_length;
      return this;
    }
    add(a) {
      this.elements[0] += a.elements[0];
      this.elements[1] += a.elements[1];
      return this;
    }
    sub(a) {
      this.elements[0] -= a.elements[0];
      this.elements[1] -= a.elements[1];
      return this;
    }
    mul(n2) {
      this.elements[0] *= n2;
      this.elements[1] *= n2;
      return this;
    }
    dot(a) {
      return this.elements[0] * a.elements[0] + this.elements[1] * a.elements[1];
    }
    lerp(a, f) {
      return _Float2.Lerp(this, a, f, this);
    }
    distance_squared(a) {
      const dx = this.elements[0] - a.elements[0];
      const dy = this.elements[1] - a.elements[1];
      return dx * dx + dy * dy;
    }
    toString() {
      return `[${this.elements[0]}, ${this.elements[1]}]`;
    }
    static Lerp(a, b2, f, dst2) {
      if (!dst2)
        dst2 = new _Float2();
      dst2.x = a.elements[0] + (b2.x - a.elements[0]) * f;
      dst2.y = a.elements[1] + (b2.y - a.elements[1]) * f;
      return dst2;
    }
  };
  var _center = new Float2();
  var Float3 = class _Float3 {
    get x() {
      return this.elements[0];
    }
    set x(value) {
      this.elements[0] = value;
    }
    get y() {
      return this.elements[1];
    }
    set y(value) {
      this.elements[1] = value;
    }
    get z() {
      return this.elements[2];
    }
    set z(value) {
      this.elements[2] = value;
    }
    constructor(x2 = 0, y2 = 0, z2 = 0) {
      this.size = 3;
      this.elements = new Float32Array(3);
      this.set(x2, y2, z2);
      footprint_alloc(3);
    }
    read(buffer, offset = 0) {
      this.elements[0] = buffer[offset];
      this.elements[1] = buffer[offset + 1];
      this.elements[2] = buffer[offset + 2];
      return this;
    }
    write(buffer, offset = 0) {
      buffer[offset] = this.elements[0];
      buffer[offset + 1] = this.elements[1];
      buffer[offset + 2] = this.elements[2];
      return this;
    }
    set(x2, y2, z2) {
      this.elements[0] = x2;
      this.elements[1] = y2;
      this.elements[2] = z2;
      return this;
    }
    cross(b2) {
      return _Float3.Cross(this, b2, this);
    }
    from_spherical(s) {
      return _Float3.FromSpherical(s, this);
    }
    apply_quaternion(q) {
      return _Float3.ApplyQuaternion(this, q, this);
    }
    add(a) {
      this.elements[0] += a.elements[0];
      this.elements[1] += a.elements[1];
      this.elements[2] += a.elements[2];
      return this;
    }
    sub(a) {
      this.elements[0] -= a.elements[0];
      this.elements[1] -= a.elements[1];
      this.elements[2] -= a.elements[2];
      return this;
    }
    mul(n2) {
      this.elements[0] *= n2;
      this.elements[1] *= n2;
      this.elements[2] *= n2;
      return this;
    }
    mul_v(a) {
      this.elements[0] *= a.elements[0];
      this.elements[1] *= a.elements[1];
      this.elements[2] *= a.elements[2];
      return this;
    }
    div(n2) {
      this.elements[0] /= n2;
      this.elements[1] /= n2;
      this.elements[2] /= n2;
      return this;
    }
    div_v(a) {
      this.elements[0] /= a.elements[0];
      this.elements[1] /= a.elements[1];
      this.elements[2] /= a.elements[2];
      return this;
    }
    copy(a) {
      this.elements[0] = a.elements[0];
      this.elements[1] = a.elements[1];
      this.elements[2] = a.elements[2];
      return this;
    }
    clone() {
      return new _Float3(this.elements[0], this.elements[1], this.elements[2]);
    }
    lerp(b2, i) {
      return _Float3.Lerp(this, b2, i, this);
    }
    apply_mat4(m) {
      return _Float3.MultiplyMat4(this, m, this);
    }
    apply_mat4_directional(m) {
      return _Float3.MultiplyMat4Directional(this, m, this);
    }
    distance(a) {
      return Math.sqrt(this.distance_squared(a));
    }
    get length_square() {
      return this.elements[0] * this.elements[0] + this.elements[1] * this.elements[1] + this.elements[2] * this.elements[2];
    }
    get length() {
      return Math.sqrt(this.elements[0] * this.elements[0] + this.elements[1] * this.elements[1] + this.elements[2] * this.elements[2]);
    }
    dot(a) {
      return this.elements[0] * a.elements[0] + this.elements[1] * a.elements[1] + this.elements[2] * a.elements[2];
    }
    min(a) {
      this.elements[0] = Math.min(this.elements[0], a.elements[0]);
      this.elements[1] = Math.min(this.elements[1], a.elements[1]);
      this.elements[2] = Math.min(this.elements[2], a.elements[2]);
      return this;
    }
    max(a) {
      this.elements[0] = Math.max(this.elements[0], a.elements[0]);
      this.elements[1] = Math.max(this.elements[1], a.elements[1]);
      this.elements[2] = Math.max(this.elements[2], a.elements[2]);
      return this;
    }
    normalize() {
      const inv_length = 1 / this.length;
      this.elements[0] *= inv_length;
      this.elements[1] *= inv_length;
      this.elements[2] *= inv_length;
      return this;
    }
    distance_squared(a) {
      const x2 = this.elements[0] - a.elements[0];
      const y2 = this.elements[1] - a.elements[1];
      const z2 = this.elements[2] - a.elements[2];
      return x2 * x2 + y2 * y2 + z2 * z2;
    }
    toString() {
      return `[${this.elements[0]}, ${this.elements[1]}, ${this.elements[2]}]`;
    }
    static IsZero(src) {
      return src.x === 0 && src.y === 0 && src.z === 0;
    }
    static Equals(a, b2) {
      return a.elements[0] === b2.elements[0] && a.elements[1] === b2.elements[1] && a.elements[2] === b2.elements[2];
    }
    static Abs(src, dst2) {
      dst2.x = Math.abs(src.x);
      dst2.y = Math.abs(src.y);
      dst2.z = Math.abs(src.z);
      return dst2;
    }
    static Clamp(src, min, max, dst2) {
      dst2.x = clamp(src.x, min.x, max.x);
      dst2.y = clamp(src.y, min.y, max.y);
      dst2.z = clamp(src.z, min.z, max.z);
      return dst2;
    }
    static Set(x2, y2, z2, dst2) {
      dst2.x = x2;
      dst2.y = y2;
      dst2.z = z2;
      return dst2;
    }
    static Copy(src, dst2) {
      dst2.x = src.x;
      dst2.y = src.y;
      dst2.z = src.z;
      return dst2;
    }
    static Swap(a, b2) {
      [a.elements[0], b2.x] = [b2.x, a.elements[0]];
      [a.elements[1], b2.y] = [b2.y, a.elements[1]];
      [a.elements[2], b2.z] = [b2.z, a.elements[2]];
    }
    static Add(a, b2, dst2) {
      dst2.x = a.elements[0] + b2.x;
      dst2.y = a.elements[1] + b2.y;
      dst2.z = a.elements[2] + b2.z;
      return dst2;
    }
    static Subtract(a, b2, dst2) {
      dst2.x = a.elements[0] - b2.x;
      dst2.y = a.elements[1] - b2.y;
      dst2.z = a.elements[2] - b2.z;
      return dst2;
    }
    static Distance(a, b2) {
      return a.distance(b2);
    }
    static Normalize(src, dst2) {
      const inv_length = 1 / src.length;
      dst2.x *= inv_length;
      dst2.y *= inv_length;
      dst2.z *= inv_length;
      return dst2;
    }
    static Multiply(a, n2, dst2) {
      dst2.x = a.elements[0] * n2;
      dst2.y = a.elements[1] * n2;
      dst2.z = a.elements[2] * n2;
      return dst2;
    }
    static MultiplyFloat3(a, b2, dst2) {
      dst2.x = a.elements[0] * b2.x;
      dst2.y = a.elements[1] * b2.y;
      dst2.z = a.elements[2] * b2.z;
      return dst2;
    }
    static ApplyQuaternion(a, q, dst2) {
      dst2 = dst2 ?? new _Float3();
      const x2 = a.elements[0];
      const y2 = a.elements[1];
      const z2 = a.elements[2];
      const qx = q.x;
      const qy = q.y;
      const qz = q.z;
      const qw = q.w;
      const ix = qw * x2 + qy * z2 - qz * y2;
      const iy = qw * y2 + qz * x2 - qx * z2;
      const iz = qw * z2 + qx * y2 - qy * x2;
      const iw = -qx * x2 - qy * y2 - qz * z2;
      dst2.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
      dst2.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
      dst2.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
      return dst2;
    }
    static Dot(a, b2) {
      return a.elements[0] * b2.x + a.elements[1] * b2.y + a.elements[2] * b2.z;
    }
    static Cross(a, b2, dst2 = new _Float3()) {
      const ax = a.elements[0];
      const ay = a.elements[1];
      const az = a.elements[2];
      const bx = b2.x;
      const by = b2.y;
      const bz = b2.z;
      dst2.x = ay * bz - az * by;
      dst2.y = az * bx - ax * bz;
      dst2.z = ax * by - ay * bx;
      return dst2;
    }
    static FromSpherical(s, dst2 = new _Float3()) {
      const sinRadius = Math.sin(s.theta) * s.radius;
      dst2.x = sinRadius * Math.sin(s.phi);
      dst2.y = Math.cos(s.theta) * s.radius;
      dst2.z = sinRadius * Math.cos(s.phi);
      return dst2;
    }
    static Lerp(a, b2, i, dst2) {
      dst2.x = lerp(a.elements[0], b2.x, i);
      dst2.y = lerp(a.elements[1], b2.y, i);
      dst2.z = lerp(a.elements[2], b2.z, i);
      return dst2;
    }
    static AddMultiplied(a, b2, n2, dst2) {
      dst2.x = a.elements[0] + b2.x * n2;
      dst2.y = a.elements[1] + b2.y * n2;
      dst2.z = a.elements[2] + b2.z * n2;
      return dst2;
    }
    static MultiplyMat4(a, m, dst2) {
      const x2 = a.elements[0];
      const y2 = a.elements[1];
      const z2 = a.elements[2];
      const e = m.elements;
      const w = 1 / (e[3] * x2 + e[7] * y2 + e[11] * z2 + e[15]);
      dst2.x = (e[0] * x2 + e[4] * y2 + e[8] * z2 + e[12]) * w;
      dst2.y = (e[1] * x2 + e[5] * y2 + e[9] * z2 + e[13]) * w;
      dst2.z = (e[2] * x2 + e[6] * y2 + e[10] * z2 + e[14]) * w;
      return dst2;
    }
    static MultiplyMat3(a, m, dst2) {
      const x2 = a.elements[0];
      const y2 = a.elements[1];
      const z2 = a.elements[2];
      const e = m.elements;
      dst2.x = e[0] * x2 + e[3] * y2 + e[6] * z2;
      dst2.y = e[1] * x2 + e[4] * y2 + e[7] * z2;
      dst2.z = e[2] * x2 + e[5] * y2 + e[8] * z2;
      return dst2;
    }
    static MultiplyMat4Directional(a, m, dst2) {
      const x2 = a.elements[0];
      const y2 = a.elements[1];
      const z2 = a.elements[2];
      const e = m.elements;
      dst2.x = e[0] * x2 + e[4] * y2 + e[8] * z2;
      dst2.y = e[1] * x2 + e[5] * y2 + e[9] * z2;
      dst2.z = e[2] * x2 + e[6] * y2 + e[10] * z2;
      return dst2;
    }
  };
  Float3.ZERO = new Float3(0, 0, 0);
  Float3.ONE = new Float3(1, 1, 1);
  Float3.X = new Float3(1, 0, 0);
  Float3.Y = new Float3(0, 1, 0);
  Float3.Z = new Float3(0, 0, 1);
  Float3.NEGATIVE_X = new Float3(-1, 0, 0);
  Float3.NEGATIVE_Y = new Float3(0, -1, 0);
  Float3.NEGATIVE_Z = new Float3(0, 0, -1);
  var Float4 = class _Float4 {
    get x() {
      return this.elements[0];
    }
    set x(value) {
      this.elements[0] = value;
    }
    get y() {
      return this.elements[1];
    }
    set y(value) {
      this.elements[1] = value;
    }
    get z() {
      return this.elements[2];
    }
    set z(value) {
      this.elements[2] = value;
    }
    get w() {
      return this.elements[3];
    }
    set w(value) {
      this.elements[3] = value;
    }
    constructor(x2 = 0, y2 = 0, z2 = 0, w = 0) {
      this.size = 4;
      this.elements = new Float32Array(4);
      this.set(x2, y2, z2, w);
      footprint_alloc(4);
    }
    read(buffer, offset = 0) {
      this.elements[0] = buffer[offset];
      this.elements[1] = buffer[offset + 1];
      this.elements[2] = buffer[offset + 2];
      this.elements[3] = buffer[offset + 3];
      return this;
    }
    write(buffer, offset = 0) {
      buffer[offset] = this.elements[0];
      buffer[offset + 1] = this.elements[1];
      buffer[offset + 2] = this.elements[2];
      buffer[offset + 3] = this.elements[3];
      return this;
    }
    set(x2, y2, z2, w) {
      this.elements[0] = x2;
      this.elements[1] = y2;
      this.elements[2] = z2;
      this.elements[3] = w;
      return this;
    }
    copy(a) {
      this.elements.set(a.elements);
      return this;
    }
    apply_mat4(m) {
      return _Float4.MultiplyMat4(this, m, this);
    }
    clone() {
      return new _Float4(this.elements[0], this.elements[1], this.elements[2], this.elements[3]);
    }
    all_zero() {
      return this.elements[0] === 0 && this.elements[1] === 0 && this.elements[2] === 0 && this.elements[3] === 0;
    }
    toString() {
      return `[${this.elements[0]}, ${this.elements[1]}, ${this.elements[2]}, ${this.elements[3]}]`;
    }
    mul(n2) {
      this.elements[0] *= n2;
      this.elements[1] *= n2;
      this.elements[2] *= n2;
      this.elements[3] *= n2;
      return this;
    }
    lerp(b2, f) {
      _Float4.Lerp(this, b2, f, this);
      return this;
    }
    static Lerp(a, b2, f, dst2) {
      dst2.x = lerp(a.x, b2.x, f);
      dst2.y = lerp(a.y, b2.y, f);
      dst2.y = lerp(a.z, b2.z, f);
      dst2.y = lerp(a.w, b2.w, f);
      return dst2;
    }
    static MultiplyMat4(a, m, dst2) {
      const x2 = a.elements[0];
      const y2 = a.elements[1];
      const z2 = a.elements[2];
      const w = a.elements[3];
      const e = m.elements;
      dst2.x = e[0] * x2 + e[4] * y2 + e[8] * z2 + e[12] * w;
      dst2.y = e[1] * x2 + e[5] * y2 + e[9] * z2 + e[13] * w;
      dst2.z = e[2] * x2 + e[6] * y2 + e[10] * z2 + e[14] * w;
      dst2.w = e[3] * x2 + e[7] * y2 + e[11] * z2 + e[15] * w;
      return dst2;
    }
  };

  // node_modules/@union_native/core/src/math/box.js
  var points = [new Float3(), new Float3(), new Float3(), new Float3(), new Float3(), new Float3(), new Float3(), new Float3()];
  var Box3 = class _Box3 {
    constructor(min, max) {
      this.min = new Float3();
      this.max = new Float3();
      this._size = new Float3();
      this._center = new Float3();
      if (min !== void 0) {
        this.min.copy(min);
      } else {
        this.min.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
      }
      if (max !== void 0) {
        this.max.copy(max);
      } else {
        this.max.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
      }
    }
    get size() {
      return this._size.copy(this.max).sub(this.min);
    }
    get center() {
      return this._center.copy(this.size).mul(0.5).add(this.min);
    }
    set(min, max) {
      this.min.copy(min);
      this.max.copy(max);
      return this;
    }
    copy(a) {
      this.min.copy(a.min);
      this.max.copy(a.max);
      return this;
    }
    clone() {
      return new _Box3(this.min, this.max);
    }
    reset() {
      this.min.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
      this.max.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
      return this;
    }
    expand_point(point) {
      this.min.min(point);
      this.max.max(point);
      return this;
    }
    contains_point(point) {
      return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y && point.z >= this.min.z && point.z <= this.max.z;
    }
    expand_box(box) {
      this.min.min(box.min);
      this.max.max(box.max);
      return this;
    }
    contains_box(box) {
      return this.min.x <= box.min.x && this.max.x >= box.max.x && this.min.y <= box.min.y && this.max.y >= box.max.y && this.min.z <= box.min.z && this.max.z >= box.max.z;
    }
    apply_mat4(m) {
      points[0].set(this.min.x, this.min.y, this.min.z).apply_mat4(m);
      points[1].set(this.min.x, this.min.y, this.max.z).apply_mat4(m);
      points[2].set(this.min.x, this.max.y, this.min.z).apply_mat4(m);
      points[3].set(this.min.x, this.max.y, this.max.z).apply_mat4(m);
      points[4].set(this.max.x, this.min.y, this.min.z).apply_mat4(m);
      points[5].set(this.max.x, this.min.y, this.max.z).apply_mat4(m);
      points[6].set(this.max.x, this.max.y, this.min.z).apply_mat4(m);
      points[7].set(this.max.x, this.max.y, this.max.z).apply_mat4(m);
      this.reset();
      for (let i = 0; i < 8; ++i) {
        this.expand_point(points[i]);
      }
      return this;
    }
    write(buffer, offset = 0) {
      this.min.write(buffer, offset);
      this.max.write(buffer, offset + 3);
      return this;
    }
    read(buffer, offset = 0) {
      this.min.read(buffer, offset);
      this.max.read(buffer, offset + 3);
      return this;
    }
    set_center(center) {
      const size = this.size;
      const half_x = size.x * 0.5;
      const half_y = size.y * 0.5;
      const half_z = size.z * 0.5;
      this.min.x = center.x - half_x;
      this.min.y = center.y - half_y;
      this.min.z = center.z - half_z;
      this.max.x = center.x + half_x;
      this.max.y = center.y + half_y;
      this.max.z = center.z + half_z;
      return this;
    }
    set_size(size) {
      const center = this.center;
      const sx = size.x * 0.5;
      const sy = size.y * 0.5;
      const sz = size.z * 0.5;
      this.min.x = center.x - sx;
      this.min.y = center.y - sy;
      this.min.z = center.z - sz;
      this.max.x = center.x + sx;
      this.max.y = center.y + sy;
      this.max.z = center.z + sz;
      return this;
    }
    get invalid() {
      return this.min.x === Infinity || this.min.y === Infinity || this.min.z === Infinity || this.max.x === -Infinity || this.max.y === -Infinity || this.max.z === -Infinity;
    }
    static Overlapped(a, b2) {
      let overlap = true;
      overlap = a.min.x > b2.max.x || a.max.x < b2.min.x ? false : overlap;
      overlap = a.min.y > b2.max.y || a.max.y < b2.min.y ? false : overlap;
      overlap = a.min.z > b2.max.z || a.max.z < b2.min.z ? false : overlap;
      return overlap;
    }
  };

  // node_modules/@union_native/core/src/math/color.js
  function color_to_hex(c) {
    c = clamp(Math.ceil(c * 255), 0, 255);
    if (c < 16)
      return "0" + c.toString(16);
    return c.toString(16);
  }
  var ColorMode;
  (function(ColorMode2) {
    ColorMode2[ColorMode2["RGBA"] = 1] = "RGBA";
    ColorMode2[ColorMode2["HSL"] = 2] = "HSL";
    ColorMode2[ColorMode2["HSV"] = 3] = "HSV";
  })(ColorMode || (ColorMode = {}));
  var ColorRGBA = class _ColorRGBA extends Float4 {
    get r() {
      return this.elements[0];
    }
    set r(value) {
      this.elements[0] = value;
    }
    get g() {
      return this.elements[1];
    }
    set g(value) {
      this.elements[1] = value;
    }
    get b() {
      return this.elements[2];
    }
    set b(value) {
      this.elements[2] = value;
    }
    get a() {
      return this.elements[3];
    }
    set a(value) {
      this.elements[3] = value;
    }
    constructor(r = 0, g = 0, b2 = 0, a = 1) {
      super(r, g, b2, a);
    }
    copy(color) {
      super.copy(color);
      return this;
    }
    clone() {
      return new _ColorRGBA().copy(this);
    }
    read(buffer, offset = 0) {
      this.elements[0] = buffer[offset];
      this.elements[1] = buffer[offset + 1];
      this.elements[2] = buffer[offset + 2];
      this.elements[3] = buffer[offset + 3];
      return this;
    }
    write(buffer, offset = 0) {
      buffer[offset] = this.elements[0];
      buffer[offset + 1] = this.elements[1];
      buffer[offset + 2] = this.elements[2];
      buffer[offset + 3] = this.elements[3];
      return this;
    }
    set_hex_string(hex) {
      let h = hex;
      if (!h)
        return this;
      if (h[0] === "#")
        h = h.substr(1);
      else if (h[0] === "0" && h[1] === "x")
        h = h.substr(2);
      if (h.length === 3) {
        this.r = parseInt(h[0], 16) / 15;
        this.g = parseInt(h[1], 16) / 15;
        this.b = parseInt(h[2], 16) / 15;
        this.a = 1;
      } else if (h.length === 4) {
        this.r = parseInt(h[0], 16) / 15;
        this.g = parseInt(h[1], 16) / 15;
        this.b = parseInt(h[2], 16) / 15;
        this.a = parseInt(h[3], 16) / 15;
      } else if (h.length === 6) {
        this.r = parseInt(h.substr(0, 2), 16) / 255;
        this.g = parseInt(h.substr(2, 2), 16) / 255;
        this.b = parseInt(h.substr(4, 2), 16) / 255;
        this.a = 1;
      } else if (h.length === 8) {
        this.r = parseInt(h.substr(0, 2), 16) / 255;
        this.g = parseInt(h.substr(2, 2), 16) / 255;
        this.b = parseInt(h.substr(4, 2), 16) / 255;
        this.a = parseInt(h.substr(6, 2), 16) / 255;
      } else {
        throw `invalid hex value ${hex}`;
      }
      return this;
    }
    set_hex(hex) {
      if (hex > 16777215) {
        this.r = ((hex & 4278190080) >>> 24) / 255;
        this.g = ((hex & 16711680) >>> 16) / 255;
        this.b = ((hex & 65280) >>> 8) / 255;
        this.a = (hex & 255) / 255;
      } else {
        this.r = ((hex & 16711680) >>> 16) / 255;
        this.g = ((hex & 65280) >>> 8) / 255;
        this.b = (hex & 255) / 255;
        this.a = 1;
      }
      return this;
    }
    to_hex() {
      const r = (this.r * 255 & 255) << 24;
      const g = (this.g * 255 & 255) << 16;
      const b2 = (this.b * 255 & 255) << 8;
      const a = this.a * 255 & 255;
      return r | g | b2 | a;
    }
    to_hex_string() {
      return color_to_hex(this.r) + color_to_hex(this.g) + color_to_hex(this.b) + color_to_hex(this.a);
    }
    set_rgba_byte(r, g, b2, a) {
      this.r = r / 255;
      this.g = g / 255;
      this.b = b2 / 255;
      this.a = a / 255;
      return this;
    }
    tone(f) {
      this.r *= f;
      this.g *= f;
      this.b *= f;
      return this;
    }
    tone_scalar(offset) {
      this.r += offset;
      this.g += offset;
      this.b += offset;
      return this;
    }
    from_float3(src) {
      this.r = src.x;
      this.g = src.y;
      this.b = src.z;
      this.a = 1;
      return this;
    }
    from_float4(src) {
      this.r = src.x;
      this.g = src.y;
      this.b = src.z;
      this.a = src.w;
      return this;
    }
    to_float3(dst2) {
      dst2 = dst2 ?? new Float3();
      dst2.x = this.r;
      dst2.y = this.g;
      dst2.z = this.b;
      return dst2;
    }
    to_float4(dst2) {
      dst2 = dst2 ?? new Float4();
      dst2.x = this.r;
      dst2.y = this.g;
      dst2.z = this.b;
      dst2.w = this.a;
      return dst2;
    }
    toString() {
      return `[${this.r}, ${this.g}, ${this.b}, ${this.a}]`;
    }
    toJSON() {
      return [this.r, this.g, this.b, this.a];
    }
    to_array() {
      return [this.r, this.g, this.b, this.a];
    }
  };

  // node_modules/@union_native/core/src/math/simd_mat.js
  var x = new Float3();
  var y = new Float3();
  var z = new Float3();
  var v = new Float3();
  var default_up = new Float3(0, 1, 0);
  var Mat4 = class _Mat4 {
    constructor() {
      this.size = 16;
      this.elements = new Float32Array(16);
      this.identity();
      footprint_alloc(16);
    }
    read(buffer, offset = 0) {
      for (let i = 0; i < this.size; ++i) {
        this.elements[i] = buffer[offset + i];
      }
      return this;
    }
    write(buffer, offset = 0) {
      for (let i = 0; i < this.size; ++i) {
        buffer[offset + i] = this.elements[i];
      }
      return this;
    }
    copy(dst2) {
      this.elements.set(dst2.elements);
      return this;
    }
    clone() {
      return new _Mat4().copy(this);
    }
    identity() {
      this.elements.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      return this;
    }
    get_x(x2) {
      x2.read(this.elements);
      return x2;
    }
    get_y(y2) {
      y2.read(this.elements, 4);
      return y2;
    }
    get_z(z2) {
      z2.read(this.elements, 8);
      return z2;
    }
    get_w(w) {
      w.read(this.elements, 12);
      return w;
    }
    set_x(x2) {
      x2.write(this.elements);
      return this;
    }
    set_y(x2) {
      x2.write(this.elements, 4);
      return this;
    }
    set_z(x2) {
      x2.write(this.elements, 8);
      return this;
    }
    set_w(x2) {
      x2.write(this.elements, 12);
      return this;
    }
    set(xx, xy, xz, xw, yx, yy, yz, yw, zx, zy, zz, zw, wx, wy, wz, ww) {
      const te = this.elements;
      te[0] = xx;
      te[1] = xy;
      te[2] = xz;
      te[3] = xw;
      te[4] = yx;
      te[5] = yy;
      te[6] = yz;
      te[7] = yw;
      te[8] = zx;
      te[9] = zy;
      te[10] = zz;
      te[11] = zw;
      te[12] = wx;
      te[13] = wy;
      te[14] = wz;
      te[15] = ww;
      return this;
    }
    look_at(origin, target, up) {
      if (up === void 0)
        up = default_up;
      z.copy(origin).sub(target);
      if (z.x === 0 && z.y === 0 && z.z === 0) {
        z.z = 1;
      }
      z.normalize();
      Float3.Cross(up, z, x);
      if (x.x === 0 && x.y === 0 && x.z === 0) {
        if (Math.abs(up.z) === 1) {
          z.x += 1e-4;
        } else {
          z.z += 1e-4;
        }
        z.normalize();
        Float3.Cross(up, z, x);
      }
      x.normalize();
      Float3.Cross(z, x, y);
      y.normalize();
      const te = this.elements;
      te[0] = x.x;
      te[1] = x.y;
      te[2] = x.z;
      te[4] = y.x;
      te[5] = y.y;
      te[6] = y.z;
      te[8] = z.x;
      te[9] = z.y;
      te[10] = z.z;
      return this;
    }
    perspective(vertical_fov, aspect, near, far, reverse_depth = false) {
      const top = near * Math.tan(DegreeToRadian * 0.5 * vertical_fov);
      const bottom = -top;
      const left = top * aspect;
      const right = -left;
      const depth_range = far - near;
      const n2 = near * 2;
      const te = this.elements;
      te.fill(0);
      te[0] = n2 / (right - left);
      te[5] = n2 / (top - bottom);
      te[8] = (right + left) / (right - left);
      te[9] = (top + bottom) / (top - bottom);
      te[10] = -(far / depth_range);
      te[14] = near * te[10];
      te[11] = -1;
      if (reverse_depth) {
        te[14] = -te[14];
        te[10] = -te[10] - 1;
      }
      return this;
    }
    orthographics(size_vertical, size_horizontal, near, far, reverse_depth = false) {
      const te = this.elements;
      te.fill(0);
      const depth_range = far - near;
      const left = size_horizontal / 2;
      const right = -size_horizontal / 2;
      const top = size_vertical / 2;
      const bottom = -size_vertical / 2;
      te[0] = 2 / (right - left);
      te[5] = 2 / (top - bottom);
      te[10] = -2 / depth_range;
      te[12] = (right + left) / (right - left);
      te[13] = (top + bottom) / (top - bottom);
      te[14] = -near * te[10];
      te[15] = 1;
      if (reverse_depth) {
        te[14] = -te[14] + 1;
        te[10] = -te[10];
      }
      return this;
    }
    inverse() {
      return _Mat4.Inverse(this, this);
    }
    from_quaternion(q) {
      return _Mat4.FromQuaternion(q, this);
    }
    compose(location, rotation, scale) {
      return _Mat4.Compose(location, rotation, scale, this);
    }
    decompose(location, rotation, scale) {
      return _Mat4.Decompose(this, location, rotation, scale);
    }
    set_scale(scale) {
      const te = this.elements;
      const x2 = scale.x, y2 = scale.y, z2 = scale.z;
      te[0] *= x2;
      te[4] *= y2;
      te[8] *= z2;
      te[1] *= x2;
      te[5] *= y2;
      te[9] *= z2;
      te[2] *= x2;
      te[6] *= y2;
      te[10] *= z2;
      te[3] *= x2;
      te[7] *= y2;
      te[11] *= z2;
      return this;
    }
    get_scale(scale) {
      return scale.set(this.elements[0], this.elements[5], this.elements[10]);
    }
    set_location(location) {
      const te = this.elements;
      te[12] = location.x;
      te[13] = location.y;
      te[14] = location.z;
      return this;
    }
    pre_mul(a) {
      return _Mat4.Mul(a, this, this);
    }
    mul(a) {
      return _Mat4.Mul(this, a, this);
    }
    transpose() {
      const te = this.elements;
      let tmp;
      tmp = te[1];
      te[1] = te[4];
      te[4] = tmp;
      tmp = te[2];
      te[2] = te[8];
      te[8] = tmp;
      tmp = te[6];
      te[6] = te[9];
      te[9] = tmp;
      tmp = te[3];
      te[3] = te[12];
      te[12] = tmp;
      tmp = te[7];
      te[7] = te[13];
      te[13] = tmp;
      tmp = te[11];
      te[11] = te[14];
      te[14] = tmp;
      return this;
    }
    determinant() {
      return _Mat4.Determinant(this);
    }
    static IsIdentity(src) {
      const te = src.elements;
      return te[0] === 1 && te[1] === 0 && te[2] === 0 && te[3] === 0 && te[4] === 0 && te[5] === 1 && te[6] === 0 && te[7] === 0 && te[8] === 0 && te[9] === 0 && te[10] === 1 && te[11] === 0 && te[12] === 0 && te[13] === 0 && te[14] === 0 && te[15] === 1;
    }
    static Determinant(src) {
      const te = src.elements;
      const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
      const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
      const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
      const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
      return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
    }
    static Compose(location, rotation, scale, dst2) {
      if (dst2 === void 0)
        dst2 = new _Mat4();
      const te = dst2.elements;
      const x2 = rotation.x, y2 = rotation.y, z2 = rotation.z, w = rotation.w;
      const x22 = x2 + x2, y22 = y2 + y2, z22 = z2 + z2;
      const xx = x2 * x22, xy = x2 * y22, xz = x2 * z22;
      const yy = y2 * y22, yz = y2 * z22, zz = z2 * z22;
      const wx = w * x22, wy = w * y22, wz = w * z22;
      const sx = scale.x, sy = scale.y, sz = scale.z;
      te[0] = (1 - (yy + zz)) * sx;
      te[1] = (xy + wz) * sx;
      te[2] = (xz - wy) * sx;
      te[3] = 0;
      te[4] = (xy - wz) * sy;
      te[5] = (1 - (xx + zz)) * sy;
      te[6] = (yz + wx) * sy;
      te[7] = 0;
      te[8] = (xz + wy) * sz;
      te[9] = (yz - wx) * sz;
      te[10] = (1 - (xx + yy)) * sz;
      te[11] = 0;
      te[12] = location.x;
      te[13] = location.y;
      te[14] = location.z;
      te[15] = 1;
      return dst2;
    }
    static Decompose(src, location, rotation, scale) {
      const m = pool_get(_Mat4);
      const te = src.elements;
      let sx = v.set(te[0], te[1], te[2]).length;
      const sy = v.set(te[4], te[5], te[6]).length;
      const sz = v.set(te[8], te[9], te[10]).length;
      const det = src.determinant();
      if (det < 0)
        sx = -sx;
      location.x = te[12];
      location.y = te[13];
      location.z = te[14];
      m.copy(src);
      const invSX = 1 / sx;
      const invSY = 1 / sy;
      const invSZ = 1 / sz;
      m.elements[0] *= invSX;
      m.elements[1] *= invSX;
      m.elements[2] *= invSX;
      m.elements[4] *= invSY;
      m.elements[5] *= invSY;
      m.elements[6] *= invSY;
      m.elements[8] *= invSZ;
      m.elements[9] *= invSZ;
      m.elements[10] *= invSZ;
      rotation.from_mat4(m);
      pool_return(m);
      scale.x = sx;
      scale.y = sy;
      scale.z = sz;
      return src;
    }
    static FromQuaternion(q, dst2 = new _Mat4()) {
      const te = dst2.elements;
      const x2 = q.x;
      const y2 = q.y;
      const z2 = q.z;
      const w = q.w;
      const x22 = x2 + x2;
      const y22 = y2 + y2;
      const z22 = z2 + z2;
      const xx = x2 * x22;
      const xy = x2 * y22;
      const xz = x2 * z22;
      const yy = y2 * y22;
      const yz = y2 * z22;
      const zz = z2 * z22;
      const wx = w * x22;
      const wy = w * y22;
      const wz = w * z22;
      te[0] = 1 - (yy + zz);
      te[4] = xy - wz;
      te[8] = xz + wy;
      te[1] = xy + wz;
      te[5] = 1 - (xx + zz);
      te[9] = yz - wx;
      te[2] = xz - wy;
      te[6] = yz + wx;
      te[10] = 1 - (xx + yy);
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
      return dst2;
    }
    static Inverse(src, dst2) {
      if (!dst2)
        dst2 = new _Mat4();
      const te = dst2.elements, me = src.elements, n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3], n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7], n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11], n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
      const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
      if (det === 0) {
        return dst2.identity();
      }
      const detInv = 1 / det;
      te[0] = t11 * detInv;
      te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
      te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
      te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
      te[4] = t12 * detInv;
      te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
      te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
      te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
      te[8] = t13 * detInv;
      te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
      te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
      te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
      te[12] = t14 * detInv;
      te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
      te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
      te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
      return dst2;
    }
    static Mul(a, b2, dst2) {
      if (dst2 === void 0)
        dst2 = new _Mat4();
      const ae = a.elements;
      const be = b2.elements;
      const te = dst2.elements;
      const a11 = ae[0];
      const a12 = ae[4];
      const a13 = ae[8];
      const a14 = ae[12];
      const a21 = ae[1];
      const a22 = ae[5];
      const a23 = ae[9];
      const a24 = ae[13];
      const a31 = ae[2];
      const a32 = ae[6];
      const a33 = ae[10];
      const a34 = ae[14];
      const a41 = ae[3];
      const a42 = ae[7];
      const a43 = ae[11];
      const a44 = ae[15];
      const b11 = be[0];
      const b12 = be[4];
      const b13 = be[8];
      const b14 = be[12];
      const b21 = be[1];
      const b22 = be[5];
      const b23 = be[9];
      const b24 = be[13];
      const b31 = be[2];
      const b32 = be[6];
      const b33 = be[10];
      const b34 = be[14];
      const b41 = be[3];
      const b42 = be[7];
      const b43 = be[11];
      const b44 = be[15];
      te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      return dst2;
    }
    toString() {
      let result = "[" + this.elements[0].toFixed(4);
      for (let i = 1; i < this.elements.length; ++i) {
        result += ", " + this.elements[i].toFixed(4);
      }
      result += "]";
      return result;
    }
  };
  Mat4.IDENTITY = new Mat4().identity();

  // node_modules/@union_native/core/src/math/euler.js
  var EulerOrder;
  (function(EulerOrder2) {
    EulerOrder2["XYZ"] = "XYZ";
    EulerOrder2["YXZ"] = "YXZ";
    EulerOrder2["ZXY"] = "ZXY";
    EulerOrder2["ZYX"] = "ZYX";
    EulerOrder2["YZX"] = "YZX";
    EulerOrder2["XZY"] = "XZY";
  })(EulerOrder || (EulerOrder = {}));

  // node_modules/@union_native/core/src/math/interpolation.js
  var InterpolationMethod;
  (function(InterpolationMethod2) {
    InterpolationMethod2[InterpolationMethod2["Linear"] = 0] = "Linear";
    InterpolationMethod2[InterpolationMethod2["Step"] = 1] = "Step";
    InterpolationMethod2[InterpolationMethod2["CubicSpline"] = 2] = "CubicSpline";
  })(InterpolationMethod || (InterpolationMethod = {}));

  // node_modules/@union_native/core/src/math/ray.js
  var v2 = new Float3();
  var normal = new Float3();
  var edge1 = new Float3();
  var edge2 = new Float3();
  var diff = new Float3();

  // node_modules/@union_native/core/src/math/rect.js
  var Rect = class {
    set x(n2) {
      this.elements[0] = n2;
    }
    set y(n2) {
      this.elements[1] = n2;
    }
    set w(n2) {
      this.elements[2] = n2;
    }
    set h(n2) {
      this.elements[3] = n2;
    }
    get x() {
      return this.elements[0];
    }
    get y() {
      return this.elements[1];
    }
    get w() {
      return this.elements[2];
    }
    get h() {
      return this.elements[3];
    }
    constructor(x2 = 0, y2 = 0, w = 0, h = 0) {
      this.size = 4;
      this.elements = new Float32Array(4);
      this.set(x2, y2, w, h);
      footprint_alloc(4);
    }
    read(buffer, offset = 0) {
      this.elements[0] = buffer[offset];
      this.elements[1] = buffer[offset + 1];
      this.elements[2] = buffer[offset + 2];
      this.elements[3] = buffer[offset + 3];
      return this;
    }
    write(buffer, offset = 0) {
      buffer[offset] = this.elements[0];
      buffer[offset + 1] = this.elements[1];
      buffer[offset + 2] = this.elements[2];
      buffer[offset + 3] = this.elements[3];
      return this;
    }
    set(x2, y2, w, h) {
      this.elements[0] = x2;
      this.elements[1] = y2;
      this.elements[2] = w;
      this.elements[3] = h;
      return this;
    }
    copy(rect) {
      this.elements[0] = rect.x;
      this.elements[1] = rect.y;
      this.elements[2] = rect.w;
      this.elements[3] = rect.h;
      return this;
    }
    contains(point) {
      return point.x >= this.elements[0] && point.y >= this.elements[1] && point.x < this.elements[0] + this.elements[2] && point.y < this.elements[1] + this.elements[3];
    }
    equals(rect) {
      return this.elements[0] === rect.x && this.elements[1] === rect.y && this.elements[2] === rect.w && this.elements[3] === rect.h;
    }
    locate(rect) {
      this.elements[0] += rect.x;
      this.elements[1] += rect.y;
      return this;
    }
    mul(n2) {
      this.elements[0] *= n2;
      this.elements[1] *= n2;
      this.elements[2] *= n2;
      this.elements[3] *= n2;
      return this;
    }
    scale(n2) {
      this.elements[2] *= n2;
      this.elements[3] *= n2;
      return this;
    }
    translate(x2, y2) {
      this.elements[0] += x2;
      this.elements[1] += y2;
      return this;
    }
    shrink(offset, offset_horizontal) {
      if (offset_horizontal === void 0) {
        this.elements[0] += offset;
        this.elements[1] += offset;
        this.elements[2] = Math.max(0, this.elements[2] - offset * 2);
        this.elements[3] = Math.max(0, this.elements[3] - offset * 2);
      } else {
        this.elements[0] += offset_horizontal;
        this.elements[1] += offset;
        this.elements[2] = Math.max(0, this.elements[2] - offset_horizontal * 2);
        this.elements[3] = Math.max(0, this.elements[3] - offset * 2);
      }
      return this;
    }
    expand(offset, offset_horizontal) {
      if (offset_horizontal === void 0) {
        this.elements[0] -= offset;
        this.elements[1] -= offset;
        this.elements[2] += offset * 2;
        this.elements[3] += offset * 2;
      } else {
        this.elements[0] -= offset_horizontal;
        this.elements[1] -= offset;
        this.elements[2] += offset_horizontal * 2;
        this.elements[3] += offset * 2;
      }
      return this;
    }
    constrain(point) {
      point.x = clamp(point.x, this.elements[0], this.elements[0] + this.elements[2]);
      point.y = clamp(point.y, this.elements[1], this.elements[1] + this.elements[3]);
      return point;
    }
    intersect(rect) {
      const l = this.elements[0] > rect.x ? this.elements[0] : rect.x;
      const t2 = this.elements[1] > rect.y ? this.elements[1] : rect.y;
      const r = this.elements[0] + this.elements[2] < rect.x + rect.w ? this.elements[0] + this.elements[2] : rect.x + rect.w;
      const b2 = this.elements[1] + this.elements[3] < rect.y + rect.h ? this.elements[1] + this.elements[3] : rect.y + rect.h;
      if (l >= r || t2 >= b2) {
        this.elements[0] = 0;
        this.elements[1] = 0;
        this.elements[2] = 0;
        this.elements[3] = 0;
      } else {
        this.elements[0] = l;
        this.elements[1] = t2;
        this.elements[2] = r - l;
        this.elements[3] = b2 - t2;
      }
      return this;
    }
    valid() {
      return this.elements[2] > 0 && this.elements[3] > 0;
    }
    toString() {
      return `Rect(${this.elements[0]}, ${this.elements[1]}, ${this.elements[2]}, ${this.elements[3]})`;
    }
  };
  Rect.ZERO = new Rect(0, 0, 0, 0);

  // node_modules/@union_native/core/src/math/simd_quaternion.js
  var Quaternion = class _Quaternion {
    get x() {
      return this.elements[0];
    }
    set x(value) {
      this.elements[0] = value;
    }
    get y() {
      return this.elements[1];
    }
    set y(value) {
      this.elements[1] = value;
    }
    get z() {
      return this.elements[2];
    }
    set z(value) {
      this.elements[2] = value;
    }
    get w() {
      return this.elements[3];
    }
    set w(value) {
      this.elements[3] = value;
    }
    constructor(x2 = 0, y2 = 0, z2 = 0, w = 1) {
      this.is_quaternion = true;
      this.size = 4;
      this.elements = new Float32Array(4);
      this.x = x2;
      this.y = y2;
      this.z = z2;
      this.w = w;
      footprint_alloc(4);
    }
    read(buffer, offset = 0) {
      this.elements[0] = buffer[offset];
      this.elements[1] = buffer[offset + 1];
      this.elements[2] = buffer[offset + 2];
      this.elements[3] = buffer[offset + 3];
      return this;
    }
    write(buffer, offset = 0) {
      buffer[offset] = this.elements[0];
      buffer[offset + 1] = this.elements[1];
      buffer[offset + 2] = this.elements[2];
      buffer[offset + 3] = this.elements[3];
      return this;
    }
    set(...args) {
      if (!args)
        this.elements.fill(0);
      else
        this.elements.set(args);
      return this;
    }
    copy(q) {
      this.x = q.x;
      this.y = q.y;
      this.z = q.z;
      this.w = q.w;
      return this;
    }
    clone() {
      return new _Quaternion(this.x, this.y, this.z, this.w);
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    normalize() {
      return _Quaternion.Normalize(this, this);
    }
    premul(q) {
      return _Quaternion.Mul(q, this, this);
    }
    mul(q) {
      return _Quaternion.Mul(this, q, this);
    }
    from_mat4(m) {
      return _Quaternion.FromMat4(m, this);
    }
    from_unit_vectors(src, dst2) {
      return _Quaternion.FromUnitVectors(src, dst2, this);
    }
    from_euler(src, order = EulerOrder.XYZ) {
      return _Quaternion.FromEuler(src, order, this);
    }
    from_axis_angle(axis, angle) {
      const halfAngle = angle / 2;
      const s = Math.sin(halfAngle);
      this.x = axis.x * s;
      this.y = axis.y * s;
      this.z = axis.z * s;
      this.w = Math.cos(halfAngle);
      return this;
    }
    toString() {
      return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`;
    }
    slerp(q, t2) {
      _Quaternion.Slerp(this, q, t2, this);
      return this;
    }
    conjugate() {
      return _Quaternion.Conjugate(this, this);
    }
    inverse() {
      return _Quaternion.Inverse(this, this);
    }
    static Conjugate(q, dst2) {
      dst2.x = -q.x;
      dst2.y = -q.y;
      dst2.z = -q.z;
      dst2.w = q.w;
      return dst2;
    }
    static Equals(a, b2) {
      return a.x === b2.x && a.y === b2.y && a.z === b2.z && a.w === b2.w;
    }
    static Mul(a, b2, dst2) {
      if (dst2 === void 0)
        dst2 = new _Quaternion();
      const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
      const qbx = b2.x, qby = b2.y, qbz = b2.z, qbw = b2.w;
      dst2.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
      dst2.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
      dst2.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
      dst2.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
      return dst2;
    }
    static FromUnitVectors(a, b2, dst2) {
      let r = a.dot(b2) + 1;
      if (r < Number.EPSILON) {
        r = 0;
        if (Math.abs(a.x) > Math.abs(a.z)) {
          dst2.x = -a.y;
          dst2.y = a.x;
          dst2.z = 0;
          dst2.w = r;
        } else {
          dst2.x = 0;
          dst2.y = -a.z;
          dst2.z = a.y;
          dst2.w = r;
        }
      } else {
        dst2.x = a.y * b2.z - a.z * b2.y;
        dst2.y = a.z * b2.x - a.x * b2.z;
        dst2.z = a.x * b2.y - a.y * b2.x;
        dst2.w = r;
      }
      return dst2.normalize();
    }
    static FromMat4(m, dst2) {
      const te = m.elements;
      const m11 = te[0];
      const m12 = te[4];
      const m13 = te[8];
      const m21 = te[1];
      const m22 = te[5];
      const m23 = te[9];
      const m31 = te[2];
      const m32 = te[6];
      const m33 = te[10];
      const trace = m11 + m22 + m33;
      let s;
      if (trace > 0) {
        s = 0.5 / Math.sqrt(trace + 1);
        dst2.w = 0.25 / s;
        dst2.x = (m32 - m23) * s;
        dst2.y = (m13 - m31) * s;
        dst2.z = (m21 - m12) * s;
      } else if (m11 > m22 && m11 > m33) {
        s = 2 * Math.sqrt(1 + m11 - m22 - m33);
        dst2.w = (m32 - m23) / s;
        dst2.x = 0.25 * s;
        dst2.y = (m12 + m21) / s;
        dst2.z = (m13 + m31) / s;
      } else if (m22 > m33) {
        s = 2 * Math.sqrt(1 + m22 - m11 - m33);
        dst2.w = (m13 - m31) / s;
        dst2.x = (m12 + m21) / s;
        dst2.y = 0.25 * s;
        dst2.z = (m23 + m32) / s;
      } else {
        s = 2 * Math.sqrt(1 + m33 - m11 - m22);
        dst2.w = (m21 - m12) / s;
        dst2.x = (m13 + m31) / s;
        dst2.y = (m23 + m32) / s;
        dst2.z = 0.25 * s;
      }
      return dst2;
    }
    static FromMat3(m, dst2) {
      const te = m.elements;
      const m11 = te[0];
      const m12 = te[3];
      const m13 = te[6];
      const m21 = te[1];
      const m22 = te[4];
      const m23 = te[7];
      const m31 = te[2];
      const m32 = te[5];
      const m33 = te[9];
      const trace = m11 + m22 + m33;
      let s;
      if (trace > 0) {
        s = 0.5 / Math.sqrt(trace + 1);
        dst2.w = 0.25 / s;
        dst2.x = (m32 - m23) * s;
        dst2.y = (m13 - m31) * s;
        dst2.z = (m21 - m12) * s;
      } else if (m11 > m22 && m11 > m33) {
        s = 2 * Math.sqrt(1 + m11 - m22 - m33);
        dst2.w = (m32 - m23) / s;
        dst2.x = 0.25 * s;
        dst2.y = (m12 + m21) / s;
        dst2.z = (m13 + m31) / s;
      } else if (m22 > m33) {
        s = 2 * Math.sqrt(1 + m22 - m11 - m33);
        dst2.w = (m13 - m31) / s;
        dst2.x = (m12 + m21) / s;
        dst2.y = 0.25 * s;
        dst2.z = (m23 + m32) / s;
      } else {
        s = 2 * Math.sqrt(1 + m33 - m11 - m22);
        dst2.w = (m21 - m12) / s;
        dst2.x = (m13 + m31) / s;
        dst2.y = (m23 + m32) / s;
        dst2.z = 0.25 * s;
      }
      return dst2;
    }
    static Slerp(a, b2, t2, dst2) {
      if (t2 === 0) {
        dst2.copy(a);
        return dst2;
      }
      if (t2 === 1) {
        dst2.copy(b2);
        return dst2;
      }
      const x2 = a.x;
      const y2 = a.y;
      const z2 = a.z;
      const w = a.w;
      let cosHalfTheta = w * b2.w + x2 * b2.x + y2 * b2.y + z2 * b2.z;
      if (cosHalfTheta < 0) {
        dst2.w = -b2.w;
        dst2.x = -b2.x;
        dst2.y = -b2.y;
        dst2.z = -b2.z;
        cosHalfTheta = -cosHalfTheta;
      } else {
        dst2.copy(b2);
      }
      if (cosHalfTheta >= 1) {
        dst2.w = w;
        dst2.x = x2;
        dst2.y = y2;
        dst2.z = z2;
        return dst2;
      }
      const sqrSinHalfTheta = 1 - cosHalfTheta * cosHalfTheta;
      if (sqrSinHalfTheta <= Number.EPSILON) {
        const s = 1 - t2;
        dst2.w = s * w + t2 * a.w;
        dst2.x = s * x2 + t2 * a.x;
        dst2.y = s * y2 + t2 * a.y;
        dst2.z = s * z2 + t2 * a.z;
        dst2.normalize();
        return dst2;
      }
      const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
      const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
      const ratioA = Math.sin((1 - t2) * halfTheta) / sinHalfTheta;
      const ratioB = Math.sin(t2 * halfTheta) / sinHalfTheta;
      dst2.w = w * ratioA + b2.w * ratioB;
      dst2.x = x2 * ratioA + b2.x * ratioB;
      dst2.y = y2 * ratioA + b2.y * ratioB;
      dst2.z = z2 * ratioA + b2.z * ratioB;
      return dst2;
    }
    static Normalize(src, dst2) {
      if (dst2 === void 0)
        dst2 = new _Quaternion();
      let l = src.length();
      if (l === 0) {
        dst2.x = 0;
        dst2.y = 0;
        dst2.z = 0;
        dst2.w = 1;
      } else {
        l = 1 / l;
        dst2.x *= l;
        dst2.y *= l;
        dst2.z *= l;
        dst2.w *= l;
      }
      return dst2;
    }
    static Multiply(a, b2, dst2) {
      if (dst2 === void 0)
        dst2 = new _Quaternion();
      const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
      const qbx = b2.x, qby = b2.y, qbz = b2.z, qbw = b2.w;
      dst2.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
      dst2.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
      dst2.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
      dst2.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
      return dst2;
    }
    static FromEuler(e, order = EulerOrder.XYZ, dst2) {
      const x2 = e.x;
      const y2 = e.y;
      const z2 = e.z;
      const cos = Math.cos;
      const sin = Math.sin;
      const c1 = cos(x2 / 2);
      const c2 = cos(y2 / 2);
      const c3 = cos(z2 / 2);
      const s1 = sin(x2 / 2);
      const s2 = sin(y2 / 2);
      const s3 = sin(z2 / 2);
      switch (order) {
        case EulerOrder.XYZ:
          dst2.x = s1 * c2 * c3 + c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 - s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 + s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case EulerOrder.YXZ:
          dst2.x = s1 * c2 * c3 + c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 - s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 - s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case EulerOrder.ZXY:
          dst2.x = s1 * c2 * c3 - c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 + s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 + s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case EulerOrder.ZYX:
          dst2.x = s1 * c2 * c3 - c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 + s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 - s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case EulerOrder.YZX:
          dst2.x = s1 * c2 * c3 + c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 + s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 - s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case EulerOrder.XZY:
          dst2.x = s1 * c2 * c3 - c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 - s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 + s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        default:
          console.warn("unknown order: " + order);
      }
      return dst2;
    }
    static Inverse(src, dst2) {
      dst2.x = -src.x;
      dst2.y = -src.y;
      dst2.z = -src.z;
      dst2.w = src.w;
      return dst2;
    }
  };
  Quaternion.IDENTITY = new Quaternion(0, 0, 0, 1);

  // node_modules/@union_native/core/src/memory/heap.js
  var Heap = class {
    constructor() {
      this.released = [];
      this.heap_size = 4096;
      this.life_cycle = 1024;
      this.life_index = 0;
      this.manage = () => {
        this.life_index = this.life_index++ % this.life_cycle;
      };
      this.buffer = new ArrayBuffer(this.heap_size);
      this.tail = 0;
    }
    alloc(size, constructor) {
      const stride = constructor.BYTES_PER_ELEMENT;
      const start = this.tail;
      const count = size * stride;
      this.tail = this.tail + count + (4 - count % 4);
      return {
        range: { start, count },
        stride,
        buffer: new constructor(this.buffer, start, size)
      };
    }
    free(pointer) {
      this.released.push(pointer.range);
    }
  };
  var MemoryHeap = new Heap();
  function memcycle() {
    MemoryHeap.manage();
  }
  var MAX_B = 1;
  var MAX_KB = MAX_B * 1024;
  var MAX_MB = MAX_KB * 1024;
  var MAX_GB = MAX_MB * 1024;
  var MAX_TB = MAX_GB * 1024;
  var MAX_PB = MAX_TB * 1024;

  // node_modules/@union_native/core/src/math/spherical.js
  var Spherical = class _Spherical {
    constructor(radius, theta, phi) {
      this.radius = radius || 1;
      this.theta = theta || 0;
      this.phi = phi || 0;
      footprint_alloc(3);
    }
    from_float3(v3) {
      this.radius = v3.length;
      if (this.radius === 0) {
        this.theta = 0;
        this.phi = 0;
      } else {
        this.theta = Math.acos(clamp(v3.y / this.radius, -1, 1));
        this.phi = Math.atan2(v3.x, v3.z);
      }
      return this;
    }
    set(radius, theta, phi) {
      this.radius = radius;
      this.theta = theta;
      this.phi = phi;
      return this;
    }
    copy(s) {
      return this.set(s.radius, s.theta, s.phi);
    }
    clone() {
      return new _Spherical(this.radius, this.theta, this.phi);
    }
    lerp(a, i) {
      return _Spherical.Lerp(this, a, i, this);
    }
    static Lerp(start, end, i, dst2) {
      if (dst2 === void 0)
        dst2 = new _Spherical();
      dst2.radius = lerp(start.radius, end.radius, i);
      dst2.theta = lerp(start.theta, end.theta, i);
      dst2.phi = lerp(start.phi, end.phi, i);
      return dst2;
    }
  };

  // node_modules/@union_native/core/src/engine/camera.js
  var rotate_matrix = new Mat4();
  var CameraMode;
  (function(CameraMode2) {
    CameraMode2[CameraMode2["Perspective"] = 0] = "Perspective";
    CameraMode2[CameraMode2["Orthographic"] = 1] = "Orthographic";
  })(CameraMode || (CameraMode = {}));
  var Camera = class {
    set mode(value) {
      this._mode = value;
      if (value === CameraMode.Perspective) {
        this.perspective(this.vertical_fov, this.aspect, this.near, this.far);
      } else {
        this.orthographics(this.vertical_size, this.horizontal_size, this.near, this.far);
      }
    }
    get mode() {
      return this._mode;
    }
    constructor() {
      this._mode = CameraMode.Perspective;
      this.location = new Float3();
      this.rotation = new Quaternion();
      this.scale = new Float3(1, 1, 1);
      this.world_matrix = new Mat4();
      this.local_matrix = new Mat4();
      this.view_matrix = new Mat4();
      this.projection_matrix = new Mat4();
      this.view_projection_matrix = new Mat4();
      this.inverse_projection_matrix = new Mat4();
      this.up = new Float3(0, 1, 0);
      this.vertical_fov = 45;
      this.aspect = 1;
      this.vertical_size = 100;
      this.horizontal_size = 100;
      this.near = 1;
      this.far = 1e4;
      this.perspective(this.vertical_fov, this.aspect, this.near, this.far);
    }
    update_world_matrix() {
      this.world_matrix.compose(this.location, this.rotation, this.scale);
    }
    update_view_matrix() {
      Mat4.Inverse(this.world_matrix, this.view_matrix);
    }
    perspective(fov, aspect, near, far) {
      this.vertical_fov = fov;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
      this.projection_matrix.perspective(fov, aspect, near, far);
      return this.update_projection_matrix();
    }
    orthographics(size_vertical, size_horizontal, near, far) {
      this.near = near;
      this.far = far;
      this.projection_matrix.orthographics(size_vertical, size_horizontal, near, far);
      return this.update_projection_matrix();
    }
    look_at(target, up) {
      up = up || this.up;
      rotate_matrix.look_at(this.location, target, up);
      this.rotation.from_mat4(rotate_matrix);
      this.update_world_matrix();
      this.update_view_matrix();
    }
    copy(camera2) {
      this.location.copy(camera2.location);
      this.rotation.copy(camera2.rotation);
      this.scale.copy(camera2.scale);
      this.local_matrix.copy(camera2.local_matrix);
      this.world_matrix.copy(camera2.world_matrix);
      this.mode = camera2.mode;
      this.vertical_fov = camera2.vertical_fov;
      this.aspect = camera2.aspect;
      this.near = camera2.near;
      this.far = camera2.far;
      this.projection_matrix.copy(camera2.projection_matrix);
      this.view_matrix.copy(camera2.view_matrix);
      return this;
    }
    project(v3) {
      if (v3.x === 0 && v3.y === 0 && v3.z === 0)
        return v3.copy(this.location);
      v3.apply_mat4(this.view_matrix).apply_mat4(this.projection_matrix);
      return v3;
    }
    unproject(v3) {
      v3.apply_mat4(this.inverse_projection_matrix).apply_mat4(this.world_matrix);
      return v3;
    }
    resize(width, height) {
      if (this.mode === CameraMode.Perspective) {
        this.aspect = width / height;
        this.perspective(this.vertical_fov, this.aspect, this.near, this.far);
      } else {
        this.vertical_size = height;
        this.horizontal_size = width;
        this.orthographics(this.vertical_size, this.horizontal_size, this.near, this.far);
      }
      return this;
    }
    update_projection_matrix() {
      if (this._mode === CameraMode.Perspective) {
        this.projection_matrix.perspective(this.vertical_fov, this.aspect, this.near, this.far);
      } else {
        this.projection_matrix.orthographics(this.vertical_size, this.horizontal_size, this.near, this.far);
      }
      this.inverse_projection_matrix.copy(this.projection_matrix).inverse();
      return this;
    }
    fit_box(box) {
      const distance = this.fit_distance(box);
      this.location.sub(box.center).normalize().mul(distance);
      this.look_at(box.center);
    }
    fit_distance(box) {
      const size = box.size;
      const length = size.length;
      return Math.atan(this.vertical_fov * DegreeToRadian * 0.5) * length;
    }
  };
  var view_box = new Box3();

  // node_modules/@union_native/core/src/engine/event.js
  var TypedEvent = class {
    constructor(key) {
      this.key = key;
    }
  };
  var EventNode = class {
    constructor() {
      this.listener_map = /* @__PURE__ */ new Map();
    }
    /**
     * warn:
     *  if event & callback has registered, new listener will replace one
     */
    on(event, callback, scope, once = false) {
      const key = event.key;
      const listener = {
        event: key,
        callback,
        scope: scope || this,
        once
      };
      const listeners = this.listener_map.get(key);
      if (listeners === void 0) {
        this.listener_map.set(key, [listener]);
      } else {
        let contain = false;
        for (let i = 0, l = listeners.length; i < l; ++i) {
          if (listeners[i].event === listener.event && listeners[i].callback === listener.callback) {
            contain = true;
            listeners[i] = listener;
          }
        }
        if (!contain) {
          listeners.push(listener);
        }
      }
    }
    once(event, callback, scope) {
      this.on(event, callback, scope, true);
    }
    off(event, callback, scope, once = false) {
      const key = event.key;
      const listener = {
        event: key,
        callback,
        scope: scope || this,
        once
      };
      const listeners = this.listener_map.get(key);
      if (listeners) {
        for (let i = 0, l = listeners.length; i < l; ++i) {
          if (listeners[i].event === listener.event && listeners[i].callback === listener.callback) {
            listeners.splice(i, 1);
          }
        }
      }
    }
    fire(event, payload) {
      const key = event.key;
      const listeners = this.listener_map.get(key);
      if (listeners) {
        for (let i = listeners.length - 1; i >= 0; --i) {
          const listener = listeners[i];
          if (key === listener.event) {
            listener.callback.bind(listener.scope || this);
            listener.callback(payload);
            if (listener.once) {
              listeners.splice(i, 1);
            }
          }
        }
      }
    }
    dispose() {
      for (const key of this.listener_map.keys()) {
        this.listener_map.delete(key);
      }
    }
  };
  var EventHub = class {
    static on(event, callback, scope) {
      this.node.on(event, callback, scope);
    }
    static once(event, callback, scope) {
      this.node.once(event, callback, scope);
    }
    static fire(event, payload) {
      this.node.fire(event, payload);
    }
    static off(event, callback, scope) {
      this.node.off(event, callback, scope);
    }
  };
  EventHub.node = new EventNode();

  // node_modules/@union_native/core/src/engine/global_event.js
  var GlobalEvent = {
    ForceUpdate: new TypedEvent("force update"),
    FileSystemChanged: new TypedEvent("file system changed"),
    MouseMove: new TypedEvent("mousemove"),
    MouseDrag: new TypedEvent("mousedrag"),
    MouseDown: new TypedEvent("mousedown"),
    MouseUp: new TypedEvent("mouseup"),
    PointerDown: new TypedEvent("pointer down"),
    PointerMove: new TypedEvent("pointer move"),
    PointerUp: new TypedEvent("pointer up"),
    TouchStart: new TypedEvent("touch start"),
    TouchMove: new TypedEvent("touch move"),
    TouchEnd: new TypedEvent("touch end"),
    KeyDown: new TypedEvent("keydown"),
    KeyUp: new TypedEvent("keyup"),
    MouseWheel: new TypedEvent("mousewheel"),
    Resize: new TypedEvent("resize"),
    XRSessionEnd: new TypedEvent("xr session end")
  };

  // node_modules/@union_native/core/src/engine/keycode.js
  var Keycode;
  (function(Keycode2) {
    Keycode2[Keycode2["Break"] = 3] = "Break";
    Keycode2[Keycode2["Backspace"] = 8] = "Backspace";
    Keycode2[Keycode2["Tab"] = 9] = "Tab";
    Keycode2[Keycode2["Clear"] = 12] = "Clear";
    Keycode2[Keycode2["Enter"] = 13] = "Enter";
    Keycode2[Keycode2["Shift"] = 16] = "Shift";
    Keycode2[Keycode2["Ctrl"] = 17] = "Ctrl";
    Keycode2[Keycode2["Alt"] = 18] = "Alt";
    Keycode2[Keycode2["Pause"] = 19] = "Pause";
    Keycode2[Keycode2["CapsLock"] = 20] = "CapsLock";
    Keycode2[Keycode2["Escape"] = 27] = "Escape";
    Keycode2[Keycode2["Space"] = 32] = "Space";
    Keycode2[Keycode2["PageUp"] = 33] = "PageUp";
    Keycode2[Keycode2["PageDown"] = 34] = "PageDown";
    Keycode2[Keycode2["End"] = 35] = "End";
    Keycode2[Keycode2["Home"] = 36] = "Home";
    Keycode2[Keycode2["Left"] = 37] = "Left";
    Keycode2[Keycode2["Up"] = 38] = "Up";
    Keycode2[Keycode2["Right"] = 39] = "Right";
    Keycode2[Keycode2["Down"] = 40] = "Down";
    Keycode2[Keycode2["Select"] = 41] = "Select";
    Keycode2[Keycode2["Print"] = 42] = "Print";
    Keycode2[Keycode2["Execute"] = 43] = "Execute";
    Keycode2[Keycode2["PrintScreen"] = 44] = "PrintScreen";
    Keycode2[Keycode2["Insert"] = 45] = "Insert";
    Keycode2[Keycode2["Delete"] = 46] = "Delete";
    Keycode2[Keycode2["help"] = 47] = "help";
    Keycode2[Keycode2["Key0"] = 48] = "Key0";
    Keycode2[Keycode2["Key1"] = 49] = "Key1";
    Keycode2[Keycode2["Key2"] = 50] = "Key2";
    Keycode2[Keycode2["Key3"] = 51] = "Key3";
    Keycode2[Keycode2["Key4"] = 52] = "Key4";
    Keycode2[Keycode2["Key5"] = 53] = "Key5";
    Keycode2[Keycode2["Key6"] = 54] = "Key6";
    Keycode2[Keycode2["Key7"] = 55] = "Key7";
    Keycode2[Keycode2["Key8"] = 56] = "Key8";
    Keycode2[Keycode2["Key9"] = 57] = "Key9";
    Keycode2[Keycode2["Colon"] = 58] = "Colon";
    Keycode2[Keycode2["Less"] = 60] = "Less";
    Keycode2[Keycode2["At"] = 64] = "At";
    Keycode2[Keycode2["a"] = 65] = "a";
    Keycode2[Keycode2["b"] = 66] = "b";
    Keycode2[Keycode2["c"] = 67] = "c";
    Keycode2[Keycode2["d"] = 68] = "d";
    Keycode2[Keycode2["e"] = 69] = "e";
    Keycode2[Keycode2["f"] = 70] = "f";
    Keycode2[Keycode2["g"] = 71] = "g";
    Keycode2[Keycode2["h"] = 72] = "h";
    Keycode2[Keycode2["i"] = 73] = "i";
    Keycode2[Keycode2["j"] = 74] = "j";
    Keycode2[Keycode2["k"] = 75] = "k";
    Keycode2[Keycode2["l"] = 76] = "l";
    Keycode2[Keycode2["m"] = 77] = "m";
    Keycode2[Keycode2["n"] = 78] = "n";
    Keycode2[Keycode2["o"] = 79] = "o";
    Keycode2[Keycode2["p"] = 80] = "p";
    Keycode2[Keycode2["q"] = 81] = "q";
    Keycode2[Keycode2["r"] = 82] = "r";
    Keycode2[Keycode2["s"] = 83] = "s";
    Keycode2[Keycode2["t"] = 84] = "t";
    Keycode2[Keycode2["u"] = 85] = "u";
    Keycode2[Keycode2["v"] = 86] = "v";
    Keycode2[Keycode2["w"] = 87] = "w";
    Keycode2[Keycode2["x"] = 88] = "x";
    Keycode2[Keycode2["y"] = 89] = "y";
    Keycode2[Keycode2["z"] = 90] = "z";
    Keycode2[Keycode2["LeftCommand"] = 91] = "LeftCommand";
    Keycode2[Keycode2["RightCommand"] = 93] = "RightCommand";
    Keycode2[Keycode2["Sleep"] = 95] = "Sleep";
    Keycode2[Keycode2["Num0"] = 96] = "Num0";
    Keycode2[Keycode2["Num1"] = 97] = "Num1";
    Keycode2[Keycode2["Num2"] = 98] = "Num2";
    Keycode2[Keycode2["Num3"] = 99] = "Num3";
    Keycode2[Keycode2["Num4"] = 100] = "Num4";
    Keycode2[Keycode2["Num5"] = 101] = "Num5";
    Keycode2[Keycode2["Num6"] = 102] = "Num6";
    Keycode2[Keycode2["Num7"] = 103] = "Num7";
    Keycode2[Keycode2["Num8"] = 104] = "Num8";
    Keycode2[Keycode2["Num9"] = 105] = "Num9";
    Keycode2[Keycode2["Multiply"] = 106] = "Multiply";
    Keycode2[Keycode2["Add"] = 107] = "Add";
    Keycode2[Keycode2["Periodic"] = 108] = "Periodic";
    Keycode2[Keycode2["Subtract"] = 109] = "Subtract";
    Keycode2[Keycode2["Point"] = 110] = "Point";
    Keycode2[Keycode2["Divide"] = 111] = "Divide";
    Keycode2[Keycode2["F1"] = 112] = "F1";
    Keycode2[Keycode2["F2"] = 113] = "F2";
    Keycode2[Keycode2["F3"] = 114] = "F3";
    Keycode2[Keycode2["F4"] = 115] = "F4";
    Keycode2[Keycode2["F5"] = 116] = "F5";
    Keycode2[Keycode2["F6"] = 117] = "F6";
    Keycode2[Keycode2["F7"] = 118] = "F7";
    Keycode2[Keycode2["F8"] = 119] = "F8";
    Keycode2[Keycode2["F9"] = 120] = "F9";
    Keycode2[Keycode2["F10"] = 121] = "F10";
    Keycode2[Keycode2["F11"] = 122] = "F11";
    Keycode2[Keycode2["F12"] = 123] = "F12";
    Keycode2[Keycode2["Semicolon"] = 186] = "Semicolon";
    Keycode2[Keycode2["Equal"] = 187] = "Equal";
    Keycode2[Keycode2["Comma"] = 188] = "Comma";
    Keycode2[Keycode2["Minus"] = 189] = "Minus";
    Keycode2[Keycode2["Period"] = 190] = "Period";
    Keycode2[Keycode2["Slash"] = 191] = "Slash";
    Keycode2[Keycode2["BackQuote"] = 192] = "BackQuote";
    Keycode2[Keycode2["BracketL"] = 219] = "BracketL";
    Keycode2[Keycode2["BackSlash"] = 220] = "BackSlash";
    Keycode2[Keycode2["BracketR"] = 221] = "BracketR";
    Keycode2[Keycode2["Quote"] = 222] = "Quote";
  })(Keycode || (Keycode = {}));
  var MouseButton;
  (function(MouseButton2) {
    MouseButton2[MouseButton2["Left"] = 0] = "Left";
    MouseButton2[MouseButton2["Right"] = 2] = "Right";
    MouseButton2[MouseButton2["Middle"] = 1] = "Middle";
  })(MouseButton || (MouseButton = {}));

  // node_modules/@union_native/core/src/input/browser_input.js
  var BrowserInput = class {
    constructor() {
      this.start = new Float2();
      this.drag_start = new Float2();
      this.end = new Float2();
      this.delta = new Float2();
      this.mouse_button = -1;
      this.onmousedown = (event) => {
        window.addEventListener("mousemove", this.onmousedrag, false);
        window.addEventListener("mouseup", this.onmouseup, false);
        this.mouse_button = event.button;
        this.start.set(event.clientX, event.clientY);
        this.drag_start.copy(this.start);
        EventHub.fire(GlobalEvent.MouseDown, {
          button: event.button,
          point: this.start,
          delta: this.delta,
          event
        });
      };
      this.onmousedrag = (event) => {
        this.end.set(event.clientX, event.clientY);
        this.delta.copy(this.end).sub(this.drag_start);
        this.drag_start.copy(this.end);
        EventHub.fire(GlobalEvent.MouseDrag, {
          button: this.mouse_button,
          point: this.end,
          delta: this.delta,
          event
        });
      };
      this.onmousemove = (event) => {
        this.end.set(event.clientX, event.clientY);
        this.delta.copy(this.end).sub(this.start);
        this.start.copy(this.end);
        EventHub.fire(GlobalEvent.MouseMove, {
          button: this.mouse_button,
          point: this.end,
          delta: this.delta,
          event
        });
      };
      this.onmouseup = (event) => {
        window.removeEventListener("mousemove", this.onmousedrag);
        window.removeEventListener("mouseup", this.onmouseup);
        EventHub.fire(GlobalEvent.MouseUp, {
          button: this.mouse_button,
          point: this.end,
          delta: this.delta,
          event
        });
        this.mouse_button = -1;
      };
      this.onmousewheel = (event) => {
        const e = event;
        let delta = 0;
        if (e.wheelDelta !== void 0) {
          delta = e.wheelDelta;
        } else if (e.deltaY !== void 0) {
          delta = -e.deltaY;
        }
        delta = delta > 0 ? 0.95 : 1.05;
        EventHub.fire(GlobalEvent.MouseWheel, { delta, event, delta_y: e.deltaY, delta_x: e.deltaX });
      };
      this.onmousescroll = (event) => {
        let delta_x = 0;
        let delta_y = 0;
        let delta = 0;
        delta = event.detail < 0 ? 0.95 : 1.05;
        if (event.axis === 1) {
          delta_x = -event.detail * 2;
        } else if (event.axis === 2) {
          delta_y = -event.detail * 2;
        }
        EventHub.fire(GlobalEvent.MouseWheel, { delta, event, delta_y, delta_x });
      };
      this.onkeydown = (event) => {
        event.preventDefault();
        EventHub.fire(GlobalEvent.KeyDown, { keycode: event.keyCode, event });
      };
      this.onkeyup = (event) => {
        event.preventDefault();
        EventHub.fire(GlobalEvent.KeyUp, { keycode: event.keyCode, event });
      };
      this.ontouchstart = (event) => {
        const touch = event.touches.item(event.touches.length - 1);
        this.start.set(touch.clientX, touch.clientY);
        this.end.copy(this.start);
        this.mouse_button = 0;
        const payload = {
          button: MouseButton.Left,
          point: this.end,
          delta: this.delta
        };
        EventHub.fire(GlobalEvent.TouchStart, payload);
      };
      this.ontouchmove = (event) => {
        const touch = event.touches.item(event.touches.length - 1);
        this.end.set(touch.clientX, touch.clientY);
        this.delta.copy(this.end).sub(this.start);
        this.start.copy(this.end);
        EventHub.fire(GlobalEvent.TouchMove, {
          button: MouseButton.Left,
          point: this.end,
          delta: this.delta
        });
      };
      this.ontouchend = (event) => {
        if (event.touches.length > 0) {
          const touch = event.touches.item(event.touches.length - 1);
          this.end.set(touch.clientX, touch.clientY);
        }
        const payload = {
          button: MouseButton.Left,
          point: this.end,
          delta: this.delta
        };
        EventHub.fire(GlobalEvent.TouchEnd, payload);
      };
      this.bind(window);
    }
    bind(element) {
      this.unbind();
      element.addEventListener("mousedown", this.onmousedown, false);
      element.addEventListener("mousemove", this.onmousemove, false);
      element.addEventListener("mousewheel", this.onmousewheel, false);
      element.addEventListener("DOMMouseScroll", this.onmousescroll, false);
      document.addEventListener("keydown", this.onkeydown, false);
      document.addEventListener("keyup", this.onkeyup, false);
      element.addEventListener("touchstart", this.ontouchstart, false);
      element.addEventListener("touchmove", this.ontouchmove, false);
      element.addEventListener("touchend", this.ontouchend, false);
      element.addEventListener("touchcancel", this.ontouchend, false);
      this.element = element;
    }
    unbind() {
      if (this.element) {
        this.element.removeEventListener("mousedown", this.onmousedown);
        this.element.removeEventListener("mousemove", this.onmousemove);
        this.element.removeEventListener("mousewheel", this.onmousewheel);
        document.removeEventListener("keydown", this.onkeydown);
        document.removeEventListener("keyup", this.onkeyup);
        this.element.removeEventListener("touchstart", this.ontouchstart);
        this.element.removeEventListener("touchmove", this.ontouchmove);
        this.element.removeEventListener("touchend", this.ontouchend);
        this.element.removeEventListener("touchcancel", this.ontouchend);
      }
    }
  };

  // node_modules/@union_native/core/src/input/input.js
  var InputAxis;
  (function(InputAxis2) {
    InputAxis2[InputAxis2["Horizontal"] = 0] = "Horizontal";
    InputAxis2[InputAxis2["Vertical"] = 1] = "Vertical";
  })(InputAxis || (InputAxis = {}));
  var InputButton;
  (function(InputButton2) {
    InputButton2[InputButton2["Backspace"] = 8] = "Backspace";
    InputButton2[InputButton2["Tab"] = 9] = "Tab";
    InputButton2[InputButton2["Enter"] = 13] = "Enter";
    InputButton2[InputButton2["Shift"] = 16] = "Shift";
    InputButton2[InputButton2["Ctrl"] = 17] = "Ctrl";
    InputButton2[InputButton2["Alt"] = 18] = "Alt";
    InputButton2[InputButton2["Escape"] = 27] = "Escape";
    InputButton2[InputButton2["Left"] = 37] = "Left";
    InputButton2[InputButton2["Up"] = 38] = "Up";
    InputButton2[InputButton2["Right"] = 39] = "Right";
    InputButton2[InputButton2["Down"] = 40] = "Down";
    InputButton2[InputButton2["A"] = 65] = "A";
    InputButton2[InputButton2["B"] = 66] = "B";
    InputButton2[InputButton2["C"] = 67] = "C";
    InputButton2[InputButton2["D"] = 68] = "D";
    InputButton2[InputButton2["E"] = 69] = "E";
    InputButton2[InputButton2["F"] = 70] = "F";
    InputButton2[InputButton2["G"] = 71] = "G";
    InputButton2[InputButton2["H"] = 72] = "H";
    InputButton2[InputButton2["I"] = 73] = "I";
    InputButton2[InputButton2["J"] = 74] = "J";
    InputButton2[InputButton2["K"] = 75] = "K";
    InputButton2[InputButton2["L"] = 76] = "L";
    InputButton2[InputButton2["M"] = 77] = "M";
    InputButton2[InputButton2["N"] = 78] = "N";
    InputButton2[InputButton2["O"] = 79] = "O";
    InputButton2[InputButton2["P"] = 80] = "P";
    InputButton2[InputButton2["Q"] = 81] = "Q";
    InputButton2[InputButton2["R"] = 82] = "R";
    InputButton2[InputButton2["S"] = 83] = "S";
    InputButton2[InputButton2["T"] = 84] = "T";
    InputButton2[InputButton2["U"] = 85] = "U";
    InputButton2[InputButton2["V"] = 86] = "V";
    InputButton2[InputButton2["W"] = 87] = "W";
    InputButton2[InputButton2["X"] = 88] = "X";
    InputButton2[InputButton2["Y"] = 89] = "Y";
    InputButton2[InputButton2["Z"] = 90] = "Z";
    InputButton2[InputButton2["Meta"] = 91] = "Meta";
    InputButton2[InputButton2["Delete"] = 127] = "Delete";
  })(InputButton || (InputButton = {}));
  var Input = class _Input {
    static Instance() {
      return this._instance || (this._instance = new _Input());
    }
    set_axis(axis, value) {
      this.axis_map[axis] = value;
    }
    get_axis(axis) {
      return this.axis_map[axis] || 0;
    }
    constructor() {
      this.axis_map = {};
      this.key_map = /* @__PURE__ */ new Set();
      this.onkeydown = (payload) => {
        const keycode = payload.keycode;
        if (keycode === InputButton.Up) {
          this.set_axis(InputAxis.Vertical, 1);
        } else if (keycode === InputButton.Down) {
          this.set_axis(InputAxis.Vertical, -1);
        } else if (keycode === InputButton.Left) {
          this.set_axis(InputAxis.Horizontal, -1);
        } else if (keycode === InputButton.Right) {
          this.set_axis(InputAxis.Horizontal, 1);
        }
        this.key_map.add(keycode);
      };
      this.onkeyup = (payload) => {
        const keycode = payload.keycode;
        if (keycode === InputButton.Up || keycode === InputButton.Down) {
          this.set_axis(InputAxis.Vertical, 0);
        } else if (keycode === InputButton.Left || keycode === InputButton.Right) {
          this.set_axis(InputAxis.Horizontal, 0);
        }
        this.key_map.delete(keycode);
      };
      EventHub.on(GlobalEvent.KeyDown, this.onkeydown);
      EventHub.on(GlobalEvent.KeyUp, this.onkeyup);
    }
    get_button(button) {
      return this.key_map.has(button);
    }
  };

  // node_modules/@union_native/core/src/engine/engine.js
  var EngineEvent = {
    BeforeTick: new TypedEvent("before tick"),
    AfterTick: new TypedEvent("after tick"),
    BeforeFrame: new TypedEvent("before frame"),
    AfterFrame: new TypedEvent("after frame"),
    Frame: new TypedEvent("frame")
  };
  var Engine = class {
    // delta_time in seconds from last frame to now
    get abs_delta_time() {
      return performance.now() * 1e-3 - this.last_time;
    }
    constructor() {
      this.swap_chain = -1;
      this.frame_index = 0;
      this.time = performance.now() * 1e-3;
      this.last_time = performance.now() * 1e-3;
      this.delta_time = performance.now() * 1e-3;
      this.paused = true;
      this.tick = () => {
        this.time = performance.now() * 1e-3;
        this.delta_time = this.time - this.last_time;
        EventHub.fire(EngineEvent.BeforeTick);
        EventHub.fire(EngineEvent.BeforeFrame);
        EventHub.fire(EngineEvent.Frame);
        EventHub.fire(EngineEvent.AfterFrame);
        EventHub.fire(EngineEvent.AfterTick);
        this.last_time = this.time;
        memcycle();
        this.swap_chain = requestAnimationFrame(this.tick);
      };
      this.input = Input.Instance();
      this.mouse_input = new BrowserInput();
      EventHub.on(GlobalEvent.XRSessionEnd, () => {
        if (this.paused)
          this.start();
      });
    }
    start() {
      this.tick();
      this.paused = false;
    }
    pause() {
      cancelAnimationFrame(this.swap_chain);
      this.paused = true;
    }
    terminate() {
    }
  };

  // node_modules/@union_native/core/src/engine/frame_capture.js
  var FrameCaptureNode = class extends PolyNode {
    constructor() {
      super(...arguments);
      this.name = "anonymous";
      this.type = FrameCaptureNodeType.None;
    }
  };
  var FrameCaptureNodeType;
  (function(FrameCaptureNodeType2) {
    FrameCaptureNodeType2[FrameCaptureNodeType2["None"] = 0] = "None";
    FrameCaptureNodeType2[FrameCaptureNodeType2["Pass"] = 1] = "Pass";
    FrameCaptureNodeType2[FrameCaptureNodeType2["Pipeline"] = 2] = "Pipeline";
    FrameCaptureNodeType2[FrameCaptureNodeType2["ConstantBuffer"] = 3] = "ConstantBuffer";
    FrameCaptureNodeType2[FrameCaptureNodeType2["Draw"] = 4] = "Draw";
    FrameCaptureNodeType2[FrameCaptureNodeType2["Mesh"] = 5] = "Mesh";
  })(FrameCaptureNodeType || (FrameCaptureNodeType = {}));
  var Profiler = class {
    constructor() {
      this.root = this.node = new FrameCaptureNode();
    }
    trace_start(name, description, data, type = FrameCaptureNodeType.None) {
      const start = performance.now();
      const node = new FrameCaptureNode();
      node.name = name;
      node.start = start;
      node.description = description;
      node.data = data;
      node.type = type;
      this.node.add(node);
      this.node = node;
    }
    trace_end(name) {
      const nodes = [];
      let top = this.node;
      while (top && top.name !== name) {
        nodes.push(top);
        top = top.parent;
      }
      if (top === void 0) {
        throw `invalid trace end ${name}`;
      } else {
        const end = performance.now();
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.end = end;
        }
        top.end = end;
        this.node = top.parent;
      }
    }
    reset() {
      this.root = this.node = new FrameCaptureNode();
      this.root.start = performance.now();
    }
  };

  // node_modules/@union_native/core/src/gfx/gfx_type.js
  var GFXRenderGroup;
  (function(GFXRenderGroup2) {
    GFXRenderGroup2[GFXRenderGroup2["Opaque"] = 0] = "Opaque";
    GFXRenderGroup2[GFXRenderGroup2["AlphaClip"] = 1] = "AlphaClip";
    GFXRenderGroup2[GFXRenderGroup2["Transparent"] = 2] = "Transparent";
    GFXRenderGroup2[GFXRenderGroup2["Overlay"] = 3] = "Overlay";
  })(GFXRenderGroup || (GFXRenderGroup = {}));

  // node_modules/@union_native/core/src/adt/block_allocator.js
  var BlockAllocator = class {
    constructor(block_size) {
      this.block_size = block_size;
      this.tail = 0;
      this.heap_size = 0;
      this.valid_set = /* @__PURE__ */ new Set();
      this.free_set = /* @__PURE__ */ new Set();
      this.free_size = 0;
    }
    allocate(count) {
      const byte_offset = this.tail;
      const byte_length = count * this.block_size;
      this.tail += byte_length;
      this.heap_size = Math.max(this.heap_size, this.tail);
      return { byte_offset, byte_length };
    }
    free(range) {
      this.free_set.add(range);
      this.free_size += range.byte_length;
    }
    rearrange() {
      this.free_set.clear();
      let offset = 0;
      for (const range of this.valid_set) {
        range.byte_offset = offset;
        offset += range.byte_length;
      }
      this.tail = offset;
      this.heap_size = Math.max(this.heap_size, this.tail);
    }
  };

  // node_modules/@union_native/metal.js/src/index.ts
  var Shared = 0;
  var Managed = 1;
  var Private = 2;
  var Memoryless = 3;
  var DefaultCacheMode = 0;
  var WriteCombined = 1;
  var DefaultHazardTrackingMode = 0;
  var Untracked = 1;
  var Tracked = 2;
  var ResourceCPUCacheModeShift = 0;
  var ResourceStorageModeShift = 4;
  var ResourceHazardTrackingModeShift = 8;
  var ResourceStorageModeShared = Shared << ResourceStorageModeShift;
  var ResourceStorageModeManaged = Managed << ResourceStorageModeShift;
  var ResourceStorageModePrivate = Private << ResourceStorageModeShift;
  var ResourceStorageModeMemoryLess = Memoryless << ResourceStorageModeShift;
  var ResourceTrackingModeDefault = DefaultHazardTrackingMode << ResourceHazardTrackingModeShift;
  var ResourceTrackingModeUntracked = Untracked << ResourceHazardTrackingModeShift;
  var ResourceTrackingModeTracked = Tracked << ResourceHazardTrackingModeShift;
  var ResourceCPUCacheModeDefault = DefaultCacheMode << ResourceCPUCacheModeShift;
  var ResourceCPUCacheModeWriteCombined = WriteCombined << ResourceCPUCacheModeShift;

  // node_modules/@union_native/core/src/metal/encoder.js
  var MetalEncoder = class {
    constructor(options) {
    }
    set_display_size(width, height) {
    }
    set_viewport(x2, y2, width, height) {
    }
    set_camera(camera2) {
    }
    set_time(t2) {
    }
    set_pass(pass, description) {
    }
    set_clear_color(color) {
    }
    clear(action) {
    }
    set_pipeline(pipeline2) {
    }
    set_scissor(x2, y2, width, height) {
    }
    set_material(material, description) {
    }
    set_material_block(material, description) {
    }
    set_draw(draw, chunk, description) {
    }
    set_mesh(mesh) {
    }
    draw_mesh(mesh, description) {
    }
    draw_submesh(submesh, description) {
    }
    commit() {
    }
  };

  // node_modules/@union_native/core/src/gfx/render.command.js
  var RenderCommandType;
  (function(RenderCommandType2) {
    RenderCommandType2[RenderCommandType2["CreateDevice"] = 0] = "CreateDevice";
    RenderCommandType2[RenderCommandType2["DeviceResize"] = 1] = "DeviceResize";
    RenderCommandType2[RenderCommandType2["GetExtension"] = 2] = "GetExtension";
    RenderCommandType2[RenderCommandType2["CreateTexture"] = 3] = "CreateTexture";
    RenderCommandType2[RenderCommandType2["CreateBuffer"] = 4] = "CreateBuffer";
    RenderCommandType2[RenderCommandType2["CreateDraw"] = 5] = "CreateDraw";
    RenderCommandType2[RenderCommandType2["CreatePipeline"] = 6] = "CreatePipeline";
    RenderCommandType2[RenderCommandType2["CreatePass"] = 7] = "CreatePass";
    RenderCommandType2[RenderCommandType2["ShareBuffer"] = 8] = "ShareBuffer";
    RenderCommandType2[RenderCommandType2["UpdateTexture"] = 9] = "UpdateTexture";
    RenderCommandType2[RenderCommandType2["UpdateBuffer"] = 10] = "UpdateBuffer";
    RenderCommandType2[RenderCommandType2["ExecuteCommandBuffer"] = 11] = "ExecuteCommandBuffer";
    RenderCommandType2[RenderCommandType2["ExecuteCommandQueue"] = 12] = "ExecuteCommandQueue";
  })(RenderCommandType || (RenderCommandType = {}));
  var command_handlers = /* @__PURE__ */ new Map();
  function render_command_handler_get(type) {
    return command_handlers.get(type);
  }

  // node_modules/@union_native/core/src/gfx/render.worker.js
  function post_message_error(task_id, data, message) {
    const event = { task_id, success: false, message, data };
    self.postMessage(event);
  }
  function render_worker_command_message(message) {
    const task_id = message.data.task_id;
    const command = message.data;
    const handler = render_command_handler_get(command.type);
    if (handler) {
      console.log(`<RenderThreadWebGL> execute id: ${task_id} type: ${RenderCommandType[command.type]}`);
      handler(command);
    } else {
      const { type } = command;
      post_message_error(task_id, { type }, `Command handler for type ${command.type} not found.`);
    }
  }

  // node_modules/@union_native/core/src/webgpu/device.js
  self.onmessage = render_worker_command_message;

  // node_modules/@union_native/core/src/webgpu/encoder.js
  var WebGPUEncoder = class {
    constructor(options) {
    }
    set_display_size(width, height) {
    }
    set_viewport(x2, y2, width, height) {
    }
    set_camera(camera2) {
    }
    set_action(action) {
    }
    set_pass(pass, description) {
    }
    set_clear_color(color) {
    }
    clear(action) {
    }
    set_pipeline(pipeline2) {
    }
    set_scissor(x2, y2, width, height) {
    }
    set_material(material, description) {
    }
    set_material_block(material, description) {
    }
    set_draw(draw, chunk, description) {
    }
    set_mesh(mesh) {
    }
    draw_mesh(mesh, description) {
    }
    draw_submesh(submesh, description) {
    }
    commit() {
    }
  };

  // node_modules/@union_native/core/src/gfx/gfx_device.js
  var GFXBackend;
  (function(GFXBackend2) {
    GFXBackend2["WebGL"] = "public/src/worker/webgl.render/wgl.worker.js";
    GFXBackend2["WebGPU"] = "public/src/worker/webgpu.render/wgpu.worker.js";
    GFXBackend2["Metal"] = "public/src/worker/metal.render/mtl.worker.js";
  })(GFXBackend || (GFXBackend = {}));
  var GPUActionType;
  (function(GPUActionType2) {
    GPUActionType2[GPUActionType2["ClearColor"] = 1] = "ClearColor";
    GPUActionType2[GPUActionType2["ClearDepth"] = 2] = "ClearDepth";
    GPUActionType2[GPUActionType2["ClearStencil"] = 4] = "ClearStencil";
    GPUActionType2[GPUActionType2["ClearAll"] = 7] = "ClearAll";
    GPUActionType2[GPUActionType2["Ignore"] = 8] = "Ignore";
  })(GPUActionType || (GPUActionType = {}));
  var default_clear_action = {
    type: GPUActionType.ClearAll,
    clear_color: new ColorRGBA(0, 0, 0, 0),
    clear_depth: 1
  };
  var GPUStorageMode;
  (function(GPUStorageMode2) {
    GPUStorageMode2[GPUStorageMode2["Shared"] = 0] = "Shared";
    GPUStorageMode2[GPUStorageMode2["GPUOnly"] = 1] = "GPUOnly";
    GPUStorageMode2[GPUStorageMode2["Memoryless"] = 2] = "Memoryless";
  })(GPUStorageMode || (GPUStorageMode = {}));
  var GFXDevice = class _GFXDevice {
    static CurrentDevice() {
      return _GFXDevice.current_device;
    }
    constructor(options = {}) {
      this.width = 1;
      this.height = 1;
      this.display_ratio = 1;
      this.display_width = 1;
      this.display_height = 1;
      this.backend = GFXBackend.WebGL;
      _GFXDevice.current_device = this;
      this.display_ratio = options.display_ratio ?? 1;
      this.backend = options.backend ?? GFXBackend.WebGL;
      if (options.backend === GFXBackend.Metal) {
        this.encoder = new MetalEncoder(options);
      } else if (options.backend === GFXBackend.WebGPU) {
        this.encoder = new WebGPUEncoder(options);
      } else {
        this.encoder = new WebGLEncoder(options);
        this.set_size(window.innerWidth, window.innerHeight);
      }
      console.log(`<GPUDevice> active backend: ${this.backend}`);
      this.encoder.set_viewport(0, 0, this.width, this.height);
      create_block_global();
    }
    set_size(width, height) {
      this.display_width = width;
      this.display_height = height;
      const pixel_width = Math.floor(width * this.display_ratio);
      const pixel_height = Math.floor(height * this.display_ratio);
      this.width = pixel_width;
      this.height = pixel_height;
      this.encoder.set_display_size(pixel_width, pixel_height);
      this.encoder.set_viewport(0, 0, pixel_width, pixel_height);
      EventHub.fire(GlobalEvent.Resize, { width, height });
      return this;
    }
  };
  function gfx_device_get() {
    return GFXDevice.CurrentDevice();
  }
  function gfx_encoder_get() {
    return gfx_device_get().encoder;
  }

  // node_modules/@union_native/core/src/std/type.js
  function is_string(obj) {
    return typeof obj === "string" || obj instanceof String;
  }
  function default_value(value, default_value2) {
    return value === void 0 ? default_value2 : value;
  }

  // node_modules/@union_native/core/src/worker/web_worker.js
  var WorkerState;
  (function(WorkerState2) {
    WorkerState2[WorkerState2["Idle"] = 0] = "Idle";
    WorkerState2[WorkerState2["Running"] = 1] = "Running";
  })(WorkerState || (WorkerState = {}));
  var WebWorker = class {
    get available() {
      return this.state === WorkerState.Idle;
    }
    constructor(worker, auto_terminate = false) {
      this.worker = worker;
      this.auto_terminate = auto_terminate;
      this.state = WorkerState.Idle;
      this.queue = [];
      this.worker_name = "anonymous";
      this.task_id = 0;
      this.callbacks = /* @__PURE__ */ new Map();
      this.onmessage = (event) => {
        this.state = WorkerState.Idle;
        const response = event.data;
        const { task_id } = response;
        if (!response.success) {
          console.error(`<WebWorker> error: ${response.message || "undefined worker error"}`);
        } else {
          console.log(`<WebWorker> worker ${this.worker_name} execute success.`);
        }
        if (this.on_response)
          this.on_response(response);
        if (task_id !== void 0 && this.callbacks.has(task_id)) {
          const callback = this.callbacks.get(task_id);
          if (response.success)
            callback(response.data);
          this.callbacks.delete(task_id);
        }
        if (this.queue.length > 0) {
          const request = this.queue.shift();
          this.send(request.message, request.buffers, request.callback);
        } else {
          if (this.auto_terminate) {
            this.worker.terminate();
          }
        }
      };
      this.worker.onmessage = this.onmessage;
    }
    send(message, buffers, callback) {
      const task_id = this.task_id++;
      message.task_id = task_id;
      if (this.state !== WorkerState.Idle) {
        this.queue.push({ message, buffers, callback });
        return false;
      }
      this.worker.postMessage(message, buffers);
      this.worker.onmessage = this.onmessage;
      if (callback)
        this.callbacks.set(task_id, callback);
      return true;
    }
    send_async(message, buffers = []) {
      return new Promise((resolve) => {
        this.send(message, buffers, resolve);
      });
    }
  };

  // node_modules/@union_native/core/src/gfx/gfx_device_client.js
  var GFXDeviceClient = class {
    get_resource_id() {
      return this.resource_id++;
    }
    constructor(backend) {
      this.backend = backend;
      this.resource_id = 0;
      const worker = new Worker(backend, { name: "RenderThread" });
      this.render_thread = new WebWorker(worker);
    }
    create_device(canvas, options) {
      const offscreen_canvas = canvas.transferControlToOffscreen();
      const resource_id = this.get_resource_id();
      const command = { resource_id, type: RenderCommandType.CreateDevice, canvas: offscreen_canvas, options };
      this.render_thread.send(command, [offscreen_canvas]);
      return resource_id;
    }
    create_texture(descriptor) {
      const resource_id = this.get_resource_id();
      const command = { resource_id, type: RenderCommandType.CreateTexture, descriptor };
      const buffers = texture_descriptor_collect_buffer(descriptor);
      this.render_thread.send(command, buffers);
      return resource_id;
    }
    update_texture(resource_id) {
    }
    resize(width, height, pixel_width, pixel_height) {
      const type = RenderCommandType.DeviceResize;
      const command = { type, width, height, pixel_width, pixel_height };
      this.render_thread.send(command);
    }
  };
  function texture_descriptor_collect_buffer(descriptor) {
    const { source, mipmaps } = descriptor;
    const buffers = [];
    const buffer_set = /* @__PURE__ */ new Set();
    if (source && !is_string(source)) {
      buffers.push(source.buffer);
      buffer_set.add(source.buffer);
    }
    for (const mipmap of mipmaps) {
      if (mipmap && !is_string(mipmap) && !buffer_set.has(mipmap.data.buffer)) {
        buffers.push(mipmap.data.buffer);
        buffer_set.add(mipmap.data.buffer);
      }
    }
    return buffers;
  }

  // node_modules/@union_native/core/src/gfx/render.resource.js
  var RenderResourceType;
  (function(RenderResourceType2) {
    RenderResourceType2[RenderResourceType2["Device"] = 0] = "Device";
    RenderResourceType2[RenderResourceType2["Buffer"] = 1] = "Buffer";
    RenderResourceType2[RenderResourceType2["SharedBuffer"] = 2] = "SharedBuffer";
    RenderResourceType2[RenderResourceType2["Texture"] = 3] = "Texture";
    RenderResourceType2[RenderResourceType2["Draw"] = 4] = "Draw";
    RenderResourceType2[RenderResourceType2["Pipeline"] = 5] = "Pipeline";
    RenderResourceType2[RenderResourceType2["Pass"] = 6] = "Pass";
  })(RenderResourceType || (RenderResourceType = {}));

  // node_modules/@union_native/core/src/webgl/block.js
  var RenderBlockType;
  (function(RenderBlockType2) {
    RenderBlockType2[RenderBlockType2["Frame"] = 0] = "Frame";
    RenderBlockType2[RenderBlockType2["Object"] = 1] = "Object";
    RenderBlockType2[RenderBlockType2["Material"] = 2] = "Material";
  })(RenderBlockType || (RenderBlockType = {}));
  var RenderBlockName;
  (function(RenderBlockName2) {
    RenderBlockName2["Frame"] = "frame_block";
    RenderBlockName2["Object"] = "object_block";
    RenderBlockName2["Material"] = "material_block";
  })(RenderBlockName || (RenderBlockName = {}));
  var BLOCK_MINOR_BUFFER_SIZE = 4 * 1024;
  var BLOCK_MAJOR_BUFFER_SIZE = 16 * 1024;
  var block_context;
  function create_block_global() {
    const device2 = gfx_device_get().encoder;
    const gl = device2.gl;
    function create_unform_buffer(size) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
      gl.bufferData(gl.UNIFORM_BUFFER, size, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
      return buffer;
    }
    const map = /* @__PURE__ */ new Map();
    const block_stride = device2.UNIFORM_BUFFER_ALIGNMENT;
    const frame_block = {
      buffer: create_unform_buffer(BLOCK_MINOR_BUFFER_SIZE),
      data: new FlexBufferView(new ArrayBuffer(BLOCK_MINOR_BUFFER_SIZE)),
      allocator: new BlockAllocator(block_stride)
    };
    map.set(RenderBlockType.Frame, frame_block);
    const object_block = {
      buffer: create_unform_buffer(BLOCK_MINOR_BUFFER_SIZE),
      data: new FlexBufferView(new ArrayBuffer(BLOCK_MINOR_BUFFER_SIZE)),
      allocator: new BlockAllocator(block_stride)
    };
    map.set(RenderBlockType.Object, object_block);
    const material_block = {
      buffer: create_unform_buffer(BLOCK_MAJOR_BUFFER_SIZE),
      data: new FlexBufferView(new ArrayBuffer(BLOCK_MAJOR_BUFFER_SIZE)),
      allocator: new BlockAllocator(block_stride)
    };
    map.set(RenderBlockType.Material, material_block);
    block_context = {
      blocks: map
    };
  }
  function create_block(type, size, name) {
    if (!block_context)
      throw "create_block_global has not been called";
    const block = block_context.blocks.get(type);
    const block_count = Math.ceil(size / block.allocator.block_size);
    const range = block_context.blocks.get(type).allocator.allocate(block_count);
    const view = block_context.blocks.get(type).data.sub_view(range);
    return { range, type, view, name };
  }
  function upload_block(block) {
    if (!block_context)
      throw "create_block_global has not been called";
    if (!block)
      return;
    const encoder2 = gfx_device_get().encoder;
    const gl = encoder2.gl;
    const block_data = block_context.blocks.get(block.type);
    gl.bindBuffer(gl.UNIFORM_BUFFER, block_data.buffer);
    gl.bufferSubData(gl.UNIFORM_BUFFER, block.range.byte_offset, block.view.u8_view, 0, block.view.u8_view.byteLength);
  }
  function block_bind(pipeline2, block) {
    const encoder2 = gfx_device_get().encoder;
    const gl = encoder2.gl;
    const block_type = block.type;
    const block_data = block_context.blocks.get(block_type);
    const struct_uniform = pipeline2.uniform_block[block.name];
    gl.uniformBlockBinding(pipeline2.program, struct_uniform.struct_index, struct_uniform.struct_index);
    gl.bindBufferRange(gl.UNIFORM_BUFFER, struct_uniform.struct_index, block_data.buffer, block.range.byte_offset, block.range.byte_length);
  }

  // node_modules/@union_native/core/src/webgl/type.js
  var WebGLTextureFilter;
  /* @__PURE__ */ (function(WebGLTextureFilter2) {
  })(WebGLTextureFilter || (WebGLTextureFilter = {}));
  var WebGLTextureWrapping;
  /* @__PURE__ */ (function(WebGLTextureWrapping2) {
  })(WebGLTextureWrapping || (WebGLTextureWrapping = {}));
  var WebGLDataType;
  /* @__PURE__ */ (function(WebGLDataType2) {
  })(WebGLDataType || (WebGLDataType = {}));
  var UnsignedByteType = 5121;
  var ByteType = 5120;
  var ShortType = 5122;
  var UnsignedShortType = 5123;
  var IntType = 5124;
  var UnsignedIntType = 5125;
  var FloatType = 5126;
  var HalfFloatType = 5131;
  var WebGLPixelFormat;
  /* @__PURE__ */ (function(WebGLPixelFormat2) {
  })(WebGLPixelFormat || (WebGLPixelFormat = {}));
  var WebGLCompressedWebGLPixelFormat;
  /* @__PURE__ */ (function(WebGLCompressedWebGLPixelFormat2) {
  })(WebGLCompressedWebGLPixelFormat || (WebGLCompressedWebGLPixelFormat = {}));
  var TextureStoreFormat;
  /* @__PURE__ */ (function(TextureStoreFormat2) {
  })(TextureStoreFormat || (TextureStoreFormat = {}));
  var WebGLTextureType;
  /* @__PURE__ */ (function(WebGLTextureType2) {
  })(WebGLTextureType || (WebGLTextureType = {}));
  var WebGLBufferType;
  /* @__PURE__ */ (function(WebGLBufferType2) {
  })(WebGLBufferType || (WebGLBufferType = {}));
  var WebGLBufferUsage;
  /* @__PURE__ */ (function(WebGLBufferUsage2) {
  })(WebGLBufferUsage || (WebGLBufferUsage = {}));

  // node_modules/@union_native/core/src/webgl/draw.js
  function get_gl_buffer_type(buffer) {
    if (buffer instanceof Float32Array) {
      return FloatType;
    } else if (buffer instanceof Int16Array) {
      return ShortType;
    } else if (buffer instanceof Int32Array) {
      return IntType;
    } else if (buffer instanceof Int8Array) {
      return ByteType;
    } else if (buffer instanceof Uint16Array) {
      return UnsignedShortType;
    } else if (buffer instanceof Uint32Array) {
      return UnsignedIntType;
    } else if (buffer instanceof Uint8Array) {
      return UnsignedByteType;
    }
    throw `invalid buffer type ${typeof buffer}.`;
  }

  // node_modules/@union_native/core/src/webgl/extensions.js
  var extensions = {};
  function get_extension(gl, name) {
    if (extensions[name] !== void 0) {
      return extensions[name];
    }
    let extension;
    switch (name) {
      case "WEBGL_depth_texture":
        extension = gl.getExtension("WEBGL_depth_texture") || gl.getExtension("MOZ_WEBGL_depth_texture") || gl.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        extension = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        extension = gl.getExtension("WEBGL_compressed_texture_s3tc") || gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        extension = gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        extension = gl.getExtension(name);
    }
    if (extension === null) {
      console.log(`<WebGLExtension> Extension: ${name} not supported.`);
    } else {
      console.log(`<WebGLExtension> Extension: ${name} found.`);
    }
    extensions[name] = extension;
    return extension;
  }

  // node_modules/@union_native/core/src/webgl/pass.js
  var PassLoadAction;
  (function(PassLoadAction2) {
    PassLoadAction2[PassLoadAction2["DontCare"] = 0] = "DontCare";
    PassLoadAction2[PassLoadAction2["Clear"] = 1] = "Clear";
  })(PassLoadAction || (PassLoadAction = {}));

  // node_modules/@union_native/core/src/std/numeric.js
  function count_decimal_bit(n2) {
    let c = 1;
    while (Math.abs(n2) >= 10) {
      n2 /= 10;
      c++;
    }
    return c;
  }

  // node_modules/@union_native/core/src/webgl/texture_slot.js
  var webgl_texture_slot_index = 0;
  var webgl_texture_slot_cache = /* @__PURE__ */ new Map();
  function webgl_texture_slot_reset() {
    webgl_texture_slot_index = 0;
    webgl_texture_slot_cache.clear();
  }
  function webgl_texture_slot_request(texture) {
    const id = texture.id;
    if (webgl_texture_slot_cache.has(id)) {
      return webgl_texture_slot_cache.get(id);
    } else {
      const slot = webgl_texture_slot_index++;
      webgl_texture_slot_cache.set(id, slot);
      return slot;
    }
  }

  // node_modules/@union_native/core/src/webgl/pipeline.js
  var _pipeline_id = 0;
  function get_pipeline_id() {
    return _pipeline_id++;
  }
  var PrimitiveType;
  (function(PrimitiveType2) {
    PrimitiveType2[PrimitiveType2["Points"] = 0] = "Points";
    PrimitiveType2[PrimitiveType2["Lines"] = 1] = "Lines";
    PrimitiveType2[PrimitiveType2["LineLoop"] = 2] = "LineLoop";
    PrimitiveType2[PrimitiveType2["LineStrip"] = 3] = "LineStrip";
    PrimitiveType2[PrimitiveType2["Triangles"] = 4] = "Triangles";
    PrimitiveType2[PrimitiveType2["TriangleStrip"] = 5] = "TriangleStrip";
    PrimitiveType2[PrimitiveType2["TriangleFan"] = 6] = "TriangleFan";
  })(PrimitiveType || (PrimitiveType = {}));
  var UniformType;
  (function(UniformType2) {
    UniformType2[UniformType2["Bool"] = 0] = "Bool";
    UniformType2[UniformType2["Float"] = 1] = "Float";
    UniformType2[UniformType2["Float2"] = 2] = "Float2";
    UniformType2[UniformType2["Float3"] = 3] = "Float3";
    UniformType2[UniformType2["Float4"] = 4] = "Float4";
    UniformType2[UniformType2["UnsignedInteger"] = 5] = "UnsignedInteger";
    UniformType2[UniformType2["Integer"] = 6] = "Integer";
    UniformType2[UniformType2["ColorRGBA"] = 7] = "ColorRGBA";
    UniformType2[UniformType2["Mat3"] = 8] = "Mat3";
    UniformType2[UniformType2["Mat4"] = 9] = "Mat4";
    UniformType2[UniformType2["Texture2D"] = 10] = "Texture2D";
    UniformType2[UniformType2["TextureCube"] = 11] = "TextureCube";
    UniformType2[UniformType2["Texture2DArray"] = 12] = "Texture2DArray";
    UniformType2[UniformType2["Texture3D"] = 13] = "Texture3D";
    UniformType2[UniformType2["Struct"] = 14] = "Struct";
  })(UniformType || (UniformType = {}));
  var CullMode;
  (function(CullMode2) {
    CullMode2[CullMode2["None"] = 0] = "None";
    CullMode2[CullMode2["Front"] = 1028] = "Front";
    CullMode2[CullMode2["Back"] = 1029] = "Back";
  })(CullMode || (CullMode = {}));
  var DepthCompareFunc;
  (function(DepthCompareFunc2) {
    DepthCompareFunc2[DepthCompareFunc2["Never"] = 0] = "Never";
    DepthCompareFunc2[DepthCompareFunc2["Less"] = 512] = "Less";
    DepthCompareFunc2[DepthCompareFunc2["Equal"] = 514] = "Equal";
    DepthCompareFunc2[DepthCompareFunc2["LessEqual"] = 515] = "LessEqual";
    DepthCompareFunc2[DepthCompareFunc2["Greater"] = 516] = "Greater";
    DepthCompareFunc2[DepthCompareFunc2["NotEqual"] = 517] = "NotEqual";
    DepthCompareFunc2[DepthCompareFunc2["GreaterEqual"] = 518] = "GreaterEqual";
    DepthCompareFunc2[DepthCompareFunc2["Always"] = 519] = "Always";
  })(DepthCompareFunc || (DepthCompareFunc = {}));
  var BlendFactor;
  (function(BlendFactor2) {
    BlendFactor2[BlendFactor2["SrcAlpha"] = 770] = "SrcAlpha";
    BlendFactor2[BlendFactor2["SrcColor"] = 768] = "SrcColor";
    BlendFactor2[BlendFactor2["DstAlpha"] = 772] = "DstAlpha";
    BlendFactor2[BlendFactor2["DstColor"] = 774] = "DstColor";
    BlendFactor2[BlendFactor2["One"] = 1] = "One";
    BlendFactor2[BlendFactor2["Zero"] = 0] = "Zero";
    BlendFactor2[BlendFactor2["OneMinusSrcAlpha"] = 771] = "OneMinusSrcAlpha";
    BlendFactor2[BlendFactor2["OneMinusSrcColor"] = 769] = "OneMinusSrcColor";
    BlendFactor2[BlendFactor2["OneMinusDstAlpha"] = 773] = "OneMinusDstAlpha";
    BlendFactor2[BlendFactor2["OneMinusDstColor"] = 775] = "OneMinusDstColor";
    BlendFactor2[BlendFactor2["OneMinusConstAlpha"] = 32772] = "OneMinusConstAlpha";
    BlendFactor2[BlendFactor2["OneMinusConstColor"] = 32770] = "OneMinusConstColor";
    BlendFactor2[BlendFactor2["ConstColor"] = 32769] = "ConstColor";
    BlendFactor2[BlendFactor2["ConstAlpha"] = 32771] = "ConstAlpha";
    BlendFactor2[BlendFactor2["SrcAlphaSaturate"] = 776] = "SrcAlphaSaturate";
  })(BlendFactor || (BlendFactor = {}));
  var BlendFunc;
  (function(BlendFunc2) {
    BlendFunc2[BlendFunc2["Add"] = 32774] = "Add";
    BlendFunc2[BlendFunc2["Subtract"] = 32778] = "Subtract";
    BlendFunc2[BlendFunc2["ReverseSubtract"] = 32779] = "ReverseSubtract";
  })(BlendFunc || (BlendFunc = {}));
  var VertexOrder;
  (function(VertexOrder2) {
    VertexOrder2[VertexOrder2["ClockWise"] = 2304] = "ClockWise";
    VertexOrder2[VertexOrder2["CounterClockWise"] = 2305] = "CounterClockWise";
  })(VertexOrder || (VertexOrder = {}));
  var version = "#version 300 es\nprecision highp float;\n";
  var version_reg = /#version/;
  var skip_internal_precision_define = /#define skip_global_precision/;
  var usampler_reg = /uniform usampler2D/;
  var sampler_2d_reg = /uniform sampler2D/;
  var sampler_2d_shadow_reg = /uniform sampler2DShadow/;
  var sampler_cube_reg = /uniform samplerCube/;
  var include_reg = /#pragma include ([A-z]{1}[A-z0-9]+)/g;
  function precision_declaration(source) {
    let output = "";
    if (source.search(skip_internal_precision_define) > -1) {
      return output;
    }
    if (source.search(usampler_reg) > -1) {
      output += "precision highp usampler2D;\n";
    }
    if (source.search(sampler_2d_reg) > -1) {
      output += "precision highp sampler2D;\n";
    }
    if (source.search(sampler_2d_shadow_reg) > -1) {
      output += "precision highp sampler2DShadow;\n";
    }
    if (source.search(sampler_cube_reg) > -1) {
      output += "precision highp samplerCube;\n";
    }
    return output;
  }
  function parse_include(source, libraries) {
    let matches;
    const replacers = [];
    while ((matches = include_reg.exec(source)) != null) {
      replacers.push({ block: matches[0], lib: matches[1] });
    }
    for (const replacer of replacers) {
      const library = libraries[replacer.lib] ?? `// module not found ${replacer.lib}`;
      source = source.replace(replacer.block, library);
    }
    return source;
  }
  function create_pipeline(descriptor) {
    const gl = gfx_encoder_get().gl;
    let vertex_shader = default_value(descriptor.vertex_shader, "");
    let fragment_shader = default_value(descriptor.fragment_shader, "");
    let libraries = default_value(descriptor.libraries, {});
    let name = default_value(descriptor.name, "unnamed pipeline");
    console.log(`create pipeline ${name}`);
    let blend = default_value(descriptor.blend, {});
    blend.enabled = default_value(blend.enabled, false);
    blend.src_alpha_factor = default_value(blend.src_alpha_factor, BlendFactor.One);
    blend.dst_alpha_factor = default_value(blend.dst_alpha_factor, BlendFactor.OneMinusSrcAlpha);
    blend.src_color_factor = default_value(blend.src_color_factor, BlendFactor.SrcAlpha);
    blend.dst_color_factor = default_value(blend.dst_color_factor, BlendFactor.OneMinusSrcAlpha);
    blend.color_func = default_value(blend.color_func, BlendFunc.Add);
    blend.alpha_func = default_value(blend.alpha_func, BlendFunc.Add);
    let depth_compare_func = default_value(descriptor.depth_compare_func, DepthCompareFunc.LessEqual);
    let depth_write = default_value(descriptor.depth_write, true);
    let vertex_order = default_value(descriptor.vertex_order, VertexOrder.CounterClockWise);
    let cull_mode = default_value(descriptor.cull_mode, CullMode.Back);
    if (descriptor.combined_shader) {
      const parts = descriptor.combined_shader.split(/#define SPLITTER/);
      vertex_shader += parts[0];
      fragment_shader += parts[1];
    }
    if (!vertex_shader)
      throw "invalid vertex shader source.";
    if (!fragment_shader)
      throw "invalid fragment shader source.";
    let vertex_header = vertex_shader.search(version_reg) > -1 ? "" : version;
    let fragment_header = fragment_shader.search(version_reg) > -1 ? "" : version;
    const defines = descriptor.defines || [];
    for (let i = 0; i < defines.length; ++i) {
      vertex_header += `#define ${defines[i]} 1
`;
      fragment_header += `#define ${defines[i]} 1
`;
    }
    vertex_shader = parse_include(vertex_shader, libraries);
    fragment_shader = parse_include(fragment_shader, libraries);
    vertex_header += precision_declaration(vertex_shader);
    fragment_header += precision_declaration(fragment_shader);
    vertex_shader = vertex_header + vertex_shader;
    fragment_shader = fragment_header + fragment_shader;
    const program = gl.createProgram();
    if (program === null) {
      console.warn(`pipeline ${name} create error`);
      return null;
    }
    const vertex_shader_handle = build_shader(gl, vertex_shader, gl.VERTEX_SHADER);
    if (vertex_shader_handle === null) {
      console.warn(`pipeline ${name} vertex shader compile error`);
      return null;
    }
    const fragment_shader_handle = build_shader(gl, fragment_shader, gl.FRAGMENT_SHADER);
    if (fragment_shader_handle === null) {
      console.warn(`pipeline ${name} fragment shader compile error`);
      return null;
    }
    gl.attachShader(program, vertex_shader_handle);
    gl.attachShader(program, fragment_shader_handle);
    gl.linkProgram(program);
    const uniforms = [];
    const pipeline2 = {
      name,
      valid: true,
      id: get_pipeline_id(),
      vertex_shader,
      fragment_shader,
      program,
      uniform_block: {},
      uniforms,
      cull_mode,
      depth_compare_func,
      depth_write,
      vertex_order,
      blend
    };
    pipeline_bind_uniform(pipeline2, descriptor.uniforms ?? []);
    return pipeline2;
  }
  function pipeline_bind_uniform(pipeline2, descriptors) {
    const struct_uniform_map = /* @__PURE__ */ new Map();
    const { uniform_block, uniforms, program } = pipeline2;
    const encoder2 = gfx_device_get().encoder;
    const gl = encoder2.gl;
    if (uniforms) {
      for (let i = 0; i < descriptors.length; ++i) {
        const uniform_desc = descriptors[i];
        const { name, type, visible, default_value: default_value2 } = uniform_desc;
        if (name.search(/\./) > -1) {
          const struct_name = name.split(/\./)[0];
          let struct_uniforms = struct_uniform_map.get(struct_name);
          if (!struct_uniforms) {
            struct_uniforms = [uniform_desc];
            struct_uniform_map.set(struct_name, struct_uniforms);
          } else {
            struct_uniforms.push(uniform_desc);
          }
          continue;
        }
        const location = gl.getUniformLocation(program, name);
        if (!location) {
          continue;
        }
        let upload;
        switch (type) {
          case UniformType.Float:
            upload = upload_float.bind(void 0, gl, location);
            break;
          case UniformType.Float2:
            upload = upload_float2.bind(void 0, gl, location);
            break;
          case UniformType.Float3:
            upload = upload_float3.bind(void 0, gl, location);
            break;
          case UniformType.UnsignedInteger:
            upload = upload_uint.bind(void 0, gl, location);
            break;
          case UniformType.Integer:
            upload = upload_int.bind(void 0, gl, location);
          case UniformType.ColorRGBA:
          case UniformType.Float4:
            upload = upload_float4.bind(void 0, gl, location);
            break;
          case UniformType.Mat3:
            upload = upload_mat3.bind(void 0, gl, location);
            break;
          case UniformType.Mat4:
            upload = upload_mat4.bind(void 0, gl, location);
            break;
          case UniformType.Texture2DArray:
          case UniformType.Texture2D:
            upload = upload_texture2d.bind(void 0, gl, location);
            break;
          case UniformType.TextureCube:
            upload = upload_texture_cube.bind(void 0, gl, location);
            break;
          default:
            throw new Error(`invalid uniform type: ${type}`);
        }
        const gl_uniform = { name, upload, type };
        gl_uniform.visible = visible ?? false;
        if (default_value2 !== void 0)
          gl_uniform.default_value = default_value2;
        uniform_block[name] = gl_uniform;
        uniforms.push(gl_uniform);
      }
    }
    for (const [struct_name, struct_uniforms] of struct_uniform_map) {
      if (struct_uniforms.length <= 0)
        continue;
      const struct_index = gl.getUniformBlockIndex(program, struct_name);
      const struct_size = gl.getActiveUniformBlockParameter(program, struct_index, gl.UNIFORM_BLOCK_DATA_SIZE);
      const names = struct_uniforms.map((uniform) => uniform.name.split(/\./)[1]);
      const indices = gl.getUniformIndices(program, names).filter((value, index) => {
        if (value > gl.ACTIVE_UNIFORMS) {
          console.warn(`struct uniform ${struct_name}.${names[index]} not found.`);
          return false;
        }
        return true;
      });
      const struct_uniform = {
        name: struct_name,
        type: UniformType.Struct,
        visible: false,
        struct_index,
        struct_size,
        items: {}
      };
      const offsets = gl.getActiveUniforms(program, indices, gl.UNIFORM_OFFSET);
      for (let i = 0; i < struct_uniforms.length; ++i) {
        const { name, type, visible, default_value: default_value2 } = struct_uniforms[i];
        const byte_offset = offsets[i];
        const byte_size = uniform_byte_size(type);
        const item_name = name.split(/\./)[1];
        const item = { name: item_name, type, visible, default_value: default_value2, byte_offset, byte_size };
        struct_uniform.items[item_name] = item;
      }
      uniform_block[struct_name] = struct_uniform;
      uniforms.push(struct_uniform);
    }
    const frame_block = uniform_block[RenderBlockName.Frame];
    if (frame_block) {
      const encoder3 = gfx_device_get().encoder;
      const ubo_alignment = encoder3.UNIFORM_BUFFER_ALIGNMENT;
      const size = Math.ceil(frame_block.struct_size / ubo_alignment) * ubo_alignment;
      pipeline2.frame_block = create_block(RenderBlockType.Frame, size, RenderBlockName.Frame);
    }
  }
  var unroll_pattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
  function loop_replacer(_, start, end, snippet) {
    let string = "";
    for (let i = parseInt(start); i < parseInt(end); i++) {
      string += snippet.replace(/\[\s*i\s*\]/g, "[" + i + "]").replace(/UNROLLED_LOOP_INDEX/g, i.toString());
    }
    return string;
  }
  function build_shader(gl, source, type) {
    source = source.replace(unroll_pattern, loop_replacer);
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const shaderInfo = gl.getShaderInfoLog(shader);
    if (shaderInfo != "") {
      const lines = source.split("\n");
      const line_count = lines.length;
      const max_bit = count_decimal_bit(line_count);
      console.warn(lines.map((l, i) => {
        return `${" ".repeat(max_bit - count_decimal_bit(i + 1))}${i + 1}|${l}`;
      }).join("\n"));
      console.warn(`shader error info:
${shaderInfo}`);
      return null;
    }
    return shader;
  }
  function uniform_byte_size(type) {
    switch (type) {
      case UniformType.Bool:
      case UniformType.Float:
      case UniformType.UnsignedInteger:
      case UniformType.Integer:
        return 4;
      case UniformType.Float2:
        return 8;
      case UniformType.Float3:
        return 12;
      case UniformType.ColorRGBA:
      case UniformType.Float4:
        return 16;
      case UniformType.Mat3:
        return 36;
      case UniformType.Mat4:
        return 64;
      case UniformType.Texture2D:
      case UniformType.TextureCube:
      case UniformType.Texture2DArray:
      case UniformType.Texture3D:
        return 4;
      default:
        throw new Error(`invalid uniform type: ${type}`);
    }
  }
  function upload_float(gl, location, value) {
    if (value instanceof Float32Array) {
      gl.uniform1fv(location, value);
    } else {
      gl.uniform1f(location, value);
    }
  }
  function upload_float2(gl, location, value) {
    if (value instanceof Float32Array) {
      gl.uniform2fv(location, value);
    } else {
      gl.uniform2fv(location, value.elements);
    }
  }
  function upload_float3(gl, location, value) {
    if (value instanceof Float32Array) {
      gl.uniform3fv(location, value);
    } else {
      gl.uniform3fv(location, value.elements);
    }
  }
  function upload_float4(gl, location, value) {
    if (value instanceof Float32Array) {
      gl.uniform4fv(location, value);
    } else {
      gl.uniform4fv(location, value.elements);
    }
  }
  function upload_uint(gl, location, value) {
    gl.uniform1ui(location, value);
  }
  function upload_int(gl, location, value) {
    gl.uniform1i(location, value);
  }
  function upload_mat3(gl, location, value) {
    if (value instanceof Float32Array) {
      gl.uniformMatrix3fv(location, false, value);
    } else {
      gl.uniformMatrix3fv(location, false, value.elements);
    }
  }
  function upload_mat4(gl, location, value) {
    if (value instanceof Float32Array) {
      gl.uniformMatrix4fv(location, false, value);
    } else {
      gl.uniformMatrix4fv(location, false, value.elements);
    }
  }
  function upload_texture2d(gl, location, texture) {
    if (!texture)
      return;
    const slot = webgl_texture_slot_request(texture);
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(texture.texture_type, texture.webgl_texture);
    gl.uniform1i(location, slot);
  }
  function upload_texture_cube(gl, location, texture) {
    if (!texture)
      return;
    const slot = webgl_texture_slot_request(texture);
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(texture.texture_type, texture.webgl_texture);
    gl.uniform1i(location, slot);
  }

  // node_modules/@union_native/core/src/webgl/encoder.js
  var WebGLEncoder = class {
    constructor(options) {
      this.last_viewport = new Rect();
      this.viewport = new Rect();
      this.profiler = new Profiler();
      this.recording = false;
      this.clear_action = {
        type: GPUActionType.ClearAll,
        clear_color: new ColorRGBA(0, 0, 0, 0),
        clear_depth: 1
      };
      this.uniform_cache = /* @__PURE__ */ new Map();
      this.width = 1;
      this.height = 1;
      this.multi_thread_rendering = false;
      this.set_draw = (draw, object, description) => {
        if (this.recording)
          this.profiler.trace_start("set draw", description, draw, FrameCaptureNodeType.Draw);
        const gl2 = this.gl;
        if (this.pipeline === void 0)
          throw new Error("No active pipeline");
        const pipeline2 = this.pipeline;
        const pip_uniforms = pipeline2.uniforms;
        for (let i = 0; i < pip_uniforms.length; ++i) {
          const pip_uniform = pip_uniforms[i];
          const name = pip_uniform.name;
          let uniform;
          if (object?.material_block?.has_property(name)) {
            uniform = object.material_block.get_property(name);
          } else {
            uniform = draw.uniforms[name] || pipeline2.uniform_block[name].default_value;
          }
          const cached_uniform = this.uniform_cache.get(name);
          if (cached_uniform === uniform && !draw.force_update.has(name))
            continue;
          if (this.recording)
            this.profiler.trace_start("upload uniform", `${name} ${uniform}`, uniform, FrameCaptureNodeType.ConstantBuffer);
          if (uniform !== void 0)
            pip_uniform.upload(uniform);
          if (this.recording)
            this.profiler.trace_end("upload uniform");
          this.uniform_cache.set(name, uniform);
        }
        const struct_uniform = pipeline2.uniform_block[RenderBlockName.Object];
        const render_object = object?.render_block;
        if (render_object && struct_uniform) {
          block_bind(pipeline2, render_object);
        }
        if (draw.webgl_vao === void 0)
          return;
        gl2.bindVertexArray(draw.webgl_vao);
        if (draw.range !== void 0) {
          if (draw.indexed) {
            gl2.drawElements(draw.type, draw.range.count, gl2.UNSIGNED_INT, draw.range.start);
          } else {
            gl2.drawArrays(draw.type, draw.range.start, draw.range.count);
          }
        } else {
          if (draw.indexed) {
            gl2.drawElements(draw.type, draw.max_vertex_count, gl2.UNSIGNED_INT, 0);
          } else {
            gl2.drawArrays(draw.type, 0, draw.max_vertex_count);
          }
        }
        if (this.recording)
          this.profiler.trace_end("set draw");
      };
      const gl_options = {};
      gl_options.preserveDrawingBuffer = options.preserve_buffer === true || options.preserveDrawingBuffer === true;
      gl_options.antialias = options.antialias === true;
      gl_options.powerPreference = options.powerPreference ?? "high-performance";
      gl_options.xrCompatible = options.xr_enabled === true;
      const canvas = options.canvas ?? document.getElementsByTagName("canvas")[0];
      if (!canvas)
        throw new Error("canvas not found.");
      this.canvas = canvas;
      this.multi_thread_rendering = options.multi_thread_rendering === true;
      let gl = canvas.getContext("webgl2", gl_options);
      if (gl === null)
        throw `webgl2 wasn't supported.`;
      this.gl = gl;
      get_extension(gl, "OES_texture_float_linear");
      get_extension(gl, "EXT_color_buffer_float");
      get_extension(gl, "WEBGL_multi_draw");
      this.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      this.MAX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      this.MAX_RENDERBUFFER_SIZE = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
      this.UNIFORM_BUFFER_ALIGNMENT = gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT);
      this.UNIFORM_BUFFER_SIZE = gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE);
      if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 1)
        throw `vertex texture not supported.`;
      if (options.multi_thread_rendering && "OffscreenCanvas" in window && "SharedArrayBuffer" in window) {
        const backend = options.backend ?? GFXBackend.WebGL;
        this.client = new GFXDeviceClient(backend);
        this.client.create_device(document.getElementById("render"), options);
      }
    }
    set_display_size(width, height) {
      this.width = width;
      this.height = height;
      this.canvas.width = width;
      this.canvas.height = height;
    }
    set_camera(camera2) {
      this.camera = camera2;
      this.uniform_cache.clear();
      this.update_frame_uniform();
    }
    set_pass(pass, description) {
      this.last_viewport.copy(this.viewport);
      const gl = this.gl;
      if (!pass) {
        if (this.current_pass === void 0)
          return;
        if (this.recording) {
          if (this.current_pass)
            this.profiler.trace_end("set pass");
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.set_viewport(0, 0, this.width, this.height);
        this.current_pass = void 0;
        return;
      }
      if (this.current_pass === pass) {
        return;
      }
      if (this.current_pass !== void 0 && this.recording)
        this.profiler.trace_end("set pass");
      if (this.recording)
        this.profiler.trace_start("set pass", description || pass.name, pass, FrameCaptureNodeType.Pass);
      gl.bindFramebuffer(gl.FRAMEBUFFER, pass.webgl_framebuffer);
      this.set_viewport(0, 0, pass.width, pass.height);
      let mask = 0;
      if (pass.color_load_action === PassLoadAction.Clear) {
        const color = pass.clear_color;
        gl.clearColor(color.r, color.g, color.b, color.a);
        mask |= gl.COLOR_BUFFER_BIT;
      }
      if (pass.depth_load_action === PassLoadAction.Clear) {
        gl.clearDepth(pass.clear_depth);
        mask |= gl.DEPTH_BUFFER_BIT;
      }
      if (mask !== 0)
        gl.clear(mask);
      this.last_pass = this.current_pass;
      this.current_pass = pass;
      this.uniform_cache.clear();
    }
    set_clear_color(color) {
      this.clear_action.clear_color.copy(color);
    }
    clear(action) {
      if (!action)
        action = this.clear_action;
      if (action.type === GPUActionType.Ignore)
        return;
      if ((action.type & GPUActionType.ClearColor) !== 0) {
        this.gl.clearColor(action.clear_color.r, action.clear_color.g, action.clear_color.b, action.clear_color.a);
      }
      this.gl.clearDepth(action.clear_depth);
      let mask = 0;
      if ((action.type & GPUActionType.ClearColor) !== 0)
        mask |= this.gl.COLOR_BUFFER_BIT;
      if ((action.type & GPUActionType.ClearDepth) !== 0)
        mask |= this.gl.DEPTH_BUFFER_BIT;
      if ((action.type & GPUActionType.ClearStencil) !== 0)
        mask |= this.gl.STENCIL_BUFFER_BIT;
      this.gl.clear(mask);
    }
    set_viewport(x2, y2, width, height) {
      width = Math.max(0, width);
      height = Math.max(0, height);
      this.last_viewport.copy(this.viewport);
      this.viewport.set(x2, y2, width, height);
      this.gl.viewport(x2, y2, width, height);
    }
    set_pipeline(pipeline2) {
      if (!pipeline2.valid) {
        console.error(`using invalid pipeline ${pipeline2.name ?? ""}`);
        return;
      }
      webgl_texture_slot_reset();
      if (this.pipeline === pipeline2) {
        return;
      }
      const gl = this.gl;
      if (this.recording)
        this.profiler.trace_start("set pipeline", pipeline2.name, pipeline2, FrameCaptureNodeType.Pipeline);
      gl.useProgram(pipeline2.program);
      const { cull_mode, depth_write, depth_compare_func, vertex_order, blend } = pipeline2;
      if (this.pipeline === void 0 || cull_mode !== this.pipeline.cull_mode) {
        if (depth_compare_func === DepthCompareFunc.Never || cull_mode == CullMode.None) {
          gl.disable(gl.CULL_FACE);
        } else {
          gl.enable(gl.CULL_FACE);
          gl.cullFace(cull_mode);
        }
      }
      if (this.pipeline === void 0 || depth_compare_func !== this.pipeline.depth_compare_func) {
        if (depth_compare_func === DepthCompareFunc.Never) {
          gl.disable(gl.DEPTH_TEST);
        } else {
          gl.enable(gl.DEPTH_TEST);
          gl.depthFunc(depth_compare_func);
        }
      }
      if (this.pipeline === void 0 || depth_write !== this.pipeline.depth_write) {
        gl.depthMask(depth_write);
      }
      if (this.pipeline === void 0 || vertex_order !== this.pipeline.vertex_order) {
        gl.frontFace(vertex_order);
      }
      if (this.pipeline === void 0 || blend.enabled !== this.pipeline.blend.enabled) {
        if (blend && blend.enabled) {
          gl.enable(gl.BLEND);
        } else {
          gl.disable(gl.BLEND);
        }
      }
      if (this.pipeline === void 0 || blend.src_color_factor !== this.pipeline.blend.src_color_factor || blend.dst_color_factor !== this.pipeline.blend.dst_color_factor || blend.src_alpha_factor !== this.pipeline.blend.src_alpha_factor || blend.dst_alpha_factor !== this.pipeline.blend.dst_alpha_factor || blend.color_func !== this.pipeline.blend.color_func || blend.alpha_func !== this.pipeline.blend.alpha_func) {
        gl.blendFuncSeparate(blend.src_color_factor, blend.dst_color_factor, blend.src_alpha_factor, blend.dst_alpha_factor);
        gl.blendEquationSeparate(blend.color_func, blend.alpha_func);
      }
      this.pipeline = pipeline2;
      this.uniform_cache.clear();
      const frame_block = pipeline2.uniform_block[RenderBlockName.Frame];
      if (frame_block && pipeline2.frame_block) {
        block_bind(pipeline2, pipeline2.frame_block);
      }
      for (const uniform of pipeline2.uniforms) {
        const name = uniform.name;
        const uniform_value = uniform.default_value;
        if (uniform_value !== void 0)
          uniform.upload(uniform_value);
        this.uniform_cache.set(name, uniform_value);
      }
      if (this.recording)
        this.profiler.trace_end("set pipeline");
    }
    update_frame_uniform() {
      if (!this.camera || !this.pipeline)
        return;
      const frame_block = this.pipeline.frame_block;
      const frame_struct = this.pipeline.uniform_block[RenderBlockName.Frame];
      if (!frame_block || !frame_struct)
        return;
      this.camera.view_matrix.write(frame_block?.view.f32_view, frame_struct.items["view_matrix"].byte_offset / 4);
      this.camera.projection_matrix.write(frame_block?.view.f32_view, frame_struct.items["projection_matrix"].byte_offset / 4);
      if (this.pipeline.frame_block) {
        upload_block(frame_block);
        block_bind(this.pipeline, this.pipeline.frame_block);
      }
    }
    set_scissor(x2, y2, width, height, description) {
      const gl = this.gl;
      if (x2 === void 0) {
        gl.disable(gl.SCISSOR_TEST);
      } else {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(x2, y2, width, height);
      }
    }
    set_material(material, description) {
    }
    set_material_block(material, description) {
      if (this.pipeline === void 0)
        return;
      if (this.recording)
        this.profiler.trace_start("set material block", description);
      const pipeline2 = this.pipeline;
      const pip_uniforms = pipeline2.uniforms;
      for (let i = 0; i < pip_uniforms.length; ++i) {
        const pip_uniform = pip_uniforms[i];
        const name = pip_uniform.name;
        if (!material.has_property(name))
          continue;
        const uniform = material.get_property(name);
        if (this.recording)
          this.profiler.trace_start("upload uniform", `${name} ${uniform}`, uniform, FrameCaptureNodeType.ConstantBuffer);
        if (uniform !== void 0)
          pip_uniform.upload(uniform);
        if (this.recording)
          this.profiler.trace_end("upload uniform");
        this.uniform_cache.set(name, uniform);
      }
      if (this, this.recording)
        this.profiler.trace_end("set material block");
    }
    set_mesh(mesh, description) {
      const gl = this.gl;
      if (this.recording)
        this.profiler.trace_start("set mesh", description);
      gl.bindVertexArray(mesh.vao);
      if (this.recording)
        this.profiler.trace_end("set mesh");
    }
    draw_mesh(mesh, description) {
      const gl = this.gl;
      if (this.recording)
        this.profiler.trace_start("draw mesh", description, mesh, FrameCaptureNodeType.Mesh);
      gl.bindVertexArray(mesh.vao);
      for (let i = 0; i < mesh.sub_meshes.length; ++i) {
        if (mesh.indexed) {
          gl.drawElements(PrimitiveType.Triangles, mesh.index_count, gl.UNSIGNED_INT, 0);
        } else {
          gl.drawArrays(PrimitiveType.Triangles, 0, mesh.vertex_count);
        }
      }
      if (this.recording)
        this.profiler.trace_end("draw mesh");
    }
    draw_submesh(mesh) {
      const gl = this.gl;
      if (this.recording)
        this.profiler.trace_start("draw sub mesh");
      if (mesh.indexed) {
        gl.drawElements(PrimitiveType.Triangles, mesh.index_count, gl.UNSIGNED_INT, mesh.index_start);
      } else {
        gl.drawArrays(PrimitiveType.Triangles, mesh.index_start, mesh.index_count);
      }
    }
    commit() {
      this.pipeline = void 0;
      webgl_texture_slot_reset();
      this.uniform_cache.clear();
    }
  };

  // node_modules/@union_native/core/src/engine/spherical_control.js
  var SphericalControl = class {
    constructor(camera2) {
      this.camera = camera2;
      this.enabled = true;
      this.movable = true;
      this.interpolated_spherical = new Spherical();
      this.current_spherical = new Spherical();
      this.center = new Float3();
      this.interpolated_center = new Float3();
      this.damping = 0.45;
      this.location = new Float3();
      this.interpolated_location = new Float3();
      this.rotate_speed = Math.PI * 2;
      this.zoom_speed = 1;
      this.move_speed = 2;
      this.min_polar_angle = 1e-3;
      this.max_polar_angle = Math.PI;
      this.changed = false;
      this.set_target(camera2.location);
      camera2.look_at(this.center);
    }
    set_target(location) {
      this.location.copy(location);
      this.current_spherical.from_float3(this.location);
      this.interpolated_spherical.copy(this.current_spherical);
      this.interpolated_center.copy(this.center);
      this.changed = true;
    }
    set_center(location) {
      this.center.copy(location);
    }
    rotate_horizontal(angle) {
      this.current_spherical.phi += angle * this.rotate_speed;
      if (angle !== 0)
        this.changed = true;
    }
    rotate_vertical(angle) {
      this.current_spherical.theta = clamp(this.current_spherical.theta - angle * this.rotate_speed, this.min_polar_angle, this.max_polar_angle);
      if (angle !== 0)
        this.changed = true;
    }
    move(delta) {
      if (!this.movable)
        return;
      const vector = pool_get(Float3);
      vector.set(delta.x, delta.y, 0).mul(this.current_spherical.radius * this.move_speed);
      this.center.add(vector.apply_quaternion(this.camera.rotation));
      if (delta.x !== 0 || delta.y !== 0)
        this.changed = true;
      pool_return(vector);
    }
    zoom(scale) {
      this.current_spherical.radius *= scale * this.zoom_speed;
      if (scale !== 1)
        this.changed = true;
    }
    update() {
      if (!this.enabled)
        return false;
      this.interpolated_spherical.lerp(this.current_spherical, this.damping);
      this.interpolated_location.from_spherical(this.interpolated_spherical);
      this.interpolated_center.lerp(this.center, this.damping);
      this.interpolated_location.add(this.interpolated_center);
      this.location.copy(this.interpolated_location);
      this.camera.location.copy(this.location);
      this.camera.look_at(this.interpolated_center);
      let changed = this.changed;
      this.changed = false;
      return changed;
    }
  };

  // node_modules/@union_native/core/src/engine/vertex_data.js
  function vertex_data_compute_box(data, box) {
    box = box ?? new Box3();
    const v3 = pool_get(Float3);
    if (data.position) {
      const buffer = data.position;
      const end = buffer.length;
      for (let i = 0; i < end; i += 3) {
        v3.set(buffer[i], buffer[i + 1], buffer[i + 2]);
        box.expand_point(v3);
      }
    }
    return box;
  }
  var _vertex_v = new Float3();

  // node_modules/@union_native/core/src/webgl/mesh.js
  var GenericAttributeName;
  (function(GenericAttributeName2) {
    GenericAttributeName2["position"] = "position";
    GenericAttributeName2["uv"] = "uv";
    GenericAttributeName2["normal"] = "normal";
    GenericAttributeName2["tangent"] = "tangent";
    GenericAttributeName2["joint"] = "joint";
    GenericAttributeName2["weight"] = "weight";
    GenericAttributeName2["color"] = "color";
    GenericAttributeName2["uv2"] = "uv2";
    GenericAttributeName2["uv3"] = "uv3";
    GenericAttributeName2["uv4"] = "uv4";
    GenericAttributeName2["uv5"] = "uv5";
    GenericAttributeName2["uv6"] = "uv6";
  })(GenericAttributeName || (GenericAttributeName = {}));
  function get_generic_attribute_slot(name) {
    switch (name) {
      case GenericAttributeName.position:
        return 0;
      case GenericAttributeName.uv:
        return 1;
      case GenericAttributeName.normal:
        return 2;
      case GenericAttributeName.tangent:
        return 3;
      case GenericAttributeName.joint:
        return 4;
      case GenericAttributeName.weight:
        return 5;
      case GenericAttributeName.color:
        return 6;
      case GenericAttributeName.uv2:
        return 7;
      case GenericAttributeName.uv3:
        return 8;
      case GenericAttributeName.uv4:
        return 9;
      case GenericAttributeName.uv5:
        return 10;
      case GenericAttributeName.uv6:
        return 11;
    }
  }
  var gpu_meshes = /* @__PURE__ */ new WeakMap();
  function create_gpu_mesh(mesh) {
    const cached = gpu_meshes.get(mesh);
    if (cached)
      return cached;
    const encoder2 = gfx_device_get().encoder;
    const gl = encoder2.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const { vertex_data, sub_meshes } = mesh;
    function upload_buffer(data, slot, size) {
      const type = get_gl_buffer_type(data);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      if (type === FloatType || type === HalfFloatType) {
        gl.vertexAttribPointer(slot, size, type, false, 0, 0);
      } else {
        gl.vertexAttribIPointer(slot, size, type, 0, 0);
      }
      gl.enableVertexAttribArray(slot);
    }
    const box = vertex_data_compute_box(vertex_data);
    if (vertex_data.position)
      upload_buffer(vertex_data.position, get_generic_attribute_slot(GenericAttributeName.position), 3);
    if (vertex_data.uv)
      upload_buffer(vertex_data.uv, get_generic_attribute_slot(GenericAttributeName.uv), 2);
    if (vertex_data.normal)
      upload_buffer(vertex_data.normal, get_generic_attribute_slot(GenericAttributeName.normal), 3);
    if (vertex_data.tangent)
      upload_buffer(vertex_data.tangent, get_generic_attribute_slot(GenericAttributeName.tangent), 4);
    if (vertex_data.joint)
      upload_buffer(vertex_data.joint, get_generic_attribute_slot(GenericAttributeName.joint), 4);
    if (vertex_data.weight)
      upload_buffer(vertex_data.weight, get_generic_attribute_slot(GenericAttributeName.weight), 4);
    if (vertex_data.color)
      upload_buffer(vertex_data.color, get_generic_attribute_slot(GenericAttributeName.color), 4);
    if (vertex_data.uv2)
      upload_buffer(vertex_data.uv2, get_generic_attribute_slot(GenericAttributeName.uv2), 2);
    if (vertex_data.uv3)
      upload_buffer(vertex_data.uv3, get_generic_attribute_slot(GenericAttributeName.uv3), 2);
    if (vertex_data.uv4)
      upload_buffer(vertex_data.uv4, get_generic_attribute_slot(GenericAttributeName.uv4), 2);
    if (vertex_data.uv5)
      upload_buffer(vertex_data.uv5, get_generic_attribute_slot(GenericAttributeName.uv5), 2);
    if (vertex_data.uv6)
      upload_buffer(vertex_data.uv6, get_generic_attribute_slot(GenericAttributeName.uv6), 2);
    let indexed = false;
    if (vertex_data.index) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertex_data.index, gl.STATIC_DRAW);
      indexed = true;
    }
    const vertex_count = vertex_data.position ? vertex_data.position.length / 3 : 0;
    const index_count = vertex_data.index ? vertex_data.index.length : vertex_count;
    gl.bindVertexArray(null);
    const gpu_mesh = { vao, sub_meshes, indexed, box, vertex_count, index_count };
    gpu_meshes.set(mesh, gpu_mesh);
    return gpu_mesh;
  }

  // node_modules/@union_native/core/src/webgl/primitive.js
  function primitive_get_attribute(primitive, name = GenericAttributeName.position) {
    if (primitive.attributes === void 0 || primitive.attributes.length < 1) {
      return null;
    }
    for (let i = 0; i < primitive.attributes.length; ++i) {
      const attr = primitive.attributes[i];
      if (attr.name === name) {
        return attr;
      }
    }
    return null;
  }
  function set_attribute(primitive, attribute) {
    if (attribute === void 0) {
      return;
    }
    const old = primitive_get_attribute(primitive, attribute.name);
    if (old === null) {
      primitive.attributes.push(attribute);
    } else {
      old.name = attribute.name;
      old.stride = attribute.stride;
      old.buffer = attribute.buffer;
    }
  }
  var primitive_v = new Float3();
  var primitive_b = new Box3();

  // node_modules/@union_native/core/src/math/tangent.js
  var v1 = new Float3();
  var v22 = new Float3();
  var V = new Float3();
  var P1 = new Float3();
  var P2 = new Float3();
  var P3 = new Float3();
  var N1 = new Float3();
  var N2 = new Float3();
  var N3 = new Float3();
  var B1 = new Float3();
  var B2 = new Float3();
  var B3 = new Float3();
  var T1 = new Float3();
  var T2 = new Float3();
  var T3 = new Float3();
  var uv1 = new Float2();
  var uv2 = new Float2();
  var uv3 = new Float2();
  var tmpVec = new Float3();
  var tmpFloat2 = new Float3();
  var dst = new Float3();
  var t = new Float3();
  var b = new Float3();
  var n = new Float3();
  var tmp0 = new Float3();
  var tmp1 = new Float3();
  var tmp2 = new Float3();
  var TangentGenerator = class {
    static prepare(primitive) {
      const vx = primitive_get_attribute(primitive, "position").buffer;
      const nx = primitive_get_attribute(primitive, "normal").buffer;
      const tx = primitive_get_attribute(primitive, "uv").buffer;
      const index = primitive.index;
      let nVx;
      if (index) {
        nVx = index.length;
        const array = index;
        for (let i = 0; i < nVx; i += 3) {
          const i1 = array[i];
          const i2 = array[i + 1];
          const i3 = array[i + 2];
          this.compute(vx, nx, tx, i1, i2, i3);
        }
      } else {
        nVx = vx.length / 3;
        for (let i = 0; i < nVx; i += 3) {
          this.compute(vx, nx, tx, i, i + 1, i + 2);
        }
      }
    }
    static compute(vx, nx, tx, i1, i2, i3) {
      if (v1 === void 0) {
        v1 = new Float3();
        v22 = new Float3();
        V = new Float3();
        P1 = new Float3();
        P2 = new Float3();
        P3 = new Float3();
        N1 = new Float3();
        N2 = new Float3();
        N3 = new Float3();
        B1 = new Float3();
        B2 = new Float3();
        B3 = new Float3();
        T1 = new Float3();
        T2 = new Float3();
        T3 = new Float3();
        uv1 = new Float2();
        uv2 = new Float2();
        uv3 = new Float2();
        tmpVec = new Float3();
        tmpFloat2 = new Float3();
        dst = new Float3();
      }
      P1.read(vx, i1 * 3);
      P2.read(vx, i2 * 3);
      P3.read(vx, i3 * 3);
      N1.read(nx, i1 * 3);
      N2.read(nx, i2 * 3);
      N3.read(nx, i3 * 3);
      uv1.read(tx, i1 * 2);
      uv2.read(tx, i2 * 2);
      uv3.read(tx, i3 * 2);
      let vy;
      let vz;
      T1.set(0, 0, 0);
      T2.set(0, 0, 0);
      T3.set(0, 0, 0);
      B1.set(0, 0, 0);
      B2.set(0, 0, 0);
      B3.set(0, 0, 0);
      const s1 = uv2.x - uv1.x;
      const s2 = uv3.x - uv1.x;
      const t1 = uv2.y - uv1.y;
      const t2 = uv3.y - uv1.y;
      v1.set(P2.x - P1.x, s1, t1);
      v22.set(P3.x - P1.x, s2, t2);
      Float3.Cross(v1, v22, V);
      if (V.x !== 0) {
        V.normalize();
        vy = -V.y / V.x;
        vz = -V.z / V.x;
        T1.x += vy;
        B1.x += vz;
        T2.x += vy;
        B2.x += vz;
        T3.x += vy;
        B3.x += vz;
      }
      v1.set(P2.y - P1.y, s1, t1);
      v22.set(P3.y - P1.y, s2, t2);
      Float3.Cross(v1, v22, V);
      if (V.x !== 0) {
        V.normalize();
        vy = -V.y / V.x;
        vz = -V.z / V.x;
        T1.y += vy;
        B1.y += vz;
        T2.y += vy;
        B2.y += vz;
        T3.y += vy;
        B3.y += vz;
      }
      v1.set(P2.z - P1.z, s1, t1);
      v22.set(P3.z - P1.z, s2, t2);
      Float3.Cross(v1, v22, V);
      if (V.x !== 0) {
        V.normalize();
        vy = -V.y / V.x;
        vz = -V.z / V.x;
        T1.z += vy;
        B1.z += vz;
        T2.z += vy;
        B2.z += vz;
        T3.z += vy;
        B3.z += vz;
      }
      const T = this.T;
      const B = this.B;
      const N = this.N;
      Float3.Cross(N1, T1, tmpVec);
      Float3.Cross(tmpVec, N1, tmpFloat2);
      dst.read(T, i1 * 3).add(tmpFloat2).write(T, i1 * 3);
      Float3.Cross(B1, N1, tmpVec);
      Float3.Cross(N1, tmpVec, tmpFloat2);
      dst.read(B, i1 * 3).add(tmpFloat2).write(B, i1 * 3);
      Float3.Cross(N2, T2, tmpVec);
      Float3.Cross(tmpVec, N2, tmpFloat2);
      dst.read(T, i2 * 3).add(tmpFloat2).write(T, i2 * 3);
      Float3.Cross(B2, N2, tmpVec);
      Float3.Cross(N2, tmpVec, tmpFloat2);
      dst.read(B, i2 * 3).add(tmpFloat2).write(B, i2 * 3);
      Float3.Cross(N3, T3, tmpVec);
      Float3.Cross(tmpVec, N3, tmpFloat2);
      dst.read(T, i3 * 3).add(tmpFloat2).write(T, i3 * 3);
      Float3.Cross(B3, N3, tmpVec);
      Float3.Cross(N3, tmpVec, tmpFloat2);
      dst.read(B, i3 * 3).add(tmpFloat2).write(B, i3 * 3);
      dst.read(N, i1 * 3).add(N1).write(N, i1 * 3);
      dst.read(N, i2 * 3).add(N2).write(N, i2 * 3);
      dst.read(N, i3 * 3).add(N3).write(N, i3 * 3);
    }
    static generate(primitive) {
      if (t === void 0) {
        t = new Float3();
        n = new Float3();
        b = new Float3();
        tmp0 = new Float3();
        tmp1 = new Float3();
        tmp2 = new Float3();
      }
      const position = primitive_get_attribute(primitive, "position").buffer;
      const size = position.length;
      this.T = new Float32Array(size);
      this.B = new Float32Array(size);
      this.N = new Float32Array(size);
      this.prepare(primitive);
      const nElements = size / 3;
      const tangents = new Float32Array(nElements * 4);
      for (let i = 0; i < nElements; ++i) {
        t.read(this.T, i * 3);
        b.read(this.B, i * 3);
        n.read(this.N, i * 3);
        n.normalize().write(this.N, i * 3);
        const nt = Float3.Dot(n, t);
        tmp1.copy(n).mul(nt);
        tmp0.copy(t).sub(tmp1);
        tmp2.copy(tmp0).normalize();
        Float3.Cross(n, t, tmp0);
        let sign = Float3.Dot(tmp0, b);
        sign = sign < 0 ? -1 : 1;
        const ti = i * 4;
        tangents[ti] = tmp2.x;
        tangents[ti + 1] = tmp2.y;
        tangents[ti + 2] = tmp2.z;
        tangents[ti + 3] = sign;
      }
      set_attribute(primitive, {
        buffer: tangents,
        stride: 4,
        name: "tangent"
      });
      set_attribute(primitive, { buffer: this.N, stride: 3, name: "normal" });
      this.T = void 0;
      this.B = void 0;
      this.N = void 0;
    }
  };
  var tangentGenerator = new TangentGenerator();

  // node_modules/@union_native/core/src/mesh/builtin_mesh.js
  var builin_meshes = /* @__PURE__ */ new Map();

  // node_modules/@union_native/core/src/mesh/box_mesh.js
  function create_box_mesh() {
    let builtin_box = builin_meshes.get("box");
    if (builtin_box)
      return builtin_box;
    const position = new Float32Array([
      -1,
      1,
      -1,
      1,
      1,
      1,
      1,
      1,
      -1,
      1,
      1,
      1,
      -1,
      -1,
      1,
      1,
      -1,
      1,
      -1,
      1,
      1,
      -1,
      -1,
      -1,
      -1,
      -1,
      1,
      1,
      -1,
      -1,
      -1,
      -1,
      1,
      -1,
      -1,
      -1,
      1,
      1,
      -1,
      1,
      -1,
      1,
      1,
      -1,
      -1,
      -1,
      1,
      -1,
      1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      1,
      1,
      -1,
      1,
      1,
      -1,
      1,
      -1,
      1,
      -1,
      1,
      1,
      1,
      1,
      1,
      1,
      -1
    ]);
    const normal2 = new Float32Array([
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      1,
      0,
      0,
      0,
      1,
      -1,
      0,
      0,
      0,
      -1,
      0,
      1,
      0,
      0,
      0,
      0,
      -1
    ]);
    const uv = new Float32Array([
      0.875,
      0.5,
      0.625,
      0.75,
      0.625,
      0.5,
      0.625,
      0.75,
      0.375,
      1,
      0.375,
      0.75,
      0.625,
      0,
      0.375,
      0.25,
      0.375,
      0,
      0.375,
      0.5,
      0.125,
      0.75,
      0.125,
      0.5,
      0.625,
      0.5,
      0.375,
      0.75,
      0.375,
      0.5,
      0.625,
      0.25,
      0.375,
      0.5,
      0.375,
      0.25,
      0.875,
      0.75,
      0.625,
      1,
      0.625,
      0.25,
      0.375,
      0.75,
      0.625,
      0.75,
      0.625,
      0.5
    ]);
    const index = new Uint32Array([0, 2, 1, 3, 5, 4, 6, 8, 7, 9, 11, 10, 12, 14, 13, 15, 17, 16, 0, 1, 18, 3, 4, 19, 6, 7, 20, 9, 10, 21, 12, 13, 22, 15, 16, 23]);
    const vertex_data = { position, normal: normal2, uv, index };
    const sub_meshes = [{ material_index: -1, vertex_start: 0, vertex_count: 24, index_start: 0, index_count: 36, indexed: true }];
    const box = new Box3();
    box.min.set(-1, -1, -1);
    box.max.set(1, 1, 1);
    builtin_box = { vertex_data, sub_meshes, name: "builtin box", materials: [], box };
    builin_meshes.set("box", builtin_box);
    return builtin_box;
  }

  // node_modules/@union_native/core/src/std/platform.js
  var Platform;
  (function(Platform2) {
    Platform2[Platform2["Mobile"] = 0] = "Mobile";
    Platform2[Platform2["Mac"] = 1] = "Mac";
    Platform2[Platform2["Windows"] = 2] = "Windows";
    Platform2[Platform2["VR"] = 3] = "VR";
    Platform2[Platform2["AR"] = 4] = "AR";
  })(Platform || (Platform = {}));

  // src/pipeline.ts
  function create_default_pipeline() {
    const vertex_shader = `#version 300 es
    precision highp float;
    precision highp int;
    layout(location = 0) in vec3 position;
    layout(location = 1) in vec2 uv;

    out vec2 v_uv;

    void main() {
        v_uv = uv;
        gl_Position = vec4(position, 1.0);
    }
    `;
    const fragment_shader = `#version 300 es
    precision highp float;
    precision highp int;
    in vec2 v_uv;
    out vec4 frag_data;

    void main() {
        frag_data = vec4(v_uv, 0.0, 1.0);
    }
    `;
    return create_pipeline({
      name: "default pipeline",
      vertex_shader,
      fragment_shader,
      depth_write: true,
      depth_compare_func: DepthCompareFunc.Always
    });
  }

  // src/index.ts
  var device = new GFXDevice();
  var encoder = device.encoder;
  var engine = new Engine();
  var camera = new Camera();
  camera.location.set(4, 4, 4);
  camera.look_at(Float3.ZERO);
  camera.perspective(45, 1, 1, 1e3);
  var control = new SphericalControl(camera);
  var pipeline = create_default_pipeline();
  var cube = create_box_mesh();
  function frame() {
    control.update();
    encoder.set_camera(camera);
    encoder.set_pipeline(pipeline);
    encoder.draw_mesh(create_gpu_mesh(cube));
  }
  EventHub.on(EngineEvent.Frame, frame);
  engine.start();
})();
//# sourceMappingURL=index.js.map
