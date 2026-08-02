/* n° 04 — Serpents tournants
 *
 * Kitaoka's peripheral drift. Nothing here moves: every pixel is identical from
 * the first frame to the last. The rotation is manufactured by the retina from
 * the asymmetric luminance step noir → bleu → blanc → jaune, which the motion
 * detectors of peripheral vision read as a direction of travel.
 *
 * Three construction details decide whether it fires at all, and getting the
 * colour sequence right is only the first:
 *
 *   - Tiles must be roughly square. A fixed unit count per ring turns them into
 *     slivers near the centre and slabs at the rim, and the drift dies. The
 *     count therefore grows with radius.
 *   - The gaps between rings must be clearly lighter than the black tiles. On a
 *     near-black ground they merge, the rings stop reading as separate snakes,
 *     and the luminance profile is corrupted exactly where it must be sharp.
 *   - The pattern has to be large. The effect lives in peripheral vision, so on
 *     a phone a grid of small discs sits almost entirely in the fovea, where it
 *     does not work. Better few and big, bleeding off the edges.
 *
 * The image must also stay rigorously still — any real motion would both mask
 * the effect and make the claim dishonest. The only animated element is a
 * fixation marker inviting the eye to move instead.
 */
(function () {
  "use strict";

  var NOIR = "#000000", BLEU = "#2f45b8", BLANC = "#ffffff", JAUNE = "#ffd91c";
  var FOND = "#6e7579";       // mid grey: separates the rings without lighting up the feed

  function disque(ctx, cx, cy, rmax, bandes, sens) {
    var rmin = rmax * 0.16;
    var pas = (rmax - rmin) / bandes;
    var epais = pas * 0.80;                       // the rest is background gap

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
    question: "Cette image est parfaitement immobile.",
    duree: 8,
    statique: true,
    params: [
      { id: "anneaux", nom: "Anneaux", min: 3, max: 10, val: 6 },
      { id: "taille", nom: "Taille", min: 24, max: 52, val: 38, div: 100 },
      { id: "guide", nom: "Point de fixation", min: 0, max: 1, val: 1, bool: true }
    ],

    dessine: function (env, phase, p) {
      var ctx = env.ctx;
      var haut = env.safe.haut, bas = env.safe.bas, hauteur = bas - haut;

      ctx.fillStyle = FOND;
      ctx.fillRect(0, 0, env.W, env.H);

      // Big discs on a loose grid, allowed to run past the edges. Coverage of
      // the periphery matters more than showing each disc whole.
      var r = env.W * p.taille / 100;
      var pasX = r * 1.94, pasY = r * 1.94;
      var cols = Math.max(2, Math.round(env.W / pasX) + 1);
      var rangs = Math.max(2, Math.round(hauteur / pasY));
      var centres = [];

      for (var j = 0; j < rangs; j++) {
        for (var i = 0; i < cols; i++) {
          var cx = env.W / 2 + (i - (cols - 1) / 2) * pasX;
          var cy = haut + hauteur / 2 + (j - (rangs - 1) / 2) * pasY;
          centres.push([cx, cy]);
          disque(ctx, cx, cy, r, p.anneaux, ((i + j) % 2 ? -1 : 1));
        }
      }

      // Saccade prompt. The illusion feeds on eye movement, so guiding the gaze
      // across the field strengthens it — without touching a pixel of the discs.
      if (p.guide) {
        var n = centres.length;
        var k = Math.floor(phase * n) % n;
        var c = centres[k];
        var pulse = 0.55 + 0.45 * Math.sin(phase * n * Math.PI * 2);
        var d = r * 0.05 * (1 + pulse * 0.35);
        ctx.save();
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(c[0] - d, c[1]); ctx.lineTo(c[0] + d, c[1]);
        ctx.moveTo(c[0], c[1] - d); ctx.lineTo(c[0], c[1] + d);
        ctx.stroke();
        ctx.strokeStyle = "#3ddc84";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
    }
  });
})();
