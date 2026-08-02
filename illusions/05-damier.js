/* n° 05 — Damier d'Adelson
 *
 * Two squares carrying byte-for-byte the same grey. The visual system does not
 * report the light arriving at the eye, it reports its best guess at the surface
 * underneath — a light square explained away by a shadow is read as light, a
 * dark square in the open is read as dark.
 *
 * Getting the numbers right is the easy half and not the half that matters. The
 * effect only fires if the scene reads as a lit three-dimensional floor, which
 * puts three constraints on the drawing:
 *
 *   - The shadow must cut *through* squares. Shading each square by testing its
 *     centre puts the shadow boundary on the grid in a staircase, and it stops
 *     looking like a shadow at all. It is composited as real geometry instead.
 *   - The shadow must be visibly cast by the cylinder, sharing its foot and its
 *     light direction, or it reads as an unrelated patch of dark tiles.
 *   - Rows must compress with distance. Interpolating y linearly in v gives a
 *     trapezoid, not a receding plane.
 *
 * The shadow multiplier is exactly SOMBRE / CLAIR, which forces the two patches
 * onto the same value; the composite is verified by probing the rendered pixels
 * rather than trusting the blend.
 */
(function () {
  "use strict";

  var CLAIR = 185, SOMBRE = 120;
  var OMBRE = SOMBRE / CLAIR;    // sends CLAIR onto SOMBRE exactly

  var N = 8;
  var UC = 6.3, VC = 4.8, RC = 1.62;      // cylinder foot and radius, board units
  var DU = -4.2, DV = -1.4;               // shadow displacement, i.e. away from the light
  var D0 = 4.5;                           // camera distance to the near edge

  function gris(v) { var n = Math.round(v); return "rgb(" + n + "," + n + "," + n + ")"; }

  ILLUSIONS.push({
    id: "damier",
    index: "N° 05",
    nom: "Damier d'Adelson",
    question: "Les cases A et B sont-elles du même gris ?",
    duree: 12,
    revele: { debut: 0.46, texte: "Le même gris, exactement" },
    params: [
      { id: "fuite", nom: "Perspective", min: 20, max: 80, val: 52, div: 100 },
      { id: "flou", nom: "Pénombre", min: 0, max: 40, val: 9 }
    ],

    init: function () {
      this.cache = null;
    },

    dessine: function (env, phase, p, cue) {
      var ctx = env.ctx;
      var cle = [env.W, env.H, p.fuite, p.flou].join(":");
      if (!this.cache || this.cache.cle !== cle) this.cache = this.scene(env, p, cle);
      var C = this.cache;

      ctx.drawImage(C.canvas, 0, 0);

      // Proof: a bar of the shared value bridging both squares. It merges into
      // each end, which is the only demonstration that actually convinces.
      if (cue > 0.01) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, cue * 1.6);
        ctx.fillStyle = gris(SOMBRE);
        var wA = C.pasA * 0.30, wB = C.pasB * 0.30;
        ctx.beginPath();
        ctx.moveTo(C.cA[0] - wA, C.cA[1]);
        ctx.lineTo(C.cA[0] + wA, C.cA[1]);
        ctx.lineTo(C.cB[0] + wB, C.cB[1]);
        ctx.lineTo(C.cB[0] - wB, C.cB[1]);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.font = "800 " + Math.round(env.W * 0.052) + "px Archivo, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      [[C.cA, "A"], [C.cB, "B"]].forEach(function (q) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillText(q[1], q[0][0] + 3, q[0][1] + 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(q[1], q[0][0], q[0][1]);
      });
      ctx.restore();
    },

    /* The board never moves, so it is drawn once and cached. */
    scene: function (env, p, cle) {
      var W = env.W, H = env.H;
      var cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      var ctx = cv.getContext("2d");

      var haut = env.safe.haut, bas = env.safe.bas, hauteur = bas - haut;
      var yBas = haut + hauteur * 0.97, yHaut = haut + hauteur * 0.30;

      // True one-point perspective: screen y and half width both fall as 1/d,
      // so rows compress toward the horizon instead of stacking evenly.
      //   y(v) = yHorizon + Cy/(D0+v),  with y(0) = yBas and y(N) = yHaut
      // Solving those two gives the horizon; deriving it any other way is how
      // the floor ends up a factor of k too short.
      var k = (D0 + N) / D0;                       // near/far scale ratio
      var yHorizon = (k * yHaut - yBas) / (k - 1);
      var Cy = D0 * (yBas - yHorizon);
      var Cw = W * 0.46 * D0;
      var cx = W / 2;

      function proj(u, v) {
        var d = D0 + v;
        return [cx + (u / N - 0.5) * 2 * (Cw / d), yHorizon + Cy / d];
      }

      // Ground the scene: a horizon wash so the floor sits in a space instead of
      // floating on black.
      var fond = ctx.createLinearGradient(0, 0, 0, H);
      fond.addColorStop(0, "#050708");
      fond.addColorStop(Math.max(0, Math.min(1, yHorizon / H)), "#141a1d");
      fond.addColorStop(1, "#050708");
      ctx.fillStyle = fond;
      ctx.fillRect(0, 0, W, H);

      function quad(u, v) {
        var A = proj(u, v), B = proj(u + 1, v), D = proj(u + 1, v + 1), E = proj(u, v + 1);
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]);
        ctx.lineTo(D[0], D[1]); ctx.lineTo(E[0], E[1]);
        ctx.closePath();
      }

      // 1 — the board at full value, no shading at all
      for (var v = 0; v < N; v++) {
        for (var u = 0; u < N; u++) {
          ctx.fillStyle = gris((u + v) % 2 === 0 ? CLAIR : SOMBRE);
          quad(u, v);
          ctx.fill();
        }
      }

      // 2 — the shadow. A second, fully shadowed copy of the board is composited
      //     over the lit one through a blurred alpha mask. Going via a blend mode
      //     instead would put the exactness of the whole illusion at the mercy of
      //     the browser's multiply arithmetic — measured here at 113 where the
      //     formula predicts 120. This way the umbra carries literal values and
      //     only the soft edge is interpolated.
      var ombre = document.createElement("canvas");
      ombre.width = W; ombre.height = H;
      var oc = ombre.getContext("2d");
      for (var v2 = 0; v2 < N; v2++) {
        for (var u2 = 0; u2 < N; u2++) {
          var A2 = proj(u2, v2), B2 = proj(u2 + 1, v2);
          var D2 = proj(u2 + 1, v2 + 1), E2 = proj(u2, v2 + 1);
          oc.fillStyle = gris(((u2 + v2) % 2 === 0 ? CLAIR : SOMBRE) * OMBRE);
          oc.beginPath();
          oc.moveTo(A2[0], A2[1]); oc.lineTo(B2[0], B2[1]);
          oc.lineTo(D2[0], D2[1]); oc.lineTo(E2[0], E2[1]);
          oc.closePath(); oc.fill();
        }
      }

      var masque = document.createElement("canvas");
      masque.width = W; masque.height = H;
      var mc = masque.getContext("2d");
      if (p.flou > 0) mc.filter = "blur(" + p.flou + "px)";
      mc.fillStyle = "#ffffff";
      mc.beginPath();
      var len = Math.hypot(DU, DV), dx = DU / len, dy = DV / len;
      var K = 64;
      for (var i = 0; i <= K; i++) {
        var ang = i / K * Math.PI * 2;
        var ox = Math.cos(ang), oy = Math.sin(ang);
        var base = (ox * dx + oy * dy) > 0 ? [UC + DU, VC + DV] : [UC, VC];
        var q = proj(base[0] + ox * RC, base[1] + oy * RC);
        if (i === 0) mc.moveTo(q[0], q[1]); else mc.lineTo(q[0], q[1]);
      }
      mc.closePath();
      mc.fill();
      mc.filter = "none";

      oc.globalCompositeOperation = "destination-in";
      oc.drawImage(masque, 0, 0);

      ctx.save();
      ctx.beginPath();                       // keep the shadow on the floor
      var c0 = proj(0, 0), c1 = proj(N, 0), c2 = proj(N, N), c3 = proj(0, N);
      ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]);
      ctx.lineTo(c2[0], c2[1]); ctx.lineTo(c3[0], c3[1]);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(ombre, 0, 0);
      ctx.restore();

      // 3 — the cylinder, standing on the shadow's own origin
      var pied = proj(UC, VC);
      var bord = proj(UC + RC, VC);
      var rx = Math.abs(bord[0] - pied[0]);
      var ry = rx * 0.34;
      var h = (yBas - yHaut) * 0.46;

      var contact = ctx.createRadialGradient(pied[0], pied[1], rx * 0.15, pied[0], pied[1], rx * 1.15);
      contact.addColorStop(0, "rgba(0,0,0,0.42)");
      contact.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = contact;
      ctx.beginPath();
      ctx.ellipse(pied[0], pied[1], rx * 1.15, ry * 1.5, 0, 0, 6.2832);
      ctx.fill();

      // Lit from the side the shadow points away from, so the solid agrees with
      // its own shadow.
      var g = ctx.createLinearGradient(pied[0] - rx, 0, pied[0] + rx, 0);
      g.addColorStop(0, "#22332a");
      g.addColorStop(0.30, "#3d5b48");
      g.addColorStop(0.78, "#88b899");
      g.addColorStop(1, "#5e8770");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(pied[0] - rx, pied[1] - h);
      ctx.lineTo(pied[0] + rx, pied[1] - h);
      ctx.lineTo(pied[0] + rx, pied[1]);
      ctx.ellipse(pied[0], pied[1], rx, ry, 0, 0, Math.PI);
      ctx.lineTo(pied[0] - rx, pied[1]);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#9ccbad";
      ctx.beginPath();
      ctx.ellipse(pied[0], pied[1] - h, rx, ry, 0, 0, 6.2832);
      ctx.fill();

      function centre(sq) {
        var A = proj(sq[0], sq[1]), D = proj(sq[0] + 1, sq[1] + 1);
        return [(A[0] + D[0]) / 2, (A[1] + D[1]) / 2];
      }

      // Pick the pair by probing the finished image, with exact equality as a
      // hard constraint. Reasoning about margins in board units failed twice:
      // the blur is in screen pixels while perspective compresses the far rows,
      // and then the cylinder's contact shadow bled onto the candidate and cost
      // it seven levels. Only the rendered pixels can certify the claim the
      // caption is about to make, and nothing drawn later can break it without
      // this check catching it.
      var mdata = mc.getImageData(0, 0, W, H).data;
      var fdata = ctx.getImageData(0, 0, W, H).data;
      function idx(q) { return ((Math.round(q[1]) * W) + Math.round(q[0])) * 4; }

      // The effect is carried by local contrast, so a square is only a usable
      // candidate if its *surround* is in the same lighting as it is. Testing the
      // centre alone put B on the edge of the penumbra, with one neighbour at 157
      // instead of the 78 it needs.
      function alphaEn(u, v) {
        var q = proj(u, v);
        if (q[0] < 1 || q[1] < 1 || q[0] > W - 2 || q[1] > H - 2) return -1;
        return mdata[idx(q) + 3];
      }
      function entoure(uu, vv, dedans) {
        var pts = [[0.5, 0.5], [-0.6, 0.5], [1.6, 0.5], [0.5, -0.6], [0.5, 1.6]];
        for (var n = 0; n < pts.length; n++) {
          var a = alphaEn(uu + pts[n][0], vv + pts[n][1]);
          if (a < 0) return false;
          if (dedans ? a < 248 : a > 7) return false;
        }
        return true;
      }

      var candA = [], candB = [];
      for (var vv = 0; vv < N; vv++) {
        for (var uu = 0; uu < N; uu++) {
          var q = centre([uu, vv]);
          if (q[0] < 2 || q[1] < 2 || q[0] > W - 3 || q[1] > H - 3) continue;
          var i0 = idx(q);
          var alpha = mdata[i0 + 3];     // 0 in full light, 255 in full umbra
          var val = fdata[i0];
          var clair = (uu + vv) % 2 === 0;
          // The rendered value is the certification, not a proxy for it: a light
          // square only reaches SOMBRE when it sits in the full umbra, and a dark
          // square only holds SOMBRE when nothing has shaded it. Alpha merely
          // says which of the two roles the square is playing.
          if (val !== SOMBRE) continue;
          // Keep clear of the cylinder: a square tucked against its base gets its
          // label crowded even when the square itself is unobstructed.
          if (Math.hypot(uu + 0.5 - UC, vv + 0.5 - VC) < RC + 1.1) continue;
          if (!clair && alpha < 8 && vv >= 1 && vv <= 5 && entoure(uu, vv, false)) candA.push([uu, vv, val]);
          if (clair && alpha > 247 && vv >= 2 && vv <= 6 && entoure(uu, vv, true)) candB.push([uu, vv, val]);
        }
      }

      // Separation matters as much as equality. Two squares in adjacent rows
      // invite a direct side-by-side comparison, and the illusion loses most of
      // its force; Adelson keeps them apart so each is judged against its own
      // surround. Prefer the widest gap, falling back only if nothing qualifies.
      var paire = null;
      [3, 2, 1, 0].some(function (ecart) {
        candA.forEach(function (a) {
          candB.forEach(function (b) {
            if (a[2] !== b[2] || b[1] - a[1] < ecart) return;
            var note = Math.abs(a[0] - 3.5) + Math.abs(b[0] - 3.5) - (b[1] - a[1]) * 2;
            if (!paire || note < paire.note) paire = { a: a, b: b, note: note };
          });
        });
        return !!paire;
      });
      if (!paire) throw new Error("damier : aucune paire de cases exactement égales");
      this.A = [paire.a[0], paire.a[1]];
      this.B = [paire.b[0], paire.b[1]];
      this.valeur = paire.a[2];

      var cA = centre(this.A), cB = centre(this.B);
      // Square width at each row separately: perspective makes B's row markedly
      // narrower, so a single figure would misplace anything measured from it.
      return {
        cle: cle, canvas: cv, cA: cA, cB: cB,
        pasA: Math.abs(proj(1, this.A[1] + 0.5)[0] - proj(0, this.A[1] + 0.5)[0]),
        pasB: Math.abs(proj(1, this.B[1] + 0.5)[0] - proj(0, this.B[1] + 0.5)[0])
      };
    }
  });
})();
