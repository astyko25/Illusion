/* n° 01 — Anneau ambigu
 *
 * A torus whose axis of symmetry points at the viewer and which tumbles about
 * the vertical. Spinning a surface of revolution about its own axis instead
 * would leave the image invariant: only the grain would move, the silhouette
 * never, and there would be nothing to reverse.
 */
(function () {
  "use strict";

  var MAX = 60000;
  var cu = new Float32Array(MAX), su = new Float32Array(MAX);
  var cv = new Float32Array(MAX), sv = new Float32Array(MAX);
  var pr = new Float32Array(MAX), pg = new Float32Array(MAX), pb = new Float32Array(MAX);
  var col = [0, 0, 0], out = [0, 0, 0];

  function ramp(t, o) {
    var a;
    if (t < 0.55) {
      a = t / 0.55;
      o[0] = 0.44 + (0.30 - 0.44) * a;
      o[1] = 0.54 + (0.70 - 0.54) * a;
      o[2] = 0.48 + (0.46 - 0.48) * a;
    } else {
      a = (t - 0.55) / 0.45;
      o[0] = 0.30 + (0.45 - 0.30) * a;
      o[1] = 0.70 + (1.00 - 0.70) * a;
      o[2] = 0.46 + (0.40 - 0.46) * a;
    }
  }

  ILLUSIONS.push({
    id: "anneau",
    index: "N° 01",
    nom: "Anneau ambigu",
    question: "Pouvez-vous inverser le sens de rotation\u00a0?",
    duree: 9,
    params: [
      { id: "tube", nom: "Épaisseur", min: 15, max: 80, val: 43, div: 100 },
      { id: "pts", nom: "Densité", min: 10, max: 60, val: 34, mult: 1000, suffixe: " pts" }
    ],

    init: function () {
      for (var i = 0; i < MAX; i++) {
        var u = Math.random() * Math.PI * 2;
        var v = Math.random() * Math.PI * 2;
        var j = 1 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.03;
        cu[i] = Math.cos(u); su[i] = Math.sin(u);
        cv[i] = Math.cos(v) * j; sv[i] = Math.sin(v) * j;
        var t = (1 - Math.cos(v)) * 0.5;      // 1 on the face turned toward the hole
        var emit = 0.50 + t * t * 0.95;
        ramp(t, col);
        pr[i] = col[0] * emit; pg[i] = col[1] * emit; pb[i] = col[2] * emit;
      }
    },

    dessine: function (env, phase, p, cue) {
      var sp = env.splat;
      var SW = env.splatW, SH = env.splatH;
      sp.gain = 6;
      sp.setTint(0.38, 0.20);
      sp.begin();

      var tube = p.tube / 100;
      var n = p.pts * 1000;
      var span = 1 + tube;
      var scale = Math.min(SW, SH) / (2 * span) * 0.90;
      var ox = SW / 2, oy = SH / 2;
      var dens = 1 / (1 + tube);
      var ang = phase * Math.PI * 2;
      var C = Math.cos(ang), Sn = Math.sin(ang);

      for (var i = 0; i < n; i++) {
        var rho = 1 + tube * cv[i];
        var x = rho * cu[i];
        var y = rho * su[i];
        var z = tube * sv[i];
        var xr = x * C + z * Sn;
        z = z * C - x * Sn;

        // Torus area goes as (R + r·cos v); weighting the emission is equivalent
        // to sampling that density and stays correct as the tube resizes.
        var q = rho * dens;
        Splatter.cue(out, pr[i] * q, pg[i] * q, pb[i] * q, z / span, cue);
        sp.add(ox + xr * scale, oy - y * scale, out[0], out[1], out[2]);
      }

      sp.end();
      env.blit();
    }
  });
})();
