/* Accumulation renderer for point clouds.
 *
 * Points are splatted bilinearly into a float buffer and tone mapped on the way
 * out. Only pixels actually lit are ever touched: the list of pixels from the
 * previous frame doubles as the clear list, so cost tracks the point count
 * rather than the canvas area.
 *
 * The tone curve is applied to the brightest channel and the other two are
 * scaled by the same factor, so dense regions saturate in colour instead of
 * bleaching to white.
 */
(function (global) {
  "use strict";

  function Splatter(w, h) {
    h = h || w;
    this.canvas = document.createElement("canvas");
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.w = w;
    this.h = h;

    var n = w * h;
    this.img = this.ctx.createImageData(w, h);
    this.data = this.img.data;
    for (var i = 3; i < this.data.length; i += 4) this.data[i] = 255;

    this.acc = new Float32Array(n * 3);
    this.stamp = new Uint32Array(n);
    this.touched = new Int32Array(n);
    this.count = 0;
    this.frameId = 1;

    this.gain = 6;
    this.tintR = new Float32Array(w);
    this.tintB = new Float32Array(w);
    this.setTint(0, 0);
  }

  /* Screen-space tint. It never varies with depth, so it adds atmosphere
     without leaking the direction of rotation. */
  Splatter.prototype.setTint = function (cool, warm) {
    for (var x = 0; x < this.w; x++) {
      var f = this.w > 1 ? x / (this.w - 1) : 0;
      this.tintB[x] = 1 + (1 - f) * cool;
      this.tintR[x] = 1 + f * warm;
    }
  };

  Splatter.prototype.begin = function () {
    var data = this.data, touched = this.touched;
    for (var k = 0; k < this.count; k++) {
      var p = touched[k] << 2;
      data[p] = 0; data[p + 1] = 0; data[p + 2] = 0;
    }
    this.count = 0;
    this.frameId++;
  };

  Splatter.prototype.add = function (sx, sy, r, g, b) {
    var W = this.w;
    var x0 = sx | 0, y0 = sy | 0;
    if (x0 < 0 || y0 < 0 || x0 >= W - 1 || y0 >= this.h - 1) return;
    var ax = sx - x0, ay = sy - y0;
    var iax = 1 - ax, iay = 1 - ay;
    var base = y0 * W + x0;
    this._one(base, iax * iay, r, g, b);
    this._one(base + 1, ax * iay, r, g, b);
    this._one(base + W, iax * ay, r, g, b);
    this._one(base + W + 1, ax * ay, r, g, b);
  };

  Splatter.prototype._one = function (idx, w, r, g, b) {
    var a = idx * 3, acc = this.acc;
    if (this.stamp[idx] !== this.frameId) {
      this.stamp[idx] = this.frameId;
      acc[a] = 0; acc[a + 1] = 0; acc[a + 2] = 0;
      this.touched[this.count++] = idx;
    }
    acc[a] += r * w;
    acc[a + 1] += g * w;
    acc[a + 2] += b * w;
  };

  Splatter.prototype.end = function () {
    var acc = this.acc, data = this.data, W = this.w, gain = this.gain;
    var tintR = this.tintR, tintB = this.tintB;
    for (var t = 0; t < this.count; t++) {
      var idx = this.touched[t];
      var col = idx % W;
      var a = idx * 3;
      var ar = acc[a] * gain * tintR[col];
      var ag = acc[a + 1] * gain;
      var ab = acc[a + 2] * gain * tintB[col];
      var mx = ar > ag ? (ar > ab ? ar : ab) : (ag > ab ? ag : ab);
      if (mx <= 0) continue;
      var f = 255 / (1 + mx);
      var q = idx << 2;
      data[q] = ar * f;
      data[q + 1] = ag * f;
      data[q + 2] = ab * f;
    }
    this.ctx.putImageData(this.img, 0, 0);
  };

  /* Depth cue shared by the 3D scenes: the approaching half brightens and the
     receding half shifts cool. Brightness alone is not enough — the silhouette
     rim sits at z = 0, so a pure luminance ramp leaves the most visible part of
     a shape untouched and the cue fails to read. */
  Splatter.cue = function (out, r, g, b, zNorm, amount) {
    if (amount <= 0) { out[0] = r; out[1] = g; out[2] = b; return out; }
    var f = 0.5 + zNorm * 0.5;
    var w = 1 + amount * (0.10 + 1.85 * f * f - 1);
    var k = amount * (1 - f) * (1 - f) * 0.92;
    var lum = (r + g + b) * 0.3333;
    out[0] = (r * (1 - k) + lum * 0.26 * k) * w;
    out[1] = (g * (1 - k) + lum * 0.60 * k) * w;
    out[2] = (b * (1 - k) + lum * 1.40 * k) * w;
    return out;
  };

  global.Splatter = Splatter;
})(window);
