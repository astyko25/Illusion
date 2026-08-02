/* n° 03 — Cube de Necker
 *
 * The oldest bistable figure there is, drawn here as filaments of points rather
 * than lines so it sits in the same family as the rest of the feed.
 *
 * Every edge is rendered at the same weight and brightness, which is the whole
 * trick: with no edge hidden and none emphasised, either face can be the front
 * one. Rotating it adds a second ambiguity on top of the first.
 */
(function () {
  "use strict";

  var MAX = 42000;
  var ex = new Float32Array(MAX), ey = new Float32Array(MAX), ez = new Float32Array(MAX);
  var em = new Float32Array(MAX);
  var out = [0, 0, 0];

  var V = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
  ];
  var E = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  ILLUSIONS.push({
    id: "necker",
    index: "N° 03",
    nom: "Cube de Necker",
    question: "Quelle face est devant\u00a0?",
    duree: 10,
    params: [
      { id: "pts", nom: "Densité", min: 8, max: 42, val: 26, mult: 1000, suffixe: " pts" },
      { id: "grain", nom: "Grain", min: 2, max: 40, val: 14, div: 1000 }
    ],

    init: function (env, p) {
      var fuzz = p.grain / 1000;
      for (var i = 0; i < MAX; i++) {
        var e = E[(Math.random() * 12) | 0];
        var a = V[e[0]], b = V[e[1]];
        var t = Math.random();
        var j = function () {
          return (Math.random() + Math.random() + Math.random() - 1.5) * fuzz * 2;
        };
        ex[i] = a[0] + (b[0] - a[0]) * t + j();
        ey[i] = a[1] + (b[1] - a[1]) * t + j();
        ez[i] = a[2] + (b[2] - a[2]) * t + j();
        // Corners read as slightly denser knots, which is what makes a wireframe
        // legible without ever hiding an edge.
        var d = Math.min(t, 1 - t);
        em[i] = 0.62 + 0.5 * Math.exp(-d * 9);
      }
    },

    dessine: function (env, phase, p, cue) {
      var sp = env.splat;
      var SW = env.splatW, SH = env.splatH;
      sp.gain = 5.2;
      sp.setTint(0.30, 0.16);
      sp.begin();

      var n = p.pts * 1000;
      var ang = phase * Math.PI * 2;
      var C = Math.cos(ang), Sn = Math.sin(ang);
      // A fixed tilt so we look slightly down on the cube, as the figure is
      // classically drawn. Applied after the spin, never animated.
      var TX = 0.34, cx2 = Math.cos(TX), sx2 = Math.sin(TX);
      var span = 1.9;
      var scale = Math.min(SW, SH) / (2 * span) * 0.92;
      var ox = SW / 2, oy = SH / 2;

      for (var i = 0; i < n; i++) {
        var x = ex[i], y = ey[i], z = ez[i];
        var xr = x * C + z * Sn;
        var zr = z * C - x * Sn;
        var yr = y * cx2 - zr * sx2;
        zr = y * sx2 + zr * cx2;

        var m = em[i];
        Splatter.cue(out, 0.30 * m, 0.86 * m, 0.52 * m, zr / span, cue);
        sp.add(ox + xr * scale, oy - yr * scale, out[0], out[1], out[2]);
      }

      sp.end();
      env.blit();
    }
  });
})();
