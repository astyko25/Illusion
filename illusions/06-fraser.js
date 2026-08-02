/* n° 06 — Spirale de Fraser
 *
 * There is no spiral. Every arc here is a closed concentric circle; the twist
 * comes from what each circle is *made of*. Each ring is a "twisted cord": short
 * black-and-white segments laid at a constant angle to the tangent. The visual
 * system integrates that local tilt along the contour and reads a continuous
 * inward drift that is not there.
 *
 * The chequered ground is not decoration — it supplies the competing local
 * orientation cues the effect feeds on. On a plain ground the twist weakens
 * sharply.
 *
 * Unlike the peripheral drift, this one is near universal and survives steady
 * fixation, which is what makes it safe for a feed.
 */
(function () {
  "use strict";

  var GRIS_A = "#5c6366", GRIS_B = "#868d90";
  var NOIR = "#0a0c0d", BLANC = "#f2f5f3";

  ILLUSIONS.push({
    id: "fraser",
    index: "N° 06",
    nom: "Spirale de Fraser",
    question: "Suivez une spirale du doigt.",
    duree: 11,
    revele: { debut: 0.5, texte: "Ce sont des cercles fermés" },
    params: [
      { id: "anneaux", nom: "Anneaux", min: 4, max: 12, val: 8 },
      { id: "biais", nom: "Biais des torons", min: 8, max: 42, val: 26 },
      { id: "damier", nom: "Fond damier", min: 0, max: 1, val: 1, bool: true }
    ],

    dessine: function (env, phase, p, cue) {
      var ctx = env.ctx, S = env.box;
      var cx = env.cx, cy = env.cy;
      var R = S * 0.47;

      ctx.save();

      // Chequered ground: the local orientation cues the illusion competes with.
      ctx.fillStyle = GRIS_A;
      ctx.fillRect(0, 0, env.W, env.H);
      if (p.damier) {
        var cote = R * 0.135;
        ctx.fillStyle = GRIS_B;
        for (var gy = 0; gy < Math.ceil(env.H / cote); gy++) {
          for (var gx = 0; gx < Math.ceil(env.W / cote); gx++) {
            if ((gx + gy) % 2) ctx.fillRect(gx * cote, gy * cote, cote + 1, cote + 1);
          }
        }
      }

      var n = p.anneaux;
      var r0 = R * 0.16;
      var dr = (R - r0) / n;
      var epais = dr * 0.62;
      var biais = p.biais * Math.PI / 180;

      for (var i = 0; i < n; i++) {
        var r = r0 + (i + 0.5) * dr;
        // Segment count chosen so the cord reads as a continuous twist rather
        // than a dashed ring.
        var seg = Math.max(12, Math.round(Math.PI * 2 * r / (epais * 1.35)));
        var pasA = Math.PI * 2 / seg;
        var L = r * pasA * 1.22;
        var decal = (i % 2) * pasA * 0.5;

        for (var k = 0; k < seg; k++) {
          var a = decal + k * pasA;
          var px = cx + r * Math.cos(a);
          var py = cy + r * Math.sin(a);
          // Tilt relative to the tangent — the whole illusion lives in this angle.
          var t = a + Math.PI / 2 + biais;
          var dx = Math.cos(t) * L / 2, dy = Math.sin(t) * L / 2;

          ctx.strokeStyle = (k % 2) ? NOIR : BLANC;
          ctx.lineWidth = epais;
          ctx.lineCap = "butt";
          ctx.beginPath();
          ctx.moveTo(px - dx, py - dy);
          ctx.lineTo(px + dx, py + dy);
          ctx.stroke();
        }
      }

      // Proof: draw one of the rings as what it actually is — a closed circle.
      if (cue > 0.01) {
        var idx = Math.floor(n * 0.62);
        var rr = r0 + (idx + 0.5) * dr;
        ctx.globalAlpha = Math.min(1, cue * 1.5);
        ctx.strokeStyle = "#c8ff6a";
        ctx.lineWidth = Math.max(4, epais * 0.30);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();

        // A marker running the full circumference and returning to its start,
        // which is the part that actually settles the argument.
        var av = (phase - this.revele.debut) / (1 - this.revele.debut);
        av = Math.max(0, Math.min(1, av));
        var am = -Math.PI / 2 + av * Math.PI * 2;
        ctx.fillStyle = "#c8ff6a";
        ctx.beginPath();
        ctx.arc(cx + rr * Math.cos(am), cy + rr * Math.sin(am), epais * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }
  });
})();
