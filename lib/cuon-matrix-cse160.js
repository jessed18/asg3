// Vector3 class
class Vector3 {
  constructor(src) {
    this.elements = new Float32Array(3);
    if (src && src.length === 3) {
      this.elements.set(src);
    }
  }

  add(other) {
    const e = this.elements, o = other.elements;
    e[0] += o[0]; e[1] += o[1]; e[2] += o[2];
    return this;
  }

  sub(other) {
    const e = this.elements, o = other.elements;
    e[0] -= o[0]; e[1] -= o[1]; e[2] -= o[2];
    return this;
  }

  mul(scalar) {
    const e = this.elements;
    e[0] *= scalar; e[1] *= scalar; e[2] *= scalar;
    return this;
  }

  div(scalar) {
    const e = this.elements;
    e[0] /= scalar; e[1] /= scalar; e[2] /= scalar;
    return this;
  }

  normalize() {
    const e = this.elements;
    const len = Math.hypot(e[0], e[1], e[2]);
    if (len !== 0) this.div(len);
    return this;
  }

  copy() {
    return new Vector3(this.elements);
  }

  static cross(a, b) {
    const ae = a.elements, be = b.elements;
    return new Vector3([
      ae[1] * be[2] - ae[2] * be[1],
      ae[2] * be[0] - ae[0] * be[2],
      ae[0] * be[1] - ae[1] * be[0]
    ]);
  }
}

// Vector4 class
class Vector4 {
  constructor(src) {
    this.elements = new Float32Array(4);
    if (src && src.length === 4) {
      this.elements.set(src);
    }
  }
}

// Matrix4 class
class Matrix4 {
  constructor() {
    this.elements = new Float32Array([
      1, 0, 0, 0,  // column 0
      0, 1, 0, 0,  // column 1
      0, 0, 1, 0,  // column 2
      0, 0, 0, 1   // column 3
    ]);
  }

  setIdentity() {
    const e = this.elements;
    e.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    return this;
  }

  setTranslate(x, y, z) {
    this.setIdentity();
    const e = this.elements;
    e[12] = x;
    e[13] = y;
    e[14] = z;
    return this;
  }

  translate(x, y, z) {
    const e = this.elements;
    e[12] += e[0]*x + e[4]*y + e[8]*z;
    e[13] += e[1]*x + e[5]*y + e[9]*z;
    e[14] += e[2]*x + e[6]*y + e[10]*z;
    return this;
  }

  setScale(x, y, z) {
    this.setIdentity();
    const e = this.elements;
    e[0] = x;
    e[5] = y;
    e[10] = z;
    return this;
  }

  scale(x, y, z) {
    const e = this.elements;
    e[0] *= x; e[4] *= y; e[8]  *= z;
    e[1] *= x; e[5] *= y; e[9]  *= z;
    e[2] *= x; e[6] *= y; e[10] *= z;
    e[3] *= x; e[7] *= y; e[11] *= z;
    return this;
  }

  setRotate(angle, x, y, z) {
    const e = this.elements;
    const rad = angle * Math.PI / 180;
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    if (x === 1 && y === 0 && z === 0) {
      // Rotate around X axis
      e.set([
        1, 0,  0, 0,
        0, c,  s, 0,
        0, -s, c, 0,
        0, 0,  0, 1
      ]);
    } else if (x === 0 && y === 1 && z === 0) {
      // Rotate around Y axis
      e.set([
         c, 0, -s, 0,
         0, 1,  0, 0,
         s, 0,  c, 0,
         0, 0,  0, 1
      ]);
    } else if (x === 0 && y === 0 && z === 1) {
      // Rotate around Z axis
      e.set([
        c,  s, 0, 0,
       -s,  c, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1
      ]);
    } else {
      // General rotation
      const len = Math.sqrt(x*x + y*y + z*z);
      if (len === 0) return this.setIdentity();
      x /= len; y /= len; z /= len;

      const nc = 1 - c;
      e.set([
        x*x*nc + c,   x*y*nc + z*s, x*z*nc - y*s, 0,
        y*x*nc - z*s, y*y*nc + c,   y*z*nc + x*s, 0,
        z*x*nc + y*s, z*y*nc - x*s, z*z*nc + c,   0,
        0,            0,            0,            1
      ]);
    }
    return this;
  }

  setLookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
    const fx = cx - ex, fy = cy - ey, fz = cz - ez;
    const rlf = 1 / Math.hypot(fx, fy, fz);
    const fxn = fx * rlf, fyn = fy * rlf, fzn = fz * rlf;

    const sx = fyn * uz - fzn * uy;
    const sy = fzn * ux - fxn * uz;
    const sz = fxn * uy - fyn * ux;
    const rls = 1 / Math.hypot(sx, sy, sz);
    const sxn = sx * rls, syn = sy * rls, szn = sz * rls;

    const ux1 = syn * fzn - szn * fyn;
    const uy1 = szn * fxn - sxn * fzn;
    const uz1 = sxn * fyn - syn * fxn;

    const e = this.elements;
    e[0] = sxn; e[4] = syn; e[8]  = szn;  e[12] = 0;
    e[1] = ux1; e[5] = uy1; e[9]  = uz1;  e[13] = 0;
    e[2] = -fxn; e[6] = -fyn; e[10] = -fzn; e[14] = 0;
    e[3] = 0;   e[7] = 0;   e[11] = 0;   e[15] = 1;

    this.translate(-ex, -ey, -ez);
    return this;
  }

  setPerspective(fov, aspect, near, far) {
    const e = this.elements;
    const f = 1.0 / Math.tan(fov * Math.PI / 360);
    const nf = 1 / (near - far);

    e[0] = f / aspect;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;

    e[4] = 0;
    e[5] = f;
    e[6] = 0;
    e[7] = 0;

    e[8] = 0;
    e[9] = 0;
    e[10] = (far + near) * nf;
    e[11] = -1;

    e[12] = 0;
    e[13] = 0;
    e[14] = (2 * far * near) * nf;
    e[15] = 0;
    return this;
  }

  multiplyVector3(v) {
    const e = this.elements;
    const p = v.elements;
    return new Vector3([
      p[0]*e[0] + p[1]*e[4] + p[2]*e[8] + e[12],
      p[0]*e[1] + p[1]*e[5] + p[2]*e[9] + e[13],
      p[0]*e[2] + p[1]*e[6] + p[2]*e[10] + e[14]
    ]);
  }
}
