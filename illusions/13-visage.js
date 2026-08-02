/* n° 13 — Le visage qui ne se détourne pas
 *
 * Every other form in this series is a fair coin: with the depth cues removed,
 * the two readings are equally weighted and the percept drifts between them. A
 * face is not a fair coin. The visual system holds a prior for faces so strong
 * that it will override the incoming geometry to keep one convex and pointed at
 * the viewer — the same prior that makes a hollow mask refuse to look hollow.
 *
 * So this one is expected to behave differently, and that difference is the
 * subject: as the head turns away, the percept tends to flip rather than follow,
 * and the face appears to keep facing you. It reverses instead of turning its
 * back.
 *
 * The head is procedural: a deformed ellipsoid displaced by a field of Gaussian
 * features. No photograph is involved and no real person is depicted — beyond
 * the obvious rights problem, a single 2D image carries no depth to recover.
 *
 * Coordinates: chin at y = -1, crown at y = +1, eye line at y = 0, +z toward the
 * viewer. Those are the proportions of an adult head.
 */
(function () {
  "use strict";

  var MAX = 60000;
  var forme = null;

  function g(d, s) { var t = d / s; return Math.exp(-t * t); }

  /* Writes the signed displacement into out[0] and, into out[1], how strongly
     the point belongs to a feature at all.
   *
   * That second number is what makes the head legible. A skull is convex and
   * unbroken, so a cloud spread evenly over it projects to a featureless egg —
   * unlike the torus or the knot, whose holes do the drawing. Points are
   * therefore concentrated and brightened where features live, and the sockets
   * count as much as the nose: what the eye reads is the presence of detail,
   * not its sign. */
  function relief(x, y, out, P) {
    var d = 0, s = 0, v;
    var ec = P.ecart;

    // Nose. The one feature that must survive at every angle — it is what gives
    // the turning head a profile, and the profile is what says "face".
    var wn = (0.075 + 0.055 * g(y + 0.38, 0.10)) * P.nezLarge;
    if (y < 0.26) { v = 0.27 * P.nez * g(x, wn) * g(y + 0.28, 0.24); d += v; s += v * 1.15; }

    // Brow ridge, dipping over the bridge.
    v = 0.055 * P.arcades * g(y - 0.16, 0.075) * g(x, 0.40) *
        (0.55 + 0.45 * Math.min(1, Math.abs(x) / 0.22));
    d += v; s += v * 2.6;

    // Eye sockets, each holding a globe.
    v = 0.075 * (g(x - ec, 0.14) * g(y, 0.085) + g(x + ec, 0.14) * g(y, 0.085));
    d -= v; s += v * 2.4;
    v = 0.048 * (g(x - ec, 0.072) * g(y, 0.052) + g(x + ec, 0.072) * g(y, 0.052));
    d += v; s += v * 3.4;

    // Cheekbones.
    v = 0.045 * P.pommettes *
        (g(x - 0.40, 0.18) * g(y + 0.22, 0.20) + g(x + 0.40, 0.18) * g(y + 0.22, 0.20));
    d += v; s += v * 1.3;

    // Philtrum, then the lips with their crease.
    v = 0.022 * g(x, 0.045) * g(y + 0.47, 0.055); d -= v; s += v * 2.2;
    v = 0.062 * P.levres * g(y + 0.60, 0.078 * P.levres) * g(x, 0.22); d += v; s += v * 2.8;
    v = 0.034 * g(y + 0.61, 0.020) * g(x, 0.20); d -= v; s += v * 4.0;

    // Chin.
    v = 0.05 * P.menton * g(y + 0.88, 0.12) * g(x, 0.18 * P.machoire); d += v; s += v * 1.6;

    out[0] = d;
    out[1] = s;
  }

  /* The face narrows into the jaw. The taper stops well above the chin: the
     ellipsoid is already closing there, and compounding the two gave a point
     instead of a jaw. A square jaw is simply less taper. */
  function fuseau(y, force) {
    if (y > -0.15) return 1;
    var t = Math.min(1, (-0.15 - y) / 0.60);
    return 1 - force * t * t;
  }

  ILLUSIONS.push({
    id: "visage",
    index: "N° 13",
    nom: "Le visage",
    question: "Ce visage vous tourne-t-il le dos ?",
    duree: 12,
    // Identity controls. Whether a point cloud can carry a *particular* face is
    // exactly what these are for: if the medium cannot separate a broad head
    // from a narrow one with a heavy brow, no likeness would survive it either.
    params: [
      { id: "pts", nom: "Densité", min: 15, max: 60, val: 55, mult: 1000, suffixe: " pts" },
      { id: "largeur", nom: "Largeur du crâne", min: 55, max: 85, val: 68, div: 100 },
      { id: "machoire", nom: "Mâchoire carrée", min: 0, max: 40, val: 22, div: 100 },
      { id: "nez", nom: "Nez", min: 40, max: 190, val: 100, div: 100 },
      { id: "arcades", nom: "Arcades", min: 0, max: 260, val: 100, div: 100 },
      { id: "levres", nom: "Lèvres", min: 30, max: 220, val: 100, div: 100 },
      { id: "ecart", nom: "Écartement des yeux", min: 18, max: 34, val: 26, div: 100 }
    ],

    init: function (env, p) {
      var A = p.largeur / 100, B = 1.0, C = 0.86;   // half width, height, depth
      var mach = 0.40 - p.machoire / 100;            // less taper = squarer jaw
      var P = {
        nez: p.nez / 100,
        nezLarge: 0.75 + (p.nez / 100) * 0.35,
        arcades: p.arcades / 100,
        levres: p.levres / 100,
        pommettes: 1,
        menton: 1,
        machoire: 0.8 + (p.machoire / 100) * 1.4,
        ecart: p.ecart / 100
      };
      var R = [0, 0];
      forme = new Forme(MAX);
      forme.construire(function (i, o) {
        if ((i % 40) === 0) {
          // Ears: flattened discs on the sides, set back from the eye line.
          var side = (i % 80) === 0 ? 1 : -1;
          var a = Math.random() * Math.PI * 2;
          var rr = Math.sqrt(Math.random());
          o[0] = side * (A * fuseau(0, mach) * 0.99 + Forme.flou(0.02));
          o[1] = 0.02 + rr * Math.cos(a) * 0.16;
          o[2] = -0.10 + rr * Math.sin(a) * 0.11;
          return 0.5;
        }

        // Rejection sampling against salience: the cloud is concentrated on the
        // features and the bare skull keeps only enough points to hold its
        // silhouette. Spread evenly, the head projects to a featureless egg.
        var cv = 0, sv, u, nx = 0, ny = 0, nz = 0, t = 1, x = 0, y = 0, av = 0, sal = 0;
        for (var essai = 0; essai < 24; essai++) {
          cv = Math.random() * 2 - 1;
          sv = Math.sqrt(1 - cv * cv);
          u = Math.random() * Math.PI * 2;
          nx = sv * Math.sin(u); ny = cv; nz = sv * Math.cos(u);
          t = fuseau(ny, mach);
          x = A * nx * t;
          y = B * ny;
          // Relief belongs to the front of the head, faded in with how squarely
          // the point faces forward.
          av = nz > 0 ? nz * nz : 0;
          relief(x, y, R, P);
          sal = R[1] * av;
          if (Math.random() < 0.13 + sal * 3.8) break;
        }

        var z = C * nz * (0.55 + 0.45 * t) + R[0] * av;
        var j = 0.005;
        o[0] = x + Forme.flou(j);
        o[1] = y + Forme.flou(j);
        o[2] = z + Forme.flou(j);

        // Features glow; the skull stays dim. Fixed to the surface, so it turns
        // with the head and gives away no depth.
        return 0.24 + Math.min(0.70, sal * 3.4);
      }, Forme.rampe);
    },

    dessine: function (env, phase, p, cue) {
      forme.rendre(env, {
        n: p.pts * 1000,
        angle: phase * Math.PI * 2,
        inclinaison: 0.06,
        cue: cue,
        gain: 7.2,
        cadre: 0.9
      });
    }
  });
})();
