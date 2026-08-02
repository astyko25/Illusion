/* Stage: canvas, brand frame, and a deterministic clock.
 *
 * Every scene draws as a pure function of a loop phase in [0,1). Nothing reads
 * the wall clock, so the live preview and the headless exporter produce exactly
 * the same pixels, and every loop closes seamlessly on itself.
 */
(function (global) {
  "use strict";

  global.ILLUSIONS = global.ILLUSIONS || [];

  var PALETTE = {
    void: "#000000",
    bone: "#e8f0ea",
    ash: "#7c8b85",
    lumen: "#3ddc84",
    citrine: "#c8ff6a"
  };

  var MARQUE = "BISTABLE";        // wordmark burned into every export

  function smoothstep(a, b, x) {
    if (b === a) return x < a ? 0 : 1;
    var t = (x - a) / (b - a);
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    return t * t * (3 - 2 * t);
  }

  function Stage(canvas, W, H) {
    this.canvas = canvas;
    this.W = canvas.width = W || 1080;
    this.H = canvas.height = H || 1920;
    this.ctx = canvas.getContext("2d", { alpha: false });

    // The specimen lives in a square well clear of the Reels chrome: the header
    // sits over the top ~200px, the caption and action rail over the bottom ~400.
    this.box = Math.min(this.W, Math.round(this.H * 0.55));
    this.cx = this.W / 2;
    this.cy = Math.round(this.H * 0.525);

    this.splat = new Splatter(this.box);
    this.scene = null;
    this.params = {};
    this.override = 0;          // studio depth toggle, independent of the timeline
  }

  Stage.prototype.charge = function (scene) {
    this.scene = scene;
    this.params = {};
    (scene.params || []).forEach(function (p) { this.params[p.id] = p.val; }, this);
    this.reinit();
    return this;
  };

  Stage.prototype.reinit = function () {
    if (this.scene && this.scene.init) this.scene.init(this.env(), this.params);
  };

  Stage.prototype.env = function () {
    var self = this;
    return {
      ctx: this.ctx, W: this.W, H: this.H,
      splat: this.splat, box: this.box,
      cx: this.cx, cy: this.cy,
      palette: PALETTE,
      // Vertical band left free by the question block and the caption zone.
      safe: { haut: Math.round(this.H * 0.235), bas: Math.round(this.H * 0.855) },
      // Paste the point-cloud buffer into the specimen well.
      blit: function () {
        self.ctx.drawImage(self.splat.canvas,
          Math.round(self.cx - self.box / 2), Math.round(self.cy - self.box / 2));
      }
    };
  };

  /* How strongly the depth cue is applied at this point in the loop. */
  Stage.prototype.cue = function (phase) {
    var s = this.scene;
    if (this.override > 0) return this.override;
    if (!s || !s.revele) return 0;
    var d = s.revele.debut;
    // Ramp up, hold, then release before the loop point so the cut is invisible.
    return Math.min(smoothstep(d, d + 0.07, phase), 1 - smoothstep(0.94, 1, phase));
  };

  Stage.prototype.dessine = function (phase) {
    var ctx = this.ctx;
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(0, 0, this.W, this.H);

    var cue = this.cue(phase);
    if (this.scene) this.scene.dessine(this.env(), phase, this.params, cue);

    this.cadre(phase, cue);
  };

  /* ---- brand frame ---- */

  Stage.prototype.cadre = function (phase, cue) {
    var ctx = this.ctx, s = this.scene;
    if (!s) return;

    ctx.save();
    ctx.textAlign = "center";

    // Scrims behind the type. Over a black specimen they are invisible, so they
    // cost nothing there; over a bright, busy one — the snakes especially — they
    // are the only thing keeping the question and the wordmark readable.
    var hautScrim = ctx.createLinearGradient(0, 0, 0, this.H * 0.26);
    hautScrim.addColorStop(0, "rgba(0,0,0,0.92)");
    hautScrim.addColorStop(0.62, "rgba(0,0,0,0.72)");
    hautScrim.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hautScrim;
    ctx.fillRect(0, 0, this.W, this.H * 0.26);

    var basScrim = ctx.createLinearGradient(0, this.H * 0.855, 0, this.H);
    basScrim.addColorStop(0, "rgba(0,0,0,0)");
    basScrim.addColorStop(0.22, "rgba(0,0,0,0.88)");
    basScrim.addColorStop(1, "rgba(0,0,0,0.96)");
    ctx.fillStyle = basScrim;
    ctx.fillRect(0, this.H * 0.855, this.W, this.H * 0.145);

    // Question, top of frame. Sized down a step when it needs three lines so the
    // block never creeps toward the specimen.
    var size = Math.round(this.W * 0.072);
    var lines = decoupe(ctx, s.question, this.W * 0.82, size, 900);
    if (lines.length > 2) {
      size = Math.round(size * 0.86);
      lines = decoupe(ctx, s.question, this.W * 0.82, size, 900);
    }
    ctx.font = "800 " + size + "px Archivo, sans-serif";
    ctx.fillStyle = PALETTE.bone;
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 24;
    var lh = size * 1.1;
    var top = Math.round(this.H * 0.145);
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, this.W / 2, top + i * lh);
    }, this);
    ctx.shadowBlur = 0;

    // Reveal caption, under the specimen, fading in with the cue.
    if (s.revele && cue > 0.01) {
      ctx.globalAlpha = Math.min(1, cue * 1.4);
      var yr = Math.round(this.H * 0.815);
      var hr = Math.round(this.H * 0.055);
      var scrim = ctx.createLinearGradient(0, yr - hr, 0, yr + hr);
      scrim.addColorStop(0, "rgba(0,0,0,0)");
      scrim.addColorStop(0.5, "rgba(0,0,0,0.82)");
      scrim.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = scrim;
      ctx.fillRect(0, yr - hr, this.W, hr * 2);
      ctx.font = "500 " + Math.round(this.W * 0.036) + "px PlexMono, monospace";
      ctx.fillStyle = PALETTE.citrine;
      letterSpace(ctx, "0.14em");
      ctx.fillText(s.revele.texte.toUpperCase(), this.W / 2, yr + this.W * 0.013);
      letterSpace(ctx, "0px");
      ctx.globalAlpha = 1;
    }

    // Wordmark, above the caption zone.
    var y = Math.round(this.H * 0.895);
    ctx.font = "500 " + Math.round(this.W * 0.028) + "px PlexMono, monospace";
    ctx.fillStyle = PALETTE.ash;
    letterSpace(ctx, "0.34em");
    var label = MARQUE + "  ·  " + s.index;
    ctx.fillText(label, this.W / 2, y);
    var half = ctx.measureText(label).width / 2;
    letterSpace(ctx, "0px");

    ctx.strokeStyle = "rgba(124,139,133,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.W / 2 - half - 46, y - 10);
    ctx.lineTo(this.W / 2 - half - 18, y - 10);
    ctx.moveTo(this.W / 2 + half + 18, y - 10);
    ctx.lineTo(this.W / 2 + half + 46, y - 10);
    ctx.stroke();

    ctx.restore();
  };

  function letterSpace(ctx, v) {
    if ("letterSpacing" in ctx) ctx.letterSpacing = v;
  }

  function decoupe(ctx, texte, maxw, size, weight) {
    ctx.font = weight + " " + size + "px Archivo, sans-serif";
    var mots = texte.split(" "), lignes = [], cur = "";
    for (var i = 0; i < mots.length; i++) {
      var essai = cur ? cur + " " + mots[i] : mots[i];
      if (ctx.measureText(essai).width > maxw && cur) {
        lignes.push(cur);
        cur = mots[i];
      } else cur = essai;
    }
    if (cur) lignes.push(cur);
    return lignes;
  }

  Stage.smoothstep = smoothstep;
  Stage.PALETTE = PALETTE;
  global.Stage = Stage;
})(window);
