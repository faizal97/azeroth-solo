/* art_arathi.js — Arathi Highlands zone art for Azeroth Solo (contested, levels 35-40: Refuge Pointe, Hammerfall,
 * the highland plains, Drywhisker Gorge, Witherbark Village, Stromgarde Keep, Boulderfist Hall, the Circle of West Binding).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Arathi keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, the raptor, the jungle-troll and human rigs and the camp pieces are shared copies of
 * art_stranglethorn.js. The kobold, ogre and elemental rigs are new here.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix ah<counter>_).
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};
  var OL = '#1a1009';
  var SEQ = 0;
  var PI = Math.PI;

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
  function pd(a, close) { return 'M' + a.map(pt).join('L') + (close ? 'Z' : ''); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- per-call context (unique ids, defs) ----------
  function Ctx() { this.p = 'ah' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
  Ctx.prototype.id = function () { return this.p + (this.k++).toString(36); };
  Ctx.prototype.cel = function (c) {
    var key = 'c' + c; if (this.cache[key]) return this.cache[key];
    var id = this.id();
    this.defs.push('<linearGradient id="' + id + '" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="' + lt(c, 0.3) + '"/><stop offset="0.4" stop-color="' + c + '"/><stop offset="0.72" stop-color="' + c + '"/><stop offset="1" stop-color="' + dk(c, 0.38) + '"/></linearGradient>');
    return (this.cache[key] = 'url(#' + id + ')');
  };
  Ctx.prototype.lg = function (stops, x1, y1, x2, y2) {
    var id = this.id();
    this.defs.push('<linearGradient id="' + id + '" x1="' + (x1 == null ? 0 : x1) + '" y1="' + (y1 == null ? 0 : y1) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stopsS(stops) + '</linearGradient>');
    return 'url(#' + id + ')';
  };
  Ctx.prototype.rg = function (stops) {
    var id = this.id();
    this.defs.push('<radialGradient id="' + id + '" cx="0.5" cy="0.5" r="0.5">' + stopsS(stops) + '</radialGradient>');
    return 'url(#' + id + ')';
  };
  Ctx.prototype.clip = function (d) { var id = this.id(); this.defs.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return id; };
  Ctx.prototype.svg = function (w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
      (this.defs.length ? '<defs>' + this.defs.join('') + '</defs>' : '') + body + '</svg>';
  };
  function stopsS(st) {
    return st.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('');
  }
  function glow(c, col, a) { return c.rg([[0, col, a == null ? 0.6 : a], [0.35, col, (a == null ? 0.6 : a) * 0.4], [1, col, 0]]); }

  // ---------- primitives ----------
  function P(d, fill, sw) { return '<path d="' + d + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '" stroke-linejoin="round" stroke-linecap="round"' : '') + '/>'; }
  function F(d, fill, op) { return '<path d="' + d + '" fill="' + fill + '"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function L(d, col, w, op) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, op) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function C(cx, cy, r, fill, sw, op) { return E(cx, cy, r, r, fill, sw, op); }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '" stroke-linejoin="round"' : '') + '/>'; }
  function G(s, tf, op) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '>' + s + '</g>'; }
  function at(s, x, y) { return 'matrix(' + n(s * 1000) / 1000 + ',0,0,' + n(s * 1000) / 1000 + ',' + n(x - x * s) + ',' + n(y - y * s) + ')'; }
  function limb(d, col, w) { return L(d, OL, w + 4.5) + L(d, col, w); }
  function body(c, d, col, shade, sw) {
    var s = P(d, c.cel(col), sw == null ? 2.5 : sw);
    if (shade) s += '<g clip-path="url(#' + c.clip(d) + ')">' + shade + '</g>';
    return s;
  }
  function shadow(c, cx, rx) { return E(cx, 122.5, rx, 8, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]])); }
  function flame(c, x, y, s, outer, inner) {
    var o = outer || '#ff7a1a', i = inner || '#ffd84a';
    return P('M' + pt([x, y]) + 'C' + pt([x - 8 * s, y]) + ' ' + pt([x - 9 * s, y - 9 * s]) + ' ' + pt([x - 4 * s, y - 14 * s]) + 'C' + pt([x - 4 * s, y - 9 * s]) + ' ' + pt([x - 1 * s, y - 9 * s]) + ' ' + pt([x, y - 20 * s]) +
      'C' + pt([x + 4 * s, y - 12 * s]) + ' ' + pt([x + 5 * s, y - 14 * s]) + ' ' + pt([x + 5 * s, y - 16 * s]) + 'C' + pt([x + 10 * s, y - 9 * s]) + ' ' + pt([x + 8 * s, y]) + ' ' + pt([x, y]) + 'Z', o, 1.6 * Math.max(0.7, s)) +
      F('M' + pt([x, y - 1 * s]) + 'C' + pt([x - 4 * s, y - 1 * s]) + ' ' + pt([x - 5 * s, y - 6 * s]) + ' ' + pt([x - 1 * s, y - 11 * s]) + 'C' + pt([x, y - 7 * s]) + ' ' + pt([x + 2 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 10 * s]) + 'C' + pt([x + 5 * s, y - 6 * s]) + ' ' + pt([x + 4 * s, y - 1 * s]) + ' ' + pt([x, y - 1 * s]) + 'Z', i);
  }
  function orb(c, x, y, r, col) { return C(x, y, r * 2.6, glow(c, col, 0.75)) + C(x, y, r, c.rg([[0, '#ffffff'], [0.5, lt(col, 0.4)], [1, col]]), 1.6); }
  function gEye(c, x, y, r, col) { return C(x, y, r * 3.2, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function ellD(x, y, rx, ry) { return 'M' + pt([x - rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x + rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x - rx, y]) + 'Z'; }
  // shaggy blob outline: points alternate between an outer and an inner ellipse, joined by soft curves
  function shag(cx, cy, rx, ry, k, jag, seed, a0) {
    var r = rng(seed || 7), d = '', pts = [];
    a0 = a0 || 0;
    for (var i = 0; i < k * 2; i++) {
      var a = a0 + PI * 2 * i / (k * 2), f = i % 2 ? 1 - jag * (0.7 + r() * 0.5) : 1 + jag * r() * 0.3;
      pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
    }
    d = 'M' + pt(pts[0]);
    for (var j = 1; j <= pts.length; j++) { var p = pts[j % pts.length], q = pts[j - 1]; d += 'Q' + pt([(p[0] + q[0]) / 2 + (r() - 0.5) * 2, (p[1] + q[1]) / 2 + (r() - 0.5) * 2]) + ' ' + pt(p); }
    return d + 'Z';
  }
  // point helper along a direction: u along ang, v perpendicular
  function dirQ(p, ang) { var ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca; return function (u, v) { return [p[0] + ca * u + px * v, p[1] + sa * u + py * v]; }; }
  function haft(c, p, len, ang, col, w, back) { var q = dirQ(p, ang), d = 'M' + pt(q(-(back == null ? 10 : back), 0)) + 'L' + pt(q(len, 0)); return limb(d, col || '#6a4428', w || 3.4) + L(d, lt(col || '#6a4428', 0.3), 1, 0.55); }

  // ============================================================
  //  SCENE PIECES (shared house style)
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 4, glow(c, col || '#fff8dc', 0.5)) + C(x, y, r, lt(col || '#fff8dc', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#f0f4ff', 0.14], [0.5, '#f0f4ff', 0], [1, bot || '#1a2010', 0.22]])); }
  function cloud(x, y, s, op, col) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, col || '#f4f6f8', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', dk(col || '#f4f6f8', 0.14), 0.9);
  }
  function hills(c, seed, base, amp, fill, step, sw) {
    var r = rng(seed), p = [], x = -40;
    while (x < 440 + step) { p.push([x, base - amp * (0.25 + 0.75 * r())]); x += step * (0.7 + 0.6 * r()); }
    var d = 'M' + pt([-40, 250]) + 'L' + pt(p[0]);
    for (var i = 0; i < p.length - 1; i++) d += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]);
    d += 'L' + pt(p[p.length - 1]) + 'L' + pt([p[p.length - 1][0], 250]) + 'Z';
    return sw ? P(d, fill, sw) : F(d, fill);
  }
  function ground(c, y, top, bot) { return R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])); }
  function grass(seed, y0, y1, col, cnt, s0, s1, w, x0, x1) {
    var r = rng(seed), d = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) {
      var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), s = s0 + (s1 - s0) * t, x = x0 + r() * (x1 - x0);
      d += 'M' + pt([x, y]) + 'q' + n(-2 * s) + ',' + n(-4 * s) + ' ' + n(-4 * s) + ',' + n(-7 * s) + 'M' + pt([x, y]) + 'q' + n(0.5 * s) + ',' + n(-5 * s) + ' ' + n(1 * s) + ',' + n(-9 * s) + 'M' + pt([x, y]) + 'q' + n(2 * s) + ',' + n(-3 * s) + ' ' + n(5 * s) + ',' + n(-6 * s);
    }
    return L(d, col, w || 1.2);
  }
  function tuft(c, x, y, s, col) {
    col = col || '#6a8a3a';
    var tips = [[-13, -8], [-9, -17], [-4, -12], [0, -23], [4, -13], [9, -18], [13, -7]], d = 'M' + pt([x - 11 * s, y]), inner = '';
    tips.forEach(function (t, i) {
      d += 'Q' + pt([x + (t[0] - 1) * s, y + t[1] * 0.5 * s]) + ' ' + pt([x + t[0] * s, y + t[1] * s]);
      if (i < tips.length - 1) d += 'Q' + pt([x + (t[0] + 1.5) * s, y + t[1] * 0.45 * s]) + ' ' + pt([x + (t[0] + tips[i + 1][0]) * 0.5 * s, y - 5 * s]);
      if (i % 2) inner += 'M' + pt([x + t[0] * 0.5 * s, y - 1 * s]) + 'Q' + pt([x + t[0] * 0.7 * s, y + t[1] * 0.5 * s]) + ' ' + pt([x + t[0] * 0.92 * s, y + t[1] * 0.85 * s]);
    });
    d += 'L' + pt([x + 11 * s, y]) + 'Z';
    return E(x, y + 1, 13 * s, 2.6 * s, '#000', 0, 0.16) + body(c, d, col, L(inner, dk(col, 0.3), 1 * s) + F('M' + pt([x + 2 * s, y - 26 * s]) + 'L' + pt([x + 16 * s, y - 26 * s]) + 'L' + pt([x + 16 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', dk(col, 0.22), 0.8), 1.3 * s);
  }
  function tufts(c, list, col) { return list.map(function (t) { return tuft(c, t[0], t[1], t[2], col); }).join(''); }
  function pebbles(seed, y0, y1, col, cnt, x0, x1) {
    var r = rng(seed), s = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < (cnt || 14); i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 2 + r() * 4; s += E(x, y, w, w * 0.45, col, 0, 0.6); }
    return s;
  }
  function flowers(seed, y0, y1, cols, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), sz = 0.8 + (y - y0) / (y1 - y0 || 1) * 1.4; s += C(r() * 400, y, sz, cols[i % cols.length]); }
    return s;
  }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x - w * 0.05, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.5]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.08, y - h - 2]) + 'C' + pt([x + w * 0.36, y - h * 0.8]) + ' ' + pt([x + w * 0.4, y - h * 0.3]) + ' ' + pt([x + w * 0.3, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.85) +
      E(x - w * 0.2, y - h * 0.7, w * 0.12, h * 0.1, lt(col, 0.25), 0, 0.6), 1.8);
  }
  function snowRock(c, x, y, w, h, col) {
    return rock(c, x, y, w, h, col) + F('M' + pt([x - w * 0.42, y - h * 0.56]) + 'C' + pt([x - w * 0.3, y - h * 1.06]) + ' ' + pt([x + w * 0.26, y - h * 1.06]) + ' ' + pt([x + w * 0.42, y - h * 0.5]) + 'C' + pt([x + w * 0.2, y - h * 0.66]) + ' ' + pt([x, y - h * 0.58]) + ' ' + pt([x - w * 0.12, y - h * 0.7]) + 'C' + pt([x - w * 0.24, y - h * 0.6]) + ' ' + pt([x - w * 0.34, y - h * 0.62]) + ' ' + pt([x - w * 0.42, y - h * 0.56]) + 'Z', '#f4f8fc', 0.95);
  }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  function barrel(c, x, y, s, col) {
    col = col || '#8a5a32';
    var d = 'M' + pt([x - 7 * s, y]) + 'C' + pt([x - 9 * s, y - 6 * s]) + ' ' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x - 7 * s, y - 18 * s]) + 'L' + pt([x + 7 * s, y - 18 * s]) + 'C' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 6 * s]) + ' ' + pt([x + 7 * s, y]) + 'Z';
    return E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.25) + body(c, d, col, L('M' + pt([x - 9 * s, y - 5 * s]) + 'L' + pt([x + 9 * s, y - 5 * s]) + 'M' + pt([x - 9 * s, y - 13 * s]) + 'L' + pt([x + 9 * s, y - 13 * s]), '#4a4440', 2 * s) + F('M' + pt([x + 2 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y + 1]) + 'L' + pt([x + 2 * s, y + 1]) + 'Z', dk(col, 0.3), 0.7), 1.6 * s) +
      E(x, y - 18 * s, 7 * s, 1.8 * s, dk(col, 0.2), 1.2 * s);
  }
  function crate(c, x, y, s, col) {
    col = col || '#a8743e';
    var d = 'M' + pt([x - 10 * s, y]) + 'L' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'Z';
    return E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.22) + body(c, d, col, L('M' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'M' + pt([x - 10 * s, y - 8 * s]) + 'L' + pt([x + 10 * s, y - 8 * s]), dk(col, 0.4), 1.4 * s) + F('M' + pt([x + 4 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', dk(col, 0.4), 0.5), 1.6 * s);
  }
  function sack(c, x, y, s, col) {
    col = col || '#c8aa76';
    var d = 'M' + pt([x - 9 * s, y]) + 'C' + pt([x - 12 * s, y - 8 * s]) + ' ' + pt([x - 8 * s, y - 16 * s]) + ' ' + pt([x - 3 * s, y - 17 * s]) + 'L' + pt([x - 4 * s, y - 21 * s]) + 'L' + pt([x + 4 * s, y - 21 * s]) + 'L' + pt([x + 3 * s, y - 17 * s]) + 'C' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 12 * s, y - 8 * s]) + ' ' + pt([x + 9 * s, y]) + 'Z';
    return E(x, y + 1, 11 * s, 2.4 * s, '#000', 0, 0.22) + body(c, d, col, F('M' + pt([x + 2 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y + 2]) + 'L' + pt([x + 3 * s, y + 2]) + 'Z', dk(col, 0.25), 0.8) + L('M' + pt([x - 4 * s, y - 17 * s]) + 'L' + pt([x + 4 * s, y - 17 * s]), '#6a4a2a', 1.6 * s), 1.5 * s);
  }
  function smoke(x, y, s, col, op, lean) {
    var o = '', r = rng(Math.round(x * 13 + y * 5));
    lean = lean == null ? 1 : lean;
    for (var i = 0; i < 6; i++) { var t = i / 5; o += C(x + t * 18 * s * lean + (r() - 0.5) * 4 * s, y - t * 44 * s, (4 + t * 9) * s, col || '#8a8a8a', 0, (op || 0.7) * (1 - t * 0.6)); }
    return o;
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 14 * s, 50 * s, glow(c, '#ffb040', 0.45)) + E(x, y + 2 * s, 20 * s, 5 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = PI * i / 6; o += rock(c, x - 18 * s * Math.cos(a), y + 2 * s + 2.5 * s * Math.sin(a), 7 * s, 5 * s, '#8a8070'); }
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 12 * s, y - 6 * s]), '#6a4424', 3.4 * s) + limb('M' + pt([x + 14 * s, y]) + 'L' + pt([x - 10 * s, y - 7 * s]), '#7a5030', 3.4 * s);
    return o + flame(c, x - 6 * s, y - 2 * s, 0.9 * s) + flame(c, x + 6 * s, y - 2 * s, 0.85 * s) + flame(c, x, y, 1.35 * s);
  }
  function deadTree(c, x, y, s, col) {
    col = col || '#3a3228';
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'C' + pt([x - 2 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 34 * s]) + ' ' + pt([x + 1 * s, y - 50 * s]), col, 5 * s);
    o += limb('M' + pt([x + 1 * s, y - 30 * s]) + 'C' + pt([x - 8 * s, y - 36 * s]) + ' ' + pt([x - 14 * s, y - 44 * s]) + ' ' + pt([x - 20 * s, y - 56 * s]) + 'M' + pt([x + 2 * s, y - 40 * s]) + 'C' + pt([x + 10 * s, y - 44 * s]) + ' ' + pt([x + 16 * s, y - 52 * s]) + ' ' + pt([x + 18 * s, y - 62 * s]), col, 2.8 * s);
    o += limb('M' + pt([x - 12 * s, y - 44 * s]) + 'L' + pt([x - 6 * s, y - 56 * s]) + 'M' + pt([x + 12 * s, y - 50 * s]) + 'L' + pt([x + 22 * s, y - 52 * s]) + 'M' + pt([x + 1 * s, y - 50 * s]) + 'L' + pt([x - 3 * s, y - 60 * s]), col, 1.6 * s);
    return o + L('M' + pt([x + 1.5 * s, y - 4 * s]) + 'C' + pt([x + 1 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 32 * s]) + ' ' + pt([x + 2 * s, y - 46 * s]), lt(col, 0.18), 1.4 * s, 0.7);
  }
  // jagged range, no outline: lit face, shadow face, optional snow caps
  function peaks(c, seed, base, hMin, hMax, col, snow, wMin, wMax) {
    var r = rng(seed), x = -40, o = '';
    wMin = wMin || 40; wMax = wMax || 70;
    while (x < 440) {
      var w = wMin + r() * (wMax - wMin), h = hMin + r() * (hMax - hMin), px = x + w * (0.4 + r() * 0.2), top = base - h;
      o += F(pd([[x - w * 0.25, base + 2], [px - w * 0.36, top + h * 0.46], [px - w * 0.2, top + h * 0.32], [px - w * 0.1, top + h * 0.12], [px, top], [px + w * 0.16, top + h * 0.24], [px + w * 0.3, top + h * 0.36], [px + w * 0.42, top + h * 0.56], [x + w * 1.25, base + 2]], true), col);
      o += F(pd([[px, top], [px + w * 0.16, top + h * 0.24], [px + w * 0.3, top + h * 0.36], [px + w * 0.42, top + h * 0.56], [x + w * 1.25, base + 2], [px + w * 0.14, base + 2], [px + w * 0.06, top + h * 0.55], [px + w * 0.1, top + h * 0.3]], true), dk(col, 0.2), 0.9);
      o += L('M' + pt([px - w * 0.2, top + h * 0.32]) + 'L' + pt([px - w * 0.26, top + h * 0.7]) + 'M' + pt([px - w * 0.04, top + h * 0.2]) + 'L' + pt([px - w * 0.1, top + h * 0.6]), dk(col, 0.12), 1.2, 0.6);
      if (snow) o += F(pd([[px - w * 0.22, top + h * 0.3], [px - w * 0.1, top + h * 0.12], [px, top], [px + w * 0.16, top + h * 0.24], [px + w * 0.22, top + h * 0.36], [px + w * 0.1, top + h * 0.3], [px + w * 0.03, top + h * 0.38], [px - w * 0.06, top + h * 0.28], [px - w * 0.14, top + h * 0.4]], true), snow);
      x += w * (0.7 + r() * 0.3);
    }
    return o;
  }
  // silhouette row of conifers, no outline
  function farPines(seed, y, col, cnt, h0, h1, x0, x1) {
    var r = rng(seed), d = '';
    x0 = x0 == null ? -10 : x0; x1 = x1 == null ? 410 : x1;
    for (var i = 0; i < cnt; i++) {
      var x = x0 + (x1 - x0) * (i + r() * 0.8) / cnt, h = h0 + r() * (h1 - h0), w = h * 0.3;
      d += 'M' + pt([x - w, y + 2]) + 'L' + pt([x - w * 0.45, y - h * 0.34]) + 'L' + pt([x - w * 0.72, y - h * 0.34]) + 'L' + pt([x - w * 0.28, y - h * 0.68]) + 'L' + pt([x - w * 0.48, y - h * 0.68]) + 'L' + pt([x, y - h]) +
        'L' + pt([x + w * 0.48, y - h * 0.68]) + 'L' + pt([x + w * 0.28, y - h * 0.68]) + 'L' + pt([x + w * 0.72, y - h * 0.34]) + 'L' + pt([x + w * 0.45, y - h * 0.34]) + 'L' + pt([x + w, y + 2]) + 'Z';
    }
    return F(d, col) + R(x0, y, x1 - x0, 5, col);
  }
  // outlined layered conifer, optional snow on each tier
  function pine(c, x, y, s, col, snow) {
    col = col || PINE;
    var o = E(x, y + 1, 16 * s, 3.4 * s, '#000', 0, 0.24);
    o += R(x - 3 * s, y - 16 * s, 6 * s, 16 * s, c.cel('#5a3a28'), 1.4 * s);
    var tiers = [[0, 24, 26], [16, 20, 24], [30, 15, 22], [42, 10, 20]], by0 = y - 12 * s;
    tiers.forEach(function (t, i) {
      var by = by0 - t[0] * s, hw = t[1] * s, th = t[2] * s, ax = x, ay = by - th;
      var d = 'M' + pt([x - hw, by]) + 'L' + pt([ax, ay]) + 'L' + pt([x + hw, by]) + 'L' + pt([x + hw * 0.5, by - 2.5 * s]) + 'L' + pt([x, by + 1 * s]) + 'L' + pt([x - hw * 0.5, by - 2.5 * s]) + 'Z';
      o += body(c, d, i % 2 ? lt(col, 0.05) : col, F(pd([[ax + 1 * s, ay - 2], [x + hw + 3, by - 2], [x + hw + 3, by + 4 * s], [x + 1 * s, by + 4 * s]], true), dk(col, 0.32), 0.85) +
        L('M' + pt([x - hw * 0.62, by - 3 * s]) + 'L' + pt([x - hw * 0.2, ay + th * 0.4]), lt(col, 0.22), 1.1 * s, 0.7), 1.6 * s);
      if (snow) o += F(pd([[ax, ay + 1], [x - hw * 0.5, ay + th * 0.52], [x - hw * 0.25, ay + th * 0.44], [x - hw * 0.05, ay + th * 0.56], [x + hw * 0.2, ay + th * 0.42], [x + hw * 0.4, ay + th * 0.5]], true), '#f2f6fa', 0.95);
    });
    return o;
  }
  function mist(c, y, h, col, op, seed) {
    var r = rng(seed || 5), o = R(-2, y - h / 2, 404, h, c.lg([[0, col, 0], [0.5, col, op], [1, col, 0]]));
    for (var i = 0; i < 5; i++) o += E(r() * 400, y + (r() - 0.5) * h * 0.4, 40 + r() * 40, h * 0.22, col, 0, op * 0.8);
    return o;
  }
  function fence(c, x1, x2, y, h, col, step) {
    col = col || '#9a7a52';
    var o = '', posts = '';
    for (var x = x1; x <= x2; x += (step || 18)) posts += 'M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - h);
    var rl = 'M' + x1 + ',' + n(y - h * 0.7) + ' L' + x2 + ',' + n(y - h * 0.72) + ' M' + x1 + ',' + n(y - h * 0.3) + ' L' + x2 + ',' + n(y - h * 0.32);
    o += L(posts + rl, OL, 5) + L(rl, lt(col, 0.1), 2) + L(posts, col, 2.6);
    return o;
  }
  // dry-stone field wall running between two points on the ground
  function stoneWall(c, x0, y0, x1, y1, h, col, seed) {
    col = col || '#9a9a8e';
    var r = rng(seed || 3), o = '', len = Math.abs(x1 - x0), k = Math.max(3, Math.round(len / 9));
    o += P(pd([[x0, y0], [x0, y0 - h], [x1, y1 - h], [x1, y1]], true), c.cel(dk(col, 0.1)), 1.6);
    for (var i = 0; i < k; i++) {
      var t = (i + 0.5) / k, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, w = len / k * 1.1;
      o += E(x, y - h * 0.3, w * 0.55, h * 0.3, c.cel(i % 2 ? col : lt(col, 0.06)), 1.1) + E(x + (r() - 0.5) * 3, y - h * 0.78, w * 0.5, h * 0.26, c.cel(i % 3 ? lt(col, 0.1) : col), 1.1);
    }
    return o + F(pd([[x0, y0 - h - 1], [x1, y1 - h - 1], [x1, y1 - h + 2], [x0, y0 - h + 2]], true), '#6a8a3a', 0.8);
  }
  function torch(c, x, y, s) {
    return C(x, y - 12 * s, 30 * s, glow(c, '#ffa040', 0.55)) + limb('M' + pt([x, y + 8 * s]) + 'L' + pt([x, y - 4 * s]), '#6a4a2a', 2.6 * s) +
      R(x - 4 * s, y + 1 * s, 8 * s, 3 * s, c.cel('#4a4444'), 1 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 4 * s, c.cel('#5a3a24'), 1 * s) + flame(c, x, y - 4 * s, 0.75 * s);
  }
  function brickWall(c, x0, y0, x1, y1, col, seed, bh) {
    bh = bh || 12;
    var r = rng(seed || 3), jn = '', sh = '';
    for (var y = y0; y < y1; y += bh) {
      jn += 'M' + pt([x0, y]) + 'L' + pt([x1, y]);
      var off = ((y - y0) / bh) % 2 ? 11 : 0;
      for (var x = x0 - off; x < x1; x += 22) { jn += 'M' + pt([x, y]) + 'l0,' + n(bh); if (r() < 0.22) sh += R(x + 1, y + 1, 20, bh - 2, r() < 0.5 ? dk(col, 0.12) : lt(col, 0.08), 0); }
    }
    return R(x0, y0, x1 - x0, y1 - y0, col) + sh + L(jn, dk(col, 0.4), 1.1, 0.85);
  }
  function flagFloor(c, yH, vx, col, seed) {
    var o = R(-2, yH, 404, 242 - yH, c.lg([[0, dk(col, 0.35)], [1, col]])), d = '', r = rng(seed || 2);
    for (var i = -9; i <= 9; i++) d += 'M' + pt([vx + i * 12, yH]) + 'L' + pt([vx + i * 70, 242]);
    for (var j = 1; j < 8; j++) { var t = j / 8, y = yH + (242 - yH) * t * t; d += 'M-2,' + n(y) + 'L402,' + n(y + (r() - 0.5) * 2); }
    return o + L(d, dk(col, 0.45), 1, 0.7);
  }
  function chain(x, y, len, s, col) {
    var o = '', k = Math.round(len / (6 * s));
    for (var i = 0; i < k; i++) o += '<ellipse cx="' + n(x) + '" cy="' + n(y + i * 6 * s + 3 * s) + '" rx="' + n(i % 2 ? 1 * s : 2.2 * s) + '" ry="' + n(3.4 * s) + '" fill="none" stroke="' + (col || '#6a6e76') + '" stroke-width="' + n(1.4 * s) + '"/>';
    return L('M' + pt([x, y]) + 'L' + pt([x, y + len]), OL, 1.2 * s, 0.6) + o;
  }
  function bars(c, x, y, w, h, col) {
    col = col || '#4a4e56';
    var o = '', k = Math.max(3, Math.round(w / 7));
    for (var i = 1; i < k; i++) { var bx = x + w * i / k, d = 'M' + pt([bx, y]) + 'L' + pt([bx, y - h]); o += L(d, OL, 4.2) + L(d, col, 2.2) + L(d, lt(col, 0.4), 0.7, 0.7); }
    var hz = 'M' + pt([x, y - h + 3]) + 'L' + pt([x + w, y - h + 3]) + 'M' + pt([x, y - h * 0.45]) + 'L' + pt([x + w, y - h * 0.45]);
    return o + L(hz, OL, 4.6) + L(hz, dk(col, 0.1), 2.6);
  }
  function crenels(c, x0, x1, y, col, mw) {
    mw = mw || 6; var o = '';
    for (var x = x0; x < x1 - 1; x += mw * 2) o += R(x, y - mw, mw, mw + 1, c.cel(col), 1.3);
    return o;
  }
  function stoneFace(c, x, y, w, h, col, js, top) {
    // top: optional list of [dx, dy] points (relative to x, y-h) replacing the flat top edge, for broken walls
    var d = top ? 'M' + pt([x, y]) + 'L' + pt([x + w, y]) + top.slice().reverse().map(function (q) { return 'L' + pt([x + q[0], y - h + q[1]]); }).join('') + 'Z' : pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true);
    var jn = ''; js = js || 7;
    for (var j = 1; j < h / js; j++) { var jy = y - j * js; jn += 'M' + pt([x, jy]) + 'L' + pt([x + w, jy]); for (var q = 0; q < w / 12; q++) jn += 'M' + pt([x + q * 12 + (j % 2 ? 6 : 0), jy]) + 'l0,' + n(js); }
    return body(c, d, col, L(jn, dk(col, 0.28), 0.8, 0.8) + F(pd([[x + w * 0.62, y - h - 30], [x + w + 2, y - h - 30], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.25), 0.7), 1.8);
  }
  function arrowSlit(x, y, col) { return R(x - 1.6, y - 6, 3.2, 12, col || '#12100e', 0.8); }
  function archWin(x, y, w, h, col, sw) { return P('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w / 2]) + 'Q' + pt([x, y - h - w * 0.2]) + ' ' + pt([x + w / 2, y - h + w / 2]) + 'L' + pt([x + w / 2, y]) + 'Z', col, sw == null ? 1.2 : sw); }
  // ---- ribbons (shared copy of art_ashenvale.js) ----
  function lerp2(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
  // Catmull-Rom sampling through control points
  function spline(pts, k) {
    var out = [], i, j; k = k || 6;
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      for (j = 0; j < k; j++) {
        var t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(function (a) { return 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3); }));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // tapered ribbon along a smooth curve (tails, necks, tentacles, horns); side a is the left of the travel direction
  function taper(pts, w0, w1, k) {
    var s = spline(pts, k), A = [], B = [], m = s.length;
    for (var i = 0; i < m; i++) {
      var a = s[Math.max(0, i - 1)], b = s[Math.min(m - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, t = i / (m - 1), w = (w0 + (w1 - w0) * t) / 2;
      A.push([s[i][0] - dy / d * w, s[i][1] + dx / d * w]); B.push([s[i][0] + dy / d * w, s[i][1] - dx / d * w]);
    }
    return { d: pd(A.concat(B.slice().reverse()), true), a: A, b: B, s: s };
  }
  function bands(T, every, from) { var d = ''; for (var i = from || 2; i < T.s.length - 1; i += every) d += 'M' + pt(T.a[i]) + 'L' + pt(T.b[i]); return d; }
  function along(T, f) { var p = []; for (var i = 0; i < T.s.length; i++) p.push(lerp2(T.a[i], T.b[i], f)); return 'M' + p.map(pt).join('L'); }
  function ribbonBand(T, f0, f1) { var P0 = [], P1 = []; for (var i = 0; i < T.s.length; i++) { P0.push(lerp2(T.a[i], T.b[i], f0)); P1.push(lerp2(T.a[i], T.b[i], f1)); } return pd(P0.concat(P1.reverse()), true); }
  function feather(c, x, y, ang, len, col, tip) {
    var q = dirQ([x, y], ang), d = 'M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.5, len * 0.26)) + ' ' + pt(q(len, 0)) + 'Q' + pt(q(len * 0.5, -len * 0.26)) + ' ' + pt(q(0, 0)) + 'Z';
    return P(d, col, 0.9) + (tip ? F('M' + pt(q(len * 0.66, len * 0.2)) + 'L' + pt(q(len, 0)) + 'L' + pt(q(len * 0.66, -len * 0.2)) + 'Z', tip) : '') + L('M' + pt(q(-1, 0)) + 'L' + pt(q(len * 0.9, 0)), dk(col, 0.4), 0.7);
  }
  function shadowSwirl(c, p, r, col) {
    col = col || '#a050f0'; r = r || 1;
    var d = 'M' + pt([p[0] + 8 * r, p[1]]) + 'C' + pt([p[0] + 8 * r, p[1] - 9 * r]) + ' ' + pt([p[0] - 7 * r, p[1] - 10 * r]) + ' ' + pt([p[0] - 8 * r, p[1] - 1 * r]) + 'C' + pt([p[0] - 8 * r, p[1] + 6 * r]) + ' ' + pt([p[0] + 2 * r, p[1] + 7 * r]) + ' ' + pt([p[0] + 4 * r, p[1] + 1 * r]) + 'C' + pt([p[0] + 5 * r, p[1] - 3 * r]) + ' ' + pt([p[0] - 2 * r, p[1] - 5 * r]) + ' ' + pt([p[0] - 3 * r, p[1] - 1 * r]);
    return C(p[0], p[1] - 2 * r, 24 * r, glow(c, col, 0.7)) + L(d, dk(col, 0.4), 4.4 * r) + L(d, lt(col, 0.35), 2 * r) + C(p[0], p[1] - 1 * r, 3 * r, '#f0d8ff');
  }
  function club(c, p, len, ang, col, spikes) {
    var q = dirQ(p, ang); col = col || '#7a5434';
    var o = haft(c, p, len * 0.55, ang, col, 4, 9);
    var hd = 'M' + pt(q(len * 0.4, -4)) + 'C' + pt(q(len * 0.7, -10)) + ' ' + pt(q(len + 2, -10)) + ' ' + pt(q(len + 4, 0)) + 'C' + pt(q(len + 2, 10)) + ' ' + pt(q(len * 0.7, 10)) + ' ' + pt(q(len * 0.4, 4)) + 'Z';
    if (spikes) [[0.66, -9, -1], [0.86, -10, -1], [len ? 1.02 : 1, 0, 0], [0.86, 10, 1], [0.66, 9, 1]].forEach(function (k) { var b = q(len * k[0], k[1]), tp = q(len * k[0] + (k[2] ? 2 : 9), k[1] + k[2] * 7); o += P(pd([q(len * k[0] - 3, k[1] * 0.9), tp, q(len * k[0] + 3, k[1] * 0.9)], true), c.cel('#e8dcc0'), 1.1); });
    return o + body(c, hd, col, L('M' + pt(q(len * 0.6, -3)) + 'l3,2 M' + pt(q(len * 0.8, 3)) + 'l2,-3', dk(col, 0.4), 1.4) + F(pd([q(len * 0.4, 1), q(len + 6, 1), q(len + 6, 12), q(len * 0.4, 12)], true), dk(col, 0.3), 0.7), 2);
  }
  // ---- biped rig (facing left; shared copy of art_ashenvale.js) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function paw(x, y, col) { return P('M' + n(x + 4) + ',' + n(y - 5) + ' C' + n(x + 6) + ',' + n(y) + ' ' + n(x + 4) + ',' + n(y + 1.5) + ' ' + n(x) + ',' + n(y + 1.5) + ' L' + n(x - 7) + ',' + n(y + 1.5) + ' C' + n(x - 9) + ',' + n(y + 1.5) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 4) + ' Z', col, 2) + L('M' + n(x - 3) + ',' + n(y - 1) + ' l0,2.5 M' + n(x - 6) + ',' + n(y - 1) + ' l0,2.5', OL, 1); }
  function bearPaw(x, y, col) {
    return P('M' + pt([x + 7, y - 7]) + 'C' + pt([x + 9, y - 1]) + ' ' + pt([x + 7, y + 1.5]) + ' ' + pt([x + 2, y + 1.5]) + 'L' + pt([x - 9, y + 1.5]) + 'C' + pt([x - 12, y + 1.5]) + ' ' + pt([x - 12, y - 4]) + ' ' + pt([x - 7, y - 6]) + 'Z', col, 2) +
      L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', OL, 3) + L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', '#efe6cf', 1.3);
  }
  function clawHand(p, col, k, clawCol) {
    k = k || 1;
    var d = 'M' + pt([p[0] - 3 * k, p[1] + 2 * k]) + 'q' + n(-5 * k) + ',' + n(2 * k) + ' ' + n(-6 * k) + ',' + n(7 * k) + 'M' + pt([p[0] - 1 * k, p[1] + 4 * k]) + 'q' + n(-3 * k) + ',' + n(3 * k) + ' ' + n(-3 * k) + ',' + n(8 * k) + 'M' + pt([p[0] + 2 * k, p[1] + 4 * k]) + 'q' + n(-1 * k) + ',' + n(4 * k) + ' ' + n(0) + ',' + n(8 * k);
    return C(p[0], p[1], 5 * k, c_(col), 2) + L(d, OL, 3.6 * k) + L(d, clawCol || '#f0e8d8', 1.6 * k);
  }
  function biped(c, o) {
    var s = '', sk = o.skin, shirt = o.shirt || sk, pants = o.pants || sk, sleeve = o.sleeve || shirt;
    var legW = o.legW || 10.5, armW = o.armW || 9;
    if (o.shadow !== false) s += shadow(c, 64, o.shadowR || 32);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 54], [88, 70], [88, 86]];
    s += limb(pd(far.slice(0, 2)), sleeve, armW) + limb(pd(far.slice(1)), o.forearm || sleeve, armW - 1);
    if (o.wFar) s += o.wFar(c, far[far.length - 1]);
    s += (o.farHand ? o.farHand(c, far[far.length - 1]) : hand(far[far.length - 1], c.cel(o.glove || sk)));
    var hipY = o.hipY || 86, toe = o.feet || boot;
    if (!o.noLegs) {
      var kneeF = o.digi ? 'M68,' + hipY + ' L77,100 L71,112 L74,116' : 'M68,' + hipY + ' L71,103 L72,113';
      var kneeN = o.digi ? 'M56,' + hipY + ' L62,100 L54,112 L52,116' : 'M56,' + hipY + ' L53,103 L52,113';
      s += limb(kneeF, dk(pants, 0.18), legW) + toe(73, 121, o.boots || dk(pants, 0.3));
      s += limb(kneeN, pants, legW) + toe(52, 121, o.boots || dk(pants, 0.3));
      if (o.shins) s += o.shins(c);
    }
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,40 L96,40 L96,106 L70,106 C74,78 72,58 68,40 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
    if (o.belt) s += P('M49,' + (hipY - 4) + ' L79,' + (hipY - 4) + ' L79,' + (hipY + 2) + ' L49,' + (hipY + 2) + ' Z', c.cel(o.belt), 2) + R(58, hipY - 5, 7, 8, o.buckle || '#b9b1a0', 1.6);
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    var hx = o.hx == null ? 60 : o.hx, hy = o.hy == null ? 32 : o.hy;
    if (o.neck !== false) s += R(hx - 3, hy + 8, 10, 8, c.cel(o.neckCol || sk), 2);
    s += o.head(c, hx, hy);
    var near = o.near || [[48, 54], [40, 70], [32, 80]];
    if (o.wNear) s += o.wNear(c, near[near.length - 1]);
    s += limb(pd(near.slice(0, 2)), sleeve, armW) + limb(pd(near.slice(1)), o.forearm || sleeve, armW - 1);
    s += (o.nearHand ? o.nearHand(c, near[near.length - 1]) : hand(near[near.length - 1], c.cel(o.glove || sk)));
    if (o.wNearFront) s += o.wNearFront(c, near[near.length - 1]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf, o.op) : (o.op != null ? G(s, '', o.op) : s);
  }
  // ---- shared copies (art_wetlands.js / art_redridge.js / art_barrens.js) ----
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
  function axe(c, p, len, ang, bw, col, dbl, hcol) {
    var q = dirQ(p, ang), o = haft(c, p, len + 4, ang, hcol || '#4a3222', 3.8);
    var blade = function (k, b) {
      return pd([q(len + 3, -1.5 * k), q(len + 6 + b * 0.25, -b * 0.75 * k), q(len + 2, -b * 1.05 * k), q(len - b * 0.55, -b * 1.12 * k), q(len - b * 1.05, -b * 0.8 * k), q(len - b * 0.75, -1.5 * k)], true);
    };
    o += P(blade(1, bw), c.cel(col || '#a8acb2'), 1.9) + L('M' + pt(q(len + 4, -bw * 0.72)) + 'L' + pt(q(len - bw * 0.5, -bw * 1.02)) + 'L' + pt(q(len - bw * 0.95, -bw * 0.74)), '#ffffff', 1.1, 0.6);
    if (dbl) o += P(blade(-1, bw * 0.85), c.cel(dk(col || '#a8acb2', 0.08)), 1.9);
    else o += P(pd([q(len - 2, 1.5), q(len - bw * 0.3, bw * 0.55), q(len - bw * 0.6, 1.5)], true), c.cel(dk(col || '#a8acb2', 0.1)), 1.4);
    return o + R(q(len - bw * 0.3, 0)[0] - 3, q(len - bw * 0.3, 0)[1] - 3, 6, 6, c.cel('#3a3434'), 1.2);
  }
  function birdFoot(x, y, col, big) {
    var k = big ? 1.25 : 1;
    return L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), OL, 5) + L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), col, 2.2);
  }
  // ---- more shared copies of art_redridge.js (feathers, spear, rags, Redridge-style gnoll rig, bone necklace, pelt hood) ----
  function feathers(x, y, cols, s, a0) {
    s = s || 1; var o = '';
    cols.forEach(function (col, i) {
      var a = (a0 == null ? -0.4 : a0) + i * 0.35, ex = x + Math.sin(a) * 14 * s, ey = y + Math.cos(a) * 14 * s;
      o += P('M' + pt([x, y]) + 'Q' + pt([x + Math.sin(a) * 6 * s - 3 * s, y + Math.cos(a) * 8 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + Math.sin(a) * 8 * s + 3 * s, y + Math.cos(a) * 6 * s]) + ' ' + pt([x, y]) + 'Z', col, 1.3);
    });
    return o;
  }
  function spear(c, top, bot, len, col, shaft) {
    var d = 'M' + pt(top) + 'L' + pt(bot);
    var dx = top[0] - bot[0], dy = top[1] - bot[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux;
    var tip = [top[0] + ux * len, top[1] + uy * len];
    return limb(d, shaft || '#7a5a36', 3) + L(d, lt(shaft || '#7a5a36', 0.3), 1, 0.6) +
      P(pd([[top[0] + px * 4.5 - ux * 2, top[1] + py * 4.5 - uy * 2], [top[0] + px * 3 + ux * len * 0.55, top[1] + py * 3 + uy * len * 0.55], tip, [top[0] - px * 3 + ux * len * 0.55, top[1] - py * 3 + uy * len * 0.55], [top[0] - px * 4.5 - ux * 2, top[1] - py * 4.5 - uy * 2]], true), c.cel(col || '#b8b4a8'), 1.8) +
      L('M' + pt([top[0] + px * 3.5 - ux * 4, top[1] + py * 3.5 - uy * 4]) + 'L' + pt([top[0] - px * 3.5 - ux * 4, top[1] - py * 3.5 - uy * 4]), '#c8a060', 1.6);
  }
  function rag(x0, x1, y, depth, seed) {
    var r = rng(seed || 3), d = '', k = 6;
    for (var i = 0; i <= k; i++) { var x = x0 + (x1 - x0) * i / k; d += 'L' + pt([x, y + (i % 2 ? depth * (0.4 + r() * 0.6) : 0)]); }
    return d;
  }
  function farTrees(seed, y, col, cnt, h0, h1) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) {
      var x = -10 + 420 * (i + r() * 0.7) / cnt, h = h0 + r() * (h1 - h0), w = h * 0.3;
      o += F(pd([[x - 2.5, y + 2], [x - 2, y - h * 0.6], [x + 2, y - h * 0.6], [x + 2.5, y + 2]], true), col) + E(x, y - h * 0.74, w, h * 0.28, col) + E(x - w * 0.55, y - h * 0.6, w * 0.7, h * 0.2, col) + E(x + w * 0.55, y - h * 0.62, w * 0.7, h * 0.19, col);
    }
    return o + R(-2, y, 404, 6, col);
  }
  function lake(c, y0, y1, top, bot, seed, cnt) {
    var o = R(-2, y0, 404, y1 - y0, c.lg([[0, top], [1, bot]])), r = rng(seed || 3), d = '';
    for (var i = 0; i < (cnt || 26); i++) { var yy = y0 + 3 + r() * (y1 - y0 - 6), t = (yy - y0) / (y1 - y0), w = 8 + t * 26, xx = r() * 400; d += 'M' + pt([xx - w, yy]) + 'L' + pt([xx + w, yy]); }
    return o + L(d, lt(top, 0.45), 1.2, 0.55);
  }
  function reeds(c, x, y, s, col, seed) {
    col = col || REED; s = s || 1;
    var r = rng(seed || Math.round(x * 7 + y * 3)), d = '', hd = '';
    for (var i = 0; i < 7; i++) {
      var bx = x + (i - 3) * 2.4 * s, h = (20 + r() * 18) * s, lean = ((i - 3) * 2 + (r() - 0.5) * 6) * s;
      d += 'M' + pt([bx, y]) + 'Q' + pt([bx + lean * 0.2, y - h * 0.6]) + ' ' + pt([bx + lean, y - h]);
      if (i % 2 === 0 && r() < 0.85) hd += E(bx + lean * 0.62, y - h * 0.78, 1.9 * s, 4.6 * s, c.cel('#6a4424'), 1.1 * s);
    }
    var lv = P('M' + pt([x - 2 * s, y]) + 'Q' + pt([x - 12 * s, y - 12 * s]) + ' ' + pt([x - 17 * s, y - 25 * s]) + 'Q' + pt([x - 8 * s, y - 12 * s]) + ' ' + pt([x + 1 * s, y]) + 'Z', c.cel(dk(col, 0.12)), 1.1 * s) +
      P('M' + pt([x + 1 * s, y]) + 'Q' + pt([x + 10 * s, y - 10 * s]) + ' ' + pt([x + 16 * s, y - 21 * s]) + 'Q' + pt([x + 6 * s, y - 10 * s]) + ' ' + pt([x + 3 * s, y]) + 'Z', c.cel(col), 1.1 * s);
    return E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.2) + L(d, OL, 2.8 * s) + L(d, col, 1.3 * s) + lv + hd;
  }
  function reedLine(seed, y, col, cnt, h0, h1, x0, x1, w) {
    var r = rng(seed), d = ''; x0 = x0 == null ? -5 : x0; x1 = x1 == null ? 405 : x1;
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), h = h0 + r() * (h1 - h0), ln = (r() - 0.5) * h * 0.35; d += 'M' + pt([x, y]) + 'Q' + pt([x, y - h * 0.6]) + ' ' + pt([x + ln, y - h]); }
    return L(d, col, w || 1.2);
  }
  // peat pool: dark water with a muddy rim, a sky glint and ripples
  function pool(c, x, y, rx, ry, col, rim) {
    col = col || '#3a4640'; rim = rim || MUDD;
    var rp = 'M' + pt([x - rx * 0.55, y - ry * 0.1]) + 'q' + n(rx * 0.25) + ',' + n(-ry * 0.3) + ' ' + n(rx * 0.5) + ',0' + 'M' + pt([x + rx * 0.05, y + ry * 0.35]) + 'q' + n(rx * 0.2) + ',' + n(-ry * 0.25) + ' ' + n(rx * 0.4) + ',0';
    return E(x, y + ry * 0.14, rx + 4, ry + 2.6, rim, 0, 0.8) + E(x, y, rx, ry, c.lg([[0, dk(col, 0.35)], [1, lt(col, 0.15)]]), 1.4) + E(x - rx * 0.25, y - ry * 0.3, rx * 0.42, ry * 0.2, '#d8e0d8', 0, 0.22) + L(rp, lt(col, 0.45), 0.9, 0.7);
  }
  function mossRock(c, x, y, w, h, col) {
    return rock(c, x, y, w, h, col || STONE) + F('M' + pt([x - w * 0.44, y - h * 0.5]) + 'C' + pt([x - w * 0.32, y - h * 1.04]) + ' ' + pt([x + w * 0.24, y - h * 1.04]) + ' ' + pt([x + w * 0.4, y - h * 0.52]) + 'C' + pt([x + w * 0.28, y - h * 0.6]) + ' ' + pt([x + w * 0.2, y - h * 0.46]) + ' ' + pt([x + w * 0.1, y - h * 0.62]) + 'C' + pt([x - w * 0.04, y - h * 0.5]) + ' ' + pt([x - w * 0.2, y - h * 0.64]) + ' ' + pt([x - w * 0.3, y - h * 0.46]) + 'Z', MOSS, 0.95) +
      C(x - w * 0.12, y - h * 0.82, w * 0.05 + 0.6, lt(MOSS, 0.28), 0, 0.85) + C(x + w * 0.14, y - h * 0.72, w * 0.04 + 0.5, MOSSD, 0, 0.8);
  }
  function nest(c, x, y, s, eggs) {
    var o = E(x, y + 2 * s, 24 * s, 5 * s, '#000', 0, 0.25), r = rng(Math.round(x * 5 + y)), tw = '';
    o += E(x, y - 2 * s, 21 * s, 8 * s, c.cel('#8a6a3a'), 1.6 * s) + E(x, y - 3.4 * s, 15 * s, 4.6 * s, '#3e2e1c');
    [[-7, -5], [2, -6], [9, -4]].slice(0, eggs || 3).forEach(function (e, i) {
      var ex = x + e[0] * s, ey = y + e[1] * s;
      o += E(ex, ey, 4.4 * s, 5.4 * s, c.cel(i % 2 ? '#d8d4b0' : '#e8e0c4'), 1.2 * s) + C(ex - 1.5 * s, ey - 1 * s, 0.9 * s, '#6a5a3a') + C(ex + 1.6 * s, ey + 1.5 * s, 0.8 * s, '#6a5a3a') + C(ex + 0.5 * s, ey - 3 * s, 0.6 * s, '#6a5a3a');
    });
    o += P('M' + pt([x - 21 * s, y - 2 * s]) + 'C' + pt([x - 18 * s, y + 6 * s]) + ' ' + pt([x + 18 * s, y + 6 * s]) + ' ' + pt([x + 21 * s, y - 2 * s]) + 'C' + pt([x + 14 * s, y + 1 * s]) + ' ' + pt([x - 14 * s, y + 1 * s]) + ' ' + pt([x - 21 * s, y - 2 * s]) + 'Z', c.cel('#9a7a44'), 1.4 * s);
    for (var i = 0; i < 12; i++) { var a = PI * (0.05 + 0.9 * r()), px = x - Math.cos(a) * 20 * s, py = y - 2 * s + Math.sin(a) * 5 * s; tw += 'M' + pt([px, py]) + 'l' + n((r() - 0.5) * 12 * s) + ',' + n((r() - 0.6) * 4 * s); }
    return o + L(tw, '#c8a468', 1 * s, 0.9);
  }
  function driftwood(c, x, y, len, ang, s) {
    s = s || 1; var q = dirQ([x, y], ang), col = '#b4aa98', e = q(0, 0);
    var o = E(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2 + 3 * s, len * 0.56, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt(q(len * 0.3, 0)) + 'L' + pt(q(len * 0.42, -13 * s)) + 'M' + pt(q(len * 0.7, 0)) + 'L' + pt(q(len * 0.8, -9 * s)) + 'L' + pt(q(len * 0.92, -13 * s)), col, 2.4 * s);
    o += limb('M' + pt(q(0, 0)) + 'L' + pt(q(len, 0)), col, 7 * s) + L('M' + pt(q(3, -1.8 * s)) + 'L' + pt(q(len - 2, -1.8 * s)), lt(col, 0.4), 1.2 * s, 0.8) + L('M' + pt(q(len * 0.2, 1.6 * s)) + 'L' + pt(q(len * 0.5, 1.9 * s)) + 'M' + pt(q(len * 0.6, 1 * s)) + 'L' + pt(q(len * 0.86, 1.7 * s)), dk(col, 0.35), 0.9 * s);
    return o + E(e[0], e[1], 2.6 * s, 4 * s, c.cel('#d8d0bc'), 1.2 * s) + L(ellD(e[0], e[1], 1.2 * s, 2 * s), '#8a806e', 0.6 * s);
  }
  function waves(seed, y0, y1, cnt, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 6 + t * 16, x = r() * 400; d += 'M' + pt([x - w, y]) + 'q' + n(w / 2) + ',' + n(-2 - t * 2) + ' ' + n(w) + ',0'; }
    return L(d, col || '#e8f0ec', 1.1, 0.7);
  }
  function swag(x0, y0, x1, y1, sag, w) {
    w = w || 1; var d = 'M' + pt([x0, y0]) + 'Q' + pt([(x0 + x1) / 2, Math.max(y0, y1) + sag]) + ' ' + pt([x1, y1]);
    return L(d, OL, 4 * w) + '<path d="' + d + '" fill="none" stroke="#7a7e86" stroke-width="' + n(2.2 * w) + '" stroke-dasharray="' + n(3.4 * w) + ' ' + n(1.8 * w) + '"/>';
  }
  function cage(c, x, y, s, inner) {
    var w = 44 * s, h = 36 * s, o = E(x, y + 3, w * 0.66, 4 * s, '#000', 0, 0.3), bar = '';
    o += F('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h]) + 'Q' + pt([x, y - h - 20 * s]) + ' ' + pt([x + w / 2, y - h]) + 'L' + pt([x + w / 2, y]) + 'Z', '#1a1416', 0.45);
    if (inner) o += inner(c, x, y, s);
    for (var i = 0; i <= 6; i++) { var bx = x - w / 2 + w * i / 6, ty = y - h - 20 * s * (1 - Math.pow((bx - x) / (w / 2), 2)) * 0.98; bar += 'M' + pt([bx, y - 2]) + 'L' + pt([bx, y - h]) + 'Q' + pt([bx, ty - 2]) + ' ' + pt([x, y - h - 20 * s]); }
    o += L(bar, OL, 4.2 * s) + L(bar, '#5a5c62', 2 * s) + L('M' + pt([x - w / 2, y - h]) + 'L' + pt([x + w / 2, y - h]), OL, 4.4 * s) + L('M' + pt([x - w / 2, y - h]) + 'L' + pt([x + w / 2, y - h]), '#6a6c72', 2.4 * s);
    o += P(pd([[x - w / 2 - 4 * s, y + 2], [x + w / 2 + 4 * s, y + 2], [x + w / 2 + 2 * s, y - 5 * s], [x - w / 2 - 2 * s, y - 5 * s]], true), c.cel('#3a3638'), 1.6 * s);
    o += L(ellD(x, y - h - 23 * s, 3 * s, 3 * s), OL, 3 * s) + L(ellD(x, y - h - 23 * s, 3 * s, 3 * s), '#8a8c92', 1.4 * s);
    return o;
  }
  function brazier(c, x, y, s) {
    var o = C(x, y - 26 * s, 40 * s, glow(c, '#ff9030', 0.45)) + E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x - 10 * s, y]) + 'L' + pt([x - 2 * s, y - 18 * s]) + 'M' + pt([x + 10 * s, y]) + 'L' + pt([x + 2 * s, y - 18 * s]) + 'M' + pt([x, y + 1]) + 'L' + pt([x, y - 18 * s]), '#2e2a2c', 2.2 * s);
    o += P('M' + pt([x - 13 * s, y - 24 * s]) + 'L' + pt([x + 13 * s, y - 24 * s]) + 'L' + pt([x + 8 * s, y - 16 * s]) + 'L' + pt([x - 8 * s, y - 16 * s]) + 'Z', c.cel('#3e3a3c'), 1.6 * s);
    return o + flame(c, x - 5 * s, y - 23 * s, 0.6 * s) + flame(c, x + 5 * s, y - 23 * s, 0.55 * s) + flame(c, x, y - 23 * s, 0.95 * s);
  }
  // dark sharpened stakes leaning outward
  function stakes(c, x0, x1, y, h, seed) {
    var r = rng(seed || 7), o = '', col = '#4a3a30';
    for (var x = x0; x < x1; x += 11) {
      var hh = h * (0.8 + r() * 0.3), lean = (r() - 0.3) * 6, d = pd([[x, y], [x + lean, y - hh + 6], [x + 4 + lean, y - hh - 4], [x + 8 + lean, y - hh + 6], [x + 8, y]], true);
      o += P(d, c.cel(r() < 0.5 ? col : lt(col, 0.08)), 1.5) + F(pd([[x + 4 + lean, y - hh - 4], [x + 8 + lean, y - hh + 6], [x + 5.5 + lean, y - hh + 5]], true), '#c8b8a0', 0.8);
    }
    var rl = 'M' + pt([x0, y - h * 0.3]) + 'L' + pt([x1, y - h * 0.32]);
    return o + L(rl, OL, 4) + L(rl, '#3a2a20', 2.2);
  }
  // ---- raptor (adapted from art_barrens.js: stripes optional, mottle hooks, a head group that can tilt and open) ----
  function raptor(c, o) {
    var col = o.col, st = o.stripe, bel = o.belly, dcol = dk(col, 0.22), s = o.noShadow ? '' : shadow(c, 62, 36), ff = o.farFoot || [82, 121], nf = o.nearFoot || [62, 121];
    var mk = function (f) { return f ? f(c) : ''; };
    s += E(80, 80, 9, 10, c.cel(dcol), 2) + limb(o.farLeg || 'M80,84 L90,98 L80,110 L82,116', dcol, 5.5) + birdFoot(ff[0], ff[1], dk(col, 0.4), o.talons);
    var tl = 'M80,60 C96,56 110,50 118,36 C122,30 126,30 126,34 C124,44 112,62 100,72 C94,76 88,80 82,82 Z';
    s += body(c, tl, col, (st ? L('M92,56 L98,68 M102,52 L108,62 M110,46 L116,54', st, 3) : '') + mk(o.tailMark) + F('M84,80 C96,74 110,62 120,44 L128,50 L128,86 L84,86 Z', dk(col, 0.25), 0.7));
    s += L('M125,32 C127,26 124,20 118,20', OL, 3.4) + L('M125,32 C127,26 124,20 118,20', col, 1.4);
    var bd = 'M40,62 C44,52 60,48 76,52 C88,56 92,68 86,78 C80,86 62,88 52,84 C44,80 40,72 40,62 Z';
    s += body(c, bd, col, (st ? L('M56,50 L52,62 M66,50 L62,64 M76,52 L72,66 M84,58 L80,70', st, 3.2) : '') + mk(o.bodyMark) + F('M36,72 C48,84 72,88 92,76 L92,92 L36,92 Z', bel, 0.9));
    if (o.back) s += o.back(c);
    var nk = 'M46,66 C40,58 36,52 32,44 L44,38 C46,46 52,52 58,56 Z';
    s += body(c, nk, col, (st ? L('M36,48 L44,44 M40,56 L48,50', st, 2.6) : '') + mk(o.neckMark) + F('M30,46 L36,44 C40,54 44,60 48,66 L44,68 Z', bel, 0.8));
    var hs = P(o.crestD || (o.bigCrest ? 'M38,32 L44,12 L48,26 L58,14 L56,30 L68,26 L58,38 L66,42 L46,42 Z' : 'M40,30 L50,20 L48,30 L58,26 L52,36 L60,38 L46,40 Z'), c.cel(o.crest || '#c83a2a'), 1.5);
    if (o.open) {
      // screaming: lower jaw dropped open, throat and tongue showing
      hs += P('M40,44 C40,54 32,62 20,66 L10,66 C8,63 11,59 16,57 C24,53 30,49 34,44 Z', c.cel(col), 1.8) + F('M10,64 C16,64 26,60 34,52 L36,58 C28,64 18,68 10,66 Z', bel, 0.9);
      hs += P('M7,45 L36,45 C36,50 30,56 18,59 C12,60 9,56 7,50 Z', '#5a1a14', 1.4) + F('M14,54 C20,52 28,50 34,48 C32,54 24,57 16,57 Z', '#c8505a', 0.95);
      hs += P('M10,59 L12,55 L14,59 Z M16,58 L18,54 L20,57.6 Z M22,56 L24,52.4 L26,55.4 Z', '#fff', 0.6);
      var hu = 'M42,32 C36,28 24,28 16,34 L6,40 C3,42 3,45 6,46 L20,46 C28,47 36,47 42,44 C46,40 46,36 42,32 Z';
      hs += body(c, hu, col, F('M34,24 L50,24 L50,54 L38,54 C44,44 42,34 34,24 Z', dk(col, 0.22), 0.8) + mk(o.headMark), 2.4);
      hs += P('M9,45.6 L10.6,49.6 L12,45.8 Z M15,46 L16.6,50 L18,46 Z M21,46.4 L22.4,50 L24,46.4 Z', '#fff', 0.6);
    } else {
      var hd = 'M42,32 C36,28 24,28 16,34 L6,40 C3,42 4,46 7,47 L18,48 C22,52 30,52 36,50 C42,48 46,42 42,32 Z';
      hs += body(c, hd, col, F('M34,24 L50,24 L50,54 L38,54 C44,44 42,34 34,24 Z', dk(col, 0.22), 0.8) + (st ? L('M22,32 L28,38 M30,30 L34,36', st, 2.2) : '') + F('M6,45 C12,48 22,50 34,50 L34,56 L4,56 Z', bel, 0.9) + mk(o.headMark));
      hs += P('M8,46 L18,47 C22,50 28,51 32,50 L30,54 C22,56 12,54 8,50 Z', '#5a1a14', 1.3) + P('M10,46.5 L11,49.5 L12.5,46.8 Z M15,47 L16,50 L17.5,47.2 Z M20,47.6 L21.6,50.6 L22.8,48 Z', '#fff', 0.6);
    }
    hs += L(o.open ? 'M17,33 L27,36' : 'M18,34 L27,35.5', OL, 2.2) + E(23, 37.4, 2.2, 1.7, o.eye || '#ffe040', 1) + E(22.6, 37.4, 0.6, 1.3, OL) + E(6.5, 41.6, 1, 0.8, OL);
    if (o.headX) hs += o.headX(c);
    s += o.headTf ? G(hs, o.headTf) : hs;
    if (o.talons) { var ah = o.armHand || [34, 72], tk = 'M' + pt(ah) + 'l-7,-4 M' + pt(ah) + 'l-6,3 M' + pt([ah[0] + 1, ah[1] + 1]) + 'l-3,7'; s += limb(o.arm || 'M50,66 L40,74 L34,72', col, 4.2) + L(tk, OL, 3.6) + L(tk, '#f4ecd6', 1.6); }
    else s += limb('M50,66 L40,74 L34,72', col, 3.6) + L('M34,72 L29,70 M34,72 L30,75 M35,73 L32,78', OL, 1.6);
    s += body(c, ellD(64, 76, 11, 11), col, (st ? L('M58,70 L66,82 M64,68 L70,78', st, 2.4) : '') + mk(o.thighMark), 2);
    if (o.sickleK) {
      var k = o.sickleK, x = nf[0], y = nf[1];
      s += limb(o.nearLeg || 'M64,82 L72,98 L60,110 L62,116', col, 6.4) + birdFoot(x, y, dk(col, 0.35), true) +
        P('M' + pt([x - 4, y - 3]) + 'C' + pt([x - 4 - 7 * k, y - 3 - 6 * k]) + ' ' + pt([x - 4 - 5 * k, y - 3 - 13 * k]) + ' ' + pt([x - 4 + 1 * k, y - 3 - 13 * k]) + 'C' + pt([x - 4 + 0.4 * k, y - 3 - 8 * k]) + ' ' + pt([x - 3 + 1.6 * k, y - 3 - 4 * k]) + ' ' + pt([x, y - 5]) + 'Z', c.cel('#f4ecd6'), 1.4);
    } else s += limb('M64,82 L72,98 L60,110 L62,116', col, 6) + birdFoot(62, 121, dk(col, 0.35), true) + P('M58,118 C52,112 54,106 58,106 C58,110 60,114 62,116 Z', c.cel('#f4ecd6'), 1.2);
    return o.tf ? G(s, o.tf) : s;
  }
  // irregular spot blobs for mottled hides, as a mark hook
  function mottle(seed, cnt, x0, y0, x1, y1, dark, light, r0, r1) {
    return function () {
      var r = rng(seed), o = '';
      for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (r0 || 1.6) + r() * ((r1 || 3.4) - (r0 || 1.6)); o += F(shag(x, y, rr * 1.2, rr, 5, 0.3, seed + i * 7), i % 3 === 2 ? light : dark, 0.85); }
      return o;
    };
  }
  // ---- more shared copies of art_stranglethorn.js (camps, marks, troll and human rigs) ----
  function starD(x, y, r, k) { var d = ''; for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * (k || 0.45) : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return d + 'Z'; }
  function mossTop(x0, x1, y, seed, col) {
    var r = rng(seed || 5), d = 'M' + pt([x0 - 1, y - 2.5]);
    for (var x = x0; x <= x1; x += 5) d += 'L' + pt([x, y - 3 - r() * 1.6]);
    d += 'L' + pt([x1 + 1, y + 2]);
    for (var x2 = x1; x2 >= x0; x2 -= 4) d += 'L' + pt([x2, y + 1 + (r() < 0.3 ? r() * 9 : r() * 2)]);
    return P(d + 'Z', col || MOSS, 1.1);
  }
  function rubble(c, x, y, s, col, seed) {
    var r = rng(seed || 3), o = '';
    for (var i = 0; i < 4; i++) { var bx = x + (i - 1.5) * 12 * s + (r() - 0.5) * 4, bw = (10 + r() * 6) * s, bh = (6 + r() * 5) * s, tilt = (r() - 0.5) * 4; o += body(c, pd([[bx - bw / 2, y], [bx - bw / 2 + tilt, y - bh], [bx + bw / 2 + tilt, y - bh - 1], [bx + bw / 2, y]], true), i % 2 ? col : lt(col, 0.06), F(pd([[bx + bw * 0.15, y - bh - 3], [bx + bw, y - bh - 3], [bx + bw, y + 1], [bx + bw * 0.2, y + 1]], true), dk(col, 0.25), 0.8), 1.4); }
    return o + F('M' + pt([x - 20 * s, y - 2]) + 'q' + n(8 * s) + ',' + n(-6 * s) + ' ' + n(16 * s) + ',' + n(-4 * s) + 'l' + n(-2 * s) + ',' + n(5 * s) + 'Z', MOSS, 0.9);
  }
  function skullSpike(c, x, y, h, s) {
    s = s || 1; var d = 'M' + pt([x, y]) + 'L' + pt([x, y - h]);
    return E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.25) + limb(d, '#6a4a2a', 2.6 * s) + P(pd([[x - 1.6 * s, y - h], [x, y - h - 11 * s], [x + 1.6 * s, y - h]], true), c.cel('#d8d0b8'), 0.9 * s) + skull(c, x, y - h + 1 * s, 1.1 * s);
  }
  function tent(c, x, y, s, col, trim) {
    col = col || '#d8c89a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x + 18 * s, y + 2, 44 * s, 5 * s, '#000', 0, 0.26);
    o += body(c, pd([q(0, -40), q(46, -36), q(62, -2), q(20, 0)], true), dk(col, 0.1), L('M' + pt(q(12, -39)) + 'L' + pt(q(30, -0.6)) + 'M' + pt(q(26, -38)) + 'L' + pt(q(44, -1.2)) + 'M' + pt(q(38, -37)) + 'L' + pt(q(55, -1.6)), dk(col, 0.3), 0.9 * s) + F(pd([q(30, -40), q(66, -40), q(66, 4), q(40, 4)], true), dk(col, 0.25), 0.8), 1.7 * s);
    o += body(c, pd([q(-24, 0), q(0, -40), q(20, 0)], true), col, F(pd([q(4, -42), q(24, -42), q(24, 2), q(10, 2)], true), dk(col, 0.2), 0.7), 1.8 * s);
    o += P(pd([q(-8, 0), q(0, -28), q(6, 0)], true), '#2a2016', 1.2 * s) + P(pd([q(0, -28), q(6, 0), q(12, -1)], true), c.cel(lt(col, 0.1)), 1.1 * s);
    if (trim) o += L(pd([q(-22, -1.8), q(0, -37.5), q(18, -1.8)]), trim, 1.8 * s);
    return o + limb('M' + pt(q(0, -39)) + 'L' + pt(q(0, -46)), '#6a4a2a', 2 * s) + L('M' + pt(q(0, -44)) + 'L' + pt(q(-34, 2)) + 'M' + pt(q(46, -36)) + 'L' + pt(q(72, 0)), '#5a4a30', 0.9 * s);
  }
  // banner hanging from a crossbar on a pole (x = pole, y = ground)
  function flag(c, x, y, h, s, cloth, trim, mark, swallow) {
    var w = 16 * s, bh = 26 * s, ty = y - h, bx = x + 1.5 * s, o = E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, ty - 4 * s]), '#5a3e24', 2.6 * s) + limb('M' + pt([x - 2 * s, ty]) + 'L' + pt([x + w + 3 * s, ty]), '#5a3e24', 1.8 * s);
    var d = swallow ? pd([[bx, ty], [bx + w, ty], [bx + w, ty + bh], [bx + w / 2, ty + bh - 6 * s], [bx, ty + bh]], true) : pd([[bx, ty], [bx + w, ty], [bx + w, ty + bh], [bx + w / 2, ty + bh + 5 * s], [bx, ty + bh]], true);
    o += body(c, d, cloth, (trim ? L(pd([[bx + 1.8 * s, ty + 1], [bx + 1.8 * s, ty + bh - 1]]) + pd([[bx + w - 1.8 * s, ty + 1], [bx + w - 1.8 * s, ty + bh - 1]]), trim, 1.3 * s) : '') + F(pd([[bx + w * 0.62, ty], [bx + w + 1, ty], [bx + w + 1, ty + bh + 6 * s], [bx + w * 0.62, ty + bh + 6 * s]], true), '#000', 0.22), 1.4 * s);
    if (mark) o += mark(bx + w / 2, ty + bh * 0.45, s);
    return o + C(x, ty - 4 * s, 1.8 * s, c.cel(GOLD), 0.9 * s);
  }
  // original marks: rebel gold star over a chevron; Horde black fang-crown; Kurzen tan crossed blades
  function rebelMark(x, y, s) { return P(starD(x, y - 2 * s, 5 * s), GOLD, 0.8 * s) + L('M' + pt([x - 5 * s, y + 8 * s]) + 'L' + pt([x, y + 4 * s]) + 'L' + pt([x + 5 * s, y + 8 * s]), GOLD, 1.8 * s); }
  function hordeMark(x, y, s) { return F(pd([[x - 6 * s, y + 6 * s], [x - 6 * s, y - 2 * s], [x - 3 * s, y + 1 * s], [x, y - 7 * s], [x + 3 * s, y + 1 * s], [x + 6 * s, y - 2 * s], [x + 6 * s, y + 6 * s], [x, y + 9 * s]], true), '#1a1009'); }
  function kurzenMark(x, y, s) { var d = 'M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x + 5 * s, y + 6 * s]) + 'M' + pt([x + 5 * s, y - 6 * s]) + 'L' + pt([x - 5 * s, y + 6 * s]); return C(x, y, 7 * s, '#1a1a14', 0, 0.5) + L(d, '#1a1009', 3 * s) + L(d, '#c8b88a', 1.6 * s) + L('M' + pt([x - 4 * s, y + 7 * s]) + 'L' + pt([x - 7 * s, y + 9 * s]) + 'M' + pt([x + 4 * s, y + 7 * s]) + 'L' + pt([x + 7 * s, y + 9 * s]), '#6a4a2a', 1.6 * s); }
  // log palisade with pointed tops and two rope bands; spikes angle outward
  function palisade(c, x0, x1, y, h, col, seed, spikes) {
    col = col || '#8a6a44'; var r = rng(seed || 11), o = '', lw = 9;
    for (var x = x0; x < x1; x += lw) {
      var hh = h * (0.9 + r() * 0.18);
      o += body(c, pd([[x, y], [x, y - hh + 5], [x + lw / 2, y - hh - 4], [x + lw, y - hh + 5], [x + lw, y]], true), r() < 0.5 ? col : lt(col, 0.07), F(pd([[x + lw * 0.6, y - hh - 6], [x + lw + 1, y - hh - 6], [x + lw + 1, y + 1], [x + lw * 0.6, y + 1]], true), dk(col, 0.3), 0.8), 1.4);
    }
    var rl = 'M' + pt([x0, y - h * 0.28]) + 'L' + pt([x1, y - h * 0.3]) + 'M' + pt([x0, y - h * 0.7]) + 'L' + pt([x1, y - h * 0.72]);
    o += L(rl, OL, 3.6) + L(rl, '#b8a070', 1.8);
    if (spikes) for (var sx = x0 + 10; sx < x1 - 4; sx += 20) { var sy = y - h * 0.45; o += P(pd([[sx, sy - 2.5], [sx - 15, sy + 6], [sx + 1, sy + 3]], true), c.cel('#ddd2b8'), 1.2); }
    return o;
  }
  // wooden watch platform on stilts with a thatched roof and a ladder
  function watchTower(c, x, y, s, roof, flagCol, mark) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#7a5a36', o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.26);
    o += limb('M' + pt(q(-16, 0)) + 'L' + pt(q(-12, -56)) + 'M' + pt(q(16, 0)) + 'L' + pt(q(12, -56)), wood, 3.2 * s) + limb('M' + pt(q(-15, -4)) + 'L' + pt(q(12, -30)) + 'M' + pt(q(15, -4)) + 'L' + pt(q(-12, -30)) + 'M' + pt(q(-14, -30)) + 'L' + pt(q(12, -52)) + 'M' + pt(q(14, -30)) + 'L' + pt(q(-12, -52)), dk(wood, 0.15), 1.8 * s);
    var lad = 'M' + pt(q(18, 0)) + 'L' + pt(q(16, -56)) + 'M' + pt(q(25, 0)) + 'L' + pt(q(23, -56));
    for (var j = 1; j < 8; j++) lad += 'M' + pt(q(18 - j * 0.28, -j * 7)) + 'L' + pt(q(25 - j * 0.28, -j * 7));
    o += L(lad, OL, 3.2 * s) + L(lad, lt(wood, 0.1), 1.5 * s);
    o += P(pd([q(-22, -56), q(22, -56), q(21, -50), q(-21, -50)], true), c.cel(wood), 1.6 * s);
    var rail = 'M' + pt(q(-20, -56)) + 'L' + pt(q(-20, -68)) + 'M' + pt(q(20, -56)) + 'L' + pt(q(20, -68)) + 'M' + pt(q(0, -56)) + 'L' + pt(q(0, -68)) + 'M' + pt(q(-20, -66)) + 'L' + pt(q(20, -66));
    o += L(rail, OL, 3.4 * s) + L(rail, lt(wood, 0.1), 1.7 * s);
    if (flagCol) o += body(c, pd([q(-18, -65), q(-4, -65), q(-4, -48), q(-11, -44), q(-18, -48)], true), flagCol, F(pd([q(-10, -66), q(-3, -66), q(-3, -44), q(-10, -44)], true), '#000', 0.25), 1.2 * s) + (mark ? mark(x - 11 * s, y - 58 * s, 0.6 * s) : '');
    o += limb('M' + pt(q(-18, -56)) + 'L' + pt(q(-18, -80)) + 'M' + pt(q(18, -56)) + 'L' + pt(q(18, -80)), wood, 2 * s);
    roof = roof || '#b89a56';
    var th = '';
    for (var k = -3; k <= 3; k++) th += 'M' + pt(q(k * 7, -76)) + 'L' + pt(q(k * 2, -92));
    return o + body(c, pd([q(-28, -76), q(0, -96), q(28, -76)], true), roof, L(th, dk(roof, 0.35), 0.9 * s) + F(pd([q(2, -98), q(30, -98), q(30, -74), q(8, -74)], true), dk(roof, 0.25), 0.8), 1.6 * s) +
      L('M' + pt(q(-28, -76)) + 'l' + n(-2 * s) + ',' + n(5 * s) + 'M' + pt(q(-16, -76)) + 'l' + n(-1 * s) + ',' + n(5 * s) + 'M' + pt(q(16, -76)) + 'l' + n(1 * s) + ',' + n(5 * s) + 'M' + pt(q(28, -76)) + 'l' + n(2 * s) + ',' + n(5 * s), dk(roof, 0.2), 1.6 * s);
  }
  // orc hut: round hide walls on a log frame, a spiked roof and tusks over the door (x = centre, y = ground)
  function orcHut(c, x, y, s, hide) {
    hide = hide || '#9a5a3a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 34 * s, 4 * s, '#000', 0, 0.28);
    o += body(c, 'M' + pt(q(-30, 0)) + 'L' + pt(q(-28, -22)) + 'L' + pt(q(28, -22)) + 'L' + pt(q(30, 0)) + 'Z', hide, L('M' + pt(q(-14, -22)) + 'L' + pt(q(-15, 0)) + 'M' + pt(q(14, -22)) + 'L' + pt(q(15, 0)), dk(hide, 0.35), 1.2 * s) + F(pd([q(8, -24), q(32, -24), q(32, 2), q(10, 2)], true), dk(hide, 0.3), 0.8), 1.8 * s);
    o += body(c, 'M' + pt(q(-34, -20)) + 'Q' + pt(q(-20, -44)) + ' ' + pt(q(0, -48)) + 'Q' + pt(q(20, -44)) + ' ' + pt(q(34, -20)) + 'Z', '#6a4428', L('M' + pt(q(-20, -22)) + 'L' + pt(q(-8, -46)) + 'M' + pt(q(0, -22)) + 'L' + pt(q(0, -47)) + 'M' + pt(q(20, -22)) + 'L' + pt(q(8, -46)), '#4a2e18', 1.1 * s) + F(pd([q(4, -50), q(36, -50), q(36, -18), q(10, -18)], true), '#000', 0.25), 1.8 * s);
    [[-18, -38], [0, -48], [18, -38]].forEach(function (p) { o += P(pd([q(p[0] - 2.4, p[1] + 2), q(p[0], p[1] - 10), q(p[0] + 2.4, p[1] + 2)], true), c.cel('#d8ccb0'), 1 * s); });
    o += P('M' + pt(q(-8, 0)) + 'L' + pt(q(-8, -12)) + 'Q' + pt(q(0, -20)) + ' ' + pt(q(8, -12)) + 'L' + pt(q(8, 0)) + 'Z', '#1e140c', 1.3 * s);
    return o + P('M' + pt(q(-10, -12)) + 'C' + pt(q(-16, -16)) + ' ' + pt(q(-16, -24)) + ' ' + pt(q(-10, -28)) + 'C' + pt(q(-12, -22)) + ' ' + pt(q(-10, -18)) + ' ' + pt(q(-7, -15)) + 'Z', c.cel('#f0e6cc'), 1.1 * s) + P('M' + pt(q(10, -12)) + 'C' + pt(q(16, -16)) + ' ' + pt(q(16, -24)) + ' ' + pt(q(10, -28)) + 'C' + pt(q(12, -22)) + ' ' + pt(q(10, -18)) + ' ' + pt(q(7, -15)) + 'Z', c.cel('#e0d6bc'), 1.1 * s);
  }
  function mineMouth(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = F('M' + pt(q(-20, 0)) + 'L' + pt(q(-20, -26)) + 'Q' + pt(q(0, -40)) + ' ' + pt(q(20, -26)) + 'L' + pt(q(20, 0)) + 'Z', '#0e0c0a');
    o += C(x, y - 10 * s, 14 * s, glow(c, '#ffb040', 0.3));
    o += limb('M' + pt(q(-20, 2)) + 'L' + pt(q(-18, -32)) + 'M' + pt(q(20, 2)) + 'L' + pt(q(18, -32)), '#7a5634', 4.4 * s) + limb('M' + pt(q(-26, -32)) + 'L' + pt(q(26, -32)), '#8a6440', 4.8 * s);
    var tr = 'M' + pt(q(-6, -6)) + 'L' + pt(q(-14, 30)) + 'M' + pt(q(6, -6)) + 'L' + pt(q(14, 30)), sl = '';
    for (var i = 0; i < 6; i++) { var t = i / 5; sl += 'M' + pt(q(-7 - 8 * t, -4 + 34 * t)) + 'L' + pt(q(7 + 8 * t, -4 + 34 * t)); }
    return o + L(sl, '#5a4028', 2.4 * s) + L(tr, OL, 2.6 * s) + L(tr, '#8a8e96', 1.2 * s) + lantern2(c, x + 26 * s, y - 30 * s, s);
  }
  function lantern2(c, x, y, s) { return L('M' + pt([x, y - 2 * s]) + 'L' + pt([x, y + 3 * s]), OL, 1 * s) + C(x, y + 8 * s, 10 * s, glow(c, '#ffc860', 0.55)) + P(pd([[x - 3 * s, y + 3 * s], [x + 3 * s, y + 3 * s], [x + 3.4 * s, y + 11 * s], [x - 3.4 * s, y + 11 * s]], true), '#ffd27a', 1 * s); }
  function moon(c, x, y, r) { return C(x, y, r * 4, glow(c, '#dfe8ff', 0.4)) + C(x, y, r, '#eef2fa') + C(x - r * 0.3, y - r * 0.2, r * 0.25, '#d0d8e8') + C(x + r * 0.35, y + r * 0.3, r * 0.18, '#d0d8e8') + C(x + r * 0.1, y - r * 0.5, r * 0.12, '#d8e0ee'); }
  function stars(seed, cnt, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(r() * 400, r() * (y1 || 100), 0.5 + r() * 0.8, '#f0f4ff', 0, 0.4 + r() * 0.5); return o; }
  function wedge(x, y, len, ang, w) { var q = dirQ([x, y], ang); return pd([q(0, -w / 2), q(len * 0.5, -w * 0.36), q(len, 0), q(len * 0.5, w * 0.36), q(0, w / 2)], true); }
  function tipD(T, from) { var A = T.a.slice(from), B = T.b.slice(from).reverse(); return pd(A.concat(B), true); }
  function jtHead(c, x, y, o) {
    var sk = o.skin, s = '', pc = o.paintCol || BSRED;
    if (o.hairBack) s += o.hairBack(c, x, y);
    s += P('M' + pt([x + 6, y - 2]) + 'L' + pt([x + 32, y - 15]) + 'L' + pt([x + 27, y - 7]) + 'L' + pt([x + 10, y + 7]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 11, y - 1]) + 'L' + pt([x + 27, y - 11]) + 'L' + pt([x + 12, y + 3]) + 'Z', dk(sk, 0.3), 0.8);
    if (o.earring) s += L(ellD(x + 24, y - 6, 2.2, 2.6), OL, 2.4) + L(ellD(x + 24, y - 6, 2.2, 2.6), GOLD, 1.2);
    if (o.hair) s += P(pd([[x - 6, y - 12], [x - 12, y - 28], [x - 1, y - 20], [x + 1, y - 38], [x + 7, y - 21], [x + 15, y - 34], [x + 14, y - 16], [x + 24, y - 22], [x + 14, y - 5]], true), c.cel(o.hair), 2) + L('M' + pt([x - 2, y - 16]) + 'L' + pt([x + 1, y - 30]) + 'M' + pt([x + 7, y - 16]) + 'L' + pt([x + 13, y - 28]), dk(o.hair, 0.35), 1.1);
    var d = 'M' + pt([x - 6, y - 12]) + 'C' + pt([x, y - 17]) + ' ' + pt([x + 11, y - 14]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 11, y + 9]) + 'C' + pt([x + 8, y + 15]) + ' ' + pt([x, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'L' + pt([x - 12, y + 11]) + 'C' + pt([x - 14, y + 8]) + ' ' + pt([x - 13, y + 6]) + ' ' + pt([x - 11, y + 5]) +
      'L' + pt([x - 22, y + 6]) + 'C' + pt([x - 27, y + 6]) + ' ' + pt([x - 26, y + 1]) + ' ' + pt([x - 21, y - 1]) + 'L' + pt([x - 9, y - 5]) + 'Z';
    var paint = '';
    if (o.paint === 'stripes') paint = F(pd([[x - 14, y - 7], [x + 4, y - 8], [x + 5, y - 3], [x - 12, y - 1]], true) + pd([[x - 2, y + 3], [x + 8, y + 1], [x + 8, y + 4], [x - 1, y + 7]], true) + pd([[x + 1, y + 9], [x + 9, y + 7], [x + 8, y + 10], [x + 1, y + 12]], true), pc, 0.95);
    else if (o.paint === 'band') paint = F(pd([[x - 17, y - 8], [x + 11, y - 9], [x + 11, y - 1], [x - 14, y + 1]], true), pc, 0.9) + C(x + 3, y + 5, 1.1, '#f0ece0') + C(x - 1, y + 7, 1.1, '#f0ece0') + C(x + 6, y + 8, 1.1, '#f0ece0');
    else if (o.paint === 'skull') paint = F(ellD(x - 6, y - 5, 5.6, 4.4), '#f0ece0', 0.95) + F(pd([[x - 12, y + 9], [x + 6, y + 9], [x + 8, y + 14], [x - 4, y + 15], [x - 12, y + 12]], true), '#f0ece0', 0.9) + L('M' + pt([x - 9, y + 9]) + 'l0,5 M' + pt([x - 4, y + 9.4]) + 'l0,5.4 M' + pt([x + 1, y + 9.4]) + 'l0,5', OL, 1, 0.8) + F(pd([[x - 22, y + 1], [x - 16, y - 1], [x - 14, y + 4], [x - 21, y + 5]], true), '#f0ece0', 0.8);
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.25), 0.8) + paint, 2.2);
    s += P('M' + pt([x - 22, y + 5]) + 'C' + pt([x - 23, y + 10]) + ' ' + pt([x - 19, y + 11]) + ' ' + pt([x - 17, y + 6]) + 'Z', c.cel(dk(sk, 0.1)), 1.3);
    s += L('M' + pt([x - 13, y - 8]) + 'L' + pt([x - 1, y - 5]), OL, 2.6);
    s += o.glow ? glowEye(c, x - 6, y - 3, 1.8, o.eye) : C(x - 6, y - 3, 1.9, o.eye || '#ffcc30', 1) + C(x - 6.4, y - 3.4, 0.6, '#fff');
    s += L('M' + pt([x - 12, y + 11]) + 'L' + pt([x - 2, y + 11]), OL, 1.4);
    s += P('M' + pt([x - 7, y + 12.5]) + 'C' + pt([x - 14, y + 13]) + ' ' + pt([x - 19, y + 7]) + ' ' + pt([x - 18, y - 1]) + 'C' + pt([x - 15, y + 5]) + ' ' + pt([x - 11, y + 7.5]) + ' ' + pt([x - 3, y + 9.5]) + 'Z', c.cel('#f4ecd6'), 1.6);
    return s;
  }
  // ---- jungle troll (facing left): tall, hunched, bent digitigrade legs, long arms ----
  function jTroll(c, o) {
    var sk = o.skin;
    return biped(c, {
      skin: sk, shirt: sk, pants: sk, sleeve: sk, forearm: o.forearm || sk, glove: o.glove, feet: toes2, boots: dk(sk, 0.25), digi: true, legW: o.legW || 9.5, armW: o.armW || 8.5,
      hx: 44, hy: 38, hipY: 86, neckCol: sk, shadowR: 34,
      torsoD: 'M42,56 C44,44 70,40 82,48 L82,68 L76,88 L52,88 L46,72 Z',
      head: function (c, x, y) { return jtHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); },
      back: o.back, chest: function (c) { return L('M58,66 Q64,70 70,66', dk(sk, 0.3), 1.4) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return body(c, 'M50,84 L78,84 L80,100 L70,97 L64,104 L58,97 L48,100 Z', o.loin || '#6a3a24', L('M50,86 L78,86', OL, 2.4) + (o.loinTrim ? L('M50,98 L58,95 L64,101 L70,95 L79,98', o.loinTrim, 1.8) : ''), 1.8) + (o.front ? o.front(c) : ''); },
      pads: o.pads, top: o.top, shins: o.shins,
      near: o.near || [[46, 58], [36, 76], [30, 92]], far: o.far || [[80, 54], [90, 72], [92, 90]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, tf: o.tf || at(0.98, 64, 122)
    });
  }
  // ---- human head (facing left) ----
  function hmHead(c, x, y, o) {
    var sk = o.skin || '#e0a880', hc = o.hair || '#4a3020', s = '';
    s += E(x + 7, y + 1, 2.8, 3.8, c.cel(sk), 1.6);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8) +
      (o.stubble ? F('M' + pt([x - 10, y + 4]) + 'C' + pt([x - 8, y + 12]) + ' ' + pt([x + 4, y + 14]) + ' ' + pt([x + 10, y + 5]) + 'L' + pt([x + 10, y + 14]) + 'L' + pt([x - 10, y + 14]) + 'Z', o.stubble, 0.55) : '') +
      (o.camo ? F(pd([[x - 11, y - 2], [x + 2, y - 3], [x + 3, y], [x - 10, y + 1]], true) + pd([[x - 6, y + 5], [x + 6, y + 3], [x + 6, y + 6], [x - 5, y + 7]], true), o.camo, 0.8) : '') +
      (o.dots ? C(x - 4, y + 3, 0.9, o.dots) + C(x - 1, y + 5, 0.9, o.dots) + C(x + 2, y + 3, 0.9, o.dots) + L('M' + pt([x - 8, y - 3]) + 'l6,0', o.dots, 1.2) : '') +
      (o.scar ? L('M' + pt([x - 3, y - 9]) + 'L' + pt([x + 2, y + 6]), dk(sk, 0.4), 1.3) : ''), 2);
    if (o.patch) s += L('M' + pt([x - 10, y - 5]) + 'L' + pt([x + 10, y - 9]), OL, 1.6) + E(x - 5, y - 2, 3.4, 3, '#1a1414', 1.2);
    else s += C(x - 5, y - 1.6, 1.7, OL) + C(x - 5.5, y - 2.2, 0.5, '#fff');
    s += L('M' + pt([x - 9, y - 5.6]) + 'L' + pt([x - 1, y - 5]), dk(hc, 0.2), 2);
    if (o.beard) s += P('M' + pt([x - 10, y + 5]) + 'C' + pt([x - 9, y + 16]) + ' ' + pt([x + 3, y + 18]) + ' ' + pt([x + 9, y + 7]) + 'L' + pt([x + 7, y + 4]) + 'C' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 9]) + ' ' + pt([x - 10, y + 5]) + 'Z', c.cel(o.beard), 1.6);
    if (o.tache) s += P('M' + pt([x - 12, y + 6]) + 'C' + pt([x - 10, y + 3]) + ' ' + pt([x - 3, y + 3]) + ' ' + pt([x + 1, y + 6]) + 'C' + pt([x - 3, y + 6]) + ' ' + pt([x - 8, y + 6]) + ' ' + pt([x - 12, y + 9]) + 'Z', c.cel(o.tache), 1.2);
    else s += L('M' + pt([x - 9, y + 7]) + 'L' + pt([x - 3, y + 7.4]), OL, 1.3);
    var hat = o.hat;
    if (hat === 'bandana') {
      var bc = o.hatCol || '#3a5a2a';
      s += P('M' + pt([x - 11, y - 4]) + 'C' + pt([x - 11, y - 16]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 8, y - 5]) + 'C' + pt([x + 2, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 11, y - 4]) + 'Z', c.cel(bc), 2) + C(x - 2, y - 12, 1.2, dk(bc, 0.35)) + C(x + 5, y - 10, 1.2, dk(bc, 0.35)) + C(x - 6, y - 8, 1, dk(bc, 0.35));
      s += P('M' + pt([x + 10, y - 7]) + 'L' + pt([x + 21, y - 3]) + 'L' + pt([x + 18, y + 1]) + 'L' + pt([x + 22, y + 5]) + 'L' + pt([x + 13, y + 1]) + 'Z', c.cel(bc), 1.6) + C(x + 11, y - 7, 2.4, c.cel(bc), 1.4);
    } else if (hat === 'officer') {
      var oc = o.hatCol || '#4a4a2e';
      s += P('M' + pt([x - 11, y - 9]) + 'C' + pt([x - 14, y - 20]) + ' ' + pt([x + 12, y - 24]) + ' ' + pt([x + 15, y - 12]) + 'L' + pt([x + 11, y - 6]) + 'L' + pt([x - 10, y - 5]) + 'Z', c.cel(oc), 2) + R(x - 11, y - 9, 23, 3.6, c.cel('#1e1a14'), 1.2);
      s += P('M' + pt([x - 10, y - 5.4]) + 'C' + pt([x - 14, y - 5]) + ' ' + pt([x - 19, y - 3]) + ' ' + pt([x - 20, y - 1]) + 'C' + pt([x - 16, y - 2]) + ' ' + pt([x - 12, y - 3]) + ' ' + pt([x - 6, y - 4]) + 'Z', c.cel('#1a1612'), 1.4) + P(pd([[x - 2, y - 17], [x + 1, y - 21], [x + 4, y - 17], [x + 1, y - 13]], true), c.cel(GOLD), 1) + L('M' + pt([x - 8, y - 18]) + 'L' + pt([x + 10, y - 21]), '#8a2a1a', 1.2, 0.8);
      s += L('M' + pt([x + 13, y - 11]) + 'l4,4 M' + pt([x + 14, y - 16]) + 'l5,1', dk(oc, 0.2), 1.6);
    } else {
      s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 4]) + 'C' + pt([x + 3, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 2);
      if (hat === 'feathers') {
        var fc = o.feathers || ['#c83a2a', '#e8b830', '#3a8a3a', '#2a6ab0', '#c83a2a'];
        fc.forEach(function (fcol, i) { var a = -PI / 2 + 0.9 - i * 0.36; s += feather(c, x + 5 + i * 0.4, y - 10, a, 17 - Math.abs(i - 2) * 1.5, fcol, '#1a1009'); });
        s += P('M' + pt([x - 11, y - 7]) + 'C' + pt([x - 4, y - 11]) + ' ' + pt([x + 6, y - 12]) + ' ' + pt([x + 12, y - 7]) + 'L' + pt([x + 12, y - 4]) + 'C' + pt([x + 6, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 11, y - 4]) + 'Z', c.cel('#b8883a'), 1.2) + C(x - 2, y - 7.6, 1.3, '#3ab0a0', 0.6) + C(x + 5, y - 8.6, 1.3, '#c83a2a', 0.6);
      }
    }
    return s;
  }
  function human(c, o) {
    return biped(c, {
      skin: o.skin || '#e0a880', shirt: o.shirt, pants: o.pants, sleeve: o.sleeve, forearm: o.forearm, glove: o.glove, boots: o.boots || '#2a2218', belt: o.belt, buckle: o.buckle,
      head: function (c, x, y) { return hmHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); }, hx: 58, hy: 31, neckCol: o.skin || '#e0a880',
      noLegs: o.noLegs, torsoD: o.torsoD, legW: o.legW || 10.5, armW: o.armW || 9, shadowR: o.shadowR || 32,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      chest: o.chest, pads: o.pads, back: o.back, front: o.front, shins: o.shins, top: o.top, tf: o.tf
    });
  }
  // machete: black grip, wide blade with a clipped tip
  function machete(c, p, len, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-6, 0)) + 'L' + pt(q(6, 0)), '#1e1a16', 3.6) + R(q(6, 0)[0] - 2.6, q(6, 0)[1] - 2.6, 5.2, 5.2, c.cel('#6a6460'), 1.1);
    var bl = pd([q(8, -2.4), q(len * 0.7, -3.6), q(len, -2.6), q(len + 2, 1), q(len * 0.9, 4.6), q(len * 0.4, 4), q(8, 2.6)], true);
    return o + P(bl, c.cel('#b0b4b8'), 1.7) + L('M' + pt(q(10, 3)) + 'L' + pt(q(len * 0.88, 4)), '#ffffff', 1, 0.7) + L('M' + pt(q(len * 0.3, -1)) + 'L' + pt(q(len * 0.55, -1.6)), '#7a3a2a', 1.2, 0.5);
  }
  function flask(c, x, y, s, col) {
    col = col || VOO;
    return C(x, y, 12 * s, glow(c, col, 0.55)) + P('M' + pt([x - 2 * s, y - 10 * s]) + 'L' + pt([x - 2 * s, y - 5 * s]) + 'C' + pt([x - 8 * s, y - 3 * s]) + ' ' + pt([x - 8 * s, y + 6 * s]) + ' ' + pt([x, y + 6 * s]) + 'C' + pt([x + 8 * s, y + 6 * s]) + ' ' + pt([x + 8 * s, y - 3 * s]) + ' ' + pt([x + 2 * s, y - 5 * s]) + 'L' + pt([x + 2 * s, y - 10 * s]) + 'Z', c.rg([[0, '#ffffff'], [0.4, lt(col, 0.3)], [1, col]]), 1.4 * s) +
      R(x - 2.6 * s, y - 13 * s, 5.2 * s, 3.4 * s, c.cel('#8a5a34'), 1 * s) + E(x - 2.4 * s, y - 1 * s, 1.4 * s, 2.4 * s, '#fff', 0, 0.6) + C(x + 3 * s, y - 18 * s, 1.2 * s, lt(col, 0.4)) + C(x - 2 * s, y - 23 * s, 0.9 * s, lt(col, 0.4));
  }
  function vial(c, x, y, col) { return R(x - 2, y - 7, 4, 8, c.cel(col), 1) + R(x - 1.4, y - 9, 2.8, 2.4, '#8a5a34', 0.8) + R(x - 1, y - 5.4, 1, 4, '#fff', 0); }
  function bandolier(x0, y0, x1, y1, col, dots) {
    var d = 'M' + pt([x0, y0]) + 'L' + pt([x1, y1]), o = L(d, OL, 6) + L(d, col || '#5a3a22', 4);
    for (var i = 1; i < (dots || 5); i++) { var t = i / (dots || 5); o += R(x0 + (x1 - x0) * t - 1.6, y0 + (y1 - y0) * t - 2.4, 3.2, 4.8, '#c8a040', 0.8); }
    return o;
  }
  // bone armour pieces
  function ribPlate(c, x0, y0, x1, y1) {
    var o = '', k = 4, mx = (x0 + x1) / 2;
    for (var i = 0; i < k; i++) { var y = y0 + (y1 - y0) * i / (k - 1), d = 'M' + pt([x0, y + 3]) + 'Q' + pt([mx, y - 4]) + ' ' + pt([x1, y + 3]); o += L(d, OL, 4.6) + L(d, BONE, 2.6); }
    return L('M' + pt([mx, y0 - 3]) + 'L' + pt([mx, y1 + 3]), OL, 5) + L('M' + pt([mx, y0 - 3]) + 'L' + pt([mx, y1 + 3]), '#d0c6aa', 3) + o;
  }
  function bonePad(c, x, y, r) {
    var o = body(c, 'M' + pt([x - r, y + r * 0.2]) + 'C' + pt([x - r * 1.05, y - r * 0.9]) + ' ' + pt([x + r * 1.05, y - r * 0.9]) + ' ' + pt([x + r, y + r * 0.2]) + 'Z', BONE, F(pd([[x + r * 0.2, y - r], [x + r * 1.2, y - r], [x + r * 1.2, y + r], [x + r * 0.3, y + r]], true), '#8a7e66', 0.45), 1.8);
    [[-0.5, -0.5], [0.1, -0.8], [0.6, -0.4]].forEach(function (k) { var px = x + k[0] * r, py = y + k[1] * r; o += P(pd([[px - 2.2, py + 1], [px - 1, py - r * 0.9], [px + 2.2, py + 1]], true), c.cel('#f0e8d4'), 1.1); });
    return o;
  }
  function skullStaff(c, bot, top, col) {
    var d = 'M' + pt(bot) + 'L' + pt(top), x = top[0], y = top[1];
    var o = limb(d, '#6a4a2a', 3.4) + L(d, '#9a7a50', 1, 0.6) + C(x, y - 6, 22, glow(c, col, 0.55));
    o += P(pd([[x - 6, y - 8], [x - 12, y - 22], [x - 3, y - 12]], true), c.cel('#e8dcc0'), 1.1) + P(pd([[x + 6, y - 8], [x + 12, y - 22], [x + 3, y - 12]], true), c.cel('#e8dcc0'), 1.1);
    o += skull(c, x, y - 4, 1.3) + gEye(c, x - 3.4, y - 5.3, 1.1, col) + gEye(c, x + 3.4, y - 5.3, 1.1, col);
    return o + feathers(x - 1, y + 4, ['#e8e0c8', '#3a7a3a', '#c8a040'], 0.6, 0.2) + L('M' + pt([x - 3, y + 6]) + 'L' + pt([x + 3, y + 8]), OL, 1.4);
  }
  // ============================================================
  //  ARATHI PIECES
  // ============================================================
  var PINE = '#3e6a3a';
  var MOSS = '#8a9a3e', MOSSD = '#5e6e2c', REED = '#9aa04a', STONE = '#a4a298', MUDD = '#4a3e2c', TST = '#a4a298',
    ALLY = '#2a4a8a', GOLD = '#d8b040', HRED = '#a8241a', BONE = '#e0d6bc', BSRED = '#c8281e', VOO = '#a060f0',
    GRASS = '#b8a852', GRASSG = '#8e9c48', GRASSD = '#5e6a30', RUIN = '#aaa89e', DRY = '#b8804e', SYN = '#221c22', SYNR = '#b41e24',
    WBP = '#8a4ab0', HAIRW2 = '#2e2238', WBSK = '#3f8a66', BFSK = '#8e9aa6', ORC = '#8a7a66';
  function ahSky(c, top, mid, bot) { return sky(c, top || '#5a96d2', mid || '#a8d0ec', bot || '#f2e6c0'); }
  // tall highland cumulus: shaded puffs under lit puffs, flat grey base
  function cumulus(x, y, s, col, sh, seed) {
    col = col || '#fbfaf4'; sh = sh || '#c4d0dc';
    var r = rng(seed || Math.round(x * 7 + y * 3)), o = '', lo = '';
    [[-40, 2, 12], [-26, -6, 16], [-8, -14, 21], [12, -20, 19], [28, -8, 17], [42, 0, 12], [4, -2, 18], [-18, 2, 14], [24, 2, 14]].forEach(function (p) {
      var rr = p[2] * (0.88 + r() * 0.24) * s;
      o += C(x + p[0] * s, y + p[1] * s, rr, sh); lo += C(x + p[0] * s - rr * 0.1, y + p[1] * s - rr * 0.24, rr * 0.84, col);
    });
    return o + lo + E(x, y + 9 * s, 44 * s, 4.6 * s, sh, 0, 0.95);
  }
  // rolling ridge with a lit crest line
  function roll(c, seed, base, amp, col, step, rim, sw) {
    var r = rng(seed), p = [], x = -40;
    while (x < 440 + step) { p.push([x, base - amp * (0.3 + 0.7 * r())]); x += step * (0.7 + 0.6 * r()); }
    var seg = '';
    for (var i = 0; i < p.length - 1; i++) seg += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]);
    var last = p[p.length - 1], d = 'M' + pt([-40, 250]) + 'L' + pt(p[0]) + seg + 'L' + pt(last) + 'L' + pt([last[0], 250]) + 'Z';
    var fill = c.lg([[0, col], [0.45, col], [1, dk(col, 0.22)]]);
    return (sw ? P(d, fill, sw) : F(d, fill)) + (rim ? L('M' + pt(p[0]) + seg, rim, 1.6, 0.8) : '');
  }
  // golden highland field: lit rim, long windswept grass strokes and paler swathes
  function field(c, y, top, bot, seed) {
    var r = rng(seed || 3), o = R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])) + L('M-2,' + n(y + 1) + ' L402,' + n(y + 1), lt(top, 0.28), 2, 0.8), sw = '';
    for (var i = 0; i < 7; i++) { var yy = y + 8 + r() * (234 - y), w = 30 + r() * 60, xx = r() * 400; sw += ellD(xx, yy, w, 2 + (yy - y) * 0.03); }
    o += F(sw, lt(top, 0.16), 0.6);
    var d = '';
    for (var j = 0; j < 90; j++) { var gy = y + 4 + r() * (238 - y), t = (gy - y) / (240 - y), h = 3 + t * 9, gx = r() * 400; d += 'M' + pt([gx, gy]) + 'q' + n(h * 0.3) + ',' + n(-h * 0.6) + ' ' + n(h * 0.8) + ',' + n(-h); }
    return o + L(d, dk(top, 0.25), 1.1, 0.8);
  }
  function wildflowers(seed, y0, y1, cnt) { return flowers(seed, y0, y1, ['#f4e070', '#f0f0e8', '#c878c8', '#f4e070', '#e89a40'], cnt); }
  // weathered standing stone: tapering slab, chipped crown, lichen, cracks, grass at the foot
  function stoneSlab(c, x, y, w, h, col, seed, lean) {
    col = col || RUIN; lean = lean || 0;
    var r = rng(seed || 3), q = function (u, v) { return [x + u * w * (1 - 0.2 * v) + lean * v, y - v * h]; };
    var d = pd([q(-0.5, 0), q(-0.53, 0.38), q(-0.46, 0.8), q(-0.3, 0.96), q(-0.04, 1), q(0.18, 0.97), q(0.3, 0.9), q(0.42, 0.88), q(0.5, 0.52), q(0.5, 0)], true);
    var li = '';
    for (var i = 0; i < 4; i++) li += E(x + (r() - 0.6) * w * 0.6 + lean * 0.5, y - h * (0.3 + r() * 0.6), 1.4 + r() * w * 0.08, 1 + r() * 1.6, i % 2 ? '#c8c068' : '#8a9a5a', 0, 0.8);
    var cr = 'M' + pt(q(-0.1, 0.98)) + 'l' + n(w * 0.06) + ',' + n(h * 0.14) + 'l' + n(-w * 0.05) + ',' + n(h * 0.12) + 'M' + pt(q(0.2, 0.4)) + 'l' + n(-w * 0.1) + ',' + n(h * 0.1);
    return E(x + w * 0.2, y + 1, w * 0.95, 3 + w * 0.08, '#000', 0, 0.22) +
      body(c, d, col, F(pd([q(0.12, 1.1), q(0.8, 1.1), q(0.8, -0.05), q(0.18, -0.05)], true), dk(col, 0.26), 0.85) + L('M' + pt(q(-0.4, 0.1)) + 'L' + pt(q(-0.4, 0.84)), lt(col, 0.3), 1.4, 0.7) + li + L(cr, dk(col, 0.45), 1), 1.8) +
      grass(seed + 1, y - 1, y + 2, GRASSD, Math.round(w / 5), 0.8, 1.2, 1.2, x - w * 0.6, x + w * 0.6);
  }
  // angular rune glyphs stacked in a column, glowing
  var GLYPHS = ['M0,-4L0,4M-3,-1L3,1', 'M-3,-4L3,0L-3,4', 'M-3,4L0,-4L3,4M-2,1L2,1', 'M0,-4L0,4M0,-1L3,-4M0,1L-3,4', 'M-3,-3L3,-3L-3,3L3,3', 'M-3,0L0,-4L3,0L0,4Z', 'M-2,-4L-2,4M2,-4L2,4M-2,0L2,0'];
  function runes(c, x, y, cnt, s, col, seed) {
    var r = rng(seed || 5), d = '';
    for (var i = 0; i < cnt; i++) {
      var g = GLYPHS[Math.floor(r() * GLYPHS.length) % GLYPHS.length], gy = y - i * 11 * s;
      d += g.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, function (m, a, b) { return n(x + a * s) + ',' + n(gy + b * s); });
    }
    return C(x, y - (cnt - 1) * 5.5 * s, (8 + cnt * 5) * s, glow(c, col, 0.5)) + L(d, col, 3.2 * s, 0.45) + L(d, lt(col, 0.65), 1.2 * s);
  }
  // broken curtain wall: stepped jagged crown, optional arch window, rubble at the foot
  function ruinWall(c, x, y, w, h, col, seed, win) {
    col = col || RUIN; var r = rng(seed || 5), top = [], k = Math.max(3, Math.round(w / 12));
    for (var i = 0; i < k; i++) { var dy = r() < 0.25 ? 0 : r() * h * 0.5; top.push([w * i / k, dy], [w * (i + 1) / k, dy]); }
    var o = E(x + w / 2, y + 2, w * 0.6, 4, '#000', 0, 0.22) + stoneFace(c, x, y, w, h, col, 8, top);
    if (win) o += archWin(x + w * win, y - h * 0.3, Math.min(14, w * 0.18), h * 0.34, '#2a2c34', 1.4);
    o += F(pd([[x + w * 0.1, y - h * 0.2], [x + w * 0.2, y - h * 0.45], [x + w * 0.26, y - h * 0.3], [x + w * 0.22, y]], true), '#6a7a3a', 0.55);
    return o + rubble(c, x + w * 0.7, y + 3, 0.6, col, seed + 3);
  }
  // round tower: banded cel shading, stone courses, slits; broken tops are jagged, whole tops get merlons
  function ruinTower(c, x, y, w, h, col, seed, broken) {
    col = col || RUIN; var r = rng(seed || 7), hw = w / 2, tp = [];
    var fill = c.lg([[0, lt(col, 0.16)], [0.26, lt(col, 0.16)], [0.26, col], [0.64, col], [0.64, dk(col, 0.22)], [1, dk(col, 0.3)]], 0, 0, 1, 0);
    if (broken) { for (var i = 0; i <= 6; i++) tp.push([x - hw + w * i / 6, y - h + (i % 2 ? 4 + r() * h * 0.16 : r() * h * 0.05) + (i > 3 ? h * (i - 3) * 0.06 : 0)]); }
    else tp = [[x - hw, y - h], [x + hw, y - h]];
    var d = 'M' + pt([x - hw, y]) + 'L' + tp.map(pt).join('L') + 'L' + pt([x + hw, y]) + 'Q' + pt([x, y + w * 0.14]) + ' ' + pt([x - hw, y]) + 'Z', cs = '';
    for (var yy = y - 9; yy > y - h; yy -= 9) { cs += 'M' + pt([x - hw, yy]) + 'Q' + pt([x, yy + w * 0.12]) + ' ' + pt([x + hw, yy]); for (var j = -2; j <= 2; j++) cs += 'M' + pt([x + j * w * 0.2 + ((yy / 9) % 2 ? w * 0.1 : 0), yy + w * 0.05]) + 'l0,9'; }
    var o = E(x, y + 3, w * 0.8, 4, '#000', 0, 0.25) + P(d, fill, 1.8) + '<g clip-path="url(#' + c.clip(d) + ')">' + L(cs, dk(col, 0.35), 0.8, 0.7) + '</g>';
    o += arrowSlit(x - w * 0.12, y - h * 0.4) + arrowSlit(x + w * 0.18, y - h * 0.68);
    o += L('M' + pt([x + w * 0.1, y - h * 0.95]) + 'l-3,10 l4,8 l-3,9', dk(col, 0.5), 1.1);
    if (!broken) {
      o += P(pd([[x - hw - 4, y - h], [x + hw + 4, y - h], [x + hw + 4, y - h - 6], [x - hw - 4, y - h - 6]], true), c.cel(lt(col, 0.05)), 1.6);
      o += crenels(c, x - hw - 4, x + hw + 4, y - h - 6, col, Math.max(4, w / 7));
    }
    return o;
  }
  // stone keep tower with a slate spire roof and a banner (x = centre, y = ground)
  function keepTower(c, x, y, s, col, roof, cloth, mark) {
    col = col || '#b8b4a6'; roof = roof || '#3a5a8a';
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.28);
    o += stoneFace(c, x - 15 * s, y, 30 * s, 70 * s, col, 7 * s);
    o += P(pd([q(-19, -70), q(19, -70), q(19, -76), q(-19, -76)], true), c.cel(lt(col, 0.06)), 1.6 * s) + crenels(c, x - 19 * s, x + 19 * s, y - 76 * s, col, 5 * s);
    o += body(c, pd([q(-17, -80), q(0, -108), q(17, -80)], true), roof, F(pd([q(1, -110), q(20, -110), q(20, -78), q(4, -78)], true), dk(roof, 0.3), 0.8) + L('M' + pt(q(-8, -80)) + 'L' + pt(q(-2, -104)) + 'M' + pt(q(8, -80)) + 'L' + pt(q(2, -104)), dk(roof, 0.35), 0.9 * s), 1.6 * s);
    o += limb('M' + pt(q(0, -106)) + 'L' + pt(q(0, -118)), '#5a3e24', 1.6 * s) + P(pd([q(0, -118), q(12, -115), q(0, -112)], true), c.cel(cloth || ALLY), 1 * s);
    o += archWin(x, y - 50 * s, 6 * s, 12 * s, '#1a1c24', 1.1) + C(x, y - 44 * s, 8 * s, glow(c, '#ffc860', 0.35)) + arrowSlit(x - 7 * s, y - 28 * s) + arrowSlit(x + 7 * s, y - 28 * s);
    o += archWin(x, y, 10 * s, 18 * s, '#1e160e', 1.3);
    if (cloth) o += body(c, pd([q(-12, -68), q(-2, -68), q(-2, -40), q(-7, -45), q(-12, -40)], true), cloth, F(pd([q(-6, -68), q(-1, -68), q(-1, -40), q(-6, -40)], true), '#000', 0.22), 1.2 * s) + (mark ? mark(x - 7 * s, y - 56 * s, 0.6 * s) : '');
    return o;
  }
  // original marks: Refuge Pointe white keep on blue; Syndicate red triple slash; Boulderfist red handprint
  function refugeMark(x, y, s) {
    return F(pd([[x - 4 * s, y + 7 * s], [x - 4 * s, y - 2 * s], [x - 5.5 * s, y - 2 * s], [x - 5.5 * s, y - 6 * s], [x - 3.2 * s, y - 6 * s], [x - 3.2 * s, y - 4 * s], [x - 1 * s, y - 4 * s], [x - 1 * s, y - 6 * s], [x + 1 * s, y - 6 * s], [x + 1 * s, y - 4 * s], [x + 3.2 * s, y - 4 * s], [x + 3.2 * s, y - 6 * s], [x + 5.5 * s, y - 6 * s], [x + 5.5 * s, y - 2 * s], [x + 4 * s, y - 2 * s], [x + 4 * s, y + 7 * s]], true), '#eef0f4') +
      F(pd([[x - 1.4 * s, y + 7 * s], [x - 1.4 * s, y + 3 * s], [x, y + 1.6 * s], [x + 1.4 * s, y + 3 * s], [x + 1.4 * s, y + 7 * s]], true), '#1a2a4a') + L('M' + pt([x - 6 * s, y + 9 * s]) + 'L' + pt([x + 6 * s, y + 9 * s]), GOLD, 1.6 * s);
  }
  function synMark(x, y, s) { var d = 'M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x - 2 * s, y + 6 * s]) + 'M' + pt([x - 0.5 * s, y - 7 * s]) + 'L' + pt([x + 2 * s, y + 7 * s]) + 'M' + pt([x + 3.5 * s, y - 6 * s]) + 'L' + pt([x + 6 * s, y + 5 * s]); return L(d, SYNR, 2.2 * s); }
  function handMark(x, y, s, col) {
    col = col || '#b8321e';
    return E(x, y + 2 * s, 4.4 * s, 4 * s, col) + L('M' + pt([x - 3.4 * s, y]) + 'l-1.4,' + n(-6 * s) + 'M' + pt([x - 1.2 * s, y - 1 * s]) + 'l-0.4,' + n(-7 * s) + 'M' + pt([x + 1.2 * s, y - 1 * s]) + 'l0.6,' + n(-7 * s) + 'M' + pt([x + 3.4 * s, y]) + 'l1.4,' + n(-5.4 * s) + 'M' + pt([x + 4 * s, y + 3 * s]) + 'l' + n(3.6 * s) + ',' + n(-2.4 * s), col, 2.2 * s);
  }
  // crude hide banner lashed to a pole: ragged bottom, skull cap, dangling bones (x = pole, y = ground)
  function hideBanner(c, x, y, h, s, cloth, mark, seed) {
    var w = 18 * s, bh = 26 * s, ty = y - h, bx = x + 1 * s, o = E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, ty - 6 * s]), '#5a3e24', 2.8 * s) + limb('M' + pt([x - 3 * s, ty]) + 'L' + pt([x + w + 3 * s, ty - 1 * s]), '#6a4a2c', 2 * s);
    var d = pd([[bx, ty], [bx + w, ty - 1 * s], [bx + w - 1 * s, ty + bh]]) + rag(bx + w - 1 * s, bx + 1 * s, ty + bh, 7 * s, seed || 3).replace(/^L/, 'L') + 'Z';
    o += body(c, d, cloth, F(pd([[bx + w * 0.6, ty - 2], [bx + w + 2, ty - 2], [bx + w + 2, ty + bh + 8 * s], [bx + w * 0.6, ty + bh + 8 * s]], true), '#000', 0.22) + L('M' + pt([bx + 3 * s, ty + 4 * s]) + 'l' + n(4 * s) + ',' + n(2 * s), lt(cloth, 0.2), 1 * s), 1.4 * s);
    if (mark) o += mark(bx + w / 2, ty + bh * 0.45, s);
    o += L('M' + pt([bx + w + 2 * s, ty]) + 'l0,' + n(12 * s), OL, 0.8 * s) + bone(bx + w + 2 * s, ty + 15 * s, 6 * s, PI / 2, 0.5 * s);
    return o + skull(c, x, ty - 7 * s, 0.75 * s);
  }
  function candle(c, x, y, s, wax, gr) {
    wax = wax || '#efe4c0'; var h = 9 * s, w = 3.6 * s;
    return C(x, y - h - 3 * s, (gr || 14) * s, glow(c, '#ffc860', 0.55)) + E(x, y, w * 1.2, 1.4 * s, c.cel(dk(wax, 0.12)), 0.9 * s) +
      P(pd([[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], true), c.cel(wax), 0.9 * s) +
      F(pd([[x - w / 2, y - h], [x - w / 2 + 1.1 * s, y - h], [x - w / 2 + 1.1 * s, y - h + 3.4 * s], [x - w / 2, y - h + 4.6 * s]], true), '#fffaf0', 0.85) +
      L('M' + pt([x, y - h]) + 'l0,' + n(-1.6 * s), OL, 0.8 * s) + flame(c, x, y - h - 0.8 * s, 0.34 * s);
  }
  function candles(c, list) { return list.map(function (k) { return candle(c, k[0], k[1], k[2]); }).join(''); }
  // mine cart on a short run of track, heaped with ore
  function mineCart(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 22 * s, 3 * s, '#000', 0, 0.3);
    o += L('M' + pt(q(-34, 2)) + 'L' + pt(q(34, 2)), OL, 3 * s) + L('M' + pt(q(-34, 2)) + 'L' + pt(q(34, 2)), '#8a8e96', 1.4 * s);
    [[-14, -12], [-4, -15], [6, -13], [13, -11]].forEach(function (p, i) { o += P(shag(x + p[0] * s, y + p[1] * s, 6 * s, 4.6 * s, 4, 0.3, 30 + i), c.cel(i % 2 ? '#7a746c' : '#8a847a'), 1.2 * s); });
    o += C(x - 5 * s, y - 16 * s, 1.3 * s, '#ffd860') + C(x + 8 * s, y - 13 * s, 1.1 * s, '#ffd860');
    o += body(c, pd([q(-20, -10), q(20, -10), q(16, -1), q(-16, -1)], true), '#7a5634', L('M' + pt(q(-19, -6)) + 'L' + pt(q(19, -6)), '#3a3434', 1.8 * s) + F(pd([q(6, -12), q(22, -12), q(22, 0), q(6, 0)], true), '#000', 0.25), 1.6 * s);
    return o + C(x - 10 * s, y - 1 * s, 3.6 * s, c.cel('#4a4a50'), 1.2 * s) + C(x + 10 * s, y - 1 * s, 3.6 * s, c.cel('#4a4a50'), 1.2 * s);
  }
  function orePile(c, x, y, s) {
    var o = E(x, y + 1, 14 * s, 2.6 * s, '#000', 0, 0.25);
    [[-7, 0, 6], [5, 0, 6], [-1, -5, 6], [8, -4, 4]].forEach(function (p, i) { o += P(shag(x + p[0] * s, y - 3 * s + p[1] * s, p[2] * s, p[2] * 0.75 * s, 4, 0.3, 50 + i), c.cel(i % 2 ? '#7a746c' : '#6a655e'), 1.2 * s); });
    return o + C(x - 2 * s, y - 8 * s, 1.1 * s, '#ffd860') + C(x + 6 * s, y - 4 * s, 1 * s, '#9ae0ff');
  }
  // layered sandstone mass: alternate strata bands, strata lines, cracks, a lit face
  function cliff(c, pts, col, seed, lit) {
    var d = pd(pts, true), r = rng(seed || 9), st = '', cr = '', bandS = '';
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    for (var j = 0, yy = y0; yy < y1 && j < 40; j++) { var bh = 8 + r() * 12; if (j % 2) bandS += 'M' + pt([x0 - 2, yy]) + 'L' + pt([x1 + 2, yy + (r() - 0.5) * 4]) + 'L' + pt([x1 + 2, yy + bh]) + 'L' + pt([x0 - 2, yy + bh]) + 'Z'; st += 'M' + pt([x0 - 2, yy]); for (var x = x0; x <= x1 + 14; x += 14) st += 'L' + pt([x, yy + (r() - 0.5) * 3]); yy += bh; }
    for (var i = 0; i < (x1 - x0) / 16; i++) { var cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0); cr += 'M' + pt([cx, cy]) + 'l' + n((r() - 0.5) * 4) + ',' + n(8 + r() * 12) + 'l' + n((r() - 0.5) * 4) + ',' + n(6 + r() * 8); }
    return body(c, d, col, F(bandS, dk(col, 0.12), 0.9) + L(st, dk(col, 0.32), 1, 0.8) + L(cr, dk(col, 0.45), 1.1, 0.8) + (lit ? F(lit, lt(col, 0.2), 0.75) : ''), 2);
  }
  function scrub(c, x, y, s, col) {
    col = col || '#8a7a44'; var r = rng(Math.round(x * 3 + y)), d = '';
    for (var i = 0; i < 8; i++) { var a = -PI * (0.15 + 0.7 * r()), l = (8 + r() * 8) * s; d += 'M' + pt([x, y]) + 'L' + pt([x + Math.cos(a) * l, y + Math.sin(a) * l]) + 'l' + n(Math.cos(a - 0.6) * 3 * s) + ',' + n(Math.sin(a - 0.6) * 3 * s); }
    return E(x, y + 1, 10 * s, 2 * s, '#000', 0, 0.2) + L(d, OL, 2.8 * s) + L(d, col, 1.3 * s);
  }
  // windswept broadleaf tree, canopy pushed downwind (lean > 0 = to the right)
  function windTree(c, x, y, s, col, lean, seed) {
    col = col || '#5e7e3a'; lean = lean == null ? 1 : lean;
    var o = E(x + 6 * s * lean, y + 1, 22 * s, 3.6 * s, '#000', 0, 0.24);
    o += limb('M' + pt([x, y]) + 'C' + pt([x + 2 * s * lean, y - 18 * s]) + ' ' + pt([x + 8 * s * lean, y - 30 * s]) + ' ' + pt([x + 14 * s * lean, y - 42 * s]), '#5a4230', 5 * s) + limb('M' + pt([x + 6 * s * lean, y - 26 * s]) + 'L' + pt([x - 6 * s * lean, y - 38 * s]), '#5a4230', 2.6 * s);
    var cx = x + 16 * s * lean, cy = y - 50 * s, cd = shag(cx, cy, 28 * s, 16 * s, 7, 0.22, seed || 5);
    o += body(c, cd, col, F(shag(cx + 8 * s, cy + 6 * s, 24 * s, 12 * s, 6, 0.2, (seed || 5) + 1), dk(col, 0.25), 0.85) + F(shag(cx - 10 * s, cy - 6 * s, 12 * s, 6 * s, 5, 0.2, (seed || 5) + 2), lt(col, 0.2), 0.8), 1.8 * s);
    return o + P(shag(x - 8 * s * lean, y - 40 * s, 10 * s, 7 * s, 5, 0.2, (seed || 5) + 3), c.cel(col), 1.5 * s);
  }
  function bonePile(c, x, y, s, seed) {
    var r = rng(seed || 3), o = E(x, y + 1, 22 * s, 3.6 * s, '#000', 0, 0.25);
    for (var i = 0; i < 6; i++) o += bone(x + (r() - 0.5) * 30 * s, y - 2 * s - r() * 7 * s, (10 + r() * 8) * s, (r() - 0.5) * 2, 0.85 * s);
    var rib = ''; for (var k = 0; k < 4; k++) rib += 'M' + pt([x + 6 * s + k * 3.4 * s, y - 1 * s]) + 'q' + n(2 * s) + ',' + n(-9 * s) + ' ' + n(8 * s) + ',' + n(-9 * s);
    return o + L(rib, OL, 3.4 * s) + L(rib, BONE, 1.6 * s) + skull(c, x - 6 * s, y - 7 * s, 1 * s) + skull(c, x + 11 * s, y - 3 * s, 0.7 * s);
  }
  // stilt hut: wattle walls on a pole platform, ladder, conical thatch with a skull finial (x = centre, y = ground)
  function stiltHut(c, x, y, s, wall, roof) {
    wall = wall || '#a8844e'; roof = roof || '#8a7a3e';
    var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#6a4a2c', o = E(x, y + 2, 30 * s, 4 * s, '#000', 0, 0.26);
    o += limb('M' + pt(q(-18, 0)) + 'L' + pt(q(-16, -34)) + 'M' + pt(q(18, 0)) + 'L' + pt(q(16, -34)) + 'M' + pt(q(-3, 1)) + 'L' + pt(q(-3, -34)), wood, 3 * s);
    o += limb('M' + pt(q(-17, -4)) + 'L' + pt(q(16, -28)) + 'M' + pt(q(17, -4)) + 'L' + pt(q(-16, -28)), dk(wood, 0.15), 1.6 * s);
    var lad = 'M' + pt(q(22, 2)) + 'L' + pt(q(15, -34)) + 'M' + pt(q(29, 2)) + 'L' + pt(q(22, -34));
    for (var j = 1; j < 6; j++) lad += 'M' + pt(q(22 - j * 1.2, -j * 6)) + 'L' + pt(q(29 - j * 1.2, -j * 6));
    o += L(lad, OL, 3 * s) + L(lad, lt(wood, 0.15), 1.4 * s);
    o += P(pd([q(-25, -34), q(25, -34), q(23, -29), q(-23, -29)], true), c.cel(wood), 1.6 * s);
    var wv = ''; for (var k = 0; k < 5; k++) wv += 'M' + pt(q(-18, -38 - k * 4.6)) + 'Q' + pt(q(0, -35.5 - k * 4.6)) + ' ' + pt(q(18, -38 - k * 4.6));
    o += body(c, pd([q(-19, -34), q(-18, -60), q(18, -60), q(19, -34)], true), wall, L(wv, dk(wall, 0.3), 1 * s) + F(pd([q(6, -62), q(22, -62), q(22, -32), q(8, -32)], true), dk(wall, 0.28), 0.8), 1.6 * s);
    o += P('M' + pt(q(-6, -34)) + 'L' + pt(q(-6, -46)) + 'Q' + pt(q(0, -53)) + ' ' + pt(q(6, -46)) + 'L' + pt(q(6, -34)) + 'Z', '#1e140c', 1.2 * s) + C(x, y - 40 * s, 7 * s, glow(c, '#ffb040', 0.3));
    var th = ''; for (var t = -4; t <= 4; t++) th += 'M' + pt(q(t * 6.5, -58)) + 'L' + pt(q(t * 1.2, -86));
    o += body(c, 'M' + pt(q(-31, -55)) + 'Q' + pt(q(-12, -68)) + ' ' + pt(q(0, -90)) + 'Q' + pt(q(12, -68)) + ' ' + pt(q(31, -55)) + 'Z', roof, L(th, dk(roof, 0.3), 0.9 * s) + F(pd([q(2, -92), q(34, -92), q(34, -52), q(8, -52)], true), dk(roof, 0.25), 0.8), 1.6 * s);
    o += L('M' + pt(q(-30, -55)) + 'l' + n(-1 * s) + ',' + n(5 * s) + 'M' + pt(q(-18, -58)) + 'l0,' + n(5 * s) + 'M' + pt(q(-6, -59)) + 'l0,' + n(5 * s) + 'M' + pt(q(6, -59)) + 'l0,' + n(5 * s) + 'M' + pt(q(18, -58)) + 'l0,' + n(5 * s) + 'M' + pt(q(30, -55)) + 'l' + n(1 * s) + ',' + n(5 * s), dk(roof, 0.2), 1.6 * s);
    return o + skull(c, x, y - 91 * s, 0.8 * s) + feathers(x + 5 * s, y - 88 * s, [WBP, '#e8e4d8'], 0.5 * s, 0.6);
  }
  // Witherbark bone totem: purple-banded pole, hanging bones, stacked skulls under antlers
  function boneTotem(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#5e4228', o = E(x, y + 2, 12 * s, 3 * s, '#000', 0, 0.28);
    o += body(c, pd([q(-4, 0), q(-3.4, -66), q(3.4, -66), q(4, 0)], true), wood, F(pd([q(1, -68), q(6, -68), q(6, 2), q(1.5, 2)], true), dk(wood, 0.3), 0.8) + R(x - 5 * s, y - 14 * s, 10 * s, 4 * s, WBP) + R(x - 5 * s, y - 36 * s, 10 * s, 3 * s, WBP), 1.6 * s);
    o += limb('M' + pt(q(-17, -50)) + 'L' + pt(q(17, -52)), wood, 2.4 * s);
    [-14, 14].forEach(function (u, i) { o += L('M' + pt(q(u, -51 - i)) + 'l0,' + n(9 * s), OL, 0.8 * s) + bone(x + u * s, y - 38 * s - i * s, 8 * s, PI / 2, 0.6 * s) + feathers(x + u * s, y - 50 * s, [WBP, '#e8e4d8', '#221a26'], 0.5 * s, i ? -0.2 : -0.6); });
    o += skull(c, x, y - 26 * s, 0.95 * s);
    var ant = 'M' + pt(q(-3, -70)) + 'Q' + pt(q(-14, -76)) + ' ' + pt(q(-18, -92)) + 'M' + pt(q(-11, -77)) + 'L' + pt(q(-20, -80)) + 'M' + pt(q(-15, -84)) + 'L' + pt(q(-11, -92)) +
      'M' + pt(q(3, -70)) + 'Q' + pt(q(14, -76)) + ' ' + pt(q(18, -92)) + 'M' + pt(q(11, -77)) + 'L' + pt(q(20, -80)) + 'M' + pt(q(15, -84)) + 'L' + pt(q(11, -92));
    return o + L(ant, OL, 4.2 * s) + L(ant, BONE, 2 * s) + skull(c, x, y - 68 * s, 1.25 * s) + F(pd([q(-4, -73), q(4, -73), q(3, -70), q(-3, -70)], true), WBP, 0.9);
  }
  // wooden frame with drying hides and a string of skulls
  function dryRack(c, x, y, s, hide) {
    hide = hide || '#b08a5a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 1, 24 * s, 3 * s, '#000', 0, 0.24);
    o += limb('M' + pt(q(-20, 0)) + 'L' + pt(q(-18, -34)) + 'M' + pt(q(20, 0)) + 'L' + pt(q(18, -34)) + 'M' + pt(q(-22, -30)) + 'L' + pt(q(22, -31)), '#6a4a2c', 2.4 * s);
    o += body(c, pd([q(-14, -29), q(-2, -29), q(-1, -12), q(-8, -9), q(-15, -13)], true), hide, L('M' + pt(q(-12, -24)) + 'l8,0', dk(hide, 0.3), 1), 1.3 * s);
    o += body(c, pd([q(2, -29), q(14, -30), q(15, -14), q(8, -10), q(2, -15)], true), dk(hide, 0.12), '', 1.3 * s);
    return o + skull(c, x - 20 * s, y - 38 * s, 0.6 * s) + skull(c, x + 18 * s, y - 38 * s, 0.6 * s);
  }
  // orc gatehouse: two squat stone towers crowned with spiked timber, a studded double gate, tusks over the arch
  function orcTower(c, x, y, s, col) {
    col = col || ORC; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = stoneFace(c, x - 18 * s, y, 36 * s, 62 * s, col, 9 * s);
    o += P(pd([q(-22, -62), q(22, -62), q(20, -68), q(-20, -68)], true), c.cel('#6a4a2c'), 1.6 * s);
    for (var k = -20; k < 20; k += 6) o += P(pd([q(k, -68), q(k + 3, -82 - (k % 12 ? 0 : 4)), q(k + 6, -68)], true), c.cel(k % 12 ? '#7a5634' : '#6a4a2c'), 1.2 * s);
    o += P(pd([q(-26, -64), q(-36, -58), q(-24, -60)], true), c.cel(BONE), 1 * s) + P(pd([q(26, -64), q(36, -58), q(24, -60)], true), c.cel(BONE), 1 * s);
    return o + arrowSlit(x, y - 44 * s) + C(x, y - 44 * s, 7 * s, glow(c, '#ff9a40', 0.35));
  }
  function orcGate(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#6a4428', o = '';
    o += orcTower(c, x - 44 * s, y, s) + orcTower(c, x + 44 * s, y, s);
    o += stoneFace(c, x - 26 * s, y - 42 * s, 52 * s, 16 * s, ORC, 8 * s) + palisade(c, x - 26 * s, x + 26 * s, y - 56 * s, 14 * s, '#7a5634', 71);
    o += F('M' + pt(q(-24, 0)) + 'L' + pt(q(-24, -36)) + 'Q' + pt(q(0, -48)) + ' ' + pt(q(24, -36)) + 'L' + pt(q(24, 0)) + 'Z', '#1a120c');
    var door = function (u0, u1) {
      var pl = '', st = '';
      for (var u = u0 + 4; u < u1; u += 4) pl += 'M' + pt(q(u, -1)) + 'L' + pt(q(u, -38));
      [-30, -12].forEach(function (v) { for (var u2 = u0 + 3; u2 < u1; u2 += 5) st += C(x + u2 * s, y + v * s, 0.9 * s, '#c8c4bc'); });
      return body(c, pd([q(u0, 0), q(u0, -38 + (u0 < 0 ? 0 : 2)), q(u1, -42 + (u0 < 0 ? 2 : 0)), q(u1, 0)], true), wood, L(pl, dk(wood, 0.35), 1 * s) + R(x + u0 * s, y - 32 * s, (u1 - u0) * s, 4 * s, '#3a3434') + R(x + u0 * s, y - 14 * s, (u1 - u0) * s, 4 * s, '#3a3434') + st, 1.6 * s);
    };
    o += door(-22, -1) + door(1, 22);
    var tk = function (k) { return P('M' + pt(q(26 * k, -2)) + 'C' + pt(q(36 * k, -24)) + ' ' + pt(q(26 * k, -48)) + ' ' + pt(q(6 * k, -56)) + 'C' + pt(q(20 * k, -44)) + ' ' + pt(q(28 * k, -26)) + ' ' + pt(q(20 * k, -4)) + 'Z', c.cel('#ece2c6'), 1.6 * s); };
    return o + tk(-1) + tk(1) + body(c, pd([q(-10, -46), q(10, -46), q(9, -30), q(0, -26), q(-9, -30)], true), HRED, '', 1.3 * s) + hordeMark(x, y - 39 * s, 0.7 * s);
  }
  // ogre hall door cut into a rock face: dark maw, rough jambs, a lintel slab with a horned skull
  function ogreDoor(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '';
    o += F('M' + pt(q(-30, 0)) + 'L' + pt(q(-30, -38)) + 'Q' + pt(q(0, -62)) + ' ' + pt(q(30, -38)) + 'L' + pt(q(30, 0)) + 'Z', '#120c0a') + C(x, y - 12 * s, 26 * s, glow(c, '#ff8a30', 0.4));
    o += stoneSlab(c, x - 34 * s, y, 16 * s, 56 * s, '#8a8478', 81, 1) + stoneSlab(c, x + 34 * s, y, 16 * s, 54 * s, '#86807a', 82, -1);
    o += body(c, pd([q(-48, -52), q(48, -54), q(46, -66), q(-6, -70), q(-46, -64)], true), '#8e887c', F(pd([q(10, -72), q(50, -72), q(50, -50), q(14, -50)], true), '#000', 0.22) + L('M' + pt(q(-30, -60)) + 'l12,1 M' + pt(q(8, -62)) + 'l14,-1', '#5e5a52', 1.1), 2 * s);
    var hn = function (k) { return P('M' + pt(q(6 * k, -76)) + 'C' + pt(q(18 * k, -80)) + ' ' + pt(q(26 * k, -90)) + ' ' + pt(q(24 * k, -102)) + 'C' + pt(q(20 * k, -92)) + ' ' + pt(q(14 * k, -86)) + ' ' + pt(q(5 * k, -82)) + 'Z', c.cel('#e4dac0'), 1.4 * s); };
    return o + hn(-1) + hn(1) + skull(c, x, y - 76 * s, 1.8 * s);
  }
  // big iron cooking pot on a tripod over coals
  function cookPot(c, x, y, s) {
    var o = C(x, y - 8 * s, 30 * s, glow(c, '#ff9a40', 0.4)) + limb('M' + pt([x - 18 * s, y + 2]) + 'L' + pt([x, y - 34 * s]) + 'L' + pt([x + 18 * s, y + 2]), '#5a3e24', 2.4 * s);
    o += flame(c, x - 5 * s, y, 0.6 * s) + flame(c, x + 5 * s, y, 0.55 * s);
    o += L('M' + pt([x, y - 34 * s]) + 'L' + pt([x, y - 22 * s]), OL, 1.2 * s) + body(c, 'M' + pt([x - 13 * s, y - 20 * s]) + 'C' + pt([x - 14 * s, y - 4 * s]) + ' ' + pt([x + 14 * s, y - 4 * s]) + ' ' + pt([x + 13 * s, y - 20 * s]) + 'Z', '#3e3a3a', F(pd([[x + 3 * s, y - 22 * s], [x + 16 * s, y - 22 * s], [x + 16 * s, y], [x + 4 * s, y]], true), '#000', 0.3), 1.8 * s);
    return o + E(x, y - 20 * s, 13 * s, 3 * s, '#7a8a3a', 1.4 * s) + bone(x + 4 * s, y - 23 * s, 9 * s, -1, 0.6 * s) + smoke(x, y - 26 * s, 0.5 * s, '#c8c8c0', 0.5, 0.3);
  }
  function lightning(c, x, y, s) {
    var d = pd([[x, y], [x - 8 * s, y + 26 * s], [x - 1 * s, y + 25 * s], [x - 10 * s, y + 54 * s], [x + 6 * s, y + 20 * s], [x - 1 * s, y + 21 * s], [x + 8 * s, y]], true);
    return C(x - 2 * s, y + 26 * s, 36 * s, glow(c, '#d8e8ff', 0.4)) + P(d, '#f8f8e0', 1.2 * s) + L('M' + pt([x - 4 * s, y + 25 * s]) + 'l' + n(-10 * s) + ',' + n(8 * s) + 'l' + n(-4 * s) + ',' + n(10 * s), '#f0f4ff', 1.2 * s, 0.9);
  }
  function rain(seed, cnt, col) { var r = rng(seed), d = ''; for (var i = 0; i < cnt; i++) { var x = r() * 420, y = r() * 230; d += 'M' + pt([x, y]) + 'l-4,10'; } return L(d, col || '#c8d4e8', 0.8, 0.45); }
  // raptor eggs left in the grass
  function eggClutch(c, x, y, s) { return E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.2) + E(x - 4 * s, y - 4 * s, 4 * s, 5 * s, c.cel('#e8dcb8'), 1.1 * s) + E(x + 4 * s, y - 3.6 * s, 3.6 * s, 4.6 * s, c.cel('#d8cca8'), 1.1 * s) + C(x - 5 * s, y - 5 * s, 0.8 * s, '#8a6a3a') + C(x + 3 * s, y - 2 * s, 0.8 * s, '#8a6a3a'); }

  // patchwork lowland far below a cliff edge: hazy fields, hedges, a river, tiny trees
  function birds(seed, cnt, x0, x1, y0, col) { var r = rng(seed), d = ''; for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * 16, w = 3 + r() * 2; d += 'M' + pt([x - w, y - w * 0.4]) + 'Q' + pt([x - w * 0.4, y - w * 0.6]) + ' ' + pt([x, y]) + 'Q' + pt([x + w * 0.4, y - w * 0.6]) + ' ' + pt([x + w, y - w * 0.4]); } return L(d, col || '#3a3a3a', 1.2); }
  // short posts with a sagging rope along a cliff rim
  function ropeRail(c, pts) {
    var o = '', rp = '';
    pts.forEach(function (p, i) { o += limb('M' + pt(p) + 'L' + pt([p[0], p[1] - 14]), '#7a5a36', 2.4); if (i) { var q = pts[i - 1]; rp += 'M' + pt([q[0], q[1] - 11]) + 'Q' + pt([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 6]) + ' ' + pt([p[0], p[1] - 11]); } });
    return o + L(rp, OL, 2.6) + L(rp, '#c8b080', 1.2);
  }
  function lowland(c, y0, y1, seed) {
    var r = rng(seed || 3), o = R(-4, y0, 408, y1 - y0, c.lg([[0, '#94b08e'], [1, '#6e9068']])), pat = ['#a8b870', '#c0b878', '#7ea06a', '#c8b884'];
    for (var i = 0; i < 26; i++) { var x = r() * 400, y = y0 + 3 + r() * (y1 - y0 - 6), w = 14 + r() * 26, h = 2 + (y - y0) * 0.12; o += F(pd([[x, y], [x + w, y - 1], [x + w + 4, y + h], [x + 3, y + h + 1]], true), pat[i % 4], 0.95) + L('M' + pt([x, y]) + 'L' + pt([x + w, y - 1]) + 'L' + pt([x + w + 4, y + h]), '#4e6a40', 0.9, 0.9); }
    o += L('M-4,' + n(y0 + 12) + ' C60,' + n(y0 + 20) + ' 110,' + n(y0 + 8) + ' 180,' + n(y0 + 18) + ' S300,' + n(y0 + 30) + ' 404,' + n(y0 + 22), '#cfe4ec', 2.2, 0.9);
    for (var j = 0; j < 22; j++) o += C(r() * 400, y0 + 2 + r() * (y1 - y0 - 4), 1.4 + r() * 1.4, '#5e7a4e', 0, 0.8);
    return o + haze(c, y0 + 4, 12, 0.25, '#eef2f0');
  }
  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    refuge_pointe: function (c) {
      var o = ahSky(c) + sun(c, 320, 40, 12, '#fff4d0') + cumulus(90, 60, 1.1, null, null, 11) + cumulus(250, 38, 0.8, null, null, 12);
      o += roll(c, 101, 150, 12, '#9ab4b0', 34) + lowland(c, 148, 222, 103);
      o += birds(105, 3, 30, 120, 168, '#2e3a40');
      o += body(c, 'M150,146 C110,160 50,180 -4,196 L-4,242 L404,242 L404,142 C300,140 200,144 146,146 Z', GRASS, R(-4, 140, 408, 104, c.lg([[0, lt(GRASS, 0.2), 0.5], [1, dk(GRASS, 0.4), 0.9]])), 1.6);
      o += L('M150,146 C110,160 50,180 -4,196', OL, 2.4) + L('M150,147 C110,161 50,181 -4,197', lt(GRASS, 0.35), 1.6, 0.9) + rock(c, 8, 198, 26, 10, '#9a9486') + rock(c, 128, 158, 14, 6, '#8e887c') + ropeRail(c, [[14, 200], [44, 190], [74, 180], [104, 168]]);
      o += grass(107, 176, 238, dk(GRASS, 0.3), 44, 0.6, 1.4, 1.1);
      o += stoneWall(c, 150, 158, 250, 150, 12, '#aaa89c', 109) + palisade(c, 250, 404, 150, 40, '#8a6a44', 111);
      o += keepTower(c, 196, 170, 0.95, '#b8b4a6', '#3a5a8a', ALLY, refugeMark);
      o += tent(c, 250, 182, 0.8, '#e8e4d4', ALLY) + tent(c, 318, 176, 0.72, '#dcd8c4', ALLY);
      o += flag(c, 170, 200, 62, 1, ALLY, '#eef0f4', refugeMark) + flag(c, 378, 188, 58, 0.95, ALLY, '#eef0f4', refugeMark);
      o += campfire(c, 290, 210, 0.66) + crate(c, 350, 206, 0.9) + crate(c, 362, 214, 0.8, '#9a6a3a') + barrel(c, 236, 214, 0.85) + sack(c, 220, 218, 0.75);
      o += fence(c, 150, 214, 224, 16, '#9a7a52', 16) + tuft(c, 392, 238, 1.2, GRASSG) + tuft(c, 166, 238, 1, GRASSG);
      return o + vignette(c, '#fff8e0', '#1a1a0a');
    },
    hammerfall: function (c) {
      var o = ahSky(c, '#6a9ecc', '#c0d4dc', '#f0dcb0') + sun(c, 70, 44, 13, '#fff0c0') + cumulus(300, 56, 1, null, null, 21);
      o += peaks(c, 121, 132, 30, 62, '#8a8e9a', '#eef2f6', 50, 80) + roll(c, 123, 148, 14, '#a4a26a', 30);
      o += field(c, 150, '#b8a858', '#6a6a30', 125);
      o += stoneWall(c, -4, 166, 150, 164, 14, ORC, 127) + palisade(c, -4, 150, 152, 40, '#7a5634', 129, true);
      o += stoneWall(c, 250, 164, 404, 166, 14, ORC, 131) + palisade(c, 250, 404, 150, 40, '#76522f', 133, true);
      o += orcGate(c, 200, 178, 1.05);
      o += flag(c, 120, 196, 60, 1, HRED, '#1a1009', hordeMark, true) + flag(c, 282, 196, 60, 1, HRED, '#1a1009', hordeMark, true);
      o += brazier(c, 142, 208, 0.8) + brazier(c, 258, 208, 0.8);
      o += orcHut(c, 50, 200, 0.8, '#9a5a3a') + orcHut(c, 356, 206, 0.8, '#8a4e32') + barrel(c, 96, 214, 0.8, '#7a4a2a') + crate(c, 306, 218, 0.85) + skullSpike(c, 180, 226, 20, 0.7) + skullSpike(c, 222, 226, 20, 0.7);
      o += tuft(c, 12, 238, 1.2, GRASSG) + tuft(c, 392, 240, 1.1, GRASSG);
      return o + vignette(c, '#fff4d8', '#140e06');
    },
    highland_plains: function (c) {
      var o = ahSky(c) + sun(c, 72, 36, 12, '#fff6d8') + cumulus(170, 50, 1.2, null, null, 31) + cumulus(330, 70, 0.9, null, null, 32) + cumulus(30, 86, 0.6, null, null, 33);
      o += roll(c, 141, 138, 16, '#98b0a8', 40) + ruinTower(c, 306, 130, 12, 26, '#a8aaa6', 142, true) + roll(c, 143, 150, 18, '#aab47a', 36, lt('#aab47a', 0.25));
      o += field(c, 156, GRASS, '#6e6a30', 145);
      o += stoneSlab(c, 74, 176, 20, 58, RUIN, 147, 2) + stoneSlab(c, 100, 172, 16, 44, '#a4a298', 148, -2) + stoneSlab(c, 50, 180, 14, 36, '#a0a094', 149, -3);
      o += G(stoneSlab(c, 132, 192, 14, 40, '#9e9c92', 146, 0), 'rotate(-78 132 192) translate(0,8)') + stoneSlab(c, 352, 206, 24, 66, '#a2a096', 144, -2);
      o += nest(c, 300, 196, 1.1, 3) + nest(c, 364, 184, 0.8, 2) + eggClutch(c, 250, 206, 1);
      o += windTree(c, 190, 168, 1.1, '#6a8a3a', 1, 151);
      o += wildflowers(153, 170, 236, 60) + bone(220, 222, 14, 0.3, 0.9) + skull(c, 236, 226, 0.8);
      o += tuft(c, 16, 236, 1.3, GRASSG) + tuft(c, 150, 232, 1, GRASSG) + tuft(c, 390, 236, 1.2, GRASSG) + tuft(c, 330, 222, 0.8, '#a8a04a');
      return o + vignette(c, '#fff8e0', '#1a1a0a');
    },
    drywhisker_gorge: function (c) {
      var o = sky(c, '#7aa8cc', '#d4d8c4', '#f0d8a8') + cumulus(200, 44, 0.8, '#fbf4e8', '#d8c8b8', 41);
      o += cliff(c, [[150, 150], [168, 96], [200, 86], [236, 92], [262, 118], [270, 150]], '#c89a6a', 161);
      o += cliff(c, [[-4, 242], [-4, 30], [40, 22], [80, 40], [110, 70], [132, 110], [150, 150], [166, 200], [150, 242]], DRY, 163, pd([[-4, 30], [40, 22], [80, 40], [110, 70], [132, 110], [118, 108], [92, 72], [56, 50], [-4, 52]], true));
      o += cliff(c, [[404, 242], [404, 40], [360, 36], [320, 60], [292, 96], [276, 130], [262, 150], [256, 200], [270, 242]], dk(DRY, 0.08), 165, pd([[404, 40], [360, 36], [320, 60], [292, 96], [300, 100], [330, 70], [366, 52], [404, 56]], true));
      o += body(c, 'M150,150 C190,146 230,146 262,150 C262,190 280,220 300,242 L110,242 C130,216 150,190 150,150 Z', '#c8a474', F('M196,150 C200,180 206,210 214,242 L180,242 C184,210 190,180 196,150 Z', '#d8b888', 0.8) + L('M170,242 L198,150 M246,242 L204,150', OL, 2.4, 0.7) + L('M170,242 L198,150 M246,242 L204,150', '#8a8e96', 1.1), 1.6);
      var sl = ''; for (var i = 0; i < 9; i++) { var t = i / 8, yy = 152 + 88 * t * t; sl += 'M' + pt([198 - 28 * t * t - 1, yy]) + 'L' + pt([204 + 42 * t * t + 1, yy]); }
      o += L(sl, '#6a4a2c', 1.6, 0.8);
      o += mineMouth(c, 96, 196, 1.2) + mineMouth(c, 318, 176, 0.8);
      o += candles(c, [[58, 206, 1], [70, 212, 0.8], [140, 210, 0.9], [130, 186, 0.7], [290, 188, 0.8], [350, 190, 0.8], [362, 200, 1]]);
      o += mineCart(c, 214, 214, 0.9) + orePile(c, 272, 222, 1) + orePile(c, 40, 230, 0.9);
      o += scrub(c, 16, 214, 1) + scrub(c, 388, 222, 1.1) + scrub(c, 150, 230, 0.8) + rock(c, 380, 238, 30, 16, '#a8744a') + rock(c, 30, 240, 26, 12, '#a07048');
      o += pebbles(167, 160, 238, '#9a7a50', 18, 120, 290);
      return o + vignette(c, '#fff0d8', '#1a0e06');
    },
    witherbark_village: function (c) {
      var o = sky(c, '#7a9ab0', '#b8c8b4', '#e0d8a8') + cumulus(300, 40, 0.9, '#f0f0e8', '#b8c0c4', 51);
      o += roll(c, 181, 128, 12, '#8aa08a', 40) + farTrees(183, 140, '#4e6e4a', 20, 26, 44) + haze(c, 138, 20, 0.3, '#e8ecd8');
      o += farTrees(185, 154, '#3a5a36', 16, 34, 58);
      o += field(c, 156, '#8a9a4a', '#3e4a24', 187);
      o += stiltHut(c, 90, 184, 1, '#a8844e', '#8a7a3e') + stiltHut(c, 238, 170, 0.8, '#9a7a48', '#7e7038') + stiltHut(c, 352, 180, 0.9, '#a07e4a', '#86763a');
      o += boneTotem(c, 170, 204, 0.95) + boneTotem(c, 300, 212, 0.85) + dryRack(c, 40, 216, 0.9);
      o += campfire(c, 214, 214, 0.7) + skullSpike(c, 140, 222, 24, 0.8) + skullSpike(c, 386, 224, 22, 0.8) + bonePile(c, 262, 226, 0.6, 189);
      o += windTree(c, -6, 204, 1.3, '#4e7a3a', 1, 191) + windTree(c, 404, 200, 1.2, '#4a7438', -1, 193);
      o += tuft(c, 120, 238, 1.1, '#6a8a3a') + tuft(c, 340, 240, 1.1, '#6a8a3a') + grass(195, 176, 238, '#34401e', 30, 0.6, 1.4, 1.1);
      return o + mist(c, 150, 30, '#e8ecd8', 0.18, 197) + vignette(c, '#f8f4d8', '#0c1008');
    },
    stromgarde_keep: function (c) {
      var o = ahSky(c, '#6a94c0', '#b4c8d4', '#e8dcc0') + cumulus(90, 50, 1, null, null, 61) + cumulus(320, 34, 0.7, null, null, 62);
      o += roll(c, 201, 150, 12, '#a0aa84', 40);
      o += ruinTower(c, 250, 150, 44, 118, '#b0aca0', 203, true) + ruinWall(c, 150, 150, 80, 66, '#aaa69a', 205, 0.5) + ruinTower(c, 136, 150, 30, 90, '#a8a498', 207, false) + ruinWall(c, 272, 150, 110, 52, '#a6a296', 209, 0.3);
      o += field(c, 152, '#aaa060', '#5e5a2e', 211);
      o += ruinWall(c, -4, 196, 100, 70, '#aeaa9e', 213, 0.6) + ruinTower(c, 360, 200, 40, 96, '#b2aea2', 215, true);
      o += tent(c, 176, 196, 0.8, '#4a3a3a', SYNR) + campfire(c, 262, 212, 0.66);
      o += flag(c, 112, 206, 60, 1, SYN, SYNR, synMark, true) + flag(c, 318, 208, 58, 0.95, SYN, SYNR, synMark, true);
      o += crate(c, 290, 222, 0.9, '#7a5a34') + crate(c, 302, 230, 0.75) + barrel(c, 148, 222, 0.8) + sack(c, 132, 226, 0.7, '#8a7a5a');
      o += rubble(c, 220, 232, 1, '#aaa69a', 217) + rubble(c, 50, 232, 0.9, '#a6a296', 218) + tuft(c, 392, 240, 1.1, GRASSG) + tuft(c, 10, 240, 1.1, GRASSG);
      return o + vignette(c, '#fff4e0', '#141008');
    },
    boulderfist_hall: function (c) {
      var o = ahSky(c, '#6e98c0', '#c4d0cc', '#ecd8a8') + cumulus(320, 46, 0.9, null, null, 71);
      o += roll(c, 221, 146, 14, '#9aa07a', 40);
      o += body(c, 'M-4,176 C20,120 70,70 150,60 C220,52 300,74 350,110 C380,130 396,150 404,160 L404,190 L-4,190 Z', '#9a9a62', F('M-4,176 C20,120 70,70 150,60 C220,52 300,74 350,110 C380,130 396,150 404,160 L404,168 C380,152 350,124 300,94 C250,72 190,70 140,74 C80,82 30,126 6,180 Z', lt('#9a9a62', 0.22), 0.7), 1.8);
      o += cliff(c, [[110, 180], [120, 120], [160, 96], [240, 94], [290, 118], [300, 180]], '#8e887a', 223);
      o += field(c, 176, '#aa9c54', '#5a5028', 225);
      o += ogreDoor(c, 204, 184, 1.05);
      o += torch(c, 150, 170, 1) + torch(c, 258, 170, 1);
      o += hideBanner(c, 108, 204, 62, 1, '#a88a60', handMark, 227) + hideBanner(c, 300, 206, 60, 1, '#9a7a52', handMark, 229);
      o += stakes(c, 10, 90, 212, 26, 231) + stakes(c, 330, 404, 214, 24, 233);
      o += bonePile(c, 60, 226, 1.1, 235) + bonePile(c, 352, 230, 1, 237) + cookPot(c, 250, 224, 0.8) + skull(c, 170, 230, 1) + bone(186, 234, 16, 0.2, 1);
      o += tuft(c, 20, 240, 1.1, GRASSG) + tuft(c, 396, 240, 1.1, GRASSG);
      return o + vignette(c, '#fff0d8', '#140e06');
    },
    circle_of_west_binding: function (c) {
      var o = sky(c, '#2a3040', '#4e5670', '#8a8a98');
      o += cumulus(80, 40, 1.4, '#5a6078', '#3a3e50', 81) + cumulus(300, 30, 1.6, '#565c74', '#363a4c', 82) + cumulus(200, 70, 1, '#6a7088', '#44485c', 83);
      o += lightning(c, 320, 60, 1.1) + rain(84, 70);
      o += roll(c, 241, 160, 14, '#5a6a5a', 40);
      o += body(c, 'M-4,196 C60,180 110,130 200,124 C290,124 340,170 404,190 L404,242 L-4,242 Z', '#7a8a4a', F('M-4,196 C60,180 110,130 200,124 C290,124 340,170 404,190 L404,198 C340,180 290,134 200,132 C120,136 70,184 -4,204 Z', lt('#7a8a4a', 0.2), 0.7) + R(-4, 140, 408, 104, c.lg([[0, '#000', 0], [1, '#000', 0.45]])), 1.8);
      o += grass(243, 140, 238, '#3e4a26', 50, 0.6, 1.4, 1.1);
      o += E(200, 146, 84, 14, glow(c, '#7ae8ff', 0.55)) + '<ellipse cx="200" cy="146" rx="70" ry="10" fill="none" stroke="#9af0ff" stroke-width="1.6" opacity="0.8"/>';
      o += runes(c, 170, 148, 1, 0.7, '#9af0ff', 245) + runes(c, 230, 148, 1, 0.7, '#9af0ff', 246) + runes(c, 200, 154, 1, 0.8, '#9af0ff', 247);
      var st = [[150, 134, 12, 26], [180, 128, 10, 22], [222, 128, 10, 22], [252, 134, 12, 26]];
      st.forEach(function (k, i) { o += stoneSlab(c, k[0], k[1], k[2], k[3], '#8a8c8a', 250 + i, 0) + runes(c, k[0], k[1] - k[3] * 0.4, 1, 0.45, '#9af0ff', 260 + i); });
      o += C(200, 118, 16, glow(c, '#ffb050', 0.75)) + shadowSwirl(c, [200, 120], 0.9, '#ff9a40') + C(200, 116, 26, glow(c, '#7ae8ff', 0.3));
      o += stoneSlab(c, 112, 160, 20, 50, '#8e908c', 270, 1) + stoneSlab(c, 150, 166, 16, 42, '#8a8c88', 271) + stoneSlab(c, 256, 166, 16, 42, '#8a8c88', 272) + stoneSlab(c, 292, 160, 20, 50, '#8e908c', 273, -1);
      o += body(c, pd([[98, 116], [128, 110], [128, 118], [98, 124]], true), '#8e908c', '', 1.6) + body(c, pd([[278, 110], [308, 116], [308, 124], [278, 118]], true), '#8e908c', '', 1.6);
      o += runes(c, 112, 150, 3, 0.8, '#9af0ff', 280) + runes(c, 292, 150, 3, 0.8, '#9af0ff', 281) + runes(c, 150, 158, 2, 0.7, '#9af0ff', 282) + runes(c, 256, 158, 2, 0.7, '#9af0ff', 283);
      o += stoneSlab(c, 40, 224, 30, 70, '#7e807c', 290, 2) + runes(c, 38, 208, 3, 1, '#9af0ff', 291) + stoneSlab(c, 370, 228, 28, 64, '#7a7c78', 292, -2) + runes(c, 370, 212, 3, 1, '#9af0ff', 293);
      o += tuft(c, 190, 238, 1, '#5a6a34') + tuft(c, 320, 234, 1.1, '#5a6a34');
      return o + vignette(c, '#c8d8ff', '#04060a');
    }
  };
  function haze(c, y, h, op, col) { return mist(c, y, h, col || '#e0e8e0', op || 0.3, Math.round(y * 3)); }

  // ============================================================
  //  ARATHI MOB PIECES
  // ============================================================
  // ---- kobold (facing left): hunched, pear body, long snout, round ear, rat tail ----
  // o: fur, muzzle, tail, cloth, earIn, whisk (whisker colour), chest/back/hat/face hooks, near (arm points), item(c, hand), farItem, scale
  function kob(c, o) {
    var f = o.fur, fd = dk(f, 0.26), mz = o.muzzle || lt(f, 0.4), s = shadow(c, 62, 30), mk = function (h, a) { return h ? h(c, a) : ''; };
    var tl = 'M78,100 C98,112 112,100 106,84 C104,78 108,74 112,74';
    s += L(tl, OL, 7) + L(tl, o.tail || '#c9a07a', 3.2);
    s += limb(pd([[70, 96], [77, 109], [72, 118]]), fd, 9) + P('M62,116 L75,116 L77,122.5 L60,122.5 Z', c.cel(dk(fd, 0.1)), 2.2);
    var far = o.far || [[71, 74], [79, 86], [75, 95]], fh = far[far.length - 1];
    s += mk(o.farItem, fh) + limb(pd(far), fd, 7) + C(fh[0], fh[1], 4, c.cel(fd), 2);
    s += mk(o.back);
    var bd = 'M50,72 C56,62 74,62 80,74 C86,88 82,102 70,105 C58,108 48,102 46,92 C44,84 45,77 50,72 Z';
    s += body(c, bd, f, F('M44,84 C50,100 64,104 74,100 C66,96 54,92 48,78 Z', mz, 0.75) + F('M70,60 L92,60 L92,110 L74,110 C82,94 80,76 70,60 Z', dk(f, 0.22), 0.7), 2.4);
    s += mk(o.chest);
    s += P('M49,93 L79,95 L77,105 L71,103 L67,110 L61,104 L53,106 Z', c.cel(o.cloth || '#8e7b52'), 2) + L('M49,95 L79,97', OL, 2.2);
    s += limb(pd([[58, 99], [55, 110], [52, 118]]), f, 9) + P('M42,117 L57,117 L59,122.5 L40,122.5 Z', c.cel(f), 2.2) + L('M40,122.5 l-2.5,-0.4 M44,122.5 l-2,0.3', '#efe6cf', 1.3);
    s += P('M52,44 C47,27 64,21 70,32 C75,42 66,50 58,50 Z', c.cel(f), 2.2) + F('M55,43 C53,32 63,28 66,34 C68,41 63,46 58,46 Z', o.earIn || '#c07a70', 0.85);
    var hd = 'M62,48 C60,38 48,34 40,38 C32,42 24,48 16,54 C11,57 11,62 15,63 L28,64 C36,70 52,70 60,64 C66,60 66,52 62,48 Z';
    s += body(c, hd, f, F('M15,63 L28,64 C36,69 48,69 56,65 C44,64 30,62 16,57 Z', mz, 0.9) + F('M50,33 L70,33 L70,70 L54,70 C60,60 58,46 50,33 Z', dk(f, 0.2), 0.7) + mk(o.face), 2.2);
    s += C(13.5, 58.5, 2.9, '#2a1a18', 1.4) + C(12.6, 57.6, 0.8, '#8a6a6a');
    s += P('M21,62.5 L21,68 L25.5,68 L25.5,63.2 Z', '#f6eed6', 1.3);
    if (!o.noEye) s += C(36, 49.5, 2.9, o.eye || '#120c08', 0) + C(35.2, 48.6, 0.95, '#fff', 0) + L('M31,45.5 L41,47.5', OL, 2);
    var wk = 'M19,59 L4,54 M19,61.5 L2,62 M20,63.5 L6,69';
    s += L(wk, OL, 2.2, 0.8) + L(wk, o.whisk || '#f4f0e6', 1);
    s += mk(o.hat);
    var near = o.near || [[57, 73], [49, 84], [41, 86]], hp = near[near.length - 1];
    s += mk(o.item, hp) + limb(pd(near), f, 7) + C(hp[0], hp[1], 4.2, c.cel(f), 2) + (o.itemFront ? o.itemFront(c, hp) : '');
    return G(s, (o.tx ? 'translate(' + o.tx + ',0) ' : '') + at(o.scale || 1, 62, 123));
  }
  function kCandle(c, x, y, s, lean) { return G(candle(c, x, y, s * 1.4, '#f3e8c4', 12), lean ? 'rotate(' + lean + ' ' + x + ' ' + y + ')' : ''); }
  function pick(c, p, len, ang, col) {
    var q = dirQ(p, ang); col = col || '#a8acb4';
    var hd = 'M' + pt(q(len - 1, -2)) + 'Q' + pt(q(len + 1, -10)) + ' ' + pt(q(len - 5, -18)) + 'Q' + pt(q(len + 5, -9)) + ' ' + pt(q(len + 4, 0)) + 'Q' + pt(q(len + 5, 8)) + ' ' + pt(q(len - 3, 16)) + 'Q' + pt(q(len + 1, 9)) + ' ' + pt(q(len - 1, 2)) + 'Z';
    return haft(c, p, len + 2, ang, '#7a5634', 3.2, 8) + P(hd, c.cel(col), 1.6) + L('M' + pt(q(len + 2, -4)) + 'Q' + pt(q(len + 1, -10)) + ' ' + pt(q(len - 3, -15)), '#ffffff', 0.9, 0.6);
  }
  function shovel(c, p, len, ang) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, '#8a6440', 3, 14);
    o += L('M' + pt(q(-14, -4)) + 'L' + pt(q(-14, 4)) + 'M' + pt(q(-14, -4)) + 'L' + pt(q(-10, 0)) + 'M' + pt(q(-14, 4)) + 'L' + pt(q(-10, 0)), OL, 3) + L('M' + pt(q(-14, -4)) + 'L' + pt(q(-14, 4)), '#8a6440', 1.6);
    var bl = pd([q(len - 2, -3), q(len, -7), q(len + 12, -7), q(len + 18, 0), q(len + 12, 7), q(len, 7), q(len - 2, 3)], true);
    return o + P(bl, c.cel('#8e949c'), 1.6) + F(pd([q(len + 8, -6), q(len + 16, -2), q(len + 16, 2), q(len + 8, 6)], true), '#7a5a3a', 0.8) + L('M' + pt(q(len + 1, -5)) + 'L' + pt(q(len + 11, -5)), '#ffffff', 0.9, 0.6);
  }
  // ---- ogre head (facing left): bald dome, topknot, bulb nose, jagged underbite with tusks ----
  function ogHead(c, x, y, o) {
    var sk = o.skin, hc = o.hair || '#1e1a1c', s = '';
    if (o.knot !== false) s += limb('M' + pt([x + 6, y - 20]) + 'Q' + pt([x + 18, y - 26]) + ' ' + pt([x + 22, y - 12]), hc, 4) + C(x + 5, y - 20, 5, c.cel(hc), 1.6) + R(x + 3, y - 18, 5, 3, c.cel(BONE), 1);
    s += E(x + 13, y + 1, 3.8, 5.4, c.cel(sk), 1.8) + E(x + 13, y + 1, 1.5, 2.6, dk(sk, 0.35)) + L(ellD(x + 13, y + 8, 1.8, 2.4), OL, 2.4) + L(ellD(x + 13, y + 8, 1.8, 2.4), GOLD, 1.2);
    var d = 'M' + pt([x - 12, y - 8]) + 'C' + pt([x - 12, y - 21]) + ' ' + pt([x + 12, y - 22]) + ' ' + pt([x + 14, y - 8]) + 'L' + pt([x + 15, y + 8]) + 'C' + pt([x + 14, y + 18]) + ' ' + pt([x + 2, y + 23]) + ' ' + pt([x - 10, y + 22]) + 'C' + pt([x - 17, y + 21]) + ' ' + pt([x - 21, y + 15]) + ' ' + pt([x - 20, y + 9]) + 'L' + pt([x - 14, y + 3]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 4, y - 24], [x + 18, y - 24], [x + 18, y + 24], [x + 2, y + 24]], true), dk(sk, 0.24), 0.8) + E(x - 3, y - 15, 5, 2.2, lt(sk, 0.25), 0, 0.6) +
      (o.paint ? F(pd([[x - 14, y - 6], [x + 6, y - 7], [x + 7, y - 3], [x - 14, y - 1]], true), o.paint, 0.85) : '') + (o.scar ? L('M' + pt([x - 2, y - 18]) + 'L' + pt([x + 4, y - 2]), lt(sk, 0.45), 1.5) + L('M' + pt([x - 1, y - 13]) + 'l3,-1 M' + pt([x + 1, y - 8]) + 'l3,-1', lt(sk, 0.45), 1) : ''), 2.2);
    s += P('M' + pt([x - 17, y - 5]) + 'C' + pt([x - 12, y - 11]) + ' ' + pt([x - 2, y - 11]) + ' ' + pt([x + 4, y - 7]) + 'L' + pt([x + 3, y - 3]) + 'C' + pt([x - 3, y - 6]) + ' ' + pt([x - 11, y - 5]) + ' ' + pt([x - 17, y - 1]) + 'Z', c.cel(dk(sk, 0.16)), 1.6);
    s += (o.glow ? glowEye(c, x - 8, y - 1.4, 1.7, o.eye) + glowEye(c, x - 1, y - 1.8, 1.5, o.eye) : C(x - 8, y - 1.4, 1.9, o.eye || '#ffd030', 1) + C(x - 1, y - 1.8, 1.6, o.eye || '#ffd030', 1));
    s += P('M' + pt([x - 12, y - 1]) + 'C' + pt([x - 20, y]) + ' ' + pt([x - 23, y + 7]) + ' ' + pt([x - 17, y + 8]) + 'C' + pt([x - 14, y + 8.4]) + ' ' + pt([x - 11, y + 6]) + ' ' + pt([x - 11, y + 3]) + 'Z', c.cel(dk(sk, 0.06)), 1.5) + C(x - 17, y + 6, 1, OL);
    s += P('M' + pt([x - 20, y + 11]) + 'Q' + pt([x - 8, y + 16]) + ' ' + pt([x + 5, y + 12]) + 'L' + pt([x + 3, y + 16]) + 'Q' + pt([x - 8, y + 19]) + ' ' + pt([x - 19, y + 15]) + 'Z', '#3a1a14', 1.4);
    s += P(pd([[x - 15, y + 13], [x - 13, y + 16.5], [x - 11, y + 14], [x - 8, y + 17], [x - 6, y + 14.5], [x - 3, y + 17], [x - 1, y + 14]], true), '#f4ecd6', 0.8);
    s += P(pd([[x - 18, y + 14], [x - 20, y + 4], [x - 14, y + 13]], true), c.cel('#f4ecd6'), 1.2) + P(pd([[x - 3, y + 14], [x - 3, y + 5], [x + 1, y + 13]], true), c.cel('#f4ecd6'), 1.2);
    return s;
  }
  function bigFist(c, p, skin, r) { r = r || 8; return C(p[0], p[1], r, c.cel(skin), 2.2) + L('M' + pt([p[0] - r * 0.7, p[1] - r * 0.3]) + 'l' + n(r * 0.5) + ',' + n(r * 0.1) + ' M' + pt([p[0] - r * 0.75, p[1] + r * 0.2]) + 'l' + n(r * 0.5) + ',' + n(r * 0.1), dk(skin, 0.4), 1.2); }
  // ---- ogre (facing left): huge barrel torso, short legs, big fists ----
  function ogre(c, o) {
    var sk = o.skin;
    return biped(c, {
      skin: sk, shirt: sk, pants: o.pants || '#5a4a3a', sleeve: sk, glove: sk, boots: o.boots || '#3a2e24', legW: 15, armW: 14, hipY: 96, shadowR: o.shadowR || 46, neck: false, belt: o.belt || '#4a3424', buckle: o.buckle || '#8a8e96',
      torsoD: 'M28,54 C30,34 94,30 102,52 L104,82 L96,98 L34,98 L26,82 Z',
      chest: function (c) { return F('M30,72 C40,92 90,94 102,74 L106,100 L24,100 Z', lt(sk, 0.12), 0.45) + L('M58,70 Q66,74 74,70', dk(sk, 0.3), 1.3) + (o.chest ? o.chest(c) : ''); },
      front: o.front, pads: o.pads, back: o.back, shins: o.shins,
      head: o.head || function (c, x, y) { return ogHead(c, x, y, o); }, hx: o.hx || 46, hy: o.hy || 28,
      near: o.near, far: o.far || [[94, 58], [106, 74], [104, 90]], wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      nearHand: function (c, p) { return bigFist(c, p, sk, 8.5); }, farHand: function (c, p) { return bigFist(c, p, dk(sk, 0.08), 8); },
      top: o.top, tf: o.tf
    });
  }
  // knobbly tree-trunk club with nails driven through
  function logClub(c, p, len, ang, col) {
    col = col || '#7a5634'; var q = dirQ(p, ang);
    var T = taper([q(-8, 0), q(len * 0.35, 0), q(len * 0.75, 1), q(len, 0)], 7, 24, 5), e = q(len, 0), nl = '';
    [[0.55, -1], [0.7, 1], [0.85, -1], [0.95, 1], [0.8, 0]].forEach(function (k) { var b = q(len * k[0], k[1] * 9), t = q(len * k[0] + 3, k[1] * 17 + (k[1] ? 0 : 0)); if (!k[1]) t = q(len + 8, 0); nl += 'M' + pt(b) + 'L' + pt(t); });
    return L(nl, OL, 3.8) + L(nl, '#c8ccd2', 1.8) + body(c, T.d, col, L(along(T, 0.3) + along(T, 0.66), dk(col, 0.3), 1.1) + F(ribbonBand(T, 0.62, 1), dk(col, 0.28), 0.8) + E(q(len * 0.6, 3)[0], q(len * 0.6, 3)[1], 3, 2, dk(col, 0.4)), 2.2) +
      E(e[0], e[1], 5, 11.5, c.cel(lt(col, 0.2)), 1.8) + L(ellD(e[0], e[1], 2.4, 6), dk(col, 0.2), 0.9);
  }
  function maul(c, p, len, ang) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, '#4a3222', 4.4, 12), sp = '';
    var hd = pd([q(len - 11, -13), q(len + 11, -13), q(len + 11, 13), q(len - 11, 13)], true);
    [[-13, -1, -6], [-13, -1, 6], [13, 1, -6], [13, 1, 6], [0, 0, 0]].forEach(function (k) {
      if (k[1]) sp += pd([q(len + k[2] - 3.4, k[0]), q(len + k[2], k[0] + k[1] * 9), q(len + k[2] + 3.4, k[0])], true);
      else sp += pd([q(len + 11, -4), q(len + 20, 0), q(len + 11, 4)], true);
    });
    return o + P(sp, c.cel('#c8ccd2'), 1.3) + body(c, hd, '#6a6e78', L('M' + pt(q(len - 5, -13)) + 'L' + pt(q(len - 5, 13)) + 'M' + pt(q(len + 5, -13)) + 'L' + pt(q(len + 5, 13)), '#3e4048', 2) + F(pd([q(len - 12, 3), q(len + 12, 3), q(len + 12, 14), q(len - 12, 14)], true), '#000', 0.25), 2) +
      C(q(len - 8, -9)[0], q(len - 8, -9)[1], 1.2, '#e0e4ea') + C(q(len + 8, -9)[0], q(len + 8, -9)[1], 1.2, '#e0e4ea');
  }
  function orbStaff(c, bot, top, col) {
    var d = 'M' + pt(bot) + 'L' + pt(top), x = top[0], y = top[1];
    return limb(d, '#5a3e24', 3.6) + L(d, '#8a6a44', 1, 0.6) + L('M' + pt([x - 6, y + 6]) + 'Q' + pt([x - 12, y - 4]) + ' ' + pt([x - 6, y - 14]) + 'M' + pt([x + 6, y + 6]) + 'Q' + pt([x + 12, y - 4]) + ' ' + pt([x + 6, y - 14]), OL, 4.2) +
      L('M' + pt([x - 6, y + 6]) + 'Q' + pt([x - 12, y - 4]) + ' ' + pt([x - 6, y - 14]) + 'M' + pt([x + 6, y + 6]) + 'Q' + pt([x + 12, y - 4]) + ' ' + pt([x + 6, y - 14]), BONE, 2) + orb(c, x, y - 4, 5, col);
  }
  // shrunken head hung by its hair
  function shrunk(c, x, y, s, col) {
    col = col || '#8a6a44';
    return L('M' + pt([x, y - 6 * s]) + 'l0,' + n(-5 * s), OL, 1 * s) + L('M' + pt([x - 2 * s, y - 5 * s]) + 'l' + n(-1 * s) + ',' + n(-4 * s) + 'M' + pt([x + 2 * s, y - 5 * s]) + 'l' + n(1 * s) + ',' + n(-4 * s), '#221a16', 1.6 * s) +
      P('M' + pt([x - 4 * s, y - 4 * s]) + 'C' + pt([x - 5 * s, y - 8 * s]) + ' ' + pt([x + 5 * s, y - 8 * s]) + ' ' + pt([x + 4 * s, y - 4 * s]) + 'L' + pt([x + 3.4 * s, y + 3 * s]) + 'C' + pt([x + 2 * s, y + 6 * s]) + ' ' + pt([x - 2 * s, y + 6 * s]) + ' ' + pt([x - 3.4 * s, y + 3 * s]) + 'Z', c.cel(col), 1.2 * s) +
      L('M' + pt([x - 3 * s, y - 2 * s]) + 'l' + n(2 * s) + ',' + n(1 * s) + 'M' + pt([x + 3 * s, y - 2 * s]) + 'l' + n(-2 * s) + ',' + n(1 * s) + 'M' + pt([x - 2 * s, y + 3 * s]) + 'L' + pt([x + 2 * s, y + 3 * s]) + 'M' + pt([x - 1 * s, y + 2 * s]) + 'l0,2 M' + pt([x + 1 * s, y + 2 * s]) + 'l0,2', OL, 0.8 * s);
  }
  // curved glaive-knife
  function glaive(c, p, len, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-7, 0)) + 'L' + pt(q(5, 0)), '#3a2a1e', 3.4) + L('M' + pt(q(-4, -2)) + 'l0,4 M' + pt(q(0, -2)) + 'l0,4', '#a88a50', 1.2) + L('M' + pt(q(5, -5)) + 'L' + pt(q(5, 5)), OL, 4) + L('M' + pt(q(5, -5)) + 'L' + pt(q(5, 5)), BONE, 2);
    var bl = 'M' + pt(q(6, -2.4)) + 'Q' + pt(q(len * 0.55, -9)) + ' ' + pt(q(len, -12)) + 'Q' + pt(q(len * 0.7, -1)) + ' ' + pt(q(len * 0.42, 3.6)) + 'L' + pt(q(6, 2.6)) + 'Z';
    return o + P(bl, c.cel('#c8ccd2'), 1.6) + L('M' + pt(q(9, -2.4)) + 'Q' + pt(q(len * 0.55, -7.4)) + ' ' + pt(q(len * 0.95, -11.2)), '#ffffff', 0.9, 0.7) + L('M' + pt(q(len * 0.3, 0)) + 'l4,-1', '#8a2a1a', 1.2, 0.6);
  }
  function crossbow(c, p, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-18, 1)) + 'L' + pt(q(22, 0)), '#6a4428', 4) + L('M' + pt(q(-16, 0)) + 'L' + pt(q(20, -0.6)), '#9a7048', 1, 0.7);
    o += P(pd([q(-18, 2), q(-24, 5), q(-24, -3), q(-16, -1.6)], true), c.cel('#5a3a22'), 1.2) + L('M' + pt(q(2, 2)) + 'l2,5', OL, 2);
    var bw = 'M' + pt(q(16, -16)) + 'Q' + pt(q(26, 0)) + ' ' + pt(q(16, 16));
    o += L('M' + pt(q(16, -16)) + 'L' + pt(q(4, 0)) + 'L' + pt(q(16, 16)), '#e8e4d8', 0.9) + L(bw, OL, 5) + L(bw, '#4a4e56', 2.8) + L(bw, '#8a8e96', 0.9, 0.8);
    return o + L('M' + pt(q(4, -1.6)) + 'L' + pt(q(32, -1.6)), OL, 2.8) + L('M' + pt(q(4, -1.6)) + 'L' + pt(q(32, -1.6)), '#8a6a44', 1.2) + P(pd([q(31, -4), q(37, -1.6), q(31, 0.8)], true), c.cel('#c8ccd2'), 0.9) + P(pd([q(6, -1.6), q(3, -4.6), q(9, -1.6)], true), SYNR, 0.7);
  }
  function fireball(c, x, y, r) { return C(x, y, r * 3.2, glow(c, '#ff8a2a', 0.7)) + flame(c, x + r * 0.2, y + r * 0.9, r * 0.13, '#ff5a1a', '#ffd84a') + C(x, y, r * 0.5, '#fff6c0') + C(x + r * 1.4, y - r * 1.2, r * 0.18, '#ffb040') + C(x - r * 1.2, y - r * 1.6, r * 0.14, '#ffb040'); }
  // tongued flame silhouette from y0 (base) up to y1, half-width wf(t)
  function blaze(cx, y0, y1, wf, k, seed, lean) {
    var r = rng(seed || 5), Lp = [], Rp = [], d, i;
    lean = lean || 0;
    for (i = 0; i <= k; i++) { var t = i / k, y = y0 + (y1 - y0) * t, w = wf(t), x = cx + lean * t * t; Lp.push([x - w, y]); Rp.push([x + w, y]); }
    var seg = (y0 - y1) / k;
    d = 'M' + pt(Lp[0]);
    for (i = 1; i <= k; i++) { var a = Lp[i - 1], b = Lp[i], out = wf(i / k) * (0.35 + r() * 0.35); d += 'Q' + pt([a[0] - out * 0.5, (a[1] + b[1]) / 2]) + ' ' + pt([b[0] - out, b[1] - seg * 0.7]) + 'Q' + pt([b[0] - out * 0.2, b[1] - seg * 0.1]) + ' ' + pt([b[0], b[1]]); }
    var tip = [cx + lean + (r() - 0.5) * 4, y1 - seg * 1.6];
    d += 'Q' + pt([Lp[k][0] + 2, y1 - seg * 0.6]) + ' ' + pt(tip) + 'Q' + pt([Rp[k][0] - 2, y1 - seg * 0.4]) + ' ' + pt(Rp[k]);
    for (i = k - 1; i >= 0; i--) { var a2 = Rp[i + 1], b2 = Rp[i], out2 = wf(i / k) * (0.35 + r() * 0.35); d += 'Q' + pt([a2[0] + out2 * 0.2, a2[1] + seg * 0.2]) + ' ' + pt([a2[0] + out2, a2[1] - seg * 0.5]) + 'Q' + pt([b2[0] + out2 * 0.5, (a2[1] + b2[1]) / 2]) + ' ' + pt(b2); }
    return d + 'Z';
  }
  // faceted rock chunk: lit facet top-left, shade band lower-right, cracks
  function chunk(c, pts, col, crack) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    var sh = pd([[mx + (x1 - x0) * 0.08, y0 - 2], [x1 + 2, y0 - 2], [x1 + 2, y1 + 2], [x0 - 2, y1 + 2], [x0 - 2, my + (y1 - y0) * 0.22]], true);
    var li = pd([[x0 - 2, y0 - 2], [mx - (x1 - x0) * 0.05, y0 - 2], [x0 + (x1 - x0) * 0.2, my - (y1 - y0) * 0.05], [x0 - 2, my]], true);
    return body(c, pd(pts, true), col, F(sh, dk(col, 0.28), 0.85) + F(li, lt(col, 0.2), 0.8) + (crack ? L(crack, dk(col, 0.5), 1.2) : ''), 2.2);
  }
  function crystal(c, x, y, h, ang, col) {
    var q = dirQ([x, y], ang), d = pd([q(0, -3.6), q(h * 0.78, -3.6), q(h, 0), q(h * 0.78, 3.6), q(0, 3.6)], true);
    return P(d, c.cel(col), 1.4) + F(pd([q(0, -3.6), q(h * 0.78, -3.6), q(h, 0), q(0, 0)], true), lt(col, 0.35), 0.8) + L('M' + pt(q(h * 0.2, -1.8)) + 'L' + pt(q(h * 0.7, -1.8)), '#ffffff', 0.9, 0.7);
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    highland_thrasher: function (c) {
      var fc = function (c) { var o = ''; [[-0.2, 26, '#b0421e'], [-0.52, 30, '#e8d8a8'], [-0.84, 28, '#b0421e'], [-1.16, 24, '#e8d8a8'], [-1.48, 17, '#b0421e']].forEach(function (k) { o += feather(c, 40, 30, k[0], k[1], k[2], '#3a2010'); }); return o; };
      return raptor(c, {
        col: '#c99a52', stripe: '#7a4a24', belly: '#f2e2b8', crest: '#8a3a1e', crestD: 'M38,32 L46,26 L50,34 Z', eye: '#ffd040', talons: true, sickleK: 1.2,
        back: function (c) { return feather(c, 46, 42, -0.2, 13, '#8a3a1e', '#3a2010') + feather(c, 50, 48, 0.05, 12, '#b86a2e', '#3a2010') + feather(c, 54, 53, 0.25, 11, '#8a3a1e', '#3a2010'); },
        headX: fc
      });
    },
    highland_fleshstalker: function (c) {
      var col = '#6c4034', sc = function (d) { return L(d, OL, 3.4) + L(d, '#e8a8a0', 1.6); };
      return G(raptor(c, {
        col: col, belly: '#c8a47a', crest: '#2a1a16', crestD: 'M38,32 L44,24 L50,34 Z', eye: '#ff5a1a', open: true, talons: true, sickleK: 1.7,
        bodyMark: function (c) { return mottle(71, 8, 46, 52, 88, 78, '#3e2019', '#8a5a4a', 1.6, 3)() + sc('M56,54 L64,68 M62,52 L71,66 M68,52 L76,64'); },
        tailMark: function () { return sc('M100,58 L106,68'); }, neckMark: function () { return sc('M38,48 L46,54'); }, thighMark: function () { return sc('M58,72 L66,80'); },
        back: function (c) { return feather(c, 46, 42, -0.2, 14, '#2a1a16', '#c8281e') + feather(c, 50, 48, 0.05, 13, '#3a2420', '#c8281e') + feather(c, 54, 53, 0.25, 12, '#2a1a16', '#c8281e'); },
        headX: function (c) { var o = ''; [[-0.24, 28, '#2a1a16'], [-0.56, 32, '#3a2420'], [-0.88, 30, '#2a1a16'], [-1.2, 25, '#3a2420'], [-1.5, 18, '#2a1a16']].forEach(function (k) { o += feather(c, 40, 30, k[0], k[1], k[2], '#c8281e'); }); return o + sc('M26,30 L34,40'); }
      }), 'translate(-3,-1) ' + at(1.08, 64, 122));
    },
    drywhisker_kobold: function (c) {
      return kob(c, {
        fur: '#aaa69e', muzzle: '#e4e0d6', tail: '#c8aca0', cloth: '#9a3a2a', earIn: '#c88a80',
        chest: function (c) { return L('M52,70 L78,98', OL, 5) + L('M52,70 L78,98', '#6a4a2c', 3) + R(60, 78, 6, 6, c.cel('#c8a040'), 1); },
        hat: function (c) { return P('M42,40 C44,33 58,30 62,36 L60,41 C54,38 48,39 43,43 Z', c.cel('#6a4a2c'), 1.6) + kCandle(c, 50, 36, 1); },
        near: [[57, 73], [46, 68], [38, 58]], item: function (c, p) { return pick(c, p, 36, -PI / 2 - 0.45); }
      });
    },
    drywhisker_digger: function (c) {
      return kob(c, {
        fur: '#6e7a8e', muzzle: '#bcc4d0', tail: '#b0a0a8', cloth: '#8a7438', earIn: '#b88a90', whisk: '#e8eaf0', noEye: true,
        chest: function (c) { return P('M58,66 C68,63 77,66 81,74 C84,82 83,92 79,98 L70,90 C68,82 64,72 58,66 Z', c.cel('#7a5a38'), 2) + C(68, 76, 1.2, '#c8c4bc') + C(72, 86, 1.2, '#c8c4bc'); },
        hat: function (c) { return L('M40,46 L62,40', OL, 3.4) + L('M40,46 L62,40', '#4a3a2a', 1.8) + C(36, 48.5, 5.2, c.cel('#c89a3a'), 1.6) + C(36, 48.5, 3.4, '#ffb040', 1) + C(34.8, 47.2, 1.1, '#fff4c0') + C(45, 46, 4.2, c.cel('#c89a3a'), 1.4) + C(45, 46, 2.6, '#ffb040', 1); },
        near: [[57, 73], [49, 84], [42, 88]], item: function (c, p) { return shovel(c, p, 26, PI * 0.72); },
        farItem: function (c, p) { return sack(c, p[0] + 6, p[1] + 14, 0.5, '#b8a070'); }
      });
    },
    witherbark_headhunter: function (c) {
      var sk = WBSK;
      return jTroll(c, {
        skin: sk, eye: '#ffd040', paint: 'band', paintCol: WBP, loin: '#5a3a2a', loinTrim: '#e8e0c8',
        hairBack: function (c, x, y) { var d = 'M' + pt([x + 4, y - 14]) + 'Q' + pt([x + 18, y - 12]) + ' ' + pt([x + 22, y + 8]) + 'M' + pt([x + 8, y - 14]) + 'Q' + pt([x + 22, y - 16]) + ' ' + pt([x + 28, y + 2]); return L(d, OL, 6) + L(d, HAIRW2, 3.4) + C(x + 22, y + 9, 2, c.cel(BONE), 1) + C(x + 28, y + 3, 2, c.cel(BONE), 1); },
        headX: function (c, x, y) { return C(x + 2, y - 19, 5.4, c.cel(HAIRW2), 1.8) + R(x - 1, y - 16, 6, 3, c.cel(BONE), 1) + feather(c, x + 4, y - 22, -1.1, 14, WBP, '#221a26') + feather(c, x + 6, y - 21, -0.7, 12, '#e8e4d8', '#221a26'); },
        chest: function (c) { var o = L('M46,54 Q62,66 80,54', OL, 2.4) + L('M46,54 Q62,66 80,54', '#6a4a2a', 1); [[52, 58], [58, 61], [64, 62], [70, 61], [76, 58]].forEach(function (t, i) { o += P(pd([[t[0] - 1.6, t[1] - 1], [t[0], t[1] + 5], [t[0] + 1.6, t[1] - 1]], true), c.cel(i % 2 ? BONE : '#f4ecd6'), 0.8); }); return o + F(wedge(50, 72, 12, 0.3, 3.6), WBP, 0.8); },
        front: function (c) { return shrunk(c, 52, 96, 1, '#8a6a44') + shrunk(c, 76, 94, 0.9, '#7a5a3a'); },
        pads: function (c) { return body(c, 'M34,60 C32,48 54,44 58,54 L54,62 L38,64 Z', '#7a5a38', L('M36,58 C44,52 52,52 56,56', WBP, 1.6), 1.8) + feather(c, 38, 60, 1.7, 12, WBP, '#221a26'); },
        near: [[46, 58], [36, 68], [28, 66]], wNear: function (c) { return spear(c, [14, 26], [42, 110], 16, '#c8c0a8', '#7a5a36') + feathers(18, 38, [WBP, '#e8e4d8'], 0.6, -0.2); },
        far: [[80, 54], [90, 70], [92, 86]]
      });
    },
    witherbark_shadowcaster: function (c) {
      var sk = '#46907a';
      return jTroll(c, {
        skin: sk, eye: VOO, glow: true, loin: '#3e2e4a', armW: 8,
        hairBack: function (c, x, y) { var d = 'M' + pt([x + 6, y - 12]) + 'Q' + pt([x + 20, y - 10]) + ' ' + pt([x + 24, y + 12]); return L(d, OL, 6) + L(d, HAIRW2, 3.4); },
        headX: function (c, x, y) {
          var o = '', fc = [WBP, '#221a26', '#e8e4d8', WBP, '#221a26', '#e8e4d8', WBP];
          fc.forEach(function (col, i) { o += feather(c, x + 2, y - 8, -PI / 2 - 0.9 + i * 0.4, 22 - Math.abs(i - 3) * 2.4, col, i % 2 ? WBP : '#221a26'); });
          var m = 'M' + pt([x - 15, y - 13]) + 'C' + pt([x - 4, y - 19]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 9, y - 5]) + 'L' + pt([x + 6, y + 6]) + 'C' + pt([x - 2, y + 9]) + ' ' + pt([x - 10, y + 8]) + ' ' + pt([x - 14, y + 5]) + 'L' + pt([x - 28, y + 2]) + 'L' + pt([x - 16, y - 5]) + 'Z';
          o += body(c, m, '#d8c8a4', F(pd([[x + 1, y - 20], [x + 12, y - 20], [x + 12, y + 10], [x + 2, y + 10]], true), '#8a7a5a', 0.6) + F(pd([[x - 12, y - 11], [x + 6, y - 13], [x + 7, y - 9], [x - 12, y - 7]], true), WBP, 0.9) + L('M' + pt([x - 24, y + 1.5]) + 'L' + pt([x - 14, y + 0]) + 'M' + pt([x - 2, y + 2]) + 'l0,4 M' + pt([x + 2, y + 1]) + 'l0,4', '#6a4a8a', 1.2), 2);
          return o + E(x - 6, y - 3, 3, 2.2, '#140c1a', 1) + glowEye(c, x - 6, y - 3, 1.5, VOO);
        },
        chest: function (c) { return L('M46,54 Q62,68 80,54', OL, 2.4) + L('M46,54 Q62,68 80,54', '#6a4a2a', 1) + skull(c, 62, 64, 0.5) + F(wedge(52, 74, 12, 0.3, 3.4) + wedge(54, 80, 12, 0.2, 3), WBP, 0.8); },
        front: function (c) { var st = ''; for (var i = 0; i < 9; i++) st += 'M' + pt([48 + i * 3.6, 88]) + 'L' + pt([45 + i * 3.9, 110]); return body(c, 'M48,86 L80,86 L85,110 L43,110 Z', '#4a3a5a', L(st, '#2e2438', 1.1) + L('M44,104 L84,104', WBP, 1.6), 1.6) + L('M48,88 L80,88', OL, 2.4); },
        far: [[80, 54], [92, 64], [98, 74]], wFar: function (c, p) { var d = 'M' + pt([p[0] + 5, p[1] + 46]) + 'L' + pt([p[0] - 3, p[1] - 40]); return limb(d, '#4a3424', 3.2) + L('M' + pt([p[0] - 3, p[1] - 40]) + 'q-8,-4 -6,-14 q6,4 10,2', OL, 4) + L('M' + pt([p[0] - 3, p[1] - 40]) + 'q-8,-4 -6,-14 q6,4 10,2', BONE, 2) + orb(c, p[0] - 4, p[1] - 48, 3.4, VOO) + shrunk(c, p[0] - 1, p[1] - 30, 0.8); },
        near: [[46, 58], [34, 66], [22, 62]], wNearFront: function (c, p) { return shadowSwirl(c, [p[0] - 4, p[1] - 10], 1, VOO); },
        tf: at(0.96, 64, 122)
      });
    },
    syndicate_highwayman: function (c) {
      var sk = '#d8a07a', lea = '#4a3a30', clk = '#2a2428';
      return human(c, {
        skin: sk, hair: '#8a4422', stubble: '#7a5a40', shirt: lea, sleeve: '#3a302c', forearm: '#3a302c', glove: '#2a2020', pants: '#2e2a30', boots: '#1e1814', belt: '#1e1814', buckle: '#c8c4bc',
        headX: function (c, x, y) { return P('M' + pt([x - 9, y - 8]) + 'L' + pt([x - 7, y - 25]) + 'C' + pt([x - 4, y - 28]) + ' ' + pt([x + 8, y - 28]) + ' ' + pt([x + 10, y - 25]) + 'L' + pt([x + 12, y - 8]) + 'Z', c.cel('#2e2a2c'), 1.8) + F(pd([[x - 8.4, y - 11], [x + 11.6, y - 11], [x + 11.3, y - 15], [x - 7.8, y - 15]], true), SYNR) + P('M' + pt([x - 18, y - 7]) + 'C' + pt([x - 10, y - 12]) + ' ' + pt([x + 12, y - 12]) + ' ' + pt([x + 18, y - 6]) + 'C' + pt([x + 10, y - 3.4]) + ' ' + pt([x - 10, y - 3.6]) + ' ' + pt([x - 18, y - 7]) + 'Z', c.cel('#262224'), 1.6) + P(pd([[x - 11, y - 5], [x + 9, y - 6], [x + 9, y - 1], [x - 11, y + 0.6]], true), '#161214', 1) + E(x - 5, y - 2.4, 2, 1.4, '#f4ecd6') + C(x - 5.4, y - 2.4, 0.9, OL) + P('M' + pt([x - 11, y + 4]) + 'C' + pt([x - 8, y + 13]) + ' ' + pt([x + 6, y + 14]) + ' ' + pt([x + 10, y + 4]) + 'L' + pt([x + 10, y + 9]) + 'C' + pt([x + 4, y + 18]) + ' ' + pt([x - 8, y + 17]) + ' ' + pt([x - 12, y + 9]) + 'Z', c.cel(SYNR), 1.6); },
        back: function (c) { return body(c, 'M74,50 C90,58 96,84 98,114' + rag(98, 66, 114, 7, 21) + 'L68,56 Z', clk, F('M78,56 C88,70 92,90 94,112 L98,112 C96,84 90,62 78,54 Z', SYNR, 0.9), 2); },
        chest: function (c) { return P('M44,48 C50,40 78,40 84,48 C76,56 52,56 44,48 Z', c.cel(clk), 1.8) + L('M50,52 L78,86', OL, 5.4) + L('M50,52 L78,86', '#5a3a28', 3.4) + R(52, 60, 5, 7, c.cel('#6a4a30'), 1) + R(58, 66, 5, 7, c.cel('#6a4a30'), 1); },
        front: function (c) { return body(c, 'M48,84 L80,84 L82,98 L46,98 Z', clk, L('M64,86 L64,98', '#141014', 1.2), 1.6); },
        near: [[48, 54], [40, 66], [34, 70]], far: [[80, 54], [72, 66], [58, 72]],
        wNearFront: function (c, p) { return crossbow(c, p, PI + 0.04) + hand([54, 71], c.cel('#2a2020')); }
      });
    },
    syndicate_magus: function (c) {
      var sk = '#e0aa84', rb = '#8a1e24', bk = '#221c22';
      return human(c, {
        skin: sk, hair: '#161214', beard: '#161214', shirt: rb, sleeve: bk, forearm: bk, glove: sk, noLegs: true, belt: '#161214', buckle: GOLD,
        back: function (c) { return boot(52, 121, '#161214') + boot(73, 121, '#161214'); },
        headX: function (c, x, y) { return P('M' + pt([x + 3, y + 8]) + 'C' + pt([x + 8, y + 2]) + ' ' + pt([x + 14, y - 4]) + ' ' + pt([x + 16, y - 10]) + 'L' + pt([x + 18, y + 12]) + 'L' + pt([x + 2, y + 14]) + 'Z', c.cel(bk), 1.6) + L('M' + pt([x + 16, y - 10]) + 'L' + pt([x + 18, y + 12]), GOLD, 1.2); },
        chest: function (c) { return F('M58,46 L68,46 L66,90 L60,90 Z', bk) + L('M58,46 L60,90 M68,46 L66,90', GOLD, 1.2) + P(pd([[60, 58], [66, 58], [63, 64]], true), c.cel('#ff5a3a'), 0.9) + L('M46,50 L56,54 M82,50 L72,54', GOLD, 1.2); },
        front: function (c) { return body(c, 'M46,84 L82,84 L90,116' + rag(90, 38, 116, 5, 13) + 'Z', rb, F('M58,84 L68,84 L70,116 L56,116 Z', bk) + L('M58,84 L56,116 M68,84 L70,116', GOLD, 1.2) + F('M72,82 L94,82 L94,120 L74,120 Z', dk(rb, 0.3), 0.7), 1.8); },
        pads: function (c) { return body(c, 'M36,56 C36,44 54,42 58,52 L54,60 L40,62 Z', bk, L('M38,56 C44,50 52,50 56,54', GOLD, 1.3), 1.8); },
        near: [[48, 54], [38, 44], [32, 32]], wNearFront: function (c, p) { return fireball(c, p[0] - 4, p[1] - 10, 6); },
        far: [[80, 54], [90, 68], [92, 82]], wFar: function (c, p) { var d = 'M' + pt([p[0] + 4, p[1] + 36]) + 'L' + pt([p[0] - 4, p[1] - 44]); return limb(d, '#2a2024', 3) + L(d, '#5a4a4a', 1, 0.6) + P(pd([[p[0] - 8, p[1] - 44], [p[0] - 4, p[1] - 56], [p[0], p[1] - 44], [p[0] - 4, p[1] - 40]], true), c.cel('#e83a2a'), 1.2) + C(p[0] - 4, p[1] - 47, 9, glow(c, '#ff5a3a', 0.5)) + L('M' + pt([p[0] - 9, p[1] - 40]) + 'L' + pt([p[0] + 1, p[1] - 40]), OL, 3) + L('M' + pt([p[0] - 9, p[1] - 40]) + 'L' + pt([p[0] + 1, p[1] - 40]), GOLD, 1.6); }
      });
    },
    boulderfist_brute: function (c) {
      var sk = BFSK;
      return ogre(c, {
        skin: sk, pants: '#5a4a38', paint: '#b8321e',
        chest: function (c) { return L('M34,42 L96,92', OL, 6) + L('M34,42 L96,92', '#5a3e28', 4) + L('M94,44 L40,92', OL, 5) + L('M94,44 L40,92', '#6a4a30', 3) + body(c, pd([[54, 58], [76, 56], [80, 78], [56, 80]], true), '#8a6a52', L('M56,64 L78,62 M58,72 L79,70', '#5a4232', 1.1) + C(58, 60, 1.2, '#c8ccd2') + C(74, 58, 1.2, '#c8ccd2') + E(70, 74, 3, 2, '#6a3a24', 0, 0.6), 1.8); },
        front: function (c) { return body(c, 'M44,94 L76,94 L78,110' + rag(78, 42, 110, 6, 9) + 'Z', '#8a7050', L('M46,98 L76,98', dk('#8a7050', 0.4), 1.2), 1.8) + skull(c, 60, 96, 0.55); },
        pads: function (c) { return body(c, 'M24,54 C22,38 46,34 50,48 L46,58 L30,62 Z', '#7a6a58', L('M26,50 C32,42 42,40 48,46', dk('#7a6a58', 0.4), 1.2), 1.8) + P(pd([[30, 44], [26, 32], [36, 42]], true), c.cel(BONE), 1.1) + P(pd([[40, 40], [40, 28], [45, 39]], true), c.cel(BONE), 1.1); },
        near: [[36, 56], [24, 66], [22, 58]], wNear: function (c, p) { return logClub(c, p, 40, -PI / 2 - 0.3); }
      });
    },
    boulderfist_magus: function (c) {
      var sk = '#8a8cae', rb = '#3a4a6e';
      return ogre(c, {
        skin: sk, pants: '#2e3a54', eye: '#9ae8ff', glow: true, knot: false,
        head: function (c, x, y) { return G(ogHead(c, x + 22, y - 2, { skin: dk(sk, 0.08), eye: '#9ae8ff', glow: true, knot: true, hair: '#2a2a3a' }), at(0.88, x + 22, y + 14)) + ogHead(c, x - 4, y + 2, { skin: sk, eye: '#9ae8ff', glow: true, knot: false, paint: '#5ac8e8' }); },
        chest: function (c) { var o = body(c, 'M30,56 C40,50 90,50 100,56 L104,96 L28,96 Z', rb, F('M70,52 L106,52 L106,98 L76,98 Z', dk(rb, 0.3), 0.7), 1.8) + L('M46,58 Q64,72 84,58', OL, 2.4) + L('M46,58 Q64,72 84,58', '#8a6a44', 1); [[52, 63], [58, 66], [64, 67], [70, 66], [76, 63]].forEach(function (t, i) { o += C(t[0], t[1], 2, c.cel(i % 2 ? BONE : '#5ac8e8'), 1); }); return o; },
        front: function (c) { return body(c, 'M36,94 L94,94 L98,118' + rag(98, 32, 118, 6, 17) + 'Z', rb, F('M70,94 L100,94 L100,120 L74,120 Z', dk(rb, 0.3), 0.7) + L('M36,106 L96,106', '#5ac8e8', 1.4), 1.8); },
        near: [[36, 58], [26, 64], [20, 56]], wNearFront: function (c, p) { return C(p[0] - 4, p[1] - 10, 16, glow(c, '#7ad0ff', 0.6)) + C(p[0] - 4, p[1] - 12, 3, '#e8faff') + C(p[0] + 2, p[1] - 20, 1.6, '#9ae8ff') + C(p[0] - 12, p[1] - 18, 1.2, '#9ae8ff'); },
        far: [[94, 58], [104, 66], [106, 58]], wFar: function (c, p) { return orbStaff(c, [p[0] + 4, p[1] + 60], [p[0] - 2, p[1] - 44], '#7ad0ff'); },
        tf: at(0.98, 64, 122)
      });
    },
    burning_exile: function (c) {
      var s = E(64, 121, 34, 6, c.rg([[0, '#ff9a30', 0.6], [0.6, '#ff6a20', 0.25], [1, '#ff6a20', 0]])) + C(64, 70, 58, glow(c, '#ff8a2a', 0.35));
      var wf = function (t) { return 10 + 18 * Math.sin(Math.min(1, t * 1.25) * PI * 0.62) - t * t * 8; };
      var arm = function (pts, w0, w1, sd) { var T = taper(pts, w0, w1, 5); return P(T.d, c.cel('#e8481e'), 2) + F(ribbonBand(T, 0.25, 0.7), '#ff9a2a', 0.9); };
      s += arm([[82, 58], [96, 66], [104, 58], [108, 46]], 12, 5, 3) + flame(c, 108, 48, 0.55, '#ff6a20', '#ffd84a');
      s += P(blaze(64, 122, 30, wf, 7, 11, -4), c.lg([[0, '#ff9a2a'], [0.5, '#e8481e'], [1, '#b82a14']]), 2.4);
      s += F(blaze(63, 120, 40, function (t) { return wf(t) * 0.66; }, 6, 13, -4), '#ff9a2a', 0.95) + F(blaze(62, 116, 56, function (t) { return wf(t) * 0.36; }, 5, 17, -3), '#ffd84a', 0.95) + F(blaze(61, 110, 76, function (t) { return wf(t) * 0.16; }, 4, 19, -2), '#fff6c8', 0.9);
      var sw = 'M40,112 C52,104 76,104 88,112 M44,104 C56,98 72,98 84,104';
      s += L(sw, '#b82a14', 2, 0.7);
      s += F('M40,40 C44,34 64,32 70,40 L68,50 C60,54 48,54 42,50 Z', '#8a1a0e', 0.55);
      s += F(pd([[42, 40], [52, 44], [42, 46]], true) + pd([[56, 44], [66, 40], [64, 46]], true), '#3a0a06') + glowEye(c, 47, 43.6, 2.2, '#fff8c0') + glowEye(c, 61, 43.6, 2, '#fff8c0') + P('M46,50 L50,53 L54,50.4 L58,53.4 L62,50 L60,55 L48,55 Z', '#4a0c08', 1);
      s += arm([[46, 58], [32, 64], [20, 58], [14, 48]], 13, 5, 7) + flame(c, 14, 50, 0.6, '#ff6a20', '#ffd84a') + flame(c, 20, 52, 0.4, '#ff6a20', '#ffd84a');
      var r = rng(23); for (var i = 0; i < 9; i++) s += C(20 + r() * 88, 10 + r() * 60, 0.9 + r() * 1.3, i % 2 ? '#ffd84a' : '#ff8a2a', 0, 0.9);
      return s;
    },
    rumbling_exile: function (c) {
      var col = '#8a7c6a', s = shadow(c, 64, 50), cc = '#9a6ad0';
      s += chunk(c, [[92, 70], [110, 74], [114, 92], [102, 100], [90, 92]], dk(col, 0.1)) + chunk(c, [[100, 96], [118, 98], [122, 118], [104, 122], [96, 112]], dk(col, 0.12));
      s += chunk(c, [[70, 94], [88, 94], [92, 116], [86, 122], [68, 122], [66, 108]], dk(col, 0.06)) + chunk(c, [[36, 94], [56, 94], [60, 110], [58, 122], [34, 122], [30, 108]], col);
      s += crystal(c, 84, 40, 18, -1.2, cc) + crystal(c, 94, 46, 22, -0.7, cc) + crystal(c, 100, 56, 14, -0.2, lt(cc, 0.1));
      s += chunk(c, [[30, 56], [44, 34], [76, 28], [100, 42], [106, 70], [96, 96], [60, 102], [32, 94], [24, 74]], col, 'M52,50 L60,62 L56,74 M84,56 L78,70 M44,80 L54,86');
      s += L('M52,50 L60,62 L56,74', '#ffc860', 1.2, 0.8) + C(58, 66, 8, glow(c, '#ffb040', 0.5));
      s += chunk(c, [[34, 34], [52, 30], [58, 42], [52, 54], [34, 54], [28, 44]], lt(col, 0.05)) + E(38, 42, 2.4, 1.8, '#ffb040', 1) + E(47, 41, 2.1, 1.6, '#ffb040', 1) + C(38, 42, 7, glow(c, '#ffb040', 0.5)) + C(47, 41, 6, glow(c, '#ffb040', 0.5)) + L('M32,38 L42,40 M44,38 L52,37', OL, 2);
      s += crystal(c, 40, 32, 12, -1.9, cc) + crystal(c, 30, 60, 12, -2.6, cc);
      s += chunk(c, [[26, 56], [40, 58], [42, 74], [30, 78], [20, 70]], dk(col, 0.02)) + chunk(c, [[14, 76], [34, 76], [36, 94], [20, 98], [10, 90]], col, 'M20,82 L26,90') + chunk(c, [[4, 94], [26, 94], [30, 114], [14, 120], [2, 110]], lt(col, 0.04), 'M10,100 L18,106 M20,98 L24,108');
      return s;
    },
    kovork: function (c) {
      return kob(c, {
        fur: '#524c48', muzzle: '#b8b2a8', tail: '#8a7a78', cloth: '#6a2a7a', earIn: '#a87a78', whisk: '#e8e4dc', eye: '#ffcc30', scale: 1.12, tx: 2,
        back: function (c) { return body(c, 'M54,62 C66,58 82,64 86,76 C94,92 96,108 98,118' + rag(98, 60, 118, 6, 5) + 'L56,70 Z', '#6a2a7a', F('M84,70 C90,90 94,106 96,118 L100,118 L100,66 Z', '#3a1444', 0.8) + L('M56,66 C68,62 80,66 84,74', GOLD, 1.6), 2); },
        chest: function (c) { return L('M50,76 Q64,84 78,74', OL, 2.4) + L('M50,76 Q64,84 78,74', GOLD, 1.2) + C(56, 80, 1.8, c.cel(GOLD), 0.8) + C(64, 82, 2.2, c.cel('#e83a3a'), 0.8) + C(72, 79, 1.8, c.cel(GOLD), 0.8); },
        face: function () { return L('M40,40 L46,52', '#e8e4dc', 1.4, 0.8); },
        hat: function (c) { return P('M38,44 C42,36 58,31 64,36 L64,40 C56,36 46,39 40,47 Z', c.cel(GOLD), 1.5) + kCandle(c, 42, 42, 0.5, -20) + kCandle(c, 50, 37, 0.68, -5) + kCandle(c, 58, 35, 0.56, 12) + C(49, 39, 1.3, '#e83a3a', 0.6); },
        far: [[71, 74], [84, 66], [90, 54]], farItem: function (c, p) { return club(c, p, 30, -PI / 2 + 0.22, '#6a4a30', true); },
        near: [[57, 73], [46, 80], [37, 78]]
      });
    },
    nimar_the_slayer: function (c) {
      var sk = '#357456', sc = function (d) { return L(d, lt(sk, 0.45), 1.5); };
      return jTroll(c, {
        skin: sk, eye: '#ffe040', glow: true, paint: 'band', paintCol: '#221a26', loin: '#3a2a22', loinTrim: '#c83a2a', legW: 10, armW: 9,
        hairBack: function (c, x, y) { var d = 'M' + pt([x + 4, y - 14]) + 'Q' + pt([x + 20, y - 14]) + ' ' + pt([x + 26, y + 6]) + 'M' + pt([x + 8, y - 12]) + 'Q' + pt([x + 18, y - 4]) + ' ' + pt([x + 18, y + 14]); return L(d, OL, 6) + L(d, '#e8e4d8', 3.4); },
        headX: function (c, x, y) { return C(x + 2, y - 19, 5.6, c.cel('#e8e4d8'), 1.8) + R(x - 1, y - 16, 6, 3, c.cel('#c83a2a'), 1) + L('M' + pt([x - 12, y - 12]) + 'L' + pt([x - 1, y + 6]), OL, 3) + L('M' + pt([x - 12, y - 12]) + 'L' + pt([x - 1, y + 6]), '#e8a8a0', 1.4); },
        chest: function (c) { return sc('M50,54 L58,70 M56,52 L64,66 M66,72 L76,62 M52,80 l8,2') + L('M80,50 L52,86', OL, 5.4) + L('M80,50 L52,86', '#4a3222', 3.2) + skull(c, 66, 68, 0.45) + skull(c, 58, 78, 0.4); },
        pads: function (c) { return bonePad(c, 44, 56, 12) + bonePad(c, 80, 50, 9); },
        top: function (c) { return sc('M30,80 l6,-4 M28,86 l5,-2 M90,70 l6,3'); },
        near: [[46, 58], [34, 48], [26, 36]], wNear: function (c, p) { return glaive(c, p, 34, -PI / 2 - 0.5); },
        far: [[80, 54], [94, 58], [104, 50]], wFar: function (c, p) { return glaive(c, p, 30, -PI / 2 + 0.55); },
        tf: at(1.03, 64, 122)
      });
    },
    molok_the_crusher: function (c) {
      var sk = '#6e7a8e', ir = '#5a5e68';
      return ogre(c, {
        skin: sk, pants: '#3a3030', boots: '#1e1a1a', belt: '#2a2020', buckle: GOLD, paint: '#c8281e', scar: true, hy: 34, shadowR: 50,
        head: function (c, x, y) { return ogHead(c, x, y, { skin: sk, paint: '#c8281e', scar: true, knot: false }) + P('M' + pt([x - 14, y - 7]) + 'C' + pt([x - 14, y - 24]) + ' ' + pt([x + 13, y - 26]) + ' ' + pt([x + 15, y - 7]) + 'Z', c.cel(ir), 2) + L('M' + pt([x - 14, y - 8]) + 'L' + pt([x + 15, y - 8]), '#3a3e48', 2.4) + L('M' + pt([x, y - 23]) + 'L' + pt([x + 1, y - 9]), '#3a3e48', 1.6) +
          P('M' + pt([x + 8, y - 18]) + 'C' + pt([x + 18, y - 22]) + ' ' + pt([x + 21, y - 28]) + ' ' + pt([x + 19, y - 35]) + 'C' + pt([x + 16, y - 28]) + ' ' + pt([x + 10, y - 26]) + ' ' + pt([x + 5, y - 22]) + 'Z', c.cel('#e8dcc0'), 1.5) + P('M' + pt([x - 8, y - 18]) + 'C' + pt([x - 18, y - 22]) + ' ' + pt([x - 21, y - 27]) + ' ' + pt([x - 20, y - 33]) + 'C' + pt([x - 16, y - 27]) + ' ' + pt([x - 10, y - 26]) + ' ' + pt([x - 4, y - 22]) + 'Z', c.cel('#d8ccb0'), 1.5); },
        chest: function (c) { return body(c, pd([[40, 50], [90, 48], [96, 84], [64, 94], [36, 86]], true), ir, L('M42,64 L94,62 M40,76 L95,74', '#3e4048', 1.6) + C(50, 56, 1.4, '#c8ccd2') + C(80, 54, 1.4, '#c8ccd2') + C(64, 60, 1.4, '#c8ccd2') + F(pd([[70, 44], [100, 44], [100, 96], [76, 96]], true), '#000', 0.22), 2) + skull(c, 66, 70, 0.8); },
        front: function (c) { return body(c, 'M44,94 L78,94 L80,112' + rag(80, 42, 112, 7, 7) + 'Z', '#8a1e1a', L('M46,98 L78,98', OL, 1.4), 1.8); },
        top: function (c) { var sp = function (x, y, r) { return body(c, 'M' + pt([x - r, y + r * 0.2]) + 'C' + pt([x - r * 1.05, y - r * 0.9]) + ' ' + pt([x + r * 1.05, y - r * 0.9]) + ' ' + pt([x + r, y + r * 0.2]) + 'Z', ir, F(pd([[x + r * 0.2, y - r], [x + r * 1.2, y - r], [x + r * 1.2, y + r], [x + r * 0.3, y + r]], true), '#000', 0.25), 1.8) + [[-0.55, -0.45], [0.05, -0.8], [0.6, -0.4]].map(function (k) { var px = x + k[0] * r, py = y + k[1] * r; return P(pd([[px - 2.6, py + 1], [px - 0.6, py - r * 0.9], [px + 2.6, py + 1]], true), c.cel('#c8ccd2'), 1.1); }).join(''); }; return sp(30, 62, 14); },
        pads: function (c) { return body(c, 'M82,48 C84,38 100,38 104,48 L100,56 L86,56 Z', ir, '', 1.8); },
        near: [[36, 58], [26, 70], [24, 76]], wNear: function (c, p) { return maul(c, p, 34, PI / 2 + 0.22); },
        tf: 'translate(2,0) ' + at(1.02, 64, 122)
      });
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#8a8a5a'), 2.5); }
  function phScene(c) { return ahSky(c) + ground(c, 150, GRASS, '#5e6a30'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#8a8a5a"/></svg>'; }
    }
  }
  var has = function (t, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k); };
  var baseScene = typeof ART.scene === 'function' ? ART.scene : function () { var c = new Ctx(); return c.svg(400, 240, phScene(c)); };
  var baseMob = typeof ART.mob === 'function' ? ART.mob : function () { var c = new Ctx(); return c.svg(128, 128, phMob(c)); };
  ART.scene = function (k) { return has(SCENES, k) ? make(SCENES, k, 400, 240, phScene) : baseScene.apply(this, arguments); };
  ART.mob = function (k) { return has(MOBS, k) ? make(MOBS, k, 128, 128, phMob) : baseMob.apply(this, arguments); };
  ART.keys = ART.keys || {};
  function addKeys(list, keys) { var a = Array.isArray(list) ? list : []; keys.forEach(function (k) { if (a.indexOf(k) < 0) a.push(k); }); return a; }
  ART.keys.scenes = addKeys(ART.keys.scenes, Object.keys(SCENES));
  ART.keys.mobs = addKeys(ART.keys.mobs, Object.keys(MOBS));
})(typeof window !== 'undefined' ? window : this);
