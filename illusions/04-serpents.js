/* n° 04 — Serpents tournants
 *
 * Kitaoka's peripheral drift. Nothing here moves: every pixel is identical from
 * the first frame to the last. The rotation is manufactured by the retina from
 * the asymmetric luminance step black → bleu → blanc → jaune, which the motion
 * detectors in peripheral vision read as a direction of travel.
 *
 * Because of that, the image must stay rigorously still — any real motion would
 * both mask the effect and make the claim dishonest. The only animated element
 * is a fixation marker that invites the eye to move instead.
 */
(function () {
  "use strict";

  var NOIR = "#000000", BLEU = "#3a4fc0", BLANC = "#ffffff", JAUNE = "#ffdc1e";
  var FOND = "#14181a";

  function disque(ctx, cx, cy, rmax, bandes, seg, sens) {
    var rmin = rmax * 0.20;
    var pas = (rmax - rmin) / bandes;
    for (var b = 0; b < bandes; b++) {
      var rin = rmin + b * pas;
      var rout = rin + pas * 0.86;                 // gap between snakes
      var dir = ((b % 2 === 0) ? 1 : -1) * sens;
      var suite = dir > 0 ? [NOIR, BLEU, BLANC, JAUNE] : [JAUNE, BLANC, BLEU, NOIR];
      var pasA = Math.PI * 2 / seg;
      var decal = b * pasA * 0.5;                  // stagger so bands read as snakes
      for (var s = 0; s < seg; s++) {
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
    ctx.fillStyle = BLANC;
    ctx.beginPath(); ctx.arc(cx, cy, rmin * 0.55, 0, 6.2832); ctx.fill();
  }

  ILLUSIONS.push({
    id: "serpents",
    index: "N° 04",
    nom: "Serpents tournants",
    question: "Cette image est parfaitement immobile.",
    duree: 8,
    statique: true,
    params: [
      { id: "bandes", nom: "Anneaux", min: 3, max: 9, val: 5 },
      { id: "seg", nom: "Segments", min: 8, max: 26, val: 16 },
      { id: "guide", nom: "Point de fixation", min: 0, max: 1, val: 1, bool: true }
    ],

    dessine: function (env, phase, p) {
      var ctx = env.ctx;
      var haut = env.safe.haut, bas = env.safe.bas;
      var hauteur = bas - haut;

      ctx.fillStyle = FOND;
      ctx.fillRect(0, 0, env.W, env.H);

      var cols = 2, rangs = 2;
      var r = Math.min(env.W / (cols * 2.25), hauteur / (rangs * 2.25));
      var gx = env.W / 2, gy = haut + hauteur / 2;
      var pasX = r * 2.12, pasY = r * 2.12;
      var centres = [];

      for (var j = 0; j < rangs; j++) {
        for (var i = 0; i < cols; i++) {
          var cx = gx + (i - (cols - 1) / 2) * pasX;
          var cy = gy + (j - (rangs - 1) / 2) * pasY;
          centres.push([cx, cy]);
          disque(ctx, cx, cy, r, p.bandes, p.seg, ((i + j) % 2 ? -1 : 1));
        }
      }

      // Saccade prompt. The illusion feeds on eye movement, so guiding the gaze
      // between discs strengthens it — without touching a single pixel of them.
      if (p.guide) {
        var n = centres.length;
        var k = Math.floor(phase * n) % n;
        var c = centres[k];
        var pulse = 0.55 + 0.45 * Math.sin(phase * n * Math.PI * 2);
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = "#3ddc84";
        ctx.lineWidth = 3;
        var d = r * 0.055 * (1 + pulse * 0.3);
        ctx.beginPath();
        ctx.moveTo(c[0] - d, c[1]); ctx.lineTo(c[0] + d, c[1]);
        ctx.moveTo(c[0], c[1] - d); ctx.lineTo(c[0], c[1] + d);
        ctx.stroke();
        ctx.restore();
      }
    }
  });
})();
