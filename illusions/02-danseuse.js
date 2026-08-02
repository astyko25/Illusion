/* n° 02 — Silhouette tournante
 *
 * The same subtraction as the ring, applied to a body: a flat fill carries no
 * shading, no occlusion and no perspective, so the raised leg can be sweeping
 * in front of the figure or behind it. Nothing in the image decides.
 *
 * Drawn solid rather than speckled on purpose — a silhouette that shows its own
 * interior stops being a silhouette.
 */
(function () {
  "use strict";

  // Figure normalised to roughly one unit tall, y up, z toward the viewer.
  var J = {
    piedA:   [ 0.00, 0.02,  0.04], chevA: [ 0.00, 0.06, 0.00],
    genouA:  [ 0.01, 0.28,  0.00], hancA: [ 0.02, 0.52, 0.00],
    bassin:  [ 0.00, 0.53,  0.00], poitr: [ 0.00, 0.72, 0.00],
    epaules: [ 0.00, 0.78,  0.00], cou:   [ 0.00, 0.815, 0.00],
    tete:    [ 0.00, 0.876, 0.00],
    // Limbs carry real depth. Laid flat in a single plane they would all
    // foreshorten at the same instant and the silhouette would collapse to a
    // column twice per turn; staggered in z, something is always broadside.
    hancB:   [ 0.03, 0.52,  0.00], genouB:[ 0.22, 0.575, 0.14],
    piedB:   [ 0.38, 0.70,  0.27], orteil:[ 0.43, 0.756, 0.31],
    // Hands held wide of the skull: brought in close they cross the head at some
    // angles and the silhouette grows a hood.
    epG:     [-0.10, 0.775, 0.00], coudeG:[-0.26, 0.855, 0.09],
    mainG:   [-0.25, 1.005, 0.12],
    epD:     [ 0.10, 0.775, 0.00], coudeD:[ 0.26, 0.845,-0.08],
    mainD:   [ 0.23, 0.995,-0.10]
  };

  var JAMBE = { genouB: 1, piedB: 1, orteil: 1 };

  var OS = [
    ["piedA", "chevA", 0.030, 0.026], ["chevA", "genouA", 0.028, 0.038],
    ["genouA", "hancA", 0.038, 0.048], ["bassin", "poitr", 0.062, 0.064],
    ["poitr", "epaules", 0.064, 0.052], ["epaules", "cou", 0.040, 0.024],
    ["hancB", "genouB", 0.046, 0.034], ["genouB", "piedB", 0.034, 0.023],
    ["piedB", "orteil", 0.023, 0.013],
    ["epG", "coudeG", 0.037, 0.027], ["coudeG", "mainG", 0.027, 0.019],
    ["epD", "coudeD", 0.037, 0.027], ["coudeD", "mainD", 0.027, 0.019]
  ];

  var TETE = 0.059;

  function capsule(ctx, ax, ay, ra, bx, by, rb) {
    var dx = bx - ax, dy = by - ay;
    var len = Math.hypot(dx, dy);
    if (len > 1e-4) {
      var nx = -dy / len, ny = dx / len;
      ctx.beginPath();
      ctx.moveTo(ax + nx * ra, ay + ny * ra);
      ctx.lineTo(bx + nx * rb, by + ny * rb);
      ctx.lineTo(bx - nx * rb, by - ny * rb);
      ctx.lineTo(ax - nx * ra, ay - ny * ra);
      ctx.fill();
    }
    ctx.beginPath(); ctx.arc(ax, ay, ra, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(bx, by, rb, 0, 6.2832); ctx.fill();
  }

  ILLUSIONS.push({
    id: "danseuse",
    index: "N° 02",
    nom: "Silhouette tournante",
    question: "Dans quel sens tourne-t-elle\u00a0?",
    duree: 6,
    params: [
      { id: "jambe", nom: "Jambe levée", min: 0, max: 100, val: 62, div: 100 },
      { id: "lueur", nom: "Halo", min: 0, max: 100, val: 45, div: 100 }
    ],

    dessine: function (env, phase, p, cue) {
      var ctx = env.ctx, S = env.box;
      var scale = S * 0.90, o = S / 2;
      var ox = env.cx, oy = env.cy;
      var ang = phase * Math.PI * 2;
      var C = Math.cos(ang), Sn = Math.sin(ang);

      // The raised leg is what carries the ambiguity: the further it reaches
      // from the axis, the larger the sweep and the stronger the flip.
      var reach = 0.35 + p.jambe / 100 * 0.85;
      var proj = {};
      for (var k in J) {
        var v = J[k];
        var x = v[0], y = v[1], z = v[2];
        // Extend the leg along its own azimuth so reach lengthens it without
        // swinging it back into the plane of the body.
        if (JAMBE[k]) { x *= reach; z *= reach; }
        proj[k] = [x * C + z * Sn, y, z * C - x * Sn];
      }

      function sx(q) { return ox + q[0] * scale; }
      function sy(q) { return oy - (q[1] - 0.48) * scale; }

      ctx.save();
      if (p.lueur > 0) {
        ctx.shadowColor = "rgba(61,220,132," + (0.55 * p.lueur / 100).toFixed(3) + ")";
        ctx.shadowBlur = S * 0.05 * p.lueur / 100;
      }

      function teinte(z) {
        // Flat fill by default. Under the cue the receding limbs go cool and dim,
        // which is the only thing that can decide the direction.
        if (cue <= 0) return "#3ddc84";
        var f = 0.5 + Math.max(-1, Math.min(1, z / 0.55)) * 0.5;
        var m = 1 - cue * (1 - (0.22 + 0.78 * f * f));
        var r = Math.round((61 * (1 - cue * (1 - f)) + 40 * cue * (1 - f)) * m);
        var g = Math.round(220 * m);
        var b = Math.round((132 + 110 * cue * (1 - f)) * m);
        return "rgb(" + r + "," + g + "," + b + ")";
      }

      OS.forEach(function (bone) {
        var a = proj[bone[0]], b = proj[bone[1]];
        ctx.fillStyle = teinte((a[2] + b[2]) * 0.5);
        capsule(ctx, sx(a), sy(a), bone[2] * scale, sx(b), sy(b), bone[3] * scale);
      });

      var t = proj.tete;
      ctx.fillStyle = teinte(t[2]);
      ctx.beginPath();
      ctx.ellipse(sx(t), sy(t), TETE * scale * 0.88, TETE * scale, 0, 0, 6.2832);
      ctx.fill();

      ctx.restore();
    }
  });
})();
