"use strict";
(() => {
  var Cp = class {
      constructor() {
        this.released = [];
        this.heap_size = 4096;
        this.life_cycle = 1024;
        this.life_index = 0;
        this.manage = () => {
          this.life_index = this.life_index++ % this.life_cycle;
        };
        (this.buffer = new ArrayBuffer(this.heap_size)), (this.tail = 0);
      }
      alloc(e, r) {
        let o = r.BYTES_PER_ELEMENT,
          n = this.tail,
          i = e * o;
        return (
          (this.tail = this.tail + i + (4 - (i % 4))),
          {
            range: { start: n, count: i },
            stride: o,
            buffer: new r(this.buffer, n, e),
          }
        );
      }
      free(e) {
        this.released.push(e.range);
      }
    },
    Eb = new Cp();
  function Db(t, e) {
    return Eb.alloc(t, e);
  }
  function Gb() {
    Eb.manage();
  }
  var CT = 1,
    LT = CT * 1024,
    zT = LT * 1024,
    NT = zT * 1024,
    BT = NT * 1024,
    rk = BT * 1024;
  function Ub(t) {
    return t.size !== void 0 && t.elements !== void 0;
  }
  function Mb(t) {
    return Array.from(t.elements);
  }
  function Cb(t) {
    let e = "",
      r = new Uint8Array(t);
    for (let o = 0; o < r.byteLength; o++) e += String.fromCharCode(r[o]);
    return e;
  }
  function Lb(t, e, r) {
    return t.slice(0, e) + r + t.slice(e);
  }
  function zb(t, e, r) {
    return t.slice(0, e) + t.slice(r);
  }
  function As(t, e) {
    if (t >= 65 && t <= 90) {
      let r = String.fromCharCode(t);
      return e ? r : r.toLowerCase();
    } else
      switch (t) {
        case 48:
          return e ? ")" : "0";
        case 49:
          return e ? "!" : "1";
        case 50:
          return e ? "@" : "2";
        case 51:
          return e ? "#" : "3";
        case 52:
          return e ? "$" : "4";
        case 53:
          return e ? "%" : "5";
        case 54:
          return e ? "^" : "6";
        case 55:
          return e ? "&" : "7";
        case 56:
          return e ? "*" : "8";
        case 57:
          return e ? "(" : "9";
        case 189:
          return e ? "_" : "-";
        case 187:
          return e ? "+" : "=";
        case 219:
          return e ? "{" : "[";
        case 221:
          return e ? "}" : "]";
        case 220:
          return e ? "|" : "\\";
        case 188:
          return e ? "<" : ",";
        case 190:
          return e ? ">" : ".";
        case 191:
          return e ? "?" : "/";
        case 192:
          return e ? "~" : "`";
        case 186:
          return e ? ":" : ";";
        case 222:
          return e ? '"' : "'";
        case 32:
          return " ";
        case 9:
          return "  ";
      }
    return "";
  }
  var mk = new TextDecoder("utf8");
  async function Tr(t) {
    return new Promise(function (e) {
      fetch(t).then(function (r) {
        r.arrayBuffer().then(function (o) {
          e(o);
        });
      });
    });
  }
  async function st(t) {
    return new Promise(function (e) {
      fetch(t).then(function (r) {
        r.text().then(function (o) {
          e(o);
        });
      });
    });
  }
  function na() {
    let t = new Date().getTime(),
      e =
        (typeof performance < "u" &&
          performance.now &&
          performance.now() * 1e3) ||
        0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (r) {
        let o = Math.random() * 16;
        return (
          t > 0
            ? ((o = (t + o) % 16 | 0), (t = Math.floor(t / 16)))
            : ((o = (e + o) % 16 | 0), (e = Math.floor(e / 16))),
          (r === "x" ? o : (o & 3) | 8).toString(16)
        );
      },
    );
  }
  function Lp(t, e = 1994) {
    let r, o, n, i, a, s, c, _, l, u;
    for (
      r = t.length & 3,
        o = t.length - r,
        n = e,
        a = 3432918353,
        c = 461845907,
        u = 0;
      u < o;

    )
      (l =
        (t.charCodeAt(u) & 255) |
        ((t.charCodeAt(++u) & 255) << 8) |
        ((t.charCodeAt(++u) & 255) << 16) |
        ((t.charCodeAt(++u) & 255) << 24)),
        ++u,
        (l =
          ((l & 65535) * a + ((((l >>> 16) * a) & 65535) << 16)) & 4294967295),
        (l = (l << 15) | (l >>> 17)),
        (l =
          ((l & 65535) * c + ((((l >>> 16) * c) & 65535) << 16)) & 4294967295),
        (n ^= l),
        (n = (n << 13) | (n >>> 19)),
        (i =
          ((n & 65535) * 5 + ((((n >>> 16) * 5) & 65535) << 16)) & 4294967295),
        (n = (i & 65535) + 27492 + ((((i >>> 16) + 58964) & 65535) << 16));
    switch (((l = 0), r)) {
      case 3:
        l ^= (t.charCodeAt(u + 2) & 255) << 16;
      case 2:
        l ^= (t.charCodeAt(u + 1) & 255) << 8;
      case 1:
        (l ^= t.charCodeAt(u) & 255),
          (l =
            ((l & 65535) * a + ((((l >>> 16) * a) & 65535) << 16)) &
            4294967295),
          (l = (l << 15) | (l >>> 17)),
          (l =
            ((l & 65535) * c + ((((l >>> 16) * c) & 65535) << 16)) &
            4294967295),
          (n ^= l);
    }
    return (
      (n ^= t.length),
      (n ^= n >>> 16),
      (n =
        ((n & 65535) * 2246822507 +
          ((((n >>> 16) * 2246822507) & 65535) << 16)) &
        4294967295),
      (n ^= n >>> 13),
      (n =
        ((n & 65535) * 3266489909 +
          ((((n >>> 16) * 3266489909) & 65535) << 16)) &
        4294967295),
      (n ^= n >>> 16),
      n >>> 0
    );
  }
  function zp(t) {
    let e = 1;
    for (; Math.abs(t) >= 10; ) (t /= 10), e++;
    return e;
  }
  function Nb(t) {
    if (!t) return "";
    let e = t.split("/");
    for (; e[e.length - 1] === ""; ) e.pop();
    return e.pop(), e.join("/");
  }
  function ks(t = "") {
    return t.split(/\./g).pop() ?? "";
  }
  function Np(t) {
    return t.split(/\//g).pop() ?? "";
  }
  function Yc(t = "") {
    let e = Np(t);
    if (e !== void 0) return e.split(/\./g).shift();
  }
  function Gt(...t) {
    if (!t) return "";
    if (t.length === 1) return t[0];
    let e = "";
    for (let r = 0; r < t.length; ++r) {
      let o = t[r];
      if (!o) continue;
      let n = o.length - 1;
      for (; o[n] === "/"; ) n--;
      n < 0 ||
        ((o = o.substr(0, n + 1)), (e += o), r !== t.length - 1 && (e += "/"));
    }
    return e;
  }
  function Jc() {
    let t = navigator.userAgent;
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      t,
    ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        t.substring(0, 4),
      )
      ? 0
      : /(macintosh|macintel|macppc|mac68k|macos)/i.test(t)
        ? 1
        : 2;
  }
  function Bb(t) {
    t === 0
      ? (window.location.href = window.location.origin + "/mobile.html")
      : (t === 1 || t === 2) &&
        (window.location.href = window.location.origin + "/os.html");
  }
  function Xe(t) {
    return typeof t == "string" || t instanceof String;
  }
  function $r(t) {
    return typeof t == "number" && isFinite(t);
  }
  function ia(t, e) {
    let r = t.split(/\./g).pop();
    return r && e.indexOf(r) !== -1 ? r : !1;
  }
  function se(t, e) {
    return t === void 0 ? e : t;
  }
  function Ps(t) {
    if (t !== void 0) return t.deref();
  }
  var Kc = class {
    get is_root() {
      return this.parent === void 0;
    }
    get left() {
      return this._left;
    }
    get right() {
      return this._right;
    }
    set left(e) {
      e !== void 0 && ((this._left = e), (e.parent = this));
    }
    set right(e) {
      e !== void 0 && ((this._right = e), (e.parent = this));
    }
    get is_leaf() {
      return this.left === void 0 && this.right === void 0;
    }
  };
  function Bp(t) {
    if (!t.is_root) {
      if (t === t.parent.left) return t.parent.right;
      if (t === t.parent.right) return t.parent.left;
      throw "invalid situation";
    }
  }
  function WT(t) {
    return Math.ceil((t + 1) / 4) * 4;
  }
  var $e = class {
    constructor(e, r, o) {
      this.size = 0;
      this.capacity = 4096;
      this.grow = 4096;
      this.growable = !0;
      e === void 0
        ? (this.buffer = new ArrayBuffer(this.grow))
        : e.byteLength % 4 === 0
          ? ((this.buffer = e),
            (this.capacity = se(r, e.byteLength)),
            (this.size = se(o, e.byteLength)))
          : ((this.buffer = new ArrayBuffer(
              e.byteLength + 4 - (e.byteLength % 4),
            )),
            (this.capacity = se(r, e.byteLength)),
            (this.size = se(o, e.byteLength)),
            new Uint8Array(this.buffer).set(new Uint8Array(e))),
        (this.u8_view = new Uint8Array(this.buffer)),
        (this.u32_view = new Uint32Array(this.buffer)),
        (this.i32_view = new Int32Array(this.buffer)),
        (this.float_view = new Float32Array(this.buffer));
    }
    copy(e) {
      return (
        e.capacity !== this.capacity
          ? (this.buffer = e.buffer.slice(0))
          : this.u8_view.set(e.u8_view),
        (this.capacity = e.capacity),
        (this.size = e.size),
        (this.grow = e.grow),
        (this.growable = e.growable),
        this
      );
    }
    clone() {
      let e = new $e(this.buffer.slice(0), this.capacity, this.size);
      return (e.grow = this.grow), (e.growable = this.growable), e;
    }
    resize(e) {
      if (e < this.capacity) return this;
      this.capacity = Math.ceil(e / 4) * 4;
      let r = this.buffer;
      return (
        (this.buffer = new ArrayBuffer(this.capacity)),
        new Uint8Array(this.buffer).set(new Uint8Array(r)),
        this.update_view(),
        this
      );
    }
    update_view() {
      (this.u8_view = new Uint8Array(this.buffer)),
        (this.u32_view = new Uint32Array(this.buffer)),
        (this.i32_view = new Int32Array(this.buffer)),
        (this.float_view = new Float32Array(this.buffer));
    }
    grow_guard(e, r) {
      r = se(r, this.size);
      let o = 0;
      if (e > this.grow * 4) {
        (this.grow = Math.ceil(e / this.grow) * this.grow + this.capacity),
          (this.capacity = this.grow);
        let n = this.buffer;
        (this.buffer = new ArrayBuffer(this.grow)),
          new Uint8Array(this.buffer).set(new Uint8Array(n)),
          this.update_view();
      } else
        for (; r + e >= this.capacity; ) {
          if (!this.growable) throw "exceed buffer capacity";
          let n = this.buffer;
          (this.capacity += this.grow),
            (this.buffer = new ArrayBuffer(this.capacity)),
            new Uint8Array(this.buffer).set(new Uint8Array(n)),
            this.update_view(),
            o >= 2 && ((o = 0), (this.grow *= 2));
        }
    }
    clear() {
      this.size = 0;
    }
    write_u8(e, r) {
      return (
        this.grow_guard(1, r),
        (r = se(r, this.size)),
        (this.u8_view[r] = e),
        this.size++,
        r
      );
    }
    write_string(e, r) {
      this.grow_guard(e.length + 1, r),
        (r = se(r, this.size)),
        this.write_u8(e.length, r),
        (r += 1);
      for (let n = 0; n < e.length; ++n) this.u8_view[r + n] = e.charCodeAt(n);
      let o = WT(e.length + 1);
      return (this.size += o - 1), r;
    }
    write_float(e, r) {
      return (
        this.grow_guard(4, r),
        (r = se(r, this.size)),
        (this.float_view[r >>> 2] = e),
        (this.size += 4),
        r
      );
    }
    write_i32(e, r) {
      return (
        this.grow_guard(4, r),
        (r = se(r, this.size)),
        (this.i32_view[r >>> 2] = e),
        (this.size += 4),
        r
      );
    }
    write_u32(e, r) {
      return (
        this.grow_guard(4, r),
        (r = se(r, this.size)),
        (this.u32_view[r >>> 2] = e),
        (this.size += 4),
        r
      );
    }
    write_bool(e, r) {
      return (
        this.grow_guard(1, r),
        (r = se(r, this.size)),
        (this.u8_view[r] = e ? 1 : 0),
        (this.size += 1),
        r
      );
    }
    write_array_buffer(e, r) {
      let o = e.byteLength;
      return (
        this.grow_guard(o, r),
        (r = se(r, this.size)),
        this.u8_view.set(new Uint8Array(e), r),
        (this.size += o),
        r
      );
    }
    write_u8_buffer(e, r) {
      let o = e.byteLength;
      return (
        this.grow_guard(o, r),
        (r = se(r, this.size)),
        this.u8_view.set(e, r),
        (this.size += o),
        r
      );
    }
    read_u8(e) {
      return (e = se(e, this.size - 1)), this.u8_view[e];
    }
    read_u32(e) {
      return (e = se(e, this.size - 1)), this.u32_view[e >>> 2];
    }
    read_i32(e) {
      return (e = se(e, this.size - 1)), this.i32_view[e >>> 2];
    }
    read_float(e) {
      return (e = se(e, this.size - 1)), this.float_view[e >>> 2];
    }
    read_string(e) {
      let r = "";
      e = se(e, this.size - 1);
      let o = this.read_u8(e);
      for (let n = 0; n < o; ++n)
        r += String.fromCharCode(this.u8_view[e + n + 1]);
      return r;
    }
    read_array_buffer(e, r) {
      return (
        (e = e === void 0 ? 0 : e),
        (r = r === void 0 ? this.size : r),
        this.buffer.slice(e, e + r)
      );
    }
    read_u8_array(e, r, o) {
      (e = se(e, 0)),
        (r = se(r, this.size - 1)),
        (o = se(o, new Uint8Array(r)));
      for (let n = 0; n < r; ++n) o[n] = this.u8_view[e + n];
      return o;
    }
    serialize(e) {
      return e === void 0
        ? {
            buffer: this.buffer.slice(0),
            size: this.size,
            capacity: this.capacity,
            growable: this.growable,
            grow: this.grow,
          }
        : {
            buffer: 0,
            size: this.size,
            capacity: this.capacity,
            growable: this.growable,
            grow: this.grow,
            offset: e.write_array_buffer(this.buffer),
          };
    }
    static deserialize(e, r) {
      if (r !== void 0 && e.buffer === 0) {
        let o = r.read_array_buffer(e.offset, e.capacity);
        return new $e(o, e.capacity, e.size);
      } else return new $e(e.buffer, e.capacity, e.size);
    }
  };
  var Es = class {
    constructor(e) {
      this.map = new Map();
      this.list = [];
      if (e) {
        if (e instanceof Array)
          e.forEach((r) => {
            this.map.set(r.key, r.value), this.list.push(r.key);
          });
        else if (typeof e[Symbol.iterator] == "function")
          for (let r of e) this.map.set(r.key, r.value), this.list.push(r.key);
        else if (typeof e == "object") {
          this.list = Object.getOwnPropertyNames(e).sort();
          let r = e;
          for (let o of this.list) this.map.set(o, r[o]);
        }
      }
    }
    set(e, r) {
      this.map.has(e) || this.list.push(e), this.map.set(e, r);
    }
    get(e) {
      return this.map.get(e);
    }
    at(e) {
      if (!(e < 0 || e > this.list.length - 1))
        return this.map.get(this.list[e]);
    }
    replace_at(e, r, o) {
      if (e < 0 || e > this.list.length - 1) return;
      let n = this.list[e];
      (this.list[e] = r),
        (o = o ?? this.map.get(n)),
        this.map.delete(n),
        this.map.set(r, o);
    }
    replace(e, r, o) {
      let n = this.list.indexOf(e);
      n < 0 || this.replace_at(n, r, o);
    }
    delete(e) {
      this.map.has(e) &&
        (this.map.delete(e), this.list.splice(this.list.indexOf(e), 1));
    }
    delete_at(e) {
      e < 0 || e > this.list.length - 1 || this.delete(this.list[e]);
    }
    has(e) {
      return this.map.has(e);
    }
    clear() {
      (this.list = []), this.map.clear();
    }
    *[Symbol.iterator]() {
      for (let e = 0; e < this.list.length; ++e) {
        let r = this.list[e];
        yield [r, this.map.get(r)];
      }
    }
  };
  var Wb = new Map(),
    Ob = new WeakMap();
  function S(t) {
    let e = Wb.get(t);
    if (
      (e || ((e = { free: new Set(), preserved: new Set() }), Wb.set(t, e)),
      e.free.size > 0)
    ) {
      let r = e.free.values().next().value;
      return e.free.delete(r), e.preserved.add(r), r;
    } else {
      let r = new t();
      return Ob.set(r, e), e.preserved.add(r), r;
    }
  }
  function R(t) {
    let e = Ob.get(t);
    if (!e) {
      console.log(`[pool] pool_return: pool for ${t} not found`);
      return;
    }
    if (!e.preserved.has(t)) {
      console.log("[pool] pool_return: instance not found in pool");
      return;
    }
    e.preserved.delete(t), e.free.add(t);
  }
  var pn = class {
    constructor() {
      this.children = [];
    }
    get is_root() {
      return this.parent === void 0;
    }
    add(e) {
      (this.can_add && this.can_add(e)) ||
        (e.parent && e.parent.remove(e),
        this.children.push(e),
        (e.parent = this));
    }
    remove(e) {
      let r = this.children.indexOf(e);
      r > -1 && (this.children.splice(r, 1), (e.parent = void 0));
    }
    has(e) {
      return this.children.indexOf(e) > -1;
    }
    serialize() {}
    deserialize(e) {}
  };
  function Hb(t) {
    let e = [],
      r = new WeakMap(),
      o = [t],
      n = 0;
    for (; o.length > 0; ) {
      let a = o.shift(),
        s = n++,
        c = OT(a, s);
      r.set(a, c), e.push(c);
      for (let _ of a.children) o.push(_);
      if (a.parent) {
        let _ = r.get(a.parent);
        _ && _.children.push(s);
      }
    }
    return { nodes: e };
  }
  function OT(t, e) {
    return { id: e, data: t.serialize?.(), children: [] };
  }
  function Vb(t, e) {
    let r = new Map();
    for (let n of t.nodes) {
      let i = HT(n, e);
      r.set(n.id, i);
    }
    for (let n of t.nodes) {
      let i = r.get(n.id);
      for (let a of n.children) {
        let s = r.get(a);
        i.add(s);
      }
    }
    return r.get(0);
  }
  function HT(t, e) {
    let r = new (e ?? pn)();
    return r.deserialize?.(t.data), r;
  }
  function bo(t, e) {
    e(t);
    for (let r = 0; r < t.children.length; ++r) bo(t.children[r], e);
  }
  var dn = class {
    constructor(e, r, o, n) {
      (this.index_size = o || 0),
        (this.value_size = n || 0),
        (this.index_to_value = e || {}),
        (this.value_to_index = r || {});
    }
    clone() {
      let e = Object.assign({}, this.index_to_value),
        r = Object.assign({}, this.value_to_index);
      return new dn(e, r, this.index_size, this.value_size);
    }
    add() {
      return (
        (this.index_to_value[this.index_size] = this.value_size),
        (this.value_to_index[this.value_size] = this.index_size),
        this.value_size++,
        this.index_size++
      );
    }
    get(e) {
      return this.index_to_value[e];
    }
    remove(e) {
      if (e >= this.index_size) return;
      let r = this.index_to_value[e],
        o = this.value_to_index[this.value_size - 1];
      return (
        (this.index_to_value[o] = r),
        (this.index_to_value[e] = -1),
        (this.value_to_index[this.value_size - 1] = -1),
        (this.value_to_index[r] = this.value_size - 1),
        this.value_size--,
        r
      );
    }
    serialize() {
      return {
        index_to_value: this.index_to_value,
        value_to_index: this.value_to_index,
        index_size: this.index_size,
        value_size: this.value_size,
      };
    }
    static deserialize(e) {
      return new dn(
        e.index_to_value,
        e.value_to_index,
        e.index_size,
        e.value_size,
      );
    }
  };
  var cr = Math.PI / 180,
    Yk = 180 / Math.PI;
  var wi = 1e-4;
  function Q(t, e, r) {
    return Math.max(Math.min(t, r), e);
  }
  function Ue(t, e, r) {
    return t + (e - t) * r;
  }
  var jb = 0;
  function qr() {
    jb++;
  }
  function Xb() {
    return jb;
  }
  var T = class {
      constructor(e = 0, r = 0) {
        this.size = 2;
        this.elements = new Float32Array(2);
        this.set(e, r), qr();
      }
      get x() {
        return this.elements[0];
      }
      set x(e) {
        this.elements[0] = e;
      }
      get y() {
        return this.elements[1];
      }
      set y(e) {
        this.elements[1] = e;
      }
      read(e, r = 0) {
        return (this.elements[0] = e[r]), (this.elements[1] = e[r + 1]), this;
      }
      write(e, r = 0) {
        return (e[r] = this.elements[0]), (e[r + 1] = this.elements[1]), this;
      }
      set(e, r) {
        return (this.elements[0] = e), (this.elements[1] = r), this;
      }
      copy(e) {
        return this.elements.set(e.elements), this;
      }
      clone() {
        return new T(this.elements[0], this.elements[1]);
      }
      rotate(e, r) {
        r === void 0 && (r = VT);
        let o = Math.cos(e),
          n = Math.sin(e),
          i = this.elements[0] - r.x,
          a = this.elements[1] - r.y;
        return (
          (this.elements[0] = i * o - a * n + r.x),
          (this.elements[1] = i * n + a * o + r.y),
          this
        );
      }
      distance(e) {
        return Math.sqrt(this.distance_squared(e));
      }
      get length() {
        return Math.sqrt(
          this.elements[0] * this.elements[0] +
            this.elements[1] * this.elements[1],
        );
      }
      normalize() {
        let e = 1 / this.length;
        return (this.elements[0] *= e), (this.elements[1] *= e), this;
      }
      add(e) {
        return (
          (this.elements[0] += e.elements[0]),
          (this.elements[1] += e.elements[1]),
          this
        );
      }
      sub(e) {
        return (
          (this.elements[0] -= e.elements[0]),
          (this.elements[1] -= e.elements[1]),
          this
        );
      }
      mul(e) {
        return (this.elements[0] *= e), (this.elements[1] *= e), this;
      }
      dot(e) {
        return (
          this.elements[0] * e.elements[0] + this.elements[1] * e.elements[1]
        );
      }
      lerp(e, r) {
        return T.Lerp(this, e, r, this);
      }
      distance_squared(e) {
        let r = this.elements[0] - e.elements[0],
          o = this.elements[1] - e.elements[1];
        return r * r + o * o;
      }
      toString() {
        return `[${this.elements[0]}, ${this.elements[1]}]`;
      }
      static Lerp(e, r, o, n) {
        return (
          n || (n = new T()),
          (n.x = e.elements[0] + (r.x - e.elements[0]) * o),
          (n.y = e.elements[1] + (r.y - e.elements[1]) * o),
          n
        );
      }
    },
    VT = new T(),
    wt = class {
      constructor(e = 0, r = 0, o = 0) {
        this.size = 3;
        this.elements = new Float32Array(3);
        this.set(e, r, o), qr();
      }
      get x() {
        return this.elements[0];
      }
      set x(e) {
        this.elements[0] = e;
      }
      get y() {
        return this.elements[1];
      }
      set y(e) {
        this.elements[1] = e;
      }
      get z() {
        return this.elements[2];
      }
      set z(e) {
        this.elements[2] = e;
      }
      read(e, r = 0) {
        return (
          (this.elements[0] = e[r]),
          (this.elements[1] = e[r + 1]),
          (this.elements[2] = e[r + 2]),
          this
        );
      }
      write(e, r = 0) {
        return (
          (e[r] = this.elements[0]),
          (e[r + 1] = this.elements[1]),
          (e[r + 2] = this.elements[2]),
          this
        );
      }
      set(e, r, o) {
        return (
          (this.elements[0] = e),
          (this.elements[1] = r),
          (this.elements[2] = o),
          this
        );
      }
      cross(e) {
        return wt.Cross(this, e, this);
      }
      from_spherical(e) {
        return wt.FromSpherical(e, this);
      }
      apply_quaternion(e) {
        return wt.ApplyQuaternion(this, e, this);
      }
      transform_direction(e) {
        let r = this.elements[0],
          o = this.elements[1],
          n = this.elements[2],
          i = e.elements;
        return (
          (this.elements[0] = i[0] * r + i[4] * o + i[8] * n),
          (this.elements[1] = i[1] * r + i[5] * o + i[9] * n),
          (this.elements[2] = i[2] * r + i[6] * o + i[10] * n),
          this.normalize()
        );
      }
      add(e) {
        return (
          (this.elements[0] += e.elements[0]),
          (this.elements[1] += e.elements[1]),
          (this.elements[2] += e.elements[2]),
          this
        );
      }
      sub(e) {
        return (
          (this.elements[0] -= e.elements[0]),
          (this.elements[1] -= e.elements[1]),
          (this.elements[2] -= e.elements[2]),
          this
        );
      }
      mul(e) {
        return (
          (this.elements[0] *= e),
          (this.elements[1] *= e),
          (this.elements[2] *= e),
          this
        );
      }
      mul_v(e) {
        return (
          (this.elements[0] *= e.elements[0]),
          (this.elements[1] *= e.elements[1]),
          (this.elements[2] *= e.elements[2]),
          this
        );
      }
      div(e) {
        return (
          (this.elements[0] /= e),
          (this.elements[1] /= e),
          (this.elements[2] /= e),
          this
        );
      }
      div_v(e) {
        return (
          (this.elements[0] /= e.elements[0]),
          (this.elements[1] /= e.elements[1]),
          (this.elements[2] /= e.elements[2]),
          this
        );
      }
      copy(e) {
        return (
          (this.elements[0] = e.elements[0]),
          (this.elements[1] = e.elements[1]),
          (this.elements[2] = e.elements[2]),
          this
        );
      }
      clone() {
        return new wt(this.elements[0], this.elements[1], this.elements[2]);
      }
      lerp(e, r) {
        return wt.Lerp(this, e, r, this);
      }
      apply_mat4(e) {
        return wt.MultiplyMat4(this, e, this);
      }
      apply_mat4_directional(e) {
        return wt.MultiplyMat4Directional(this, e, this);
      }
      distance(e) {
        return Math.sqrt(this.distance_squared(e));
      }
      get length_square() {
        return (
          this.elements[0] * this.elements[0] +
          this.elements[1] * this.elements[1] +
          this.elements[2] * this.elements[2]
        );
      }
      get length() {
        return Math.sqrt(
          this.elements[0] * this.elements[0] +
            this.elements[1] * this.elements[1] +
            this.elements[2] * this.elements[2],
        );
      }
      dot(e) {
        return (
          this.elements[0] * e.elements[0] +
          this.elements[1] * e.elements[1] +
          this.elements[2] * e.elements[2]
        );
      }
      min(e) {
        return (
          (this.elements[0] = Math.min(this.elements[0], e.elements[0])),
          (this.elements[1] = Math.min(this.elements[1], e.elements[1])),
          (this.elements[2] = Math.min(this.elements[2], e.elements[2])),
          this
        );
      }
      max(e) {
        return (
          (this.elements[0] = Math.max(this.elements[0], e.elements[0])),
          (this.elements[1] = Math.max(this.elements[1], e.elements[1])),
          (this.elements[2] = Math.max(this.elements[2], e.elements[2])),
          this
        );
      }
      normalize() {
        let e = 1 / this.length;
        return (
          (this.elements[0] *= e),
          (this.elements[1] *= e),
          (this.elements[2] *= e),
          this
        );
      }
      distance_squared(e) {
        let r = this.elements[0] - e.elements[0],
          o = this.elements[1] - e.elements[1],
          n = this.elements[2] - e.elements[2];
        return r * r + o * o + n * n;
      }
      toString() {
        return `[${this.elements[0]}, ${this.elements[1]}, ${this.elements[2]}]`;
      }
      static IsZero(e) {
        return e.x === 0 && e.y === 0 && e.z === 0;
      }
      static Equals(e, r) {
        return (
          e.elements[0] === r.elements[0] &&
          e.elements[1] === r.elements[1] &&
          e.elements[2] === r.elements[2]
        );
      }
      static Abs(e, r) {
        return (
          (r.x = Math.abs(e.x)), (r.y = Math.abs(e.y)), (r.z = Math.abs(e.z)), r
        );
      }
      static Clamp(e, r, o, n) {
        return (
          (n.x = Q(e.x, r.x, o.x)),
          (n.y = Q(e.y, r.y, o.y)),
          (n.z = Q(e.z, r.z, o.z)),
          n
        );
      }
      static Set(e, r, o, n) {
        return (n.x = e), (n.y = r), (n.z = o), n;
      }
      static Copy(e, r) {
        return (r.x = e.x), (r.y = e.y), (r.z = e.z), r;
      }
      static Swap(e, r) {
        ([e.elements[0], r.x] = [r.x, e.elements[0]]),
          ([e.elements[1], r.y] = [r.y, e.elements[1]]),
          ([e.elements[2], r.z] = [r.z, e.elements[2]]);
      }
      static Add(e, r, o) {
        return (
          (o.x = e.elements[0] + r.x),
          (o.y = e.elements[1] + r.y),
          (o.z = e.elements[2] + r.z),
          o
        );
      }
      static Subtract(e, r, o) {
        return (
          (o.x = e.elements[0] - r.x),
          (o.y = e.elements[1] - r.y),
          (o.z = e.elements[2] - r.z),
          o
        );
      }
      static Distance(e, r) {
        return e.distance(r);
      }
      static Normalize(e, r) {
        let o = 1 / e.length;
        return (r.x *= o), (r.y *= o), (r.z *= o), r;
      }
      static Multiply(e, r, o) {
        return (
          (o.x = e.elements[0] * r),
          (o.y = e.elements[1] * r),
          (o.z = e.elements[2] * r),
          o
        );
      }
      static MultiplyFloat3(e, r, o) {
        return (
          (o.x = e.elements[0] * r.x),
          (o.y = e.elements[1] * r.y),
          (o.z = e.elements[2] * r.z),
          o
        );
      }
      static ApplyQuaternion(e, r, o) {
        o = o ?? new wt();
        let n = e.elements[0],
          i = e.elements[1],
          a = e.elements[2],
          s = r.x,
          c = r.y,
          _ = r.z,
          l = r.w,
          u = l * n + c * a - _ * i,
          d = l * i + _ * n - s * a,
          p = l * a + s * i - c * n,
          m = -s * n - c * i - _ * a;
        return (
          (o.x = u * l + m * -s + d * -_ - p * -c),
          (o.y = d * l + m * -c + p * -s - u * -_),
          (o.z = p * l + m * -_ + u * -c - d * -s),
          o
        );
      }
      static Dot(e, r) {
        return e.elements[0] * r.x + e.elements[1] * r.y + e.elements[2] * r.z;
      }
      static Cross(e, r, o = new wt()) {
        let n = e.elements[0],
          i = e.elements[1],
          a = e.elements[2],
          s = r.x,
          c = r.y,
          _ = r.z;
        return (
          (o.x = i * _ - a * c), (o.y = a * s - n * _), (o.z = n * c - i * s), o
        );
      }
      static FromSpherical(e, r = new wt()) {
        let o = Math.sin(e.theta) * e.radius;
        return (
          (r.x = o * Math.sin(e.phi)),
          (r.y = Math.cos(e.theta) * e.radius),
          (r.z = o * Math.cos(e.phi)),
          r
        );
      }
      static Lerp(e, r, o, n) {
        return (
          (n.x = Ue(e.elements[0], r.x, o)),
          (n.y = Ue(e.elements[1], r.y, o)),
          (n.z = Ue(e.elements[2], r.z, o)),
          n
        );
      }
      static AddMultiplied(e, r, o, n) {
        return (
          (n.x = e.elements[0] + r.x * o),
          (n.y = e.elements[1] + r.y * o),
          (n.z = e.elements[2] + r.z * o),
          n
        );
      }
      static MultiplyMat4(e, r, o) {
        let n = e.elements[0],
          i = e.elements[1],
          a = e.elements[2],
          s = r.elements,
          c = 1 / (s[3] * n + s[7] * i + s[11] * a + s[15]);
        return (
          (o.x = (s[0] * n + s[4] * i + s[8] * a + s[12]) * c),
          (o.y = (s[1] * n + s[5] * i + s[9] * a + s[13]) * c),
          (o.z = (s[2] * n + s[6] * i + s[10] * a + s[14]) * c),
          o
        );
      }
      static MultiplyMat3(e, r, o) {
        let n = e.elements[0],
          i = e.elements[1],
          a = e.elements[2],
          s = r.elements;
        return (
          (o.x = s[0] * n + s[3] * i + s[6] * a),
          (o.y = s[1] * n + s[4] * i + s[7] * a),
          (o.z = s[2] * n + s[5] * i + s[8] * a),
          o
        );
      }
      static MultiplyMat4Directional(e, r, o) {
        let n = e.elements[0],
          i = e.elements[1],
          a = e.elements[2],
          s = r.elements;
        return (
          (o.x = s[0] * n + s[4] * i + s[8] * a),
          (o.y = s[1] * n + s[5] * i + s[9] * a),
          (o.z = s[2] * n + s[6] * i + s[10] * a),
          o
        );
      }
    },
    b = wt;
  (b.ZERO = new wt(0, 0, 0)),
    (b.ONE = new wt(1, 1, 1)),
    (b.X = new wt(1, 0, 0)),
    (b.Y = new wt(0, 1, 0)),
    (b.Z = new wt(0, 0, 1)),
    (b.NEGATIVE_X = new wt(-1, 0, 0)),
    (b.NEGATIVE_Y = new wt(0, -1, 0)),
    (b.NEGATIVE_Z = new wt(0, 0, -1));
  var M = class {
    constructor(e = 0, r = 0, o = 0, n = 0) {
      this.size = 4;
      this.elements = new Float32Array(4);
      this.set(e, r, o, n), qr();
    }
    get x() {
      return this.elements[0];
    }
    set x(e) {
      this.elements[0] = e;
    }
    get y() {
      return this.elements[1];
    }
    set y(e) {
      this.elements[1] = e;
    }
    get z() {
      return this.elements[2];
    }
    set z(e) {
      this.elements[2] = e;
    }
    get w() {
      return this.elements[3];
    }
    set w(e) {
      this.elements[3] = e;
    }
    read(e, r = 0) {
      return (
        (this.elements[0] = e[r]),
        (this.elements[1] = e[r + 1]),
        (this.elements[2] = e[r + 2]),
        (this.elements[3] = e[r + 3]),
        this
      );
    }
    write(e, r = 0) {
      return (
        (e[r] = this.elements[0]),
        (e[r + 1] = this.elements[1]),
        (e[r + 2] = this.elements[2]),
        (e[r + 3] = this.elements[3]),
        this
      );
    }
    set(e, r, o, n) {
      return (
        (this.elements[0] = e),
        (this.elements[1] = r),
        (this.elements[2] = o),
        (this.elements[3] = n),
        this
      );
    }
    copy(e) {
      return this.elements.set(e.elements), this;
    }
    apply_mat4(e) {
      return M.MultiplyMat4(this, e, this);
    }
    clone() {
      return new M(
        this.elements[0],
        this.elements[1],
        this.elements[2],
        this.elements[3],
      );
    }
    all_zero() {
      return (
        this.elements[0] === 0 &&
        this.elements[1] === 0 &&
        this.elements[2] === 0 &&
        this.elements[3] === 0
      );
    }
    toString() {
      return `[${this.elements[0]}, ${this.elements[1]}, ${this.elements[2]}, ${this.elements[3]}]`;
    }
    mul(e) {
      return (
        (this.elements[0] *= e),
        (this.elements[1] *= e),
        (this.elements[2] *= e),
        (this.elements[3] *= e),
        this
      );
    }
    lerp(e, r) {
      return M.Lerp(this, e, r, this), this;
    }
    static Lerp(e, r, o, n) {
      return (
        (n.x = Ue(e.x, r.x, o)),
        (n.y = Ue(e.y, r.y, o)),
        (n.y = Ue(e.z, r.z, o)),
        (n.y = Ue(e.w, r.w, o)),
        n
      );
    }
    static MultiplyMat4(e, r, o) {
      let n = e.elements[0],
        i = e.elements[1],
        a = e.elements[2],
        s = e.elements[3],
        c = r.elements;
      return (
        (o.x = c[0] * n + c[4] * i + c[8] * a + c[12] * s),
        (o.y = c[1] * n + c[5] * i + c[9] * a + c[13] * s),
        (o.z = c[2] * n + c[6] * i + c[10] * a + c[14] * s),
        (o.w = c[3] * n + c[7] * i + c[11] * a + c[15] * s),
        o
      );
    }
  };
  var mn = [
      new b(),
      new b(),
      new b(),
      new b(),
      new b(),
      new b(),
      new b(),
      new b(),
    ],
    be = class {
      constructor(e, r) {
        this.min = new b();
        this.max = new b();
        this._size = new b();
        this._center = new b();
        e !== void 0
          ? this.min.copy(e)
          : this.min.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE),
          r !== void 0
            ? this.max.copy(r)
            : this.max.set(
                -Number.MAX_VALUE,
                -Number.MAX_VALUE,
                -Number.MAX_VALUE,
              );
      }
      get size() {
        return this._size.copy(this.max).sub(this.min);
      }
      get center() {
        return this._center.copy(this.size).mul(0.5).add(this.min);
      }
      set(e, r) {
        return this.min.copy(e), this.max.copy(r), this;
      }
      copy(e) {
        return this.min.copy(e.min), this.max.copy(e.max), this;
      }
      clone() {
        return new be(this.min, this.max);
      }
      reset() {
        return (
          this.min.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE),
          this.max.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE),
          this
        );
      }
      expand_point(e) {
        return this.min.min(e), this.max.max(e), this;
      }
      expand_box(e) {
        return this.min.min(e.min), this.max.max(e.max), this;
      }
      apply_mat4(e) {
        mn[0].set(this.min.x, this.min.y, this.min.z).apply_mat4(e),
          mn[1].set(this.min.x, this.min.y, this.max.z).apply_mat4(e),
          mn[2].set(this.min.x, this.max.y, this.min.z).apply_mat4(e),
          mn[3].set(this.min.x, this.max.y, this.max.z).apply_mat4(e),
          mn[4].set(this.max.x, this.min.y, this.min.z).apply_mat4(e),
          mn[5].set(this.max.x, this.min.y, this.max.z).apply_mat4(e),
          mn[6].set(this.max.x, this.max.y, this.min.z).apply_mat4(e),
          mn[7].set(this.max.x, this.max.y, this.max.z).apply_mat4(e),
          this.reset();
        for (let r = 0; r < 8; ++r) this.expand_point(mn[r]);
        return this;
      }
      write(e, r = 0) {
        return this.min.write(e, r), this.max.write(e, r + 3), this;
      }
      read(e, r = 0) {
        return this.min.read(e, r), this.max.read(e, r + 3), this;
      }
      set_center(e) {
        let r = this.size,
          o = r.x * 0.5,
          n = r.y * 0.5,
          i = r.z * 0.5;
        return (
          (this.min.x = e.x - o),
          (this.min.y = e.y - n),
          (this.min.z = e.z - i),
          (this.max.x = e.x + o),
          (this.max.y = e.y + n),
          (this.max.z = e.z + i),
          this
        );
      }
      set_size(e) {
        let r = this.center,
          o = e.x * 0.5,
          n = e.y * 0.5,
          i = e.z * 0.5;
        return (
          (this.min.x = r.x - o),
          (this.min.y = r.y - n),
          (this.min.z = r.z - i),
          (this.max.x = r.x + o),
          (this.max.y = r.y + n),
          (this.max.z = r.z + i),
          this
        );
      }
      get invalid() {
        return (
          this.min.x === 1 / 0 ||
          this.min.y === 1 / 0 ||
          this.min.z === 1 / 0 ||
          this.max.x === -1 / 0 ||
          this.max.y === -1 / 0 ||
          this.max.z === -1 / 0
        );
      }
      static Overlapped(e, r) {
        let o = !0;
        return (
          (o = e.min.x > r.max.x || e.max.x < r.min.x ? !1 : o),
          (o = e.min.y > r.max.y || e.max.y < r.min.y ? !1 : o),
          (o = e.min.z > r.max.z || e.max.z < r.min.z ? !1 : o),
          o
        );
      }
    };
  function e_(t) {
    return (
      (t = Q(Math.ceil(t * 255), 0, 255)),
      t < 16 ? "0" + t.toString(16) : t.toString(16)
    );
  }
  var H = class extends M {
      get r() {
        return this.elements[0];
      }
      set r(e) {
        this.elements[0] = e;
      }
      get g() {
        return this.elements[1];
      }
      set g(e) {
        this.elements[1] = e;
      }
      get b() {
        return this.elements[2];
      }
      set b(e) {
        this.elements[2] = e;
      }
      get a() {
        return this.elements[3];
      }
      set a(e) {
        this.elements[3] = e;
      }
      constructor(e = 0, r = 0, o = 0, n = 1) {
        super(e, r, o, n);
      }
      copy(e) {
        return super.copy(e), this;
      }
      clone() {
        return new H().copy(this);
      }
      read(e, r = 0) {
        return (
          (this.elements[0] = e[r]),
          (this.elements[1] = e[r + 1]),
          (this.elements[2] = e[r + 2]),
          (this.elements[3] = e[r + 3]),
          this
        );
      }
      write(e, r = 0) {
        return (
          (e[r] = this.elements[0]),
          (e[r + 1] = this.elements[1]),
          (e[r + 2] = this.elements[2]),
          (e[r + 3] = this.elements[3]),
          this
        );
      }
      set_hex_string(e) {
        let r = e;
        if (!r) return this;
        if (
          (r[0] === "#"
            ? (r = r.substr(1))
            : r[0] === "0" && r[1] === "x" && (r = r.substr(2)),
          r.length === 3)
        )
          (this.r = parseInt(r[0], 16) / 15),
            (this.g = parseInt(r[1], 16) / 15),
            (this.b = parseInt(r[2], 16) / 15),
            (this.a = 1);
        else if (r.length === 4)
          (this.r = parseInt(r[0], 16) / 15),
            (this.g = parseInt(r[1], 16) / 15),
            (this.b = parseInt(r[2], 16) / 15),
            (this.a = parseInt(r[3], 16) / 15);
        else if (r.length === 6)
          (this.r = parseInt(r.substr(0, 2), 16) / 255),
            (this.g = parseInt(r.substr(2, 2), 16) / 255),
            (this.b = parseInt(r.substr(4, 2), 16) / 255),
            (this.a = 1);
        else if (r.length === 8)
          (this.r = parseInt(r.substr(0, 2), 16) / 255),
            (this.g = parseInt(r.substr(2, 2), 16) / 255),
            (this.b = parseInt(r.substr(4, 2), 16) / 255),
            (this.a = parseInt(r.substr(6, 2), 16) / 255);
        else throw `invalid hex value ${e}`;
        return this;
      }
      set_hex(e) {
        return (
          e > 16777215
            ? ((this.r = ((e & 4278190080) >>> 24) / 255),
              (this.g = ((e & 16711680) >>> 16) / 255),
              (this.b = ((e & 65280) >>> 8) / 255),
              (this.a = (e & 255) / 255))
            : ((this.r = ((e & 16711680) >>> 16) / 255),
              (this.g = ((e & 65280) >>> 8) / 255),
              (this.b = (e & 255) / 255),
              (this.a = 1)),
          this
        );
      }
      to_hex() {
        let e = ((this.r * 255) & 255) << 24,
          r = ((this.g * 255) & 255) << 16,
          o = ((this.b * 255) & 255) << 8,
          n = (this.a * 255) & 255;
        return e | r | o | n;
      }
      to_hex_string() {
        return e_(this.r) + e_(this.g) + e_(this.b) + e_(this.a);
      }
      set_rgba_byte(e, r, o, n) {
        return (
          (this.r = e / 255),
          (this.g = r / 255),
          (this.b = o / 255),
          (this.a = n / 255),
          this
        );
      }
      tone(e) {
        return (this.r *= e), (this.g *= e), (this.b *= e), this;
      }
      tone_scalar(e) {
        return (this.r += e), (this.g += e), (this.b += e), this;
      }
      from_float3(e) {
        return (
          (this.r = e.x), (this.g = e.y), (this.b = e.z), (this.a = 1), this
        );
      }
      from_float4(e) {
        return (
          (this.r = e.x), (this.g = e.y), (this.b = e.z), (this.a = e.w), this
        );
      }
      to_float3(e) {
        return (
          (e = e ?? new b()), (e.x = this.r), (e.y = this.g), (e.z = this.b), e
        );
      }
      to_float4(e) {
        return (
          (e = e ?? new M()),
          (e.x = this.r),
          (e.y = this.g),
          (e.z = this.b),
          (e.w = this.a),
          e
        );
      }
      toString() {
        return `[${this.r}, ${this.g}, ${this.b}, ${this.a}]`;
      }
      to_array() {
        return [this.r, this.g, this.b, this.a];
      }
    },
    aa = class extends b {
      constructor(r = 0, o = 0, n = 1) {
        super(r, o, n);
        this.hue = r;
        this.saturation = o;
        this.lightness = n;
      }
      toString() {
        return `[${this.hue}, ${this.saturation}, ${this.lightness}]`;
      }
    },
    Ds = class extends b {
      constructor(r = 0, o = 0, n = 1) {
        super(r, o, n);
        this.hue = r;
        this.saturation = o;
        this.value = n;
      }
      toString() {
        return `[${this.hue}, ${this.saturation}, ${this.value}]`;
      }
    };
  function t_(t, e) {
    let r = t.r,
      o = t.g,
      n = t.b,
      i = Math.max(r, o, n),
      a = Math.min(r, o, n),
      s = 0,
      c = 0,
      _ = (i + a) * 0.5;
    if (i === a) s = c = 0;
    else {
      let l = i - a;
      switch (((c = _ > 0.5 ? l / (2 - i - a) : l / (i + a)), i)) {
        case r:
          s = (o - n) / l + (o < n ? 6 : 0);
          break;
        case o:
          s = (n - r) / l + 2;
          break;
        case n:
          s = (r - o) / l + 4;
          break;
      }
      s /= 6;
    }
    return (
      (e = e ?? new aa()), (e.hue = s), (e.saturation = c), (e.lightness = _), e
    );
  }
  function Wp(t, e, r) {
    return (
      r < 0 && (r += 1),
      r > 1 && (r -= 1),
      r < 1 / 6
        ? t + (e - t) * 6 * r
        : r < 1 / 2
          ? e
          : r < 2 / 3
            ? t + (e - t) * (2 / 3 - r) * 6
            : t
    );
  }
  function Mn(t, e) {
    let r = 0,
      o = 0,
      n = 0,
      i = t.saturation,
      a = t.hue,
      s = t.lightness;
    if (i === 0) r = o = n = s;
    else {
      let c = s < 0.5 ? s * (1 + i) : s + i - s * i,
        _ = 2 * s - c;
      (r = Wp(_, c, a + 1 / 3)), (o = Wp(_, c, a)), (n = Wp(_, c, a - 1 / 3));
    }
    return (e = e ?? new H()), (e.r = r), (e.g = o), (e.b = n), e;
  }
  function $b(t, e) {
    let r = t.hue,
      o = t.saturation,
      n = t.value,
      i = Math.floor(r * 6),
      a = r * 6 - i,
      s = n * (1 - o),
      c = n * (1 - a * o),
      _ = n * (1 - (1 - a) * o),
      l = 0,
      u = 0,
      d = 0;
    switch (i % 6) {
      case 0:
        (l = n), (u = _), (d = s);
        break;
      case 1:
        (l = c), (u = n), (d = s);
        break;
      case 2:
        (l = s), (u = n), (d = _);
        break;
      case 3:
        (l = s), (u = c), (d = n);
        break;
      case 4:
        (l = _), (u = s), (d = n);
        break;
      case 5:
        (l = n), (u = s), (d = c);
        break;
    }
    return (e = e ?? new H()), (e.r = l), (e.g = u), (e.b = d), e;
  }
  function r_(t, e) {
    let r = t.r,
      o = t.g,
      n = t.b,
      i = Math.max(r, o, n),
      a = Math.min(r, o, n),
      s = 0,
      c = i,
      _ = i - a,
      l = i === 0 ? 0 : _ / i;
    if (i === a) s = 0;
    else {
      switch (i) {
        case r:
          s = (o - n) / _ + (o < n ? 6 : 0);
          break;
        case o:
          s = (n - r) / _ + 2;
          break;
        case n:
          s = (r - o) / _ + 4;
          break;
      }
      s /= 6;
    }
    return (
      (e = e ?? new Ds()), (e.hue = s), (e.saturation = l), (e.value = c), e
    );
  }
  var Co = new b(),
    Gs = new b(),
    _r = new b(),
    Op = new b(),
    jT = new b(0, 1, 0),
    lr = class {
      constructor() {
        this.size = 16;
        this.elements = new Float32Array(16);
        this.identity(), qr();
      }
      read(e, r = 0) {
        for (let o = 0; o < this.size; ++o) this.elements[o] = e[r + o];
        return this;
      }
      write(e, r = 0) {
        for (let o = 0; o < this.size; ++o) e[r + o] = this.elements[o];
        return this;
      }
      copy(e) {
        return this.elements.set(e.elements), this;
      }
      clone() {
        return new lr().copy(this);
      }
      identity() {
        return (
          this.elements.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
          this
        );
      }
      get_x(e) {
        return e.read(this.elements), e;
      }
      get_y(e) {
        return e.read(this.elements, 4), e;
      }
      get_z(e) {
        return e.read(this.elements, 8), e;
      }
      get_w(e) {
        return e.read(this.elements, 12), e;
      }
      set_x(e) {
        return e.write(this.elements), this;
      }
      set_y(e) {
        return e.write(this.elements, 4), this;
      }
      set_z(e) {
        return e.write(this.elements, 8), this;
      }
      set_w(e) {
        return e.write(this.elements, 12), this;
      }
      set(e, r, o, n, i, a, s, c, _, l, u, d, p, m, f, y) {
        let g = this.elements;
        return (
          (g[0] = e),
          (g[1] = r),
          (g[2] = o),
          (g[3] = n),
          (g[4] = i),
          (g[5] = a),
          (g[6] = s),
          (g[7] = c),
          (g[8] = _),
          (g[9] = l),
          (g[10] = u),
          (g[11] = d),
          (g[12] = p),
          (g[13] = m),
          (g[14] = f),
          (g[15] = y),
          this
        );
      }
      look_at(e, r, o) {
        o === void 0 && (o = jT),
          _r.copy(e).sub(r),
          _r.x === 0 && _r.y === 0 && _r.z === 0 && (_r.z = 1),
          _r.normalize(),
          b.Cross(o, _r, Co),
          Co.x === 0 &&
            Co.y === 0 &&
            Co.z === 0 &&
            (Math.abs(o.z) === 1 ? (_r.x += 1e-4) : (_r.z += 1e-4),
            _r.normalize(),
            b.Cross(o, _r, Co)),
          Co.normalize(),
          b.Cross(_r, Co, Gs),
          Gs.normalize();
        let n = this.elements;
        return (
          (n[0] = Co.x),
          (n[1] = Co.y),
          (n[2] = Co.z),
          (n[4] = Gs.x),
          (n[5] = Gs.y),
          (n[6] = Gs.z),
          (n[8] = _r.x),
          (n[9] = _r.y),
          (n[10] = _r.z),
          this
        );
      }
      perspective(e, r, o, n, i = !1) {
        let a = o * Math.tan(cr * 0.5 * e),
          s = -a,
          c = a * r,
          _ = -c,
          l = n - o,
          u = o * 2,
          d = this.elements;
        return (
          d.fill(0),
          (d[0] = u / (_ - c)),
          (d[5] = u / (a - s)),
          (d[8] = (_ + c) / (_ - c)),
          (d[9] = (a + s) / (a - s)),
          (d[10] = -(n / l)),
          (d[14] = o * d[10]),
          (d[11] = -1),
          i && ((d[14] = -d[14]), (d[10] = -d[10] - 1)),
          this
        );
      }
      orthographics(e, r, o, n, i = !1) {
        let a = this.elements;
        a.fill(0);
        let s = n - o,
          c = r / 2,
          _ = -r / 2,
          l = e / 2,
          u = -e / 2;
        return (
          (a[0] = 2 / (_ - c)),
          (a[5] = 2 / (l - u)),
          (a[10] = -2 / s),
          (a[12] = (_ + c) / (_ - c)),
          (a[13] = (l + u) / (l - u)),
          (a[14] = -o * a[10]),
          (a[15] = 1),
          i && ((a[14] = -a[14] + 1), (a[10] = -a[10])),
          this
        );
      }
      inverse() {
        return lr.Inverse(this, this);
      }
      from_quaternion(e) {
        return lr.FromQuaternion(e, this);
      }
      compose(e, r, o) {
        return lr.Compose(e, r, o, this);
      }
      decompose(e, r, o) {
        return lr.Decompose(this, e, r, o);
      }
      set_scale(e) {
        let r = this.elements,
          o = e.x,
          n = e.y,
          i = e.z;
        return (
          (r[0] *= o),
          (r[4] *= n),
          (r[8] *= i),
          (r[1] *= o),
          (r[5] *= n),
          (r[9] *= i),
          (r[2] *= o),
          (r[6] *= n),
          (r[10] *= i),
          (r[3] *= o),
          (r[7] *= n),
          (r[11] *= i),
          this
        );
      }
      get_scale(e) {
        return e.set(this.elements[0], this.elements[5], this.elements[10]);
      }
      set_location(e) {
        let r = this.elements;
        return (r[12] = e.x), (r[13] = e.y), (r[14] = e.z), this;
      }
      pre_mul(e) {
        return lr.Mul(e, this, this);
      }
      mul(e) {
        return lr.Mul(this, e, this);
      }
      transpose() {
        let e = this.elements,
          r;
        return (
          (r = e[1]),
          (e[1] = e[4]),
          (e[4] = r),
          (r = e[2]),
          (e[2] = e[8]),
          (e[8] = r),
          (r = e[6]),
          (e[6] = e[9]),
          (e[9] = r),
          (r = e[3]),
          (e[3] = e[12]),
          (e[12] = r),
          (r = e[7]),
          (e[7] = e[13]),
          (e[13] = r),
          (r = e[11]),
          (e[11] = e[14]),
          (e[14] = r),
          this
        );
      }
      determinant() {
        return lr.Determinant(this);
      }
      static IsIdentity(e) {
        let r = e.elements;
        return (
          r[0] === 1 &&
          r[1] === 0 &&
          r[2] === 0 &&
          r[3] === 0 &&
          r[4] === 0 &&
          r[5] === 1 &&
          r[6] === 0 &&
          r[7] === 0 &&
          r[8] === 0 &&
          r[9] === 0 &&
          r[10] === 1 &&
          r[11] === 0 &&
          r[12] === 0 &&
          r[13] === 0 &&
          r[14] === 0 &&
          r[15] === 1
        );
      }
      static Determinant(e) {
        let r = e.elements,
          o = r[0],
          n = r[4],
          i = r[8],
          a = r[12],
          s = r[1],
          c = r[5],
          _ = r[9],
          l = r[13],
          u = r[2],
          d = r[6],
          p = r[10],
          m = r[14],
          f = r[3],
          y = r[7],
          g = r[11],
          v = r[15];
        return (
          f *
            (+a * _ * d -
              i * l * d -
              a * c * p +
              n * l * p +
              i * c * m -
              n * _ * m) +
          y *
            (+o * _ * m -
              o * l * p +
              a * s * p -
              i * s * m +
              i * l * u -
              a * _ * u) +
          g *
            (+o * l * d -
              o * c * m -
              a * s * d +
              n * s * m +
              a * c * u -
              n * l * u) +
          v *
            (-i * c * u -
              o * _ * d +
              o * c * p +
              i * s * d -
              n * s * p +
              n * _ * u)
        );
      }
      static Compose(e, r, o, n) {
        n === void 0 && (n = new lr());
        let i = n.elements,
          a = r.x,
          s = r.y,
          c = r.z,
          _ = r.w,
          l = a + a,
          u = s + s,
          d = c + c,
          p = a * l,
          m = a * u,
          f = a * d,
          y = s * u,
          g = s * d,
          v = c * d,
          w = _ * l,
          k = _ * u,
          D = _ * d,
          G = o.x,
          U = o.y,
          Y = o.z;
        return (
          (i[0] = (1 - (y + v)) * G),
          (i[1] = (m + D) * G),
          (i[2] = (f - k) * G),
          (i[3] = 0),
          (i[4] = (m - D) * U),
          (i[5] = (1 - (p + v)) * U),
          (i[6] = (g + w) * U),
          (i[7] = 0),
          (i[8] = (f + k) * Y),
          (i[9] = (g - w) * Y),
          (i[10] = (1 - (p + y)) * Y),
          (i[11] = 0),
          (i[12] = e.x),
          (i[13] = e.y),
          (i[14] = e.z),
          (i[15] = 1),
          n
        );
      }
      static FromQuaternion(e, r = new lr()) {
        let o = r.elements,
          n = e.x,
          i = e.y,
          a = e.z,
          s = e.w,
          c = n + n,
          _ = i + i,
          l = a + a,
          u = n * c,
          d = n * _,
          p = n * l,
          m = i * _,
          f = i * l,
          y = a * l,
          g = s * c,
          v = s * _,
          w = s * l;
        return (
          (o[0] = 1 - (m + y)),
          (o[4] = d - w),
          (o[8] = p + v),
          (o[1] = d + w),
          (o[5] = 1 - (u + y)),
          (o[9] = f - g),
          (o[2] = p - v),
          (o[6] = f + g),
          (o[10] = 1 - (u + m)),
          (o[3] = 0),
          (o[7] = 0),
          (o[11] = 0),
          (o[12] = 0),
          (o[13] = 0),
          (o[14] = 0),
          (o[15] = 1),
          r
        );
      }
      static Inverse(e, r) {
        r || (r = new lr());
        let o = r.elements,
          n = e.elements,
          i = n[0],
          a = n[1],
          s = n[2],
          c = n[3],
          _ = n[4],
          l = n[5],
          u = n[6],
          d = n[7],
          p = n[8],
          m = n[9],
          f = n[10],
          y = n[11],
          g = n[12],
          v = n[13],
          w = n[14],
          k = n[15],
          D =
            m * w * d -
            v * f * d +
            v * u * y -
            l * w * y -
            m * u * k +
            l * f * k,
          G =
            g * f * d -
            p * w * d -
            g * u * y +
            _ * w * y +
            p * u * k -
            _ * f * k,
          U =
            p * v * d -
            g * m * d +
            g * l * y -
            _ * v * y -
            p * l * k +
            _ * m * k,
          Y =
            g * m * u -
            p * v * u -
            g * l * f +
            _ * v * f +
            p * l * w -
            _ * m * w,
          le = i * D + a * G + s * U + c * Y;
        if (le === 0) return r.identity();
        let X = 1 / le;
        return (
          (o[0] = D * X),
          (o[1] =
            (v * f * c -
              m * w * c -
              v * s * y +
              a * w * y +
              m * s * k -
              a * f * k) *
            X),
          (o[2] =
            (l * w * c -
              v * u * c +
              v * s * d -
              a * w * d -
              l * s * k +
              a * u * k) *
            X),
          (o[3] =
            (m * u * c -
              l * f * c -
              m * s * d +
              a * f * d +
              l * s * y -
              a * u * y) *
            X),
          (o[4] = G * X),
          (o[5] =
            (p * w * c -
              g * f * c +
              g * s * y -
              i * w * y -
              p * s * k +
              i * f * k) *
            X),
          (o[6] =
            (g * u * c -
              _ * w * c -
              g * s * d +
              i * w * d +
              _ * s * k -
              i * u * k) *
            X),
          (o[7] =
            (_ * f * c -
              p * u * c +
              p * s * d -
              i * f * d -
              _ * s * y +
              i * u * y) *
            X),
          (o[8] = U * X),
          (o[9] =
            (g * m * c -
              p * v * c -
              g * a * y +
              i * v * y +
              p * a * k -
              i * m * k) *
            X),
          (o[10] =
            (_ * v * c -
              g * l * c +
              g * a * d -
              i * v * d -
              _ * a * k +
              i * l * k) *
            X),
          (o[11] =
            (p * l * c -
              _ * m * c -
              p * a * d +
              i * m * d +
              _ * a * y -
              i * l * y) *
            X),
          (o[12] = Y * X),
          (o[13] =
            (p * v * s -
              g * m * s +
              g * a * f -
              i * v * f -
              p * a * w +
              i * m * w) *
            X),
          (o[14] =
            (g * l * s -
              _ * v * s -
              g * a * u +
              i * v * u +
              _ * a * w -
              i * l * w) *
            X),
          (o[15] =
            (_ * m * s -
              p * l * s +
              p * a * u -
              i * m * u -
              _ * a * f +
              i * l * f) *
            X),
          r
        );
      }
      static Mul(e, r, o) {
        o === void 0 && (o = new lr());
        let n = e.elements,
          i = r.elements,
          a = o.elements,
          s = n[0],
          c = n[4],
          _ = n[8],
          l = n[12],
          u = n[1],
          d = n[5],
          p = n[9],
          m = n[13],
          f = n[2],
          y = n[6],
          g = n[10],
          v = n[14],
          w = n[3],
          k = n[7],
          D = n[11],
          G = n[15],
          U = i[0],
          Y = i[4],
          le = i[8],
          X = i[12],
          Qe = i[1],
          Ge = i[5],
          Nt = i[9],
          fo = i[13],
          ra = i[2],
          Uo = i[6],
          un = i[10],
          dt = i[14],
          St = i[3],
          Ze = i[7],
          Dr = i[11],
          ho = i[15];
        return (
          (a[0] = s * U + c * Qe + _ * ra + l * St),
          (a[4] = s * Y + c * Ge + _ * Uo + l * Ze),
          (a[8] = s * le + c * Nt + _ * un + l * Dr),
          (a[12] = s * X + c * fo + _ * dt + l * ho),
          (a[1] = u * U + d * Qe + p * ra + m * St),
          (a[5] = u * Y + d * Ge + p * Uo + m * Ze),
          (a[9] = u * le + d * Nt + p * un + m * Dr),
          (a[13] = u * X + d * fo + p * dt + m * ho),
          (a[2] = f * U + y * Qe + g * ra + v * St),
          (a[6] = f * Y + y * Ge + g * Uo + v * Ze),
          (a[10] = f * le + y * Nt + g * un + v * Dr),
          (a[14] = f * X + y * fo + g * dt + v * ho),
          (a[3] = w * U + k * Qe + D * ra + G * St),
          (a[7] = w * Y + k * Ge + D * Uo + G * Ze),
          (a[11] = w * le + k * Nt + D * un + G * Dr),
          (a[15] = w * X + k * fo + D * dt + G * ho),
          o
        );
      }
      toString() {
        let e = "[" + this.elements[0].toFixed(4);
        for (let r = 1; r < this.elements.length; ++r)
          e += ", " + this.elements[r].toFixed(4);
        return (e += "]"), e;
      }
    },
    L = lr;
  L.Decompose = (function () {
    let e;
    return function (r, o, n, i) {
      e === void 0 && (e = new lr());
      let a = r.elements,
        s = Op.set(a[0], a[1], a[2]).length,
        c = Op.set(a[4], a[5], a[6]).length,
        _ = Op.set(a[8], a[9], a[10]).length;
      r.determinant() < 0 && (s = -s),
        (o.x = a[12]),
        (o.y = a[13]),
        (o.z = a[14]),
        e.copy(r);
      let u = 1 / s,
        d = 1 / c,
        p = 1 / _;
      return (
        (e.elements[0] *= u),
        (e.elements[1] *= u),
        (e.elements[2] *= u),
        (e.elements[4] *= d),
        (e.elements[5] *= d),
        (e.elements[6] *= d),
        (e.elements[8] *= p),
        (e.elements[9] *= p),
        (e.elements[10] *= p),
        n.from_mat4(e),
        (i.x = s),
        (i.y = c),
        (i.z = _),
        r
      );
    };
  })();
  var Gr = class {
    constructor() {
      this.size = 9;
      this.elements = new Float32Array(9);
      qr();
    }
    read(e, r = 0) {
      for (let o = 0; o < this.size; ++o) this.elements[o] = e[r + o];
      return this;
    }
    write(e, r = 0) {
      for (let o = 0; o < this.size; ++o) e[r + o] = this.elements[o];
      return this;
    }
    identity() {
      return this.elements.set([1, 0, 0, 1, 0, 0, 1, 0, 0, 1]), this;
    }
    copy(e) {
      return this.elements.set(e.elements), this;
    }
    from_mat4(e) {
      let r = this.elements,
        o = e.elements;
      return (
        (r[0] = o[0]),
        (r[1] = o[1]),
        (r[2] = o[2]),
        (r[3] = o[4]),
        (r[4] = o[5]),
        (r[5] = o[6]),
        (r[6] = o[8]),
        (r[7] = o[9]),
        (r[8] = o[10]),
        this
      );
    }
    normal_matrix_from_mat4(e) {
      return this.from_mat4(e).inverse().transpose(), this;
    }
    inverse() {
      let e = this.elements,
        r = e[0],
        o = e[1],
        n = e[2],
        i = e[3],
        a = e[4],
        s = e[5],
        c = e[6],
        _ = e[7],
        l = e[8],
        u = l * a - s * _,
        d = s * c - l * i,
        p = _ * i - a * c,
        m = r * u + o * d + n * p;
      if (m === 0) return this.elements.fill(0), this;
      let f = 1 / m;
      return (
        (e[0] = u * f),
        (e[1] = (n * _ - l * o) * f),
        (e[2] = (s * o - n * a) * f),
        (e[3] = d * f),
        (e[4] = (l * r - n * c) * f),
        (e[5] = (n * i - s * r) * f),
        (e[6] = p * f),
        (e[7] = (o * c - _ * r) * f),
        (e[8] = (a * r - o * i) * f),
        this
      );
    }
    transpose() {
      let e = this.elements,
        r;
      return (
        (r = e[1]),
        (e[1] = e[3]),
        (e[3] = r),
        (r = e[2]),
        (e[2] = e[6]),
        (e[6] = r),
        (r = e[5]),
        (e[5] = e[7]),
        (e[7] = r),
        this
      );
    }
    toString() {
      let e = "[" + this.elements[0].toFixed(4);
      for (let r = 1; r < this.elements.length; ++r)
        e += ", " + this.elements[r].toFixed(4);
      return (e += "]"), e;
    }
    static GetColumn(e, r, o) {
      let n = e.elements;
      return (o.x = n[r]), (o.y = n[r + 3]), (o.z = n[r + 6]), o;
    }
    static Diagonal(e, r, o, n) {
      n.elements.set([e, 0, 0, 0, r, 0, 0, 0, o]);
    }
  };
  var o_,
    vt = class {
      constructor(e = 0, r = 0, o = 0) {
        this.size = 3;
        this.elements = new Float32Array(3);
        this.order = "XYZ";
        this.set(e, r, o), qr();
      }
      get x() {
        return this.elements[0];
      }
      set x(e) {
        this.elements[0] = e;
      }
      get y() {
        return this.elements[1];
      }
      set y(e) {
        this.elements[1] = e;
      }
      get z() {
        return this.elements[2];
      }
      set z(e) {
        this.elements[2] = e;
      }
      set(e, r, o) {
        return (this.x = e), (this.y = r), (this.z = o), this;
      }
      copy(e) {
        return (this.x = e.x), (this.y = e.y), (this.z = e.z), this;
      }
      clone() {
        return new vt(this.x, this.y, this.z);
      }
      add(e) {
        return (this.x += e.x), (this.y += e.y), (this.z += e.z), this;
      }
      sub(e) {
        return (this.x -= e.x), (this.y -= e.y), (this.z -= e.z), this;
      }
      mul(e) {
        return (this.x *= e), (this.y *= e), (this.z *= e), this;
      }
      lerp(e, r) {
        return vt.Lerp(this, e, r, this);
      }
      from_mat4(e, r = "XYZ") {
        return vt.FromRotationMatrix(e, r, this);
      }
      from_quaternion(e, r = "XYZ") {
        return vt.FromQuaternion(e, r, this);
      }
      static FromRotationMatrix(e, r = "XYZ", o) {
        o === void 0 && (o = new vt());
        let n = e.elements,
          i = n[0],
          a = n[4],
          s = n[8],
          c = n[1],
          _ = n[5],
          l = n[9],
          u = n[2],
          d = n[6],
          p = n[10];
        switch (r) {
          case "XYZ":
            (o.y = Math.asin(Q(s, -1, 1))),
              Math.abs(s) < 0.9999999
                ? ((o.x = Math.atan2(-l, p)), (o.z = Math.atan2(-a, i)))
                : ((o.x = Math.atan2(d, _)), (o.z = 0));
            break;
          case "YXZ":
            (o.x = Math.asin(-Q(l, -1, 1))),
              Math.abs(l) < 0.9999999
                ? ((o.y = Math.atan2(s, p)), (o.z = Math.atan2(c, _)))
                : ((o.y = Math.atan2(-u, i)), (o.z = 0));
            break;
          case "ZXY":
            (o.x = Math.asin(Q(d, -1, 1))),
              Math.abs(d) < 0.9999999
                ? ((o.y = Math.atan2(-u, p)), (o.z = Math.atan2(-a, _)))
                : ((o.y = 0), (o.z = Math.atan2(c, i)));
            break;
          case "ZYX":
            (o.y = Math.asin(-Q(u, -1, 1))),
              Math.abs(u) < 0.9999999
                ? ((o.x = Math.atan2(d, p)), (o.z = Math.atan2(c, i)))
                : ((o.x = 0), (o.z = Math.atan2(-a, _)));
            break;
          case "YZX":
            (o.z = Math.asin(Q(c, -1, 1))),
              Math.abs(c) < 0.9999999
                ? ((o.x = Math.atan2(-l, _)), (o.y = Math.atan2(-u, i)))
                : ((o.x = 0), (o.y = Math.atan2(s, p)));
            break;
          case "XZY":
            (o.z = Math.asin(-Q(a, -1, 1))),
              Math.abs(a) < 0.9999999
                ? ((o.x = Math.atan2(d, _)), (o.y = Math.atan2(s, i)))
                : ((o.x = Math.atan2(-l, p)), (o.y = 0));
            break;
          default:
            console.warn("unknown order: " + r);
        }
        return (o.order = r), o;
      }
      static FromQuaternion(e, r = "XYZ", o) {
        return (
          o === void 0 && (o = new vt()),
          o_ === void 0 && (o_ = new L()),
          o_.from_quaternion(e),
          vt.FromRotationMatrix(o_, r, o)
        );
      }
      static Lerp(e, r, o, n) {
        return (
          (n.x = Ue(e.elements[0], r.x, o)),
          (n.y = Ue(e.elements[1], r.y, o)),
          (n.z = Ue(e.elements[2], r.z, o)),
          n
        );
      }
    };
  var vi = class {
    constructor(e, r = 0) {
      this.constant = r;
      this.normal = new b();
      e && this.normal.copy(e);
    }
    set(e, r, o, n) {
      this.normal.set(e, r, o);
      let i = this.normal.length;
      return this.normal.normalize(), (this.constant = n / i), this;
    }
    distance_to_point(e) {
      return this.normal.dot(e) + this.constant;
    }
    from_direction_point(e, r) {
      return (
        this.normal.copy(e).normalize(),
        (this.constant = -r.dot(this.normal)),
        this
      );
    }
    set_from_point(e) {
      return (this.constant = -e.dot(this.normal)), this;
    }
  };
  var sa,
    qb = new L(),
    Rr = class {
      constructor(e = []) {
        this.planes = e;
        if (this.planes.length < 6)
          for (let r = 0; r < 6; ++r)
            this.planes[r] === void 0 && (this.planes[r] = new vi());
      }
      from_view_projection_matrix(e, r) {
        L.Mul(r, e, qb);
        let o = this.planes,
          n = qb.elements,
          i = n[0],
          a = n[1],
          s = n[2],
          c = n[3],
          _ = n[4],
          l = n[5],
          u = n[6],
          d = n[7],
          p = n[8],
          m = n[9],
          f = n[10],
          y = n[11],
          g = n[12],
          v = n[13],
          w = n[14],
          k = n[15];
        return (
          o[0].set(c - i, d - _, y - p, k - g),
          o[1].set(c + i, d + _, y + p, k + g),
          o[2].set(c + a, d + l, y + m, k + v),
          o[3].set(c - a, d - l, y - m, k - v),
          o[4].set(c - s, d - u, y - f, k - w),
          o[5].set(c + s, d + u, y + f, k + w),
          this
        );
      }
      contains_point(e) {
        let r = this.planes;
        for (let o = 0; o < 6; o++)
          if (r[o].distance_to_point(e) < 0) return !1;
        return !0;
      }
      intersect_sphere(e) {
        let r = this.planes,
          o = e.center,
          n = -e.radius;
        for (let i = 0; i < 6; i++)
          if (r[i].distance_to_point(o) < n) return !1;
        return !0;
      }
      intersect_box(e) {
        sa === void 0 && (sa = new b());
        let r = this.planes;
        for (let o = 0; o < 6; o++) {
          let n = r[o];
          if (
            ((sa.x = n.normal.x > 0 ? e.max.x : e.min.x),
            (sa.y = n.normal.y > 0 ? e.max.y : e.min.y),
            (sa.z = n.normal.z > 0 ? e.max.z : e.min.z),
            n.distance_to_point(sa) < 0)
          )
            return !1;
        }
        return !0;
      }
    };
  var ur = new b(),
    Hp = new b(),
    Vp = new b(),
    Us = new b(),
    n_ = new b(),
    i_ = class {
      constructor(e, r) {
        this.origin = new b();
        this.direction = new b();
        e !== void 0 && this.origin.copy(e),
          r !== void 0 && this.direction.copy(r);
      }
      copy(e) {
        return (
          this.origin.copy(e.origin), this.direction.copy(e.direction), this
        );
      }
      at(e, r = ur) {
        return r.copy(this.direction).mul(e).add(this.origin);
      }
      apply_mat4(e) {
        return (
          this.origin.apply_mat4(e), this.direction.transform_direction(e), this
        );
      }
      distance_to_point(e) {
        ur.copy(e).sub(this.origin);
        let r = ur.dot(this.direction);
        return r < 0
          ? this.origin.distance(e)
          : (ur.copy(this.direction).mul(r).add(this.origin), ur.distance(e));
      }
      intersect_box(e, r = ur) {
        let o,
          n,
          i,
          a,
          s,
          c,
          _ = 1 / this.direction.x,
          l = 1 / this.direction.y,
          u = 1 / this.direction.z,
          d = this.origin;
        return (
          _ >= 0
            ? ((o = (e.min.x - d.x) * _), (n = (e.max.x - d.x) * _))
            : ((o = (e.max.x - d.x) * _), (n = (e.min.x - d.x) * _)),
          l >= 0
            ? ((i = (e.min.y - d.y) * l), (a = (e.max.y - d.y) * l))
            : ((i = (e.max.y - d.y) * l), (a = (e.min.y - d.y) * l)),
          o > a ||
          i > n ||
          ((i > o || o !== o) && (o = i),
          (a < n || n !== n) && (n = a),
          u >= 0
            ? ((s = (e.min.z - d.z) * u), (c = (e.max.z - d.z) * u))
            : ((s = (e.max.z - d.z) * u), (c = (e.min.z - d.z) * u)),
          o > c || s > n) ||
          ((s > o || o !== o) && (o = s), (c < n || n !== n) && (n = c), n < 0)
            ? null
            : this.at(o >= 0 ? o : n, r)
        );
      }
      is_intersect_box(e) {
        return this.intersect_box(e) !== null;
      }
      intersect_sphere(e, r = ur) {
        ur.copy(e.center).sub(this.origin);
        let o = ur.dot(this.direction),
          n = ur.dot(ur) - o * o,
          i = e.radius * e.radius;
        if (n > i) return null;
        let a = Math.sqrt(i - n),
          s = o - a,
          c = o + a;
        return s < 0 && c < 0 ? null : s < 0 ? this.at(c, r) : this.at(s, r);
      }
      is_intersect_sphere(e, r = ur) {
        return this.intersect_sphere(e, r) !== null;
      }
      intersect_triangle(e, r, o, n = !1, i = ur) {
        Vp.copy(r).sub(e), Us.copy(o).sub(e), b.Cross(Vp, Us, Hp);
        let a = this.direction.dot(Hp),
          s;
        if (a > 0) {
          if (!n) return null;
          s = 1;
        } else if (a < 0) (s = -1), (a = -a);
        else return null;
        n_.copy(this.origin).sub(e), b.Cross(n_, Us, Us);
        let c = s * this.direction.dot(Us);
        if (c < 0) return null;
        let _ = s * this.direction.dot(Vp.cross(n_));
        if (_ < 0 || c + _ > a) return null;
        let l = -s * n_.dot(Hp);
        return l < 0 ? null : this.at(l / a, i);
      }
      is_triangle_intersect(e, r, o, n = !1, i = ur) {
        return this.intersect_triangle(e, r, o, n, i) !== null;
      }
      intersect_plane(e, r = ur) {
        let o = e.normal.dot(this.direction);
        if (o === 0)
          return e.distance_to_point(this.origin) === 0
            ? (r.copy(this.origin), r)
            : null;
        let n = -(this.origin.dot(e.normal) + e.constant) / o;
        return n < 0 ? null : (this.at(n, r), r);
      }
      apply_matrix(e) {
        return (
          this.origin.apply_mat4(e), this.direction.transform_direction(e), this
        );
      }
    };
  var jp = class {
      constructor(e = 0, r = 0, o = 0, n = 0) {
        this.size = 4;
        this.elements = new Float32Array(4);
        this.set(e, r, o, n), qr();
      }
      set x(e) {
        this.elements[0] = e;
      }
      set y(e) {
        this.elements[1] = e;
      }
      set w(e) {
        this.elements[2] = e;
      }
      set h(e) {
        this.elements[3] = e;
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
      read(e, r = 0) {
        return (
          (this.elements[0] = e[r]),
          (this.elements[1] = e[r + 1]),
          (this.elements[2] = e[r + 2]),
          (this.elements[3] = e[r + 3]),
          this
        );
      }
      write(e, r = 0) {
        return (
          (e[r] = this.elements[0]),
          (e[r + 1] = this.elements[1]),
          (e[r + 2] = this.elements[2]),
          (e[r + 3] = this.elements[3]),
          this
        );
      }
      set(e, r, o, n) {
        return (
          (this.elements[0] = e),
          (this.elements[1] = r),
          (this.elements[2] = o),
          (this.elements[3] = n),
          this
        );
      }
      copy(e) {
        return (
          (this.elements[0] = e.x),
          (this.elements[1] = e.y),
          (this.elements[2] = e.w),
          (this.elements[3] = e.h),
          this
        );
      }
      contains(e) {
        return (
          e.x >= this.elements[0] &&
          e.y >= this.elements[1] &&
          e.x < this.elements[0] + this.elements[2] &&
          e.y < this.elements[1] + this.elements[3]
        );
      }
      equals(e) {
        return (
          this.elements[0] === e.x &&
          this.elements[1] === e.y &&
          this.elements[2] === e.w &&
          this.elements[3] === e.h
        );
      }
      locate(e) {
        return (this.elements[0] += e.x), (this.elements[1] += e.y), this;
      }
      mul(e) {
        return (
          (this.elements[0] *= e),
          (this.elements[1] *= e),
          (this.elements[2] *= e),
          (this.elements[3] *= e),
          this
        );
      }
      scale(e) {
        return (this.elements[2] *= e), (this.elements[3] *= e), this;
      }
      translate(e, r) {
        return (this.elements[0] += e), (this.elements[1] += r), this;
      }
      shrink(e, r) {
        return (
          r === void 0
            ? ((this.elements[0] += e),
              (this.elements[1] += e),
              (this.elements[2] = Math.max(0, this.elements[2] - e * 2)),
              (this.elements[3] = Math.max(0, this.elements[3] - e * 2)))
            : ((this.elements[0] += r),
              (this.elements[1] += e),
              (this.elements[2] = Math.max(0, this.elements[2] - r * 2)),
              (this.elements[3] = Math.max(0, this.elements[3] - e * 2))),
          this
        );
      }
      expand(e, r) {
        return (
          r === void 0
            ? ((this.elements[0] -= e),
              (this.elements[1] -= e),
              (this.elements[2] += e * 2),
              (this.elements[3] += e * 2))
            : ((this.elements[0] -= r),
              (this.elements[1] -= e),
              (this.elements[2] += r * 2),
              (this.elements[3] += e * 2)),
          this
        );
      }
      constrain(e) {
        return (
          (e.x = Q(e.x, this.elements[0], this.elements[0] + this.elements[2])),
          (e.y = Q(e.y, this.elements[1], this.elements[1] + this.elements[3])),
          e
        );
      }
      intersect(e) {
        let r = this.elements[0] > e.x ? this.elements[0] : e.x,
          o = this.elements[1] > e.y ? this.elements[1] : e.y,
          n =
            this.elements[0] + this.elements[2] < e.x + e.w
              ? this.elements[0] + this.elements[2]
              : e.x + e.w,
          i =
            this.elements[1] + this.elements[3] < e.y + e.h
              ? this.elements[1] + this.elements[3]
              : e.y + e.h;
        return (
          r >= n || o >= i
            ? ((this.elements[0] = 0),
              (this.elements[1] = 0),
              (this.elements[2] = 0),
              (this.elements[3] = 0))
            : ((this.elements[0] = r),
              (this.elements[1] = o),
              (this.elements[2] = n - r),
              (this.elements[3] = i - o)),
          this
        );
      }
      valid() {
        return this.elements[2] > 0 && this.elements[3] > 0;
      }
      toString() {
        return `Rect(${this.elements[0]}, ${this.elements[1]}, ${this.elements[2]}, ${this.elements[3]})`;
      }
    },
    x = jp;
  x.ZERO = new jp(0, 0, 0, 0);
  var Wt = class {
      constructor(e = 0, r = 0, o = 0, n = 1) {
        this.is_quaternion = !0;
        this.size = 4;
        this.elements = new Float32Array(4);
        (this.x = e), (this.y = r), (this.z = o), (this.w = n), qr();
      }
      get x() {
        return this.elements[0];
      }
      set x(e) {
        this.elements[0] = e;
      }
      get y() {
        return this.elements[1];
      }
      set y(e) {
        this.elements[1] = e;
      }
      get z() {
        return this.elements[2];
      }
      set z(e) {
        this.elements[2] = e;
      }
      get w() {
        return this.elements[3];
      }
      set w(e) {
        this.elements[3] = e;
      }
      read(e, r = 0) {
        return (
          (this.elements[0] = e[r]),
          (this.elements[1] = e[r + 1]),
          (this.elements[2] = e[r + 2]),
          (this.elements[3] = e[r + 3]),
          this
        );
      }
      write(e, r = 0) {
        return (
          (e[r] = this.elements[0]),
          (e[r + 1] = this.elements[1]),
          (e[r + 2] = this.elements[2]),
          (e[r + 3] = this.elements[3]),
          this
        );
      }
      set(...e) {
        return e ? this.elements.set(e) : this.elements.fill(0), this;
      }
      copy(e) {
        return (
          (this.x = e.x), (this.y = e.y), (this.z = e.z), (this.w = e.w), this
        );
      }
      clone() {
        return new Wt(this.x, this.y, this.z, this.w);
      }
      length() {
        return Math.sqrt(
          this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w,
        );
      }
      normalize() {
        return Wt.Normalize(this, this);
      }
      premul(e) {
        return Wt.Mul(e, this, this);
      }
      mul(e) {
        return Wt.Mul(this, e, this);
      }
      from_mat4(e) {
        return Wt.FromMat4(e, this);
      }
      from_unit_vectors(e, r) {
        return Wt.FromUnitVectors(e, r, this);
      }
      from_euler(e, r = "XYZ") {
        return Wt.FromEuler(e, r, this);
      }
      from_axis_angle(e, r) {
        let o = r / 2,
          n = Math.sin(o);
        return (
          (this.x = e.x * n),
          (this.y = e.y * n),
          (this.z = e.z * n),
          (this.w = Math.cos(o)),
          this
        );
      }
      toString() {
        return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`;
      }
      slerp(e, r) {
        return Wt.Slerp(this, e, r, this), this;
      }
      conjugate() {
        return Wt.Conjugate(this, this);
      }
      inverse() {
        return Wt.Inverse(this, this);
      }
      static Conjugate(e, r) {
        return (r.x = -e.x), (r.y = -e.y), (r.z = -e.z), (r.w = e.w), r;
      }
      static Equals(e, r) {
        return e.x === r.x && e.y === r.y && e.z === r.z && e.w === r.w;
      }
      static Mul(e, r, o) {
        o === void 0 && (o = new Wt());
        let n = e.x,
          i = e.y,
          a = e.z,
          s = e.w,
          c = r.x,
          _ = r.y,
          l = r.z,
          u = r.w;
        return (
          (o.x = n * u + s * c + i * l - a * _),
          (o.y = i * u + s * _ + a * c - n * l),
          (o.z = a * u + s * l + n * _ - i * c),
          (o.w = s * u - n * c - i * _ - a * l),
          o
        );
      }
      static FromUnitVectors(e, r, o) {
        let n = e.dot(r) + 1;
        return (
          n < Number.EPSILON
            ? ((n = 0),
              Math.abs(e.x) > Math.abs(e.z)
                ? ((o.x = -e.y), (o.y = e.x), (o.z = 0), (o.w = n))
                : ((o.x = 0), (o.y = -e.z), (o.z = e.y), (o.w = n)))
            : ((o.x = e.y * r.z - e.z * r.y),
              (o.y = e.z * r.x - e.x * r.z),
              (o.z = e.x * r.y - e.y * r.x),
              (o.w = n)),
          o.normalize()
        );
      }
      static FromMat4(e, r) {
        let o = e.elements,
          n = o[0],
          i = o[4],
          a = o[8],
          s = o[1],
          c = o[5],
          _ = o[9],
          l = o[2],
          u = o[6],
          d = o[10],
          p = n + c + d,
          m;
        return (
          p > 0
            ? ((m = 0.5 / Math.sqrt(p + 1)),
              (r.w = 0.25 / m),
              (r.x = (u - _) * m),
              (r.y = (a - l) * m),
              (r.z = (s - i) * m))
            : n > c && n > d
              ? ((m = 2 * Math.sqrt(1 + n - c - d)),
                (r.w = (u - _) / m),
                (r.x = 0.25 * m),
                (r.y = (i + s) / m),
                (r.z = (a + l) / m))
              : c > d
                ? ((m = 2 * Math.sqrt(1 + c - n - d)),
                  (r.w = (a - l) / m),
                  (r.x = (i + s) / m),
                  (r.y = 0.25 * m),
                  (r.z = (_ + u) / m))
                : ((m = 2 * Math.sqrt(1 + d - n - c)),
                  (r.w = (s - i) / m),
                  (r.x = (a + l) / m),
                  (r.y = (_ + u) / m),
                  (r.z = 0.25 * m)),
          r
        );
      }
      static FromMat3(e, r) {
        let o = e.elements,
          n = o[0],
          i = o[3],
          a = o[6],
          s = o[1],
          c = o[4],
          _ = o[7],
          l = o[2],
          u = o[5],
          d = o[9],
          p = n + c + d,
          m;
        return (
          p > 0
            ? ((m = 0.5 / Math.sqrt(p + 1)),
              (r.w = 0.25 / m),
              (r.x = (u - _) * m),
              (r.y = (a - l) * m),
              (r.z = (s - i) * m))
            : n > c && n > d
              ? ((m = 2 * Math.sqrt(1 + n - c - d)),
                (r.w = (u - _) / m),
                (r.x = 0.25 * m),
                (r.y = (i + s) / m),
                (r.z = (a + l) / m))
              : c > d
                ? ((m = 2 * Math.sqrt(1 + c - n - d)),
                  (r.w = (a - l) / m),
                  (r.x = (i + s) / m),
                  (r.y = 0.25 * m),
                  (r.z = (_ + u) / m))
                : ((m = 2 * Math.sqrt(1 + d - n - c)),
                  (r.w = (s - i) / m),
                  (r.x = (a + l) / m),
                  (r.y = (_ + u) / m),
                  (r.z = 0.25 * m)),
          r
        );
      }
      static Slerp(e, r, o, n) {
        if ((n === void 0 && (n = new Wt()), o === 0)) return n.copy(e), n;
        if (o === 1) return n.copy(r), n;
        let i = e.x,
          a = e.y,
          s = e.z,
          c = e.w,
          _ = c * r.w + i * r.x + a * r.y + s * r.z;
        if (
          (_ < 0
            ? ((n.w = -r.w), (n.x = -r.x), (n.y = -r.y), (n.z = -r.z), (_ = -_))
            : n.copy(r),
          _ >= 1)
        )
          return (n.w = c), (n.x = i), (n.y = a), (n.z = s), n;
        let l = 1 - _ * _;
        if (l <= Number.EPSILON) {
          let f = 1 - o;
          return (
            (n.w = f * c + o * e.w),
            (n.x = f * i + o * e.x),
            (n.y = f * a + o * e.y),
            (n.z = f * s + o * e.z),
            n.normalize(),
            n
          );
        }
        let u = Math.sqrt(l),
          d = Math.atan2(u, _),
          p = Math.sin((1 - o) * d) / u,
          m = Math.sin(o * d) / u;
        return (
          (n.w = c * p + r.w * m),
          (n.x = i * p + r.x * m),
          (n.y = a * p + r.y * m),
          (n.z = s * p + r.z * m),
          n
        );
      }
      static Normalize(e, r) {
        r === void 0 && (r = new Wt());
        let o = e.length();
        return (
          o === 0
            ? ((r.x = 0), (r.y = 0), (r.z = 0), (r.w = 1))
            : ((o = 1 / o), (r.x *= o), (r.y *= o), (r.z *= o), (r.w *= o)),
          r
        );
      }
      static Multiply(e, r, o) {
        o === void 0 && (o = new Wt());
        let n = e.x,
          i = e.y,
          a = e.z,
          s = e.w,
          c = r.x,
          _ = r.y,
          l = r.z,
          u = r.w;
        return (
          (o.x = n * u + s * c + i * l - a * _),
          (o.y = i * u + s * _ + a * c - n * l),
          (o.z = a * u + s * l + n * _ - i * c),
          (o.w = s * u - n * c - i * _ - a * l),
          o
        );
      }
      static FromEuler(e, r = "XYZ", o) {
        let n = e.x,
          i = e.y,
          a = e.z,
          s = Math.cos,
          c = Math.sin,
          _ = s(n / 2),
          l = s(i / 2),
          u = s(a / 2),
          d = c(n / 2),
          p = c(i / 2),
          m = c(a / 2);
        switch (r) {
          case "XYZ":
            (o.x = d * l * u + _ * p * m),
              (o.y = _ * p * u - d * l * m),
              (o.z = _ * l * m + d * p * u),
              (o.w = _ * l * u - d * p * m);
            break;
          case "YXZ":
            (o.x = d * l * u + _ * p * m),
              (o.y = _ * p * u - d * l * m),
              (o.z = _ * l * m - d * p * u),
              (o.w = _ * l * u + d * p * m);
            break;
          case "ZXY":
            (o.x = d * l * u - _ * p * m),
              (o.y = _ * p * u + d * l * m),
              (o.z = _ * l * m + d * p * u),
              (o.w = _ * l * u - d * p * m);
            break;
          case "ZYX":
            (o.x = d * l * u - _ * p * m),
              (o.y = _ * p * u + d * l * m),
              (o.z = _ * l * m - d * p * u),
              (o.w = _ * l * u + d * p * m);
            break;
          case "YZX":
            (o.x = d * l * u + _ * p * m),
              (o.y = _ * p * u + d * l * m),
              (o.z = _ * l * m - d * p * u),
              (o.w = _ * l * u - d * p * m);
            break;
          case "XZY":
            (o.x = d * l * u - _ * p * m),
              (o.y = _ * p * u - d * l * m),
              (o.z = _ * l * m + d * p * u),
              (o.w = _ * l * u + d * p * m);
            break;
          default:
            console.warn("unknown order: " + r);
        }
        return o;
      }
      static Inverse(e, r) {
        return (r.x = -e.x), (r.y = -e.y), (r.z = -e.z), (r.w = e.w), r;
      }
    },
    $ = Wt;
  $.Identity = new Wt(0, 0, 0, 1);
  var Ot = class {
    constructor(e, r, o) {
      (this.radius = e || 1), (this.theta = r || 0), (this.phi = o || 0);
    }
    from_float3(e) {
      return (
        (this.radius = e.length),
        this.radius === 0
          ? ((this.theta = 0), (this.phi = 0))
          : ((this.theta = Math.acos(Q(e.y / this.radius, -1, 1))),
            (this.phi = Math.atan2(e.x, e.z))),
        this
      );
    }
    set(e, r, o) {
      return (this.radius = e), (this.theta = r), (this.phi = o), this;
    }
    copy(e) {
      return this.set(e.radius, e.theta, e.phi);
    }
    clone() {
      return new Ot(this.radius, this.theta, this.phi);
    }
    lerp(e, r) {
      return Ot.Lerp(this, e, r, this);
    }
    static Lerp(e, r, o, n) {
      return (
        n === void 0 && (n = new Ot()),
        (n.radius = Ue(e.radius, r.radius, o)),
        (n.theta = Ue(e.theta, r.theta, o)),
        (n.phi = Ue(e.phi, r.phi, o)),
        n
      );
    }
  };
  var LP = new b(),
    zP = new b();
  function fn(t, e = "position") {
    if (t.attributes === void 0 || t.attributes.length < 1) return null;
    for (let r = 0; r < t.attributes.length; ++r) {
      let o = t.attributes[r];
      if (o.name === e) return o;
    }
    return null;
  }
  function hn(t, e) {
    if (e === void 0) return;
    let r = fn(t, e.name);
    r === null
      ? t.attributes.push(e)
      : ((r.name = e.name), (r.stride = e.stride), (r.buffer = e.buffer));
  }
  var Qb = new b(),
    XP = new be();
  function Zb(t, e) {
    (e = e ?? new be()), e.reset();
    let r = fn(t);
    if (r) {
      let o = r.buffer;
      for (let n = 0; n < o.length; n += 3) Qb.read(o, n), e.expand_point(Qb);
    }
    return e;
  }
  var Cn = new b(),
    Ii = new b(),
    ft = new b(),
    Ln = new b(),
    Ms = new b(),
    Cs = new b(),
    Ti = new b(),
    Ri = new b(),
    Si = new b(),
    ca = new b(),
    _a = new b(),
    la = new b(),
    ua = new b(),
    pa = new b(),
    da = new b(),
    ma = new T(),
    a_ = new T(),
    s_ = new T(),
    Ur = new b(),
    Mr = new b(),
    Lo = new b(),
    fa = new b(),
    Xp = new b(),
    ha = new b(),
    Ls = new b(),
    $p = new b(),
    zs = new b(),
    Ns = class {
      static prepare(e) {
        let r = fn(e, "position").buffer,
          o = fn(e, "normal").buffer,
          n = fn(e, "uv").buffer,
          i = e.index,
          a;
        if (i) {
          a = i.length;
          let s = i;
          for (let c = 0; c < a; c += 3) {
            let _ = s[c],
              l = s[c + 1],
              u = s[c + 2];
            this.compute(r, o, n, _, l, u);
          }
        } else {
          a = r.length / 3;
          for (let s = 0; s < a; s += 3) this.compute(r, o, n, s, s + 1, s + 2);
        }
      }
      static compute(e, r, o, n, i, a) {
        Cn === void 0 &&
          ((Cn = new b()),
          (Ii = new b()),
          (ft = new b()),
          (Ln = new b()),
          (Ms = new b()),
          (Cs = new b()),
          (Ti = new b()),
          (Ri = new b()),
          (Si = new b()),
          (ca = new b()),
          (_a = new b()),
          (la = new b()),
          (ua = new b()),
          (pa = new b()),
          (da = new b()),
          (ma = new T()),
          (a_ = new T()),
          (s_ = new T()),
          (Ur = new b()),
          (Mr = new b()),
          (Lo = new b())),
          Ln.read(e, n * 3),
          Ms.read(e, i * 3),
          Cs.read(e, a * 3),
          Ti.read(r, n * 3),
          Ri.read(r, i * 3),
          Si.read(r, a * 3),
          ma.read(o, n * 2),
          a_.read(o, i * 2),
          s_.read(o, a * 2);
        let s, c;
        ua.set(0, 0, 0),
          pa.set(0, 0, 0),
          da.set(0, 0, 0),
          ca.set(0, 0, 0),
          _a.set(0, 0, 0),
          la.set(0, 0, 0);
        let _ = a_.x - ma.x,
          l = s_.x - ma.x,
          u = a_.y - ma.y,
          d = s_.y - ma.y;
        Cn.set(Ms.x - Ln.x, _, u),
          Ii.set(Cs.x - Ln.x, l, d),
          b.Cross(Cn, Ii, ft),
          ft.x !== 0 &&
            (ft.normalize(),
            (s = -ft.y / ft.x),
            (c = -ft.z / ft.x),
            (ua.x += s),
            (ca.x += c),
            (pa.x += s),
            (_a.x += c),
            (da.x += s),
            (la.x += c)),
          Cn.set(Ms.y - Ln.y, _, u),
          Ii.set(Cs.y - Ln.y, l, d),
          b.Cross(Cn, Ii, ft),
          ft.x !== 0 &&
            (ft.normalize(),
            (s = -ft.y / ft.x),
            (c = -ft.z / ft.x),
            (ua.y += s),
            (ca.y += c),
            (pa.y += s),
            (_a.y += c),
            (da.y += s),
            (la.y += c)),
          Cn.set(Ms.z - Ln.z, _, u),
          Ii.set(Cs.z - Ln.z, l, d),
          b.Cross(Cn, Ii, ft),
          ft.x !== 0 &&
            (ft.normalize(),
            (s = -ft.y / ft.x),
            (c = -ft.z / ft.x),
            (ua.z += s),
            (ca.z += c),
            (pa.z += s),
            (_a.z += c),
            (da.z += s),
            (la.z += c));
        let p = this.T,
          m = this.B,
          f = this.N;
        b.Cross(Ti, ua, Ur),
          b.Cross(Ur, Ti, Mr),
          Lo.read(p, n * 3)
            .add(Mr)
            .write(p, n * 3),
          b.Cross(ca, Ti, Ur),
          b.Cross(Ti, Ur, Mr),
          Lo.read(m, n * 3)
            .add(Mr)
            .write(m, n * 3),
          b.Cross(Ri, pa, Ur),
          b.Cross(Ur, Ri, Mr),
          Lo.read(p, i * 3)
            .add(Mr)
            .write(p, i * 3),
          b.Cross(_a, Ri, Ur),
          b.Cross(Ri, Ur, Mr),
          Lo.read(m, i * 3)
            .add(Mr)
            .write(m, i * 3),
          b.Cross(Si, da, Ur),
          b.Cross(Ur, Si, Mr),
          Lo.read(p, a * 3)
            .add(Mr)
            .write(p, a * 3),
          b.Cross(la, Si, Ur),
          b.Cross(Si, Ur, Mr),
          Lo.read(m, a * 3)
            .add(Mr)
            .write(m, a * 3),
          Lo.read(f, n * 3)
            .add(Ti)
            .write(f, n * 3),
          Lo.read(f, i * 3)
            .add(Ri)
            .write(f, i * 3),
          Lo.read(f, a * 3)
            .add(Si)
            .write(f, a * 3);
      }
      static generate(e) {
        fa === void 0 &&
          ((fa = new b()),
          (ha = new b()),
          (Xp = new b()),
          (Ls = new b()),
          ($p = new b()),
          (zs = new b()));
        let o = fn(e, "position").buffer.length;
        (this.T = new Float32Array(o)),
          (this.B = new Float32Array(o)),
          (this.N = new Float32Array(o)),
          this.prepare(e);
        let n = o / 3,
          i = new Float32Array(n * 4);
        for (let a = 0; a < n; ++a) {
          fa.read(this.T, a * 3),
            Xp.read(this.B, a * 3),
            ha.read(this.N, a * 3),
            ha.normalize().write(this.N, a * 3);
          let s = b.Dot(ha, fa);
          $p.copy(ha).mul(s),
            Ls.copy(fa).sub($p),
            zs.copy(Ls).normalize(),
            b.Cross(ha, fa, Ls);
          let c = b.Dot(Ls, Xp);
          c = c < 0 ? -1 : 1;
          let _ = a * 4;
          (i[_] = zs.x), (i[_ + 1] = zs.y), (i[_ + 2] = zs.z), (i[_ + 3] = c);
        }
        hn(e, { buffer: i, stride: 4, name: "tangent" }),
          hn(e, { buffer: this.N, stride: 3, name: "normal" }),
          (this.T = void 0),
          (this.B = void 0),
          (this.N = void 0);
      }
    },
    YP = new Ns();
  var Yb = new L();
  var Ye = class {
      constructor() {
        this._mode = 0;
        this.location = new b();
        this.rotation = new $();
        this.scale = new b(1, 1, 1);
        this.world_matrix = new L();
        this.local_matrix = new L();
        this.view_matrix = new L();
        this.projection_matrix = new L();
        this.view_projection_matrix = new L();
        this.inverse_projection_matrix = new L();
        this.up = new b(0, 1, 0);
        this.vertical_fov = 45;
        this.aspect = 1;
        this.vertical_size = 100;
        this.horizontal_size = 100;
        this.near = 1;
        this.far = 1e4;
        this.perspective(this.vertical_fov, this.aspect, this.near, this.far);
      }
      set mode(e) {
        (this._mode = e),
          e === 0
            ? this.perspective(
                this.vertical_fov,
                this.aspect,
                this.near,
                this.far,
              )
            : this.orthographics(
                this.vertical_size,
                this.horizontal_size,
                this.near,
                this.far,
              );
      }
      get mode() {
        return this._mode;
      }
      update_world_matrix() {
        this.world_matrix.compose(this.location, this.rotation, this.scale);
      }
      update_view_matrix() {
        L.Inverse(this.world_matrix, this.view_matrix);
      }
      perspective(e, r, o, n) {
        return (
          (this.vertical_fov = e),
          (this.aspect = r),
          (this.near = o),
          (this.far = n),
          this.projection_matrix.perspective(e, r, o, n),
          this.update_projection_matrix()
        );
      }
      orthographics(e, r, o, n) {
        return (
          (this.near = o),
          (this.far = n),
          this.projection_matrix.orthographics(e, r, o, n),
          this.update_projection_matrix()
        );
      }
      look_at(e, r) {
        (r = r || this.up),
          Yb.look_at(this.location, e, r),
          this.rotation.from_mat4(Yb),
          this.update_world_matrix(),
          this.update_view_matrix();
      }
      copy(e) {
        return (
          this.location.copy(e.location),
          this.rotation.copy(e.rotation),
          this.scale.copy(e.scale),
          this.local_matrix.copy(e.local_matrix),
          this.world_matrix.copy(e.world_matrix),
          (this.mode = e.mode),
          (this.vertical_fov = e.vertical_fov),
          (this.aspect = e.aspect),
          (this.near = e.near),
          (this.far = e.far),
          this.projection_matrix.copy(e.projection_matrix),
          this.view_matrix.copy(e.view_matrix),
          this
        );
      }
      project(e) {
        return e.x === 0 && e.y === 0 && e.z === 0
          ? e.copy(this.location)
          : (e.apply_mat4(this.view_matrix).apply_mat4(this.projection_matrix),
            e);
      }
      unproject(e) {
        return (
          e
            .apply_mat4(this.inverse_projection_matrix)
            .apply_mat4(this.world_matrix),
          e
        );
      }
      resize(e, r) {
        return (
          this.mode === 0
            ? ((this.aspect = e / r),
              this.perspective(
                this.vertical_fov,
                this.aspect,
                this.near,
                this.far,
              ))
            : ((this.vertical_size = r),
              (this.horizontal_size = e),
              this.orthographics(
                this.vertical_size,
                this.horizontal_size,
                this.near,
                this.far,
              )),
          this
        );
      }
      update_projection_matrix() {
        return (
          this.inverse_projection_matrix.copy(this.projection_matrix).inverse(),
          this
        );
      }
      fit_box(e) {
        let r = this.fit_distance(e);
        this.location.normalize().mul(r), this.look_at(e.center);
      }
      fit_distance(e) {
        let o = e.size.length * 4;
        return Math.atan(this.vertical_fov * cr * 0.5) * o;
      }
    },
    c_ = new be();
  function Jb(t, e) {
    e.invalid ||
      (c_.copy(e),
      c_.apply_mat4(t.view_matrix),
      (t.near = Math.max(1, -c_.max.z)),
      (t.far = Math.max(-c_.min.z, t.near + 1e3)),
      isNaN(t.near) && (t.near = 1),
      isNaN(t.far) && (t.far = 1e4),
      t.update_projection_matrix());
  }
  function Kb(t) {
    let e = {};
    return (
      (e.mode = t.mode),
      (e.near = t.near),
      (e.far = t.far),
      (e.location = [t.location.x, t.location.y, t.location.z]),
      (e.rotation = [t.rotation.x, t.rotation.y, t.rotation.z, t.rotation.w]),
      (e.vertical_fov = t.vertical_fov),
      (e.aspect = t.aspect),
      (e.vertical_size = t.vertical_size),
      (e.horizontal_size = t.horizontal_size),
      e
    );
  }
  function __(t) {
    let e = new Ye();
    return (
      (e.mode = t.mode),
      (e.near = t.near),
      (e.far = t.far),
      (e.vertical_fov = t.vertical_fov),
      (e.aspect = t.aspect),
      (e.vertical_size = t.vertical_size),
      (e.horizontal_size = t.horizontal_size),
      t.mode === 0
        ? e.perspective(t.vertical_fov, t.aspect, t.near, t.far)
        : e.orthographics(t.vertical_size, t.horizontal_size, t.near, t.far),
      e.location.set(t.location[0], t.location[1], t.location[2]),
      e.rotation.set(
        t.rotation[0],
        t.rotation[1],
        t.rotation[2],
        t.rotation[3],
      ),
      e.update_world_matrix(),
      e.update_view_matrix(),
      e.update_projection_matrix(),
      e
    );
  }
  var ye = class {
      constructor(e) {
        this.key = e;
      }
    },
    bn = class {
      constructor() {
        this.listener_map = new Map();
      }
      on(e, r, o, n = !1) {
        let i = e.key,
          a = { event: i, callback: r, scope: o || this, once: n },
          s = this.listener_map.get(i);
        if (s === void 0) this.listener_map.set(i, [a]);
        else {
          let c = !1;
          for (let _ = 0, l = s.length; _ < l; ++_)
            s[_].event === a.event &&
              s[_].callback === a.callback &&
              ((c = !0), (s[_] = a));
          c || s.push(a);
        }
      }
      once(e, r, o) {
        this.on(e, r, o, !0);
      }
      off(e, r, o, n = !1) {
        let i = e.key,
          a = { event: i, callback: r, scope: o || this, once: n },
          s = this.listener_map.get(i);
        if (s)
          for (let c = 0, _ = s.length; c < _; ++c)
            s[c].event === a.event &&
              s[c].callback === a.callback &&
              s.splice(c, 1);
      }
      fire(e, r) {
        let o = e.key,
          n = this.listener_map.get(o);
        if (n)
          for (let i = n.length - 1; i >= 0; --i) {
            let a = n[i];
            o === a.event &&
              (a.callback.bind(a.scope || this),
              a.callback(r),
              a.once && n.splice(i, 1));
          }
      }
      dispose() {
        for (let e of this.listener_map.keys()) this.listener_map.delete(e);
      }
    },
    B = class {
      static on(e, r, o) {
        this.node.on(e, r, o);
      }
      static once(e, r, o) {
        this.node.once(e, r, o);
      }
      static fire(e, r) {
        this.node.fire(e, r);
      }
      static off(e, r, o) {
        this.node.off(e, r, o);
      }
    };
  B.node = new bn();
  var oe = {
    ForceUpdate: new ye("force update"),
    FileSystemChanged: new ye("file system changed"),
    MouseMove: new ye("mousemove"),
    MouseDrag: new ye("mousedrag"),
    MouseDown: new ye("mousedown"),
    MouseUp: new ye("mouseup"),
    PointerDown: new ye("pointer down"),
    PointerMove: new ye("pointer move"),
    PointerUp: new ye("pointer up"),
    TouchStart: new ye("touch start"),
    TouchMove: new ye("touch move"),
    TouchEnd: new ye("touch end"),
    KeyDown: new ye("keydown"),
    KeyUp: new ye("keyup"),
    MouseWheel: new ye("mousewheel"),
    Resize: new ye("resize"),
    XRSessionEnd: new ye("xr session end"),
  };
  var nt = ((I) => (
    (I[(I.Break = 3)] = "Break"),
    (I[(I.Backspace = 8)] = "Backspace"),
    (I[(I.Tab = 9)] = "Tab"),
    (I[(I.Clear = 12)] = "Clear"),
    (I[(I.Enter = 13)] = "Enter"),
    (I[(I.Shift = 16)] = "Shift"),
    (I[(I.Ctrl = 17)] = "Ctrl"),
    (I[(I.Alt = 18)] = "Alt"),
    (I[(I.Pause = 19)] = "Pause"),
    (I[(I.CapsLock = 20)] = "CapsLock"),
    (I[(I.Escape = 27)] = "Escape"),
    (I[(I.Space = 32)] = "Space"),
    (I[(I.PageUp = 33)] = "PageUp"),
    (I[(I.PageDown = 34)] = "PageDown"),
    (I[(I.End = 35)] = "End"),
    (I[(I.Home = 36)] = "Home"),
    (I[(I.Left = 37)] = "Left"),
    (I[(I.Up = 38)] = "Up"),
    (I[(I.Right = 39)] = "Right"),
    (I[(I.Down = 40)] = "Down"),
    (I[(I.Select = 41)] = "Select"),
    (I[(I.Print = 42)] = "Print"),
    (I[(I.Execute = 43)] = "Execute"),
    (I[(I.PrintScreen = 44)] = "PrintScreen"),
    (I[(I.Insert = 45)] = "Insert"),
    (I[(I.Delete = 46)] = "Delete"),
    (I[(I.help = 47)] = "help"),
    (I[(I.Key0 = 48)] = "Key0"),
    (I[(I.Key1 = 49)] = "Key1"),
    (I[(I.Key2 = 50)] = "Key2"),
    (I[(I.Key3 = 51)] = "Key3"),
    (I[(I.Key4 = 52)] = "Key4"),
    (I[(I.Key5 = 53)] = "Key5"),
    (I[(I.Key6 = 54)] = "Key6"),
    (I[(I.Key7 = 55)] = "Key7"),
    (I[(I.Key8 = 56)] = "Key8"),
    (I[(I.Key9 = 57)] = "Key9"),
    (I[(I.Colon = 58)] = "Colon"),
    (I[(I.Less = 60)] = "Less"),
    (I[(I.At = 64)] = "At"),
    (I[(I.a = 65)] = "a"),
    (I[(I.b = 66)] = "b"),
    (I[(I.c = 67)] = "c"),
    (I[(I.d = 68)] = "d"),
    (I[(I.e = 69)] = "e"),
    (I[(I.f = 70)] = "f"),
    (I[(I.g = 71)] = "g"),
    (I[(I.h = 72)] = "h"),
    (I[(I.i = 73)] = "i"),
    (I[(I.j = 74)] = "j"),
    (I[(I.k = 75)] = "k"),
    (I[(I.l = 76)] = "l"),
    (I[(I.m = 77)] = "m"),
    (I[(I.n = 78)] = "n"),
    (I[(I.o = 79)] = "o"),
    (I[(I.p = 80)] = "p"),
    (I[(I.q = 81)] = "q"),
    (I[(I.r = 82)] = "r"),
    (I[(I.s = 83)] = "s"),
    (I[(I.t = 84)] = "t"),
    (I[(I.u = 85)] = "u"),
    (I[(I.v = 86)] = "v"),
    (I[(I.w = 87)] = "w"),
    (I[(I.x = 88)] = "x"),
    (I[(I.y = 89)] = "y"),
    (I[(I.z = 90)] = "z"),
    (I[(I.LeftCommand = 91)] = "LeftCommand"),
    (I[(I.RightCommand = 93)] = "RightCommand"),
    (I[(I.Sleep = 95)] = "Sleep"),
    (I[(I.Num0 = 96)] = "Num0"),
    (I[(I.Num1 = 97)] = "Num1"),
    (I[(I.Num2 = 98)] = "Num2"),
    (I[(I.Num3 = 99)] = "Num3"),
    (I[(I.Num4 = 100)] = "Num4"),
    (I[(I.Num5 = 101)] = "Num5"),
    (I[(I.Num6 = 102)] = "Num6"),
    (I[(I.Num7 = 103)] = "Num7"),
    (I[(I.Num8 = 104)] = "Num8"),
    (I[(I.Num9 = 105)] = "Num9"),
    (I[(I.Multiply = 106)] = "Multiply"),
    (I[(I.Add = 107)] = "Add"),
    (I[(I.Periodic = 108)] = "Periodic"),
    (I[(I.Subtract = 109)] = "Subtract"),
    (I[(I.Point = 110)] = "Point"),
    (I[(I.Divide = 111)] = "Divide"),
    (I[(I.F1 = 112)] = "F1"),
    (I[(I.F2 = 113)] = "F2"),
    (I[(I.F3 = 114)] = "F3"),
    (I[(I.F4 = 115)] = "F4"),
    (I[(I.F5 = 116)] = "F5"),
    (I[(I.F6 = 117)] = "F6"),
    (I[(I.F7 = 118)] = "F7"),
    (I[(I.F8 = 119)] = "F8"),
    (I[(I.F9 = 120)] = "F9"),
    (I[(I.F10 = 121)] = "F10"),
    (I[(I.F11 = 122)] = "F11"),
    (I[(I.F12 = 123)] = "F12"),
    (I[(I.Semicolon = 186)] = "Semicolon"),
    (I[(I.Equal = 187)] = "Equal"),
    (I[(I.Comma = 188)] = "Comma"),
    (I[(I.Minus = 189)] = "Minus"),
    (I[(I.Period = 190)] = "Period"),
    (I[(I.Slash = 191)] = "Slash"),
    (I[(I.BackQuote = 192)] = "BackQuote"),
    (I[(I.BracketL = 219)] = "BracketL"),
    (I[(I.BackSlash = 220)] = "BackSlash"),
    (I[(I.BracketR = 221)] = "BracketR"),
    (I[(I.Quote = 222)] = "Quote"),
    I
  ))(nt || {});
  var l_ = class {
    constructor() {
      this.start = new T();
      this.drag_start = new T();
      this.end = new T();
      this.delta = new T();
      this.mouse_button = -1;
      this.onmousedown = (e) => {
        window.addEventListener("mousemove", this.onmousedrag, !1),
          window.addEventListener("mouseup", this.onmouseup, !1),
          (this.mouse_button = e.button),
          this.start.set(e.clientX, e.clientY),
          this.drag_start.copy(this.start),
          B.fire(oe.MouseDown, {
            button: e.button,
            point: this.start,
            delta: this.delta,
            event: e,
          });
      };
      this.onmousedrag = (e) => {
        this.end.set(e.clientX, e.clientY),
          this.delta.copy(this.end).sub(this.drag_start),
          this.drag_start.copy(this.end),
          B.fire(oe.MouseDrag, {
            button: this.mouse_button,
            point: this.end,
            delta: this.delta,
            event: e,
          });
      };
      this.onmousemove = (e) => {
        this.end.set(e.clientX, e.clientY),
          this.delta.copy(this.end).sub(this.start),
          this.start.copy(this.end),
          B.fire(oe.MouseMove, {
            button: this.mouse_button,
            point: this.end,
            delta: this.delta,
            event: e,
          });
      };
      this.onmouseup = (e) => {
        window.removeEventListener("mousemove", this.onmousedrag),
          window.removeEventListener("mouseup", this.onmouseup),
          B.fire(oe.MouseUp, {
            button: this.mouse_button,
            point: this.end,
            delta: this.delta,
            event: e,
          }),
          (this.mouse_button = -1);
      };
      this.onmousewheel = (e) => {
        let r = e,
          o = 0;
        r.wheelDelta !== void 0
          ? (o = r.wheelDelta)
          : r.deltaY !== void 0 && (o = -r.deltaY),
          (o = o > 0 ? 0.95 : 1.05),
          B.fire(oe.MouseWheel, {
            delta: o,
            event: e,
            delta_y: r.deltaY,
            delta_x: r.deltaX,
          });
      };
      this.onmousescroll = (e) => {
        let r = 0,
          o = 0,
          n = 0;
        (n = e.detail < 0 ? 0.95 : 1.05),
          e.axis === 1
            ? (r = -e.detail * 2)
            : e.axis === 2 && (o = -e.detail * 2),
          B.fire(oe.MouseWheel, { delta: n, event: e, delta_y: o, delta_x: r });
      };
      this.onkeydown = (e) => {
        e.keyCode !== 123 && e.preventDefault(),
          B.fire(oe.KeyDown, { keycode: e.keyCode, event: e });
      };
      this.onkeyup = (e) => {
        e.keyCode !== 123 && e.preventDefault(),
          B.fire(oe.KeyUp, { keycode: e.keyCode, event: e });
      };
      this.ontouchstart = (e) => {
        let r = e.touches.item(e.touches.length - 1);
        this.start.set(r.clientX, r.clientY),
          this.end.copy(this.start),
          (this.mouse_button = 0);
        let o = { button: 0, point: this.end, delta: this.delta };
        B.fire(oe.TouchStart, o);
      };
      this.ontouchmove = (e) => {
        let r = e.touches.item(e.touches.length - 1);
        this.end.set(r.clientX, r.clientY),
          this.delta.copy(this.end).sub(this.start),
          this.start.copy(this.end),
          B.fire(oe.TouchMove, {
            button: 0,
            point: this.end,
            delta: this.delta,
          });
      };
      this.ontouchend = (e) => {
        if (e.touches.length > 0) {
          let o = e.touches.item(e.touches.length - 1);
          this.end.set(o.clientX, o.clientY);
        }
        let r = { button: 0, point: this.end, delta: this.delta };
        B.fire(oe.TouchEnd, r);
      };
      this.bind(window);
    }
    bind(e) {
      this.unbind(),
        e.addEventListener("mousedown", this.onmousedown, !1),
        e.addEventListener("mousemove", this.onmousemove, !1),
        e.addEventListener("mousewheel", this.onmousewheel, !1),
        e.addEventListener("DOMMouseScroll", this.onmousescroll, !1),
        e.addEventListener("keydown", this.onkeydown, !1),
        e.addEventListener("keyup", this.onkeyup, !1),
        e.addEventListener("touchstart", this.ontouchstart, !1),
        e.addEventListener("touchmove", this.ontouchmove, !1),
        e.addEventListener("touchend", this.ontouchend, !1),
        e.addEventListener("touchcancel", this.ontouchend, !1),
        (this.element = e);
    }
    unbind() {
      this.element &&
        (this.element.removeEventListener("mousedown", this.onmousedown),
        this.element.removeEventListener("mousemove", this.onmousemove),
        this.element.removeEventListener("mousewheel", this.onmousewheel),
        this.element.removeEventListener("keydown", this.onkeydown),
        this.element.removeEventListener("keyup", this.onkeyup),
        this.element.removeEventListener("touchstart", this.ontouchstart),
        this.element.removeEventListener("touchmove", this.ontouchmove),
        this.element.removeEventListener("touchend", this.ontouchend),
        this.element.removeEventListener("touchcancel", this.ontouchend));
    }
  };
  var ba = class {
    constructor() {
      this.axis_map = {};
      this.key_map = new Set();
      this.onkeydown = (e) => {
        let r = e.keycode;
        r === 38
          ? this.set_axis(1, 1)
          : r === 40
            ? this.set_axis(1, -1)
            : r === 37
              ? this.set_axis(0, -1)
              : r === 39 && this.set_axis(0, 1),
          this.key_map.add(r);
      };
      this.onkeyup = (e) => {
        let r = e.keycode;
        r === 38 || r === 40
          ? this.set_axis(1, 0)
          : (r === 37 || r === 39) && this.set_axis(0, 0),
          this.key_map.delete(r);
      };
      B.on(oe.KeyDown, this.onkeydown), B.on(oe.KeyUp, this.onkeyup);
    }
    static Instance() {
      return this._instance || (this._instance = new ba());
    }
    set_axis(e, r) {
      this.axis_map[e] = r;
    }
    get_axis(e) {
      return this.axis_map[e] || 0;
    }
    get_button(e) {
      return this.key_map.has(e);
    }
  };
  var ze = {
      BeforeTick: new ye("before tick"),
      AfterTick: new ye("after tick"),
      BeforeFrame: new ye("before frame"),
      AfterFrame: new ye("after frame"),
      Frame: new ye("frame"),
    },
    u_ = class {
      constructor() {
        this.swap_chain = -1;
        this.frame_index = 0;
        this.time = performance.now() * 0.001;
        this.last_time = performance.now() * 0.001;
        this.delta_time = performance.now() * 0.001;
        this.paused = !0;
        this.tick = () => {
          (this.time = performance.now() * 0.001),
            (this.delta_time = this.time - this.last_time),
            B.fire(ze.BeforeTick),
            B.fire(ze.BeforeFrame),
            B.fire(ze.Frame),
            B.fire(ze.AfterFrame),
            B.fire(ze.AfterTick),
            (this.last_time = this.time),
            Gb(),
            (this.swap_chain = requestAnimationFrame(this.tick));
        };
        (this.input = ba.Instance()),
          (this.mouse_input = new l_()),
          B.on(oe.XRSessionEnd, () => {
            this.paused && this.start();
          });
      }
      get abs_delta_time() {
        return performance.now() * 0.001 - this.last_time;
      }
      start() {
        this.tick(), (this.paused = !1);
      }
      pause() {
        cancelAnimationFrame(this.swap_chain), (this.paused = !0);
      }
      terminate() {}
    };
  var Bs = class extends pn {
    constructor() {
      super(...arguments);
      this.name = "anonymous";
      this.type = 0;
    }
  };
  var p_ = class {
    constructor() {
      this.root = this.node = new Bs();
    }
    trace_start(e, r, o, n = 0) {
      let i = performance.now(),
        a = new Bs();
      (a.name = e),
        (a.start = i),
        (a.description = r),
        (a.data = o),
        (a.type = n),
        this.node.add(a),
        (this.node = a);
    }
    trace_end(e) {
      let r = [],
        o = this.node;
      for (; o && o.name !== e; ) r.push(o), (o = o.parent);
      if (o === void 0) throw `invalid trace end ${e}`;
      {
        let n = performance.now();
        for (let i = 0; i < r.length; i++) {
          let a = r[i];
          a.end = n;
        }
        (o.end = n), (this.node = o.parent);
      }
    }
    reset() {
      (this.root = this.node = new Bs()), (this.root.start = performance.now());
    }
  };
  var d_ = class {
    constructor() {
      this.ray = new i_();
    }
    set_from_camera(e, r) {
      if (e.mode === 0)
        this.ray.origin.copy(e.location),
          e
            .unproject(this.ray.direction.set(r.x, r.y, 0.5))
            .sub(this.ray.origin)
            .normalize();
      else if (e.mode === 1)
        e.unproject(
          this.ray.origin.set(r.x, r.y, (e.near + e.far) / (e.near - e.far)),
        ),
          this.ray.direction.set(0, 0, -1).transform_direction(e.world_matrix);
      else throw "unsupported camera mode";
      return this;
    }
  };
  var Cr = class extends pn {
    constructor(r = "root") {
      super();
      this.name = r;
      this.is_scene_node = !0;
      this.location = new b();
      this.rotation = new $(0, 0, 0, 1);
      this.scale = new b(1, 1, 1);
      this.world_location = new b();
      this.world_rotation = new $(0, 0, 0, 1);
      this.world_scale = new b(1, 1, 1);
      this.world_matrix = new L();
      this.local_matrix = new L();
      this.euler_order = "XYZ";
      this.id = "";
      this.entity = 0;
      this.folded = !1;
      this.transform_updated = !0;
    }
    static is(r) {
      return r.is_scene_node;
    }
    serialize() {
      let r = {};
      return (
        (r.name = this.name),
        (r.location = Array.from(this.location.elements)),
        (r.rotation = Array.from(this.rotation.elements)),
        (r.scale = Array.from(this.scale.elements)),
        r
      );
    }
    deserialize(r) {
      (this.name = r.name),
        this.location.read(r.location),
        this.rotation.read(r.rotation),
        this.scale.read(r.scale);
    }
    clone(r = !0) {
      let o = new Cr(this.name);
      if (
        (o.location.copy(this.location),
        o.rotation.copy(this.rotation),
        o.scale.copy(this.scale),
        (o.mesh = this.mesh),
        r)
      )
        for (let n = 0; n < this.children.length; ++n)
          o.add(this.children[n].clone());
      return o;
    }
  };
  function ya(t, e = !0) {
    bo(t, (r) => {
      r.local_matrix.compose(r.location, r.rotation, r.scale),
        r.parent
          ? L.Mul(r.parent.world_matrix, r.local_matrix, r.world_matrix)
          : r.world_matrix.copy(r.local_matrix),
        e &&
          r.world_matrix.decompose(
            r.world_location,
            r.world_rotation,
            r.world_scale,
          );
    });
  }
  var ty,
    qp,
    zn = class {
      constructor(e) {
        this.camera = e;
        this.enabled = !0;
        this.movable = !0;
        this.interpolated_spherical = new Ot();
        this.current_spherical = new Ot();
        this.center = new b();
        this.interpolated_center = new b();
        this.damping = 0.45;
        this.location = new b();
        this.interpolated_location = new b();
        this.rotate_speed = Math.PI * 2;
        this.zoom_speed = 1;
        this.move_speed = 2;
        this.min_polar_angle = 0.001;
        this.max_polar_angle = Math.PI;
        this.changed = !1;
        ty === void 0 && ((ty = new T()), (qp = new b())),
          this.set_target(e.location),
          e.look_at(this.center);
      }
      set_target(e) {
        this.location.copy(e),
          this.current_spherical.from_float3(this.location),
          this.interpolated_spherical.copy(this.current_spherical),
          this.interpolated_center.copy(this.center),
          (this.changed = !0);
      }
      set_center(e) {
        this.center.copy(e);
      }
      rotate_horizontal(e) {
        (this.current_spherical.phi += e * this.rotate_speed),
          e !== 0 && (this.changed = !0);
      }
      rotate_vertical(e) {
        (this.current_spherical.theta = Q(
          this.current_spherical.theta - e * this.rotate_speed,
          this.min_polar_angle,
          this.max_polar_angle,
        )),
          e !== 0 && (this.changed = !0);
      }
      move(e) {
        this.movable &&
          (qp
            .set(e.x, e.y, 0)
            .mul(this.current_spherical.radius * this.move_speed),
          this.center.add(qp.apply_quaternion(this.camera.rotation)),
          (e.x !== 0 || e.y !== 0) && (this.changed = !0));
      }
      zoom(e) {
        (this.current_spherical.radius *= e * this.zoom_speed),
          e !== 1 && (this.changed = !0);
      }
      update(e) {
        if (!this.enabled) return !1;
        this.interpolated_spherical.lerp(this.current_spherical, this.damping),
          this.interpolated_location.from_spherical(
            this.interpolated_spherical,
          ),
          this.interpolated_center.lerp(this.center, this.damping),
          this.interpolated_location.add(this.interpolated_center),
          this.location.copy(this.interpolated_location),
          this.camera.location.copy(this.location),
          this.camera.look_at(this.interpolated_center);
        let r = this.changed;
        return (this.changed = !1), r;
      }
    };
  var rD = new b();
  var m_ = class {
    constructor(e) {
      this.name = e;
      this.channels = [];
      this.max_time = 0;
    }
    add(e) {
      this.channels.push(e);
    }
  };
  var Nn = class {
    constructor(e = "", r = []) {
      this.name = e;
      this.bones = r;
      this.bone_index_map = new Map();
      this.skin_matries = new Float32Array();
      this.bind_inverse_matries = new Float32Array();
    }
    get bone_count() {
      return this.bones.length;
    }
    compile() {
      this.bind_inverse_matries = new Float32Array(this.bones.length * 16);
      for (let e = 0; e < this.bones.length; e++) {
        let r = this.bones[e];
        r &&
          (this.bone_index_map.set(r.name, e),
          r.bind_inverse_matrix.write(this.bind_inverse_matries, e * 16));
      }
      this.skin_matries = new Float32Array(this.bones.length * 16);
    }
    update_local_transform() {
      let e = S(L),
        r = S(L);
      ya(this.bones[0], !1);
      for (let o = 0; o < this.bones.length; o++)
        this.bones[o] && (e.identity(), e.write(this.skin_matries, o * 16));
      R(r), R(e);
    }
  };
  var ry = 0,
    f_ = new Map();
  function Qp() {
    (ry = 0), f_.clear();
  }
  function Zp(t) {
    let e = t.id;
    if (f_.has(e)) return f_.get(e);
    {
      let r = ry++;
      return f_.set(e, r), r;
    }
  }
  var $T = 0;
  function qT() {
    return $T++;
  }
  var QT = {
      enabled: !1,
      src_alpha_factor: 1,
      dst_alpha_factor: 771,
      src_color_factor: 770,
      dst_color_factor: 771,
      color_func: 32774,
      alpha_func: 32774,
    },
    oy = {
      primitive_type: 4,
      cull_mode: 1029,
      depth_compare_func: 515,
      depth_write: !0,
      vertex_order: 2305,
      blend: QT,
    },
    ny = `#version 300 es
precision highp float;
`,
    iy = /#version/,
    ZT = /#define skip_global_precision/,
    YT = /uniform usampler2D/,
    JT = /uniform sampler2D/,
    KT = /uniform sampler2DShadow/,
    eR = /uniform samplerCube/,
    tR = /#pragma include ([A-z]{1}[A-z0-9]+)/g;
  function ay(t) {
    let e = "";
    return (
      t.search(ZT) > -1 ||
        (t.search(YT) > -1 &&
          (e += `precision highp usampler2D;
`),
        t.search(JT) > -1 &&
          (e += `precision highp sampler2D;
`),
        t.search(KT) > -1 &&
          (e += `precision highp sampler2DShadow;
`),
        t.search(eR) > -1 &&
          (e += `precision highp samplerCube;
`)),
      e
    );
  }
  function sy(t) {
    let e,
      r = [];
    for (; (e = tR.exec(t)) != null; ) r.push({ block: e[0], lib: e[1] });
    for (let o of r) {
      let n = _y.get(o.lib) ?? `// module not found ${o.lib}`;
      t = t.replace(o.block, n);
    }
    return t;
  }
  function Me(t) {
    let e = Object.assign({}, oy, t);
    e.blend = Object.assign({}, oy.blend, t.blend);
    let o = C.CurrentDevice().gl,
      n = "",
      i = "";
    if (e.combined_shader) {
      let w = e.combined_shader.split(/#define SPLITTER/);
      (n += w[0]), (i += w[1]);
    } else (n += t.vertex_shader), (i += t.fragment_shader);
    if (!n) throw "invalid vertex shader source.";
    if (!i) throw "invalid fragment shader source.";
    let a = n.search(iy) > -1 ? "" : ny,
      s = i.search(iy) > -1 ? "" : ny,
      c = t.defines || [];
    for (let w = 0; w < c.length; ++w)
      (a += `#define ${c[w]} 1
`),
        (s += `#define ${c[w]} 1
`);
    (n = sy(n)),
      (i = sy(i)),
      (a += ay(n)),
      (s += ay(i)),
      (n = a + n),
      (i = s + i);
    let _ = o.createProgram();
    if (_ === null) throw new Error("program create error");
    o.attachShader(_, cy(o, n, o.VERTEX_SHADER)),
      o.attachShader(_, cy(o, i, o.FRAGMENT_SHADER)),
      o.linkProgram(_);
    let l = {},
      u = [],
      {
        cull_mode: d,
        depth_compare_func: p,
        depth_write: m,
        vertex_order: f,
      } = e,
      y = e.name ?? "unnamed pipeline",
      g = e.blend,
      v = {
        name: y,
        valid: !0,
        id: qT(),
        vertex_shader: n,
        fragment_shader: i,
        webgl_program: _,
        uniform_block: l,
        uniforms: u,
        cull_mode: d,
        depth_compare_func: p,
        depth_write: m,
        vertex_order: f,
        blend: g,
        attribute_slot: {},
      };
    return rR(v, t.uniforms ?? []), v;
  }
  function rR(t, e) {
    let r = t.webgl_program,
      o = new Map(),
      n = t.uniform_block,
      i = t.uniforms,
      a = C.CurrentDevice().gl;
    if (i)
      for (let c = 0; c < e.length; ++c) {
        let _ = e[c],
          { name: l, type: u, editable: d, default_value: p } = _;
        if (l.search(/\./) > -1) {
          let g = l.split(/\./)[0],
            v = o.get(g);
          v ? v.push(_) : ((v = [_]), o.set(g, v));
          continue;
        }
        let m = a.getUniformLocation(r, l);
        if (!m) continue;
        let f;
        switch (u) {
          case 1:
            f = iR.bind(void 0, a, m);
            break;
          case 2:
            f = aR.bind(void 0, a, m);
            break;
          case 3:
            f = sR.bind(void 0, a, m);
            break;
          case 5:
            f = _R.bind(void 0, a, m);
            break;
          case 6:
            f = lR.bind(void 0, a, m);
          case 7:
          case 4:
            f = cR.bind(void 0, a, m);
            break;
          case 8:
            f = uR.bind(void 0, a, m);
            break;
          case 9:
            f = pR.bind(void 0, a, m);
            break;
          case 12:
          case 10:
            f = dR.bind(void 0, a, m);
            break;
          case 11:
            f = mR.bind(void 0, a, m);
            break;
          default:
            throw new Error(`invalid uniform type: ${u}`);
        }
        let y = { name: l, upload: f, type: u };
        (y.editable = d ?? !1),
          p !== void 0 && (y.default_value = p),
          (n[l] = y),
          i.push(y);
      }
    let s = 0;
    for (let [c, _] of o) {
      if (_.length <= 0) continue;
      let l = a.getUniformBlockIndex(r, c),
        u = a.getActiveUniformBlockParameter(r, l, a.UNIFORM_BLOCK_DATA_SIZE),
        d = new Float32Array(u / 4),
        p = a.createBuffer();
      a.bindBuffer(a.UNIFORM_BUFFER, p),
        a.bufferData(a.UNIFORM_BUFFER, u, a.DYNAMIC_DRAW),
        a.bindBuffer(a.UNIFORM_BUFFER, null),
        a.bindBufferBase(a.UNIFORM_BUFFER, s, p);
      let m = _.map((w) => w.name.split(/\./)[1]),
        f = a
          .getUniformIndices(r, m)
          .filter((w, k) =>
            w > a.ACTIVE_UNIFORMS
              ? (console.warn(`struct uniform ${c}.${m[k]} not found.`), !1)
              : !0,
          ),
        y = a.getActiveUniforms(r, f, a.UNIFORM_OFFSET);
      for (let w = 0; w < _.length; ++w) {
        let { name: k, type: D, editable: G, default_value: U } = _[w],
          Y;
        switch (D) {
          case 1:
          case 5:
          case 6:
            Y = (X) => {
              d[y[w] / 4] = X;
            };
            break;
          case 2:
          case 3:
          case 7:
          case 4:
          case 8:
          case 9:
            Y = (X) => {
              X.write(d, y[w] / 4);
            };
            break;
          default:
            throw new Error(`invalid uniform type: ${D}`);
        }
        let le = { name: k, upload: Y, type: D, editable: G, default_value: U };
        (n[k] = le), i.push(le);
      }
      a.uniformBlockBinding(r, l, s);
      let g = fR.bind(void 0, a, p, s, d),
        v = { name: c, upload: g, type: 14, editable: !1, struct_index: s };
      (n[c] = v), i.push(v), s++;
    }
  }
  var _y = new Map();
  function ga(t, e) {
    _y.set(t, e);
  }
  var oR =
    /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
  function nR(t, e, r, o) {
    let n = "";
    for (let i = parseInt(e); i < parseInt(r); i++)
      n += o
        .replace(/\[\s*i\s*\]/g, "[" + i + "]")
        .replace(/UNROLLED_LOOP_INDEX/g, i.toString());
    return n;
  }
  function cy(t, e, r) {
    e = e.replace(oR, nR);
    let o = t.createShader(r);
    t.shaderSource(o, e), t.compileShader(o);
    let n = t.getShaderInfoLog(o);
    if (n != "") {
      let i = e.split(`
`),
        a = i.length,
        s = zp(a);
      console.log(
        i.map((c, _) => `${" ".repeat(s - zp(_ + 1))}${_ + 1}|${c}`).join(`
`),
      ),
        console.warn(`shader error info:
${n}`);
    }
    return o;
  }
  function iR(t, e, r) {
    r instanceof Float32Array ? t.uniform1fv(e, r) : t.uniform1f(e, r);
  }
  function aR(t, e, r) {
    r instanceof Float32Array
      ? t.uniform2fv(e, r)
      : t.uniform2fv(e, r.elements);
  }
  function sR(t, e, r) {
    r instanceof Float32Array
      ? t.uniform3fv(e, r)
      : t.uniform3fv(e, r.elements);
  }
  function cR(t, e, r) {
    r instanceof Float32Array
      ? t.uniform4fv(e, r)
      : t.uniform4fv(e, r.elements);
  }
  function _R(t, e, r) {
    t.uniform1ui(e, r);
  }
  function lR(t, e, r) {
    t.uniform1i(e, r);
  }
  function uR(t, e, r) {
    r instanceof Float32Array
      ? t.uniformMatrix3fv(e, !1, r)
      : t.uniformMatrix3fv(e, !1, r.elements);
  }
  function pR(t, e, r) {
    r instanceof Float32Array
      ? t.uniformMatrix4fv(e, !1, r)
      : t.uniformMatrix4fv(e, !1, r.elements);
  }
  function dR(t, e, r) {
    if (!r) return;
    let o = Zp(r);
    t.activeTexture(t.TEXTURE0 + o),
      t.bindTexture(r.texture_type, r.webgl_texture),
      t.uniform1i(e, o);
  }
  function mR(t, e, r) {
    if (!r) return;
    let o = Zp(r);
    t.activeTexture(t.TEXTURE0 + o),
      t.bindTexture(r.texture_type, r.webgl_texture),
      t.uniform1i(e, o);
  }
  function fR(t, e, r, o) {
    t.bindBuffer(t.UNIFORM_BUFFER, e),
      t.bufferSubData(t.UNIFORM_BUFFER, 0, o),
      t.bindBufferBase(t.UNIFORM_BUFFER, r, e),
      t.bindBuffer(t.UNIFORM_BUFFER, null);
  }
  var bR = {
      position: 0,
      uv: 1,
      normal: 2,
      tangent: 3,
      color: 4,
      skin: 5,
      weight: 6,
      uv2: 7,
    },
    yR = 4;
  function gR(t) {
    if (t instanceof Float32Array) return 5126;
    if (t instanceof Int16Array) return 5122;
    if (t instanceof Int32Array) return 5124;
    if (t instanceof Int8Array) return 5121;
    if (t instanceof Uint16Array) return 5123;
    if (t instanceof Uint32Array) return 5125;
    if (t instanceof Uint8Array) return 5125;
    throw `invalid buffer type ${typeof t}.`;
  }
  function ce(t) {
    let e,
      r = !1,
      o = 0,
      n = !1,
      i = C.CurrentDevice().gl,
      a = t.primitive;
    if (!a) throw "Fatal error, create draw without primitive";
    let s = se(t.type, 4),
      c = se(t.uniforms, {}),
      _ = se(t.force_update, new Set()),
      l = se(t.storage_mode, 1),
      u = Zb(a);
    fn(a, "tangent") && Ns.generate(a),
      (e = i.createVertexArray()),
      i.bindVertexArray(e);
    let d = {},
      p = [],
      m = yR;
    for (let g = 0; g < a.attributes.length; ++g) {
      let v = a.attributes[g];
      if (v.name === "generic") continue;
      let w = i.createBuffer();
      if (w === null) throw new Error("WebGL Buffer Create Failed.");
      let k = i.STATIC_DRAW;
      v.dynamic && ((k = i.DYNAMIC_DRAW), (n = !0));
      let D = gR(v.buffer),
        G = v.stride;
      i.bindBuffer(i.ARRAY_BUFFER, w),
        i.bufferData(i.ARRAY_BUFFER, v.buffer, k);
      let U = v.slot !== void 0 ? v.slot : bR[v.name || "position"];
      (U = U !== void 0 ? U : m++),
        D === 5126 || D === 5131
          ? i.vertexAttribPointer(U, v.stride, D, !1, 0, 0)
          : i.vertexAttribIPointer(U, v.stride, D, 0, 0);
      let Y = {
        stride: G,
        buffer: w,
        name: v.name || "position",
        dynamic: n,
        source_buffer: n ? v.buffer : void 0,
      };
      p.push(Y),
        (d[Y.name] = Y),
        i.enableVertexAttribArray(U),
        v.name === "position" && (o = v.buffer.length / G);
    }
    let f = null;
    a.index !== void 0 &&
      ((f = i.createBuffer()),
      i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, f),
      i.bufferData(i.ELEMENT_ARRAY_BUFFER, a.index, i.STATIC_DRAW),
      (o = a.index.length),
      (r = !0));
    let y = se(t.range, { start: 0, count: o });
    return (
      i.bindVertexArray(null),
      {
        webgl_vao: e,
        indexed: r,
        max_vertex_count: o,
        primitive: a,
        box: u,
        attributes: p,
        attribute_map: d,
        index_buffer: f,
        type: s,
        range: y,
        uniforms: c,
        force_update: _,
        storage_mode: l,
      }
    );
  }
  function h_(t) {
    let e = C.CurrentDevice().gl;
    if (!(!t.attribute_map || !t.attributes)) {
      e.bindVertexArray(t.webgl_vao);
      for (let r = 0; r < t.attributes.length; ++r) {
        let o = t.attributes[r];
        o.dynamic &&
          (e.bindBuffer(e.ARRAY_BUFFER, o.buffer),
          e.bufferSubData(
            e.ARRAY_BUFFER,
            0,
            o.source_buffer,
            0,
            o.update_length ?? o.source_buffer.length,
          ));
      }
      e.bindVertexArray(null);
    }
  }
  var wR = 0;
  function vR() {
    return wR++;
  }
  function pr(t) {
    let e = C.CurrentDevice(),
      r = e.gl,
      o = se(t.name, "unnamed pass"),
      n = se(t.width, e.width),
      i = se(t.height, e.height),
      a = t.depth_target,
      s = se(t.color_targets, []),
      c = se(t.color_load_action, 0),
      _ = se(t.depth_load_action, 0),
      l = t.clear_color ?? new H(),
      u = se(t.clear_depth, 1);
    e.encoder.set_pass();
    let d = r.createFramebuffer();
    if ((r.bindFramebuffer(r.FRAMEBUFFER, d), a === void 0)) {
      let m = r.createRenderbuffer();
      r.bindRenderbuffer(r.RENDERBUFFER, m),
        r.renderbufferStorage(r.RENDERBUFFER, r.DEPTH_COMPONENT32F, n, i),
        r.framebufferRenderbuffer(
          r.FRAMEBUFFER,
          r.DEPTH_ATTACHMENT,
          r.RENDERBUFFER,
          m,
        );
    } else
      r.framebufferTexture2D(
        r.FRAMEBUFFER,
        r.DEPTH_ATTACHMENT,
        r.TEXTURE_2D,
        a.texture.webgl_texture,
        0,
      );
    if (s) {
      let m = [];
      for (let f = 0; f < s.length; ++f) m.push(r.COLOR_ATTACHMENT0 + f);
      r.drawBuffers(m);
      for (let f = 0; f < s.length; ++f) {
        let y = s[f],
          g = y.texture,
          v = se(y.layer, 0);
        r.bindTexture(g.texture_type, g.webgl_texture),
          r.framebufferTexture2D(
            r.FRAMEBUFFER,
            m[f],
            g.texture_type,
            g.webgl_texture,
            v,
          );
      }
      r.bindTexture(r.TEXTURE_2D, null);
    }
    let p = r.checkFramebufferStatus(r.FRAMEBUFFER);
    if (p != r.FRAMEBUFFER_COMPLETE) throw "fb status: " + p.toString(16);
    return (
      r.bindFramebuffer(r.FRAMEBUFFER, null),
      {
        name: o,
        color_targets: s,
        depth_target: a,
        id: vR(),
        webgl_framebuffer: d,
        width: n,
        height: i,
        color_load_action: c,
        depth_load_action: _,
        clear_color: l,
        clear_depth: u,
      }
    );
  }
  function Lr(t) {
    t &&
      t.webgl_framebuffer &&
      C.CurrentDevice().gl.deleteFramebuffer(t.webgl_framebuffer);
  }
  var Yp;
  function dy(t, e = Yp) {
    if (
      (e === void 0 &&
        ((Yp = { type: 7, clear_color: new H(0, 0, 0, 0), clear_depth: 1 }),
        (e = Yp)),
      t)
    ) {
      let o = C.CurrentDevice().encoder,
        n = o.current_pass;
      o.set_pass(t), o.clear(e), o.set_pass(n);
    }
  }
  var kG = new x(),
    b_ = class {
      constructor(e) {
        this.device = e;
        this.last_viewport = new x();
        this.viewport = new x();
        this.profiler = new p_();
        this.recording = !1;
        this.clear_action = {
          type: 7,
          clear_color: new H(0, 0, 0, 0),
          clear_depth: 1,
        };
        this.global_uniforms = {
          view_matrix: new L(),
          projection_matrix: new L(),
          time: 0,
          base_color: new H().set_hex_string("9ea9b4"),
          world_matrix: new L(),
        };
        this.uniform_cache = new Map();
        this.set_draw = (e, r, o) => {
          this.recording && this.profiler.trace_start("set draw", o, e, 4);
          let n = this.gl;
          if (this.current_pipeline === void 0)
            throw new Error("No active pipeline");
          let i = this.current_pipeline,
            a = i.uniforms;
          for (let s = 0; s < a.length; ++s) {
            let c = a[s],
              _ = c.name,
              l =
                (r && r[_] && r[_].value) ||
                e.uniforms[_] ||
                i.uniform_block[_].default_value ||
                this.global_uniforms[_];
            (this.uniform_cache.get(_) === l && !e.force_update.has(_)) ||
              (this.recording &&
                this.profiler.trace_start("upload uniform", `${_} ${l}`, l, 3),
              l !== void 0 && c.upload(l),
              this.recording && this.profiler.trace_end("upload uniform"),
              this.uniform_cache.set(_, l));
          }
          e.webgl_vao !== void 0 &&
            (n.bindVertexArray(e.webgl_vao),
            e.range !== void 0
              ? e.indexed
                ? n.drawElements(
                    e.type,
                    e.range.count,
                    n.UNSIGNED_INT,
                    e.range.start,
                  )
                : n.drawArrays(e.type, e.range.start, e.range.count)
              : e.indexed
                ? n.drawElements(e.type, e.max_vertex_count, n.UNSIGNED_INT, 0)
                : n.drawArrays(e.type, 0, e.max_vertex_count),
            this.recording && this.profiler.trace_end("set draw"));
        };
      }
      get gl() {
        return this.device.gl;
      }
      set_camera(e) {
        (this.global_uniforms.camera_position = e.location),
          (this.global_uniforms.view_matrix = e.view_matrix),
          (this.global_uniforms.projection_matrix = e.projection_matrix),
          (this.global_uniforms.log_depth_fc =
            2 / (Math.log(e.far + 1) / Math.LN2)),
          (this.camera = e),
          this.uniform_cache.clear();
      }
      set_time(e) {
        this.global_uniforms.time = e;
      }
      set_pass(e, r) {
        this.last_viewport.copy(this.viewport);
        let o = this.gl;
        if (!e) {
          if (this.current_pass === void 0) return;
          this.recording &&
            this.current_pass &&
            this.profiler.trace_end("set pass"),
            o.bindFramebuffer(o.FRAMEBUFFER, null),
            this.set_viewport(0, 0, this.device.width, this.device.height),
            (this.current_pass = void 0);
          return;
        }
        if (this.current_pass === e) return;
        this.current_pass !== void 0 &&
          this.recording &&
          this.profiler.trace_end("set pass"),
          this.recording &&
            this.profiler.trace_start("set pass", r || e.name, e, 1),
          o.bindFramebuffer(o.FRAMEBUFFER, e.webgl_framebuffer),
          this.set_viewport(0, 0, e.width, e.height);
        let n = 0;
        if (e.color_load_action === 1) {
          let i = e.clear_color;
          o.clearColor(i.r, i.g, i.b, i.a), (n |= o.COLOR_BUFFER_BIT);
        }
        e.depth_load_action === 1 &&
          (o.clearDepth(e.clear_depth), (n |= o.DEPTH_BUFFER_BIT)),
          n !== 0 && o.clear(n),
          (this.last_pass = this.current_pass),
          (this.current_pass = e),
          this.uniform_cache.clear();
      }
      set_clear_color(e) {
        this.clear_action.clear_color.copy(e);
      }
      clear(e) {
        if ((e || (e = this.clear_action), e.type === 8)) return;
        e.type & 1 &&
          this.gl.clearColor(
            e.clear_color.r,
            e.clear_color.g,
            e.clear_color.b,
            e.clear_color.a,
          ),
          this.gl.clearDepth(e.clear_depth);
        let r = 0;
        e.type & 1 && (r |= this.gl.COLOR_BUFFER_BIT),
          e.type & 2 && (r |= this.gl.DEPTH_BUFFER_BIT),
          e.type & 4 && (r |= this.gl.STENCIL_BUFFER_BIT),
          this.gl.clear(r);
      }
      set_viewport(e, r, o, n) {
        (e = Math.max(0, e)),
          (r = Math.max(0, r)),
          (o = Math.max(0, o)),
          (n = Math.max(0, n)),
          this.last_viewport.copy(this.viewport),
          this.viewport.set(e, r, o, n),
          this.gl.viewport(e, r, o, n);
      }
      set_pipeline(e) {
        if (!e.valid) {
          console.error(`using invalid pipeline ${e.name ?? ""}`);
          return;
        }
        if ((Qp(), this.current_pipeline === e)) return;
        let r = this.gl;
        this.recording &&
          this.profiler.trace_start("set pipeline", e.name, e, 2),
          r.useProgram(e.webgl_program);
        let {
          cull_mode: o,
          depth_write: n,
          depth_compare_func: i,
          vertex_order: a,
          blend: s,
        } = e;
        (this.current_pipeline === void 0 ||
          o !== this.current_pipeline.cull_mode) &&
          (i === 0 || o == 0
            ? r.disable(r.CULL_FACE)
            : (r.enable(r.CULL_FACE), r.cullFace(o))),
          (this.current_pipeline === void 0 ||
            i !== this.current_pipeline.depth_compare_func) &&
            (i === 0
              ? r.disable(r.DEPTH_TEST)
              : (r.enable(r.DEPTH_TEST), r.depthFunc(i))),
          (this.current_pipeline === void 0 ||
            n !== this.current_pipeline.depth_write) &&
            r.depthMask(n),
          (this.current_pipeline === void 0 ||
            a !== this.current_pipeline.vertex_order) &&
            r.frontFace(a),
          (this.current_pipeline === void 0 ||
            s.enabled !== this.current_pipeline.blend.enabled) &&
            (s && s.enabled ? r.enable(r.BLEND) : r.disable(r.BLEND)),
          (this.current_pipeline === void 0 ||
            s.src_color_factor !==
              this.current_pipeline.blend.src_color_factor ||
            s.dst_color_factor !==
              this.current_pipeline.blend.dst_color_factor ||
            s.src_alpha_factor !==
              this.current_pipeline.blend.src_alpha_factor ||
            s.dst_alpha_factor !==
              this.current_pipeline.blend.dst_alpha_factor ||
            s.color_func !== this.current_pipeline.blend.color_func ||
            s.alpha_func !== this.current_pipeline.blend.alpha_func) &&
            (r.blendFuncSeparate(
              s.src_color_factor,
              s.dst_color_factor,
              s.src_alpha_factor,
              s.dst_alpha_factor,
            ),
            r.blendEquationSeparate(s.color_func, s.alpha_func)),
          (this.current_pipeline = e),
          this.uniform_cache.clear();
        for (let c = 0; c < e.uniforms.length; ++c) {
          let _ = e.uniforms[c];
          _.type === 14 && _.upload();
        }
        this.recording && this.profiler.trace_end("set pipeline");
      }
      set_scissor(e, r, o, n) {
        let i = this.gl;
        e === void 0
          ? i.disable(i.SCISSOR_TEST)
          : (i.enable(i.SCISSOR_TEST), i.scissor(e, r, o, n));
      }
      commit() {
        (this.current_pipeline = void 0), Qp(), this.uniform_cache.clear();
      }
    };
  var Kp = {};
  function g_(t, e) {
    if (Kp[e] !== void 0) return Kp[e];
    let r;
    switch (e) {
      case "WEBGL_depth_texture":
        r =
          t.getExtension("WEBGL_depth_texture") ||
          t.getExtension("MOZ_WEBGL_depth_texture") ||
          t.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        r =
          t.getExtension("EXT_texture_filter_anisotropic") ||
          t.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
          t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        r =
          t.getExtension("WEBGL_compressed_texture_s3tc") ||
          t.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
          t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        r =
          t.getExtension("WEBGL_compressed_texture_pvrtc") ||
          t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        r = t.getExtension(e);
    }
    return (
      console.log(
        r === null
          ? `<WebGLExtension> Extension: ${e} not supported.`
          : `<WebGLExtension> Extension: ${e} found.`,
      ),
      (Kp[e] = r),
      r
    );
  }
  function IR(t, e, r, o) {
    return new Promise((n, i) => {
      function a() {
        let s = t.clientWaitSync(e, r, 0);
        if (s == t.WAIT_FAILED) {
          i();
          return;
        }
        if (s == t.TIMEOUT_EXPIRED) {
          setTimeout(a, o);
          return;
        }
        n();
      }
      a();
    });
  }
  async function TR(t, e, r, o, n, i, a) {
    let s = t.fenceSync(t.SYNC_GPU_COMMANDS_COMPLETE, 0);
    return (
      t.flush(),
      await IR(t, s, 0, 10),
      t.deleteSync(s),
      t.bindBuffer(e, r),
      t.getBufferSubData(e, o, n, i, a),
      t.bindBuffer(e, null),
      n
    );
  }
  async function x_(t, e, r, o, n, i, a) {
    let s = C.CurrentDevice().gl,
      c = s.createBuffer();
    return (
      s.bindBuffer(s.PIXEL_PACK_BUFFER, c),
      s.bufferData(s.PIXEL_PACK_BUFFER, a.byteLength, s.STREAM_READ),
      s.readPixels(t, e, r, o, n, i, 0),
      s.bindBuffer(s.PIXEL_PACK_BUFFER, null),
      await TR(s, s.PIXEL_PACK_BUFFER, c, 0, a),
      s.deleteBuffer(c),
      a
    );
  }
  var FR = 0;
  function AR() {
    return FR++;
  }
  function Ne(t) {
    let r = C.CurrentDevice().gl,
      o = se(t.name, "unamed"),
      n = se(t.texture_type, 3553),
      i = se(t.format, 6408),
      a = se(t.data_type, 5121),
      s = se(t.min_filter, 9729),
      c = se(t.mag_filter, 9729),
      _ = t.source,
      l = se(t.width, 1),
      u = se(t.height, 1),
      d = se(t.depth, 1),
      p = se(t.internal_format, 32856),
      m = se(t.premultiply_alpha, !0),
      f = se(t.dynamic, !1),
      y = se(t.compressed, !1),
      g = se(t.flip_y, !1),
      v = se(t.wrap_s, 33071),
      w = se(t.wrap_t, 33071),
      k = t.mipmaps,
      D = se(t.storage_mode, 0),
      G = r.createTexture();
    if (
      (r.bindTexture(n, G),
      (p = p || kR(r, i, a)),
      r.pixelStorei(r.UNPACK_ALIGNMENT, 4),
      r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, g === !0 ? 1 : 0),
      r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, m === !0 ? 1 : 0),
      r.texParameteri(n, r.TEXTURE_WRAP_S, v),
      r.texParameteri(n, r.TEXTURE_WRAP_T, w),
      r.texParameteri(n, r.TEXTURE_MIN_FILTER, s),
      r.texParameteri(n, r.TEXTURE_MAG_FILTER, c),
      i === 6402 &&
        r.texParameteri(n, r.TEXTURE_COMPARE_MODE, r.COMPARE_REF_TO_TEXTURE),
      y)
    ) {
      if (k === void 0) throw "compressed texture must generate mipmaps";
      for (let le = 0; le < k.length; ++le) {
        let X = k[le];
        r.compressedTexImage2D(n, le, p, X.width, X.height, 0, X.data);
      }
    } else if (n === 34067) {
      if (k) {
        let le = k.length / 6;
        for (let X = 0; X < le; ++X)
          for (let Qe = 0; Qe < 6; ++Qe) {
            let Ge = k[X * 6 + Qe];
            r.texSubImage2D(
              r.TEXTURE_CUBE_MAP_POSITIVE_X + Qe,
              X,
              0,
              0,
              Ge.width,
              Ge.height,
              i,
              a,
              Ge.data,
            );
          }
      }
    } else if (Array.isArray(_)) {
      r.texStorage3D(n, 1, p, l, u, _.length);
      for (let le = 0; le < _.length; le++)
        r.texSubImage3D(n, 0, 0, 0, le, l, u, 1, i, a, _[le]);
    } else
      _ instanceof ImageBitmap ||
      _ instanceof ImageData ||
      _ instanceof HTMLImageElement ||
      _ instanceof HTMLCanvasElement ||
      _ instanceof HTMLVideoElement
        ? ((l = _.width),
          (u = _.height),
          n === 35866 || n === 32879
            ? r.texStorage3D(n, 1, p, l, u, d)
            : r.texStorage2D(n, 1, p, l, u),
          r.texSubImage2D(n, 0, 0, 0, i, a, _))
        : (n === 35866 || n === 32879
            ? r.texStorage3D(n, 1, p, l, u, d)
            : r.texStorage2D(n, 1, p, l, u),
          _ && r.texSubImage2D(n, 0, 0, 0, l, u, i, a, _));
    r.bindTexture(n, null);
    let U = AR();
    return {
      id: U,
      name: o,
      width: l,
      height: u,
      depth: d,
      webgl_texture: G,
      internal_format: p,
      format: i,
      data_type: a,
      dynamic: f,
      texture_type: n,
      flip_y: g,
      premultiply_alpha: m,
      compressed: y,
      is_gl_texture: !0,
      storage_mode: D,
      toString: () => `texture: ${U} ${o}`,
    };
  }
  function td(t, e, r, o) {
    if (!t.dynamic) return;
    let i = C.CurrentDevice().gl;
    i.bindTexture(t.texture_type, t.webgl_texture);
    let { width: a, height: s, premultiply_alpha: c } = t,
      _ = 0,
      l = 0;
    r !== void 0 && ((a = r.x), (s = r.y)),
      o !== void 0 && ((_ = o.x), (l = o.y)),
      i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, c === !0 ? 1 : 0),
      i.texSubImage2D(t.texture_type, 0, _, l, a, s, t.format, t.data_type, e),
      i.bindTexture(t.texture_type, null);
  }
  function zo(t) {
    t && t.webgl_texture && C.CurrentDevice().gl.deleteTexture(t.webgl_texture);
  }
  function kR(t, e, r) {
    let o;
    if (e === t.RED)
      switch (r) {
        case t.FLOAT:
          o = t.R32F;
          break;
        case t.HALF_FLOAT:
          o = t.R16F;
          break;
        case t.UNSIGNED_BYTE:
          o = t.R8;
          break;
        default:
          break;
      }
    if (e === t.RG)
      switch (r) {
        case t.FLOAT:
          o = t.RG32F;
          break;
        case t.HALF_FLOAT:
          o = t.RG16F;
          break;
        case t.UNSIGNED_BYTE:
          o = t.RG8UI;
          break;
        case t.BYTE:
          o = t.RG8I;
          break;
        case t.UNSIGNED_SHORT:
          o = t.RG16UI;
          break;
        case t.SHORT:
          o = t.RG16I;
          break;
        case t.UNSIGNED_INT:
          o = t.RG32UI;
          break;
        case t.INT:
          o = t.RG32I;
          break;
        default:
          break;
      }
    if (e === t.RGB || e === t.RGB_INTEGER)
      switch (r) {
        case t.FLOAT:
          o = t.RGB32F;
          break;
        case t.HALF_FLOAT:
          o = t.RGB16F;
          break;
        case t.UNSIGNED_BYTE:
          o = t.RGB8UI;
          break;
        case t.BYTE:
          o = t.RGB8I;
          break;
        case t.UNSIGNED_SHORT:
          o = t.RGB16UI;
          break;
        case t.SHORT:
          o = t.RGB16I;
          break;
        case t.UNSIGNED_INT:
          o = t.RGB32UI;
          break;
        case t.INT:
          o = t.RGB32I;
          break;
        default:
          break;
      }
    if (e === t.RGBA || e === t.RGBA_INTEGER)
      switch (r) {
        case t.FLOAT:
          o = t.RGBA32F;
          break;
        case t.HALF_FLOAT:
          o = t.RGBA16F;
          break;
        case t.UNSIGNED_BYTE:
          o = t.RGBA;
          break;
        case t.UNSIGNED_INT:
          o = t.RGBA32UI;
          break;
        default:
          break;
      }
    if (o === void 0)
      throw `unspecific internal from format:${e} and type: ${r}`;
    return o;
  }
  var w_ = ((p) => (
      (p[(p.CreateDevice = 0)] = "CreateDevice"),
      (p[(p.DeviceResize = 1)] = "DeviceResize"),
      (p[(p.GetExtension = 2)] = "GetExtension"),
      (p[(p.CreateTexture = 3)] = "CreateTexture"),
      (p[(p.CreateBuffer = 4)] = "CreateBuffer"),
      (p[(p.CreateDraw = 5)] = "CreateDraw"),
      (p[(p.CreatePipeline = 6)] = "CreatePipeline"),
      (p[(p.CreatePass = 7)] = "CreatePass"),
      (p[(p.ShareBuffer = 8)] = "ShareBuffer"),
      (p[(p.UpdateTexture = 9)] = "UpdateTexture"),
      (p[(p.UpdateBuffer = 10)] = "UpdateBuffer"),
      (p[(p.ExecuteCommandBuffer = 11)] = "ExecuteCommandBuffer"),
      (p[(p.ExecuteCommandQueue = 12)] = "ExecuteCommandQueue"),
      p
    ))(w_ || {}),
    PR = new Map();
  function by(t) {
    return PR.get(t);
  }
  function ER(t, e, r) {
    let o = { task_id: t, success: !1, message: r, data: e };
    self.postMessage(o);
  }
  function yy(t) {
    let e = t.data.task_id,
      r = t.data,
      o = by(r.type);
    if (o)
      console.log(`<RenderThreadWebGL> execute id: ${e} type: ${w_[r.type]}`),
        o(r);
    else {
      let { type: n } = r;
      ER(e, { type: n }, `Command handler for type ${r.type} not found.`);
    }
  }
  self.onmessage = yy;
  var v_ = class {
    constructor(e) {
      this.device = e;
    }
    set_viewport(e, r, o, n) {}
    set_camera(e) {}
    set_time(e) {}
    set_action(e) {}
    set_pass(e, r) {}
    set_clear_color(e) {}
    clear(e) {}
    set_pipeline(e) {}
    set_scissor(e, r, o, n) {}
    set_draw(e, r, o) {}
    commit() {}
  };
  var yn = class {
    constructor(e, r = !1) {
      this.worker = e;
      this.auto_terminate = r;
      this.state = 0;
      this.queue = [];
      this.worker_name = "anonymous";
      this.task_id = 0;
      this.callbacks = new Map();
      this.onmessage = (e) => {
        this.state = 0;
        let r = e.data,
          { task_id: o } = r;
        if (
          (r.success
            ? console.log(
                `<WebWorker> worker ${this.worker_name} execute success.`,
              )
            : console.error(
                `<WebWorker> error: ${r.message || "undefined worker error"}`,
              ),
          this.on_response && this.on_response(r),
          o !== void 0 && this.callbacks.has(o))
        ) {
          let n = this.callbacks.get(o);
          r.success && n(r.data), this.callbacks.delete(o);
        }
        if (this.queue.length > 0) {
          let n = this.queue.shift();
          this.send(n.message, n.buffers, n.callback);
        } else this.auto_terminate && this.worker.terminate();
      };
      this.worker.onmessage = this.onmessage;
    }
    get available() {
      return this.state === 0;
    }
    send(e, r, o) {
      let n = this.task_id++;
      return (
        (e.task_id = n),
        this.state !== 0
          ? (this.queue.push({ message: e, buffers: r, callback: o }), !1)
          : (this.worker.postMessage(e, r),
            (this.worker.onmessage = this.onmessage),
            o && this.callbacks.set(n, o),
            !0)
      );
    }
    send_async(e, r = []) {
      return new Promise((o) => {
        this.send(e, r, o);
      });
    }
  };
  var I_ = class {
    constructor(e) {
      this.backend = e;
      this.resource_id = 0;
      let r = new Worker(e, { name: "RenderThread" });
      this.render_thread = new yn(r);
    }
    get_resource_id() {
      return this.resource_id++;
    }
    create_device(e, r) {
      let o = e.transferControlToOffscreen(),
        n = this.get_resource_id(),
        i = { resource_id: n, type: 0, canvas: o, options: r };
      return this.render_thread.send(i, [o]), n;
    }
    create_texture(e) {
      let r = this.get_resource_id(),
        o = { resource_id: r, type: 3, descriptor: e },
        n = DR(e);
      return this.render_thread.send(o, n), r;
    }
    update_texture(e) {}
    resize(e, r, o, n) {
      let a = { type: 1, width: e, height: r, pixel_width: o, pixel_height: n };
      this.render_thread.send(a);
    }
  };
  function DR(t) {
    let { source: e, mipmaps: r } = t,
      o = [],
      n = new Set();
    e && !Xe(e) && (o.push(e.buffer), n.add(e.buffer));
    for (let i of r)
      i &&
        !Xe(i) &&
        !n.has(i.data.buffer) &&
        (o.push(i.data.buffer), n.add(i.data.buffer));
    return o;
  }
  async function gy(t, e = {}) {
    let r;
    Xe(t)
      ? ((r = document.getElementById("view")),
        r.addEventListener(
          "contextmenu",
          (n) => {
            n.preventDefault();
          },
          !1,
        ))
      : (r = t);
    let o = new C(r, e);
    return o.set_size(r.width, r.height), o;
  }
  var UR = { type: 7, clear_color: new H(0, 0, 0, 0), clear_depth: 1 };
  var C = class {
    constructor(e, r = {}) {
      this.canvas = e;
      this.MAX_TEXTURE_SIZE = 4096;
      this.MAX_TEXTURE_IMAGE_UNITS = 16;
      this.MAX_RENDERBUFFER_SIZE = 4096;
      this.mulit_thread_rendering = !1;
      this.backend = "public/src/worker/webgl.render/wgl.worker.js";
      this.canvasRatio = null;
      this.swap = () => {};
      this.loop = () => {
        this.swap(), requestAnimationFrame(this.loop);
      };
      if (
        ((C.current_device = this),
        console.log(
          "%c liamlangli ",
          "color: #6c9; background: #333; padding: 3px; text-shadow: 1px 1px 1px #6c99; font-family: Arial;font-size: 14px; border-radius: 2px; border 1px solid #6c99;",
        ),
        (this.screen_width = window.innerWidth),
        (this.screen_height = window.innerHeight),
        (this.width = e.width),
        (this.height = e.height),
        (this.canvasRatio = r.pixel_ratio),
        r.backend === "public/src/worker/webgpu.render/wgpu.worker.js")
      )
        (this.backend = "public/src/worker/webgpu.render/wgpu.worker.js"),
          (this.encoder = new v_(this));
      else {
        let o = {};
        (o.preserveDrawingBuffer =
          r.preserve_buffer === !0 || r.preserveDrawingBuffer === !0),
          (o.antialias = r.antialias === !0),
          (o.powerPreference = r.powerPreference ?? "high-performance"),
          (o.xrCompatible = r.xr_enabled === !0);
        let n = e.getContext("webgl2", o);
        if (n === null) throw "webgl2 wasn't supported.";
        if (
          ((this.gl = n),
          g_(n, "OES_texture_float_linear"),
          g_(n, "EXT_color_buffer_float"),
          g_(n, "WEBGL_multi_draw"),
          (this.MAX_TEXTURE_SIZE = n.getParameter(n.MAX_TEXTURE_SIZE)),
          (this.MAX_TEXTURE_IMAGE_UNITS = n.getParameter(
            n.MAX_TEXTURE_IMAGE_UNITS,
          )),
          (this.MAX_RENDERBUFFER_SIZE = n.getParameter(
            n.MAX_RENDERBUFFER_SIZE,
          )),
          n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 1)
        )
          throw "vertex texture not supported.";
        if (
          ((UR.clear_color = new H(1, 1, 1, 1)),
          n.lineWidth(3),
          r.multi_thread_rendering &&
            "OffscreenCanvas" in window &&
            "SharedArrayBuffer" in window)
        ) {
          this.mulit_thread_rendering = !0;
          let i = r.backend ?? "public/src/worker/webgl.render/wgl.worker.js";
          (this.client = new I_(i)),
            this.client.create_device(document.getElementById("render"), r);
        }
        this.encoder = new b_(this);
      }
      console.log(`<GPUDevice> active backend: ${this.backend}`),
        this.encoder.set_viewport(0, 0, this.width, this.height);
    }
    static CurrentDevice() {
      return C.current_device;
    }
    get pixel_ratio() {
      return this.canvasRatio ? this.canvasRatio : 1;
    }
    set_size(e, r) {
      (this.screen_width = e), (this.screen_height = r);
      let o = e * this.pixel_ratio,
        n = r * this.pixel_ratio;
      return (
        (this.canvas.width = o),
        (this.canvas.height = n),
        (this.width = o),
        (this.height = n),
        this.encoder.set_viewport(0, 0, o, n),
        B.fire(oe.Resize, { width: e, height: r }),
        this.client && this.client.resize(e, r, o, n),
        this
      );
    }
  };
  function xy() {
    return C.CurrentDevice();
  }
  var jU = new Float32Array([
      -1, 1, -1, 1, 1, 1, 1, 1, -1, 1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, 1, -1,
      -1, -1, -1, -1, 1, 1, -1, -1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, -1, 1,
      1, -1, -1, -1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, 1,
      -1, 1, -1, 1, 1, 1, 1, 1, 1, -1,
    ]),
    XU = new Float32Array([
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, -1, 0, 0, -1, 0, 0,
      -1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
      -1, 0, 0, -1, 0, 0, -1, 0, 1, 0, 0, 0, 1, -1, 0, 0, 0, -1, 0, 1, 0, 0, 0,
      0, -1,
    ]),
    $U = new Float32Array([
      0.875, 0.5, 0.625, 0.75, 0.625, 0.5, 0.625, 0.75, 0.375, 1, 0.375, 0.75,
      0.625, 0, 0.375, 0.25, 0.375, 0, 0.375, 0.5, 0.125, 0.75, 0.125, 0.5,
      0.625, 0.5, 0.375, 0.75, 0.375, 0.5, 0.625, 0.25, 0.375, 0.5, 0.375, 0.25,
      0.875, 0.75, 0.625, 1, 0.625, 0.25, 0.375, 0.75, 0.625, 0.75, 0.625, 0.5,
    ]),
    qU = new Uint32Array([
      0, 2, 1, 3, 5, 4, 6, 8, 7, 9, 11, 10, 12, 14, 13, 15, 17, 16, 0, 1, 18, 3,
      4, 19, 6, 7, 20, 9, 10, 21, 12, 13, 22, 15, 16, 23,
    ]);
  var MR = new Float32Array([-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1]),
    CR = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
    LR = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    zR = new Uint32Array([0, 2, 1, 0, 3, 2]),
    T_;
  function wy() {
    return (
      T_ === void 0 &&
        ((T_ = {
          attributes: [
            { name: "position", stride: 3, buffer: MR },
            { name: "uv", stride: 2, buffer: LR },
            { name: "normal", stride: 3, buffer: CR },
          ],
        }),
        (T_.index = zR)),
      T_
    );
  }
  var NR = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
    BR = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1]),
    WR = new Float32Array([0, 0, 2, 0, 0, 2]),
    OR = new Uint32Array([0, 1, 2]),
    R_;
  function vy() {
    return (
      R_ === void 0 &&
        ((R_ = {
          attributes: [
            { name: "position", stride: 3, buffer: NR },
            { name: "normal", stride: 3, buffer: BR },
            { name: "uv", stride: 2, buffer: WR },
          ],
        }),
        (R_.index = OR)),
      R_
    );
  }
  var Fi = class {
    static async register(e, ...r) {
      let o = new e();
      this.db.set(e, o), o.on_register && (await o.on_register(...r));
    }
    static get(e) {
      return this.db.get(e);
    }
    static async unregister(e) {
      let r = this.db.get(e);
      if (r)
        return this.db.delete(e), r.on_unregister ? r.on_unregister() : void 0;
    }
  };
  Fi.db = new WeakMap();
  function h(t) {
    return Fi.get(t);
  }
  async function No(t, ...e) {
    return Fi.register(t, ...e);
  }
  async function HR(t) {
    return new Promise((e, r) => {
      let o = window.indexedDB.open(t);
      (o.onerror = r),
        (o.onsuccess = function (n) {
          let i = n.target.result;
          if (i.objectStoreNames.contains("project")) e({ db: i, exists: !0 });
          else {
            let a = i.createObjectStore("project", {
              keyPath: "id",
              autoIncrement: !0,
            });
            a.createIndex("name", "name", { unique: !0 }),
              a.createIndex("data", "data", { unique: !1 }),
              a.createIndex("thumbnail", "thumbnail", { unique: !1 }),
              e({ db: i, exists: !1 });
          }
        }),
        (o.onupgradeneeded = async function (n) {
          let i = n.target.result,
            a = !0;
          if (!i.objectStoreNames.contains("project")) {
            let c = i.createObjectStore("project", {
              keyPath: "id",
              autoIncrement: !0,
            });
            c.createIndex("name", "name", { unique: !0 }),
              c.createIndex("data", "data", { unique: !1 }),
              c.createIndex("thumbnail", "thumbnail", { unique: !1 }),
              (a = !1);
          }
          let s = n.target.transaction;
          s.oncomplete = function () {
            e({ db: i, exists: a });
          };
        });
    });
  }
  async function VR(t, e, r) {
    return new Promise((o, n) => {
      let i = t.transaction([e], "readwrite").objectStore(e).add(r);
      (i.onsuccess = function () {
        o();
      }),
        (i.onerror = n);
    });
  }
  async function jR(t, e, r, o) {
    return new Promise((n, i) => {
      let c = t.transaction([e], "readonly").objectStore(e).index(r).get(o);
      (c.onsuccess = function (_) {
        n(_.target.result);
      }),
        (c.onerror = i);
    });
  }
  async function Iy(t, e) {
    return new Promise((r, o) => {
      let n = [],
        i = t.transaction([e]).objectStore(e);
      i.openCursor().onsuccess = function (a) {
        let s = a.target.result;
        s ? (n.push({ id: s.key, ...s.value }), s.continue()) : r(n);
      };
    });
  }
  async function XR(t, e, r) {
    return new Promise((o, n) => {
      let i = t.transaction([e], "readwrite").objectStore(e).put(r);
      (i.onsuccess = function () {
        o();
      }),
        (i.onerror = n);
    });
  }
  async function $R(t, e, r) {
    return new Promise((o, n) => {
      let i = t.transaction([e], "readwrite").objectStore(e).delete(r);
      (i.onsuccess = function () {
        o();
      }),
        (i.onerror = n);
    });
  }
  var qR = "union engine",
    Bo = class {
      async on_register() {
        let e = await HR(qR);
        e !== void 0 && ((this.db = e.db), e.exists);
      }
      async save_project(e, r, o) {
        if (this.db === void 0) return;
        let n = await jR(this.db, "project", "name", e);
        n !== void 0
          ? ((n.data = r), (n.thumbnail = o), XR(this.db, "project", n))
          : VR(this.db, "project", { name: e, data: r, thumbnail: o });
      }
      async delete_project(e) {
        if (this.db !== void 0) return $R(this.db, "project", e);
      }
    };
  var rd = new WeakMap(),
    xa = class {
      constructor() {
        this.encoder_path = "/draco";
        this.encoderConfig = {};
        this._workerLimit = 1;
        this.workerPool = [];
        this.workerNextTaskID = 1;
        this.workerSourceURL = "";
        this.defaultAttributeIDs = {
          position: "POSITION",
          normal: "NORMAL",
          color: "COLOR",
          uv: "TEX_COORD",
        };
        this.defaultAttributeTypes = {
          position: "Float32Array",
          normal: "Float32Array",
          color: "Float32Array",
          uv: "Float32Array",
        };
      }
      set workerLimit(e) {
        this._workerLimit = e;
      }
      get workerLimit() {
        return this._workerLimit;
      }
      async encode(e, r) {
        let o = {
          attributeIDs: this.defaultAttributeIDs,
          attributeTypes: this.defaultAttributeTypes,
          useUniqueIDs: !1,
        };
        return this.encode_primitive(e, o);
      }
      async init_encoder() {
        if (this.encoderPending !== void 0) return this.encoderPending;
        let e =
            typeof window.WebAssembly != "object" ||
            this.encoderConfig.type === "js",
          r = [];
        return (
          e
            ? r.push(st(Gt(this.encoder_path, "draco_encoder.js")))
            : (r.push(st(Gt(this.encoder_path, "draco_encoder_wrapper.js"))),
              r.push(Tr(Gt(this.encoder_path, "draco_encoder.wasm")))),
          (this.encoderPending = Promise.all(r).then((o) => {
            let n = o[0];
            e || (this.encoderConfig.wasmBinary = o[1]);
            let i = QR.toString(),
              a = [
                "/* draco encoder */",
                n,
                "",
                "/* worker */",
                i.substring(i.indexOf("{") + 1, i.lastIndexOf("}")),
              ].join(`
`);
            this.workerSourceURL = URL.createObjectURL(new Blob([a]));
          })),
          this.encoderPending
        );
      }
      async get_worker(e, r) {
        return this.init_encoder().then(() => {
          if (this.workerPool.length < this.workerLimit) {
            let n = new Worker(this.workerSourceURL, {
              name: "draco_encoder_worker",
            });
            (n.callbacks = {}),
              (n.taskCosts = {}),
              (n.taskLoad = 0),
              n.postMessage({
                type: "init",
                encoderConfig: this.encoderConfig,
              }),
              (n.onmessage = function (i) {
                let a = i.data;
                switch (a.type) {
                  case "encode":
                    n.callbacks[a.id].resolve(a);
                    break;
                  case "error":
                    n.callbacks[a.id].reject(a);
                    break;
                  default:
                    console.error(`Unexpected message ${a.type}`);
                }
              }),
              this.workerPool.push(n);
          } else
            this.workerPool.sort(function (n, i) {
              return n.taskLoad > i.taskLoad ? -1 : 1;
            });
          let o = this.workerPool[this.workerPool.length - 1];
          return (o.taskCosts[e] = r), (o.taskLoad += r), o;
        });
      }
      releaseTask(e, r) {
        (e.taskLoad -= e.taskCosts[r]),
          delete e.callbacks[r],
          delete e.taskCosts[r];
      }
      async encode_primitive(e, r) {
        for (let u in r.attributeTypes) {
          let d = r.attributeTypes[u];
          d.BYTES_PER_ELEMENT !== void 0 && (r.attributeTypes[u] = d.name);
        }
        let o = JSON.stringify(r);
        if (rd.has(e)) {
          let u = rd.get(e);
          if (u.key === o) return u.promise;
        }
        let n = [],
          i = 0,
          a = { attributes: [], vertex_count: 0 };
        for (let u = 0; u < e.attributes.length; ++u) {
          let d = e.attributes[u],
            { name: p, stride: m, slot: f, dynamic: y } = d,
            g = { name: p, stride: m, slot: f, dynamic: y },
            v = d.buffer.slice(0);
          n.push(v.buffer),
            (i += v.byteLength),
            (g.buffer = v),
            a.attributes.push(g),
            p === "position" && (a.vertex_count = d.buffer.length / d.stride);
        }
        e.index !== void 0 &&
          e.index !== null &&
          ((a.index = e.index.slice(0)), n.push(a.index.buffer));
        let s,
          c = this.workerNextTaskID++,
          _ = i,
          l = this.get_worker(c, _)
            .then(
              (u) => (
                (s = u),
                new Promise((d, p) => {
                  (s.callbacks[c] = { resolve: d, reject: p }),
                    s.postMessage(
                      { type: "encode", id: c, taskConfig: r, primitive: a },
                      n,
                    );
                })
              ),
            )
            .then((u) => u.buffer);
        return (
          l.finally(() => {
            s && c && this.releaseTask(s, c);
          }),
          rd.set(a, { key: o, promise: l }),
          l
        );
      }
      dispose() {
        for (let e = 0; e < this.workerPool.length; ++e)
          this.workerPool[e].terminate();
        return (this.workerPool.length = 0), this;
      }
      reload() {
        this.init_encoder().then();
      }
    },
    QR = function () {
      let t, e;
      onmessage = function (r) {
        let o = r.data;
        switch (o.type) {
          case "init":
            (t = o.encoderConfig),
              (e = new Promise(function (i) {
                (t.onModuleLoaded = function (a) {
                  i({ draco: a });
                }),
                  self.DracoEncoderModule(t);
              }));
            break;
          case "encode":
            let n = o.primitive;
            e.then((i) => {
              let a = i.draco,
                s = new a.Encoder(),
                c = new a.Mesh(),
                _ = new a.MeshBuilder(),
                l = n.vertex_count;
              if (n.index) {
                let d = n.index.length / 3;
                _.AddFacesToMesh(c, d, n.index);
              }
              for (let d = 0; d < n.attributes.length; ++d) {
                let p = n.attributes[d],
                  m = a.GENERIC;
                if (
                  (p.name === "position"
                    ? (m = a.POSITION)
                    : p.name === "normal"
                      ? (m = a.NORMAL)
                      : p.name === "uv"
                        ? (m = a.TEX_COORD)
                        : p.name === "color"
                          ? (m = a.COLOR)
                          : (m = a.GENERIC),
                  p.buffer instanceof Float32Array)
                )
                  _.AddFloatAttributeToMesh(c, m, l, p.stride, p.buffer);
                else {
                  self.postMessage({
                    type: "error",
                    id: o.id,
                    error: "supported attribute format",
                  });
                  return;
                }
              }
              let u = new a.DracoInt8Array();
              try {
                let d = s.EncodeMeshToDracoBuffer(c, u),
                  p = new Int8Array(d);
                for (let m = 0; m < d; ++m) p[m] = u.GetValue(m);
                self.postMessage(
                  { type: "encode", id: o.id, buffer: p.buffer },
                  [p.buffer],
                );
              } catch (d) {
                console.error(d),
                  self.postMessage({
                    type: "error",
                    id: o.id,
                    error: d.message,
                  });
              } finally {
                a.destroy(u), a.destroy(s), a.destroy(_);
              }
            });
            break;
        }
      };
    };
  var od = class {
      constructor(e, r) {
        this.doc = e;
        this.font_texture = r;
        this.name = "";
        this.chars = [];
        this.char_map = new Map();
        this.kerning_map = {};
        for (let o = 0; o < e.chars.length; ++o)
          this.char_map.set(e.chars[o].id, e.chars[o]);
        this.chars = e.chars;
        for (let o = 0; o < e.kernings.length; ++o) {
          let n = e.kernings[o];
          this.kerning_map[n.first] || (this.kerning_map[n.first] = {}),
            (this.kerning_map[n.first][n.second] = n.amount);
        }
        this.name = e.info.face;
      }
      get size() {
        return this.doc.info.size;
      }
      get_glyph(e) {
        return this.char_map.get(e);
      }
      compute_kerning(e, r) {
        let o = this.kerning_map[e];
        return (o && o[r]) || 0;
      }
      compute_size(e, r, o) {
        r === void 0 && (r = new T()),
          r.set(0, 0),
          (r.y = this.doc.common.lineHeight);
        let n = -1;
        for (let i = 0; i < e.length; ++i) {
          let a = this.get_glyph(e.charCodeAt(i));
          a &&
            ((r.x += a.xadvance + this.compute_kerning(n, a.id)),
            (n = a.id),
            o && (o[i] = r.x));
        }
        return r;
      }
      static async load(e) {
        let r = this.font_map.get(e);
        if (!r) {
          let o = JSON.parse(await st(e)),
            n = Nb(e),
            i = Gt(n, o.pages[0]),
            a = await h(mr).load(i),
            s = Ne({
              name: o.info.face,
              source: a,
              width: a.width,
              height: a.height,
              min_filter: 9729,
              mag_filter: 9729,
              format: 6408,
              data_type: 5121,
              internal_format: 32856,
              dynamic: !1,
            });
          (r = new od(o, s)),
            this.font_map.set(r.name, r),
            this.font_map.set(e, r);
        }
        return r;
      }
    },
    js = od;
  js.font_map = new Map();
  var ZR = 12,
    wa = class {
      constructor(e, r = ZR) {
        this.gpu_font = e;
        this._size = 1;
        this.scale_ratio = 1;
        (this.msdf_font_size = this.gpu_font.size),
          (this.size = r),
          (this.texture_width = this.gpu_font.texture_width),
          (this.texture_height = this.gpu_font.texture_height);
      }
      get size() {
        return this._size;
      }
      set size(e) {
        (this._size = e), (this.scale_ratio = e / this.msdf_font_size);
      }
      get texture() {
        return this.gpu_font.texture;
      }
      compute_size(e, r, o) {
        if ((this.gpu_font.compute_size(e, r, o), r.mul(this.scale_ratio), o))
          for (let n = 0; n < o.length; ++n) o[n] = o[n] * this.scale_ratio;
        return r;
      }
      clone(e) {
        return new wa(this.gpu_font, e);
      }
    };
  var S_ = class {
    constructor(e, r, o = 0) {
      this.max_width = e;
      this.max_height = r;
      this.padding = o;
      this.width = 0;
      this.height = 0;
      this.rects = [];
      this.root = { x: 0, y: 0, width: e + o, height: r + o };
    }
    add(e, r, o) {
      let n = this.find_node(this.root, e + this.padding, r + this.padding);
      if (n) {
        (n.children = this.create_children(
          n,
          e + this.padding,
          r + this.padding,
        )),
          (this.width = Math.max(this.width, n.x + e)),
          (this.height = Math.max(this.height, n.y + r));
        let i = { width: e, height: r, x: n.x, y: n.y, data: o };
        return this.rects.push(i), i;
      }
    }
    find_node(e, r, o) {
      if (e.children) {
        for (let n = 0; n < e.children.length; n++) {
          let i = this.find_node(e.children[n], r, o);
          if (i) return i;
        }
        return;
      }
      if (r <= e.width && o <= e.height) return e;
    }
    create_children(e, r, o) {
      let n = [];
      return (
        e.height - o > 0 &&
          e.x < this.max_width &&
          n.push({ x: e.x, y: e.y + o, width: e.width, height: e.height - o }),
        e.width - r > 0 &&
          e.y < this.max_height &&
          n.push({ x: e.x + r, y: e.y, width: e.width - r, height: o }),
        n
      );
    }
  };
  var F_ = class {
    constructor(e, r, o = 0) {
      this.max_width = e;
      this.max_height = r;
      this.padding = o;
      this.bins = [];
    }
    add(e, r, o) {
      if (e > this.max_width || r > this.max_height)
        throw "input bin oversize.";
      {
        for (let a = 0; a < this.bins.length; a++) {
          let c = this.bins[a].add(e, r, o);
          if (c) return c;
        }
        let n = new S_(this.max_width, this.max_height, this.padding),
          i = n.add(e, r, o);
        return this.bins.push(n), i;
      }
    }
    sort(e) {
      return e
        .slice()
        .sort(
          (r, o) => Math.max(o.width, o.height) - Math.max(r.width, r.height),
        );
    }
    add_array(e) {
      this.sort(e).forEach((r) => this.add(r.width, r.height, r.data));
    }
  };
  var Ty = 0,
    A_ = {};
  window.id_map = A_;
  function Ie(t) {
    return (A_[Ty] = new WeakRef(t)), Ty++;
  }
  function gn(t) {
    let e = A_[t];
    return e === void 0 ? e : A_[t].deref();
  }
  window.ui_get_element = gn;
  var Ae = ((s) => (
      (s[(s.CENTER_VERTICAL = 1)] = "CENTER_VERTICAL"),
      (s[(s.CENTER_HORIZONTAL = 2)] = "CENTER_HORIZONTAL"),
      (s[(s.CENTER = 3)] = "CENTER"),
      (s[(s.TOP = 4)] = "TOP"),
      (s[(s.RIGHT = 8)] = "RIGHT"),
      (s[(s.BOTTOM = 16)] = "BOTTOM"),
      (s[(s.LEFT = 32)] = "LEFT"),
      s
    ))(Ae || {}),
    Ai = 24,
    Ut = 28,
    Sr = 28,
    nd = 1,
    pe = 2,
    Ht = 28,
    Be = 6,
    id = 50,
    Ry = 32;
  var go = {
    NodeConnected: new ye("node connected"),
    NodeDisconnected: new ye("node disconnected"),
    Message: new ye("network messsage"),
  };
  var k_ = class {
    constructor() {
      this.broadcast_channel = new BroadcastChannel("union-rtc");
      this.connection_map = new Map();
      this.remote_nodes = new WeakMap();
      (this.guid = na()),
        (this.event = new bn()),
        (this.broadcast_channel.onmessage = (e) => {
          this.receive_broadcast_message(e);
        });
    }
    async connect(e) {
      if (!e) {
        await this.connet_local();
        return;
      }
    }
    terminate() {}
    send(e, r) {
      let o = this.connection_map.get(e);
      o && o.chan.readyState === "open" && o.chan.send(r);
    }
    broadcast(e) {
      for (let [r, o] of this.connection_map)
        o.chan.readyState === "open" && o.chan.send(e);
    }
    hangup(e) {
      let r = this.connection_map.get(e);
      r && (r.conn.close(), (r.connected = !1), this.connection_map.delete(e));
    }
    on_channel_state_change(e) {
      if (
        (console.log(
          `channel with ${e.remote_guid} state changed ${e.chan.readyState}`,
        ),
        e.chan.readyState === "closed")
      ) {
        this.hangup(e.remote_guid);
        let r = this.remote_nodes.get(e);
        this.event.fire(go.NodeDisconnected, r), this.remote_nodes.delete(e);
      } else if (e.chan.readyState === "open") {
        let r = {
          guid: e.remote_guid,
          name: e.remote_guid,
          color: [1, 1, 1, 1],
        };
        this.remote_nodes.set(e, r), this.event.fire(go.NodeConnected, r);
      }
    }
    on_channel_message(e, r) {
      let o = r.data;
      console.log(`channel receive from ${e.remote_guid}:
${o}`);
      let n = this.remote_nodes.get(e);
      this.event.fire(go.Message, { node: n, data: o });
    }
    async connet_local() {
      let e = this.guid,
        r = this.create_peer_connetion(e),
        o = await r.conn.createOffer();
      this.broadcast_channel.postMessage({
        type: "offer",
        guid: e,
        sdp: o.sdp,
      }),
        await r.conn.setLocalDescription(o);
    }
    receive_broadcast_message(e) {
      let r = e.data;
      switch (r.type) {
        case "offer":
          this.handle_offer(r);
          break;
        case "answer":
          this.handle_answer(r);
          break;
        case "candidate":
          this.handle_candidate(r);
          break;
        case "ready":
          break;
        case "bye":
          this.hangup(r.guid);
          break;
        default:
          console.log(`unhandled rtc broadcast message ${r}`);
      }
    }
    create_peer_connetion(e) {
      let r = { connected: !1, remote_guid: e };
      (r.conn = new RTCPeerConnection()),
        (r.chan = r.conn.createDataChannel("union-stream"));
      let o = () => {
        this.on_channel_state_change(r);
      };
      return (
        (r.chan.onopen = o),
        (r.chan.onclose = o),
        (r.chan.onmessage = (n) => {
          this.on_channel_message(r, n);
        }),
        (r.conn.onicecandidate = (n) => {
          let i = { type: "candidate", guid: this.guid };
          n.candidate &&
            ((i.candidate = n.candidate.candidate),
            (i.sdpMid = n.candidate.sdpMid),
            (i.sdpMLineIndex = n.candidate.sdpMLineIndex)),
            this.post_broadcast_message(i);
        }),
        this.connection_map.set(e, r),
        r
      );
    }
    async handle_offer(e) {
      let r = { connected: !1, remote_guid: e.guid };
      (r.conn = new RTCPeerConnection()),
        (r.conn.ondatachannel = (a) => {
          r.chan = a.channel;
          let s = () => {
            this.on_channel_state_change(r);
          };
          (r.chan.onopen = s),
            (r.chan.onclose = s),
            (r.chan.onmessage = (c) => {
              this.on_channel_message(r, c);
            });
        }),
        this.connection_map.set(e.guid, r);
      let { type: o, sdp: n } = e;
      await r.conn.setRemoteDescription({ type: o, sdp: n });
      let i = await r.conn.createAnswer();
      this.post_broadcast_message({
        type: "answer",
        remote_guid: e.guid,
        guid: this.guid,
        sdp: i.sdp,
      }),
        await r.conn.setLocalDescription(i);
    }
    post_broadcast_message(e) {
      this.broadcast_channel && this.broadcast_channel.postMessage(e);
    }
    async handle_answer(e) {
      let r = this.connection_map.get(e.remote_guid);
      if (!r) {
        console.error("no rtc peer connection");
        return;
      }
      let o = e.guid;
      (r.remote_guid = o),
        this.connection_map.delete(e.remote_guid),
        this.connection_map.set(o, r);
      let { type: n, sdp: i } = e;
      await r.conn.setRemoteDescription({ type: n, sdp: i });
    }
    async handle_candidate(e) {
      let r = this.connection_map.get(e.guid);
      if (!r) {
        console.error("no rtc peer connection");
        return;
      }
      if (!e.candidate) await r.conn.addIceCandidate();
      else {
        let { candidate: o, sdpMid: n, sdpMLineIndex: i } = e;
        await r.conn.addIceCandidate({
          candidate: o,
          sdpMid: n,
          sdpMLineIndex: i,
        });
      }
    }
  };
  var P_ = class {
    get opened() {
      return this.socket.readyState === WebSocket.OPEN;
    }
    constructor() {
      this.reconnect(), (this.guid = na()), (this.event = new bn());
    }
    reconnect() {
      this.host && (this.socket = new WebSocket(this.host));
    }
    send(e, r) {
      this.opened && this.socket.send(r);
    }
    broadcast(e) {}
    connect(e) {}
    terminate() {}
  };
  function Sy(t) {
    switch (t) {
      case 1:
      case 2:
      case 3:
      case 4:
        return 4;
      case 6:
        return 4;
      case 5:
        return 4;
      default:
        throw `invalid property type ${t}`;
    }
  }
  function ad(t, e) {
    switch (t) {
      case 1:
      case 3:
      case 2:
        return 0;
      case 4:
        if (e === 1) return 0;
        if (e === 2) return new T();
        if (e === 3) return new b();
        if (e === 4) return new M();
        if (e === 6) return new be();
        if (e === 9) return new Gr();
        if (e === 16) return new L();
        throw `invalid combination type ${t} & size ${e}`;
      case 5:
        return "";
      case 6:
        return 0;
      default:
        throw `invalid property type ${t}`;
    }
  }
  function E_(t) {
    t.create_type("entity", [
      { name: "name", type: 5, default_value: 0, editor_visible: !0 },
      { name: "static", type: 1, default_value: !0, editor_visible: !0 },
      { name: "id", type: 2 },
    ]),
      t.create_type("transform", [
        {
          name: "location",
          type: 4,
          size: 3,
          default_value: new b(0, 0, 0),
          editor_visible: !0,
        },
        {
          name: "rotation",
          type: 4,
          size: 4,
          default_value: new $(0, 0, 0, 1),
          editor_visible: !0,
        },
        {
          name: "scale",
          type: 4,
          size: 3,
          default_value: new b(10, 10, 10),
          editor_visible: !0,
        },
        { name: "parent", type: 2, default_value: 0 },
      ]),
      t.create_type("camera", [
        { name: "enabled", type: 1, default_value: 1, editor_visible: !0 },
        { name: "mode", type: 3, default_value: 0, editor_visible: !1 },
        { name: "fov", type: 4, default_value: 0.7, editor_visible: !0 },
        { name: "aspect", type: 4, default_value: 1, editor_visible: !0 },
        { name: "near", type: 4, default_value: 1, editor_visible: !0 },
        { name: "far", type: 4, default_value: 1e4, editor_visible: !0 },
        {
          name: "clear_color",
          type: 4,
          size: 4,
          default_value: new M(0.1, 0.1, 0.1, 1),
          editor_visible: !0,
          inspect_type: 4,
        },
      ]),
      t.create_type("model", [
        { name: "visible", type: 1, default_value: !0, editor_visible: !0 },
        { name: "model", type: 6, default_value: 0, editor_visible: !0 },
        { name: "material", type: 6, default_value: 0, editor_visible: !0 },
        { name: "box", type: 4, size: 6 },
        { name: "cast_shadow", type: 1, default_value: !0, editor_visible: !0 },
        { name: "lod", type: 2, default_value: 0 },
      ]),
      t.create_type("light", [
        { name: "enabled", type: 1, default_value: 1 },
        { name: "type", type: 3 },
        { name: "unit_type", type: 3 },
        { name: "color_type", type: 3 },
        { name: "color", type: 4, size: 3 },
        { name: "intensity", type: 4, editor_visible: !0 },
        { name: "cast_shadow", type: 1, default_value: 0, editor_visible: !0 },
        {
          name: "shadow_depth_bias",
          type: 4,
          default_value: 0.2,
          editor_visible: !1,
        },
      ]),
      t.create_type("script", [
        { name: "enabled", type: 1, default_value: !0, editor_visible: !0 },
        { name: "source", type: 6, editor_visible: !0 },
        { name: "instance", type: 3, default_value: -1 },
      ]),
      t.create_type("physics", [
        { name: "enabled", type: 1, default_value: 1, editor_visible: !0 },
        { name: "rigid_body", type: 6, default_value: -1, editor_visible: !0 },
        { name: "collider", type: 6, default_value: -1, editor_visible: !0 },
      ]);
  }
  function D_(t) {
    t.create_prototype_with_object_type_names("camera", [
      "entity",
      "camera",
      "transform",
      "script",
    ]),
      t.create_prototype_with_object_type_names("model", [
        "entity",
        "transform",
        "model",
      ]),
      t.create_prototype_with_object_type_names("script_model", [
        "entity",
        "transform",
        "model",
        "script",
        "physics",
      ]),
      t.create_prototype_with_object_type_names("transform_node", [
        "entity",
        "transform",
      ]),
      t.create_prototype_with_object_type_names("light", [
        "entity",
        "transform",
        "light",
      ]);
  }
  var Ay = 16 * 1024,
    On = class {
      constructor(e, r, o) {
        this.stride = e;
        this.index_map = new dn();
        this.item_per_slab = 1;
        r !== void 0 && o !== void 0
          ? ((this.slabs = r), (this.index_map = o))
          : ((this.slabs = []), (this.index_map = new dn())),
          (this.item_per_slab = Math.floor(Ay / e));
      }
      add() {
        if (
          this.index_map.value_size >=
          this.slabs.length * this.item_per_slab
        ) {
          let e = new $e(new ArrayBuffer(Ay));
          (e.growable = !1), this.slabs.push(e);
        }
        return this.index_map.add();
      }
      valid_index(e) {
        let r = this.index_map.index_to_value[e];
        return r < this.index_map.value_size && r !== -1;
      }
      delete(e) {
        let r = this.get_slab(this.index_map.get(e)),
          o = this.index_map.remove(e);
        if (o === void 0) return !1;
        let n = this.index_map.value_size;
        if (n === o || o === -1) return !0;
        let i = this.get_slab(this.index_map.value_size),
          a = (o % this.item_per_slab) * this.stride,
          s = (n % this.item_per_slab) * this.stride,
          c = new Uint8Array(i.buffer, s, this.stride);
        return r.u8_view.set(c, a), r.u8_view.fill(0, s, s + this.stride), !0;
      }
      serialize(e) {
        return {
          stride: this.stride,
          slabs: this.slabs.map((r) => r.serialize(e)),
          index_map: this.index_map.serialize(),
        };
      }
      get_slab(e) {
        return this.slabs[Math.floor(e / this.item_per_slab)];
      }
      entity_count() {
        return this.index_map.value_size;
      }
      static deserialize(e, r) {
        return new On(
          e.stride,
          e.slabs.map((o) => $e.deserialize(o, r)),
          dn.deserialize(e.index_map),
        );
      }
      clone() {
        let e = new On(this.stride);
        e.index_map = this.index_map.clone();
        for (let r = 0; r < this.slabs.length; ++r)
          e.slabs.push(this.slabs[r].clone());
        return e;
      }
    };
  var ky = 32,
    Py = 127,
    Xs = {
      EntityDelete: new ye("delete entity"),
      EntitySetProperty: new ye("set property"),
      DataAction: new ye("data action"),
    },
    Ce = class {
      constructor(e = []) {
        this.property_names = e;
        this.property_map = new Map();
        if (e === void 0 || e.length <= 0) {
          console.error("invalid response property names");
          return;
        }
        for (let r = 0; r < e.length; r++) {
          let o = e[r];
          this.property_map.set(o, void 0);
        }
      }
      get(e) {
        return this.property_map.get(e);
      }
      set(e, r) {
        this.property_map.set(e, r);
      }
    };
  function My(t) {
    let e = {};
    for (let r in t) e[r] = Object.assign({}, t[r]);
    return e;
  }
  function Ey(t) {
    let e = {};
    for (let r in t) {
      let o = t[r],
        {
          type: n,
          size: i,
          stride: a,
          offset: s,
          editor_visible: c,
          inspect_type: _,
        } = o,
        l = o.default_value;
      if (o.default_value && o.default_value.type) {
        if (o.default_value.type === "Float3") {
          let u = o.default_value.value;
          l = new b(u[0], u[1], u[2]);
        } else if (o.default_value.type === "Quaternion") {
          let u = o.default_value.value;
          l = new $(u[0], u[1], u[2], u[3]);
        }
      }
      e[r] = {
        type: n,
        size: i,
        stride: a,
        offset: s,
        default_value: l,
        editor_visible: c,
        inspect_type: _,
      };
    }
    return e;
  }
  function Dy(t) {
    let e = {};
    for (let r in t) {
      let o = t[r],
        {
          type: n,
          size: i,
          stride: a,
          offset: s,
          editor_visible: c,
          inspect_type: _,
        } = o,
        l = {},
        u = o.default_value;
      u === void 0 && (l = void 0),
        u instanceof b
          ? ((l.type = "Float3"), (l.value = [u.x, u.y, u.z]))
          : u instanceof $
            ? ((l.type = "Quaternion"), (l.value = [u.x, u.y, u.z, u.w]))
            : (l = u),
        (e[r] = {
          type: n,
          size: i,
          stride: a,
          offset: s,
          default_value: l,
          editor_visible: c,
          inspect_type: _,
        });
    }
    return e;
  }
  function Gy(t) {
    let e = {};
    return (
      (e.name = t.name),
      (e.stride = t.stride),
      (e.mask = t.mask),
      (e.properties = My(t.properties)),
      e
    );
  }
  function Uy(t) {
    let e = {};
    return (
      (e.id = t.id),
      (e.name = t.name),
      (e.stride = t.stride),
      (e.mask = t.mask),
      (e.properties = My(t.properties)),
      e
    );
  }
  var YR = 0,
    xo = class {
      constructor() {
        this.types = [];
        this.prototypes = [];
        this.prototype_mask_to_slabchain = {};
        this.entity_set = new Set();
        this.string_map = {};
        this.action_heap = new $e();
        this.event = new bn();
        this.recording = !0;
        this.name_to_type = {};
        this.mask_to_type = {};
        this.name_to_prototype = {};
        this.mask_to_prototype = {};
        this.id_to_prototype = {};
        this.prototype_masks = new Set();
        this.action_id = 0;
        this.actions = [];
        this.masked_type_count = 0;
        this.prototype_count = 1;
        this.delete_entity = (e) => {
          if (this.recording) {
            let a = {
              id: this.action_id++,
              method: "delete_entity",
              parameters: [e],
            };
            this.record_action(a);
          }
          this.event.fire(Xs.EntityDelete, { entity: e });
          let r = this.get_entity_prototype_id(e),
            o = this.id_to_prototype[r].mask,
            n = this.prototype_mask_to_slabchain[o],
            i = this.get_entity_index(e);
          n.delete(i), this.entity_set.delete(e);
        };
        this.id = YR++;
      }
      static deserialize(e) {
        let r = new xo();
        (r.recording = !1),
          E_(r),
          D_(r),
          (r.recording = !0),
          (r.entity_set = new Set(e.entity_set)),
          (r.string_map = e.string_map),
          (r.action_heap = $e.deserialize(e.action_heap)),
          (r.types = e.types);
        for (let n = 0; n < e.types.length; ++n) {
          let i = e.types[n];
          (i.properties = Ey(i.properties)),
            (r.name_to_type[i.name] = i),
            (r.mask_to_type[i.mask] = i);
        }
        r.prototypes = e.prototypes;
        for (let n = 0; n < e.prototypes.length; ++n) {
          let i = e.prototypes[n];
          (i.properties = Ey(i.properties)),
            (r.name_to_prototype[i.name] = i),
            (r.mask_to_prototype[i.mask] = i),
            (r.id_to_prototype[i.id] = i),
            r.prototype_masks.add(i.mask);
        }
        let o = $e.deserialize(e.slab_heap);
        for (let n in e.prototype_mask_to_slabchain)
          r.prototype_mask_to_slabchain[n] = On.deserialize(
            e.prototype_mask_to_slabchain[n],
            o,
          );
        return r;
      }
      copy(e) {
        (this.name_to_type = Object.assign({}, e.name_to_type)),
          (this.mask_to_type = Object.assign({}, e.mask_to_type)),
          (this.name_to_prototype = Object.assign({}, e.name_to_prototype)),
          (this.mask_to_prototype = Object.assign({}, e.mask_to_prototype)),
          (this.id_to_prototype = Object.assign({}, e.id_to_prototype)),
          (this.prototype_masks = new Set(e.prototype_masks)),
          (this.entity_set = new Set(e.entity_set)),
          (this.string_map = Object.assign({}, e.string_map)),
          this.action_heap.copy(e.action_heap),
          (this.types = e.types.map(Gy)),
          (this.prototypes = e.prototypes.map(Uy)),
          (this.masked_type_count = e.masked_type_count),
          (this.prototype_count = e.prototype_count);
        let r = Object.keys(e.prototype_mask_to_slabchain);
        this.prototype_mask_to_slabchain = {};
        for (let o of r) {
          let n = e.prototype_mask_to_slabchain[o];
          this.prototype_mask_to_slabchain[parseInt(o)] = n.clone();
        }
        return this;
      }
      serialize() {
        let e = {},
          r = new $e();
        for (let i in this.prototype_mask_to_slabchain)
          e[i] = this.prototype_mask_to_slabchain[i].serialize(r);
        let o = this.types
            .map(Gy)
            .map((i) => ((i.properties = Dy(i.properties)), i)),
          n = this.prototypes
            .map(Uy)
            .map((i) => ((i.properties = Dy(i.properties)), i));
        return {
          types: o,
          prototypes: n,
          prototype_mask_to_slabchain: e,
          entity_set: Uint32Array.from(this.entity_set),
          string_map: this.string_map,
          action_heap: this.action_heap.serialize(),
          slab_heap: r.serialize(),
        };
      }
      create_entity_with_types(e) {
        throw "plain types object not supported.";
      }
      get_entity_prototype(e) {
        return this.id_to_prototype[this.get_entity_prototype_id(e)];
      }
      get_entity_prototype_id(e) {
        return (e & 2130706432) >>> 24;
      }
      is_plain_entity(e) {
        return (e & 2147483648) === 0;
      }
      get_entity_generated(e) {
        return (e & 786432) >>> 22;
      }
      get_entity_index(e) {
        return e & 16383;
      }
      is_entity_has_type(e, r) {
        let o = this.name_to_type[r];
        if (o === void 0) return !1;
        let n = this.get_entity_prototype(e);
        return n === void 0 ? !1 : (n.mask & o.mask) !== 0;
      }
      is_entity_valid(e) {
        let r = this.get_entity_prototype(e);
        if (r === void 0) return !1;
        let o = this.prototype_mask_to_slabchain[r.mask];
        if (o === void 0) return !1;
        let n = this.get_entity_index(e);
        return o.valid_index(n);
      }
      create_entity_with_prototype(e) {
        let r = e.mask,
          o = this.prototype_mask_to_slabchain[r];
        if (o === void 0) throw `invalid prototype ${e}`;
        let n = o.add(),
          i = this.encode_entity_id(!0, e.id, 0, n);
        this.entity_set.add(i);
        for (let a in e.properties)
          if (a === "entity.id") this.set_property(i, a, i);
          else {
            let s = e.properties[a];
            s.default_value !== void 0 &&
              this.set_property(i, a, s.default_value);
          }
        return i;
      }
      create_entity_with_prototype_name(e) {
        if (this.recording) {
          let r = {
            id: this.action_id++,
            method: "create_entity_with_prototype_name",
            parameters: [e],
          };
          this.record_action(r);
        }
        return this.create_entity_with_prototype(this.name_to_prototype[e]);
      }
      get_type_by_mask(e) {
        return this.mask_to_type[e];
      }
      get_types_by_mask(e) {
        let r = [],
          o = 32;
        for (; (o = Math.clz32(e)) < 32; ) {
          let n = 1 << (31 - o);
          e &= ~n;
          let i = this.mask_to_type[n];
          r.push(i);
        }
        return r;
      }
      get_type_by_name(e) {
        return this.name_to_type[e];
      }
      create_type(e, r, o = !0) {
        let n = {};
        (n.properties = {}),
          (n.name = e),
          (n.mask = o ? this.generate_mask() : 0),
          (this.mask_to_type[n.mask] = n),
          (this.name_to_type[n.name] = n),
          this.types.push(n);
        let i = 0;
        for (let a = 0; a < r.length; a++) {
          let s = r[a];
          s.size = s.size || 1;
          let c = Sy(s.type) * s.size;
          (n.properties[s.name] = {
            size: s.size,
            type: s.type,
            stride: c,
            offset: i,
            default_value: s.default_value,
            editor_visible: s.editor_visible || !1,
            inspect_type: s.inspect_type || 0,
          }),
            (i += c);
        }
        if (((n.stride = i), this.recording)) {
          let a = r.map((c) => Object.assign({}, c)),
            s = {
              id: this.action_id++,
              method: "create_type",
              parameters: [e, a, o],
            };
          this.record_action(s);
        }
        return n;
      }
      add_type(e, r) {
        if (r === void 0) return e;
        let o = this.get_entity_prototype(e);
        if (o === void 0 || o.mask & r.mask) return e;
        let n = o.mask | r.mask,
          i;
        if (
          (this.prototype_masks.has(n)
            ? (i = this.mask_to_prototype[n])
            : (i = this.create_prototype(n.toString(), n)),
          this.recording)
        ) {
          let s = {
            id: this.action_id++,
            method: "add_type",
            parameters: [e, Object.assign({}, r)],
          };
          this.record_action(s);
        }
        let a = this.create_entity_with_prototype(i);
        for (let s in o.properties)
          s !== "entity.id" && this.set_property(a, s, this.get_property(e, s));
        return this.delete_entity(e), a;
      }
      add_type_by_name(e, r) {
        return this.add_type(e, this.name_to_type[r]);
      }
      remove_type(e, r) {
        if (r === void 0) return e;
        let o = this.get_entity_prototype(e);
        if (o === void 0 || !(o.mask & r.mask)) return e;
        let n = o.mask ^ r.mask;
        if (this.recording) {
          let s = {
            id: this.action_id++,
            method: "remove_type",
            parameters: [e, Object.assign({}, r)],
          };
          this.record_action(s);
        }
        let i;
        this.prototype_masks.has(n)
          ? (i = this.mask_to_prototype[n])
          : (i = this.create_prototype(n.toString(), n));
        let a = this.create_entity_with_prototype(i);
        for (let s in i.properties)
          s !== "entity.id" && this.set_property(a, s, this.get_property(e, s));
        return this.delete_entity(e), a;
      }
      remove_type_by_name(e, r) {
        return this.remove_type(e, this.name_to_type[r]);
      }
      create_prototype_with_object_type_names(e = "", r) {
        if (r.length <= 0) return;
        let o = this.get_mask_with_type_names(r);
        return this.create_prototype(e, o);
      }
      create_prototype_with_object_types(e = "", r) {
        let o = this.get_mask_with_types(r);
        return this.create_prototype(e, o);
      }
      create_prototype(e, r = 0) {
        if (r === 0 || this.prototype_masks.has(r)) return;
        if (this.recording) {
          let c = {
            id: this.action_id++,
            method: "create_prototype",
            parameters: [r],
          };
          this.record_action(c);
        }
        let o = {};
        (o.id = this.generate_prototype()),
          (o.name = e),
          (o.mask = r),
          (o.properties = {}),
          (this.id_to_prototype[o.id] = o),
          (this.name_to_prototype[o.name] = o),
          (this.mask_to_prototype[o.mask] = o);
        let n = r,
          i = 32,
          a = 0,
          s = 0;
        for (this.prototype_masks.add(n); (i = Math.clz32(n)) < 32; ) {
          let c = 1 << (31 - i);
          n &= ~c;
          let _ = this.mask_to_type[c];
          a |= c;
          let l = _.name;
          for (let u in _.properties) {
            let {
                type: d,
                size: p,
                stride: m,
                default_value: f,
                editor_visible: y,
                inspect_type: g,
              } = _.properties[u],
              v = `${l}.${u}`;
            (o.properties[v] = {
              type: d,
              size: p,
              stride: m,
              offset: s,
              default_value: f,
              editor_visible: y,
              inspect_type: g,
            }),
              (s += m);
          }
        }
        return (
          (this.prototype_mask_to_slabchain[a] = new On(s)),
          this.prototypes.push(o),
          o
        );
      }
      set_property(e, r, o) {
        if (o === void 0) return !1;
        if (this.is_plain_entity(e)) throw "plain object not supported";
        let i = this.get_entity_index(e),
          a = this.get_entity_prototype(e);
        if (a === void 0)
          throw `invalid prototype id ${this.get_entity_prototype_id(e)}`;
        let s = a.mask,
          c = this.prototype_mask_to_slabchain[s];
        if (c === void 0) throw `invalid prototype ${a}`;
        let _ = c.index_map.get(i),
          l = c.item_per_slab,
          u = c.stride,
          d = _ % l,
          p = c.get_slab(_);
        if (p === void 0) throw `invalid entity ${e} with index ${_}`;
        let m = a.properties[r].size,
          f = d * u + a.properties[r].offset,
          y = a.properties[r].type,
          g;
        if (this.recording) {
          let v = o;
          Ub(o) && (v = Mb(o)),
            (g = {
              id: this.action_id++,
              method: "set_property",
              parameters: [e, r, v],
            }),
            this.record_action(g);
        }
        switch (y) {
          case 1:
            p.write_u32(o ? 1 : 0, f),
              this.recording && (g.cache_data = p.u32_view[f] === 1);
            break;
          case 6:
          case 3:
            p.write_i32(o, f), this.recording && (g.cache_data = p.i32_view[f]);
            break;
          case 2:
            p.write_u32(o, f), this.recording && (g.cache_data = p.u32_view[f]);
            break;
          case 4:
            if (m === 1)
              p.write_float(o, f),
                this.recording && (g.cache_data = p.u32_view[f]);
            else {
              let w = f >>> 2;
              if (Array.isArray(o))
                if (this.recording) {
                  g.cache_data = [];
                  for (let k = 0; k < m; ++k)
                    (g.cache_data[k] = p.float_view[w + k]),
                      (p.float_view[w + k] = o[k]);
                } else for (let k = 0; k < m; ++k) p.float_view[w + k] = o[k];
              else {
                let k = o;
                if (this.recording) {
                  g.cache_data = [];
                  for (let D = 0; D < k.size; ++D)
                    g.cache_data[D] = p.float_view[w + D];
                }
                o.write(p.float_view, w);
              }
            }
            break;
          case 5:
            this.recording && (g.cache_data = this.string_map[p.u32_view[f]]);
            let v = Lp(o);
            (this.string_map[v] = o), p.write_u32(v, f);
            break;
        }
        return (
          this.event.fire(Xs.EntitySetProperty, {
            id: this.id,
            entity: e,
            name: r,
          }),
          !0
        );
      }
      get_property(e, r, o) {
        if (this.is_plain_entity(e))
          throw `plain object unsupported so far. entity: ${e}`;
        let i = this.get_entity_index(e),
          a = this.get_entity_prototype(e);
        if (a === void 0)
          throw `invalid prototype id ${this.get_entity_prototype_id(e)}`;
        let s = a.mask,
          c = this.prototype_mask_to_slabchain[s];
        if (c === void 0) throw `invalid prototype ${a}`;
        let _ = c.index_map.get(i);
        if (_ === void 0) throw `invalid index ${_}`;
        let l = c.item_per_slab,
          u = c.stride,
          d = _ % l,
          p = c.get_slab(_);
        if (p === void 0) throw `invalid entity ${e} with index ${_}`;
        let m = a.properties[r].size,
          f = d * u + a.properties[r].offset,
          y = a.properties[r].type;
        switch (y) {
          case 1:
            return p.read_u32(f);
          case 3:
            return p.read_i32(f);
          case 4:
            if (m === 1) return p.read_float(f);
            {
              o = o || ad(y, m);
              let v = f >>> 2;
              return o.read(p.float_view, v), o;
            }
          case 2:
            return p.read_u32(f);
          case 6:
            return p.read_i32(f);
          case 5:
            let g = p.read_u32(f);
            return this.string_map[g];
        }
        return null;
      }
      has_property(e, r) {
        let o = this.get_entity_prototype(e);
        return o === void 0 ? !1 : o.properties[r] !== void 0;
      }
      *query(e, r) {
        if (!(e === void 0 || e === 0))
          for (let o of this.prototype_masks) {
            if ((o & e) !== e) continue;
            let n = this.mask_to_prototype[o];
            if (n === void 0) continue;
            let i = this.prototype_mask_to_slabchain[o];
            if (i === void 0) return;
            let a = i.item_per_slab,
              s = i.stride,
              c = i.entity_count();
            for (let _ = 0; _ < c; ++_) {
              let l = i.get_slab(_),
                u = _ % a;
              for (let d = 0; d < r.property_names.length; ++d) {
                let p = r.property_names[d];
                if (n.properties[p] === void 0) continue;
                let m = n.properties[p].size,
                  f = u * s + n.properties[p].offset,
                  y = n.properties[p].type;
                switch (y) {
                  case 1:
                    r.set(p, l.read_u32(f));
                    break;
                  case 3:
                    r.set(p, l.read_i32(f));
                    break;
                  case 4:
                    if (m === 1) r.set(p, l.read_float(f));
                    else {
                      let v = f >>> 2;
                      r.get(p) === void 0 && r.set(p, ad(y, m)),
                        r.get(p).read(l.float_view, v);
                    }
                    break;
                  case 2:
                    r.set(p, l.read_u32(f));
                    break;
                  case 6:
                    r.set(p, l.read_i32(f));
                    break;
                  case 5:
                    let g = l.read_u32(f);
                    r.set(p, this.string_map[g]);
                    break;
                }
              }
              yield r;
            }
          }
      }
      query_by_prototype_name(e, r) {
        let o = this.name_to_prototype[e];
        if (o !== void 0) return this.query(o.mask, r);
      }
      query_by_type_names(e, r) {
        let o = this.get_mask_with_type_names(e);
        return this.query(o, r);
      }
      encode_entity_id(e, r, o, n) {
        let i = e ? 0x80000000n : 0n,
          a = BigInt((r & 127) << 24),
          s = BigInt((o & 3) << 22),
          c = BigInt(n & 16383);
        return Number(i | a | s | c);
      }
      get_mask_with_type_names(e) {
        let r = 0;
        for (let o = 0; o < e.length; ++o) {
          let n = this.name_to_type[e[o]];
          if (n == null) throw `invalid type name ${e[o]}`;
          r |= n.mask;
        }
        return r;
      }
      get_mask_with_types(e) {
        let r = 0;
        for (let o = 0; o < e.length; ++o) r |= e[o].mask;
        return r;
      }
      generate_mask() {
        if (this.masked_type_count >= ky)
          throw `masked object type exceed max count ${ky}`;
        return 1 << this.masked_type_count++;
      }
      do(e, r = !0) {
        if (e.id - this.action_id !== 1 && e.id !== 0)
          if (r) console.warn(`unmatched action ${e}`);
          else return;
        let o = this.recording;
        (this.recording = !1),
          this[e.method](...e.parameters),
          (this.recording = o),
          r && (this.action_id = e.id),
          this.actions.push(e);
      }
      undo() {
        if (this.action_id === 0) return;
        let e = this.actions[this.action_id - 1];
        if (!e) return;
        let r = this.recording;
        return (
          (this.recording = !1),
          e.method === "set_property" &&
            this.set_property(e.parameters[0], e.parameters[1], e.cache_data),
          (this.recording = r),
          this.action_id--,
          e
        );
      }
      redo() {
        let e = this.actions[this.action_id];
        if (!e) return;
        let r = this.recording;
        return (
          (this.recording = !1),
          this[e.method](...e.parameters),
          (this.recording = r),
          this.action_id++,
          e
        );
      }
      generate_prototype() {
        if (this.prototype_count >= Py)
          throw `run out of max prototype count ${Py}`;
        return this.prototype_count++;
      }
      record_action(e) {
        (this.actions[e.id] = e),
          this.event.fire(Xs.DataAction, e),
          console.log(e);
        for (let r = this.action_id; (r = this.actions.length); ++r) {
          if (this.actions[r] === void 0) return;
          this.actions[r] = void 0;
        }
      }
    },
    JR = new Ce(["entity.name", "entity.id"]);
  function cd(t, e, r) {
    (r = r ?? new Set()), r.clear();
    let o = t.query_by_type_names(["entity"], JR);
    if (o)
      for (let n of o) n.get("entity.name") === e && r.add(n.get("entity.id"));
    return r;
  }
  var KR = new Ce([
      "entity.id",
      "entity.name",
      "transform.location",
      "transform.rotation",
      "transform.scale",
      "transform.parent",
    ]),
    eS = new L(),
    ki = new WeakMap();
  function Pi(t, e, r, o, n) {
    let i = ki.get(t);
    if (!i) {
      (i = { root: new Cr(), node_map: new Map() }),
        i.node_map.set(0, i.root),
        ki.set(t, i);
      let a = t.query_by_type_names(["transform"], KR);
      for (let s of a) {
        let c = s.get("entity.id");
        Je(t, c);
      }
    }
    return (
      bo(i.root, (a) => {
        tS(t, a.entity, e, r, o, n);
      }),
      i
    );
  }
  function _d(t) {
    return ki.get(t);
  }
  function Cy(t) {
    ki.delete(t);
  }
  function Je(t, e) {
    let r = ki.get(t);
    if (e === 0) return r.root;
    let o = r.node_map.get(e);
    if (!o) {
      let n = t.get_property(e, "entity.name") || "unnamed";
      (o = new Cr(n)),
        (o.entity = e),
        r.node_map.set(e, o),
        t.get_property(e, "transform.location", o.location),
        t.get_property(e, "transform.rotation", o.rotation),
        t.get_property(e, "transform.scale", o.scale),
        o.local_matrix.compose(o.location, o.rotation, o.scale);
      let i = t.get_property(e, "transform.parent"),
        a = i === 0 ? r.root : Je(t, i);
      a.add(o),
        o.world_matrix.copy(o.local_matrix).pre_mul(a.world_matrix),
        o.world_matrix.decompose(
          o.world_location,
          o.world_rotation,
          o.world_scale,
        );
    }
    return o;
  }
  function Ft(t, e) {
    let r = Je(t, e);
    r &&
      r.transform_updated === !1 &&
      r.entity !== 0 &&
      bo(r, (o) => {
        (o.transform_updated = !0), Ft(t, o.entity);
      });
  }
  function Ly(t, e, r) {
    let o = Je(t, e);
    o &&
      bo(o, (n) => {
        r.add(n.entity);
      });
  }
  function zy(t, e, r) {
    let o = Je(t, e);
    o &&
      bo(o, (n) => {
        r.delete(n.entity);
      });
  }
  function tS(t, e, r, o, n, i) {
    let a = Je(t, e);
    if (!(!a || e === 0) && a.transform_updated && a.entity !== 0) {
      t.get_property(a.entity, "transform.location", a.location),
        t.get_property(a.entity, "transform.rotation", a.rotation),
        t.get_property(a.entity, "transform.scale", a.scale);
      let s = a.parent;
      r &&
        r.has(e) &&
        s &&
        r.has(s.entity) === !1 &&
        (a.location.add(o), a.rotation.premul(n), a.scale.mul_v(i)),
        a.local_matrix.identity().compose(a.location, a.rotation, a.scale),
        a.world_matrix.copy(a.local_matrix),
        (a.name = t.get_property(a.entity, "entity.name") || "unnamed"),
        s && a.world_matrix.pre_mul(a.parent.world_matrix),
        a.world_matrix.decompose(
          a.world_location,
          a.world_rotation,
          a.world_scale,
        ),
        (a.transform_updated = !1);
    }
  }
  function ld(t, e) {
    if (!t.is_entity_valid(e)) return;
    let r = ki.get(t);
    if (!r) return;
    let o = r.node_map.get(e);
    o &&
      (o.parent && o.parent.remove(o),
      r.node_map.delete(e),
      bo(o, (n) => {
        t.delete_entity(n.entity);
      }));
  }
  function G_(t, e, r) {
    if (!ki.get(t)) return;
    let n = Je(t, e),
      i = Je(t, r);
    rS(t, e),
      i.add(n),
      n.world_matrix.pre_mul(eS.copy(i.world_matrix).inverse()),
      n.world_matrix.decompose(
        n.world_location,
        n.world_rotation,
        n.world_scale,
      ),
      t.set_property(e, "transform.location", n.location),
      t.set_property(e, "transform.rotation", n.rotation),
      t.set_property(e, "transform.scale", n.scale),
      t.set_property(e, "transform.parent", r),
      (n.transform_updated = !0);
  }
  function rS(t, e) {
    let r = Je(t, e),
      o = [r];
    for (; r.parent && !r.parent.transform_updated; )
      o.push(r.parent), (r = r.parent);
    for (let n = o.length - 1; n >= 0; --n) {
      let i = o[n];
      t.get_property(i.entity, "transform.location", i.location),
        t.get_property(i.entity, "transform.rotation", i.rotation),
        t.get_property(i.entity, "transform.scale", i.scale),
        i.local_matrix.compose(i.location, i.rotation, i.scale),
        i.world_matrix.copy(i.local_matrix),
        i.parent && i.world_matrix.pre_mul(i.parent.world_matrix);
    }
  }
  var ud = "union.nickname";
  var Hn = class {
    constructor() {
      this.user_name = "anonymous";
      this.mode = 1;
      this.color = new H();
      this.remote_nodes = new Map();
      this.remote_matrices = new Map();
      this.synchronizing = !0;
      this.on_connect = (e) => {
        this.remote_nodes.set(e.guid, e);
        let r = {
          type: "node info",
          name: this.user_name,
          color: this.color.toJSON(),
        };
        this.node.send(e.guid, JSON.stringify(r));
      };
      this.on_disconnect = (e) => {
        this.remote_nodes.delete(e.guid);
      };
      this.on_message = (e) => {
        let { node: r, data: o } = e,
          n = this.remote_nodes.get(r.guid);
        if (n && Xe(o)) {
          let i = JSON.parse(o);
          switch (i.type) {
            case "node info":
              let { name: a, color: s } = i;
              (n.name = a), (n.color = s);
              break;
            case "edit camera":
              let { matrix: c } = i,
                _ = this.remote_matrices.get(r.guid);
              _ || ((_ = new L()), this.remote_matrices.set(r.guid, _)),
                _.elements.set(c),
                B.fire(oe.ForceUpdate);
              break;
            case "data action":
              let { action: l } = i,
                u = h(ee).data_center;
              u.do(l),
                l.method === "set_property" &&
                  l.parameters[1].startsWith("transform.") &&
                  Ft(u, l.parameters[0]),
                B.fire(oe.ForceUpdate);
              break;
            default:
              console.log(`invalid aciton type ${i.type}`);
          }
        }
      };
    }
    async on_register() {
      this.mode === 1
        ? (this.node = new k_())
        : this.mode === 0 && (this.node = new P_()),
        (this.user_name = localStorage.getItem(ud) ?? this.node.guid),
        this.node.connect(),
        (this.color.r = Math.random() * 0.4 + 0.6),
        (this.color.g = Math.random() * 0.4 + 0.6),
        (this.color.b = Math.random() * 0.4 + 0.6),
        (this.color.a = 1),
        this.node.event.on(go.NodeConnected, this.on_connect),
        this.node.event.on(go.NodeDisconnected, this.on_disconnect),
        this.node.event.on(go.Message, this.on_message);
    }
    async on_unregister() {
      this.node.event.off(go.NodeConnected, this.on_connect),
        this.node.event.off(go.NodeDisconnected, this.on_disconnect),
        this.node.event.off(go.Message, this.on_message);
    }
    broadcast(e) {
      this.node && this.node.broadcast(e);
    }
  };
  var By = new Map();
  function oS(t, e) {
    By.set(t, e);
  }
  function Wy(t) {
    let e = t.split(/\s/),
      r = e.shift();
    if (!r) return;
    let o = By.get(r);
    o && o(e);
  }
  function Oy() {
    oS("ls", nS);
  }
  function nS() {
    let r = h(Z)
      .active_node.children.map((o) => o.name)
      .join("    ");
    va(r, 1, 3);
  }
  var U_ = "union.theme",
    Hy = "union.terminal";
  async function pd() {
    return document?.documentElement?.requestFullscreen();
  }
  var $s = 22,
    qs = 32,
    M_ = class {
      constructor() {
        this.visible = !1;
        this.key_1 = new P("1");
        this.key_2 = new P("2");
        this.key_3 = new P("3");
        this.key_4 = new P("4");
        this.key_5 = new P("5");
        this.key_6 = new P("6");
        this.key_7 = new P("7");
        this.key_8 = new P("8");
        this.key_9 = new P("9");
        this.key_0 = new P("0");
        this.key_q = new P("q");
        this.key_w = new P("w");
        this.key_e = new P("e");
        this.key_r = new P("r");
        this.key_t = new P("t");
        this.key_y = new P("y");
        this.key_u = new P("u");
        this.key_i = new P("i");
        this.key_o = new P("o");
        this.key_p = new P("p");
        this.key_a = new P("a");
        this.key_s = new P("s");
        this.key_d = new P("d");
        this.key_f = new P("f");
        this.key_g = new P("g");
        this.key_h = new P("h");
        this.key_j = new P("j");
        this.key_k = new P("k");
        this.key_l = new P("l");
        this.key_z = new P("z");
        this.key_x = new P("x");
        this.key_c = new P("c");
        this.key_v = new P("v");
        this.key_b = new P("b");
        this.key_n = new P("n");
        this.key_m = new P("m");
        this.space = new P("space");
        this.enter = new P("enter");
        this.tab = new P("tab");
        this.shift = new P("shift");
        this.ctrl = new P("ctrl");
        this.alt = new P("alt");
        this.hide = new P("hide");
        this.minus = new P("-");
        this.equal = new P("=");
        this.comma = new P(",");
        this.period = new P(".");
        this.question = new P("?");
        this.backspace = new P("backs");
        this.rect = new x(0, 0, 332, 190);
        (this.id = Ie(this)),
          (this.rect.x = (window.innerWidth - this.rect.w) >> 1),
          (this.rect.y = window.innerHeight - this.rect.h - 40);
      }
    },
    A = new x(),
    bt = new x(),
    Ia = new x();
  function C_(t, e) {
    if (!e.visible) return;
    let r = h(F).theme,
      o = 2,
      n = t.buffer.layers[o],
      i = e.id,
      a = e.rect;
    bt.copy(a),
      t.active === i &&
        ((bt.x = Q(bt.x + t.mouse_offset.x, 0, t.window_rect.w - bt.w)),
        (bt.y = Q(bt.y + t.mouse_offset.y, 0, t.window_rect.h - bt.h)),
        t.left_mouse_release && ((a.x = bt.x), (a.y = bt.y), t.clear_active())),
      t.active === -1 &&
        t.ishovering(bt) &&
        t.next_hover_layer_index <= o &&
        ((t.next_hover_layer_index = o), (t.next_hover = e.id)),
      t.hover === i && t.left_mouse_press && t.set_active(i),
      q(n, r.shadow, bt, 8),
      q(n, r.panel_layer_0, bt, 8),
      A.copy(bt),
      (A.w = $s),
      (A.h = qs),
      (A.x += 6),
      (A.y += 6),
      E(t, e.key_1, r.panel_layer_1, A, o) && t.key_press.add(49),
      (A.x += A.w + 5),
      E(t, e.key_2, r.panel_layer_1, A, o) && t.key_press.add(50),
      (A.x += A.w + 5),
      E(t, e.key_3, r.panel_layer_1, A, o) && t.key_press.add(51),
      (A.x += A.w + 5),
      E(t, e.key_4, r.panel_layer_1, A, o) && t.key_press.add(52),
      (A.x += A.w + 5),
      E(t, e.key_5, r.panel_layer_1, A, o) && t.key_press.add(53),
      (A.x += A.w + 5),
      E(t, e.key_6, r.panel_layer_1, A, o) && t.key_press.add(54),
      (A.x += A.w + 5),
      E(t, e.key_7, r.panel_layer_1, A, o) && t.key_press.add(55),
      (A.x += A.w + 5),
      E(t, e.key_8, r.panel_layer_1, A, o) && t.key_press.add(56),
      (A.x += A.w + 5),
      E(t, e.key_9, r.panel_layer_1, A, o) && t.key_press.add(57),
      (A.x += A.w + 5),
      E(t, e.key_0, r.panel_layer_1, A, o) && t.key_press.add(48),
      (A.x += A.w + 5),
      E(t, e.minus, r.panel_layer_1, A, o) && t.key_press.add(189),
      (A.x += A.w + 5),
      E(t, e.equal, r.panel_layer_1, A, o) && t.key_press.add(187),
      (A.x += A.w + 5),
      (A.x = bt.x + $s * 0.5 + 4),
      (A.y = bt.y + qs + 10),
      E(t, e.key_q, r.panel_layer_1, A, o) && t.key_press.add(81),
      (A.x += A.w + 5),
      E(t, e.key_w, r.panel_layer_1, A, o) && t.key_press.add(87),
      (A.x += A.w + 5),
      E(t, e.key_e, r.panel_layer_1, A, o) && t.key_press.add(69),
      (A.x += A.w + 5),
      E(t, e.key_r, r.panel_layer_1, A, o) && t.key_press.add(82),
      (A.x += A.w + 5),
      E(t, e.key_t, r.panel_layer_1, A, o) && t.key_press.add(84),
      (A.x += A.w + 5),
      E(t, e.key_y, r.panel_layer_1, A, o) && t.key_press.add(89),
      (A.x += A.w + 5),
      E(t, e.key_u, r.panel_layer_1, A, o) && t.key_press.add(85),
      (A.x += A.w + 5),
      E(t, e.key_i, r.panel_layer_1, A, o) && t.key_press.add(73),
      (A.x += A.w + 5),
      E(t, e.key_o, r.panel_layer_1, A, o) && t.key_press.add(79),
      (A.x += A.w + 5),
      E(t, e.key_p, r.panel_layer_1, A, o) && t.key_press.add(80),
      (A.x += A.w + 5),
      Ia.copy(A),
      (Ia.w = 40),
      E(t, e.backspace, r.panel_layer_1, Ia, o) && t.key_press.add(8),
      (A.x = bt.x + $s * 1.2 + 4),
      (A.y = bt.y + qs * 2 + 14),
      E(t, e.key_a, r.panel_layer_1, A, o) && t.key_press.add(65),
      (A.x += A.w + 5),
      E(t, e.key_s, r.panel_layer_1, A, o) && t.key_press.add(83),
      (A.x += A.w + 5),
      E(t, e.key_d, r.panel_layer_1, A, o) && t.key_press.add(68),
      (A.x += A.w + 5),
      E(t, e.key_f, r.panel_layer_1, A, o) && t.key_press.add(70),
      (A.x += A.w + 5),
      E(t, e.key_g, r.panel_layer_1, A, o) && t.key_press.add(71),
      (A.x += A.w + 5),
      E(t, e.key_h, r.panel_layer_1, A, o) && t.key_press.add(72),
      (A.x += A.w + 5),
      E(t, e.key_j, r.panel_layer_1, A, o) && t.key_press.add(74),
      (A.x += A.w + 5),
      E(t, e.key_k, r.panel_layer_1, A, o) && t.key_press.add(75),
      (A.x += A.w + 5),
      E(t, e.key_l, r.panel_layer_1, A, o) && t.key_press.add(76),
      (A.x += A.w + 5),
      Ia.copy(A),
      (Ia.w = 52),
      E(t, e.enter, r.panel_layer_1, Ia, o) && t.key_press.add(13),
      (A.x = bt.x + $s + 20),
      (A.y = bt.y + qs * 3 + 18),
      E(t, e.key_z, r.panel_layer_1, A, o) && t.key_press.add(90),
      (A.x += A.w + 5),
      E(t, e.key_x, r.panel_layer_1, A, o) && t.key_press.add(88),
      (A.x += A.w + 5),
      E(t, e.key_c, r.panel_layer_1, A, o) && t.key_press.add(67),
      (A.x += A.w + 5),
      E(t, e.key_v, r.panel_layer_1, A, o) && t.key_press.add(86),
      (A.x += A.w + 5),
      E(t, e.key_b, r.panel_layer_1, A, o) && t.key_press.add(66),
      (A.x += A.w + 5),
      E(t, e.key_n, r.panel_layer_1, A, o) && t.key_press.add(78),
      (A.x += A.w + 5),
      E(t, e.key_m, r.panel_layer_1, A, o) && t.key_press.add(77),
      (A.x += A.w + 5),
      E(t, e.comma, r.panel_layer_1, A, o) && t.key_press.add(188),
      (A.x += A.w + 5),
      E(t, e.period, r.panel_layer_1, A, o) && t.key_press.add(190),
      (A.x += A.w + 5),
      (A.w = e.hide.label.text_size.x + 18),
      E(t, e.hide, r.panel_layer_1, A, o) && (e.visible = !1),
      (A.x = bt.x + $s + 60),
      (A.y = bt.y + qs * 4 + 24),
      (A.w = 120),
      E(t, e.space, r.panel_layer_1, A, o) && t.key_press.add(32),
      (A.x += A.w + 5);
  }
  var Vn = class {
    constructor() {
      this.closed = !0;
      this.points = new Float32Array(1024);
      this.rect = new x();
      this.uv_rect = new x();
      this.point_count = 0;
      this.width = 1;
      this.feather = 1;
      this.clip = 0;
      this.color = new H();
    }
    reset() {
      (this.closed = !0),
        this.points.fill(0),
        this.uv_rect.set(0, 0, 0, 0),
        (this.point_count = 0),
        (this.width = 1),
        (this.feather = 1),
        (this.clip = 0),
        this.color.set(0, 0, 0, 1);
    }
    set(e) {
      this.points.set(e), (this.point_count = e.length >> 1);
    }
  };
  var Pe = (function () {
      let t;
      return function () {
        return t === void 0 && (t = new de()), t.reset(), t;
      };
    })(),
    et = (function () {
      let t;
      return function () {
        return (
          t === void 0 &&
            ((t = new Vn()), (t.points = Db(1024, Float32Array).buffer)),
          t.reset(),
          t
        );
      };
    })();
  function Xy(t, e, r) {
    return (r.r = t.r * e), (r.g = t.g * e), (r.b = t.b * e), r;
  }
  var $y = new Float32Array([
      0.23, 0.231865811, 0.238636111, 0.208759089, 0.253184917, 0.19141925,
      0.274368189, 0.18, 0.601, 0.18, 0.76, 0.354335631, 0.76, 0.780019501,
      0.75449301, 0.798619899, 0.737738141, 0.819809497, 0.708038421, 0.83,
      0.274368189, 0.83, 0.253184917, 0.819809497, 0.238636111, 0.804538036,
      0.23, 0.780019501,
    ]),
    qy = new Float32Array([
      0.76, 0.349961886, 0.630073342, 0.349961886, 0.614385431, 0.347905345,
      0.602140966, 0.337766147, 0.6, 0.324063061, 0.6, 0.188,
    ]),
    Qy = "c3c3c3",
    Zy = "adadad";
  function Yy(t, e, r = 0) {
    let o = Pe(),
      n = et(),
      i = S(x);
    i.copy(e), o.color.set_hex_string(Qy);
    let a = e.x,
      s = e.y,
      c = e.w,
      _ = e.h;
    (n.clip = r),
      ne($y, o, e, n),
      Te(t, n),
      o.color.set_hex_string(Zy),
      ne(qy, o, e, n),
      Te(t, n),
      (i.x = a + c * 0.31),
      (i.y = s + _ * 0.44),
      (i.w = c * 0.37),
      (i.h = _ * 0.05),
      O(t, o, i, r),
      (i.y += _ * 0.1),
      O(t, o, i, r),
      (i.y += _ * 0.1),
      O(t, o, i, r),
      R(i);
  }
  function Jy(t, e, r = 0) {
    let o = Pe(),
      n = et();
    n.clip = r;
    let i = S(x);
    i.copy(e),
      o.color.set_hex_string(Qy),
      ne($y, o, e, n),
      Te(t, n),
      o.color.set_hex_string(Zy),
      ne(qy, o, e, n),
      Te(t, n);
    let a = e.x,
      s = e.y,
      c = e.w,
      _ = e.h;
    (i.x = a + c * 0.27),
      (i.y = s + _ * 0.32),
      (i.w = c * 0.45),
      (i.h = _ * 0.45),
      i.copy(i),
      fd(t, i, r),
      R(i);
  }
  var L_ = 6,
    Ky = new Float32Array([
      0.1, 0.18, 0.37, 0.18, 0.5, 0.25, 0.37, 0.32, 0.1, 0.32,
    ]);
  function eg(t, e, r = 0) {
    let o = Pe(),
      n = et();
    n.clip = r;
    let i = S(x);
    i.copy(e), o.color.copy(h(F).theme.folder.color);
    let a = e.x,
      s = e.y,
      c = e.w,
      _ = e.h;
    (i.w = c * 0.8),
      (i.h = _ * 0.65),
      (i.x = a + c * 0.1),
      (i.y = s + _ * 0.25),
      q(t, o, i, L_, r),
      Xy(o.color, 0.8, o.color),
      ne(Ky, o, e, n),
      Te(t, n),
      R(i);
  }
  function md(t, e, r = 0, o = !1) {
    let n = Pe(),
      i = et();
    i.clip = r;
    let a = S(x);
    a.copy(e), n.color.copy(h(F).theme.folder.color);
    let s = e.x,
      c = e.y,
      _ = e.w,
      l = e.h;
    (a.w = _ * 0.8),
      (a.h = l * 0.65),
      (a.x = s + _ * 0.1),
      (a.y = c + l * 0.25),
      Xy(n.color, 0.85, n.color),
      q(t, n, a, L_, r),
      ne(Ky, n, e, i),
      Te(t, i),
      o ||
        ((a.w = _ * 0.6),
        (a.h = l * 0.3),
        (a.x = s + _ * 0.2),
        (a.y = c + l * 0.4),
        n.color.set_hex_string("ccc"),
        q(t, n, a, L_ / 2, r)),
      (a.h = l * 0.4),
      (a.y = c + l * 0.5),
      (a.x = s + _ * 0.1),
      (a.w = _ * 0.8),
      n.color.copy(h(F).theme.folder.color),
      q(t, n, a, L_, r),
      R(a);
  }
  function tg(t, e, r = 0) {
    md(t, e, r, !0);
  }
  var iS = new Float32Array([0.32, 0.33, 0.68, 0.5, 0.32, 0.68]);
  function Ei(t, e, r = 0) {
    let o = et();
    o.clip = r;
    let n = Pe();
    n.color.set_hex_string("e0e0e0cc"), ne(iS, n, e, o), Te(t, o);
  }
  var aS = new Float32Array([0.32, 0.52, 0.68, 0.32, 0.68, 0.68]);
  function N_(t, e, r = 0) {
    let o = et();
    o.clip = r;
    let n = Pe();
    n.color.set_hex_string("e0e0e0cc"), ne(aS, n, e, o), Te(t, o);
  }
  var sS = new Float32Array([0.33, 0.32, 0.67, 0.32, 0.5, 0.68]);
  function Ra(t, e, r = 0) {
    let o = et();
    o.clip = r;
    let n = Pe();
    n.color.set_hex_string("e0e0e0cc"), ne(sS, n, e, o), Te(t, o);
  }
  function rg(t, e, r = 0) {
    let o = Pe(),
      n = et();
    n.clip = r;
    let i = e.x,
      a = e.y,
      s = e.w,
      c = e.h,
      _ = S(x);
    o.color.set_hex_string("e0e0e0"),
      (_.w = s * 0.7),
      (_.h = c * 0.7),
      (_.x = i + s * 0.15),
      (_.y = a + c * 0.15),
      q(t, o, _, 2, r),
      o.color.set_hex_string("74ADCD"),
      (_.w = s * 0.55),
      (_.h = c * 0.5),
      (_.x = i + s * 0.23),
      (_.y = a + c * 0.22),
      O(t, o, _, r),
      o.color.set_hex_string("EFC783"),
      (_.w = s * 0.08),
      (_.h = c * 0.08),
      (_.x = i + s * 0.65),
      (_.y = a + c * 0.3),
      q(t, o, _, _.w * 0.5),
      o.color.set_hex_string("4C5B6F");
    let l = new Float32Array([0.23, 0.72, 0.38, 0.4, 0.6, 0.65, 0.6, 0.72]),
      u = new Float32Array([0.6, 0.72, 0.6, 0.65, 0.71, 0.58, 0.78, 0.72]);
    ne(l, o, e, n), Te(t, n), ne(u, o, e, n), Te(t, n), R(_);
  }
  function fd(t, e, r = 0) {
    let o = Pe(),
      n = et();
    n.clip = r;
    let i = new Float32Array([0.14, 0.31, 0.55, 0.45, 0.55, 0.86, 0.14, 0.73]),
      a = new Float32Array([0.55, 0.45, 0.88, 0.31, 0.88, 0.7, 0.55, 0.86]),
      s = new Float32Array([0.14, 0.31, 0.5, 0.18, 0.88, 0.31, 0.55, 0.45]),
      c = new Float32Array([
        0.2734, 0.2629, 0.3712, 0.2281, 0.75, 0.3663, 0.66, 0.4047,
      ]),
      _ = new Float32Array([0.75, 0.3663, 0.75, 0.46, 0.66, 0.5, 0.66, 0.4047]),
      l = new Float32Array([
        0.26, 0.768, 0.26, 0.62, 0.3534, 0.6448, 0.3534, 0.797,
      ]);
    o.color.set_hex_string("937122"),
      ne(i, o, e, n),
      Te(t, n),
      o.color.set_hex_string("B08728"),
      ne(a, o, e, n),
      Te(t, n),
      o.color.set_hex_string("B4A072"),
      ne(s, o, e, n),
      Te(t, n),
      o.color.set_hex_string("D8D8D87F"),
      ne(c, o, e, n),
      Te(t, n),
      o.color.set_hex_string("D8D8D87F"),
      ne(_, o, e, n),
      Te(t, n),
      o.color.set_hex_string("D8D8D87F"),
      ne(l, o, e, n),
      Te(t, n);
  }
  function og(t, e, r = 0) {
    let o = Pe(),
      n = et();
    n.clip = r;
    let i = e.x,
      a = e.y,
      s = e.w,
      c = e.h,
      _ = S(x);
    (_.w = s * 0.8),
      (_.h = c * 0.5),
      (_.x = i + s * 0.1),
      (_.y = a + c * 0.29),
      o.color.set_hex_string("e0e0e0"),
      q(t, o, _, 4, r),
      (_.w = s * 0.4),
      (_.h = c * 0.4),
      (_.x = i + s * 0.3),
      (_.y = a + c * 0.32),
      o.color.set_hex_string("30373f"),
      q(t, o, _, _.w * 0.5 - 1, r),
      (_.w = s * 0.2),
      (_.h = c * 0.2),
      (_.x = i + s * 0.4),
      (_.y = a + c * 0.42),
      o.color.set_hex_string("e0e0e0"),
      q(t, o, _, _.w * 0.5 - 1, r),
      o.color.set_hex_string("e0e0e0");
    let l = new Float32Array([0.3, 0.3, 0.38, 0.21, 0.63, 0.21, 0.7, 0.3]);
    ne(l, o, e, n), Te(t, n), R(_);
  }
  var ng = new Float32Array([0.2, 0.2, 0.8, 0.8]),
    ig = new Float32Array([0.8, 0.2, 0.2, 0.8]);
  function jn(t, e, r = 0) {
    let o = Pe(),
      n = et();
    (n.clip = r),
      o.color.set_hex_string("cccc"),
      (n.closed = !1),
      ne(ng, o, e, n),
      ke(t, n),
      ne(ig, o, e, n),
      ke(t, n);
  }
  function ag(t, e, r = 0) {
    let o = Pe(),
      n = et();
    o.color.set_hex_string("f1434aff"),
      (o.line_width = 10),
      (n.closed = !1),
      ne(ng, o, e, n),
      ke(t, n),
      ne(ig, o, e, n),
      ke(t, n);
  }
  var z_ = new H().set_hex_string("e0e0e0"),
    dd = new H().set_hex_string("f1434a"),
    Vy = new H().set_hex_string("4d9cc9"),
    jy = new H().set_hex_string("4cbd62"),
    cS = new Float32Array([0.45, 0.13, 0.535, 0.28, 0.365, 0.28]),
    _S = new Float32Array([0.78, 0.505, 0.93, 0.59, 0.78, 0.675]),
    lS = new Float32Array([0.217, 0.7, 0.335, 0.825, 0.17, 0.87]),
    uS = new Float32Array([0.45, 0.59, 0.45, 0.23]),
    pS = new Float32Array([0.45, 0.59, 0.83, 0.59]),
    dS = new Float32Array([0.45, 0.59, 0.24, 0.79]),
    Zr = 5;
  function sg(t, e, r = 0) {
    let o = Pe(),
      n = et();
    o.color.copy(z_),
      ne(cS, o, e, n),
      Te(t, n),
      ne(uS, o, e, n),
      (n.closed = !1),
      (n.width = Zr),
      ke(t, n),
      o.color.copy(z_),
      ne(_S, o, e, n),
      Te(t, n),
      ne(pS, o, e, n),
      (n.closed = !1),
      (n.width = Zr),
      ke(t, n),
      o.color.copy(z_),
      ne(lS, o, e, n),
      Te(t, n),
      ne(dS, o, e, n),
      (n.closed = !1),
      (n.width = Zr),
      ke(t, n);
  }
  function cg(t, e, r = 0) {
    let o = Pe(),
      n = et(),
      i = new Float32Array([0.16, 0.57, 0.33, 0.61, 0.21, 0.735]),
      a = new Float32Array([0.79, 0.275, 0.84, 0.44, 0.67, 0.4]),
      s = new Float32Array([
        0.39, 0.505, 0.505, 0.39, 0.615, 0.505, 0.505, 0.615,
      ]),
      c = new Float32Array([0.16, 0.44, 0.5, 0.12, 0.77, 0.375]),
      _ = new Float32Array([0.84, 0.57, 0.5, 0.89, 0.23, 0.6359]);
    o.color.copy(z_),
      ne(i, o, e, n),
      Te(t, n),
      ne(a, o, e, n),
      Te(t, n),
      ne(s, o, e, n),
      Te(t, n),
      ne(c, o, e, n),
      (n.closed = !1),
      (n.width = Zr),
      ke(t, n),
      ne(_, o, e, n),
      (n.closed = !1),
      (n.width = Zr),
      ke(t, n);
  }
  function _g(t, e, r = 0) {
    let o = Pe(),
      n = et();
    o.line_width = Zr;
    let i = S(x),
      a = e.x,
      s = e.y,
      c = e.w,
      _ = e.h;
    (i.w = c * 0.32),
      (i.h = _ * 0.32),
      (i.x = a + c * 0.21),
      (i.y = s + _ * 0.49),
      o.color.set_hex_string("e0e0e0"),
      O(t, o, i),
      (i.w = c * 0.6),
      (i.h = _ * 0.6),
      (i.x = a + c * 0.21),
      (i.y = s + _ * 0.21),
      o.color.set_hex_string("e0e0e0"),
      Wo(t, o, i);
    let l = new Float32Array([0.585, 0.32, 0.75, 0.27, 0.71, 0.44]),
      u = new Float32Array([0.56, 0.47, 0.69, 0.33]);
    ne(l, o, e, n),
      Te(t, n),
      ne(u, o, e, n),
      (n.closed = !1),
      (n.width = Zr),
      ke(t, n),
      R(i);
  }
  function B_(t, e, r = 0, o = dd) {
    let n = Pe(),
      i = et(),
      a = e.x,
      s = e.y,
      c = e.w,
      _ = e.h,
      l = S(x);
    (l.w = c * 0.32),
      (l.h = _ * 0.6),
      (l.x = a + c * 0.34),
      (l.y = s + _ * 0.34),
      n.color.copy(o),
      n.color.set_hex_string("e0e0e0");
    let u = new Float32Array([0.21, 0.61, 0.5, 0.11, 0.79, 0.61]);
    ne(u, n, e, i),
      (i.width = Zr * 6),
      ke(t, i),
      O(t, n, l),
      n.color.copy(o),
      (l.w = c * 0.22),
      (l.h = _ * 0.5),
      (l.x = a + c * 0.39),
      (l.y = s + _ * 0.39),
      O(t, n, l),
      ne(u, n, e, i),
      Te(t, i),
      R(l);
  }
  function lg(t, e, r = 0) {
    let o = Pe(),
      n = e.x,
      i = e.y,
      a = e.w,
      s = e.h,
      c = S(x);
    (c.w = a * 0.4696),
      (c.h = s * 0.4838),
      (c.x = n + a * 0.3304),
      (c.y = i + s * 0.2),
      o.color.set_hex_string("e0e0e0"),
      (o.line_width = Zr),
      Wo(t, o, c),
      (c.x = n + a * 0.2),
      (c.y = i + s * 0.3164),
      O(t, o, c),
      R(c);
  }
  function ug(t, e, r = 0) {
    let o = Pe(),
      n = et(),
      i = e.x,
      a = e.y,
      s = e.w,
      c = e.h,
      _ = S(x),
      l = S(M);
    (_.w = s * 0.2),
      (_.h = c * 0.09),
      (_.x = i + s * 0.4),
      (_.y = a + c * 0.17),
      o.color.set_hex_string("e0e0e0"),
      (o.line_width = Zr),
      l.set(8, 8, 1, 1),
      fr(t, o, _, l),
      (_.w = s * 0.57),
      (_.h = c * 0.14),
      (_.x = i + s * 0.21),
      (_.y = a + c * 0.26),
      fr(t, o, _, l),
      (_.w = s * 0.4275),
      (_.h = c * 0.4219),
      (_.x = i + s * 0.2813),
      (_.y = a + c * 0.4),
      l.set(1, 1, 8, 8),
      fr(t, o, _, l),
      (n.closed = !1);
    let u = new Float32Array([0.4, 0.5121, 0.4, 0.6949]),
      d = new Float32Array([0.495, 0.5121, 0.495, 0.6949]),
      p = new Float32Array([0.59, 0.5121, 0.59, 0.6949]);
    ne(u, o, e, n),
      ke(t, n),
      ne(d, o, e, n),
      ke(t, n),
      ne(p, o, e, n),
      ke(t, n),
      R(l),
      R(_);
  }
  function pg(t, e, r = 0) {
    let o = Pe(),
      n = et();
    o.color.set_hex_string("e0e0e0"), (o.line_width = Zr);
    let i = new Float32Array([0.27, 0.2222, 0.72, 0.495, 0.27, 0.7678]);
    ne(i, o, e, n), Te(t, n);
  }
  function dg(t, e, r = 0) {
    let o = Pe(),
      n = e.x,
      i = e.y,
      a = e.w,
      s = e.h,
      c = S(x);
    (c.w = a * 0.14),
      (c.h = s * 0.55),
      (c.x = n + a * 0.27),
      (c.y = i + s * 0.22),
      o.color.set_hex_string("e0e0e0"),
      O(t, o, c),
      (c.x = n + a * 0.58),
      (c.y = i + s * 0.22),
      O(t, o, c),
      R(c);
  }
  function mg(t, e, r = 0) {
    let o = Pe(),
      n = e.x,
      i = e.y,
      a = e.w,
      s = e.h,
      c = S(x);
    (c.w = a * 0.48),
      (c.h = s * 0.48),
      (c.x = n + a * 0.26),
      (c.y = i + s * 0.26),
      o.color.set_hex_string("e0e0e0"),
      O(t, o, c),
      R(c);
  }
  function fg(t, e, r = 0) {
    let o = Pe(),
      n = et(),
      i = e.x,
      a = e.y,
      s = e.w,
      c = e.h,
      _ = S(x);
    (_.w = s * 0.65),
      (_.h = c * 0.39),
      (_.x = i + s * 0.17),
      (_.y = a + c * 0.3),
      o.color.set_hex_string("e0e0e0"),
      q(t, o, _, 8),
      (_.w = s * 0.16),
      (_.h = c * 0.16),
      (_.x = i + s * 0.26),
      (_.y = a + c * 0.42),
      o.color.set_hex_string("30373f"),
      q(t, o, _, _.w >> 1),
      (_.x = i + s * 0.58),
      (_.y = a + c * 0.42),
      q(t, o, _, _.w >> 1);
    let l = new Float32Array([
      0.42, 0.69, 0.4442, 0.66, 0.5458, 0.66, 0.57, 0.69,
    ]);
    ne(l, o, e, n), Te(t, n), R(_);
  }
  function hg(t, e, r = 0) {
    let o = Pe(),
      n = et(),
      i = e.x,
      a = e.y,
      s = e.w,
      c = e.h,
      _ = S(x);
    (_.w = s * 0.1745),
      (_.h = c * 0.1731),
      (_.x = i + s * 0.26),
      (_.y = a + c * 0.17),
      o.color.set_hex_string("#e0e0e0"),
      (o.line_width = Zr + 2),
      O(t, o, _),
      (_.x = i + s * 0.5655),
      (_.y = a + c * 0.6569),
      O(t, o, _),
      (_.x = i + s * 0.5655),
      (_.y = a + c * 0.4189),
      O(t, o, _);
    let l = new Float32Array([0.6473, 0.5, 0.3473, 0.5, 0.3473, 0.2566]),
      u = new Float32Array([0.3473, 0.5054, 0.3473, 0.7434, 0.6418, 0.7434]);
    ne(l, o, e, n),
      (n.closed = !1),
      ke(t, n),
      ne(u, o, e, n),
      (n.closed = !1),
      ke(t, n),
      R(_);
  }
  function bg(t, e, r = 0) {
    let o = Pe(),
      n = e.x,
      i = e.y,
      a = e.w,
      s = e.h,
      c = S(x);
    (c.w = a * 0.53),
      (c.h = s * 0.09),
      (c.x = n + a * 0.23),
      (c.y = i + s * 0.22),
      o.color.set_hex_string("#e0e0e0"),
      O(t, o, c),
      (c.y = i + s * 0.45),
      O(t, o, c),
      (c.y = i + s * 0.68),
      O(t, o, c),
      R(c);
  }
  function yg(t, e, r = 0) {
    let o = Pe(),
      n = e.x,
      i = e.y,
      a = e.w,
      s = e.h,
      c = S(x);
    (c.w = a * 0.24),
      (c.h = s * 0.24),
      (c.x = n + a * 0.21),
      (c.y = i + s * 0.22),
      o.color.set_hex_string("#e0e0e0"),
      O(t, o, c),
      (c.x = n + a * 0.54),
      (c.y = i + s * 0.22),
      O(t, o, c),
      (c.x = n + a * 0.21),
      (c.y = i + s * 0.54),
      O(t, o, c),
      (c.x = n + a * 0.54),
      (c.y = i + s * 0.54),
      O(t, o, c),
      R(c);
  }
  function gg(t, e, r = 0) {
    let o = Pe(),
      n = e.x,
      i = e.y,
      a = e.w,
      s = e.h,
      c = S(x);
    (c.w = a * 0.14),
      (c.h = s * 0.55),
      (c.x = n + a * 0.43),
      (c.y = i + s * 0.22),
      o.color.set_hex_string("#656c75"),
      O(t, o, c),
      (c.w = a * 0.55),
      (c.h = s * 0.14),
      (c.x = n + a * 0.22),
      (c.y = i + s * 0.43),
      O(t, o, c),
      R(c);
  }
  function xg(t, e, r = 0) {
    let o = Pe(),
      n = et(),
      i = e.x,
      a = e.y,
      s = e.w,
      c = e.h,
      _ = S(x);
    (_.x = i + s * 0.22),
      (_.y = a + c * 0.22),
      (_.w = s * 0.13),
      (_.h = c * 0.55),
      o.color.set_hex_string("e0e0e0"),
      O(t, o, _);
    let l = new Float32Array([0.47, 0.22, 0.88, 0.495, 0.47, 0.77]);
    ne(l, o, e, n), (n.closed = !1), Te(t, n), R(_);
  }
  function wg(t, e, r = 0, o = 1) {
    let n = Pe(),
      i = et(),
      a = e.x,
      s = e.y,
      c = e.w,
      _ = e.h,
      l = S(x),
      u = S(M);
    (l.x = a + c * 0.12),
      (l.y = s),
      (l.w = c * 0.75),
      (l.h = _ * 0.7),
      n.color.set_hex_string("6699aa"),
      u.set(4, 4, 0, 0).mul(o),
      ue(t, n, l, u);
    let d = new Float32Array([0.12, 0.69, 0.87, 0.69, 0.5, 1]);
    ne(d, n, e, i), (i.closed = !1), Te(t, i), R(u), R(l);
  }
  var mS = new Float32Array([0.17, 0.41, 0.07, 0.52, 0.45, 0.89, 0.43, 0.67]),
    fS = new Float32Array([0.45, 0.89, 0.97, 0.19, 0.85, 0.1, 0.43, 0.67]);
  function vg(t, e, r = 0) {
    let o = Pe(),
      n = et();
    o.color.set_hex_string("e0e0e0"),
      ne(mS, o, e, n),
      Te(t, n),
      ne(fS, o, e, n),
      Te(t, n);
  }
  function Ig(t, e, r = 0) {
    let o = Pe(),
      n = et(),
      i = e.x,
      a = e.y,
      s = e.w,
      c = e.h,
      _ = S(x),
      l = S(M);
    (_.x = i + s * 0.13),
      (_.y = a + c * 0.18),
      (_.w = s * 0.74),
      (_.h = c * 0.65),
      l.elements.fill(12),
      o.color.set_hex_string("b0b0b0"),
      (o.line_width = 8),
      fr(t, o, _, l),
      (_.x = i + s * 0.46),
      (_.y = a + c * 0.58),
      (_.w = s * 0.25),
      (_.h = c * 0.08),
      O(t, o, _);
    let u = new Float32Array([0.29, 0.4, 0.4, 0.5]);
    (o.line_width = 5),
      (o.feather = 2),
      (n.closed = !1),
      ne(u, o, e, n),
      ke(t, n),
      u.set([0.4, 0.5, 0.29, 0.6]),
      ne(u, o, e, n),
      ke(t, n),
      R(l),
      R(_);
  }
  function Tg(t, e, r = 0) {
    let o = Pe(),
      n = e.x,
      i = e.y,
      a = e.w,
      s = e.h,
      c = S(x);
    (c.x = n + a * 0.18),
      (c.y = i + s * 0.18),
      (c.w = a * 0.64),
      (c.h = s * 0.64),
      (o.line_width = 8),
      o.color.set_hex_string("b0b0b0"),
      Wo(t, o, c, r),
      (o.line_width = 6),
      (c.x = n + a * 0.18),
      (c.y = i + s * 0.38),
      (c.w = a * 0.64),
      (c.h = s * 0.23),
      Wo(t, o, c, r),
      (c.x = n + a * 0.38),
      (c.y = i + s * 0.18),
      (c.w = a * 0.24),
      (c.h = s * 0.64),
      Wo(t, o, c, r);
  }
  function Rg(t, e, r = 0) {
    let o = new Float32Array([0.2744, 0.29, 0.7138, 0.29]),
      n = Pe(),
      i = et();
    (i.closed = !1),
      (n.line_width = 6),
      (n.feather = 1),
      n.color.set_hex_string("b0b0b0"),
      ne(o, n, e, i),
      ke(t, i),
      o.set([0.7138, 0.29, 0.88, 0.71]),
      ne(o, n, e, i),
      ke(t, i),
      o.set([0.88, 0.71, 0.12, 0.71]),
      ne(o, n, e, i),
      ke(t, i),
      o.set([0.12, 0.71, 0.2744, 0.29]),
      ne(o, n, e, i),
      ke(t, i),
      o.set([0.24, 0.3852, 0.7494, 0.3852]),
      ne(o, n, e, i),
      ke(t, i),
      o.set([0.8088, 0.5328, 0.1853, 0.5328]),
      ne(o, n, e, i),
      ke(t, i),
      o.set([0.595, 0.29, 0.6425, 0.71]),
      ne(o, n, e, i),
      ke(t, i),
      o.set([0.3575, 0.71, 0.405, 0.29]),
      ne(o, n, e, i),
      ke(t, i);
  }
  function Sg(t, e, r = 0) {
    let o = Pe(),
      n = et(),
      i = e.x,
      a = e.y,
      s = e.w,
      c = e.h,
      _ = S(x),
      l = S(T),
      u = S(M);
    (_.x = i + s * 0.1),
      (_.y = a + c * 0.18),
      (_.w = s * 0.8),
      (_.h = c * 0.64),
      o.color.set_hex_string("c9c9c9"),
      q(t, o, _, 8, r),
      l.set(i + s * 0.78, a + c * 0.26),
      o.color.copy(dd),
      Fr(t, o, l, s * 0.04, r),
      l.set(i + s * 0.65, a + c * 0.26),
      o.color.copy(Vy),
      Fr(t, o, l, s * 0.04, r),
      l.set(i + s * 0.52, a + c * 0.26),
      o.color.copy(jy),
      Fr(t, o, l, s * 0.04, r),
      Ta(u, 0, 0, 8, 8),
      (_.x = i + s * 0.1),
      (_.y = a + c * 0.34),
      (_.w = s * 0.8),
      (_.h = c * 0.48),
      o.color.set_hex_string("303030"),
      ue(t, o, _, u, r),
      Ta(u, 0, 0, 8, 0),
      (_.x = i + s * 0.1),
      (_.y = a + c * 0.34),
      (_.w = s * 0.28),
      (_.h = c * 0.48),
      o.color.set_hex_string("404040"),
      ue(t, o, _, u, r),
      o.color.set_hex_string("c9c9c9"),
      (_.x = i + s * 0.15),
      (_.y = a + c * 0.43),
      (_.h = c * 0.04),
      (_.w = s * 0.188),
      O(t, o, _, r),
      (_.y = a + c * 0.65),
      O(t, o, _, r),
      (_.x = i + s * 0.2),
      (_.y = a + c * 0.54),
      (_.w = s * 0.13),
      O(t, o, _, r),
      o.color.copy(Vy),
      (_.x = i + s * 0.44),
      (_.y = a + c * 0.43),
      (_.w = s * 0.12),
      (_.h = c * 0.04),
      O(t, o, _, r),
      o.color.copy(dd),
      (_.x = i + s * 0.59),
      O(t, o, _, r),
      (_.x = i + s * 0.44),
      (_.y = a + c * 0.65),
      O(t, o, _, r),
      o.color.copy(jy),
      (_.x = i + s * 0.54),
      (_.y = a + c * 0.54),
      (_.w = s * 0.3),
      O(t, o, _, r),
      (_.x = i + s * 0.59),
      (_.y = a + c * 0.65),
      (_.w = s * 0.21),
      O(t, o, _, r),
      R(_),
      R(l),
      R(u);
  }
  var Fg = {},
    Ag = new WeakMap();
  function Fe(t, e) {
    (Fg[e] = t), Ag.set(t, e);
  }
  function Qs(t) {
    return Ag.get(t) ?? "unnamed";
  }
  function kg(t) {
    let e = Fg[t];
    if (!e) throw `tab not found ${t}`;
    return e;
  }
  var W_ = new x(),
    Pg = 32,
    Eg = {};
  function hS(t) {
    let e = Eg[t];
    return e || ((e = new re(t)), (Eg[t] = e)), e;
  }
  function Se(t, e, r) {
    let o = hS(e);
    W_.copy(r), (W_.y += r.h - Pg + 12), (W_.h = Pg), V(t, o, W_);
  }
  function Zs(t, e = !0) {
    let r = t.tab_rect,
      o = S(x),
      n = t.buffer.layers[0];
    (o.x = r.x),
      (o.y = r.y),
      (o.w = o.h = ve),
      eg(n, o),
      e && Se(t, "ui_icon_folder", o),
      (o.x += ve),
      md(n, o),
      e && Se(t, "ui_icon_folder_open", o),
      (o.x += ve),
      tg(n, o),
      e && Se(t, "ui_icon_folder_open_empty", o),
      (o.x += ve),
      Yy(n, o),
      e && Se(t, "ui_icon_file", o),
      (o.x += ve),
      Ei(n, o),
      e && Se(t, "ui_icon_triangle_right", o),
      (o.x += ve),
      Ra(n, o),
      e && Se(t, "ui_icon_triangle_down", o),
      (o.x += ve),
      rg(n, o),
      e && Se(t, "ui_icon_image", o),
      (o.x += ve),
      fd(n, o),
      e && Se(t, "ui_icon_crate", o),
      (o.x += ve),
      og(n, o),
      e && Se(t, "ui_icon_camera", o),
      (o.x += ve),
      jn(n, o),
      e && Se(t, "ui_icon_close", o),
      (o.x += ve),
      Jy(n, o),
      e && Se(t, "ui_icon_file_model", o),
      (o.x += ve),
      ag(n, o),
      e && Se(t, "ui_icon_folder", o),
      (o.x += ve),
      sg(n, o),
      e && Se(t, "ui_icon_transform", o),
      (o.x += ve),
      cg(n, o),
      e && Se(t, "ui_icon_rotate", o),
      (o.x += ve),
      _g(n, o),
      e && Se(t, "ui_icon_scale", o);
    let i = h(F).theme;
    (o.x = r.x),
      (o.y += ve),
      B_(n, o, 0, i.axis_input_x.outline_color),
      e && Se(t, "ui_icon_arrow", o),
      (o.x += ve),
      B_(n, o, 0, i.axis_input_y.outline_color),
      e && Se(t, "ui_icon_arrow", o),
      (o.x += ve),
      B_(n, o, 0, i.axis_input_z.outline_color),
      e && Se(t, "ui_icon_arrow", o),
      (o.x += ve),
      lg(n, o),
      e && Se(t, "ui_icon_duplicate", o),
      (o.x += ve),
      ug(n, o),
      e && Se(t, "ui_icon_trash_bin", o),
      (o.x += ve),
      pg(n, o),
      e && Se(t, "ui_icon_play", o),
      (o.x += ve),
      dg(n, o),
      e && Se(t, "ui_icon_pause", o),
      (o.x += ve),
      mg(n, o),
      e && Se(t, "ui_icon_terminate", o),
      (o.x += ve),
      fg(n, o),
      e && Se(t, "ui_icon_xr_headset", o),
      (o.x += ve),
      hg(n, o),
      e && Se(t, "ui_icon_outline", o),
      (o.x += ve),
      bg(n, o),
      e && Se(t, "ui_icon_detail", o),
      (o.x += ve),
      yg(n, o),
      e && Se(t, "ui_icon_grid", o),
      (o.x += ve),
      gg(n, o),
      e && Se(t, "ui_icon_add", o),
      (o.x += ve),
      N_(n, o),
      e && Se(t, "ui_icon_triangle_left", o),
      (o.x += ve),
      xg(n, o),
      e && Se(t, "ui_icon_step_forward", o),
      (o.x += ve),
      vg(n, o),
      e && Se(t, "ui_icon_tick", o),
      (o.x = r.x),
      (o.y += ve),
      Ig(n, o),
      e && Se(t, "ui_icon_terminal", o),
      (o.x += ve),
      Tg(n, o),
      e && Se(t, "ui_icon_perspective", o),
      (o.x += ve),
      Rg(n, o),
      e && Se(t, "ui_icon_orthographic", o),
      (o.x += ve),
      Sg(n, o),
      e && Se(t, "ui_icon_code_editor", o),
      R(o);
  }
  Fe(Zs, "ui_tab_icon_gallery");
  function Sa(t) {
    let e = Qt(),
      r = C.CurrentDevice(),
      o = r.encoder;
    e.draw.uniforms.icon_texture = void 0;
    let n = S(x);
    n.set(0, 0, wo, wo),
      o.set_pass(e.icon_pass, "[ui_icon_render.ts]"),
      o.clear(),
      t.tab_rect.copy(n),
      e.buffer.reset(),
      Zs(t, !1),
      e.window_size.set(wo, wo, r.pixel_ratio),
      e.render(),
      t.update(),
      o.set_pass(),
      o.commit(),
      e.window_size.set(r.screen_width, r.screen_height, r.pixel_ratio),
      (e.draw.uniforms.icon_texture = e.icon_texture),
      R(n);
  }
  var Dg = new WeakMap();
  function Cg(t) {
    let e = Dg.get(t);
    if (e === void 0) {
      (e = { create_btn: new P("Create"), cancel_btn: new P("Cancel") }),
        (e.name_label = new re("Project Name")),
        (e.name_label.alignment = 9);
      let r = new Mt();
      (r.width = 100),
        (r.height = 24),
        r.margin.set(10, 0, 0, 10),
        (r.alignment = 36),
        (e.name_label_constraint = r),
        (e.project_create_rect = new x(t.rect.x, t.rect.y, gS, xS)),
        (e.id = Ie(e));
      let o = new qe();
      (o.label.alignment = 33),
        (o.label.padding_left = 5),
        (o.outline = !0),
        (e.project_name_input = o);
      let n = new Mt();
      (n.height = 24),
        (n.width = 140),
        (n.alignment = 12),
        n.margin.set(10, 10, 0, 0),
        (e.project_name_input_constraint = n),
        Dg.set(t, e);
    }
    return e;
  }
  var yd = !0,
    Ks = [],
    gd = [],
    Ys,
    xd,
    hd,
    H_,
    Gg,
    Js,
    Ug = 64,
    Mg = 104,
    bS = 140,
    yS = 174,
    bd = 10,
    Lg = new Map();
  function zg(t) {
    let e = h(F).theme,
      r = t.buffer.layers[0],
      o = t.tab_rect,
      n = t.renderer.buffer.write_clip(o),
      i = Cg(t.tab),
      a = S(x),
      s = S(x),
      c = h(Di);
    (yd || c.project_updated) && (vS(t), (yd = !1)),
      Ys === void 0 &&
        ((Ys = new re("Union")),
        (Ys.font = hr(zr).clone(16)),
        (Ys.alignment = 33),
        (Ys.padding.w = 20),
        (Gg = new P()),
        (hd = new P("Upload")),
        (hd.radius = 0),
        (H_ = new P("Delete")),
        (H_.radius = 0),
        (xd = new re("Project Type")),
        (xd.alignment = 9),
        (Js = new Zt()),
        Js.set_option("Game", 0),
        Js.set_option("Film", 1),
        Js.set_option("Virtual Reality", 2)),
      i.create_project_activated && (wS(t), (t.next_hover_layer_index = 1)),
      a.copy(t.tab_rect),
      (a.x += bd),
      (a.y += bd),
      (a.h = yS),
      (a.w = bS);
    let _ = !1;
    for (let l = 0; l < Ks.length; l++) {
      let u = Ks[l],
        d = gd[l];
      if (
        (V_(t, d, e.panel_layer_1, a, 0, n) && Ng(u.name),
        s.copy(a),
        d.dragging)
      )
        _ = !0;
      else {
        s.shrink(10), (s.h = s.w / Bg);
        let p = Lg.get(u.name);
        p !== void 0 ? j_(t, p, s, 3, n) : q(r, e.background_float, s, 3, n),
          a.contains(t.mouse_location) &&
            0 >= t.hover_layer &&
            t.active === -1 &&
            Ee(r, e.background_float, a, 4, n);
      }
      a.x += bd + a.w;
    }
    E(t, Gg, e.panel_layer_1, a, 0, n) &&
      (console.log("open new project"), (i.create_project_activated = !0)),
      s.copy(a),
      s.shrink((a.h - Ug) / 2, (a.w - Ug) / 2),
      (s.w = s.h),
      Wg(t.buffer, s, n),
      a.contains(t.mouse_location) &&
        0 >= t.hover_layer &&
        t.active === -1 &&
        Ee(r, e.background_float, a, 4, n),
      _ &&
        (s.copy(t.tab_rect),
        (s.y = s.h - Mg - Sr),
        (s.h = Mg),
        (s.w *= 0.5),
        E(t, hd, e.panel_layer_1, s, 0, n),
        (s.x += s.w),
        E(t, H_, e.transform_x, s, 0, n)),
      R(s),
      R(a);
  }
  var O_ = 50,
    gS = 270,
    xS = 230;
  function wS(t) {
    let e = h(F).theme,
      r = t.buffer.layers[1],
      o = t.tab_rect,
      n = Cg(t.tab),
      {
        create_btn: i,
        cancel_btn: a,
        name_label: s,
        name_label_constraint: c,
        id: _,
        project_create_rect: l,
        project_name_input_constraint: u,
        project_name_input: d,
      } = n,
      p = S(T),
      m = S(T);
    t.ishovering(l) &&
      t.next_hover_layer_index <= 1 &&
      ((t.next_hover_layer_index = 1), (t.next_hover = _)),
      t.hover === _ &&
        t.left_mouse_press &&
        (t.active !== _ && p.set(l.x, l.y).sub(t.mouse_location),
        t.set_active(_)),
      t.active === _ &&
        (m.copy(t.mouse_location).add(p),
        (l.x = Q(m.x, O_, o.w - l.w - O_)),
        (l.y = Q(m.y, O_, o.h - l.h - O_)),
        t.left_mouse_release && t.clear_active()),
      R(p),
      R(m),
      q(r, e.panel_layer_1, l, 4),
      Ee(r, e.background_float, l, 4);
    let f = S(x);
    f.copy(l),
      yt(l, c, f),
      V(t, s, f, 1),
      (f.y += f.h * 1.5),
      V(t, xd, f, 1),
      yt(l, u, f),
      At(t, d, e.panel_layer_1, f, 1),
      (f.y += f.h * 1.5),
      Yr(t, Js, e.panel_layer_3, f, 1),
      f.copy(l),
      (f.y += f.h - 35),
      (f.x += f.w - 260),
      (f.h = 24),
      (f.w = 120),
      E(t, a, e.background_float, f, 1) &&
        ((n.create_project_activated = !1), (d.text = "")),
      (f.x += 10 + f.w),
      E(t, i, e.background_float, f, 1) && Ng(d.text),
      R(f);
  }
  function vS(t) {
    let e = h(Bo);
    e.db !== void 0 &&
      Iy(e.db, "project").then((r) => {
        Ks = r;
        for (let o = 0; o < Ks.length; o++) {
          let n = Ks[o],
            i = gd[o];
          i === void 0 &&
            ((i = new P(n.name)),
            (gd[o] = i),
            (i.label.alignment = 48),
            (i.label.padding.z = 8),
            (i.label.padding.w = 8)),
            (i.label.text = n.name),
            (i.drag_end = (a) => {
              a === H_ &&
                e.delete_project(n.id).then(() => {
                  yd = !0;
                });
            }),
            n.thumbnail !== void 0 &&
              h(mr)
                .load(n.thumbnail, "png")
                .then((a) => {
                  let s = Ne({ source: a, name: n.name });
                  Lg.set(n.name, s), (t.needs_update = !0);
                });
        }
        (t.needs_update = !0), (h(Di).project_updated = !1);
      });
  }
  function Ng(t) {
    window.location.href = `${
      window.location.origin
    }/editor.html?project_name=${encodeURIComponent(t)}`;
  }
  var Og = new Map();
  function Hg(t) {
    let e = Og.get(t);
    return (
      e === void 0 &&
        ((e = {}),
        (e.folder_rename_input = new qe()),
        (e.folder_rename_input.label.alignment = 33),
        (e.tree_states = new WeakMap()),
        (e.tree_nodes = []),
        (e.active_changed = !0),
        (e.editor_root = h(Z).root),
        Og.set(t, e)),
      e
    );
  }
  function Vg(t) {
    let { tab: e } = t,
      r = h(Z),
      o = Hg(t.tab);
    o.active_changed && ((o.tree_nodes = []), jg(e, o.editor_root));
  }
  function jg(t, e, r = 0) {
    let { tree_states: o, tree_nodes: n } = Hg(t);
    for (let i = 0; i < e.children.length; ++i) {
      let a = e.children[i],
        s = o.get(a);
      if (s === void 0) {
        s = {};
        let c = new P(),
          _ = new re(a.name);
        (s.btn = c), (s.label = _), o.set(a, s);
      }
      (s.label.text = a.name),
        (s.depth = r),
        n.push(s),
        a.type === "folder"
          ? (a.opened
              ? (s.icon = a.children.length > 0 ? Fa : Xn)
              : (s.icon = ec),
            jg(t, a, r + 1))
          : (s.icon = tc);
    }
  }
  function rc(t, e, r) {
    return (
      e.y + e.h + r.h < t.h ? (r.y = e.y + e.h) : (r.y = e.y - e.h - r.h),
      e.x + r.w < t.w ? (r.x = e.x) : (r.x = e.x - (r.w - e.w)),
      r
    );
  }
  var Jr = class extends M {
      get top() {
        return this.x;
      }
      get right() {
        return this.y;
      }
      get bottom() {
        return this.z;
      }
      get left() {
        return this.w;
      }
      set top(e) {
        this.x = e;
      }
      set right(e) {
        this.y = e;
      }
      set bottom(e) {
        this.z = e;
      }
      set left(e) {
        this.w = e;
      }
      constructor(e = 0, r = 0, o = 0, n = 0) {
        super(e, r, o, n);
      }
    },
    Mt = class {
      constructor() {
        this.width = -1;
        this.height = -1;
        this.margin = new Jr();
        this.alignment = 3;
      }
      copy(e) {
        return (
          (this.width = e.width),
          (this.height = e.height),
          this.margin.copy(e.margin),
          (this.alignment = e.alignment),
          this
        );
      }
      scale(e) {
        return (this.width *= e), (this.height *= e), this.margin.mul(e), this;
      }
    },
    Aa = new Jr(0, 0, 0, 0);
  function yt(t, e, r) {
    if (e === void 0) return t;
    r === void 0 && (r = new x()),
      (r.w = e.width === -1 ? t.w : e.width),
      (r.h = e.height === -1 ? t.h : e.height);
    let o = e.alignment ?? 3;
    return (
      e.margin !== void 0 ? Aa.copy(e.margin) : Aa.elements.fill(0),
      o & 32 && (r.x = t.x + Aa.left),
      o & 16 && (r.y = t.y + t.h - r.h - Aa.bottom),
      o & 8 && (r.x = t.x + t.w - r.w - Aa.right),
      o & 4 && (r.y = t.y + Aa.top),
      o & 1 && (r.y = t.y + Math.max(0, (t.h - r.h) * 0.5)),
      o & 2 && (r.x = t.x + Math.max(0, (t.w - r.w) * 0.5)),
      r
    );
  }
  var Yt = class {
    constructor() {
      this.rect = new x();
      this.constraint = new Mt();
      this.id = Ie(this);
    }
    get alignment() {
      return this.constraint.alignment;
    }
    set alignment(e) {
      this.constraint.alignment = e;
    }
    get padding() {
      return this.constraint.margin;
    }
    set padding_top(e) {
      this.padding.x = e;
    }
    set padding_right(e) {
      this.padding.y = e;
    }
    set padding_bottom(e) {
      this.padding.z = e;
    }
    set padding_left(e) {
      this.padding.w = e;
    }
  };
  var Xg = 1.5;
  function $g(t, e, r, o, n = 0) {
    if (e === "") return;
    let i = hr(zr);
    X_(t, r, i, e, n, o);
  }
  var re = class extends Yt {
    constructor(r, o = !1) {
      super();
      this.scale = 1;
      this.cursor = !1;
      this.code = !1;
      this._text_size = new T();
      this._text = "";
      this.content_updated = !1;
      this.unit = "";
      this.char_offsets = [];
      (this.code = o), (this.text = r);
    }
    get text_size() {
      if (this.content_updated || this.font) {
        let r = this.font || (this.code ? hr(Gi) : hr(zr));
        (this.char_offsets = []),
          r.compute_size(this._text, this._text_size, this.char_offsets),
          (this.content_updated = !1);
      }
      return this._text_size;
    }
    get text() {
      return this._text;
    }
    set text(r) {
      this._text !== r && ((this._text = r), (this.content_updated = !0));
    }
  };
  function V(t, e, r, o = 0, n = 0, i, a = !0) {
    if (e.text.length <= 0) return;
    let s = S(x),
      c = S(T),
      _ = S(Mt),
      l = t.buffer.layers[o];
    if (n !== 0 && (l.buffer.read_clip(s, n), br(r, s) === -1)) {
      R(s), R(c), R(_);
      return;
    }
    let u = e.font;
    u || (u = e.code ? hr(Gi) : hr(zr));
    let d = e.text_size;
    (e.constraint.width = d.x * e.scale),
      (e.constraint.height = d.y * e.scale),
      _.copy(e.constraint).scale(e.scale),
      yt(r, e.constraint, s),
      c.set(s.x, s.y),
      X_(l, c, u, e.text, n, e.scale, i),
      e.unit !== "" &&
        a &&
        ((c.x += e.text_size.x + Xg), $g(l, e.unit, c, e.scale, n)),
      R(s),
      R(c),
      R(_);
  }
  var qg = new Map();
  function ka(t) {
    let e = qg.get(t);
    return e || ((e = new re(t)), qg.set(t, e)), e;
  }
  var de = class {
    constructor() {
      this.line_width = 1;
      this.feather = 1;
      this.color = new H(0, 0, 0, 1);
      this.hover_color = new H();
      this.active_color = new H();
      this.outline_color = new H();
    }
    copy(e) {
      return (
        (this.line_width = e.line_width),
        (this.feather = e.feather),
        this.color.copy(e.color),
        this.hover_color.copy(e.hover_color),
        this.active_color.copy(e.active_color),
        this.outline_color.copy(e.outline_color),
        this
      );
    }
    clone() {
      return new de().copy(this);
    }
    reset() {
      (this.line_width = 2),
        (this.feather = 1),
        this.color.set(0, 0, 0, 1),
        this.active_color.set(0, 0, 0, 1),
        this.hover_color.set(0, 0, 0, 1),
        this.outline_color.set(0, 0, 0, 1);
    }
  };
  function K(t = "0000", e = "0000", r = "0000", o = "0000") {
    let n = new de();
    return (
      n.color.set_hex_string(t),
      n.hover_color.set_hex_string(e),
      n.active_color.set_hex_string(r),
      n.outline_color.set_hex_string(o),
      n
    );
  }
  function $_(t, e, r, o) {
    (o.r = Ue(t.r, e.r, r)),
      (o.g = Ue(t.g, e.g, r)),
      (o.b = Ue(t.b, e.b, r)),
      (o.a = e.a);
  }
  function Zg(t, e, r, o) {
    (r.line_width = e.line_width),
      (r.feather = e.feather),
      $_(t.color, e.color, o, r.color),
      $_(t.hover_color, e.hover_color, o, r.hover_color),
      $_(t.active_color, e.active_color, o, r.active_color),
      $_(t.outline_color, e.outline_color, o, r.outline_color);
  }
  function Yg(t) {
    let e = new de();
    return (
      (e.line_width = t.line_width),
      (e.feather = t.feather),
      e.color.set_hex_string(t.color),
      e.hover_color.set_hex_string(t.hover),
      e.active_color.set_hex_string(t.active),
      e.outline_color.set_hex_string(t.outline),
      e
    );
  }
  var Kr = class {
    constructor(e = "") {
      this.text = e;
      this.activated = !1;
      this.shadow = !1;
      this.render_base_menu = !0;
      this.submenus = [];
      this.min_width = 120;
      this.last_hover = -1;
      this.radiuses = new M(3, 3, 3, 3);
      (this.id = Ie(this)),
        (this.label = new re(e)),
        (this.label.alignment = 3);
    }
    set radius(e) {
      this.radiuses.elements.fill(e);
    }
    add_sub_menu(e, r) {
      let o = new Kr(e);
      return (
        (o.label.alignment = 33),
        (o.label.padding_left = 22),
        (o.func = r),
        this.submenus.push(o),
        o
      );
    }
    render_sub_menu(e, r, o, n, i = 0, a) {
      let s = S(x),
        c = S(x),
        _ = S(de),
        l = S(M),
        u = S(x),
        d = e.buffer.layers[n],
        p = s;
      p.copy(o),
        (p.x += p.w),
        (p.h = this.submenus.length * o.h),
        _.color.copy(r.active_color),
        this.radiuses.all_zero()
          ? (Wo(d, _, p, i), O(d, r, p, i))
          : (fr(d, _, p, this.radiuses, i), ue(d, r, p, this.radiuses, i));
      let m = !1;
      p.expand(10),
        e.ishovering(p) && (m = !0),
        p.copy(o),
        (p.x += p.w),
        (p.h = o.h),
        c.copy(p),
        (c.w = Math.max(c.w, this.min_width));
      for (let f = 0; f < this.submenus.length; ++f) {
        let y = this.submenus[f],
          g = !1;
        e.ishovering(c) &&
          ((e.next_hover_layer_index = n + 1),
          _.color.copy(r.hover_color),
          f === 0
            ? (l.set(this.radiuses.x, this.radiuses.y, 0, 0), ue(d, _, c, l, i))
            : f === this.submenus.length - 1
              ? (l.set(0, 0, this.radiuses.z, this.radiuses.w),
                ue(d, _, c, l, i))
              : O(d, _, c, i),
          (g = !0),
          (this.last_hover = f)),
          V(e, y.label, c, n + 1, i),
          y.submenus.length > 0 &&
            (u.copy(c),
            (u.x += u.w - u.h),
            (u.w = u.h),
            u.shrink(2),
            Ei(e.buffer.layers[n + 1], u, i)),
          (g || this.last_hover === f) &&
            (m = y.render_sub_menu(e, r, c, n + 1, i, a + 1) || m),
          (c.y += c.h),
          g &&
            y.submenus.length <= 0 &&
            e.left_mouse_press &&
            (y.func && y.func(), (m = !1));
      }
      return R(s), R(c), R(_), R(l), R(u), m;
    }
  };
  function $n(t, e, r, o, n = 0, i = 0) {
    let a = !1,
      s = e.id,
      c = t.buffer.layers[n],
      _ = t.buffer.layers[n + 1],
      l = S(x),
      u = S(de),
      d = S(M),
      p = S(x),
      m = S(x);
    if (
      (t.ishovering(o) &&
        t.active === -1 &&
        t.next_hover_layer_index <= n &&
        ((t.next_hover = s), (t.next_hover_layer_index = n)),
      u.color.copy(r.color),
      t.hover === s && u.color.copy(r.hover_color),
      e.shadow)
    ) {
      let f = h(F).theme;
      q(c, f.shadow, o, 0, i);
    }
    if (
      (e.render_base_menu &&
        (e.radiuses.all_zero()
          ? O(c, u, o, i)
          : t.active === s
            ? (d.set(e.radiuses.x, e.radiuses.y, 0, 0), ue(c, u, o, d, i))
            : ue(c, u, o, e.radiuses, i)),
      l.copy(o),
      V(t, e.label, l, n, i),
      t.hover === s &&
        t.left_mouse_press &&
        (t.set_active(s), (e.last_hover = e.submenus.length)),
      t.active === s)
    ) {
      l.copy(o),
        (l.y += l.h),
        (l.h = e.submenus.length * o.h),
        (l.w = Math.max(l.w, e.min_width)),
        u.color.copy(r.color),
        e.render_base_menu
          ? (d.set(0, 0, e.radiuses.z, e.radiuses.w), ue(_, u, l, d, i))
          : ue(_, u, l, e.radiuses, i);
      let f = !1;
      l.expand(l.h, Ai),
        t.ishovering(l) && (f = !0),
        p.copy(o),
        (p.h = o.h),
        (p.w = Math.max(p.w, e.min_width)),
        (p.y += p.h);
      for (let y = 0; y < e.submenus.length; ++y) {
        let g = e.submenus[y],
          v = !1,
          w = t.ishovering(p);
        w &&
          ((t.next_hover_layer_index = n + 1),
          u.color.copy(r.hover_color),
          y === e.submenus.length - 1
            ? (d.set(0, 0, e.radiuses.z, e.radiuses.w), ue(_, u, p, d, i))
            : y === 0 && e.render_base_menu
              ? (d.set(e.radiuses.x, e.radiuses.y, 0, 0), ue(_, u, p, d, i))
              : O(_, u, p, i),
          (v = !0),
          (e.last_hover = y)),
          V(t, g.label, p, n + 1, i),
          g.submenus.length > 0
            ? (m.copy(p),
              (m.x += m.w - m.h),
              (m.w = m.h),
              m.shrink(2),
              Ei(t.buffer.layers[n + 1], m, i),
              (v || e.last_hover === y) &&
                (f = g.render_sub_menu(t, r, p, n + 1, i, 1) || f))
            : t.left_mouse_release &&
              w &&
              (t.clear_active(), g.func && g.func()),
          (p.y += p.h);
      }
      f || (t.clear_active(), (e.last_hover = -1));
    }
    return R(l), R(u), R(d), R(p), R(m), a;
  }
  var IS = 200,
    Jg = 24,
    q_ = new x(),
    Q_ = new x(),
    Kg = new WeakMap();
  function TS(t) {
    let e = Kg.get(t);
    return e || ((e = {}), (e.channel_names = new WeakMap()), Kg.set(t, e)), e;
  }
  function vd(t) {
    let { tab_rect: e, tab: r } = t,
      o = TS(r),
      { resource: n, channel_names: i } = o;
    if (!n || !n.data) return;
    let a = h(F).theme,
      s = n.data.clip;
    q_.copy(e),
      (q_.w = IS),
      O(t.buffer, a.panel_layer_1, q_),
      Q_.copy(q_),
      (Q_.h = Jg);
    for (let c of s.channels) {
      let _ = i.get(c);
      _ || ((_ = c.name), i.set(c, _));
      let l = ex(_);
      E(t, l, a.panel_layer_1, Q_), (Q_.y += Jg);
    }
  }
  Fe(vd, "ui_tab_animation_clip_editor");
  var Z_ = class {
    constructor() {
      this.activated = !1;
    }
  };
  var xn = class {
    constructor(e, r, o, n = !1, i, a = !1, s = !0) {
      this.node = e;
      this.name = r;
      this.type = o;
      this.input_slot = n;
      this.default_value = i;
      this.editable = a;
      this.connectable = s;
      this.is_graph_slot = !0;
      this.anchor = new T();
      this.outputs = new Set();
      this.value = this.default_value;
    }
    static is(e) {
      return !!e.is_graph_slot;
    }
    read() {
      return this.input && this.input.value ? this.input.value : this.value;
    }
    write(e, r = !0) {
      switch (((e = e ?? this.value), this.type)) {
        case 0:
        case 8:
        case 19:
        case 1: {
          this.value = e;
          for (let o of this.outputs) (o.value = e), (o.activated = r);
          break;
        }
        case 2:
        case 3:
        case 4:
        case 5: {
          this.value.copy(e);
          for (let o of this.outputs) o.value.copy(e), (o.activated = r);
          break;
        }
        default:
          throw `unsupported type ${this.type} value copy.`;
      }
    }
    write_direct(e, r = !0) {
      for (let o of this.outputs) (o.value = e), (o.activated = r);
    }
    create_connection() {
      let e = new Z_();
      return this.outputs.add(e), (e.from = this), (e.value = RS(this.type)), e;
    }
    connect(e) {
      return this.validate_connection(e)
        ? ((e.to = this),
          (this.input = e),
          this.on_connect && this.on_connect(e),
          !0)
        : !1;
    }
    disconnect(e) {
      this.outputs.has(e) &&
        (this.on_disconnect && this.on_disconnect(e),
        e.from && this.outputs.delete(e),
        (e.from = void 0),
        (e.to = void 0)),
        this.input === e &&
          ((this.input = void 0), e.from && e.from.disconnect(e)),
        this.input || (this.value = this.default_value);
    }
    validate_connection(e) {
      return !(
        !e.from ||
        !this.input_slot ||
        this.input ||
        e.from.node === this.node ||
        (e.from.type !== this.type && this.type !== 20)
      );
    }
  };
  function Pa(t) {
    t !== void 0 &&
      (t.from &&
        (t.from.on_disconnect && t.from.on_disconnect(t),
        t.from.outputs.delete(t),
        (t.from = void 0)),
      t.to &&
        (t.to.on_disconnect && t.to.on_disconnect(t),
        (t.to.input = void 0),
        (t.to = void 0)));
  }
  function RS(t) {
    switch (t) {
      case 0:
        return !1;
      case 1:
        return 0;
      case 2:
        return new T();
      case 3:
        return new b();
      case 4:
        return new M();
      case 5:
        return new $();
      default:
        console.log(`unimplemented slot type ${t} default value.`);
        return;
    }
  }
  function Y_(t, e) {
    for (let [r, o] of t.input_slots) e.has(r) || t.remove_input_slot(r);
  }
  function tx(t, e) {
    for (let [r, o] of t.input_slots) e.has(r) || t.remove_output_slot(r);
  }
  var rx = 26,
    SS = 3,
    FS = 200,
    AS = 0,
    N = class {
      constructor(e) {
        this.func = e;
        this.is_graph_node = !0;
        this.input_slots = new Map();
        this.output_slots = new Map();
        this.folded = !1;
        this.activated = !1;
        this.rect = new x(100, 100, FS, rx);
        this.id = AS++;
      }
      static is(e) {
        return !!e.is_graph_node;
      }
      resize() {
        this.rect.h =
          rx * (this.input_slots.size + this.output_slots.size + 1) + SS;
      }
      add_input_slot(e, r, o, n = !1, i = !0) {
        let a = new xn(this, e, r, !0, o, n, i);
        return this.input_slots.set(e, a), this.resize(), a;
      }
      remove_input_slot(e) {
        let r = this.input_slots.get(e);
        r && (r.input && Pa(r.input), this.input_slots.delete(e));
      }
      add_output_slot(e, r, o, n = !1) {
        let i = new xn(this, e, r, !1, o, n);
        return this.output_slots.set(e, i), this.resize(), i;
      }
      remove_output_slot(e) {
        let r = this.output_slots.get(e);
        r && (r.outputs.forEach(Pa), this.output_slots.delete(e));
      }
      get_input_slot(e) {
        return this.input_slots.get(e);
      }
      get_output_slot(e) {
        return this.output_slots.get(e);
      }
      dispose() {
        for (let [e, r] of this.input_slots) this.remove_input_slot(e);
        for (let [e, r] of this.output_slots) this.remove_output_slot(e);
      }
    };
  function ox(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r && o);
  }
  function J_() {
    let t = new N(ox);
    return (
      t.add_input_slot("a", 0, !0),
      t.add_input_slot("b", 0, !0),
      t.add_output_slot("output", 0, !0),
      t
    );
  }
  W(ox, J_, "boolean and");
  function nx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r || o);
  }
  function Id() {
    let t = new N(nx);
    return (
      t.add_input_slot("a", 0, !0),
      t.add_input_slot("b", 0, !0),
      t.add_output_slot("output", 0),
      t
    );
  }
  W(nx, Id, "boolean or");
  function ix(t, e) {
    let r = e.get_input_slot("a").read();
    e.get_output_slot("output").write(!r);
  }
  function Td() {
    let t = new N(ix);
    return t.add_input_slot("a", 0, !0), t.add_output_slot("output", 0), t;
  }
  W(ix, Td, "boolean not");
  function kS(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r < o);
  }
  function Rd() {
    let t = new N(Sd);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 0),
      t
    );
  }
  W(kS, Rd, "less than");
  function Sd(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r <= o);
  }
  function Fd() {
    let t = new N(Sd);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 0),
      t
    );
  }
  W(Sd, Fd, "less equal");
  function ax(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r > o);
  }
  function Ad() {
    let t = new N(ax);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 0),
      t
    );
  }
  W(ax, Ad, "greater");
  function sx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r >= o);
  }
  function kd() {
    let t = new N(sx);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 0),
      t
    );
  }
  W(sx, kd, "greater equal");
  function cx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r === o);
  }
  function Pd() {
    let t = new N(cx);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 0),
      t
    );
  }
  W(cx, Pd, "equal");
  function _x(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r !== o);
  }
  function Ed() {
    let t = new N(_x);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 0),
      t
    );
  }
  W(_x, Ed, "not equal");
  function lx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("min").read(),
      n = e.get_input_slot("max").read();
    e.get_output_slot("output").write(r > o && r < n);
  }
  function Dd() {
    let t = new N(lx);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("min", 1, 0),
      t.add_input_slot("max", 1, 1),
      t.add_output_slot("output", 0),
      t
    );
  }
  W(lx, Dd, "in range");
  function ux(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r + o);
  }
  function Gd() {
    let t = new N(ux);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 1),
      t
    );
  }
  W(ux, Gd, "add");
  function px(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r - o);
  }
  function Ud() {
    let t = new N(px);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 1),
      t
    );
  }
  W(px, Ud, "subtract");
  function dx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r * o);
  }
  function Md() {
    let t = new N(dx);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 1),
      t
    );
  }
  W(dx, Md, "multiply");
  function mx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(r / o);
  }
  function K_() {
    let t = new N(mx);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 1),
      t.add_output_slot("output", 1),
      t
    );
  }
  W(mx, K_, "divide");
  function fx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("min").read(),
      n = e.get_input_slot("max").read();
    e.get_output_slot("output").write(Q(r, o, n));
  }
  function Cd() {
    let t = new N(fx);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("min", 1, 0),
      t.add_input_slot("max", 1, 1),
      t.add_output_slot("output", 1),
      t
    );
  }
  W(fx, Cd, "clamp");
  function hx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("b").read();
    e.get_output_slot("output").write(Math.min(r, o));
  }
  function PS() {
    let t = new N(hx);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 1),
      t
    );
  }
  W(hx, PS, "min");
  function bx(t, e) {
    let r = e.get_input_slot("a").read(),
      o = e.get_input_slot("max").read();
    e.get_output_slot("output").write(Math.max(r, o));
  }
  function ES() {
    let t = new N(bx);
    return (
      t.add_input_slot("a", 1, 0),
      t.add_input_slot("b", 1, 0),
      t.add_output_slot("output", 1),
      t
    );
  }
  W(bx, ES, "max");
  function yx(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.log(r));
  }
  function Ld() {
    let t = new N(yx);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(yx, Ld, "log");
  function DS(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.log10(r));
  }
  function zd() {
    let t = new N(el);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(DS, zd, "log10");
  function GS(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.log2(r));
  }
  function Nd() {
    let t = new N(el);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(GS, Nd, "log2");
  function gx(t, e) {
    let r = e.get_input_slot("base").read(),
      o = e.get_input_slot("exponent").read();
    e.get_output_slot("output").write(Math.pow(r, o));
  }
  function US() {
    let t = new N(gx);
    return (
      t.add_input_slot("base", 1, 1),
      t.add_input_slot("exponent", 1, 1),
      t.add_output_slot("output", 1, 0),
      t
    );
  }
  W(gx, US, "pow");
  function el(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.sin(r));
  }
  function Bd() {
    let t = new N(el);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(el, Bd, "sin");
  function xx(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.asin(r));
  }
  function Wd() {
    let t = new N(xx);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(xx, Wd, "asin");
  function Od(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.cos(r));
  }
  function Hd() {
    let t = new N(Od);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(Od, Hd, "cos");
  function MS(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.acos(r));
  }
  function Vd() {
    let t = new N(Od);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(MS, Vd, "acos");
  function wx(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.tan(r));
  }
  function jd() {
    let t = new N(wx);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(wx, jd, "tan");
  function vx(t, e) {
    let r = e.get_input_slot("input").read();
    e.get_output_slot("output").write(Math.atan(r));
  }
  function Xd() {
    let t = new N(vx);
    return (
      t.add_input_slot("input", 1, 0), t.add_output_slot("output", 1, 0), t
    );
  }
  W(vx, Xd, "atan");
  function Ix(t, e) {
    let r = e.get_input_slot("x").read(),
      o = e.get_input_slot("y").read();
    e.get_output_slot("output").write(Math.atan2(o, r));
  }
  function $d() {
    let t = new N(Ix);
    return (
      t.add_input_slot("x", 1, 0),
      t.add_input_slot("y", 1, 0),
      t.add_output_slot("output", 1, 0),
      t
    );
  }
  W(Ix, $d, "atan2");
  var qn = class {
    constructor() {
      this.name = "";
      this.version = 0;
      this.nodes = new Set();
      this.active_nodes = new Set();
    }
    clear_active() {
      this.active_nodes.clear();
    }
    set_active_node(e) {
      this.active_nodes.add(e);
    }
    add_node(e) {
      this.nodes.add(e);
    }
    delete_node(e) {
      e.dispose(), this.nodes.delete(e), this.active_nodes.delete(e);
    }
  };
  function CS(t) {
    for (let [e, r] of t.output_slots) if (r.outputs.size > 0) return !1;
    return !0;
  }
  function LS(t, e) {
    for (let [r, o] of t.input_slots)
      if (o.input && !e.has(o.input.from.node)) return !1;
    return !0;
  }
  function tl(t) {
    let e = [];
    for (let r of t.nodes) CS(r) && e.push(r);
    return e;
  }
  function rl(t) {
    let e = new Set(),
      r = [t];
    for (; r.length > 0; ) {
      let o = r.pop();
      e.add(o);
      for (let [n, i] of o.input_slots)
        if (i.input && i.input.from) {
          let a = i.input.from.node;
          r.push(a);
        }
    }
    return e;
  }
  function ol(t) {
    let e = t.size,
      r = [],
      o = new Set(),
      n = new Set();
    for (; r.length < e; ) {
      for (let i of t) o.has(i) || (LS(i, o) && (o.add(i), n.add(i)));
      for (let i of n) r.push(i), t.delete(i);
      n.clear();
    }
    return r;
  }
  var nl, Tx, qd;
  function W(t, e, r) {
    nl === void 0 &&
      ((nl = new Map()), (Tx = new WeakMap()), (qd = new WeakMap()));
    let o = { creator: e, func: t };
    nl.set(r, o), Tx.set(e, r), qd.set(t, r);
  }
  function zS(t) {
    let e = nl.get(t);
    if (e) return e.creator;
  }
  function Qd(t) {
    return qd.get(t);
  }
  function Ea(t) {
    let e = {},
      o = tl(t).map(rl).map(ol);
    (e.sub_graph = o.map((i) => i.map((a) => a.id))), (e.nodes = []);
    let n = new Set();
    for (let i of o)
      for (let a of i) n.has(a.id) || (e.nodes.push(NS(a)), n.add(a.id));
    return console.log(e), e;
  }
  function Rx(t, e) {
    if (t !== void 0)
      switch (e) {
        case 0:
        case 8:
        case 19:
        case 1:
          return t;
        case 2:
          return [t.x, t.y];
        case 3:
          return [t.x, t.y, t.z];
        case 4:
        case 5:
          return [t.x, t.y, t.z, t.w];
        default:
          throw `invalid slot data type ${e}`;
      }
  }
  function Sx(t, e) {
    if (t !== void 0)
      switch (e) {
        case 0:
        case 8:
        case 19:
        case 1:
          return t;
        case 2:
          return new T().set(t[0], t[1]);
        case 3:
          return new b().set(t[0], t[1], t[2]);
        case 4:
          return new M().set(t[0], t[1], t[2], t[3]);
        case 5:
          return new $().set(t[0], t[1], t[2], t[3]);
        default:
          throw `invalid slot data type ${e}`;
      }
  }
  function Da(t) {
    let e = new qn();
    console.log(t);
    let r = {};
    for (let o = 0; o < t.nodes.length; ++o) {
      let n = t.nodes[o],
        i = BS(n);
      (r[n.id] = i), e.nodes.add(i);
      for (let [a, s] of i.output_slots) {
        let c = n.output_slots[a];
        if (!c) continue;
        let _ = Sx(c.value, s.type);
        _ !== void 0 && ((s.value = _), s.on_change && s.on_change(_));
      }
      for (let [a, s] of i.input_slots) {
        let c = n.input_slots[a];
        if (!c) continue;
        let _ = Sx(c.value, s.type);
        _ !== void 0 && ((s.value = _), s.on_change && s.on_change(_));
      }
    }
    for (let o = 0; o < t.nodes.length; ++o) {
      let n = t.nodes[o],
        i = r[n.id];
      for (let [a, s] of i.output_slots) {
        let c = n.output_slots[a];
        if (c)
          for (let _ of c.outputs) {
            let u = r[_.id].get_input_slot(_.slot_name);
            if (u) {
              let d = s.create_connection();
              u.connect(d);
            }
          }
      }
    }
    return e;
  }
  function NS(t) {
    let e = { id: t.id, output_slots: {}, input_slots: {} };
    (e.name = Qd(t.func)),
      (e.origin = [t.rect.x, t.rect.y]),
      (e.folded = t.folded);
    for (let [r, o] of t.output_slots) {
      let n = { outputs: [] };
      (n.value = Rx(o.value, o.type)), (e.output_slots[r] = n);
      for (let i of o.outputs) {
        let a = { slot_name: i.to.name, id: i.to.node.id };
        n.outputs.push(a);
      }
    }
    for (let [r, o] of t.input_slots) {
      let n = {};
      (n.value = Rx(o.value, o.type)), (e.input_slots[r] = n);
    }
    return e;
  }
  function BS(t) {
    let e = zS(t.name)();
    return (
      t.origin && ((e.rect.x = t.origin[0]), (e.rect.y = t.origin[1])),
      (e.folded = !!t.folded),
      e
    );
  }
  var Fx = new L();
  function Ax(t, e) {
    let r = e.get_input_slot("location").read(),
      o = e.get_input_slot("up").read(),
      n = e.get_input_slot("target").read();
    Fx.look_at(r, n, o);
    let i = e.get_output_slot("quaternion");
    i.value.from_mat4(Fx), i.write(i.value);
  }
  function Zd() {
    let t = new N(Ax);
    return (
      t.add_input_slot("location", 3, new b(0, 0, -1)),
      t.add_input_slot("up", 3, new b(0, 1, 0)),
      t.add_input_slot("target", 3, new b(0, 0, 0)),
      t.add_output_slot("quaternion", 5, new $(0, 0, 0, 1)),
      t
    );
  }
  W(Ax, Zd, "look at");
  var il = class {
    constructor() {
      this.enabled = !1;
      this.enabled_breakpoints = !1;
      this.breakpoints = new Set();
      this.nodes = [];
    }
    get stepping() {
      return !!this.step_node;
    }
    set stepping(e) {
      e || (this.step_node = void 0);
    }
    toggle_breakpoint(e) {
      this.breakpoints.has(e)
        ? this.breakpoints.delete(e)
        : this.breakpoints.add(e);
    }
    remove_breakpoint(e) {
      this.breakpoints.delete(e);
    }
    is_breakpoint(e) {
      return this.breakpoints.has(e);
    }
    clear_breakpoint() {
      this.breakpoints.clear();
    }
    step_forward(e) {
      this.step_node || console.error("invalid action");
      let r = this.step_node,
        o = this.nodes.indexOf(r);
      r.func(e, r), (this.step_node = this.nodes[(o + 1) % this.nodes.length]);
    }
    continue(e) {
      if (!this.stepping) return;
      this.step_node.func(e, this.step_node);
      let r = this.nodes.indexOf(this.step_node);
      if (r < this.nodes.length - 1)
        for (let o = r + 1; o < this.nodes.length; ++o) {
          let n = this.nodes[o];
          if (this.breakpoints.has(n)) {
            this.step_node = n;
            return;
          }
          n.func(e, n);
        }
      this.stepping = !1;
    }
  };
  var Qn = class {
    constructor() {
      this.mode = 0;
      this.compiled_version = -1;
      this.sorted_subgraphs = [];
      this.debugger = new il();
    }
    analysis(e) {
      this.sorted_subgraphs = tl(e).map(rl).map(ol);
    }
    interpret(e) {
      if (((this.mode = 0), this.debugger.stepping)) {
        this.mode = 2;
        return;
      }
      this.analysis(e), (this.debugger.nodes = []);
      for (let r of this.sorted_subgraphs)
        for (let o of r) this.debugger.nodes.push(o);
      for (let r of this.sorted_subgraphs)
        for (let o of r) {
          if (this.debugger.breakpoints.has(o)) {
            (this.debugger.step_node = o), (this.mode = 2);
            return;
          }
          o.func(this, o);
        }
    }
    compile(e) {
      this.mode = 1;
    }
  };
  function kx(t, e) {
    e.get_output_slot("output").write();
  }
  function Yd() {
    let t = new N(kx);
    return t.add_output_slot("output", 0, !0, !0), t;
  }
  W(kx, Yd, "boolean");
  function Px(t, e) {
    e.get_output_slot("output").write();
  }
  function Jd() {
    let t = new N(Px);
    return t.add_output_slot("output", 1, 0, !0), t;
  }
  W(Px, Jd, "float");
  function Ex(t, e) {
    let r = e.get_output_slot("output"),
      o = e.get_input_slot("x").read(),
      n = e.get_input_slot("y").read();
    r.value.set(o, n), r.write();
  }
  function Kd() {
    let t = new N(Ex);
    return (
      t.add_output_slot("output", 2, new T()),
      t.add_input_slot("x", 1, 0, !0),
      t.add_input_slot("y", 1, 0, !0),
      t
    );
  }
  W(Ex, Kd, "float2");
  function Dx(t, e) {
    let r = e.get_output_slot("output"),
      o = e.get_input_slot("x").read(),
      n = e.get_input_slot("y").read(),
      i = e.get_input_slot("z").read();
    r.value.set(o, n, i), r.write();
  }
  function em() {
    let t = new N(Dx);
    return (
      t.add_output_slot("output", 3, new b()),
      t.add_input_slot("x", 1, 0, !0),
      t.add_input_slot("y", 1, 0, !0),
      t.add_input_slot("z", 1, 0, !0),
      t
    );
  }
  W(Dx, em, "float3");
  function Gx(t, e) {
    let r = e.get_output_slot("output"),
      o = e.get_input_slot("x").read(),
      n = e.get_input_slot("y").read(),
      i = e.get_input_slot("z").read(),
      a = e.get_input_slot("w").read();
    r.value.set(o, n, i, a), r.write();
  }
  function tm() {
    let t = new N(Gx);
    return (
      t.add_output_slot("output", 4, new M()),
      t.add_input_slot("x", 1, 0, !0),
      t.add_input_slot("y", 1, 0, !0),
      t.add_input_slot("z", 1, 0, !0),
      t.add_input_slot("w", 1, 1, !0),
      t
    );
  }
  W(Gx, tm, "float4");
  function Ux(t, e) {
    let r = e.get_output_slot("output"),
      o = e.get_input_slot("x").read(),
      n = e.get_input_slot("y").read(),
      i = e.get_input_slot("z").read(),
      a = e.get_input_slot("w").read();
    r.value.set(o, n, i, a), r.write();
  }
  function rm() {
    let t = new N(Ux);
    return (
      t.add_output_slot("output", 5, new $()),
      t.add_input_slot("x", 1, 0, !0),
      t.add_input_slot("y", 1, 0, !0),
      t.add_input_slot("z", 1, 0, !0),
      t.add_input_slot("w", 1, 1, !0),
      t
    );
  }
  W(Ux, rm, "quaternion");
  function Mx(t, e) {
    let o = e.get_input_slot("input").read();
    e.get_output_slot("x").write(o.x), e.get_output_slot("y").write(o.y);
  }
  function om() {
    let t = new N(Mx);
    return (
      t.add_output_slot("x", 1, 0),
      t.add_output_slot("y", 1, 0),
      t.add_input_slot("input", 2, new T(), !0),
      t
    );
  }
  W(Mx, om, "float2 split");
  function Cx(t, e) {
    let o = e.get_input_slot("input").read();
    e.get_output_slot("x").write(o.x),
      e.get_output_slot("y").write(o.y),
      e.get_output_slot("z").write(o.z);
  }
  function nm() {
    let t = new N(Cx);
    return (
      t.add_output_slot("x", 1, 0),
      t.add_output_slot("y", 1, 0),
      t.add_output_slot("z", 1, 0),
      t.add_input_slot("input", 3, new b(), !0),
      t
    );
  }
  W(Cx, nm, "float3 split");
  function Lx(t, e) {
    let o = e.get_input_slot("input").read();
    e.get_output_slot("x").write(o.x),
      e.get_output_slot("y").write(o.y),
      e.get_output_slot("z").write(o.z),
      e.get_output_slot("w").write(o.w);
  }
  function im() {
    let t = new N(Lx);
    return (
      t.add_output_slot("x", 1, 0),
      t.add_output_slot("y", 1, 0),
      t.add_output_slot("z", 1, 0),
      t.add_output_slot("w", 1, 0),
      t.add_input_slot("input", 4, new M(), !0),
      t
    );
  }
  W(Lx, im, "float4 split");
  function zx(t, e) {
    let o = e.get_input_slot("input").read();
    e.get_output_slot("x").write(o.x),
      e.get_output_slot("y").write(o.y),
      e.get_output_slot("z").write(o.z),
      e.get_output_slot("w").write(o.w);
  }
  function am() {
    let t = new N(zx);
    return (
      t.add_output_slot("x", 1, 0),
      t.add_output_slot("y", 1, 0),
      t.add_output_slot("z", 1, 0),
      t.add_output_slot("w", 1, 0),
      t.add_input_slot("input", 5, new $(), !0),
      t
    );
  }
  W(zx, am, "quaternion split");
  function Nx(t, e) {
    let r = h(F).engine.time;
    e.get_output_slot("time").write(r);
  }
  function sm() {
    let t = new N(Nx);
    return t.add_output_slot("time", 1, performance.now()), t;
  }
  W(Nx, sm, "time");
  var Bx = new Set(["entity name", "property path"]),
    Ga = new WeakMap();
  function Wx(t, e) {
    let r = Ga.get(e.get_input_slot("entity name"));
    if (!r || r.size <= 0) return;
    let o = e.get_input_slot("property path").value;
    if (!o) return;
    let n = e.get_input_slot(o);
    if (!n) return;
    let i = n.read(),
      a = h(ee).data_center;
    for (let s of r) a.set_property(s, o, i);
  }
  function cm() {
    let t = new N(Wx);
    t.rect.w *= 1.5;
    let e = t.add_input_slot("entity name", 8, "", !0);
    e.on_change = (o) => {
      if (e.input) return;
      let n = h(ee).data_center,
        i = Ga.get(e);
      i === void 0 && ((i = new Set()), Ga.set(e, i)), cd(n, o, i);
    };
    let r = t.add_input_slot("property path", 8, "", !0);
    return (
      (r.on_change = (o) => {
        if (r.input) return;
        Y_(t, Bx);
        let n = h(ee).data_center,
          i = o.split(".");
        if (i.length !== 2) {
          console.warn(`invalid property path ${o}.`);
          return;
        }
        let a = n.get_type_by_name(i[0]);
        if (!a) {
          console.warn(`type ${i[0]} not found.`);
          return;
        }
        let s = a.properties[i[1]];
        if (!s) {
          console.warn(`property ${i[1]} not found in type ${i[0]}.`);
          return;
        }
        if (s.type === 1) t.add_input_slot(o, 0, !1);
        else if (s.type === 4 || s.type === 3 || s.type === 2)
          if (s.size === 1) t.add_input_slot(o, 1, 0);
          else if (s.size === 2) t.add_input_slot(o, 2, new T());
          else if (s.size === 3) t.add_input_slot(o, 3, new b());
          else if (s.size === 4)
            o.search("rotation") > -1
              ? t.add_input_slot(o, 5, new $())
              : t.add_input_slot(o, 4, new M());
          else throw "unsupported property type";
      }),
      t
    );
  }
  W(Wx, cm, "Property Setter");
  function Ox(t, e) {
    let r = Ga.get(e.get_input_slot("entity name"));
    if (!r || r.size <= 0) return;
    let o = e.get_input_slot("property path").value;
    if (!o) return;
    let n = e.get_output_slot(o);
    if (!n) return;
    let i = n.value,
      a = h(ee).data_center;
    for (let s of r) a.get_property(s, o, i);
    n.write(i);
  }
  function _m() {
    let t = new N(Ox);
    t.rect.w *= 1.5;
    let e = t.add_input_slot("entity name", 8, "", !0);
    e.on_change = (o) => {
      if (e.input) return;
      let n = h(ee).data_center,
        i = Ga.get(e);
      i === void 0 && ((i = new Set()), Ga.set(e, i)), cd(n, o, i);
    };
    let r = t.add_input_slot("property path", 8, "", !0);
    return (
      (r.on_change = (o) => {
        if (r.input) return;
        tx(t, Bx);
        let n = h(ee).data_center,
          i = o.split(".");
        if (i.length !== 2) {
          console.warn(`invalid property path ${o}.`);
          return;
        }
        let a = n.get_type_by_name(i[0]);
        if (!a) {
          console.warn(`type ${i[0]} not found.`);
          return;
        }
        let s = a.properties[i[1]];
        if (!s) {
          console.warn(`property ${i[1]} not found in type ${i[0]}.`);
          return;
        }
        if (s.type === 1) t.add_output_slot(o, 0, !1);
        else if (s.type === 4 || s.type === 3 || s.type === 2)
          if (s.size === 1) t.add_output_slot(o, 1, 0);
          else if (s.size === 2) t.add_output_slot(o, 2, new T());
          else if (s.size === 3) t.add_output_slot(o, 3, new b());
          else if (s.size === 4)
            o.search("rotation") > -1
              ? t.add_input_slot(o, 5, new $())
              : t.add_input_slot(o, 4, new M());
          else throw "unsupported property type";
      }),
      t
    );
  }
  W(Ox, _m, "Property Getter");
  var lm = class {
      constructor(e) {
        this.values = [];
        e === void 0
          ? (this.values = [])
          : Array.isArray(e)
            ? (this.values = Array.from(e))
            : (this.values = $r(e) ? [e] : []);
      }
      get_value(e) {
        return this.values[e] || 0;
      }
      set_value(e, r = 0) {
        this.values[r] = e || 0;
      }
    },
    um = ((i) => (
      (i[(i.MouseButton = 1)] = "MouseButton"),
      (i[(i.MouseMove = 2)] = "MouseMove"),
      (i[(i.GamepadButton = 3)] = "GamepadButton"),
      (i[(i.GamepadAxis = 4)] = "GamepadAxis"),
      (i[(i.Keyboard = 5)] = "Keyboard"),
      i
    ))(um || {});
  function Zn(t, e) {
    return (BigInt(t) << 28n) | BigInt(e);
  }
  var OS = {
      A: 0,
      B: 1,
      X: 2,
      Y: 3,
      LT: 4,
      RT: 5,
      LB: 6,
      RB: 7,
      Share: 8,
      Menu: 9,
      LCenter: 10,
      RCenter: 11,
      Up: 12,
      Down: 13,
      Left: 14,
      Right: 15,
      XBox: 16,
    },
    oc = {
      LeftHorizontal: 0,
      LeftVertical: 1,
      RightHorizontal: 2,
      RightVertical: 3,
    },
    Kt = class {
      constructor() {
        this.virtual_inputs = new Es();
        this.trigger_map = new Map();
        this.gamepad_axis_min_threshold = 0.2;
        this.gamepads = new Map();
        this.gamepad_mapping = new Map();
        this.gamepad_count = 0;
        this.physical_triggers = new Set();
        this.input_loop = () => {
          this.update_gamepad(), this.update_physics_triggers();
        };
        this.keydown = (e) => {
          let r = Zn(5, e.keyCode),
            o = this.trigger_map.get(r);
          if (o)
            for (let n of o) n.target.value.set_value(n.scalar, n.dimension);
        };
        this.keyup = (e) => {
          let r = Zn(5, e.keyCode),
            o = this.trigger_map.get(r);
          if (o) for (let n of o) n.target.value.set_value(0, n.dimension);
        };
        this.gamepad_connected = (e) => {
          this.gamepad_count++;
          let r = e.gamepad;
          console.log(`gamepad ${r.index} connected.`),
            this.gamepads.set(r.index, r),
            console.log(r);
        };
        this.gamepad_disconnected = (e) => {
          this.gamepad_count--;
          let r = e.gamepad;
          console.log(`gamepad ${r.index} disconnected.`),
            this.gamepads.delete(r.index);
        };
      }
      async on_register() {
        this.listen_gamepad(),
          this.listen_keyboard(),
          this.add_virtual_input("left_horizontal"),
          this.add_virtual_input("left_vertical"),
          this.add_virtual_input("right_horizontal"),
          this.add_virtual_input("right_vertical"),
          this.add_virtual_input("jump"),
          this.add_virtual_input("fire"),
          this.set_virtual_input_trigger(
            "left_horizontal",
            4,
            oc.LeftHorizontal,
          ),
          this.set_virtual_input_trigger("left_vertical", 4, oc.LeftVertical),
          this.set_virtual_input_trigger(
            "right_horizontal",
            4,
            oc.RightHorizontal,
          ),
          this.set_virtual_input_trigger("right_vertical", 4, oc.RightVertical),
          this.add_virtual_input("direction");
        let e = 0.1;
        this.set_virtual_input_trigger("direction", 5, 87, 1, 1, e),
          this.set_virtual_input_trigger("direction", 5, 83, -1, 1, e),
          this.set_virtual_input_trigger("direction", 5, 65, -1, 0, e),
          this.set_virtual_input_trigger("direction", 5, 68, 1, 0, e),
          B.on(ze.BeforeTick, this.input_loop);
      }
      listen_keyboard() {
        window.addEventListener("keydown", this.keydown, !1),
          window.addEventListener("keyup", this.keyup, !1);
      }
      add_virtual_input(e, r) {
        let o = this.virtual_inputs.get(e);
        o !== void 0 && o.triggers.clear();
        let n = new Es();
        (o = { name: e, triggers: n, value: new lm(r), max_dimension: -1 }),
          this.virtual_inputs.set(e, o);
      }
      remove_input(e) {
        if (!this.virtual_inputs.has(e)) return;
        let r = this.virtual_inputs.get(e);
        this.virtual_inputs.delete(e);
        for (let [o, n] of r.triggers) {
          let i = this.trigger_map.get(o);
          i && i.delete(n);
        }
      }
      set_virtual_input_trigger(e, r, o, n = 1, i = 0, a = 0) {
        let s = this.virtual_inputs.get(e);
        if (s === void 0) return;
        let c = Zn(r, o),
          _ = s.triggers.get(c);
        _ !== void 0 &&
          this.remove_virtual_input_trigger(_.target.name, _.type, _.slot);
        let l = this.trigger_map.get(c);
        l === void 0 && ((l = new Set()), this.trigger_map.set(c, l)),
          (_ = {
            type: r,
            target: s,
            slot: o,
            scalar: n,
            dimension: i,
            restitution: a,
            interpolator: 0,
          }),
          l.add(_),
          s.triggers.set(c, _),
          (s.max_dimension = Math.max(s.max_dimension, i)),
          a !== 0 && this.physical_triggers.add(_);
      }
      set_input_trigger_dead_zone(e, r, o, n, i) {
        let a = this.virtual_inputs.get(e);
        if (!a) return;
        let s = Zn(r, o),
          c = a.triggers.get(s);
        c && (c.dead_zone = new T(n, i));
      }
      get_input_trigger(e, r, o) {
        let n = this.virtual_inputs.get(e);
        if (n === void 0) return;
        let i = Zn(r, o);
        return n.triggers.get(i);
      }
      remove_virtual_input_trigger(e, r, o) {
        let n = this.virtual_inputs.get(e);
        if (n === void 0) return;
        let i = Zn(r, o),
          a = n.triggers.get(i);
        if (a === void 0) return;
        n.triggers.delete(i);
        let s = this.trigger_map.get(i);
        s && s.delete(a), this.physical_triggers.delete(a);
      }
      has_input(e) {
        return this.virtual_inputs.get(e);
      }
      get_input(e, r = 0) {
        let o = this.virtual_inputs.get(e);
        return o === void 0 ? 0 : o.value.get_value(r);
      }
      set_input(e, r, o = 0) {
        let n = this.virtual_inputs.get(e);
        n !== void 0 && n.value.set_value(r, o);
      }
      update_physics_triggers() {}
      update_gamepad() {
        if (this.gamepad_count === 0) return;
        let e = navigator.getGamepads
          ? navigator.getGamepads()
          : navigator.webkitGetGamepads
            ? navigator.webkitGetGamepads
            : [];
        if (e) {
          for (let r of e)
            if (r != null) {
              this.gamepads.has(r.index) && this.gamepads.set(r.index, r);
              for (let o = 0; o < 17; ++o) {
                let n = Zn(3, o),
                  i = this.trigger_map.get(n),
                  a = r.buttons[o].value;
                if (i !== void 0)
                  for (let s of i)
                    s.target.value.set_value(s.scalar * a, s.dimension);
              }
              for (let o = 0; o < 4; ++o) {
                let n = r.axes[o],
                  i = Zn(4, o),
                  a = this.trigger_map.get(i);
                if (a !== void 0)
                  for (let s of a)
                    if (s.dead_zone) {
                      let c = s.dead_zone,
                        _ = s.scalar * n;
                      _ < c.x || _ > c.y
                        ? s.target.value.set_value(_, s.dimension)
                        : s.target.value.set_value(0, s.dimension);
                    } else s.target.value.set_value(s.scalar * n, s.dimension);
              }
            }
        }
      }
      listen_gamepad() {
        this.gamepad_mapping.set("standard", {
          button_mapping: OS,
          axis_mapping: oc,
        }),
          window.addEventListener("gamepadconnected", this.gamepad_connected),
          window.addEventListener(
            "gamepaddisconnected",
            this.gamepad_disconnected,
          );
      }
      gamepad_vibrate(e, r = 1e3, o = 1, n = 1, i = 0) {
        let a = this.gamepads.get(e);
        a !== void 0 &&
          a.vibrationActuator !== void 0 &&
          a.vibrationActuator.playEffect("dual_rumble", {
            startDelay: i,
            duration: r,
            weakMagnitude: o,
            strongMagnitude: n,
          });
      }
    };
  function Hx(t, e) {
    let r = e.get_input_slot("name").read(),
      o = h(Kt),
      n = o.has_input(r);
    if (n)
      for (let i = 0; i <= n.max_dimension; ++i) {
        let a = e.get_output_slot(`dimension ${i}`);
        if (!a) continue;
        let s = o.get_input(r, i);
        a.write(s, s !== 0);
      }
  }
  var HS = new Set(["name"]);
  function pm() {
    let t = new N(Hx),
      e = t.add_input_slot("name", 8, "", !0);
    return (
      (e.on_change = (r) => {
        let o = h(Kt),
          n = o.has_input(r);
        if (n && !(n.max_dimension < 0)) {
          Y_(t, HS);
          for (let i = 0; i <= n.max_dimension; ++i)
            t.add_output_slot(`dimension ${i}`, 1, o.get_input(r, i));
        }
      }),
      t
    );
  }
  W(Hx, pm, "Virtual Input");
  var Vx = new WeakMap();
  function nc(t) {
    let e = Vx.get(t);
    return (
      e === void 0 && ((e = {}), (e.chunk_map = new Map()), Vx.set(t, e)), e
    );
  }
  function er(t, e) {
    let r = nc(t),
      o = r.chunk_map.get(e.toString()),
      n = h(Z),
      i = h(J),
      a = n.get_node_by_path("builtin/default.tex"),
      s = i.get_resource_with_guid(a.guid);
    return (
      o === void 0 &&
        ((o = {
          world_matrix: { value: new L() },
          normal_matrix: { value: new Gr() },
          color_map: { resource_uuid: s.uuid, value: s.data.texture },
        }),
        r.chunk_map.set(e.toString(), o)),
      o
    );
  }
  function jx(t) {
    let e = {},
      r = nc(t);
    for (let [o, n] of r.chunk_map) e[o] = VS(n);
    return e;
  }
  function Xx(t, e) {
    let r = Object.keys(e),
      o = nc(t);
    for (let n of r) {
      let i = jS(t, e[n]);
      o.chunk_map.set(n, i);
    }
  }
  function VS(t) {
    let e = {};
    for (let r in t) {
      let o = t[r],
        n = { resource_uuid: o.resource_uuid };
      $r(o.value)
        ? (n.value = o.value)
        : o.value instanceof Float32Array
          ? (n.value = Array.from(o.value))
          : o.value instanceof L
            ? ((n.value = Array.from(o.value.elements)), (n.type = "mat4"))
            : o.value instanceof Gr
              ? ((n.value = Array.from(o.value.elements)), (n.type = "mat3"))
              : o.value instanceof T
                ? ((n.value = Array.from(o.value.elements)),
                  (n.type = "float2"))
                : o.value instanceof b
                  ? ((n.value = Array.from(o.value.elements)),
                    (n.type = "float3"))
                  : o.value instanceof M &&
                    ((n.value = Array.from(o.value.elements)),
                    (n.type = "float4")),
        (e[r] = n);
    }
    return e;
  }
  function jS(t, e) {
    let r = h(J),
      o = {};
    for (let n in e) {
      let i = e[n],
        a = {};
      if (i.resource_uuid !== void 0) {
        let s = r.get_resource(i.resource_uuid);
        if (s === void 0) continue;
        (a.value = s.data.texture), (a.resource_uuid = i.resource_uuid);
      } else
        i.type === "mat4"
          ? (a.value = new L().read(i.value))
          : i.type === "mat3"
            ? (a.value = new Gr().read(i.value))
            : i.type === "float4"
              ? (a.value = new M().read(i.value))
              : i.type === "float3"
                ? (a.value = new b().read(i.value))
                : i.type === "float2"
                  ? (a.value = new T().read(i.value))
                  : Array.isArray(i.value)
                    ? (a.value = new Float32Array(i.value))
                    : (a.value = i.value);
      o[n] = a;
    }
    return o;
  }
  function $x(t, e) {
    let r = nc(t),
      o = nc(e);
    for (let [n, i] of r.chunk_map) {
      let a = o.chunk_map.get(n) || {};
      for (let s in i) {
        let c = i[s],
          _ = a[s] || {};
        c.resource_uuid !== void 0
          ? ((_.resource_uuid = c.resource_uuid), (_.value = c.value))
          : $r(c.value)
            ? (_.value = c.value)
            : c.value instanceof Float32Array
              ? _.value === void 0
                ? (_.value = new Float32Array(c.value))
                : _.value.set(c.value)
              : (c.value instanceof L ||
                  c.value instanceof T ||
                  c.value instanceof b ||
                  c.value instanceof M) &&
                (_.value === void 0
                  ? (_.value = c.value.clone())
                  : _.value.read(c.value.elements)),
          (a[s] = _);
      }
      o.chunk_map.set(n, a);
    }
  }
  var dm = new be(),
    qx = new WeakMap();
  function fm(t) {
    let e = qx.get(t);
    return (
      e === void 0 &&
        ((e = {}),
        (e.culled_map = new WeakMap()),
        (e.frustum_map = new WeakMap()),
        (e.updated_map = new Map()),
        qx.set(t, e)),
      e
    );
  }
  function Yn(t, e) {
    let r = fm(t),
      o = r.culled_map.get(e);
    return (
      o === void 0 &&
        ((o = new Set()),
        r.frustum_map.set(e, new Rr()),
        r.updated_map.set(e, !1),
        r.culled_map.set(e, o)),
      r.updated_map.get(e) === !0 || XS(t, e),
      o
    );
  }
  function al(t) {
    let e = fm(t);
    for (let [r, o] of e.updated_map)
      e.updated_map.set(r, !1), e.culled_map.get(r).clear();
  }
  var mm;
  function XS(t, e) {
    mm ||
      (mm = new Ce([
        "entity.id",
        "model.model",
        "model.material",
        "model.box",
        "model.visible",
      ]));
    let r = fm(t),
      o = r.culled_map.get(e),
      n = r.frustum_map.get(e);
    n.from_view_projection_matrix(e.view_matrix, e.projection_matrix);
    let i = t.query_by_type_names(["model"], mm);
    if (!i) return o;
    for (let a of i) {
      let s = a.get("entity.id");
      if (!a.get("model.visible")) {
        o.add(s);
        continue;
      }
      let l = er(t, s).world_matrix.value;
      dm.copy(a.get("model.box")),
        dm.apply_mat4(l),
        n.intersect_box(dm) || o.add(s);
    }
    return o;
  }
  var sl = [
      new b(1, 1, -1),
      new b(1, -1, -1),
      new b(-1, -1, -1),
      new b(-1, 1, -1),
    ],
    cl = [new b(1, 1, 1), new b(1, -1, 1), new b(-1, -1, 1), new b(-1, 1, 1)];
  function hm() {
    let t = {},
      e = new Float32Array(27),
      r = 0;
    return (
      sl[0].write(e, r++ * 3),
      sl[1].write(e, r++ * 3),
      sl[2].write(e, r++ * 3),
      sl[3].write(e, r++ * 3),
      cl[0].write(e, r++ * 3),
      cl[1].write(e, r++ * 3),
      cl[2].write(e, r++ * 3),
      cl[3].write(e, r++ * 3),
      (t.attributes = [{ name: "position", stride: 3, buffer: e }]),
      (t.index = new Uint32Array([
        0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
      ])),
      t
    );
  }
  var lN = new b();
  var bm = new L(),
    ac = class {
      constructor() {
        (this.near_plane = [
          new b(0, 0, 0),
          new b(0, 0, 0),
          new b(0, 0, 0),
          new b(0, 0, 0),
        ]),
          (this.far_plane = [
            new b(0, 0, 0),
            new b(0, 0, 0),
            new b(0, 0, 0),
            new b(0, 0, 0),
          ]);
      }
      from_projection_matrix(e) {
        return (
          bm.copy(e).inverse(),
          this.near_plane[0].set(1, 1, -1),
          this.near_plane[1].set(1, -1, -1),
          this.near_plane[2].set(-1, -1, -1),
          this.near_plane[3].set(-1, 1, -1),
          this.near_plane.forEach(function (r) {
            r.apply_mat4(bm);
          }),
          this.far_plane[0].set(1, 1, 1),
          this.far_plane[1].set(1, -1, 1),
          this.far_plane[2].set(-1, -1, 1),
          this.far_plane[3].set(-1, 1, 1),
          this.far_plane.forEach(function (r) {
            r.apply_mat4(bm);
          }),
          this
        );
      }
      split(e, r) {
        for (let o = 0; o < e.length; ++o) {
          let n = r[o];
          if (o === 0)
            for (let i = 0; i < 4; ++i)
              n.near_plane[i].copy(this.near_plane[i]);
          else
            for (let i = 0; i < 4; ++i)
              b.Lerp(
                this.near_plane[i],
                this.far_plane[i],
                e[o - 1],
                n.near_plane[i],
              );
          if (o === e.length - 1)
            for (let i = 0; i < 4; ++i) n.far_plane[i].copy(this.far_plane[i]);
          else
            for (let i = 0; i < 4; ++i)
              b.Lerp(
                this.near_plane[i],
                this.far_plane[i],
                e[o],
                n.far_plane[i],
              );
        }
        return r;
      }
      to_space(e, r) {
        for (let o = 0; o < 4; ++o)
          r.near_plane[o].copy(this.near_plane[o]).apply_mat4(e),
            r.far_plane[o].copy(this.far_plane[o]).apply_mat4(e);
      }
    },
    Qx = new L(),
    _l = new L(),
    ym = new ac(),
    ic = new be(),
    Oo = new b(),
    QS = new b(1, 1, 1),
    ll = class {
      constructor(e) {
        this.camera = e;
        this.breaks = [];
        this.main_frustum = new ac();
        this.frustums = [];
        this.cascades = [];
        this.direction = new b(-0.1, -1, -0.7).normalize();
        this.location = new b();
        this.world_matrix = new L();
        this.view_matrix = new L();
        this.margin = 0;
        this.pcf_sample_radius = 6;
        this.amount = 4;
        this.shadow_map_size = 2048;
        this.uniforms = {
          cascades: new Float32Array(8),
          shadow_matrices: new Float32Array(64),
          shadow_map_size: new T(this.shadow_map_size, this.shadow_map_size),
          atmosphere_direction: this.direction,
        };
        let r = this.shadow_map_size,
          o = 0,
          n = 0;
        for (let a = 0; a < this.amount; ++a) {
          let s = {};
          (s.camera = new Ye()),
            (s.camera.mode = 1),
            (s.viewport = new x(o, n, r, r)),
            this.cascades.push(s),
            this.frustums.push(new ac()),
            (o += r),
            o > r && ((o = 0), (n += r));
        }
        for (let a = 0; a < this.breaks.length; ++a)
          (this.uniforms.cascades[a * 2] = this.breaks[a - 1] || 0),
            (this.uniforms.cascades[a * 2 + 1] = this.breaks[a]);
        (this.shadow_color_map = Ne({
          width: r * 2,
          height: r * 2,
          format: 6403,
          data_type: 5121,
          internal_format: 33321,
        })),
          (this.shadow_depth_map = Ne({
            width: r * 2,
            height: r * 2,
            format: 6402,
            data_type: 5125,
            internal_format: 36012,
            min_filter: 9728,
            mag_filter: 9728,
          })),
          (this.shadow_pass = pr({
            name: "csm shadow pass",
            width: r * 2,
            height: r * 2,
            color_targets: [{ texture: this.shadow_color_map }],
            depth_target: { texture: this.shadow_depth_map },
            color_load_action: 1,
            depth_load_action: 1,
            clear_color: new H(1, 0, 0, 0),
          })),
          this.split(),
          this.update_shadow_bounds();
        let i = ge("csm").uniform_block;
        i.shadow_map && (i.shadow_map.default_value = this.shadow_depth_map),
          i["cascade_constant.shadow_far"] &&
            (i["cascade_constant.shadow_far"].default_value = this.camera.far),
          i["cascade_constant.shadow_map_size"] &&
            (i["cascade_constant.shadow_map_size"].default_value =
              this.uniforms.shadow_map_size),
          i.shadow_matrices &&
            (i.shadow_matrices.default_value = this.uniforms.shadow_matrices),
          i.cascades && (i.cascades.default_value = this.uniforms.cascades),
          i.atmosphere_direction &&
            (i.atmosphere_direction.default_value =
              this.uniforms.atmosphere_direction),
          i.cascade_count && (i.cascade_count.default_value = this.amount);
      }
      split() {
        JS(this.amount, this.camera.near, this.camera.far, 0.8, this.breaks),
          this.main_frustum.from_projection_matrix(
            this.camera.projection_matrix,
          ),
          this.main_frustum.split(this.breaks, this.frustums);
        for (let e = 0; e < this.breaks.length; ++e)
          (this.uniforms.cascades[e * 2] = this.breaks[e - 1] || 0),
            (this.uniforms.cascades[e * 2 + 1] = this.breaks[e]);
      }
      update_shadow_bounds() {
        let e = this.camera.far;
        for (let r = 0; r < this.cascades.length; ++r) {
          let n = this.cascades[r].camera,
            i = this.frustums[r],
            a = i.far_plane[0],
            s;
          a.distance(i.far_plane[2]) > a.distance(i.near_plane[2])
            ? (s = i.far_plane[2])
            : (s = i.near_plane[2]);
          let c = s.distance(a),
            _ = e - n.near,
            l = a.z / _,
            u = 0.25 * Math.pow(l, 2) * _;
          (c += u), n.orthographics(c, c, n.near, c * 2 + n.near);
        }
      }
      update_world(e, r) {
        this.world_matrix.compose(e, r, QS),
          L.Inverse(this.world_matrix, this.view_matrix);
      }
      update() {
        (this.uniforms.camera_near = this.camera.near),
          (this.uniforms.shadow_far = this.camera.far);
        for (let e = 0; e < this.cascades.length; ++e) {
          let o = this.cascades[e].camera,
            n = this.frustums[e],
            i = o.horizontal_size / this.shadow_map_size,
            a = o.vertical_size / this.shadow_map_size;
          L.Mul(o.view_matrix, this.camera.world_matrix, Qx),
            n.to_space(Qx, ym),
            ic.reset();
          for (let s = 0; s < 4; ++s)
            ic.expand_point(ym.near_plane[s]), ic.expand_point(ym.far_plane[s]);
          Oo.copy(ic.center),
            (Oo.z = ic.max.z + this.margin),
            (Oo.x = Math.floor(Oo.x / i) * i),
            (Oo.y = Math.floor(Oo.y / a) * a),
            Oo.apply_mat4(o.world_matrix),
            o.location.copy(Oo),
            Oo.add(this.direction),
            o.look_at(Oo);
        }
        this.update_shadow_matrices();
      }
      update_shadow_matrices() {
        for (let e = 0; e < this.cascades.length; ++e) {
          let r = this.cascades[e].camera;
          _l.elements.set([
            0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0.5, 0.5, 0.5, 1,
          ]),
            _l.mul(r.projection_matrix),
            _l.mul(r.view_matrix),
            _l.write(this.uniforms.shadow_matrices, 16 * e);
        }
      }
    };
  function ZS(t, e, r) {
    let o = [],
      n = r - e;
    for (let i = 1; i < t; i++) o.push((e + (n * i) / t) / r);
    return o.push(1), o;
  }
  function YS(t, e, r) {
    let o = [];
    for (let n = 1; n < t; ++n) o.push((e * (r / e) ** (n / t)) / r);
    return o.push(1), o;
  }
  function JS(t, e, r, o, n) {
    n = n || [];
    let i = YS(t, e, r),
      a = ZS(t, e, r);
    for (let s = 1; s < t; ++s) n[s - 1] = Ue(a[s - 1], i[s - 1], o);
    return (n[t - 1] = 1), n;
  }
  var Nr = class {
    constructor() {
      this.csm_debug = !1;
    }
    async on_register() {
      let e = {
        stencil: !1,
        antialias: !1,
        pixel_ratio: Math.max(1.5, window.devicePixelRatio),
        preserve_buffer: !1,
        multi_thread_rendering: !1,
        backend: "public/src/worker/webgl.render/wgl.worker.js",
      };
      await gy("view", e);
      let r = C.CurrentDevice();
      r.encoder.set_pass(),
        await Zx(),
        r.set_size(window.innerWidth, window.innerHeight),
        (this.csm = new ll(new Ye()));
    }
  };
  var e2 = new Ce([
      "entity.id",
      "model.model",
      "model.material",
      "model.box",
      "model.visible",
      "model.cast_shadow",
      "transform.location",
      "transform.rotation",
      "transform.scale",
    ]),
    Yx = new WeakMap();
  function ul(t, e) {
    let o = C.CurrentDevice().encoder,
      n = h(Nr),
      i = n.csm;
    if (i === void 0) return;
    let a = h(J);
    i.camera.copy(e),
      i.split(),
      i.update_shadow_bounds(),
      i.update(),
      n.csm_debug && t2(e),
      o.set_pass(i.shadow_pass);
    let s = ge("depth");
    o.set_pipeline(s);
    for (let c = 0; c < i.cascades.length; ++c) {
      let _ = i.cascades[c],
        l = _.camera,
        u = t.query_by_type_names(["model"], e2),
        d = Yn(t, l);
      o.set_camera(l);
      let p = _.viewport;
      o.set_viewport(p.x, p.y, p.w, p.h);
      for (let m of u) {
        let f = m.get("entity.id"),
          y = m.get("model.visible"),
          g = m.get("model.cast_shadow");
        if (d.has(f) || !y || !g) continue;
        let v = yr(m.get("model.model"), tt.Model, a);
        if (!v || !v.draw) continue;
        let w = er(t, f),
          k = w.world_matrix.value,
          D = Je(t, f);
        k.copy(D.world_matrix), o.set_draw(v.draw, w);
      }
    }
    o.set_pass(), o.commit();
  }
  function t2(t) {
    let e = h(Nr).csm;
    if (e === void 0) return;
    let r = e.cascades,
      o = Yx.get(t);
    if (o === void 0) {
      (o = {}), (o.cascade_helpers = []), (o.break_helpers = []);
      for (let _ = 0; _ < r.length; ++_) {
        let l = r[_].camera,
          u = ce({
            primitive: hm(),
            uniforms: {
              world_matrix: new L(),
              base_color: new H().set_hex_string("eeee66"),
              inverse_projection_matrix: new L().copy(
                l.inverse_projection_matrix,
              ),
            },
            type: 1,
          });
        o.cascade_helpers.push(u);
        let d = Ue(t.near, t.far, e.uniforms.cascades[_ * 2]),
          p = Ue(t.near, t.far, e.uniforms.cascades[_ * 2 + 1]),
          m = ce({
            primitive: hm(),
            uniforms: {
              world_matrix: new L(),
              base_color: new H().set_hex_string("339933"),
              inverse_projection_matrix: new L()
                .perspective(t.vertical_fov, t.aspect, d, p)
                .inverse(),
            },
            type: 1,
          });
        o.break_helpers.push(m);
      }
      Yx.set(t, o);
    }
    let n = h(we).state,
      i = n.tab_rect,
      s = C.CurrentDevice().encoder;
    n.renderer.set_screen_pass(i, "cascade_depth");
    let c = ge("helper");
    s.set_pipeline(c);
    for (let _ = 0; _ < o.cascade_helpers.length; ++_)
      s.set_draw(o.cascade_helpers[_]), s.set_draw(o.break_helpers[_]);
    if (n.key_pressed.has(80))
      for (let _ = 0; _ < o.cascade_helpers.length; ++_) {
        let u = r[_].camera,
          d = o.cascade_helpers[_].uniforms;
        d.world_matrix.copy(u.world_matrix),
          d.inverse_projection_matrix.copy(u.inverse_projection_matrix);
        let p = o.break_helpers[_].uniforms;
        p.world_matrix.copy(t.world_matrix);
        let m = Ue(t.near, t.far, e.uniforms.cascades[_ * 2]),
          f = Ue(t.near, t.far, e.uniforms.cascades[_ * 2 + 1]);
        p.inverse_projection_matrix
          .perspective(t.vertical_fov, t.aspect, m, f)
          .inverse();
      }
  }
  var gm,
    xm,
    Jx = new Map();
  function Kx(t, e) {
    let r = Jx.get(t);
    if (r) {
      e.copy(r);
      return;
    }
    let n = C.CurrentDevice().encoder,
      i = Qt().atlas_texture;
    gm === void 0 &&
      ((gm = pr({
        width: i.width,
        height: i.height,
        color_targets: [{ texture: i }],
      })),
      (xm = ce({
        primitive: He("screen_triangle"),
        uniforms: { color_map: t },
      }))),
      n.set_pass(gm),
      n.set_viewport(e.x, e.y, e.w, e.h),
      n.set_pipeline(ge("copy")),
      (xm.uniforms.color_map = t),
      n.set_draw(xm),
      n.set_pass(),
      (r = new x().copy(e)),
      Jx.set(t, r);
  }
  var Br = class extends Yt {
    constructor(r, o, n) {
      super();
      this.radius = 0;
      this._src = "";
      this.width = 64;
      this.height = 64;
      Xe(r) ? (this.src = r) : (this.texture = r),
        (this.width = o ?? 64),
        (this.height = n ?? 64);
    }
    set src(r) {
      this._src = r;
      let n = h(Z).get_node_by_path(r);
      if (!n) {
        console.warn(`image file resource not found ${r}`);
        return;
      }
      let a = h(J).get_resource(n.resource_uuid);
      if (!a || a.type !== 5) {
        console.warn("texture resource not found.");
        return;
      }
      this.texture = a.data;
    }
    get src() {
      return this._src;
    }
    get texture() {
      return this._texture && this._texture.deref();
    }
    set texture(r) {
      if (!r) return;
      this._texture = new WeakRef(r);
      let o = this.width,
        n = this.height,
        s = Qt().atlas_packer.add(o, n, this);
      this.rect.set(s.x, s.y, s.width, s.height), Kx(r, this.rect);
    }
    rearrange(r) {
      this.rect.set(r.x, r.y, r.width, r.height);
    }
  };
  function wn(t, e, r, o = 0, n = 0) {
    let i = t.buffer.layers[o],
      a = e.id,
      s = !1;
    t.ishovering(r) &&
      o >= t.hover_layer &&
      ((t.next_hover = a), (t.next_hover_layer_index = o));
    let _ = t.active === a;
    return (
      t.hover === a && t.left_mouse_press && t.set_active(a),
      _ && t.left_mouse_release && (t.clear_active(), (s = !0)),
      ew(i, r, e.rect, n),
      s
    );
  }
  var Ar = class extends Yt {
    constructor() {
      super();
      this.start = 0;
      this.count = 0;
      this._content_height = 0;
      this.scroll_offset_y = 0;
      this.scroll_offset_x = 0;
      this.render_scroll_bar = !0;
    }
    get content_height() {
      return this._content_height;
    }
    set content_height(r) {
      r < this.rect.h && (this.scroll_offset_y = 0), (this._content_height = r);
    }
    resize(r) {
      this.rect.copy(r);
    }
    scroll_to_top() {
      this.scroll_offset_y = 0;
    }
    scroll_to_bottom() {
      this.scroll_offset_y = Math.max(0, this.content_height - this.rect.h);
    }
    compute_fixed_item_start_index_y(r) {
      return Math.floor(this.scroll_offset_y / r);
    }
    compute_fixed_item_start_offset_y(r) {
      return this.scroll_offset_y % r;
    }
  };
  function Vo(t, e, r, o = 0, n = 0) {
    let i = e.content_height,
      a = h(F).theme,
      s = e.id,
      c = t.mouse_wheel_raw,
      _ = Math.max(0, i - r.h),
      l = t.ishovering(r) && o >= t.hover_layer,
      u = S(x),
      d = S(de),
      p = S(T),
      m = S(T);
    if (
      (l &&
        ((e.scroll_offset_y = Math.max(0, e.scroll_offset_y + c)),
        (t.mouse_wheel_raw = 0)),
      (e.scroll_offset_y = Math.min(_, e.scroll_offset_y)),
      r.equals(e.rect) || e.resize(r),
      e.render_scroll_bar && (u.copy(r), i > r.h))
    ) {
      let f = t.active === s || t.hover === s,
        y = (r.h / i) * r.h;
      if (
        ((u.h = y),
        (u.w = f ? 5 : 3),
        (u.y = r.y + (e.scroll_offset_y / i) * r.h),
        (u.x = r.x + r.w - (f ? 7 : 6)),
        u.shrink(3, 0),
        f
          ? (d.color.copy(a.scroll_bar.hover_color),
            q(t.buffer, a.scroll_bar, u, 2, n))
          : (d.color.copy(a.scroll_bar.color),
            q(t.buffer, a.scroll_bar, u, 1, n)),
        t.ishovering(u) &&
          t.next_hover_layer_index <= o &&
          ((t.next_hover_layer_index = o), (t.next_hover = s)),
        t.hover === s &&
          t.left_mouse_press &&
          (t.set_active(s),
          p.copy(t.mouse_location),
          m.set(e.scroll_offset_x, e.scroll_offset_y)),
        t.active === s)
      ) {
        let g = e.content_height - r.h,
          v = (t.mouse_location.y - p.y) / (r.h - y);
        e.scroll_offset_y = Q(v * g + m.y, 0, g);
      }
    }
    t.active === s && t.left_mouse_release && t.clear_active(),
      R(u),
      R(d),
      R(p),
      R(m);
  }
  var sc,
    pl,
    dl,
    Jn,
    ct = new b(0, 0, 0),
    tr = new $(0, 0, 0, 1),
    jo = new b(1, 1, 1),
    eo = new L(),
    gt = new H(),
    Ma = new b(),
    wm = new $(),
    vm = new b(),
    tw = new b(1, 0, 0),
    cc = new b(0, 1, 0),
    Im = new b(0, 0, 1),
    rw = new $(),
    mt = new be(),
    kr = new d_(),
    Ca = new T(),
    _t = new b(),
    ow = new b(),
    r2 = 60,
    to = new b(),
    rr = new vi(),
    vn = new vi(),
    nw = new WeakMap();
  function Xo(t) {
    let e = nw.get(t);
    return (
      e === void 0 &&
        ((e = {}),
        (e.edit_location = new b()),
        (e.edit_rotation = new $()),
        (e.edit_scale = new b(1, 1, 1)),
        (e.gizmo_hover = !1),
        (e.gizmo_control = 0),
        (e.gizmo_start_point = new b()),
        (e.gizmo_box = new be()),
        nw.set(t, e)),
      e
    );
  }
  function Rm(t, e) {
    let r = Xo(t);
    if (r === void 0 || e.size <= 0) return;
    let o = h(ee).data_center,
      n = r.gizmo_box;
    n.reset();
    for (let i of e) {
      let a = Je(o, i);
      o.is_entity_has_type(i, "model")
        ? (o.get_property(i, "model.box", mt),
          mt.apply_mat4(a.world_matrix),
          n.expand_box(mt))
        : n.expand_point(a.world_location);
    }
  }
  function iw(t) {
    return Xo(t).gizmo_box;
  }
  function Sm(t, e) {
    let r = Xo(t);
    r.gizmo_control = e;
  }
  function Fm(t, e) {
    Xo(t).edit_location.copy(e);
  }
  function $o(t) {
    return Xo(t).edit_location;
  }
  function Am(t, e) {
    Xo(t).edit_rotation.copy(e);
  }
  function qo(t) {
    return Xo(t).edit_rotation;
  }
  function km(t, e) {
    Xo(t).edit_scale.copy(e);
  }
  function aw(t) {
    return Xo(t).edit_scale;
  }
  function sw(t) {
    let e = new Set(["world_matrix", "base_color"]);
    sc === void 0 &&
      ((sc = ce({
        primitive: He("arrow"),
        uniforms: { world_matrix: eo, base_color: gt },
        force_update: e,
      })),
      (pl = ce({
        primitive: He("orbit"),
        uniforms: { world_matrix: eo, base_color: gt },
        force_update: e,
      })),
      (dl = ce({
        primitive: He("box"),
        uniforms: { world_matrix: eo, base_color: gt },
        force_update: e,
      })),
      (Jn = ge("gizmo")));
    let r = t.tab,
      o = Xo(r);
    o.gizmo_hover = !1;
    let n = vo(r);
    if (n.size <= 0) return;
    let i = ml(r),
      a = cw(r),
      c = C.CurrentDevice().encoder,
      _ = Wr(r);
    if (!_) return;
    let l = t.tab_rect;
    Ca.set(
      ((t.mouse_location.x - t.tab_rect.x) / t.tab_rect.w) * 2 - 1,
      -((t.mouse_location.y - t.tab_rect.y) / t.tab_rect.h) * 2 + 1,
    ),
      (Ca.x = Q(Ca.x, -1, 1)),
      (Ca.y = Q(Ca.y, -1, 1)),
      kr.set_from_camera(_, Ca);
    let u = o.gizmo_box;
    ct.copy(u.center);
    let d = _t.copy(_.location).distance(ct),
      p = 1;
    _.mode === 0 && (p = (Math.tan(_.vertical_fov * cr * 0.5) * d) / r2),
      ct.copy(u.center),
      jo.set(p, p, p);
    let m = h(F).theme;
    if ((t.renderer.set_screen_pass(l, "gizmo"), i !== 3)) {
      if (
        (a & 1 &&
          (mt.min.set(-1, -1, -1).mul(p),
          mt.max.set(1, 17, 1).mul(p),
          _t.copy(ct),
          (_t.y += p * 8.5),
          mt.set_center(_t),
          tr.set(0, 0, 0, 1),
          eo.compose(ct, tr, jo),
          gt.copy(m.axis_input_y.outline_color),
          kr.ray.intersect_box(mt) !== null &&
            (gt.tone(1.4), (o.gizmo_hover = !0), (o.gizmo_control = 2)),
          c.set_pipeline(Jn),
          c.set_draw(sc),
          tr.set(0, 0, 0, 1),
          mt.min.set(-1, -1, -1).mul(p),
          mt.max.set(17, 1, 1).mul(p),
          _t.copy(ct),
          (_t.x += p * 8.5),
          mt.set_center(_t),
          tr.from_unit_vectors(cc, tw),
          eo.compose(ct, tr, jo),
          gt.copy(m.axis_input_x.outline_color),
          kr.ray.intersect_box(mt) !== null &&
            (gt.tone(1.8), (o.gizmo_hover = !0), (o.gizmo_control = 1)),
          c.set_draw(sc),
          mt.min.set(-1, -1, -1).mul(p),
          mt.max.set(1, 1, 17).mul(p),
          _t.copy(ct),
          (_t.z += p * 8.5),
          mt.set_center(_t),
          tr.from_unit_vectors(cc, Im),
          eo.compose(ct, tr, jo),
          gt.copy(m.axis_input_z.outline_color),
          kr.ray.intersect_box(mt) !== null &&
            (gt.tone(1.4), (o.gizmo_hover = !0), (o.gizmo_control = 4)),
          c.set_draw(sc)),
        a & 2)
      ) {
        let D = u.center;
        if (
          (tr.from_axis_angle(cc, Math.PI / 2),
          eo.compose(ct, tr, jo),
          gt.copy(m.axis_input_y.outline_color),
          vn.normal.set(0, 1, 0),
          vn.set_from_point(D),
          kr.ray.intersect_plane(vn, _t))
        ) {
          let G = _t.distance(D) / p;
          _t.x > D.x &&
            _t.z > D.z &&
            G > 10 &&
            G < 13 &&
            (gt.tone(1.4), (o.gizmo_hover = !0), (o.gizmo_control = 16));
        }
        if (
          (c.set_pipeline(Jn),
          c.set_draw(pl),
          tr.from_unit_vectors(cc, tw),
          eo.compose(ct, tr, jo),
          gt.copy(m.axis_input_x.outline_color),
          vn.normal.set(1, 0, 0),
          vn.set_from_point(D),
          kr.ray.intersect_plane(vn, _t))
        ) {
          let G = _t.distance(D) / p;
          _t.y > D.y &&
            _t.z > D.z &&
            G > 10 &&
            G < 13 &&
            (gt.tone(1.8), (o.gizmo_hover = !0), (o.gizmo_control = 8));
        }
        if (
          (c.set_pipeline(Jn),
          c.set_draw(pl),
          rw.from_axis_angle(Im, Math.PI),
          tr.from_unit_vectors(cc, Im).premul(rw),
          eo.compose(ct, tr, jo),
          gt.copy(m.axis_input_z.outline_color),
          vn.normal.set(0, 0, 1),
          vn.set_from_point(D),
          kr.ray.intersect_plane(vn, _t))
        ) {
          let G = _t.distance(D) / p;
          _t.x > D.x &&
            _t.y > D.y &&
            G > 10 &&
            G < 13 &&
            (gt.tone(1.4), (o.gizmo_hover = !0), (o.gizmo_control = 32));
        }
        c.set_pipeline(Jn), c.set_draw(pl);
      }
      a & 4 &&
        (Ma.copy(ct),
        mt.min.set(-1, -1, -1).mul(p),
        mt.max.set(1, 1, 1).mul(p),
        (ct.y += 17 * p),
        mt.set_center(ct),
        eo.compose(ct, tr, jo),
        gt.copy(m.axis_input_y.outline_color),
        kr.ray.intersect_box(mt) !== null &&
          (gt.tone(1.4), (o.gizmo_hover = !0), (o.gizmo_control = 128)),
        c.set_pipeline(Jn),
        c.set_draw(dl),
        ct.copy(Ma),
        (ct.x += 17 * p),
        mt.set_center(ct),
        eo.compose(ct, tr, jo),
        gt.copy(m.axis_input_x.outline_color),
        kr.ray.intersect_box(mt) !== null &&
          (gt.tone(1.8), (o.gizmo_hover = !0), (o.gizmo_control = 64)),
        c.set_pipeline(Jn),
        c.set_draw(dl),
        ct.copy(Ma),
        (ct.z += 17 * p),
        mt.set_center(ct),
        eo.compose(ct, tr, jo),
        gt.copy(m.axis_input_z.outline_color),
        kr.ray.intersect_box(mt) !== null &&
          (gt.tone(1.4), (o.gizmo_hover = !0), (o.gizmo_control = 256)),
        c.set_pipeline(Jn),
        c.set_draw(dl));
    }
    let f = o.gizmo_control;
    o.gizmo_hover &&
      t.left_mouse_press &&
      i === 0 &&
      (Tm(r, 3),
      f & 7
        ? f & 2
          ? f === 2
            ? (rr.normal.copy(kr.ray.direction).mul(-1),
              (rr.normal.y = 0),
              rr.normal.normalize())
            : f & 0
              ? rr.normal.set(0, 0, 1)
              : f & 0 && rr.normal.set(1, 0, 0)
          : rr.normal.set(0, 1, 0)
        : f & 56
          ? f & 8
            ? rr.normal.set(1, 0, 0)
            : f & 16
              ? rr.normal.set(0, 1, 0)
              : f & 32 && rr.normal.set(0, 0, 1)
          : f & 448 &&
            (f & 128
              ? f === 128 &&
                (rr.normal.copy(kr.ray.direction).mul(-1),
                (rr.normal.y = 0),
                rr.normal.normalize())
              : rr.normal.set(0, 1, 0)),
      rr.set_from_point(u.center),
      kr.ray.intersect_plane(rr, o.gizmo_start_point));
    let {
      edit_location: y,
      edit_rotation: g,
      edit_scale: v,
      gizmo_control: w,
      gizmo_start_point: k,
    } = o;
    if (i === 3) {
      kr.ray.intersect_plane(rr, to);
      let D = u.center;
      f & 7
        ? ((to.x = f & 1 ? to.x : k.x),
          (to.y = f & 2 ? to.y : k.y),
          (to.z = f & 4 ? to.z : k.z),
          y.copy(to).sub(k))
        : f & 56
          ? (ow.copy(o.gizmo_start_point).sub(D).normalize(),
            _t.copy(to).sub(D).normalize(),
            o.edit_rotation.from_unit_vectors(ow, _t))
          : f & 448 &&
            (f & 64
              ? (v.x = (to.x - D.x) / (k.x - D.x))
              : f & 128
                ? (v.y = (to.y - D.y) / (k.y - D.y))
                : f & 256 && (v.z = (to.z - D.z) / (k.z - D.z)));
      for (let G of n) {
        let U = h(ee).data_center;
        Ft(U, G);
      }
    }
    if (i === 3 && t.left_mouse_release) {
      Tm(r, 0);
      let D = h(ee).data_center;
      for (let G of n) {
        let U = D.get_property(G, "transform.parent");
        if (!n.has(U)) {
          if (w & 7) {
            if (y.x === 0 && y.y === 0 && y.z === 0) return;
            D.get_property(G, "transform.location", Ma),
              Ma.add(y),
              D.set_property(G, "transform.location", Ma),
              y.set(0, 0, 0);
          } else if (w & 56) {
            if (g.x === 0 && g.y === 0 && g.z === 0 && g.w === 1) return;
            D.get_property(G, "transform.rotation", wm),
              wm.premul(g),
              D.set_property(G, "transform.rotation", wm),
              g.set(0, 0, 0, 1);
          } else if (w & 448) {
            if (y.x === 1 && y.y === 1 && y.z === 1) return;
            D.get_property(G, "transform.scale", vm),
              vm.mul_v(v),
              D.set_property(G, "transform.scale", vm),
              v.set(1, 1, 1);
          }
        }
      }
      Rm(t.tab, n), (o.gizmo_control = 0);
    }
  }
  var _w = new WeakMap();
  function bl(t) {
    let e = _w.get(t);
    return (
      e === void 0 &&
        ((e = {}),
        (e.active_entities = new Set()),
        (e.entity_index_map = []),
        (e.entity_buffer = new Float32Array(4)),
        (e.focus_target = new b()),
        (e.focusing = !1),
        _w.set(t, e)),
      e
    );
  }
  function To(t, e, r) {
    let o = bl(e),
      n = o.active_entities,
      i = h(ee).data_center;
    if (r.length <= 0 || r[0] === void 0) {
      n.clear(), dy(t.renderer.entity_pass);
      return;
    }
    t.key_pressed.has(16) || n.clear();
    for (let a = 0; a < r.length; ++a) {
      let s = r[a];
      n.has(s) ? zy(i, s, n) : Ly(i, s, n);
    }
    Rm(e, o.active_entities);
  }
  function vo(t) {
    return bl(t).active_entities;
  }
  var i2 = new Ce([
      "entity.id",
      "model.model",
      "model.material",
      "model.visible",
      "transform.location",
      "transform.rotation",
      "transform.scale",
    ]),
    a2 = new Ce([
      "entity.id",
      "transform.location",
      "transform.rotation",
      "camera.mode",
    ]),
    s2 = new Ce([
      "entity.id",
      "transform.location",
      "transform.rotation",
      "light.direction",
      "light.type",
    ]),
    Kn = new b(),
    La = new $(),
    fl = new b(),
    Pm = new Rr(),
    _c,
    hl;
  function lw(t, e = !1) {
    let r = C.CurrentDevice(),
      o = r.encoder,
      n = t.tab_rect,
      i = h(ee).data_center,
      a = h(J),
      s = t.tab,
      c = bl(s),
      _ = c.entity_index_map,
      l = c.entity_buffer,
      u = Wr(s);
    if (u === void 0) return;
    let d = c.active_entities,
      p = $o(s),
      m = qo(s);
    _c === void 0 &&
      ((_c = ce({
        primitive: He("camera"),
        uniforms: { world_matrix: new L(), color_map: We("white") },
      })),
      (hl = ce({
        primitive: He("atmosphere"),
        uniforms: { world_matrix: new L(), color_map: We("white") },
      }))),
      t.renderer.set_entity_pass(n, "render entity pass");
    let f = 1,
      y = i.query_by_type_names(["model"], i2);
    o.set_pipeline(ge("entity"));
    let g = Yn(i, u);
    if (y === void 0) return;
    for (let G of y) {
      let U = G.get("entity.id"),
        Y = G.get("model.visible");
      if (g.has(U) || !Y) continue;
      let le = yr(G.get("model.model"), tt.Model, a);
      if (!le || !le.draw) continue;
      let X = er(i, U);
      (_[f] = U), (le.draw.uniforms.entity = f++), o.set_draw(le.draw, X);
    }
    if (
      (Pm.from_view_projection_matrix(u.view_matrix, u.projection_matrix),
      (y = i.query_by_type_names(["camera"], a2)),
      y !== void 0)
    )
      for (let G of y) {
        Kn.copy(G.get("transform.location")),
          La.copy(G.get("transform.rotation")),
          fl.set(6, 6, 6);
        let U = G.get("entity.id");
        d.has(U) && (Kn.add(p), La.premul(m)),
          Pm.contains_point(Kn) &&
            ((_[f] = U),
            _c.uniforms.world_matrix.compose(Kn, La, fl),
            (_c.uniforms.entity = f++),
            o.set_draw(_c));
      }
    if (((y = i.query_by_type_names(["light"], s2)), y !== void 0))
      for (let G of y) {
        let U = G.get("light.type");
        Kn.copy(G.get("transform.location")),
          La.copy(G.get("transform.rotation")),
          fl.set(12, 12, 12);
        let Y = G.get("entity.id");
        d.has(Y) && (Kn.add(p), La.premul(m)),
          U === 2 &&
            Pm.contains_point(Kn) &&
            ((_[f] = Y),
            hl.uniforms.world_matrix.compose(Kn, La, fl),
            (hl.uniforms.entity = f++),
            o.set_draw(hl));
      }
    let v = t.mouse_location.x,
      w = r.screen_height - t.mouse_location.y;
    if (
      (x_(v, w, 1, 1, 6403, 5126, l),
      e &&
        t.hover === -1 &&
        t.active === -1 &&
        t.left_mouse_release &&
        t.mouse_offset.length < 8)
    )
      if (l[0] > 0) {
        let G = _[l[0]];
        To(t, t.tab, [G]), console.log(`<EditSelect> select entity ${G}`);
      } else d.clear();
    o.set_pass(),
      o.commit(),
      t.key_press.has(70) &&
        d.size > 0 &&
        (t.key_press.delete(70), c2(t), console.log("start focusing")),
      c.focusing &&
        (c.focus_target.distance(u.location) < 0.001
          ? (c.focusing = !1)
          : (u.location.lerp(c.focus_target, 0.3),
            u.update_world_matrix(),
            u.update_view_matrix(),
            uw(s).set_camera(u),
            (t.needs_update = !0)));
  }
  function c2(t) {
    let e = t.tab,
      r = iw(e),
      o = Wr(e),
      n = bl(e),
      i = n.focus_target;
    i.set(0, 0, 1).apply_quaternion(o.rotation);
    let a = o.fit_distance(r);
    i.mul(a).add(r.center), (n.focusing = !0);
  }
  var Gm = 160,
    pw = 24,
    Em = 14,
    ei = new x(),
    za = new x(),
    Dm = new WeakMap();
  function dw(t, e) {
    let r = h(F).theme;
    ei.copy(e), q(t.buffer, r.button_state, ei, 4);
    let o = t.buffer.write_clip(ei),
      n = Dm.get(t.tab);
    n === void 0 &&
      ((n = {}),
      (n.hierarchy_changed = !0),
      (n.entity_btn = {}),
      (n.fold_btn = {}),
      (n.fold_map = {}),
      (n.scroll_view = new Ar()),
      Dm.set(t.tab, n),
      B.on(In.ProjectLoaded, () => {
        n.hierarchy_changed = !0;
      }));
    let i = h(ee).data_center;
    ei.shrink(2), (ei.h = pw), za.copy(ei);
    let a = _d(i);
    if (a == null) return;
    let s = mw(t, a.root, 0, o);
    (n.scroll_view.content_height = s * pw), Vo(t, n.scroll_view, e);
  }
  var ro = new x();
  function mw(t, e, r = 0, o = 0) {
    let n = vo(t.tab),
      i = Dm.get(t.tab),
      a = h(F).theme,
      s = h(ee).data_center,
      c = i.entity_btn[e.entity];
    if (c === void 0) {
      (c = new P(e.name)),
        (c.label.alignment = 33),
        (c.label.padding.w = 4),
        (c.drag_end = () => (console.log(e.entity), e.entity)),
        (c.drop = (f) => {
          let y = h(ee).data_center;
          y.set_property(f, "transform.parent", e.entity),
            G_(y, f, e.entity),
            (i.hierarchy_changed = !0);
        }),
        (i.entity_btn[e.entity] = c);
      let m = new P();
      i.fold_btn[e.entity] = m;
    }
    c.label.text !== e.name && (c.label.text = e.name),
      n.has(e.entity) &&
        (ei.copy(za), ei.shrink(2), Ee(t.buffer, a.white, za, 2, o)),
      ro.copy(za),
      ro.shrink(2, 0),
      (ro.y -= i.scroll_view.scroll_offset_y),
      (ro.x += (r + 1) * Em),
      (ro.w -= (r + 1) * Em);
    let _ = _d(s);
    (e === _.root ? E : V_)(t, c, a.button_file, ro, 0, o) &&
      (e.entity !== 0 && To(t, t.tab, [e.entity]),
      console.log(`outline select entity ${e.entity}`)),
      (ro.x -= Em + 3),
      (ro.w = ro.h),
      ro.shrink(2, 4);
    let u = i.fold_btn[e.entity];
    if (
      (E(t, u, a.button_file, ro, 0, o) && (e.folded = !e.folded),
      (e.folded ? yl : gl)(t.buffer, ro),
      (za.y += za.h),
      e.folded)
    )
      return 1;
    let p = 1;
    for (let m = 0; m < e.children.length; ++m)
      p += mw(t, e.children[m], r + 1, o);
    return p;
  }
  var _2,
    l2,
    Na,
    xl = class {
      constructor(e) {
        this.camera = e;
        this.location = new b();
        this.target = new b();
        this.rotation = new $();
        this.spherical = new Ot();
        this.lerp_factor = 0.8;
        this.lerp_spherical = new Ot();
        this.velocity = new b();
        this.velocity_dissipation = 0.55;
        this.move_speed = 500;
        this.rotate_speed = Math.PI;
        this.matrix = new L();
        this.max_polar_angle = Math.PI - 0.01;
        this.min_polar_angle = 0.01;
        Na === void 0 &&
          ((Na = new b()), (_2 = new $()), (l2 = new b(0, 1, 0))),
          e.look_at(Na.set(0, 0, 0)),
          this.set_camera(e);
      }
      set_camera(e) {
        this.location.copy(e.location),
          this.rotation.copy(e.rotation),
          this.spherical.from_float3(
            this.target
              .set(0, 0, -1)
              .apply_quaternion(this.rotation)
              .normalize(),
          ),
          this.lerp_spherical.copy(this.spherical);
      }
      rotate_horizontal(e) {
        this.spherical.phi += e * this.rotate_speed;
      }
      rotate_vertical(e) {
        this.spherical.theta = Q(
          this.spherical.theta + e * this.rotate_speed,
          this.min_polar_angle,
          this.max_polar_angle,
        );
      }
      move(e) {
        Na.set(e.x, 0, e.y)
          .apply_quaternion(this.rotation)
          .mul(this.move_speed),
          this.velocity.add(Na);
      }
      update(e) {
        return (
          this.lerp_spherical.lerp(this.spherical, this.lerp_factor),
          this.target.from_spherical(this.lerp_spherical).add(this.location),
          this.matrix.look_at(this.location, this.target),
          this.rotation.from_mat4(this.matrix),
          this.location.add(Na.copy(this.velocity).mul(e)),
          this.velocity.mul(1 - Math.min(1, this.velocity_dissipation)),
          this.camera.location.copy(this.location),
          this.camera.rotation.copy(this.rotation),
          this.camera.update_world_matrix(),
          this.camera.update_view_matrix(),
          this.velocity.length > wi
        );
      }
    };
  var wl;
  function fw(t) {
    wl || (wl = { clear_color: { value: new M() } }),
      wl.clear_color.value.copy(t);
    let e = ge("clear"),
      r = Ro("screen"),
      o = C.CurrentDevice().encoder;
    o.set_pipeline(e), o.set_draw(r, wl);
  }
  var hw = new WeakMap();
  function bw(t) {
    let e = hw.get(t);
    return (
      e === void 0 && ((e = {}), (e.clear_color = new M()), hw.set(t, e)), e
    );
  }
  function yw(t, e) {
    bw(t).clear_color.copy(e);
  }
  function gw(t) {
    let e = t.tab,
      r = bw(e),
      o = t.tab_rect,
      n = C.CurrentDevice().encoder;
    t.renderer.set_screen_pass(o, "edit view clear"), fw(r.clear_color);
  }
  var vl,
    Um,
    Mm,
    Cm = new Rr(),
    Tn = new b(),
    ti = new $(),
    Il = new b(),
    xw = new b(),
    u2 = new Ce([
      "entity.id",
      "transform.location",
      "transform.rotation",
      "camera.enabled",
      "camera.clear_color",
    ]),
    p2 = new Ce([
      "entity.id",
      "transform.location",
      "transform.rotation",
      "light.type",
    ]),
    d2 = "548ac2",
    m2 = "548ac2";
  function ww(t) {
    let r = C.CurrentDevice().encoder,
      o = t.tab_rect,
      n = t.tab;
    vl === void 0 &&
      ((vl = ce({
        primitive: He("camera"),
        uniforms: {
          world_matrix: new L(),
          color_map: We("white"),
          base_color: new H().set_hex_string(d2),
        },
      })),
      (Um = ce({
        primitive: He("atmosphere"),
        uniforms: {
          world_matrix: new L(),
          color_map: We("white"),
          base_color: new H().set_hex_string(m2),
        },
      })),
      (Mm = ge("model_icon")));
    let i = Wr(n);
    r.set_camera(i),
      Cm.from_view_projection_matrix(i.view_matrix, i.projection_matrix);
    let a = h(ee);
    if (a === void 0) return;
    let s = a.data_center,
      c = vo(n),
      _ = $o(n),
      l = qo(n);
    t.renderer.set_screen_pass(o, "icon model");
    let u = s.query_by_type_names(["camera"], u2);
    if (u !== void 0) {
      r.set_pipeline(Mm);
      for (let p of u) {
        if (!p.get("camera.enabled")) continue;
        Tn.copy(p.get("transform.location")),
          ti.copy(p.get("transform.rotation")),
          Il.set(6, 6, 6);
        let m = p.get("entity.id");
        c.has(m) && (Tn.add(_), ti.premul(l)),
          Cm.contains_point(Tn) &&
            (vl.uniforms.world_matrix.compose(Tn, ti, Il),
            r.set_draw(vl, void 0, "camera_icon")),
          yw(n, p.get("camera.clear_color"));
      }
    }
    let d = h(Nr).csm;
    if (((u = s.query_by_type_names(["light"], p2)), u !== void 0)) {
      r.set_pipeline(Mm);
      for (let p of u) {
        let m = p.get("light.type");
        Tn.copy(p.get("transform.location")),
          ti.copy(p.get("transform.rotation")),
          Il.set(12, 12, 12);
        let f = p.get("entity.id");
        c.has(f) && (Tn.add(_), ti.premul(l)),
          xw.set(0, 1, 0).apply_quaternion(ti).normalize(),
          d.direction.copy(xw).mul(-1),
          d.update_world(Tn, ti),
          m === 2 &&
            Cm.contains_point(Tn) &&
            (Um.uniforms.world_matrix.compose(Tn, ti, Il),
            r.set_draw(Um, void 0, "atmosphere_icon"));
      }
    }
    r.set_pass();
  }
  var lc = new b(),
    Tl = new $(),
    Rl = new b(),
    vw = new Rr(),
    uc,
    Sl,
    Lm,
    Fl;
  function Iw(t, e) {
    if (e.size <= 0) return;
    let r = t.tab_rect,
      o = C.CurrentDevice(),
      n = o.encoder,
      i = h(ee).data_center,
      a = h(J),
      s = t.tab,
      c = Wr(s);
    if (c === void 0) return;
    let _ = $o(s),
      l = qo(s);
    uc === void 0 &&
      ((uc = ce({
        primitive: He("camera"),
        uniforms: {
          world_matrix: new L(),
          color_map: We("white"),
          base_color: new H().set_hex_string("6699ee"),
        },
      })),
      (Sl = ce({
        primitive: He("atmosphere"),
        uniforms: {
          world_matrix: new L(),
          color_map: We("white"),
          base_color: new H().set_hex_string("6699ee"),
        },
      }))),
      n.set_camera(c),
      n.set_pass(t.renderer.entity_pass),
      n.set_viewport(r.x, r.y, r.w, r.h),
      n.clear(t.renderer.entity_clear_action),
      n.set_pipeline(ge("entity"));
    let u = 1;
    for (let d of e)
      if (d !== void 0)
        if (i.is_entity_has_type(d, "model")) {
          let p = yr(i.get_property(d, "model.model"), tt.Model, a);
          if (!p || !p.draw) continue;
          let m = er(i, d);
          (p.draw.uniforms.entity = u++), n.set_draw(p.draw, m);
        } else
          vw.from_view_projection_matrix(c.view_matrix, c.projection_matrix),
            i.get_property(d, "transform.location", lc),
            i.get_property(d, "transform.rotation", Tl),
            lc.add(_),
            Tl.premul(l),
            vw.contains_point(lc) &&
              (i.is_entity_has_type(d, "camera")
                ? (Rl.set(6, 6, 6),
                  uc.uniforms.world_matrix.compose(lc, Tl, Rl),
                  (uc.uniforms.entity = u++),
                  n.set_draw(uc))
                : i.is_entity_has_type(d, "light") &&
                  (Rl.set(12, 12, 12),
                  Sl.uniforms.world_matrix.compose(lc, Tl, Rl),
                  (Sl.uniforms.entity = u++),
                  n.set_draw(Sl)));
    t.renderer.set_screen_pass(r, "outline"),
      Lm === void 0 &&
        ((Lm = ge("outline")),
        (Fl = ce({
          primitive: He("screen_triangle"),
          uniforms: { uv_transform: new M() },
        }))),
      (Fl.uniforms.map = t.renderer.entity_texture),
      Fl.uniforms.uv_transform.set(
        r.x / o.screen_width,
        r.y / o.screen_height,
        r.w / o.screen_width,
        r.h / o.screen_height,
      ),
      n.set_pipeline(Lm),
      n.set_draw(Fl),
      n.set_pass(),
      n.commit();
  }
  function Tw(t) {
    return {};
  }
  async function Rw(t, e) {
    let r = t.data;
    return r;
  }
  function Sw() {
    let t = {};
    return (t.properties = new Map()), (t.texture = new Map()), t;
  }
  function Ba(t) {
    let e = Ps(t.shader);
    return e && e.data.pipeline ? e.data.pipeline : t.pipeline;
  }
  var j5 = new Uint8Array([255, 255, 255, 255]);
  var b2 = new b(),
    y2 = new $(),
    g2 = new b(),
    Al = new be(),
    zm = new be(),
    x2 = new Rr(),
    w2 = new Ce([
      "entity.id",
      "model.model",
      "model.material",
      "model.box",
      "transform.location",
      "transform.rotation",
      "transform.scale",
    ]),
    kl = class {
      constructor() {
        this.rect = new x(10, 10, 320, 240);
        this.id = Ie(this);
      }
    },
    Fw = new T(),
    Ui = new T(),
    Aw = new Map(),
    oo = new x(),
    it = new x();
  function kw(t, e, r) {
    let o = C.CurrentDevice(),
      n = o.encoder,
      i = t.tab,
      a = t.tab_rect,
      s = r.rect;
    it.copy(s), (it.x += a.x), (it.y += a.y);
    let _ = h(ee).data_center,
      l = h(J),
      u = h(F).theme,
      d = $o(i),
      p = qo(i),
      m = Aw.get(e);
    m === void 0 &&
      _.get_property(e, "camera.mode") === 0 &&
      ((m = new Ye()), Aw.set(e, m)),
      _.get_property(e, "camera.mode") === 0 &&
        ((m.aspect = s.w / s.h),
        _.get_property(e, "transform.location", m.location),
        _.get_property(e, "transform.rotation", m.rotation),
        m.location.add(d),
        m.rotation.premul(p),
        m.update_world_matrix(),
        m.update_view_matrix(),
        m.update_projection_matrix()),
      t.next_hover_layer_index <= 0 &&
        it.contains(t.mouse_location) &&
        (t.next_hover = r.id),
      t.hover === r.id &&
        t.left_mouse_press &&
        (t.active === -1 && Fw.copy(t.mouse_location), t.set_active(r.id)),
      t.active === r.id
        ? (Ui.copy(t.mouse_location).sub(Fw),
          Math.abs(Ui.x) + Math.abs(Ui.y) > 10 &&
            ((it.x = Q(it.x + Ui.x, 10 + a.x, a.x + a.w - it.w - 10)),
            (it.y = Q(it.y + Ui.y, 10 + a.y, a.y + a.h - it.h - 10))))
        : ((it.x = Q(it.x, 10 + a.x, a.x + a.w - it.w - 10)),
          (it.y = Q(it.y, 10 + a.y, a.y + a.h - it.h - 10))),
      t.active === r.id &&
        t.left_mouse_release &&
        (t.clear_active(),
        (s.x = Q(s.x + Ui.x, 10, a.w - s.w - 10)),
        (s.y = Q(s.y + Ui.y, 10, a.h - s.h - 10))),
      n.set_pass(t.renderer.screen_pass);
    let y = o.pixel_ratio;
    oo.set(it.x * y, o.height - (it.y + it.h) * y, it.w * y, it.h * y),
      oo.shrink(1),
      n.set_scissor(oo.x, oo.y, oo.w, oo.h),
      n.clear(),
      n.set_scissor(),
      n.set_viewport(oo.x, oo.y, oo.w, oo.h),
      m.resize(s.w, s.h),
      Jb(m, zm),
      n.set_camera(m),
      oo.set(it.x, it.y, it.w, it.h),
      Ee(t.buffer, u.tab, oo, 3);
    let g = _.query_by_type_names(["model"], w2);
    if (g !== void 0) {
      zm.reset();
      for (let v of g) {
        let w = v.get("entity.id"),
          k = yr(v.get("model.model"), tt.Model, l),
          D = yr(v.get("model.material"), tt.Material, l);
        if (!k || !D) continue;
        let G = Ba(D);
        if (!k.draw || !G) continue;
        Al.copy(v.get("model.box")),
          b2.copy(v.get("transform.location")),
          y2.copy(v.get("transform.rotation")),
          g2.copy(v.get("transform.scale")),
          n.set_pipeline(G);
        let U = er(_, w),
          Y = U.world_matrix.value;
        Al.apply_mat4(Y),
          x2.intersect_box(Al) && (zm.expand_box(Al), n.set_draw(k.draw, U));
      }
      n.set_pass();
    }
  }
  var Nm = new be(),
    Pw = new be(),
    v2 = new Ce([
      "entity.id",
      "entity.name",
      "model.model",
      "model.material",
      "model.box",
      "model.visible",
      "transform.location",
      "transform.rotation",
      "transform.scale",
    ]);
  function Ew(t) {
    let r = C.CurrentDevice().encoder,
      o = t.tab_rect,
      n = t.tab,
      i = Wr(n),
      a = h(ee);
    if (a === void 0) return;
    let s = a.data_center,
      c = h(J);
    t.renderer.set_screen_pass(o, "render model");
    let _ = s.query_by_type_names(["model"], v2);
    if (_ === void 0) return;
    let l = Yn(s, i);
    Pw.reset(), i.resize(o.w, o.h), r.set_camera(i);
    for (let u of _) {
      let d = u.get("entity.id"),
        p = u.get("entity.name"),
        m = u.get("model.visible");
      if (l.has(d) || !m) continue;
      let f = yr(u.get("model.model"), tt.Model, c),
        y = yr(u.get("model.material"), tt.Material, c);
      if (!f || !y) continue;
      let g = Ba(y);
      if (!f.draw || !g) continue;
      Nm.copy(u.get("model.box")), r.set_pipeline(g);
      let v = er(s, d),
        w = v.world_matrix.value,
        k = Je(s, d);
      w.copy(k.world_matrix),
        Nm.apply_mat4(w),
        v.normal_matrix.value.normal_matrix_from_mat4(w),
        Pw.expand_box(Nm),
        r.set_draw(f.draw, v, p);
    }
    r.set_pass();
  }
  function Gw(t) {
    T2(t);
  }
  var pc,
    Dw,
    Pl,
    I2 = new b(6, 6, 6),
    Bm = new L();
  function T2(t) {
    let e = h(Hn);
    if (!e) return;
    let r = t.tab_rect,
      o = C.CurrentDevice().encoder,
      n = Wr(t.tab);
    pc === void 0 &&
      ((pc = ce({
        primitive: He("camera"),
        uniforms: {
          world_matrix: new L(),
          color_map: We("white"),
          base_color: new H().set_hex_string("6699ee"),
        },
        force_update: new Set(["base_color", "world_matrix"]),
      })),
      (Dw = ge("model_icon")),
      (Pl = { type: "edit camera", matrix: [] })),
      t.renderer.set_screen_pass(r, "icon model"),
      o.set_pipeline(Dw);
    for (let [a, s] of e.remote_nodes) {
      let c = e.remote_matrices.get(a);
      c &&
        (pc.uniforms.base_color.read(s.color),
        pc.uniforms.world_matrix.copy(c),
        o.set_draw(pc));
    }
    o.set_pass(), Bm.compose(n.location, n.rotation, I2);
    let i = !1;
    for (let a = 0; a < 16; ++a)
      Pl.matrix[a] !== Bm.elements[a] &&
        ((i = !0), (Pl.matrix[a] = Bm.elements[a]));
    i && e.broadcast(JSON.stringify(Pl));
  }
  function Uw(t) {
    let e = h(ee).data_center,
      r = t.tab,
      o = vo(r),
      n = $o(r),
      i = qo(r),
      a = aw(r);
    o.size > 0 ? Pi(e, o, n, i, a) : Pi(e);
  }
  var Mi = class extends Yt {
    constructor(r = !0) {
      super();
      this.value = r;
      this.radiuses = new M(2, 2, 2, 2);
    }
    set radius(r) {
      this.radiuses.elements.fill(r);
    }
  };
  function El(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = S(de),
      c = S(x);
    s.copy(r);
    let _ = e.id,
      l = !1;
    return (
      t.ishovering(o) &&
        n >= t.hover_layer &&
        ((t.next_hover = _), (t.next_hover_layer_index = n)),
      t.hover === _ && t.active === -1 && s.color.copy(r.hover_color),
      t.hover === _ && t.left_mouse_press && t.set_active(_),
      t.active === _ &&
        t.left_mouse_release &&
        (t.hover === _ && ((e.value = !e.value), (l = !0)), t.clear_active()),
      e.radiuses.all_zero()
        ? O(a, s, o, i)
        : (ue(a, s, o, e.radiuses, i),
          e.value && (c.copy(o), c.shrink(2), Mw(a, c, i))),
      R(s),
      R(c),
      l
    );
  }
  var qe = class extends Yt {
    constructor(r = "") {
      super();
      this.is_input = !1;
      this.radiuses = new M(3, 3, 3, 3);
      this.editing = !1;
      this.outline = !0;
      this._scale = 1;
      this.cursor_index = 0;
      (this.label = new re(r)),
        (this.unmodified_text = r),
        (this.cursor_index = r.length);
    }
    set radius(r) {
      this.radiuses.elements.fill(r);
    }
    set text(r) {
      (this.label.text = r),
        (this.unmodified_text = r),
        (this.cursor_index = this.text.length);
    }
    get text() {
      return this.label.text;
    }
    set alignment(r) {
      this.label.alignment = r;
    }
    set padding_top(r) {
      this.label.padding_top = r;
    }
    set padding_right(r) {
      this.label.padding_right = r;
    }
    set padding_bottom(r) {
      this.label.padding_bottom = r;
    }
    set padding_left(r) {
      this.label.padding_left = r;
    }
    get zero_radius() {
      for (let r = 0; r < 4; ++r)
        if (this.radiuses.elements[r] !== 0) return !1;
      return !0;
    }
    set scale(r) {
      r !== this.scale && ((this.label.scale = r), (this._scale = r));
    }
    get scale() {
      return this._scale;
    }
    get cursor_offset() {
      return this.cursor_index <= 0
        ? 0
        : this.label.char_offsets[this.cursor_index - 1] ?? 0;
    }
    handle_edit(r) {
      let o = r.key_pressed,
        n = r.key_press,
        i = o.has(91) || o.has(93) || o.has(17),
        a = this.text;
      if (
        (r.key_press.has(8) &&
          (i
            ? (this.cursor_index === this.text.length
                ? (a = "")
                : (a = this.text.substring(this.cursor_index)),
              (this.cursor_index = 0))
            : this.text.length > 0 &&
              (this.cursor_index === this.text.length
                ? (a = this.text.substring(0, this.cursor_index - 1))
                : (a =
                    this.text.substring(0, this.cursor_index - 1) +
                    this.text.substring(this.cursor_index)),
              this.cursor_index--),
          r.key_press.delete(8)),
        i)
      )
        (n.has(65) || n.has(37)) && (this.cursor_index = 0),
          (n.has(69) || n.has(39)) && (this.cursor_index = a.length);
      else {
        n.has(37) && (this.cursor_index = Math.max(0, this.cursor_index - 1)),
          n.has(39) &&
            (this.cursor_index = Math.min(this.cursor_index + 1, a.length));
        let s = "",
          c = r.key_pressed.has(16);
        for (let _ of r.key_press) s += As(_, c);
        this.cursor_index === this.text.length
          ? (this.label.text = a + s)
          : (this.label.text =
              a.substr(0, this.cursor_index) +
              s +
              a.substring(this.cursor_index)),
          (this.cursor_index += s.length);
      }
    }
    render_cursor(r, o, n) {
      let i = S(x),
        a = S(de);
      i.copy(o);
      let s = this.scale,
        c = this.cursor_offset * s;
      this.label.alignment & 32
        ? (i.x += c + this.label.padding.w * s)
        : this.label.alignment & 8
          ? (i.x +=
              i.w - (this.label.padding.y + this.label.text_size.x) * s - c)
          : (i.x += (i.w - this.label.text_size.x * s) * 0.5 + c);
      let _ = 3;
      (i.w = 1.2 * s),
        (i.h -= _ * 2 * s),
        (i.y += _ * s),
        a.color.copy(h(F).theme.text_primary.color),
        O(r, a, i, n),
        R(i),
        R(a);
    }
  };
  function Cw(t) {
    return !!t.is_input;
  }
  function At(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = S(de),
      c = S(M);
    s.copy(r);
    let _ = e.id;
    c.copy(e.radiuses).mul(e.scale);
    let l = !1,
      u = t.ishovering(o) && n >= t.hover_layer;
    if (
      (u && ((t.next_hover = _), (t.next_hover_layer_index = n)),
      t.hover === _ &&
        ((t.cursor_type = "text"), t.left_mouse_press && (t.last_active = _)),
      (t.active === _ || t.focus === _) &&
        (s.color.copy(r.active_color),
        e.handle_edit(t),
        t.key_press.has(13) &&
          ((l = !0), t.clear_active(), t.clear_focus(), t.key_press.delete(13)),
        t.key_press.has(27) &&
          (t.clear_active(), t.clear_focus(), (e.text = e.unmodified_text))),
      t.focus === _)
    ) {
      let d = h(F).keyboard;
      !(d.visible && t.ishovering(d.rect)) &&
        t.left_mouse_release &&
        t.clear_focus();
    }
    return (
      t.hover === _ &&
        (t.key_press.has(13) ||
          (t.left_mouse_release && t.last_active === _)) &&
        (t.set_active(_),
        t.touch_screen && (h(F).keyboard.visible = !0),
        t.set_focus(_),
        (e.unmodified_text = e.label.text)),
      t.active === _ &&
        !t.ishovering(o) &&
        t.left_mouse_press &&
        t.clear_active(),
      (t.active === _ || t.focus === _ || e.outline) &&
        (s.color.copy(r.outline_color), (s.line_width = 1), fr(a, s, o, c, i)),
      s.color.copy(
        u && t.hover === _ && t.active === -1 ? r.hover_color : r.color,
      ),
      e.zero_radius ? O(a, s, o, i) : ue(a, s, o, c, i),
      V(t, e.label, o, n, i),
      (t.active === _ || t.focus === _) && e.render_cursor(a, o, i),
      R(s),
      R(c),
      l
    );
  }
  var lt = class extends qe {
    constructor(r = 0) {
      super("");
      this.is_number_input = !0;
      this.type = 0;
      this._precision = 2;
      this.step = 0.1;
      this.dragging = !1;
      (r = $r(r) ? r : 0), (this.value = r);
    }
    set precision(r) {
      (this._precision = r), (this.value = parseFloat(this.value.toFixed(r)));
    }
    get precision() {
      return this._precision;
    }
    set_text_value(r) {
      this.value = this.type === 0 ? parseFloat(r) : parseInt(r);
    }
    set value(r) {
      (this.label.text =
        this.type === 0 ? r.toFixed(this.precision) : (r | 0).toString()),
        (this.unmodified_text = this.label.text),
        (this.cursor_index = this.text.length);
    }
    get value() {
      return parseFloat(this.label.text);
    }
    set scale(r) {
      r !== this._scale && ((this.label.scale = r), (this._scale = r));
    }
    get scale() {
      return this._scale;
    }
    set unit(r) {
      this.label.unit = r;
    }
    parse_value() {
      let r = 0;
      return (
        this.type === 0
          ? (r = parseFloat(this.label.text))
          : (r = parseInt(this.label.text)),
        isNaN(r)
          ? ((this.label.text = this.unmodified_text), this.parse_value(), !1)
          : ((this.value = r), !0)
      );
    }
  };
  function Lw(t) {
    return !!t.is_number_input;
  }
  function ht(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = S(de),
      c = S(M),
      _ = S(x),
      l = S(x),
      u = S(T),
      d = S(T),
      p = S(T);
    s.copy(r);
    let m = e.id,
      f = e.scale,
      y = !1,
      g = t.ishovering(o) && n >= t.hover_layer;
    if (
      (g && ((t.next_hover = m), (t.next_hover_layer_index = n)),
      t.hover === m && t.active === -1 && (t.cursor_type = "text"),
      t.active === m &&
        !g &&
        t.left_mouse_press &&
        (t.clear_active(), (e.label.text = e.unmodified_text)),
      t.focus === m)
    ) {
      s.color.copy(r.outline_color),
        (s.line_width = 1),
        e.outline && fr(a, s, o, c, i);
      let w = h(F).keyboard;
      !(w.visible && t.ishovering(w.rect)) &&
        t.left_mouse_press &&
        (t.clear_focus(), (e.text = e.unmodified_text));
    }
    let v = !e.dragging && (t.active === m || t.focus === m);
    if (
      (v &&
        !t.left_mouse_press &&
        (s.color.copy(r.active_color),
        e.handle_edit(t),
        t.key_press.has(13) &&
          (t.clear_active(),
          t.clear_focus(),
          (y = e.parse_value()),
          t.key_press.delete(13)),
        t.key_press.has(27) &&
          (t.clear_active(),
          t.clear_focus(),
          (e.label.text = e.unmodified_text),
          t.key_press.delete(27))),
      c.copy(e.radiuses).mul(f),
      (t.active === m || t.hover === m || e.dragging || t.focus === m) &&
        (s.color.copy(r.outline_color),
        (s.line_width = f),
        e.outline && fr(a, s, o, c, i)),
      s.color.copy(g && t.active === -1 ? r.hover_color : r.color),
      l.shrink(1, 2),
      e.zero_radius ? O(a, s, o, i) : ue(a, s, o, c, i),
      V(t, e.label, o, n, i, void 0, !v),
      l.copy(o),
      (l.w = 7 * f),
      l.shrink(2 * f),
      (l.x += 1 * f),
      _.copy(l),
      _.expand(2 * f, 4 * f),
      (t.hover === m && t.ishovering(_) && t.active === -1) || e.dragging
        ? (s.color.set_hex_string("e0e0e0aa"),
          (t.cursor_type = "ew-resize"),
          u.set(_.x + _.w * 0.5, _.y + _.h * 0.5))
        : s.color.set_hex_string("e0e0e066"),
      q(a, s, l, 1 * f, i),
      t.hover === m &&
        t.left_mouse_press &&
        (t.ishovering(_)
          ? (p.copy(t.mouse_location),
            (e.dragging = !0),
            t.set_active(m),
            t.set_focus(m))
          : (t.last_active = m)),
      t.hover === m &&
        (t.key_press.has(13) ||
          (t.left_mouse_release && t.last_active === m)) &&
        !e.dragging &&
        (t.set_active(m),
        t.touch_screen && (h(F).keyboard.visible = !0),
        t.set_focus(m)),
      e.dragging && t.active === m)
    ) {
      t.cursor_type = "ew-resize";
      let w = t.mouse_offset.x * (t.key_pressed.has(16) ? t.smooth_factor : 1);
      if (e.type === 0) {
        let D = parseFloat(e.unmodified_text);
        (D += w * e.step),
          e.min !== void 0 && (D = Math.max(e.min, D)),
          e.max !== void 0 && (D = Math.min(e.max, D)),
          (e.label.text = D.toFixed(e.precision));
      } else {
        let D = parseInt(e.unmodified_text);
        (D += w),
          e.min !== void 0 && (D = Math.max(e.min, D)),
          e.max !== void 0 && (D = Math.min(e.max, D)),
          (e.label.text = D.toString());
      }
      t.left_mouse_release &&
        ((y = e.parse_value()),
        (e.dragging = !1),
        t.clear_active(),
        t.clear_focus()),
        (e.cursor_index = e.text.length),
        d.copy(t.mouse_location);
      let k = h(F).theme;
      zw(t.buffer.layers[n + 1], k.line, u, d);
    }
    return (
      (t.active === m || t.focus === m) &&
        !e.dragging &&
        e.render_cursor(a, o, i),
      R(l),
      R(s),
      R(c),
      R(_),
      R(u),
      R(d),
      R(p),
      y
    );
  }
  var Bw = 12,
    Ci = 15,
    R2 = 30,
    Oa = 8,
    Nw = 38,
    S2 = 20,
    Wm = 32,
    j = new x(),
    ri = new x(),
    Dl = new x(),
    Qo = new T(),
    oi = new x(0, 0, 4, Bw + 2),
    Hm = class {
      constructor() {
        this.is_color_picker = !0;
        this.control_id = -1;
        this.mode = 1;
        this.visible = !1;
        this.rgba = new H();
        this.hsl = new aa(0, 1, 0.5);
        this.hue = new aa(0, 1, 0.5);
        this.hue_color = new H();
        this.hsv = new Ds();
        this.rect = new x(0, 0, 260, 260);
        (this.hue_bar = new Br(We("hue"))),
          (this.transparency_bar = new Br(We("transparency"))),
          (this.draw = ce({
            primitive: He("screen_triangle"),
            uniforms: { hue: 0 },
          })),
          (this.pipeline = ge("color_panel")),
          (this.channel_r = Om()),
          (this.channel_g = Om()),
          (this.channel_b = Om()),
          (this.channel_a = new lt()),
          (this.channel_a.min = 0),
          (this.channel_a.max = 1),
          (this.channel_a.step = 0.01),
          (this.channel_h = new lt()),
          (this.channel_h.min = 0),
          (this.channel_h.max = 360),
          (this.channel_h.precision = 0),
          (this.channel_h.unit = "'"),
          (this.channel_s = new lt()),
          (this.channel_s.min = 0),
          (this.channel_s.max = 100),
          (this.channel_s.precision = 0),
          (this.channel_s.unit = "%"),
          (this.channel_l = new lt()),
          (this.channel_l.min = 0),
          (this.channel_l.max = 100),
          (this.channel_l.precision = 0),
          (this.channel_l.unit = "%"),
          (this.mode_select = new Zt()),
          this.mode_select.set_option("RGBA", 1),
          this.mode_select.set_option("HSL", 2),
          (this.mode_select.icon = !1),
          (this.panel_id = Ie(this)),
          (this.hue_id = Ie(this)),
          (this.transparency_id = Ie(this)),
          (this.color_style = K()),
          (this.color_style.color = this.rgba),
          (this.hue_style = K()),
          Mn(this.hue, this.hue_color),
          (this.hue_style.color = this.hue_color),
          (this.transparency_style = K("ffff"));
      }
      set_hex_string(e) {
        this.rgba.set_hex_string(e),
          t_(this.rgba, this.hsl),
          r_(this.rgba, this.hsv),
          (this.draw.uniforms.hue = this.hue.hue = this.hsl.hue),
          Mn(this.hue, this.hue_color),
          this.async_input();
      }
      set_rgba(e) {
        this.rgba.copy(e),
          t_(this.rgba, this.hsl),
          r_(this.rgba, this.hsv),
          (this.draw.uniforms.hue = this.hue.hue = this.hsl.hue),
          Mn(this.hue, this.hue_color),
          this.async_input();
      }
      set_hsl(e) {
        this.hsl.copy(e),
          Mn(this.hsl, this.rgba),
          r_(this.rgba, this.hsv),
          (this.draw.uniforms.hue = this.hue.hue = this.hsl.hue),
          Mn(this.hue, this.hue_color),
          this.async_input();
      }
      async_input() {
        (this.channel_r.value = this.rgba.r * 255),
          (this.channel_g.value = this.rgba.g * 255),
          (this.channel_b.value = this.rgba.b * 255),
          (this.channel_a.value = this.rgba.a),
          (this.channel_h.value = this.hsl.hue * 360),
          (this.channel_s.value = this.hsl.saturation * 100),
          (this.channel_l.value = this.hsl.lightness * 100);
      }
    },
    Gl;
  function Ww() {
    return Gl === void 0 && (Gl = new Hm()), Gl;
  }
  function Ow() {
    return Gl;
  }
  function Hw(t, e, r, o = 1, n = 0) {
    if (!e.visible) return !1;
    let i =
      t.active === e.hue_id ||
      t.active === e.panel_id ||
      t.active === e.transparency_id;
    if (
      (e.mode === 1
        ? (i =
            i ||
            t.active === e.channel_r.id ||
            t.active === e.channel_g.id ||
            t.active === e.channel_b.id ||
            t.active === e.channel_a.id)
        : e.mode === 2 &&
          (i =
            i ||
            t.active === e.channel_h.id ||
            t.active === e.channel_s.id ||
            t.active === e.channel_l.id),
      ri.copy(r).expand(R2),
      !i && !t.ishovering(ri))
    )
      return (e.visible = !1), (e.control_id = -1), !1;
    if (t.key_press.has(27))
      return (
        (e.visible = !1),
        t.key_press.delete(27),
        t.clear_active(),
        (e.control_id = -1),
        !1
      );
    t.next_hover_layer_index = o;
    let a = !1,
      s = t.buffer.layers[1],
      c = h(F).theme;
    q(s, c.shadow, r, 8),
      q(s, c.panel_layer_0, r, 8),
      j.copy(r),
      j.shrink(Ci),
      (j.h = j.h * 0.618);
    let _ = C.CurrentDevice().encoder;
    t.renderer.set_screen_pass(j, "color picker"),
      _.set_pipeline(e.pipeline),
      _.set_draw(e.draw),
      _.set_pass(),
      Vt(s, j, 4),
      ri.copy(j).expand(0.5),
      Ee(s, c.panel_layer_0, ri, 4);
    let l = t.active === -1 && t.left_mouse_press;
    t.active === e.panel_id &&
      (j.constrain(Qo.copy(t.mouse_location)),
      Fr(s, e.color_style, Qo, 4),
      dc(s, c.white, Qo, 4),
      (e.hsv.saturation = (Qo.x - j.x) / j.w),
      (e.hsv.value = 1 - (Qo.y - j.y) / j.h),
      $b(e.hsv, e.rgba),
      t_(e.rgba, e.hsl),
      e.async_input(),
      t.left_mouse_release && t.clear_active()),
      t.ishovering(j) && (t.next_hover = e.panel_id),
      t.hover === e.panel_id && l && t.set_active(e.panel_id),
      (j.y += j.h + Ci),
      Dl.copy(j),
      (Dl.w = Dl.h = Wm);
    let u = Dl.w * 0.6;
    if (
      (Qo.set(j.w, j.h),
      (Qo.x = j.x + u + 5),
      (Qo.y = j.y + u),
      Fr(s, e.color_style, Qo, u),
      dc(s, c.white, Qo, u),
      (j.x += Wm + Ci + 10),
      (j.w -= Wm + Ci + 10),
      (j.h = Bw),
      wn(t, e.hue_bar, j, 1),
      ri.copy(j).expand(0.5),
      Ee(s, c.panel_layer_0, ri, 4),
      (oi.x = j.x + e.hue.hue * j.w - 2),
      (oi.y = j.y - 1),
      q(s, e.hue_style, oi, 2),
      Ee(s, c.white, oi, 2),
      t.active === e.hue_id)
    ) {
      let m = (Q(t.mouse_location.x, j.x, j.x + j.w) - j.x) / j.w;
      (e.draw.uniforms.hue = e.hsl.hue = e.hsv.hue = e.hue.hue = m),
        Mn(e.hue, e.hue_color),
        Mn(e.hsl, e.rgba),
        e.async_input(),
        t.left_mouse_release && t.clear_active();
    }
    t.ishovering(j) && (t.next_hover = e.hue_id),
      t.hover === e.hue_id && l && t.set_active(e.hue_id),
      (j.y += j.h + Ci),
      wn(t, e.transparency_bar, j, 1),
      ri.copy(j).expand(0.5),
      Ee(s, c.panel_layer_0, ri, 4);
    let d = e.rgba.a;
    if (
      ((oi.x = j.x + d * j.w - 2),
      (oi.y = j.y - 1),
      q(s, e.transparency_style, oi, 2),
      Ee(s, c.white, oi, 2),
      t.active === e.transparency_id)
    ) {
      let p = Q(t.mouse_location.x, j.x, j.x + j.w);
      (e.rgba.a = e.transparency_style.color.a = (p - j.x) / j.w),
        t.left_mouse_release && t.clear_active();
    }
    return (
      t.ishovering(j) && (t.next_hover = e.transparency_id),
      t.hover === e.transparency_id && l && t.set_active(e.transparency_id),
      (j.x = r.x + Ci),
      (j.y += j.h + Ci),
      (j.w = Nw + 10),
      (j.h = S2),
      Yr(t, e.mode_select, c.panel_layer_1, j, 1) &&
        (e.mode = e.mode_select.value),
      (j.x += j.w + Oa),
      (j.w = Nw),
      e.mode === 1
        ? (ht(t, e.channel_r, c.panel_layer_1, j, 1) &&
            ((e.rgba.r = Q(e.channel_r.value / 255, 0, 1)), e.set_rgba(e.rgba)),
          (j.x += j.w + Oa),
          ht(t, e.channel_g, c.panel_layer_1, j, 1) &&
            ((e.rgba.g = Q(e.channel_g.value / 255, 0, 1)), e.set_rgba(e.rgba)),
          (j.x += j.w + Oa),
          ht(t, e.channel_b, c.panel_layer_1, j, 1) &&
            ((e.rgba.b = Q(e.channel_b.value / 255, 0, 1)), e.set_rgba(e.rgba)),
          (j.x += j.w + Oa),
          ht(t, e.channel_a, c.panel_layer_1, j, 1) &&
            ((e.rgba.a = Q(e.channel_a.value, 0, 1)), e.set_rgba(e.rgba)))
        : e.mode === 2 &&
          ((j.w += 15),
          ht(t, e.channel_h, c.panel_layer_1, j, 1) &&
            ((e.hsl.hue = Q(e.channel_h.value / 360, 0, 1)), e.set_hsl(e.hsl)),
          (j.x += j.w + Oa),
          ht(t, e.channel_s, c.panel_layer_1, j, 1) &&
            ((e.hsl.saturation = Q(e.channel_s.value / 100, 0, 1)),
            e.set_hsl(e.hsl)),
          (j.x += j.w + Oa),
          ht(t, e.channel_l, c.panel_layer_1, j, 1) &&
            ((e.hsl.lightness = Q(e.channel_l.value / 100, 0, 1)),
            e.set_hsl(e.hsl))),
      a
    );
  }
  function Om() {
    let t = new lt();
    return (t.min = 0), (t.max = 255), (t.precision = 0), t;
  }
  function mc(t) {
    return t !== void 0 && t.drop !== void 0;
  }
  function Vw(t) {
    return t !== void 0 && t.drag_end !== void 0;
  }
  var Rn = class {
      constructor(e = "") {
        this.radiuses = new M(3, 3, 3, 3);
        (this.id = Ie(this)), (this.label = new re(e));
      }
      set radius(e) {
        this.radiuses.set(e, e, e, e);
      }
    },
    So;
  function fc(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = h(F).theme,
      c = e.id;
    So === void 0 && (So = new de()), So.copy(r);
    let _ = !1,
      l = t.ishovering(o) && n >= t.hover_layer;
    l &&
      ((t.next_hover = c),
      (t.next_hover_layer_index = n),
      So.color.copy(r.hover_color));
    let u = t.active === c;
    return (
      t.hover === c &&
        t.active === -1 &&
        t.left_mouse_press === !0 &&
        t.set_active(c),
      u && So.color.copy(r.active_color),
      u &&
        t.left_mouse_release === !0 &&
        ((_ = o.contains(t.mouse_location)), t.clear_active()),
      e.radiuses.all_zero() ? O(a, So, o, i) : ue(a, So, o, e.radiuses, i),
      l &&
        (So.color.copy(s.white.color),
        (So.line_width = 0.8),
        e.radiuses.all_zero() ? Wo(a, So, o, i) : fr(a, So, o, e.radiuses, i)),
      V(t, e.label, o, n, i),
      _
    );
  }
  var jw = new WeakMap(),
    Ul = new x(),
    xt = new x(),
    Pt = new x();
  function Xw(t, e, r, o, n) {
    let i = h(ee).data_center,
      a = t.tab,
      s = jw.get(a);
    s ||
      ((s = {}),
      (s.toggles = {}),
      (s.uniform_inputs = {}),
      (s.model_drop = new Rn()),
      (s.material_drop = new Rn()),
      (s.visible_toggle = new Mi()),
      (s.cast_shadow_toggle = new Mi()),
      jw.set(a, s));
    let c = 0,
      _ = h(F).theme,
      l = h(J),
      u = o.w * 0.6;
    Pt.copy(o);
    {
      let p = Fo("material");
      O(t.buffer, _.panel_layer_1, Pt, n), E(t, p, _.panel_layer_1, Pt, 0, n);
      let m = i.get_property(e, "model.material"),
        f = l.get_resource(m),
        y = s.material_drop;
      if (
        ((y.label.text = h(Z).get_node_by_guid(f?.guid)?.name ?? "empty"),
        !f || !f.data)
      )
        return 24;
      if (
        (Ul.copy(o),
        (Ul.w -= 12),
        (Ul.x += 12),
        xt.copy(Ul),
        xt.shrink(3),
        (xt.x += xt.w - u - 2),
        (xt.w = u),
        fc(t, y, _.panel_layer_2, xt, 0, n))
      ) {
        let g = h(we).asset_search;
        rc(t.window_rect, xt, g.rect), g.enable(y.id, 2);
      }
      r &&
        (y.drop = (g) => {
          It.is(g) &&
            i.set_property(
              e,
              "model.material",
              l.get_resource_with_guid(g.guid)?.uuid,
            );
        }),
        (c += Pt.h),
        (Pt.y += Pt.h);
    }
    {
      let p = Fo("model");
      O(t.buffer, _.panel_layer_1, Pt, n), E(t, p, _.panel_layer_1, Pt, 0, n);
      let m = i.get_property(e, "model.model"),
        f = l.get_resource(m),
        y = s.model_drop;
      if (
        ((y.label.text = h(Z).get_node_by_guid(f?.guid)?.name ?? "empty"),
        xt.copy(Pt),
        xt.shrink(3),
        (xt.x += xt.w - u - 2),
        (xt.w = u),
        fc(t, y, _.panel_layer_2, xt, 0, n))
      ) {
        let g = h(we).asset_search;
        rc(t.window_rect, xt, g.rect), g.enable(y.id, 1);
      }
      r &&
        (y.drop = (g) => {
          It.is(g) &&
            i.set_property(
              e,
              "model.model",
              l.get_resource_with_guid(g.guid)?.uuid,
            );
        }),
        (c += Pt.h),
        (Pt.y += Pt.h);
    }
    function d(p, m, f) {
      let y = Fo(p);
      O(t.buffer, _.panel_layer_1, Pt, n),
        E(t, y, _.panel_layer_1, Pt, 0, n),
        xt.copy(Pt),
        xt.shrink(5),
        (xt.w = xt.h),
        (xt.x += Pt.w - xt.w - 10),
        r && (f.value = !!i.get_property(e, m)),
        El(t, f, _.toggle, xt, 0, n) && i.set_property(e, m, f.value),
        (c += Pt.h),
        (Pt.y += Pt.h);
    }
    return (
      d("visible", "model.visible", s.visible_toggle),
      d("cast_shadow", "model.cast_shadow", s.cast_shadow_toggle),
      c
    );
  }
  var Ml = ((s) => (
    (s[(s.Box = 1)] = "Box"),
    (s[(s.Capsule = 2)] = "Capsule"),
    (s[(s.Cylinder = 3)] = "Cylinder"),
    (s[(s.Sphere = 4)] = "Sphere"),
    (s[(s.Cone = 5)] = "Cone"),
    (s[(s.ConvexTriangleMesh = 6)] = "ConvexTriangleMesh"),
    (s[(s.BVHTriangleMesh = 7)] = "BVHTriangleMesh"),
    s
  ))(Ml || {});
  var $w = new WeakMap(),
    Cl = new Mt();
  Cl.width = 120 - 4;
  Cl.height = 24 - 4;
  Cl.margin = new Jr(0, 2, 0, 0);
  Cl.alignment = 9;
  function qw(t, e, r, o, n) {
    let i = 0,
      a = h(F).theme,
      s = h(ee).data_center,
      c = t.tab,
      _ = $w.get(c);
    if (!_) {
      (_ = {}),
        (_.mass_input = new lt()),
        (_.mass_input.unit = "kg"),
        (_.shape_select = new Zt()),
        (_.hull = new Rn());
      let l = _.shape_select;
      l.set_option("Box", 1),
        l.set_option("Capsule", 2),
        l.set_option("Cylinder", 3),
        l.set_option("Sphere", 4),
        l.set_option("Cone", 5),
        l.set_option("ConvexTriangleMesh", 6),
        l.set_option("TriangleMesh", 7),
        $w.set(c, _);
    }
    return i;
  }
  var A2 = /export\s+class\s+([A-z_$]*)/;
  function Li(t, e) {
    let r = h(J);
    if (((e = e || r.create_resource(3)), !t))
      return console.warn("empty script source code"), e;
    let o = t.match(A2);
    if (((e.data = {}), o === null || o?.length < 2))
      return (
        console.error(`source doesn't contains any class name. Template [export class ClassName]
${t}`),
        e
      );
    let n = o[1],
      i = t.replace(/export\s+/, "");
    (i = `${i}
new ${n}()`),
      (e.data.code = t);
    let a = (0, eval)(i);
    return (
      a
        ? ((e.data.script_class = a.constructor), k2(e.data))
        : console.error(`invalid script source ${t}`),
      e
    );
  }
  async function Qw(t) {
    let e = await st(t);
    return Li(e);
  }
  function k2(t) {
    let e = new t.script_class(),
      r = Object.getOwnPropertyNames(e);
    t.reflections = [];
    for (let o of r) {
      let n = o.charCodeAt(0);
      if (n >= 65 && n <= 90) {
        let i = e[o],
          a = typeof i;
        t.reflections.push({ name: o, type: a, value: i });
      }
    }
  }
  var Ha = new x(),
    bc = new x(),
    Va = new Rn("empty");
  Va.label.alignment = 3;
  Va.label.padding.y = 5;
  function Zw(t, e, r, o, n) {
    let i = h(F).theme,
      a = h(ee).data_center,
      s = h(J),
      c = 0;
    bc.copy(o);
    let _ = o.w * 0.6;
    {
      let l = Fo("source");
      O(t.buffer, i.panel_layer_1, bc, n), E(t, l, i.panel_layer_1, bc, 0, n);
      let u = s.get_resource(a.get_property(e, "script.source"));
      if (
        (Ha.copy(bc),
        Ha.shrink(3),
        (Ha.x += Ha.w - _ - 2),
        (Ha.w = _),
        fc(t, Va, i.panel_layer_2, Ha, 0, n),
        r)
      ) {
        let p = h(Z).get_node_by_guid(u?.guid);
        (Va.label.text = p?.name ?? "empty"),
          (Va.drop = (m) => {
            if (It.is(m)) {
              let f = h(J);
              (u = Li(m.data, u)),
                f.link_resource(u.uuid, m.guid),
                a.set_property(e, "script.source", u.uuid),
                (Va.label.text = m.name);
            }
          });
      }
      c += bc.h;
    }
    return c;
  }
  var Ll = new Mt();
  Ll.width = 20;
  Ll.height = 24 - 6;
  Ll.alignment = 33;
  Ll.margin.set(0, 0, 0, 15);
  var zl = new Mt();
  zl.width = 100;
  zl.height = 24 - 6;
  zl.alignment = 9;
  zl.margin.set(0, 10, 0, 0);
  var Yw = new WeakMap(),
    Sn = new b(),
    yc = new b(),
    zi = new $(),
    Vm = new b(),
    Ni = new b(),
    Jw = new $(),
    Kw = new vt(),
    ja = new vt(),
    at = new x(),
    Oe = new x(),
    ni = new x(),
    Xa = new x(),
    e0 = 20,
    jm = new re("X"),
    Xm = new re("Y"),
    $m = new re("Z");
  function P2(t) {
    let e = Yw.get(t);
    if (!e) {
      e = {};
      let r = new lt();
      (r.unit = "cm"), (e.location_x = r);
      let o = new lt();
      (o.unit = "cm"), (e.location_y = o);
      let n = new lt();
      (n.unit = "cm"),
        (e.location_z = n),
        (e.rotation_x = new lt()),
        (e.rotation_x.unit = "'"),
        (e.rotation_y = new lt()),
        (e.rotation_y.unit = "'"),
        (e.rotation_z = new lt()),
        (e.rotation_z.unit = "'"),
        (e.scale_x = new lt()),
        (e.scale_y = new lt()),
        (e.scale_z = new lt()),
        Yw.set(t, e);
    }
    return e;
  }
  function t0(t, e, r, o, n) {
    let i = h(ee).data_center,
      a = t.tab,
      s = P2(a),
      c = h(F).theme,
      {
        location_x: _,
        location_y: l,
        location_z: u,
        rotation_x: d,
        rotation_y: p,
        rotation_z: m,
        scale_x: f,
        scale_y: y,
        scale_z: g,
      } = s,
      v = 0;
    r &&
      (i.get_property(e, "transform.location", Sn),
      (_.value = Sn.x),
      (l.value = Sn.y),
      (u.value = Sn.z),
      i.get_property(e, "transform.scale", Ni),
      (f.value = Ni.x),
      (y.value = Ni.y),
      (g.value = Ni.z),
      i.get_property(e, "transform.rotation", zi),
      ja.from_quaternion(zi),
      (d.value = ja.x),
      (p.value = ja.y),
      (m.value = ja.z));
    let w = ml(a) === 3,
      k = _.dragging || l.dragging || u.dragging,
      D = d.dragging || p.dragging || m.dragging,
      G = f.dragging || y.dragging || g.dragging;
    w ||
      (k &&
        (i.get_property(e, "transform.location", Sn),
        Vm.set(_.value, l.value, u.value),
        Vm.sub(Sn),
        Fm(a, Vm),
        Ft(i, e)),
      D &&
        (i.get_property(e, "transform.rotation", zi),
        ja.set(d.value, p.value, m.value),
        Jw.from_euler(ja.mul(cr)).mul(zi.conjugate()),
        Am(a, Jw),
        Ft(i, e)),
      G &&
        (i.get_property(e, "transform.scale", yc),
        Ni.set(f.value, y.value, g.value),
        Ni.div_v(yc),
        km(a, Ni),
        Ft(i, e))),
      (v = ni.h * 3 + e0 * 9 + 28),
      ni.copy(o),
      (ni.h = v),
      O(t.buffer, c.panel_layer_1, ni, n),
      ni.copy(o),
      Oe.copy(ni),
      (Oe.y += Oe.h),
      (Oe.w *= 0.7),
      (Oe.x += ni.w - Oe.w - 5),
      (Oe.h = e0),
      at.copy(Oe),
      (at.x -= 20),
      (at.w = 12),
      Oe.shrink(1, 0);
    let U = Oe.h + 5;
    function Y() {
      Sn.set(_.value, l.value, u.value),
        i.set_property(e, "transform.location", Sn),
        Fm(a, Sn.set(0, 0, 0)),
        Ft(i, e);
    }
    function le() {
      Kw.set(d.value, p.value, m.value).mul(cr),
        zi.from_euler(Kw),
        i.set_property(e, "transform.rotation", zi),
        Am(a, zi.set(0, 0, 0, 1)),
        Ft(i, e);
    }
    function X() {
      yc.set(f.value, y.value, g.value),
        i.set_property(e, "transform.scale", yc),
        km(a, yc.set(1, 1, 1)),
        Ft(i, e);
    }
    Xa.copy(ni);
    let Qe = Fo("location");
    V(t, Qe.label, Xa, 0, n),
      ht(t, _, c.axis_input_x, Oe, 0, n) && Y(),
      V(t, jm, at, 0, n),
      (at.y += U),
      (Oe.y += U),
      ht(t, l, c.axis_input_y, Oe, 0, n) && Y(),
      V(t, Xm, at, 0, n),
      (at.y += U),
      (Oe.y += U),
      ht(t, u, c.axis_input_z, Oe, 0, n) && Y(),
      V(t, $m, at, 0, n),
      (at.y += U),
      (Oe.y += U);
    let Ge = Fo("rotation");
    (Xa.y = at.y),
      V(t, Ge.label, Xa, 0, n),
      (at.y += U),
      (Oe.y += U),
      ht(t, d, c.axis_input_x, Oe, 0, n) && le(),
      V(t, jm, at, 0, n),
      (at.y += U),
      (Oe.y += U),
      ht(t, p, c.axis_input_y, Oe, 0, n) && le(),
      V(t, Xm, at, 0, n),
      (at.y += U),
      (Oe.y += U),
      ht(t, m, c.axis_input_z, Oe, 0, n) && le(),
      V(t, $m, at, 0, n),
      (at.y += U),
      (Oe.y += U);
    let Nt = Fo("scale");
    return (
      (Xa.y = at.y),
      V(t, Nt.label, Xa, 0, n),
      (at.y += U),
      (Oe.y += U),
      ht(t, f, c.axis_input_x, Oe, 0, n) && X(),
      V(t, jm, at, 0, n),
      (at.y += U),
      (Oe.y += U),
      ht(t, y, c.axis_input_y, Oe, 0, n) && X(),
      V(t, Xm, at, 0, n),
      (at.y += U),
      (Oe.y += U),
      ht(t, g, c.axis_input_z, Oe, 0, n) && X(),
      V(t, $m, at, 0, n),
      (at.y += U),
      (Oe.y += U),
      v
    );
  }
  var Ve = new x(),
    or = new x(),
    rt = new x(),
    Zo = new x(),
    gc = new x(),
    Nl = new M(),
    xc = K(),
    Qm = new WeakMap();
  function r0(t, e, r) {
    let o = h(F).theme;
    Ve.copy(e), q(t.buffer, o.button_state, Ve, 4);
    let n = t.buffer.write_clip(Ve),
      i = Qm.get(t.tab);
    i === void 0 &&
      ((i = {}),
      (i.type_btn = {}),
      (i.type_delete_btn = {}),
      (i.type_folded = {}),
      (i.property_folded = {}),
      (i.type_items = {}),
      (i.type_operator = {}),
      (i.scroll_y = 0),
      (i.add_type_btn = new Zt("add type")),
      (i.add_type_btn.icon = !1),
      (i.edit_location = new b()),
      (i.edit_rotation = new vt()),
      (i.edit_scale = new b()),
      (i.scroll_view = new Ar()),
      Qm.set(t.tab, i));
    let a = i.scroll_view,
      s = h(ee).data_center,
      c = r !== i.last_entity;
    i.last_entity = r;
    let _ = s.get_entity_prototype(r).mask,
      l = s.get_types_by_mask(_);
    if (c) {
      let d = i.add_type_btn;
      d.clear_option();
      for (let p = 0; p < s.types.length; p++) {
        let m = s.types[p];
        m.mask & _ || d.set_option(m.name, m.mask);
      }
    }
    or.copy(Ve), or.shrink(4), (or.h = 26), (or.y -= a.scroll_offset_y);
    let u = e.w * 0.6;
    for (let d = 0; d < l.length; d++) {
      let p = l[d],
        m = p.properties,
        f = p.name,
        y = i.type_btn[f];
      if (
        (y === void 0 &&
          ((y = new P(f)),
          (y.label.alignment = 33),
          (y.label.padding.w = 10),
          (i.type_btn[f] = y),
          (i.type_delete_btn[f] = new P())),
        E(t, y, o.panel_layer_0, or, 0, n) &&
          (i.type_folded[f] = !i.type_folded[f]),
        f !== "transform" && f !== "entity")
      ) {
        let v = i.type_delete_btn[f];
        if (
          (Zo.copy(or),
          (Zo.x = Zo.x + Zo.w - Zo.h),
          (Zo.w = Zo.h),
          Zo.shrink(6),
          E(t, v, o.panel_layer_2, Zo, 0, n))
        ) {
          let w = s.remove_type_by_name(r, f);
          To(t, t.tab, [w]);
        }
        jn(t.buffer, Zo, n);
      }
      if (i.type_folded[f]) {
        or.y += or.h + 10;
        continue;
      }
      rt.copy(or), (rt.y += or.h), (rt.x += 6), (rt.w -= 12), (rt.h = 24);
      let g = 0;
      switch (f) {
        case "physics":
          g = qw(t, r, c, rt, n);
          break;
        case "script":
          g = Zw(t, r, c, rt, n);
          break;
        case "model":
          g = Xw(t, r, c, rt, n);
          break;
        case "transform":
          g = t0(t, r, c, rt, n);
          break;
        default:
          for (let v in m) {
            let w = `${f}.${v}`;
            if (!p.properties[v].editor_visible) continue;
            let k = Fo(v),
              D = i.type_operator;
            if ((D[w] === void 0 && (D[w] = {}), i.property_folded[w])) {
              O(t.buffer, o.panel_layer_1, rt, n),
                E(t, k, o.panel_layer_1, rt, 0, n) &&
                  (i.property_folded[w] =
                    i.property_folded[w] === void 0
                      ? !1
                      : !i.property_folded[w]),
                (rt.y += rt.h),
                (or.y += rt.h);
              continue;
            }
            if (w === "entity.name") {
              O(t.buffer, o.panel_layer_1, rt, n),
                E(t, k, o.panel_layer_1, rt, 0, n);
              let G = D.entity_name_input;
              if (
                (G === void 0 &&
                  ((G = new qe(s.get_property(r, w) || "unnamed")),
                  (D.entity_name_input = G),
                  (G.label.alignment = 33),
                  (G.label.padding.w = 4)),
                c && (G.label.text = s.get_property(r, w) || "unnamed"),
                Ve.copy(rt),
                Ve.shrink(3),
                (Ve.x += Ve.w - u - 2),
                (Ve.w = u),
                At(t, G, o.input, Ve, 0, n))
              ) {
                s.set_property(r, w, G.label.text);
                let U = Je(s, r);
                U && (U.name = G.label.text);
              }
              (rt.y += rt.h), (or.y += rt.h);
            } else {
              let G = m[v];
              if (G.editor_visible) {
                O(t.buffer, o.panel_layer_1, rt, n),
                  E(t, k, o.panel_layer_1, rt, 0, n),
                  Ve.copy(rt),
                  Ve.shrink(3),
                  (Ve.x += Ve.w - u - 2),
                  (Ve.w = u);
                let U = E2(t, w, G),
                  Y = G.inspect_type;
                if (Y === 0)
                  Lw(U)
                    ? (c && (U.value = s.get_property(r, w)),
                      ht(t, U, o.input, Ve, 0, n) &&
                        s.set_property(r, w, U.value))
                    : Cw(U)
                      ? (c && (U.text = s.get_property(r, w)),
                        At(t, U, o.input, Ve, 0, n) &&
                          s.set_property(r, w, U.label.text))
                      : (Ve.shrink(1.5),
                        (Ve.x += Ve.w - Ve.h),
                        (Ve.w = Ve.h),
                        c && (U.value = s.get_property(r, w)),
                        El(t, U, o.toggle, Ve, 0, n) &&
                          s.set_property(r, w, U.value));
                else if (Y === 4) {
                  s.get_property(r, w, Nl);
                  let le = Ow();
                  xc.color.from_float4(Nl),
                    xc.hover_color.copy(xc.color).tone(1.1),
                    E(t, U, xc, Ve, 0, n) &&
                      ((le.visible = !0),
                      (le.rect.x = Ve.x - le.rect.w + Ve.w),
                      (le.rect.y = Ve.y + Ve.h),
                      le.set_rgba(xc.color),
                      (le.control_id = U.id)),
                    Hw(t, le, le.rect),
                    le.visible &&
                      le.control_id === U.id &&
                      (le.rgba.to_float4(Nl), s.set_property(r, w, Nl));
                } else throw `invalid inspect type: ${Y}`;
                (rt.y += rt.h), (or.y += rt.h);
              }
            }
          }
          break;
      }
      or.y += or.h + g + 10;
    }
    if (
      (gc.copy(or),
      gc.shrink(3, 28),
      Yr(t, i.add_type_btn, o.panel_layer_2, gc, 0, n))
    ) {
      let d = s.get_type_by_mask(i.add_type_btn.value),
        p = s.add_type_by_name(r, d.name);
      To(t, t.tab, [p]);
    }
    (a.content_height = gc.y + gc.h - e.y + a.scroll_offset_y + 20),
      Vo(t, a, e);
  }
  function E2(t, e, r) {
    let n = Qm.get(t.tab).type_operator,
      i = n[e][`${e}_value`];
    if (i !== void 0) return i;
    if (r.inspect_type === 0)
      switch (r.type) {
        case 3:
        case 2:
        case 4:
          i = new lt();
          break;
        case 5:
          i = new qe();
          break;
        case 1:
          i = new Mi();
          break;
        default:
          throw `invalid property name ${e}`;
      }
    else
      switch (r.inspect_type) {
        case 4:
          i = new P();
          break;
        default:
          throw `invalid inspect type ${r.inspect_type}`;
      }
    return (n[e][`${e}_value`] = i), i;
  }
  var qm = new Map();
  function Fo(t) {
    if (!qm.has(t)) {
      let e = new P(t);
      (e.label.alignment = 33),
        (e.label.padding.w = 10),
        (e.radius = 0),
        qm.set(t, e);
    }
    return qm.get(t);
  }
  var wc = new T(),
    Fn = new x();
  function $a(t) {
    let e = h(we),
      r = ef.get(t);
    if (r === void 0) {
      (r = {}),
        (r.camera = new Ye()),
        e.camera
          ? r.camera.copy(e.camera)
          : r.camera.location.set(150, 70, -150),
        (r.frustum = new Rr()),
        (r.controller = new xl(r.camera)),
        (r.state = 0),
        (r.outline_enable = !1),
        (r.mode = 0),
        (r.preview = new kl()),
        (r.outline_btn = new P()),
        (r.outline_btn.radius = 4),
        (r.transform_location_btn = new P()),
        r.transform_location_btn.radiuses.set(4, 4, 0, 0),
        (r.transform_rotation_btn = new P()),
        (r.transform_rotation_btn.radius = 0),
        (r.transform_scale_btn = new P()),
        r.transform_scale_btn.radiuses.set(0, 0, 4, 4),
        (r.duplicate_btn = new P()),
        r.duplicate_btn.radiuses.set(4, 4, 0, 0),
        (r.delete_btn = new P()),
        r.delete_btn.radiuses.set(0, 0, 4, 4),
        (r.projection_btn = new P()),
        (r.projection_btn.circle = !0),
        (r.projection_btn.radius = 12);
      let o = new Zt();
      (o.icon = !1),
        o.set_option("final", 0),
        o.set_option("entity id", 1),
        (r.view_mode = 0),
        (r.view_mode_select = o),
        (r.avatar = new Br(We("union"))),
        ef.set(t, r);
    }
    return r;
  }
  var ef = new WeakMap();
  function ml(t) {
    return $a(t).mode;
  }
  function Tm(t, e) {
    let r = $a(t);
    r.mode = e;
  }
  function cw(t) {
    return $a(t).state;
  }
  function Wr(t) {
    return $a(t).camera;
  }
  function uw(t) {
    return $a(t).controller;
  }
  function Wi(t) {
    let e = t.tab_rect,
      r = t.tab,
      o = h(we),
      n = $a(r),
      i = n.controller,
      a = vo(r),
      s = h(ee).data_center,
      c = n.camera,
      _ = h(we).dock_system,
      l = n.outline_enable && t.ishovering(Bi),
      u = a.size > 0 && t.ishovering(Fn),
      d =
        t.is_tab_active(r) && t.ishovering(e) && !l && !u && t.hover_layer <= 0;
    Uw(t), ul(s, c), gw(t), Ew(t), ww(t), Iw(t, a), sw(t), lw(t, d), Gw(t);
    let p = S(x);
    switch ((p.copy(e), n.view_mode)) {
      case 1:
        n0(t.buffer, p, Be);
        break;
      default:
        Vt(t.buffer, p, Be);
        break;
    }
    for (let f of a)
      if (s.is_entity_has_type(f, "camera")) {
        kw(t, f, n.preview);
        break;
      }
    if (
      (R(p),
      D2(t),
      t.active === -1 &&
        t.ishovering(t.tab_rect) &&
        (t.key_press.has(49) && (n.state ^= 1),
        t.key_press.has(50) && (n.state ^= 2),
        t.key_press.has(51) && (n.state ^= 4)),
      t.active === -1 &&
        n.mode === 0 &&
        d &&
        ((t.left_mouse_press || t.right_mouse_press) && (n.mode = 1),
        i.move(wc.set(0, (t.mouse_wheel - 1) * 50))),
      n.mode === 1 &&
        d &&
        (i.rotate_horizontal(t.pointer_delta.x / e.w),
        i.rotate_vertical(t.pointer_delta.y / e.h)),
      n.mode === 2 &&
        d &&
        (wc.set(t.pointer_delta.x, -t.pointer_delta.y), i.move(wc)),
      (t.ishovering(e) && t.active === -1) ||
        (t.is_tab_active(r) && n.mode !== 0) ||
        (n.inner && t.active === n.inner.id))
    ) {
      let f = h(Kt);
      i.rotate_horizontal((f.get_input("right_horizontal") / e.w) * 5),
        i.rotate_vertical((f.get_input("right_vertical") / e.h) * 5),
        (t.left_mouse_is_pressed || t.right_mouse_is_pressed) &&
          (wc.set(-f.get_input("direction", 0), -f.get_input("direction", 1)),
          i.move(wc));
    }
    if (
      (i.update(t.delta_time) && (t.needs_update = !0),
      n.mode !== 0 &&
        (t.left_mouse_release || t.right_mouse_release) &&
        (n.mode = 0),
      t.key_press.has(8) && t.active === -1 && d)
    ) {
      let f = h(ee).data_center;
      for (let y of a) ld(f, y);
      To(t, t.tab, []);
    }
    (o.camera = n.camera), al(s);
  }
  Fe(Wi, "ui_tab_edit_view");
  var vc = 32,
    o0 = 24,
    Jm = 128,
    Km = 80,
    Bi = new x();
  function D2(t) {
    let e = ef.get(t.tab),
      r = h(F).theme,
      o = e.outline_btn,
      n = e.transform_location_btn,
      i = e.transform_rotation_btn,
      a = e.transform_scale_btn,
      s = e.delete_btn,
      c = e.duplicate_btn,
      _ = e.camera,
      l = vo(t.tab),
      u = S(x);
    u.copy(t.tab_rect);
    let d = t.buffer.write_clip(u);
    u.copy(t.tab_rect),
      (u.x += 10),
      (u.y += 11),
      (u.w = u.h = vc),
      (u.x += e.outline_enable ? Gm + 10 : 0);
    let p = e.outline_enable ? r.button_active : r.button_state;
    E(t, o, p, u, 0, d) && (e.outline_enable = !e.outline_enable),
      l0(t.buffer, u, d),
      e.outline_enable &&
        (Bi.copy(t.tab_rect),
        (Bi.x += 10),
        (Bi.y += 11),
        (Bi.h = t.tab_rect.h - 22),
        (Bi.w = Gm),
        dw(t, Bi));
    let m = !1;
    if (l.size > 0) {
      let y = 0,
        g = h(ee).data_center;
      for (let v of l) {
        let w = g.get_property(v, "transform.parent");
        if (!l.has(w)) {
          y = v;
          break;
        }
      }
      y !== 0 &&
        (Fn.copy(t.tab_rect),
        (Fn.x += Fn.w - 240 - 5),
        (Fn.y += 6),
        (Fn.h = Fn.h - 11),
        (Fn.w = 240),
        r0(t, Fn, l.values().next().value),
        (m = !0));
    }
    if (
      ((u.y += u.h * 1.5),
      (p = e.state & 1 ? r.button_active : r.button_state),
      E(t, n, p, u, 0, d) && (e.state ^= 1),
      i0(t.buffer, u, d),
      (u.y += u.h + 0.8),
      (p = e.state & 2 ? r.button_active : r.button_state),
      E(t, i, p, u, 0, d) && (e.state ^= 2),
      a0(t.buffer, u, d),
      (u.y += u.h + 0.8),
      (p = e.state & 4 ? r.button_active : r.button_state),
      E(t, a, p, u, 0, d) && (e.state ^= 4),
      s0(t.buffer, u, d),
      (u.y += u.h * 1.5 + 0.8),
      (p = r.button_state),
      E(t, c, p, u, 0, d) && console.log("implement duplicate"),
      c0(t.buffer, u, d),
      (u.y += u.h + 0.8),
      (p = r.button_state),
      E(t, s, p, u, 0, d))
    ) {
      for (let y of l) ld(h(ee).data_center, y);
      To(t, t.tab, []);
    }
    _0(t.buffer, u, d);
    let f = e.view_mode_select;
    if (
      ((u.x += vc * 1.4),
      (u.y = t.tab_rect.y + 11),
      (u.w = 64),
      (u.h = 20),
      Yr(t, f, r.button_state, u, 0, d) && (e.view_mode = f.value),
      u.copy(t.tab_rect),
      (u.x += 20),
      (u.y += u.h - o0 - 20),
      (u.w = u.h = o0),
      wn(t, e.avatar, u, 0, d),
      t.touch_screen)
    ) {
      e.outer === void 0 &&
        ((e.outer = new Br(We("outer"))), (e.inner = new Br(We("inner")))),
        u.copy(t.tab_rect),
        (u.x += 40),
        (u.y += u.h - Jm - 40),
        (u.w = u.h = Jm),
        wn(t, e.outer, u, 0, d);
      let y = (Jm - Km) * 0.5;
      u.copy(t.tab_rect),
        (u.x += 40 + y),
        (u.y += u.h - Km - 40 - y),
        (u.w = u.h = Km);
      let g = h(Kt);
      if (t.active === e.inner.id) {
        let v = S(T);
        v.set(u.x + u.w * 0.5, u.y + u.h * 0.5),
          v.sub(t.mouse_location).mul(-1);
        let w = 0,
          k = 0;
        v.length > y
          ? (v.normalize(), (w = v.x), (k = v.y))
          : ((w = v.x / y), (k = v.y / y)),
          R(v),
          g.set_input("direction", w, 0),
          g.set_input("direction", -k, 1),
          (u.x += w * y),
          (u.y += k * y);
      }
      wn(t, e.inner, u, 0, d) &&
        (g.set_input("direction", 0, 0), g.set_input("direction", 0, 1));
    }
    u.copy(t.tab_rect),
      (u.w = vc),
      (u.h = vc),
      (u.x = t.tab_rect.x + t.tab_rect.w - vc - 10 - (m ? 240 + 5 : 0)),
      (u.y = t.tab_rect.y + 11),
      E(t, e.projection_btn, r.button_state, u, 0, d) &&
        (_.mode = _.mode === 0 ? 1 : 0),
      u.shrink(2),
      _.mode === 0 ? p0(t.buffer, u, d) : u0(t.buffer, u, d),
      R(u);
  }
  var Bl = class {
    constructor(e) {
      this.physics = e;
      this.debug_mode = 0;
      this.line_buffer = new Float32Array(4096 * 128);
      this.color_buffer = new Float32Array(1024 * 128);
      this.vertex_count = 0;
      this.drawLine = (e, r, o) => {
        if (!this.enabled) return;
        let n = this.vertex_count * 3,
          i = this.physics;
        (e = i.wrapPointer(e, i.btVector3)),
          (this.line_buffer[n] = e.x()),
          (this.line_buffer[n + 1] = e.y()),
          (this.line_buffer[n + 2] = e.z()),
          (o = i.wrapPointer(o, i.btVector3)),
          (this.color_buffer[n] = o.x()),
          (this.color_buffer[n + 1] = o.y()),
          (this.color_buffer[n + 2] = o.z()),
          this.vertex_count++,
          (n = this.vertex_count * 3),
          (r = i.wrapPointer(r, i.btVector3)),
          (this.line_buffer[n] = r.x()),
          (this.line_buffer[n + 1] = r.y()),
          (this.line_buffer[n + 2] = r.z()),
          (this.color_buffer[n] = o.x()),
          (this.color_buffer[n + 1] = o.y()),
          (this.color_buffer[n + 2] = o.z()),
          this.vertex_count++;
      };
      this.drawContactPoint = (e, r, o, n, i) => {
        throw "physics debug drawContactPoint need implement.";
      };
      this.reportErrorWarning = (e) => {
        console.warn(this.physics.UTF8ToString(e));
      };
      this.draw3dText = (e, r) => {
        throw "physics debug draw3dText need implement.";
      };
      this.setDebugMode = (e) => {
        this.debug_mode = e;
      };
      this.getDebugMode = () => this.debug_mode;
      let r = {
        attributes: [
          {
            name: "position",
            stride: 3,
            buffer: this.line_buffer,
            dynamic: !0,
          },
          { name: "color", stride: 3, buffer: this.color_buffer, dynamic: !0 },
        ],
      };
      this.draw = ce({ primitive: r, type: 1 });
      let o = e;
      (this.drawer = new o.DebugDrawer()),
        (this.drawer.drawLine = this.drawLine),
        (this.drawer.drawContactPoint = this.drawContactPoint),
        (this.drawer.reportErrorWarning = this.reportErrorWarning),
        (this.drawer.draw3dText = this.draw3dText),
        (this.drawer.setDebugMode = this.setDebugMode),
        (this.drawer.getDebugMode = this.getDebugMode);
    }
    set enabled(e) {
      this.debug_mode = e ? 1 : 0;
    }
    get enabled() {
      return this.debug_mode !== 0;
    }
    bind(e) {
      e.setDebugDrawer(this.drawer), (this.world = e);
    }
    render() {
      if (!this.world || (this.world.debugDrawWorld(), this.vertex_count <= 0))
        return;
      let e = C.CurrentDevice().encoder,
        r = ge("debug");
      e.set_pipeline(r),
        h_(this.draw),
        (this.draw.range.count = this.vertex_count),
        e.set_draw(this.draw),
        (this.vertex_count = 0);
    }
    dispose() {
      this.physics = void 0;
    }
  };
  var ii = new b(),
    ai = new b(),
    Wl = new L(),
    Yo = new $(),
    Ol = class {
      constructor(e) {
        this.world = e;
        this.constraints = [];
        this._mass = 1;
        this.scale = new b(1, 1, 1);
      }
      create_body(e) {
        let r = h(no).Ammo,
          o = new r.btTransform();
        o.setIdentity();
        let n = new r.btVector3(0, 0, 0);
        e.calculateLocalInertia(this.mass, n);
        let i = new r.btDefaultMotionState(o),
          a = new r.btRigidBodyConstructionInfo(this.mass, i, e, n);
        return (
          (this.body = new r.btRigidBody(a)),
          this.world.addRigidBody(this.body),
          this
        );
      }
      set_location(e) {
        if (this.body === void 0) return;
        let r = this.body.getWorldTransform();
        r.getOrigin().setValue(e.x, e.y, e.z),
          this.body.getMotionState().setWorldTransform(r);
      }
      set_rotation(e) {
        if (this.body === void 0) return;
        let r = this.body.getWorldTransform(),
          o = r.getRotation();
        o.setValue(e.x, e.y, e.z, e.w),
          r.setRotation(o),
          this.body.getMotionState().setWorldTransform(r);
      }
      get_location(e) {
        if ((e === void 0 && (e = new b()), this.body === void 0)) return e;
        let o = this.body.getWorldTransform().getOrigin();
        return e.set(o.x(), o.y(), o.z()), e;
      }
      get_rotation(e) {
        if ((e === void 0 && (e = new $()), this.body === void 0)) return e;
        let o = this.body.getWorldTransform().getRotation();
        return e.set(o.x(), o.y(), o.z(), o.w()), e;
      }
      get mass() {
        return this._mass;
      }
      set mass(e) {
        if (this.body === void 0 || e === this._mass) return;
        let r = this.local_inertia;
        this.body.getCollisionShape().calculateLocalInertia(e, r),
          this.body.setMassProps(e, r),
          (this._mass = e);
      }
      get is_active() {
        return this.body === void 0 ? !1 : this.body.isActive();
      }
      reset() {
        if (this.body === void 0) return;
        let e = this.body.getLinearVelocity();
        e.setValue(0, 0, 0), this.body.setLinearVelocity(e);
        let r = this.body.getAngularVelocity();
        r.setValue(0, 0, 0),
          this.body.setAngularVelocity(r),
          this.body.activate(!1);
      }
      create_hinge_constraint(e, r, o, n, i) {
        if (this.body === void 0) return;
        let a = h(no).Ammo,
          s = r;
        d0(s, ii, ai),
          Wl.elements.set([
            ii.x,
            ii.y,
            ii.z,
            0,
            ai.x,
            ai.y,
            ai.z,
            0,
            s.x,
            s.y,
            s.z,
            0,
            0,
            0,
            0,
            1,
          ]),
          Yo.from_mat4(Wl);
        let c = new a.btVector3(e.x, e.y, e.z),
          _ = new a.btQuaternion(Yo.x, Yo.y, Yo.z, Yo.w),
          l = new a.btTransform(_, c),
          u;
        if (o && n && i && o.body) {
          let d = new a.btVector3(n.x, n.y, n.z);
          (s = i),
            d0(s, ii, ai),
            Wl.elements.set([
              ii.x,
              ii.y,
              ii.z,
              0,
              ai.x,
              ai.y,
              ai.z,
              0,
              s.x,
              s.y,
              s.z,
              0,
              0,
              0,
              0,
              1,
            ]),
            Yo.from_mat4(Wl);
          let p = new a.btQuaternion(Yo.x, Yo.y, Yo.z, Yo.w),
            m = new a.btTransform(p, d);
          (u = new a.btHingeConstraint(this.body, o.body, l, m, !1)),
            a.destroy(m),
            a.destroy(p),
            a.destroy(d);
        } else u = new a.btHingeConstraint(this.body, l, !1);
        a.destroy(l),
          a.destroy(_),
          a.destroy(c),
          this.world.addConstraint(u),
          this.constraints.push(u);
      }
      dispose() {
        if (this.body === void 0 || this.world == null) return;
        let r = h(no).Ammo;
        this.world.removeRigidBody(this.body),
          r.destroy(this.body),
          (this.body = void 0);
      }
    },
    EO = new b(),
    DO = new $(),
    GO = new b();
  function d0(t, e, r) {
    let o, n;
    Math.abs(t.z) > 0.7071067811865476
      ? ((o = t.y * t.y + t.z * t.z),
        (n = 1 / Math.sqrt(o)),
        (e.x = 0),
        (e.y = -t.z * n),
        (e.z = t.y * n),
        (r.x = o * n),
        (r.y = -t.x * e.z),
        (r.z = t.x * e.y))
      : ((o = t.x * t.x + t.y * t.y),
        (n = 1 / Math.sqrt(o)),
        (e.x = -t.y * n),
        (e.y = t.x * n),
        (e.z = 0),
        (r.x = -t.z * e.y),
        (r.y = t.z * e.x),
        (r.z = o * n));
  }
  var no = class {
      constructor() {
        this.physics_available = !1;
      }
      async on_register() {
        let e = window.Ammo;
        if (e === void 0) {
          console.error("Ammo Physics Module Not Found.");
          return;
        }
        (this.Module = e), this.reload_ammo();
      }
      async reload_ammo() {
        if (this.Module)
          return (
            (this.Ammo = void 0),
            this.physics_drawer &&
              (this.physics_drawer.dispose(), (this.physics_drawer = void 0)),
            this.Module().then((e) => {
              console.log("<PhysicsAPI> Ammo Module Reloaded."),
                (this.Ammo = e),
                (this.physics_available = !0),
                (this.physics_drawer = new Bl(e)),
                (this.physics_drawer.enabled = !1);
            })
          );
      }
    },
    tf = new WeakMap();
  function qa(t) {
    let e = tf.get(t);
    return (
      e === void 0 &&
        ((e = {}),
        (e.world = m0()),
        (e.rigidbody_map = new Map()),
        tf.set(t, e)),
      e
    );
  }
  function m0() {
    let t = h(no),
      e = t.Ammo;
    if (e === void 0) return;
    let r = new e.btDefaultCollisionConfiguration(),
      o = new e.btCollisionDispatcher(r),
      n = new e.btDbvtBroadphase(),
      i = new e.btSequentialImpulseConstraintSolver(),
      a = new e.btDiscreteDynamicsWorld(o, n, i, r);
    return (
      a.setGravity(new e.btVector3(0, -982, 0)),
      t.physics_drawer.bind(a),
      t.physics_drawer.setDebugMode(0),
      a
    );
  }
  function f0(t) {
    return qa(t).world;
  }
  function h0(t) {
    if (h(no).Ammo === void 0) return;
    qa(t).world !== void 0 && rf(t);
    let r = m0(),
      o = qa(t);
    o.world = r;
    let n = t.query_by_type_names(["physics", "transform"], b0);
    if (n !== void 0)
      for (let i of n) {
        if (!i.get("physics.enabled")) continue;
        let s = i.get("entity.id");
      }
    return r;
  }
  var b0 = new Ce(["entity.id", "physics.rigid", "physics.enabled"]);
  function rf(t) {
    let r = h(no).Ammo;
    if (r === void 0) return;
    let o = qa(t).world;
    if (o === void 0) return;
    let n = t.query_by_type_names(["physics", "transform"], b0);
    if (n !== void 0)
      for (let i of n) {
        if (!i.get("physics.enabled")) continue;
        let s = i.get("entity.id");
        G2(t, s);
      }
    r.destroy(o), tf.delete(t);
  }
  function y0(t, e) {
    let r = qa(t);
    if (r.world === void 0) return;
    let o = r.rigidbody_map.get(e);
    return (
      o === void 0 && ((o = new Ol(r.world)), r.rigidbody_map.set(e, o)), o
    );
  }
  function G2(t, e) {
    let r = qa(t);
    if (r.world === void 0) return;
    let o = r.rigidbody_map.get(e);
    o !== void 0 && o.dispose();
  }
  var Hl = class {
    constructor(e = "", r = 1) {
      this.name = e;
      this.stride = r;
      this.layout = {};
      this.update_size = new T(0, 0);
    }
    alloc(e, r = 1) {
      let o = C.CurrentDevice(),
        n = Float32Array.BYTES_PER_ELEMENT,
        i = e.BYTES_PER_ELEMENT,
        a = Math.ceil((r * i) / n) * n;
      (this.layout.width = a > o.MAX_TEXTURE_SIZE ? o.MAX_TEXTURE_SIZE : a),
        (this.layout.height = Math.ceil(a / this.layout.width));
      let s = this.layout.width * this.layout.height * this.stride;
      if (o.mulit_thread_rendering) {
        let c = new SharedArrayBuffer(s * i);
        this.rw_buffer = new e(c, 0, s);
      } else this.rw_buffer = new e(s);
      return (
        (this.layout.stride = this.stride),
        this.update_size.set(this.layout.width, this.layout.height),
        this.rw_buffer
      );
    }
    create_texture() {
      let e = {
        name: this.name,
        width: this.layout.width,
        height: this.layout.height,
        mag_filter: 9728,
        min_filter: 9728,
        internal_format: 34836,
        format: 6408,
        data_type: 5126,
        source: this.rw_buffer,
        dynamic: !0,
        premultiply_alpha: !1,
        flip_y: !1,
      };
      return (this.texture = Ne(e)), this.texture;
    }
    update() {
      this.texture && td(this.texture, this.rw_buffer, this.update_size);
    }
  };
  var nf = 32,
    Vl = class {
      constructor() {
        this.id = 0;
        this.texture_width = 0;
        this.texture_height = 0;
        this.glyph_index_map = new Map();
        this.glyph_map = new Map();
        this.kerning_map = {};
        this.line_height = 0;
        this.size = 0;
        this.primitive_start = 0;
        this.primitive_end = 0;
      }
      get_glyph(e) {
        return this.glyph_map.get(e);
      }
      compute_size(e, r, o) {
        r === void 0 && (r = new T()), r.set(0, 0), (r.y = this.line_height);
        let n = -1;
        for (let i = 0; i < e.length; ++i) {
          let a = this.glyph_map.get(e.charCodeAt(i));
          a &&
            ((r.x += a.xadvance + this.compute_kerning(n, a.id)),
            (n = a.id),
            o && (o[i] = r.x));
        }
        return r;
      }
      compute_kerning(e, r) {
        let o = this.kerning_map[e];
        return (o && o[r]) || 0;
      }
    };
  var Oi = class {
    constructor() {
      this.primitive_data = new Float32Array();
      this.primitive_data_uint = new Uint32Array();
      this.index_data = new Uint32Array();
      this.primitive_offset = 0;
      this.index_offset = 0;
      this.last_primitive_offset = 0;
      this.last_index_offset = 0;
    }
    resize(e) {
      return (
        (this.primitive_data = new Float32Array(e)),
        (this.primitive_data_uint = new Uint32Array(
          this.primitive_data.buffer,
          0,
          e,
        )),
        (this.index_data = new Uint32Array(e)),
        this
      );
    }
    add_index(e) {
      this.index_data[this.index_offset++] = e;
    }
    write_rect_vertex(e) {
      let r = this.primitive_offset;
      return (
        (this.primitive_data[r] = e.x),
        (this.primitive_data[r + 1] = e.y),
        (this.primitive_data[r + 2] = e.w),
        (this.primitive_data[r + 3] = e.h),
        (this.primitive_data_uint[r + 4] = e.color),
        (this.primitive_data_uint[r + 5] = e.clip >>> 2),
        (this.primitive_offset += 8),
        r
      );
    }
    write_triangle_vertex(e, r = !1) {
      let o = this.primitive_offset;
      return (
        (this.primitive_data[o] = e.x),
        (this.primitive_data[o + 1] = e.y),
        (this.primitive_data_uint[o + 2] = e.color),
        (this.primitive_data_uint[o + 3] = e.clip >>> 2),
        r
          ? ((this.primitive_data[o + 4] = e.u),
            (this.primitive_data[o + 5] = e.v),
            (this.primitive_data_uint[o + 6] = e.type),
            (this.primitive_data_uint[o + 7] = e.offset >>> 2),
            (this.primitive_offset += 8))
          : (this.primitive_offset += 4),
        o
      );
    }
    write_glyph_header(e) {
      let r = this.primitive_offset;
      return (
        (this.primitive_data[r] = e.x),
        (this.primitive_data[r + 1] = e.y),
        (this.primitive_data_uint[r + 2] = e.font),
        (this.primitive_data_uint[r + 3] = e.clip >>> 2),
        (this.primitive_offset += 4),
        r
      );
    }
    write_glyph_vertex(e) {
      let r = this.primitive_offset;
      return (
        (this.primitive_data[r] = e.x_offset),
        (this.primitive_data_uint[r + 1] = e.glyph_index),
        (this.primitive_data_uint[r + 2] = e.color),
        (this.primitive_data[r + 3] = e.scale),
        (this.primitive_offset += 4),
        r
      );
    }
    reset() {
      (this.last_primitive_offset = this.primitive_offset),
        (this.last_index_offset = this.index_offset),
        (this.primitive_offset = 0),
        (this.index_offset = 0);
    }
  };
  function ut(t, e, r) {
    return t | e | (r >>> 2);
  }
  function Hi(t, e, r) {
    return 2147483648 | (t << 26) | e | (r >>> 2);
  }
  function g0(t) {
    return (t & 16777215) << 2;
  }
  var Qa = class extends Oi {
    constructor() {
      super();
      this.index_usage = 0;
      this.primitive_usage = 0;
      this.font_count = 0;
      this.reserved_primitive_offset = 0;
      this.layers = [];
      (this.address_buffer = new Hl("primitive address buffer", 4)),
        this.layers.push(this),
        this.add_layer(new Oi().resize(1024 * 16)),
        this.add_layer(new Oi().resize(1024 * 64)),
        this.add_layer(new Oi().resize(1024 * 4)),
        (this.buffer = this);
    }
    async alloc() {
      (this.primitive_data = this.address_buffer.alloc(Float32Array, 65536)),
        (this.primitive_data_uint = new Uint32Array(
          this.primitive_data.buffer,
          0,
          this.primitive_data.length,
        )),
        (this.primitive_texture = this.address_buffer.create_texture()),
        (this.index_data = new Uint32Array(65536 * 16));
    }
    add_layer(r) {
      (r.buffer = this), this.layers.push(r);
    }
    write_font(r) {
      let o = this.primitive_offset,
        n = r.doc.common.scaleW,
        i = r.doc.common.scaleH,
        a = new Vl();
      (a.id = this.font_count++),
        (a.kerning_map = r.kerning_map),
        (a.texture = r.font_texture),
        (a.texture_width = n),
        (a.texture_height = i),
        (a.primitive_start = o >>> 2),
        (a.line_height = r.doc.common.lineHeight),
        (a.size = r.doc.info.size);
      let s = 8,
        c = 8,
        _ = this.primitive_offset + c + r.chars.length * s;
      (a.primitive_end = _ >>> 2),
        (this.reserved_primitive_offset = _),
        (this.primitive_data[o] = n),
        (this.primitive_data[o + 1] = i),
        (this.primitive_data_uint[o + 2] = a.id);
      let l = this.primitive_offset + c;
      for (let u = 0; u < r.chars.length; ++u) {
        let d = r.chars[u],
          p = l + u * s;
        (this.primitive_data[p] = d.x),
          (this.primitive_data[p + 1] = d.y),
          (this.primitive_data[p + 2] = d.width),
          (this.primitive_data[p + 3] = d.height),
          (this.primitive_data[p + 4] = d.xoffset),
          (this.primitive_data[p + 5] = d.yoffset),
          a.glyph_index_map.set(d.id, p >>> 2),
          a.glyph_map.set(d.id, {
            id: d.id,
            index: u,
            xadvance: d.xadvance,
            xoffset: d.xoffset,
            yoffset: d.yoffset,
            width: d.width,
            height: d.height,
          });
      }
      return (this.primitive_offset = _), a;
    }
    write_clip(r, o = 0) {
      let n = this.primitive_offset;
      if (o === 0)
        (this.primitive_data[n] = r.x),
          (this.primitive_data[n + 1] = r.y),
          (this.primitive_data[n + 2] = r.w),
          (this.primitive_data[n + 3] = r.h);
      else {
        let i = S(x);
        this.read_clip(i, o),
          i.intersect(r),
          (this.primitive_data[n] = i.x),
          (this.primitive_data[n + 1] = i.y),
          (this.primitive_data[n + 2] = i.w),
          (this.primitive_data[n + 3] = i.h),
          R(i);
      }
      return (this.primitive_offset += 4), n;
    }
    read_clip(r, o) {
      r.read(this.primitive_data, o);
    }
    reset() {
      (this.last_primitive_offset = this.primitive_offset),
        (this.last_index_offset = this.index_offset);
      for (let r = 1; r < this.layers.length; ++r) this.layers[r].reset();
      (this.primitive_offset = this.reserved_primitive_offset),
        (this.index_offset = 0);
    }
    update() {
      for (let r = 1; r < this.layers.length; ++r) {
        let o = this.layers[r],
          n = o.index_data;
        if (!(o.index_offset <= 0)) {
          o.index_offset > o.index_data.length &&
            console.warn(`run out of layer buffer ${r}`);
          for (let i = 0; i < o.index_offset; ++i) {
            let a = n[i],
              s = g0(a);
            n[i] = (a & 4278190080) | ((s + this.primitive_offset) >>> 2);
          }
          this.primitive_data.set(o.primitive_data, this.primitive_offset),
            this.index_data.set(n, this.index_offset),
            (this.index_offset += o.index_offset),
            (this.primitive_offset += o.primitive_offset);
        }
      }
      this.index_offset > this.index_data.length &&
        console.warn("run out of primitive buffer"),
        (this.address_buffer.update_size.y = Math.ceil(
          (this.primitive_offset >>> 2) / this.address_buffer.layout.width,
        )),
        this.address_buffer.update(),
        (this.index_usage = this.index_offset / this.index_data.length),
        (this.primitive_usage =
          this.primitive_offset / this.primitive_data.length),
        this.reset();
    }
  };
  var jl = class {
    constructor() {
      this.mouse_location = new T();
      this.mouse_wheel = 1;
      this.mouse_wheel_raw = 0;
      this.rect = new x();
      this.left_mouse_press = !1;
      this.left_mouse_release = !1;
      this.right_mouse_press = !1;
      this.right_mouse_release = !1;
      this.middle_mouse_press = !1;
      this.middle_mouse_release = !1;
      this.next_hover = -1;
      this.next_hover_layer_index = -1;
      this.hover = -1;
      this.hover_layer = -1;
      this.active = -1;
      this.key_pressed = new Set();
      this.key_press = new Set();
      this.buffer = new Qa();
    }
    ishovering(e) {
      return e.contains(this.mouse_location);
    }
    set_active(e) {
      this.active = e;
    }
    clear_active() {
      this.active = -1;
    }
    clear_mouse_state() {}
  };
  var af = class {
      constructor() {
        this.data_center = new xo();
        this.script_instance_pool = new WeakMap();
        this.state = new jl();
        this.data_center.recording = !1;
      }
      get_script_instance(e, r) {
        if (!e || !e.data) return;
        let o = this.script_instance_pool.get(e);
        if (
          (o === void 0 && ((o = []), this.script_instance_pool.set(e, o)),
          r === -1 || !o[r])
        ) {
          let n = {};
          (n.index = o.length),
            e.data.script_class || Li(e.data.code, e),
            (n.instance = new e.data.script_class()),
            (n.reflections = e.data.reflections.map((i) =>
              Object.assign({}, i),
            )),
            (n.enabled = !0),
            (n.updated = !0),
            o.push(n),
            (r = o.length - 1);
        }
        return o[r];
      }
      update_script_instance(e) {
        if (!e.data) return;
        let r = this.script_instance_pool.get(e);
        if (!(r === void 0 || r.length <= 0))
          for (let o = 0; o < r.length; ++o) {
            let n = r[o];
            (n.updated = !0), (n.instance = new e.data.script_class());
          }
      }
    },
    x0 = new WeakMap();
  function Za(t) {
    let e = x0.get(t);
    return e || ((e = new af()), x0.set(t, e)), e;
  }
  var si = class {
    constructor() {
      this.session_mode = "immersive-vr";
      this.xr_supported = !1;
      this.xr_active = !1;
      this.camera = new Ye();
      this.animation_looper = 0;
      this.on_frame = (e, r) => {
        let o = r.session;
        this.animation_looper = o.requestAnimationFrame(this.on_frame);
        let n = C.CurrentDevice(),
          i = n.encoder,
          a = r.getViewerPose(this.ref_space),
          s = o.renderState.baseLayer,
          c = n.gl;
        c.bindFramebuffer(c.FRAMEBUFFER, s.framebuffer), i.clear();
        let _ = this.camera;
        for (let l = 0; l < a.views.length; ++l) {
          (this.view = a.views[l]),
            _.projection_matrix.elements.set(this.view.projectionMatrix);
          let u = this.view.transform.position,
            d = this.view.transform.orientation;
          _.location.set(u.x, u.y, u.z + 5),
            _.rotation.set(d.x, d.y, d.z, d.w),
            _.update_world_matrix(),
            _.update_view_matrix(),
            i.set_camera(_),
            B.fire(ze.BeforeTick),
            B.fire(ze.AfterTick);
        }
      };
      this.on_session_end = () => {
        this.session.cancelAnimationFrame(this.animation_looper),
          (this.xr_active = !1),
          B.fire(oe.XRSessionEnd);
      };
    }
    async on_register() {
      let e = window.navigator.xr;
      if (!e) {
        this.xr_supported = !1;
        return;
      }
      let r = await e.isSessionSupported(this.session_mode);
      if (
        (console.log(
          `<XRAPI> immersive vr ${r ? "supported" : "npt supported"}.`,
        ),
        !r)
      ) {
        this.session_mode = "inline";
        let o = await e.isSessionSupported(this.session_mode);
        if (
          (console.log(
            `<XRAPI> inline vr ${o ? "supported" : "not supported"}.`,
          ),
          !o)
        ) {
          this.xr_supported = !1;
          return;
        }
      }
      this.xr_supported = !0;
    }
    async active() {
      if (this.session === void 0) {
        if (!this.xr_supported) return !1;
        let e = C.CurrentDevice(),
          r = window.navigator.xr;
        try {
          await e.gl.makeXRCompatible();
        } catch {}
        let o = await r.requestSession(this.session_mode);
        console.log(o), o.addEventListener("end", this.on_session_end, !1);
        let n = this.session_mode === "inline" ? "viewer" : "local",
          i = await o.requestReferenceSpace(n);
        console.log(i);
        let a = new XRWebGLLayer(o, e.gl);
        o.updateRenderState({ baseLayer: a }),
          (this.session = o),
          (this.ref_space = i);
      }
      return (
        (this.animation_looper = this.session.requestAnimationFrame(
          this.on_frame,
        )),
        (this.xr_active = !0),
        !0
      );
    }
    bind_current_view_framebuffer() {
      let e = C.CurrentDevice(),
        r = e.encoder,
        o = e.gl,
        n = this.session.renderState.baseLayer;
      o.bindFramebuffer(o.FRAMEBUFFER, n.framebuffer);
      let i = n.getViewport(this.view);
      r.set_viewport(i.x, i.y, i.width, i.height);
    }
  };
  function sf(t, e) {
    let r = Pi(e);
    bo(r.root, (o) => {
      o.transform_updated = !0;
    });
  }
  var w0 = new b(),
    cf = new $(),
    v0 = new b(),
    M2 = new Ce([
      "entity.id",
      "transform.location",
      "transform.rotation",
      "light.direction",
      "light.type",
    ]);
  function I0(t, e) {
    let r = h(Nr).csm,
      o = e.query_by_type_names(["light"], M2);
    if (o !== void 0)
      for (let n of o)
        cf.copy(n.get("transform.rotation")),
          w0.copy(n.get("transform.location")),
          v0.set(0, 1, 0).apply_quaternion(cf).normalize(),
          r.direction.copy(v0).mul(-1),
          r.update_world(w0, cf);
  }
  var C2 = new Ce(["entity.id", "physics.enabled"]),
    T0 = new b(),
    R0 = new $();
  function S0(t, e) {
    let r = h(no);
    if (r.physics_available === !1) return;
    let o = Fi.get(F).engine.abs_delta_time,
      n = e.data_center,
      i = f0(n);
    if (i === void 0) return;
    i.stepSimulation(o);
    let a = n.query_by_type_names(["physics"], C2);
    if (a !== void 0)
      for (let c of a) {
        let _ = c.get("entity.id");
        if (!c.get("physics.enabled")) continue;
        let u = y0(n, _);
        u === void 0 ||
          !u.is_active ||
          (u.get_location(T0),
          u.get_rotation(R0),
          n.set_property(_, "transform.location", T0),
          n.set_property(_, "transform.rotation", R0),
          Ft(n, _));
      }
    let s = r.physics_drawer;
    s && s.enabled && r.physics_drawer.render();
  }
  function F0(t) {
    let e = h(no);
    if (!e.Ammo) return;
    let r = Za(t.tab);
    rf(r.data_center), e.reload_ammo();
  }
  var L2 = new Ce([
      "entity.id",
      "model.model",
      "model.material",
      "model.box",
      "model.visible",
      "transform.location",
      "transform.rotation",
      "transform.scale",
    ]),
    z2 = new Ce([
      "entity.id",
      "camera.fov",
      "camera.aspect",
      "camera.near",
      "camera.far",
      "transform.location",
      "transform.rotation",
      "transform.scale",
    ]),
    _f = new be(),
    A0 = new be();
  function k0(t, e) {
    let o = C.CurrentDevice().encoder,
      n = t.tab_rect,
      i = uf(t.tab),
      a = h(J);
    h(si).xr_active || lf(t, e),
      A0.reset(),
      i.resize(n.w, n.h),
      o.set_camera(i);
    let c = e.query_by_type_names(["model", "transform"], L2);
    if (c === void 0) return;
    let _ = Yn(e, i);
    for (let l of c) {
      let u = l.get("entity.id"),
        d = l.get("model.visible");
      if (_.has(u) || !d) continue;
      let p = yr(l.get("model.model"), tt.Model, a),
        m = yr(l.get("model.material"), tt.Material, a);
      if (!p || !m) continue;
      let f = Ba(m);
      if (!p.draw || !f) continue;
      _f.copy(l.get("model.box")), o.set_pipeline(f);
      let y = er(e, u),
        g = Je(e, u);
      if (!g) continue;
      let v = y.world_matrix.value;
      v.copy(g.world_matrix),
        _f.apply_mat4(v),
        A0.expand_box(_f),
        o.set_draw(p.draw, y);
    }
  }
  function lf(t, e) {
    let r = uf(t.tab),
      o = e.query_by_prototype_name("camera", z2);
    if (o !== void 0)
      for (let a of o) {
        let s = a.get("camera.fov"),
          c = a.get("camera.aspect");
        r.perspective(s, c, r.near, r.far),
          r.location.copy(a.get("transform.location")),
          r.rotation.copy(a.get("transform.rotation")),
          r.scale.set(1, 1, 1);
      }
    r.update_world_matrix(),
      r.update_view_matrix(),
      C.CurrentDevice().encoder.set_camera(r);
  }
  var Xl = class {
    constructor(e, r) {
      this.entity = e;
      this.data = r;
    }
    get name() {
      return this.data.get_property(this.entity, "entity.name");
    }
    set name(e) {
      this.data.set_property(this.entity, "entity.name", e);
    }
  };
  var $l = class {
    constructor(e, r) {
      this.entity = e;
      this.data = r;
    }
    set model_path(e) {
      let o = h(Z).get_node_by_path(e);
      if (o === void 0) return;
      this.data.set_property(this.entity, "model.model", o.resource_uuid);
      let i = h(J).get_resource(o.resource_uuid).data.draw;
      this.data.set_property(this.entity, "model.box", i.box);
    }
    set material_path(e) {
      let o = h(Z).get_node_by_path(e);
      o !== void 0 &&
        this.data.set_property(this.entity, "model.material", o.resource_uuid);
    }
    set base_map_path(e) {
      let o = h(Z).get_node_by_path(e);
      !o ||
        !h(J).get_resource(o.resource_uuid).data ||
        er(this.data, this.entity);
    }
    set visible(e) {
      this.data.set_property(this.entity, "model.visible", e);
    }
    get visible() {
      return !!this.data.get_property(this.entity, "model.visible");
    }
  };
  var P0 = new WeakMap();
  function E0(t) {
    let e = P0.get(t);
    return e === void 0 && ((e = new Map()), P0.set(t, e)), e;
  }
  var ql = class {
    constructor(e, r) {
      this.entity = e;
      this.data = r;
      this._location = new b();
      this._rotation = new vt();
      this._scale = new b(1, 1, 1);
      this._world_location = new b();
      this._world_rotation = new $();
      this._world_scale = new b();
      this._quaternion = new $();
      E0(r).set(e, this), Je(r, e);
    }
    get parent() {
      let e = this.data.get_property(this.entity, "transform.parent");
      return E0(this.data).get(e);
    }
    set parent(e) {
      if (e === void 0) return;
      let r = e.entity;
      this.data.set_property(this.entity, "transform.parent", r),
        G_(this.data, this.entity, r);
    }
    get location() {
      return (
        this.data.get_property(
          this.entity,
          "transform.location",
          this._location,
        ),
        this._location
      );
    }
    set location(e) {
      e !== this._location && (this._location = e),
        this.data.set_property(
          this.entity,
          "transform.location",
          this._location,
        );
    }
    get rotation() {
      return (
        this.data.get_property(
          this.entity,
          "transform.rotation",
          this._quaternion,
        ),
        this._rotation.from_quaternion(this._quaternion),
        this._rotation
      );
    }
    set rotation(e) {
      e !== this._rotation && (this._rotation = e),
        this._quaternion.from_euler(this._rotation),
        this.data.set_property(
          this.entity,
          "transform.rotation",
          this._quaternion,
        );
    }
    get quaternion() {
      return (
        this.data.get_property(
          this.entity,
          "transform.rotation",
          this._quaternion,
        ),
        this._quaternion
      );
    }
    set quaternion(e) {
      e !== this._quaternion && (this._quaternion = e),
        this.data.set_property(
          this.entity,
          "transform.rotation",
          this._quaternion,
        );
    }
    get scale() {
      return (
        this.data.get_property(this.entity, "transform.scale", this._scale),
        this._scale
      );
    }
    set scale(e) {
      e !== this._scale && (this._scale = e),
        this.data.set_property(this.entity, "transform.scale", this._scale);
    }
    get world_location() {
      let e = Je(this.data, this.entity);
      return (
        e &&
          e.world_matrix.decompose(
            this._world_location,
            this._world_rotation,
            this._world_scale,
          ),
        this._world_location
      );
    }
    get world_rotation() {
      let e = Je(this.data, this.entity);
      return (
        e &&
          e.world_matrix.decompose(
            this._world_location,
            this._world_rotation,
            this._world_scale,
          ),
        this._world_rotation
      );
    }
    update(e = !1) {
      e && Ft(this.data, this.entity), Pi(this.data);
    }
  };
  var pf = new Ce(["entity.id", "script.source", "script.instance"]);
  function D0(t, e) {
    let r = e.data_center,
      o = h(J),
      n = h(Kt),
      i = r.query_by_type_names(["script"], pf),
      a = h(F).engine.delta_time;
    if (i)
      for (let s of i) {
        let c = o.get_resource(s.get("script.source"));
        if (c === void 0) continue;
        let _ = s.get("script.instance"),
          l = e.get_script_instance(c, _);
        if (l) {
          if (l.index !== _ || l.updated) {
            let u = s.get("entity.id"),
              d = l.instance;
            df(d, u, r),
              (d.state = t),
              (d.input = n),
              r.set_property(u, "script.instance", l.index);
            try {
              d.on_create && d.on_create();
            } catch (p) {
              console.error(p);
            }
            l.updated = !1;
          }
          if (l.enabled && l.instance.on_update)
            try {
              l.instance.on_update(a, t);
            } catch (u) {
              console.error(u);
            }
        }
      }
    if (((i = r.query_by_type_names(["script"], pf)), i))
      for (let s of i) {
        let c = o.get_resource(s.get("script.source"));
        if (c === void 0) continue;
        let _ = s.get("script.instance"),
          l = e.get_script_instance(c, _);
        if (l && l.enabled && l.instance.on_late_update)
          try {
            l.instance.on_late_update();
          } catch (u) {
            console.error(u);
          }
      }
  }
  function G0(t) {
    let e = t.data_center,
      r = h(J),
      o = e.query_by_type_names(["script"], pf),
      n = new Set();
    if (o)
      for (let i of o) {
        let a = r.get_resource(i.get("script.source"));
        a && n.add(a);
      }
    for (let i of n) t.update_script_instance(i);
  }
  function df(t, e, r) {
    (t.entity = new Xl(e, r)),
      (t.transform = new ql(e, r)),
      r.is_entity_has_type(e, "model") && (t.model = new $l(e, r));
  }
  var he = new x(),
    Ql = new WeakMap();
  function uf(t) {
    return Ql.get(t).camera;
  }
  function N2(t) {
    let e = Ql.get(t.tab);
    return (
      e === void 0 &&
        ((e = {}),
        (e.camera = new Ye()),
        e.camera.location.set(7, 7, 7),
        (e.playing = !1),
        (e.paused = !1),
        Ql.set(t.tab, e)),
      e
    );
  }
  function ci(t, e) {
    let r = C.CurrentDevice(),
      o = r.encoder,
      n = t.tab_rect,
      i = N2(t);
    e === !0 && i.playing === !1 && (U0(t), (i.playing = !0));
    let a = Za(t.tab),
      s = i.playing ? a.data_center : h(ee).data_center,
      c = i.camera;
    if ((sf(t, s), ul(s, c), e)) e !== !0 && o.set_pass(e);
    else {
      o.set_pass(t.renderer.screen_pass);
      let _ = r.pixel_ratio;
      o.set_viewport(n.x * _, r.height - (n.y + n.h) * _, n.w * _, n.h * _);
    }
    k0(t, s),
      I0(t, s),
      i.playing && !i.paused && S0(t, a),
      e
        ? e !== !0 && o.set_pass()
        : (he.copy(n), he.shrink(1), Vt(t.buffer, he, Be), o.set_pass(), B2(t)),
      i.playing && !i.paused && (D0(t, a), (t.needs_update = !0)),
      al(s);
  }
  Fe(ci, "ui_tab_runtime_view");
  var Tt = 24,
    Vi;
  function B2(t) {
    let e = h(si),
      r = Ql.get(t.tab),
      o = h(F).theme;
    if (
      (r.play_btn === void 0 &&
        ((r.play_btn = new P()),
        r.play_btn.radiuses.set(4, 0, 4, 0),
        (r.pause_btn = new P()),
        (r.pause_btn.radius = 0),
        (r.terminate_btn = new P()),
        r.terminate_btn.radiuses.set(0, 4, 0, 4),
        (r.xr_btn = new P()),
        (r.xr_btn.radius = 4)),
      e.xr_active)
    ) {
      he.copy(t.tab_rect),
        (he.x = he.x + he.w - 10 - Tt * 2),
        (he.y = he.y + he.h - 10 - Tt * 1.5),
        (he.w = Tt * 2),
        (he.h = Tt * 1.5),
        E(t, r.xr_btn, o.button_state, he) &&
          (console.log("enter xr", e),
          e.xr_supported && (e.session.end(), e.on_session_end())),
        (he.w = Tt * 2),
        (he.h = Tt * 2),
        (he.y -= Tt * 0.25),
        ff(t.buffer, he);
      return;
    }
    he.copy(t.tab_rect),
      (he.y += Tt >>> 1),
      (he.x += (t.tab_rect.w - Tt * 3 + 0.8 * 2) >> 1),
      (he.w = Tt),
      (he.h = Tt),
      (Vi = r.playing ? o.button_active : o.button_state),
      E(t, r.play_btn, Vi, he) &&
        (r.playing ? ((r.playing = !1), mf(t)) : ((r.playing = !0), U0(t))),
      Ya(t.buffer, he),
      (he.x += Tt + 0.8),
      (Vi = r.playing && r.paused ? o.button_active : o.button_state),
      E(t, r.pause_btn, Vi, he) && r.playing && (r.paused = !r.paused),
      Zl(t.buffer, he),
      (he.x += Tt + 0.8),
      (Vi = o.button_state),
      E(t, r.terminate_btn, Vi, he) && ((r.playing = !1), mf(t)),
      Yl(t.buffer, he),
      he.copy(t.tab_rect),
      (he.x = he.x + he.w - 10 - Tt * 2),
      (he.y = he.y + he.h - 10 - Tt * 1.5),
      (he.w = Tt * 2),
      (he.h = Tt * 1.5),
      E(t, r.xr_btn, Vi, he) &&
        (console.log("enter xr", e),
        e.xr_supported && (h(F).engine.pause(), e.active())),
      (he.w = Tt * 2),
      (he.h = Tt * 2),
      (he.y -= Tt * 0.25),
      ff(t.buffer, he),
      r.playing === !0 &&
        t.key_press.has(27) &&
        ((r.playing = !1), mf(t), t.key_press.delete(27));
  }
  function U0(t) {
    let e = Za(t.tab),
      r = h(ee).data_center,
      o = e.data_center;
    o.copy(r), $x(r, o), sf(t, o), h0(o);
    let n = window;
    (n.create_object = function (i) {
      let a = {},
        s = o.create_entity_with_prototype_name(i);
      return df(a, s, o), Je(o, s), a;
    }),
      (n.global = {}),
      G0(e),
      lf(t, o);
  }
  function mf(t) {
    let e = Za(t.tab);
    F0(t), Cy(e.data_center);
  }
  var hf, M0, Ja;
  function C0(t, e) {
    !t ||
      !t.data ||
      !t.data.pipeline ||
      B.once(ze.AfterFrame, () => {
        hf ||
          ((hf = { world_matrix: { value: new L() } }),
          (M0 = {
            color_map: { value: We("default") },
            world_matrix: {
              value: new L().compose(
                new b(0, -0.8, 0),
                new $(),
                new b(10, 0.01, 10),
              ),
            },
          }),
          (Ja = new Ye()),
          (Ja.near = 1),
          (Ja.far = 100),
          Ja.location.set(0.2, 1, 1).normalize().mul(3),
          Ja.look_at(b.ZERO));
        let r = _i(),
          o = t.data.pipeline,
          n = ge("default"),
          i = Ro("box"),
          a = Ro("sphere"),
          s = C.CurrentDevice().encoder,
          c = s.camera;
        s.set_pass(r),
          s.set_viewport(e.x, e.y, e.width, e.height),
          s.set_camera(Ja),
          s.set_pipeline(n),
          s.set_draw(i, M0),
          s.set_pipeline(o),
          s.set_draw(a, hf),
          s.set_pass(),
          c && s.set_camera(c);
      });
  }
  var Jl, li;
  function L0(t, e) {
    B.once(ze.AfterFrame, () => {
      let r = t.data;
      if (!r || !r.draw) return;
      let o = r.draw,
        n = _i(),
        i = C.CurrentDevice().encoder,
        a = i.camera;
      i.set_pass(n), i.set_viewport(e.x, e.y, e.width, e.height);
      let s = S(be);
      s.copy(o.box),
        W2(s),
        R(s),
        i.set_pipeline(ge("preview")),
        i.set_camera(li),
        i.set_draw(o, Jl),
        i.set_pass(),
        a && i.set_camera(a);
    });
  }
  function W2(t) {
    li ||
      ((li = new Ye()),
      (li.near = 1),
      (li.far = 1e4),
      (Jl = {
        base_color: { value: new H().set_hex(7851212) },
        world_matrix: { value: new L() },
      }));
    let e = Math.max(t.size.x, t.size.y, t.size.z),
      r = Math.min(t.size.x, t.size.y, t.size.z);
    if (e < 10) {
      let a = S(b),
        s = 10 / e;
      a.set(s, s, s),
        Jl.world_matrix.value.compose(b.ZERO, $.Identity, a),
        a.mul_v(t.size),
        t.set_size(a),
        R(a);
    } else if (r > 100) {
      let a = S(b),
        s = 100 / r;
      a.set(s, s, s),
        Jl.world_matrix.value.compose(b.ZERO, $.Identity, a),
        a.mul_v(t.size),
        t.set_size(a),
        R(a);
    }
    let n = t.size.length * 4,
      i = Math.atan(li.vertical_fov * cr * 0.5) * n;
    li.location.set(1, 0.8, 1).normalize().mul(i), li.look_at(t.center);
  }
  var Kl = new be(),
    eu = new Ye(),
    z0 = new L(),
    tu = new b(),
    N0 = new b(),
    B0 = new $();
  function W0(t, e) {
    !t ||
      !t.data ||
      !t.data.skeleton ||
      B.once(ze.AfterFrame, () => {
        let r = t.data.skeleton,
          o = _i(),
          n = C.CurrentDevice().encoder,
          i = Ro("bone"),
          a = n.camera,
          s = {
            world_matrix: { value: z0 },
            base_color: { value: new H().set_hex(10593189) },
          };
        n.set_pass(o),
          n.set_viewport(e.x, e.y, e.width, e.height),
          n.set_pipeline(ge("model_icon")),
          ya(r.bones[0]),
          Kl.reset();
        for (let l of r.bones) Kl.expand_point(l.world_location);
        let c = Kl.size.length * 4,
          _ = Math.atan(eu.vertical_fov * cr * 0.5) * c;
        eu.location.set(1, 0.8, 1).normalize().mul(_),
          eu.look_at(Kl.center),
          n.set_camera(eu);
        for (let l of r.bones)
          if (l.children.length > 0)
            for (let u of l.children) {
              b.Subtract(u.world_location, l.world_location, tu);
              let d = tu.length;
              N0.set(d, d, d),
                tu.normalize(),
                B0.from_unit_vectors(b.NEGATIVE_Z, tu),
                z0.compose(l.world_location, B0, N0),
                n.set_draw(i, s);
            }
        n.set_pass(), a && n.set_camera(a);
      });
  }
  var O0 = new WeakMap();
  function H0(t, e) {
    B.once(ze.AfterFrame, () => {
      let r = t.data;
      if (!r || !r.texture) return;
      let o = r.texture,
        n = O0.get(o);
      n || ((n = { color_map: { value: o } }), O0.set(o, n));
      let i = _i(),
        a = C.CurrentDevice().encoder;
      a.set_pass(i),
        a.set_viewport(e.x, e.y, e.width, e.height),
        a.set_pipeline(ge("ui_copy")),
        a.set_draw(Ro("screen"), n),
        a.set_pass();
    });
  }
  var V0 = 128;
  function j0(t, e, r, o, n = 0, i = 0) {
    let a = ru(e);
    a && X0(t.buffer.layers[n], r, a, o, i);
  }
  var bf = new Map();
  function ru(t) {
    let r = Qt().atlas_packer;
    if (!bf.has(t.uuid)) {
      let o = r.add(V0, V0);
      switch (t.type) {
        case 1:
          L0(t, o);
          break;
        case 6:
          break;
        case 5:
          H0(t, o);
          break;
        case 2:
          C0(t, o);
          break;
        case 9:
          W0(t, o);
          break;
        default:
          break;
      }
      bf.set(t.uuid, new x(o.x, o.y, o.width, o.height));
    }
    return bf.get(t.uuid);
  }
  function _i() {
    return Qt().atlas_pass;
  }
  var O2 = 20,
    H2 = 304,
    V2 = 240,
    ou = 32,
    Ic = 56,
    nu = 32,
    $0 = 5,
    Jo = 4,
    iu = class {
      constructor() {
        this.guid = "";
        this.rect = new x(0, 0, H2, V2);
        this.radiuse = 6;
        this.input = new qe("");
        this.visible = !1;
        this.detail_btn = new P("");
        this.grid_btn = new P("");
        this.scroll_view = new Ar();
        this.grid_view_type = 0;
        this.valid_resources = [];
        this.last_search = "";
        this.needs_search = !1;
        this.request_id = -1;
        this.request_type = 0;
        (this.input.alignment = 33),
          (this.input.padding_left = 4),
          this.detail_btn.radiuses.set(4, 0, 4, 0),
          this.grid_btn.radiuses.set(0, 4, 0, 4);
      }
      disable() {
        (this.request_id = -1),
          (this.visible = !1),
          (this.input.text = ""),
          (this.last_search = "");
      }
      enable(e, r) {
        (this.visible = !0),
          (this.needs_search = !0),
          (this.request_id = e),
          (this.request_type = r);
      }
    };
  function Q0(t, e) {
    if (!e.visible) return !1;
    let r = !1,
      o = h(F).theme,
      {
        rect: n,
        input: i,
        last_search: a,
        needs_search: s,
        request_type: c,
        detail_btn: _,
        grid_btn: l,
        scroll_view: u,
      } = e,
      d = t.buffer.write_clip(n),
      p = S(x),
      m = S(x),
      f = S(x),
      y = S(x);
    p.copy(n).expand(O2), q(t.buffer, o.button_state, n, e.radiuse);
    let g = 2,
      v = t.buffer.layers[g];
    t.ishovering(n) && (t.next_hover_layer_index = g);
    let w = t.left_mouse_press && !t.ishovering(p);
    if (t.active === -1 && (t.key_press.has(27) || w))
      return e.disable(), t.clear_active(), r;
    if (
      (p.copy(n),
      (p.h = ou),
      p.shrink(4),
      (p.w -= p.h * 2 + 4),
      At(t, i, o.input, p, g),
      (p.x += p.w + 2),
      (p.w = p.h),
      E(t, _, o.input, p, g) && (e.grid_view_type = 1),
      au(t.buffer.layers[g], p),
      (p.x += p.w + 2),
      E(t, l, o.input, p, g) && (e.grid_view_type = 0),
      su(t.buffer.layers[g], p),
      (e.needs_search = s || i.text !== a),
      e.needs_search)
    ) {
      e.valid_resources.length = 0;
      let G = h(J).get_typed_resource(c);
      for (let U of G) e.valid_resources.push(U);
      (e.last_search = i.text), (e.needs_search = !1);
    }
    let k = e.valid_resources.length;
    if (k > 0) {
      if (
        (m.copy(n),
        (m.y += ou),
        (d = t.buffer.write_clip(m, d)),
        (m.x += Jo),
        e.grid_view_type === 0)
      ) {
        u.content_height = Math.ceil(k / $0) * Ic;
        let D = 0;
        (m.y -= u.scroll_offset_y), (m.w = Ic), (m.h = Ic);
        for (let G of e.valid_resources) {
          let U = ru(G);
          U !== void 0 &&
            (yf(v, m, U, 4, d),
            t.active === -1 &&
              t.ishovering(m) &&
              (Ee(v, o.white, m, 4, d),
              t.left_mouse_press &&
                (e.disable(), t.clear_mouse_state(), (r = !0))),
            (m.x += Ic + Jo),
            D >= $0 - 1 && ((m.x = n.x + Jo), (m.y += Ic + Jo), (D = 0)),
            D++);
        }
      } else if (e.grid_view_type === 1) {
        (u.content_height = k * nu + (k - 1) * Jo),
          (m.y -= u.scroll_offset_y),
          (m.w = n.w - Jo * 2),
          (m.h = nu);
        for (let D of e.valid_resources) {
          let G = ru(D);
          G !== void 0 &&
            (y.copy(m),
            (y.w = nu),
            yf(v, y, G, 4, d),
            t.active === -1 &&
              t.ishovering(m) &&
              (Ee(v, o.white, m, 4, d),
              t.left_mouse_press &&
                (e.disable(), t.clear_mouse_state(), (r = !0))),
            (m.y += nu + Jo));
        }
      }
      f.copy(n),
        (f.y += ou),
        (f.x += Jo),
        (f.w = n.w - Jo * 2),
        (f.h = n.h - ou - Jo * 4),
        Vo(t, u, f, g);
    }
    return R(p), R(m), R(f), R(y), r;
  }
  var j2 = 400,
    X2 = 280;
  var $2 = 5,
    cu = class {
      constructor() {
        this.rect = new x(
          window.innerWidth * 0.5,
          window.innerHeight * 0.5,
          j2,
          X2,
        );
        (this.input = new qe("")),
          (this.input.alignment = 33),
          (this.input.padding_left = $2),
          (this.id = Ie(this));
      }
    },
    V9 = new x();
  var P = class extends Yt {
      constructor(r = "") {
        super();
        this.type = 0;
        this.shadow = !1;
        this.radiuses = new M(3, 3, 3, 3);
        this.circle = !1;
        this.dragging = !1;
        this.label = new re(r);
      }
      set radius(r) {
        this.radiuses.elements.fill(r);
      }
    },
    Z0 = new Map();
  function ex(t) {
    let e = Z0.get(t);
    return e || ((e = new P(t)), Z0.set(t, e)), e;
  }
  function E(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = e.id,
      c = S(de),
      _ = S(T);
    if ((e.circle && _.set(o.x + o.w * 0.5, o.y + o.h * 0.5), e.shadow)) {
      let p = h(F).theme;
      e.circle ? Fr(a, p.shadow, _, o.w * 0.5, i) : q(a, p.shadow, o, 8, i);
    }
    c.copy(r);
    let l = !1,
      u = t.ishovering(o);
    u &&
      n >= t.hover_layer &&
      ((t.next_hover = s), (t.next_hover_layer_index = n));
    let d = t.active === s;
    return (
      t.active === -1 && t.hover === s && c.color.copy(r.hover_color),
      t.hover === s && t.left_mouse_press && t.set_active(s),
      d && c.color.copy(r.active_color),
      d &&
        t.left_mouse_release &&
        (e.type === 1
          ? ((l = u && t.check_double_click(s)), t.set_double_click_id(s))
          : (l = t.hover === s),
        t.clear_active()),
      e.radiuses.all_zero()
        ? O(a, c, o, i)
        : e.circle
          ? Fr(a, c, _, o.w * 0.5, i)
          : ue(a, c, o, e.radiuses, i),
      V(t, e.label, o, n, i),
      R(c),
      R(_),
      l
    );
  }
  function V_(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = e.id;
    e.dragging = !1;
    let c = S(de),
      _ = S(T),
      l = S(x),
      u = S(x),
      d = S(T);
    if ((e.circle && _.set(o.x + o.w * 0.5, o.y + o.h * 0.5), e.shadow)) {
      let y = h(F).theme;
      e.circle ? Fr(a, y.shadow, _, o.w * 0.5, i) : q(a, y.shadow, o, 8, i);
    }
    c.copy(r);
    let p = !1,
      m = t.ishovering(o) && n >= t.hover_layer;
    m &&
      (t.active === -1 || mc(e)) &&
      ((t.next_hover = s), (t.next_hover_layer_index = n));
    let f = t.active === s;
    if (
      (t.active === -1 && m && c.color.copy(r.hover_color),
      t.hover === s &&
        t.left_mouse_press &&
        (c.color.copy(r.active_color),
        !f && t.active === -1 && d.copy(t.mouse_location),
        t.set_active(s)),
      f &&
        t.left_mouse_release &&
        (e.type === 1
          ? ((p = m && t.check_double_click(s)), t.set_double_click_id(s))
          : (p = m),
        t.clear_active(),
        !m))
    ) {
      let y = t.hover;
      if (y !== -1) {
        let g = gn(y);
        if (Vw(e)) {
          let v = e.drag_end(g);
          mc(g) && g.drop(v);
        }
      }
    }
    if ((u.copy(o), f && !m)) {
      n++;
      let y = t.mouse_location;
      (e.dragging = !0),
        (u.x += y.x - d.x),
        (u.y += y.y - d.y),
        c.color.copy(r.active_color),
        (c.color.a = 0.7);
    }
    return (
      e.radiuses.all_zero()
        ? O(a, c, u, i)
        : e.circle
          ? Fr(a, c, _, l.w * 0.5, i)
          : ue(a, c, u, e.radiuses, i),
      V(t, e.label, u, n, i),
      R(c),
      R(_),
      R(l),
      R(u),
      R(d),
      p
    );
  }
  function Y0(t, e, r, o, n = 0) {
    let i = t.buffer.layers[n],
      a = r.id,
      s = S(de);
    s.copy(e);
    let c = !1;
    return (
      t.ishovering(o) &&
        n >= t.hover_layer &&
        ((t.next_hover = a),
        (t.next_hover_layer_index = n),
        s.color.copy(e.hover_color)),
      t.hover === a &&
        t.left_mouse_press === !0 &&
        (s.color.copy(e.active_color),
        t.clear_active(),
        (c = t.ishovering(o)),
        t.clear_mouse_state()),
      ue(i, s, o, r.radiuses),
      V(t, r.label, o, n),
      R(s),
      c
    );
  }
  function gf(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = r.active_button,
      c = s.id,
      _ = t.mouse_location,
      l = h(F).theme,
      u = S(de),
      d = S(x),
      p = S(x),
      m = S(M);
    u.copy(e);
    let f = !1,
      y = t.ishovering(o);
    y &&
      n >= t.hover_layer &&
      ((t.next_hover = c), (t.next_hover_layer_index = n)),
      y && t.active === -1 && u.color.copy(e.hover_color);
    let g = t.active === c;
    if (
      (g &&
        t.left_mouse_release === !0 &&
        ((f = o.contains(t.mouse_location)), t.clear_active()),
      t.hover === c &&
        t.left_mouse_press &&
        !t.left_mouse_release &&
        t.set_active(c),
      g && u.color.copy(e.active_color),
      g && !t.ishovering(o))
    ) {
      let v = t.buffer.layers[1],
        w = h(we).dock_system;
      if (w.hover_dock_node !== -1) {
        let k = gn(w.hover_dock_node);
        if (nr.is(k) && k.is_leaf) {
          t.left_mouse_release && k.drop(r, _);
          let D = k.rect;
          _.y > D.y + Ht
            ? (d.copy(D),
              (d.y = d.y + Ht),
              (d.h -= Ht),
              p.copy(d),
              (p.w *= 0.5),
              (p.h *= 0.5),
              (p.x += p.w * 0.5),
              (p.y += p.h * 0.5),
              d.shrink(1),
              p.contains(_)
                ? q(v, l.background_float, d, Be)
                : (_.y < p.y
                    ? (d.h = p.h)
                    : _.y > p.y + p.h
                      ? ((d.h = p.h), (d.y += p.h))
                      : _.x < p.x
                        ? (d.w = p.w)
                        : ((d.w = p.w), (d.x += p.w)),
                  q(v, l.background_float, d, Be)))
            : ue(v, l.background_float, d, s.radiuses);
        } else ue(v, l.background_float, d, s.radiuses);
        d.copy(o),
          (d.x = _.x - o.w * 0.5),
          (d.y = _.y - o.h * 0.5),
          V(t, s.label, d, 1);
      }
    }
    return (
      ue(a, u, o, s.radiuses, i),
      V(t, s.label, o, n, i),
      R(u),
      R(d),
      R(p),
      R(m),
      f
    );
  }
  var Ke = new x(),
    io = new x(),
    xf = 2,
    _u = 32,
    nr = class extends Kc {
      constructor() {
        super();
        this.is_dock_node = !0;
        this.rect = new x();
        this.tabs = [];
        this.active_tab = -1;
        this.split_direction = 0;
        this.can_be_split = !0;
        this.id = Ie(this);
      }
      static is(r) {
        return r && r.is_dock_node === !0;
      }
      add_tab(r) {
        if (this.has_tab(r)) return;
        let o = r;
        o.node && o.node.close_tab(r),
          (o.node = this),
          this.tabs.push(r),
          (this.active_tab = this.tabs.length - 1);
      }
      close_tab(r) {
        let o = this.tabs.indexOf(r);
        o !== void 0 &&
          o > -1 &&
          (this.tabs.splice(o, 1),
          (this.active_tab = o - 1),
          this.active_tab < 0 && this.active_tab++,
          (r.node = void 0)),
          this.tabs.length <= 0 && Y2(this);
      }
      has_tab(r) {
        return this.tabs.indexOf(r) > -1;
      }
      swap_tab(r, o) {
        r === this.active_tab
          ? (this.active_tab = o)
          : o === this.active_tab && (this.active_tab = r);
        let n = this.tabs[r];
        (this.tabs[r] = this.tabs[o]), (this.tabs[o] = n);
      }
      drop(r, o) {
        if (o === void 0 || !this.rect.contains(o)) return;
        let n = r;
        if (o.y < this.rect.y + Ht) {
          n.node !== this && this.add_tab(r);
          let i = this.rect.x + 10,
            a = -1;
          for (let s = 0; s < this.tabs.length; ++s) {
            Ke.copy(this.rect), (Ke.h = Ht);
            let c = this.tabs[s];
            if (
              ((Ke.x = i),
              (Ke.w = n.active_button.label.text_size.x + 50),
              (i += Ke.w + 5),
              Ke.contains(o))
            ) {
              a = s;
              break;
            }
          }
          a !== -1 && this.swap_tab(this.tabs.length - 1, a);
        } else {
          if (n.node === this && this.tabs.length <= 1) return;
          if (
            (Ke.copy(this.rect),
            io.copy(Ke),
            (io.w *= 0.5),
            (io.h *= 0.5),
            (io.x += io.w * 0.5),
            (io.y += io.h * 0.5),
            io.contains(o))
          )
            n.node !== this && this.add_tab(r);
          else {
            if (n.node === this && this.tabs.length <= 1) return;
            let i;
            o.y < io.y
              ? (i = wf(this))
              : o.y > io.y + io.h
                ? (i = q2(this))
                : o.x < io.x
                  ? (i = Q2(this))
                  : (i = Z2(this)),
              i.add_tab(r),
              h(we).dock_system.resize();
          }
        }
      }
      resize(r, o, n, i) {
        if ((this.rect.set(r, o, n, i), this.left && this.right)) {
          let a = this.left.rect.x,
            s = this.left.rect.y,
            c = this.left.rect.w,
            _ = this.left.rect.h,
            l = this.right.rect.x,
            u = this.right.rect.y,
            d = this.right.rect.w,
            p = this.right.rect.h;
          if (this.split_direction === 2) {
            let m = n / this.rect.w;
            (_ = p = i),
              (s = u = o),
              (c = this.left.rect.w * m),
              (d = n - c - pe),
              (a = r),
              (l = a + c + pe);
          } else if (this.split_direction === 1) {
            let m = i / this.rect.h;
            (c = d = n),
              (a = l = r),
              (_ = this.left.rect.h * m),
              (p = i - _ - pe),
              (s = o),
              (u = s + _ + pe);
          }
          this.left.resize(a, s, c, _), this.right.resize(l, u, d, p);
        }
      }
      hover_spacing(r) {
        return this.left && this.right
          ? this.split_direction === 1
            ? r.y > this.left.rect.y + this.left.rect.h - pe &&
              r.y < this.right.rect.y + pe &&
              r.x > this.rect.x &&
              r.x < this.rect.x + this.rect.w
            : this.split_direction === 2
              ? r.x > this.left.rect.x + this.left.rect.w - pe &&
                r.x < this.right.rect.x + pe &&
                r.y > this.rect.y &&
                r.y < this.rect.y + this.rect.h
              : !1
          : !1;
      }
      split_aspect(r) {
        if (!(this.left && this.right)) return;
        let o = this.left.rect.x,
          n = this.left.rect.y,
          i = this.left.rect.w,
          a = this.left.rect.h,
          s = this.right.rect.x,
          c = this.right.rect.y,
          _ = this.right.rect.w,
          l = this.right.rect.h;
        this.split_direction === 1
          ? ((a = this.rect.h * r - xf),
            (l = this.rect.h - a - pe),
            (c = n + a + pe))
          : this.split_direction === 2 &&
            ((i = this.rect.w * r - xf),
            (_ = this.rect.w - i - pe),
            (s = o + i + pe)),
          this.left.resize(o, n, i, a),
          this.right.resize(s, c, _, l);
      }
      resize_with_point(r) {
        if (!(this.left && this.right)) return;
        let o = this.left.rect.x,
          n = this.left.rect.y,
          i = this.left.rect.w,
          a = this.left.rect.h,
          s = this.right.rect.x,
          c = this.right.rect.y,
          _ = this.right.rect.w,
          l = this.right.rect.h;
        this.split_direction === 1
          ? ((a = Q(r.y - n, _u + Ht, this.rect.h - _u - Ht)),
            (c = n + a + xf),
            (l = this.rect.h - a - pe))
          : this.split_direction === 2 &&
            ((i = Q(r.x - o, _u, this.rect.w - _u)),
            (s = o + i + pe),
            (_ = this.rect.w - i - pe)),
          this.left.resize(o, n, i, a),
          this.right.resize(s, c, _, l);
      }
      render_tab_well(r, o) {
        let n = h(we).dock_system,
          i = h(F).theme,
          a = this.rect.x + 10,
          s = -1;
        for (let c = 0; c < this.tabs.length; ++c) {
          Ke.copy(this.rect), (Ke.h = Ht);
          let _ = this.tabs[c];
          (Ke.x = a),
            (Ke.w = _.active_button.label.text_size.x + 50),
            (a += Ke.w + 5),
            c === this.active_tab && n.active_dock_node === this.id
              ? gf(r, i.tab, _, Ke, 0, o) &&
                r.next_hover_layer_index <= 0 &&
                n.set_active(this.id)
              : gf(r, i.tab_inactivated, _, Ke, 0, o) &&
                ((this.active_tab = c),
                r.next_hover_layer_index <= 0 && n.set_active(this.id)),
            (Ke.x = Ke.x + Ke.w - 20),
            (Ke.y = Ke.y + (Ke.h - 14) * 0.5),
            (Ke.w = Ke.h = 14),
            E(r, _.close_button, i.button_icon, Ke, 0, o) &&
              ((s = c), B.fire(In.TabClosed, this.tabs[c])),
            _.changed === !1
              ? jn(r.buffer, Ke, o)
              : (Ke.shrink(3), q(r.buffer, i.white, Ke, 3, o));
        }
        this.close_tab(this.tabs[s]);
      }
    };
  function wf(t) {
    let e = (t.rect.h - pe) * 0.5,
      r = lu(t);
    return (
      r.rect.copy(t.rect),
      (r.split_direction = 1),
      (r.left = new nr()),
      (r.right = t),
      r.left.rect.copy(r.rect),
      (r.left.rect.h = e),
      r.right.rect.copy(r.left.rect),
      (r.right.rect.y = r.left.rect.y + e + pe),
      r.left
    );
  }
  function q2(t) {
    let e = (t.rect.h - pe) * 0.5,
      r = lu(t);
    return (
      r.rect.copy(t.rect),
      (r.split_direction = 1),
      (r.left = t),
      (r.right = new nr()),
      r.left.rect.copy(r.rect),
      (r.left.rect.h = e),
      r.right.rect.copy(r.left.rect),
      (r.right.rect.y += e + pe),
      r.right
    );
  }
  function Q2(t) {
    let e = (t.rect.w - pe) * 0.5,
      r = lu(t);
    return (
      r.rect.copy(t.rect),
      (r.split_direction = 2),
      (r.left = new nr()),
      (r.right = t),
      r.left.rect.copy(r.rect),
      (r.left.rect.w = e),
      r.right.rect.copy(r.left.rect),
      (r.right.rect.x += e + pe),
      r.left
    );
  }
  function Z2(t) {
    let e = (t.rect.w - pe) * 0.5,
      r = lu(t);
    return (
      r.rect.copy(t.rect),
      (r.split_direction = 2),
      (r.left = t),
      (r.right = new nr()),
      r.left.rect.copy(r.rect),
      (r.left.rect.w = e),
      r.right.rect.copy(r.left.rect),
      (r.right.rect.x += e + pe),
      r.right
    );
  }
  function lu(t) {
    if (t.is_root) {
      let e = h(we).dock_system,
        r = new nr();
      return (e.root = r), (t.parent = void 0), r;
    } else {
      let e = new nr();
      if (((e.parent = t.parent), t === t.parent.left)) t.parent.left = e;
      else if (t === t.parent.right) t.parent.right = e;
      else throw "invalid situation";
      return (t.parent = void 0), e;
    }
  }
  function Y2(t) {
    let e = t.parent;
    if (e === void 0) return e;
    if (e.is_root === !0) {
      let r = Bp(t),
        o = h(we).dock_system;
      o.root = r;
      let n = e.rect;
      return (
        o.root.resize(n.x, n.y, n.w, n.h),
        (t.parent = void 0),
        (r.parent = void 0),
        e
      );
    } else {
      let r = Bp(t);
      if (e === e.parent.left) e.parent.left = r;
      else if (e === e.parent.right) e.parent.right = r;
      else throw "invalid situation";
      return r.rect.copy(e.rect), (t.parent = void 0), r;
    }
  }
  var uu = class {
    constructor(e, r) {
      this.state = e;
      this.root = new nr();
      this.hover_dock_node = -1;
      this.next_hover_dock_node = -1;
      this._active_dock_node = -1;
      r && this.root.rect.copy(r),
        (this.hint_font = hr(zr).clone()),
        (this.hint_font.size = 42),
        (this.hint_text = new re("Create View From Main Menu.")),
        (this.hint_text.font = this.hint_font),
        (this.hint_text.alignment = 3),
        B.on(oe.Resize, (o) => {
          this.root.resize(
            pe,
            Ut + pe,
            o.width - pe * 2,
            o.height - pe * 2 - Ut - Sr,
          );
        }),
        pu(C.CurrentDevice().canvas, this.on_file_drop);
    }
    get active_dock_node() {
      return this._active_dock_node;
    }
    set_active(e) {
      this._active_dock_node = e;
    }
    on_file_drop(e) {
      for (let r = 0; r < e.length; ++r) {
        let o = e[r];
      }
      B.fire(oe.ForceUpdate);
    }
    get_active_dock(e) {
      return (
        (e = e ?? this.root),
        e.is_leaf
          ? e
          : this.get_active_dock(e.left) || this.get_active_dock(e.right)
      );
    }
    render() {
      (this.state.cursor_type = "auto"),
        this.render_node(this.state, this.root),
        (this.hover_dock_node = this.next_hover_dock_node),
        (this.next_hover_dock_node = -1);
    }
    resize(e, r, o, n) {
      let i = this.root.rect;
      (e = e === void 0 ? i.x : e),
        (r = r === void 0 ? i.y : r),
        (o = o === void 0 ? i.w : o),
        (n = n === void 0 ? i.h : n),
        this.root.resize(e, r, o, n);
    }
    render_node(e, r) {
      if (!r) return;
      let o = h(F).theme;
      if (
        (e.ishovering(r.rect) &&
          0 >= e.hover_layer &&
          (this.next_hover_dock_node = r.id),
        r.left && r.right)
      )
        e.hover === r.id &&
          (r.split_direction === 2
            ? (e.cursor_type = "col-resize")
            : r.split_direction === 1 && (e.cursor_type = "row-resize"),
          e.left_mouse_press && e.set_active(r.id)),
          e.active === r.id &&
            (e.left_mouse_release
              ? e.clear_active()
              : r.resize_with_point(this.state.mouse_location)),
          this.render_node(e, r.left),
          this.render_node(e, r.right),
          r.hover_spacing(this.state.mouse_location) &&
            0 >= e.hover_layer &&
            (e.next_hover = r.id);
      else {
        if (r.left || r.right)
          throw "dock node cannot be only one node, code bug.";
        {
          let n = S(x),
            i = e.buffer.write_clip(r.rect);
          if (
            (r.tabs.length > 0 &&
              (n.copy(r.rect),
              (n.y += Ht),
              (n.h -= Ht),
              q(e.buffer, o.tab, n, Be, i)),
            this.hover_dock_node === r.id &&
              (e.left_mouse_press || e.right_mouse_press) &&
              e.active === -1 &&
              this.set_active(r.id),
            r.tabs.length <= 0)
          ) {
            r.is_root && V(this.state, this.hint_text, r.rect, 0, i);
            return;
          }
          r.render_tab_well(e, i);
          let a = r.tabs[r.active_tab];
          e.tab_rect.copy(r.rect),
            (e.tab_rect.y += Ht),
            (e.tab_rect.h -= Ht),
            a &&
              ((e.tab = a),
              a.on_gui(e),
              this.active_dock_node === r.id &&
                ((n.h -= 1),
                (n.y += 1),
                Ee(e.buffer, o.background_float, n, Be))),
            R(n);
        }
      }
    }
  };
  var jt = class {
    constructor(e, r) {
      this.on_gui = r;
      this.changed = !1;
      (this._title = e),
        (this.active_button = new P(e)),
        (this.active_button.label.alignment = 33),
        (this.active_button.label.padding_left = 15),
        this.active_button.radiuses.set(3, 3, 0, 0),
        (this.close_button = new P("")),
        (this.id = Ie(this));
    }
    get rect() {
      return this.node === void 0 ? x.ZERO : this.node.rect;
    }
    get title() {
      return this._title;
    }
    set name(e) {
      (this._title = e), (this.active_button.label.text = e);
    }
  };
  function du(t) {
    if (t === void 0) return;
    let e = {},
      r = t.rect;
    return (
      (e.rect = [r.x, r.y, r.w, r.h]),
      (e.tabs = t.tabs.map(J2)),
      (e.active_tab = t.active_tab),
      (e.split_direction = t.split_direction),
      (e.left = du(t.left)),
      (e.right = du(t.right)),
      e
    );
  }
  function J2(t) {
    let e = {};
    return (
      (e.changed = t.changed),
      (e.title = t.title),
      (e.on_gui = Qs(t.on_gui)),
      (e.state = eF(t)),
      e
    );
  }
  function Ka(t) {
    let e = new nr();
    return (
      e.rect.elements.set(t.rect),
      (e.tabs = t.tabs.map(K2)),
      e.tabs.forEach((r) => {
        r.node = e;
      }),
      (e.active_tab = t.active_tab),
      (e.split_direction = t.split_direction),
      (e.left = t.left && Ka(t.left)),
      (e.right = t.right && Ka(t.right)),
      e
    );
  }
  function K2(t) {
    let e = new jt(t.title, kg(t.on_gui));
    return (e.changed = t.changed), tF(e, t.state), e;
  }
  var vf = {};
  function Ko(t, e, r) {
    let o = Qs(t);
    vf[o] = { serializer: e, deserializer: r };
  }
  function eF(t) {
    if (!t.on_gui) return;
    let e = Qs(t.on_gui),
      r = vf[e];
    if (r) return r.serializer(t);
  }
  function tF(t, e) {
    if (!t || !e || !t.on_gui) return;
    let r = Qs(t.on_gui);
    vf[r].deserializer(t, e);
  }
  var J0 = new WeakMap();
  function K0(t) {
    let e = J0.get(t);
    return e || ((e = {}), (e.trigger = new x()), J0.set(t, e)), e;
  }
  function ev(t, e) {
    let r = K0(t);
    (r.active_menu = e),
      (r.trigger.x = t.mouse_location.x),
      (r.trigger.y = t.mouse_location.y - Ai),
      (r.trigger.w = e.min_width),
      (r.trigger.h = Ai),
      (e.activated = !0),
      t.set_active(e.id);
  }
  function tv(t) {
    let e = K0(t),
      { active_menu: r, trigger: o } = e;
    if (!r || !r.activated) return;
    let n = h(F).theme;
    t.active === r.id && $n(t, r, n.panel_layer_1, o);
  }
  var rF = new ye("editor update"),
    we = class {
      constructor() {
        this.should_render = !0;
        this.status_bar_rect = new x(
          0,
          window.innerHeight - Sr,
          window.innerWidth,
          Sr,
        );
        this.clear_action = { type: 7, clear_color: new H(), clear_depth: 1 };
      }
      async on_register(e) {
        let r = C.CurrentDevice();
        await hu(r), (this.state = new mu(Qt())), Sa(this.state), Ww();
        let o = new uu(
          this.state,
          new x(
            pe,
            Ut + pe,
            window.innerWidth - pe * 2,
            window.innerHeight - pe * 2 - Ut - Sr,
          ),
        );
        (this.dock_system = o),
          (this.main_menu = new fu()),
          (this.search_bar = new cu()),
          (this.asset_search = new iu()),
          e
            ? (e.dock_root && ((o.root = Ka(e.dock_root)), this.resize()),
              e.editor_camera && (this.camera = __(e.editor_camera)))
            : (wf(o.root),
              o.root.split_aspect(0.7),
              o.root.right.add_tab(new jt("Terminal", $i)),
              o.root.right.add_tab(new jt("File Browser", Xi)),
              o.root.left.add_tab(new jt("Runtime View", ci)),
              o.root.left.add_tab(new jt("Editor View", Wi)),
              o.set_active(o.root.left.id)),
          window.addEventListener("resize", () => {
            this.resize();
          }),
          window.addEventListener("orientationchange", () => {
            this.resize(!0);
          }),
          B.on(ze.Frame, () => {
            let n = h(si),
              i = h(F).keyboard,
              a = this.state,
              s = r.encoder,
              c = Qt(),
              _ = h(F);
            (this.state.delta_time = _.engine.delta_time),
              this.clear_action.clear_color.copy(_.theme.background.color),
              !n || !n.xr_active
                ? ((window.innerWidth !== r.screen_width ||
                    window.innerHeight !== r.screen_height) &&
                    r.set_size(window.innerWidth, window.innerHeight),
                  this.should_render &&
                    this.state.needs_update &&
                    (O(a.buffer, _.theme.background, a.window_rect),
                    this.main_menu.render(a),
                    C_(a, i),
                    this.dock_system.render(),
                    rv(a, this.status_bar_rect),
                    Q0(a, this.asset_search),
                    tv(a),
                    this.state.needs_update && (s.set_pass(), c.render()),
                    this.state.update(),
                    c.buffer.reset()))
                : (this.state.tab_rect.set(
                    0,
                    0,
                    r.screen_width,
                    r.screen_height,
                  ),
                  (this.state.tab = this.xr_tab),
                  this.xr_tab.on_gui(this.state),
                  n.bind_current_view_framebuffer(),
                  this.should_render && a.needs_update && c.render(),
                  this.state.update(),
                  c.buffer.reset());
          }),
          B.on(rF, () => {
            this.state && (this.state.needs_update = !0);
          }),
          B.on(oe.Resize, () => {
            this.resize();
          }),
          (this.xr_tab = new jt("XR", ci)),
          (this.state.needs_update = !0);
      }
      create_menu_item_tab(e, r, o) {
        this.main_menu.create_menu_item_tab(e, r, o);
      }
      create_menu_item_action(e, r, o) {
        this.main_menu.create_menu_item_action(e, r, o);
      }
      resize(e = !1) {
        let r = e
            ? Math.max(window.innerWidth, window.innerHeight)
            : window.innerWidth,
          o = e
            ? Math.min(window.innerWidth, window.innerHeight)
            : window.innerHeight;
        this.main_menu.rect.set(0, 0, r, Ut),
          this.status_bar_rect.set(0, o - Sr, r, Sr),
          this.dock_system &&
            this.dock_system.root &&
            this.dock_system.root.resize(
              4,
              Ut + pe,
              window.innerWidth - 4 * 2,
              window.innerHeight - pe - Ut - Sr,
            );
      }
    };
  var ui,
    Tc = new x();
  function bu(t, e, r, o, n = 3, i = 0) {
    let a = C.CurrentDevice(),
      s = a.encoder;
    Tc.copy(e).shrink(1), t.renderer.set_screen_pass(Tc, "dot background");
    let c = ge("dot");
    s.set_pipeline(c),
      ui === void 0 &&
        (ui = ce({
          primitive: He("screen_triangle"),
          uniforms: {
            scale: 1,
            offset: new T(),
            background_color: new H(),
            dot_color: new H(),
            window_size: new b(),
          },
        }));
    let _ = h(F).theme;
    ui.uniforms.background_color.copy(_.background.color),
      ui.uniforms.dot_color.copy(_.panel_layer_0.color).tone(0.9),
      (ui.uniforms.scale = r),
      ui.uniforms.offset.copy(o),
      ui.uniforms.window_size.set(Tc.w, Tc.h, a.pixel_ratio),
      s.set_draw(ui),
      s.set_pass(),
      Vt(t.buffer.layers[0], Tc, n, i);
  }
  var yu = class {
      constructor() {
        this.offset = new T();
        this.anchor = new T();
        this.min_scale = 0.3;
        this.max_scale = 100;
        this.scale = 1;
        this.id = Ie(this);
      }
    },
    Mj = new T(),
    Cj = new T();
  function ov(t, e, r, o = 0) {
    let n = e.id;
    t.ishovering(r) && t.next_hover_layer_index <= o && (t.next_hover = n),
      t.hover === n &&
        (t.left_mouse_press || t.right_mouse_release) &&
        t.set_active(n),
      t.active === n &&
        (t.left_mouse_release &&
          (t.clear_active(), e.anchor.add(t.mouse_offset)),
        t.right_mouse_release && t.clear_active(),
        t.left_mouse_is_pressed && e.offset.copy(e.anchor).add(t.mouse_offset));
    let a =
      h(we).dock_system.active_dock_node === t.tab.node.id && t.ishovering(r);
    t.mouse_wheel !== 1 &&
      a &&
      (e.scale = Q(e.scale * t.mouse_wheel, e.min_scale, e.max_scale));
  }
  var nv = new WeakMap();
  function ao(t) {
    let e = nv.get(t);
    if (e === void 0) {
      if (
        ((e = {}),
        (e.id = Ie(t)),
        N.is(t) && (e.fold_btn = new P()),
        xn.is(t) && t.editable)
      )
        switch (t.type) {
          case 0:
            (e.toggle = new gu(t.value)), (e.toggle.mode = 1);
            break;
          case 8:
            (e.input = new qe(t.value)),
              (e.input.alignment = 33),
              (e.input.padding_left = 4);
            break;
          case 1:
            e.number_input = new lt(t.value);
            break;
          case 19: {
            let r = new Zt(),
              o = Object.getOwnPropertyNames(t.default_value);
            for (let n of o)
              isNaN(Number(n)) && r.set_option(n, t.default_value[n]);
            (r.value = t.value), (e.select = r);
          }
          default:
            break;
        }
      nv.set(t, e);
    }
    return e;
  }
  var iv = new T(),
    If = new T(),
    av = new T(),
    sv = new T(),
    cv = new T(),
    _v = new T();
  function oF(t, e, r, o, n, i = 3) {
    (n.closed = !1), t.write(n.points);
    let a = t.distance(r);
    (a += r.distance(o)), (a += o.distance(e));
    let s = Math.ceil(a / i);
    for (let c = 1; c < s; c++) {
      let _ = c / s;
      T.Lerp(t, r, _, iv),
        T.Lerp(r, o, _, If),
        T.Lerp(o, e, _, av),
        T.Lerp(iv, If, _, sv),
        T.Lerp(If, av, _, cv),
        T.Lerp(sv, cv, _, _v),
        _v.write(n.points, c * 2);
    }
    return e.write(n.points, s * 2), (n.point_count = s + 1), n;
  }
  var qi = new Vn(),
    lv = new x(),
    uv = new x(),
    Ao = new be(),
    xu = new b();
  function pv(t, e, r, o, n, i, a = 0, s = 10, c = !1, _ = 0) {
    if (a > 0) {
      Ao.reset(),
        Ao.expand_point(xu.set(r.x, r.y, 0)),
        Ao.expand_point(xu.set(n.x, n.y, 0)),
        Ao.expand_point(xu.set(i.x, i.y, 0)),
        Ao.expand_point(xu.set(o.x, o.y, 0)),
        uv.set(Ao.min.x, Ao.min.y, Ao.max.x - Ao.min.x, Ao.max.y - Ao.min.y),
        t.buffer.read_clip(lv, a);
      let l = br(uv, lv);
      if (l === -1) return;
      l === 0 && (a = 0);
    }
    (qi.closed = !1),
      qi.color.copy(e.color),
      (qi.clip = a),
      (qi.width = e.line_width),
      (qi.feather = e.feather),
      oF(r, o, n, i, qi, s),
      ke(t, qi, c, _);
  }
  var wu = new T(),
    Rc = new T(),
    Tf = new T(),
    Rf = new T();
  function vu(t, e, r, o = 0, n = 0) {
    let { id: i } = ao(e);
    if (!e.from) throw "invalid slot connection.";
    if (
      (wu.copy(e.from.anchor),
      e.to ? Rc.copy(e.to.anchor) : Rc.copy(t.mouse_location),
      (Tf.x = Rf.x = (wu.x + Rc.x) * 0.5),
      (Tf.y = wu.y),
      (Rf.y = Rc.y),
      t.active === i &&
        t.right_mouse_press &&
        (Pa(e), t.clear_active(), t.clear_mouse_state()),
      t.active === i && t.left_mouse_release)
    ) {
      let _ = gn(t.hover);
      (_ && xn.is(_) && _.connect(e)) || Pa(e),
        t.clear_mouse_state(),
        t.clear_active();
    }
    let a = 0,
      s = dv(t.tab);
    s.playing && (e.activated ? (a = h(F).engine.time * 0.03) : (a = 0)),
      s.stepping && (a = 1);
    let c = a !== 0;
    pv(t.buffer.layers[o], r, Rc, wu, Rf, Tf, n, 3, c, a);
  }
  var mv = [
    K("aca", "acaa", "aca"),
    K("66d", "66da", "66d"),
    K("99d", "99da", "99d"),
    K("aaf", "aafa", "aaf"),
    K("cec", "ceca", "cec"),
    K("5ec", "5eca", "5ec"),
    K("aec", "aeca", "aec"),
    K("aec", "aeca", "aec"),
  ];
  function Iu(t) {
    let e = mv[t % mv.length];
    return (e.line_width = 2), e;
  }
  function Sf(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = h(F).theme,
      { id: c } = ao(e),
      _ = S(de),
      l = S(T);
    _.copy(r);
    let u = !1,
      d = t.ishovering(o);
    if (
      (d &&
        n >= t.hover_layer &&
        ((t.next_hover = c), (t.next_hover_layer_index = n)),
      d && _.color.copy(r.hover_color),
      t.hover === c && t.left_mouse_press && e.connectable && t.set_active(c),
      t.active === c && _.color.copy(r.active_color),
      t.active === c &&
        t.left_mouse_release &&
        ((u = o.contains(t.mouse_location)),
        t.clear_active(),
        t.clear_mouse_state()),
      e.connectable)
    ) {
      let p = o.w * 0.5;
      l.set(o.x + p, o.y + p),
        Fr(a, _, l, p, i),
        d &&
          (_.color.copy(s.white.color),
          (_.line_width = 0.8),
          dc(a, _, l, p, i));
    }
    return R(_), R(l), e.connectable && u;
  }
  var ir = new x();
  function Ff(t, e, r, o, n = 0, i = 0) {
    let a = h(F).theme,
      s = ao(e);
    if (e.type === 0) {
      ir.copy(r),
        ir.shrink(5 * o),
        (ir.w = r.w * 0.5),
        e.input_slot
          ? (ir.x = r.x + r.w - ir.w - 10 * o)
          : (ir.x = r.x + 10 * o);
      let c = s.toggle;
      if (((c.scale = o), fv(t, c, a.toggle, ir, n, i))) {
        let _ = c.value;
        e.on_change && e.on_change(_), e.write(_);
      }
    } else if (
      (ir.copy(r),
      ir.shrink(5.5 * o),
      (ir.w = r.w * 0.55),
      e.input_slot ? (ir.x = r.x + r.w - ir.w - 10 * o) : (ir.x = r.x + 10 * o),
      e.type === 1)
    ) {
      let c = s.number_input;
      if (((c.scale = o), ht(t, c, a.input, ir, n, i))) {
        let _ = c.value;
        e.on_change && e.on_change(_), e.write(_);
      }
    } else if (e.type === 8) {
      let c = s.input;
      if (((c.scale = o), At(t, c, a.input, ir, n, i))) {
        let _ = c.text;
        e.on_change && e.on_change(_), e.write(_);
      }
    } else if (e.type === 19) {
      let c = s.select;
      if (((c.scale = o), Yr(t, c, a.input, ir, n, i))) {
        let _ = c.value;
        e.on_change && e.on_change(_), e.write(_);
      }
    }
    return !0;
  }
  var nF = 10;
  var ko = 5,
    es = 26,
    iF = 26,
    hv = new M(ko, ko, 0, 0);
  function Af(t, e, r, o, n = 1, i = 0, a = 0) {
    let s = !1,
      c = t.buffer.layers[i],
      _ = ao(e),
      l = es * n,
      u = iF * n,
      { id: d, fold_btn: p } = _,
      m = S(x),
      f = S(x),
      y = S(de),
      g = S(T),
      v = S(x);
    m.copy(o), e.folded && (m.h = l), f.copy(m), y.color.copy(r.color);
    let w = t.active === d;
    (w || e.activated) &&
      t.left_mouse_release &&
      w &&
      (t.clear_active(), (s = !0));
    let k = h(F).theme;
    q(c, k.shadow, f, ko * n, a),
      q(c, y, f, ko * n, a),
      y.color.copy(r.color),
      y.color.tone(1.3),
      f.copy(o),
      (f.h = l),
      e.folded
        ? q(c, y, f, ko * n, a)
        : (hv.set(ko * n, ko * n, 0, 0), ue(c, y, f, hv, a));
    let D = Tu(Qd(e.func), 0);
    (D.scale = n),
      V(t, D, f, i, a),
      t.ishovering(m) &&
        (t.active === -1 || w) &&
        t.next_hover_layer_index <= i &&
        (t.next_hover = d),
      t.hover === d && t.left_mouse_press && t.set_active(d),
      f.copy(o),
      (f.h = u),
      (f.x += f.w - f.h - 6 * n),
      (f.w = f.h),
      f.shrink(6 * n),
      y.copy(r),
      y.color.set(0, 0, 0, 0),
      E(t, p, y, f, i, a) && (e.folded = !e.folded);
    let U = nF * n,
      Y = (u - U) * 0.5;
    if (e.folded) {
      f.expand(3 * n),
        N_(t.buffer.layers[i], f, a),
        f.copy(o),
        (f.h = l),
        g.set(f.x, f.y + f.h * 0.5);
      for (let [le, X] of e.input_slots) {
        X.anchor.copy(g);
        let Qe = Iu(X.type);
        X.input && vu(t, X.input, Qe, i, a);
      }
      g.set(f.x + f.w, f.y + f.h * 0.5);
      for (let [le, X] of e.output_slots) X.anchor.copy(g);
      return R(m), R(f), R(y), R(g), R(v), s;
    } else f.expand(3 * n), Ra(t.buffer.layers[i], f, a);
    f.copy(o), (f.h = u), (f.y += l + u * e.output_slots.size);
    for (let [le, X] of e.input_slots) {
      let Qe = Tu(X.name);
      Qe && ((Qe.scale = n), V(t, Qe, f, i, a));
      let Ge = Iu(X.type);
      if (
        (v.copy(f),
        (v.w = f.h),
        (v.x -= v.w * 0.5),
        v.shrink(Y),
        Sf(t, X, Ge, v, i, a) && X.input)
      ) {
        let Nt = ao(X.input);
        t.set_active(Nt.id), (X.input.to = void 0), (X.input = void 0);
      }
      X.anchor.set(v.x + v.w * 0.5, v.y + v.h * 0.5),
        X.editable && !X.input && Ff(t, X, f, n, i, a),
        X.input && vu(t, X.input, Ge, i, a),
        (f.y += f.h);
    }
    f.copy(o), (f.h = u), (f.y += l);
    for (let [le, X] of e.output_slots) {
      let Qe = Tu(X.name, 2);
      Qe && ((Qe.scale = n), V(t, Qe, f, i, a));
      let Ge = Iu(X.type);
      if (
        (v.copy(f),
        (v.x += f.w),
        (v.w = f.h),
        (v.x -= v.w * 0.5),
        v.shrink(Y),
        X.anchor.set(v.x + v.w * 0.5, v.y + v.h * 0.5),
        X.editable && Ff(t, X, f, n, i, a),
        (f.y += f.h),
        Sf(t, X, Ge, v, i, a))
      ) {
        let Nt = X.create_connection(),
          fo = ao(Nt);
        t.set_active(fo.id);
      }
      for (let Nt of X.outputs) Nt.to || vu(t, Nt, Ge, i, a);
    }
    return R(m), R(f), R(y), R(g), R(v), s;
  }
  var pi = new x(),
    aF = 22,
    Ru = K("e5ac65");
  Ru.line_width = 3;
  var kf = new x();
  function Pf(t, e, r, o, n = 1, i = 0) {
    let a = !1;
    return (
      (pi.w = aF * n * 0.8),
      (pi.h = pi.w),
      (pi.x = o.x + (o.w - pi.w) * 0.5),
      (pi.y = o.y - pi.h - 2),
      e.debugger.is_breakpoint(r) && wg(t, pi, n),
      e.debugger.step_node === r &&
        (kf.copy(o),
        r.folded && (kf.h = es * n),
        (Ru.line_width = Math.max(3, 3 * n)),
        (Ru.feather = Math.max(0.5, n * 0.5)),
        Ee(t.buffer, Ru, kf, ko * n, i)),
      a
    );
  }
  var bv = new WeakMap();
  function Sc(t) {
    let e = bv.get(t);
    return (
      e ||
        ((e = {}),
        (e.flex_view = new yu()),
        (e.active_nodes = new Set()),
        (e.interpreter = new Qn()),
        (e.scale_label = new re("1.00")),
        (e.scale_label.alignment = 48),
        (e.scale_label.padding_left = e.scale_label.padding_bottom = 10),
        bv.set(t, e)),
      e
    );
  }
  function Fu(t) {
    return Sc(t);
  }
  function yv(t, e) {
    let { flex_view: r } = Sc(t),
      o = {};
    return (
      (o.scale = r.scale),
      (o.anchor = [r.anchor.x, r.anchor.y]),
      (o.offset = [r.offset.x, r.offset.y]),
      o
    );
  }
  function gv(t, e) {
    let { flex_view: r } = Sc(t);
    (r.scale = e.scale),
      (r.anchor.x = e.anchor[0]),
      (r.anchor.y = e.anchor[1]),
      (r.offset.x = e.offset[0]),
      (r.offset.y = e.offset[1]);
  }
  function Au(t, e, r) {
    let o = h(F).theme,
      n = S(x),
      i = S(x),
      a = S(x),
      s = S(de);
    n.copy(t.tab_rect);
    let {
        flex_view: c,
        active_nodes: _,
        interpreter: l,
        scale_label: u,
      } = Sc(t.tab),
      d = e.nodes,
      p = t.buffer.write_clip(n),
      m = c.scale;
    t.active === c.id && t.right_mouse_is_pressed && sF(t, e, r, m, p),
      t.active === c.id &&
        t.left_mouse_release &&
        t.mouse_offset.length < 8 &&
        e.active_nodes.clear(),
      ov(t, c, t.tab_rect),
      bu(t, n, m, c.offset),
      _.clear();
    let f = t.key_pressed.has(16);
    for (let g of d) {
      let v = ao(g);
      if (
        (t.active === v.id &&
          !e.active_nodes.has(g) &&
          (f || e.clear_active(), e.set_active_node(g)),
        e.active_nodes.has(g))
      ) {
        _.add(g);
        continue;
      }
      i.copy(g.rect).mul(m),
        (i.x += c.offset.x + r.x),
        (i.y += c.offset.y + r.y),
        Af(t, g, o.node, i, m, 0, p) &&
          (f || e.clear_active(), e.set_active_node(g)),
        (l.debugger.is_breakpoint(g) || l.debugger.step_node === g) &&
          Pf(t, l, g, i, m, p);
    }
    let y = !1;
    for (let g of _)
      if (ao(g).id === t.active) {
        y = !0;
        break;
      }
    for (let g of _)
      i.copy(g.rect).mul(m),
        (i.x += c.offset.x + r.x),
        (i.y += c.offset.y + r.y),
        t.left_mouse_release &&
          y &&
          ((g.rect.x += t.mouse_offset.x / m),
          (g.rect.y += t.mouse_offset.y / m)),
        y && ((i.x += t.mouse_offset.x), (i.y += t.mouse_offset.y)),
        a.copy(i),
        g.folded && (a.h = es * m),
        a.expand(0.75),
        s.color.copy(o.node.outline_color),
        (s.line_width = Math.max(1, o.node.line_width * m)),
        (s.feather = Math.max(0.5, o.node.feather * m)),
        Ee(t.buffer, s, a, ko * m, p),
        Af(t, g, o.node, i, m, 0, p),
        (l.debugger.is_breakpoint(g) || l.debugger.step_node === g) &&
          Pf(t, l, g, i, m, p);
    if (t.key_press.has(8) && t.ishovering(r)) {
      for (let g of e.active_nodes) e.delete_node(g);
      t.clear_active();
    }
    if (t.key_press.has(80) && t.active === -1)
      for (let g of e.active_nodes) l.debugger.toggle_breakpoint(g);
    m.toFixed(2) !== u.text && (u.text = m.toFixed(2)),
      yt(r, u.constraint, i),
      V(t, u, i),
      R(n),
      R(i),
      R(a),
      R(s);
  }
  var di = new x(),
    Ef = new x(),
    ts = new T(),
    Su = new T();
  function sF(t, e, r, o, n = 0) {
    let { flex_view: i } = Sc(t.tab),
      a = i.anchor,
      s = S(de);
    (ts.x = Math.min(t.mouse_start.x, t.mouse_location.x)),
      (ts.y = Math.min(t.mouse_start.y, t.mouse_location.y)),
      (Su.x = Math.max(t.mouse_start.x, t.mouse_location.x)),
      (Su.y = Math.max(t.mouse_start.y, t.mouse_location.y)),
      (di.x = ts.x),
      (di.y = ts.y),
      (di.w = Su.x - ts.x),
      (di.h = Su.y - ts.y);
    let c = h(F).theme;
    s.color.copy(c.node.outline_color),
      (s.line_width = 1),
      (s.feather = 0.5),
      Ee(t.buffer.layers[1], s, di, o),
      (di.x -= a.x + r.x),
      (di.y -= a.y + r.y),
      e.active_nodes.clear();
    for (let _ of e.nodes)
      Ef.copy(_.rect).mul(o),
        _.folded && (Ef.h = es * o),
        br(Ef, di) !== -1 && e.set_active_node(_);
    R(s);
  }
  var xv = new WeakMap();
  function os(t) {
    let e = xv.get(t);
    if (e === void 0) {
      e = {};
      let r = new re("1");
      (r.alignment = 48),
        (r.padding_left = r.padding_bottom = 10),
        (e.scale_label = r),
        (e.play_btn = new P()),
        e.play_btn.radiuses.set(4, 0, 4, 0),
        (e.step_forward_btn = new P()),
        (e.step_forward_btn.radius = 0),
        (e.terminate_btn = new P()),
        e.terminate_btn.radiuses.set(0, 4, 0, 4),
        (e.playing = !1),
        (e.stepping = !1),
        (e.interpreter = new Qn()),
        xv.set(t, e);
    }
    return e;
  }
  var dv = os,
    Df = new x(),
    ar = new x(),
    en,
    cF = { width: 64, height: 22, alignment: 36, margin: new Jr(10, 0, 0, 10) };
  function xe(t) {
    let e = h(we).state.tab,
      o = os(e).graph;
    if (!o) return;
    let n = t();
    o.add_node(n), o.clear_active(), o.set_active_node(n);
    let i = Fu(e),
      { offset: a, scale: s } = i.flex_view;
    (n.rect.x = 100 - a.x * s), (n.rect.y = 100 - a.y * s);
  }
  function _F() {
    if (!en) {
      en = new Kr("add node");
      let t = en.add_sub_menu("binary");
      t.add_sub_menu("bool", xe.bind(void 0, Yd)),
        t.add_sub_menu("bool and", xe.bind(void 0, J_)),
        t.add_sub_menu("bool or", xe.bind(void 0, Id)),
        t.add_sub_menu("bool not", xe.bind(void 0, Td));
      let e = en.add_sub_menu("engine");
      e.add_sub_menu("time", xe.bind(void 0, sm)),
        e.add_sub_menu("property setter", xe.bind(void 0, cm)),
        e.add_sub_menu("property getter", xe.bind(void 0, _m)),
        e.add_sub_menu("look at", xe.bind(void 0, Zd)),
        e.add_sub_menu("virtual input", xe.bind(void 0, pm));
      let r = en.add_sub_menu("math"),
        o = r.add_sub_menu("trigonometric");
      o.add_sub_menu("sin", xe.bind(void 0, Bd)),
        o.add_sub_menu("cos", xe.bind(void 0, Hd)),
        o.add_sub_menu("tan", xe.bind(void 0, jd)),
        o.add_sub_menu("asin", xe.bind(void 0, Wd)),
        o.add_sub_menu("acos", xe.bind(void 0, Vd)),
        o.add_sub_menu("atan", xe.bind(void 0, Xd)),
        o.add_sub_menu("atan2", xe.bind(void 0, $d)),
        r.add_sub_menu("float", xe.bind(void 0, Jd)),
        r.add_sub_menu("greater", xe.bind(void 0, Ad)),
        r.add_sub_menu("greater equal", xe.bind(void 0, kd)),
        r.add_sub_menu("less", xe.bind(void 0, Rd)),
        r.add_sub_menu("less equal", xe.bind(void 0, Fd)),
        r.add_sub_menu("equal", xe.bind(void 0, Pd)),
        r.add_sub_menu("not equal", xe.bind(void 0, Ed)),
        r.add_sub_menu("in range", xe.bind(void 0, Dd)),
        r.add_sub_menu("clamp", xe.bind(void 0, Cd)),
        r.add_sub_menu("add", xe.bind(void 0, Gd)),
        r.add_sub_menu("subtract", xe.bind(void 0, Ud)),
        r.add_sub_menu("multiply", xe.bind(void 0, Md)),
        r.add_sub_menu("divide", xe.bind(void 0, K_)),
        r.add_sub_menu("log", xe.bind(void 0, Ld)),
        r.add_sub_menu("log2", xe.bind(void 0, Nd)),
        r.add_sub_menu("log10", xe.bind(void 0, zd)),
        r.add_sub_menu("pow", xe.bind(void 0, K_));
      let n = en.add_sub_menu("simd");
      n.add_sub_menu("float2", xe.bind(void 0, Kd)),
        n.add_sub_menu("float3", xe.bind(void 0, em)),
        n.add_sub_menu("float4", xe.bind(void 0, tm)),
        n.add_sub_menu("quaternion", xe.bind(void 0, rm)),
        n.add_sub_menu("float2 split", xe.bind(void 0, om)),
        n.add_sub_menu("float3 split", xe.bind(void 0, nm)),
        n.add_sub_menu("float4 split", xe.bind(void 0, im)),
        n.add_sub_menu("quaternion split", xe.bind(void 0, am));
      let i = en.add_sub_menu("texture");
      i.add_sub_menu("image"),
        i.add_sub_menu("noise"),
        i.add_sub_menu("virtual");
      let a = en.add_sub_menu("material");
      a.add_sub_menu("BSDF"),
        a.add_sub_menu("unlit"),
        a.add_sub_menu("emissive");
      let s = en.add_sub_menu("gpu");
      s.add_sub_menu("mesh Pack"),
        s.add_sub_menu("emitter"),
        s.add_sub_menu("SDF"),
        s.add_sub_menu("BVH scene"),
        s.add_sub_menu("BVH primitive");
    }
    return en;
  }
  function ku(t) {
    let e = t.tab,
      r = h(F).theme;
    Df.copy(t.tab_rect);
    let o = os(e),
      { graph: n } = o;
    if (!n) return;
    Au(t, n, Df);
    let i = _F();
    yt(Df, cF, ar), $n(t, i, r.node, ar), fF(t);
  }
  Fe(ku, "ui_tab_node_graph");
  Ko(ku, lF, uF);
  function lF(t) {
    let { graph: e } = os(t),
      r = {};
    return (r.graph = Ea(e)), (r.graph_state_data = yv(t, e)), r;
  }
  function uF(t, e) {
    let r = os(t);
    (r.graph = Da(e.graph)), gv(t, e.graph_state_data);
  }
  var pF = new Map(),
    dF = new Map(),
    mF = new Map(),
    wv = 15;
  function Tu(t, e = 1) {
    let r;
    e === 0 ? (r = mF) : e === 1 ? (r = pF) : (r = dF);
    let o = r.get(t);
    return (
      o ||
        ((o = new re(t)),
        e !== 0 && (o.alignment = 1 | (e === 1 ? 32 : 8)),
        (o.padding_left = wv),
        (o.padding_right = wv),
        r.set(t, o)),
      o
    );
  }
  var rs = 24;
  function fF(t) {
    let e = os(t.tab),
      r = t.tab_rect,
      o = h(F).theme,
      n = e.interpreter;
    ar.copy(r),
      ar.copy(t.tab_rect),
      (ar.y += rs >>> 1),
      (ar.x += (t.tab_rect.w - rs * 3 + 0.8 * 2) >> 1),
      (ar.w = rs),
      (ar.h = rs);
    let i = e.playing,
      a = e.interpreter.debugger.stepping;
    if (((e.stepping = a), i && !a)) {
      let c = h(F).engine;
      C.CurrentDevice().encoder.set_time(c.time);
    }
    let s = o.button_state;
    E(t, e.play_btn, s, ar) && ((e.playing = !0), a && n.debugger.continue(n)),
      Ya(t.buffer, ar),
      (ar.x += rs + 0.8),
      (s = o.button_state),
      E(t, e.step_forward_btn, s, ar) &&
        e.stepping &&
        n.debugger.step_forward(n),
      vv(t.buffer, ar),
      (ar.x += rs + 0.8),
      (s = o.button_state),
      E(t, e.terminate_btn, s, ar) &&
        ((e.playing = !1), (e.stepping = !1), (n.debugger.stepping = !1)),
      Yl(t.buffer, ar);
  }
  function hF() {
    if (window.acorn !== void 0) return window.acorn.Parser;
  }
  function Iv(t) {
    let e = hF();
    if (e !== void 0) return e.tokenizer(t, { ecmaVersion: "latest" });
  }
  var Gf = 24,
    bF = new M(Be, 0, Be, 0),
    Pr = 16,
    Uf = 5,
    yF = 26;
  function gF(t) {
    let e = {},
      r = is(t);
    return (e.guid = r.guid), e;
  }
  function xF(t, e) {
    if (e.guid) {
      let r = is(t),
        o = h(Z).get_node_by_guid(e.guid);
      o && (r.guid = o.guid);
    }
  }
  function Pu(t, e, r) {
    e.actions.length > e.action_index &&
      (e.actions = e.actions.slice(0, e.action_index)),
      (e.actions[e.action_index++] = r),
      (t.tab.changed = !0);
  }
  function wF(t) {
    if (t.action_index === 0) return;
    t.action_index = Math.max(-1, t.action_index - 1);
    let e = t.actions[t.action_index];
    if (e !== void 0)
      if (e.line_remove !== void 0) {
        (t.cursor_line = e.line_remove),
          (t.cursor_offset = e.cursor_offset_from);
        let r = e.line_string_from;
        (t.lines[e.line_remove - 1] = t.lines[e.line_remove - 1].substring(
          0,
          e.cursor_offset_to,
        )),
          t.lines.splice(e.line_remove, 0, r);
      } else if (e.line_add !== void 0) {
        (t.cursor_line = e.line_add - 1),
          (t.cursor_offset = e.cursor_offset_from);
        let r = t.lines.splice(e.line_add, 1);
        t.lines[e.line_add - 1] += r;
      } else
        (t.cursor_line = e.modify_line),
          (t.cursor_offset = e.cursor_offset_from),
          (t.lines[e.modify_line] = e.line_string_from);
  }
  function vF(t) {
    if (t.action_index === t.actions.length) return;
    let e = t.actions[t.action_index++];
    (t.cursor_offset = e.cursor_offset_to),
      (t.lines[e.modify_line] = e.line_string_to);
  }
  function IF(t, e) {
    let r = e.lines.join(`
`),
      o = h(Z).get_node_by_guid(e.guid);
    o && ((o.data = r), (t.tab.changed = !1), t.key_press.clear());
  }
  async function TF(t, e) {
    let r = h(Z).get_node_by_guid(e.guid);
    r &&
      ((r.data = await navigator.clipboard.readText()),
      (t.tab.changed = !1),
      mi("paste from clipboard."));
  }
  var Tv = new WeakMap();
  function is(t) {
    let e = Tv.get(t);
    return (
      e === void 0 &&
        ((e = {}),
        (e.scroll_view = new Ar()),
        (e.id = Ie(e)),
        (e.cursor_rect = new x()),
        (e.cursor_located = !1),
        (e.actions = []),
        (e.action_index = 0),
        (e.code = new re("", !0)),
        (e.code.alignment = 33),
        (e.code.padding.w = 4),
        Tv.set(t, e)),
      e
    );
  }
  function Rv(t, e) {
    let r = is(t);
  }
  function Eu(t) {
    let e = is(t.tab);
    if (!h(Z).get_node_by_guid(e.guid)) return;
    let o = t.tab_rect,
      n = e.scroll_view;
    (n.content_height = e.lines.length * Pr), Vo(t, n, o);
    let i = t.buffer.write_clip(o),
      a = S(x),
      s = S(x);
    a.copy(o),
      a.shrink(1),
      (a.w = Gf),
      RF(t, a, i),
      s.copy(o),
      (s.x += Gf),
      (s.w -= Gf),
      SF(t, s, i),
      R(a),
      R(s);
  }
  Fe(Eu, "ui_tab_script_editor");
  Ko(Eu, gF, xF);
  var ns;
  function RF(t, e, r = 0) {
    let o = h(F).theme;
    ue(t.buffer, o.button_breadcrumb, e, bF),
      ns == null && ((ns = new re("")), (ns.alignment = 9), (ns.padding.y = 4));
    let n = is(t.tab),
      i = S(x),
      a = n.lines,
      s = n.scroll_view.scroll_offset_y,
      c = Math.min(a.length, Math.floor(s / Pr)),
      _ = Math.min(a.length, c + Math.max(0, Math.ceil(e.h / Pr)));
    i.copy(e), (i.h = Pr), (i.y += Uf - (s % Pr));
    for (let l = c; l < _; ++l)
      (ns.text = l.toString()), V(t, ns, i, 0, r, o.auxiliary), (i.y += Pr);
    R(i);
  }
  function SF(t, e, r = 0) {
    let o = is(t.tab),
      n = h(F),
      i = n.theme,
      a = n.code_theme,
      { code: s, lines: c, scroll_view: _ } = o,
      l = _.scroll_offset_y,
      u = S(x),
      d = S(x),
      p = S(de),
      m = Math.min(c.length, Math.floor(l / Pr)),
      f = Math.min(c.length, m + Math.max(0, Math.ceil(e.h / Pr))),
      y = hr(Gi),
      g = yF * y.scale_ratio;
    u.copy(e), (u.h = Pr), (u.y += Uf - (l % Pr));
    for (let w = m; w < f; ++w) {
      let k = c[w];
      try {
        let D = Iv(c[w]);
        for (let G of D)
          d.copy(u),
            (d.x += G.start * g),
            G.type.keyword
              ? p.color.copy(a.keyword)
              : G.type.label === "name"
                ? p.color.copy(a.type)
                : G.type.label === "string"
                  ? p.color.copy(a.string)
                  : G.type.label === "function"
                    ? p.color.copy(a.function)
                    : p.color.copy(a.label),
            (s.text = k.substring(G.start, G.end)),
            V(t, s, d, 0, r, p);
      } catch {
        p.color.copy(a.label), d.copy(u), (s.text = k), V(t, s, d, 0, r, p);
      }
      u.y += Pr;
    }
    let v = o.id;
    if (
      (t.ishovering(e) && t.next_hover_layer_index <= 0 && (t.next_hover = v),
      t.hover === v &&
        t.left_mouse_press &&
        ((o.cursor_located = !0),
        (o.cursor_line = Math.min(
          o.lines.length - 1,
          Math.floor((t.mouse_location.y - e.y + l) / Pr),
        )),
        (o.cursor_offset = Q(
          Math.ceil((t.mouse_location.x - e.x) / g),
          0,
          o.lines[o.cursor_line].length,
        ))),
      o.cursor_located && t.is_tab_active(t.tab))
    ) {
      if (
        (t.key_press.has(38) &&
          ((o.cursor_line = Math.max(0, o.cursor_line - 1)),
          (o.cursor_offset = Q(
            o.cursor_offset,
            0,
            o.lines[o.cursor_line].length,
          ))),
        t.key_press.has(40) &&
          ((o.cursor_line = Math.min(o.lines.length - 1, o.cursor_line + 1)),
          (o.cursor_offset = Q(
            o.cursor_offset,
            0,
            o.lines[o.cursor_line].length,
          ))),
        t.key_press.has(37) &&
          (o.cursor_offset = Math.max(0, o.cursor_offset - 1)),
        t.key_press.has(39) &&
          (o.cursor_offset = Math.min(
            o.cursor_offset + 1,
            o.lines[o.cursor_line].length,
          )),
        t.key_press.has(8))
      ) {
        if (o.cursor_offset > 0) {
          let w = { modify_line: o.cursor_line };
          (w.line_string_from = o.lines[o.cursor_line]),
            (w.cursor_offset_from = o.cursor_offset),
            t.key_pressed.has(91)
              ? ((o.lines[o.cursor_line] = o.lines[o.cursor_line].slice(
                  o.cursor_offset - 1,
                )),
                (o.cursor_offset = 0))
              : ((o.lines[o.cursor_line] = zb(
                  o.lines[o.cursor_line],
                  o.cursor_offset - 1,
                  o.cursor_offset,
                )),
                o.cursor_offset--),
            (w.cursor_offset_to = o.cursor_offset),
            (w.line_string_to = o.lines[o.cursor_line]),
            Pu(t, o, w);
        } else if (o.cursor_line > 0) {
          let w = {};
          (w.cursor_offset_from = o.cursor_offset),
            (w.line_remove = o.cursor_line),
            (w.line_string_from = o.lines[o.cursor_line]),
            (o.cursor_offset = o.lines[o.cursor_line - 1].length),
            (o.lines[o.cursor_line - 1] += o.lines.splice(o.cursor_line, 1)),
            o.cursor_line--,
            (w.cursor_offset_to = o.cursor_offset),
            (w.line_string_to = o.lines[o.cursor_line - 1]),
            Pu(t, o, w);
        }
      }
      if (t.key_press.has(13)) {
        let w = {};
        (w.cursor_offset_from = o.cursor_offset),
          (w.line_add = o.cursor_line + 1),
          (w.line_string_from = o.lines[o.cursor_line]);
        let k = o.lines[o.cursor_line].slice(o.cursor_offset);
        (w.line_string_to = k),
          (o.lines[o.cursor_line] = o.lines[o.cursor_line].slice(
            0,
            o.cursor_offset,
          )),
          o.lines.splice(o.cursor_line + 1, 0, k),
          o.cursor_line++,
          (o.cursor_offset = 0),
          (w.cursor_offset_to = o.cursor_offset),
          Pu(t, o, w);
      }
      if (t.key_pressed.has(91) || t.key_pressed.has(17))
        t.key_press.has(90) && (t.key_pressed.has(16) ? vF(o) : wF(o)),
          t.key_press.has(83) && IF(t, o),
          t.key_press.has(86) && t.key_pressed.has(16) && TF(t, o).then();
      else if (t.key_press.size > 0) {
        let w = o.cursor_line,
          k = t.key_pressed.has(16),
          D = { modify_line: o.cursor_line };
        (D.line_string_from = o.lines[w]),
          (D.cursor_offset_from = o.cursor_offset);
        let G = "";
        for (let U of t.key_press) G += As(U, k);
        (o.lines[w] = Lb(o.lines[w], o.cursor_offset, G)),
          (o.cursor_offset += Math.max(0, G.length)),
          (D.line_string_to = o.lines[w]),
          G.length > 0 && Pu(t, o, D),
          t.key_press.delete(32);
      }
      o.cursor_rect.set(
        e.x + g * o.cursor_offset + 3,
        e.y + o.cursor_line * Pr - l + Uf + 2,
        2,
        Pr - 2,
      ),
        O(t.buffer, i.white, o.cursor_rect, r);
    }
    R(u), R(d), R(p);
  }
  function Sv(t, e) {}
  function Mf() {
    let t = new N(Sv);
    return (
      t.add_input_slot("normal", 3, new b(0, 0, 0)),
      t.add_output_slot("color", 3, new b(1, 1, 1)),
      t
    );
  }
  W(Sv, Mf, "spherical harmonics");
  function Fv(t, e) {}
  function Cf() {
    let t = new N(Fv);
    return (
      t.add_output_slot("world position", 3, new b()),
      t.add_output_slot("near", 1, 1),
      t.add_output_slot("far", 1, 1e4),
      t
    );
  }
  W(Fv, Cf, "camera data");
  function Xt(t) {
    return Xe(t)
      ? t
      : $r(t)
        ? t.toFixed(6)
        : t instanceof T
          ? `float2(${t.x.toFixed(6)}, ${t.x.toFixed(6)})`
          : t instanceof b
            ? `float3(${t.x.toFixed(6)}, ${t.x.toFixed(6)}, ${t.z.toFixed(6)})`
            : t instanceof M
              ? `float4(${t.x.toFixed(6)}, ${t.x.toFixed(6)}, ${t.z.toFixed(
                  6,
                )}, ${t.w.toFixed(6)})`
              : t.toString();
  }
  function Du(t) {
    switch (t) {
      case 0:
        return "bool";
      case 9:
        return "int";
      case 1:
        return "float";
      case 2:
        return "float2";
      case 3:
        return "float3";
      case 4:
        return "float4";
      case 6:
        return "mat3";
      case 7:
        return "mat4";
      case 15:
        return "highp sampler2D";
      case 16:
        return "highp sampler2DArray";
      case 17:
        return "highp samplerCube";
      case 18:
        return "highp sampler3D";
      default:
        return t.toString();
    }
  }
  function Av(t, e) {
    let r = e.get_output_slot("output");
    r.write_direct(Xt(r.value));
  }
  function Lf() {
    let t = new N(Av);
    return t.add_output_slot("output", 1, 0, !0), t;
  }
  W(Av, Lf, "variable float");
  function kv(t, e) {
    let r = e.get_input_slot("x").read(),
      o = e.get_input_slot("y").read();
    e.get_output_slot("output").write_direct(`float2(${r}, ${o})`);
  }
  function zf() {
    let t = new N(kv);
    return (
      t.add_input_slot("x", 1, 0, !0),
      t.add_input_slot("y", 1, 0, !0),
      t.add_output_slot("output", 2),
      t
    );
  }
  W(kv, zf, "variable float2");
  function Pv(t, e) {
    let r = e.get_input_slot("x").read(),
      o = e.get_input_slot("y").read(),
      n = e.get_input_slot("z").read();
    e.get_output_slot("output").write_direct(`float3(${r}, ${o}, ${n})`);
  }
  function Nf() {
    let t = new N(Pv);
    return (
      t.add_input_slot("x", 1, 0, !0),
      t.add_input_slot("y", 1, 0, !0),
      t.add_input_slot("z", 1, 0, !0),
      t.add_output_slot("output", 3),
      t
    );
  }
  W(Pv, Nf, "variable float3");
  function Ev(t, e) {
    let r = e.get_input_slot("x").read(),
      o = e.get_input_slot("y").read(),
      n = e.get_input_slot("z").read(),
      i = e.get_input_slot("w").read();
    e.get_output_slot("output").write_direct(`float4(${r}, ${o}, ${n}, ${i})`);
  }
  function Bf() {
    let t = new N(Ev);
    return (
      t.add_input_slot("x", 1, 0, !0),
      t.add_input_slot("y", 1, 0, !0),
      t.add_input_slot("z", 1, 0, !0),
      t.add_input_slot("w", 1, 0, !0),
      t.add_output_slot("output", 4),
      t
    );
  }
  W(Ev, Bf, "variable float4");
  function Dv(t, e) {
    let r = e.get_input_slot("input").read() ?? "float2(0.0, 0.0)",
      n = t.add_variable(2, Xt(r)).name;
    e.get_output_slot("x").write_direct(`${n}.x`),
      e.get_output_slot("y").write_direct(`${n}.y`);
  }
  function Wf() {
    let t = new N(Dv);
    return (
      t.add_input_slot("input", 2),
      t.add_output_slot("x", 1),
      t.add_output_slot("y", 1),
      t
    );
  }
  W(Dv, Wf, "variable float2 split");
  function Gv(t, e) {
    let r = e.get_input_slot("input").read() ?? "float3(0.0, 0.0, 0.0)",
      n = t.add_variable(3, Xt(r)).name;
    e.get_output_slot("x").write_direct(`${n}.x`),
      e.get_output_slot("y").write_direct(`${n}.y`),
      e.get_output_slot("z").write_direct(`${n}.z`);
  }
  function Of() {
    let t = new N(Gv);
    return (
      t.add_input_slot("input", 3),
      t.add_output_slot("x", 1),
      t.add_output_slot("y", 1),
      t.add_output_slot("z", 1),
      t
    );
  }
  W(Gv, Of, "variable float3 split");
  function Uv(t, e) {
    let r = e.get_input_slot("input").read() ?? "float4(0.0, 0.0, 0.0, 0.0)",
      n = t.add_variable(2, Xt(r)).name;
    e.get_output_slot("x").write_direct(`${n}.x`),
      e.get_output_slot("y").write_direct(`${n}.y`),
      e.get_output_slot("z").write_direct(`${n}.z`),
      e.get_output_slot("w").write_direct(`${n}.w`);
  }
  function Hf() {
    let t = new N(Uv);
    return (
      t.add_input_slot("input", 4),
      t.add_output_slot("x", 1),
      t.add_output_slot("y", 1),
      t.add_output_slot("z", 1),
      t.add_output_slot("w", 1),
      t
    );
  }
  W(Uv, Hf, "variable float4 split");
  function Mv(t, e) {}
  function Vf() {
    let t = new N(Mv);
    return t.add_output_slot("world position", 3, new b()), t;
  }
  W(Mv, Vf, "world position");
  function Cv(t, e) {}
  function jf() {
    let t = new N(Cv);
    return t.add_output_slot("world normal", 3, new b(0, 0, 1)), t;
  }
  W(Cv, jf, "world normal");
  function Lv(t, e) {}
  function FF() {
    return new N(Lv);
  }
  W(Lv, FF, "ddx");
  function zv(t, e) {}
  function AF() {
    return new N(zv);
  }
  W(zv, AF, "ddy");
  function Nv(t, e) {}
  function kF() {
    return new N(Nv);
  }
  W(Nv, kF, "fwidth");
  function Bv(t, e) {}
  function Xf() {
    let t = new N(Bv);
    return t.add_output_slot("world matrix", 7, new L(), !1), t;
  }
  W(Bv, Xf, "world matrix");
  function Wv(t, e) {}
  function PF() {
    let t = new N(Wv);
    return t.add_output_slot("normal matrix", 6, new Gr(), !1), t;
  }
  W(Wv, PF, "normal matrix");
  function Ov(t, e) {}
  function $f() {
    let t = new N(Ov);
    return t.add_output_slot("view matrix", 7, new L(), !1), t;
  }
  W(Ov, $f, "view matrix");
  function Hv(t, e) {}
  function qf() {
    let t = new N(Hv);
    return t.add_output_slot("projection matrix", 7, new L(), !1), t;
  }
  W(Hv, qf, "projection matrix");
  function Vv(t, e) {}
  function Qf() {
    let t = new N(Vv);
    return t.add_output_slot("inverse view projection", 7, new L()), t;
  }
  W(Vv, Qf, "inverse view projection");
  function jv(t, e) {}
  function Zf() {
    let t = new N(jv);
    return (
      t.add_input_slot("matrix", 7, new L(), !1),
      t.add_input_slot("input", 4, new M(), !1),
      t.add_output_slot("output", 4, new M(), !1),
      t
    );
  }
  W(jv, Zf, "mat4 transform");
  function Xv(t, e) {}
  function Yf() {
    let t = new N(Xv);
    return (
      t.add_input_slot("matrix", 6, new L(), !1),
      t.add_input_slot("input", 3, new b(), !1),
      t.add_output_slot("output", 3, new b(), !1),
      t
    );
  }
  W(Xv, Yf, "mat3 transform");
  function $v(t, e) {}
  function EF() {
    let t = new N($v);
    return t.add_input_slot("input", 20), t;
  }
  W($v, EF, "split");
  var tn = ((r) => (
    (r[(r.Global = 0)] = "Global"), (r[(r.Material = 1)] = "Material"), r
  ))(tn || {});
  function qv(t, e) {
    let r = t,
      o = e.get_input_slot("name").read(),
      n = e.get_input_slot("scope").read(),
      i = e.get_output_slot("output");
    r.add_property(o, i.type, o, i.value, n), i.write_direct(o);
  }
  function Jf() {
    let t = new N(qv);
    return (
      t.add_input_slot("name", 8, "Property", !0),
      t.add_input_slot("scope", 19, tn, !0, !1),
      t.add_output_slot("output", 1, 0, !0),
      t
    );
  }
  W(qv, Jf, "property float");
  function Qv(t, e) {
    let r = t,
      o = e.get_input_slot("name").read(),
      n = e.get_input_slot("scope").read(),
      i = e.get_output_slot("output");
    r.add_property(o, i.type, o, i.value, n), i.write_direct(o);
  }
  function Kf() {
    let t = new N(Qv);
    return (
      t.add_input_slot("name", 8, "Property", !0),
      t.add_input_slot("scope", 19, tn, !0, !1),
      t.add_output_slot("output", 2, new T()),
      t
    );
  }
  W(Qv, Kf, "property float2");
  function Zv(t, e) {
    let r = t,
      o = e.get_input_slot("name").read(),
      n = e.get_input_slot("scope").read(),
      i = e.get_output_slot("output");
    r.add_property(o, i.type, o, n), i.write_direct(o);
  }
  function eh() {
    let t = new N(Zv);
    return (
      t.add_input_slot("name", 8, "Property", !0),
      t.add_input_slot("scope", 19, tn, !0, !1),
      t.add_output_slot("output", 3, new b()),
      t
    );
  }
  W(Zv, eh, "property float3");
  function th(t, e) {
    let r = t,
      o = e.get_input_slot("name").read(),
      n = e.get_input_slot("scope").read(),
      i = e.get_output_slot("output");
    r.add_property(o, i.type, o, i.value, n), i.write_direct(o);
  }
  function Gu() {
    let t = new N(th);
    return (
      t.add_input_slot("name", 8, "Property", !0),
      t.add_input_slot("scope", 19, tn, !0, !1),
      t.add_output_slot("output", 4, new M()),
      t
    );
  }
  W(th, Gu, "property float4");
  function Yv(t, e) {
    let r = t,
      o = e.get_input_slot("name").read(),
      n = e.get_input_slot("scope").read(),
      i = e.get_output_slot("output");
    r.add_property(o, i.type, o, i.value, n), i.write_direct(o);
  }
  function rh() {
    let t = new N(Yv);
    return (
      t.add_input_slot("name", 8, "Property", !0),
      t.add_input_slot("scope", 19, tn, !0, !1),
      t.add_output_slot("output", 4, new M()),
      t
    );
  }
  W(Yv, rh, "property color");
  function DF(t, e) {
    let r = t,
      o = e.get_input_slot("name").read(),
      n = e.get_input_slot("scope").read(),
      i = e.get_output_slot("output");
    r.add_property(o, i.type, o, i.value, n), i.write_direct(o);
  }
  function GF() {
    let t = new N(th);
    return (
      t.add_input_slot("name", 8, "Property", !0),
      t.add_input_slot("scope", 19, tn, !0, !1),
      t.add_output_slot("output", 7, new L()),
      t
    );
  }
  W(DF, GF, "property mat4");
  var UF = `
#define skip_global_precision
#define float2 vec2
#define float3 vec3
#define float4 vec4

`,
    e1 = "material_chunk",
    MF = `uniform ${e1} {
`;
  function Jv(t, e) {
    return t.type - e.type;
  }
  var Uu = class {
    constructor(e) {
      this.stage = e;
      this.includes = new Set();
      this.varying = new Map();
      this.properties = [];
      this.textures = [];
      this.variables = [];
      this.variable_map = new Map();
      this.visited = new Set();
      this.body = "";
    }
    add_varying(e, r) {
      this.varying.set(e, r);
    }
    add_property(e, r, o, n, i = 0) {
      if (this.variable_map.has(e)) return this.variable_map.get(e);
      let a = this.add_variable(r, o),
        s = {
          name: e,
          type: r,
          variable_index: a.variable_index,
          default_value: n,
          scope: i,
        };
      return this.properties.push(s), a;
    }
    add_internal_property(e, r, o, n = 0) {
      if (this.variable_map.has(e)) return this.variable_map.get(e);
      let i = { name: e, type: r, default_value: o, scope: n };
      return this.properties.push(i), this.variable_map.set(e, i), i;
    }
    add_internal_texture(e, r, o, n = 0) {
      if (this.variable_map.has(e)) return this.variable_map.get(e);
      let i = { name: e, type: r, default_value: o, scope: n };
      return this.textures.push(i), this.variable_map.set(e, i), i;
    }
    add_texture(e, r, o, n) {
      if (this.variable_map.has(e)) return this.variable_map.get(e);
      let i = this.add_variable(4, o);
      this.variable_map.set(e, i);
      let a = 0,
        s = {
          name: e,
          type: r,
          variable_index: i.variable_index,
          default_value: n,
          scope: a,
        };
      return this.textures.push(s), i;
    }
    add_variable(e, r) {
      let o = this.variables.length,
        n = `${CF}${o}`,
        i = { name: n, type: e, variable_index: o, value: r };
      this.variables.push(i);
      let a = Du(e);
      return (
        (this.body += `${a} ${n} = ${r};
`),
        i
      );
    }
    interpret(e, r) {
      for (let o of r) o.func(e, o);
      this.assemble(e);
    }
    reset() {
      (this.properties = []),
        (this.textures = []),
        (this.variables = []),
        this.includes.clear(),
        this.varying.clear(),
        this.variable_map.clear(),
        this.visited.clear(),
        (this.body = "");
    }
    assemble(e) {
      let r = this.body;
      this.properties.sort(Jv), this.textures.sort(Jv);
      let o = e.uniform_set,
        n = e.descriptor,
        i = UF,
        a = this.stage === 1 ? "in" : "out";
      if (this.varying.size > 0) {
        for (let [s, c] of this.varying)
          i += `${a} ${Du(c)} ${s};
`;
        i += `
`;
      }
      if (this.properties.length > 0) {
        let s = "",
          c = "";
        for (let _ of this.properties)
          if (
            (_.scope === 0
              ? (c += `uniform ${oh(_)}`)
              : _.scope === 1 && (s += oh(_)),
            !o.has(_.name))
          ) {
            o.add(_.name);
            let l = {};
            (l.name = _.scope === 1 ? `${e1}.${_.name}` : _.name),
              (l.editable = !0),
              (l.type = Kv(_.type)),
              (l.default_value = _.default_value),
              n.uniforms.push(l);
          }
        s !== "" &&
          (s =
            MF +
            s +
            `};
`),
          (i +=
            c +
            `
` +
            s +
            `
`);
      }
      if (this.textures.length > 0) {
        for (let s of this.textures) {
          i += "uniform " + oh(s);
          let c = {};
          (c.name = s.name),
            (c.editable = !0),
            (c.type = Kv(s.type)),
            (c.default_value = s.default_value),
            n.uniforms.push(c);
        }
        i += `
`;
      }
      for (let s of this.includes)
        i += `#pragma include ${s}
`;
      return (
        this.stage === 1 &&
          (i += `
out float4 frag_data;
`),
        (r =
          i +
          `
void main() {
` +
          r +
          `}
`),
        this.stage === 0
          ? (n.vertex_shader = r)
          : this.stage === 1 && (n.fragment_shader = r),
        r
      );
    }
  };
  var CF = "tmp_",
    Mu = class extends Qn {
      constructor() {
        super(...arguments);
        this.descriptor = {};
        this.uniform_set = new Set();
        this.vertex_ctx = new Uu(0);
        this.pixel_ctx = new Uu(1);
        this.active_ctx = this.vertex_ctx;
      }
      reset() {
        this.vertex_ctx.reset(), this.pixel_ctx.reset();
      }
      add_property(r, o, n, i, a = 1) {
        return this.active_ctx.add_property(r, o, n, i, a);
      }
      add_texture(r, o, n, i) {
        return this.active_ctx.add_texture(r, o, n, i);
      }
      add_variable(r, o) {
        return this.active_ctx.add_variable(r, o);
      }
      compile(r) {
        (this.mode = 1), this.reset(), this.analysis(r);
        let o, n;
        for (let i of this.sorted_subgraphs)
          for (let a of i) {
            if (zF(a.func)) {
              o && console.error("graph contains multiply vertex output node"),
                (o = i);
              break;
            }
            if (NF(a.func)) {
              n && console.error("graph contains multiply pixel output node"),
                (n = i);
              break;
            }
          }
        return (
          (this.descriptor = { name: r.name, uniforms: [] }),
          this.uniform_set.clear(),
          o
            ? ((this.active_ctx = this.vertex_ctx),
              this.vertex_ctx.interpret(this, o))
            : BF(this),
          n
            ? ((this.active_ctx = this.pixel_ctx),
              this.pixel_ctx.interpret(this, n))
            : WF(this),
          console.log(this.descriptor.fragment_shader),
          (this.pipeline = Me(this.descriptor)),
          this.pipeline
        );
      }
    },
    LF = new Set();
  function zF(t) {
    return LF.has(t);
  }
  var t1 = new Set();
  function nh(t) {
    t1.add(t);
  }
  function NF(t) {
    return t1.has(t);
  }
  function oh(t) {
    return `${Du(t.type)} ${t.name};
`;
  }
  function Kv(t) {
    switch (t) {
      case 9:
        return 6;
      case 0:
        return 0;
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 3;
      case 4:
        return 4;
      case 6:
        return 8;
      case 7:
        return 9;
      case 15:
        return 10;
      case 16:
        return 12;
      case 17:
        return 11;
      case 18:
        return 13;
      default:
        throw `invalid graph slot type ${t}`;
    }
  }
  function r1(t) {
    let e = t.uniform_set,
      r = t.descriptor.uniforms;
    function o(n, i) {
      e.has(n) || (r.push(i), e.add(n));
    }
    o("world_matrix", { name: "world_matrix", type: 9 }),
      o("view_matrix", { name: "view_matrix", type: 9 }),
      o("normal_matrix", { name: "normal_matrix", type: 8 }),
      o("projection_matrix", { name: "projection_matrix", type: 9 }),
      e.has("cascade_constant") ||
        (r.push({
          name: "cascade_constant.shadow_near",
          type: 1,
          default_value: 1,
        }),
        r.push({ name: "cascade_constant.shadow_far", type: 1 }),
        r.push({
          name: "cascade_constant.shadow_radius",
          type: 1,
          default_value: 2,
        }),
        r.push({ name: "cascade_constant.shadow_map_size", type: 2 }),
        r.push({
          name: "cascade_constant.shadow_bias",
          type: 1,
          default_value: 0.001,
        }),
        r.push({
          name: "cascade_constant.shadow_normal_bias",
          type: 1,
          default_value: 0.001,
        }),
        e.add("cascade_constant"));
  }
  function BF(t) {
    r1(t), (t.descriptor.vertex_shader = ie("shader/standard/lit.vert"));
  }
  function WF(t) {
    r1(t), (t.descriptor.fragment_shader = ie("shader/standard/lit.frag"));
  }
  function ih(t, e) {}
  function ah() {
    return new N(ih);
  }
  W(ih, ah, "surface unlit");
  nh(ih);
  function sh(t, e) {
    let r = t,
      o = Xt(e.get_input_slot("base_color").read()),
      n = Xt(e.get_input_slot("metallic").read()),
      i = Xt(e.get_input_slot("roughness").read()),
      a = Xt(e.get_input_slot("ao").read()),
      s = Xt(e.get_input_slot("normal").read()),
      c = Xt(e.get_input_slot("alpha").read()),
      _ = r.active_ctx;
    _.includes.add("cascade_shadow"),
      _.includes.add("common"),
      _.includes.add("pbr"),
      _.includes.add("dither"),
      _.add_varying("v_world_position", 3),
      _.add_varying("v_world_normal", 3),
      _.add_varying("v_uv", 2),
      _.add_internal_property("view_matrix", 7, void 0, 0),
      _.add_internal_property("camera_position", 3, void 0, 0),
      _.add_internal_texture("env_map", 17),
      (_.body =
        `float light_shadow = cascade_shadow_fetch(v_world_position);
vec3 normal = normalize(v_world_normal);
vec3 view = normalize(v_world_position - camera_position);
` + _.body),
      (_.body += `float3 brdf_sample = standard_metallic_flow(normal, view, ${o}, ${n}, ${i}, ${a});
`),
      (_.body += `frag_data = float4(brdf_sample, ${c});
`),
      (_.body += `frag_data.xyz = screen_dither(aces_tonemap(frag_data.xyz));
`);
  }
  function ch() {
    let t = new N(sh);
    return (
      t.add_input_slot("base_color", 3, new b(1, 1, 1), !0),
      t.add_input_slot("metallic", 1, 0.04, !0),
      t.add_input_slot("roughness", 1, 0.8, !0),
      t.add_input_slot("normal", 3, new b(0.5, 0.5, 1), !0),
      t.add_input_slot("ao", 1, 1, !0),
      t.add_input_slot("alpha", 1, 1, !0),
      t.add_input_slot("ior", 1, 1.4, !0),
      t
    );
  }
  W(sh, ch, "surface lit");
  nh(sh);
  function o1(t, e) {
    let r = e.get_output_slot("color"),
      o = e.get_output_slot("alpha"),
      n = e.get_output_slot("rgba");
    if (r.outputs.size === 0 && o.outputs.size === 0 && n.outputs.size === 0)
      return;
    let i = t,
      a = e.get_input_slot("name").value,
      s = Xt(e.get_input_slot("uv").value ?? "v_uv"),
      c = i.add_texture(a, 15, `texture(${a}, ${s})`);
    r.write_direct(`${c.name}.rgb`),
      o.write_direct(`${c.name}.a`),
      n.write_direct(`${c.name}.rgba`);
  }
  function _h() {
    let t = new N(o1);
    return (
      t.add_input_slot("name", 8, "Texture", !0),
      t.add_input_slot("uv", 2),
      t.add_output_slot("color", 3, new b(1, 1, 1)),
      t.add_output_slot("alpha", 1, 1),
      t.add_output_slot("rgba", 4, new M(1, 1, 1, 1)),
      t
    );
  }
  W(o1, _h, "sampler 2d");
  function n1(t, e) {
    let r = e.get_output_slot("color"),
      o = e.get_output_slot("alpha"),
      n = e.get_output_slot("rgba");
    if (r.outputs.size === 0 && o.outputs.size === 0 && n.outputs.size === 0)
      return;
    let i = t,
      a = e.get_input_slot("name").value,
      s = Xt(e.get_input_slot("uvw").value),
      c = i.add_texture(a, 15, `texture(${a}, ${s})`);
    r.write_direct(`${c.name}.rgb`),
      o.write_direct(`${c.name}.a`),
      n.write_direct(`${c.name}.rgba`);
  }
  function lh() {
    let t = new N(n1);
    return (
      t.add_input_slot("name", 8, "Texture", !0),
      t.add_input_slot("uvw", 3, new b(0.5, 0.5, 0.5)),
      t.add_output_slot("color", 3, new b(1, 1, 1)),
      t.add_output_slot("alpha", 1, 1),
      t.add_output_slot("rgba", 4, new M(1, 1, 1, 1)),
      t
    );
  }
  W(n1, lh, "sampler cube");
  function i1(t, e) {
    let r = e.get_output_slot("color"),
      o = e.get_output_slot("alpha"),
      n = e.get_output_slot("rgba");
    if (r.outputs.size === 0 && o.outputs.size === 0 && n.outputs.size === 0)
      return;
    let i = t,
      a = e.get_input_slot("name").value,
      s = Xt(e.get_input_slot("uvw").value),
      c = i.add_texture(a, 15, `texture(${a}, ${s})`);
    r.write_direct(`${c.name}.rgb`),
      o.write_direct(`${c.name}.a`),
      n.write_direct(`${c.name}.rgba`);
  }
  function uh() {
    let t = new N(i1);
    return (
      t.add_input_slot("name", 8, "Texture", !0),
      t.add_input_slot("uvw", 3, new b(0.5, 0.5, 0.5)),
      t.add_output_slot("color", 3, new b(1, 1, 1)),
      t.add_output_slot("alpha", 1, 1),
      t.add_output_slot("rgba", 4, new M(1, 1, 1, 1)),
      t
    );
  }
  W(i1, uh, "sampler 2d array");
  function a1(t, e) {
    let r = e.get_output_slot("color"),
      o = e.get_output_slot("alpha"),
      n = e.get_output_slot("rgba");
    if (r.outputs.size === 0 && o.outputs.size === 0 && n.outputs.size === 0)
      return;
    let i = t,
      a = e.get_input_slot("name").value,
      s = Xt(e.get_input_slot("uvw").value),
      c = i.add_texture(a, 15, `texture(${a}, ${s})`);
    r.write_direct(`${c.name}.rgb`),
      o.write_direct(`${c.name}.a`),
      n.write_direct(`${c.name}.rgba`);
  }
  function ph() {
    let t = new N(a1);
    return (
      t.add_input_slot("name", 8, "Texture", !0),
      t.add_input_slot("uvw", 3, new b(0.5, 0.5, 0.5)),
      t.add_output_slot("color", 3, new b(1, 1, 1)),
      t.add_output_slot("alpha", 1, 1),
      t.add_output_slot("rgba", 4, new M(1, 1, 1, 1)),
      t
    );
  }
  W(a1, ph, "sampler 3d");
  function s1(t, e) {}
  function dh() {
    return new N(s1);
  }
  W(s1, dh, "vertex");
  function c1(t, e) {}
  function mh() {
    return new N(c1);
  }
  W(c1, mh, "skin vertex");
  function Le(t) {
    let e = h(we).state.tab,
      o = Qi(e).graph;
    if (!o) return;
    let n = t();
    o.add_node(n), o.clear_active(), o.set_active_node(n);
    let i = Fu(e),
      { offset: a, scale: s } = i.flex_view;
    (n.rect.x = 100 - a.x * s), (n.rect.y = 100 - a.y * s);
  }
  var _1 = new WeakMap();
  function Qi(t) {
    let e = _1.get(t);
    if (!e) {
      (e = {}), (e.interpreter = new Mu());
      let r = new P("compile");
      (r.shadow = !0), (e.compile_btn = r), _1.set(t, e);
    }
    return e;
  }
  var fh = new x(),
    as = new x(),
    OF = { width: 64, height: 22, alignment: 36, margin: new Jr(10, 0, 0, 10) };
  function l1(t, e) {
    let r = Qi(t);
    r.node_ref = new WeakRef(e);
  }
  function HF(t) {
    let e = {},
      { node_ref: r } = Qi(t),
      o = Ps(r);
    return o && (e.guid = o.guid), e;
  }
  function VF(t, e) {
    let r = Qi(t),
      o = h(Z).get_node_by_guid(e.guid);
    o && (r.node_ref = new WeakRef(o));
  }
  function Cu(t) {
    let { graph: e, node_ref: r } = Qi(t.tab);
    Ps(r) && (fh.copy(t.tab_rect), Au(t, e, fh), jF(t));
  }
  function jF(t) {
    let { compile_btn: e } = Qi(t.tab),
      r = h(F).theme,
      o = XF();
    if (
      (yt(fh, OF, as),
      $n(t, o, r.node, as),
      (as.x += as.w + 10),
      (as.w = e.label.text_size.x + 16),
      E(t, e, r.node, as))
    ) {
      let { interpreter: n, graph: i } = Qi(t.tab),
        a = n.compile(i);
    }
  }
  Fe(Cu, "ui_tab_shader_graph");
  Ko(Cu, HF, VF);
  var so;
  function XF() {
    if (!so) {
      (so = new Kr("add node")), (so.shadow = !0);
      let t = so.add_sub_menu("simd");
      t.add_sub_menu("float", Le.bind(null, Lf)),
        t.add_sub_menu("float2", Le.bind(null, zf)),
        t.add_sub_menu("float3", Le.bind(null, Nf)),
        t.add_sub_menu("float4", Le.bind(null, Bf)),
        t.add_sub_menu("float2 split", Le.bind(null, Wf)),
        t.add_sub_menu("float3 split", Le.bind(null, Of)),
        t.add_sub_menu("float4 split", Le.bind(null, Hf));
      let e = so.add_sub_menu("property");
      e.add_sub_menu("property float", Le.bind(null, Jf)),
        e.add_sub_menu("property float2", Le.bind(null, Kf)),
        e.add_sub_menu("property float3", Le.bind(null, eh)),
        e.add_sub_menu("property float4", Le.bind(null, Gu)),
        e.add_sub_menu("property color", Le.bind(null, rh)),
        e.add_sub_menu("property mat4", Le.bind(null, Gu));
      let r = so.add_sub_menu("transform");
      r.add_sub_menu("world matrix", Le.bind(null, Xf)),
        r.add_sub_menu("view matrix", Le.bind(null, $f)),
        r.add_sub_menu("projection matrix", Le.bind(null, qf)),
        r.add_sub_menu("ndc to world", Le.bind(null, Qf)),
        r.add_sub_menu("mat4 transform", Le.bind(null, Zf)),
        r.add_sub_menu("mat3 transform", Le.bind(null, Yf));
      let o = so.add_sub_menu("model data");
      o.add_sub_menu("world position", Le.bind(null, Vf)),
        o.add_sub_menu("world normal", Le.bind(null, jf));
      let n = so.add_sub_menu("vertex");
      n.add_sub_menu("vertex", Le.bind(null, dh)),
        n.add_sub_menu("skin vertex", Le.bind(null, mh));
      let i = so.add_sub_menu("texture");
      i.add_sub_menu("texture 2d", Le.bind(null, _h)),
        i.add_sub_menu("texture 2d array", Le.bind(null, uh)),
        i.add_sub_menu("texture 3d", Le.bind(null, ph)),
        i.add_sub_menu("texture cube", Le.bind(null, lh));
      let a = so.add_sub_menu("surface");
      a.add_sub_menu("lit", Le.bind(null, ch)),
        a.add_sub_menu("unlit", Le.bind(null, ah));
      let s = so.add_sub_menu("lighting");
      s.add_sub_menu("camera data", Le.bind(null, Cf)),
        s.add_sub_menu("spherical harmonics", Le.bind(null, Mf));
    }
    return so;
  }
  function Lu(t) {
    let e = t.data,
      r = {};
    return (
      !e ||
        !e.skeleton ||
        ((r.tree = Hb(e.skeleton.bones[0])), (r.name = e.skeleton.name)),
      r
    );
  }
  async function u1(t, e) {
    let r = t.data,
      o = Vb(e.tree, Cr);
    return (r.skeleton = new Nn(e.name)), r;
  }
  var Fc = new b(),
    p1 = new $(),
    d1 = new b(),
    zu = new b(),
    m1 = new T(),
    Nu = new be(),
    co = new x(),
    f1 = new WeakMap();
  function Ac(t) {
    let e = f1.get(t);
    if (!e) {
      (e = {}),
        (e.bones = new WeakMap()),
        (e.labels = new WeakMap()),
        (e.camera = new Ye()),
        e.camera.location.set(0, 0, -15),
        (e.control = new zn(e.camera)),
        (e.control.move_speed = 0.01),
        (e.label_toggle = new P("toggle labels")),
        (e.render_label = !1);
      let r = new Zt();
      r.set_option("generic", 0),
        r.set_option("humanoid", 1),
        (e.type_select = r),
        f1.set(t, e);
    }
    return e;
  }
  function $F(t, e) {
    let r = Ac(t);
    if (((r.resource = e), !e || !e.data)) return;
    let o = e.data.skeleton;
    console.log(Lu(e));
    let n = o.bones,
      { bones: i, labels: a } = r;
    Nu.reset(), console.log(o), ya(o.bones[0]);
    for (let _ of n) {
      Nu.expand_point(_.world_location);
      let l = new re(_.name);
      a.set(_, l);
    }
    let { camera: s, control: c } = r;
    s.fit_box(Nu), c.set_target(s.location), c.set_center(Nu.center);
    for (let _ of n)
      if (_.children.length > 0) {
        let l = [];
        for (let u = 0; u < _.children.length; u++) {
          let d = _.children[u];
          b.Subtract(d.world_location, _.world_location, zu);
          let p = zu.length;
          d1.set(p, p, p),
            zu.normalize(),
            p1.from_unit_vectors(b.NEGATIVE_Z, zu);
          let m = new L().compose(_.world_location, p1, d1);
          l.push({ world_matrix: { value: m } });
        }
        i.set(_, l);
      }
  }
  function Bu(t) {
    let e = t.tab,
      r = Ac(e),
      {
        resource: o,
        bones: n,
        labels: i,
        camera: a,
        control: s,
        render_label: c,
      } = r;
    if (!o || !o.data) return;
    let _ = o.data.skeleton,
      l = t.tab_rect,
      u = _.bones,
      d = xy().encoder,
      p = Ro("bone"),
      m = ge("model_icon");
    if (h(we)) {
      let g = h(we).dock_system,
        v = t.is_tab_active(t.tab) && t.ishovering(l);
      t.active === -1 &&
        v &&
        (t.left_mouse_is_pressed &&
          (s.rotate_horizontal(t.pointer_delta.x / l.w),
          s.rotate_vertical(t.pointer_delta.y / l.h)),
        s.zoom(t.mouse_wheel),
        t.right_mouse_is_pressed &&
          (m1.set(t.pointer_delta.x, t.pointer_delta.y), s.move(m1))),
        s.update(t.delta_time) && (t.needs_update = !0);
    }
    t.renderer.set_screen_pass(l, "skeleton_editor"),
      d.set_pipeline(m),
      Vt(t.buffer, l, Be),
      a.resize(l.w, l.h),
      d.set_camera(a);
    let y = t.buffer.write_clip(l);
    for (let g of u) {
      let v = n.get(g);
      if (v) for (let w of v) d.set_draw(p, w);
      if (c) {
        let w = i.get(g);
        Fc.copy(g.world_location),
          a.project(Fc),
          (co.x = l.x + ((Fc.x + 1) * l.w - w.text_size.x) * 0.5),
          (co.y = l.y + ((1 - Fc.y) * l.h - w.text_size.y) * 0.5),
          V(t, w, co, 0, y);
      }
    }
    d.set_pass(), ZF(t);
  }
  function qF(t) {
    let e = Ac(t),
      r = e.resource,
      o = {};
    return (
      r &&
        ((o.resource_uuid = r.uuid),
        (o.camera_location = Array.from(e.camera.location.elements)),
        (o.control_center = Array.from(e.control.center.elements))),
      o
    );
  }
  function QF(t, e) {
    let r = Ac(t),
      o = h(J).get_resource(e.resource_uuid);
    if (o && ($F(t, o), e.camera_location && e.control_center)) {
      let n = e.camera_location;
      r.camera.location.read(n),
        r.control.set_target(r.camera.location),
        r.control.set_center(Fc.read(e.control_center));
    }
  }
  Fe(Bu, "ui_tab_skeleton_editor");
  Ko(Bu, qF, QF);
  function ZF(t) {
    let e = h(F).theme,
      r = t.tab_rect,
      o = Ac(t.tab),
      { label_toggle: n, type_select: i } = o;
    co.copy(r),
      (co.y += 10),
      (co.x += 10),
      (co.w = 84),
      (co.h = 22),
      E(t, n, e.button_primary, co, 0) && (o.render_label = !o.render_label),
      (co.y += co.h + 10),
      Yr(t, i, e.panel_layer_1, co, 0);
  }
  function h1(t, e) {
    let r = t.create_entity_with_prototype_name("transform_node"),
      o = e.scene.children;
    for (let n = 0; n < o.length; ++n) b1(t, o[n], r);
    h(Z).changed = !0;
  }
  function b1(t, e, r) {
    let o = h(F).draco_encoder,
      n,
      i = h(Z),
      a = h(J);
    if (e.mesh !== void 0) {
      n = t.create_entity_with_prototype_name("model");
      let s = ce({ primitive: e.mesh, uniforms: { color_map: We("white") } }),
        c = a.create_resource(1, s);
      t.set_property(n, "model.model", c.uuid);
      let _ = i.create_empty_file("file", `${e.name}.drc`);
      c.file = _;
      let l = kc(
        "default_double_side.material",
        a.create_resource_typed(tt.Material),
      );
      t.set_property(n, "model.material", l.uuid),
        o.encode(e.mesh).then((u) => {
          _.data = new $e(u);
        }),
        i.create_empty_file("resource", e.name);
    } else n = t.create_entity_with_prototype_name("transform_node");
    t.set_property(n, "entity.name", e.name),
      t.set_property(n, "transform.location", e.location),
      t.set_property(n, "transform.rotation", e.rotation),
      t.set_property(n, "transform.scale", e.scale),
      t.set_property(n, "transform.parent", r);
    for (let s = 0; s < e.children.length; ++s) b1(t, e.children[s], n);
  }
  var y1 = new be();
  function g1(t, e, r) {
    let o = h(ee).data_center,
      n = h(J),
      i = h(Z),
      a = ss(r.name);
    if (a === 1) {
      let s = o.create_entity_with_prototype_name("script_model");
      o.set_property(s, "model.model", r.resource_uuid);
      let c = i.get_node_by_path("/builtin/csm.material").resource_uuid;
      o.set_property(s, "model.material", c);
      let _ = n.get_resource(r.resource_uuid);
      y1.copy(_.data.draw.box),
        o.set_property(s, "model.box", y1),
        Je(o, s),
        t.clear_active(),
        To(t, e, [s]),
        Sm(e, 3);
    } else
      a === 4 &&
        (t.clear_active(),
        h1(o, n.get_resource(r.resource_uuid).data),
        Sm(e, 3));
  }
  var rn, An;
  function YF() {
    return (
      rn ||
      ((rn = new Kr()),
      rn.add_sub_menu("create").add_sub_menu("folder", JF),
      rn.add_sub_menu("delete", KF),
      rn.add_sub_menu("rename", eA),
      rn.add_sub_menu("copy path", tA),
      rn.add_sub_menu("properties", rA),
      (rn.render_base_menu = !1),
      rn)
    );
  }
  function JF() {
    if (!An) return;
    h(Z).create_empty_folder();
  }
  function KF() {
    if (!An) return;
    let t = h(Z),
      e = h(J);
    t.remove_node(An), e.remove_resource(An.resource_uuid);
  }
  function eA() {}
  function tA() {
    An && navigator.clipboard.writeText(An.path);
  }
  function rA() {}
  function x1(t, e) {
    let r = YF();
    (An = e), ev(t, r);
  }
  function S1(t, e, r, o, n, i = 0, a = 0) {
    let s = nA(e),
      c = t.buffer.layers[i],
      _ = s.id;
    a = t.buffer.write_clip(o, a);
    let l = t.tab,
      u = S(de),
      d = S(T),
      p = S(T),
      m = S(x),
      f = S(x),
      y = S(x),
      g = S(M),
      v = S(M);
    Ta(g, 4, 4, 0, 0), Ta(v, 4, 0, 4, 0);
    let w = h(F).theme;
    u.copy(r);
    let k = !1;
    t.ishovering(o) &&
      t.active === -1 &&
      i >= t.hover_layer &&
      ((t.next_hover = _), (t.next_hover_layer_index = i)),
      t.hover === _ && u.color.copy(r.hover_color);
    let G = t.active === _;
    t.hover === _ &&
      (t.left_mouse_press || t.right_mouse_press) &&
      (u.color.copy(r.active_color),
      t.active !== _ && d.copy(t.mouse_location),
      t.set_active(_));
    let U = !1;
    if (
      (m.copy(o),
      G &&
        !t.ishovering(o) &&
        ((i += 1),
        (c = t.buffer.layers[i]),
        p.copy(t.mouse_location).sub(d),
        (m.x = m.x + p.x),
        (m.y = m.y + p.y),
        ue(c, w.tab, o, s.radiuses, a)),
      G && (t.left_mouse_release || t.right_mouse_release))
    ) {
      t.clear_active(),
        o.contains(t.mouse_location) &&
          (t.check_double_click(_)
            ? (k = !0)
            : t.right_mouse_release && x1(t, e)),
        t.set_double_click_id(_);
      let Y = gn(t.hover);
      if (mc(Y) && Y.drop) Y.drop(e);
      else {
        let le = h(we);
        if (le) {
          let X = le.dock_system,
            Qe = gn(X.hover_dock_node);
          if (nr.is(Qe) && Qe.is_leaf) {
            let Ge = Qe.tabs[Qe.active_tab];
            Ge.on_gui === Wi && g1(t, Ge, e);
          }
        }
      }
      U &&
        e.parent &&
        (e.parent.remove(e),
        h(J).remove_resource_with_guid(e.guid),
        F1(l),
        A1(l));
    }
    if (
      (s.radiuses.all_zero() ? O(c, u, m, a) : ue(c, u, m, s.radiuses, a),
      n === 0
        ? ((s.label.alignment = 36),
          (s.label.padding.x = 70),
          (s.label.padding.w = 4))
        : n === 1 &&
          ((s.label.alignment = 33),
          (s.label.padding.x = 0),
          (s.label.padding.w = o.h + 4)),
      V(t, s.label, m, i, a),
      e.type === "resource")
    )
      n === 0
        ? (f.copy(m), (f.h = f.w), R1(t, e, f, g, i, a))
        : (f.copy(m), (f.w = f.h), R1(t, e, f, v, i, a));
    else {
      let Y = U ? P1 : oA(e);
      n === 0
        ? (y.copy(m), (y.h = y.w), y.shrink(U ? 12 : 4), Y(t.buffer, y, a))
        : n === 1 &&
          (y.copy(m),
          (y.w = y.h),
          (y.x += 2),
          (y.y -= 1),
          y.shrink(1),
          Y(t.buffer, y, a));
    }
    if (n === 0) {
      let Y = T1(e);
      (Y.alignment = 24),
        (Y.padding_right = 3),
        y.copy(m),
        V(t, Y, y, 0, a, w.auxiliary);
    } else if (n === 1) {
      let Y = T1(e);
      (Y.alignment = 9), (Y.padding.y = 5), V(t, Y, m, 0, a, w.auxiliary);
    }
    if (hh === e && t.active === kn.id) {
      let Y = h(F).theme;
      At(t, kn, Y.input, Vr, 1) &&
        (t.clear_active(), (hh.name = kn.label.text));
    }
    return (
      t.ishovering(o) &&
        t.key_press.has(13) &&
        (kn ||
          ((kn = new qe()), (kn.label.alignment = 33), (kn.padding_left = 4)),
        t.set_active(kn.id),
        (kn.text = e.name),
        n === 0
          ? (Vr.copy(m),
            (Vr.x -= 4),
            (Vr.y += bh - 3),
            (Vr.w = 120),
            (Vr.h = on),
            Vr.shrink(4))
          : n === 1 &&
            (Vr.copy(m),
            (Vr.w = 120),
            (Vr.h = on),
            (Vr.x += Vr.h - 4),
            Vr.shrink(4)),
        (hh = e)),
      R(u),
      R(d),
      R(p),
      R(m),
      R(f),
      R(y),
      R(g),
      R(v),
      k
    );
  }
  var Vr = new x(),
    hh,
    kn,
    w1 = new WeakMap();
  function oA(t) {
    let e = w1.get(t);
    return (
      e ||
      (t.type === "folder"
        ? (e = t.children.length > 0 ? Fa : Xn)
        : t.type === "file"
          ? (e = tc)
          : (e = k1),
      w1.set(t, e),
      e)
    );
  }
  var v1 = new WeakMap();
  function nA(t) {
    let e = v1.get(t);
    return (
      e ||
        ((e = new P(t.name)),
        (e.label.alignment = 36),
        (e.radius = 4),
        v1.set(t, e)),
      t.name !== e.label.text && (e.label.text = t.name),
      e
    );
  }
  var I1 = new WeakMap();
  function T1(t) {
    let e = I1.get(t);
    if (e) return e;
    let r = t.type;
    if (t.type === "resource") {
      let o = ss(t.name);
      r = Wu(o).toLocaleLowerCase();
    }
    return (e = new re(r)), I1.set(t, e), e;
  }
  function R1(t, e, r, o, n = 0, i = 0) {
    let a = h(J).get_resource_with_guid(e.guid);
    a ? j0(t, a, r, o, n, i) : tc(t.buffer.layers[n], r, i);
  }
  var cs = 34,
    iA = 120,
    aA = 200,
    on = 24,
    Ou = 24,
    bh = 68,
    sA = 98,
    cA = 28,
    _s = 8,
    E1 = new WeakMap();
  function F1(t) {
    let e = Pn(t);
    e.active_changed = !0;
  }
  function A1(t) {
    let e = Pn(t);
    e.structure_changed = !0;
  }
  var me = new x(),
    Rt = new x();
  function Xi(t) {
    let e = Pn(t.tab),
      r = t.buffer.write_clip(t.tab_rect),
      o = h(Z);
    (e.structure_changed || o.changed) && ((e.items = []), U1(e, o.root)),
      (e.active_changed || o.changed) &&
        ((e.active_nodes = []), pA(t, e.active_node));
    let { tree_view_width: n } = e;
    Rt.copy(t.tab_rect),
      (Rt.h = cs),
      (Rt.w = t.tab_rect.w - n),
      (Rt.x += n),
      hA(t, Rt, r),
      Rt.copy(t.tab_rect),
      (Rt.h -= cs),
      (Rt.y += cs),
      (Rt.w = n),
      dA(t, Rt, r),
      Rt.copy(t.tab_rect),
      (Rt.x += n),
      (Rt.y += cs),
      (Rt.w -= n),
      (Rt.h -= cs),
      yA(t, Rt, r),
      Rt.copy(t.tab_rect),
      (Rt.w = n),
      (Rt.h = cs),
      lA(t, Rt, r);
  }
  Fe(Xi, "ui_tab_file_browser");
  function Pn(t) {
    let e = E1.get(t);
    if (!e) {
      let r = new P("New Folder");
      (r.label.alignment = 33), (r.label.padding_left = 24);
      let o = new Kr("Create Resource");
      o.radiuses.set(Be, 0, 0, 0),
        o.add_sub_menu("Script", Dc.bind(null, t, 3)),
        o.add_sub_menu("Texture", Dc.bind(null, t, 5)),
        o.add_sub_menu("Material", Dc.bind(null, t, 2)),
        o.add_sub_menu("Shader", Dc.bind(null, t, 6)),
        o.add_sub_menu("Graph", Dc.bind(null, t, 7)),
        (e = {
          path_scroll_y: 0,
          file_scroll_y: 0,
          active_nodes: [],
          buttons: new WeakMap(),
          breadcrumb_buttons: new WeakMap(),
          file_buttons: new WeakMap(),
          items: [],
          structure_changed: !0,
          active_changed: !0,
          active_node: h(Z).root,
          folder_view_type: 0,
          tree_view_width: aA,
          resize_btn: new P(),
          create_folder_btn: r,
          create_file_menu: o,
        }),
        E1.set(t, e);
    }
    return e;
  }
  var Et = new x(),
    _A = new M(Be, 0, 0, 0);
  function lA(t, e, r) {
    let o = Pn(t.tab),
      n = h(F).theme,
      { create_folder_btn: i, create_file_menu: a } = o;
    ue(t.buffer, n.panel_layer_0, e, _A, r),
      Et.copy(e),
      (Et.y += 1),
      (Et.w = 102),
      Et.shrink(5),
      me.copy(Et);
    let s = h(Z);
    E(t, i, n.panel_layer_1, Et, 0, r) && M1(s.root),
      (Et.w = Et.h),
      Et.shrink(4),
      (Et.y -= 1),
      (Et.x += 1),
      ec(t.buffer, Et, r),
      Et.copy(me),
      (Et.x += Et.w + 4),
      (Et.w = e.w - 106),
      $n(t, a, n.panel_layer_2, e, 0, r);
  }
  function uA(t, e) {
    let r = t.buttons.get(e);
    return (
      r === void 0 &&
        ((r = new P(e.name)),
        t.buttons.set(e, r),
        (r.label.alignment = 36),
        (r.radius = 0)),
      r
    );
  }
  function U1(t, e, r = 0) {
    let o = t.items;
    for (let n = 0; n < e.children.length; ++n) {
      let i = e.children[n];
      if (i.type !== "folder") continue;
      let a = i.opened ? (i.children.length > 0 ? Fa : Xn) : ec,
        s = { node: i, depth: r, button: uA(t, i), icon: a };
      o.push(s), i.opened && i.children.length > 0 && U1(t, i, r + 1);
    }
    t.structure_changed = !1;
  }
  function pA(t, e) {
    let r = Pn(t.tab),
      o = e,
      n = r.active_nodes;
    for (n.push(e); o.parent && !o.parent.is_root; )
      n.push(o.parent), (o = o.parent);
    n.reverse(), (r.active_changed = !1), e.type !== "folder" && (e = e.parent);
    for (let i = 0; i < e.children.length; i++) {
      let a = e.children[i],
        s = r.file_buttons.get(a);
      s === void 0 &&
        ((s = new P("")),
        (s.label.alignment = 36),
        (s.radius = 4),
        r.file_buttons.set(a, s)),
        (s.label.text = a.name);
    }
  }
  function dA(t, e, r) {
    let o = Pn(t.tab),
      n = h(F).theme;
    t.ishovering(e) &&
      (o.path_scroll_y = Math.max(
        0,
        Math.min(
          o.path_scroll_y + t.mouse_wheel_raw,
          o.items.length * on - e.h,
        ),
      )),
      mA(t, o, e, o.items, o.path_scroll_y, r);
  }
  var ls = new x(),
    Pc = new x(),
    nn,
    D1;
  function mA(t, e, r, o, n, i) {
    nn === void 0 && ((nn = new qe()), (nn.label.alignment = 33));
    let a = h(F).theme;
    t.active === nn.id &&
      At(t, nn, a.input, Pc, 1, i) &&
      (t.clear_active(), (D1.name = nn.label.text));
    let s = Math.min(o.length, Math.floor(n / on)),
      c = s + Math.max(0, Math.ceil(r.h / on));
    me.copy(r), (me.y = me.y + s * on - n), (me.h = on);
    for (let _ = s; _ < c; _++) {
      let l = o[_];
      if (l === void 0) continue;
      let { node: u, button: d, depth: p, icon: m } = l;
      d.label.text !== u.name && (d.label.text = u.name),
        E(t, d, a.button_file, me, 0, i) &&
          ((u.opened = !u.opened),
          (e.active_node = u),
          (e.structure_changed = !0),
          (e.active_changed = !0)),
        (d.label.alignment = 33),
        (d.label.padding.w = Ou + Ou * p * 0.5),
        ls.copy(me),
        (ls.w = on),
        ls.shrink(5),
        (ls.y -= 2),
        (ls.x += Ou * p * 0.5),
        m(t.buffer, ls, i),
        t.ishovering(me) &&
          t.key_press.has(13) &&
          t.active !== nn.id &&
          ((nn.label.padding.w = 2),
          t.set_active(nn.id),
          (nn.label.text = u.name),
          Pc.copy(me),
          (Pc.x += Ou * p * 0.5),
          (Pc.w = iA),
          Pc.shrink(4),
          (D1 = u),
          t.key_press.delete(13)),
        (me.y += on);
    }
  }
  var Po = new x(),
    yh,
    G1 = 12,
    fA = new M(0, Be, 0, 0),
    Ec;
  function hA(t, e, r) {
    yh === void 0 && (yh = new re("/")), Ec === void 0 && (Ec = new P("/"));
    let o = h(F).theme;
    ue(t.buffer, o.panel_layer_1, e, fA, r);
    let n = t.tab,
      i = Pn(n);
    if (i === void 0) return;
    let a = i.detail_view_btn,
      s = i.grid_view_btn;
    if (
      (a === void 0 &&
        ((a = new P()),
        a.radiuses.set(3, 0, 3, 0),
        (i.detail_view_btn = a),
        (s = new P()),
        s.radiuses.set(0, 3, 0, 3),
        (i.grid_view_btn = s)),
      Po.copy(e),
      (Po.w = Po.h),
      Po.shrink(5),
      (Po.x += e.w - 60),
      E(t, a, o.button_link, Po, 0, r) &&
        ((i.folder_view_type = 1), (i.active_changed = !0)),
      au(t.buffer, Po, r),
      (Po.x += Po.w + 0.8),
      E(t, s, o.button_link, Po, 0, r) &&
        ((i.folder_view_type = 0), (i.active_changed = !0)),
      su(t.buffer, Po, r),
      me.copy(e),
      (me.x += 10),
      (me.y += (me.h - Ec.label.text_size.y) >>> 1),
      (me.h = Ec.label.text_size.y + 4),
      (me.w = G1),
      E(t, Ec, o.button_link, me, 0, r))
    ) {
      let _ = h(Z);
      i.active_node !== _.root &&
        ((i.active_node = _.root), (i.active_changed = !0));
    }
    let c = i.active_nodes;
    if (!(c.length === 1 && c[0].is_root)) {
      me.copy(e), (me.x += 12), (me.y += 1);
      for (let _ = 0; _ < c.length; _++) {
        let l = c[_];
        if (l.type !== "folder") return;
        (me.w = G1), _ !== 0 && V(t, yh, me, 0, r), (me.x += me.w);
        let u = i.breadcrumb_buttons.get(l);
        u === void 0 && ((u = new P(l.name)), i.breadcrumb_buttons.set(l, u)),
          (me.w = u.label.text_size.x + 16),
          Et.copy(me),
          Et.shrink(8, 0),
          E(t, u, o.button_link, Et, 0, r) &&
            i.active_node !== l &&
            ((i.active_node = l), (i.active_changed = !0)),
          (me.x += me.w);
      }
    }
  }
  var bA = new M(0, 0, 0, Be);
  function yA(t, e, r) {
    let o = h(Z),
      n = Pn(t.tab),
      i = n.active_node;
    if (i === void 0) return;
    let a = n.folder_view_type,
      s = h(F).theme;
    if (
      (ue(t.buffer, s.tab, e, bA, r),
      me.copy(e),
      a === 0
        ? ((me.w = bh), (me.h = sA))
        : a === 1 && ((me.w = e.w - 20), (me.h = cA)),
      (me.y += _s),
      (me.x += _s),
      i.type !== "folder" && (i = i.parent),
      i === void 0)
    )
      return;
    let c = e.x + e.w - me.w * 0.5;
    for (let _ = 0; _ < i.children.length; ++_) {
      let l = i.children[_],
        u = n.file_buttons.get(l);
      u !== void 0 &&
        (u.label.text !== l.name && (u.label.text = l.name),
        S1(t, l, s.button_link, me, a, 0, r) &&
          (l.type === "folder"
            ? ((n.active_node = l),
              (l.opened = !0),
              (n.active_changed = !0),
              (n.structure_changed = !0))
            : gA(t, l)),
        a === 0
          ? ((me.x += me.w + _s),
            me.x > c && ((me.x = e.x + _s), (me.y += me.h + _s)))
          : (me.y += me.h + _s));
    }
  }
  function Dc(t, e) {
    let r = h(Z),
      o = Wu(e),
      n = Pn(t),
      i = C1(n.active_node, "file", `New ${o}`),
      s = h(J).create_resource(e);
    return (
      (s.guid = i.guid),
      (i.type = "resource"),
      (r.changed = !0),
      (n.active_changed = !0),
      i
    );
  }
  function gA(t, e) {
    let r = ss(e.name);
    r === 3
      ? xA(t, e)
      : r === 5
        ? void 0
        : r === 6
          ? wA(t, e)
          : r === 7
            ? vA(t, e)
            : r === 9
              ? IA(t, e)
              : r === 8
                ? TA(t, e)
                : console.warn(
                    `resource type ${r} could not been opened, try load resource.`,
                  );
  }
  function xA(t, e) {
    let r = t.add_new_tab(e.name, Eu);
    Rv(r, e.guid);
  }
  function wA(t, e) {
    let r = t.add_new_tab(e.name, Cu);
    l1(r, e);
  }
  function vA(t, e) {
    let r = t.add_new_tab(e.name, ku);
  }
  function IA(t, e) {
    let r = h(J),
      o = t.add_new_tab(e.name, Bu);
  }
  function TA(t, e) {
    let r = h(J),
      o = t.add_new_tab(e.name, vd);
  }
  var Hu = class {
    constructor() {
      this.rect = new x(0, 0, 200, 40);
      this.radius = 32;
      this.constraint = new Mt();
      this.applications = [];
      this.add_app({ name: "union engine", on_gui: zg, icon: z1 }),
        this.add_app({ name: "code_editor", on_gui: Vg, icon: B1 }),
        this.add_app({ name: "file_browser", on_gui: Xi, icon: Xn }),
        this.add_app({ name: "terminal", on_gui: $i, icon: N1 }),
        (this.constraint.alignment = 18),
        this.constraint.margin.set(0, 0, 20, 0),
        (this.constraint.height = 64);
    }
    add_app(e) {
      let r = new P();
      (r.radius = 10),
        (e.button = r),
        this.applications.push(e),
        (this.constraint.width = this.applications.length * 54 + 10);
    }
  };
  function L1(t, e) {
    let r = h(F).theme,
      o = S(x),
      n = S(x),
      i = S(de);
    if (
      (o.copy(t.window_rect),
      yt(o, e.constraint, e.rect),
      q(t.buffer, r.panel_layer_1, e.rect, e.radius),
      e.applications.length > 0)
    ) {
      n.copy(e.rect), n.shrink(10), (n.w = n.h), i.copy(r.panel_layer_3);
      for (let a of e.applications) {
        let { button: s, icon: c } = a;
        if (E(t, s, r.panel_layer_3, n)) {
          let l = h(sr).uwindow_manager.create_window(a.name, a.on_gui);
          l.on_gui = a.on_gui;
        }
        c && c(t.buffer, n), (n.x += n.w + 10);
      }
    }
    Ee(t.buffer, r.outline, e.rect, e.radius), R(o), R(n), R(i);
  }
  var us = class {
      constructor(e, r) {
        this.on_gui = r;
        this.active = !0;
        this.changed = !1;
        this.render_title = !0;
        this.rect = new x(20, 60, 640, 480);
        this.radius = 10;
        this.resizable = !0;
        this.resize_direction = 0;
        this._title = "";
        (this.id = Ie(this)),
          (this.label = new re(e)),
          (this._title = e),
          (this.close = new P()),
          (this.close.circle = !0),
          (this.minimise = new P()),
          (this.minimise.circle = !0),
          (this.fullscreen = new P()),
          (this.fullscreen.circle = !0);
      }
      get title() {
        return this._title;
      }
      set title(e) {
        (this._title = e), (this.label.text = e);
      }
    },
    Zi = 32,
    Vu = 128,
    W1 = new M(0, 0, 0, 0),
    RA = 14,
    SA = 7;
  function O1(t, e) {
    let r = h(F).theme,
      o = e.id,
      n = S(x),
      i = S(x),
      a = S(x),
      s = S(x),
      c = S(x),
      _ = S(de);
    n.copy(e.rect), W1.set(e.radius, e.radius, 0, 0), _.copy(r.panel_layer_1);
    let l = e.render_title ? t.left_mouse_press : t.right_mouse_press,
      u = e.render_title ? t.left_mouse_release : t.right_mouse_release,
      d = 0,
      p = 0;
    if (t.active === o)
      switch (e.resize_direction) {
        case 0:
          (n.x += t.mouse_offset.x), (n.y += t.mouse_offset.y);
          break;
        case 1:
          (d = Math.min(t.mouse_offset.x, n.w - Vu)),
            (n.x += d),
            (n.w -= d),
            (t.cursor_type = "ew-resize");
          break;
        case 2:
          (d = Math.max(t.mouse_offset.x, Vu - n.w)),
            (n.w += d),
            (t.cursor_type = "ew-resize");
          break;
        case 5:
          (d = Math.max(t.mouse_offset.x, Vu - n.w)),
            (p = Math.max(t.mouse_offset.y, Zi * 2 - n.h)),
            (n.w += d),
            (n.h += p),
            (t.cursor_type = "nwse-resize");
          break;
        case 4:
          (d = Math.min(t.mouse_offset.x, n.w - Vu)),
            (p = Math.max(t.mouse_offset.y, Zi * 2 - n.h)),
            (n.x += d),
            (n.w -= d),
            (n.h += p),
            (t.cursor_type = "nesw-resize");
          break;
        case 3:
          (p = Math.max(t.mouse_offset.y, Zi * 2 - n.h)),
            (n.h += p),
            (t.cursor_type = "ns-resize");
        default:
          break;
      }
    let m = t.renderer.buffer.write_clip(n);
    if ((i.copy(n), (i.h = Zi), t.active === o && u)) {
      switch (e.resize_direction) {
        case 0:
          break;
        case 1:
          t.cursor_type = "ew-resize";
          break;
        case 2:
          t.cursor_type = "ew-resize";
          break;
        case 5:
          t.cursor_type = "nwse-resize";
          break;
        case 4:
          t.cursor_type = "nesw-resize";
          break;
        default:
          break;
      }
      e.rect.copy(n), (e.resize_direction = 0), t.clear_active();
    }
    t.ishovering(i) && t.next_hover_layer_index <= 0 && (t.next_hover = o),
      t.hover === o && l && t.set_active(o),
      q(t.buffer, r.panel_layer_0, n, e.radius, m),
      e.render_title
        ? (a.copy(n),
          (a.y += Zi),
          (a.h -= Zi),
          i.copy(n),
          (i.h = Zi),
          ue(t.buffer, _, i, W1, m),
          V(t, e.label, i, 0, m))
        : a.copy(n),
      e.resizable &&
        t.active !== o &&
        ((e.resize_direction = 0),
        s.copy(a),
        (s.w = RA),
        (s.x -= SA),
        t.ishovering(s) &&
          ((t.cursor_type = "ew-resize"),
          (e.resize_direction = 1),
          (t.next_hover = e.id)),
        (s.x += a.w),
        t.ishovering(s) &&
          ((t.cursor_type = "ew-resize"),
          (e.resize_direction = 2),
          (t.next_hover = e.id)),
        (s.y += s.h - s.w * 0.5),
        (s.h = s.w),
        t.ishovering(s) &&
          ((t.cursor_type = "nwse-resize"),
          (e.resize_direction = 5),
          (t.next_hover = e.id)),
        (s.x -= a.w),
        t.ishovering(s) &&
          ((t.cursor_type = "nesw-resize"),
          (e.resize_direction = 4),
          (t.next_hover = e.id)),
        (s.w = a.w - s.h),
        (s.x += s.h),
        t.ishovering(s) &&
          ((t.cursor_type = "ns-resize"),
          (e.resize_direction = 3),
          (t.next_hover = e.id))),
      e.on_gui && (t.tab_rect.copy(a), (t.tab = e), e.on_gui(t)),
      c.copy(i),
      c.shrink(10),
      (c.w = c.h),
      E(t, e.close, r.error, c, 0, m) && h(sr).uwindow_manager.close_window(e),
      (c.x += c.w + 8),
      E(t, e.minimise, r.warning, c, 0, m) &&
        h(sr).uwindow_manager.minimise_window(e),
      (c.x += c.w + 8),
      E(t, e.fullscreen, r.success, c, 0, m) &&
        h(sr).uwindow_manager.fullscreen_window(e),
      e.active && Ee(t.buffer, r.outline, n, e.radius),
      R(n),
      R(i),
      R(a),
      R(s),
      R(c),
      R(_);
  }
  var ju = class {
    constructor(e) {
      this.renderer = e;
      this.window_rect = new x(0, 0, window.innerWidth, window.innerHeight);
      this.last_id = -1;
      this.last_fixed_id = -1;
      this.last_active = -1;
      this.lost_active = -1;
      this._double_click_id = -1;
      this._double_click_begin = 0;
      this.double_click_duration = 500;
      this.mouse_start = new T();
      this.mouse_offset = new T();
      this.mouse_location = new T();
      this.pointer_delta = new T();
      this.mouse_wheel = 1;
      this.mouse_wheel_raw = 0;
      this.tab_rect = new x();
      this.tab = new jt("default", () => {});
      this.left_mouse_press = !1;
      this.left_mouse_release = !1;
      this.right_mouse_press = !1;
      this.right_mouse_release = !1;
      this.middle_mouse_press = !1;
      this.middle_mouse_release = !1;
      this.left_mouse_is_pressed = !1;
      this.right_mouse_is_pressed = !1;
      this.middle_mouse_is_pressed = !1;
      this.next_hover = -1;
      this.next_hover_layer_index = -1;
      this.hover_layer = -1;
      this.hover = -1;
      this.active = -1;
      this.focus = -1;
      this.drop_event = void 0;
      this.key_pressed = new Set();
      this.key_press = new Set();
      this.delta_time = 0;
      this.touch_screen = !1;
      this.smooth_factor = 0.05;
      this._defer_update_frame_count = 8;
      this._defer_update_frame_index = this._defer_update_frame_count;
      this.clear_mouse_state = () => {
        (this.left_mouse_release = !1),
          (this.left_mouse_press = !1),
          (this.right_mouse_press = !1),
          (this.right_mouse_release = !1),
          (this.middle_mouse_press = !1),
          (this.middle_mouse_release = !1);
      };
      (this.touch_screen = "ontouchstart" in window),
        (this.encoder = C.CurrentDevice().encoder),
        Xu(this),
        B.on(oe.ForceUpdate, () => {
          this.needs_update = !0;
        }),
        B.on(oe.MouseMove, (r) => {
          this.mouse_location.copy(r.point), (this.needs_update = !0);
        }),
        B.on(oe.MouseDrag, (r) => {
          this.pointer_delta.copy(r.delta),
            this.key_pressed.has(16) &&
              this.pointer_delta.mul(this.smooth_factor),
            this.mouse_offset.copy(this.mouse_location).sub(this.mouse_start),
            (this.needs_update = !0);
        }),
        B.on(oe.MouseDown, (r) => {
          r.button === 0 &&
            (this.left_mouse_is_pressed = this.left_mouse_press = !0),
            r.button === 2 &&
              (this.right_mouse_is_pressed = this.right_mouse_press = !0),
            r.button === 1 &&
              (this.middle_mouse_is_pressed = this.middle_mouse_press = !0),
            this.mouse_offset.set(0, 0),
            this.mouse_start.copy(this.mouse_location),
            (this.needs_update = !0);
        }),
        B.on(oe.MouseUp, (r) => {
          r.button === 0 &&
            ((this.left_mouse_release = !0), (this.left_mouse_is_pressed = !1)),
            r.button === 2 &&
              ((this.right_mouse_release = !0),
              (this.right_mouse_is_pressed = !1)),
            r.button === 1 &&
              ((this.middle_mouse_release = !0),
              (this.middle_mouse_is_pressed = !1)),
            this.pointer_delta.set(0, 0),
            (this.needs_update = !0);
        }),
        B.on(oe.MouseWheel, (r) => {
          (this.mouse_wheel = r.delta),
            (this.mouse_wheel_raw = r.delta_y),
            this.key_pressed.has(16) &&
              ((this.mouse_wheel =
                1 + (this.mouse_wheel - 1) * this.smooth_factor),
              (this.mouse_wheel_raw *= this.smooth_factor)),
            (this.needs_update = !0);
        }),
        B.on(oe.TouchStart, (r) => {
          (this.touch_screen = !0),
            this.mouse_location.copy(r.point),
            this.mouse_start.copy(this.mouse_location),
            (this.needs_update = !0),
            B.fire(ze.Frame),
            r.button === 0 &&
              (this.left_mouse_is_pressed = this.left_mouse_press = !0),
            r.button === 2 &&
              (this.right_mouse_is_pressed = this.right_mouse_press = !0),
            r.button === 1 &&
              (this.middle_mouse_is_pressed = this.middle_mouse_press = !0),
            (this.needs_update = !0);
        }),
        B.on(oe.TouchMove, (r) => {
          this.mouse_location.copy(r.point),
            this.mouse_offset.copy(this.mouse_location).sub(this.mouse_start),
            this.pointer_delta.copy(r.delta),
            (this.needs_update = !0);
        }),
        B.on(oe.TouchEnd, (r) => {
          r.button === 0 &&
            ((this.left_mouse_release = !0), (this.left_mouse_is_pressed = !1)),
            r.button === 2 &&
              ((this.right_mouse_release = !0),
              (this.right_mouse_is_pressed = !1)),
            r.button === 1 &&
              ((this.middle_mouse_release = !0),
              (this.middle_mouse_is_pressed = !1)),
            this.mouse_location.copy(r.point),
            (this.needs_update = !0);
        }),
        B.on(oe.Resize, (r) => {
          this.window_rect.set(0, 0, r.width, r.height),
            (this.needs_update = !0);
        }),
        B.on(oe.KeyDown, (r) => {
          this.key_pressed.add(r.keycode),
            this.key_press.add(r.keycode),
            (this.needs_update = !0);
        }),
        B.on(oe.KeyUp, (r) => {
          this.key_pressed.delete(r.keycode), (this.needs_update = !0);
        }),
        B.on(In.ClearActive, () => {
          this.clear_active();
        });
    }
    set cursor_type(e) {
      let r = C.CurrentDevice();
      r.canvas.style.cursor = e;
    }
    set needs_update(e) {
      e === !0
        ? (this._defer_update_frame_index = this._defer_update_frame_count)
        : (this._defer_update_frame_index = 0);
    }
    get needs_update() {
      return this._defer_update_frame_index > 0;
    }
    get buffer() {
      return this.renderer.buffer;
    }
    update() {
      this.key_press.clear(),
        (this.hover = this.next_hover),
        (this.hover_layer = this.next_hover_layer_index),
        (this.next_hover = -1),
        (this.next_hover_layer_index = -1),
        (this.mouse_wheel = 1),
        (this.mouse_wheel_raw = 0),
        this.pointer_delta.set(0, 0),
        (this.left_mouse_release || this.right_mouse_release) &&
          this.mouse_offset.set(0, 0),
        this.clear_mouse_state();
      let e = this._defer_update_frame_index > 0;
      return e && this._defer_update_frame_index--, e;
    }
    ishovering(e) {
      return e.contains(this.mouse_location);
    }
    set_active(e, r = !1) {
      return this.active === -1 || r
        ? (r && (this.lost_active = this.active),
          (this.last_active = this.active),
          (this.active = e),
          !0)
        : !1;
    }
    set_double_click_id(e) {
      (this._double_click_id = e),
        (this._double_click_begin = performance.now());
    }
    check_double_click(e) {
      return (
        this._double_click_id === e &&
        performance.now() - this._double_click_begin <
          this.double_click_duration
      );
    }
    clear_active() {
      (this.last_active = this.active),
        (this.active = -1),
        (this.cursor_type = "auto");
    }
    set_focus(e, r = !1) {
      return (this.focus = e), !0;
    }
    clear_focus() {
      (this.focus = -1), this.touch_screen && (h(F).keyboard.visible = !1);
    }
    add_new_tab(e, r) {
      return new us(e, r);
    }
    is_tab_active(e) {
      return h(sr).uwindow_manager.is_top(e);
    }
  };
  var $u = class {
      constructor() {
        this.rect = new x();
        this.radius = 22;
        this.height = 30;
        this.padding = 20;
      }
    },
    gh = new re("Union OS");
  gh.alignment = 33;
  gh.padding_left = 10;
  function H1(t, e) {
    let r = h(F).theme;
    e.rect.copy(t.window_rect),
      e.rect.shrink(e.padding),
      (e.rect.h = e.height),
      q(t.buffer, r.panel_layer_1, e.rect, e.radius),
      Ee(t.buffer, r.outline, e.rect, e.radius),
      V(t, gh, e.rect);
  }
  var qu = class {
    constructor() {
      this.windows = [];
    }
    move_top(e) {
      let r = this.windows.indexOf(e);
      if (r < 0) return;
      let o = this.windows.length - 1;
      (this.windows[r] = this.windows[o]), (this.windows[o] = e);
    }
    is_top(e) {
      let r = this.windows.indexOf(e);
      return r < 0 ? !1 : r === this.windows.length - 1;
    }
    create_window(e = "new window", r) {
      let o = new us(e, r),
        n = h(sr).state;
      return (
        (o.rect.x = (n.window_rect.w - o.rect.w) >> 1),
        (o.rect.y = (n.window_rect.h - o.rect.h) >> 1),
        this.windows.push(o),
        o
      );
    }
    close_window(e) {
      let r = this.windows.indexOf(e);
      r < 0 || this.windows.splice(r, 1);
    }
    minimise_window(e) {}
    fullscreen_window(e) {}
  };
  function V1(t, e) {
    for (let r of e.windows) O1(t, r);
  }
  var Qu = class {
    constructor() {
      st("shader/wallpaper/bubble.glsl").then((e) => {
        let r = Me({
            name: "wallpaper",
            combined_shader: e,
            uniforms: [
              { name: "window_size", type: 3, default_value: new T(1, 1) },
              { name: "time", type: 1, default_value: 0 },
            ],
          }),
          o = ce({
            primitive: He("screen_triangle"),
            uniforms: { time: 0, window_size: new b() },
          });
        (this.pipeline = r), (this.draw = o);
      });
    }
  };
  function j1(t, e) {
    if (e.pipeline === void 0 || e.draw === void 0) return;
    let r = h(F).theme;
    O(t.buffer.layers[0], r.background, t.window_rect);
  }
  var sr = class {
    constructor() {
      this.uwindow_manager = new qu();
      this.system_bar = new $u();
      this.app_stack = new Hu();
      this.clear_action = {
        type: 7,
        clear_color: new H().set_hex_string("21262b"),
        clear_depth: 1,
      };
    }
    async on_register() {
      let e = C.CurrentDevice(),
        r = await hu(e);
      (this.state = new ju(r)),
        Sa(this.state),
        (this.wallpaper = new Qu()),
        Oy(),
        B.on(ze.Frame, () => {
          let o = h(F).keyboard,
            n = h(F),
            i = this.state,
            a = e.encoder;
          (this.state.delta_time = h(F).engine.delta_time),
            (window.innerWidth !== e.screen_width ||
              window.innerHeight !== e.screen_height) &&
              e.set_size(window.innerWidth, window.innerHeight),
            this.state.needs_update &&
              ((i.cursor_type = "auto"),
              O(i.buffer, n.theme.background, i.window_rect),
              j1(i, this.wallpaper),
              C_(i, o),
              V1(i, this.uwindow_manager),
              H1(i, this.system_bar),
              L1(i, this.app_stack),
              i.needs_update && (a.set_pass(), r.render(), a.commit()),
              i.update(),
              r.buffer.reset());
        });
    }
  };
  function X1(t, e, r = "application/zip") {
    let o;
    Xe(e) ? (o = e) : (o = URL.createObjectURL(new Blob([e], { type: r })));
    let n = document.createElement("a");
    (n.download = t), (n.href = o), n.click();
  }
  async function FA(t) {
    let e = new FileReader();
    return new Promise((r) => {
      (e.onload = (o) => {
        r(o.target.result);
      }),
        e.readAsArrayBuffer(t);
    });
  }
  function xh(t = "*") {
    let e = document.createElement("input");
    (e.type = "file"), (e.accept = t);
    let r = new Promise(function (o) {
      e.onchange = function (n) {
        let i = n.target.files[0],
          a = i.name,
          s = i.lastModified;
        FA(n.target.files[0]).then((c) => {
          o({ buffer: c, name: a, last_modified: s });
        });
      };
    });
    return e.click(), r;
  }
  var Zu = document.createElement("canvas"),
    $1 = Zu.getContext("2d");
  async function Yu(t, e, r) {
    return new Promise(async (o, n) => {
      let i = 5121,
        a = 6408,
        s = Ne({
          width: e,
          height: r,
          format: a,
          data_type: i,
          internal_format: 32856,
        }),
        c = pr({ width: e, height: r, color_targets: [{ texture: s }] }),
        l = C.CurrentDevice().encoder,
        u = new Uint8Array(e * r * 4);
      l.set_pass(c),
        l.clear(),
        t.tab_rect.set(0, 0, e, r),
        ci(t, c),
        l.set_pass(c),
        await x_(0, 0, e, r, a, i, u),
        l.set_pass(),
        (Zu.width = e),
        (Zu.height = r);
      let d = $1.createImageData(e, r);
      d.data.set(u), $1.putImageData(d, 0, 0), Lr(c), zo(s), o(Zu.toDataURL());
    });
  }
  var q1 = 240,
    Q1 = 208,
    Bg = q1 / Q1;
  function Z1() {
    let t = h(Hr),
      e = h(F).platform;
    t.register(
      "project.open",
      () => {
        let o = h(F);
        (o.project_state = 1),
          xh(".project,.zip").then((n) => {
            Y1(n.buffer);
          });
      },
      new Set([91, 83]),
    );
    let r = e === 1 ? 91 : 17;
    t.register(
      "project.download",
      async () => {
        let o = await wh();
        if (o === void 0) {
          console.warn("project worker in process");
          return;
        }
        let n = h(F);
        X1(`${n.name}.project`, o);
      },
      new Set([r, 16, 83]),
    ),
      t.register(
        "project.save",
        async () => {
          let o = await wh();
          if (o === void 0)
            return console.warn("project worker in process"), !1;
          let n = h(F),
            i = n.name,
            a = n.thumbnail;
          h(Bo)
            .save_project(i, o, a)
            .then(() => {
              mi("<ShortcutAPI> Project Saved");
            });
        },
        new Set([r, 83]),
      ),
      t.register("view.snapshot", async () => {
        let o = h(we),
          n = h(sr),
          i = o === void 0 ? n.state : o.state,
          a = await Yu(i, q1, Q1);
        h(F).thumbnail = a;
      }),
      t.register("add.camera", async () => {
        let o = h(ee).data_center,
          n = o.create_entity_with_prototype_name("camera"),
          i = h(Z),
          a = new b(70, 60, 50);
        o.set_property(n, "camera.fov", 45),
          o.set_property(
            n,
            "camera.aspect",
            window.innerWidth / window.innerHeight,
          ),
          o.set_property(n, "transform.location", a);
        let s = i.get_node_by_path("script/camera.js");
        s && o.set_property(n, "script.source", s.resource_uuid);
      }),
      t.register("physics.debug", async (o) => {
        let n = parseInt(o[0] || "1") % 3;
        console.log(`set physics debug model ${n}`);
      }),
      t.register("live.rename", async (o) => {
        let n = o[0];
        Xe(n) && localStorage.setItem(ud, n),
          console.log(`set live service name to ${n}`);
      }),
      t.register("csm.debug", async (o) => {
        let n = o[0],
          i = h(Nr);
        n
          ? n === "0" || n === "false"
            ? (i.csm_debug = !1)
            : (i.csm_debug = !0)
          : (i.csm_debug = !i.csm_debug);
      }),
      t.register(
        "file.import",
        async () => {
          xh().then((o) => {
            let i = h(Z).create_empty_file("file", o.name);
            (i.data = new $e(o.buffer)), (i.last_modified = o.last_modified);
          });
        },
        new Set([r, 79]),
      ),
      t.register(
        "editor.reload",
        async () => {
          location.reload();
        },
        new Set([r, 82]),
      ),
      t.register(
        "editor.undo",
        async () => {
          vh();
        },
        new Set([r, 90]),
      ),
      t.register(
        "editor.redo",
        async () => {
          Ih();
        },
        new Set([r, 16, 90]),
      ),
      t.register(
        "object.align_to_view",
        async () => {
          console.log("align selected objects to view");
        },
        new Set([r, 16, 70]),
      ),
      t.register(
        "fullscreen.enter",
        async () => {
          console.log("enter fullscreen"), pd();
        },
        new Set([r, 13]),
      ),
      t.register(
        "fullscreen.exit",
        async () => {
          console.log("exit fullscreen"), pd();
        },
        new Set([r, 27]),
      ),
      t.register("app.theme", async (o) => {
        let n = o.join(" "),
          i = J1();
        if (i.has(n)) {
          let a = h(F);
          (a.target_theme = i.get(n)),
            (a.theme_transition = 0),
            localStorage.setItem(U_, n);
        }
      });
  }
  function K1(t) {
    if (t === void 0) return -1;
    let e = Array.from(t).sort();
    if (e.length > 4) return -1;
    let r = BigInt(0);
    for (let o = 0; o < e.length; o++) {
      let n = BigInt(e[o]);
      r = (r << 8n) | n;
    }
    return Number(r);
  }
  var Hr = class {
    constructor() {
      this.path_to_shortcut = new Map();
      this.keys_to_shortcut = new Map();
    }
    async on_register() {
      Z1();
    }
    register(e, r, o) {
      let n = K1(o),
        i = { path: e, action: r, keys: o, hash: n };
      this.path_to_shortcut.set(e, i),
        n !== -1 && this.keys_to_shortcut.set(n, i);
    }
    valid_shortcut(e) {
      let o = e.split(/\s/).shift();
      return this.path_to_shortcut.has(o);
    }
    async invoke_with_path(e) {
      let r = e.split(/\s/),
        o = r.shift(),
        n = this.path_to_shortcut.get(o);
      return n === void 0
        ? (console.warn(`action unregistered ${o}`), !1)
        : (await n.action(r)) !== !1;
    }
    async invoke_with_keys(e) {
      let r = K1(e),
        o = this.keys_to_shortcut.get(r);
      return o === void 0 ? !1 : (await o.action()) !== !1;
    }
  };
  function kA(t) {
    switch (t) {
      case 1:
        return "Input";
      case 2:
        return "Log";
      case 4:
        return "Warn";
      case 8:
        return "Error";
      default:
        return "Default";
    }
  }
  var sn = [],
    En = -1,
    PA = 128,
    eI = "",
    rI = !1,
    Gc = [],
    Ju = {},
    tI = [],
    Th = new Ar();
  function EA(t) {
    sn.push(t),
      (En = sn.length - 1),
      sn.length > 20 && sn.shift(),
      localStorage.setItem(Hy, JSON.stringify(sn));
  }
  function va(t, e, r) {
    if (!rI) return;
    let o = {
      level: e,
      content: t,
      sender: r,
      timestamp: Date.now(),
      time_str: new Date().toLocaleTimeString(),
    };
    Gc.push(o),
      r & 1 && Ju[1].push(o),
      r & 2 && Ju[2].push(o),
      (Th.content_height = Gc.length * Yi),
      Th.scroll_to_bottom();
  }
  function DA(t, e = 1) {
    va(t, 1, e);
  }
  function mi(t, e = 1) {
    va(t, 2, e);
  }
  function GA(t, e = 1) {
    va(t, 4, e);
  }
  function UA(t, e = 1) {
    va(t, 8, e);
  }
  var Yi = 24,
    Rh = 32,
    an = new qe();
  an.label.alignment = 33;
  an.label.padding_left = 4;
  var Sh = new Mt();
  Sh.height = Rh;
  Sh.alignment = 48;
  var DJ = new M(Be, Be, 0, 0);
  function $i(t) {
    let e = S(x),
      r = S(x),
      o = S(x),
      n = t.renderer.buffer.write_clip(t.tab_rect);
    e.copy(t.tab_rect), (e.h = Rh);
    let i = h(F).theme,
      a = Th;
    r.copy(t.tab_rect), (r.y += 2), (r.h -= Rh * 0.5 + 4);
    let s = t.renderer.buffer.write_clip(r);
    a.content_height = Gc.length * Yi;
    let c = a.compute_fixed_item_start_index_y(Yi),
      _ = Math.min(Gc.length - c, Math.floor(r.h / Yi) + 2);
    o.copy(r), (o.y -= a.compute_fixed_item_start_offset_y(Yi)), (o.h = Yi);
    for (let l = 0; l < _; ++l) {
      let u = Gc[c + l],
        d = tI[l],
        p = u.content;
      u.sender !== 3 && (p = `[${kA(u.level)}] ` + p),
        d ||
          ((d = new re(p)),
          (d.alignment = 33),
          (d.padding_left = 5),
          (tI[l] = d)),
        d.text !== p && (d.text = p),
        t.ishovering(o) && q(t.buffer, i.panel_layer_1, o, Be, s),
        V(t, d, o, 0, s),
        (o.y += Yi);
    }
    if (
      (Vo(t, a, r, 0, n),
      yt(t.tab_rect, Sh, e),
      e.shrink(4),
      t.active === an.id)
    ) {
      if (t.key_press.has(38)) {
        let l = sn[En];
        l &&
          (En === sn.length - 1 && (eI = an.text),
          (an.text = l),
          (En = Math.max(0, En - 1)));
      }
      if (t.key_press.has(40))
        if (En === sn.length - 1) an.text = eI;
        else {
          En = Q(En + 1, 0, sn.length - 1);
          let l = sn[En];
          l && (an.text = l);
        }
    }
    if (At(t, an, i.panel_layer_2, e)) {
      let l = an.text.substring(0, PA);
      DA(l);
      let u = h(Hr);
      u && u.valid_shortcut(l) ? u.invoke_with_path(l) : Wy(l),
        EA(l),
        (an.text = ""),
        a.scroll_to_bottom();
    }
    R(e), R(r), R(o);
  }
  Fe($i, "ui_tab_terminal");
  function oI() {
    let t = console.log;
    console.log = function (...o) {
      mi(o[0].toString()), t(...o);
    };
    let e = console.warn;
    console.warn = function (...o) {
      GA(o[0].toString()), e(...o);
    };
    let r = console.error;
    (console.error = function (...o) {
      UA(o[0].toString()), r(...o), t(Error().stack);
    }),
      (Ju[1] = []),
      (Ju[2] = []),
      (rI = !0);
  }
  var ee = class {
    constructor() {
      this.on_data_action = (e) => {
        let r = h(Hn);
        if (r && r.synchronizing) {
          let o = { type: "data action", action: e };
          r.broadcast(JSON.stringify(o));
        }
      };
    }
    async on_register(e) {
      (window.data = this),
        e
          ? ((this.data_center = xo.deserialize(e.runtime_data)),
            mi("<DataAPI> data center deserialized"))
          : ((this.data_center = new xo()),
            (this.data_center.recording = !1),
            E_(this.data_center),
            D_(this.data_center),
            (this.data_center.recording = !0),
            mi("<DataAPI> default data center initialized")),
        this.data_center.event.on(Xs.DataAction, this.on_data_action);
    }
  };
  var Fh = new $(),
    Uc = new b(),
    Ku = class {
      constructor(e, r, o) {
        this.entity = e;
        this.data = r;
        this.state = o;
        this.enabled = !0;
        this.location = new b();
        this.target = new b();
        this.rotation = new $();
        this.spherical = new Ot();
        this.lerp_factor = 0.8;
        this.lerp_spherical = new Ot();
        this.velocity = new b();
        this.velocity_dissipation = 0.05;
        this.move_speed = 50;
        this.rotate_speed = 5;
        this.matrix = new L();
        r.get_property(e, "transform.location", this.location),
          r.get_property(e, "transform.rotation", this.rotation),
          this.spherical.from_float3(
            this.target
              .set(0, 0, -1)
              .apply_quaternion(this.rotation)
              .normalize(),
          ),
          this.lerp_spherical.copy(this.spherical);
      }
      rotate_horizontal(e) {
        this.enabled && (this.spherical.phi += e * this.rotate_speed);
      }
      rotate_vertical(e) {
        this.enabled && (this.spherical.theta += e * this.rotate_speed);
      }
      update(e) {
        if (!this.enabled) return;
        let r = h(Kt);
        this.lerp_spherical.lerp(this.spherical, this.lerp_factor),
          this.target.from_spherical(this.lerp_spherical).add(this.location),
          this.matrix.look_at(this.location, this.target),
          this.rotation.from_mat4(this.matrix),
          Fh.copy(this.rotation),
          this.velocity.mul(1 - Math.min(1, e / this.velocity_dissipation)),
          Uc.set(0, 0, -1)
            .apply_quaternion(Fh)
            .mul(r.get_input("direction", 1) * this.move_speed),
          this.velocity.add(Uc),
          Uc.set(-1, 0, 0)
            .apply_quaternion(Fh)
            .mul(r.get_input("direction", 0) * this.move_speed),
          this.velocity.add(Uc),
          this.location.add(Uc.copy(this.velocity).mul(e));
        let o = this.data,
          n = this.entity;
        o.set_property(n, "transform.location", this.location),
          o.set_property(n, "transform.rotation", this.rotation);
      }
    };
  function nI() {
    let t = window;
    (t.Float2 = T),
      (t.Float3 = b),
      (t.Float4 = M),
      (t.Quaternion = $),
      (t.Mat4 = L),
      (t.Euler = vt),
      (t.Spherical = Ot),
      (t.ColorRGBA = H),
      (t.clamp = Q),
      (t.lerp = Ue),
      (t.Rect = x),
      (t.UIButton = P),
      (t.UILabel = re),
      (t.UIImage = Br),
      (t.UIOffset = Jr),
      (t.UIAlignment = Ae),
      (t.ui_button = E),
      (t.ui_label = V),
      (t.ui_image = wn),
      (t.ui_layout = yt),
      (t.ui_style_create = K),
      (t.fill_round_rect = q),
      (t.stroke_round_rect = Ee),
      (t.FirstPersonController = Ku),
      (t.ResourceType = kt),
      (t.CollisionShape = Ml),
      (t.Input = h(Kt)),
      (t.Keycode = nt),
      (t.TriggerType = um);
  }
  var MA = new Map();
  function iI() {
    let t = {
      name: "Nord",
      keyword: new H().set_hex_string("749abc"),
      label: new H().set_hex_string("aec6a2"),
      string: new H().set_hex_string("9cbf86"),
      type: new H().set_hex_string("80bbb9"),
      function: new H().set_hex_string("77c1d2"),
      background: new H().set_hex_string("2d3441"),
    };
    return MA.set(t.name, t), t;
  }
  function CA() {
    return {
      interface: { language: "en", theme: "dark" },
      project: {
        company_name: "Company Name",
        product_name: "Product Name",
        version: "1.0.0",
      },
      rendering: { multi_thread_rendering: !0, backend: 0 },
      plugin: {},
    };
  }
  function aI() {
    let t = localStorage.getItem("union/settings");
    return t ? JSON.parse(t) : CA();
  }
  var In = {
      ResourceUpdate: new ye("resource update"),
      ProjectLoaded: new ye("project loaded"),
      TabClosed: new ye("tab closed"),
      ClearActive: new ye("clear active"),
    },
    Ah = 1,
    LA = 1,
    zA = 0.1,
    F = class {
      constructor() {
        this.mode = 0;
        this.theme_transition = 0;
        this.code_theme_transition = 0;
        this.project_state = 0;
        this.name = "default";
        this.keyboard = new M_();
        this.avatars = new Map();
      }
      async on_register() {
        (this.platform = Jc()),
          (this.settings = aI()),
          (this.draco_encoder = new xa()),
          (this.theme = cI()),
          (this.code_theme = iI()),
          nI(),
          (this.engine = new u_()),
          this.engine.start(),
          B.on(ze.AfterTick, () => {
            this.target_theme !== void 0 &&
              ((this.theme_transition += this.engine.delta_time),
              kh(this.theme, this.target_theme, this.theme, zA),
              Sa(sI()),
              this.theme_transition > LA &&
                ((this.target_theme = void 0), (this.theme_transition = 0)),
              B.fire(oe.ForceUpdate));
          });
      }
      get_avatar(e) {
        let r = this.avatars.get(e);
        return r || ((r = new Br(We("union"))), this.avatars.set(e, r)), r;
      }
    };
  async function Y1(t) {
    let e = h(F),
      r = { source: t, action: 0 },
      o = new yn(
        new Worker("public/package/worker/project.worker.js", {
          name: "project_worker",
        }),
        !0,
      );
    if (((o.worker_name = "project_worker"), !o.available)) return;
    let n = await o.send_async(r, [t]);
    n.version <= Ah &&
      console.error(
        `Out of date project data version [${n.version}]. app version [${Ah}]`,
      ),
      (e.name = n.name),
      (e.thumbnail = n.thumbnail),
      h(Z).deserialize(n.filesystem_data);
    let i = h(ee);
    (i.data_center = xo.deserialize(n.runtime_data)),
      await h(J).deserialize(n.resource_data);
    let a = h(we);
    n.dock_root && ((a.dock_system.root = Ka(n.dock_root)), a.resize()),
      n.editor_camera && (a.camera = __(n.editor_camera)),
      Xx(i.data_center, n.chunk_data),
      B.fire(In.ProjectLoaded),
      (e.project_state = 0);
  }
  async function wh() {
    let t = h(Z).serialize(),
      e = h(J).serialize(),
      r = h(ee).data_center.serialize(),
      o = jx(h(ee).data_center),
      n = h(F),
      i = n.name,
      a = h(we),
      s = await Yu(a.state, 240, 208),
      c = du(a.dock_system.root);
    n.thumbnail = s;
    let l = {
      version: Ah,
      filesystem_data: t,
      resource_data: e,
      runtime_data: r,
      name: i,
      thumbnail: s,
      dock_root: c,
      chunk_data: o,
    };
    a.camera && (l.editor_camera = Kb(a.camera));
    let u = { project: l, action: 1 },
      d = [
        t.buffer.buffer,
        r.entity_set.buffer,
        r.slab_heap.buffer,
        r.action_heap.buffer,
      ],
      p = new yn(
        new Worker("public/package/worker/project.worker.js", {
          name: "project_worker",
        }),
        !0,
      );
    if (((p.worker_name = "project_worker"), !!p.available))
      return p.send_async(u, d);
  }
  var Dh = {},
    NA = {},
    Mc = {},
    Cc = {},
    Nc = [
      Math.cos((Math.PI * 0.5) / 5),
      Math.cos(((Math.PI * 0.5) / 5) * 2),
      Math.cos(((Math.PI * 0.5) / 5) * 3),
      Math.cos(((Math.PI * 0.5) / 5) * 4),
    ],
    Ki = Nc.length,
    lo = {
      TOP_LEFT: 0 << 24,
      TOP_RIGHT: 1 << 24,
      BOTTOM_LEFT: 2 << 24,
      BOTTOM_RIGHT: 3 << 24,
    };
  function Ta(t, e, r, o, n) {
    return (t.x = e), (t.y = r), (t.z = o), (t.w = n), t;
  }
  function br(t, e) {
    return t.x + t.w < e.x ||
      t.x > e.x + e.w ||
      t.y + t.h < e.y ||
      t.y > e.y + e.h
      ? -1
      : t.x >= e.x &&
          t.x + t.w <= e.x + e.w &&
          t.y >= e.y &&
          t.y + t.h < e.y + e.h
        ? 0
        : 1;
  }
  function bI(t, e, r, o = 32) {
    let n = (Math.PI * 2) / o;
    for (let i = 0; i < o; ++i)
      (t[i * 2] = r * Math.cos(n * i) + e.x),
        (t[i * 2 + 1] = r * Math.sin(n * i) + e.y);
  }
  function ep(t, e, r, o, n) {
    for (let i = 0; i < Ki; ++i)
      (t[e + i * 2] = r.x + o.x * Nc[i] + n.x * Nc[Ki - 1 - i]),
        (t[e + i * 2 + 1] = r.y + o.y * Nc[i] + n.y * Nc[Ki - 1 - i]);
  }
  function ne(t, e, r, o) {
    let n = r.x,
      i = r.y,
      a = r.w,
      s = r.h;
    o.color.copy(e.color), (o.width = e.line_width), (o.feather = e.feather);
    let c = o.points;
    o.point_count = t.length >> 1;
    for (let _ = 0; _ < t.length; _ += 2)
      (c[_] = t[_] * a + n), (c[_ + 1] = t[_ + 1] * s + i);
    return o;
  }
  var tp = new T(),
    rp = new T(),
    op = new T(),
    np = new T(),
    hi = new T(),
    bi = new T();
  function Gh(t, e, r) {
    let o = r.points,
      n = 0,
      i = Math.min(t.w * 0.25, t.h * 0.25);
    (e.x = Math.min(e.x, i)),
      (e.y = Math.min(e.y, i)),
      (e.z = Math.min(e.z, i)),
      (e.w = Math.min(e.w, i)),
      tp.set(t.x + e.x, t.y + e.x),
      rp.set(t.x + t.w - e.y, t.y + e.y),
      op.set(t.x + e.z, t.y + t.h - e.z),
      np.set(t.x + t.w - e.w, t.y + t.h - e.w);
    let a = 0;
    e.x <= wi
      ? ((o[n++] = t.x), (o[n++] = t.y), (a += 1))
      : ((o[n++] = t.x),
        (o[n++] = tp.y),
        hi.set(-e.x, 0),
        bi.set(0, -e.x),
        ep(o, n, tp, hi, bi),
        (n += Ki * 2),
        (o[n++] = tp.x),
        (o[n++] = t.y),
        (a += 6)),
      e.y <= wi
        ? ((o[n++] = t.x + t.w), (o[n++] = t.y), (a += 1))
        : ((o[n++] = rp.x),
          (o[n++] = t.y),
          hi.set(0, -e.y),
          bi.set(e.y, 0),
          ep(o, n, rp, hi, bi),
          (n += Ki * 2),
          (o[n++] = t.x + t.w),
          (o[n++] = rp.y),
          (a += 6)),
      e.w <= wi
        ? ((o[n++] = t.x + t.w), (o[n++] = t.y + t.h), (a += 1))
        : ((o[n++] = t.x + t.w),
          (o[n++] = np.y),
          hi.set(e.w, 0),
          bi.set(0, e.w),
          ep(o, n, np, hi, bi),
          (n += Ki * 2),
          (o[n++] = np.x),
          (o[n++] = t.y + t.h),
          (a += 6)),
      e.z <= wi
        ? ((o[n++] = t.x), (o[n++] = t.y + t.h), (a += 1))
        : ((o[n++] = op.x),
          (o[n++] = t.y + t.h),
          hi.set(0, e.z),
          bi.set(-e.z, 0),
          ep(o, n, op, hi, bi),
          (n += Ki * 2),
          (o[n++] = t.x),
          (o[n++] = op.y),
          (a += 6)),
      (r.point_count = a);
  }
  function BA(t, e, r, o) {
    Gh(t, r, o), o.rect.copy(t), o.uv_rect.copy(e);
  }
  function _I(t, e, r) {
    return t === -1 ? -1 : t > 0 ? t - 1 : r ? e - 1 : -1;
  }
  function lI(t, e, r) {
    return t === -1 ? -1 : t + 1 < e ? t + 1 : r ? 0 : -1;
  }
  function uI(t, e, r) {
    return t[e * 2] === t[r * 2] && t[e * 2 + 1] === t[r * 2 + 1];
  }
  function Ph(t, e, r, o, n) {
    (t[0] = e), (t[1] = r), (t[2] = o), (t[3] = n);
  }
  function pI(t, e) {
    (t[0] = e[0]), (t[1] = e[1]), (t[2] = e[2]), (t[3] = e[3]);
  }
  var ot = new T(),
    see = new T(),
    yi = new T(),
    ps = new T(),
    xr = new T(),
    dI = new T(),
    mI = new T(),
    fe = new T(),
    Eh = new T(),
    Eo = [0, 0, 0, 0],
    _o = [0, 0, 0, 0],
    Ct = [0, 0, 0, 0, 0, 0, 0, 0],
    ip = [0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3];
  function ke(t, e, r = !1, o = 0) {
    let n = -1,
      i = -1,
      a = e.point_count + (e.closed ? 1 : 0),
      s = r ? 8 : 4,
      c = e.points,
      _ = e.closed,
      l = e.width,
      u = e.feather,
      d = e.color,
      p = e.clip,
      m = r ? 201326592 : 134217728,
      f = l > u ? (l - u) / 2 : 0,
      y = l > u ? u : l,
      g = d.to_hex(),
      v = g & 4294967040,
      w = Dh;
    (w.color = d.to_hex()), (w.clip = p), r && (w.offset = o);
    for (let k = 0; k < a; ++k) {
      let D = k % e.point_count;
      for (n = _I(D, e.point_count, _); n !== -1 && n !== D && uI(c, D, n); )
        n = _I(n, e.point_count, _);
      for (i = lI(D, e.point_count, _); i !== -1 && i !== D && uI(c, D, i); )
        i = lI(i, e.point_count, _);
      if (!(D === n || D === i) && !(n === -1 && i === -1))
        if (
          (n === -1 ? yi.set(0, 0) : yi.read(c, n * 2),
          ot.read(c, D * 2),
          i === -1 ? ps.set(0, 0) : ps.read(c, i * 2),
          n === -1)
        ) {
          fe.copy(ps).sub(ot).normalize(),
            xr.set(fe.y, -fe.x),
            fe
              .copy(xr)
              .mul(f + y)
              .add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = v);
          let G = t.write_triangle_vertex(w, r);
          fe.copy(xr).mul(f).add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = g),
            t.write_triangle_vertex(w, r),
            fe.copy(xr).mul(-f).add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = g),
            t.write_triangle_vertex(w, r),
            fe
              .copy(xr)
              .mul(-f - y)
              .add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = v),
            t.write_triangle_vertex(w, r),
            Ph(Eo, G, G + s, G + s * 2, G + s * 3);
        } else if (i === -1) {
          r && (w.offset += ot.distance(yi)),
            fe.copy(ot).sub(yi).normalize(),
            xr.set(fe.y, -fe.x),
            fe
              .copy(xr)
              .mul(f + y)
              .add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = v);
          let G = t.write_triangle_vertex(w, r);
          if (
            (fe.copy(xr).mul(f).add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = g),
            t.write_triangle_vertex(w, r),
            fe.copy(xr).mul(-f).add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = g),
            t.write_triangle_vertex(w, r),
            fe
              .copy(xr)
              .mul(-f - y)
              .add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = v),
            t.write_triangle_vertex(w, r),
            Ph(_o, G, G + s, G + s * 2, G + s * 3),
            D !== -1)
          ) {
            (Ct[0] = Eo[0]),
              (Ct[1] = Eo[1]),
              (Ct[2] = Eo[2]),
              (Ct[3] = Eo[3]),
              (Ct[4] = _o[0]),
              (Ct[5] = _o[1]),
              (Ct[6] = _o[2]),
              (Ct[7] = _o[3]);
            for (let U = 0; U < ip.length; ++U)
              t.add_index(ut(m, 0, Ct[ip[U]]));
          }
          pI(Eo, _o);
        } else {
          r && (w.offset += ot.distance(yi)),
            fe.copy(ot).sub(yi),
            Eh.copy(ps).sub(ot),
            dI.set(fe.y, -fe.x),
            mI.set(Eh.y, -Eh.x),
            xr.copy(dI).add(mI).normalize(),
            fe
              .copy(xr)
              .mul(f + y)
              .add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = v);
          let G = t.write_triangle_vertex(w, r);
          if (
            (fe.copy(xr).mul(f).add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = g),
            t.write_triangle_vertex(w, r),
            fe.copy(xr).mul(-f).add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = g),
            t.write_triangle_vertex(w, r),
            fe
              .copy(xr)
              .mul(-f - y)
              .add(ot),
            (w.x = fe.x),
            (w.y = fe.y),
            (w.color = v),
            t.write_triangle_vertex(w, r),
            Ph(_o, G, G + s, G + s * 2, G + s * 3),
            k)
          ) {
            (Ct[0] = Eo[0]),
              (Ct[1] = Eo[1]),
              (Ct[2] = Eo[2]),
              (Ct[3] = Eo[3]),
              (Ct[4] = _o[0]),
              (Ct[5] = _o[1]),
              (Ct[6] = _o[2]),
              (Ct[7] = _o[3]);
            for (let U = 0; U < ip.length; ++U)
              t.add_index(ut(m, 0, Ct[ip[U]]));
          }
          pI(Eo, _o);
        }
    }
  }
  var te = new Vn(),
    ds = new M();
  function Ee(t, e, r, o, n = 0) {
    ds.set(o, o, o, o), fr(t, e, r, ds, n);
  }
  function Wo(t, e, r, o = 0) {
    if (o > 0) {
      t.buffer.read_clip(Lt, o);
      let n = br(r, Lt);
      if (n === -1) return;
      n === 0 && (o = 0);
    }
    (te.closed = !0),
      te.color.copy(e.color),
      (te.clip = o),
      (te.width = e.line_width),
      (te.feather = e.feather),
      (te.points[0] = r.x),
      (te.points[1] = r.y),
      (te.points[2] = r.x + r.w),
      (te.points[3] = r.y),
      (te.points[4] = r.x + r.w),
      (te.points[5] = r.y + r.h),
      (te.points[6] = r.x),
      (te.points[7] = r.y + r.h),
      (te.point_count = 4),
      ke(t, te);
  }
  function fr(t, e, r, o, n = 0) {
    if (n > 0) {
      t.buffer.read_clip(Lt, n);
      let i = br(r, Lt);
      if (i === -1) return;
      i === 0 && (n = 0);
    }
    (te.closed = !0),
      te.color.copy(e.color),
      (te.clip = n),
      (te.width = e.line_width),
      (te.feather = e.feather),
      Gh(r, o, te),
      ke(t, te);
  }
  function dc(t, e, r, o, n = 0, i = 32) {
    if (n > 0) {
      t.buffer.read_clip(Lt, n), ms.set(r.x - o, r.y - o, o * 2, o * 2);
      let a = br(ms, Lt);
      if (a === -1) return;
      a === 0 && (n = 0);
    }
    (te.closed = !0),
      te.color.copy(e.color),
      (te.clip = n),
      (te.width = e.line_width),
      (te.feather = e.feather),
      bI(te.points, r, o, i),
      (te.point_count = i),
      ke(t, te);
  }
  var Ji = new T(),
    Lc = new T(),
    ap = new T(),
    fI = new T(),
    zc = new T();
  function Te(t, e, r = 2) {
    let o = e.points,
      n = e.uv_rect,
      i = e.rect,
      a = e.point_count,
      s = e.color,
      c = e.feather * 0.5,
      _ = r !== 2,
      l = r === 7,
      u = _ ? 201326592 : 134217728,
      d = _ ? 8 : 4,
      p = e.clip,
      m = s.to_hex(),
      f = m & 4294967040,
      y = Dh;
    (y.clip = p), (y.color = f), (y.type = r);
    let g = t.primitive_offset;
    for (let v = 0; v < a; ++v) {
      let w = (v + a - 1) % a,
        k = (v + 1) % a;
      ot.read(o, v * 2),
        yi.read(o, w * 2),
        ps.read(o, k * 2),
        Ji.copy(yi).sub(ot).normalize(),
        Lc.copy(ps).sub(ot).normalize(),
        ap.set(-Ji.y, Ji.x),
        fI.set(Lc.y, -Lc.x);
      let D = Ji.dot(Lc),
        G = (fI.dot(Ji) + ap.dot(Lc) * D) / (1 - D * D);
      zc.set(ap.x + Ji.x * G, ap.y + G * Ji.y),
        (y.x = ot.x + zc.x * c),
        (y.y = ot.y + zc.y * c),
        (y.color = f),
        l &&
          ((y.u = ((y.x - i.x) / i.w) * n.w + n.x),
          (y.v = ((i.h - (y.y - i.y)) / i.h) * n.h + n.y)),
        t.write_triangle_vertex(y, _),
        (y.x = ot.x - zc.x * c),
        (y.y = ot.y - zc.y * c),
        (y.color = m),
        l &&
          ((y.u = ((y.x - i.x) / i.w) * n.w + n.x),
          (y.v = ((i.h - (y.y - i.y)) / i.h) * n.h + n.y)),
        t.write_triangle_vertex(y, _);
      let U = g + v * 2 * d,
        Y = g + k * 2 * d;
      t.add_index(ut(u, 0, U)),
        t.add_index(ut(u, 0, Y)),
        t.add_index(ut(u, 0, U + d)),
        t.add_index(ut(u, 0, U + d)),
        t.add_index(ut(u, 0, Y)),
        t.add_index(ut(u, 0, Y + d)),
        U !== g &&
          Y !== g &&
          (t.add_index(ut(u, 0, g + d)),
          t.add_index(ut(u, 0, U + d)),
          t.add_index(ut(u, 0, Y + d)));
    }
  }
  var Lt = new x();
  function O(t, e, r, o = 0) {
    if (o > 0) {
      t.buffer.read_clip(Lt, o);
      let c = br(r, Lt);
      if (c === -1) return;
      c === 0 && (o = 0);
    }
    let n = e.color,
      i = NA;
    (i.x = r.x),
      (i.y = r.y),
      (i.w = r.w),
      (i.h = r.h),
      (i.color = n.to_hex()),
      (i.clip = o);
    let a = 67108864,
      s = t.write_rect_vertex(i);
    t.add_index(ut(a, lo.TOP_LEFT, s)),
      t.add_index(ut(a, lo.TOP_RIGHT, s)),
      t.add_index(ut(a, lo.BOTTOM_LEFT, s)),
      t.add_index(ut(a, lo.BOTTOM_LEFT, s)),
      t.add_index(ut(a, lo.TOP_RIGHT, s)),
      t.add_index(ut(a, lo.BOTTOM_RIGHT, s));
  }
  function Fr(t, e, r, o, n = 0, i = 32) {
    if (n > 0) {
      t.buffer.read_clip(Lt, n), ms.set(r.x - o, r.y - o, o * 2, o * 2);
      let a = br(ms, Lt);
      if (a === -1) return;
      a === 0 && (n = 0);
    }
    (te.closed = !0),
      te.color.copy(e.color),
      (te.clip = n),
      (te.width = e.line_width),
      (te.feather = e.feather),
      bI(te.points, r, o, i),
      (te.point_count = i),
      Te(t, te);
  }
  function yI(t, e, r, o = 0, n = 2) {
    if (o > 0) {
      t.buffer.read_clip(Lt, o);
      let _ = br(e, Lt);
      if (_ === -1) return;
      _ === 0 && (o = 0);
    }
    let i = 8,
      a = Dh;
    (a.type = n),
      (a.clip = o),
      (a.x = e.x),
      (a.y = e.y),
      (a.u = r.x),
      (a.v = r.y);
    let s = t.write_triangle_vertex(a, !0);
    (a.x = e.x + e.w),
      (a.y = e.y),
      (a.u = r.x + r.w),
      (a.v = r.y),
      t.write_triangle_vertex(a, !0),
      (a.x = e.x),
      (a.y = e.y + e.h),
      (a.u = r.x),
      (a.v = r.y + r.h),
      t.write_triangle_vertex(a, !0),
      (a.x = e.x + e.w),
      (a.y = e.y + e.h),
      (a.u = r.x + r.w),
      (a.v = r.y + r.h),
      t.write_triangle_vertex(a, !0);
    let c = 201326592;
    t.add_index(ut(c, 0, s)),
      t.add_index(ut(c, 0, s + i)),
      t.add_index(ut(c, 0, s + i * 2)),
      t.add_index(ut(c, 0, s + i * 2)),
      t.add_index(ut(c, 0, s + i)),
      t.add_index(ut(c, 0, s + i * 3));
  }
  var fs = K("fff");
  fs.feather = 0;
  fs.line_width = 0;
  function je(t, e, r, o = 0) {
    yI(t, e, r, o, 4);
  }
  function ew(t, e, r, o = 0) {
    yI(t, e, r, o, 7);
  }
  function q(t, e, r, o, n = 0, i = 2) {
    ds.set(o, o, o, o), ue(t, e, r, ds, n, i);
  }
  function ue(t, e, r, o, n = 0, i = 2) {
    if (n > 0) {
      t.buffer.read_clip(Lt, n);
      let a = br(r, Lt);
      if (a === -1) return;
      a === 0 && (n = 0);
    }
    (te.closed = !0),
      te.color.copy(e.color),
      (te.clip = n),
      (te.width = e.line_width),
      (te.feather = e.feather),
      Gh(r, o, te),
      Te(t, te, i);
  }
  function gI(t, e, r, o, n, i = 0, a = 2) {
    if (i > 0) {
      t.buffer.read_clip(Lt, i);
      let s = br(r, Lt);
      if (s === -1) return;
      s === 0 && (i = 0);
    }
    (te.closed = !0),
      te.color.copy(e.color),
      (te.clip = i),
      (te.width = e.line_width),
      (te.feather = e.feather),
      BA(r, o, n, te),
      Te(t, te, a);
  }
  function X_(t, e, r, o, n = 0, i = 1, a = void 0) {
    let s = S(T);
    s.copy(e);
    let c = h(F).theme;
    (Cc.x = e.x),
      (Cc.y = e.y),
      (Cc.clip = n),
      (Cc.font = r.gpu_font.primitive_start),
      (Mc.color =
        a === void 0 ? c.text_primary.color.to_hex() : a.color.to_hex());
    let _ = r.scale_ratio * i;
    Mc.scale = _;
    let l = -1,
      u = nf;
    for (let d = 0; d < o.length; ++d) {
      let p = r.gpu_font.get_glyph(o.charCodeAt(d));
      if (!p) continue;
      u >= nf && (t.write_glyph_header(Cc), (u = 0));
      let m = r.gpu_font.compute_kerning(l, p.id) * _;
      (l = p.id),
        (Mc.x_offset = s.x - e.x + (p.xoffset + m) * _),
        (Mc.glyph_index = p.index);
      let f = t.write_glyph_vertex(Mc);
      t.add_index(Hi(u, lo.TOP_LEFT, f)),
        t.add_index(Hi(u, lo.TOP_RIGHT, f)),
        t.add_index(Hi(u, lo.BOTTOM_LEFT, f)),
        t.add_index(Hi(u, lo.BOTTOM_LEFT, f)),
        t.add_index(Hi(u, lo.TOP_RIGHT, f)),
        t.add_index(Hi(u, lo.BOTTOM_RIGHT, f)),
        (s.x += (p.xadvance + m) * _),
        u++;
    }
    R(s);
  }
  function n0(t, e, r, o = 0) {
    q(t, fs, e, r, o, 6);
  }
  function Vt(t, e, r, o = 0) {
    q(t, fs, e, r, o, 5);
  }
  function yf(t, e, r, o, n = 0) {
    ds.set(o, o, o, o), gI(t, fs, e, r, ds, n, 7);
  }
  function X0(t, e, r, o, n = 0) {
    gI(t, fs, e, r, o, n, 7);
  }
  var ms = new x(),
    Dn = new be(),
    hI = new b();
  function zw(t, e, r, o, n = 0, i = 0) {
    if (n > 0) {
      Dn.reset(),
        Dn.expand_point(hI.set(r.x, r.y, 0)),
        Dn.expand_point(hI.set(o.x, o.y, 0)),
        ms.set(Dn.min.x, Dn.min.y, Dn.max.x - Dn.min.x, Dn.max.y - Dn.min.y),
        t.buffer.read_clip(Lt, n);
      let a = br(ms, Lt);
      if (a === -1) return;
      a === 0 && (n = 0);
    }
    (te.closed = !1),
      te.color.copy(e.color),
      (te.clip = n),
      (te.width = e.line_width),
      (te.feather = e.feather),
      r.write(te.points),
      o.write(te.points, 2),
      (te.point_count = 2),
      ke(t, te, !0, i);
  }
  var Zt = class extends Yt {
      constructor(r) {
        super();
        this.options = [];
        this._index = 0;
        this._value = 0;
        this.radiuses = new M(3, 3, 3, 3);
        this.icon = !0;
        this._scale = 1;
        r && (this.display_label = new re(r));
      }
      get value() {
        return this._value;
      }
      set value(r) {
        if (!$r(r)) return;
        this._value = r;
        let o = this.options.find((n) => n.value === r);
        o &&
          ((this._index = this.options.indexOf(o)), (this.label.text = o.name));
      }
      get label() {
        return this.options[this._index].label;
      }
      get active_option_name() {
        let r = this.options[this._index];
        if (r) return r.name;
      }
      set radius(r) {
        this.radiuses.elements.fill(r);
      }
      set scale(r) {
        if (r !== this._scale) {
          for (let o of this.options) o.label.scale = r;
          this._scale = r;
        }
      }
      get scale() {
        return this._scale;
      }
      set_option(r, o, n) {
        (n = n ?? ka(r)), this.options.push({ name: r, value: o, label: n });
      }
      clear_option() {
        this.options = [];
      }
    },
    ea = new M(3, 3, 3, 3);
  function Yr(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = e.id,
      c = e.scale,
      _ = S(de),
      l = S(de),
      u = S(x),
      d = !1;
    t.ishovering(o) &&
      n >= t.hover_layer &&
      ((t.next_hover = s), (t.next_hover_layer_index = n)),
      _.copy(r),
      t.hover === s && t.active === -1 && _.color.copy(r.hover_color),
      e.radiuses.all_zero()
        ? O(a, _, o, i)
        : t.active === s
          ? (ea.set(e.radiuses.x * c * c, e.radiuses.y * c * c, 0, 0),
            ue(a, _, o, ea, i))
          : (ea.copy(e.radiuses).mul(c), ue(a, _, o, e.radiuses, i)),
      V(t, e.display_label || e.label, o, n, i);
    let m = t.buffer.layers[n + 1];
    if (t.active === s) {
      (t.next_hover_layer_index = n + 1),
        l.copy(r),
        l.color.copy(r.active_color);
      let f = e.options.length;
      u.copy(o),
        (u.y += u.h),
        (u.h = u.h * f),
        ea.set(0, 0, e.radiuses.z * c * c, e.radiuses.w * c * c),
        ue(m, _, u, ea),
        u.expand(Ai);
      let y = -1;
      if (!t.ishovering(u)) t.clear_active();
      else {
        e.icon &&
          (u.copy(o),
          (u.w = u.h),
          u.shrink(1),
          Ra(t.buffer.layers[n + 1], u, i)),
          u.copy(o),
          (u.y += u.h),
          _.color.copy(r.active_color);
        for (let g = 0; g < f; g++) {
          let v = e.options[g];
          t.ishovering(u) &&
            (g === f - 1
              ? (ea.set(0, 0, e.radiuses.z * c * c, e.radiuses.w * c * c),
                ue(m, _, u, ea))
              : O(m, _, u),
            (y = g)),
            V(t, v.label, u, n + 1),
            (u.y += u.h);
        }
        if (t.left_mouse_press) {
          if (y !== -1) {
            let g = e.options[y];
            (d = !0), (e.value = g.value);
          }
          (t.hover = -1),
            t.clear_active(),
            (t.last_active = -1),
            t.clear_mouse_state();
        }
      }
    } else
      e.icon &&
        (u.copy(o), (u.w = u.h), u.shrink(1), Ei(t.buffer.layers[n], u, i));
    return (
      t.hover === s && t.left_mouse_press === !0 && t.set_active(s),
      R(_),
      R(l),
      R(u),
      d
    );
  }
  var mu = class {
    constructor(e) {
      this.renderer = e;
      this.window_rect = new x(
        4,
        0,
        window.innerWidth - 4 * 2,
        window.innerHeight,
      );
      this.last_id = -1;
      this.last_fixed_id = -1;
      this.last_active = -1;
      this.lost_active = -1;
      this._double_click_id = -1;
      this._double_click_begin = 0;
      this.double_click_duration = 500;
      this.mouse_start = new T();
      this.mouse_offset = new T();
      this.mouse_location = new T();
      this.pointer_delta = new T();
      this.mouse_wheel = 1;
      this.mouse_wheel_raw = 0;
      this.tab_rect = new x();
      this.tab = new jt("default", () => {});
      this.left_mouse_press = !1;
      this.left_mouse_release = !1;
      this.right_mouse_press = !1;
      this.right_mouse_release = !1;
      this.middle_mouse_press = !1;
      this.middle_mouse_release = !1;
      this.left_mouse_is_pressed = !1;
      this.right_mouse_is_pressed = !1;
      this.middle_mouse_is_pressed = !1;
      this.next_hover = -1;
      this.next_hover_layer_index = -1;
      this.hover_layer = -1;
      this.hover = -1;
      this.active = -1;
      this.focus = -1;
      this.active_frame_count = 0;
      this.drop_event = void 0;
      this.key_pressed = new Set();
      this.key_press = new Set();
      this.delta_time = 0;
      this.touch_screen = !1;
      this.smooth_factor = 0.05;
      this._defer_update_frame_count = 8;
      this._defer_update_frame_index = this._defer_update_frame_count;
      this.clear_mouse_state = () => {
        (this.left_mouse_release = !1),
          (this.left_mouse_press = !1),
          (this.right_mouse_press = !1),
          (this.right_mouse_release = !1),
          (this.middle_mouse_press = !1),
          (this.middle_mouse_release = !1);
      };
      (this.touch_screen = "ontouchstart" in window),
        Xu(this),
        B.on(oe.ForceUpdate, () => {
          this.needs_update = !0;
        }),
        B.on(oe.MouseMove, (r) => {
          this.mouse_location.copy(r.point), (this.needs_update = !0);
        }),
        B.on(oe.MouseDrag, (r) => {
          this.pointer_delta.copy(r.delta),
            this.key_pressed.has(16) &&
              this.pointer_delta.mul(this.smooth_factor),
            this.mouse_offset.copy(this.mouse_location).sub(this.mouse_start),
            (this.needs_update = !0);
        }),
        B.on(oe.MouseDown, (r) => {
          r.button === 0 &&
            (this.left_mouse_is_pressed = this.left_mouse_press = !0),
            r.button === 2 &&
              (this.right_mouse_is_pressed = this.right_mouse_press = !0),
            r.button === 1 &&
              (this.middle_mouse_is_pressed = this.middle_mouse_press = !0),
            this.mouse_offset.set(0, 0),
            this.mouse_start.copy(this.mouse_location),
            (this.needs_update = !0);
        }),
        B.on(oe.MouseUp, (r) => {
          r.button === 0 &&
            ((this.left_mouse_release = !0), (this.left_mouse_is_pressed = !1)),
            r.button === 2 &&
              ((this.right_mouse_release = !0),
              (this.right_mouse_is_pressed = !1)),
            r.button === 1 &&
              ((this.middle_mouse_release = !0),
              (this.middle_mouse_is_pressed = !1)),
            this.pointer_delta.set(0, 0),
            (this.needs_update = !0);
        }),
        B.on(oe.MouseWheel, (r) => {
          (this.mouse_wheel = r.delta),
            (this.mouse_wheel_raw = r.delta_y),
            this.key_pressed.has(16) &&
              ((this.mouse_wheel =
                1 + (this.mouse_wheel - 1) * this.smooth_factor),
              (this.mouse_wheel_raw *= this.smooth_factor)),
            (this.needs_update = !0);
        }),
        B.on(oe.TouchStart, (r) => {
          (this.touch_screen = !0),
            this.mouse_location.copy(r.point),
            this.mouse_start.copy(this.mouse_location),
            (this.needs_update = !0),
            B.fire(ze.Frame),
            r.button === 0 &&
              (this.left_mouse_is_pressed = this.left_mouse_press = !0),
            r.button === 2 &&
              (this.right_mouse_is_pressed = this.right_mouse_press = !0),
            r.button === 1 &&
              (this.middle_mouse_is_pressed = this.middle_mouse_press = !0),
            (this.needs_update = !0);
        }),
        B.on(oe.TouchMove, (r) => {
          this.mouse_location.copy(r.point),
            this.mouse_offset.copy(this.mouse_location).sub(this.mouse_start),
            this.pointer_delta.copy(r.delta),
            (this.needs_update = !0);
        }),
        B.on(oe.TouchEnd, (r) => {
          r.button === 0 &&
            ((this.left_mouse_release = !0), (this.left_mouse_is_pressed = !1)),
            r.button === 2 &&
              ((this.right_mouse_release = !0),
              (this.right_mouse_is_pressed = !1)),
            r.button === 1 &&
              ((this.middle_mouse_release = !0),
              (this.middle_mouse_is_pressed = !1)),
            this.mouse_location.copy(r.point),
            (this.needs_update = !0);
        }),
        B.on(oe.Resize, (r) => {
          this.window_rect.set(4, 0, r.width - 4 * 2, r.height),
            (this.needs_update = !0);
        }),
        B.on(oe.KeyDown, (r) => {
          this.key_pressed.add(r.keycode),
            this.key_press.add(r.keycode),
            (this.needs_update = !0);
        }),
        B.on(oe.KeyUp, (r) => {
          this.key_pressed.delete(r.keycode), (this.needs_update = !0);
        }),
        B.on(In.ClearActive, () => {
          this.clear_active();
        });
    }
    set cursor_type(e) {
      let r = C.CurrentDevice();
      r.canvas.style.cursor = e;
    }
    set needs_update(e) {
      e === !0
        ? (this._defer_update_frame_index = this._defer_update_frame_count)
        : (this._defer_update_frame_index = 0);
    }
    get needs_update() {
      return this._defer_update_frame_index > 0;
    }
    get buffer() {
      return this.renderer.buffer;
    }
    update() {
      this.key_press.clear(),
        (this.hover = this.next_hover),
        (this.hover_layer = this.next_hover_layer_index),
        (this.next_hover = -1),
        (this.next_hover_layer_index = -1),
        (this.mouse_wheel = 1),
        (this.mouse_wheel_raw = 0),
        this.pointer_delta.set(0, 0),
        (this.left_mouse_release || this.right_mouse_release) &&
          this.mouse_offset.set(0, 0),
        this.clear_mouse_state();
      let e = this._defer_update_frame_index > 0;
      return (
        e && this._defer_update_frame_index--,
        this.active !== -1 && this.active_frame_count++,
        e
      );
    }
    ishovering(e) {
      return e.contains(this.mouse_location);
    }
    set_active(e, r = !1) {
      return this.active === -1 || r
        ? (r && (this.lost_active = this.active),
          (this.last_active = this.active),
          (this.active = e),
          !0)
        : !1;
    }
    set_double_click_id(e) {
      (this._double_click_id = e),
        (this._double_click_begin = performance.now());
    }
    check_double_click(e) {
      return (
        this._double_click_id === e &&
        performance.now() - this._double_click_begin <
          this.double_click_duration
      );
    }
    clear_active() {
      (this.last_active = this.active),
        (this.active = -1),
        (this.active_frame_count = 0),
        (this.cursor_type = "auto");
    }
    set_focus(e, r = !1) {
      return (this.focus = e), !0;
    }
    clear_focus() {
      (this.focus = -1), this.touch_screen && (h(F).keyboard.visible = !1);
    }
    add_new_tab(e, r) {
      let o = new jt(e, r);
      return this.tab.node?.add_tab(o), o;
    }
    is_tab_active(e) {
      return h(we).dock_system?.active_dock_node === e.node.id;
    }
  };
  var xI = new WeakMap(),
    Uh = new x(),
    WA = new M(Be, Be, 0, 0);
  function OA(t) {
    let e = xI.get(t);
    if (!e) {
      (e = {}), (e.space_btns = {}), (e.active_space_id = 0);
      let r = new qe("");
      (r.outline = !0),
        (r.label.padding_left = 5),
        (r.label.alignment = 33),
        (e.chat_input = r),
        (e.chat_count = 0),
        (e.chat_lines = []),
        (e.chat_scroll_view = new Ar()),
        (e.start = -1),
        xI.set(t, e);
    }
    return e;
  }
  function Mh(t) {
    let e = OA(t.tab),
      r = t.tab_rect,
      o = h(F).theme,
      n = h(Hn);
    Uh.copy(r), (Uh.h = Ry), ue(t.buffer, o.button_breadcrumb, Uh, WA);
  }
  Fe(Mh, "ui_tab_live");
  var HA = new b(0, 0, 0),
    zh = class {
      constructor() {
        this.nose = new b();
        this.left_eye_inner = new b();
        this.left_eye = new b();
        this.left_eye_outer = new b();
        this.right_eye_inner = new b();
        this.right_eye = new b();
        this.right_eye_outer = new b();
        this.left_ear = new b();
        this.right_ear = new b();
        this.mouth_left = new b();
        this.mouth_right = new b();
        this.left_shoulder = new b();
        this.right_shoulder = new b();
        this.left_elbow = new b();
        this.right_elbow = new b();
        this.left_wrist = new b();
        this.right_wrist = new b();
        this.left_pinky = new b();
        this.right_pinky = new b();
        this.left_index = new b();
        this.right_index = new b();
        this.left_thumb = new b();
        this.right_thumb = new b();
        this.left_hip = new b();
        this.right_hip = new b();
        this.left_knee = new b();
        this.right_knee = new b();
        this.left_ankle = new b();
        this.right_ankle = new b();
        this.left_heel = new b();
        this.right_heel = new b();
        this.left_foot_index = new b();
        this.right_foot_index = new b();
      }
      parse(e) {
        let r = e.keypoints3D;
        for (let o = 0; o < r.length; ++o) {
          let n = r[o];
          n.score > 0.65 && this[n.name].set(n.x, n.y, n.z).mul(-10).sub(HA);
        }
        return this;
      }
    },
    Dt = new x(),
    wI = new T(),
    hs,
    Nh = new WeakMap(),
    bs = 24,
    Bh = !1,
    ta,
    zt,
    gs,
    TI,
    RI,
    Wh,
    De,
    Ch = [],
    sp = 0,
    Ir = new zh();
  async function VA() {
    if (
      (zt.readyState < 2 &&
        (await new Promise((t) => {
          zt.onloadeddata = () => {
            t(zt);
          };
        })),
      ta !== void 0)
    ) {
      try {
        Ch = await ta.estimatePoses(zt, { maxPoses: 1, flipHorizontal: !1 });
      } catch (t) {
        throw (ta.dispose(), (ta = void 0), t);
      }
      Ch.length > 0 && Ir.parse(Ch[0]);
    }
  }
  async function SI() {
    await VA(), (sp = requestAnimationFrame(SI));
  }
  function FI() {
    sp !== -1 && ta !== void 0 && SI();
  }
  function jA() {
    cancelAnimationFrame(sp), (sp = -1);
  }
  async function XA() {
    if (Bh === !0) return;
    Bh = !0;
    let t = window.poseDetection,
      e = t.SupportedModels.BlazePose,
      r = { runtime: "tfjs", enableSmoothing: !0, modelType: "full" },
      o = await t.createDetector(e, r),
      n = {
        audio: !1,
        video: {
          facingMode: "user",
          width: 360,
          height: 270,
          frameRate: { ideal: 60 },
        },
      };
    zt = document.getElementById("video");
    let i = await navigator.mediaDevices.getUserMedia(n);
    return (
      (zt.srcObject = i),
      await new Promise((a) => {
        zt.onloadedmetadata = () => {
          (zt.width = zt.videoWidth),
            (zt.height = zt.videoHeight),
            zt.play(),
            a(zt);
        };
      }),
      (gs = Ne({ source: zt, flip_y: !1 })),
      (Wh = ce({
        primitive: He("screen_triangle"),
        uniforms: { color_map: gs },
      })),
      (TI = Me({
        vertex_shader: ie("shader/base.vert"),
        fragment_shader: ie("shader/ui_copy.frag"),
        uniforms: [{ name: "color_map", type: 10 }],
        depth_write: !1,
        depth_compare_func: 519,
      })),
      (De = ce({
        primitive: He("cube"),
        uniforms: { world_matrix: new L(), color_map: We("default") },
      })),
      (RI = ge("default")),
      (ta = o),
      FI(),
      o
    );
  }
  function Oh(t) {
    if (navigator.mediaDevices === void 0) return;
    let e = Nh.get(t.tab);
    e === void 0 &&
      ((e = {}),
      (e.state = 0),
      (e.play_btn = new P()),
      e.play_btn.radiuses.set(4, 0, 4, 0),
      (e.pause_btn = new P()),
      (e.pause_btn.radius = 0),
      (e.record_btn = new P()),
      e.record_btn.radiuses.set(0, 4, 0, 4),
      (e.camera = new Ye()),
      e.camera.location.set(10, 10, 10),
      (e.controller = new zn(e.camera)),
      (e.mode = 0),
      (e.mouse_start = new T()),
      Nh.set(t.tab, e));
    let r = C.CurrentDevice(),
      o = r.encoder,
      n = ta && gs && Wh;
    if (n) {
      o.set_pass(t.renderer.screen_pass);
      let i = t.tab_rect,
        a = e.camera,
        s = e.controller;
      o.set_camera(a), (a.aspect = i.w / i.h), a.update_projection_matrix();
      let c = t.tab.node.id,
        _ = t.ishovering(i);
      _ && t.next_hover === -1 && (t.next_hover = c),
        t.hover === c &&
          (t.left_mouse_press || t.right_mouse_press) &&
          (t.active !== c && e.mouse_start.copy(t.mouse_location),
          t.set_active(c)),
        t.active === c &&
          (t.left_mouse_release || t.right_mouse_release) &&
          (t.clear_active(),
          (e.mode = 0),
          e.mouse_start.distance(t.mouse_location) < 8 && console.log("pick")),
        t.active === c &&
          e.mode === 0 &&
          (t.left_mouse_press
            ? (e.mode = 1)
            : t.right_mouse_press && (e.mode = 2)),
        e.mode === 1 &&
          (s.rotate_horizontal(t.mouse_offset.x / i.w),
          s.rotate_vertical(t.mouse_offset.y / i.h)),
        e.mode === 2 &&
          (wI.set(t.mouse_offset.x / i.w, t.mouse_offset.y / i.h), s.move(wI)),
        _ && s.zoom(t.mouse_wheel),
        s.update(t.delta_time);
      let l = r.pixel_ratio;
      Dt.copy(t.tab_rect),
        o.set_viewport(i.x * l, r.height - (i.y + i.h) * l, i.w * l, i.h * l),
        qA(t),
        Vt(t.buffer, Dt, 4),
        Dt.copy(t.tab_rect),
        (Dt.x += Dt.w - zt.videoWidth - 10),
        (Dt.y += 10),
        (Dt.w = zt.videoWidth),
        (Dt.h = zt.videoHeight),
        o.set_viewport(
          Dt.x * l,
          r.height - (Dt.y + Dt.h) * l,
          Dt.w * l,
          Dt.h * l,
        ),
        o.set_pipeline(TI),
        o.set_draw(Wh);
    }
    if (n) {
      let i = r.gl;
      i.bindTexture(i.TEXTURE_2D, gs.webgl_texture),
        i.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, gs.format, gs.data_type, zt),
        i.bindTexture(i.TEXTURE_2D, null),
        Vt(t.buffer.layers[1], Dt, 6),
        (t.needs_update = !0);
    }
    QA(t), o.set_pass();
  }
  Fe(Oh, "ui_tab_recorder");
  var xs = 0.3,
    pt = new b(),
    _e = new b(),
    $t = new b(xs, xs, xs),
    wr = new $(0, 0, 0, 1),
    Lh = new b(0.2, 1, 0.2),
    ys = new b(),
    $A = new b(0, 1, 0),
    vI = new $();
  function uo(t, e, r, o) {
    ys.copy(r).sub(o);
    let n = ys.length;
    (Lh.y = n === 0 ? 1 : n),
      (Lh.y *= 0.5),
      ys.normalize(),
      vI.from_unit_vectors($A, ys),
      ys.mul(n * 0.5).add(o),
      De.uniforms.world_matrix.compose(ys, vI, Lh),
      e.set_draw(De);
  }
  function qA(t) {
    let e = C.CurrentDevice().encoder;
    e.set_pipeline(RI),
      _e.set(0, 0, 0),
      $t.set(10, 0.1, 10),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      $t.set(xs, xs, xs),
      _e.copy(Ir.right_wrist),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.right_elbow),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.right_shoulder),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.right_hip),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.right_knee),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.right_ankle),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.right_foot_index),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      _e.copy(Ir.left_wrist),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.left_elbow),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.left_shoulder),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.left_hip),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.left_knee),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.left_ankle),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De),
      pt.copy(_e),
      _e.copy(Ir.left_foot_index),
      uo(t, e, _e, pt),
      De.uniforms.world_matrix.compose(_e, wr, $t),
      e.set_draw(De);
  }
  var vr = new x();
  function QA(t) {
    let e = h(F).theme,
      r = Nh.get(t.tab);
    if (
      (vr.copy(t.tab_rect),
      (vr.y += bs >>> 1),
      (vr.x = (t.tab_rect.w - bs * 3 + 0.8 * 2) >> 1),
      (vr.w = bs),
      (vr.h = bs),
      (hs = r.state === 2 ? e.button_active : e.button_state),
      E(t, r.play_btn, hs, vr) &&
        (r.state === 2
          ? (r.state = 0)
          : (r.state === 0 || r.state === 3) && (r.state = 2)),
      Ya(t.buffer, vr),
      (vr.x += bs + 0.8),
      (hs = r.state === 3 || r.state === 4 ? e.button_active : e.button_state),
      E(t, r.pause_btn, hs, vr) &&
        (r.state === 3
          ? (r.state = 2)
          : r.state === 4
            ? (r.state = 1)
            : r.state === 2
              ? (r.state = 3)
              : r.state === 1 && (r.state = 4)),
      Zl(t.buffer, vr),
      (vr.x += bs + 0.8),
      (hs = e.button_state),
      E(t, r.record_btn, hs, vr) &&
        (Bh === !1 && XA(),
        r.state === 0
          ? ((r.state = 1), FI())
          : r.state === 1 && ((r.state = 0), jA())),
      vr.shrink(6),
      r.state !== 1)
    ) {
      let o = h(F).theme;
      q(t.buffer, o.axis_input_x, vr, 5);
    } else O(t.buffer, e.white, vr);
    ZA(t);
  }
  var II = 200;
  function ZA(t) {
    let e = h(F).theme;
    Dt.copy(t.tab_rect),
      (Dt.y += Dt.h - II),
      (Dt.h = II),
      O(t.buffer, e.panel_layer_0, Dt);
  }
  var Do = class {
    static reset(e) {
      e && this.rect.copy(e),
        (this.item_index = 0),
        (this.item_count = 0),
        (this.item_height = 24);
    }
    static layout(e, r) {
      e.copy(this.rect),
        (e.h = this.item_height),
        (e.w *= this.split_ratio),
        e.shrink(this.padding),
        r.copy(this.rect),
        (r.h = this.item_height),
        (r.x += e.w),
        (r.w -= e.w),
        r.shrink(this.padding),
        (this.rect.y += this.item_height),
        this.item_index++;
    }
  };
  (Do.rect = new x()),
    (Do.item_height = 24),
    (Do.item_index = 0),
    (Do.item_count = 0),
    (Do.split_ratio = 0.6),
    (Do.padding = 3);
  var AI = new x(),
    YA = new x(),
    kI = new WeakMap();
  function JA(t) {
    let e = kI.get(t);
    return e || ((e = {}), kI.set(t, e)), e;
  }
  function Hh(t) {
    let { tab: e, tab_rect: r } = t,
      o = JA(e);
    if (!o.block_names) {
      let i = h(F).settings;
      o.block_names = Object.getOwnPropertyNames(i);
    }
    let n = o.block_names;
    Do.rect.copy(r);
    for (let i of n) {
      Do.layout(AI, YA);
      let a = ka(i);
      V(t, a, AI);
    }
  }
  Fe(Hh, "ui_settings");
  var PI = new WeakMap();
  function Vh(t) {
    let e = PI.get(t);
    return (
      e ||
        ((e = {}),
        (e.scale = 1),
        (e.scale_label = new re(`scale: ${e.scale.toFixed(2)}`)),
        (e.scale_label.constraint.width = 200),
        (e.scale_label.constraint.height = 24),
        e.scale_label.constraint.margin.set(0, 0, 5, 5),
        (e.scale_label.constraint.alignment = 48),
        (e.scale_label.alignment = 33),
        (e.offset = new T(0, 0)),
        (e.id = e.scale_label.id),
        PI.set(t, e)),
      e
    );
  }
  function KA(t) {
    let e = {},
      r = Vh(t);
    (e.scale = r.scale), (e.offset = [r.offset.x, r.offset.y]);
    let o = r.texture_resource;
    return o && (e.texture_resource_uuid = o.uuid), e;
  }
  function e3(t, e) {
    let r = Vh(t);
    (r.scale = e.scale),
      r.offset.set(e.offset[0], e.offset[1]),
      e.texture_resource_uuid &&
        (r.texture_resource = h(J).get_resource(e.texture_resource_uuid));
  }
  var ws = new x(),
    Bc = new T(0, 0),
    EI = new T(0, 0);
  function cp(t) {
    let e = t.tab_rect,
      r = Vh(t.tab),
      o = r.offset,
      n = r.scale,
      i = t.buffer.write_clip(e),
      a = We("default");
    r.texture_resource && (a = r.texture_resource.data.texture),
      Bc.set(
        e.x + e.w * 0.5 - a.width * n * 0.5,
        e.y + e.h * 0.5 - a.height * n * 0.5,
      ),
      t.active === r.id && Bc.add(t.mouse_offset),
      ws.copy(e).shrink(1),
      EI.copy(Bc).add(o),
      bu(t, ws, n, EI, 0, i),
      ws.set(Bc.x + o.x, Bc.y + o.y, a.width * n, a.height * n),
      j_(t, a, ws, 0, i);
    let s = h(we);
    if (s) {
      let c = s.dock_system.active_dock_node;
    }
    t.active === r.id &&
      t.left_mouse_release &&
      (r.offset.add(t.mouse_offset), t.clear_active()),
      yt(e, r.scale_label.constraint, ws),
      V(t, r.scale_label, ws);
  }
  Fe(cp, "ui_tab_texture_editor");
  Ko(cp, KA, e3);
  var DI = new WeakMap(),
    _p = 120,
    t3 = 32,
    jh = new x(),
    gi = new x(),
    GI = new x();
  function r3(t) {
    let e = DI.get(t);
    return (
      e ||
        ((e = {}),
        (e.scale = 1),
        (e.pivot = 0),
        (e.frame_start = 0),
        (e.frame_end = 128),
        (e.id = Ie(e)),
        DI.set(t, e)),
      e
    );
  }
  function Xh(t) {
    let e = h(F).theme,
      r = t.tab_rect,
      o = r3(t.tab),
      { scale: n, id: i, frame_start: a, frame_end: s } = o,
      c = o.pivot;
    GI.copy(r);
    let _ = t.buffer.write_clip(r);
    t.ishovering(r) && t.active === -1 && (t.next_hover = i),
      t.hover === i && t.left_mouse_press && t.set_active(i),
      t.active === i &&
        ((c = Q(c - t.mouse_offset.x / n, 0, s * _p - r.w)),
        t.left_mouse_release && (t.clear_active(), (o.pivot = c))),
      gi.copy(GI),
      (gi.w = _p * n);
    let l = Math.ceil(r.w / gi.w) + 1,
      u = Math.floor(c / _p);
    gi.x -= (c % _p) * n;
    for (let d = 0; d < l; ++d) {
      let p = u + d,
        m = `${p * 5}`,
        f = ka(m);
      p & 1 && O(t.buffer, e.panel_layer_0, gi, _),
        jh.copy(gi),
        (jh.h = t3),
        V(t, f, jh, 0, _),
        (gi.x += gi.w);
    }
    o.scale = Q(t.mouse_wheel * o.scale, 0.1, 10);
  }
  Fe(Xh, "ui_tab_timeline");
  var UI = new WeakMap();
  function o3(t) {
    let e = UI.get(t.tab);
    if (!e) {
      e = {};
      let r = {
          vertex_shader: ie("shader/editor/ui.vert"),
          fragment_shader: ie("shader/editor/ui.frag"),
          defines: ["DEBUG"],
          uniforms: [
            { name: "window_size", type: 3 },
            { name: "primitive_buffer", type: 10 },
            { name: "icon_texture", type: 10 },
            { name: "font_texture", type: 10 },
            { name: "code_font_texture", type: 10 },
            { name: "screen_texture", type: 10 },
            { name: "atlas_texture", type: 10 },
            { name: "time", type: 1 },
            { name: "max_primitive_offset", type: 1 },
            { name: "max_primitive_sickness", type: 1 },
            { name: "view_matrix", type: 9 },
            { name: "projection_matrix", type: 9 },
          ],
          blend: { enabled: !0 },
          cull_mode: 0,
          depth_compare_func: 519,
        },
        o = t.tab_rect;
      (e.pipeline = Me(r)), (e.thickness = Math.max(o.w, o.h));
      let n = new Ye(),
        i = Math.tan(n.vertical_fov * cr * 0.5) * e.thickness * 10;
      n.location.set(0, 0, -i),
        (n.near = 1),
        (n.far = 1e4),
        n.update_projection_matrix(),
        (e.camera = n),
        (e.control = new zn(e.camera)),
        UI.set(t.tab, e);
    }
    return e;
  }
  var lp = new T();
  function $h(t) {
    let e = t.tab_rect,
      r = t.tab,
      o = o3(t),
      n = o.pipeline,
      i = o.camera,
      a = Qt(),
      s = C.CurrentDevice(),
      c = s.pixel_ratio,
      _ = s.encoder,
      l = e.w * c,
      u = e.h * c,
      d = t.is_tab_active(r) && t.ishovering(e),
      p = o.control;
    d &&
      (t.left_mouse_is_pressed &&
        (p.rotate_horizontal(t.pointer_delta.x / e.w),
        p.rotate_vertical(t.pointer_delta.y / e.h)),
      t.right_mouse_is_pressed &&
        (lp.copy(t.pointer_delta), (lp.x /= e.w), (lp.y /= e.h), p.move(lp)),
      p.zoom(t.mouse_wheel),
      p.update(t.delta_time) && (t.needs_update = !0)),
      i.resize(l, u),
      a.set_screen_pass(e, "ui_debug"),
      _.set_camera(i),
      _.set_pipeline(n),
      (a.draw.uniforms.max_primitive_sickness = o.thickness),
      (a.draw.uniforms.screen_texture = We("black")),
      _.set_draw(t.renderer.draw),
      _.set_pass(),
      (a.draw.uniforms.screen_texture = a.screen_texture),
      Vt(t.buffer, e, Be);
  }
  Fe($h, "ui_tab_ui_debug");
  var n3 = { alignment: 9, width: 20, height: 20 },
    MI = new WeakMap();
  function i3(t) {
    let e = MI.get(t);
    return (
      e ||
        ((e = {}),
        (e.add_input = new P("Add Virtual Input")),
        (e.inputs = new WeakMap()),
        MI.set(t, e)),
      e
    );
  }
  var a3 = 128,
    s3 = 32,
    up = new x(),
    pp = new x(),
    jr = new x(),
    xi = new x(),
    Er = new x(),
    dp = new x();
  function qh(t) {
    let e = h(Kt),
      r = e.virtual_inputs,
      o = h(F).theme;
    Er.copy(t.tab_rect), (Er.h = Ht), dp.copy(t.tab_rect), (dp.h -= s3);
    let n = t.buffer.write_clip(dp);
    Er.copy(dp), Er.shrink(5), (Er.y += 1), (Er.h = 26);
    for (let [i, a] of r) {
      q(t.buffer, o.panel_layer_1, Er, 3, n),
        up.copy(Er),
        up.shrink(5),
        jr.copy(up);
      let s = c3(t, a);
      if (
        ((jr.w = jr.h),
        E(t, s.fold_btn, o.panel_layer_1, jr, 0, n) && (s.folded = !s.folded),
        (s.folded ? yl : gl)(t.buffer, jr, n),
        (jr.x += jr.w + 5),
        (jr.w = a3),
        At(t, s.input, o.input_line, jr, 0, n))
      ) {
        let l = s.input.text;
        l !== i && e.virtual_inputs.replace(i, l);
      }
      if (
        (yt(up, n3, pp),
        E(t, s.delete_btn, o.panel_layer_1, pp, 0, n) && e.remove_input(i),
        pp.shrink(3),
        jn(t.buffer, pp, n),
        (Er.y += Er.h),
        s.folded)
      ) {
        Er.y += 5;
        continue;
      }
      let _ = _3(s, a);
      xi.copy(Er), xi.shrink(0, 10), (xi.h = 24);
      for (let [l, u] of a.triggers) {
        O(t.buffer, o.panel_layer_3, xi), jr.copy(xi), jr.shrink(3, 5);
        let d = _.inputs.get(l);
        d ||
          ((d = new qe(l.toString())),
          (d.padding_left = 5),
          (d.radius = 2),
          (d.alignment = 33),
          _.inputs.set(l, d)),
          (jr.w = 100),
          At(t, d, o.input_line, jr, 0, n),
          (xi.y += xi.h),
          (Er.y += xi.h);
      }
      Er.y += 5;
    }
  }
  function c3(t, e) {
    let r = i3(t.tab),
      o = r.inputs.get(e);
    if (!o) {
      (o = {}),
        (o.delete_btn = new P()),
        (o.fold_btn = new P()),
        (o.triggers = new WeakMap());
      let n = new qe(e.name);
      (n.alignment = 33),
        (n.padding_left = 5),
        (o.input = n),
        r.inputs.set(e, o);
    }
    return o;
  }
  function _3(t, e) {
    let r = t.triggers.get(e);
    return r || ((r = {}), (r.inputs = new Map()), t.triggers.set(e, r)), r;
  }
  Fe(qh, "ui_tab_virtual_input");
  var vs = 10,
    Qh = 22,
    po = new x(),
    cn = new T(),
    Zh = new P("Project"),
    Is = new x(),
    Yh = new P("Edit"),
    Ts = new x(),
    Jh = new P("Tool"),
    Rs = new x(),
    Kh = new P("View"),
    Ss = new x(),
    eb = new P("Plugin"),
    mp = new x(),
    Oc = new x(0, 0, 140, 0),
    CI = "SEPARATOR",
    rb = new P(),
    Hc = new Map(),
    ob = new WeakMap();
  var _n = "None",
    fu = class {
      constructor() {
        this.rect = new x();
        (this.id = Ie(this)), this.rect.set(0, 0, window.innerWidth, Ut);
        let e = hr(zr);
        (Zh.radius = 2),
          e.compute_size(Zh.label.text, cn),
          Is.set(this.rect.x + vs, pe, cn.x + vs * 2, Ut - pe),
          (Yh.radius = 2),
          e.compute_size(Yh.label.text, cn),
          Ts.set(Is.x + Is.w, pe, cn.x + vs * 2, Ut - pe),
          (Jh.radius = 2),
          e.compute_size(Jh.label.text, cn),
          Rs.set(Ts.x + Ts.w, pe, cn.x + vs * 2, Ut - pe),
          (Kh.radius = 2),
          e.compute_size(Kh.label.text, cn),
          Ss.set(Rs.x + Rs.w, pe, cn.x + vs * 2, Ut - pe),
          (eb.radius = 2),
          e.compute_size(eb.label.text, cn),
          mp.set(Ss.x + Ss.w, pe, cn.x + vs * 2, Ut - pe),
          this.create_menu_item_action("Project", "Union OS", d3),
          this.create_menu_item_action("Project", "Open Local Project", m3),
          this.create_menu_item_action("Project", "Save Project", f3),
          this.create_menu_item_action("Project", "Download Project", h3),
          this.create_menu_item_action("Project", "Settings", b3),
          this.create_menu_item_action("Edit", "Undo", vh),
          this.create_menu_item_action("Edit", "Redo", Ih),
          this.create_menu_item_tab("Tool", "Virtual Input", qh),
          this.create_menu_item_tab("View", "File Browser", Xi),
          this.create_menu_item_tab("View", "Edit View", Wi),
          this.create_menu_item_tab("View", "Runtime View", ci),
          this.create_menu_item_tab("View", "Texture Editor", cp),
          this.create_menu_item_tab("View", "Terminal", $i),
          this.create_menu_item_tab("View", "Timeline", Xh),
          this.create_menu_item_tab("Plugin", "UI Debug", $h),
          this.create_menu_item_action("Plugin", "Keyboard", p3),
          this.create_menu_item_tab("Plugin", "Motion Capture", Oh),
          this.create_menu_item_tab("Plugin", "Live Collaborate", Mh),
          this.create_menu_item_tab("Plugin", "Icon Gallery", Zs);
      }
      create_menu_item_tab(e, r, o) {
        let n;
        r === CI
          ? (n = rb)
          : ((n = new P(r)),
            (n.radius = 1),
            (n.label.alignment = 33),
            (n.label.padding_left = 30),
            ob.set(n, LI.bind(null, r, o)));
        let i = Hc.get(e);
        return i === void 0 && ((i = []), Hc.set(e, i)), i.push(n), n;
      }
      create_menu_item_action(e, r, o) {
        let n;
        r === CI
          ? (n = rb)
          : ((n = new P(r)),
            (n.radius = 1),
            (n.label.alignment = 33),
            (n.label.padding_left = 30),
            ob.set(n, o));
        let i = Hc.get(e);
        return i === void 0 && ((i = []), Hc.set(e, i)), i.push(n), n;
      }
      render(e) {
        let r = h(F).theme;
        return (
          e.active === this.id &&
            (Is.contains(e.mouse_location)
              ? (_n = "Project")
              : Ts.contains(e.mouse_location)
                ? (_n = "Edit")
                : Rs.contains(e.mouse_location)
                  ? (_n = "Tool")
                  : Ss.contains(e.mouse_location)
                    ? (_n = "View")
                    : mp.contains(e.mouse_location) && (_n = "Plugin"),
            _n === "Project"
              ? Wc(e, r, "Project", Is)
              : _n === "Edit"
                ? Wc(e, r, "Edit", Ts)
                : _n === "Tool"
                  ? Wc(e, r, "Tool", Rs)
                  : _n === "View"
                    ? Wc(e, r, "View", Ss)
                    : _n === "Plugin" && Wc(e, r, "Plugin", mp),
            po.copy(Oc),
            (po.x -= id),
            (po.y -= Ut),
            (po.w += id * 2),
            (po.h += Ut * 2),
            po.contains(e.mouse_location) ||
              (e.clear_active(),
              e.buffer.layers[1].reset(),
              (e.next_hover_layer_index = 0))),
          E(e, Zh, r.menu_tab, Is) && e.set_active(this.id),
          E(e, Yh, r.menu_tab, Ts) && e.set_active(this.id),
          E(e, Jh, r.menu_tab, Rs) && e.set_active(this.id),
          E(e, Kh, r.menu_tab, Ss) && e.set_active(this.id),
          E(e, eb, r.menu_tab, mp) && e.set_active(this.id),
          !0
        );
      }
    };
  function l3(t, e, r, o = 1, n = 0) {
    let i = t.buffer.layers[o];
    q(i, e, r, 3, n);
  }
  var tb = new x();
  function u3(t, e, r = 1) {
    let o = t.buffer.layers[r];
    tb.copy(e), (tb.h = nd);
    let n = h(F).theme;
    return O(o, n.background_float, tb), nd;
  }
  function Wc(t, e, r, o) {
    let n = Hc.get(r);
    (Oc.h = Qh * n.length),
      rc(t.window_rect, o, Oc),
      l3(t, e.background_overlay, Oc),
      po.copy(Oc),
      (po.h = Qh);
    for (let i of n) {
      if (i === rb) {
        po.y += u3(t, po);
        continue;
      }
      if (Y0(t, e.menu_button, i, po, 1)) {
        let a = ob.get(i);
        a && a();
      }
      po.y += Qh;
    }
  }
  function LI(t, e) {
    h(we).dock_system.get_active_dock().add_tab(new jt(t, e));
  }
  function vh() {
    console.log("editor.undo");
    let t = h(ee).data_center,
      e = t.undo();
    e &&
      e.method === "set_property" &&
      e.parameters[1].startsWith("transform.") &&
      Ft(t, e.parameters[0]);
  }
  function Ih() {
    console.log("editor.redo");
    let t = h(ee).data_center,
      e = t.redo();
    e &&
      e.method === "set_property" &&
      e.parameters[1].startsWith("transform.") &&
      Ft(t, e.parameters[0]);
  }
  function p3() {
    let t = h(F).keyboard;
    t.visible = !t.visible;
  }
  function d3() {
    window.location.href = `${window.location.protocol}//${window.location.host}`;
  }
  function m3() {
    h(Hr).invoke_with_path("project.open");
  }
  function f3() {
    h(Hr).invoke_with_path("project.save");
  }
  function h3() {
    h(Hr).invoke_with_path("project.download");
  }
  function b3() {
    LI("Settings", Hh);
  }
  var zI;
  function Xu(t) {
    zI = t;
  }
  function sI() {
    return zI;
  }
  var fp = new re("");
  fp.alignment = 33;
  fp.padding.w = 10;
  var Gn = new re("");
  Gn.alignment = 9;
  Gn.padding.y = 10;
  function rv(t, e) {
    t.touch_screen || ((fp.text = "@union engine"), V(t, fp, e));
    let r = t.renderer,
      o = r.primitive_usage,
      n = r.index_usage;
    (Gn.text = `simd: [${Xb()}]`),
      (Gn.text += ` buffer: [p: ${(o * 100).toFixed(1)}% | i: ${(
        n * 100
      ).toFixed(1)}%]`),
      (Gn.text += ` focus: [${t.focus}]`),
      (Gn.text += ` hover: [${t.hover}]`),
      (Gn.text += ` hover layer: [${t.hover_layer}]`),
      (Gn.text += ` active: [${t.active}]`),
      V(t, Gn, e);
  }
  var hp;
  function j_(t, e, r, o = 0, n = 0) {
    let a = C.CurrentDevice().encoder;
    t.renderer.set_screen_pass(r, "ui_texture");
    let s = ge("copy");
    a.set_pipeline(s),
      hp === void 0
        ? (hp = ce({
            primitive: He("screen_triangle"),
            uniforms: { color_map: e },
          }))
        : (hp.uniforms.color_map = e),
      a.set_draw(hp),
      a.set_pass(),
      Vt(t.buffer.layers[0], r, o, n);
  }
  var bp = new Map();
  function J1() {
    return bp;
  }
  function cI() {
    let t = {};
    (t.white = K("e0e0e0")),
      (t.text_primary = K("e0e0e0")),
      (t.outline = K("636569")),
      (t.outline.line_width = 2),
      (t.auxiliary = K("636569")),
      (t.background = K("21262b")),
      (t.background_float = K("656c75aa", "757c85aa", "7a828aaa")),
      (t.background_overlay = K("212329dd")),
      (t.input = K("2a2f37", "30373f", "353c45", "e0e0e0aa")),
      (t.number_input = K("2a2f37", "30373f", "353c45", "e0e0e0aa")),
      (t.input_line = K("2a2f3766", "2a2f37aa", "353c45aa", "e0e0e0aa")),
      (t.axis_input_x = K("2a2f37", "30373f", "353c45", "f1434a")),
      (t.axis_input_y = K("2a2f37", "30373f", "353c45", "4cbd62")),
      (t.axis_input_z = K("2a2f37", "30373f", "353c45", "4d9cf9")),
      (t.transform_x = K("f1434a", "30373f", "353c45", "f1434a")),
      (t.transform_y = K("4cbd62", "30373f", "353c45", "4cbd62")),
      (t.transform_z = K("4d9cc9", "30373f", "353c45", "4d9cc9")),
      (t.panel_layer_0 = K("333a42", "373f46", "454c55")),
      (t.panel_layer_1 = K("40474f", "454c55", "656c75", "e0e0e0aa")),
      (t.panel_layer_2 = K("333a42", "373e47", "40474f")),
      (t.panel_layer_3 = K("495059", "50575f", "656c75")),
      (t.panel_layer_4 = K("4f555f", "555c64", "656c75")),
      (t.button_state = K("232a3266", "30373f66", "353c4566")),
      (t.button_active = K("4d9cc966", "4d9cc9aa", "4d9cc9cc")),
      (t.button_file = K("0000", "51535f33", "61636f33")),
      (t.button_primary = K("41434a", "45474f", "51535a")),
      (t.button_icon = K("0000", "616365", "919395")),
      (t.button_breadcrumb = K("51535555")),
      (t.button_link = K("49505966", "50555f99", "656c75aa")),
      (t.menu_tab = K("0000", "42464d55", "52565d99")),
      (t.menu_button = K("0000", "919395aa", "919395aa")),
      (t.tab = K("30373f", "353c45", "656c75")),
      (t.tab_inactivated = K("232a32", "30373f", "353c45")),
      (t.toggle = K("2a2f37", "30373f", "656c75", "e0e0e0aa")),
      (t.scroll_bar = K("e0e0e066", "e0e0e0aa")),
      (t.node = K("3a414a", "454c55", "404853", "e5ac65")),
      (t.shadow = K("00000033")),
      (t.shadow.feather = 10),
      (t.line = K("e0e0e0aa", "e0e0e0aa")),
      (t.line.line_width = 1.5),
      (t.keyboard = K("2a2f37aa")),
      (t.folder = K("548ac2")),
      (t.error = K("f1434aaa", "f1434acc", "f1434a")),
      (t.warning = K("f1c14aaa", "f1c14acc", "f1c14a")),
      (t.success = K("43c14aaa", "43c14acc", "43c14a")),
      (t.name = "union runtime theme"),
      (t.author = "union");
    let e = ["theme/dark_blue.json", "theme/dark.json", "theme/light.json"];
    return (
      Promise.all(e.map(st)).then((r) => {
        for (let a of r) {
          let s = y3(JSON.parse(a));
          bp.set(s.name, s);
        }
        let o = localStorage.getItem(U_) ?? "union dark",
          n = bp.get(o) ?? bp.get("union dark"),
          i = h(F);
        kh(i.theme, n, i.theme, 1),
          console.log("<UITheme> change to dark theme");
      }),
      t
    );
  }
  function kh(t, e, r, o) {
    for (let n in t) {
      let i = t[n];
      Xe(i) || Zg(i, e[n], r[n], o);
    }
  }
  function y3(t) {
    let e = {};
    for (let r in t) {
      let o = t[r];
      Xe(o) ? (e[r] = o) : (e[r] = Yg(o));
    }
    return e;
  }
  var gu = class {
      constructor(e = !1) {
        this.activated = e;
        this.mode = 0;
        this._value = !1;
        this.slider = 0;
        this.scale = 1;
        this.radiuses = new M();
        (this.id = Ie(this)), (this.radius = 4);
      }
      set value(e) {
        this._value = e;
      }
      get value() {
        return this._value;
      }
      set radius(e) {
        this.radiuses.elements.fill(e);
      }
    },
    yp = new re("off");
  yp.alignment = 9;
  yp.padding_right = 10;
  var gp = new re("on");
  gp.alignment = 33;
  gp.padding_left = 9;
  var xp = new re("false");
  xp.alignment = 9;
  xp.padding_right = 10;
  var wp = new re("true");
  wp.alignment = 33;
  wp.padding_left = 9;
  var g3 = 0.5,
    nb = new M();
  function fv(t, e, r, o, n = 0, i = 0) {
    let a = t.buffer.layers[n],
      s = e.id,
      c = S(de),
      _ = S(x);
    c.copy(r);
    let l = t.ishovering(o),
      u = !1,
      d = e.value,
      p = e.scale * 0.9;
    l && t.next_hover_layer_index <= n && (t.next_hover = s),
      l && t.active === -1 && c.color.copy(r.hover_color),
      t.hover === s && t.left_mouse_press && t.set_active(s),
      t.active === s &&
        t.left_mouse_release &&
        (t.clear_active(), (u = !0), (e.value = !e.value)),
      nb.copy(e.radiuses).mul(e.scale),
      ue(a, c, o, nb, i);
    let m = e.slider;
    e.slider = Ue(m, d ? 1 : 0, g3);
    let f = o.w * 0.6;
    return (
      _.copy(o),
      _.shrink(2),
      (_.w = f - 4),
      (_.x += m * o.w * 0.4),
      e.mode === 0
        ? ((gp.scale = p), (yp.scale = p), V(t, yp, o, n, i), V(t, gp, o, n, i))
        : ((wp.scale = p),
          (xp.scale = p),
          V(t, xp, o, n, i),
          V(t, wp, o, n, i)),
      c.color.copy(r.active_color),
      ue(a, c, _, nb, i),
      R(c),
      R(_),
      u
    );
  }
  var wo = 2048,
    ve = 128,
    ae = new x(),
    z = ve / wo;
  function ec(t, e, r = 0) {
    ae.set(0, 0, z, z), je(t, e, ae, r);
  }
  function Fa(t, e, r = 0) {
    ae.set(z, 0, z, z), je(t, e, ae, r);
  }
  function Xn(t, e, r = 0) {
    ae.set(z * 2, 0, z, z), je(t, e, ae, r);
  }
  function tc(t, e, r = 0) {
    ae.set(z * 3, 0, z, z), je(t, e, ae, r);
  }
  function yl(t, e, r = 0) {
    ae.set(z * 4, 0, z, z), je(t, e, ae, r);
  }
  function gl(t, e, r = 0) {
    ae.set(z * 5, 0, z, z), je(t, e, ae, r);
  }
  function z1(t, e, r = 0) {
    ae.set(z * 7, 0, z, z), je(t, e, ae, r);
  }
  function k1(t, e, r = 0) {
    ae.set(z * 10, 0, z, z), je(t, e, ae, r);
  }
  function P1(t, e, r = 0) {
    ae.set(z * 11, 0, z, z), je(t, e, ae, r);
  }
  function i0(t, e, r = 0) {
    ae.set(z * 12, 0, z, z), je(t, e, ae, r);
  }
  function a0(t, e, r = 0) {
    ae.set(z * 13, 0, z, z), je(t, e, ae, r);
  }
  function s0(t, e, r = 0) {
    ae.set(z * 14, 0, z, z), je(t, e, ae, r);
  }
  function c0(t, e, r = 0) {
    ae.set(z * 3, z, z, z), je(t, e, ae, r);
  }
  function _0(t, e, r = 0) {
    ae.set(z * 4, z, z, z), je(t, e, ae, r);
  }
  function Ya(t, e, r = 0) {
    ae.set(z * 5, z, z, z), je(t, e, ae, r);
  }
  function Zl(t, e, r = 0) {
    ae.set(z * 6, z, z, z), je(t, e, ae, r);
  }
  function Yl(t, e, r = 0) {
    ae.set(z * 7, z, z, z), je(t, e, ae, r);
  }
  function ff(t, e, r = 0) {
    ae.set(z * 8, z, z, z), je(t, e, ae, r);
  }
  function l0(t, e, r = 0) {
    ae.set(z * 9, z, z, z), je(t, e, ae, r);
  }
  function au(t, e, r = 0) {
    ae.set(z * 10, z, z, z), je(t, e, ae, r);
  }
  function su(t, e, r = 0) {
    ae.set(z * 11, z, z, z), je(t, e, ae, r);
  }
  function Wg(t, e, r = 0) {
    ae.set(z * 12, z, z, z), je(t, e, ae, r);
  }
  function vv(t, e, r = 0) {
    ae.set(z * 14, z, z, z), je(t, e, ae, r);
  }
  function Mw(t, e, r = 0) {
    ae.set(z * 15, z, z, z), je(t, e, ae, r);
  }
  function N1(t, e, r = 0) {
    ae.set(0, z * 2, z, z), je(t, e, ae, r);
  }
  function u0(t, e, r = 0) {
    ae.set(z, z * 2, z, z), je(t, e, ae, r);
  }
  function p0(t, e, r = 0) {
    ae.set(z * 2, z * 2, z, z), je(t, e, ae, r);
  }
  function B1(t, e, r = 0) {
    ae.set(z * 3, z * 2, z, z), je(t, e, ae, r);
  }
  var Fs = 2048,
    ib = class {
      constructor(e) {
        this.device = e;
        this.window_size = new b();
        this.atlas_packer = new F_(Fs, Fs, 4);
        (this.buffer = new Qa()),
          this.window_size.set(e.screen_width, e.screen_height, e.pixel_ratio),
          B.on(oe.Resize, () => {
            this.window_size.set(
              e.screen_width,
              e.screen_height,
              e.pixel_ratio,
            ),
              this.resize_screen();
          });
      }
      get index_usage() {
        return this.buffer.index_usage;
      }
      get primitive_usage() {
        return this.buffer.primitive_usage;
      }
      async init() {
        await this.buffer.alloc();
        let e = C.CurrentDevice();
        (this.atlas_texture = Ne({
          name: "atlas texture",
          width: Fs,
          height: Fs,
          internal_format: 32856,
          min_filter: 9729,
          mag_filter: 9729,
          wrap_s: 10497,
          wrap_t: 33648,
        })),
          (this.atlas_pass = pr({
            name: "atlas pass",
            width: Fs,
            height: Fs,
            color_targets: [{ texture: this.atlas_texture }],
            color_load_action: 0,
            depth_load_action: 0,
          })),
          (this.atlas_clear_action = {
            type: 1,
            clear_color: new H().set(0.1, 0.1, 0.1, 0),
            clear_depth: 1,
          }),
          e.encoder.set_pass(this.atlas_pass, "clear atlas pass"),
          e.encoder.clear(this.atlas_clear_action),
          e.encoder.set_pass(),
          (this.icon_texture = Ne({
            name: "icon texture",
            width: wo,
            height: wo,
            internal_format: 32856,
          })),
          (this.icon_pass = pr({
            name: "icon pass",
            width: wo,
            height: wo,
            color_targets: [{ texture: this.icon_texture }],
          }));
        let r = {
          name: "ui pipeline",
          vertex_shader: ie("shader/editor/ui.vert"),
          fragment_shader: ie("shader/editor/ui.frag"),
          uniforms: [
            { name: "window_size", type: 3 },
            { name: "icon_texture", type: 10 },
            { name: "font_texture", type: 10 },
            { name: "code_font_texture", type: 10 },
            { name: "screen_texture", type: 10 },
            { name: "atlas_texture", type: 10 },
            { name: "entity_texture", type: 10 },
            { name: "primitive_buffer", type: 10 },
            { name: "time", type: 1 },
          ],
          blend: { enabled: !0 },
          cull_mode: 0,
          depth_compare_func: 519,
        };
        this.pipeline = Me(r);
        let o = {
            attributes: [
              {
                name: "vertex_id",
                buffer: this.buffer.index_data,
                stride: 1,
                dynamic: !0,
                slot: 0,
              },
            ],
          },
          n = await ab(`font/${zr}.json`),
          i = await ab(`font/${Gi}.json`);
        (this.draw = ce({
          primitive: o,
          uniforms: {
            window_size: this.window_size,
            primitive_buffer: this.buffer.primitive_texture,
            font_texture: n.texture,
            code_font_texture: i.texture,
            screen_texture: this.screen_texture,
            atlas_texture: this.atlas_texture,
            entity_texture: this.entity_texture,
          },
        })),
          (this.screen_clear_action = {
            type: 7,
            clear_color: new H(0.1, 0.1, 0.1, 1),
            clear_depth: 1,
          }),
          (this.entity_clear_action = {
            type: 7,
            clear_color: new H(0, 0, 0, 0),
            clear_depth: 1,
          }),
          this.resize_screen();
      }
      clear_screen_texture() {
        let e = this.device.encoder;
        this.screen_pass &&
          (e.set_pass(this.screen_pass, "clear screen pass"),
          e.clear(this.screen_clear_action));
      }
      render() {
        if (this.buffer.index_offset <= 0) return;
        this.buffer.update(),
          (this.draw.attribute_map.vertex_id.update_length =
            this.buffer.last_index_offset),
          (this.draw.uniforms.max_primitive_offset =
            this.buffer.last_primitive_offset),
          (this.draw.range.count = this.buffer.last_index_offset);
        let e = this.device.encoder;
        e.set_pipeline(this.pipeline),
          this.draw && h_(this.draw),
          e.set_draw(this.draw, void 0, "render ui"),
          this.clear_screen_texture();
      }
      set_screen_pass(e, r) {
        let o = C.CurrentDevice(),
          n = o.encoder,
          i = o.pixel_ratio;
        n.set_pass(this.screen_pass, r),
          n.set_viewport(e.x * i, o.height - (e.y + e.h) * i, e.w * i, e.h * i);
      }
      set_entity_pass(e, r) {
        let o = C.CurrentDevice(),
          n = o.encoder;
        n.set_pass(this.entity_pass, r),
          n.set_viewport(e.x, o.screen_height - (e.y + e.h), e.w, e.h);
      }
      resize_screen() {
        zo(this.screen_texture),
          Lr(this.screen_pass),
          zo(this.entity_texture),
          Lr(this.entity_pass),
          (this.entity_texture = Ne({
            name: "entity texture",
            width: this.device.screen_width,
            height: this.device.screen_height,
            internal_format: 33326,
            format: 6403,
            data_type: 5126,
            min_filter: 9729,
            mag_filter: 9729,
            premultiply_alpha: !1,
          })),
          (this.entity_pass = pr({
            name: "entity pass",
            width: this.device.screen_width,
            height: this.device.screen_height,
            color_targets: [{ texture: this.entity_texture }],
            color_load_action: 1,
            depth_load_action: 1,
            clear_color: this.entity_pass?.clear_color,
          })),
          (this.screen_texture = Ne({
            name: "screen texture",
            width: this.device.width,
            height: this.device.height,
            internal_format: 35898,
            min_filter: 9729,
            mag_filter: 9729,
            wrap_s: 33071,
            wrap_t: 33071,
            premultiply_alpha: !1,
          })),
          (this.screen_pass = pr({
            name: "screen pass",
            width: this.device.width,
            height: this.device.height,
            color_targets: [{ texture: this.screen_texture }],
            color_load_action: 0,
            depth_load_action: 0,
            clear_color: this.screen_pass?.clear_color,
          })),
          this.draw &&
            ((this.draw.uniforms.screen_texture = this.screen_texture),
            (this.draw.uniforms.entity_texture = this.entity_texture));
      }
      dispose() {
        zo(this.atlas_texture),
          Lr(this.atlas_pass),
          zo(this.icon_texture),
          Lr(this.icon_pass),
          this.screen_texture &&
            (zo(this.screen_texture),
            Lr(this.screen_pass),
            zo(this.entity_texture),
            Lr(this.entity_pass));
      }
    },
    vp;
  async function hu(t) {
    return (vp = new ib(t)), await vp.init(), vp;
  }
  function Qt() {
    return vp;
  }
  var cb,
    BI,
    WI,
    OI,
    HI,
    _b,
    Ip,
    Tp,
    db,
    mb,
    fb,
    lb,
    VI,
    jI,
    Vc,
    XI,
    $I,
    hb,
    qI,
    QI,
    ZI,
    YI,
    JI,
    KI,
    eT,
    tT,
    bb,
    rT,
    oT,
    yb,
    nT,
    iT,
    aT,
    T3,
    sT,
    R3,
    S3,
    cT,
    Rp,
    _T,
    jc,
    lT,
    uT,
    pT,
    ub,
    pb,
    Xc = {};
  function ie(t) {
    return Xc[t];
  }
  function hr(t) {
    return ie(`font/${t}.json`);
  }
  async function Re(t) {
    return new Promise((e) => {
      st(t).then((r) => {
        (Xc[t] = r), e(r);
      });
    });
  }
  async function ab(t) {
    return new Promise((e) => {
      js.load(t).then((r) => {
        let o = Qt().buffer.write_font(r),
          n = new wa(o);
        (Xc[t] = n), e(n);
      });
    });
  }
  async function ln(t) {
    return new Promise((e) => {
      h(mr)
        .load(t)
        .then((r) => {
          let o = r.primitive;
          (Xc[t] = o), e(o);
        });
    });
  }
  async function sb(t) {
    return new Promise((e) => {
      h(mr)
        .load(t)
        .then((r) => {
          let o = Ne({ source: r });
          (Xc[t] = o), e(o);
        });
    });
  }
  var zr = "Lato-Regular",
    Gi = "FiraCode-Medium";
  async function F3() {
    let t = [];
    return (
      t.push(Re("shader/library/pbr.glsl")),
      t.push(Re("shader/library/common.glsl")),
      t.push(Re("shader/library/lighting.glsl")),
      t.push(Re("shader/library/cascade_shadow.glsl")),
      t.push(Re("shader/library/dither.glsl")),
      t.push(Re("shader/editor/ui.vert")),
      t.push(Re("shader/editor/ui.frag")),
      t.push(Re("shader/editor/ui_copy.frag")),
      t.push(Re("shader/editor/pattern.frag")),
      t.push(Re("shader/editor/gizmo.glsl")),
      t.push(Re("shader/editor/model_icon.glsl")),
      t.push(Re("shader/editor/preview.glsl")),
      t.push(Re("shader/editor/entity_id.frag")),
      t.push(Re("shader/editor/outline.glsl")),
      t.push(Re("shader/editor/helper.glsl")),
      t.push(Re("shader/editor/dot.frag")),
      t.push(Re("shader/editor/hue.frag")),
      t.push(Re("shader/editor/color_panel.frag")),
      t.push(Re("shader/editor/debug.glsl")),
      t.push(Re("shader/builtin/clear.glsl")),
      t.push(Re("shader/mesh.vert")),
      t.push(Re("shader/mesh.frag")),
      t.push(Re("shader/depth.glsl")),
      t.push(Re("shader/csm.vert")),
      t.push(Re("shader/csm.frag")),
      t.push(Re("shader/base.vert")),
      t.push(Re("shader/copy.frag")),
      t.push(Re("shader/standard/lit.vert")),
      t.push(Re("shader/standard/lit.frag")),
      t.push(Re("shader/standard/unlit.vert")),
      t.push(Re("shader/gpu_scene/world.vert")),
      t.push(Re("shader/gpu_scene/world.frag")),
      t.push(Re("shader/gpu_scene/visibility.glsl")),
      t.push(Re("shader/gpu_scene/visibility_clear.glsl")),
      t.push(Re("shader/gpu_scene/shading.vert")),
      t.push(Re("shader/gpu_scene/shading.frag")),
      t.push(ln("model/editor/arrow.drc")),
      t.push(ln("model/editor/orbit.drc")),
      t.push(ln("model/editor/camera.drc")),
      t.push(ln("model/editor/atmosphere.drc")),
      t.push(ln("model/editor/bone.drc")),
      t.push(ln("model/builtin/box.drc")),
      t.push(ln("model/builtin/sphere.drc")),
      t.push(ln("model/builtin/cylinder.drc")),
      t.push(ln("model/builtin/cone.drc")),
      t.push(ln("model/builtin/torus.drc")),
      t.push(sb("image/outer.png")),
      t.push(sb("image/inner.png")),
      t.push(sb("image/union.png")),
      Promise.all(t)
    );
  }
  async function Zx() {
    await F3(),
      (_b = vy()),
      (cb = wy()),
      (WI = ie("model/editor/orbit.drc")),
      (BI = ie("model/editor/arrow.drc")),
      (OI = ie("model/editor/camera.drc")),
      (HI = ie("model/editor/atmosphere.drc")),
      (lb = ie("model/editor/bone.drc")),
      (Ip = ie("model/builtin/box.drc")),
      (Tp = ie("model/builtin/sphere.drc")),
      (db = ie("model/builtin/cylinder.drc")),
      (mb = ie("model/builtin/cone.drc")),
      (fb = ie("model/builtin/torus.drc")),
      (uT = ie("image/inner.png")),
      (lT = ie("image/outer.png")),
      (pT = ie("image/union.png")),
      (VI = ce({ primitive: Ip, uniforms: {} })),
      (jI = ce({ primitive: Tp, uniforms: {} })),
      (Vc = ce({ primitive: _b, uniforms: {} })),
      (XI = ce({ primitive: cb, uniforms: {} })),
      ($I = ce({
        primitive: lb,
        uniforms: {},
        force_update: new Set(["world_matrix"]),
      })),
      (Rp = Ne({
        width: 1,
        height: 1,
        format: 6408,
        data_type: 5121,
        internal_format: 32856,
        source: new Uint8Array([255, 255, 255, 255]),
        min_filter: 9728,
        mag_filter: 9728,
      })),
      (_T = Ne({
        width: 1,
        height: 1,
        format: 6408,
        data_type: 5121,
        internal_format: 32856,
        source: new Uint8Array([0, 0, 0, 0]),
        min_filter: 9728,
        mag_filter: 9728,
      })),
      (cT = Me({
        name: "clear pipeline",
        combined_shader: ie("shader/builtin/clear.glsl"),
        uniforms: [
          { name: "clear_color", type: 4, default_value: new M(0, 0, 0, 1) },
        ],
        depth_compare_func: 515,
      })),
      (oT = Me({
        name: "pattern pipeline",
        vertex_shader: ie("shader/base.vert"),
        fragment_shader: ie("shader/editor/pattern.frag"),
        uniforms: [
          { name: "uv_transform", type: 4, default_value: new M(0, 0, 1, 1) },
        ],
        depth_compare_func: 519,
      })),
      (yb = Me({
        name: "hue pipeline",
        defines: ["HUE"],
        vertex_shader: ie("shader/base.vert"),
        fragment_shader: ie("shader/editor/hue.frag"),
        uniforms: [
          { name: "uv_transform", type: 4, default_value: new M(0, 0, 1, 1) },
        ],
        depth_compare_func: 519,
      })),
      (nT = Me({
        name: "transparency pipeline",
        vertex_shader: ie("shader/base.vert"),
        fragment_shader: ie("shader/editor/hue.frag"),
        depth_compare_func: 519,
      })),
      (iT = Me({
        name: "color panel pipeline",
        vertex_shader: ie("shader/base.vert"),
        fragment_shader: ie("shader/editor/color_panel.frag"),
        uniforms: [
          { name: "hue", type: 1, default_value: 0 },
          { name: "uv_transform", type: 4, default_value: new M(0, 0, 1, 1) },
        ],
        depth_compare_func: 519,
      })),
      A3(),
      ga("lighting", ie("shader/library/lighting.glsl")),
      ga("common", ie("shader/library/common.glsl")),
      ga("pbr", ie("shader/library/pbr.glsl")),
      ga("cascade_shadow", ie("shader/library/cascade_shadow.glsl")),
      ga("dither", ie("shader/library/dither.glsl")),
      (hb = Me({
        name: "default pipeline",
        vertex_shader: ie("shader/mesh.vert"),
        fragment_shader: ie("shader/mesh.frag"),
        uniforms: [
          { name: "world_matrix", type: 9, default_value: new L() },
          { name: "view_matrix", type: 9 },
          { name: "projection_matrix", type: 9 },
          {
            name: "base_color",
            type: 7,
            editable: !0,
            default_value: new H(1, 1, 1, 1),
          },
          { name: "time", type: 1 },
          { name: "color_map", type: 10, editable: !0 },
          { name: "normal_map", type: 10, editable: !0 },
          { name: "pbr_map", type: 10, editable: !0 },
        ],
        cull_mode: 1029,
      })),
      (qI = Me({
        name: "entity id pipeline",
        vertex_shader: ie("shader/mesh.vert"),
        fragment_shader: ie("shader/editor/entity_id.frag"),
        uniforms: [
          { name: "world_matrix", type: 9 },
          { name: "view_matrix", type: 9 },
          { name: "projection_matrix", type: 9 },
          { name: "entity", type: 1 },
        ],
        cull_mode: 0,
      })),
      (ZI = Me({
        name: "copy pipeline",
        vertex_shader: ie("shader/base.vert"),
        fragment_shader: ie("shader/copy.frag"),
        uniforms: [
          { name: "color_map", type: 10 },
          { name: "uv_transform", type: 4, default_value: new M(0, 0, 1, 1) },
        ],
        cull_mode: 0,
        depth_compare_func: 519,
        blend: { enabled: !0 },
      })),
      (YI = Me({
        name: "ui copy pipeline",
        vertex_shader: ie("shader/base.vert"),
        fragment_shader: ie("shader/editor/ui_copy.frag"),
        uniforms: [
          { name: "color_map", type: 10 },
          { name: "uv_transform", type: 4, default_value: new M(0, 0, 1, 1) },
        ],
        cull_mode: 0,
        depth_compare_func: 519,
        blend: { enabled: !0 },
      })),
      (QI = Me({
        name: "outline pipeline",
        combined_shader: ie("shader/editor/outline.glsl"),
        uniforms: [
          { name: "entity", type: 1 },
          { name: "map", type: 10 },
          { name: "uv_transform", type: 4 },
        ],
        blend: { enabled: !1 },
        depth_write: !1,
        depth_compare_func: 519,
      })),
      (KI = Me({
        name: "gizmo pipeline",
        combined_shader: ie("shader/editor/gizmo.glsl"),
        uniforms: [
          { name: "world_matrix", type: 9 },
          { name: "view_matrix", type: 9 },
          { name: "projection_matrix", type: 9 },
          { name: "base_color", type: 7 },
        ],
        blend: { enabled: !1 },
        cull_mode: 0,
        depth_compare_func: 0,
      })),
      (eT = Me({
        name: "3d icon pipeline",
        combined_shader: ie("shader/editor/model_icon.glsl"),
        uniforms: [
          { name: "world_matrix", type: 9 },
          { name: "view_matrix", type: 9 },
          { name: "projection_matrix", type: 9 },
          { name: "base_color", type: 7, editable: !0 },
        ],
      })),
      (JI = Me({
        name: "preview pipeline",
        combined_shader: ie("shader/editor/preview.glsl"),
        uniforms: [
          { name: "world_matrix", type: 9 },
          { name: "view_matrix", type: 9 },
          { name: "projection_matrix", type: 9 },
          { name: "base_color", type: 7, editable: !0 },
        ],
      })),
      (bb = Me({
        name: "model with csm pipeline",
        vertex_shader: ie("shader/csm.vert"),
        fragment_shader: ie("shader/csm.frag"),
        uniforms: [
          { name: "world_matrix", type: 9 },
          { name: "view_matrix", type: 9 },
          { name: "normal_matrix", type: 8 },
          { name: "projection_matrix", type: 9 },
          { name: "base_color", type: 7, editable: !0 },
          { name: "time", type: 1 },
          { name: "cascades", type: 2 },
          { name: "camera_position", type: 3 },
          { name: "base_color_map", type: 10, editable: !0, default_value: jc },
          { name: "normal_map", type: 10, editable: !0 },
          { name: "metallic_roughness_map", type: 10, editable: !0 },
          { name: "env_map", type: 11, default_value: Rp },
          { name: "shadow_matrices", type: 9 },
          { name: "shadow_map", type: 10 },
          { name: "cascade_constant.shadow_near", type: 1, default_value: 1 },
          { name: "cascade_constant.shadow_far", type: 1 },
          { name: "cascade_constant.shadow_radius", type: 1, default_value: 2 },
          { name: "cascade_constant.shadow_map_size", type: 2 },
          {
            name: "cascade_constant.shadow_bias",
            type: 1,
            default_value: 0.001,
          },
          {
            name: "cascade_constant.shadow_normal_bias",
            type: 1,
            default_value: 1e-6,
          },
          { name: "atmosphere_direction", type: 3 },
        ],
      })),
      (tT = Me({
        name: "csm depth pipeline",
        combined_shader: ie("shader/depth.glsl"),
        uniforms: [
          { name: "world_matrix", type: 9 },
          { name: "view_matrix", type: 9 },
          { name: "projection_matrix", type: 9 },
          { name: "log_depth_fc", type: 1 },
        ],
      })),
      (rT = Me({
        name: "helper model pipeline",
        combined_shader: ie("shader/editor/helper.glsl"),
        uniforms: [
          { name: "world_matrix", type: 9 },
          { name: "view_matrix", type: 9 },
          { name: "projection_matrix", type: 9 },
          { name: "inverse_projection_matrix", type: 9 },
          { name: "base_color", type: 7 },
        ],
      })),
      (aT = Me({
        name: "dot pipeline",
        vertex_shader: ie("shader/base.vert"),
        fragment_shader: ie("shader/editor/dot.frag"),
        uniforms: [
          { name: "scale", type: 1 },
          { name: "offset", type: 2 },
          { name: "uv_transform", type: 4, default_value: new M(0, 0, 1, 1) },
          { name: "window_size", type: 3 },
          { name: "background_color", type: 4 },
          { name: "dot_color", type: 4 },
        ],
      })),
      (sT = Me({
        name: "debug pipeline",
        combined_shader: ie("shader/editor/debug.glsl"),
        uniforms: [
          { name: "view_matrix", type: 9 },
          { name: "projection_matrix", type: 9 },
        ],
      }));
  }
  function ge(t) {
    switch (t) {
      case "csm":
        return bb;
      case "default":
        return hb;
      case "entity":
        return qI;
      case "outline":
        return QI;
      case "gizmo":
        return KI;
      case "model_icon":
        return eT;
      case "preview":
        return JI;
      case "depth":
        return tT;
      case "helper":
        return rT;
      case "pattern":
        return oT;
      case "hue":
        return yb;
      case "color_panel":
        return iT;
      case "copy":
        return ZI;
      case "ui_copy":
        return YI;
      case "dot":
        return aT;
      case "debug":
        return sT;
      case "visibility":
        return R3;
      case "visibility_clear":
        return S3;
      case "shading":
        return T3;
      case "clear":
        return cT;
      default:
        throw `unsupported material ${t}`;
    }
  }
  function We(t) {
    switch (t) {
      case "white":
        return Rp;
      case "black":
        return _T;
      case "outer":
        return lT;
      case "inner":
        return uT;
      case "default":
      case "default_map":
        return jc;
      case "union":
        return pT;
      case "hue":
        return ub;
      case "transparency":
        return pb;
      default:
        throw `unsupported texture ${t}`;
    }
  }
  function He(t) {
    switch (t) {
      case "arrow":
        return BI;
      case "box":
        return Ip;
      case "screen_triangle":
        return _b;
      case "grid":
        return cb;
      case "orbit":
        return WI;
      case "camera":
        return OI;
      case "atmosphere":
        return HI;
      case "sphere":
        return Tp;
      case "cylinder":
        return db;
      case "cone":
        return mb;
      case "torus":
        return fb;
      default:
        throw `unsupported mesh ${t}`;
    }
  }
  function Ro(t) {
    switch (t) {
      case "box":
        return VI;
      case "screen":
        return Vc;
      case "sphere":
        return jI;
      case "grid":
        return XI;
      case "bone":
        return $I;
      default:
        throw "invalid draw name";
    }
  }
  function kc(t, e) {
    switch (t) {
      case "box.model": {
        let r = ce({ primitive: Ip }),
          o = e;
        o.data.draw = r;
        break;
      }
      case "sphere.model": {
        let r = ce({ primitive: Tp }),
          o = e;
        o.data.draw = r;
        break;
      }
      case "cylinder.model": {
        let r = ce({ primitive: db }),
          o = e;
        o.data.draw = r;
        break;
      }
      case "cone.model": {
        let r = ce({ primitive: mb }),
          o = e;
        o.data.draw = r;
        break;
      }
      case "torus.model": {
        let r = ce({ primitive: fb }),
          o = e;
        o.data.draw = r;
        break;
      }
      case "bone.model": {
        let r = ce({ primitive: lb }),
          o = e;
        o.data.draw = r;
        break;
      }
      case "default.mat": {
        let r = e;
        r.data.pipeline = hb;
        break;
      }
      case "csm.mat": {
        let r = e;
        r.data.pipeline = bb;
        break;
      }
      case "white.tex": {
        let r = e;
        return (r.data.texture = Rp), r;
      }
      case "default.tex": {
        let r = e;
        return (r.data.texture = jc), r;
      }
      default:
        throw `invalid builtin resource name ${t}`;
    }
    return e;
  }
  function A3() {
    let e = C.CurrentDevice().encoder,
      r = 1024;
    jc = Ne({
      width: r,
      height: r,
      format: 6407,
      type: 5121,
      internal_format: 32849,
    });
    let n = pr({ width: r, height: r, color_targets: [{ texture: jc }] });
    e.set_pass(n, "[resource_builtin.ts]");
    let i = ge("pattern");
    e.set_pipeline(i), e.set_draw(Vc), e.set_pass(), Lr(n), k3();
  }
  function k3() {
    let e = C.CurrentDevice().encoder,
      r = {
        width: 256,
        height: 8,
        format: 6407,
        data_type: 5121,
        internal_format: 32849,
      };
    (ub = Ne(r)), (pb = Ne(r));
    let o = pr({ width: 256, height: 8, color_targets: [{ texture: ub }] }),
      n = pr({ width: 256, height: 8, color_targets: [{ texture: pb }] });
    e.set_pass(o),
      e.set_pipeline(yb),
      e.set_draw(Vc),
      e.set_pass(n),
      e.set_pipeline(nT),
      e.set_draw(Vc),
      e.set_pass(),
      Lr(o),
      Lr(n);
  }
  function dT() {
    return {};
  }
  function mT(t) {
    let e = {};
    return t && (e.clip = t.data.clip), e;
  }
  async function fT(t, e) {
    return {};
  }
  function gb() {
    let t = {};
    return (t.graph = new qn()), (t.source = ""), t;
  }
  function hT(t) {
    let e = t.data,
      r = {};
    return (
      t && (e.graph && (r.graph_data = Ea(e.graph)), (r.source = e.source)), r
    );
  }
  async function bT(t, e) {
    let r = t.data;
    return e
      ? (e.graph_data && (r.graph = Da(e.graph_data)),
        (r.source = e.source ?? ""),
        r)
      : gb();
  }
  function yT(t) {
    let { uuid: e, guid: r, type: o } = t,
      n = { guid: r, uuid: e, type: o },
      i = P3(o);
    return i && (n.data = i(t)), n;
  }
  var Un;
  function Go(t, e, r, o) {
    Un || (Un = new Map());
    let n = { serializer: e, deserializer: r, initializer: o };
    Un.set(t, n);
  }
  function P3(t) {
    if (Un.has(t)) return Un.get(t).serializer;
  }
  function gT(t) {
    if (Un.has(t)) return Un.get(t).deserializer;
  }
  function xT(t) {
    if (Un.has(t)) return Un.get(t).initializer;
  }
  function xb() {
    return {};
  }
  function wb(t) {
    return {};
  }
  async function vb(t, e) {
    let r = h(Z);
    if (t.file) return r.load_resource_from_fnode(t.file);
  }
  Go(1, wb, vb, xb);
  function wT(t) {
    if (!t) return { code: "" };
    let e = {};
    return (e.code = t.data.code ?? ""), e;
  }
  async function vT(t, e) {
    return e
      ? (e.code ? Li(e.code, t) : console.warn(`empty script source ${t.uuid}`),
        e)
      : { code: "" };
  }
  function IT(t) {
    if (!t) return;
    let e = {};
    return (
      (e.name = t.name),
      (e.vertex_shader = t.vertex_shader),
      (e.fragment_shader = t.fragment_shader),
      (e.uniforms = t.uniforms.map(E3)),
      e
    );
  }
  function TT(t) {
    if (!t) return;
    let e = {};
    return (
      (e.vertex_shader = t.vertex_shader),
      (e.fragment_shader = t.fragment_shader),
      t.uniforms && (e.uniforms = t.uniforms.map(D3)),
      t.cull_mode !== void 0 && (e.blend = t.blend),
      t.depth_compare_func !== void 0 &&
        (e.depth_compare_func = t.depth_compare_func),
      t.depth_write !== void 0 && (e.depth_write = t.depth_write),
      t.blend !== void 0 && (e.blend = t.blend),
      t.vertex_order !== void 0 && (e.vertex_order = t.vertex_order),
      Me(e)
    );
  }
  function E3(t) {
    let e = {};
    if (
      ((e.name = t.name),
      (e.type = t.type),
      t.slot !== void 0 && (e.slot = t.slot),
      t.editable !== void 0 && (e.editable = t.editable),
      t.buffer && (e.buffer = Array.from(t.buffer)),
      t.default_value)
    )
      switch (t.type) {
        case 1:
        case 0:
        case 6:
        case 5:
          e.default_value = t.default_value;
          break;
        case 2:
        case 3:
        case 4:
        case 7:
        case 8:
        case 9:
          e.default_value = Array.from(t.default_value.elements);
          break;
        case 10:
        case 12:
        case 11:
        case 12:
          e.default_value = t.default_value.uuid;
          break;
        case 14:
          break;
        default:
          break;
      }
    return e;
  }
  function D3(t) {
    let e = {};
    if (
      ((e.name = t.name),
      (e.type = t.type),
      t.slot && (e.slot = t.slot),
      t.editable && (e.editable = t.editable),
      t.buffer && (e.buffer = new Float32Array(t.buffer)),
      t.default_value !== void 0)
    )
      switch (t.type) {
        case 1:
        case 0:
        case 6:
        case 5:
          e.default_value = t.default_value;
          break;
        case 2:
          e.default_value = new T(...t.default_value);
          break;
        case 3:
          e.default_value = new b(...t.default_value);
          break;
        case 4:
          e.default_value = new M(...t.default_value);
          break;
        case 7:
          e.default_value = new H(...t.default_value);
          break;
        case 8:
          (e.default_value = new Gr()),
            e.default_value.elements.set(t.default_value);
          break;
        case 9:
          (e.default_value = new L()),
            e.default_value.elements.set(t.default_value);
          break;
        default:
          break;
      }
    return e;
  }
  function Ib() {
    let t = {};
    return (t.graph = new qn()), t;
  }
  function RT(t) {
    let e = t.data,
      r = {};
    return (
      t &&
        (e.graph && (r.graph_data = Ea(e.graph)),
        e.pipeline && (r.pipeline_data = IT(e.pipeline))),
      r
    );
  }
  async function ST(t, e, r) {
    let o = t.data;
    return e
      ? (e.graph_data && (o.graph = Da(e.graph_data)),
        e.pipeline_data &&
          r.push(() => {
            o.pipeline = TT(e.pipeline_data);
          }),
        o)
      : Ib();
  }
  function FT(t) {
    let e = t.data,
      r = {};
    return e && (r.compressed = e.texture.compressed), r;
  }
  async function AT(t, e) {}
  function kT() {
    let t = {};
    return (t.compressed = !1), t;
  }
  var kt = ((l) => (
    (l[(l.Invalid = 0)] = "Invalid"),
    (l[(l.Model = 1)] = "Model"),
    (l[(l.Material = 2)] = "Material"),
    (l[(l.Script = 3)] = "Script"),
    (l[(l.Bundle = 4)] = "Bundle"),
    (l[(l.Texture = 5)] = "Texture"),
    (l[(l.Shader = 6)] = "Shader"),
    (l[(l.Graph = 7)] = "Graph"),
    (l[(l.AnimationClip = 8)] = "AnimationClip"),
    (l[(l.Skeleton = 9)] = "Skeleton"),
    l
  ))(kt || {});
  function yr(t, e, r) {
    r = r ?? h(J);
    let o = r.get_resource(t);
    if (!(!o || o.type !== e.type)) return o.data;
  }
  function Sp(t, e, r) {
    return (r = r ?? h(J)), r.create_resource_typed(t, e);
  }
  var J = class {
      constructor() {
        this.uuid_to_resource = {};
        this.guid_to_resource = {};
        this.resource_counter = {};
        this.typed_resources = new Map();
        this.typed_resource_changed = new Map();
      }
      async on_register(e) {
        U3(),
          e && (await this.deserialize(e.resource_data)),
          (window.resource = this);
      }
      *query_resource_with_guid(e, r) {
        for (let o in this.uuid_to_resource) {
          let n = this.uuid_to_resource[o];
          n.guid === e && (!r || n.type === r) && (yield n);
        }
      }
      link_resource(e, r) {
        let o = this.get_resource(e);
        return o ? ((o.guid = r), (this.guid_to_resource[r] = o), !0) : !1;
      }
      get_resource_with_guid(e) {
        return this.guid_to_resource[e];
      }
      create_resource(e, r) {
        let o = this.generate_resource_uuid(e);
        if (!r) {
          let i = xT(e);
          r = i ? i() ?? {} : {};
        }
        let n = { type: e, uuid: o, data: r };
        return (this.uuid_to_resource[o] = n), n;
      }
      create_resource_typed(e, r) {
        return this.create_resource(e.type, r);
      }
      get_resource(e) {
        return this.uuid_to_resource[e];
      }
      remove_resource(e) {
        this.get_resource(e) && delete this.uuid_to_resource[e];
      }
      remove_resource_with_guid(e) {
        for (let r in this.uuid_to_resource)
          this.uuid_to_resource[r].guid === e &&
            delete this.uuid_to_resource[r];
      }
      get_typed_resource(e) {
        let r = this.typed_resources.get(e),
          o = this.typed_resource_changed.get(e) !== !0;
        if (
          (r === void 0 &&
            ((o = !0), (r = new Set()), this.typed_resources.set(e, r)),
          o)
        )
          for (let n in this.uuid_to_resource) {
            let i = parseInt(n);
            G3(i) === e && r.add(this.uuid_to_resource[n]);
          }
        return r;
      }
      serialize() {
        let e = { uuid_to_resource: {} };
        for (let r in this.uuid_to_resource) {
          let o = this.uuid_to_resource[r];
          e.uuid_to_resource[r] = yT(o);
        }
        return (
          (e.resource_counter = Object.assign({}, this.resource_counter)), e
        );
      }
      async deserialize(e) {
        (this.uuid_to_resource = {}),
          (this.resource_counter = e.resource_counter);
        let r = h(Z),
          o = [],
          n = [];
        for (let i in e.uuid_to_resource) {
          let { uuid: a, type: s, guid: c, data: _ } = e.uuid_to_resource[i],
            l = { uuid: a, type: s, guid: c, data: {} };
          this.uuid_to_resource[i] = l;
          let u = r.get_node_by_guid(c);
          if (u?.path.startsWith("/builtin/")) kc(u.path, l);
          else {
            let d = gT(s);
            if (d) o.push(d(l, _, n));
            else throw "No deserializer for resource " + a;
          }
        }
        await Promise.all(o);
        for (let i of n) i();
      }
      generate_resource_uuid(e) {
        let r = this.resource_counter[e];
        r === void 0 && (r = 0);
        let o = Number((BigInt(e & 63) << 28n) | BigInt(r));
        return (this.resource_counter[e] = r + 1), o;
      }
    },
    mo = class {
      constructor(e) {
        this.type = e;
      }
    },
    tt = {
      Invalid: new mo(0),
      Model: new mo(1),
      Material: new mo(2),
      Script: new mo(3),
      Texture: new mo(5),
      Shader: new mo(6),
      Graph: new mo(7),
      AnimationClip: new mo(8),
      Bundle: new mo(4),
      Skeleton: new mo(9),
    };
  function G3(t) {
    return Number((BigInt(t) >> 28n) & 0x3fn);
  }
  function Wu(t) {
    switch (t) {
      case 7:
        return "Graph";
      case 2:
        return "Material";
      case 1:
        return "Model";
      case 4:
        return "Bundle";
      case 3:
        return "script";
      case 6:
        return "Shader";
      case 5:
        return "Texture";
      case 8:
        return "Animation";
      case 9:
        return "Skeleton";
      default:
        return "Unknown";
    }
  }
  function U3() {
    Go(6, RT, ST, Ib),
      Go(2, Tw, Rw, Sw),
      Go(7, hT, bT, gb),
      Go(1, wb, vb, xb),
      Go(5, FT, AT, kT),
      Go(3, wT, vT),
      Go(9, Lu, u1),
      Go(8, mT, fT, dT);
  }
  function Tb(t, e) {
    let r = h(Z),
      o = h(J),
      n = Ne(e),
      i = o.create_resource_typed(tt.Texture, { texture: n, compressed: !0 });
    (i.type = 5),
      (i.file = t),
      (i.name = t.name),
      (t.resource_uuid = i.uuid),
      (r.changed = !0);
  }
  function Rb(t, e) {
    let r = e.primitive,
      o = h(Z);
    t.type = "resource";
    let n = Sp(tt.Model);
    (n.data.draw = ce({ primitive: r })),
      (n.file = t),
      (n.type = 1),
      (n.name = t.name),
      (t.resource_uuid = n.uuid),
      (o.changed = !0);
  }
  function Sb(t, e) {}
  function Fp(t, e) {
    let r = h(Z),
      o = h(J),
      n = Ne({ source: e, width: e.width, height: e.height, flip_y: !1 }),
      i = o.create_resource_typed(tt.Texture, { texture: n, compressed: !1 });
    (i.type = 5),
      (i.file = t),
      (i.name = t.name),
      (t.resource_uuid = i.uuid),
      (r.changed = !0);
  }
  function PT(t, e) {
    let r = h(Z);
    t.type = "resource";
    let o = Sp(tt.Model);
    (o.data.draw = ce({ primitive: e })),
      (o.type = 1),
      (t.resource_uuid = o.uuid),
      (r.changed = !0);
  }
  var Ap = class {
      constructor() {
        this.encoder_path = "/basis";
        this.encoder_binary = null;
        this.encoder_pending = null;
        this.worker_source_url = "";
        this._worker_limit = 4;
        this.worker_pool = [];
        this.worker_next_task_id = 1;
      }
      set worker_limit(e) {
        this._worker_limit = e;
      }
      get worker_limit() {
        return this._worker_limit;
      }
      async encode(e, r) {
        let o;
        Xe(e) ? (o = await Tr(e)) : (o = e);
        let n,
          i,
          a = o.byteLength,
          s = this.allocate_worker(a)
            .then(
              (c) => (
                (n = c),
                (i = this.worker_next_task_id++),
                new Promise((_, l) => {
                  (n.callbacks[i] = { resolve: _, reject: l }),
                    n.postMessage(
                      { type: "encode", id: i, data: o, options: r },
                      [o],
                    );
                })
              ),
            )
            .then((c) => {
              if (c.error) throw new Error(c.error);
              return c.data;
            });
        return (
          s.finally(() => {
            n && i && ((n.task_load -= a), delete n.callbacks[i]);
          }),
          s
        );
      }
      init_encoder() {
        if (!this.encoder_pending) {
          let e = st(Gt(this.encoder_path, "basis_encoder.js")),
            r = Tr(Gt(this.encoder_path, "basis_encoder.wasm"));
          this.encoder_pending = Promise.all([e, r]).then(([o, n]) => {
            let i = M3.toString(),
              a = [
                "/* basis_encoder.js */",
                o,
                "/* worker */",
                i.substring(i.indexOf("{") + 1, i.lastIndexOf("}")),
              ].join(`
`);
            (this.worker_source_url = URL.createObjectURL(new Blob([a]))),
              (this.encoder_binary = n);
          });
        }
        return this.encoder_pending;
      }
      allocate_worker(e) {
        return this.init_encoder().then(() => {
          if (this.worker_pool.length < this.worker_limit) {
            let o = new Worker(this.worker_source_url, {
              name: "BasisEncoder",
            });
            (o.callbacks = {}),
              (o.task_load = 0),
              o.postMessage({
                type: "init",
                encoder_binary: this.encoder_binary,
              }),
              (o.onmessage = function (n) {
                let i = n.data;
                switch (i.type) {
                  case "encode":
                    o.callbacks[i.id].resolve(i);
                    break;
                  case "error":
                    o.callbacks[i.id].reject(i);
                    break;
                  default:
                    console.error(
                      `<BasisEncoder> Unexpected message: ${i.type}`,
                    );
                }
              }),
              this.worker_pool.push(o);
          } else
            this.worker_pool.sort(function (o, n) {
              return o.task_load > n.task_load ? -1 : 1;
            });
          let r = this.worker_pool[this.worker_pool.length - 1];
          return (r.task_load += e), r;
        });
      }
      dispose() {
        for (let e = 0; e < this.worker_pool.length; e++)
          this.worker_pool[e].terminate();
        this.worker_pool.length = 0;
      }
    },
    M3 = function () {
      let t, e, r;
      onmessage = function (i) {
        let a = i.data;
        switch (a.type) {
          case "init":
            o(a.encoder_binary);
            break;
          case "encode":
            t.then(() => {
              let s = a.data,
                c = a.options ?? {},
                _ = n(s, c);
              _.byteLength === 0
                ? postMessage({
                    type: "error",
                    id: a.id,
                    error: "<BasisEncoder> encode fail.",
                  })
                : postMessage({ type: "encode", id: a.id, data: _ }, [_]);
            });
            break;
        }
      };
      function o(i) {
        console.log("<BasisEncoder> init basis encoder module.");
        let a;
        t = new Promise((s) => {
          (a = { wasmBinary: i, onRuntimeInitialized: s }), self.BASIS(a);
        }).then(() => {
          let { BasisFile: s, BasisEncoder: c, initializeBasis: _ } = a;
          (e = s), (r = c), _();
        });
      }
      function n(i, a) {
        let s = new r(),
          c = a.slice_index ?? 0,
          _ = a.width ?? 0,
          l = a.height ?? 0,
          u = a.srgb ?? !0,
          d = a.uastc ?? !1,
          p = a.is_png_file ?? !1,
          m = a.generate_mipmap ?? !1,
          f = a.quality_level ?? 10;
        s.setSliceSourceImage(c, new Uint8Array(i), _, l, p),
          s.setPerceptual(u),
          s.setMipSRGB(u),
          s.setQualityLevel(f),
          s.setUASTC(d),
          s.setMipGen(m);
        let y = new Uint8Array(1024 * 1024 * 10),
          g = performance.now(),
          v = s.encode(y),
          w = performance.now();
        return (
          console.log(
            `<BasisEncoder> encode time: ${(w - g).toFixed(
              2,
            )}ms, output basis file size: ${v}`,
          ),
          s.delete(),
          y.buffer.slice(0, v)
        );
      }
    };
  var kp = class {
      constructor() {
        this._transcoderPath = "/basis";
        this._workerLimit = 4;
        this.transcoderBinary = null;
        this.transcoderPending = null;
        this.workerPool = [];
        this.workerNextTaskID = 1;
        this.workerSourceURL = "";
        this.options = {};
        this.extension_detected = !1;
      }
      set transcoderPath(e) {
        this._transcoderPath = e;
      }
      get transcoderPath() {
        return this._transcoderPath;
      }
      set workerLimit(e) {
        this._workerLimit = e;
      }
      get workerLimit() {
        return this._workerLimit;
      }
      detectSupport() {
        let e = C.CurrentDevice().gl;
        this.options.supportedFormats = {
          s3tc: !!e.getExtension("WEBGL_compressed_texture_s3tc"),
          etc1: !!e.getExtension("WEBGL_compressed_texture_etc1"),
          etc2: !!e.getExtension("WEBGL_compressed_texture_etc"),
          pvrtc: !!e.getExtension("WEBGL_compressed_texture_pvrtc"),
          astc: !!e.getExtension("WEBGL_compressed_texture_astc"),
          bptc: !!e.getExtension("EXT_texture_compression_bptc"),
        };
      }
      load(e) {
        return (
          this.extension_detected ||
            (this.detectSupport(), (this.extension_detected = !0)),
          Xe(e)
            ? new Promise((r) => {
                Tr(e).then((o) => {
                  this.create_texture(o).then(function (n) {
                    r(n);
                  });
                });
              })
            : this.create_texture(e)
        );
      }
      create_texture(e) {
        let r,
          o,
          n = e.byteLength,
          i = this.allocate_worker(n)
            .then(
              (a) => (
                (r = a),
                (o = this.workerNextTaskID++),
                new Promise((s, c) => {
                  (r.callbacks[o] = { resolve: s, reject: c }),
                    r.postMessage(
                      {
                        type: "transcode",
                        id: o,
                        buffer: e,
                        options: this.options,
                      },
                      [e],
                    );
                })
              ),
            )
            .then((a) => {
              let { mipLevels: s, transcodeData: c, webglFormat: _ } = a,
                l = _.uncompressed,
                u = _.type,
                d = u === 32819 || u === 32820 || u === 33635,
                p = {};
              (p.min_filter = s.length > 1 || l ? 9987 : 9729),
                (p.mag_filter = 9729),
                (p.internal_format = _.format),
                l && ((p.type = _.type), (p.format = _.format)),
                (p.compressed = !l);
              let m = [];
              p.mipmaps = m;
              for (let f = 0; f < s.length; ++f) {
                let { width: y, height: g, offset: v, size: w } = s[f],
                  k = { width: y, height: g };
                l && d
                  ? (k.data = new Uint16Array(c, v, w / 2))
                  : (k.data = new Uint8Array(c, v, w)),
                  m.push(k);
              }
              return (p.width = s[0].width), (p.height = s[0].height), p;
            });
        return (
          i.finally(() => {
            r && o && ((r.taskLoad -= n), delete r.callbacks[o]);
          }),
          i
        );
      }
      init_transcoder() {
        if (!this.transcoderPending) {
          let e = st(Gt(this.transcoderPath, "basis_transcoder.js")),
            r = Tr(Gt(this.transcoderPath, "basis_transcoder.wasm"));
          this.transcoderPending = Promise.all([e, r]).then(([o, n]) => {
            let i = B3.toString(),
              a = [
                "/* basis_transcoder.js */",
                o,
                "/* worker */",
                i.substring(i.indexOf("{") + 1, i.lastIndexOf("}")),
              ].join(`
`);
            (this.workerSourceURL = URL.createObjectURL(new Blob([a]))),
              (this.transcoderBinary = n);
          });
        }
        return this.transcoderPending;
      }
      allocate_worker(e) {
        return this.init_transcoder().then(() => {
          if (this.workerPool.length < this.workerLimit) {
            let o = new Worker(this.workerSourceURL);
            (o.callbacks = {}),
              (o.taskLoad = 0),
              o.postMessage({
                type: "init",
                transcoderBinary: this.transcoderBinary,
              }),
              (o.onmessage = function (n) {
                let i = n.data;
                switch (i.type) {
                  case "transcode":
                    o.callbacks[i.id].resolve(i);
                    break;
                  case "error":
                    o.callbacks[i.id].reject(i);
                    break;
                  default:
                    console.error(`Unexpected message: ${i.type}`);
                }
              }),
              this.workerPool.push(o);
          } else
            this.workerPool.sort(function (o, n) {
              return o.taskLoad > n.taskLoad ? -1 : 1;
            });
          let r = this.workerPool[this.workerPool.length - 1];
          return (r.taskLoad += e), r;
        });
      }
      dispose() {
        for (let e = 0; e < this.workerPool.length; e++)
          this.workerPool[e].terminate();
        this.workerPool.length = 0;
      }
    },
    B3 = function () {
      let t,
        e,
        r,
        o = {
          cTFETC1_RGB: 0,
          cTFETC2_RGBA: 1,
          cTFBC1_RGB: 2,
          cTFBC3_RGBA: 3,
          cTFBC4_R: 4,
          cTFBC5_RG: 5,
          cTFBC7_RGBA: 6,
          cTFPVRTC1_4_RGB: 8,
          cTFPVRTC1_4_RGBA: 9,
          cTFASTC_4x4_RGBA: 10,
          cTFRGBA32: 13,
          cTFRGB565: 14,
          cTFBGR565: 15,
          cTFRGBA4444: 16,
          cTFTotalTextureFormats: 22,
        },
        n = 33776,
        i = 33777,
        a = 33778,
        s = 33779,
        c = 36196,
        _ = 37488,
        l = 37489,
        u = 37490,
        d = 37491,
        p = 37492,
        m = 37493,
        f = 37494,
        y = 37495,
        g = 37496,
        v = 37497,
        w = 37808,
        k = 35840,
        D = 35841,
        G = 35842,
        U = 35843,
        Y = 36492,
        le = 36493,
        X = 36494,
        Qe = 36495,
        Ge = {};
      (Ge[o.cTFBC1_RGB] = { format: n }),
        (Ge[o.cTFBC3_RGBA] = { format: s }),
        (Ge[o.cTFBC7_RGBA] = { format: Y }),
        (Ge[o.cTFETC1_RGB] = { format: c }),
        (Ge[o.cTFETC2_RGBA] = { format: g }),
        (Ge[o.cTFASTC_4x4_RGBA] = { format: w }),
        (Ge[o.cTFPVRTC1_4_RGB] = { format: k }),
        (Ge[o.cTFPVRTC1_4_RGBA] = { format: G }),
        (Ge[o.cTFRGBA32] = {
          uncompressed: !0,
          format: WebGLRenderingContext.RGBA,
          type: WebGLRenderingContext.UNSIGNED_BYTE,
        }),
        (Ge[o.cTFRGB565] = {
          uncompressed: !0,
          format: WebGLRenderingContext.RGB,
          type: WebGLRenderingContext.UNSIGNED_SHORT_5_6_5,
        }),
        (Ge[o.cTFRGBA4444] = {
          uncompressed: !0,
          format: WebGLRenderingContext.RGBA,
          type: WebGLRenderingContext.UNSIGNED_SHORT_4_4_4_4,
        });
      function Nt(dt, St) {
        postMessage({ id: dt, type: "error", error: St });
      }
      function fo(dt, St, Ze) {
        Nt(dt, Ze), St.close(), St.delete();
      }
      function ra(dt) {
        let St;
        e = new Promise((Ze) => {
          (St = { wasmBinary: dt, onRuntimeInitialized: Ze }), self.BASIS(St);
        }).then(() => {
          (r = St.BasisFile), St.initializeBasis();
        });
      }
      let Uo = 0;
      function un(dt, St) {
        let Ze = new r(new Uint8Array(St)),
          Dr = performance.now(),
          ho = Ze.getNumImages(),
          oa = Ze.getNumLevels(Uo),
          GT = Ze.getHasAlpha();
        if (!ho || !oa) {
          fo(dt, Ze, "Invalid Basis data");
          return;
        }
        if (!Ze.startTranscoding()) {
          fo(dt, Ze, "startTranscoding failed");
          return;
        }
        let { supportedFormats: Xr } = t,
          Bt;
        if (GT)
          if (Xr.etc2) Bt = o.cTFETC2_RGBA;
          else if (Xr.bptc) Bt = o.cTFBC7_RGBA;
          else if (Xr.s3tc) Bt = o.cTFBC3_RGBA;
          else if (Xr.astc) Bt = o.cTFASTC_4x4_RGBA;
          else if (Xr.pvrtc) Bt = o.cTFPVRTC1_4_RGBA;
          else if (Xr.etc1) Bt = o.cTFETC1_RGB;
          else
            throw "<BasisLoader> don't support any appropriate compressed formats";
        else
          Xr.etc1
            ? (Bt = o.cTFETC1_RGB)
            : Xr.bptc
              ? (Bt = o.cTFBC7_RGBA)
              : Xr.s3tc
                ? (Bt = o.cTFBC1_RGB)
                : Xr.etc2
                  ? (Bt = o.cTFETC2_RGBA)
                  : Xr.astc
                    ? (Bt = o.cTFASTC_4x4_RGBA)
                    : Xr.pvrtc
                      ? (Bt = o.cTFPVRTC1_4_RGB)
                      : (Bt = o.cTFRGB565);
        if (Bt === void 0) {
          fo(dt, Ze, "No supported transcode formats");
          return;
        }
        let Pb = Ge[Bt];
        Pb.uncompressed && (oa = 1);
        let qc = [],
          Qc = 0;
        for (let Mo = 0; Mo < oa; ++Mo) {
          let Zc = Ze.getImageTranscodedSizeInBytes(Uo, Mo, Bt);
          qc.push({
            level: Mo,
            offset: Qc,
            size: Zc,
            width: Ze.getImageWidth(Uo, Mo),
            height: Ze.getImageHeight(Uo, Mo),
          }),
            (Qc += Zc);
        }
        let Mp = new Uint8Array(Qc);
        for (let Mo of qc) {
          let Zc = new Uint8Array(Mp.buffer, Mo.offset, Mo.size);
          if (!Ze.transcodeImage(Zc, Uo, Mo.level, Bt, 1, 0)) {
            fo(dt, Ze, "transcodeImage failed");
            return;
          }
        }
        Ze.close(), Ze.delete();
        let UT = performance.now();
        console.log(`<BasisLoader> Transcode time: ${(UT - Dr).toFixed(2)}ms`),
          console.log(
            `<BasisLoader> transcode size: ${Qc}, with ${qc.length} levels`,
          );
        let MT = [Mp.buffer];
        postMessage(
          {
            id: dt,
            type: "transcode",
            buffer: Mp.buffer,
            webglFormat: Pb,
            mipLevels: qc,
          },
          MT,
        );
      }
      onmessage = (dt) => {
        let St = dt.data.url,
          Ze = dt.data.buffer,
          Dr = dt.data.id;
        if (((t = dt.data.options), dt.data.type === "init")) {
          ra(dt.data.transcoderBinary);
          return;
        }
        St
          ? fetch(St).then(function (ho) {
              ho.ok
                ? ho.arrayBuffer().then((oa) => {
                    r
                      ? un(Dr, oa)
                      : e.then(() => {
                          un(Dr, oa);
                        });
                  })
                : Nt(Dr, `Fetch failed: ${ho.status}, ${ho.statusText}`);
            })
          : Ze
            ? r
              ? un(Dr, Ze)
              : e.then(() => {
                  un(Dr, Ze);
                })
            : Nt(Dr, "No url or buffer specified");
      };
    };
  var Fb = new WeakMap(),
    Pp = class {
      constructor() {
        this._decoderPath = "/draco";
        this._decoderConfig = {};
        this._workerLimit = 1;
        this.workerPool = [];
        this.workerNextTaskID = 1;
        this.workerSourceURL = "";
        this.defaultAttributeIDs = {
          position: "POSITION",
          normal: "NORMAL",
          color: "COLOR",
          uv: "TEX_COORD",
        };
        this.defaultAttributeTypes = {
          position: Float32Array,
          normal: Float32Array,
          color: Float32Array,
          uv: Float32Array,
        };
      }
      set decoderPath(e) {
        this._decoderPath = e;
      }
      get decoderPath() {
        return this._decoderPath;
      }
      set decoderConfig(e) {
        this._decoderConfig = e;
      }
      get decoderConfig() {
        return this._decoderConfig;
      }
      set workerLimit(e) {
        this._workerLimit = e;
      }
      get workerLimit() {
        return this._workerLimit;
      }
      async load(e, r) {
        let o,
          n = "unnamed";
        Xe(e) ? ((o = await Tr(e)), (n = Yc(e) ?? n)) : (o = e);
        let i = {
          attributeIDs: r ?? this.defaultAttributeIDs,
          attributeTypes: this.defaultAttributeTypes,
          useUniqueIDs: r !== void 0,
        };
        return this.decodePrimitive(n, o, i);
      }
      async initDecoder() {
        if (this.decoderPending !== void 0) return this.decoderPending;
        let e =
            typeof window.WebAssembly != "object" ||
            this.decoderConfig.type === "js",
          r = [];
        return (
          e
            ? r.push(st(Gt(this.decoderPath, "draco_decoder.js")))
            : (r.push(st(Gt(this.decoderPath, "draco_wasm_wrapper.js"))),
              r.push(Tr(Gt(this.decoderPath, "draco_decoder.wasm")))),
          (this.decoderPending = Promise.all(r).then((o) => {
            let n = o[0];
            e || (this.decoderConfig.wasmBinary = o[1]);
            let i = W3.toString(),
              a = [
                "/* draco decoder */",
                n,
                "",
                "/* worker */",
                i.substring(i.indexOf("{") + 1, i.lastIndexOf("}")),
              ].join(`
`);
            this.workerSourceURL = URL.createObjectURL(new Blob([a]));
          })),
          this.decoderPending
        );
      }
      async getWorker(e, r) {
        return this.initDecoder().then(() => {
          if (this.workerPool.length < this.workerLimit) {
            let n = new Worker(this.workerSourceURL, {
              name: "draco_decoder_worker",
            });
            (n.callbacks = {}),
              (n.taskCosts = {}),
              (n.taskLoad = 0),
              n.postMessage({
                type: "init",
                decoderConfig: this.decoderConfig,
              }),
              (n.onmessage = function (i) {
                let a = i.data;
                switch (a.type) {
                  case "decode":
                    n.callbacks[a.id].resolve(a);
                    break;
                  case "error":
                    n.callbacks[a.id].reject(a);
                    break;
                  default:
                    console.error(`Unexpected message ${a.type}`);
                }
              }),
              this.workerPool.push(n);
          } else
            this.workerPool.sort(function (n, i) {
              return n.taskLoad > i.taskLoad ? -1 : 1;
            });
          let o = this.workerPool[this.workerPool.length - 1];
          return (o.taskCosts[e] = r), (o.taskLoad += r), o;
        });
      }
      releaseTask(e, r) {
        (e.taskLoad -= e.taskCosts[r]),
          delete e.callbacks[r],
          delete e.taskCosts[r];
      }
      create_primitive(e, r) {
        let o = { attributes: [] };
        if (r.index !== null) {
          o.index = new Uint32Array(r.index.array);
          let i = o.index;
          for (let a = 0; a < i.length; a += 3) {
            let s = i[a + 2];
            (i[a + 2] = i[a + 1]), (i[a + 1] = s);
          }
        }
        for (let i = 0; i < r.attributes.length; ++i) {
          let a = r.attributes[i];
          o.attributes.push({
            buffer: a.array,
            stride: a.itemSize,
            name: O3(a.name),
          });
        }
        o.name = e;
        let n = r.groups;
        return { primitive: o, groups: n };
      }
      async decodePrimitive(e, r, o) {
        for (let _ in o.attributeTypes) {
          let l = o.attributeTypes[_];
          l.BYTES_PER_ELEMENT !== void 0 && (o.attributeTypes[_] = l.name);
        }
        let n = JSON.stringify(o);
        if (Fb.has(r)) {
          let _ = Fb.get(r);
          if (_.key === n) return _.promise;
          if (r.byteLength === 0)
            throw new Error("Buffer has already been transferred.");
        }
        let i,
          a = this.workerNextTaskID++,
          s = r.byteLength,
          c = this.getWorker(a, s)
            .then(
              (_) => (
                (i = _),
                new Promise((l, u) => {
                  (i.callbacks[a] = { resolve: l, reject: u }),
                    i.postMessage(
                      { type: "decode", id: a, taskConfig: o, buffer: r },
                      [r],
                    );
                })
              ),
            )
            .then((_) => this.create_primitive(e, _.geometry));
        return (
          c.finally(() => {
            i && a && this.releaseTask(i, a);
          }),
          Fb.set(r, { key: n, promise: c }),
          c
        );
      }
      dispose() {
        for (let e = 0; e < this.workerPool.length; ++e)
          this.workerPool[e].terminate();
        return (this.workerPool.length = 0), this;
      }
      reload() {
        this.initDecoder();
      }
    },
    W3 = function () {
      let t, e;
      onmessage = function (n) {
        let i = n.data;
        switch (i.type) {
          case "init":
            (t = i.decoderConfig),
              (e = new Promise(function (c) {
                (t.onModuleLoaded = function (_) {
                  c({ draco: _ });
                }),
                  self.DracoDecoderModule(t);
              }));
            break;
          case "decode":
            let a = i.buffer,
              s = i.taskConfig;
            e.then((c) => {
              let _ = c.draco,
                l = new _.Decoder(),
                u = new _.DecoderBuffer();
              u.Init(new Int8Array(a), a.byteLength);
              try {
                let d = r(_, l, u, s),
                  p = d.attributes.map((m) => m.array.buffer);
                d.index && p.push(d.index.array.buffer),
                  self.postMessage(
                    { type: "decode", id: i.id, geometry: d },
                    p,
                  );
              } catch (d) {
                console.error(d),
                  self.postMessage({
                    type: "error",
                    id: i.id,
                    error: d.message,
                  });
              } finally {
                _.destroy(u), _.destroy(l);
              }
            });
            break;
        }
      };
      function r(n, i, a, s) {
        let c = s.attributeIDs,
          _ = s.attributeTypes,
          l,
          u,
          d = i.GetEncodedGeometryType(a);
        if (d === n.TRIANGULAR_MESH)
          (l = new n.Mesh()), (u = i.DecodeBufferToMesh(a, l));
        else if (d === n.POINT_CLOUD)
          (l = new n.PointCloud()), (u = i.DecodeBufferToPointCloud(a, l));
        else throw new Error("Unexpected geometry type.");
        if (!u.ok() || l.ptr === 0)
          throw new Error("Decoding failed: " + u.error_msg());
        let p = { index: null, attributes: [], groups: [] };
        for (let m in c) {
          let f = self[_[m]],
            y,
            g;
          if (s.useUniqueIDs)
            (g = c[m]),
              (y = i.GetAttributeByUniqueId(l, g)),
              m.toLocaleLowerCase().indexOf("joint") !== -1
                ? (f = Uint16Array)
                : (f = Float32Array);
          else {
            if (((g = i.GetAttributeId(l, n[c[m]])), g === -1)) continue;
            y = i.GetAttribute(l, g);
          }
          p.attributes.push(o(n, i, l, m, f, y));
        }
        if (d === n.TRIANGULAR_MESH) {
          let m = l.num_faces(),
            f = m * 3,
            y = new Uint32Array(f),
            g = new n.DracoInt32Array();
          for (let v = 0; v < m; ++v)
            i.GetFaceFromMesh(l, v, g),
              (y[v * 3] = g.GetValue(0)),
              (y[v * 3 + 1] = g.GetValue(1)),
              (y[v * 3 + 2] = g.GetValue(2));
          p.index = { array: y, itemSize: 1 };
        }
        return n.destroy(l), p;
      }
      function o(n, i, a, s, c, _) {
        let l = _.num_components(),
          d = a.num_points() * l,
          p,
          m;
        switch (c) {
          case Float32Array:
            (p = new n.DracoFloat32Array()),
              i.GetAttributeFloatForAllPoints(a, _, p),
              (m = new Float32Array(d));
            break;
          case Int8Array:
            (p = new n.DracoInt8Array()),
              i.GetAttributeInt8ForAllPoints(a, _, p),
              (m = new Int8Array(d));
            break;
          case Int16Array:
            (p = new n.DracoInt16Array()),
              i.GetAttributeInt16ForAllPoints(a, _, p),
              (m = new Int16Array(d));
            break;
          case Int32Array:
            (p = new n.DracoInt32Array()),
              i.GetAttributeInt32ForAllPoints(a, _, p),
              (m = new Int32Array(d));
            break;
          case Uint8Array:
            (p = new n.DracoUInt8Array()),
              i.GetAttributeUInt8ForAllPoints(a, _, p),
              (m = new Uint8Array(d));
            break;
          case Uint16Array:
            (p = new n.DracoUInt16Array()),
              i.GetAttributeUInt16ForAllPoints(a, _, p),
              (m = new Uint16Array(d));
            break;
          case Uint32Array:
            (p = new n.DracoUInt32Array()),
              i.GetAttributeUInt32ForAllPoints(a, _, p),
              (m = new Uint32Array(d));
            break;
          default:
            throw new Error("Unexpected attribute type.");
        }
        for (let f = 0; f < d; f++) m[f] = p.GetValue(f);
        return n.destroy(p), { name: s, array: m, itemSize: l };
      }
    };
  function O3(t) {
    return t === "POSITION"
      ? "position"
      : t === "NORMAL"
        ? "normal"
        : t === "TANGENT"
          ? "tangent"
          : /TEXCOORD_\d+/.test(t)
            ? "uv"
            : /COLOR_\d+/.test(t)
              ? "color"
              : /JOINTS_\d+/.test(t)
                ? "joint"
                : /WEIGHTS_\d+/.test(t)
                  ? "weight"
                  : t;
  }
  var H3 = 1179937895;
  function V3(t) {
    switch (t) {
      case "POSITION":
        return "position";
      case "TEXCOORD_0":
        return "uv";
      case "NORMAL":
        return "normal";
      case "TANGENT":
        return "tangent";
      case "COLOR_0":
        return "color";
      case "JOINTS_0":
        return "skin";
      case "WEIGHTS_0":
        return "weight";
      case "TEXCOORD_1":
        return "uv2";
    }
    if (t.startsWith("TEXCOORD_")) return `uv${t.substring(9)}`;
    throw `invalid attribute name ${t}.`;
  }
  function j3(t) {
    switch (t) {
      case 5120:
        return Int8Array;
      case 5121:
        return Uint8Array;
      case 5122:
        return Int16Array;
      case 5123:
        return Uint16Array;
      case 5125:
        return Uint32Array;
      case 5126:
        return Float32Array;
    }
    throw `invalid accessor component type ${t}.`;
  }
  function X3(t) {
    switch (t) {
      case "SCALAR":
        return 1;
      case "VEC2":
        return 2;
      case "VEC3":
        return 3;
      case "VEC4":
        return 4;
      case "MAT2":
        return 4;
      case "MAT3":
        return 9;
      case "MAT4":
        return 16;
      default:
        break;
    }
    throw `invalid accessor type ${t}.`;
  }
  var Ep = class {
    constructor() {
      this.cache = {};
    }
    async load(e) {
      let r = {};
      if (Xe(e))
        e.startsWith("http")
          ? ia(e, ["gltf"])
            ? (r = JSON.parse(await st(e)))
            : (r = this.parse_raw_buffer(await Tr(e)))
          : (r = JSON.parse(e));
      else if (e instanceof ArrayBuffer) r = this.parse_raw_buffer(e);
      else throw `invalid resource ${e}`;
      (this.gltf = r), console.log(r);
      let o = await this.parse(),
        n = this.gltf.animations,
        i = [];
      if (n !== void 0)
        for (let u = 0; u < n.length; u++)
          i.push(await this.get("animation", u));
      let a = this.gltf.skins,
        s = [];
      if (a)
        for (let u = 0; u < a.length; ++u) s.push(await this.get("skin", u));
      let c = [],
        _ = this.gltf.meshes;
      if (_)
        for (let u = 0; u < _.length; ++u) {
          let d = await this.get("mesh", u);
          c.push(d);
        }
      let l = {
        scene: o,
        animations: i,
        asset: this.gltf.asset,
        skeletons: s,
        primitives: c,
      };
      return (this.cache = {}), (this.gltf = void 0), l;
    }
    parse_raw_buffer(e) {
      let r = new $e(e),
        o = r.read_u32(0);
      if (o !== H3) throw `invalid file format. header ${o}`;
      let n = {},
        i = r.read_u32(4);
      console.log(`glb version ${i}`);
      let a = r.read_u32(8),
        s = 12,
        c = 0;
      for (; s < a; ) {
        let _ = r.read_u32(s),
          l = r.read_u32(s + 4);
        if (l === 1313821514)
          n = Object.assign(n, JSON.parse(Cb(r.read_array_buffer(s + 8, _))));
        else if (l === 5130562) {
          let u = new Blob([r.read_array_buffer(s + 8, _)]);
          n.buffers[c++].uri = URL.createObjectURL(u);
        } else throw `invalid glb chunk type ${l}`;
        s += _ + 8;
      }
      return n;
    }
    async parse() {
      return await this.get("scene", this.gltf.scene);
    }
    async load_scene(e) {
      let r = new Cr(this.gltf.scenes[e].name),
        o = this.gltf.scenes[e].nodes;
      for (let n = 0; n < o.length; ++n)
        await this.build_node_hierarchy(o[n], r);
      return r;
    }
    async load_skin(e) {
      let r = this.gltf.skins[e],
        o = [],
        i = (await this.get("accessor", r.inverseBindMatrices)).buffer,
        a = 0;
      for (let s = 0; s < r.joints.length; ++s) {
        let c = r.joints[s],
          _ = await this.get("bone", c);
        (_.bind_inverse_matrix = new L().read(i, a)), o.push(_), (a += 16);
      }
      return new Nn(r.name, o);
    }
    async load_bone(e) {
      let r = await this.get("node", e);
      return (r.skeleton = new Nn()), r;
    }
    async load_node(e) {
      let r = this.gltf.nodes[e],
        o = new Cr();
      if (
        ((o.name = r.name),
        r.mesh,
        r.skin !== void 0 && (o.skeleton = new Nn()),
        r.rotation)
      ) {
        let n = r.rotation[0],
          i = r.rotation[1],
          a = r.rotation[2],
          s = r.rotation[3];
        o.rotation.set(n, i, a, s);
      }
      if (r.translation) {
        let n = r.translation[0],
          i = r.translation[1],
          a = r.translation[2];
        o.location.set(n, i, a);
      }
      if (r.scale) {
        let n = r.scale[0],
          i = r.scale[1],
          a = r.scale[2];
        o.scale.set(n, i, a);
      }
      return o;
    }
    async load_buffer(e) {
      let o = this.gltf.buffers[e].uri,
        n = /^data:(.*?)(;base64)?,(.*)$/,
        i = o.match(n);
      if (i) {
        let a = !!i[2],
          s = i[3];
        (s = decodeURIComponent(s)), a && (s = atob(s));
        let c = new Uint8Array(s.length);
        for (let _ = 0; _ < s.length; ++_) c[_] = s.charCodeAt(_);
        return c.buffer;
      } else return await Tr(o);
    }
    async load_buffer_view(e) {
      let r = this.gltf.bufferViews[e],
        o = await this.get("buffer", r.buffer),
        n = r.byteLength || 0,
        i = r.byteOffset || 0;
      return o.slice(i, i + n);
    }
    async load_accessor(e) {
      let r = this.gltf.accessors[e];
      if ((r.componentType, r.bufferView === void 0))
        throw `invalid accessor ${e}.`;
      let o = await this.get("bufferView", r.bufferView),
        n = X3(r.type),
        i = j3(r.componentType),
        a = r.byteOffset || 0,
        s = new i(o, a, r.count * n);
      return (
        console.assert(s.length / n === r.count, "unmatched buffer size."),
        { buffer: s, stride: n }
      );
    }
    async build_node_hierarchy(e, r) {
      let o = this.gltf.nodes[e],
        n = await this.get("node", e);
      if ((r.add(n), o.children !== void 0))
        for (let i = 0; i < o.children.length; ++i) {
          let a = o.children[i];
          await this.build_node_hierarchy(a, n);
        }
      return n;
    }
    async load_mesh(e) {
      let r = this.gltf.meshes[e],
        o = [];
      for (let n = 0; n < r.primitives.length; ++n)
        o.push(await this.load_primitive(r.primitives[n]));
      return o[0];
    }
    async load_primitive(e) {
      let r = e.attributes,
        o = { attributes: [] };
      if (e.extensions && e.extensions.KHR_draco_mesh_compression) {
        let n = e.extensions.KHR_draco_mesh_compression,
          i = await this.load_buffer_view(n.bufferView),
          a = i.slice(0),
          s = await h(mr).load(i, "drc", n.attributes);
        console.log(s), (o = s.primitive), (o.compressed_data = a);
      } else {
        for (let n of Object.getOwnPropertyNames(r)) {
          let i = V3(n),
            a = await this.get("accessor", e.attributes[n]);
          (a.name = i), hn(o, a);
        }
        if (e.indices !== void 0) {
          let n = await this.get("accessor", e.indices);
          n.buffer.BYTES_PER_ELEMENT !== 4 &&
            (n.buffer = new Uint32Array(n.buffer)),
            (o.index = n.buffer);
        }
      }
      return o;
    }
    async load_animation(e) {
      let r = this.gltf.animations[e];
      return new m_(r.name);
    }
    async get(e, r) {
      let o = `${e}:${r}`,
        n = this.cache[o];
      if (n !== void 0) return n;
      switch (e) {
        case "buffer":
          n = await this.load_buffer(r);
          break;
        case "scene":
          n = await this.load_scene(r);
          break;
        case "bufferView":
          n = await this.load_buffer_view(r);
          break;
        case "accessor":
          n = await this.load_accessor(r);
          break;
        case "mesh":
          n = await this.load_mesh(r);
          break;
        case "node":
          n = await this.load_node(r);
          break;
        case "bone":
          n = await this.load_bone(r);
          break;
        case "animation":
          n = await this.load_animation(r);
          break;
        case "skin":
          n = await this.load_skin(r);
          break;
        default:
          throw `unknown ${e}.`;
      }
      return (this.cache[o] = n), n;
    }
  };
  var Dp = class {
    async load(e) {
      let r = new Image();
      if (Xe(e))
        return new Promise((o) => {
          (r.onload = function () {
            o(r);
          }),
            (r.src = e);
        });
      if (e instanceof ArrayBuffer) {
        let o = URL.createObjectURL(new Blob([e]));
        return new Promise((n) => {
          (r.onload = function () {
            URL.revokeObjectURL(o), n(r);
          }),
            (r.src = o);
        });
      } else throw `invalid image source ${e}`;
    }
  };
  var Gp = class {
      async load(e) {
        return J3(await st(e));
      }
    },
    $3 = /\s+/,
    q3 = /^v\s/,
    Q3 = /^vt\s/,
    Z3 = /^vn\s/,
    Y3 = /^f\s/;
  var Ab, $c;
  function J3(t) {
    Ab === void 0 && ((Ab = new T()), ($c = new b()));
    let e = [],
      r = [],
      o = [],
      n = [],
      i = [],
      a = new Map(),
      s = t.split(`
`),
      c = -1;
    for (; ++c < s.length; ) {
      let f = s[c].trim(),
        y = f.split($3);
      if ((y.shift(), q3.test(f)))
        e.push(parseFloat(y[0]), parseFloat(y[1]), parseFloat(y[2]));
      else if (Z3.test(f))
        r.push(parseFloat(y[0]), parseFloat(y[1]), parseFloat(y[2]));
      else if (Q3.test(f)) o.push(parseFloat(y[0]), parseFloat(y[1]));
      else if (Y3.test(f)) {
        let g = -1,
          v = { vertices: [] };
        for (; ++g < y.length; ) {
          let w = y[g].split("/"),
            k = w[1] === "" ? 0 : parseInt(w[1]) - 1,
            D = parseInt(w[0]) - 1,
            G = parseInt(w[2]) - 1,
            U = `${D}-${k}-${G}`;
          if (a.has(U)) v.vertices.push(a.get(U));
          else {
            let Y = n.length,
              le = { xi: D, ti: k, ni: G };
            n.push(le), a.set(U, Y), v.vertices.push(Y);
          }
        }
        i.push(v);
      }
    }
    let _ = new be(),
      l = new Float32Array(n.length * 3),
      u = new Float32Array(n.length * 2),
      d = new Float32Array(n.length * 3);
    for (let f = 0; f < n.length; ++f) {
      let y = n[f];
      $c.read(e, y.xi * 3).write(l, f * 3),
        _.expand_point($c),
        _.expand_point($c),
        Ab.read(o, y.ti * 2).write(u, f * 2),
        $c.read(r, y.ni * 3).write(d, f * 3);
    }
    let p = { attributes: [], box: _ };
    hn(p, { name: "position", stride: 3, buffer: l }),
      hn(p, { name: "uv", stride: 2, buffer: u }),
      hn(p, { name: "normal", stride: 3, buffer: d });
    let m = [];
    for (let f = 0; f < i.length; ++f) {
      let y = i[f],
        g = y.vertices[0];
      for (let v = 2; v < y.vertices.length; ++v) {
        let w = y.vertices[v - 1],
          k = y.vertices[v];
        m.push(g, w, k);
      }
    }
    return (p.index = new Uint32Array(m)), p;
  }
  var Up = class {
    async load(e) {
      let r = new yn(
        new Worker("public/package/worker/packenv.worker.js", {
          name: "packenv_worker",
        }),
        !0,
      );
      return (r.worker_name = "packenv_worker"), r.send_async({ source: e });
    }
  };
  var mr = class {
    constructor() {
      this.loader_map = new Map();
      this.post_load_map = new Map();
      this.encoder_map = new Map();
    }
    async on_register() {
      let e = new Dp(),
        r = new Ep(),
        o = new kp(),
        n = new Pp();
      this.register_loader("drc", n),
        this.register_loader("basis", o),
        this.register_loader("png", e),
        this.register_loader("jpg", e),
        this.register_loader("jpeg", e),
        this.register_loader("webp", e),
        this.register_loader("gltf", r),
        this.register_loader("glb", r),
        this.register_loader("obj", new Gp()),
        this.register_loader("model", n),
        this.register_loader("packenv", new Up());
      let i = new Ap();
      this.register_encoder("basis", i);
      let a = new xa();
      this.register_encoder("drc", a),
        this.register_resource_post_load("drc", Rb),
        this.register_resource_post_load("model", Rb),
        this.register_resource_post_load("basis", Tb),
        this.register_resource_post_load("png", Tb),
        this.register_resource_post_load("jpg", Fp),
        this.register_resource_post_load("jpeg", Fp),
        this.register_resource_post_load("webp", Fp),
        this.register_resource_post_load("glb", Sb),
        this.register_resource_post_load("gltf", Sb),
        this.register_resource_post_load("obj", PT);
    }
    register_loader(e, r) {
      if (this.loader_map.has(e)) {
        console.warn(`${e} loader exists. register cancelled.`);
        return;
      }
      this.loader_map.set(e, r);
    }
    register_resource_post_load(e, r) {
      if (this.post_load_map.has(e)) {
        console.warn(`${e} post load action exists. register cancelled.`);
        return;
      }
      this.post_load_map.set(e, r);
    }
    register_encoder(e, r) {
      if (this.encoder_map.has(e)) {
        console.warn(`${e} encoder exists. register cancelled.`);
        return;
      }
      this.encoder_map.set(e, r);
    }
    get_loader(e) {
      return this.loader_map.get(e);
    }
    get_post_load(e) {
      return this.post_load_map.get(e);
    }
    async load(e, r, ...o) {
      let n = r;
      if ((r || (n = ks(e).toLowerCase()), !n)) {
        console.error(`invalid source type ${n}.`);
        return;
      }
      let i = this.loader_map.get(n);
      if (!i) {
        console.error(`loader for ${n} not exists.`);
        return;
      }
      return i.load(e, ...o);
    }
    async encode(e, r, o) {
      let n = this.encoder_map.get(r);
      if (!n) {
        console.error(`encoder for ${r} not exists.`);
        return;
      }
      return n.encode(e, o);
    }
  };
  var Z = class {
    constructor() {
      this.guid_map = new Map();
      this.changed = !0;
    }
    async on_register(e) {
      e !== void 0 &&
        (this.deserialize(e),
        console.log("<FilesystemAPI> Filesystem Deserialized")),
        B.on(ze.AfterTick, () => {
          this.changed = !1;
        });
    }
    async load_remote_script(e, r) {
      let o = await Qw(r),
        n = e.add(new It(Np(r), "resource"));
      h(J).link_resource(o.uuid, n.guid), (n.data = o.data.code);
    }
    async load_resource_from_fnode(e, r) {
      let o = ks(e.name);
      if (!o) return !1;
      let n = h(mr),
        i = n.get_loader(o);
      return i === void 0
        ? !1
        : new Promise((a) => {
            i.load(e.data.read_array_buffer()).then((s) => {
              if (!s) {
                a(!1);
                return;
              }
              let c = n.get_post_load(o);
              c && (c(e, s), (e.type = "resource")), (this.changed = !0), a(!0);
            });
          });
    }
    async load_resource_by_path(e) {
      let r = this.get_node_by_path(e);
      return r === void 0 ? !1 : this.load_resource_from_fnode(r);
    }
    get_node_by_path(e) {
      if (!e) return;
      let r = e.split(/\//g).filter((n) => n !== void 0 && n !== ""),
        o = this.root;
      if (e === o.name) return o;
      for (let n = 0; n < r.length; n++) {
        let i = r[n];
        if (o.name_to_fnode[r[n]] !== void 0) o = o.name_to_fnode[i];
        else {
          console.warn(`file not exists ${e}`);
          return;
        }
      }
      return o;
    }
    remove_node(e) {
      e.parent !== void 0 && (e.parent.remove(e), (this.changed = !0));
    }
    serialize() {
      let e = new $e(),
        r = [];
      return kb(this.root, e, r), { nodes: r, buffer: e.serialize() };
    }
    deserialize(e) {
      let r = e.nodes,
        o = $e.deserialize(e.buffer),
        n = [];
      for (let i = 0; i < r.length; ++i) {
        let a = r[i],
          s = new It(a.name, a.type, a.guid);
        if (
          (a.data !== void 0 &&
            (a.data.capacity !== void 0
              ? (s.data = $e.deserialize(a.data, o))
              : (s.data = a.data)),
          (s.opened = a.opened),
          (n[a.id] = s),
          a.parent === void 0)
        )
          debugger;
        i > 0 && n[a.parent].add(s);
      }
      (this.root = n[0]), (this.changed = !0);
    }
    get_node_by_guid(e) {
      if (e !== void 0) return this.guid_map.get(e);
    }
    delete_asset_by_guid(e) {
      e !== void 0 && this.guid_map.has(e) && this.guid_map.delete(e);
    }
  };
  function ss(t) {
    let e = ks(t).toLowerCase();
    return e === "jpg" ||
      e === "jpeg" ||
      e === "webp" ||
      e === "png" ||
      e === "basis" ||
      e === "tex"
      ? 5
      : e === "drc" || e === "obj" || e === "fbx" || e === "model"
        ? 1
        : e === "mat"
          ? 2
          : e === "scn" || e === "gltf" || e === "glb"
            ? 4
            : e === "ng"
              ? 7
              : e === "js" || e === "ts"
                ? 3
                : e === "skn"
                  ? 9
                  : e === "anim"
                    ? 8
                    : 0;
  }
  function M1(t, e = "New Folder") {
    let r = e,
      o = `${r}`,
      n = 1;
    for (; t.name_to_fnode[o] !== void 0; ) o = `${r} ${n++}`;
    let i = new It(o, "folder");
    return t.add(i), i;
  }
  function C1(t, e, r = "New File") {
    let o = `${r}`,
      n = 1;
    for (; t.name_to_fnode[o] !== void 0; ) o = `${r} ${n++}`;
    let i = new It(o, e || "file");
    return t.add(i), i;
  }
  function K3(t, e) {
    return t.name > e.name ? 1 : -1;
  }
  var It = class extends pn {
    constructor(r = "unamed", o = "folder", n) {
      super();
      this.name = r;
      this.is_fnode = !0;
      this.type = "file";
      this.opened = !1;
      this.name_to_fnode = {};
      this.guid = "";
      this.last_modified = -1;
      n === void 0 && ((n = na()), h(Z).guid_map.set(n, this)),
        (this.guid = n),
        (this.type = o);
    }
    static is(r) {
      return r && r.is_fnode;
    }
    get is_root() {
      return this.parent === void 0;
    }
    create_folder(r) {
      let o = new It(r, "folder");
      return this.add(o), o;
    }
    sort() {
      this.children.sort(K3);
    }
    get path() {
      let r = this.name,
        o = this;
      for (; o.parent; ) (r = `${o.parent.name}/${r}`), (o = o.parent);
      return r;
    }
    get depth() {
      let r = 0;
      return this.parent && (r += this.parent.depth), r;
    }
    get absolute_path() {
      let r = this.path;
      return Gt(r, this.name);
    }
    add(r) {
      let o = r.name,
        n = o.lastIndexOf("."),
        i = 1;
      for (; this.name_to_fnode[o] !== void 0; )
        o =
          n > -1
            ? `${o.substring(0, n)}_${i++}.${o.substring(n + 1) ?? ""}`
            : `${o}_${i++}`;
      return (r.name = o), (this.name_to_fnode[r.name] = r), super.add(r), r;
    }
    remove(r) {
      return delete this.name_to_fnode[r.name], super.remove(r), r;
    }
  };
  function kb(t, e, r, o = 0) {
    let n = {};
    if (
      ((n.name = t.name),
      (n.type = t.type),
      (n.opened = t.opened),
      t.data instanceof $e
        ? ((n.data = t.data.serialize()),
          (n.data.offset = e.write_array_buffer(t.data.buffer)),
          (n.data.buffer = 0))
        : t.data !== void 0 && (n.data = t.data),
      (n.parent = o),
      (n.guid = t.guid),
      (n.id = r.length),
      r.push(n),
      t.children.length > 0)
    )
      for (let i = 0; i < t.children.length; ++i) kb(t.children[i], e, r, n.id);
  }
  async function ek(t, e = 0) {
    let r = new FileReader();
    return new Promise(function (o) {
      t.file(function (n) {
        (r.onload = (i) => {
          let a = i.target.result;
          o(e === 0 ? a : new $e(a));
        }),
          e === 0 ? r.readAsText(n) : r.readAsArrayBuffer(n);
      });
    });
  }
  async function ET(t) {
    if (t === null) return;
    let e;
    if (t.isFile) {
      let r = t;
      e = new It(r.name, "file");
      let o = ia(e.name, ["js", "ts"]),
        n = o ? 0 : 1;
      (e.type = o ? "resource" : "file"), (e.data = await ek(r, n));
    } else if (t.isDirectory) {
      let r = t,
        o = r.createReader();
      e = new It(r.name, "folder");
      let i = await new Promise((a) => {
        o.readEntries(function (s) {
          let c = [];
          for (let _ = 0; _ < s.length; ++_) c.push(ET(s[_]));
          Promise.all(c).then(a);
        });
      });
      for (let a = 0; a < i.length; ++a) {
        let s = i[a];
        s !== void 0 && e.add(s);
      }
    } else throw "invalid data type";
    return e;
  }
  function pu(t, e) {
    t.addEventListener("dragover", (r) => {
      r.preventDefault();
    }),
      t.addEventListener("drop", (r) => {
        if ((r.preventDefault(), r.dataTransfer === null)) return;
        let o = r.dataTransfer.items,
          n = [];
        for (let i = 0; i < o.length; i++) {
          let a = o[i];
          a !== null && n.push(ET(a.webkitGetAsEntry()));
        }
        Promise.all(n).then((i) => {
          let a = [];
          for (let s = 0; s < i.length; ++s) {
            let c = i[s];
            c !== void 0 && a.push(c);
          }
          e(a);
        });
      });
  }
  var lse = new x(0, window.innerHeight - Sr, window.innerWidth, Sr),
    Di = class {
      constructor() {
        this.should_render = !0;
        this.project_updated = !1;
        this.clear_action = { type: 7, clear_color: new H(), clear_depth: 1 };
      }
      async on_register() {
        let e = ["project"];
        pu(C.CurrentDevice().canvas, (r) => {
          let o = h(Bo);
          for (let n = 0; n < r.length; n++) {
            let i = r[n];
            if (ia(i.name, e)) {
              let a = Yc(i.name);
              o.save_project(a, i.data.buffer).then(function () {
                console.log(`project ${a} loaded`);
              });
            } else console.log(`invalid project file ${i.name}`);
          }
          this.project_updated = !0;
        });
      }
    };
  async function DT() {
    let t = h(Z);
    (t.root = new It()),
      t.root.create_folder("home"),
      t.root.create_folder("bin");
    let e = t.root.create_folder("union"),
      r = new It("sample.project", "file");
    e.add(r);
  }
  console.log("union os");
  async function tk() {
    Jc() === 0 && Bb(0),
      oI(),
      await No(Bo),
      await No(mr),
      await No(Nr),
      await No(F),
      await No(Z),
      await No(J),
      await No(Hr),
      await DT(),
      await No(Di),
      await No(sr);
  }
  tk().then();
})();
/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
