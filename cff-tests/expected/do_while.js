(function (s18, S18, D18) {
  for (; 2 !== 1;) {
    switch (2) {
      case 2:
        return {
          x6M: function f18(T18, j18, y18) {
            var M18 = [];
            var e18;
            var m18;
            var b18;
            var L18;
            var P18;
            var p18;
            var Q18;
            var Z18;
            e18 = 0;

            while (e18 < T18) {
              M18[e18] = [];
              e18 += 1;
            }

            m18 = 0;

            while (m18 < T18) {
              b18 = T18 - 1;

              while (b18 >= 0) {
                L18 = 0;
                P18 = 0;
                p18 = P18;
                p18 = P18;
                P18 = y18[L18];
                Q18 = P18 - p18;
                L18++;

                while (b18 >= P18) {
                  p18 = P18;
                  P18 = y18[L18];
                  Q18 = P18 - p18;
                  L18++;
                }

                Z18 = p18 + (b18 - p18 + j18 * m18) % Q18;
                M18[m18][Z18] = M18[b18];
                b18 -= 1;
              }

              m18 += 1;
            }

            return M18;
          }(s18, S18, D18)
        };
        break;
    }
  }
})(822, 6, [18, 822]);