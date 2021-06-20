function manyReturns() {
  var e4E = this.J72.e4yy(f4E);

  if (e4E === undefined) {
    e4E = e6E.f4yy(t4E, f4E);
    this.J72.O4yy(f4E, e4E);
  }

  var o4E;
  var r4E;

  if (e4E === undefined) {
    var K4E = e6E.w4yy(t4E);

    if (K4E !== null) {
      return Q4yy['\x73\x65\u0074'](K4E, f4E, S4E, O4E);
    }

    o4E = true;
    r4E = true;
  } else {
    o4E = '\u0076\u0061\u006c\x75\u0065' in e4E || '\u0077\x72\u0069\x74\u0061\u0062\x6c\u0065' in e4E;
    r4E = e4E.writable;
  }

  if (o4E) {
    if (!r4E) {
      return false;
    }

    var T4E = e6E.f4yy(O4E, f4E);

    if (T4E) {
      if (!T4E.writable) {
        return false;
      }

      if (this.g72 === O4E) {
        return this.r72(t4E, f4E, T4E, S4E);
      }

      O6E.value = S4E;
      return Q4yy.S4yy(O4E, f4E, O6E);
    }

    if (this.g72 === O4E) {
      return this.X72(t4E, f4E, S4E);
    }

    return Q4yy.S4yy(O4E, f4E, {
      value: S4E,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }

  var E4E = e4E['\u0073\x65\u0074'];

  if (!E4E) {
    return false;
  }

  e4E['\x73\u0065\x74'].call(O4E, S4E);
  return true;
}