/* n° 11 — Sphère de points
 *
 * The bare case. No shape at all to admire — the silhouette is a motionless
 * circle from beginning to end, and only the dots move. What is left is the
 * mechanism on its own: the near surface sweeps one way, the far surface the
 * other, and nothing says which is which.
 *
 * This is the canonical structure-from-motion stimulus of the perception
 * literature, and it belongs in the series as a control: if it lands as hard as
 * the knot, the appeal is the ambiguity itself. If it falls flat, what carries
 * the others is their form, and that changes what the page should be.
 *
 * Points are placed uniformly in area — sampling the polar angle directly would
 * pile them at the poles and hand the eye a landmark to track.
 */
(function () {
  "use strict";

  var MAX = 4000;
  var forme = null;

  ILLUSIONS.push({
    id: "sphere",
    index: "N° 11",
    nom: "Sphère de points",
    question: "La face avant part-elle à gauche ou à droite ?",
    duree: 9,
    params: [
      { id: "pts", nom: "Points", min: 3, max: 40, val: 16, mult: 100, suffixe: " pts" },
      { id: "taille", nom: "Taille des points", min: 10, max: 60, val: 28, div: 10 }
    ],

    init: function (env, p) {
      forme = new Forme(MAX);
      forme.construire(function (i, o) {
        // Uniform in area: cos of the polar angle is what must be uniform.
        var cz = Math.random() * 2 - 1;
        var s = Math.sqrt(1 - cz * cz);
        var th = Math.random() * Math.PI * 2;
        var r = 1;
        o[0] = r * s * Math.cos(th);
        o[1] = r * cz;
        o[2] = r * s * Math.sin(th);
        // Flat colour. Any ramp fixed to the surface would rotate with it and
        // hand the eye a landmark to track, which is the one thing that would
        // resolve the ambiguity.
        return 0.86;
      }, Forme.rampe);
    },

    dessine: function (env, phase, p, cue) {
      forme.rendre(env, {
        n: p.pts * 100,
        angle: phase * Math.PI * 2,
        inclinaison: 0,
        cue: cue,
        gain: 3.4,
        rayon: p.taille / 10,
        cadre: 0.88
      });
    }
  });
})();
