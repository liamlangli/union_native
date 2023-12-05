"use strict";
(() => {
  // node_modules/@union_native/core/src/adt/flex_buffer_view.ts
  var FlexBufferView = class _FlexBufferView {
    constructor(buffer, offset = 0, byte_length = buffer.byteLength) {
      this.buffer = buffer;
      this.f32_view = new Float32Array(buffer, offset, byte_length / 4);
      this.u32_view = new Uint32Array(buffer, offset, byte_length / 4);
      this.u8_view = new Uint8Array(buffer, offset, byte_length);
    }
    f32_view;
    u32_view;
    u8_view;
    sub_view(range) {
      return new _FlexBufferView(this.buffer, range.byte_offset, range.byte_length);
    }
  };

  // node_modules/@union_native/core/src/adt/ordered_map.ts
  var OrderedMap = class {
    map = /* @__PURE__ */ new Map();
    list = [];
    constructor(source) {
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

  // node_modules/@union_native/core/src/adt/pool.ts
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

  // node_modules/@union_native/core/src/adt/ptree.ts
  var PolyNode = class {
    children = [];
    parent;
    get is_root() {
      return this.parent === void 0;
    }
    can_add;
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

  // node_modules/@union_native/core/src/memory/footprint.ts
  var global_foot_print = 0;
  function footprint_alloc(size) {
    global_foot_print += size;
  }

  // node_modules/@union_native/core/src/math/math.ts
  var DegreeToRadian = Math.PI / 180;
  var RadianToDegree = 180 / Math.PI;
  function clamp(i, b2, t2) {
    return Math.max(Math.min(i, t2), b2);
  }
  function lerp(a, b2, i) {
    return a + (b2 - a) * i;
  }

  // node_modules/@union_native/core/src/math/simd.ts
  var Float22 = class _Float2 {
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
    size = 2;
    elements = new Float32Array(2);
    constructor(x2 = 0, y2 = 0) {
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
  var _center = new Float22();
  var Float3 = class _Float3 {
    size = 3;
    elements = new Float32Array(3);
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
  var ZERO = new Float3(0, 0, 0);
  var ONE = new Float3(1, 1, 1);
  var X = new Float3(1, 0, 0);
  var Y = new Float3(0, 1, 0);
  var Z = new Float3(0, 0, 1);
  var NEGATIVE_X = new Float3(-1, 0, 0);
  var NEGATIVE_Y = new Float3(0, -1, 0);
  var NEGATIVE_Z = new Float3(0, 0, -1);
  var Float42 = class _Float4 {
    size = 4;
    elements = new Float32Array(4);
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

  // node_modules/@union_native/core/src/math/box.ts
  var points = [new Float3(), new Float3(), new Float3(), new Float3(), new Float3(), new Float3(), new Float3(), new Float3()];
  var Box3 = class _Box3 {
    constructor(min, max) {
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
    min = new Float3();
    max = new Float3();
    _size = new Float3();
    _center = new Float3();
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

  // node_modules/@union_native/core/src/math/color.ts
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

  // node_modules/@union_native/core/src/math/simd_mat.ts
  var x = new Float3();
  var y = new Float3();
  var z = new Float3();
  var v = new Float3();
  var default_up = new Float3(0, 1, 0);
  var Mat42 = class _Mat4 {
    size = 16;
    elements = new Float32Array(16);
    constructor() {
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

  // node_modules/@union_native/core/src/math/ray.ts
  var v2 = new Float3();
  var normal = new Float3();
  var edge1 = new Float3();
  var edge2 = new Float3();
  var diff = new Float3();

  // node_modules/@union_native/core/src/math/rect.ts
  var Rect = class {
    size = 4;
    elements = new Float32Array(4);
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
  var RECT_ZERO = new Rect(0, 0, 0, 0);

  // node_modules/@union_native/core/src/math/simd_quaternion.ts
  var Quaternion = class _Quaternion {
    is_quaternion = true;
    size = 4;
    elements = new Float32Array(4);
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

  // node_modules/@union_native/core/src/memory/heap.ts
  var Heap = class {
    buffer;
    tail;
    released = [];
    // mega bytes
    heap_size = 4096;
    life_cycle = 1024;
    life_index = 0;
    constructor() {
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
    manage = () => {
      this.life_index = this.life_index++ % this.life_cycle;
    };
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

  // node_modules/@union_native/core/src/math/spherical.ts
  var Spherical = class _Spherical {
    radius;
    theta;
    phi;
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

  // node_modules/@union_native/core/src/engine/camera.ts
  var rotate_matrix = new Mat42();
  var Camera = class {
    _mode = 0 /* Perspective */;
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
    location = new Float3();
    rotation = new Quaternion();
    scale = new Float3(1, 1, 1);
    world_matrix = new Mat42();
    local_matrix = new Mat42();
    view_matrix = new Mat42();
    projection_matrix = new Mat42();
    view_projection_matrix = new Mat42();
    inverse_projection_matrix = new Mat42();
    up = new Float3(0, 1, 0);
    vertical_fov = 45;
    aspect = 1;
    vertical_size = 100;
    horizontal_size = 100;
    near = 1;
    far = 1e4;
    constructor() {
      this.perspective(this.vertical_fov, this.aspect, this.near, this.far);
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

  // node_modules/@union_native/core/src/engine/event.ts
  var TypedEvent = class {
    constructor(key) {
      this.key = key;
    }
    payload;
  };
  var EventNode = class {
    listener_map = /* @__PURE__ */ new Map();
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
    node = new EventNode();
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

  // node_modules/@union_native/core/src/engine/global_event.ts
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

  // node_modules/@union_native/core/src/input/browser_input.ts
  var BrowserInput = class {
    start = new Float22();
    drag_start = new Float22();
    end = new Float22();
    delta = new Float22();
    mouse_button = -1;
    element;
    constructor() {
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
    onmousedown = (event) => {
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
    onmousedrag = (event) => {
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
    onmousemove = (event) => {
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
    onmouseup = (event) => {
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
    onmousewheel = (event) => {
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
    onmousescroll = (event) => {
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
    onkeydown = (event) => {
      event.preventDefault();
      EventHub.fire(GlobalEvent.KeyDown, { keycode: event.keyCode, event });
    };
    onkeyup = (event) => {
      event.preventDefault();
      EventHub.fire(GlobalEvent.KeyUp, { keycode: event.keyCode, event });
    };
    ontouchstart = (event) => {
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
    ontouchmove = (event) => {
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
    ontouchend = (event) => {
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
  };

  // node_modules/@union_native/core/src/input/input.ts
  var Input = class {
    axis_map = {};
    key_map = /* @__PURE__ */ new Set();
    set_axis(axis, value) {
      this.axis_map[axis] = value;
    }
    get_axis(axis) {
      return this.axis_map[axis] || 0;
    }
    constructor() {
      EventHub.on(GlobalEvent.KeyDown, this.onkeydown);
      EventHub.on(GlobalEvent.KeyUp, this.onkeyup);
    }
    onkeydown = (payload) => {
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
    onkeyup = (payload) => {
      const keycode = payload.keycode;
      if (keycode === 38 /* Up */ || keycode === 40 /* Down */) {
        this.set_axis(1 /* Vertical */, 0);
      } else if (keycode === 37 /* Left */ || keycode === 39 /* Right */) {
        this.set_axis(0 /* Horizontal */, 0);
      }
      this.key_map.delete(keycode);
    };
    get_button(button) {
      return this.key_map.has(button);
    }
  };

  // node_modules/@union_native/core/src/engine/engine.ts
  var EngineEvent = {
    BeforeTick: new TypedEvent("before tick"),
    AfterTick: new TypedEvent("after tick"),
    BeforeFrame: new TypedEvent("before frame"),
    AfterFrame: new TypedEvent("after frame"),
    Frame: new TypedEvent("frame")
  };
  var Engine = class {
    swap_chain = -1;
    frame_index = 0;
    time = performance.now() * 1e-3;
    last_time = performance.now() * 1e-3;
    // delta_time in seconds from last frame to this frame
    delta_time = performance.now() * 1e-3;
    // delta_time in seconds from last frame to now
    get abs_delta_time() {
      return performance.now() * 1e-3 - this.last_time;
    }
    mouse_input;
    input;
    paused = true;
    constructor() {
      this.input = new Input();
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
    tick = () => {
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
    pause() {
      cancelAnimationFrame(this.swap_chain);
      this.paused = true;
    }
    terminate() {
    }
  };

  // node_modules/@union_native/core/src/engine/frame_capture.ts
  var FrameCaptureNode = class extends PolyNode {
    name = "anonymous";
    start;
    end;
    color;
    description;
    data;
    type = 0 /* None */;
  };
  var Profiler = class {
    root;
    node;
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

  // node_modules/@union_native/core/src/engine/material_block.ts
  var MaterialBlock = class _MaterialBlock {
    name = "unamed";
    block_needs_update = true;
    parent;
    render_group = 0 /* Opaque */;
    cull_mode = 1029 /* Back */;
    constructor() {
      footprint_alloc(16);
    }
    generic_properties = /* @__PURE__ */ new Map();
    texture_properties = /* @__PURE__ */ new Map();
    set_int(name, value) {
      this.generic_properties.set(name, value);
    }
    set_float(name, value) {
      this.generic_properties.set(name, value);
    }
    set_float2(name, value) {
      this.generic_properties.set(name, value);
    }
    set_float3(name, value) {
      this.generic_properties.set(name, value);
    }
    set_float4(name, value) {
      this.generic_properties.set(name, value);
    }
    set_color(name, value) {
      this.generic_properties.set(name, value);
    }
    set_mat4(name, value) {
      this.generic_properties.set(name, value);
    }
    set_mat4_array(name, value) {
      this.generic_properties.set(name, value);
    }
    set_texture(name, guid) {
      this.texture_properties.set(name, guid);
    }
    has_property(name) {
      return this.generic_properties.has(name) || this.texture_properties.has(name);
    }
    get_property(name) {
      return this.generic_properties.get(name) || this.texture_properties.get(name);
    }
    remove_property(name) {
      this.generic_properties.delete(name);
      this.texture_properties.delete(name);
    }
    clone() {
      const block = new _MaterialBlock();
      block.generic_properties = new Map(this.generic_properties);
      block.texture_properties = new Map(this.texture_properties);
      return block;
    }
    reset() {
      this.generic_properties.clear();
      this.texture_properties.clear();
      return this;
    }
  };

  // node_modules/@union_native/core/src/adt/block_allocator.ts
  var BlockAllocator = class {
    constructor(block_size) {
      this.block_size = block_size;
    }
    tail = 0;
    heap_size = 0;
    valid_set = /* @__PURE__ */ new Set();
    free_set = /* @__PURE__ */ new Set();
    free_size = 0;
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

  // node_modules/@union_native/core/src/gfx/render.command.ts
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

  // node_modules/@union_native/core/src/gfx/render.worker.ts
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

  // node_modules/@union_native/core/src/webgpu/device.ts
  self.onmessage = render_worker_command_message;

  // node_modules/@union_native/core/src/webgpu/encoder.ts
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
    set_material(material2, description) {
    }
    set_material_block(material2, description) {
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

  // node_modules/@union_native/core/src/gfx/gfx_device.ts
  var default_clear_action = {
    type: 7 /* ClearAll */,
    clear_color: new ColorRGBA2(0, 0, 0, 0),
    clear_depth: 1
  };
  var _device;
  var GFXDevice = class {
    width = 1;
    height = 1;
    display_ratio = 1;
    display_width = 1;
    display_height = 1;
    backend = "public/src/worker/webgl.render/wgl.worker.js" /* WebGL */;
    encoder;
    constructor(options = {}) {
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

  // node_modules/@union_native/core/src/std/type.ts
  function is_string(obj) {
    return typeof obj === "string" || obj instanceof String;
  }
  function default_value(value, default_value2) {
    return value === void 0 ? default_value2 : value;
  }

  // node_modules/@union_native/core/src/worker/web_worker.ts
  var WebWorker = class {
    constructor(worker, auto_terminate = false) {
      this.worker = worker;
      this.auto_terminate = auto_terminate;
      this.worker.onmessage = this.onmessage;
    }
    state = 0 /* Idle */;
    queue = [];
    worker_name = "anonymous";
    task_id = 0;
    callbacks = /* @__PURE__ */ new Map();
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
    on_response;
    onmessage = (event) => {
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
  };

  // node_modules/@union_native/core/src/gfx/gfx_device_client.ts
  var GFXDeviceClient = class {
    constructor(backend) {
      this.backend = backend;
      const worker = new Worker(backend, { name: "RenderThread" });
      this.render_thread = new WebWorker(worker);
    }
    resource_id = 0;
    get_resource_id() {
      return this.resource_id++;
    }
    render_thread;
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

  // node_modules/@union_native/core/src/webgl/block.ts
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

  // node_modules/@union_native/core/src/webgl/type.ts
  var UnsignedByteType = 5121;
  var ByteType = 5120;
  var ShortType = 5122;
  var UnsignedShortType = 5123;
  var IntType = 5124;
  var UnsignedIntType = 5125;
  var FloatType = 5126;
  var HalfFloatType = 5131;

  // node_modules/@union_native/core/src/webgl/draw.ts
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

  // node_modules/@union_native/core/src/webgl/extensions.ts
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

  // node_modules/@union_native/core/src/std/numeric.ts
  function count_decimal_bit(n2) {
    let c = 1;
    while (Math.abs(n2) >= 10) {
      n2 /= 10;
      c++;
    }
    return c;
  }

  // node_modules/@union_native/core/src/webgl/texture_slot.ts
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

  // node_modules/@union_native/core/src/webgl/pipeline.ts
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
        if (location == null) {
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

  // node_modules/@union_native/core/src/webgl/encoder.ts
  var WebGLEncoder = class {
    canvas;
    client;
    pipeline;
    current_pass;
    gl;
    last_pass;
    last_viewport = new Rect();
    viewport = new Rect();
    profiler = new Profiler();
    recording = false;
    clear_action = {
      type: 7 /* ClearAll */,
      clear_color: new ColorRGBA2(0, 0, 0, 0),
      clear_depth: 1
    };
    uniform_cache = /* @__PURE__ */ new Map();
    camera;
    MAX_TEXTURE_SIZE;
    MAX_TEXTURE_IMAGE_UNITS;
    MAX_RENDERBUFFER_SIZE;
    UNIFORM_BUFFER_ALIGNMENT;
    UNIFORM_BUFFER_SIZE;
    width = 1;
    height = 1;
    multi_thread_rendering = false;
    constructor(options) {
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
    set_material(material2, description) {
    }
    set_draw = (draw, object, description) => {
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
    set_material_block(material2, description) {
      if (this.pipeline === void 0)
        return;
      if (this.recording)
        this.profiler.trace_start("set material block", description);
      const pipeline2 = this.pipeline;
      const pip_uniforms = pipeline2.uniforms;
      for (let i = 0; i < pip_uniforms.length; ++i) {
        const pip_uniform = pip_uniforms[i];
        const name = pip_uniform.name;
        if (!material2.has_property(name))
          continue;
        const uniform = material2.get_property(name);
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

  // node_modules/@union_native/core/src/engine/spherical_control.ts
  var SphericalControl = class {
    constructor(camera2) {
      this.camera = camera2;
      this.set_target(camera2.location);
      camera2.look_at(this.center);
    }
    enabled = true;
    movable = true;
    interpolated_spherical = new Spherical();
    current_spherical = new Spherical();
    center = new Float3();
    interpolated_center = new Float3();
    damping = 0.45;
    // ms
    location = new Float3();
    interpolated_location = new Float3();
    rotate_speed = Math.PI * 2;
    zoom_speed = 1;
    move_speed = 2;
    min_polar_angle = 1e-3;
    max_polar_angle = Math.PI;
    changed = false;
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

  // node_modules/@union_native/core/src/engine/vertex_data.ts
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

  // node_modules/@union_native/core/src/webgl/mesh.ts
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

  // node_modules/@union_native/core/src/webgl/primitive.ts
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

  // node_modules/@union_native/core/src/math/tangent.ts
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
    static T;
    static B;
    static N;
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

  // node_modules/@union_native/core/src/mesh/builtin_mesh.ts
  var builin_meshes = /* @__PURE__ */ new Map();

  // node_modules/@union_native/core/src/mesh/box_mesh.ts
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

    uniform frame_block {
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
  var material = new MaterialBlock();
  material.set_mat4("world_matrix", new Mat42());
  var action = {
    clear_color: new ColorRGBA2(0.1, 0.2, 0.3, 1),
    clear_depth: 1,
    type: 7 /* ClearAll */
  };
  var cube = create_box_mesh();
  function frame() {
    control.update();
    encoder.clear(action);
    encoder.set_pipeline(pipeline);
    encoder.set_camera(camera);
    encoder.set_material_block(material);
    encoder.draw_mesh(create_gpu_mesh(cube));
    encoder.commit();
  }
  EventHub.on(EngineEvent.Frame, frame);
  engine.start();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvYWR0L2ZsZXhfYnVmZmVyX3ZpZXcudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvYWR0L29yZGVyZWRfbWFwLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL2FkdC9wb29sLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL2FkdC9wdHJlZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9tZW1vcnkvZm9vdHByaW50LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL21hdGgvbWF0aC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9tYXRoL3NpbWQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvbWF0aC9ib3gudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvbWF0aC9jb2xvci50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9tYXRoL3NpbWRfbWF0LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL21hdGgvcmF5LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL21hdGgvcmVjdC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9tYXRoL3NpbWRfcXVhdGVybmlvbi50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9tZW1vcnkvaGVhcC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9tYXRoL3NwaGVyaWNhbC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9lbmdpbmUvY2FtZXJhLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL2VuZ2luZS9ldmVudC50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9lbmdpbmUvZ2xvYmFsX2V2ZW50LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL2lucHV0L2Jyb3dzZXJfaW5wdXQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvaW5wdXQvaW5wdXQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvZW5naW5lL2VuZ2luZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9lbmdpbmUvZnJhbWVfY2FwdHVyZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9lbmdpbmUvbWF0ZXJpYWxfYmxvY2sudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvYWR0L2Jsb2NrX2FsbG9jYXRvci50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9nZngvcmVuZGVyLmNvbW1hbmQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvZ2Z4L3JlbmRlci53b3JrZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvd2ViZ3B1L2RldmljZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy93ZWJncHUvZW5jb2Rlci50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9nZngvZ2Z4X2RldmljZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9zdGQvdHlwZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy93b3JrZXIvd2ViX3dvcmtlci50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9nZngvZ2Z4X2RldmljZV9jbGllbnQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvd2ViZ2wvYmxvY2sudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvd2ViZ2wvdHlwZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy93ZWJnbC9kcmF3LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL3dlYmdsL2V4dGVuc2lvbnMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvc3RkL251bWVyaWMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvd2ViZ2wvdGV4dHVyZV9zbG90LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL3dlYmdsL3BpcGVsaW5lLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL3dlYmdsL2VuY29kZXIudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvZW5naW5lL3NwaGVyaWNhbF9jb250cm9sLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL2VuZ2luZS92ZXJ0ZXhfZGF0YS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy93ZWJnbC9tZXNoLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9AdW5pb25fbmF0aXZlL2NvcmUvc3JjL3dlYmdsL3ByaW1pdGl2ZS50cyIsICIuLi9ub2RlX21vZHVsZXMvQHVuaW9uX25hdGl2ZS9jb3JlL3NyYy9tYXRoL3RhbmdlbnQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvbWVzaC9idWlsdGluX21lc2gudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0B1bmlvbl9uYXRpdmUvY29yZS9zcmMvbWVzaC9ib3hfbWVzaC50cyIsICIuLi9zcmMvcGlwZWxpbmUudHMiLCAiLi4vc3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBCdWZmZXJSYW5nZSB9IGZyb20gJy4vdHlwZSc7XG5cbmV4cG9ydCBjbGFzcyBGbGV4QnVmZmVyVmlldyB7XG4gICAgZjMyX3ZpZXc6IEZsb2F0MzJBcnJheTtcbiAgICB1MzJfdmlldzogVWludDMyQXJyYXk7XG4gICAgdThfdmlldzogVWludDhBcnJheTtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBidWZmZXI6IEFycmF5QnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDAsIGJ5dGVfbGVuZ3RoOiBudW1iZXIgPSBidWZmZXIuYnl0ZUxlbmd0aCkge1xuICAgICAgICB0aGlzLmYzMl92aWV3ID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIsIG9mZnNldCwgYnl0ZV9sZW5ndGggLyA0KTtcbiAgICAgICAgdGhpcy51MzJfdmlldyA9IG5ldyBVaW50MzJBcnJheShidWZmZXIsIG9mZnNldCwgYnl0ZV9sZW5ndGggLyA0KTtcbiAgICAgICAgdGhpcy51OF92aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCBvZmZzZXQsIGJ5dGVfbGVuZ3RoKTtcbiAgICB9XG5cbiAgICBzdWJfdmlldyhyYW5nZTogQnVmZmVyUmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbGV4QnVmZmVyVmlldyh0aGlzLmJ1ZmZlciwgcmFuZ2UuYnl0ZV9vZmZzZXQsIHJhbmdlLmJ5dGVfbGVuZ3RoKTtcbiAgICB9XG59IiwgImV4cG9ydCB0eXBlIE1hcEtleSA9IHN0cmluZyB8IG51bWJlcjtcblxuZXhwb3J0IGNsYXNzIE9yZGVyZWRNYXA8SyA9IE1hcEtleSwgViA9IGFueT4ge1xuICAgIHByaXZhdGUgbWFwOiBNYXA8SywgVj4gPSBuZXcgTWFwKCk7XG4gICAgcHJpdmF0ZSBsaXN0OiBBcnJheTxLPiA9IFtdO1xuXG4gICAgY29uc3RydWN0b3Ioc291cmNlPzogQXJyYXk8eyBrZXk6IEs7IHZhbHVlOiBWIH0+IHwgSXRlcmFibGU8eyBrZXk6IEs7IHZhbHVlOiBWIH0+IHwgeyBba2V5OiBzdHJpbmddOiBWIH0pIHtcbiAgICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgc291cmNlLmZvckVhY2goKHBhaXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0KHBhaXIua2V5LCBwYWlyLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0LnB1c2gocGFpci5rZXkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgKHNvdXJjZSBhcyBhbnkpW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2Ygc291cmNlIGFzIEl0ZXJhYmxlPHsga2V5OiBLOyB2YWx1ZTogViB9Pikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXQocGFpci5rZXksIHBhaXIudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3QucHVzaChwYWlyLmtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc291cmNlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSkuc29ydCgpIGFzIEtbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBvYmogPSBzb3VyY2UgYXMgeyBba2V5OiBzdHJpbmddOiBWIH07XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubGlzdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXQobmFtZSBhcyBLLCBvYmpbbmFtZSBhcyBzdHJpbmddIGFzIFYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBzZXQoa2V5OiBLLCB2YWx1ZTogVikge1xuICAgICAgICBpZiAoIXRoaXMubWFwLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3QucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFwLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQoa2V5OiBLKTogViB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICB9XG5cbiAgICBpbmRleF9vZih2YWx1ZTogVik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QuaW5kZXhPZih2YWx1ZSBhcyBhbnkpO1xuICAgIH1cblxuICAgIGF0KGluZGV4OiBudW1iZXIpOiBWIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMubGlzdC5sZW5ndGggLSAxKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC5nZXQodGhpcy5saXN0W2luZGV4XSk7XG4gICAgfVxuXG4gICAgcmVwbGFjZV9hdChpbmRleDogbnVtYmVyLCBuZXdfa2V5OiBLLCB2YWx1ZT86IFYpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMubGlzdC5sZW5ndGggLSAxKSByZXR1cm47XG4gICAgICAgIGNvbnN0IG9sZF9rZXkgPSB0aGlzLmxpc3RbaW5kZXhdO1xuICAgICAgICB0aGlzLmxpc3RbaW5kZXhdID0gbmV3X2tleTtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA/PyB0aGlzLm1hcC5nZXQob2xkX2tleSkhO1xuICAgICAgICB0aGlzLm1hcC5kZWxldGUob2xkX2tleSk7XG4gICAgICAgIHRoaXMubWFwLnNldChuZXdfa2V5LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmVwbGFjZShvbGRfa2V5OiBLLCBuZXdfa2V5OiBLLCB2YWx1ZT86IFYpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmxpc3QuaW5kZXhPZihvbGRfa2V5KTtcbiAgICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlcGxhY2VfYXQoaW5kZXgsIG5ld19rZXksIHZhbHVlKTtcbiAgICB9XG5cbiAgICBzd2FwKGluZGV4X2E6IG51bWJlciwgaW5kZXhfYjogbnVtYmVyKSB7XG4gICAgICAgIGlmIChpbmRleF9hIDwgMCB8fCBpbmRleF9hID4gdGhpcy5saXN0Lmxlbmd0aCAtIDEpIHJldHVybjtcbiAgICAgICAgaWYgKGluZGV4X2IgPCAwIHx8IGluZGV4X2IgPiB0aGlzLmxpc3QubGVuZ3RoIC0gMSkgcmV0dXJuO1xuICAgICAgICBpZiAoaW5kZXhfYSA9PT0gaW5kZXhfYikgcmV0dXJuO1xuICAgICAgICBjb25zdCBrZXlfYSA9IHRoaXMubGlzdFtpbmRleF9hXTtcbiAgICAgICAgY29uc3Qga2V5X2IgPSB0aGlzLmxpc3RbaW5kZXhfYl07XG4gICAgICAgIHRoaXMubGlzdFtpbmRleF9hXSA9IGtleV9iO1xuICAgICAgICB0aGlzLmxpc3RbaW5kZXhfYl0gPSBrZXlfYTtcbiAgICB9XG5cbiAgICBkZWxldGUoa2V5OiBLKSB7XG4gICAgICAgIGlmICh0aGlzLm1hcC5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdGhpcy5tYXAuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICB0aGlzLmxpc3Quc3BsaWNlKHRoaXMubGlzdC5pbmRleE9mKGtleSksIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVsZXRlX3ZhbHVlKHZhbHVlOiBWKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5saXN0LmluZGV4T2YodmFsdWUgYXMgYW55KTtcbiAgICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmRlbGV0ZV9hdChpbmRleCk7XG4gICAgfVxuXG4gICAgZGVsZXRlX2F0KGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMubGlzdC5sZW5ndGggLSAxKSByZXR1cm47XG4gICAgICAgIHRoaXMuZGVsZXRlKHRoaXMubGlzdFtpbmRleF0pO1xuICAgIH1cblxuICAgIGhhcyhrZXk6IEspIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmhhcyhrZXkpO1xuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLmxpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5tYXAuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAqW1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmF0b3I8W0ssIFZdPiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5saXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmxpc3RbaV07XG4gICAgICAgICAgICB5aWVsZCBba2V5LCB0aGlzLm1hcC5nZXQoa2V5KSFdO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwgImltcG9ydCB7IENvbnN0cnVjdG9yIH0gZnJvbSAnLi4vc3RkL3R5cGUnO1xuXG5pbnRlcmZhY2UgVHlwZWRQb29sPFQ+IHtcbiAgICBmcmVlOiBTZXQ8VD47XG4gICAgcHJlc2VydmVkOiBTZXQ8VD47XG59XG5cbmxldCBfdHJhY2VfZW5hYmxlZCA9IGZhbHNlO1xuXG5jb25zdCBfcG9vbF9tYXAgPSBuZXcgTWFwPENvbnN0cnVjdG9yPGFueT4sIFR5cGVkUG9vbDxhbnk+PigpO1xuY29uc3QgX29iamVjdF9tYXAgPSBuZXcgV2Vha01hcDxhbnksIFR5cGVkUG9vbDxhbnk+PigpO1xuY29uc3QgX29iamVjdF90cmFjZSA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4vKipcbiAqIEB3YXJuaW5nIERPIE5PVCBVU0UgVEhJUyBGVU5DVElPTiBJTiBBIEhJR0ggRlJFUVVFTkNZIExPT1BcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvb2xfZ2V0PFQ+KGNvbnN0cnVjdG9yOiBDb25zdHJ1Y3RvcjxUPik6IFQge1xuICAgIGxldCBwb29sID0gX3Bvb2xfbWFwLmdldChjb25zdHJ1Y3Rvcik7XG4gICAgaWYgKCFwb29sKSB7XG4gICAgICAgIHBvb2wgPSB7XG4gICAgICAgICAgICBmcmVlOiBuZXcgU2V0PFQ+KCksXG4gICAgICAgICAgICBwcmVzZXJ2ZWQ6IG5ldyBTZXQ8VD4oKSxcbiAgICAgICAgfTtcbiAgICAgICAgX3Bvb2xfbWFwLnNldChjb25zdHJ1Y3RvciwgcG9vbCk7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlOiBUO1xuICAgIGlmIChwb29sLmZyZWUuc2l6ZSA+IDApIHtcbiAgICAgICAgaW5zdGFuY2UgPSBwb29sLmZyZWUudmFsdWVzKCkubmV4dCgpLnZhbHVlO1xuICAgICAgICBwb29sLmZyZWUuZGVsZXRlKGluc3RhbmNlKTtcbiAgICAgICAgcG9vbC5wcmVzZXJ2ZWQuYWRkKGluc3RhbmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbnN0YW5jZSA9IG5ldyBjb25zdHJ1Y3RvcigpO1xuICAgICAgICBfb2JqZWN0X21hcC5zZXQoaW5zdGFuY2UsIHBvb2wpO1xuICAgICAgICBwb29sLnByZXNlcnZlZC5hZGQoaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIGlmIChfdHJhY2VfZW5hYmxlZCkge1xuICAgICAgICBfb2JqZWN0X3RyYWNlLnNldChpbnN0YW5jZSwgbmV3IEVycm9yKCkuc3RhY2shKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8qKlxuICogQHdhcm5pbmcgRE8gTk9UIFVTRSBUSElTIEZVTkNUSU9OIElOIEEgSElHSCBGUkVRVUVOQ1kgTE9PUFxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9vbF9yZXR1cm48VD4oaW5zdGFuY2U6IFQpOiB2b2lkIHtcbiAgICBjb25zdCBwb29sID0gX29iamVjdF9tYXAuZ2V0KGluc3RhbmNlKTtcbiAgICBpZiAoIXBvb2wpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtwb29sXSBwb29sX3JldHVybjogcG9vbCBmb3IgJHtpbnN0YW5jZX0gbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXBvb2wucHJlc2VydmVkLmhhcyhpbnN0YW5jZSkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtwb29sXSBwb29sX3JldHVybjogaW5zdGFuY2Ugbm90IGZvdW5kIGluIHBvb2xgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHBvb2wucHJlc2VydmVkLmRlbGV0ZShpbnN0YW5jZSk7XG4gICAgcG9vbC5mcmVlLmFkZChpbnN0YW5jZSk7XG4gICAgaWYgKF90cmFjZV9lbmFibGVkKSBfb2JqZWN0X3RyYWNlLmRlbGV0ZShpbnN0YW5jZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb29sX3RyYWNlKGVuYWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgIF90cmFjZV9lbmFibGVkID0gZW5hYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9vbF9kaWFnbm9zZSgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBfb2JqZWN0X3RyYWNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbb2JqZWN0XSAke2tleX0gbGVha2VkIGF0ICR7dmFsdWV9YCk7XG4gICAgfVxufSIsICJleHBvcnQgY2xhc3MgUG9seU5vZGU8VCBleHRlbmRzIFBvbHlOb2RlPFQ+PiB7XG4gICAgY2hpbGRyZW46IEFycmF5PFQ+ID0gW107XG5cbiAgICBwYXJlbnQ6IFQgfCB1bmRlZmluZWQ7XG5cbiAgICBnZXQgaXNfcm9vdCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50ID09PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY2FuX2FkZD86IChub2RlOiBUKSA9PiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG4gICAgYWRkKG5vZGU6IFQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuY2FuX2FkZCAmJiB0aGlzLmNhbl9hZGQobm9kZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChub2RlLnBhcmVudCkge1xuICAgICAgICAgICAgbm9kZS5wYXJlbnQucmVtb3ZlKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgbm9kZS5wYXJlbnQgPSB0aGlzIGFzIGFueTtcbiAgICB9XG5cbiAgICByZW1vdmUobm9kZTogVCk6IHZvaWQge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihub2RlKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIG5vZGUucGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFzKG5vZGU6IFQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uaW5kZXhPZihub2RlKSA+IC0xO1xuICAgIH1cblxuICAgIHNlcmlhbGl6ZSgpOiBhbnkgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGRlc2VyaWFsaXplKGRhdGE6IGFueSkge1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb2x5Tm9kZURhdGEge1xuICAgIGNoaWxkcmVuOiBudW1iZXJbXTtcbiAgICBkYXRhOiBhbnk7XG4gICAgaWQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQVHJlZURhdGEge1xuICAgIG5vZGVzOiBQb2x5Tm9kZURhdGFbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB0cmVlX3NlcmlhbGl6ZTxUIGV4dGVuZHMgUG9seU5vZGU8VD4+KHJvb3Q6IFBvbHlOb2RlPFQ+KSB7XG4gICAgY29uc3QgZGF0YV9ub2RlczogUG9seU5vZGVEYXRhW10gPSBbXTtcbiAgICBjb25zdCBub2RlX21hcCA9IG5ldyBXZWFrTWFwPFBvbHlOb2RlPFQ+LCBQb2x5Tm9kZURhdGE+KCk7XG4gICAgY29uc3QgcXVldWU6IFBvbHlOb2RlPFQ+W10gPSBbcm9vdF07XG4gICAgbGV0IGlkID0gMDtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBub2RlID0gcXVldWUuc2hpZnQoKSE7XG4gICAgICAgIGNvbnN0IG5vZGVfaWQgPSBpZCsrO1xuICAgICAgICBjb25zdCBkYXRhX25vZGUgPSBwb2x5X25vZGVfc2VyaWFsaXplKG5vZGUsIG5vZGVfaWQpO1xuXG4gICAgICAgIG5vZGVfbWFwLnNldChub2RlLCBkYXRhX25vZGUpO1xuICAgICAgICBkYXRhX25vZGVzLnB1c2goZGF0YV9ub2RlKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goY2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGUucGFyZW50KSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRfZGF0YSA9IG5vZGVfbWFwLmdldChub2RlLnBhcmVudCEpO1xuICAgICAgICAgICAgaWYgKHBhcmVudF9kYXRhKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50X2RhdGEuY2hpbGRyZW4ucHVzaChub2RlX2lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGRhdGE6IFBUcmVlRGF0YSA9IHsgbm9kZXM6IGRhdGFfbm9kZXMgfTtcbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gcG9seV9ub2RlX3NlcmlhbGl6ZShub2RlOiBQb2x5Tm9kZTxhbnk+LCBpZDogbnVtYmVyKTogUG9seU5vZGVEYXRhIHtcbiAgICByZXR1cm4geyBpZCwgZGF0YTogbm9kZS5zZXJpYWxpemU/LigpLCBjaGlsZHJlbjogW10gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB0cmVlX2Rlc2VyaWFsaXplPFQgZXh0ZW5kcyBQb2x5Tm9kZTxUPj4oZGF0YTogUFRyZWVEYXRhLCBjb25zdHJ1Y3Rvcj86IENvbnN0cnVjdG9yPFQ+KTogVCB7XG4gICAgY29uc3Qgbm9kZV9tYXAgPSBuZXcgTWFwPG51bWJlciwgUG9seU5vZGU8VD4+KCk7XG5cbiAgICBmb3IgKGNvbnN0IGRhdGFfbm9kZSBvZiBkYXRhLm5vZGVzKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBwb2x5X25vZGVfZGVzZXJpYWxpemU8VD4oZGF0YV9ub2RlLCBjb25zdHJ1Y3Rvcik7XG4gICAgICAgIG5vZGVfbWFwLnNldChkYXRhX25vZGUuaWQsIG5vZGUpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZGF0YV9ub2RlIG9mIGRhdGEubm9kZXMpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVfbWFwLmdldChkYXRhX25vZGUuaWQpITtcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZF9pZCBvZiBkYXRhX25vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZV9tYXAuZ2V0KGNoaWxkX2lkKSE7XG4gICAgICAgICAgICBub2RlLmFkZChjaGlsZCBhcyBhbnkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdCA9IG5vZGVfbWFwLmdldCgwKSE7XG4gICAgcmV0dXJuIHJvb3QgYXMgVDtcbn1cblxuZnVuY3Rpb24gcG9seV9ub2RlX2Rlc2VyaWFsaXplPFQgZXh0ZW5kcyBQb2x5Tm9kZTxUPj4oZGF0YV9ub2RlOiBQb2x5Tm9kZURhdGEsIGNvbnN0cnVjdG9yPzogQ29uc3RydWN0b3I8VD4pOiBQb2x5Tm9kZTxUPiB7XG4gICAgY29uc3Qgbm9kZSA9IG5ldyAoY29uc3RydWN0b3IgPz8gUG9seU5vZGU8VD4pKCk7XG4gICAgbm9kZS5kZXNlcmlhbGl6ZT8uKGRhdGFfbm9kZS5kYXRhKTtcbiAgICByZXR1cm4gbm9kZTtcbn1cblxuXG5leHBvcnQgdHlwZSBQb2x5Tm9kZVZpc2l0b3I8VCBleHRlbmRzIFBvbHlOb2RlPFQ+PiA9IChub2RlOiBUKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gcG9seV9ub2RlX3RyYXZlcnNlX2RmczxUIGV4dGVuZHMgUG9seU5vZGU8VD4+KHJvb3Q6IFQsIHZpc2l0b3I6IFBvbHlOb2RlVmlzaXRvcjxUPikge1xuICAgIHZpc2l0b3Iocm9vdCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb290LmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHBvbHlfbm9kZV90cmF2ZXJzZV9kZnMocm9vdC5jaGlsZHJlbltpXSwgdmlzaXRvcik7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9seV9ub2RlX3RyYXZlcnNlX2JmczxUIGV4dGVuZHMgUG9seU5vZGU8VD4+KHJvb3Q6IFQsIHZpc2l0b3I6IFBvbHlOb2RlVmlzaXRvcjxUPikge1xuICAgIGNvbnN0IHF1ZXVlOiBUW10gPSBbcm9vdF07XG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHF1ZXVlLnNoaWZ0KCkhO1xuICAgICAgICB2aXNpdG9yKG5vZGUpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2gobm9kZS5jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICB9XG59IiwgImxldCBnbG9iYWxfZm9vdF9wcmludCA9IDA7XG5leHBvcnQgZnVuY3Rpb24gZm9vdHByaW50X2dldCgpIHtcbiAgICByZXR1cm4gZ2xvYmFsX2Zvb3RfcHJpbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb290cHJpbnRfcmVzZXQoKSB7XG4gICAgZ2xvYmFsX2Zvb3RfcHJpbnQgPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9vdHByaW50X2FsbG9jKHNpemU6IG51bWJlcikge1xuICAgIGdsb2JhbF9mb290X3ByaW50ICs9IHNpemU7XG59IiwgImV4cG9ydCBjb25zdCBEZWdyZWVUb1JhZGlhbiA9IE1hdGguUEkgLyAxODA7XG5leHBvcnQgY29uc3QgUmFkaWFuVG9EZWdyZWUgPSAxODAgLyBNYXRoLlBJO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVnMnJhZChkZWc6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGRlZyAqIERlZ3JlZVRvUmFkaWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmFkMmRlZyhyYWQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHJhZCAqIFJhZGlhblRvRGVncmVlO1xufVxuXG5leHBvcnQgY29uc3QgRSA9IDIuNzE4MjgxODI4NDtcbmV4cG9ydCBjb25zdCBQSSA9IDMuMTQxNTkyNjUzO1xuZXhwb3J0IGNvbnN0IEVQU0lMT04gPSAxZS00O1xuXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAoaTogbnVtYmVyLCBiOiBudW1iZXIsIHQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKGksIHQpLCBiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxlcnAoYTogbnVtYmVyLCBiOiBudW1iZXIsIGk6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGEgKyAoYiAtIGEpICogaTtcbn1cbiIsICJpbXBvcnQgeyBmb290cHJpbnRfYWxsb2MgfSBmcm9tICcuLi9tZW1vcnkvZm9vdHByaW50JztcbmltcG9ydCB7IEhlYXBQb2ludGVyIH0gZnJvbSAnLi4vbWVtb3J5L2hlYXBfcG9pbnRlcic7XG5pbXBvcnQgeyBUeXBlZEFycmF5IH0gZnJvbSAnLi4vc3RkL3R5cGUnO1xuaW1wb3J0IHsgY2xhbXAsIGxlcnAgfSBmcm9tICcuL21hdGgnO1xuaW1wb3J0IHsgTWF0MywgTWF0NCB9IGZyb20gJy4vc2ltZF9tYXQnO1xuaW1wb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vc2ltZF9xdWF0ZXJuaW9uJztcbmltcG9ydCB7IFNwaGVyaWNhbCB9IGZyb20gJy4vc3BoZXJpY2FsJztcblxuZXhwb3J0IGNsYXNzIEZsb2F0MiBpbXBsZW1lbnRzIEhlYXBQb2ludGVyIHtcbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF07XG4gICAgfVxuICAgIHNldCB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgc2V0IHkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgc2l6ZSA9IDI7XG4gICAgZWxlbWVudHMgPSBuZXcgRmxvYXQzMkFycmF5KDIpO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCkge1xuICAgICAgICB0aGlzLnNldCh4LCB5KTtcbiAgICAgICAgZm9vdHByaW50X2FsbG9jKDIpO1xuICAgIH1cblxuICAgIHJlYWQoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gYnVmZmVyW29mZnNldF07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSBidWZmZXJbb2Zmc2V0ICsgMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdyaXRlKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgYnVmZmVyW29mZnNldF0gPSB0aGlzLmVsZW1lbnRzWzBdO1xuICAgICAgICBidWZmZXJbb2Zmc2V0ICsgMV0gPSB0aGlzLmVsZW1lbnRzWzFdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBGbG9hdDIge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0geDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkoYTogRmxvYXQyKTogRmxvYXQyIHtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5zZXQoYS5lbGVtZW50cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb25lKCk6IEZsb2F0MiB7XG4gICAgICAgIHJldHVybiBuZXcgRmxvYXQyKHRoaXMuZWxlbWVudHNbMF0sIHRoaXMuZWxlbWVudHNbMV0pO1xuICAgIH1cblxuICAgIHJvdGF0ZShhbmdsZTogbnVtYmVyLCBjZW50ZXI/OiBGbG9hdDIpOiBGbG9hdDIge1xuICAgICAgICBpZiAoY2VudGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNlbnRlciA9IF9jZW50ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oYW5nbGUpO1xuXG4gICAgICAgIGNvbnN0IHggPSB0aGlzLmVsZW1lbnRzWzBdIC0gY2VudGVyLng7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLmVsZW1lbnRzWzFdIC0gY2VudGVyLnk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHggKiBjIC0geSAqIHMgKyBjZW50ZXIueDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IHggKiBzICsgeSAqIGMgKyBjZW50ZXIueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGlzdGFuY2UoYTogRmxvYXQyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3RhbmNlX3NxdWFyZWQoYSkpO1xuICAgIH1cblxuICAgIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmVsZW1lbnRzWzBdICogdGhpcy5lbGVtZW50c1swXSArIHRoaXMuZWxlbWVudHNbMV0gKiB0aGlzLmVsZW1lbnRzWzFdKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKTogRmxvYXQyIHtcbiAgICAgICAgY29uc3QgaW52X2xlbmd0aCA9IDEuMCAvIHRoaXMubGVuZ3RoO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICo9IGludl9sZW5ndGg7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKj0gaW52X2xlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYWRkKGE6IEZsb2F0Mik6IEZsb2F0MiB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gKz0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSArPSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdWIoYTogRmxvYXQyKTogRmxvYXQyIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSAtPSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdIC09IGEuZWxlbWVudHNbMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bChuOiBudW1iZXIpOiBGbG9hdDIge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKj0gbjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZG90KGE6IEZsb2F0Mik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdICogYS5lbGVtZW50c1swXSArIHRoaXMuZWxlbWVudHNbMV0gKiBhLmVsZW1lbnRzWzFdO1xuICAgIH1cblxuICAgIGxlcnAoYTogRmxvYXQyLCBmOiBudW1iZXIpOiBGbG9hdDIge1xuICAgICAgICByZXR1cm4gRmxvYXQyLkxlcnAodGhpcywgYSwgZiwgdGhpcyk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2Vfc3F1YXJlZChhOiBGbG9hdDIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBkeCA9IHRoaXMuZWxlbWVudHNbMF0gLSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBkeSA9IHRoaXMuZWxlbWVudHNbMV0gLSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBbJHt0aGlzLmVsZW1lbnRzWzBdfSwgJHt0aGlzLmVsZW1lbnRzWzFdfV1gO1xuICAgIH1cblxuICAgIHN0YXRpYyBMZXJwKGE6IEZsb2F0MiwgYjogRmxvYXQyLCBmOiBudW1iZXIsIGRzdD86IEZsb2F0Mik6IEZsb2F0MiB7XG4gICAgICAgIGlmICghZHN0KSBkc3QgPSBuZXcgRmxvYXQyKCk7XG4gICAgICAgIGRzdC54ID0gYS5lbGVtZW50c1swXSArIChiLnggLSBhLmVsZW1lbnRzWzBdKSAqIGY7XG4gICAgICAgIGRzdC55ID0gYS5lbGVtZW50c1sxXSArIChiLnkgLSBhLmVsZW1lbnRzWzFdKSAqIGY7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxufVxuY29uc3QgX2NlbnRlciA9IG5ldyBGbG9hdDIoKTtcblxuZXhwb3J0IGNsYXNzIEZsb2F0MyBpbXBsZW1lbnRzIEhlYXBQb2ludGVyIHtcbiAgICBzaXplID0gMztcbiAgICBlbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoMyk7XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF07XG4gICAgfVxuICAgIHNldCB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgc2V0IHkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzJdO1xuICAgIH1cbiAgICBzZXQgeih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwKSB7XG4gICAgICAgIHRoaXMuc2V0KHgsIHksIHopO1xuICAgICAgICBmb290cHJpbnRfYWxsb2MoMyk7XG4gICAgfVxuXG4gICAgcmVhZChidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSBidWZmZXJbb2Zmc2V0XTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IGJ1ZmZlcltvZmZzZXQgKyAxXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IGJ1ZmZlcltvZmZzZXQgKyAyXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgd3JpdGUoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICBidWZmZXJbb2Zmc2V0XSA9IHRoaXMuZWxlbWVudHNbMF07XG4gICAgICAgIGJ1ZmZlcltvZmZzZXQgKyAxXSA9IHRoaXMuZWxlbWVudHNbMV07XG4gICAgICAgIGJ1ZmZlcltvZmZzZXQgKyAyXSA9IHRoaXMuZWxlbWVudHNbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHg7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSB5O1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gejtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3Jvc3MoYjogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0My5Dcm9zcyh0aGlzLCBiLCB0aGlzKTtcbiAgICB9XG5cbiAgICBmcm9tX3NwaGVyaWNhbChzOiBTcGhlcmljYWwpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gRmxvYXQzLkZyb21TcGhlcmljYWwocywgdGhpcyk7XG4gICAgfVxuXG4gICAgYXBwbHlfcXVhdGVybmlvbihxOiBRdWF0ZXJuaW9uKTogRmxvYXQzIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0My5BcHBseVF1YXRlcm5pb24odGhpcywgcSwgdGhpcyk7XG4gICAgfVxuXG4gICAgYWRkKGE6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gKz0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSArPSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdICs9IGEuZWxlbWVudHNbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN1YihhOiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdIC09IGEuZWxlbWVudHNbMF07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gLT0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSAtPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWwobjogbnVtYmVyKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSAqPSBuO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gKj0gbjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsX3YoYTogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSAqPSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdICo9IGEuZWxlbWVudHNbMV07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gKj0gYS5lbGVtZW50c1syXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGl2KG46IG51bWJlcik6IEZsb2F0MyB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gLz0gbjtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSAvPSBuO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdIC89IG47XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRpdl92KGE6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gLz0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSAvPSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdIC89IGEuZWxlbWVudHNbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkoYTogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IGEuZWxlbWVudHNbMF07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSBhLmVsZW1lbnRzWzFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gYS5lbGVtZW50c1syXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2xvbmUoKTogRmxvYXQzIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDModGhpcy5lbGVtZW50c1swXSwgdGhpcy5lbGVtZW50c1sxXSwgdGhpcy5lbGVtZW50c1syXSk7XG4gICAgfVxuXG4gICAgbGVycChiOiBGbG9hdDMsIGk6IG51bWJlcik6IEZsb2F0MyB7XG4gICAgICAgIHJldHVybiBGbG9hdDMuTGVycCh0aGlzLCBiLCBpLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0KG06IE1hdDQpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gRmxvYXQzLk11bHRpcGx5TWF0NCh0aGlzLCBtLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0X2RpcmVjdGlvbmFsKG06IE1hdDQpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gRmxvYXQzLk11bHRpcGx5TWF0NERpcmVjdGlvbmFsKHRoaXMsIG0sIHRoaXMpO1xuICAgIH1cblxuICAgIGRpc3RhbmNlKGE6IEZsb2F0Myk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZV9zcXVhcmVkKGEpKTtcbiAgICB9XG5cbiAgICBnZXQgbGVuZ3RoX3NxdWFyZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXSAqIHRoaXMuZWxlbWVudHNbMF0gKyB0aGlzLmVsZW1lbnRzWzFdICogdGhpcy5lbGVtZW50c1sxXSArIHRoaXMuZWxlbWVudHNbMl0gKiB0aGlzLmVsZW1lbnRzWzJdO1xuICAgIH1cblxuICAgIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmVsZW1lbnRzWzBdICogdGhpcy5lbGVtZW50c1swXSArIHRoaXMuZWxlbWVudHNbMV0gKiB0aGlzLmVsZW1lbnRzWzFdICsgdGhpcy5lbGVtZW50c1syXSAqIHRoaXMuZWxlbWVudHNbMl0pO1xuICAgIH1cblxuICAgIGRvdChhOiBGbG9hdDMpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXSAqIGEuZWxlbWVudHNbMF0gKyB0aGlzLmVsZW1lbnRzWzFdICogYS5lbGVtZW50c1sxXSArIHRoaXMuZWxlbWVudHNbMl0gKiBhLmVsZW1lbnRzWzJdO1xuICAgIH1cblxuICAgIG1pbihhOiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gTWF0aC5taW4odGhpcy5lbGVtZW50c1swXSwgYS5lbGVtZW50c1swXSk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSBNYXRoLm1pbih0aGlzLmVsZW1lbnRzWzFdLCBhLmVsZW1lbnRzWzFdKTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IE1hdGgubWluKHRoaXMuZWxlbWVudHNbMl0sIGEuZWxlbWVudHNbMl0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtYXgoYTogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IE1hdGgubWF4KHRoaXMuZWxlbWVudHNbMF0sIGEuZWxlbWVudHNbMF0pO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gTWF0aC5tYXgodGhpcy5lbGVtZW50c1sxXSwgYS5lbGVtZW50c1sxXSk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSBNYXRoLm1heCh0aGlzLmVsZW1lbnRzWzJdLCBhLmVsZW1lbnRzWzJdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCk6IEZsb2F0MyB7XG4gICAgICAgIGNvbnN0IGludl9sZW5ndGggPSAxLjAgLyB0aGlzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSAqPSBpbnZfbGVuZ3RoO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdICo9IGludl9sZW5ndGg7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gKj0gaW52X2xlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGlzdGFuY2Vfc3F1YXJlZChhOiBGbG9hdDMpOiBudW1iZXIge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5lbGVtZW50c1swXSAtIGEuZWxlbWVudHNbMF07XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLmVsZW1lbnRzWzFdIC0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgY29uc3QgeiA9IHRoaXMuZWxlbWVudHNbMl0gLSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgWyR7dGhpcy5lbGVtZW50c1swXX0sICR7dGhpcy5lbGVtZW50c1sxXX0sICR7dGhpcy5lbGVtZW50c1syXX1dYDtcbiAgICB9XG5cbiAgICBzdGF0aWMgSXNaZXJvKHNyYzogRmxvYXQzKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzcmMueCA9PT0gMCAmJiBzcmMueSA9PT0gMCAmJiBzcmMueiA9PT0gMDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRXF1YWxzKGE6IEZsb2F0MywgYjogRmxvYXQzKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBhLmVsZW1lbnRzWzBdID09PSBiLmVsZW1lbnRzWzBdICYmIGEuZWxlbWVudHNbMV0gPT09IGIuZWxlbWVudHNbMV0gJiYgYS5lbGVtZW50c1syXSA9PT0gYi5lbGVtZW50c1syXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgQWJzKHNyYzogRmxvYXQzLCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGRzdC54ID0gTWF0aC5hYnMoc3JjLngpO1xuICAgICAgICBkc3QueSA9IE1hdGguYWJzKHNyYy55KTtcbiAgICAgICAgZHN0LnogPSBNYXRoLmFicyhzcmMueik7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIENsYW1wKHNyYzogRmxvYXQzLCBtaW46IEZsb2F0MywgbWF4OiBGbG9hdDMsIGRzdDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgZHN0LnggPSBjbGFtcChzcmMueCwgbWluLngsIG1heC54KTtcbiAgICAgICAgZHN0LnkgPSBjbGFtcChzcmMueSwgbWluLnksIG1heC55KTtcbiAgICAgICAgZHN0LnogPSBjbGFtcChzcmMueiwgbWluLnosIG1heC56KTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgU2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIGRzdDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgZHN0LnggPSB4O1xuICAgICAgICBkc3QueSA9IHk7XG4gICAgICAgIGRzdC56ID0gejtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgQ29weShzcmM6IEZsb2F0MywgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QueCA9IHNyYy54O1xuICAgICAgICBkc3QueSA9IHNyYy55O1xuICAgICAgICBkc3QueiA9IHNyYy56O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBTd2FwKGE6IEZsb2F0MywgYjogRmxvYXQzKSB7XG4gICAgICAgIFthLmVsZW1lbnRzWzBdLCBiLnhdID0gW2IueCwgYS5lbGVtZW50c1swXV07XG4gICAgICAgIFthLmVsZW1lbnRzWzFdLCBiLnldID0gW2IueSwgYS5lbGVtZW50c1sxXV07XG4gICAgICAgIFthLmVsZW1lbnRzWzJdLCBiLnpdID0gW2IueiwgYS5lbGVtZW50c1syXV07XG4gICAgfVxuXG4gICAgc3RhdGljIEFkZChhOiBGbG9hdDMsIGI6IEZsb2F0MywgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QueCA9IGEuZWxlbWVudHNbMF0gKyBiLng7XG4gICAgICAgIGRzdC55ID0gYS5lbGVtZW50c1sxXSArIGIueTtcbiAgICAgICAgZHN0LnogPSBhLmVsZW1lbnRzWzJdICsgYi56O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBTdWJ0cmFjdChhOiBGbG9hdDMsIGI6IEZsb2F0MywgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QueCA9IGEuZWxlbWVudHNbMF0gLSBiLng7XG4gICAgICAgIGRzdC55ID0gYS5lbGVtZW50c1sxXSAtIGIueTtcbiAgICAgICAgZHN0LnogPSBhLmVsZW1lbnRzWzJdIC0gYi56O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBEaXN0YW5jZShhOiBGbG9hdDMsIGI6IEZsb2F0Myk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBhLmRpc3RhbmNlKGIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBOb3JtYWxpemUoc3JjOiBGbG9hdDMsIGRzdDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgY29uc3QgaW52X2xlbmd0aCA9IDEuMCAvIHNyYy5sZW5ndGg7XG4gICAgICAgIGRzdC54ICo9IGludl9sZW5ndGg7XG4gICAgICAgIGRzdC55ICo9IGludl9sZW5ndGg7XG4gICAgICAgIGRzdC56ICo9IGludl9sZW5ndGg7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIE11bHRpcGx5KGE6IEZsb2F0MywgbjogbnVtYmVyLCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGRzdC54ID0gYS5lbGVtZW50c1swXSAqIG47XG4gICAgICAgIGRzdC55ID0gYS5lbGVtZW50c1sxXSAqIG47XG4gICAgICAgIGRzdC56ID0gYS5lbGVtZW50c1syXSAqIG47XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIE11bHRpcGx5RmxvYXQzKGE6IEZsb2F0MywgYjogRmxvYXQzLCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGRzdC54ID0gYS5lbGVtZW50c1swXSAqIGIueDtcbiAgICAgICAgZHN0LnkgPSBhLmVsZW1lbnRzWzFdICogYi55O1xuICAgICAgICBkc3QueiA9IGEuZWxlbWVudHNbMl0gKiBiLno7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIEFwcGx5UXVhdGVybmlvbihhOiBGbG9hdDMsIHE6IFF1YXRlcm5pb24sIGRzdD86IEZsb2F0Mykge1xuICAgICAgICBkc3QgPSBkc3QgPz8gbmV3IEZsb2F0MygpO1xuICAgICAgICBjb25zdCB4ID0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgY29uc3QgeSA9IGEuZWxlbWVudHNbMV07XG4gICAgICAgIGNvbnN0IHogPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICBjb25zdCBxeCA9IHEueDtcbiAgICAgICAgY29uc3QgcXkgPSBxLnk7XG4gICAgICAgIGNvbnN0IHF6ID0gcS56O1xuICAgICAgICBjb25zdCBxdyA9IHEudztcbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWN0b3JcblxuICAgICAgICBjb25zdCBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeTtcbiAgICAgICAgY29uc3QgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHo7XG4gICAgICAgIGNvbnN0IGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4O1xuICAgICAgICBjb25zdCBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgICAgICBkc3QueCA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gICAgICAgIGRzdC55ID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgICAgICAgZHN0LnogPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBEb3QoYTogRmxvYXQzLCBiOiBGbG9hdDMpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gYS5lbGVtZW50c1swXSAqIGIueCArIGEuZWxlbWVudHNbMV0gKiBiLnkgKyBhLmVsZW1lbnRzWzJdICogYi56O1xuICAgIH1cblxuICAgIHN0YXRpYyBDcm9zcyhhOiBGbG9hdDMsIGI6IEZsb2F0MywgZHN0OiBGbG9hdDMgPSBuZXcgRmxvYXQzKCkpOiBGbG9hdDMge1xuICAgICAgICBjb25zdCBheCA9IGEuZWxlbWVudHNbMF07XG4gICAgICAgIGNvbnN0IGF5ID0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgY29uc3QgYXogPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICBjb25zdCBieCA9IGIueDtcbiAgICAgICAgY29uc3QgYnkgPSBiLnk7XG4gICAgICAgIGNvbnN0IGJ6ID0gYi56O1xuXG4gICAgICAgIGRzdC54ID0gYXkgKiBieiAtIGF6ICogYnk7XG4gICAgICAgIGRzdC55ID0gYXogKiBieCAtIGF4ICogYno7XG4gICAgICAgIGRzdC56ID0gYXggKiBieSAtIGF5ICogYng7XG5cbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRnJvbVNwaGVyaWNhbChzOiBTcGhlcmljYWwsIGRzdDogRmxvYXQzID0gbmV3IEZsb2F0MygpKTogRmxvYXQzIHtcbiAgICAgICAgY29uc3Qgc2luUmFkaXVzID0gTWF0aC5zaW4ocy50aGV0YSkgKiBzLnJhZGl1cztcbiAgICAgICAgZHN0LnggPSBzaW5SYWRpdXMgKiBNYXRoLnNpbihzLnBoaSk7XG4gICAgICAgIGRzdC55ID0gTWF0aC5jb3Mocy50aGV0YSkgKiBzLnJhZGl1cztcbiAgICAgICAgZHN0LnogPSBzaW5SYWRpdXMgKiBNYXRoLmNvcyhzLnBoaSk7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIExlcnAoYTogRmxvYXQzLCBiOiBGbG9hdDMsIGk6IG51bWJlciwgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QueCA9IGxlcnAoYS5lbGVtZW50c1swXSwgYi54LCBpKTtcbiAgICAgICAgZHN0LnkgPSBsZXJwKGEuZWxlbWVudHNbMV0sIGIueSwgaSk7XG4gICAgICAgIGRzdC56ID0gbGVycChhLmVsZW1lbnRzWzJdLCBiLnosIGkpO1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBBZGRNdWx0aXBsaWVkKGE6IEZsb2F0MywgYjogRmxvYXQzLCBuOiBudW1iZXIsIGRzdDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgZHN0LnggPSBhLmVsZW1lbnRzWzBdICsgYi54ICogbjtcbiAgICAgICAgZHN0LnkgPSBhLmVsZW1lbnRzWzFdICsgYi55ICogbjtcbiAgICAgICAgZHN0LnogPSBhLmVsZW1lbnRzWzJdICsgYi56ICogbjtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTXVsdGlwbHlNYXQ0KGE6IEZsb2F0MywgbTogTWF0NCwgZHN0OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBjb25zdCB4ID0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgY29uc3QgeSA9IGEuZWxlbWVudHNbMV07XG4gICAgICAgIGNvbnN0IHogPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICBjb25zdCBlID0gbS5lbGVtZW50cztcbiAgICAgICAgY29uc3QgdyA9IDEgLyAoZVszXSAqIHggKyBlWzddICogeSArIGVbMTFdICogeiArIGVbMTVdKTtcblxuICAgICAgICBkc3QueCA9IChlWzBdICogeCArIGVbNF0gKiB5ICsgZVs4XSAqIHogKyBlWzEyXSkgKiB3O1xuICAgICAgICBkc3QueSA9IChlWzFdICogeCArIGVbNV0gKiB5ICsgZVs5XSAqIHogKyBlWzEzXSkgKiB3O1xuICAgICAgICBkc3QueiA9IChlWzJdICogeCArIGVbNl0gKiB5ICsgZVsxMF0gKiB6ICsgZVsxNF0pICogdztcblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBNdWx0aXBseU1hdDMoYTogRmxvYXQzLCBtOiBNYXQzLCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGNvbnN0IHggPSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCB5ID0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgY29uc3QgeiA9IGEuZWxlbWVudHNbMl07XG4gICAgICAgIGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG4gICAgICAgIGRzdC54ID0gZVswXSAqIHggKyBlWzNdICogeSArIGVbNl0gKiB6O1xuICAgICAgICBkc3QueSA9IGVbMV0gKiB4ICsgZVs0XSAqIHkgKyBlWzddICogejtcbiAgICAgICAgZHN0LnogPSBlWzJdICogeCArIGVbNV0gKiB5ICsgZVs4XSAqIHo7XG5cbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTXVsdGlwbHlNYXQ0RGlyZWN0aW9uYWwoYTogRmxvYXQzLCBtOiBNYXQ0LCBkc3Q6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGNvbnN0IHggPSBhLmVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCB5ID0gYS5lbGVtZW50c1sxXTtcbiAgICAgICAgY29uc3QgeiA9IGEuZWxlbWVudHNbMl07XG4gICAgICAgIGNvbnN0IGUgPSBtLmVsZW1lbnRzO1xuXG4gICAgICAgIGRzdC54ID0gZVswXSAqIHggKyBlWzRdICogeSArIGVbOF0gKiB6O1xuICAgICAgICBkc3QueSA9IGVbMV0gKiB4ICsgZVs1XSAqIHkgKyBlWzldICogejtcbiAgICAgICAgZHN0LnogPSBlWzJdICogeCArIGVbNl0gKiB5ICsgZVsxMF0gKiB6O1xuXG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgWkVSTyA9IG5ldyBGbG9hdDMoMCwgMCwgMCk7XG5leHBvcnQgY29uc3QgT05FID0gbmV3IEZsb2F0MygxLCAxLCAxKTtcbmV4cG9ydCBjb25zdCBYID0gbmV3IEZsb2F0MygxLCAwLCAwKTtcbmV4cG9ydCBjb25zdCBZID0gbmV3IEZsb2F0MygwLCAxLCAwKTtcbmV4cG9ydCBjb25zdCBaID0gbmV3IEZsb2F0MygwLCAwLCAxKTtcbmV4cG9ydCBjb25zdCBORUdBVElWRV9YID0gbmV3IEZsb2F0MygtMSwgMCwgMCk7XG5leHBvcnQgY29uc3QgTkVHQVRJVkVfWSA9IG5ldyBGbG9hdDMoMCwgLTEsIDApO1xuZXhwb3J0IGNvbnN0IE5FR0FUSVZFX1ogPSBuZXcgRmxvYXQzKDAsIDAsIC0xKTtcblxuZXhwb3J0IGNsYXNzIEZsb2F0NCBpbXBsZW1lbnRzIEhlYXBQb2ludGVyIHtcbiAgICBzaXplID0gNDtcbiAgICBlbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoNCk7XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF07XG4gICAgfVxuICAgIHNldCB4KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgc2V0IHkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzJdO1xuICAgIH1cbiAgICBzZXQgeih2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbM107XG4gICAgfVxuICAgIHNldCB3KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1szXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHo6IG51bWJlciA9IDAsIHc6IG51bWJlciA9IDApIHtcbiAgICAgICAgdGhpcy5zZXQoeCwgeSwgeiwgdyk7XG4gICAgICAgIGZvb3RwcmludF9hbGxvYyg0KTtcbiAgICB9XG5cbiAgICByZWFkKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IGJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gYnVmZmVyW29mZnNldCArIDFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gYnVmZmVyW29mZnNldCArIDJdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gYnVmZmVyW29mZnNldCArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB3cml0ZShidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIGJ1ZmZlcltvZmZzZXRdID0gdGhpcy5lbGVtZW50c1swXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDFdID0gdGhpcy5lbGVtZW50c1sxXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDJdID0gdGhpcy5lbGVtZW50c1syXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDNdID0gdGhpcy5lbGVtZW50c1szXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcik6IEZsb2F0NCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSB4O1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0geTtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IHo7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSB3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KGE6IEZsb2F0NCk6IEZsb2F0NCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMuc2V0KGEuZWxlbWVudHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0KG06IE1hdDQpOiBGbG9hdDQge1xuICAgICAgICByZXR1cm4gRmxvYXQ0Lk11bHRpcGx5TWF0NCh0aGlzLCBtLCB0aGlzKTtcbiAgICB9XG5cbiAgICBjbG9uZSgpOiBGbG9hdDQge1xuICAgICAgICByZXR1cm4gbmV3IEZsb2F0NCh0aGlzLmVsZW1lbnRzWzBdLCB0aGlzLmVsZW1lbnRzWzFdLCB0aGlzLmVsZW1lbnRzWzJdLCB0aGlzLmVsZW1lbnRzWzNdKTtcbiAgICB9XG5cbiAgICBhbGxfemVybygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0gPT09IDAgJiYgdGhpcy5lbGVtZW50c1sxXSA9PT0gMCAmJiB0aGlzLmVsZW1lbnRzWzJdID09PSAwICYmIHRoaXMuZWxlbWVudHNbM10gPT09IDA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBbJHt0aGlzLmVsZW1lbnRzWzBdfSwgJHt0aGlzLmVsZW1lbnRzWzFdfSwgJHt0aGlzLmVsZW1lbnRzWzJdfSwgJHt0aGlzLmVsZW1lbnRzWzNdfV1gO1xuICAgIH1cblxuICAgIG11bChuOiBudW1iZXIpOiBGbG9hdDQge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKj0gbjtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSAqPSBuO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdICo9IG47XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGxlcnAoYjogRmxvYXQ0LCBmOiBudW1iZXIpOiB0aGlzIHtcbiAgICAgICAgRmxvYXQ0LkxlcnAodGhpcywgYiwgZiwgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXRpYyBMZXJwKGE6IEZsb2F0NCwgYjogRmxvYXQ0LCBmOiBudW1iZXIsIGRzdDogRmxvYXQ0KTogRmxvYXQ0IHtcbiAgICAgICAgZHN0LnggPSBsZXJwKGEueCwgYi54LCBmKTtcbiAgICAgICAgZHN0LnkgPSBsZXJwKGEueSwgYi55LCBmKTtcbiAgICAgICAgZHN0LnkgPSBsZXJwKGEueiwgYi56LCBmKTtcbiAgICAgICAgZHN0LnkgPSBsZXJwKGEudywgYi53LCBmKTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTXVsdGlwbHlNYXQ0KGE6IEZsb2F0NCwgbTogTWF0NCwgZHN0OiBGbG9hdDQpOiBGbG9hdDQge1xuICAgICAgICBjb25zdCB4ID0gYS5lbGVtZW50c1swXTtcbiAgICAgICAgY29uc3QgeSA9IGEuZWxlbWVudHNbMV07XG4gICAgICAgIGNvbnN0IHogPSBhLmVsZW1lbnRzWzJdO1xuICAgICAgICBjb25zdCB3ID0gYS5lbGVtZW50c1szXTtcbiAgICAgICAgY29uc3QgZSA9IG0uZWxlbWVudHM7XG5cbiAgICAgICAgZHN0LnggPSBlWzBdICogeCArIGVbNF0gKiB5ICsgZVs4XSAqIHogKyBlWzEyXSAqIHc7XG4gICAgICAgIGRzdC55ID0gZVsxXSAqIHggKyBlWzVdICogeSArIGVbOV0gKiB6ICsgZVsxM10gKiB3O1xuICAgICAgICBkc3QueiA9IGVbMl0gKiB4ICsgZVs2XSAqIHkgKyBlWzEwXSAqIHogKyBlWzE0XSAqIHc7XG4gICAgICAgIGRzdC53ID0gZVszXSAqIHggKyBlWzddICogeSArIGVbMTFdICogeiArIGVbMTVdICogdztcblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuL3NpbWQnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4vc2ltZF9tYXQnO1xuXG5jb25zdCBwb2ludHMgPSBbbmV3IEZsb2F0MygpLCBuZXcgRmxvYXQzKCksIG5ldyBGbG9hdDMoKSwgbmV3IEZsb2F0MygpLCBuZXcgRmxvYXQzKCksIG5ldyBGbG9hdDMoKSwgbmV3IEZsb2F0MygpLCBuZXcgRmxvYXQzKCldO1xuZXhwb3J0IGNsYXNzIEJveDMge1xuICAgIGNvbnN0cnVjdG9yKG1pbj86IEZsb2F0MywgbWF4PzogRmxvYXQzKSB7XG4gICAgICAgIGlmIChtaW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5taW4uY29weShtaW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5taW4uc2V0KE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5tYXguY29weShtYXgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tYXguc2V0KC1OdW1iZXIuTUFYX1ZBTFVFLCAtTnVtYmVyLk1BWF9WQUxVRSwgLU51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbWluOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG4gICAgbWF4OiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5cbiAgICBwcml2YXRlIF9zaXplOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG4gICAgcHJpdmF0ZSBfY2VudGVyOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5cbiAgICBnZXQgc2l6ZSgpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2l6ZS5jb3B5KHRoaXMubWF4KS5zdWIodGhpcy5taW4pIGFzIEZsb2F0MztcbiAgICB9XG5cbiAgICBnZXQgY2VudGVyKCk6IEZsb2F0MyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jZW50ZXIuY29weSh0aGlzLnNpemUpLm11bCgwLjUpLmFkZCh0aGlzLm1pbikgYXMgRmxvYXQzO1xuICAgIH1cblxuICAgIHNldChtaW46IEZsb2F0MywgbWF4OiBGbG9hdDMpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5taW4uY29weShtaW4pO1xuICAgICAgICB0aGlzLm1heC5jb3B5KG1heCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkoYTogQm94Myk6IHRoaXMge1xuICAgICAgICB0aGlzLm1pbi5jb3B5KGEubWluKTtcbiAgICAgICAgdGhpcy5tYXguY29weShhLm1heCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb25lKCk6IEJveDMge1xuICAgICAgICByZXR1cm4gbmV3IEJveDModGhpcy5taW4sIHRoaXMubWF4KTtcbiAgICB9XG5cbiAgICByZXNldCgpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5taW4uc2V0KE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUsIE51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgICB0aGlzLm1heC5zZXQoLU51bWJlci5NQVhfVkFMVUUsIC1OdW1iZXIuTUFYX1ZBTFVFLCAtTnVtYmVyLk1BWF9WQUxVRSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGV4cGFuZF9wb2ludChwb2ludDogRmxvYXQzKTogdGhpcyB7XG4gICAgICAgIHRoaXMubWluLm1pbihwb2ludCk7XG4gICAgICAgIHRoaXMubWF4Lm1heChwb2ludCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnRhaW5zX3BvaW50KHBvaW50OiBGbG9hdDMpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHBvaW50LnggPj0gdGhpcy5taW4ueCAmJiBwb2ludC54IDw9IHRoaXMubWF4LnggJiYgcG9pbnQueSA+PSB0aGlzLm1pbi55ICYmIHBvaW50LnkgPD0gdGhpcy5tYXgueSAmJiBwb2ludC56ID49IHRoaXMubWluLnogJiYgcG9pbnQueiA8PSB0aGlzLm1heC56O1xuICAgIH1cblxuICAgIGV4cGFuZF9ib3goYm94OiBCb3gzKTogdGhpcyB7XG4gICAgICAgIHRoaXMubWluLm1pbihib3gubWluKTtcbiAgICAgICAgdGhpcy5tYXgubWF4KGJveC5tYXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb250YWluc19ib3goYm94OiBCb3gzKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbi54IDw9IGJveC5taW4ueCAmJiB0aGlzLm1heC54ID49IGJveC5tYXgueCAmJiB0aGlzLm1pbi55IDw9IGJveC5taW4ueSAmJiB0aGlzLm1heC55ID49IGJveC5tYXgueSAmJiB0aGlzLm1pbi56IDw9IGJveC5taW4ueiAmJiB0aGlzLm1heC56ID49IGJveC5tYXguejtcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0KG06IE1hdDQpOiBCb3gzIHtcbiAgICAgICAgLy8gdXNpbmcgYSBiaW5hcnkgcGF0dGVybiB0byBzcGVjaWZ5IGFsbCAyXjMgY29tYmluYXRpb25zIGJlbG93XG4gICAgICAgIHBvaW50c1swXS5zZXQodGhpcy5taW4ueCwgdGhpcy5taW4ueSwgdGhpcy5taW4ueikuYXBwbHlfbWF0NChtKTsgLy8gMDAwXG4gICAgICAgIHBvaW50c1sxXS5zZXQodGhpcy5taW4ueCwgdGhpcy5taW4ueSwgdGhpcy5tYXgueikuYXBwbHlfbWF0NChtKTsgLy8gMDAxXG4gICAgICAgIHBvaW50c1syXS5zZXQodGhpcy5taW4ueCwgdGhpcy5tYXgueSwgdGhpcy5taW4ueikuYXBwbHlfbWF0NChtKTsgLy8gMDEwXG4gICAgICAgIHBvaW50c1szXS5zZXQodGhpcy5taW4ueCwgdGhpcy5tYXgueSwgdGhpcy5tYXgueikuYXBwbHlfbWF0NChtKTsgLy8gMDExXG4gICAgICAgIHBvaW50c1s0XS5zZXQodGhpcy5tYXgueCwgdGhpcy5taW4ueSwgdGhpcy5taW4ueikuYXBwbHlfbWF0NChtKTsgLy8gMTAwXG4gICAgICAgIHBvaW50c1s1XS5zZXQodGhpcy5tYXgueCwgdGhpcy5taW4ueSwgdGhpcy5tYXgueikuYXBwbHlfbWF0NChtKTsgLy8gMTAxXG4gICAgICAgIHBvaW50c1s2XS5zZXQodGhpcy5tYXgueCwgdGhpcy5tYXgueSwgdGhpcy5taW4ueikuYXBwbHlfbWF0NChtKTsgLy8gMTEwXG4gICAgICAgIHBvaW50c1s3XS5zZXQodGhpcy5tYXgueCwgdGhpcy5tYXgueSwgdGhpcy5tYXgueikuYXBwbHlfbWF0NChtKTsgLy8gMTExXG5cbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRfcG9pbnQocG9pbnRzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdyaXRlKGJ1ZmZlcjogRmxvYXQzMkFycmF5LCBvZmZzZXQ6IG51bWJlciA9IDApOiBCb3gzIHtcbiAgICAgICAgdGhpcy5taW4ud3JpdGUoYnVmZmVyLCBvZmZzZXQpO1xuICAgICAgICB0aGlzLm1heC53cml0ZShidWZmZXIsIG9mZnNldCArIDMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZWFkKGJ1ZmZlcjogRmxvYXQzMkFycmF5LCBvZmZzZXQ6IG51bWJlciA9IDApOiBCb3gzIHtcbiAgICAgICAgdGhpcy5taW4ucmVhZChidWZmZXIsIG9mZnNldCk7XG4gICAgICAgIHRoaXMubWF4LnJlYWQoYnVmZmVyLCBvZmZzZXQgKyAzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0X2NlbnRlcihjZW50ZXI6IEZsb2F0Myk6IEJveDMge1xuICAgICAgICBjb25zdCBzaXplID0gdGhpcy5zaXplO1xuXG4gICAgICAgIGNvbnN0IGhhbGZfeCA9IHNpemUueCAqIDAuNTtcbiAgICAgICAgY29uc3QgaGFsZl95ID0gc2l6ZS55ICogMC41O1xuICAgICAgICBjb25zdCBoYWxmX3ogPSBzaXplLnogKiAwLjU7XG5cbiAgICAgICAgdGhpcy5taW4ueCA9IGNlbnRlci54IC0gaGFsZl94O1xuICAgICAgICB0aGlzLm1pbi55ID0gY2VudGVyLnkgLSBoYWxmX3k7XG4gICAgICAgIHRoaXMubWluLnogPSBjZW50ZXIueiAtIGhhbGZfejtcblxuICAgICAgICB0aGlzLm1heC54ID0gY2VudGVyLnggKyBoYWxmX3g7XG4gICAgICAgIHRoaXMubWF4LnkgPSBjZW50ZXIueSArIGhhbGZfeTtcbiAgICAgICAgdGhpcy5tYXgueiA9IGNlbnRlci56ICsgaGFsZl96O1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldF9zaXplKHNpemU6IEZsb2F0Myk6IEJveDMge1xuICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLmNlbnRlcjtcbiAgICAgICAgY29uc3Qgc3ggPSBzaXplLnggKiAwLjU7XG4gICAgICAgIGNvbnN0IHN5ID0gc2l6ZS55ICogMC41O1xuICAgICAgICBjb25zdCBzeiA9IHNpemUueiAqIDAuNTtcblxuICAgICAgICB0aGlzLm1pbi54ID0gY2VudGVyLnggLSBzeDtcbiAgICAgICAgdGhpcy5taW4ueSA9IGNlbnRlci55IC0gc3k7XG4gICAgICAgIHRoaXMubWluLnogPSBjZW50ZXIueiAtIHN6O1xuXG4gICAgICAgIHRoaXMubWF4LnggPSBjZW50ZXIueCArIHN4O1xuICAgICAgICB0aGlzLm1heC55ID0gY2VudGVyLnkgKyBzeTtcbiAgICAgICAgdGhpcy5tYXgueiA9IGNlbnRlci56ICsgc3o7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IGludmFsaWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbi54ID09PSBJbmZpbml0eSB8fCB0aGlzLm1pbi55ID09PSBJbmZpbml0eSB8fCB0aGlzLm1pbi56ID09PSBJbmZpbml0eSB8fCB0aGlzLm1heC54ID09PSAtSW5maW5pdHkgfHwgdGhpcy5tYXgueSA9PT0gLUluZmluaXR5IHx8IHRoaXMubWF4LnogPT09IC1JbmZpbml0eTtcbiAgICB9XG5cbiAgICBzdGF0aWMgT3ZlcmxhcHBlZChhOiBCb3gzLCBiOiBCb3gzKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBvdmVybGFwID0gdHJ1ZTtcbiAgICAgICAgb3ZlcmxhcCA9IGEubWluLnggPiBiLm1heC54IHx8IGEubWF4LnggPCBiLm1pbi54ID8gZmFsc2UgOiBvdmVybGFwO1xuICAgICAgICBvdmVybGFwID0gYS5taW4ueSA+IGIubWF4LnkgfHwgYS5tYXgueSA8IGIubWluLnkgPyBmYWxzZSA6IG92ZXJsYXA7XG4gICAgICAgIG92ZXJsYXAgPSBhLm1pbi56ID4gYi5tYXgueiB8fCBhLm1heC56IDwgYi5taW4ueiA/IGZhbHNlIDogb3ZlcmxhcDtcbiAgICAgICAgcmV0dXJuIG92ZXJsYXA7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IFR5cGVkQXJyYXkgfSBmcm9tICcuLi9zdGQvdHlwZSc7XG5pbXBvcnQgeyBjbGFtcCB9IGZyb20gJy4vbWF0aCc7XG5pbXBvcnQgeyBGbG9hdDMsIEZsb2F0NCB9IGZyb20gJy4vc2ltZCc7XG5cbmZ1bmN0aW9uIGNvbG9yX3RvX2hleChjOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGMgPSBjbGFtcChNYXRoLmNlaWwoYyAqIDI1NSksIDAsIDI1NSk7XG4gICAgaWYgKGMgPCAxNikgcmV0dXJuICcwJyArIGMudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiBjLnRvU3RyaW5nKDE2KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb2xvcjxUIGV4dGVuZHMgQ29sb3I8VD4+IHt9XG5cbmV4cG9ydCBlbnVtIENvbG9yTW9kZSB7XG4gICAgUkdCQSA9IDEsXG4gICAgSFNMLFxuICAgIEhTVixcbn1cblxuZXhwb3J0IGNsYXNzIENvbG9yUkdCQSBleHRlbmRzIEZsb2F0NCBpbXBsZW1lbnRzIENvbG9yPENvbG9yUkdCQT4ge1xuICAgIGdldCByKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXTtcbiAgICB9XG4gICAgc2V0IHIodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzFdO1xuICAgIH1cbiAgICBzZXQgZyh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgYigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMl07XG4gICAgfVxuICAgIHNldCBiKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCBhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1szXTtcbiAgICB9XG4gICAgc2V0IGEodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocjogbnVtYmVyID0gMCwgZzogbnVtYmVyID0gMCwgYjogbnVtYmVyID0gMCwgYTogbnVtYmVyID0gMSkge1xuICAgICAgICBzdXBlcihyLCBnLCBiLCBhKTtcbiAgICB9XG5cbiAgICBjb3B5KGNvbG9yOiBDb2xvclJHQkEpOiBDb2xvclJHQkEge1xuICAgICAgICBzdXBlci5jb3B5KGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2xvbmUoKTogQ29sb3JSR0JBIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvclJHQkEoKS5jb3B5KHRoaXMpO1xuICAgIH1cblxuICAgIHJlYWQoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gYnVmZmVyW29mZnNldF07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSBidWZmZXJbb2Zmc2V0ICsgMV07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSBidWZmZXJbb2Zmc2V0ICsgMl07XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSBidWZmZXJbb2Zmc2V0ICsgM107XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdyaXRlKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgYnVmZmVyW29mZnNldF0gPSB0aGlzLmVsZW1lbnRzWzBdO1xuICAgICAgICBidWZmZXJbb2Zmc2V0ICsgMV0gPSB0aGlzLmVsZW1lbnRzWzFdO1xuICAgICAgICBidWZmZXJbb2Zmc2V0ICsgMl0gPSB0aGlzLmVsZW1lbnRzWzJdO1xuICAgICAgICBidWZmZXJbb2Zmc2V0ICsgM10gPSB0aGlzLmVsZW1lbnRzWzNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRfaGV4X3N0cmluZyhoZXg6IHN0cmluZyk6IENvbG9yUkdCQSB7XG4gICAgICAgIGxldCBoID0gaGV4O1xuICAgICAgICBpZiAoIWgpIHJldHVybiB0aGlzO1xuICAgICAgICBpZiAoaFswXSA9PT0gJyMnKSBoID0gaC5zdWJzdHIoMSk7XG4gICAgICAgIGVsc2UgaWYgKGhbMF0gPT09ICcwJyAmJiBoWzFdID09PSAneCcpIGggPSBoLnN1YnN0cigyKTtcblxuICAgICAgICBpZiAoaC5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIHRoaXMuciA9IHBhcnNlSW50KGhbMF0sIDE2KSAvIDE1O1xuICAgICAgICAgICAgdGhpcy5nID0gcGFyc2VJbnQoaFsxXSwgMTYpIC8gMTU7XG4gICAgICAgICAgICB0aGlzLmIgPSBwYXJzZUludChoWzJdLCAxNikgLyAxNTtcbiAgICAgICAgICAgIHRoaXMuYSA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAoaC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgIHRoaXMuciA9IHBhcnNlSW50KGhbMF0sIDE2KSAvIDE1O1xuICAgICAgICAgICAgdGhpcy5nID0gcGFyc2VJbnQoaFsxXSwgMTYpIC8gMTU7XG4gICAgICAgICAgICB0aGlzLmIgPSBwYXJzZUludChoWzJdLCAxNikgLyAxNTtcbiAgICAgICAgICAgIHRoaXMuYSA9IHBhcnNlSW50KGhbM10sIDE2KSAvIDE1O1xuICAgICAgICB9IGVsc2UgaWYgKGgubGVuZ3RoID09PSA2KSB7XG4gICAgICAgICAgICB0aGlzLnIgPSBwYXJzZUludChoLnN1YnN0cigwLCAyKSwgMTYpIC8gMjU1O1xuICAgICAgICAgICAgdGhpcy5nID0gcGFyc2VJbnQoaC5zdWJzdHIoMiwgMiksIDE2KSAvIDI1NTtcbiAgICAgICAgICAgIHRoaXMuYiA9IHBhcnNlSW50KGguc3Vic3RyKDQsIDIpLCAxNikgLyAyNTU7XG4gICAgICAgICAgICB0aGlzLmEgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKGgubGVuZ3RoID09PSA4KSB7XG4gICAgICAgICAgICB0aGlzLnIgPSBwYXJzZUludChoLnN1YnN0cigwLCAyKSwgMTYpIC8gMjU1O1xuICAgICAgICAgICAgdGhpcy5nID0gcGFyc2VJbnQoaC5zdWJzdHIoMiwgMiksIDE2KSAvIDI1NTtcbiAgICAgICAgICAgIHRoaXMuYiA9IHBhcnNlSW50KGguc3Vic3RyKDQsIDIpLCAxNikgLyAyNTU7XG4gICAgICAgICAgICB0aGlzLmEgPSBwYXJzZUludChoLnN1YnN0cig2LCAyKSwgMTYpIC8gMjU1O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgYGludmFsaWQgaGV4IHZhbHVlICR7aGV4fWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRfaGV4KGhleDogbnVtYmVyKTogQ29sb3JSR0JBIHtcbiAgICAgICAgaWYgKGhleCA+IDB4ZmZmZmZmKSB7XG4gICAgICAgICAgICB0aGlzLnIgPSAoKGhleCAmIDB4ZmYwMDAwMDApID4+PiAyNCkgLyAyNTUuMDtcbiAgICAgICAgICAgIHRoaXMuZyA9ICgoaGV4ICYgMHhmZjAwMDApID4+PiAxNikgLyAyNTUuMDtcbiAgICAgICAgICAgIHRoaXMuYiA9ICgoaGV4ICYgMHhmZjAwKSA+Pj4gOCkgLyAyNTUuMDtcbiAgICAgICAgICAgIHRoaXMuYSA9IChoZXggJiAweGZmKSAvIDI1NS4wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yID0gKChoZXggJiAweGZmMDAwMCkgPj4+IDE2KSAvIDI1NS4wO1xuICAgICAgICAgICAgdGhpcy5nID0gKChoZXggJiAweGZmMDApID4+PiA4KSAvIDI1NS4wO1xuICAgICAgICAgICAgdGhpcy5iID0gKGhleCAmIDB4ZmYpIC8gMjU1LjA7XG4gICAgICAgICAgICB0aGlzLmEgPSAxLjA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9faGV4KCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHIgPSAoKHRoaXMuciAqIDI1NS4wKSAmIDB4ZmYpIDw8IDI0O1xuICAgICAgICBjb25zdCBnID0gKCh0aGlzLmcgKiAyNTUuMCkgJiAweGZmKSA8PCAxNjtcbiAgICAgICAgY29uc3QgYiA9ICgodGhpcy5iICogMjU1LjApICYgMHhmZikgPDwgODtcbiAgICAgICAgY29uc3QgYSA9ICh0aGlzLmEgKiAyNTUuMCkgJiAweGZmO1xuICAgICAgICByZXR1cm4gciB8IGcgfCBiIHwgYTtcbiAgICB9XG5cbiAgICB0b19oZXhfc3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gY29sb3JfdG9faGV4KHRoaXMucikgKyBjb2xvcl90b19oZXgodGhpcy5nKSArIGNvbG9yX3RvX2hleCh0aGlzLmIpICsgY29sb3JfdG9faGV4KHRoaXMuYSk7XG4gICAgfVxuXG4gICAgc2V0X3JnYmFfYnl0ZShyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyLCBhOiBudW1iZXIpOiBDb2xvclJHQkEge1xuICAgICAgICB0aGlzLnIgPSByIC8gMjU1LjA7XG4gICAgICAgIHRoaXMuZyA9IGcgLyAyNTUuMDtcbiAgICAgICAgdGhpcy5iID0gYiAvIDI1NS4wO1xuICAgICAgICB0aGlzLmEgPSBhIC8gMjU1LjA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvbmUoZjogbnVtYmVyKTogQ29sb3JSR0JBIHtcbiAgICAgICAgdGhpcy5yICo9IGY7XG4gICAgICAgIHRoaXMuZyAqPSBmO1xuICAgICAgICB0aGlzLmIgKj0gZjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9uZV9zY2FsYXIob2Zmc2V0OiBudW1iZXIpOiBDb2xvclJHQkEge1xuICAgICAgICB0aGlzLnIgKz0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmcgKz0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmIgKz0gb2Zmc2V0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tX2Zsb2F0MyhzcmM6IEZsb2F0Myk6IENvbG9yUkdCQSB7XG4gICAgICAgIHRoaXMuciA9IHNyYy54O1xuICAgICAgICB0aGlzLmcgPSBzcmMueTtcbiAgICAgICAgdGhpcy5iID0gc3JjLno7XG4gICAgICAgIHRoaXMuYSA9IDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21fZmxvYXQ0KHNyYzogRmxvYXQ0KTogQ29sb3JSR0JBIHtcbiAgICAgICAgdGhpcy5yID0gc3JjLng7XG4gICAgICAgIHRoaXMuZyA9IHNyYy55O1xuICAgICAgICB0aGlzLmIgPSBzcmMuejtcbiAgICAgICAgdGhpcy5hID0gc3JjLnc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvX2Zsb2F0Myhkc3Q/OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICBkc3QgPSBkc3QgPz8gbmV3IEZsb2F0MygpO1xuICAgICAgICBkc3QueCA9IHRoaXMucjtcbiAgICAgICAgZHN0LnkgPSB0aGlzLmc7XG4gICAgICAgIGRzdC56ID0gdGhpcy5iO1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHRvX2Zsb2F0NChkc3Q/OiBGbG9hdDQpOiBGbG9hdDQge1xuICAgICAgICBkc3QgPSBkc3QgPz8gbmV3IEZsb2F0NCgpO1xuICAgICAgICBkc3QueCA9IHRoaXMucjtcbiAgICAgICAgZHN0LnkgPSB0aGlzLmc7XG4gICAgICAgIGRzdC56ID0gdGhpcy5iO1xuICAgICAgICBkc3QudyA9IHRoaXMuYTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYFske3RoaXMucn0sICR7dGhpcy5nfSwgJHt0aGlzLmJ9LCAke3RoaXMuYX1dYDtcbiAgICB9XG5cbiAgICB0b0pTT04oKTogbnVtYmVyW10ge1xuICAgICAgICByZXR1cm4gW3RoaXMuciwgdGhpcy5nLCB0aGlzLmIsIHRoaXMuYV07XG4gICAgfVxuXG4gICAgdG9fYXJyYXkoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB0aGlzLmFdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbG9ySFNMIGV4dGVuZHMgRmxvYXQzIGltcGxlbWVudHMgQ29sb3I8Q29sb3JIU0w+IHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgaHVlID0gMCwgcHVibGljIHNhdHVyYXRpb24gPSAwLCBwdWJsaWMgbGlnaHRuZXNzID0gMSkge1xuICAgICAgICBzdXBlcihodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcyk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBbJHt0aGlzLmh1ZX0sICR7dGhpcy5zYXR1cmF0aW9ufSwgJHt0aGlzLmxpZ2h0bmVzc31dYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb2xvckhTViBleHRlbmRzIEZsb2F0MyBpbXBsZW1lbnRzIENvbG9yPENvbG9ySFNWPiB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGh1ZSA9IDAsIHB1YmxpYyBzYXR1cmF0aW9uID0gMCwgcHVibGljIHZhbHVlID0gMSkge1xuICAgICAgICBzdXBlcihodWUsIHNhdHVyYXRpb24sIHZhbHVlKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYFske3RoaXMuaHVlfSwgJHt0aGlzLnNhdHVyYXRpb259LCAke3RoaXMudmFsdWV9XWA7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sb3JfcmdiYV90b19oc2woc3JjOiBDb2xvclJHQkEsIGRzdD86IENvbG9ySFNMKTogQ29sb3JIU0wge1xuICAgIGNvbnN0IHIgPSBzcmMucjtcbiAgICBjb25zdCBnID0gc3JjLmc7XG4gICAgY29uc3QgYiA9IHNyYy5iO1xuXG4gICAgY29uc3QgbWF4ID0gTWF0aC5tYXgociwgZywgYik7XG4gICAgY29uc3QgbWluID0gTWF0aC5taW4ociwgZywgYik7XG4gICAgbGV0IGggPSAwO1xuICAgIGxldCBzID0gMDtcbiAgICBsZXQgbCA9IChtYXggKyBtaW4pICogMC41O1xuICAgIGlmIChtYXggPT09IG1pbikge1xuICAgICAgICBoID0gcyA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZCA9IG1heCAtIG1pbjtcbiAgICAgICAgcyA9IGwgPiAwLjUgPyBkIC8gKDIgLSBtYXggLSBtaW4pIDogZCAvIChtYXggKyBtaW4pO1xuICAgICAgICBzd2l0Y2ggKG1heCkge1xuICAgICAgICAgICAgY2FzZSByOlxuICAgICAgICAgICAgICAgIGggPSAoZyAtIGIpIC8gZCArIChnIDwgYiA/IDYgOiAwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZzpcbiAgICAgICAgICAgICAgICBoID0gKGIgLSByKSAvIGQgKyAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBiOlxuICAgICAgICAgICAgICAgIGggPSAociAtIGcpIC8gZCArIDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaCAvPSA2O1xuICAgIH1cbiAgICBkc3QgPSBkc3QgPz8gbmV3IENvbG9ySFNMKCk7XG4gICAgZHN0Lmh1ZSA9IGg7XG4gICAgZHN0LnNhdHVyYXRpb24gPSBzO1xuICAgIGRzdC5saWdodG5lc3MgPSBsO1xuICAgIHJldHVybiBkc3Q7XG59XG5cbmZ1bmN0aW9uIGh1ZTJyZ2IocDogbnVtYmVyLCBxOiBudW1iZXIsIHQ6IG51bWJlcikge1xuICAgIGlmICh0IDwgMCkgdCArPSAxO1xuICAgIGlmICh0ID4gMSkgdCAtPSAxO1xuICAgIGlmICh0IDwgMSAvIDYpIHJldHVybiBwICsgKHEgLSBwKSAqIDYgKiB0O1xuICAgIGlmICh0IDwgMSAvIDIpIHJldHVybiBxO1xuICAgIGlmICh0IDwgMiAvIDMpIHJldHVybiBwICsgKHEgLSBwKSAqICgyIC8gMyAtIHQpICogNjtcbiAgICByZXR1cm4gcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbG9yX2hzbF90b19yZ2JhKHNyYzogQ29sb3JIU0wsIGRzdD86IENvbG9yUkdCQSk6IENvbG9yUkdCQSB7XG4gICAgbGV0IHIgPSAwO1xuICAgIGxldCBnID0gMDtcbiAgICBsZXQgYiA9IDA7XG4gICAgY29uc3QgcyA9IHNyYy5zYXR1cmF0aW9uO1xuICAgIGNvbnN0IGggPSBzcmMuaHVlO1xuICAgIGNvbnN0IGwgPSBzcmMubGlnaHRuZXNzO1xuXG4gICAgaWYgKHMgPT09IDApIHtcbiAgICAgICAgciA9IGcgPSBiID0gbDsgLy8gYWNocm9tYXRpY1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgICAgbGV0IHAgPSAyICogbCAtIHE7XG4gICAgICAgIHIgPSBodWUycmdiKHAsIHEsIGggKyAxIC8gMyk7XG4gICAgICAgIGcgPSBodWUycmdiKHAsIHEsIGgpO1xuICAgICAgICBiID0gaHVlMnJnYihwLCBxLCBoIC0gMSAvIDMpO1xuICAgIH1cbiAgICBkc3QgPSBkc3QgPz8gbmV3IENvbG9yUkdCQSgpO1xuICAgIGRzdC5yID0gcjtcbiAgICBkc3QuZyA9IGc7XG4gICAgZHN0LmIgPSBiO1xuICAgIHJldHVybiBkc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xvcl9oc3ZfdG9fcmdiYShzcmM6IENvbG9ySFNWLCBkc3Q/OiBDb2xvclJHQkEpOiBDb2xvclJHQkEge1xuICAgIGNvbnN0IGggPSBzcmMuaHVlO1xuICAgIGNvbnN0IHMgPSBzcmMuc2F0dXJhdGlvbjtcbiAgICBjb25zdCB2ID0gc3JjLnZhbHVlO1xuXG4gICAgY29uc3QgaSA9IE1hdGguZmxvb3IoaCAqIDYpO1xuICAgIGNvbnN0IGYgPSBoICogNiAtIGk7XG4gICAgY29uc3QgcCA9IHYgKiAoMSAtIHMpO1xuICAgIGNvbnN0IHEgPSB2ICogKDEgLSBmICogcyk7XG4gICAgY29uc3QgdCA9IHYgKiAoMSAtICgxIC0gZikgKiBzKTtcblxuICAgIGxldCByID0gMDtcbiAgICBsZXQgZyA9IDA7XG4gICAgbGV0IGIgPSAwO1xuXG4gICAgc3dpdGNoIChpICUgNikge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByID0gdjtcbiAgICAgICAgICAgIGcgPSB0O1xuICAgICAgICAgICAgYiA9IHA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgciA9IHE7XG4gICAgICAgICAgICBnID0gdjtcbiAgICAgICAgICAgIGIgPSBwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHIgPSBwO1xuICAgICAgICAgICAgZyA9IHY7XG4gICAgICAgICAgICBiID0gdDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByID0gcDtcbiAgICAgICAgICAgIGcgPSBxO1xuICAgICAgICAgICAgYiA9IHY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgciA9IHQ7XG4gICAgICAgICAgICBnID0gcDtcbiAgICAgICAgICAgIGIgPSB2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIHIgPSB2O1xuICAgICAgICAgICAgZyA9IHA7XG4gICAgICAgICAgICBiID0gcTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGRzdCA9IGRzdCA/PyBuZXcgQ29sb3JSR0JBKCk7XG4gICAgZHN0LnIgPSByO1xuICAgIGRzdC5nID0gZztcbiAgICBkc3QuYiA9IGI7XG4gICAgcmV0dXJuIGRzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbG9yX3JnYmFfdG9faHN2KHNyYzogQ29sb3JSR0JBLCBkc3Q/OiBDb2xvckhTVik6IENvbG9ySFNWIHtcbiAgICBjb25zdCByID0gc3JjLnI7XG4gICAgY29uc3QgZyA9IHNyYy5nO1xuICAgIGNvbnN0IGIgPSBzcmMuYjtcblxuICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKHIsIGcsIGIpO1xuICAgIGxldCBoID0gMDtcbiAgICBjb25zdCB2ID0gbWF4O1xuICAgIGNvbnN0IGQgPSBtYXggLSBtaW47XG4gICAgY29uc3QgcyA9IG1heCA9PT0gMCA/IDAgOiBkIC8gbWF4O1xuXG4gICAgaWYgKG1heCA9PT0gbWluKSB7XG4gICAgICAgIGggPSAwOyAvLyBhY2hyb21hdGljXG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoIChtYXgpIHtcbiAgICAgICAgICAgIGNhc2UgcjpcbiAgICAgICAgICAgICAgICBoID0gKGcgLSBiKSAvIGQgKyAoZyA8IGIgPyA2IDogMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGc6XG4gICAgICAgICAgICAgICAgaCA9IChiIC0gcikgLyBkICsgMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgYjpcbiAgICAgICAgICAgICAgICBoID0gKHIgLSBnKSAvIGQgKyA0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaCAvPSA2O1xuICAgIH1cblxuICAgIGRzdCA9IGRzdCA/PyBuZXcgQ29sb3JIU1YoKTtcbiAgICBkc3QuaHVlID0gaDtcbiAgICBkc3Quc2F0dXJhdGlvbiA9IHM7XG4gICAgZHN0LnZhbHVlID0gdjtcbiAgICByZXR1cm4gZHN0O1xufVxuIiwgImltcG9ydCB7IHBvb2xfZ2V0LCBwb29sX3JldHVybiB9IGZyb20gJy4uL2FkdCc7XG5pbXBvcnQgeyBmb290cHJpbnRfYWxsb2MgfSBmcm9tICcuLi9tZW1vcnkvZm9vdHByaW50JztcbmltcG9ydCB7IEhlYXBQb2ludGVyIH0gZnJvbSAnLi4vbWVtb3J5L2hlYXBfcG9pbnRlcic7XG5pbXBvcnQgeyBUeXBlZEFycmF5IH0gZnJvbSAnLi4vc3RkL3R5cGUnO1xuaW1wb3J0IHsgRGVncmVlVG9SYWRpYW4gfSBmcm9tICcuL21hdGgnO1xuaW1wb3J0IHsgRmxvYXQzIH0gZnJvbSAnLi9zaW1kJztcbmltcG9ydCB7IFF1YXRlcm5pb24gfSBmcm9tICcuL3NpbWRfcXVhdGVybmlvbic7XG5cbmNvbnN0IHggPSBuZXcgRmxvYXQzKCk7XG5jb25zdCB5ID0gbmV3IEZsb2F0MygpO1xuY29uc3QgeiA9IG5ldyBGbG9hdDMoKTtcbmNvbnN0IHYgPSBuZXcgRmxvYXQzKCk7XG5jb25zdCBkZWZhdWx0X3VwID0gbmV3IEZsb2F0MygwLCAxLCAwKTtcblxuZXhwb3J0IGNsYXNzIE1hdDQgaW1wbGVtZW50cyBIZWFwUG9pbnRlciB7XG4gICAgc2l6ZSA9IDE2O1xuICAgIGVsZW1lbnRzID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xuICAgICAgICBmb290cHJpbnRfYWxsb2MoMTYpO1xuICAgIH1cblxuICAgIHJlYWQoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzW2ldID0gYnVmZmVyW29mZnNldCArIGldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHdyaXRlKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemU7ICsraSkge1xuICAgICAgICAgICAgYnVmZmVyW29mZnNldCArIGldID0gdGhpcy5lbGVtZW50c1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KGRzdDogTWF0NCk6IE1hdDQge1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnNldChkc3QuZWxlbWVudHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9uZSgpOiBNYXQ0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXQ0KCkuY29weSh0aGlzKTtcbiAgICB9XG5cbiAgICBpZGVudGl0eSgpOiBNYXQ0IHtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5zZXQoWzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDFdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0X3goeDogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgeC5yZWFkKHRoaXMuZWxlbWVudHMpO1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICBnZXRfeSh5OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICB5LnJlYWQodGhpcy5lbGVtZW50cywgNCk7XG4gICAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIGdldF96KHo6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIHoucmVhZCh0aGlzLmVsZW1lbnRzLCA4KTtcbiAgICAgICAgcmV0dXJuIHo7XG4gICAgfVxuXG4gICAgZ2V0X3codzogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgdy5yZWFkKHRoaXMuZWxlbWVudHMsIDEyKTtcbiAgICAgICAgcmV0dXJuIHc7XG4gICAgfVxuXG4gICAgc2V0X3goeDogRmxvYXQzKTogTWF0NCB7XG4gICAgICAgIHgud3JpdGUodGhpcy5lbGVtZW50cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldF95KHg6IEZsb2F0Myk6IE1hdDQge1xuICAgICAgICB4LndyaXRlKHRoaXMuZWxlbWVudHMsIDQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRfeih4OiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgeC53cml0ZSh0aGlzLmVsZW1lbnRzLCA4KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0X3coeDogRmxvYXQzKTogTWF0NCB7XG4gICAgICAgIHgud3JpdGUodGhpcy5lbGVtZW50cywgMTIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXQoXG4gICAgICAgIHh4OiBudW1iZXIsXG4gICAgICAgIHh5OiBudW1iZXIsXG4gICAgICAgIHh6OiBudW1iZXIsXG4gICAgICAgIHh3OiBudW1iZXIsXG4gICAgICAgIHl4OiBudW1iZXIsXG4gICAgICAgIHl5OiBudW1iZXIsXG4gICAgICAgIHl6OiBudW1iZXIsXG4gICAgICAgIHl3OiBudW1iZXIsXG4gICAgICAgIHp4OiBudW1iZXIsXG4gICAgICAgIHp5OiBudW1iZXIsXG4gICAgICAgIHp6OiBudW1iZXIsXG4gICAgICAgIHp3OiBudW1iZXIsXG4gICAgICAgIHd4OiBudW1iZXIsXG4gICAgICAgIHd5OiBudW1iZXIsXG4gICAgICAgIHd6OiBudW1iZXIsXG4gICAgICAgIHd3OiBudW1iZXJcbiAgICApOiBNYXQ0IHtcbiAgICAgICAgY29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgICB0ZVswXSA9IHh4O1xuICAgICAgICB0ZVsxXSA9IHh5O1xuICAgICAgICB0ZVsyXSA9IHh6O1xuICAgICAgICB0ZVszXSA9IHh3O1xuICAgICAgICB0ZVs0XSA9IHl4O1xuICAgICAgICB0ZVs1XSA9IHl5O1xuICAgICAgICB0ZVs2XSA9IHl6O1xuICAgICAgICB0ZVs3XSA9IHl3O1xuICAgICAgICB0ZVs4XSA9IHp4O1xuICAgICAgICB0ZVs5XSA9IHp5O1xuICAgICAgICB0ZVsxMF0gPSB6ejtcbiAgICAgICAgdGVbMTFdID0genc7XG4gICAgICAgIHRlWzEyXSA9IHd4O1xuICAgICAgICB0ZVsxM10gPSB3eTtcbiAgICAgICAgdGVbMTRdID0gd3o7XG4gICAgICAgIHRlWzE1XSA9IHd3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBsb29rX2F0KG9yaWdpbjogRmxvYXQzLCB0YXJnZXQ6IEZsb2F0MywgdXA/OiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgaWYgKHVwID09PSB1bmRlZmluZWQpIHVwID0gZGVmYXVsdF91cDtcblxuICAgICAgICB6LmNvcHkob3JpZ2luKS5zdWIodGFyZ2V0KTtcblxuICAgICAgICAvLyBvcmlnaW4gYW5kIHRhcmdldCBhcmUgaW4gdGhlIHNhbWUgcG9zaXRpb25cbiAgICAgICAgaWYgKHoueCA9PT0gMCAmJiB6LnkgPT09IDAgJiYgei56ID09PSAwKSB7XG4gICAgICAgICAgICB6LnogPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgei5ub3JtYWxpemUoKTtcbiAgICAgICAgRmxvYXQzLkNyb3NzKHVwLCB6LCB4KTtcblxuICAgICAgICAvLyB6IGFuZCB1cCBhcmUgcGFyYWxsZWxcbiAgICAgICAgaWYgKHgueCA9PT0gMCAmJiB4LnkgPT09IDAgJiYgeC56ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModXAueikgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB6LnggKz0gMC4wMDAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB6LnogKz0gMC4wMDAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgei5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIEZsb2F0My5Dcm9zcyh1cCwgeiwgeCk7XG4gICAgICAgIH1cblxuICAgICAgICB4Lm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgIEZsb2F0My5Dcm9zcyh6LCB4LCB5KTtcbiAgICAgICAgeS5ub3JtYWxpemUoKTtcblxuICAgICAgICBjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICAgIHRlWzBdID0geC54O1xuICAgICAgICB0ZVsxXSA9IHgueTtcbiAgICAgICAgdGVbMl0gPSB4Lno7XG5cbiAgICAgICAgdGVbNF0gPSB5Lng7XG4gICAgICAgIHRlWzVdID0geS55O1xuICAgICAgICB0ZVs2XSA9IHkuejtcblxuICAgICAgICB0ZVs4XSA9IHoueDtcbiAgICAgICAgdGVbOV0gPSB6Lnk7XG4gICAgICAgIHRlWzEwXSA9IHouejtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwZXJzcGVjdGl2ZSh2ZXJ0aWNhbF9mb3Y6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIsIHJldmVyc2VfZGVwdGg6IGJvb2xlYW4gPSBmYWxzZSk6IE1hdDQge1xuICAgICAgICBjb25zdCB0b3AgPSBuZWFyICogTWF0aC50YW4oRGVncmVlVG9SYWRpYW4gKiAwLjUgKiB2ZXJ0aWNhbF9mb3YpO1xuICAgICAgICBjb25zdCBib3R0b20gPSAtdG9wO1xuICAgICAgICBjb25zdCBsZWZ0ID0gdG9wICogYXNwZWN0O1xuICAgICAgICBjb25zdCByaWdodCA9IC1sZWZ0O1xuXG4gICAgICAgIGNvbnN0IGRlcHRoX3JhbmdlID0gZmFyIC0gbmVhcjtcbiAgICAgICAgY29uc3QgbjIgPSBuZWFyICogMjtcblxuICAgICAgICBjb25zdCB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICAgIHRlLmZpbGwoMCk7XG5cbiAgICAgICAgdGVbMF0gPSBuMiAvIChyaWdodCAtIGxlZnQpO1xuICAgICAgICB0ZVs1XSA9IG4yIC8gKHRvcCAtIGJvdHRvbSk7XG5cbiAgICAgICAgdGVbOF0gPSAocmlnaHQgKyBsZWZ0KSAvIChyaWdodCAtIGxlZnQpO1xuICAgICAgICB0ZVs5XSA9ICh0b3AgKyBib3R0b20pIC8gKHRvcCAtIGJvdHRvbSk7XG4gICAgICAgIHRlWzEwXSA9IC0oZmFyIC8gZGVwdGhfcmFuZ2UpO1xuXG4gICAgICAgIHRlWzE0XSA9IG5lYXIgKiB0ZVsxMF07XG4gICAgICAgIHRlWzExXSA9IC0xO1xuXG4gICAgICAgIGlmIChyZXZlcnNlX2RlcHRoKSB7XG4gICAgICAgICAgICB0ZVsxNF0gPSAtdGVbMTRdO1xuICAgICAgICAgICAgdGVbMTBdID0gLXRlWzEwXSAtIDEuMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG9ydGhvZ3JhcGhpY3Moc2l6ZV92ZXJ0aWNhbDogbnVtYmVyLCBzaXplX2hvcml6b250YWw6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlciwgcmV2ZXJzZV9kZXB0aDogYm9vbGVhbiA9IGZhbHNlKTogTWF0NCB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgdGUuZmlsbCgwKTtcblxuICAgICAgICBjb25zdCBkZXB0aF9yYW5nZSA9IGZhciAtIG5lYXI7XG5cbiAgICAgICAgY29uc3QgbGVmdCA9IHNpemVfaG9yaXpvbnRhbCAvIDI7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gLXNpemVfaG9yaXpvbnRhbCAvIDI7XG4gICAgICAgIGNvbnN0IHRvcCA9IHNpemVfdmVydGljYWwgLyAyO1xuICAgICAgICBjb25zdCBib3R0b20gPSAtc2l6ZV92ZXJ0aWNhbCAvIDI7XG5cbiAgICAgICAgdGVbMF0gPSAyIC8gKHJpZ2h0IC0gbGVmdCk7XG4gICAgICAgIHRlWzVdID0gMiAvICh0b3AgLSBib3R0b20pO1xuICAgICAgICB0ZVsxMF0gPSAtMiAvIGRlcHRoX3JhbmdlO1xuXG4gICAgICAgIHRlWzEyXSA9IChyaWdodCArIGxlZnQpIC8gKHJpZ2h0IC0gbGVmdCk7XG4gICAgICAgIHRlWzEzXSA9ICh0b3AgKyBib3R0b20pIC8gKHRvcCAtIGJvdHRvbSk7XG4gICAgICAgIHRlWzE0XSA9IC1uZWFyICogdGVbMTBdO1xuICAgICAgICB0ZVsxNV0gPSAxO1xuXG4gICAgICAgIGlmIChyZXZlcnNlX2RlcHRoKSB7XG4gICAgICAgICAgICB0ZVsxNF0gPSAtdGVbMTRdICsgMTtcbiAgICAgICAgICAgIHRlWzEwXSA9IC10ZVsxMF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKCk6IE1hdDQge1xuICAgICAgICByZXR1cm4gTWF0NC5JbnZlcnNlKHRoaXMsIHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21fcXVhdGVybmlvbihxOiBRdWF0ZXJuaW9uKTogTWF0NCB7XG4gICAgICAgIHJldHVybiBNYXQ0LkZyb21RdWF0ZXJuaW9uKHEsIHRoaXMpO1xuICAgIH1cblxuICAgIGNvbXBvc2UobG9jYXRpb246IEZsb2F0Mywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgcmV0dXJuIE1hdDQuQ29tcG9zZShsb2NhdGlvbiwgcm90YXRpb24sIHNjYWxlLCB0aGlzKTtcbiAgICB9XG5cbiAgICBkZWNvbXBvc2UobG9jYXRpb246IEZsb2F0Mywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgcmV0dXJuIE1hdDQuRGVjb21wb3NlKHRoaXMsIGxvY2F0aW9uLCByb3RhdGlvbiwgc2NhbGUpO1xuICAgIH1cblxuICAgIHNldF9zY2FsZShzY2FsZTogRmxvYXQzKTogTWF0NCB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgY29uc3QgeCA9IHNjYWxlLngsXG4gICAgICAgICAgICB5ID0gc2NhbGUueSxcbiAgICAgICAgICAgIHogPSBzY2FsZS56O1xuICAgICAgICB0ZVswXSAqPSB4O1xuICAgICAgICB0ZVs0XSAqPSB5O1xuICAgICAgICB0ZVs4XSAqPSB6O1xuICAgICAgICB0ZVsxXSAqPSB4O1xuICAgICAgICB0ZVs1XSAqPSB5O1xuICAgICAgICB0ZVs5XSAqPSB6O1xuICAgICAgICB0ZVsyXSAqPSB4O1xuICAgICAgICB0ZVs2XSAqPSB5O1xuICAgICAgICB0ZVsxMF0gKj0gejtcbiAgICAgICAgdGVbM10gKj0geDtcbiAgICAgICAgdGVbN10gKj0geTtcbiAgICAgICAgdGVbMTFdICo9IHo7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldF9zY2FsZShzY2FsZTogRmxvYXQzKTogRmxvYXQzIHtcbiAgICAgICAgcmV0dXJuIHNjYWxlLnNldCh0aGlzLmVsZW1lbnRzWzBdLCB0aGlzLmVsZW1lbnRzWzVdLCB0aGlzLmVsZW1lbnRzWzEwXSk7XG4gICAgfVxuXG4gICAgc2V0X2xvY2F0aW9uKGxvY2F0aW9uOiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgY29uc3QgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgICB0ZVsxMl0gPSBsb2NhdGlvbi54O1xuICAgICAgICB0ZVsxM10gPSBsb2NhdGlvbi55O1xuICAgICAgICB0ZVsxNF0gPSBsb2NhdGlvbi56O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwcmVfbXVsKGE6IE1hdDQpOiBNYXQ0IHtcbiAgICAgICAgcmV0dXJuIE1hdDQuTXVsKGEsIHRoaXMsIHRoaXMpO1xuICAgIH1cblxuICAgIG11bChhOiBNYXQ0KTogTWF0NCB7XG4gICAgICAgIHJldHVybiBNYXQ0Lk11bCh0aGlzLCBhLCB0aGlzKTtcbiAgICB9XG5cbiAgICB0cmFuc3Bvc2UoKTogTWF0NCB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgbGV0IHRtcDtcbiAgICAgICAgdG1wID0gdGVbMV07XG4gICAgICAgIHRlWzFdID0gdGVbNF07XG4gICAgICAgIHRlWzRdID0gdG1wO1xuICAgICAgICB0bXAgPSB0ZVsyXTtcbiAgICAgICAgdGVbMl0gPSB0ZVs4XTtcbiAgICAgICAgdGVbOF0gPSB0bXA7XG4gICAgICAgIHRtcCA9IHRlWzZdO1xuICAgICAgICB0ZVs2XSA9IHRlWzldO1xuICAgICAgICB0ZVs5XSA9IHRtcDtcbiAgICAgICAgdG1wID0gdGVbM107XG4gICAgICAgIHRlWzNdID0gdGVbMTJdO1xuICAgICAgICB0ZVsxMl0gPSB0bXA7XG4gICAgICAgIHRtcCA9IHRlWzddO1xuICAgICAgICB0ZVs3XSA9IHRlWzEzXTtcbiAgICAgICAgdGVbMTNdID0gdG1wO1xuICAgICAgICB0bXAgPSB0ZVsxMV07XG4gICAgICAgIHRlWzExXSA9IHRlWzE0XTtcbiAgICAgICAgdGVbMTRdID0gdG1wO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZXRlcm1pbmFudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0NC5EZXRlcm1pbmFudCh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgSXNJZGVudGl0eShzcmM6IE1hdDQpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgdGUgPSBzcmMuZWxlbWVudHM7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0ZVswXSA9PT0gMSAmJlxuICAgICAgICAgICAgdGVbMV0gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzJdID09PSAwICYmXG4gICAgICAgICAgICB0ZVszXSA9PT0gMCAmJlxuICAgICAgICAgICAgdGVbNF0gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzVdID09PSAxICYmXG4gICAgICAgICAgICB0ZVs2XSA9PT0gMCAmJlxuICAgICAgICAgICAgdGVbN10gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzhdID09PSAwICYmXG4gICAgICAgICAgICB0ZVs5XSA9PT0gMCAmJlxuICAgICAgICAgICAgdGVbMTBdID09PSAxICYmXG4gICAgICAgICAgICB0ZVsxMV0gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzEyXSA9PT0gMCAmJlxuICAgICAgICAgICAgdGVbMTNdID09PSAwICYmXG4gICAgICAgICAgICB0ZVsxNF0gPT09IDAgJiZcbiAgICAgICAgICAgIHRlWzE1XSA9PT0gMVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBEZXRlcm1pbmFudChzcmM6IE1hdDQpOiBudW1iZXIge1xuICAgICAgICBjb25zdCB0ZSA9IHNyYy5lbGVtZW50cztcbiAgICAgICAgY29uc3QgbjExID0gdGVbMF0sXG4gICAgICAgICAgICBuMTIgPSB0ZVs0XSxcbiAgICAgICAgICAgIG4xMyA9IHRlWzhdLFxuICAgICAgICAgICAgbjE0ID0gdGVbMTJdO1xuICAgICAgICBjb25zdCBuMjEgPSB0ZVsxXSxcbiAgICAgICAgICAgIG4yMiA9IHRlWzVdLFxuICAgICAgICAgICAgbjIzID0gdGVbOV0sXG4gICAgICAgICAgICBuMjQgPSB0ZVsxM107XG4gICAgICAgIGNvbnN0IG4zMSA9IHRlWzJdLFxuICAgICAgICAgICAgbjMyID0gdGVbNl0sXG4gICAgICAgICAgICBuMzMgPSB0ZVsxMF0sXG4gICAgICAgICAgICBuMzQgPSB0ZVsxNF07XG4gICAgICAgIGNvbnN0IG40MSA9IHRlWzNdLFxuICAgICAgICAgICAgbjQyID0gdGVbN10sXG4gICAgICAgICAgICBuNDMgPSB0ZVsxMV0sXG4gICAgICAgICAgICBuNDQgPSB0ZVsxNV07XG5cbiAgICAgICAgLy9UT0RPOiBtYWtlIHRoaXMgbW9yZSBlZmZpY2llbnRcbiAgICAgICAgLy8oIGJhc2VkIG9uIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2FsZ2VicmEvbWF0cml4L2Z1bmN0aW9ucy9pbnZlcnNlL2ZvdXJEL2luZGV4Lmh0bSApXG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIG40MSAqICgrbjE0ICogbjIzICogbjMyIC0gbjEzICogbjI0ICogbjMyIC0gbjE0ICogbjIyICogbjMzICsgbjEyICogbjI0ICogbjMzICsgbjEzICogbjIyICogbjM0IC0gbjEyICogbjIzICogbjM0KSArXG4gICAgICAgICAgICBuNDIgKiAoK24xMSAqIG4yMyAqIG4zNCAtIG4xMSAqIG4yNCAqIG4zMyArIG4xNCAqIG4yMSAqIG4zMyAtIG4xMyAqIG4yMSAqIG4zNCArIG4xMyAqIG4yNCAqIG4zMSAtIG4xNCAqIG4yMyAqIG4zMSkgK1xuICAgICAgICAgICAgbjQzICogKCtuMTEgKiBuMjQgKiBuMzIgLSBuMTEgKiBuMjIgKiBuMzQgLSBuMTQgKiBuMjEgKiBuMzIgKyBuMTIgKiBuMjEgKiBuMzQgKyBuMTQgKiBuMjIgKiBuMzEgLSBuMTIgKiBuMjQgKiBuMzEpICtcbiAgICAgICAgICAgIG40NCAqICgtbjEzICogbjIyICogbjMxIC0gbjExICogbjIzICogbjMyICsgbjExICogbjIyICogbjMzICsgbjEzICogbjIxICogbjMyIC0gbjEyICogbjIxICogbjMzICsgbjEyICogbjIzICogbjMxKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBDb21wb3NlKGxvY2F0aW9uOiBGbG9hdDMsIHJvdGF0aW9uOiBRdWF0ZXJuaW9uLCBzY2FsZTogRmxvYXQzLCBkc3Q/OiBNYXQ0KTogTWF0NCB7XG4gICAgICAgIGlmIChkc3QgPT09IHVuZGVmaW5lZCkgZHN0ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgY29uc3QgdGUgPSBkc3QuZWxlbWVudHM7XG4gICAgICAgIGNvbnN0IHggPSByb3RhdGlvbi54LFxuICAgICAgICAgICAgeSA9IHJvdGF0aW9uLnksXG4gICAgICAgICAgICB6ID0gcm90YXRpb24ueixcbiAgICAgICAgICAgIHcgPSByb3RhdGlvbi53O1xuICAgICAgICBjb25zdCB4MiA9IHggKyB4LFxuICAgICAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgICAgIHoyID0geiArIHo7XG4gICAgICAgIGNvbnN0IHh4ID0geCAqIHgyLFxuICAgICAgICAgICAgeHkgPSB4ICogeTIsXG4gICAgICAgICAgICB4eiA9IHggKiB6MjtcbiAgICAgICAgY29uc3QgeXkgPSB5ICogeTIsXG4gICAgICAgICAgICB5eiA9IHkgKiB6MixcbiAgICAgICAgICAgIHp6ID0geiAqIHoyO1xuICAgICAgICBjb25zdCB3eCA9IHcgKiB4MixcbiAgICAgICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICAgICAgY29uc3Qgc3ggPSBzY2FsZS54LFxuICAgICAgICAgICAgc3kgPSBzY2FsZS55LFxuICAgICAgICAgICAgc3ogPSBzY2FsZS56O1xuXG4gICAgICAgIHRlWzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gICAgICAgIHRlWzFdID0gKHh5ICsgd3opICogc3g7XG4gICAgICAgIHRlWzJdID0gKHh6IC0gd3kpICogc3g7XG4gICAgICAgIHRlWzNdID0gMDtcblxuICAgICAgICB0ZVs0XSA9ICh4eSAtIHd6KSAqIHN5O1xuICAgICAgICB0ZVs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xuICAgICAgICB0ZVs2XSA9ICh5eiArIHd4KSAqIHN5O1xuICAgICAgICB0ZVs3XSA9IDA7XG5cbiAgICAgICAgdGVbOF0gPSAoeHogKyB3eSkgKiBzejtcbiAgICAgICAgdGVbOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgICAgICAgdGVbMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XG4gICAgICAgIHRlWzExXSA9IDA7XG5cbiAgICAgICAgdGVbMTJdID0gbG9jYXRpb24ueDtcbiAgICAgICAgdGVbMTNdID0gbG9jYXRpb24ueTtcbiAgICAgICAgdGVbMTRdID0gbG9jYXRpb24uejtcbiAgICAgICAgdGVbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRGVjb21wb3NlKHNyYzogTWF0NCwgbG9jYXRpb246IEZsb2F0Mywgcm90YXRpb246IFF1YXRlcm5pb24sIHNjYWxlOiBGbG9hdDMpOiBNYXQ0IHtcbiAgICAgICAgY29uc3QgbSA9IHBvb2xfZ2V0KE1hdDQpO1xuICAgICAgICBjb25zdCB0ZSA9IHNyYy5lbGVtZW50cztcblxuICAgICAgICBsZXQgc3ggPSB2LnNldCh0ZVswXSwgdGVbMV0sIHRlWzJdKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHN5ID0gdi5zZXQodGVbNF0sIHRlWzVdLCB0ZVs2XSkubGVuZ3RoO1xuICAgICAgICBjb25zdCBzeiA9IHYuc2V0KHRlWzhdLCB0ZVs5XSwgdGVbMTBdKS5sZW5ndGg7XG5cbiAgICAgICAgLy8gaWYgZGV0ZXJtaW5lIGlzIG5lZ2F0aXZlLCB3ZSBuZWVkIHRvIGludmVyc2Ugb25lIHNjYWxlXG4gICAgICAgIGNvbnN0IGRldCA9IHNyYy5kZXRlcm1pbmFudCgpO1xuICAgICAgICBpZiAoZGV0IDwgMCkgc3ggPSAtc3g7XG5cbiAgICAgICAgbG9jYXRpb24ueCA9IHRlWzEyXTtcbiAgICAgICAgbG9jYXRpb24ueSA9IHRlWzEzXTtcbiAgICAgICAgbG9jYXRpb24ueiA9IHRlWzE0XTtcblxuICAgICAgICAvLyBzY2FsZSB0aGUgcm90YXRpb24gcGFydFxuICAgICAgICBtLmNvcHkoc3JjKTtcblxuICAgICAgICBjb25zdCBpbnZTWCA9IDEgLyBzeDtcbiAgICAgICAgY29uc3QgaW52U1kgPSAxIC8gc3k7XG4gICAgICAgIGNvbnN0IGludlNaID0gMSAvIHN6O1xuXG4gICAgICAgIG0uZWxlbWVudHNbMF0gKj0gaW52U1g7XG4gICAgICAgIG0uZWxlbWVudHNbMV0gKj0gaW52U1g7XG4gICAgICAgIG0uZWxlbWVudHNbMl0gKj0gaW52U1g7XG5cbiAgICAgICAgbS5lbGVtZW50c1s0XSAqPSBpbnZTWTtcbiAgICAgICAgbS5lbGVtZW50c1s1XSAqPSBpbnZTWTtcbiAgICAgICAgbS5lbGVtZW50c1s2XSAqPSBpbnZTWTtcblxuICAgICAgICBtLmVsZW1lbnRzWzhdICo9IGludlNaO1xuICAgICAgICBtLmVsZW1lbnRzWzldICo9IGludlNaO1xuICAgICAgICBtLmVsZW1lbnRzWzEwXSAqPSBpbnZTWjtcblxuICAgICAgICByb3RhdGlvbi5mcm9tX21hdDQobSk7XG4gICAgICAgIHBvb2xfcmV0dXJuKG0pO1xuXG4gICAgICAgIHNjYWxlLnggPSBzeDtcbiAgICAgICAgc2NhbGUueSA9IHN5O1xuICAgICAgICBzY2FsZS56ID0gc3o7XG5cbiAgICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG5cbiAgICBzdGF0aWMgRnJvbVF1YXRlcm5pb24ocTogUXVhdGVybmlvbiwgZHN0OiBNYXQ0ID0gbmV3IE1hdDQoKSk6IE1hdDQge1xuICAgICAgICBjb25zdCB0ZSA9IGRzdC5lbGVtZW50cztcblxuICAgICAgICBjb25zdCB4ID0gcS54O1xuICAgICAgICBjb25zdCB5ID0gcS55O1xuICAgICAgICBjb25zdCB6ID0gcS56O1xuICAgICAgICBjb25zdCB3ID0gcS53O1xuICAgICAgICBjb25zdCB4MiA9IHggKyB4O1xuICAgICAgICBjb25zdCB5MiA9IHkgKyB5O1xuICAgICAgICBjb25zdCB6MiA9IHogKyB6O1xuICAgICAgICBjb25zdCB4eCA9IHggKiB4MjtcbiAgICAgICAgY29uc3QgeHkgPSB4ICogeTI7XG4gICAgICAgIGNvbnN0IHh6ID0geCAqIHoyO1xuICAgICAgICBjb25zdCB5eSA9IHkgKiB5MjtcbiAgICAgICAgY29uc3QgeXogPSB5ICogejI7XG4gICAgICAgIGNvbnN0IHp6ID0geiAqIHoyO1xuICAgICAgICBjb25zdCB3eCA9IHcgKiB4MjtcbiAgICAgICAgY29uc3Qgd3kgPSB3ICogeTI7XG4gICAgICAgIGNvbnN0IHd6ID0gdyAqIHoyO1xuXG4gICAgICAgIHRlWzBdID0gMSAtICh5eSArIHp6KTtcbiAgICAgICAgdGVbNF0gPSB4eSAtIHd6O1xuICAgICAgICB0ZVs4XSA9IHh6ICsgd3k7XG5cbiAgICAgICAgdGVbMV0gPSB4eSArIHd6O1xuICAgICAgICB0ZVs1XSA9IDEgLSAoeHggKyB6eik7XG4gICAgICAgIHRlWzldID0geXogLSB3eDtcblxuICAgICAgICB0ZVsyXSA9IHh6IC0gd3k7XG4gICAgICAgIHRlWzZdID0geXogKyB3eDtcbiAgICAgICAgdGVbMTBdID0gMSAtICh4eCArIHl5KTtcblxuICAgICAgICAvLyBsYXN0IGNvbHVtblxuICAgICAgICB0ZVszXSA9IDA7XG4gICAgICAgIHRlWzddID0gMDtcbiAgICAgICAgdGVbMTFdID0gMDtcblxuICAgICAgICAvLyBib3R0b20gcm93XG4gICAgICAgIHRlWzEyXSA9IDA7XG4gICAgICAgIHRlWzEzXSA9IDA7XG4gICAgICAgIHRlWzE0XSA9IDA7XG4gICAgICAgIHRlWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIEludmVyc2Uoc3JjOiBNYXQ0LCBkc3Q/OiBNYXQ0KTogTWF0NCB7XG4gICAgICAgIGlmICghZHN0KSBkc3QgPSBuZXcgTWF0NCgpO1xuXG4gICAgICAgIC8vIGJhc2VkIG9uIGh0dHA6Ly93d3cuZXVjbGlkZWFuc3BhY2UuY29tL21hdGhzL2FsZ2VicmEvbWF0cml4L2Z1bmN0aW9ucy9pbnZlcnNlL2ZvdXJEL2luZGV4Lmh0bVxuICAgICAgICBjb25zdCB0ZSA9IGRzdC5lbGVtZW50cyxcbiAgICAgICAgICAgIG1lID0gc3JjLmVsZW1lbnRzLFxuICAgICAgICAgICAgbjExID0gbWVbMF0sXG4gICAgICAgICAgICBuMjEgPSBtZVsxXSxcbiAgICAgICAgICAgIG4zMSA9IG1lWzJdLFxuICAgICAgICAgICAgbjQxID0gbWVbM10sXG4gICAgICAgICAgICBuMTIgPSBtZVs0XSxcbiAgICAgICAgICAgIG4yMiA9IG1lWzVdLFxuICAgICAgICAgICAgbjMyID0gbWVbNl0sXG4gICAgICAgICAgICBuNDIgPSBtZVs3XSxcbiAgICAgICAgICAgIG4xMyA9IG1lWzhdLFxuICAgICAgICAgICAgbjIzID0gbWVbOV0sXG4gICAgICAgICAgICBuMzMgPSBtZVsxMF0sXG4gICAgICAgICAgICBuNDMgPSBtZVsxMV0sXG4gICAgICAgICAgICBuMTQgPSBtZVsxMl0sXG4gICAgICAgICAgICBuMjQgPSBtZVsxM10sXG4gICAgICAgICAgICBuMzQgPSBtZVsxNF0sXG4gICAgICAgICAgICBuNDQgPSBtZVsxNV0sXG4gICAgICAgICAgICB0MTEgPSBuMjMgKiBuMzQgKiBuNDIgLSBuMjQgKiBuMzMgKiBuNDIgKyBuMjQgKiBuMzIgKiBuNDMgLSBuMjIgKiBuMzQgKiBuNDMgLSBuMjMgKiBuMzIgKiBuNDQgKyBuMjIgKiBuMzMgKiBuNDQsXG4gICAgICAgICAgICB0MTIgPSBuMTQgKiBuMzMgKiBuNDIgLSBuMTMgKiBuMzQgKiBuNDIgLSBuMTQgKiBuMzIgKiBuNDMgKyBuMTIgKiBuMzQgKiBuNDMgKyBuMTMgKiBuMzIgKiBuNDQgLSBuMTIgKiBuMzMgKiBuNDQsXG4gICAgICAgICAgICB0MTMgPSBuMTMgKiBuMjQgKiBuNDIgLSBuMTQgKiBuMjMgKiBuNDIgKyBuMTQgKiBuMjIgKiBuNDMgLSBuMTIgKiBuMjQgKiBuNDMgLSBuMTMgKiBuMjIgKiBuNDQgKyBuMTIgKiBuMjMgKiBuNDQsXG4gICAgICAgICAgICB0MTQgPSBuMTQgKiBuMjMgKiBuMzIgLSBuMTMgKiBuMjQgKiBuMzIgLSBuMTQgKiBuMjIgKiBuMzMgKyBuMTIgKiBuMjQgKiBuMzMgKyBuMTMgKiBuMjIgKiBuMzQgLSBuMTIgKiBuMjMgKiBuMzQ7XG5cbiAgICAgICAgY29uc3QgZGV0ID0gbjExICogdDExICsgbjIxICogdDEyICsgbjMxICogdDEzICsgbjQxICogdDE0O1xuICAgICAgICBpZiAoZGV0ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZHN0LmlkZW50aXR5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZXRJbnYgPSAxIC8gZGV0O1xuXG4gICAgICAgIHRlWzBdID0gdDExICogZGV0SW52O1xuICAgICAgICB0ZVsxXSA9IChuMjQgKiBuMzMgKiBuNDEgLSBuMjMgKiBuMzQgKiBuNDEgLSBuMjQgKiBuMzEgKiBuNDMgKyBuMjEgKiBuMzQgKiBuNDMgKyBuMjMgKiBuMzEgKiBuNDQgLSBuMjEgKiBuMzMgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVsyXSA9IChuMjIgKiBuMzQgKiBuNDEgLSBuMjQgKiBuMzIgKiBuNDEgKyBuMjQgKiBuMzEgKiBuNDIgLSBuMjEgKiBuMzQgKiBuNDIgLSBuMjIgKiBuMzEgKiBuNDQgKyBuMjEgKiBuMzIgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVszXSA9IChuMjMgKiBuMzIgKiBuNDEgLSBuMjIgKiBuMzMgKiBuNDEgLSBuMjMgKiBuMzEgKiBuNDIgKyBuMjEgKiBuMzMgKiBuNDIgKyBuMjIgKiBuMzEgKiBuNDMgLSBuMjEgKiBuMzIgKiBuNDMpICogZGV0SW52O1xuXG4gICAgICAgIHRlWzRdID0gdDEyICogZGV0SW52O1xuICAgICAgICB0ZVs1XSA9IChuMTMgKiBuMzQgKiBuNDEgLSBuMTQgKiBuMzMgKiBuNDEgKyBuMTQgKiBuMzEgKiBuNDMgLSBuMTEgKiBuMzQgKiBuNDMgLSBuMTMgKiBuMzEgKiBuNDQgKyBuMTEgKiBuMzMgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVs2XSA9IChuMTQgKiBuMzIgKiBuNDEgLSBuMTIgKiBuMzQgKiBuNDEgLSBuMTQgKiBuMzEgKiBuNDIgKyBuMTEgKiBuMzQgKiBuNDIgKyBuMTIgKiBuMzEgKiBuNDQgLSBuMTEgKiBuMzIgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVs3XSA9IChuMTIgKiBuMzMgKiBuNDEgLSBuMTMgKiBuMzIgKiBuNDEgKyBuMTMgKiBuMzEgKiBuNDIgLSBuMTEgKiBuMzMgKiBuNDIgLSBuMTIgKiBuMzEgKiBuNDMgKyBuMTEgKiBuMzIgKiBuNDMpICogZGV0SW52O1xuXG4gICAgICAgIHRlWzhdID0gdDEzICogZGV0SW52O1xuICAgICAgICB0ZVs5XSA9IChuMTQgKiBuMjMgKiBuNDEgLSBuMTMgKiBuMjQgKiBuNDEgLSBuMTQgKiBuMjEgKiBuNDMgKyBuMTEgKiBuMjQgKiBuNDMgKyBuMTMgKiBuMjEgKiBuNDQgLSBuMTEgKiBuMjMgKiBuNDQpICogZGV0SW52O1xuICAgICAgICB0ZVsxMF0gPSAobjEyICogbjI0ICogbjQxIC0gbjE0ICogbjIyICogbjQxICsgbjE0ICogbjIxICogbjQyIC0gbjExICogbjI0ICogbjQyIC0gbjEyICogbjIxICogbjQ0ICsgbjExICogbjIyICogbjQ0KSAqIGRldEludjtcbiAgICAgICAgdGVbMTFdID0gKG4xMyAqIG4yMiAqIG40MSAtIG4xMiAqIG4yMyAqIG40MSAtIG4xMyAqIG4yMSAqIG40MiArIG4xMSAqIG4yMyAqIG40MiArIG4xMiAqIG4yMSAqIG40MyAtIG4xMSAqIG4yMiAqIG40MykgKiBkZXRJbnY7XG5cbiAgICAgICAgdGVbMTJdID0gdDE0ICogZGV0SW52O1xuICAgICAgICB0ZVsxM10gPSAobjEzICogbjI0ICogbjMxIC0gbjE0ICogbjIzICogbjMxICsgbjE0ICogbjIxICogbjMzIC0gbjExICogbjI0ICogbjMzIC0gbjEzICogbjIxICogbjM0ICsgbjExICogbjIzICogbjM0KSAqIGRldEludjtcbiAgICAgICAgdGVbMTRdID0gKG4xNCAqIG4yMiAqIG4zMSAtIG4xMiAqIG4yNCAqIG4zMSAtIG4xNCAqIG4yMSAqIG4zMiArIG4xMSAqIG4yNCAqIG4zMiArIG4xMiAqIG4yMSAqIG4zNCAtIG4xMSAqIG4yMiAqIG4zNCkgKiBkZXRJbnY7XG4gICAgICAgIHRlWzE1XSA9IChuMTIgKiBuMjMgKiBuMzEgLSBuMTMgKiBuMjIgKiBuMzEgKyBuMTMgKiBuMjEgKiBuMzIgLSBuMTEgKiBuMjMgKiBuMzIgLSBuMTIgKiBuMjEgKiBuMzMgKyBuMTEgKiBuMjIgKiBuMzMpICogZGV0SW52O1xuXG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIE11bChhOiBNYXQ0LCBiOiBNYXQ0LCBkc3Q/OiBNYXQ0KTogTWF0NCB7XG4gICAgICAgIGlmIChkc3QgPT09IHVuZGVmaW5lZCkgZHN0ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgY29uc3QgYWUgPSBhLmVsZW1lbnRzO1xuICAgICAgICBjb25zdCBiZSA9IGIuZWxlbWVudHM7XG4gICAgICAgIGNvbnN0IHRlID0gZHN0LmVsZW1lbnRzO1xuXG4gICAgICAgIGNvbnN0IGExMSA9IGFlWzBdO1xuICAgICAgICBjb25zdCBhMTIgPSBhZVs0XTtcbiAgICAgICAgY29uc3QgYTEzID0gYWVbOF07XG4gICAgICAgIGNvbnN0IGExNCA9IGFlWzEyXTtcbiAgICAgICAgY29uc3QgYTIxID0gYWVbMV07XG4gICAgICAgIGNvbnN0IGEyMiA9IGFlWzVdO1xuICAgICAgICBjb25zdCBhMjMgPSBhZVs5XTtcbiAgICAgICAgY29uc3QgYTI0ID0gYWVbMTNdO1xuICAgICAgICBjb25zdCBhMzEgPSBhZVsyXTtcbiAgICAgICAgY29uc3QgYTMyID0gYWVbNl07XG4gICAgICAgIGNvbnN0IGEzMyA9IGFlWzEwXTtcbiAgICAgICAgY29uc3QgYTM0ID0gYWVbMTRdO1xuICAgICAgICBjb25zdCBhNDEgPSBhZVszXTtcbiAgICAgICAgY29uc3QgYTQyID0gYWVbN107XG4gICAgICAgIGNvbnN0IGE0MyA9IGFlWzExXTtcbiAgICAgICAgY29uc3QgYTQ0ID0gYWVbMTVdO1xuXG4gICAgICAgIGNvbnN0IGIxMSA9IGJlWzBdO1xuICAgICAgICBjb25zdCBiMTIgPSBiZVs0XTtcbiAgICAgICAgY29uc3QgYjEzID0gYmVbOF07XG4gICAgICAgIGNvbnN0IGIxNCA9IGJlWzEyXTtcbiAgICAgICAgY29uc3QgYjIxID0gYmVbMV07XG4gICAgICAgIGNvbnN0IGIyMiA9IGJlWzVdO1xuICAgICAgICBjb25zdCBiMjMgPSBiZVs5XTtcbiAgICAgICAgY29uc3QgYjI0ID0gYmVbMTNdO1xuICAgICAgICBjb25zdCBiMzEgPSBiZVsyXTtcbiAgICAgICAgY29uc3QgYjMyID0gYmVbNl07XG4gICAgICAgIGNvbnN0IGIzMyA9IGJlWzEwXTtcbiAgICAgICAgY29uc3QgYjM0ID0gYmVbMTRdO1xuICAgICAgICBjb25zdCBiNDEgPSBiZVszXTtcbiAgICAgICAgY29uc3QgYjQyID0gYmVbN107XG4gICAgICAgIGNvbnN0IGI0MyA9IGJlWzExXTtcbiAgICAgICAgY29uc3QgYjQ0ID0gYmVbMTVdO1xuXG4gICAgICAgIHRlWzBdID0gYTExICogYjExICsgYTEyICogYjIxICsgYTEzICogYjMxICsgYTE0ICogYjQxO1xuICAgICAgICB0ZVs0XSA9IGExMSAqIGIxMiArIGExMiAqIGIyMiArIGExMyAqIGIzMiArIGExNCAqIGI0MjtcbiAgICAgICAgdGVbOF0gPSBhMTEgKiBiMTMgKyBhMTIgKiBiMjMgKyBhMTMgKiBiMzMgKyBhMTQgKiBiNDM7XG4gICAgICAgIHRlWzEyXSA9IGExMSAqIGIxNCArIGExMiAqIGIyNCArIGExMyAqIGIzNCArIGExNCAqIGI0NDtcblxuICAgICAgICB0ZVsxXSA9IGEyMSAqIGIxMSArIGEyMiAqIGIyMSArIGEyMyAqIGIzMSArIGEyNCAqIGI0MTtcbiAgICAgICAgdGVbNV0gPSBhMjEgKiBiMTIgKyBhMjIgKiBiMjIgKyBhMjMgKiBiMzIgKyBhMjQgKiBiNDI7XG4gICAgICAgIHRlWzldID0gYTIxICogYjEzICsgYTIyICogYjIzICsgYTIzICogYjMzICsgYTI0ICogYjQzO1xuICAgICAgICB0ZVsxM10gPSBhMjEgKiBiMTQgKyBhMjIgKiBiMjQgKyBhMjMgKiBiMzQgKyBhMjQgKiBiNDQ7XG5cbiAgICAgICAgdGVbMl0gPSBhMzEgKiBiMTEgKyBhMzIgKiBiMjEgKyBhMzMgKiBiMzEgKyBhMzQgKiBiNDE7XG4gICAgICAgIHRlWzZdID0gYTMxICogYjEyICsgYTMyICogYjIyICsgYTMzICogYjMyICsgYTM0ICogYjQyO1xuICAgICAgICB0ZVsxMF0gPSBhMzEgKiBiMTMgKyBhMzIgKiBiMjMgKyBhMzMgKiBiMzMgKyBhMzQgKiBiNDM7XG4gICAgICAgIHRlWzE0XSA9IGEzMSAqIGIxNCArIGEzMiAqIGIyNCArIGEzMyAqIGIzNCArIGEzNCAqIGI0NDtcblxuICAgICAgICB0ZVszXSA9IGE0MSAqIGIxMSArIGE0MiAqIGIyMSArIGE0MyAqIGIzMSArIGE0NCAqIGI0MTtcbiAgICAgICAgdGVbN10gPSBhNDEgKiBiMTIgKyBhNDIgKiBiMjIgKyBhNDMgKiBiMzIgKyBhNDQgKiBiNDI7XG4gICAgICAgIHRlWzExXSA9IGE0MSAqIGIxMyArIGE0MiAqIGIyMyArIGE0MyAqIGIzMyArIGE0NCAqIGI0MztcbiAgICAgICAgdGVbMTVdID0gYTQxICogYjE0ICsgYTQyICogYjI0ICsgYTQzICogYjM0ICsgYTQ0ICogYjQ0O1xuXG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9ICdbJyArIHRoaXMuZWxlbWVudHNbMF0udG9GaXhlZCg0KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLmVsZW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gJywgJyArIHRoaXMuZWxlbWVudHNbaV0udG9GaXhlZCg0KTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gJ10nO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdDMgaW1wbGVtZW50cyBIZWFwUG9pbnRlciB7XG4gICAgc2l6ZTogbnVtYmVyID0gOTtcbiAgICBlbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoOSk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xuICAgICAgICBmb290cHJpbnRfYWxsb2MoOSk7XG4gICAgfVxuXG4gICAgcmVhZChidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zaXplOyArK2kpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbaV0gPSBidWZmZXJbb2Zmc2V0ICsgaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgd3JpdGUoYnVmZmVyOiBUeXBlZEFycmF5IHwgbnVtYmVyW10sIG9mZnNldDogbnVtYmVyID0gMCk6IHRoaXMge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgKytpKSB7XG4gICAgICAgICAgICBidWZmZXJbb2Zmc2V0ICsgaV0gPSB0aGlzLmVsZW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCk6IE1hdDMge1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnNldChbMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KG06IE1hdDMpOiBNYXQzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5zZXQobS5lbGVtZW50cyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21fbWF0NChtOiBNYXQ0KTogTWF0MyB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgY29uc3QgbWUgPSBtLmVsZW1lbnRzO1xuICAgICAgICB0ZVswXSA9IG1lWzBdO1xuICAgICAgICB0ZVsxXSA9IG1lWzFdO1xuICAgICAgICB0ZVsyXSA9IG1lWzJdO1xuICAgICAgICB0ZVszXSA9IG1lWzRdO1xuICAgICAgICB0ZVs0XSA9IG1lWzVdO1xuICAgICAgICB0ZVs1XSA9IG1lWzZdO1xuICAgICAgICB0ZVs2XSA9IG1lWzhdO1xuICAgICAgICB0ZVs3XSA9IG1lWzldO1xuICAgICAgICB0ZVs4XSA9IG1lWzEwXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsX21hdHJpeF9mcm9tX21hdDQobTogTWF0NCk6IE1hdDMge1xuICAgICAgICB0aGlzLmZyb21fbWF0NChtKS5pbnZlcnNlKCkudHJhbnNwb3NlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UoKTogTWF0MyB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgY29uc3QgbjExID0gdGVbMF07XG4gICAgICAgIGNvbnN0IG4yMSA9IHRlWzFdO1xuICAgICAgICBjb25zdCBuMzEgPSB0ZVsyXTtcbiAgICAgICAgY29uc3QgbjEyID0gdGVbM107XG4gICAgICAgIGNvbnN0IG4yMiA9IHRlWzRdO1xuICAgICAgICBjb25zdCBuMzIgPSB0ZVs1XTtcbiAgICAgICAgY29uc3QgbjEzID0gdGVbNl07XG4gICAgICAgIGNvbnN0IG4yMyA9IHRlWzddO1xuICAgICAgICBjb25zdCBuMzMgPSB0ZVs4XTtcblxuICAgICAgICBjb25zdCB0MTEgPSBuMzMgKiBuMjIgLSBuMzIgKiBuMjM7XG4gICAgICAgIGNvbnN0IHQxMiA9IG4zMiAqIG4xMyAtIG4zMyAqIG4xMjtcbiAgICAgICAgY29uc3QgdDEzID0gbjIzICogbjEyIC0gbjIyICogbjEzO1xuXG4gICAgICAgIGNvbnN0IGRldCA9IG4xMSAqIHQxMSArIG4yMSAqIHQxMiArIG4zMSAqIHQxMztcbiAgICAgICAgaWYgKGRldCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5maWxsKDApO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZXRfaW52ID0gMSAvIGRldDtcblxuICAgICAgICB0ZVswXSA9IHQxMSAqIGRldF9pbnY7XG4gICAgICAgIHRlWzFdID0gKG4zMSAqIG4yMyAtIG4zMyAqIG4yMSkgKiBkZXRfaW52O1xuICAgICAgICB0ZVsyXSA9IChuMzIgKiBuMjEgLSBuMzEgKiBuMjIpICogZGV0X2ludjtcblxuICAgICAgICB0ZVszXSA9IHQxMiAqIGRldF9pbnY7XG4gICAgICAgIHRlWzRdID0gKG4zMyAqIG4xMSAtIG4zMSAqIG4xMykgKiBkZXRfaW52O1xuICAgICAgICB0ZVs1XSA9IChuMzEgKiBuMTIgLSBuMzIgKiBuMTEpICogZGV0X2ludjtcblxuICAgICAgICB0ZVs2XSA9IHQxMyAqIGRldF9pbnY7XG4gICAgICAgIHRlWzddID0gKG4yMSAqIG4xMyAtIG4yMyAqIG4xMSkgKiBkZXRfaW52O1xuICAgICAgICB0ZVs4XSA9IChuMjIgKiBuMTEgLSBuMjEgKiBuMTIpICogZGV0X2ludjtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0cmFuc3Bvc2UoKTogTWF0MyB7XG4gICAgICAgIGNvbnN0IHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgbGV0IHRtcDtcblxuICAgICAgICB0bXAgPSB0ZVsxXTtcbiAgICAgICAgdGVbMV0gPSB0ZVszXTtcbiAgICAgICAgdGVbM10gPSB0bXA7XG5cbiAgICAgICAgdG1wID0gdGVbMl07XG4gICAgICAgIHRlWzJdID0gdGVbNl07XG4gICAgICAgIHRlWzZdID0gdG1wO1xuXG4gICAgICAgIHRtcCA9IHRlWzVdO1xuICAgICAgICB0ZVs1XSA9IHRlWzddO1xuICAgICAgICB0ZVs3XSA9IHRtcDtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICBsZXQgcmVzdWx0ID0gJ1snICsgdGhpcy5lbGVtZW50c1swXS50b0ZpeGVkKDQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMuZWxlbWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSAnLCAnICsgdGhpcy5lbGVtZW50c1tpXS50b0ZpeGVkKDQpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSAnXSc7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgc3RhdGljIEdldENvbHVtbihzcmM6IE1hdDMsIGluZGV4OiBudW1iZXIsIGRzdDogRmxvYXQzKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc3JjLmVsZW1lbnRzO1xuICAgICAgICBkc3QueCA9IGVsZW1lbnRzW2luZGV4XTtcbiAgICAgICAgZHN0LnkgPSBlbGVtZW50c1tpbmRleCArIDNdO1xuICAgICAgICBkc3QueiA9IGVsZW1lbnRzW2luZGV4ICsgNl07XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIERpYWdvbmFsKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIGRzdDogTWF0Mykge1xuICAgICAgICBkc3QuZWxlbWVudHMuc2V0KFt4LCAwLCAwLCAwLCB5LCAwLCAwLCAwLCB6XSk7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgTUFUNF9JREVOVElUWSA9IG5ldyBNYXQ0KCkuaWRlbnRpdHkoKTsiLCAiaW1wb3J0IHsgQm94MyB9IGZyb20gJy4vYm94JztcbmltcG9ydCB7IFBsYW5lIH0gZnJvbSAnLi9wbGFuZSc7XG5pbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuL3NpbWQnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4vc2ltZF9tYXQnO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi9zcGhlcmUnO1xuXG5jb25zdCB2ID0gbmV3IEZsb2F0MygpO1xuXG4vLyB0cmlhbmdsZSB0bXAgdmFyaWFibGVcbmNvbnN0IG5vcm1hbCA9IG5ldyBGbG9hdDMoKTtcbmNvbnN0IGVkZ2UxID0gbmV3IEZsb2F0MygpO1xuY29uc3QgZWRnZTIgPSBuZXcgRmxvYXQzKCk7XG5jb25zdCBkaWZmID0gbmV3IEZsb2F0MygpO1xuXG5leHBvcnQgY2xhc3MgUmF5IHtcbiAgICBvcmlnaW46IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbiAgICBkaXJlY3Rpb246IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxuICAgIGNvbnN0cnVjdG9yKG9yaWdpbj86IEZsb2F0MywgZGlyZWN0aW9uPzogRmxvYXQzKSB7XG4gICAgICAgIGlmIChvcmlnaW4gIT09IHVuZGVmaW5lZCkgdGhpcy5vcmlnaW4uY29weShvcmlnaW4pO1xuICAgICAgICBpZiAoZGlyZWN0aW9uICE9PSB1bmRlZmluZWQpIHRoaXMuZGlyZWN0aW9uLmNvcHkoZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICBjb3B5KHI6IFJheSk6IFJheSB7XG4gICAgICAgIHRoaXMub3JpZ2luLmNvcHkoci5vcmlnaW4pO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbi5jb3B5KHIuZGlyZWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXQodDogbnVtYmVyLCB0YXJnZXQ6IEZsb2F0MyA9IHYpOiBGbG9hdDMge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmNvcHkodGhpcy5kaXJlY3Rpb24pLm11bCh0KS5hZGQodGhpcy5vcmlnaW4pIGFzIEZsb2F0MztcbiAgICB9XG5cbiAgICBhcHBseV9tYXQ0KG06IE1hdDQpOiBSYXkge1xuICAgICAgICB0aGlzLm9yaWdpbi5hcHBseV9tYXQ0KG0pO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbi5hcHBseV9tYXQ0X2RpcmVjdGlvbmFsKG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkaXN0YW5jZV90b19wb2ludChwb2ludDogRmxvYXQzKTogbnVtYmVyIHtcbiAgICAgICAgdi5jb3B5KHBvaW50KS5zdWIodGhpcy5vcmlnaW4pO1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHYuZG90KHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luLmRpc3RhbmNlKHBvaW50KTtcbiAgICAgICAgfVxuICAgICAgICB2LmNvcHkodGhpcy5kaXJlY3Rpb24pLm11bChkaXN0YW5jZSkuYWRkKHRoaXMub3JpZ2luKTtcbiAgICAgICAgcmV0dXJuIHYuZGlzdGFuY2UocG9pbnQpO1xuICAgIH1cblxuICAgIGludGVyc2VjdF9ib3goYm94OiBCb3gzLCB0YXJnZXQ6IEZsb2F0MyA9IHYpOiBGbG9hdDMgfCBudWxsIHtcbiAgICAgICAgbGV0IHRtaW4sIHRtYXgsIHR5bWluLCB0eW1heCwgdHptaW4sIHR6bWF4O1xuXG4gICAgICAgIGNvbnN0IGludmRpcnggPSAxIC8gdGhpcy5kaXJlY3Rpb24ueDtcbiAgICAgICAgY29uc3QgaW52ZGlyeSA9IDEgLyB0aGlzLmRpcmVjdGlvbi55O1xuICAgICAgICBjb25zdCBpbnZkaXJ6ID0gMSAvIHRoaXMuZGlyZWN0aW9uLno7XG5cbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdGhpcy5vcmlnaW47XG5cbiAgICAgICAgaWYgKGludmRpcnggPj0gMCkge1xuICAgICAgICAgICAgdG1pbiA9IChib3gubWluLnggLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICAgICAgdG1heCA9IChib3gubWF4LnggLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG1pbiA9IChib3gubWF4LnggLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICAgICAgdG1heCA9IChib3gubWluLnggLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGludmRpcnkgPj0gMCkge1xuICAgICAgICAgICAgdHltaW4gPSAoYm94Lm1pbi55IC0gb3JpZ2luLnkpICogaW52ZGlyeTtcbiAgICAgICAgICAgIHR5bWF4ID0gKGJveC5tYXgueSAtIG9yaWdpbi55KSAqIGludmRpcnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eW1pbiA9IChib3gubWF4LnkgLSBvcmlnaW4ueSkgKiBpbnZkaXJ5O1xuICAgICAgICAgICAgdHltYXggPSAoYm94Lm1pbi55IC0gb3JpZ2luLnkpICogaW52ZGlyeTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0bWluID4gdHltYXggfHwgdHltaW4gPiB0bWF4KSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyBUaGVzZSBsaW5lcyBhbHNvIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSB0bWluIG9yIHRtYXggaXMgTmFOXG4gICAgICAgIC8vIChyZXN1bHQgb2YgMCAqIEluZmluaXR5KS4geCAhPT0geCByZXR1cm5zIHRydWUgaWYgeCBpcyBOYU5cblxuICAgICAgICBpZiAodHltaW4gPiB0bWluIHx8IHRtaW4gIT09IHRtaW4pIHRtaW4gPSB0eW1pbjtcbiAgICAgICAgaWYgKHR5bWF4IDwgdG1heCB8fCB0bWF4ICE9PSB0bWF4KSB0bWF4ID0gdHltYXg7XG5cbiAgICAgICAgaWYgKGludmRpcnogPj0gMCkge1xuICAgICAgICAgICAgdHptaW4gPSAoYm94Lm1pbi56IC0gb3JpZ2luLnopICogaW52ZGlyejtcbiAgICAgICAgICAgIHR6bWF4ID0gKGJveC5tYXgueiAtIG9yaWdpbi56KSAqIGludmRpcno7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0em1pbiA9IChib3gubWF4LnogLSBvcmlnaW4ueikgKiBpbnZkaXJ6O1xuICAgICAgICAgICAgdHptYXggPSAoYm94Lm1pbi56IC0gb3JpZ2luLnopICogaW52ZGlyejtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0bWluID4gdHptYXggfHwgdHptaW4gPiB0bWF4KSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKHR6bWluID4gdG1pbiB8fCB0bWluICE9PSB0bWluKSB0bWluID0gdHptaW47XG4gICAgICAgIGlmICh0em1heCA8IHRtYXggfHwgdG1heCAhPT0gdG1heCkgdG1heCA9IHR6bWF4O1xuXG4gICAgICAgIC8vcmV0dXJuIHBvaW50IGNsb3Nlc3QgdG8gdGhlIHJheSAocG9zaXRpdmUgc2lkZSlcbiAgICAgICAgaWYgKHRtYXggPCAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXQodG1pbiA+PSAwID8gdG1pbiA6IHRtYXgsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgaXNfaW50ZXJzZWN0X2JveChib3g6IEJveDMpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJzZWN0X2JveChib3gpICE9PSBudWxsO1xuICAgIH1cblxuICAgIGludGVyc2VjdF9zcGhlcmUoc3BoZXJlOiBTcGhlcmUsIHRhcmdldDogRmxvYXQzID0gdik6IEZsb2F0MyB8IG51bGwge1xuICAgICAgICB2LmNvcHkoc3BoZXJlLmNlbnRlcikuc3ViKHRoaXMub3JpZ2luKTtcbiAgICAgICAgY29uc3QgdGNhID0gdi5kb3QodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICBjb25zdCBkMiA9IHYuZG90KHYpIC0gdGNhICogdGNhO1xuICAgICAgICBjb25zdCByYWRpdXMyID0gc3BoZXJlLnJhZGl1cyAqIHNwaGVyZS5yYWRpdXM7XG5cbiAgICAgICAgaWYgKGQyID4gcmFkaXVzMikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgdGhjID0gTWF0aC5zcXJ0KHJhZGl1czIgLSBkMik7XG5cbiAgICAgICAgLy8gdDAgPSBmaXJzdCBpbnRlcnNlY3QgcG9pbnQgLSBlbnRyYW5jZSBvbiBmcm9udCBvZiBzcGhlcmVcbiAgICAgICAgY29uc3QgdDAgPSB0Y2EgLSB0aGM7XG5cbiAgICAgICAgLy8gdDEgPSBzZWNvbmQgaW50ZXJzZWN0IHBvaW50IC0gZXhpdCBwb2ludCBvbiBiYWNrIG9mIHNwaGVyZVxuICAgICAgICBjb25zdCB0MSA9IHRjYSArIHRoYztcblxuICAgICAgICAvLyB0ZXN0IHRvIHNlZSBpZiBib3RoIHQwIGFuZCB0MSBhcmUgYmVoaW5kIHRoZSByYXkgLSBpZiBzbywgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHQwIDwgMCAmJiB0MSA8IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIHRlc3QgdG8gc2VlIGlmIHQwIGlzIGJlaGluZCB0aGUgcmF5OlxuICAgICAgICAvLyBpZiBpdCBpcywgdGhlIHJheSBpcyBpbnNpZGUgdGhlIHNwaGVyZSwgc28gcmV0dXJuIHRoZSBzZWNvbmQgZXhpdCBwb2ludCBzY2FsZWQgYnkgdDEsXG4gICAgICAgIC8vIGluIG9yZGVyIHRvIGFsd2F5cyByZXR1cm4gYW4gaW50ZXJzZWN0IHBvaW50IHRoYXQgaXMgaW4gZnJvbnQgb2YgdGhlIHJheS5cbiAgICAgICAgaWYgKHQwIDwgMCkgcmV0dXJuIHRoaXMuYXQodDEsIHRhcmdldCk7XG5cbiAgICAgICAgLy8gZWxzZSB0MCBpcyBpbiBmcm9udCBvZiB0aGUgcmF5LCBzbyByZXR1cm4gdGhlIGZpcnN0IGNvbGxpc2lvbiBwb2ludCBzY2FsZWQgYnkgdDBcbiAgICAgICAgcmV0dXJuIHRoaXMuYXQodDAsIHRhcmdldCk7XG4gICAgfVxuXG4gICAgaXNfaW50ZXJzZWN0X3NwaGVyZShzcGhlcmU6IFNwaGVyZSwgdGFyZ2V0OiBGbG9hdDMgPSB2KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyc2VjdF9zcGhlcmUoc3BoZXJlLCB0YXJnZXQpICE9PSBudWxsO1xuICAgIH1cblxuICAgIGludGVyc2VjdF90cmlhbmdsZShhOiBGbG9hdDMsIGI6IEZsb2F0MywgYzogRmxvYXQzLCBkb3VibGVfc2lkZTogYm9vbGVhbiA9IGZhbHNlLCB0YXJnZXQ6IEZsb2F0MyA9IHYpOiBGbG9hdDMgfCBudWxsIHtcbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgb2Zmc2V0IG9yaWdpbiwgZWRnZXMsIGFuZCBub3JtYWwuXG5cbiAgICAgICAgLy8gZnJvbSBodHRwOi8vd3d3Lmdlb21ldHJpY3Rvb2xzLmNvbS9HVEVuZ2luZS9JbmNsdWRlL01hdGhlbWF0aWNzL0d0ZUludHJSYXkzVHJpYW5nbGUzLmhcblxuICAgICAgICBlZGdlMS5jb3B5KGIpLnN1YihhKTtcbiAgICAgICAgZWRnZTIuY29weShjKS5zdWIoYSk7XG4gICAgICAgIEZsb2F0My5Dcm9zcyhlZGdlMSwgZWRnZTIsIG5vcm1hbCk7XG5cbiAgICAgICAgLy8gU29sdmUgUSArIHQqRCA9IGIxKkUxICsgYjIqRTIgKFEgPSBrRGlmZiwgRCA9IHJheSBkaXJlY3Rpb24sXG4gICAgICAgIC8vIEUxID0ga0VkZ2UxLCBFMiA9IGtFZGdlMiwgTiA9IENyb3NzKEUxLEUyKSkgYnlcbiAgICAgICAgLy8gICB8RG90KEQsTil8KmIxID0gc2lnbihEb3QoRCxOKSkqRG90KEQsQ3Jvc3MoUSxFMikpXG4gICAgICAgIC8vICAgfERvdChELE4pfCpiMiA9IHNpZ24oRG90KEQsTikpKkRvdChELENyb3NzKEUxLFEpKVxuICAgICAgICAvLyAgIHxEb3QoRCxOKXwqdCA9IC1zaWduKERvdChELE4pKSpEb3QoUSxOKVxuICAgICAgICBsZXQgRGROID0gdGhpcy5kaXJlY3Rpb24uZG90KG5vcm1hbCk7XG4gICAgICAgIGxldCBzaWduO1xuXG4gICAgICAgIGlmIChEZE4gPiAwKSB7XG4gICAgICAgICAgICBpZiAoIWRvdWJsZV9zaWRlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHNpZ24gPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKERkTiA8IDApIHtcbiAgICAgICAgICAgIHNpZ24gPSAtMTtcbiAgICAgICAgICAgIERkTiA9IC1EZE47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpZmYuY29weSh0aGlzLm9yaWdpbikuc3ViKGEpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3MoZGlmZiwgZWRnZTIsIGVkZ2UyKTtcbiAgICAgICAgY29uc3QgRGRReEUyID0gc2lnbiAqIHRoaXMuZGlyZWN0aW9uLmRvdChlZGdlMik7XG5cbiAgICAgICAgLy8gYjEgPCAwLCBubyBpbnRlcnNlY3Rpb25cbiAgICAgICAgaWYgKERkUXhFMiA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgRGRFMXhRID0gc2lnbiAqIHRoaXMuZGlyZWN0aW9uLmRvdChlZGdlMS5jcm9zcyhkaWZmKSk7XG4gICAgICAgIC8vIGIyIDwgMCwgbm8gaW50ZXJzZWN0aW9uXG4gICAgICAgIGlmIChEZEUxeFEgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGIxK2IyID4gMSwgbm8gaW50ZXJzZWN0aW9uXG4gICAgICAgIGlmIChEZFF4RTIgKyBEZEUxeFEgPiBEZE4pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGluZSBpbnRlcnNlY3RzIHRyaWFuZ2xlLCBjaGVjayBpZiByYXkgZG9lcy5cbiAgICAgICAgY29uc3QgUWROID0gLXNpZ24gKiBkaWZmLmRvdChub3JtYWwpO1xuICAgICAgICAvLyB0IDwgMCwgbm8gaW50ZXJzZWN0aW9uXG4gICAgICAgIGlmIChRZE4gPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJheSBpbnRlcnNlY3RzIHRyaWFuZ2xlLlxuICAgICAgICByZXR1cm4gdGhpcy5hdChRZE4gLyBEZE4sIHRhcmdldCk7XG4gICAgfVxuXG4gICAgaXNfdHJpYW5nbGVfaW50ZXJzZWN0KGE6IEZsb2F0MywgYjogRmxvYXQzLCBjOiBGbG9hdDMsIGRvdWJsZV9zaWRlOiBib29sZWFuID0gZmFsc2UsIHRhcmdldDogRmxvYXQzID0gdik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnNlY3RfdHJpYW5nbGUoYSwgYiwgYywgZG91YmxlX3NpZGUsIHRhcmdldCkgIT09IG51bGw7XG4gICAgfVxuXG4gICAgaW50ZXJzZWN0X3BsYW5lKHBsYW5lOiBQbGFuZSwgdGFyZ2V0OiBGbG9hdDMgPSB2KTogRmxvYXQzIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGRlbm9taW5hdG9yID0gcGxhbmUubm9ybWFsLmRvdCh0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgIGlmIChkZW5vbWluYXRvciA9PT0gMCkge1xuICAgICAgICAgICAgLy8gbGluZSBpcyBjb3BsYW5hciwgcmV0dXJuIG9yaWdpblxuICAgICAgICAgICAgaWYgKHBsYW5lLmRpc3RhbmNlX3RvX3BvaW50KHRoaXMub3JpZ2luKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5jb3B5KHRoaXMub3JpZ2luKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOdWxsIGlzIHByZWZlcmFibGUgdG8gdW5kZWZpbmVkIHNpbmNlIHVuZGVmaW5lZCBtZWFucy4uLi4gaXQgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ID0gLSh0aGlzLm9yaWdpbi5kb3QocGxhbmUubm9ybWFsKSArIHBsYW5lLmNvbnN0YW50KSAvIGRlbm9taW5hdG9yO1xuICAgICAgICBpZiAodCA8IDApIHJldHVybiBudWxsO1xuICAgICAgICB0aGlzLmF0KHQsIHRhcmdldCk7XG4gICAgICAgIC8vIFJldHVybiBpZiB0aGUgcmF5IG5ldmVyIGludGVyc2VjdHMgdGhlIHBsYW5lXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgYXBwbHlfbWF0cml4KG1hdDogTWF0NCk6IFJheSB7XG4gICAgICAgIHRoaXMub3JpZ2luLmFwcGx5X21hdDQobWF0KTtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24uYXBwbHlfbWF0NF9kaXJlY3Rpb25hbChtYXQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgZm9vdHByaW50X2FsbG9jIH0gZnJvbSAnLi4vbWVtb3J5L2Zvb3RwcmludCc7XG5pbXBvcnQgeyBIZWFwUG9pbnRlciB9IGZyb20gJy4uL21lbW9yeS9oZWFwX3BvaW50ZXInO1xuaW1wb3J0IHsgVHlwZWRBcnJheSB9IGZyb20gJy4uL3N0ZC90eXBlJztcbmltcG9ydCB7IGNsYW1wIH0gZnJvbSAnLi9tYXRoJztcbmltcG9ydCB7IEZsb2F0MiB9IGZyb20gJy4vc2ltZCc7XG5cbmV4cG9ydCBjbGFzcyBSZWN0IGltcGxlbWVudHMgSGVhcFBvaW50ZXIge1xuXG4gICAgc2l6ZSA9IDQ7XG4gICAgZWxlbWVudHMgPSBuZXcgRmxvYXQzMkFycmF5KDQpO1xuXG4gICAgc2V0IHgobjogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSBuO1xuICAgIH1cbiAgICBzZXQgeShuOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IG47XG4gICAgfVxuICAgIHNldCB3KG46IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gbjtcbiAgICB9XG4gICAgc2V0IGgobjogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSBuO1xuICAgIH1cblxuICAgIGdldCB4KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdO1xuICAgIH1cbiAgICBnZXQgeSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgZ2V0IHcoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMl07XG4gICAgfVxuICAgIGdldCBoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzNdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHc6IG51bWJlciA9IDAsIGg6IG51bWJlciA9IDApIHtcbiAgICAgICAgdGhpcy5zZXQoeCwgeSwgdywgaCk7XG4gICAgICAgIGZvb3RwcmludF9hbGxvYyg0KTtcbiAgICB9XG5cbiAgICByZWFkKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IGJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gYnVmZmVyW29mZnNldCArIDFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gYnVmZmVyW29mZnNldCArIDJdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gYnVmZmVyW29mZnNldCArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB3cml0ZShidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIGJ1ZmZlcltvZmZzZXRdID0gdGhpcy5lbGVtZW50c1swXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDFdID0gdGhpcy5lbGVtZW50c1sxXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDJdID0gdGhpcy5lbGVtZW50c1syXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDNdID0gdGhpcy5lbGVtZW50c1szXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlcik6IFJlY3Qge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0geDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSA9IHk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSB3O1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gaDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShyZWN0OiBSZWN0KTogUmVjdCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSByZWN0Lng7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSByZWN0Lnk7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSByZWN0Lnc7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSByZWN0Lmg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnRhaW5zKHBvaW50OiBGbG9hdDIpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHBvaW50LnggPj0gdGhpcy5lbGVtZW50c1swXSAmJiBwb2ludC55ID49IHRoaXMuZWxlbWVudHNbMV0gJiYgcG9pbnQueCA8IHRoaXMuZWxlbWVudHNbMF0gKyB0aGlzLmVsZW1lbnRzWzJdICYmIHBvaW50LnkgPCB0aGlzLmVsZW1lbnRzWzFdICsgdGhpcy5lbGVtZW50c1szXTtcbiAgICB9XG5cbiAgICBlcXVhbHMocmVjdDogUmVjdCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXSA9PT0gcmVjdC54ICYmIHRoaXMuZWxlbWVudHNbMV0gPT09IHJlY3QueSAmJiB0aGlzLmVsZW1lbnRzWzJdID09PSByZWN0LncgJiYgdGhpcy5lbGVtZW50c1szXSA9PT0gcmVjdC5oO1xuICAgIH1cblxuICAgIGxvY2F0ZShyZWN0OiBSZWN0KTogUmVjdCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gKz0gcmVjdC54O1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdICs9IHJlY3QueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsKG46IG51bWJlcik6IFJlY3Qge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKj0gbjtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSAqPSBuO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdICo9IG47XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlKG46IG51bWJlcik6IFJlY3Qge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdICo9IG47XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gKj0gbjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdHJhbnNsYXRlKHg6IG51bWJlciwgeTogbnVtYmVyKTogUmVjdCB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gKz0geDtcbiAgICAgICAgdGhpcy5lbGVtZW50c1sxXSArPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzaHJpbmsob2Zmc2V0OiBudW1iZXIsIG9mZnNldF9ob3Jpem9udGFsPzogbnVtYmVyKTogUmVjdCB7XG4gICAgICAgIGlmIChvZmZzZXRfaG9yaXpvbnRhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICs9IG9mZnNldDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbMV0gKz0gb2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IE1hdGgubWF4KDAsIHRoaXMuZWxlbWVudHNbMl0gLSBvZmZzZXQgKiAyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSBNYXRoLm1heCgwLCB0aGlzLmVsZW1lbnRzWzNdIC0gb2Zmc2V0ICogMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzBdICs9IG9mZnNldF9ob3Jpem9udGFsO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1sxXSArPSBvZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gTWF0aC5tYXgoMCwgdGhpcy5lbGVtZW50c1syXSAtIG9mZnNldF9ob3Jpem9udGFsICogMik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gTWF0aC5tYXgoMCwgdGhpcy5lbGVtZW50c1szXSAtIG9mZnNldCAqIDIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGV4cGFuZChvZmZzZXQ6IG51bWJlciwgb2Zmc2V0X2hvcml6b250YWw/OiBudW1iZXIpOiBSZWN0IHtcbiAgICAgICAgaWYgKG9mZnNldF9ob3Jpem9udGFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbMF0gLT0gb2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1sxXSAtPSBvZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzJdICs9IG9mZnNldCAqIDI7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzNdICs9IG9mZnNldCAqIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzBdIC09IG9mZnNldF9ob3Jpem9udGFsO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1sxXSAtPSBvZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzJdICs9IG9mZnNldF9ob3Jpem9udGFsICogMjtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbM10gKz0gb2Zmc2V0ICogMjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25zdHJhaW4ocG9pbnQ6IEZsb2F0Mik6IEZsb2F0MiB7XG4gICAgICAgIHBvaW50LnggPSBjbGFtcChwb2ludC54LCB0aGlzLmVsZW1lbnRzWzBdLCB0aGlzLmVsZW1lbnRzWzBdICsgdGhpcy5lbGVtZW50c1syXSk7XG4gICAgICAgIHBvaW50LnkgPSBjbGFtcChwb2ludC55LCB0aGlzLmVsZW1lbnRzWzFdLCB0aGlzLmVsZW1lbnRzWzFdICsgdGhpcy5lbGVtZW50c1szXSk7XG4gICAgICAgIHJldHVybiBwb2ludDtcbiAgICB9XG5cbiAgICBpbnRlcnNlY3QocmVjdDogUmVjdCk6IFJlY3Qge1xuICAgICAgICBjb25zdCBsID0gdGhpcy5lbGVtZW50c1swXSA+IHJlY3QueCA/IHRoaXMuZWxlbWVudHNbMF0gOiByZWN0Lng7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmVsZW1lbnRzWzFdID4gcmVjdC55ID8gdGhpcy5lbGVtZW50c1sxXSA6IHJlY3QueTtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuZWxlbWVudHNbMF0gKyB0aGlzLmVsZW1lbnRzWzJdIDwgcmVjdC54ICsgcmVjdC53ID8gdGhpcy5lbGVtZW50c1swXSArIHRoaXMuZWxlbWVudHNbMl0gOiByZWN0LnggKyByZWN0Lnc7XG4gICAgICAgIGNvbnN0IGIgPSB0aGlzLmVsZW1lbnRzWzFdICsgdGhpcy5lbGVtZW50c1szXSA8IHJlY3QueSArIHJlY3QuaCA/IHRoaXMuZWxlbWVudHNbMV0gKyB0aGlzLmVsZW1lbnRzWzNdIDogcmVjdC55ICsgcmVjdC5oO1xuICAgICAgICBpZiAobCA+PSByIHx8IHQgPj0gYikge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IDA7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gMDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbMl0gPSAwO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1szXSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzWzBdID0gbDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHNbMV0gPSB0O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IHIgLSBsO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1szXSA9IGIgLSB0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZhbGlkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1syXSA+IDAgJiYgdGhpcy5lbGVtZW50c1szXSA+IDA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBSZWN0KCR7dGhpcy5lbGVtZW50c1swXX0sICR7dGhpcy5lbGVtZW50c1sxXX0sICR7dGhpcy5lbGVtZW50c1syXX0sICR7dGhpcy5lbGVtZW50c1szXX0pYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBSRUNUX1pFUk8gPSBuZXcgUmVjdCgwLCAwLCAwLCAwKTsiLCAiaW1wb3J0IHsgZm9vdHByaW50X2FsbG9jIH0gZnJvbSAnLi4vbWVtb3J5L2Zvb3RwcmludCc7XG5pbXBvcnQgeyBIZWFwUG9pbnRlciB9IGZyb20gJy4uL21lbW9yeS9oZWFwX3BvaW50ZXInO1xuaW1wb3J0IHsgVHlwZWRBcnJheSB9IGZyb20gJy4uL3N0ZC90eXBlJztcbmltcG9ydCB7IEV1bGVyLCBFdWxlck9yZGVyIH0gZnJvbSAnLi9ldWxlcic7XG5pbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuL3NpbWQnO1xuaW1wb3J0IHsgTWF0MywgTWF0NCB9IGZyb20gJy4vc2ltZF9tYXQnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNfcXVhdGVybmlvbihvYmo6IGFueSk6IG9iaiBpcyBRdWF0ZXJuaW9uIHtcbiAgICByZXR1cm4gb2JqICYmIG9iai5pc19xdWF0ZXJuaW9uO1xufVxuXG5leHBvcnQgY2xhc3MgUXVhdGVybmlvbiBpbXBsZW1lbnRzIEhlYXBQb2ludGVyIHtcbiAgICBpc19xdWF0ZXJuaW9uOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIHNpemUgPSA0O1xuICAgIGVsZW1lbnRzID0gbmV3IEZsb2F0MzJBcnJheSg0KTtcblxuICAgIGdldCB4KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdO1xuICAgIH1cbiAgICBzZXQgeCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbMF0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgeSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1sxXTtcbiAgICB9XG4gICAgc2V0IHkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IHooKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMl07XG4gICAgfVxuICAgIHNldCB6KHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1syXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGdldCB3KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzNdO1xuICAgIH1cbiAgICBzZXQgdyh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbM10gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwLCB6OiBudW1iZXIgPSAwLCB3OiBudW1iZXIgPSAxKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgICAgIHRoaXMudyA9IHc7XG4gICAgICAgIGZvb3RwcmludF9hbGxvYyg0KTtcbiAgICB9XG5cbiAgICByZWFkKGJ1ZmZlcjogVHlwZWRBcnJheSB8IG51bWJlcltdLCBvZmZzZXQ6IG51bWJlciA9IDApOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1swXSA9IGJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzFdID0gYnVmZmVyW29mZnNldCArIDFdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzJdID0gYnVmZmVyW29mZnNldCArIDJdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzWzNdID0gYnVmZmVyW29mZnNldCArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB3cml0ZShidWZmZXI6IFR5cGVkQXJyYXkgfCBudW1iZXJbXSwgb2Zmc2V0OiBudW1iZXIgPSAwKTogdGhpcyB7XG4gICAgICAgIGJ1ZmZlcltvZmZzZXRdID0gdGhpcy5lbGVtZW50c1swXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDFdID0gdGhpcy5lbGVtZW50c1sxXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDJdID0gdGhpcy5lbGVtZW50c1syXTtcbiAgICAgICAgYnVmZmVyW29mZnNldCArIDNdID0gdGhpcy5lbGVtZW50c1szXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KC4uLmFyZ3M6IG51bWJlcltdKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGlmICghYXJncykgdGhpcy5lbGVtZW50cy5maWxsKDApO1xuICAgICAgICBlbHNlIHRoaXMuZWxlbWVudHMuc2V0KGFyZ3MpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHE6IFF1YXRlcm5pb24pOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgdGhpcy54ID0gcS54O1xuICAgICAgICB0aGlzLnkgPSBxLnk7XG4gICAgICAgIHRoaXMueiA9IHEuejtcbiAgICAgICAgdGhpcy53ID0gcS53O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9uZSgpOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyk7XG4gICAgfVxuXG4gICAgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKTogUXVhdGVybmlvbiB7XG4gICAgICAgIHJldHVybiBRdWF0ZXJuaW9uLk5vcm1hbGl6ZSh0aGlzLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcmVtdWwocTogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5NdWwocSwgdGhpcywgdGhpcyk7XG4gICAgfVxuXG4gICAgbXVsKHE6IFF1YXRlcm5pb24pOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgcmV0dXJuIFF1YXRlcm5pb24uTXVsKHRoaXMsIHEsIHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21fbWF0NChtOiBNYXQ0KTogUXVhdGVybmlvbiB7XG4gICAgICAgIHJldHVybiBRdWF0ZXJuaW9uLkZyb21NYXQ0KG0sIHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21fdW5pdF92ZWN0b3JzKHNyYzogRmxvYXQzLCBkc3Q6IEZsb2F0Myk6IFF1YXRlcm5pb24ge1xuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5Gcm9tVW5pdFZlY3RvcnMoc3JjLCBkc3QsIHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21fZXVsZXIoc3JjOiBFdWxlciwgb3JkZXIgPSBFdWxlck9yZGVyLlhZWik6IFF1YXRlcm5pb24ge1xuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5Gcm9tRXVsZXIoc3JjLCBvcmRlciwgdGhpcyk7XG4gICAgfVxuXG4gICAgZnJvbV9heGlzX2FuZ2xlKGF4aXM6IEZsb2F0MywgYW5nbGU6IG51bWJlcik6IFF1YXRlcm5pb24ge1xuICAgICAgICAvLyBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9nZW9tZXRyeS9yb3RhdGlvbnMvY29udmVyc2lvbnMvYW5nbGVUb1F1YXRlcm5pb24vaW5kZXguaHRtXG4gICAgICAgIC8vIGFzc3VtZXMgYXhpcyBpcyBub3JtYWxpemVkXG4gICAgICAgIGNvbnN0IGhhbGZBbmdsZSA9IGFuZ2xlIC8gMjtcbiAgICAgICAgY29uc3QgcyA9IE1hdGguc2luKGhhbGZBbmdsZSk7XG5cbiAgICAgICAgdGhpcy54ID0gYXhpcy54ICogcztcbiAgICAgICAgdGhpcy55ID0gYXhpcy55ICogcztcbiAgICAgICAgdGhpcy56ID0gYXhpcy56ICogcztcbiAgICAgICAgdGhpcy53ID0gTWF0aC5jb3MoaGFsZkFuZ2xlKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYFske3RoaXMueH0sICR7dGhpcy55fSwgJHt0aGlzLnp9LCAke3RoaXMud31dYDtcbiAgICB9XG5cbiAgICBzbGVycChxOiBRdWF0ZXJuaW9uLCB0OiBudW1iZXIpOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgUXVhdGVybmlvbi5TbGVycCh0aGlzLCBxLCB0LCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uanVnYXRlKCk6IFF1YXRlcm5pb24ge1xuICAgICAgICByZXR1cm4gUXVhdGVybmlvbi5Db25qdWdhdGUodGhpcywgdGhpcyk7XG4gICAgfVxuXG4gICAgaW52ZXJzZSgpOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgcmV0dXJuIFF1YXRlcm5pb24uSW52ZXJzZSh0aGlzLCB0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgQ29uanVnYXRlKHE6IFF1YXRlcm5pb24sIGRzdDogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICBkc3QueCA9IC1xLng7XG4gICAgICAgIGRzdC55ID0gLXEueTtcbiAgICAgICAgZHN0LnogPSAtcS56O1xuICAgICAgICBkc3QudyA9IHEudztcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRXF1YWxzKGE6IFF1YXRlcm5pb24sIGI6IFF1YXRlcm5pb24pOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGEueCA9PT0gYi54ICYmIGEueSA9PT0gYi55ICYmIGEueiA9PT0gYi56ICYmIGEudyA9PT0gYi53O1xuICAgIH1cblxuICAgIHN0YXRpYyBNdWwoYTogUXVhdGVybmlvbiwgYjogUXVhdGVybmlvbiwgZHN0PzogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICBpZiAoZHN0ID09PSB1bmRlZmluZWQpIGRzdCA9IG5ldyBRdWF0ZXJuaW9uKCk7XG4gICAgICAgIC8vIGZyb20gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvYWxnZWJyYS9yZWFsTm9ybWVkQWxnZWJyYS9xdWF0ZXJuaW9ucy9jb2RlL2luZGV4Lmh0bVxuICAgICAgICBjb25zdCBxYXggPSBhLngsXG4gICAgICAgICAgICBxYXkgPSBhLnksXG4gICAgICAgICAgICBxYXogPSBhLnosXG4gICAgICAgICAgICBxYXcgPSBhLnc7XG4gICAgICAgIGNvbnN0IHFieCA9IGIueCxcbiAgICAgICAgICAgIHFieSA9IGIueSxcbiAgICAgICAgICAgIHFieiA9IGIueixcbiAgICAgICAgICAgIHFidyA9IGIudztcblxuICAgICAgICBkc3QueCA9IHFheCAqIHFidyArIHFhdyAqIHFieCArIHFheSAqIHFieiAtIHFheiAqIHFieTtcbiAgICAgICAgZHN0LnkgPSBxYXkgKiBxYncgKyBxYXcgKiBxYnkgKyBxYXogKiBxYnggLSBxYXggKiBxYno7XG4gICAgICAgIGRzdC56ID0gcWF6ICogcWJ3ICsgcWF3ICogcWJ6ICsgcWF4ICogcWJ5IC0gcWF5ICogcWJ4O1xuICAgICAgICBkc3QudyA9IHFhdyAqIHFidyAtIHFheCAqIHFieCAtIHFheSAqIHFieSAtIHFheiAqIHFiejtcblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBGcm9tVW5pdFZlY3RvcnMoYTogRmxvYXQzLCBiOiBGbG9hdDMsIGRzdDogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICAvLyBhc3N1bWVzIGRpcmVjdGlvbiB2ZWN0b3JzIHZGcm9tIGFuZCB2VG8gYXJlIG5vcm1hbGl6ZWRcbiAgICAgICAgbGV0IHIgPSBhLmRvdChiKSArIDE7XG5cbiAgICAgICAgaWYgKHIgPCBOdW1iZXIuRVBTSUxPTikge1xuICAgICAgICAgICAgLy8gdkZyb20gYW5kIHZUbyBwb2ludCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25zXG4gICAgICAgICAgICByID0gMDtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhhLngpID4gTWF0aC5hYnMoYS56KSkge1xuICAgICAgICAgICAgICAgIGRzdC54ID0gLWEueTtcbiAgICAgICAgICAgICAgICBkc3QueSA9IGEueDtcbiAgICAgICAgICAgICAgICBkc3QueiA9IDA7XG4gICAgICAgICAgICAgICAgZHN0LncgPSByO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkc3QueCA9IDA7XG4gICAgICAgICAgICAgICAgZHN0LnkgPSAtYS56O1xuICAgICAgICAgICAgICAgIGRzdC56ID0gYS55O1xuICAgICAgICAgICAgICAgIGRzdC53ID0gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNyb3NzVmVjdG9ycyggdkZyb20sIHZUbyApOyAvLyBpbmxpbmVkIHRvIGF2b2lkIGN5Y2xpYyBkZXBlbmRlbmN5IG9uIFZlY3RvcjNcbiAgICAgICAgICAgIGRzdC54ID0gYS55ICogYi56IC0gYS56ICogYi55O1xuICAgICAgICAgICAgZHN0LnkgPSBhLnogKiBiLnggLSBhLnggKiBiLno7XG4gICAgICAgICAgICBkc3QueiA9IGEueCAqIGIueSAtIGEueSAqIGIueDtcbiAgICAgICAgICAgIGRzdC53ID0gcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHN0Lm5vcm1hbGl6ZSgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBGcm9tTWF0NChtOiBNYXQ0LCBkc3Q6IFF1YXRlcm5pb24pOiBRdWF0ZXJuaW9uIHtcbiAgICAgICAgLy8gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvZ2VvbWV0cnkvcm90YXRpb25zL2NvbnZlcnNpb25zL21hdHJpeFRvUXVhdGVybmlvbi9pbmRleC5odG1cbiAgICAgICAgLy8gYXNzdW1lcyB0aGUgdXBwZXIgM3gzIG9mIG0gaXMgYSBwdXJlIHJvdGF0aW9uIG1hdHJpeCAoaS5lLCB1bnNjYWxlZClcbiAgICAgICAgY29uc3QgdGUgPSBtLmVsZW1lbnRzO1xuICAgICAgICBjb25zdCBtMTEgPSB0ZVswXTtcbiAgICAgICAgY29uc3QgbTEyID0gdGVbNF07XG4gICAgICAgIGNvbnN0IG0xMyA9IHRlWzhdO1xuICAgICAgICBjb25zdCBtMjEgPSB0ZVsxXTtcbiAgICAgICAgY29uc3QgbTIyID0gdGVbNV07XG4gICAgICAgIGNvbnN0IG0yMyA9IHRlWzldO1xuICAgICAgICBjb25zdCBtMzEgPSB0ZVsyXTtcbiAgICAgICAgY29uc3QgbTMyID0gdGVbNl07XG4gICAgICAgIGNvbnN0IG0zMyA9IHRlWzEwXTtcbiAgICAgICAgY29uc3QgdHJhY2UgPSBtMTEgKyBtMjIgKyBtMzM7XG4gICAgICAgIGxldCBzO1xuXG4gICAgICAgIGlmICh0cmFjZSA+IDApIHtcbiAgICAgICAgICAgIHMgPSAwLjUgLyBNYXRoLnNxcnQodHJhY2UgKyAxLjApO1xuICAgICAgICAgICAgZHN0LncgPSAwLjI1IC8gcztcbiAgICAgICAgICAgIGRzdC54ID0gKG0zMiAtIG0yMykgKiBzO1xuICAgICAgICAgICAgZHN0LnkgPSAobTEzIC0gbTMxKSAqIHM7XG4gICAgICAgICAgICBkc3QueiA9IChtMjEgLSBtMTIpICogcztcbiAgICAgICAgfSBlbHNlIGlmIChtMTEgPiBtMjIgJiYgbTExID4gbTMzKSB7XG4gICAgICAgICAgICBzID0gMi4wICogTWF0aC5zcXJ0KDEuMCArIG0xMSAtIG0yMiAtIG0zMyk7XG4gICAgICAgICAgICBkc3QudyA9IChtMzIgLSBtMjMpIC8gcztcbiAgICAgICAgICAgIGRzdC54ID0gMC4yNSAqIHM7XG4gICAgICAgICAgICBkc3QueSA9IChtMTIgKyBtMjEpIC8gcztcbiAgICAgICAgICAgIGRzdC56ID0gKG0xMyArIG0zMSkgLyBzO1xuICAgICAgICB9IGVsc2UgaWYgKG0yMiA+IG0zMykge1xuICAgICAgICAgICAgcyA9IDIuMCAqIE1hdGguc3FydCgxLjAgKyBtMjIgLSBtMTEgLSBtMzMpO1xuICAgICAgICAgICAgZHN0LncgPSAobTEzIC0gbTMxKSAvIHM7XG4gICAgICAgICAgICBkc3QueCA9IChtMTIgKyBtMjEpIC8gcztcbiAgICAgICAgICAgIGRzdC55ID0gMC4yNSAqIHM7XG4gICAgICAgICAgICBkc3QueiA9IChtMjMgKyBtMzIpIC8gcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMgPSAyLjAgKiBNYXRoLnNxcnQoMS4wICsgbTMzIC0gbTExIC0gbTIyKTtcbiAgICAgICAgICAgIGRzdC53ID0gKG0yMSAtIG0xMikgLyBzO1xuICAgICAgICAgICAgZHN0LnggPSAobTEzICsgbTMxKSAvIHM7XG4gICAgICAgICAgICBkc3QueSA9IChtMjMgKyBtMzIpIC8gcztcbiAgICAgICAgICAgIGRzdC56ID0gMC4yNSAqIHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgRnJvbU1hdDMobTogTWF0MywgZHN0OiBRdWF0ZXJuaW9uKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGNvbnN0IHRlID0gbS5lbGVtZW50cztcbiAgICAgICAgY29uc3QgbTExID0gdGVbMF07XG4gICAgICAgIGNvbnN0IG0xMiA9IHRlWzNdO1xuICAgICAgICBjb25zdCBtMTMgPSB0ZVs2XTtcbiAgICAgICAgY29uc3QgbTIxID0gdGVbMV07XG4gICAgICAgIGNvbnN0IG0yMiA9IHRlWzRdO1xuICAgICAgICBjb25zdCBtMjMgPSB0ZVs3XTtcbiAgICAgICAgY29uc3QgbTMxID0gdGVbMl07XG4gICAgICAgIGNvbnN0IG0zMiA9IHRlWzVdO1xuICAgICAgICBjb25zdCBtMzMgPSB0ZVs5XTtcblxuICAgICAgICBjb25zdCB0cmFjZSA9IG0xMSArIG0yMiArIG0zMztcbiAgICAgICAgbGV0IHM7XG5cbiAgICAgICAgaWYgKHRyYWNlID4gMCkge1xuICAgICAgICAgICAgcyA9IDAuNSAvIE1hdGguc3FydCh0cmFjZSArIDEuMCk7XG4gICAgICAgICAgICBkc3QudyA9IDAuMjUgLyBzO1xuICAgICAgICAgICAgZHN0LnggPSAobTMyIC0gbTIzKSAqIHM7XG4gICAgICAgICAgICBkc3QueSA9IChtMTMgLSBtMzEpICogcztcbiAgICAgICAgICAgIGRzdC56ID0gKG0yMSAtIG0xMikgKiBzO1xuICAgICAgICB9IGVsc2UgaWYgKG0xMSA+IG0yMiAmJiBtMTEgPiBtMzMpIHtcbiAgICAgICAgICAgIHMgPSAyLjAgKiBNYXRoLnNxcnQoMS4wICsgbTExIC0gbTIyIC0gbTMzKTtcbiAgICAgICAgICAgIGRzdC53ID0gKG0zMiAtIG0yMykgLyBzO1xuICAgICAgICAgICAgZHN0LnggPSAwLjI1ICogcztcbiAgICAgICAgICAgIGRzdC55ID0gKG0xMiArIG0yMSkgLyBzO1xuICAgICAgICAgICAgZHN0LnogPSAobTEzICsgbTMxKSAvIHM7XG4gICAgICAgIH0gZWxzZSBpZiAobTIyID4gbTMzKSB7XG4gICAgICAgICAgICBzID0gMi4wICogTWF0aC5zcXJ0KDEuMCArIG0yMiAtIG0xMSAtIG0zMyk7XG4gICAgICAgICAgICBkc3QudyA9IChtMTMgLSBtMzEpIC8gcztcbiAgICAgICAgICAgIGRzdC54ID0gKG0xMiArIG0yMSkgLyBzO1xuICAgICAgICAgICAgZHN0LnkgPSAwLjI1ICogcztcbiAgICAgICAgICAgIGRzdC56ID0gKG0yMyArIG0zMikgLyBzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcyA9IDIuMCAqIE1hdGguc3FydCgxLjAgKyBtMzMgLSBtMTEgLSBtMjIpO1xuICAgICAgICAgICAgZHN0LncgPSAobTIxIC0gbTEyKSAvIHM7XG4gICAgICAgICAgICBkc3QueCA9IChtMTMgKyBtMzEpIC8gcztcbiAgICAgICAgICAgIGRzdC55ID0gKG0yMyArIG0zMikgLyBzO1xuICAgICAgICAgICAgZHN0LnogPSAwLjI1ICogcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIFNsZXJwKGE6IFF1YXRlcm5pb24sIGI6IFF1YXRlcm5pb24sIHQ6IG51bWJlciwgZHN0OiBRdWF0ZXJuaW9uKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgICAgICBkc3QuY29weShhKTtcbiAgICAgICAgICAgIHJldHVybiBkc3Q7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodCA9PT0gMSkge1xuICAgICAgICAgICAgZHN0LmNvcHkoYik7XG4gICAgICAgICAgICByZXR1cm4gZHN0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeCA9IGEueDtcbiAgICAgICAgY29uc3QgeSA9IGEueTtcbiAgICAgICAgY29uc3QgeiA9IGEuejtcbiAgICAgICAgY29uc3QgdyA9IGEudztcblxuICAgICAgICBsZXQgY29zSGFsZlRoZXRhID0gdyAqIGIudyArIHggKiBiLnggKyB5ICogYi55ICsgeiAqIGIuejtcblxuICAgICAgICBpZiAoY29zSGFsZlRoZXRhIDwgMCkge1xuICAgICAgICAgICAgZHN0LncgPSAtYi53O1xuICAgICAgICAgICAgZHN0LnggPSAtYi54O1xuICAgICAgICAgICAgZHN0LnkgPSAtYi55O1xuICAgICAgICAgICAgZHN0LnogPSAtYi56O1xuXG4gICAgICAgICAgICBjb3NIYWxmVGhldGEgPSAtY29zSGFsZlRoZXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZHN0LmNvcHkoYik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29zSGFsZlRoZXRhID49IDEuMCkge1xuICAgICAgICAgICAgZHN0LncgPSB3O1xuICAgICAgICAgICAgZHN0LnggPSB4O1xuICAgICAgICAgICAgZHN0LnkgPSB5O1xuICAgICAgICAgICAgZHN0LnogPSB6O1xuICAgICAgICAgICAgcmV0dXJuIGRzdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNxclNpbkhhbGZUaGV0YSA9IDEuMCAtIGNvc0hhbGZUaGV0YSAqIGNvc0hhbGZUaGV0YTtcblxuICAgICAgICBpZiAoc3FyU2luSGFsZlRoZXRhIDw9IE51bWJlci5FUFNJTE9OKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gMSAtIHQ7XG4gICAgICAgICAgICBkc3QudyA9IHMgKiB3ICsgdCAqIGEudztcbiAgICAgICAgICAgIGRzdC54ID0gcyAqIHggKyB0ICogYS54O1xuICAgICAgICAgICAgZHN0LnkgPSBzICogeSArIHQgKiBhLnk7XG4gICAgICAgICAgICBkc3QueiA9IHMgKiB6ICsgdCAqIGEuejtcbiAgICAgICAgICAgIGRzdC5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIHJldHVybiBkc3Q7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaW5IYWxmVGhldGEgPSBNYXRoLnNxcnQoc3FyU2luSGFsZlRoZXRhKTtcbiAgICAgICAgY29uc3QgaGFsZlRoZXRhID0gTWF0aC5hdGFuMihzaW5IYWxmVGhldGEsIGNvc0hhbGZUaGV0YSk7XG4gICAgICAgIGNvbnN0IHJhdGlvQSA9IE1hdGguc2luKCgxIC0gdCkgKiBoYWxmVGhldGEpIC8gc2luSGFsZlRoZXRhO1xuICAgICAgICBjb25zdCByYXRpb0IgPSBNYXRoLnNpbih0ICogaGFsZlRoZXRhKSAvIHNpbkhhbGZUaGV0YTtcblxuICAgICAgICBkc3QudyA9IHcgKiByYXRpb0EgKyBiLncgKiByYXRpb0I7XG4gICAgICAgIGRzdC54ID0geCAqIHJhdGlvQSArIGIueCAqIHJhdGlvQjtcbiAgICAgICAgZHN0LnkgPSB5ICogcmF0aW9BICsgYi55ICogcmF0aW9CO1xuICAgICAgICBkc3QueiA9IHogKiByYXRpb0EgKyBiLnogKiByYXRpb0I7XG5cbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTm9ybWFsaXplKHNyYzogUXVhdGVybmlvbiwgZHN0PzogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICBpZiAoZHN0ID09PSB1bmRlZmluZWQpIGRzdCA9IG5ldyBRdWF0ZXJuaW9uKCk7XG4gICAgICAgIGxldCBsID0gc3JjLmxlbmd0aCgpO1xuICAgICAgICBpZiAobCA9PT0gMCkge1xuICAgICAgICAgICAgZHN0LnggPSAwO1xuICAgICAgICAgICAgZHN0LnkgPSAwO1xuICAgICAgICAgICAgZHN0LnogPSAwO1xuICAgICAgICAgICAgZHN0LncgPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbCA9IDEgLyBsO1xuICAgICAgICAgICAgZHN0LnggKj0gbDtcbiAgICAgICAgICAgIGRzdC55ICo9IGw7XG4gICAgICAgICAgICBkc3QueiAqPSBsO1xuICAgICAgICAgICAgZHN0LncgKj0gbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBNdWx0aXBseShhOiBRdWF0ZXJuaW9uLCBiOiBRdWF0ZXJuaW9uLCBkc3Q/OiBRdWF0ZXJuaW9uKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGlmIChkc3QgPT09IHVuZGVmaW5lZCkgZHN0ID0gbmV3IFF1YXRlcm5pb24oKTtcbiAgICAgICAgY29uc3QgcWF4ID0gYS54LFxuICAgICAgICAgICAgcWF5ID0gYS55LFxuICAgICAgICAgICAgcWF6ID0gYS56LFxuICAgICAgICAgICAgcWF3ID0gYS53O1xuICAgICAgICBjb25zdCBxYnggPSBiLngsXG4gICAgICAgICAgICBxYnkgPSBiLnksXG4gICAgICAgICAgICBxYnogPSBiLnosXG4gICAgICAgICAgICBxYncgPSBiLnc7XG4gICAgICAgIGRzdC54ID0gcWF4ICogcWJ3ICsgcWF3ICogcWJ4ICsgcWF5ICogcWJ6IC0gcWF6ICogcWJ5O1xuICAgICAgICBkc3QueSA9IHFheSAqIHFidyArIHFhdyAqIHFieSArIHFheiAqIHFieCAtIHFheCAqIHFiejtcbiAgICAgICAgZHN0LnogPSBxYXogKiBxYncgKyBxYXcgKiBxYnogKyBxYXggKiBxYnkgLSBxYXkgKiBxYng7XG4gICAgICAgIGRzdC53ID0gcWF3ICogcWJ3IC0gcWF4ICogcWJ4IC0gcWF5ICogcWJ5IC0gcWF6ICogcWJ6O1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBGcm9tRXVsZXIoZTogRXVsZXIsIG9yZGVyOiBFdWxlck9yZGVyID0gRXVsZXJPcmRlci5YWVosIGRzdDogUXVhdGVybmlvbik6IFF1YXRlcm5pb24ge1xuICAgICAgICBjb25zdCB4ID0gZS54O1xuICAgICAgICBjb25zdCB5ID0gZS55O1xuICAgICAgICBjb25zdCB6ID0gZS56O1xuXG4gICAgICAgIC8vIGh0dHA6Ly93d3cubWF0aHdvcmtzLmNvbS9tYXRsYWJjZW50cmFsL2ZpbGVleGNoYW5nZS9cbiAgICAgICAgLy8gXHQyMDY5Ni1mdW5jdGlvbi10by1jb252ZXJ0LWJldHdlZW4tZGNtLWV1bGVyLWFuZ2xlcy1xdWF0ZXJuaW9ucy1hbmQtZXVsZXItdmVjdG9ycy9cbiAgICAgICAgLy9cdGNvbnRlbnQvU3BpbkNhbGMubVxuXG4gICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zO1xuICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbjtcblxuICAgICAgICBjb25zdCBjMSA9IGNvcyh4IC8gMik7XG4gICAgICAgIGNvbnN0IGMyID0gY29zKHkgLyAyKTtcbiAgICAgICAgY29uc3QgYzMgPSBjb3MoeiAvIDIpO1xuXG4gICAgICAgIGNvbnN0IHMxID0gc2luKHggLyAyKTtcbiAgICAgICAgY29uc3QgczIgPSBzaW4oeSAvIDIpO1xuICAgICAgICBjb25zdCBzMyA9IHNpbih6IC8gMik7XG5cbiAgICAgICAgc3dpdGNoIChvcmRlcikge1xuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLlhZWjpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyArIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLllYWjpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyArIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyAtIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyArIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLlpYWTpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLlpZWDpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyAtIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyArIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLllaWDpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyArIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyAtIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFdWxlck9yZGVyLlhaWTpcbiAgICAgICAgICAgICAgICBkc3QueCA9IHMxICogYzIgKiBjMyAtIGMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcbiAgICAgICAgICAgICAgICBkc3QueiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcbiAgICAgICAgICAgICAgICBkc3QudyA9IGMxICogYzIgKiBjMyArIHMxICogczIgKiBzMztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3Vua25vd24gb3JkZXI6ICcgKyBvcmRlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBJbnZlcnNlKHNyYzogUXVhdGVybmlvbiwgZHN0OiBRdWF0ZXJuaW9uKTogUXVhdGVybmlvbiB7XG4gICAgICAgIGRzdC54ID0gLXNyYy54O1xuICAgICAgICBkc3QueSA9IC1zcmMueTtcbiAgICAgICAgZHN0LnogPSAtc3JjLno7XG4gICAgICAgIGRzdC53ID0gc3JjLnc7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgUVVBVEVSTklPTl9JREVOVElUWSA9IG5ldyBRdWF0ZXJuaW9uKDAsIDAsIDAsIDEpOyIsICJpbXBvcnQgeyBDb25zdHJ1Y3RvciwgVHlwZWRBcnJheSB9IGZyb20gJy4uL3N0ZC90eXBlJztcblxuaW50ZXJmYWNlIFJhbmdlIHtcbiAgICBzdGFydDogbnVtYmVyO1xuICAgIGNvdW50OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9pbnRlcjxUPiB7XG4gICAgcmVhZG9ubHkgcmFuZ2U6IFJhbmdlO1xuICAgIHJlYWRvbmx5IHN0cmlkZTogbnVtYmVyO1xuICAgIGJ1ZmZlcjogVDtcbn1cblxuZXhwb3J0IGNsYXNzIEhlYXAge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgYnVmZmVyOiBBcnJheUJ1ZmZlcjtcbiAgICB0YWlsOiBudW1iZXI7XG5cbiAgICByZWxlYXNlZDogUmFuZ2VbXSA9IFtdO1xuXG4gICAgLy8gbWVnYSBieXRlc1xuICAgIGhlYXBfc2l6ZTogbnVtYmVyID0gNDA5NjtcblxuICAgIHByaXZhdGUgbGlmZV9jeWNsZTogbnVtYmVyID0gMTAyNDtcbiAgICBwcml2YXRlIGxpZmVfaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5idWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIodGhpcy5oZWFwX3NpemUpO1xuICAgICAgICB0aGlzLnRhaWwgPSAwO1xuICAgIH1cblxuICAgIGFsbG9jPFQgZXh0ZW5kcyBUeXBlZEFycmF5PihzaXplOiBudW1iZXIsIGNvbnN0cnVjdG9yOiBDb25zdHJ1Y3RvcjxUPik6IFBvaW50ZXI8VD4ge1xuICAgICAgICBjb25zdCBzdHJpZGUgPSAoY29uc3RydWN0b3IgYXMgYW55KS5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLnRhaWw7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gc2l6ZSAqIHN0cmlkZTtcblxuICAgICAgICAvLyAzMiBiaXQgYWxpZ25tZW50XG4gICAgICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbCArIGNvdW50ICsgKDQgLSAoY291bnQgJSA0KSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJhbmdlOiB7IHN0YXJ0LCBjb3VudCB9LFxuICAgICAgICAgICAgc3RyaWRlLFxuICAgICAgICAgICAgYnVmZmVyOiBuZXcgY29uc3RydWN0b3IodGhpcy5idWZmZXIsIHN0YXJ0LCBzaXplKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmcmVlPFQ+KHBvaW50ZXI6IFBvaW50ZXI8VD4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlZC5wdXNoKHBvaW50ZXIucmFuZ2UpO1xuICAgIH1cblxuICAgIG1hbmFnZSA9ICgpID0+IHtcbiAgICAgICAgLy9UT0RPOiBtb3ZlIHJlbGVhc2UgbWVtb3J5ICYgY29weSBpbiB1c2VkIG1lbW9yeSB0byB0aGUgaGVhZCBvZiBoZWFwXG4gICAgICAgIHRoaXMubGlmZV9pbmRleCA9IHRoaXMubGlmZV9pbmRleCsrICUgdGhpcy5saWZlX2N5Y2xlO1xuICAgIH07XG59XG5cbmNvbnN0IE1lbW9yeUhlYXAgPSBuZXcgSGVhcCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVtY3B5PFQgZXh0ZW5kcyBUeXBlZEFycmF5Pihkc3Q6IFBvaW50ZXI8VD4sIHNyYzogUG9pbnRlcjxUPik6IFBvaW50ZXI8VD4ge1xuICAgIGRzdC5idWZmZXIuc2V0KHNyYy5idWZmZXIpO1xuICAgIHJldHVybiBkc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWxsb2M8VCBleHRlbmRzIFR5cGVkQXJyYXk+KHNpemU6IG51bWJlciwgY29uc3RydWN0b3I6IENvbnN0cnVjdG9yPFQ+KTogUG9pbnRlcjxUPiB7XG4gICAgcmV0dXJuIE1lbW9yeUhlYXAuYWxsb2Moc2l6ZSwgY29uc3RydWN0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZnJlZTxUIGV4dGVuZHMgVHlwZWRBcnJheT4ocG9pbnRlcjogUG9pbnRlcjxUPik6IHZvaWQge1xuICAgIE1lbW9yeUhlYXAuZnJlZShwb2ludGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhlYXB1c2FnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHttZW1fZm9ybWF0KE1lbW9yeUhlYXAudGFpbCl9LyR7bWVtX2Zvcm1hdChNZW1vcnlIZWFwLmhlYXBfc2l6ZSl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lbXVzYWdlKCk6IHN0cmluZyB7XG4gICAgbGV0IHRvdGFsID0gTWVtb3J5SGVhcC50YWlsO1xuICAgIGlmIChwZXJmb3JtYW5jZSAmJiAocGVyZm9ybWFuY2UgYXMgYW55KS5tZW1vcnkpIHtcbiAgICAgICAgdG90YWwgPSAocGVyZm9ybWFuY2UgYXMgYW55KS5tZW1vcnkudG90YWxKU0hlYXBTaXplO1xuICAgIH1cbiAgICByZXR1cm4gbWVtX2Zvcm1hdCh0b3RhbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZW1jeWNsZSgpOiB2b2lkIHtcbiAgICBNZW1vcnlIZWFwLm1hbmFnZSgpO1xufVxuXG5jb25zdCBNQVhfQiA9IDE7XG5jb25zdCBNQVhfS0IgPSBNQVhfQiAqIDEwMjQ7XG5jb25zdCBNQVhfTUIgPSBNQVhfS0IgKiAxMDI0O1xuY29uc3QgTUFYX0dCID0gTUFYX01CICogMTAyNDtcbmNvbnN0IE1BWF9UQiA9IE1BWF9HQiAqIDEwMjQ7XG5jb25zdCBNQVhfUEIgPSBNQVhfVEIgKiAxMDI0O1xuZnVuY3Rpb24gbWVtX2Zvcm1hdChzOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGlmIChzIDw9IE1BWF9LQikge1xuICAgICAgICByZXR1cm4gYCR7c31CYDtcbiAgICB9IGVsc2UgaWYgKHMgPD0gTUFYX01CKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLmZsb29yKHMgLyBNQVhfS0IpfUtgO1xuICAgIH0gZWxzZSBpZiAocyA8PSBNQVhfR0IpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGguZmxvb3IocyAvIE1BWF9NQil9TWA7XG4gICAgfSBlbHNlIGlmIChzIDw9IE1BWF9UQikge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihzIC8gTUFYX0dCKX1HYDtcbiAgICB9IGVsc2UgaWYgKHMgPD0gTUFYX1BCKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLmZsb29yKHMgLyBNQVhfVEIpfVRgO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGB3YWtlIHVwLCB5b3UgZG9uJ3QgaGF2ZSBtZW1vcnkgdGhhdCBtdWNoLmA7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IGZvb3RwcmludF9hbGxvYyB9IGZyb20gJy4uL21lbW9yeSc7XG5pbXBvcnQgeyBjbGFtcCwgbGVycCB9IGZyb20gJy4vbWF0aCc7XG5pbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuL3NpbWQnO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJpY2FsIHtcbiAgICByYWRpdXM6IG51bWJlcjtcbiAgICB0aGV0YTogbnVtYmVyO1xuICAgIHBoaTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IocmFkaXVzPzogbnVtYmVyLCB0aGV0YT86IG51bWJlciwgcGhpPzogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucmFkaXVzID0gcmFkaXVzIHx8IDE7XG4gICAgICAgIHRoaXMudGhldGEgPSB0aGV0YSB8fCAwO1xuICAgICAgICB0aGlzLnBoaSA9IHBoaSB8fCAwO1xuICAgICAgICBmb290cHJpbnRfYWxsb2MoMyk7XG4gICAgfVxuXG4gICAgZnJvbV9mbG9hdDModjogRmxvYXQzKTogU3BoZXJpY2FsIHtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSB2Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMucmFkaXVzID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnRoZXRhID0gMDtcbiAgICAgICAgICAgIHRoaXMucGhpID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGhldGEgPSBNYXRoLmFjb3MoY2xhbXAodi55IC8gdGhpcy5yYWRpdXMsIC0xLCAxKSk7XG4gICAgICAgICAgICB0aGlzLnBoaSA9IE1hdGguYXRhbjIodi54LCB2LnopO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldChyYWRpdXM6IG51bWJlciwgdGhldGE6IG51bWJlciwgcGhpOiBudW1iZXIpOiBTcGhlcmljYWwge1xuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICAgICAgdGhpcy50aGV0YSA9IHRoZXRhO1xuICAgICAgICB0aGlzLnBoaSA9IHBoaTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShzOiBTcGhlcmljYWwpOiBTcGhlcmljYWwge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQocy5yYWRpdXMsIHMudGhldGEsIHMucGhpKTtcbiAgICB9XG5cbiAgICBjbG9uZSgpOiBTcGhlcmljYWwge1xuICAgICAgICByZXR1cm4gbmV3IFNwaGVyaWNhbCh0aGlzLnJhZGl1cywgdGhpcy50aGV0YSwgdGhpcy5waGkpO1xuICAgIH1cblxuICAgIGxlcnAoYTogU3BoZXJpY2FsLCBpOiBudW1iZXIpOiBTcGhlcmljYWwge1xuICAgICAgICByZXR1cm4gU3BoZXJpY2FsLkxlcnAodGhpcywgYSwgaSwgdGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIExlcnAoc3RhcnQ6IFNwaGVyaWNhbCwgZW5kOiBTcGhlcmljYWwsIGk6IG51bWJlciwgZHN0OiBTcGhlcmljYWwpOiBTcGhlcmljYWwge1xuICAgICAgICBpZiAoZHN0ID09PSB1bmRlZmluZWQpIGRzdCA9IG5ldyBTcGhlcmljYWwoKTtcbiAgICAgICAgZHN0LnJhZGl1cyA9IGxlcnAoc3RhcnQucmFkaXVzLCBlbmQucmFkaXVzLCBpKTtcbiAgICAgICAgZHN0LnRoZXRhID0gbGVycChzdGFydC50aGV0YSwgZW5kLnRoZXRhLCBpKTtcbiAgICAgICAgZHN0LnBoaSA9IGxlcnAoc3RhcnQucGhpLCBlbmQucGhpLCBpKTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgQm94MyB9IGZyb20gJy4uL21hdGgvYm94JztcbmltcG9ydCB7IERlZ3JlZVRvUmFkaWFuIH0gZnJvbSAnLi4vbWF0aC9tYXRoJztcbmltcG9ydCB7IEZsb2F0MyB9IGZyb20gJy4uL21hdGgvc2ltZCc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9zaW1kX21hdCc7XG5pbXBvcnQgeyBRdWF0ZXJuaW9uIH0gZnJvbSAnLi4vbWF0aC9zaW1kX3F1YXRlcm5pb24nO1xuXG5jb25zdCByb3RhdGVfbWF0cml4ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGVudW0gQ2FtZXJhTW9kZSB7XG4gICAgUGVyc3BlY3RpdmUsXG4gICAgT3J0aG9ncmFwaGljLFxufVxuXG5leHBvcnQgY2xhc3MgQ2FtZXJhIHtcbiAgICBwcml2YXRlIF9tb2RlOiBDYW1lcmFNb2RlID0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZTtcbiAgICBzZXQgbW9kZSh2YWx1ZTogQ2FtZXJhTW9kZSkge1xuICAgICAgICB0aGlzLl9tb2RlID0gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZSh0aGlzLnZlcnRpY2FsX2ZvdiwgdGhpcy5hc3BlY3QsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vcnRob2dyYXBoaWNzKHRoaXMudmVydGljYWxfc2l6ZSwgdGhpcy5ob3Jpem9udGFsX3NpemUsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBtb2RlKCk6IENhbWVyYU1vZGUgeyByZXR1cm4gdGhpcy5fbW9kZTsgfVxuXG5cbiAgICBsb2NhdGlvbjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuICAgIHJvdGF0aW9uOiBRdWF0ZXJuaW9uID0gbmV3IFF1YXRlcm5pb24oKTtcbiAgICBzY2FsZTogRmxvYXQzID0gbmV3IEZsb2F0MygxLCAxLCAxKTtcblxuICAgIHdvcmxkX21hdHJpeDogTWF0NCA9IG5ldyBNYXQ0KCk7XG4gICAgbG9jYWxfbWF0cml4OiBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuICAgIHZpZXdfbWF0cml4OiBNYXQ0ID0gbmV3IE1hdDQoKTtcbiAgICBwcm9qZWN0aW9uX21hdHJpeDogTWF0NCA9IG5ldyBNYXQ0KCk7XG5cbiAgICB2aWV3X3Byb2plY3Rpb25fbWF0cml4OiBNYXQ0ID0gbmV3IE1hdDQoKTtcbiAgICBpbnZlcnNlX3Byb2plY3Rpb25fbWF0cml4OiBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuICAgIHVwOiBGbG9hdDMgPSBuZXcgRmxvYXQzKDAsIDEsIDApO1xuXG4gICAgdmVydGljYWxfZm92OiBudW1iZXIgPSA0NTtcbiAgICBhc3BlY3Q6IG51bWJlciA9IDEuMDtcblxuICAgIHZlcnRpY2FsX3NpemU6IG51bWJlciA9IDEwMC4wO1xuICAgIGhvcml6b250YWxfc2l6ZTogbnVtYmVyID0gMTAwLjA7XG5cbiAgICBuZWFyOiBudW1iZXIgPSAxO1xuICAgIGZhcjogbnVtYmVyID0gMTAwMDA7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZSh0aGlzLnZlcnRpY2FsX2ZvdiwgdGhpcy5hc3BlY3QsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgIH1cblxuICAgIHVwZGF0ZV93b3JsZF9tYXRyaXgoKTogdm9pZCB7XG4gICAgICAgIHRoaXMud29ybGRfbWF0cml4LmNvbXBvc2UodGhpcy5sb2NhdGlvbiwgdGhpcy5yb3RhdGlvbiwgdGhpcy5zY2FsZSk7XG4gICAgfVxuXG4gICAgdXBkYXRlX3ZpZXdfbWF0cml4KCk6IHZvaWQge1xuICAgICAgICBNYXQ0LkludmVyc2UodGhpcy53b3JsZF9tYXRyaXgsIHRoaXMudmlld19tYXRyaXgpO1xuICAgIH1cblxuICAgIHBlcnNwZWN0aXZlKGZvdjogbnVtYmVyLCBhc3BlY3Q6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlcikge1xuICAgICAgICB0aGlzLnZlcnRpY2FsX2ZvdiA9IGZvdjtcbiAgICAgICAgdGhpcy5hc3BlY3QgPSBhc3BlY3Q7XG4gICAgICAgIHRoaXMubmVhciA9IG5lYXI7XG4gICAgICAgIHRoaXMuZmFyID0gZmFyO1xuICAgICAgICB0aGlzLnByb2plY3Rpb25fbWF0cml4LnBlcnNwZWN0aXZlKGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIpO1xuICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVfcHJvamVjdGlvbl9tYXRyaXgoKTtcbiAgICB9XG5cbiAgICBvcnRob2dyYXBoaWNzKHNpemVfdmVydGljYWw6IG51bWJlciwgc2l6ZV9ob3Jpem9udGFsOiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5uZWFyID0gbmVhcjtcbiAgICAgICAgdGhpcy5mYXIgPSBmYXI7XG4gICAgICAgIHRoaXMucHJvamVjdGlvbl9tYXRyaXgub3J0aG9ncmFwaGljcyhzaXplX3ZlcnRpY2FsLCBzaXplX2hvcml6b250YWwsIG5lYXIsIGZhcik7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZV9wcm9qZWN0aW9uX21hdHJpeCgpO1xuICAgIH1cblxuICAgIGxvb2tfYXQodGFyZ2V0OiBGbG9hdDMsIHVwPzogRmxvYXQzKTogdm9pZCB7XG4gICAgICAgIHVwID0gdXAgfHwgdGhpcy51cDtcbiAgICAgICAgcm90YXRlX21hdHJpeC5sb29rX2F0KHRoaXMubG9jYXRpb24sIHRhcmdldCwgdXApO1xuICAgICAgICB0aGlzLnJvdGF0aW9uLmZyb21fbWF0NChyb3RhdGVfbWF0cml4KTtcbiAgICAgICAgdGhpcy51cGRhdGVfd29ybGRfbWF0cml4KCk7XG4gICAgICAgIHRoaXMudXBkYXRlX3ZpZXdfbWF0cml4KCk7XG4gICAgfVxuXG4gICAgY29weShjYW1lcmE6IENhbWVyYSk6IENhbWVyYSB7XG4gICAgICAgIHRoaXMubG9jYXRpb24uY29weShjYW1lcmEubG9jYXRpb24pO1xuICAgICAgICB0aGlzLnJvdGF0aW9uLmNvcHkoY2FtZXJhLnJvdGF0aW9uKTtcbiAgICAgICAgdGhpcy5zY2FsZS5jb3B5KGNhbWVyYS5zY2FsZSk7XG4gICAgICAgIHRoaXMubG9jYWxfbWF0cml4LmNvcHkoY2FtZXJhLmxvY2FsX21hdHJpeCk7XG4gICAgICAgIHRoaXMud29ybGRfbWF0cml4LmNvcHkoY2FtZXJhLndvcmxkX21hdHJpeCk7XG5cbiAgICAgICAgdGhpcy5tb2RlID0gY2FtZXJhLm1vZGU7XG4gICAgICAgIHRoaXMudmVydGljYWxfZm92ID0gY2FtZXJhLnZlcnRpY2FsX2ZvdjtcbiAgICAgICAgdGhpcy5hc3BlY3QgPSBjYW1lcmEuYXNwZWN0O1xuXG4gICAgICAgIHRoaXMubmVhciA9IGNhbWVyYS5uZWFyO1xuICAgICAgICB0aGlzLmZhciA9IGNhbWVyYS5mYXI7XG5cbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uX21hdHJpeC5jb3B5KGNhbWVyYS5wcm9qZWN0aW9uX21hdHJpeCk7XG4gICAgICAgIHRoaXMudmlld19tYXRyaXguY29weShjYW1lcmEudmlld19tYXRyaXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwcm9qZWN0KHY6IEZsb2F0Myk6IEZsb2F0MyB7XG4gICAgICAgIGlmICh2LnggPT09IDAgJiYgdi55ID09PSAwICYmIHYueiA9PT0gMCkgcmV0dXJuIHYuY29weSh0aGlzLmxvY2F0aW9uKTtcbiAgICAgICAgdi5hcHBseV9tYXQ0KHRoaXMudmlld19tYXRyaXgpLmFwcGx5X21hdDQodGhpcy5wcm9qZWN0aW9uX21hdHJpeCk7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIHVucHJvamVjdCh2OiBGbG9hdDMpOiBGbG9hdDMge1xuICAgICAgICB2LmFwcGx5X21hdDQodGhpcy5pbnZlcnNlX3Byb2plY3Rpb25fbWF0cml4KS5hcHBseV9tYXQ0KHRoaXMud29ybGRfbWF0cml4KTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgcmVzaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogQ2FtZXJhIHtcbiAgICAgICAgaWYgKHRoaXMubW9kZSA9PT0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5hc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcbiAgICAgICAgICAgIHRoaXMucGVyc3BlY3RpdmUodGhpcy52ZXJ0aWNhbF9mb3YsIHRoaXMuYXNwZWN0LCB0aGlzLm5lYXIsIHRoaXMuZmFyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmVydGljYWxfc2l6ZSA9IGhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbF9zaXplID0gd2lkdGg7XG4gICAgICAgICAgICB0aGlzLm9ydGhvZ3JhcGhpY3ModGhpcy52ZXJ0aWNhbF9zaXplLCB0aGlzLmhvcml6b250YWxfc2l6ZSwgdGhpcy5uZWFyLCB0aGlzLmZhcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdXBkYXRlX3Byb2plY3Rpb25fbWF0cml4KCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZSA9PT0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aW9uX21hdHJpeC5wZXJzcGVjdGl2ZSh0aGlzLnZlcnRpY2FsX2ZvdiwgdGhpcy5hc3BlY3QsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aW9uX21hdHJpeC5vcnRob2dyYXBoaWNzKHRoaXMudmVydGljYWxfc2l6ZSwgdGhpcy5ob3Jpem9udGFsX3NpemUsIHRoaXMubmVhciwgdGhpcy5mYXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbnZlcnNlX3Byb2plY3Rpb25fbWF0cml4LmNvcHkodGhpcy5wcm9qZWN0aW9uX21hdHJpeCkuaW52ZXJzZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmaXRfYm94KGJveDogQm94Mykge1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuZml0X2Rpc3RhbmNlKGJveCk7XG4gICAgICAgIHRoaXMubG9jYXRpb24uc3ViKGJveC5jZW50ZXIpLm5vcm1hbGl6ZSgpLm11bChkaXN0YW5jZSk7XG4gICAgICAgIHRoaXMubG9va19hdChib3guY2VudGVyKTtcbiAgICB9XG5cbiAgICBmaXRfZGlzdGFuY2UoYm94OiBCb3gzKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGJveC5zaXplO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBzaXplLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbih0aGlzLnZlcnRpY2FsX2ZvdiAqIERlZ3JlZVRvUmFkaWFuICogMC41KSAqIGxlbmd0aDtcbiAgICB9XG59XG5cbmNvbnN0IHZpZXdfYm94ID0gbmV3IEJveDMoKTtcbmV4cG9ydCBmdW5jdGlvbiBjYW1lcmFfZml4X2JveChjYW1lcmE6IENhbWVyYSwgYm94OiBCb3gzKTogdm9pZCB7XG4gICAgaWYgKGJveC5pbnZhbGlkKSByZXR1cm47XG5cbiAgICB2aWV3X2JveC5jb3B5KGJveCk7XG4gICAgdmlld19ib3guYXBwbHlfbWF0NChjYW1lcmEudmlld19tYXRyaXgpO1xuXG4gICAgY2FtZXJhLm5lYXIgPSBNYXRoLm1heCgwLjAxLCAtdmlld19ib3gubWF4LnopO1xuICAgIGNhbWVyYS5mYXIgPSBNYXRoLm1heCgtdmlld19ib3gubWluLnosIGNhbWVyYS5uZWFyICsgMTApO1xuXG4gICAgaWYgKGlzTmFOKGNhbWVyYS5uZWFyKSkgY2FtZXJhLm5lYXIgPSAxLjA7XG4gICAgaWYgKGlzTmFOKGNhbWVyYS5mYXIpKSBjYW1lcmEuZmFyID0gMTAwMDA7XG5cbiAgICBjYW1lcmEudXBkYXRlX3Byb2plY3Rpb25fbWF0cml4KCk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FtZXJhRGF0YSB7XG4gICAgbW9kZTogQ2FtZXJhTW9kZTtcblxuICAgIG5lYXI6IG51bWJlcjtcbiAgICBmYXI6IG51bWJlcjtcblxuICAgIHZlcnRpY2FsX2ZvdjogbnVtYmVyO1xuICAgIGFzcGVjdDogbnVtYmVyO1xuXG4gICAgdmVydGljYWxfc2l6ZTogbnVtYmVyO1xuICAgIGhvcml6b250YWxfc2l6ZTogbnVtYmVyO1xuXG4gICAgbG9jYXRpb246IG51bWJlcltdO1xuICAgIHJvdGF0aW9uOiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVyYV9zZXJpYWxpemUoY2FtZXJhOiBDYW1lcmEpOiBDYW1lcmFEYXRhIHtcbiAgICBjb25zdCBkYXRhID0ge30gYXMgQ2FtZXJhRGF0YTtcbiAgICBkYXRhLm1vZGUgPSBjYW1lcmEubW9kZTtcbiAgICBkYXRhLm5lYXIgPSBjYW1lcmEubmVhcjtcbiAgICBkYXRhLmZhciA9IGNhbWVyYS5mYXI7XG4gICAgZGF0YS5sb2NhdGlvbiA9IFtjYW1lcmEubG9jYXRpb24ueCwgY2FtZXJhLmxvY2F0aW9uLnksIGNhbWVyYS5sb2NhdGlvbi56XTtcbiAgICBkYXRhLnJvdGF0aW9uID0gW2NhbWVyYS5yb3RhdGlvbi54LCBjYW1lcmEucm90YXRpb24ueSwgY2FtZXJhLnJvdGF0aW9uLnosIGNhbWVyYS5yb3RhdGlvbi53XTtcbiAgICBkYXRhLnZlcnRpY2FsX2ZvdiA9IGNhbWVyYS52ZXJ0aWNhbF9mb3Y7XG4gICAgZGF0YS5hc3BlY3QgPSBjYW1lcmEuYXNwZWN0O1xuICAgIGRhdGEudmVydGljYWxfc2l6ZSA9IGNhbWVyYS52ZXJ0aWNhbF9zaXplO1xuICAgIGRhdGEuaG9yaXpvbnRhbF9zaXplID0gY2FtZXJhLmhvcml6b250YWxfc2l6ZTtcbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVyYV9kZXNlcmlhbGl6ZShkYXRhOiBDYW1lcmFEYXRhKTogQ2FtZXJhIHtcbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XG4gICAgY2FtZXJhLm1vZGUgPSBkYXRhLm1vZGU7XG4gICAgY2FtZXJhLm5lYXIgPSBkYXRhLm5lYXI7XG4gICAgY2FtZXJhLmZhciA9IGRhdGEuZmFyO1xuICAgIGNhbWVyYS52ZXJ0aWNhbF9mb3YgPSBkYXRhLnZlcnRpY2FsX2ZvdjtcbiAgICBjYW1lcmEuYXNwZWN0ID0gZGF0YS5hc3BlY3Q7XG4gICAgY2FtZXJhLnZlcnRpY2FsX3NpemUgPSBkYXRhLnZlcnRpY2FsX3NpemU7XG4gICAgY2FtZXJhLmhvcml6b250YWxfc2l6ZSA9IGRhdGEuaG9yaXpvbnRhbF9zaXplO1xuXG4gICAgaWYgKGRhdGEubW9kZSA9PT0gQ2FtZXJhTW9kZS5QZXJzcGVjdGl2ZSkge1xuICAgICAgICBjYW1lcmEucGVyc3BlY3RpdmUoZGF0YS52ZXJ0aWNhbF9mb3YsIGRhdGEuYXNwZWN0LCBkYXRhLm5lYXIsIGRhdGEuZmFyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjYW1lcmEub3J0aG9ncmFwaGljcyhkYXRhLnZlcnRpY2FsX3NpemUsIGRhdGEuaG9yaXpvbnRhbF9zaXplLCBkYXRhLm5lYXIsIGRhdGEuZmFyKTtcbiAgICB9XG5cbiAgICBjYW1lcmEubG9jYXRpb24uc2V0KGRhdGEubG9jYXRpb25bMF0sIGRhdGEubG9jYXRpb25bMV0sIGRhdGEubG9jYXRpb25bMl0pO1xuICAgIGNhbWVyYS5yb3RhdGlvbi5zZXQoZGF0YS5yb3RhdGlvblswXSwgZGF0YS5yb3RhdGlvblsxXSwgZGF0YS5yb3RhdGlvblsyXSwgZGF0YS5yb3RhdGlvblszXSk7XG4gICAgY2FtZXJhLnVwZGF0ZV93b3JsZF9tYXRyaXgoKTtcbiAgICBjYW1lcmEudXBkYXRlX3ZpZXdfbWF0cml4KCk7XG4gICAgY2FtZXJhLnVwZGF0ZV9wcm9qZWN0aW9uX21hdHJpeCgpO1xuXG4gICAgcmV0dXJuIGNhbWVyYTtcbn1cbiIsICJleHBvcnQgY2xhc3MgVHlwZWRFdmVudDxUID0gYW55PiB7XG4gICAgcGF5bG9hZDogVCB8IHVuZGVmaW5lZDtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5OiBzdHJpbmcpIHt9XG59XG5cbmV4cG9ydCB0eXBlIEV2ZW50ID0gc3RyaW5nO1xuXG5pbnRlcmZhY2UgTGlzdGVuZXIge1xuICAgIGV2ZW50OiBFdmVudDtcbiAgICBjYWxsYmFjazogRnVuY3Rpb247XG4gICAgc2NvcGU6IGFueTtcbiAgICBvbmNlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50Tm9kZSB7XG4gICAgcHJpdmF0ZSBsaXN0ZW5lcl9tYXA6IE1hcDxFdmVudCwgTGlzdGVuZXJbXT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiB3YXJuOlxuICAgICAqICBpZiBldmVudCAmIGNhbGxiYWNrIGhhcyByZWdpc3RlcmVkLCBuZXcgbGlzdGVuZXIgd2lsbCByZXBsYWNlIG9uZVxuICAgICAqL1xuICAgIG9uPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55LCBvbmNlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZXZlbnQua2V5O1xuICAgICAgICBjb25zdCBsaXN0ZW5lcjogTGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBldmVudDoga2V5LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlIHx8IHRoaXMsXG4gICAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyX21hcC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGxpc3RlbmVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyX21hcC5zZXQoa2V5LCBbbGlzdGVuZXJdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjb250YWluID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXJzW2ldLmV2ZW50ID09PSBsaXN0ZW5lci5ldmVudCAmJiBsaXN0ZW5lcnNbaV0uY2FsbGJhY2sgPT09IGxpc3RlbmVyLmNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0gPSBsaXN0ZW5lcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNvbnRhaW4pIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbmNlPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMub24oZXZlbnQsIGNhbGxiYWNrLCBzY29wZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgb2ZmPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55LCBvbmNlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZXZlbnQua2V5O1xuICAgICAgICBjb25zdCBsaXN0ZW5lcjogTGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBldmVudDoga2V5LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlIHx8IHRoaXMsXG4gICAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyX21hcC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyc1tpXS5ldmVudCA9PT0gbGlzdGVuZXIuZXZlbnQgJiYgbGlzdGVuZXJzW2ldLmNhbGxiYWNrID09PSBsaXN0ZW5lci5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpcmU8VD4oZXZlbnQ6IFR5cGVkRXZlbnQ8VD4sIHBheWxvYWQ/OiBUKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGtleSA9IGV2ZW50LmtleTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcl9tYXAuZ2V0KGtleSk7XG4gICAgICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBsaXN0ZW5lci5ldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsYmFjay5iaW5kKGxpc3RlbmVyLnNjb3BlIHx8IHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsYmFjayhwYXlsb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyLm9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB0aGlzLmxpc3RlbmVyX21hcC5rZXlzKCkpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJfbWFwLmRlbGV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBfRXZlbnRIdWIge1xuICAgIHByaXZhdGUgbm9kZSA9IG5ldyBFdmVudE5vZGUoKTtcblxuICAgIG9uPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5vbihldmVudCwgY2FsbGJhY2ssIHNjb3BlKTtcbiAgICB9XG5cbiAgICBvbmNlPFQ+KGV2ZW50OiBUeXBlZEV2ZW50PFQ+LCBjYWxsYmFjazogKHBheWxvYWQ6IFQpID0+IHZvaWQsIHNjb3BlPzogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5vbmNlKGV2ZW50LCBjYWxsYmFjaywgc2NvcGUpO1xuICAgIH1cblxuICAgIGZpcmU8VD4oZXZlbnQ6IFR5cGVkRXZlbnQ8VD4sIHBheWxvYWQ/OiBUKTogdm9pZCB7XG4gICAgICAgIHRoaXMubm9kZS5maXJlKGV2ZW50LCBwYXlsb2FkKTtcbiAgICB9XG5cbiAgICBvZmY8VD4oZXZlbnQ6IFR5cGVkRXZlbnQ8VD4sIGNhbGxiYWNrOiAocGF5bG9hZDogVCkgPT4gdm9pZCwgc2NvcGU/OiBhbnkpIHtcbiAgICAgICAgdGhpcy5ub2RlLm9mZihldmVudCwgY2FsbGJhY2ssIHNjb3BlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBFdmVudEh1YiA9IG5ldyBfRXZlbnRIdWIoKTtcbiIsICJpbXBvcnQgeyBGbG9hdDIgfSBmcm9tICcuLi9tYXRoL3NpbWQnO1xuaW1wb3J0IHsgVHlwZWRFdmVudCB9IGZyb20gJy4vZXZlbnQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBvaW50ZXJFdmVudFBheWxvYWQge1xuICAgIGJ1dHRvbjogbnVtYmVyO1xuICAgIHBvaW50OiBGbG9hdDI7XG4gICAgZGVsdGE6IEZsb2F0MjtcbiAgICBwb2ludHM/OiBGbG9hdDJbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNb3VzZUV2ZW50UGF5bG9hZCBleHRlbmRzIFBvaW50ZXJFdmVudFBheWxvYWQge1xuICAgIGV2ZW50OiBNb3VzZUV2ZW50O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEtleUV2ZW50UGF5bG9hZCB7XG4gICAga2V5Y29kZTogbnVtYmVyO1xuICAgIGV2ZW50OiBLZXlib2FyZEV2ZW50O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1vdXNlV2hlZWxFdmVudFBheWxvYWQge1xuICAgIGRlbHRhOiBudW1iZXI7XG4gICAgZGVsdGFfeDogbnVtYmVyO1xuICAgIGRlbHRhX3k6IG51bWJlcjtcbiAgICBldmVudDogV2hlZWxFdmVudDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXNpemVFdmVudFBheWxvYWQge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBHbG9iYWxFdmVudCA9IHtcbiAgICBGb3JjZVVwZGF0ZTogbmV3IFR5cGVkRXZlbnQ8TW91c2VFdmVudFBheWxvYWQ+KCdmb3JjZSB1cGRhdGUnKSxcbiAgICBGaWxlU3lzdGVtQ2hhbmdlZDogbmV3IFR5cGVkRXZlbnQoJ2ZpbGUgc3lzdGVtIGNoYW5nZWQnKSxcblxuICAgIE1vdXNlTW92ZTogbmV3IFR5cGVkRXZlbnQ8TW91c2VFdmVudFBheWxvYWQ+KCdtb3VzZW1vdmUnKSxcbiAgICBNb3VzZURyYWc6IG5ldyBUeXBlZEV2ZW50PE1vdXNlRXZlbnRQYXlsb2FkPignbW91c2VkcmFnJyksXG4gICAgTW91c2VEb3duOiBuZXcgVHlwZWRFdmVudDxNb3VzZUV2ZW50UGF5bG9hZD4oJ21vdXNlZG93bicpLFxuICAgIE1vdXNlVXA6IG5ldyBUeXBlZEV2ZW50PE1vdXNlRXZlbnRQYXlsb2FkPignbW91c2V1cCcpLFxuXG4gICAgUG9pbnRlckRvd246IG5ldyBUeXBlZEV2ZW50PFBvaW50ZXJFdmVudFBheWxvYWQ+KCdwb2ludGVyIGRvd24nKSxcbiAgICBQb2ludGVyTW92ZTogbmV3IFR5cGVkRXZlbnQ8UG9pbnRlckV2ZW50UGF5bG9hZD4oJ3BvaW50ZXIgbW92ZScpLFxuICAgIFBvaW50ZXJVcDogbmV3IFR5cGVkRXZlbnQ8UG9pbnRlckV2ZW50UGF5bG9hZD4oJ3BvaW50ZXIgdXAnKSxcblxuICAgIFRvdWNoU3RhcnQ6IG5ldyBUeXBlZEV2ZW50PFBvaW50ZXJFdmVudFBheWxvYWQ+KCd0b3VjaCBzdGFydCcpLFxuICAgIFRvdWNoTW92ZTogbmV3IFR5cGVkRXZlbnQ8UG9pbnRlckV2ZW50UGF5bG9hZD4oJ3RvdWNoIG1vdmUnKSxcbiAgICBUb3VjaEVuZDogbmV3IFR5cGVkRXZlbnQ8UG9pbnRlckV2ZW50UGF5bG9hZD4oJ3RvdWNoIGVuZCcpLFxuXG4gICAgS2V5RG93bjogbmV3IFR5cGVkRXZlbnQ8S2V5RXZlbnRQYXlsb2FkPigna2V5ZG93bicpLFxuICAgIEtleVVwOiBuZXcgVHlwZWRFdmVudDxLZXlFdmVudFBheWxvYWQ+KCdrZXl1cCcpLFxuICAgIE1vdXNlV2hlZWw6IG5ldyBUeXBlZEV2ZW50PE1vdXNlV2hlZWxFdmVudFBheWxvYWQ+KCdtb3VzZXdoZWVsJyksXG4gICAgUmVzaXplOiBuZXcgVHlwZWRFdmVudDxSZXNpemVFdmVudFBheWxvYWQ+KCdyZXNpemUnKSxcbiAgICBYUlNlc3Npb25FbmQ6IG5ldyBUeXBlZEV2ZW50KCd4ciBzZXNzaW9uIGVuZCcpLFxufTtcbiIsICJpbXBvcnQgeyBFdmVudEh1YiB9IGZyb20gJy4uL2VuZ2luZS9ldmVudCc7XG5pbXBvcnQgeyBHbG9iYWxFdmVudCB9IGZyb20gJy4uL2VuZ2luZS9nbG9iYWxfZXZlbnQnO1xuaW1wb3J0IHsgTW91c2VCdXR0b24gfSBmcm9tICcuLi9lbmdpbmUva2V5Y29kZSc7XG5pbXBvcnQgeyBGbG9hdDIgfSBmcm9tICcuLi9tYXRoL3NpbWQnO1xuXG5leHBvcnQgY2xhc3MgQnJvd3NlcklucHV0IHtcbiAgICBzdGFydDogRmxvYXQyID0gbmV3IEZsb2F0MigpO1xuICAgIGRyYWdfc3RhcnQ6IEZsb2F0MiA9IG5ldyBGbG9hdDIoKTtcbiAgICBlbmQ6IEZsb2F0MiA9IG5ldyBGbG9hdDIoKTtcbiAgICBkZWx0YTogRmxvYXQyID0gbmV3IEZsb2F0MigpO1xuXG4gICAgbW91c2VfYnV0dG9uOiBudW1iZXIgPSAtMTtcblxuICAgIGVsZW1lbnQ/OiBIVE1MRWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmJpbmQod2luZG93IGFzIGFueSk7XG4gICAgfVxuXG4gICAgYmluZChlbGVtZW50OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVuYmluZCgpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25tb3VzZWRvd24sIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9ubW91c2Vtb3ZlLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHRoaXMub25tb3VzZXdoZWVsLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLCB0aGlzLm9ubW91c2VzY3JvbGwsIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25rZXlkb3duLCBmYWxzZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbmtleXVwLCBmYWxzZSk7XG5cbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vbnRvdWNoc3RhcnQsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9udG91Y2htb3ZlLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9udG91Y2hlbmQsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMub250b3VjaGVuZCwgZmFsc2UpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHVuYmluZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25tb3VzZWRvd24pO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25tb3VzZW1vdmUpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLm9ubW91c2V3aGVlbCk7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbmtleWRvd24pO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLm9ua2V5dXApO1xuXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub250b3VjaHN0YXJ0KTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9udG91Y2htb3ZlKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub250b3VjaGVuZCk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLm9udG91Y2hlbmQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25tb3VzZWRvd24gPSAoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25tb3VzZWRyYWcsIGZhbHNlKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9ubW91c2V1cCwgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMubW91c2VfYnV0dG9uID0gZXZlbnQuYnV0dG9uO1xuXG4gICAgICAgIHRoaXMuc3RhcnQuc2V0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICB0aGlzLmRyYWdfc3RhcnQuY29weSh0aGlzLnN0YXJ0KTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShHbG9iYWxFdmVudC5Nb3VzZURvd24sIHtcbiAgICAgICAgICAgIGJ1dHRvbjogZXZlbnQuYnV0dG9uLFxuICAgICAgICAgICAgcG9pbnQ6IHRoaXMuc3RhcnQsXG4gICAgICAgICAgICBkZWx0YTogdGhpcy5kZWx0YSxcbiAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25tb3VzZWRyYWcgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5lbmQuc2V0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICB0aGlzLmRlbHRhLmNvcHkodGhpcy5lbmQpLnN1Yih0aGlzLmRyYWdfc3RhcnQpO1xuICAgICAgICB0aGlzLmRyYWdfc3RhcnQuY29weSh0aGlzLmVuZCk7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuTW91c2VEcmFnLCB7XG4gICAgICAgICAgICBidXR0b246IHRoaXMubW91c2VfYnV0dG9uLFxuICAgICAgICAgICAgcG9pbnQ6IHRoaXMuZW5kLFxuICAgICAgICAgICAgZGVsdGE6IHRoaXMuZGVsdGEsXG4gICAgICAgICAgICBldmVudCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9ubW91c2Vtb3ZlID0gKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuZW5kLnNldChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgdGhpcy5kZWx0YS5jb3B5KHRoaXMuZW5kKS5zdWIodGhpcy5zdGFydCk7XG5cbiAgICAgICAgdGhpcy5zdGFydC5jb3B5KHRoaXMuZW5kKTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShHbG9iYWxFdmVudC5Nb3VzZU1vdmUsIHtcbiAgICAgICAgICAgIGJ1dHRvbjogdGhpcy5tb3VzZV9idXR0b24sXG4gICAgICAgICAgICBwb2ludDogdGhpcy5lbmQsXG4gICAgICAgICAgICBkZWx0YTogdGhpcy5kZWx0YSxcbiAgICAgICAgICAgIGV2ZW50LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25tb3VzZXVwID0gKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9ubW91c2VkcmFnKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9ubW91c2V1cCk7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuTW91c2VVcCwge1xuICAgICAgICAgICAgYnV0dG9uOiB0aGlzLm1vdXNlX2J1dHRvbixcbiAgICAgICAgICAgIHBvaW50OiB0aGlzLmVuZCxcbiAgICAgICAgICAgIGRlbHRhOiB0aGlzLmRlbHRhLFxuICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm1vdXNlX2J1dHRvbiA9IC0xO1xuICAgIH07XG5cbiAgICBvbm1vdXNld2hlZWwgPSAoZXZlbnQ6IEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGUgPSBldmVudCBhcyBhbnk7XG5cbiAgICAgICAgbGV0IGRlbHRhID0gMDtcbiAgICAgICAgaWYgKGUud2hlZWxEZWx0YSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBkZWx0YSA9IGUud2hlZWxEZWx0YTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmRlbHRhWSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBkZWx0YSA9IC1lLmRlbHRhWTtcbiAgICAgICAgfVxuICAgICAgICBkZWx0YSA9IGRlbHRhID4gMCA/IDAuOTUgOiAxLjA1O1xuICAgICAgICBFdmVudEh1Yi5maXJlKEdsb2JhbEV2ZW50Lk1vdXNlV2hlZWwsIHsgZGVsdGEsIGV2ZW50LCBkZWx0YV95OiBlLmRlbHRhWSwgZGVsdGFfeDogZS5kZWx0YVggfSk7XG4gICAgfTtcblxuICAgIG9ubW91c2VzY3JvbGwgPSAoZXZlbnQ6IGFueSk6IHZvaWQgPT4ge1xuICAgICAgICBsZXQgZGVsdGFfeCA9IDA7XG4gICAgICAgIGxldCBkZWx0YV95ID0gMDtcbiAgICAgICAgbGV0IGRlbHRhID0gMDtcbiAgICAgICAgZGVsdGEgPSBldmVudC5kZXRhaWwgPCAwID8gMC45NSA6IDEuMDU7XG4gICAgICAgIGlmIChldmVudC5heGlzID09PSAxKSB7XG4gICAgICAgICAgICBkZWx0YV94ID0gLWV2ZW50LmRldGFpbCAqIDI7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuYXhpcyA9PT0gMikge1xuICAgICAgICAgICAgZGVsdGFfeSA9IC1ldmVudC5kZXRhaWwgKiAyO1xuICAgICAgICB9XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuTW91c2VXaGVlbCwgeyBkZWx0YSwgZXZlbnQsIGRlbHRhX3ksIGRlbHRhX3ggfSk7XG4gICAgfTtcblxuICAgIG9ua2V5ZG93biA9IChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBFdmVudEh1Yi5maXJlKEdsb2JhbEV2ZW50LktleURvd24sIHsga2V5Y29kZTogZXZlbnQua2V5Q29kZSwgZXZlbnQgfSk7XG4gICAgfTtcblxuICAgIG9ua2V5dXAgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShHbG9iYWxFdmVudC5LZXlVcCwgeyBrZXljb2RlOiBldmVudC5rZXlDb2RlLCBldmVudCB9KTtcbiAgICB9O1xuXG4gICAgb250b3VjaHN0YXJ0ID0gKGV2ZW50OiBUb3VjaEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHRvdWNoID0gZXZlbnQudG91Y2hlcy5pdGVtKGV2ZW50LnRvdWNoZXMubGVuZ3RoIC0gMSkhO1xuICAgICAgICB0aGlzLnN0YXJ0LnNldCh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKTtcbiAgICAgICAgdGhpcy5lbmQuY29weSh0aGlzLnN0YXJ0KTtcbiAgICAgICAgdGhpcy5tb3VzZV9idXR0b24gPSAwO1xuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgYnV0dG9uOiBNb3VzZUJ1dHRvbi5MZWZ0LFxuICAgICAgICAgICAgcG9pbnQ6IHRoaXMuZW5kLFxuICAgICAgICAgICAgZGVsdGE6IHRoaXMuZGVsdGEsXG4gICAgICAgIH07XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuVG91Y2hTdGFydCwgcGF5bG9hZCk7XG4gICAgfTtcblxuICAgIG9udG91Y2htb3ZlID0gKGV2ZW50OiBUb3VjaEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHRvdWNoID0gZXZlbnQudG91Y2hlcy5pdGVtKGV2ZW50LnRvdWNoZXMubGVuZ3RoIC0gMSkhO1xuICAgICAgICB0aGlzLmVuZC5zZXQodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSk7XG4gICAgICAgIHRoaXMuZGVsdGEuY29weSh0aGlzLmVuZCkuc3ViKHRoaXMuc3RhcnQpO1xuXG4gICAgICAgIHRoaXMuc3RhcnQuY29weSh0aGlzLmVuZCk7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoR2xvYmFsRXZlbnQuVG91Y2hNb3ZlLCB7XG4gICAgICAgICAgICBidXR0b246IE1vdXNlQnV0dG9uLkxlZnQsXG4gICAgICAgICAgICBwb2ludDogdGhpcy5lbmQsXG4gICAgICAgICAgICBkZWx0YTogdGhpcy5kZWx0YSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9udG91Y2hlbmQgPSAoZXZlbnQ6IFRvdWNoRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgdG91Y2ggPSBldmVudC50b3VjaGVzLml0ZW0oZXZlbnQudG91Y2hlcy5sZW5ndGggLSAxKSE7XG4gICAgICAgICAgICB0aGlzLmVuZC5zZXQodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgICAgIGJ1dHRvbjogTW91c2VCdXR0b24uTGVmdCxcbiAgICAgICAgICAgIHBvaW50OiB0aGlzLmVuZCxcbiAgICAgICAgICAgIGRlbHRhOiB0aGlzLmRlbHRhLFxuICAgICAgICB9O1xuICAgICAgICBFdmVudEh1Yi5maXJlKEdsb2JhbEV2ZW50LlRvdWNoRW5kLCBwYXlsb2FkKTtcbiAgICB9O1xufVxuIiwgImltcG9ydCB7IEV2ZW50SHViIH0gZnJvbSAnLi4vZW5naW5lL2V2ZW50JztcbmltcG9ydCB7IEdsb2JhbEV2ZW50IH0gZnJvbSAnLi4vZW5naW5lL2dsb2JhbF9ldmVudCc7XG5pbXBvcnQgeyBTdHJpbmdNYXAgfSBmcm9tICcuLi9zdGQvdHlwZSc7XG5cbmV4cG9ydCBlbnVtIElucHV0QXhpcyB7XG4gICAgSG9yaXpvbnRhbCA9IDAsXG4gICAgVmVydGljYWwgPSAxLFxufVxuXG5leHBvcnQgZW51bSBJbnB1dEJ1dHRvbiB7XG4gICAgQmFja3NwYWNlID0gOCxcbiAgICBUYWIgPSA5LFxuICAgIEVudGVyID0gMTMsXG4gICAgU2hpZnQgPSAxNixcbiAgICBDdHJsID0gMTcsXG4gICAgQWx0ID0gMTgsXG4gICAgRXNjYXBlID0gMjcsXG4gICAgTGVmdCA9IDM3LFxuICAgIFVwLFxuICAgIFJpZ2h0LFxuICAgIERvd24sXG4gICAgQSA9IDY1LFxuICAgIEIsXG4gICAgQyxcbiAgICBELFxuICAgIEUsXG4gICAgRixcbiAgICBHLFxuICAgIEgsXG4gICAgSSxcbiAgICBKLFxuICAgIEssXG4gICAgTCxcbiAgICBNLFxuICAgIE4sXG4gICAgTyxcbiAgICBQLFxuICAgIFEsXG4gICAgUixcbiAgICBTLFxuICAgIFQsXG4gICAgVSxcbiAgICBWLFxuICAgIFcsXG4gICAgWCxcbiAgICBZLFxuICAgIFogPSA5MCxcbiAgICBNZXRhID0gOTEsXG4gICAgRGVsZXRlID0gMTI3LFxufVxuXG5leHBvcnQgY2xhc3MgSW5wdXQge1xuICAgIHByaXZhdGUgYXhpc19tYXA6IFN0cmluZ01hcDxudW1iZXI+ID0ge307XG4gICAgcHJpdmF0ZSBrZXlfbWFwOiBTZXQ8SW5wdXRCdXR0b24+ID0gbmV3IFNldCgpO1xuXG4gICAgc2V0X2F4aXMoYXhpczogSW5wdXRBeGlzLCB2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYXhpc19tYXBbYXhpc10gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXRfYXhpcyhheGlzOiBJbnB1dEF4aXMpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5heGlzX21hcFtheGlzXSB8fCAwO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFdmVudEh1Yi5vbihHbG9iYWxFdmVudC5LZXlEb3duLCB0aGlzLm9ua2V5ZG93bik7XG4gICAgICAgIEV2ZW50SHViLm9uKEdsb2JhbEV2ZW50LktleVVwLCB0aGlzLm9ua2V5dXApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25rZXlkb3duID0gKHBheWxvYWQ6IHsga2V5Y29kZTogbnVtYmVyIH0pOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qga2V5Y29kZSA9IHBheWxvYWQua2V5Y29kZTtcbiAgICAgICAgaWYgKGtleWNvZGUgPT09IElucHV0QnV0dG9uLlVwKSB7XG4gICAgICAgICAgICB0aGlzLnNldF9heGlzKElucHV0QXhpcy5WZXJ0aWNhbCwgMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5Y29kZSA9PT0gSW5wdXRCdXR0b24uRG93bikge1xuICAgICAgICAgICAgdGhpcy5zZXRfYXhpcyhJbnB1dEF4aXMuVmVydGljYWwsIC0xKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXljb2RlID09PSBJbnB1dEJ1dHRvbi5MZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnNldF9heGlzKElucHV0QXhpcy5Ib3Jpem9udGFsLCAtMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5Y29kZSA9PT0gSW5wdXRCdXR0b24uUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0X2F4aXMoSW5wdXRBeGlzLkhvcml6b250YWwsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5rZXlfbWFwLmFkZChrZXljb2RlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbmtleXVwID0gKHBheWxvYWQ6IHsga2V5Y29kZTogbnVtYmVyIH0pOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qga2V5Y29kZSA9IHBheWxvYWQua2V5Y29kZTtcbiAgICAgICAgaWYgKGtleWNvZGUgPT09IElucHV0QnV0dG9uLlVwIHx8IGtleWNvZGUgPT09IElucHV0QnV0dG9uLkRvd24pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0X2F4aXMoSW5wdXRBeGlzLlZlcnRpY2FsLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXljb2RlID09PSBJbnB1dEJ1dHRvbi5MZWZ0IHx8IGtleWNvZGUgPT09IElucHV0QnV0dG9uLlJpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnNldF9heGlzKElucHV0QXhpcy5Ib3Jpem9udGFsLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMua2V5X21hcC5kZWxldGUoa2V5Y29kZSk7XG4gICAgfTtcblxuICAgIGdldF9idXR0b24oYnV0dG9uOiBJbnB1dEJ1dHRvbik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlfbWFwLmhhcyhidXR0b24pO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBCcm93c2VySW5wdXQgfSBmcm9tICcuLi9pbnB1dC9icm93c2VyX2lucHV0JztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vaW5wdXQvaW5wdXQnO1xuaW1wb3J0IHsgbWVtY3ljbGUgfSBmcm9tICcuLi9tZW1vcnkvaGVhcCc7XG5pbXBvcnQgeyBFdmVudEh1YiwgVHlwZWRFdmVudCB9IGZyb20gJy4vZXZlbnQnO1xuaW1wb3J0IHsgR2xvYmFsRXZlbnQgfSBmcm9tICcuL2dsb2JhbF9ldmVudCc7XG5cbmV4cG9ydCBjb25zdCBFbmdpbmVFdmVudCA9IHtcbiAgICBCZWZvcmVUaWNrOiBuZXcgVHlwZWRFdmVudCgnYmVmb3JlIHRpY2snKSxcbiAgICBBZnRlclRpY2s6IG5ldyBUeXBlZEV2ZW50KCdhZnRlciB0aWNrJyksXG4gICAgQmVmb3JlRnJhbWU6IG5ldyBUeXBlZEV2ZW50KCdiZWZvcmUgZnJhbWUnKSxcbiAgICBBZnRlckZyYW1lOiBuZXcgVHlwZWRFdmVudCgnYWZ0ZXIgZnJhbWUnKSxcbiAgICBGcmFtZTogbmV3IFR5cGVkRXZlbnQoJ2ZyYW1lJyksXG59O1xuXG5leHBvcnQgY2xhc3MgRW5naW5lIHtcbiAgICBzd2FwX2NoYWluOiBudW1iZXIgPSAtMTtcblxuICAgIGZyYW1lX2luZGV4OiBudW1iZXIgPSAwO1xuICAgIHRpbWU6IG51bWJlciA9IHBlcmZvcm1hbmNlLm5vdygpICogMC4wMDE7XG4gICAgbGFzdF90aW1lOiBudW1iZXIgPSBwZXJmb3JtYW5jZS5ub3coKSAqIDAuMDAxO1xuXG4gICAgLy8gZGVsdGFfdGltZSBpbiBzZWNvbmRzIGZyb20gbGFzdCBmcmFtZSB0byB0aGlzIGZyYW1lXG4gICAgZGVsdGFfdGltZTogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCkgKiAwLjAwMTsgXG5cbiAgICAvLyBkZWx0YV90aW1lIGluIHNlY29uZHMgZnJvbSBsYXN0IGZyYW1lIHRvIG5vd1xuICAgIGdldCBhYnNfZGVsdGFfdGltZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKHBlcmZvcm1hbmNlLm5vdygpICogMC4wMDEpIC0gdGhpcy5sYXN0X3RpbWU7XG4gICAgfVxuXG4gICAgbW91c2VfaW5wdXQ6IEJyb3dzZXJJbnB1dDtcbiAgICBpbnB1dDogSW5wdXQ7XG5cbiAgICBwYXVzZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQoKTtcbiAgICAgICAgdGhpcy5tb3VzZV9pbnB1dCA9IG5ldyBCcm93c2VySW5wdXQoKTtcblxuICAgICAgICBFdmVudEh1Yi5vbihHbG9iYWxFdmVudC5YUlNlc3Npb25FbmQsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhdXNlZCkgdGhpcy5zdGFydCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy50aWNrKCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy50aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgKiAwLjAwMTtcbiAgICAgICAgdGhpcy5kZWx0YV90aW1lID0gdGhpcy50aW1lIC0gdGhpcy5sYXN0X3RpbWU7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoRW5naW5lRXZlbnQuQmVmb3JlVGljayk7XG4gICAgICAgIEV2ZW50SHViLmZpcmUoRW5naW5lRXZlbnQuQmVmb3JlRnJhbWUpO1xuICAgICAgICBFdmVudEh1Yi5maXJlKEVuZ2luZUV2ZW50LkZyYW1lKTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShFbmdpbmVFdmVudC5BZnRlckZyYW1lKTtcbiAgICAgICAgRXZlbnRIdWIuZmlyZShFbmdpbmVFdmVudC5BZnRlclRpY2spO1xuICAgICAgICB0aGlzLmxhc3RfdGltZSA9IHRoaXMudGltZTtcbiAgICAgICAgbWVtY3ljbGUoKTtcbiAgICAgICAgdGhpcy5zd2FwX2NoYWluID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudGljayk7XG4gICAgfTtcblxuICAgIHBhdXNlKCkge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnN3YXBfY2hhaW4pO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGVybWluYXRlKCkge31cbn1cbiIsICJpbXBvcnQgeyBQb2x5Tm9kZSB9IGZyb20gJy4uL2FkdC9wdHJlZSc7XG5pbXBvcnQgeyBDb2xvclJHQkEgfSBmcm9tICcuLi9tYXRoL2NvbG9yJztcblxuZXhwb3J0IGNsYXNzIEZyYW1lQ2FwdHVyZU5vZGU8VCA9IGFueT4gZXh0ZW5kcyBQb2x5Tm9kZTxGcmFtZUNhcHR1cmVOb2RlPFQ+PiB7XG4gICAgbmFtZTogc3RyaW5nID0gJ2Fub255bW91cyc7XG4gICAgc3RhcnQ/OiBudW1iZXI7XG4gICAgZW5kPzogbnVtYmVyO1xuXG4gICAgY29sb3I/OiBDb2xvclJHQkE7XG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gICAgZGF0YT86IFQ7XG5cbiAgICB0eXBlOiBGcmFtZUNhcHR1cmVOb2RlVHlwZSA9IEZyYW1lQ2FwdHVyZU5vZGVUeXBlLk5vbmU7XG59XG5cbmV4cG9ydCBlbnVtIEZyYW1lQ2FwdHVyZU5vZGVUeXBlIHtcbiAgICBOb25lLFxuICAgIFBhc3MsXG4gICAgUGlwZWxpbmUsXG4gICAgQ29uc3RhbnRCdWZmZXIsXG4gICAgRHJhdyxcbiAgICBNZXNoXG59XG5cbmV4cG9ydCBjbGFzcyBQcm9maWxlcjxUID0gYW55PiB7XG4gICAgcm9vdDogRnJhbWVDYXB0dXJlTm9kZTxUPjtcbiAgICBub2RlOiBGcmFtZUNhcHR1cmVOb2RlPFQ+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucm9vdCA9IHRoaXMubm9kZSA9IG5ldyBGcmFtZUNhcHR1cmVOb2RlPFQ+KCk7XG4gICAgfVxuXG4gICAgdHJhY2Vfc3RhcnQobmFtZTogc3RyaW5nLCBkZXNjcmlwdGlvbj86IHN0cmluZywgZGF0YT86IGFueSwgdHlwZTogRnJhbWVDYXB0dXJlTm9kZVR5cGUgPSBGcmFtZUNhcHR1cmVOb2RlVHlwZS5Ob25lKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgRnJhbWVDYXB0dXJlTm9kZSgpO1xuXG4gICAgICAgIG5vZGUubmFtZSA9IG5hbWU7XG4gICAgICAgIG5vZGUuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgbm9kZS5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgICAgICBub2RlLmRhdGEgPSBkYXRhO1xuICAgICAgICBub2RlLnR5cGUgPSB0eXBlO1xuXG4gICAgICAgIHRoaXMubm9kZS5hZGQobm9kZSk7XG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgfVxuXG4gICAgdHJhY2VfZW5kKG5hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBub2RlcyA9IFtdO1xuICAgICAgICBsZXQgdG9wOiBGcmFtZUNhcHR1cmVOb2RlIHwgdW5kZWZpbmVkID0gdGhpcy5ub2RlO1xuICAgICAgICB3aGlsZSAodG9wICYmIHRvcC5uYW1lICE9PSBuYW1lKSB7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKHRvcCk7XG4gICAgICAgICAgICB0b3AgPSB0b3AucGFyZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBgaW52YWxpZCB0cmFjZSBlbmQgJHtuYW1lfWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICAgICAgbm9kZS5lbmQgPSBlbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b3AuZW5kID0gZW5kO1xuICAgICAgICAgICAgdGhpcy5ub2RlID0gdG9wLnBhcmVudCE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5yb290ID0gdGhpcy5ub2RlID0gbmV3IEZyYW1lQ2FwdHVyZU5vZGUoKTtcbiAgICAgICAgdGhpcy5yb290LnN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IENvbG9yUkdCQSwgQ3VsbE1vZGUsIEZsb2F0MiwgRmxvYXQzLCBGbG9hdDQsIE1hdDQsIFVuaWZvcm1WYWx1ZSwgV2ViR0xUZXh0dXJlSGFuZGxlIH0gZnJvbSAnLi4nO1xuaW1wb3J0IHsgR0ZYUmVuZGVyR3JvdXAgfSBmcm9tICcuLi9nZngvZ2Z4X3R5cGUnO1xuaW1wb3J0IHsgZm9vdHByaW50X2FsbG9jIH0gZnJvbSAnLi4vbWVtb3J5L2Zvb3RwcmludCc7XG5cbmV4cG9ydCBjbGFzcyBNYXRlcmlhbEJsb2NrIHtcbiAgICBuYW1lOiBzdHJpbmcgPSAndW5hbWVkJztcblxuICAgIGJsb2NrX25lZWRzX3VwZGF0ZTogYm9vbGVhbiA9IHRydWVcbiAgICBwcml2YXRlIHBhcmVudDogTWF0ZXJpYWxCbG9jayB8IHVuZGVmaW5lZDtcbiAgICByZW5kZXJfZ3JvdXA6IEdGWFJlbmRlckdyb3VwID0gR0ZYUmVuZGVyR3JvdXAuT3BhcXVlO1xuICAgIGN1bGxfbW9kZTogQ3VsbE1vZGUgPSBDdWxsTW9kZS5CYWNrO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGZvb3RwcmludF9hbGxvYygxNik7XG4gICAgfVxuXG4gICAgZ2VuZXJpY19wcm9wZXJ0aWVzOiBNYXA8c3RyaW5nLCBVbmlmb3JtVmFsdWU+ID0gbmV3IE1hcCgpO1xuICAgIHRleHR1cmVfcHJvcGVydGllczogTWFwPHN0cmluZywgVW5pZm9ybVZhbHVlPiA9IG5ldyBNYXAoKTtcblxuICAgIHNldF9pbnQobmFtZTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZ2VuZXJpY19wcm9wZXJ0aWVzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0X2Zsb2F0KG5hbWU6IHN0cmluZywgdmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLmdlbmVyaWNfcHJvcGVydGllcy5zZXQobmFtZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHNldF9mbG9hdDIobmFtZTogc3RyaW5nLCB2YWx1ZTogRmxvYXQyKSB7XG4gICAgICAgIHRoaXMuZ2VuZXJpY19wcm9wZXJ0aWVzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0X2Zsb2F0MyhuYW1lOiBzdHJpbmcsIHZhbHVlOiBGbG9hdDMpIHtcbiAgICAgICAgdGhpcy5nZW5lcmljX3Byb3BlcnRpZXMuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXRfZmxvYXQ0KG5hbWU6IHN0cmluZywgdmFsdWU6IEZsb2F0NCkge1xuICAgICAgICB0aGlzLmdlbmVyaWNfcHJvcGVydGllcy5zZXQobmFtZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHNldF9jb2xvcihuYW1lOiBzdHJpbmcsIHZhbHVlOiBDb2xvclJHQkEpIHtcbiAgICAgICAgdGhpcy5nZW5lcmljX3Byb3BlcnRpZXMuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXRfbWF0NChuYW1lOiBzdHJpbmcsIHZhbHVlOiBNYXQ0KSB7XG4gICAgICAgIHRoaXMuZ2VuZXJpY19wcm9wZXJ0aWVzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0X21hdDRfYXJyYXkobmFtZTogc3RyaW5nLCB2YWx1ZTogRmxvYXQzMkFycmF5KSB7XG4gICAgICAgIHRoaXMuZ2VuZXJpY19wcm9wZXJ0aWVzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0X3RleHR1cmUobmFtZTogc3RyaW5nLCBndWlkOiBXZWJHTFRleHR1cmVIYW5kbGUpIHtcbiAgICAgICAgdGhpcy50ZXh0dXJlX3Byb3BlcnRpZXMuc2V0KG5hbWUsIGd1aWQpO1xuICAgIH1cblxuICAgIGhhc19wcm9wZXJ0eShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJpY19wcm9wZXJ0aWVzLmhhcyhuYW1lKSB8fCB0aGlzLnRleHR1cmVfcHJvcGVydGllcy5oYXMobmFtZSk7XG4gICAgfVxuXG4gICAgZ2V0X3Byb3BlcnR5KG5hbWU6IHN0cmluZyk6IFVuaWZvcm1WYWx1ZSB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlbmVyaWNfcHJvcGVydGllcy5nZXQobmFtZSkgfHwgdGhpcy50ZXh0dXJlX3Byb3BlcnRpZXMuZ2V0KG5hbWUpO1xuICAgIH1cblxuICAgIHJlbW92ZV9wcm9wZXJ0eShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5nZW5lcmljX3Byb3BlcnRpZXMuZGVsZXRlKG5hbWUpO1xuICAgICAgICB0aGlzLnRleHR1cmVfcHJvcGVydGllcy5kZWxldGUobmFtZSk7XG4gICAgfVxuXG4gICAgY2xvbmUoKTogTWF0ZXJpYWxCbG9jayB7XG4gICAgICAgIGNvbnN0IGJsb2NrID0gbmV3IE1hdGVyaWFsQmxvY2soKTtcbiAgICAgICAgYmxvY2suZ2VuZXJpY19wcm9wZXJ0aWVzID0gbmV3IE1hcCh0aGlzLmdlbmVyaWNfcHJvcGVydGllcyk7XG4gICAgICAgIGJsb2NrLnRleHR1cmVfcHJvcGVydGllcyA9IG5ldyBNYXAodGhpcy50ZXh0dXJlX3Byb3BlcnRpZXMpO1xuICAgICAgICByZXR1cm4gYmxvY2s7XG4gICAgfVxuXG4gICAgcmVzZXQoKTogTWF0ZXJpYWxCbG9jayB7XG4gICAgICAgIHRoaXMuZ2VuZXJpY19wcm9wZXJ0aWVzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMudGV4dHVyZV9wcm9wZXJ0aWVzLmNsZWFyKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBNYXRlcmlhbFByb3BlcnR5IHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdmFsdWU6IFVuaWZvcm1WYWx1ZTtcbn1cbiIsICJpbXBvcnQgeyBCdWZmZXJSYW5nZSB9IGZyb20gJy4nO1xuXG5leHBvcnQgY2xhc3MgQmxvY2tBbGxvY2F0b3Ige1xuXG4gICAgdGFpbDogbnVtYmVyID0gMDtcbiAgICBoZWFwX3NpemU6IG51bWJlciA9IDA7XG5cbiAgICB2YWxpZF9zZXQ6IFNldDxCdWZmZXJSYW5nZT4gPSBuZXcgU2V0KCk7XG4gICAgZnJlZV9zZXQ6IFNldDxCdWZmZXJSYW5nZT4gPSBuZXcgU2V0KCk7XG4gICAgZnJlZV9zaXplOiBudW1iZXIgPSAwO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIGJsb2NrX3NpemU6IG51bWJlcikge31cblxuICAgIGFsbG9jYXRlKGNvdW50OiBudW1iZXIpOiBCdWZmZXJSYW5nZSB7XG4gICAgICAgIGNvbnN0IGJ5dGVfb2Zmc2V0ID0gdGhpcy50YWlsO1xuICAgICAgICBjb25zdCBieXRlX2xlbmd0aCA9IGNvdW50ICogdGhpcy5ibG9ja19zaXplO1xuICAgICAgICB0aGlzLnRhaWwgKz0gYnl0ZV9sZW5ndGg7XG4gICAgICAgIHRoaXMuaGVhcF9zaXplID0gTWF0aC5tYXgodGhpcy5oZWFwX3NpemUsIHRoaXMudGFpbCk7XG4gICAgICAgIHJldHVybiB7IGJ5dGVfb2Zmc2V0LCBieXRlX2xlbmd0aCB9O1xuICAgIH1cblxuICAgIGZyZWUocmFuZ2U6IEJ1ZmZlclJhbmdlKSB7XG4gICAgICAgIHRoaXMuZnJlZV9zZXQuYWRkKHJhbmdlKTtcbiAgICAgICAgdGhpcy5mcmVlX3NpemUgKz0gcmFuZ2UuYnl0ZV9sZW5ndGg7XG4gICAgfVxuXG4gICAgcmVhcnJhbmdlKCkge1xuICAgICAgICB0aGlzLmZyZWVfc2V0LmNsZWFyKCk7XG4gICAgICAgIGxldCBvZmZzZXQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHJhbmdlIG9mIHRoaXMudmFsaWRfc2V0KSB7XG4gICAgICAgICAgICByYW5nZS5ieXRlX29mZnNldCA9IG9mZnNldDtcbiAgICAgICAgICAgIG9mZnNldCArPSByYW5nZS5ieXRlX2xlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRhaWwgPSBvZmZzZXQ7XG4gICAgICAgIHRoaXMuaGVhcF9zaXplID0gTWF0aC5tYXgodGhpcy5oZWFwX3NpemUsIHRoaXMudGFpbCk7XG4gICAgfVxuXG59IiwgImltcG9ydCB7IFR5cGVkQXJyYXkgfSBmcm9tICcuLi9zdGQvdHlwZSc7XG5pbXBvcnQgeyBXZWJHTERyYXdEZXNjcmlwdG9yIH0gZnJvbSAnLi4vd2ViZ2wvZHJhdyc7XG5pbXBvcnQgeyBHUFVQYXNzRGVzY3JpcHRvciB9IGZyb20gJy4uL3dlYmdsL3Bhc3MnO1xuaW1wb3J0IHsgR1BVUGlwZWxpbmVEZXNjcmlwdG9yIH0gZnJvbSAnLi4vd2ViZ2wvcGlwZWxpbmUnO1xuaW1wb3J0IHsgV2ViR0xUZXh0dXJlRGVzY3JpcHRvciB9IGZyb20gJy4uL3dlYmdsL3RleHR1cmUnO1xuaW1wb3J0IHsgR0ZYRGV2aWNlT3B0aW9ucyB9IGZyb20gJy4vZ2Z4X2RldmljZSc7XG5pbXBvcnQgeyBSZW5kZXJSZXNvdXJjZVR5cGUgfSBmcm9tICcuL3JlbmRlci5yZXNvdXJjZSc7XG5cbmV4cG9ydCBlbnVtIFJlbmRlckNvbW1hbmRUeXBlIHtcbiAgICBDcmVhdGVEZXZpY2UgPSAwLFxuICAgIERldmljZVJlc2l6ZSxcbiAgICBHZXRFeHRlbnNpb24sXG4gICAgQ3JlYXRlVGV4dHVyZSxcbiAgICBDcmVhdGVCdWZmZXIsXG4gICAgQ3JlYXRlRHJhdyxcbiAgICBDcmVhdGVQaXBlbGluZSxcbiAgICBDcmVhdGVQYXNzLFxuICAgIFNoYXJlQnVmZmVyLFxuICAgIFVwZGF0ZVRleHR1cmUsXG4gICAgVXBkYXRlQnVmZmVyLFxuICAgIEV4ZWN1dGVDb21tYW5kQnVmZmVyLFxuICAgIEV4ZWN1dGVDb21tYW5kUXVldWUsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyUmVzb3VyY2Uge1xuICAgIHR5cGU6IFJlbmRlclJlc291cmNlVHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJDb21tYW5kIHtcbiAgICB0eXBlOiBSZW5kZXJDb21tYW5kVHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSQ3JlYXRlRGV2aWNlIGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgY2FudmFzOiBPZmZzY3JlZW5DYW52YXM7IC8vIG11c3QgY2FsbCB0cmFuc2ZlckNvbnRyb2xUb09mZnNjcmVlbiBiZWZvcmUgcGFzc2luZyB0byB3b3JrZXJcbiAgICBvcHRpb25zOiBHRlhEZXZpY2VPcHRpb25zO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJEZXZpY2VSZXNpemUgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHBpeGVsX3dpZHRoOiBudW1iZXI7XG4gICAgcGl4ZWxfaGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkdldEV4dGVuc2lvbiBleHRlbmRzIFJlbmRlckNvbW1hbmQge1xuICAgIGV4dGVuc2lvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJDcmVhdGVUZXh0dXJlIGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgcmVzb3VyY2VfaWQ6IG51bWJlcjtcbiAgICBkZXNjcmlwdG9yOiBXZWJHTFRleHR1cmVEZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJDcmVhdGVCdWZmZXIgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICBidWZmZXI6IFR5cGVkQXJyYXk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUlNoYXJlQnVmZmVyIGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgcmVzb3VyY2VfaWQ6IG51bWJlcjtcbiAgICBidWZmZXI6IFNoYXJlZEFycmF5QnVmZmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJDcmVhdGVEcmF3IGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgcmVzb3VyY2VfaWQ6IG51bWJlcjtcbiAgICBkZXNjcmlwdG9yOiBXZWJHTERyYXdEZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJDcmVhdGVQaXBlbGluZSBleHRlbmRzIFJlbmRlckNvbW1hbmQge1xuICAgIHJlc291cmNlX2lkOiBudW1iZXI7XG4gICAgZGVzY3JpcHRvcjogR1BVUGlwZWxpbmVEZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJDcmVhdGVQYXNzIGV4dGVuZHMgUmVuZGVyQ29tbWFuZCB7XG4gICAgcmVzb3VyY2VfaWQ6IG51bWJlcjtcbiAgICBkZXNjcmlwdG9yOiBHUFVQYXNzRGVzY3JpcHRvcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSVXBkYXRlVGV4dHVyZSBleHRlbmRzIFJlbmRlckNvbW1hbmQge1xuICAgIHJlc291cmNlX2lkOiBudW1iZXI7IC8vIHNoYXJlZCBidWZmZXIgaWRcbiAgICBvZmZzZXQ6IG51bWJlcjtcbiAgICBzaXplOiBudW1iZXI7XG5cbiAgICB4PzogbnVtYmVyO1xuICAgIHk/OiBudW1iZXI7XG4gICAgd2lkdGg/OiBudW1iZXI7XG4gICAgaGVpZ2h0PzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJEaXNwb3NlUmVzb3VyY2UgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICByZXNvdXJjZV9pZDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJFeGVjdXRlQ29tbWFuZEJ1ZmZlciBleHRlbmRzIFJlbmRlckNvbW1hbmQge1xuICAgIGJ1ZmZlcjogQXJyYXlCdWZmZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkV4ZWN1dGVDb21tYW5kUXVldWUgZXh0ZW5kcyBSZW5kZXJDb21tYW5kIHtcbiAgICBidWZmZXI6IEFycmF5QnVmZmVyO1xufVxuXG5leHBvcnQgdHlwZSBSZW5kZXJDb21tYW5kSGFuZGxlcjxUIGV4dGVuZHMgUmVuZGVyQ29tbWFuZD4gPSAoY29tbWFuZDogVCkgPT4gdm9pZDtcbmNvbnN0IGNvbW1hbmRfaGFuZGxlcnMgPSBuZXcgTWFwPFJlbmRlckNvbW1hbmRUeXBlLCBSZW5kZXJDb21tYW5kSGFuZGxlcjxhbnk+PigpO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyX3JlZ2lzdGVyX2NvbW1hbmRfaGFuZGxlcjxUIGV4dGVuZHMgUmVuZGVyQ29tbWFuZD4odHlwZTogUmVuZGVyQ29tbWFuZFR5cGUsIGhhbmRsZXI6IFJlbmRlckNvbW1hbmRIYW5kbGVyPFQ+KSB7XG4gICAgY29tbWFuZF9oYW5kbGVycy5zZXQodHlwZSwgaGFuZGxlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJfY29tbWFuZF9oYW5kbGVyX2dldDxUIGV4dGVuZHMgUmVuZGVyQ29tbWFuZD4odHlwZTogUmVuZGVyQ29tbWFuZFR5cGUpOiBSZW5kZXJDb21tYW5kSGFuZGxlcjxUPiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGNvbW1hbmRfaGFuZGxlcnMuZ2V0KHR5cGUpO1xufVxuIiwgImltcG9ydCB7IFdvcmtlclJlc3BvbnNlIH0gZnJvbSAnLi4vd29ya2VyL3dlYl93b3JrZXInO1xuaW1wb3J0IHsgUmVuZGVyQ29tbWFuZCwgUmVuZGVyQ29tbWFuZFR5cGUsIHJlbmRlcl9jb21tYW5kX2hhbmRsZXJfZ2V0IH0gZnJvbSAnLi9yZW5kZXIuY29tbWFuZCc7XG5cbmZ1bmN0aW9uIHBvc3RfbWVzc2FnZSh0YXNrX2lkOiBudW1iZXIsIGRhdGE6IGFueSwgbWVzc2FnZT86IHN0cmluZykge1xuICAgIGNvbnN0IGV2ZW50ID0geyB0YXNrX2lkLCBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlLCBkYXRhIH0gYXMgV29ya2VyUmVzcG9uc2U7XG4gICAgc2VsZi5wb3N0TWVzc2FnZShldmVudCk7XG59XG5cbmZ1bmN0aW9uIHBvc3RfbWVzc2FnZV9lcnJvcih0YXNrX2lkOiBudW1iZXIsIGRhdGE6IGFueSwgbWVzc2FnZT86IHN0cmluZykge1xuICAgIGNvbnN0IGV2ZW50ID0geyB0YXNrX2lkLCBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZSwgZGF0YSB9IGFzIFdvcmtlclJlc3BvbnNlO1xuICAgIHNlbGYucG9zdE1lc3NhZ2UoZXZlbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyX3dvcmtlcl9jb21tYW5kX21lc3NhZ2UobWVzc2FnZTogTWVzc2FnZUV2ZW50KSB7XG4gICAgY29uc3QgdGFza19pZCA9IG1lc3NhZ2UuZGF0YS50YXNrX2lkO1xuICAgIGNvbnN0IGNvbW1hbmQgPSBtZXNzYWdlLmRhdGEgYXMgUmVuZGVyQ29tbWFuZDtcbiAgICBjb25zdCBoYW5kbGVyID0gcmVuZGVyX2NvbW1hbmRfaGFuZGxlcl9nZXQoY29tbWFuZC50eXBlKTtcbiAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgPFJlbmRlclRocmVhZFdlYkdMPiBleGVjdXRlIGlkOiAke3Rhc2tfaWR9IHR5cGU6ICR7UmVuZGVyQ29tbWFuZFR5cGVbY29tbWFuZC50eXBlXX1gKTtcbiAgICAgICAgaGFuZGxlcihjb21tYW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IHR5cGUgfSA9IGNvbW1hbmQ7XG4gICAgICAgIHBvc3RfbWVzc2FnZV9lcnJvcih0YXNrX2lkLCB7IHR5cGUgfSwgYENvbW1hbmQgaGFuZGxlciBmb3IgdHlwZSAke2NvbW1hbmQudHlwZX0gbm90IGZvdW5kLmApO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyByZW5kZXJfd29ya2VyX2NvbW1hbmRfbWVzc2FnZSB9IGZyb20gJy4uL2dmeC9yZW5kZXIud29ya2VyJztcblxuaW50ZXJmYWNlIEdQVUFkYXB0ZXIge1xuICAgIHJlcXVlc3REZXZpY2UoKTogUHJvbWlzZTxHRlhEZXZpY2UgfCB1bmRlZmluZWQ+O1xufVxuaW50ZXJmYWNlIEdGWERldmljZSB7fVxuXG5pbnRlcmZhY2UgR1BVQ29udGV4dCB7XG4gICAgYWRhcHRlcjogR1BVQWRhcHRlcjtcbiAgICBkZXZpY2U6IEdGWERldmljZTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdlYmdwdV9kZXZpY2VfY3JlYXRlKCk6IFByb21pc2U8R1BVQ29udGV4dCB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IGdwdSA9IChuYXZpZ2F0b3IgYXMgYW55KS5ncHU7XG4gICAgaWYgKCFncHUpIHJldHVybjtcbiAgICBjb25zdCBhZGFwdGVyOiBHUFVBZGFwdGVyID0gYXdhaXQgZ3B1LnJlcXVlc3RBZGFwdGVyKCk7XG4gICAgaWYgKCFhZGFwdGVyKSByZXR1cm47XG4gICAgY29uc3QgZGV2aWNlID0gYXdhaXQgYWRhcHRlci5yZXF1ZXN0RGV2aWNlKCk7XG4gICAgaWYgKCFkZXZpY2UpIHJldHVybjtcbiAgICByZXR1cm4geyBhZGFwdGVyLCBkZXZpY2UgfSBhcyBHUFVDb250ZXh0O1xufVxuXG5zZWxmLm9ubWVzc2FnZSA9IHJlbmRlcl93b3JrZXJfY29tbWFuZF9tZXNzYWdlO1xuIiwgImltcG9ydCB7IE1hdGVyaWFsQmxvY2ssIFN1Yk1lc2ggfSBmcm9tICcuLi9lbmdpbmUnO1xuaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSAnLi4vZW5naW5lL2NhbWVyYSc7XG5pbXBvcnQgeyBHRlhEZXZpY2VPcHRpb25zIH0gZnJvbSAnLi4vZ2Z4JztcbmltcG9ydCB7IEdQVUFjdGlvbiB9IGZyb20gJy4uL2dmeC9nZnhfZGV2aWNlJztcbmltcG9ydCB7IEdGWEVuY29kZXIgfSBmcm9tICcuLi9nZngvZ2Z4X2VuY29kZXInO1xuaW1wb3J0IHsgQ29sb3JSR0JBIH0gZnJvbSAnLi4vbWF0aC9jb2xvcic7XG5pbXBvcnQgeyBXZWJHTERyYXcgfSBmcm9tICcuLi93ZWJnbC9kcmF3JztcbmltcG9ydCB7IEdQVU1lc2ggfSBmcm9tICcuLi93ZWJnbC9tZXNoJztcbmltcG9ydCB7IEdQVVBhc3MgfSBmcm9tICcuLi93ZWJnbC9wYXNzJztcbmltcG9ydCB7IFBpcGVsaW5lIH0gZnJvbSAnLi4vd2ViZ2wvcGlwZWxpbmUnO1xuXG5leHBvcnQgY2xhc3MgV2ViR1BVRW5jb2RlciBpbXBsZW1lbnRzIEdGWEVuY29kZXIge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEdGWERldmljZU9wdGlvbnMpIHt9XG4gICAgc2V0X2Rpc3BsYXlfc2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge31cbiAgICBzZXRfdmlld3BvcnQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7fVxuICAgIHNldF9jYW1lcmEoY2FtZXJhOiBDYW1lcmEpOiB2b2lkIHt9XG4gICAgc2V0X2FjdGlvbihhY3Rpb246IEdQVUFjdGlvbik6IHZvaWQge31cbiAgICBzZXRfcGFzcyhwYXNzPzogR1BVUGFzcywgZGVzY3JpcHRpb24/OiBzdHJpbmcpOiB2b2lkIHt9XG4gICAgc2V0X2NsZWFyX2NvbG9yKGNvbG9yOiBDb2xvclJHQkEpOiB2b2lkIHt9XG4gICAgY2xlYXIoYWN0aW9uPzogR1BVQWN0aW9uKTogdm9pZCB7fVxuICAgIHNldF9waXBlbGluZShwaXBlbGluZTogUGlwZWxpbmUpOiB2b2lkIHt9XG4gICAgc2V0X3NjaXNzb3IoeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlcik6IHZvaWQge31cbiAgICBzZXRfbWF0ZXJpYWwobWF0ZXJpYWw6IGFueSwgZGVzY3JpcHRpb24/OiBzdHJpbmcpOiB2b2lkIHt9XG4gICAgc2V0X21hdGVyaWFsX2Jsb2NrKG1hdGVyaWFsOiBNYXRlcmlhbEJsb2NrLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQge31cbiAgICBzZXRfZHJhdyhkcmF3OiBXZWJHTERyYXcsIGNodW5rPzogYW55LCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQge31cbiAgICBzZXRfbWVzaChtZXNoOiBHUFVNZXNoKTogdm9pZCB7fVxuICAgIGRyYXdfbWVzaChtZXNoOiBHUFVNZXNoLCBkZXNjcmlwdGlvbj86IHN0cmluZyB8IHVuZGVmaW5lZCk6IHZvaWQge31cbiAgICBkcmF3X3N1Ym1lc2goc3VibWVzaDogU3ViTWVzaCwgZGVzY3JpcHRpb24/OiBzdHJpbmcgfCB1bmRlZmluZWQpOiB2b2lkIHt9XG4gICAgY29tbWl0KCk6IHZvaWQge31cbn0iLCAiaW1wb3J0IHsgRXZlbnRIdWIsIEdsb2JhbEV2ZW50IH0gZnJvbSAnLi4vZW5naW5lJztcbmltcG9ydCB7IENvbG9yUkdCQSB9IGZyb20gJy4uL21hdGgnO1xuaW1wb3J0IHsgV2ViR0xFbmNvZGVyLCBjcmVhdGVfYmxvY2tfZ2xvYmFsIH0gZnJvbSAnLi4vd2ViZ2wnO1xuaW1wb3J0IHsgV2ViR1BVRW5jb2RlciB9IGZyb20gJy4uL3dlYmdwdSc7XG5pbXBvcnQgeyBHRlhFbmNvZGVyIH0gZnJvbSAnLi9nZnhfZW5jb2Rlcic7XG5cbmV4cG9ydCBlbnVtIEdGWEJhY2tlbmQge1xuICAgIFdlYkdMID0gJ3B1YmxpYy9zcmMvd29ya2VyL3dlYmdsLnJlbmRlci93Z2wud29ya2VyLmpzJyxcbiAgICBXZWJHUFUgPSAncHVibGljL3NyYy93b3JrZXIvd2ViZ3B1LnJlbmRlci93Z3B1Lndvcmtlci5qcydcbn1cblxuZXhwb3J0IHR5cGUgR0wgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xuXG5leHBvcnQgaW50ZXJmYWNlIEdGWERldmljZU9wdGlvbnMgZXh0ZW5kcyBXZWJHTENvbnRleHRBdHRyaWJ1dGVzIHtcbiAgICBjYW52YXM/OiBIVE1MQ2FudmFzRWxlbWVudFxuICAgIGRpc3BsYXlfcmF0aW8/OiBudW1iZXI7XG4gICAgcHJlc2VydmVfYnVmZmVyPzogYm9vbGVhbjtcbiAgICBtdWx0aV90aHJlYWRfcmVuZGVyaW5nPzogYm9vbGVhbjtcbiAgICBiYWNrZW5kPzogR0ZYQmFja2VuZDtcbiAgICB4cl9lbmFibGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGVudW0gR1BVQWN0aW9uVHlwZSB7XG4gICAgQ2xlYXJDb2xvciA9IDEgPDwgMCxcbiAgICBDbGVhckRlcHRoID0gMSA8PCAxLFxuICAgIENsZWFyU3RlbmNpbCA9IDEgPDwgMixcbiAgICBDbGVhckFsbCA9IENsZWFyQ29sb3IgfCBDbGVhckRlcHRoIHwgQ2xlYXJTdGVuY2lsLFxuICAgIElnbm9yZSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHUFVBY3Rpb24ge1xuICAgIHR5cGU6IEdQVUFjdGlvblR5cGU7XG4gICAgY2xlYXJfY29sb3I6IENvbG9yUkdCQTtcbiAgICBjbGVhcl9kZXB0aDogbnVtYmVyO1xufVxuXG5jb25zdCBkZWZhdWx0X2NsZWFyX2FjdGlvbiA9IHtcbiAgICB0eXBlOiBHUFVBY3Rpb25UeXBlLkNsZWFyQWxsLFxuICAgIGNsZWFyX2NvbG9yOiBuZXcgQ29sb3JSR0JBKDAsIDAsIDAsIDApLFxuICAgIGNsZWFyX2RlcHRoOiAxLFxufSBhcyBHUFVBY3Rpb247XG5cbmV4cG9ydCBlbnVtIEdQVVN0b3JhZ2VNb2RlIHtcbiAgICBTaGFyZWQsXG4gICAgR1BVT25seSxcbiAgICBNZW1vcnlsZXNzLFxufVxuXG5sZXQgX2RldmljZTogR0ZYRGV2aWNlIHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgY2xhc3MgR0ZYRGV2aWNlIHtcbiAgICB3aWR0aDogbnVtYmVyID0gMTtcbiAgICBoZWlnaHQ6IG51bWJlciA9IDE7XG5cbiAgICBkaXNwbGF5X3JhdGlvOiBudW1iZXIgPSAxO1xuXG4gICAgZGlzcGxheV93aWR0aDogbnVtYmVyID0gMTtcbiAgICBkaXNwbGF5X2hlaWdodDogbnVtYmVyID0gMTtcblxuICAgIGJhY2tlbmQ6IEdGWEJhY2tlbmQgPSBHRlhCYWNrZW5kLldlYkdMO1xuICAgIGVuY29kZXI6IEdGWEVuY29kZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBHRlhEZXZpY2VPcHRpb25zID0ge30pIHtcbiAgICAgICAgX2RldmljZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuZGlzcGxheV9yYXRpbyA9IG9wdGlvbnMuZGlzcGxheV9yYXRpbyA/PyAxO1xuICAgICAgICB0aGlzLmJhY2tlbmQgPSBvcHRpb25zLmJhY2tlbmQgPz8gR0ZYQmFja2VuZC5XZWJHTDtcbiAgICAgICAgaWYgKG9wdGlvbnMuYmFja2VuZCA9PT0gR0ZYQmFja2VuZC5XZWJHUFUpIHtcbiAgICAgICAgICAgIHRoaXMuZW5jb2RlciA9IG5ldyBXZWJHUFVFbmNvZGVyKG9wdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbmNvZGVyID0gbmV3IFdlYkdMRW5jb2RlcihvcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuc2V0X3NpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYDxHUFVEZXZpY2U+IGFjdGl2ZSBiYWNrZW5kOiAke3RoaXMuYmFja2VuZH1gKTtcbiAgICAgICAgdGhpcy5lbmNvZGVyLnNldF92aWV3cG9ydCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIGNyZWF0ZV9ibG9ja19nbG9iYWwoKTtcbiAgICB9XG5cbiAgICBzZXRfc2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHRoaXMge1xuICAgICAgICB0aGlzLmRpc3BsYXlfd2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5kaXNwbGF5X2hlaWdodCA9IGhlaWdodDtcblxuICAgICAgICBjb25zdCBwaXhlbF93aWR0aCA9IE1hdGguZmxvb3Iod2lkdGggKiB0aGlzLmRpc3BsYXlfcmF0aW8pO1xuICAgICAgICBjb25zdCBwaXhlbF9oZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAqIHRoaXMuZGlzcGxheV9yYXRpbyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IHBpeGVsX3dpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHBpeGVsX2hlaWdodDtcblxuICAgICAgICB0aGlzLmVuY29kZXIuc2V0X2Rpc3BsYXlfc2l6ZShwaXhlbF93aWR0aCwgcGl4ZWxfaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5lbmNvZGVyLnNldF92aWV3cG9ydCgwLCAwLCBwaXhlbF93aWR0aCwgcGl4ZWxfaGVpZ2h0KTtcblxuICAgICAgICBFdmVudEh1Yi5maXJlKEdsb2JhbEV2ZW50LlJlc2l6ZSwgeyB3aWR0aCwgaGVpZ2h0IH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZnhfZGV2aWNlX2dldCgpOiBHRlhEZXZpY2Uge1xuICAgIHJldHVybiBfZGV2aWNlIGFzIEdGWERldmljZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2Z4X2VuY29kZXJfZ2V0PFQgZXh0ZW5kcyBHRlhFbmNvZGVyPigpOiBUIHtcbiAgICByZXR1cm4gZ2Z4X2RldmljZV9nZXQoKS5lbmNvZGVyIGFzIFQ7XG59XG4iLCAiZXhwb3J0IHR5cGUgT3B0aW9uYWw8VD4gPSBUIHwgbnVsbDtcbmV4cG9ydCB0eXBlIENvbnN0cnVjdG9yPFQ+ID0gbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gVDtcbmV4cG9ydCB0eXBlIFN0cmluZ01hcDxWID0gYW55PiA9IHsgW2tleTogc3RyaW5nXTogViB9O1xuZXhwb3J0IHR5cGUgTnVtYmVyTWFwPFYgPSBhbnk+ID0geyBba2V5OiBudW1iZXJdOiBWIH07XG5leHBvcnQgdHlwZSBFbnVtTWFwPFQgZXh0ZW5kcyBzdHJpbmcsIFY+ID0geyBba2V5IGluIFRdOiBWIH07XG5cbmV4cG9ydCB0eXBlIFR5cGVkQXJyYXkgPSBJbnQ4QXJyYXkgfCBVaW50OEFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQxNkFycmF5IHwgSW50MzJBcnJheSB8IFVpbnQzMkFycmF5IHwgRmxvYXQzMkFycmF5IHwgRmxvYXQ2NEFycmF5O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNfc3RyaW5nKG9iajogYW55KTogb2JqIGlzIHN0cmluZyB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdzdHJpbmcnIHx8IG9iaiBpbnN0YW5jZW9mIFN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzX251bWJlcihvYmo6IGFueSk6IG9iaiBpcyBudW1iZXIge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShvYmopO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzX3N1ZmZpeChpbnB1dDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZ1tdKTogc3RyaW5nIHwgZmFsc2Uge1xuICAgIGNvbnN0IG5hbWUgPSBpbnB1dC5zcGxpdCgvXFwuL2cpLnBvcCgpO1xuICAgIGlmICghbmFtZSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBzdWZmaXguaW5kZXhPZihuYW1lKSAhPT0gLTEgPyBuYW1lIDogZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0X3ZhbHVlPFQ+KHZhbHVlOiBUIHwgdW5kZWZpbmVkLCBkZWZhdWx0X3ZhbHVlOiBUKTogVCB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyBkZWZhdWx0X3ZhbHVlIDogdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXJlZjxUIGV4dGVuZHMgb2JqZWN0PihyZWY6IFdlYWtSZWY8VD4pOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAocmVmID09PSB1bmRlZmluZWQpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlZi5kZXJlZigpO1xufVxuIiwgImV4cG9ydCBlbnVtIFdvcmtlclN0YXRlIHtcbiAgICBJZGxlLFxuICAgIFJ1bm5pbmcsXG59XG5cbmV4cG9ydCB0eXBlIFdvcmtlck1lc3NhZ2UgPSB7IHRhc2tfaWQ6IG51bWJlciB9ICYgYW55O1xuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtlclJlc3BvbnNlIHtcbiAgICB0YXNrX2lkOiBudW1iZXI7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgZGF0YTogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtlclJlcXVlc3Qge1xuICAgIG1lc3NhZ2U6IGFueTtcbiAgICBidWZmZXJzPzogQXJyYXlCdWZmZXJbXTtcbiAgICBjYWxsYmFjaz86IGFueTtcbn1cblxuZXhwb3J0IGNsYXNzIFdlYldvcmtlciB7XG4gICAgcHJpdmF0ZSBzdGF0ZSA9IFdvcmtlclN0YXRlLklkbGU7XG4gICAgcHJpdmF0ZSBxdWV1ZTogV29ya2VyUmVxdWVzdFtdID0gW107XG4gICAgcHVibGljIHdvcmtlcl9uYW1lOiBzdHJpbmcgPSAnYW5vbnltb3VzJztcbiAgICBwcml2YXRlIHRhc2tfaWQgPSAwO1xuXG4gICAgcHJpdmF0ZSBjYWxsYmFja3MgPSBuZXcgTWFwPG51bWJlciwgRnVuY3Rpb24+KCk7XG5cbiAgICBnZXQgYXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gV29ya2VyU3RhdGUuSWRsZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHdvcmtlcjogV29ya2VyLCBwcml2YXRlIGF1dG9fdGVybWluYXRlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy53b3JrZXIub25tZXNzYWdlID0gdGhpcy5vbm1lc3NhZ2U7XG4gICAgfVxuXG4gICAgc2VuZChtZXNzYWdlOiBXb3JrZXJNZXNzYWdlLCBidWZmZXJzPzogQXJyYXlCdWZmZXJbXSwgY2FsbGJhY2s/OiAoZGF0YTogYW55KSA9PiB2b2lkKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHRhc2tfaWQgPSB0aGlzLnRhc2tfaWQrKztcbiAgICAgICAgbWVzc2FnZS50YXNrX2lkID0gdGFza19pZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IFdvcmtlclN0YXRlLklkbGUpIHtcbiAgICAgICAgICAgIHRoaXMucXVldWUucHVzaCh7IG1lc3NhZ2UsIGJ1ZmZlcnMsIGNhbGxiYWNrIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIGJ1ZmZlcnMhKTtcbiAgICAgICAgdGhpcy53b3JrZXIub25tZXNzYWdlID0gdGhpcy5vbm1lc3NhZ2U7XG4gICAgICAgIGlmIChjYWxsYmFjaykgdGhpcy5jYWxsYmFja3Muc2V0KHRhc2tfaWQsIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgc2VuZF9hc3luYzxUPihtZXNzYWdlOiBXb3JrZXJNZXNzYWdlLCBidWZmZXJzOiBBcnJheUJ1ZmZlcltdID0gW10pOiBQcm9taXNlPFQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbmQobWVzc2FnZSwgYnVmZmVycywgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uX3Jlc3BvbnNlPzogKHJlc3BvbnNlOiBXb3JrZXJSZXNwb25zZSkgPT4gdm9pZDtcblxuICAgIHByaXZhdGUgb25tZXNzYWdlID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFdvcmtlclN0YXRlLklkbGU7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gZXZlbnQuZGF0YSBhcyBXb3JrZXJSZXNwb25zZTtcbiAgICAgICAgY29uc3QgeyB0YXNrX2lkIH0gPSByZXNwb25zZTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGA8V2ViV29ya2VyPiBlcnJvcjogJHtyZXNwb25zZS5tZXNzYWdlIHx8ICd1bmRlZmluZWQgd29ya2VyIGVycm9yJ31gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGA8V2ViV29ya2VyPiB3b3JrZXIgJHt0aGlzLndvcmtlcl9uYW1lfSBleGVjdXRlIHN1Y2Nlc3MuYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub25fcmVzcG9uc2UpIHRoaXMub25fcmVzcG9uc2UocmVzcG9uc2UpO1xuICAgICAgICBpZiAodGFza19pZCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY2FsbGJhY2tzLmhhcyh0YXNrX2lkKSkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrcy5nZXQodGFza19pZCkhO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIGNhbGxiYWNrKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MuZGVsZXRlKHRhc2tfaWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLnF1ZXVlLnNoaWZ0KCkhO1xuICAgICAgICAgICAgdGhpcy5zZW5kKHJlcXVlc3QubWVzc2FnZSwgcmVxdWVzdC5idWZmZXJzLCByZXF1ZXN0LmNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF1dG9fdGVybWluYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuIiwgImltcG9ydCB7IGlzX3N0cmluZywgVHlwZWRBcnJheSB9IGZyb20gJy4uL3N0ZC90eXBlJztcbmltcG9ydCB7IFdlYkdMVGV4dHVyZURlc2NyaXB0b3IgfSBmcm9tICcuLi93ZWJnbC90ZXh0dXJlJztcbmltcG9ydCB7IFdlYldvcmtlciB9IGZyb20gJy4uL3dvcmtlci93ZWJfd29ya2VyJztcbmltcG9ydCB7IEdGWEJhY2tlbmQsIEdGWERldmljZU9wdGlvbnMgfSBmcm9tICcuL2dmeF9kZXZpY2UnO1xuaW1wb3J0IHsgUkNyZWF0ZURldmljZSwgUkRldmljZVJlc2l6ZSwgUmVuZGVyQ29tbWFuZFR5cGUgfSBmcm9tICcuL3JlbmRlci5jb21tYW5kJztcblxuZXhwb3J0IGNsYXNzIEdGWERldmljZUNsaWVudCB7XG4gICAgcHJpdmF0ZSByZXNvdXJjZV9pZCA9IDA7XG4gICAgcHJpdmF0ZSBnZXRfcmVzb3VyY2VfaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc291cmNlX2lkKys7XG4gICAgfVxuICAgIHByaXZhdGUgcmVuZGVyX3RocmVhZDogV2ViV29ya2VyO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIGJhY2tlbmQ6IEdGWEJhY2tlbmQpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcihiYWNrZW5kIGFzIHN0cmluZywgeyBuYW1lOiAnUmVuZGVyVGhyZWFkJyB9KTtcbiAgICAgICAgdGhpcy5yZW5kZXJfdGhyZWFkID0gbmV3IFdlYldvcmtlcih3b3JrZXIpO1xuICAgIH1cblxuICAgIGNyZWF0ZV9kZXZpY2UoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgb3B0aW9uczogR0ZYRGV2aWNlT3B0aW9ucyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IG9mZnNjcmVlbl9jYW52YXMgPSBjYW52YXMudHJhbnNmZXJDb250cm9sVG9PZmZzY3JlZW4oKTtcbiAgICAgICAgY29uc3QgcmVzb3VyY2VfaWQgPSB0aGlzLmdldF9yZXNvdXJjZV9pZCgpO1xuICAgICAgICBjb25zdCBjb21tYW5kID0geyByZXNvdXJjZV9pZCwgdHlwZTogUmVuZGVyQ29tbWFuZFR5cGUuQ3JlYXRlRGV2aWNlLCBjYW52YXM6IG9mZnNjcmVlbl9jYW52YXMsIG9wdGlvbnMgfSBhcyBSQ3JlYXRlRGV2aWNlO1xuICAgICAgICB0aGlzLnJlbmRlcl90aHJlYWQuc2VuZChjb21tYW5kLCBbb2Zmc2NyZWVuX2NhbnZhcyBhcyBhbnldKTtcbiAgICAgICAgcmV0dXJuIHJlc291cmNlX2lkO1xuICAgIH1cblxuICAgIGNyZWF0ZV90ZXh0dXJlKGRlc2NyaXB0b3I6IFdlYkdMVGV4dHVyZURlc2NyaXB0b3IpOiBudW1iZXIge1xuICAgICAgICBjb25zdCByZXNvdXJjZV9pZCA9IHRoaXMuZ2V0X3Jlc291cmNlX2lkKCk7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB7IHJlc291cmNlX2lkLCB0eXBlOiBSZW5kZXJDb21tYW5kVHlwZS5DcmVhdGVUZXh0dXJlLCBkZXNjcmlwdG9yIH07XG4gICAgICAgIGNvbnN0IGJ1ZmZlcnMgPSB0ZXh0dXJlX2Rlc2NyaXB0b3JfY29sbGVjdF9idWZmZXIoZGVzY3JpcHRvcik7XG4gICAgICAgIHRoaXMucmVuZGVyX3RocmVhZC5zZW5kKGNvbW1hbmQsIGJ1ZmZlcnMpO1xuICAgICAgICByZXR1cm4gcmVzb3VyY2VfaWQ7XG4gICAgfVxuXG4gICAgdXBkYXRlX3RleHR1cmUocmVzb3VyY2VfaWQ6IG51bWJlcikge31cblxuICAgIHJlc2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgcGl4ZWxfd2lkdGg6IG51bWJlciwgcGl4ZWxfaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IFJlbmRlckNvbW1hbmRUeXBlLkRldmljZVJlc2l6ZTtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IHsgdHlwZSwgd2lkdGgsIGhlaWdodCwgcGl4ZWxfd2lkdGgsIHBpeGVsX2hlaWdodCB9IGFzIFJEZXZpY2VSZXNpemU7XG4gICAgICAgIHRoaXMucmVuZGVyX3RocmVhZC5zZW5kKGNvbW1hbmQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdGV4dHVyZV9kZXNjcmlwdG9yX2NvbGxlY3RfYnVmZmVyKGRlc2NyaXB0b3I6IFdlYkdMVGV4dHVyZURlc2NyaXB0b3IpOiBBcnJheUJ1ZmZlcltdIHtcbiAgICBjb25zdCB7IHNvdXJjZSwgbWlwbWFwcyB9ID0gZGVzY3JpcHRvcjtcbiAgICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlcltdID0gW107XG4gICAgY29uc3QgYnVmZmVyX3NldCA9IG5ldyBTZXQoKTtcblxuICAgIGlmIChzb3VyY2UgJiYgIWlzX3N0cmluZyhzb3VyY2UpKSB7XG4gICAgICAgIGJ1ZmZlcnMucHVzaCgoc291cmNlIGFzIFR5cGVkQXJyYXkpLmJ1ZmZlcik7XG4gICAgICAgIGJ1ZmZlcl9zZXQuYWRkKChzb3VyY2UgYXMgVHlwZWRBcnJheSkuYnVmZmVyKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IG1pcG1hcCBvZiBtaXBtYXBzKSB7XG4gICAgICAgIGlmIChtaXBtYXAgJiYgIWlzX3N0cmluZyhtaXBtYXApICYmICFidWZmZXJfc2V0LmhhcyhtaXBtYXAuZGF0YS5idWZmZXIpKSB7XG4gICAgICAgICAgICBidWZmZXJzLnB1c2gobWlwbWFwLmRhdGEuYnVmZmVyKTtcbiAgICAgICAgICAgIGJ1ZmZlcl9zZXQuYWRkKG1pcG1hcC5kYXRhLmJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmZmVycztcbn1cbiIsICJpbXBvcnQgeyBCdWZmZXJSYW5nZSwgRmxleEJ1ZmZlclZpZXcgfSBmcm9tICcuLi9hZHQnO1xuaW1wb3J0IHsgQmxvY2tBbGxvY2F0b3IgfSBmcm9tICcuLi9hZHQvYmxvY2tfYWxsb2NhdG9yJztcbmltcG9ydCB7IGdmeF9kZXZpY2VfZ2V0IH0gZnJvbSAnLi4vZ2Z4JztcbmltcG9ydCB7IFdlYkdMRW5jb2RlciB9IGZyb20gJy4vZW5jb2Rlcic7XG5pbXBvcnQgeyBQaXBlbGluZSwgU3RydWN0VW5pZm9ybSB9IGZyb20gJy4vcGlwZWxpbmUnO1xuXG5leHBvcnQgZW51bSBSZW5kZXJCbG9ja1R5cGUge1xuICAgIEZyYW1lID0gMCxcbiAgICBPYmplY3QsXG4gICAgTWF0ZXJpYWxcbn1cblxuZXhwb3J0IGVudW0gUmVuZGVyQmxvY2tOYW1lIHtcbiAgICBGcmFtZSA9ICdmcmFtZV9ibG9jaycsXG4gICAgT2JqZWN0ID0gJ29iamVjdF9ibG9jaycsXG4gICAgTWF0ZXJpYWwgPSAnbWF0ZXJpYWxfYmxvY2snXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQmxvY2sge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0eXBlOiBSZW5kZXJCbG9ja1R5cGU7XG4gICAgcmFuZ2U6IEJ1ZmZlclJhbmdlO1xuICAgIHZpZXc6IEZsZXhCdWZmZXJWaWV3O1xufVxuXG5cbmludGVyZmFjZSBUeXBlZEJsb2NrIHtcbiAgICBidWZmZXI6IFdlYkdMQnVmZmVyO1xuICAgIGRhdGE6IEZsZXhCdWZmZXJWaWV3O1xuICAgIGFsbG9jYXRvcjogQmxvY2tBbGxvY2F0b3I7XG59XG5cbmludGVyZmFjZSBCbG9ja0NvbnRleHQge1xuICAgIGJsb2NrczogTWFwPFJlbmRlckJsb2NrVHlwZSwgVHlwZWRCbG9jaz47XG59XG5cbmNvbnN0IEJMT0NLX01JTk9SX0JVRkZFUl9TSVpFID0gNCAqIDEwMjQ7XG5jb25zdCBCTE9DS19NQUpPUl9CVUZGRVJfU0laRSA9IDE2ICogMTAyNDtcblxuZXhwb3J0IGNvbnN0IEJMT0NLX1NJWkVfT0JKRUNUID0gNjQ7XG5cbmxldCBibG9ja19jb250ZXh0OiBCbG9ja0NvbnRleHQgfCB1bmRlZmluZWQ7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlX2Jsb2NrX2dsb2JhbCgpIHtcbiAgICBjb25zdCBkZXZpY2UgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgIGNvbnN0IGdsID0gZGV2aWNlLmdsITtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZV91bmZvcm1fYnVmZmVyKHNpemU6IG51bWJlcik6IFdlYkdMQnVmZmVyIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIGJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuVU5JRk9STV9CVUZGRVIsIHNpemUsIGdsLkRZTkFNSUNfRFJBVyk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIG51bGwpO1xuICAgICAgICByZXR1cm4gYnVmZmVyITtcbiAgICB9XG5cbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPFJlbmRlckJsb2NrVHlwZSwgVHlwZWRCbG9jaz4oKTtcbiAgICBjb25zdCBibG9ja19zdHJpZGUgPSBkZXZpY2UuVU5JRk9STV9CVUZGRVJfQUxJR05NRU5UO1xuXG4gICAgY29uc3QgZnJhbWVfYmxvY2sgPSB7XG4gICAgICAgIGJ1ZmZlcjogY3JlYXRlX3VuZm9ybV9idWZmZXIoQkxPQ0tfTUlOT1JfQlVGRkVSX1NJWkUpLFxuICAgICAgICBkYXRhOiBuZXcgRmxleEJ1ZmZlclZpZXcobmV3IEFycmF5QnVmZmVyKEJMT0NLX01JTk9SX0JVRkZFUl9TSVpFKSksXG4gICAgICAgIGFsbG9jYXRvcjogbmV3IEJsb2NrQWxsb2NhdG9yKGJsb2NrX3N0cmlkZSksXG4gICAgfVxuICAgIG1hcC5zZXQoUmVuZGVyQmxvY2tUeXBlLkZyYW1lLCBmcmFtZV9ibG9jayk7XG5cbiAgICBjb25zdCBvYmplY3RfYmxvY2sgPSB7XG4gICAgICAgIGJ1ZmZlcjogY3JlYXRlX3VuZm9ybV9idWZmZXIoQkxPQ0tfTUlOT1JfQlVGRkVSX1NJWkUpLFxuICAgICAgICBkYXRhOiBuZXcgRmxleEJ1ZmZlclZpZXcobmV3IEFycmF5QnVmZmVyKEJMT0NLX01JTk9SX0JVRkZFUl9TSVpFKSksXG4gICAgICAgIGFsbG9jYXRvcjogbmV3IEJsb2NrQWxsb2NhdG9yKGJsb2NrX3N0cmlkZSksXG4gICAgfVxuICAgIG1hcC5zZXQoUmVuZGVyQmxvY2tUeXBlLk9iamVjdCwgb2JqZWN0X2Jsb2NrKTtcblxuICAgIGNvbnN0IG1hdGVyaWFsX2Jsb2NrID0ge1xuICAgICAgICBidWZmZXI6IGNyZWF0ZV91bmZvcm1fYnVmZmVyKEJMT0NLX01BSk9SX0JVRkZFUl9TSVpFKSxcbiAgICAgICAgZGF0YTogbmV3IEZsZXhCdWZmZXJWaWV3KG5ldyBBcnJheUJ1ZmZlcihCTE9DS19NQUpPUl9CVUZGRVJfU0laRSkpLFxuICAgICAgICBhbGxvY2F0b3I6IG5ldyBCbG9ja0FsbG9jYXRvcihibG9ja19zdHJpZGUpLFxuICAgIH1cbiAgICBtYXAuc2V0KFJlbmRlckJsb2NrVHlwZS5NYXRlcmlhbCwgbWF0ZXJpYWxfYmxvY2spO1xuXG4gICAgYmxvY2tfY29udGV4dCA9IHtcbiAgICAgICAgYmxvY2tzOiBtYXAsXG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwbG9hZF9ibG9ja19nbG9iYWwoKSB7XG4gICAgaWYgKCFibG9ja19jb250ZXh0KSB0aHJvdyAnY3JlYXRlX2Jsb2NrX2dsb2JhbCBoYXMgbm90IGJlZW4gY2FsbGVkJztcbiAgICBjb25zdCBlbmNvZGVyID0gZ2Z4X2RldmljZV9nZXQoKS5lbmNvZGVyIGFzIFdlYkdMRW5jb2RlcjtcbiAgICBjb25zdCBnbCA9IGVuY29kZXIuZ2w7XG5cbiAgICBmb3IgKGNvbnN0IFtfLCBibG9ja10gb2YgYmxvY2tfY29udGV4dC5ibG9ja3MpIHtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgYmxvY2suYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyU3ViRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgMCwgYmxvY2suZGF0YS51OF92aWV3LCAwLCBibG9jay5kYXRhLnU4X3ZpZXcuYnl0ZUxlbmd0aCk7XG4gICAgfVxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIG51bGwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlX2Jsb2NrKHR5cGU6IFJlbmRlckJsb2NrVHlwZSwgc2l6ZTogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBSZW5kZXJCbG9jayB7XG4gICAgaWYgKCFibG9ja19jb250ZXh0KSB0aHJvdyAnY3JlYXRlX2Jsb2NrX2dsb2JhbCBoYXMgbm90IGJlZW4gY2FsbGVkJztcbiAgICBjb25zdCBibG9jayA9IGJsb2NrX2NvbnRleHQuYmxvY2tzLmdldCh0eXBlKSE7XG4gICAgY29uc3QgYmxvY2tfY291bnQgPSBNYXRoLmNlaWwoc2l6ZSAvIGJsb2NrLmFsbG9jYXRvci5ibG9ja19zaXplKTtcbiAgICBjb25zdCByYW5nZSA9IGJsb2NrX2NvbnRleHQuYmxvY2tzLmdldCh0eXBlKSEuYWxsb2NhdG9yLmFsbG9jYXRlKGJsb2NrX2NvdW50KTtcbiAgICBjb25zdCB2aWV3ID0gYmxvY2tfY29udGV4dC5ibG9ja3MuZ2V0KHR5cGUpIS5kYXRhLnN1Yl92aWV3KHJhbmdlKTtcbiAgICByZXR1cm4geyByYW5nZSwgdHlwZSwgdmlldywgbmFtZSB9IGFzIFJlbmRlckJsb2NrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBsb2FkX2Jsb2NrKGJsb2NrOiBSZW5kZXJCbG9jaykge1xuICAgIGlmICghYmxvY2tfY29udGV4dCkgdGhyb3cgJ2NyZWF0ZV9ibG9ja19nbG9iYWwgaGFzIG5vdCBiZWVuIGNhbGxlZCc7XG4gICAgaWYgKCFibG9jaykgcmV0dXJuO1xuICAgIGNvbnN0IGVuY29kZXIgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgIGNvbnN0IGdsID0gZW5jb2Rlci5nbDtcbiAgICBjb25zdCBibG9ja19kYXRhID0gYmxvY2tfY29udGV4dC5ibG9ja3MuZ2V0KGJsb2NrLnR5cGUpITtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCBibG9ja19kYXRhLmJ1ZmZlcik7XG4gICAgZ2wuYnVmZmVyU3ViRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgYmxvY2sucmFuZ2UuYnl0ZV9vZmZzZXQsIGJsb2NrLnZpZXcudThfdmlldywgMCwgYmxvY2sudmlldy51OF92aWV3LmJ5dGVMZW5ndGgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tfYmluZChwaXBlbGluZTogUGlwZWxpbmUsIGJsb2NrOiBSZW5kZXJCbG9jaykge1xuICAgIGNvbnN0IGVuY29kZXIgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgIGNvbnN0IGdsID0gZW5jb2Rlci5nbDtcbiAgICBjb25zdCBibG9ja190eXBlID0gYmxvY2sudHlwZTtcbiAgICBjb25zdCBibG9ja19kYXRhID0gYmxvY2tfY29udGV4dCEuYmxvY2tzLmdldChibG9ja190eXBlKSE7XG4gICAgY29uc3Qgc3RydWN0X3VuaWZvcm0gPSBwaXBlbGluZS51bmlmb3JtX2Jsb2NrW2Jsb2NrLm5hbWVdIGFzIFN0cnVjdFVuaWZvcm07XG4gICAgZ2wudW5pZm9ybUJsb2NrQmluZGluZyhwaXBlbGluZS5wcm9ncmFtLCBzdHJ1Y3RfdW5pZm9ybS5zdHJ1Y3RfaW5kZXgsIHN0cnVjdF91bmlmb3JtLnN0cnVjdF9pbmRleCk7XG4gICAgZ2wuYmluZEJ1ZmZlclJhbmdlKGdsLlVOSUZPUk1fQlVGRkVSLCBzdHJ1Y3RfdW5pZm9ybS5zdHJ1Y3RfaW5kZXgsIGJsb2NrX2RhdGEuYnVmZmVyLCBibG9jay5yYW5nZS5ieXRlX29mZnNldCwgYmxvY2sucmFuZ2UuYnl0ZV9sZW5ndGgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzdHJveV9ibG9jayhibG9jazogUmVuZGVyQmxvY2spIHtcbiAgICBpZiAoIWJsb2NrX2NvbnRleHQpIHRocm93ICdjcmVhdGVfYmxvY2tfZ2xvYmFsIGhhcyBub3QgYmVlbiBjYWxsZWQnO1xuICAgIGJsb2NrX2NvbnRleHQuYmxvY2tzLmdldChibG9jay50eXBlKSEuYWxsb2NhdG9yLmZyZWUoYmxvY2sucmFuZ2UpO1xufSIsICIvLyBGaWx0ZXJzXG5leHBvcnQgZW51bSBXZWJHTFRleHR1cmVGaWx0ZXIge31cbmV4cG9ydCBjb25zdCBOZWFyZXN0RmlsdGVyOiBXZWJHTFRleHR1cmVGaWx0ZXIgPSA5NzI4O1xuZXhwb3J0IGNvbnN0IE5lYXJlc3RNaXBtYXBOZWFyZXN0RmlsdGVyOiBXZWJHTFRleHR1cmVGaWx0ZXIgPSA5OTg0O1xuZXhwb3J0IGNvbnN0IE5lYXJlc3RNaXBtYXBMaW5lYXJGaWx0ZXI6IFdlYkdMVGV4dHVyZUZpbHRlciA9IDk5ODY7XG5leHBvcnQgY29uc3QgTGluZWFyRmlsdGVyOiBXZWJHTFRleHR1cmVGaWx0ZXIgPSA5NzI5O1xuZXhwb3J0IGNvbnN0IExpbmVhck1pcG1hcE5lYXJlc3RGaWx0ZXI6IFdlYkdMVGV4dHVyZUZpbHRlciA9IDk5ODU7XG5leHBvcnQgY29uc3QgTGluZWFyTWlwbWFwTGluZWFyRmlsdGVyOiBXZWJHTFRleHR1cmVGaWx0ZXIgPSA5OTg3O1xuXG4vL1dlYkdMVGV4dHVyZVdyYXBwaW5nIG1vZGVzXG5leHBvcnQgZW51bSBXZWJHTFRleHR1cmVXcmFwcGluZyB7fVxuZXhwb3J0IGNvbnN0IFJlcGVhdFdyYXBwaW5nOldlYkdMVGV4dHVyZVdyYXBwaW5nID0gMTA0OTc7XG5leHBvcnQgY29uc3QgQ2xhbXBUb0VkZ2VXcmFwcGluZzpXZWJHTFRleHR1cmVXcmFwcGluZyA9IDMzMDcxO1xuZXhwb3J0IGNvbnN0IE1pcnJvcmVkUmVwZWF0V3JhcHBpbmc6V2ViR0xUZXh0dXJlV3JhcHBpbmcgPSAzMzY0ODtcblxuLy8gRGF0YSB0eXBlc1xuZXhwb3J0IGVudW0gV2ViR0xEYXRhVHlwZSB7fVxuZXhwb3J0IGNvbnN0IFVuc2lnbmVkQnl0ZVR5cGU6IFdlYkdMRGF0YVR5cGUgPSA1MTIxO1xuZXhwb3J0IGNvbnN0IEJ5dGVUeXBlOiBXZWJHTERhdGFUeXBlID0gNTEyMDtcbmV4cG9ydCBjb25zdCBTaG9ydFR5cGU6IFdlYkdMRGF0YVR5cGUgPSA1MTIyO1xuZXhwb3J0IGNvbnN0IFVuc2lnbmVkU2hvcnRUeXBlOiBXZWJHTERhdGFUeXBlID0gNTEyMztcbmV4cG9ydCBjb25zdCBJbnRUeXBlOiBXZWJHTERhdGFUeXBlID0gNTEyNDtcbmV4cG9ydCBjb25zdCBVbnNpZ25lZEludFR5cGU6IFdlYkdMRGF0YVR5cGUgPSA1MTI1O1xuZXhwb3J0IGNvbnN0IEZsb2F0VHlwZTogV2ViR0xEYXRhVHlwZSA9IDUxMjY7XG5leHBvcnQgY29uc3QgSGFsZkZsb2F0VHlwZTogV2ViR0xEYXRhVHlwZSA9IDUxMzE7XG5leHBvcnQgY29uc3QgVW5zaWduZWRTaG9ydDQ0NDRUeXBlOiBXZWJHTERhdGFUeXBlID0gMzI4MTk7XG5leHBvcnQgY29uc3QgVW5zaWduZWRTaG9ydDU1NTFUeXBlOiBXZWJHTERhdGFUeXBlID0gMzI4MjA7XG5leHBvcnQgY29uc3QgVW5zaWduZWRTaG9ydDU2NVR5cGU6IFdlYkdMRGF0YVR5cGUgPSAzMzYzNTtcbmV4cG9ydCBjb25zdCBVbnNpZ25lZEludDI0OFR5cGU6IFdlYkdMRGF0YVR5cGUgPSAzNDA0MjtcblxuLy8gUGl4ZWwgZm9ybWF0c1xuZXhwb3J0IGVudW0gV2ViR0xQaXhlbEZvcm1hdCB7fVxuZXhwb3J0IGNvbnN0IEFscGhhRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gNjQwNjtcbmV4cG9ydCBjb25zdCBSR0JGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSA2NDA3O1xuZXhwb3J0IGNvbnN0IFJHQkFGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSA2NDA4O1xuZXhwb3J0IGNvbnN0IEx1bWluYW5jZUZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDY0MDk7XG5leHBvcnQgY29uc3QgTHVtaW5hbmNlQWxwaGFGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSA2NDEwO1xuLy8gZXhwb3J0IGNvbnN0IFJHQkVGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSAxMDI2O1xuZXhwb3J0IGNvbnN0IERlcHRoRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gNjQwMjtcbmV4cG9ydCBjb25zdCBEZXB0aFN0ZW5jaWxGb3JtYXQ6IFdlYkdMUGl4ZWxGb3JtYXQgPSAzNDA0MTtcbmV4cG9ydCBjb25zdCBEZXB0aEZvcm1hdEZsb2F0MzI6IFdlYkdMUGl4ZWxGb3JtYXQgPSAzNjAxMjtcbmV4cG9ydCBjb25zdCBEZXB0aEZvcm1hdDE2OiBXZWJHTFBpeGVsRm9ybWF0ID0gMzMxODk7XG5leHBvcnQgY29uc3QgRGVwdGhGb3JtYXQyNDogV2ViR0xQaXhlbEZvcm1hdCA9IDMzMTkwO1xuZXhwb3J0IGNvbnN0IFJlZEZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDY0MDM7XG5leHBvcnQgY29uc3QgUmVkSW50ZWdlckZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDM2MjQ0O1xuZXhwb3J0IGNvbnN0IFJHRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gMzMzMTk7XG5leHBvcnQgY29uc3QgUkdJbnRlZ2VyRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gMzMzMjA7XG5leHBvcnQgY29uc3QgUkdCSW50ZWdlckZvcm1hdDogV2ViR0xQaXhlbEZvcm1hdCA9IDM2MjQ4O1xuZXhwb3J0IGNvbnN0IFJHQkFJbnRlZ2VyRm9ybWF0OiBXZWJHTFBpeGVsRm9ybWF0ID0gMzYyNDk7XG5cbi8vIENvbXByZXNzZWQgdGV4dHVyZSBmb3JtYXRzXG4vLyBERFMgLyBTVDNDIENvbXByZXNzZWQgdGV4dHVyZSBmb3JtYXRzXG5leHBvcnQgZW51bSBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0IHt9XG5leHBvcnQgY29uc3QgUkdCX1MzVENfRFhUMV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzMzc3NjtcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUMV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzMzc3NztcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUM19Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzMzc3ODtcbmV4cG9ydCBjb25zdCBSR0JBX1MzVENfRFhUNV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzMzc3OTtcblxuLy8gUFZSVEMgY29tcHJlc3NlZCAnLi90ZXh0dXJlIGZvcm1hdHNcbmV4cG9ydCBjb25zdCBSR0JfUFZSVENfNEJQUFYxX0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM1ODQwO1xuZXhwb3J0IGNvbnN0IFJHQl9QVlJUQ18yQlBQVjFfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzU4NDE7XG5leHBvcnQgY29uc3QgUkdCQV9QVlJUQ180QlBQVjFfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzU4NDI7XG5leHBvcnQgY29uc3QgUkdCQV9QVlJUQ18yQlBQVjFfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzU4NDM7XG5cbi8vIEVUQyBjb21wcmVzc2VkIHRleHR1cmUgZm9ybWF0c1xuZXhwb3J0IGNvbnN0IFJHQl9FVEMxX0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM2MTk2O1xuXG4vLyBBU1RDIGNvbXByZXNzZWQgdGV4dHVyZSBmb3JtYXRzXG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzR4NF9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNzgwODtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNXg0X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODA5O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ181eDVfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MTA7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzZ4NV9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNzgxMTtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfNng2X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODEyO1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ184eDVfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MTM7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzh4Nl9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNzgxNDtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfOHg4X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODE1O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ18xMHg1X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODE2O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ18xMHg2X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODE3O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ18xMHg4X0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODE4O1xuZXhwb3J0IGNvbnN0IFJHQkFfQVNUQ18xMHgxMF9Gb3JtYXQ6IFdlYkdMQ29tcHJlc3NlZFdlYkdMUGl4ZWxGb3JtYXQgPSAzNzgxOTtcbmV4cG9ydCBjb25zdCBSR0JBX0FTVENfMTJ4MTBfRm9ybWF0OiBXZWJHTENvbXByZXNzZWRXZWJHTFBpeGVsRm9ybWF0ID0gMzc4MjA7XG5leHBvcnQgY29uc3QgUkdCQV9BU1RDXzEyeDEyX0Zvcm1hdDogV2ViR0xDb21wcmVzc2VkV2ViR0xQaXhlbEZvcm1hdCA9IDM3ODIxO1xuXG4vLyBJbnRlcm5hbCBQaXhlbCBGb3JtYXRzXG5leHBvcnQgZW51bSBUZXh0dXJlU3RvcmVGb3JtYXQge31cbmV4cG9ydCBjb25zdCBSODogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzMzMjE7XG5leHBvcnQgY29uc3QgUkc4OiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMzMyMztcbmV4cG9ydCBjb25zdCBSMTZGOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMzMyNTtcbmV4cG9ydCBjb25zdCBSMzJGOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMzMyNjtcbmV4cG9ydCBjb25zdCBSMzJVSTogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMHg4MjM2O1xuZXhwb3J0IGNvbnN0IFJHMTZGOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMzMyNztcbmV4cG9ydCBjb25zdCBSRzMyRjogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzMzMjg7XG5leHBvcnQgY29uc3QgUjhVSTogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzMzMzA7XG5leHBvcnQgY29uc3QgUkdCODogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzI4NDk7XG5leHBvcnQgY29uc3QgU1JHQjg6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDM1OTA1O1xuZXhwb3J0IGNvbnN0IFJHQjU2NTogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzYxOTQ7XG5leHBvcnQgY29uc3QgUjExRl9HMTFGX0IxMEY6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDM1ODk4O1xuZXhwb3J0IGNvbnN0IFJHQjlfRTU6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDM1OTAxO1xuZXhwb3J0IGNvbnN0IFJHQjE2RjogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzQ4NDM7XG5leHBvcnQgY29uc3QgUkdCMzJGOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzNDgzNztcbmV4cG9ydCBjb25zdCBSR0I4VUk6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDM2MjIxO1xuZXhwb3J0IGNvbnN0IFJHQkE4OiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMjg1NjtcbmV4cG9ydCBjb25zdCBSR0I1X0ExOiBUZXh0dXJlU3RvcmVGb3JtYXQgPSAzMjg1NTtcbmV4cG9ydCBjb25zdCBSR0JBNDogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzI4NTQ7XG5leHBvcnQgY29uc3QgUkdCQTE2RjogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzQ4NDI7XG5leHBvcnQgY29uc3QgUkdCQTMyRjogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzQ4MzY7XG5leHBvcnQgY29uc3QgUkdCQThVSTogVGV4dHVyZVN0b3JlRm9ybWF0ID0gMzYyMjA7XG5leHBvcnQgY29uc3QgUkdCQTMyVUk6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDM2MjA4O1xuZXhwb3J0IGNvbnN0IFJHQjMyVUk6IFRleHR1cmVTdG9yZUZvcm1hdCA9IDM2MjA5O1xuXG4vLyBUZXh0dXJlIFR5cGVcbmV4cG9ydCBlbnVtIFdlYkdMVGV4dHVyZVR5cGUge31cbmV4cG9ydCBjb25zdCBURVhUVVJFXzJEOiBXZWJHTFRleHR1cmVUeXBlID0gMzU1MztcbmV4cG9ydCBjb25zdCBURVhUVVJFXzNEOiBXZWJHTFRleHR1cmVUeXBlID0gMzI4Nzk7XG5leHBvcnQgY29uc3QgVEVYVFVSRV9DVUJFOiBXZWJHTFRleHR1cmVUeXBlID0gMzQwNjc7XG5leHBvcnQgY29uc3QgVEVYVFVSRV8yRF9BUlJBWTogV2ViR0xUZXh0dXJlVHlwZSA9IDM1ODY2O1xuXG5leHBvcnQgZW51bSBXZWJHTEJ1ZmZlclR5cGUge31cbmV4cG9ydCBjb25zdCBBUlJBWV9CVUZGRVI6IFdlYkdMQnVmZmVyVHlwZSA9IDM0OTYyO1xuZXhwb3J0IGNvbnN0IEVMRU1FTlRfQVJSQVlfQlVGRkVSOiBXZWJHTEJ1ZmZlclR5cGUgPSAzNDk2MztcbmV4cG9ydCBjb25zdCBDT1BZX1JFQURfQlVGRkVSOiBXZWJHTEJ1ZmZlclR5cGUgPSAzNjY2MjtcbmV4cG9ydCBjb25zdCBDT1BZX1dSSVRFX0JVRkZFUjogV2ViR0xCdWZmZXJUeXBlID0gMzY2NjM7XG5leHBvcnQgY29uc3QgUElYRUxfUEFDS19CVUZGRVI6IFdlYkdMQnVmZmVyVHlwZSA9IDM1MDUxOyAvLyBUaGUgYnVmZmVyIHdpbGwgYmUgdXNlZCBmb3IgcmVhZGluZyBmcm9tIFdlYkdMIHRleHR1cmVzXG5leHBvcnQgY29uc3QgUElYRUxfVU5QQUNLX0JVRkZFUjogV2ViR0xCdWZmZXJUeXBlID0gMzUwNTI7IC8vIFRoZSBidWZmZXIgd2lsbCBiZSB1c2VkIGZvciB3cml0aW5nIHRvIFdlYkdMIHRleHR1cmVzXG5leHBvcnQgY29uc3QgVU5JRk9STV9CVUZGRVI6IFdlYkdMQnVmZmVyVHlwZSA9IDM1MzQ1O1xuZXhwb3J0IGNvbnN0IFRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVI6IFdlYkdMQnVmZmVyVHlwZSA9IDM1OTgyO1xuXG5leHBvcnQgZW51bSBXZWJHTEJ1ZmZlclVzYWdlIHt9XG5leHBvcnQgY29uc3QgU1RBVElDX0RSQVc6IFdlYkdMQnVmZmVyVXNhZ2UgPSAzNTA0NDtcbmV4cG9ydCBjb25zdCBTVEFUSUNfUkVBRDogV2ViR0xCdWZmZXJVc2FnZSA9IDM1MDQ1O1xuZXhwb3J0IGNvbnN0IFNUQVRJQ19DT1BZOiBXZWJHTEJ1ZmZlclVzYWdlID0gMzUwNDY7XG5leHBvcnQgY29uc3QgRFlOQU1JQ19EUkFXOiBXZWJHTEJ1ZmZlclVzYWdlID0gMzUwNDg7XG5leHBvcnQgY29uc3QgRFlOQU1JQ19SRUFEOiBXZWJHTEJ1ZmZlclVzYWdlID0gMzUwNDk7XG5leHBvcnQgY29uc3QgRFlOQU1JQ19DT1BZOiBXZWJHTEJ1ZmZlclVzYWdlID0gMzUwNTA7XG5leHBvcnQgY29uc3QgU1RSRUFNX0RSQVc6IFdlYkdMQnVmZmVyVXNhZ2UgPSAzNTA0MDtcbmV4cG9ydCBjb25zdCBTVFJFQU1fUkVBRDogV2ViR0xCdWZmZXJVc2FnZSA9IDM1MDQxO1xuZXhwb3J0IGNvbnN0IFNUUkVBTV9DT1BZOiBXZWJHTEJ1ZmZlclVzYWdlID0gMzUwNDI7IiwgImltcG9ydCB7IEdQVVN0b3JhZ2VNb2RlLCBnZnhfZGV2aWNlX2dldCB9IGZyb20gJy4uL2dmeC9nZnhfZGV2aWNlJztcbmltcG9ydCB7IEJveDMgfSBmcm9tICcuLi9tYXRoL2JveCc7XG5pbXBvcnQgeyBUYW5nZW50R2VuZXJhdG9yIH0gZnJvbSAnLi4vbWF0aC90YW5nZW50JztcbmltcG9ydCB7IFN0cmluZ01hcCwgVHlwZWRBcnJheSwgZGVmYXVsdF92YWx1ZSB9IGZyb20gJy4uL3N0ZC90eXBlJztcbmltcG9ydCB7IFdlYkdMRW5jb2RlciB9IGZyb20gJy4vZW5jb2Rlcic7XG5pbXBvcnQgeyBQcmltaXRpdmVUeXBlLCBVbmlmb3JtVmFsdWUgfSBmcm9tICcuL3BpcGVsaW5lJztcbmltcG9ydCB7IEF0dHJpYnV0ZSwgR0xBdHRyaWJ1dGUsIEluZGV4UmFuZ2UsIFByaW1pdGl2ZSwgcHJpbWl0aXZlX2NvbXB1dGVfYm94LCBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZSB9IGZyb20gJy4vcHJpbWl0aXZlJztcbmltcG9ydCB7IEJ5dGVUeXBlLCBGbG9hdFR5cGUsIEhhbGZGbG9hdFR5cGUsIEludFR5cGUsIFNob3J0VHlwZSwgVW5zaWduZWRCeXRlVHlwZSwgVW5zaWduZWRJbnRUeXBlLCBVbnNpZ25lZFNob3J0VHlwZSwgV2ViR0xCdWZmZXJVc2FnZSwgV2ViR0xEYXRhVHlwZSB9IGZyb20gJy4vdHlwZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2ViR0xEcmF3RGVzY3JpcHRvciB7XG4gICAgcHJpbWl0aXZlOiBQcmltaXRpdmU7XG5cbiAgICB1bmlmb3JtczogU3RyaW5nTWFwPFVuaWZvcm1WYWx1ZT47XG4gICAgdHlwZTogUHJpbWl0aXZlVHlwZTtcbiAgICByYW5nZTogSW5kZXhSYW5nZTtcblxuICAgIC8vIGluc3RhbmNpbmdcbiAgICBpbnN0YW5jZV9hdHRyaWJ1dGVzPzogQXR0cmlidXRlW107XG4gICAgZm9yY2VfdXBkYXRlOiBTZXQ8c3RyaW5nPjtcblxuICAgIHN0b3JhZ2VfbW9kZTogR1BVU3RvcmFnZU1vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2ViR0xEcmF3IHtcbiAgICBwcmltaXRpdmU6IFByaW1pdGl2ZTtcblxuICAgIHdlYmdsX3ZhbzogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdDtcbiAgICBhdHRyaWJ1dGVzOiBHTEF0dHJpYnV0ZVtdO1xuICAgIGF0dHJpYnV0ZV9tYXA6IFN0cmluZ01hcDxHTEF0dHJpYnV0ZT47XG4gICAgYm94OiBCb3gzO1xuICAgIGluZGV4X2J1ZmZlcjogV2ViR0xCdWZmZXIgfCBudWxsO1xuICAgIGluZGV4ZWQ6IGJvb2xlYW47XG4gICAgdHlwZTogUHJpbWl0aXZlVHlwZTtcblxuICAgIHJhbmdlOiBJbmRleFJhbmdlO1xuICAgIG1heF92ZXJ0ZXhfY291bnQ6IG51bWJlcjtcblxuICAgIHVuaWZvcm1zOiBTdHJpbmdNYXA8VW5pZm9ybVZhbHVlPjtcbiAgICBmb3JjZV91cGRhdGU6IFNldDxzdHJpbmc+O1xuXG4gICAgc3RvcmFnZV9tb2RlOiBHUFVTdG9yYWdlTW9kZTtcbn1cblxuY29uc3QgZGVmYXVsdF9hdHRyaWJ1dGVfc2xvdDogU3RyaW5nTWFwPG51bWJlcj4gPSB7XG4gICAgcG9zaXRpb246IDAsXG4gICAgdXY6IDEsXG4gICAgbm9ybWFsOiAyLFxuICAgIHRhbmdlbnQ6IDMsXG4gICAgY29sb3I6IDQsXG4gICAgc2tpbjogNSxcbiAgICB3ZWlnaHQ6IDYsXG4gICAgdXYyOiA3LFxufTtcbmNvbnN0IGRlZmF1bHRfbWF4X3Nsb3QgPSA0O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2dsX2J1ZmZlcl90eXBlKGJ1ZmZlcjogVHlwZWRBcnJheSk6IFdlYkdMRGF0YVR5cGUge1xuICAgIGlmIChidWZmZXIgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0VHlwZTtcbiAgICB9IGVsc2UgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEludDE2QXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIFNob3J0VHlwZTtcbiAgICB9IGVsc2UgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEludDMyQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEludFR5cGU7XG4gICAgfSBlbHNlIGlmIChidWZmZXIgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEJ5dGVUeXBlO1xuICAgIH0gZWxzZSBpZiAoYnVmZmVyIGluc3RhbmNlb2YgVWludDE2QXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIFVuc2lnbmVkU2hvcnRUeXBlO1xuICAgIH0gZWxzZSBpZiAoYnVmZmVyIGluc3RhbmNlb2YgVWludDMyQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIFVuc2lnbmVkSW50VHlwZTtcbiAgICB9IGVsc2UgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIFVuc2lnbmVkQnl0ZVR5cGU7XG4gICAgfVxuICAgIHRocm93IGBpbnZhbGlkIGJ1ZmZlciB0eXBlICR7dHlwZW9mIGJ1ZmZlcn0uYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZV9kcmF3KGRlc2NyaXB0b3I6IFBhcnRpYWw8V2ViR0xEcmF3RGVzY3JpcHRvcj4pOiBXZWJHTERyYXcge1xuICAgIGxldCB3ZWJnbF92YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3Q7XG4gICAgbGV0IGluZGV4ZWQgPSBmYWxzZTtcbiAgICBsZXQgbWF4X3ZlcnRleF9jb3VudCA9IDA7XG4gICAgbGV0IGR5bmFtaWMgPSBmYWxzZTtcbiAgICBjb25zdCBlbmNvZGVyID0gZ2Z4X2RldmljZV9nZXQoKS5lbmNvZGVyIGFzIFdlYkdMRW5jb2RlcjtcbiAgICBjb25zdCBnbCA9IGVuY29kZXIuZ2w7XG5cbiAgICBjb25zdCBwcmltaXRpdmUgPSBkZXNjcmlwdG9yLnByaW1pdGl2ZTtcbiAgICBpZiAoIXByaW1pdGl2ZSkgdGhyb3cgJ0ZhdGFsIGVycm9yLCBjcmVhdGUgZHJhdyB3aXRob3V0IHByaW1pdGl2ZSc7XG5cbiAgICBjb25zdCB0eXBlID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLnR5cGUsIDQpO1xuICAgIGNvbnN0IHVuaWZvcm1zID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLnVuaWZvcm1zLCB7fSk7XG4gICAgY29uc3QgZm9yY2VfdXBkYXRlID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLmZvcmNlX3VwZGF0ZSwgbmV3IFNldCgpKTtcbiAgICBjb25zdCBzdG9yYWdlX21vZGUgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3Iuc3RvcmFnZV9tb2RlLCBHUFVTdG9yYWdlTW9kZS5HUFVPbmx5KTtcblxuICAgIGNvbnN0IGJveCA9IHByaW1pdGl2ZV9jb21wdXRlX2JveChwcmltaXRpdmUpO1xuICAgIGlmIChwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsICd0YW5nZW50JykpIFRhbmdlbnRHZW5lcmF0b3IuZ2VuZXJhdGUocHJpbWl0aXZlKTtcblxuICAgIHdlYmdsX3ZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCkhO1xuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh3ZWJnbF92YW8pO1xuXG4gICAgY29uc3QgYXR0cmlidXRlX21hcDogU3RyaW5nTWFwPEdMQXR0cmlidXRlPiA9IHt9O1xuICAgIGNvbnN0IGF0dHJpYnV0ZXM6IEdMQXR0cmlidXRlW10gPSBbXTtcbiAgICBsZXQgbWF4X3ZlcnRleF9zbG90ID0gZGVmYXVsdF9tYXhfc2xvdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByaW1pdGl2ZS5hdHRyaWJ1dGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGF0dHIgPSBwcmltaXRpdmUuYXR0cmlidXRlc1tpXTtcbiAgICAgICAgaWYgKGF0dHIubmFtZSA9PT0gJ2dlbmVyaWMnKSBjb250aW51ZTtcblxuICAgICAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgaWYgKGJ1ZmZlciA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdXZWJHTCBCdWZmZXIgQ3JlYXRlIEZhaWxlZC4nKTtcblxuICAgICAgICBsZXQgdXNhZ2U6IFdlYkdMQnVmZmVyVXNhZ2UgPSBnbC5TVEFUSUNfRFJBVztcbiAgICAgICAgaWYgKGF0dHIuZHluYW1pYykge1xuICAgICAgICAgICAgdXNhZ2UgPSBnbC5EWU5BTUlDX0RSQVc7XG4gICAgICAgICAgICBkeW5hbWljID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gZ2V0X2dsX2J1ZmZlcl90eXBlKGF0dHIuYnVmZmVyKTtcbiAgICAgICAgY29uc3Qgc3RyaWRlID0gYXR0ci5zdHJpZGU7XG5cbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBhdHRyLmJ1ZmZlciwgdXNhZ2UpO1xuXG4gICAgICAgIGxldCBzbG90ID0gYXR0ci5zbG90ICE9PSB1bmRlZmluZWQgPyBhdHRyLnNsb3QgOiBkZWZhdWx0X2F0dHJpYnV0ZV9zbG90W2F0dHIubmFtZSB8fCAncG9zaXRpb24nXTtcbiAgICAgICAgc2xvdCA9IHNsb3QgIT09IHVuZGVmaW5lZCA/IHNsb3QgOiBtYXhfdmVydGV4X3Nsb3QrKztcblxuICAgICAgICBpZiAodHlwZSA9PT0gRmxvYXRUeXBlIHx8IHR5cGUgPT09IEhhbGZGbG9hdFR5cGUpIHtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2xvdCBhcyBudW1iZXIsIGF0dHIuc3RyaWRlLCB0eXBlLCBmYWxzZSwgMCwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJJUG9pbnRlcihzbG90IGFzIG51bWJlciwgYXR0ci5zdHJpZGUsIHR5cGUsIDAsIDApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHtcbiAgICAgICAgICAgIHN0cmlkZSxcbiAgICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgICAgIG5hbWU6IGF0dHIubmFtZSB8fCAncG9zaXRpb24nLFxuICAgICAgICAgICAgZHluYW1pYyxcbiAgICAgICAgICAgIHNvdXJjZV9idWZmZXI6IGR5bmFtaWMgPyBhdHRyLmJ1ZmZlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgfSBhcyBHTEF0dHJpYnV0ZTtcbiAgICAgICAgYXR0cmlidXRlcy5wdXNoKGF0dHJpYnV0ZSk7XG4gICAgICAgIGF0dHJpYnV0ZV9tYXBbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlO1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzbG90IGFzIG51bWJlcik7XG4gICAgICAgIGlmIChhdHRyLm5hbWUgPT09ICdwb3NpdGlvbicpIHtcbiAgICAgICAgICAgIG1heF92ZXJ0ZXhfY291bnQgPSBhdHRyLmJ1ZmZlci5sZW5ndGggLyBzdHJpZGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgaW5kZXhfYnVmZmVyOiBXZWJHTEJ1ZmZlciB8IG51bGwgPSBudWxsO1xuICAgIGlmIChwcmltaXRpdmUuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpbmRleF9idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhfYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgcHJpbWl0aXZlLmluZGV4LCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIG1heF92ZXJ0ZXhfY291bnQgPSBwcmltaXRpdmUuaW5kZXgubGVuZ3RoO1xuICAgICAgICBpbmRleGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCByYW5nZSA9IGRlZmF1bHRfdmFsdWUoZGVzY3JpcHRvci5yYW5nZSwgeyBzdGFydDogMCwgY291bnQ6IG1heF92ZXJ0ZXhfY291bnQgfSk7XG5cbiAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgd2ViZ2xfdmFvLFxuICAgICAgICBpbmRleGVkLFxuICAgICAgICBtYXhfdmVydGV4X2NvdW50LFxuICAgICAgICBwcmltaXRpdmUsXG4gICAgICAgIGJveCxcbiAgICAgICAgYXR0cmlidXRlcyxcbiAgICAgICAgYXR0cmlidXRlX21hcCxcbiAgICAgICAgaW5kZXhfYnVmZmVyLFxuXG4gICAgICAgIHR5cGUsXG4gICAgICAgIHJhbmdlLFxuXG4gICAgICAgIHVuaWZvcm1zLFxuICAgICAgICBmb3JjZV91cGRhdGUsXG4gICAgICAgIHN0b3JhZ2VfbW9kZSxcbiAgICB9IGFzIFdlYkdMRHJhdzsgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVfZHJhdyhkcmF3OiBXZWJHTERyYXcsIHByaW1pdGl2ZTogUHJpbWl0aXZlKTogdm9pZCB7XG4gICAgY29uc3QgZW5jb2RlciA9IGdmeF9kZXZpY2VfZ2V0KCkuZW5jb2RlciBhcyBXZWJHTEVuY29kZXI7XG4gICAgY29uc3QgZ2wgPSBlbmNvZGVyLmdsO1xuXG4gICAgbGV0IG1heF92ZXJ0ZXhfY291bnQgPSAwO1xuICAgIGlmICghZHJhdy5hdHRyaWJ1dGVfbWFwIHx8ICFkcmF3LmF0dHJpYnV0ZXMpIHJldHVybjtcblxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShkcmF3LndlYmdsX3ZhbyEpO1xuXG4gICAgbGV0IG1heF92ZXJ0ZXhfc2xvdCA9IGRlZmF1bHRfbWF4X3Nsb3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmltaXRpdmUuYXR0cmlidXRlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBhdHRyID0gcHJpbWl0aXZlLmF0dHJpYnV0ZXNbaV07XG4gICAgICAgIGNvbnN0IGdsX2F0dHIgPSBkcmF3LmF0dHJpYnV0ZV9tYXBbYXR0ci5uYW1lIHx8ICdwb3NpdGlvbiddO1xuXG4gICAgICAgIGlmICghZ2xfYXR0cikgY29udGludWU7XG5cbiAgICAgICAgY29uc3QgdXNhZ2UgPSBhdHRyLmR5bmFtaWMgPT09IHRydWUgPyBnbC5TVFJFQU1fRFJBVyA6IGdsLlNUQVRJQ19EUkFXO1xuICAgICAgICBjb25zdCB0eXBlID0gZ2V0X2dsX2J1ZmZlcl90eXBlKGF0dHIuYnVmZmVyKTtcblxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgZ2xfYXR0ci5idWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgYXR0ci5idWZmZXIsIHVzYWdlKTtcblxuICAgICAgICBsZXQgc2xvdCA9IGF0dHIuc2xvdCAhPT0gdW5kZWZpbmVkID8gYXR0ci5zbG90IDogZGVmYXVsdF9hdHRyaWJ1dGVfc2xvdFthdHRyLm5hbWUgfHwgJ3Bvc2l0aW9uJ107XG4gICAgICAgIHNsb3QgPSBzbG90ICE9PSB1bmRlZmluZWQgPyBzbG90IDogbWF4X3ZlcnRleF9zbG90Kys7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IEZsb2F0VHlwZSB8fCB0eXBlID09PSBIYWxmRmxvYXRUeXBlKSB7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNsb3QgYXMgbnVtYmVyLCBhdHRyLnN0cmlkZSwgdHlwZSwgZmFsc2UsIDAsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliSVBvaW50ZXIoc2xvdCBhcyBudW1iZXIsIGF0dHIuc3RyaWRlLCB0eXBlLCAwLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNsb3QgYXMgbnVtYmVyKTtcblxuICAgICAgICBpZiAoYXR0ci5uYW1lID09PSAncG9zaXRpb24nKSB7XG4gICAgICAgICAgICBtYXhfdmVydGV4X2NvdW50ID0gYXR0ci5idWZmZXIubGVuZ3RoIC8gYXR0ci5zdHJpZGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJpbWl0aXZlLmluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgZHJhdy5pbmRleF9idWZmZXIpO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBwcmltaXRpdmUuaW5kZXgsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgbWF4X3ZlcnRleF9jb3VudCA9IHByaW1pdGl2ZS5pbmRleC5sZW5ndGg7XG4gICAgICAgIGRyYXcuaW5kZXhlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xuICAgIGRyYXcubWF4X3ZlcnRleF9jb3VudCA9IG1heF92ZXJ0ZXhfY291bnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3X3VwZGF0ZShkcmF3OiBXZWJHTERyYXcpOiB2b2lkIHtcbiAgICBjb25zdCBlbmNvZGVyID0gZ2Z4X2RldmljZV9nZXQoKS5lbmNvZGVyIGFzIFdlYkdMRW5jb2RlcjtcbiAgICBjb25zdCBnbCA9IGVuY29kZXIuZ2w7XG5cbiAgICBpZiAoIWRyYXcuYXR0cmlidXRlX21hcCB8fCAhZHJhdy5hdHRyaWJ1dGVzKSByZXR1cm47XG5cbiAgICBnbC5iaW5kVmVydGV4QXJyYXkoZHJhdy53ZWJnbF92YW8hKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRyYXcuYXR0cmlidXRlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBhdHRyID0gZHJhdy5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICBpZiAoIWF0dHIuZHluYW1pYykgY29udGludWU7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBhdHRyLmJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2wuQVJSQVlfQlVGRkVSLCAwLCBhdHRyLnNvdXJjZV9idWZmZXIhLCAwLCBhdHRyLnVwZGF0ZV9sZW5ndGggPz8gYXR0ciEuc291cmNlX2J1ZmZlciEubGVuZ3RoKTtcbiAgICB9XG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd19kZXN0cm95KGRyYXc6IFdlYkdMRHJhdyk6IHZvaWQge1xuICAgIGNvbnN0IGVuY29kZXIgPSBnZnhfZGV2aWNlX2dldCgpLmVuY29kZXIgYXMgV2ViR0xFbmNvZGVyO1xuICAgIGNvbnN0IGdsID0gZW5jb2Rlci5nbDtcblxuICAgIGlmICghZHJhdy5hdHRyaWJ1dGVzKSByZXR1cm47XG4gICAgZ2wuZGVsZXRlVmVydGV4QXJyYXkoZHJhdy53ZWJnbF92YW8hKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRyYXcuYXR0cmlidXRlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBhdHRyID0gZHJhdy5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICBnbC5kZWxldGVCdWZmZXIoYXR0ci5idWZmZXIpO1xuICAgIH1cbiAgICBpZiAoZHJhdy5pbmRleF9idWZmZXIpIHtcbiAgICAgICAgZ2wuZGVsZXRlQnVmZmVyKGRyYXcuaW5kZXhfYnVmZmVyKTtcbiAgICB9XG59XG4iLCAiY29uc3QgZXh0ZW5zaW9ucyA9IHt9IGFzIGFueTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldF9leHRlbnNpb248VCBleHRlbmRzIGFueT4oZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIG5hbWU6IHN0cmluZyk6IFQgfCBudWxsIHtcbiAgICBpZiAoZXh0ZW5zaW9uc1tuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBleHRlbnNpb25zW25hbWVdO1xuICAgIH1cblxuICAgIGxldCBleHRlbnNpb247XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgIGNhc2UgJ1dFQkdMX2RlcHRoX3RleHR1cmUnOlxuICAgICAgICAgICAgZXh0ZW5zaW9uID0gZ2wuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJykgfHwgZ2wuZ2V0RXh0ZW5zaW9uKCdNT1pfV0VCR0xfZGVwdGhfdGV4dHVyZScpIHx8IGdsLmdldEV4dGVuc2lvbignV0VCS0lUX1dFQkdMX2RlcHRoX3RleHR1cmUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnOlxuICAgICAgICAgICAgZXh0ZW5zaW9uID0gZ2wuZ2V0RXh0ZW5zaW9uKCdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnKSB8fCBnbC5nZXRFeHRlbnNpb24oJ01PWl9FWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnKSB8fCBnbC5nZXRFeHRlbnNpb24oJ1dFQktJVF9FWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0Yyc6XG4gICAgICAgICAgICBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJykgfHwgZ2wuZ2V0RXh0ZW5zaW9uKCdNT1pfV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGMnKSB8fCBnbC5nZXRFeHRlbnNpb24oJ1dFQktJVF9XRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9wdnJ0Yyc6XG4gICAgICAgICAgICBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9wdnJ0YycpIHx8IGdsLmdldEV4dGVuc2lvbignV0VCS0lUX1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9wdnJ0YycpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24obmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKGV4dGVuc2lvbiA9PT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgPFdlYkdMRXh0ZW5zaW9uPiBFeHRlbnNpb246ICR7bmFtZX0gbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgPFdlYkdMRXh0ZW5zaW9uPiBFeHRlbnNpb246ICR7bmFtZX0gZm91bmQuYCk7XG4gICAgfVxuICAgIGV4dGVuc2lvbnNbbmFtZV0gPSBleHRlbnNpb247XG4gICAgcmV0dXJuIGV4dGVuc2lvbjtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY291bnRfZGVjaW1hbF9iaXQobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBsZXQgYyA9IDE7XG4gICAgd2hpbGUgKE1hdGguYWJzKG4pID49IDEwKSB7XG4gICAgICAgIG4gLz0gMTA7XG4gICAgICAgIGMrKztcbiAgICB9XG4gICAgcmV0dXJuIGM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVfdWludDE2X3RvX3VpbnQzMihhOiBudW1iZXIsIGI6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuICgoYSAmIDB4ZmZmZikgPDwgMTYpIHwgKGIgJiAweGZmZmYpO1xufVxuIiwgImltcG9ydCB7IFdlYkdMVGV4dHVyZUhhbmRsZSB9IGZyb20gJy4vdGV4dHVyZSc7XG5cbmxldCB3ZWJnbF90ZXh0dXJlX3Nsb3RfaW5kZXggPSAwO1xuY29uc3Qgd2ViZ2xfdGV4dHVyZV9zbG90X2NhY2hlID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHdlYmdsX3RleHR1cmVfc2xvdF9yZXNldCgpIHtcbiAgICB3ZWJnbF90ZXh0dXJlX3Nsb3RfaW5kZXggPSAwO1xuICAgIHdlYmdsX3RleHR1cmVfc2xvdF9jYWNoZS5jbGVhcigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2ViZ2xfdGV4dHVyZV9zbG90X3JlcXVlc3QodGV4dHVyZTogV2ViR0xUZXh0dXJlSGFuZGxlKTogbnVtYmVyIHtcbiAgICBjb25zdCBpZCA9IHRleHR1cmUuaWQ7XG4gICAgaWYgKHdlYmdsX3RleHR1cmVfc2xvdF9jYWNoZS5oYXMoaWQpKSB7XG4gICAgICAgIHJldHVybiB3ZWJnbF90ZXh0dXJlX3Nsb3RfY2FjaGUuZ2V0KGlkKSE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2xvdCA9IHdlYmdsX3RleHR1cmVfc2xvdF9pbmRleCsrO1xuICAgICAgICB3ZWJnbF90ZXh0dXJlX3Nsb3RfY2FjaGUuc2V0KGlkLCBzbG90KTtcbiAgICAgICAgcmV0dXJuIHNsb3Q7XG4gICAgfVxufSIsICJpbXBvcnQgeyBnZnhfZGV2aWNlX2dldCwgZ2Z4X2VuY29kZXJfZ2V0LCBHTCB9IGZyb20gJy4uL2dmeCc7XG5pbXBvcnQgeyBDb2xvclJHQkEgfSBmcm9tICcuLi9tYXRoL2NvbG9yJztcbmltcG9ydCB7IEZsb2F0MiwgRmxvYXQzLCBGbG9hdDQgfSBmcm9tICcuLi9tYXRoL3NpbWQnO1xuaW1wb3J0IHsgTWF0MywgTWF0NCB9IGZyb20gJy4uL21hdGgvc2ltZF9tYXQnO1xuaW1wb3J0IHsgY291bnRfZGVjaW1hbF9iaXQgfSBmcm9tICcuLi9zdGQvbnVtZXJpYyc7XG5pbXBvcnQgeyBkZWZhdWx0X3ZhbHVlLCBTdHJpbmdNYXAgfSBmcm9tICcuLi9zdGQvdHlwZSc7XG5pbXBvcnQgeyBjcmVhdGVfYmxvY2ssIFJlbmRlckJsb2NrLCBSZW5kZXJCbG9ja05hbWUsIFJlbmRlckJsb2NrVHlwZSB9IGZyb20gJy4vYmxvY2snO1xuaW1wb3J0IHsgV2ViR0xFbmNvZGVyIH0gZnJvbSAnLi9lbmNvZGVyJztcbmltcG9ydCB7IFdlYkdMVGV4dHVyZUhhbmRsZSB9IGZyb20gJy4vdGV4dHVyZSc7XG5pbXBvcnQgeyB3ZWJnbF90ZXh0dXJlX3Nsb3RfcmVxdWVzdCB9IGZyb20gJy4vdGV4dHVyZV9zbG90JztcblxubGV0IF9waXBlbGluZV9pZCA9IDA7XG5mdW5jdGlvbiBnZXRfcGlwZWxpbmVfaWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gX3BpcGVsaW5lX2lkKys7XG59XG5cbmV4cG9ydCB0eXBlIFVuaWZvcm1WYWx1ZSA9IHVuZGVmaW5lZCB8IG51bWJlciB8IEZsb2F0MiB8IEZsb2F0MyB8IEZsb2F0NCB8IE1hdDMgfCBNYXQ0IHwgRmxvYXQzMkFycmF5IHwgV2ViR0xUZXh0dXJlSGFuZGxlO1xuXG5leHBvcnQgaW50ZXJmYWNlIFVuaWZvcm1EZXNjcmlwdG9yIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdHlwZTogVW5pZm9ybVR5cGU7XG4gICAgZGVmYXVsdF92YWx1ZT86IFVuaWZvcm1WYWx1ZTtcbiAgICB2aXNpYmxlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVbmlmb3JtIGV4dGVuZHMgVW5pZm9ybURlc2NyaXB0b3Ige1xuICAgIHNsb3Q/OiBudW1iZXI7XG4gICAgdXBsb2FkOiBGdW5jdGlvbjtcbiAgICBnbF9idWZmZXI/OiBXZWJHTEJ1ZmZlcjtcbiAgICBidWZmZXI/OiBGbG9hdDMyQXJyYXk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RydWN0VW5pZm9ybSBleHRlbmRzIFVuaWZvcm0ge1xuICAgIHN0cnVjdF9pbmRleDogbnVtYmVyO1xuICAgIHN0cnVjdF9zaXplOiBudW1iZXI7XG4gICAgaXRlbXM6IFN0cmluZ01hcDxTdHJ1Y3RVbmlmb3JtSXRlbT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RydWN0VW5pZm9ybUl0ZW0ge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0eXBlOiBVbmlmb3JtVHlwZTtcbiAgICBkZWZhdWx0X3ZhbHVlPzogVW5pZm9ybVZhbHVlO1xuICAgIGJ5dGVfb2Zmc2V0OiBudW1iZXI7XG4gICAgYnl0ZV9zaXplOiBudW1iZXI7XG59XG5cbmV4cG9ydCB0eXBlIFVuaWZvcm1CbG9jayA9IFN0cmluZ01hcDxVbmlmb3JtPjtcblxuZXhwb3J0IGludGVyZmFjZSBQaXBlbGluZSB7XG4gICAgaWQ6IG51bWJlcjtcbiAgICB2YWxpZDogYm9vbGVhbjtcbiAgICBuYW1lOiBzdHJpbmc7XG5cbiAgICBwcm9ncmFtOiBXZWJHTFByb2dyYW07XG4gICAgdmVydGV4X3NoYWRlcjogc3RyaW5nO1xuICAgIGZyYWdtZW50X3NoYWRlcjogc3RyaW5nO1xuXG4gICAgdW5pZm9ybV9ibG9jazogVW5pZm9ybUJsb2NrO1xuICAgIHVuaWZvcm1zOiBVbmlmb3JtW107XG5cbiAgICBjdWxsX21vZGU6IEN1bGxNb2RlO1xuICAgIGRlcHRoX2NvbXBhcmVfZnVuYzogRGVwdGhDb21wYXJlRnVuYztcbiAgICBkZXB0aF93cml0ZTogYm9vbGVhbjtcbiAgICBibGVuZDogQmxlbmREZXNjcmlwdG9yO1xuICAgIHZlcnRleF9vcmRlcjogVmVydGV4T3JkZXI7XG5cbiAgICBmcmFtZV9ibG9jaz86IFJlbmRlckJsb2NrO1xufVxuXG5leHBvcnQgZW51bSBQcmltaXRpdmVUeXBlIHtcbiAgICBQb2ludHMgPSAwLFxuICAgIExpbmVzID0gMSxcbiAgICBMaW5lTG9vcCA9IDIsXG4gICAgTGluZVN0cmlwID0gMyxcbiAgICBUcmlhbmdsZXMgPSA0LFxuICAgIFRyaWFuZ2xlU3RyaXAgPSA1LFxuICAgIFRyaWFuZ2xlRmFuID0gNixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHUFVQaXBlbGluZURlc2NyaXB0b3Ige1xuICAgIG5hbWU/OiBzdHJpbmc7XG5cbiAgICBkZWZpbmVzPzogc3RyaW5nW107XG4gICAgdmVydGV4X3NoYWRlcj86IHN0cmluZztcbiAgICBmcmFnbWVudF9zaGFkZXI/OiBzdHJpbmc7XG4gICAgY29tYmluZWRfc2hhZGVyPzogc3RyaW5nO1xuXG4gICAgbGlicmFyaWVzPzogU3RyaW5nTWFwPHN0cmluZz47XG5cbiAgICBwcmltaXRpdmVfdHlwZT86IFByaW1pdGl2ZVR5cGU7XG4gICAgdW5pZm9ybXM/OiBVbmlmb3JtRGVzY3JpcHRvcltdO1xuICAgIGN1bGxfbW9kZTogQ3VsbE1vZGU7XG4gICAgZGVwdGhfY29tcGFyZV9mdW5jOiBEZXB0aENvbXBhcmVGdW5jO1xuICAgIGRlcHRoX3dyaXRlOiBib29sZWFuO1xuICAgIGJsZW5kOiBQYXJ0aWFsPEJsZW5kRGVzY3JpcHRvcj47XG4gICAgdmVydGV4X29yZGVyOiBWZXJ0ZXhPcmRlcjtcbn1cblxuZXhwb3J0IGVudW0gVW5pZm9ybVR5cGUge1xuICAgIEJvb2wsXG4gICAgRmxvYXQsXG4gICAgRmxvYXQyLFxuICAgIEZsb2F0MyxcbiAgICBGbG9hdDQsXG4gICAgVW5zaWduZWRJbnRlZ2VyLFxuICAgIEludGVnZXIsXG4gICAgQ29sb3JSR0JBLFxuICAgIE1hdDMsXG4gICAgTWF0NCxcbiAgICBUZXh0dXJlMkQsXG4gICAgVGV4dHVyZUN1YmUsXG4gICAgVGV4dHVyZTJEQXJyYXksXG4gICAgVGV4dHVyZTNELFxuICAgIFN0cnVjdCxcbn1cblxuZXhwb3J0IGVudW0gQ3VsbE1vZGUge1xuICAgIE5vbmUsXG4gICAgRnJvbnQgPSAxMDI4LFxuICAgIEJhY2sgPSAxMDI5LFxufVxuXG5leHBvcnQgZW51bSBEZXB0aENvbXBhcmVGdW5jIHtcbiAgICBOZXZlcixcbiAgICBMZXNzID0gNTEyLFxuICAgIEVxdWFsID0gNTE0LFxuICAgIExlc3NFcXVhbCA9IDUxNSxcbiAgICBHcmVhdGVyID0gNTE2LFxuICAgIE5vdEVxdWFsID0gNTE3LFxuICAgIEdyZWF0ZXJFcXVhbCA9IDUxOCxcbiAgICBBbHdheXMgPSA1MTksXG59XG5cbmV4cG9ydCBlbnVtIEJsZW5kRmFjdG9yIHtcbiAgICBTcmNBbHBoYSA9IDc3MCxcbiAgICBTcmNDb2xvciA9IDc2OCxcbiAgICBEc3RBbHBoYSA9IDc3MixcbiAgICBEc3RDb2xvciA9IDc3NCxcbiAgICBPbmUgPSAxLFxuICAgIFplcm8gPSAwLFxuICAgIE9uZU1pbnVzU3JjQWxwaGEgPSA3NzEsXG4gICAgT25lTWludXNTcmNDb2xvciA9IDc2OSxcbiAgICBPbmVNaW51c0RzdEFscGhhID0gNzczLFxuICAgIE9uZU1pbnVzRHN0Q29sb3IgPSA3NzUsXG4gICAgT25lTWludXNDb25zdEFscGhhID0gMzI3NzIsXG4gICAgT25lTWludXNDb25zdENvbG9yID0gMzI3NzAsXG4gICAgQ29uc3RDb2xvciA9IDMyNzY5LFxuICAgIENvbnN0QWxwaGEgPSAzMjc3MSxcbiAgICBTcmNBbHBoYVNhdHVyYXRlID0gNzc2LFxufVxuXG5leHBvcnQgZW51bSBCbGVuZEZ1bmMge1xuICAgIEFkZCA9IDMyNzc0LFxuICAgIFN1YnRyYWN0ID0gMzI3NzgsXG4gICAgUmV2ZXJzZVN1YnRyYWN0ID0gMzI3NzksXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmxlbmREZXNjcmlwdG9yIHtcbiAgICBlbmFibGVkOiBib29sZWFuO1xuICAgIHNyY19jb2xvcl9mYWN0b3I6IEJsZW5kRmFjdG9yO1xuICAgIHNyY19hbHBoYV9mYWN0b3I6IEJsZW5kRmFjdG9yO1xuICAgIGRzdF9jb2xvcl9mYWN0b3I6IEJsZW5kRmFjdG9yO1xuICAgIGRzdF9hbHBoYV9mYWN0b3I6IEJsZW5kRmFjdG9yO1xuICAgIGNvbG9yX2Z1bmM6IEJsZW5kRnVuYztcbiAgICBhbHBoYV9mdW5jOiBCbGVuZEZ1bmM7XG4gICAgY29sb3I6IENvbG9yUkdCQTtcbn1cblxuZXhwb3J0IGVudW0gVmVydGV4T3JkZXIge1xuICAgIENsb2NrV2lzZSA9IDIzMDQsXG4gICAgQ291bnRlckNsb2NrV2lzZSA9IDIzMDUsXG59XG5cbmNvbnN0IHZlcnNpb24gPSAnI3ZlcnNpb24gMzAwIGVzXFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbic7XG5cbmNvbnN0IHZlcnNpb25fcmVnID0gLyN2ZXJzaW9uLztcbmNvbnN0IHNraXBfaW50ZXJuYWxfcHJlY2lzaW9uX2RlZmluZSA9IC8jZGVmaW5lIHNraXBfZ2xvYmFsX3ByZWNpc2lvbi87XG5jb25zdCB1c2FtcGxlcl9yZWcgPSAvdW5pZm9ybSB1c2FtcGxlcjJELztcbmNvbnN0IHNhbXBsZXJfMmRfcmVnID0gL3VuaWZvcm0gc2FtcGxlcjJELztcbmNvbnN0IHNhbXBsZXJfMmRfc2hhZG93X3JlZyA9IC91bmlmb3JtIHNhbXBsZXIyRFNoYWRvdy87XG5jb25zdCBzYW1wbGVyX2N1YmVfcmVnID0gL3VuaWZvcm0gc2FtcGxlckN1YmUvO1xuY29uc3QgaW5jbHVkZV9yZWcgPSAvI3ByYWdtYSBpbmNsdWRlIChbQS16XXsxfVtBLXowLTldKykvZztcblxuZnVuY3Rpb24gcHJlY2lzaW9uX2RlY2xhcmF0aW9uKHNvdXJjZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgb3V0cHV0ID0gJyc7XG4gICAgaWYgKHNvdXJjZS5zZWFyY2goc2tpcF9pbnRlcm5hbF9wcmVjaXNpb25fZGVmaW5lKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgaWYgKHNvdXJjZS5zZWFyY2godXNhbXBsZXJfcmVnKSA+IC0xKSB7XG4gICAgICAgIG91dHB1dCArPSAncHJlY2lzaW9uIGhpZ2hwIHVzYW1wbGVyMkQ7XFxuJztcbiAgICB9XG4gICAgaWYgKHNvdXJjZS5zZWFyY2goc2FtcGxlcl8yZF9yZWcpID4gLTEpIHtcbiAgICAgICAgb3V0cHV0ICs9ICdwcmVjaXNpb24gaGlnaHAgc2FtcGxlcjJEO1xcbic7XG4gICAgfVxuICAgIGlmIChzb3VyY2Uuc2VhcmNoKHNhbXBsZXJfMmRfc2hhZG93X3JlZykgPiAtMSkge1xuICAgICAgICBvdXRwdXQgKz0gJ3ByZWNpc2lvbiBoaWdocCBzYW1wbGVyMkRTaGFkb3c7XFxuJztcbiAgICB9XG4gICAgaWYgKHNvdXJjZS5zZWFyY2goc2FtcGxlcl9jdWJlX3JlZykgPiAtMSkge1xuICAgICAgICBvdXRwdXQgKz0gJ3ByZWNpc2lvbiBoaWdocCBzYW1wbGVyQ3ViZTtcXG4nO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufVxuXG5mdW5jdGlvbiBwYXJzZV9pbmNsdWRlKHNvdXJjZTogc3RyaW5nLCBsaWJyYXJpZXM6IFN0cmluZ01hcDxzdHJpbmc+KTogc3RyaW5nIHtcbiAgICBsZXQgbWF0Y2hlcztcbiAgICBjb25zdCByZXBsYWNlcnM6IEFycmF5PHsgYmxvY2s6IHN0cmluZzsgbGliOiBzdHJpbmcgfT4gPSBbXTtcbiAgICB3aGlsZSAoKG1hdGNoZXMgPSBpbmNsdWRlX3JlZy5leGVjKHNvdXJjZSkpICE9IG51bGwpIHtcbiAgICAgICAgcmVwbGFjZXJzLnB1c2goeyBibG9jazogbWF0Y2hlc1swXSwgbGliOiBtYXRjaGVzWzFdIH0pO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcmVwbGFjZXIgb2YgcmVwbGFjZXJzKSB7XG4gICAgICAgIGNvbnN0IGxpYnJhcnkgPSBsaWJyYXJpZXNbcmVwbGFjZXIubGliXSA/PyBgLy8gbW9kdWxlIG5vdCBmb3VuZCAke3JlcGxhY2VyLmxpYn1gO1xuICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShyZXBsYWNlci5ibG9jaywgbGlicmFyeSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNvdXJjZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZV9waXBlbGluZShkZXNjcmlwdG9yOiBQYXJ0aWFsPEdQVVBpcGVsaW5lRGVzY3JpcHRvcj4pOiBQaXBlbGluZSB8IG51bGwge1xuICAgIC8vIGNvbnNvbGUubG9nKGBjcmVhdGUgcGlwZWxpbmUgJHtjb21wbGV0ZURlc2MubmFtZX1gKTtcbiAgICBjb25zdCBnbCA9IGdmeF9lbmNvZGVyX2dldDxXZWJHTEVuY29kZXI+KCkuZ2w7XG5cbiAgICBsZXQgdmVydGV4X3NoYWRlciA9IGRlZmF1bHRfdmFsdWUoZGVzY3JpcHRvci52ZXJ0ZXhfc2hhZGVyLCAnJyk7XG4gICAgbGV0IGZyYWdtZW50X3NoYWRlciA9IGRlZmF1bHRfdmFsdWUoZGVzY3JpcHRvci5mcmFnbWVudF9zaGFkZXIsICcnKTtcbiAgICBsZXQgbGlicmFyaWVzID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLmxpYnJhcmllcywge30pO1xuICAgIGxldCBuYW1lID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLm5hbWUsICd1bm5hbWVkIHBpcGVsaW5lJyk7XG4gICAgY29uc29sZS5sb2coYGNyZWF0ZSBwaXBlbGluZSAke25hbWV9YCk7XG5cbiAgICBsZXQgYmxlbmQgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IuYmxlbmQsIHt9KSBhcyBCbGVuZERlc2NyaXB0b3I7XG4gICAgYmxlbmQuZW5hYmxlZCA9IGRlZmF1bHRfdmFsdWUoYmxlbmQuZW5hYmxlZCwgZmFsc2UpO1xuICAgIGJsZW5kLnNyY19hbHBoYV9mYWN0b3IgPSBkZWZhdWx0X3ZhbHVlKGJsZW5kLnNyY19hbHBoYV9mYWN0b3IsIEJsZW5kRmFjdG9yLk9uZSk7XG4gICAgYmxlbmQuZHN0X2FscGhhX2ZhY3RvciA9IGRlZmF1bHRfdmFsdWUoYmxlbmQuZHN0X2FscGhhX2ZhY3RvciwgQmxlbmRGYWN0b3IuT25lTWludXNTcmNBbHBoYSk7XG4gICAgYmxlbmQuc3JjX2NvbG9yX2ZhY3RvciA9IGRlZmF1bHRfdmFsdWUoYmxlbmQuc3JjX2NvbG9yX2ZhY3RvciwgQmxlbmRGYWN0b3IuU3JjQWxwaGEpO1xuICAgIGJsZW5kLmRzdF9jb2xvcl9mYWN0b3IgPSBkZWZhdWx0X3ZhbHVlKGJsZW5kLmRzdF9jb2xvcl9mYWN0b3IsIEJsZW5kRmFjdG9yLk9uZU1pbnVzU3JjQWxwaGEpO1xuICAgIGJsZW5kLmNvbG9yX2Z1bmMgPSBkZWZhdWx0X3ZhbHVlKGJsZW5kLmNvbG9yX2Z1bmMsIEJsZW5kRnVuYy5BZGQpO1xuICAgIGJsZW5kLmFscGhhX2Z1bmMgPSBkZWZhdWx0X3ZhbHVlKGJsZW5kLmFscGhhX2Z1bmMsIEJsZW5kRnVuYy5BZGQpO1xuXG4gICAgbGV0IGRlcHRoX2NvbXBhcmVfZnVuYyA9IGRlZmF1bHRfdmFsdWUoZGVzY3JpcHRvci5kZXB0aF9jb21wYXJlX2Z1bmMsIERlcHRoQ29tcGFyZUZ1bmMuTGVzc0VxdWFsKTtcbiAgICBsZXQgZGVwdGhfd3JpdGUgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IuZGVwdGhfd3JpdGUsIHRydWUpO1xuICAgIGxldCB2ZXJ0ZXhfb3JkZXIgPSBkZWZhdWx0X3ZhbHVlKGRlc2NyaXB0b3IudmVydGV4X29yZGVyLCBWZXJ0ZXhPcmRlci5Db3VudGVyQ2xvY2tXaXNlKTtcbiAgICBsZXQgY3VsbF9tb2RlID0gZGVmYXVsdF92YWx1ZShkZXNjcmlwdG9yLmN1bGxfbW9kZSwgQ3VsbE1vZGUuQmFjayk7XG5cbiAgICBpZiAoZGVzY3JpcHRvci5jb21iaW5lZF9zaGFkZXIpIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBkZXNjcmlwdG9yLmNvbWJpbmVkX3NoYWRlci5zcGxpdCgvI2RlZmluZSBTUExJVFRFUi8pO1xuICAgICAgICB2ZXJ0ZXhfc2hhZGVyICs9IHBhcnRzWzBdO1xuICAgICAgICBmcmFnbWVudF9zaGFkZXIgKz0gcGFydHNbMV07XG4gICAgfVxuXG4gICAgaWYgKCF2ZXJ0ZXhfc2hhZGVyKSB0aHJvdyAnaW52YWxpZCB2ZXJ0ZXggc2hhZGVyIHNvdXJjZS4nO1xuICAgIGlmICghZnJhZ21lbnRfc2hhZGVyKSB0aHJvdyAnaW52YWxpZCBmcmFnbWVudCBzaGFkZXIgc291cmNlLic7XG5cbiAgICBsZXQgdmVydGV4X2hlYWRlciA9IHZlcnRleF9zaGFkZXIuc2VhcmNoKHZlcnNpb25fcmVnKSA+IC0xID8gJycgOiB2ZXJzaW9uO1xuICAgIGxldCBmcmFnbWVudF9oZWFkZXIgPSBmcmFnbWVudF9zaGFkZXIuc2VhcmNoKHZlcnNpb25fcmVnKSA+IC0xID8gJycgOiB2ZXJzaW9uO1xuICAgIGNvbnN0IGRlZmluZXMgPSBkZXNjcmlwdG9yLmRlZmluZXMgfHwgW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWZpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZlcnRleF9oZWFkZXIgKz0gYCNkZWZpbmUgJHtkZWZpbmVzW2ldfSAxXFxuYDtcbiAgICAgICAgZnJhZ21lbnRfaGVhZGVyICs9IGAjZGVmaW5lICR7ZGVmaW5lc1tpXX0gMVxcbmA7XG4gICAgfVxuXG4gICAgdmVydGV4X3NoYWRlciA9IHBhcnNlX2luY2x1ZGUodmVydGV4X3NoYWRlciwgbGlicmFyaWVzKTtcbiAgICBmcmFnbWVudF9zaGFkZXIgPSBwYXJzZV9pbmNsdWRlKGZyYWdtZW50X3NoYWRlciwgbGlicmFyaWVzKTtcblxuICAgIHZlcnRleF9oZWFkZXIgKz0gcHJlY2lzaW9uX2RlY2xhcmF0aW9uKHZlcnRleF9zaGFkZXIpO1xuICAgIGZyYWdtZW50X2hlYWRlciArPSBwcmVjaXNpb25fZGVjbGFyYXRpb24oZnJhZ21lbnRfc2hhZGVyKTtcblxuICAgIHZlcnRleF9zaGFkZXIgPSB2ZXJ0ZXhfaGVhZGVyICsgdmVydGV4X3NoYWRlcjtcbiAgICBmcmFnbWVudF9zaGFkZXIgPSBmcmFnbWVudF9oZWFkZXIgKyBmcmFnbWVudF9zaGFkZXI7XG5cbiAgICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpITtcbiAgICBpZiAocHJvZ3JhbSA9PT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYHBpcGVsaW5lICR7bmFtZX0gY3JlYXRlIGVycm9yYCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHZlcnRleF9zaGFkZXJfaGFuZGxlID0gYnVpbGRfc2hhZGVyKGdsLCB2ZXJ0ZXhfc2hhZGVyLCBnbC5WRVJURVhfU0hBREVSKTtcbiAgICBpZiAodmVydGV4X3NoYWRlcl9oYW5kbGUgPT09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBwaXBlbGluZSAke25hbWV9IHZlcnRleCBzaGFkZXIgY29tcGlsZSBlcnJvcmApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZnJhZ21lbnRfc2hhZGVyX2hhbmRsZSA9IGJ1aWxkX3NoYWRlcihnbCwgZnJhZ21lbnRfc2hhZGVyLCBnbC5GUkFHTUVOVF9TSEFERVIpO1xuICAgIGlmIChmcmFnbWVudF9zaGFkZXJfaGFuZGxlID09PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgcGlwZWxpbmUgJHtuYW1lfSBmcmFnbWVudCBzaGFkZXIgY29tcGlsZSBlcnJvcmApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4X3NoYWRlcl9oYW5kbGUpO1xuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudF9zaGFkZXJfaGFuZGxlKTtcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgIC8vIGdldCB1bmlmb3JtIGxvY2F0aW9uXG4gICAgY29uc3QgdW5pZm9ybXM6IFVuaWZvcm1bXSA9IFtdO1xuICAgIGNvbnN0IHBpcGVsaW5lID0ge1xuICAgICAgICBuYW1lLFxuICAgICAgICB2YWxpZDogdHJ1ZSxcbiAgICAgICAgaWQ6IGdldF9waXBlbGluZV9pZCgpLFxuXG4gICAgICAgIHZlcnRleF9zaGFkZXIsXG4gICAgICAgIGZyYWdtZW50X3NoYWRlcixcbiAgICAgICAgcHJvZ3JhbSxcblxuICAgICAgICB1bmlmb3JtX2Jsb2NrOiB7fSxcbiAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgIGN1bGxfbW9kZSxcbiAgICAgICAgZGVwdGhfY29tcGFyZV9mdW5jLFxuICAgICAgICBkZXB0aF93cml0ZSxcbiAgICAgICAgdmVydGV4X29yZGVyLFxuICAgICAgICBibGVuZCxcbiAgICB9O1xuXG4gICAgcGlwZWxpbmVfYmluZF91bmlmb3JtKHBpcGVsaW5lLCBkZXNjcmlwdG9yLnVuaWZvcm1zID8/IFtdKTtcbiAgICByZXR1cm4gcGlwZWxpbmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaXBlbGluZV9iaW5kX3VuaWZvcm0ocGlwZWxpbmU6IFBpcGVsaW5lLCBkZXNjcmlwdG9yczogVW5pZm9ybURlc2NyaXB0b3JbXSkge1xuICAgIGNvbnN0IHN0cnVjdF91bmlmb3JtX21hcCA9IG5ldyBNYXA8c3RyaW5nLCBVbmlmb3JtRGVzY3JpcHRvcltdPigpO1xuICAgIGNvbnN0IHsgdW5pZm9ybV9ibG9jaywgdW5pZm9ybXMsIHByb2dyYW0gfSA9IHBpcGVsaW5lO1xuXG4gICAgY29uc3QgZW5jb2RlciA9IGdmeF9kZXZpY2VfZ2V0KCkuZW5jb2RlciBhcyBXZWJHTEVuY29kZXI7XG4gICAgY29uc3QgZ2wgPSBlbmNvZGVyLmdsO1xuXG4gICAgaWYgKHVuaWZvcm1zKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVzY3JpcHRvcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1fZGVzYyA9IGRlc2NyaXB0b3JzW2ldO1xuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCB0eXBlLCB2aXNpYmxlLCBkZWZhdWx0X3ZhbHVlIH0gPSB1bmlmb3JtX2Rlc2M7XG5cbiAgICAgICAgICAgIC8vIGlzIHN0cnVjdHVyZWQgdW5pZm9ybVxuICAgICAgICAgICAgaWYgKG5hbWUuc2VhcmNoKC9cXC4vKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RydWN0X25hbWUgPSBuYW1lLnNwbGl0KC9cXC4vKVswXSE7XG4gICAgICAgICAgICAgICAgbGV0IHN0cnVjdF91bmlmb3JtcyA9IHN0cnVjdF91bmlmb3JtX21hcC5nZXQoc3RydWN0X25hbWUpO1xuICAgICAgICAgICAgICAgIGlmICghc3RydWN0X3VuaWZvcm1zKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cnVjdF91bmlmb3JtcyA9IFt1bmlmb3JtX2Rlc2NdO1xuICAgICAgICAgICAgICAgICAgICBzdHJ1Y3RfdW5pZm9ybV9tYXAuc2V0KHN0cnVjdF9uYW1lLCBzdHJ1Y3RfdW5pZm9ybXMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cnVjdF91bmlmb3Jtcy5wdXNoKHVuaWZvcm1fZGVzYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBuYW1lKTtcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbiA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB1cGxvYWQ6IEZ1bmN0aW9uO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5GbG9hdDpcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkID0gdXBsb2FkX2Zsb2F0LmJpbmQodW5kZWZpbmVkLCBnbCwgbG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLkZsb2F0MjpcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkID0gdXBsb2FkX2Zsb2F0Mi5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5GbG9hdDM6XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZCA9IHVwbG9hZF9mbG9hdDMuYmluZCh1bmRlZmluZWQsIGdsLCBsb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuVW5zaWduZWRJbnRlZ2VyOlxuICAgICAgICAgICAgICAgICAgICB1cGxvYWQgPSB1cGxvYWRfdWludC5iaW5kKHVuZGVmaW5lZCwgZ2wsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5JbnRlZ2VyOlxuICAgICAgICAgICAgICAgICAgICB1cGxvYWQgPSB1cGxvYWRfaW50LmJpbmQodW5kZWZpbmVkLCBnbCwgbG9jYXRpb24pO1xuICAgICAgICAgICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuQ29sb3JSR0JBOlxuICAgICAgICAgICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuRmxvYXQ0OlxuICAgICAgICAgICAgICAgICAgICB1cGxvYWQgPSB1cGxvYWRfZmxvYXQ0LmJpbmQodW5kZWZpbmVkLCBnbCwgbG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLk1hdDM6XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZCA9IHVwbG9hZF9tYXQzLmJpbmQodW5kZWZpbmVkLCBnbCwgbG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLk1hdDQ6XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZCA9IHVwbG9hZF9tYXQ0LmJpbmQodW5kZWZpbmVkLCBnbCwgbG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLlRleHR1cmUyREFycmF5OlxuICAgICAgICAgICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuVGV4dHVyZTJEOlxuICAgICAgICAgICAgICAgICAgICB1cGxvYWQgPSB1cGxvYWRfdGV4dHVyZTJkLmJpbmQodW5kZWZpbmVkLCBnbCwgbG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLlRleHR1cmVDdWJlOlxuICAgICAgICAgICAgICAgICAgICB1cGxvYWQgPSB1cGxvYWRfdGV4dHVyZV9jdWJlLmJpbmQodW5kZWZpbmVkLCBnbCwgbG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgdW5pZm9ybSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGdsX3VuaWZvcm0gPSB7IG5hbWUsIHVwbG9hZCwgdHlwZSB9IGFzIFVuaWZvcm07XG4gICAgICAgICAgICBnbF91bmlmb3JtLnZpc2libGUgPSB2aXNpYmxlID8/IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRlZmF1bHRfdmFsdWUgIT09IHVuZGVmaW5lZCkgZ2xfdW5pZm9ybS5kZWZhdWx0X3ZhbHVlID0gZGVmYXVsdF92YWx1ZTtcblxuICAgICAgICAgICAgdW5pZm9ybV9ibG9ja1tuYW1lXSA9IGdsX3VuaWZvcm07XG4gICAgICAgICAgICB1bmlmb3Jtcy5wdXNoKGdsX3VuaWZvcm0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcHJvY2VzcyB1Ym9cbiAgICBmb3IgKGNvbnN0IFtzdHJ1Y3RfbmFtZSwgc3RydWN0X3VuaWZvcm1zXSBvZiBzdHJ1Y3RfdW5pZm9ybV9tYXApIHtcbiAgICAgICAgaWYgKHN0cnVjdF91bmlmb3Jtcy5sZW5ndGggPD0gMCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHN0cnVjdF9pbmRleCA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW0sIHN0cnVjdF9uYW1lKTtcbiAgICAgICAgY29uc3Qgc3RydWN0X3NpemUgPSBnbC5nZXRBY3RpdmVVbmlmb3JtQmxvY2tQYXJhbWV0ZXIocHJvZ3JhbSwgc3RydWN0X2luZGV4LCBnbC5VTklGT1JNX0JMT0NLX0RBVEFfU0laRSk7XG5cbiAgICAgICAgY29uc3QgbmFtZXMgPSBzdHJ1Y3RfdW5pZm9ybXMubWFwKCh1bmlmb3JtKSA9PiB1bmlmb3JtLm5hbWUuc3BsaXQoL1xcLi8pWzFdISk7XG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBBcnJheS5mcm9tKGdsLmdldFVuaWZvcm1JbmRpY2VzKHByb2dyYW0sIG5hbWVzKSEpLmZpbHRlcigodmFsdWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPiBnbC5BQ1RJVkVfVU5JRk9STVMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHN0cnVjdCB1bmlmb3JtICR7c3RydWN0X25hbWV9LiR7bmFtZXNbaW5kZXhdfSBub3QgZm91bmQuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHN0cnVjdF91bmlmb3JtID0ge1xuICAgICAgICAgICAgbmFtZTogc3RydWN0X25hbWUsXG4gICAgICAgICAgICB0eXBlOiBVbmlmb3JtVHlwZS5TdHJ1Y3QsXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHN0cnVjdF9pbmRleDogc3RydWN0X2luZGV4LFxuICAgICAgICAgICAgc3RydWN0X3NpemU6IHN0cnVjdF9zaXplLFxuICAgICAgICAgICAgaXRlbXM6IHt9LFxuICAgICAgICB9IGFzIFN0cnVjdFVuaWZvcm07XG5cbiAgICAgICAgY29uc3Qgb2Zmc2V0cyA9IGdsLmdldEFjdGl2ZVVuaWZvcm1zKHByb2dyYW0sIGluZGljZXMsIGdsLlVOSUZPUk1fT0ZGU0VUKSEgYXMgbnVtYmVyW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RydWN0X3VuaWZvcm1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCB7IG5hbWUsIHR5cGUsIHZpc2libGUsIGRlZmF1bHRfdmFsdWUgfSA9IHN0cnVjdF91bmlmb3Jtc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVfb2Zmc2V0ID0gb2Zmc2V0c1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVfc2l6ZSA9IHVuaWZvcm1fYnl0ZV9zaXplKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZS5zcGxpdCgvXFwuLylbMV0hO1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHsgbmFtZTogaXRlbV9uYW1lLCB0eXBlLCB2aXNpYmxlLCBkZWZhdWx0X3ZhbHVlLCBieXRlX29mZnNldCwgYnl0ZV9zaXplICB9IGFzIFN0cnVjdFVuaWZvcm1JdGVtO1xuICAgICAgICAgICAgc3RydWN0X3VuaWZvcm0uaXRlbXNbaXRlbV9uYW1lXSA9IGl0ZW0gYXMgYW55O1xuICAgICAgICB9XG5cbiAgICAgICAgdW5pZm9ybV9ibG9ja1tzdHJ1Y3RfbmFtZV0gPSBzdHJ1Y3RfdW5pZm9ybTtcbiAgICAgICAgdW5pZm9ybXMucHVzaChzdHJ1Y3RfdW5pZm9ybSk7XG4gICAgfVxuXG4gICAgY29uc3QgZnJhbWVfYmxvY2sgPSB1bmlmb3JtX2Jsb2NrW1JlbmRlckJsb2NrTmFtZS5GcmFtZV0gYXMgU3RydWN0VW5pZm9ybTtcbiAgICBpZiAoZnJhbWVfYmxvY2spIHtcbiAgICAgICAgY29uc3QgZW5jb2RlciA9IGdmeF9kZXZpY2VfZ2V0KCkuZW5jb2RlciBhcyBXZWJHTEVuY29kZXI7XG4gICAgICAgIGNvbnN0IHVib19hbGlnbm1lbnQgPSBlbmNvZGVyLlVOSUZPUk1fQlVGRkVSX0FMSUdOTUVOVDtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IE1hdGguY2VpbChmcmFtZV9ibG9jay5zdHJ1Y3Rfc2l6ZSAvIHVib19hbGlnbm1lbnQpICogdWJvX2FsaWdubWVudDtcbiAgICAgICAgcGlwZWxpbmUuZnJhbWVfYmxvY2sgPSBjcmVhdGVfYmxvY2soUmVuZGVyQmxvY2tUeXBlLkZyYW1lLCBzaXplLCBSZW5kZXJCbG9ja05hbWUuRnJhbWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpcGVsaW5lX2Rlc3Ryb3kocGlwZWxpbmU6IFBpcGVsaW5lKSB7XG4gICAgaWYgKCFwaXBlbGluZS52YWxpZCkgcmV0dXJuO1xuICAgIHBpcGVsaW5lLnZhbGlkID0gZmFsc2U7XG4gICAgY29uc3QgZW5jb2RlciA9IGdmeF9kZXZpY2VfZ2V0KCkuZW5jb2RlciBhcyBXZWJHTEVuY29kZXI7XG4gICAgY29uc3QgZ2wgPSBlbmNvZGVyLmdsO1xuXG4gICAgZm9yIChjb25zdCB1bmlmb3JtIG9mIHBpcGVsaW5lLnVuaWZvcm1zKSB7XG4gICAgICAgIGlmICh1bmlmb3JtLnR5cGUgPT09IFVuaWZvcm1UeXBlLlN0cnVjdCkge1xuICAgICAgICAgICAgZ2wuZGVsZXRlQnVmZmVyKHVuaWZvcm0uZ2xfYnVmZmVyISk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnbC5kZWxldGVQcm9ncmFtKHBpcGVsaW5lLnByb2dyYW0pO1xuICAgIHBpcGVsaW5lLnVuaWZvcm1fYmxvY2sgPSB7fTtcbiAgICBwaXBlbGluZS51bmlmb3JtcyA9IFtdO1xufVxuXG5jb25zdCB1bnJvbGxfcGF0dGVybiA9IC8jcHJhZ21hIHVucm9sbF9sb29wX3N0YXJ0XFxzK2ZvclxccypcXChcXHMqaW50XFxzK2lcXHMqPVxccyooXFxkKylcXHMqO1xccyppXFxzKjxcXHMqKFxcZCspXFxzKjtcXHMqaVxccypcXCtcXCtcXHMqXFwpXFxzKnsoW1xcc1xcU10rPyl9XFxzKyNwcmFnbWEgdW5yb2xsX2xvb3BfZW5kL2c7XG5mdW5jdGlvbiBsb29wX3JlcGxhY2VyKF86IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcsIHNuaXBwZXQ6IHN0cmluZykge1xuICAgIGxldCBzdHJpbmcgPSAnJztcbiAgICBmb3IgKGxldCBpID0gcGFyc2VJbnQoc3RhcnQpOyBpIDwgcGFyc2VJbnQoZW5kKTsgaSsrKSB7XG4gICAgICAgIHN0cmluZyArPSBzbmlwcGV0LnJlcGxhY2UoL1xcW1xccyppXFxzKlxcXS9nLCAnWycgKyBpICsgJ10nKS5yZXBsYWNlKC9VTlJPTExFRF9MT09QX0lOREVYL2csIGkudG9TdHJpbmcoKSk7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkX3NoYWRlcihnbDogR0wsIHNvdXJjZTogc3RyaW5nLCB0eXBlOiBhbnkpOiBXZWJHTFNoYWRlciB8IG51bGwge1xuICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKHVucm9sbF9wYXR0ZXJuLCBsb29wX3JlcGxhY2VyKTtcbiAgICBjb25zdCBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSkhO1xuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuICAgIGNvbnN0IHNoYWRlckluZm8gPSBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG4gICAgaWYgKHNoYWRlckluZm8gIT0gJycpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBzb3VyY2Uuc3BsaXQoJ1xcbicpO1xuICAgICAgICBjb25zdCBsaW5lX2NvdW50ID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBjb25zdCBtYXhfYml0ID0gY291bnRfZGVjaW1hbF9iaXQobGluZV9jb3VudCk7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGxpbmVzXG4gICAgICAgICAgICAgICAgLm1hcCgobCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7JyAnLnJlcGVhdChtYXhfYml0IC0gY291bnRfZGVjaW1hbF9iaXQoaSArIDEpKX0ke2kgKyAxfXwke2x9YDtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKVxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLndhcm4oYHNoYWRlciBlcnJvciBpbmZvOlxcbiR7c2hhZGVySW5mb31gKTtcbiAgICAgICAgcmV0dXJuIG51bGwhO1xuICAgIH1cbiAgICByZXR1cm4gc2hhZGVyO1xufVxuXG5mdW5jdGlvbiB1bmlmb3JtX2J5dGVfc2l6ZSh0eXBlOiBVbmlmb3JtVHlwZSk6IG51bWJlciB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuQm9vbDpcbiAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5GbG9hdDpcbiAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5VbnNpZ25lZEludGVnZXI6XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuSW50ZWdlcjpcbiAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLkZsb2F0MjpcbiAgICAgICAgICAgIHJldHVybiA4O1xuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLkZsb2F0MzpcbiAgICAgICAgICAgIHJldHVybiAxMjtcbiAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5Db2xvclJHQkE6XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuRmxvYXQ0OlxuICAgICAgICAgICAgcmV0dXJuIDE2O1xuICAgICAgICBjYXNlIFVuaWZvcm1UeXBlLk1hdDM6XG4gICAgICAgICAgICByZXR1cm4gMzY7XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuTWF0NDpcbiAgICAgICAgICAgIHJldHVybiA2NDtcbiAgICAgICAgY2FzZSBVbmlmb3JtVHlwZS5UZXh0dXJlMkQ6XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuVGV4dHVyZUN1YmU6XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuVGV4dHVyZTJEQXJyYXk6XG4gICAgICAgIGNhc2UgVW5pZm9ybVR5cGUuVGV4dHVyZTNEOlxuICAgICAgICAgICAgcmV0dXJuIDQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgdW5pZm9ybSB0eXBlOiAke3R5cGV9YCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGxvYWRfZmxvYXQoZ2w6IEdMLCBsb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24sIHZhbHVlOiBudW1iZXIgfCBGbG9hdDMyQXJyYXkpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHtcbiAgICAgICAgZ2wudW5pZm9ybTFmdihsb2NhdGlvbiwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnVuaWZvcm0xZihsb2NhdGlvbiwgdmFsdWUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBsb2FkX2Zsb2F0MihnbDogR0wsIGxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiwgdmFsdWU6IEZsb2F0MiB8IEZsb2F0MzJBcnJheSk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgICBnbC51bmlmb3JtMmZ2KGxvY2F0aW9uLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2wudW5pZm9ybTJmdihsb2NhdGlvbiwgdmFsdWUuZWxlbWVudHMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBsb2FkX2Zsb2F0MyhnbDogR0wsIGxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiwgdmFsdWU6IEZsb2F0Myk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgICBnbC51bmlmb3JtM2Z2KGxvY2F0aW9uLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2wudW5pZm9ybTNmdihsb2NhdGlvbiwgdmFsdWUuZWxlbWVudHMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBsb2FkX2Zsb2F0NChnbDogR0wsIGxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiwgdmFsdWU6IEZsb2F0NCB8IEZsb2F0MzJBcnJheSk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgICBnbC51bmlmb3JtNGZ2KGxvY2F0aW9uLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2wudW5pZm9ybTRmdihsb2NhdGlvbiwgdmFsdWUuZWxlbWVudHMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBsb2FkX3VpbnQoZ2w6IEdMLCBsb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24sIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBnbC51bmlmb3JtMXVpKGxvY2F0aW9uLCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHVwbG9hZF9pbnQoZ2w6IEdMLCBsb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24sIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBnbC51bmlmb3JtMWkobG9jYXRpb24sIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gdXBsb2FkX21hdDMoZ2w6IEdMLCBsb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24sIHZhbHVlOiBNYXQzIHwgRmxvYXQzMkFycmF5KTogdm9pZCB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYobG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDNmdihsb2NhdGlvbiwgZmFsc2UsIHZhbHVlLmVsZW1lbnRzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwbG9hZF9tYXQ0KGdsOiBHTCwgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uLCB2YWx1ZTogTWF0NCB8IEZsb2F0MzJBcnJheSk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYobG9jYXRpb24sIGZhbHNlLCB2YWx1ZS5lbGVtZW50cyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGxvYWRfdGV4dHVyZTJkKGdsOiBHTCwgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uLCB0ZXh0dXJlOiBXZWJHTFRleHR1cmVIYW5kbGUpOiB2b2lkIHtcbiAgICBpZiAoIXRleHR1cmUpIHJldHVybjtcbiAgICBjb25zdCBzbG90ID0gd2ViZ2xfdGV4dHVyZV9zbG90X3JlcXVlc3QodGV4dHVyZSk7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArIHNsb3QpO1xuICAgIGdsLmJpbmRUZXh0dXJlKHRleHR1cmUudGV4dHVyZV90eXBlLCB0ZXh0dXJlLndlYmdsX3RleHR1cmUhKTtcbiAgICBnbC51bmlmb3JtMWkobG9jYXRpb24sIHNsb3QpO1xufVxuXG5mdW5jdGlvbiB1cGxvYWRfdGV4dHVyZV9jdWJlKGdsOiBHTCwgbG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uLCB0ZXh0dXJlOiBXZWJHTFRleHR1cmVIYW5kbGUpOiB2b2lkIHtcbiAgICBpZiAoIXRleHR1cmUpIHJldHVybjtcbiAgICBjb25zdCBzbG90ID0gd2ViZ2xfdGV4dHVyZV9zbG90X3JlcXVlc3QodGV4dHVyZSk7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArIHNsb3QpO1xuICAgIGdsLmJpbmRUZXh0dXJlKHRleHR1cmUudGV4dHVyZV90eXBlLCB0ZXh0dXJlLndlYmdsX3RleHR1cmUhKTtcbiAgICBnbC51bmlmb3JtMWkobG9jYXRpb24sIHNsb3QpO1xufSIsICJpbXBvcnQgeyBNYXRlcmlhbEJsb2NrLCBTdWJNZXNoIH0gZnJvbSAnLi4vZW5naW5lJztcbmltcG9ydCB7IENhbWVyYSB9IGZyb20gJy4uL2VuZ2luZS9jYW1lcmEnO1xuaW1wb3J0IHsgRnJhbWVDYXB0dXJlTm9kZVR5cGUsIFByb2ZpbGVyIH0gZnJvbSAnLi4vZW5naW5lL2ZyYW1lX2NhcHR1cmUnO1xuaW1wb3J0IHsgTWF0ZXJpYWwgfSBmcm9tICcuLi9lbmdpbmUvbWF0ZXJpYWwnO1xuaW1wb3J0IHsgR0ZYRGV2aWNlQ2xpZW50IH0gZnJvbSAnLi4vZ2Z4JztcbmltcG9ydCB7IEdGWEJhY2tlbmQsIEdGWERldmljZU9wdGlvbnMsIEdMLCBHUFVBY3Rpb24sIEdQVUFjdGlvblR5cGUgfSBmcm9tICcuLi9nZngvZ2Z4X2RldmljZSc7XG5pbXBvcnQgeyBHRlhFbmNvZGVyLCBSZW5kZXJPYmplY3QgfSBmcm9tICcuLi9nZngvZ2Z4X2VuY29kZXInO1xuaW1wb3J0IHsgQ29sb3JSR0JBIH0gZnJvbSAnLi4vbWF0aC9jb2xvcic7XG5pbXBvcnQgeyBSZWN0IH0gZnJvbSAnLi4vbWF0aC9yZWN0JztcbmltcG9ydCB7IGJsb2NrX2JpbmQsIFJlbmRlckJsb2NrTmFtZSwgdXBsb2FkX2Jsb2NrIH0gZnJvbSAnLi9ibG9jayc7XG5pbXBvcnQgeyBXZWJHTERyYXcgfSBmcm9tICcuL2RyYXcnO1xuaW1wb3J0IHsgZ2V0X2V4dGVuc2lvbiB9IGZyb20gJy4vZXh0ZW5zaW9ucyc7XG5pbXBvcnQgeyBHUFVNZXNoIH0gZnJvbSAnLi9tZXNoJztcbmltcG9ydCB7IEdQVVBhc3MsIFBhc3NMb2FkQWN0aW9uIH0gZnJvbSAnLi9wYXNzJztcbmltcG9ydCB7IEN1bGxNb2RlLCBEZXB0aENvbXBhcmVGdW5jLCBQaXBlbGluZSwgUHJpbWl0aXZlVHlwZSwgU3RydWN0VW5pZm9ybSwgVW5pZm9ybVZhbHVlIH0gZnJvbSAnLi9waXBlbGluZSc7XG5pbXBvcnQgeyB3ZWJnbF90ZXh0dXJlX3Nsb3RfcmVzZXQgfSBmcm9tICcuL3RleHR1cmVfc2xvdCc7XG5cbmV4cG9ydCBjbGFzcyBXZWJHTEVuY29kZXIgaW1wbGVtZW50cyBHRlhFbmNvZGVyIHtcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIGNsaWVudDogR0ZYRGV2aWNlQ2xpZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgcGlwZWxpbmU/OiBQaXBlbGluZTtcbiAgICBjdXJyZW50X3Bhc3M/OiBHUFVQYXNzO1xuXG4gICAgZ2w6IEdMO1xuXG4gICAgbGFzdF9wYXNzPzogR1BVUGFzcztcbiAgICBsYXN0X3ZpZXdwb3J0OiBSZWN0ID0gbmV3IFJlY3QoKTtcbiAgICB2aWV3cG9ydDogUmVjdCA9IG5ldyBSZWN0KCk7XG5cbiAgICBwcm9maWxlcjogUHJvZmlsZXIgPSBuZXcgUHJvZmlsZXIoKTtcbiAgICByZWNvcmRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIGNsZWFyX2FjdGlvbiA9IHtcbiAgICAgICAgdHlwZTogR1BVQWN0aW9uVHlwZS5DbGVhckFsbCxcbiAgICAgICAgY2xlYXJfY29sb3I6IG5ldyBDb2xvclJHQkEoMCwgMCwgMCwgMCksXG4gICAgICAgIGNsZWFyX2RlcHRoOiAxLFxuICAgIH07XG5cbiAgICB1bmlmb3JtX2NhY2hlOiBNYXA8c3RyaW5nLCBVbmlmb3JtVmFsdWU+ID0gbmV3IE1hcDxzdHJpbmcsIFVuaWZvcm1WYWx1ZT4oKTtcbiAgICBjYW1lcmE/OiBDYW1lcmE7XG5cbiAgICBNQVhfVEVYVFVSRV9TSVpFOiBudW1iZXI7XG4gICAgTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFM6IG51bWJlcjtcbiAgICBNQVhfUkVOREVSQlVGRkVSX1NJWkU6IG51bWJlcjtcbiAgICBVTklGT1JNX0JVRkZFUl9BTElHTk1FTlQ6IG51bWJlcjtcbiAgICBVTklGT1JNX0JVRkZFUl9TSVpFOiBudW1iZXI7XG5cbiAgICB3aWR0aDogbnVtYmVyID0gMTtcbiAgICBoZWlnaHQ6IG51bWJlciA9IDE7XG5cbiAgICBtdWx0aV90aHJlYWRfcmVuZGVyaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBHRlhEZXZpY2VPcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGdsX29wdGlvbnMgPSB7fSBhcyBXZWJHTENvbnRleHRBdHRyaWJ1dGVzO1xuICAgICAgICBnbF9vcHRpb25zLnByZXNlcnZlRHJhd2luZ0J1ZmZlciA9IG9wdGlvbnMucHJlc2VydmVfYnVmZmVyID09PSB0cnVlIHx8IG9wdGlvbnMucHJlc2VydmVEcmF3aW5nQnVmZmVyID09PSB0cnVlO1xuICAgICAgICBnbF9vcHRpb25zLmFudGlhbGlhcyA9IG9wdGlvbnMuYW50aWFsaWFzID09PSB0cnVlO1xuICAgICAgICBnbF9vcHRpb25zLnBvd2VyUHJlZmVyZW5jZSA9IG9wdGlvbnMucG93ZXJQcmVmZXJlbmNlID8/ICdoaWdoLXBlcmZvcm1hbmNlJztcbiAgICAgICAgKGdsX29wdGlvbnMgYXMgYW55KS54ckNvbXBhdGlibGUgPSBvcHRpb25zLnhyX2VuYWJsZWQgPT09IHRydWU7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IG9wdGlvbnMuY2FudmFzID8/IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgaWYgKCFjYW52YXMpIHRocm93IG5ldyBFcnJvcignY2FudmFzIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXMhO1xuICAgICAgICB0aGlzLm11bHRpX3RocmVhZF9yZW5kZXJpbmcgPSBvcHRpb25zLm11bHRpX3RocmVhZF9yZW5kZXJpbmcgPT09IHRydWU7XG5cbiAgICAgICAgbGV0IGdsID0gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsMicsIGdsX29wdGlvbnMpIGFzIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQ7XG4gICAgICAgIGlmIChnbCA9PT0gbnVsbCkgdGhyb3cgYHdlYmdsMiB3YXNuJ3Qgc3VwcG9ydGVkLmA7XG5cbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuXG4gICAgICAgIGdldF9leHRlbnNpb24oZ2wsICdPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXInKTtcbiAgICAgICAgZ2V0X2V4dGVuc2lvbihnbCwgJ0VYVF9jb2xvcl9idWZmZXJfZmxvYXQnKTtcbiAgICAgICAgZ2V0X2V4dGVuc2lvbihnbCwgJ1dFQkdMX211bHRpX2RyYXcnKTtcblxuICAgICAgICB0aGlzLk1BWF9URVhUVVJFX1NJWkUgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1RFWFRVUkVfU0laRSk7XG4gICAgICAgIHRoaXMuTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFMgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFMpO1xuICAgICAgICB0aGlzLk1BWF9SRU5ERVJCVUZGRVJfU0laRSA9IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfUkVOREVSQlVGRkVSX1NJWkUpO1xuICAgICAgICB0aGlzLlVOSUZPUk1fQlVGRkVSX0FMSUdOTUVOVCA9IGdsLmdldFBhcmFtZXRlcihnbC5VTklGT1JNX0JVRkZFUl9PRkZTRVRfQUxJR05NRU5UKTtcbiAgICAgICAgdGhpcy5VTklGT1JNX0JVRkZFUl9TSVpFID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9VTklGT1JNX0JMT0NLX1NJWkUpO1xuICAgICAgICBpZiAoZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVEVYVFVSRV9JTUFHRV9VTklUUykgPCAxKSB0aHJvdyBgdmVydGV4IHRleHR1cmUgbm90IHN1cHBvcnRlZC5gO1xuXG4gICAgICAgIGlmIChvcHRpb25zLm11bHRpX3RocmVhZF9yZW5kZXJpbmcgJiYgJ09mZnNjcmVlbkNhbnZhcycgaW4gd2luZG93ICYmICdTaGFyZWRBcnJheUJ1ZmZlcicgaW4gd2luZG93KSB7XG4gICAgICAgICAgICBjb25zdCBiYWNrZW5kID0gb3B0aW9ucy5iYWNrZW5kID8/IEdGWEJhY2tlbmQuV2ViR0w7XG4gICAgICAgICAgICB0aGlzLmNsaWVudCA9IG5ldyBHRlhEZXZpY2VDbGllbnQoYmFja2VuZCk7XG4gICAgICAgICAgICB0aGlzLmNsaWVudC5jcmVhdGVfZGV2aWNlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW5kZXInKSBhcyBIVE1MQ2FudmFzRWxlbWVudCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRfZGlzcGxheV9zaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICB9XG5cbiAgICBzZXRfY2FtZXJhKGNhbWVyYTogQ2FtZXJhKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuICAgICAgICB0aGlzLnVuaWZvcm1fY2FjaGUuY2xlYXIoKTtcbiAgICAgICAgdGhpcy51cGRhdGVfZnJhbWVfdW5pZm9ybSgpO1xuICAgIH1cblxuICAgIHNldF9wYXNzKHBhc3M/OiBHUFVQYXNzLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6IHZvaWQge1xuICAgICAgICAvLyB1bmRlZmluZWQgcGFzcyBhcyBmdWxsc2NyZWVuIHBhc3NcblxuICAgICAgICB0aGlzLmxhc3Rfdmlld3BvcnQuY29weSh0aGlzLnZpZXdwb3J0KTtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBpZiAoIXBhc3MpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRfcGFzcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIGlmIHBhc3MgY2hhbmdlZCByZWNvcmQgbGFzdCBwYXNzIGVuZFxuICAgICAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudF9wYXNzKSB0aGlzLnByb2ZpbGVyLnRyYWNlX2VuZCgnc2V0IHBhc3MnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2V0X3ZpZXdwb3J0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudF9wYXNzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudF9wYXNzID09PSBwYXNzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBwYXNzIGNoYW5nZWQgcmVjb3JkIGxhc3QgcGFzcyBlbmRcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudF9wYXNzICE9PSB1bmRlZmluZWQgJiYgdGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2VfZW5kKCdzZXQgcGFzcycpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9zdGFydCgnc2V0IHBhc3MnLCBkZXNjcmlwdGlvbiB8fCBwYXNzLm5hbWUsIHBhc3MsIEZyYW1lQ2FwdHVyZU5vZGVUeXBlLlBhc3MpO1xuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHBhc3Mud2ViZ2xfZnJhbWVidWZmZXIpO1xuICAgICAgICB0aGlzLnNldF92aWV3cG9ydCgwLCAwLCBwYXNzLndpZHRoLCBwYXNzLmhlaWdodCk7XG5cbiAgICAgICAgLy8gc2V0dXAgcGFzcyBsb2FkIGFjdGlvblxuICAgICAgICBsZXQgbWFzayA9IDA7XG4gICAgICAgIGlmIChwYXNzLmNvbG9yX2xvYWRfYWN0aW9uID09PSBQYXNzTG9hZEFjdGlvbi5DbGVhcikge1xuICAgICAgICAgICAgY29uc3QgY29sb3IgPSBwYXNzLmNsZWFyX2NvbG9yITtcbiAgICAgICAgICAgIGdsLmNsZWFyQ29sb3IoY29sb3IuciwgY29sb3IuZywgY29sb3IuYiwgY29sb3IuYSk7XG4gICAgICAgICAgICBtYXNrIHw9IGdsLkNPTE9SX0JVRkZFUl9CSVQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhc3MuZGVwdGhfbG9hZF9hY3Rpb24gPT09IFBhc3NMb2FkQWN0aW9uLkNsZWFyKSB7XG4gICAgICAgICAgICBnbC5jbGVhckRlcHRoKHBhc3MuY2xlYXJfZGVwdGghKTtcbiAgICAgICAgICAgIG1hc2sgfD0gZ2wuREVQVEhfQlVGRkVSX0JJVDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWFzayAhPT0gMCkgZ2wuY2xlYXIobWFzayk7XG5cbiAgICAgICAgdGhpcy5sYXN0X3Bhc3MgPSB0aGlzLmN1cnJlbnRfcGFzcztcblxuICAgICAgICB0aGlzLmN1cnJlbnRfcGFzcyA9IHBhc3M7XG4gICAgICAgIHRoaXMudW5pZm9ybV9jYWNoZS5jbGVhcigpO1xuICAgIH1cblxuICAgIHNldF9jbGVhcl9jb2xvcihjb2xvcjogQ29sb3JSR0JBKSB7XG4gICAgICAgIHRoaXMuY2xlYXJfYWN0aW9uLmNsZWFyX2NvbG9yLmNvcHkoY29sb3IpO1xuICAgIH1cblxuICAgIGNsZWFyKGFjdGlvbj86IEdQVUFjdGlvbik6IHZvaWQge1xuICAgICAgICBpZiAoIWFjdGlvbikgYWN0aW9uID0gdGhpcy5jbGVhcl9hY3Rpb247XG5cbiAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSBHUFVBY3Rpb25UeXBlLklnbm9yZSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICgoYWN0aW9uLnR5cGUgJiBHUFVBY3Rpb25UeXBlLkNsZWFyQ29sb3IpICE9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmNsZWFyQ29sb3IoYWN0aW9uLmNsZWFyX2NvbG9yLnIsIGFjdGlvbi5jbGVhcl9jb2xvci5nLCBhY3Rpb24uY2xlYXJfY29sb3IuYiwgYWN0aW9uLmNsZWFyX2NvbG9yLmEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nbC5jbGVhckRlcHRoKGFjdGlvbi5jbGVhcl9kZXB0aCk7XG5cbiAgICAgICAgbGV0IG1hc2sgPSAwO1xuICAgICAgICBpZiAoKGFjdGlvbi50eXBlICYgR1BVQWN0aW9uVHlwZS5DbGVhckNvbG9yKSAhPT0gMCkgbWFzayB8PSB0aGlzLmdsLkNPTE9SX0JVRkZFUl9CSVQ7XG4gICAgICAgIGlmICgoYWN0aW9uLnR5cGUgJiBHUFVBY3Rpb25UeXBlLkNsZWFyRGVwdGgpICE9PSAwKSBtYXNrIHw9IHRoaXMuZ2wuREVQVEhfQlVGRkVSX0JJVDtcbiAgICAgICAgaWYgKChhY3Rpb24udHlwZSAmIEdQVUFjdGlvblR5cGUuQ2xlYXJTdGVuY2lsKSAhPT0gMCkgbWFzayB8PSB0aGlzLmdsLlNURU5DSUxfQlVGRkVSX0JJVDtcblxuICAgICAgICB0aGlzLmdsLmNsZWFyKG1hc2spO1xuICAgIH1cblxuICAgIHNldF92aWV3cG9ydCh4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgd2lkdGggPSBNYXRoLm1heCgwLCB3aWR0aCk7XG4gICAgICAgIGhlaWdodCA9IE1hdGgubWF4KDAsIGhlaWdodCk7XG4gICAgICAgIHRoaXMubGFzdF92aWV3cG9ydC5jb3B5KHRoaXMudmlld3BvcnQpO1xuICAgICAgICB0aGlzLnZpZXdwb3J0LnNldCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBzZXRfcGlwZWxpbmUocGlwZWxpbmU6IFBpcGVsaW5lKTogdm9pZCB7XG4gICAgICAgIGlmICghcGlwZWxpbmUudmFsaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHVzaW5nIGludmFsaWQgcGlwZWxpbmUgJHtwaXBlbGluZS5uYW1lID8/ICcnfWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgd2ViZ2xfdGV4dHVyZV9zbG90X3Jlc2V0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMucGlwZWxpbmUgPT09IHBpcGVsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgcGlwZWxpbmVcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2Vfc3RhcnQoJ3NldCBwaXBlbGluZScsIHBpcGVsaW5lLm5hbWUsIHBpcGVsaW5lLCBGcmFtZUNhcHR1cmVOb2RlVHlwZS5QaXBlbGluZSk7XG4gICAgICAgIGdsLnVzZVByb2dyYW0ocGlwZWxpbmUucHJvZ3JhbSk7XG5cbiAgICAgICAgY29uc3QgeyBjdWxsX21vZGUsIGRlcHRoX3dyaXRlLCBkZXB0aF9jb21wYXJlX2Z1bmMsIHZlcnRleF9vcmRlciwgYmxlbmQgfSA9IHBpcGVsaW5lO1xuXG4gICAgICAgIGlmICh0aGlzLnBpcGVsaW5lID09PSB1bmRlZmluZWQgfHwgY3VsbF9tb2RlICE9PSB0aGlzLnBpcGVsaW5lLmN1bGxfbW9kZSkge1xuICAgICAgICAgICAgaWYgKGRlcHRoX2NvbXBhcmVfZnVuYyA9PT0gRGVwdGhDb21wYXJlRnVuYy5OZXZlciB8fCBjdWxsX21vZGUgPT0gQ3VsbE1vZGUuTm9uZSkge1xuICAgICAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICAgICAgZ2wuY3VsbEZhY2UoY3VsbF9tb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBpcGVsaW5lID09PSB1bmRlZmluZWQgfHwgZGVwdGhfY29tcGFyZV9mdW5jICE9PSB0aGlzLnBpcGVsaW5lLmRlcHRoX2NvbXBhcmVfZnVuYykge1xuICAgICAgICAgICAgaWYgKGRlcHRoX2NvbXBhcmVfZnVuYyA9PT0gRGVwdGhDb21wYXJlRnVuYy5OZXZlcikge1xuICAgICAgICAgICAgICAgIGdsLmRpc2FibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICAgICAgICAgICAgICBnbC5kZXB0aEZ1bmMoZGVwdGhfY29tcGFyZV9mdW5jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBpcGVsaW5lID09PSB1bmRlZmluZWQgfHwgZGVwdGhfd3JpdGUgIT09IHRoaXMucGlwZWxpbmUuZGVwdGhfd3JpdGUpIHtcbiAgICAgICAgICAgIGdsLmRlcHRoTWFzayhkZXB0aF93cml0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5waXBlbGluZSA9PT0gdW5kZWZpbmVkIHx8IHZlcnRleF9vcmRlciAhPT0gdGhpcy5waXBlbGluZS52ZXJ0ZXhfb3JkZXIpIHtcbiAgICAgICAgICAgIGdsLmZyb250RmFjZSh2ZXJ0ZXhfb3JkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGlwZWxpbmUgPT09IHVuZGVmaW5lZCB8fCBibGVuZC5lbmFibGVkICE9PSB0aGlzLnBpcGVsaW5lLmJsZW5kLmVuYWJsZWQpIHtcbiAgICAgICAgICAgIGlmIChibGVuZCAmJiBibGVuZC5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5CTEVORCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLnBpcGVsaW5lID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGJsZW5kLnNyY19jb2xvcl9mYWN0b3IgIT09IHRoaXMucGlwZWxpbmUuYmxlbmQuc3JjX2NvbG9yX2ZhY3RvciB8fFxuICAgICAgICAgICAgYmxlbmQuZHN0X2NvbG9yX2ZhY3RvciAhPT0gdGhpcy5waXBlbGluZS5ibGVuZC5kc3RfY29sb3JfZmFjdG9yIHx8XG4gICAgICAgICAgICBibGVuZC5zcmNfYWxwaGFfZmFjdG9yICE9PSB0aGlzLnBpcGVsaW5lLmJsZW5kLnNyY19hbHBoYV9mYWN0b3IgfHxcbiAgICAgICAgICAgIGJsZW5kLmRzdF9hbHBoYV9mYWN0b3IgIT09IHRoaXMucGlwZWxpbmUuYmxlbmQuZHN0X2FscGhhX2ZhY3RvciB8fFxuICAgICAgICAgICAgYmxlbmQuY29sb3JfZnVuYyAhPT0gdGhpcy5waXBlbGluZS5ibGVuZC5jb2xvcl9mdW5jIHx8XG4gICAgICAgICAgICBibGVuZC5hbHBoYV9mdW5jICE9PSB0aGlzLnBpcGVsaW5lLmJsZW5kLmFscGhhX2Z1bmNcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBnbC5ibGVuZEZ1bmNTZXBhcmF0ZShibGVuZC5zcmNfY29sb3JfZmFjdG9yLCBibGVuZC5kc3RfY29sb3JfZmFjdG9yLCBibGVuZC5zcmNfYWxwaGFfZmFjdG9yLCBibGVuZC5kc3RfYWxwaGFfZmFjdG9yKTtcbiAgICAgICAgICAgIGdsLmJsZW5kRXF1YXRpb25TZXBhcmF0ZShibGVuZC5jb2xvcl9mdW5jLCBibGVuZC5hbHBoYV9mdW5jKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGlwZWxpbmUgPSBwaXBlbGluZTtcbiAgICAgICAgdGhpcy51bmlmb3JtX2NhY2hlLmNsZWFyKCk7XG5cbiAgICAgICAgY29uc3QgZnJhbWVfYmxvY2sgPSBwaXBlbGluZS51bmlmb3JtX2Jsb2NrW1JlbmRlckJsb2NrTmFtZS5GcmFtZV0gYXMgU3RydWN0VW5pZm9ybTtcbiAgICAgICAgaWYgKGZyYW1lX2Jsb2NrICYmIHBpcGVsaW5lLmZyYW1lX2Jsb2NrKSB7XG4gICAgICAgICAgICBibG9ja19iaW5kKHBpcGVsaW5lLCBwaXBlbGluZS5mcmFtZV9ibG9jayk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHVuaWZvcm0gb2YgcGlwZWxpbmUudW5pZm9ybXMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB1bmlmb3JtLm5hbWU7XG4gICAgICAgICAgICBjb25zdCB1bmlmb3JtX3ZhbHVlID0gdW5pZm9ybS5kZWZhdWx0X3ZhbHVlO1xuICAgICAgICAgICAgaWYgKHVuaWZvcm1fdmFsdWUgIT09IHVuZGVmaW5lZCkgdW5pZm9ybS51cGxvYWQodW5pZm9ybV92YWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1fY2FjaGUuc2V0KG5hbWUsIHVuaWZvcm1fdmFsdWUpO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9lbmQoJ3NldCBwaXBlbGluZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlX2ZyYW1lX3VuaWZvcm0oKSB7XG4gICAgICAgIGlmICghdGhpcy5jYW1lcmEgfHwgIXRoaXMucGlwZWxpbmUpIHJldHVybjtcbiAgICAgICAgY29uc3QgZnJhbWVfYmxvY2sgPSB0aGlzLnBpcGVsaW5lLmZyYW1lX2Jsb2NrO1xuICAgICAgICBjb25zdCBmcmFtZV9zdHJ1Y3QgPSB0aGlzLnBpcGVsaW5lLnVuaWZvcm1fYmxvY2tbUmVuZGVyQmxvY2tOYW1lLkZyYW1lXSBhcyBTdHJ1Y3RVbmlmb3JtO1xuICAgICAgICBpZiAoIWZyYW1lX2Jsb2NrIHx8ICFmcmFtZV9zdHJ1Y3QpIHJldHVybjtcbiAgICAgICAgdGhpcy5jYW1lcmEudmlld19tYXRyaXgud3JpdGUoZnJhbWVfYmxvY2s/LnZpZXcuZjMyX3ZpZXcsIGZyYW1lX3N0cnVjdC5pdGVtc1sndmlld19tYXRyaXgnXS5ieXRlX29mZnNldCAvIDQpO1xuICAgICAgICB0aGlzLmNhbWVyYS5wcm9qZWN0aW9uX21hdHJpeC53cml0ZShmcmFtZV9ibG9jaz8udmlldy5mMzJfdmlldywgZnJhbWVfc3RydWN0Lml0ZW1zWydwcm9qZWN0aW9uX21hdHJpeCddLmJ5dGVfb2Zmc2V0IC8gNCk7XG4gICAgICAgIGlmICh0aGlzLnBpcGVsaW5lLmZyYW1lX2Jsb2NrKVxuICAgICAgICB7XG4gICAgICAgICAgICB1cGxvYWRfYmxvY2soZnJhbWVfYmxvY2spO1xuICAgICAgICAgICAgYmxvY2tfYmluZCh0aGlzLnBpcGVsaW5lLCB0aGlzLnBpcGVsaW5lLmZyYW1lX2Jsb2NrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldF9zY2lzc29yKHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIsIGRlc2NyaXB0aW9uPzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgaWYgKHggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZShnbC5TQ0lTU09SX1RFU1QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZW5hYmxlKGdsLlNDSVNTT1JfVEVTVCk7XG4gICAgICAgICAgICBnbC5zY2lzc29yKHgsIHkhLCB3aWR0aCEsIGhlaWdodCEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0X21hdGVyaWFsKG1hdGVyaWFsOiBNYXRlcmlhbCwgZGVzY3JpcHRpb24/OiBzdHJpbmcpIHtcbiAgICAgICAgLy8gaWYgKG1hdGVyaWFsLilcbiAgICB9O1xuXG4gICAgc2V0X2RyYXcgPSAoZHJhdzogV2ViR0xEcmF3LCBvYmplY3Q/OiBSZW5kZXJPYmplY3QsIGRlc2NyaXB0aW9uPzogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9zdGFydCgnc2V0IGRyYXcnLCBkZXNjcmlwdGlvbiwgZHJhdywgRnJhbWVDYXB0dXJlTm9kZVR5cGUuRHJhdyk7XG5cbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBpZiAodGhpcy5waXBlbGluZSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSBwaXBlbGluZScpO1xuXG4gICAgICAgIGNvbnN0IHBpcGVsaW5lID0gdGhpcy5waXBlbGluZSE7XG4gICAgICAgIGNvbnN0IHBpcF91bmlmb3JtcyA9IHBpcGVsaW5lLnVuaWZvcm1zO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBpcF91bmlmb3Jtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgcGlwX3VuaWZvcm0gPSBwaXBfdW5pZm9ybXNbaV07XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcGlwX3VuaWZvcm0ubmFtZTtcbiAgICAgICAgICAgIGxldCB1bmlmb3JtOiBVbmlmb3JtVmFsdWU7XG4gICAgICAgICAgICBpZiAob2JqZWN0Py5tYXRlcmlhbF9ibG9jaz8uaGFzX3Byb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybSA9IG9iamVjdC5tYXRlcmlhbF9ibG9jay5nZXRfcHJvcGVydHkobmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0gPSBkcmF3LnVuaWZvcm1zW25hbWVdIHx8IHBpcGVsaW5lLnVuaWZvcm1fYmxvY2tbbmFtZV0uZGVmYXVsdF92YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGlzIHVuaWZvcm0gaGFzIGJlZW4gdXBsb2FkZWQuXG4gICAgICAgICAgICBjb25zdCBjYWNoZWRfdW5pZm9ybSA9IHRoaXMudW5pZm9ybV9jYWNoZS5nZXQobmFtZSk7XG4gICAgICAgICAgICBpZiAoY2FjaGVkX3VuaWZvcm0gPT09IHVuaWZvcm0gJiYgIWRyYXcuZm9yY2VfdXBkYXRlLmhhcyhuYW1lKSkgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIFVwbG9hZCB1bmlmb3JtICYgY2FjaGVcbiAgICAgICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9zdGFydCgndXBsb2FkIHVuaWZvcm0nLCBgJHtuYW1lfSAke3VuaWZvcm19YCwgdW5pZm9ybSwgRnJhbWVDYXB0dXJlTm9kZVR5cGUuQ29uc3RhbnRCdWZmZXIpO1xuICAgICAgICAgICAgaWYgKHVuaWZvcm0gIT09IHVuZGVmaW5lZCkgcGlwX3VuaWZvcm0udXBsb2FkKHVuaWZvcm0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX2VuZCgndXBsb2FkIHVuaWZvcm0nKTtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybV9jYWNoZS5zZXQobmFtZSwgdW5pZm9ybSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdHJ1Y3RfdW5pZm9ybSA9IHBpcGVsaW5lLnVuaWZvcm1fYmxvY2tbUmVuZGVyQmxvY2tOYW1lLk9iamVjdF0gYXMgU3RydWN0VW5pZm9ybTtcbiAgICAgICAgY29uc3QgcmVuZGVyX29iamVjdCA9IG9iamVjdD8ucmVuZGVyX2Jsb2NrO1xuICAgICAgICBpZiAocmVuZGVyX29iamVjdCAmJiBzdHJ1Y3RfdW5pZm9ybSkge1xuICAgICAgICAgICAgYmxvY2tfYmluZChwaXBlbGluZSwgcmVuZGVyX29iamVjdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZHJhdy53ZWJnbF92YW8gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkoZHJhdy53ZWJnbF92YW8pO1xuXG4gICAgICAgIGlmIChkcmF3LnJhbmdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChkcmF3LmluZGV4ZWQpIHtcbiAgICAgICAgICAgICAgICBnbC5kcmF3RWxlbWVudHMoZHJhdy50eXBlLCBkcmF3LnJhbmdlLmNvdW50LCBnbC5VTlNJR05FRF9JTlQsIGRyYXcucmFuZ2Uuc3RhcnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbC5kcmF3QXJyYXlzKGRyYXcudHlwZSwgZHJhdy5yYW5nZS5zdGFydCwgZHJhdy5yYW5nZS5jb3VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZHJhdy5pbmRleGVkKSB7XG4gICAgICAgICAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGRyYXcudHlwZSwgZHJhdy5tYXhfdmVydGV4X2NvdW50LCBnbC5VTlNJR05FRF9JTlQsIDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbC5kcmF3QXJyYXlzKGRyYXcudHlwZSwgMCwgZHJhdy5tYXhfdmVydGV4X2NvdW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9lbmQoJ3NldCBkcmF3Jyk7XG4gICAgfTtcblxuICAgIHNldF9tYXRlcmlhbF9ibG9jayhtYXRlcmlhbDogTWF0ZXJpYWxCbG9jaywgZGVzY3JpcHRpb24/OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMucGlwZWxpbmUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2Vfc3RhcnQoJ3NldCBtYXRlcmlhbCBibG9jaycsIGRlc2NyaXB0aW9uKTtcblxuICAgICAgICBjb25zdCBwaXBlbGluZSA9IHRoaXMucGlwZWxpbmUhO1xuICAgICAgICBjb25zdCBwaXBfdW5pZm9ybXMgPSBwaXBlbGluZS51bmlmb3JtcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaXBfdW5pZm9ybXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IHBpcF91bmlmb3JtID0gcGlwX3VuaWZvcm1zW2ldO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHBpcF91bmlmb3JtLm5hbWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcbiAgICAgICAgICAgIGlmICghbWF0ZXJpYWwuaGFzX3Byb3BlcnR5KG5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm0gPSBtYXRlcmlhbC5nZXRfcHJvcGVydHkobmFtZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh1bmlmb3JtKTtcblxuICAgICAgICAgICAgLy8gVXBsb2FkIHVuaWZvcm0gJiBjYWNoZVxuICAgICAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX3N0YXJ0KCd1cGxvYWQgdW5pZm9ybScsIGAke25hbWV9ICR7dW5pZm9ybX1gLCB1bmlmb3JtLCBGcmFtZUNhcHR1cmVOb2RlVHlwZS5Db25zdGFudEJ1ZmZlcik7XG4gICAgICAgICAgICBpZiAodW5pZm9ybSAhPT0gdW5kZWZpbmVkKSBwaXBfdW5pZm9ybS51cGxvYWQodW5pZm9ybSk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2VfZW5kKCd1cGxvYWQgdW5pZm9ybScpO1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtX2NhY2hlLnNldChuYW1lLCB1bmlmb3JtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX2VuZCgnc2V0IG1hdGVyaWFsIGJsb2NrJyk7XG4gICAgfVxuXG4gICAgc2V0X21lc2gobWVzaDogR1BVTWVzaCwgZGVzY3JpcHRpb24/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2Vfc3RhcnQoJ3NldCBtZXNoJywgZGVzY3JpcHRpb24pO1xuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobWVzaC52YW8pO1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHRoaXMucHJvZmlsZXIudHJhY2VfZW5kKCdzZXQgbWVzaCcpO1xuICAgIH1cblxuICAgIGRyYXdfbWVzaChtZXNoOiBHUFVNZXNoLCBkZXNjcmlwdGlvbj86IHN0cmluZykge1xuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9zdGFydCgnZHJhdyBtZXNoJywgZGVzY3JpcHRpb24sIG1lc2gsIEZyYW1lQ2FwdHVyZU5vZGVUeXBlLk1lc2gpO1xuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobWVzaC52YW8pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lc2guc3ViX21lc2hlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKG1lc2guaW5kZXhlZCkge1xuICAgICAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50cyhQcmltaXRpdmVUeXBlLlRyaWFuZ2xlcywgbWVzaC5pbmRleF9jb3VudCwgZ2wuVU5TSUdORURfSU5ULCAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuZHJhd0FycmF5cyhQcmltaXRpdmVUeXBlLlRyaWFuZ2xlcywgMCwgbWVzaC52ZXJ0ZXhfY291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykgdGhpcy5wcm9maWxlci50cmFjZV9lbmQoJ2RyYXcgbWVzaCcpO1xuICAgIH1cblxuICAgIGRyYXdfc3VibWVzaChtZXNoOiBTdWJNZXNoKSB7XG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nKSB0aGlzLnByb2ZpbGVyLnRyYWNlX3N0YXJ0KCdkcmF3IHN1YiBtZXNoJyk7XG4gICAgICAgIGlmIChtZXNoLmluZGV4ZWQpIHtcbiAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50cyhQcmltaXRpdmVUeXBlLlRyaWFuZ2xlcywgbWVzaC5pbmRleF9jb3VudCwgZ2wuVU5TSUdORURfSU5ULCBtZXNoLmluZGV4X3N0YXJ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLmRyYXdBcnJheXMoUHJpbWl0aXZlVHlwZS5UcmlhbmdsZXMsIG1lc2guaW5kZXhfc3RhcnQsIG1lc2guaW5kZXhfY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tbWl0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnBpcGVsaW5lID0gdW5kZWZpbmVkO1xuICAgICAgICB3ZWJnbF90ZXh0dXJlX3Nsb3RfcmVzZXQoKTtcbiAgICAgICAgdGhpcy51bmlmb3JtX2NhY2hlLmNsZWFyKCk7XG4gICAgfVxufVxuIiwgImltcG9ydCB7IHBvb2xfZ2V0LCBwb29sX3JldHVybiB9IGZyb20gJy4uL2FkdCc7XG5pbXBvcnQgeyBjbGFtcCB9IGZyb20gJy4uL21hdGgvbWF0aCc7XG5pbXBvcnQgeyBGbG9hdDIsIEZsb2F0MyB9IGZyb20gJy4uL21hdGgvc2ltZCc7XG5pbXBvcnQgeyBTcGhlcmljYWwgfSBmcm9tICcuLi9tYXRoL3NwaGVyaWNhbCc7XG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tICcuL2NhbWVyYSc7XG5cbmV4cG9ydCBjbGFzcyBTcGhlcmljYWxDb250cm9sIHtcbiAgICBlbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcbiAgICBtb3ZhYmxlOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIGludGVycG9sYXRlZF9zcGhlcmljYWw6IFNwaGVyaWNhbCA9IG5ldyBTcGhlcmljYWwoKTtcbiAgICBjdXJyZW50X3NwaGVyaWNhbDogU3BoZXJpY2FsID0gbmV3IFNwaGVyaWNhbCgpO1xuXG4gICAgY2VudGVyOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG4gICAgaW50ZXJwb2xhdGVkX2NlbnRlcjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG4gICAgZGFtcGluZzogbnVtYmVyID0gMC40NTsgLy8gbXNcblxuICAgIGxvY2F0aW9uOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG4gICAgaW50ZXJwb2xhdGVkX2xvY2F0aW9uOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5cbiAgICByb3RhdGVfc3BlZWQ6IG51bWJlciA9IE1hdGguUEkgKiAyO1xuICAgIHpvb21fc3BlZWQ6IG51bWJlciA9IDEuMDtcbiAgICBtb3ZlX3NwZWVkOiBudW1iZXIgPSAyLjA7XG5cbiAgICBtaW5fcG9sYXJfYW5nbGU6IG51bWJlciA9IDFlLTM7XG4gICAgbWF4X3BvbGFyX2FuZ2xlOiBudW1iZXIgPSBNYXRoLlBJO1xuXG4gICAgY2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIGNhbWVyYTogQ2FtZXJhKSB7XG4gICAgICAgIHRoaXMuc2V0X3RhcmdldChjYW1lcmEubG9jYXRpb24pO1xuICAgICAgICBjYW1lcmEubG9va19hdCh0aGlzLmNlbnRlcik7XG4gICAgfVxuXG4gICAgc2V0X3RhcmdldChsb2NhdGlvbjogRmxvYXQzKTogdm9pZCB7XG4gICAgICAgIHRoaXMubG9jYXRpb24uY29weShsb2NhdGlvbik7XG4gICAgICAgIHRoaXMuY3VycmVudF9zcGhlcmljYWwuZnJvbV9mbG9hdDModGhpcy5sb2NhdGlvbik7XG4gICAgICAgIHRoaXMuaW50ZXJwb2xhdGVkX3NwaGVyaWNhbC5jb3B5KHRoaXMuY3VycmVudF9zcGhlcmljYWwpO1xuICAgICAgICB0aGlzLmludGVycG9sYXRlZF9jZW50ZXIuY29weSh0aGlzLmNlbnRlcik7XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgc2V0X2NlbnRlcihsb2NhdGlvbjogRmxvYXQzKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2VudGVyLmNvcHkobG9jYXRpb24pO1xuICAgIH1cblxuICAgIHJvdGF0ZV9ob3Jpem9udGFsKGFuZ2xlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdXJyZW50X3NwaGVyaWNhbC5waGkgKz0gYW5nbGUgKiB0aGlzLnJvdGF0ZV9zcGVlZDtcbiAgICAgICAgaWYgKGFuZ2xlICE9PSAwKSB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJvdGF0ZV92ZXJ0aWNhbChhbmdsZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3VycmVudF9zcGhlcmljYWwudGhldGEgPSBjbGFtcCh0aGlzLmN1cnJlbnRfc3BoZXJpY2FsLnRoZXRhIC0gYW5nbGUgKiB0aGlzLnJvdGF0ZV9zcGVlZCwgdGhpcy5taW5fcG9sYXJfYW5nbGUsIHRoaXMubWF4X3BvbGFyX2FuZ2xlKTtcbiAgICAgICAgaWYgKGFuZ2xlICE9PSAwKSB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIG1vdmUoZGVsdGE6IEZsb2F0Mik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMubW92YWJsZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB2ZWN0b3IgPSBwb29sX2dldChGbG9hdDMpO1xuICAgICAgICB2ZWN0b3Iuc2V0KGRlbHRhLngsIGRlbHRhLnksIDApLm11bCh0aGlzLmN1cnJlbnRfc3BoZXJpY2FsLnJhZGl1cyAqIHRoaXMubW92ZV9zcGVlZCk7XG4gICAgICAgIHRoaXMuY2VudGVyLmFkZCh2ZWN0b3IuYXBwbHlfcXVhdGVybmlvbih0aGlzLmNhbWVyYS5yb3RhdGlvbikpO1xuICAgICAgICBpZiAoZGVsdGEueCAhPT0gMCB8fCBkZWx0YS55ICE9PSAwKSB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBwb29sX3JldHVybih2ZWN0b3IpO1xuICAgIH1cblxuICAgIHpvb20oc2NhbGU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmN1cnJlbnRfc3BoZXJpY2FsLnJhZGl1cyAqPSBzY2FsZSAqIHRoaXMuem9vbV9zcGVlZDtcbiAgICAgICAgaWYgKHNjYWxlICE9PSAxKSB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0aGlzLmludGVycG9sYXRlZF9zcGhlcmljYWwubGVycCh0aGlzLmN1cnJlbnRfc3BoZXJpY2FsLCB0aGlzLmRhbXBpbmcpO1xuICAgICAgICB0aGlzLmludGVycG9sYXRlZF9sb2NhdGlvbi5mcm9tX3NwaGVyaWNhbCh0aGlzLmludGVycG9sYXRlZF9zcGhlcmljYWwpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJwb2xhdGVkX2NlbnRlci5sZXJwKHRoaXMuY2VudGVyLCB0aGlzLmRhbXBpbmcpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJwb2xhdGVkX2xvY2F0aW9uLmFkZCh0aGlzLmludGVycG9sYXRlZF9jZW50ZXIpO1xuICAgICAgICB0aGlzLmxvY2F0aW9uLmNvcHkodGhpcy5pbnRlcnBvbGF0ZWRfbG9jYXRpb24pO1xuXG4gICAgICAgIHRoaXMuY2FtZXJhLmxvY2F0aW9uLmNvcHkodGhpcy5sb2NhdGlvbik7XG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tfYXQodGhpcy5pbnRlcnBvbGF0ZWRfY2VudGVyKTtcblxuICAgICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuY2hhbmdlZDtcbiAgICAgICAgdGhpcy5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBwb29sX2dldCB9IGZyb20gJy4uL2FkdCc7XG5pbXBvcnQgeyBCb3gzIH0gZnJvbSAnLi4vbWF0aCc7XG5pbXBvcnQgeyBGbG9hdDMgfSBmcm9tICcuLi9tYXRoL3NpbWQnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvc2ltZF9tYXQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFZlcnRleERhdGEge1xuICAgIHBvc2l0aW9uPzogRmxvYXQzMkFycmF5O1xuICAgIGluZGV4PzogVWludDE2QXJyYXkgfCBVaW50MzJBcnJheTtcbiAgICBub3JtYWw/OiBGbG9hdDMyQXJyYXk7XG4gICAgdGFuZ2VudD86IEZsb2F0MzJBcnJheTtcbiAgICB1dj86IEZsb2F0MzJBcnJheTtcbiAgICB1djI/OiBGbG9hdDMyQXJyYXk7XG4gICAgdXYzPzogRmxvYXQzMkFycmF5O1xuICAgIHV2ND86IEZsb2F0MzJBcnJheTtcbiAgICB1djU/OiBGbG9hdDMyQXJyYXk7XG4gICAgdXY2PzogRmxvYXQzMkFycmF5O1xuICAgIGNvbG9yPzogRmxvYXQzMkFycmF5O1xuICAgIGpvaW50PzogVWludDMyQXJyYXk7XG4gICAgd2VpZ2h0PzogRmxvYXQzMkFycmF5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVydGV4X2RhdGFfdHJhbnNmb3JtKGRhdGE6IFZlcnRleERhdGEsIG1hdHJpeDogTWF0NCk6IFZlcnRleERhdGEge1xuICAgIGlmIChkYXRhLnBvc2l0aW9uKSBfdHJhbnNmb3JtX3Bvc2l0aW9uKGRhdGEucG9zaXRpb24sIG1hdHJpeCk7XG4gICAgaWYgKGRhdGEubm9ybWFsKSBfdHJhbnNmb3JtX25vcm1hbChkYXRhLm5vcm1hbCwgbWF0cml4KTtcbiAgICBpZiAoZGF0YS50YW5nZW50KSBfdHJhbnNmb3JtX3RhbmdlbnQoZGF0YS50YW5nZW50LCBtYXRyaXgpO1xuICAgIGlmIChkYXRhLmluZGV4ICYmIG1hdHJpeC5kZXRlcm1pbmFudCgpIDwgMCkgX2ZsaXBfZmFjZShkYXRhLmluZGV4KTtcbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcnRleF9kYXRhX2NvbXB1dGVfYm94KGRhdGE6IFZlcnRleERhdGEsIGJveD86IEJveDMpOiBCb3gzIHtcbiAgICBib3ggPSBib3ggPz8gbmV3IEJveDMoKTtcbiAgICBjb25zdCB2ID0gcG9vbF9nZXQoRmxvYXQzKTtcbiAgICBpZiAoZGF0YS5wb3NpdGlvbikge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBkYXRhLnBvc2l0aW9uO1xuICAgICAgICBjb25zdCBlbmQgPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgICAgICAgICB2LnNldChidWZmZXJbaV0sIGJ1ZmZlcltpICsgMV0sIGJ1ZmZlcltpICsgMl0pO1xuICAgICAgICAgICAgYm94LmV4cGFuZF9wb2ludCh2KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYm94O1xufVxuXG5jb25zdCBfdmVydGV4X3YgPSBuZXcgRmxvYXQzKCk7XG5cbmZ1bmN0aW9uIF90cmFuc2Zvcm1fcG9zaXRpb24ocG9zaXRpb25zOiBGbG9hdDMyQXJyYXksIG1hdHJpeDogTWF0NCwgb2Zmc2V0OiBudW1iZXIgPSAwLCBjb3VudD86IG51bWJlcikge1xuICAgIGxldCBlbmQgPSBvZmZzZXQgKyAoY291bnQgPz8gcG9zaXRpb25zLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IG9mZnNldDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgICAgIF92ZXJ0ZXhfdi5zZXQocG9zaXRpb25zW2ldLCBwb3NpdGlvbnNbaSArIDFdLCBwb3NpdGlvbnNbaSArIDJdKTtcbiAgICAgICAgX3ZlcnRleF92LmFwcGx5X21hdDQobWF0cml4KTtcbiAgICAgICAgcG9zaXRpb25zW2ldID0gX3ZlcnRleF92Lng7XG4gICAgICAgIHBvc2l0aW9uc1tpICsgMV0gPSBfdmVydGV4X3YueTtcbiAgICAgICAgcG9zaXRpb25zW2kgKyAyXSA9IF92ZXJ0ZXhfdi56O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX3RyYW5zZm9ybV9ub3JtYWwobm9ybWFsczogRmxvYXQzMkFycmF5LCBtYXRyaXg6IE1hdDQsIG9mZnNldDogbnVtYmVyID0gMCwgY291bnQ/OiBudW1iZXIpIHtcbiAgICBsZXQgZW5kID0gb2Zmc2V0ICsgKGNvdW50ID8/IG5vcm1hbHMubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gb2Zmc2V0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICAgICAgX3ZlcnRleF92LnNldChub3JtYWxzW2ldLCBub3JtYWxzW2kgKyAxXSwgbm9ybWFsc1tpICsgMl0pO1xuICAgICAgICBfdmVydGV4X3YuYXBwbHlfbWF0NF9kaXJlY3Rpb25hbChtYXRyaXgpO1xuICAgICAgICBub3JtYWxzW2ldID0gX3ZlcnRleF92Lng7XG4gICAgICAgIG5vcm1hbHNbaSArIDFdID0gX3ZlcnRleF92Lnk7XG4gICAgICAgIG5vcm1hbHNbaSArIDJdID0gX3ZlcnRleF92Lno7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfdHJhbnNmb3JtX3RhbmdlbnQodGFuZ25ldHM6IEZsb2F0MzJBcnJheSwgbWF0cml4OiBNYXQ0LCBvZmZzZXQ6IG51bWJlciA9IDAsIGNvdW50PzogbnVtYmVyKSB7XG4gICAgbGV0IGVuZCA9IG9mZnNldCArIChjb3VudCA/PyB0YW5nbmV0cy5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSBvZmZzZXQ7IGkgPCBlbmQ7IGkgKz0gNCkge1xuICAgICAgICBfdmVydGV4X3Yuc2V0KHRhbmduZXRzW2ldLCB0YW5nbmV0c1tpICsgMV0sIHRhbmduZXRzW2kgKyAyXSk7XG4gICAgICAgIF92ZXJ0ZXhfdi5hcHBseV9tYXQ0X2RpcmVjdGlvbmFsKG1hdHJpeCk7XG4gICAgICAgIHRhbmduZXRzW2ldID0gX3ZlcnRleF92Lng7XG4gICAgICAgIHRhbmduZXRzW2kgKyAxXSA9IF92ZXJ0ZXhfdi55O1xuICAgICAgICB0YW5nbmV0c1tpICsgMl0gPSBfdmVydGV4X3YuejtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9mbGlwX2ZhY2UoaW5kaWNlOiBVaW50MTZBcnJheSB8IFVpbnQzMkFycmF5KSB7XG4gICAgbGV0IGVuZCA9IGluZGljZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgICAgICBsZXQgdCA9IGluZGljZVtpXTtcbiAgICAgICAgaW5kaWNlW2ldID0gaW5kaWNlW2kgKyAxXTtcbiAgICAgICAgaW5kaWNlW2kgKyAxXSA9IHQ7XG4gICAgfVxufSIsICJpbXBvcnQgeyBNZXNoLCBTdWJNZXNoLCB2ZXJ0ZXhfZGF0YV9jb21wdXRlX2JveCB9IGZyb20gJy4uL2VuZ2luZSc7XG5pbXBvcnQgeyBnZnhfZGV2aWNlX2dldCB9IGZyb20gJy4uL2dmeCc7XG5pbXBvcnQgeyBCb3gzIH0gZnJvbSAnLi4vbWF0aCc7XG5pbXBvcnQgeyBUeXBlZEFycmF5IH0gZnJvbSAnLi4vc3RkJztcbmltcG9ydCB7IGdldF9nbF9idWZmZXJfdHlwZSB9IGZyb20gJy4vZHJhdyc7XG5pbXBvcnQgeyBXZWJHTEVuY29kZXIgfSBmcm9tICcuL2VuY29kZXInO1xuaW1wb3J0IHsgRmxvYXRUeXBlLCBIYWxmRmxvYXRUeXBlIH0gZnJvbSAnLi90eXBlJztcblxuZXhwb3J0IGludGVyZmFjZSBHUFVNZXNoIHtcbiAgICB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3Q7XG4gICAgc3ViX21lc2hlczogU3ViTWVzaFtdO1xuICAgIHZlcnRleF9jb3VudDogbnVtYmVyO1xuICAgIGluZGV4X2NvdW50OiBudW1iZXI7XG4gICAgaW5kZXhlZDogYm9vbGVhbjtcbiAgICBib3g6IEJveDM7XG59XG5cbmV4cG9ydCBlbnVtIEdlbmVyaWNBdHRyaWJ1dGVOYW1lIHtcbiAgICBwb3NpdGlvbiA9ICdwb3NpdGlvbicsXG4gICAgdXYgPSAndXYnLFxuICAgIG5vcm1hbCA9ICdub3JtYWwnLFxuICAgIHRhbmdlbnQgPSAndGFuZ2VudCcsXG4gICAgam9pbnQgPSAnam9pbnQnLFxuICAgIHdlaWdodCA9ICd3ZWlnaHQnLFxuICAgIGNvbG9yID0gJ2NvbG9yJyxcbiAgICB1djIgPSAndXYyJyxcbiAgICB1djMgPSAndXYzJyxcbiAgICB1djQgPSAndXY0JyxcbiAgICB1djUgPSAndXY1JyxcbiAgICB1djYgPSAndXY2Jyxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KG5hbWU6IEdlbmVyaWNBdHRyaWJ1dGVOYW1lKTogbnVtYmVyIHtcbiAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgY2FzZSBHZW5lcmljQXR0cmlidXRlTmFtZS5wb3NpdGlvbjogcmV0dXJuIDA7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUudXY6IHJldHVybiAxO1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLm5vcm1hbDogcmV0dXJuIDI7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUudGFuZ2VudDogcmV0dXJuIDM7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUuam9pbnQ6IHJldHVybiA0O1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLndlaWdodDogcmV0dXJuIDU7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUuY29sb3I6IHJldHVybiA2O1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2MjogcmV0dXJuIDc7XG4gICAgICAgIGNhc2UgR2VuZXJpY0F0dHJpYnV0ZU5hbWUudXYzOiByZXR1cm4gODtcbiAgICAgICAgY2FzZSBHZW5lcmljQXR0cmlidXRlTmFtZS51djQ6IHJldHVybiA5O1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2NTogcmV0dXJuIDEwO1xuICAgICAgICBjYXNlIEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2NjogcmV0dXJuIDExO1xuICAgIH1cbn1cblxuY29uc3QgZ3B1X21lc2hlcyA9IG5ldyBXZWFrTWFwPE1lc2gsIEdQVU1lc2g+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfZ3B1X21lc2gobWVzaDogTWVzaCkge1xuICAgIGNvbnN0IGNhY2hlZCA9IGdwdV9tZXNoZXMuZ2V0KG1lc2gpO1xuICAgIGlmIChjYWNoZWQpIHJldHVybiBjYWNoZWQ7XG5cbiAgICBjb25zdCBlbmNvZGVyID0gZ2Z4X2RldmljZV9nZXQoKS5lbmNvZGVyIGFzIFdlYkdMRW5jb2RlcjtcbiAgICBjb25zdCBnbCA9IGVuY29kZXIuZ2w7XG5cbiAgICBjb25zdCB2YW8gPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xuICAgIGNvbnN0IHsgdmVydGV4X2RhdGEsIHN1Yl9tZXNoZXMgfSA9IG1lc2g7XG5cbiAgICBmdW5jdGlvbiB1cGxvYWRfYnVmZmVyKGRhdGE6IFR5cGVkQXJyYXksIHNsb3Q6IG51bWJlciwgc2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBnZXRfZ2xfYnVmZmVyX3R5cGUoZGF0YSk7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgaWYgKHR5cGUgPT09IEZsb2F0VHlwZSB8fCB0eXBlID09PSBIYWxmRmxvYXRUeXBlKSB7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNsb3QsIHNpemUsIHR5cGUsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYklQb2ludGVyKHNsb3QsIHNpemUsIHR5cGUsIDAsIDApO1xuICAgICAgICB9XG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNsb3QpO1xuICAgIH1cblxuICAgIGNvbnN0IGJveCA9IHZlcnRleF9kYXRhX2NvbXB1dGVfYm94KHZlcnRleF9kYXRhKTtcblxuICAgIGlmICh2ZXJ0ZXhfZGF0YS5wb3NpdGlvbikgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS5wb3NpdGlvbiwgZ2V0X2dlbmVyaWNfYXR0cmlidXRlX3Nsb3QoR2VuZXJpY0F0dHJpYnV0ZU5hbWUucG9zaXRpb24pLCAzKTtcbiAgICBpZiAodmVydGV4X2RhdGEudXYpIHVwbG9hZF9idWZmZXIodmVydGV4X2RhdGEudXYsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2KSwgMik7XG4gICAgaWYgKHZlcnRleF9kYXRhLm5vcm1hbCkgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS5ub3JtYWwsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLm5vcm1hbCksIDMpO1xuICAgIGlmICh2ZXJ0ZXhfZGF0YS50YW5nZW50KSB1cGxvYWRfYnVmZmVyKHZlcnRleF9kYXRhLnRhbmdlbnQsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnRhbmdlbnQpLCA0KTtcbiAgICBpZiAodmVydGV4X2RhdGEuam9pbnQpIHVwbG9hZF9idWZmZXIodmVydGV4X2RhdGEuam9pbnQsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLmpvaW50KSwgNCk7XG4gICAgaWYgKHZlcnRleF9kYXRhLndlaWdodCkgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS53ZWlnaHQsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLndlaWdodCksIDQpO1xuICAgIGlmICh2ZXJ0ZXhfZGF0YS5jb2xvcikgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS5jb2xvciwgZ2V0X2dlbmVyaWNfYXR0cmlidXRlX3Nsb3QoR2VuZXJpY0F0dHJpYnV0ZU5hbWUuY29sb3IpLCA0KTtcbiAgICBpZiAodmVydGV4X2RhdGEudXYyKSB1cGxvYWRfYnVmZmVyKHZlcnRleF9kYXRhLnV2MiwgZ2V0X2dlbmVyaWNfYXR0cmlidXRlX3Nsb3QoR2VuZXJpY0F0dHJpYnV0ZU5hbWUudXYyKSwgMik7XG4gICAgaWYgKHZlcnRleF9kYXRhLnV2MykgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS51djMsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2MyksIDIpO1xuICAgIGlmICh2ZXJ0ZXhfZGF0YS51djQpIHVwbG9hZF9idWZmZXIodmVydGV4X2RhdGEudXY0LCBnZXRfZ2VuZXJpY19hdHRyaWJ1dGVfc2xvdChHZW5lcmljQXR0cmlidXRlTmFtZS51djQpLCAyKTtcbiAgICBpZiAodmVydGV4X2RhdGEudXY1KSB1cGxvYWRfYnVmZmVyKHZlcnRleF9kYXRhLnV2NSwgZ2V0X2dlbmVyaWNfYXR0cmlidXRlX3Nsb3QoR2VuZXJpY0F0dHJpYnV0ZU5hbWUudXY1KSwgMik7XG4gICAgaWYgKHZlcnRleF9kYXRhLnV2NikgdXBsb2FkX2J1ZmZlcih2ZXJ0ZXhfZGF0YS51djYsIGdldF9nZW5lcmljX2F0dHJpYnV0ZV9zbG90KEdlbmVyaWNBdHRyaWJ1dGVOYW1lLnV2NiksIDIpO1xuXG4gICAgbGV0IGluZGV4ZWQgPSBmYWxzZTtcbiAgICBpZiAodmVydGV4X2RhdGEuaW5kZXgpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHZlcnRleF9kYXRhLmluZGV4LCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGluZGV4ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHZlcnRleF9jb3VudCA9IHZlcnRleF9kYXRhLnBvc2l0aW9uID8gdmVydGV4X2RhdGEucG9zaXRpb24ubGVuZ3RoIC8gMyA6IDA7XG4gICAgY29uc3QgaW5kZXhfY291bnQgPSB2ZXJ0ZXhfZGF0YS5pbmRleCA/IHZlcnRleF9kYXRhLmluZGV4Lmxlbmd0aCA6IHZlcnRleF9jb3VudDtcblxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgICBjb25zdCBncHVfbWVzaCA9IHsgdmFvLCBzdWJfbWVzaGVzLCBpbmRleGVkLCBib3gsIHZlcnRleF9jb3VudCwgaW5kZXhfY291bnQgfSBhcyBHUFVNZXNoO1xuICAgIGdwdV9tZXNoZXMuc2V0KG1lc2gsIGdwdV9tZXNoKTtcbiAgICByZXR1cm4gZ3B1X21lc2g7XG59XG4iLCAiaW1wb3J0IHsgQm94MyB9IGZyb20gJy4uL21hdGgvYm94JztcbmltcG9ydCB7IEZsb2F0MyB9IGZyb20gJy4uL21hdGgvc2ltZCc7XG5pbXBvcnQgeyBTcGhlcmUgfSBmcm9tICcuLi9tYXRoL3NwaGVyZSc7XG5pbXBvcnQgeyBUcmlhbmdsZSB9IGZyb20gJy4uL21hdGgvdHJpYW5nbGUnO1xuaW1wb3J0IHsgT3B0aW9uYWwsIFR5cGVkQXJyYXkgfSBmcm9tICcuLi9zdGQvdHlwZSc7XG5pbXBvcnQgeyBHZW5lcmljQXR0cmlidXRlTmFtZSB9IGZyb20gJy4vbWVzaCc7XG5pbXBvcnQgeyBQaXBlbGluZSB9IGZyb20gJy4vcGlwZWxpbmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEluZGV4UmFuZ2Uge1xuICAgIHN0YXJ0OiBudW1iZXI7XG4gICAgY291bnQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHTEF0dHJpYnV0ZSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGJ1ZmZlcjogV2ViR0xCdWZmZXI7XG4gICAgc2xvdD86IFdlYWtNYXA8UGlwZWxpbmUsIG51bWJlcj4gfCBudW1iZXI7XG4gICAgc3RyaWRlOiBudW1iZXI7XG4gICAgZHluYW1pYzogYm9vbGVhbjtcbiAgICBzb3VyY2VfYnVmZmVyPzogVHlwZWRBcnJheTtcbiAgICB1cGRhdGVfbGVuZ3RoPzogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlPFQgZXh0ZW5kcyBUeXBlZEFycmF5ID0gYW55PiB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHN0cmlkZTogbnVtYmVyO1xuICAgIGJ1ZmZlcjogVDtcbiAgICBzbG90PzogbnVtYmVyO1xuICAgIGR5bmFtaWM/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByaW1pdGl2ZSB7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBhdHRyaWJ1dGVzOiBBdHRyaWJ1dGU8VHlwZWRBcnJheT5bXTtcbiAgICBpbmRleD86IFVpbnQzMkFycmF5O1xuICAgIHJhbmdlcz86IEluZGV4UmFuZ2VbXTtcbiAgICBjb21wcmVzc2VkX2RhdGE/OiBBcnJheUJ1ZmZlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlPFQgZXh0ZW5kcyBUeXBlZEFycmF5PihwcmltaXRpdmU6IFByaW1pdGl2ZSwgbmFtZTogc3RyaW5nID0gR2VuZXJpY0F0dHJpYnV0ZU5hbWUucG9zaXRpb24pOiBPcHRpb25hbDxBdHRyaWJ1dGU8VD4+IHtcbiAgICBpZiAocHJpbWl0aXZlLmF0dHJpYnV0ZXMgPT09IHVuZGVmaW5lZCB8fCBwcmltaXRpdmUuYXR0cmlidXRlcy5sZW5ndGggPCAxKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJpbWl0aXZlLmF0dHJpYnV0ZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgYXR0ciA9IHByaW1pdGl2ZS5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICBpZiAoYXR0ci5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gYXR0ciBhcyBBdHRyaWJ1dGU8VD47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldF9hdHRyaWJ1dGU8VCBleHRlbmRzIFR5cGVkQXJyYXk+KHByaW1pdGl2ZTogUHJpbWl0aXZlLCBhdHRyaWJ1dGU6IEF0dHJpYnV0ZTxUPik6IHZvaWQge1xuICAgIGlmIChhdHRyaWJ1dGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9sZCA9IHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlKHByaW1pdGl2ZSwgYXR0cmlidXRlLm5hbWUpO1xuICAgIGlmIChvbGQgPT09IG51bGwpIHtcbiAgICAgICAgcHJpbWl0aXZlLmF0dHJpYnV0ZXMucHVzaChhdHRyaWJ1dGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG9sZCEubmFtZSA9IGF0dHJpYnV0ZS5uYW1lO1xuICAgICAgICBvbGQhLnN0cmlkZSA9IGF0dHJpYnV0ZS5zdHJpZGU7XG4gICAgICAgIG9sZCEuYnVmZmVyID0gYXR0cmlidXRlLmJ1ZmZlcjtcbiAgICB9XG59XG5cbmNvbnN0IHByaW1pdGl2ZV92ID0gbmV3IEZsb2F0MygpO1xuY29uc3QgcHJpbWl0aXZlX2IgPSBuZXcgQm94MygpO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJpbWl0aXZlX2NvbXB1dGVfYm94KHByaW1pdGl2ZTogUHJpbWl0aXZlLCBib3g/OiBCb3gzKTogQm94MyB7XG4gICAgYm94ID0gYm94ID8/IG5ldyBCb3gzKCk7XG4gICAgYm94LnJlc2V0KCk7XG4gICAgY29uc3QgcG9zaXRpb24gPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUpO1xuICAgIGlmIChwb3NpdGlvbikge1xuICAgICAgICBjb25zdCBidWZmZXIgPSBwb3NpdGlvbi5idWZmZXI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgICAgICBwcmltaXRpdmVfdi5yZWFkKGJ1ZmZlciwgaSk7XG4gICAgICAgICAgICBib3guZXhwYW5kX3BvaW50KHByaW1pdGl2ZV92KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYm94O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJpbWl0aXZlX2NvbXB1dGVfc3BoZXJlKHByaW1pdGl2ZTogUHJpbWl0aXZlLCBzcGhlcmU/OiBTcGhlcmUsIGJveD86IEJveDMpOiBTcGhlcmUge1xuICAgIHNwaGVyZSA9IHNwaGVyZSA/PyBuZXcgU3BoZXJlKCk7XG4gICAgaWYgKGJveCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHByaW1pdGl2ZV9jb21wdXRlX2JveChwcmltaXRpdmUsIHByaW1pdGl2ZV9iKTtcbiAgICAgICAgc3BoZXJlLmNlbnRlci5jb3B5KHByaW1pdGl2ZV9iLmNlbnRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BoZXJlLmNlbnRlci5jb3B5KGJveC5jZW50ZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IHBvc2l0aW9uID0gcHJpbWl0aXZlX2dldF9hdHRyaWJ1dGUocHJpbWl0aXZlKTtcbiAgICBsZXQgbWF4X3JhZGl1c19zcSA9IDA7XG4gICAgaWYgKHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IHBvc2l0aW9uLmJ1ZmZlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIHByaW1pdGl2ZV92LnJlYWQoYnVmZmVyLCBpKTtcbiAgICAgICAgICAgIG1heF9yYWRpdXNfc3EgPSBNYXRoLm1heChtYXhfcmFkaXVzX3NxLCBwcmltaXRpdmVfdi5kaXN0YW5jZV9zcXVhcmVkKHNwaGVyZS5jZW50ZXIpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzcGhlcmUucmFkaXVzID0gTWF0aC5zcXJ0KG1heF9yYWRpdXNfc3EpO1xuICAgIHJldHVybiBzcGhlcmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmltaXRpdmVfZ2V0X3RyaWFuZ2xlKHByaW1pdGl2ZTogUHJpbWl0aXZlLCBpbmRleDogbnVtYmVyLCB0cmlhbmdsZT86IFRyaWFuZ2xlKTogVHJpYW5nbGUge1xuICAgIHRyaWFuZ2xlID0gdHJpYW5nbGUgPz8gbmV3IFRyaWFuZ2xlKCk7XG4gICAgY29uc3QgaW5kZXhfYnVmZmVyID0gcHJpbWl0aXZlLmluZGV4O1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcHJpbWl0aXZlX2dldF9hdHRyaWJ1dGUocHJpbWl0aXZlKTtcbiAgICBpZiAoIXBvc2l0aW9uKSByZXR1cm4gdHJpYW5nbGU7XG5cbiAgICBpZiAoaW5kZXhfYnVmZmVyKSB7XG4gICAgICAgIHRyaWFuZ2xlLmEucmVhZChwb3NpdGlvbi5idWZmZXIsIGluZGV4X2J1ZmZlcltpbmRleCAqIDNdICogMyk7XG4gICAgICAgIHRyaWFuZ2xlLmIucmVhZChwb3NpdGlvbi5idWZmZXIsIGluZGV4X2J1ZmZlcltpbmRleCAqIDMgKyAxXSAqIDMpO1xuICAgICAgICB0cmlhbmdsZS5jLnJlYWQocG9zaXRpb24uYnVmZmVyLCBpbmRleF9idWZmZXJbaW5kZXggKiAzICsgMl0gKiAzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0cmlhbmdsZS5hLnJlYWQocG9zaXRpb24uYnVmZmVyLCBpbmRleCAqIDkpO1xuICAgICAgICB0cmlhbmdsZS5hLnJlYWQocG9zaXRpb24uYnVmZmVyLCBpbmRleCAqIDkgKyAzKTtcbiAgICAgICAgdHJpYW5nbGUuYS5yZWFkKHBvc2l0aW9uLmJ1ZmZlciwgaW5kZXggKiA5ICsgNik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyaWFuZ2xlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIHByaW1pdGl2ZV90cmlhbmdsZV9pdGVyYXRvcihwcmltaXRpdmU6IFByaW1pdGl2ZSwgdHJpYW5nbGU/OiBUcmlhbmdsZSk6IEl0ZXJhYmxlPFRyaWFuZ2xlPiB7XG4gICAgdHJpYW5nbGUgPSB0cmlhbmdsZSA/PyBuZXcgVHJpYW5nbGUoKTtcbiAgICBjb25zdCBpbmRleF9idWZmZXIgPSBwcmltaXRpdmUuaW5kZXg7XG4gICAgY29uc3QgcG9zaXRpb24gPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUpO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICBjb25zdCBwb3NpdGlvbl9idWZmZXIgPSBwb3NpdGlvbiEuYnVmZmVyO1xuICAgIGlmIChpbmRleF9idWZmZXIpIHtcbiAgICAgICAgY29uc3QgbWF4X3ZlcnRleF9jb3VudCA9IGluZGV4X2J1ZmZlci5sZW5ndGggLyAzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1heF92ZXJ0ZXhfY291bnQ7ICsraSkge1xuICAgICAgICAgICAgdHJpYW5nbGUuYS5yZWFkKHBvc2l0aW9uX2J1ZmZlciwgaW5kZXhfYnVmZmVyW2kgKiAzXSAqIDMpO1xuICAgICAgICAgICAgdHJpYW5nbGUuYi5yZWFkKHBvc2l0aW9uX2J1ZmZlciwgaW5kZXhfYnVmZmVyW2kgKiAzICsgMV0gKiAzKTtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmMucmVhZChwb3NpdGlvbl9idWZmZXIsIGluZGV4X2J1ZmZlcltpICogMyArIDJdICogMyk7XG4gICAgICAgICAgICB5aWVsZCB0cmlhbmdsZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1heF92ZXJ0ZXhfY291bnQgPSBwb3NpdGlvbl9idWZmZXIubGVuZ3RoIC8gOTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXhfdmVydGV4X2NvdW50OyArK2kpIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmEucmVhZChwb3NpdGlvbl9idWZmZXIsIGkgKiA5KTtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmEucmVhZChwb3NpdGlvbl9idWZmZXIsIGkgKiA5ICsgMyk7XG4gICAgICAgICAgICB0cmlhbmdsZS5hLnJlYWQocG9zaXRpb25fYnVmZmVyLCBpICogOSArIDYpO1xuICAgICAgICAgICAgeWllbGQgdHJpYW5nbGU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmltaXRpdmVfZmxpcF9jb29yZGluYXRlX3N5c3RlbShwcmltaXRpdmU6IFByaW1pdGl2ZSk6IFByaW1pdGl2ZSB7XG4gICAgLy8gZmxpcCB0byBsZWZ0LWhhbmQgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICBjb25zdCBwb3NpdGlvbiA9IHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlKHByaW1pdGl2ZSk7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gcG9zaXRpb24hLmJ1ZmZlcjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGJ1ZmZlcltpXSA9IC1idWZmZXJbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbn1cbiIsICJpbXBvcnQgeyBQcmltaXRpdmUsIHByaW1pdGl2ZV9nZXRfYXR0cmlidXRlLCBzZXRfYXR0cmlidXRlIH0gZnJvbSAnLi4vd2ViZ2wvcHJpbWl0aXZlJztcbmltcG9ydCB7IEZsb2F0MiwgRmxvYXQzIH0gZnJvbSAnLi9zaW1kJztcblxuLy8gdG1wIGxldCBmb3IgY29tcHV0ZVxubGV0IHYxOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgdjI6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxubGV0IFY6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxubGV0IFAxOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgUDI6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCBQMzogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG5sZXQgTjE6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCBOMjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xubGV0IE4zOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5cbmxldCBCMTogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xubGV0IEIyOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgQjM6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxubGV0IFQxOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgVDI6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCBUMzogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG5sZXQgdXYxOiBGbG9hdDIgPSBuZXcgRmxvYXQyKCk7XG5sZXQgdXYyOiBGbG9hdDIgPSBuZXcgRmxvYXQyKCk7XG5sZXQgdXYzOiBGbG9hdDIgPSBuZXcgRmxvYXQyKCk7XG5cbmxldCB0bXBWZWM6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCB0bXBGbG9hdDI6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcblxubGV0IGRzdDogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG4vLyB0bXAgbGV0IGZvciBnZW5lcmF0ZVxubGV0IHQ6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCBiOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgbjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xubGV0IHRtcDA6IEZsb2F0MyA9IG5ldyBGbG9hdDMoKTtcbmxldCB0bXAxOiBGbG9hdDMgPSBuZXcgRmxvYXQzKCk7XG5sZXQgdG1wMjogRmxvYXQzID0gbmV3IEZsb2F0MygpO1xuXG4vKipcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jZWRyaWNwaW5zb24vb3NnanMvYmxvYi9tYXN0ZXIvc291cmNlcy9vc2dVdGlsL1RhbmdlbnRTcGFjZUdlbmVyYXRvci5qc1xuICovXG5leHBvcnQgY2xhc3MgVGFuZ2VudEdlbmVyYXRvciB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgVDogRmxvYXQzMkFycmF5IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgc3RhdGljIEI6IEZsb2F0MzJBcnJheSB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIHN0YXRpYyBOOiBGbG9hdDMyQXJyYXkgfCB1bmRlZmluZWQ7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBwcmVwYXJlKHByaW1pdGl2ZTogUHJpbWl0aXZlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHZ4ID0gcHJpbWl0aXZlX2dldF9hdHRyaWJ1dGUocHJpbWl0aXZlLCAncG9zaXRpb24nKSEuYnVmZmVyIGFzIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY29uc3QgbnggPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsICdub3JtYWwnKSEuYnVmZmVyIGFzIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY29uc3QgdHggPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsICd1dicpIS5idWZmZXIgYXMgRmxvYXQzMkFycmF5O1xuICAgICAgICBjb25zdCBpbmRleCA9IHByaW1pdGl2ZS5pbmRleDtcblxuICAgICAgICBsZXQgblZ4O1xuICAgICAgICBpZiAoaW5kZXgpIHtcbiAgICAgICAgICAgIG5WeCA9IGluZGV4Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGFycmF5ID0gaW5kZXg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5WeDsgaSArPSAzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaTEgPSBhcnJheVtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBpMiA9IGFycmF5W2kgKyAxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBpMyA9IGFycmF5W2kgKyAyXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGUodngsIG54LCB0eCwgaTEsIGkyLCBpMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuVnggPSB2eC5sZW5ndGggLyAzO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuVng7IGkgKz0gMykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZSh2eCwgbngsIHR4LCBpLCBpICsgMSwgaSArIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY29tcHV0ZSh2eDogRmxvYXQzMkFycmF5LCBueDogRmxvYXQzMkFycmF5LCB0eDogRmxvYXQzMkFycmF5LCBpMTogbnVtYmVyLCBpMjogbnVtYmVyLCBpMzogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2MSA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIHYyID0gbmV3IEZsb2F0MygpO1xuXG4gICAgICAgICAgICBWID0gbmV3IEZsb2F0MygpO1xuXG4gICAgICAgICAgICBQMSA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIFAyID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgUDMgPSBuZXcgRmxvYXQzKCk7XG5cbiAgICAgICAgICAgIE4xID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgTjIgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgICAgICBOMyA9IG5ldyBGbG9hdDMoKTtcblxuICAgICAgICAgICAgQjEgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgICAgICBCMiA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIEIzID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgVDEgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgICAgICBUMiA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIFQzID0gbmV3IEZsb2F0MygpO1xuXG4gICAgICAgICAgICB1djEgPSBuZXcgRmxvYXQyKCk7XG4gICAgICAgICAgICB1djIgPSBuZXcgRmxvYXQyKCk7XG4gICAgICAgICAgICB1djMgPSBuZXcgRmxvYXQyKCk7XG5cbiAgICAgICAgICAgIHRtcFZlYyA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIHRtcEZsb2F0MiA9IG5ldyBGbG9hdDMoKTtcblxuICAgICAgICAgICAgZHN0ID0gbmV3IEZsb2F0MygpO1xuICAgICAgICB9XG5cbiAgICAgICAgUDEucmVhZCh2eCwgaTEgKiAzKTtcbiAgICAgICAgUDIucmVhZCh2eCwgaTIgKiAzKTtcbiAgICAgICAgUDMucmVhZCh2eCwgaTMgKiAzKTtcblxuICAgICAgICBOMS5yZWFkKG54LCBpMSAqIDMpO1xuICAgICAgICBOMi5yZWFkKG54LCBpMiAqIDMpO1xuICAgICAgICBOMy5yZWFkKG54LCBpMyAqIDMpO1xuXG4gICAgICAgIHV2MS5yZWFkKHR4LCBpMSAqIDIpO1xuICAgICAgICB1djIucmVhZCh0eCwgaTIgKiAyKTtcbiAgICAgICAgdXYzLnJlYWQodHgsIGkzICogMik7XG5cbiAgICAgICAgbGV0IHZ5O1xuICAgICAgICBsZXQgdno7XG5cbiAgICAgICAgVDEuc2V0KDAsIDAsIDApO1xuICAgICAgICBUMi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIFQzLnNldCgwLCAwLCAwKTtcbiAgICAgICAgQjEuc2V0KDAsIDAsIDApO1xuICAgICAgICBCMi5zZXQoMCwgMCwgMCk7XG4gICAgICAgIEIzLnNldCgwLCAwLCAwKTtcblxuICAgICAgICBjb25zdCBzMSA9IHV2Mi54IC0gdXYxLng7XG4gICAgICAgIGNvbnN0IHMyID0gdXYzLnggLSB1djEueDtcbiAgICAgICAgY29uc3QgdDEgPSB1djIueSAtIHV2MS55O1xuICAgICAgICBjb25zdCB0MiA9IHV2My55IC0gdXYxLnk7XG5cbiAgICAgICAgdjEuc2V0KFAyLnggLSBQMS54LCBzMSwgdDEpO1xuICAgICAgICB2Mi5zZXQoUDMueCAtIFAxLngsIHMyLCB0Mik7XG4gICAgICAgIEZsb2F0My5Dcm9zcyh2MSwgdjIsIFYpO1xuICAgICAgICBpZiAoVi54ICE9PSAwLjApIHtcbiAgICAgICAgICAgIFYubm9ybWFsaXplKCk7XG4gICAgICAgICAgICB2eSA9IC1WLnkgLyBWLng7XG4gICAgICAgICAgICB2eiA9IC1WLnogLyBWLng7XG4gICAgICAgICAgICBUMS54ICs9IHZ5O1xuICAgICAgICAgICAgQjEueCArPSB2ejtcbiAgICAgICAgICAgIFQyLnggKz0gdnk7XG4gICAgICAgICAgICBCMi54ICs9IHZ6O1xuICAgICAgICAgICAgVDMueCArPSB2eTtcbiAgICAgICAgICAgIEIzLnggKz0gdno7XG4gICAgICAgIH1cblxuICAgICAgICB2MS5zZXQoUDIueSAtIFAxLnksIHMxLCB0MSk7XG4gICAgICAgIHYyLnNldChQMy55IC0gUDEueSwgczIsIHQyKTtcbiAgICAgICAgRmxvYXQzLkNyb3NzKHYxLCB2MiwgVik7XG4gICAgICAgIGlmIChWLnggIT09IDAuMCkge1xuICAgICAgICAgICAgVi5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIHZ5ID0gLVYueSAvIFYueDtcbiAgICAgICAgICAgIHZ6ID0gLVYueiAvIFYueDtcbiAgICAgICAgICAgIFQxLnkgKz0gdnk7XG4gICAgICAgICAgICBCMS55ICs9IHZ6O1xuICAgICAgICAgICAgVDIueSArPSB2eTtcbiAgICAgICAgICAgIEIyLnkgKz0gdno7XG4gICAgICAgICAgICBUMy55ICs9IHZ5O1xuICAgICAgICAgICAgQjMueSArPSB2ejtcbiAgICAgICAgfVxuXG4gICAgICAgIHYxLnNldChQMi56IC0gUDEueiwgczEsIHQxKTtcbiAgICAgICAgdjIuc2V0KFAzLnogLSBQMS56LCBzMiwgdDIpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3ModjEsIHYyLCBWKTtcbiAgICAgICAgaWYgKFYueCAhPT0gMC4wKSB7XG4gICAgICAgICAgICBWLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgdnkgPSAtVi55IC8gVi54O1xuICAgICAgICAgICAgdnogPSAtVi56IC8gVi54O1xuICAgICAgICAgICAgVDEueiArPSB2eTtcbiAgICAgICAgICAgIEIxLnogKz0gdno7XG4gICAgICAgICAgICBUMi56ICs9IHZ5O1xuICAgICAgICAgICAgQjIueiArPSB2ejtcbiAgICAgICAgICAgIFQzLnogKz0gdnk7XG4gICAgICAgICAgICBCMy56ICs9IHZ6O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgVCA9IHRoaXMuVCE7XG4gICAgICAgIGNvbnN0IEIgPSB0aGlzLkIhO1xuICAgICAgICBjb25zdCBOID0gdGhpcy5OITtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjEsIFQxLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3ModG1wVmVjLCBOMSwgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoVCwgaTEgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoVCwgaTEgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoQjEsIE4xLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjEsIHRtcFZlYywgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoQiwgaTEgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoQiwgaTEgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjIsIFQyLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3ModG1wVmVjLCBOMiwgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoVCwgaTIgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoVCwgaTIgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoQjIsIE4yLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjIsIHRtcFZlYywgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoQiwgaTIgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoQiwgaTIgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjMsIFQzLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3ModG1wVmVjLCBOMywgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoVCwgaTMgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoVCwgaTMgKiAzKTtcblxuICAgICAgICBGbG9hdDMuQ3Jvc3MoQjMsIE4zLCB0bXBWZWMpO1xuICAgICAgICBGbG9hdDMuQ3Jvc3MoTjMsIHRtcFZlYywgdG1wRmxvYXQyKTtcbiAgICAgICAgZHN0LnJlYWQoQiwgaTMgKiAzKVxuICAgICAgICAgICAgLmFkZCh0bXBGbG9hdDIpXG4gICAgICAgICAgICAud3JpdGUoQiwgaTMgKiAzKTtcblxuICAgICAgICBkc3QucmVhZChOLCBpMSAqIDMpXG4gICAgICAgICAgICAuYWRkKE4xKVxuICAgICAgICAgICAgLndyaXRlKE4sIGkxICogMyk7XG4gICAgICAgIGRzdC5yZWFkKE4sIGkyICogMylcbiAgICAgICAgICAgIC5hZGQoTjIpXG4gICAgICAgICAgICAud3JpdGUoTiwgaTIgKiAzKTtcbiAgICAgICAgZHN0LnJlYWQoTiwgaTMgKiAzKVxuICAgICAgICAgICAgLmFkZChOMylcbiAgICAgICAgICAgIC53cml0ZShOLCBpMyAqIDMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZW5lcmF0ZShwcmltaXRpdmU6IFByaW1pdGl2ZSk6IHZvaWQge1xuICAgICAgICBpZiAodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0ID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgbiA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIGIgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgICAgICB0bXAwID0gbmV3IEZsb2F0MygpO1xuICAgICAgICAgICAgdG1wMSA9IG5ldyBGbG9hdDMoKTtcbiAgICAgICAgICAgIHRtcDIgPSBuZXcgRmxvYXQzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBwcmltaXRpdmVfZ2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsICdwb3NpdGlvbicpIS5idWZmZXI7XG4gICAgICAgIGNvbnN0IHNpemUgPSBwb3NpdGlvbi5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5UID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcbiAgICAgICAgdGhpcy5CID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcbiAgICAgICAgdGhpcy5OID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblxuICAgICAgICB0aGlzLnByZXBhcmUocHJpbWl0aXZlKTtcblxuICAgICAgICBjb25zdCBuRWxlbWVudHMgPSBzaXplIC8gMztcbiAgICAgICAgY29uc3QgdGFuZ2VudHMgPSBuZXcgRmxvYXQzMkFycmF5KG5FbGVtZW50cyAqIDQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5FbGVtZW50czsgKytpKSB7XG4gICAgICAgICAgICB0LnJlYWQodGhpcy5ULCBpICogMyk7XG4gICAgICAgICAgICBiLnJlYWQodGhpcy5CLCBpICogMyk7XG4gICAgICAgICAgICBuLnJlYWQodGhpcy5OLCBpICogMyk7XG5cbiAgICAgICAgICAgIG4ubm9ybWFsaXplKCkud3JpdGUodGhpcy5OLCBpICogMyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG50ID0gRmxvYXQzLkRvdChuLCB0KTtcbiAgICAgICAgICAgIHRtcDEuY29weShuKS5tdWwobnQpO1xuICAgICAgICAgICAgdG1wMC5jb3B5KHQpLnN1Yih0bXAxKTtcbiAgICAgICAgICAgIHRtcDIuY29weSh0bXAwKS5ub3JtYWxpemUoKTtcblxuICAgICAgICAgICAgRmxvYXQzLkNyb3NzKG4sIHQsIHRtcDApO1xuICAgICAgICAgICAgbGV0IHNpZ24gPSBGbG9hdDMuRG90KHRtcDAsIGIpO1xuICAgICAgICAgICAgc2lnbiA9IHNpZ24gPCAwID8gLTEgOiAxO1xuXG4gICAgICAgICAgICBjb25zdCB0aSA9IGkgKiA0O1xuICAgICAgICAgICAgdGFuZ2VudHNbdGldID0gdG1wMi54O1xuICAgICAgICAgICAgdGFuZ2VudHNbdGkgKyAxXSA9IHRtcDIueTtcbiAgICAgICAgICAgIHRhbmdlbnRzW3RpICsgMl0gPSB0bXAyLno7XG4gICAgICAgICAgICB0YW5nZW50c1t0aSArIDNdID0gc2lnbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldF9hdHRyaWJ1dGUocHJpbWl0aXZlLCB7XG4gICAgICAgICAgICBidWZmZXI6IHRhbmdlbnRzLFxuICAgICAgICAgICAgc3RyaWRlOiA0LFxuICAgICAgICAgICAgbmFtZTogJ3RhbmdlbnQnLFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0X2F0dHJpYnV0ZShwcmltaXRpdmUsIHsgYnVmZmVyOiB0aGlzLk4sIHN0cmlkZTogMywgbmFtZTogJ25vcm1hbCcgfSk7XG5cbiAgICAgICAgdGhpcy5UID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLkIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuTiA9IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbmNvbnN0IHRhbmdlbnRHZW5lcmF0b3IgPSBuZXcgVGFuZ2VudEdlbmVyYXRvcigpO1xuZXhwb3J0IGRlZmF1bHQgdGFuZ2VudEdlbmVyYXRvcjtcbiIsICJpbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vZW5naW5lJztcblxuZXhwb3J0IGNvbnN0IGJ1aWxpbl9tZXNoZXM6IE1hcDxzdHJpbmcsIE1lc2g+ID0gbmV3IE1hcDxzdHJpbmcsIE1lc2g+KCk7IiwgImltcG9ydCB7IE1lc2gsIFZlcnRleERhdGEgfSBmcm9tICcuLi9lbmdpbmUnO1xuaW1wb3J0IHsgQm94MyB9IGZyb20gJy4uL21hdGgnO1xuaW1wb3J0IHsgYnVpbGluX21lc2hlcyB9IGZyb20gJy4vYnVpbHRpbl9tZXNoJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZV9ib3hfbWVzaCgpOiBNZXNoIHtcbiAgICBsZXQgYnVpbHRpbl9ib3ggPSBidWlsaW5fbWVzaGVzLmdldCgnYm94Jyk7XG4gICAgaWYgKGJ1aWx0aW5fYm94KSByZXR1cm4gYnVpbHRpbl9ib3g7XG4gICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgICAgLTEsIDEsIC0xLCAxLCAxLCAxLCAxLCAxLCAtMSwgMSwgMSwgMSwgLTEsIC0xLCAxLCAxLCAtMSwgMSwgLTEsIDEsIDEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgMSwgMSwgLTEsIC0xLCAtMSwgLTEsIDEsIC0xLCAtMSwgLTEsIDEsIDEsIC0xLCAxLCAtMSwgMSwgMSwgLTEsIC0xLCAtMSwgMSwgLTEsIDEsIC0xLCAtMSwgLTEsIC0xLCAtMSwgLTEsXG4gICAgICAgIDEsIDEsIC0xLCAxLCAxLCAtMSwgMSwgLTEsIDEsIC0xLCAxLCAxLCAxLCAxLCAxLCAxLCAtMSxcbiAgICBdKTtcbiAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgICAgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgLTEsIDAsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMCwgMCwgLTEsIDAsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgLTEsIDAsIDAsIC0xLCAwLCAwLCAtMSwgMCwgMSwgMCwgMCwgMCwgMSwgLTEsIDAsXG4gICAgICAgIDAsIDAsIC0xLCAwLCAxLCAwLCAwLCAwLCAwLCAtMSxcbiAgICBdKTtcbiAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAwLjg3NSwgMC41LCAwLjYyNSwgMC43NSwgMC42MjUsIDAuNSwgMC42MjUsIDAuNzUsIDAuMzc1LCAxLCAwLjM3NSwgMC43NSwgMC42MjUsIDAsIDAuMzc1LCAwLjI1LCAwLjM3NSwgMCwgMC4zNzUsIDAuNSwgMC4xMjUsIDAuNzUsIDAuMTI1LCAwLjUsIDAuNjI1LCAwLjUsIDAuMzc1LCAwLjc1LCAwLjM3NSwgMC41LCAwLjYyNSwgMC4yNSxcbiAgICAgICAgMC4zNzUsIDAuNSwgMC4zNzUsIDAuMjUsIDAuODc1LCAwLjc1LCAwLjYyNSwgMSwgMC42MjUsIDAuMjUsIDAuMzc1LCAwLjc1LCAwLjYyNSwgMC43NSwgMC42MjUsIDAuNSxcbiAgICBdKTtcbiAgICBjb25zdCBpbmRleCA9IG5ldyBVaW50MzJBcnJheShbMCwgMiwgMSwgMywgNSwgNCwgNiwgOCwgNywgOSwgMTEsIDEwLCAxMiwgMTQsIDEzLCAxNSwgMTcsIDE2LCAwLCAxLCAxOCwgMywgNCwgMTksIDYsIDcsIDIwLCA5LCAxMCwgMjEsIDEyLCAxMywgMjIsIDE1LCAxNiwgMjNdKTtcbiAgICBjb25zdCB2ZXJ0ZXhfZGF0YSA9IHsgcG9zaXRpb24sIG5vcm1hbCwgdXYsIGluZGV4IH0gYXMgVmVydGV4RGF0YTtcbiAgICBjb25zdCBzdWJfbWVzaGVzID0gW3sgbWF0ZXJpYWxfaW5kZXg6IC0xLCB2ZXJ0ZXhfc3RhcnQ6IDAsIHZlcnRleF9jb3VudDogMjQsIGluZGV4X3N0YXJ0OiAwLCBpbmRleF9jb3VudDogMzYsIGluZGV4ZWQ6IHRydWUgfV07XG4gICAgY29uc3QgYm94ID0gbmV3IEJveDMoKTtcbiAgICBib3gubWluLnNldCgtMSwgLTEsIC0xKTtcbiAgICBib3gubWF4LnNldCgxLCAxLCAxKTtcbiAgICBidWlsdGluX2JveCA9IHsgdmVydGV4X2RhdGEsIHN1Yl9tZXNoZXMsIG5hbWU6ICdidWlsdGluIGJveCcsIG1hdGVyaWFsczogW10sIGJveCB9IGFzIE1lc2g7XG4gICAgYnVpbGluX21lc2hlcy5zZXQoJ2JveCcsIGJ1aWx0aW5fYm94KTtcbiAgICByZXR1cm4gYnVpbHRpbl9ib3g7XG59IiwgImltcG9ydCB7IERlcHRoQ29tcGFyZUZ1bmMsIE1hdDQsIFBpcGVsaW5lLCBVbmlmb3JtVHlwZSwgY3JlYXRlX3BpcGVsaW5lIH0gZnJvbSBcIkB1bmlvbl9uYXRpdmUvY29yZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlX2RlZmF1bHRfcGlwZWxpbmUoKTogUGlwZWxpbmUge1xuICAgIGNvbnN0IHZlcnRleF9zaGFkZXIgPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG4gICAgbGF5b3V0KGxvY2F0aW9uID0gMCkgaW4gdmVjMyBwb3NpdGlvbjtcbiAgICBsYXlvdXQobG9jYXRpb24gPSAxKSBpbiB2ZWMyIHV2O1xuXG4gICAgdW5pZm9ybSBtYXQ0IHdvcmxkX21hdHJpeDtcblxuICAgIHVuaWZvcm0gZnJhbWVfYmxvY2sge1xuICAgICAgICBtYXQ0IHZpZXdfbWF0cml4O1xuICAgICAgICBtYXQ0IHByb2plY3Rpb25fbWF0cml4O1xuICAgIH07XG5cbiAgICBvdXQgdmVjMiB2X3V2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2X3V2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbl9tYXRyaXggKiB2aWV3X21hdHJpeCAqIHdvcmxkX21hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XG4gICAgfVxuICAgIGA7XG5cbiAgICBjb25zdCBmcmFnbWVudF9zaGFkZXIgPSBgI3ZlcnNpb24gMzAwIGVzXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG4gICAgaW4gdmVjMiB2X3V2O1xuICAgIG91dCB2ZWM0IGZyYWdfZGF0YTtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZnJhZ19kYXRhID0gdmVjNCh2X3V2LCAwLjAsIDEuMCk7XG4gICAgfVxuICAgIGA7XG5cbiAgICByZXR1cm4gY3JlYXRlX3BpcGVsaW5lKHtcbiAgICAgICAgbmFtZTogXCJkZWZhdWx0IHBpcGVsaW5lXCIsXG4gICAgICAgIHZlcnRleF9zaGFkZXIsXG4gICAgICAgIGZyYWdtZW50X3NoYWRlcixcbiAgICAgICAgdW5pZm9ybXM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogXCJ3b3JsZF9tYXRyaXhcIiwgdHlwZTogVW5pZm9ybVR5cGUuTWF0NCwgZGVmYXVsdF92YWx1ZTogbmV3IE1hdDQoKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImZyYW1lX2Jsb2NrLnZpZXdfbWF0cml4XCIsIHR5cGU6IFVuaWZvcm1UeXBlLk1hdDQgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJmcmFtZV9ibG9jay5wcm9qZWN0aW9uX21hdHJpeFwiLCB0eXBlOiBVbmlmb3JtVHlwZS5NYXQ0IH1cbiAgICAgICAgXSxcbiAgICAgICAgYmxlbmQ6IHsgZW5hYmxlZDogZmFsc2V9LFxuICAgICAgICBkZXB0aF93cml0ZTogdHJ1ZSxcbiAgICAgICAgZGVwdGhfY29tcGFyZV9mdW5jOiBEZXB0aENvbXBhcmVGdW5jLkFsd2F5c1xuICAgIH0pITtcbn1cbiIsICJpbXBvcnQgeyBDYW1lcmEsIENvbG9yUkdCQSwgY3JlYXRlX2JveF9tZXNoLCBjcmVhdGVfZ3B1X21lc2gsIEVuZ2luZSwgRW5naW5lRXZlbnQsIEV2ZW50SHViLCBHRlhEZXZpY2UsIEdQVUFjdGlvbiwgR1BVQWN0aW9uVHlwZSwgTWF0NCwgTWF0ZXJpYWxCbG9jaywgU3BoZXJpY2FsQ29udHJvbCwgWkVSTyB9IGZyb20gXCJAdW5pb25fbmF0aXZlL2NvcmVcIjtcbmltcG9ydCB7IGNyZWF0ZV9kZWZhdWx0X3BpcGVsaW5lIH0gZnJvbSBcIi4vcGlwZWxpbmVcIjtcblxuXG5jb25zdCBkZXZpY2UgPSBuZXcgR0ZYRGV2aWNlKCk7XG5jb25zdCBlbmNvZGVyID0gZGV2aWNlLmVuY29kZXI7XG5jb25zdCBlbmdpbmUgPSBuZXcgRW5naW5lKCk7XG5cbmNvbnN0IGNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcbmNhbWVyYS5sb2NhdGlvbi5zZXQoNCwgNCwgNCk7XG5jYW1lcmEubG9va19hdChaRVJPKTtcbmNhbWVyYS5wZXJzcGVjdGl2ZSg0NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDEsIDEwMDApO1xuY29uc3QgY29udHJvbCA9IG5ldyBTcGhlcmljYWxDb250cm9sKGNhbWVyYSk7XG5jb25zdCBwaXBlbGluZSA9IGNyZWF0ZV9kZWZhdWx0X3BpcGVsaW5lKCk7XG5jb25zdCBtYXRlcmlhbCA9IG5ldyBNYXRlcmlhbEJsb2NrKCk7XG5tYXRlcmlhbC5zZXRfbWF0NChcIndvcmxkX21hdHJpeFwiLCBuZXcgTWF0NCgpKTtcblxuY29uc3QgYWN0aW9uID0ge1xuICAgIGNsZWFyX2NvbG9yOiBuZXcgQ29sb3JSR0JBKDAuMSwgMC4yLCAwLjMsIDEpLFxuICAgIGNsZWFyX2RlcHRoOiAxLFxuICAgIHR5cGU6IEdQVUFjdGlvblR5cGUuQ2xlYXJBbGxcbn0gYXMgR1BVQWN0aW9uO1xuXG5jb25zdCBjdWJlID0gY3JlYXRlX2JveF9tZXNoKCk7XG5mdW5jdGlvbiBmcmFtZSgpIHtcbiAgICBjb250cm9sLnVwZGF0ZSgpO1xuICAgIGVuY29kZXIuY2xlYXIoYWN0aW9uKTtcbiAgICBlbmNvZGVyLnNldF9waXBlbGluZShwaXBlbGluZSk7XG4gICAgZW5jb2Rlci5zZXRfY2FtZXJhKGNhbWVyYSk7XG4gICAgZW5jb2Rlci5zZXRfbWF0ZXJpYWxfYmxvY2sobWF0ZXJpYWwpO1xuICAgIGVuY29kZXIuZHJhd19tZXNoKGNyZWF0ZV9ncHVfbWVzaChjdWJlKSk7XG4gICAgZW5jb2Rlci5jb21taXQoKTtcbn1cblxuRXZlbnRIdWIub24oRW5naW5lRXZlbnQuRnJhbWUsIGZyYW1lKTtcblxuZW5naW5lLnN0YXJ0KCk7Il0sCiAgIm1hcHBpbmdzIjogIjs7O0FBRU8sTUFBTSxpQkFBTixNQUFNLGdCQUFlO0FBQUEsSUFLeEIsWUFBbUIsUUFBcUIsU0FBaUIsR0FBRyxjQUFzQixPQUFPLFlBQVk7QUFBbEY7QUFDZixXQUFLLFdBQVcsSUFBSSxhQUFhLFFBQVEsUUFBUSxjQUFjLENBQUM7QUFDaEUsV0FBSyxXQUFXLElBQUksWUFBWSxRQUFRLFFBQVEsY0FBYyxDQUFDO0FBQy9ELFdBQUssVUFBVSxJQUFJLFdBQVcsUUFBUSxRQUFRLFdBQVc7QUFBQSxJQUM3RDtBQUFBLElBUkE7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBUUEsU0FBUyxPQUFvQjtBQUN6QixhQUFPLElBQUksZ0JBQWUsS0FBSyxRQUFRLE1BQU0sYUFBYSxNQUFNLFdBQVc7QUFBQSxJQUMvRTtBQUFBLEVBQ0o7OztBQ2RPLE1BQU0sYUFBTixNQUFzQztBQUFBLElBQ2pDLE1BQWlCLG9CQUFJLElBQUk7QUFBQSxJQUN6QixPQUFpQixDQUFDO0FBQUEsSUFFMUIsWUFBWSxRQUE4RjtBQUN0RyxVQUFJLFFBQVE7QUFDUixZQUFJLGtCQUFrQixPQUFPO0FBQ3pCLGlCQUFPLFFBQVEsQ0FBQyxTQUFTO0FBQ3JCLGlC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QU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDbEQsU0FBRyxDQUFDLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxTQUFHLENBQUMsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELFNBQUcsRUFBRSxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFFbkQsU0FBRyxDQUFDLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxTQUFHLENBQUMsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELFNBQUcsQ0FBQyxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDbEQsU0FBRyxFQUFFLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUVuRCxTQUFHLENBQUMsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ2xELFNBQUcsQ0FBQyxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDbEQsU0FBRyxFQUFFLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNuRCxTQUFHLEVBQUUsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBRW5ELFNBQUcsQ0FBQyxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFDbEQsU0FBRyxDQUFDLElBQUksTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNsRCxTQUFHLEVBQUUsSUFBSSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNO0FBQ25ELFNBQUcsRUFBRSxJQUFJLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFFbkQsYUFBT0E7QUFBQSxJQUNYO0FBQUEs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QUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDO0FBQUEsUUFFSjtBQUNJLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakM7QUFBQSxRQUVKO0FBQ0ksVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQztBQUFBLFFBRUo7QUFDSSxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDO0FBQUEsUUFFSjtBQUNJLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakMsVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUNqQyxVQUFBQSxLQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pDLFVBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakM7QUFBQSxRQUVKO0FBQ0ksVUFBQUEsS0FBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FB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STtBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBSTtBQUFBLE1BQUk7QUFBQSxNQUFJO0FBQUEsTUFBSTtBQUFBLE1BQ2hNO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLElBQ3hELENBQUM7QUFDRCxVQUFNRSxVQUFTLElBQUksYUFBYTtBQUFBLE1BQzVCO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBSTtBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUk7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFJO0FBQUEsTUFBRztBQUFBLE1BQUc7QUFBQSxNQUFHO0FBQUEsTUFBRztBQUFB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QUksT0FBTztBQUMxQixTQUFPLFNBQVMsSUFBSSxHQUFHLEdBQUcsQ0FBQztBQUMzQixTQUFPLFFBQVEsSUFBSTtBQUNuQixTQUFPLFlBQVksSUFBSSxPQUFPLGFBQWEsT0FBTyxhQUFhLEdBQUcsR0FBSTtBQUN0RSxNQUFNLFVBQVUsSUFBSSxpQkFBaUIsTUFBTTtBQUMzQyxNQUFNLFdBQVcsd0JBQXdCO0FBQ3pDLE1BQU0sV0FBVyxJQUFJLGNBQWM7QUFDbkMsV0FBUyxTQUFTLGdCQUFnQixJQUFJQyxNQUFLLENBQUM7QUFFNUMsTUFBTSxTQUFTO0FBQUEsSUFDWCxhQUFhLElBQUlDLFdBQVUsS0FBSyxLQUFLLEtBQUssQ0FBQztBQUFBLElBQzNDLGFBQWE7QUFBQSxJQUNiO0FBQUEsRUFDSjtBQUVBLE1BQU0sT0FBTyxnQkFBZ0I7QUFDN0IsV0FBUyxRQUFRO0FBQ2IsWUFBUSxPQUFPO0FBQ2YsWUFBUSxNQUFNLE1BQU07QUFDcEIsWUFBUSxhQUFhLFFBQVE7QUFDN0IsWUFBUSxXQUFXLE1BQU07QUFDekIsWUFBUSxtQkFBbUIsUUFBUTtBQUNuQyxZQUFRLFVBQVUsZ0JBQWdCLElBQUksQ0FBQztBQUN2QyxZQUFRLE9BQU87QUFBQSxFQUNuQjtBQUVBLFdBQVMsR0FBRyxZQUFZLE9BQU8sS0FBSztBQUVwQyxTQUFPLE1BQU07IiwKICAibmFtZXMiOiBbImIiLCAidCIsICJGbG9hdDIiLCAieCIsICJ5IiwgIm4iLCAiYiIsICJkc3QiLCAieiIsICJGbG9hdDQiLCAiYiIsICJDb2xvclJHQkEiLCAiRmxvYXQ0IiwgImIiLCAiZHN0IiwgIk1hdDQiLCAiZHN0IiwgIngiLCAieSIsICJ6IiwgIngyIiwgInkyIiwgInoyIiwgImIiLCAiTWF0NCIsICJ2IiwgIm4iLCAieCIsICJ5IiwgInQiLCAiYiIsICJ4IiwgInkiLCAieiIsICJkc3QiLCAidCIsICJiIiwgInYiLCAiZHN0IiwgIk1hdDQiLCAiTWF0NCIsICJjYW1lcmEiLCAidiIsICJGbG9hdDIiLCAiUmVuZGVyQ29tbWFuZFR5cGUiLCAieCIsICJ5IiwgImNhbWVyYSIsICJhY3Rpb24iLCAicGlwZWxpbmUiLCAibWF0ZXJpYWwiLCAiQ29sb3JSR0JBIiwgImRlZmF1bHRfdmFsdWUiLCAiZGV2aWNlIiwgImVuY29kZXIiLCAicGlwZWxpbmUiLCAibiIsICJwaXBlbGluZSIsICJlbmNvZGVyIiwgImRlZmF1bHRfdmFsdWUiLCAiQ29sb3JSR0JBIiwgImNhbWVyYSIsICJhY3Rpb24iLCAieCIsICJ5IiwgInBpcGVsaW5lIiwgIm1hdGVyaWFsIiwgImNhbWVyYSIsICJ2IiwgImVuY29kZXIiLCAidjIiLCAiRmxvYXQyIiwgIm5vcm1hbCIsICJNYXQ0IiwgIk1hdDQiLCAiQ29sb3JSR0JBIl0KfQo=
