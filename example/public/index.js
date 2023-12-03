"use strict";
(() => {
  // ../../union/src/adt/flex_buffer_view.ts
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

  // ../../union/src/adt/ordered_map.ts
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

  // ../../union/src/adt/pool.ts
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

  // ../../union/src/adt/ptree.ts
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

  // ../../union/src/memory/footprint.ts
  var global_foot_print = 0;
  function footprint_alloc(size) {
    global_foot_print += size;
  }

  // ../../union/src/math/math.ts
  var DegreeToRadian = Math.PI / 180;
  var RadianToDegree = 180 / Math.PI;
  function clamp(i, b2, t2) {
    return Math.max(Math.min(i, t2), b2);
  }
  function lerp(a, b2, i) {
    return a + (b2 - a) * i;
  }

  // ../../union/src/math/simd.ts
  var Float22 = class _Float2 {
    constructor(x2 = 0, y2 = 0) {
      this.size = 2;
      this.elements = new Float32Array(2);
      this.set(x2, y2);
      footprint_alloc(2);
    }
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
  var _center = new Float22();
  var Float3 = class _Float3 {
    constructor(x2 = 0, y2 = 0, z2 = 0) {
      this.size = 3;
      this.elements = new Float32Array(3);
      this.set(x2, y2, z2);
      footprint_alloc(3);
    }
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
  var ZERO = new Float3(0, 0, 0);
  var ONE = new Float3(1, 1, 1);
  var X = new Float3(1, 0, 0);
  var Y = new Float3(0, 1, 0);
  var Z = new Float3(0, 0, 1);
  var NEGATIVE_X = new Float3(-1, 0, 0);
  var NEGATIVE_Y = new Float3(0, -1, 0);
  var NEGATIVE_Z = new Float3(0, 0, -1);
  var Float42 = class _Float4 {
    constructor(x2 = 0, y2 = 0, z2 = 0, w = 0) {
      this.size = 4;
      this.elements = new Float32Array(4);
      this.set(x2, y2, z2, w);
      footprint_alloc(4);
    }
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

  // ../../union/src/math/box.ts
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

  // ../../union/src/math/color.ts
  function color_to_hex(c) {
    c = clamp(Math.ceil(c * 255), 0, 255);
    if (c < 16)
      return "0" + c.toString(16);
    return c.toString(16);
  }
  var ColorRGBA2 = class _ColorRGBA extends Float42 {
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
      dst2 = dst2 ?? new Float42();
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

  // ../../union/src/math/simd_mat.ts
  var x = new Float3();
  var y = new Float3();
  var z = new Float3();
  var v = new Float3();
  var default_up = new Float3(0, 1, 0);
  var Mat42 = class _Mat4 {
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
  var MAT4_IDENTITY = new Mat42().identity();

  // ../../union/src/math/ray.ts
  var v2 = new Float3();
  var normal = new Float3();
  var edge1 = new Float3();
  var edge2 = new Float3();
  var diff = new Float3();

  // ../../union/src/math/rect.ts
  var Rect = class {
    constructor(x2 = 0, y2 = 0, w = 0, h = 0) {
      this.size = 4;
      this.elements = new Float32Array(4);
      this.set(x2, y2, w, h);
      footprint_alloc(4);
    }
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
  var RECT_ZERO = new Rect(0, 0, 0, 0);

  // ../../union/src/math/simd_quaternion.ts
  var Quaternion = class _Quaternion {
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
    from_euler(src, order = "XYZ" /* XYZ */) {
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
    static FromEuler(e, order = "XYZ" /* XYZ */, dst2) {
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
        case "XYZ" /* XYZ */:
          dst2.x = s1 * c2 * c3 + c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 - s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 + s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "YXZ" /* YXZ */:
          dst2.x = s1 * c2 * c3 + c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 - s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 - s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "ZXY" /* ZXY */:
          dst2.x = s1 * c2 * c3 - c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 + s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 + s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "ZYX" /* ZYX */:
          dst2.x = s1 * c2 * c3 - c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 + s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 - s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "YZX" /* YZX */:
          dst2.x = s1 * c2 * c3 + c1 * s2 * s3;
          dst2.y = c1 * s2 * c3 + s1 * c2 * s3;
          dst2.z = c1 * c2 * s3 - s1 * s2 * c3;
          dst2.w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "XZY" /* XZY */:
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
  var QUATERNION_IDENTITY = new Quaternion(0, 0, 0, 1);

  // ../../union/src/memory/heap.ts
  var Heap = class {
    constructor() {
      this.released = [];
      // mega bytes
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

  // ../../union/src/math/spherical.ts
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

  // ../../union/src/engine/camera.ts
  var rotate_matrix = new Mat42();
  var Camera = class {
    constructor() {
      this._mode = 0 /* Perspective */;
      this.location = new Float3();
      this.rotation = new Quaternion();
      this.scale = new Float3(1, 1, 1);
      this.world_matrix = new Mat42();
      this.local_matrix = new Mat42();
      this.view_matrix = new Mat42();
      this.projection_matrix = new Mat42();
      this.view_projection_matrix = new Mat42();
      this.inverse_projection_matrix = new Mat42();
      this.up = new Float3(0, 1, 0);
      this.vertical_fov = 45;
      this.aspect = 1;
      this.vertical_size = 100;
      this.horizontal_size = 100;
      this.near = 1;
      this.far = 1e4;
      this.perspective(this.vertical_fov, this.aspect, this.near, this.far);
    }
    set mode(value) {
      this._mode = value;
      if (value === 0 /* Perspective */) {
        this.perspective(this.vertical_fov, this.aspect, this.near, this.far);
      } else {
        this.orthographics(this.vertical_size, this.horizontal_size, this.near, this.far);
      }
    }
    get mode() {
      return this._mode;
    }
    update_world_matrix() {
      this.world_matrix.compose(this.location, this.rotation, this.scale);
    }
    update_view_matrix() {
      Mat42.Inverse(this.world_matrix, this.view_matrix);
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
      if (this.mode === 0 /* Perspective */) {
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
      if (this._mode === 0 /* Perspective */) {
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

  // ../../union/src/engine/event.ts
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
  var _EventHub = class {
    constructor() {
      this.node = new EventNode();
    }
    on(event, callback, scope) {
      this.node.on(event, callback, scope);
    }
    once(event, callback, scope) {
      this.node.once(event, callback, scope);
    }
    fire(event, payload) {
      this.node.fire(event, payload);
    }
    off(event, callback, scope) {
      this.node.off(event, callback, scope);
    }
  };
  var EventHub = new _EventHub();

  // ../../union/src/engine/global_event.ts
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

  // ../../union/src/input/browser_input.ts
  var BrowserInput = class {
    constructor() {
      this.start = new Float22();
      this.drag_start = new Float22();
      this.end = new Float22();
      this.delta = new Float22();
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
          button: 0 /* Left */,
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
          button: 0 /* Left */,
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
          button: 0 /* Left */,
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

  // ../../union/src/input/input.ts
  var Input = class {
    constructor() {
      this.axis_map = {};
      this.key_map = /* @__PURE__ */ new Set();
      this.onkeydown = (payload) => {
        const keycode = payload.keycode;
        if (keycode === 38 /* Up */) {
          this.set_axis(1 /* Vertical */, 1);
        } else if (keycode === 40 /* Down */) {
          this.set_axis(1 /* Vertical */, -1);
        } else if (keycode === 37 /* Left */) {
          this.set_axis(0 /* Horizontal */, -1);
        } else if (keycode === 39 /* Right */) {
          this.set_axis(0 /* Horizontal */, 1);
        }
        this.key_map.add(keycode);
      };
      this.onkeyup = (payload) => {
        const keycode = payload.keycode;
        if (keycode === 38 /* Up */ || keycode === 40 /* Down */) {
          this.set_axis(1 /* Vertical */, 0);
        } else if (keycode === 37 /* Left */ || keycode === 39 /* Right */) {
          this.set_axis(0 /* Horizontal */, 0);
        }
        this.key_map.delete(keycode);
      };
      EventHub.on(GlobalEvent.KeyDown, this.onkeydown);
      EventHub.on(GlobalEvent.KeyUp, this.onkeyup);
    }
    set_axis(axis, value) {
      this.axis_map[axis] = value;
    }
    get_axis(axis) {
      return this.axis_map[axis] || 0;
    }
    get_button(button) {
      return this.key_map.has(button);
    }
  };

  // ../../union/src/engine/engine.ts
  var EngineEvent = {
    BeforeTick: new TypedEvent("before tick"),
    AfterTick: new TypedEvent("after tick"),
    BeforeFrame: new TypedEvent("before frame"),
    AfterFrame: new TypedEvent("after frame"),
    Frame: new TypedEvent("frame")
  };
  var Engine = class {
    constructor() {
      this.swap_chain = -1;
      this.frame_index = 0;
      this.time = performance.now() * 1e-3;
      this.last_time = performance.now() * 1e-3;
      // delta_time in seconds from last frame to this frame
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
      this.input = new Input();
      this.mouse_input = new BrowserInput();
      EventHub.on(GlobalEvent.XRSessionEnd, () => {
        if (this.paused)
          this.start();
      });
    }
    // delta_time in seconds from last frame to now
    get abs_delta_time() {
      return performance.now() * 1e-3 - this.last_time;
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

  // ../../union/src/engine/frame_capture.ts
  var FrameCaptureNode = class extends PolyNode {
    constructor() {
      super(...arguments);
      this.name = "anonymous";
      this.type = 0 /* None */;
    }
  };
  var Profiler = class {
    constructor() {
      this.root = this.node = new FrameCaptureNode();
    }
    trace_start(name, description, data, type = 0 /* None */) {
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

  // ../../union/src/adt/block_allocator.ts
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

  // ../../union/src/gfx/render.command.ts
  var RenderCommandType = /* @__PURE__ */ ((RenderCommandType2) => {
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
    return RenderCommandType2;
  })(RenderCommandType || {});
  var command_handlers = /* @__PURE__ */ new Map();
  function render_command_handler_get(type) {
    return command_handlers.get(type);
  }

  // ../../union/src/gfx/render.worker.ts
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

  // ../../union/src/webgpu/device.ts
  self.onmessage = render_worker_command_message;

  // ../../union/src/webgpu/encoder.ts
  var WebGPUEncoder = class {
    constructor(options) {
    }
    set_display_size(width, height) {
    }
    set_viewport(x2, y2, width, height) {
    }
    set_camera(camera2) {
    }
    set_action(action2) {
    }
    set_pass(pass, description) {
    }
    set_clear_color(color) {
    }
    clear(action2) {
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

  // ../../union/src/gfx/gfx_device.ts
  var default_clear_action = {
    type: 7 /* ClearAll */,
    clear_color: new ColorRGBA2(0, 0, 0, 0),
    clear_depth: 1
  };
  var _device;
  var GFXDevice = class {
    constructor(options = {}) {
      this.width = 1;
      this.height = 1;
      this.display_ratio = 1;
      this.display_width = 1;
      this.display_height = 1;
      this.backend = "public/src/worker/webgl.render/wgl.worker.js" /* WebGL */;
      _device = this;
      this.display_ratio = options.display_ratio ?? 1;
      this.backend = options.backend ?? "public/src/worker/webgl.render/wgl.worker.js" /* WebGL */;
      if (options.backend === "public/src/worker/webgpu.render/wgpu.worker.js" /* WebGPU */) {
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
    return _device;
  }
  function gfx_encoder_get() {
    return gfx_device_get().encoder;
  }

  // ../../union/src/std/type.ts
  function is_string(obj) {
    return typeof obj === "string" || obj instanceof String;
  }
  function default_value(value, default_value2) {
    return value === void 0 ? default_value2 : value;
  }

  // ../../union/src/worker/web_worker.ts
  var WebWorker = class {
    constructor(worker, auto_terminate = false) {
      this.worker = worker;
      this.auto_terminate = auto_terminate;
      this.state = 0 /* Idle */;
      this.queue = [];
      this.worker_name = "anonymous";
      this.task_id = 0;
      this.callbacks = /* @__PURE__ */ new Map();
      this.onmessage = (event) => {
        this.state = 0 /* Idle */;
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
    get available() {
      return this.state === 0 /* Idle */;
    }
    send(message, buffers, callback) {
      const task_id = this.task_id++;
      message.task_id = task_id;
      if (this.state !== 0 /* Idle */) {
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

  // ../../union/src/gfx/gfx_device_client.ts
  var GFXDeviceClient = class {
    constructor(backend) {
      this.backend = backend;
      this.resource_id = 0;
      const worker = new Worker(backend, { name: "RenderThread" });
      this.render_thread = new WebWorker(worker);
    }
    get_resource_id() {
      return this.resource_id++;
    }
    create_device(canvas, options) {
      const offscreen_canvas = canvas.transferControlToOffscreen();
      const resource_id = this.get_resource_id();
      const command = { resource_id, type: 0 /* CreateDevice */, canvas: offscreen_canvas, options };
      this.render_thread.send(command, [offscreen_canvas]);
      return resource_id;
    }
    create_texture(descriptor) {
      const resource_id = this.get_resource_id();
      const command = { resource_id, type: 3 /* CreateTexture */, descriptor };
      const buffers = texture_descriptor_collect_buffer(descriptor);
      this.render_thread.send(command, buffers);
      return resource_id;
    }
    update_texture(resource_id) {
    }
    resize(width, height, pixel_width, pixel_height) {
      const type = 1 /* DeviceResize */;
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

  // ../../union/src/webgl/block.ts
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
    map.set(0 /* Frame */, frame_block);
    const object_block = {
      buffer: create_unform_buffer(BLOCK_MINOR_BUFFER_SIZE),
      data: new FlexBufferView(new ArrayBuffer(BLOCK_MINOR_BUFFER_SIZE)),
      allocator: new BlockAllocator(block_stride)
    };
    map.set(1 /* Object */, object_block);
    const material_block = {
      buffer: create_unform_buffer(BLOCK_MAJOR_BUFFER_SIZE),
      data: new FlexBufferView(new ArrayBuffer(BLOCK_MAJOR_BUFFER_SIZE)),
      allocator: new BlockAllocator(block_stride)
    };
    map.set(2 /* Material */, material_block);
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

  // ../../union/src/webgl/type.ts
  var UnsignedByteType = 5121;
  var ByteType = 5120;
  var ShortType = 5122;
  var UnsignedShortType = 5123;
  var IntType = 5124;
  var UnsignedIntType = 5125;
  var FloatType = 5126;
  var HalfFloatType = 5131;

  // ../../union/src/webgl/draw.ts
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

  // ../../union/src/webgl/extensions.ts
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

  // ../../union/src/std/numeric.ts
  function count_decimal_bit(n2) {
    let c = 1;
    while (Math.abs(n2) >= 10) {
      n2 /= 10;
      c++;
    }
    return c;
  }

  // ../../union/src/webgl/texture_slot.ts
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

  // ../../union/src/webgl/pipeline.ts
  var _pipeline_id = 0;
  function get_pipeline_id() {
    return _pipeline_id++;
  }
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
    blend.src_alpha_factor = default_value(blend.src_alpha_factor, 1 /* One */);
    blend.dst_alpha_factor = default_value(blend.dst_alpha_factor, 771 /* OneMinusSrcAlpha */);
    blend.src_color_factor = default_value(blend.src_color_factor, 770 /* SrcAlpha */);
    blend.dst_color_factor = default_value(blend.dst_color_factor, 771 /* OneMinusSrcAlpha */);
    blend.color_func = default_value(blend.color_func, 32774 /* Add */);
    blend.alpha_func = default_value(blend.alpha_func, 32774 /* Add */);
    let depth_compare_func = default_value(descriptor.depth_compare_func, 515 /* LessEqual */);
    let depth_write = default_value(descriptor.depth_write, true);
    let vertex_order = default_value(descriptor.vertex_order, 2305 /* CounterClockWise */);
    let cull_mode = default_value(descriptor.cull_mode, 1029 /* Back */);
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
          case 1 /* Float */:
            upload = upload_float.bind(void 0, gl, location);
            break;
          case 2 /* Float2 */:
            upload = upload_float2.bind(void 0, gl, location);
            break;
          case 3 /* Float3 */:
            upload = upload_float3.bind(void 0, gl, location);
            break;
          case 5 /* UnsignedInteger */:
            upload = upload_uint.bind(void 0, gl, location);
            break;
          case 6 /* Integer */:
            upload = upload_int.bind(void 0, gl, location);
          case 7 /* ColorRGBA */:
          case 4 /* Float4 */:
            upload = upload_float4.bind(void 0, gl, location);
            break;
          case 8 /* Mat3 */:
            upload = upload_mat3.bind(void 0, gl, location);
            break;
          case 9 /* Mat4 */:
            upload = upload_mat4.bind(void 0, gl, location);
            break;
          case 12 /* Texture2DArray */:
          case 10 /* Texture2D */:
            upload = upload_texture2d.bind(void 0, gl, location);
            break;
          case 11 /* TextureCube */:
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
      const indices = Array.from(gl.getUniformIndices(program, names)).filter((value, index) => {
        if (value > gl.ACTIVE_UNIFORMS) {
          console.warn(`struct uniform ${struct_name}.${names[index]} not found.`);
          return false;
        }
        return true;
      });
      const struct_uniform = {
        name: struct_name,
        type: 14 /* Struct */,
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
    const frame_block = uniform_block["frame_block" /* Frame */];
    if (frame_block) {
      const encoder3 = gfx_device_get().encoder;
      const ubo_alignment = encoder3.UNIFORM_BUFFER_ALIGNMENT;
      const size = Math.ceil(frame_block.struct_size / ubo_alignment) * ubo_alignment;
      pipeline2.frame_block = create_block(0 /* Frame */, size, "frame_block" /* Frame */);
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
      console.warn(
        lines.map((l, i) => {
          return `${" ".repeat(max_bit - count_decimal_bit(i + 1))}${i + 1}|${l}`;
        }).join("\n")
      );
      console.warn(`shader error info:
${shaderInfo}`);
      return null;
    }
    return shader;
  }
  function uniform_byte_size(type) {
    switch (type) {
      case 0 /* Bool */:
      case 1 /* Float */:
      case 5 /* UnsignedInteger */:
      case 6 /* Integer */:
        return 4;
      case 2 /* Float2 */:
        return 8;
      case 3 /* Float3 */:
        return 12;
      case 7 /* ColorRGBA */:
      case 4 /* Float4 */:
        return 16;
      case 8 /* Mat3 */:
        return 36;
      case 9 /* Mat4 */:
        return 64;
      case 10 /* Texture2D */:
      case 11 /* TextureCube */:
      case 12 /* Texture2DArray */:
      case 13 /* Texture3D */:
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

  // ../../union/src/webgl/encoder.ts
  var WebGLEncoder = class {
    constructor(options) {
      this.last_viewport = new Rect();
      this.viewport = new Rect();
      this.profiler = new Profiler();
      this.recording = false;
      this.clear_action = {
        type: 7 /* ClearAll */,
        clear_color: new ColorRGBA2(0, 0, 0, 0),
        clear_depth: 1
      };
      this.uniform_cache = /* @__PURE__ */ new Map();
      this.width = 1;
      this.height = 1;
      this.multi_thread_rendering = false;
      this.set_draw = (draw, object, description) => {
        if (this.recording)
          this.profiler.trace_start("set draw", description, draw, 4 /* Draw */);
        const gl = this.gl;
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
            this.profiler.trace_start("upload uniform", `${name} ${uniform}`, uniform, 3 /* ConstantBuffer */);
          if (uniform !== void 0)
            pip_uniform.upload(uniform);
          if (this.recording)
            this.profiler.trace_end("upload uniform");
          this.uniform_cache.set(name, uniform);
        }
        const struct_uniform = pipeline2.uniform_block["object_block" /* Object */];
        const render_object = object?.render_block;
        if (render_object && struct_uniform) {
          block_bind(pipeline2, render_object);
        }
        if (draw.webgl_vao === void 0)
          return;
        gl.bindVertexArray(draw.webgl_vao);
        if (draw.range !== void 0) {
          if (draw.indexed) {
            gl.drawElements(draw.type, draw.range.count, gl.UNSIGNED_INT, draw.range.start);
          } else {
            gl.drawArrays(draw.type, draw.range.start, draw.range.count);
          }
        } else {
          if (draw.indexed) {
            gl.drawElements(draw.type, draw.max_vertex_count, gl.UNSIGNED_INT, 0);
          } else {
            gl.drawArrays(draw.type, 0, draw.max_vertex_count);
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
        const backend = options.backend ?? "public/src/worker/webgl.render/wgl.worker.js" /* WebGL */;
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
        this.profiler.trace_start("set pass", description || pass.name, pass, 1 /* Pass */);
      gl.bindFramebuffer(gl.FRAMEBUFFER, pass.webgl_framebuffer);
      this.set_viewport(0, 0, pass.width, pass.height);
      let mask = 0;
      if (pass.color_load_action === 1 /* Clear */) {
        const color = pass.clear_color;
        gl.clearColor(color.r, color.g, color.b, color.a);
        mask |= gl.COLOR_BUFFER_BIT;
      }
      if (pass.depth_load_action === 1 /* Clear */) {
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
    clear(action2) {
      if (!action2)
        action2 = this.clear_action;
      if (action2.type === 8 /* Ignore */)
        return;
      if ((action2.type & 1 /* ClearColor */) !== 0) {
        this.gl.clearColor(action2.clear_color.r, action2.clear_color.g, action2.clear_color.b, action2.clear_color.a);
      }
      this.gl.clearDepth(action2.clear_depth);
      let mask = 0;
      if ((action2.type & 1 /* ClearColor */) !== 0)
        mask |= this.gl.COLOR_BUFFER_BIT;
      if ((action2.type & 2 /* ClearDepth */) !== 0)
        mask |= this.gl.DEPTH_BUFFER_BIT;
      if ((action2.type & 4 /* ClearStencil */) !== 0)
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
        this.profiler.trace_start("set pipeline", pipeline2.name, pipeline2, 2 /* Pipeline */);
      gl.useProgram(pipeline2.program);
      const { cull_mode, depth_write, depth_compare_func, vertex_order, blend } = pipeline2;
      if (this.pipeline === void 0 || cull_mode !== this.pipeline.cull_mode) {
        if (depth_compare_func === 0 /* Never */ || cull_mode == 0 /* None */) {
          gl.disable(gl.CULL_FACE);
        } else {
          gl.enable(gl.CULL_FACE);
          gl.cullFace(cull_mode);
        }
      }
      if (this.pipeline === void 0 || depth_compare_func !== this.pipeline.depth_compare_func) {
        if (depth_compare_func === 0 /* Never */) {
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
      const frame_block = pipeline2.uniform_block["frame_block" /* Frame */];
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
      const frame_struct = this.pipeline.uniform_block["frame_block" /* Frame */];
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
          this.profiler.trace_start("upload uniform", `${name} ${uniform}`, uniform, 3 /* ConstantBuffer */);
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
        this.profiler.trace_start("draw mesh", description, mesh, 5 /* Mesh */);
      gl.bindVertexArray(mesh.vao);
      for (let i = 0; i < mesh.sub_meshes.length; ++i) {
        if (mesh.indexed) {
          gl.drawElements(4 /* Triangles */, mesh.index_count, gl.UNSIGNED_INT, 0);
        } else {
          gl.drawArrays(4 /* Triangles */, 0, mesh.vertex_count);
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
        gl.drawElements(4 /* Triangles */, mesh.index_count, gl.UNSIGNED_INT, mesh.index_start);
      } else {
        gl.drawArrays(4 /* Triangles */, mesh.index_start, mesh.index_count);
      }
    }
    commit() {
      this.pipeline = void 0;
      webgl_texture_slot_reset();
      this.uniform_cache.clear();
    }
  };

  // ../../union/src/engine/spherical_control.ts
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
      // ms
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

  // ../../union/src/engine/vertex_data.ts
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

  // ../../union/src/webgl/mesh.ts
  function get_generic_attribute_slot(name) {
    switch (name) {
      case "position" /* position */:
        return 0;
      case "uv" /* uv */:
        return 1;
      case "normal" /* normal */:
        return 2;
      case "tangent" /* tangent */:
        return 3;
      case "joint" /* joint */:
        return 4;
      case "weight" /* weight */:
        return 5;
      case "color" /* color */:
        return 6;
      case "uv2" /* uv2 */:
        return 7;
      case "uv3" /* uv3 */:
        return 8;
      case "uv4" /* uv4 */:
        return 9;
      case "uv5" /* uv5 */:
        return 10;
      case "uv6" /* uv6 */:
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
      upload_buffer(vertex_data.position, get_generic_attribute_slot("position" /* position */), 3);
    if (vertex_data.uv)
      upload_buffer(vertex_data.uv, get_generic_attribute_slot("uv" /* uv */), 2);
    if (vertex_data.normal)
      upload_buffer(vertex_data.normal, get_generic_attribute_slot("normal" /* normal */), 3);
    if (vertex_data.tangent)
      upload_buffer(vertex_data.tangent, get_generic_attribute_slot("tangent" /* tangent */), 4);
    if (vertex_data.joint)
      upload_buffer(vertex_data.joint, get_generic_attribute_slot("joint" /* joint */), 4);
    if (vertex_data.weight)
      upload_buffer(vertex_data.weight, get_generic_attribute_slot("weight" /* weight */), 4);
    if (vertex_data.color)
      upload_buffer(vertex_data.color, get_generic_attribute_slot("color" /* color */), 4);
    if (vertex_data.uv2)
      upload_buffer(vertex_data.uv2, get_generic_attribute_slot("uv2" /* uv2 */), 2);
    if (vertex_data.uv3)
      upload_buffer(vertex_data.uv3, get_generic_attribute_slot("uv3" /* uv3 */), 2);
    if (vertex_data.uv4)
      upload_buffer(vertex_data.uv4, get_generic_attribute_slot("uv4" /* uv4 */), 2);
    if (vertex_data.uv5)
      upload_buffer(vertex_data.uv5, get_generic_attribute_slot("uv5" /* uv5 */), 2);
    if (vertex_data.uv6)
      upload_buffer(vertex_data.uv6, get_generic_attribute_slot("uv6" /* uv6 */), 2);
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

  // ../../union/src/webgl/primitive.ts
  function primitive_get_attribute(primitive, name = "position" /* position */) {
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

  // ../../union/src/math/tangent.ts
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
  var uv1 = new Float22();
  var uv2 = new Float22();
  var uv3 = new Float22();
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
        uv1 = new Float22();
        uv2 = new Float22();
        uv3 = new Float22();
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

  // ../../union/src/mesh/builtin_mesh.ts
  var builin_meshes = /* @__PURE__ */ new Map();

  // ../../union/src/mesh/box_mesh.ts
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

  // src/pipeline.ts
  function create_default_pipeline() {
    const vertex_shader = `#version 300 es
    precision highp float;
    precision highp int;
    layout(location = 0) in vec3 position;
    layout(location = 1) in vec2 uv;

    uniform mat4 world_matrix;

    layout(std140) uniform frame_block {
        mat4 view_matrix;
        mat4 projection_matrix;
    };

    out vec2 v_uv;

    void main() {
        v_uv = uv;
        gl_Position = projection_matrix * view_matrix * world_matrix * vec4(position, 1.0);
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
      uniforms: [
        { name: "world_matrix", type: 9 /* Mat4 */, default_value: new Mat42() },
        { name: "frame_block.view_matrix", type: 9 /* Mat4 */ },
        { name: "frame_block.projection_matrix", type: 9 /* Mat4 */ }
      ],
      blend: { enabled: false },
      depth_write: true,
      depth_compare_func: 519 /* Always */
    });
  }

  // src/index.ts
  var device = new GFXDevice();
  var encoder = device.encoder;
  var engine = new Engine();
  var camera = new Camera();
  camera.location.set(4, 4, 4);
  camera.look_at(ZERO);
  camera.perspective(45, window.innerWidth / window.innerHeight, 1, 1e3);
  var control = new SphericalControl(camera);
  var pipeline = create_default_pipeline();
  var action = {
    clear_color: new ColorRGBA2(0.1, 0.1, 0.3, 1),
    clear_depth: 1,
    type: 7 /* ClearAll */
  };
  var cube = create_box_mesh();
  function frame() {
    control.update();
    encoder.clear(action);
    encoder.set_pipeline(pipeline);
    encoder.set_camera(camera);
    encoder.draw_mesh(create_gpu_mesh(cube));
    encoder.commit();
  }
  EventHub.on(EngineEvent.Frame, frame);
  engine.start();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vdW5pb24vc3JjL2FkdC9mbGV4X2J1ZmZlcl92aWV3LnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9hZHQvb3JkZXJlZF9tYXAudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL2FkdC9wb29sLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9hZHQvcHRyZWUudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL21lbW9yeS9mb290cHJpbnQudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL21hdGgvbWF0aC50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvbWF0aC9zaW1kLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9tYXRoL2JveC50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvbWF0aC9jb2xvci50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvbWF0aC9zaW1kX21hdC50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvbWF0aC9yYXkudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL21hdGgvcmVjdC50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvbWF0aC9zaW1kX3F1YXRlcm5pb24udHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL21lbW9yeS9oZWFwLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9tYXRoL3NwaGVyaWNhbC50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvZW5naW5lL2NhbWVyYS50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvZW5naW5lL2V2ZW50LnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9lbmdpbmUvZ2xvYmFsX2V2ZW50LnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9pbnB1dC9icm93c2VyX2lucHV0LnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9pbnB1dC9pbnB1dC50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvZW5naW5lL2VuZ2luZS50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvZW5naW5lL2ZyYW1lX2NhcHR1cmUudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL2FkdC9ibG9ja19hbGxvY2F0b3IudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL2dmeC9yZW5kZXIuY29tbWFuZC50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvZ2Z4L3JlbmRlci53b3JrZXIudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL3dlYmdwdS9kZXZpY2UudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL3dlYmdwdS9lbmNvZGVyLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9nZngvZ2Z4X2RldmljZS50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvc3RkL3R5cGUudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL3dvcmtlci93ZWJfd29ya2VyLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9nZngvZ2Z4X2RldmljZV9jbGllbnQudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL3dlYmdsL2Jsb2NrLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy93ZWJnbC90eXBlLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy93ZWJnbC9kcmF3LnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy93ZWJnbC9leHRlbnNpb25zLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9zdGQvbnVtZXJpYy50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvd2ViZ2wvdGV4dHVyZV9zbG90LnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy93ZWJnbC9waXBlbGluZS50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvd2ViZ2wvZW5jb2Rlci50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvZW5naW5lL3NwaGVyaWNhbF9jb250cm9sLnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9lbmdpbmUvdmVydGV4X2RhdGEudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL3dlYmdsL21lc2gudHMiLCAiLi4vLi4vLi4vdW5pb24vc3JjL3dlYmdsL3ByaW1pdGl2ZS50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvbWF0aC90YW5nZW50LnRzIiwgIi4uLy4uLy4uL3VuaW9uL3NyYy9tZXNoL2J1aWx0aW5fbWVzaC50cyIsICIuLi8uLi8uLi91bmlvbi9zcmMvbWVzaC9ib3hfbWVzaC50cyIsICIuLi9zcmMvcGlwZWxpbmUudHMiLCAiLi4vc3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBCdWZmZXJSYW5nZSB9IGZyb20gJy4vdHlwZSc7XG5cbmV4cG9ydCBjbGFzcyBGbGV4QnVmZmVyVmlldyB7XG4gICAgZjMyX3ZpZXc6IEZsb2F0MzJBcnJheTtcbiAgICB1MzJfdmlldzogVWludDMyQXJyYXk7XG4gICAgdThfdmlldzogVWludDhBcnJheTtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBidWZmZXI6IEFycmF5QnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDAsIGJ5dGVfbGVuZ3RoOiBudW1iZXIgPSBidWZmZXIuYnl0ZUxlbmd0aCkge1xuICAgICAgICB0aGlzLmYzMl92aWV3ID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIsIG9mZnNldCwgYnl0ZV9sZW5ndGggLyA0KTtcbiAgICAgICAgdGhpcy51MzJfdmlldyA9IG5ldyBVaW50MzJBcnJheShidWZmZXIsIG9mZnNldCwgYnl0ZV9sZW5ndGggLyA0KTtcbiAgICAgICAgdGhpcy51OF92aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCBvZmZzZXQsIGJ5dGVfbGVuZ3RoKTtcbiAgICB9XG5cbiAgICBzdWJfdmlldyhyYW5nZTogQnVmZmVyUmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbGV4QnVmZmVyVmlldyh0aGlzLmJ1ZmZlciwgcmFuZ2UuYnl0ZV9vZmZzZXQsIHJhbmdlLmJ5dGVfbGVuZ3RoKTtcbiAgICB9XG59IiwgImV4cG9ydCB0eXBlIE1hcEtleSA9IHN0cmluZyB8IG51bWJlcjtcblxuZXhwb3J0IGNsYXNzIE9yZGVyZWRNYXA8SyA9IE1hcEtleSwgViA9IGFueT4ge1xuICAgIHByaXZhdGUgbWFwOiBNYXA8SywgVj4gPSBuZXcgTWFwKCk7XG4gICAgcHJpdmF0ZSBsaXN0OiBBcnJheTxLPiA9IFtdO1xuXG4gICAgY29uc3RydWN0b3Ioc291cmNlPzogQXJyYXk8eyBrZXk6IEs7IHZhbHVlOiBWIH0+IHwgSXRlcmFibGU8eyBrZXk6IEs7IHZhbHVlOiBWIH0+IHwgeyBba2V5OiBzdHJpbmddOiBWIH0pIHtcbiAgICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgc291cmNlLmZvckVhY2goKHBhaXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0KHBhaXIua2V5LCBwYWlyLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0LnB1c2gocGFpci5rZXkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgKHNvdXJjZSBhcyBhbnkpW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2Ygc291cmNlIGFzIEl0ZXJhYmxlPHsga2V5OiBLOyB2YWx1ZTogViB9Pikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXQocGFpci5rZXksIHBhaXIudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3QucHVzaChwYWlyLmtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc291cmNlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSkuc29ydCgpIGFzIEtbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmogPSBzb3VyY2UgYXMgeyBba2V5OiBzdHJpbmddOiBWIH07XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubGlzdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXQobmFtZSBhcyBLLCBvYmpbbmFtZSBhcyBzdHJpbmddIGFzIFYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBzZXQoa2V5OiBLLCB2YWx1ZTogVikge1xuICAgICAgICBpZiAoIXRoaXMubWFwLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3QucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFwLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQoa2V5OiBLKTogViB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICB9XG5cbiAgICBpbmRleF9vZih2YWx1ZTogVik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QuaW5kZXhPZih2YWx1ZSBhcyBhbnkpO1xuICAgIH1cblxuICAgIGF0KGluZGV4OiBudW1iZXIpOiBWIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMubGlzdC5sZW5ndGggLSAxKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC5nZXQodGhpcy5saXN0W2luZGV4XSk7XG4gICAgfVxuXG4gICAgcmVwbGFjZV9hdChpbmRleDogbnVtYmVyLCBuZXdfa2V5OiBLLCB2YWx1ZT86IFYpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMubGlzdC5sZW5ndGggLSAxKSByZXR1cm47XG4gICAgICAgIGNvbnN0IG9sZF9rZXkgPSB0aGlzLmxpc3RbaW5kZXhdO1xuICAgICAgICB0aGlzLmxpc3RbaW5kZXhdID0gbmV3X2tleTtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA/PyB0aGlzLm1hcC5nZXQob2xkX2tleSkhO1xuICAgICAgICB0aGlzLm1hcC5kZWxldGUob2xkX2tleSk7XG4gICAgICAgIHRoaXMubWFwLnNldChuZXdfa2V5LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmVwbGFjZShvbGRfa2V5OiBLLCBuZXdfa2V5OiBLLCB2YWx1ZT86IFYpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmxpc3QuaW5kZXhPZihvbGRfa2V5KTtcbiAgICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlcGxhY2VfYXQoaW5kZXgsIG5ld19rZXksIHZhbHVlKTtcbiAgICB9XG5cbiAgICBzd2FwKGluZGV4X2E6IG51bWJlciwgaW5kZXhfYjogbnVtYmVyKSB7XG4gICAgICAgIGlmIChpbmRleF9hIDwgMCB8fCBpbmRleF9hID4gdGhpcy5saXN0Lmxlbmd0aCAtIDEpIHJldHVybjtcbiAgICAgICAgaWYgKGluZGV4X2IgPCAwIHx8IGluZGV4X2IgPiB0aGlzLmxpc3QubGVuZ3RoIC0gMSkgcmV0dXJuO1xuICAgICAgICBpZiAoaW5kZXhfYSA9PT0gaW5kZXhfYikgcmV0dXJuO1xuICAgICAgICBjb25zdCBrZXlfYSA9IHRoaXMubGlzdFtpbmRleF9hXTtcbiAgICAgICAgY29uc3Qga2V5X2IgPSB0aGlzLmxpc3RbaW5kZXhfYl07XG4gICAgICAgIHRoaXMubGlzdFtpbmRleF9hXSA9IGtleV9iO1xuICAgICAgICB0aGlzLmxpc3RbaW5kZXhfYl0gPSBrZXlfYTtcbiAgICB9XG5cbiAgICBkZWxldGUoa2V5OiBLKSB7XG4gICAgICAgIGlmICh0aGlzLm1hcC5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdGhpcy5tYXAuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICB0aGlzLmxpc3Quc3BsaWNlKHRoaXMubGlzdC5pbmRleE9mKGtleSksIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVsZXRlX3ZhbHVlKHZhbHVlOiBWKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5saXN0LmluZGV4T2YodmFsdWUgYXMgYW55KTtcbiAgICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmRlbGV0ZV9hdChpbmRleCk7XG4gICAgfVxuXG4gICAgZGVsZXRlX2F0KGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMubGlzdC5sZW5ndGggLSAxKSByZXR1cm47XG4gICAgICAgIHRoaXMuZGVsZXRlKHRoaXMubGlzdFtpbmRleF0pO1xuICAgIH1cblxuICAgIGhhcyhrZXk6IEspIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmhhcyhrZXkpO1xuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLmxpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5tYXAuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAqW1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmF0b3I8W0ssIFZdPiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5saXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmxpc3RbaV07XG4gICAgICAgICAgICB5aWVsZCBba2V5LCB0aGlzLm1hcC5nZXQoa2V5KSFdO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwgImltcG9ydCB7IENvbnN0cnVjdG9yIH0gZnJvbSAnLi4vc3RkL3R5cGUnO1xuXG5pbnRlcmZhY2UgVHlwZWRQb29sPFQ+IHtcbiAgICBmcmVlOiBTZXQ8VD47XG4gICAgcHJlc2VydmVkOiBTZXQ8VD47XG59XG5cbmxldCBfdHJhY2VfZW5hYmxlZCA9IGZhbHNlO1xuXG5jb25zdCBfcG9vbF9tYXAgPSBuZXcgTWFwPENvbnN0cnVjdG9yPGFueT4sIFR5cGVkUG9vbDxhbnk+PigpO1xuY29uc3QgX29iamVjdF9tYXAgPSBuZXcgV2Vha01hcDxhbnksIFR5cGVkUG9vbDxhbnk+PigpO1xuY29uc3QgX29iamVjdF90cmFjZSA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4vKipcbiAqIEB3YXJuaW5nIERPIE5PVCBVU0UgVEhJUyBGVU5DVElPTiBJTiBBIEhJR0ggRlJFUVVFTkNZIExPT1BcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvb2xfZ2V0PFQ+KGNvbnN0cnVjdG9yOiBDb25zdHJ1Y3RvcjxUPik6IFQge1xuICAgIGxldCBwb29sID0gX3Bvb2xfbWFwLmdldChjb25zdHJ1Y3Rvcik7XG4gICAgaWYgKCFwb29sKSB7XG4gICAgICAgIHBvb2wgPSB7XG4gICAgICAgICAgICBmcmVlOiBuZXcgU2V0PFQ+KCksXG4gICAgICAgICAgICBwcmVzZXJ2ZWQ6IG5ldyBTZXQ8VD4oKSxcbiAgICAgICAgfTtcbiAgICAgICAgX3Bvb2xfbWFwLnNldChjb25zdHJ1Y3RvciwgcG9vbCk7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlOiBUO1xuICAgIGlmIChwb29sLmZyZWUuc2l6ZSA+IDApIHtcbiAgICAgICAgaW5zdGFuY2UgPSBwb29sLmZyZWUudmFsdWVzKCkubmV4dCgpLnZhbHVlO1xuICAgICAgICBwb29sLmZyZWUuZGVsZXRlKGluc3RhbmNlKTtcbiAgICAgICAgcG9vbC5wcmVzZXJ2ZWQuYWRkKGluc3RhbmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0YW5jZSA9IG5ldyBjb25zdHJ1Y3RvcigpO1xuICAgICAgICBfb2JqZWN0X21hcC5zZXQoaW5zdGFuY2UsIHBvb2wpO1xuICAgICAgICBwb29sLnByZXNlcnZlZC5hZGQoaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIGlmIChfdHJhY2VfZW5hYmxlZCkge1xuICAgICAgICBfb2JqZWN0X3RyYWNlLnNldChpbnN0YW5jZSwgbmV3IEVycm9yKCkuc3RhY2shKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8qKlxuICogQHdhcm5pbmcgRE8gTk9UIFVTRSBUSElTIEZVTkNUSU9OIElOIEEgSElHSCBGUkVRVUVOQ1kgTE9PUFxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9vbF9yZXR1cm48VD4oaW5zdGFuY2U6IFQpOiB2b2lkIHtcbiAgICBjb25zdCBwb29sID0gX29iamVjdF9tYXAuZ2V0KGluc3RhbmNlKTtcbiAgICBpZiAoIXBvb2wpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtwb29sXSBwb29sX3JldHVybjogcG9vbCBmb3IgJHtpbnN0YW5jZX0gbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXBvb2wucHJlc2VydmVkLmhhcyhpbnN0YW5jZSkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtwb29sXSBwb29sX3JldHVybjogaW5zdGFuY2Ugbm90IGZvdW5kIGluIHBvb2xgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHBvb2wucHJlc2VydmVkLmRlbGV0ZShpbnN0YW5jZSk7XG4gICAgcG9vbC5mcmVlLmFkZChpbnN0YW5jZSk7XG4gICAgaWYgKF90cmFjZV9lbmFibGVkKSBfb2JqZWN0X3RyYWNlLmRlbGV0ZShpbnN0YW5jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb29sX3RyYWNlKGVuYWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgIF90cmFjZV9lbmFibGVkID0gZW5hYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9vbF9kaWFnbm9zZSgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBfb2JqZWN0X3RyYWNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbb2JqZWN0XSAke2tleX0gbGVha2VkIGF0ICR7dmFsdWV9YCk7XG4gICAgfVxufSIsICJleHBvcnQgY2xhc3MgUG9seU5vZGU8VCBleHRlbmRzIFBvbHlOb2RlPFQ+PiB7XG4gICAgY2hpbGRyZW46IEFycmF5PFQ+ID0gW107XG5cbiAgICBwYXJlbnQ6IFQgfCB1bmRlZmluZWQ7XG5cbiAgICBnZXQgaXNfcm9vdCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50ID09PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2FuX2FkZD86IChub2RlOiBUKSA9PiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG4gICAgYWRkKG5vZGU6IFQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuY2FuX2FkZCAmJiB0aGlzLmNhbl9hZGQobm9kZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChub2RlLnBhcmVudCkge1xuICAgICAgICAgICAgbm9kZS5wYXJlbnQucmVtb3ZlKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgbm9kZS5wYXJlbnQgPSB0aGlzIGFzIGFueTtcbiAgICB9XG5cbiAgICByZW1vdmUobm9kZTogVCk6IHZvaWQge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihub2RlKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFzKG5vZGU6IFQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uaW5kZXhPZihub2RlKSA+IC0xO1xuICAgIH1cblxuICAgIHNlcmlhbGl6ZSgpOiBhbnkgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGRlc2VyaWFsaXplKGRhdGE6IGFueSkge1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb2x5Tm9kZURhdGEge1xuICAgIGNoaWxkcmVuOiBudW1iZXJbXTtcbiAgICBkYXRhOiBhbnk7XG4gICAgaWQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQVHJlZURhdGEge1xuICAgIG5vZGVzOiBQb2x5Tm9kZURhdGFbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB0cmVlX3NlcmlhbGl6ZTxUIGV4dGVuZHMgUG9seU5vZGU8VD4+KHJvb3Q6IFBvbHlOb2RlPFQ+KSB7XG4gICAgY29uc3QgZGF0YV9ub2RlczogUG9seU5vZGVEYXRhW10gPSBbXTtcbiAgICBjb25zdCBub2RlX21hcCA9IG5ldyBXZWFrTWFwPFBvbHlOb2RlPFQ+LCBQb2x5Tm9kZURhdGE+KCk7XG4gICAgY29uc3QgcXVldWU6IFBvbHlOb2RlPFQ+W10gPSBbcm9vdF07XG4gICAgbGV0IGlkID0gMDtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBub2RlID0gcXVldWUuc2hpZnQoKSE7XG4gICAgICAgIGNvbnN0IG5vZGVfaWQgPSBpZCsrO1xuICAgICAgICBjb25zdCBkYXRhX25vZGUgPSBwb2x5X25vZGVfc2VyaWFsaXplKG5vZGUsIG5vZGVfaWQpO1xuXG4gICAgICAgIG5vZGVfbWFwLnNldChub2RlLCBkYXRhX25vZGUpO1xuICAgICAgICBkYXRhX25vZGVzLnB1c2goZGF0YV9ub2RlKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goY2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRfZGF0YSA9IG5vZGVfbWFwLmdldChub2RlLnBhcmVudCEpO1xuICAgICAgICAgICAgaWYgKHBhcmVudF9kYXRhKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50X2RhdGEuY2hpbGRyZW4ucHVzaChub2RlX2lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGRhdGE6IFBUcmVlRGF0YSA9IHsgbm9kZXM6IGRhdGFfbm9kZXMgfTtcbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gcG9seV9ub2RlX3NlcmlhbGl6ZShub2RlOiBQb2x5Tm9kZTxhbnk+LCBpZDogbnVtYmVyKTogUG9seU5vZGVEYXRhIHtcbiAgICByZXR1cm4geyBpZCwgZGF0YTogbm9kZS5zZXJpYWxpemU/LigpLCBjaGlsZHJlbjogW10gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB0cmVlX2Rlc2VyaWFsaXplPFQgZXh0ZW5kcyBQb2x5Tm9kZTxUPj4oZGF0YTogUFRyZWVEYXRhLCBjb25zdHJ1Y3Rvcj86IENvbnN0cnVjdG9yPFQ+KTogVCB7XG4gICAgY29uc3Qgbm9kZV9tYXAgPSBuZXcgTWFwPG51bWJlciwgUG9seU5vZGU8VD4+KCk7XG5cbiAgICBmb3IgKGNvbnN0IGRhdGFfbm9kZSBvZiBkYXRhLm5vZGVzKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBwb2x5X25vZGVfZGVzZXJpYWxpemU8VD4oZGF0YV9ub2RlLCBjb25zdHJ1Y3Rvcik7XG4gICAgICAgIG5vZGVfbWFwLnNldChkYXRhX25vZGUuaWQsIG5vZGUpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZGF0YV9ub2RlIG9mIGRhdGEubm9kZXMpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVfbWFwLmdldChkYXRhX25vZGUuaWQpITtcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZF9pZCBvZiBkYXRhX25vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZV9tYXAuZ2V0KGNoaWxkX2lkKSE7XG4gICAgICAgICAgICBub2RlLmFkZChjaGlsZCBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdCA9IG5vZGVfbWFwLmdldCgwKSE7XG4gICAgcmV0dXJuIHJvb3QgYXMgVDtcbn1cblxuZnVuY3Rpb24gcG9seV9ub2RlX2Rlc2VyaWFsaXplPFQgZXh0ZW5kcyBQb2x5Tm9kZTxUPj4oZGF0YV9ub2RlOiBQb2x5Tm9kZURhdGEsIGNvbnN0cnVjdG9yPzogQ29uc3RydWN0b3I8VD4pOiBQb2x5Tm9kZTxUPiB7XG4gICAgY29uc3Qgbm9kZSA9IG5ldyAoY29uc3RydWN0b3IgPz8gUG9seU5vZGU8VD4pKCk7XG4gICAgbm9kZS5kZXNlcmlhbGl6ZT8uKGRhdGFfbm9kZS5kYXRhKTtcbiAgICByZXR1cm4gbm9kZTtcbn1cblxuXG5leHBvcnQgdHlwZSBQb2x5Tm9kZVZpc2l0b3I8VCBleHRlbmRzIFBvbHlOb2RlPFQ+PiA9IChub2RlOiBUKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gcG9seV9ub2RlX3RyYXZlcnNlX2RmczxUIGV4dGVuZHMgUG9seU5vZGU8VD4+KHJvb3Q6IFQsIHZpc2l0b3I6IFBvbHlOb2RlVmlzaXRvcjxUPikge1xuICAgIHZpc2l0b3Iocm9vdCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb290LmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHBvbHlfbm9kZV90cmF2ZXJzZV9kZnMocm9vdC5jaGlsZHJlbltpXSwgdmlzaXRvcik7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9seV9ub2RlX3RyYXZlcnNlX2JmczxUIGV4dGVuZHMgUG9seU5vZGU8VD4+KHJvb3Q6IFQsIHZpc2l0b3I6IFBvbHlOb2RlVmlzaXRvcjxUPikge1xuICAgIGNvbnN0IHF1ZXVlOiBUW10gPSBbcm9vdF07XG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHF1ZXVlLnNoaWZ0KCkhO1xuICAgICAgICB2aXNpdG9yKG5vZGUpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2gobm9kZS5jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICB9XG59IiwgImxldCBnbG9iYWxfZm9vdF9wcmludCA9IDA7XG5leHBvcnQgZnVuY3Rpb24gZm9vdHByaW50X2dldCgpIHtcbiAgICByZXR1cm4gZ2xvYmFsX2Zvb3RfcHJpbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb290cHJpbnRfcmVzZXQoKSB7XG4gICAgZ2xvYmFsX2Zvb3RfcHJpbnQgPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9vdHByaW50X2FsbG9jKHNpemU6IG51bWJlcikge1xuICAgIGdsb2JhbF9mb290X3ByaW50ICs9IHNpemU7XG59IiwgImV4cG9ydCBjb25zdCBEZWdyZWVUb1JhZGlhbiA9IE1hdGguUEkgLyAxODA7XG5leHBvcnQgY29uc3QgUmFkaWFuVG9EZWdyZWUgPSAxODAgLyBNYXRoLlBJO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVnMnJhZChkZWc6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGRlZyAqIERlZ3JlZVRvUmFkaWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmFkMmRlZyhyYWQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHJhZCAqIFJhZGlhblRvRGVncmVlO1xufVxuXG5leHBvcnQgY29uc3QgRSA9IDIuNzE4MjgxODI4NDtcbmV4cG9ydCBjb25zdCBQSSA9IDMuMTQxNTkyNjUzO1xuZXhwb3J0IGNvbnN0IEVQU0lMT04gPSAxZS00O1xuXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAoaTogbnVtYmVyLCBiOiBudW1iZXIsIHQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGksIHQpLCBiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxlcnAoYTogbnVtYmVyLCBiOiBudW1iZXIsIGk6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGEgKyAoYiAtIGEpICogaTtcbn1cbiIsICJpbXBvcnQgeyBmb290cHJpbnRfYWxsb2MgfSBmcm9tICcuLi9tZW1vcnkvZm9vdHByaW50JztcbmltcG9ydCB7IEhlYXBQb2ludGVyIH0gZnJvbSAnLi4vbWVtb3J5L2hlYXBfcG9pbnRlcic7XG5pbXBvcnQgeyBUeXBlZEFycmF5IH0gZnJvbSAnLi4vc3RkL3R5cGUnO1xuaW1wb3J0IHsgY2xhbXAsIGxlcnAgfSBmcm9tICcuL21hdGgnO1xuaW1wb3J0IHsgTWF0MywgTWF0NCB9IGZyb20gJy4vc2ltZF9tYXQnO1xuaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vc2ltZF9xdWF0ZXJuaW9uJztcbmltcG9ydCB7IFNwaGVyaWNhbCB9IGZyb20gJy4vc3BoZXJpY2FsJztcblxuZXhwb3J0IGNsYXNzIEZsb2F0MiBpbXBsZW1lbnRzIEhlYXBQb2ludGVyIHtcbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF07XG4gICAgfVxuICAgIHNldCB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgc2V0IHkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgc2l6ZSA9IDI7XG4gICAgZWxlbWVudHMgPSBuZXcgRmxvYXQzMkFycmF5KDIpO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCkge1xuICAgICAgICB0aGlzLnNldCh4LCB5KTtcbiAgICAgICAgZm9vdHByaW50X2FsbG9jKDIpO1xuICAgIH1cblxuICAgIHJlYWQoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gYnVmZmVyW29mZnNldF07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSBidWZmZXJbb2Zmc2V0ICsgMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdyaXRlKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgYnVmZmVyW29mZnNldF0gPSB0aGlzLmVsZW1lbnRzWzBdO1xuICAgICAgICBidWZmZXJbb2Zmc2V0ICsgMV0gPSB0aGlzLmVsZW1lbnRzWzFdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBGbG9hdDIge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0geDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkoYTogRmxvYXQyKTogRmxvYXQyIHtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5zZXQoYS5lbGVtZW50cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb25lKCk6IEZsb2F0MiB7XG4gICAgICAgIHJldHVybiBuZXcgRmxvYXQyKHRoaXMuZWxlbWVudHNbMF0sIHRoaXMuZWxlbWVudHNbMV0pO1xuICAgIH1cblxuICAgIHJvdGF0ZShhbmdsZTogbnVtYmVyLCBjZW50ZXI/OiBGbG9hdDIpOiBGbG9hdDIge1xuICAgICAgICBpZiAoY2VudGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNlbnRlciA9IF9jZW50ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oYW5nbGUpO1xuXG4gICAgICAgIGNvbnN0IHggPSB0aGlzLmVsZW1lbnRzWzBdIC0gY2VudGVyLng7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLmVsZW1lbnRzWzFdIC0gY2VudGVyLnk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHggKiBjIC0geSAqIHMgKyBjZW50ZXIueDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IHggKiBzICsgeSAqIGMgKyBjZW50ZXIueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGlzdGFuY2UoYTogRmxvYXQyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3RhbmNlX3NxdWFyZWQoYSkpO1xuICAgIH1cblxuICAgIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmVsZW1lbnRzWzBdICogdGhpcy5lbGVtZW50c1swXSArIHRoaXMuZWxlbWVudHNbMV0gKiB0aGlzLmVsZW1lbnRzWzFdKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKTogRmxvYXQyIHtcbiAgICAgICAgY29uc3QgaW52X2xlbmd0aCA9IDEuMCAvIHRoaXMubGVuZ3RoO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICo9IGludl9sZW5ndGg7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKj0gaW52X2xlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYWRkKGE6IEZsb2F0Mik6IEZsb2F0MiB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gKz0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSArPSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdWIoYTogRmxvYXQyKTogRmxvYXQyIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSAtPSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdIC09IGEuZWxlbWVudHNbMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bChuOiBudW1iZXIpOiBGbG9hdDIge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKj0gbjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZG90KGE6IEZsb2F0Mik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdICogYS5lbGVtZW50c1swXSArIHRoaXMuZWxlbWVudHNbMV0gKiBhLmVsZW1lbnRzWzFdO1xuICAgIH1cblxuICAgIGxlcnAoYTogRmxvYXQyLCBmOiBudW1iZXIpOiBGbG9hdDIge1xuICAgICAgICByZXR1cm4gRmxvYXQyLkxlcnAodGhpcywgYSwgZiwgdGhpcyk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2Vfc3F1YXJlZChhOiBGbG9hdDIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBkeCA9IHRoaXMuZWxlbWVudHNbMF0gLSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBkeSA9IHRoaXMuZWxlbWVudHNbMV0gLSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBbJHt0aGlzLmVsZW1lbnRzWzBdfSwgJHt0aGlzLmVsZW1lbnRzWzFdfV1gO1xuICAgIH1cblxuICAgIHN0YXRpYyBMZXJwKGE6IEZsb2F0MiwgYjogRmxvYXQyLCBmOiBudW1iZXIsIGRzdD86IEZsb2F0Mik6IEZsb2F0MiB7XG4gICAgICAgIGlmICghZHN0KSBkc3QgPSBuZXcgRmxvYXQyKCk7XG4gICAgICAgIGRzdC54ID0gYS5lbGVtZW50c1swXSArIChiLnggLSBhLmVsZW1lbnRzWzBdKSAqIGY7XG4gICAgICAgIGRzdC55ID0gYS5lbGVtZW50c1sxXSArIChiLnkgLSBhLmVsZW1lbnRzWzFdKSAqIGY7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxufVxuY29uc3QgX2NlbnRlciA9IG5ldyBGbG9hdDIoKTtcblxuZXhwb3J0IGNsYXNzIEZsb2F0MyBpbXBsZW1lbnRzIEhlYXBQb2ludGVyIHtcbiAgICBzaXplID0gMztcbiAgICBlbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoMyk7XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF07XG4gICAgfVxuICAgIHNldCB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgc2V0IHkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzJdO1xuICAgIH1cbiAgICBzZXQgeih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwKSB7XG4gICAgICAgIHRoaXMuc2V0KHgsIHksIHopO1xuICAgICAgICBmb290cHJpbnRfYWxsb2MoMyk7XG4gICAgfVxuXG4gICAgcmVhZChidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSBidWZmZXJbb2Zmc2V0XTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IGJ1ZmZlcltvZmZzZXQgKyAxXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IGJ1ZmZlcltvZmZzZXQgKyAyXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgd3JpdGUoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICBidWZmZXJbb2Zmc2V0XSA9IHRoaXMuZWxlbWVudHNbMF07XG4gICAgICAgIGJ1ZmZlcltvZmZzZXQgKyAxXSA9IHRoaXMuZWxlbWVudHNbMV07XG4gICAgICAgIGJ1ZmZlcltvZmZzZXQgKyAyXSA9IHRoaXMuZWxlbWVudHNbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHg7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSB5O1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gejtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3Jvc3MoYjogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0My5Dcm9zcyh0aGlzLCBiLCB0aGlzKTtcbiAgICB9XG5cbiAgICBmcm9tX3NwaGVyaWNhbChzOiBTcGhlcmljYWwpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gRmxvYXQzLkZyb21TcGhlcmljYWwocywgdGhpcyk7XG4gICAgfVxuXG4gICAgYXBwbHlfcXVhdGVybmlvbihxOiBRdWF0ZXJuaW9uKTogRmxvYXQzIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0My5BcHBseVF1YXRlcm5pb24odGhpcywgcSwgdGhpcyk7XG4gICAgfVxuXG4gICAgYWRkKGE6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gKz0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSArPSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdICs9IGEuZWxlbWVudHNbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN1YihhOiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdIC09IGEuZWxlbWVudHNbMF07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gLT0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSAtPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWwobjogbnVtYmVyKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSAqPSBuO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gKj0gbjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsX3YoYTogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSAqPSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdICo9IGEuZWxlbWVudHNbMV07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gKj0gYS5lbGVtZW50c1syXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGl2KG46IG51bWJlcik6IEZsb2F0MyB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gLz0gbjtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSAvPSBuO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdIC89IG47XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRpdl92KGE6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gLz0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSAvPSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdIC89IGEuZWxlbWVudHNbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkoYTogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IGEuZWxlbWVudHNbMF07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gYS5lbGVtZW50c1syXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2xvbmUoKTogRmxvYXQzIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDModGhpcy5lbGVtZW50c1swXSwgdGhpcy5lbGVtZW50c1sxXSwgdGhpcy5lbGVtZW50c1syXSk7XG4gICAgfVxuXG4gICAgbGVycChiOiBGbG9hdDMsIGk6IG51bWJlcik6IEZsb2F0MyB7XG4gICAgICAgIHJldHVybiBGbG9hdDMuTGVycCh0aGlzLCBiLCBpLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0KG06IE1hdDQpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gRmxvYXQzLk11bHRpcGx5TWF0NCh0aGlzLCBtLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0X2RpcmVjdGlvbmFsKG06IE1hdDQpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gRmxvYXQzLk11bHRpcGx5TWF0NERpcmVjdGlvbmFsKHRoaXMsIG0sIHRoaXMpO1xuICAgIH1cblxuICAgIGRpc3RhbmNlKGE6IEZsb2F0Myk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZV9zcXVhcmVkKGEpKTtcbiAgICB9XG5cbiAgICBnZXQgbGVuZ3RoX3NxdWFyZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXSAqIHRoaXMuZWxlbWVudHNbMF0gKyB0aGlzLmVsZW1lbnRzWzFdICogdGhpcy5lbGVtZW50c1sxXSArIHRoaXMuZWxlbWVudHNbMl0gKiB0aGlzLmVsZW1lbnRzWzJdO1xuICAgIH1cblxuICAgIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmVsZW1lbnRzWzBdICogdGhpcy5lbGVtZW50c1swXSArIHRoaXMuZWxlbWVudHNbMV0gKiB0aGlzLmVsZW1lbnRzWzFdICsgdGhpcy5lbGVtZW50c1syXSAqIHRoaXMuZWxlbWVudHNbMl0pO1xuICAgIH1cblxuICAgIGRvdChhOiBGbG9hdDMpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXSAqIGEuZWxlbWVudHNbMF0gKyB0aGlzLmVsZW1lbnRzWzFdICogYS5lbGVtZW50c1sxXSArIHRoaXMuZWxlbWVudHNbMl0gKiBhLmVsZW1lbnRzWzJdO1xuICAgIH1cblxuICAgIG1pbihhOiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gTWF0aC5taW4odGhpcy5lbGVtZW50c1swXSwgYS5lbGVtZW50c1swXSk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSBNYXRoLm1pbih0aGlzLmVsZW1lbnRzWzFdLCBhLmVsZW1lbnRzWzFdKTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IE1hdGgubWluKHRoaXMuZWxlbWVudHNbMl0sIGEuZWxlbWVudHNbMl0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtYXgoYTogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IE1hdGgubWF4KHRoaXMuZWxlbWVudHNbMF0sIGEuZWxlbWVudHNbMF0pO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gTWF0aC5tYXgodGhpcy5lbGVtZW50c1sxXSwgYS5lbGVtZW50c1sxXSk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSBNYXRoLm1heCh0aGlzLmVsZW1lbnRzWzJdLCBhLmVsZW1lbnRzWzJdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCk6IEZsb2F0MyB7XG4gICAgICAgIGNvbnN0IGludl9sZW5ndGggPSAxLjAgLyB0aGlzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSAqPSBpbnZfbGVuZ3RoO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdICo9IGludl9sZW5ndGg7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gKj0gaW52X2xlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGlzdGFuY2Vfc3F1YXJlZChhOiBGbG9hdDMpOiBudW1iZXIge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5lbGVtZW50c1swXSAtIGEuZWxlbWVudHNbMF07XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLmVsZW1lbnRzWzFdIC0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgY29uc3QgeiA9IHRoaXMuZWxlbWVudHNbMl0gLSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgWyR7dGhpcy5lbGVtZW50c1swXX0sICR7dGhpcy5lbGVtZW50c1sxXX0sICR7dGhpcy5lbGVtZW50c1syXX1dYDtcbiAgICB9XG5cbiAgICBzdGF0aWMgSXNaZXJvKHNyYzogRmxvYXQzKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzcmMueCA9PT0gMCAmJiBzcmMueSA9PT0gMCAmJiBzcmMueiA9PT0gMDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRXF1YWxzKGE6IEZsb2F0MywgYjogRmxvYXQzKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBhLmVsZW1lbnRzWzBdID09PSBiLmVsZW1lbnRzWzBdICYmIGEuZWxlbWVudHNbMV0gPT09IGIuZWxlbWVudHNbMV0gJiYgYS5lbGVtZW50c1syXSA9PT0gYi5lbGVtZW50c1syXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgQWJzKHNyYzogRmxvYXQzLCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGRzdC54ID0gTWF0aC5hYnMoc3JjLngpO1xuICAgICAgICBkc3QueSA9IE1hdGguYWJzKHNyYy55KTtcbiAgICAgICAgZHN0LnogPSBNYXRoLmFicyhzcmMueik7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIENsYW1wKHNyYzogRmxvYXQzLCBtaW46IEZsb2F0MywgbWF4OiBGbG9hdDMsIGRzdDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgZHN0LnggPSBjbGFtcChzcmMueCwgbWluLngsIG1heC54KTtcbiAgICAgICAgZHN0LnkgPSBjbGFtcChzcmMueSwgbWluLnksIG1heC55KTtcbiAgICAgICAgZHN0LnogPSBjbGFtcChzcmMueiwgbWluLnosIG1heC56KTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgU2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIGRzdDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgZHN0LnggPSB4O1xuICAgICAgICBkc3QueSA9IHk7XG4gICAgICAgIGRzdC56ID0gejtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgQ29weShzcmM6IEZsb2F0MywgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QueCA9IHNyYy54O1xuICAgICAgICBkc3QueSA9IHNyYy55O1xuICAgICAgICBkc3QueiA9IHNyYy56O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBTd2FwKGE6IEZsb2F0MywgYjogRmxvYXQzKSB7XG4gICAgICAgIFthLmVsZW1lbnRzWzBdLCBiLnhdID0gW2IueCwgYS5lbGVtZW50c1swXV07XG4gICAgICAgIFthLmVsZW1lbnRzWzFdLCBiLnldID0gW2IueSwgYS5lbGVtZW50c1sxXV07XG4gICAgICAgIFthLmVsZW1lbnRzWzJdLCBiLnpdID0gW2IueiwgYS5lbGVtZW50c1syXV07XG4gICAgfVxuXG4gICAgc3RhdGljIEFkZChhOiBGbG9hdDMsIGI6IEZsb2F0MywgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QueCA9IGEuZWxlbWVudHNbMF0gKyBiLng7XG4gICAgICAgIGRzdC55ID0gYS5lbGVtZW50c1sxXSArIGIueTtcbiAgICAgICAgZHN0LnogPSBhLmVsZW1lbnRzWzJdICsgYi56O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBTdWJ0cmFjdChhOiBGbG9hdDMsIGI6IEZsb2F0MywgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QueCA9IGEuZWxlbWVudHNbMF0gLSBiLng7XG4gICAgICAgIGRzdC55ID0gYS5lbGVtZW50c1sxXSAtIGIueTtcbiAgICAgICAgZHN0LnogPSBhLmVsZW1lbnRzWzJdIC0gYi56O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBEaXN0YW5jZShhOiBGbG9hdDMsIGI6IEZsb2F0Myk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBhLmRpc3RhbmNlKGIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBOb3JtYWxpemUoc3JjOiBGbG9hdDMsIGRzdDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgY29uc3QgaW52X2xlbmd0aCA9IDEuMCAvIHNyYy5sZW5ndGg7XG4gICAgICAgIGRzdC54ICo9IGludl9sZW5ndGg7XG4gICAgICAgIGRzdC55ICo9IGludl9sZW5ndGg7XG4gICAgICAgIGRzdC56ICo9IGludl9sZW5ndGg7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIE11bHRpcGx5KGE6IEZsb2F0MywgbjogbnVtYmVyLCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGRzdC54ID0gYS5lbGVtZW50c1swXSAqIG47XG4gICAgICAgIGRzdC55ID0gYS5lbGVtZW50c1sxXSAqIG47XG4gICAgICAgIGRzdC56ID0gYS5lbGVtZW50c1syXSAqIG47XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIE11bHRpcGx5RmxvYXQzKGE6IEZsb2F0MywgYjogRmxvYXQzLCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGRzdC54ID0gYS5lbGVtZW50c1swXSAqIGIueDtcbiAgICAgICAgZHN0LnkgPSBhLmVsZW1lbnRzWzFdICogYi55O1xuICAgICAgICBkc3QueiA9IGEuZWxlbWVudHNbMl0gKiBiLno7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIEFwcGx5UXVhdGVybmlvbihhOiBGbG9hdDMsIHE6IFF1YXRlcm5pb24sIGRzdD86IEZsb2F0Mykge1xuICAgICAgICBkc3QgPSBkc3QgPz8gbmV3IEZsb2F0MygpO1xuICAgICAgICBjb25zdCB4ID0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgY29uc3QgeSA9IGEuZWxlbWVudHNbMV07XG4gICAgICAgIGNvbnN0IHogPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICBjb25zdCBxeCA9IHEueDtcbiAgICAgICAgY29uc3QgcXkgPSBxLnk7XG4gICAgICAgIGNvbnN0IHF6ID0gcS56O1xuICAgICAgICBjb25zdCBxdyA9IHEudztcbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWN0b3JcblxuICAgICAgICBjb25zdCBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeTtcbiAgICAgICAgY29uc3QgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHo7XG4gICAgICAgIGNvbnN0IGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4O1xuICAgICAgICBjb25zdCBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgICAgICBkc3QueCA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gICAgICAgIGRzdC55ID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgICAgICAgZHN0LnogPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBEb3QoYTogRmxvYXQzLCBiOiBGbG9hdDMpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gYS5lbGVtZW50c1swXSAqIGIueCArIGEuZWxlbWVudHNbMV0gKiBiLnkgKyBhLmVsZW1lbnRzWzJdICogYi56O1xuICAgIH1cblxuICAgIHN0YXRpYyBDcm9zcyhhOiBGbG9hdDMsIGI6IEZsb2F0MywgZHN0OiBGbG9hdDMgPSBuZXcgRmxvYXQzKCkpOiBGbG9hdDMge1xuICAgICAgICBjb25zdCBheCA9IGEuZWxlbWVudHNbMF07XG4gICAgICAgIGNvbnN0IGF5ID0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgY29uc3QgYXogPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICBjb25zdCBieCA9IGIueDtcbiAgICAgICAgY29uc3QgYnkgPSBiLnk7XG4gICAgICAgIGNvbnN0IGJ6ID0gYi56O1xuXG4gICAgICAgIGRzdC54ID0gYXkgKiBieiAtIGF6ICogYnk7XG4gICAgICAgIGRzdC55ID0gYXogKiBieCAtIGF4ICogYno7XG4gICAgICAgIGRzdC56ID0gYXggKiBieSAtIGF5ICogYng7XG5cbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRnJvbVNwaGVyaWNhbChzOiBTcGhlcmljYWwsIGRzdDogRmxvYXQzID0gbmV3IEZsb2F0MygpKTogRmxvYXQzIHtcbiAgICAgICAgY29uc3Qgc2luUmFkaXVzID0gTWF0aC5zaW4ocy50aGV0YSkgKiBzLnJhZGl1cztcbiAgICAgICAgZHN0LnggPSBzaW5SYWRpdXMgKiBNYXRoLnNpbihzLnBoaSk7XG4gICAgICAgIGRzdC55ID0gTWF0aC5jb3Mocy50aGV0YSkgKiBzLnJhZGl1cztcbiAgICAgICAgZHN0LnogPSBzaW5SYWRpdXMgKiBNYXRoLmNvcyhzLnBoaSk7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIExlcnAoYTogRmxvYXQzLCBiOiBGbG9hdDMsIGk6IG51bWJlciwgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QueCA9IGxlcnAoYS5lbGVtZW50c1swXSwgYi54LCBpKTtcbiAgICAgICAgZHN0LnkgPSBsZXJwKGEuZWxlbWVudHNbMV0sIGIueSwgaSk7XG4gICAgICAgIGRzdC56ID0gbGVycChhLmVsZW1lbnRzWzJdLCBiLnosIGkpO1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBBZGRNdWx0aXBsaWVkKGE6IEZsb2F0MywgYjogRmxvYXQzLCBuOiBudW1iZXIsIGRzdDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgZHN0LnggPSBhLmVsZW1lbnRzWzBdICsgYi54ICogbjtcbiAgICAgICAgZHN0LnkgPSBhLmVsZW1lbnRzWzFdICsgYi55ICogbjtcbiAgICAgICAgZHN0LnogPSBhLmVsZW1lbnRzWzJdICsgYi56ICogbjtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTXVsdGlwbHlNYXQ0KGE6IEZsb2F0MywgbTogTWF0NCwgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBjb25zdCB4ID0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgY29uc3QgeSA9IGEuZWxlbWVudHNbMV07XG4gICAgICAgIGNvbnN0IHogPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICBjb25zdCBlID0gbS5lbGVtZW50cztcbiAgICAgICAgY29uc3QgdyA9IDEgLyAoZVszXSAqIHggKyBlWzddICogeSArIGVbMTFdICogeiArIGVbMTVdKTtcblxuICAgICAgICBkc3QueCA9IChlWzBdICogeCArIGVbNF0gKiB5ICsgZVs4XSAqIHogKyBlWzEyXSkgKiB3O1xuICAgICAgICBkc3QueSA9IChlWzFdICogeCArIGVbNV0gKiB5ICsgZVs5XSAqIHogKyBlWzEzXSkgKiB3O1xuICAgICAgICBkc3QueiA9IChlWzJdICogeCArIGVbNl0gKiB5ICsgZVsxMF0gKiB6ICsgZVsxNF0pICogdztcblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBNdWx0aXBseU1hdDMoYTogRmxvYXQzLCBtOiBNYXQzLCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGNvbnN0IHggPSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCB5ID0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgY29uc3QgeiA9IGEuZWxlbWVudHNbMl07XG4gICAgICAgIGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG4gICAgICAgIGRzdC54ID0gZVswXSAqIHggKyBlWzNdICogeSArIGVbNl0gKiB6O1xuICAgICAgICBkc3QueSA9IGVbMV0gKiB4ICsgZVs0XSAqIHkgKyBlWzddICogejtcbiAgICAgICAgZHN0LnogPSBlWzJdICogeCArIGVbNV0gKiB5ICsgZVs4XSAqIHo7XG5cbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTXVsdGlwbHlNYXQ0RGlyZWN0aW9uYWwoYTogRmxvYXQzLCBtOiBNYXQ0LCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGNvbnN0IHggPSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCB5ID0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgY29uc3QgeiA9IGEuZWxlbWVudHNbMl07XG4gICAgICAgIGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG4gICAgICAgIGRzdC54ID0gZVswXSAqIHggKyBlWzRdICogeSArIGVbOF0gKiB6O1xuICAgICAgICBkc3QueSA9IGVbMV0gKiB4ICsgZVs1XSAqIHkgKyBlWzldICogejtcbiAgICAgICAgZHN0LnogPSBlWzJdICogeCArIGVbNl0gKiB5ICsgZVsxMF0gKiB6O1xuXG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgWkVSTyA9IG5ldyBGbG9hdDMoMCwgMCwgMCk7XG5leHBvcnQgY29uc3QgT05FID0gbmV3IEZsb2F0MygxLCAxLCAxKTtcbmV4cG9ydCBjb25zdCBYID0gbmV3IEZsb2F0MygxLCAwLCAwKTtcbmV4cG9ydCBjb25zdCBZID0gbmV3IEZsb2F0MygwLCAxLCAwKTtcbmV4cG9ydCBjb25zdCBaID0gbmV3IEZsb2F0MygwLCAwLCAxKTtcbmV4cG9ydCBjb25zdCBORUdBVElWRV9YID0gbmV3IEZsb2F0MygtMSwgMCwgMCk7XG5leHBvcnQgY29uc3QgTkVHQVRJVkVfWSA9IG5ldyBGbG9hdDMoMCwgLTEsIDApO1xuZXhwb3J0IGNvbnN0IE5FR0FUSVZFX1ogPSBuZXcgRmxvYXQzKDAsIDAsIC0xKTtcblxuZXhwb3J0IGNsYXNzIEZsb2F0NCBpbXBsZW1lbnRzIEhlYXBQb2ludGVyIHtcbiAgICBzaXplID0gNDtcbiAgICBlbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoNCk7XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF07XG4gICAgfVxuICAgIHNldCB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgc2V0IHkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzJdO1xuICAgIH1cbiAgICBzZXQgeih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbM107XG4gICAgfVxuICAgIHNldCB3KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1szXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHo6IG51bWJlciA9IDAsIHc6IG51bWJlciA9IDApIHtcbiAgICAgICAgdGhpcy5zZXQoeCwgeSwgeiwgdyk7XG4gICAgICAgIGZvb3RwcmludF9hbGxvYyg0KTtcbiAgICB9XG5cbiAgICByZWFkKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IGJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gYnVmZmVyW29mZnNldCArIDFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gYnVmZmVyW29mZnNldCArIDJdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gYnVmZmVyW29mZnNldCArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB3cml0ZShidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIGJ1ZmZlcltvZmZzZXRdID0gdGhpcy5lbGVtZW50c1swXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDFdID0gdGhpcy5lbGVtZW50c1sxXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDJdID0gdGhpcy5lbGVtZW50c1syXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDNdID0gdGhpcy5lbGVtZW50c1szXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcik6IEZsb2F0NCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSB4O1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0geTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IHo7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSB3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KGE6IEZsb2F0NCk6IEZsb2F0NCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMuc2V0KGEuZWxlbWVudHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0KG06IE1hdDQpOiBGbG9hdDQge1xuICAgICAgICByZXR1cm4gRmxvYXQ0Lk11bHRpcGx5TWF0NCh0aGlzLCBtLCB0aGlzKTtcbiAgICB9XG5cbiAgICBjbG9uZSgpOiBGbG9hdDQge1xuICAgICAgICByZXR1cm4gbmV3IEZsb2F0NCh0aGlzLmVsZW1lbnRzWzBdLCB0aGlzLmVsZW1lbnRzWzFdLCB0aGlzLmVsZW1lbnRzWzJdLCB0aGlzLmVsZW1lbnRzWzNdKTtcbiAgICB9XG5cbiAgICBhbGxfemVybygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0gPT09IDAgJiYgdGhpcy5lbGVtZW50c1sxXSA9PT0gMCAmJiB0aGlzLmVsZW1lbnRzWzJdID09PSAwICYmIHRoaXMuZWxlbWVudHNbM10gPT09IDA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBbJHt0aGlzLmVsZW1lbnRzWzBdfSwgJHt0aGlzLmVsZW1lbnRzWzFdfSwgJHt0aGlzLmVsZW1lbnRzWzJdfSwgJHt0aGlzLmVsZW1lbnRzWzNdfV1gO1xuICAgIH1cblxuICAgIG11bChuOiBudW1iZXIpOiBGbG9hdDQge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKj0gbjtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSAqPSBuO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdICo9IG47XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGxlcnAoYjogRmxvYXQ0LCBmOiBudW1iZXIpOiB0aGlzIHtcbiAgICAgICAgRmxvYXQ0LkxlcnAodGhpcywgYiwgZiwgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBMZXJwKGE6IEZsb2F0NCwgYjogRmxvYXQ0LCBmOiBudW1iZXIsIGRzdDogRmxvYXQ0KTogRmxvYXQ0IHtcbiAgICAgICAgZHN0LnggPSBsZXJwKGEueCwgYi54LCBmKTtcbiAgICAgICAgZHN0LnkgPSBsZXJwKGEueSwgYi55LCBmKTtcbiAgICAgICAgZHN0LnkgPSBsZXJwKGEueiwgYi56LCBmKTtcbiAgICAgICAgZHN0LnkgPSBsZXJwKGEudywgYi53LCBmKTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTXVsdGlwbHlNYXQ0KGE6IEZsb2F0NCwgbTogTWF0NCwgZHN0OiBGbG9hdDQpOiBGbG9hdDQge1xuICAgICAgICBjb25zdCB4ID0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgY29uc3QgeSA9IGEuZWxlbWVudHNbMV07XG4gICAgICAgIGNvbnN0IHogPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICBjb25zdCB3ID0gYS5lbGVtZW50c1szXTtcbiAgICAgICAgY29uc3QgZSA9IG0uZWxlbWVudHM7XG5cbiAgICAgICAgZHN0LnggPSBlWzBdICogeCArIGVbNF0gKiB5ICsgZVs4XSAqIHogKyBlWzEyXSAqIHc7XG4gICAgICAgIGRzdC55ID0gZVsxXSAqIHggKyBlWzVdICogeSArIGVbOV0gKiB6ICsgZVsxM10gKiB3O1xuICAgICAgICBkc3QueiA9IGVbMl0gKiB4ICsgZVs2XSAqIHkgKyBlWzEwXSAqIHogKyBlWzE0XSAqIHc7XG4gICAgICAgIGRzdC53ID0gZVszXSAqIHggKyBlWzddICogeSArIGVbMTFdICogeiArIGVbMTVdICogdztcblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuL3NpbWQnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4vc2ltZF9tYXQnO1xuXG5jb25zdCBwb2ludHMgPSBbbmV3IEZsb2F0MygpLCBuZXcgRmxvYXQzKCksIG5ldyBGbG9hdDMoKSwgbmV3IEZsb2F0MygpLCBuZXcgRmxvYXQzKCksIG5ldyBGbG9hdDMoKSwgbmV3IEZsb2F0MygpLCBuZXcgRmxvYXQzKCldO1xuZXhwb3J0IGNsYXNzIEJveDMge1xuICAgIGNvbnN0cnVjdG9yKG1pbj86IEZsb2F0MywgbWF4PzogRmxvYXQzKSB7XG4gICAgICAgIGlmIChtaW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5taW4uY29weShtaW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5taW4uc2V0KE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5tYXguY29weShtYXgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tYXguc2V0KC1OdW1iZXIuTUFYX1ZBTFVFLCAtTnVtYmVyLk1BWF9WQUxVRSwgLU51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbWluOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG4gICAgbWF4OiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5cbiAgICBwcml2YXRlIF9zaXplOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG4gICAgcHJpdmF0ZSBfY2VudGVyOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5cbiAgICBnZXQgc2l6ZSgpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZS5jb3B5KHRoaXMubWF4KS5zdWIodGhpcy5taW4pIGFzIEZsb2F0MztcbiAgICB9XG5cbiAgICBnZXQgY2VudGVyKCk6IEZsb2F0MyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jZW50ZXIuY29weSh0aGlzLnNpemUpLm11bCgwLjUpLmFkZCh0aGlzLm1pbikgYXMgRmxvYXQzO1xuICAgIH1cblxuICAgIHNldChtaW46IEZsb2F0MywgbWF4OiBGbG9hdDMpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5taW4uY29weShtaW4pO1xuICAgICAgICB0aGlzLm1heC5jb3B5KG1heCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkoYTogQm94Myk6IHRoaXMge1xuICAgICAgICB0aGlzLm1pbi5jb3B5KGEubWluKTtcbiAgICAgICAgdGhpcy5tYXguY29weShhLm1heCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb25lKCk6IEJveDMge1xuICAgICAgICByZXR1cm4gbmV3IEJveDModGhpcy5taW4sIHRoaXMubWF4KTtcbiAgICB9XG5cbiAgICByZXNldCgpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5taW4uc2V0KE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgICB0aGlzLm1heC5zZXQoLU51bWJlci5NQVhfVkFMVUUsIC1OdW1iZXIuTUFYX1ZBTFVFLCAtTnVtYmVyLk1BWF9WQUxVRSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGV4cGFuZF9wb2ludChwb2ludDogRmxvYXQzKTogdGhpcyB7XG4gICAgICAgIHRoaXMubWluLm1pbihwb2ludCk7XG4gICAgICAgIHRoaXMubWF4Lm1heChwb2ludCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnRhaW5zX3BvaW50KHBvaW50OiBGbG9hdDMpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHBvaW50LnggPj0gdGhpcy5taW4ueCAmJiBwb2ludC54IDw9IHRoaXMubWF4LnggJiYgcG9pbnQueSA+PSB0aGlzLm1pbi55ICYmIHBvaW50LnkgPD0gdGhpcy5tYXgueSAmJiBwb2ludC56ID49IHRoaXMubWluLnogJiYgcG9pbnQueiA8PSB0aGlzLm1heC56O1xuICAgIH1cblxuICAgIGV4cGFuZF9ib3goYm94OiBCb3gzKTogdGhpcyB7XG4gICAgICAgIHRoaXMubWluLm1pbihib3gubWluKTtcbiAgICAgICAgdGhpcy5tYXgubWF4KGJveC5tYXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb250YWluc19ib3goYm94OiBCb3gzKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbi54IDw9IGJveC5taW4ueCAmJiB0aGlzLm1heC54ID49IGJveC5tYXgueCAmJiB0aGlzLm1pbi55IDw9IGJveC5taW4ueSAmJiB0aGlzLm1heC55ID49IGJveC5tYXgueSAmJiB0aGlzLm1pbi56IDw9IGJveC5taW4ueiAmJiB0aGlzLm1heC56ID49IGJveC5tYXguejtcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0KG06IE1hdDQpOiBCb3gzIHtcbiAgICAgICAgLy8gdXNpbmcgYSBiaW5hcnkgcGF0dGVybiB0byBzcGVjaWZ5IGFsbCAyXjMgY29tYmluYXRpb25zIGJlbG93XG4gICAgICAgIHBvaW50c1swXS5zZXQodGhpcy5taW4ueCwgdGhpcy5taW4ueSwgdGhpcy5taW4ueikuYXBwbHlfbWF0NChtKTsgLy8gMDAwXG4gICAgICAgIHBvaW50c1sxXS5zZXQodGhpcy5taW4ueCwgdGhpcy5taW4ueSwgdGhpcy5tYXgueikuYXBwbHlfbWF0NChtKTsgLy8gMDAxXG4gICAgICAgIHBvaW50c1syXS5zZXQodGhpcy5taW4ueCwgdGhpcy5tYXgueSwgdGhpcy5taW4ueikuYXBwbHlfbWF0NChtKTsgLy8gMDEwXG4gICAgICAgIHBvaW50c1szXS5zZXQodGhpcy5taW4ueCwgdGhpcy5tYXgueSwgdGhpcy5tYXgueikuYXBwbHlfbWF0NChtKTsgLy8gMDExXG4gICAgICAgIHBvaW50c1s0XS5zZXQodGhpcy5tYXgueCwgdGhpcy5taW4ueSwgdGhpcy5taW4ueikuYXBwbHlfbWF0NChtKTsgLy8gMTAwXG4gICAgICAgIHBvaW50c1s1XS5zZXQodGhpcy5tYXgueCwgdGhpcy5taW4ueSwgdGhpcy5tYXgueikuYXBwbHlfbWF0NChtKTsgLy8gMTAxXG4gICAgICAgIHBvaW50c1s2XS5zZXQodGhpcy5tYXgueCwgdGhpcy5tYXgueSwgdGhpcy5taW4ueikuYXBwbHlfbWF0NChtKTsgLy8gMTEwXG4gICAgICAgIHBvaW50c1s3XS5zZXQodGhpcy5tYXgueCwgdGhpcy5tYXgueSwgdGhpcy5tYXgueikuYXBwbHlfbWF0NChtKTsgLy8gMTExXG5cbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRfcG9pbnQocG9pbnRzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdyaXRlKGJ1ZmZlcjogRmxvYXQzMkFycmF5LCBvZmZzZXQ6IG51bWJlciA9IDApOiBCb3gzIHtcbiAgICAgICAgdGhpcy5taW4ud3JpdGUoYnVmZmVyLCBvZmZzZXQpO1xuICAgICAgICB0aGlzLm1heC53cml0ZShidWZmZXIsIG9mZnNldCArIDMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZWFkKGJ1ZmZlcjogRmxvYXQzMkFycmF5LCBvZmZzZXQ6IG51bWJlciA9IDApOiBCb3gzIHtcbiAgICAgICAgdGhpcy5taW4ucmVhZChidWZmZXIsIG9mZnNldCk7XG4gICAgICAgIHRoaXMubWF4LnJlYWQoYnVmZmVyLCBvZmZzZXQgKyAzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0X2NlbnRlcihjZW50ZXI6IEZsb2F0Myk6IEJveDMge1xuICAgICAgICBjb25zdCBzaXplID0gdGhpcy5zaXplO1xuXG4gICAgICAgIGNvbnN0IGhhbGZfeCA9IHNpemUueCAqIDAuNTtcbiAgICAgICAgY29uc3QgaGFsZl95ID0gc2l6ZS55ICogMC41O1xuICAgICAgICBjb25zdCBoYWxmX3ogPSBzaXplLnogKiAwLjU7XG5cbiAgICAgICAgdGhpcy5taW4ueCA9IGNlbnRlci54IC0gaGFsZl94O1xuICAgICAgICB0aGlzLm1pbi55ID0gY2VudGVyLnkgLSBoYWxmX3k7XG4gICAgICAgIHRoaXMubWluLnogPSBjZW50ZXIueiAtIGhhbGZfejtcblxuICAgICAgICB0aGlzLm1heC54ID0gY2VudGVyLnggKyBoYWxmX3g7XG4gICAgICAgIHRoaXMubWF4LnkgPSBjZW50ZXIueSArIGhhbGZfeTtcbiAgICAgICAgdGhpcy5tYXgueiA9IGNlbnRlci56ICsgaGFsZl96O1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldF9zaXplKHNpemU6IEZsb2F0Myk6IEJveDMge1xuICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLmNlbnRlcjtcbiAgICAgICAgY29uc3Qgc3ggPSBzaXplLnggKiAwLjU7XG4gICAgICAgIGNvbnN0IHN5ID0gc2l6ZS55ICogMC41O1xuICAgICAgICBjb25zdCBzeiA9IHNpemUueiAqIDAuNTtcblxuICAgICAgICB0aGlzLm1pbi54ID0gY2VudGVyLnggLSBzeDtcbiAgICAgICAgdGhpcy5taW4ueSA9IGNlbnRlci55IC0gc3k7XG4gICAgICAgIHRoaXMubWluLnogPSBjZW50ZXIueiAtIHN6O1xuXG4gICAgICAgIHRoaXMubWF4LnggPSBjZW50ZXIueCArIHN4O1xuICAgICAgICB0aGlzLm1heC55ID0gY2VudGVyLnkgKyBzeTtcbiAgICAgICAgdGhpcy5tYXgueiA9IGNlbnRlci56ICsgc3o7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IGludmFsaWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbi54ID09PSBJbmZpbml0eSB8fCB0aGlzLm1pbi55ID09PSBJbmZpbml0eSB8fCB0aGlzLm1pbi56ID09PSBJbmZpbml0eSB8fCB0aGlzLm1heC54ID09PSAtSW5maW5pdHkgfHwgdGhpcy5tYXgueSA9PT0gLUluZmluaXR5IHx8IHRoaXMubWF4LnogPT09IC1JbmZpbml0eTtcbiAgICB9XG5cbiAgICBzdGF0aWMgT3ZlcmxhcHBlZChhOiBCb3gzLCBiOiBCb3gzKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBvdmVybGFwID0gdHJ1ZTtcbiAgICAgICAgb3ZlcmxhcCA9IGEubWluLnggPiBiLm1heC54IHx8IGEubWF4LnggPCBiLm1pbi54ID8gZmFsc2UgOiBvdmVybGFwO1xuICAgICAgICBvdmVybGFwID0gYS5taW4ueSA+IGIubWF4LnkgfHwgYS5tYXgueSA8IGIubWluLnkgPyBmYWxzZSA6IG92ZXJsYXA7XG4gICAgICAgIG92ZXJsYXAgPSBhLm1pbi56ID4gYi5tYXgueiB8fCBhLm1heC56IDwgYi5taW4ueiA/IGZhbHNlIDogb3ZlcmxhcDtcbiAgICAgICAgcmV0dXJuIG92ZXJsYXA7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IFR5cGVkQXJyYXkgfSBmcm9tICcuLi9zdGQvdHlwZSc7XG5pbXBvcnQgeyBjbGFtcCB9IGZyb20gJy4vbWF0aCc7XG5pbXBvcnQgeyBGbG9hdDMsIEZsb2F0NCB9IGZyb20gJy4vc2ltZCc7XG5cbmZ1bmN0aW9uIGNvbG9yX3RvX2hleChjOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGMgPSBjbGFtcChNYXRoLmNlaWwoYyAqIDI1NSksIDAsIDI1NSk7XG4gICAgaWYgKGMgPCAxNikgcmV0dXJuICcwJyArIGMudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiBjLnRvU3RyaW5nKDE2KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb2xvcjxUIGV4dGVuZHMgQ29sb3I8VD4+IHt9XG5cbmV4cG9ydCBlbnVtIENvbG9yTW9kZSB7XG4gICAgUkdCQSA9IDEsXG4gICAgSFNMLFxuICAgIEhTVixcbn1cblxuZXhwb3J0IGNsYXNzIENvbG9yUkdCQSBleHRlbmRzIEZsb2F0NCBpbXBsZW1lbnRzIENvbG9yPENvbG9yUkdCQT4ge1xuICAgIGdldCByKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXTtcbiAgICB9XG4gICAgc2V0IHIodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzFdO1xuICAgIH1cbiAgICBzZXQgZyh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgYigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMl07XG4gICAgfVxuICAgIHNldCBiKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCBhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1szXTtcbiAgICB9XG4gICAgc2V0IGEodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocjogbnVtYmVyID0gMCwgZzogbnVtYmVyID0gMCwgYjogbnVtYmVyID0gMCwgYTogbnVtYmVyID0gMSkge1xuICAgICAgICBzdXBlcihyLCBnLCBiLCBhKTtcbiAgICB9XG5cbiAgICBjb3B5KGNvbG9yOiBDb2xvclJHQkEpOiBDb2xvclJHQkEge1xuICAgICAgICBzdXBlci5jb3B5KGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2xvbmUoKTogQ29sb3JSR0JBIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvclJHQkEoKS5jb3B5KHRoaXMpO1xuICAgIH1cblxuICAgIHJlYWQoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gYnVmZmVyW29mZnNldF07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSBidWZmZXJbb2Zmc2V0ICsgMV07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSBidWZmZXJbb2Zmc2V0ICsgMl07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSBidWZmZXJbb2Zmc2V0ICsgM107XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdyaXRlKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgYnVmZmVyW29mZnNldF0gPSB0aGlzLmVsZW1lbnRzWzBdO1xuICAgICAgICBidWZmZXJbb2Zmc2V0ICsgMV0gPSB0aGlzLmVsZW1lbnRzWzFdO1xuICAgICAgICBidWZmZXJbb2Zmc2V0ICsgMl0gPSB0aGlzLmVsZW1lbnRzWzJdO1xuICAgICAgICBidWZmZXJbb2Zmc2V0ICsgM10gPSB0aGlzLmVsZW1lbnRzWzNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRfaGV4X3N0cmluZyhoZXg6IHN0cmluZyk6IENvbG9yUkdCQSB7XG4gICAgICAgIGxldCBoID0gaGV4O1xuICAgICAgICBpZiAoIWgpIHJldHVybiB0aGlzO1xuICAgICAgICBpZiAoaFswXSA9PT0gJyMnKSBoID0gaC5zdWJzdHIoMSk7XG4gICAgICAgIGVsc2UgaWYgKGhbMF0gPT09ICcwJyAmJiBoWzFdID09PSAneCcpIGggPSBoLnN1YnN0cigyKTtcblxuICAgICAgICBpZiAoaC5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIHRoaXMuciA9IHBhcnNlSW50KGhbMF0sIDE2KSAvIDE1O1xuICAgICAgICAgICAgdGhpcy5nID0gcGFyc2VJbnQoaFsxXSwgMTYpIC8gMTU7XG4gICAgICAgICAgICB0aGlzLmIgPSBwYXJzZUludChoWzJdLCAxNikgLyAxNTtcbiAgICAgICAgICAgIHRoaXMuYSA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAoaC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgIHRoaXMuciA9IHBhcnNlSW50KGhbMF0sIDE2KSAvIDE1O1xuICAgICAgICAgICAgdGhpcy5nID0gcGFyc2VJbnQoaFsxXSwgMTYpIC8gMTU7XG4gICAgICAgICAgICB0aGlzLmIgPSBwYXJzZUludChoWzJdLCAxNikgLyAxNTtcbiAgICAgICAgICAgIHRoaXMuYSA9IHBhcnNlSW50KGhbM10sIDE2KSAvIDE1O1xuICAgICAgICB9IGVsc2UgaWYgKGgubGVuZ3RoID09PSA2KSB7XG4gICAgICAgICAgICB0aGlzLnIgPSBwYXJzZUludChoLnN1YnN0cigwLCAyKSwgMTYpIC8gMjU1O1xuICAgICAgICAgICAgdGhpcy5nID0gcGFyc2VJbnQoaC5zdWJzdHIoMiwgMiksIDE2KSAvIDI1NTtcbiAgICAgICAgICAgIHRoaXMuYiA9IHBhcnNlSW50KGguc3Vic3RyKDQsIDIpLCAxNikgLyAyNTU7XG4gICAgICAgICAgICB0aGlzLmEgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKGgubGVuZ3RoID09PSA4KSB7XG4gICAgICAgICAgICB0aGlzLnIgPSBwYXJzZUludChoLnN1YnN0cigwLCAyKSwgMTYpIC8gMjU1O1xuICAgICAgICAgICAgdGhpcy5nID0gcGFyc2VJbnQoaC5zdWJzdHIoMiwgMiksIDE2KSAvIDI1NTtcbiAgICAgICAgICAgIHRoaXMuYiA9IHBhcnNlSW50KGguc3Vic3RyKDQsIDIpLCAxNikgLyAyNTU7XG4gICAgICAgICAgICB0aGlzLmEgPSBwYXJzZUludChoLnN1YnN0cig2LCAyKSwgMTYpIC8gMjU1O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgYGludmFsaWQgaGV4IHZhbHVlICR7aGV4fWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRfaGV4KGhleDogbnVtYmVyKTogQ29sb3JSR0JBIHtcbiAgICAgICAgaWYgKGhleCA+IDB4ZmZmZmZmKSB7XG4gICAgICAgICAgICB0aGlzLnIgPSAoKGhleCAmIDB4ZmYwMDAwMDApID4+PiAyNCkgLyAyNTUuMDtcbiAgICAgICAgICAgIHRoaXMuZyA9ICgoaGV4ICYgMHhmZjAwMDApID4+PiAxNikgLyAyNTUuMDtcbiAgICAgICAgICAgIHRoaXMuYiA9ICgoaGV4ICYgMHhmZjAwKSA+Pj4gOCkgLyAyNTUuMDtcbiAgICAgICAgICAgIHRoaXMuYSA9IChoZXggJiAweGZmKSAvIDI1NS4wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yID0gKChoZXggJiAweGZmMDAwMCkgPj4+IDE2KSAvIDI1NS4wO1xuICAgICAgICAgICAgdGhpcy5nID0gKChoZXggJiAweGZmMDApID4+PiA4KSAvIDI1NS4wO1xuICAgICAgICAgICAgdGhpcy5iID0gKGhleCAmIDB4ZmYpIC8gMjU1LjA7XG4gICAgICAgICAgICB0aGlzLmEgPSAxLjA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9faGV4KCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHIgPSAoKHRoaXMuciAqIDI1NS4wKSAmIDB4ZmYpIDw8IDI0O1xuICAgICAgICBjb25zdCBnID0gKCh0aGlzLmcgKiAyNTUuMCkgJiAweGZmKSA8PCAxNjtcbiAgICAgICAgY29uc3QgYiA9ICgodGhpcy5iICogMjU1LjApICYgMHhmZikgPDwgODtcbiAgICAgICAgY29uc3QgYSA9ICh0aGlzLmEgKiAyNTUuMCkgJiAweGZmO1xuICAgICAgICByZXR1cm4gciB8IGcgfCBiIHwgYTtcbiAgICB9XG5cbiAgICB0b19oZXhfc3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gY29sb3JfdG9faGV4KHRoaXMucikgKyBjb2xvcl90b19oZXgodGhpcy5nKSArIGNvbG9yX3RvX2hleCh0aGlzLmIpICsgY29sb3JfdG9faGV4KHRoaXMuYSk7XG4gICAgfVxuXG4gICAgc2V0X3JnYmFfYnl0ZShyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyLCBhOiBudW1iZXIpOiBDb2xvclJHQkEge1xuICAgICAgICB0aGlzLnIgPSByIC8gMjU1LjA7XG4gICAgICAgIHRoaXMuZyA9IGcgLyAyNTUuMDtcbiAgICAgICAgdGhpcy5iID0gYiAvIDI1NS4wO1xuICAgICAgICB0aGlzLmEgPSBhIC8gMjU1LjA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvbmUoZjogbnVtYmVyKTogQ29sb3JSR0JBIHtcbiAgICAgICAgdGhpcy5yICo9IGY7XG4gICAgICAgIHRoaXMuZyAqPSBmO1xuICAgICAgICB0aGlzLmIgKj0gZjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9uZV9zY2FsYXIob2Zmc2V0OiBudW1iZXIpOiBDb2xvclJHQkEge1xuICAgICAgICB0aGlzLnIgKz0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmcgKz0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmIgKz0gb2Zmc2V0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tX2Zsb2F0MyhzcmM6IEZsb2F0Myk6IENvbG9yUkdCQSB7XG4gICAgICAgIHRoaXMuciA9IHNyYy54O1xuICAgICAgICB0aGlzLmcgPSBzcmMueTtcbiAgICAgICAgdGhpcy5iID0gc3JjLno7XG4gICAgICAgIHRoaXMuYSA9IDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21fZmxvYXQ0KHNyYzogRmxvYXQ0KTogQ29sb3JSR0JBIHtcbiAgICAgICAgdGhpcy5yID0gc3JjLng7XG4gICAgICAgIHRoaXMuZyA9IHNyYy55O1xuICAgICAgICB0aGlzLmIgPSBzcmMuejtcbiAgICAgICAgdGhpcy5hID0gc3JjLnc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvX2Zsb2F0Myhkc3Q/OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QgPSBkc3QgPz8gbmV3IEZsb2F0MygpO1xuICAgICAgICBkc3QueCA9IHRoaXMucjtcbiAgICAgICAgZHN0LnkgPSB0aGlzLmc7XG4gICAgICAgIGRzdC56ID0gdGhpcy5iO1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHRvX2Zsb2F0NChkc3Q/OiBGbG9hdDQpOiBGbG9hdDQge1xuICAgICAgICBkc3QgPSBkc3QgPz8gbmV3IEZsb2F0NCgpO1xuICAgICAgICBkc3QueCA9IHRoaXMucjtcbiAgICAgICAgZHN0LnkgPSB0aGlzLmc7XG4gICAgICAgIGRzdC56ID0gdGhpcy5iO1xuICAgICAgICBkc3QudyA9IHRoaXMuYTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYFske3RoaXMucn0sICR7dGhpcy5nfSwgJHt0aGlzLmJ9LCAke3RoaXMuYX1dYDtcbiAgICB9XG5cbiAgICB0b0pTT04oKTogbnVtYmVyW10ge1xuICAgICAgICByZXR1cm4gW3RoaXMuciwgdGhpcy5nLCB0aGlzLmIsIHRoaXMuYV07XG4gICAgfVxuXG4gICAgdG9fYXJyYXkoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB0aGlzLmFdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbG9ySFNMIGV4dGVuZHMgRmxvYXQzIGltcGxlbWVudHMgQ29sb3I8Q29sb3JIU0w+IHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgaHVlID0gMCwgcHVibGljIHNhdHVyYXRpb24gPSAwLCBwdWJsaWMgbGlnaHRuZXNzID0gMSkge1xuICAgICAgICBzdXBlcihodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcyk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBbJHt0aGlzLmh1ZX0sICR7dGhpcy5zYXR1cmF0aW9ufSwgJHt0aGlzLmxpZ2h0bmVzc31dYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb2xvckhTViBleHRlbmRzIEZsb2F0MyBpbXBsZW1lbnRzIENvbG9yPENvbG9ySFNWPiB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGh1ZSA9IDAsIHB1YmxpYyBzYXR1cmF0aW9uID0gMCwgcHVibGljIHZhbHVlID0gMSkge1xuICAgICAgICBzdXBlcihodWUsIHNhdHVyYXRpb24sIHZhbHVlKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYFske3RoaXMuaHVlfSwgJHt0aGlzLnNhdHVyYXRpb259LCAke3RoaXMudmFsdWV9XWA7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sb3JfcmdiYV90b19oc2woc3JjOiBDb2xvclJHQkEsIGRzdD86IENvbG9ySFNMKTogQ29sb3JIU0wge1xuICAgIGNvbnN0IHIgPSBzcmMucjtcbiAgICBjb25zdCBnID0gc3JjLmc7XG4gICAgY29uc3QgYiA9IHNyYy5iO1xuXG4gICAgY29uc3QgbWF4ID0gTWF0aC5tYXgociwgZywgYik7XG4gICAgY29uc3QgbWluID0gTWF0aC5taW4ociwgZywgYik7XG4gICAgbGV0IGggPSAwO1xuICAgIGxldCBzID0gMDtcbiAgICBsZXQgbCA9IChtYXggKyBtaW4pICogMC41O1xuICAgIGlmIChtYXggPT09IG1pbikge1xuICAgICAgICBoID0gcyA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZCA9IG1heCAtIG1pbjtcbiAgICAgICAgcyA9IGwgPiAwLjUgPyBkIC8gKDIgLSBtYXggLSBtaW4pIDogZCAvIChtYXggKyBtaW4pO1xuICAgICAgICBzd2l0Y2ggKG1heCkge1xuICAgICAgICAgICAgY2FzZSByOlxuICAgICAgICAgICAgICAgIGggPSAoZyAtIGIpIC8gZCArIChnIDwgYiA/IDYgOiAwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZzpcbiAgICAgICAgICAgICAgICBoID0gKGIgLSByKSAvIGQgKyAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBiOlxuICAgICAgICAgICAgICAgIGggPSAociAtIGcpIC8gZCArIDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaCAvPSA2O1xuICAgIH1cbiAgICBkc3QgPSBkc3QgPz8gbmV3IENvbG9ySFNMKCk7XG4gICAgZHN0Lmh1ZSA9IGg7XG4gICAgZHN0LnNhdHVyYXRpb24gPSBzO1xuICAgIGRzdC5saWdodG5lc3MgPSBsO1xuICAgIHJldHVybiBkc3Q7XG59XG5cbmZ1bmN0aW9uIGh1ZTJyZ2IocDogbnVtYmVyLCBxOiBudW1iZXIsIHQ6IG51bWJlcikge1xuICAgIGlmICh0IDwgMCkgdCArPSAxO1xuICAgIGlmICh0ID4gMSkgdCAtPSAxO1xuICAgIGlmICh0IDwgMSAvIDYpIHJldHVybiBwICsgKHEgLSBwKSAqIDYgKiB0O1xuICAgIGlmICh0IDwgMSAvIDIpIHJldHVybiBxO1xuICAgIGlmICh0IDwgMiAvIDMpIHJldHVybiBwICsgKHEgLSBwKSAqICgyIC8gMyAtIHQpICogNjtcbiAgICByZXR1cm4gcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbG9yX2hzbF90b19yZ2JhKHNyYzogQ29sb3JIU0wsIGRzdD86IENvbG9yUkdCQSk6IENvbG9yUkdCQSB7XG4gICAgbGV0IHIgPSAwO1xuICAgIGxldCBnID0gMDtcbiAgICBsZXQgYiA9IDA7XG4gICAgY29uc3QgcyA9IHNyYy5zYXR1cmF0aW9uO1xuICAgIGNvbnN0IGggPSBzcmMuaHVlO1xuICAgIGNvbnN0IGwgPSBzcmMubGlnaHRuZXNzO1xuXG4gICAgaWYgKHMgPT09IDApIHtcbiAgICAgICAgciA9IGcgPSBiID0gbDsgLy8gYWNocm9tYXRpY1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgICAgbGV0IHAgPSAyICogbCAtIHE7XG4gICAgICAgIHIgPSBodWUycmdiKHAsIHEsIGggKyAxIC8gMyk7XG4gICAgICAgIGcgPSBodWUycmdiKHAsIHEsIGgpO1xuICAgICAgICBiID0gaHVlMnJnYihwLCBxLCBoIC0gMSAvIDMpO1xuICAgIH1cbiAgICBkc3QgPSBkc3QgPz8gbmV3IENvbG9yUkdCQSgpO1xuICAgIGRzdC5yID0gcjtcbiAgICBkc3QuZyA9IGc7XG4gICAgZHN0LmIgPSBiO1xuICAgIHJldHVybiBkc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xvcl9oc3ZfdG9fcmdiYShzcmM6IENvbG9ySFNWLCBkc3Q/OiBDb2xvclJHQkEpOiBDb2xvclJHQkEge1xuICAgIGNvbnN0IGggPSBzcmMuaHVlO1xuICAgIGNvbnN0IHMgPSBzcmMuc2F0dXJhdGlvbjtcbiAgICBjb25zdCB2ID0gc3JjLnZhbHVlO1xuXG4gICAgY29uc3QgaSA9IE1hdGguZmxvb3IoaCAqIDYpO1xuICAgIGNvbnN0IGYgPSBoICogNiAtIGk7XG4gICAgY29uc3QgcCA9IHYgKiAoMSAtIHMpO1xuICAgIGNvbnN0IHEgPSB2ICogKDEgLSBmICogcyk7XG4gICAgY29uc3QgdCA9IHYgKiAoMSAtICgxIC0gZikgKiBzKTtcblxuICAgIGxldCByID0gMDtcbiAgICBsZXQgZyA9IDA7XG4gICAgbGV0IGIgPSAwO1xuXG4gICAgc3dpdGNoIChpICUgNikge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByID0gdjtcbiAgICAgICAgICAgIGcgPSB0O1xuICAgICAgICAgICAgYiA9IHA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgciA9IHE7XG4gICAgICAgICAgICBnID0gdjtcbiAgICAgICAgICAgIGIgPSBwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHIgPSBwO1xuICAgICAgICAgICAgZyA9IHY7XG4gICAgICAgICAgICBiID0gdDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByID0gcDtcbiAgICAgICAgICAgIGcgPSBxO1xuICAgICAgICAgICAgYiA9IHY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgciA9IHQ7XG4gICAgICAgICAgICBnID0gcDtcbiAgICAgICAgICAgIGIgPSB2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIHIgPSB2O1xuICAgICAgICAgICAgZyA9IHA7XG4gICAgICAgICAgICBiID0gcTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGRzdCA9IGRzdCA/PyBuZXcgQ29sb3JSR0JBKCk7XG4gICAgZHN0LnIgPSByO1xuICAgIGRzdC5nID0gZztcbiAgICBkc3QuYiA9IGI7XG4gICAgcmV0dXJuIGRzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbG9yX3JnYmFfdG9faHN2KHNyYzogQ29sb3JSR0JBLCBkc3Q/OiBDb2xvckhTVik6IENvbG9ySFNWIHtcbiAgICBjb25zdCByID0gc3JjLnI7XG4gICAgY29uc3QgZyA9IHNyYy5nO1xuICAgIGNvbnN0IGIgPSBzcmMuYjtcblxuICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKHIsIGcsIGIpO1xuICAgIGxldCBoID0gMDtcbiAgICBjb25zdCB2ID0gbWF4O1xuICAgIGNvbnN0IGQgPSBtYXggLSBtaW47XG4gICAgY29uc3QgcyA9IG1heCA9PT0gMCA/IDAgOiBkIC8gbWF4O1xuXG4gICAgaWYgKG1heCA9PT0gbWluKSB7XG4gICAgICAgIGggPSAwOyAvLyBhY2hyb21hdGljXG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoIChtYXgpIHtcbiAgICAgICAgICAgIGNhc2UgcjpcbiAgICAgICAgICAgICAgICBoID0gKGcgLSBiKSAvIGQgKyAoZyA8IGIgPyA2IDogMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGc6XG4gICAgICAgICAgICAgICAgaCA9IChiIC0gcikgLyBkICsgMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgYjpcbiAgICAgICAgICAgICAgICBoID0gKHIgLSBnKSAvIGQgKyA0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaCAvPSA2O1xuICAgIH1cblxuICAgIGRzdCA9IGRzdCA/PyBuZXcgQ29sb3JIU1YoKTtcbiAgICBkc3QuaHVlID0gaDtcbiAgICBkc3Quc2F0dXJhdGlvbiA9IHM7XG4gICAgZHN0LnZhbHVlID0gdjtcbiAgICByZXR1cm4gZHN0O1xufVxuIiwgImltcG9ydCB7IHBvb2xfZ2V0LCBwb29sX3JldHVybiB9IGZyb20gJy4uL2FkdCc7XG5pbXBvcnQgeyBmb290cHJpbnRfYWxsb2MgfSBmcm9tICcuLi9tZW1vcnkvZm9vdHByaW50JztcbmltcG9ydCB7IEhlYXBQb2ludGVyIH0gZnJvbSAnLi4vbWVtb3J5L2hlYXBfcG9pbnRlcic7XG5pbXBvcnQgeyBUeXBlZEFycmF5IH0gZnJvbSAnLi4vc3RkL3R5cGUnO1xuaW1wb3J0IHsgRGVncmVlVG9SYWRpYW4gfSBmcm9tICcuL21hdGgnO1xuaW1wb3J0IHsgRmxvYXQzIH0gZnJvbSAnLi9zaW1kJztcbmltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL3NpbWRfcXVhdGVybmlvbic7XG5cbmNvbnN0IHggPSBuZXcgRmxvYXQzKCk7XG5jb25zdCB5ID0gbmV3IEZsb2F0MygpO1xuY29uc3QgeiA9IG5ldyBGbG9hdDMoKTtcbmNvbnN0IHYgPSBuZXcgRmxvYXQzKCk7XG5jb25zdCBkZWZhdWx0X3VwID0gbmV3IEZsb2F0MygwLCAxLCAwKTtcblxuZXhwb3J0IGNsYXNzIE1hdDQgaW1wbGVtZW50cyBIZWFwUG9pbnRlciB7XG4gICAgc2l6ZSA9IDE2O1xuICAgIGVsZW1lbnRzID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xuICAgICAgICBmb290cHJpbnRfYWxsb2MoMTYpO1xuICAgIH1cblxuICAgIHJlYWQoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzW2ldID0gYnVmZmVyW29mZnNldCArIGldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdyaXRlKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemU7ICsraSkge1xuICAgICAgICAgICAgYnVmZmVyW29mZnNldCArIGldID0gdGhpcy5lbGVtZW50c1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KGRzdDogTWF0NCk6IE1hdDQge1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnNldChkc3QuZWxlbWVudHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9uZSgpOiBNYXQ0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0KCkuY29weSh0aGlzKTtcbiAgICB9XG5cbiAgICBpZGVudGl0eSgpOiBNYXQ0IHtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5zZXQoWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0X3goeDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgeC5yZWFkKHRoaXMuZWxlbWVudHMpO1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICBnZXRfeSh5OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICB5LnJlYWQodGhpcy5lbGVtZW50cywgNCk7XG4gICAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIGdldF96KHo6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIHoucmVhZCh0aGlzLmVsZW1lbnRzLCA4KTtcbiAgICAgICAgcmV0dXJuIHo7XG4gICAgfVxuXG4gICAgZ2V0X3codzogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgdy5yZWFkKHRoaXMuZWxlbWVudHMsIDEyKTtcbiAgICAgICAgcmV0dXJuIHc7XG4gICAgfVxuXG4gICAgc2V0X3goeDogRmxvYXQzKTogTWF0NCB7XG4gICAgICAgIHgud3JpdGUodGhpcy5lbGVtZW50cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldF95KHg6IEZsb2F0Myk6IE1hdDQge1xuICAgICAgICB4LndyaXRlKHRoaXMuZWxlbWVudHMsIDQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRfeih4OiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgeC53cml0ZSh0aGlzLmVsZW1lbnRzLCA4KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0X3coeDogRmxvYXQzKTogTWF0NCB7XG4gICAgICAgIHgud3JpdGUodGhpcy5lbGVtZW50cywgMTIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXQoXG4gICAgICAgIHh4OiBudW1iZXIsXG4gICAgICAgIHh5OiBudW1iZXIsXG4gICAgICAgIHh6OiBudW1iZXIsXG4gICAgICAgIHh3OiBudW1iZXIsXG4gICAgICAgIHl4OiBudW1iZXIsXG4gICAgICAgIHl5OiBudW1iZXIsXG4gICAgICAgIHl6OiBudW1iZXIsXG4gICAgICAgIHl3OiBudW1iZXIsXG4gICAgICAgIHp4OiBudW1iZXIsXG4gICAgICAgIHp5OiBudW1iZXIsXG4gICAgICAgIHp6OiBudW1iZXIsXG4gICAgICAgIHp3OiBudW1iZXIsXG4gICAgICAgIHd4OiBudW1iZXIsXG4gICAgICAgIHd5OiBudW1iZXIsXG4gICAgICAgIHd6OiBudW1iZXIsXG4gICAgICAgIHd3OiBudW1iZXJcbiAgICApOiBNYXQ0IHtcbiAgICAgICAgY29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgICB0ZVswXSA9IHh4O1xuICAgICAgICB0ZVsxXSA9IHh5O1xuICAgICAgICB0ZVsyXSA9IHh6O1xuICAgICAgICB0ZVszXSA9IHh3O1xuICAgICAgICB0ZVs0XSA9IHl4O1xuICAgICAgICB0ZVs1XSA9IHl5O1xuICAgICAgICB0ZVs2XSA9IHl6O1xuICAgICAgICB0ZVs3XSA9IHl3O1xuICAgICAgICB0ZVs4XSA9IHp4O1xuICAgICAgICB0ZVs5XSA9IHp5O1xuICAgICAgICB0ZVsxMF0gPSB6ejtcbiAgICAgICAgdGVbMTFdID0genc7XG4gICAgICAgIHRlWzEyXSA9IHd4O1xuICAgICAgICB0ZVsxM10gPSB3eTtcbiAgICAgICAgdGVbMTRdID0gd3o7XG4gICAgICAgIHRlWzE1XSA9IHd3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBsb29rX2F0KG9yaWdpbjogRmxvYXQzLCB0YXJnZXQ6IEZsb2F0MywgdXA/OiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgaWYgKHVwID09PSB1bmRlZmluZWQpIHVwID0gZGVmYXVsdF91cDtcblxuICAgICAgICB6LmNvcHkob3JpZ2luKS5zdWIodGFyZ2V0KTtcblxuICAgICAgICAvLyBvcmlnaW4gYW5kIHRhcmdldCBhcmUgaW4gdGhlIHNhbWUgcG9zaXRpb25cbiAgICAgICAgaWYgKHoueCA9PT0gMCAmJiB6LnkgPT09IDAgJiYgei56ID09PSAwKSB7XG4gICAgICAgICAgICB6LnogPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgei5ub3JtYWxpemUoKTtcbiAgICAgICAgRmxvYXQzLkNyb3NzKHVwLCB6LCB4KTtcblxuICAgICAgICAvLyB6IGFuZCB1cCBhcmUgcGFyYWxsZWxcbiAgICAgICAgaWYgKHgueCA9PT0gMCAmJiB4LnkgPT09IDAgJiYgeC56ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModXAueikgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB6LnggKz0gMC4wMDAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB6LnogKz0gMC4wMDAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgei5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIEZsb2F0My5Dcm9zcyh1cCwgeiwgeCk7XG4gICAgICAgIH1cblxuICAgICAgICB4Lm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgIEZsb2F0My5Dcm9zcyh6LCB4LCB5KTtcbiAgICAgICAgeS5ub3JtYWxpemUoKTtcblxuICAgICAgICBjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICAgIHRlWzBdID0geC54O1xuICAgICAgICB0ZVsxXSA9IHgueTtcbiAgICAgICAgdGVbMl0gPSB4Lno7XG5cbiAgICAgICAgdGVbNF0gPSB5Lng7XG4gICAgICAgIHRlWzVdID0geS55O1xuICAgICAgICB0ZVs2XSA9IHkuejtcblxuICAgICAgICB0ZVs4XSA9IHoueDtcbiAgICAgICAgdGVbOV0gPSB6Lnk7XG4gICAgICAgIHRlWzEwXSA9IHouejtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwZXJzcGVjdGl2ZSh2ZXJ0aWNhbF9mb3Y6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIsIHJldmVyc2VfZGVwdGg6IGJvb2xlYW4gPSBmYWxzZSk6IE1hdDQge1xuICAgICAgICBjb25zdCB0b3AgPSBuZWFyICogTWF0aC50YW4oRGVncmVlVG9SYWRpYW4gKiAwLjUgKiB2ZXJ0aWNhbF9mb3YpO1xuICAgICAgICBjb25zdCBib3R0b20gPSAtdG9wO1xuICAgICAgICBjb25zdCBsZWZ0ID0gdG9wICogYXNwZWN0O1xuICAgICAgICBjb25zdCByaWdodCA9IC1sZWZ0O1xuXG4gICAgICAgIGNvbnN0IGRlcHRoX3JhbmdlID0gZmFyIC0gbmVhcjtcbiAgICAgICAgY29uc3QgbjIgPSBuZWFyICogMjtcblxuICAgICAgICBjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICAgIHRlLmZpbGwoMCk7XG5cbiAgICAgICAgdGVbMF0gPSBuMiAvIChyaWdodCAtIGxlZnQpO1xuICAgICAgICB0ZVs1XSA9IG4yIC8gKHRvcCAtIGJvdHRvbSk7XG5cbiAgICAgICAgdGVbOF0gPSAocmlnaHQgKyBsZWZ0KSAvIChyaWdodCAtIGxlZnQpO1xuICAgICAgICB0ZVs5XSA9ICh0b3AgKyBib3R0b20pIC8gKHRvcCAtIGJvdHRvbSk7XG4gICAgICAgIHRlWzEwXSA9IC0oZmFyIC8gZGVwdGhfcmFuZ2UpO1xuXG4gICAgICAgIHRlWzE0XSA9IG5lYXIgKiB0ZVsxMF07XG4gICAgICAgIHRlWzExXSA9IC0xO1xuXG4gICAgICAgIGlmIChyZXZlcnNlX2RlcHRoKSB7XG4gICAgICAgICAgICB0ZVsxNF0gPSAtdGVbMTRdO1xuICAgICAgICAgICAgdGVbMTBdID0gLXRlWzEwXSAtIDEuMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG9ydGhvZ3JhcGhpY3Moc2l6ZV92ZXJ0aWNhbDogbnVtYmVyLCBzaXplX2hvcml6b250YWw6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlciwgcmV2ZXJzZV9kZXB0aDogYm9vbGVhbiA9IGZhbHNlKTogTWF0NCB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgdGUuZmlsbCgwKTtcblxuICAgICAgICBjb25zdCBkZXB0aF9yYW5nZSA9IGZhciAtIG5lYXI7XG5cbiAgICAgICAgY29uc3QgbGVmdCA9IHNpemVfaG9yaXpvbnRhbCAvIDI7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gLXNpemVfaG9yaXpvbnRhbCAvIDI7XG4gICAgICAgIGNvbnN0IHRvcCA9IHNpemVfdmVydGljYWwgLyAyO1xuICAgICAgICBjb25zdCBib3R0b20gPSAtc2l6ZV92ZXJ0aWNhbCAvIDI7XG5cbiAgICAgICAgdGVbMF0gPSAyIC8gKHJpZ2h0IC0gbGVmdCk7XG4gICAgICAgIHRlWzVdID0gMiAvICh0b3AgLSBib3R0b20pO1xuICAgICAgICB0ZVsxMF0gPSAtMiAvIGRlcHRoX3JhbmdlO1xuXG4gICAgICAgIHRlWzEyXSA9IChyaWdodCArIGxlZnQpIC8gKHJpZ2h0IC0gbGVmdCk7XG4gICAgICAgIHRlWzEzXSA9ICh0b3AgKyBib3R0b20pIC8gKHRvcCAtIGJvdHRvbSk7XG4gICAgICAgIHRlWzE0XSA9IC1uZWFyICogdGVbMTBdO1xuICAgICAgICB0ZVsxNV0gPSAxO1xuXG4gICAgICAgIGlmIChyZXZlcnNlX2RlcHRoKSB7XG4gICAgICAgICAgICB0ZVsxNF0gPSAtdGVbMTRdICsgMTtcbiAgICAgICAgICAgIHRlWzEwXSA9IC10ZVsxMF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKCk6IE1hdDQge1xuICAgICAgICByZXR1cm4gTWF0NC5JbnZlcnNlKHRoaXMsIHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21fcXVhdGVybmlvbihxOiBRdWF0ZXJuaW9uKTogTWF0NCB7XG4gICAgICAgIHJldHVybiBNYXQ0LkZyb21RdWF0ZXJuaW9uKHEsIHRoaXMpO1xuICAgIH1cblxuICAgIGNvbXBvc2UobG9jYXRpb246IEZsb2F0Mywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgcmV0dXJuIE1hdDQuQ29tcG9zZShsb2NhdGlvbiwgcm90YXRpb24sIHNjYWxlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBkZWNvbXBvc2UobG9jYXRpb246IEZsb2F0Mywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgcmV0dXJuIE1hdDQuRGVjb21wb3NlKHRoaXMsIGxvY2F0aW9uLCByb3RhdGlvbiwgc2NhbGUpO1xuICAgIH1cblxuICAgIHNldF9zY2FsZShzY2FsZTogRmxvYXQzKTogTWF0NCB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgY29uc3QgeCA9IHNjYWxlLngsXG4gICAgICAgICAgICB5ID0gc2NhbGUueSxcbiAgICAgICAgICAgIHogPSBzY2FsZS56O1xuICAgICAgICB0ZVswXSAqPSB4O1xuICAgICAgICB0ZVs0XSAqPSB5O1xuICAgICAgICB0ZVs4XSAqPSB6O1xuICAgICAgICB0ZVsxXSAqPSB4O1xuICAgICAgICB0ZVs1XSAqPSB5O1xuICAgICAgICB0ZVs5XSAqPSB6O1xuICAgICAgICB0ZVsyXSAqPSB4O1xuICAgICAgICB0ZVs2XSAqPSB5O1xuICAgICAgICB0ZVsxMF0gKj0gejtcbiAgICAgICAgdGVbM10gKj0geDtcbiAgICAgICAgdGVbN10gKj0geTtcbiAgICAgICAgdGVbMTFdICo9IHo7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldF9zY2FsZShzY2FsZTogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgcmV0dXJuIHNjYWxlLnNldCh0aGlzLmVsZW1lbnRzWzBdLCB0aGlzLmVsZW1lbnRzWzVdLCB0aGlzLmVsZW1lbnRzWzEwXSk7XG4gICAgfVxuXG4gICAgc2V0X2xvY2F0aW9uKGxvY2F0aW9uOiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgY29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgICB0ZVsxMl0gPSBsb2NhdGlvbi54O1xuICAgICAgICB0ZVsxM10gPSBsb2NhdGlvbi55O1xuICAgICAgICB0ZVsxNF0gPSBsb2NhdGlvbi56O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwcmVfbXVsKGE6IE1hdDQpOiBNYXQ0IHtcbiAgICAgICAgcmV0dXJuIE1hdDQuTXVsKGEsIHRoaXMsIHRoaXMpO1xuICAgIH1cblxuICAgIG11bChhOiBNYXQ0KTogTWF0NCB7XG4gICAgICAgIHJldHVybiBNYXQ0Lk11bCh0aGlzLCBhLCB0aGlzKTtcbiAgICB9XG5cbiAgICB0cmFuc3Bvc2UoKTogTWF0NCB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgbGV0IHRtcDtcbiAgICAgICAgdG1wID0gdGVbMV07XG4gICAgICAgIHRlWzFdID0gdGVbNF07XG4gICAgICAgIHRlWzRdID0gdG1wO1xuICAgICAgICB0bXAgPSB0ZVsyXTtcbiAgICAgICAgdGVbMl0gPSB0ZVs4XTtcbiAgICAgICAgdGVbOF0gPSB0bXA7XG4gICAgICAgIHRtcCA9IHRlWzZdO1xuICAgICAgICB0ZVs2XSA9IHRlWzldO1xuICAgICAgICB0ZVs5XSA9IHRtcDtcbiAgICAgICAgdG1wID0gdGVbM107XG4gICAgICAgIHRlWzNdID0gdGVbMTJdO1xuICAgICAgICB0ZVsxMl0gPSB0bXA7XG4gICAgICAgIHRtcCA9IHRlWzddO1xuICAgICAgICB0ZVs3XSA9IHRlWzEzXTtcbiAgICAgICAgdGVbMTNdID0gdG1wO1xuICAgICAgICB0bXAgPSB0ZVsxMV07XG4gICAgICAgIHRlWzExXSA9IHRlWzE0XTtcbiAgICAgICAgdGVbMTRdID0gdG1wO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZXRlcm1pbmFudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0NC5EZXRlcm1pbmFudCh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgSXNJZGVudGl0eShzcmM6IE1hdDQpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgdGUgPSBzcmMuZWxlbWVudHM7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0ZVswXSA9PT0gMSAmJlxuICAgICAgICAgICAgdGVbMV0gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzJdID09PSAwICYmXG4gICAgICAgICAgICB0ZVszXSA9PT0gMCAmJlxuICAgICAgICAgICAgdGVbNF0gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzVdID09PSAxICYmXG4gICAgICAgICAgICB0ZVs2XSA9PT0gMCAmJlxuICAgICAgICAgICAgdGVbN10gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzhdID09PSAwICYmXG4gICAgICAgICAgICB0ZVs5XSA9PT0gMCAmJlxuICAgICAgICAgICAgdGVbMTBdID09PSAxICYmXG4gICAgICAgICAgICB0ZVsxMV0gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzEyXSA9PT0gMCAmJlxuICAgICAgICAgICAgdGVbMTNdID09PSAwICYmXG4gICAgICAgICAgICB0ZVsxNF0gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzE1XSA9PT0gMVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBEZXRlcm1pbmFudChzcmM6IE1hdDQpOiBudW1iZXIge1xuICAgICAgICBjb25zdCB0ZSA9IHNyYy5lbGVtZW50cztcbiAgICAgICAgY29uc3QgbjExID0gdGVbMF0sXG4gICAgICAgICAgICBuMTIgPSB0ZVs0XSxcbiAgICAgICAgICAgIG4xMyA9IHRlWzhdLFxuICAgICAgICAgICAgbjE0ID0gdGVbMTJdO1xuICAgICAgICBjb25zdCBuMjEgPSB0ZVsxXSxcbiAgICAgICAgICAgIG4yMiA9IHRlWzVdLFxuICAgICAgICAgICAgbjIzID0gdGVbOV0sXG4gICAgICAgICAgICBuMjQgPSB0ZVsxM107XG4gICAgICAgIGNvbnN0IG4zMSA9IHRlWzJdLFxuICAgICAgICAgICAgbjMyID0gdGVbNl0sXG4gICAgICAgICAgICBuMzMgPSB0ZVsxMF0sXG4gICAgICAgICAgICBuMzQgPSB0ZVsxNF07XG4gICAgICAgIGNvbnN0IG40MSA9IHRlWzNdLFxuICAgICAgICAgICAgbjQyID0gdGVbN10sXG4gICAgICAgICAgICBuNDMgPSB0ZVsxMV0sXG4gICAgICAgICAgICBuNDQgPSB0ZVsxNV07XG5cbiAgICAgICAgLy9UT0RPOiBtYWtlIHRoaXMgbW9yZSBlZmZpY2llbnRcbiAgICAgICAgLy8oIGJhc2VkIG9uIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2FsZ2VicmEvbWF0cml4L2Z1bmN0aW9ucy9pbnZlcnNlL2ZvdXJEL2luZGV4Lmh0bSApXG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIG40MSAqICgrbjE0ICogbjIzICogbjMyIC0gbjEzICogbjI0ICogbjMyIC0gbjE0ICogbjIyICogbjMzICsgbjEyICogbjI0ICogbjMzICsgbjEzICogbjIyICogbjM0IC0gbjEyICogbjIzICogbjM0KSArXG4gICAgICAgICAgICBuNDIgKiAoK24xMSAqIG4yMyAqIG4zNCAtIG4xMSAqIG4yNCAqIG4zMyArIG4xNCAqIG4yMSAqIG4zMyAtIG4xMyAqIG4yMSAqIG4zNCArIG4xMyAqIG4yNCAqIG4zMSAtIG4xNCAqIG4yMyAqIG4zMSkgK1xuICAgICAgICAgICAgbjQzICogKCtuMTEgKiBuMjQgKiBuMzIgLSBuMTEgKiBuMjIgKiBuMzQgLSBuMTQgKiBuMjEgKiBuMzIgKyBuMTIgKiBuMjEgKiBuMzQgKyBuMTQgKiBuMjIgKiBuMzEgLSBuMTIgKiBuMjQgKiBuMzEpICtcbiAgICAgICAgICAgIG40NCAqICgtbjEzICogbjIyICogbjMxIC0gbjExICogbjIzICogbjMyICsgbjExICogbjIyICogbjMzICsgbjEzICogbjIxICogbjMyIC0gbjEyICogbjIxICogbjMzICsgbjEyICogbjIzICogbjMxKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBDb21wb3NlKGxvY2F0aW9uOiBGbG9hdDMsIHJvdGF0aW9uOiBRdWF0ZXJuaW9uLCBzY2FsZTogRmxvYXQzLCBkc3Q/OiBNYXQ0KTogTWF0NCB7XG4gICAgICAgIGlmIChkc3QgPT09IHVuZGVmaW5lZCkgZHN0ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgY29uc3QgdGUgPSBkc3QuZWxlbWVudHM7XG4gICAgICAgIGNvbnN0IHggPSByb3RhdGlvbi54LFxuICAgICAgICAgICAgeSA9IHJvdGF0aW9uLnksXG4gICAgICAgICAgICB6ID0gcm90YXRpb24ueixcbiAgICAgICAgICAgIHcgPSByb3RhdGlvbi53O1xuICAgICAgICBjb25zdCB4MiA9IHggKyB4LFxuICAgICAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgICAgIHoyID0geiArIHo7XG4gICAgICAgIGNvbnN0IHh4ID0geCAqIHgyLFxuICAgICAgICAgICAgeHkgPSB4ICogeTIsXG4gICAgICAgICAgICB4eiA9IHggKiB6MjtcbiAgICAgICAgY29uc3QgeXkgPSB5ICogeTIsXG4gICAgICAgICAgICB5eiA9IHkgKiB6MixcbiAgICAgICAgICAgIHp6ID0geiAqIHoyO1xuICAgICAgICBjb25zdCB3eCA9IHcgKiB4MixcbiAgICAgICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICAgICAgY29uc3Qgc3ggPSBzY2FsZS54LFxuICAgICAgICAgICAgc3kgPSBzY2FsZS55LFxuICAgICAgICAgICAgc3ogPSBzY2FsZS56O1xuXG4gICAgICAgIHRlWzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gICAgICAgIHRlWzFdID0gKHh5ICsgd3opICogc3g7XG4gICAgICAgIHRlWzJdID0gKHh6IC0gd3kpICogc3g7XG4gICAgICAgIHRlWzNdID0gMDtcblxuICAgICAgICB0ZVs0XSA9ICh4eSAtIHd6KSAqIHN5O1xuICAgICAgICB0ZVs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xuICAgICAgICB0ZVs2XSA9ICh5eiArIHd4KSAqIHN5O1xuICAgICAgICB0ZVs3XSA9IDA7XG5cbiAgICAgICAgdGVbOF0gPSAoeHogKyB3eSkgKiBzejtcbiAgICAgICAgdGVbOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgICAgICAgdGVbMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XG4gICAgICAgIHRlWzExXSA9IDA7XG5cbiAgICAgICAgdGVbMTJdID0gbG9jYXRpb24ueDtcbiAgICAgICAgdGVbMTNdID0gbG9jYXRpb24ueTtcbiAgICAgICAgdGVbMTRdID0gbG9jYXRpb24uejtcbiAgICAgICAgdGVbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRGVjb21wb3NlKHNyYzogTWF0NCwgbG9jYXRpb246IEZsb2F0Mywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgY29uc3QgbSA9IHBvb2xfZ2V0KE1hdDQpO1xuICAgICAgICBjb25zdCB0ZSA9IHNyYy5lbGVtZW50cztcblxuICAgICAgICBsZXQgc3ggPSB2LnNldCh0ZVswXSwgdGVbMV0sIHRlWzJdKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHN5ID0gdi5zZXQodGVbNF0sIHRlWzVdLCB0ZVs2XSkubGVuZ3RoO1xuICAgICAgICBjb25zdCBzeiA9IHYuc2V0KHRlWzhdLCB0ZVs5XSwgdGVbMTBdKS5sZW5ndGg7XG5cbiAgICAgICAgLy8gaWYgZGV0ZXJtaW5lIGlzIG5lZ2F0aXZlLCB3ZSBuZWVkIHRvIGludmVyc2Ugb25lIHNjYWxlXG4gICAgICAgIGNvbnN0IGRldCA9IHNyYy5kZXRlcm1pbmFudCgpO1xuICAgICAgICBpZiAoZGV0IDwgMCkgc3ggPSAtc3g7XG5cbiAgICAgICAgbG9jYXRpb24ueCA9IHRlWzEyXTtcbiAgICAgICAgbG9jYXRpb24ueSA9IHRlWzEzXTtcbiAgICAgICAgbG9jYXRpb24ueiA9IHRlWzE0XTtcblxuICAgICAgICAvLyBzY2FsZSB0aGUgcm90YXRpb24gcGFydFxuICAgICAgICBtLmNvcHkoc3JjKTtcblxuICAgICAgICBjb25zdCBpbnZTWCA9IDEgLyBzeDtcbiAgICAgICAgY29uc3QgaW52U1kgPSAxIC8gc3k7XG4gICAgICAgIGNvbnN0IGludlNaID0gMSAvIHN6O1xuXG4gICAgICAgIG0uZWxlbWVudHNbMF0gKj0gaW52U1g7XG4gICAgICAgIG0uZWxlbWVudHNbMV0gKj0gaW52U1g7XG4gICAgICAgIG0uZWxlbWVudHNbMl0gKj0gaW52U1g7XG5cbiAgICAgICAgbS5lbGVtZW50c1s0XSAqPSBpbnZTWTtcbiAgICAgICAgbS5lbGVtZW50c1s1XSAqPSBpbnZTWTtcbiAgICAgICAgbS5lbGVtZW50c1s2XSAqPSBpbnZTWTtcblxuICAgICAgICBtLmVsZW1lbnRzWzhdICo9IGludlNaO1xuICAgICAgICBtLmVsZW1lbnRzWzldICo9IGludlNaO1xuICAgICAgICBtLmVsZW1lbnRzWzEwXSAqPSBpbnZTWjtcblxuICAgICAgICByb3RhdGlvbi5mcm9tX21hdDQobSk7XG4gICAgICAgIHBvb2xfcmV0dXJuKG0pO1xuXG4gICAgICAgIHNjYWxlLnggPSBzeDtcbiAgICAgICAgc2NhbGUueSA9IHN5O1xuICAgICAgICBzY2FsZS56ID0gc3o7XG5cbiAgICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG5cbiAgICBzdGF0aWMgRnJvbVF1YXRlcm5pb24ocTogUXVhdGVybmlvbiwgZHN0OiBNYXQ0ID0gbmV3IE1hdDQoKSk6IE1hdDQge1xuICAgICAgICBjb25zdCB0ZSA9IGRzdC5lbGVtZW50cztcblxuICAgICAgICBjb25zdCB4ID0gcS54O1xuICAgICAgICBjb25zdCB5ID0gcS55O1xuICAgICAgICBjb25zdCB6ID0gcS56O1xuICAgICAgICBjb25zdCB3ID0gcS53O1xuICAgICAgICBjb25zdCB4MiA9IHggKyB4O1xuICAgICAgICBjb25zdCB5MiA9IHkgKyB5O1xuICAgICAgICBjb25zdCB6MiA9IHogKyB6O1xuICAgICAgICBjb25zdCB4eCA9IHggKiB4MjtcbiAgICAgICAgY29uc3QgeHkgPSB4ICogeTI7XG4gICAgICAgIGNvbnN0IHh6ID0geCAqIHoyO1xuICAgICAgICBjb25zdCB5eSA9IHkgKiB5MjtcbiAgICAgICAgY29uc3QgeXogPSB5ICogejI7XG4gICAgICAgIGNvbnN0IHp6ID0geiAqIHoyO1xuICAgICAgICBjb25zdCB3eCA9IHcgKiB4MjtcbiAgICAgICAgY29uc3Qgd3kgPSB3ICogeTI7XG4gICAgICAgIGNvbnN0IHd6ID0gdyAqIHoyO1xuXG4gICAgICAgIHRlWzBdID0gMSAtICh5eSArIHp6KTtcbiAgICAgICAgdGVbNF0gPSB4eSAtIHd6O1xuICAgICAgICB0ZVs4XSA9IHh6ICsgd3k7XG5cbiAgICAgICAgdGVbMV0gPSB4eSArIHd6O1xuICAgICAgICB0ZVs1XSA9IDEgLSAoeHggKyB6eik7XG4gICAgICAgIHRlWzldID0geXogLSB3eDtcblxuICAgICAgICB0ZVsyXSA9IHh6IC0gd3k7XG4gICAgICAgIHRlWzZdID0geXogKyB3eDtcbiAgICAgICAgdGVbMTBdID0gMSAtICh4eCArIHl5KTtcblxuICAgICAgICAvLyBsYXN0IGNvbHVtblxuICAgICAgICB0ZVszXSA9IDA7XG4gICAgICAgIHRlWzddID0gMDtcbiAgICAgICAgdGVbMTFdID0gMDtcblxuICAgICAgICAvLyBib3R0b20gcm93XG4gICAgICAgIHRlWzEyXSA9IDA7XG4gICAgICAgIHRlWzEzXSA9IDA7XG4gICAgICAgIHRlWzE0XSA9IDA7XG4gICAgICAgIHRlWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIEludmVyc2Uoc3JjOiBNYXQ0LCBkc3Q/OiBNYXQ0KTogTWF0NCB7XG4gICAgICAgIGlmICghZHN0KSBkc3QgPSBuZXcgTWF0NCgpO1xuXG4gICAgICAgIC8vIGJhc2VkIG9uIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2FsZ2VicmEvbWF0cml4L2Z1bmN0aW9ucy9pbnZlcnNlL2ZvdXJEL2luZGV4Lmh0bVxuICAgICAgICBjb25zdCB0ZSA9IGRzdC5lbGVtZW50cyxcbiAgICAgICAgICAgIG1lID0gc3JjLmVsZW1lbnRzLFxuICAgICAgICAgICAgbjExID0gbWVbMF0sXG4gICAgICAgICAgICBuMjEgPSBtZVsxXSxcbiAgICAgICAgICAgIG4zMSA9IG1lWzJdLFxuICAgICAgICAgICAgbjQxID0gbWVbM10sXG4gICAgICAgICAgICBuMTIgPSBtZVs0XSxcbiAgICAgICAgICAgIG4yMiA9IG1lWzVdLFxuICAgICAgICAgICAgbjMyID0gbWVbNl0sXG4gICAgICAgICAgICBuNDIgPSBtZVs3XSxcbiAgICAgICAgICAgIG4xMyA9IG1lWzhdLFxuICAgICAgICAgICAgbjIzID0gbWVbOV0sXG4gICAgICAgICAgICBuMzMgPSBtZVsxMF0sXG4gICAgICAgICAgICBuNDMgPSBtZVsxMV0sXG4gICAgICAgICAgICBuMTQgPSBtZVsxMl0sXG4gICAgICAgICAgICBuMjQgPSBtZVsxM10sXG4gICAgICAgICAgICBuMzQgPSBtZVsxNF0sXG4gICAgICAgICAgICBuNDQgPSBtZVsxNV0sXG4gICAgICAgICAgICB0MTEgPSBuMjMgKiBuMzQgKiBuNDIgLSBuMjQgKiBuMzMgKiBuNDIgKyBuMjQgKiBuMzIgKiBuNDMgLSBuMjIgKiBuMzQgKiBuNDMgLSBuMjMgKiBuMzIgKiBuNDQgKyBuMjIgKiBuMzMgKiBuNDQsXG4gICAgICAgICAgICB0MTIgPSBuMTQgKiBuMzMgKiBuNDIgLSBuMTMgKiBuMzQgKiBuNDIgLSBuMTQgKiBuMzIgKiBuNDMgKyBuMTIgKiBuMzQgKiBuNDMgKyBuMTMgKiBuMzIgKiBuNDQgLSBuMTIgKiBuMzMgKiBuNDQsXG4gICAgICAgICAgICB0MTMgPSBuMTMgKiBuMjQgKiBuNDIgLSBuMTQgKiBuMjMgKiBuNDIgKyBuMTQgKiBuMjIgKiBuNDMgLSBuMTIgKiBuMjQgKiBuNDMgLSBuMTMgKiBuMjIgKiBuNDQgKyBuMTIgKiBuMjMgKiBuNDQsXG4gICAgICAgICAgICB0MTQgPSBuMTQgKiBuMjMgKiBuMzIgLSBuMTMgKiBuMjQgKiBuMzIgLSBuMTQgKiBuMjIgKiBuMzMgKyBuMTIgKiBuMjQgKiBuMzMgKyBuMTMgKiBuMjIgKiBuMzQgLSBuMTIgKiBuMjMgKiBuMzQ7XG5cbiAgICAgICAgY29uc3QgZGV0ID0gbjExICogdDExICsgbjIxICogdDEyICsgbjMxICogdDEzICsgbjQxICogdDE0O1xuICAgICAgICBpZiAoZGV0ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZHN0LmlkZW50aXR5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZXRJbnYgPSAxIC8gZGV0O1xuXG4gICAgICAgIHRlWzBdID0gdDExICogZGV0SW52O1xuICAgICAgICB0ZVsxXSA9IChuMjQgKiBuMzMgKiBuNDEgLSBuMjMgKiBuMzQgKiBuNDEgLSBuMjQgKiBuMzEgKiBuNDMgKyBuMjEgKiBuMzQgKiBuNDMgKyBuMjMgKiBuMzEgKiBuNDQgLSBuMjEgKiBuMzMgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVsyXSA9IChuMjIgKiBuMzQgKiBuNDEgLSBuMjQgKiBuMzIgKiBuNDEgKyBuMjQgKiBuMzEgKiBuNDIgLSBuMjEgKiBuMzQgKiBuNDIgLSBuMjIgKiBuMzEgKiBuNDQgKyBuMjEgKiBuMzIgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVszXSA9IChuMjMgKiBuMzIgKiBuNDEgLSBuMjIgKiBuMzMgKiBuNDEgLSBuMjMgKiBuMzEgKiBuNDIgKyBuMjEgKiBuMzMgKiBuNDIgKyBuMjIgKiBuMzEgKiBuNDMgLSBuMjEgKiBuMzIgKiBuNDMpICogZGV0SW52O1xuXG4gICAgICAgIHRlWzRdID0gdDEyICogZGV0SW52O1xuICAgICAgICB0ZVs1XSA9IChuMTMgKiBuMzQgKiBuNDEgLSBuMTQgKiBuMzMgKiBuNDEgKyBuMTQgKiBuMzEgKiBuNDMgLSBuMTEgKiBuMzQgKiBuNDMgLSBuMTMgKiBuMzEgKiBuNDQgKyBuMTEgKiBuMzMgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVs2XSA9IChuMTQgKiBuMzIgKiBuNDEgLSBuMTIgKiBuMzQgKiBuNDEgLSBuMTQgKiBuMzEgKiBuNDIgKyBuMTEgKiBuMzQgKiBuNDIgKyBuMTIgKiBuMzEgKiBuNDQgLSBuMTEgKiBuMzIgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVs3XSA9IChuMTIgKiBuMzMgKiBuNDEgLSBuMTMgKiBuMzIgKiBuNDEgKyBuMTMgKiBuMzEgKiBuNDIgLSBuMTEgKiBuMzMgKiBuNDIgLSBuMTIgKiBuMzEgKiBuNDMgKyBuMTEgKiBuMzIgKiBuNDMpICogZGV0SW52O1xuXG4gICAgICAgIHRlWzhdID0gdDEzICogZGV0SW52O1xuICAgICAgICB0ZVs5XSA9IChuMTQgKiBuMjMgKiBuNDEgLSBuMTMgKiBuMjQgKiBuNDEgLSBuMTQgKiBuMjEgKiBuNDMgKyBuMTEgKiBuMjQgKiBuNDMgKyBuMTMgKiBuMjEgKiBuNDQgLSBuMTEgKiBuMjMgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVsxMF0gPSAobjEyICogbjI0ICogbjQxIC0gbjE0ICogbjIyICogbjQxICsgbjE0ICogbjIxICogbjQyIC0gbjExICogbjI0ICogbjQyIC0gbjEyICogbjIxICogbjQ0ICsgbjExICogbjIyICogbjQ0KSAqIGRldEludjtcbiAgICAgICAgdGVbMTFdID0gKG4xMyAqIG4yMiAqIG40MSAtIG4xMiAqIG4yMyAqIG40MSAtIG4xMyAqIG4yMSAqIG40MiArIG4xMSAqIG4yMyAqIG40MiArIG4xMiAqIG4yMSAqIG40MyAtIG4xMSAqIG4yMiAqIG40MykgKiBkZXRJbnY7XG5cbiAgICAgICAgdGVbMTJdID0gdDE0ICogZGV0SW52O1xuICAgICAgICB0ZVsxM10gPSAobjEzICogbjI0ICogbjMxIC0gbjE0ICogbjIzICogbjMxICsgbjE0ICogbjIxICogbjMzIC0gbjExICogbjI0ICogbjMzIC0gbjEzICogbjIxICogbjM0ICsgbjExICogbjIzICogbjM0KSAqIGRldEludjtcbiAgICAgICAgdGVbMTRdID0gKG4xNCAqIG4yMiAqIG4zMSAtIG4xMiAqIG4yNCAqIG4zMSAtIG4xNCAqIG4yMSAqIG4zMiArIG4xMSAqIG4yNCAqIG4zMiArIG4xMiAqIG4yMSAqIG4zNCAtIG4xMSAqIG4yMiAqIG4zNCkgKiBkZXRJbnY7XG4gICAgICAgIHRlWzE1XSA9IChuMTIgKiBuMjMgKiBuMzEgLSBuMTMgKiBuMjIgKiBuMzEgKyBuMTMgKiBuMjEgKiBuMzIgLSBuMTEgKiBuMjMgKiBuMzIgLSBuMTIgKiBuMjEgKiBuMzMgKyBuMTEgKiBuMjIgKiBuMzMpICogZGV0SW52O1xuXG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIE11bChhOiBNYXQ0LCBiOiBNYXQ0LCBkc3Q/OiBNYXQ0KTogTWF0NCB7XG4gICAgICAgIGlmIChkc3QgPT09IHVuZGVmaW5lZCkgZHN0ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgY29uc3QgYWUgPSBhLmVsZW1lbnRzO1xuICAgICAgICBjb25zdCBiZSA9IGIuZWxlbWVudHM7XG4gICAgICAgIGNvbnN0IHRlID0gZHN0LmVsZW1lbnRzO1xuXG4gICAgICAgIGNvbnN0IGExMSA9IGFlWzBdO1xuICAgICAgICBjb25zdCBhMTIgPSBhZVs0XTtcbiAgICAgICAgY29uc3QgYTEzID0gYWVbOF07XG4gICAgICAgIGNvbnN0IGExNCA9IGFlWzEyXTtcbiAgICAgICAgY29uc3QgYTIxID0gYWVbMV07XG4gICAgICAgIGNvbnN0IGEyMiA9IGFlWzVdO1xuICAgICAgICBjb25zdCBhMjMgPSBhZVs5XTtcbiAgICAgICAgY29uc3QgYTI0ID0gYWVbMTNdO1xuICAgICAgICBjb25zdCBhMzEgPSBhZVsyXTtcbiAgICAgICAgY29uc3QgYTMyID0gYWVbNl07XG4gICAgICAgIGNvbnN0IGEzMyA9IGFlWzEwXTtcbiAgICAgICAgY29uc3QgYTM0ID0gYWVbMTRdO1xuICAgICAgICBjb25zdCBhNDEgPSBhZVszXTtcbiAgICAgICAgY29uc3QgYTQyID0gYWVbN107XG4gICAgICAgIGNvbnN0IGE0MyA9IGFlWzExXTtcbiAgICAgICAgY29uc3QgYTQ0ID0gYWVbMTVdO1xuXG4gICAgICAgIGNvbnN0IGIxMSA9IGJlWzBdO1xuICAgICAgICBjb25zdCBiMTIgPSBiZVs0XTtcbiAgICAgICAgY29uc3QgYjEzID0gYmVbOF07XG4gICAgICAgIGNvbnN0IGIxNCA9IGJlWzEyXTtcbiAgICAgICAgY29uc3QgYjIxID0gYmVbMV07XG4gICAgICAgIGNvbnN0IGIyMiA9IGJlWzVdO1xuICAgICAgICBjb25zdCBiMjMgPSBiZVs5XTtcbiAgICAgICAgY29uc3QgYjI0ID0gYmVbMTNdO1xuICAgICAgICBjb25zdCBiMzEgPSBiZVsyXTtcbiAgICAgICAgY29uc3QgYjMyID0gYmVbNl07XG4gICAgICAgIGNvbnN0IGIzMyA9IGJlWzEwXTtcbiAgICAgICAgY29uc3QgYjM0ID0gYmVbMTRdO1xuICAgICAgICBjb25zdCBiNDEgPSBiZVszXTtcbiAgICAgICAgY29uc3QgYjQyID0gYmVbN107XG4gICAgICAgIGNvbnN0IGI0MyA9IGJlWzExXTtcbiAgICAgICAgY29uc3QgYjQ0ID0gYmVbMTVdO1xuXG4gICAgICAgIHRlWzBdID0gYTExICogYjExICsgYTEyICogYjIxICsgYTEzICogYjMxICsgYTE0ICogYjQxO1xuICAgICAgICB0ZVs0XSA9IGExMSAqIGIxMiArIGExMiAqIGIyMiArIGExMyAqIGIzMiArIGExNCAqIGI0MjtcbiAgICAgICAgdGVbOF0gPSBhMTEgKiBiMTMgKyBhMTIgKiBiMjMgKyBhMTMgKiBiMzMgKyBhMTQgKiBiNDM7XG4gICAgICAgIHRlWzEyXSA9IGExMSAqIGIxNCArIGExMiAqIGIyNCArIGExMyAqIGIzNCArIGExNCAqIGI0NDtcblxuICAgICAgICB0ZVsxXSA9IGEyMSAqIGIxMSArIGEyMiAqIGIyMSArIGEyMyAqIGIzMSArIGEyNCAqIGI0MTtcbiAgICAgICAgdGVbNV0gPSBhMjEgKiBiMTIgKyBhMjIgKiBiMjIgKyBhMjMgKiBiMzIgKyBhMjQgKiBiNDI7XG4gICAgICAgIHRlWzldID0gYTIxICogYjEzICsgYTIyICogYjIzICsgYTIzICogYjMzICsgYTI0ICogYjQzO1xuICAgICAgICB0ZVsxM10gPSBhMjEgKiBiMTQgKyBhMjIgKiBiMjQgKyBhMjMgKiBiMzQgKyBhMjQgKiBiNDQ7XG5cbiAgICAgICAgdGVbMl0gPSBhMzEgKiBiMTEgKyBhMzIgKiBiMjEgKyBhMzMgKiBiMzEgKyBhMzQgKiBiNDE7XG4gICAgICAgIHRlWzZdID0gYTMxICogYjEyICsgYTMyICogYjIyICsgYTMzICogYjMyICsgYTM0ICogYjQyO1xuICAgICAgICB0ZVsxMF0gPSBhMzEgKiBiMTMgKyBhMzIgKiBiMjMgKyBhMzMgKiBiMzMgKyBhMzQgKiBiNDM7XG4gICAgICAgIHRlWzE0XSA9IGEzMSAqIGIxNCArIGEzMiAqIGIyNCArIGEzMyAqIGIzNCArIGEzNCAqIGI0NDtcblxuICAgICAgICB0ZVszXSA9IGE0MSAqIGIxMSArIGE0MiAqIGIyMSArIGE0MyAqIGIzMSArIGE0NCAqIGI0MTtcbiAgICAgICAgdGVbN10gPSBhNDEgKiBiMTIgKyBhNDIgKiBiMjIgKyBhNDMgKiBiMzIgKyBhNDQgKiBiNDI7XG4gICAgICAgIHRlWzExXSA9IGE0MSAqIGIxMyArIGE0MiAqIGIyMyArIGE0MyAqIGIzMyArIGE0NCAqIGI0MztcbiAgICAgICAgdGVbMTVdID0gYTQxICogYjE0ICsgYTQyICogYjI0ICsgYTQzICogYjM0ICsgYTQ0ICogYjQ0O1xuXG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9ICdbJyArIHRoaXMuZWxlbWVudHNbMF0udG9GaXhlZCg0KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLmVsZW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gJywgJyArIHRoaXMuZWxlbWVudHNbaV0udG9GaXhlZCg0KTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gJ10nO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdDMgaW1wbGVtZW50cyBIZWFwUG9pbnRlciB7XG4gICAgc2l6ZTogbnVtYmVyID0gOTtcbiAgICBlbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoOSk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xuICAgICAgICBmb290cHJpbnRfYWxsb2MoOSk7XG4gICAgfVxuXG4gICAgcmVhZChidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zaXplOyArK2kpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbaV0gPSBidWZmZXJbb2Zmc2V0ICsgaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgd3JpdGUoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgKytpKSB7XG4gICAgICAgICAgICBidWZmZXJbb2Zmc2V0ICsgaV0gPSB0aGlzLmVsZW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCk6IE1hdDMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnNldChbMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KG06IE1hdDMpOiBNYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5zZXQobS5lbGVtZW50cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21fbWF0NChtOiBNYXQ0KTogTWF0MyB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgY29uc3QgbWUgPSBtLmVsZW1lbnRzO1xuICAgICAgICB0ZVswXSA9IG1lWzBdO1xuICAgICAgICB0ZVsxXSA9IG1lWzFdO1xuICAgICAgICB0ZVsyXSA9IG1lWzJdO1xuICAgICAgICB0ZVszXSA9IG1lWzRdO1xuICAgICAgICB0ZVs0XSA9IG1lWzVdO1xuICAgICAgICB0ZVs1XSA9IG1lWzZdO1xuICAgICAgICB0ZVs2XSA9IG1lWzhdO1xuICAgICAgICB0ZVs3XSA9IG1lWzldO1xuICAgICAgICB0ZVs4XSA9IG1lWzEwXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsX21hdHJpeF9mcm9tX21hdDQobTogTWF0NCk6IE1hdDMge1xuICAgICAgICB0aGlzLmZyb21fbWF0NChtKS5pbnZlcnNlKCkudHJhbnNwb3NlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UoKTogTWF0MyB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgY29uc3QgbjExID0gdGVbMF07XG4gICAgICAgIGNvbnN0IG4yMSA9IHRlWzFdO1xuICAgICAgICBjb25zdCBuMzEgPSB0ZVsyXTtcbiAgICAgICAgY29uc3QgbjEyID0gdGVbM107XG4gICAgICAgIGNvbnN0IG4yMiA9IHRlWzRdO1xuICAgICAgICBjb25zdCBuMzIgPSB0ZVs1XTtcbiAgICAgICAgY29uc3QgbjEzID0gdGVbNl07XG4gICAgICAgIGNvbnN0IG4yMyA9IHRlWzddO1xuICAgICAgICBjb25zdCBuMzMgPSB0ZVs4XTtcblxuICAgICAgICBjb25zdCB0MTEgPSBuMzMgKiBuMjIgLSBuMzIgKiBuMjM7XG4gICAgICAgIGNvbnN0IHQxMiA9IG4zMiAqIG4xMyAtIG4zMyAqIG4xMjtcbiAgICAgICAgY29uc3QgdDEzID0gbjIzICogbjEyIC0gbjIyICogbjEzO1xuXG4gICAgICAgIGNvbnN0IGRldCA9IG4xMSAqIHQxMSArIG4yMSAqIHQxMiArIG4zMSAqIHQxMztcbiAgICAgICAgaWYgKGRldCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5maWxsKDApO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZXRfaW52ID0gMSAvIGRldDtcblxuICAgICAgICB0ZVswXSA9IHQxMSAqIGRldF9pbnY7XG4gICAgICAgIHRlWzFdID0gKG4zMSAqIG4yMyAtIG4zMyAqIG4yMSkgKiBkZXRfaW52O1xuICAgICAgICB0ZVsyXSA9IChuMzIgKiBuMjEgLSBuMzEgKiBuMjIpICogZGV0X2ludjtcblxuICAgICAgICB0ZVszXSA9IHQxMiAqIGRldF9pbnY7XG4gICAgICAgIHRlWzRdID0gKG4zMyAqIG4xMSAtIG4zMSAqIG4xMykgKiBkZXRfaW52O1xuICAgICAgICB0ZVs1XSA9IChuMzEgKiBuMTIgLSBuMzIgKiBuMTEpICogZGV0X2ludjtcblxuICAgICAgICB0ZVs2XSA9IHQxMyAqIGRldF9pbnY7XG4gICAgICAgIHRlWzddID0gKG4yMSAqIG4xMyAtIG4yMyAqIG4xMSkgKiBkZXRfaW52O1xuICAgICAgICB0ZVs4XSA9IChuMjIgKiBuMTEgLSBuMjEgKiBuMTIpICogZGV0X2ludjtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0cmFuc3Bvc2UoKTogTWF0MyB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgbGV0IHRtcDtcblxuICAgICAgICB0bXAgPSB0ZVsxXTtcbiAgICAgICAgdGVbMV0gPSB0ZVszXTtcbiAgICAgICAgdGVbM10gPSB0bXA7XG5cbiAgICAgICAgdG1wID0gdGVbMl07XG4gICAgICAgIHRlWzJdID0gdGVbNl07XG4gICAgICAgIHRlWzZdID0gdG1wO1xuXG4gICAgICAgIHRtcCA9IHRlWzVdO1xuICAgICAgICB0ZVs1XSA9IHRlWzddO1xuICAgICAgICB0ZVs3XSA9IHRtcDtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICBsZXQgcmVzdWx0ID0gJ1snICsgdGhpcy5lbGVtZW50c1swXS50b0ZpeGVkKDQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMuZWxlbWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSAnLCAnICsgdGhpcy5lbGVtZW50c1tpXS50b0ZpeGVkKDQpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSAnXSc7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgc3RhdGljIEdldENvbHVtbihzcmM6IE1hdDMsIGluZGV4OiBudW1iZXIsIGRzdDogRmxvYXQzKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc3JjLmVsZW1lbnRzO1xuICAgICAgICBkc3QueCA9IGVsZW1lbnRzW2luZGV4XTtcbiAgICAgICAgZHN0LnkgPSBlbGVtZW50c1tpbmRleCArIDNdO1xuICAgICAgICBkc3QueiA9IGVsZW1lbnRzW2luZGV4ICsgNl07XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIERpYWdvbmFsKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIGRzdDogTWF0Mykge1xuICAgICAgICBkc3QuZWxlbWVudHMuc2V0KFt4LCAwLCAwLCAwLCB5LCAwLCAwLCAwLCB6XSk7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgTUFUNF9JREVOVElUWSA9IG5ldyBNYXQ0KCkuaWRlbnRpdHkoKTsiLCAiaW1wb3J0IHsgQm94MyB9IGZyb20gJy4vYm94JztcbmltcG9ydCB7IFBsYW5lIH0gZnJvbSAnLi9wbGFuZSc7XG5pbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuL3NpbWQnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4vc2ltZF9tYXQnO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi9zcGhlcmUnO1xuXG5jb25zdCB2ID0gbmV3IEZsb2F0MygpO1xuXG4vLyB0cmlhbmdsZSB0bXAgdmFyaWFibGVcbmNvbnN0IG5vcm1hbCA9IG5ldyBGbG9hdDMoKTtcbmNvbnN0IGVkZ2UxID0gbmV3IEZsb2F0MygpO1xuY29uc3QgZWRnZTIgPSBuZXcgRmxvYXQzKCk7XG5jb25zdCBkaWZmID0gbmV3IEZsb2F0MygpO1xuXG5leHBvcnQgY2xhc3MgUmF5IHtcbiAgICBvcmlnaW46IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbiAgICBkaXJlY3Rpb246IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxuICAgIGNvbnN0cnVjdG9yKG9yaWdpbj86IEZsb2F0MywgZGlyZWN0aW9uPzogRmxvYXQzKSB7XG4gICAgICAgIGlmIChvcmlnaW4gIT09IHVuZGVmaW5lZCkgdGhpcy5vcmlnaW4uY29weShvcmlnaW4pO1xuICAgICAgICBpZiAoZGlyZWN0aW9uICE9PSB1bmRlZmluZWQpIHRoaXMuZGlyZWN0aW9uLmNvcHkoZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICBjb3B5KHI6IFJheSk6IFJheSB7XG4gICAgICAgIHRoaXMub3JpZ2luLmNvcHkoci5vcmlnaW4pO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbi5jb3B5KHIuZGlyZWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXQodDogbnVtYmVyLCB0YXJnZXQ6IEZsb2F0MyA9IHYpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmNvcHkodGhpcy5kaXJlY3Rpb24pLm11bCh0KS5hZGQodGhpcy5vcmlnaW4pIGFzIEZsb2F0MztcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0KG06IE1hdDQpOiBSYXkge1xuICAgICAgICB0aGlzLm9yaWdpbi5hcHBseV9tYXQ0KG0pO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbi5hcHBseV9tYXQ0X2RpcmVjdGlvbmFsKG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkaXN0YW5jZV90b19wb2ludChwb2ludDogRmxvYXQzKTogbnVtYmVyIHtcbiAgICAgICAgdi5jb3B5KHBvaW50KS5zdWIodGhpcy5vcmlnaW4pO1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHYuZG90KHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luLmRpc3RhbmNlKHBvaW50KTtcbiAgICAgICAgfVxuICAgICAgICB2LmNvcHkodGhpcy5kaXJlY3Rpb24pLm11bChkaXN0YW5jZSkuYWRkKHRoaXMub3JpZ2luKTtcbiAgICAgICAgcmV0dXJuIHYuZGlzdGFuY2UocG9pbnQpO1xuICAgIH1cblxuICAgIGludGVyc2VjdF9ib3goYm94OiBCb3gzLCB0YXJnZXQ6IEZsb2F0MyA9IHYpOiBGbG9hdDMgfCBudWxsIHtcbiAgICAgICAgbGV0IHRtaW4sIHRtYXgsIHR5bWluLCB0eW1heCwgdHptaW4sIHR6bWF4O1xuXG4gICAgICAgIGNvbnN0IGludmRpcnggPSAxIC8gdGhpcy5kaXJlY3Rpb24ueDtcbiAgICAgICAgY29uc3QgaW52ZGlyeSA9IDEgLyB0aGlzLmRpcmVjdGlvbi55O1xuICAgICAgICBjb25zdCBpbnZkaXJ6ID0gMSAvIHRoaXMuZGlyZWN0aW9uLno7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdGhpcy5vcmlnaW47XG5cbiAgICAgICAgaWYgKGludmRpcnggPj0gMCkge1xuICAgICAgICAgICAgdG1pbiA9IChib3gubWluLnggLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICAgICAgdG1heCA9IChib3gubWF4LnggLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG1pbiA9IChib3gubWF4LnggLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICAgICAgdG1heCA9IChib3gubWluLnggLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGludmRpcnkgPj0gMCkge1xuICAgICAgICAgICAgdHltaW4gPSAoYm94Lm1pbi55IC0gb3JpZ2luLnkpICogaW52ZGlyeTtcbiAgICAgICAgICAgIHR5bWF4ID0gKGJveC5tYXgueSAtIG9yaWdpbi55KSAqIGludmRpcnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eW1pbiA9IChib3gubWF4LnkgLSBvcmlnaW4ueSkgKiBpbnZkaXJ5O1xuICAgICAgICAgICAgdHltYXggPSAoYm94Lm1pbi55IC0gb3JpZ2luLnkpICogaW52ZGlyeTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0bWluID4gdHltYXggfHwgdHltaW4gPiB0bWF4KSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyBUaGVzZSBsaW5lcyBhbHNvIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSB0bWluIG9yIHRtYXggaXMgTmFOXG4gICAgICAgIC8vIChyZXN1bHQgb2YgMCAqIEluZmluaXR5KS4geCAhPT0geCByZXR1cm5zIHRydWUgaWYgeCBpcyBOYU5cblxuICAgICAgICBpZiAodHltaW4gPiB0bWluIHx8IHRtaW4gIT09IHRtaW4pIHRtaW4gPSB0eW1pbjtcbiAgICAgICAgaWYgKHR5bWF4IDwgdG1heCB8fCB0bWF4ICE9PSB0bWF4KSB0bWF4ID0gdHltYXg7XG5cbiAgICAgICAgaWYgKGludmRpcnogPj0gMCkge1xuICAgICAgICAgICAgdHptaW4gPSAoYm94Lm1pbi56IC0gb3JpZ2luLnopICogaW52ZGlyejtcbiAgICAgICAgICAgIHR6bWF4ID0gKGJveC5tYXgueiAtIG9yaWdpbi56KSAqIGludmRpcno7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0em1pbiA9IChib3gubWF4LnogLSBvcmlnaW4ueikgKiBpbnZkaXJ6O1xuICAgICAgICAgICAgdHptYXggPSAoYm94Lm1pbi56IC0gb3JpZ2luLnopICogaW52ZGlyejtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0bWluID4gdHptYXggfHwgdHptaW4gPiB0bWF4KSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKHR6bWluID4gdG1pbiB8fCB0bWluICE9PSB0bWluKSB0bWluID0gdHptaW47XG4gICAgICAgIGlmICh0em1heCA8IHRtYXggfHwgdG1heCAhPT0gdG1heCkgdG1heCA9IHR6bWF4O1xuXG4gICAgICAgIC8vcmV0dXJuIHBvaW50IGNsb3Nlc3QgdG8gdGhlIHJheSAocG9zaXRpdmUgc2lkZSlcbiAgICAgICAgaWYgKHRtYXggPCAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXQodG1pbiA+PSAwID8gdG1pbiA6IHRtYXgsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgaXNfaW50ZXJzZWN0X2JveChib3g6IEJveDMpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJzZWN0X2JveChib3gpICE9PSBudWxsO1xuICAgIH1cblxuICAgIGludGVyc2VjdF9zcGhlcmUoc3BoZXJlOiBTcGhlcmUsIHRhcmdldDogRmxvYXQzID0gdik6IEZsb2F0MyB8IG51bGwge1xuICAgICAgICB2LmNvcHkoc3BoZXJlLmNlbnRlcikuc3ViKHRoaXMub3JpZ2luKTtcbiAgICAgICAgY29uc3QgdGNhID0gdi5kb3QodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICBjb25zdCBkMiA9IHYuZG90KHYpIC0gdGNhICogdGNhO1xuICAgICAgICBjb25zdCByYWRpdXMyID0gc3BoZXJlLnJhZGl1cyAqIHNwaGVyZS5yYWRpdXM7XG5cbiAgICAgICAgaWYgKGQyID4gcmFkaXVzMikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgdGhjID0gTWF0aC5zcXJ0KHJhZGl1czIgLSBkMik7XG5cbiAgICAgICAgLy8gdDAgPSBmaXJzdCBpbnRlcnNlY3QgcG9pbnQgLSBlbnRyYW5jZSBvbiBmcm9udCBvZiBzcGhlcmVcbiAgICAgICAgY29uc3QgdDAgPSB0Y2EgLSB0aGM7XG5cbiAgICAgICAgLy8gdDEgPSBzZWNvbmQgaW50ZXJzZWN0IHBvaW50IC0gZXhpdCBwb2ludCBvbiBiYWNrIG9mIHNwaGVyZVxuICAgICAgICBjb25zdCB0MSA9IHRjYSArIHRoYztcblxuICAgICAgICAvLyB0ZXN0IHRvIHNlZSBpZiBib3RoIHQwIGFuZCB0MSBhcmUgYmVoaW5kIHRoZSByYXkgLSBpZiBzbywgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHQwIDwgMCAmJiB0MSA8IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIHRlc3QgdG8gc2VlIGlmIHQwIGlzIGJlaGluZCB0aGUgcmF5OlxuICAgICAgICAvLyBpZiBpdCBpcywgdGhlIHJheSBpcyBpbnNpZGUgdGhlIHNwaGVyZSwgc28gcmV0dXJuIHRoZSBzZWNvbmQgZXhpdCBwb2ludCBzY2FsZWQgYnkgdDEsXG4gICAgICAgIC8vIGluIG9yZGVyIHRvIGFsd2F5cyByZXR1cm4gYW4gaW50ZXJzZWN0IHBvaW50IHRoYXQgaXMgaW4gZnJvbnQgb2YgdGhlIHJheS5cbiAgICAgICAgaWYgKHQwIDwgMCkgcmV0dXJuIHRoaXMuYXQodDEsIHRhcmdldCk7XG5cbiAgICAgICAgLy8gZWxzZSB0MCBpcyBpbiBmcm9udCBvZiB0aGUgcmF5LCBzbyByZXR1cm4gdGhlIGZpcnN0IGNvbGxpc2lvbiBwb2ludCBzY2FsZWQgYnkgdDBcbiAgICAgICAgcmV0dXJuIHRoaXMuYXQodDAsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgaXNfaW50ZXJzZWN0X3NwaGVyZShzcGhlcmU6IFNwaGVyZSwgdGFyZ2V0OiBGbG9hdDMgPSB2KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyc2VjdF9zcGhlcmUoc3BoZXJlLCB0YXJnZXQpICE9PSBudWxsO1xuICAgIH1cblxuICAgIGludGVyc2VjdF90cmlhbmdsZShhOiBGbG9hdDMsIGI6IEZsb2F0MywgYzogRmxvYXQzLCBkb3VibGVfc2lkZTogYm9vbGVhbiA9IGZhbHNlLCB0YXJnZXQ6IEZsb2F0MyA9IHYpOiBGbG9hdDMgfCBudWxsIHtcbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgb2Zmc2V0IG9yaWdpbiwgZWRnZXMsIGFuZCBub3JtYWwuXG5cbiAgICAgICAgLy8gZnJvbSBodHRwOi8vd3d3Lmdlb21ldHJpY3Rvb2xzLmNvbS9HVEVuZ2luZS9JbmNsdWRlL01hdGhlbWF0aWNzL0d0ZUludHJSYXkzVHJpYW5nbGUzLmhcblxuICAgICAgICBlZGdlMS5jb3B5KGIpLnN1YihhKTtcbiAgICAgICAgZWRnZTIuY29weShjKS5zdWIoYSk7XG4gICAgICAgIEZsb2F0My5Dcm9zcyhlZGdlMSwgZWRnZTIsIG5vcm1hbCk7XG5cbiAgICAgICAgLy8gU29sdmUgUSArIHQqRCA9IGIxKkUxICsgYjIqRTIgKFEgPSBrRGlmZiwgRCA9IHJheSBkaXJlY3Rpb24sXG4gICAgICAgIC8vIEUxID0ga0VkZ2UxLCBFMiA9IGtFZGdlMiwgTiA9IENyb3NzKEUxLEUyKSkgYnlcbiAgICAgICAgLy8gICB8RG90KEQsTil8KmIxID0gc2lnbihEb3QoRCxOKSkqRG90KEQsQ3Jvc3MoUSxFMikpXG4gICAgICAgIC8vICAgfERvdChELE4pfCpiMiA9IHNpZ24oRG90KEQsTikpKkRvdChELENyb3NzKEUxLFEpKVxuICAgICAgICAvLyAgIHxEb3QoRCxOKXwqdCA9IC1zaWduKERvdChELE4pKSpEb3QoUSxOKVxuICAgICAgICBsZXQgRGROID0gdGhpcy5kaXJlY3Rpb24uZG90KG5vcm1hbCk7XG4gICAgICAgIGxldCBzaWduO1xuXG4gICAgICAgIGlmIChEZE4gPiAwKSB7XG4gICAgICAgICAgICBpZiAoIWRvdWJsZV9zaWRlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHNpZ24gPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKERkTiA8IDApIHtcbiAgICAgICAgICAgIHNpZ24gPSAtMTtcbiAgICAgICAgICAgIERkTiA9IC1EZE47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpZmYuY29weSh0aGlzLm9yaWdpbikuc3ViKGEpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3MoZGlmZiwgZWRnZTIsIGVkZ2UyKTtcbiAgICAgICAgY29uc3QgRGRReEUyID0gc2lnbiAqIHRoaXMuZGlyZWN0aW9uLmRvdChlZGdlMik7XG5cbiAgICAgICAgLy8gYjEgPCAwLCBubyBpbnRlcnNlY3Rpb25cbiAgICAgICAgaWYgKERkUXhFMiA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgRGRFMXhRID0gc2lnbiAqIHRoaXMuZGlyZWN0aW9uLmRvdChlZGdlMS5jcm9zcyhkaWZmKSk7XG4gICAgICAgIC8vIGIyIDwgMCwgbm8gaW50ZXJzZWN0aW9uXG4gICAgICAgIGlmIChEZEUxeFEgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGIxK2IyID4gMSwgbm8gaW50ZXJzZWN0aW9uXG4gICAgICAgIGlmIChEZFF4RTIgKyBEZEUxeFEgPiBEZE4pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGluZSBpbnRlcnNlY3RzIHRyaWFuZ2xlLCBjaGVjayBpZiByYXkgZG9lcy5cbiAgICAgICAgY29uc3QgUWROID0gLXNpZ24gKiBkaWZmLmRvdChub3JtYWwpO1xuICAgICAgICAvLyB0IDwgMCwgbm8gaW50ZXJzZWN0aW9uXG4gICAgICAgIGlmIChRZE4gPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJheSBpbnRlcnNlY3RzIHRyaWFuZ2xlLlxuICAgICAgICByZXR1cm4gdGhpcy5hdChRZE4gLyBEZE4sIHRhcmdldCk7XG4gICAgfVxuXG4gICAgaXNfdHJpYW5nbGVfaW50ZXJzZWN0KGE6IEZsb2F0MywgYjogRmxvYXQzLCBjOiBGbG9hdDMsIGRvdWJsZV9zaWRlOiBib29sZWFuID0gZmFsc2UsIHRhcmdldDogRmxvYXQzID0gdik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnNlY3RfdHJpYW5nbGUoYSwgYiwgYywgZG91YmxlX3NpZGUsIHRhcmdldCkgIT09IG51bGw7XG4gICAgfVxuXG4gICAgaW50ZXJzZWN0X3BsYW5lKHBsYW5lOiBQbGFuZSwgdGFyZ2V0OiBGbG9hdDMgPSB2KTogRmxvYXQzIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGRlbm9taW5hdG9yID0gcGxhbmUubm9ybWFsLmRvdCh0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgIGlmIChkZW5vbWluYXRvciA9PT0gMCkge1xuICAgICAgICAgICAgLy8gbGluZSBpcyBjb3BsYW5hciwgcmV0dXJuIG9yaWdpblxuICAgICAgICAgICAgaWYgKHBsYW5lLmRpc3RhbmNlX3RvX3BvaW50KHRoaXMub3JpZ2luKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5jb3B5KHRoaXMub3JpZ2luKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOdWxsIGlzIHByZWZlcmFibGUgdG8gdW5kZWZpbmVkIHNpbmNlIHVuZGVmaW5lZCBtZWFucy4uLi4gaXQgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ID0gLSh0aGlzLm9yaWdpbi5kb3QocGxhbmUubm9ybWFsKSArIHBsYW5lLmNvbnN0YW50KSAvIGRlbm9taW5hdG9yO1xuICAgICAgICBpZiAodCA8IDApIHJldHVybiBudWxsO1xuICAgICAgICB0aGlzLmF0KHQsIHRhcmdldCk7XG4gICAgICAgIC8vIFJldHVybiBpZiB0aGUgcmF5IG5ldmVyIGludGVyc2VjdHMgdGhlIHBsYW5lXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgYXBwbHlfbWF0cml4KG1hdDogTWF0NCk6IFJheSB7XG4gICAgICAgIHRoaXMub3JpZ2luLmFwcGx5X21hdDQobWF0KTtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24uYXBwbHlfbWF0NF9kaXJlY3Rpb25hbChtYXQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgZm9vdHByaW50X2FsbG9jIH0gZnJvbSAnLi4vbWVtb3J5L2Zvb3RwcmludCc7XG5pbXBvcnQgeyBIZWFwUG9pbnRlciB9IGZyb20gJy4uL21lbW9yeS9oZWFwX3BvaW50ZXInO1xuaW1wb3J0IHsgVHlwZWRBcnJheSB9IGZyb20gJy4uL3N0ZC90eXBlJztcbmltcG9ydCB7IGNsYW1wIH0gZnJvbSAnLi9tYXRoJztcbmltcG9ydCB7IEZsb2F0MiB9IGZyb20gJy4vc2ltZCc7XG5cbmV4cG9ydCBjbGFzcyBSZWN0IGltcGxlbWVudHMgSGVhcFBvaW50ZXIge1xuXG4gICAgc2l6ZSA9IDQ7XG4gICAgZWxlbWVudHMgPSBuZXcgRmxvYXQzMkFycmF5KDQpO1xuXG4gICAgc2V0IHgobjogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSBuO1xuICAgIH1cbiAgICBzZXQgeShuOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IG47XG4gICAgfVxuICAgIHNldCB3KG46IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gbjtcbiAgICB9XG4gICAgc2V0IGgobjogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSBuO1xuICAgIH1cblxuICAgIGdldCB4KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdO1xuICAgIH1cbiAgICBnZXQgeSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMl07XG4gICAgfVxuICAgIGdldCBoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzNdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHc6IG51bWJlciA9IDAsIGg6IG51bWJlciA9IDApIHtcbiAgICAgICAgdGhpcy5zZXQoeCwgeSwgdywgaCk7XG4gICAgICAgIGZvb3RwcmludF9hbGxvYyg0KTtcbiAgICB9XG5cbiAgICByZWFkKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IGJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gYnVmZmVyW29mZnNldCArIDFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gYnVmZmVyW29mZnNldCArIDJdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gYnVmZmVyW29mZnNldCArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB3cml0ZShidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIGJ1ZmZlcltvZmZzZXRdID0gdGhpcy5lbGVtZW50c1swXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDFdID0gdGhpcy5lbGVtZW50c1sxXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDJdID0gdGhpcy5lbGVtZW50c1syXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDNdID0gdGhpcy5lbGVtZW50c1szXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlcik6IFJlY3Qge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0geDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IHk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSB3O1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gaDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShyZWN0OiBSZWN0KTogUmVjdCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSByZWN0Lng7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSByZWN0Lnk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSByZWN0Lnc7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSByZWN0Lmg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnRhaW5zKHBvaW50OiBGbG9hdDIpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHBvaW50LnggPj0gdGhpcy5lbGVtZW50c1swXSAmJiBwb2ludC55ID49IHRoaXMuZWxlbWVudHNbMV0gJiYgcG9pbnQueCA8IHRoaXMuZWxlbWVudHNbMF0gKyB0aGlzLmVsZW1lbnRzWzJdICYmIHBvaW50LnkgPCB0aGlzLmVsZW1lbnRzWzFdICsgdGhpcy5lbGVtZW50c1szXTtcbiAgICB9XG5cbiAgICBlcXVhbHMocmVjdDogUmVjdCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXSA9PT0gcmVjdC54ICYmIHRoaXMuZWxlbWVudHNbMV0gPT09IHJlY3QueSAmJiB0aGlzLmVsZW1lbnRzWzJdID09PSByZWN0LncgJiYgdGhpcy5lbGVtZW50c1szXSA9PT0gcmVjdC5oO1xuICAgIH1cblxuICAgIGxvY2F0ZShyZWN0OiBSZWN0KTogUmVjdCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gKz0gcmVjdC54O1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdICs9IHJlY3QueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsKG46IG51bWJlcik6IFJlY3Qge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKj0gbjtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSAqPSBuO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdICo9IG47XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlKG46IG51bWJlcik6IFJlY3Qge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gKj0gbjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdHJhbnNsYXRlKHg6IG51bWJlciwgeTogbnVtYmVyKTogUmVjdCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gKz0geDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSArPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzaHJpbmsob2Zmc2V0OiBudW1iZXIsIG9mZnNldF9ob3Jpem9udGFsPzogbnVtYmVyKTogUmVjdCB7XG4gICAgICAgIGlmIChvZmZzZXRfaG9yaXpvbnRhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICs9IG9mZnNldDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKz0gb2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IE1hdGgubWF4KDAsIHRoaXMuZWxlbWVudHNbMl0gLSBvZmZzZXQgKiAyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSBNYXRoLm1heCgwLCB0aGlzLmVsZW1lbnRzWzNdIC0gb2Zmc2V0ICogMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICs9IG9mZnNldF9ob3Jpem9udGFsO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1sxXSArPSBvZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gTWF0aC5tYXgoMCwgdGhpcy5lbGVtZW50c1syXSAtIG9mZnNldF9ob3Jpem9udGFsICogMik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gTWF0aC5tYXgoMCwgdGhpcy5lbGVtZW50c1szXSAtIG9mZnNldCAqIDIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGV4cGFuZChvZmZzZXQ6IG51bWJlciwgb2Zmc2V0X2hvcml6b250YWw/OiBudW1iZXIpOiBSZWN0IHtcbiAgICAgICAgaWYgKG9mZnNldF9ob3Jpem9udGFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbMF0gLT0gb2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1sxXSAtPSBvZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzJdICs9IG9mZnNldCAqIDI7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzNdICs9IG9mZnNldCAqIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzBdIC09IG9mZnNldF9ob3Jpem9udGFsO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1sxXSAtPSBvZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzJdICs9IG9mZnNldF9ob3Jpem9udGFsICogMjtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbM10gKz0gb2Zmc2V0ICogMjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25zdHJhaW4ocG9pbnQ6IEZsb2F0Mik6IEZsb2F0MiB7XG4gICAgICAgIHBvaW50LnggPSBjbGFtcChwb2ludC54LCB0aGlzLmVsZW1lbnRzWzBdLCB0aGlzLmVsZW1lbnRzWzBdICsgdGhpcy5lbGVtZW50c1syXSk7XG4gICAgICAgIHBvaW50LnkgPSBjbGFtcChwb2ludC55LCB0aGlzLmVsZW1lbnRzWzFdLCB0aGlzLmVsZW1lbnRzWzFdICsgdGhpcy5lbGVtZW50c1szXSk7XG4gICAgICAgIHJldHVybiBwb2ludDtcbiAgICB9XG5cbiAgICBpbnRlcnNlY3QocmVjdDogUmVjdCk6IFJlY3Qge1xuICAgICAgICBjb25zdCBsID0gdGhpcy5lbGVtZW50c1swXSA+IHJlY3QueCA/IHRoaXMuZWxlbWVudHNbMF0gOiByZWN0Lng7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmVsZW1lbnRzWzFdID4gcmVjdC55ID8gdGhpcy5lbGVtZW50c1sxXSA6IHJlY3QueTtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuZWxlbWVudHNbMF0gKyB0aGlzLmVsZW1lbnRzWzJdIDwgcmVjdC54ICsgcmVjdC53ID8gdGhpcy5lbGVtZW50c1swXSArIHRoaXMuZWxlbWVudHNbMl0gOiByZWN0LnggKyByZWN0Lnc7XG4gICAgICAgIGNvbnN0IGIgPSB0aGlzLmVsZW1lbnRzWzFdICsgdGhpcy5lbGVtZW50c1szXSA8IHJlY3QueSArIHJlY3QuaCA/IHRoaXMuZWxlbWVudHNbMV0gKyB0aGlzLmVsZW1lbnRzWzNdIDogcmVjdC55ICsgcmVjdC5oO1xuICAgICAgICBpZiAobCA+PSByIHx8IHQgPj0gYikge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IDA7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gMDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSAwO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1szXSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gbDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSB0O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IHIgLSBsO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1szXSA9IGIgLSB0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZhbGlkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1syXSA+IDAgJiYgdGhpcy5lbGVtZW50c1szXSA+IDA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBSZWN0KCR7dGhpcy5lbGVtZW50c1swXX0sICR7dGhpcy5lbGVtZW50c1sxXX0sICR7dGhpcy5lbGVtZW50c1syXX0sICR7dGhpcy5lbGVtZW50c1szXX0pYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBSRUNUX1pFUk8gPSBuZXcgUmVjdCgwLCAwLCAwLCAwKTsiLCAiaW1wb3J0IHsgZm9vdHByaW50X2FsbG9jIH0gZnJvbSAnLi4vbWVtb3J5L2Zvb3RwcmludCc7XG5pbXBvcnQgeyBIZWFwUG9pbnRlciB9IGZyb20gJy4uL21lbW9yeS9oZWFwX3BvaW50ZXInO1xuaW1wb3J0IHsgVHlwZWRBcnJheSB9IGZyb20gJy4uL3N0ZC90eXBlJztcbmltcG9ydCB7IEV1bGVyLCBFdWxlck9yZGVyIH0gZnJvbSAnLi9ldWxlcic7XG5pbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuL3NpbWQnO1xuaW1wb3J0IHsgTWF0MywgTWF0NCB9IGZyb20gJy4vc2ltZF9tYXQnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNfcXVhdGVybmlvbihvYmo6IGFueSk6IG9iaiBpcyBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gb2JqICYmIG9iai5pc19xdWF0ZXJuaW9uO1xufVxuXG5leHBvcnQgY2xhc3MgUXVhdGVybmlvbiBpbXBsZW1lbnRzIEhlYXBQb2ludGVyIHtcbiAgICBpc19xdWF0ZXJuaW9uOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIHNpemUgPSA0O1xuICAgIGVsZW1lbnRzID0gbmV3IEZsb2F0MzJBcnJheSg0KTtcblxuICAgIGdldCB4KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdO1xuICAgIH1cbiAgICBzZXQgeCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgeSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgc2V0IHkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMl07XG4gICAgfVxuICAgIHNldCB6KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB3KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzNdO1xuICAgIH1cbiAgICBzZXQgdyh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwLCB3OiBudW1iZXIgPSAxKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgICAgIHRoaXMudyA9IHc7XG4gICAgICAgIGZvb3RwcmludF9hbGxvYyg0KTtcbiAgICB9XG5cbiAgICByZWFkKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IGJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gYnVmZmVyW29mZnNldCArIDFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gYnVmZmVyW29mZnNldCArIDJdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gYnVmZmVyW29mZnNldCArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB3cml0ZShidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIGJ1ZmZlcltvZmZzZXRdID0gdGhpcy5lbGVtZW50c1swXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDFdID0gdGhpcy5lbGVtZW50c1sxXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDJdID0gdGhpcy5lbGVtZW50c1syXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDNdID0gdGhpcy5lbGVtZW50c1szXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KC4uLmFyZ3M6IG51bWJlcltdKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGlmICghYXJncykgdGhpcy5lbGVtZW50cy5maWxsKDApO1xuICAgICAgICBlbHNlIHRoaXMuZWxlbWVudHMuc2V0KGFyZ3MpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHE6IFF1YXRlcm5pb24pOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgdGhpcy54ID0gcS54O1xuICAgICAgICB0aGlzLnkgPSBxLnk7XG4gICAgICAgIHRoaXMueiA9IHEuejtcbiAgICAgICAgdGhpcy53ID0gcS53O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9uZSgpOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyk7XG4gICAgfVxuXG4gICAgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKTogUXVhdGVybmlvbiB7XG4gICAgICAgIHJldHVybiBRdWF0ZXJuaW9uLk5vcm1hbGl6ZSh0aGlzLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcmVtdWwocTogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5NdWwocSwgdGhpcywgdGhpcyk7XG4gICAgfVxuXG4gICAgbXVsKHE6IFF1YXRlcm5pb24pOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgcmV0dXJuIFF1YXRlcm5pb24uTXVsKHRoaXMsIHEsIHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21fbWF0NChtOiBNYXQ0KTogUXVhdGVybmlvbiB7XG4gICAgICAgIHJldHVybiBRdWF0ZXJuaW9uLkZyb21NYXQ0KG0sIHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21fdW5pdF92ZWN0b3JzKHNyYzogRmxvYXQzLCBkc3Q6IEZsb2F0Myk6IFF1YXRlcm5pb24ge1xuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5Gcm9tVW5pdFZlY3RvcnMoc3JjLCBkc3QsIHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21fZXVsZXIoc3JjOiBFdWxlciwgb3JkZXIgPSBFdWxlck9yZGVyLlhZWik6IFF1YXRlcm5pb24ge1xuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5Gcm9tRXVsZXIoc3JjLCBvcmRlciwgdGhpcyk7XG4gICAgfVxuXG4gICAgZnJvbV9heGlzX2FuZ2xlKGF4aXM6IEZsb2F0MywgYW5nbGU6IG51bWJlcik6IFF1YXRlcm5pb24ge1xuICAgICAgICAvLyBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9nZW9tZXRyeS9yb3RhdGlvbnMvY29udmVyc2lvbnMvYW5nbGVUb1F1YXRlcm5pb24vaW5kZXguaHRtXG4gICAgICAgIC8vIGFzc3VtZXMgYXhpcyBpcyBub3JtYWxpemVkXG4gICAgICAgIGNvbnN0IGhhbGZBbmdsZSA9IGFuZ2xlIC8gMjtcbiAgICAgICAgY29uc3QgcyA9IE1hdGguc2luKGhhbGZBbmdsZSk7XG5cbiAgICAgICAgdGhpcy54ID0gYXhpcy54ICogcztcbiAgICAgICAgdGhpcy55ID0gYXhpcy55ICogcztcbiAgICAgICAgdGhpcy56ID0gYXhpcy56ICogcztcbiAgICAgICAgdGhpcy53ID0gTWF0aC5jb3MoaGFsZkFuZ2xlKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYFske3RoaXMueH0sICR7dGhpcy55fSwgJHt0aGlzLnp9LCAke3RoaXMud31dYDtcbiAgICB9XG5cbiAgICBzbGVycChxOiBRdWF0ZXJuaW9uLCB0OiBudW1iZXIpOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgUXVhdGVybmlvbi5TbGVycCh0aGlzLCBxLCB0LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uanVnYXRlKCk6IFF1YXRlcm5pb24ge1xuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5Db25qdWdhdGUodGhpcywgdGhpcyk7XG4gICAgfVxuXG4gICAgaW52ZXJzZSgpOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgcmV0dXJuIFF1YXRlcm5pb24uSW52ZXJzZSh0aGlzLCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgQ29uanVnYXRlKHE6IFF1YXRlcm5pb24sIGRzdDogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICBkc3QueCA9IC1xLng7XG4gICAgICAgIGRzdC55ID0gLXEueTtcbiAgICAgICAgZHN0LnogPSAtcS56O1xuICAgICAgICBkc3QudyA9IHEudztcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRXF1YWxzKGE6IFF1YXRlcm5pb24sIGI6IFF1YXRlcm5pb24pOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGEueCA9PT0gYi54ICYmIGEueSA9PT0gYi55ICYmIGEueiA9PT0gYi56ICYmIGEudyA9PT0gYi53O1xuICAgIH1cblxuICAgIHN0YXRpYyBNdWwoYTogUXVhdGVybmlvbiwgYjogUXVhdGVybmlvbiwgZHN0PzogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICBpZiAoZHN0ID09PSB1bmRlZmluZWQpIGRzdCA9IG5ldyBRdWF0ZXJuaW9uKCk7XG4gICAgICAgIC8vIGZyb20gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvYWxnZWJyYS9yZWFsTm9ybWVkQWxnZWJyYS9xdWF0ZXJuaW9ucy9jb2RlL2luZGV4Lmh0bVxuICAgICAgICBjb25zdCBxYXggPSBhLngsXG4gICAgICAgICAgICBxYXkgPSBhLnksXG4gICAgICAgICAgICBxYXogPSBhLnosXG4gICAgICAgICAgICBxYXcgPSBhLnc7XG4gICAgICAgIGNvbnN0IHFieCA9IGIueCxcbiAgICAgICAgICAgIHFieSA9IGIueSxcbiAgICAgICAgICAgIHFieiA9IGIueixcbiAgICAgICAgICAgIHFidyA9IGIudztcblxuICAgICAgICBkc3QueCA9IHFheCAqIHFidyArIHFhdyAqIHFieCArIHFheSAqIHFieiAtIHFheiAqIHFieTtcbiAgICAgICAgZHN0LnkgPSBxYXkgKiBxYncgKyBxYXcgKiBxYnkgKyBxYXogKiBxYnggLSBxYXggKiBxYno7XG4gICAgICAgIGRzdC56ID0gcWF6ICogcWJ3ICsgcWF3ICogcWJ6ICsgcWF4ICogcWJ5IC0gcWF5ICogcWJ4O1xuICAgICAgICBkc3QudyA9IHFhdyAqIHFidyAtIHFheCAqIHFieCAtIHFheSAqIHFieSAtIHFheiAqIHFiejtcblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBGcm9tVW5pdFZlY3RvcnMoYTogRmxvYXQzLCBiOiBGbG9hdDMsIGRzdDogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICAvLyBhc3N1bWVzIGRpcmVjdGlvbiB2ZWN0b3JzIHZGcm9tIGFuZCB2VG8gYXJlIG5vcm1hbGl6ZWRcbiAgICAgICAgbGV0IHIgPSBhLmRvdChiKSArIDE7XG5cbiAgICAgICAgaWYgKHIgPCBOdW1iZXIuRVBTSUxPTikge1xuICAgICAgICAgICAgLy8gdkZyb20gYW5kIHZUbyBwb2ludCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25zXG4gICAgICAgICAgICByID0gMDtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhhLngpID4gTWF0aC5hYnMoYS56KSkge1xuICAgICAgICAgICAgICAgIGRzdC54ID0gLWEueTtcbiAgICAgICAgICAgICAgICBkc3QueSA9IGEueDtcbiAgICAgICAgICAgICAgICBkc3QueiA9IDA7XG4gICAgICAgICAgICAgICAgZHN0LncgPSByO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkc3QueCA9IDA7XG4gICAgICAgICAgICAgICAgZHN0LnkgPSAtYS56O1xuICAgICAgICAgICAgICAgIGRzdC56ID0gYS55O1xuICAgICAgICAgICAgICAgIGRzdC53ID0gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNyb3NzVmVjdG9ycyggdkZyb20sIHZUbyApOyAvLyBpbmxpbmVkIHRvIGF2b2lkIGN5Y2xpYyBkZXBlbmRlbmN5IG9uIFZlY3RvcjNcbiAgICAgICAgICAgIGRzdC54ID0gYS55ICogYi56IC0gYS56ICogYi55O1xuICAgICAgICAgICAgZHN0LnkgPSBhLnogKiBiLnggLSBhLnggKiBiLno7XG4gICAgICAgICAgICBkc3QueiA9IGEueCAqIGIueSAtIGEueSAqIGIueDtcbiAgICAgICAgICAgIGRzdC53ID0gcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHN0Lm5vcm1hbGl6ZSgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBGcm9tTWF0NChtOiBNYXQ0LCBkc3Q6IFF1YXRlcm5pb24pOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgLy8gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvZ2VvbWV0cnkvcm90YXRpb25zL2NvbnZlcnNpb25zL21hdHJpeFRvUXVhdGVybmlvbi9pbmRleC5odG1cbiAgICAgICAgLy8gYXNzdW1lcyB0aGUgdXBwZXIgM3gzIG9mIG0gaXMgYSBwdXJlIHJvdGF0aW9uIG1hdHJpeCAoaS5lLCB1bnNjYWxlZClcbiAgICAgICAgY29uc3QgdGUgPSBtLmVsZW1lbnRzO1xuICAgICAgICBjb25zdCBtMTEgPSB0ZVswXTtcbiAgICAgICAgY29uc3QgbTEyID0gdGVbNF07XG4gICAgICAgIGNvbnN0IG0xMyA9IHRlWzhdO1xuICAgICAgICBjb25zdCBtMjEgPSB0ZVsxXTtcbiAgICAgICAgY29uc3QgbTIyID0gdGVbNV07XG4gICAgICAgIGNvbnN0IG0yMyA9IHRlWzldO1xuICAgICAgICBjb25zdCBtMzEgPSB0ZVsyXTtcbiAgICAgICAgY29uc3QgbTMyID0gdGVbNl07XG4gICAgICAgIGNvbnN0IG0zMyA9IHRlWzEwXTtcbiAgICAgICAgY29uc3QgdHJhY2UgPSBtMTEgKyBtMjIgKyBtMzM7XG4gICAgICAgIGxldCBzO1xuXG4gICAgICAgIGlmICh0cmFjZSA+IDApIHtcbiAgICAgICAgICAgIHMgPSAwLjUgLyBNYXRoLnNxcnQodHJhY2UgKyAxLjApO1xuICAgICAgICAgICAgZHN0LncgPSAwLjI1IC8gcztcbiAgICAgICAgICAgIGRzdC54ID0gKG0zMiAtIG0yMykgKiBzO1xuICAgICAgICAgICAgZHN0LnkgPSAobTEzIC0gbTMxKSAqIHM7XG4gICAgICAgICAgICBkc3QueiA9IChtMjEgLSBtMTIpICogcztcbiAgICAgICAgfSBlbHNlIGlmIChtMTEgPiBtMjIgJiYgbTExID4gbTMzKSB7XG4gICAgICAgICAgICBzID0gMi4wICogTWF0aC5zcXJ0KDEuMCArIG0xMSAtIG0yMiAtIG0zMyk7XG4gICAgICAgICAgICBkc3QudyA9IChtMzIgLSBtMjMpIC8gcztcbiAgICAgICAgICAgIGRzdC54ID0gMC4yNSAqIHM7XG4gICAgICAgICAgICBkc3QueSA9IChtMTIgKyBtMjEpIC8gcztcbiAgICAgICAgICAgIGRzdC56ID0gKG0xMyArIG0zMSkgLyBzO1xuICAgICAgICB9IGVsc2UgaWYgKG0yMiA+IG0zMykge1xuICAgICAgICAgICAgcyA9IDIuMCAqIE1hdGguc3FydCgxLjAgKyBtMjIgLSBtMTEgLSBtMzMpO1xuICAgICAgICAgICAgZHN0LncgPSAobTEzIC0gbTMxKSAvIHM7XG4gICAgICAgICAgICBkc3QueCA9IChtMTIgKyBtMjEpIC8gcztcbiAgICAgICAgICAgIGRzdC55ID0gMC4yNSAqIHM7XG4gICAgICAgICAgICBkc3QueiA9IChtMjMgKyBtMzIpIC8gcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMgPSAyLjAgKiBNYXRoLnNxcnQoMS4wICsgbTMzIC0gbTExIC0gbTIyKTtcbiAgICAgICAgICAgIGRzdC53ID0gKG0yMSAtIG0xMikgLyBzO1xuICAgICAgICAgICAgZHN0LnggPSAobTEzICsgbTMxKSAvIHM7XG4gICAgICAgICAgICBkc3QueSA9IChtMjMgKyBtMzIpIC8gcztcbiAgICAgICAgICAgIGRzdC56ID0gMC4yNSAqIHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRnJvbU1hdDMobTogTWF0MywgZHN0OiBRdWF0ZXJuaW9uKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGNvbnN0IHRlID0gbS5lbGVtZW50cztcbiAgICAgICAgY29uc3QgbTExID0gdGVbMF07XG4gICAgICAgIGNvbnN0IG0xMiA9IHRlWzNdO1xuICAgICAgICBjb25zdCBtMTMgPSB0ZVs2XTtcbiAgICAgICAgY29uc3QgbTIxID0gdGVbMV07XG4gICAgICAgIGNvbnN0IG0yMiA9IHRlWzRdO1xuICAgICAgICBjb25zdCBtMjMgPSB0ZVs3XTtcbiAgICAgICAgY29uc3QgbTMxID0gdGVbMl07XG4gICAgICAgIGNvbnN0IG0zMiA9IHRlWzVdO1xuICAgICAgICBjb25zdCBtMzMgPSB0ZVs5XTtcblxuICAgICAgICBjb25zdCB0cmFjZSA9IG0xMSArIG0yMiArIG0zMztcbiAgICAgICAgbGV0IHM7XG5cbiAgICAgICAgaWYgKHRyYWNlID4gMCkge1xuICAgICAgICAgICAgcyA9IDAuNSAvIE1hdGguc3FydCh0cmFjZSArIDEuMCk7XG4gICAgICAgICAgICBkc3QudyA9IDAuMjUgLyBzO1xuICAgICAgICAgICAgZHN0LnggPSAobTMyIC0gbTIzKSAqIHM7XG4gICAgICAgICAgICBkc3QueSA9IChtMTMgLSBtMzEpICogcztcbiAgICAgICAgICAgIGRzdC56ID0gKG0yMSAtIG0xMikgKiBzO1xuICAgICAgICB9IGVsc2UgaWYgKG0xMSA+IG0yMiAmJiBtMTEgPiBtMzMpIHtcbiAgICAgICAgICAgIHMgPSAyLjAgKiBNYXRoLnNxcnQoMS4wICsgbTExIC0gbTIyIC0gbTMzKTtcbiAgICAgICAgICAgIGRzdC53ID0gKG0zMiAtIG0yMykgLyBzO1xuICAgICAgICAgICAgZHN0LnggPSAwLjI1ICogcztcbiAgICAgICAgICAgIGRzdC55ID0gKG0xMiArIG0yMSkgLyBzO1xuICAgICAgICAgICAgZHN0LnogPSAobTEzICsgbTMxKSAvIHM7XG4gICAgICAgIH0gZWxzZSBpZiAobTIyID4gbTMzKSB7XG4gICAgICAgICAgICBzID0gMi4wICogTWF0aC5zcXJ0KDEuMCArIG0yMiAtIG0xMSAtIG0zMyk7XG4gICAgICAgICAgICBkc3QudyA9IChtMTMgLSBtMzEpIC8gcztcbiAgICAgICAgICAgIGRzdC54ID0gKG0xMiArIG0yMSkgLyBzO1xuICAgICAgICAgICAgZHN0LnkgPSAwLjI1ICogcztcbiAgICAgICAgICAgIGRzdC56ID0gKG0yMyArIG0zMikgLyBzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcyA9IDIuMCAqIE1hdGguc3FydCgxLjAgKyBtMzMgLSBtMTEgLSBtMjIpO1xuICAgICAgICAgICAgZHN0LncgPSAobTIxIC0gbTEyKSAvIHM7XG4gICAgICAgICAgICBkc3QueCA9IChtMTMgKyBtMzEpIC8gcztcbiAgICAgICAgICAgIGRzdC55ID0gKG0yMyArIG0zMikgLyBzO1xuICAgICAgICAgICAgZHN0LnogPSAwLjI1ICogcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIFNsZXJwKGE6IFF1YXRlcm5pb24sIGI6IFF1YXRlcm5pb24sIHQ6IG51bWJlciwgZHN0OiBRdWF0ZXJuaW9uKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgICAgICBkc3QuY29weShhKTtcbiAgICAgICAgICAgIHJldHVybiBkc3Q7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodCA9PT0gMSkge1xuICAgICAgICAgICAgZHN0LmNvcHkoYik7XG4gICAgICAgICAgICByZXR1cm4gZHN0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeCA9IGEueDtcbiAgICAgICAgY29uc3QgeSA9IGEueTtcbiAgICAgICAgY29uc3QgeiA9IGEuejtcbiAgICAgICAgY29uc3QgdyA9IGEudztcblxuICAgICAgICBsZXQgY29zSGFsZlRoZXRhID0gdyAqIGIudyArIHggKiBiLnggKyB5ICogYi55ICsgeiAqIGIuejtcblxuICAgICAgICBpZiAoY29zSGFsZlRoZXRhIDwgMCkge1xuICAgICAgICAgICAgZHN0LncgPSAtYi53O1xuICAgICAgICAgICAgZHN0LnggPSAtYi54O1xuICAgICAgICAgICAgZHN0LnkgPSAtYi55O1xuICAgICAgICAgICAgZHN0LnogPSAtYi56O1xuXG4gICAgICAgICAgICBjb3NIYWxmVGhldGEgPSAtY29zSGFsZlRoZXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZHN0LmNvcHkoYik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29zSGFsZlRoZXRhID49IDEuMCkge1xuICAgICAgICAgICAgZHN0LncgPSB3O1xuICAgICAgICAgICAgZHN0LnggPSB4O1xuICAgICAgICAgICAgZHN0LnkgPSB5O1xuICAgICAgICAgICAgZHN0LnogPSB6O1xuICAgICAgICAgICAgcmV0dXJuIGRzdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNxclNpbkhhbGZUaGV0YSA9IDEuMCAtIGNvc0hhbGZUaGV0YSAqIGNvc0hhbGZUaGV0YTtcblxuICAgICAgICBpZiAoc3FyU2luSGFsZlRoZXRhIDw9IE51bWJlci5FUFNJTE9OKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gMSAtIHQ7XG4gICAgICAgICAgICBkc3QudyA9IHMgKiB3ICsgdCAqIGEudztcbiAgICAgICAgICAgIGRzdC54ID0gcyAqIHggKyB0ICogYS54O1xuICAgICAgICAgICAgZHN0LnkgPSBzICogeSArIHQgKiBhLnk7XG4gICAgICAgICAgICBkc3QueiA9IHMgKiB6ICsgdCAqIGEuejtcbiAgICAgICAgICAgIGRzdC5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIHJldHVybiBkc3Q7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaW5IYWxmVGhldGEgPSBNYXRoLnNxcnQoc3FyU2luSGFsZlRoZXRhKTtcbiAgICAgICAgY29uc3QgaGFsZlRoZXRhID0gTWF0aC5hdGFuMihzaW5IYWxmVGhldGEsIGNvc0hhbGZUaGV0YSk7XG4gICAgICAgIGNvbnN0IHJhdGlvQSA9IE1hdGguc2luKCgxIC0gdCkgKiBoYWxmVGhldGEpIC8gc2luSGFsZlRoZXRhO1xuICAgICAgICBjb25zdCByYXRpb0IgPSBNYXRoLnNpbih0ICogaGFsZlRoZXRhKSAvIHNpbkhhbGZUaGV0YTtcblxuICAgICAgICBkc3QudyA9IHcgKiByYXRpb0EgKyBiLncgKiByYXRpb0I7XG4gICAgICAgIGRzdC54ID0geCAqIHJhdGlvQSArIGIueCAqIHJhdGlvQjtcbiAgICAgICAgZHN0LnkgPSB5ICogcmF0aW9BICsgYi55ICogcmF0aW9CO1xuICAgICAgICBkc3QueiA9IHogKiByYXRpb0EgKyBiLnogKiByYXRpb0I7XG5cbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTm9ybWFsaXplKHNyYzogUXVhdGVybmlvbiwgZHN0PzogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICBpZiAoZHN0ID09PSB1bmRlZmluZWQpIGRzdCA9IG5ldyBRdWF0ZXJuaW9uKCk7XG4gICAgICAgIGxldCBsID0gc3JjLmxlbmd0aCgpO1xuICAgICAgICBpZiAobCA9PT0gMCkge1xuICAgICAgICAgICAgZHN0LnggPSAwO1xuICAgICAgICAgICAgZHN0LnkgPSAwO1xuICAgICAgICAgICAgZHN0LnogPSAwO1xuICAgICAgICAgICAgZHN0LncgPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbCA9IDEgLyBsO1xuICAgICAgICAgICAgZHN0LnggKj0gbDtcbiAgICAgICAgICAgIGRzdC55ICo9IGw7XG4gICAgICAgICAgICBkc3QueiAqPSBsO1xuICAgICAgICAgICAgZHN0LncgKj0gbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBNdWx0aXBseShhOiBRdWF0ZXJuaW9uLCBiOiBRdWF0ZXJuaW9uLCBkc3Q/OiBRdWF0ZXJuaW9uKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGlmIChkc3QgPT09IHVuZGVmaW5lZCkgZHN0ID0gbmV3IFF1YXRlcm5pb24oKTtcbiAgICAgICAgY29uc3QgcWF4ID0gYS54LFxuICAgICAgICAgICAgcWF5ID0gYS55LFxuICAgICAgICAgICAgcWF6ID0gYS56LFxuICAgICAgICAgICAgcWF3ID0gYS53O1xuICAgICAgICBjb25zdCBxYnggPSBiLngsXG4gICAgICAgICAgICBxYnkgPSBiLnksXG4gICAgICAgICAgICBxYnogPSBiLnosXG4gICAgICAgICAgICBxYncgPSBiLnc7XG4gICAgICAgIGRzdC54ID0gcWF4ICogcWJ3ICsgcWF3ICogcWJ4ICsgcWF5ICogcWJ6IC0gcWF6ICogcWJ5O1xuICAgICAgICBkc3QueSA9IHFheSAqIHFidyArIHFhdyAqIHFieSArIHFheiAqIHFieCAtIHFheCAqIHFiejtcbiAgICAgICAgZHN0LnogPSBxYXogKiBxYncgKyBxYXcgKiBxYnogKyBxYXggKiBxYnkgLSBxYXkgKiBxYng7XG4gICAgICAgIGRzdC53ID0gcWF3ICogcWJ3IC0gcWF4ICogcWJ4IC0gcWF5ICogcWJ5IC0gcWF6ICogcWJ6O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBGcm9tRXVsZXIoZTogRXVsZXIsIG9yZGVyOiBFdWxlck9yZGVyID0gRXVsZXJPcmRlci5YWVosIGRzdDogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICBjb25zdCB4ID0gZS54O1xuICAgICAgICBjb25zdCB5ID0gZS55O1xuICAgICAgICBjb25zdCB6ID0gZS56O1xuXG4gICAgICAgIC8vIGh0dHA6Ly93d3cubWF0aHdvcmtzLmNvbS9tYXRsYWJjZW50cmFsL2ZpbGVleGNoYW5nZS9cbiAgICAgICAgLy8gXHQyMDY5Ni1mdW5jdGlvbi10by1jb252ZXJ0LWJldHdlZW4tZGNtLWV1bGVyLWFuZ2xlcy1xdWF0ZXJuaW9ucy1hbmQtZXVsZXItdmVjdG9ycy9cbiAgICAgICAgLy9cdGNvbnRlbnQvU3BpbkNhbGMubVxuXG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zO1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbjtcblxuICAgICAgICBjb25zdCBjMSA9IGNvcyh4IC8gMik7XG4gICAgICAgIGNvbnN0IGMyID0gY29zKHkgLyAyKTtcbiAgICAgICAgY29uc3QgYzMgPSBjb3MoeiAvIDIpO1xuXG4gICAgICAgIGNvbnN0IHMxID0gc2luKHggLyAyKTtcbiAgICAgICAgY29uc3QgczIgPSBzaW4oeSAvIDIpO1xuICAgICAgICBjb25zdCBzMyA9IHNpbih6IC8gMik7XG5cbiAgICAgICAgc3dpdGNoIChvcmRlcikge1xuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLlhZWjpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyArIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLllYWjpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyArIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyAtIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyArIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLlpYWTpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLlpZWDpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyAtIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyArIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLllaWDpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyArIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyAtIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLlhaWTpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyArIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3Vua25vd24gb3JkZXI6ICcgKyBvcmRlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBJbnZlcnNlKHNyYzogUXVhdGVybmlvbiwgZHN0OiBRdWF0ZXJuaW9uKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGRzdC54ID0gLXNyYy54O1xuICAgICAgICBkc3QueSA9IC1zcmMueTtcbiAgICAgICAgZHN0LnogPSAtc3JjLno7XG4gICAgICAgIGRzdC53ID0gc3JjLnc7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgUVVBVEVSTklPTl9JREVOVElUWSA9IG5ldyBRdWF0ZXJuaW9uKDAsIDAsIDAsIDEpOyIsICJpbXBvcnQgeyBDb25zdHJ1Y3RvciwgVHlwZWRBcnJheSB9IGZyb20gJy4uL3N0ZC90eXBlJztcblxuaW50ZXJmYWNlIFJhbmdlIHtcbiAgICBzdGFydDogbnVtYmVyO1xuICAgIGNvdW50OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9pbnRlcjxUPiB7XG4gICAgcmVhZG9ubHkgcmFuZ2U6IFJhbmdlO1xuICAgIHJlYWRvbmx5IHN0cmlkZTogbnVtYmVyO1xuICAgIGJ1ZmZlcjogVDtcbn1cblxuZXhwb3J0IGNsYXNzIEhlYXAge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgYnVmZmVyOiBBcnJheUJ1ZmZlcjtcbiAgICB0YWlsOiBudW1iZXI7XG5cbiAgICByZWxlYXNlZDogUmFuZ2VbXSA9IFtdO1xuXG4gICAgLy8gbWVnYSBieXRlc1xuICAgIGhlYXBfc2l6ZTogbnVtYmVyID0gNDA5NjtcblxuICAgIHByaXZhdGUgbGlmZV9jeWNsZTogbnVtYmVyID0gMTAyNDtcbiAgICBwcml2YXRlIGxpZmVfaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodGhpcy5oZWFwX3NpemUpO1xuICAgICAgICB0aGlzLnRhaWwgPSAwO1xuICAgIH1cblxuICAgIGFsbG9jPFQgZXh0ZW5kcyBUeXBlZEFycmF5PihzaXplOiBudW1iZXIsIGNvbnN0cnVjdG9yOiBDb25zdHJ1Y3RvcjxUPik6IFBvaW50ZXI8VD4ge1xuICAgICAgICBjb25zdCBzdHJpZGUgPSAoY29uc3RydWN0b3IgYXMgYW55KS5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLnRhaWw7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gc2l6ZSAqIHN0cmlkZTtcblxuICAgICAgICAvLyAzMiBiaXQgYWxpZ25tZW50XG4gICAgICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbCArIGNvdW50ICsgKDQgLSAoY291bnQgJSA0KSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJhbmdlOiB7IHN0YXJ0LCBjb3VudCB9LFxuICAgICAgICAgICAgc3RyaWRlLFxuICAgICAgICAgICAgYnVmZmVyOiBuZXcgY29uc3RydWN0b3IodGhpcy5idWZmZXIsIHN0YXJ0LCBzaXplKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmcmVlPFQ+KHBvaW50ZXI6IFBvaW50ZXI8VD4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlZC5wdXNoKHBvaW50ZXIucmFuZ2UpO1xuICAgIH1cblxuICAgIG1hbmFnZSA9ICgpID0+IHtcbiAgICAgICAgLy9UT0RPOiBtb3ZlIHJlbGVhc2UgbWVtb3J5ICYgY29weSBpbiB1c2VkIG1lbW9yeSB0byB0aGUgaGVhZCBvZiBoZWFwXG4gICAgICAgIHRoaXMubGlmZV9pbmRleCA9IHRoaXMubGlmZV9pbmRleCsrICUgdGhpcy5saWZlX2N5Y2xlO1xuICAgIH07XG59XG5cbmNvbnN0IE1lbW9yeUhlYXAgPSBuZXcgSGVhcCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVtY3B5PFQgZXh0ZW5kcyBUeXBlZEFycmF5Pihkc3Q6IFBvaW50ZXI8VD4sIHNyYzogUG9pbnRlcjxUPik6IFBvaW50ZXI8VD4ge1xuICAgIGRzdC5idWZmZXIuc2V0KHNyYy5idWZmZXIpO1xuICAgIHJldHVybiBkc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWxsb2M8VCBleHRlbmRzIFR5cGVkQXJyYXk+KHNpemU6IG51bWJlciwgY29uc3RydWN0b3I6IENvbnN0cnVjdG9yPFQ+KTogUG9pbnRlcjxUPiB7XG4gICAgcmV0dXJuIE1lbW9yeUhlYXAuYWxsb2Moc2l6ZSwgY29uc3RydWN0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZnJlZTxUIGV4dGVuZHMgVHlwZWRBcnJheT4ocG9pbnRlcjogUG9pbnRlcjxUPik6IHZvaWQge1xuICAgIE1lbW9yeUhlYXAuZnJlZShwb2ludGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhlYXB1c2FnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHttZW1fZm9ybWF0KE1lbW9yeUhlYXAudGFpbCl9LyR7bWVtX2Zvcm1hdChNZW1vcnlIZWFwLmhlYXBfc2l6ZSl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lbXVzYWdlKCk6IHN0cmluZyB7XG4gICAgbGV0IHRvdGFsID0gTWVtb3J5SGVhcC50YWlsO1xuICAgIGlmIChwZXJmb3JtYW5jZSAmJiAocGVyZm9ybWFuY2UgYXMgYW55KS5tZW1vcnkpIHtcbiAgICAgICAgdG90YWwgPSAocGVyZm9ybWFuY2UgYXMgYW55KS5tZW1vcnkudG90YWxKU0hlYXBTaXplO1xuICAgIH1cbiAgICByZXR1cm4gbWVtX2Zvcm1hdCh0b3RhbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZW1jeWNsZSgpOiB2b2lkIHtcbiAgICBNZW1vcnlIZWFwLm1hbmFnZSgpO1xufVxuXG5jb25zdCBNQVhfQiA9IDE7XG5jb25zdCBNQVhfS0IgPSBNQVhfQiAqIDEwMjQ7XG5jb25zdCBNQVhfTUIgPSBNQVhfS0IgKiAxMDI0O1xuY29uc3QgTUFYX0dCID0gTUFYX01CICogMTAyNDtcbmNvbnN0IE1BWF9UQiA9IE1BWF9HQiAqIDEwMjQ7XG5jb25zdCBNQVhfUEIgPSBNQVhfVEIgKiAxMDI0O1xuZnVuY3Rpb24gbWVtX2Zvcm1hdChzOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGlmIChzIDw9IE1BWF9LQikge1xuICAgICAgICByZXR1cm4gYCR7c31CYDtcbiAgICB9IGVsc2UgaWYgKHMgPD0gTUFYX01CKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLmZsb29yKHMgLyBNQVhfS0IpfUtgO1xuICAgIH0gZWxzZSBpZiAocyA8PSBNQVhfR0IpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGguZmxvb3IocyAvIE1BWF9NQil9TWA7XG4gICAgfSBlbHNlIGlmIChzIDw9IE1BWF9UQikge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihzIC8gTUFYX0dCKX1HYDtcbiAgICB9IGVsc2UgaWYgKHMgPD0gTUFYX1BCKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLmZsb29yKHMgLyBNQVhfVEIpfVRgO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGB3YWtlIHVwLCB5b3UgZG9uJ3QgaGF2ZSBtZW1vcnkgdGhhdCBtdWNoLmA7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGZvb3RwcmludF9hbGxvYyB9IGZyb20gJy4uL21lbW9yeSc7XG5pbXBvcnQgeyBjbGFtcCwgbGVycCB9IGZyb20gJy4vbWF0aCc7XG5pbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuL3NpbWQnO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJpY2FsIHtcbiAgICByYWRpdXM6IG51bWJlcjtcbiAgICB0aGV0YTogbnVtYmVyO1xuICAgIHBoaTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IocmFkaXVzPzogbnVtYmVyLCB0aGV0YT86IG51bWJlciwgcGhpPzogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzIHx8IDE7XG4gICAgICAgIHRoaXMudGhldGEgPSB0aGV0YSB8fCAwO1xuICAgICAgICB0aGlzLnBoaSA9IHBoaSB8fCAwO1xuICAgICAgICBmb290cHJpbnRfYWxsb2MoMyk7XG4gICAgfVxuXG4gICAgZnJvbV9mbG9hdDModjogRmxvYXQzKTogU3BoZXJpY2FsIHtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSB2Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMucmFkaXVzID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnRoZXRhID0gMDtcbiAgICAgICAgICAgIHRoaXMucGhpID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGhldGEgPSBNYXRoLmFjb3MoY2xhbXAodi55IC8gdGhpcy5yYWRpdXMsIC0xLCAxKSk7XG4gICAgICAgICAgICB0aGlzLnBoaSA9IE1hdGguYXRhbjIodi54LCB2LnopO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldChyYWRpdXM6IG51bWJlciwgdGhldGE6IG51bWJlciwgcGhpOiBudW1iZXIpOiBTcGhlcmljYWwge1xuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICAgICAgdGhpcy50aGV0YSA9IHRoZXRhO1xuICAgICAgICB0aGlzLnBoaSA9IHBoaTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShzOiBTcGhlcmljYWwpOiBTcGhlcmljYWwge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQocy5yYWRpdXMsIHMudGhldGEsIHMucGhpKTtcbiAgICB9XG5cbiAgICBjbG9uZSgpOiBTcGhlcmljYWwge1xuICAgICAgICByZXR1cm4gbmV3IFNwaGVyaWNhbCh0aGlzLnJhZGl1cywgdGhpcy50aGV0YSwgdGhpcy5waGkpO1xuICAgIH1cblxuICAgIGxlcnAoYTogU3BoZXJpY2FsLCBpOiBudW1iZXIpOiBTcGhlcmljYWwge1xuICAgICAgICByZXR1cm4gU3BoZXJpY2FsLkxlcnAodGhpcywgYSwgaSwgdGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIExlcnAoc3RhcnQ6IFNwaGVyaWNhbCwgZW5kOiBTcGhlcmljYWwsIGk6IG51bWJlciwgZHN0OiBTcGhlcmljYWwpOiBTcGhlcmljYWwge1xuICAgICAgICBpZiAoZHN0ID09PSB1bmRlZmluZWQpIGRzdCA9IG5ldyBTcGhlcmljYWwoKTtcbiAgICAgICAgZHN0LnJhZGl1cyA9IGxlcnAoc3RhcnQucmFkaXVzLCBlbmQucmFkaXVzLCBpKTtcbiAgICAgICAgZHN0LnRoZXRhID0gbGVycChzdGFydC50aGV0YSwgZW5kLnRoZXRhLCBpKTtcbiAgICAgICAgZHN0LnBoaSA9IGxlcnAoc3RhcnQucGhpLCBlbmQucGhpLCBpKTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgQm94MyB9IGZyb20gJy4uL21hdGgvYm94JztcbmltcG9ydCB7IERlZ3JlZVRvUmFkaWFuIH0gZnJvbSAnLi4vbWF0aC9tYXRoJztcbmltcG9ydCB7IEZsb2F0MyB9IGZyb20gJy4uL21hdGgvc2ltZCc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9zaW1kX21hdCc7XG5pbXBvcnQgeyBRdWF0ZXJuaW9uIH0gZnJvbSAnLi4vbWF0aC9zaW1kX3F1YXRlcm5pb24nO1xuXG5jb25zdCByb3RhdGVfbWF0cml4ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGVudW0gQ2FtZXJhTW9kZSB7XG4gICAgUGVyc3BlY3RpdmUsXG4gICAgT3J0aG9ncmFwaGljLFxufVxuXG5leHBvcnQgY2xhc3MgQ2FtZXJhIHtcbiAgICBwcml2YXRlIF9tb2RlOiBDYW1lcmFNb2RlID0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZTtcbiAgICBzZXQgbW9kZSh2YWx1ZTogQ2FtZXJhTW9kZSkge1xuICAgICAgICB0aGlzLl9tb2RlID0gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZSh0aGlzLnZlcnRpY2FsX2ZvdiwgdGhpcy5hc3BlY3QsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vcnRob2dyYXBoaWNzKHRoaXMudmVydGljYWxfc2l6ZSwgdGhpcy5ob3Jpem9udGFsX3NpemUsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBtb2RlKCk6IENhbWVyYU1vZGUgeyByZXR1cm4gdGhpcy5fbW9kZTsgfVxuXG5cbiAgICBsb2NhdGlvbjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuICAgIHJvdGF0aW9uOiBRdWF0ZXJuaW9uID0gbmV3IFF1YXRlcm5pb24oKTtcbiAgICBzY2FsZTogRmxvYXQzID0gbmV3IEZsb2F0MygxLCAxLCAxKTtcblxuICAgIHdvcmxkX21hdHJpeDogTWF0NCA9IG5ldyBNYXQ0KCk7XG4gICAgbG9jYWxfbWF0cml4OiBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuICAgIHZpZXdfbWF0cml4OiBNYXQ0ID0gbmV3IE1hdDQoKTtcbiAgICBwcm9qZWN0aW9uX21hdHJpeDogTWF0NCA9IG5ldyBNYXQ0KCk7XG5cbiAgICB2aWV3X3Byb2plY3Rpb25fbWF0cml4OiBNYXQ0ID0gbmV3IE1hdDQoKTtcbiAgICBpbnZlcnNlX3Byb2plY3Rpb25fbWF0cml4OiBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuICAgIHVwOiBGbG9hdDMgPSBuZXcgRmxvYXQzKDAsIDEsIDApO1xuXG4gICAgdmVydGljYWxfZm92OiBudW1iZXIgPSA0NTtcbiAgICBhc3BlY3Q6IG51bWJlciA9IDEuMDtcblxuICAgIHZlcnRpY2FsX3NpemU6IG51bWJlciA9IDEwMC4wO1xuICAgIGhvcml6b250YWxfc2l6ZTogbnVtYmVyID0gMTAwLjA7XG5cbiAgICBuZWFyOiBudW1iZXIgPSAxO1xuICAgIGZhcjogbnVtYmVyID0gMTAwMDA7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZSh0aGlzLnZlcnRpY2FsX2ZvdiwgdGhpcy5hc3BlY3QsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgIH1cblxuICAgIHVwZGF0ZV93b3JsZF9tYXRyaXgoKTogdm9pZCB7XG4gICAgICAgIHRoaXMud29ybGRfbWF0cml4LmNvbXBvc2UodGhpcy5sb2NhdGlvbiwgdGhpcy5yb3RhdGlvbiwgdGhpcy5zY2FsZSk7XG4gICAgfVxuXG4gICAgdXBkYXRlX3ZpZXdfbWF0cml4KCk6IHZvaWQge1xuICAgICAgICBNYXQ0LkludmVyc2UodGhpcy53b3JsZF9tYXRyaXgsIHRoaXMudmlld19tYXRyaXgpO1xuICAgIH1cblxuICAgIHBlcnNwZWN0aXZlKGZvdjogbnVtYmVyLCBhc3BlY3Q6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlcikge1xuICAgICAgICB0aGlzLnZlcnRpY2FsX2ZvdiA9IGZvdjtcbiAgICAgICAgdGhpcy5hc3BlY3QgPSBhc3BlY3Q7XG4gICAgICAgIHRoaXMubmVhciA9IG5lYXI7XG4gICAgICAgIHRoaXMuZmFyID0gZmFyO1xuICAgICAgICB0aGlzLnByb2plY3Rpb25fbWF0cml4LnBlcnNwZWN0aXZlKGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIpO1xuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVfcHJvamVjdGlvbl9tYXRyaXgoKTtcbiAgICB9XG5cbiAgICBvcnRob2dyYXBoaWNzKHNpemVfdmVydGljYWw6IG51bWJlciwgc2l6ZV9ob3Jpem9udGFsOiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5uZWFyID0gbmVhcjtcbiAgICAgICAgdGhpcy5mYXIgPSBmYXI7XG4gICAgICAgIHRoaXMucHJvamVjdGlvbl9tYXRyaXgub3J0aG9ncmFwaGljcyhzaXplX3ZlcnRpY2FsLCBzaXplX2hvcml6b250YWwsIG5lYXIsIGZhcik7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZV9wcm9qZWN0aW9uX21hdHJpeCgpO1xuICAgIH1cblxuICAgIGxvb2tfYXQodGFyZ2V0OiBGbG9hdDMsIHVwPzogRmxvYXQzKTogdm9pZCB7XG4gICAgICAgIHVwID0gdXAgfHwgdGhpcy51cDtcbiAgICAgICAgcm90YXRlX21hdHJpeC5sb29rX2F0KHRoaXMubG9jYXRpb24sIHRhcmdldCwgdXApO1xuICAgICAgICB0aGlzLnJvdGF0aW9uLmZyb21fbWF0NChyb3RhdGVfbWF0cml4KTtcbiAgICAgICAgdGhpcy51cGRhdGVfd29ybGRfbWF0cml4KCk7XG4gICAgICAgIHRoaXMudXBkYXRlX3ZpZXdfbWF0cml4KCk7XG4gICAgfVxuXG4gICAgY29weShjYW1lcmE6IENhbWVyYSk6IENhbWVyYSB7XG4gICAgICAgIHRoaXMubG9jYXRpb24uY29weShjYW1lcmEubG9jYXRpb24pO1xuICAgICAgICB0aGlzLnJvdGF0aW9uLmNvcHkoY2FtZXJhLnJvdGF0aW9uKTtcbiAgICAgICAgdGhpcy5zY2FsZS5jb3B5KGNhbWVyYS5zY2FsZSk7XG4gICAgICAgIHRoaXMubG9jYWxfbWF0cml4LmNvcHkoY2FtZXJhLmxvY2FsX21hdHJpeCk7XG4gICAgICAgIHRoaXMud29ybGRfbWF0cml4LmNvcHkoY2FtZXJhLndvcmxkX21hdHJpeCk7XG5cbiAgICAgICAgdGhpcy5tb2RlID0gY2FtZXJhLm1vZGU7XG4gICAgICAgIHRoaXMudmVydGljYWxfZm92ID0gY2FtZXJhLnZlcnRpY2FsX2ZvdjtcbiAgICAgICAgdGhpcy5hc3BlY3QgPSBjYW1lcmEuYXNwZWN0O1xuXG4gICAgICAgIHRoaXMubmVhciA9IGNhbWVyYS5uZWFyO1xuICAgICAgICB0aGlzLmZhciA9IGNhbWVyYS5mYXI7XG5cbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uX21hdHJpeC5jb3B5KGNhbWVyYS5wcm9qZWN0aW9uX21hdHJpeCk7XG4gICAgICAgIHRoaXMudmlld19tYXRyaXguY29weShjYW1lcmEudmlld19tYXRyaXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwcm9qZWN0KHY6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGlmICh2LnggPT09IDAgJiYgdi55ID09PSAwICYmIHYueiA9PT0gMCkgcmV0dXJuIHYuY29weSh0aGlzLmxvY2F0aW9uKTtcbiAgICAgICAgdi5hcHBseV9tYXQ0KHRoaXMudmlld19tYXRyaXgpLmFwcGx5X21hdDQodGhpcy5wcm9qZWN0aW9uX21hdHJpeCk7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIHVucHJvamVjdCh2OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICB2LmFwcGx5X21hdDQodGhpcy5pbnZlcnNlX3Byb2plY3Rpb25fbWF0cml4KS5hcHBseV9tYXQ0KHRoaXMud29ybGRfbWF0cml4KTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgcmVzaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogQ2FtZXJhIHtcbiAgICAgICAgaWYgKHRoaXMubW9kZSA9PT0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5hc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcbiAgICAgICAgICAgIHRoaXMucGVyc3BlY3RpdmUodGhpcy52ZXJ0aWNhbF9mb3YsIHRoaXMuYXNwZWN0LCB0aGlzLm5lYXIsIHRoaXMuZmFyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmVydGljYWxfc2l6ZSA9IGhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbF9zaXplID0gd2lkdGg7XG4gICAgICAgICAgICB0aGlzLm9ydGhvZ3JhcGhpY3ModGhpcy52ZXJ0aWNhbF9zaXplLCB0aGlzLmhvcml6b250YWxfc2l6ZSwgdGhpcy5uZWFyLCB0aGlzLmZhcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdXBkYXRlX3Byb2plY3Rpb25fbWF0cml4KCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZSA9PT0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aW9uX21hdHJpeC5wZXJzcGVjdGl2ZSh0aGlzLnZlcnRpY2FsX2ZvdiwgdGhpcy5hc3BlY3QsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aW9uX21hdHJpeC5vcnRob2dyYXBoaWNzKHRoaXMudmVydGljYWxfc2l6ZSwgdGhpcy5ob3Jpem9udGFsX3NpemUsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbnZlcnNlX3Byb2plY3Rpb25fbWF0cml4LmNvcHkodGhpcy5wcm9qZWN0aW9uX21hdHJpeCkuaW52ZXJzZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmaXRfYm94KGJveDogQm94Mykge1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuZml0X2Rpc3RhbmNlKGJveCk7XG4gICAgICAgIHRoaXMubG9jYXRpb24uc3ViKGJveC5jZW50ZXIpLm5vcm1hbGl6ZSgpLm11bChkaXN0YW5jZSk7XG4gICAgICAgIHRoaXMubG9va19hdChib3guY2VudGVyKTtcbiAgICB9XG5cbiAgICBmaXRfZGlzdGFuY2UoYm94OiBCb3gzKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGJveC5zaXplO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBzaXplLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbih0aGlzLnZlcnRpY2FsX2ZvdiAqIERlZ3JlZVRvUmFkaWFuICogMC41KSAqIGxlbmd0aDtcbiAgICB9XG59XG5cbmNvbnN0IHZpZXdfYm94ID0gbmV3IEJveDMoKTtcbmV4cG9ydCBmdW5jdGlvbiBjYW1lcmFfZml4X2JveChjYW1lcmE6IENhbWVyYSwgYm94OiBCb3gzKTogdm9pZCB7XG4gICAgaWYgKGJveC5pbnZhbGlkKSByZXR1cm47XG5cbiAgICB2aWV3X2JveC5jb3B5KGJveCk7XG4gICAgdmlld19ib3guYXBwbHlfbWF0NChjYW1lcmEudmlld19tYXRyaXgpO1xuXG4gICAgY2FtZXJhLm5lYXIgPSBNYXRoLm1heCgwLjAxLCAtdmlld19ib3gubWF4LnopO1xuICAgIGNhbWVyYS5mYXIgPSBNYXRoLm1heCgtdmlld19ib3gubWluLnosIGNhbWVyYS5uZWFyICsgMTApO1xuXG4gICAgaWYgKGlzTmFOKGNhbWVyYS5uZWFyKSkgY2FtZXJhLm5lYXIgPSAxLjA7XG4gICAgaWYgKGlzTmFOKGNhbWVyYS5mYXIpKSBjYW1lcmEuZmFyID0gMTAwMDA7XG5cbiAgICBjYW1lcmEudXBkYXRlX3Byb2plY3Rpb25fbWF0cml4KCk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FtZXJhRGF0YSB7XG4gICAgbW9kZTogQ2FtZXJhTW9kZTtcblxuICAgIG5lYXI6IG51bWJlcjtcbiAgICBmYXI6IG51bWJlcjtcblxuICAgIHZlcnRpY2FsX2ZvdjogbnVtYmVyO1xuICAgIGFzcGVjdDogbnVtYmVyO1xuXG4gICAgdmVydGljYWxfc2l6ZTogbnVtYmVyO1xuICAgIGhvcml6b250YWxfc2l6ZTogbnVtYmVyO1xuXG4gICAgbG9jYXRpb246IG51bWJlcltdO1xuICAgIHJvdGF0aW9uOiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVyYV9zZXJpYWxpemUoY2FtZXJhOiBDYW1lcmEpOiBDYW1lcmFEYXRhIHtcbiAgICBjb25zdCBkYXRhID0ge30gYXMgQ2FtZXJhRGF0YTtcbiAgICBkYXRhLm1vZGUgPSBjYW1lcmEubW9kZTtcbiAgICBkYXRhLm5lYXIgPSBjYW1lcmEubmVhcjtcbiAgICBkYXRhLmZhciA9IGNhbWVyYS5mYXI7XG4gICAgZGF0YS5sb2NhdGlvbiA9IFtjYW1lcmEubG9jYXRpb24ueCwgY2FtZXJhLmxvY2F0aW9uLnksIGNhbWVyYS5sb2NhdGlvbi56XTtcbiAgICBkYXRhLnJvdGF0aW9uID0gW2NhbWVyYS5yb3RhdGlvbi54LCBjYW1lcmEucm90YXRpb24ueSwgY2FtZXJhLnJvdGF0aW9uLnosIGNhbWVyYS5yb3RhdGlvbi53XTtcbiAgICBkYXRhLnZlcnRpY2FsX2ZvdiA9IGNhbWVyYS52ZXJ0aWNhbF9mb3Y7XG4gICAgZGF0YS5hc3BlY3QgPSBjYW1lcmEuYXNwZWN0O1xuICAgIGRhdGEudmVydGljYWxfc2l6ZSA9IGNhbWVyYS52ZXJ0aWNhbF9zaXplO1xuICAgIGRhdGEuaG9yaXpvbnRhbF9zaXplID0gY2FtZXJhLmhvcml6b250YWxfc2l6ZTtcbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVyYV9kZXNlcmlhbGl6ZShkYXRhOiBDYW1lcmFEYXRhKTogQ2FtZXJhIHtcbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XG4gICAgY2FtZXJhLm1vZGUgPSBkYXRhLm1vZGU7XG4gICAgY2FtZXJhLm5lYXIgPSBkYXRhLm5lYXI7XG4gICAgY2FtZXJhLmZhciA9IGRhdGEuZmFyO1xuICAgIGNhbWVyYS52ZXJ0aWNhbF9mb3YgPSBkYXRhLnZlcnRpY2FsX2ZvdjtcbiAgICBjYW1lcmEuYXNwZWN0ID0gZGF0YS5hc3BlY3Q7XG4gICAgY2FtZXJhLnZlcnRpY2FsX3NpemUgPSBkYXRhLnZlcnRpY2FsX3NpemU7XG4gICAgY2FtZXJhLmhvcml6b250YWxfc2l6ZSA9IGRhdGEuaG9yaXpvbnRhbF9zaXplO1xuXG4gICAgaWYgKGRhdGEubW9kZSA9PT0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZSkge1xuICAgICAgICBjYW1lcmEucGVyc3BlY3RpdmUoZGF0YS52ZXJ0aWNhbF9mb3YsIGRhdGEuYXNwZWN0LCBkYXRhLm5lYXIsIGRhdGEuZmFyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjYW1lcmEub3J0aG9ncmFwaGljcyhkYXRhLnZlcnRpY2FsX3NpemUsIGRhdGEuaG9yaXpvbnRhbF9zaXplLCBkYXRhLm5lYXIsIGRhdGEuZmFyKTtcbiAgICB9XG5cbiAgICBjYW1lcmEubG9jYXRpb24uc2V0KGRhdGEubG9jYXRpb25bMF0sIGRhdGEubG9jYXRpb25bMV0sIGRhdGEubG9jYXRpb25bMl0pO1xuICAgIGNhbWVyYS5yb3RhdGlvbi5zZXQoZGF0YS5yb3RhdGlvblswXSwgZGF0YS5yb3RhdGlvblsxXSwgZGF0YS5yb3RhdGlvblsyXSwgZGF0YS5yb3RhdGlvblszXSk7XG4gICAgY2FtZXJhLnVwZGF0ZV93b3JsZF9tYXRyaXgoKTtcbiAgICBjYW1lcmEudXBkYXRlX3ZpZXdfbWF0cml4KCk7XG4gICAgY2FtZXJhLnVwZGF0ZV9wcm9qZWN0aW9uX21hdHJpeCgpO1xuXG4gICAgcmV0dXJuIGNhbWVyYTtcbn1cbiIsICJleHBvcnQgY2xhc3MgVHlwZWRFdmVudDxUID0gYW55PiB7XG4gICAgcGF5bG9hZDogVCB8IHVuZGVmaW5lZDtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5OiBzdHJpbmcpIHt9XG59XG5cbmV4cG9ydCB0eXBlIEV2ZW50ID0gc3RyaW5nO1xuXG5pbnRlcmZhY2UgTGlzdGVuZXIge1xuICAgIGV2ZW50OiBFdmVudDtcbiAgICBjYWxsYmFjazogRnVuY3Rpb247XG4gICAgc2NvcGU6IGFueTtcbiAgICBvbmNlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50Tm9kZSB7XG4gICAgcHJpdmF0ZSBsaXN0ZW5lcl9tYXA6IE1hcDxFdmVudCwgTGlzdGVuZXJbXT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiB3YXJuOlxuICAgICAqICBpZiBldmVudCAmIGNhbGxiYWNrIGhhcyByZWdpc3RlcmVkLCBuZXcgbGlzdGVuZXIgd2lsbCByZXBsYWNlIG9uZVxuICAgICAqL1xuICAgIG9uPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55LCBvbmNlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZXZlbnQua2V5O1xuICAgICAgICBjb25zdCBsaXN0ZW5lcjogTGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBldmVudDoga2V5LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlIHx8IHRoaXMsXG4gICAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyX21hcC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGxpc3RlbmVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyX21hcC5zZXQoa2V5LCBbbGlzdGVuZXJdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjb250YWluID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXJzW2ldLmV2ZW50ID09PSBsaXN0ZW5lci5ldmVudCAmJiBsaXN0ZW5lcnNbaV0uY2FsbGJhY2sgPT09IGxpc3RlbmVyLmNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0gPSBsaXN0ZW5lcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNvbnRhaW4pIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbmNlPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMub24oZXZlbnQsIGNhbGxiYWNrLCBzY29wZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgb2ZmPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55LCBvbmNlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZXZlbnQua2V5O1xuICAgICAgICBjb25zdCBsaXN0ZW5lcjogTGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBldmVudDoga2V5LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlIHx8IHRoaXMsXG4gICAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyX21hcC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyc1tpXS5ldmVudCA9PT0gbGlzdGVuZXIuZXZlbnQgJiYgbGlzdGVuZXJzW2ldLmNhbGxiYWNrID09PSBsaXN0ZW5lci5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpcmU8VD4oZXZlbnQ6IFR5cGVkRXZlbnQ8VD4sIHBheWxvYWQ/OiBUKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IGV2ZW50LmtleTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcl9tYXAuZ2V0KGtleSk7XG4gICAgICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBsaXN0ZW5lci5ldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsYmFjay5iaW5kKGxpc3RlbmVyLnNjb3BlIHx8IHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsYmFjayhwYXlsb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB0aGlzLmxpc3RlbmVyX21hcC5rZXlzKCkpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJfbWFwLmRlbGV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBfRXZlbnRIdWIge1xuICAgIHByaXZhdGUgbm9kZSA9IG5ldyBFdmVudE5vZGUoKTtcblxuICAgIG9uPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5vbihldmVudCwgY2FsbGJhY2ssIHNjb3BlKTtcbiAgICB9XG5cbiAgICBvbmNlPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5vbmNlKGV2ZW50LCBjYWxsYmFjaywgc2NvcGUpO1xuICAgIH1cblxuICAgIGZpcmU8VD4oZXZlbnQ6IFR5cGVkRXZlbnQ8VD4sIHBheWxvYWQ/OiBUKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5maXJlKGV2ZW50LCBwYXlsb2FkKTtcbiAgICB9XG5cbiAgICBvZmY8VD4oZXZlbnQ6IFR5cGVkRXZlbnQ8VD4sIGNhbGxiYWNrOiAocGF5bG9hZDogVCkgPT4gdm9pZCwgc2NvcGU/OiBhbnkpIHtcbiAgICAgICAgdGhpcy5ub2RlLm9mZihldmVudCwgY2FsbGJhY2ssIHNjb3BlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBFdmVudEh1YiA9IG5ldyBfRXZlbnRIdWIoKTtcbiIsICJpbXBvcnQgeyBGbG9hdDIgfSBmcm9tICcuLi9tYXRoL3NpbWQnO1xuaW1wb3J0IHsgVHlwZWRFdmVudCB9IGZyb20gJy4vZXZlbnQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBvaW50ZXJFdmVudFBheWxvYWQge1xuICAgIGJ1dHRvbjogbnVtYmVyO1xuICAgIHBvaW50OiBGbG9hdDI7XG4gICAgZGVsdGE6IEZsb2F0MjtcbiAgICBwb2ludHM/OiBGbG9hdDJbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNb3VzZUV2ZW50UGF5bG9hZCBleHRlbmRzIFBvaW50ZXJFdmVudFBheWxvYWQge1xuICAgIGV2ZW50OiBNb3VzZUV2ZW50O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEtleUV2ZW50UGF5bG9hZCB7XG4gICAga2V5Y29kZTogbnVtYmVyO1xuICAgIGV2ZW50OiBLZXlib2FyZEV2ZW50O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1vdXNlV2hlZWxFdmVudFBheWxvYWQge1xuICAgIGRlbHRhOiBudW1iZXI7XG4gICAgZGVsdGFfeDogbnVtYmVyO1xuICAgIGRlbHRhX3k6IG51bWJlcjtcbiAgICBldmVudDogV2hlZWxFdmVudDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXNpemVFdmVudFBheWxvYWQge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBHbG9iYWxFdmVudCA9IHtcbiAgICBGb3JjZVVwZGF0ZTogbmV3IFR5cGVkRXZlbnQ8TW91c2VFdmVudFBheWxvYWQ+KCdmb3JjZSB1cGRhdGUnKSxcbiAgICBGaWxlU3lzdGVtQ2hhbmdlZDogbmV3IFR5cGVkRXZlbnQoJ2ZpbGUgc3lzdGVtIGNoYW5nZWQnKSxcblxuICAgIE1vdXNlTW92ZTogbmV3IFR5cGVkRXZlbnQ8TW91c2VFdmVudFBheWxvYWQ+KCdtb3VzZW1vdmUnKSxcbiAgICBNb3VzZURyYWc6IG5ldyBUeXBlZEV2ZW50PE1vdXNlRXZlbnRQYXlsb2FkPignbW91c2VkcmFnJyksXG4gICAgTW91c2VEb3duOiBuZXcgVHlwZWRFdmVudDxNb3VzZUV2ZW50UGF5bG9hZD4oJ21vdXNlZG93bicpLFxuICAgIE1vdXNlVXA6IG5ldyBUeXBlZEV2ZW50PE1vdXNlRXZlbnRQYXlsb2FkPignbW91c2V1cCcpLFxuXG4gICAgUG9pbnRlckRvd246IG5ldyBUeXBlZEV2ZW50PFBvaW50ZXJFdmVudFBheWxvYWQ+KCdwb2ludGVyIGRvd24nKSxcbiAgICBQb2ludGVyTW92ZTogbmV3IFR5cGVkRXZlbnQ8UG9pbnRlckV2ZW50UGF5bG9hZD4oJ3BvaW50ZXIgbW92ZScpLFxuICAgIFBvaW50ZXJVcDogbmV3IFR5cGVkRXZlbnQ8UG9pbnRlckV2ZW50UGF5bG9hZD4oJ3BvaW50ZXIgdXAnKSxcblxuICAgIFRvdWNoU3RhcnQ6IG5ldyBUeXBlZEV2ZW50PFBvaW50ZXJFdmVudFBheWxvYWQ+KCd0b3VjaCBzdGFydCcpLFxuICAgIFRvdWNoTW92ZTogbmV3IFR5cGVkRXZlbnQ8UG9pbnRlckV2ZW50UGF5bG9hZD4oJ3RvdWNoIG1vdmUnKSxcbiAgICBUb3VjaEVuZDogbmV3IFR5cGVkRXZlbnQ8UG9pbnRlckV2ZW50UGF5bG9hZD4oJ3RvdWNoIGVuZCcpLFxuXG4gICAgS2V5RG93bjogbmV3IFR5cGVkRXZlbnQ8S2V5RXZlbnRQYXlsb2FkPigna2V5ZG93bicpLFxuICAgIEtleVVwOiBuZXcgVHlwZWRFdmVudDxLZXlFdmVudFBheWxvYWQ+KCdrZXl1cCcpLFxuICAgIE1vdXNlV2hlZWw6IG5ldyBUeXBlZEV2ZW50PE1vdXNlV2hlZWxFdmVudFBheWxvYWQ+KCdtb3VzZXdoZWVsJyksXG4gICAgUmVzaXplOiBuZXcgVHlwZWRFdmVudDxSZXNpemVFdmVudFBheWxvYWQ+KCdyZXNpemUnKSxcbiAgICBYUlNlc3Npb25FbmQ6IG5ldyBUeXBlZEV2ZW50KCd4ciBzZXNzaW9uIGVuZCcpLFxufTtcbiIsICJpbXBvcnQgeyBFdmVudEh1YiB9IGZyb20gJy4uL2VuZ2luZS9ldmVudCc7XG5pbXBvcnQgeyBHbG9iYWxFdmVudCB9IGZyb20gJy4uL2VuZ2luZS9nbG9iYWxfZXZlbnQnO1xuaW1wb3J0IHsgTW91c2VCdXR0b24gfSBmcm9tICcuLi9lbmdpbmUva2V5Y29kZSc7XG5pbXBvcnQgeyBGbG9hdDIgfSBmcm9tICcuLi9tYXRoL3NpbWQnO1xuXG5leHBvcnQgY2xhc3MgQnJvd3NlcklucHV0IHtcbiAgICBzdGFydDogRmxvYXQyID0gbmV3IEZsb2F0MigpO1xuICAgIGRyYWdfc3RhcnQ6IEZsb2F0MiA9IG5ldyBGbG9hdDIoKTtcbiAgICBlbmQ6IEZsb2F0MiA9IG5ldyBGbG9hdDIoKTtcbiAgICBkZWx0YTogRmxvYXQyID0gbmV3IEZsb2F0MigpO1xuXG4gICAgbW91c2VfYnV0dG9uOiBudW1iZXIgPSAtMTtcblxuICAgIGVsZW1lbnQ/OiBIVE1MRWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmJpbmQod2luZG93IGFzIGFueSk7XG4gICAgfVxuXG4gICAgYmluZChlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVuYmluZCgpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25tb3VzZWRvd24sIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9ubW91c2Vtb3ZlLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHRoaXMub25tb3VzZXdoZWVsLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLCB0aGlzLm9ubW91c2VzY3JvbGwsIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25rZXlkb3duLCBmYWxzZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbmtleXVwLCBmYWxzZSk7XG5cbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vbnRvdWNoc3RhcnQsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9udG91Y2htb3ZlLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9udG91Y2hlbmQsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMub250b3VjaGVuZCwgZmFsc2UpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25tb3VzZWRvd24pO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25tb3VzZW1vdmUpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLm9ubW91c2V3aGVlbCk7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbmtleWRvd24pO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLm9ua2V5dXApO1xuXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub250b3VjaHN0YXJ0KTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9udG91Y2htb3ZlKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub250b3VjaGVuZCk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLm9udG91Y2hlbmQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25tb3VzZWRvd24gPSAoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25tb3VzZWRyYWcsIGZhbHNlKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9ubW91c2V1cCwgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMubW91c2VfYnV0dG9uID0gZXZlbnQuYnV0dG9uO1xuXG4gICAgICAgIHRoaXMuc3RhcnQuc2V0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICB0aGlzLmRyYWdfc3RhcnQuY29weSh0aGlzLnN0YXJ0KTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShHbG9iYWxFdmVudC5Nb3VzZURvd24sIHtcbiAgICAgICAgICAgIGJ1dHRvbjogZXZlbnQuYnV0dG9uLFxuICAgICAgICAgICAgcG9pbnQ6IHRoaXMuc3RhcnQsXG4gICAgICAgICAgICBkZWx0YTogdGhpcy5kZWx0YSxcbiAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25tb3VzZWRyYWcgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5lbmQuc2V0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICB0aGlzLmRlbHRhLmNvcHkodGhpcy5lbmQpLnN1Yih0aGlzLmRyYWdfc3RhcnQpO1xuICAgICAgICB0aGlzLmRyYWdfc3RhcnQuY29weSh0aGlzLmVuZCk7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuTW91c2VEcmFnLCB7XG4gICAgICAgICAgICBidXR0b246IHRoaXMubW91c2VfYnV0dG9uLFxuICAgICAgICAgICAgcG9pbnQ6IHRoaXMuZW5kLFxuICAgICAgICAgICAgZGVsdGE6IHRoaXMuZGVsdGEsXG4gICAgICAgICAgICBldmVudCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9ubW91c2Vtb3ZlID0gKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuZW5kLnNldChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgdGhpcy5kZWx0YS5jb3B5KHRoaXMuZW5kKS5zdWIodGhpcy5zdGFydCk7XG5cbiAgICAgICAgdGhpcy5zdGFydC5jb3B5KHRoaXMuZW5kKTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShHbG9iYWxFdmVudC5Nb3VzZU1vdmUsIHtcbiAgICAgICAgICAgIGJ1dHRvbjogdGhpcy5tb3VzZV9idXR0b24sXG4gICAgICAgICAgICBwb2ludDogdGhpcy5lbmQsXG4gICAgICAgICAgICBkZWx0YTogdGhpcy5kZWx0YSxcbiAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25tb3VzZXVwID0gKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9ubW91c2VkcmFnKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9ubW91c2V1cCk7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuTW91c2VVcCwge1xuICAgICAgICAgICAgYnV0dG9uOiB0aGlzLm1vdXNlX2J1dHRvbixcbiAgICAgICAgICAgIHBvaW50OiB0aGlzLmVuZCxcbiAgICAgICAgICAgIGRlbHRhOiB0aGlzLmRlbHRhLFxuICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm1vdXNlX2J1dHRvbiA9IC0xO1xuICAgIH07XG5cbiAgICBvbm1vdXNld2hlZWwgPSAoZXZlbnQ6IEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGUgPSBldmVudCBhcyBhbnk7XG5cbiAgICAgICAgbGV0IGRlbHRhID0gMDtcbiAgICAgICAgaWYgKGUud2hlZWxEZWx0YSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBkZWx0YSA9IGUud2hlZWxEZWx0YTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmRlbHRhWSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBkZWx0YSA9IC1lLmRlbHRhWTtcbiAgICAgICAgfVxuICAgICAgICBkZWx0YSA9IGRlbHRhID4gMCA/IDAuOTUgOiAxLjA1O1xuICAgICAgICBFdmVudEh1Yi5maXJlKEdsb2JhbEV2ZW50Lk1vdXNlV2hlZWwsIHsgZGVsdGEsIGV2ZW50LCBkZWx0YV95OiBlLmRlbHRhWSwgZGVsdGFfeDogZS5kZWx0YVggfSk7XG4gICAgfTtcblxuICAgIG9ubW91c2VzY3JvbGwgPSAoZXZlbnQ6IGFueSk6IHZvaWQgPT4ge1xuICAgICAgICBsZXQgZGVsdGFfeCA9IDA7XG4gICAgICAgIGxldCBkZWx0YV95ID0gMDtcbiAgICAgICAgbGV0IGRlbHRhID0gMDtcbiAgICAgICAgZGVsdGEgPSBldmVudC5kZXRhaWwgPCAwID8gMC45NSA6IDEuMDU7XG4gICAgICAgIGlmIChldmVudC5heGlzID09PSAxKSB7XG4gICAgICAgICAgICBkZWx0YV94ID0gLWV2ZW50LmRldGFpbCAqIDI7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYXhpcyA9PT0gMikge1xuICAgICAgICAgICAgZGVsdGFfeSA9IC1ldmVudC5kZXRhaWwgKiAyO1xuICAgICAgICB9XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuTW91c2VXaGVlbCwgeyBkZWx0YSwgZXZlbnQsIGRlbHRhX3ksIGRlbHRhX3ggfSk7XG4gICAgfTtcblxuICAgIG9ua2V5ZG93biA9IChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBFdmVudEh1Yi5maXJlKEdsb2JhbEV2ZW50LktleURvd24sIHsga2V5Y29kZTogZXZlbnQua2V5Q29kZSwgZXZlbnQgfSk7XG4gICAgfTtcblxuICAgIG9ua2V5dXAgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShHbG9iYWxFdmVudC5LZXlVcCwgeyBrZXljb2RlOiBldmVudC5rZXlDb2RlLCBldmVudCB9KTtcbiAgICB9O1xuXG4gICAgb250b3VjaHN0YXJ0ID0gKGV2ZW50OiBUb3VjaEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHRvdWNoID0gZXZlbnQudG91Y2hlcy5pdGVtKGV2ZW50LnRvdWNoZXMubGVuZ3RoIC0gMSkhO1xuICAgICAgICB0aGlzLnN0YXJ0LnNldCh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKTtcbiAgICAgICAgdGhpcy5lbmQuY29weSh0aGlzLnN0YXJ0KTtcbiAgICAgICAgdGhpcy5tb3VzZV9idXR0b24gPSAwO1xuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgYnV0dG9uOiBNb3VzZUJ1dHRvbi5MZWZ0LFxuICAgICAgICAgICAgcG9pbnQ6IHRoaXMuZW5kLFxuICAgICAgICAgICAgZGVsdGE6IHRoaXMuZGVsdGEsXG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuVG91Y2hTdGFydCwgcGF5bG9hZCk7XG4gICAgfTtcblxuICAgIG9udG91Y2htb3ZlID0gKGV2ZW50OiBUb3VjaEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHRvdWNoID0gZXZlbnQudG91Y2hlcy5pdGVtKGV2ZW50LnRvdWNoZXMubGVuZ3RoIC0gMSkhO1xuICAgICAgICB0aGlzLmVuZC5zZXQodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSk7XG4gICAgICAgIHRoaXMuZGVsdGEuY29weSh0aGlzLmVuZCkuc3ViKHRoaXMuc3RhcnQpO1xuXG4gICAgICAgIHRoaXMuc3RhcnQuY29weSh0aGlzLmVuZCk7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuVG91Y2hNb3ZlLCB7XG4gICAgICAgICAgICBidXR0b246IE1vdXNlQnV0dG9uLkxlZnQsXG4gICAgICAgICAgICBwb2ludDogdGhpcy5lbmQsXG4gICAgICAgICAgICBkZWx0YTogdGhpcy5kZWx0YSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9udG91Y2hlbmQgPSAoZXZlbnQ6IFRvdWNoRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgdG91Y2ggPSBldmVudC50b3VjaGVzLml0ZW0oZXZlbnQudG91Y2hlcy5sZW5ndGggLSAxKSE7XG4gICAgICAgICAgICB0aGlzLmVuZC5zZXQodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgICAgIGJ1dHRvbjogTW91c2VCdXR0b24uTGVmdCxcbiAgICAgICAgICAgIHBvaW50OiB0aGlzLmVuZCxcbiAgICAgICAgICAgIGRlbHRhOiB0aGlzLmRlbHRhLFxuICAgICAgICB9O1xuICAgICAgICBFdmVudEh1Yi5maXJlKEdsb2JhbEV2ZW50LlRvdWNoRW5kLCBwYXlsb2FkKTtcbiAgICB9O1xufVxuIiwgImltcG9ydCB7IEV2ZW50SHViIH0gZnJvbSAnLi4vZW5naW5lL2V2ZW50JztcbmltcG9ydCB7IEdsb2JhbEV2ZW50IH0gZnJvbSAnLi4vZW5naW5lL2dsb2JhbF9ldmVudCc7XG5pbXBvcnQgeyBTdHJpbmdNYXAgfSBmcm9tICcuLi9zdGQvdHlwZSc7XG5cbmV4cG9ydCBlbnVtIElucHV0QXhpcyB7XG4gICAgSG9yaXpvbnRhbCA9IDAsXG4gICAgVmVydGljYWwgPSAxLFxufVxuXG5leHBvcnQgZW51bSBJbnB1dEJ1dHRvbiB7XG4gICAgQmFja3NwYWNlID0gOCxcbiAgICBUYWIgPSA5LFxuICAgIEVudGVyID0gMTMsXG4gICAgU2hpZnQgPSAxNixcbiAgICBDdHJsID0gMTcsXG4gICAgQWx0ID0gMTgsXG4gICAgRXNjYXBlID0gMjcsXG4gICAgTGVmdCA9IDM3LFxuICAgIFVwLFxuICAgIFJpZ2h0LFxuICAgIERvd24sXG4gICAgQSA9IDY1LFxuICAgIEIsXG4gICAgQyxcbiAgICBELFxuICAgIEUsXG4gICAgRixcbiAgICBHLFxuICAgIEgsXG4gICAgSSxcbiAgICBKLFxuICAgIEssXG4gICAgTCxcbiAgICBNLFxuICAgIE4sXG4gICAgTyxcbiAgICBQLFxuICAgIFEsXG4gICAgUixcbiAgICBTLFxuICAgIFQsXG4gICAgVSxcbiAgICBWLFxuICAgIFcsXG4gICAgWCxcbiAgICBZLFxuICAgIFogPSA5MCxcbiAgICBNZXRhID0gOTEsXG4gICAgRGVsZXRlID0gMTI3LFxufVxuXG5leHBvcnQgY2xhc3MgSW5wdXQge1xuICAgIHByaXZhdGUgYXhpc19tYXA6IFN0cmluZ01hcDxudW1iZXI+ID0ge307XG4gICAgcHJpdmF0ZSBrZXlfbWFwOiBTZXQ8SW5wdXRCdXR0b24+ID0gbmV3IFNldCgpO1xuXG4gICAgc2V0X2F4aXMoYXhpczogSW5wdXRBeGlzLCB2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYXhpc19tYXBbYXhpc10gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXRfYXhpcyhheGlzOiBJbnB1dEF4aXMpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5heGlzX21hcFtheGlzXSB8fCAwO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFdmVudEh1Yi5vbihHbG9iYWxFdmVudC5LZXlEb3duLCB0aGlzLm9ua2V5ZG93bik7XG4gICAgICAgIEV2ZW50SHViLm9uKEdsb2JhbEV2ZW50LktleVVwLCB0aGlzLm9ua2V5dXApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25rZXlkb3duID0gKHBheWxvYWQ6IHsga2V5Y29kZTogbnVtYmVyIH0pOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qga2V5Y29kZSA9IHBheWxvYWQua2V5Y29kZTtcbiAgICAgICAgaWYgKGtleWNvZGUgPT09IElucHV0QnV0dG9uLlVwKSB7XG4gICAgICAgICAgICB0aGlzLnNldF9heGlzKElucHV0QXhpcy5WZXJ0aWNhbCwgMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5Y29kZSA9PT0gSW5wdXRCdXR0b24uRG93bikge1xuICAgICAgICAgICAgdGhpcy5zZXRfYXhpcyhJbnB1dEF4aXMuVmVydGljYWwsIC0xKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXljb2RlID09PSBJbnB1dEJ1dHRvbi5MZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnNldF9heGlzKElucHV0QXhpcy5Ib3Jpem9udGFsLCAtMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5Y29kZSA9PT0gSW5wdXRCdXR0b24uUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0X2F4aXMoSW5wdXRBeGlzLkhvcml6b250YWwsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5rZXlfbWFwLmFkZChrZXljb2RlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbmtleXVwID0gKHBheWxvYWQ6IHsga2V5Y29kZTogbnVtYmVyIH0pOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qga2V5Y29kZSA9IHBheWxvYWQua2V5Y29kZTtcbiAgICAgICAgaWYgKGtleWNvZGUgPT09IElucHV0QnV0dG9uLlVwIHx8IGtleWNvZGUgPT09IElucHV0QnV0dG9uLkRvd24pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0X2F4aXMoSW5wdXRBeGlzLlZlcnRpY2FsLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXljb2RlID09PSBJbnB1dEJ1dHRvbi5MZWZ0IHx8IGtleWNvZGUgPT09IElucHV0QnV0dG9uLlJpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnNldF9heGlzKElucHV0QXhpcy5Ib3Jpem9udGFsLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMua2V5X21hcC5kZWxldGUoa2V5Y29kZSk7XG4gICAgfTtcblxuICAgIGdldF9idXR0b24oYnV0dG9uOiBJbnB1dEJ1dHRvbik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlfbWFwLmhhcyhidXR0b24pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBCcm93c2VySW5wdXQgfSBmcm9tICcuLi9pbnB1dC9icm93c2VyX2lucHV0JztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vaW5wdXQvaW5wdXQnO1xuaW1wb3J0IHsgbWVtY3ljbGUgfSBmcm9tICcuLi9tZW1vcnkvaGVhcCc7XG5pbXBvcnQgeyBFdmVudEh1YiwgVHlwZWRFdmVudCB9IGZyb20gJy4vZXZlbnQnO1xuaW1wb3J0IHsgR2xvYmFsRXZlbnQgfSBmcm9tICcuL2dsb2JhbF9ldmVudCc7XG5cbmV4cG9ydCBjb25zdCBFbmdpbmVFdmVudCA9IHtcbiAgICBCZWZvcmVUaWNrOiBuZXcgVHlwZWRFdmVudCgnYmVmb3JlIHRpY2snKSxcbiAgICBBZnRlclRpY2s6IG5ldyBUeXBlZEV2ZW50KCdhZnRlciB0aWNrJyksXG4gICAgQmVmb3JlRnJhbWU6IG5ldyBUeXBlZEV2ZW50KCdiZWZvcmUgZnJhbWUnKSxcbiAgICBBZnRlckZyYW1lOiBuZXcgVHlwZWRFdmVudCgnYWZ0ZXIgZnJhbWUnKSxcbiAgICBGcmFtZTogbmV3IFR5cGVkRXZlbnQoJ2ZyYW1lJyksXG59O1xuXG5leHBvcnQgY2xhc3MgRW5naW5lIHtcbiAgICBzd2FwX2NoYWluOiBudW1iZXIgPSAtMTtcblxuICAgIGZyYW1lX2luZGV4OiBudW1iZXIgPSAwO1xuICAgIHRpbWU6IG51bWJlciA9IHBlcmZvcm1hbmNlLm5vdygpICogMC4wMDE7XG4gICAgbGFzdF90aW1lOiBudW1iZXIgPSBwZXJmb3JtYW5jZS5ub3coKSAqIDAuMDAxO1xuXG4gICAgLy8gZGVsdGFfdGltZSBpbiBzZWNvbmRzIGZyb20gbGFzdCBmcmFtZSB0byB0aGlzIGZyYW1lXG4gICAgZGVsdGFfdGltZTogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCkgKiAwLjAwMTsgXG5cbiAgICAvLyBkZWx0YV90aW1lIGluIHNlY29uZHMgZnJvbSBsYXN0IGZyYW1lIHRvIG5vd1xuICAgIGdldCBhYnNfZGVsdGFfdGltZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKHBlcmZvcm1hbmNlLm5vdygpICogMC4wMDEpIC0gdGhpcy5sYXN0X3RpbWU7XG4gICAgfVxuXG4gICAgbW91c2VfaW5wdXQ6IEJyb3dzZXJJbnB1dDtcbiAgICBpbnB1dDogSW5wdXQ7XG5cbiAgICBwYXVzZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQoKTtcbiAgICAgICAgdGhpcy5tb3VzZV9pbnB1dCA9IG5ldyBCcm93c2VySW5wdXQoKTtcblxuICAgICAgICBFdmVudEh1Yi5vbihHbG9iYWxFdmVudC5YUlNlc3Npb25FbmQsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhdXNlZCkgdGhpcy5zdGFydCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy50aWNrKCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy50aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgKiAwLjAwMTtcbiAgICAgICAgdGhpcy5kZWx0YV90aW1lID0gdGhpcy50aW1lIC0gdGhpcy5sYXN0X3RpbWU7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoRW5naW5lRXZlbnQuQmVmb3JlVGljayk7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoRW5naW5lRXZlbnQuQmVmb3JlRnJhbWUpO1xuICAgICAgICBFdmVudEh1Yi5maXJlKEVuZ2luZUV2ZW50LkZyYW1lKTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShFbmdpbmVFdmVudC5BZnRlckZyYW1lKTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShFbmdpbmVFdmVudC5BZnRlclRpY2spO1xuICAgICAgICB0aGlzLmxhc3RfdGltZSA9IHRoaXMudGltZTtcbiAgICAgICAgbWVtY3ljbGUoKTtcbiAgICAgICAgdGhpcy5zd2FwX2NoYWluID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudGljayk7XG4gICAgfTtcblxuICAgIHBhdXNlKCkge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnN3YXBfY2hhaW4pO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGVybWluYXRlKCkge31cbn1cbiIsICJpbXBvcnQgeyBQb2x5Tm9kZSB9IGZyb20gJy4uL2FkdC9wdHJlZSc7XG5pbXBvcnQgeyBDb2xvclJHQkEgfSBmcm9tICcuLi9tYXRoL2NvbG9yJztcblxuZXhwb3J0IGNsYXNzIEZyYW1lQ2FwdHVyZU5vZGU8VCA9IGFueT4gZXh0ZW5kcyBQb2x5Tm9kZTxGcmFtZUNhcHR1cmVOb2RlPFQ+PiB7XG4gICAgbmFtZTogc3RyaW5nID0gJ2Fub255bW91cyc7XG4gICAgc3RhcnQ/OiBudW1iZXI7XG4gICAgZW5kPzogbnVtYmVyO1xuXG4gICAgY29sb3I/OiBDb2xvclJHQkE7XG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gICAgZGF0YT86IFQ7XG5cbiAgICB0eXBlOiBGcmFtZUNhcHR1cmVOb2RlVHlwZSA9IEZyYW1lQ2FwdHVyZU5vZGVUeXBlLk5vbmU7XG59XG5cbmV4cG9ydCBlbnVtIEZyYW1lQ2FwdHVyZU5vZGVUeXBlIHtcbiAgICBOb25lLFxuICAgIFBhc3MsXG4gICAgUGlwZWxpbmUsXG4gICAgQ29uc3RhbnRCdWZmZXIsXG4gICAgRHJhdyxcbiAgICBNZXNoXG59XG5cbmV4cG9ydCBjbGFzcyBQcm9maWxlcjxUID0gYW55PiB7XG4gICAgcm9vdDogRnJhbWVDYXB0dXJlTm9kZTxUPjtcbiAgICBub2RlOiBGcmFtZUNhcHR1cmVOb2RlPFQ+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucm9vdCA9IHRoaXMubm9kZSA9IG5ldyBGcmFtZUNhcHR1cmVOb2RlPFQ+KCk7XG4gICAgfVxuXG4gICAgdHJhY2Vfc3RhcnQobmFtZTogc3RyaW5nLCBkZXNjcmlwdGlvbj86IHN0cmluZywgZGF0YT86IGFueSwgdHlwZTogRnJhbWVDYXB0dXJlTm9kZVR5cGUgPSBGcmFtZUNhcHR1cmVOb2RlVHlwZS5Ob25lKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgRnJhbWVDYXB0dXJlTm9kZSgpO1xuXG4gICAgICAgIG5vZGUubmFtZSA9IG5hbWU7XG4gICAgICAgIG5vZGUuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgbm9kZS5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgICAgICBub2RlLmRhdGEgPSBkYXRhO1xuICAgICAgICBub2RlLnR5cGUgPSB0eXBlO1xuXG4gICAgICAgIHRoaXMubm9kZS5hZGQobm9kZSk7XG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgfVxuXG4gICAgdHJhY2VfZW5kKG5hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBub2RlcyA9IFtdO1xuICAgICAgICBsZXQgdG9wOiBGcmFtZUNhcHR1cmVOb2RlIHwgdW5kZWZpbmVkID0gdGhpcy5ub2RlO1xuICAgICAgICB3aGlsZSAodG9wICYmIHRvcC5uYW1lICE9PSBuYW1lKSB7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKHRvcCk7XG4gICAgICAgICAgICB0b3AgPSB0b3AucGFyZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBgaW52YWxpZCB0cmFjZSBlbmQgJHtuYW1lfWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICAgICAgbm9kZS5lbmQgPSBlbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b3AuZW5kID0gZW5kO1xuICAgICAgICAgICAgdGhpcy5ub2RlID0gdG9wLnBhcmVudCE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5yb290ID0gdGhpcy5ub2RlID0gbmV3IEZyYW1lQ2FwdHVyZU5vZGUoKTtcbiAgICAgICAgdGhpcy5yb290LnN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IEJ1ZmZlclJhbmdlIH0gZnJvbSAnLic7XG5cbmV4cG9ydCBjbGFzcyBCbG9ja0FsbG9jYXRvciB7XG5cbiAgICB0YWlsOiBudW1iZXIgPSAwO1xuICAgIGhlYXBfc2l6ZTogbnVtYmVyID0gMDtcblxuICAgIHZhbGlkX3NldDogU2V0PEJ1ZmZlclJhbmdlPiA9IG5ldyBTZXQoKTtcbiAgICBmcmVlX3NldDogU2V0PEJ1ZmZlclJhbmdlPiA9IG5ldyBTZXQoKTtcbiAgICBmcmVlX3NpemU6IG51bWJlciA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgYmxvY2tfc2l6ZTogbnVtYmVyKSB7fVxuXG4gICAgYWxsb2NhdGUoY291bnQ6IG51bWJlcik6IEJ1ZmZlclJhbmdlIHtcbiAgICAgICAgY29uc3QgYnl0ZV9vZmZzZXQgPSB0aGlzLnRhaWw7XG4gICAgICAgIGNvbnN0IGJ5dGVfbGVuZ3RoID0gY291bnQgKiB0aGlzLmJsb2NrX3NpemU7XG4gICAgICAgIHRoaXMudGFpbCArPSBieXRlX2xlbmd0aDtcbiAgICAgICAgdGhpcy5oZWFwX3NpemUgPSBNYXRoLm1heCh0aGlzLmhlYXBfc2l6ZSwgdGhpcy50YWlsKTtcbiAgICAgICAgcmV0dXJuIHsgYnl0ZV9vZmZzZXQsIGJ5dGVfbGVuZ3RoIH07XG4gICAgfVxuXG4gICAgZnJlZShyYW5nZTogQnVmZmVyUmFuZ2UpIHtcbiAgICAgICAgdGhpcy5mcmVlX3NldC5hZGQocmFuZ2UpO1xuICAgICAgICB0aGlzLmZyZWVfc2l6ZSArPSByYW5nZS5ieXRlX2xlbmd0aDtcbiAgICB9XG5cbiAgICByZWFycmFuZ2UoKSB7XG4gICAgICAgIHRoaXMuZnJlZV9zZXQuY2xlYXIoKTtcbiAgICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgcmFuZ2Ugb2YgdGhpcy52YWxpZF9zZXQpIHtcbiAgICAgICAgICAgIHJhbmdlLmJ5dGVfb2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgb2Zmc2V0ICs9IHJhbmdlLmJ5dGVfbGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGFpbCA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5oZWFwX3NpemUgPSBNYXRoLm1heCh0aGlzLmhlYXBfc2l6ZSwgdGhpcy50YWlsKTtcbiAgICB9XG5cbn0iLCAiaW1wb3J0IHsgVHlwZWRBcnJheSB9IGZyb20gJy4uL3N0ZC90eXBlJztcbmltcG9ydCB7IFdlYkdMRHJhd0Rlc2NyaXB0b3IgfSBmcm9tICcuLi93ZWJnbC9kcmF3JztcbmltcG9ydCB7IEdQVVBhc3NEZXNjcmlwdG9yIH0gZnJvbSAnLi4vd2ViZ2wvcGFzcyc7XG5pbXBvcnQgeyBHUFVQaXBlbGluZURlc2NyaXB0b3IgfSBmcm9tICcuLi93ZWJnbC9waXBlbGluZSc7XG5pbXBvcnQgeyBXZWJHTFRleHR1cmVEZXNjcmlwdG9yIH0gZnJvbSAnLi4vd2ViZ2wvdGV4dHVyZSc7XG5pbXBvcnQgeyBHRlhEZXZpY2VPcHRpb25zIH0gZnJvbSAnLi9nZnhfZGV2aWNlJztcbmltcG9ydCB7IFJlbmRlclJlc291cmNlVHlwZSB9IGZyb20gJy4vcmVuZGVyLnJlc291cmNlJztcblxuZXhwb3J0IGVudW0gUmVuZGVyQ29tbWFuZFR5cGUge1xuICAgIENyZWF0ZURldmljZSA9IDAsXG4gICAgRGV2aWNlUmVzaXplLFxuICAgIEdldEV4dGVuc2lvbixcbiAgICBDcmVhdGVUZXh0dXJlLFxuICAgIENyZWF0ZUJ1ZmZlcixcbiAgICBDcmVhdGVEcmF3LFxuICAgIENyZWF0ZVBpcGVsaW5lLFxuICAgIENyZWF0ZVBhc3MsXG4gICAgU2hhcmVCdWZmZXIsXG4gICAgVXBkYXRlVGV4dHVyZSxcbiAgICBVcGRhdGVCdWZmZXIsXG4gICAgRXhlY3V0ZUNvbW1hbmRCdWZmZXIsXG4gICAgRXhlY3V0ZUNvbW1hbmRRdWV1ZSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJSZXNvdXJjZSB7XG4gICAgdHlwZTogUmVuZGVyUmVzb3VyY2VUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlckNvbW1hbmQge1xuICAgIHR5cGU6IFJlbmRlckNvbW1hbmRUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJDcmVhdGVEZXZpY2UgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICBjYW52YXM6IE9mZnNjcmVlbkNhbnZhczsgLy8gbXVzdCBjYWxsIHRyYW5zZmVyQ29udHJvbFRvT2Zmc2NyZWVuIGJlZm9yZSBwYXNzaW5nIHRvIHdvcmtlclxuICAgIG9wdGlvbnM6IEdGWERldmljZU9wdGlvbnM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkRldmljZVJlc2l6ZSBleHRlbmRzIFJlbmRlckNvbW1hbmQge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgcGl4ZWxfd2lkdGg6IG51bWJlcjtcbiAgICBwaXhlbF9oZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSR2V0RXh0ZW5zaW9uIGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgZXh0ZW5zaW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkNyZWF0ZVRleHR1cmUgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICByZXNvdXJjZV9pZDogbnVtYmVyO1xuICAgIGRlc2NyaXB0b3I6IFdlYkdMVGV4dHVyZURlc2NyaXB0b3I7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkNyZWF0ZUJ1ZmZlciBleHRlbmRzIFJlbmRlckNvbW1hbmQge1xuICAgIGJ1ZmZlcjogVHlwZWRBcnJheTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSU2hhcmVCdWZmZXIgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICByZXNvdXJjZV9pZDogbnVtYmVyO1xuICAgIGJ1ZmZlcjogU2hhcmVkQXJyYXlCdWZmZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkNyZWF0ZURyYXcgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICByZXNvdXJjZV9pZDogbnVtYmVyO1xuICAgIGRlc2NyaXB0b3I6IFdlYkdMRHJhd0Rlc2NyaXB0b3I7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkNyZWF0ZVBpcGVsaW5lIGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgcmVzb3VyY2VfaWQ6IG51bWJlcjtcbiAgICBkZXNjcmlwdG9yOiBHUFVQaXBlbGluZURlc2NyaXB0b3I7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkNyZWF0ZVBhc3MgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICByZXNvdXJjZV9pZDogbnVtYmVyO1xuICAgIGRlc2NyaXB0b3I6IEdQVVBhc3NEZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJVcGRhdGVUZXh0dXJlIGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgcmVzb3VyY2VfaWQ6IG51bWJlcjsgLy8gc2hhcmVkIGJ1ZmZlciBpZFxuICAgIG9mZnNldDogbnVtYmVyO1xuICAgIHNpemU6IG51bWJlcjtcblxuICAgIHg/OiBudW1iZXI7XG4gICAgeT86IG51bWJlcjtcbiAgICB3aWR0aD86IG51bWJlcjtcbiAgICBoZWlnaHQ/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkRpc3Bvc2VSZXNvdXJjZSBleHRlbmRzIFJlbmRlckNvbW1hbmQge1xuICAgIHJlc291cmNlX2lkOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkV4ZWN1dGVDb21tYW5kQnVmZmVyIGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgYnVmZmVyOiBBcnJheUJ1ZmZlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSRXhlY3V0ZUNvbW1hbmRRdWV1ZSBleHRlbmRzIFJlbmRlckNvbW1hbmQge1xuICAgIGJ1ZmZlcjogQXJyYXlCdWZmZXI7XG59XG5cbmV4cG9ydCB0eXBlIFJlbmRlckNvbW1hbmRIYW5kbGVyPFQgZXh0ZW5kcyBSZW5kZXJDb21tYW5kPiA9IChjb21tYW5kOiBUKSA9PiB2b2lkO1xuY29uc3QgY29tbWFuZF9oYW5kbGVycyA9IG5ldyBNYXA8UmVuZGVyQ29tbWFuZFR5cGUsIFJlbmRlckNvbW1hbmRIYW5kbGVyPGFueT4+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJfcmVnaXN0ZXJfY29tbWFuZF9oYW5kbGVyPFQgZXh0ZW5kcyBSZW5kZXJDb21tYW5kPih0eXBlOiBSZW5kZXJDb21tYW5kVHlwZSwgaGFuZGxlcjogUmVuZGVyQ29tbWFuZEhhbmRsZXI8VD4pIHtcbiAgICBjb21tYW5kX2hhbmRsZXJzLnNldCh0eXBlLCBoYW5kbGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcl9jb21tYW5kX2hhbmRsZXJfZ2V0PFQgZXh0ZW5kcyBSZW5kZXJDb21tYW5kPih0eXBlOiBSZW5kZXJDb21tYW5kVHlwZSk6IFJlbmRlckNvbW1hbmRIYW5kbGVyPFQ+IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gY29tbWFuZF9oYW5kbGVycy5nZXQodHlwZSk7XG59XG4iLCAiaW1wb3J0IHsgV29ya2VyUmVzcG9uc2UgfSBmcm9tICcuLi93b3JrZXIvd2ViX3dvcmtlcic7XG5pbXBvcnQgeyBSZW5kZXJDb21tYW5kLCBSZW5kZXJDb21tYW5kVHlwZSwgcmVuZGVyX2NvbW1hbmRfaGFuZGxlcl9nZXQgfSBmcm9tICcuL3JlbmRlci5jb21tYW5kJztcblxuZnVuY3Rpb24gcG9zdF9tZXNzYWdlKHRhc2tfaWQ6IG51bWJlciwgZGF0YTogYW55LCBtZXNzYWdlPzogc3RyaW5nKSB7XG4gICAgY29uc3QgZXZlbnQgPSB7IHRhc2tfaWQsIHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2UsIGRhdGEgfSBhcyBXb3JrZXJSZXNwb25zZTtcbiAgICBzZWxmLnBvc3RNZXNzYWdlKGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gcG9zdF9tZXNzYWdlX2Vycm9yKHRhc2tfaWQ6IG51bWJlciwgZGF0YTogYW55LCBtZXNzYWdlPzogc3RyaW5nKSB7XG4gICAgY29uc3QgZXZlbnQgPSB7IHRhc2tfaWQsIHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlLCBkYXRhIH0gYXMgV29ya2VyUmVzcG9uc2U7XG4gICAgc2VsZi5wb3N0TWVzc2FnZShldmVudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJfd29ya2VyX2NvbW1hbmRfbWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlRXZlbnQpIHtcbiAgICBjb25zdCB0YXNrX2lkID0gbWVzc2FnZS5kYXRhLnRhc2tfaWQ7XG4gICAgY29uc3QgY29tbWFuZCA9IG1lc3NhZ2UuZGF0YSBhcyBSZW5kZXJDb21tYW5kO1xuICAgIGNvbnN0IGhhbmRsZXIgPSByZW5kZXJfY29tbWFuZF9oYW5kbGVyX2dldChjb21tYW5kLnR5cGUpO1xuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGA8UmVuZGVyVGhyZWFkV2ViR0w+IGV4ZWN1dGUgaWQ6ICR7dGFza19pZH0gdHlwZTogJHtSZW5kZXJDb21tYW5kVHlwZVtjb21tYW5kLnR5cGVdfWApO1xuICAgICAgICBoYW5kbGVyKGNvbW1hbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgdHlwZSB9ID0gY29tbWFuZDtcbiAgICAgICAgcG9zdF9tZXNzYWdlX2Vycm9yKHRhc2tfaWQsIHsgdHlwZSB9LCBgQ29tbWFuZCBoYW5kbGVyIGZvciB0eXBlICR7Y29tbWFuZC50eXBlfSBub3QgZm91bmQuYCk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHJlbmRlcl93b3JrZXJfY29tbWFuZF9tZXNzYWdlIH0gZnJvbSAnLi4vZ2Z4L3JlbmRlci53b3JrZXInO1xuXG5pbnRlcmZhY2UgR1BVQWRhcHRlciB7XG4gICAgcmVxdWVzdERldmljZSgpOiBQcm9taXNlPEdGWERldmljZSB8IHVuZGVmaW5lZD47XG59XG5pbnRlcmZhY2UgR0ZYRGV2aWNlIHt9XG5cbmludGVyZmFjZSBHUFVDb250ZXh0IHtcbiAgICBhZGFwdGVyOiBHUFVBZGFwdGVyO1xuICAgIGRldmljZTogR0ZYRGV2aWNlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd2ViZ3B1X2RldmljZV9jcmVhdGUoKTogUHJvbWlzZTxHUFVDb250ZXh0IHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgZ3B1ID0gKG5hdmlnYXRvciBhcyBhbnkpLmdwdTtcbiAgICBpZiAoIWdwdSkgcmV0dXJuO1xuICAgIGNvbnN0IGFkYXB0ZXI6IEdQVUFkYXB0ZXIgPSBhd2FpdCBncHUucmVxdWVzdEFkYXB0ZXIoKTtcbiAgICBpZiAoIWFkYXB0ZXIpIHJldHVybjtcbiAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBhZGFwdGVyLnJlcXVlc3REZXZpY2UoKTtcbiAgICBpZiAoIWRldmljZSkgcmV0dXJuO1xuICAgIHJldHVybiB7IGFkYXB0ZXIsIGRldmljZSB9IGFzIEdQVUNvbnRleHQ7XG59XG5cbnNlbGYub25tZXNzYWdlID0gcmVuZGVyX3dvcmtlcl9jb21tYW5kX21lc3NhZ2U7XG4iLCAiaW1wb3J0IHsgTWF0ZXJpYWxCbG9jaywgU3ViTWVzaCB9IGZyb20gJy4uL2VuZ2luZSc7XG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tICcuLi9lbmdpbmUvY2FtZXJhJztcbmltcG9ydCB7IEdGWERldmljZU9wdGlvbnMgfSBmcm9tICcuLi9nZngnO1xuaW1wb3J0IHsgR1BVQWN0aW9uIH0gZnJvbSAnLi4vZ2Z4L2dmeF9kZXZpY2UnO1xuaW1wb3J0IHsgR0ZYRW5jb2RlciB9IGZyb20gJy4uL2dmeC9nZnhfZW5jb2Rlcic7XG5pbXBvcnQgeyBDb2xvclJHQkEgfSBmcm9tICcuLi9tYXRoL2NvbG9yJztcbmltcG9ydCB7IFdlYkdMRHJhdyB9IGZyb20gJy4uL3dlYmdsL2RyYXcnO1xuaW1wb3J0IHsgR1BVTWVzaCB9IGZyb20gJy4uL3dlYmdsL21lc2gnO1xuaW1wb3J0IHsgR1BVUGFzcyB9IGZyb20gJy4uL3dlYmdsL3Bhc3MnO1xuaW1wb3J0IHsgUGlwZWxpbmUgfSBmcm9tICcuLi93ZWJnbC9waXBlbGluZSc7XG5cbmV4cG9ydCBjbGFzcyBXZWJHUFVFbmNvZGVyIGltcGxlbWVudHMgR0ZYRW5jb2RlciB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogR0ZYRGV2aWNlT3B0aW9ucykge31cbiAgICBzZXRfZGlzcGxheV9zaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7fVxuICAgIHNldF92aWV3cG9ydCh4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHt9XG4gICAgc2V0X2NhbWVyYShjYW1lcmE6IENhbWVyYSk6IHZvaWQge31cbiAgICBzZXRfYWN0aW9uKGFjdGlvbjogR1BVQWN0aW9uKTogdm9pZCB7fVxuICAgIHNldF9wYXNzKHBhc3M/OiBHUFVQYXNzLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQge31cbiAgICBzZXRfY2xlYXJfY29sb3IoY29sb3I6IENvbG9yUkdCQSk6IHZvaWQge31cbiAgICBjbGVhcihhY3Rpb24/OiBHUFVBY3Rpb24pOiB2b2lkIHt9XG4gICAgc2V0X3BpcGVsaW5lKHBpcGVsaW5lOiBQaXBlbGluZSk6IHZvaWQge31cbiAgICBzZXRfc2Npc3Nvcih4PzogbnVtYmVyLCB5PzogbnVtYmVyLCB3aWR0aD86IG51bWJlciwgaGVpZ2h0PzogbnVtYmVyKTogdm9pZCB7fVxuICAgIHNldF9tYXRlcmlhbChtYXRlcmlhbDogYW55LCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQge31cbiAgICBzZXRfbWF0ZXJpYWxfYmxvY2sobWF0ZXJpYWw6IE1hdGVyaWFsQmxvY2ssIGRlc2NyaXB0aW9uPzogc3RyaW5nKTogdm9pZCB7fVxuICAgIHNldF9kcmF3KGRyYXc6IFdlYkdMRHJhdywgY2h1bms/OiBhbnksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTogdm9pZCB7fVxuICAgIHNldF9tZXNoKG1lc2g6IEdQVU1lc2gpOiB2b2lkIHt9XG4gICAgZHJhd19tZXNoKG1lc2g6IEdQVU1lc2gsIGRlc2NyaXB0aW9uPzogc3RyaW5nIHwgdW5kZWZpbmVkKTogdm9pZCB7fVxuICAgIGRyYXdfc3VibWVzaChzdWJtZXNoOiBTdWJNZXNoLCBkZXNjcmlwdGlvbj86IHN0cmluZyB8IHVuZGVmaW5lZCk6IHZvaWQge31cbiAgICBjb21taXQoKTogdm9pZCB7fVxufSIsICJpbXBvcnQgeyBFdmVudEh1YiwgR2xvYmFsRXZlbnQgfSBmcm9tICcuLi9lbmdpbmUnO1xuaW1wb3J0IHsgQ29sb3JSR0JBIH0gZnJvbSAnLi4vbWF0aCc7XG5pbXBvcnQgeyBXZWJHTEVuY29kZXIsIGNyZWF0ZV9ibG9ja19nbG9iYWwgfSBmcm9tICcuLi93ZWJnbCc7XG5pbXBvcnQgeyBXZWJHUFVFbmNvZGVyIH0gZnJvbSAnLi4vd2ViZ3B1JztcbmltcG9ydCB7IEdGWEVuY29kZXIgfSBmcm9tICcuL2dmeF9lbmNvZGVyJztcblxuZXhwb3J0IGVudW0gR0ZYQmFja2VuZCB7XG4gICAgV2ViR0wgPSAncHVibGljL3NyYy93b3JrZXIvd2ViZ2wucmVuZGVyL3dnbC53b3JrZXIuanMnLFxuICAgIFdlYkdQVSA9ICdwdWJsaWMvc3JjL3dvcmtlci93ZWJncHUucmVuZGVyL3dncHUud29ya2VyLmpzJ1xufVxuXG5leHBvcnQgdHlwZSBHTCA9IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR0ZYRGV2aWNlT3B0aW9ucyBleHRlbmRzIFdlYkdMQ29udGV4dEF0dHJpYnV0ZXMge1xuICAgIGNhbnZhcz86IEhUTUxDYW52YXNFbGVtZW50XG4gICAgZGlzcGxheV9yYXRpbz86IG51bWJlcjtcbiAgICBwcmVzZXJ2ZV9idWZmZXI/OiBib29sZWFuO1xuICAgIG11bHRpX3RocmVhZF9yZW5kZXJpbmc/OiBib29sZWFuO1xuICAgIGJhY2tlbmQ/OiBHRlhCYWNrZW5kO1xuICAgIHhyX2VuYWJsZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZW51bSBHUFVBY3Rpb25UeXBlIHtcbiAgICBDbGVhckNvbG9yID0gMSA8PCAwLFxuICAgIENsZWFyRGVwdGggPSAxIDw8IDEsXG4gICAgQ2xlYXJTdGVuY2lsID0gMSA8PCAyLFxuICAgIENsZWFyQWxsID0gQ2xlYXJDb2xvciB8IENsZWFyRGVwdGggfCBDbGVhclN0ZW5jaWwsXG4gICAgSWdub3JlLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdQVUFjdGlvbiB7XG4gICAgdHlwZTogR1BVQWN0aW9uVHlwZTtcbiAgICBjbGVhcl9jb2xvcjogQ29sb3JSR0JBO1xuICAgIGNsZWFyX2RlcHRoOiBudW1iZXI7XG59XG5cbmNvbnN0IGRlZmF1bHRfY2xlYXJfYWN0aW9uID0ge1xuICAgIHR5cGU6IEdQVUFjdGlvblR5cGUuQ2xlYXJBbGwsXG4gICAgY2xlYXJfY29sb3I6IG5ldyBDb2xvclJHQkEoMCwgMCwgMCwgMCksXG4gICAgY2xlYXJfZGVwdGg6IDEsXG59IGFzIEdQVUFjdGlvbjtcblxuZXhwb3J0IGVudW0gR1BVU3RvcmFnZU1vZGUge1xuICAgIFNoYXJlZCxcbiAgICBHUFVPbmx5LFxuICAgIE1lbW9yeWxlc3MsXG59XG5cbmxldCBfZGV2aWNlOiBHRlhEZXZpY2UgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBjbGFzcyBHRlhEZXZpY2Uge1xuICAgIHdpZHRoOiBudW1iZXIgPSAxO1xuICAgIGhlaWdodDogbnVtYmVyID0gMTtcblxuICAgIGRpc3BsYXlfcmF0aW86IG51bWJlciA9IDE7XG5cbiAgICBkaXNwbGF5X3dpZHRoOiBudW1iZXIgPSAxO1xuICAgIGRpc3BsYXlfaGVpZ2h0OiBudW1iZXIgPSAxO1xuXG4gICAgYmFja2VuZDogR0ZYQmFja2VuZCA9IEdGWEJhY2tlbmQuV2ViR0w7XG4gICAgZW5jb2RlcjogR0ZYRW5jb2RlcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEdGWERldmljZU9wdGlvbnMgPSB7fSkge1xuICAgICAgICBfZGV2aWNlID0gdGhpcztcbiAgICAgICAgdGhpcy5kaXNwbGF5X3JhdGlvID0gb3B0aW9ucy5kaXNwbGF5X3JhdGlvID8/IDE7XG4gICAgICAgIHRoaXMuYmFja2VuZCA9IG9wdGlvbnMuYmFja2VuZCA/PyBHRlhCYWNrZW5kLldlYkdMO1xuICAgICAgICBpZiAob3B0aW9ucy5iYWNrZW5kID09PSBHRlhCYWNrZW5kLldlYkdQVSkge1xuICAgICAgICAgICAgdGhpcy5lbmNvZGVyID0gbmV3IFdlYkdQVUVuY29kZXIob3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVuY29kZXIgPSBuZXcgV2ViR0xFbmNvZGVyKG9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5zZXRfc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgPEdQVURldmljZT4gYWN0aXZlIGJhY2tlbmQ6ICR7dGhpcy5iYWNrZW5kfWApO1xuICAgICAgICB0aGlzLmVuY29kZXIuc2V0X3ZpZXdwb3J0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY3JlYXRlX2Jsb2NrX2dsb2JhbCgpO1xuICAgIH1cblxuICAgIHNldF9zaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZGlzcGxheV93aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmRpc3BsYXlfaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIGNvbnN0IHBpeGVsX3dpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAqIHRoaXMuZGlzcGxheV9yYXRpbyk7XG4gICAgICAgIGNvbnN0IHBpeGVsX2hlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0ICogdGhpcy5kaXNwbGF5X3JhdGlvKTtcblxuICAgICAgICB0aGlzLndpZHRoID0gcGl4ZWxfd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gcGl4ZWxfaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuZW5jb2Rlci5zZXRfZGlzcGxheV9zaXplKHBpeGVsX3dpZHRoLCBwaXhlbF9oZWlnaHQpO1xuICAgICAgICB0aGlzLmVuY29kZXIuc2V0X3ZpZXdwb3J0KDAsIDAsIHBpeGVsX3dpZHRoLCBwaXhlbF9oZWlnaHQpO1xuXG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuUmVzaXplLCB7IHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdmeF9kZXZpY2VfZ2V0KCk6IEdGWERldmljZSB7XG4gICAgcmV0dXJuIF9kZXZpY2UgYXMgR0ZYRGV2aWNlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZnhfZW5jb2Rlcl9nZXQ8VCBleHRlbmRzIEdGWEVuY29kZXI+KCk6IFQge1xuICAgIHJldHVybiBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgVDtcbn1cbiIsICJleHBvcnQgdHlwZSBPcHRpb25hbDxUPiA9IFQgfCBudWxsO1xuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3I8VD4gPSBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBUO1xuZXhwb3J0IHR5cGUgU3RyaW5nTWFwPFYgPSBhbnk+ID0geyBba2V5OiBzdHJpbmddOiBWIH07XG5leHBvcnQgdHlwZSBOdW1iZXJNYXA8ViA9IGFueT4gPSB7IFtrZXk6IG51bWJlcl06IFYgfTtcbmV4cG9ydCB0eXBlIEVudW1NYXA8VCBleHRlbmRzIHN0cmluZywgVj4gPSB7IFtrZXkgaW4gVF06IFYgfTtcblxuZXhwb3J0IHR5cGUgVHlwZWRBcnJheSA9IEludDhBcnJheSB8IFVpbnQ4QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQzMkFycmF5IHwgVWludDMyQXJyYXkgfCBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc19zdHJpbmcob2JqOiBhbnkpOiBvYmogaXMgc3RyaW5nIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycgfHwgb2JqIGluc3RhbmNlb2YgU3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNfbnVtYmVyKG9iajogYW55KTogb2JqIGlzIG51bWJlciB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdudW1iZXInICYmIGlzRmluaXRlKG9iaik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNfc3VmZml4KGlucHV0OiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nW10pOiBzdHJpbmcgfCBmYWxzZSB7XG4gICAgY29uc3QgbmFtZSA9IGlucHV0LnNwbGl0KC9cXC4vZykucG9wKCk7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHN1ZmZpeC5pbmRleE9mKG5hbWUpICE9PSAtMSA/IG5hbWUgOiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRfdmFsdWU8VD4odmFsdWU6IFQgfCB1bmRlZmluZWQsIGRlZmF1bHRfdmFsdWU6IFQpOiBUIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRfdmFsdWUgOiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlcmVmPFQgZXh0ZW5kcyBvYmplY3Q+KHJlZjogV2Vha1JlZjxUPik6IFQgfCB1bmRlZmluZWQge1xuICAgIGlmIChyZWYgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVmLmRlcmVmKCk7XG59XG4iLCAiZXhwb3J0IGVudW0gV29ya2VyU3RhdGUge1xuICAgIElkbGUsXG4gICAgUnVubmluZyxcbn1cblxuZXhwb3J0IHR5cGUgV29ya2VyTWVzc2FnZSA9IHsgdGFza19pZDogbnVtYmVyIH0gJiBhbnk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2VyUmVzcG9uc2Uge1xuICAgIHRhc2tfaWQ6IG51bWJlcjtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBkYXRhOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2VyUmVxdWVzdCB7XG4gICAgbWVzc2FnZTogYW55O1xuICAgIGJ1ZmZlcnM/OiBBcnJheUJ1ZmZlcltdO1xuICAgIGNhbGxiYWNrPzogYW55O1xufVxuXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyIHtcbiAgICBwcml2YXRlIHN0YXRlID0gV29ya2VyU3RhdGUuSWRsZTtcbiAgICBwcml2YXRlIHF1ZXVlOiBXb3JrZXJSZXF1ZXN0W10gPSBbXTtcbiAgICBwdWJsaWMgd29ya2VyX25hbWU6IHN0cmluZyA9ICdhbm9ueW1vdXMnO1xuICAgIHByaXZhdGUgdGFza19pZCA9IDA7XG5cbiAgICBwcml2YXRlIGNhbGxiYWNrcyA9IG5ldyBNYXA8bnVtYmVyLCBGdW5jdGlvbj4oKTtcblxuICAgIGdldCBhdmFpbGFibGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBXb3JrZXJTdGF0ZS5JZGxlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgd29ya2VyOiBXb3JrZXIsIHByaXZhdGUgYXV0b190ZXJtaW5hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSB0aGlzLm9ubWVzc2FnZTtcbiAgICB9XG5cbiAgICBzZW5kKG1lc3NhZ2U6IFdvcmtlck1lc3NhZ2UsIGJ1ZmZlcnM/OiBBcnJheUJ1ZmZlcltdLCBjYWxsYmFjaz86IChkYXRhOiBhbnkpID0+IHZvaWQpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgdGFza19pZCA9IHRoaXMudGFza19pZCsrO1xuICAgICAgICBtZXNzYWdlLnRhc2tfaWQgPSB0YXNrX2lkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSAhPT0gV29ya2VyU3RhdGUuSWRsZSkge1xuICAgICAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHsgbWVzc2FnZSwgYnVmZmVycywgY2FsbGJhY2sgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UobWVzc2FnZSwgYnVmZmVycyEpO1xuICAgICAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSB0aGlzLm9ubWVzc2FnZTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB0aGlzLmNhbGxiYWNrcy5zZXQodGFza19pZCwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBzZW5kX2FzeW5jPFQ+KG1lc3NhZ2U6IFdvcmtlck1lc3NhZ2UsIGJ1ZmZlcnM6IEFycmF5QnVmZmVyW10gPSBbXSk6IFByb21pc2U8VD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2VuZChtZXNzYWdlLCBidWZmZXJzLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25fcmVzcG9uc2U/OiAocmVzcG9uc2U6IFdvcmtlclJlc3BvbnNlKSA9PiB2b2lkO1xuXG4gICAgcHJpdmF0ZSBvbm1lc3NhZ2UgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgICB0aGlzLnN0YXRlID0gV29ya2VyU3RhdGUuSWRsZTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBldmVudC5kYXRhIGFzIFdvcmtlclJlc3BvbnNlO1xuICAgICAgICBjb25zdCB7IHRhc2tfaWQgfSA9IHJlc3BvbnNlO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYDxXZWJXb3JrZXI+IGVycm9yOiAke3Jlc3BvbnNlLm1lc3NhZ2UgfHwgJ3VuZGVmaW5lZCB3b3JrZXIgZXJyb3InfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYDxXZWJXb3JrZXI+IHdvcmtlciAke3RoaXMud29ya2VyX25hbWV9IGV4ZWN1dGUgc3VjY2Vzcy5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vbl9yZXNwb25zZSkgdGhpcy5vbl9yZXNwb25zZShyZXNwb25zZSk7XG4gICAgICAgIGlmICh0YXNrX2lkICE9PSB1bmRlZmluZWQgJiYgdGhpcy5jYWxsYmFja3MuaGFzKHRhc2tfaWQpKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tzLmdldCh0YXNrX2lkKSE7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcykgY2FsbGJhY2socmVzcG9uc2UuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5kZWxldGUodGFza19pZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMucXVldWUuc2hpZnQoKSE7XG4gICAgICAgICAgICB0aGlzLnNlbmQocmVxdWVzdC5tZXNzYWdlLCByZXF1ZXN0LmJ1ZmZlcnMsIHJlcXVlc3QuY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXV0b190ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG4iLCAiaW1wb3J0IHsgaXNfc3RyaW5nLCBUeXBlZEFycmF5IH0gZnJvbSAnLi4vc3RkL3R5cGUnO1xuaW1wb3J0IHsgV2ViR0xUZXh0dXJlRGVzY3JpcHRvciB9IGZyb20gJy4uL3dlYmdsL3RleHR1cmUnO1xuaW1wb3J0IHsgV2ViV29ya2VyIH0gZnJvbSAnLi4vd29ya2VyL3dlYl93b3JrZXInO1xuaW1wb3J0IHsgR0ZYQmFja2VuZCwgR0ZYRGV2aWNlT3B0aW9ucyB9IGZyb20gJy4vZ2Z4X2RldmljZSc7XG5pbXBvcnQgeyBSQ3JlYXRlRGV2aWNlLCBSRGV2aWNlUmVzaXplLCBSZW5kZXJDb21tYW5kVHlwZSB9IGZyb20gJy4vcmVuZGVyLmNvbW1hbmQnO1xuXG5leHBvcnQgY2xhc3MgR0ZYRGV2aWNlQ2xpZW50IHtcbiAgICBwcml2YXRlIHJlc291cmNlX2lkID0gMDtcbiAgICBwcml2YXRlIGdldF9yZXNvdXJjZV9pZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzb3VyY2VfaWQrKztcbiAgICB9XG4gICAgcHJpdmF0ZSByZW5kZXJfdGhyZWFkOiBXZWJXb3JrZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgYmFja2VuZDogR0ZYQmFja2VuZCkge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKGJhY2tlbmQgYXMgc3RyaW5nLCB7IG5hbWU6ICdSZW5kZXJUaHJlYWQnIH0pO1xuICAgICAgICB0aGlzLnJlbmRlcl90aHJlYWQgPSBuZXcgV2ViV29ya2VyKHdvcmtlcik7XG4gICAgfVxuXG4gICAgY3JlYXRlX2RldmljZShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBvcHRpb25zOiBHRlhEZXZpY2VPcHRpb25zKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgb2Zmc2NyZWVuX2NhbnZhcyA9IGNhbnZhcy50cmFuc2ZlckNvbnRyb2xUb09mZnNjcmVlbigpO1xuICAgICAgICBjb25zdCByZXNvdXJjZV9pZCA9IHRoaXMuZ2V0X3Jlc291cmNlX2lkKCk7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB7IHJlc291cmNlX2lkLCB0eXBlOiBSZW5kZXJDb21tYW5kVHlwZS5DcmVhdGVEZXZpY2UsIGNhbnZhczogb2Zmc2NyZWVuX2NhbnZhcywgb3B0aW9ucyB9IGFzIFJDcmVhdGVEZXZpY2U7XG4gICAgICAgIHRoaXMucmVuZGVyX3RocmVhZC5zZW5kKGNvbW1hbmQsIFtvZmZzY3JlZW5fY2FudmFzIGFzIGFueV0pO1xuICAgICAgICByZXR1cm4gcmVzb3VyY2VfaWQ7XG4gICAgfVxuXG4gICAgY3JlYXRlX3RleHR1cmUoZGVzY3JpcHRvcjogV2ViR0xUZXh0dXJlRGVzY3JpcHRvcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlX2lkID0gdGhpcy5nZXRfcmVzb3VyY2VfaWQoKTtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IHsgcmVzb3VyY2VfaWQsIHR5cGU6IFJlbmRlckNvbW1hbmRUeXBlLkNyZWF0ZVRleHR1cmUsIGRlc2NyaXB0b3IgfTtcbiAgICAgICAgY29uc3QgYnVmZmVycyA9IHRleHR1cmVfZGVzY3JpcHRvcl9jb2xsZWN0X2J1ZmZlcihkZXNjcmlwdG9yKTtcbiAgICAgICAgdGhpcy5yZW5kZXJfdGhyZWFkLnNlbmQoY29tbWFuZCwgYnVmZmVycyk7XG4gICAgICAgIHJldHVybiByZXNvdXJjZV9pZDtcbiAgICB9XG5cbiAgICB1cGRhdGVfdGV4dHVyZShyZXNvdXJjZV9pZDogbnVtYmVyKSB7fVxuXG4gICAgcmVzaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBwaXhlbF93aWR0aDogbnVtYmVyLCBwaXhlbF9oZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0eXBlID0gUmVuZGVyQ29tbWFuZFR5cGUuRGV2aWNlUmVzaXplO1xuICAgICAgICBjb25zdCBjb21tYW5kID0geyB0eXBlLCB3aWR0aCwgaGVpZ2h0LCBwaXhlbF93aWR0aCwgcGl4ZWxfaGVpZ2h0IH0gYXMgUkRldmljZVJlc2l6ZTtcbiAgICAgICAgdGhpcy5yZW5kZXJfdGhyZWFkLnNlbmQoY29tbWFuZCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0ZXh0dXJlX2Rlc2NyaXB0b3JfY29sbGVjdF9idWZmZXIoZGVzY3JpcHRvcjogV2ViR0xUZXh0dXJlRGVzY3JpcHRvcik6IEFycmF5QnVmZmVyW10ge1xuICAgIGNvbnN0IHsgc291cmNlLCBtaXBtYXBzIH0gPSBkZXNjcmlwdG9yO1xuICAgIGNvbnN0IGJ1ZmZlcnM6IEFycmF5QnVmZmVyW10gPSBbXTtcbiAgICBjb25zdCBidWZmZXJfc2V0ID0gbmV3IFNldCgpO1xuXG4gICAgaWYgKHNvdXJjZSAmJiAhaXNfc3RyaW5nKHNvdXJjZSkpIHtcbiAgICAgICAgYnVmZmVycy5wdXNoKChzb3VyY2UgYXMgVHlwZWRBcnJheSkuYnVmZmVyKTtcbiAgICAgICAgYnVmZmVyX3NldC5hZGQoKHNvdXJjZSBhcyBUeXBlZEFycmF5KS5idWZmZXIpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgbWlwbWFwIG9mIG1pcG1hcHMpIHtcbiAgICAgICAgaWYgKG1pcG1hcCAmJiAhaXNfc3RyaW5nKG1pcG1hcCkgJiYgIWJ1ZmZlcl9zZXQuaGFzKG1pcG1hcC5kYXRhLmJ1ZmZlcikpIHtcbiAgICAgICAgICAgIGJ1ZmZlcnMucHVzaChtaXBtYXAuZGF0YS5idWZmZXIpO1xuICAgICAgICAgICAgYnVmZmVyX3NldC5hZGQobWlwbWFwLmRhdGEuYnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBidWZmZXJzO1xufVxuIiwgImltcG9ydCB7IEJ1ZmZlclJhbmdlLCBGbGV4QnVmZmVyVmlldyB9IGZyb20gJy4uL2FkdCc7XG5pbXBvcnQgeyBCbG9ja0FsbG9jYXRvciB9IGZyb20gJy4uL2FkdC9ibG9ja19hbGxvY2F0b3InO1xuaW1wb3J0IHsgZ2Z4X2RldmljZV9nZXQgfSBmcm9tICcuLi9nZngnO1xuaW1wb3J0IHsgV2ViR0xFbmNvZGVyIH0gZnJvbSAnLi9lbmNvZGVyJztcbmltcG9ydCB7IFBpcGVsaW5lLCBTdHJ1Y3RVbmlmb3JtIH0gZnJvbSAnLi9waXBlbGluZSc7XG5cbmV4cG9ydCBlbnVtIFJlbmRlckJsb2NrVHlwZSB7XG4gICAgRnJhbWUgPSAwLFxuICAgIE9iamVjdCxcbiAgICBNYXRlcmlhbFxufVxuXG5leHBvcnQgZW51bSBSZW5kZXJCbG9ja05hbWUge1xuICAgIEZyYW1lID0gJ2ZyYW1lX2Jsb2NrJyxcbiAgICBPYmplY3QgPSAnb2JqZWN0X2Jsb2NrJyxcbiAgICBNYXRlcmlhbCA9ICdtYXRlcmlhbF9ibG9jaydcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJCbG9jayB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHR5cGU6IFJlbmRlckJsb2NrVHlwZTtcbiAgICByYW5nZTogQnVmZmVyUmFuZ2U7XG4gICAgdmlldzogRmxleEJ1ZmZlclZpZXc7XG59XG5cblxuaW50ZXJmYWNlIFR5cGVkQmxvY2sge1xuICAgIGJ1ZmZlcjogV2ViR0xCdWZmZXI7XG4gICAgZGF0YTogRmxleEJ1ZmZlclZpZXc7XG4gICAgYWxsb2NhdG9yOiBCbG9ja0FsbG9jYXRvcjtcbn1cblxuaW50ZXJmYWNlIEJsb2NrQ29udGV4dCB7XG4gICAgYmxvY2tzOiBNYXA8UmVuZGVyQmxvY2tUeXBlLCBUeXBlZEJsb2NrPjtcbn1cblxuY29uc3QgQkxPQ0tfTUlOT1JfQlVGRkVSX1NJWkUgPSA0ICogMTAyNDtcbmNvbnN0IEJMT0NLX01BSk9SX0JVRkZFUl9TSVpFID0gMTYgKiAxMDI0O1xuXG5leHBvcnQgY29uc3QgQkxPQ0tfU0laRV9PQkpFQ1QgPSA2NDtcblxubGV0IGJsb2NrX2NvbnRleHQ6IEJsb2NrQ29udGV4dCB8IHVuZGVmaW5lZDtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfYmxvY2tfZ2xvYmFsKCkge1xuICAgIGNvbnN0IGRldmljZSA9IGdmeF9kZXZpY2VfZ2V0KCkuZW5jb2RlciBhcyBXZWJHTEVuY29kZXI7XG4gICAgY29uc3QgZ2wgPSBkZXZpY2UuZ2whO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlX3VuZm9ybV9idWZmZXIoc2l6ZTogbnVtYmVyKTogV2ViR0xCdWZmZXIge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgc2l6ZSwgZ2wuRFlOQU1JQ19EUkFXKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7XG4gICAgICAgIHJldHVybiBidWZmZXIhO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8UmVuZGVyQmxvY2tUeXBlLCBUeXBlZEJsb2NrPigpO1xuICAgIGNvbnN0IGJsb2NrX3N0cmlkZSA9IGRldmljZS5VTklGT1JNX0JVRkZFUl9BTElHTk1FTlQ7XG5cbiAgICBjb25zdCBmcmFtZV9ibG9jayA9IHtcbiAgICAgICAgYnVmZmVyOiBjcmVhdGVfdW5mb3JtX2J1ZmZlcihCTE9DS19NSU5PUl9CVUZGRVJfU0laRSksXG4gICAgICAgIGRhdGE6IG5ldyBGbGV4QnVmZmVyVmlldyhuZXcgQXJyYXlCdWZmZXIoQkxPQ0tfTUlOT1JfQlVGRkVSX1NJWkUpKSxcbiAgICAgICAgYWxsb2NhdG9yOiBuZXcgQmxvY2tBbGxvY2F0b3IoYmxvY2tfc3RyaWRlKSxcbiAgICB9XG4gICAgbWFwLnNldChSZW5kZXJCbG9ja1R5cGUuRnJhbWUsIGZyYW1lX2Jsb2NrKTtcblxuICAgIGNvbnN0IG9iamVjdF9ibG9jayA9IHtcbiAgICAgICAgYnVmZmVyOiBjcmVhdGVfdW5mb3JtX2J1ZmZlcihCTE9DS19NSU5PUl9CVUZGRVJfU0laRSksXG4gICAgICAgIGRhdGE6IG5ldyBGbGV4QnVmZmVyVmlldyhuZXcgQXJyYXlCdWZmZXIoQkxPQ0tfTUlOT1JfQlVGRkVSX1NJWkUpKSxcbiAgICAgICAgYWxsb2NhdG9yOiBuZXcgQmxvY2tBbGxvY2F0b3IoYmxvY2tfc3RyaWRlKSxcbiAgICB9XG4gICAgbWFwLnNldChSZW5kZXJCbG9ja1R5cGUuT2JqZWN0LCBvYmplY3RfYmxvY2spO1xuXG4gICAgY29uc3QgbWF0ZXJpYWxfYmxvY2sgPSB7XG4gICAgICAgIGJ1ZmZlcjogY3JlYXRlX3VuZm9ybV9idWZmZXIoQkxPQ0tfTUFKT1JfQlVGRkVSX1NJWkUpLFxuICAgICAgICBkYXRhOiBuZXcgRmxleEJ1ZmZlclZpZXcobmV3IEFycmF5QnVmZmVyKEJMT0NLX01BSk9SX0JVRkZFUl9TSVpFKSksXG4gICAgICAgIGFsbG9jYXRvcjogbmV3IEJsb2NrQWxsb2NhdG9yKGJsb2NrX3N0cmlkZSksXG4gICAgfVxuICAgIG1hcC5zZXQoUmVuZGVyQmxvY2tUeXBlLk1hdGVyaWFsLCBtYXRlcmlhbF9ibG9jayk7XG5cbiAgICBibG9ja19jb250ZXh0ID0ge1xuICAgICAgICBibG9ja3M6IG1hcCxcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBsb2FkX2Jsb2NrX2dsb2JhbCgpIHtcbiAgICBpZiAoIWJsb2NrX2NvbnRleHQpIHRocm93ICdjcmVhdGVfYmxvY2tfZ2xvYmFsIGhhcyBub3QgYmVlbiBjYWxsZWQnO1xuICAgIGNvbnN0IGVuY29kZXIgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgIGNvbnN0IGdsID0gZW5jb2Rlci5nbDtcblxuICAgIGZvciAoY29uc3QgW18sIGJsb2NrXSBvZiBibG9ja19jb250ZXh0LmJsb2Nrcykge1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCBibG9jay5idWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJTdWJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCAwLCBibG9jay5kYXRhLnU4X3ZpZXcsIDAsIGJsb2NrLmRhdGEudThfdmlldy5ieXRlTGVuZ3RoKTtcbiAgICB9XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfYmxvY2sodHlwZTogUmVuZGVyQmxvY2tUeXBlLCBzaXplOiBudW1iZXIsIG5hbWU6IHN0cmluZyk6IFJlbmRlckJsb2NrIHtcbiAgICBpZiAoIWJsb2NrX2NvbnRleHQpIHRocm93ICdjcmVhdGVfYmxvY2tfZ2xvYmFsIGhhcyBub3QgYmVlbiBjYWxsZWQnO1xuICAgIGNvbnN0IGJsb2NrID0gYmxvY2tfY29udGV4dC5ibG9ja3MuZ2V0KHR5cGUpITtcbiAgICBjb25zdCBibG9ja19jb3VudCA9IE1hdGguY2VpbChzaXplIC8gYmxvY2suYWxsb2NhdG9yLmJsb2NrX3NpemUpO1xuICAgIGNvbnN0IHJhbmdlID0gYmxvY2tfY29udGV4dC5ibG9ja3MuZ2V0KHR5cGUpIS5hbGxvY2F0b3IuYWxsb2NhdGUoYmxvY2tfY291bnQpO1xuICAgIGNvbnN0IHZpZXcgPSBibG9ja19jb250ZXh0LmJsb2Nrcy5nZXQodHlwZSkhLmRhdGEuc3ViX3ZpZXcocmFuZ2UpO1xuICAgIHJldHVybiB7IHJhbmdlLCB0eXBlLCB2aWV3LCBuYW1lIH0gYXMgUmVuZGVyQmxvY2s7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGxvYWRfYmxvY2soYmxvY2s6IFJlbmRlckJsb2NrKSB7XG4gICAgaWYgKCFibG9ja19jb250ZXh0KSB0aHJvdyAnY3JlYXRlX2Jsb2NrX2dsb2JhbCBoYXMgbm90IGJlZW4gY2FsbGVkJztcbiAgICBpZiAoIWJsb2NrKSByZXR1cm47XG4gICAgY29uc3QgZW5jb2RlciA9IGdmeF9kZXZpY2VfZ2V0KCkuZW5jb2RlciBhcyBXZWJHTEVuY29kZXI7XG4gICAgY29uc3QgZ2wgPSBlbmNvZGVyLmdsO1xuICAgIGNvbnN0IGJsb2NrX2RhdGEgPSBibG9ja19jb250ZXh0LmJsb2Nrcy5nZXQoYmxvY2sudHlwZSkhO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIGJsb2NrX2RhdGEuYnVmZmVyKTtcbiAgICBnbC5idWZmZXJTdWJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCBibG9jay5yYW5nZS5ieXRlX29mZnNldCwgYmxvY2sudmlldy51OF92aWV3LCAwLCBibG9jay52aWV3LnU4X3ZpZXcuYnl0ZUxlbmd0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBibG9ja19iaW5kKHBpcGVsaW5lOiBQaXBlbGluZSwgYmxvY2s6IFJlbmRlckJsb2NrKSB7XG4gICAgY29uc3QgZW5jb2RlciA9IGdmeF9kZXZpY2VfZ2V0KCkuZW5jb2RlciBhcyBXZWJHTEVuY29kZXI7XG4gICAgY29uc3QgZ2wgPSBlbmNvZGVyLmdsO1xuICAgIGNvbnN0IGJsb2NrX3R5cGUgPSBibG9jay50eXBlO1xuICAgIGNvbnN0IGJsb2NrX2RhdGEgPSBibG9ja19jb250ZXh0IS5ibG9ja3MuZ2V0KGJsb2NrX3R5cGUpITtcbiAgICBjb25zdCBzdHJ1Y3RfdW5pZm9ybSA9IHBpcGVsaW5lLnVuaWZvcm1fYmxvY2tbYmxvY2submFtZV0gYXMgU3RydWN0VW5pZm9ybTtcbiAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKHBpcGVsaW5lLnByb2dyYW0sIHN0cnVjdF91bmlmb3JtLnN0cnVjdF9pbmRleCwgc3RydWN0X3VuaWZvcm0uc3RydWN0X2luZGV4KTtcbiAgICBnbC5iaW5kQnVmZmVyUmFuZ2UoZ2wuVU5JRk9STV9CVUZGRVIsIHN0cnVjdF91bmlmb3JtLnN0cnVjdF9pbmRleCwgYmxvY2tfZGF0YS5idWZmZXIsIGJsb2NrLnJhbmdlLmJ5dGVfb2Zmc2V0LCBibG9jay5yYW5nZS5ieXRlX2xlbmd0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXN0cm95X2Jsb2NrKGJsb2NrOiBSZW5kZXJCbG9jaykge1xuICAgIGlmICghYmxvY2tfY29udGV4dCkgdGhyb3cgJ2NyZWF0ZV9ibG9ja19nbG9iYWwgaGFzIG5vdCBiZWVuIGNhbGxlZCc7XG4gICAgYmxvY2tfY29udGV4dC5ibG9ja3MuZ2V0KGJsb2NrLnR5cGUpIS5hbGxvY2F0b3IuZnJlZShibG9jay5yYW5nZSk7XG59IiwgIi8vIEZpbHRlcnNcbmV4cG9ydCBlbnVtIFdlYkdMVGV4dHVyZUZpbHRlciB7fVxuZXhwb3J0IGNvbnN0IE5lYXJlc3RGaWx0ZXI6IFdlYkdMVGV4dHVyZUZpbHRlciA9IDk3Mjg7XG5leHBvcnQgY29uc3QgTmVhcmVzdE1pcG1hcE5lYXJlc3RGaWx0ZXI6IFdlYkdMVGV4dHVyZUZpbHRlciA9IDk5ODQ7XG5leHBvcnQgY29uc3QgTmVhcmVzdE1pcG1hcExpbmVhckZpbHRlcjogV2ViR0xUZXh0dXJlRmlsdGVyID0gOTk4NjtcbmV4cG9ydCBjb25zdCBMaW5lYXJGaWx0ZXI6IFdlYkdMVGV4dHVyZUZpbHRlciA9IDk3Mjk7XG5leHBvcnQgY29uc3QgTGluZWFyTWlwbWFwTmVhcmVzdEZpbHRlcjogV2ViR0xUZXh0dXJlRmlsdGVyID0gOTk4NTtcbmV4cG9ydCBjb25zdCBMaW5lYXJNaXBtYXBMaW5lYXJGaWx0ZXI6IFdlYkdMVGV4dHVyZUZpbHRlciA9IDk5ODc7XG5cbi8vV2ViR0xUZXh0dXJlV3JhcHBpbmcgbW9kZXNcbmV4cG9ydCBlbnVtIFdlYkdMVGV4dHVyZVdyYXBwaW5nIHt9XG5leHBvcnQgY29uc3QgUmVwZWF0V3JhcHBpbmc6V2ViR0xUZXh0dXJlV3JhcHBpbmcgPSAxMDQ5NztcbmV4cG9ydCBjb25zdCBDbGFtcFRvRWRnZVdyYXBwaW5nOldlYkdMVGV4dHVyZVdyYXBwaW5nID0gMzMwNzE7XG5leHBvcnQgY29uc3QgTWlycm9yZWRSZXBlYXRXcmFwcGluZzpXZWJHTFRleHR1cmVXcmFwcGluZyA9IDMzNjQ4O1xuXG4vLyBEYXRhIHR5cGVzXG5leHBvcnQgZW51bSBXZWJHTERhdGFUeXBlIHt9XG5leHBvcnQgY29uc3QgVW5zaWduZWRCeXRlVHlwZTogV2ViR0xEYXRhVHlwZSA9IDUxMjE7XG5leHBvcnQgY29uc3QgQnl0ZVR5cGU6IFdlYkdMRGF0YVR5cGUgPSA1MTIwO1xuZXhwb3J0IGNvbnN0IFNob3J0VHlwZTogV2ViR0xEYXRhVHlwZSA9IDUxMjI7XG5leHBvcnQgY29uc3QgVW5zaWduZWRTaG9ydFR5cGU6IFdlYkdMRGF0YVR5cGUgPSA1MTIzO1xuZXhwb3J0IGNvbnN0IEludFR5cGU6IFdlYkdMRGF0YVR5cGUgPSA1MTI0O1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkSW50VHlwZTogV2ViR0xEYXRhVHlwZSA9IDUxMjU7XG5leHBvcnQgY29uc3QgRmxvYXRUeXBlOiBXZWJHTERhdGFUeXBlID0gNTEyNjtcbmV4cG9ydCBjb25zdCBIYWxmRmxvYXRUeXBlOiBXZWJHTERhdGFUeXBlID0gNTEzMTtcbmV4cG9ydCBjb25zdCBVbnNpZ25lZFNob3J0NDQ0NFR5cGU6IFdlYkdMRGF0YVR5cGUgPSAzMjgxOTtcbmV4cG9ydCBjb25zdCBVbnNpZ25lZFNob3J0NTU1MVR5cGU6IFdlYkdMRGF0YVR5cGUgPSAzMjgyMDtcbmV4cG9ydCBjb25zdCBVbnNpZ25lZFNob3J0NTY1VHlwZTogV2ViR0xEYXRhVHlwZSA9IDMzNjM1O1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkSW50MjQ4VHlwZTogV2ViR0xEYXRhVHlwZSA9IDM0MDQyO1xuXG4vLyBQaXhlbCBmb3JtYXRzXG5leHBvcnQgZW51bSBXZWJHTFBpeGVsRm9ybWF0IHt9XG5leHBvcnQgY29uc3QgQWxwaGFGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSA2NDA2O1xuZXhwb3J0IGNvbnN0IFJHQkZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDY0MDc7XG5leHBvcnQgY29uc3QgUkdCQUZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDY0MDg7XG5leHBvcnQgY29uc3QgTHVtaW5hbmNlRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gNjQwOTtcbmV4cG9ydCBjb25zdCBMdW1pbmFuY2VBbHBoYUZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDY0MTA7XG4vLyBleHBvcnQgY29uc3QgUkdCRUZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDEwMjY7XG5leHBvcnQgY29uc3QgRGVwdGhGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSA2NDAyO1xuZXhwb3J0IGNvbnN0IERlcHRoU3RlbmNpbEZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDM0MDQxO1xuZXhwb3J0IGNvbnN0IERlcHRoRm9ybWF0RmxvYXQzMjogV2ViR0xQaXhlbEZvcm1hdCA9IDM2MDEyO1xuZXhwb3J0IGNvbnN0IERlcHRoRm9ybWF0MTY6IFdlYkdMUGl4ZWxGb3JtYXQgPSAzMzE4OTtcbmV4cG9ydCBjb25zdCBEZXB0aEZvcm1hdDI0OiBXZWJHTFBpeGVsRm9ybWF0ID0gMzMxOTA7XG5leHBvcnQgY29uc3QgUmVkRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gNjQwMztcbmV4cG9ydCBjb25zdCBSZWRJbnRlZ2VyRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gMzYyNDQ7XG5leHBvcnQgY29uc3QgUkdGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSAzMzMxOTtcbmV4cG9ydCBjb25zdCBSR0ludGVnZXJGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSAzMzMyMDtcbmV4cG9ydCBjb25zdCBSR0JJbnRlZ2VyRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gMzYyNDg7XG5leHBvcnQgY29uc3QgUkdCQUludGVnZXJGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSAzNjI0OTtcblxuLy8gQ29tcHJlc3NlZCB0ZXh0dXJlIGZvcm1hdHNcbi8vIEREUyAvIFNUM0MgQ29tcHJlc3NlZCB0ZXh0dXJlIGZvcm1hdHNcbmV4cG9ydCBlbnVtIFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQge31cbmV4cG9ydCBjb25zdCBSR0JfUzNUQ19EWFQxX0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDMzNzc2O1xuZXhwb3J0IGNvbnN0IFJHQkFfUzNUQ19EWFQxX0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDMzNzc3O1xuZXhwb3J0IGNvbnN0IFJHQkFfUzNUQ19EWFQzX0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDMzNzc4O1xuZXhwb3J0IGNvbnN0IFJHQkFfUzNUQ19EWFQ1X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDMzNzc5O1xuXG4vLyBQVlJUQyBjb21wcmVzc2VkICcuL3RleHR1cmUgZm9ybWF0c1xuZXhwb3J0IGNvbnN0IFJHQl9QVlJUQ180QlBQVjFfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzU4NDA7XG5leHBvcnQgY29uc3QgUkdCX1BWUlRDXzJCUFBWMV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNTg0MTtcbmV4cG9ydCBjb25zdCBSR0JBX1BWUlRDXzRCUFBWMV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNTg0MjtcbmV4cG9ydCBjb25zdCBSR0JBX1BWUlRDXzJCUFBWMV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNTg0MztcblxuLy8gRVRDIGNvbXByZXNzZWQgdGV4dHVyZSBmb3JtYXRzXG5leHBvcnQgY29uc3QgUkdCX0VUQzFfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzYxOTY7XG5cbi8vIEFTVEMgY29tcHJlc3NlZCB0ZXh0dXJlIGZvcm1hdHNcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNHg0X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODA4O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ181eDRfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MDk7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzV4NV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNzgxMDtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNng1X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODExO1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ182eDZfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MTI7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzh4NV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNzgxMztcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfOHg2X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODE0O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ184eDhfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MTU7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDVfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MTY7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDZfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MTc7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDhfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MTg7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEweDEwX0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODE5O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ18xMngxMF9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNzgyMDtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfMTJ4MTJfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MjE7XG5cbi8vIEludGVybmFsIFBpeGVsIEZvcm1hdHNcbmV4cG9ydCBlbnVtIFRleHR1cmVTdG9yZUZvcm1hdCB7fVxuZXhwb3J0IGNvbnN0IFI4OiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMzMyMTtcbmV4cG9ydCBjb25zdCBSRzg6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDMzMzIzO1xuZXhwb3J0IGNvbnN0IFIxNkY6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDMzMzI1O1xuZXhwb3J0IGNvbnN0IFIzMkY6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDMzMzI2O1xuZXhwb3J0IGNvbnN0IFIzMlVJOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAweDgyMzY7XG5leHBvcnQgY29uc3QgUkcxNkY6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDMzMzI3O1xuZXhwb3J0IGNvbnN0IFJHMzJGOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMzMyODtcbmV4cG9ydCBjb25zdCBSOFVJOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMzMzMDtcbmV4cG9ydCBjb25zdCBSR0I4OiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMjg0OTtcbmV4cG9ydCBjb25zdCBTUkdCODogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzU5MDU7XG5leHBvcnQgY29uc3QgUkdCNTY1OiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzNjE5NDtcbmV4cG9ydCBjb25zdCBSMTFGX0cxMUZfQjEwRjogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzU4OTg7XG5leHBvcnQgY29uc3QgUkdCOV9FNTogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzU5MDE7XG5leHBvcnQgY29uc3QgUkdCMTZGOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzNDg0MztcbmV4cG9ydCBjb25zdCBSR0IzMkY6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDM0ODM3O1xuZXhwb3J0IGNvbnN0IFJHQjhVSTogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzYyMjE7XG5leHBvcnQgY29uc3QgUkdCQTg6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDMyODU2O1xuZXhwb3J0IGNvbnN0IFJHQjVfQTE6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDMyODU1O1xuZXhwb3J0IGNvbnN0IFJHQkE0OiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMjg1NDtcbmV4cG9ydCBjb25zdCBSR0JBMTZGOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzNDg0MjtcbmV4cG9ydCBjb25zdCBSR0JBMzJGOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzNDgzNjtcbmV4cG9ydCBjb25zdCBSR0JBOFVJOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzNjIyMDtcbmV4cG9ydCBjb25zdCBSR0JBMzJVSTogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzYyMDg7XG5leHBvcnQgY29uc3QgUkdCMzJVSTogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzYyMDk7XG5cbi8vIFRleHR1cmUgVHlwZVxuZXhwb3J0IGVudW0gV2ViR0xUZXh0dXJlVHlwZSB7fVxuZXhwb3J0IGNvbnN0IFRFWFRVUkVfMkQ6IFdlYkdMVGV4dHVyZVR5cGUgPSAzNTUzO1xuZXhwb3J0IGNvbnN0IFRFWFRVUkVfM0Q6IFdlYkdMVGV4dHVyZVR5cGUgPSAzMjg3OTtcbmV4cG9ydCBjb25zdCBURVhUVVJFX0NVQkU6IFdlYkdMVGV4dHVyZVR5cGUgPSAzNDA2NztcbmV4cG9ydCBjb25zdCBURVhUVVJFXzJEX0FSUkFZOiBXZWJHTFRleHR1cmVUeXBlID0gMzU4NjY7XG5cbmV4cG9ydCBlbnVtIFdlYkdMQnVmZmVyVHlwZSB7fVxuZXhwb3J0IGNvbnN0IEFSUkFZX0JVRkZFUjogV2ViR0xCdWZmZXJUeXBlID0gMzQ5NjI7XG5leHBvcnQgY29uc3QgRUxFTUVOVF9BUlJBWV9CVUZGRVI6IFdlYkdMQnVmZmVyVHlwZSA9IDM0OTYzO1xuZXhwb3J0IGNvbnN0IENPUFlfUkVBRF9CVUZGRVI6IFdlYkdMQnVmZmVyVHlwZSA9IDM2NjYyO1xuZXhwb3J0IGNvbnN0IENPUFlfV1JJVEVfQlVGRkVSOiBXZWJHTEJ1ZmZlclR5cGUgPSAzNjY2MztcbmV4cG9ydCBjb25zdCBQSVhFTF9QQUNLX0JVRkZFUjogV2ViR0xCdWZmZXJUeXBlID0gMzUwNTE7IC8vIFRoZSBidWZmZXIgd2lsbCBiZSB1c2VkIGZvciByZWFkaW5nIGZyb20gV2ViR0wgdGV4dHVyZXNcbmV4cG9ydCBjb25zdCBQSVhFTF9VTlBBQ0tfQlVGRkVSOiBXZWJHTEJ1ZmZlclR5cGUgPSAzNTA1MjsgLy8gVGhlIGJ1ZmZlciB3aWxsIGJlIHVzZWQgZm9yIHdyaXRpbmcgdG8gV2ViR0wgdGV4dHVyZXNcbmV4cG9ydCBjb25zdCBVTklGT1JNX0JVRkZFUjogV2ViR0xCdWZmZXJUeXBlID0gMzUzNDU7XG5leHBvcnQgY29uc3QgVFJBTlNGT1JNX0ZFRURCQUNLX0JVRkZFUjogV2ViR0xCdWZmZXJUeXBlID0gMzU5ODI7XG5cbmV4cG9ydCBlbnVtIFdlYkdMQnVmZmVyVXNhZ2Uge31cbmV4cG9ydCBjb25zdCBTVEFUSUNfRFJBVzogV2ViR0xCdWZmZXJVc2FnZSA9IDM1MDQ0O1xuZXhwb3J0IGNvbnN0IFNUQVRJQ19SRUFEOiBXZWJHTEJ1ZmZlclVzYWdlID0gMzUwNDU7XG5leHBvcnQgY29uc3QgU1RBVElDX0NPUFk6IFdlYkdMQnVmZmVyVXNhZ2UgPSAzNTA0NjtcbmV4cG9ydCBjb25zdCBEWU5BTUlDX0RSQVc6IFdlYkdMQnVmZmVyVXNhZ2UgPSAzNTA0ODtcbmV4cG9ydCBjb25zdCBEWU5BTUlDX1JFQUQ6IFdlYkdMQnVmZmVyVXNhZ2UgPSAzNTA0OTtcbmV4cG9ydCBjb25zdCBEWU5BTUlDX0NPUFk6IFdlYkdMQnVmZmVyVXNhZ2UgPSAzNTA1MDtcbmV4cG9ydCBjb25zdCBTVFJFQU1fRFJBVzogV2ViR0xCdWZmZXJVc2FnZSA9IDM1MDQwO1xuZXhwb3J0IGNvbnN0IFNUUkVBTV9SRUFEOiBXZWJHTEJ1ZmZlclVzYWdlID0gMzUwNDE7XG5leHBvcnQgY29uc3QgU1RSRUFNX0NPUFk6IFdlYkdMQnVmZmVyVXNhZ2UgPSAzNTA0MjsiLCAiaW1wb3J0IHsgR1BVU3RvcmFnZU1vZGUsIGdmeF9kZXZpY2VfZ2V0IH0gZnJvbSAnLi4vZ2Z4L2dmeF9kZXZpY2UnO1xuaW1wb3J0IHsgQm94MyB9IGZyb20gJy4uL21hdGgvYm94JztcbmltcG9ydCB7IFRhbmdlbnRHZW5lcmF0b3IgfSBmcm9tICcuLi9tYXRoL3RhbmdlbnQnO1xuaW1wb3J0IHsgU3RyaW5nTWFwLCBUeXBlZEFycmF5LCBkZWZhdWx0X3ZhbHVlIH0gZnJvbSAnLi4vc3RkL3R5cGUnO1xuaW1wb3J0IHsgV2ViR0xFbmNvZGVyIH0gZnJvbSAnLi9lbmNvZGVyJztcbmltcG9ydCB7IFByaW1pdGl2ZVR5cGUsIFVuaWZvcm1WYWx1ZSB9IGZyb20gJy4vcGlwZWxpbmUnO1xuaW1wb3J0IHsgQXR0cmlidXRlLCBHTEF0dHJpYnV0ZSwgSW5kZXhSYW5nZSwgUHJpbWl0aXZlLCBwcmltaXRpdmVfY29tcHV0ZV9ib3gsIHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlIH0gZnJvbSAnLi9wcmltaXRpdmUnO1xuaW1wb3J0IHsgQnl0ZVR5cGUsIEZsb2F0VHlwZSwgSGFsZkZsb2F0VHlwZSwgSW50VHlwZSwgU2hvcnRUeXBlLCBVbnNpZ25lZEJ5dGVUeXBlLCBVbnNpZ25lZEludFR5cGUsIFVuc2lnbmVkU2hvcnRUeXBlLCBXZWJHTEJ1ZmZlclVzYWdlLCBXZWJHTERhdGFUeXBlIH0gZnJvbSAnLi90eXBlJztcblxuZXhwb3J0IGludGVyZmFjZSBXZWJHTERyYXdEZXNjcmlwdG9yIHtcbiAgICBwcmltaXRpdmU6IFByaW1pdGl2ZTtcblxuICAgIHVuaWZvcm1zOiBTdHJpbmdNYXA8VW5pZm9ybVZhbHVlPjtcbiAgICB0eXBlOiBQcmltaXRpdmVUeXBlO1xuICAgIHJhbmdlOiBJbmRleFJhbmdlO1xuXG4gICAgLy8gaW5zdGFuY2luZ1xuICAgIGluc3RhbmNlX2F0dHJpYnV0ZXM/OiBBdHRyaWJ1dGVbXTtcbiAgICBmb3JjZV91cGRhdGU6IFNldDxzdHJpbmc+O1xuXG4gICAgc3RvcmFnZV9tb2RlOiBHUFVTdG9yYWdlTW9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXZWJHTERyYXcge1xuICAgIHByaW1pdGl2ZTogUHJpbWl0aXZlO1xuXG4gICAgd2ViZ2xfdmFvOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0O1xuICAgIGF0dHJpYnV0ZXM6IEdMQXR0cmlidXRlW107XG4gICAgYXR0cmlidXRlX21hcDogU3RyaW5nTWFwPEdMQXR0cmlidXRlPjtcbiAgICBib3g6IEJveDM7XG4gICAgaW5kZXhfYnVmZmVyOiBXZWJHTEJ1ZmZlciB8IG51bGw7XG4gICAgaW5kZXhlZDogYm9vbGVhbjtcbiAgICB0eXBlOiBQcmltaXRpdmVUeXBlO1xuXG4gICAgcmFuZ2U6IEluZGV4UmFuZ2U7XG4gICAgbWF4X3ZlcnRleF9jb3VudDogbnVtYmVyO1xuXG4gICAgdW5pZm9ybXM6IFN0cmluZ01hcDxVbmlmb3JtVmFsdWU+O1xuICAgIGZvcmNlX3VwZGF0ZTogU2V0PHN0cmluZz47XG5cbiAgICBzdG9yYWdlX21vZGU6IEdQVVN0b3JhZ2VNb2RlO1xufVxuXG5jb25zdCBkZWZhdWx0X2F0dHJpYnV0ZV9zbG90OiBTdHJpbmdNYXA8bnVtYmVyPiA9IHtcbiAgICBwb3NpdGlvbjogMCxcbiAgICB1djogMSxcbiAgICBub3JtYWw6IDIsXG4gICAgdGFuZ2VudDogMyxcbiAgICBjb2xvcjogNCxcbiAgICBza2luOiA1LFxuICAgIHdlaWdodDogNixcbiAgICB1djI6IDcsXG59O1xuY29uc3QgZGVmYXVsdF9tYXhfc2xvdCA9IDQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZ2xfYnVmZmVyX3R5cGUoYnVmZmVyOiBUeXBlZEFycmF5KTogV2ViR0xEYXRhVHlwZSB7XG4gICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgICByZXR1cm4gRmxvYXRUeXBlO1xuICAgIH0gZWxzZSBpZiAoYnVmZmVyIGluc3RhbmNlb2YgSW50MTZBcnJheSkge1xuICAgICAgICByZXR1cm4gU2hvcnRUeXBlO1xuICAgIH0gZWxzZSBpZiAoYnVmZmVyIGluc3RhbmNlb2YgSW50MzJBcnJheSkge1xuICAgICAgICByZXR1cm4gSW50VHlwZTtcbiAgICB9IGVsc2UgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEludDhBcnJheSkge1xuICAgICAgICByZXR1cm4gQnl0ZVR5cGU7XG4gICAgfSBlbHNlIGlmIChidWZmZXIgaW5zdGFuY2VvZiBVaW50MTZBcnJheSkge1xuICAgICAgICByZXR1cm4gVW5zaWduZWRTaG9ydFR5cGU7XG4gICAgfSBlbHNlIGlmIChidWZmZXIgaW5zdGFuY2VvZiBVaW50MzJBcnJheSkge1xuICAgICAgICByZXR1cm4gVW5zaWduZWRJbnRUeXBlO1xuICAgIH0gZWxzZSBpZiAoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICByZXR1cm4gVW5zaWduZWRCeXRlVHlwZTtcbiAgICB9XG4gICAgdGhyb3cgYGludmFsaWQgYnVmZmVyIHR5cGUgJHt0eXBlb2YgYnVmZmVyfS5gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlX2RyYXcoZGVzY3JpcHRvcjogUGFydGlhbDxXZWJHTERyYXdEZXNjcmlwdG9yPik6IFdlYkdMRHJhdyB7XG4gICAgbGV0IHdlYmdsX3ZhbzogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdDtcbiAgICBsZXQgaW5kZXhlZCA9IGZhbHNlO1xuICAgIGxldCBtYXhfdmVydGV4X2NvdW50ID0gMDtcbiAgICBsZXQgZHluYW1pYyA9IGZhbHNlO1xuICAgIGNvbnN0IGVuY29kZXIgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgIGNvbnN0IGdsID0gZW5jb2Rlci5nbDtcblxuICAgIGNvbnN0IHByaW1pdGl2ZSA9IGRlc2NyaXB0b3IucHJpbWl0aXZlO1xuICAgIGlmICghcHJpbWl0aXZlKSB0aHJvdyAnRmF0YWwgZXJyb3IsIGNyZWF0ZSBkcmF3IHdpdGhvdXQgcHJpbWl0aXZlJztcblxuICAgIGNvbnN0IHR5cGUgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IudHlwZSwgNCk7XG4gICAgY29uc3QgdW5pZm9ybXMgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IudW5pZm9ybXMsIHt9KTtcbiAgICBjb25zdCBmb3JjZV91cGRhdGUgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IuZm9yY2VfdXBkYXRlLCBuZXcgU2V0KCkpO1xuICAgIGNvbnN0IHN0b3JhZ2VfbW9kZSA9IGRlZmF1bHRfdmFsdWUoZGVzY3JpcHRvci5zdG9yYWdlX21vZGUsIEdQVVN0b3JhZ2VNb2RlLkdQVU9ubHkpO1xuXG4gICAgY29uc3QgYm94ID0gcHJpbWl0aXZlX2NvbXB1dGVfYm94KHByaW1pdGl2ZSk7XG4gICAgaWYgKHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlKHByaW1pdGl2ZSwgJ3RhbmdlbnQnKSkgVGFuZ2VudEdlbmVyYXRvci5nZW5lcmF0ZShwcmltaXRpdmUpO1xuXG4gICAgd2ViZ2xfdmFvID0gZ2wuY3JlYXRlVmVydGV4QXJyYXkoKSE7XG4gICAgZ2wuYmluZFZlcnRleEFycmF5KHdlYmdsX3Zhbyk7XG5cbiAgICBjb25zdCBhdHRyaWJ1dGVfbWFwOiBTdHJpbmdNYXA8R0xBdHRyaWJ1dGU+ID0ge307XG4gICAgY29uc3QgYXR0cmlidXRlczogR0xBdHRyaWJ1dGVbXSA9IFtdO1xuICAgIGxldCBtYXhfdmVydGV4X3Nsb3QgPSBkZWZhdWx0X21heF9zbG90O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJpbWl0aXZlLmF0dHJpYnV0ZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgYXR0ciA9IHByaW1pdGl2ZS5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICBpZiAoYXR0ci5uYW1lID09PSAnZ2VuZXJpYycpIGNvbnRpbnVlO1xuXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBpZiAoYnVmZmVyID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ1dlYkdMIEJ1ZmZlciBDcmVhdGUgRmFpbGVkLicpO1xuXG4gICAgICAgIGxldCB1c2FnZTogV2ViR0xCdWZmZXJVc2FnZSA9IGdsLlNUQVRJQ19EUkFXO1xuICAgICAgICBpZiAoYXR0ci5keW5hbWljKSB7XG4gICAgICAgICAgICB1c2FnZSA9IGdsLkRZTkFNSUNfRFJBVztcbiAgICAgICAgICAgIGR5bmFtaWMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBnZXRfZ2xfYnVmZmVyX3R5cGUoYXR0ci5idWZmZXIpO1xuICAgICAgICBjb25zdCBzdHJpZGUgPSBhdHRyLnN0cmlkZTtcblxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGF0dHIuYnVmZmVyLCB1c2FnZSk7XG5cbiAgICAgICAgbGV0IHNsb3QgPSBhdHRyLnNsb3QgIT09IHVuZGVmaW5lZCA/IGF0dHIuc2xvdCA6IGRlZmF1bHRfYXR0cmlidXRlX3Nsb3RbYXR0ci5uYW1lIHx8ICdwb3NpdGlvbiddO1xuICAgICAgICBzbG90ID0gc2xvdCAhPT0gdW5kZWZpbmVkID8gc2xvdCA6IG1heF92ZXJ0ZXhfc2xvdCsrO1xuXG4gICAgICAgIGlmICh0eXBlID09PSBGbG9hdFR5cGUgfHwgdHlwZSA9PT0gSGFsZkZsb2F0VHlwZSkge1xuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzbG90IGFzIG51bWJlciwgYXR0ci5zdHJpZGUsIHR5cGUsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYklQb2ludGVyKHNsb3QgYXMgbnVtYmVyLCBhdHRyLnN0cmlkZSwgdHlwZSwgMCwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0ge1xuICAgICAgICAgICAgc3RyaWRlLFxuICAgICAgICAgICAgYnVmZmVyLFxuICAgICAgICAgICAgbmFtZTogYXR0ci5uYW1lIHx8ICdwb3NpdGlvbicsXG4gICAgICAgICAgICBkeW5hbWljLFxuICAgICAgICAgICAgc291cmNlX2J1ZmZlcjogZHluYW1pYyA/IGF0dHIuYnVmZmVyIDogdW5kZWZpbmVkLFxuICAgICAgICB9IGFzIEdMQXR0cmlidXRlO1xuICAgICAgICBhdHRyaWJ1dGVzLnB1c2goYXR0cmlidXRlKTtcbiAgICAgICAgYXR0cmlidXRlX21hcFthdHRyaWJ1dGUubmFtZV0gPSBhdHRyaWJ1dGU7XG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNsb3QgYXMgbnVtYmVyKTtcbiAgICAgICAgaWYgKGF0dHIubmFtZSA9PT0gJ3Bvc2l0aW9uJykge1xuICAgICAgICAgICAgbWF4X3ZlcnRleF9jb3VudCA9IGF0dHIuYnVmZmVyLmxlbmd0aCAvIHN0cmlkZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCBpbmRleF9idWZmZXI6IFdlYkdMQnVmZmVyIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKHByaW1pdGl2ZS5pbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGluZGV4X2J1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleF9idWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBwcmltaXRpdmUuaW5kZXgsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgbWF4X3ZlcnRleF9jb3VudCA9IHByaW1pdGl2ZS5pbmRleC5sZW5ndGg7XG4gICAgICAgIGluZGV4ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHJhbmdlID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLnJhbmdlLCB7IHN0YXJ0OiAwLCBjb3VudDogbWF4X3ZlcnRleF9jb3VudCB9KTtcblxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB3ZWJnbF92YW8sXG4gICAgICAgIGluZGV4ZWQsXG4gICAgICAgIG1heF92ZXJ0ZXhfY291bnQsXG4gICAgICAgIHByaW1pdGl2ZSxcbiAgICAgICAgYm94LFxuICAgICAgICBhdHRyaWJ1dGVzLFxuICAgICAgICBhdHRyaWJ1dGVfbWFwLFxuICAgICAgICBpbmRleF9idWZmZXIsXG5cbiAgICAgICAgdHlwZSxcbiAgICAgICAgcmFuZ2UsXG5cbiAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgIGZvcmNlX3VwZGF0ZSxcbiAgICAgICAgc3RvcmFnZV9tb2RlLFxuICAgIH0gYXMgV2ViR0xEcmF3OyBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9kcmF3KGRyYXc6IFdlYkdMRHJhdywgcHJpbWl0aXZlOiBQcmltaXRpdmUpOiB2b2lkIHtcbiAgICBjb25zdCBlbmNvZGVyID0gZ2Z4X2RldmljZV9nZXQoKS5lbmNvZGVyIGFzIFdlYkdMRW5jb2RlcjtcbiAgICBjb25zdCBnbCA9IGVuY29kZXIuZ2w7XG5cbiAgICBsZXQgbWF4X3ZlcnRleF9jb3VudCA9IDA7XG4gICAgaWYgKCFkcmF3LmF0dHJpYnV0ZV9tYXAgfHwgIWRyYXcuYXR0cmlidXRlcykgcmV0dXJuO1xuXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KGRyYXcud2ViZ2xfdmFvISk7XG5cbiAgICBsZXQgbWF4X3ZlcnRleF9zbG90ID0gZGVmYXVsdF9tYXhfc2xvdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByaW1pdGl2ZS5hdHRyaWJ1dGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGF0dHIgPSBwcmltaXRpdmUuYXR0cmlidXRlc1tpXTtcbiAgICAgICAgY29uc3QgZ2xfYXR0ciA9IGRyYXcuYXR0cmlidXRlX21hcFthdHRyLm5hbWUgfHwgJ3Bvc2l0aW9uJ107XG5cbiAgICAgICAgaWYgKCFnbF9hdHRyKSBjb250aW51ZTtcblxuICAgICAgICBjb25zdCB1c2FnZSA9IGF0dHIuZHluYW1pYyA9PT0gdHJ1ZSA/IGdsLlNUUkVBTV9EUkFXIDogZ2wuU1RBVElDX0RSQVc7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBnZXRfZ2xfYnVmZmVyX3R5cGUoYXR0ci5idWZmZXIpO1xuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBnbF9hdHRyLmJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBhdHRyLmJ1ZmZlciwgdXNhZ2UpO1xuXG4gICAgICAgIGxldCBzbG90ID0gYXR0ci5zbG90ICE9PSB1bmRlZmluZWQgPyBhdHRyLnNsb3QgOiBkZWZhdWx0X2F0dHJpYnV0ZV9zbG90W2F0dHIubmFtZSB8fCAncG9zaXRpb24nXTtcbiAgICAgICAgc2xvdCA9IHNsb3QgIT09IHVuZGVmaW5lZCA/IHNsb3QgOiBtYXhfdmVydGV4X3Nsb3QrKztcblxuICAgICAgICBpZiAodHlwZSA9PT0gRmxvYXRUeXBlIHx8IHR5cGUgPT09IEhhbGZGbG9hdFR5cGUpIHtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2xvdCBhcyBudW1iZXIsIGF0dHIuc3RyaWRlLCB0eXBlLCBmYWxzZSwgMCwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJJUG9pbnRlcihzbG90IGFzIG51bWJlciwgYXR0ci5zdHJpZGUsIHR5cGUsIDAsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2xvdCBhcyBudW1iZXIpO1xuXG4gICAgICAgIGlmIChhdHRyLm5hbWUgPT09ICdwb3NpdGlvbicpIHtcbiAgICAgICAgICAgIG1heF92ZXJ0ZXhfY291bnQgPSBhdHRyLmJ1ZmZlci5sZW5ndGggLyBhdHRyLnN0cmlkZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcmltaXRpdmUuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBkcmF3LmluZGV4X2J1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHByaW1pdGl2ZS5pbmRleCwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICBtYXhfdmVydGV4X2NvdW50ID0gcHJpbWl0aXZlLmluZGV4Lmxlbmd0aDtcbiAgICAgICAgZHJhdy5pbmRleGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgZHJhdy5tYXhfdmVydGV4X2NvdW50ID0gbWF4X3ZlcnRleF9jb3VudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYXdfdXBkYXRlKGRyYXc6IFdlYkdMRHJhdyk6IHZvaWQge1xuICAgIGNvbnN0IGVuY29kZXIgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgIGNvbnN0IGdsID0gZW5jb2Rlci5nbDtcblxuICAgIGlmICghZHJhdy5hdHRyaWJ1dGVfbWFwIHx8ICFkcmF3LmF0dHJpYnV0ZXMpIHJldHVybjtcblxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShkcmF3LndlYmdsX3ZhbyEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZHJhdy5hdHRyaWJ1dGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGF0dHIgPSBkcmF3LmF0dHJpYnV0ZXNbaV07XG4gICAgICAgIGlmICghYXR0ci5keW5hbWljKSBjb250aW51ZTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGF0dHIuYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyU3ViRGF0YShnbC5BUlJBWV9CVUZGRVIsIDAsIGF0dHIuc291cmNlX2J1ZmZlciEsIDAsIGF0dHIudXBkYXRlX2xlbmd0aCA/PyBhdHRyIS5zb3VyY2VfYnVmZmVyIS5sZW5ndGgpO1xuICAgIH1cbiAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3X2Rlc3Ryb3koZHJhdzogV2ViR0xEcmF3KTogdm9pZCB7XG4gICAgY29uc3QgZW5jb2RlciA9IGdmeF9kZXZpY2VfZ2V0KCkuZW5jb2RlciBhcyBXZWJHTEVuY29kZXI7XG4gICAgY29uc3QgZ2wgPSBlbmNvZGVyLmdsO1xuXG4gICAgaWYgKCFkcmF3LmF0dHJpYnV0ZXMpIHJldHVybjtcbiAgICBnbC5kZWxldGVWZXJ0ZXhBcnJheShkcmF3LndlYmdsX3ZhbyEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZHJhdy5hdHRyaWJ1dGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGF0dHIgPSBkcmF3LmF0dHJpYnV0ZXNbaV07XG4gICAgICAgIGdsLmRlbGV0ZUJ1ZmZlcihhdHRyLmJ1ZmZlcik7XG4gICAgfVxuICAgIGlmIChkcmF3LmluZGV4X2J1ZmZlcikge1xuICAgICAgICBnbC5kZWxldGVCdWZmZXIoZHJhdy5pbmRleF9idWZmZXIpO1xuICAgIH1cbn1cbiIsICJjb25zdCBleHRlbnNpb25zID0ge30gYXMgYW55O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2V4dGVuc2lvbjxUIGV4dGVuZHMgYW55PihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgbmFtZTogc3RyaW5nKTogVCB8IG51bGwge1xuICAgIGlmIChleHRlbnNpb25zW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGV4dGVuc2lvbnNbbmFtZV07XG4gICAgfVxuXG4gICAgbGV0IGV4dGVuc2lvbjtcbiAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgY2FzZSAnV0VCR0xfZGVwdGhfdGV4dHVyZSc6XG4gICAgICAgICAgICBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24oJ1dFQkdMX2RlcHRoX3RleHR1cmUnKSB8fCBnbC5nZXRFeHRlbnNpb24oJ01PWl9XRUJHTF9kZXB0aF90ZXh0dXJlJykgfHwgZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJLSVRfV0VCR0xfZGVwdGhfdGV4dHVyZScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYyc6XG4gICAgICAgICAgICBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24oJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycpIHx8IGdsLmdldEV4dGVuc2lvbignTU9aX0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycpIHx8IGdsLmdldEV4dGVuc2lvbignV0VCS0lUX0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJzpcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IGdsLmdldEV4dGVuc2lvbignV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGMnKSB8fCBnbC5nZXRFeHRlbnNpb24oJ01PWl9XRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycpIHx8IGdsLmdldEV4dGVuc2lvbignV0VCS0lUX1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3B2cnRjJzpcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IGdsLmdldEV4dGVuc2lvbignV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3B2cnRjJykgfHwgZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJLSVRfV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3B2cnRjJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IGdsLmdldEV4dGVuc2lvbihuYW1lKTtcbiAgICB9XG5cbiAgICBpZiAoZXh0ZW5zaW9uID09PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGA8V2ViR0xFeHRlbnNpb24+IEV4dGVuc2lvbjogJHtuYW1lfSBub3Qgc3VwcG9ydGVkLmApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGA8V2ViR0xFeHRlbnNpb24+IEV4dGVuc2lvbjogJHtuYW1lfSBmb3VuZC5gKTtcbiAgICB9XG4gICAgZXh0ZW5zaW9uc1tuYW1lXSA9IGV4dGVuc2lvbjtcbiAgICByZXR1cm4gZXh0ZW5zaW9uO1xufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBjb3VudF9kZWNpbWFsX2JpdChuOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGxldCBjID0gMTtcbiAgICB3aGlsZSAoTWF0aC5hYnMobikgPj0gMTApIHtcbiAgICAgICAgbiAvPSAxMDtcbiAgICAgICAgYysrO1xuICAgIH1cbiAgICByZXR1cm4gYztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZV91aW50MTZfdG9fdWludDMyKGE6IG51bWJlciwgYjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKChhICYgMHhmZmZmKSA8PCAxNikgfCAoYiAmIDB4ZmZmZik7XG59XG4iLCAiaW1wb3J0IHsgV2ViR0xUZXh0dXJlSGFuZGxlIH0gZnJvbSAnLi90ZXh0dXJlJztcblxubGV0IHdlYmdsX3RleHR1cmVfc2xvdF9pbmRleCA9IDA7XG5jb25zdCB3ZWJnbF90ZXh0dXJlX3Nsb3RfY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuXG5leHBvcnQgZnVuY3Rpb24gd2ViZ2xfdGV4dHVyZV9zbG90X3Jlc2V0KCkge1xuICAgIHdlYmdsX3RleHR1cmVfc2xvdF9pbmRleCA9IDA7XG4gICAgd2ViZ2xfdGV4dHVyZV9zbG90X2NhY2hlLmNsZWFyKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3ZWJnbF90ZXh0dXJlX3Nsb3RfcmVxdWVzdCh0ZXh0dXJlOiBXZWJHTFRleHR1cmVIYW5kbGUpOiBudW1iZXIge1xuICAgIGNvbnN0IGlkID0gdGV4dHVyZS5pZDtcbiAgICBpZiAod2ViZ2xfdGV4dHVyZV9zbG90X2NhY2hlLmhhcyhpZCkpIHtcbiAgICAgICAgcmV0dXJuIHdlYmdsX3RleHR1cmVfc2xvdF9jYWNoZS5nZXQoaWQpITtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzbG90ID0gd2ViZ2xfdGV4dHVyZV9zbG90X2luZGV4Kys7XG4gICAgICAgIHdlYmdsX3RleHR1cmVfc2xvdF9jYWNoZS5zZXQoaWQsIHNsb3QpO1xuICAgICAgICByZXR1cm4gc2xvdDtcbiAgICB9XG59IiwgImltcG9ydCB7IEdMLCBnZnhfZGV2aWNlX2dldCwgZ2Z4X2VuY29kZXJfZ2V0IH0gZnJvbSAnLi4vZ2Z4JztcbmltcG9ydCB7IENvbG9yUkdCQSB9IGZyb20gJy4uL21hdGgvY29sb3InO1xuaW1wb3J0IHsgRmxvYXQyLCBGbG9hdDMsIEZsb2F0NCB9IGZyb20gJy4uL21hdGgvc2ltZCc7XG5pbXBvcnQgeyBNYXQzLCBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9zaW1kX21hdCc7XG5pbXBvcnQgeyBjb3VudF9kZWNpbWFsX2JpdCB9IGZyb20gJy4uL3N0ZC9udW1lcmljJztcbmltcG9ydCB7IFN0cmluZ01hcCwgZGVmYXVsdF92YWx1ZSB9IGZyb20gJy4uL3N0ZC90eXBlJztcbmltcG9ydCB7IFJlbmRlckJsb2NrLCBSZW5kZXJCbG9ja05hbWUsIFJlbmRlckJsb2NrVHlwZSwgY3JlYXRlX2Jsb2NrIH0gZnJvbSAnLi9ibG9jayc7XG5pbXBvcnQgeyBXZWJHTEVuY29kZXIgfSBmcm9tICcuL2VuY29kZXInO1xuaW1wb3J0IHsgV2ViR0xUZXh0dXJlSGFuZGxlIH0gZnJvbSAnLi90ZXh0dXJlJztcbmltcG9ydCB7IHdlYmdsX3RleHR1cmVfc2xvdF9yZXF1ZXN0IH0gZnJvbSAnLi90ZXh0dXJlX3Nsb3QnO1xuXG5sZXQgX3BpcGVsaW5lX2lkID0gMDtcbmZ1bmN0aW9uIGdldF9waXBlbGluZV9pZCgpOiBudW1iZXIge1xuICAgIHJldHVybiBfcGlwZWxpbmVfaWQrKztcbn1cblxuZXhwb3J0IHR5cGUgVW5pZm9ybVZhbHVlID0gdW5kZWZpbmVkIHwgbnVtYmVyIHwgRmxvYXQyIHwgRmxvYXQzIHwgRmxvYXQ0IHwgTWF0MyB8IE1hdDQgfCBGbG9hdDMyQXJyYXkgfCBXZWJHTFRleHR1cmVIYW5kbGU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVW5pZm9ybURlc2NyaXB0b3Ige1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0eXBlOiBVbmlmb3JtVHlwZTtcbiAgICBkZWZhdWx0X3ZhbHVlPzogVW5pZm9ybVZhbHVlO1xuICAgIHZpc2libGU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFVuaWZvcm0gZXh0ZW5kcyBVbmlmb3JtRGVzY3JpcHRvciB7XG4gICAgc2xvdD86IG51bWJlcjtcbiAgICB1cGxvYWQ6IEZ1bmN0aW9uO1xuICAgIGdsX2J1ZmZlcj86IFdlYkdMQnVmZmVyO1xuICAgIGJ1ZmZlcj86IEZsb2F0MzJBcnJheTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdHJ1Y3RVbmlmb3JtIGV4dGVuZHMgVW5pZm9ybSB7XG4gICAgc3RydWN0X2luZGV4OiBudW1iZXI7XG4gICAgc3RydWN0X3NpemU6IG51bWJlcjtcbiAgICBpdGVtczogU3RyaW5nTWFwPFN0cnVjdFVuaWZvcm1JdGVtPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdHJ1Y3RVbmlmb3JtSXRlbSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHR5cGU6IFVuaWZvcm1UeXBlO1xuICAgIGRlZmF1bHRfdmFsdWU/OiBVbmlmb3JtVmFsdWU7XG4gICAgYnl0ZV9vZmZzZXQ6IG51bWJlcjtcbiAgICBieXRlX3NpemU6IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgVW5pZm9ybUJsb2NrID0gU3RyaW5nTWFwPFVuaWZvcm0+O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBpcGVsaW5lIHtcbiAgICBpZDogbnVtYmVyO1xuICAgIHZhbGlkOiBib29sZWFuO1xuICAgIG5hbWU6IHN0cmluZztcblxuICAgIHByb2dyYW06IFdlYkdMUHJvZ3JhbTtcbiAgICB2ZXJ0ZXhfc2hhZGVyOiBzdHJpbmc7XG4gICAgZnJhZ21lbnRfc2hhZGVyOiBzdHJpbmc7XG5cbiAgICB1bmlmb3JtX2Jsb2NrOiBVbmlmb3JtQmxvY2s7XG4gICAgdW5pZm9ybXM6IFVuaWZvcm1bXTtcblxuICAgIGN1bGxfbW9kZTogQ3VsbE1vZGU7XG4gICAgZGVwdGhfY29tcGFyZV9mdW5jOiBEZXB0aENvbXBhcmVGdW5jO1xuICAgIGRlcHRoX3dyaXRlOiBib29sZWFuO1xuICAgIGJsZW5kOiBCbGVuZERlc2NyaXB0b3I7XG4gICAgdmVydGV4X29yZGVyOiBWZXJ0ZXhPcmRlcjtcblxuICAgIGZyYW1lX2Jsb2NrPzogUmVuZGVyQmxvY2s7XG59XG5cbmV4cG9ydCBlbnVtIFByaW1pdGl2ZVR5cGUge1xuICAgIFBvaW50cyA9IDAsXG4gICAgTGluZXMgPSAxLFxuICAgIExpbmVMb29wID0gMixcbiAgICBMaW5lU3RyaXAgPSAzLFxuICAgIFRyaWFuZ2xlcyA9IDQsXG4gICAgVHJpYW5nbGVTdHJpcCA9IDUsXG4gICAgVHJpYW5nbGVGYW4gPSA2LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdQVVBpcGVsaW5lRGVzY3JpcHRvciB7XG4gICAgbmFtZT86IHN0cmluZztcblxuICAgIGRlZmluZXM/OiBzdHJpbmdbXTtcbiAgICB2ZXJ0ZXhfc2hhZGVyPzogc3RyaW5nO1xuICAgIGZyYWdtZW50X3NoYWRlcj86IHN0cmluZztcbiAgICBjb21iaW5lZF9zaGFkZXI/OiBzdHJpbmc7XG5cbiAgICBsaWJyYXJpZXM/OiBTdHJpbmdNYXA8c3RyaW5nPjtcblxuICAgIHByaW1pdGl2ZV90eXBlPzogUHJpbWl0aXZlVHlwZTtcbiAgICB1bmlmb3Jtcz86IFVuaWZvcm1EZXNjcmlwdG9yW107XG4gICAgY3VsbF9tb2RlOiBDdWxsTW9kZTtcbiAgICBkZXB0aF9jb21wYXJlX2Z1bmM6IERlcHRoQ29tcGFyZUZ1bmM7XG4gICAgZGVwdGhfd3JpdGU6IGJvb2xlYW47XG4gICAgYmxlbmQ6IFBhcnRpYWw8QmxlbmREZXNjcmlwdG9yPjtcbiAgICB2ZXJ0ZXhfb3JkZXI6IFZlcnRleE9yZGVyO1xufVxuXG5leHBvcnQgZW51bSBVbmlmb3JtVHlwZSB7XG4gICAgQm9vbCxcbiAgICBGbG9hdCxcbiAgICBGbG9hdDIsXG4gICAgRmxvYXQzLFxuICAgIEZsb2F0NCxcbiAgICBVbnNpZ25lZEludGVnZXIsXG4gICAgSW50ZWdlcixcbiAgICBDb2xvclJHQkEsXG4gICAgTWF0MyxcbiAgICBNYXQ0LFxuICAgIFRleHR1cmUyRCxcbiAgICBUZXh0dXJlQ3ViZSxcbiAgICBUZXh0dXJlMkRBcnJheSxcbiAgICBUZXh0dXJlM0QsXG4gICAgU3RydWN0LFxufVxuXG5leHBvcnQgZW51bSBDdWxsTW9kZSB7XG4gICAgTm9uZSxcbiAgICBGcm9udCA9IDEwMjgsXG4gICAgQmFjayA9IDEwMjksXG59XG5cbmV4cG9ydCBlbnVtIERlcHRoQ29tcGFyZUZ1bmMge1xuICAgIE5ldmVyLFxuICAgIExlc3MgPSA1MTIsXG4gICAgRXF1YWwgPSA1MTQsXG4gICAgTGVzc0VxdWFsID0gNTE1LFxuICAgIEdyZWF0ZXIgPSA1MTYsXG4gICAgTm90RXF1YWwgPSA1MTcsXG4gICAgR3JlYXRlckVxdWFsID0gNTE4LFxuICAgIEFsd2F5cyA9IDUxOSxcbn1cblxuZXhwb3J0IGVudW0gQmxlbmRGYWN0b3Ige1xuICAgIFNyY0FscGhhID0gNzcwLFxuICAgIFNyY0NvbG9yID0gNzY4LFxuICAgIERzdEFscGhhID0gNzcyLFxuICAgIERzdENvbG9yID0gNzc0LFxuICAgIE9uZSA9IDEsXG4gICAgWmVybyA9IDAsXG4gICAgT25lTWludXNTcmNBbHBoYSA9IDc3MSxcbiAgICBPbmVNaW51c1NyY0NvbG9yID0gNzY5LFxuICAgIE9uZU1pbnVzRHN0QWxwaGEgPSA3NzMsXG4gICAgT25lTWludXNEc3RDb2xvciA9IDc3NSxcbiAgICBPbmVNaW51c0NvbnN0QWxwaGEgPSAzMjc3MixcbiAgICBPbmVNaW51c0NvbnN0Q29sb3IgPSAzMjc3MCxcbiAgICBDb25zdENvbG9yID0gMzI3NjksXG4gICAgQ29uc3RBbHBoYSA9IDMyNzcxLFxuICAgIFNyY0FscGhhU2F0dXJhdGUgPSA3NzYsXG59XG5cbmV4cG9ydCBlbnVtIEJsZW5kRnVuYyB7XG4gICAgQWRkID0gMzI3NzQsXG4gICAgU3VidHJhY3QgPSAzMjc3OCxcbiAgICBSZXZlcnNlU3VidHJhY3QgPSAzMjc3OSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCbGVuZERlc2NyaXB0b3Ige1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgc3JjX2NvbG9yX2ZhY3RvcjogQmxlbmRGYWN0b3I7XG4gICAgc3JjX2FscGhhX2ZhY3RvcjogQmxlbmRGYWN0b3I7XG4gICAgZHN0X2NvbG9yX2ZhY3RvcjogQmxlbmRGYWN0b3I7XG4gICAgZHN0X2FscGhhX2ZhY3RvcjogQmxlbmRGYWN0b3I7XG4gICAgY29sb3JfZnVuYzogQmxlbmRGdW5jO1xuICAgIGFscGhhX2Z1bmM6IEJsZW5kRnVuYztcbiAgICBjb2xvcjogQ29sb3JSR0JBO1xufVxuXG5leHBvcnQgZW51bSBWZXJ0ZXhPcmRlciB7XG4gICAgQ2xvY2tXaXNlID0gMjMwNCxcbiAgICBDb3VudGVyQ2xvY2tXaXNlID0gMjMwNSxcbn1cblxuY29uc3QgdmVyc2lvbiA9ICcjdmVyc2lvbiAzMDAgZXNcXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuJztcblxuY29uc3QgdmVyc2lvbl9yZWcgPSAvI3ZlcnNpb24vO1xuY29uc3Qgc2tpcF9pbnRlcm5hbF9wcmVjaXNpb25fZGVmaW5lID0gLyNkZWZpbmUgc2tpcF9nbG9iYWxfcHJlY2lzaW9uLztcbmNvbnN0IHVzYW1wbGVyX3JlZyA9IC91bmlmb3JtIHVzYW1wbGVyMkQvO1xuY29uc3Qgc2FtcGxlcl8yZF9yZWcgPSAvdW5pZm9ybSBzYW1wbGVyMkQvO1xuY29uc3Qgc2FtcGxlcl8yZF9zaGFkb3dfcmVnID0gL3VuaWZvcm0gc2FtcGxlcjJEU2hhZG93LztcbmNvbnN0IHNhbXBsZXJfY3ViZV9yZWcgPSAvdW5pZm9ybSBzYW1wbGVyQ3ViZS87XG5jb25zdCBpbmNsdWRlX3JlZyA9IC8jcHJhZ21hIGluY2x1ZGUgKFtBLXpdezF9W0EtejAtOV0rKS9nO1xuXG5mdW5jdGlvbiBwcmVjaXNpb25fZGVjbGFyYXRpb24oc291cmNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBvdXRwdXQgPSAnJztcbiAgICBpZiAoc291cmNlLnNlYXJjaChza2lwX2ludGVybmFsX3ByZWNpc2lvbl9kZWZpbmUpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlLnNlYXJjaCh1c2FtcGxlcl9yZWcpID4gLTEpIHtcbiAgICAgICAgb3V0cHV0ICs9ICdwcmVjaXNpb24gaGlnaHAgdXNhbXBsZXIyRDtcXG4nO1xuICAgIH1cbiAgICBpZiAoc291cmNlLnNlYXJjaChzYW1wbGVyXzJkX3JlZykgPiAtMSkge1xuICAgICAgICBvdXRwdXQgKz0gJ3ByZWNpc2lvbiBoaWdocCBzYW1wbGVyMkQ7XFxuJztcbiAgICB9XG4gICAgaWYgKHNvdXJjZS5zZWFyY2goc2FtcGxlcl8yZF9zaGFkb3dfcmVnKSA+IC0xKSB7XG4gICAgICAgIG91dHB1dCArPSAncHJlY2lzaW9uIGhpZ2hwIHNhbXBsZXIyRFNoYWRvdztcXG4nO1xuICAgIH1cbiAgICBpZiAoc291cmNlLnNlYXJjaChzYW1wbGVyX2N1YmVfcmVnKSA+IC0xKSB7XG4gICAgICAgIG91dHB1dCArPSAncHJlY2lzaW9uIGhpZ2hwIHNhbXBsZXJDdWJlO1xcbic7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlX2luY2x1ZGUoc291cmNlOiBzdHJpbmcsIGxpYnJhcmllczogU3RyaW5nTWFwPHN0cmluZz4pOiBzdHJpbmcge1xuICAgIGxldCBtYXRjaGVzO1xuICAgIGNvbnN0IHJlcGxhY2VyczogQXJyYXk8eyBibG9jazogc3RyaW5nOyBsaWI6IHN0cmluZyB9PiA9IFtdO1xuICAgIHdoaWxlICgobWF0Y2hlcyA9IGluY2x1ZGVfcmVnLmV4ZWMoc291cmNlKSkgIT0gbnVsbCkge1xuICAgICAgICByZXBsYWNlcnMucHVzaCh7IGJsb2NrOiBtYXRjaGVzWzBdLCBsaWI6IG1hdGNoZXNbMV0gfSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCByZXBsYWNlciBvZiByZXBsYWNlcnMpIHtcbiAgICAgICAgY29uc3QgbGlicmFyeSA9IGxpYnJhcmllc1tyZXBsYWNlci5saWJdID8/IGAvLyBtb2R1bGUgbm90IGZvdW5kICR7cmVwbGFjZXIubGlifWA7XG4gICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKHJlcGxhY2VyLmJsb2NrLCBsaWJyYXJ5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc291cmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlX3BpcGVsaW5lKGRlc2NyaXB0b3I6IFBhcnRpYWw8R1BVUGlwZWxpbmVEZXNjcmlwdG9yPik6IFBpcGVsaW5lIHwgbnVsbCB7XG4gICAgLy8gY29uc29sZS5sb2coYGNyZWF0ZSBwaXBlbGluZSAke2NvbXBsZXRlRGVzYy5uYW1lfWApO1xuICAgIGNvbnN0IGdsID0gZ2Z4X2VuY29kZXJfZ2V0PFdlYkdMRW5jb2Rlcj4oKS5nbDtcblxuICAgIGxldCB2ZXJ0ZXhfc2hhZGVyID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLnZlcnRleF9zaGFkZXIsICcnKTtcbiAgICBsZXQgZnJhZ21lbnRfc2hhZGVyID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLmZyYWdtZW50X3NoYWRlciwgJycpO1xuICAgIGxldCBsaWJyYXJpZXMgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IubGlicmFyaWVzLCB7fSk7XG4gICAgbGV0IG5hbWUgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IubmFtZSwgJ3VubmFtZWQgcGlwZWxpbmUnKTtcbiAgICBjb25zb2xlLmxvZyhgY3JlYXRlIHBpcGVsaW5lICR7bmFtZX1gKTtcblxuICAgIGxldCBibGVuZCA9IGRlZmF1bHRfdmFsdWUoZGVzY3JpcHRvci5ibGVuZCwge30pIGFzIEJsZW5kRGVzY3JpcHRvcjtcbiAgICBibGVuZC5lbmFibGVkID0gZGVmYXVsdF92YWx1ZShibGVuZC5lbmFibGVkLCBmYWxzZSk7XG4gICAgYmxlbmQuc3JjX2FscGhhX2ZhY3RvciA9IGRlZmF1bHRfdmFsdWUoYmxlbmQuc3JjX2FscGhhX2ZhY3RvciwgQmxlbmRGYWN0b3IuT25lKTtcbiAgICBibGVuZC5kc3RfYWxwaGFfZmFjdG9yID0gZGVmYXVsdF92YWx1ZShibGVuZC5kc3RfYWxwaGFfZmFjdG9yLCBCbGVuZEZhY3Rvci5PbmVNaW51c1NyY0FscGhhKTtcbiAgICBibGVuZC5zcmNfY29sb3JfZmFjdG9yID0gZGVmYXVsdF92YWx1ZShibGVuZC5zcmNfY29sb3JfZmFjdG9yLCBCbGVuZEZhY3Rvci5TcmNBbHBoYSk7XG4gICAgYmxlbmQuZHN0X2NvbG9yX2ZhY3RvciA9IGRlZmF1bHRfdmFsdWUoYmxlbmQuZHN0X2NvbG9yX2ZhY3RvciwgQmxlbmRGYWN0b3IuT25lTWludXNTcmNBbHBoYSk7XG4gICAgYmxlbmQuY29sb3JfZnVuYyA9IGRlZmF1bHRfdmFsdWUoYmxlbmQuY29sb3JfZnVuYywgQmxlbmRGdW5jLkFkZCk7XG4gICAgYmxlbmQuYWxwaGFfZnVuYyA9IGRlZmF1bHRfdmFsdWUoYmxlbmQuYWxwaGFfZnVuYywgQmxlbmRGdW5jLkFkZCk7XG5cbiAgICBsZXQgZGVwdGhfY29tcGFyZV9mdW5jID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLmRlcHRoX2NvbXBhcmVfZnVuYywgRGVwdGhDb21wYXJlRnVuYy5MZXNzRXF1YWwpO1xuICAgIGxldCBkZXB0aF93cml0ZSA9IGRlZmF1bHRfdmFsdWUoZGVzY3JpcHRvci5kZXB0aF93cml0ZSwgdHJ1ZSk7XG4gICAgbGV0IHZlcnRleF9vcmRlciA9IGRlZmF1bHRfdmFsdWUoZGVzY3JpcHRvci52ZXJ0ZXhfb3JkZXIsIFZlcnRleE9yZGVyLkNvdW50ZXJDbG9ja1dpc2UpO1xuICAgIGxldCBjdWxsX21vZGUgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IuY3VsbF9tb2RlLCBDdWxsTW9kZS5CYWNrKTtcblxuICAgIGlmIChkZXNjcmlwdG9yLmNvbWJpbmVkX3NoYWRlcikge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IGRlc2NyaXB0b3IuY29tYmluZWRfc2hhZGVyLnNwbGl0KC8jZGVmaW5lIFNQTElUVEVSLyk7XG4gICAgICAgIHZlcnRleF9zaGFkZXIgKz0gcGFydHNbMF07XG4gICAgICAgIGZyYWdtZW50X3NoYWRlciArPSBwYXJ0c1sxXTtcbiAgICB9XG5cbiAgICBpZiAoIXZlcnRleF9zaGFkZXIpIHRocm93ICdpbnZhbGlkIHZlcnRleCBzaGFkZXIgc291cmNlLic7XG4gICAgaWYgKCFmcmFnbWVudF9zaGFkZXIpIHRocm93ICdpbnZhbGlkIGZyYWdtZW50IHNoYWRlciBzb3VyY2UuJztcblxuICAgIGxldCB2ZXJ0ZXhfaGVhZGVyID0gdmVydGV4X3NoYWRlci5zZWFyY2godmVyc2lvbl9yZWcpID4gLTEgPyAnJyA6IHZlcnNpb247XG4gICAgbGV0IGZyYWdtZW50X2hlYWRlciA9IGZyYWdtZW50X3NoYWRlci5zZWFyY2godmVyc2lvbl9yZWcpID4gLTEgPyAnJyA6IHZlcnNpb247XG4gICAgY29uc3QgZGVmaW5lcyA9IGRlc2NyaXB0b3IuZGVmaW5lcyB8fCBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZmluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmVydGV4X2hlYWRlciArPSBgI2RlZmluZSAke2RlZmluZXNbaV19IDFcXG5gO1xuICAgICAgICBmcmFnbWVudF9oZWFkZXIgKz0gYCNkZWZpbmUgJHtkZWZpbmVzW2ldfSAxXFxuYDtcbiAgICB9XG5cbiAgICB2ZXJ0ZXhfc2hhZGVyID0gcGFyc2VfaW5jbHVkZSh2ZXJ0ZXhfc2hhZGVyLCBsaWJyYXJpZXMpO1xuICAgIGZyYWdtZW50X3NoYWRlciA9IHBhcnNlX2luY2x1ZGUoZnJhZ21lbnRfc2hhZGVyLCBsaWJyYXJpZXMpO1xuXG4gICAgdmVydGV4X2hlYWRlciArPSBwcmVjaXNpb25fZGVjbGFyYXRpb24odmVydGV4X3NoYWRlcik7XG4gICAgZnJhZ21lbnRfaGVhZGVyICs9IHByZWNpc2lvbl9kZWNsYXJhdGlvbihmcmFnbWVudF9zaGFkZXIpO1xuXG4gICAgdmVydGV4X3NoYWRlciA9IHZlcnRleF9oZWFkZXIgKyB2ZXJ0ZXhfc2hhZGVyO1xuICAgIGZyYWdtZW50X3NoYWRlciA9IGZyYWdtZW50X2hlYWRlciArIGZyYWdtZW50X3NoYWRlcjtcblxuICAgIGNvbnN0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCkhO1xuICAgIGlmIChwcm9ncmFtID09PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgcGlwZWxpbmUgJHtuYW1lfSBjcmVhdGUgZXJyb3JgKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgdmVydGV4X3NoYWRlcl9oYW5kbGUgPSBidWlsZF9zaGFkZXIoZ2wsIHZlcnRleF9zaGFkZXIsIGdsLlZFUlRFWF9TSEFERVIpO1xuICAgIGlmICh2ZXJ0ZXhfc2hhZGVyX2hhbmRsZSA9PT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYHBpcGVsaW5lICR7bmFtZX0gdmVydGV4IHNoYWRlciBjb21waWxlIGVycm9yYCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBmcmFnbWVudF9zaGFkZXJfaGFuZGxlID0gYnVpbGRfc2hhZGVyKGdsLCBmcmFnbWVudF9zaGFkZXIsIGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgaWYgKGZyYWdtZW50X3NoYWRlcl9oYW5kbGUgPT09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBwaXBlbGluZSAke25hbWV9IGZyYWdtZW50IHNoYWRlciBjb21waWxlIGVycm9yYCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX2hhbmRsZSk7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50X3NoYWRlcl9oYW5kbGUpO1xuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgLy8gZ2V0IHVuaWZvcm0gbG9jYXRpb25cbiAgICBjb25zdCB1bmlmb3JtczogVW5pZm9ybVtdID0gW107XG4gICAgY29uc3QgcGlwZWxpbmUgPSB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHZhbGlkOiB0cnVlLFxuICAgICAgICBpZDogZ2V0X3BpcGVsaW5lX2lkKCksXG5cbiAgICAgICAgdmVydGV4X3NoYWRlcixcbiAgICAgICAgZnJhZ21lbnRfc2hhZGVyLFxuICAgICAgICBwcm9ncmFtLFxuXG4gICAgICAgIHVuaWZvcm1fYmxvY2s6IHt9LFxuICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgY3VsbF9tb2RlLFxuICAgICAgICBkZXB0aF9jb21wYXJlX2Z1bmMsXG4gICAgICAgIGRlcHRoX3dyaXRlLFxuICAgICAgICB2ZXJ0ZXhfb3JkZXIsXG4gICAgICAgIGJsZW5kLFxuICAgIH07XG5cbiAgICBwaXBlbGluZV9iaW5kX3VuaWZvcm0ocGlwZWxpbmUsIGRlc2NyaXB0b3IudW5pZm9ybXMgPz8gW10pO1xuICAgIHJldHVybiBwaXBlbGluZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpcGVsaW5lX2JpbmRfdW5pZm9ybShwaXBlbGluZTogUGlwZWxpbmUsIGRlc2NyaXB0b3JzOiBVbmlmb3JtRGVzY3JpcHRvcltdKSB7XG4gICAgY29uc3Qgc3RydWN0X3VuaWZvcm1fbWFwID0gbmV3IE1hcDxzdHJpbmcsIFVuaWZvcm1EZXNjcmlwdG9yW10+KCk7XG4gICAgY29uc3QgeyB1bmlmb3JtX2Jsb2NrLCB1bmlmb3JtcywgcHJvZ3JhbSB9ID0gcGlwZWxpbmU7XG5cbiAgICBjb25zdCBlbmNvZGVyID0gZ2Z4X2RldmljZV9nZXQoKS5lbmNvZGVyIGFzIFdlYkdMRW5jb2RlcjtcbiAgICBjb25zdCBnbCA9IGVuY29kZXIuZ2w7XG5cbiAgICBpZiAodW5pZm9ybXMpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXNjcmlwdG9ycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybV9kZXNjID0gZGVzY3JpcHRvcnNbaV07XG4gICAgICAgICAgICBjb25zdCB7IG5hbWUsIHR5cGUsIHZpc2libGUsIGRlZmF1bHRfdmFsdWUgfSA9IHVuaWZvcm1fZGVzYztcblxuICAgICAgICAgICAgLy8gaXMgc3RydWN0dXJlZCB1bmlmb3JtXG4gICAgICAgICAgICBpZiAobmFtZS5zZWFyY2goL1xcLi8pID4gLTEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJ1Y3RfbmFtZSA9IG5hbWUuc3BsaXQoL1xcLi8pWzBdITtcbiAgICAgICAgICAgICAgICBsZXQgc3RydWN0X3VuaWZvcm1zID0gc3RydWN0X3VuaWZvcm1fbWFwLmdldChzdHJ1Y3RfbmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFzdHJ1Y3RfdW5pZm9ybXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0X3VuaWZvcm1zID0gW3VuaWZvcm1fZGVzY107XG4gICAgICAgICAgICAgICAgICAgIHN0cnVjdF91bmlmb3JtX21hcC5zZXQoc3RydWN0X25hbWUsIHN0cnVjdF91bmlmb3Jtcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0X3VuaWZvcm1zLnB1c2godW5pZm9ybV9kZXNjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIG5hbWUpO1xuICAgICAgICAgICAgaWYgKCFsb2NhdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdXBsb2FkOiBGdW5jdGlvbjtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuRmxvYXQ6XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZCA9IHVwbG9hZF9mbG9hdC5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5GbG9hdDI6XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZCA9IHVwbG9hZF9mbG9hdDIuYmluZCh1bmRlZmluZWQsIGdsLCBsb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuRmxvYXQzOlxuICAgICAgICAgICAgICAgICAgICB1cGxvYWQgPSB1cGxvYWRfZmxvYXQzLmJpbmQodW5kZWZpbmVkLCBnbCwgbG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLlVuc2lnbmVkSW50ZWdlcjpcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkID0gdXBsb2FkX3VpbnQuYmluZCh1bmRlZmluZWQsIGdsLCBsb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuSW50ZWdlcjpcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkID0gdXBsb2FkX2ludC5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLkNvbG9yUkdCQTpcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLkZsb2F0NDpcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkID0gdXBsb2FkX2Zsb2F0NC5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5NYXQzOlxuICAgICAgICAgICAgICAgICAgICB1cGxvYWQgPSB1cGxvYWRfbWF0My5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5NYXQ0OlxuICAgICAgICAgICAgICAgICAgICB1cGxvYWQgPSB1cGxvYWRfbWF0NC5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5UZXh0dXJlMkRBcnJheTpcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLlRleHR1cmUyRDpcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkID0gdXBsb2FkX3RleHR1cmUyZC5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5UZXh0dXJlQ3ViZTpcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkID0gdXBsb2FkX3RleHR1cmVfY3ViZS5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHVuaWZvcm0gdHlwZTogJHt0eXBlfWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBnbF91bmlmb3JtID0geyBuYW1lLCB1cGxvYWQsIHR5cGUgfSBhcyBVbmlmb3JtO1xuICAgICAgICAgICAgZ2xfdW5pZm9ybS52aXNpYmxlID0gdmlzaWJsZSA/PyBmYWxzZTtcbiAgICAgICAgICAgIGlmIChkZWZhdWx0X3ZhbHVlICE9PSB1bmRlZmluZWQpIGdsX3VuaWZvcm0uZGVmYXVsdF92YWx1ZSA9IGRlZmF1bHRfdmFsdWU7XG5cbiAgICAgICAgICAgIHVuaWZvcm1fYmxvY2tbbmFtZV0gPSBnbF91bmlmb3JtO1xuICAgICAgICAgICAgdW5pZm9ybXMucHVzaChnbF91bmlmb3JtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHByb2Nlc3MgdWJvXG4gICAgZm9yIChjb25zdCBbc3RydWN0X25hbWUsIHN0cnVjdF91bmlmb3Jtc10gb2Ygc3RydWN0X3VuaWZvcm1fbWFwKSB7XG4gICAgICAgIGlmIChzdHJ1Y3RfdW5pZm9ybXMubGVuZ3RoIDw9IDApIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBzdHJ1Y3RfaW5kZXggPSBnbC5nZXRVbmlmb3JtQmxvY2tJbmRleChwcm9ncmFtLCBzdHJ1Y3RfbmFtZSk7XG4gICAgICAgIGNvbnN0IHN0cnVjdF9zaXplID0gZ2wuZ2V0QWN0aXZlVW5pZm9ybUJsb2NrUGFyYW1ldGVyKHByb2dyYW0sIHN0cnVjdF9pbmRleCwgZ2wuVU5JRk9STV9CTE9DS19EQVRBX1NJWkUpO1xuXG4gICAgICAgIGNvbnN0IG5hbWVzID0gc3RydWN0X3VuaWZvcm1zLm1hcCgodW5pZm9ybSkgPT4gdW5pZm9ybS5uYW1lLnNwbGl0KC9cXC4vKVsxXSEpO1xuICAgICAgICBjb25zdCBpbmRpY2VzID0gQXJyYXkuZnJvbShnbC5nZXRVbmlmb3JtSW5kaWNlcyhwcm9ncmFtLCBuYW1lcykhKS5maWx0ZXIoKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbHVlID4gZ2wuQUNUSVZFX1VOSUZPUk1TKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzdHJ1Y3QgdW5pZm9ybSAke3N0cnVjdF9uYW1lfS4ke25hbWVzW2luZGV4XX0gbm90IGZvdW5kLmApO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzdHJ1Y3RfdW5pZm9ybSA9IHtcbiAgICAgICAgICAgIG5hbWU6IHN0cnVjdF9uYW1lLFxuICAgICAgICAgICAgdHlwZTogVW5pZm9ybVR5cGUuU3RydWN0LFxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICBzdHJ1Y3RfaW5kZXg6IHN0cnVjdF9pbmRleCxcbiAgICAgICAgICAgIHN0cnVjdF9zaXplOiBzdHJ1Y3Rfc2l6ZSxcbiAgICAgICAgICAgIGl0ZW1zOiB7fSxcbiAgICAgICAgfSBhcyBTdHJ1Y3RVbmlmb3JtO1xuXG4gICAgICAgIGNvbnN0IG9mZnNldHMgPSBnbC5nZXRBY3RpdmVVbmlmb3Jtcyhwcm9ncmFtLCBpbmRpY2VzLCBnbC5VTklGT1JNX09GRlNFVCkhIGFzIG51bWJlcltdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cnVjdF91bmlmb3Jtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCB0eXBlLCB2aXNpYmxlLCBkZWZhdWx0X3ZhbHVlIH0gPSBzdHJ1Y3RfdW5pZm9ybXNbaV07XG4gICAgICAgICAgICBjb25zdCBieXRlX29mZnNldCA9IG9mZnNldHNbaV07XG4gICAgICAgICAgICBjb25zdCBieXRlX3NpemUgPSB1bmlmb3JtX2J5dGVfc2l6ZSh0eXBlKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWUuc3BsaXQoL1xcLi8pWzFdITtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB7IG5hbWU6IGl0ZW1fbmFtZSwgdHlwZSwgdmlzaWJsZSwgZGVmYXVsdF92YWx1ZSwgYnl0ZV9vZmZzZXQsIGJ5dGVfc2l6ZSAgfSBhcyBTdHJ1Y3RVbmlmb3JtSXRlbTtcbiAgICAgICAgICAgIHN0cnVjdF91bmlmb3JtLml0ZW1zW2l0ZW1fbmFtZV0gPSBpdGVtIGFzIGFueTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVuaWZvcm1fYmxvY2tbc3RydWN0X25hbWVdID0gc3RydWN0X3VuaWZvcm07XG4gICAgICAgIHVuaWZvcm1zLnB1c2goc3RydWN0X3VuaWZvcm0pO1xuICAgIH1cblxuICAgIGNvbnN0IGZyYW1lX2Jsb2NrID0gdW5pZm9ybV9ibG9ja1tSZW5kZXJCbG9ja05hbWUuRnJhbWVdIGFzIFN0cnVjdFVuaWZvcm07XG4gICAgaWYgKGZyYW1lX2Jsb2NrKSB7XG4gICAgICAgIGNvbnN0IGVuY29kZXIgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgICAgICBjb25zdCB1Ym9fYWxpZ25tZW50ID0gZW5jb2Rlci5VTklGT1JNX0JVRkZFUl9BTElHTk1FTlQ7XG4gICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLmNlaWwoZnJhbWVfYmxvY2suc3RydWN0X3NpemUgLyB1Ym9fYWxpZ25tZW50KSAqIHVib19hbGlnbm1lbnQ7XG4gICAgICAgIHBpcGVsaW5lLmZyYW1lX2Jsb2NrID0gY3JlYXRlX2Jsb2NrKFJlbmRlckJsb2NrVHlwZS5GcmFtZSwgc2l6ZSwgUmVuZGVyQmxvY2tOYW1lLkZyYW1lKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaXBlbGluZV9kZXN0cm95KHBpcGVsaW5lOiBQaXBlbGluZSkge1xuICAgIGlmICghcGlwZWxpbmUudmFsaWQpIHJldHVybjtcbiAgICBwaXBlbGluZS52YWxpZCA9IGZhbHNlO1xuICAgIGNvbnN0IGVuY29kZXIgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgIGNvbnN0IGdsID0gZW5jb2Rlci5nbDtcblxuICAgIGZvciAoY29uc3QgdW5pZm9ybSBvZiBwaXBlbGluZS51bmlmb3Jtcykge1xuICAgICAgICBpZiAodW5pZm9ybS50eXBlID09PSBVbmlmb3JtVHlwZS5TdHJ1Y3QpIHtcbiAgICAgICAgICAgIGdsLmRlbGV0ZUJ1ZmZlcih1bmlmb3JtLmdsX2J1ZmZlciEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2wuZGVsZXRlUHJvZ3JhbShwaXBlbGluZS5wcm9ncmFtKTtcbiAgICBwaXBlbGluZS51bmlmb3JtX2Jsb2NrID0ge307XG4gICAgcGlwZWxpbmUudW5pZm9ybXMgPSBbXTtcbn1cblxuY29uc3QgdW5yb2xsX3BhdHRlcm4gPSAvI3ByYWdtYSB1bnJvbGxfbG9vcF9zdGFydFxccytmb3JcXHMqXFwoXFxzKmludFxccytpXFxzKj1cXHMqKFxcZCspXFxzKjtcXHMqaVxccyo8XFxzKihcXGQrKVxccyo7XFxzKmlcXHMqXFwrXFwrXFxzKlxcKVxccyp7KFtcXHNcXFNdKz8pfVxccysjcHJhZ21hIHVucm9sbF9sb29wX2VuZC9nO1xuZnVuY3Rpb24gbG9vcF9yZXBsYWNlcihfOiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nLCBzbmlwcGV0OiBzdHJpbmcpIHtcbiAgICBsZXQgc3RyaW5nID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IHBhcnNlSW50KHN0YXJ0KTsgaSA8IHBhcnNlSW50KGVuZCk7IGkrKykge1xuICAgICAgICBzdHJpbmcgKz0gc25pcHBldC5yZXBsYWNlKC9cXFtcXHMqaVxccypcXF0vZywgJ1snICsgaSArICddJykucmVwbGFjZSgvVU5ST0xMRURfTE9PUF9JTkRFWC9nLCBpLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBidWlsZF9zaGFkZXIoZ2w6IEdMLCBzb3VyY2U6IHN0cmluZywgdHlwZTogYW55KTogV2ViR0xTaGFkZXIgfCBudWxsIHtcbiAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZSh1bnJvbGxfcGF0dGVybiwgbG9vcF9yZXBsYWNlcik7XG4gICAgY29uc3Qgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpITtcbiAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcbiAgICBjb25zdCBzaGFkZXJJbmZvID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xuICAgIGlmIChzaGFkZXJJbmZvICE9ICcnKSB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gc291cmNlLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgY29uc3QgbGluZV9jb3VudCA9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgbWF4X2JpdCA9IGNvdW50X2RlY2ltYWxfYml0KGxpbmVfY291bnQpO1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICBsaW5lc1xuICAgICAgICAgICAgICAgIC5tYXAoKGwsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAkeycgJy5yZXBlYXQobWF4X2JpdCAtIGNvdW50X2RlY2ltYWxfYml0KGkgKyAxKSl9JHtpICsgMX18JHtsfWA7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuam9pbignXFxuJylcbiAgICAgICAgKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBzaGFkZXIgZXJyb3IgaW5mbzpcXG4ke3NoYWRlckluZm99YCk7XG4gICAgICAgIHJldHVybiBudWxsITtcbiAgICB9XG4gICAgcmV0dXJuIHNoYWRlcjtcbn1cblxuZnVuY3Rpb24gdW5pZm9ybV9ieXRlX3NpemUodHlwZTogVW5pZm9ybVR5cGUpOiBudW1iZXIge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLkJvb2w6XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuRmxvYXQ6XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuVW5zaWduZWRJbnRlZ2VyOlxuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLkludGVnZXI6XG4gICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5GbG9hdDI6XG4gICAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5GbG9hdDM6XG4gICAgICAgICAgICByZXR1cm4gMTI7XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuQ29sb3JSR0JBOlxuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLkZsb2F0NDpcbiAgICAgICAgICAgIHJldHVybiAxNjtcbiAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5NYXQzOlxuICAgICAgICAgICAgcmV0dXJuIDM2O1xuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLk1hdDQ6XG4gICAgICAgICAgICByZXR1cm4gNjQ7XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuVGV4dHVyZTJEOlxuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLlRleHR1cmVDdWJlOlxuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLlRleHR1cmUyREFycmF5OlxuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLlRleHR1cmUzRDpcbiAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHVuaWZvcm0gdHlwZTogJHt0eXBlfWApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBsb2FkX2Zsb2F0KGdsOiBHTCwgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uLCB2YWx1ZTogbnVtYmVyIHwgRmxvYXQzMkFycmF5KTogdm9pZCB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgICAgIGdsLnVuaWZvcm0xZnYobG9jYXRpb24sIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBnbC51bmlmb3JtMWYobG9jYXRpb24sIHZhbHVlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwbG9hZF9mbG9hdDIoZ2w6IEdMLCBsb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24sIHZhbHVlOiBGbG9hdDIgfCBGbG9hdDMyQXJyYXkpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHtcbiAgICAgICAgZ2wudW5pZm9ybTJmdihsb2NhdGlvbiwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnVuaWZvcm0yZnYobG9jYXRpb24sIHZhbHVlLmVsZW1lbnRzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwbG9hZF9mbG9hdDMoZ2w6IEdMLCBsb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24sIHZhbHVlOiBGbG9hdDMpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHtcbiAgICAgICAgZ2wudW5pZm9ybTNmdihsb2NhdGlvbiwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnVuaWZvcm0zZnYobG9jYXRpb24sIHZhbHVlLmVsZW1lbnRzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwbG9hZF9mbG9hdDQoZ2w6IEdMLCBsb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24sIHZhbHVlOiBGbG9hdDQgfCBGbG9hdDMyQXJyYXkpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHtcbiAgICAgICAgZ2wudW5pZm9ybTRmdihsb2NhdGlvbiwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnVuaWZvcm00ZnYobG9jYXRpb24sIHZhbHVlLmVsZW1lbnRzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwbG9hZF91aW50KGdsOiBHTCwgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uLCB2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgZ2wudW5pZm9ybTF1aShsb2NhdGlvbiwgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiB1cGxvYWRfaW50KGdsOiBHTCwgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uLCB2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHVwbG9hZF9tYXQzKGdsOiBHTCwgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uLCB2YWx1ZTogTWF0MyB8IEZsb2F0MzJBcnJheSk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4M2Z2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYobG9jYXRpb24sIGZhbHNlLCB2YWx1ZS5lbGVtZW50cyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGxvYWRfbWF0NChnbDogR0wsIGxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiwgdmFsdWU6IE1hdDQgfCBGbG9hdDMyQXJyYXkpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihsb2NhdGlvbiwgZmFsc2UsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUuZWxlbWVudHMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBsb2FkX3RleHR1cmUyZChnbDogR0wsIGxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiwgdGV4dHVyZTogV2ViR0xUZXh0dXJlSGFuZGxlKTogdm9pZCB7XG4gICAgaWYgKCF0ZXh0dXJlKSByZXR1cm47XG4gICAgY29uc3Qgc2xvdCA9IHdlYmdsX3RleHR1cmVfc2xvdF9yZXF1ZXN0KHRleHR1cmUpO1xuICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyBzbG90KTtcbiAgICBnbC5iaW5kVGV4dHVyZSh0ZXh0dXJlLnRleHR1cmVfdHlwZSwgdGV4dHVyZS53ZWJnbF90ZXh0dXJlISk7XG4gICAgZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCBzbG90KTtcbn1cblxuZnVuY3Rpb24gdXBsb2FkX3RleHR1cmVfY3ViZShnbDogR0wsIGxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiwgdGV4dHVyZTogV2ViR0xUZXh0dXJlSGFuZGxlKTogdm9pZCB7XG4gICAgaWYgKCF0ZXh0dXJlKSByZXR1cm47XG4gICAgY29uc3Qgc2xvdCA9IHdlYmdsX3RleHR1cmVfc2xvdF9yZXF1ZXN0KHRleHR1cmUpO1xuICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyBzbG90KTtcbiAgICBnbC5iaW5kVGV4dHVyZSh0ZXh0dXJlLnRleHR1cmVfdHlwZSwgdGV4dHVyZS53ZWJnbF90ZXh0dXJlISk7XG4gICAgZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCBzbG90KTtcbn0iLCAiaW1wb3J0IHsgTWF0ZXJpYWxCbG9jaywgU3ViTWVzaCB9IGZyb20gJy4uL2VuZ2luZSc7XG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tICcuLi9lbmdpbmUvY2FtZXJhJztcbmltcG9ydCB7IEZyYW1lQ2FwdHVyZU5vZGVUeXBlLCBQcm9maWxlciB9IGZyb20gJy4uL2VuZ2luZS9mcmFtZV9jYXB0dXJlJztcbmltcG9ydCB7IE1hdGVyaWFsIH0gZnJvbSAnLi4vZW5naW5lL21hdGVyaWFsJztcbmltcG9ydCB7IEdGWERldmljZUNsaWVudCB9IGZyb20gJy4uL2dmeCc7XG5pbXBvcnQgeyBHRlhCYWNrZW5kLCBHRlhEZXZpY2VPcHRpb25zLCBHTCwgR1BVQWN0aW9uLCBHUFVBY3Rpb25UeXBlIH0gZnJvbSAnLi4vZ2Z4L2dmeF9kZXZpY2UnO1xuaW1wb3J0IHsgR0ZYRW5jb2RlciwgUmVuZGVyT2JqZWN0IH0gZnJvbSAnLi4vZ2Z4L2dmeF9lbmNvZGVyJztcbmltcG9ydCB7IENvbG9yUkdCQSB9IGZyb20gJy4uL21hdGgvY29sb3InO1xuaW1wb3J0IHsgUmVjdCB9IGZyb20gJy4uL21hdGgvcmVjdCc7XG5pbXBvcnQgeyBSZW5kZXJCbG9ja05hbWUsIGJsb2NrX2JpbmQsIHVwbG9hZF9ibG9jayB9IGZyb20gJy4vYmxvY2snO1xuaW1wb3J0IHsgV2ViR0xEcmF3IH0gZnJvbSAnLi9kcmF3JztcbmltcG9ydCB7IGdldF9leHRlbnNpb24gfSBmcm9tICcuL2V4dGVuc2lvbnMnO1xuaW1wb3J0IHsgR1BVTWVzaCB9IGZyb20gJy4vbWVzaCc7XG5pbXBvcnQgeyBHUFVQYXNzLCBQYXNzTG9hZEFjdGlvbiB9IGZyb20gJy4vcGFzcyc7XG5pbXBvcnQgeyBDdWxsTW9kZSwgRGVwdGhDb21wYXJlRnVuYywgUGlwZWxpbmUsIFByaW1pdGl2ZVR5cGUsIFN0cnVjdFVuaWZvcm0sIFVuaWZvcm1WYWx1ZSB9IGZyb20gJy4vcGlwZWxpbmUnO1xuaW1wb3J0IHsgd2ViZ2xfdGV4dHVyZV9zbG90X3Jlc2V0IH0gZnJvbSAnLi90ZXh0dXJlX3Nsb3QnO1xuXG5leHBvcnQgY2xhc3MgV2ViR0xFbmNvZGVyIGltcGxlbWVudHMgR0ZYRW5jb2RlciB7XG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBjbGllbnQ6IEdGWERldmljZUNsaWVudCB8IHVuZGVmaW5lZDtcblxuICAgIHBpcGVsaW5lPzogUGlwZWxpbmU7XG4gICAgY3VycmVudF9wYXNzPzogR1BVUGFzcztcblxuICAgIGdsOiBHTDtcblxuICAgIGxhc3RfcGFzcz86IEdQVVBhc3M7XG4gICAgbGFzdF92aWV3cG9ydDogUmVjdCA9IG5ldyBSZWN0KCk7XG4gICAgdmlld3BvcnQ6IFJlY3QgPSBuZXcgUmVjdCgpO1xuXG4gICAgcHJvZmlsZXI6IFByb2ZpbGVyID0gbmV3IFByb2ZpbGVyKCk7XG4gICAgcmVjb3JkaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBjbGVhcl9hY3Rpb24gPSB7XG4gICAgICAgIHR5cGU6IEdQVUFjdGlvblR5cGUuQ2xlYXJBbGwsXG4gICAgICAgIGNsZWFyX2NvbG9yOiBuZXcgQ29sb3JSR0JBKDAsIDAsIDAsIDApLFxuICAgICAgICBjbGVhcl9kZXB0aDogMSxcbiAgICB9O1xuXG4gICAgdW5pZm9ybV9jYWNoZTogTWFwPHN0cmluZywgVW5pZm9ybVZhbHVlPiA9IG5ldyBNYXA8c3RyaW5nLCBVbmlmb3JtVmFsdWU+KCk7XG4gICAgY2FtZXJhPzogQ2FtZXJhO1xuXG4gICAgTUFYX1RFWFRVUkVfU0laRTogbnVtYmVyO1xuICAgIE1BWF9URVhUVVJFX0lNQUdFX1VOSVRTOiBudW1iZXI7XG4gICAgTUFYX1JFTkRFUkJVRkZFUl9TSVpFOiBudW1iZXI7XG4gICAgVU5JRk9STV9CVUZGRVJfQUxJR05NRU5UOiBudW1iZXI7XG4gICAgVU5JRk9STV9CVUZGRVJfU0laRTogbnVtYmVyO1xuXG4gICAgd2lkdGg6IG51bWJlciA9IDE7XG4gICAgaGVpZ2h0OiBudW1iZXIgPSAxO1xuXG4gICAgbXVsdGlfdGhyZWFkX3JlbmRlcmluZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogR0ZYRGV2aWNlT3B0aW9ucykge1xuICAgICAgICBjb25zdCBnbF9vcHRpb25zID0ge30gYXMgV2ViR0xDb250ZXh0QXR0cmlidXRlcztcbiAgICAgICAgZ2xfb3B0aW9ucy5wcmVzZXJ2ZURyYXdpbmdCdWZmZXIgPSBvcHRpb25zLnByZXNlcnZlX2J1ZmZlciA9PT0gdHJ1ZSB8fCBvcHRpb25zLnByZXNlcnZlRHJhd2luZ0J1ZmZlciA9PT0gdHJ1ZTtcbiAgICAgICAgZ2xfb3B0aW9ucy5hbnRpYWxpYXMgPSBvcHRpb25zLmFudGlhbGlhcyA9PT0gdHJ1ZTtcbiAgICAgICAgZ2xfb3B0aW9ucy5wb3dlclByZWZlcmVuY2UgPSBvcHRpb25zLnBvd2VyUHJlZmVyZW5jZSA/PyAnaGlnaC1wZXJmb3JtYW5jZSc7XG4gICAgICAgIChnbF9vcHRpb25zIGFzIGFueSkueHJDb21wYXRpYmxlID0gb3B0aW9ucy54cl9lbmFibGVkID09PSB0cnVlO1xuICAgICAgICBjb25zdCBjYW52YXMgPSBvcHRpb25zLmNhbnZhcyA/PyBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF0gYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgICAgIGlmICghY2FudmFzKSB0aHJvdyBuZXcgRXJyb3IoJ2NhbnZhcyBub3QgZm91bmQuJyk7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzITtcbiAgICAgICAgdGhpcy5tdWx0aV90aHJlYWRfcmVuZGVyaW5nID0gb3B0aW9ucy5tdWx0aV90aHJlYWRfcmVuZGVyaW5nID09PSB0cnVlO1xuXG4gICAgICAgIGxldCBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInLCBnbF9vcHRpb25zKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xuICAgICAgICBpZiAoZ2wgPT09IG51bGwpIHRocm93IGB3ZWJnbDIgd2Fzbid0IHN1cHBvcnRlZC5gO1xuXG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcblxuICAgICAgICBnZXRfZXh0ZW5zaW9uKGdsLCAnT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyk7XG4gICAgICAgIGdldF9leHRlbnNpb24oZ2wsICdFWFRfY29sb3JfYnVmZmVyX2Zsb2F0Jyk7XG4gICAgICAgIGdldF9leHRlbnNpb24oZ2wsICdXRUJHTF9tdWx0aV9kcmF3Jyk7XG5cbiAgICAgICAgdGhpcy5NQVhfVEVYVFVSRV9TSVpFID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9URVhUVVJFX1NJWkUpO1xuICAgICAgICB0aGlzLk1BWF9URVhUVVJFX0lNQUdFX1VOSVRTID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9URVhUVVJFX0lNQUdFX1VOSVRTKTtcbiAgICAgICAgdGhpcy5NQVhfUkVOREVSQlVGRkVSX1NJWkUgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1JFTkRFUkJVRkZFUl9TSVpFKTtcbiAgICAgICAgdGhpcy5VTklGT1JNX0JVRkZFUl9BTElHTk1FTlQgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuVU5JRk9STV9CVUZGRVJfT0ZGU0VUX0FMSUdOTUVOVCk7XG4gICAgICAgIHRoaXMuVU5JRk9STV9CVUZGRVJfU0laRSA9IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVU5JRk9STV9CTE9DS19TSVpFKTtcbiAgICAgICAgaWYgKGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX1RFWFRVUkVfSU1BR0VfVU5JVFMpIDwgMSkgdGhyb3cgYHZlcnRleCB0ZXh0dXJlIG5vdCBzdXBwb3J0ZWQuYDtcblxuICAgICAgICBpZiAob3B0aW9ucy5tdWx0aV90aHJlYWRfcmVuZGVyaW5nICYmICdPZmZzY3JlZW5DYW52YXMnIGluIHdpbmRvdyAmJiAnU2hhcmVkQXJyYXlCdWZmZXInIGluIHdpbmRvdykge1xuICAgICAgICAgICAgY29uc3QgYmFja2VuZCA9IG9wdGlvbnMuYmFja2VuZCA/PyBHRlhCYWNrZW5kLldlYkdMO1xuICAgICAgICAgICAgdGhpcy5jbGllbnQgPSBuZXcgR0ZYRGV2aWNlQ2xpZW50KGJhY2tlbmQpO1xuICAgICAgICAgICAgdGhpcy5jbGllbnQuY3JlYXRlX2RldmljZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVuZGVyJykgYXMgSFRNTENhbnZhc0VsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0X2Rpc3BsYXlfc2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuXG4gICAgc2V0X2NhbWVyYShjYW1lcmE6IENhbWVyYSk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhbWVyYSA9IGNhbWVyYTtcbiAgICAgICAgdGhpcy51bmlmb3JtX2NhY2hlLmNsZWFyKCk7XG4gICAgICAgIHRoaXMudXBkYXRlX2ZyYW1lX3VuaWZvcm0oKTtcbiAgICB9XG5cbiAgICBzZXRfcGFzcyhwYXNzPzogR1BVUGFzcywgZGVzY3JpcHRpb24/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgLy8gdW5kZWZpbmVkIHBhc3MgYXMgZnVsbHNjcmVlbiBwYXNzXG5cbiAgICAgICAgdGhpcy5sYXN0X3ZpZXdwb3J0LmNvcHkodGhpcy52aWV3cG9ydCk7XG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgaWYgKCFwYXNzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50X3Bhc3MgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBpZiBwYXNzIGNoYW5nZWQgcmVjb3JkIGxhc3QgcGFzcyBlbmRcbiAgICAgICAgICAgIGlmICh0aGlzLnJlY29yZGluZykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRfcGFzcykgdGhpcy5wcm9maWxlci50cmFjZV9lbmQoJ3NldCBwYXNzJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgICAgICAgICB0aGlzLnNldF92aWV3cG9ydCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRfcGFzcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRfcGFzcyA9PT0gcGFzcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgcGFzcyBjaGFuZ2VkIHJlY29yZCBsYXN0IHBhc3MgZW5kXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRfcGFzcyAhPT0gdW5kZWZpbmVkICYmIHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX2VuZCgnc2V0IHBhc3MnKTtcblxuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2Vfc3RhcnQoJ3NldCBwYXNzJywgZGVzY3JpcHRpb24gfHwgcGFzcy5uYW1lLCBwYXNzLCBGcmFtZUNhcHR1cmVOb2RlVHlwZS5QYXNzKTtcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBwYXNzLndlYmdsX2ZyYW1lYnVmZmVyKTtcbiAgICAgICAgdGhpcy5zZXRfdmlld3BvcnQoMCwgMCwgcGFzcy53aWR0aCwgcGFzcy5oZWlnaHQpO1xuXG4gICAgICAgIC8vIHNldHVwIHBhc3MgbG9hZCBhY3Rpb25cbiAgICAgICAgbGV0IG1hc2sgPSAwO1xuICAgICAgICBpZiAocGFzcy5jb2xvcl9sb2FkX2FjdGlvbiA9PT0gUGFzc0xvYWRBY3Rpb24uQ2xlYXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gcGFzcy5jbGVhcl9jb2xvciE7XG4gICAgICAgICAgICBnbC5jbGVhckNvbG9yKGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIsIGNvbG9yLmEpO1xuICAgICAgICAgICAgbWFzayB8PSBnbC5DT0xPUl9CVUZGRVJfQklUO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXNzLmRlcHRoX2xvYWRfYWN0aW9uID09PSBQYXNzTG9hZEFjdGlvbi5DbGVhcikge1xuICAgICAgICAgICAgZ2wuY2xlYXJEZXB0aChwYXNzLmNsZWFyX2RlcHRoISk7XG4gICAgICAgICAgICBtYXNrIHw9IGdsLkRFUFRIX0JVRkZFUl9CSVQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hc2sgIT09IDApIGdsLmNsZWFyKG1hc2spO1xuXG4gICAgICAgIHRoaXMubGFzdF9wYXNzID0gdGhpcy5jdXJyZW50X3Bhc3M7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50X3Bhc3MgPSBwYXNzO1xuICAgICAgICB0aGlzLnVuaWZvcm1fY2FjaGUuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBzZXRfY2xlYXJfY29sb3IoY29sb3I6IENvbG9yUkdCQSkge1xuICAgICAgICB0aGlzLmNsZWFyX2FjdGlvbi5jbGVhcl9jb2xvci5jb3B5KGNvbG9yKTtcbiAgICB9XG5cbiAgICBjbGVhcihhY3Rpb24/OiBHUFVBY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgaWYgKCFhY3Rpb24pIGFjdGlvbiA9IHRoaXMuY2xlYXJfYWN0aW9uO1xuXG4gICAgICAgIGlmIChhY3Rpb24udHlwZSA9PT0gR1BVQWN0aW9uVHlwZS5JZ25vcmUpIHJldHVybjtcblxuICAgICAgICBpZiAoKGFjdGlvbi50eXBlICYgR1BVQWN0aW9uVHlwZS5DbGVhckNvbG9yKSAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5nbC5jbGVhckNvbG9yKGFjdGlvbi5jbGVhcl9jb2xvci5yLCBhY3Rpb24uY2xlYXJfY29sb3IuZywgYWN0aW9uLmNsZWFyX2NvbG9yLmIsIGFjdGlvbi5jbGVhcl9jb2xvci5hKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2wuY2xlYXJEZXB0aChhY3Rpb24uY2xlYXJfZGVwdGgpO1xuXG4gICAgICAgIGxldCBtYXNrID0gMDtcbiAgICAgICAgaWYgKChhY3Rpb24udHlwZSAmIEdQVUFjdGlvblR5cGUuQ2xlYXJDb2xvcikgIT09IDApIG1hc2sgfD0gdGhpcy5nbC5DT0xPUl9CVUZGRVJfQklUO1xuICAgICAgICBpZiAoKGFjdGlvbi50eXBlICYgR1BVQWN0aW9uVHlwZS5DbGVhckRlcHRoKSAhPT0gMCkgbWFzayB8PSB0aGlzLmdsLkRFUFRIX0JVRkZFUl9CSVQ7XG4gICAgICAgIGlmICgoYWN0aW9uLnR5cGUgJiBHUFVBY3Rpb25UeXBlLkNsZWFyU3RlbmNpbCkgIT09IDApIG1hc2sgfD0gdGhpcy5nbC5TVEVOQ0lMX0JVRkZFUl9CSVQ7XG5cbiAgICAgICAgdGhpcy5nbC5jbGVhcihtYXNrKTtcbiAgICB9XG5cbiAgICBzZXRfdmlld3BvcnQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHdpZHRoID0gTWF0aC5tYXgoMCwgd2lkdGgpO1xuICAgICAgICBoZWlnaHQgPSBNYXRoLm1heCgwLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLmxhc3Rfdmlld3BvcnQuY29weSh0aGlzLnZpZXdwb3J0KTtcbiAgICAgICAgdGhpcy52aWV3cG9ydC5zZXQoeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMuZ2wudmlld3BvcnQoeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgc2V0X3BpcGVsaW5lKHBpcGVsaW5lOiBQaXBlbGluZSk6IHZvaWQge1xuICAgICAgICBpZiAoIXBpcGVsaW5lLnZhbGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGB1c2luZyBpbnZhbGlkIHBpcGVsaW5lICR7cGlwZWxpbmUubmFtZSA/PyAnJ31gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdlYmdsX3RleHR1cmVfc2xvdF9yZXNldCgpO1xuXG4gICAgICAgIGlmICh0aGlzLnBpcGVsaW5lID09PSBwaXBlbGluZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIHBpcGVsaW5lXG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX3N0YXJ0KCdzZXQgcGlwZWxpbmUnLCBwaXBlbGluZS5uYW1lLCBwaXBlbGluZSwgRnJhbWVDYXB0dXJlTm9kZVR5cGUuUGlwZWxpbmUpO1xuICAgICAgICBnbC51c2VQcm9ncmFtKHBpcGVsaW5lLnByb2dyYW0pO1xuXG4gICAgICAgIGNvbnN0IHsgY3VsbF9tb2RlLCBkZXB0aF93cml0ZSwgZGVwdGhfY29tcGFyZV9mdW5jLCB2ZXJ0ZXhfb3JkZXIsIGJsZW5kIH0gPSBwaXBlbGluZTtcblxuICAgICAgICBpZiAodGhpcy5waXBlbGluZSA9PT0gdW5kZWZpbmVkIHx8IGN1bGxfbW9kZSAhPT0gdGhpcy5waXBlbGluZS5jdWxsX21vZGUpIHtcbiAgICAgICAgICAgIGlmIChkZXB0aF9jb21wYXJlX2Z1bmMgPT09IERlcHRoQ29tcGFyZUZ1bmMuTmV2ZXIgfHwgY3VsbF9tb2RlID09IEN1bGxNb2RlLk5vbmUpIHtcbiAgICAgICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICAgICAgICAgIGdsLmN1bGxGYWNlKGN1bGxfbW9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5waXBlbGluZSA9PT0gdW5kZWZpbmVkIHx8IGRlcHRoX2NvbXBhcmVfZnVuYyAhPT0gdGhpcy5waXBlbGluZS5kZXB0aF9jb21wYXJlX2Z1bmMpIHtcbiAgICAgICAgICAgIGlmIChkZXB0aF9jb21wYXJlX2Z1bmMgPT09IERlcHRoQ29tcGFyZUZ1bmMuTmV2ZXIpIHtcbiAgICAgICAgICAgICAgICBnbC5kaXNhYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgICAgICAgICAgZ2wuZGVwdGhGdW5jKGRlcHRoX2NvbXBhcmVfZnVuYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5waXBlbGluZSA9PT0gdW5kZWZpbmVkIHx8IGRlcHRoX3dyaXRlICE9PSB0aGlzLnBpcGVsaW5lLmRlcHRoX3dyaXRlKSB7XG4gICAgICAgICAgICBnbC5kZXB0aE1hc2soZGVwdGhfd3JpdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGlwZWxpbmUgPT09IHVuZGVmaW5lZCB8fCB2ZXJ0ZXhfb3JkZXIgIT09IHRoaXMucGlwZWxpbmUudmVydGV4X29yZGVyKSB7XG4gICAgICAgICAgICBnbC5mcm9udEZhY2UodmVydGV4X29yZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBpcGVsaW5lID09PSB1bmRlZmluZWQgfHwgYmxlbmQuZW5hYmxlZCAhPT0gdGhpcy5waXBlbGluZS5ibGVuZC5lbmFibGVkKSB7XG4gICAgICAgICAgICBpZiAoYmxlbmQgJiYgYmxlbmQuZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuQkxFTkQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5waXBlbGluZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBibGVuZC5zcmNfY29sb3JfZmFjdG9yICE9PSB0aGlzLnBpcGVsaW5lLmJsZW5kLnNyY19jb2xvcl9mYWN0b3IgfHxcbiAgICAgICAgICAgIGJsZW5kLmRzdF9jb2xvcl9mYWN0b3IgIT09IHRoaXMucGlwZWxpbmUuYmxlbmQuZHN0X2NvbG9yX2ZhY3RvciB8fFxuICAgICAgICAgICAgYmxlbmQuc3JjX2FscGhhX2ZhY3RvciAhPT0gdGhpcy5waXBlbGluZS5ibGVuZC5zcmNfYWxwaGFfZmFjdG9yIHx8XG4gICAgICAgICAgICBibGVuZC5kc3RfYWxwaGFfZmFjdG9yICE9PSB0aGlzLnBpcGVsaW5lLmJsZW5kLmRzdF9hbHBoYV9mYWN0b3IgfHxcbiAgICAgICAgICAgIGJsZW5kLmNvbG9yX2Z1bmMgIT09IHRoaXMucGlwZWxpbmUuYmxlbmQuY29sb3JfZnVuYyB8fFxuICAgICAgICAgICAgYmxlbmQuYWxwaGFfZnVuYyAhPT0gdGhpcy5waXBlbGluZS5ibGVuZC5hbHBoYV9mdW5jXG4gICAgICAgICkge1xuICAgICAgICAgICAgZ2wuYmxlbmRGdW5jU2VwYXJhdGUoYmxlbmQuc3JjX2NvbG9yX2ZhY3RvciwgYmxlbmQuZHN0X2NvbG9yX2ZhY3RvciwgYmxlbmQuc3JjX2FscGhhX2ZhY3RvciwgYmxlbmQuZHN0X2FscGhhX2ZhY3Rvcik7XG4gICAgICAgICAgICBnbC5ibGVuZEVxdWF0aW9uU2VwYXJhdGUoYmxlbmQuY29sb3JfZnVuYywgYmxlbmQuYWxwaGFfZnVuYyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBpcGVsaW5lID0gcGlwZWxpbmU7XG4gICAgICAgIHRoaXMudW5pZm9ybV9jYWNoZS5jbGVhcigpO1xuXG4gICAgICAgIGNvbnN0IGZyYW1lX2Jsb2NrID0gcGlwZWxpbmUudW5pZm9ybV9ibG9ja1tSZW5kZXJCbG9ja05hbWUuRnJhbWVdIGFzIFN0cnVjdFVuaWZvcm07XG4gICAgICAgIGlmIChmcmFtZV9ibG9jayAmJiBwaXBlbGluZS5mcmFtZV9ibG9jaykge1xuICAgICAgICAgICAgYmxvY2tfYmluZChwaXBlbGluZSwgcGlwZWxpbmUuZnJhbWVfYmxvY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCB1bmlmb3JtIG9mIHBpcGVsaW5lLnVuaWZvcm1zKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gdW5pZm9ybS5uYW1lO1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybV92YWx1ZSA9IHVuaWZvcm0uZGVmYXVsdF92YWx1ZTtcbiAgICAgICAgICAgIGlmICh1bmlmb3JtX3ZhbHVlICE9PSB1bmRlZmluZWQpIHVuaWZvcm0udXBsb2FkKHVuaWZvcm1fdmFsdWUpO1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtX2NhY2hlLnNldChuYW1lLCB1bmlmb3JtX3ZhbHVlKTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2VfZW5kKCdzZXQgcGlwZWxpbmUnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZV9mcmFtZV91bmlmb3JtKCkge1xuICAgICAgICBpZiAoIXRoaXMuY2FtZXJhIHx8ICF0aGlzLnBpcGVsaW5lKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGZyYW1lX2Jsb2NrID0gdGhpcy5waXBlbGluZS5mcmFtZV9ibG9jaztcbiAgICAgICAgY29uc3QgZnJhbWVfc3RydWN0ID0gdGhpcy5waXBlbGluZS51bmlmb3JtX2Jsb2NrW1JlbmRlckJsb2NrTmFtZS5GcmFtZV0gYXMgU3RydWN0VW5pZm9ybTtcbiAgICAgICAgaWYgKCFmcmFtZV9ibG9jayB8fCAhZnJhbWVfc3RydWN0KSByZXR1cm47XG4gICAgICAgIHRoaXMuY2FtZXJhLnZpZXdfbWF0cml4LndyaXRlKGZyYW1lX2Jsb2NrPy52aWV3LmYzMl92aWV3LCBmcmFtZV9zdHJ1Y3QuaXRlbXNbJ3ZpZXdfbWF0cml4J10uYnl0ZV9vZmZzZXQgLyA0KTtcbiAgICAgICAgdGhpcy5jYW1lcmEucHJvamVjdGlvbl9tYXRyaXgud3JpdGUoZnJhbWVfYmxvY2s/LnZpZXcuZjMyX3ZpZXcsIGZyYW1lX3N0cnVjdC5pdGVtc1sncHJvamVjdGlvbl9tYXRyaXgnXS5ieXRlX29mZnNldCAvIDQpO1xuICAgICAgICBpZiAodGhpcy5waXBlbGluZS5mcmFtZV9ibG9jaylcbiAgICAgICAge1xuICAgICAgICAgICAgdXBsb2FkX2Jsb2NrKGZyYW1lX2Jsb2NrKTtcbiAgICAgICAgICAgIGJsb2NrX2JpbmQodGhpcy5waXBlbGluZSwgdGhpcy5waXBlbGluZS5mcmFtZV9ibG9jayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRfc2Npc3Nvcih4PzogbnVtYmVyLCB5PzogbnVtYmVyLCB3aWR0aD86IG51bWJlciwgaGVpZ2h0PzogbnVtYmVyLCBkZXNjcmlwdGlvbj86IHN0cmluZykge1xuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGlmICh4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuU0NJU1NPUl9URVNUKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZShnbC5TQ0lTU09SX1RFU1QpO1xuICAgICAgICAgICAgZ2wuc2Npc3Nvcih4LCB5ISwgd2lkdGghLCBoZWlnaHQhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldF9tYXRlcmlhbChtYXRlcmlhbDogTWF0ZXJpYWwsIGRlc2NyaXB0aW9uPzogc3RyaW5nKSB7XG4gICAgICAgIC8vIGlmIChtYXRlcmlhbC4pXG4gICAgfTtcblxuICAgIHNldF9kcmF3ID0gKGRyYXc6IFdlYkdMRHJhdywgb2JqZWN0PzogUmVuZGVyT2JqZWN0LCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2Vfc3RhcnQoJ3NldCBkcmF3JywgZGVzY3JpcHRpb24sIGRyYXcsIEZyYW1lQ2FwdHVyZU5vZGVUeXBlLkRyYXcpO1xuXG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgaWYgKHRoaXMucGlwZWxpbmUgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdObyBhY3RpdmUgcGlwZWxpbmUnKTtcblxuICAgICAgICBjb25zdCBwaXBlbGluZSA9IHRoaXMucGlwZWxpbmUhO1xuICAgICAgICBjb25zdCBwaXBfdW5pZm9ybXMgPSBwaXBlbGluZS51bmlmb3JtcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaXBfdW5pZm9ybXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IHBpcF91bmlmb3JtID0gcGlwX3VuaWZvcm1zW2ldO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHBpcF91bmlmb3JtLm5hbWU7XG4gICAgICAgICAgICBsZXQgdW5pZm9ybTogVW5pZm9ybVZhbHVlO1xuICAgICAgICAgICAgaWYgKG9iamVjdD8ubWF0ZXJpYWxfYmxvY2s/Lmhhc19wcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0gPSBvYmplY3QubWF0ZXJpYWxfYmxvY2suZ2V0X3Byb3BlcnR5KG5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1bmlmb3JtID0gZHJhdy51bmlmb3Jtc1tuYW1lXSB8fCBwaXBlbGluZS51bmlmb3JtX2Jsb2NrW25hbWVdLmRlZmF1bHRfdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhpcyB1bmlmb3JtIGhhcyBiZWVuIHVwbG9hZGVkLlxuICAgICAgICAgICAgY29uc3QgY2FjaGVkX3VuaWZvcm0gPSB0aGlzLnVuaWZvcm1fY2FjaGUuZ2V0KG5hbWUpO1xuICAgICAgICAgICAgaWYgKGNhY2hlZF91bmlmb3JtID09PSB1bmlmb3JtICYmICFkcmF3LmZvcmNlX3VwZGF0ZS5oYXMobmFtZSkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAvLyBVcGxvYWQgdW5pZm9ybSAmIGNhY2hlXG4gICAgICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2Vfc3RhcnQoJ3VwbG9hZCB1bmlmb3JtJywgYCR7bmFtZX0gJHt1bmlmb3JtfWAsIHVuaWZvcm0sIEZyYW1lQ2FwdHVyZU5vZGVUeXBlLkNvbnN0YW50QnVmZmVyKTtcbiAgICAgICAgICAgIGlmICh1bmlmb3JtICE9PSB1bmRlZmluZWQpIHBpcF91bmlmb3JtLnVwbG9hZCh1bmlmb3JtKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9lbmQoJ3VwbG9hZCB1bmlmb3JtJyk7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1fY2FjaGUuc2V0KG5hbWUsIHVuaWZvcm0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RydWN0X3VuaWZvcm0gPSBwaXBlbGluZS51bmlmb3JtX2Jsb2NrW1JlbmRlckJsb2NrTmFtZS5PYmplY3RdIGFzIFN0cnVjdFVuaWZvcm07XG4gICAgICAgIGNvbnN0IHJlbmRlcl9vYmplY3QgPSBvYmplY3Q/LnJlbmRlcl9ibG9jaztcbiAgICAgICAgaWYgKHJlbmRlcl9vYmplY3QgJiYgc3RydWN0X3VuaWZvcm0pIHtcbiAgICAgICAgICAgIGJsb2NrX2JpbmQocGlwZWxpbmUsIHJlbmRlcl9vYmplY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRyYXcud2ViZ2xfdmFvID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KGRyYXcud2ViZ2xfdmFvKTtcblxuICAgICAgICBpZiAoZHJhdy5yYW5nZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoZHJhdy5pbmRleGVkKSB7XG4gICAgICAgICAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGRyYXcudHlwZSwgZHJhdy5yYW5nZS5jb3VudCwgZ2wuVU5TSUdORURfSU5ULCBkcmF3LnJhbmdlLnN0YXJ0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuZHJhd0FycmF5cyhkcmF3LnR5cGUsIGRyYXcucmFuZ2Uuc3RhcnQsIGRyYXcucmFuZ2UuY291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRyYXcuaW5kZXhlZCkge1xuICAgICAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50cyhkcmF3LnR5cGUsIGRyYXcubWF4X3ZlcnRleF9jb3VudCwgZ2wuVU5TSUdORURfSU5ULCAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuZHJhd0FycmF5cyhkcmF3LnR5cGUsIDAsIGRyYXcubWF4X3ZlcnRleF9jb3VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2VfZW5kKCdzZXQgZHJhdycpO1xuICAgIH07XG5cbiAgICBzZXRfbWF0ZXJpYWxfYmxvY2sobWF0ZXJpYWw6IE1hdGVyaWFsQmxvY2ssIGRlc2NyaXB0aW9uPzogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLnBpcGVsaW5lID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX3N0YXJ0KCdzZXQgbWF0ZXJpYWwgYmxvY2snLCBkZXNjcmlwdGlvbik7XG5cbiAgICAgICAgY29uc3QgcGlwZWxpbmUgPSB0aGlzLnBpcGVsaW5lITtcbiAgICAgICAgY29uc3QgcGlwX3VuaWZvcm1zID0gcGlwZWxpbmUudW5pZm9ybXM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGlwX3VuaWZvcm1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBwaXBfdW5pZm9ybSA9IHBpcF91bmlmb3Jtc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBwaXBfdW5pZm9ybS5uYW1lO1xuICAgICAgICAgICAgaWYgKCFtYXRlcmlhbC5oYXNfcHJvcGVydHkobmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybSA9IG1hdGVyaWFsLmdldF9wcm9wZXJ0eShuYW1lKTtcblxuICAgICAgICAgICAgLy8gVXBsb2FkIHVuaWZvcm0gJiBjYWNoZVxuICAgICAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX3N0YXJ0KCd1cGxvYWQgdW5pZm9ybScsIGAke25hbWV9ICR7dW5pZm9ybX1gLCB1bmlmb3JtLCBGcmFtZUNhcHR1cmVOb2RlVHlwZS5Db25zdGFudEJ1ZmZlcik7XG4gICAgICAgICAgICBpZiAodW5pZm9ybSAhPT0gdW5kZWZpbmVkKSBwaXBfdW5pZm9ybS51cGxvYWQodW5pZm9ybSk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2VfZW5kKCd1cGxvYWQgdW5pZm9ybScpO1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtX2NhY2hlLnNldChuYW1lLCB1bmlmb3JtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX2VuZCgnc2V0IG1hdGVyaWFsIGJsb2NrJyk7XG4gICAgfVxuXG4gICAgc2V0X21lc2gobWVzaDogR1BVTWVzaCwgZGVzY3JpcHRpb24/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2Vfc3RhcnQoJ3NldCBtZXNoJywgZGVzY3JpcHRpb24pO1xuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobWVzaC52YW8pO1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2VfZW5kKCdzZXQgbWVzaCcpO1xuICAgIH1cblxuICAgIGRyYXdfbWVzaChtZXNoOiBHUFVNZXNoLCBkZXNjcmlwdGlvbj86IHN0cmluZykge1xuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9zdGFydCgnZHJhdyBtZXNoJywgZGVzY3JpcHRpb24sIG1lc2gsIEZyYW1lQ2FwdHVyZU5vZGVUeXBlLk1lc2gpO1xuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobWVzaC52YW8pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lc2guc3ViX21lc2hlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKG1lc2guaW5kZXhlZCkge1xuICAgICAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50cyhQcmltaXRpdmVUeXBlLlRyaWFuZ2xlcywgbWVzaC5pbmRleF9jb3VudCwgZ2wuVU5TSUdORURfSU5ULCAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuZHJhd0FycmF5cyhQcmltaXRpdmVUeXBlLlRyaWFuZ2xlcywgMCwgbWVzaC52ZXJ0ZXhfY291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9lbmQoJ2RyYXcgbWVzaCcpO1xuICAgIH1cblxuICAgIGRyYXdfc3VibWVzaChtZXNoOiBTdWJNZXNoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX3N0YXJ0KCdkcmF3IHN1YiBtZXNoJyk7XG4gICAgICAgIGlmIChtZXNoLmluZGV4ZWQpIHtcbiAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50cyhQcmltaXRpdmVUeXBlLlRyaWFuZ2xlcywgbWVzaC5pbmRleF9jb3VudCwgZ2wuVU5TSUdORURfSU5ULCBtZXNoLmluZGV4X3N0YXJ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLmRyYXdBcnJheXMoUHJpbWl0aXZlVHlwZS5UcmlhbmdsZXMsIG1lc2guaW5kZXhfc3RhcnQsIG1lc2guaW5kZXhfY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tbWl0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVsaW5lID0gdW5kZWZpbmVkO1xuICAgICAgICB3ZWJnbF90ZXh0dXJlX3Nsb3RfcmVzZXQoKTtcbiAgICAgICAgdGhpcy51bmlmb3JtX2NhY2hlLmNsZWFyKCk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHBvb2xfZ2V0LCBwb29sX3JldHVybiB9IGZyb20gJy4uL2FkdCc7XG5pbXBvcnQgeyBjbGFtcCB9IGZyb20gJy4uL21hdGgvbWF0aCc7XG5pbXBvcnQgeyBGbG9hdDIsIEZsb2F0MyB9IGZyb20gJy4uL21hdGgvc2ltZCc7XG5pbXBvcnQgeyBTcGhlcmljYWwgfSBmcm9tICcuLi9tYXRoL3NwaGVyaWNhbCc7XG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tICcuL2NhbWVyYSc7XG5cbmV4cG9ydCBjbGFzcyBTcGhlcmljYWxDb250cm9sIHtcbiAgICBlbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcbiAgICBtb3ZhYmxlOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIGludGVycG9sYXRlZF9zcGhlcmljYWw6IFNwaGVyaWNhbCA9IG5ldyBTcGhlcmljYWwoKTtcbiAgICBjdXJyZW50X3NwaGVyaWNhbDogU3BoZXJpY2FsID0gbmV3IFNwaGVyaWNhbCgpO1xuXG4gICAgY2VudGVyOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG4gICAgaW50ZXJwb2xhdGVkX2NlbnRlcjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG4gICAgZGFtcGluZzogbnVtYmVyID0gMC40NTsgLy8gbXNcblxuICAgIGxvY2F0aW9uOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG4gICAgaW50ZXJwb2xhdGVkX2xvY2F0aW9uOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5cbiAgICByb3RhdGVfc3BlZWQ6IG51bWJlciA9IE1hdGguUEkgKiAyO1xuICAgIHpvb21fc3BlZWQ6IG51bWJlciA9IDEuMDtcbiAgICBtb3ZlX3NwZWVkOiBudW1iZXIgPSAyLjA7XG5cbiAgICBtaW5fcG9sYXJfYW5nbGU6IG51bWJlciA9IDFlLTM7XG4gICAgbWF4X3BvbGFyX2FuZ2xlOiBudW1iZXIgPSBNYXRoLlBJO1xuXG4gICAgY2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIGNhbWVyYTogQ2FtZXJhKSB7XG4gICAgICAgIHRoaXMuc2V0X3RhcmdldChjYW1lcmEubG9jYXRpb24pO1xuICAgICAgICBjYW1lcmEubG9va19hdCh0aGlzLmNlbnRlcik7XG4gICAgfVxuXG4gICAgc2V0X3RhcmdldChsb2NhdGlvbjogRmxvYXQzKTogdm9pZCB7XG4gICAgICAgIHRoaXMubG9jYXRpb24uY29weShsb2NhdGlvbik7XG4gICAgICAgIHRoaXMuY3VycmVudF9zcGhlcmljYWwuZnJvbV9mbG9hdDModGhpcy5sb2NhdGlvbik7XG4gICAgICAgIHRoaXMuaW50ZXJwb2xhdGVkX3NwaGVyaWNhbC5jb3B5KHRoaXMuY3VycmVudF9zcGhlcmljYWwpO1xuICAgICAgICB0aGlzLmludGVycG9sYXRlZF9jZW50ZXIuY29weSh0aGlzLmNlbnRlcik7XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgc2V0X2NlbnRlcihsb2NhdGlvbjogRmxvYXQzKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2VudGVyLmNvcHkobG9jYXRpb24pO1xuICAgIH1cblxuICAgIHJvdGF0ZV9ob3Jpem9udGFsKGFuZ2xlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdXJyZW50X3NwaGVyaWNhbC5waGkgKz0gYW5nbGUgKiB0aGlzLnJvdGF0ZV9zcGVlZDtcbiAgICAgICAgaWYgKGFuZ2xlICE9PSAwKSB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJvdGF0ZV92ZXJ0aWNhbChhbmdsZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3VycmVudF9zcGhlcmljYWwudGhldGEgPSBjbGFtcCh0aGlzLmN1cnJlbnRfc3BoZXJpY2FsLnRoZXRhIC0gYW5nbGUgKiB0aGlzLnJvdGF0ZV9zcGVlZCwgdGhpcy5taW5fcG9sYXJfYW5nbGUsIHRoaXMubWF4X3BvbGFyX2FuZ2xlKTtcbiAgICAgICAgaWYgKGFuZ2xlICE9PSAwKSB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIG1vdmUoZGVsdGE6IEZsb2F0Mik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMubW92YWJsZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB2ZWN0b3IgPSBwb29sX2dldChGbG9hdDMpO1xuICAgICAgICB2ZWN0b3Iuc2V0KGRlbHRhLngsIGRlbHRhLnksIDApLm11bCh0aGlzLmN1cnJlbnRfc3BoZXJpY2FsLnJhZGl1cyAqIHRoaXMubW92ZV9zcGVlZCk7XG4gICAgICAgIHRoaXMuY2VudGVyLmFkZCh2ZWN0b3IuYXBwbHlfcXVhdGVybmlvbih0aGlzLmNhbWVyYS5yb3RhdGlvbikpO1xuICAgICAgICBpZiAoZGVsdGEueCAhPT0gMCB8fCBkZWx0YS55ICE9PSAwKSB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBwb29sX3JldHVybih2ZWN0b3IpO1xuICAgIH1cblxuICAgIHpvb20oc2NhbGU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmN1cnJlbnRfc3BoZXJpY2FsLnJhZGl1cyAqPSBzY2FsZSAqIHRoaXMuem9vbV9zcGVlZDtcbiAgICAgICAgaWYgKHNjYWxlICE9PSAxKSB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLmludGVycG9sYXRlZF9zcGhlcmljYWwubGVycCh0aGlzLmN1cnJlbnRfc3BoZXJpY2FsLCB0aGlzLmRhbXBpbmcpO1xuICAgICAgICB0aGlzLmludGVycG9sYXRlZF9sb2NhdGlvbi5mcm9tX3NwaGVyaWNhbCh0aGlzLmludGVycG9sYXRlZF9zcGhlcmljYWwpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJwb2xhdGVkX2NlbnRlci5sZXJwKHRoaXMuY2VudGVyLCB0aGlzLmRhbXBpbmcpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJwb2xhdGVkX2xvY2F0aW9uLmFkZCh0aGlzLmludGVycG9sYXRlZF9jZW50ZXIpO1xuICAgICAgICB0aGlzLmxvY2F0aW9uLmNvcHkodGhpcy5pbnRlcnBvbGF0ZWRfbG9jYXRpb24pO1xuXG4gICAgICAgIHRoaXMuY2FtZXJhLmxvY2F0aW9uLmNvcHkodGhpcy5sb2NhdGlvbik7XG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tfYXQodGhpcy5pbnRlcnBvbGF0ZWRfY2VudGVyKTtcblxuICAgICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuY2hhbmdlZDtcbiAgICAgICAgdGhpcy5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBwb29sX2dldCB9IGZyb20gJy4uL2FkdCc7XG5pbXBvcnQgeyBCb3gzIH0gZnJvbSAnLi4vbWF0aCc7XG5pbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuLi9tYXRoL3NpbWQnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvc2ltZF9tYXQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFZlcnRleERhdGEge1xuICAgIHBvc2l0aW9uPzogRmxvYXQzMkFycmF5O1xuICAgIGluZGV4PzogVWludDE2QXJyYXkgfCBVaW50MzJBcnJheTtcbiAgICBub3JtYWw/OiBGbG9hdDMyQXJyYXk7XG4gICAgdGFuZ2VudD86IEZsb2F0MzJBcnJheTtcbiAgICB1dj86IEZsb2F0MzJBcnJheTtcbiAgICB1djI/OiBGbG9hdDMyQXJyYXk7XG4gICAgdXYzPzogRmxvYXQzMkFycmF5O1xuICAgIHV2ND86IEZsb2F0MzJBcnJheTtcbiAgICB1djU/OiBGbG9hdDMyQXJyYXk7XG4gICAgdXY2PzogRmxvYXQzMkFycmF5O1xuICAgIGNvbG9yPzogRmxvYXQzMkFycmF5O1xuICAgIGpvaW50PzogVWludDMyQXJyYXk7XG4gICAgd2VpZ2h0PzogRmxvYXQzMkFycmF5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVydGV4X2RhdGFfdHJhbnNmb3JtKGRhdGE6IFZlcnRleERhdGEsIG1hdHJpeDogTWF0NCk6IFZlcnRleERhdGEge1xuICAgIGlmIChkYXRhLnBvc2l0aW9uKSBfdHJhbnNmb3JtX3Bvc2l0aW9uKGRhdGEucG9zaXRpb24sIG1hdHJpeCk7XG4gICAgaWYgKGRhdGEubm9ybWFsKSBfdHJhbnNmb3JtX25vcm1hbChkYXRhLm5vcm1hbCwgbWF0cml4KTtcbiAgICBpZiAoZGF0YS50YW5nZW50KSBfdHJhbnNmb3JtX3RhbmdlbnQoZGF0YS50YW5nZW50LCBtYXRyaXgpO1xuICAgIGlmIChkYXRhLmluZGV4ICYmIG1hdHJpeC5kZXRlcm1pbmFudCgpIDwgMCkgX2ZsaXBfZmFjZShkYXRhLmluZGV4KTtcbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcnRleF9kYXRhX2NvbXB1dGVfYm94KGRhdGE6IFZlcnRleERhdGEsIGJveD86IEJveDMpOiBCb3gzIHtcbiAgICBib3ggPSBib3ggPz8gbmV3IEJveDMoKTtcbiAgICBjb25zdCB2ID0gcG9vbF9nZXQoRmxvYXQzKTtcbiAgICBpZiAoZGF0YS5wb3NpdGlvbikge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBkYXRhLnBvc2l0aW9uO1xuICAgICAgICBjb25zdCBlbmQgPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgICAgICAgICB2LnNldChidWZmZXJbaV0sIGJ1ZmZlcltpICsgMV0sIGJ1ZmZlcltpICsgMl0pO1xuICAgICAgICAgICAgYm94LmV4cGFuZF9wb2ludCh2KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYm94O1xufVxuXG5jb25zdCBfdmVydGV4X3YgPSBuZXcgRmxvYXQzKCk7XG5cbmZ1bmN0aW9uIF90cmFuc2Zvcm1fcG9zaXRpb24ocG9zaXRpb25zOiBGbG9hdDMyQXJyYXksIG1hdHJpeDogTWF0NCwgb2Zmc2V0OiBudW1iZXIgPSAwLCBjb3VudD86IG51bWJlcikge1xuICAgIGxldCBlbmQgPSBvZmZzZXQgKyAoY291bnQgPz8gcG9zaXRpb25zLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IG9mZnNldDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgICAgIF92ZXJ0ZXhfdi5zZXQocG9zaXRpb25zW2ldLCBwb3NpdGlvbnNbaSArIDFdLCBwb3NpdGlvbnNbaSArIDJdKTtcbiAgICAgICAgX3ZlcnRleF92LmFwcGx5X21hdDQobWF0cml4KTtcbiAgICAgICAgcG9zaXRpb25zW2ldID0gX3ZlcnRleF92Lng7XG4gICAgICAgIHBvc2l0aW9uc1tpICsgMV0gPSBfdmVydGV4X3YueTtcbiAgICAgICAgcG9zaXRpb25zW2kgKyAyXSA9IF92ZXJ0ZXhfdi56O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX3RyYW5zZm9ybV9ub3JtYWwobm9ybWFsczogRmxvYXQzMkFycmF5LCBtYXRyaXg6IE1hdDQsIG9mZnNldDogbnVtYmVyID0gMCwgY291bnQ/OiBudW1iZXIpIHtcbiAgICBsZXQgZW5kID0gb2Zmc2V0ICsgKGNvdW50ID8/IG5vcm1hbHMubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gb2Zmc2V0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICAgICAgX3ZlcnRleF92LnNldChub3JtYWxzW2ldLCBub3JtYWxzW2kgKyAxXSwgbm9ybWFsc1tpICsgMl0pO1xuICAgICAgICBfdmVydGV4X3YuYXBwbHlfbWF0NF9kaXJlY3Rpb25hbChtYXRyaXgpO1xuICAgICAgICBub3JtYWxzW2ldID0gX3ZlcnRleF92Lng7XG4gICAgICAgIG5vcm1hbHNbaSArIDFdID0gX3ZlcnRleF92Lnk7XG4gICAgICAgIG5vcm1hbHNbaSArIDJdID0gX3ZlcnRleF92Lno7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfdHJhbnNmb3JtX3RhbmdlbnQodGFuZ25ldHM6IEZsb2F0MzJBcnJheSwgbWF0cml4OiBNYXQ0LCBvZmZzZXQ6IG51bWJlciA9IDAsIGNvdW50PzogbnVtYmVyKSB7XG4gICAgbGV0IGVuZCA9IG9mZnNldCArIChjb3VudCA/PyB0YW5nbmV0cy5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSBvZmZzZXQ7IGkgPCBlbmQ7IGkgKz0gNCkge1xuICAgICAgICBfdmVydGV4X3Yuc2V0KHRhbmduZXRzW2ldLCB0YW5nbmV0c1tpICsgMV0sIHRhbmduZXRzW2kgKyAyXSk7XG4gICAgICAgIF92ZXJ0ZXhfdi5hcHBseV9tYXQ0X2RpcmVjdGlvbmFsKG1hdHJpeCk7XG4gICAgICAgIHRhbmduZXRzW2ldID0gX3ZlcnRleF92Lng7XG4gICAgICAgIHRhbmduZXRzW2kgKyAxXSA9IF92ZXJ0ZXhfdi55O1xuICAgICAgICB0YW5nbmV0c1tpICsgMl0gPSBfdmVydGV4X3YuejtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9mbGlwX2ZhY2UoaW5kaWNlOiBVaW50MTZBcnJheSB8IFVpbnQzMkFycmF5KSB7XG4gICAgbGV0IGVuZCA9IGluZGljZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgICAgICBsZXQgdCA9IGluZGljZVtpXTtcbiAgICAgICAgaW5kaWNlW2ldID0gaW5kaWNlW2kgKyAxXTtcbiAgICAgICAgaW5kaWNlW2kgKyAxXSA9IHQ7XG4gICAgfVxufSIsICJpbXBvcnQgeyBNZXNoLCBTdWJNZXNoLCB2ZXJ0ZXhfZGF0YV9jb21wdXRlX2JveCB9IGZyb20gJy4uL2VuZ2luZSc7XG5pbXBvcnQgeyBnZnhfZGV2aWNlX2dldCB9IGZyb20gJy4uL2dmeCc7XG5pbXBvcnQgeyBCb3gzIH0gZnJvbSAnLi4vbWF0aCc7XG5pbXBvcnQgeyBUeXBlZEFycmF5IH0gZnJvbSAnLi4vc3RkJztcbmltcG9ydCB7IGdldF9nbF9idWZmZXJfdHlwZSB9IGZyb20gJy4vZHJhdyc7XG5pbXBvcnQgeyBXZWJHTEVuY29kZXIgfSBmcm9tICcuL2VuY29kZXInO1xuaW1wb3J0IHsgRmxvYXRUeXBlLCBIYWxmRmxvYXRUeXBlIH0gZnJvbSAnLi90eXBlJztcblxuZXhwb3J0IGludGVyZmFjZSBHUFVNZXNoIHtcbiAgICB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3Q7XG4gICAgc3ViX21lc2hlczogU3ViTWVzaFtdO1xuICAgIHZlcnRleF9jb3VudDogbnVtYmVyO1xuICAgIGluZGV4X2NvdW50OiBudW1iZXI7XG4gICAgaW5kZXhlZDogYm9vbGVhbjtcbiAgICBib3g6IEJveDM7XG59XG5cbmV4cG9ydCBlbnVtIEdlbmVyaWNBdHRyaWJ1dGVOYW1lIHtcbiAgICBwb3NpdGlvbiA9ICdwb3NpdGlvbicsXG4gICAgdXYgPSAndXYnLFxuICAgIG5vcm1hbCA9ICdub3JtYWwnLFxuICAgIHRhbmdlbnQgPSAndGFuZ2VudCcsXG4gICAgam9pbnQgPSAnam9pbnQnLFxuICAgIHdlaWdodCA9ICd3ZWlnaHQnLFxuICAgIGNvbG9yID0gJ2NvbG9yJyxcbiAgICB1djIgPSAndXYyJyxcbiAgICB1djMgPSAndXYzJyxcbiAgICB1djQgPSAndXY0JyxcbiAgICB1djUgPSAndXY1JyxcbiAgICB1djYgPSAndXY2Jyxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KG5hbWU6IEdlbmVyaWNBdHRyaWJ1dGVOYW1lKTogbnVtYmVyIHtcbiAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgY2FzZSBHZW5lcmljQXR0cmlidXRlTmFtZS5wb3NpdGlvbjogcmV0dXJuIDA7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUudXY6IHJldHVybiAxO1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLm5vcm1hbDogcmV0dXJuIDI7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUudGFuZ2VudDogcmV0dXJuIDM7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUuam9pbnQ6IHJldHVybiA0O1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLndlaWdodDogcmV0dXJuIDU7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUuY29sb3I6IHJldHVybiA2O1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2MjogcmV0dXJuIDc7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUudXYzOiByZXR1cm4gODtcbiAgICAgICAgY2FzZSBHZW5lcmljQXR0cmlidXRlTmFtZS51djQ6IHJldHVybiA5O1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2NTogcmV0dXJuIDEwO1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2NjogcmV0dXJuIDExO1xuICAgIH1cbn1cblxuY29uc3QgZ3B1X21lc2hlcyA9IG5ldyBXZWFrTWFwPE1lc2gsIEdQVU1lc2g+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfZ3B1X21lc2gobWVzaDogTWVzaCkge1xuICAgIGNvbnN0IGNhY2hlZCA9IGdwdV9tZXNoZXMuZ2V0KG1lc2gpO1xuICAgIGlmIChjYWNoZWQpIHJldHVybiBjYWNoZWQ7XG5cbiAgICBjb25zdCBlbmNvZGVyID0gZ2Z4X2RldmljZV9nZXQoKS5lbmNvZGVyIGFzIFdlYkdMRW5jb2RlcjtcbiAgICBjb25zdCBnbCA9IGVuY29kZXIuZ2w7XG5cbiAgICBjb25zdCB2YW8gPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xuICAgIGNvbnN0IHsgdmVydGV4X2RhdGEsIHN1Yl9tZXNoZXMgfSA9IG1lc2g7XG5cbiAgICBmdW5jdGlvbiB1cGxvYWRfYnVmZmVyKGRhdGE6IFR5cGVkQXJyYXksIHNsb3Q6IG51bWJlciwgc2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBnZXRfZ2xfYnVmZmVyX3R5cGUoZGF0YSk7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgaWYgKHR5cGUgPT09IEZsb2F0VHlwZSB8fCB0eXBlID09PSBIYWxmRmxvYXRUeXBlKSB7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNsb3QsIHNpemUsIHR5cGUsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYklQb2ludGVyKHNsb3QsIHNpemUsIHR5cGUsIDAsIDApO1xuICAgICAgICB9XG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNsb3QpO1xuICAgIH1cblxuICAgIGNvbnN0IGJveCA9IHZlcnRleF9kYXRhX2NvbXB1dGVfYm94KHZlcnRleF9kYXRhKTtcblxuICAgIGlmICh2ZXJ0ZXhfZGF0YS5wb3NpdGlvbikgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS5wb3NpdGlvbiwgZ2V0X2dlbmVyaWNfYXR0cmlidXRlX3Nsb3QoR2VuZXJpY0F0dHJpYnV0ZU5hbWUucG9zaXRpb24pLCAzKTtcbiAgICBpZiAodmVydGV4X2RhdGEudXYpIHVwbG9hZF9idWZmZXIodmVydGV4X2RhdGEudXYsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2KSwgMik7XG4gICAgaWYgKHZlcnRleF9kYXRhLm5vcm1hbCkgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS5ub3JtYWwsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLm5vcm1hbCksIDMpO1xuICAgIGlmICh2ZXJ0ZXhfZGF0YS50YW5nZW50KSB1cGxvYWRfYnVmZmVyKHZlcnRleF9kYXRhLnRhbmdlbnQsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnRhbmdlbnQpLCA0KTtcbiAgICBpZiAodmVydGV4X2RhdGEuam9pbnQpIHVwbG9hZF9idWZmZXIodmVydGV4X2RhdGEuam9pbnQsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLmpvaW50KSwgNCk7XG4gICAgaWYgKHZlcnRleF9kYXRhLndlaWdodCkgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS53ZWlnaHQsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLndlaWdodCksIDQpO1xuICAgIGlmICh2ZXJ0ZXhfZGF0YS5jb2xvcikgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS5jb2xvciwgZ2V0X2dlbmVyaWNfYXR0cmlidXRlX3Nsb3QoR2VuZXJpY0F0dHJpYnV0ZU5hbWUuY29sb3IpLCA0KTtcbiAgICBpZiAodmVydGV4X2RhdGEudXYyKSB1cGxvYWRfYnVmZmVyKHZlcnRleF9kYXRhLnV2MiwgZ2V0X2dlbmVyaWNfYXR0cmlidXRlX3Nsb3QoR2VuZXJpY0F0dHJpYnV0ZU5hbWUudXYyKSwgMik7XG4gICAgaWYgKHZlcnRleF9kYXRhLnV2MykgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS51djMsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2MyksIDIpO1xuICAgIGlmICh2ZXJ0ZXhfZGF0YS51djQpIHVwbG9hZF9idWZmZXIodmVydGV4X2RhdGEudXY0LCBnZXRfZ2VuZXJpY19hdHRyaWJ1dGVfc2xvdChHZW5lcmljQXR0cmlidXRlTmFtZS51djQpLCAyKTtcbiAgICBpZiAodmVydGV4X2RhdGEudXY1KSB1cGxvYWRfYnVmZmVyKHZlcnRleF9kYXRhLnV2NSwgZ2V0X2dlbmVyaWNfYXR0cmlidXRlX3Nsb3QoR2VuZXJpY0F0dHJpYnV0ZU5hbWUudXY1KSwgMik7XG4gICAgaWYgKHZlcnRleF9kYXRhLnV2NikgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS51djYsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2NiksIDIpO1xuXG4gICAgbGV0IGluZGV4ZWQgPSBmYWxzZTtcbiAgICBpZiAodmVydGV4X2RhdGEuaW5kZXgpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHZlcnRleF9kYXRhLmluZGV4LCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGluZGV4ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHZlcnRleF9jb3VudCA9IHZlcnRleF9kYXRhLnBvc2l0aW9uID8gdmVydGV4X2RhdGEucG9zaXRpb24ubGVuZ3RoIC8gMyA6IDA7XG4gICAgY29uc3QgaW5kZXhfY291bnQgPSB2ZXJ0ZXhfZGF0YS5pbmRleCA/IHZlcnRleF9kYXRhLmluZGV4Lmxlbmd0aCA6IHZlcnRleF9jb3VudDtcblxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgICBjb25zdCBncHVfbWVzaCA9IHsgdmFvLCBzdWJfbWVzaGVzLCBpbmRleGVkLCBib3gsIHZlcnRleF9jb3VudCwgaW5kZXhfY291bnQgfSBhcyBHUFVNZXNoO1xuICAgIGdwdV9tZXNoZXMuc2V0KG1lc2gsIGdwdV9tZXNoKTtcbiAgICByZXR1cm4gZ3B1X21lc2g7XG59XG4iLCAiaW1wb3J0IHsgQm94MyB9IGZyb20gJy4uL21hdGgvYm94JztcbmltcG9ydCB7IEZsb2F0MyB9IGZyb20gJy4uL21hdGgvc2ltZCc7XG5pbXBvcnQgeyBTcGhlcmUgfSBmcm9tICcuLi9tYXRoL3NwaGVyZSc7XG5pbXBvcnQgeyBUcmlhbmdsZSB9IGZyb20gJy4uL21hdGgvdHJpYW5nbGUnO1xuaW1wb3J0IHsgT3B0aW9uYWwsIFR5cGVkQXJyYXkgfSBmcm9tICcuLi9zdGQvdHlwZSc7XG5pbXBvcnQgeyBHZW5lcmljQXR0cmlidXRlTmFtZSB9IGZyb20gJy4vbWVzaCc7XG5pbXBvcnQgeyBQaXBlbGluZSB9IGZyb20gJy4vcGlwZWxpbmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEluZGV4UmFuZ2Uge1xuICAgIHN0YXJ0OiBudW1iZXI7XG4gICAgY291bnQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHTEF0dHJpYnV0ZSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGJ1ZmZlcjogV2ViR0xCdWZmZXI7XG4gICAgc2xvdD86IFdlYWtNYXA8UGlwZWxpbmUsIG51bWJlcj4gfCBudW1iZXI7XG4gICAgc3RyaWRlOiBudW1iZXI7XG4gICAgZHluYW1pYzogYm9vbGVhbjtcbiAgICBzb3VyY2VfYnVmZmVyPzogVHlwZWRBcnJheTtcbiAgICB1cGRhdGVfbGVuZ3RoPzogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlPFQgZXh0ZW5kcyBUeXBlZEFycmF5ID0gYW55PiB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHN0cmlkZTogbnVtYmVyO1xuICAgIGJ1ZmZlcjogVDtcbiAgICBzbG90PzogbnVtYmVyO1xuICAgIGR5bmFtaWM/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByaW1pdGl2ZSB7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBhdHRyaWJ1dGVzOiBBdHRyaWJ1dGU8VHlwZWRBcnJheT5bXTtcbiAgICBpbmRleD86IFVpbnQzMkFycmF5O1xuICAgIHJhbmdlcz86IEluZGV4UmFuZ2VbXTtcbiAgICBjb21wcmVzc2VkX2RhdGE/OiBBcnJheUJ1ZmZlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlPFQgZXh0ZW5kcyBUeXBlZEFycmF5PihwcmltaXRpdmU6IFByaW1pdGl2ZSwgbmFtZTogc3RyaW5nID0gR2VuZXJpY0F0dHJpYnV0ZU5hbWUucG9zaXRpb24pOiBPcHRpb25hbDxBdHRyaWJ1dGU8VD4+IHtcbiAgICBpZiAocHJpbWl0aXZlLmF0dHJpYnV0ZXMgPT09IHVuZGVmaW5lZCB8fCBwcmltaXRpdmUuYXR0cmlidXRlcy5sZW5ndGggPCAxKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJpbWl0aXZlLmF0dHJpYnV0ZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgYXR0ciA9IHByaW1pdGl2ZS5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICBpZiAoYXR0ci5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gYXR0ciBhcyBBdHRyaWJ1dGU8VD47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldF9hdHRyaWJ1dGU8VCBleHRlbmRzIFR5cGVkQXJyYXk+KHByaW1pdGl2ZTogUHJpbWl0aXZlLCBhdHRyaWJ1dGU6IEF0dHJpYnV0ZTxUPik6IHZvaWQge1xuICAgIGlmIChhdHRyaWJ1dGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9sZCA9IHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlKHByaW1pdGl2ZSwgYXR0cmlidXRlLm5hbWUpO1xuICAgIGlmIChvbGQgPT09IG51bGwpIHtcbiAgICAgICAgcHJpbWl0aXZlLmF0dHJpYnV0ZXMucHVzaChhdHRyaWJ1dGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG9sZCEubmFtZSA9IGF0dHJpYnV0ZS5uYW1lO1xuICAgICAgICBvbGQhLnN0cmlkZSA9IGF0dHJpYnV0ZS5zdHJpZGU7XG4gICAgICAgIG9sZCEuYnVmZmVyID0gYXR0cmlidXRlLmJ1ZmZlcjtcbiAgICB9XG59XG5cbmNvbnN0IHByaW1pdGl2ZV92ID0gbmV3IEZsb2F0MygpO1xuY29uc3QgcHJpbWl0aXZlX2IgPSBuZXcgQm94MygpO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJpbWl0aXZlX2NvbXB1dGVfYm94KHByaW1pdGl2ZTogUHJpbWl0aXZlLCBib3g/OiBCb3gzKTogQm94MyB7XG4gICAgYm94ID0gYm94ID8/IG5ldyBCb3gzKCk7XG4gICAgYm94LnJlc2V0KCk7XG4gICAgY29uc3QgcG9zaXRpb24gPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUpO1xuICAgIGlmIChwb3NpdGlvbikge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBwb3NpdGlvbi5idWZmZXI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgICAgICBwcmltaXRpdmVfdi5yZWFkKGJ1ZmZlciwgaSk7XG4gICAgICAgICAgICBib3guZXhwYW5kX3BvaW50KHByaW1pdGl2ZV92KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYm94O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJpbWl0aXZlX2NvbXB1dGVfc3BoZXJlKHByaW1pdGl2ZTogUHJpbWl0aXZlLCBzcGhlcmU/OiBTcGhlcmUsIGJveD86IEJveDMpOiBTcGhlcmUge1xuICAgIHNwaGVyZSA9IHNwaGVyZSA/PyBuZXcgU3BoZXJlKCk7XG4gICAgaWYgKGJveCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHByaW1pdGl2ZV9jb21wdXRlX2JveChwcmltaXRpdmUsIHByaW1pdGl2ZV9iKTtcbiAgICAgICAgc3BoZXJlLmNlbnRlci5jb3B5KHByaW1pdGl2ZV9iLmNlbnRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BoZXJlLmNlbnRlci5jb3B5KGJveC5jZW50ZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IHBvc2l0aW9uID0gcHJpbWl0aXZlX2dldF9hdHRyaWJ1dGUocHJpbWl0aXZlKTtcbiAgICBsZXQgbWF4X3JhZGl1c19zcSA9IDA7XG4gICAgaWYgKHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IHBvc2l0aW9uLmJ1ZmZlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIHByaW1pdGl2ZV92LnJlYWQoYnVmZmVyLCBpKTtcbiAgICAgICAgICAgIG1heF9yYWRpdXNfc3EgPSBNYXRoLm1heChtYXhfcmFkaXVzX3NxLCBwcmltaXRpdmVfdi5kaXN0YW5jZV9zcXVhcmVkKHNwaGVyZS5jZW50ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzcGhlcmUucmFkaXVzID0gTWF0aC5zcXJ0KG1heF9yYWRpdXNfc3EpO1xuICAgIHJldHVybiBzcGhlcmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmltaXRpdmVfZ2V0X3RyaWFuZ2xlKHByaW1pdGl2ZTogUHJpbWl0aXZlLCBpbmRleDogbnVtYmVyLCB0cmlhbmdsZT86IFRyaWFuZ2xlKTogVHJpYW5nbGUge1xuICAgIHRyaWFuZ2xlID0gdHJpYW5nbGUgPz8gbmV3IFRyaWFuZ2xlKCk7XG4gICAgY29uc3QgaW5kZXhfYnVmZmVyID0gcHJpbWl0aXZlLmluZGV4O1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcHJpbWl0aXZlX2dldF9hdHRyaWJ1dGUocHJpbWl0aXZlKTtcbiAgICBpZiAoIXBvc2l0aW9uKSByZXR1cm4gdHJpYW5nbGU7XG5cbiAgICBpZiAoaW5kZXhfYnVmZmVyKSB7XG4gICAgICAgIHRyaWFuZ2xlLmEucmVhZChwb3NpdGlvbi5idWZmZXIsIGluZGV4X2J1ZmZlcltpbmRleCAqIDNdICogMyk7XG4gICAgICAgIHRyaWFuZ2xlLmIucmVhZChwb3NpdGlvbi5idWZmZXIsIGluZGV4X2J1ZmZlcltpbmRleCAqIDMgKyAxXSAqIDMpO1xuICAgICAgICB0cmlhbmdsZS5jLnJlYWQocG9zaXRpb24uYnVmZmVyLCBpbmRleF9idWZmZXJbaW5kZXggKiAzICsgMl0gKiAzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0cmlhbmdsZS5hLnJlYWQocG9zaXRpb24uYnVmZmVyLCBpbmRleCAqIDkpO1xuICAgICAgICB0cmlhbmdsZS5hLnJlYWQocG9zaXRpb24uYnVmZmVyLCBpbmRleCAqIDkgKyAzKTtcbiAgICAgICAgdHJpYW5nbGUuYS5yZWFkKHBvc2l0aW9uLmJ1ZmZlciwgaW5kZXggKiA5ICsgNik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyaWFuZ2xlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIHByaW1pdGl2ZV90cmlhbmdsZV9pdGVyYXRvcihwcmltaXRpdmU6IFByaW1pdGl2ZSwgdHJpYW5nbGU/OiBUcmlhbmdsZSk6IEl0ZXJhYmxlPFRyaWFuZ2xlPiB7XG4gICAgdHJpYW5nbGUgPSB0cmlhbmdsZSA/PyBuZXcgVHJpYW5nbGUoKTtcbiAgICBjb25zdCBpbmRleF9idWZmZXIgPSBwcmltaXRpdmUuaW5kZXg7XG4gICAgY29uc3QgcG9zaXRpb24gPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUpO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICBjb25zdCBwb3NpdGlvbl9idWZmZXIgPSBwb3NpdGlvbiEuYnVmZmVyO1xuICAgIGlmIChpbmRleF9idWZmZXIpIHtcbiAgICAgICAgY29uc3QgbWF4X3ZlcnRleF9jb3VudCA9IGluZGV4X2J1ZmZlci5sZW5ndGggLyAzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1heF92ZXJ0ZXhfY291bnQ7ICsraSkge1xuICAgICAgICAgICAgdHJpYW5nbGUuYS5yZWFkKHBvc2l0aW9uX2J1ZmZlciwgaW5kZXhfYnVmZmVyW2kgKiAzXSAqIDMpO1xuICAgICAgICAgICAgdHJpYW5nbGUuYi5yZWFkKHBvc2l0aW9uX2J1ZmZlciwgaW5kZXhfYnVmZmVyW2kgKiAzICsgMV0gKiAzKTtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmMucmVhZChwb3NpdGlvbl9idWZmZXIsIGluZGV4X2J1ZmZlcltpICogMyArIDJdICogMyk7XG4gICAgICAgICAgICB5aWVsZCB0cmlhbmdsZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1heF92ZXJ0ZXhfY291bnQgPSBwb3NpdGlvbl9idWZmZXIubGVuZ3RoIC8gOTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhfdmVydGV4X2NvdW50OyArK2kpIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmEucmVhZChwb3NpdGlvbl9idWZmZXIsIGkgKiA5KTtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmEucmVhZChwb3NpdGlvbl9idWZmZXIsIGkgKiA5ICsgMyk7XG4gICAgICAgICAgICB0cmlhbmdsZS5hLnJlYWQocG9zaXRpb25fYnVmZmVyLCBpICogOSArIDYpO1xuICAgICAgICAgICAgeWllbGQgdHJpYW5nbGU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmltaXRpdmVfZmxpcF9jb29yZGluYXRlX3N5c3RlbShwcmltaXRpdmU6IFByaW1pdGl2ZSk6IFByaW1pdGl2ZSB7XG4gICAgLy8gZmxpcCB0byBsZWZ0LWhhbmQgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICBjb25zdCBwb3NpdGlvbiA9IHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlKHByaW1pdGl2ZSk7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gcG9zaXRpb24hLmJ1ZmZlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGJ1ZmZlcltpXSA9IC1idWZmZXJbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbn1cbiIsICJpbXBvcnQgeyBQcmltaXRpdmUsIHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlLCBzZXRfYXR0cmlidXRlIH0gZnJvbSAnLi4vd2ViZ2wvcHJpbWl0aXZlJztcbmltcG9ydCB7IEZsb2F0MiwgRmxvYXQzIH0gZnJvbSAnLi9zaW1kJztcblxuLy8gdG1wIGxldCBmb3IgY29tcHV0ZVxubGV0IHYxOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgdjI6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxubGV0IFY6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxubGV0IFAxOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgUDI6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCBQMzogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG5sZXQgTjE6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCBOMjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xubGV0IE4zOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5cbmxldCBCMTogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xubGV0IEIyOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgQjM6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxubGV0IFQxOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgVDI6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCBUMzogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG5sZXQgdXYxOiBGbG9hdDIgPSBuZXcgRmxvYXQyKCk7XG5sZXQgdXYyOiBGbG9hdDIgPSBuZXcgRmxvYXQyKCk7XG5sZXQgdXYzOiBGbG9hdDIgPSBuZXcgRmxvYXQyKCk7XG5cbmxldCB0bXBWZWM6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCB0bXBGbG9hdDI6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxubGV0IGRzdDogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG4vLyB0bXAgbGV0IGZvciBnZW5lcmF0ZVxubGV0IHQ6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCBiOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgbjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xubGV0IHRtcDA6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCB0bXAxOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgdG1wMjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG4vKipcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jZWRyaWNwaW5zb24vb3NnanMvYmxvYi9tYXN0ZXIvc291cmNlcy9vc2dVdGlsL1RhbmdlbnRTcGFjZUdlbmVyYXRvci5qc1xuICovXG5leHBvcnQgY2xhc3MgVGFuZ2VudEdlbmVyYXRvciB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgVDogRmxvYXQzMkFycmF5IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgc3RhdGljIEI6IEZsb2F0MzJBcnJheSB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIHN0YXRpYyBOOiBGbG9hdDMyQXJyYXkgfCB1bmRlZmluZWQ7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBwcmVwYXJlKHByaW1pdGl2ZTogUHJpbWl0aXZlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHZ4ID0gcHJpbWl0aXZlX2dldF9hdHRyaWJ1dGUocHJpbWl0aXZlLCAncG9zaXRpb24nKSEuYnVmZmVyIGFzIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY29uc3QgbnggPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsICdub3JtYWwnKSEuYnVmZmVyIGFzIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY29uc3QgdHggPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsICd1dicpIS5idWZmZXIgYXMgRmxvYXQzMkFycmF5O1xuICAgICAgICBjb25zdCBpbmRleCA9IHByaW1pdGl2ZS5pbmRleDtcblxuICAgICAgICBsZXQgblZ4O1xuICAgICAgICBpZiAoaW5kZXgpIHtcbiAgICAgICAgICAgIG5WeCA9IGluZGV4Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGFycmF5ID0gaW5kZXg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5WeDsgaSArPSAzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaTEgPSBhcnJheVtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBpMiA9IGFycmF5W2kgKyAxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBpMyA9IGFycmF5W2kgKyAyXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGUodngsIG54LCB0eCwgaTEsIGkyLCBpMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuVnggPSB2eC5sZW5ndGggLyAzO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuVng7IGkgKz0gMykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZSh2eCwgbngsIHR4LCBpLCBpICsgMSwgaSArIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY29tcHV0ZSh2eDogRmxvYXQzMkFycmF5LCBueDogRmxvYXQzMkFycmF5LCB0eDogRmxvYXQzMkFycmF5LCBpMTogbnVtYmVyLCBpMjogbnVtYmVyLCBpMzogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2MSA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIHYyID0gbmV3IEZsb2F0MygpO1xuXG4gICAgICAgICAgICBWID0gbmV3IEZsb2F0MygpO1xuXG4gICAgICAgICAgICBQMSA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIFAyID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgUDMgPSBuZXcgRmxvYXQzKCk7XG5cbiAgICAgICAgICAgIE4xID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgTjIgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgICAgICBOMyA9IG5ldyBGbG9hdDMoKTtcblxuICAgICAgICAgICAgQjEgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgICAgICBCMiA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIEIzID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgVDEgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgICAgICBUMiA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIFQzID0gbmV3IEZsb2F0MygpO1xuXG4gICAgICAgICAgICB1djEgPSBuZXcgRmxvYXQyKCk7XG4gICAgICAgICAgICB1djIgPSBuZXcgRmxvYXQyKCk7XG4gICAgICAgICAgICB1djMgPSBuZXcgRmxvYXQyKCk7XG5cbiAgICAgICAgICAgIHRtcFZlYyA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIHRtcEZsb2F0MiA9IG5ldyBGbG9hdDMoKTtcblxuICAgICAgICAgICAgZHN0ID0gbmV3IEZsb2F0MygpO1xuICAgICAgICB9XG5cbiAgICAgICAgUDEucmVhZCh2eCwgaTEgKiAzKTtcbiAgICAgICAgUDIucmVhZCh2eCwgaTIgKiAzKTtcbiAgICAgICAgUDMucmVhZCh2eCwgaTMgKiAzKTtcblxuICAgICAgICBOMS5yZWFkKG54LCBpMSAqIDMpO1xuICAgICAgICBOMi5yZWFkKG54LCBpMiAqIDMpO1xuICAgICAgICBOMy5yZWFkKG54LCBpMyAqIDMpO1xuXG4gICAgICAgIHV2MS5yZWFkKHR4LCBpMSAqIDIpO1xuICAgICAgICB1djIucmVhZCh0eCwgaTIgKiAyKTtcbiAgICAgICAgdXYzLnJlYWQodHgsIGkzICogMik7XG5cbiAgICAgICAgbGV0IHZ5O1xuICAgICAgICBsZXQgdno7XG5cbiAgICAgICAgVDEuc2V0KDAsIDAsIDApO1xuICAgICAgICBUMi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIFQzLnNldCgwLCAwLCAwKTtcbiAgICAgICAgQjEuc2V0KDAsIDAsIDApO1xuICAgICAgICBCMi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIEIzLnNldCgwLCAwLCAwKTtcblxuICAgICAgICBjb25zdCBzMSA9IHV2Mi54IC0gdXYxLng7XG4gICAgICAgIGNvbnN0IHMyID0gdXYzLnggLSB1djEueDtcbiAgICAgICAgY29uc3QgdDEgPSB1djIueSAtIHV2MS55O1xuICAgICAgICBjb25zdCB0MiA9IHV2My55IC0gdXYxLnk7XG5cbiAgICAgICAgdjEuc2V0KFAyLnggLSBQMS54LCBzMSwgdDEpO1xuICAgICAgICB2Mi5zZXQoUDMueCAtIFAxLngsIHMyLCB0Mik7XG4gICAgICAgIEZsb2F0My5Dcm9zcyh2MSwgdjIsIFYpO1xuICAgICAgICBpZiAoVi54ICE9PSAwLjApIHtcbiAgICAgICAgICAgIFYubm9ybWFsaXplKCk7XG4gICAgICAgICAgICB2eSA9IC1WLnkgLyBWLng7XG4gICAgICAgICAgICB2eiA9IC1WLnogLyBWLng7XG4gICAgICAgICAgICBUMS54ICs9IHZ5O1xuICAgICAgICAgICAgQjEueCArPSB2ejtcbiAgICAgICAgICAgIFQyLnggKz0gdnk7XG4gICAgICAgICAgICBCMi54ICs9IHZ6O1xuICAgICAgICAgICAgVDMueCArPSB2eTtcbiAgICAgICAgICAgIEIzLnggKz0gdno7XG4gICAgICAgIH1cblxuICAgICAgICB2MS5zZXQoUDIueSAtIFAxLnksIHMxLCB0MSk7XG4gICAgICAgIHYyLnNldChQMy55IC0gUDEueSwgczIsIHQyKTtcbiAgICAgICAgRmxvYXQzLkNyb3NzKHYxLCB2MiwgVik7XG4gICAgICAgIGlmIChWLnggIT09IDAuMCkge1xuICAgICAgICAgICAgVi5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIHZ5ID0gLVYueSAvIFYueDtcbiAgICAgICAgICAgIHZ6ID0gLVYueiAvIFYueDtcbiAgICAgICAgICAgIFQxLnkgKz0gdnk7XG4gICAgICAgICAgICBCMS55ICs9IHZ6O1xuICAgICAgICAgICAgVDIueSArPSB2eTtcbiAgICAgICAgICAgIEIyLnkgKz0gdno7XG4gICAgICAgICAgICBUMy55ICs9IHZ5O1xuICAgICAgICAgICAgQjMueSArPSB2ejtcbiAgICAgICAgfVxuXG4gICAgICAgIHYxLnNldChQMi56IC0gUDEueiwgczEsIHQxKTtcbiAgICAgICAgdjIuc2V0KFAzLnogLSBQMS56LCBzMiwgdDIpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3ModjEsIHYyLCBWKTtcbiAgICAgICAgaWYgKFYueCAhPT0gMC4wKSB7XG4gICAgICAgICAgICBWLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgdnkgPSAtVi55IC8gVi54O1xuICAgICAgICAgICAgdnogPSAtVi56IC8gVi54O1xuICAgICAgICAgICAgVDEueiArPSB2eTtcbiAgICAgICAgICAgIEIxLnogKz0gdno7XG4gICAgICAgICAgICBUMi56ICs9IHZ5O1xuICAgICAgICAgICAgQjIueiArPSB2ejtcbiAgICAgICAgICAgIFQzLnogKz0gdnk7XG4gICAgICAgICAgICBCMy56ICs9IHZ6O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgVCA9IHRoaXMuVCE7XG4gICAgICAgIGNvbnN0IEIgPSB0aGlzLkIhO1xuICAgICAgICBjb25zdCBOID0gdGhpcy5OITtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjEsIFQxLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3ModG1wVmVjLCBOMSwgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoVCwgaTEgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoVCwgaTEgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoQjEsIE4xLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjEsIHRtcFZlYywgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoQiwgaTEgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoQiwgaTEgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjIsIFQyLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3ModG1wVmVjLCBOMiwgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoVCwgaTIgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoVCwgaTIgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoQjIsIE4yLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjIsIHRtcFZlYywgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoQiwgaTIgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoQiwgaTIgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjMsIFQzLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3ModG1wVmVjLCBOMywgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoVCwgaTMgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoVCwgaTMgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoQjMsIE4zLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjMsIHRtcFZlYywgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoQiwgaTMgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoQiwgaTMgKiAzKTtcblxuICAgICAgICBkc3QucmVhZChOLCBpMSAqIDMpXG4gICAgICAgICAgICAuYWRkKE4xKVxuICAgICAgICAgICAgLndyaXRlKE4sIGkxICogMyk7XG4gICAgICAgIGRzdC5yZWFkKE4sIGkyICogMylcbiAgICAgICAgICAgIC5hZGQoTjIpXG4gICAgICAgICAgICAud3JpdGUoTiwgaTIgKiAzKTtcbiAgICAgICAgZHN0LnJlYWQoTiwgaTMgKiAzKVxuICAgICAgICAgICAgLmFkZChOMylcbiAgICAgICAgICAgIC53cml0ZShOLCBpMyAqIDMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZW5lcmF0ZShwcmltaXRpdmU6IFByaW1pdGl2ZSk6IHZvaWQge1xuICAgICAgICBpZiAodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0ID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgbiA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIGIgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgICAgICB0bXAwID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgdG1wMSA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIHRtcDIgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsICdwb3NpdGlvbicpIS5idWZmZXI7XG4gICAgICAgIGNvbnN0IHNpemUgPSBwb3NpdGlvbi5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5UID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcbiAgICAgICAgdGhpcy5CID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcbiAgICAgICAgdGhpcy5OID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblxuICAgICAgICB0aGlzLnByZXBhcmUocHJpbWl0aXZlKTtcblxuICAgICAgICBjb25zdCBuRWxlbWVudHMgPSBzaXplIC8gMztcbiAgICAgICAgY29uc3QgdGFuZ2VudHMgPSBuZXcgRmxvYXQzMkFycmF5KG5FbGVtZW50cyAqIDQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5FbGVtZW50czsgKytpKSB7XG4gICAgICAgICAgICB0LnJlYWQodGhpcy5ULCBpICogMyk7XG4gICAgICAgICAgICBiLnJlYWQodGhpcy5CLCBpICogMyk7XG4gICAgICAgICAgICBuLnJlYWQodGhpcy5OLCBpICogMyk7XG5cbiAgICAgICAgICAgIG4ubm9ybWFsaXplKCkud3JpdGUodGhpcy5OLCBpICogMyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG50ID0gRmxvYXQzLkRvdChuLCB0KTtcbiAgICAgICAgICAgIHRtcDEuY29weShuKS5tdWwobnQpO1xuICAgICAgICAgICAgdG1wMC5jb3B5KHQpLnN1Yih0bXAxKTtcbiAgICAgICAgICAgIHRtcDIuY29weSh0bXAwKS5ub3JtYWxpemUoKTtcblxuICAgICAgICAgICAgRmxvYXQzLkNyb3NzKG4sIHQsIHRtcDApO1xuICAgICAgICAgICAgbGV0IHNpZ24gPSBGbG9hdDMuRG90KHRtcDAsIGIpO1xuICAgICAgICAgICAgc2lnbiA9IHNpZ24gPCAwID8gLTEgOiAxO1xuXG4gICAgICAgICAgICBjb25zdCB0aSA9IGkgKiA0O1xuICAgICAgICAgICAgdGFuZ2VudHNbdGldID0gdG1wMi54O1xuICAgICAgICAgICAgdGFuZ2VudHNbdGkgKyAxXSA9IHRtcDIueTtcbiAgICAgICAgICAgIHRhbmdlbnRzW3RpICsgMl0gPSB0bXAyLno7XG4gICAgICAgICAgICB0YW5nZW50c1t0aSArIDNdID0gc2lnbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldF9hdHRyaWJ1dGUocHJpbWl0aXZlLCB7XG4gICAgICAgICAgICBidWZmZXI6IHRhbmdlbnRzLFxuICAgICAgICAgICAgc3RyaWRlOiA0LFxuICAgICAgICAgICAgbmFtZTogJ3RhbmdlbnQnLFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsIHsgYnVmZmVyOiB0aGlzLk4sIHN0cmlkZTogMywgbmFtZTogJ25vcm1hbCcgfSk7XG5cbiAgICAgICAgdGhpcy5UID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLkIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuTiA9IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbmNvbnN0IHRhbmdlbnRHZW5lcmF0b3IgPSBuZXcgVGFuZ2VudEdlbmVyYXRvcigpO1xuZXhwb3J0IGRlZmF1bHQgdGFuZ2VudEdlbmVyYXRvcjtcbiIsICJpbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vZW5naW5lJztcblxuZXhwb3J0IGNvbnN0IGJ1aWxpbl9tZXNoZXM6IE1hcDxzdHJpbmcsIE1lc2g+ID0gbmV3IE1hcDxzdHJpbmcsIE1lc2g+KCk7IiwgImltcG9ydCB7IE1lc2gsIFZlcnRleERhdGEgfSBmcm9tICcuLi9lbmdpbmUnO1xuaW1wb3J0IHsgQm94MyB9IGZyb20gJy4uL21hdGgnO1xuaW1wb3J0IHsgYnVpbGluX21lc2hlcyB9IGZyb20gJy4vYnVpbHRpbl9tZXNoJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZV9ib3hfbWVzaCgpOiBNZXNoIHtcbiAgICBsZXQgYnVpbHRpbl9ib3ggPSBidWlsaW5fbWVzaGVzLmdldCgnYm94Jyk7XG4gICAgaWYgKGJ1aWx0aW5fYm94KSByZXR1cm4gYnVpbHRpbl9ib3g7XG4gICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgICAgLTEsIDEsIC0xLCAxLCAxLCAxLCAxLCAxLCAtMSwgMSwgMSwgMSwgLTEsIC0xLCAxLCAxLCAtMSwgMSwgLTEsIDEsIDEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgMSwgMSwgLTEsIC0xLCAtMSwgLTEsIDEsIC0xLCAtMSwgLTEsIDEsIDEsIC0xLCAxLCAtMSwgMSwgMSwgLTEsIC0xLCAtMSwgMSwgLTEsIDEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDEsIC0xLCAxLCAxLCAtMSwgMSwgLTEsIDEsIC0xLCAxLCAxLCAxLCAxLCAxLCAxLCAtMSxcbiAgICBdKTtcbiAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgICAgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgLTEsIDAsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMCwgMCwgLTEsIDAsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgLTEsIDAsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMSwgMCwgMCwgMCwgMSwgLTEsIDAsXG4gICAgICAgIDAsIDAsIC0xLCAwLCAxLCAwLCAwLCAwLCAwLCAtMSxcbiAgICBdKTtcbiAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAwLjg3NSwgMC41LCAwLjYyNSwgMC43NSwgMC42MjUsIDAuNSwgMC42MjUsIDAuNzUsIDAuMzc1LCAxLCAwLjM3NSwgMC43NSwgMC42MjUsIDAsIDAuMzc1LCAwLjI1LCAwLjM3NSwgMCwgMC4zNzUsIDAuNSwgMC4xMjUsIDAuNzUsIDAuMTI1LCAwLjUsIDAuNjI1LCAwLjUsIDAuMzc1LCAwLjc1LCAwLjM3NSwgMC41LCAwLjYyNSwgMC4yNSxcbiAgICAgICAgMC4zNzUsIDAuNSwgMC4zNzUsIDAuMjUsIDAuODc1LCAwLjc1LCAwLjYyNSwgMSwgMC42MjUsIDAuMjUsIDAuMzc1LCAwLjc1LCAwLjYyNSwgMC43NSwgMC42MjUsIDAuNSxcbiAgICBdKTtcbiAgICBjb25zdCBpbmRleCA9IG5ldyBVaW50MzJBcnJheShbMCwgMiwgMSwgMywgNSwgNCwgNiwgOCwgNywgOSwgMTEsIDEwLCAxMiwgMTQsIDEzLCAxNSwgMTcsIDE2LCAwLCAxLCAxOCwgMywgNCwgMTksIDYsIDcsIDIwLCA5LCAxMCwgMjEsIDEyLCAxMywgMjIsIDE1LCAxNiwgMjNdKTtcbiAgICBjb25zdCB2ZXJ0ZXhfZGF0YSA9IHsgcG9zaXRpb24sIG5vcm1hbCwgdXYsIGluZGV4IH0gYXMgVmVydGV4RGF0YTtcbiAgICBjb25zdCBzdWJfbWVzaGVzID0gW3sgbWF0ZXJpYWxfaW5kZXg6IC0xLCB2ZXJ0ZXhfc3RhcnQ6IDAsIHZlcnRleF9jb3VudDogMjQsIGluZGV4X3N0YXJ0OiAwLCBpbmRleF9jb3VudDogMzYsIGluZGV4ZWQ6IHRydWUgfV07XG4gICAgY29uc3QgYm94ID0gbmV3IEJveDMoKTtcbiAgICBib3gubWluLnNldCgtMSwgLTEsIC0xKTtcbiAgICBib3gubWF4LnNldCgxLCAxLCAxKTtcbiAgICBidWlsdGluX2JveCA9IHsgdmVydGV4X2RhdGEsIHN1Yl9tZXNoZXMsIG5hbWU6ICdidWlsdGluIGJveCcsIG1hdGVyaWFsczogW10sIGJveCB9IGFzIE1lc2g7XG4gICAgYnVpbGluX21lc2hlcy5zZXQoJ2JveCcsIGJ1aWx0aW5fYm94KTtcbiAgICByZXR1cm4gYnVpbHRpbl9ib3g7XG59IiwgImltcG9ydCB7IERlcHRoQ29tcGFyZUZ1bmMsIE1hdDQsIFBpcGVsaW5lLCBVbmlmb3JtVHlwZSwgY3JlYXRlX3BpcGVsaW5lIH0gZnJvbSBcIkB1bmlvbl9uYXRpdmUvY29yZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlX2RlZmF1bHRfcGlwZWxpbmUoKTogUGlwZWxpbmUge1xuICAgIGNvbnN0IHZlcnRleF9zaGFkZXIgPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG4gICAgbGF5b3V0KGxvY2F0aW9uID0gMCkgaW4gdmVjMyBwb3NpdGlvbjtcbiAgICBsYXlvdXQobG9jYXRpb24gPSAxKSBpbiB2ZWMyIHV2O1xuXG4gICAgdW5pZm9ybSBtYXQ0IHdvcmxkX21hdHJpeDtcblxuICAgIGxheW91dChzdGQxNDApIHVuaWZvcm0gZnJhbWVfYmxvY2sge1xuICAgICAgICBtYXQ0IHZpZXdfbWF0cml4O1xuICAgICAgICBtYXQ0IHByb2plY3Rpb25fbWF0cml4O1xuICAgIH07XG5cbiAgICBvdXQgdmVjMiB2X3V2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2X3V2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbl9tYXRyaXggKiB2aWV3X21hdHJpeCAqIHdvcmxkX21hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XG4gICAgfVxuICAgIGA7XG5cbiAgICBjb25zdCBmcmFnbWVudF9zaGFkZXIgPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG4gICAgaW4gdmVjMiB2X3V2O1xuICAgIG91dCB2ZWM0IGZyYWdfZGF0YTtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZnJhZ19kYXRhID0gdmVjNCh2X3V2LCAwLjAsIDEuMCk7XG4gICAgfVxuICAgIGA7XG5cbiAgICByZXR1cm4gY3JlYXRlX3BpcGVsaW5lKHtcbiAgICAgICAgbmFtZTogXCJkZWZhdWx0IHBpcGVsaW5lXCIsXG4gICAgICAgIHZlcnRleF9zaGFkZXIsXG4gICAgICAgIGZyYWdtZW50X3NoYWRlcixcbiAgICAgICAgdW5pZm9ybXM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogXCJ3b3JsZF9tYXRyaXhcIiwgdHlwZTogVW5pZm9ybVR5cGUuTWF0NCwgZGVmYXVsdF92YWx1ZTogbmV3IE1hdDQoKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImZyYW1lX2Jsb2NrLnZpZXdfbWF0cml4XCIsIHR5cGU6IFVuaWZvcm1UeXBlLk1hdDQgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJmcmFtZV9ibG9jay5wcm9qZWN0aW9uX21hdHJpeFwiLCB0eXBlOiBVbmlmb3JtVHlwZS5NYXQ0IH1cbiAgICAgICAgXSxcbiAgICAgICAgYmxlbmQ6IHsgZW5hYmxlZDogZmFsc2V9LFxuICAgICAgICBkZXB0aF93cml0ZTogdHJ1ZSxcbiAgICAgICAgZGVwdGhfY29tcGFyZV9mdW5jOiBEZXB0aENvbXBhcmVGdW5jLkFsd2F5c1xuICAgIH0pITtcbn1cbiIsICJpbXBvcnQgeyBDYW1lcmEsIENvbG9yUkdCQSwgRW5naW5lLCBFbmdpbmVFdmVudCwgRXZlbnRIdWIsIEdGWERldmljZSwgR1BVQWN0aW9uLCBHUFVBY3Rpb25UeXBlLCBTcGhlcmljYWxDb250cm9sLCBaRVJPLCBjcmVhdGVfYm94X21lc2gsIGNyZWF0ZV9ncHVfbWVzaCB9IGZyb20gXCJAdW5pb25fbmF0aXZlL2NvcmVcIjtcbmltcG9ydCB7IGNyZWF0ZV9kZWZhdWx0X3BpcGVsaW5lIH0gZnJvbSBcIi4vcGlwZWxpbmVcIjtcblxuY29uc3QgZGV2aWNlID0gbmV3IEdGWERldmljZSgpO1xuY29uc3QgZW5jb2RlciA9IGRldmljZS5lbmNvZGVyO1xuY29uc3QgZW5naW5lID0gbmV3IEVuZ2luZSgpO1xuXG5jb25zdCBjYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XG5jYW1lcmEubG9jYXRpb24uc2V0KDQsIDQsIDQpO1xuY2FtZXJhLmxvb2tfYXQoWkVSTyk7XG5jYW1lcmEucGVyc3BlY3RpdmUoNDUsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAxLCAxMDAwKTtcbmNvbnN0IGNvbnRyb2wgPSBuZXcgU3BoZXJpY2FsQ29udHJvbChjYW1lcmEpO1xuY29uc3QgcGlwZWxpbmUgPSBjcmVhdGVfZGVmYXVsdF9waXBlbGluZSgpO1xuXG5jb25zdCBhY3Rpb24gPSB7XG4gICAgY2xlYXJfY29sb3I6IG5ldyBDb2xvclJHQkEoMC4xLCAwLjEsIDAuMywgMSksXG4gICAgY2xlYXJfZGVwdGg6IDEsXG4gICAgdHlwZTogR1BVQWN0aW9uVHlwZS5DbGVhckFsbFxufSBhcyBHUFVBY3Rpb247XG5cbmNvbnN0IGN1YmUgPSBjcmVhdGVfYm94X21lc2goKTtcbmZ1bmN0aW9uIGZyYW1lKCkge1xuICAgIGNvbnRyb2wudXBkYXRlKCk7XG4gICAgZW5jb2Rlci5jbGVhcihhY3Rpb24pO1xuICAgIGVuY29kZXIuc2V0X3BpcGVsaW5lKHBpcGVsaW5lKTtcbiAgICBlbmNvZGVyLnNldF9jYW1lcmEoY2FtZXJhKTtcbiAgICBlbmNvZGVyLmRyYXdfbWVzaChjcmVhdGVfZ3B1X21lc2goY3ViZSkpO1xuICAgIGVuY29kZXIuY29tbWl0KCk7XG59XG5cbkV2ZW50SHViLm9uKEVuZ2luZUV2ZW50LkZyYW1lLCBmcmFtZSk7XG5cbmVuZ2luZS5zdGFydCgpOyJdLAogICJtYXBwaW5ncyI6ICI7OztBQUVPLE1BQU0saUJBQU4sTUFBTSxnQkFBZTtBQUFBLElBS3hCLFlBQW1CLFFBQXFCLFNBQWlCLEdBQUcsY0FBc0IsT0FBTyxZQUFZO0FBQWxGO0FBQ2YsV0FBSyxXQUFXLElBQUksYUFBYSxRQUFRLFFBQVEsY0FBYyxDQUFDO0FBQ2hFLFdBQUssV0FBVyxJQUFJLFlBQVksUUFBUSxRQUFRLGNBQWMsQ0FBQztBQUMvRCxXQUFLLFVBQVUsSUFBSSxXQUFXLFFBQVEsUUFBUSxXQUFXO0FBQUEsSUFDN0Q7QUFBQSxJQUVBLFNBQVMsT0FBb0I7QUFDekIsYUFBTyxJQUFJLGdCQUFlLEtBQUssUUFBUSxNQUFNLGFBQWEsTUFBTSxXQUFXO0FBQUEsSUFDL0U7QUFBQSxFQUNKOzs7QUNkTyxNQUFNLGFBQU4sTUFBc0M7QUFBQSxJQUl6QyxZQUFZLFFBQThGO0FBSDFHLFdBQVEsTUFBaUIsb0JBQUksSUFBSTtBQUNqQyxXQUFRLE9BQWlCLENBQUM7QUFHdEIsVUFBSSxRQUFRO0FBQ1IsWUFBSSxrQkFBa0IsT0FBTztBQUN6QixpQkFBTyxRQUFRLENBQUMsU0FBUztBQUNyQixpQkFBSyxJQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxpQkFBSyxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQUEsVUFDM0IsQ0FBQztBQUFBLFFBQ0wsV0FBVyxPQUFRLE9BQWUsT0FBTyxRQUFRLE1BQU0sWUFBWTtBQUMvRCxxQkFBVyxRQUFRLFFBQTBDO0FBQ3pELGlCQUFLLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxL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QUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLE9BQUMsRUFBRSxTQUFTLENBQUMsR0FBR0EsR0FBRSxDQUFDLElBQUksQ0FBQ0EsR0FBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDMUMsT0FBQyxFQUFFLFNBQVMsQ0FBQyxHQUFHQSxHQUFFLENBQUMsSUFBSSxDQUFDQSxHQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUFBLElBQzlDO0FBQUEsSUFFQSxPQUFPLElBQUksR0FBV0EsSUFBV0MsTUFBcUI7QUFDbEQsTUFBQUEsS0FBSSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUlELEdBQUU7QUFDMUIsTUFBQUMsS0FBSSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUlELEdBQUU7QUFDMUIsTUFBQUMsS0FBSSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUlELEdBQUU7QUFDMUIsYUFBT0M7QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLFNBQVMsR0FBV0QsSUFBV0MsTUFBcUI7QUFDdkQsTUFBQUEsS0FBSSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUlELEdBQUU7QUFDMUIsTUFBQUMsS0FBSSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUlELEdBQUU7QUFDMUIsTUFBQUMsS0FBSSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUlELEdBQUU7QUFDMUIsYUFBT0M7QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLFNBQVMsR0FBV0QsSUFBbUI7QUFDMUMsYUFBTyxFQUFFLFNBQVNBLEVBQUM7QUFBQSxJQUN2QjtBQUFBLElBRUEsT0FBTyxVQUFVLEtBQWFDLE1BQXFCO0FBQy9DLFlBQU0sYUFBYSxJQUFNLElBQUk7QUFDN0IsTUFBQUEsS0FBSSxLQUFLO0FBQ1QsTUFBQUEsS0FBSSxLQUFLO0FBQ1QsTUFBQUEsS0FBSSxLQUFLO0FBQ1QsYUFBT0E7QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLFNBQVMsR0FBV0YsSUFBV0UsTUFBcUI7QUFDdkQsTUFBQUEsS0FBSSxJQUFJLEVBQUUsU0FBUyxDQUFD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QVEsS0FBV0EsTUFBa0I7QUFDeEMsVUFBSSxDQUFDQTtBQUFLLFFBQUFBLE9BQU0sSUFBSSxNQUFLO0FBR3pCLFlBQU0sS0FBS0EsS0FBSSxVQUNYLEtBQUssSUFBSSxVQUNULE1BQU0sR0FBRyxDQUFDLEdBQ1YsTUFBTSxHQUFHLENBQUMsR0FDVixNQUFNLEdBQUcsQ0FBQyxHQUNWLE1BQU0sR0FBRyxDQUFDLEdBQ1YsTUFBTSxHQUFHLENBQUMsR0FDVixNQUFNLEdBQUcsQ0FBQyxHQUNWLE1BQU0sR0FBRyxDQUFDLEdBQ1YsTUFBTSxHQUFHLENBQUMsR0FDVixNQUFNLEdBQUcsQ0FBQyxHQUNWLE1BQU0sR0FBRyxDQUFDLEdBQ1YsTUFBTSxHQUFHLEVBQUUsR0FDWCxNQUFNLEdBQUcsRUFBRSxHQUNYLE1BQU0sR0FBRyxFQUFFLEdBQ1gsTUFBTSxHQUFHLEVBQUUsR0FDWCxNQUFNLEdBQUcsRUFBRSxHQUNYLE1BQU0sR0FBRyxFQUFFLEdBQ1gsTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sS0FDNUcsTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sS0FDNUcsTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sS0FDNUcsTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFFaEgsWUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDdEQsVUFBSSxRQUFRLEdBQUc7QUFDWCxlQUFPQSxLQUFJLFNBQVM7QUFBQSxNQUN4QjtBQUVBLFlBQU0sU0FBUyxJQUFJO0FBRW5CLFNBQUcsQ0FBQyxJQUFJLE1BQU07QUFDZCxTQUFHLENBQUMsS0FBSyxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sT0FBTztBQUN0SCxTQUFHLENBQUMsS0FBSyxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sT0FBTztBQUN0SCxTQUFHLENBQUMsS0FBSyxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sT0FBTztBQUV0SCxTQUFHLENBQUMsSUFBSSxNQUFNO0FBQ2QsU0FBRyxDQUFDLEtBQUssTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE9BQU87QUFDdEgsU0FBRyxDQUFDLEtBQUssTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE9BQU87QUFDdEgsU0FBRyxDQUFDLEtBQUssTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE9BQU87QUFFdEgsU0FBRyxDQUFDLElBQUksTUFBTTtBQUNkLFNBQUcsQ0FBQyxLQUFLLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxPQUFPO0FBQ3RILFNBQUcsRUFBRSxLQUFLLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxPQUFPO0FBQ3ZILFNBQUcsRUFBRSxLQUFLLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxPQUFPO0FBRXZILFNBQUcsRUFBRSxJQUFJLE1BQU07QUFDZixTQUFHLEVBQUUsS0FBSyxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sT0FBTztBQUN2SCxTQUFHLEVBQUUsS0FBSyxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sT0FBTztBQUN2SCxTQUFHLEVBQUUsS0FBSyxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sT0FBTztBQUV2SCxhQUFPQTtBQUFBLElBQ1g7QUFBQSxJQUVBLE9BQU8sSUFBSSxHQUFTTyxJQUFTUCxNQUFrQjtBQUMzQyxVQUFJQSxTQUFRO0FBQVcsUUFBQUEsT0FBTSxJQUFJLE1BQUs7QUFDdEMsWUFBTSxLQUFLLEVBQUU7QUFDYixZQUFNLEtBQUtPLEdBQUU7QUFDYixZQUFNLEtBQUtQLEtBQUk7QUFFZixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxFQUFFO0FBQ2pCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLEVBQUU7QUFDakIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLEVBQUU7QUFDakIsWUFBTSxNQUFNLEdBQUcsRUFBRTtBQUNqQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsRUFBRTtBQUNqQixZQUFNLE1BQU0sR0FBRyxFQUFFO0FBRWpCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLEVBQUU7QUFDakIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsRUFBRTtBQUNqQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsRUFBRTtBQUNqQixZQUFNLE1BQU0sR0FBRyxFQUFFO0FBQ2pCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxFQUFFO0FBQ2pCLFlBQU0sTUFBTSxHQUFHLEVBQUU7QUFFakIsU0FBRyxDQUFDLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxTQUFHLENBQUMsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELFNBQUcsQ0FBQyxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDbEQsU0FBRyxFQUFFLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUVuRCxTQUFHLENBQUMsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELFNBQUcsQ0FBQyxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDbEQsU0FBRyxDQUFDLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxTQUFHLEVBQUUsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBRW5ELFNBQUcsQ0FBQyxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDbEQsU0FBRyxDQUFDLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxTQUFHLEVBQUUsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ25ELFNBQUcsRUFBRSxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFFbkQsU0FBRyxDQUFDLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxTQUFHLENBQUMsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELFNBQUcsRUFBRSxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDbkQsU0FBRyxFQUFFLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUVuRCxhQUFPQTtBQUFBLElBQ1g7QUFBQSxJQUVBLFdBQW1CO0FBQ2YsVUFBSSxTQUFTLE1BQU0sS0FBSyxTQUFTLENBQUMsRUFBRSxRQUFRLENBQUM7QUFDN0MsZUFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFNBQVMsUUFBUSxFQUFFLEdBQUc7QUFDM0Msa0JBQVUsT0FBTyxLQUFLLFNBQVMsQ0FBQyxFQUFFLFFBQVEsQ0FBQztBQUFBLE1BQy9DO0FBQ0EsZ0JBQVU7QUFDVixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUF1SU8sTUFBTSxnQkFBZ0IsSUFBSVEsTUFBSyxFQUFFLFNBQVM7OztBQ3p2QmpELE1BQU1DLEtBQUksSUFBSSxPQUFPO0FBR3JCLE1BQU0sU0FBUyxJQUFJLE9BQU87QUFDMUIsTUFBTSxRQUFRLElBQUksT0FBTztBQUN6QixNQUFNLFFBQVEsSUFBSSxPQUFPO0FBQ3pCLE1BQU0sT0FBTyxJQUFJLE9BQU87OztBQ05qQixNQUFNLE9BQU4sTUFBa0M7QUFBQSxJQStCckMsWUFBWUMsS0FBWSxHQUFHQyxLQUFZLEdBQUcsSUFBWSxHQUFHLElBQVksR0FBRztBQTdCeEUsa0JBQU87QUFDUCxzQkFBVyxJQUFJLGFBQWEsQ0FBQztBQTZCekIsV0FBSyxJQUFJRCxJQUFHQyxJQUFHLEdBQUcsQ0FBQztBQUNuQixzQkFBZ0IsQ0FBQztBQUFBLElBQ3JCO0FBQUEsSUE3QkEsSUFBSSxFQUFFQyxJQUFXO0FBQ2IsV0FBSyxTQUFTLENBQUMsSUFBSUE7QUFBQSxJQUN2QjtBQUFBLElBQ0EsSUFBSSxFQUFFQSxJQUFXO0FBQ2IsV0FBSyxTQUFTLENBQUMsSUFBSUE7QUFBQSxJQUN2QjtBQUFBLElBQ0EsSUFBSSxFQUFFQSxJQUFXO0FBQ2IsV0FBSyxTQUFTLENBQUMsSUFBSUE7QUFBQSxJQUN2QjtBQUFBLElBQ0EsSUFBSSxFQUFFQSxJQUFXO0FBQ2IsV0FBSyxTQUFTLENBQUMsSUFBSUE7QUFBQSxJQUN2QjtBQUFBLElBRUEsSUFBSSxJQUFZO0FBQ1osYUFBTyxLQUFLLFNBQVMsQ0FBQztBQUFBLElBQzFCO0FBQUEsSUFDQSxJQUFJLElBQVk7QUFDWixhQUFPLEtBQUssU0FBUyxDQUFDO0FBQUEsSUFDMUI7QUFBQSxJQUNBLElBQUksSUFBWTtBQUNaLGFBQU8sS0FBSyxTQUFTLENBQUM7QUFBQSxJQUMxQjtBQUFBLElBQ0EsSUFBSSxJQUFZO0FBQ1osYUFBTyxLQUFLLFNBQVMsQ0FBQztBQUFBLElBQzFCO0FBQUEsSUFPQSxLQUFLLFFBQStCLFNBQWlCLEdBQVM7QUFDMUQsV0FBSyxTQUFTLENBQUMsSUFBSSxPQUFPLE1BQU07QUFDaEMsV0FBSyxTQUFTLENBQUMsSUFBSSxPQUFPLFNBQVMsQ0FBQztBQUNwQyxXQUFLLFNBQVMsQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDO0FBQ3BDLFdBQUssU0FBUyxDQUFDLElBQUksT0FBTyxTQUFTLENBQUM7QUFDcEMsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUVBLE1BQU0sUUFBK0IsU0FBaUIsR0FBUztBQUMzRCxhQUFPLE1BQU0sSUFBSSxLQUFLLFNBQVMsQ0FBQztBQUNoQyxhQUFPLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO0FBQ3BDLGFBQU8sU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDcEMsYUFBTyxTQUFTLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztBQUNwQyxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsSUFBSUYsSUFBV0MsSUFBVyxHQUFXLEdBQWlCO0FBQ2xELFdBQUssU0FBUyxDQUFDLElBQUlEO0FBQ25CLFdBQUssU0FBUyxDQUFDLElBQUlDO0FBQ25CLFdBQUssU0FBUyxDQUFDLElBQUk7QUFDbkIsV0FBSyxTQUFTLENBQUMsSUFBSTtBQUNuQixhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsS0FBSyxNQUFrQjtBQUNuQixXQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUs7QUFDeEIsV0FBSyxTQUFTLENBQUMsSUFBSSxLQUFLO0FBQ3hCLFdBQUssU0FBUyxDQUFDLElBQUksS0FBSztBQUN4QixXQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUs7QUFDeEIsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUVBLFNBQVMsT0FBd0I7QUFDN0IsYUFBTyxNQUFNLEtBQUssS0FBSyxTQUFTLENBQUMsS0FBSyxNQUFNLEtBQUssS0FBSyxTQUFTLENBQUMsS0FBSyxNQUFNLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxLQUFLLE1BQU0sSUFBSSxLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO0FBQUEsSUFDdEs7QUFBQSxJQUVBLE9BQU8sTUFBcUI7QUFDeEIsYUFBTyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEtBQUssS0FBSyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEtBQUssS0FBSyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEtBQUssS0FBSyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxJQUNsSTtBQUFBLElBRUEsT0FBTyxNQUFrQjtBQUNyQixXQUFLLFNBQVMsQ0FBQyxLQUFLLEtBQUs7QUFDekIsV0FBSyxTQUFTLENBQUMsS0FBSyxLQUFLO0FBQ3pCLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxJQUFJQyxJQUFpQjtBQUNqQixXQUFLLFNBQVMsQ0FBQyxLQUFLQTtBQUNwQixXQUFLLFNBQVMsQ0FBQyxLQUFLQTtBQUNwQixXQUFLLFNBQVMsQ0FBQyxLQUFLQTtBQUNwQixXQUFLLFNBQVMsQ0FBQyxLQUFLQTtBQUNwQixhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsTUFBTUEsSUFBaUI7QUFDbkIsV0FBSyxTQUFTLENBQUMsS0FBS0E7QUFDcEIsV0FBSyxTQUFTLENBQUMsS0FBS0E7QUFDcEIsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUVBLFVBQVVGLElBQVdDLElBQWlCO0FBQ2xDLFdBQUssU0FBUyxDQUFDLEtBQUtEO0FBQ3BCLFdBQUssU0FBUyxDQUFDLEtBQUtDO0FBQ3BCLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLFFBQWdCLG1CQUFrQztBQUNyRCxVQUFJLHNCQUFzQixRQUFXO0FBQ2pDLGFBQUssU0FBUyxDQUFDLEtBQUs7QUFDcEIsYUFBSyxTQUFTLENBQUMsS0FBSztBQUNwQixhQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLEtBQUssU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDO0FBQzVELGFBQUssU0FBUyxDQUFDLElBQUksS0FBSyxJQUFJLEdBQUcsS0FBSyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUM7QUFBQSxNQUNoRSxPQUFPO0FBQ0gsYUFBSyxTQUFTLENBQUMsS0FBSztBQUNwQixhQUFLLFNBQVMsQ0FBQyxLQUFLO0FBQ3BCLGFBQUssU0FBUyxDQUFDLElBQUksS0FBSyxJQUFJLEdBQUcsS0FBSyxTQUFTLENBQUMsSUFBSSxvQkFBb0IsQ0FBQztBQUN2RSxhQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLEtBQUssU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDO0FBQUEsTUFDaEU7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsT0FBTyxRQUFnQixtQkFBa0M7QUFDckQsVUFBSSxzQkFBc0IsUUFBVztBQUNqQyxhQUFLLFNBQVMsQ0FBQyxLQUFLO0FBQ3BCLGFBQUssU0FBUyxDQUFDLEtBQUs7QUFDcEIsYUFBSyxTQUFTLENBQUMsS0FBSyxTQUFTO0FBQzdCLGFBQUssU0FBUyxDQUFDLEtBQUssU0FBUztBQUFBLE1BQ2pDLE9BQU87QUFDSCxhQUFLLFNBQVMsQ0FBQyxLQUFLO0FBQ3BCLGFBQUssU0FBUyxDQUFDLEtBQUs7QUFDcEIsYUFBSyxTQUFTLENBQUMsS0FBSyxvQkFBb0I7QUFDeEMsYUFBSyxTQUFTLENBQUMsS0FBSyxTQUFTO0FBQUEsTUFDakM7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsVUFBVSxPQUF1QjtBQUM3QixZQUFNLElBQUksTUFBTSxNQUFNLEdBQUcsS0FBSyxTQUFTLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUM7QUFDOUUsWUFBTSxJQUFJLE1BQU0sTUFBTSxHQUFHLEtBQUssU0FBUyxDQUFDLEdBQUcsS0FBSyxTQUFTLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDO0FBQzlFLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxVQUFVLE1BQWtCO0FBQ3hCLFlBQU0sSUFBSSxLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUs7QUFDOUQsWUFBTUUsS0FBSSxLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUs7QUFDOUQsWUFBTSxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksS0FBSztBQUN0SCxZQUFNQyxLQUFJLEtBQUssU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksS0FBSztBQUN0SCxVQUFJLEtBQUssS0FBS0QsTUFBS0MsSUFBRztBQUNsQixhQUFLLFNBQVMsQ0FBQyxJQUFJO0FBQ25CLGFBQUssU0FBUyxDQUFDLElBQUk7QUFDbkIsYUFBSyxTQUFTLENBQUMsSUFBSTtBQUNuQixhQUFLLFNBQVMsQ0FBQyxJQUFJO0FBQUEsTUFDdkIsT0FBTztBQUNILGFBQUssU0FBUyxDQUFDLElBQUk7QUFDbkIsYUFBSyxTQUFTLENBQUMsSUFBSUQ7QUFDbkIsYUFBSyxTQUFTLENBQUMsSUFBSSxJQUFJO0FBQ3ZCLGFBQUssU0FBUyxDQUFDLElBQUlDLEtBQUlEO0FBQUEsTUFDM0I7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsUUFBaUI7QUFDYixhQUFPLEtBQUssU0FBUyxDQUFDLElBQUksS0FBSyxLQUFLLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDdEQ7QUFBQSxJQUVBLFdBQW1CO0FBQ2YsYUFBTyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUM7QUFBQSxJQUNsRztBQUFBLEVBQ0o7QUFFTyxNQUFNLFlBQVksSUFBSSxLQUFLLEdBQUcsR0FBRyxHQUFHLENBQUM7OztBQ2pLckMsTUFBTSxhQUFOLE1BQU0sWUFBa0M7QUFBQSxJQWtDM0MsWUFBWUUsS0FBWSxHQUFHQyxLQUFZLEdBQUdDLEtBQVksR0FBRyxJQUFZLEdBQUc7QUFqQ3hFLDJCQUF5QjtBQUV6QixrQkFBTztBQUNQLHNCQUFXLElBQUksYUFBYSxDQUFDO0FBK0J6QixXQUFLLElBQUlGO0FBQ1QsV0FBSyxJQUFJQztBQUNULFdBQUssSUFBSUM7QUFDVCxXQUFLLElBQUk7QUFDVCxzQkFBZ0IsQ0FBQztBQUFBLElBQ3JCO0FBQUEsSUFsQ0EsSUFBSSxJQUFZO0FBQ1osYUFBTyxLQUFLLFNBQVMsQ0FBQztBQUFBLElBQzFCO0FBQUEsSUFDQSxJQUFJLEVBQUUsT0FBZTtBQUNqQixXQUFLLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDdkI7QUFBQSxJQUVBLElBQUksSUFBWTtBQUNaLGFBQU8sS0FBSyxTQUFTLENBQUM7QUFBQSxJQUMxQjtBQUFBLElBQ0EsSUFBSSxFQUFFLE9BQWU7QUFDakIsV0FBSyxTQUFTLENBQUMsSUFBSTtBQUFBLElBQ3ZCO0FBQUEsSUFFQSxJQUFJLElBQVk7QUFDWixhQUFPLEtBQUssU0FBUyxDQUFDO0FBQUEsSUFDMUI7QUFBQSxJQUNBLElBQUksRUFBRSxPQUFlO0FBQ2pCLFdBQUssU0FBUyxDQUFDLElBQUk7QUFBQSxJQUN2QjtBQUFBLElBRUEsSUFBSSxJQUFZO0FBQ1osYUFBTyxLQUFLLFNBQVMsQ0FBQztBQUFBLElBQzFCO0FBQUEsSUFDQSxJQUFJLEVBQUUsT0FBZTtBQUNqQixXQUFLLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDdkI7QUFBQSxJQVVBLEtBQUssUUFBK0IsU0FBaUIsR0FBUztBQUMxRCxXQUFLLFNBQVMsQ0FBQyxJQUFJLE9BQU8sTUFBTTtBQUNoQyxXQUFLLFNBQVMsQ0FBQyxJQUFJLE9BQU8sU0FBUyxDQUFDO0FBQ3BDLFdBQUssU0FBUyxDQUFDLElBQUksT0FBTyxTQUFTLENBQUM7QUFDcEMsV0FBSyxTQUFTLENBQUMsSUFBSSxPQUFPLFNBQVMsQ0FBQztBQUNwQyxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsTUFBTSxRQUErQixTQUFpQixHQUFTO0FBQzNELGFBQU8sTUFBTSxJQUFJLEtBQUssU0FBUyxDQUFDO0FBQ2hDLGFBQU8sU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDcEMsYUFBTyxTQUFTLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztBQUNwQyxhQUFPLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO0FBQ3BDLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLE1BQTRCO0FBQy9CLFVBQUksQ0FBQztBQUFNLGFBQUssU0FBUyxLQUFLLENBQUM7QUFBQTtBQUMxQixhQUFLLFNBQVMsSUFBSSxJQUFJO0FBQzNCLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxLQUFLLEdBQTJCO0FBQzVCLFdBQUssSUFBSSxFQUFFO0FBQ1gsV0FBSyxJQUFJLEVBQUU7QUFDWCxXQUFLLElBQUksRUFBRTtBQUNYLFdBQUssSUFBSSxFQUFFO0FBQ1gsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUVBLFFBQW9CO0FBQ2hCLGFBQU8sSUFBSSxZQUFXLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUFBLElBQ3hEO0FBQUEsSUFFQSxTQUFpQjtBQUNiLGFBQU8sS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUM7QUFBQSxJQUMxRjtBQUFBLElBRUEsWUFBd0I7QUFDcEIsYUFBTyxZQUFXLFVBQVUsTUFBTSxJQUFJO0FBQUEsSUFDMUM7QUFBQSxJQUVBLE9BQU8sR0FBMkI7QUFDOUIsYUFBTyxZQUFXLElBQUksR0FBRyxNQUFNLElBQUk7QUFBQSxJQUN2QztBQUFBLElBRUEsSUFBSSxHQUEyQjtBQUMzQixhQUFPLFlBQVcsSUFBSSxNQUFNLEdBQUcsSUFBSTtBQUFBLElBQ3ZDO0FBQUEsSUFFQSxVQUFVLEdBQXFCO0FBQzNCLGFBQU8sWUFBVyxTQUFTLEdBQUcsSUFBSTtBQUFBLElBQ3RDO0FBQUEsSUFFQSxrQkFBa0IsS0FBYUMsTUFBeUI7QUFDcEQsYUFBTyxZQUFXLGdCQUFnQixLQUFLQSxNQUFLLElBQUk7QUFBQSxJQUNwRDtBQUFBLElBRUEsV0FBVyxLQUFZLHlCQUFvQztBQUN2RCxhQUFPLFlBQVcsVUFBVSxLQUFLLE9BQU8sSUFBSTtBQUFBLElBQ2hEO0FBQUEsSUFFQSxnQkFBZ0IsTUFBYyxPQUEyQjtBQUdyRCxZQUFNLFlBQVksUUFBUTtBQUMxQixZQUFNLElBQUksS0FBSyxJQUFJLFNBQVM7QUFFNUIsV0FBSyxJQUFJLEtBQUssSUFBSTtBQUNsQixXQUFLLElBQUksS0FBSyxJQUFJO0FBQ2xCLFdBQUssSUFBSSxLQUFLLElBQUk7QUFDbEIsV0FBSyxJQUFJLEtBQUssSUFBSSxTQUFTO0FBRTNCLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxXQUFtQjtBQUNmLGFBQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUM7QUFBQSxJQUN0RDtBQUFBLElBRUEsTUFBTSxHQUFlQyxJQUF1QjtBQUN4QyxrQkFBVyxNQUFNLE1BQU0sR0FBR0EsSUFBRyxJQUFJO0FBQ2pDLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxZQUF3QjtBQUNwQixhQUFPLFlBQVcsVUFBVSxNQUFNLElBQUk7QUFBQSxJQUMxQztBQUFBLElBRUEsVUFBc0I7QUFDbEIsYUFBTyxZQUFXLFFBQVEsTUFBTSxJQUFJO0FBQUEsSUFDeEM7QUFBQSxJQUVBLE9BQU8sVUFBVSxHQUFlRCxNQUE2QjtBQUN6RCxNQUFBQSxLQUFJLElBQUksQ0FBQyxFQUFFO0FBQ1gsTUFBQUEsS0FBSSxJQUFJLENBQUMsRUFBRTtBQUNYLE1BQUFBLEtBQUksSUFBSSxDQUFDLEVBQUU7QUFDWCxNQUFBQSxLQUFJLElBQUksRUFBRTtBQUNWLGFBQU9BO0FBQUEsSUFDWDtBQUFBLElBRUEsT0FBTyxPQUFPLEdBQWVFLElBQXdCO0FBQ2pELGFBQU8sRUFBRSxNQUFNQSxHQUFFLEtBQUssRUFBRSxNQUFNQSxHQUFFLEtBQUssRUFBRSxNQUFNQSxHQUFFLEtBQUssRUFBRSxNQUFNQSxHQUFFO0FBQUEsSUFDbEU7QUFBQSxJQUVBLE9BQU8sSUFBSSxHQUFlQSxJQUFlRixNQUE4QjtBQUNuRSxVQUFJQSxTQUFRO0FBQVcsUUFBQUEsT0FBTSxJQUFJLFlBQVc7QUFFNUMsWUFBTSxNQUFNLEVBQUUsR0FDVixNQUFNLEVBQUUsR0FDUixNQUFNLEVBQUUsR0FDUixNQUFNLEVBQUU7QUFDWixZQUFNLE1BQU1FLEdBQUUsR0FDVixNQUFNQSxHQUFFLEdBQ1IsTUFBTUEsR0FBRSxHQUNSLE1BQU1BLEdBQUU7QUFFWixNQUFBRixLQUFJLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxNQUFBQSxLQUFJLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxNQUFBQSxLQUFJLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxNQUFBQSxLQUFJLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUVsRCxhQUFPQTtBQUFBLElBQ1g7QUFBQSxJQUVBLE9BQU8sZ0JBQWdCLEdBQVdFLElBQVdGLE1BQTZCO0FBRXRFLFVBQUksSUFBSSxFQUFFLElBQUlFLEVBQUMsSUFBSTtBQUVuQixVQUFJLElBQUksT0FBTyxTQUFTO0FBRXBCLFlBQUk7QUFDSixZQUFJLEtBQUssSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDLEdBQUc7QUFDL0IsVUFBQUYsS0FBSSxJQUFJLENBQUMsRUFBRTtBQUNYLFVBQUFBLEtBQUksSUFBSSxFQUFFO0FBQ1YsVUFBQUEsS0FBSSxJQUFJO0FBQ1IsVUFBQUEsS0FBSSxJQUFJO0FBQUEsUUFDWixPQUFPO0FBQ0gsVUFBQUEsS0FBSSxJQUFJO0FBQ1IsVUFBQUEsS0FBSSxJQUFJLENBQUMsRUFBRTtBQUNYLFVBQUFBLEtBQUksSUFBSSxFQUFFO0FBQ1YsVUFBQUEsS0FBSSxJQUFJO0FBQUEsUUFDWjtBQUFBLE1BQ0osT0FBTztBQUVILFFBQUFBLEtBQUksSUFBSSxFQUFFLElBQUlFLEdBQUUsSUFBSSxFQUFFLElBQUlBLEdBQUU7QUFDNUIsUUFBQUYsS0FBSSxJQUFJLEVBQUUsSUFBSUUsR0FBRSxJQUFJLEVBQUUsSUFBSUEsR0FBRTtBQUM1QixRQUFBRixLQUFJLElBQUksRUFBRSxJQUFJRSxHQUFFLElBQUksRUFBRSxJQUFJQSxHQUFFO0FBQzVCLFFBQUFGLEtBQUksSUFBSTtBQUFBLE1BQ1o7QUFDQSxhQUFPQSxLQUFJLFVBQVU7QUFBQSxJQUN6QjtBQUFBLElBRUEsT0FBTyxTQUFTLEdBQVNBLE1BQTZCO0FBR2xELFlBQU0sS0FBSyxFQUFFO0FBQ2IsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLEVBQUU7QUFDakIsWUFBTSxRQUFRLE1BQU0sTUFBTTtBQUMxQixVQUFJO0FBRUosVUFBSSxRQUFRLEdBQUc7QUFDWCxZQUFJLE1BQU0sS0FBSyxLQUFLLFFBQVEsQ0FBRztBQUMvQixRQUFBQSxLQUFJLElBQUksT0FBTztBQUNmLFFBQUFBLEtBQUksS0FBSyxNQUFNLE9BQU87QUFDdEIsUUFBQUEsS0FBSSxLQUFLLE1BQU0sT0FBTztBQUN0QixRQUFBQSxLQUFJLEtBQUssTUFBTSxPQUFPO0FBQUEsTUFDMUIsV0FBVyxNQUFNLE9BQU8sTUFBTSxLQUFLO0FBQy9CLFlBQUksSUFBTSxLQUFLLEtBQUssSUFBTSxNQUFNLE1BQU0sR0FBRztBQUN6QyxRQUFBQSxLQUFJLEtBQUssTUFBTSxPQUFPO0FBQ3RCLFFBQUFBLEtBQUksSUFBSSxPQUFPO0FBQ2YsUUFBQUEsS0FBSSxLQUFLLE1BQU0sT0FBTztBQUN0QixRQUFBQSxLQUFJLEtBQUssTUFBTSxPQUFPO0FBQUEsTUFDMUIsV0FBVyxNQUFNLEtBQUs7QUFDbEIsWUFBSSxJQUFNLEtBQUssS0FBSyxJQUFNLE1BQU0sTUFBTSxHQUFHO0FBQ3pDLFFBQUFBLEtBQUksS0FBSyxNQUFNLE9BQU87QUFDdEIsUUFBQUEsS0FBSSxLQUFLLE1BQU0sT0FBTztBQUN0QixRQUFBQSxLQUFJLElBQUksT0FBTztBQUNmLFFBQUFBLEtBQUksS0FBSyxNQUFNLE9BQU87QUFBQSxNQUMxQixPQUFPO0FBQ0gsWUFBSSxJQUFNLEtBQUssS0FBSyxJQUFNLE1BQU0sTUFBTSxHQUFHO0FBQ3pDLFFBQUFBLEtBQUksS0FBSyxNQUFNLE9BQU87QUFDdEIsUUFBQUEsS0FBSSxLQUFLLE1BQU0sT0FBTztBQUN0QixRQUFBQSxLQUFJLEtBQUssTUFBTSxPQUFPO0FBQ3RCLFFBQUFBLEtBQUksSUFBSSxPQUFPO0FBQUEsTUFDbkI7QUFDQSxhQUFPQTtBQUFBLElBQ1g7QUFBQSxJQUVBLE9BQU8sU0FBUyxHQUFTQSxNQUE2QjtBQUNsRCxZQUFNLEtBQUssRUFBRTtBQUNiLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBQ2hCLFlBQU0sTUFBTSxHQUFHLENBQUM7QUFDaEIsWUFBTSxNQUFNLEdBQUcsQ0FBQztBQUNoQixZQUFNLE1BQU0sR0FBRyxDQUFDO0FBRWhCLFlBQU0sUUFBUSxNQUFNLE1BQU07QUFDMUIsVUFBSTtBQUVKLFVBQUksUUFBUSxHQUFHO0FBQ1gsWUFBSSxNQUFNLEtBQUssS0FBSyxRQUFRLENBQUc7QUFDL0IsUUFBQUEsS0FBSSxJQUFJLE9BQU87QUFDZixRQUFBQSxLQUFJLEtBQUssTUFBTSxPQUFPO0FBQ3RCLFFBQUFBLEtBQUksS0FBSyxNQUFNLE9BQU87QUFDdEIsUUFBQUEsS0FBSSxLQUFLLE1BQU0sT0FBTztBQUFBLE1BQzFCLFdBQVcsTUFBTSxPQUFPLE1BQU0sS0FBSztBQUMvQixZQUFJLElBQU0sS0FBSyxLQUFLLElBQU0sTUFBTSxNQUFNLEdBQUc7QUFDekMsUUFBQUEsS0FBSSxLQUFLLE1BQU0sT0FBTztBQUN0QixRQUFBQSxLQUFJLElBQUksT0FBTztBQUNmLFFBQUFBLEtBQUksS0FBSyxNQUFNLE9BQU87QUFDdEIsUUFBQUEsS0FBSSxLQUFLLE1BQU0sT0FBTztBQUFBLE1BQzFCLFdBQVcsTUFBTSxLQUFLO0FBQ2xCLFlBQUksSUFBTSxLQUFLLEtBQUssSUFBTSxNQUFNLE1BQU0sR0FBRztBQUN6QyxRQUFBQSxLQUFJLEtBQUssTUFBTSxPQUFPO0FBQ3RCLFFBQUFBLEtBQUksS0FBSyxNQUFNLE9BQU87QUFDdEIsUUFBQUEsS0FBSSxJQUFJLE9BQU87QUFDZixRQUFBQSxLQUFJLEtBQUssTUFBTSxPQUFPO0FBQUEsTUFDMUIsT0FBTztBQUNILFlBQUksSUFBTSxLQUFLLEtBQUssSUFBTSxNQUFNLE1BQU0sR0FBRztBQUN6QyxRQUFBQSxLQUFJLEtBQUssTUFBTSxPQUFPO0FBQ3RCLFFBQUFBLEtBQUksS0FBSyxNQUFNLE9BQU87QUFDdEIsUUFBQUEsS0FBSSxLQUFLLE1BQU0sT0FBTztBQUN0QixRQUFBQSxLQUFJLElBQUksT0FBTztBQUFBLE1BQ25CO0FBRUEsYUFBT0E7QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLE1BQU0sR0FBZUUsSUFBZUQsSUFBV0QsTUFBNkI7QUFDL0UsVUFBSUMsT0FBTSxHQUFHO0FBQ1QsUUFBQUQsS0FBSSxLQUFLLENBQUM7QUFDVixlQUFPQTtBQUFBLE1BQ1g7QUFFQSxVQUFJQyxPQUFNLEdBQUc7QUFDVCxRQUFBRCxLQUFJLEtBQUtFLEVBQUM7QUFDVixlQUFPRjtBQUFBLE1BQ1g7QUFFQSxZQUFNSCxLQUFJLEVBQUU7QUFDWixZQUFNQyxLQUFJLEVBQUU7QUFDWixZQUFNQyxLQUFJLEVBQUU7QUFDWixZQUFNLElBQUksRUFBRTtBQUVaLFVBQUksZUFBZSxJQUFJRyxHQUFFLElBQUlMLEtBQUlLLEdBQUUsSUFBSUosS0FBSUksR0FBRSxJQUFJSCxLQUFJRyxHQUFFO0FBRXZELFVBQUksZUFBZSxHQUFHO0FBQ2xCLFFBQUFGLEtBQUksSUFBSSxDQUFDRSxHQUFFO0FBQ1gsUUFBQUYsS0FBSSxJQUFJLENBQUNFLEdBQUU7QUFDWCxRQUFBRixLQUFJLElBQUksQ0FBQ0UsR0FBRTtBQUNYLFFBQUFGLEtBQUksSUFBSSxDQUFDRSxHQUFFO0FBRVgsdUJBQWUsQ0FBQztBQUFBLE1BQ3BCLE9BQU87QUFDSCxRQUFBRixLQUFJLEtBQUtFLEVBQUM7QUFBQSxNQUNkO0FBRUEsVUFBSSxnQkFBZ0IsR0FBSztBQUNyQixRQUFBRixLQUFJLElBQUk7QUFDUixRQUFBQSxLQUFJLElBQUlIO0FBQ1IsUUFBQUcsS0FBSSxJQUFJRjtBQUNSLFFBQUFFLEtBQUksSUFBSUQ7QUFDUixlQUFPQztBQUFBLE1BQ1g7QUFFQSxZQUFNLGtCQUFrQixJQUFNLGVBQWU7QUFFN0MsVUFBSSxtQkFBbUIsT0FBTyxTQUFTO0FBQ25DLGNBQU0sSUFBSSxJQUFJQztBQUNkLFFBQUFELEtBQUksSUFBSSxJQUFJLElBQUlDLEtBQUksRUFBRTtBQUN0QixRQUFBRCxLQUFJLElBQUksSUFBSUgsS0FBSUksS0FBSSxFQUFFO0FBQ3RCLFFBQUFELEtBQUksSUFBSSxJQUFJRixLQUFJRyxLQUFJLEVBQUU7QUFDdEIsUUFBQUQsS0FBSSxJQUFJLElBQUlELEtBQUlFLEtBQUksRUFBRTtBQUN0QixRQUFBRCxLQUFJLFVBQVU7QUFDZCxlQUFPQTtBQUFBLE1BQ1g7QUFFQSxZQUFNLGVBQWUsS0FBSyxLQUFLLGVBQWU7QUFDOUMsWUFBTSxZQUFZLEtBQUssTUFBTSxjQUFjLFlBQVk7QUFDdkQsWUFBTSxTQUFTLEtBQUssS0FBSyxJQUFJQyxNQUFLLFNBQVMsSUFBSTtBQUMvQyxZQUFNLFNBQVMsS0FBSyxJQUFJQSxLQUFJLFNBQVMsSUFBSTtBQUV6QyxNQUFBRCxLQUFJLElBQUksSUFBSSxTQUFTRSxHQUFFLElBQUk7QUFDM0IsTUFBQUYsS0FBSSxJQUFJSCxLQUFJLFNBQVNLLEdBQUUsSUFBSTtBQUMzQixNQUFBRixLQUFJLElBQUlGLEtBQUksU0FBU0ksR0FBRSxJQUFJO0FBQzNCLE1BQUFGLEtBQUksSUFBSUQsS0FBSSxTQUFTRyxHQUFFLElBQUk7QUFFM0IsYUFBT0Y7QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLFVBQVUsS0FBaUJBLE1BQThCO0FBQzVELFVBQUlBLFNBQVE7QUFBVyxRQUFBQSxPQUFNLElBQUksWUFBVztBQUM1QyxVQUFJLElBQUksSUFBSSxPQUFPO0FBQ25CLFVBQUksTUFBTSxHQUFHO0FBQ1QsUUFBQUEsS0FBSSxJQUFJO0FBQ1IsUUFBQUEsS0FBSSxJQUFJO0FBQ1IsUUFBQUEsS0FBSSxJQUFJO0FBQ1IsUUFBQUEsS0FBSSxJQUFJO0FBQUEsTUFDWixPQUFPO0FBQ0gsWUFBSSxJQUFJO0FBQ1IsUUFBQUEsS0FBSSxLQUFLO0FBQ1QsUUFBQUEsS0FBSSxLQUFLO0FBQ1QsUUFBQUEsS0FBSSxLQUFLO0FBQ1QsUUFBQUEsS0FBSSxLQUFLO0FBQUEsTUFDYjtBQUNBLGFBQU9BO0FBQUEsSUFDWDtBQUFBLElBRUEsT0FBTyxTQUFTLEdBQWVFLElBQWVGLE1BQThCO0FBQ3hFLFVBQUlBLFNBQVE7QUFBVyxRQUFBQSxPQUFNLElBQUksWUFBVztBQUM1QyxZQUFNLE1BQU0sRUFBRSxHQUNWLE1BQU0sRUFBRSxHQUNSLE1BQU0sRUFBRSxHQUNSLE1BQU0sRUFBRTtBQUNaLFlBQU0sTUFBTUUsR0FBRSxHQUNWLE1BQU1BLEdBQUUsR0FDUixNQUFNQSxHQUFFLEdBQ1IsTUFBTUEsR0FBRTtBQUNaLE1BQUFGLEtBQUksSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELE1BQUFBLEtBQUksSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELE1BQUFBLEtBQUksSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELE1BQUFBLEtBQUksSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELGFBQU9BO0FBQUEsSUFDWDtBQUFBLElBRUEsT0FBTyxVQUFVLEdBQVUseUJBQW9DQSxNQUE2QjtBQUN4RixZQUFNSCxLQUFJLEVBQUU7QUFDWixZQUFNQyxLQUFJLEVBQUU7QUFDWixZQUFNQyxLQUFJLEVBQUU7QUFNWixZQUFNLE1BQU0sS0FBSztBQUNqQixZQUFNLE1BQU0sS0FBSztBQUVqQixZQUFNLEtBQUssSUFBSUYsS0FBSSxDQUFDO0FBQ3BCLFlBQU0sS0FBSyxJQUFJQyxLQUFJLENBQUM7QUFDcEIsWUFBTSxLQUFLLElBQUlDLEtBQUksQ0FBQztBQUVwQixZQUFNLEtBQUssSUFBSUYsS0FBSSxDQUFDO0FBQ3BCLFlBQU0sS0FBSyxJQUFJQyxLQUFJLENBQUM7QUFDcEIsWUFBTSxLQUFLLElBQUlDLEtBQUksQ0FBQztBQUVwQixjQUFRLE9BQU87QUFBQSxRQUNYO0FBQ0ksVUFBQUMsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQztBQUFBLFFBRUo7QUFDSSxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDO0FBQUEsUUFFSjtBQUNJLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakM7QUFBQSxRQUVKO0FBQ0ksVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQztBQUFBLFFBRUo7QUFDSSxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDO0FBQUEsUUFFSjtBQUNJLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakM7QUFBQSxRQUVKO0FBQ0ksa0JBQVEsS0FBSyxvQkFBb0IsS0FBSztBQUFBLE1BQzlDO0FBRUEsYUFBT0E7QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLFFBQVEsS0FBaUJBLE1BQTZCO0FBQ3pELE1BQUFBLEtBQUksSUFBSSxDQUFDLElBQUk7QUFDYixNQUFBQSxLQUFJLElBQUksQ0FBQyxJQUFJO0FBQ2IsTUFBQUEsS0FBSSxJQUFJLENBQUMsSUFBSTtBQUNiLE1BQUFBLEtBQUksSUFBSSxJQUFJO0FBQ1osYUFBT0E7QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUVPLE1BQU0sc0JBQXNCLElBQUksV0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDOzs7QUN6Y3JELE1BQU0sT0FBTixNQUFXO0FBQUEsSUFZZCxjQUFjO0FBUmQsc0JBQW9CLENBQUM7QUFHckI7QUFBQSx1QkFBb0I7QUFFcEIsV0FBUSxhQUFxQjtBQUM3QixXQUFRLGFBQXFCO0FBMEI3QixvQkFBUyxNQUFNO0FBRVgsYUFBSyxhQUFhLEtBQUssZUFBZSxLQUFLO0FBQUEsTUFDL0M7QUExQkksV0FBSyxTQUFTLElBQUksWUFBWSxLQUFLLFNBQVM7QUFDNUMsV0FBSyxPQUFPO0FBQUEsSUFDaEI7QUFBQSxJQUVBLE1BQTRCLE1BQWMsYUFBeUM7QUFDL0UsWUFBTSxTQUFVLFlBQW9CO0FBQ3BDLFlBQU0sUUFBUSxLQUFLO0FBQ25CLFlBQU0sUUFBUSxPQUFPO0FBR3JCLFdBQUssT0FBTyxLQUFLLE9BQU8sU0FBUyxJQUFLLFFBQVE7QUFFOUMsYUFBTztBQUFBLFFBQ0gsT0FBTyxFQUFFLE9BQU8sTUFBTTtBQUFBLFFBQ3RCO0FBQUEsUUFDQSxRQUFRLElBQUksWUFBWSxLQUFLLFFBQVEsT0FBTyxJQUFJO0FBQUEsTUFDcEQ7QUFBQSxJQUNKO0FBQUEsSUFFQSxLQUFRLFNBQTJCO0FBQy9CLFdBQUssU0FBUyxLQUFLLFFBQVEsS0FBSztBQUFBLElBQ3BDO0FBQUEsRUFNSjtBQUVBLE1BQU0sYUFBYSxJQUFJLEtBQUs7QUEyQnJCLFdBQVMsV0FBaUI7QUFDN0IsZUFBVyxPQUFPO0FBQUEsRUFDdEI7QUFFQSxNQUFNLFFBQVE7QUFDZCxNQUFNLFNBQVMsUUFBUTtBQUN2QixNQUFNLFNBQVMsU0FBUztBQUN4QixNQUFNLFNBQVMsU0FBUztBQUN4QixNQUFNLFNBQVMsU0FBUztBQUN4QixNQUFNLFNBQVMsU0FBUzs7O0FDdkZqQixNQUFNLFlBQU4sTUFBTSxXQUFVO0FBQUEsSUFLbkIsWUFBWSxRQUFpQixPQUFnQixLQUFjO0FBQ3ZELFdBQUssU0FBUyxVQUFVO0FBQ3hCLFdBQUssUUFBUSxTQUFTO0FBQ3RCLFdBQUssTUFBTSxPQUFPO0FBQ2xCLHNCQUFnQixDQUFDO0FBQUEsSUFDckI7QUFBQSxJQUVBLFlBQVlHLElBQXNCO0FBQzlCLFdBQUssU0FBU0EsR0FBRTtBQUNoQixVQUFJLEtBQUssV0FBVyxHQUFHO0FBQ25CLGFBQUssUUFBUTtBQUNiLGFBQUssTUFBTTtBQUFBLE1BQ2YsT0FBTztBQUNILGFBQUssUUFBUSxLQUFLLEtBQUssTUFBTUEsR0FBRSxJQUFJLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQztBQUN0RCxhQUFLLE1BQU0sS0FBSyxNQUFNQSxHQUFFLEdBQUdBLEdBQUUsQ0FBQztBQUFBLE1BQ2xDO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUVBLElBQUksUUFBZ0IsT0FBZSxLQUF3QjtBQUN2RCxXQUFLLFNBQVM7QUFDZCxXQUFLLFFBQVE7QUFDYixXQUFLLE1BQU07QUFDWCxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsS0FBSyxHQUF5QjtBQUMxQixhQUFPLEtBQUssSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRztBQUFBLElBQzVDO0FBQUEsSUFFQSxRQUFtQjtBQUNmLGFBQU8sSUFBSSxXQUFVLEtBQUssUUFBUSxLQUFLLE9BQU8sS0FBSyxHQUFHO0FBQUEsSUFDMUQ7QUFBQSxJQUVBLEtBQUssR0FBYyxHQUFzQjtBQUNyQyxhQUFPLFdBQVUsS0FBSyxNQUFNLEdBQUcsR0FBRyxJQUFJO0FBQUEsSUFDMUM7QUFBQSxJQUVBLE9BQU8sS0FBSyxPQUFrQixLQUFnQixHQUFXQyxNQUEyQjtBQUNoRixVQUFJQSxTQUFRO0FBQVcsUUFBQUEsT0FBTSxJQUFJLFdBQVU7QUFDM0MsTUFBQUEsS0FBSSxTQUFTLEtBQUssTUFBTSxRQUFRLElBQUksUUFBUSxDQUFDO0FBQzdDLE1BQUFBLEtBQUksUUFBUSxLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQztBQUMxQyxNQUFBQSxLQUFJLE1BQU0sS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLENBQUM7QUFDcEMsYUFBT0E7QUFBQSxJQUNYO0FBQUEsRUFDSjs7O0FDaERBLE1BQU0sZ0JBQWdCLElBQUlDLE1BQUs7QUFPeEIsTUFBTSxTQUFOLE1BQWE7QUFBQSxJQXFDaEIsY0FBYztBQXBDZCxXQUFRLFFBQW9CO0FBWTVCLHNCQUFtQixJQUFJLE9BQU87QUFDOUIsc0JBQXVCLElBQUksV0FBVztBQUN0QyxtQkFBZ0IsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBRWxDLDBCQUFxQixJQUFJQyxNQUFLO0FBQzlCLDBCQUFxQixJQUFJQSxNQUFLO0FBRTlCLHlCQUFvQixJQUFJQSxNQUFLO0FBQzdCLCtCQUEwQixJQUFJQSxNQUFLO0FBRW5DLG9DQUErQixJQUFJQSxNQUFLO0FBQ3hDLHVDQUFrQyxJQUFJQSxNQUFLO0FBRTNDLGdCQUFhLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUUvQiwwQkFBdUI7QUFDdkIsb0JBQWlCO0FBRWpCLDJCQUF3QjtBQUN4Qiw2QkFBMEI7QUFFMUIsa0JBQWU7QUFDZixpQkFBYztBQUdWLFdBQUssWUFBWSxLQUFLLGNBQWMsS0FBSyxRQUFRLEtBQUssTUFBTSxLQUFLLEdBQUc7QUFBQSxJQUN4RTtBQUFBLElBckNBLElBQUksS0FBSyxPQUFtQjtBQUN4QixXQUFLLFFBQVE7QUFDYixVQUFJLFVBQVUscUJBQXdCO0FBQ2xDLGFBQUssWUFBWSxLQUFLLGNBQWMsS0FBSyxRQUFRLEtBQUssTUFBTSxLQUFLLEdBQUc7QUFBQSxNQUN4RSxPQUFPO0FBQ0gsYUFBSyxjQUFjLEtBQUssZUFBZSxLQUFLLGlCQUFpQixLQUFLLE1BQU0sS0FBSyxHQUFHO0FBQUEsTUFDcEY7QUFBQSxJQUNKO0FBQUEsSUFDQSxJQUFJLE9BQW1CO0FBQUUsYUFBTyxLQUFLO0FBQUEsSUFBTztBQUFBLElBK0I1QyxzQkFBNEI7QUFDeEIsV0FBSyxhQUFhLFFBQVEsS0FBSyxVQUFVLEtBQUssVUFBVSxLQUFLLEtBQUs7QUFBQSxJQUN0RTtBQUFBLElBRUEscUJBQTJCO0FBQ3ZCLE1BQUFBLE1BQUssUUFBUSxLQUFLLGNBQWMsS0FBSyxXQUFXO0FBQUEsSUFDcEQ7QUFBQSxJQUVBLFlBQVksS0FBYSxRQUFnQixNQUFjLEtBQWE7QUFDaEUsV0FBSyxlQUFlO0FBQ3BCLFdBQUssU0FBUztBQUNkLFdBQUssT0FBTztBQUNaLFdBQUssTUFBTTtBQUNYLFdBQUssa0JBQWtCLFlBQVksS0FBSyxRQUFRLE1BQU0sR0FBRztBQUN6RCxhQUFPLEtBQUsseUJBQXlCO0FBQUEsSUFDekM7QUFBQSxJQUVBLGNBQWMsZUFBdUIsaUJBQXlCLE1BQWMsS0FBYTtBQUNyRixXQUFLLE9BQU87QUFDWixXQUFLLE1BQU07QUFDWCxXQUFLLGtCQUFrQixjQUFjLGVBQWUsaUJBQWlCLE1BQU0sR0FBRztBQUM5RSxhQUFPLEtBQUsseUJBQXlCO0FBQUEsSUFDekM7QUFBQSxJQUVBLFFBQVEsUUFBZ0IsSUFBbUI7QUFDdkMsV0FBSyxNQUFNLEtBQUs7QUFDaEIsb0JBQWMsUUFBUSxLQUFLLFVBQVUsUUFBUSxFQUFFO0FBQy9DLFdBQUssU0FBUyxVQUFVLGFBQWE7QUFDckMsV0FBSyxvQkFBb0I7QUFDekIsV0FBSyxtQkFBbUI7QUFBQSxJQUM1QjtBQUFBLElBRUEsS0FBS0MsU0FBd0I7QUFDekIsV0FBSyxTQUFTLEtBQUtBLFFBQU8sUUFBUTtBQUNsQyxXQUFLLFNBQVMsS0FBS0EsUUFBTyxRQUFRO0FBQ2xDLFdBQUssTUFBTSxLQUFLQSxRQUFPLEtBQUs7QUFDNUIsV0FBSyxhQUFhLEtBQUtBLFFBQU8sWUFBWTtBQUMxQyxXQUFLLGFBQWEsS0FBS0EsUUFBTyxZQUFZO0FBRTFDLFdBQUssT0FBT0EsUUFBTztBQUNuQixXQUFLLGVBQWVBLFFBQU87QUFDM0IsV0FBSyxTQUFTQSxRQUFPO0FBRXJCLFdBQUssT0FBT0EsUUFBTztBQUNuQixXQUFLLE1BQU1BLFFBQU87QUFFbEIsV0FBSyxrQkFBa0IsS0FBS0EsUUFBTyxpQkFBaUI7QUFDcEQsV0FBSyxZQUFZLEtBQUtBLFFBQU8sV0FBVztBQUN4QyxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsUUFBUUMsSUFBbUI7QUFDdkIsVUFBSUEsR0FBRSxNQUFNLEtBQUtBLEdBQUUsTUFBTSxLQUFLQSxHQUFFLE1BQU07QUFBRyxlQUFPQSxHQUFFLEtBQUssS0FBSyxRQUFRO0FBQ3BFLE1BQUFBLEdBQUUsV0FBVyxLQUFLLFdBQVcsRUFBRSxXQUFXLEtBQUssaUJBQWlCO0FBQ2hFLGFBQU9BO0FBQUEsSUFDWDtBQUFBLElBRUEsVUFBVUEsSUFBbUI7QUFDekIsTUFBQUEsR0FBRSxXQUFXLEtBQUsseUJBQXlCLEVBQUUsV0FBVyxLQUFLLFlBQVk7QUFDekUsYUFBT0E7QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLE9BQWUsUUFBd0I7QUFDMUMsVUFBSSxLQUFLLFNBQVMscUJBQXdCO0FBQ3RDLGFBQUssU0FBUyxRQUFRO0FBQ3RCLGFBQUssWUFBWSxLQUFLLGNBQWMsS0FBSyxRQUFRLEtBQUssTUFBTSxLQUFLLEdBQUc7QUFBQSxNQUN4RSxPQUFPO0FBQ0gsYUFBSyxnQkFBZ0I7QUFDckIsYUFBSyxrQkFBa0I7QUFDdkIsYUFBSyxjQUFjLEtBQUssZUFBZSxLQUFLLGlCQUFpQixLQUFLLE1BQU0sS0FBSyxHQUFHO0FBQUEsTUFDcEY7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsMkJBQTJCO0FBQ3ZCLFVBQUksS0FBSyxVQUFVLHFCQUF3QjtBQUN2QyxhQUFLLGtCQUFrQixZQUFZLEtBQUssY0FBYyxLQUFLLFFBQVEsS0FBSyxNQUFNLEtBQUssR0FBRztBQUFBLE1BQzFGLE9BQU87QUFDSCxhQUFLLGtCQUFrQixjQUFjLEtBQUssZUFBZSxLQUFLLGlCQUFpQixLQUFLLE1BQU0sS0FBSyxHQUFHO0FBQUEsTUFDdEc7QUFFQSxXQUFLLDBCQUEwQixLQUFLLEtBQUssaUJBQWlCLEVBQUUsUUFBUTtBQUNwRSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsUUFBUSxLQUFXO0FBQ2YsWUFBTSxXQUFXLEtBQUssYUFBYSxHQUFHO0FBQ3RDLFdBQUssU0FBUyxJQUFJLElBQUksTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLFFBQVE7QUFDdEQsV0FBSyxRQUFRLElBQUksTUFBTTtBQUFBLElBQzNCO0FBQUEsSUFFQSxhQUFhLEtBQW1CO0FBQzVCLFlBQU0sT0FBTyxJQUFJO0FBQ2pCLFlBQU0sU0FBUyxLQUFLO0FBQ3BCLGFBQU8sS0FBSyxLQUFLLEtBQUssZUFBZSxpQkFBaUIsR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxFQUNKO0FBRUEsTUFBTSxXQUFXLElBQUksS0FBSzs7O0FDeEpuQixNQUFNLGFBQU4sTUFBMEI7QUFBQSxJQUU3QixZQUFtQixLQUFhO0FBQWI7QUFBQSxJQUFjO0FBQUEsRUFDckM7QUFXTyxNQUFNLFlBQU4sTUFBZ0I7QUFBQSxJQUFoQjtBQUNILFdBQVEsZUFBdUMsb0JBQUksSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU12RCxHQUFNLE9BQXNCLFVBQWdDLE9BQWEsT0FBZ0IsT0FBYTtBQUNsRyxZQUFNLE1BQU0sTUFBTTtBQUNsQixZQUFNLFdBQXFCO0FBQUEsUUFDdkIsT0FBTztBQUFBLFFBQ1A7QUFBQSxRQUNBLE9BQU8sU0FBUztBQUFBLFFBQ2hCO0FBQUEsTUFDSjtBQUNBLFlBQU0sWUFBWSxLQUFLLGFBQWEsSUFBSSxHQUFHO0FBQzNDLFVBQUksY0FBYyxRQUFXO0FBQ3pCLGFBQUssYUFBYSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFBQSxNQUN6QyxPQUFPO0FBQ0gsWUFBSSxVQUFVO0FBQ2QsaUJBQVMsSUFBSSxHQUFHLElBQUksVUFBVSxRQUFRLElBQUksR0FBRyxFQUFFLEdBQUc7QUFDOUMsY0FBSSxVQUFVLENBQUMsRUFBRSxVQUFVLFNBQVMsU0FBUyxVQUFVLENBQUMsRUFBRSxhQUFhLFNBQVMsVUFBVTtBQUN0RixzQkFBVTtBQUNWLHNCQUFVLENBQUMsSUFBSTtBQUFBLFVBQ25CO0FBQUEsUUFDSjtBQUNBLFlBQUksQ0FBQyxTQUFTO0FBQ1Ysb0JBQVUsS0FBSyxRQUFRO0FBQUEsUUFDM0I7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBRUEsS0FBUSxPQUFzQixVQUFnQyxPQUFtQjtBQUM3RSxXQUFLLEdBQUcsT0FBTyxVQUFVLE9BQU8sSUFBSTtBQUFBLElBQ3hDO0FBQUEsSUFFQSxJQUFPLE9BQXNCLFVBQWdDLE9BQWEsT0FBZ0IsT0FBYTtBQUNuRyxZQUFNLE1BQU0sTUFBTTtBQUNsQixZQUFNLFdBQXFCO0FBQUEsUUFDdkIsT0FBTztBQUFBLFFBQ1A7QUFBQSxRQUNBLE9BQU8sU0FBUztBQUFBLFFBQ2hCO0FBQUEsTUFDSjtBQUNBLFlBQU0sWUFBWSxLQUFLLGFBQWEsSUFBSSxHQUFHO0FBQzNDLFVBQUksV0FBVztBQUNYLGlCQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxJQUFJLEdBQUcsRUFBRSxHQUFHO0FBQzlDLGNBQUksVUFBVSxDQUFDLEVBQUUsVUFBVSxTQUFTLFNBQVMsVUFBVSxDQUFDLEVBQUUsYUFBYSxTQUFTLFVBQVU7QUFDdEYsc0JBQVUsT0FBTyxHQUFHLENBQUM7QUFBQSxVQUN6QjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBRUEsS0FBUSxPQUFzQixTQUFtQjtBQUM3QyxZQUFNLE1BQU0sTUFBTTtBQUNsQixZQUFNLFlBQVksS0FBSyxhQUFhLElBQUksR0FBRztBQUMzQyxVQUFJLFdBQVc7QUFDWCxpQkFBUyxJQUFJLFVBQVUsU0FBUyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUc7QUFDNUMsZ0JBQU0sV0FBVyxVQUFVLENBQUM7QUFDNUIsY0FBSSxRQUFRLFNBQVMsT0FBTztBQUN4QixxQkFBUyxTQUFTLEtBQUssU0FBUyxTQUFTLElBQUk7QUFDN0MscUJBQVMsU0FBUyxPQUFPO0FBQ3pCLGdCQUFJLFNBQVMsTUFBTTtBQUNmLHdCQUFVLE9BQU8sR0FBRyxDQUFDO0FBQUEsWUFDekI7QUFBQSxVQUNKO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFFQSxVQUFVO0FBQ04saUJBQVcsT0FBTyxLQUFLLGFBQWEsS0FBSyxHQUFHO0FBQ3hDLGFBQUssYUFBYSxPQUFPLEdBQUc7QUFBQSxNQUNoQztBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsTUFBTSxZQUFOLE1BQWdCO0FBQUEsSUFBaEI7QUFDSSxXQUFRLE9BQU8sSUFBSSxVQUFVO0FBQUE7QUFBQSxJQUU3QixHQUFNLE9BQXNCLFVBQWdDLE9BQW1CO0FBQzNFLFdBQUssS0FBSyxHQUFHLE9BQU8sVUFBVSxLQUFLO0FBQUEsSUFDdkM7QUFBQSxJQUVBLEtBQVEsT0FBc0IsVUFBZ0MsT0FBbUI7QUFDN0UsV0FBSyxLQUFLLEtBQUssT0FBTyxVQUFVLEtBQUs7QUFBQSxJQUN6QztBQUFBLElBRUEsS0FBUSxPQUFzQixTQUFtQjtBQUM3QyxXQUFLLEtBQUssS0FBSyxPQUFPLE9BQU87QUFBQSxJQUNqQztBQUFBLElBRUEsSUFBTyxPQUFzQixVQUFnQyxPQUFhO0FBQ3RFLFdBQUssS0FBSyxJQUFJLE9BQU8sVUFBVSxLQUFLO0FBQUEsSUFDeEM7QUFBQSxFQUNKO0FBRU8sTUFBTSxXQUFXLElBQUksVUFBVTs7O0FDakYvQixNQUFNLGNBQWM7QUFBQSxJQUN2QixhQUFhLElBQUksV0FBOEIsY0FBYztBQUFBLElBQzdELG1CQUFtQixJQUFJLFdBQVcscUJBQXFCO0FBQUEsSUFFdkQsV0FBVyxJQUFJLFdBQThCLFdBQVc7QUFBQSxJQUN4RCxXQUFXLElBQUksV0FBOEIsV0FBVztBQUFBLElBQ3hELFdBQVcsSUFBSSxXQUE4QixXQUFXO0FBQUEsSUFDeEQsU0FBUyxJQUFJLFdBQThCLFNBQVM7QUFBQSxJQUVwRCxhQUFhLElBQUksV0FBZ0MsY0FBYztBQUFBLElBQy9ELGFBQWEsSUFBSSxXQUFnQyxjQUFjO0FBQUEsSUFDL0QsV0FBVyxJQUFJLFdBQWdDLFlBQVk7QUFBQSxJQUUzRCxZQUFZLElBQUksV0FBZ0MsYUFBYTtBQUFBLElBQzdELFdBQVcsSUFBSSxXQUFnQyxZQUFZO0FBQUEsSUFDM0QsVUFBVSxJQUFJLFdBQWdDLFdBQVc7QUFBQSxJQUV6RCxTQUFTLElBQUksV0FBNEIsU0FBUztBQUFBLElBQ2xELE9BQU8sSUFBSSxXQUE0QixPQUFPO0FBQUEsSUFDOUMsWUFBWSxJQUFJLFdBQW1DLFlBQVk7QUFBQSxJQUMvRCxRQUFRLElBQUksV0FBK0IsUUFBUTtBQUFBLElBQ25ELGNBQWMsSUFBSSxXQUFXLGdCQUFnQjtBQUFBLEVBQ2pEOzs7QUNoRE8sTUFBTSxlQUFOLE1BQW1CO0FBQUEsSUFVdEIsY0FBYztBQVRkLG1CQUFnQixJQUFJQyxRQUFPO0FBQzNCLHdCQUFxQixJQUFJQSxRQUFPO0FBQ2hDLGlCQUFjLElBQUlBLFFBQU87QUFDekIsbUJBQWdCLElBQUlBLFFBQU87QUFFM0IsMEJBQXVCO0FBdUN2Qix5QkFBYyxDQUFDLFVBQTRCO0FBQ3ZDLGVBQU8saUJBQWlCLGFBQWEsS0FBSyxhQUFhLEtBQUs7QUFDNUQsZUFBTyxpQkFBaUIsV0FBVyxLQUFLLFdBQVcsS0FBSztBQUV4RCxhQUFLLGVBQWUsTUFBTTtBQUUxQixhQUFLLE1BQU0sSUFBSSxNQUFNLFNBQVMsTUFBTSxPQUFPO0FBQzNDLGFBQUssV0FBVyxLQUFLLEtBQUssS0FBSztBQUMvQixpQkFBUyxLQUFLLFlBQVksV0FBVztBQUFBLFVBQ2pDLFFBQVEsTUFBTTtBQUFBLFVBQ2QsT0FBTyxLQUFLO0FBQUEsVUFDWixPQUFPLEtBQUs7QUFBQSxVQUNaO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTDtBQUVBLHlCQUFjLENBQUMsVUFBNEI7QUFDdkMsYUFBSyxJQUFJLElBQUksTUFBTSxTQUFTLE1BQU0sT0FBTztBQUN6QyxhQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssVUFBVTtBQUM3QyxhQUFLLFdBQVcsS0FBSyxLQUFLLEdBQUc7QUFDN0IsaUJBQVMsS0FBSyxZQUFZLFdBQVc7QUFBQSxVQUNqQyxRQUFRLEtBQUs7QUFBQSxVQUNiLE9BQU8sS0FBSztBQUFBLFVBQ1osT0FBTyxLQUFLO0FBQUEsVUFDWjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0w7QUFFQSx5QkFBYyxDQUFDLFVBQTRCO0FBQ3ZDLGFBQUssSUFBSSxJQUFJLE1BQU0sU0FBUyxNQUFNLE9BQU87QUFDekMsYUFBSyxNQUFNLEtBQUssS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLEtBQUs7QUFFeEMsYUFBSyxNQUFNLEtBQUssS0FBSyxHQUFHO0FBQ3hCLGlCQUFTLEtBQUssWUFBWSxXQUFXO0FBQUEsVUFDakMsUUFBUSxLQUFLO0FBQUEsVUFDYixPQUFPLEtBQUs7QUFBQSxVQUNaLE9BQU8sS0FBSztBQUFBLFVBQ1o7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBRUEsdUJBQVksQ0FBQyxVQUE0QjtBQUNyQyxlQUFPLG9CQUFvQixhQUFhLEtBQUssV0FBVztBQUN4RCxlQUFPLG9CQUFvQixXQUFXLEtBQUssU0FBUztBQUNwRCxpQkFBUyxLQUFLLFlBQVksU0FBUztBQUFBLFVBQy9CLFFBQVEsS0FBSztBQUFBLFVBQ2IsT0FBTyxLQUFLO0FBQUEsVUFDWixPQUFPLEtBQUs7QUFBQSxVQUNaO0FBQUEsUUFDSixDQUFDO0FBQ0QsYUFBSyxlQUFlO0FBQUEsTUFDeEI7QUFFQSwwQkFBZSxDQUFDLFVBQXVCO0FBQ25DLGNBQU0sSUFBSTtBQUVWLFlBQUksUUFBUTtBQUNaLFlBQUksRUFBRSxlQUFlLFFBQVE7QUFDekIsa0JBQVEsRUFBRTtBQUFBLFFBQ2QsV0FBVyxFQUFFLFdBQVcsUUFBUTtBQUM1QixrQkFBUSxDQUFDLEVBQUU7QUFBQSxRQUNmO0FBQ0EsZ0JBQVEsUUFBUSxJQUFJLE9BQU87QUFDM0IsaUJBQVMsS0FBSyxZQUFZLFlBQVksRUFBRSxPQUFPLE9BQU8sU0FBUyxFQUFFLFFBQVEsU0FBUyxFQUFFLE9BQU8sQ0FBQztBQUFBLE1BQ2hHO0FBRUEsMkJBQWdCLENBQUMsVUFBcUI7QUFDbEMsWUFBSSxVQUFVO0FBQ2QsWUFBSSxVQUFVO0FBQ2QsWUFBSSxRQUFRO0FBQ1osZ0JBQVEsTUFBTSxTQUFTLElBQUksT0FBTztBQUNsQyxZQUFJLE1BQU0sU0FBUyxHQUFHO0FBQ2xCLG9CQUFVLENBQUMsTUFBTSxTQUFTO0FBQUEsUUFDOUIsV0FBVyxNQUFNLFNBQVMsR0FBRztBQUN6QixvQkFBVSxDQUFDLE1BQU0sU0FBUztBQUFBLFFBQzlCO0FBQ0EsaUJBQVMsS0FBSyxZQUFZLFlBQVksRUFBRSxPQUFPLE9BQU8sU0FBUyxRQUFRLENBQUM7QUFBQSxNQUM1RTtBQUVBLHVCQUFZLENBQUMsVUFBK0I7QUFDeEMsY0FBTSxlQUFlO0FBQ3JCLGlCQUFTLEtBQUssWUFBWSxTQUFTLEVBQUUsU0FBUyxNQUFNLFNBQVMsTUFBTSxDQUFDO0FBQUEsTUFDeEU7QUFFQSxxQkFBVSxDQUFDLFVBQStCO0FBQ3RDLGNBQU0sZUFBZTtBQUNyQixpQkFBUyxLQUFLLFlBQVksT0FBTyxFQUFFLFNBQVMsTUFBTSxTQUFTLE1BQU0sQ0FBQztBQUFBLE1BQ3RFO0FBRUEsMEJBQWUsQ0FBQyxVQUE0QjtBQUN4QyxjQUFNLFFBQVEsTUFBTSxRQUFRLEtBQUssTUFBTSxRQUFRLFNBQVMsQ0FBQztBQUN6RCxhQUFLLE1BQU0sSUFBSSxNQUFNLFNBQVMsTUFBTSxPQUFPO0FBQzNDLGFBQUssSUFBSSxLQUFLLEtBQUssS0FBSztBQUN4QixhQUFLLGVBQWU7QUFDcEIsY0FBTSxVQUFVO0FBQUEsVUFDWjtBQUFBLFVBQ0EsT0FBTyxLQUFLO0FBQUEsVUFDWixPQUFPLEtBQUs7QUFBQSxRQUNoQjtBQUNBLGlCQUFTLEtBQUssWUFBWSxZQUFZLE9BQU87QUFBQSxNQUNqRDtBQUVBLHlCQUFjLENBQUMsVUFBNEI7QUFDdkMsY0FBTSxRQUFRLE1BQU0sUUFBUSxLQUFLLE1BQU0sUUFBUSxTQUFTLENBQUM7QUFDekQsYUFBSyxJQUFJLElBQUksTUFBTSxTQUFTLE1BQU0sT0FBTztBQUN6QyxhQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssS0FBSztBQUV4QyxhQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUc7QUFDeEIsaUJBQVMsS0FBSyxZQUFZLFdBQVc7QUFBQSxVQUNqQztBQUFBLFVBQ0EsT0FBTyxLQUFLO0FBQUEsVUFDWixPQUFPLEtBQUs7QUFBQSxRQUNoQixDQUFDO0FBQUEsTUFDTDtBQUVBLHdCQUFhLENBQUMsVUFBNEI7QUFDdEMsWUFBSSxNQUFNLFFBQVEsU0FBUyxHQUFHO0FBQzFCLGdCQUFNLFFBQVEsTUFBTSxRQUFRLEtBQUssTUFBTSxRQUFRLFNBQVMsQ0FBQztBQUN6RCxlQUFLLElBQUksSUFBSSxNQUFNLFNBQVMsTUFBTSxPQUFPO0FBQUEsUUFDN0M7QUFDQSxjQUFNLFVBQVU7QUFBQSxVQUNaO0FBQUEsVUFDQSxPQUFPLEtBQUs7QUFBQSxVQUNaLE9BQU8sS0FBSztBQUFBLFFBQ2hCO0FBQ0EsaUJBQVMsS0FBSyxZQUFZLFVBQVUsT0FBTztBQUFBLE1BQy9DO0FBaEtJLFdBQUssS0FBSyxNQUFhO0FBQUEsSUFDM0I7QUFBQSxJQUVBLEtBQUssU0FBNEI7QUFDN0IsV0FBSyxPQUFPO0FBQ1osY0FBUSxpQkFBaUIsYUFBYSxLQUFLLGFBQWEsS0FBSztBQUM3RCxjQUFRLGlCQUFpQixhQUFhLEtBQUssYUFBYSxLQUFLO0FBQzdELGNBQVEsaUJBQWlCLGNBQWMsS0FBSyxjQUFjLEtBQUs7QUFDL0QsY0FBUSxpQkFBaUIsa0JBQWtCLEtBQUssZUFBZSxLQUFLO0FBQ3BFLGVBQVMsaUJBQWlCLFdBQVcsS0FBSyxXQUFXLEtBQUs7QUFDMUQsZUFBUyxpQkFBaUIsU0FBUyxLQUFLLFNBQVMsS0FBSztBQUV0RCxjQUFRLGlCQUFpQixjQUFjLEtBQUssY0FBYyxLQUFLO0FBQy9ELGNBQVEsaUJBQWlCLGFBQWEsS0FBSyxhQUFhLEtBQUs7QUFDN0QsY0FBUSxpQkFBaUIsWUFBWSxLQUFLLFlBQVksS0FBSztBQUMzRCxjQUFRLGlCQUFpQixlQUFlLEtBQUssWUFBWSxLQUFLO0FBQzlELFdBQUssVUFBVTtBQUFBLElBQ25CO0FBQUEsSUFFQSxTQUFTO0FBQ0wsVUFBSSxLQUFLLFNBQVM7QUFDZCxhQUFLLFFBQVEsb0JBQW9CLGFBQWEsS0FBSyxXQUFXO0FBQzlELGFBQUssUUFBUSxvQkFBb0IsYUFBYSxLQUFLLFdBQVc7QUFDOUQsYUFBSyxRQUFRLG9CQUFvQixjQUFjLEtBQUssWUFBWTtBQUNoRSxpQkFBUyxvQkFBb0IsV0FBVyxLQUFLLFNBQVM7QUFDdEQsaUJBQVMsb0JBQW9CLFNBQVMsS0FBSyxPQUFPO0FBRWxELGFBQUssUUFBUSxvQkFBb0IsY0FBYyxLQUFLLFlBQVk7QUFDaEUsYUFBSyxRQUFRLG9CQUFvQixhQUFhLEtBQUssV0FBVztBQUM5RCxhQUFLLFFBQVEsb0JBQW9CLFlBQVksS0FBSyxVQUFVO0FBQzVELGFBQUssUUFBUSxvQkFBb0IsZUFBZSxLQUFLLFVBQVU7QUFBQSxNQUNuRTtBQUFBLElBQ0o7QUFBQSxFQWlJSjs7O0FDOUhPLE1BQU0sUUFBTixNQUFZO0FBQUEsSUFZZixjQUFjO0FBWGQsV0FBUSxXQUE4QixDQUFDO0FBQ3ZDLFdBQVEsVUFBNEIsb0JBQUksSUFBSTtBQWU1QyxXQUFRLFlBQVksQ0FBQyxZQUF1QztBQUN4RCxjQUFNLFVBQVUsUUFBUTtBQUN4QixZQUFJLFlBQVksYUFBZ0I7QUFDNUIsZUFBSyxTQUFTLGtCQUFvQixDQUFDO0FBQUEsUUFDdkMsV0FBVyxZQUFZLGVBQWtCO0FBQ3JDLGVBQUssU0FBUyxrQkFBb0IsRUFBRTtBQUFBLFFBQ3hDLFdBQVcsWUFBWSxlQUFrQjtBQUNyQyxlQUFLLFNBQVMsb0JBQXNCLEVBQUU7QUFBQSxRQUMxQyxXQUFXLFlBQVksZ0JBQW1CO0FBQ3RDLGVBQUssU0FBUyxvQkFBc0IsQ0FBQztBQUFBLFFBQ3pDO0FBRUEsYUFBSyxRQUFRLElBQUksT0FBTztBQUFBLE1BQzVCO0FBRUEsV0FBUSxVQUFVLENBQUMsWUFBdUM7QUFDdEQsY0FBTSxVQUFVLFFBQVE7QUFDeEIsWUFBSSxZQUFZLGVBQWtCLFlBQVksZUFBa0I7QUFDNUQsZUFBSyxTQUFTLGtCQUFvQixDQUFDO0FBQUEsUUFDdkMsV0FBVyxZQUFZLGlCQUFvQixZQUFZLGdCQUFtQjtBQUN0RSxlQUFLLFNBQVMsb0JBQXNCLENBQUM7QUFBQSxRQUN6QztBQUVBLGFBQUssUUFBUSxPQUFPLE9BQU87QUFBQSxNQUMvQjtBQTVCSSxlQUFTLEdBQUcsWUFBWSxTQUFTLEtBQUssU0FBUztBQUMvQyxlQUFTLEdBQUcsWUFBWSxPQUFPLEtBQUssT0FBTztBQUFBLElBQy9DO0FBQUEsSUFYQSxTQUFTLE1BQWlCLE9BQXFCO0FBQzNDLFdBQUssU0FBUyxJQUFJLElBQUk7QUFBQSxJQUMxQjtBQUFBLElBRUEsU0FBUyxNQUF5QjtBQUM5QixhQUFPLEtBQUssU0FBUyxJQUFJLEtBQUs7QUFBQSxJQUNsQztBQUFBLElBaUNBLFdBQVcsUUFBOEI7QUFDckMsYUFBTyxLQUFLLFFBQVEsSUFBSSxNQUFNO0FBQUEsSUFDbEM7QUFBQSxFQUNKOzs7QUMzRk8sTUFBTSxjQUFjO0FBQUEsSUFDdkIsWUFBWSxJQUFJLFdBQVcsYUFBYTtBQUFBLElBQ3hDLFdBQVcsSUFBSSxXQUFXLFlBQVk7QUFBQSxJQUN0QyxhQUFhLElBQUksV0FBVyxjQUFjO0FBQUEsSUFDMUMsWUFBWSxJQUFJLFdBQVcsYUFBYTtBQUFBLElBQ3hDLE9BQU8sSUFBSSxXQUFXLE9BQU87QUFBQSxFQUNqQztBQUVPLE1BQU0sU0FBTixNQUFhO0FBQUEsSUFvQmhCLGNBQWM7QUFuQmQsd0JBQXFCO0FBRXJCLHlCQUFzQjtBQUN0QixrQkFBZSxZQUFZLElBQUksSUFBSTtBQUNuQyx1QkFBb0IsWUFBWSxJQUFJLElBQUk7QUFHeEM7QUFBQSx3QkFBcUIsWUFBWSxJQUFJLElBQUk7QUFVekMsb0JBQWtCO0FBZ0JsQixrQkFBTyxNQUFNO0FBQ1QsYUFBSyxPQUFPLFlBQVksSUFBSSxJQUFJO0FBQ2hDLGFBQUssYUFBYSxLQUFLLE9BQU8sS0FBSztBQUNuQyxpQkFBUyxLQUFLLFlBQVksVUFBVTtBQUNwQyxpQkFBUyxLQUFLLFlBQVksV0FBVztBQUNyQyxpQkFBUyxLQUFLLFlBQVksS0FBSztBQUMvQixpQkFBUyxLQUFLLFlBQVksVUFBVTtBQUNwQyxpQkFBUyxLQUFLLFlBQVksU0FBUztBQUNuQyxhQUFLLFlBQVksS0FBSztBQUN0QixpQkFBUztBQUNULGFBQUssYUFBYSxzQkFBc0IsS0FBSyxJQUFJO0FBQUEsTUFDckQ7QUF4QkksV0FBSyxRQUFRLElBQUksTUFBTTtBQUN2QixXQUFLLGNBQWMsSUFBSSxhQUFhO0FBRXBDLGVBQVMsR0FBRyxZQUFZLGNBQWMsTUFBTTtBQUN4QyxZQUFJLEtBQUs7QUFBUSxlQUFLLE1BQU07QUFBQSxNQUNoQyxDQUFDO0FBQUEsSUFDTDtBQUFBO0FBQUEsSUFoQkEsSUFBSSxpQkFBeUI7QUFDekIsYUFBUSxZQUFZLElBQUksSUFBSSxPQUFTLEtBQUs7QUFBQSxJQUM5QztBQUFBLElBZ0JBLFFBQVE7QUFDSixXQUFLLEtBQUs7QUFDVixXQUFLLFNBQVM7QUFBQSxJQUNsQjtBQUFBLElBZUEsUUFBUTtBQUNKLDJCQUFxQixLQUFLLFVBQVU7QUFDcEMsV0FBSyxTQUFTO0FBQUEsSUFDbEI7QUFBQSxJQUVBLFlBQVk7QUFBQSxJQUFDO0FBQUEsRUFDakI7OztBQ2hFTyxNQUFNLG1CQUFOLGNBQXdDLFNBQThCO0FBQUEsSUFBdEU7QUFBQTtBQUNILGtCQUFlO0FBUWYsa0JBQTZCO0FBQUE7QUFBQSxFQUNqQztBQVdPLE1BQU0sV0FBTixNQUF3QjtBQUFBLElBSTNCLGNBQWM7QUFDVixXQUFLLE9BQU8sS0FBSyxPQUFPLElBQUksaUJBQW9CO0FBQUEsSUFDcEQ7QUFBQSxJQUVBLFlBQVksTUFBYyxhQUFzQixNQUFZLE9BQTZCLGNBQTJCO0FBQ2hILFlBQU0sUUFBUSxZQUFZLElBQUk7QUFDOUIsWUFBTSxPQUFPLElBQUksaUJBQWlCO0FBRWxDLFdBQUssT0FBTztBQUNaLFdBQUssUUFBUTtBQUNiLFdBQUssY0FBYztBQUNuQixXQUFLLE9BQU87QUFDWixXQUFLLE9BQU87QUFFWixXQUFLLEtBQUssSUFBSSxJQUFJO0FBQ2xCLFdBQUssT0FBTztBQUFBLElBQ2hCO0FBQUEsSUFFQSxVQUFVLE1BQWM7QUFDcEIsWUFBTSxRQUFRLENBQUM7QUFDZixVQUFJLE1BQW9DLEtBQUs7QUFDN0MsYUFBTyxPQUFPLElBQUksU0FBUyxNQUFNO0FBQzdCLGNBQU0sS0FBSyxHQUFHO0FBQ2QsY0FBTSxJQUFJO0FBQUEsTUFDZDtBQUVBLFVBQUksUUFBUSxRQUFXO0FBQ25CLGNBQU0scUJBQXFCLElBQUk7QUFBQSxNQUNuQyxPQUFPO0FBQ0gsY0FBTSxNQUFNLFlBQVksSUFBSTtBQUM1QixpQkFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNuQyxnQkFBTSxPQUFPLE1BQU0sQ0FBQztBQUNwQixlQUFLLE1BQU07QUFBQSxRQUNmO0FBQ0EsWUFBSSxNQUFNO0FBQ1YsYUFBSyxPQUFPLElBQUk7QUFBQSxNQUNwQjtBQUFBLElBQ0o7QUFBQSxJQUVBLFFBQVE7QUFDSixXQUFLLE9BQU8sS0FBSyxPQUFPLElBQUksaUJBQWlCO0FBQzdDLFdBQUssS0FBSyxRQUFRLFlBQVksSUFBSTtBQUFBLElBQ3RDO0FBQUEsRUFDSjs7O0FDckVPLE1BQU0saUJBQU4sTUFBcUI7QUFBQSxJQVN4QixZQUFtQixZQUFvQjtBQUFwQjtBQVBuQixrQkFBZTtBQUNmLHVCQUFvQjtBQUVwQix1QkFBOEIsb0JBQUksSUFBSTtBQUN0QyxzQkFBNkIsb0JBQUksSUFBSTtBQUNyQyx1QkFBb0I7QUFBQSxJQUVvQjtBQUFBLElBRXhDLFNBQVMsT0FBNEI7QUFDakMsWUFBTSxjQUFjLEtBQUs7QUFDekIsWUFBTSxjQUFjLFFBQVEsS0FBSztBQUNqQyxXQUFLLFFBQVE7QUFDYixXQUFLLFlBQVksS0FBSyxJQUFJLEtBQUssV0FBVyxLQUFLLElBQUk7QUFDbkQsYUFBTyxFQUFFLGFBQWEsWUFBWTtBQUFBLElBQ3RDO0FBQUEsSUFFQSxLQUFLLE9BQW9CO0FBQ3JCLFdBQUssU0FBUyxJQUFJLEtBQUs7QUFDdkIsV0FBSyxhQUFhLE1BQU07QUFBQSxJQUM1QjtBQUFBLElBRUEsWUFBWTtBQUNSLFdBQUssU0FBUyxNQUFNO0FBQ3BCLFVBQUksU0FBUztBQUNiLGlCQUFXLFNBQVMsS0FBSyxXQUFXO0FBQ2hDLGNBQU0sY0FBYztBQUNwQixrQkFBVSxNQUFNO0FBQUEsTUFDcEI7QUFDQSxXQUFLLE9BQU87QUFDWixXQUFLLFlBQVksS0FBSyxJQUFJLEtBQUssV0FBVyxLQUFLLElBQUk7QUFBQSxJQUN2RDtBQUFBLEVBRUo7OztBQzdCTyxNQUFLLG9CQUFMLGtCQUFLQyx1QkFBTDtBQUNILElBQUFBLHNDQUFBLGtCQUFlLEtBQWY7QUFDQSxJQUFBQSxzQ0FBQTtBQUNBLElBQUFBLHNDQUFBO0FBQ0EsSUFBQUEsc0NBQUE7QUFDQSxJQUFBQSxzQ0FBQTtBQUNBLElBQUFBLHNDQUFBO0FBQ0EsSUFBQUEsc0NBQUE7QUFDQSxJQUFBQSxzQ0FBQTtBQUNBLElBQUFBLHNDQUFBO0FBQ0EsSUFBQUEsc0NBQUE7QUFDQSxJQUFBQSxzQ0FBQTtBQUNBLElBQUFBLHNDQUFBO0FBQ0EsSUFBQUEsc0NBQUE7QUFiUSxXQUFBQTtBQUFBLEtBQUE7QUE2RlosTUFBTSxtQkFBbUIsb0JBQUksSUFBa0Q7QUFNeEUsV0FBUywyQkFBb0QsTUFBOEQ7QUFDOUgsV0FBTyxpQkFBaUIsSUFBSSxJQUFJO0FBQUEsRUFDcEM7OztBQ3JHQSxXQUFTLG1CQUFtQixTQUFpQixNQUFXLFNBQWtCO0FBQ3RFLFVBQU0sUUFBUSxFQUFFLFNBQVMsU0FBUyxPQUFPLFNBQVMsS0FBSztBQUN2RCxTQUFLLFlBQVksS0FBSztBQUFBLEVBQzFCO0FBRU8sV0FBUyw4QkFBOEIsU0FBdUI7QUFDakUsVUFBTSxVQUFVLFFBQVEsS0FBSztBQUM3QixVQUFNLFVBQVUsUUFBUTtBQUN4QixVQUFNLFVBQVUsMkJBQTJCLFFBQVEsSUFBSTtBQUN2RCxRQUFJLFNBQVM7QUFDVCxjQUFRLElBQUksbUNBQW1DLE9BQU8sVUFBVSxrQkFBa0IsUUFBUSxJQUFJLENBQUMsRUFBRTtBQUNqRyxjQUFRLE9BQU87QUFBQSxJQUNuQixPQUFPO0FBQ0gsWUFBTSxFQUFFLEtBQUssSUFBSTtBQUNqQix5QkFBbUIsU0FBUyxFQUFFLEtBQUssR0FBRyw0QkFBNEIsUUFBUSxJQUFJLGFBQWE7QUFBQSxJQUMvRjtBQUFBLEVBQ0o7OztBQ0ZBLE9BQUssWUFBWTs7O0FDWFYsTUFBTSxnQkFBTixNQUEwQztBQUFBLElBQzdDLFlBQVksU0FBMkI7QUFBQSxJQUFDO0FBQUEsSUFDeEMsaUJBQWlCLE9BQWUsUUFBc0I7QUFBQSxJQUFDO0FBQUEsSUFDdkQsYUFBYUMsSUFBV0MsSUFBVyxPQUFlLFFBQXNCO0FBQUEsSUFBQztBQUFBLElBQ3pFLFdBQVdDLFNBQXNCO0FBQUEsSUFBQztBQUFBLElBQ2xDLFdBQVdDLFNBQXlCO0FBQUEsSUFBQztBQUFBLElBQ3JDLFNBQVMsTUFBZ0IsYUFBNEI7QUFBQSxJQUFDO0FBQUEsSUFDdEQsZ0JBQWdCLE9BQXdCO0FBQUEsSUFBQztBQUFBLElBQ3pDLE1BQU1BLFNBQTBCO0FBQUEsSUFBQztBQUFBLElBQ2pDLGFBQWFDLFdBQTBCO0FBQUEsSUFBQztBQUFBLElBQ3hDLFlBQVlKLElBQVlDLElBQVksT0FBZ0IsUUFBdUI7QUFBQSxJQUFDO0FBQUEsSUFDNUUsYUFBYSxVQUFlLGFBQTRCO0FBQUEsSUFBQztBQUFBLElBQ3pELG1CQUFtQixVQUF5QixhQUE0QjtBQUFBLElBQUM7QUFBQSxJQUN6RSxTQUFTLE1BQWlCLE9BQWEsYUFBNEI7QUFBQSxJQUFDO0FBQUEsSUFDcEUsU0FBUyxNQUFxQjtBQUFBLElBQUM7QUFBQSxJQUMvQixVQUFVLE1BQWUsYUFBd0M7QUFBQSxJQUFDO0FBQUEsSUFDbEUsYUFBYSxTQUFrQixhQUF3QztBQUFBLElBQUM7QUFBQSxJQUN4RSxTQUFlO0FBQUEsSUFBQztBQUFBLEVBQ3BCOzs7QUNPQSxNQUFNLHVCQUF1QjtBQUFBLElBQ3pCLE1BQU07QUFBQSxJQUNOLGFBQWEsSUFBSUksV0FBVSxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQUEsSUFDckMsYUFBYTtBQUFBLEVBQ2pCO0FBUUEsTUFBSTtBQUVHLE1BQU0sWUFBTixNQUFnQjtBQUFBLElBWW5CLFlBQVksVUFBNEIsQ0FBQyxHQUFHO0FBWDVDLG1CQUFnQjtBQUNoQixvQkFBaUI7QUFFakIsMkJBQXdCO0FBRXhCLDJCQUF3QjtBQUN4Qiw0QkFBeUI7QUFFekIscUJBQXNCO0FBSWxCLGdCQUFVO0FBQ1YsV0FBSyxnQkFBZ0IsUUFBUSxpQkFBaUI7QUFDOUMsV0FBSyxVQUFVLFFBQVEsV0FBVztBQUNsQyxVQUFJLFFBQVEsWUFBWSwrREFBbUI7QUFDdkMsYUFBSyxVQUFVLElBQUksY0FBYyxPQUFPO0FBQUEsTUFDNUMsT0FBTztBQUNILGFBQUssVUFBVSxJQUFJLGFBQWEsT0FBTztBQUN2QyxhQUFLLFNBQVMsT0FBTyxZQUFZLE9BQU8sV0FBVztBQUFBLE1BQ3ZEO0FBQ0EsY0FBUSxJQUFJLCtCQUErQixLQUFLLE9BQU8sRUFBRTtBQUN6RCxXQUFLLFFBQVEsYUFBYSxHQUFHLEdBQUcsS0FBSyxPQUFPLEtBQUssTUFBTTtBQUN2RCwwQkFBb0I7QUFBQSxJQUN4QjtBQUFBLElBRUEsU0FBUyxPQUFlLFFBQXNCO0FBQzFDLFdBQUssZ0JBQWdCO0FBQ3JCLFdBQUssaUJBQWlCO0FBRXRCLFlBQU0sY0FBYyxLQUFLLE1BQU0sUUFBUSxLQUFLLGFBQWE7QUFDekQsWUFBTSxlQUFlLEtBQUssTUFBTSxTQUFTLEtBQUssYUFBYTtBQUUzRCxXQUFLLFFBQVE7QUFDYixXQUFLLFNBQVM7QUFFZCxXQUFLLFFBQVEsaUJBQWlCLGFBQWEsWUFBWTtBQUN2RCxXQUFLLFFBQVEsYUFBYSxHQUFHLEdBQUcsYUFBYSxZQUFZO0FBRXpELGVBQVMsS0FBSyxZQUFZLFFBQVEsRUFBRSxPQUFPLE9BQU8sQ0FBQztBQUNuRCxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFFTyxXQUFTLGlCQUE0QjtBQUN4QyxXQUFPO0FBQUEsRUFDWDtBQUVPLFdBQVMsa0JBQTJDO0FBQ3ZELFdBQU8sZUFBZSxFQUFFO0FBQUEsRUFDNUI7OztBQzdGTyxXQUFTLFVBQVUsS0FBeUI7QUFDL0MsV0FBTyxPQUFPLFFBQVEsWUFBWSxlQUFlO0FBQUEsRUFDckQ7QUFZTyxXQUFTLGNBQWlCLE9BQXNCQyxnQkFBcUI7QUFDeEUsV0FBTyxVQUFVLFNBQVlBLGlCQUFnQjtBQUFBLEVBQ2pEOzs7QUNKTyxNQUFNLFlBQU4sTUFBZ0I7QUFBQSxJQVluQixZQUFvQixRQUF3QixpQkFBMEIsT0FBTztBQUF6RDtBQUF3QjtBQVg1QyxXQUFRLFFBQVE7QUFDaEIsV0FBUSxRQUF5QixDQUFDO0FBQ2xDLFdBQU8sY0FBc0I7QUFDN0IsV0FBUSxVQUFVO0FBRWxCLFdBQVEsWUFBWSxvQkFBSSxJQUFzQjtBQStCOUMsV0FBUSxZQUFZLENBQUMsVUFBd0I7QUFDekMsYUFBSyxRQUFRO0FBQ2IsY0FBTSxXQUFXLE1BQU07QUFDdkIsY0FBTSxFQUFFLFFBQVEsSUFBSTtBQUNwQixZQUFJLENBQUMsU0FBUyxTQUFTO0FBQ25CLGtCQUFRLE1BQU0sc0JBQXNCLFNBQVMsV0FBVyx3QkFBd0IsRUFBRTtBQUFBLFFBQ3RGLE9BQU87QUFDSCxrQkFBUSxJQUFJLHNCQUFzQixLQUFLLFdBQVcsbUJBQW1CO0FBQUEsUUFDekU7QUFDQSxZQUFJLEtBQUs7QUFBYSxlQUFLLFlBQVksUUFBUTtBQUMvQyxZQUFJLFlBQVksVUFBYSxLQUFLLFVBQVUsSUFBSSxPQUFPLEdBQUc7QUFDdEQsZ0JBQU0sV0FBVyxLQUFLLFVBQVUsSUFBSSxPQUFPO0FBQzNDLGNBQUksU0FBUztBQUFTLHFCQUFTLFNBQVMsSUFBSTtBQUM1QyxlQUFLLFVBQVUsT0FBTyxPQUFPO0FBQUEsUUFDakM7QUFDQSxZQUFJLEtBQUssTUFBTSxTQUFTLEdBQUc7QUFDdkIsZ0JBQU0sVUFBVSxLQUFLLE1BQU0sTUFBTTtBQUNqQyxlQUFLLEtBQUssUUFBUSxTQUFTLFFBQVEsU0FBUyxRQUFRLFFBQVE7QUFBQSxRQUNoRSxPQUFPO0FBQ0gsY0FBSSxLQUFLLGdCQUFnQjtBQUNyQixpQkFBSyxPQUFPLFVBQVU7QUFBQSxVQUMxQjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBL0NJLFdBQUssT0FBTyxZQUFZLEtBQUs7QUFBQSxJQUNqQztBQUFBLElBTkEsSUFBSSxZQUFxQjtBQUNyQixhQUFPLEtBQUssVUFBVTtBQUFBLElBQzFCO0FBQUEsSUFNQSxLQUFLLFNBQXdCLFNBQXlCLFVBQXlDO0FBQzNGLFlBQU0sVUFBVSxLQUFLO0FBQ3JCLGNBQVEsVUFBVTtBQUNsQixVQUFJLEtBQUssVUFBVSxjQUFrQjtBQUNqQyxhQUFLLE1BQU0sS0FBSyxFQUFFLFNBQVMsU0FBUyxTQUFTLENBQUM7QUFDOUMsZUFBTztBQUFBLE1BQ1g7QUFDQSxXQUFLLE9BQU8sWUFBWSxTQUFTLE9BQVE7QUFDekMsV0FBSyxPQUFPLFlBQVksS0FBSztBQUM3QixVQUFJO0FBQVUsYUFBSyxVQUFVLElBQUksU0FBUyxRQUFRO0FBQ2xELGFBQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxXQUFjLFNBQXdCLFVBQXlCLENBQUMsR0FBZTtBQUMzRSxhQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDNUIsYUFBSyxLQUFLLFNBQVMsU0FBUyxPQUFPO0FBQUEsTUFDdkMsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQTRCSjs7O0FDM0VPLE1BQU0sa0JBQU4sTUFBc0I7QUFBQSxJQU96QixZQUFtQixTQUFxQjtBQUFyQjtBQU5uQixXQUFRLGNBQWM7QUFPbEIsWUFBTSxTQUFTLElBQUksT0FBTyxTQUFtQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JFLFdBQUssZ0JBQWdCLElBQUksVUFBVSxNQUFNO0FBQUEsSUFDN0M7QUFBQSxJQVJRLGtCQUFrQjtBQUN0QixhQUFPLEtBQUs7QUFBQSxJQUNoQjtBQUFBLElBUUEsY0FBYyxRQUEyQixTQUFtQztBQUN4RSxZQUFNLG1CQUFtQixPQUFPLDJCQUEyQjtBQUMzRCxZQUFNLGNBQWMsS0FBSyxnQkFBZ0I7QUFDekMsWUFBTSxVQUFVLEVBQUUsYUFBYSw0QkFBc0MsUUFBUSxrQkFBa0IsUUFBUTtBQUN2RyxXQUFLLGNBQWMsS0FBSyxTQUFTLENBQUMsZ0JBQXVCLENBQUM7QUFDMUQsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUVBLGVBQWUsWUFBNEM7QUFDdkQsWUFBTSxjQUFjLEtBQUssZ0JBQWdCO0FBQ3pDLFlBQU0sVUFBVSxFQUFFLGFBQWEsNkJBQXVDLFdBQVc7QUFDakYsWUFBTSxVQUFVLGtDQUFrQyxVQUFVO0FBQzVELFdBQUssY0FBYyxLQUFLLFNBQVMsT0FBTztBQUN4QyxhQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsZUFBZSxhQUFxQjtBQUFBLElBQUM7QUFBQSxJQUVyQyxPQUFPLE9BQWUsUUFBZ0IsYUFBcUIsY0FBc0I7QUFDN0UsWUFBTTtBQUNOLFlBQU0sVUFBVSxFQUFFLE1BQU0sT0FBTyxRQUFRLGFBQWEsYUFBYTtBQUNqRSxXQUFLLGNBQWMsS0FBSyxPQUFPO0FBQUEsSUFDbkM7QUFBQSxFQUNKO0FBRUEsV0FBUyxrQ0FBa0MsWUFBbUQ7QUFDMUYsVUFBTSxFQUFFLFFBQVEsUUFBUSxJQUFJO0FBQzVCLFVBQU0sVUFBeUIsQ0FBQztBQUNoQyxVQUFNLGFBQWEsb0JBQUksSUFBSTtBQUUzQixRQUFJLFVBQVUsQ0FBQyxVQUFVLE1BQU0sR0FBRztBQUM5QixjQUFRLEtBQU0sT0FBc0IsTUFBTTtBQUMxQyxpQkFBVyxJQUFLLE9BQXNCLE1BQU07QUFBQSxJQUNoRDtBQUVBLGVBQVcsVUFBVSxTQUFTO0FBQzFCLFVBQUksVUFBVSxDQUFDLFVBQVUsTUFBTSxLQUFLLENBQUMsV0FBVyxJQUFJLE9BQU8sS0FBSyxNQUFNLEdBQUc7QUFDckUsZ0JBQVEsS0FBSyxPQUFPLEtBQUssTUFBTTtBQUMvQixtQkFBVyxJQUFJLE9BQU8sS0FBSyxNQUFNO0FBQUEsTUFDckM7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7OztBQ3pCQSxNQUFNLDBCQUEwQixJQUFJO0FBQ3BDLE1BQU0sMEJBQTBCLEtBQUs7QUFJckMsTUFBSTtBQUNHLFdBQVMsc0JBQXNCO0FBQ2xDLFVBQU1DLFVBQVMsZUFBZSxFQUFFO0FBQ2hDLFVBQU0sS0FBS0EsUUFBTztBQUVsQixhQUFTLHFCQUFxQixNQUEyQjtBQUNyRCxZQUFNLFNBQVMsR0FBRyxhQUFhO0FBQy9CLFNBQUcsV0FBVyxHQUFHLGdCQUFnQixNQUFNO0FBQ3ZDLFNBQUcsV0FBVyxHQUFHLGdCQUFnQixNQUFNLEdBQUcsWUFBWTtBQUN0RCxTQUFHLFdBQVcsR0FBRyxnQkFBZ0IsSUFBSTtBQUNyQyxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sTUFBTSxvQkFBSSxJQUFpQztBQUNqRCxVQUFNLGVBQWVBLFFBQU87QUFFNUIsVUFBTSxjQUFjO0FBQUEsTUFDaEIsUUFBUSxxQkFBcUIsdUJBQXVCO0FBQUEsTUFDcEQsTUFBTSxJQUFJLGVBQWUsSUFBSSxZQUFZLHVCQUF1QixDQUFDO0FBQUEsTUFDakUsV0FBVyxJQUFJLGVBQWUsWUFBWTtBQUFBLElBQzlDO0FBQ0EsUUFBSSxJQUFJLGVBQXVCLFdBQVc7QUFFMUMsVUFBTSxlQUFlO0FBQUEsTUFDakIsUUFBUSxxQkFBcUIsdUJBQXVCO0FBQUEsTUFDcEQsTUFBTSxJQUFJLGVBQWUsSUFBSSxZQUFZLHVCQUF1QixDQUFDO0FBQUEsTUFDakUsV0FBVyxJQUFJLGVBQWUsWUFBWTtBQUFBLElBQzlDO0FBQ0EsUUFBSSxJQUFJLGdCQUF3QixZQUFZO0FBRTVDLFVBQU0saUJBQWlCO0FBQUEsTUFDbkIsUUFBUSxxQkFBcUIsdUJBQXVCO0FBQUEsTUFDcEQsTUFBTSxJQUFJLGVBQWUsSUFBSSxZQUFZLHVCQUF1QixDQUFDO0FBQUEsTUFDakUsV0FBVyxJQUFJLGVBQWUsWUFBWTtBQUFBLElBQzlDO0FBQ0EsUUFBSSxJQUFJLGtCQUEwQixjQUFjO0FBRWhELG9CQUFnQjtBQUFBLE1BQ1osUUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBY08sV0FBUyxhQUFhLE1BQXVCLE1BQWMsTUFBMkI7QUFDekYsUUFBSSxDQUFDO0FBQWUsWUFBTTtBQUMxQixVQUFNLFFBQVEsY0FBYyxPQUFPLElBQUksSUFBSTtBQUMzQyxVQUFNLGNBQWMsS0FBSyxLQUFLLE9BQU8sTUFBTSxVQUFVLFVBQVU7QUFDL0QsVUFBTSxRQUFRLGNBQWMsT0FBTyxJQUFJLElBQUksRUFBRyxVQUFVLFNBQVMsV0FBVztBQUM1RSxVQUFNLE9BQU8sY0FBYyxPQUFPLElBQUksSUFBSSxFQUFHLEtBQUssU0FBUyxLQUFLO0FBQ2hFLFdBQU8sRUFBRSxPQUFPLE1BQU0sTUFBTSxLQUFLO0FBQUEsRUFDckM7QUFFTyxXQUFTLGFBQWEsT0FBb0I7QUFDN0MsUUFBSSxDQUFDO0FBQWUsWUFBTTtBQUMxQixRQUFJLENBQUM7QUFBTztBQUNaLFVBQU1DLFdBQVUsZUFBZSxFQUFFO0FBQ2pDLFVBQU0sS0FBS0EsU0FBUTtBQUNuQixVQUFNLGFBQWEsY0FBYyxPQUFPLElBQUksTUFBTSxJQUFJO0FBQ3RELE9BQUcsV0FBVyxHQUFHLGdCQUFnQixXQUFXLE1BQU07QUFDbEQsT0FBRyxjQUFjLEdBQUcsZ0JBQWdCLE1BQU0sTUFBTSxhQUFhLE1BQU0sS0FBSyxTQUFTLEdBQUcsTUFBTSxLQUFLLFFBQVEsVUFBVTtBQUFBLEVBQ3JIO0FBRU8sV0FBUyxXQUFXQyxXQUFvQixPQUFvQjtBQUMvRCxVQUFNRCxXQUFVLGVBQWUsRUFBRTtBQUNqQyxVQUFNLEtBQUtBLFNBQVE7QUFDbkIsVUFBTSxhQUFhLE1BQU07QUFDekIsVUFBTSxhQUFhLGNBQWUsT0FBTyxJQUFJLFVBQVU7QUFDdkQsVUFBTSxpQkFBaUJDLFVBQVMsY0FBYyxNQUFNLElBQUk7QUFDeEQsT0FBRyxvQkFBb0JBLFVBQVMsU0FBUyxlQUFlLGNBQWMsZUFBZSxZQUFZO0FBQ2pHLE9BQUcsZ0JBQWdCLEdBQUcsZ0JBQWdCLGVBQWUsY0FBYyxXQUFXLFFBQVEsTUFBTSxNQUFNLGFBQWEsTUFBTSxNQUFNLFdBQVc7QUFBQSxFQUMxSTs7O0FDekdPLE1BQU0sbUJBQWtDO0FBQ3hDLE1BQU0sV0FBMEI7QUFDaEMsTUFBTSxZQUEyQjtBQUNqQyxNQUFNLG9CQUFtQztBQUN6QyxNQUFNLFVBQXlCO0FBQy9CLE1BQU0sa0JBQWlDO0FBQ3ZDLE1BQU0sWUFBMkI7QUFDakMsTUFBTSxnQkFBK0I7OztBQytCckMsV0FBUyxtQkFBbUIsUUFBbUM7QUFDbEUsUUFBSSxrQkFBa0IsY0FBYztBQUNoQyxhQUFPO0FBQUEsSUFDWCxXQUFXLGtCQUFrQixZQUFZO0FBQ3JDLGFBQU87QUFBQSxJQUNYLFdBQVcsa0JBQWtCLFlBQVk7QUFDckMsYUFBTztBQUFBLElBQ1gsV0FBVyxrQkFBa0IsV0FBVztBQUNwQyxhQUFPO0FBQUEsSUFDWCxXQUFXLGtCQUFrQixhQUFhO0FBQ3RDLGFBQU87QUFBQSxJQUNYLFdBQVcsa0JBQWtCLGFBQWE7QUFDdEMsYUFBTztBQUFBLElBQ1gsV0FBVyxrQkFBa0IsWUFBWTtBQUNyQyxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sdUJBQXVCLE9BQU8sTUFBTTtBQUFBLEVBQzlDOzs7QUN4RUEsTUFBTSxhQUFhLENBQUM7QUFFYixXQUFTLGNBQTZCLElBQTRCLE1BQXdCO0FBQzdGLFFBQUksV0FBVyxJQUFJLE1BQU0sUUFBVztBQUNoQyxhQUFPLFdBQVcsSUFBSTtBQUFBLElBQzFCO0FBRUEsUUFBSTtBQUNKLFlBQVEsTUFBTTtBQUFBLE1BQ1YsS0FBSztBQUNELG9CQUFZLEdBQUcsYUFBYSxxQkFBcUIsS0FBSyxHQUFHLGFBQWEseUJBQXlCLEtBQUssR0FBRyxhQUFhLDRCQUE0QjtBQUNoSjtBQUFBLE1BQ0osS0FBSztBQUNELG9CQUFZLEdBQUcsYUFBYSxnQ0FBZ0MsS0FBSyxHQUFHLGFBQWEsb0NBQW9DLEtBQUssR0FBRyxhQUFhLHVDQUF1QztBQUNqTDtBQUFBLE1BQ0osS0FBSztBQUNELG9CQUFZLEdBQUcsYUFBYSwrQkFBK0IsS0FBSyxHQUFHLGFBQWEsbUNBQW1DLEtBQUssR0FBRyxhQUFhLHNDQUFzQztBQUM5SztBQUFBLE1BQ0osS0FBSztBQUNELG9CQUFZLEdBQUcsYUFBYSxnQ0FBZ0MsS0FBSyxHQUFHLGFBQWEsdUNBQXVDO0FBQ3hIO0FBQUEsTUFDSjtBQUNJLG9CQUFZLEdBQUcsYUFBYSxJQUFJO0FBQUEsSUFDeEM7QUFFQSxRQUFJLGNBQWMsTUFBTTtBQUNwQixjQUFRLElBQUksK0JBQStCLElBQUksaUJBQWlCO0FBQUEsSUFDcEUsT0FBTztBQUNILGNBQVEsSUFBSSwrQkFBK0IsSUFBSSxTQUFTO0FBQUEsSUFDNUQ7QUFDQSxlQUFXLElBQUksSUFBSTtBQUNuQixXQUFPO0FBQUEsRUFDWDs7O0FDaENPLFdBQVMsa0JBQWtCQyxJQUFtQjtBQUNqRCxRQUFJLElBQUk7QUFDUixXQUFPLEtBQUssSUFBSUEsRUFBQyxLQUFLLElBQUk7QUFDdEIsTUFBQUEsTUFBSztBQUNMO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYOzs7QUNMQSxNQUFJLDJCQUEyQjtBQUMvQixNQUFNLDJCQUEyQixvQkFBSSxJQUFvQjtBQUVsRCxXQUFTLDJCQUEyQjtBQUN2QywrQkFBMkI7QUFDM0IsNkJBQXlCLE1BQU07QUFBQSxFQUNuQztBQUVPLFdBQVMsMkJBQTJCLFNBQXFDO0FBQzVFLFVBQU0sS0FBSyxRQUFRO0FBQ25CLFFBQUkseUJBQXlCLElBQUksRUFBRSxHQUFHO0FBQ2xDLGFBQU8seUJBQXlCLElBQUksRUFBRTtBQUFBLElBQzFDLE9BQU87QUFDSCxZQUFNLE9BQU87QUFDYiwrQkFBeUIsSUFBSSxJQUFJLElBQUk7QUFDckMsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKOzs7QUNSQSxNQUFJLGVBQWU7QUFDbkIsV0FBUyxrQkFBMEI7QUFDL0IsV0FBTztBQUFBLEVBQ1g7QUErSkEsTUFBTSxVQUFVO0FBRWhCLE1BQU0sY0FBYztBQUNwQixNQUFNLGlDQUFpQztBQUN2QyxNQUFNLGVBQWU7QUFDckIsTUFBTSxpQkFBaUI7QUFDdkIsTUFBTSx3QkFBd0I7QUFDOUIsTUFBTSxtQkFBbUI7QUFDekIsTUFBTSxjQUFjO0FBRXBCLFdBQVMsc0JBQXNCLFFBQXdCO0FBQ25ELFFBQUksU0FBUztBQUNiLFFBQUksT0FBTyxPQUFPLDhCQUE4QixJQUFJLElBQUk7QUFDcEQsYUFBTztBQUFBLElBQ1g7QUFFQSxRQUFJLE9BQU8sT0FBTyxZQUFZLElBQUksSUFBSTtBQUNsQyxnQkFBVTtBQUFBLElBQ2Q7QUFDQSxRQUFJLE9BQU8sT0FBTyxjQUFjLElBQUksSUFBSTtBQUNwQyxnQkFBVTtBQUFBLElBQ2Q7QUFDQSxRQUFJLE9BQU8sT0FBTyxxQkFBcUIsSUFBSSxJQUFJO0FBQzNDLGdCQUFVO0FBQUEsSUFDZDtBQUNBLFFBQUksT0FBTyxPQUFPLGdCQUFnQixJQUFJLElBQUk7QUFDdEMsZ0JBQVU7QUFBQSxJQUNkO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLGNBQWMsUUFBZ0IsV0FBc0M7QUFDekUsUUFBSTtBQUNKLFVBQU0sWUFBbUQsQ0FBQztBQUMxRCxZQUFRLFVBQVUsWUFBWSxLQUFLLE1BQU0sTUFBTSxNQUFNO0FBQ2pELGdCQUFVLEtBQUssRUFBRSxPQUFPLFFBQVEsQ0FBQyxHQUFHLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQztBQUFBLElBQ3pEO0FBRUEsZUFBVyxZQUFZLFdBQVc7QUFDOUIsWUFBTSxVQUFVLFVBQVUsU0FBUyxHQUFHLEtBQUssdUJBQXVCLFNBQVMsR0FBRztBQUM5RSxlQUFTLE9BQU8sUUFBUSxTQUFTLE9BQU8sT0FBTztBQUFBLElBQ25EO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFFTyxXQUFTLGdCQUFnQixZQUE2RDtBQUV6RixVQUFNLEtBQUssZ0JBQThCLEVBQUU7QUFFM0MsUUFBSSxnQkFBZ0IsY0FBYyxXQUFXLGVBQWUsRUFBRTtBQUM5RCxRQUFJLGtCQUFrQixjQUFjLFdBQVcsaUJBQWlCLEVBQUU7QUFDbEUsUUFBSSxZQUFZLGNBQWMsV0FBVyxXQUFXLENBQUMsQ0FBQztBQUN0RCxRQUFJLE9BQU8sY0FBYyxXQUFXLE1BQU0sa0JBQWtCO0FBQzVELFlBQVEsSUFBSSxtQkFBbUIsSUFBSSxFQUFFO0FBRXJDLFFBQUksUUFBUSxjQUFjLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFDOUMsVUFBTSxVQUFVLGNBQWMsTUFBTSxTQUFTLEtBQUs7QUFDbEQsVUFBTSxtQkFBbUIsY0FBYyxNQUFNLGtCQUFrQixXQUFlO0FBQzlFLFVBQU0sbUJBQW1CLGNBQWMsTUFBTSxrQkFBa0IsMEJBQTRCO0FBQzNGLFVBQU0sbUJBQW1CLGNBQWMsTUFBTSxrQkFBa0Isa0JBQW9CO0FBQ25GLFVBQU0sbUJBQW1CLGNBQWMsTUFBTSxrQkFBa0IsMEJBQTRCO0FBQzNGLFVBQU0sYUFBYSxjQUFjLE1BQU0sWUFBWSxlQUFhO0FBQ2hFLFVBQU0sYUFBYSxjQUFjLE1BQU0sWUFBWSxlQUFhO0FBRWhFLFFBQUkscUJBQXFCLGNBQWMsV0FBVyxvQkFBb0IsbUJBQTBCO0FBQ2hHLFFBQUksY0FBYyxjQUFjLFdBQVcsYUFBYSxJQUFJO0FBQzVELFFBQUksZUFBZSxjQUFjLFdBQVcsY0FBYywyQkFBNEI7QUFDdEYsUUFBSSxZQUFZLGNBQWMsV0FBVyxXQUFXLGVBQWE7QUFFakUsUUFBSSxXQUFXLGlCQUFpQjtBQUM1QixZQUFNLFFBQVEsV0FBVyxnQkFBZ0IsTUFBTSxrQkFBa0I7QUFDakUsdUJBQWlCLE1BQU0sQ0FBQztBQUN4Qix5QkFBbUIsTUFBTSxDQUFDO0FBQUEsSUFDOUI7QUFFQSxRQUFJLENBQUM7QUFBZSxZQUFNO0FBQzFCLFFBQUksQ0FBQztBQUFpQixZQUFNO0FBRTVCLFFBQUksZ0JBQWdCLGNBQWMsT0FBTyxXQUFXLElBQUksS0FBSyxLQUFLO0FBQ2xFLFFBQUksa0JBQWtCLGdCQUFnQixPQUFPLFdBQVcsSUFBSSxLQUFLLEtBQUs7QUFDdEUsVUFBTSxVQUFVLFdBQVcsV0FBVyxDQUFDO0FBQ3ZDLGFBQVMsSUFBSSxHQUFHLElBQUksUUFBUSxRQUFRLEVBQUUsR0FBRztBQUNyQyx1QkFBaUIsV0FBVyxRQUFRLENBQUMsQ0FBQztBQUFBO0FBQ3RDLHlCQUFtQixXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFBQSxJQUM1QztBQUVBLG9CQUFnQixjQUFjLGVBQWUsU0FBUztBQUN0RCxzQkFBa0IsY0FBYyxpQkFBaUIsU0FBUztBQUUxRCxxQkFBaUIsc0JBQXNCLGFBQWE7QUFDcEQsdUJBQW1CLHNCQUFzQixlQUFlO0FBRXhELG9CQUFnQixnQkFBZ0I7QUFDaEMsc0JBQWtCLGtCQUFrQjtBQUVwQyxVQUFNLFVBQVUsR0FBRyxjQUFjO0FBQ2pDLFFBQUksWUFBWSxNQUFNO0FBQ2xCLGNBQVEsS0FBSyxZQUFZLElBQUksZUFBZTtBQUM1QyxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sdUJBQXVCLGFBQWEsSUFBSSxlQUFlLEdBQUcsYUFBYTtBQUM3RSxRQUFJLHlCQUF5QixNQUFNO0FBQy9CLGNBQVEsS0FBSyxZQUFZLElBQUksOEJBQThCO0FBQzNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSx5QkFBeUIsYUFBYSxJQUFJLGlCQUFpQixHQUFHLGVBQWU7QUFDbkYsUUFBSSwyQkFBMkIsTUFBTTtBQUNqQyxjQUFRLEtBQUssWUFBWSxJQUFJLGdDQUFnQztBQUM3RCxhQUFPO0FBQUEsSUFDWDtBQUVBLE9BQUcsYUFBYSxTQUFTLG9CQUFvQjtBQUM3QyxPQUFHLGFBQWEsU0FBUyxzQkFBc0I7QUFDL0MsT0FBRyxZQUFZLE9BQU87QUFHdEIsVUFBTSxXQUFzQixDQUFDO0FBQzdCLFVBQU1DLFlBQVc7QUFBQSxNQUNiO0FBQUEsTUFDQSxPQUFPO0FBQUEsTUFDUCxJQUFJLGdCQUFnQjtBQUFBLE1BRXBCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUVBLGVBQWUsQ0FBQztBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBRUEsMEJBQXNCQSxXQUFVLFdBQVcsWUFBWSxDQUFDLENBQUM7QUFDekQsV0FBT0E7QUFBQSxFQUNYO0FBRU8sV0FBUyxzQkFBc0JBLFdBQW9CLGFBQWtDO0FBQ3hGLFVBQU0scUJBQXFCLG9CQUFJLElBQWlDO0FBQ2hFLFVBQU0sRUFBRSxlQUFlLFVBQVUsUUFBUSxJQUFJQTtBQUU3QyxVQUFNQyxXQUFVLGVBQWUsRUFBRTtBQUNqQyxVQUFNLEtBQUtBLFNBQVE7QUFFbkIsUUFBSSxVQUFVO0FBQ1YsZUFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLFFBQVEsRUFBRSxHQUFHO0FBQ3pDLGNBQU0sZUFBZSxZQUFZLENBQUM7QUFDbEMsY0FBTSxFQUFFLE1BQU0sTUFBTSxTQUFTLGVBQUFDLGVBQWMsSUFBSTtBQUcvQyxZQUFJLEtBQUssT0FBTyxJQUFJLElBQUksSUFBSTtBQUN4QixnQkFBTSxjQUFjLEtBQUssTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUN0QyxjQUFJLGtCQUFrQixtQkFBbUIsSUFBSSxXQUFXO0FBQ3hELGNBQUksQ0FBQyxpQkFBaUI7QUFDbEIsOEJBQWtCLENBQUMsWUFBWTtBQUMvQiwrQkFBbUIsSUFBSSxhQUFhLGVBQWU7QUFBQSxVQUN2RCxPQUFPO0FBQ0gsNEJBQWdCLEtBQUssWUFBWTtBQUFBLFVBQ3JDO0FBQ0E7QUFBQSxRQUNKO0FBRUEsY0FBTSxXQUFXLEdBQUcsbUJBQW1CLFNBQVMsSUFBSTtBQUNwRCxZQUFJLENBQUMsVUFBVTtBQUNYO0FBQUEsUUFDSjtBQUVBLFlBQUk7QUFDSixnQkFBUSxNQUFNO0FBQUEsVUFDVixLQUFLO0FBQ0QscUJBQVMsYUFBYSxLQUFLLFFBQVcsSUFBSSxRQUFRO0FBQ2xEO0FBQUEsVUFDSixLQUFLO0FBQ0QscUJBQVMsY0FBYyxLQUFLLFFBQVcsSUFBSSxRQUFRO0FBQ25EO0FBQUEsVUFDSixLQUFLO0FBQ0QscUJBQVMsY0FBYyxLQUFLLFFBQVcsSUFBSSxRQUFRO0FBQ25EO0FBQUEsVUFDSixLQUFLO0FBQ0QscUJBQVMsWUFBWSxLQUFLLFFBQVcsSUFBSSxRQUFRO0FBQ2pEO0FBQUEsVUFDSixLQUFLO0FBQ0QscUJBQVMsV0FBVyxLQUFLLFFBQVcsSUFBSSxRQUFRO0FBQUEsVUFDcEQsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUNELHFCQUFTLGNBQWMsS0FBSyxRQUFXLElBQUksUUFBUTtBQUNuRDtBQUFBLFVBQ0osS0FBSztBQUNELHFCQUFTLFlBQVksS0FBSyxRQUFXLElBQUksUUFBUTtBQUNqRDtBQUFBLFVBQ0osS0FBSztBQUNELHFCQUFTLFlBQVksS0FBSyxRQUFXLElBQUksUUFBUTtBQUNqRDtBQUFBLFVBQ0osS0FBSztBQUFBLFVBQ0wsS0FBSztBQUNELHFCQUFTLGlCQUFpQixLQUFLLFFBQVcsSUFBSSxRQUFRO0FBQ3REO0FBQUEsVUFDSixLQUFLO0FBQ0QscUJBQVMsb0JBQW9CLEtBQUssUUFBVyxJQUFJLFFBQVE7QUFDekQ7QUFBQSxVQUNKO0FBQ0ksa0JBQU0sSUFBSSxNQUFNLHlCQUF5QixJQUFJLEVBQUU7QUFBQSxRQUN2RDtBQUVBLGNBQU0sYUFBYSxFQUFFLE1BQU0sUUFBUSxLQUFLO0FBQ3hDLG1CQUFXLFVBQVUsV0FBVztBQUNoQyxZQUFJQSxtQkFBa0I7QUFBVyxxQkFBVyxnQkFBZ0JBO0FBRTVELHNCQUFjLElBQUksSUFBSTtBQUN0QixpQkFBUyxLQUFLLFVBQVU7QUFBQSxNQUM1QjtBQUFBLElBQ0o7QUFHQSxlQUFXLENBQUMsYUFBYSxlQUFlLEtBQUssb0JBQW9CO0FBQzdELFVBQUksZ0JBQWdCLFVBQVU7QUFBRztBQUNqQyxZQUFNLGVBQWUsR0FBRyxxQkFBcUIsU0FBUyxXQUFXO0FBQ2pFLFlBQU0sY0FBYyxHQUFHLCtCQUErQixTQUFTLGNBQWMsR0FBRyx1QkFBdUI7QUFFdkcsWUFBTSxRQUFRLGdCQUFnQixJQUFJLENBQUMsWUFBWSxRQUFRLEtBQUssTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFFO0FBQzNFLFlBQU0sVUFBVSxNQUFNLEtBQUssR0FBRyxrQkFBa0IsU0FBUyxLQUFLLENBQUUsRUFBRSxPQUFPLENBQUMsT0FBTyxVQUFVO0FBQ3ZGLFlBQUksUUFBUSxHQUFHLGlCQUFpQjtBQUM1QixrQkFBUSxLQUFLLGtCQUFrQixXQUFXLElBQUksTUFBTSxLQUFLLENBQUMsYUFBYTtBQUN2RSxpQkFBTztBQUFBLFFBQ1g7QUFDQSxlQUFPO0FBQUEsTUFDWCxDQUFDO0FBRUQsWUFBTSxpQkFBaUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxRQUNBLE9BQU8sQ0FBQztBQUFBLE1BQ1o7QUFFQSxZQUFNLFVBQVUsR0FBRyxrQkFBa0IsU0FBUyxTQUFTLEdBQUcsY0FBYztBQUN4RSxlQUFTLElBQUksR0FBRyxJQUFJLGdCQUFnQixRQUFRLEVBQUUsR0FBRztBQUM3QyxjQUFNLEVBQUUsTUFBTSxNQUFNLFNBQVMsZUFBQUEsZUFBYyxJQUFJLGdCQUFnQixDQUFDO0FBQ2hFLGNBQU0sY0FBYyxRQUFRLENBQUM7QUFDN0IsY0FBTSxZQUFZLGtCQUFrQixJQUFJO0FBQ3hDLGNBQU0sWUFBWSxLQUFLLE1BQU0sSUFBSSxFQUFFLENBQUM7QUFDcEMsY0FBTSxPQUFPLEVBQUUsTUFBTSxXQUFXLE1BQU0sU0FBUyxlQUFBQSxnQkFBZSxhQUFhLFVBQVc7QUFDdEYsdUJBQWUsTUFBTSxTQUFTLElBQUk7QUFBQSxNQUN0QztBQUVBLG9CQUFjLFdBQVcsSUFBSTtBQUM3QixlQUFTLEtBQUssY0FBYztBQUFBLElBQ2hDO0FBRUEsVUFBTSxjQUFjLHVDQUFtQztBQUN2RCxRQUFJLGFBQWE7QUFDYixZQUFNRCxXQUFVLGVBQWUsRUFBRTtBQUNqQyxZQUFNLGdCQUFnQkEsU0FBUTtBQUM5QixZQUFNLE9BQU8sS0FBSyxLQUFLLFlBQVksY0FBYyxhQUFhLElBQUk7QUFDbEUsTUFBQUQsVUFBUyxjQUFjLDRCQUFvQywrQkFBMkI7QUFBQSxJQUMxRjtBQUFBLEVBQ0o7QUFtQkEsTUFBTSxpQkFBaUI7QUFDdkIsV0FBUyxjQUFjLEdBQVcsT0FBZSxLQUFhLFNBQWlCO0FBQzNFLFFBQUksU0FBUztBQUNiLGFBQVMsSUFBSSxTQUFTLEtBQUssR0FBRyxJQUFJLFNBQVMsR0FBRyxHQUFHLEtBQUs7QUFDbEQsZ0JBQVUsUUFBUSxRQUFRLGdCQUFnQixNQUFNLElBQUksR0FBRyxFQUFFLFFBQVEsd0JBQXdCLEVBQUUsU0FBUyxDQUFDO0FBQUEsSUFDekc7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUVBLFdBQVMsYUFBYSxJQUFRLFFBQWdCLE1BQStCO0FBQ3pFLGFBQVMsT0FBTyxRQUFRLGdCQUFnQixhQUFhO0FBQ3JELFVBQU0sU0FBUyxHQUFHLGFBQWEsSUFBSTtBQUNuQyxPQUFHLGFBQWEsUUFBUSxNQUFNO0FBQzlCLE9BQUcsY0FBYyxNQUFNO0FBQ3ZCLFVBQU0sYUFBYSxHQUFHLGlCQUFpQixNQUFNO0FBQzdDLFFBQUksY0FBYyxJQUFJO0FBQ2xCLFlBQU0sUUFBUSxPQUFPLE1BQU0sSUFBSTtBQUMvQixZQUFNLGFBQWEsTUFBTTtBQUN6QixZQUFNLFVBQVUsa0JBQWtCLFVBQVU7QUFDNUMsY0FBUTtBQUFBLFFBQ0osTUFDSyxJQUFJLENBQUMsR0FBRyxNQUFNO0FBQ1gsaUJBQU8sR0FBRyxJQUFJLE9BQU8sVUFBVSxrQkFBa0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFBQSxRQUN6RSxDQUFDLEVBQ0EsS0FBSyxJQUFJO0FBQUEsTUFDbEI7QUFDQSxjQUFRLEtBQUs7QUFBQSxFQUF1QixVQUFVLEVBQUU7QUFDaEQsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUVBLFdBQVMsa0JBQWtCLE1BQTJCO0FBQ2xELFlBQVEsTUFBTTtBQUFBLE1BQ1YsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYO0FBQ0ksY0FBTSxJQUFJLE1BQU0seUJBQXlCLElBQUksRUFBRTtBQUFBLElBQ3ZEO0FBQUEsRUFDSjtBQUVBLFdBQVMsYUFBYSxJQUFRLFVBQWdDLE9BQW9DO0FBQzlGLFFBQUksaUJBQWlCLGNBQWM7QUFDL0IsU0FBRyxXQUFXLFVBQVUsS0FBSztBQUFBLElBQ2pDLE9BQU87QUFDSCxTQUFHLFVBQVUsVUFBVSxLQUFLO0FBQUEsSUFDaEM7QUFBQSxFQUNKO0FBRUEsV0FBUyxjQUFjLElBQVEsVUFBZ0MsT0FBb0M7QUFDL0YsUUFBSSxpQkFBaUIsY0FBYztBQUMvQixTQUFHLFdBQVcsVUFBVSxLQUFLO0FBQUEsSUFDakMsT0FBTztBQUNILFNBQUcsV0FBVyxVQUFVLE1BQU0sUUFBUTtBQUFBLElBQzFDO0FBQUEsRUFDSjtBQUVBLFdBQVMsY0FBYyxJQUFRLFVBQWdDLE9BQXFCO0FBQ2hGLFFBQUksaUJBQWlCLGNBQWM7QUFDL0IsU0FBRyxXQUFXLFVBQVUsS0FBSztBQUFBLElBQ2pDLE9BQU87QUFDSCxTQUFHLFdBQVcsVUFBVSxNQUFNLFFBQVE7QUFBQSxJQUMxQztBQUFBLEVBQ0o7QUFFQSxXQUFTLGNBQWMsSUFBUSxVQUFnQyxPQUFvQztBQUMvRixRQUFJLGlCQUFpQixjQUFjO0FBQy9CLFNBQUcsV0FBVyxVQUFVLEtBQUs7QUFBQSxJQUNqQyxPQUFPO0FBQ0gsU0FBRyxXQUFXLFVBQVUsTUFBTSxRQUFRO0FBQUEsSUFDMUM7QUFBQSxFQUNKO0FBRUEsV0FBUyxZQUFZLElBQVEsVUFBZ0MsT0FBcUI7QUFDOUUsT0FBRyxXQUFXLFVBQVUsS0FBSztBQUFBLEVBQ2pDO0FBRUEsV0FBUyxXQUFXLElBQVEsVUFBZ0MsT0FBcUI7QUFDN0UsT0FBRyxVQUFVLFVBQVUsS0FBSztBQUFBLEVBQ2hDO0FBRUEsV0FBUyxZQUFZLElBQVEsVUFBZ0MsT0FBa0M7QUFDM0YsUUFBSSxpQkFBaUIsY0FBYztBQUMvQixTQUFHLGlCQUFpQixVQUFVLE9BQU8sS0FBSztBQUFBLElBQzlDLE9BQU87QUFDSCxTQUFHLGlCQUFpQixVQUFVLE9BQU8sTUFBTSxRQUFRO0FBQUEsSUFDdkQ7QUFBQSxFQUNKO0FBRUEsV0FBUyxZQUFZLElBQVEsVUFBZ0MsT0FBa0M7QUFDM0YsUUFBSSxpQkFBaUIsY0FBYztBQUMvQixTQUFHLGlCQUFpQixVQUFVLE9BQU8sS0FBSztBQUFBLElBQzlDLE9BQU87QUFDSCxTQUFHLGlCQUFpQixVQUFVLE9BQU8sTUFBTSxRQUFRO0FBQUEsSUFDdkQ7QUFBQSxFQUNKO0FBRUEsV0FBUyxpQkFBaUIsSUFBUSxVQUFnQyxTQUFtQztBQUNqRyxRQUFJLENBQUM7QUFBUztBQUNkLFVBQU0sT0FBTywyQkFBMkIsT0FBTztBQUMvQyxPQUFHLGNBQWMsR0FBRyxXQUFXLElBQUk7QUFDbkMsT0FBRyxZQUFZLFFBQVEsY0FBYyxRQUFRLGFBQWM7QUFDM0QsT0FBRyxVQUFVLFVBQVUsSUFBSTtBQUFBLEVBQy9CO0FBRUEsV0FBUyxvQkFBb0IsSUFBUSxVQUFnQyxTQUFtQztBQUNwRyxRQUFJLENBQUM7QUFBUztBQUNkLFVBQU0sT0FBTywyQkFBMkIsT0FBTztBQUMvQyxPQUFHLGNBQWMsR0FBRyxXQUFXLElBQUk7QUFDbkMsT0FBRyxZQUFZLFFBQVEsY0FBYyxRQUFRLGFBQWM7QUFDM0QsT0FBRyxVQUFVLFVBQVUsSUFBSTtBQUFBLEVBQy9COzs7QUN2akJPLE1BQU0sZUFBTixNQUF5QztBQUFBLElBb0M1QyxZQUFZLFNBQTJCO0FBMUJ2QywyQkFBc0IsSUFBSSxLQUFLO0FBQy9CLHNCQUFpQixJQUFJLEtBQUs7QUFFMUIsc0JBQXFCLElBQUksU0FBUztBQUNsQyx1QkFBcUI7QUFFckIsMEJBQWU7QUFBQSxRQUNYO0FBQUEsUUFDQSxhQUFhLElBQUlHLFdBQVUsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUFBLFFBQ3JDLGFBQWE7QUFBQSxNQUNqQjtBQUVBLDJCQUEyQyxvQkFBSSxJQUEwQjtBQVN6RSxtQkFBZ0I7QUFDaEIsb0JBQWlCO0FBRWpCLG9DQUFrQztBQWlQbEMsc0JBQVcsQ0FBQyxNQUFpQixRQUF1QixnQkFBK0I7QUFDL0UsWUFBSSxLQUFLO0FBQVcsZUFBSyxTQUFTLFlBQVksWUFBWSxhQUFhLGtCQUErQjtBQUV0RyxjQUFNLEtBQUssS0FBSztBQUNoQixZQUFJLEtBQUssYUFBYTtBQUFXLGdCQUFNLElBQUksTUFBTSxvQkFBb0I7QUFFckUsY0FBTUMsWUFBVyxLQUFLO0FBQ3RCLGNBQU0sZUFBZUEsVUFBUztBQUM5QixpQkFBUyxJQUFJLEdBQUcsSUFBSSxhQUFhLFFBQVEsRUFBRSxHQUFHO0FBQzFDLGdCQUFNLGNBQWMsYUFBYSxDQUFDO0FBQ2xDLGdCQUFNLE9BQU8sWUFBWTtBQUN6QixjQUFJO0FBQ0osY0FBSSxRQUFRLGdCQUFnQixhQUFhLElBQUksR0FBRztBQUM1QyxzQkFBVSxPQUFPLGVBQWUsYUFBYSxJQUFJO0FBQUEsVUFDckQsT0FBTztBQUNILHNCQUFVLEtBQUssU0FBUyxJQUFJLEtBQUtBLFVBQVMsY0FBYyxJQUFJLEVBQUU7QUFBQSxVQUNsRTtBQUdBLGdCQUFNLGlCQUFpQixLQUFLLGNBQWMsSUFBSSxJQUFJO0FBQ2xELGNBQUksbUJBQW1CLFdBQVcsQ0FBQyxLQUFLLGFBQWEsSUFBSSxJQUFJO0FBQUc7QUFHaEUsY0FBSSxLQUFLO0FBQVcsaUJBQUssU0FBUyxZQUFZLGtCQUFrQixHQUFHLElBQUksSUFBSSxPQUFPLElBQUksK0JBQTRDO0FBQ2xJLGNBQUksWUFBWTtBQUFXLHdCQUFZLE9BQU8sT0FBTztBQUNyRCxjQUFJLEtBQUs7QUFBVyxpQkFBSyxTQUFTLFVBQVUsZ0JBQWdCO0FBQzVELGVBQUssY0FBYyxJQUFJLE1BQU0sT0FBTztBQUFBLFFBQ3hDO0FBRUEsY0FBTSxpQkFBaUJBLFVBQVMseUNBQW9DO0FBQ3BFLGNBQU0sZ0JBQWdCLFFBQVE7QUFDOUIsWUFBSSxpQkFBaUIsZ0JBQWdCO0FBQ2pDLHFCQUFXQSxXQUFVLGFBQWE7QUFBQSxRQUN0QztBQUVBLFlBQUksS0FBSyxjQUFjO0FBQVc7QUFDbEMsV0FBRyxnQkFBZ0IsS0FBSyxTQUFTO0FBRWpDLFlBQUksS0FBSyxVQUFVLFFBQVc7QUFDMUIsY0FBSSxLQUFLLFNBQVM7QUFDZCxlQUFHLGFBQWEsS0FBSyxNQUFNLEtBQUssTUFBTSxPQUFPLEdBQUcsY0FBYyxLQUFLLE1BQU0sS0FBSztBQUFBLFVBQ2xGLE9BQU87QUFDSCxlQUFHLFdBQVcsS0FBSyxNQUFNLEtBQUssTUFBTSxPQUFPLEtBQUssTUFBTSxLQUFLO0FBQUEsVUFDL0Q7QUFBQSxRQUNKLE9BQU87QUFDSCxjQUFJLEtBQUssU0FBUztBQUNkLGVBQUcsYUFBYSxLQUFLLE1BQU0sS0FBSyxrQkFBa0IsR0FBRyxjQUFjLENBQUM7QUFBQSxVQUN4RSxPQUFPO0FBQ0gsZUFBRyxXQUFXLEtBQUssTUFBTSxHQUFHLEtBQUssZ0JBQWdCO0FBQUEsVUFDckQ7QUFBQSxRQUNKO0FBRUEsWUFBSSxLQUFLO0FBQVcsZUFBSyxTQUFTLFVBQVUsVUFBVTtBQUFBLE1BQzFEO0FBblNJLFlBQU0sYUFBYSxDQUFDO0FBQ3BCLGlCQUFXLHdCQUF3QixRQUFRLG9CQUFvQixRQUFRLFFBQVEsMEJBQTBCO0FBQ3pHLGlCQUFXLFlBQVksUUFBUSxjQUFjO0FBQzdDLGlCQUFXLGtCQUFrQixRQUFRLG1CQUFtQjtBQUN4RCxNQUFDLFdBQW1CLGVBQWUsUUFBUSxlQUFlO0FBQzFELFlBQU0sU0FBUyxRQUFRLFVBQVUsU0FBUyxxQkFBcUIsUUFBUSxFQUFFLENBQUM7QUFDMUUsVUFBSSxDQUFDO0FBQVEsY0FBTSxJQUFJLE1BQU0sbUJBQW1CO0FBQ2hELFdBQUssU0FBUztBQUNkLFdBQUsseUJBQXlCLFFBQVEsMkJBQTJCO0FBRWpFLFVBQUksS0FBSyxPQUFPLFdBQVcsVUFBVSxVQUFVO0FBQy9DLFVBQUksT0FBTztBQUFNLGNBQU07QUFFdkIsV0FBSyxLQUFLO0FBRVYsb0JBQWMsSUFBSSwwQkFBMEI7QUFDNUMsb0JBQWMsSUFBSSx3QkFBd0I7QUFDMUMsb0JBQWMsSUFBSSxrQkFBa0I7QUFFcEMsV0FBSyxtQkFBbUIsR0FBRyxhQUFhLEdBQUcsZ0JBQWdCO0FBQzNELFdBQUssMEJBQTBCLEdBQUcsYUFBYSxHQUFHLHVCQUF1QjtBQUN6RSxXQUFLLHdCQUF3QixHQUFHLGFBQWEsR0FBRyxxQkFBcUI7QUFDckUsV0FBSywyQkFBMkIsR0FBRyxhQUFhLEdBQUcsK0JBQStCO0FBQ2xGLFdBQUssc0JBQXNCLEdBQUcsYUFBYSxHQUFHLHNCQUFzQjtBQUNwRSxVQUFJLEdBQUcsYUFBYSxHQUFHLDhCQUE4QixJQUFJO0FBQUcsY0FBTTtBQUVsRSxVQUFJLFFBQVEsMEJBQTBCLHFCQUFxQixVQUFVLHVCQUF1QixRQUFRO0FBQ2hHLGNBQU0sVUFBVSxRQUFRO0FBQ3hCLGFBQUssU0FBUyxJQUFJLGdCQUFnQixPQUFPO0FBQ3pDLGFBQUssT0FBTyxjQUFjLFNBQVMsZUFBZSxRQUFRLEdBQXdCLE9BQU87QUFBQSxNQUM3RjtBQUFBLElBQ0o7QUFBQSxJQUVBLGlCQUFpQixPQUFlLFFBQXNCO0FBQ2xELFdBQUssUUFBUTtBQUNiLFdBQUssU0FBUztBQUNkLFdBQUssT0FBTyxRQUFRO0FBQ3BCLFdBQUssT0FBTyxTQUFTO0FBQUEsSUFDekI7QUFBQSxJQUVBLFdBQVdDLFNBQXNCO0FBQzdCLFdBQUssU0FBU0E7QUFDZCxXQUFLLGNBQWMsTUFBTTtBQUN6QixXQUFLLHFCQUFxQjtBQUFBLElBQzlCO0FBQUEsSUFFQSxTQUFTLE1BQWdCLGFBQTRCO0FBR2pELFdBQUssY0FBYyxLQUFLLEtBQUssUUFBUTtBQUNyQyxZQUFNLEtBQUssS0FBSztBQUNoQixVQUFJLENBQUMsTUFBTTtBQUNQLFlBQUksS0FBSyxpQkFBaUI7QUFBVztBQUdyQyxZQUFJLEtBQUssV0FBVztBQUNoQixjQUFJLEtBQUs7QUFBYyxpQkFBSyxTQUFTLFVBQVUsVUFBVTtBQUFBLFFBQzdEO0FBRUEsV0FBRyxnQkFBZ0IsR0FBRyxhQUFhLElBQUk7QUFDdkMsYUFBSyxhQUFhLEdBQUcsR0FBRyxLQUFLLE9BQU8sS0FBSyxNQUFNO0FBQy9DLGFBQUssZUFBZTtBQUNwQjtBQUFBLE1BQ0o7QUFFQSxVQUFJLEtBQUssaUJBQWlCLE1BQU07QUFDNUI7QUFBQSxNQUNKO0FBR0EsVUFBSSxLQUFLLGlCQUFpQixVQUFhLEtBQUs7QUFBVyxhQUFLLFNBQVMsVUFBVSxVQUFVO0FBRXpGLFVBQUksS0FBSztBQUFXLGFBQUssU0FBUyxZQUFZLFlBQVksZUFBZSxLQUFLLE1BQU0sa0JBQStCO0FBQ25ILFNBQUcsZ0JBQWdCLEdBQUcsYUFBYSxLQUFLLGlCQUFpQjtBQUN6RCxXQUFLLGFBQWEsR0FBRyxHQUFHLEtBQUssT0FBTyxLQUFLLE1BQU07QUFHL0MsVUFBSSxPQUFPO0FBQ1gsVUFBSSxLQUFLLHFDQUE0QztBQUNqRCxjQUFNLFFBQVEsS0FBSztBQUNuQixXQUFHLFdBQVcsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ2hELGdCQUFRLEdBQUc7QUFBQSxNQUNmO0FBQ0EsVUFBSSxLQUFLLHFDQUE0QztBQUNqRCxXQUFHLFdBQVcsS0FBSyxXQUFZO0FBQy9CLGdCQUFRLEdBQUc7QUFBQSxNQUNmO0FBQ0EsVUFBSSxTQUFTO0FBQUcsV0FBRyxNQUFNLElBQUk7QUFFN0IsV0FBSyxZQUFZLEtBQUs7QUFFdEIsV0FBSyxlQUFlO0FBQ3BCLFdBQUssY0FBYyxNQUFNO0FBQUEsSUFDN0I7QUFBQSxJQUVBLGdCQUFnQixPQUFrQjtBQUM5QixXQUFLLGFBQWEsWUFBWSxLQUFLLEtBQUs7QUFBQSxJQUM1QztBQUFBLElBRUEsTUFBTUMsU0FBMEI7QUFDNUIsVUFBSSxDQUFDQTtBQUFRLFFBQUFBLFVBQVMsS0FBSztBQUUzQixVQUFJQSxRQUFPO0FBQStCO0FBRTFDLFdBQUtBLFFBQU8sK0JBQXFDLEdBQUc7QUFDaEQsYUFBSyxHQUFHLFdBQVdBLFFBQU8sWUFBWSxHQUFHQSxRQUFPLFlBQVksR0FBR0EsUUFBTyxZQUFZLEdBQUdBLFFBQU8sWUFBWSxDQUFDO0FBQUEsTUFDN0c7QUFFQSxXQUFLLEdBQUcsV0FBV0EsUUFBTyxXQUFXO0FBRXJDLFVBQUksT0FBTztBQUNYLFdBQUtBLFFBQU8sK0JBQXFDO0FBQUcsZ0JBQVEsS0FBSyxHQUFHO0FBQ3BFLFdBQUtBLFFBQU8sK0JBQXFDO0FBQUcsZ0JBQVEsS0FBSyxHQUFHO0FBQ3BFLFdBQUtBLFFBQU8saUNBQXVDO0FBQUcsZ0JBQVEsS0FBSyxHQUFHO0FBRXRFLFdBQUssR0FBRyxNQUFNLElBQUk7QUFBQSxJQUN0QjtBQUFBLElBRUEsYUFBYUMsSUFBV0MsSUFBVyxPQUFlLFFBQXNCO0FBQ3BFLGNBQVEsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUN6QixlQUFTLEtBQUssSUFBSSxHQUFHLE1BQU07QUFDM0IsV0FBSyxjQUFjLEtBQUssS0FBSyxRQUFRO0FBQ3JDLFdBQUssU0FBUyxJQUFJRCxJQUFHQyxJQUFHLE9BQU8sTUFBTTtBQUNyQyxXQUFLLEdBQUcsU0FBU0QsSUFBR0MsSUFBRyxPQUFPLE1BQU07QUFBQSxJQUN4QztBQUFBLElBRUEsYUFBYUosV0FBMEI7QUFDbkMsVUFBSSxDQUFDQSxVQUFTLE9BQU87QUFDakIsZ0JBQVEsTUFBTSwwQkFBMEJBLFVBQVMsUUFBUSxFQUFFLEVBQUU7QUFDN0Q7QUFBQSxNQUNKO0FBRUEsK0JBQXlCO0FBRXpCLFVBQUksS0FBSyxhQUFhQSxXQUFVO0FBQzVCO0FBQUEsTUFDSjtBQUdBLFlBQU0sS0FBSyxLQUFLO0FBQ2hCLFVBQUksS0FBSztBQUFXLGFBQUssU0FBUyxZQUFZLGdCQUFnQkEsVUFBUyxNQUFNQSwyQkFBdUM7QUFDcEgsU0FBRyxXQUFXQSxVQUFTLE9BQU87QUFFOUIsWUFBTSxFQUFFLFdBQVcsYUFBYSxvQkFBb0IsY0FBYyxNQUFNLElBQUlBO0FBRTVFLFVBQUksS0FBSyxhQUFhLFVBQWEsY0FBYyxLQUFLLFNBQVMsV0FBVztBQUN0RSxZQUFJLHdDQUFpRCwyQkFBNEI7QUFDN0UsYUFBRyxRQUFRLEdBQUcsU0FBUztBQUFBLFFBQzNCLE9BQU87QUFDSCxhQUFHLE9BQU8sR0FBRyxTQUFTO0FBQ3RCLGFBQUcsU0FBUyxTQUFTO0FBQUEsUUFDekI7QUFBQSxNQUNKO0FBRUEsVUFBSSxLQUFLLGFBQWEsVUFBYSx1QkFBdUIsS0FBSyxTQUFTLG9CQUFvQjtBQUN4RixZQUFJLHNDQUErQztBQUMvQyxhQUFHLFFBQVEsR0FBRyxVQUFVO0FBQUEsUUFDNUIsT0FBTztBQUNILGFBQUcsT0FBTyxHQUFHLFVBQVU7QUFDdkIsYUFBRyxVQUFVLGtCQUFrQjtBQUFBLFFBQ25DO0FBQUEsTUFDSjtBQUVBLFVBQUksS0FBSyxhQUFhLFVBQWEsZ0JBQWdCLEtBQUssU0FBUyxhQUFhO0FBQzFFLFdBQUcsVUFBVSxXQUFXO0FBQUEsTUFDNUI7QUFFQSxVQUFJLEtBQUssYUFBYSxVQUFhLGlCQUFpQixLQUFLLFNBQVMsY0FBYztBQUM1RSxXQUFHLFVBQVUsWUFBWTtBQUFBLE1BQzdCO0FBRUEsVUFBSSxLQUFLLGFBQWEsVUFBYSxNQUFNLFlBQVksS0FBSyxTQUFTLE1BQU0sU0FBUztBQUM5RSxZQUFJLFNBQVMsTUFBTSxTQUFTO0FBQ3hCLGFBQUcsT0FBTyxHQUFHLEtBQUs7QUFBQSxRQUN0QixPQUFPO0FBQ0gsYUFBRyxRQUFRLEdBQUcsS0FBSztBQUFBLFFBQ3ZCO0FBQUEsTUFDSjtBQUVBLFVBQ0ksS0FBSyxhQUFhLFVBQ2xCLE1BQU0scUJBQXFCLEtBQUssU0FBUyxNQUFNLG9CQUMvQyxNQUFNLHFCQUFxQixLQUFLLFNBQVMsTUFBTSxvQkFDL0MsTUFBTSxxQkFBcUIsS0FBSyxTQUFTLE1BQU0sb0JBQy9DLE1BQU0scUJBQXFCLEtBQUssU0FBUyxNQUFNLG9CQUMvQyxNQUFNLGVBQWUsS0FBSyxTQUFTLE1BQU0sY0FDekMsTUFBTSxlQUFlLEtBQUssU0FBUyxNQUFNLFlBQzNDO0FBQ0UsV0FBRyxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxnQkFBZ0I7QUFDbkgsV0FBRyxzQkFBc0IsTUFBTSxZQUFZLE1BQU0sVUFBVTtBQUFBLE1BQy9EO0FBRUEsV0FBSyxXQUFXQTtBQUNoQixXQUFLLGNBQWMsTUFBTTtBQUV6QixZQUFNLGNBQWNBLFVBQVMsdUNBQW1DO0FBQ2hFLFVBQUksZUFBZUEsVUFBUyxhQUFhO0FBQ3JDLG1CQUFXQSxXQUFVQSxVQUFTLFdBQVc7QUFBQSxNQUM3QztBQUVBLGlCQUFXLFdBQVdBLFVBQVMsVUFBVTtBQUNyQyxjQUFNLE9BQU8sUUFBUTtBQUNyQixjQUFNLGdCQUFnQixRQUFRO0FBQzlCLFlBQUksa0JBQWtCO0FBQVcsa0JBQVEsT0FBTyxhQUFhO0FBQzdELGFBQUssY0FBYyxJQUFJLE1BQU0sYUFBYTtBQUFBLE1BQzlDO0FBRUEsVUFBSSxLQUFLO0FBQVcsYUFBSyxTQUFTLFVBQVUsY0FBYztBQUFBLElBQzlEO0FBQUEsSUFFUSx1QkFBdUI7QUFDM0IsVUFBSSxDQUFDLEtBQUssVUFBVSxDQUFDLEtBQUs7QUFBVTtBQUNwQyxZQUFNLGNBQWMsS0FBSyxTQUFTO0FBQ2xDLFlBQU0sZUFBZSxLQUFLLFNBQVMsdUNBQW1DO0FBQ3RFLFVBQUksQ0FBQyxlQUFlLENBQUM7QUFBYztBQUNuQyxXQUFLLE9BQU8sWUFBWSxNQUFNLGFBQWEsS0FBSyxVQUFVLGFBQWEsTUFBTSxhQUFhLEVBQUUsY0FBYyxDQUFDO0FBQzNHLFdBQUssT0FBTyxrQkFBa0IsTUFBTSxhQUFhLEtBQUssVUFBVSxhQUFhLE1BQU0sbUJBQW1CLEVBQUUsY0FBYyxDQUFDO0FBQ3ZILFVBQUksS0FBSyxTQUFTLGFBQ2xCO0FBQ0kscUJBQWEsV0FBVztBQUN4QixtQkFBVyxLQUFLLFVBQVUsS0FBSyxTQUFTLFdBQVc7QUFBQSxNQUN2RDtBQUFBLElBQ0o7QUFBQSxJQUVBLFlBQVlHLElBQVlDLElBQVksT0FBZ0IsUUFBaUIsYUFBc0I7QUFDdkYsWUFBTSxLQUFLLEtBQUs7QUFDaEIsVUFBSUQsT0FBTSxRQUFXO0FBQ2pCLFdBQUcsUUFBUSxHQUFHLFlBQVk7QUFBQSxNQUM5QixPQUFPO0FBQ0gsV0FBRyxPQUFPLEdBQUcsWUFBWTtBQUN6QixXQUFHLFFBQVFBLElBQUdDLElBQUksT0FBUSxNQUFPO0FBQUEsTUFDckM7QUFBQSxJQUNKO0FBQUEsSUFFQSxhQUFhLFVBQW9CLGFBQXNCO0FBQUEsSUFFdkQ7QUFBQSxJQXlEQSxtQkFBbUIsVUFBeUIsYUFBc0I7QUFDOUQsVUFBSSxLQUFLLGFBQWE7QUFBVztBQUNqQyxVQUFJLEtBQUs7QUFBVyxhQUFLLFNBQVMsWUFBWSxzQkFBc0IsV0FBVztBQUUvRSxZQUFNSixZQUFXLEtBQUs7QUFDdEIsWUFBTSxlQUFlQSxVQUFTO0FBQzlCLGVBQVMsSUFBSSxHQUFHLElBQUksYUFBYSxRQUFRLEVBQUUsR0FBRztBQUMxQyxjQUFNLGNBQWMsYUFBYSxDQUFDO0FBQ2xDLGNBQU0sT0FBTyxZQUFZO0FBQ3pCLFlBQUksQ0FBQyxTQUFTLGFBQWEsSUFBSTtBQUFHO0FBQ2xDLGNBQU0sVUFBVSxTQUFTLGFBQWEsSUFBSTtBQUcxQyxZQUFJLEtBQUs7QUFBVyxlQUFLLFNBQVMsWUFBWSxrQkFBa0IsR0FBRyxJQUFJLElBQUksT0FBTyxJQUFJLCtCQUE0QztBQUNsSSxZQUFJLFlBQVk7QUFBVyxzQkFBWSxPQUFPLE9BQU87QUFDckQsWUFBSSxLQUFLO0FBQVcsZUFBSyxTQUFTLFVBQVUsZ0JBQWdCO0FBQzVELGFBQUssY0FBYyxJQUFJLE1BQU0sT0FBTztBQUFBLE1BQ3hDO0FBRUEsVUFBSSxNQUFLLEtBQUs7QUFBVyxhQUFLLFNBQVMsVUFBVSxvQkFBb0I7QUFBQSxJQUN6RTtBQUFBLElBRUEsU0FBUyxNQUFlLGFBQXNCO0FBQzFDLFlBQU0sS0FBSyxLQUFLO0FBQ2hCLFVBQUksS0FBSztBQUFXLGFBQUssU0FBUyxZQUFZLFlBQVksV0FBVztBQUNyRSxTQUFHLGdCQUFnQixLQUFLLEdBQUc7QUFDM0IsVUFBSSxLQUFLO0FBQVcsYUFBSyxTQUFTLFVBQVUsVUFBVTtBQUFBLElBQzFEO0FBQUEsSUFFQSxVQUFVLE1BQWUsYUFBc0I7QUFDM0MsWUFBTSxLQUFLLEtBQUs7QUFDaEIsVUFBSSxLQUFLO0FBQVcsYUFBSyxTQUFTLFlBQVksYUFBYSxhQUFhLGtCQUErQjtBQUN2RyxTQUFHLGdCQUFnQixLQUFLLEdBQUc7QUFDM0IsZUFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFdBQVcsUUFBUSxFQUFFLEdBQUc7QUFDN0MsWUFBSSxLQUFLLFNBQVM7QUFDZCxhQUFHLGdDQUFzQyxLQUFLLGFBQWEsR0FBRyxjQUFjLENBQUM7QUFBQSxRQUNqRixPQUFPO0FBQ0gsYUFBRyw4QkFBb0MsR0FBRyxLQUFLLFlBQVk7QUFBQSxRQUMvRDtBQUFBLE1BQ0o7QUFDQSxVQUFJLEtBQUs7QUFBVyxhQUFLLFNBQVMsVUFBVSxXQUFXO0FBQUEsSUFDM0Q7QUFBQSxJQUVBLGFBQWEsTUFBZTtBQUN4QixZQUFNLEtBQUssS0FBSztBQUNoQixVQUFJLEtBQUs7QUFBVyxhQUFLLFNBQVMsWUFBWSxlQUFlO0FBQzdELFVBQUksS0FBSyxTQUFTO0FBQ2QsV0FBRyxnQ0FBc0MsS0FBSyxhQUFhLEdBQUcsY0FBYyxLQUFLLFdBQVc7QUFBQSxNQUNoRyxPQUFPO0FBQ0gsV0FBRyw4QkFBb0MsS0FBSyxhQUFhLEtBQUssV0FBVztBQUFBLE1BQzdFO0FBQUEsSUFDSjtBQUFBLElBRUEsU0FBZTtBQUNYLFdBQUssV0FBVztBQUNoQiwrQkFBeUI7QUFDekIsV0FBSyxjQUFjLE1BQU07QUFBQSxJQUM3QjtBQUFBLEVBQ0o7OztBQy9ZTyxNQUFNLG1CQUFOLE1BQXVCO0FBQUEsSUF3QjFCLFlBQW1CSyxTQUFnQjtBQUFoQixvQkFBQUE7QUF2Qm5CLHFCQUFtQjtBQUNuQixxQkFBbUI7QUFFbkIsb0NBQW9DLElBQUksVUFBVTtBQUNsRCwrQkFBK0IsSUFBSSxVQUFVO0FBRTdDLG9CQUFpQixJQUFJLE9BQU87QUFDNUIsaUNBQThCLElBQUksT0FBTztBQUV6QyxxQkFBa0I7QUFFbEI7QUFBQSxzQkFBbUIsSUFBSSxPQUFPO0FBQzlCLG1DQUFnQyxJQUFJLE9BQU87QUFFM0MsMEJBQXVCLEtBQUssS0FBSztBQUNqQyx3QkFBcUI7QUFDckIsd0JBQXFCO0FBRXJCLDZCQUEwQjtBQUMxQiw2QkFBMEIsS0FBSztBQUUvQixxQkFBVTtBQUdOLFdBQUssV0FBV0EsUUFBTyxRQUFRO0FBQy9CLE1BQUFBLFFBQU8sUUFBUSxLQUFLLE1BQU07QUFBQSxJQUM5QjtBQUFBLElBRUEsV0FBVyxVQUF3QjtBQUMvQixXQUFLLFNBQVMsS0FBSyxRQUFRO0FBQzNCLFdBQUssa0JBQWtCLFlBQVksS0FBSyxRQUFRO0FBQ2hELFdBQUssdUJBQXVCLEtBQUssS0FBSyxpQkFBaUI7QUFDdkQsV0FBSyxvQkFBb0IsS0FBSyxLQUFLLE1BQU07QUFDekMsV0FBSyxVQUFVO0FBQUEsSUFDbkI7QUFBQSxJQUVBLFdBQVcsVUFBd0I7QUFDL0IsV0FBSyxPQUFPLEtBQUssUUFBUTtBQUFBLElBQzdCO0FBQUEsSUFFQSxrQkFBa0IsT0FBcUI7QUFDbkMsV0FBSyxrQkFBa0IsT0FBTyxRQUFRLEtBQUs7QUFDM0MsVUFBSSxVQUFVO0FBQUcsYUFBSyxVQUFVO0FBQUEsSUFDcEM7QUFBQSxJQUVBLGdCQUFnQixPQUFxQjtBQUNqQyxXQUFLLGtCQUFrQixRQUFRLE1BQU0sS0FBSyxrQkFBa0IsUUFBUSxRQUFRLEtBQUssY0FBYyxLQUFLLGlCQUFpQixLQUFLLGVBQWU7QUFDekksVUFBSSxVQUFVO0FBQUcsYUFBSyxVQUFVO0FBQUEsSUFDcEM7QUFBQSxJQUVBLEtBQUssT0FBcUI7QUFDdEIsVUFBSSxDQUFDLEtBQUs7QUFBUztBQUNuQixZQUFNLFNBQVMsU0FBUyxNQUFNO0FBQzlCLGFBQU8sSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsRUFBRSxJQUFJLEtBQUssa0JBQWtCLFNBQVMsS0FBSyxVQUFVO0FBQ25GLFdBQUssT0FBTyxJQUFJLE9BQU8saUJBQWlCLEtBQUssT0FBTyxRQUFRLENBQUM7QUFDN0QsVUFBSSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU07QUFBRyxhQUFLLFVBQVU7QUFDbkQsa0JBQVksTUFBTTtBQUFBLElBQ3RCO0FBQUEsSUFFQSxLQUFLLE9BQXFCO0FBQ3RCLFdBQUssa0JBQWtCLFVBQVUsUUFBUSxLQUFLO0FBQzlDLFVBQUksVUFBVTtBQUFHLGFBQUssVUFBVTtBQUFBLElBQ3BDO0FBQUEsSUFFQSxTQUFrQjtBQUNkLFVBQUksQ0FBQyxLQUFLO0FBQVMsZUFBTztBQUUxQixXQUFLLHVCQUF1QixLQUFLLEtBQUssbUJBQW1CLEtBQUssT0FBTztBQUNyRSxXQUFLLHNCQUFzQixlQUFlLEtBQUssc0JBQXNCO0FBRXJFLFdBQUssb0JBQW9CLEtBQUssS0FBSyxRQUFRLEtBQUssT0FBTztBQUV2RCxXQUFLLHNCQUFzQixJQUFJLEtBQUssbUJBQW1CO0FBQ3ZELFdBQUssU0FBUyxLQUFLLEtBQUsscUJBQXFCO0FBRTdDLFdBQUssT0FBTyxTQUFTLEtBQUssS0FBSyxRQUFRO0FBQ3ZDLFdBQUssT0FBTyxRQUFRLEtBQUssbUJBQW1CO0FBRTVDLFVBQUksVUFBVSxLQUFLO0FBQ25CLFdBQUssVUFBVTtBQUNmLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjs7O0FDNURPLFdBQVMsd0JBQXdCLE1BQWtCLEtBQWtCO0FBQ3hFLFVBQU0sT0FBTyxJQUFJLEtBQUs7QUFDdEIsVUFBTUMsS0FBSSxTQUFTLE1BQU07QUFDekIsUUFBSSxLQUFLLFVBQVU7QUFDZixZQUFNLFNBQVMsS0FBSztBQUNwQixZQUFNLE1BQU0sT0FBTztBQUNuQixlQUFTLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHO0FBQzdCLFFBQUFBLEdBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUM7QUFDN0MsWUFBSSxhQUFhQSxFQUFDO0FBQUEsTUFDdEI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFFQSxNQUFNLFlBQVksSUFBSSxPQUFPOzs7QUNYdEIsV0FBUywyQkFBMkIsTUFBb0M7QUFDM0UsWUFBUSxNQUFNO0FBQUEsTUFDVixLQUFLO0FBQStCLGVBQU87QUFBQSxNQUMzQyxLQUFLO0FBQXlCLGVBQU87QUFBQSxNQUNyQyxLQUFLO0FBQTZCLGVBQU87QUFBQSxNQUN6QyxLQUFLO0FBQThCLGVBQU87QUFBQSxNQUMxQyxLQUFLO0FBQTRCLGVBQU87QUFBQSxNQUN4QyxLQUFLO0FBQTZCLGVBQU87QUFBQSxNQUN6QyxLQUFLO0FBQTRCLGVBQU87QUFBQSxNQUN4QyxLQUFLO0FBQTBCLGVBQU87QUFBQSxNQUN0QyxLQUFLO0FBQTBCLGVBQU87QUFBQSxNQUN0QyxLQUFLO0FBQTBCLGVBQU87QUFBQSxNQUN0QyxLQUFLO0FBQTBCLGVBQU87QUFBQSxNQUN0QyxLQUFLO0FBQTBCLGVBQU87QUFBQSxJQUMxQztBQUFBLEVBQ0o7QUFFQSxNQUFNLGFBQWEsb0JBQUksUUFBdUI7QUFFdkMsV0FBUyxnQkFBZ0IsTUFBWTtBQUN4QyxVQUFNLFNBQVMsV0FBVyxJQUFJLElBQUk7QUFDbEMsUUFBSTtBQUFRLGFBQU87QUFFbkIsVUFBTUMsV0FBVSxlQUFlLEVBQUU7QUFDakMsVUFBTSxLQUFLQSxTQUFRO0FBRW5CLFVBQU0sTUFBTSxHQUFHLGtCQUFrQjtBQUNqQyxPQUFHLGdCQUFnQixHQUFHO0FBQ3RCLFVBQU0sRUFBRSxhQUFhLFdBQVcsSUFBSTtBQUVwQyxhQUFTLGNBQWMsTUFBa0IsTUFBYyxNQUFjO0FBQ2pFLFlBQU0sT0FBTyxtQkFBbUIsSUFBSTtBQUNwQyxZQUFNLFNBQVMsR0FBRyxhQUFhO0FBQy9CLFNBQUcsV0FBVyxHQUFHLGNBQWMsTUFBTTtBQUNyQyxTQUFHLFdBQVcsR0FBRyxjQUFjLE1BQU0sR0FBRyxXQUFXO0FBQ25ELFVBQUksU0FBUyxhQUFhLFNBQVMsZUFBZTtBQUM5QyxXQUFHLG9CQUFvQixNQUFNLE1BQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQ3hELE9BQU87QUFDSCxXQUFHLHFCQUFxQixNQUFNLE1BQU0sTUFBTSxHQUFHLENBQUM7QUFBQSxNQUNsRDtBQUNBLFNBQUcsd0JBQXdCLElBQUk7QUFBQSxJQUNuQztBQUVBLFVBQU0sTUFBTSx3QkFBd0IsV0FBVztBQUUvQyxRQUFJLFlBQVk7QUFBVSxvQkFBYyxZQUFZLFVBQVUsMkJBQTJCLHlCQUE2QixHQUFHLENBQUM7QUFDMUgsUUFBSSxZQUFZO0FBQUksb0JBQWMsWUFBWSxJQUFJLDJCQUEyQixhQUF1QixHQUFHLENBQUM7QUFDeEcsUUFBSSxZQUFZO0FBQVEsb0JBQWMsWUFBWSxRQUFRLDJCQUEyQixxQkFBMkIsR0FBRyxDQUFDO0FBQ3BILFFBQUksWUFBWTtBQUFTLG9CQUFjLFlBQVksU0FBUywyQkFBMkIsdUJBQTRCLEdBQUcsQ0FBQztBQUN2SCxRQUFJLFlBQVk7QUFBTyxvQkFBYyxZQUFZLE9BQU8sMkJBQTJCLG1CQUEwQixHQUFHLENBQUM7QUFDakgsUUFBSSxZQUFZO0FBQVEsb0JBQWMsWUFBWSxRQUFRLDJCQUEyQixxQkFBMkIsR0FBRyxDQUFDO0FBQ3BILFFBQUksWUFBWTtBQUFPLG9CQUFjLFlBQVksT0FBTywyQkFBMkIsbUJBQTBCLEdBQUcsQ0FBQztBQUNqSCxRQUFJLFlBQVk7QUFBSyxvQkFBYyxZQUFZLEtBQUssMkJBQTJCLGVBQXdCLEdBQUcsQ0FBQztBQUMzRyxRQUFJLFlBQVk7QUFBSyxvQkFBYyxZQUFZLEtBQUssMkJBQTJCLGVBQXdCLEdBQUcsQ0FBQztBQUMzRyxRQUFJLFlBQVk7QUFBSyxvQkFBYyxZQUFZLEtBQUssMkJBQTJCLGVBQXdCLEdBQUcsQ0FBQztBQUMzRyxRQUFJLFlBQVk7QUFBSyxvQkFBYyxZQUFZLEtBQUssMkJBQTJCLGVBQXdCLEdBQUcsQ0FBQztBQUMzRyxRQUFJLFlBQVk7QUFBSyxvQkFBYyxZQUFZLEtBQUssMkJBQTJCLGVBQXdCLEdBQUcsQ0FBQztBQUUzRyxRQUFJLFVBQVU7QUFDZCxRQUFJLFlBQVksT0FBTztBQUNuQixZQUFNLFNBQVMsR0FBRyxhQUFhO0FBQy9CLFNBQUcsV0FBVyxHQUFHLHNCQUFzQixNQUFNO0FBQzdDLFNBQUcsV0FBVyxHQUFHLHNCQUFzQixZQUFZLE9BQU8sR0FBRyxXQUFXO0FBQ3hFLGdCQUFVO0FBQUEsSUFDZDtBQUVBLFVBQU0sZUFBZSxZQUFZLFdBQVcsWUFBWSxTQUFTLFNBQVMsSUFBSTtBQUM5RSxVQUFNLGNBQWMsWUFBWSxRQUFRLFlBQVksTUFBTSxTQUFTO0FBRW5FLE9BQUcsZ0JBQWdCLElBQUk7QUFDdkIsVUFBTSxXQUFXLEVBQUUsS0FBSyxZQUFZLFNBQVMsS0FBSyxjQUFjLFlBQVk7QUFDNUUsZUFBVyxJQUFJLE1BQU0sUUFBUTtBQUM3QixXQUFPO0FBQUEsRUFDWDs7O0FDbEVPLFdBQVMsd0JBQThDLFdBQXNCLGtDQUFzRTtBQUN0SixRQUFJLFVBQVUsZUFBZSxVQUFhLFVBQVUsV0FBVyxTQUFTLEdBQUc7QUFDdkUsYUFBTztBQUFBLElBQ1g7QUFFQSxhQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsV0FBVyxRQUFRLEVBQUUsR0FBRztBQUNsRCxZQUFNLE9BQU8sVUFBVSxXQUFXLENBQUM7QUFDbkMsVUFBSSxLQUFLLFNBQVMsTUFBTTtBQUNwQixlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUVPLFdBQVMsY0FBb0MsV0FBc0IsV0FBK0I7QUFDckcsUUFBSSxjQUFjLFFBQVc7QUFDekI7QUFBQSxJQUNKO0FBQ0EsVUFBTSxNQUFNLHdCQUF3QixXQUFXLFVBQVUsSUFBSTtBQUM3RCxRQUFJLFFBQVEsTUFBTTtBQUNkLGdCQUFVLFdBQVcsS0FBSyxTQUFTO0FBQUEsSUFDdkMsT0FBTztBQUNILFVBQUssT0FBTyxVQUFVO0FBQ3RCLFVBQUssU0FBUyxVQUFVO0FBQ3hCLFVBQUssU0FBUyxVQUFVO0FBQUEsSUFDNUI7QUFBQSxFQUNKO0FBRUEsTUFBTSxjQUFjLElBQUksT0FBTztBQUMvQixNQUFNLGNBQWMsSUFBSSxLQUFLOzs7QUNqRTdCLE1BQUksS0FBYSxJQUFJLE9BQU87QUFDNUIsTUFBSUMsTUFBYSxJQUFJLE9BQU87QUFFNUIsTUFBSSxJQUFZLElBQUksT0FBTztBQUUzQixNQUFJLEtBQWEsSUFBSSxPQUFPO0FBQzVCLE1BQUksS0FBYSxJQUFJLE9BQU87QUFDNUIsTUFBSSxLQUFhLElBQUksT0FBTztBQUU1QixNQUFJLEtBQWEsSUFBSSxPQUFPO0FBQzVCLE1BQUksS0FBYSxJQUFJLE9BQU87QUFDNUIsTUFBSSxLQUFhLElBQUksT0FBTztBQUU1QixNQUFJLEtBQWEsSUFBSSxPQUFPO0FBQzVCLE1BQUksS0FBYSxJQUFJLE9BQU87QUFDNUIsTUFBSSxLQUFhLElBQUksT0FBTztBQUU1QixNQUFJLEtBQWEsSUFBSSxPQUFPO0FBQzVCLE1BQUksS0FBYSxJQUFJLE9BQU87QUFDNUIsTUFBSSxLQUFhLElBQUksT0FBTztBQUU1QixNQUFJLE1BQWMsSUFBSUMsUUFBTztBQUM3QixNQUFJLE1BQWMsSUFBSUEsUUFBTztBQUM3QixNQUFJLE1BQWMsSUFBSUEsUUFBTztBQUU3QixNQUFJLFNBQWlCLElBQUksT0FBTztBQUNoQyxNQUFJLFlBQW9CLElBQUksT0FBTztBQUVuQyxNQUFJLE1BQWMsSUFBSSxPQUFPO0FBRzdCLE1BQUksSUFBWSxJQUFJLE9BQU87QUFDM0IsTUFBSSxJQUFZLElBQUksT0FBTztBQUMzQixNQUFJLElBQVksSUFBSSxPQUFPO0FBQzNCLE1BQUksT0FBZSxJQUFJLE9BQU87QUFDOUIsTUFBSSxPQUFlLElBQUksT0FBTztBQUM5QixNQUFJLE9BQWUsSUFBSSxPQUFPO0FBS3ZCLE1BQU0sbUJBQU4sTUFBdUI7QUFBQSxJQUsxQixPQUFlLFFBQVEsV0FBNEI7QUFDL0MsWUFBTSxLQUFLLHdCQUF3QixXQUFXLFVBQVUsRUFBRztBQUMzRCxZQUFNLEtBQUssd0JBQXdCLFdBQVcsUUFBUSxFQUFHO0FBQ3pELFlBQU0sS0FBSyx3QkFBd0IsV0FBVyxJQUFJLEVBQUc7QUFDckQsWUFBTSxRQUFRLFVBQVU7QUFFeEIsVUFBSTtBQUNKLFVBQUksT0FBTztBQUNQLGNBQU0sTUFBTTtBQUNaLGNBQU0sUUFBUTtBQUNkLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHO0FBQzdCLGdCQUFNLEtBQUssTUFBTSxDQUFDO0FBQ2xCLGdCQUFNLEtBQUssTUFBTSxJQUFJLENBQUM7QUFDdEIsZ0JBQU0sS0FBSyxNQUFNLElBQUksQ0FBQztBQUN0QixlQUFLLFFBQVEsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFBQSxRQUN2QztBQUFBLE1BQ0osT0FBTztBQUNILGNBQU0sR0FBRyxTQUFTO0FBQ2xCLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHO0FBQzdCLGVBQUssUUFBUSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7QUFBQSxRQUM1QztBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFFQSxPQUFlLFFBQVEsSUFBa0IsSUFBa0IsSUFBa0IsSUFBWSxJQUFZLElBQWtCO0FBQ25ILFVBQUksT0FBTyxRQUFXO0FBQ2xCLGFBQUssSUFBSSxPQUFPO0FBQ2hCLFFBQUFELE1BQUssSUFBSSxPQUFPO0FBRWhCLFlBQUksSUFBSSxPQUFPO0FBRWYsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFFaEIsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFFaEIsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFDaEIsYUFBSyxJQUFJLE9BQU87QUFFaEIsY0FBTSxJQUFJQyxRQUFPO0FBQ2pCLGNBQU0sSUFBSUEsUUFBTztBQUNqQixjQUFNLElBQUlBLFFBQU87QUFFakIsaUJBQVMsSUFBSSxPQUFPO0FBQ3BCLG9CQUFZLElBQUksT0FBTztBQUV2QixjQUFNLElBQUksT0FBTztBQUFBLE1BQ3JCO0FBRUEsU0FBRyxLQUFLLElBQUksS0FBSyxDQUFDO0FBQ2xCLFNBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQztBQUNsQixTQUFHLEtBQUssSUFBSSxLQUFLLENBQUM7QUFFbEIsU0FBRyxLQUFLLElBQUksS0FBSyxDQUFDO0FBQ2xCLFNBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQztBQUNsQixTQUFHLEtBQUssSUFBSSxLQUFLLENBQUM7QUFFbEIsVUFBSSxLQUFLLElBQUksS0FBSyxDQUFDO0FBQ25CLFVBQUksS0FBSyxJQUFJLEtBQUssQ0FBQztBQUNuQixVQUFJLEtBQUssSUFBSSxLQUFLLENBQUM7QUFFbkIsVUFBSTtBQUNKLFVBQUk7QUFFSixTQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDZCxTQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDZCxTQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDZCxTQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDZCxTQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDZCxTQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFFZCxZQUFNLEtBQUssSUFBSSxJQUFJLElBQUk7QUFDdkIsWUFBTSxLQUFLLElBQUksSUFBSSxJQUFJO0FBQ3ZCLFlBQU0sS0FBSyxJQUFJLElBQUksSUFBSTtBQUN2QixZQUFNLEtBQUssSUFBSSxJQUFJLElBQUk7QUFFdkIsU0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUcsSUFBSSxFQUFFO0FBQzFCLE1BQUFELElBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtBQUMxQixhQUFPLE1BQU0sSUFBSUEsS0FBSSxDQUFDO0FBQ3RCLFVBQUksRUFBRSxNQUFNLEdBQUs7QUFDYixVQUFFLFVBQVU7QUFDWixhQUFLLENBQUMsRUFBRSxJQUFJLEVBQUU7QUFDZCxhQUFLLENBQUMsRUFBRSxJQUFJLEVBQUU7QUFDZCxXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFBQSxNQUNaO0FBRUEsU0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUcsSUFBSSxFQUFFO0FBQzFCLE1BQUFBLElBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtBQUMxQixhQUFPLE1BQU0sSUFBSUEsS0FBSSxDQUFDO0FBQ3RCLFVBQUksRUFBRSxNQUFNLEdBQUs7QUFDYixVQUFFLFVBQVU7QUFDWixhQUFLLENBQUMsRUFBRSxJQUFJLEVBQUU7QUFDZCxhQUFLLENBQUMsRUFBRSxJQUFJLEVBQUU7QUFDZCxXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFBQSxNQUNaO0FBRUEsU0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUcsSUFBSSxFQUFFO0FBQzFCLE1BQUFBLElBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtBQUMxQixhQUFPLE1BQU0sSUFBSUEsS0FBSSxDQUFDO0FBQ3RCLFVBQUksRUFBRSxNQUFNLEdBQUs7QUFDYixVQUFFLFVBQVU7QUFDWixhQUFLLENBQUMsRUFBRSxJQUFJLEVBQUU7QUFDZCxhQUFLLENBQUMsRUFBRSxJQUFJLEVBQUU7QUFDZCxXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFDUixXQUFHLEtBQUs7QUFBQSxNQUNaO0FBRUEsWUFBTSxJQUFJLEtBQUs7QUFDZixZQUFNLElBQUksS0FBSztBQUNmLFlBQU0sSUFBSSxLQUFLO0FBRWYsYUFBTyxNQUFNLElBQUksSUFBSSxNQUFNO0FBQzNCLGFBQU8sTUFBTSxRQUFRLElBQUksU0FBUztBQUNsQyxVQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsRUFDYixJQUFJLFNBQVMsRUFDYixNQUFNLEdBQUcsS0FBSyxDQUFDO0FBRXBCLGFBQU8sTUFBTSxJQUFJLElBQUksTUFBTTtBQUMzQixhQUFPLE1BQU0sSUFBSSxRQUFRLFNBQVM7QUFDbEMsVUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEVBQ2IsSUFBSSxTQUFTLEVBQ2IsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUVwQixhQUFPLE1BQU0sSUFBSSxJQUFJLE1BQU07QUFDM0IsYUFBTyxNQUFNLFFBQVEsSUFBSSxTQUFTO0FBQ2xDLFVBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxFQUNiLElBQUksU0FBUyxFQUNiLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFFcEIsYUFBTyxNQUFNLElBQUksSUFBSSxNQUFNO0FBQzNCLGFBQU8sTUFBTSxJQUFJLFFBQVEsU0FBUztBQUNsQyxVQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsRUFDYixJQUFJLFNBQVMsRUFDYixNQUFNLEdBQUcsS0FBSyxDQUFDO0FBRXBCLGFBQU8sTUFBTSxJQUFJLElBQUksTUFBTTtBQUMzQixhQUFPLE1BQU0sUUFBUSxJQUFJLFNBQVM7QUFDbEMsVUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEVBQ2IsSUFBSSxTQUFTLEVBQ2IsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUVwQixhQUFPLE1BQU0sSUFBSSxJQUFJLE1BQU07QUFDM0IsYUFBTyxNQUFNLElBQUksUUFBUSxTQUFTO0FBQ2xDLFVBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxFQUNiLElBQUksU0FBUyxFQUNiLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFFcEIsVUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEVBQ2IsSUFBSSxFQUFFLEVBQ04sTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixVQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsRUFDYixJQUFJLEVBQUUsRUFDTixNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFVBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxFQUNiLElBQUksRUFBRSxFQUNOLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFBQSxJQUN4QjtBQUFBLElBRUEsT0FBTyxTQUFTLFdBQTRCO0FBQ3hDLFVBQUksTUFBTSxRQUFXO0FBQ2pCLFlBQUksSUFBSSxPQUFPO0FBQ2YsWUFBSSxJQUFJLE9BQU87QUFDZixZQUFJLElBQUksT0FBTztBQUNmLGVBQU8sSUFBSSxPQUFPO0FBQ2xCLGVBQU8sSUFBSSxPQUFPO0FBQ2xCLGVBQU8sSUFBSSxPQUFPO0FBQUEsTUFDdEI7QUFDQSxZQUFNLFdBQVcsd0JBQXdCLFdBQVcsVUFBVSxFQUFHO0FBQ2pFLFlBQU0sT0FBTyxTQUFTO0FBRXRCLFdBQUssSUFBSSxJQUFJLGFBQWEsSUFBSTtBQUM5QixXQUFLLElBQUksSUFBSSxhQUFhLElBQUk7QUFDOUIsV0FBSyxJQUFJLElBQUksYUFBYSxJQUFJO0FBRTlCLFdBQUssUUFBUSxTQUFTO0FBRXRCLFlBQU0sWUFBWSxPQUFPO0FBQ3pCLFlBQU0sV0FBVyxJQUFJLGFBQWEsWUFBWSxDQUFDO0FBQy9DLGVBQVMsSUFBSSxHQUFHLElBQUksV0FBVyxFQUFFLEdBQUc7QUFDaEMsVUFBRSxLQUFLLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDcEIsVUFBRSxLQUFLLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDcEIsVUFBRSxLQUFLLEtBQUssR0FBRyxJQUFJLENBQUM7QUFFcEIsVUFBRSxVQUFVLEVBQUUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBRWpDLGNBQU0sS0FBSyxPQUFPLElBQUksR0FBRyxDQUFDO0FBQzFCLGFBQUssS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFO0FBQ25CLGFBQUssS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJO0FBQ3JCLGFBQUssS0FBSyxJQUFJLEVBQUUsVUFBVTtBQUUxQixlQUFPLE1BQU0sR0FBRyxHQUFHLElBQUk7QUFDdkIsWUFBSSxPQUFPLE9BQU8sSUFBSSxNQUFNLENBQUM7QUFDN0IsZUFBTyxPQUFPLElBQUksS0FBSztBQUV2QixjQUFNLEtBQUssSUFBSTtBQUNmLGlCQUFTLEVBQUUsSUFBSSxLQUFLO0FBQ3BCLGlCQUFTLEtBQUssQ0FBQyxJQUFJLEtBQUs7QUFDeEIsaUJBQVMsS0FBSyxDQUFDLElBQUksS0FBSztBQUN4QixpQkFBUyxLQUFLLENBQUMsSUFBSTtBQUFBLE1BQ3ZCO0FBRUEsb0JBQWMsV0FBVztBQUFBLFFBQ3JCLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLE1BQU07QUFBQSxNQUNWLENBQUM7QUFDRCxvQkFBYyxXQUFXLEVBQUUsUUFBUSxLQUFLLEdBQUcsUUFBUSxHQUFHLE1BQU0sU0FBUyxDQUFDO0FBRXRFLFdBQUssSUFBSTtBQUNULFdBQUssSUFBSTtBQUNULFdBQUssSUFBSTtBQUFBLElBQ2I7QUFBQSxFQUNKO0FBRUEsTUFBTSxtQkFBbUIsSUFBSSxpQkFBaUI7OztBQzNSdkMsTUFBTSxnQkFBbUMsb0JBQUksSUFBa0I7OztBQ0UvRCxXQUFTLGtCQUF3QjtBQUNwQyxRQUFJLGNBQWMsY0FBYyxJQUFJLEtBQUs7QUFDekMsUUFBSTtBQUFhLGFBQU87QUFDeEIsVUFBTSxXQUFXLElBQUksYUFBYTtBQUFBLE1BQzlCO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUk7QUFBQSxNQUFJO0FBQUEsTUFBSTtBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFJO0FBQUEsTUFBSTtBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUk7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFJO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFJO0FBQUEsTUFBSTtBQUFBLE1BQUk7QUFBQSxNQUFJO0FBQUEsTUFDaE07QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsSUFDeEQsQ0FBQztBQUNELFVBQU1FLFVBQVMsSUFBSSxhQUFhO0FBQUEsTUFDNUI7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFDak07QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxJQUNoQyxDQUFDO0FBQ0QsVUFBTSxLQUFLLElBQUksYUFBYTtBQUFBLE1BQ3hCO0FBQUEsTUFBTztBQUFBLE1BQUs7QUFBQSxNQUFPO0FBQUEsTUFBTTtBQUFBLE1BQU87QUFBQSxNQUFLO0FBQUEsTUFBTztBQUFBLE1BQU07QUFBQSxNQUFPO0FBQUEsTUFBRztBQUFBLE1BQU87QUFBQSxNQUFNO0FBQUEsTUFBTztBQUFBLE1BQUc7QUFBQSxNQUFPO0FBQUEsTUFBTTtBQUFBLE1BQU87QUFBQSxNQUFHO0FBQUEsTUFBTztBQUFBLE1BQUs7QUFBQSxNQUFPO0FBQUEsTUFB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QUFVLGdCQUFnQixJQUFJLENBQUM7QUFDdkMsWUFBUSxPQUFPO0FBQUEsRUFDbkI7QUFFQSxXQUFTLEdBQUcsWUFBWSxPQUFPLEtBQUs7QUFFcEMsU0FBTyxNQUFNOyIsCiAgIm5hbWVzIjogWyJiIiwgInQiLCAiRmxvYXQyIiwgIngiLCAieSIsICJuIiwgImIiLCAiZHN0IiwgInoiLCAiRmxvYXQ0IiwgImIiLCAiQ29sb3JSR0JBIiwgIkZsb2F0NCIsICJiIiwgImRzdCIsICJNYXQ0IiwgImRzdCIsICJ4IiwgInkiLCAieiIsICJ4MiIsICJ5MiIsICJ6MiIsICJiIiwgIk1hdDQiLCAidiIsICJ4IiwgInkiLCAibiIsICJ0IiwgImIiLCAieCIsICJ5IiwgInoiLCAiZHN0IiwgInQiLCAiYiIsICJ2IiwgImRzdCIsICJNYXQ0IiwgIk1hdDQiLCAiY2FtZXJhIiwgInYiLCAiRmxvYXQyIiwgIlJlbmRlckNvbW1hbmRUeXBlIiwgIngiLCAieSIsICJjYW1lcmEiLCAiYWN0aW9uIiwgInBpcGVsaW5lIiwgIkNvbG9yUkdCQSIsICJkZWZhdWx0X3ZhbHVlIiwgImRldmljZSIsICJlbmNvZGVyIiwgInBpcGVsaW5lIiwgIm4iLCAicGlwZWxpbmUiLCAiZW5jb2RlciIsICJkZWZhdWx0X3ZhbHVlIiwgIkNvbG9yUkdCQSIsICJwaXBlbGluZSIsICJjYW1lcmEiLCAiYWN0aW9uIiwgIngiLCAieSIsICJjYW1lcmEiLCAidiIsICJlbmNvZGVyIiwgInYyIiwgIkZsb2F0MiIsICJub3JtYWwiLCAiTWF0NCIsICJDb2xvclJHQkEiXQp9Cg==
