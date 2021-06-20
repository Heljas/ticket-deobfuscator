export class MurmurHash {
  private static mul32(m: number, n: number) {
    var nlo = n & 0xffff;
    var nhi = n - nlo;
    return (((nhi * m) | 0) + ((nlo * m) | 0)) | 0;
  }

  private static generate(data: string, length: number, seed: number) {
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;

    const roundedEnd = length & ~0x3;
    let h1 = seed;
    let k1 = 0;

    for (let i = 0; i < roundedEnd; i += 4) {
      let k1 =
        (data.charCodeAt(i) & 0xff) |
        ((data.charCodeAt(i + 1) & 0xff) << 8) |
        ((data.charCodeAt(i + 2) & 0xff) << 16) |
        ((data.charCodeAt(i + 3) & 0xff) << 24);

      k1 = this.mul32(k1, c1);
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17); // ROTL32(k1,15);
      k1 = this.mul32(k1, c2);

      h1 ^= k1;
      h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19); // ROTL32(h1,13);
      h1 = (h1 * 5 + 0xe6546b64) | 0;
    }

    k1 = 0;

    switch (length % 4) {
      case 3:
        k1 = (data.charCodeAt(roundedEnd + 2) & 0xff) << 16;
      // fallthrough
      case 2:
        k1 |= (data.charCodeAt(roundedEnd + 1) & 0xff) << 8;
      // fallthrough
      case 1:
        k1 |= data.charCodeAt(roundedEnd) & 0xff;
        k1 = this.mul32(k1, c1);
        k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17); // ROTL32(k1,15);
        k1 = this.mul32(k1, c2);
        h1 ^= k1;
    }

    // finalization
    h1 ^= length;

    // fmix(h1);
    h1 ^= h1 >>> 16;
    h1 = this.mul32(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = this.mul32(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;

    return h1;
  }

  public static generateFrom(data: string) {
    return this.generate(data, data.length, data.length);
  }
}
