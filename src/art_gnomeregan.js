/* art_gnomeregan.js — Gearhollow art for Realm of Loner (Accord dungeon, levels 29-34: the sealed gate in Kaldvik's snow,
 * the mechanical halls and the engine core of the fallen gnome city, flooded with radiation).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Gearhollow keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped and dwarf rigs and the house-style scene pieces are shared copies of art_wetlands.js; the trogg is
 * adapted from art_durotar.js. `leper_gnome` is NOT drawn here: art.js already owns that key (Kaldvik).
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix gn<counter>_).
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
  function Ctx() { this.p = 'gn' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  // ---- shared copies of art_wetlands.js / art_redridge.js pieces (glow eye, toes, dwarf head, rags, dwarf rig, bomb, dynamite) ----
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
  function dwarfHead(c, x, y, o) {
    var sk = o.skin || '#e09c78', hc = o.hair || '#7a4422', band = o.band || '#d6a53c', bl = o.beardLen || 30, s = '';
    s += E(x + 10, y + 1, 3.4, 4.6, c.cel(sk), 1.8);
    var d = 'M' + pt([x - 11, y - 4]) + 'C' + pt([x - 12, y - 15]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 12, y - 5]) + 'L' + pt([x + 12, y + 7]) + 'C' + pt([x + 7, y + 13]) + ' ' + pt([x - 6, y + 13]) + ' ' + pt([x - 11, y + 7]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 14]) + 'L' + pt([x + 2, y + 14]) + 'C' + pt([x + 7, y + 4]) + ' ' + pt([x + 7, y - 8]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.22), 0.8) + (o.scar ? L('M' + pt([x - 8, y - 10]) + 'L' + pt([x - 2, y + 1]), dk(sk, 0.35), 1.2) : ''), 2);
    // braid hanging from the beard
    var bx = x - 2, by = y + bl - 2, br = 'M' + pt([bx, by]) + 'L' + pt([bx - 1, by + 10]);
    s += L(br, OL, 7.4) + L(br, hc, 4.4) + L('M' + pt([bx - 2, by + 2]) + 'l2,2 M' + pt([bx - 2, by + 5]) + 'l2,2', dk(hc, 0.35), 1) + R(bx - 3.4, by + 6, 5.6, 3.4, c.cel(band), 1.2) + P('M' + pt([bx - 4, by + 10]) + 'L' + pt([bx + 2, by + 10]) + 'L' + pt([bx - 1, by + 15]) + 'Z', c.cel(hc), 1.2);
    var bd = 'M' + pt([x + 11, y - 3]) + 'C' + pt([x + 15, y + 10]) + ' ' + pt([x + 15, y + bl * 0.62]) + ' ' + pt([x + 8, y + bl]) + 'L' + pt([x + 4, y + bl - 4]) + 'L' + pt([x, y + bl + 1]) + 'L' + pt([x - 4, y + bl - 5]) + 'L' + pt([x - 9, y + bl - 1]) +
      'C' + pt([x - 16, y + bl * 0.62]) + ' ' + pt([x - 17, y + 12]) + ' ' + pt([x - 12, y + 4]) + 'C' + pt([x - 6, y + 6]) + ' ' + pt([x + 2, y + 5]) + ' ' + pt([x + 6, y - 1]) + 'Z';
    s += body(c, bd, hc, L('M' + pt([x + 7, y + 6]) + 'C' + pt([x + 9, y + 14]) + ' ' + pt([x + 8, y + 20]) + ' ' + pt([x + 5, y + bl - 5]) + 'M' + pt([x - 2, y + 9]) + 'C' + pt([x - 1, y + 16]) + ' ' + pt([x - 2, y + 22]) + ' ' + pt([x - 3, y + bl - 6]) + 'M' + pt([x - 10, y + 10]) + 'C' + pt([x - 12, y + 16]) + ' ' + pt([x - 10, y + 22]) + ' ' + pt([x - 8, y + bl - 4]), dk(hc, 0.3), 1.1) +
      F('M' + pt([x + 4, y - 4]) + 'L' + pt([x + 18, y - 4]) + 'L' + pt([x + 18, y + bl + 4]) + 'L' + pt([x + 4, y + bl + 4]) + 'C' + pt([x + 10, y + 20]) + ' ' + pt([x + 9, y + 8]) + ' ' + pt([x + 4, y - 4]) + 'Z', dk(hc, 0.25), 0.7) + L('M' + pt([x - 12, y + 12]) + 'C' + pt([x - 13, y + 18]) + ' ' + pt([x - 12, y + 22]) + ' ' + pt([x - 10, y + 26]), lt(hc, 0.3), 1, 0.7), 2);
    // droopy moustache, big nose over it
    s += P('M' + pt([x - 3, y + 3]) + 'C' + pt([x - 10, y + 2]) + ' ' + pt([x - 17, y + 6]) + ' ' + pt([x - 18, y + 14]) + 'C' + pt([x - 13, y + 11]) + ' ' + pt([x - 8, y + 10]) + ' ' + pt([x - 2, y + 10]) + 'C' + pt([x + 2, y + 10]) + ' ' + pt([x + 5, y + 6]) + ' ' + pt([x + 2, y + 3]) + 'Z', c.cel(lt(hc, 0.08)), 1.6);
    s += E(x - 12, y + 1, 5, 4.4, c.cel(mix(sk, '#d86a5a', 0.22)), 1.8) + E(x - 13.4, y - 0.4, 1.6, 1.1, '#ffffff', 0, 0.45);
    s += E(x - 5, y - 3.4, 2, 2.2, '#fff8e8', 1) + C(x - 6, y - 3.2, 1.1, OL);
    s += P('M' + pt([x - 11, y - 7]) + 'C' + pt([x - 8, y - 10]) + ' ' + pt([x - 2, y - 10]) + ' ' + pt([x + 1, y - 8]) + 'L' + pt([x, y - 6]) + 'C' + pt([x - 4, y - 7]) + ' ' + pt([x - 8, y - 6]) + ' ' + pt([x - 11, y - 5]) + 'Z', c.cel(hc), 1.2);
    if (o.helm) s += o.helm(c, x, y);
    return s;
  }
  function rag(x0, x1, y, depth, seed) {
    var r = rng(seed || 3), d = '', k = 6;
    for (var i = 0; i <= k; i++) { var x = x0 + (x1 - x0) * i / k; d += 'L' + pt([x, y + (i % 2 ? depth * (0.4 + r() * 0.6) : 0)]); }
    return d;
  }
  function dwarfRig(c, o) {
    var sk = o.skin;
    var ho = { skin: sk, hair: o.hair, beardLen: o.beardLen, helm: o.helm, band: o.band, scar: o.scar };
    return biped(c, {
      skin: sk, shirt: o.shirt, pants: o.pants, sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#1e1a1a', glove: o.glove,
      hx: 56, hy: 44, hipY: 96, legW: 13, armW: 11.5, shadowR: 36, neck: false,
      torsoD: 'M40,60 C44,52 82,52 88,60 L88,82 L85,99 L43,99 L40,82 Z',
      head: function (c, x, y) { return G(dwarfHead(c, x, y, ho) + (o.headX ? o.headX(c, x, y) : ''), at(1.12, x, y + 10)); },
      chest: o.chest, back: o.back, pads: o.pads, top: o.top, shins: o.shins,
      front: function (c) { return (o.front ? o.front(c) : '') + P('M41,90 L87,90 L86,99 L42,99 Z', c.cel(o.belt || '#2a2222'), 2) + R(58, 88.6, 11, 11.6, c.cel(o.buckle || '#6a6870'), 1.6) + R(61, 91.6, 5, 5.6, o.buckleIn || dk(o.belt || '#2a2222', 0.2), 0); },
      near: o.near || [[44, 62], [36, 78], [30, 90]], far: o.far || [[84, 62], [92, 78], [92, 92]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      tf: o.tf || at(0.98, 64, 122)
    });
  }
  function bomb(c, x, y, r) {
    var fz = 'M' + pt([x + 2, y - r]) + 'C' + pt([x + 4, y - r - 6]) + ' ' + pt([x + 10, y - r - 4]) + ' ' + pt([x + 9, y - r - 10]), sp = [x + 9, y - r - 10], st = '';
    for (var i = 0; i < 8; i++) { var a = i * PI / 4, l = i % 2 ? 3 : 5.4; st += 'M' + pt(sp) + 'l' + n(Math.cos(a) * l) + ',' + n(Math.sin(a) * l); }
    return body(_cur, ellD(x, y, r, r), '#2e2c32', E(x - r * 0.35, y - r * 0.4, r * 0.3, r * 0.2, '#8a8890', 0, 0.8), 2) + R(x - 3, y - r - 3, 6, 4, c.cel('#6a6870'), 1.2) +
      L(fz, OL, 3) + L(fz, '#c8a060', 1.4) + C(sp[0], sp[1], 10, glow(c, '#ffd040', 0.8)) + L(st, '#ffe070', 1.3) + C(sp[0], sp[1], 1.8, '#ffffff');
  }
  function dynamite(c, x, y, ang, len) {
    var q = dirQ([x, y], ang), d = 'M' + pt(q(0, 0)) + 'L' + pt(q(len, 0));
    return L(d, OL, 7.4) + L(d, '#c0321e', 4.6) + L('M' + pt(q(1, -1.2)) + 'L' + pt(q(len - 1, -1.2)), '#f07050', 1, 0.8) + L('M' + pt(q(len * 0.3, -3)) + 'L' + pt(q(len * 0.3, 3)) + 'M' + pt(q(len * 0.7, -3)) + 'L' + pt(q(len * 0.7, 3)), '#e8d8b0', 1.2) +
      L('M' + pt(q(len, 0)) + 'q' + n(Math.cos(ang) * 4) + ',' + n(Math.sin(ang) * 4 - 3) + ' ' + n(Math.cos(ang) * 6) + ',' + n(Math.sin(ang) * 6 - 1), '#3a2a1a', 1);
  }
  // ---- trogg (hunched; adapted from art_durotar.js, with far-arm, glow and head hooks) ----
  function trogg(c, o) {
    var sk = o.skin, s = '';
    s += shadow(c, 64, o.shadowR || 36);
    if (o.back) s += o.back(c);
    var far = o.far || 'M84,58 L94,76 L92,92', fh = o.farHand || [92, 94];
    if (o.wFar) s += o.wFar(c, fh);
    s += limb(far, dk(sk, 0.18), 11) + hand(fh, c.cel(dk(sk, 0.1)));
    s += limb('M74,90 L80,104 L78,114', dk(sk, 0.2), 12) + toes2(79, 121, dk(sk, 0.3));
    s += limb('M58,92 L54,106 L52,114', sk, 12) + toes2(52, 121, dk(sk, 0.3));
    if (o.shins) s += o.shins(c);
    s += body(c, 'M50,86 L80,86 L78,100 L70,96 L64,102 L58,96 L52,100 Z', o.loin || '#6a4a2a', '');
    var td = 'M42,64 C42,48 60,38 80,42 C96,46 100,62 94,76 C90,88 80,94 64,94 C52,94 44,86 42,76 Z';
    s += body(c, td, sk, F('M76,38 L104,38 L104,98 L70,98 C82,84 86,60 76,38 Z', dk(sk, 0.25), 0.8) + F('M46,80 C54,90 70,92 90,82 L96,100 L40,100 Z', dk(sk, 0.3), 0.7) + L('M52,66 Q60,72 68,68', dk(sk, 0.3), 1.4) + (o.torsoX ? o.torsoX(c) : ''));
    [[70, 42, 8], [82, 44, 9], [90, 54, 7], [60, 44, 6]].forEach(function (g) { s += P('M' + (g[0] - g[2]) + ',' + (g[1] + 3) + ' L' + (g[0] - 2) + ',' + (g[1] - g[2]) + ' L' + (g[0] + g[2]) + ',' + (g[1] + 2) + ' Z', c.cel(o.rock || '#8a8078'), 1.8); });
    if (o.top) s += o.top(c);
    var hx = 34, hy = 52;
    var hd = 'M' + pt([hx - 10, hy - 6]) + 'C' + pt([hx - 8, hy - 16]) + ' ' + pt([hx + 10, hy - 16]) + ' ' + pt([hx + 12, hy - 4]) + 'L' + pt([hx + 12, hy + 6]) + 'C' + pt([hx + 8, hy + 14]) + ' ' + pt([hx - 4, hy + 14]) + ' ' + pt([hx - 10, hy + 10]) + 'L' + pt([hx - 14, hy + 6]) + 'L' + pt([hx - 12, hy]) + 'Z';
    s += body(c, hd, sk, F('M' + pt([hx + 4, hy - 16]) + 'L' + pt([hx + 16, hy - 16]) + 'L' + pt([hx + 16, hy + 16]) + 'L' + pt([hx + 2, hy + 16]) + 'Z', dk(sk, 0.25), 0.8));
    s += P('M' + pt([hx - 12, hy - 5]) + 'C' + pt([hx - 8, hy - 9]) + ' ' + pt([hx, hy - 9]) + ' ' + pt([hx + 4, hy - 5]) + 'L' + pt([hx - 2, hy - 3]) + 'Z', c.cel(dk(sk, 0.2)), 1.6);
    s += C(hx - 5, hy - 2, 1.6, o.eye || '#ffd040', 1);
    s += P('M' + pt([hx - 13, hy + 6]) + 'L' + pt([hx - 2, hy + 8]) + 'L' + pt([hx - 4, hy + 4]) + 'Z', '#2a1010', 1.2) + P('M' + pt([hx - 11, hy + 6]) + 'L' + pt([hx - 10, hy + 2]) + 'L' + pt([hx - 8, hy + 6.5]) + 'Z', '#f4ecd6', 0.8);
    s += P('M' + pt([hx + 6, hy - 6]) + 'L' + pt([hx + 14, hy - 12]) + 'L' + pt([hx + 12, hy]) + 'Z', c.cel(sk), 1.6);
    if (o.headX) s += o.headX(c, hx, hy);
    if (o.crown) s += o.crown(c, hx, hy);
    var near = o.near || 'M50,66 L40,84 L30,96', nh = o.nearHand || [30, 96];
    if (o.weapon) s += G(o.weapon(c, nh), 'rotate(' + (o.clubRot == null ? -20 : o.clubRot) + ',' + nh[0] + ',' + nh[1] + ')');
    s += limb(near, sk, 11) + hand(nh, c.cel(sk));
    if (o.front) s += o.front(c);
    return o.tf ? G(s, o.tf) : s;
  }
  function troggClub(c, p, s, col) {
    s = s || 1; col = col || '#7a5030';
    var x = p[0], y = p[1];
    var d = 'M' + pt([x - 2, y + 4]) + 'L' + pt([x - 10 * s, y - 30 * s]) + 'C' + pt([x - 16 * s, y - 40 * s]) + ' ' + pt([x - 6 * s, y - 48 * s]) + ' ' + pt([x + 2 * s, y - 40 * s]) + 'L' + pt([x + 4, y + 2]) + 'Z';
    return body(c, d, col, F('M' + pt([x - 2 * s, y - 46 * s]) + 'L' + pt([x + 6 * s, y - 46 * s]) + 'L' + pt([x + 6, y + 6]) + 'L' + pt([x + 1, y + 6]) + 'Z', dk(col, 0.3), 0.8), 2) +
      P('M' + pt([x - 12 * s, y - 36 * s]) + 'L' + pt([x - 18 * s, y - 38 * s]) + 'L' + pt([x - 12 * s, y - 32 * s]) + 'Z', '#e8dcc0', 1.4) + P('M' + pt([x - 4 * s, y - 45 * s]) + 'L' + pt([x - 5 * s, y - 52 * s]) + 'L' + pt([x - 1 * s, y - 45 * s]) + 'Z', '#e8dcc0', 1.4);
  }

  // ============================================================
  //  GNOMEREGAN PIECES
  // ============================================================
  var PINE = '#34503e';
  var STEEL = '#8a929c', STEELD = '#4a5058', IRON = '#34383e', BRASS = '#c8963a', COPPER = '#b8703a', RAD = '#8aff3a', WARN = '#ff3a2a', ZAP = '#8ad8ff', SNOW = '#eef3f8', HAZ = '#e8b420';
  function ring(x, y, r, col, w, op) { return '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r) + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function rivets(pts, r, col, sw) { return pts.map(function (p) { return C(p[0], p[1], r || 1.3, col || '#e0c890', sw == null ? 0.8 : sw); }).join(''); }
  function rivetLine(x0, y0, x1, y1, k, r, col, sw) { var a = []; for (var i = 0; i < k; i++) { var t = k < 2 ? 0.5 : i / (k - 1); a.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]); } return rivets(a, r, col, sw); }
  function pipe(pts, w, col) { var d = pd(pts); return L(d, OL, w + 3.2) + L(d, col, w) + G(L(d, lt(col, 0.4), w * 0.26, 0.75), 'translate(' + n(-w * 0.18) + ',' + n(-w * 0.18) + ')'); }
  function flange(c, x, y, w, h, col) { return R(x - w / 2, y - h / 2, w, h, c.cel(col || STEELD), 1.4, 1); }
  function valve(c, x, y, r, col) {
    col = col || '#b83a2a'; var sp = '';
    for (var i = 0; i < 3; i++) { var a = i * PI / 3 + 0.3; sp += 'M' + pt([x + Math.cos(a) * r, y + Math.sin(a) * r]) + 'L' + pt([x - Math.cos(a) * r, y - Math.sin(a) * r]); }
    return L(sp, OL, 3) + L(sp, dk(col, 0.2), 1.4) + ring(x, y, r, OL, 4.4) + ring(x, y, r, col, 2) + C(x, y, r * 0.32, c.cel(STEEL), 1);
  }
  function gearD(x, y, r, k, rot, depth) {
    var pts = [], ri = r * (1 - (depth || 0.18)), w = PI / k;
    for (var i = 0; i < k; i++) {
      var a = (rot || 0) + PI * 2 * i / k;
      pts.push([x + Math.cos(a - w * 0.55) * ri, y + Math.sin(a - w * 0.55) * ri]);
      pts.push([x + Math.cos(a - w * 0.34) * r, y + Math.sin(a - w * 0.34) * r]);
      pts.push([x + Math.cos(a + w * 0.34) * r, y + Math.sin(a + w * 0.34) * r]);
      pts.push([x + Math.cos(a + w * 0.55) * ri, y + Math.sin(a + w * 0.55) * ri]);
    }
    return pd(pts, true);
  }
  function gear(c, x, y, r, k, col, rot) {
    var d = gearD(x, y, r, k, rot || 0, 0.18), holes = '', nh = k > 10 ? 6 : 4;
    for (var i = 0; i < nh; i++) { var a = (rot || 0) + PI * 2 * i / nh + PI / nh; holes += C(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.13, dk(col, 0.6), 0); }
    return body(c, d, col, F(pd([[x + r * 0.1, y - r - 4], [x + r + 4, y - r - 4], [x + r + 4, y + r + 4], [x - r * 0.4, y + r + 4]], true), dk(col, 0.3), 0.6) + ring(x, y, r * 0.7, dk(col, 0.35), Math.max(1, r * 0.05)) + holes, Math.max(1.2, Math.min(2.2, r * 0.06))) +
      C(x, y, r * 0.22, c.cel(lt(col, 0.1)), 1.4) + C(x, y, r * 0.08, OL);
  }
  function hazard(c, x, y, w, h) {
    var id = c.clip(pd([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true)), d = '';
    for (var i = -h - 10; i < w + 10; i += 10) d += 'M' + pt([x + i, y + h]) + 'L' + pt([x + i + h, y]) + 'L' + pt([x + i + h + 5, y]) + 'L' + pt([x + i + 5, y + h]) + 'Z';
    return R(x, y, w, h, HAZ) + '<g clip-path="url(#' + id + ')">' + F(d, '#1e1a14') + '</g>' + R(x, y, w, h, 'none', 1.3);
  }
  function lamp(c, x, y, r, col) { return C(x, y, r * 3.8, glow(c, col, 0.7)) + R(x - r - 1.5, y + r * 0.4, r * 2 + 3, r * 0.9, c.cel(IRON), 1) + C(x, y, r, c.rg([[0, '#ffffff'], [0.45, lt(col, 0.35)], [1, col]]), 1.4); }
  function puddle(c, x, y, rx, ry, seed) {
    var r = rng(seed || 9), o = E(x, y, rx * 1.8, ry * 3.2, glow(c, RAD, 0.5)), lobes = [[x, y, rx, ry]], fill = c.lg([[0, '#c8ff7a'], [0.55, '#6ae02a'], [1, '#2a8a1a']]), a = '', b = '';
    lobes.push([x - rx * (0.45 + r() * 0.2), y + ry * (0.2 + r() * 0.3), rx * 0.55, ry * 0.8]);
    lobes.push([x + rx * (0.5 + r() * 0.2), y - ry * (0.1 + r() * 0.3), rx * 0.5, ry * 0.75]);
    lobes.forEach(function (l) { a += E(l[0], l[1], l[2], l[3], fill, 2.2); b += E(l[0], l[1], l[2], l[3], fill); });
    o += a + b + E(x - rx * 0.3, y - ry * 0.3, rx * 0.35, ry * 0.26, '#f0ffd0', 0, 0.8);
    for (var i = 0; i < 3; i++) o += ring(x + (r() - 0.5) * rx, y + (r() - 0.3) * ry * 0.6, 1 + r() * 1.4, '#eaffc0', 0.8, 0.9);
    return o;
  }
  function bolt(seed, x0, y0, x1, y1, k, j) { var r = rng(seed), p = [[x0, y0]]; for (var i = 1; i < k; i++) { var t = i / k; p.push([x0 + (x1 - x0) * t + (r() - 0.5) * j, y0 + (y1 - y0) * t + (r() - 0.5) * j]); } p.push([x1, y1]); return pd(p); }
  function zap(c, seed, x0, y0, x1, y1, k, j, w) { var d = bolt(seed, x0, y0, x1, y1, k || 5, j || 8); w = w || 1; return L(d, '#2a6aff', 4.4 * w, 0.45) + L(d, '#9adcff', 2 * w) + L(d, '#ffffff', 0.8 * w); }
  function spark(x, y, r, col) { var d = 'M' + pt([x - r, y]) + 'L' + pt([x + r, y]) + 'M' + pt([x, y - r]) + 'L' + pt([x, y + r]) + 'M' + pt([x - r * 0.6, y - r * 0.6]) + 'L' + pt([x + r * 0.6, y + r * 0.6]) + 'M' + pt([x + r * 0.6, y - r * 0.6]) + 'L' + pt([x - r * 0.6, y + r * 0.6]); return L(d, col || '#e0f6ff', 1) + C(x, y, r * 0.3, '#ffffff'); }
  function snowfall(seed, cnt, y0, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0); o += C(r() * 400, y, 0.6 + r() * 1.3 * (0.5 + y / 240), '#ffffff', 0, 0.6 + r() * 0.4); } return o; }
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 1.1, col || '#c8ff7a', 0, 0.5 + r() * 0.5); return o; }
  function steelWall(c, x0, y0, x1, y1, col, pw, seed) {
    var o = R(x0, y0, x1 - x0, y1 - y0, c.lg([[0, lt(col, 0.05)], [1, dk(col, 0.3)]])), r = rng(seed || 4), jn = '', rv = [], sh = '';
    pw = pw || 48;
    for (var x = x0; x < x1; x += pw) {
      jn += 'M' + pt([x, y0]) + 'L' + pt([x, y1]);
      for (var y = y0 + 6; y < y1 - 2; y += 12) { rv.push([x + 4, y]); rv.push([x + pw - 4, y]); }
      if (r() < 0.45) sh += R(x + 1, y0, pw - 2, y1 - y0, r() < 0.5 ? dk(col, 0.14) : lt(col, 0.05), 0);
    }
    var hy1 = y0 + (y1 - y0) * 0.36, hy2 = y0 + (y1 - y0) * 0.7;
    jn += 'M' + pt([x0, hy1]) + 'L' + pt([x1, hy1]) + 'M' + pt([x0, hy2]) + 'L' + pt([x1, hy2]);
    return o + sh + L(jn, dk(col, 0.55), 1.6, 0.9) + G(L(jn, lt(col, 0.18), 0.8, 0.55), 'translate(1.4,1.4)') + rivets(rv, 1.1, lt(col, 0.28), 0);
  }
  function metalFloor(c, yH, vx, col, seed) {
    var H = 242 - yH, o = R(-2, yH, 404, H, c.lg([[0, dk(col, 0.5)], [1, col]])), d = '', rv = [], ys = [], r = rng(seed || 2), pl = '';
    for (var i = -9; i <= 9; i++) d += 'M' + pt([vx + i * 16, yH]) + 'L' + pt([vx + i * 80, 242]);
    for (var j = 1; j < 7; j++) { var t = j / 7, y = yH + H * t * t; ys.push(y); d += 'M-2,' + n(y) + 'L402,' + n(y); }
    ys.forEach(function (y, k) {
      var f = (y - yH) / H;
      for (var i = -9; i <= 9; i++) { var x = vx + i * (16 + 64 * f); if (x > -4 && x < 404) rv.push([x + 4 + 8 * f, y + 1.5 + 3 * f]); }
      if (k < ys.length - 1) { var ny = ys[k + 1], nf = (ny - yH) / H; for (var q = -9; q < 9; q++) if (r() < 0.14) pl += pd([[vx + q * (16 + 64 * f), y], [vx + (q + 1) * (16 + 64 * f), y], [vx + (q + 1) * (16 + 64 * nf), ny], [vx + q * (16 + 64 * nf), ny]], true); }
    });
    return o + F(pl, dk(col, 0.2), 0.6) + L(d, dk(col, 0.6), 1.3, 0.85) + G(L(d, lt(col, 0.14), 0.6, 0.45), 'translate(1,1)') + rivets(rv, 1.1, lt(col, 0.18), 0);
  }
  function truss(c, x, y0, y1, w, col) {
    col = col || STEELD;
    var d = 'M' + pt([x - w / 2, y0]) + 'L' + pt([x - w / 2, y1]) + 'M' + pt([x + w / 2, y0]) + 'L' + pt([x + w / 2, y1]), xb = '';
    for (var y = y0; y < y1 - 1; y += w) { var y2 = Math.min(y1, y + w); xb += 'M' + pt([x - w / 2, y]) + 'L' + pt([x + w / 2, y2]) + 'M' + pt([x + w / 2, y]) + 'L' + pt([x - w / 2, y2]); }
    return L(xb, OL, 3.2) + L(xb, dk(col, 0.1), 1.4) + L(d, OL, 5) + L(d, col, 3) + L(d, lt(col, 0.25), 0.8, 0.6);
  }
  function catwalk(c, x0, x1, y, col, rail) {
    col = col || STEELD; rail = rail || 14;
    var posts = '', gr = '', k = Math.max(2, Math.round((x1 - x0) / 22));
    for (var i = 0; i <= k; i++) { var x = x0 + (x1 - x0) * i / k; posts += 'M' + pt([x, y]) + 'L' + pt([x, y - rail]); }
    for (var gx = x0 + 3; gx < x1; gx += 5) gr += 'M' + pt([gx, y + 1.5]) + 'L' + pt([gx, y + 5]);
    var rl = 'M' + pt([x0, y - rail]) + 'L' + pt([x1, y - rail]) + 'M' + pt([x0, y - rail * 0.5]) + 'L' + pt([x1, y - rail * 0.5]);
    return L(posts + rl, OL, 3.8) + L(rl, HAZ, 1.8) + L(posts, col, 1.8) + R(x0, y, x1 - x0, 6, c.cel(col), 1.6) + L(gr, dk(col, 0.5), 1, 0.8) + F(pd([[x0, y + 6], [x1, y + 6], [x1, y + 10], [x0, y + 10]], true), '#000', 0.35);
  }
  function toxBarrel(c, x, y, s) {
    return C(x, y - 9 * s, 16 * s, glow(c, RAD, 0.4)) + barrel(c, x, y, s, '#4e6a3a') + C(x - 1 * s, y - 9 * s, 3.4 * s, '#c8ff6a', 1 * s) + C(x - 1 * s, y - 9 * s, 1.2 * s, '#2a4a1a') +
      P('M' + pt([x - 7 * s, y - 18 * s]) + 'C' + pt([x - 4 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 20 * s]) + ' ' + pt([x + 7 * s, y - 18 * s]) + 'L' + pt([x + 5 * s, y - 13 * s]) + 'L' + pt([x + 3 * s, y - 16 * s]) + 'L' + pt([x - 6 * s, y - 16 * s]) + 'Z', '#8aee3a', 1 * s);
  }
  function gnomeTent(c, x, y, s, col, st) {
    var d = 'M' + pt([x - 22 * s, y]) + 'L' + pt([x, y - 26 * s]) + 'L' + pt([x + 22 * s, y]) + 'Z';
    var o = E(x, y + 1, 25 * s, 4 * s, '#2a3a50', 0, 0.22);
    o += L('M' + pt([x - 22 * s, y]) + 'L' + pt([x - 30 * s, y + 2]) + 'M' + pt([x + 22 * s, y]) + 'L' + pt([x + 30 * s, y + 2]), '#5a4a3a', 1);
    o += body(c, d, col, F(pd([[x - 9 * s, y - 16 * s], [x - 5 * s, y - 20 * s], [x - 13 * s, y], [x - 19 * s, y]], true), st) + F(pd([[x + 5 * s, y - 20 * s], [x + 9 * s, y - 16 * s], [x + 19 * s, y], [x + 13 * s, y]], true), st) +
      F(pd([[x, y - 28 * s], [x + 24 * s, y + 2], [x + 2 * s, y + 2]], true), dk(col, 0.3), 0.55) + F(pd([[x - 5 * s, y], [x, y - 13 * s], [x + 5 * s, y]], true), '#2a1e22'), 1.8 * s);
    o += limb('M' + pt([x, y - 26 * s]) + 'L' + pt([x, y - 34 * s]), '#6a5040', 1.4 * s) + P(pd([[x, y - 34 * s], [x + 9 * s, y - 31.5 * s], [x, y - 29 * s]], true), st, 1 * s);
    return o + F(pd([[x - 6 * s, y - 21 * s], [x, y - 26 * s], [x + 6 * s, y - 21 * s], [x, y - 23 * s]], true), SNOW, 0.95);
  }
  function snowDrift(x, y, w, h, col) { return P('M' + pt([x - w, y]) + 'C' + pt([x - w * 0.6, y - h]) + ' ' + pt([x + w * 0.5, y - h * 1.1]) + ' ' + pt([x + w, y]) + 'Z', col || '#f6f9fc', 1.1); }
  function console_(c, x, y, s) {
    var o = E(x, y + 1, 20 * s, 3 * s, '#000', 0, 0.35);
    o += body(c, pd([[x - 16 * s, y], [x + 16 * s, y], [x + 14 * s, y - 18 * s], [x - 12 * s, y - 24 * s]], true), '#5a616b', F(pd([[x + 6 * s, y - 26 * s], [x + 18 * s, y - 26 * s], [x + 18 * s, y + 2], [x + 8 * s, y + 2]], true), '#000', 0.3), 1.8 * s);
    o += C(x - 1 * s, y - 20 * s, 12 * s, glow(c, RAD, 0.5)) + P(pd([[x - 9 * s, y - 16 * s], [x + 8 * s, y - 13 * s], [x + 8 * s, y - 18 * s], [x - 8 * s, y - 22 * s]], true), '#9aff5a', 1.1 * s);
    o += L('M' + pt([x - 7 * s, y - 18 * s]) + 'l4,1 l2,-3 l3,2 l3,-1', '#2a6a1a', 0.9 * s);
    o += C(x - 8 * s, y - 7 * s, 1.8 * s, WARN, 0.8) + C(x - 2 * s, y - 7 * s, 1.8 * s, HAZ, 0.8) + C(x + 4 * s, y - 7 * s, 1.8 * s, RAD, 0.8);
    return o + limb('M' + pt([x + 10 * s, y - 16 * s]) + 'L' + pt([x + 14 * s, y - 26 * s]), STEEL, 1.4 * s) + C(x + 14 * s, y - 26 * s, 2.2 * s, WARN, 1);
  }
  function cable(d, col) { return L(d, OL, 4.6) + L(d, col || '#2a2c30', 2.6); }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    gnomeregan_gate: function (c) {
      var o = sky(c, '#7890b0', '#aebed2', '#dde5ee');
      o += C(320, 40, 60, glow(c, '#fff8e8', 0.35)) + C(320, 40, 10, '#fbf6ea');
      o += cloud(84, 44, 1.1, 0.85, '#eef2f8') + cloud(236, 26, 0.8, 0.8, '#eef2f8') + cloud(372, 70, 0.7, 0.75, '#eef2f8');
      o += peaks(c, 601, 120, 44, 86, '#8c98ac', '#f4f8fc', 60, 100);
      o += peaks(c, 603, 130, 20, 46, '#74809a', '#eaf0f8', 40, 70);
      o += farPines(605, 134, '#4e6664', 26, 14, 26);
      // the mountainside the city is dug into: a jagged ridge running off the right edge
      var rp = [[36, 144], [52, 122], [68, 116], [84, 94], [100, 88], [116, 66], [136, 56], [152, 38], [174, 30], [194, 16], [212, 22], [230, 12], [250, 26], [268, 22], [288, 42], [304, 46], [320, 64], [338, 68], [354, 90], [372, 96], [390, 116], [404, 120]];
      var cl = pd(rp.concat([[404, 144]]), true), sr = rng(607), sn = [];
      for (var q = 3; q < rp.length - 3; q++) sn.push([rp[q][0] + (sr() - 0.5) * 4, rp[q][1] + 7 + sr() * 12]);
      var fac = '';
      for (var f = 2; f < rp.length - 2; f += 2) { var p0 = rp[f], p1 = rp[f + 1]; if (p1[1] > p0[1]) fac += pd([p0, p1, [p1[0] + 6, 144], [p0[0] + 10, 144]], true); }
      o += body(c, cl, '#7c7e88', F(fac, '#5e606c', 0.8) + L('M92,108 L128,102 L150,110 M86,126 L118,120 L148,126 M270,98 L300,92 L328,102 M282,124 L312,118 L346,126', '#5a5c66', 1.4, 0.8) +
        F(pd(rp.slice(3, rp.length - 3).concat(sn.reverse()), true), SNOW), 2.2);
      // the riveted steel frame the gate sits in
      o += body(c, 'M144,146 L144,72 L168,46 L244,46 L268,72 L268,146 Z', '#4e545e', F('M232,40 L276,40 L276,150 L248,150 Z', '#000', 0.25) + rivetLine(150, 76, 150, 140, 7, 1.3, '#aab2bc', 0.6) + rivetLine(262, 76, 262, 140, 7, 1.3, '#aab2bc', 0.6) + rivetLine(172, 51, 240, 51, 8, 1.3, '#aab2bc', 0.6), 2.4);
      o += P('M166,47 L246,47 L252,53 C232,50 180,50 160,53 Z', SNOW, 1.2);
      // pipes running over the rock into the gate
      o += pipe([[160, 96], [124, 96], [124, 144]], 8, COPPER) + flange(c, 124, 118, 13, 5, STEELD) + pipe([[150, 120], [96, 120], [96, 144]], 5, STEEL);
      o += pipe([[252, 84], [298, 84], [298, 114], [334, 114], [334, 144]], 8, COPPER) + flange(c, 298, 100, 13, 5, STEELD) + valve(c, 316, 114, 7);
      // the sealed gate: a brass cog ring around an iris door
      o += C(206, 98, 52, '#1e1c20') + gear(c, 206, 98, 50, 18, BRASS, 0.1);
      o += C(206, 98, 36, c.cel('#6a7078'), 2.4);
      var ir = '';
      for (var i = 0; i < 6; i++) { var a = i * PI / 3 + 0.2; ir += 'M' + pt([206 + Math.cos(a) * 35, 98 + Math.sin(a) * 35]) + 'Q' + pt([206 + Math.cos(a + 0.5) * 22, 98 + Math.sin(a + 0.5) * 22]) + ' ' + pt([206 + Math.cos(a + 1.3) * 9, 98 + Math.sin(a + 1.3) * 9]); }
      o += L(ir, OL, 2.2) + G(L(ir, lt('#6a7078', 0.3), 0.8, 0.7), 'translate(1,1)');
      var rv = []; for (var j = 0; j < 16; j++) { var b = j * PI / 8; rv.push([206 + Math.cos(b) * 31, 98 + Math.sin(b) * 31]); }
      o += rivets(rv, 1.3, '#c8ccd2', 0.7) + C(206, 98, 11, c.cel(BRASS), 2) + C(206, 98, 4.4, IRON, 1.2);
      o += lamp(c, 206, 42, 4, WARN) + lamp(c, 150, 70, 3, WARN) + lamp(c, 262, 70, 3, WARN);
      // snowfield, the trodden path, drifts
      o += ground(c, 134, '#eef3f8', '#c4d0de');
      o += F('M-2,152 C60,146 120,154 180,150 C240,146 320,156 402,150 L402,160 C320,166 240,156 180,160 C120,164 60,156 -2,162 Z', '#d4deea', 0.8);
      o += F('M176,138 L238,138 C258,172 280,210 300,242 L100,242 C128,210 150,172 176,138 Z', '#d2dbe6', 0.85);
      var fp = rng(611), ft = ''; for (var k = 0; k < 16; k++) { var fy = 146 + k * 6, fx = 206 + (fy - 140) * 0.3 * (k % 2 ? 1 : -0.4); ft += E(fx + (k % 2 ? 6 : -6), fy, 1.8 + k * 0.12, 1 + k * 0.05, '#aab8c8', 0, 0.8); }
      o += ft + snowDrift(206, 142, 70, 8) + snowDrift(96, 146, 30, 6) + snowDrift(334, 146, 24, 6);
      o += E(120, 200, 50, 6, '#b8c6d8', 0, 0.6) + E(330, 222, 60, 7, '#b8c6d8', 0, 0.6) + E(30, 214, 40, 5, '#b8c6d8', 0, 0.5) + hazard(c, 140, 140, 18, 5) + hazard(c, 254, 140, 18, 5);
      // gnome camp
      o += gnomeTent(c, 44, 158, 0.9, '#b04a6a', '#f0e6e0') + gnomeTent(c, 114, 148, 0.72, '#3a8aa0', '#f0e6e0');
      o += crate(c, 80, 162, 0.8, '#9a7446') + crate(c, 88, 150, 0.6, '#8a6a40') + barrel(c, 14, 170, 0.8, '#7a5a3a');
      o += campfire(c, 166, 174, 0.5);
      // steam vent poking through the snow
      o += pipe([[358, 154], [358, 138]], 9, STEELD) + R(351, 134, 14, 5, c.cel(IRON), 1.4) + smoke(358, 132, 1.1, '#f4f8fc', 0.85, 0.6);
      o += snowRock(c, 292, 160, 30, 13, '#7a7c86') + snowRock(c, 150, 224, 26, 10, '#7a7c86') + snowRock(c, 394, 212, 22, 10, '#6e7080');
      o += pine(c, 18, 140, 0.72, PINE, true) + pine(c, 384, 146, 0.86, PINE, true) + pine(c, 352, 130, 0.5, PINE, true);
      o += snowDrift(30, 238, 40, 8) + snowDrift(250, 240, 34, 6);
      return o + snowfall(613, 90, 0, 240) + vignette(c, '#ffffff', '#1a2436');
    },
    gnomeregan_halls: function (c) {
      var o = R(0, 0, 400, 240, '#121418');
      o += steelWall(c, 0, 0, 400, 124, '#4a5058', 50, 701);
      o += gear(c, 62, 54, 46, 14, '#8a6c3a', 0.2) + gear(c, 128, 18, 24, 10, '#76603e', 0.1) + gear(c, 342, 42, 40, 13, '#806638', 0.05);
      // the round hatch to the deeper city, green light far inside
      o += C(210, 86, 38, '#0c0e10') + gear(c, 210, 86, 36, 16, STEELD, 0.05);
      o += C(210, 86, 27, c.rg([[0, '#b8ff6a'], [0.35, '#4ab82a'], [0.75, '#16301a'], [1, '#080c08']]), 2.2) + C(210, 86, 50, glow(c, RAD, 0.3));
      o += hazard(c, 184, 44, 52, 6);
      o += lamp(c, 180, 30, 2.6, RAD) + lamp(c, 240, 30, 2.6, RAD) + lamp(c, 150, 10, 3.4, WARN) + lamp(c, 276, 10, 3.4, WARN);
      // pipes
      o += pipe([[24, 0], [24, 124]], 8, STEEL) + pipe([[262, 0], [262, 60], [290, 60], [290, 124]], 7, COPPER) + pipe([[384, 0], [384, 124]], 6, STEEL);
      o += pipe([[-4, 108], [404, 108]], 10, '#8a6a4a');
      [60, 150, 330].forEach(function (x) { o += flange(c, x, 108, 6, 18, STEELD); });
      o += valve(c, 290, 88, 7) + flange(c, 24, 60, 16, 6, STEELD);
      // cracked pipe leaking ooze
      o += C(120, 112, 12, glow(c, RAD, 0.6)) + P('M116.5,111 C118,120 116.5,128 118,134 L122,134 C123.5,128 122,120 123.5,111 Z', '#8aee3a', 1.2) + E(120, 136, 7, 2.4, '#8aee3a', 1.2) + L('M116,104 L120,110 L118,114', OL, 1.4);
      // catwalks on girders
      o += catwalk(c, -4, 150, 72, STEELD) + truss(c, 40, 78, 124, 8) + truss(c, 132, 78, 124, 8);
      o += catwalk(c, 300, 404, 62, STEELD) + truss(c, 318, 68, 124, 8) + truss(c, 392, 68, 124, 8);
      o += chain(96, 0, 40, 1) + chain(232, 0, 22, 1) + chain(356, 62, 30, 1);
      // floor
      o += metalFloor(c, 124, 210, '#50565e', 703);
      o += hazard(c, -2, 124, 404, 5) + E(210, 134, 70, 12, glow(c, RAD, 0.3));
      o += puddle(c, 142, 152, 18, 5, 11) + puddle(c, 334, 172, 22, 6, 13) + puddle(c, 60, 206, 22, 6.5, 15) + puddle(c, 236, 222, 28, 8, 17);
      o += toxBarrel(c, 372, 150, 0.9) + toxBarrel(c, 390, 162, 0.8) + crate(c, 22, 150, 0.9, '#6a6a5a') + crate(c, 34, 140, 0.6, '#5a5c50');
      o += gear(c, 380, 226, 20, 9, '#7a6038', 0.4) + gear(c, 104, 236, 12, 8, '#6a6a6a', 0.2);
      o += cable('M150,242 C170,220 150,200 180,188 C200,180 214,190 240,182', '#2e3034');
      return o + motes(705, 26, 0, 400, 100, 240) + R(0, 0, 400, 240, c.lg([[0, RAD, 0], [0.6, RAD, 0.03], [1, RAD, 0.08]])) + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    },
    gnomeregan_core: function (c) {
      var o = R(0, 0, 400, 240, '#0c0e10');
      o += steelWall(c, 0, 0, 400, 124, '#3a3e46', 40, 801);
      o += C(200, 72, 150, glow(c, RAD, 0.32));
      // warning beacons and their light cones
      [[30, 10], [110, 10], [290, 10], [370, 10]].forEach(function (p, i) { o += F(pd([[p[0], p[1]], [p[0] + (i < 2 ? 40 : -40), 124], [p[0] + (i < 2 ? 8 : -8), 124]], true), WARN, 0.1) + lamp(c, p[0], p[1], 3.6, WARN); });
      // pipes feeding the reactor
      o += pipe([[-4, 34], [150, 34]], 9, '#8a6a4a') + pipe([[250, 34], [404, 34]], 9, '#8a6a4a') + pipe([[-4, 58], [148, 62]], 6, STEEL) + pipe([[252, 62], [404, 56]], 6, STEEL);
      o += pipe([[176, -4], [176, 20]], 8, COPPER) + pipe([[224, -4], [224, 20]], 8, COPPER);
      [60, 120, 280, 340].forEach(function (x) { o += flange(c, x, 34, 6, 17, STEELD); });
      // copper coils either side
      [[134, 30], [266, 30]].forEach(function (p) {
        o += R(p[0] - 7, p[1], 14, 86, c.cel('#4a5058'), 1.8);
        var cw = ''; for (var y = p[1] + 6; y < p[1] + 82; y += 5) cw += 'M' + pt([p[0] - 9, y]) + 'L' + pt([p[0] + 9, y + 2]);
        o += L(cw, OL, 3.6) + L(cw, COPPER, 2) + C(p[0], p[1] - 4, 6, c.cel(BRASS), 1.6) + C(p[0], p[1] - 4, 16, glow(c, ZAP, 0.6));
      });
      o += zap(c, 811, 134, 26, 150, 44, 4, 8, 0.8) + zap(c, 813, 266, 26, 250, 46, 4, 8, 0.8);
      // the reactor
      var cyl = c.lg([[0, '#3e434b'], [0.16, '#3e434b'], [0.16, '#727a84'], [0.66, '#727a84'], [0.66, '#4e545c'], [1, '#4e545c']], 0, 0, 1, 0);
      o += P('M150,30 C150,10 250,10 250,30 Z', c.cel('#5a606a'), 2.2) + rivetLine(160, 24, 240, 24, 9, 1.2, '#c8ccd2', 0.6);
      o += R(150, 30, 100, 88, cyl, 2.4);
      o += R(146, 26, 108, 9, c.cel(BRASS), 1.8) + R(146, 110, 108, 12, c.cel(BRASS), 1.8) + rivetLine(152, 116, 248, 116, 12, 1.2, '#f0d890', 0.6);
      o += R(168, 40, 64, 66, '#0e1a0c', 2, 10) + R(172, 44, 56, 58, c.lg([[0, '#6ad82a'], [0.3, '#c8ff7a'], [0.5, '#f4ffd8'], [0.7, '#c8ff7a'], [1, '#4ab82a']], 0, 0, 1, 0), 1.4, 8);
      o += C(200, 72, 44, glow(c, '#d8ff9a', 0.7));
      o += L('M172,58 L228,58 M172,74 L228,74 M172,90 L228,90', '#2a4a1a', 2.4) + L('M200,44 L200,102', '#ffffff', 2, 0.6);
      o += lamp(c, 158, 44, 2.4, RAD) + lamp(c, 242, 44, 2.4, WARN) + lamp(c, 158, 96, 2.4, WARN) + lamp(c, 242, 96, 2.4, RAD);
      // catwalks
      o += catwalk(c, -4, 124, 80, STEELD) + truss(c, 24, 86, 124, 8) + truss(c, 108, 86, 124, 8);
      o += catwalk(c, 276, 404, 88, STEELD) + truss(c, 292, 94, 124, 8) + truss(c, 380, 94, 124, 8);
      // floor, the reactor platform ring
      o += metalFloor(c, 124, 200, '#464c54', 803);
      o += E(200, 150, 180, 34, glow(c, RAD, 0.35));
      o += P(ellD(200, 124, 120, 11), c.cel('#5a606a'), 1.8) + '<ellipse cx="200" cy="124" rx="112" ry="8" fill="none" stroke="' + HAZ + '" stroke-width="2.4" stroke-dasharray="9 6"/>';
      o += R(150, 116, 100, 8, c.cel(STEELD), 1.6);
      // glowing floor grates
      [[74, 176, 50], [290, 196, 60]].forEach(function (g) {
        var gl = ''; for (var x = g[0] + 5; x < g[0] + g[2]; x += 6) gl += 'M' + pt([x, g[1] + 1]) + 'L' + pt([x, g[1] + 9]);
        o += E(g[0] + g[2] / 2, g[1] + 5, g[2] * 0.8, 14, glow(c, RAD, 0.5)) + R(g[0], g[1], g[2], 10, '#9aff5a', 1.6) + L(gl, '#2a3a2a', 2);
      });
      o += cable('M150,122 C120,140 90,138 60,150 C30,160 20,180 -4,186', '#2a2c30') + cable('M250,122 C290,138 330,134 360,150 C380,160 392,176 404,178', '#34302a');
      o += console_(c, 34, 150, 0.9) + console_(c, 372, 146, 0.85);
      o += toxBarrel(c, 330, 142, 0.7) + hazard(c, -2, 124, 60, 4) + hazard(c, 342, 124, 60, 4);
      o += spark(150, 44, 4) + spark(250, 50, 3.4) + spark(140, 100, 3);
      return o + motes(805, 30, 120, 280, 20, 200) + R(0, 0, 400, 240, c.lg([[0, RAD, 0.02], [1, RAD, 0.08]])) + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.14], [1, '#000', 0.6]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  function vein(d) { return L(d, RAD, 3.4, 0.4) + L(d, '#dcffa0', 1.2); }
  function minibomb(c, x, y, r) { return C(x, y, r, c.rg([[0, '#6a6870'], [0.4, '#2e2c32'], [1, '#16141a']]), 1.4) + R(x - 1.6, y - r - 2, 3.2, 2.6, '#8a8e96', 0.8) + C(x - r * 0.35, y - r * 0.35, r * 0.25, '#b8b6c0', 0, 0.8); }
  function dagger(c, p, ang, len) {
    var q = dirQ(p, ang), blade = pd([q(4, -2.6), q(len, 0), q(4, 2.6)], true);
    return limb('M' + pt(q(-6, 0)) + 'L' + pt(q(2, 0)), '#3a2a20', 2.6) + L('M' + pt(q(3, -5)) + 'L' + pt(q(3, 5)), OL, 4.2) + L('M' + pt(q(3, -5)) + 'L' + pt(q(3, 5)), '#8a8e96', 2) +
      P(blade, c.cel('#c8ccd4'), 1.4) + L('M' + pt(q(5, -0.6)) + 'L' + pt(q(len - 3, -0.3)), '#ffffff', 0.7, 0.8);
  }
  function chomper(c, x, y) {
    var sk = '#7a8448', sd = dk(sk, 0.3), o = E(x + 2, y + 1, 26, 4.4, '#000', 0, 0.3);
    o += P(taper([[x + 18, y - 12], [x + 28, y - 14], [x + 32, y - 22], [x + 28, y - 26]], 7, 1.5).d, c.cel(sd), 1.6);
    o += limb('M' + pt([x + 14, y - 8]) + 'L' + pt([x + 16, y - 1]), sd, 5) + limb('M' + pt([x - 2, y - 8]) + 'L' + pt([x - 2, y - 1]), sd, 5);
    var bd = 'M' + pt([x - 12, y - 12]) + 'C' + pt([x - 12, y - 24]) + ' ' + pt([x + 6, y - 28]) + ' ' + pt([x + 18, y - 22]) + 'C' + pt([x + 26, y - 18]) + ' ' + pt([x + 26, y - 8]) + ' ' + pt([x + 20, y - 5]) + 'L' + pt([x - 6, y - 5]) + 'Z';
    o += body(c, bd, sk, F('M' + pt([x - 12, y - 10]) + 'C' + pt([x, y - 4]) + ' ' + pt([x + 14, y - 4]) + ' ' + pt([x + 24, y - 10]) + 'L' + pt([x + 26, y]) + 'L' + pt([x - 14, y]) + 'Z', '#c8b880', 0.8) + E(x + 4, y - 20, 2.4, 1.6, sd, 0, 0.8) + E(x + 14, y - 17, 2, 1.4, sd, 0, 0.8), 2);
    [[x - 4, y - 25], [x + 3, y - 27], [x + 10, y - 26], [x + 17, y - 22]].forEach(function (p) { o += P(pd([[p[0] - 3, p[1] + 2], [p[0], p[1] - 5], [p[0] + 3, p[1] + 2]], true), c.cel('#b8a878'), 1); });
    o += limb('M' + pt([x + 8, y - 8]) + 'L' + pt([x + 8, y - 1]), sk, 5.4) + limb('M' + pt([x - 8, y - 8]) + 'L' + pt([x - 10, y - 1]), sk, 5.4);
    // big head, jaws open toward the left
    var up = 'M' + pt([x - 6, y - 14]) + 'C' + pt([x - 6, y - 26]) + ' ' + pt([x - 20, y - 28]) + ' ' + pt([x - 28, y - 22]) + 'L' + pt([x - 30, y - 16]) + 'L' + pt([x - 12, y - 14]) + 'Z';
    var lo = 'M' + pt([x - 8, y - 12]) + 'L' + pt([x - 28, y - 10]) + 'C' + pt([x - 26, y - 4]) + ' ' + pt([x - 14, y - 2]) + ' ' + pt([x - 6, y - 6]) + 'Z';
    o += P('M' + pt([x - 28, y - 16]) + 'L' + pt([x - 8, y - 14]) + 'L' + pt([x - 28, y - 10]) + 'Z', '#5a1414', 1.2);
    o += P(lo, c.cel(sk), 1.8) + F(pd([[x - 26, y - 10], [x - 24, y - 13], [x - 22, y - 10], [x - 19, y - 13], [x - 17, y - 10.5]], false) + 'Z', '#f4ecd6');
    o += P(up, c.cel(sk), 1.8) + F(pd([[x - 28, y - 16], [x - 26, y - 12], [x - 24, y - 15.6], [x - 21, y - 11.6], [x - 19, y - 15.2], [x - 16, y - 12], [x - 14, y - 14.6]], true), '#f4ecd6');
    o += glowEye(c, x - 14, y - 22, 1.6, '#ffd040') + L('M' + pt([x - 19, y - 25]) + 'L' + pt([x - 10, y - 24]), OL, 1.6);
    // collar
    o += L('M' + pt([x - 6, y - 24]) + 'L' + pt([x - 4, y - 8]), OL, 5) + L('M' + pt([x - 6, y - 24]) + 'L' + pt([x - 4, y - 8]), '#6a4a2a', 3) + C(x - 5, y - 16, 2.4, c.cel('#8a8e96'), 1);
    return o;
  }
  function mechLeg(c, hip, knee, foot, col, w) { return limb(pd([hip, knee]), col, w) + limb(pd([knee, foot]), dk(col, 0.08), w - 2) + L(pd([hip, knee]), lt(col, 0.3), 1, 0.6); }
  function joint(c, p, r, col) { return C(p[0], p[1], r, c.cel(col || BRASS), 1.6) + C(p[0], p[1], r * 0.35, OL); }
  function accordion(c, a, b, w, col) {
    var d = pd([a, b]), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / l, py = dx / l, rg = '';
    for (var t = 0.15; t < 0.95; t += 0.16) { var x = a[0] + dx * t, y = a[1] + dy * t; rg += 'M' + pt([x + px * w * 0.55, y + py * w * 0.55]) + 'L' + pt([x - px * w * 0.55, y - py * w * 0.55]); }
    return L(d, OL, w + 4) + L(d, col, w) + L(rg, dk(col, 0.45), 1.8);
  }
  function fist(c, x, y, r, col) {
    var q = function (u, v) { return pt([x + r * u, y + r * v]); };
    var o = R(x + r * 0.45, y - r * 0.55, r * 0.75, r * 1.1, c.cel(dk(col, 0.25)), 2, 2) + L('M' + q(0.7, -0.55) + 'L' + q(0.7, 0.55), OL, 1.4);
    var d = 'M' + q(-0.9, -0.2) + 'C' + q(-1.05, -0.95) + ' ' + q(-0.3, -1.05) + ' ' + q(0.2, -0.95) + 'C' + q(0.8, -0.85) + ' ' + q(0.85, 0.7) + ' ' + q(0.4, 0.9) + 'C' + q(-0.2, 1.05) + ' ' + q(-0.95, 0.8) + ' ' + q(-0.9, -0.2) + 'Z';
    var gr = '';
    for (var i = 1; i <= 3; i++) { var v = -0.62 + i * 0.36; gr += 'M' + q(-1.0, v) + 'C' + q(-0.7, v + 0.08) + ' ' + q(-0.45, v + 0.06) + ' ' + q(-0.2, v - 0.02); }
    o += body(c, d, col, F(pd([[x + r * 0.15, y - r * 1.2], [x + r * 1.2, y - r * 1.2], [x + r * 1.2, y + r * 1.2], [x - r * 0.1, y + r * 1.2]], true), dk(col, 0.3), 0.6) + L(gr, OL, 1.6) + E(x - r * 0.3, y - r * 0.7, r * 0.3, r * 0.14, lt(col, 0.45), 0, 0.8), 2.4);
    // thumb folded across the curled fingers
    o += body(c, 'M' + q(0.15, 0.2) + 'C' + q(-0.3, 0.05) + ' ' + q(-0.75, 0.2) + ' ' + q(-0.72, 0.5) + 'C' + q(-0.68, 0.78) + ' ' + q(-0.2, 0.75) + ' ' + q(0.25, 0.55) + 'Z', lt(col, 0.08), E(x - r * 0.45, y + r * 0.35, r * 0.16, r * 0.08, lt(col, 0.5), 0, 0.8), 1.8);
    // brass knuckle-duster plate
    var kd = 'M' + q(-0.72, -0.86) + 'C' + q(-1.02, -0.6) + ' ' + q(-1.04, -0.1) + ' ' + q(-0.94, 0.12);
    return o + L(kd, OL, 5.4) + L(kd, BRASS, 3) + rivets([[x - r * 0.84, y - r * 0.62], [x - r * 0.96, y - r * 0.24]], 1.2, '#f4e0a0', 0.6) + rivetLine(x + r * 0.3, y - r * 0.55, x + r * 0.3, y + r * 0.3, 3, 1.2, '#e8d8a8', 0.6);
  }
  function stack(c, a, b, w) { return pipe([a, b], w, '#3a3e46') + R(b[0] - w * 0.8, b[1] - 3, w * 1.6, 5, c.cel(IRON), 1.4); }
  function gnomePilot(c, x, y) {
    var sk = '#f2c4a4', hr = '#f2f0e8', o = '';
    // hair shock behind the head
    o += P(shag(x + 7, y - 4, 14, 11, 7, 0.4, 91, 0.3), c.cel(hr), 1.8);
    // long ear swept back
    o += P('M' + pt([x + 7, y + 1]) + 'L' + pt([x + 22, y - 9]) + 'L' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 1.6) + F(pd([[x + 10, y + 1], [x + 18, y - 5], [x + 11, y + 4]], true), '#d88a7a', 0.8);
    o += body(c, ellD(x, y, 10, 10.5), sk, F(pd([[x + 3, y - 12], [x + 12, y - 12], [x + 12, y + 12], [x + 2, y + 12]], true), dk(sk, 0.2), 0.7), 2);
    // manic grin
    o += P('M' + pt([x - 11, y + 4]) + 'Q' + pt([x - 4, y + 12]) + ' ' + pt([x + 3, y + 5]) + 'Z', '#3a1010', 1.4) + F('M' + pt([x - 9.6, y + 4.8]) + 'Q' + pt([x - 4, y + 7]) + ' ' + pt([x + 1.6, y + 5.4]) + 'L' + pt([x + 1, y + 7]) + 'Q' + pt([x - 4, y + 8.6]) + ' ' + pt([x - 8.6, y + 6.4]) + 'Z', '#ffffff');
    o += E(x - 11, y + 0.5, 4.4, 3.6, c.cel(mix(sk, '#d86a5a', 0.3)), 1.6);
    // goggles pushed on the eyes, green lenses
    o += L('M' + pt([x - 8, y - 5]) + 'L' + pt([x + 10, y - 7]), OL, 3.4) + L('M' + pt([x - 8, y - 5]) + 'L' + pt([x + 10, y - 7]), '#5a3a24', 1.8);
    o += C(x - 7, y - 4, 4.6, c.cel(BRASS), 1.6) + C(x - 7, y - 4, 3, '#b8ff6a', 0.8) + C(x - 8, y - 5, 1, '#ffffff') + C(x + 1, y - 5, 4, c.cel(BRASS), 1.6) + C(x + 1, y - 5, 2.6, '#b8ff6a', 0.8);
    // wild tufts
    o += P(pd([[x - 6, y - 9], [x - 12, y - 18], [x - 2, y - 11], [x, y - 20], [x + 4, y - 11], [x + 12, y - 18], [x + 9, y - 8]], true), c.cel(hr), 1.6);
    o += P(pd([[x - 9, y - 6], [x - 16, y - 10], [x - 10, y - 2]], true), c.cel(hr), 1.2) + L('M' + pt([x - 11, y - 9]) + 'L' + pt([x - 4, y - 9]), OL, 1.8);
    return o;
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    irradiated_pillager: function (c) {
      var sk = '#8e9088';
      return C(64, 76, 58, glow(c, RAD, 0.36)) + trogg(c, {
        skin: sk, rock: '#7a9a5e', eye: '#c8ff50', loin: '#4e4434',
        torsoX: function () { return vein('M58,52 L64,60 L60,68 L68,76 M80,50 L84,62 L90,64 M50,74 L56,82') + C(72, 60, 3, '#6a8a4a', 0, 0.8) + C(86, 72, 2.4, '#6a8a4a', 0, 0.8); },
        top: function (c) { var o = ''; [[64, 38, 4], [76, 36, 5], [88, 44, 4]].forEach(function (g) { o += C(g[0], g[1] - 2, g[2] * 2.4, glow(c, RAD, 0.7)) + P(pd([[g[0] - g[2] * 0.6, g[1] + 2], [g[0], g[1] - g[2] * 1.8], [g[0] + g[2] * 0.6, g[1] + 2]], true), '#b8ff6a', 1.3); }); return o; },
        headX: function (c, hx, hy) { return glowEye(c, hx - 5, hy - 2, 1.8, '#b8ff40') + vein('M' + pt([hx + 2, hy - 12]) + 'L' + pt([hx + 5, hy - 6]) + 'L' + pt([hx + 2, hy - 1])); },
        shins: function () { return vein('M56,100 L54,108 M76,98 L79,106') + C(52, 112, 2, '#b8ff6a', 0, 0.8); },
        weapon: function (c, p) { return troggClub(c, p, 0.95, '#6a5a44') + C(p[0] - 6, p[1] - 40, 3, '#9aff5a', 1); }
      });
    },
    grubbis: function (c) {
      var sk = '#8a7c6a';
      var g = trogg(c, {
        skin: sk, rock: '#6c6a66', eye: '#ffb030', loin: '#6a3a26', shadowR: 40,
        top: function (c) { return gear(c, 88, 54, 11, 8, '#9a7a42', 0.2); },
        crown: function (c, x, y) {
          var d = 'M' + pt([x - 10, y - 9]) + 'L' + pt([x - 13, y - 22]) + 'L' + pt([x - 6, y - 15]) + 'L' + pt([x - 2, y - 26]) + 'L' + pt([x + 3, y - 15]) + 'L' + pt([x + 9, y - 24]) + 'L' + pt([x + 11, y - 13]) + 'L' + pt([x + 13, y - 8]) + 'C' + pt([x + 4, y - 13]) + ' ' + pt([x - 4, y - 13]) + ' ' + pt([x - 10, y - 9]) + 'Z';
          return body(c, d, '#c89a3a', F(pd([[x + 3, y - 28], [x + 16, y - 28], [x + 16, y - 6], [x + 4, y - 10]], true), '#6a4a1a', 0.5) + L('M' + pt([x - 10, y - 12]) + 'C' + pt([x - 3, y - 15]) + ' ' + pt([x + 5, y - 15]) + ' ' + pt([x + 12, y - 11]), '#7a5a22', 1.4), 1.8) +
            C(x - 1, y - 14.5, 5, glow(c, RAD, 0.8)) + P(pd([[x - 3, y - 14], [x - 1, y - 18], [x + 1, y - 14], [x - 1, y - 11]], true), '#b8ff6a', 1) + C(x - 9, y - 12, 1.2, '#e8e0c8') + C(x + 8, y - 11.5, 1.2, '#e8e0c8');
        },
        weapon: function (c, p) { return troggClub(c, p, 1.05, '#5a4030') + rivets([[p[0] - 8, p[1] - 38], [p[0] - 2, p[1] - 44], [p[0] - 4, p[1] - 32]], 1.6, '#b8bcc2', 0.8); },
        tf: at(1.1, 56, 122)
      });
      return g + chomper(c, 100, 122) + L('M' + pt([93.4, 97.2]) + 'C' + pt([98, 104]) + ' ' + pt([92, 106]) + ' ' + pt([95, 106]), OL, 2.6) + L('M' + pt([93.4, 97.2]) + 'C' + pt([98, 104]) + ' ' + pt([92, 106]) + ' ' + pt([95, 106]), '#8a8e96', 1.2);
    },
    mechano_tank: function (c) {
      var hull = '#8a929c', o = shadow(c, 64, 48);
      // exhaust + antenna behind
      o += stack(c, [100, 74], [104, 54], 6) + smoke(104, 50, 0.6, '#6a6a6a', 0.6, 0.8);
      o += limb('M80,50 L88,24', STEELD, 1.6) + C(88, 22, 7, glow(c, WARN, 0.8)) + C(88, 22, 2.4, WARN, 1);
      // treads
      var tr = 'M28,96 L100,96 C108,96 114,102 114,109 C114,116 108,122 100,122 L28,122 C20,122 14,116 14,109 C14,102 20,96 28,96 Z';
      var tt = ''; for (var x = 20; x < 110; x += 6) tt += 'M' + pt([x, 96]) + 'l0,3 M' + pt([x + 3, 122]) + 'l0,-3';
      o += body(c, tr, '#34363c', L(tt, '#1a1a1e', 1.6) + F('M14,114 L114,114 L114,124 L14,124 Z', '#000', 0.3), 2.4);
      [[26, 109, 8], [46, 110, 7], [64, 110, 7], [82, 110, 7], [102, 109, 8]].forEach(function (w) { o += C(w[0], w[1], w[2], c.cel('#6a6e76'), 1.8) + C(w[0], w[1], w[2] * 0.4, c.cel(BRASS), 1.2); });
      // fender
      o += P('M10,98 L118,98 L116,90 L14,90 Z', c.cel(BRASS), 2) + rivetLine(18, 94, 110, 94, 9, 1.2, '#f0d890', 0.6);
      // hull
      o += body(c, 'M20,90 L108,90 L100,66 L32,66 Z', hull, F('M78,64 L112,64 L112,92 L90,92 Z', dk(hull, 0.3), 0.7) + L('M44,70 L40,88 M88,70 L92,88', dk(hull, 0.35), 1.4) + rivetLine(30, 70, 100, 70, 8, 1.1, '#e8ecf0', 0.5), 2.4);
      o += hazard(c, 44, 78, 40, 6) + gear(c, 30, 80, 6, 8, '#c8963a', 0.3);
      // turret and gun
      o += pipe([[46, 60], [8, 60]], 7, '#5a616b') + R(3, 55, 9, 10, c.cel(IRON), 1.8) + R(24, 56, 6, 8, c.cel(STEELD), 1.4);
      o += body(c, 'M40,68 C40,44 94,42 94,68 Z', '#a8b0b8', F('M72,40 L98,40 L98,70 L76,70 C80,58 78,48 72,40 Z', '#5a616b', 0.6) + E(58, 52, 8, 3, '#ffffff', 0, 0.4), 2.4);
      o += R(38, 64, 58, 5, c.cel(STEELD), 1.6);
      o += C(52, 58, 9, glow(c, WARN, 0.9)) + P('M44,55 L60,53 L60,61 L44,62 Z', '#2a0a0a', 1.6) + E(51, 57.6, 4.6, 2.2, '#ff5a3a') + C(49.6, 57, 1.2, '#ffffff');
      o += rivetLine(66, 50, 86, 54, 4, 1.2, '#e8ecf0', 0.6) + C(82, 50, 3, c.cel(BRASS), 1.2);
      return o;
    },
    dark_iron_agent: function (c) {
      var lea = '#3a3438', lea2 = '#4a4448';
      return dwarfRig(c, {
        skin: '#6e6a76', hair: '#2e2a2c', band: '#9a2a20', beardLen: 20, shirt: lea, sleeve: lea2, forearm: lea, pants: '#2a2628', glove: '#1e1a1c', belt: '#6a4a2a', buckle: '#c8a040', buckleIn: '#6a4a2a', boots: '#1a1618',
        helm: function (c, x, y) {
          var d = 'M' + pt([x - 14, y - 4]) + 'C' + pt([x - 15, y - 21]) + ' ' + pt([x + 12, y - 23]) + ' ' + pt([x + 16, y - 6]) + 'L' + pt([x + 19, y + 14]) + 'L' + pt([x + 11, y + 18]) + 'L' + pt([x + 10, y + 2]) + 'C' + pt([x + 6, y - 6]) + ' ' + pt([x - 4, y - 9]) + ' ' + pt([x - 14, y - 4]) + 'Z';
          return body(c, d, '#363236', F(pd([[x + 4, y - 26], [x + 22, y - 26], [x + 22, y + 20], [x + 10, y + 20]], true), '#000', 0.4) + L('M' + pt([x - 12, y - 7]) + 'C' + pt([x - 4, y - 11]) + ' ' + pt([x + 6, y - 9]) + ' ' + pt([x + 10, y + 1]), '#4a4446', 1.2), 2) +
            P('M' + pt([x - 17, y - 6.5]) + 'L' + pt([x + 9, y - 8]) + 'L' + pt([x + 9, y - 1.5]) + 'L' + pt([x - 16, y - 0.5]) + 'Z', '#141012', 1.4) + P('M' + pt([x + 9, y - 7]) + 'L' + pt([x + 18, y - 10]) + 'L' + pt([x + 16, y - 4]) + 'Z', '#8a2a1e', 1.2) + gEye(c, x - 5.6, y - 3.6, 1.5, '#ff8a2a');
        },
        back: function (c) { return body(c, 'M44,56 L86,54 L100,106 L84,100 L72,110 L60,100 L46,106 Z', '#1e1a1c', F('M84,54 L90,54 L102,106 L96,104 Z', '#7a1e18', 0.9), 2); },
        chest: function (c) {
          var o = L('M84,58 L46,96', OL, 6.4) + L('M84,58 L46,96', '#4a3426', 4.2);
          [[78, 64], [70, 72], [62, 80], [54, 88]].forEach(function (b) { o += minibomb(c, b[0] + 2, b[1] + 2, 3.8); });
          return o + L('M60,56 L56,70 M74,56 L78,70', '#5a5458', 1.2) + P('M76,54 L90,57 L94,78 L88,73 L85,82 L80,62 Z', c.cel('#9a2a20'), 1.6);
        },
        front: function (c) { return minibomb(c, 80, 94, 4.2) + minibomb(c, 48, 94, 3.8); },
        near: [[44, 62], [32, 70], [22, 64]], wNearFront: function (c, p) { return dagger(c, p, PI + 0.55, 22); },
        far: [[84, 62], [94, 76], [94, 88]], wFar: function (c, p) { return bomb(c, p[0] + 1, p[1] + 5, 6.4); }
      });
    },
    viscous_fallout: function (c) {
      var bd = 'M10,120 C4,104 8,86 22,76 C24,58 38,42 54,42 C60,28 76,22 84,34 C98,34 110,50 106,64 C120,74 124,100 118,120 Z';
      var s = C(64, 80, 66, glow(c, RAD, 0.48)) + shadow(c, 64, 54) + P(ellD(64, 119, 58, 5), c.cel('#4ab82a'), 2);
      s += P(bd, c.lg([[0, '#d0ff84'], [0.3, '#90ee40'], [0.31, '#72da2e'], [0.78, '#4cba26'], [0.79, '#3a9a20'], [1, '#2a7a1a']]), 2.6);
      var debris = G(gear(c, 82, 94, 13, 9, '#8a8a78', 0.3) + bone(40, 104, 18, 0.6, 1) + pipe([[90, 60], [102, 74]], 5, '#8a6a4a') + skull(c, 66, 108, 0.7) + P(pd([[52, 80], [58, 77], [63, 80], [63, 86], [58, 89], [52, 86]], true), c.cel('#8a8e96'), 1.4) + C(57.5, 83, 2, '#2a4a1a'), '', 0.75);
      s += '<g clip-path="url(#' + c.clip(bd) + ')">' + debris + F(bd, '#6ae02a', 0.35) + F('M84,20 L130,20 L130,130 L90,130 C104,100 100,60 84,20 Z', '#1e6a12', 0.3) + '</g>';
      s += L('M20,90 C22,74 34,58 48,50 M60,38 C66,30 74,28 80,34', '#f4ffd8', 2.2, 0.8) + E(34, 62, 3, 2, '#ffffff', 0, 0.7);
      s += ring(96, 50, 3.6, '#eaffc0', 1.2) + ring(104, 86, 2.6, '#eaffc0', 1) + ring(28, 100, 2.2, '#eaffc0', 1) + ring(76, 30, 2.2, '#eaffc0', 1);
      // face: two hollow eyes and a drooping mouth, facing left
      s += E(34, 72, 5.4, 6.6, '#1a3a10', 1.2) + E(52, 66, 5, 6.2, '#1a3a10', 1.2) + glowEye(c, 33, 71, 1.8, '#f4ff7a') + glowEye(c, 51, 65, 1.7, '#f4ff7a');
      s += P('M24,90 C32,98 48,98 58,88 C50,92 34,92 24,90 Z', '#1a3a10', 1.4) + P('M34,94 C34,100 38,102 38,96 Z', '#8aee3a', 1);
      // drips and motes
      s += P('M14,118 C14,124 18,126 18,120 Z', '#6ad82a', 1.2) + P('M106,118 C106,125 111,126 110,119 Z', '#6ad82a', 1.2) + motes(71, 14, 8, 120, 6, 50, '#d8ff9a');
      return s;
    },
    electrocutioner_6000: function (c) {
      var bl = '#6a7c98', bd = '#3a465a', s = C(64, 60, 62, glow(c, ZAP, 0.32)) + shadow(c, 64, 32);
      // tesla coils on the back
      [[80, 34, 88, 10], [92, 40, 106, 18]].forEach(function (t) {
        s += limb('M' + pt([t[0], t[1]]) + 'L' + pt([t[2], t[3]]), STEELD, 4);
        var cw = ''; for (var k = 0.25; k < 0.9; k += 0.13) { var x = t[0] + (t[2] - t[0]) * k, y = t[1] + (t[3] - t[1]) * k; cw += 'M' + pt([x - 4, y]) + 'L' + pt([x + 4, y - 1]); }
        s += L(cw, OL, 3.2) + L(cw, COPPER, 1.6) + orb(c, t[2], t[3], 3.4, ZAP);
      });
      s += zap(c, 901, 88, 10, 106, 18, 4, 6, 0.9);
      // far arm
      s += limb('M88,38 L100,58', bd, 7) + limb('M100,58 L102,78', STEELD, 6) + joint(c, [100, 58], 3.6);
      s += L('M102,78 L98,88 M102,78 L108,87', OL, 4.4) + L('M102,78 L98,88 M102,78 L108,87', '#b8c0c8', 2.2) + zap(c, 903, 98, 88, 108, 87, 3, 4, 0.7);
      // legs
      s += mechLeg(c, [72, 80], [78, 98], [76, 114], dk(bl, 0.2), 8) + P('M66,122 L88,122 L86,114 L70,114 Z', c.cel(bd), 1.8);
      s += mechLeg(c, [56, 80], [52, 98], [50, 114], bl, 9) + P('M38,122 L60,122 L58,114 L42,114 Z', c.cel(bd), 1.8);
      s += joint(c, [78, 98], 3.8) + joint(c, [52, 98], 4.4);
      s += P('M48,72 L80,72 L78,84 L50,84 Z', c.cel(bd), 2);
      // torso
      s += body(c, 'M40,30 L90,30 L86,62 L76,74 L52,74 L44,62 Z', bl, F('M70,28 L94,28 L94,76 L74,76 C80,60 78,40 70,28 Z', dk(bl, 0.3), 0.75) + L('M76,40 L86,40 M76,46 L86,46 M76,52 L85,52', OL, 1.6) + rivetLine(44, 34, 86, 34, 7, 1.1, '#dde4ee', 0.5) + L('M46,62 L84,62', dk(bl, 0.4), 1.4), 2.4);
      s += C(60, 48, 16, glow(c, ZAP, 0.85)) + C(60, 48, 8.4, c.cel(STEELD), 2) + C(60, 48, 5.4, c.rg([[0, '#ffffff'], [0.5, '#bfeaff'], [1, '#3a8aff']])) + zap(c, 905, 54, 44, 66, 52, 3, 5, 0.5);
      // neck + head with a visor facing left
      s += R(58, 20, 10, 11, c.cel(STEELD), 1.6);
      s += body(c, 'M48,6 L74,6 C78,6 79,9 78,12 L76,24 L50,24 Z', bl, F('M64,4 L82,4 L82,26 L68,26 Z', dk(bl, 0.3), 0.7), 2.2);
      s += C(56, 14, 11, glow(c, ZAP, 0.8)) + P('M46,11 L64,11 L64,17 L47,18 Z', '#dff6ff', 1.4) + L('M48,14.5 L62,14', '#3a8aff', 1.4);
      s += C(76, 15, 3, c.cel(BRASS), 1.2) + limb('M60,6 L60,1', STEELD, 1.6) + C(60, 1.6, 2, ZAP, 0.8);
      // near arm: an electrode claw thrust forward, arcing
      s += C(90, 34, 8, c.cel(bd), 2) + C(40, 34, 9.4, c.cel(bl), 2.2) + C(40, 34, 3, c.cel(BRASS), 1);
      s += limb('M40,36 L28,54', bl, 7.4) + limb('M28,54 L16,50', STEELD, 6) + joint(c, [28, 54], 4);
      s += L('M16,50 L6,42 M16,50 L6,58', OL, 4.4) + L('M16,50 L6,42 M16,50 L6,58', '#b8c0c8', 2.2) + C(16, 50, 3.4, c.cel(BRASS), 1.2);
      s += C(6, 50, 12, glow(c, ZAP, 0.9)) + zap(c, 907, 6, 42, 6, 58, 3, 6, 0.9) + zap(c, 909, 6, 58, 10, 120, 6, 10, 0.8) + zap(c, 911, 6, 42, 20, 16, 4, 8, 0.7);
      s += spark(30, 110, 3.4) + spark(104, 40, 3) + spark(22, 30, 2.6);
      return s;
    },
    crowd_pummeler: function (c) {
      var rd = '#b8402e', st = '#8a929c', s = shadow(c, 64, 46);
      s += stack(c, [80, 46], [84, 24], 6) + stack(c, [92, 50], [98, 30], 5) + smoke(84, 20, 0.55, '#7a7a7a', 0.6, 0.8) + smoke(98, 26, 0.45, '#7a7a7a', 0.5, 0.8);
      // far arm + fist
      s += accordion(c, [92, 58], [106, 76], 8, STEELD) + fist(c, 106, 88, 13, dk(st, 0.12));
      // legs
      s += limb('M76,94 L78,114', dk(STEELD, 0.1), 12) + P('M68,122 L94,122 L92,112 L70,112 Z', c.cel(IRON), 1.8);
      s += limb('M52,94 L50,114', STEELD, 13) + P('M34,122 L62,122 L60,112 L38,112 Z', c.cel(IRON), 1.8) + joint(c, [51, 104], 3.6) + joint(c, [77, 104], 3.2);
      // barrel body
      s += body(c, 'M30,56 C30,40 98,40 98,56 L100,84 C100,100 28,100 28,84 Z', rd, F('M76,36 L106,36 L106,104 L80,104 C88,80 86,56 76,36 Z', dk(rd, 0.35), 0.7) + R(26, 80, 78, 7, c.cel(STEELD), 1.6) + rivetLine(32, 50, 96, 50, 9, 1.3, '#f0d0a0', 0.6) + rivetLine(32, 92, 96, 92, 9, 1.3, '#f0d0a0', 0.6) +
        L('M80,60 L92,60 M80,66 L92,66 M80,72 L92,72', OL, 2) + hazard(c, 36, 81.5, 36, 4), 2.6);
      s += C(52, 66, 7.4, c.cel('#e8e0c8'), 1.8) + L('M52,66 L48,61', WARN, 1.4) + C(52, 66, 1.4, OL);
      // small domed head with a yellow slit
      s += body(c, 'M48,44 C48,26 80,26 80,44 Z', st, F('M68,24 L84,24 L84,46 L70,46 Z', dk(st, 0.3), 0.7), 2.2) + C(56, 37, 10, glow(c, '#ffd040', 0.8)) + P('M47,34 L64,34 L64,39 L48,40 Z', '#ffe070', 1.3);
      s += limb('M66,28 L68,18', STEELD, 1.6) + C(68, 17, 2.4, c.cel(BRASS), 1);
      // near arm cocked, giant fist forward
      s += C(34, 58, 8, c.cel(STEELD), 2) + accordion(c, [34, 60], [24, 70], 9, STEELD) + fist(c, 20, 72, 17, st);
      return s;
    },
    mekgineer_thermaplugg: function (c) {
      var br = '#b88a3a', stl = '#7a828c', dkS = '#3a3e46', s = shadow(c, 64, 48);
      // smokestacks + radioactive tank on the back
      s += stack(c, [80, 60], [84, 20], 7) + stack(c, [92, 60], [98, 30], 6) + smoke(84, 16, 0.7, '#e8ecef', 0.8, 0.8) + smoke(98, 26, 0.55, '#e8ecef', 0.7, 0.9);
      s += C(106, 64, 16, glow(c, RAD, 0.6)) + R(98, 48, 16, 32, c.cel('#4a5a3a'), 2, 5) + R(102, 54, 8, 20, '#b8ff6a', 1.2, 3) + L('M102,60 L110,60 M102,67 L110,67', '#3a7a1a', 1.2);
      // far claw arm
      s += limb('M96,66 L110,80', dkS, 8) + limb('M110,80 L112,92', dk(stl, 0.2), 7) + joint(c, [110, 80], 3.6);
      s += L('M112,92 L104,102 M112,92 L118,104', OL, 5.4) + L('M112,92 L104,102 M112,92 L118,104', '#b8c0c8', 3);
      // legs
      s += mechLeg(c, [78, 86], [90, 100], [84, 114], dk(stl, 0.25), 13) + P('M70,122 L98,122 L96,113 L74,113 Z', c.cel(dkS), 1.8) + L('M72,122 l-3,-1 M78,122 l-2,-1.5', '#b8c0c8', 1.4);
      s += mechLeg(c, [52, 86], [40, 100], [46, 114], stl, 14) + P('M28,122 L58,122 L56,113 L32,113 Z', c.cel(dkS), 1.8) + L('M30,122 l-3,-1 M36,122 l-2,-1.5', '#b8c0c8', 1.4);
      s += joint(c, [90, 100], 4.6) + joint(c, [40, 100], 5.4) + R(44, 80, 42, 10, c.cel(dkS), 2);
      // the pilot, sitting in the open cockpit
      s += body(c, 'M46,60 L48,44 C50,38 70,38 72,44 L74,60 Z', '#6a3a7a', L('M60,40 L60,60', '#4a2a5a', 1.4), 2);
      s += gnomePilot(c, 56, 30);
      s += limb('M40,58 L36,46', STEELD, 1.8) + C(36, 45, 2.6, WARN, 1) + limb('M50,50 L39,48', '#6a3a7a', 4.4) + C(38, 48, 3.4, c.cel('#f2c4a4'), 1.6);
      // cockpit tub
      s += body(c, 'M26,56 L102,56 L96,90 L34,90 Z', br, F('M76,54 L106,54 L106,92 L84,92 Z', dk(br, 0.35), 0.7) + rivetLine(32, 60, 96, 60, 9, 1.3, '#f4e0a0', 0.6) + L('M30,78 L98,78', dk(br, 0.4), 1.6) + hazard(c, 36, 82, 52, 5), 2.6);
      s += C(48, 70, 6.4, c.cel('#e8e0c8'), 1.8) + L('M48,70 L52,66', WARN, 1.4) + C(48, 70, 1.3, OL) + C(70, 69, 9, glow(c, RAD, 0.7)) + R(64, 63, 13, 11, '#b8ff6a', 1.4, 2) + C(86, 68, 2.4, WARN, 1) + C(86, 74, 2.4, RAD, 1);
      // near arm: shoulder cannon-drill
      s += C(30, 64, 11, c.cel(stl), 2.2) + C(30, 64, 4, c.cel(br), 1.2) + limb('M30,66 L18,78', dkS, 10) + R(10, 70, 12, 16, c.cel(br), 2, 2);
      s += body(c, 'M12,70 L12,86 L-1,78 Z', '#c8ccd4', L('M10,72 L4,82 M10,78 L6,84 M9,70.6 L2,78', '#6a6e76', 1.2), 2);
      return G(s, at(1.04, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#6a7a6a'), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, '#2a2e34') + ground(c, 124, '#50565e', '#2a2e34'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#6a7a5a"/></svg>'; }
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
