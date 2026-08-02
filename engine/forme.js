/* Forme: a 3D point cloud spun without depth cues.
 *
 * Every bistable-rotation illusion in this series is the same operation applied
 * to a different surface — build a cloud, spin it about the vertical, project
 * orthographically, and refuse to draw any cue that would settle which half is
 * nearer. Factoring that out means a new one costs only its parametrisation.
 *
 * The viewing tilt is applied *after* the spin and never animated: it fixes the
 * vantage point without ever telling the eye which way the object turns.
 */
(function (global) {
  "use strict";

  var noyaux = {};
  function disque(r) {
    var cle = r.toFixed(2);
    if (noyaux[cle]) return noyaux[cle];
    var o = [], R = Math.ceil(r);
    for (var dy = -R; dy <= R; dy++) {
      for (var dx = -R; dx <= R; dx++) {
        if (dx * dx + dy * dy <= r * r) o.push(dx, dy);
      }
    }
    noyaux[cle] = o;
    return o;
  }

  function Forme(max) {
    this.max = max;
    this.px = new Float32Array(max);
    this.py = new Float32Array(max);
    this.pz = new Float32Array(max);
    this.cr = new Float32Array(max);
    this.cg = new Float32Array(max);
    this.cb = new Float32Array(max);
    this.spanXZ = 1;     // horizontal reach, invariant under the spin
    this.spanY = 1;
  }

  /* echant(i, out) writes x, y, z into out and returns a value in [0,1];
     rampe(t, col) turns that value into an emissive colour. */
  Forme.prototype.construire = function (echant, rampe) {
    var out = [0, 0, 0], col = [0, 0, 0], sxz = 0, sy = 0;
    for (var i = 0; i < this.max; i++) {
      var t = echant(i, out);
      this.px[i] = out[0]; this.py[i] = out[1]; this.pz[i] = out[2];
      // Spinning about the vertical sweeps x and z through each other, so the
      // horizontal reach is their common radius; the height is independent.
      var d = Math.sqrt(out[0] * out[0] + out[2] * out[2]);
      if (d > sxz) sxz = d;
      var a = out[1] < 0 ? -out[1] : out[1];
      if (a > sy) sy = a;
      rampe(t, col);
      this.cr[i] = col[0]; this.cg[i] = col[1]; this.cb[i] = col[2];
    }
    this.spanXZ = sxz || 1;
    this.spanY = sy || 1;
    return this;
  };

  Forme.prototype.rendre = function (env, o) {
    var sp = env.splat;
    sp.gain = o.gain == null ? 5.5 : o.gain;
    sp.setTint(o.cool == null ? 0.34 : o.cool, o.warm == null ? 0.18 : o.warm);
    sp.begin();

    var n = Math.min(o.n || this.max, this.max);
    var C = Math.cos(o.angle), Sn = Math.sin(o.angle);
    var inc = o.inclinaison || 0;
    var ci = Math.cos(inc), si = Math.sin(inc);
    var cadre = o.cadre == null ? 0.92 : o.cadre;
    var scale = Math.min(sp.w / (2 * this.spanXZ), sp.h / (2 * this.spanY)) * cadre;
    var cx = sp.w / 2, cy = sp.h / 2;
    var invZ = 1 / this.spanXZ;
    var out = [0, 0, 0];
    var cue = o.cue || 0;
    // Sparse clouds need points that read as points. A single bilinear splat is
    // one pixel and vanishes; a small disc kernel gives a visible dot.
    var noyau = o.rayon > 0.6 ? disque(o.rayon) : null;
    // Opaque mode: keep only the surface facing the viewer. This is the one cue
    // the illusion can never have — occlusion is what makes a solid solid — so
    // it exists to show what the object actually is, never inside the loop.
    var avant = !!o.avant;

    for (var i = 0; i < n; i++) {
      var x = this.px[i], y = this.py[i], z = this.pz[i];
      var xr = x * C + z * Sn;
      var zr = z * C - x * Sn;
      var yr = y * ci - zr * si;
      zr = y * si + zr * ci;
      if (avant && zr < 0) continue;
      Splatter.cue(out, this.cr[i], this.cg[i], this.cb[i], zr * invZ, cue);
      var sx = cx + xr * scale, sy = cy - yr * scale;
      if (noyau) {
        for (var k = 0; k < noyau.length; k += 2) {
          sp.add(sx + noyau[k], sy + noyau[k + 1], out[0], out[1], out[2]);
        }
      } else {
        sp.add(sx, sy, out[0], out[1], out[2]);
      }
    }

    sp.end();
    env.blit();
  };

  /* Shared emissive ramp so the whole family reads as one material. */
  Forme.rampe = function (t, o) {
    var a;
    if (t < 0.55) {
      a = t / 0.55;
      o[0] = 0.20 + (0.30 - 0.20) * a;
      o[1] = 0.46 + (0.74 - 0.46) * a;
      o[2] = 0.44 + (0.46 - 0.44) * a;
    } else {
      a = (t - 0.55) / 0.45;
      o[0] = 0.30 + (0.52 - 0.30) * a;
      o[1] = 0.74 + (1.00 - 0.74) * a;
      o[2] = 0.46 + (0.38 - 0.46) * a;
    }
    var e = 0.52 + t * t * 0.9;
    o[0] *= e; o[1] *= e; o[2] *= e;
  };

  /* Gaussian-ish jitter, so surfaces read as speckled membranes. */
  Forme.flou = function (amp) {
    return (Math.random() + Math.random() + Math.random() - 1.5) * amp;
  };

  global.Forme = Forme;
})(window);
