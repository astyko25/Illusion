/* n° 12 — La tour Eiffel
 *
 * A recognisable object, spun without depth cues. Familiarity was the obvious
 * worry — a known shape usually locks a bistable percept onto its expected
 * reading — but it costs nothing here: the tower turns about its own vertical
 * axis, and both readings leave it standing. The prior about gravity has no
 * grip on the direction of rotation.
 *
 * The structure is built as a skeleton of segments rather than a surface: four
 * curved corner legs, lattice bracing across each face, the platform belts, the
 * four arches and the mast. Points are then drawn along the segments, weighted
 * by length so the density stays even. The same machinery takes any latticed
 * structure — a bridge, a pylon, a gantry.
 *
 * The profile follows the real dimensions, interpolated on the logarithm of the
 * half-width: the tower's silhouette is close to exponential, and interpolating
 * the width directly gives visibly straight legs.
 */
(function () {
  "use strict";

  var MAX = 46000;
  var ECHELLE = 150;          // metres per unit; the tower is centred on 150 m
  var forme = null;

  // (height, half-width) in metres, from the real structure
  var PROFIL = [[0, 62.5], [57, 35], [115, 20], [196, 13], [276, 8], [300, 6.2]];

  function demiLargeur(h) {
    if (h <= PROFIL[0][0]) return PROFIL[0][1];
    for (var i = 1; i < PROFIL.length; i++) {
      if (h <= PROFIL[i][0]) {
        var a = PROFIL[i - 1], b = PROFIL[i];
        var t = (h - a[0]) / (b[0] - a[0]);
        // Interpolating log(w) keeps the legs curved, as they are.
        return Math.exp(Math.log(a[1]) + (Math.log(b[1]) - Math.log(a[1])) * t);
      }
    }
    return PROFIL[PROFIL.length - 1][1];
  }

  var ETAGE1 = 57;
  var BAS = [0, 14, 28, 42, ETAGE1];
  var HAUT = [ETAGE1, 75, 95, 115, 140, 168, 196, 224, 252, 276, 290, 300];
  var PLATEFORMES = [57, 115, 276];

  // Half-size of one leg's own square section. Below the first platform the
  // tower is four independent lattice piers, each a truss in its own right —
  // modelling that span as a single cage is what turned the base to mush.
  function pile(h) { return 8.6 + (5.4 - 8.6) * (h / ETAGE1); }

  function construitSegments() {
    var S = [];
    function seg(ax, ay, az, bx, by, bz, r, t) {
      var dx = bx - ax, dy = by - ay, dz = bz - az;
      var L = Math.hypot(dx, dy, dz);
      if (L < 1e-6) return;
      S.push([ax, ay, az, dx, dy, dz, r, t, L]);
    }
    var SIGNES = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    function coins(h) {
      var w = demiLargeur(h);
      return SIGNES.map(function (s) { return [s[0] * w, h, s[1] * w]; });
    }
    // The four uprights of one pier, at height h.
    function montants(f, h) {
      var w = demiLargeur(h), q = pile(h), s = SIGNES[f];
      var cx = s[0] * w, cz = s[1] * w;
      return [[cx - q, h, cz - q], [cx + q, h, cz - q],
              [cx + q, h, cz + q], [cx - q, h, cz + q]];
    }

    // Lower third: four separate piers.
    for (var i = 0; i < BAS.length - 1; i++) {
      var b1 = BAS[i], b2 = BAS[i + 1];
      for (var f = 0; f < 4; f++) {
        var m1 = montants(f, b1), m2 = montants(f, b2);
        for (var k = 0; k < 4; k++) {
          var l = (k + 1) % 4;
          seg(m1[k][0], m1[k][1], m1[k][2], m2[k][0], m2[k][1], m2[k][2], 1.5, 0.9);
          seg(m1[k][0], m1[k][1], m1[k][2], m2[l][0], m2[l][1], m2[l][2], 0.6, 0.32);
          seg(m1[l][0], m1[l][1], m1[l][2], m2[k][0], m2[k][1], m2[k][2], 0.6, 0.32);
          seg(m2[k][0], m2[k][1], m2[k][2], m2[l][0], m2[l][1], m2[l][2], 0.7, 0.42);
        }
      }
    }

    // Above the first platform the four piers have merged into one cage.
    for (var j = 0; j < HAUT.length - 1; j++) {
      var h1 = HAUT[j], h2 = HAUT[j + 1];
      var c1 = coins(h1), c2 = coins(h2);
      for (var f2 = 0; f2 < 4; f2++) {
        var g = (f2 + 1) % 4;
        seg(c1[f2][0], c1[f2][1], c1[f2][2], c2[f2][0], c2[f2][1], c2[f2][2], 2.0, 0.92);
        seg(c1[f2][0], c1[f2][1], c1[f2][2], c2[g][0], c2[g][1], c2[g][2], 0.8, 0.34);
        seg(c1[g][0], c1[g][1], c1[g][2], c2[f2][0], c2[f2][1], c2[f2][2], 0.8, 0.34);
        seg(c2[f2][0], c2[f2][1], c2[f2][2], c2[g][0], c2[g][1], c2[g][2], 0.9, 0.48);
      }
    }

    // Platform belts: a few concentric rings with a little depth, so they read
    // as slabs rather than as one more tie.
    PLATEFORMES.forEach(function (h) {
      var w = demiLargeur(h);
      for (var k = 0; k < 4; k++) {
        var e = w * (1.02 + k * 0.075);
        var y = h + (k - 1.5) * 1.6;
        var pts = [[e, y, e], [-e, y, e], [-e, y, -e], [e, y, -e]];
        for (var f2 = 0; f2 < 4; f2++) {
          var g2 = (f2 + 1) % 4;
          seg(pts[f2][0], pts[f2][1], pts[f2][2], pts[g2][0], pts[g2][1], pts[g2][2], 1.5, 1.0);
        }
      }
    });

    // The four arches under the first platform: crown at the centre of each face.
    var hPied = 26, hCle = 50;
    var wArc = demiLargeur(hPied);
    for (var f3 = 0; f3 < 4; f3++) {
      var N = 16;
      for (var j = 0; j < N; j++) {
        var s0 = -1 + 2 * j / N, s1 = -1 + 2 * (j + 1) / N;
        var y0 = hCle - (hCle - hPied) * s0 * s0;
        var y1 = hCle - (hCle - hPied) * s1 * s1;
        var a = arcPoint(f3, s0, wArc, y0), b = arcPoint(f3, s1, wArc, y1);
        seg(a[0], a[1], a[2], b[0], b[1], b[2], 2.1, 0.88);
      }
    }

    // Mast above the top platform.
    for (var m = 0; m < 6; m++) {
      var ya = 300 + m * 4, yb = 300 + (m + 1) * 4;
      seg(0, ya, 0, 0, yb, 0, 1.4 - m * 0.16, 0.95);
    }

    return S;
  }

  function arcPoint(face, s, w, y) {
    // s runs across one face; the face plane is fixed at ±w on the other axis.
    var u = s * w;
    if (face === 0) return [u, y, w];
    if (face === 1) return [-w, y, u];
    if (face === 2) return [u, y, -w];
    return [w, y, u];
  }

  ILLUSIONS.push({
    id: "eiffel",
    index: "N° 12",
    nom: "La tour Eiffel",
    question: "Dans quel sens tourne la tour ?",
    duree: 12,
    params: [
      { id: "pts", nom: "Densité", min: 10, max: 46, val: 34, mult: 1000, suffixe: " pts" },
      { id: "grain", nom: "Grain", min: 2, max: 30, val: 9, div: 10 }
    ],

    init: function (env, p) {
      var S = construitSegments();
      // Length-weighted cumulative table: sampling segments uniformly would
      // crowd the short members and starve the long legs.
      var cum = new Float64Array(S.length);
      var total = 0;
      for (var i = 0; i < S.length; i++) { total += S[i][8]; cum[i] = total; }

      var grain = p.grain / 10;
      forme = new Forme(MAX);
      forme.construire(function (k, o) {
        var x = Math.random() * total;
        var lo = 0, hi = S.length - 1;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (cum[mid] < x) lo = mid + 1; else hi = mid; }
        var s = S[lo];
        var u = Math.random();
        var r = s[6] * grain;
        o[0] = (s[0] + s[3] * u + Forme.flou(r)) / ECHELLE;
        o[1] = (s[1] + s[4] * u + Forme.flou(r) - ECHELLE) / ECHELLE;
        o[2] = (s[2] + s[5] * u + Forme.flou(r)) / ECHELLE;
        return s[7];
      }, Forme.rampe);
    },

    dessine: function (env, phase, p, cue) {
      forme.rendre(env, {
        n: p.pts * 1000,
        angle: phase * Math.PI * 2,
        inclinaison: 0.10,
        cue: cue,
        gain: 5.0,
        cadre: 0.99
      });
    }
  });
})();
