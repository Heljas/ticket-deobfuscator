function r0h(g0h, k0h, d0h) {
  var R0h = typeof u5h !== w2h[54] && typeof u5h[w2h[55]] !== w2h[56];
  var b0h;
  var A0h;

  if (u5h[w2h[57]]) {
    if (u5h[w2h[58]][w2h[59]]) {
      A0h = u5h[w2h[60]][w2h[61]][w2h[62]](w2h[63]) !== -1;
    }
  }

  var p0h = A0h || typeof c7E === w2h[64] && !new u5h[w2h[65]](w2h[66])[w2h[67]](c7E);
  var a0h = d0h;
  var H0h = k0h;

  if (!R0h) {
    H0h = H0h & ~0x3;
  } else {
    n6II(w2h[68]);
  }

  var y0h = 0;

  while (y0h < H0h) {
    b0h = g0h[w2h[69]](y0h) & 0xff | (g0h[w2h[70]](y0h + 1) & 0xff) << 8 | (g0h[w2h[71]](y0h + 2) & 0xff) << 16 | (g0h[w2h[72]](y0h + 3) & 0xff) << 24;
    b0h = P5h(b0h, 0xcc9e2d51);
    b0h = (b0h & 0x1ffff) << 15 | b0h >>> 17;
    b0h = P5h(b0h, 0x1b873593);

    if (0) {
      b0h = b0h | 0x1ffff;
    }

    a0h ^= b0h;

    if (p0h) {
      a0h = (a0h & 0x7ffff) << 13 | a0h >>> 19;
      a0h = a0h * 5 + 0xe6546b64 | 0;
    } else {
      n6II(w2h[73]);
    }

    y0h += 4;
  }

  b0h = 0;
  var X2h = k0h % 4;

  if (X2h === 3) {
    b0h = (g0h[w2h[74]](H0h + 2) & 0xff) << 16;
    b0h |= (g0h[w2h[75]](H0h + 1) & 0xff) << 8;
    b0h |= g0h[w2h[76]](H0h) & 0xff;
    b0h = P5h(b0h, 0xcc9e2d51);
    b0h = (b0h & 0x1ffff) << 15 | b0h >>> 17;

    if (!R0h) {
      b0h = P5h(b0h, 0x1b873593);
    } else {
      n6II(w2h[77]);
    }

    if (1) {
      a0h ^= b0h;
    }

    if (!p0h) {
      n6II(w2h[78]);
      b0h = b0h << 32;
    }
  } else {
    if (X2h === 2) {
      b0h |= (g0h[w2h[75]](H0h + 1) & 0xff) << 8;
      b0h |= g0h[w2h[76]](H0h) & 0xff;
      b0h = P5h(b0h, 0xcc9e2d51);
      b0h = (b0h & 0x1ffff) << 15 | b0h >>> 17;

      if (!R0h) {
        b0h = P5h(b0h, 0x1b873593);
      } else {
        n6II(w2h[77]);
      }

      if (1) {
        a0h ^= b0h;
      }

      if (!p0h) {
        n6II(w2h[78]);
        b0h = b0h << 32;
      }
    } else {
      if (X2h === 1) {
        b0h |= g0h[w2h[76]](H0h) & 0xff;
        b0h = P5h(b0h, 0xcc9e2d51);
        b0h = (b0h & 0x1ffff) << 15 | b0h >>> 17;

        if (!R0h) {
          b0h = P5h(b0h, 0x1b873593);
        } else {
          n6II(w2h[77]);
        }

        if (1) {
          a0h ^= b0h;
        }

        if (!p0h) {
          n6II(w2h[78]);
          b0h = b0h << 32;
        }
      }
    }
  }

  a0h ^= k0h;
  a0h ^= a0h >>> 16;
  a0h = P5h(a0h, 0x85ebca6b);
  a0h ^= a0h >>> 13;
  a0h = P5h(a0h, 0xc2b2ae35);

  if (R0h) {
    n6II(w2h[79]);
    a0h ^= a0h >>> 13;
  }

  a0h ^= a0h >>> 16;
  return a0h;
}