/* n° 10 — Ruban de Möbius
 *
 * A surface with one side and one edge, spun without depth cues so it is also a
 * surface with no determinable direction of rotation.
 *
 * Colour runs on |v|, the *unsigned* distance from the centre line. Signing it
 * would be the obvious choice and it is wrong: after one turn the strip comes
 * back with v inverted, so a signed ramp tears open at the seam. The unsigned
 * one closes cleanly and, as it happens, draws the single edge — which is the
 * property worth showing.
 */
(function () {
  "use strict";

  var MAX = 52000;
  var forme = null;

  ILLUSIONS.push({
    id: "mobius",
    index: "N° 10",
    nom: "Ruban de Möbius",
    question: "Dans quel sens tourne ce ruban ?",
    duree: 11,
    params: [
      { id: "large", nom: "Largeur", min: 15, max: 60, val: 38, div: 100 },
      { id: "torsions", nom: "Demi-torsions", min: 1, max: 5, val: 1 },
      { id: "pts", nom: "Densité", min: 12, max: 52, val: 38, mult: 1000, suffixe: " pts" }
    ],

    init: function (env, p) {
      var w = p.large / 100;
      var k = p.torsions;
      forme = new Forme(MAX);
      forme.construire(function (i, o) {
        var u = Math.random() * Math.PI * 2;
        var v = (Math.random() * 2 - 1) * (1 + Forme.flou(0.02));
        var d = v * w;
        var demi = k * u / 2;
        var rayon = 1 + d * Math.cos(demi);
        o[0] = rayon * Math.cos(u);
        o[1] = rayon * Math.sin(u);
        o[2] = d * Math.sin(demi);
        // Unsigned: the strip returns with v flipped, so a signed ramp would tear.
        return Math.min(1, Math.abs(v));
      }, Forme.rampe);
    },

    dessine: function (env, phase, p, cue) {
      forme.rendre(env, {
        n: p.pts * 1000,
        angle: phase * Math.PI * 2,
        inclinaison: 0.5,
        cue: cue,
        gain: 5.6,
        cadre: 0.9
      });
    }
  });
})();
