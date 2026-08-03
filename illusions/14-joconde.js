/* n° 14 — La Joconde
 *
 * The recognisability test, run on the one face nobody needs introduced. If a
 * point cloud carries identity at all it carries this one; if it fails here the
 * medium is a medium for shapes, not for portraits.
 *
 * Public domain on every count — Leonardo died in 1519, Lisa Gherardini five
 * centuries ago — so nothing here needs anyone's permission.
 *
 * A painting gives only a front, so the back is sculpture rather than
 * reconstruction. What is modelled is what a viewer actually uses to name her,
 * and most of it is not the face: the centre-parted hair falling past the
 * shoulders, the veil, the pyramid of the bust. Then the high rounded forehead,
 * the missing eyebrows, the long straight nose and the small asymmetric mouth.
 *
 * The figure is assembled from four parts stacked on one axis — head, neck,
 * hair, bust — and lifted afterwards so the whole sits centred in frame.
 */
(function () {
  "use strict";

  var MAX = 900000;
  var forme = null;

  var A = 0.70, B = 1.0, C = 0.84;   // head half-width, half-height, half-depth
  var Y_COU = -0.92, Y_EPAULE = -1.46, Y_BAS = -2.95;
  var LEVE = 0.97;                   // recentres the figure vertically

  function g(d, s) { var t = d / s; return Math.exp(-t * t); }

  /* Her face, not a generic one: barely a brow, a long straight nose, heavy
     lids, and a small mouth lifted on one side. */
  function relief(x, y, out) {
    var d = 0, s = 0, v;

    var wn = 0.070 + 0.045 * g(y + 0.40, 0.10);
    if (y < 0.30) { v = 0.25 * g(x, wn) * g(y + 0.26, 0.28); d += v; s += v * 1.2; }

    // Their absence is one of the things people actually notice.
    v = 0.018 * g(y - 0.17, 0.070) * g(x, 0.38); d += v; s += v * 2.0;

    v = 0.058 * (g(x - 0.25, 0.145) * g(y - 0.01, 0.080) + g(x + 0.25, 0.145) * g(y - 0.01, 0.080));
    d -= v; s += v * 2.6;
    v = 0.040 * (g(x - 0.25, 0.078) * g(y + 0.01, 0.048) + g(x + 0.25, 0.078) * g(y + 0.01, 0.048));
    d += v; s += v * 3.6;

    // Full cheeks. The roundness is half the likeness.
    v = 0.052 * (g(x - 0.36, 0.21) * g(y + 0.26, 0.24) + g(x + 0.36, 0.21) * g(y + 0.26, 0.24));
    d += v; s += v * 1.2;

    v = 0.020 * g(x, 0.042) * g(y + 0.49, 0.055); d -= v; s += v * 2.2;

    // The mouth: small, closed, lifted a touch more on one side — the entire
    // reputation of the painting sits in that asymmetry.
    var yb = -0.60 + 0.022 * Math.tanh(x / 0.10);
    v = 0.050 * g(y - yb, 0.062) * g(x, 0.185); d += v; s += v * 3.0;
    v = 0.030 * g(y - yb, 0.017) * g(x, 0.17); d -= v; s += v * 4.2;

    v = 0.040 * g(y + 0.90, 0.13) * g(x, 0.20); d += v; s += v * 1.5;

    out[0] = d; out[1] = s;
  }

  function fuseau(y) {
    if (y > -0.10) return 1;
    var t = Math.min(1, (-0.10 - y) / 0.65);
    return 1 - 0.20 * t * t;     // a soft, rounded jaw
  }

  /* The hair hugs the skull, then falls and flares over the shoulders. */
  function rayonCheveux(y) {
    if (y > Y_COU) {
      var q = Math.min(1, Math.abs(y) / 1.03);
      return A * Math.sqrt(Math.max(0.02, 1 - q * q)) * 1.10 + 0.025;
    }
    return 0.28 + (Y_COU - y) * 0.30;
  }

  /* Half-width of the bust, widening into the shoulders. */
  function largeurBuste(y) {
    var t = (Y_EPAULE - y) / (Y_EPAULE - Y_BAS);
    return 0.46 + 0.86 * Math.sqrt(Math.max(0, t));
  }

  ILLUSIONS.push({
    id: "joconde",
    index: "N° 14",
    nom: "La Joconde",
    question: "Qui est-ce ?",
    duree: 13,
    params: [
      { id: "pts", nom: "Densité", min: 20, max: 900, val: 260, mult: 1000, suffixe: " pts" },
      { id: "cheveux", nom: "Chevelure", min: 10, max: 55, val: 32, div: 100 },
      { id: "buste", nom: "Buste", min: 5, max: 45, val: 24, div: 100 },
      { id: "raie", nom: "Raie", min: 8, max: 40, val: 21, div: 100 }
    ],

    init: function (env, p) {
      var partCheveux = p.cheveux / 100;
      var partBuste = p.buste / 100;
      var partCou = 0.05;
      // Half-angle of the opening the face shows through. Opened too far, the
      // hair retreats behind the head and reads as a column instead of framing.
      var raie = p.raie / 100 * Math.PI;
      var R = [0, 0];

      forme = new Forme(MAX);
      forme.construire(function (i, o) {
        var tirage = Math.random();

        // ---- hair: two curtains from the crown, past the neck, over the shoulders
        if (tirage < partCheveux) {
          var u = raie + Math.random() * (Math.PI * 2 - 2 * raie);
          var yh = 1.03 - Math.random() * 2.98;
          var rr = rayonCheveux(yh);
          rr *= 1 + 0.05 * Math.sin(yh * 7.5 + u * 2.0) + Forme.flou(0.055);
          o[0] = rr * Math.sin(u);
          o[1] = yh + LEVE;
          o[2] = rr * Math.cos(u) * 0.96;
          return yh > 0.70 ? 0.50 : 0.19;      // the veil catches more light
        }

        // ---- neck
        if (tirage < partCheveux + partCou) {
          var an = Math.random() * Math.PI * 2;
          var yn = Y_COU - Math.random() * (Y_COU - Y_EPAULE);
          var rn = 0.30 + (Y_COU - yn) * 0.14;
          o[0] = rn * Math.sin(an);
          o[1] = yn + LEVE;
          o[2] = rn * Math.cos(an) * 0.88;
          return 0.30;
        }

        // ---- bust: the pyramid the whole composition rests on
        if (tirage < partCheveux + partCou + partBuste) {
          var ab = Math.random() * Math.PI * 2;
          var yb2 = Y_EPAULE - Math.random() * (Y_EPAULE - Y_BAS);
          var wb = largeurBuste(yb2) * (1 + Forme.flou(0.03));
          o[0] = wb * Math.sin(ab);
          o[1] = yb2 + LEVE;
          o[2] = wb * 0.52 * Math.cos(ab);
          return 0.15;
        }

        // ---- the folded forearms. They carry more of the painting's identity
        //      than most of the face does: the pyramid closes on them.
        if (tirage < partCheveux + partCou + partBuste + 0.07) {
          var ta = Math.random() * 2 - 1;
          var ang2 = Math.random() * Math.PI * 2;
          var rb = 0.135 * (1 + Forme.flou(0.08));
          o[0] = ta * 0.78;
          o[1] = -2.42 + ta * ta * 0.12 + rb * Math.sin(ang2) + LEVE;
          o[2] = 0.40 - ta * ta * 0.10 + rb * Math.cos(ang2);
          return 0.34;
        }

        // ---- head, sampled against salience
        var cv = 0, sv, u2, nx = 0, ny = 0, nz = 0, t = 1, x = 0, y = 0, av = 0, sal = 0;
        for (var essai = 0; essai < 24; essai++) {
          cv = Math.random() * 2 - 1;
          sv = Math.sqrt(1 - cv * cv);
          u2 = Math.random() * Math.PI * 2;
          nx = sv * Math.sin(u2); ny = cv; nz = sv * Math.cos(u2);
          t = fuseau(ny);
          x = A * nx * t;
          y = B * ny;
          av = nz > 0 ? nz * nz : 0;
          relief(x, y, R);
          sal = R[1] * av;
          if (Math.random() < 0.12 + sal * 4.0) break;
        }

        var j = 0.005;
        o[0] = x + Forme.flou(j);
        o[1] = y + LEVE + Forme.flou(j);
        o[2] = C * nz * (0.55 + 0.45 * t) + R[0] * av + Forme.flou(j);
        return 0.26 + Math.min(0.70, sal * 3.4);
      }, Forme.rampe);
    },

    dessine: function (env, phase, p, cue) {
      forme.rendre(env, {
        n: p.pts * 1000,
        angle: phase * Math.PI * 2,
        inclinaison: 0.05,
        cue: cue,
        gain: 6.4 * 58 / p.pts,
        cadre: 0.97
      });
    }
  });
})();
