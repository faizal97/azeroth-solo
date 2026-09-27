/* art_story2.js — second story cutscene pack for Azeroth Solo (the Onyxia reveal and the Drowned Crown prologue).
 * Loads AFTER art_story.js and WRAPS window.ART.story: scene(key) / actor(key) draw the keys below and fall through
 * to the previous functions for every other key (prototype keys included). New keys are appended to
 * ART.story.keys.scenes / ART.story.keys.actors. Self-contained, never throws, ids unique per call (prefix s2<counter>_).
 *   scene  stormveil_storm  storm at sea, the Stormveil Isle and its drowned citadel rising, Onyxia flying south
 *   actor  windsor          Marshal Reginald Windsor, just out of the Blackrock Depths cells
 *   actor  aeldran          Prince Aeldran Tidecrown, drowned Highborne prince (original character)
 *   actor  nalveshra        Nal'veshra the Deepmother, abyssal sea spirit (original character)
 * Style matches art_story.js: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients,
 * no text, no images, no filters. Scenes 480x270 opaque; actors 160x160 transparent, facing LEFT, feet on the bottom edge.
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = (W.ART && typeof W.ART === 'object') ? W.ART : {};
  try { if (W.ART !== ART) W.ART = ART; } catch (e) { }
  var OL = '#1a1009';
  var SEQ = 0;

  // ---------- colour + number helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var v = parseInt(h, 16);
    if (isNaN(v)) v = 0x808080;
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function hex(a) { return '#' + a.map(function (v) { var s = Math.round(clamp(v, 0, 255)).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function lt(c, t) { return mix(c, '#ffffff', t); }
  function dk(c, t) { return mix(c, '#000000', t); }
  function n(v) { v = +v; return isFinite(v) ? Math.round(v * 10) / 10 : 0; }
  function pt(p) { return n(p[0]) + ',' + n(p[1]); }
  function pd(a, close) { return 'M' + a.map(pt).join(' L') + (close ? ' Z' : ''); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- per-call context (unique ids) ----------
  function Ctx() { this.p = 's2' + (SEQ++).toString(36) + '_'; this.k = 0; this.d = []; }
  Ctx.prototype.id = function () { return this.p + (this.k++).toString(36); };
  function stops(s) { return s.map(function (q) { return '<stop offset="' + q[0] + '" stop-color="' + q[1] + '"' + (q[2] != null ? ' stop-opacity="' + q[2] + '"' : '') + '/>'; }).join(''); }
  Ctx.prototype.lin = function (s, x1, y1, x2, y2) {
    var i = this.id();
    this.d.push('<linearGradient id="' + i + '" x1="' + (x1 == null ? 0 : x1) + '" y1="' + (y1 == null ? 0 : y1) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stops(s) + '</linearGradient>');
    return 'url(#' + i + ')';
  };
  Ctx.prototype.rad = function (s, cx, cy, r) {
    var i = this.id();
    this.d.push('<radialGradient id="' + i + '" cx="' + (cx == null ? 0.5 : cx) + '" cy="' + (cy == null ? 0.5 : cy) + '" r="' + (r == null ? 0.5 : r) + '">' + stops(s) + '</radialGradient>');
    return 'url(#' + i + ')';
  };
  Ctx.prototype.cel = function (base, l, d) { return this.lin([[0, lt(base, l == null ? 0.3 : l)], [0.4, base], [0.72, base], [1, dk(base, d == null ? 0.38 : d)]], 0.2, 0, 0.8, 1); };
  Ctx.prototype.celH = function (base) { return this.lin([[0, lt(base, 0.35)], [0.3, lt(base, 0.1)], [0.62, base], [0.63, dk(base, 0.18)], [1, dk(base, 0.4)]], 0, 0, 1, 0); };
  Ctx.prototype.vgrad = function (a, b, c2) { return c2 ? this.lin([[0, a], [0.5, b], [1, c2]]) : this.lin([[0, a], [1, b]]); };
  Ctx.prototype.glow = function (col, op) { return this.rad([[0, col, op], [0.4, col, op * 0.5], [1, col, 0]]); };
  Ctx.prototype.shade = function () { return this.rad([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]]); };

  // ---------- primitives ----------
  function st(sw) { return sw ? ' stroke="' + OL + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"' : ''; }
  function P(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + st(sw) + (ex ? ' ' + ex : '') + '/>'; }
  function L(d, col, sw, ex) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + (ex ? ' ' + ex : '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, ex) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + (fill || 'none') + '"' + st(sw) + (ex ? ' ' + ex : '') + '/>'; }
  function R(x, y, w, h, fill, sw, ex) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + (fill || 'none') + '"' + st(sw) + (ex ? ' ' + ex : '') + '/>'; }
  function G(body, ex) { return '<g' + (ex ? ' ' + ex : '') + '>' + body + '</g>'; }
  function limb(d, col, w) { return L(d, OL, w + 2.4) + L(d, col, w); }
  function wrap(c, w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + (c.d.length ? '<defs>' + c.d.join('') + '</defs>' : '') + body + '</svg>';
  }
  function vignette(c, op) { return R(0, 0, 480, 270, c.rad([[0, '#000', 0], [0.6, '#000', op * 0.25], [1, '#000', op]], 0.5, 0.45, 0.75)); }
  // cubic bezier point
  function bz(q, t) {
    var u = 1 - t;
    return [u * u * u * q[0][0] + 3 * u * u * t * q[1][0] + 3 * u * t * t * q[2][0] + t * t * t * q[3][0],
      u * u * u * q[0][1] + 3 * u * u * t * q[1][1] + 3 * u * t * t * q[2][1] + t * t * t * q[3][1]];
  }
  // tapered ribbon along a cubic bezier (tentacles, hair locks, kelp): width w0 at the root to w1 at the tip
  function taper(q, w0, w1, N, wave) {
    N = N || 22; var Lf = [], Rt = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N, p = bz(q, t), a = bz(q, Math.max(0, t - 0.01)), b = bz(q, Math.min(1, t + 0.01));
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len, ny = dx / len, w = (w0 + (w1 - w0) * t) / 2;
      if (wave) { var s = Math.sin(t * Math.PI * wave[0] + (wave[2] || 0)) * wave[1] * t; p = [p[0] + nx * s, p[1] + ny * s]; }
      Lf.push([p[0] + nx * w, p[1] + ny * w]); Rt.push([p[0] - nx * w, p[1] - ny * w]);
    }
    return pd(Lf.concat(Rt.reverse()), true);
  }
  function chain(x1, y1, x2, y2, sz, col) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
    var cnt = Math.max(2, Math.floor(len / (sz * 1.55))), o = '';
    for (var i = 0; i < cnt; i++) {
      var t = (i + 0.5) / cnt, cx = x1 + dx * t, cy = y1 + dy * t;
      var tr = ' transform="rotate(' + n(ang) + ' ' + n(cx) + ' ' + n(cy) + ')"';
      if (i % 2 === 0) {
        o += E(cx, cy, sz, sz * 0.58, 'none', 0, 'stroke="' + OL + '" stroke-width="' + n(sz * 0.62) + '"' + tr);
        o += E(cx, cy, sz, sz * 0.58, 'none', 0, 'stroke="' + col + '" stroke-width="' + n(sz * 0.34) + '"' + tr);
      } else {
        o += R(cx - sz * 1.05, cy - sz * 0.26, sz * 2.1, sz * 0.52, col, n(sz * 0.14), 'rx="' + n(sz * 0.26) + '"' + tr);
      }
    }
    return o;
  }
  // small gold lion-sun crest, as on the Stormwind banners in art_story.js
  function crest(cx, cy, r, gold) {
    var sp = '';
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * Math.PI * 2, a2 = a + Math.PI / 10, a3 = a - Math.PI / 10;
      sp += (i ? ' L' : 'M') + n(cx + Math.cos(a3) * r) + ',' + n(cy + Math.sin(a3) * r) + ' L' + n(cx + Math.cos(a) * r * 1.55) + ',' + n(cy + Math.sin(a) * r * 1.55) + ' L' + n(cx + Math.cos(a2) * r) + ',' + n(cy + Math.sin(a2) * r);
    }
    return P(sp + ' Z', gold, 0.9) + E(cx, cy, r * 0.82, r * 0.82, lt(gold, 0.2), 0.9) + E(cx - r * 0.22, cy - r * 0.08, r * 0.3, r * 0.22, dk(gold, 0.35));
  }

  // =====================================================================
  // SCENE: stormveil_storm (480 x 270, opaque)
  // =====================================================================

  // scalloped cloud band. hang=true: fills from `top` down to a bumpy lower edge; false: bumpy upper edge down to `top`.
  function cloudBand(r, edge, amp, top, hang, step) {
    var x = 500, d = 'M-20,' + top + ' L500,' + top + ' L500,' + n(edge);
    while (x > -20) {
      var w = step * (0.7 + r() * 0.8), nx = x - w, ny = edge + (r() - 0.5) * amp * 0.7;
      var bul = amp * (0.6 + r() * 0.6) * (hang ? 1 : -1);
      d += ' Q' + n(x - w / 2) + ',' + n(ny + bul) + ' ' + n(nx) + ',' + n(ny);
      x = nx;
    }
    return d + ' L-20,' + top + ' Z';
  }
  // slender Highborne spire: shaft, balcony ring, leaf-shaped crown with swept fins, needle tip
  function spire(c, x, baseY, topY, w, K, broken, lit) {
    var o = '', h = baseY - topY, by = topY + h * 0.24, bh = h * 0.1, bw = w * 1.35, ys = topY + h * 0.56;
    var shaftTop = broken ? topY + h * 0.3 : by + bh * 0.55;
    var shaft = 'M' + n(x - w) + ',' + n(baseY) + ' L' + n(x - w * 0.62) + ',' + n(shaftTop) + (broken
      ? ' L' + n(x - w * 0.3) + ',' + n(shaftTop - h * 0.08) + ' L' + n(x - w * 0.02) + ',' + n(shaftTop - h * 0.02) + ' L' + n(x + w * 0.22) + ',' + n(shaftTop - h * 0.12) + ' L' + n(x + w * 0.62) + ',' + n(shaftTop + h * 0.02)
      : ' L' + n(x + w * 0.62) + ',' + n(shaftTop)) + ' L' + n(x + w) + ',' + n(baseY) + ' Z';
    var bulb = 'M' + n(x - w * 0.62) + ',' + n(by + bh * 0.55) + ' C' + n(x - bw * 1.1) + ',' + n(by + bh * 0.2) + ' ' + n(x - bw) + ',' + n(by - bh * 0.6) + ' ' + n(x) + ',' + n(by - bh * 1.1) +
      ' C' + n(x + bw) + ',' + n(by - bh * 0.6) + ' ' + n(x + bw * 1.1) + ',' + n(by + bh * 0.2) + ' ' + n(x + w * 0.62) + ',' + n(by + bh * 0.55) + ' Z';
    var needle = 'M' + n(x - w * 0.24) + ',' + n(by - bh * 0.9) + ' L' + n(x) + ',' + n(topY) + ' L' + n(x + w * 0.24) + ',' + n(by - bh * 0.9) + ' Z';
    function fin(sg) {
      return 'M' + n(x + sg * w * 0.66) + ',' + n(by + bh * 0.9) + ' C' + n(x + sg * w * 1.7) + ',' + n(by + bh * 1.1) + ' ' + n(x + sg * w * 2.1) + ',' + n(by + bh * 0.1) + ' ' + n(x + sg * w * 1.9) + ',' + n(by - bh * 0.7) +
        ' C' + n(x + sg * w * 1.6) + ',' + n(by + bh * 0.1) + ' ' + n(x + sg * w * 1.2) + ',' + n(by + bh * 0.55) + ' ' + n(x + sg * w * 0.62) + ',' + n(by + bh * 0.5) + ' Z';
    }
    var ring = 'M' + n(x - w * 1.05) + ',' + n(ys) + ' L' + n(x + w * 1.05) + ',' + n(ys) + ' L' + n(x + w * 0.85) + ',' + n(ys + 3) + ' L' + n(x - w * 0.85) + ',' + n(ys + 3) + ' Z';
    var all = shaft + (broken ? '' : bulb + needle + fin(-1) + fin(1)) + ring;
    if (lit) o += P(all, '#e8f8ff', 0, 'transform="translate(-1.6,-1)" opacity="0.9"');
    o += P(shaft, c.celH(K.stone), 1.4);
    o += P(ring, c.celH(K.stone2), 1.1);
    if (!broken) o += P(fin(-1), c.cel(K.stone2, 0.25, 0.45), 1.1) + P(fin(1), c.cel(K.stone2, 0.25, 0.45), 1.1) + P(bulb, c.celH(K.stone2), 1.3) + P(needle, c.celH(lt(K.stone2, 0.1)), 1.1) + L('M' + n(x - w * 0.7) + ',' + n(by + bh * 0.3) + ' Q' + n(x) + ',' + n(by + bh * 0.8) + ' ' + n(x + w * 0.7) + ',' + n(by + bh * 0.3), K.verd, 1.1);
    // glowing slit windows
    [[ys + h * 0.1, 0.13], [ys - h * 0.16, 0.1]].forEach(function (q, i) {
      if (broken && i === 1) return;
      var wy = q[0], wh = h * q[1];
      o += E(x, wy + wh / 2, w * 1.4, wh * 0.9, c.glow(K.win, 0.45));
      o += P('M' + n(x - w * 0.2) + ',' + n(wy + wh) + ' L' + n(x - w * 0.2) + ',' + n(wy + 1.5) + ' L' + n(x) + ',' + n(wy - 1) + ' L' + n(x + w * 0.2) + ',' + n(wy + 1.5) + ' L' + n(x + w * 0.2) + ',' + n(wy + wh) + ' Z', K.win, 0.7);
    });
    // weed hanging where the sea left it
    o += L('M' + n(x - w * 0.9) + ',' + n(ys + 3) + ' q1,5 -0.5,10 M' + n(x + w * 0.5) + ',' + n(ys + 3) + ' q1.4,4 0,8', K.weed, 1.4);
    return o;
  }
  function onyxiaFar(x, y, s, rot) {
    // black dragon seen from behind, wings raised, flying away
    var d = 'M0,-9 C2,-8 2.6,-5 2.4,-3 L10,-12 L22,-17 L32,-15 Q26,-11 27,-7 Q21,-7 20,-3 Q14,-4 12,-1 Q7,-1 3,2 C3,6 2,9 1,12 Q3,17 7,21 Q1,19 -1,13 C-2,9 -3,6 -3,2 Q-7,-1 -12,-1 Q-14,-4 -20,-3 Q-21,-7 -27,-7 Q-26,-11 -32,-15 L-22,-17 L-10,-12 L-2.4,-3 C-2.6,-5 -2,-8 0,-9 Z';
    return G(P(d, '#9ab4c8', 0, 'opacity="0.55" transform="translate(0,-0.9)"') + P(d, '#05070a'), 'transform="translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')"');
  }
  function bolt(r, pts, wd) {
    var d = pd(pts), o = '';
    o += L(d, '#9ad8ff', wd * 6, 'opacity="0.18"') + L(d, '#bfe8ff', wd * 2.6, 'opacity="0.55"') + L(d, '#e8f8ff', wd * 1.2) + L(d, '#ffffff', wd * 0.5);
    return o;
  }
  function jag(r, x0, y0, x1, y1, segs, sp) {
    var a = [[x0, y0]];
    for (var i = 1; i < segs; i++) { var t = i / segs; a.push([x0 + (x1 - x0) * t + (r() - 0.5) * sp, y0 + (y1 - y0) * t + (r() - 0.5) * sp * 0.3]); }
    a.push([x1, y1]);
    return a;
  }
  function stormveilScene() {
    var c = new Ctx(), o = '', r = rng(7707);
    var K = { stone: '#4e6c70', stone2: '#628284', verd: '#66c4ae', win: '#72f6e4', weed: '#26442a' };
    // sky
    o += R(0, 0, 480, 270, c.lin([[0, '#06090f'], [0.3, '#101824'], [0.55, '#26343f'], [0.63, '#34464f'], [1, '#34464f']]));
    // lightning-lit hollows in the clouds (Onyxia's gap on the left, the strike on the right)
    o += E(112, 92, 130, 48, c.glow('#a8c4d8', 0.6));
    o += E(304, 58, 130, 84, c.glow('#c8e4ff', 0.6));
    // far cloud banks on the horizon
    o += P(cloudBand(r, 150, 10, 172, false, 34), c.lin([[0, '#4a5c6e'], [0.5, '#2c3a48'], [1, '#22303a']]), 1.2);
    o += P(cloudBand(r, 128, 16, 172, false, 46), c.lin([[0, '#3c4e60'], [0.5, '#24323e'], [1, '#1c2832']]), 1.4, 'opacity="0.8"');
    // Onyxia far off, heading south
    o += onyxiaFar(112, 94, 0.66, -10);
    // storm ceiling: two hanging layers, lit along their bellies
    var c1 = cloudBand(r, 60, 24, -10, true, 54);
    o += P(c1, c.lin([[0, '#06090e'], [0.55, '#111a26'], [0.85, '#223246'], [1, '#48627a']]), 1.6);
    o += L(c1.replace(/^M-20,-10 L500,-10 L500,/, 'M500,').replace(/ L-20,-10 Z$/, ''), '#7ea2bc', 1.3, 'opacity="0.6"');
    var c2 = cloudBand(r, 28, 18, -10, true, 70);
    o += P(c2, c.lin([[0, '#04060a'], [0.7, '#0a1018'], [1, '#1c2a3a']]), 1.6);
    // lightning: the main strike hits the tallest spire, a far bolt on the right, a faint one on the left
    var main = jag(r, 322, -4, 300, 50, 8, 16);
    o += E(300, 52, 46, 34, c.glow('#e0f4ff', 0.75));
    o += bolt(r, main, 1.4);
    o += bolt(r, jag(r, main[3][0], main[3][1], 344, 44, 3, 10), 0.6);
    o += bolt(r, jag(r, main[5][0], main[5][1], 280, 50, 3, 8), 0.55);
    o += bolt(r, jag(r, 452, 46, 438, 168, 9, 16), 0.7);
    o += bolt(r, jag(r, 452 - 3, 100, 470, 130, 3, 8), 0.4);
    o += bolt(r, jag(r, 52, 50, 66, 104, 5, 12), 0.45);
    // horizon sea strip
    o += R(0, 168, 480, 12, c.vgrad('#1c3440', '#122630'));
    // the Stormveil Isle: back ridge, citadel, front cliffs
    var ridge = [[170, 180], [190, 164], [206, 156], [220, 142], [236, 134], [250, 126], [266, 128], [280, 116], [298, 112], [314, 118], [330, 110], [346, 122], [362, 120], [380, 134], [398, 142], [416, 156], [434, 166], [452, 180]];
    o += P(pd(ridge, true), c.lin([[0, '#3a4c54'], [0.3, '#202c32'], [1, '#0e161a']], 0.2, 0, 0.7, 1), 1.8);
    o += L('M190,164 L206,156 L220,142 L236,134 L250,126 M280,116 L298,112 M330,110 L346,122', '#9cc4d2', 1.3, 'opacity="0.7"');
    o += P('M286,112 Q306,90 326,112 L326,118 Q306,98 286,118 Z', c.cel(K.stone2, 0.25, 0.45), 1.3);
    o += spire(c, 246, 132, 86, 5.2, K, false);
    o += spire(c, 366, 124, 78, 5.4, K, false);
    o += spire(c, 334, 116, 66, 6, K, true);
    o += spire(c, 272, 124, 72, 5.6, K, true);
    o += spire(c, 300, 116, 50, 7.4, K, false, true);
    o += spire(c, 392, 142, 104, 4.4, K, false);
    o += spire(c, 222, 146, 118, 4, K, true);
    var front = [[176, 182], [194, 168], [212, 160], [226, 150], [240, 146], [254, 138], [270, 142], [284, 130], [300, 134], [316, 128], [332, 136], [350, 132], [366, 140], [382, 146], [400, 152], [420, 164], [440, 176], [450, 182]];
    o += P(pd(front, true), c.lin([[0, '#2a3a40'], [0.4, '#141e22'], [1, '#0a1014']], 0.2, 0, 0.7, 1), 1.8);
    o += L('M226,150 L230,166 M254,138 L250,158 L256,172 M284,130 L288,152 M316,128 L310,150 L318,168 M350,132 L354,154 M382,146 L378,166 M420,164 L416,176', '#070c0f', 1.2);
    o += L('M194,168 L212,160 L226,150 L240,146 L254,138 M284,130 L300,134 L316,128', '#8ab4c4', 1.2, 'opacity="0.65"');
    // waterfalls pouring off the new land
    o += L('M240,148 Q238,160 240,174 M300,136 Q298,154 301,174 M350,134 Q348,154 351,174 M400,152 Q398,164 400,176', '#d4ecf0', 1.6, 'opacity="0.8"');
    o += L('M241,150 Q239,162 241,174 M351,136 Q349,156 352,174', '#ffffff', 0.6, 'opacity="0.85"');
    // spires breaking the surface in open water
    o += G(spire(c, 152, 194, 128, 6.4, K, true), 'transform="rotate(-14 152 194)"');
    o += G(spire(c, 460, 196, 124, 6, K, false), 'transform="rotate(9 460 196)"');
    o += G(spire(c, 112, 190, 160, 4.2, K, true), 'transform="rotate(6 112 190)"');
    // surf around the isle and the drowned spires
    o += P('M168,180 Q180,172 192,177 Q206,169 222,175 Q238,168 254,174 Q272,167 290,173 Q308,167 326,173 Q344,167 362,173 Q380,168 398,174 Q414,169 428,175 Q442,171 456,180 Q420,185 370,183 Q300,186 240,183 Q196,185 168,180 Z', '#c8e0e6', 1.2, 'opacity="0.92"');
    o += P('M136,188 Q148,178 162,185 Q170,180 178,187 Q156,192 136,188 Z M446,190 Q458,180 474,188 Q462,194 446,190 Z M100,190 Q110,182 122,188 Q110,193 100,190 Z', '#c8e0e6', 1, 'opacity="0.88"');
    // the bolt's light on the water
    o += E(300, 182, 50, 7, c.glow('#d8f4ff', 0.6));
    // churning sea: rows of steep, foam-capped swells, back to front
    var rows = [[184, 6, 30, '#2a5662', '#10262e'], [196, 9, 40, '#2c5e6a', '#0e222a'], [212, 13, 54, '#2e6672', '#0c1e26'], [232, 18, 72, '#316e7a', '#0a1a20'], [258, 24, 96, '#347684', '#08161c']];
    rows.forEach(function (rw, ri) {
      var y = rw[0], A = rw[1], S = rw[2], x = -30 - r() * 30, d = 'M-40,290 L-40,' + y, caps = '', spray = '';
      while (x < 520) {
        var w = S * (0.7 + r() * 0.6), yy = y + (r() - 0.5) * A * 0.6, px = x + w * 0.6, py = yy - A * (0.7 + r() * 0.5);
        d += ' L' + n(x) + ',' + n(yy) + ' C' + n(x + w * 0.3) + ',' + n(yy - A * 0.1) + ' ' + n(px - w * 0.18) + ',' + n(py) + ' ' + n(px) + ',' + n(py) + ' C' + n(px + w * 0.06) + ',' + n(py + A * 0.5) + ' ' + n(x + w * 0.85) + ',' + n(yy + A * 0.15) + ' ' + n(x + w) + ',' + n(yy);
        // foam: a crest cap spilling down the lee side
        caps += 'M' + n(px - w * 0.22) + ',' + n(py + A * 0.28) + ' Q' + n(px - w * 0.06) + ',' + n(py - A * 0.12) + ' ' + n(px + w * 0.05) + ',' + n(py + A * 0.1) + ' Q' + n(px + w * 0.1) + ',' + n(py + A * 0.5) + ' ' + n(px + w * 0.18) + ',' + n(py + A * 0.7) +
          ' Q' + n(px + w * 0.02) + ',' + n(py + A * 0.45) + ' ' + n(px - w * 0.04) + ',' + n(py + A * 0.3) + ' Q' + n(px - w * 0.12) + ',' + n(py + A * 0.36) + ' ' + n(px - w * 0.22) + ',' + n(py + A * 0.28) + ' Z ';
        if (ri > 1) for (var k = 0; k < 3; k++) spray += E(px + (r() - 0.3) * w * 0.3, py - r() * A * 0.5 - 1, 0.6 + ri * 0.25, 0.6 + ri * 0.25, '#e4f4f6', 0, 'opacity="0.8"');
        x += w;
      }
      d += ' L520,290 Z';
      o += P(d, c.lin([[0, rw[3]], [0.1, mix(rw[3], rw[4], 0.45)], [0.4, rw[4]], [1, rw[4]]]), 1.2 + ri * 0.3);
      o += P(caps, '#dcf0f2', 0.8 + ri * 0.2) + spray;
    });
    // foam streaks in the troughs
    var fs = '';
    for (var i = 0; i < 30; i++) { var fx = r() * 480, fy = 200 + r() * 66, fw = 6 + r() * 16; fs += 'M' + n(fx) + ',' + n(fy) + ' q' + n(fw / 2) + ',-2 ' + n(fw) + ',0 '; }
    o += L(fs, '#a4ccd4', 1.1, 'opacity="0.5"');
    // rain
    var rn = '';
    for (var j = 0; j < 150; j++) { var rx = r() * 520 - 20, ry = r() * 270, rl = 10 + r() * 12; rn += 'M' + n(rx) + ',' + n(ry) + ' l' + n(-rl * 0.35) + ',' + n(rl) + ' '; }
    o += L(rn, '#b0c8d8', 0.8, 'opacity="0.28"');
    o += vignette(c, 0.55);
    return wrap(c, 480, 270, o);
  }

  // =====================================================================
  // ACTORS (160 x 160, transparent, facing LEFT, feet on bottom edge)
  // =====================================================================

  function windsor() {
    var c = new Ctx(), o = '';
    var PL = '#b3b9c3', GOLD = '#c99a38', BLUE = '#1f4c98', SK = '#d9a482', HAIR = '#a4a6a6', BEARD = '#d2d2cc', IRON = '#5a5c64', LEA = '#5a3a24';
    o += E(84, 155, 50, 5, c.shade());
    // torn cape, ragged hem and a rip
    o += P('M64,50 C56,78 48,110 40,140 L46,147 L51,139 L57,151 L65,142 L72,153 L80,144 L89,152 L96,141 L104,150 L110,139 L118,148 L125,136 L134,142 C124,110 112,78 100,50 Z', c.cel(BLUE, 0.2, 0.5), 2);
    o += P('M114,96 L119,107 L117,113 L122,125 L119,137 L114,121 L116,112 Z', dk(BLUE, 0.62), 1.1);
    o += L('M80,60 C78,92 76,118 72,146 M98,62 C106,92 112,116 116,138', dk(BLUE, 0.35), 1.2);
    // legs + sabatons
    o += P('M84,108 L86,146 L100,146 L98,108 Z', c.cel(dk(PL, 0.15)), 1.8) + P('M84,144 L102,144 L104,155 L84,155 Z', c.cel(dk(PL, 0.2)), 1.8);
    o += P('M62,108 L62,146 L76,146 L78,108 Z', c.cel(PL), 1.8) + P('M52,146 L78,144 L78,155 L50,155 Q48,150 52,146 Z', c.cel(dk(PL, 0.05)), 1.8);
    o += E(70, 126, 6, 5, c.cel(PL), 1.4) + L('M65,128 Q70,131 75,128', GOLD, 1) + E(92, 126, 5.5, 4.5, c.cel(dk(PL, 0.15)), 1.4);
    // far arm (behind): fist, manacle, broken chain
    o += limb('M100,58 L109,80 L106,96', dk(PL, 0.18), 8);
    o += chain(110, 98, 114, 120, 2.4, dk(IRON, 0.1));
    o += E(106, 101, 5, 5, c.cel(dk(SK, 0.12)), 1.5);
    o += R(100, 91, 12, 6.5, c.cel(dk(IRON, 0.1), 0.35, 0.4), 1.5, 'rx="1.6" transform="rotate(-12 106 94)"');
    // faulds, breastplate
    o += P('M58,90 L102,90 L106,114 L54,114 Z', c.cel(PL), 1.8);
    o += L('M56,102 L104,102', dk(PL, 0.3), 1.2) + L('M54,114 L106,114', GOLD, 1.6);
    o += P('M58,52 Q80,45 102,52 L104,92 Q80,98 56,92 Z', c.cel(PL), 2);
    // scratches and dents in the plate
    o += L('M60,64 l5,5 M99,70 l-3,7 M100,96 l-5,6 M58,106 l6,-2', lt(PL, 0.55), 0.9) + L('M61,66 l4,4 M98,72 l-2,5', dk(PL, 0.4), 0.8);
    o += P('M96,82 q3,-2 5,1 q-2,3 -5,-1 Z', dk(PL, 0.3), 0.6);
    // tabard: blue and gold, the lion-sun on the chest, hem torn to rags
    o += P('M68,53 Q80,50 92,53 L94,92 L97,133 L92,127 L89,136 L85,128 L81,137 L77,128 L73,135 L70,127 L65,133 L68,92 Z', c.cel(BLUE, 0.25, 0.45), 1.6);
    o += L('M70.5,56 L70.5,92 L68,127 M89.5,56 L91.5,92 L94,127', GOLD, 1.2);
    o += crest(80, 70, 4.6, GOLD);
    // belt
    o += R(57, 86, 48, 6, c.cel(LEA), 1.4) + R(77, 85, 7, 8, c.cel(GOLD), 1.1) + R(79, 87, 3, 4, dk(GOLD, 0.5));
    // near arm: fist raised in defiance, manacle still on, broken chain swinging below
    o += limb('M60,60 L47,76 L43,58', PL, 8);
    o += chain(38.5, 62, 33, 86, 2.6, IRON);
    var brk = 'M30.6,86 C28,88 28.5,92 31.6,93 M34.6,87 C36.6,90 35,93 32.6,93.4';
    o += L(brk, OL, 2.2) + L(brk, IRON, 1.1);
    o += R(36, 57, 14, 7.5, c.cel(IRON, 0.35, 0.4), 1.6, 'rx="1.8" transform="rotate(-6 43 60.5)"') + E(39.4, 60.6, 1, 1, lt(IRON, 0.5)) + E(46.4, 60, 1, 1, lt(IRON, 0.5));
    o += P('M37,54 C36,48 39,44.6 43.6,44.6 C48,44.6 50.4,48 49.8,52 C49.4,55.6 46.6,57.6 43,57.6 C40,57.6 37.6,56.4 37,54 Z', c.cel(SK), 1.6);
    o += L('M38.4,49.4 L49,48.8 M38,52.6 L48.8,52.4 M41.4,45.4 L41.8,49 M45.2,45 L45.4,48.8', dk(SK, 0.35), 0.8);
    o += P('M49.4,50 C51.6,51 52,54 50,55.6 L48.4,54 Z', c.cel(SK), 1);
    // pauldrons (near one dented and notched)
    o += P('M88,46 C100,40 114,46 114,58 C108,68 92,66 88,58 Z', c.cel(dk(PL, 0.06)), 1.8) + L('M91,50 C99,45 107,47 111,53', GOLD, 1.3);
    o += P('M46,58 C46,46 58,40 70,46 L74,58 C70,68 52,70 46,58 Z', c.cel(PL), 1.8);
    o += L('M48,58 C50,52 58,49 67,51', GOLD, 1.3) + P('M52,62 L55,57 L58,63 Z', dk(PL, 0.45), 0.8) + L('M60,48 q3,2 2,5', dk(PL, 0.4), 0.8);
    // gorget
    o += P('M70,44 L90,44 L92,52 Q80,56 68,52 Z', c.cel(PL), 1.6) + L('M69,51.5 Q80,55.5 91.5,51.5', GOLD, 1.1);
    // head: weathered face, receding grey hair
    o += P('M69,26 C70,14 82,10 90,14 C96,18 97,28 95,36 C93,44 86,48 79,48 C74,48 70,44 69,40 L66,35 L68.5,33 Z', c.cel(SK), 1.8);
    o += P('M78,13.5 C83,9 92,9 96.5,13.5 C101,19 100.5,28 98,35 L95.4,39 L94.6,30 C94,24 91,20 87,18.6 C84,17 80.6,15.6 78,13.5 Z', c.cel(HAIR, 0.3, 0.4), 1.5);
    o += L('M72,20.5 Q77,18.4 83,19.6 M71,23.4 Q75,22 79,22.6', dk(SK, 0.3), 0.8);
    o += L('M84,13.4 Q91,12.6 96.4,17 M89.4,17.4 Q95,19 97.4,25 M94.6,26 Q97,29 97,33', dk(HAIR, 0.35), 0.9) + L('M82,12.2 Q88,10.6 93,12', lt(HAIR, 0.45), 1);
    // full grey beard and heavy drooping moustache
    o += P('M93.6,34 C95.6,43 91,52 83,54.5 C76,56 70.6,52.5 68.6,46 C72,48.4 77,48.6 81,47.6 C87,46.4 91.4,41.6 93.6,34 Z', c.cel(BEARD, 0.2, 0.38), 1.4);
    o += P('M67.4,39 C70.4,37 75.4,36.8 79.4,38.6 C83,37.2 87,37.8 89.4,39.8 C88.8,43.6 87.6,46.4 86.6,49.6 C84.6,45.6 82.4,42.8 79.4,42.2 C76.4,42.8 72.4,45 69.6,49 C68.6,45.4 67.4,42.4 67.4,39 Z', c.cel(BEARD, 0.25, 0.4), 1.3);
    o += L('M75.8,39.6 L79.4,40.6 L83,39.6', dk(BEARD, 0.4), 0.8);
    // stern bushy brows, eyes, nose, scar
    o += L('M70,27 L78.8,28.6 M82.2,28.6 L89.4,27.2', OL, 2.8) + L('M70.4,26.6 L78.4,28 M82.6,28 L89,26.8', BEARD, 1.2);
    o += E(75, 31.4, 1.3, 1.3, OL) + E(85.2, 31.4, 1.2, 1.2, OL);
    o += L('M72.6,33.6 Q74.6,34.6 77,33.8', dk(SK, 0.3), 0.7);
    o += L('M68.5,33 L66.8,36.4 L69.2,37', dk(SK, 0.4), 1);
    o += L('M85.6,23.6 L89.6,34.6', '#9a5a4a', 1.2);
    o += E(92, 32, 2, 3, c.cel(SK), 1.2);
    return wrap(c, 160, 160, o);
  }

  function aeldran() {
    var c = new Ctx(), o = '';
    var SK = '#a4d6c2', HAIR = '#eef6f3', ROBE = '#1c4c5e', ROBE2 = '#2c7674', GOLD = '#c2a452', VERD = '#5aae98', ARM = '#3c7c74', CORAL = '#ea6a50', PEARL = '#f6f2ea', KELP = '#4f7030', BARN = '#cdc8b6', EYE = '#62f6e8';
    function barn(x, y, r) { return E(x, y, r, r * 0.82, c.cel(BARN, 0.3, 0.35), 0.9) + E(x, y - r * 0.12, r * 0.42, r * 0.32, dk(BARN, 0.55)); }
    function coral(x, y, h, lean) {
      var tx = x + lean, ty = y - h, d = 'M' + n(x) + ',' + n(y) + ' Q' + n(x + lean * 0.2) + ',' + n(y - h * 0.5) + ' ' + n(tx) + ',' + n(ty) +
        ' M' + n(x + lean * 0.25) + ',' + n(y - h * 0.45) + ' q' + n(-3 - lean * 0.2) + ',' + n(-h * 0.18) + ' ' + n(-4 - lean * 0.2) + ',' + n(-h * 0.36) +
        ' M' + n(x + lean * 0.5) + ',' + n(y - h * 0.62) + ' q' + n(3 + lean * 0.2) + ',' + n(-h * 0.12) + ' ' + n(3.6 + lean * 0.3) + ',' + n(-h * 0.28);
      return L(d, OL, 3.6) + L(d, CORAL, 1.9) + L(d, lt(CORAL, 0.35), 0.6, 'opacity="0.8"');
    }
    function bubble(x, y, r) { return E(x, y, r, r, '#dffcff', 0, 'fill-opacity="0.18" stroke="#c8fff8" stroke-width="0.7" stroke-opacity="0.8"') + E(x - r * 0.35, y - r * 0.35, r * 0.28, r * 0.22, '#ffffff', 0, 'opacity="0.8"'); }
    o += E(82, 80, 76, 78, c.glow('#3adcd0', 0.2));
    o += E(86, 155, 48, 5, c.shade());
    // hair floating up and back, as if still underwater
    var HF = c.lin([[0, '#ffffff'], [0.5, HAIR], [1, '#b6d6d2']], 0, 0, 1, 1);
    var locks = [
      [[[90, 18], [104, 6], [122, 4], [138, 12]], 10, [2.2, 3]],
      [[[94, 22], [114, 12], [134, 24], [152, 16]], 11, [2.6, 3.4, 1]],
      [[[96, 28], [118, 32], [132, 50], [150, 46]], 11, [2.4, 3.2, 2]],
      [[[96, 34], [110, 50], [122, 68], [140, 74]], 10, [2.2, 3.4]],
      [[[94, 40], [104, 60], [110, 80], [126, 94]], 8, [2, 3, 1]]
    ];
    locks.forEach(function (lk) { o += P(taper(lk[0], lk[1], 1.2, 24, lk[2]), HF, 1.4); });
    o += L('M100,20 Q116,12 132,10 M102,30 Q120,32 136,40 M100,38 Q112,52 124,64', '#a8ccc8', 0.9);
    // long sleeve of the far arm, hand at rest
    o += P('M94,54 C104,64 110,80 112,98 L100,102 C100,88 96,74 90,64 Z', c.cel(ROBE, 0.25, 0.5), 1.6);
    o += E(104, 103, 3.6, 4.4, c.cel(SK), 1.2) + L('M102,106 l-0.6,3.6 M104.6,106.6 l0,3.6', OL, 1.1);
    // robe, hem drifting in the current
    o += P('M66,52 C60,80 52,114 44,150 Q52,156 62,151 Q72,158 83,152 Q95,158 106,151 Q118,156 132,146 C122,112 108,80 98,52 Z', c.cel(ROBE, 0.25, 0.5), 2);
    o += P('M72,78 L91,78 L99,152 Q84,156 66,152 Z', c.cel(ROBE2, 0.3, 0.45), 1.6);
    o += L('M72.5,80 L67,150 M90.5,80 L98,150', GOLD, 1.3);
    o += P('M82,100 C76,104 76,114 82,118 C79,113 79,105 82,100 Z M82,100 l1.6,0 l-1,2 Z', GOLD, 1) + E(84.5, 109, 1.6, 1.6, PEARL, 0.7);
    o += L('M58,110 C56,124 52,138 48,148 M112,108 C116,122 122,134 128,144', dk(ROBE, 0.4), 1.2);
    // kelp tangled in the robe
    o += P(taper([[70, 82], [66, 100], [62, 118], [56, 140]], 4.6, 1, 20, [4, 2.4]), c.cel(KELP, 0.3, 0.4), 1.2);
    o += P(taper([[94, 82], [100, 102], [104, 122], [114, 142]], 5, 1, 20, [4, 2.6, 1]), c.cel(KELP, 0.3, 0.4), 1.2);
    o += P(taper([[88, 84], [88, 100], [92, 112], [90, 128]], 3.6, 1, 16, [3, 2]), c.cel(lt(KELP, 0.12), 0.3, 0.4), 1.1);
    // barnacles crusting the hem
    o += barn(52, 146, 2.8) + barn(57, 142, 2.2) + barn(60, 148, 2.4) + barn(47, 142, 1.8) + barn(118, 146, 2.6) + barn(124, 141, 2) + barn(112, 150, 2);
    // breastplate + sash
    o += P('M66,52 Q80,47 96,52 L94,78 Q82,82 69,78 Z', c.cel(ARM, 0.3, 0.42), 1.8);
    o += L('M67,53 Q80,48.5 95,53', GOLD, 1.3) + P('M76,58 C72,62 72,70 76,74 C74,68 74,62 76,58 Z', GOLD, 0.8) + L('M84,56 L86,72', VERD, 1);
    o += barn(90, 60, 2.2) + barn(93, 66, 1.6) + barn(70, 70, 1.6);
    o += P('M67,75 Q82,80 96,75 L96,81 Q82,86 67,81 Z', c.cel(GOLD), 1.3) + E(81.5, 81.5, 2.4, 2.4, c.cel(PEARL, 0.3, 0.3), 0.9);
    // trident: shaft, near arm gripping it, three-pronged head overgrown with coral
    var SH = c.lin([[0, '#e4cf8a'], [0.45, '#a88e48'], [1, '#5e4e24']], 0, 0, 1, 0);
    o += P('M42.6,29 L45.4,29 L45.4,150 L44,156 L42.6,150 Z', SH, 1.4);
    o += L('M44,50 l0,4 M44,120 l0,4', VERD, 2.2);
    var TR = '';
    TR += P('M31,20 C31,28 37,31 44,31 C51,31 57,28 57,20 L55,21 C54,26 50,27.6 44,27.6 C38,27.6 34,26 33,21 Z', c.cel(GOLD), 1.3);
    TR += P('M31,21 L29,6 L33.6,11 L33,21 Z', c.cel(GOLD, 0.35, 0.4), 1.2) + P('M57,21 L59,6 L54.4,11 L55,21 Z', c.cel(GOLD, 0.35, 0.4), 1.2);
    TR += P('M42.4,28 L42.4,8 L39.6,10 L44,-0.5 L48.4,10 L45.6,8 L45.6,28 Z', c.cel(GOLD, 0.35, 0.4), 1.2);
    TR += coral(36, 29, 9, -4) + coral(53, 28, 7, 4);
    TR += E(44, 33, 8, 8, c.glow(EYE, 0.85)) + E(44, 33, 3, 3, c.rad([[0, '#ffffff'], [0.5, EYE], [1, '#1a9a90']]), 1);
    o += G(TR, 'transform="translate(0,3.5)"');
    o += limb('M67,57 L54,72 L46,84', ROBE, 7);
    o += P('M50,80 L55,90 L45,93 L41,86 Z', c.cel(ROBE2), 1.2);
    o += E(44, 88, 4.4, 4, c.cel(SK), 1.2) + L('M41,87 L47,87 M41.2,89.6 L46.6,89.6', dk(SK, 0.35), 0.7);
    // tall upswept Highborne pauldrons, barnacled
    o += P('M88,48 C94,42 104,40 112,30 C114,40 112,52 108,58 C102,62 92,60 88,54 Z', c.cel(ARM, 0.3, 0.45), 1.6) + L('M91,49 C98,45 106,42 110,36', GOLD, 1.1);
    o += P('M50,62 C46,52 50,42 58,40 C54,36 50,32 46,24 C60,28 72,38 74,52 C70,62 58,66 50,62 Z', c.cel(ARM, 0.3, 0.45), 1.8);
    o += L('M52,58 C51,50 55,44 62,43 M50,32 C58,36 66,42 70,50', GOLD, 1.1);
    o += barn(58, 56, 2.4) + barn(64, 59, 1.8) + barn(54, 49, 1.6);
    o += P(taper([[70, 48], [68, 58], [60, 64], [58, 76]], 3.4, 1, 14, [3, 1.6]), c.cel(KELP, 0.3, 0.4), 1);
    // neck with faint gill lines, then the head
    o += P('M76,38 L76,50 L86,50 L86,38 Z', c.cel(SK), 1.4) + L('M79.5,43 l3.5,1 M79.5,46 l3.5,1', '#3a9a90', 0.8);
    o += P('M70,24 C71,14 82,10 89,14 C95,18 96,28 94,36 C92,44 86,50 80,51 C76,51 72,47 71,43 L67.5,36 L70,34 C69.5,30 69.5,27 70,24 Z', c.cel(SK, 0.3, 0.38), 1.6);
    // long elven ear sweeping back and up
    o += P('M91,32 C98,28 108,20 118,10 C114,22 106,32 94,39 Z', c.cel(SK, 0.3, 0.38), 1.3) + L('M94,34 C101,30 107,24 112,18', dk(SK, 0.3), 0.8);
    // hair: parted crown, a lock floating free in front of the shoulder
    o += P('M69,24 C68,12 80,5 90,8 C98,11 102,20 100,30 C98,24 94,19 88,17 C82,15 75,18 69,24 Z', c.cel(HAIR, 0.3, 0.3), 1.5);
    o += P(taper([[71, 22], [62, 30], [60, 44], [54, 54]], 5, 1, 18, [2, 2]), HF, 1.3);
    // glowing teal eyes, fine brows, haughty mouth
    o += P('M70.2,29.2 Q74.6,26.4 79.6,27.8 L78.8,32.8 Q74,33.6 70.6,31.4 Z', dk(SK, 0.5)) + P('M81.8,27.8 Q85.6,26.6 89.2,28.2 L88.6,31.8 Q85,32.8 82.4,31.6 Z', dk(SK, 0.5));
    o += E(75, 30, 8.5, 5.5, c.glow(EYE, 1)) + E(85.5, 30, 7, 5, c.glow(EYE, 0.95));
    var EG = c.rad([[0, '#ffffff'], [0.45, '#d8fffa'], [1, EYE]]);
    o += P('M71,30.4 L79,28.4 L77.8,32 Z', EG, 0.7) + P('M82.2,28.8 L88.4,29.4 L83.4,31.8 Z', EG, 0.7);
    o += L('M70.5,26 Q74,24.2 78.6,25.8 M82.4,25.8 Q85.6,24.4 88.6,25.6', OL, 1.1);
    o += L('M68.2,33.5 L67.6,37.2', dk(SK, 0.35), 1) + L('M72.6,43.4 Q75.6,44.2 79,42.8', dk(SK, 0.55), 1);
    // crown of coral and pearls
    o += coral(71, 21, 12, -5) + coral(76, 18.6, 14, -2.5) + coral(83, 17.6, 15, 1.5) + coral(89, 18.6, 12, 5);
    o += P('M68,21.5 Q80,16 92,19 L92.6,23.4 Q80,20.4 68.4,26 Z', c.cel(GOLD), 1.2);
    o += E(71.6, 23.2, 1.5, 1.5, PEARL, 0.7) + E(80.4, 20, 2.3, 2.3, c.cel(PEARL, 0.4, 0.25), 0.8) + E(88.4, 20.4, 1.5, 1.5, PEARL, 0.7) + E(76, 21.4, 1.1, 1.1, PEARL, 0.6) + E(84.6, 19.8, 1.1, 1.1, PEARL, 0.6);
    // rising bubbles
    o += bubble(28, 42, 2.2) + bubble(24, 32, 1.5) + bubble(33, 52, 1.2) + bubble(62, 8, 1.6) + bubble(122, 32, 1.4) + bubble(140, 60, 1.8) + bubble(20, 66, 1.3);
    return wrap(c, 160, 160, o);
  }

  function nalveshra() {
    var c = new Ctx(), o = '';
    var BODY = '#101b2e', BL = '#26446a', DEEP = '#04070d', TEAL = '#46f2dc', VIO = '#a266f2', BONE = '#d6e8e4';
    var CX = 80, CY = 108, RX = 46, RY = 32;
    // abyss haze
    o += E(80, 86, 76, 76, c.glow('#1e5a7a', 0.45));
    o += E(80, 72, 64, 54, c.glow(VIO, 0.2));
    // dorsal spines fanning from the crown (the top centre is left clear for the lure)
    var SP = c.lin([[0, '#3a5270'], [1, '#141e30']], 0, 0, 1, 1), spines = '';
    [[-150, 14], [-130, 20], [-110, 16], [-70, 16], [-50, 20], [-30, 14]].forEach(function (q) {
      var a = q[0] * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), rb = 56, px = -sa, py = ca;
      var bx = 80 + ca * rb * 1.08, by2 = 78 + sa * rb, tx = 80 + ca * (rb * 1.08 + q[1]), ty = 78 + sa * (rb + q[1]);
      spines += P('M' + n(bx + px * 4.2) + ',' + n(by2 + py * 4.2) + ' Q' + n((bx + tx) / 2 + px * 1.6) + ',' + n((by2 + ty) / 2 + py * 1.6) + ' ' + n(tx) + ',' + n(ty) + ' Q' + n((bx + tx) / 2 - px * 0.6) + ',' + n((by2 + ty) / 2 - py * 0.6) + ' ' + n(bx - px * 4.2) + ',' + n(by2 - py * 4.2) + ' Z', SP, 1.4);
      spines += E(tx, ty, 1.3, 1.3, VIO, 0, 'opacity="0.9"');
    });
    // tentacles behind, curling up out of the dark
    var TF = c.lin([[0, '#20406a'], [0.55, '#122038'], [1, DEEP]], 0, 0, 1, 1);
    var tents = [
      [[[44, 150], [12, 150], [2, 116], [16, 90]], 16, [2, 3]],
      [[[50, 128], [26, 112], [22, 80], [13, 62]], 11, [2.6, 2.6, 1]],
      [[[116, 150], [148, 150], [158, 116], [144, 90]], 16, [2, 3, 1]],
      [[[110, 128], [134, 112], [138, 80], [147, 62]], 11, [2.6, 2.6]]
    ];
    var tipGlow = '', suck = '';
    tents.forEach(function (tn) {
      var q = tn[0], d = taper(q, tn[1], 1.6, 26, tn[2]);
      o += P(d, TEAL, 0, 'opacity="0.85" transform="translate(-1.4,-1.4)"') + P(d, TF, 1.8);
      o += P(taper(q, tn[1] * 0.3, 0.5, 26, tn[2]), '#3a6a90', 0, 'opacity="0.55"');
      var tip = bz(q, 1);
      tipGlow += E(tip[0], tip[1], 8, 8, c.glow(TEAL, 0.9)) + E(tip[0], tip[1], 2.2, 2.2, '#e8fffb', 0.8);
      for (var i = 2; i < 7; i++) { var p = bz(q, 0.2 + i * 0.1); suck += E(p[0], p[1], 1.6 - i * 0.12, 1.6 - i * 0.12, TEAL, 0, 'opacity="0.8"'); }
    });
    o += suck;
    // spined fin fans at the sides of the head
    var finL = 'M38,52 L18,20 Q20,36 8,40 Q18,50 4,58 Q16,64 8,76 L34,78 Z', finR = 'M122,52 L142,20 Q140,36 152,40 Q142,50 156,58 Q144,64 152,76 L126,78 Z';
    var FM = c.lin([[0, '#5e2c90'], [0.6, '#2a1446'], [1, '#120a22']], 0, 0, 1, 1);
    o += P(finL, FM, 1.6) + P(finR, FM, 1.6);
    var fr = 'M36,56 L18,20 M34,62 L8,40 M32,68 L4,58 M32,74 L8,76 M124,56 L142,20 M126,62 L152,40 M128,68 L156,58 M128,74 L152,76';
    o += L(fr, OL, 2.2) + L(fr, '#8a5ac8', 0.9);
    o += spines;
    // the lure stalk grows from behind the crown
    o += P(taper([[78, 34], [78, 6], [48, 2], [32, 16]], 5.4, 2.4, 24), c.lin([[0, BL], [1, BODY]], 0, 0, 1, 0), 1.5);
    // the great head-body, rising from the abyss (teal and violet rim light)
    var body = 'M22,108 C14,74 28,34 60,21 C72,16 88,16 100,21 C132,34 146,74 138,108 C134,128 126,146 122,162 L38,162 C34,146 26,128 22,108 Z';
    o += P(body, TEAL, 0, 'opacity="0.85" transform="translate(-1.6,-1.4)"') + P(body, VIO, 0, 'opacity="0.75" transform="translate(1.6,-1)"');
    o += P(body, c.lin([[0, BL], [0.3, BODY], [0.75, dk(BODY, 0.3)], [1, DEEP]], 0.3, 0, 0.6, 1), 2.2);
    o += P('M36,46 C50,30 66,24 80,23 C64,28 50,38 42,54 Z', lt(BL, 0.14), 0, 'opacity="0.75"');
    // barbels hanging from the jaw corners
    o += P(taper([[28, 102], [18, 114], [20, 128], [12, 138]], 4.4, 1, 16), c.cel(BODY, 0.3, 0.3), 1.4) + P(taper([[132, 102], [142, 114], [140, 128], [148, 138]], 4.4, 1, 16), c.cel(BODY, 0.3, 0.3), 1.4);
    o += E(12, 138, 4, 4, c.glow(TEAL, 0.9)) + E(148, 138, 4, 4, c.glow(TEAL, 0.9));
    // the maw
    function upY(x) { var u = (x - CX) / RX; return CY - RY * Math.pow(Math.max(0, 1 - u * u), 0.7) * 0.95; }
    function loY(x) { var u = (x - CX) / RX; return CY + RY * Math.pow(Math.max(0, 1 - u * u), 0.7) * 1.05; }
    var mo = [], i2;
    for (i2 = 0; i2 <= 40; i2++) { var xu = CX - RX + i2 * RX / 20; mo.push([xu, upY(xu)]); }
    for (i2 = 40; i2 >= 0; i2--) { var xl = CX - RX + i2 * RX / 20; mo.push([xl, loY(xl)]); }
    o += P(pd(mo, true), c.rad([[0, '#4a1a66'], [0.45, '#22083a'], [1, '#07020c']], 0.5, 0.62, 0.6), 2);
    o += E(80, 120, 20, 12, c.glow(VIO, 0.7));
    var TT = c.lin([[0, '#ffffff'], [0.5, BONE], [1, '#8aa6aa']], 0, 0, 1, 0), teeth = '';
    [[40, 9], [47, 15], [55, 12], [63, 24], [72, 15], [88, 22], [96, 13], [104, 19], [112, 13], [119, 8]].forEach(function (t) {
      var x = t[0], y = upY(x) + 0.8, lean = (CX - x) * 0.08;
      teeth += P('M' + n(x - 2.4) + ',' + n(y) + ' Q' + n(x - 1) + ',' + n(y + t[1] * 0.6) + ' ' + n(x + lean) + ',' + n(y + t[1]) + ' Q' + n(x + 1.2) + ',' + n(y + t[1] * 0.5) + ' ' + n(x + 2.4) + ',' + n(y) + ' Z', TT, 1);
    });
    [[45, 8], [54, 14], [64, 18], [74, 11], [86, 13], [96, 19], [106, 14], [115, 8]].forEach(function (t) {
      var x = t[0], y = loY(x) - 0.8, lean = (CX - x) * 0.08;
      teeth += P('M' + n(x - 2.2) + ',' + n(y) + ' Q' + n(x - 1) + ',' + n(y - t[1] * 0.6) + ' ' + n(x + lean) + ',' + n(y - t[1]) + ' Q' + n(x + 1.1) + ',' + n(y - t[1] * 0.5) + ' ' + n(x + 2.2) + ',' + n(y) + ' Z', TT, 1);
    });
    o += teeth + L(pd(mo.slice(2, 39)), '#2c4a6a', 1.6, 'opacity="0.9"');
    // bioluminescent lines and dots
    o += L('M28,94 C26,78 32,60 44,48 M132,94 C134,78 128,60 116,48', VIO, 1.4, 'opacity="0.75"');
    var dots = '';
    [[50, 36], [58, 31], [67, 27.5], [93, 27.5], [102, 31], [110, 36], [36, 112], [124, 112], [42, 128], [118, 128]].forEach(function (q, k) { dots += E(q[0], q[1], k < 6 ? 1.4 : 1.8, k < 6 ? 1.4 : 1.8, TEAL, 0, 'opacity="0.9"'); });
    o += dots;
    // many eyes: slanted, slit-pupilled, glaring
    var eyes = [[62, 66, 7.6, TEAL, 18], [98, 66, 7.6, TEAL, -18], [46, 77, 4.6, TEAL, 22], [114, 77, 4.6, TEAL, -22], [70, 51, 3.2, TEAL, 14], [90, 51, 3.2, TEAL, -14], [80, 58, 3.2, VIO, 0], [36, 91, 3, VIO, 26], [124, 91, 3, VIO, -26]];
    eyes.forEach(function (e) {
      var x = e[0], y = e[1], r = e[2];
      o += E(x, y, r * 2.4, r * 2, c.glow(e[3], 0.7));
      o += P('M' + n(x - r) + ',' + n(y) + ' Q' + n(x) + ',' + n(y - r * 0.9) + ' ' + n(x + r) + ',' + n(y) + ' Q' + n(x) + ',' + n(y + r * 0.7) + ' ' + n(x - r) + ',' + n(y) + ' Z', c.rad([[0, '#ffffff'], [0.4, e[3]], [1, dk(e[3], 0.4)]]), r > 4 ? 1.5 : 1.1, 'transform="rotate(' + e[4] + ' ' + n(x) + ' ' + n(y) + ')"');
      o += E(x, y, r * 0.14, r * 0.42, DEEP, 0, 'transform="rotate(' + e[4] + ' ' + n(x) + ' ' + n(y) + ')"');
    });
    // heavy brow bearing down on the big eyes
    o += P('M50,60 C58,54 68,55 76,62 L80,65 L84,62 C92,55 102,54 110,60 L108,56 C100,51 90,52 84,57 L80,60 L76,57 C70,52 60,51 52,56 Z', dk(BODY, 0.3), 1.4);
    o += tipGlow;
    // the lure: a stalk from the crown arching forward to a burning teal bulb
    o += E(28, 22, 20, 20, c.glow(TEAL, 0.85));
    o += P('M28,15 C34,15 36,23 32,29 C30,31 26,31 24,29 C20,23 22,15 28,15 Z', c.rad([[0, '#ffffff'], [0.4, '#b8fff4'], [1, TEAL]], 0.4, 0.4, 0.6), 1.5);
    o += L('M26,30 q-1,4 1,7 M30,30 q2,3 0,6', TEAL, 1, 'opacity="0.8"');
    return wrap(c, 160, 160, o);
  }

  // =====================================================================
  // WRAP the existing ART.story
  // =====================================================================
  function sceneUnknown() {
    var c = new Ctx();
    return wrap(c, 480, 270, R(0, 0, 480, 270, c.vgrad('#5a5a62', '#2e2e34')) + P('M0,190 Q240,170 480,190 L480,270 L0,270 Z', '#3a3a40', 2) + vignette(c, 0.5));
  }
  function actorUnknown() {
    var c = new Ctx();
    return wrap(c, 160, 160, E(80, 155, 36, 5, c.shade()) + P('M58,154 C58,110 64,70 80,70 C96,70 102,110 102,154 Z', c.cel('#7a7a84'), 2) + E(80, 50, 16, 17, c.cel('#8a8a94'), 2));
  }
  var BLANK_SCENE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="480" height="270"><rect width="480" height="270" fill="#444"/></svg>';
  var BLANK_ACTOR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"></svg>';
  function safe(fn, fb, blank) { try { var s = fn(); if (typeof s === 'string' && s) return s; } catch (e) { } try { return fb(); } catch (e2) { return blank; } }

  var SCENES = { stormveil_storm: stormveilScene };
  var ACTORS = { windsor: windsor, aeldran: aeldran, nalveshra: nalveshra };
  function has(o, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k); }

  var prev = (ART.story && (typeof ART.story === 'object' || typeof ART.story === 'function')) ? ART.story : {};
  var baseScene = typeof prev.scene === 'function' ? prev.scene : null;
  var baseActor = typeof prev.actor === 'function' ? prev.actor : null;
  function sceneFn(key) {
    if (has(SCENES, key)) return safe(SCENES[key], sceneUnknown, BLANK_SCENE);
    var self = this, args = arguments;
    return safe(function () { return baseScene ? baseScene.apply(self, args) : sceneUnknown(); }, sceneUnknown, BLANK_SCENE);
  }
  function actorFn(key) {
    if (has(ACTORS, key)) return safe(ACTORS[key], actorUnknown, BLANK_ACTOR);
    var self = this, args = arguments;
    return safe(function () { return baseActor ? baseActor.apply(self, args) : actorUnknown(); }, actorUnknown, BLANK_ACTOR);
  }
  function addKeys(list, keys) { var a = Array.isArray(list) ? list : []; keys.forEach(function (k) { if (a.indexOf(k) < 0) a.push(k); }); return a; }
  function copyKeys(list, keys) { return addKeys(Array.isArray(list) ? list.slice() : [], keys); }
  try {
    // extend in place so anything holding ART.story keeps working
    var K0 = (prev.keys && typeof prev.keys === 'object') ? prev.keys : {};
    K0.scenes = addKeys(K0.scenes, Object.keys(SCENES));
    K0.actors = addKeys(K0.actors, Object.keys(ACTORS));
    prev.keys = K0; prev.scene = sceneFn; prev.actor = actorFn;
    if (prev.scene !== sceneFn || prev.actor !== actorFn || prev.keys !== K0) throw new Error('read-only');
    ART.story = prev;
  } catch (e) {
    // frozen or read-only story object: publish a fresh one with copied key lists
    try {
      var pk = (prev.keys && typeof prev.keys === 'object') ? prev.keys : {};
      ART.story = { scene: sceneFn, actor: actorFn, keys: { scenes: copyKeys(pk.scenes, Object.keys(SCENES)), actors: copyKeys(pk.actors, Object.keys(ACTORS)) } };
    } catch (e2) { }
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
