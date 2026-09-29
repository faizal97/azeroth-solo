/* art_wetlands.js — Greenfen zone art for Realm of Loner (Accord, levels 25-30: Gullhaven, Reedgill Marsh,
 * Torvald's Dig, Seawrack Glen, Kaldhelm, the Wyrmchain Camp under Drakestone Hold).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Greenfen keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped and murloc rigs and the house-style scene pieces are shared copies of art_ashenvale.js; the gnoll,
 * orc head, dwarf head and whelp rigs are shared copies of art_redridge.js; the raptor is adapted from art_barrens.js.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix wl<counter>_).
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
  function Ctx() { this.p = 'wl' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  // ---- mireling (marsh newt: frilled collar, round eyes on top of the head, long tail, webbed hands and feet; facing left, shared with the other zone packs) ----
  function tube(pts, w, col, sh) {
    var d = pd(pts);
    return L(d, OL, w + 4.5) + L(d, col, w) + (sh ? '<path transform="translate(' + n(w * 0.24) + ',' + n(w * 0.08) + ')" d="' + d + '" fill="none" stroke="' + sh + '" stroke-width="' + n(w * 0.36) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>' : '');
  }
  function mireling(c, o) {
    var f = o.skin, fd = dk(f, 0.28), fin = o.fin, bel = o.belly, out = '';
    // webbed foot: three splayed toes joined by webbing, heel to the right
    var wfoot = function (x, y, col) {
      return P('M' + pt([x + 5, y - 5]) + 'L' + pt([x - 3, y - 5]) + 'L' + pt([x - 13, y + 0.5]) + 'Q' + pt([x - 9.5, y - 1]) + ' ' + pt([x - 7.5, y + 1.6]) + 'Q' + pt([x - 5, y - 0.6]) + ' ' + pt([x - 1.5, y + 1.8]) + 'Q' + pt([x + 1.5, y - 0.2]) + ' ' + pt([x + 6, y + 1.2]) + 'Z', c.cel(col), 1.8) +
        C(x - 13, y + 0.2, 1.3, lt(col, 0.2), 0.9) + C(x - 7.5, y + 1.4, 1.2, lt(col, 0.2), 0.9) + C(x - 1.5, y + 1.6, 1.2, lt(col, 0.2), 0.9);
    };
    out += shadow(c, 66, 38);
    if (o.back) out += o.back(c);
    // far leg and foot
    out += tube([[72, 98], [82, 108], [78, 117]], 6.5, fd) + wfoot(80, 121, dk(fin, 0.25));
    // long tail sweeping back along the ground, tip curling up, bright belly stripe underneath
    var td = 'M80,84 C90,96 98,110 110,113 C116,114.5 120,111 119,105 C123,107 125,113 121,118 C116,123 104,122 94,118 C84,114 76,108 68,100 Z';
    out += body(c, td, f, F('M68,100 C78,108 88,116 100,119 C110,121 118,120 122,114 L126,124 L60,124 Z', fin, 0.95) + C(96, 106, 1.8, fd, 0, 0.6) + C(106, 111, 1.5, fd, 0, 0.6) + C(88, 100, 2, fd, 0, 0.6), 2.2);
    // far arm
    out += tube([[68, 66], [78, 78], [74, 88]], 5, fd) + P('M74,86 L80,90 L77,92 L80,96 L74,95 L72,98 L70,91 Z', c.cel(fd), 1.6);
    // upright torso with a pale belly
    var bd = 'M46,58 C58,52 76,60 80,76 C84,92 78,106 64,108 C52,110 42,102 41,88 C40,76 41,64 46,58 Z';
    out += body(c, bd, f, F('M40,64 C44,82 50,98 62,108 C50,111 40,104 38,90 Z', bel, 0.9) +
      F('M66,56 L90,56 L90,110 L72,110 C80,96 78,74 66,56 Z', fd, 0.45) + C(70, 70, 2.6, fd, 0, 0.7) + C(74, 84, 2.2, fd, 0, 0.7) + C(64, 94, 2, fd, 0, 0.6) + C(60, 64, 1.8, fd, 0, 0.6) + (o.marks ? o.marks(c) : ''), 2.2);
    // frilled collar around the neck and the sides of the head
    var cx = 58, cy = 48, R = 17, lobes = [-120, -84, -48, -12, 24, 60, 96], fr = 'M' + pt([cx, cy]), rib = '';
    lobes.forEach(function (a, i) {
      var r0 = (a - 17) * Math.PI / 180, r1 = (a + 17) * Math.PI / 180, rm = a * Math.PI / 180, RR = R + (i % 2 ? 1.5 : 3);
      var ca = (a - 19) * Math.PI / 180, cb = (a + 19) * Math.PI / 180;
      fr += 'L' + pt([cx + Math.cos(r0) * R, cy + Math.sin(r0) * R]) + 'C' + pt([cx + Math.cos(ca) * RR * 1.42, cy + Math.sin(ca) * RR * 1.42]) + ' ' + pt([cx + Math.cos(cb) * RR * 1.42, cy + Math.sin(cb) * RR * 1.42]) + ' ' + pt([cx + Math.cos(r1) * R, cy + Math.sin(r1) * R]);
      rib += 'M' + pt([cx + Math.cos(rm) * 7, cy + Math.sin(rm) * 7]) + 'L' + pt([cx + Math.cos(rm) * (RR + 3), cy + Math.sin(rm) * (RR + 3)]);
    });
    fr += 'Z';
    out += body(c, fr, fin, L(rib, dk(fin, 0.35), 1.2) + F('M' + pt([cx, cy]) + 'L' + pt([cx + 40, cy - 10]) + 'L' + pt([cx + 40, cy + 40]) + 'Z', dk(fin, 0.22), 0.7), 2);
    // broad flat newt head, round snout to the left
    var hd = 'M22,49 C21,40 30,34 42,34 C54,34 64,39 65,47 C66,55 58,61 45,61 C32,61 23,57 22,49 Z';
    out += body(c, hd, f, F('M22,51 C28,58 38,61 48,61 C40,57 30,55 22,51 Z', bel, 0.85) + F('M52,32 L70,32 L70,64 L50,64 C58,56 58,42 52,32 Z', fd, 0.4) + C(56, 44, 1.6, fd, 0, 0.6) + C(60, 50, 1.3, fd, 0, 0.6), 2.2);
    // small mouth line and a nostril
    out += L('M24,51 Q32,54.5 42,53', OL, 1.6) + C(25.5, 44.5, 0.9, OL, 0);
    // round eyes sitting on top of the head
    out += C(52, 33, 4.6, c.cel(f), 2) + C(51.4, 32.4, 2.8, c.cel(o.eyeC || '#f6eeb8'), 0) + C(50.6, 32.4, 1.4, '#140c08', 0);
    out += C(38, 34, 5.8, c.cel(f), 2.2) + C(37.2, 33.2, 3.7, c.cel(o.eyeC || '#f6eeb8'), 0) + C(36, 33.4, 1.9, '#140c08', 0) + C(37.3, 31.9, 0.8, '#fff', 0);
    out += L(o.angry ? 'M31,27 L44,31' : 'M32,28.5 Q38,26 44,29', OL, o.angry ? 2.4 : 1.6);
    if (o.head) out += o.head(c);
    if (o.fItem) out += o.fItem(c);
    // near arm and webbed hand
    out += tube([[52, 68], [44, 80], [34, 90]], 5.5, f, fd);
    out += P('M36,87 L27,85 L28.5,89 L22,91 L28,93.5 L25,98 L35,96 Z', c.cel(lt(f, 0.1)), 1.8) + L('M28.5,89 L33,90.5 M28,93.5 L33,93', dk(f, 0.3), 0.9);
    if (o.front) out += o.front(c);
    // near leg: bent thigh, shin, webbed foot
    out += P('M48,96 C54,88 70,92 70,102 C70,110 62,113 56,111 Z', c.cel(f), 2.2) + tube([[58, 106], [52, 114], [52, 118]], 6.5, f, fd) + wfoot(50, 121, fin);
    return G(out, at(o.scale || 1, 62, 123));
  }
  // ---- shared copies of art_redridge.js pieces (gnoll head, orc head, dwarf head, axe, shackle, mail, hammer, whelp) ----
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function gnollHeadR(c, X, Y, r, o) {
    var f = o.skin, fd = dk(f, 0.3), out = '';
    out += P(pd([[X - r * 0.1, Y - r * 0.95], [X - r * 0.95, Y - r * 0.85], [X - r * 0.75, Y - r * 0.45], [X - r * 1.6, Y - r * 0.15], [X - r * 1.05, Y + r * 0.2], [X - r * 1.7, Y + r * 0.7], [X - r * 0.95, Y + r * 0.9], [X - r * 1.35, Y + r * 1.55], [X - r * 0.3, Y + r * 1.2]], true), c.cel(o.mane || dk(f, 0.45)), 2);
    out += P(pd([[X - r * 0.1, Y - r * 0.7], [X + r * 0.1, Y - r * 1.9], [X + r * 0.55, Y - r * 0.7]], true), fd, 2);
    out += P('M' + pt([X - r, Y + r * 0.1]) + 'C' + pt([X - r, Y - r * 1.1]) + ' ' + pt([X + r * 0.3, Y - r * 1.2]) + ' ' + pt([X + r * 0.75, Y - r * 0.55]) + 'L' + pt([X + r * 1.9, Y - r * 0.15]) + 'C' + pt([X + r * 2.25, Y - r * 0.05]) + ' ' + pt([X + r * 2.3, Y + r * 0.35]) + ' ' + pt([X + r * 2.0, Y + r * 0.5]) + 'L' + pt([X + r * 0.9, Y + r * 0.62]) + 'C' + pt([X + r * 0.4, Y + r * 1.1]) + ' ' + pt([X - r * 0.6, Y + r * 1.05]) + ' ' + pt([X - r, Y + r * 0.1]) + 'Z', c.cel(f), 2.5);
    out += F('M' + pt([X + r * 1.35, Y - r * 0.3]) + 'L' + pt([X + r * 1.9, Y - r * 0.15]) + 'C' + pt([X + r * 2.25, Y - r * 0.05]) + ' ' + pt([X + r * 2.3, Y + r * 0.35]) + ' ' + pt([X + r * 2.0, Y + r * 0.5]) + 'L' + pt([X + r * 1.35, Y + r * 0.56]) + 'Z', dk(f, 0.55), 0.55);
    out += P('M' + pt([X + r * 0.7, Y + r * 0.58]) + 'L' + pt([X + r * 1.85, Y + r * 0.55]) + 'C' + pt([X + r * 1.75, Y + r * 0.98]) + ' ' + pt([X + r * 1.2, Y + r * 1.12]) + ' ' + pt([X + r * 0.55, Y + r * 0.98]) + 'Z', dk(f, 0.2), 2);
    out += F('M' + pt([X + r * 0.95, Y + r * 0.6]) + 'l1.5,2.6 l1.5,-2.6 z M' + pt([X + r * 1.45, Y + r * 0.58]) + 'l1.4,2.4 l1.4,-2.4 z', '#f4ecd6');
    out += E(X + r * 2.1, Y + r * 0.02, 2.5, 2.1, '#140c08', 0);
    out += C(X - r * 0.35, Y - r * 0.35, 1.6, dk(f, 0.45), 0, 0.7) + C(X - r * 0.1, Y + r * 0.5, 1.4, dk(f, 0.45), 0, 0.7) + C(X + r * 0.8, Y - r * 0.55, 1.2, dk(f, 0.45), 0, 0.6);
    out += P('M' + pt([X + r * 0.2, Y - r * 0.4]) + 'Q' + pt([X + r * 0.6, Y - r * 0.62]) + ' ' + pt([X + r * 0.95, Y - r * 0.35]) + 'Q' + pt([X + r * 0.6, Y - r * 0.1]) + ' ' + pt([X + r * 0.2, Y - r * 0.4]) + 'Z', o.eyeC || '#f5c02a', 1.2) + C(X + r * 0.66, Y - r * 0.37, 1.1, '#140c08', 0);
    out += L('M' + pt([X + r * 0.05, Y - r * 0.78]) + 'L' + pt([X + r * 1.05, Y - r * 0.45]), OL, 2.2);
    out += P(pd([[X - r * 0.8, Y - r * 0.5], [X - r * 0.62, Y - r * 2.0], [X + r * 0.02, Y - r * 0.72]], true), f, 2) + F(pd([[X - r * 0.6, Y - r * 0.8], [X - r * 0.58, Y - r * 1.6], [X - r * 0.25, Y - r * 0.85]], true), '#8a4a44', 0.8);
    return out;
  }
  function gnollHead(c, X, Y, r, o) { return G(gnollHeadR(c, X, Y, r, o), 'matrix(-1,0,0,1,' + n(2 * X) + ',0)'); }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
  function orcHead(c, x, y, o) {
    var sk = o.skin || '#6a8a3a', s = '';
    s += P('M' + pt([x + 8, y - 2]) + 'L' + pt([x + 20, y - 9]) + 'L' + pt([x + 12, y + 5]) + 'Z', c.cel(sk), 2);
    var d = 'M' + pt([x - 11, y - 7]) + 'C' + pt([x - 11, y - 17]) + ' ' + pt([x + 10, y - 19]) + ' ' + pt([x + 12, y - 7]) + 'L' + pt([x + 12, y + 6]) + 'C' + pt([x + 10, y + 14]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 6, y + 15]) + 'L' + pt([x - 14, y + 12]) + 'C' + pt([x - 16, y + 7]) + ' ' + pt([x - 15, y + 3]) + ' ' + pt([x - 14, y]) + 'L' + pt([x - 16, y - 1]) + 'L' + pt([x - 12, y - 4]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.25), 0.8));
    s += L('M' + pt([x - 14, y - 4]) + 'L' + pt([x - 1, y - 2]), OL, 2.6);
    s += C(x - 7, y + 0.5, 1.7, o.eye || '#ffcc30', 1);
    s += L('M' + pt([x - 13, y + 9]) + 'L' + pt([x - 3, y + 9]), OL, 1.4);
    s += P('M' + pt([x - 12, y + 10]) + 'L' + pt([x - 13, y + 3]) + 'L' + pt([x - 9, y + 9]) + 'Z', '#f4ecd6', 1.1) + P('M' + pt([x - 6, y + 10]) + 'L' + pt([x - 6.5, y + 4]) + 'L' + pt([x - 3, y + 9]) + 'Z', '#f4ecd6', 1.1);
    if (!o.hood) {
      if (o.bald) s += E(x + 4, y - 15, 4, 3, dk(sk, 0.2), 0, 0.6);
      else s += P('M' + pt([x - 2, y - 16]) + 'C' + pt([x + 2, y - 26]) + ' ' + pt([x + 12, y - 24]) + ' ' + pt([x + 10, y - 14]) + 'Z', '#1e1812', 2) +
        P('M' + pt([x + 9, y - 18]) + 'C' + pt([x + 20, y - 16]) + ' ' + pt([x + 24, y - 4]) + ' ' + pt([x + 20, y + 8]) + 'C' + pt([x + 18, y - 2]) + ' ' + pt([x + 14, y - 10]) + ' ' + pt([x + 8, y - 12]) + 'Z', '#1e1812', 2) +
        L('M' + pt([x + 1, y - 19]) + 'L' + pt([x + 10, y - 19]), '#c8a040', 2);
    }
    return s;
  }
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
  function shackle(c, p, chainLen, ang) {
    var o = R(p[0] - 5, p[1] - 3.5, 10, 7, c.cel('#6a6e76'), 1.6) + C(p[0], p[1] + 3.5, 1.4, '#3a3c40');
    if (chainLen) {
      var a = ang == null ? PI / 2 : ang, x = p[0], y = p[1] + 4;
      for (var i = 0; i < chainLen; i++) { var cx = x + Math.cos(a) * (i * 5 + 3), cy = y + Math.sin(a) * (i * 5 + 3); o += '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + (i % 2 ? 1.4 : 3) + '" ry="3" transform="rotate(' + n(a * 180 / PI - 90) + ',' + n(cx) + ',' + n(cy) + ')" fill="none" stroke="' + OL + '" stroke-width="3.4"/>' + '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + (i % 2 ? 1.4 : 3) + '" ry="3" transform="rotate(' + n(a * 180 / PI - 90) + ',' + n(cx) + ',' + n(cy) + ')" fill="none" stroke="#8a8e96" stroke-width="1.5"/>'; }
    }
    return o;
  }
  function mail(x0, y0, x1, y1, col) {
    var d = '';
    for (var y = y0; y < y1; y += 4) for (var x = x0 + ((y - y0) / 4 % 2) * 2; x < x1; x += 4) d += 'M' + pt([x, y]) + 'q2,2.6 4,0';
    return L(d, col, 0.9, 0.8);
  }
  function hammer(c, p, len, ang, hw, col) {
    var q = dirQ(p, ang), o = haft(c, p, len + 3, ang, '#5a3a24', 3.6);
    o += P(pd([q(len - hw * 0.6, -hw), q(len + hw * 0.6, -hw), q(len + hw * 0.6, hw * 0.7), q(len - hw * 0.6, hw * 0.7)], true), c.cel(col || '#8a8e96'), 2) + L('M' + pt(q(len - hw * 0.6, -hw * 0.3)) + 'L' + pt(q(len + hw * 0.6, -hw * 0.3)), dk(col || '#8a8e96', 0.35), 1.2);
    return o + P(pd([q(len - 2, -hw), q(len, -hw - 5), q(len + 2, -hw)], true), c.cel('#b8bcc0'), 1.1);
  }
  function whelp(c, o) {
    var sc = o.col || '#2a2428', sc2 = lt(sc, 0.14), bel = o.belly || '#e0641e', mem = o.mem || '#b0401e', s = shadow(c, 66, 34);
    // far wing, raised
    var fw = 'M70,58 C74,40 84,22 100,10 L104,26 L114,20 L112,36 L124,34 L114,50 L120,54 L100,60 C90,62 80,64 74,68 Z';
    s += body(c, fw, dk(sc, 0.05), F('M76,62 C86,48 96,34 104,24 L110,34 C100,44 92,52 86,60 Z', mem, 0.85) + F('M88,62 C98,52 108,44 114,38 L116,48 C108,54 100,58 94,62 Z', dk(mem, 0.15), 0.85) + L('M72,62 L102,14 M78,64 L112,24 M86,64 L122,36', OL, 1.4), 2.2);
    // tail curling back
    s += L('M92,90 C108,96 118,90 120,78 C122,70 116,66 112,72', OL, 10) + L('M92,90 C108,96 118,90 120,78 C122,70 116,66 112,72', sc, 5.6) + P('M110,72 L106,62 L116,68 Z', c.cel(mem), 1.3);
    // far legs
    s += limb('M84,92 L90,106 L86,116', dk(sc, 0.1), 8) + P('M78,116 L92,116 L94,122 L76,122 Z', c.cel(dk(sc, 0.1)), 1.6) + L('M78,122 l-3,-1 M84,122 l-2,-1', '#e8e0c8', 1.2);
    var bd = 'M40,78 C42,62 60,56 80,60 C96,64 100,80 94,92 C88,102 70,104 56,100 C44,96 38,88 40,78 Z';
    var scales = '';
    for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) scales += 'M' + pt([58 + i * 9 + (j % 2) * 4, 66 + j * 7]) + 'q3,3 6,0';
    s += body(c, bd, sc, L(scales, sc2, 1.1, 0.8) + F('M42,84 C50,100 72,104 90,94 C80,92 64,92 50,84 Z', bel) + L('M50,90 q4,3 8,2 M60,94 q5,2 10,1 M72,95 q5,1 10,-2', dk(bel, 0.35), 1) + F('M78,56 C94,62 102,78 96,96 L106,96 L106,56 Z', dk(sc, 0.4), 0.85));
    // neck + head
    s += body(c, 'M40,78 C34,70 32,60 34,52 L48,50 C48,58 50,66 56,72 Z', sc, F('M36,64 C38,72 42,78 46,80 L40,82 C36,76 34,70 34,64 Z', bel, 0.95), 2.2);
    if (o.neckX) s += o.neckX(c);
    var hx = 30, hy = 46;
    s += P('M' + pt([hx + 6, hy - 8]) + 'C' + pt([hx + 12, hy - 16]) + ' ' + pt([hx + 20, hy - 20]) + ' ' + pt([hx + 26, hy - 20]) + 'C' + pt([hx + 20, hy - 16]) + ' ' + pt([hx + 16, hy - 10]) + ' ' + pt([hx + 12, hy - 4]) + 'Z', c.cel('#d8ccb0'), 1.5);
    s += P('M' + pt([hx + 2, hy - 9]) + 'C' + pt([hx + 6, hy - 18]) + ' ' + pt([hx + 12, hy - 24]) + ' ' + pt([hx + 18, hy - 26]) + 'C' + pt([hx + 12, hy - 20]) + ' ' + pt([hx + 10, hy - 14]) + ' ' + pt([hx + 8, hy - 7]) + 'Z', c.cel('#ece2c8'), 1.5);
    var hd = 'M' + pt([hx + 12, hy - 4]) + 'C' + pt([hx + 12, hy - 12]) + ' ' + pt([hx, hy - 14]) + ' ' + pt([hx - 6, hy - 10]) + 'L' + pt([hx - 20, hy - 5]) + 'C' + pt([hx - 24, hy - 3]) + ' ' + pt([hx - 24, hy + 4]) + ' ' + pt([hx - 20, hy + 5]) + 'L' + pt([hx - 4, hy + 8]) + 'C' + pt([hx + 4, hy + 10]) + ' ' + pt([hx + 12, hy + 6]) + ' ' + pt([hx + 12, hy - 4]) + 'Z';
    s += body(c, hd, sc, F('M' + pt([hx - 24, hy + 1]) + 'L' + pt([hx + 14, hy]) + 'L' + pt([hx + 14, hy + 12]) + 'L' + pt([hx - 24, hy + 12]) + 'Z', dk(sc, 0.3), 0.7) + L('M' + pt([hx - 18, hy - 5]) + 'L' + pt([hx - 4, hy - 9]), sc2, 1.2, 0.8), 2.2);
    s += L('M' + pt([hx - 22, hy + 2]) + 'L' + pt([hx - 6, hy + 4]), OL, 1.4) + P(pd([[hx - 18, hy + 2.5], [hx - 17, hy + 6], [hx - 15.5, hy + 2.8]], true), '#f4ecd6', 0.8) + P(pd([[hx - 11, hy + 3.2], [hx - 10, hy + 6.6], [hx - 8.5, hy + 3.5]], true), '#f4ecd6', 0.8);
    s += C(hx - 21, hy - 2, 0.9, OL) + glowEye(c, hx - 8, hy - 4, 2, o.eye || '#ffc030') + L('M' + pt([hx - 13, hy - 8]) + 'L' + pt([hx - 3, hy - 8]), OL, 2);
    s += P(pd([[hx - 2, hy - 12], [hx + 2, hy - 18], [hx + 4, hy - 11]], true), c.cel(sc2), 1) + P(pd([[hx + 6, hy - 11], [hx + 10, hy - 16], [hx + 11, hy - 8]], true), c.cel(sc2), 1);
    // near legs
    s += limb('M52,92 L46,106 L50,116', sc, 8.4) + P('M38,116 L54,116 L56,122 L34,122 Z', c.cel(sc), 1.6) + L('M34,122 l-3,-1 M40,122 l-2,-1.5 M46,122 l-1,-1.5', '#e8e0c8', 1.2);
    s += limb('M70,96 L74,108 L70,116', sc, 8) + P('M62,116 L76,116 L78,122 L58,122 Z', c.cel(sc), 1.6) + L('M58,122 l-3,-1 M64,122 l-2,-1.5', '#e8e0c8', 1.2);
    // near wing, raised and spread forward-up
    var nw = 'M58,64 C50,46 44,26 50,8 L58,22 L64,10 L68,26 L78,16 L78,34 L88,30 L82,46 C76,54 68,60 64,70 Z';
    s += body(c, nw, sc, F('M58,60 C52,44 50,30 52,16 L58,26 C58,38 60,48 62,56 Z', mem, 0.9) + F('M64,56 C64,44 66,32 70,24 L76,32 C72,40 70,48 68,58 Z', lt(mem, 0.08), 0.9) + F('M70,58 C72,50 78,42 84,36 L84,44 C78,50 74,56 72,62 Z', dk(mem, 0.1), 0.9) + L('M60,66 L50,10 M64,64 L64,12 M66,64 L78,18 M70,64 L86,32', OL, 1.4), 2.2);
    // spine ridge
    s += P('M50,58 L54,50 L58,58 L62,52 L66,60 Z', c.cel(mem), 1.2);
    return G(s, at(o.scale || 1, 64, 122));
  }
  // ---- bird foot (shared copy of art_barrens.js) ----
  function birdFoot(x, y, col, big) {
    var k = big ? 1.25 : 1;
    return L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), OL, 5) + L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), col, 2.2);
  }
  // ---- more shared copies of art_redridge.js (feathers, spear, rags, Stoneharrow-style gnoll rig, bone necklace, pelt hood) ----
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

  // ---- Stoneharrow gnoll (hunched, digitigrade, same head family as the Tallgrass) ----
  function rrGnoll(c, o) {
    var fur = o.fur, mane = o.mane, spot = o.spot || dk(fur, 0.38);
    var head = function (c, x, y) {
      var s = gnollHead(c, x, y, 12, { skin: fur, mane: mane, eyeC: o.eye || '#ffd03a' });
      if (o.glowEye) s += glowEye(c, x - 7.9, y - 4.4, 1.9, o.glowEye);
      return s + (o.headX ? o.headX(c, x, y) : '');
    };
    return biped(c, {
      skin: fur, shirt: dk(fur, 0.04), pants: o.pants || dk(fur, 0.12), sleeve: fur, glove: fur, boots: dk(fur, 0.3), feet: toes2, digi: true,
      legW: o.legW || 11, armW: o.armW || 10.5, hipY: 88, shadowR: o.shadowR || 34, belt: o.belt, buckle: '#e8dcc0', neck: false,
      torsoD: o.torsoD || 'M38,60 C40,46 70,40 86,50 L90,70 L84,92 L50,92 L42,76 Z',
      back: function (c) { return (o.back ? o.back(c) : '') + P('M56,46 L62,32 L68,44 L76,32 L80,46 L90,40 L90,54 C80,48 68,44 56,48 Z', c.cel(mane), 1.8); },
      chest: function (c) {
        var sp = E(60, 60, 3.4, 2.4, spot, 0, 0.8) + E(72, 70, 3, 2.2, spot, 0, 0.8) + E(54, 76, 2.6, 2, spot, 0, 0.8) + E(78, 58, 2.4, 2, spot, 0, 0.7) + E(66, 84, 3, 2, spot, 0, 0.7);
        return F('M40,66 C46,62 54,64 58,72 C56,82 50,90 44,90 Z', lt(fur, 0.18), 0.6) + sp + (o.chest ? o.chest(c) : '');
      },
      shins: function () { return E(74, 102, 2.4, 1.8, spot, 0, 0.8) + E(60, 100, 2.6, 2, spot, 0, 0.8) + E(56, 108, 2, 1.6, spot, 0, 0.8) + E(72, 110, 2, 1.6, spot, 0, 0.7); },
      front: function (c) { return body(c, 'M50,90 L82,90 L80,106' + rag(80, 52, 106, 6, 5).replace(/^L/, ' L') + ' Z', o.loin || '#6a4a2e', L('M52,94 L80,94', dk(o.loin || '#6a4a2e', 0.4), 1.2), 1.8) + (o.front ? o.front(c) : ''); },
      pads: o.pads, head: head, hx: 44, hy: 38,
      near: o.near || [[48, 60], [38, 74], [30, 86]], far: o.far || [[84, 58], [94, 72], [94, 88]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, top: o.top, tf: o.tf, nearHand: o.nearHand, farHand: o.farHand
    });
  }
  function boneNecklace(c, x, y, w) {
    var s = L('M' + pt([x - w, y - 3]) + 'Q' + pt([x, y + 8]) + ' ' + pt([x + w, y - 4]), '#3a2a1a', 1.4);
    for (var i = -3; i <= 3; i++) { var bx = x + i * w / 3.6, by = y + 3 - Math.abs(i) * 1.6; s += P(pd([[bx - 1.6, by], [bx, by + 7 - Math.abs(i) * 0.6], [bx + 1.6, by]], true), '#f4ecd6', 1); }
    return s + skull(_cur, x, y + 6, 0.55);
  }
  // pelt hood draped over a gnoll head (x, y = head centre), with its own pelt ears
  function peltHood(c, x, y, col) {
    var d = 'M' + pt([x - 14, y - 8]) + 'C' + pt([x - 15, y - 20]) + ' ' + pt([x - 2, y - 24]) + ' ' + pt([x + 10, y - 20]) + 'C' + pt([x + 22, y - 18]) + ' ' + pt([x + 26, y - 4]) + ' ' + pt([x + 24, y + 12]) + 'L' + pt([x + 32, y + 26]) + 'L' + pt([x + 20, y + 24]) + 'L' + pt([x + 14, y + 8]) + 'C' + pt([x + 10, y - 6]) + ' ' + pt([x, y - 13]) + ' ' + pt([x - 14, y - 8]) + 'Z';
    var o = P(pd([[x - 2, y - 18], [x - 4, y - 32], [x + 6, y - 20]], true), c.cel(dk(col, 0.1)), 1.6) + P(pd([[x + 6, y - 20], [x + 10, y - 33], [x + 14, y - 19]], true), c.cel(col), 1.6);
    return o + body(c, d, col, L('M' + pt([x - 8, y - 12]) + 'l3,-2 M' + pt([x + 2, y - 16]) + 'l3,-1 M' + pt([x + 12, y - 12]) + 'l3,1 M' + pt([x + 18, y - 2]) + 'l2,2 M' + pt([x + 20, y + 10]) + 'l3,2', dk(col, 0.35), 1.1) +
      F(pd([[x + 10, y - 24], [x + 34, y - 24], [x + 34, y + 28], [x + 16, y + 28]], true), dk(col, 0.3), 0.7) + L('M' + pt([x - 13, y - 9]) + 'C' + pt([x, y - 13]) + ' ' + pt([x + 10, y - 6]) + ' ' + pt([x + 14, y + 8]), lt(col, 0.3), 1.6, 0.9), 2);
  }


  // ============================================================
  //  WETLANDS PIECES
  // ============================================================
  // ---- lake and far tree line (shared copies of art_ashenvale.js) ----
  // silhouette row of round-crowned trees, no outline
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
  var PINE = '#34503e';
  var MARSH = '#62705a', MUD = '#6a5a44', MUDD = '#3e3428', REED = '#a09a5a', STONE = '#8e8e84', MOSS = '#6e8a3e', MOSSD = '#4a6230',
    SLATE = '#4e5a68', ALLY = '#2a4a8a', GOLD = '#d8b040', EMBER = '#ff7a1a', DMRED = '#a41e18', DMBLK = '#1e1a1c', BONE = '#e0d6bc', LAMP = '#ffc860';
  function wlSky(c, top, mid, bot) { return sky(c, top || '#525c5c', mid || '#7e8a84', bot || '#a8b2a6'); }
  // heavy overcast: a solid band of rain cloud along the top with lumpy, darker undersides
  function overcast(c, seed, y, col, cnt, op) {
    var r = rng(seed), o = '';
    col = col || '#6a7472'; cnt = cnt || 9; op = op || 0.95;
    o += R(-2, -2, 404, y + 2, dk(col, 0.06), 0);
    for (var i = 0; i < cnt; i++) {
      var x = -30 + 460 * (i + r() * 0.6) / cnt, yy = y + r() * 12, rx = 40 + r() * 34, ry = 12 + r() * 9;
      o += E(x, yy, rx, ry, i % 2 ? col : lt(col, 0.05), 0, op) + E(x + rx * 0.12, yy + ry * 0.5, rx * 0.78, ry * 0.42, dk(col, 0.16), 0, op * 0.7);
    }
    return o;
  }
  function rain(seed, cnt, y0, y1, op, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = r() * 430, y = y0 + r() * (y1 - y0), l = 7 + r() * 9; d += 'M' + pt([x, y]) + 'l' + n(-l * 0.26) + ',' + n(l); }
    return L(d, col || '#e4ece8', 0.8, op || 0.4);
  }
  function haze(c, y, h, op, col) { return mist(c, y, h, col || '#c8d0c8', op || 0.3, Math.round(y * 3)); }
  function embers(seed, cnt, x0, x1, y0, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.7 + r() * 0.9, r() < 0.5 ? '#ffb040' : '#ff7a2a', 0, 0.6 + r() * 0.4); return o; }
  // a red dragon far off: wings up, no outline (distance)
  function farDragon(x, y, s, k) {
    k = k || 1;
    var q = function (u, v) { return [x + u * s * k, y + v * s]; };
    return F(pd([q(-15, 2), q(-7, -1), q(-3, -13), q(1, -3), q(7, -15), q(6, -2), q(12, -2), q(16, -5), q(14, 0), q(5, 2), q(-6, 4)], true), '#6e2420', 0.9) +
      F(pd([q(-3, -12), q(1, -3), q(5, -4)], true), '#a8382a', 0.7) + F(pd([q(7, -14), q(6, -3), q(9, -3)], true), '#a8382a', 0.6);
  }
  // Drakestone Hold: a fortress carved into a dark peak, seen far off (no outlines, a few lit slits)
  function grimBatol(c, x, y, s, col) {
    col = col || '#34363c'; var o = '', wl = lt(col, 0.1);
    o += F(pd([[x - 124 * s, y], [x - 80 * s, y - 48 * s], [x - 52 * s, y - 68 * s], [x - 36 * s, y - 100 * s], [x - 14 * s, y - 114 * s], [x + 6 * s, y - 126 * s], [x + 26 * s, y - 108 * s], [x + 54 * s, y - 90 * s], [x + 86 * s, y - 54 * s], [x + 128 * s, y]], true), col);
    o += F(pd([[x + 6 * s, y - 126 * s], [x + 26 * s, y - 108 * s], [x + 54 * s, y - 90 * s], [x + 86 * s, y - 54 * s], [x + 128 * s, y], [x + 12 * s, y], [x + 4 * s, y - 70 * s]], true), dk(col, 0.28), 0.9);
    o += L('M' + pt([x - 36 * s, y - 100 * s]) + 'L' + pt([x - 44 * s, y - 64 * s]) + 'M' + pt([x + 26 * s, y - 108 * s]) + 'L' + pt([x + 30 * s, y - 72 * s]), dk(col, 0.2), 1.4 * s, 0.7);
    // upper keep and its spire
    o += F(pd([[x - 12 * s, y - 60 * s], [x - 12 * s, y - 88 * s], [x - 4 * s, y - 98 * s], [x - 4 * s, y - 108 * s], [x + 2 * s, y - 118 * s], [x + 8 * s, y - 108 * s], [x + 8 * s, y - 98 * s], [x + 16 * s, y - 88 * s], [x + 16 * s, y - 60 * s]], true), wl);
    o += F(pd([[x + 2 * s, y - 118 * s], [x + 8 * s, y - 108 * s], [x + 8 * s, y - 98 * s], [x + 16 * s, y - 88 * s], [x + 16 * s, y - 60 * s], [x + 3 * s, y - 60 * s]], true), dk(wl, 0.25), 0.9);
    // curtain wall with crenels across the face
    var wy = y - 38 * s, wh = 22 * s, cr = '';
    o += F(pd([[x - 74 * s, wy + wh], [x - 74 * s, wy], [x + 76 * s, wy], [x + 76 * s, wy + wh]], true), wl);
    for (var i = -74; i < 74; i += 8) cr += 'M' + pt([x + i * s, wy]) + 'l0,' + n(-4.5 * s) + 'l' + n(4 * s) + ',0l0,' + n(4.5 * s) + 'Z';
    o += F(cr, wl) + F(pd([[x + 10 * s, wy], [x + 76 * s, wy], [x + 76 * s, wy + wh], [x + 10 * s, wy + wh]], true), dk(wl, 0.22), 0.8);
    // twin gate towers, huge dark gate between them, glowing red within
    [-1, 1].forEach(function (k) {
      var tx = x + k * 24 * s;
      o += F(pd([[tx - 10 * s, wy + wh], [tx - 9 * s, wy - 30 * s], [tx + 9 * s, wy - 30 * s], [tx + 10 * s, wy + wh]], true), k < 0 ? lt(wl, 0.06) : dk(wl, 0.12));
      o += F(pd([[tx - 12 * s, wy - 30 * s], [tx, wy - 46 * s], [tx + 12 * s, wy - 30 * s]], true), dk(col, 0.1));
      o += R(tx - 1.3 * s, wy - 22 * s, 2.6 * s, 6 * s, '#e0602a') + R(tx - 1.3 * s, wy - 6 * s, 2.6 * s, 6 * s, '#c84a22');
    });
    o += C(x, wy + wh - 8 * s, 24 * s, glow(c, '#d8401a', 0.45)) + F('M' + pt([x - 11 * s, wy + wh]) + 'L' + pt([x - 11 * s, wy + 2 * s]) + 'Q' + pt([x, wy - 10 * s]) + ' ' + pt([x + 11 * s, wy + 2 * s]) + 'L' + pt([x + 11 * s, wy + wh]) + 'Z', '#120a0a');
    o += F(pd([[x - 7 * s, wy + wh], [x - 7 * s, wy + 6 * s], [x + 7 * s, wy + 6 * s], [x + 7 * s, wy + wh]], true), '#7a1e12', 0.55);
    [[-54, 8], [-40, 8], [44, 8], [58, 8], [-3, -44], [8, -44]].forEach(function (p) { o += R(x + p[0] * s - 1, wy + p[1] * s, 2, 4.4 * s, '#f07a30', 0); });
    return o;
  }
  // ---- marsh ----
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
  // murloc hut on stilts over the water (y = water surface)
  function stiltHut(c, x, y, s, col) {
    col = col || '#8a7c4c'; s = s || 1;
    var py = y - 22 * s, o = '', posts = '';
    o += E(x, y + 5 * s, 34 * s, 4 * s, '#101a14', 0, 0.3);
    [-20, -8, 8, 20].forEach(function (k) { posts += 'M' + pt([x + k * s, py]) + 'L' + pt([x + k * s + (k < 0 ? -1.5 : 1.5) * s, y + 4 * s]); });
    o += L(posts, OL, 5.4 * s) + L(posts, '#5a4028', 3 * s) + L('M' + pt([x - 20 * s, y - 6 * s]) + 'L' + pt([x + 8 * s, y - 16 * s]) + 'M' + pt([x - 8 * s, y - 16 * s]) + 'L' + pt([x + 20 * s, y - 6 * s]), '#3a2a18', 1.6 * s);
    o += L('M' + pt([x - 28 * s, y + 3 * s]) + 'q' + n(6 * s) + ',' + n(-2 * s) + ' ' + n(12 * s) + ',0M' + pt([x + 14 * s, y + 4 * s]) + 'q' + n(6 * s) + ',' + n(-2 * s) + ' ' + n(12 * s) + ',0', '#d8e0d8', 1 * s, 0.6);
    // ladder down to the water
    var lad = 'M' + pt([x - 32 * s, y + 3 * s]) + 'L' + pt([x - 25 * s, py]) + 'M' + pt([x - 25 * s, y + 3 * s]) + 'L' + pt([x - 18 * s, py]);
    for (var j = 1; j < 4; j++) { var t = j / 4; lad += 'M' + pt([x - 32 * s + 7 * s * t, y + 3 * s - (y + 3 * s - py) * t]) + 'l' + n(7 * s) + ',0'; }
    o += L(lad, OL, 3.6 * s) + L(lad, '#7a5a36', 1.6 * s);
    o += P(pd([[x - 30 * s, py], [x + 30 * s, py], [x + 28 * s, py + 5 * s], [x - 28 * s, py + 5 * s]], true), c.cel('#7a5a36'), 1.6 * s) + L('M' + pt([x - 16 * s, py + 1]) + 'l0,' + n(4 * s) + 'M' + pt([x, py + 1]) + 'l0,' + n(4 * s) + 'M' + pt([x + 16 * s, py + 1]) + 'l0,' + n(4 * s), '#4a3420', 0.9 * s);
    var hw = 21 * s, hh = 30 * s, d = 'M' + pt([x - hw, py]) + 'C' + pt([x - hw - 2 * s, py - hh * 0.7]) + ' ' + pt([x - hw * 0.4, py - hh]) + ' ' + pt([x, py - hh - 4 * s]) + 'C' + pt([x + hw * 0.4, py - hh]) + ' ' + pt([x + hw + 2 * s, py - hh * 0.7]) + ' ' + pt([x + hw, py]) + 'Z', st = '';
    for (var i = -3; i <= 3; i++) st += 'M' + pt([x + i * 5.6 * s, py]) + 'Q' + pt([x + i * 6.2 * s, py - hh * 0.6]) + ' ' + pt([x + i * 1.5 * s, py - hh - 2 * s]);
    st += 'M' + pt([x - hw, py - hh * 0.34]) + 'Q' + pt([x, py - hh * 0.46]) + ' ' + pt([x + hw, py - hh * 0.34]) + 'M' + pt([x - hw * 0.8, py - hh * 0.66]) + 'Q' + pt([x, py - hh * 0.8]) + ' ' + pt([x + hw * 0.8, py - hh * 0.66]);
    o += body(c, d, col, L(st, dk(col, 0.35), 1 * s, 0.85) + F(pd([[x + hw * 0.3, py - hh - 6 * s], [x + hw + 4 * s, py - hh - 6 * s], [x + hw + 4 * s, py + 2], [x + hw * 0.35, py + 2]], true), dk(col, 0.3), 0.8), 1.8 * s);
    var tk = 'M' + pt([x, py - hh - 3 * s]) + 'l' + n(-5 * s) + ',' + n(-9 * s) + 'M' + pt([x, py - hh - 3 * s]) + 'l0,' + n(-11 * s) + 'M' + pt([x, py - hh - 3 * s]) + 'l' + n(5 * s) + ',' + n(-9 * s);
    o += L(tk, OL, 2.8 * s) + L(tk, REED, 1.3 * s);
    o += P('M' + pt([x - 7 * s, py]) + 'L' + pt([x - 7 * s, py - 10 * s]) + 'Q' + pt([x - 2 * s, py - 17 * s]) + ' ' + pt([x + 3 * s, py - 10 * s]) + 'L' + pt([x + 3 * s, py]) + 'Z', '#1a120c', 1.2 * s);
    // drying net over the right side, and a fish on a string
    var nt = '';
    for (var k = 0; k < 5; k++) nt += 'M' + pt([x + 7 * s + k * 3 * s, py - hh * 0.8 + k * 1.5 * s]) + 'L' + pt([x + 5 * s + k * 3.4 * s, py - 1]) + 'M' + pt([x + 6 * s, py - hh * 0.62 + k * 5 * s]) + 'L' + pt([x + hw + 1 * s, py - hh * 0.5 + k * 4 * s]);
    o += L(nt, '#d8d0b0', 0.8 * s, 0.75);
    o += L('M' + pt([x + hw + 4 * s, py]) + 'L' + pt([x + hw + 4 * s, py + 8 * s]), OL, 0.9 * s) + P('M' + pt([x + hw + 4 * s, py + 8 * s]) + 'q' + n(4 * s) + ',' + n(3 * s) + ' 0,' + n(9 * s) + 'l' + n(-2 * s) + ',' + n(3 * s) + 'l' + n(4 * s) + ',0l' + n(-2 * s) + ',' + n(-3 * s) + 'q' + n(-4 * s) + ',' + n(-6 * s) + ' 0,' + n(-9 * s) + 'Z', c.cel('#9ab0b0'), 0.9 * s);
    return o;
  }
  // ---- harbour ----
  function house(c, x, y, w, h, o) {
    o = o || {}; var wall = o.wall || '#9a9688', rf = o.roof || SLATE, rh = o.rh || h * 0.8, out = E(x + w / 2, y + 2, w * 0.62, 4, '#000', 0, 0.25);
    if (o.chim) out += smoke(x + w * 0.74, y - h - rh * 0.9 - 4, 0.45, '#a0a8a4', 0.45, -0.6) + R(x + w * 0.7, y - h - rh * 0.9, 8, rh * 0.7, c.cel('#7a766c'), 1.4);
    out += stoneFace(c, x, y, w, h, wall, 7);
    var roof = pd([[x - 5, y - h + 2], [x + w * 0.2, y - h - rh], [x + w * 0.8, y - h - rh], [x + w + 5, y - h + 2]], true), rl = '';
    for (var j = 1; j < 4; j++) { var t = j / 4, yy = y - h + 2 - (rh + 2) * t, xa = x - 5 + (w * 0.2 + 5) * t, xb = x + w + 5 - (w * 0.2 + 5) * t; rl += 'M' + pt([xa, yy]) + 'L' + pt([xb, yy]); }
    out += body(c, roof, rf, L(rl, dk(rf, 0.35), 1, 0.9) + F(pd([[x + w * 0.56, y - h - rh - 2], [x + w + 8, y - h - rh - 2], [x + w + 8, y - h + 4], [x + w * 0.66, y - h + 4]], true), dk(rf, 0.3), 0.8), 1.8);
    (o.win || [[0.25, 0.55]]).forEach(function (p) { var wx = x + w * p[0], wy = y - h * p[1]; out += C(wx, wy, 12, glow(c, LAMP, 0.5)) + R(wx - 4, wy - 5, 8, 10, '#ffd27a', 1.3) + L('M' + pt([wx, wy - 5]) + 'L' + pt([wx, wy + 5]) + 'M' + pt([wx - 4, wy]) + 'L' + pt([wx + 4, wy]), '#5a3a22', 1); });
    if (o.door != null) out += archWin(x + w * o.door, y, 10, 16, c.cel('#5a3a24'), 1.4);
    return out;
  }
  // blue Accord-style wall banner with a gold trim and a gold shield-and-chevron (original)
  function allyBanner(c, x, y, w, h) {
    var d = pd([[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h + 6], [x, y + h]], true), ex = x + w / 2, ey = y + h * 0.42;
    return L('M' + pt([x - 2, y]) + 'L' + pt([x + w + 2, y]), OL, 3) + body(c, d, ALLY, L(pd([[x + 1.8, y + 1], [x + 1.8, y + h - 0.6], [ex, y + h + 3.8], [x + w - 1.8, y + h - 0.6], [x + w - 1.8, y + 1]]), GOLD, 1) + F(pd([[x + w * 0.62, y], [x + w, y], [x + w, y + h + 6], [x + w * 0.62, y + h + 6]], true), '#000', 0.25), 1.3) +
      P('M' + pt([ex - w * 0.26, ey - w * 0.24]) + 'L' + pt([ex + w * 0.26, ey - w * 0.24]) + 'L' + pt([ex + w * 0.26, ey + w * 0.04]) + 'Q' + pt([ex + w * 0.2, ey + w * 0.3]) + ' ' + pt([ex, ey + w * 0.38]) + 'Q' + pt([ex - w * 0.2, ey + w * 0.3]) + ' ' + pt([ex - w * 0.26, ey + w * 0.04]) + 'Z', GOLD, 0.9) +
      L('M' + pt([ex - w * 0.16, ey + w * 0.08]) + 'L' + pt([ex, ey - w * 0.1]) + 'L' + pt([ex + w * 0.16, ey + w * 0.08]), ALLY, 1.4);
  }
  // squat harbour keep: crenellated block, two corner towers, portcullis gate, banners
  function keep(c, x, y, s) {
    var st = '#9c9a90', o = E(x, y + 3, 64 * s, 6 * s, '#000', 0, 0.28), w = 94 * s, h = 50 * s, x0 = x - w / 2;
    o += stoneFace(c, x0 + 12 * s, y, w - 24 * s, h, st, 8 * s) + crenels(c, x0 + 12 * s, x0 + w - 12 * s, y - h, st, 5 * s);
    // central tower behind the gate, squat with a slate cap
    o += stoneFace(c, x - 16 * s, y - h + 1, 32 * s, 20 * s, lt(st, 0.04), 7 * s) + P(pd([[x - 20 * s, y - h - 18 * s], [x, y - h - 38 * s], [x + 20 * s, y - h - 18 * s]], true), c.cel(SLATE), 1.6) + arrowSlit(x, y - h - 10 * s);
    o += limb('M' + pt([x, y - h - 38 * s]) + 'L' + pt([x, y - h - 52 * s]), '#3a3230', 1.6) + P(pd([[x, y - h - 52 * s], [x + 14 * s, y - h - 48 * s], [x, y - h - 44 * s]], true), c.cel(ALLY), 1);
    o += P('M' + pt([x - 13 * s, y]) + 'L' + pt([x - 13 * s, y - 20 * s]) + 'Q' + pt([x, y - 32 * s]) + ' ' + pt([x + 13 * s, y - 20 * s]) + 'L' + pt([x + 13 * s, y]) + 'Z', '#1a1612', 2) + bars(c, x - 12 * s, y, 24 * s, 22 * s, '#4a4e56');
    [-1, 1].forEach(function (k) {
      var tx = k < 0 ? x0 : x0 + w - 26 * s, th = 70 * s;
      o += stoneFace(c, tx, y, 26 * s, th, k < 0 ? lt(st, 0.05) : dk(st, 0.04), 8 * s) + crenels(c, tx - 2 * s, tx + 28 * s, y - th, st, 5 * s) + arrowSlit(tx + 13 * s, y - th * 0.62) + allyBanner(c, tx + 7 * s, y - th * 0.34, 12 * s, 20 * s);
      o += C(tx + 13 * s, y - th * 0.46, 7 * s, glow(c, LAMP, 0.5)) + R(tx + 10 * s, y - th * 0.5, 6 * s, 7 * s, '#ffd27a', 1.1);
    });
    return o;
  }
  // moored ship (y = waterline), bow to the left
  function ship(c, x, y, s) {
    var o = '', q = function (u, v) { return [x + u * s, y + v * s]; }, wd = '#6a4a30';
    o += E(x, y + 6 * s, 74 * s, 6 * s, '#1e2a28', 0, 0.35);
    var rig = 'M' + pt(q(4, -116)) + 'L' + pt(q(-92, -48)) + 'M' + pt(q(4, -116)) + 'L' + pt(q(56, -40)) + 'M' + pt(q(4, -80)) + 'L' + pt(q(-60, -30)) + 'M' + pt(q(46, -84)) + 'L' + pt(q(64, -42));
    o += L(rig, OL, 0.9, 0.8);
    o += limb('M' + pt(q(4, -14)) + 'L' + pt(q(4, -118)), wd, 4.2 * s) + limb('M' + pt(q(46, -30)) + 'L' + pt(q(46, -86)), wd, 3 * s);
    o += limb('M' + pt(q(-30, -96)) + 'L' + pt(q(38, -96)), wd, 2.6 * s) + limb('M' + pt(q(-22, -66)) + 'L' + pt(q(30, -66)), wd, 2.4 * s) + limb('M' + pt(q(30, -72)) + 'L' + pt(q(62, -72)), wd, 2 * s);
    [[-30, 38, -96, 9], [-22, 30, -66, 8], [30, 62, -72, 6]].forEach(function (f) { o += P('M' + pt(q(f[0], f[2])) + 'C' + pt(q(f[0] + 6, f[2] + f[3])) + ' ' + pt(q(f[1] - 6, f[2] + f[3])) + ' ' + pt(q(f[1], f[2])) + 'Z', c.cel('#e0d8c0'), 1.4) + L('M' + pt(q(f[0] + 12, f[2])) + 'l0,' + n(f[3] * 0.7 * s) + 'M' + pt(q(f[1] - 14, f[2])) + 'l0,' + n(f[3] * 0.7 * s), '#a89a78', 1); });
    o += P(pd([q(4, -118), q(24, -114), q(4, -110)], true), c.cel(ALLY), 1.1) + limb('M' + pt(q(-70, -32)) + 'L' + pt(q(-94, -48)), wd, 2.4 * s);
    var hull = 'M' + pt(q(-72, -34)) + 'L' + pt(q(-56, -27)) + 'L' + pt(q(42, -27)) + 'L' + pt(q(44, -40)) + 'L' + pt(q(66, -42)) + 'L' + pt(q(64, -20)) + 'C' + pt(q(60, -4)) + ' ' + pt(q(50, 4)) + ' ' + pt(q(36, 4)) + 'L' + pt(q(-34, 4)) + 'C' + pt(q(-52, 2)) + ' ' + pt(q(-64, -14)) + ' ' + pt(q(-72, -34)) + 'Z';
    var pl = 'M' + pt(q(-64, -24)) + 'L' + pt(q(64, -26)) + 'M' + pt(q(-54, -10)) + 'L' + pt(q(60, -10));
    o += body(c, hull, '#7a5634', F(pd([q(-68, -22), q(66, -24), q(66, -17), q(-62, -15)], true), '#c8a050', 0.95) + L(pl, dk('#7a5634', 0.4), 1.1) + F(pd([q(20, -46), q(70, -46), q(70, 8), q(30, 8)], true), '#000', 0.3) + F(pd([q(-80, -4), q(70, -4), q(70, 8), q(-80, 8)], true), '#1a120c', 0.35), 2);
    [-36, -16, 4, 24].forEach(function (u) { o += C(q(u, -6)[0], q(u, -6)[1], 2.4 * s, '#1a120c', 1); });
    o += L('M' + pt(q(44, -40)) + 'L' + pt(q(66, -42)), OL, 3.4) + L('M' + pt(q(44, -40)) + 'L' + pt(q(66, -42)), '#a87a4a', 1.4) + lantern(c, q(66, -42)[0], q(66, -42)[1], 0.7 * s);
    return o;
  }
  function lantern(c, x, y, s) {
    s = s || 1;
    return C(x, y + 8 * s, 22 * s, glow(c, LAMP, 0.55)) + L('M' + pt([x, y]) + 'L' + pt([x, y + 3 * s]), OL, 1 * s) +
      P(pd([[x - 3.4 * s, y + 3 * s], [x + 3.4 * s, y + 3 * s], [x + 4.4 * s, y + 7 * s], [x + 3.4 * s, y + 13 * s], [x - 3.4 * s, y + 13 * s], [x - 4.4 * s, y + 7 * s]], true), '#ffe6a0', 1.2 * s) +
      C(x, y + 8 * s, 1.6 * s, '#fffaf0') + P(pd([[x - 4.2 * s, y + 3.4 * s], [x, y - 0.8 * s], [x + 4.2 * s, y + 3.4 * s]], true), c.cel('#3a3430'), 0.9 * s) + R(x - 3.8 * s, y + 12.6 * s, 7.6 * s, 2 * s, '#3a3430', 0.8 * s);
  }
  function lampPost(c, x, y, h, s) {
    s = s || 1; var top = y - h;
    return E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25) + limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#2e2a28', 2.4 * s) + limb('M' + pt([x, top + 2 * s]) + 'L' + pt([x - 10 * s, top + 2 * s]), '#2e2a28', 1.6 * s) + lantern(c, x - 9 * s, top + 3 * s, s) + E(x - 9 * s, y + 3, 10 * s, 2.4 * s, '#ffd88a', 0, 0.25);
  }
  // wooden jetty on posts over the water (deck at y)
  function jetty(c, x0, x1, y, s) {
    s = s || 1; var posts = '', pl = '', o = '';
    for (var x = x0 + 6; x < x1; x += 22 * s) posts += 'M' + pt([x, y]) + 'L' + pt([x, y + 16 * s]);
    o += L(posts, OL, 6 * s) + L(posts, '#4a3420', 3.6 * s);
    for (var j = x0; j < x1; j += 9 * s) pl += 'M' + pt([j, y - 5 * s]) + 'l0,' + n(6 * s);
    o += P(pd([[x0, y - 6 * s], [x1, y - 6 * s], [x1, y + 1], [x0, y + 1]], true), c.cel('#7a5a3a'), 1.6 * s) + L(pl, '#4a3420', 0.8, 0.8);
    for (var k = x0 + 6; k < x1; k += 22 * s) o += L('M' + pt([k - 7 * s, y + 16 * s]) + 'q' + n(7 * s) + ',' + n(-2 * s) + ' ' + n(14 * s) + ',0', '#d8e0dc', 0.9, 0.55);
    return o;
  }
  // ---- dig site ----
  function rib(c, x, y, h, lean, w) {
    var T = taper([[x, y], [x + lean * 0.15, y - h * 0.5], [x + lean * 0.62, y - h * 0.92], [x + lean, y - h]], w, w * 0.45, 5);
    return body(c, T.d, BONE, F(ribbonBand(T, 0.62, 1), '#a89c80', 0.8) + L(along(T, 0.28), '#fff8e8', 0.8, 0.6) + L(bands(T, 5, 3), '#b8ac90', 0.8, 0.6), 1.8);
  }
  function giantSkull(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '';
    var hn = taper([q(26, -30), q(36, -48), q(54, -58), q(66, -54)], 11 * s, 2 * s, 5);
    o += body(c, hn.d, '#d0c4a4', L(bands(hn, 2, 2), '#8a7c60', 1, 0.8), 1.8);
    var d = 'M' + pt(q(-54, 0)) + 'C' + pt(q(-56, -10)) + ' ' + pt(q(-46, -18)) + ' ' + pt(q(-26, -20)) + 'C' + pt(q(-10, -30)) + ' ' + pt(q(18, -40)) + ' ' + pt(q(38, -32)) + 'C' + pt(q(52, -24)) + ' ' + pt(q(56, -10)) + ' ' + pt(q(52, 0)) + 'Z';
    o += body(c, d, BONE, F(pd([q(20, -44), q(60, -44), q(60, 4), q(30, 4)], true), '#a89c80', 0.8) + L('M' + pt(q(-40, -14)) + 'Q' + pt(q(-20, -22)) + ' ' + pt(q(0, -26)), '#fff8e8', 1, 0.7) + L('M' + pt(q(-8, -8)) + 'l6,-6 M' + pt(q(26, -18)) + 'l4,6', '#8a7c60', 1), 2);
    o += E(q(14, -22)[0], q(14, -22)[1], 8 * s, 7 * s, '#1e1610', 1.4) + E(q(-38, -10)[0], q(-38, -10)[1], 3 * s, 2.4 * s, '#1e1610', 1);
    var th = ''; for (var i = 0; i < 6; i++) { var u = -50 + i * 8; th += 'M' + pt(q(u, -1)) + 'L' + pt(q(u + 2.5, 8)) + 'L' + pt(q(u + 5, -1)) + 'Z'; }
    return o + P(th, '#efe6cf', 1.1);
  }
  function scaffold(c, x, y, w, h) {
    var wd = '#8a6a44', o = E(x + w / 2, y + 2, w * 0.6, 3, '#000', 0, 0.25), d = '';
    d += 'M' + pt([x, y]) + 'L' + pt([x, y - h]) + 'M' + pt([x + w, y]) + 'L' + pt([x + w, y - h]) + 'M' + pt([x + w / 2, y]) + 'L' + pt([x + w / 2, y - h * 0.5]);
    var br = 'M' + pt([x, y]) + 'L' + pt([x + w / 2, y - h * 0.5]) + 'M' + pt([x + w / 2, y]) + 'L' + pt([x, y - h * 0.5]) + 'M' + pt([x + w / 2, y]) + 'L' + pt([x + w, y - h * 0.5]) + 'M' + pt([x, y - h * 0.5]) + 'L' + pt([x + w, y - h]) + 'M' + pt([x + w, y - h * 0.5]) + 'L' + pt([x, y - h]);
    o += L(br, OL, 3.4) + L(br, dk(wd, 0.15), 1.6) + L(d, OL, 5) + L(d, wd, 3);
    [0.5, 1].forEach(function (f) { o += P(pd([[x - 6, y - h * f], [x + w + 6, y - h * f], [x + w + 6, y - h * f + 5], [x - 6, y - h * f + 5]], true), c.cel('#a07a4a'), 1.4); });
    var lx = x + w * 0.74, lad = 'M' + pt([lx, y]) + 'L' + pt([lx + 4, y - h * 0.5]) + 'M' + pt([lx + 9, y]) + 'L' + pt([lx + 13, y - h * 0.5]);
    for (var j = 1; j < 5; j++) lad += 'M' + pt([lx + 4 * j / 5, y - h * 0.5 * j / 5]) + 'l9,0';
    o += L(lad, OL, 3.2) + L(lad, '#b08a5a', 1.4);
    // rope, pulley and a bucket from the top beam
    o += C(x + w * 0.3, y - h + 8, 3, c.cel('#6a6e76'), 1.1) + L('M' + pt([x + w * 0.3, y - h + 10]) + 'L' + pt([x + w * 0.3, y - h * 0.5 - 10]), OL, 1) + P(pd([[x + w * 0.3 - 5, y - h * 0.5 - 10], [x + w * 0.3 + 5, y - h * 0.5 - 10], [x + w * 0.3 + 4, y - h * 0.5 - 2], [x + w * 0.3 - 4, y - h * 0.5 - 2]], true), c.cel('#8a5a32'), 1.2);
    return o + lantern(c, x + w + 2, y - h + 5, 0.7);
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
  // ---- gnoll camp ----
  function hideTent(c, x, y, s, hide) {
    hide = hide || '#8a7a52'; var w = 30 * s, h = 40 * s, o = E(x, y + 2, w + 8 * s, 4 * s, '#000', 0, 0.26);
    o += limb('M' + pt([x - 3 * s, y - h + 3 * s]) + 'L' + pt([x + 7 * s, y - h - 12 * s]) + 'M' + pt([x + 3 * s, y - h + 3 * s]) + 'L' + pt([x - 8 * s, y - h - 11 * s]) + 'M' + pt([x, y - h + 3 * s]) + 'L' + pt([x + 1 * s, y - h - 15 * s]), '#6a4a2a', 2.2 * s);
    var d = 'M' + pt([x - w, y]) + 'Q' + pt([x - w * 0.46, y - h * 0.5]) + ' ' + pt([x - 3 * s, y - h]) + 'L' + pt([x + 3 * s, y - h]) + 'Q' + pt([x + w * 0.46, y - h * 0.5]) + ' ' + pt([x + w, y]) + 'Z';
    var p1 = pd([[x - w * 0.62, y - h * 0.3], [x - w * 0.3, y - h * 0.5], [x - w * 0.18, y - h * 0.26], [x - w * 0.5, y - h * 0.08]], true), p2 = pd([[x + w * 0.2, y - h * 0.66], [x + w * 0.4, y - h * 0.5], [x + w * 0.3, y - h * 0.3], [x + w * 0.12, y - h * 0.42]], true);
    var seam = 'M' + pt([x - 2 * s, y - h]) + 'Q' + pt([x - w * 0.24, y - h * 0.5]) + ' ' + pt([x - w * 0.5, y]) + 'M' + pt([x + 2 * s, y - h]) + 'Q' + pt([x + w * 0.24, y - h * 0.5]) + ' ' + pt([x + w * 0.52, y]);
    o += body(c, d, hide, F(p1, dk(hide, 0.2)) + F(p2, lt(hide, 0.14)) + L(p1 + p2, dk(hide, 0.45), 0.9 * s, 0.9) + L(seam, dk(hide, 0.35), 1.2 * s) + F(pd([[x + 2 * s, y - h - 4], [x + w + 6, y - h - 4], [x + w + 6, y + 2], [x + w * 0.5, y + 2]], true), dk(hide, 0.3), 0.75), 1.8 * s);
    o += P(pd([[x - 9 * s, y], [x + 1 * s, y - 24 * s], [x + 9 * s, y]], true), '#1a120c', 1.4 * s) + P(pd([[x + 1 * s, y - 24 * s], [x + 9 * s, y], [x + 14 * s, y - 4 * s]], true), c.cel(lt(hide, 0.1)), 1.2 * s);
    return o + bone(x + 1 * s, y - h - 6 * s, 8 * s, 0.4, 0.6 * s);
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
  // a tall weathered sea stack with ledges and surf at its foot
  function seaStack(c, x, y, s) {
    var col = '#6e7470', d = pd([[x - 16 * s, y], [x - 14 * s, y - 20 * s], [x - 11 * s, y - 24 * s], [x - 12 * s, y - 36 * s], [x - 6 * s, y - 44 * s], [x + 4 * s, y - 46 * s], [x + 10 * s, y - 38 * s], [x + 9 * s, y - 26 * s], [x + 14 * s, y - 20 * s], [x + 18 * s, y]], true);
    return body(c, d, col, F(pd([[x + 2 * s, y - 48 * s], [x + 20 * s, y - 48 * s], [x + 20 * s, y + 2], [x + 4 * s, y + 2]], true), dk(col, 0.28), 0.85) + L('M' + pt([x - 11 * s, y - 24 * s]) + 'L' + pt([x + 9 * s, y - 26 * s]) + 'M' + pt([x - 8 * s, y - 36 * s]) + 'L' + pt([x + 6 * s, y - 38 * s]), dk(col, 0.35), 1.2) + F(pd([[x - 6 * s, y - 44 * s], [x + 4 * s, y - 46 * s], [x + 8 * s, y - 42 * s], [x - 4 * s, y - 41 * s]], true), '#e8ece6', 0.8), 1.6) +
      E(x + 1 * s, y, 22 * s, 3 * s, '#eef4f0', 0, 0.7) + L('M' + pt([x - 24 * s, y + 2]) + 'q' + n(8 * s) + ',' + n(-3 * s) + ' ' + n(14 * s) + ',0M' + pt([x + 12 * s, y + 3]) + 'q' + n(6 * s) + ',' + n(-2 * s) + ' ' + n(12 * s) + ',0', '#ffffff', 1.1, 0.8);
  }
  function gulls(seed, cnt, x0, x1, y0, y1) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 3 + r() * 3; d += 'M' + pt([x - w, y - w * 0.3]) + 'q' + n(w * 0.5) + ',' + n(-w * 0.5) + ' ' + n(w) + ',' + n(w * 0.3) + 'q' + n(w * 0.5) + ',' + n(-w * 0.8) + ' ' + n(w) + ',' + n(-w * 0.3); }
    return L(d, '#2e3432', 1.2, 0.85);
  }
  function boneTotem(c, x, y, s) {
    var o = E(x, y + 1, 8 * s, 2 * s, '#000', 0, 0.26) + limb('M' + pt([x, y]) + 'L' + pt([x, y - 52 * s]), '#7a5a36', 3.4 * s);
    o += limb('M' + pt([x - 12 * s, y - 38 * s]) + 'L' + pt([x + 12 * s, y - 42 * s]), '#7a5a36', 2.4 * s) + bone(x - 12 * s, y - 30 * s, 10 * s, 1.5, 0.6 * s) + bone(x + 12 * s, y - 34 * s, 10 * s, 1.6, 0.6 * s);
    o += feathers(x - 1 * s, y - 44 * s, ['#c8a040', '#4a6a3a'], 0.6 * s, 0.1);
    return o + skull(c, x, y - 52 * s, 1.1 * s) + L('M' + pt([x - 3 * s, y - 58 * s]) + 'l6,2', '#6a8a3a', 1.6 * s);
  }
  // ---- Slagborn ruins ----
  function ruin(c, x, y, w, h, col, seed, door) {
    var r = rng(seed || 5), top = [];
    for (var i = 0; i <= 6; i++) top.push([w * i / 6, i === 0 || i === 6 ? r() * h * 0.2 : (i % 2 ? r() * h * 0.45 : r() * h * 0.15)]);
    var o = stoneFace(c, x, y, w, h, col || '#8a887e', 9, top);
    if (door) {
      var dx = x + w * door;
      o += P(pd([[dx - 11, y], [dx - 11, y - 20], [dx - 7, y - 25], [dx + 7, y - 25], [dx + 11, y - 20], [dx + 11, y]], true), c.cel(lt(col || '#8a887e', 0.1)), 1.6) + P(pd([[dx - 7, y], [dx - 7, y - 18], [dx - 4, y - 21], [dx + 4, y - 21], [dx + 7, y - 18], [dx + 7, y]], true), '#120e0c', 1.2);
    }
    o += F(shag(x + w * 0.2, y - h + top[1][1] + 2, w * 0.16, 3, 5, 0.3, (seed || 5) + 1), MOSS, 0.9);
    return o;
  }
  // hexagon knot mark carved into dwarven stone
  function hexMark(x, y, r, col) {
    var p = []; for (var i = 0; i < 6; i++) { var a = PI / 6 + i * PI / 3; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    return L(pd(p, true) + 'M' + pt([x, y - r * 0.5]) + 'L' + pt([x, y + r * 0.5]) + 'M' + pt([x - r * 0.45, y - r * 0.25]) + 'L' + pt([x + r * 0.45, y + r * 0.25]), col, 1.4);
  }
  function dwarfGate(c, x, y, s, col) {
    col = col || '#8e8c82'; var o = E(x, y + 3, 50 * s, 5 * s, '#000', 0, 0.3), pw = 20 * s, ph = 66 * s, gap = 24 * s;
    o += P(pd([[x - gap, y], [x - gap, y - ph + 8 * s], [x + gap, y - ph + 8 * s], [x + gap, y]], true), c.lg([[0, '#0e0c0c'], [1, '#2a2220']]), 1.6);
    [-1, 1].forEach(function (k) {
      var px = k < 0 ? x - gap - pw : x + gap;
      o += stoneFace(c, px, y, pw, ph, k < 0 ? col : dk(col, 0.06), 10 * s) + hexMark(px + pw / 2, y - ph * 0.5, 5 * s, dk(col, 0.4));
      o += P(pd([[px - 4 * s, y - ph], [px + pw + 4 * s, y - ph], [px + pw + 2 * s, y - ph + 7 * s], [px - 2 * s, y - ph + 7 * s]], true), c.cel(lt(col, 0.08)), 1.6);
    });
    // broken lintel: the right half has fallen
    o += body(c, pd([[x - gap - pw - 8 * s, y - ph], [x - gap - pw - 6 * s, y - ph - 16 * s], [x + 4 * s, y - ph - 16 * s], [x + 8 * s, y - ph - 10 * s], [x + 2 * s, y - ph - 6 * s], [x + 6 * s, y - ph]], true), lt(col, 0.05), hexMark(x - gap - 2 * s, y - ph - 8 * s, 5 * s, dk(col, 0.45)) + L('M' + pt([x - gap - pw - 6 * s, y - ph - 8 * s]) + 'L' + pt([x + 6 * s, y - ph - 8 * s]), dk(col, 0.3), 1), 1.8);
    o += rock(c, x + gap + pw + 14 * s, y + 2, 20 * s, 10 * s, col) + rock(c, x + 18 * s, y + 4, 14 * s, 7 * s, dk(col, 0.1));
    return o;
  }
  function forge(c, x, y, s) {
    var st = '#6e6862', o = C(x, y - 14 * s, 60 * s, glow(c, '#ff8a2a', 0.4));
    o += smoke(x + 10 * s, y - 60 * s, 0.8 * s, '#3a3634', 0.7, 0.8) + stoneFace(c, x + 2 * s, y - 20 * s, 16 * s, 40 * s, dk(st, 0.08), 7 * s);
    o += stoneFace(c, x - 24 * s, y, 48 * s, 24 * s, st, 7 * s);
    o += P('M' + pt([x - 14 * s, y - 4 * s]) + 'L' + pt([x - 14 * s, y - 14 * s]) + 'Q' + pt([x - 2 * s, y - 22 * s]) + ' ' + pt([x + 10 * s, y - 14 * s]) + 'L' + pt([x + 10 * s, y - 4 * s]) + 'Z', c.lg([[0, '#ffd060'], [0.5, '#ff7a1a'], [1, '#8a1e0a']]), 1.6 * s);
    o += flame(c, x - 6 * s, y - 5 * s, 0.55 * s) + flame(c, x + 3 * s, y - 5 * s, 0.45 * s) + C(x - 9 * s, y - 5 * s, 1.6 * s, '#fff0a0') + C(x + 6 * s, y - 5 * s, 1.4 * s, '#fff0a0');
    return o + anvil(c, x + 36 * s, y, s);
  }
  function anvil(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; };
    return E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.3) + P(pd([q(-14, -14), q(12, -14), q(10, -9), q(4, -9), q(5, -3), q(9, 0), q(-8, 0), q(-4, -3), q(-3, -9), q(-8, -9), q(-18, -12)], true), c.cel('#46444a'), 1.6 * s) + L('M' + pt(q(-12, -13)) + 'L' + pt(q(10, -13)), '#8a8890', 1 * s, 0.8);
  }
  // Slagborn war banner (original): black cloth, an ember ring round a molten drop, a red band
  function diBanner(c, x, y, h, s) {
    s = s || 1; var top = y - h, bw = 17 * s, bh = h * 0.6, o = E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top - 6 * s]), '#1e1c1e', 2.6 * s) + P(pd([[x - 3 * s, top - 5 * s], [x, top - 15 * s], [x + 3 * s, top - 5 * s]], true), c.cel('#5a5a60'), 1 * s);
    o += limb('M' + pt([x - 3 * s, top]) + 'L' + pt([x + bw + 3 * s, top]), '#1e1c1e', 2 * s) + C(x + bw + 3 * s, top, 1.8 * s, c.cel('#5a5a60'), 0.9 * s);
    var d = pd([[x, top], [x + bw, top], [x + bw, top + bh], [x + bw * 0.75, top + bh - 6 * s], [x + bw * 0.5, top + bh + 2 * s], [x + bw * 0.25, top + bh - 6 * s], [x, top + bh]], true);
    o += body(c, d, '#1e1a1c', F(pd([[x, top + bh * 0.66], [x + bw, top + bh * 0.66], [x + bw, top + bh * 0.76], [x, top + bh * 0.76]], true), '#b8341a') + F(pd([[x, top + 2 * s], [x + bw, top + 2 * s], [x + bw, top + 4 * s], [x, top + 4 * s]], true), '#b8341a') + F(pd([[x + bw * 0.64, top], [x + bw, top], [x + bw, top + bh + 4], [x + bw * 0.64, top + bh + 4]], true), '#000', 0.3), 1.4 * s);
    var ex = x + bw / 2, ey = top + bh * 0.38;
    o += C(ex, ey, 10 * s, glow(c, EMBER, 0.4)) + L(ellD(ex, ey, 5.4 * s, 5.4 * s), EMBER, 1.8 * s) + P('M' + pt([ex, ey - 3.8 * s]) + 'C' + pt([ex + 3 * s, ey]) + ' ' + pt([ex + 2.4 * s, ey + 3 * s]) + ' ' + pt([ex, ey + 3 * s]) + 'C' + pt([ex - 2.4 * s, ey + 3 * s]) + ' ' + pt([ex - 3 * s, ey]) + ' ' + pt([ex, ey - 3.8 * s]) + 'Z', '#ffc050', 0);
    return o;
  }
  // ---- Wyrmchain camp ----
  // Wyrmchain war banner (original): black swallowtail cloth, red lower half, a red spread-wing mark
  function dmBanner(c, x, y, h, s) {
    s = s || 1; var top = y - h, bw = 18 * s, bh = h * 0.62, o = E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top - 4 * s]), '#2a2020', 2.6 * s) + P(pd([[x - 2.6 * s, top - 3 * s], [x - 1 * s, top - 14 * s], [x + 3 * s, top - 18 * s], [x + 1.4 * s, top - 8 * s], [x + 2.6 * s, top - 3 * s]], true), c.cel('#d8ccb0'), 1 * s);
    o += limb('M' + pt([x - 5 * s, top]) + 'L' + pt([x + bw + 5 * s, top]), '#2a2020', 2 * s);
    o += chain(x + bw + 4 * s, top + 1, 14 * s, 0.7 * s) + chain(x - 4 * s, top + 1, 10 * s, 0.7 * s);
    var d = pd([[x, top], [x + bw, top], [x + bw, top + bh + 6 * s], [x + bw * 0.72, top + bh - 2 * s], [x + bw * 0.5, top + bh * 0.8], [x + bw * 0.28, top + bh - 2 * s], [x, top + bh + 6 * s]], true);
    o += body(c, d, DMBLK, F(pd([[x, top + bh * 0.56], [x + bw, top + bh * 0.56], [x + bw, top + bh + 8 * s], [x, top + bh + 8 * s]], true), DMRED) + F(pd([[x + bw * 0.64, top], [x + bw, top], [x + bw, top + bh + 8], [x + bw * 0.64, top + bh + 8]], true), '#000', 0.28), 1.4 * s);
    var ex = x + bw / 2, ey = top + bh * 0.3;
    o += dmMark(ex, ey, s * 1.1, '#d82a1e');
    return o;
  }
  // the spread-wing mark: three spined wing fingers over a small bar (original)
  function dmMark(x, y, s, col) {
    return F(pd([[x - 7 * s, y + 4 * s], [x - 7.5 * s, y - 5 * s], [x - 3.5 * s, y + 0.5 * s], [x, y - 8 * s], [x + 3.5 * s, y + 0.5 * s], [x + 7.5 * s, y - 5 * s], [x + 7 * s, y + 4 * s], [x + 3 * s, y + 2 * s], [x, y + 5.5 * s], [x - 3 * s, y + 2 * s]], true), col) +
      F(pd([[x - 5 * s, y + 6.5 * s], [x + 5 * s, y + 6.5 * s], [x + 4 * s, y + 8 * s], [x - 4 * s, y + 8 * s]], true), col);
  }
  // loose chain swag between two points
  function swag(x0, y0, x1, y1, sag, w) {
    w = w || 1; var d = 'M' + pt([x0, y0]) + 'Q' + pt([(x0 + x1) / 2, Math.max(y0, y1) + sag]) + ' ' + pt([x1, y1]);
    return L(d, OL, 4 * w) + '<path d="' + d + '" fill="none" stroke="#7a7e86" stroke-width="' + n(2.2 * w) + '" stroke-dasharray="' + n(3.4 * w) + ' ' + n(1.8 * w) + '"/>';
  }
  function cagedWhelp(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, sc = '#a8281e', o = '';
    o += P('M' + pt(q(-14, 0)) + 'C' + pt(q(-16, -12)) + ' ' + pt(q(-4, -18)) + ' ' + pt(q(8, -16)) + 'C' + pt(q(16, -14)) + ' ' + pt(q(18, -4)) + ' ' + pt(q(14, 0)) + 'Z', c.cel(sc), 1.6 * s);
    o += P(pd([q(-2, -14), q(6, -30), q(10, -22), q(16, -26), q(14, -12)], true), c.cel('#5a1410'), 1.4 * s);
    o += P('M' + pt(q(-10, -10)) + 'C' + pt(q(-14, -18)) + ' ' + pt(q(-22, -18)) + ' ' + pt(q(-24, -12)) + 'L' + pt(q(-18, -8)) + 'C' + pt(q(-16, -6)) + ' ' + pt(q(-12, -6)) + ' ' + pt(q(-10, -10)) + 'Z', c.cel(sc), 1.4 * s);
    o += P(pd([q(-14, -17), q(-10, -24), q(-11, -16)], true), c.cel('#e8dcc0'), 0.9 * s) + glowEye(c, q(-18, -13)[0], q(-18, -13)[1], 1.1 * s, '#ffd040');
    o += L('M' + pt(q(14, -2)) + 'C' + pt(q(22, -2)) + ' ' + pt(q(22, -10)) + ' ' + pt(q(18, -10)), OL, 5 * s) + L('M' + pt(q(14, -2)) + 'C' + pt(q(22, -2)) + ' ' + pt(q(22, -10)) + ' ' + pt(q(18, -10)), sc, 2.6 * s);
    return o;
  }
  function cage(c, x, y, s, whelpIn) {
    var w = 44 * s, h = 36 * s, o = E(x, y + 3, w * 0.66, 4 * s, '#000', 0, 0.3), bar = '';
    o += F('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h]) + 'Q' + pt([x, y - h - 20 * s]) + ' ' + pt([x + w / 2, y - h]) + 'L' + pt([x + w / 2, y]) + 'Z', '#1a1416', 0.45);
    if (whelpIn) o += cagedWhelp(c, x + 2 * s, y - 3 * s, s);
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

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    menethil_harbor: function (c) {
      var o = wlSky(c, '#56605e', '#848e88', '#b0b8ac') + overcast(c, 301, 16, '#727c7a', 10);
      o += peaks(c, 303, 124, 14, 36, '#727c7a', null, 60, 110) + peaks(c, 304, 126, 6, 18, '#66706c', null, 40, 70);
      o += lake(c, 122, 190, '#76867e', '#3e4e4a', 305, 34) + haze(c, 126, 18, 0.35);
      // the town bank on the right
      o += body(c, 'M168,190 C174,164 196,148 236,144 L404,138 L404,190 Z', '#6a7462', F('M168,190 C174,164 196,148 236,144 L404,138 L404,146 L238,150 C204,154 184,166 176,190 Z', '#8a9478', 0.7), 1.8);
      o += house(c, 190, 152, 36, 24, { door: 0.3, win: [[0.72, 0.55]], chim: true }) + keep(c, 300, 148, 1) + house(c, 364, 150, 40, 26, { door: 0.65, win: [[0.28, 0.6]], chim: true, roof: '#46525e' });
      o += lampPost(c, 236, 152, 34, 0.7) + lampPost(c, 352, 152, 34, 0.7);
      o += ship(c, 92, 166, 0.9);
      o += jetty(c, -4, 186, 178, 1);
      o += L('M' + pt([126, 150]) + 'Q' + pt([140, 170]) + ' ' + pt([150, 172]), OL, 1.4) + barrel(c, 40, 172, 0.7, '#7a5234') + crate(c, 158, 172, 0.7);
      // stone quay
      o += R(-2, 192, 404, 50, c.lg([[0, '#86867c'], [1, '#54544c']]));
      var jn = '', r = rng(307);
      for (var j = 0; j < 6; j++) { var yy = 192 + j * j * 1.6 + j * 6; jn += 'M-2,' + n(yy) + 'L402,' + n(yy); for (var k = 0; k < 14; k++) { var xx = (k + (j % 2) * 0.5) * (30 + j * 4) - 10; jn += 'M' + n(xx) + ',' + n(yy) + 'l' + n((xx - 200) * 0.03) + ',' + n(8 + j * 3); } }
      o += L(jn, '#4a4a44', 1, 0.7) + stoneFace(c, -4, 196, 408, 8, '#9a9a90', 8);
      for (var p = 0; p < 7; p++) o += E(30 + r() * 340, 206 + r() * 30, 14 + r() * 12, 2.4, '#c8d0cc', 0, 0.3);
      o += lampPost(c, 150, 228, 56, 1) + lampPost(c, 382, 232, 58, 1);
      o += barrel(c, 200, 210, 0.9) + barrel(c, 216, 214, 0.8, '#7a5234') + crate(c, 318, 212, 0.9) + sack(c, 336, 216, 0.8);
      return o + rain(309, 170, 0, 240, 0.38) + haze(c, 200, 24, 0.12) + vignette(c, '#e0e8e4', '#0e1412');
    },
    bluegill_marsh: function (c) {
      var o = wlSky(c) + overcast(c, 311, 14, '#6e7874', 9);
      o += farTrees(313, 128, '#56625a', 16, 30, 54) + reedLine(315, 132, '#5a6650', 120, 8, 20, -5, 405, 1.2);
      o += lake(c, 128, 172, '#6a786e', '#46544a', 317, 22) + haze(c, 134, 20, 0.35);
      o += stiltHut(c, 120, 146, 0.55, '#7e7048') + stiltHut(c, 338, 150, 0.7, '#7a6e46') + stiltHut(c, 232, 158, 0.95);
      o += reedLine(319, 160, '#4e5a44', 40, 10, 26, 150, 190, 1.4) + reeds(c, 186, 162, 0.8) + reeds(c, 292, 160, 0.7);
      o += body(c, 'M-4,172 C60,162 130,170 196,168 C262,166 330,162 404,160 L404,242 L-4,242 Z', MARSH, R(-4, 160, 408, 84, c.lg([[0, '#76866a', 0.5], [1, '#26301f', 0.85]])) + F('M-4,172 C60,162 130,170 196,168 C262,166 330,162 404,160 L404,166 C330,168 262,172 196,174 C130,176 60,168 -4,178 Z', '#8a9a74', 0.6), 1.8);
      o += pool(c, 128, 204, 50, 10) + pool(c, 300, 222, 38, 7) + pool(c, 372, 182, 22, 5) + pool(c, 40, 230, 30, 6);
      o += grass(321, 176, 238, '#3a4630', 50, 0.6, 1.5, 1.1) + pebbles(323, 180, 236, '#4a5040', 12);
      o += mossRock(c, 214, 190, 22, 12) + mossRock(c, 70, 186, 14, 8, '#7e7e76') + driftwood(c, 250, 200, 44, -0.06, 0.9);
      o += reeds(c, 22, 202, 1.25) + reeds(c, 172, 212, 1) + reeds(c, 86, 222, 0.9) + reeds(c, 360, 236, 1.3) + reeds(c, 268, 180, 0.8) + reeds(c, 394, 196, 1);
      return o + rain(325, 150, 0, 240, 0.34) + haze(c, 176, 20, 0.2) + vignette(c, '#e0e8e4', '#0e1410');
    },
    whelgars_excavation: function (c) {
      var o = wlSky(c, '#565e5a', '#86908a', '#aeb4a6') + overcast(c, 331, 14, '#707a76', 9);
      o += peaks(c, 333, 102, 22, 50, '#56606a', null, 50, 90);
      // the cut bank
      var bank = 'M-4,152 L-4,98 C40,90 90,82 150,86 C210,90 260,76 320,80 C360,82 390,90 404,88 L404,152 Z', st = '';
      for (var i = 0; i < 5; i++) st += 'M-4,' + n(104 + i * 10) + 'C100,' + n(96 + i * 11) + ' 260,' + n(88 + i * 12) + ' 404,' + n(96 + i * 11);
      o += body(c, bank, MUD, L(st, dk(MUD, 0.25), 1.4, 0.8) + F('M-4,98 C40,90 90,82 150,86 C210,90 260,76 320,80 C360,82 390,90 404,88 L404,96 C360,98 320,90 260,86 C210,98 150,94 90,92 C40,98 -4,106 -4,106 Z', MOSSD, 0.85) + pebbles(335, 104, 148, '#8a7a5e', 20), 1.8);
      o += grass(337, 90, 100, '#4a6230', 40, 0.6, 1, 1);
      // bones of a giant beast coming out of the bank
      o += L('M150,120 C180,104 220,100 262,108', OL, 9) + L('M150,120 C180,104 220,100 262,108', '#d0c4a4', 5);
      [[164, 150, 40, -10], [184, 152, 50, -14], [206, 152, 56, -16], [228, 152, 52, -14], [248, 150, 42, -10]].forEach(function (b) { o += rib(c, b[0], b[1], b[2], b[3], 9); });
      o += giantSkull(c, 112, 154, 0.8);
      o += scaffold(c, 300, 154, 56, 64) + L('M290,154 L286,92', OL, 5) + L('M290,154 L286,92', '#8a6a44', 3);
      o += ground(c, 150, '#6e6048', '#3a3024');
      o += pool(c, 180, 186, 34, 6, '#4a4a3e') + pool(c, 60, 214, 28, 5, '#4a4a3e') + pool(c, 290, 230, 30, 5, '#4a4a3e');
      var rt = 'M140,242 C160,210 180,190 200,168 M168,242 C186,212 204,192 222,168';
      o += L(rt, '#3a3024', 2.6, 0.7) + pebbles(339, 160, 236, '#8a7a5e', 18);
      o += nest(c, 338, 200, 1.1, 3) + nest(c, 70, 178, 0.8, 2);
      o += hideTent(c, 40, 156, 0.8, '#c0b08a') + crate(c, 250, 176, 0.9) + sack(c, 268, 180, 0.8) + barrel(c, 110, 176, 0.8);
      o += limb('M232,184 L248,164', '#6a4a2a', 2.6) + P('M240,160 Q250,158 258,166 L254,168 Q248,164 242,164 Z', c.cel('#8a8e96'), 1.2);
      o += tufts(c, [[20, 200, 0.7], [380, 216, 0.8], [150, 232, 0.6]], MOSSD) + mossRock(c, 390, 170, 20, 12) + bone(210, 212, 16, 0.4, 0.9) + bone(40, 236, 14, -0.3, 0.8);
      return o + rain(341, 140, 0, 240, 0.34) + haze(c, 150, 18, 0.18) + vignette(c, '#e0e8e4', '#120e0a');
    },
    saltspray_glen: function (c) {
      var o = wlSky(c, '#5e6868', '#8e9892', '#b8c0b6') + overcast(c, 351, 12, '#7a8482', 8, 0.9);
      o += lake(c, 110, 160, '#7c8c8a', '#566866', 353, 28) + waves(355, 116, 156, 30);
      o += F('M300,112 L316,96 L340,92 L352,84 L372,86 L404,80 L404,112 Z', '#707c78') + F('M352,84 L372,86 L404,80 L404,112 L360,112 Z', '#606c68');
      o += seaStack(c, 34, 142, 1) + seaStack(c, 70, 138, 0.6) + gulls(367, 7, 60, 300, 40, 90) + haze(c, 132, 24, 0.4, '#e0e8e8');
      o += L('M-4,150 C60,146 140,152 220,148 C300,144 360,148 404,146', '#f0f6f2', 2.4, 0.7) + hills(c, 357, 152, 20, '#728656', 60, 1.6) + hills(c, 359, 166, 16, '#667a4c', 50, 1.6);
      o += ground(c, 172, '#667a4c', '#34422a');
      o += hideTent(c, 236, 150, 0.9, '#7a6a48') + hideTent(c, 336, 144, 0.72, '#6a7446') + hideTent(c, 156, 160, 0.58, '#8a7650');
      o += boneTotem(c, 290, 150, 0.8) + driftwood(c, 180, 176, 50, 0.08, 0.9) + driftwood(c, 318, 168, 36, -0.1, 0.7);
      o += grass(361, 170, 238, '#3a4a2a', 60, 0.6, 1.6, 1.1) + flowers(363, 176, 236, ['#f0f0e0', '#e8d060'], 20);
      o += campfire(c, 262, 196, 0.6) + driftwood(c, 118, 222, 58, -0.05, 1.05) + driftwood(c, 300, 232, 40, 0.12, 1);
      o += tufts(c, [[120, 204, 0.8], [210, 224, 0.7], [380, 206, 0.9], [18, 236, 0.9]], '#6a8448') + mossRock(c, 360, 190, 22, 12) + bone(96, 230, 14, 0.5, 0.8);
      return o + rain(365, 110, 0, 240, 0.3) + haze(c, 180, 22, 0.14) + vignette(c, '#e8f0ec', '#0e140c');
    },
    dun_modr: function (c) {
      var o = wlSky(c, '#3e3e40', '#6a625c', '#a07c62') + overcast(c, 371, 12, '#524e4c', 9);
      o += peaks(c, 373, 118, 26, 58, '#3e4046', null, 50, 90);
      o += smoke(150, 110, 1.6, '#2e2a2a', 0.55, 0.5) + smoke(264, 96, 1.4, '#2e2a2a', 0.5, 0.7);
      // the hill
      o += body(c, 'M-4,176 C40,150 80,122 150,106 C200,94 260,96 310,110 C350,122 380,140 404,148 L404,242 L-4,242 Z', '#5e6450', R(-4, 90, 408, 160, c.lg([[0, '#707a5e', 0.5], [1, '#1e221a', 0.85]])) + F('M-4,176 C40,150 80,122 150,106 C200,94 260,96 310,110 C350,122 380,140 404,148 L404,154 C380,146 350,128 310,116 C260,102 200,100 150,112 C80,128 40,156 -4,182 Z', '#7a8466', 0.6), 2);
      o += F('M150,242 C170,200 196,150 210,108 L226,108 C230,150 244,200 262,242 Z', '#6e6656', 0.7);
      o += ruin(c, 96, 130, 44, 32, '#7e7c74', 375) + ruin(c, 280, 116, 46, 40, '#86847a', 377, 0.4) + ruin(c, 336, 138, 40, 26, '#7a786e', 379);
      o += dwarfGate(c, 218, 110, 0.9);
      o += forge(c, 160, 126, 0.6) + diBanner(c, 104, 132, 46, 0.8) + diBanner(c, 262, 116, 46, 0.8) + diBanner(c, 326, 138, 40, 0.7);
      o += forge(c, 176, 202, 0.75);
      o += rock(c, 300, 186, 26, 12, '#6e6c66') + rock(c, 380, 214, 30, 14, '#626058') + mossRock(c, 130, 216, 20, 10, '#76746c');
      o += stoneFace(c, 354, 176, 14, 30, '#8a887e', 8, [[0, 4], [7, -2], [14, 6]]) + rock(c, 250, 226, 18, 8, '#6e6c66');
      o += diBanner(c, 128, 232, 62, 1.1) + grass(381, 170, 238, '#2e3424', 36, 0.6, 1.5, 1);
      o += embers(383, 40, 20, 380, 60, 220);
      return o + rain(385, 100, 0, 240, 0.26) + haze(c, 150, 20, 0.14, '#b8a898') + vignette(c, '#f0d8c8', '#0e0a08');
    },
    angerfang_encampment: function (c) {
      var o = wlSky(c, '#3a3c42', '#62585a', '#94706a') + overcast(c, 391, 10, '#4e4c50', 9);
      o += peaks(c, 393, 132, 30, 70, '#3a3c44', null, 60, 110);
      o += grimBatol(c, 262, 138, 1.12, '#2e3036');
      o += farDragon(170, 46, 1.1, 1) + farDragon(330, 30, 0.9, -1) + farDragon(372, 70, 0.6, 1) + farDragon(120, 82, 0.55, -1);
      o += haze(c, 136, 16, 0.3, '#b8a8a8');
      o += body(c, 'M-4,150 C60,140 120,146 200,142 C280,138 340,142 404,138 L404,242 L-4,242 Z', '#5a544c', R(-4, 136, 408, 110, c.lg([[0, '#6e665c', 0.5], [1, '#1a1614', 0.85]])) + pebbles(395, 146, 236, '#7a7064', 26), 1.8);
      o += stakes(c, -4, 110, 152, 30, 397) + stakes(c, 300, 408, 150, 30, 399);
      o += hideTent(c, 80, 166, 0.8, '#5a3a2e') + hideTent(c, 350, 160, 0.7, '#4e3a30');
      o += limb('M232,168 L232,112', '#3a2a22', 5) + swag(232, 118, 186, 132, 10, 1) + swag(232, 124, 288, 136, 12, 1);
      o += cage(c, 172, 176, 0.95, true) + cage(c, 296, 166, 0.75, true);
      o += dmBanner(c, 128, 170, 62, 1) + dmBanner(c, 206, 168, 64, 1) + dmBanner(c, 384, 162, 54, 0.8);
      o += brazier(c, 214, 204, 0.8) + rock(c, 330, 196, 24, 12, '#5e5850') + rock(c, 30, 196, 20, 10, '#6a6258');
      o += skull(c, 184, 228, 1) + bone(204, 232, 16, 0.3, 0.9) + bone(280, 230, 14, -0.4, 0.8) + chain(150, 200, 26, 0.9);
      o += dmBanner(c, 144, 236, 72, 1.1) + grass(401, 170, 238, '#2e2a22', 30, 0.6, 1.4, 1);
      return o + embers(403, 30, 150, 300, 150, 230) + rain(405, 110, 0, 240, 0.26) + vignette(c, '#f0d8d8', '#0e0808');
    }
  };

  // ============================================================
  //  WETLANDS MOB PIECES
  // ============================================================
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
  // ---- the old matriarch: a heavy raptor, head low, jaws parted, scarred hide (facing left) ----
  function bigRaptor(c, o) {
    var col = o.col, bel = o.belly, dcol = dk(col, 0.22), sp = o.spot, scar = o.scar, s = shadow(c, 64, 52);
    // tail sweeping up behind
    var T = taper([[88, 66], [104, 60], [116, 44], [122, 26], [118, 14]], 22, 3, 6);
    s += body(c, T.d, col, F(ribbonBand(T, 0.6, 1), dk(col, 0.25), 0.8) + mottle(71, 10, 90, 16, 124, 66, sp, lt(col, 0.18), 1.6, 3)(), 2.2);
    // far leg
    s += body(c, ellD(86, 80, 13, 14), dcol, null, 2) + limb('M88,90 L98,104 L88,114 L90,117', dcol, 8) + birdFoot(90, 121, dk(col, 0.4), true);
    var bd = 'M30,60 C36,42 62,36 84,42 C100,46 106,62 100,78 C94,92 70,96 54,92 C38,88 28,76 30,60 Z';
    s += body(c, bd, col, F('M26,74 C40,94 76,98 104,80 L104,100 L26,100 Z', bel, 0.9) + F('M78,38 C98,44 108,62 102,82 L110,82 L110,38 Z', dk(col, 0.25), 0.8) + mottle(73, 16, 40, 44, 98, 80, sp, lt(col, 0.18), 1.8, 3.6)() +
      L('M52,48 L62,64 M58,46 L68,62 M76,50 L70,70', scar, 1.8) + L('M52,48 L62,64 M58,46 L68,62 M76,50 L70,70', '#fff0e8', 0.6, 0.7), 2.6);
    // spines down the back of the neck and shoulders
    s += P('M26,40 L28,30 L34,38 L38,28 L42,38 L48,30 L50,40 L58,34 L58,44 L68,40 L66,48 Z', c.cel(dk(col, 0.35)), 1.5);
    var nk = 'M40,70 C30,62 24,52 22,40 L42,32 C44,44 50,54 60,58 Z';
    s += body(c, nk, col, F('M20,44 L28,42 C32,56 38,64 46,70 L38,72 Z', bel, 0.85) + mottle(75, 5, 26, 38, 46, 62, sp, lt(col, 0.18), 1.4, 2.6)(), 2.4);
    // ragged crest
    s += P('M34,24 L36,6 L42,18 L48,4 L50,20 L60,12 L56,26 L66,24 L54,34 L40,34 Z', c.cel(o.crest), 1.6) + L('M44,20 L42,28 M52,18 L50,28', dk(o.crest, 0.4), 1.1);
    // big head: low, long snout, jaws parted
    s += P('M42,40 C42,50 32,56 18,58 L6,56 C4,53 7,50 12,49 C22,48 30,46 36,40 Z', c.cel(dk(col, 0.05)), 2) + P('M4,40 L38,40 C36,46 28,50 16,52 C10,52 6,48 4,44 Z', '#4a1210', 1.4);
    s += P('M8,51 L10,47 L12,51 Z M14,50.6 L16,46.4 L18,50.4 Z M20,49.4 L22,45.4 L24,49 Z M26,47.6 L28,44 L30,47 Z', '#f4ecd6', 0.7);
    var hd = 'M46,30 C40,20 22,20 12,26 L2,32 C-1,35 0,40 3,41 L20,42 C30,43 40,42 46,38 C50,36 50,33 46,30 Z';
    s += body(c, hd, col, F('M36,18 L54,18 L54,46 L40,46 C46,38 44,28 36,18 Z', dk(col, 0.25), 0.8) + mottle(77, 5, 10, 24, 40, 38, sp, lt(col, 0.18), 1.2, 2.2)() + L('M14,28 L30,40', scar, 1.8), 2.4);
    s += P('M3,41 L7,41 L6,46 Z M10,41.6 L14,41.6 L12,47 Z M18,42 L22,42 L20,47 Z M26,42 L30,42 L28,46.4 Z', '#fff', 0.8);
    s += P('M10,28 C18,22 28,22 34,26 L32,30 C26,27 18,27 12,31 Z', c.cel(dk(col, 0.3)), 1.4);
    s += E(24, 31, 2.6, 2, o.eye || '#ffb030', 1) + E(23.6, 31, 0.7, 1.5, OL) + L('M18,26 L30,33', scar, 1.6) + E(4.5, 33.5, 1.1, 0.9, OL);
    // clawed forearm
    var ah = [32, 76], tk = 'M' + pt(ah) + 'l-8,-5 M' + pt(ah) + 'l-7,3 M' + pt([ah[0] + 1, ah[1] + 1]) + 'l-3,8';
    s += limb('M50,70 L40,80 L32,76', col, 5.4) + L(tk, OL, 4) + L(tk, '#f4ecd6', 1.8);
    // near leg: huge thigh, sickle claw
    s += body(c, ellD(62, 78, 15, 16), col, mottle(79, 5, 50, 66, 74, 92, sp, lt(col, 0.18), 1.6, 3)() + L('M54,70 L66,86', scar, 1.6), 2.2);
    var x = 60, y = 121, k = 1.8;
    s += limb('M62,88 L72,104 L58,114 L60,117', col, 9) + birdFoot(x, y, dk(col, 0.35), true) +
      P('M' + pt([x - 4, y - 3]) + 'C' + pt([x - 4 - 7 * k, y - 3 - 6 * k]) + ' ' + pt([x - 4 - 5 * k, y - 3 - 13 * k]) + ' ' + pt([x - 4 + 1 * k, y - 3 - 13 * k]) + 'C' + pt([x - 4 + 0.4 * k, y - 3 - 8 * k]) + ' ' + pt([x - 3 + 1.6 * k, y - 3 - 4 * k]) + ' ' + pt([x, y - 5]) + 'Z', c.cel('#f4ecd6'), 1.4);
    return o.tf ? G(s, o.tf) : s;
  }
  // bluegill markings: dark vertical bars and the dark gill spot behind the eye
  function gillMarks() {
    return L('M50,46 C46,58 46,76 52,94 M62,44 C58,58 58,78 64,100 M74,50 C71,62 71,80 76,102 M85,60 C84,70 84,82 84,92', '#1a2e4a', 3.8, 0.6) + E(60, 62, 4.6, 5.4, '#14223e', 1.2) + E(59, 61, 1.4, 1.8, '#5a7ab0', 0, 0.8);
  }
  function shellStaff(c, bot, top) {
    var d = 'M' + pt(bot) + 'L' + pt(top), x = top[0], y = top[1];
    var o = limb(d, '#8a6a44', 3.4) + L(d, '#b89a70', 1, 0.6);
    o += C(x, y - 8, 20, glow(c, '#7ae8f0', 0.6));
    // spiral conch on top
    var sh = 'M' + pt([x - 3, y + 4]) + 'C' + pt([x - 12, y + 2]) + ' ' + pt([x - 13, y - 10]) + ' ' + pt([x - 5, y - 15]) + 'C' + pt([x + 2, y - 20]) + ' ' + pt([x + 12, y - 16]) + ' ' + pt([x + 10, y - 6]) + 'C' + pt([x + 9, y]) + ' ' + pt([x + 4, y + 4]) + ' ' + pt([x - 3, y + 4]) + 'Z';
    o += body(c, sh, '#f0d4b4', L('M' + pt([x + 7, y - 7]) + 'C' + pt([x + 6, y - 14]) + ' ' + pt([x - 4, y - 14]) + ' ' + pt([x - 5, y - 7]) + 'C' + pt([x - 5, y - 2]) + ' ' + pt([x + 2, y - 1]) + ' ' + pt([x + 2, y - 6]), '#b07860', 1.4) + F(pd([[x + 2, y - 22], [x + 14, y - 22], [x + 14, y + 6], [x + 4, y + 6]], true), '#c89078', 0.6), 1.6);
    o += P(pd([[x - 12, y - 4], [x - 19, y - 2], [x - 12, y + 1]], true), c.cel('#e8c0a0'), 1.1);
    o += L('M' + pt([x - 2, y + 6]) + 'L' + pt([x + 2, y + 10]) + 'M' + pt([x + 3, y + 5]) + 'L' + pt([x - 1, y + 12]), '#4a6a3a', 1.6);
    return o + C(x + 1, y - 24, 4.2, c.rg([[0, '#ffffff'], [0.5, '#bff8ff'], [1, '#4ac8e0']]), 1.3) + C(x - 1, y - 25.4, 1.2, '#fff');
  }
  function bubbleOrb(c, x, y, r) {
    return C(x, y, r * 2.4, glow(c, '#6ae8f0', 0.6)) + C(x, y, r, c.rg([[0, '#e8ffff', 0.9], [0.6, '#8ae8f0', 0.8], [1, '#3aa8c8', 0.9]]), 1.6) + L('M' + pt([x - r * 0.9, y + r * 0.1]) + 'C' + pt([x - r * 0.6, y - r * 0.8]) + ' ' + pt([x + r * 0.5, y - r * 0.9]) + ' ' + pt([x + r * 0.8, y - r * 0.2]), '#ffffff', 1.4, 0.8) +
      C(x - r * 0.4, y - r * 0.4, r * 0.22, '#fff') + C(x + r * 1.3, y + r * 0.9, 1.6, '#e8ffff', 0.8) + C(x - r * 1.2, y + r * 1.1, 1.3, '#e8ffff', 0.8) + C(x + r * 0.6, y - r * 1.5, 1.2, '#e8ffff', 0.8);
  }
  function mossClump(c, x, y, rx, ry, seed) { return P(shag(x, y, rx, ry, 6, 0.35, seed), c.cel(MOSS), 1.3) + F(shag(x - rx * 0.2, y - ry * 0.3, rx * 0.4, ry * 0.36, 5, 0.3, seed + 1), lt(MOSS, 0.25), 0.8); }
  // gourd rattle: stick, round seed-gourd painted with dots, a dangling fetish, shake marks
  function rattle(c, p, ang) {
    var q = dirQ(p, ang), tp = q(20, 0), o = haft(c, p, 16, ang, '#7a5a36', 3, 6);
    o += C(tp[0], tp[1], 9, glow(c, '#b8f070', 0.5)) + body(c, ellD(tp[0], tp[1], 7, 6), '#c8a060', C(tp[0] - 2, tp[1] - 1, 1.2, '#6a3a1a') + C(tp[0] + 2, tp[1] + 2, 1.2, '#6a3a1a') + C(tp[0] + 3, tp[1] - 2, 1, '#3a6a2a') + L('M' + pt([tp[0] - 7, tp[1]]) + 'Q' + pt([tp[0], tp[1] + 3]) + ' ' + pt([tp[0] + 7, tp[1]]), '#6a3a1a', 1), 1.6);
    o += L('M' + pt(q(8, 0)) + 'L' + pt(q(6, 10)), OL, 0.9) + bone(q(6, 12)[0], q(6, 12)[1], 7, 0.8, 0.45) + feathers(q(10, 2)[0], q(10, 2)[1], ['#e8e0c8', '#4a7a3a'], 0.45, 0.6);
    var sh = 'M' + pt(q(18, -12)) + 'l-3,-3 M' + pt(q(24, -11)) + 'l0,-4 M' + pt(q(29, -7)) + 'l3,-3';
    return o + L(sh, OL, 1.4, 0.8);
  }
  // ---- dwarf (after art_redridge.js rrDwarf) ----
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
  // black iron pauldron with ember-hot seams and two short spikes
  function diPad(c, x, y, r, col) {
    var o = P(pd([[x - r * 0.7, y - r * 0.3], [x - r * 1, y - r * 1.4], [x - r * 0.2, y - r * 0.6]], true), c.cel('#5a585e'), 1.2) + P(pd([[x + r * 0.1, y - r * 0.6], [x + r * 0.3, y - r * 1.6], [x + r * 0.7, y - r * 0.5]], true), c.cel('#5a585e'), 1.2);
    return o + body(c, 'M' + pt([x - r, y + r * 0.5]) + 'C' + pt([x - r * 1.1, y - r * 0.8]) + ' ' + pt([x + r * 1.1, y - r * 0.8]) + ' ' + pt([x + r, y + r * 0.5]) + 'Z', col,
      L('M' + pt([x - r * 0.8, y + r * 0.12]) + 'C' + pt([x - r * 0.6, y - r * 0.44]) + ' ' + pt([x + r * 0.6, y - r * 0.44]) + ' ' + pt([x + r * 0.8, y + r * 0.12]), EMBER, 1.3, 0.9) + F(pd([[x + r * 0.2, y - r], [x + r * 1.2, y - r], [x + r * 1.2, y + r], [x + r * 0.3, y + r]], true), '#000', 0.35), 2);
  }
  function diHelm(c, x, y) {
    var hc = '#2a282e';
    return body(c, 'M' + pt([x - 13, y - 4]) + 'C' + pt([x - 14, y - 19]) + ' ' + pt([x + 12, y - 21]) + ' ' + pt([x + 14, y - 4]) + 'L' + pt([x + 14, y + 6]) + 'L' + pt([x + 9, y + 5]) + 'L' + pt([x + 8, y - 3]) + 'L' + pt([x - 13, y - 2]) + 'Z', hc,
      L('M' + pt([x - 13, y - 5]) + 'L' + pt([x + 14, y - 4]), EMBER, 1.3, 0.85) + L('M' + pt([x - 1, y - 19]) + 'L' + pt([x - 2, y - 5]), '#4a484e', 2.2) + F(pd([[x + 4, y - 22], [x + 16, y - 22], [x + 16, y + 8], [x + 6, y + 8]], true), '#000', 0.4), 2) +
      P(pd([[x - 3, y - 18], [x - 1, y - 30], [x + 2, y - 18]], true), c.cel('#5a585e'), 1.2) + C(x - 9, y - 6, 1, '#8a888e') + C(x + 3, y - 6, 1, '#8a888e');
  }
  // two-handed maul: iron block with a molten core
  function maul(c, p, len, ang, hw) {
    var q = dirQ(p, ang), o = haft(c, p, len + 3, ang, '#3a2a22', 4.2, 12);
    var hd = pd([q(len - hw * 0.7, -hw * 1.1), q(len + hw * 0.7, -hw * 1.1), q(len + hw * 0.8, hw * 0.9), q(len - hw * 0.8, hw * 0.9)], true);
    var ctr = q(len, -hw * 0.1);
    o += C(ctr[0], ctr[1], hw * 2.2, glow(c, EMBER, 0.45)) + body(c, hd, '#34323a', L('M' + pt(q(len - hw * 0.72, -hw * 0.1)) + 'L' + pt(q(len + hw * 0.72, -hw * 0.1)), EMBER, 2) + L('M' + pt(q(len - hw * 0.4, -hw * 1)) + 'L' + pt(q(len - hw * 0.4, hw * 0.8)) + 'M' + pt(q(len + hw * 0.4, -hw * 1)) + 'L' + pt(q(len + hw * 0.4, hw * 0.8)), '#1a181c', 1.2), 2.2);
    return o + C(ctr[0], ctr[1], 2.4, '#ffd070') + P(pd([q(len + hw * 0.7, -hw * 0.5), q(len + hw * 1.5, -hw * 0.1), q(len + hw * 0.7, hw * 0.3)], true), c.cel('#5a585e'), 1.1);
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
  // ---- Wyrmchain orc ----
  function warPaint(c, x, y, eye) {
    return F(pd([[x - 16, y - 3], [x - 8, y - 5], [x + 3, y - 6], [x + 5, y - 2], [x - 2, y + 2], [x - 9, y + 3], [x - 15, y + 2]], true), '#b01a14', 0.9) + L('M' + pt([x - 14, y - 4]) + 'L' + pt([x - 1, y - 2]), OL, 2.6) + C(x - 7, y + 0.5, 1.8, eye || '#ffd040', 1) + C(x - 7.4, y + 0.1, 0.6, '#fff');
  }
  function dmOrc(c, o) {
    var sk = o.skin || '#869a52';
    return biped(c, {
      skin: sk, shirt: o.shirt || DMRED, pants: o.pants || '#2a2224', sleeve: o.sleeve || sk, forearm: o.forearm, glove: o.glove || DMBLK, boots: o.boots || '#1a1416', belt: o.belt || '#1e1a1a', buckle: o.buckle || '#c8c0a8',
      head: function (c, x, y) { return orcHead(c, x, y, { skin: sk, eye: o.eye || '#ffcc30', bald: o.bald, hood: o.hood }) + warPaint(c, x, y, o.eye) + (o.headX ? o.headX(c, x, y) : ''); }, hx: o.hx || 58, hy: o.hy || 32, neckCol: sk,
      torsoD: o.torsoD || 'M42,50 C50,43 80,43 88,50 L86,70 L82,88 L46,88 L42,70 Z', legW: o.legW || 11.5, armW: o.armW || 10.5, shadowR: o.shadowR || 34,
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, shins: o.shins, top: o.top,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, tf: o.tf
    });
  }
  // overlapping dragon-scale plates (rows of scallops) inside an area
  function scaleRows(x0, y0, x1, y1, col, sz) {
    sz = sz || 6; var o = '';
    for (var y = y0, j = 0; y < y1; y += sz * 0.8, j++) for (var x = x0 + (j % 2) * sz / 2; x < x1; x += sz) o += 'M' + pt([x, y]) + 'q' + n(sz / 2) + ',' + n(sz * 0.9) + ' ' + n(sz) + ',0';
    return L(o, col, 1.1, 0.9);
  }
  function scalePad(c, x, y, r, col) {
    col = col || '#a82a1e'; var o = '';
    [[-0.6, 0.1], [0, -0.25], [0.6, 0.1]].forEach(function (k, i) { var px = x + k[0] * r, py = y + k[1] * r; o += P('M' + pt([px - r * 0.55, py - r * 0.3]) + 'C' + pt([px - r * 0.55, py + r * 0.5]) + ' ' + pt([px, py + r * 0.9]) + ' ' + pt([px, py + r * 0.9]) + 'C' + pt([px, py + r * 0.9]) + ' ' + pt([px + r * 0.55, py + r * 0.5]) + ' ' + pt([px + r * 0.55, py - r * 0.3]) + 'Z', c.cel(i === 1 ? lt(col, 0.08) : col), 1.5); });
    o += body(c, 'M' + pt([x - r, y + r * 0.1]) + 'C' + pt([x - r * 1.05, y - r * 0.9]) + ' ' + pt([x + r * 1.05, y - r * 0.9]) + ' ' + pt([x + r, y + r * 0.1]) + 'Z', DMBLK, F(pd([[x + r * 0.2, y - r], [x + r * 1.2, y - r], [x + r * 1.2, y + r], [x + r * 0.3, y + r]], true), '#000', 0.3), 2);
    return o + P(pd([[x - 3, y - r * 0.6], [x + 1, y - r * 1.7], [x + 4, y - r * 0.6]], true), c.cel('#d8ccb0'), 1.2);
  }
  // spiked war axe: broad blade, a back spike, a top spike, jagged teeth on the blade's back; optional fire along the edge
  function spikedAxe(c, p, len, ang, bw, fire) {
    var q = dirQ(p, ang), o = axe(c, p, len, ang, bw, fire ? '#4a464c' : '#9a9ea6', false, '#3a2a22');
    o += P(pd([q(len + 1, -2), q(len + 16, 0), q(len + 1, 2)], true), c.cel('#b8bcc0'), 1.2);
    o += P(pd([q(len - bw * 0.2, 1.5), q(len - bw * 0.1, bw * 1.1), q(len - bw * 0.55, 1.5)], true), c.cel('#8a8e96'), 1.3);
    [0.25, 0.55, 0.85].forEach(function (t) { var b = q(len - bw * t, -1.5); o += P(pd([[b[0], b[1]], q(len - bw * t - 3, -bw * 0.3), q(len - bw * t + 3, -bw * 0.3)], true), c.cel('#8a8e96'), 0.9); });
    if (fire) {
      var e0 = q(len + 4, -bw * 0.7), e1 = q(len - bw * 0.5, -bw * 1.05), e2 = q(len - bw * 0.95, -bw * 0.74);
      o += C(e1[0], e1[1], bw * 2.2, glow(c, '#ff7a1a', 0.6));
      [e0, e1, e2, q(len - bw * 0.1, -bw * 0.95)].forEach(function (e, i) { o += flame(c, e[0], e[1] + 3, 0.62 - i * 0.04, '#ff5a1a', '#ffd84a'); });
      o += L('M' + pt(e0) + 'L' + pt(e1) + 'L' + pt(e2), '#ffe070', 1.6, 0.9);
    }
    return o;
  }
  function robe(c, col, trim) {
    return body(c, 'M46,84 L82,84 L90,120 L74,118 L64,122 L54,118 L38,120 Z', col, L('M64,86 L64,120', trim, 2.4) + L('M40,116 L54,114 L64,118 L74,114 L88,116', trim, 1.8) + F('M70,80 L96,80 L96,124 L76,124 Z', '#000', 0.3) + dmMark(56, 100, 0.7, trim), 2);
  }
  function topknot(c, x, y) { return P('M' + pt([x - 2, y - 15]) + 'C' + pt([x + 2, y - 24]) + ' ' + pt([x + 10, y - 24]) + ' ' + pt([x + 10, y - 15]) + 'Z', '#1e1812', 1.6) + P('M' + pt([x + 7, y - 21]) + 'C' + pt([x + 18, y - 26]) + ' ' + pt([x + 24, y - 16]) + ' ' + pt([x + 22, y - 4]) + 'C' + pt([x + 18, y - 12]) + ' ' + pt([x + 14, y - 16]) + ' ' + pt([x + 8, y - 17]) + 'Z', c.cel('#1e1812'), 1.6) + R(x + 4, y - 22, 5, 4, c.cel(DMRED), 1); }
  // skull-crested war helm for Garneg (x, y = orc head centre)
  function skullHelm(c, x, y) {
    var hc = '#2a2428', o = '';
    o += P('M' + pt([x + 6, y - 14]) + 'C' + pt([x + 18, y - 20]) + ' ' + pt([x + 30, y - 12]) + ' ' + pt([x + 34, y - 20]) + 'C' + pt([x + 26, y - 22]) + ' ' + pt([x + 16, y - 28]) + ' ' + pt([x + 8, y - 22]) + 'Z', c.cel('#d8ccb0'), 1.5);
    o += body(c, 'M' + pt([x - 15, y - 4]) + 'C' + pt([x - 16, y - 17]) + ' ' + pt([x - 4, y - 25]) + ' ' + pt([x + 6, y - 24]) + 'C' + pt([x + 16, y - 23]) + ' ' + pt([x + 18, y - 9]) + ' ' + pt([x + 16, y + 10]) + 'L' + pt([x + 8, y + 11]) + 'L' + pt([x + 6, y - 3]) + 'L' + pt([x - 15, y - 3]) + 'Z', hc,
      F(pd([[x + 4, y - 26], [x + 20, y - 26], [x + 20, y + 14], [x + 8, y + 14]], true), '#000', 0.4) + L('M' + pt([x - 14, y - 7]) + 'L' + pt([x + 16, y - 6]), DMRED, 2.2), 2.2) + P(pd([[x - 3, y - 3], [x - 1, y + 6], [x + 1, y - 3]], true), c.cel(hc), 1.2);
    // the crest: a horned beast skull riding on top of the helm, horns swept out sideways
    var sx = x - 2, sy = y - 21, k = '';
    k += P('M' + pt([sx - 8, sy + 2]) + 'C' + pt([sx - 16, sy - 2]) + ' ' + pt([sx - 22, sy + 2]) + ' ' + pt([sx - 28, sy - 4]) + 'C' + pt([sx - 22, sy - 8]) + ' ' + pt([sx - 14, sy - 6]) + ' ' + pt([sx - 6, sy - 4]) + 'Z', c.cel('#e8dcc0'), 1.4);
    k += P('M' + pt([sx + 8, sy - 2]) + 'C' + pt([sx + 16, sy - 6]) + ' ' + pt([sx + 22, sy - 4]) + ' ' + pt([sx + 28, sy - 10]) + 'C' + pt([sx + 22, sy - 13]) + ' ' + pt([sx + 14, sy - 11]) + ' ' + pt([sx + 6, sy - 8]) + 'Z', c.cel('#d8ccb0'), 1.4);
    k += P('M' + pt([sx - 10, sy + 6]) + 'C' + pt([sx - 12, sy - 4]) + ' ' + pt([sx - 4, sy - 9]) + ' ' + pt([sx + 4, sy - 8]) + 'C' + pt([sx + 12, sy - 6]) + ' ' + pt([sx + 12, sy + 2]) + ' ' + pt([sx + 8, sy + 7]) + 'L' + pt([sx - 2, sy + 9]) + 'Z', c.cel('#ece2c8'), 1.8);
    k += E(sx - 4.4, sy - 0.5, 2.6, 2.8, OL) + E(sx + 3.6, sy - 0.5, 2.2, 2.6, OL) + gEye(c, sx - 4.4, sy - 0.5, 1, '#ff6a1a') + P(pd([[sx - 1, sy + 3], [sx + 1, sy + 1.4], [sx + 2, sy + 4]], true), OL, 0.8);
    k += P('M' + pt([sx - 10, sy + 6]) + 'L' + pt([sx - 8, sy + 11]) + 'L' + pt([sx - 5.5, sy + 7.6]) + 'L' + pt([sx - 3, sy + 12]) + 'L' + pt([sx - 0.5, sy + 8.6]) + 'Z', '#f4ecd6', 1);
    o += k;
    return o;
  }
  function cape(c, col) {
    return body(c, 'M80,46 C96,50 104,74 108,112 L94,116 L84,108 L74,114 C80,90 80,66 76,50 Z', col, F('M92,50 L112,50 L112,118 L96,118 Z', '#000', 0.3) + L('M84,60 C90,76 92,94 92,112', dk(col, 0.35), 1.2), 2);
  }
  function collar(c) {
    var o = P('M34,62 C38,70 48,72 54,66 L55,71 C48,78 36,76 32,67 Z', c.cel('#6a6870'), 1.5) + C(40, 70, 1, '#b8bcc0') + C(47, 71, 1, '#b8bcc0');
    return o + P(pd([[52, 66], [57, 62], [58, 68], [55, 71]], true), c.cel('#5a585e'), 1.2) + chainLinks(40, 76, 3);
  }
  function chainLinks(x, y, k) {
    var o = ''; for (var i = 0; i < k; i++) { var cy = y + i * 5; o += '<ellipse cx="' + n(x + i * 1.5) + '" cy="' + n(cy) + '" rx="' + (i % 2 ? 1.4 : 2.6) + '" ry="3" fill="none" stroke="' + OL + '" stroke-width="3.2"/><ellipse cx="' + n(x + i * 1.5) + '" cy="' + n(cy) + '" rx="' + (i % 2 ? 1.4 : 2.6) + '" ry="3" fill="none" stroke="#8a8e96" stroke-width="1.4"/>'; }
    return o + P(pd([[x + k * 1.5 - 2, y + k * 5 - 2], [x + k * 1.5 + 1, y + k * 5 + 2], [x + k * 1.5 + 3, y + k * 5 - 1]], true), '#8a8e96', 0.9);
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    bluegill_raider: function (c) {
      return mireling(c, {
        skin: '#35818a', belly: '#f0b04a', fin: '#223a6e', eyeC: '#f4f0c0', angry: true, marks: gillMarks,
        fItem: function (c) { return spear(c, [17, 26], [24, 122], 16, '#e4dcc4', '#8a6a44') + L('M18,30 l-3,6 M20,30 l3,7', '#8a2a1a', 1.4) + P(pd([[20, 33], [26, 40], [21, 38]], true), '#c83a2a', 0.8); }
      });
    },
    bluegill_oracle: function (c) {
      return mireling(c, {
        skin: '#5aae9e', belly: '#f4d890', fin: '#7a3a8a', eyeC: '#e8fcff', marks: gillMarks, scale: 0.97,
        back: function (c) { return shellStaff(c, [92, 120], [100, 26]); },
        head: function (c) { var x = 60, y = 37; return P('M' + pt([x - 10, y + 4]) + 'C' + pt([x - 10, y - 6]) + ' ' + pt([x - 4, y - 10]) + ' ' + pt([x, y - 10]) + 'C' + pt([x + 4, y - 10]) + ' ' + pt([x + 10, y - 6]) + ' ' + pt([x + 10, y + 4]) + 'Z', c.cel('#f0b8a8'), 1.5) + L('M' + pt([x, y + 4]) + 'L' + pt([x - 7, y - 4]) + 'M' + pt([x, y + 4]) + 'L' + pt([x - 2, y - 9]) + 'M' + pt([x, y + 4]) + 'L' + pt([x + 3, y - 9]) + 'M' + pt([x, y + 4]) + 'L' + pt([x + 7, y - 4]), '#b87a6a', 1) + P(pd([[x - 4, y + 3], [x + 4, y + 3], [x + 2, y + 7], [x - 2, y + 7]], true), c.cel('#e0a090'), 1); },
        front: function (c) { var o = L('M38,92 Q56,102 76,94', '#3a2a1a', 1.4); [[42, 95], [49, 98], [56, 99.4], [63, 98.6], [70, 96.4]].forEach(function (b, i) { o += C(b[0], b[1] + 2, 2.2, i % 2 ? '#f0d0b0' : '#8ae8f0', 1); }); return o; },
        fItem: function (c) { var ring = 'M4,70 C4,58 26,56 28,66 M26,78 C24,88 6,88 4,80'; return bubbleOrb(c, 16, 72, 8.5) + L(ring, dk('#6ae8f0', 0.35), 3.4) + L(ring, '#bff8ff', 1.4); }
      });
    },
    mottled_raptor: function (c) {
      var sp = '#3e3a1c', li = '#aaa466';
      return raptor(c, {
        col: '#7c6e40', belly: '#d8cc98', crest: '#4e6a34', eye: '#ffc040', talons: true, sickleK: 1.3,
        bodyMark: mottle(11, 14, 44, 50, 90, 80, sp, li), tailMark: mottle(13, 8, 84, 36, 122, 72, sp, li, 1.4, 2.8), neckMark: mottle(15, 4, 34, 42, 54, 62, sp, li, 1.2, 2.4),
        headMark: mottle(17, 4, 16, 30, 40, 42, sp, li, 1, 2), thighMark: mottle(19, 4, 56, 68, 72, 84, sp, li, 1.2, 2.4)
      });
    },
    mottled_screecher: function (c) {
      var sp = '#4a3a1a', li = '#b8b070';
      var s = raptor(c, {
        col: '#6e7a46', belly: '#e0d8a4', crest: '#d8742a', eye: '#ffe060', open: true, headTf: 'rotate(24 44 46)',
        crestD: 'M38,34 L32,10 L42,24 L44,4 L50,22 L58,6 L56,26 L68,18 L60,34 L68,40 L46,42 Z',
        bodyMark: mottle(21, 12, 44, 50, 90, 80, sp, li), tailMark: mottle(23, 7, 84, 36, 122, 72, sp, li, 1.4, 2.6), neckMark: mottle(25, 4, 34, 42, 54, 62, sp, li, 1.2, 2.2),
        headMark: mottle(27, 3, 18, 30, 40, 40, sp, li, 1, 1.8), thighMark: mottle(29, 3, 56, 68, 72, 84, sp, li, 1.2, 2.2)
      });
      var sc = 'M' + pt([8, 18]) + 'q-6,4 -6,12 M' + pt([14, 10]) + 'q-8,2 -12,8 M' + pt([22, 6]) + 'q-6,-2 -12,0';
      return G(s + L(sc, OL, 3.2) + L(sc, '#fff8e0', 1.4), at(0.84, 64, 122));
    },
    mosshide_gnoll: function (c) {
      return rrGnoll(c, {
        fur: '#6e7c46', mane: '#3a4624', spot: '#465228', eye: '#ffd03a', loin: '#5a4a30', belt: '#3a2a1a',
        pads: function (c) { return mossClump(c, 46, 58, 12, 7, 31) + mossClump(c, 82, 54, 9, 6, 33); },
        chest: function (c) { return E(66, 78, 4, 3, lt(MOSS, 0.2), 0, 0.8) + E(56, 66, 3, 2.2, lt(MOSS, 0.2), 0, 0.8) + L('M44,58 L80,86', OL, 4.6) + L('M44,58 L80,86', '#5a4028', 2.8); },
        headX: function (c, x, y) { return mossClump(c, x + 4, y - 11, 8, 4, 35); },
        near: [[48, 60], [36, 66], [26, 62]], wNear: function (c, p) { return club(c, p, 36, -PI / 2 - 0.3, '#6a4a2e', false) + mossClump(c, p[0] - 12, p[1] - 34, 7, 5, 37); },
        tf: at(0.98, 64, 122)
      });
    },
    mosshide_mystic: function (c) {
      return rrGnoll(c, {
        fur: '#86925a', mane: '#4a5a2e', spot: '#56622e', eye: '#d8ff7a', glowEye: '#b8f070', loin: '#3a5a4a', belt: '#4a3a24', armW: 9.5,
        headX: function (c, x, y) { return peltHood(c, x, y, '#6a5236') + mossClump(c, x + 6, y - 17, 8, 4, 41); },
        chest: function (c) { return boneNecklace(c, 60, 58, 14); },
        far: [[84, 58], [96, 46], [100, 32]], wFar: function (c, p) { return rattle(c, p, -PI / 2 + 0.25); },
        near: [[48, 60], [36, 70], [24, 70]], wNearFront: function (c, p) { return orb(c, p[0] - 2, p[1] - 11, 5, '#b8f070') + C(p[0] - 10, p[1] - 20, 1.3, '#e0ffb0') + C(p[0] + 4, p[1] - 24, 1.1, '#e0ffb0'); },
        tf: at(0.95, 64, 122)
      });
    },
    dark_iron_dwarf: function (c) {
      var pl = '#36343c';
      return dwarfRig(c, {
        skin: '#5e5a64', hair: '#1c181a', band: '#c85a1e', scar: true, beardLen: 30, shirt: pl, sleeve: pl, forearm: '#38363c', pants: '#242226', glove: '#3a383e', belt: '#1e1c1e', buckle: '#4a484e', buckleIn: EMBER,
        helm: diHelm,
        headX: function (c, x, y) { return gEye(c, x - 5.6, y - 3.2, 1.4, '#ff8a2a'); },
        chest: function (c) { return L('M42,72 L86,72 M44,84 L86,84', '#18161a', 1.4) + L('M42,70 L86,70', EMBER, 1, 0.7) + C(46, 78, 1.2, '#6a686e') + C(82, 78, 1.2, '#6a686e'); },
        pads: function (c) { return diPad(c, 82, 60, 11, '#343238') + diPad(c, 44, 62, 13, '#3a383e'); },
        shins: function (c) { return P('M44,106 L58,106 L58,116 L44,116 Z', c.cel('#34323a'), 1.4) + P('M66,106 L80,106 L80,116 L66,116 Z', c.cel('#2a282e'), 1.4) + L('M44,110 L58,110 M66,110 L80,110', EMBER, 1, 0.7); },
        near: [[44, 62], [34, 72], [30, 82]], wNear: function (c, p) { return maul(c, p, 42, -PI / 2 - 0.38, 11); },
        far: [[84, 62], [70, 76], [42, 84]]
      });
    },
    dark_iron_saboteur: function (c) {
      var lea = '#4a3a2e';
      return dwarfRig(c, {
        skin: '#5a5660', hair: '#221c1c', band: '#8a8e96', beardLen: 22, shirt: lea, sleeve: '#3e3028', forearm: '#5a5660', pants: '#34302c', glove: '#3a2e26', belt: '#2e2420', buckle: '#8a8e96',
        helm: function (c, x, y) { return body(c, 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 13, y - 18]) + ' ' + pt([x + 12, y - 19]) + ' ' + pt([x + 13, y - 4]) + 'Z', '#5a4636', L('M' + pt([x - 2, y - 18]) + 'L' + pt([x - 2, y - 4]), '#3a2a20', 1.2), 1.8) + L('M' + pt([x - 13, y - 7]) + 'L' + pt([x + 13, y - 7]), OL, 3.4) + L('M' + pt([x - 13, y - 7]) + 'L' + pt([x + 13, y - 7]), '#2a221c', 2) + C(x - 9, y - 10, 4, c.cel('#8a8e96'), 1.4) + C(x - 9, y - 10, 2.4, '#ffa040') + C(x - 1, y - 11, 3.6, c.cel('#8a8e96'), 1.4) + C(x - 1, y - 11, 2.1, '#ffa040') + C(x - 9.6, y - 10.8, 0.7, '#fff'); },
        headX: function (c, x, y) { return gEye(c, x - 5.6, y - 3.2, 1.3, '#ff8a2a') + F('M' + pt([x - 14, y + 2]) + 'L' + pt([x - 8, y + 4]) + 'L' + pt([x - 10, y + 8]) + 'Z', '#1a1414', 0.3); },
        back: function (c) { var o = body(c, 'M78,48 L100,44 L104,84 L82,88 Z', '#5a4636', L('M80,60 L102,58 M81,72 L103,70', '#3a2a20', 1.4), 2); [[84, 40], [90, 38], [96, 36], [102, 38]].forEach(function (d) { o += dynamite(c, d[0], d[1] + 26, -PI / 2 + 0.06, 26); }); return o + L('M90,40 C96,30 104,30 106,24', OL, 1.8) + L('M90,40 C96,30 104,30 106,24', '#c8a060', 0.8); },
        chest: function (c) { return L('M84,56 L46,90 M44,58 L82,88', OL, 5) + L('M84,56 L46,90 M44,58 L82,88', '#6a4e36', 3) + R(60, 70, 8, 6, c.cel('#8a8e96'), 1.2) + F('M50,76 C56,80 66,82 72,78 L70,86 L52,86 Z', '#1a1414', 0.25); },
        front: function (c) { return body(c, 'M46,86 L82,86 L80,108 L48,108 Z', '#6a5440', L('M48,94 L80,94', '#3a2a20', 1.2) + E(64, 100, 5, 3, '#2a2020', 0, 0.35), 1.8); },
        near: [[44, 62], [36, 52], [30, 42]], wNearFront: function (c, p) { return bomb(c, p[0] - 4, p[1] - 8, 7.5); },
        far: [[84, 62], [92, 76], [90, 90]], wFar: function (c, p) { return dynamite(c, p[0] - 2, p[1] + 4, -0.3, 20); }
      });
    },
    dragonmaw_grunt: function (c) {
      var sk = '#869a52';
      return dmOrc(c, {
        skin: sk, shirt: '#8e1c16', sleeve: sk, forearm: DMBLK, pants: '#2a2224',
        chest: function (c) { return scaleRows(46, 52, 86, 82, '#5a0e0a') + L('M82,48 L50,88', OL, 6) + L('M82,48 L50,88', DMBLK, 3.8) + C(66, 68, 3, c.cel('#c8c0a8'), 1.2) + dmMark(56, 60, 0.6, '#1a1414'); },
        pads: function (c) { return scalePad(c, 82, 50, 10, '#8e1c16') + scalePad(c, 46, 52, 12, '#a82a1e'); },
        front: function (c) { return body(c, 'M48,84 L82,84 L82,104 L72,100 L66,108 L60,100 L48,104 Z', DMBLK, L('M50,100 L60,98 L66,104 L72,98 L80,100', DMRED, 2), 1.8); },
        shins: function (c) { return P('M46,102 L58,102 L58,114 L46,114 Z', c.cel('#262024'), 1.4) + P('M66,102 L78,102 L78,114 L66,114 Z', c.cel('#1e181c'), 1.4) + L('M46,107 L58,107 M66,107 L78,107', DMRED, 1.6); },
        headX: function (c, x, y) { return P(pd([[x - 12, y + 3], [x - 18, y - 2], [x - 13, y - 1]], true), '#f4ecd6', 0.9); },
        near: [[48, 54], [38, 46], [32, 36]], wNear: function (c, p) { return spikedAxe(c, p, 30, -PI / 2 - 0.25, 15); },
        far: [[80, 54], [92, 66], [96, 80]],
        tf: at(1.02, 64, 122)
      });
    },
    dragonmaw_shadowcaster: function (c) {
      var rb = '#2a1e2e', sw = '#8a3ad8';
      return dmOrc(c, {
        skin: '#7e9050', shirt: rb, sleeve: rb, forearm: '#7e9050', pants: rb, boots: '#1a1416', bald: true, eye: '#e0b0ff', armW: 9.5,
        headX: function (c, x, y) { return topknot(c, x, y) + L('M' + pt([x - 10, y + 12]) + 'l-2,5 M' + pt([x - 5, y + 13]) + 'l0,5', '#b01a14', 1.4); },
        chest: function (c) { return P('M58,48 L70,48 L68,88 L60,88 Z', c.cel(DMRED), 1.2) + skull(c, 64, 60, 0.55) + L('M46,52 Q64,62 84,52', OL, 3) + L('M46,52 Q64,62 84,52', '#d8ccb0', 1.4); },
        front: function (c) { return robe(c, rb, DMRED); },
        pads: function (c) { var o = body(c, 'M34,58 C34,46 58,42 62,54 L58,62 L38,64 Z', '#3a2a3e', L('M36,56 C44,50 54,50 60,56', DMRED, 1.4), 1.8); [[38, 50], [46, 45], [54, 45]].forEach(function (b) { o += P(pd([[b[0] - 2.4, b[1] + 3], [b[0] - 2, b[1] - 9], [b[0] + 2.4, b[1] + 3]], true), c.cel('#e0d6bc'), 1.1); }); return o; },
        far: [[80, 54], [92, 46], [96, 34]], wFar: function (c, p) { return shadowSwirl(c, [p[0], p[1] - 8], 0.9, '#6a2ab0'); },
        near: [[48, 54], [36, 62], [26, 60]], wNearFront: function (c, p) { return shadowSwirl(c, [p[0] - 4, p[1] - 6], 1.15, sw) + C(p[0] - 10, p[1] - 16, 1.4, '#ff4a2a') + C(p[0] + 4, p[1] - 22, 1.2, '#ff4a2a'); }
      });
    },
    crimson_whelp: function (c) { return whelp(c, { col: '#b8281e', belly: '#f0b858', mem: '#5e1412', eye: '#ffe040', scale: 0.94, neckX: collar }); },
    garneg_charskull: function (c) {
      var pl = '#2a2428', sk = '#7e9248';
      return dmOrc(c, {
        skin: sk, shirt: '#7e1812', sleeve: sk, forearm: pl, pants: '#221c20', glove: DMBLK, legW: 13, armW: 12, shadowR: 42, hy: 37, eye: '#ffb030',
        torsoD: 'M38,50 C46,42 84,42 92,50 L90,72 L86,90 L44,90 L40,72 Z',
        back: function (c) { return cape(c, '#6a1410'); },
        chest: function (c) { return P('M44,52 L86,52 L82,78 L48,78 Z', c.cel(pl), 1.8) + scaleRows(48, 56, 82, 76, '#4a3a40') + L('M46,53 L85,53', DMRED, 2.2) + dmMark(65, 64, 1.1, '#d82a1e') + skull(c, 65, 84, 0.6); },
        front: function (c) { return body(c, 'M46,86 L84,86 L86,106 L72,102 L66,110 L60,102 L44,106 Z', pl, L('M46,88 L84,88', DMRED, 2) + L('M48,102 L60,100 L66,106 L72,100 L84,102', DMRED, 1.6), 1.8); },
        shins: function (c) { return P('M46,104 L60,104 L58,116 L48,116 Z', c.cel(pl), 1.6) + P('M66,104 L80,104 L78,116 L68,116 Z', c.cel(dk(pl, 0.15)), 1.6); },
        pads: function (c) { return scalePad(c, 84, 50, 12, '#7e1812') + scalePad(c, 44, 50, 15, '#962018'); },
        headX: function (c, x, y) { return skullHelm(c, x, y); },
        near: [[46, 56], [38, 66], [32, 64]], wNear: function (c, p) { return spikedAxe(c, p, 30, -PI / 2 - 0.06, 15, true); },
        far: [[82, 54], [92, 68], [94, 82]],
        tf: at(1.05, 64, 122)
      });
    },
    razormaw_matriarch: function (c) {
      return bigRaptor(c, { col: '#6a6452', belly: '#c8bc98', spot: '#3a3628', scar: '#d8908a', crest: '#8a2a1e', eye: '#ffb030', tf: at(1.02, 64, 122) });
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#6a7a5a'), 2.5); }
  function phScene(c) { return wlSky(c) + ground(c, 150, '#62705a', '#2e3a2a'); }
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
