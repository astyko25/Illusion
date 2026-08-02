/* n° 04 — Serpents tournants
 *
 * Kitaoka's peripheral drift. Nothing here moves: every pixel is identical from
 * the first frame to the last. The rotation is manufactured by the retina from
 * an asymmetric luminance sequence, which motion detectors read as a direction
 * of travel when the eye shifts across it.
 *
 * The construction follows the published recipe rather than an approximation of
 * it, because each departure measurably costs effect:
 *
 *   - The sequence is {noir, g1, blanc, g2} with g1 ≈ 20 % and g2 ≈ 60 % of
 *     linear luminance — the values measured off Kitaoka's own images. A first
 *     pass here used 8 % and 71 %, both outside the optimum. Reversing the
 *     sequence reverses the drift; making it symmetric abolishes it.
 *   - Tiles must be roughly square, so the number of units per ring grows with
 *     radius. A fixed count turns them into slivers at the centre and slabs at
 *     the rim.
 *   - Rings need a background clearly lighter than the black tiles, or the two
 *     merge and the sequence loses the step it depends on.
 *
 * There is deliberately no fixation marker. The effect is driven by
 * microsaccades and blinks, and on steady fixation it vanishes outright — a
 * target inviting the eye to settle is the one thing guaranteed to suppress it.
 * The instruction lives in the question instead.
 */
(function () {
  "use strict";

  // Linear luminance: 0 %, 20.4 %, 100 %, 61.1 %
  var NOIR = "#000000", BLEU = "#5a76de", BLANC = "#ffffff", JAUNE = "#edcb3f";
  var FOND = "#9a9a9a";       // 32 % — light enough to hold the rings apart

  function disque(ctx, cx, cy, rmax, bandes, sens) {
    var rmin = rmax * 0.15;
    var pas = (rmax - rmin) / bandes;
    var epais = pas * 0.92;                       // thin gap: the field stays dense

    for (var b = 0; b < bandes; b++) {
      var rin = rmin + b * pas;
      var rout = rin + epais;
      var rmid = (rin + rout) / 2;

      // Four tiles per unit, each about as wide as the ring is thick.
      var unites = Math.max(3, Math.round(Math.PI * 2 * rmid / (4 * epais)));
      var pasA = Math.PI * 2 / unites;

      var dir = ((b % 2 === 0) ? 1 : -1) * sens;
      var suite = dir > 0 ? [NOIR, BLEU, BLANC, JAUNE] : [NOIR, JAUNE, BLANC, BLEU];
      var decal = b * pasA * 0.37;                // stagger so rings read as separate snakes

      for (var s = 0; s < unites; s++) {
        for (var q = 0; q < 4; q++) {
          var a0 = decal + s * pasA + q * pasA / 4;
          var a1 = a0 + pasA / 4;
          ctx.fillStyle = suite[q];
          ctx.beginPath();
          ctx.arc(cx, cy, rout, a0, a1);
          ctx.arc(cx, cy, rin, a1, a0, true);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  ILLUSIONS.push({
    id: "serpents",
    index: "N° 04",
    nom: "Serpents tournants",
    question: "Rien ne bouge ici. Bougez les yeux.",
    duree: 8,
    statique: true,
    params: [
      { id: "anneaux", nom: "Anneaux", min: 3, max: 12, val: 7 },
      { id: "taille", nom: "Taille", min: 20, max: 50, val: 32, div: 100 }
    ],

    dessine: function (env, phase, p) {
      var ctx = env.ctx;
      var haut = env.safe.haut, bas = env.safe.bas, hauteur = bas - haut;

      ctx.fillStyle = FOND;
      ctx.fillRect(0, 0, env.W, env.H);

      // Discs on a loose grid, allowed to run past the edges. The effect lives in
      // peripheral vision, so covering the field matters more than showing each
      // disc whole — and on a phone a grid of small discs sits in the fovea,
      // where it does not work at all.
      var r = env.W * p.taille / 100;
      var pasX = r * 1.96, pasY = r * 1.96;
      var cols = Math.max(2, Math.round(env.W / pasX) + 1);
      var rangs = Math.max(2, Math.round(hauteur / pasY) + 1);

      for (var j = 0; j < rangs; j++) {
        for (var i = 0; i < cols; i++) {
          var cx = env.W / 2 + (i - (cols - 1) / 2) * pasX;
          var cy = haut + hauteur / 2 + (j - (rangs - 1) / 2) * pasY;
          disque(ctx, cx, cy, r, p.anneaux, ((i + j) % 2 ? -1 : 1));
        }
      }
    }
  });
})();
