/* n° 09 — Nœud de trèfle
 *
 * Same subtraction as the ring, applied to a knot: orthographic projection, no
 * shading, no occlusion, brightness independent of depth. Which strand passes in
 * front is then undecidable, and the whole knot turns both ways.
 *
 * Building the tube needs a frame at every point of the curve, and parallel
 * transport does not close on itself after a full loop — it comes back rotated.
 * Left alone that leaves a visible seam where the highlight band jumps. The
 * residual twist is measured and spread evenly along the curve instead.
 */
(function () {
  "use strict";

  var PAS = 900;
  var MAX = 52000;
  var forme = null;

  function courbe(t, o) {
    o[0] = Math.sin(t) + 2 * Math.sin(2 * t);
    o[1] = Math.cos(t) - 2 * Math.cos(2 * t);
    o[2] = -Math.sin(3 * t);
  }
  function tangente(t, o) {
    o[0] = Math.cos(t) + 4 * Math.cos(2 * t);
    o[1] = -Math.sin(t) + 4 * Math.sin(2 * t);
    o[2] = -3 * Math.cos(3 * t);
  }
  function norme(v) {
    var d = Math.hypot(v[0], v[1], v[2]) || 1;
    v[0] /= d; v[1] /= d; v[2] /= d;
  }
  function croix(a, b, o) {
    o[0] = a[1] * b[2] - a[2] * b[1];
    o[1] = a[2] * b[0] - a[0] * b[2];
    o[2] = a[0] * b[1] - a[1] * b[0];
  }

  function reperes() {
    var P = [], N = [], B = [], T = [];
    var t = [0, 0, 0], p = [0, 0, 0], n = [0, 0, 0], b = [0, 0, 0];
    for (var i = 0; i < PAS; i++) {
      var u = i / PAS * Math.PI * 2;
      courbe(u, p); tangente(u, t); norme(t);
      P.push([p[0], p[1], p[2]]);
      T.push([t[0], t[1], t[2]]);
    }
    // Seed a normal perpendicular to the first tangent, then carry it along.
    var seed = Math.abs(T[0][2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    croix(T[0], seed, n); norme(n);
    N.push([n[0], n[1], n[2]]);
    for (var j = 1; j < PAS; j++) {
      var prev = N[j - 1], tj = T[j];
      var d = prev[0] * tj[0] + prev[1] * tj[1] + prev[2] * tj[2];
      var v = [prev[0] - d * tj[0], prev[1] - d * tj[1], prev[2] - d * tj[2]];
      norme(v);
      N.push(v);
    }
    // Holonomy: how far the transported normal has drifted after one full turn.
    var last = N[PAS - 1], first = N[0], t0 = T[0];
    croix(t0, first, b); norme(b);
    var ca = last[0] * first[0] + last[1] * first[1] + last[2] * first[2];
    var sa = last[0] * b[0] + last[1] * b[1] + last[2] * b[2];
    var derive = Math.atan2(sa, ca);
    for (var k = 0; k < PAS; k++) {
      var a = -derive * k / PAS;
      var tk = T[k], nk = N[k];
      croix(tk, nk, b); norme(b);
      var ck = Math.cos(a), sk = Math.sin(a);
      N[k] = [nk[0] * ck + b[0] * sk, nk[1] * ck + b[1] * sk, nk[2] * ck + b[2] * sk];
      croix(tk, N[k], b); norme(b);
      B.push([b[0], b[1], b[2]]);
    }
    return { P: P, N: N, B: B };
  }

  ILLUSIONS.push({
    id: "trefle",
    index: "N° 09",
    nom: "Nœud de trèfle",
    question: "Dans quel sens tourne ce nœud ?",
    duree: 11,
    params: [
      { id: "tube", nom: "Épaisseur", min: 20, max: 90, val: 52, div: 100 },
      { id: "pts", nom: "Densité", min: 12, max: 52, val: 38, mult: 1000, suffixe: " pts" }
    ],

    init: function (env, p) {
      var R = reperes();
      var tube = p.tube / 100;
      forme = new Forme(MAX);
      forme.construire(function (i, o) {
        var k = (Math.random() * PAS) | 0;
        var v = Math.random() * Math.PI * 2;
        var r = tube * (1 + Forme.flou(0.035));
        var cv = Math.cos(v) * r, sv = Math.sin(v) * r;
        var P = R.P[k], N = R.N[k], B = R.B[k];
        o[0] = P[0] + N[0] * cv + B[0] * sv;
        o[1] = P[1] + N[1] * cv + B[1] * sv;
        o[2] = P[2] + N[2] * cv + B[2] * sv;
        return (1 - Math.cos(v)) * 0.5;
      }, Forme.rampe);
    },

    dessine: function (env, phase, p, cue) {
      forme.rendre(env, {
        n: p.pts * 1000,
        angle: phase * Math.PI * 2,
        inclinaison: 0.42,
        cue: cue,
        gain: 5.4,
        cadre: 0.94
      });
    }
  });
})();
