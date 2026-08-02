/* n° 07 — Mur du café
 *
 * Every row of tiles is exactly horizontal and every row is exactly parallel to
 * the next. They read as wedges because of the mortar: a thin line whose
 * luminance sits *between* the two tile values. That intermediate line lets
 * small local contours at each tile corner tilt one way or the other, and the
 * visual system integrates those tilts into a slope across the whole row.
 *
 * Two parameters decide whether it fires, and both are easy to get wrong:
 * the mortar must be genuinely intermediate — pushed to black or to white the
 * illusion collapses outright — and it must be thin relative to the tiles.
 * The offset between successive rows sets the direction of the apparent slope.
 */
(function () {
  "use strict";

  var NOIR = "#0b0d0e", BLANC = "#eef2ef";

  ILLUSIONS.push({
    id: "cafe",
    index: "N° 07",
    nom: "Mur du café",
    question: "Ces lignes sont-elles parallèles ?",
    duree: 11,
    revele: { debut: 0.5, texte: "Parfaitement parallèles" },
    params: [
      { id: "rangs", nom: "Rangées", min: 6, max: 18, val: 11 },
      { id: "mortier", nom: "Mortier", min: 0, max: 100, val: 52, div: 100 },
      { id: "decalage", nom: "Décalage", min: 0, max: 50, val: 25, div: 100 }
    ],

    dessine: function (env, phase, p, cue) {
      var ctx = env.ctx;
      var haut = env.safe.haut, bas = env.safe.bas, hauteur = bas - haut;

      // Mortar tone. At 0 or 100 this becomes black or white and the illusion
      // disappears entirely — the slider is there to make that demonstrable.
      var m = Math.round(18 + p.mortier / 100 * 200);
      var mortier = "rgb(" + m + "," + m + "," + m + ")";

      ctx.fillStyle = mortier;
      ctx.fillRect(0, 0, env.W, env.H);

      var rangs = p.rangs;
      var h = hauteur / rangs;
      var epaisMortier = Math.max(2, h * 0.085);
      var w = h * 1.85;
      var lignes = [];

      for (var j = 0; j < rangs; j++) {
        var y = haut + j * h;
        // Successive rows shifted by a fraction of a tile. The tilt peaks near a
        // quarter tile and vanishes at zero and at a half — a half-tile offset is
        // just a chequerboard, with no illusion left at all.
        var dec = ((j % 2) ? p.decalage / 100 : 0) * w;
        lignes.push(y);
        var x0 = -w * 2 + dec;
        var i = 0;
        for (var x = x0; x < env.W + w; x += w, i++) {
          ctx.fillStyle = (i % 2) ? BLANC : NOIR;
          ctx.fillRect(x, y + epaisMortier / 2, w, h - epaisMortier);
        }
      }
      lignes.push(haut + rangs * h);

      // Proof: the mortar lines drawn as what they are — straight and parallel.
      if (cue > 0.01) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, cue * 1.5);
        ctx.strokeStyle = "#c8ff6a";
        ctx.lineWidth = Math.max(3, epaisMortier * 0.9);
        // Sweep in from the left so the eye follows a genuinely straight edge.
        var av = (phase - this.revele.debut) / (1 - this.revele.debut);
        av = Math.max(0, Math.min(1, av));
        var largeur = env.W * Math.min(1, av * 1.6);
        ctx.beginPath();
        for (var k = 0; k < lignes.length; k++) {
          ctx.moveTo(0, lignes[k]);
          ctx.lineTo(largeur, lignes[k]);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  });
})();
