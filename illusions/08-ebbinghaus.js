/* n° 08 — Ebbinghaus
 *
 * The two central discs are drawn from the same radius. Judged size is relative,
 * not absolute: a disc read against large neighbours is scaled down, one read
 * against small neighbours is scaled up.
 *
 * Three things decide how hard it hits, and a first pass here got all three
 * wrong:
 *
 *   - The two configurations belong side by side. Stacked, the eye compares them
 *     in two glances instead of one, and half the force is gone. They only fit
 *     across the frame once the satellites stop being oversized.
 *   - Inducer *distance* matters at least as much as inducer size — arguably
 *     more. The small satellites must sit closer to their target than the large
 *     ones do to theirs. Placing them further away, as the first pass did, works
 *     directly against the effect.
 *   - Satellites must read as a firm surround. Dim ones against a dark ground
 *     barely register, and a context that is not seen cannot scale anything.
 *
 * The proof is a slide, not a caliper: the satellites fade and the two discs
 * travel until they touch, under tangent lines. Continuous motion leaves no room
 * for "you resized one of them".
 */
(function () {
  "use strict";

  var CENTRE = "#3ddc84", SATELLITE = "#8a938e", FOND = "#07090a";

  function lisse(t) {
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    return t * t * (3 - 2 * t);
  }

  ILLUSIONS.push({
    id: "ebbinghaus",
    index: "N° 08",
    nom: "Ebbinghaus",
    question: "Quel disque vert est le plus grand ?",
    duree: 12,
    revele: { debut: 0.56, texte: "Rigoureusement le même rayon" },
    params: [
      { id: "rayon", nom: "Disques centraux", min: 50, max: 100, val: 77, div: 10 },
      { id: "grands", nom: "Grands satellites", min: 60, max: 130, val: 93, div: 10 },
      { id: "petits", nom: "Petits satellites", min: 15, max: 45, val: 26, div: 10 }
    ],

    dessine: function (env, phase, p, cue) {
      var ctx = env.ctx, W = env.W;
      var r = W * p.rayon / 1000;
      var rG = W * p.grands / 1000;
      var rP = W * p.petits / 1000;

      // The small satellites sit closer than the large ones. That gap ordering
      // is doing real work — reversing it flattens the illusion.
      var orbG = r + rG + W * 0.016;
      var orbP = r + rP + W * 0.010;
      var etendueG = orbG + rG, etendueP = orbP + rP;

      var ecart = etendueG + etendueP + W * 0.075;
      var xL = (W - (etendueG + ecart + etendueP)) / 2 + etendueG;
      var xR = xL + ecart;
      var y = env.cy;
      var ang = phase * Math.PI * 2;

      ctx.fillStyle = FOND;
      ctx.fillRect(0, 0, W, env.H);

      // Removing the context is the demonstration: with nothing left to scale
      // against, the two discs simply are what they are.
      var fade = 1 - Math.min(1, cue * 1.5);
      if (fade > 0.004) {
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = SATELLITE;
        [[xL, rG, 6, orbG, 1], [xR, rP, 10, orbP, -1]].forEach(function (q) {
          for (var i = 0; i < q[2]; i++) {
            var a = ang * q[4] * 0.3 + i * Math.PI * 2 / q[2];
            ctx.beginPath();
            ctx.arc(q[0] + q[3] * Math.cos(a), y + q[3] * Math.sin(a), q[1], 0, 6.2832);
            ctx.fill();
          }
        });
        ctx.restore();
      }

      // Slide the discs together once the surround is gone.
      var s = lisse((cue - 0.35) / 0.65);
      var cxL = xL + (W / 2 - r - 3 - xL) * s;
      var cxR = xR + (W / 2 + r + 3 - xR) * s;

      ctx.fillStyle = CENTRE;
      [cxL, cxR].forEach(function (cx) {
        ctx.beginPath();
        ctx.arc(cx, y, r, 0, 6.2832);
        ctx.fill();
      });

      // Tangent lines across both: equal diameter, shown rather than asserted.
      if (s > 0.02) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, s * 1.6);
        ctx.strokeStyle = "#c8ff6a";
        ctx.lineWidth = 3;
        var marge = r * 0.55;
        [y - r, y + r].forEach(function (yy) {
          ctx.beginPath();
          ctx.moveTo(cxL - r - marge, yy);
          ctx.lineTo(cxR + r + marge, yy);
          ctx.stroke();
        });
        ctx.restore();
      }
    }
  });
})();
