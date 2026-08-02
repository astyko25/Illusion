/* n° 08 — Ebbinghaus
 *
 * The two central discs are drawn from the same radius. Judged size is relative,
 * not absolute: a disc read against large neighbours is scaled down, one read
 * against small neighbours is scaled up.
 *
 * The two groups are stacked rather than set side by side. At a size where the
 * large satellites read as large, a horizontal pair simply does not fit across
 * 1080 px — the groups collide well before the frame edge. Portrait has the room
 * to spare vertically, so that is where it goes.
 *
 * The satellites rotate slowly. That motion touches nothing the illusion depends
 * on — the central discs never move or change size — but it keeps the frame
 * alive in a feed.
 */
(function () {
  "use strict";

  var CENTRE = "#3ddc84", SATELLITE = "#5e6d67", FOND = "#07090a";

  ILLUSIONS.push({
    id: "ebbinghaus",
    index: "N° 08",
    nom: "Ebbinghaus",
    question: "Quel disque vert est le plus grand ?",
    duree: 10,
    revele: { debut: 0.48, texte: "Rigoureusement le même rayon" },
    params: [
      { id: "rayon", nom: "Disques centraux", min: 50, max: 110, val: 78, div: 10 },
      { id: "grands", nom: "Grands satellites", min: 60, max: 120, val: 88, div: 10 },
      { id: "petits", nom: "Petits satellites", min: 20, max: 50, val: 32, div: 10 }
    ],

    dessine: function (env, phase, p, cue) {
      var ctx = env.ctx, W = env.W;
      var r = W * p.rayon / 1000;
      var rG = W * p.grands / 1000;
      var rP = W * p.petits / 1000;

      var orbG = r + rG + W * 0.015;
      var orbP = r + rP + W * 0.024;
      // Separation just clears both groups; anything less and they interlock.
      var d = (orbG + rG + orbP + rP + W * 0.028) / 2;
      var yG = env.cy - d, yP = env.cy + d;
      var cx = W / 2;
      var ang = phase * Math.PI * 2;

      ctx.fillStyle = FOND;
      ctx.fillRect(0, 0, W, env.H);

      // Fading the context out is the demonstration: with the satellites gone,
      // nothing is left to scale the discs against.
      ctx.save();
      ctx.globalAlpha = 1 - Math.min(1, cue * 1.35);
      ctx.fillStyle = SATELLITE;
      [[yG, rG, 6, orbG, 1], [yP, rP, 8, orbP, -1]].forEach(function (q) {
        for (var i = 0; i < q[2]; i++) {
          var a = ang * q[4] * 0.32 + i * Math.PI * 2 / q[2];
          ctx.beginPath();
          ctx.arc(cx + q[3] * Math.cos(a), q[0] + q[3] * Math.sin(a), q[1], 0, 6.2832);
          ctx.fill();
        }
      });
      ctx.restore();

      ctx.fillStyle = CENTRE;
      [yG, yP].forEach(function (y) {
        ctx.beginPath();
        ctx.arc(cx, y, r, 0, 6.2832);
        ctx.fill();
      });

      // A caliper of the true diameter on each, drawn identically.
      if (cue > 0.01) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, cue * 1.5);
        ctx.strokeStyle = "#c8ff6a";
        ctx.lineWidth = 4;
        var t = W * 0.019;
        [yG, yP].forEach(function (y) {
          var yb = y + r + W * 0.052;
          ctx.beginPath();
          ctx.moveTo(cx - r, yb - t); ctx.lineTo(cx - r, yb + t);
          ctx.moveTo(cx + r, yb - t); ctx.lineTo(cx + r, yb + t);
          ctx.moveTo(cx - r, yb); ctx.lineTo(cx + r, yb);
          ctx.stroke();
        });
        ctx.restore();
      }
    }
  });
})();
