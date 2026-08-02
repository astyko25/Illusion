/* n° 05 — Damier d'Adelson
 *
 * Two squares carrying byte-for-byte the same grey. The visual system does not
 * report the light arriving at the eye, it reports its best guess at the surface
 * underneath — so a light square explained away by a shadow is read as light,
 * and a dark square in the open is read as dark.
 *
 * The values are derived, not eyeballed: the shadow multiplier is exactly
 * SOMBRE / CLAIR, which forces the two patches to land on the same number.
 */
(function () {
  "use strict";

  var CLAIR = 185, SOMBRE = 120;
  var OMBRE = SOMBRE / CLAIR;          // makes clair-in-shadow == sombre-in-light
  var UC = 6.2, VC = 5.6;              // cylinder foot, in board coordinates
  var PENTE = 0.55, DEMI = 1.9;        // shadow direction and half width

  function ombrage(u, v) {
    if (v > VC + 0.25) return 1;
    var s = Math.abs((u - UC) - PENTE * (v - VC));
    if (s > DEMI) return 1;
    var t = s < DEMI - 0.45 ? 0 : (s - (DEMI - 0.45)) / 0.45;
    return OMBRE + (1 - OMBRE) * t * t;
  }

  function gris(v) { var n = Math.round(v); return "rgb(" + n + "," + n + "," + n + ")"; }

  ILLUSIONS.push({
    id: "damier",
    index: "N° 05",
    nom: "Damier d'Adelson",
    question: "Les cases A et B sont-elles du même gris\u00a0?",
    duree: 10,
    revele: { debut: 0.5, texte: "Oui. Exactement la même valeur." },
    params: [
      { id: "cyl", nom: "Cylindre", min: 0, max: 1, val: 1, bool: true },
      { id: "perspective", nom: "Fuite", min: 20, max: 70, val: 44, div: 100 }
    ],

    init: function () {
      // Pick the pair from the board itself rather than trusting hardcoded
      // indices to survive a change of shadow geometry.
      this.A = null; this.B = null;
      for (var v = 0; v < 8 && !this.A; v++)
        for (var u = 0; u < 8 && !this.A; u++)
          if ((u + v) % 2 === 1 && ombrage(u + 0.5, v + 0.5) === 1 && u < UC - DEMI - 1.2 && v >= 2)
            this.A = [u, v];
      for (var v2 = 7; v2 >= 0 && !this.B; v2--)
        for (var u2 = 0; u2 < 8 && !this.B; u2++)
          if ((u2 + v2) % 2 === 0 && ombrage(u2 + 0.5, v2 + 0.5) === OMBRE && v2 <= VC - 1)
            this.B = [u2, v2];
    },

    dessine: function (env, phase, p, cue) {
      var ctx = env.ctx;
      var haut = env.safe.haut, bas = env.safe.bas;
      var hauteur = bas - haut;

      ctx.fillStyle = "#0c0f10";
      ctx.fillRect(0, 0, env.W, env.H);

      var yNear = haut + hauteur * 0.90, yFar = haut + hauteur * 0.30;
      var wNear = env.W * 0.47, wFar = env.W * 0.47 * p.perspective / 100;
      var cx = env.W / 2;

      function proj(u, v) {
        var t = v / 8;
        var hw = wNear + (wFar - wNear) * t;
        return [cx + (u / 8 - 0.5) * 2 * hw, yNear + (yFar - yNear) * t];
      }

      for (var v = 0; v < 8; v++) {
        for (var u = 0; u < 8; u++) {
          var base = ((u + v) % 2 === 0) ? CLAIR : SOMBRE;
          var a = proj(u, v), b = proj(u + 1, v), c = proj(u + 1, v + 1), d = proj(u, v + 1);
          ctx.fillStyle = gris(base * ombrage(u + 0.5, v + 0.5));
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
          ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]);
          ctx.closePath(); ctx.fill();
        }
      }

      function centre(sq) {
        var a = proj(sq[0], sq[1]), c = proj(sq[0] + 1, sq[1] + 1);
        return [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
      }
      var cA = centre(this.A), cB = centre(this.B);

      if (p.cyl) {
        var pied = proj(UC, VC);
        var h = hauteur * 0.30, rx = env.W * 0.052, ry = rx * 0.30;
        var g = ctx.createLinearGradient(pied[0] - rx, 0, pied[0] + rx, 0);
        g.addColorStop(0, "#2f4438"); g.addColorStop(0.45, "#5f8a70"); g.addColorStop(1, "#26382e");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(pied[0] - rx, pied[1] - h);
        ctx.lineTo(pied[0] + rx, pied[1] - h);
        ctx.lineTo(pied[0] + rx, pied[1]);
        ctx.ellipse(pied[0], pied[1], rx, ry, 0, 0, Math.PI);
        ctx.lineTo(pied[0] - rx, pied[1]);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#7ba98a";
        ctx.beginPath();
        ctx.ellipse(pied[0], pied[1] - h, rx, ry, 0, 0, 6.2832);
        ctx.fill();
      }

      // Proof: one bar of the shared value bridging both squares. It merges with
      // each end, which is the only demonstration that actually convinces.
      if (cue > 0.01) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, cue * 1.5);
        ctx.fillStyle = gris(SOMBRE);
        var wBar = Math.abs(proj(1, this.A[1])[0] - proj(0, this.A[1])[0]) * 0.34;
        ctx.beginPath();
        ctx.moveTo(cA[0] - wBar, cA[1]); ctx.lineTo(cA[0] + wBar, cA[1]);
        ctx.lineTo(cB[0] + wBar, cB[1]); ctx.lineTo(cB[0] - wBar, cB[1]);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.font = "800 " + Math.round(env.W * 0.05) + "px Archivo, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      [[cA, "A"], [cB, "B"]].forEach(function (pair) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillText(pair[1], pair[0][0] + 3, pair[0][1] + 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(pair[1], pair[0][0], pair[0][1]);
      });
      ctx.restore();
    }
  });
})();
