function r0h(g0h, k0h, d0h) {
  var U2h = 2;
  for (; U2h !== 65;) {
    switch (U2h) {
      case 26:
        U2h = p0h ? 25 : 22;
        break;
      case 33:
        b0h |= (g0h[w2h[75]](H0h + 1) & 0xff) << 8;
        U2h = 32;
        break;
      case 50:
        a0h ^= a0h >>> 16;
        return a0h;
        break;
      case 17:
        b0h = P5h(b0h, q0h);
        U2h = 16;
        break;
      case 10:
        U2h = y0h < H0h ? 20 : 21;
        break;
      case 2:
        var R0h = typeof u5h !== w2h[54] && typeof u5h[w2h[55]] !== w2h[56];
        var i0h = 0xcc9e2d51,
          q0h = 0x1b873593;
        var b0h;
        var A0h;
        U2h = 3;
        break;
      case 34:
        b0h = (g0h[w2h[74]](H0h + 2) & 0xff) << 16;
        U2h = 33;
        break;
      case 42:
        U2h = !p0h ? 41 : 39;
        break;
      case 22:
        n6II(w2h[73]);
        U2h = 23;
        break;
      case 54:
        a0h = P5h(a0h, 0xc2b2ae35);
        U2h = 53;
        break;
      case 23:
        y0h += 4;
        U2h = 10;
        break;
      case 39:
        a0h ^= k0h;
        a0h ^= a0h >>> 16;
        a0h = P5h(a0h, 0x85ebca6b);
        a0h ^= a0h >>> 13;
        U2h = 54;
        break;
      case 8:
        A0h = u5h[w2h[60]][w2h[61]][w2h[62]](w2h[63]) !== -1;
        U2h = 7;
        break;
      case 12:
        H0h = H0h & ~0x3;
        U2h = 11;
        break;
      case 46:
        U2h = X2h === 1 ? 32 : 39;
        break;
      case 7:
        var p0h = A0h || typeof c7E === w2h[64] && !new u5h[w2h[65]](w2h[66])[w2h[67]](c7E);
        var a0h = d0h;
        U2h = 14;
        break;
      case 35:
        var X2h = k0h % 4;
        U2h = X2h === 3 ? 34 : 47;
        break;
      case 52:
        n6II(w2h[79]);
        U2h = 51;
        break;
      case 27:
        a0h ^= b0h;
        U2h = 26;
        break;
      case 21:
        b0h = 0;
        U2h = 35;
        break;
      case 47:
        U2h = X2h === 2 ? 33 : 46;
        break;
      case 15:
        b0h = b0h | 0x1ffff;
        U2h = 27;
        break;
      case 28:
        b0h = P5h(b0h, q0h);
        U2h = 44;
        break;
      case 11:
        var y0h = 0;
        U2h = 10;
        break;
      case 41:
        n6II(w2h[78]);
        U2h = 40;
        break;
      case 51:
        a0h ^= a0h >>> 13;
        U2h = 50;
        break;
      case 53:
        U2h = R0h ? 52 : 50;
        break;
      case 32:
        b0h |= g0h[w2h[76]](H0h) & 0xff;
        b0h = P5h(b0h, i0h);
        b0h = (b0h & 0x1ffff) << 15 | b0h >>> 17;
        U2h = 29;
        break;
      case 3:
        U2h = u5h[w2h[57]] ? 9 : 7;
        break;
      case 40:
        b0h = b0h << 32;
        U2h = 39;
        break;
      case 14:
        var H0h = k0h;
        U2h = 13;
        break;
      case 24:
        a0h = a0h * 5 + 0xe6546b64 | 0;
        U2h = 23;
        break;
      case 48:
        n6II(w2h[77]);
        U2h = 44;
        break;
      case 16:
        U2h = 0 ? 15 : 27;
        break;
      case 9:
        U2h = u5h[w2h[58]][w2h[59]] ? 8 : 7;
        break;
      case 25:
        a0h = (a0h & 0x7ffff) << 13 | a0h >>> 19;
        U2h = 24;
        break;
      case 29:
        U2h = !R0h ? 28 : 48;
        break;
      case 44:
        U2h = 1 ? 43 : 42;
        break;
      case 20:
        b0h = g0h[w2h[69]](y0h) & 0xff | (g0h[w2h[70]](y0h + 1) & 0xff) << 8 | (g0h[w2h[71]](y0h + 2) & 0xff) << 16 | (g0h[w2h[72]](y0h + 3) & 0xff) << 24;
        b0h = P5h(b0h, i0h);
        b0h = (b0h & 0x1ffff) << 15 | b0h >>> 17;
        U2h = 17;
        break;
      case 13:
        U2h = !R0h ? 12 : 45;
        break;
      case 45:
        n6II(w2h[68]);
        U2h = 11;
        break;
      case 43:
        a0h ^= b0h;
        U2h = 42;
        break;
    }
  }
}