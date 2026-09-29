/* art_ashenvale.js — Elderglen zone art for Realm of Loner (contested, levels 22-30: Ilvaris, Stumpwatch,
 * the Coral Strand, Lake Aurel, Briarpelt Village, Grey Wolf Vale, Hornhold, Gloomfire Hill) plus the
 * The Tidehollow Deeps dungeon (flooded temple, altar depths).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Elderglen keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, the bear, wolf, turtle and murloc rigs and the house-style scene pieces are shared copies of
 * art_hillsbrad.js / art_barrens.js / art_redridge.js so the zones match.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix av<counter>_).
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
  function Ctx() { this.p = 'av' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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


  // ============================================================
  //  ASHENVALE PIECES
  // ============================================================
  var PINE = '#2e5a3a', PINED = '#1f4030';
  var TRUNK = '#5e4072', TRUNKD = '#3e2a52', LEAF = '#2e8a7e', LEAFD = '#1e5a5a', NEV = '#7a5aaa', SILVER = '#d4dcec', GLOWB = '#8ae8ff',
    FEL = '#4af03a', FELL = '#d8ffa0', HRED = '#a82020', HWOOD = '#8a6440', SAND = '#b4a8bc';
  function avSky(c, top, mid, bot) { return sky(c, top || '#1e1a40', mid || '#3e3c78', bot || '#7a70b0'); }
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
  // crescent, bulging left with the horns to the right; rotate(-90) turns the horns up
  function crescentD(x, y, r, k) { k = k == null ? 0.72 : k; return 'M' + pt([x, y - r]) + 'A' + n(r) + ',' + n(r) + ' 0 1,0 ' + pt([x, y + r]) + 'A' + n(r * k) + ',' + n(r) + ' 0 1,1 ' + pt([x, y - r]) + 'Z'; }
  function moonMark(c, x, y, r, col, sw) { return G(P(crescentD(x, y, r, 0.7), c.cel(col || SILVER), sw == null ? 1 : sw), 'rotate(-90 ' + n(x) + ' ' + n(y) + ')'); }
  function leafMass(c, x, y, rx, ry, col, seed, sw) {
    var d = shag(x, y, rx, ry, 14, 0.2, seed || 3, 0.2);
    return body(c, d, col, F(shag(x - rx * 0.3, y - ry * 0.3, rx * 0.4, ry * 0.36, 8, 0.25, (seed || 3) + 2), lt(col, 0.18), 0.75) + F(shag(x + rx * 0.15, y - ry * 0.05, rx * 0.3, ry * 0.3, 7, 0.25, (seed || 3) + 3), lt(col, 0.1), 0.7) +
      F(shag(x + rx * 0.4, y + ry * 0.4, rx * 0.72, ry * 0.66, 10, 0.2, (seed || 3) + 5), dk(col, 0.3), 0.75), sw == null ? 2 : sw);
  }
  // overhanging leaf band along the top edge
  function canopy(c, seed, y, col, cnt) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = -20 + 440 * (i + r() * 0.5) / cnt; o += leafMass(c, x, y + r() * 14 - 7, 32 + r() * 18, 18 + r() * 10, i % 2 ? col : lt(col, 0.07), seed + i * 3); }
    return o;
  }
  // colossal trunk with flared roots, running off the top of the frame
  function bigTree(c, x, y, w, col, seed) {
    col = col || TRUNK;
    var d = 'M' + pt([x - w * 2, y + 2]) + 'C' + pt([x - w * 1.1, y - 4]) + ' ' + pt([x - w * 0.8, y - 26]) + ' ' + pt([x - w * 0.62, y - 60]) + 'L' + pt([x - w * 0.5, -6]) + 'L' + pt([x + w * 0.5, -6]) + 'L' + pt([x + w * 0.62, y - 60]) + 'C' + pt([x + w * 0.8, y - 26]) + ' ' + pt([x + w * 1.1, y - 4]) + ' ' + pt([x + w * 2, y + 2]) + 'Z';
    var r = rng(seed || 7), bk = '';
    for (var i = 0; i < 6; i++) { var bx = x - w * 0.42 + r() * w * 0.84; bk += 'M' + pt([bx, y - 4 - r() * 10]) + 'C' + pt([bx + (r() - 0.5) * 8, y - 60]) + ' ' + pt([bx + (r() - 0.5) * 8, y * 0.5]) + ' ' + pt([bx + (r() - 0.5) * 6, -4]); }
    bk += 'M' + pt([x - w * 1.2, y]) + 'Q' + pt([x - w * 0.7, y - 10]) + ' ' + pt([x - w * 0.5, y - 26]) + 'M' + pt([x + w * 1.2, y]) + 'Q' + pt([x + w * 0.7, y - 10]) + ' ' + pt([x + w * 0.5, y - 26]);
    return E(x, y + 3, w * 2.3, 5, '#000', 0, 0.3) + body(c, d, col, L(bk, dk(col, 0.32), 1.4, 0.85) + F(pd([[x + w * 0.16, -8], [x + w * 2.2, -8], [x + w * 2.2, y + 4], [x + w * 0.5, y + 4]], true), dk(col, 0.3), 0.8) +
      F(pd([[x - w * 0.5, -8], [x - w * 0.22, -8], [x - w * 0.3, y], [x - w * 0.62, y]], true), lt(col, 0.16), 0.5), 2.2);
  }
  // silhouette row of round-crowned trees, no outline
  function farTrees(seed, y, col, cnt, h0, h1) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) {
      var x = -10 + 420 * (i + r() * 0.7) / cnt, h = h0 + r() * (h1 - h0), w = h * 0.3;
      o += F(pd([[x - 2.5, y + 2], [x - 2, y - h * 0.6], [x + 2, y - h * 0.6], [x + 2.5, y + 2]], true), col) + E(x, y - h * 0.74, w, h * 0.28, col) + E(x - w * 0.55, y - h * 0.6, w * 0.7, h * 0.2, col) + E(x + w * 0.55, y - h * 0.62, w * 0.7, h * 0.19, col);
    }
    return o + R(-2, y, 404, 6, col);
  }
  function fern(c, x, y, s, col) {
    col = col || '#3a9a72'; var o = E(x, y + 1, 14 * s, 2.6 * s, '#000', 0, 0.18);
    [[-1.25, 18], [-0.75, 24], [-0.25, 27], [0.25, 25], [0.75, 22], [1.2, 17]].forEach(function (f, i) {
      var a = -PI / 2 + f[0], len = f[1] * s, q = dirQ([x, y], a), bend = f[0] * 7 * s;
      var d = 'M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.5, 5 * s + bend * 0.5)) + ' ' + pt(q(len, bend)) + 'Q' + pt(q(len * 0.5, -5 * s + bend * 0.5)) + ' ' + pt(q(0, 0)) + 'Z', rib = 'M' + pt(q(1, 0)) + 'Q' + pt(q(len * 0.5, bend * 0.5)) + ' ' + pt(q(len, bend));
      var tk = ''; for (var j = 1; j < 5; j++) { var u = len * j / 5, m = q(u, bend * (u / len) * (u / len)); tk += 'M' + pt(m) + 'l' + n(Math.cos(a - 0.9) * 3 * s) + ',' + n(Math.sin(a - 0.9) * 3 * s) + 'M' + pt(m) + 'l' + n(Math.cos(a + 0.9) * 3 * s) + ',' + n(Math.sin(a + 0.9) * 3 * s); }
      o += P(d, c.cel(i % 2 ? col : lt(col, 0.1)), 1.1 * s) + L(rib + tk, dk(col, 0.35), 0.8 * s, 0.9);
    });
    return o;
  }
  function pawPrint(x, y, s, col, op) {
    col = col || '#1e2a24';
    return E(x, y, 4 * s, 2.2 * s, col, 0, op || 0.6) + E(x - 4.4 * s, y - 2.6 * s, 1.3 * s, 0.9 * s, col, 0, op || 0.6) + E(x - 1.6 * s, y - 3.6 * s, 1.3 * s, 0.9 * s, col, 0, op || 0.6) + E(x + 1.6 * s, y - 3.6 * s, 1.3 * s, 0.9 * s, col, 0, op || 0.6) + E(x + 4.4 * s, y - 2.6 * s, 1.3 * s, 0.9 * s, col, 0, op || 0.6);
  }
  // night-elf lantern: violet crook post with a pale glowing teardrop lamp
  function neLantern(c, x, y, h, s, flip) {
    s = s || 1; var k = flip ? -1 : 1, top = y - h, lx = x - 12 * s * k;
    var post = 'M' + pt([x, y]) + 'L' + pt([x, top + 8 * s]) + 'C' + pt([x, top - 4 * s]) + ' ' + pt([lx, top - 6 * s]) + ' ' + pt([lx, top + 2 * s]);
    return E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25) + limb(post, '#4e3a70', 2.4 * s) + L(post, SILVER, 0.8 * s, 0.6) + hangLamp(c, lx, top + 2 * s, 2 * s, s);
  }
  function hangLamp(c, x, y, len, s) {
    var ty = y + len;
    return C(x, ty + 7 * s, 17 * s, glow(c, GLOWB, 0.6)) + L('M' + pt([x, y]) + 'L' + pt([x, ty + 1]), OL, 1.1 * s) +
      P('M' + pt([x, ty]) + 'C' + pt([x - 5 * s, ty + 3 * s]) + ' ' + pt([x - 4.4 * s, ty + 10 * s]) + ' ' + pt([x, ty + 12 * s]) + 'C' + pt([x + 4.4 * s, ty + 10 * s]) + ' ' + pt([x + 5 * s, ty + 3 * s]) + ' ' + pt([x, ty]) + 'Z', '#e0fbff', 1.2 * s) +
      C(x, ty + 7 * s, 1.8 * s, '#ffffff') + P(pd([[x - 3 * s, ty + 1 * s], [x, ty - 2 * s], [x + 3 * s, ty + 1 * s]], true), c.cel('#6a5a9a'), 0.9 * s);
  }
  function moonwell(c, x, y, s) {
    var o = C(x, y - 22 * s, 74 * s, glow(c, GLOWB, 0.4));
    o += F(pd([[x - 22 * s, y - 4 * s], [x - 12 * s, y - 120 * s], [x + 12 * s, y - 120 * s], [x + 22 * s, y - 4 * s]], true), c.lg([[0, '#e8fcff', 0], [0.6, '#bff4ff', 0.22], [1, '#bff4ff', 0.45]]));
    [-1, 1].forEach(function (k) {
      var d = 'M' + pt([x + k * 30 * s, y]) + 'C' + pt([x + k * 35 * s, y - 20 * s]) + ' ' + pt([x + k * 31 * s, y - 42 * s]) + ' ' + pt([x + k * 13 * s, y - 50 * s]) + 'C' + pt([x + k * 24 * s, y - 38 * s]) + ' ' + pt([x + k * 26 * s, y - 20 * s]) + ' ' + pt([x + k * 22 * s, y]) + 'Z';
      o += P(d, c.cel(k < 0 ? '#e0e4f2' : '#b8bcd4'), 1.6 * s);
    });
    var jn = ''; for (var i = -2; i <= 2; i++) jn += 'M' + pt([x + i * 11 * s, y - 2 * s]) + 'l0,' + n(9 * s);
    o += body(c, 'M' + pt([x - 32 * s, y - 4 * s]) + 'L' + pt([x - 28 * s, y + 6 * s]) + 'Q' + pt([x, y + 12 * s]) + ' ' + pt([x + 28 * s, y + 6 * s]) + 'L' + pt([x + 32 * s, y - 4 * s]) + 'Z', '#9a94ba', L(jn, '#6a6488', 1 * s), 1.8 * s);
    o += E(x, y - 4 * s, 32 * s, 8 * s, c.cel('#d0cce2'), 1.8 * s) + E(x, y - 4 * s, 26 * s, 5.6 * s, c.rg([[0, '#ffffff'], [0.45, '#bff4ff'], [1, '#3ab0e0']]), 1.2 * s);
    return o + C(x - 8 * s, y - 30 * s, 1.2 * s, '#ffffff', 0, 0.9) + C(x + 6 * s, y - 52 * s, 1 * s, '#ffffff', 0, 0.8) + C(x + 2 * s, y - 76 * s, 1.3 * s, '#ffffff', 0, 0.7);
  }
  // night-elf house: rounded lilac walls with silver ribs, a tall leaf-shaped violet roof, crescent finial
  function neHouse(c, x, y, s, o) {
    o = o || {};
    var w = (o.w || 26) * s, h = (o.h || 26) * s, wall = o.wall || '#9a8cc4', rf = o.roof || '#5a3e8e', out = E(x, y + 2, w + 12 * s, 4 * s, '#000', 0, 0.26);
    var wd = 'M' + pt([x - w, y]) + 'C' + pt([x - w - 3 * s, y - h * 0.5]) + ' ' + pt([x - w * 0.9, y - h]) + ' ' + pt([x - w * 0.7, y - h]) + 'L' + pt([x + w * 0.7, y - h]) + 'C' + pt([x + w * 0.9, y - h]) + ' ' + pt([x + w + 3 * s, y - h * 0.5]) + ' ' + pt([x + w, y]) + 'Z';
    var ribs = 'M' + pt([x - w * 0.55, y]) + 'Q' + pt([x - w * 0.66, y - h * 0.5]) + ' ' + pt([x - w * 0.48, y - h]) + 'M' + pt([x + w * 0.55, y]) + 'Q' + pt([x + w * 0.66, y - h * 0.5]) + ' ' + pt([x + w * 0.48, y - h]);
    out += body(c, wd, wall, L(ribs, SILVER, 1.5 * s, 0.85) + F(pd([[x + w * 0.4, y - h - 2], [x + w + 6 * s, y - h - 2], [x + w + 6 * s, y + 2], [x + w * 0.4, y + 2]], true), dk(wall, 0.3), 0.8), 2 * s);
    out += C(x, y - h * 0.35, 18 * s, glow(c, GLOWB, 0.45)) + archWin(x, y, 11 * s, 19 * s, '#d8faff', 1.6 * s) + L('M' + pt([x, y]) + 'L' + pt([x, y - 16 * s]), '#8ad0e8', 1 * s);
    out += C(x - w * 0.78, y - h * 0.62, 3.4 * s, '#d8faff', 1.3 * s) + C(x + w * 0.78, y - h * 0.62, 3.4 * s, '#b8e8f8', 1.3 * s);
    var rh = (o.rh || 40) * s, tip = [x - 4 * s, y - h - rh];
    var roof = 'M' + pt([x - w - 9 * s, y - h + 5 * s]) + 'C' + pt([x - w - 2 * s, y - h - rh * 0.45]) + ' ' + pt([x - 12 * s, y - h - rh * 0.8]) + ' ' + pt(tip) + 'C' + pt([x + 10 * s, y - h - rh * 0.75]) + ' ' + pt([x + w + 2 * s, y - h - rh * 0.4]) + ' ' + pt([x + w + 9 * s, y - h + 5 * s]) + 'Q' + pt([x, y - h - 3 * s]) + ' ' + pt([x - w - 9 * s, y - h + 5 * s]) + 'Z';
    var rl = ''; for (var i = -2; i <= 2; i++) rl += 'M' + pt(tip) + 'Q' + pt([x + i * w * 0.3, y - h - rh * 0.42]) + ' ' + pt([x + i * w * 0.5, y - h + 1 * s]);
    out += body(c, roof, rf, L(rl, dk(rf, 0.32), 1 * s, 0.8) + F(pd([[x + 2 * s, y - h - rh - 4], [x + w + 14 * s, y - h - rh - 4], [x + w + 14 * s, y - h + 8 * s], [x + 8 * s, y - h + 8 * s]], true), dk(rf, 0.3), 0.8), 2.2 * s);
    var eave = 'M' + pt([x - w - 9 * s, y - h + 5 * s]) + 'Q' + pt([x, y - h - 3 * s]) + ' ' + pt([x + w + 9 * s, y - h + 5 * s]);
    out += L(eave, OL, 4 * s) + L(eave, SILVER, 2 * s);
    return out + limb('M' + pt(tip) + 'L' + pt([tip[0], tip[1] - 7 * s]), '#4a3a5a', 1.4 * s) + moonMark(c, tip[0], tip[1] - 12 * s, 5 * s, SILVER, 1 * s);
  }
  // sentinel banner: violet crook pole, long deep-blue pennant with silver trim and a crescent
  function neBanner(c, x, y, h, s, col) {
    s = s || 1; col = col || '#34388a';
    var top = y - h, bw = 14 * s, bh = h * 0.62, o = '';
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top - 4 * s]), '#4a3a5e', 2.2 * s) + moonMark(c, x, top - 9 * s, 5 * s, SILVER, 1 * s);
    o += limb('M' + pt([x - 2 * s, top]) + 'Q' + pt([x + bw / 2, top - 4 * s]) + ' ' + pt([x + bw + 2 * s, top]), '#4a3a5e', 1.8 * s);
    var d = pd([[x, top], [x + bw, top], [x + bw, top + bh], [x + bw / 2, top + bh + 7 * s], [x, top + bh]], true);
    o += body(c, d, col, L(pd([[x + 2.2 * s, top + 2 * s], [x + 2.2 * s, top + bh - 1 * s], [x + bw / 2, top + bh + 4.6 * s], [x + bw - 2.2 * s, top + bh - 1 * s], [x + bw - 2.2 * s, top + 2 * s]]), SILVER, 1 * s) + F(pd([[x + bw * 0.64, top], [x + bw, top], [x + bw, top + bh + 8 * s], [x + bw * 0.64, top + bh + 8 * s]], true), '#000', 0.25), 1.4 * s);
    return o + F(crescentD(x + bw * 0.46, top + bh * 0.42, 4.4 * s, 0.68), SILVER);
  }
  function lake(c, y0, y1, top, bot, seed, cnt) {
    var o = R(-2, y0, 404, y1 - y0, c.lg([[0, top], [1, bot]])), r = rng(seed || 3), d = '';
    for (var i = 0; i < (cnt || 26); i++) { var yy = y0 + 3 + r() * (y1 - y0 - 6), t = (yy - y0) / (y1 - y0), w = 8 + t * 26, xx = r() * 400; d += 'M' + pt([xx - w, yy]) + 'L' + pt([xx + w, yy]); }
    return o + L(d, lt(top, 0.45), 1.2, 0.55);
  }
  // ---- Krugar pieces ----
  function palisade(c, x0, x1, y, h, col, seed) {
    col = col || HWOOD; var r = rng(seed || 5), o = '', lw = 9;
    for (var x = x0; x < x1; x += lw) {
      var hh = h * (0.86 + r() * 0.22), d = pd([[x, y], [x, y - hh + 5], [x + lw / 2, y - hh - 4], [x + lw, y - hh + 5], [x + lw, y]], true);
      o += P(d, c.cel(r() < 0.5 ? col : lt(col, 0.07)), 1.5) + L('M' + pt([x + lw * 0.32, y - 2]) + 'L' + pt([x + lw * 0.32, y - hh + 6]), dk(col, 0.3), 0.9, 0.8);
    }
    var rl = 'M' + pt([x0, y - h * 0.3]) + 'L' + pt([x1, y - h * 0.3]) + 'M' + pt([x0, y - h * 0.7]) + 'L' + pt([x1, y - h * 0.7]);
    return o + L(rl, OL, 4) + L(rl, '#4a3020', 2.2);
  }
  function stump(c, x, y, s, col, axe) {
    col = col || '#6a4a5e';
    var w = 12 * s, h = 12 * s;
    var d = 'M' + pt([x - w - 6 * s, y]) + 'C' + pt([x - w, y - 2 * s]) + ' ' + pt([x - w, y - h * 0.5]) + ' ' + pt([x - w, y - h]) + 'L' + pt([x + w, y - h]) + 'C' + pt([x + w, y - h * 0.5]) + ' ' + pt([x + w, y - 2 * s]) + ' ' + pt([x + w + 6 * s, y]) + 'Z';
    var o = E(x, y + 1, w + 9 * s, 3 * s, '#000', 0, 0.28) + body(c, d, col, L('M' + pt([x - w * 0.5, y - 1]) + 'L' + pt([x - w * 0.5, y - h + 1]) + 'M' + pt([x + w * 0.1, y - 1]) + 'L' + pt([x + w * 0.1, y - h + 1]), dk(col, 0.35), 1 * s) + F(pd([[x + w * 0.4, y - h - 4], [x + w + 8 * s, y - h - 4], [x + w + 8 * s, y + 2], [x + w * 0.4, y + 2]], true), dk(col, 0.3), 0.8), 1.6 * s);
    o += E(x, y - h, w, 3.6 * s, c.cel('#d8b88a'), 1.4 * s) + L(ellD(x, y - h, w * 0.62, 2.1 * s) + ellD(x, y - h, w * 0.28, 1 * s), '#a8845a', 0.8 * s);
    if (axe) o += limb('M' + pt([x + 2 * s, y - h]) + 'L' + pt([x + 14 * s, y - h - 16 * s]), '#6a4428', 2.6 * s) + P(pd([[x - 4 * s, y - h + 1], [x + 1 * s, y - h - 6 * s], [x + 6 * s, y - h - 4 * s], [x + 4 * s, y - h + 1]], true), c.cel('#8a8e96'), 1.2 * s);
    return o;
  }
  function logPile(c, x, y, s) {
    var o = E(x, y + 1, 30 * s, 4 * s, '#000', 0, 0.26);
    [[-18, 0], [-6, 0], [6, 0], [18, 0], [-12, -10], [0, -10], [12, -10], [-6, -20], [6, -20]].forEach(function (p) {
      var lx = x + p[0] * s, ly = y - 5 * s + p[1] * s;
      o += L('M' + pt([lx, ly]) + 'L' + pt([lx + 18 * s, ly - 6 * s]), OL, 12 * s) + L('M' + pt([lx, ly]) + 'L' + pt([lx + 18 * s, ly - 6 * s]), '#6a4a5a', 9 * s) + C(lx, ly, 5.2 * s, c.cel('#d8b88a'), 1.3 * s) + C(lx, ly, 2 * s, '#a8845a');
    });
    return o;
  }
  // Krugar banner: spiked pole, ragged red cloth with a black three-claw mark
  function hBanner(c, x, y, h, s) {
    s = s || 1; var top = y - h, bw = 16 * s, bh = h * 0.58, o = '';
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top - 5 * s]), '#4a3020', 2.4 * s) + P(pd([[x - 2.4 * s, top - 4 * s], [x, top - 13 * s], [x + 2.4 * s, top - 4 * s]], true), c.cel('#c8c0a8'), 1 * s);
    o += limb('M' + pt([x - 4 * s, top]) + 'L' + pt([x + bw + 4 * s, top]), '#4a3020', 2 * s) + P(pd([[x + bw + 3 * s, top - 2 * s], [x + bw + 9 * s, top], [x + bw + 3 * s, top + 2 * s]], true), '#c8c0a8', 0.9 * s);
    var d = pd([[x, top], [x + bw, top], [x + bw, top + bh * 0.9], [x + bw * 0.8, top + bh], [x + bw * 0.62, top + bh * 0.84], [x + bw * 0.42, top + bh * 1.04], [x + bw * 0.2, top + bh * 0.86], [x, top + bh]], true);
    o += body(c, d, HRED, F(pd([[x + bw * 0.62, top], [x + bw, top], [x + bw, top + bh], [x + bw * 0.62, top + bh]], true), '#000', 0.28), 1.5 * s);
    var cx = x + bw * 0.5, cy = top + bh * 0.42, cm = '';
    for (var i = -1; i <= 1; i++) cm += 'M' + pt([cx + i * 3.6 * s + 2 * s, cy - 6 * s]) + 'L' + pt([cx + i * 3.6 * s - 2 * s, cy + 6 * s]);
    return o + L(cm, '#1a1010', 2 * s);
  }
  // orc timber hut: log walls, hide A-frame roof, crossed poles and tusk spikes on the ridge
  function orcHut(c, x, y, s, col) {
    var w = 30 * s, h = 20 * s, wd = col || '#7a5434', out = E(x, y + 2, w + 12 * s, 4 * s, '#000', 0, 0.26);
    var logs = ''; for (var i = 1; i < 4; i++) logs += 'M' + pt([x - w, y - h * i / 4]) + 'L' + pt([x + w, y - h * i / 4]);
    out += body(c, pd([[x - w, y], [x - w, y - h], [x + w, y - h], [x + w, y]], true), wd, L(logs, dk(wd, 0.4), 1.1 * s) + F(pd([[x + w * 0.4, y - h - 2], [x + w + 2, y - h - 2], [x + w + 2, y + 2], [x + w * 0.4, y + 2]], true), dk(wd, 0.3), 0.8), 1.8 * s);
    out += limb('M' + pt([x - 7 * s, y - h - 20 * s]) + 'L' + pt([x + 9 * s, y - h - 38 * s]) + 'M' + pt([x + 7 * s, y - h - 20 * s]) + 'L' + pt([x - 9 * s, y - h - 38 * s]), '#5a3a24', 2.2 * s);
    var roof = pd([[x - w - 9 * s, y - h + 5 * s], [x, y - h - 27 * s], [x + w + 9 * s, y - h + 5 * s]], true), st = '';
    for (var j = -2; j <= 2; j++) st += 'M' + pt([x + j * 3 * s, y - h - 24 * s]) + 'L' + pt([x + j * 13 * s, y - h + 3 * s]);
    out += body(c, roof, '#b08050', L(st, '#6a4a2a', 1 * s, 0.8) + F(pd([[x, y - h - 30 * s], [x + w + 12 * s, y - h + 8 * s], [x + 4 * s, y - h + 8 * s]], true), '#6a4a2a', 0.45), 2 * s);
    [-0.6, 0.6].forEach(function (k) { var px = x + k * w * 0.8, py = y - h - 27 * s + Math.abs(k) * 26 * s * 0.8; out += P('M' + pt([px - 2 * s, py + 1]) + 'Q' + pt([px - 4 * s * (k < 0 ? 1 : -1), py - 8 * s]) + ' ' + pt([px - 8 * s * (k < 0 ? 1 : -1), py - 10 * s]) + 'Q' + pt([px, py - 6 * s]) + ' ' + pt([px + 2 * s, py + 1]) + 'Z', c.cel('#f0e8d0'), 1 * s); });
    return out + P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 12 * s]) + 'Q' + pt([x, y - 18 * s]) + ' ' + pt([x + 8 * s, y - 12 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z', '#1a1010', 1.4 * s) + C(x, y - 8 * s, 12 * s, glow(c, '#ffa040', 0.35));
  }
  function watchtower(c, x, y, s) {
    var o = E(x, y + 2, 22 * s, 4 * s, '#000', 0, 0.26), h = 70 * s, wd = '#6a4a30';
    o += limb('M' + pt([x - 16 * s, y]) + 'L' + pt([x - 11 * s, y - h]) + 'M' + pt([x + 16 * s, y]) + 'L' + pt([x + 11 * s, y - h]) + 'M' + pt([x - 14 * s, y - h * 0.25]) + 'L' + pt([x + 13 * s, y - h * 0.62]) + 'M' + pt([x + 14 * s, y - h * 0.25]) + 'L' + pt([x - 13 * s, y - h * 0.62]), wd, 3 * s);
    o += body(c, pd([[x - 17 * s, y - h], [x - 17 * s, y - h - 14 * s], [x + 17 * s, y - h - 14 * s], [x + 17 * s, y - h]], true), wd, L('M' + pt([x - 17 * s, y - h - 7 * s]) + 'L' + pt([x + 17 * s, y - h - 7 * s]) + 'M' + pt([x - 6 * s, y - h]) + 'L' + pt([x - 6 * s, y - h - 14 * s]) + 'M' + pt([x + 5 * s, y - h]) + 'L' + pt([x + 5 * s, y - h - 14 * s]), dk(wd, 0.35), 1.2 * s), 1.8 * s);
    for (var i = -2; i <= 2; i++) o += P(pd([[x + i * 7 * s - 2 * s, y - h - 14 * s], [x + i * 7 * s, y - h - 22 * s], [x + i * 7 * s + 2 * s, y - h - 14 * s]], true), c.cel('#e8dcc0'), 1 * s);
    o += limb('M' + pt([x - 15 * s, y - h - 14 * s]) + 'L' + pt([x - 15 * s, y - h - 30 * s]) + 'M' + pt([x + 15 * s, y - h - 14 * s]) + 'L' + pt([x + 15 * s, y - h - 30 * s]), wd, 2.2 * s);
    o += P(pd([[x - 22 * s, y - h - 29 * s], [x, y - h - 48 * s], [x + 22 * s, y - h - 29 * s]], true), c.cel('#a87a4a'), 1.8 * s) + F(pd([[x, y - h - 48 * s], [x + 22 * s, y - h - 29 * s], [x + 4 * s, y - h - 29 * s]], true), '#000', 0.3);
    return o + hBanner(c, x + 18 * s, y - h - 44 * s, 26 * s, 0.7 * s);
  }
  // wind-rider roost: timber frame with a straw nest and a perched rider (lion body, bat wings, scorpion tail)
  function roost(c, x, y, s) {
    var o = E(x, y + 2, 28 * s, 4 * s, '#000', 0, 0.26), h = 50 * s, wd = '#6a4a30';
    o += limb('M' + pt([x - 22 * s, y]) + 'L' + pt([x - 18 * s, y - h]) + 'M' + pt([x + 22 * s, y]) + 'L' + pt([x + 18 * s, y - h]) + 'M' + pt([x - 20 * s, y - h * 0.4]) + 'L' + pt([x + 20 * s, y - h * 0.4]), wd, 3.2 * s);
    o += body(c, pd([[x - 28 * s, y - h], [x + 28 * s, y - h], [x + 24 * s, y - h + 6 * s], [x - 24 * s, y - h + 6 * s]], true), wd, null, 1.8 * s) + P(shag(x, y - h - 2 * s, 26 * s, 5 * s, 10, 0.3, 41), c.cel('#c8a058'), 1.4 * s);
    var bx = x, by = y - h - 6 * s;
    // tail curling up with a stinger
    var tl = 'M' + pt([bx + 14 * s, by - 6 * s]) + 'C' + pt([bx + 30 * s, by - 10 * s]) + ' ' + pt([bx + 32 * s, by - 30 * s]) + ' ' + pt([bx + 20 * s, by - 34 * s]);
    o += limb(tl, '#8a6a3a', 2.6 * s) + P(pd([[bx + 22 * s, by - 32 * s], [bx + 14 * s, by - 38 * s], [bx + 18 * s, by - 30 * s]], true), c.cel('#3a2a20'), 1 * s);
    // far wing
    o += P(pd([[bx + 2 * s, by - 14 * s], [bx + 10 * s, by - 40 * s], [bx + 18 * s, by - 26 * s], [bx + 22 * s, by - 18 * s], [bx + 12 * s, by - 12 * s]], true), c.cel('#4a2a3a'), 1.2 * s);
    o += P('M' + pt([bx - 16 * s, by]) + 'C' + pt([bx - 16 * s, by - 12 * s]) + ' ' + pt([bx + 12 * s, by - 16 * s]) + ' ' + pt([bx + 16 * s, by - 4 * s]) + 'L' + pt([bx + 14 * s, by + 1 * s]) + 'Z', c.cel('#b88a4a'), 1.4 * s);
    o += P('M' + pt([bx - 12 * s, by - 8 * s]) + 'C' + pt([bx - 22 * s, by - 10 * s]) + ' ' + pt([bx - 26 * s, by - 20 * s]) + ' ' + pt([bx - 18 * s, by - 24 * s]) + 'C' + pt([bx - 12 * s, by - 24 * s]) + ' ' + pt([bx - 8 * s, by - 16 * s]) + ' ' + pt([bx - 6 * s, by - 10 * s]) + 'Z', c.cel('#c89a58'), 1.3 * s);
    o += P(shag(bx - 12 * s, by - 16 * s, 7 * s, 8 * s, 6, 0.3, 43), c.cel('#6a3a24'), 1.1 * s) + C(bx - 21 * s, by - 20 * s, 0.9 * s, OL);
    // near wing, folded up
    o += P(pd([[bx - 6 * s, by - 10 * s], [bx - 2 * s, by - 44 * s], [bx + 6 * s, by - 32 * s], [bx + 12 * s, by - 34 * s], [bx + 12 * s, by - 20 * s], [bx + 6 * s, by - 8 * s]], true), c.cel('#5a3446'), 1.3 * s) + L('M' + pt([bx - 2 * s, by - 42 * s]) + 'L' + pt([bx + 2 * s, by - 10 * s]), OL, 0.9 * s);
    return o;
  }
  // ---- naga ruins ----
  function nagaSpire(c, x, y, s, col, broken) {
    col = col || '#5a8a8e';
    var T = taper(broken ? [[x, y - 6 * s], [x + 1 * s, y - 30 * s], [x + 2 * s, y - 50 * s]] : [[x, y - 6 * s], [x + 1 * s, y - 40 * s], [x + 2 * s, y - 72 * s], [x + 4 * s, y - 94 * s]], 30 * s, broken ? 16 * s : 3 * s, 4);
    var sp = ''; for (var i = 1; i < T.s.length - 1; i += 2) sp += 'M' + pt(T.a[i]) + 'Q' + pt(lerp2(T.a[i + 1], T.b[i + 1], 0.5)) + ' ' + pt(T.b[Math.min(T.s.length - 1, i + 2)]);
    var o = P(pd([[x - 20 * s, y], [x - 17 * s, y - 8 * s], [x + 17 * s, y - 8 * s], [x + 20 * s, y]], true), c.cel(dk(col, 0.1)), 1.6 * s);
    o += body(c, T.d, col, L(sp, dk(col, 0.4), 1.6 * s) + F(ribbonBand(T, 0.62, 1), dk(col, 0.28), 0.8) + F(ribbonBand(T, 0, 0.2), lt(col, 0.15), 0.6), 1.8 * s);
    if (broken) { var e = T.s[T.s.length - 1]; o += P(pd([[e[0] - 6 * s, e[1] + 1], [e[0] - 3 * s, e[1] - 4 * s], [e[0], e[1] + 1], [e[0] + 3 * s, e[1] - 5 * s], [e[0] + 6 * s, e[1] + 1]], true), c.cel(lt(col, 0.1)), 1.2 * s); }
    return o + C(x - 4 * s, y - 10 * s, 1.6 * s, '#e8ecd8', 0, 0.9) + C(x + 3 * s, y - 16 * s, 1.2 * s, '#e8ecd8', 0, 0.8) + C(x - 1 * s, y - 5 * s, 1.4 * s, '#e8ecd8', 0, 0.8);
  }
  // a broken gateway: two ringed pillars and a curved lintel snapped off at the right
  function nagaArch(c, x, y, s, col) {
    col = col || '#5a8a8e';
    var A = taper([[x - 28 * s, y - 38 * s], [x - 12 * s, y - 56 * s], [x + 6 * s, y - 60 * s], [x + 14 * s, y - 56 * s]], 13 * s, 9 * s, 5);
    return nagaSpire(c, x - 28 * s, y, 0.72 * s, col, true) + nagaSpire(c, x + 28 * s, y, 0.72 * s, dk(col, 0.06), true) +
      body(c, A.d, col, L(bands(A, 3, 2), dk(col, 0.35), 1.1 * s) + F(ribbonBand(A, 0.6, 1), dk(col, 0.28), 0.7), 1.8 * s) +
      P(pd([A.s[A.s.length - 1], [A.s[A.s.length - 1][0] + 3 * s, A.s[A.s.length - 1][1] + 6 * s], [A.s[A.s.length - 1][0] - 2 * s, A.s[A.s.length - 1][1] + 5 * s]], true), c.cel(lt(col, 0.1)), 1 * s);
  }
  function sunkenTemple(c, x, y, s) {
    var st = '#5a8288', o = C(x, y - 30 * s, 80 * s, glow(c, '#6ad8ff', 0.25));
    var dome = 'M' + pt([x - 62 * s, y]) + 'C' + pt([x - 60 * s, y - 50 * s]) + ' ' + pt([x - 22 * s, y - 76 * s]) + ' ' + pt([x, y - 76 * s]) + 'C' + pt([x + 22 * s, y - 76 * s]) + ' ' + pt([x + 60 * s, y - 50 * s]) + ' ' + pt([x + 62 * s, y]) + 'Z', rb = '';
    for (var i = -3; i <= 3; i++) rb += 'M' + pt([x + i * 3 * s, y - 74 * s]) + 'Q' + pt([x + i * 16 * s, y - 50 * s]) + ' ' + pt([x + i * 18 * s, y]);
    o += nagaSpire(c, x + 2 * s, y - 70 * s, 0.7 * s, lt(st, 0.05));
    o += body(c, dome, st, L(rb, dk(st, 0.3), 1.3 * s, 0.9) + F(pd([[x + 16 * s, y - 80 * s], [x + 66 * s, y - 80 * s], [x + 66 * s, y + 2], [x + 22 * s, y + 2]], true), dk(st, 0.28), 0.8), 2.2 * s);
    o += P('M' + pt([x - 22 * s, y]) + 'L' + pt([x - 22 * s, y - 30 * s]) + 'C' + pt([x - 22 * s, y - 50 * s]) + ' ' + pt([x + 22 * s, y - 50 * s]) + ' ' + pt([x + 22 * s, y - 30 * s]) + 'L' + pt([x + 22 * s, y]) + 'Z', c.cel('#8ab4b4'), 2 * s);
    o += P('M' + pt([x - 15 * s, y]) + 'L' + pt([x - 15 * s, y - 28 * s]) + 'C' + pt([x - 15 * s, y - 42 * s]) + ' ' + pt([x + 15 * s, y - 42 * s]) + ' ' + pt([x + 15 * s, y - 28 * s]) + 'L' + pt([x + 15 * s, y]) + 'Z', c.lg([[0, '#0a1420'], [0.7, '#12304a'], [1, '#2a6a8a']]), 1.6 * s);
    o += C(x, y - 14 * s, 18 * s, glow(c, '#6ad8ff', 0.5)) + moonMark(c, x, y - 44 * s, 4 * s, '#c8e8e0', 1 * s);
    return o;
  }
  // ---- furbolg village ----
  function furHut(c, x, y, s) {
    var w = 26 * s, h = 30 * s, col = '#8a6444', o = E(x, y + 2, w + 10 * s, 4 * s, '#000', 0, 0.26);
    var d = 'M' + pt([x - w, y]) + 'C' + pt([x - w - 2 * s, y - h * 0.8]) + ' ' + pt([x - w * 0.4, y - h]) + ' ' + pt([x, y - h]) + 'C' + pt([x + w * 0.4, y - h]) + ' ' + pt([x + w + 2 * s, y - h * 0.8]) + ' ' + pt([x + w, y]) + 'Z', br = '';
    for (var i = -2; i <= 2; i++) br += 'M' + pt([x + i * 9 * s, y]) + 'Q' + pt([x + i * 11 * s, y - h * 0.7]) + ' ' + pt([x + i * 3 * s, y - h]);
    br += 'M' + pt([x - w, y - h * 0.4]) + 'Q' + pt([x, y - h * 0.5]) + ' ' + pt([x + w, y - h * 0.4]);
    o += body(c, d, col, L(br, dk(col, 0.4), 1.3 * s) + F(pd([[x + w * 0.35, y - h - 2], [x + w + 4 * s, y - h - 2], [x + w + 4 * s, y + 2], [x + w * 0.35, y + 2]], true), dk(col, 0.3), 0.8), 2 * s);
    o += P(shag(x, y - h + 3 * s, w * 0.8, 9 * s, 9, 0.3, Math.round(x)), c.cel('#4a7a4a'), 1.6 * s);
    o += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 7 * s, y - 16 * s]) + 'Q' + pt([x, y - 20 * s]) + ' ' + pt([x + 7 * s, y - 16 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z', c.cel('#b89060'), 1.5 * s) + P('M' + pt([x - 3 * s, y]) + 'L' + pt([x - 2 * s, y - 14 * s]) + 'L' + pt([x + 5 * s, y - 13 * s]) + 'L' + pt([x + 5 * s, y]) + 'Z', '#1a120c', 1 * s);
    return o + skull(c, x, y - 23 * s, 0.6 * s);
  }
  // carved totem: stacked bear faces, painted wings on top, feathers
  function totem(c, x, y, s) {
    var o = E(x, y + 1, 9 * s, 2 * s, '#000', 0, 0.26), wd = '#9a6a3a';
    o += P(pd([[x - 20 * s, y - 50 * s], [x - 4 * s, y - 46 * s], [x - 4 * s, y - 40 * s], [x - 16 * s, y - 42 * s]], true), c.cel('#c83a2a'), 1.2 * s) + P(pd([[x + 20 * s, y - 50 * s], [x + 4 * s, y - 46 * s], [x + 4 * s, y - 40 * s], [x + 16 * s, y - 42 * s]], true), c.cel('#2a6ac8'), 1.2 * s);
    [[0, '#9a6a3a'], [1, '#b07a44'], [2, '#8a5a32']].forEach(function (b) {
      var by = y - b[0] * 16 * s, bc = b[1];
      o += body(c, pd([[x - 7 * s, by], [x - 7 * s, by - 16 * s], [x + 7 * s, by - 16 * s], [x + 7 * s, by]], true), bc, F(pd([[x + 2 * s, by - 18 * s], [x + 9 * s, by - 18 * s], [x + 9 * s, by + 2], [x + 2 * s, by + 2]], true), '#000', 0.25), 1.5 * s);
      o += C(x - 7 * s, by - 14 * s, 2.4 * s, c.cel(bc), 1 * s) + C(x + 7 * s, by - 14 * s, 2.4 * s, c.cel(bc), 1 * s);
      o += C(x - 3 * s, by - 10 * s, 1.3 * s, OL) + C(x + 3 * s, by - 10 * s, 1.3 * s, OL) + E(x, by - 5 * s, 3 * s, 2 * s, dk(bc, 0.4), 0.8 * s) + L('M' + pt([x - 4 * s, by - 2 * s]) + 'L' + pt([x + 4 * s, by - 2 * s]), OL, 1 * s);
    });
    return o + feather(c, x - 7 * s, y - 34 * s, PI / 2 + 0.3, 10 * s, '#f0ece2', '#c83a2a') + feather(c, x + 7 * s, y - 34 * s, PI / 2 - 0.3, 10 * s, '#f0ece2', '#2a6ac8');
  }
  function feather(c, x, y, ang, len, col, tip) {
    var q = dirQ([x, y], ang), d = 'M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.5, len * 0.26)) + ' ' + pt(q(len, 0)) + 'Q' + pt(q(len * 0.5, -len * 0.26)) + ' ' + pt(q(0, 0)) + 'Z';
    return P(d, col, 0.9) + (tip ? F('M' + pt(q(len * 0.66, len * 0.2)) + 'L' + pt(q(len, 0)) + 'L' + pt(q(len * 0.66, -len * 0.2)) + 'Z', tip) : '') + L('M' + pt(q(-1, 0)) + 'L' + pt(q(len * 0.9, 0)), dk(col, 0.4), 0.7);
  }
  function thistle(c, x, y, s) {
    var o = L('M' + pt([x, y]) + 'Q' + pt([x - 1 * s, y - 8 * s]) + ' ' + pt([x, y - 14 * s]), OL, 2.6 * s) + L('M' + pt([x, y]) + 'Q' + pt([x - 1 * s, y - 8 * s]) + ' ' + pt([x, y - 14 * s]), '#4a7a4a', 1.2 * s);
    o += P(pd([[x - 1, y - 5 * s], [x - 6 * s, y - 9 * s], [x - 2 * s, y - 7 * s]], true), '#4a7a4a', 0.8 * s) + P(pd([[x + 1, y - 7 * s], [x + 6 * s, y - 11 * s], [x + 2 * s, y - 9 * s]], true), '#4a7a4a', 0.8 * s);
    o += E(x, y - 15 * s, 3 * s, 3.2 * s, c.cel('#5a8a4a'), 1 * s) + P(pd([[x - 3.6 * s, y - 17 * s], [x - 2 * s, y - 23 * s], [x, y - 18 * s], [x + 2 * s, y - 24 * s], [x + 3.6 * s, y - 17 * s]], true), c.cel('#b05ad0'), 1 * s);
    return o;
  }
  // big rocky mound with a den hole (shared shape with art_hillsbrad.js)
  function den(c, x, y, w, h, col) {
    col = col || '#7e7a74';
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.7]) + ' ' + pt([x - w * 0.2, y - h]) + ' ' + pt([x, y - h]) + 'C' + pt([x + w * 0.24, y - h]) + ' ' + pt([x + w * 0.52, y - h * 0.6]) + ' ' + pt([x + w / 2, y]) + 'Z';
    var o = E(x, y + 2, w * 0.6, 5, '#000', 0, 0.25) + body(c, d, col, F(pd([[x + w * 0.1, y - h - 2], [x + w * 0.6, y - h - 2], [x + w * 0.6, y + 2], [x + w * 0.2, y + 2]], true), dk(col, 0.28), 0.8) +
      L('M' + pt([x - w * 0.36, y - h * 0.46]) + 'L' + pt([x - w * 0.2, y - h * 0.5]) + 'M' + pt([x + w * 0.18, y - h * 0.7]) + 'L' + pt([x + w * 0.32, y - h * 0.62]), dk(col, 0.35), 1.3), 2);
    return o + P('M' + pt([x - w * 0.22, y]) + 'C' + pt([x - w * 0.24, y - h * 0.5]) + ' ' + pt([x + w * 0.2, y - h * 0.56]) + ' ' + pt([x + w * 0.22, y]) + 'Z', c.lg([[0, '#06080e'], [1, '#161a26']]), 1.8);
  }
  function moon(c, x, y, r) { return C(x, y, r * 4, glow(c, '#dfe8ff', 0.4)) + C(x, y, r, '#eef2ff') + C(x + r * 0.3, y - r * 0.2, r * 0.25, '#cdd6ea') + C(x - r * 0.35, y + r * 0.3, r * 0.18, '#cdd6ea'); }
  function stars(seed, cnt, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(r() * 400, r() * (y1 || 90), 0.5 + r() * 0.8, '#ffffff', 0, 0.5 + r() * 0.4); return o; }
  function wisps(seed, cnt, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), rr = 1 + r() * 1.4; o += C(x, y, rr * 5, '#ffffff', 0, 0) + C(x, y, rr, col || '#e0fcff', 0, 0.9); } return o; }
  // twisted corrupted tree: gnarled black-violet trunk, hooked branches, a few sickly leaves
  function twistedTree(c, x, y, s, col, leaf) {
    col = col || '#2e2236'; leaf = leaf || '#7a9a2a';
    var o = E(x, y + 1, 18 * s, 3.4 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'C' + pt([x - 8 * s, y - 20 * s]) + ' ' + pt([x + 10 * s, y - 36 * s]) + ' ' + pt([x - 2 * s, y - 56 * s]) + 'C' + pt([x - 8 * s, y - 66 * s]) + ' ' + pt([x + 4 * s, y - 76 * s]) + ' ' + pt([x + 2 * s, y - 84 * s]), col, 7 * s);
    o += limb('M' + pt([x + 2 * s, y - 34 * s]) + 'C' + pt([x + 14 * s, y - 40 * s]) + ' ' + pt([x + 22 * s, y - 36 * s]) + ' ' + pt([x + 26 * s, y - 50 * s]) + 'Q' + pt([x + 28 * s, y - 58 * s]) + ' ' + pt([x + 22 * s, y - 58 * s]) +
      'M' + pt([x - 3 * s, y - 56 * s]) + 'C' + pt([x - 14 * s, y - 58 * s]) + ' ' + pt([x - 22 * s, y - 66 * s]) + ' ' + pt([x - 22 * s, y - 76 * s]) + 'Q' + pt([x - 20 * s, y - 82 * s]) + ' ' + pt([x - 15 * s, y - 78 * s]), col, 3.4 * s);
    o += limb('M' + pt([x - 2 * s, y - 20 * s]) + 'C' + pt([x - 12 * s, y - 22 * s]) + ' ' + pt([x - 18 * s, y - 30 * s]) + ' ' + pt([x - 20 * s, y - 38 * s]) + 'M' + pt([x + 2 * s, y - 70 * s]) + 'C' + pt([x + 10 * s, y - 74 * s]) + ' ' + pt([x + 14 * s, y - 84 * s]) + ' ' + pt([x + 12 * s, y - 90 * s]), col, 2 * s);
    o += L('M' + pt([x + 1.5 * s, y - 4 * s]) + 'C' + pt([x - 5 * s, y - 20 * s]) + ' ' + pt([x + 10 * s, y - 36 * s]) + ' ' + pt([x, y - 52 * s]), lt(col, 0.2), 1.6 * s, 0.7);
    [[26, -54], [-18, -78], [12, -88], [-20, -38], [4, -82]].forEach(function (p, i) { o += P(shag(x + p[0] * s, y + p[1] * s, 7 * s, 5 * s, 6, 0.3, 50 + i), c.cel(i % 2 ? leaf : dk(leaf, 0.15)), 1.2 * s); });
    return o;
  }
  function felFlame(c, x, y, s) { return C(x, y - 10 * s, 26 * s, glow(c, FEL, 0.5)) + flame(c, x, y, s, '#2ec82a', FELL); }
  function crystal(c, x, y, s, col) {
    col = col || '#5ad0ff';
    var o = C(x, y - 12 * s, 30 * s, glow(c, col, 0.45));
    [[-9, 14, -0.35], [0, 26, 0], [9, 18, 0.3], [-4, 10, -0.1], [5, 9, 0.5]].forEach(function (k, i) {
      var q = dirQ([x + k[0] * s, y], -PI / 2 + k[2]), h = k[1] * s, w = (i < 3 ? 4 : 3) * s;
      var d = pd([q(0, -w), q(h * 0.8, -w), q(h, 0), q(h * 0.8, w), q(0, w)], true);
      o += P(d, c.cel(i % 2 ? col : lt(col, 0.15)), 1.3 * s) + F(pd([q(1, -w * 0.3), q(h * 0.8, -w * 0.3), q(h, 0), q(h * 0.8, w), q(1, w)], true), dk(col, 0.35), 0.6) + L('M' + pt(q(2, -w * 0.6)) + 'L' + pt(q(h * 0.7, -w * 0.6)), '#ffffff', 0.9 * s, 0.8);
    });
    return o;
  }
  function column(c, x, y, w, h, col, broken) {
    var top = broken ? [[0, 6], [w * 0.3, -2], [w * 0.5, 8], [w * 0.75, 2], [w, 10]] : null, o = E(x + w / 2, y + 2, w * 0.8, 3, '#000', 0, 0.3);
    var d = top ? 'M' + pt([x, y]) + 'L' + pt([x + w, y]) + top.slice().reverse().map(function (q) { return 'L' + pt([x + q[0], y - h + q[1]]); }).join('') + 'Z' : pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true), fl = '';
    for (var i = 1; i < 4; i++) fl += 'M' + pt([x + w * i / 4, y - 3]) + 'L' + pt([x + w * i / 4, y - h + (broken ? 12 : 4)]);
    o += body(c, d, col, L(fl, dk(col, 0.3), 1.1) + F(pd([[x + w * 0.62, y - h - 2], [x + w + 2, y - h - 2], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.3), 0.8), 1.8);
    o += P(pd([[x - 4, y], [x - 3, y - 6], [x + w + 3, y - 6], [x + w + 4, y]], true), c.cel(lt(col, 0.06)), 1.6);
    if (!broken) o += P('M' + pt([x - 6, y - h]) + 'Q' + pt([x - 8, y - h - 8]) + ' ' + pt([x - 2, y - h - 8]) + 'L' + pt([x + w + 2, y - h - 8]) + 'Q' + pt([x + w + 8, y - h - 8]) + ' ' + pt([x + w + 6, y - h]) + 'Z', c.cel(lt(col, 0.08)), 1.6);
    return o;
  }
  function candles(c, x, y, s) {
    var o = C(x, y - 10 * s, 28 * s, glow(c, '#c080ff', 0.4)), r = rng(Math.round(x * 7 + y));
    [[-8, 10], [-3, 16], [3, 8], [8, 13], [0, 5]].forEach(function (k) {
      var cx = x + k[0] * s, h = k[1] * s, cy = y + (k[1] === 5 ? 3 : 0) * s;
      o += R(cx - 1.8 * s, cy - h, 3.6 * s, h, c.cel('#d8d0e0'), 0.9 * s) + F(pd([[cx - 1.8 * s, cy - h], [cx - 2.4 * s, cy - h + 3 * s + r() * 2 * s], [cx - 1 * s, cy - h + 1]], true), '#f0e8f8') + flame(c, cx, cy - h, 0.3 * s, '#a050f0', '#ffe8b0');
    });
    return o;
  }
  // Twilight's Hammer style cult banner (original): dark purple drape, black ring, grey band
  function cultBanner(c, x, y, w, h) {
    var d = pd([[x, y], [x + w, y], [x + w, y + h], [x + w * 0.75, y + h - 6], [x + w / 2, y + h], [x + w * 0.25, y + h - 6], [x, y + h]], true);
    return limb('M' + pt([x - 4, y]) + 'L' + pt([x + w + 4, y]), '#3a3440', 2.2) + body(c, d, '#3a1e5a', F(pd([[x, y + h * 0.62], [x + w, y + h * 0.62], [x + w, y + h * 0.72], [x, y + h * 0.72]], true), '#6a6474') + F(pd([[x + w * 0.62, y], [x + w, y], [x + w, y + h], [x + w * 0.62, y + h]], true), '#000', 0.3), 1.6) +
      L(ellD(x + w / 2, y + h * 0.34, w * 0.26, w * 0.26), '#0e0a12', 2.6) + C(x + w / 2, y + h * 0.34, w * 0.08, '#b070ff');
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    astranaar: function (c) {
      var o = avSky(c, '#181640', '#3a3878', '#8a7ab8') + stars(201, 34, 80);
      o += farTrees(203, 128, '#2e2a5e', 15, 70, 110) + farTrees(205, 134, '#243a54', 20, 36, 64);
      o += lake(c, 132, 206, '#4a5a9e', '#26366a', 207) + F(pd([[298, 132], [314, 132], [324, 206], [288, 206]], true), '#bff0ff', 0.12);
      // the island and its reflection
      o += F('M146,160 C220,172 360,170 404,164 L404,178 C340,184 220,184 150,170 Z', '#1a2250', 0.55);
      o += body(c, 'M140,154 C170,138 250,132 330,134 C370,136 400,140 404,146 L404,166 C360,172 220,172 140,160 Z', '#3a6a5e', F('M150,150 C190,140 260,136 330,138 C370,140 396,144 404,148 L404,152 C360,146 280,142 220,144 C190,146 164,150 150,154 Z', '#5a9a7a', 0.7), 1.8);
      o += neHouse(c, 356, 146, 0.86, { rh: 48 }) + neHouse(c, 246, 142, 0.5, { roof: '#6a4a9a' }) + moonwell(c, 294, 154, 0.5) + neHouse(c, 190, 152, 0.66, { wall: '#a898cc' });
      o += neBanner(c, 222, 156, 44, 0.8) + neBanner(c, 322, 154, 46, 0.8, '#4a2e80') + neLantern(c, 160, 156, 30, 0.7) + neLantern(c, 396, 150, 34, 0.7, true);
      // bridge from the near shore to the island
      var T = taper([[40, 214], [96, 186], [150, 162], [176, 154]], 18, 9, 6);
      o += body(c, T.d, '#6a4e82', L(bands(T, 1, 1), dk('#6a4e82', 0.35), 1, 0.9) + F(ribbonBand(T, 0, 0.3), dk('#6a4e82', 0.3), 0.8), 1.8);
      var rail = [], posts = '';
      for (var i = 0; i < T.s.length; i++) rail.push([T.b[i][0], T.b[i][1] - 12 + i * 0.2]);
      for (var j = 0; j < T.s.length; j += 4) posts += 'M' + pt(T.b[j]) + 'L' + pt(rail[j]);
      o += L(posts, OL, 4) + L(posts, '#8a6aa8', 2) + L(pd(rail), OL, 4) + L(pd(rail), SILVER, 1.8);
      o += hangLamp(c, rail[8][0], rail[8][1], 3, 0.7) + hangLamp(c, rail[16][0], rail[16][1], 3, 0.6);
      o += mist(c, 170, 26, '#b8c8f0', 0.25, 209);
      // near shore
      o += body(c, 'M-4,198 C60,190 120,200 200,208 C260,212 330,204 404,198 L404,242 L-4,242 Z', '#2e5a4e', R(-4, 196, 408, 48, c.lg([[0, '#3e7a62', 0.6], [1, '#16302a', 0.8]])) + F('M-4,198 C60,190 120,200 200,208 C260,212 330,204 404,198 L404,204 C330,210 260,218 200,214 C120,206 60,196 -4,204 Z', '#5a9a7a', 0.7), 2);
      o += grass(211, 206, 238, '#1e3a30', 50, 0.6, 1.6, 1.1) + flowers(213, 210, 236, ['#bff0ff', '#c8a0f0'], 16);
      o += bigTree(c, -6, 226, 20, TRUNK, 215) + canopy(c, 217, 6, LEAF, 7);
      o += fern(c, 60, 234, 1.1) + fern(c, 380, 232, 1, '#2e8a66') + fern(c, 250, 236, 0.8) + neLantern(c, 330, 226, 40, 0.9, true);
      return o + wisps(219, 16, 40, 200) + vignette(c, '#d8d0ff', '#0a0c1a');
    },
    splintertree_post: function (c) {
      var o = avSky(c, '#2a2450', '#4e4a86', '#a08ab4') + cloud(90, 40, 1, 0.35, '#c8b8e0') + cloud(300, 28, 0.8, 0.3, '#c8b8e0');
      o += farTrees(221, 128, '#2e2a5e', 14, 70, 110) + farTrees(223, 138, '#263e50', 18, 40, 70);
      o += ground(c, 142, '#6a6a4a', '#403c2e');
      o += F('M170,242 C180,210 200,180 206,150 L236,150 C240,180 250,210 262,242 Z', '#8a7a5a', 0.75);
      o += watchtower(c, 64, 146, 0.95);
      o += palisade(c, -4, 188, 150, 36, HWOOD, 225) + palisade(c, 252, 404, 150, 36, HWOOD, 227);
      o += limb('M190,152 L190,100 M250,152 L250,100', '#5a3a24', 7) + limb('M184,106 L256,106', '#5a3a24', 5) + skull(c, 220, 112, 0.9) + hBanner(c, 192, 150, 60, 1) + hBanner(c, 232, 150, 60, 1);
      o += roost(c, 350, 164, 0.9);
      o += orcHut(c, 110, 178, 0.9) + orcHut(c, 290, 172, 0.7);
      o += grass(229, 152, 238, '#3a3a24', 40, 0.6, 1.6, 1) + pebbles(231, 160, 236, '#5a5446', 16);
      o += logPile(c, 34, 196, 0.8) + stump(c, 180, 200, 0.9, null, true) + stump(c, 256, 186, 0.7) + stump(c, 370, 226, 1.2) + stump(c, 24, 238, 0.9) + stump(c, 130, 226, 0.7);
      o += campfire(c, 214, 214, 0.55) + barrel(c, 150, 190, 0.8, '#6a4430') + crate(c, 78, 204, 0.8, '#7a5434');
      o += hBanner(c, 340, 222, 50, 0.9);
      return o + vignette(c, '#f0d8e0', '#140c08');
    },
    the_zoram_strand: function (c) {
      var o = avSky(c, '#3a3c6c', '#6a72a2', '#b8bcd4') + cloud(80, 36, 1.2, 0.4, '#d8d8ec') + cloud(260, 24, 1, 0.35, '#d8d8ec');
      o += R(-2, 104, 404, 60, c.lg([[0, '#5a7aac'], [1, '#2e507a']]));
      var r = rng(241), wv = '';
      for (var i = 0; i < 30; i++) { var y = 108 + r() * 50, w = 6 + (y - 104) * 0.4, x = r() * 400; wv += 'M' + pt([x - w, y]) + 'q' + n(w / 2) + ',-2 ' + n(w) + ',0'; }
      o += L(wv, '#a8c0e0', 1.2, 0.6);
      o += nagaSpire(c, 40, 132, 0.8, '#4e7a80', true) + nagaSpire(c, 96, 130, 0.62, '#567e84') + nagaArch(c, 178, 136, 0.66, '#4e767c');
      o += sunkenTemple(c, 318, 132, 0.95);
      o += R(-2, 118, 404, 30, c.lg([[0, '#3a608a', 0], [0.4, '#3a608a', 0.7], [1, '#2e507a', 0.9]])) + L('M-2,128 q20,-3 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0', '#c8dcf0', 1.2, 0.5);
      o += mist(c, 120, 30, '#c8d0e8', 0.35, 243);
      // surf and beach
      o += F('M-4,150 C60,142 140,150 220,146 C300,142 360,148 404,144 L404,154 C340,158 280,152 220,156 C140,160 60,152 -4,158 Z', '#e8f0f8', 0.8);
      o += body(c, 'M-4,154 C60,148 140,156 220,152 C300,148 360,154 404,150 L404,242 L-4,242 Z', SAND, R(-4, 150, 408, 94, c.lg([[0, '#7a7090', 0.5], [0.3, '#7a7090', 0], [1, '#3a3450', 0.5]])), 1.8);
      o += F('M-4,156 C60,150 140,158 220,154 C300,150 360,156 404,152 L404,170 C340,174 280,168 220,172 C140,176 60,168 -4,174 Z', '#8a7e9a', 0.55) + pebbles(245, 160, 236, '#8a7e96', 20) + E(80, 196, 30, 5, '#4a5a80', 1.2) + E(76, 195, 14, 1.6, '#a8c0e0', 0, 0.7);
      [[60, 190], [150, 214], [240, 180], [330, 230], [120, 170]].forEach(function (p, i) { o += P('M' + pt([p[0] - 4, p[1]]) + 'Q' + pt([p[0], p[1] - 7]) + ' ' + pt([p[0] + 4, p[1]]) + 'Z', c.cel(i % 2 ? '#f0c8c0' : '#e8e0d0'), 1) + L('M' + pt([p[0], p[1]]) + 'L' + pt([p[0], p[1] - 5]) + 'M' + pt([p[0] - 2, p[1]]) + 'L' + pt([p[0] - 1, p[1] - 4]) + 'M' + pt([p[0] + 2, p[1]]) + 'L' + pt([p[0] + 1, p[1] - 4]), dk('#e8e0d0', 0.3), 0.7); });
      [[20, 214, 1], [210, 238, 0.9], [390, 186, 0.8]].forEach(function (p, i) { var k = p[2], d = ''; for (var j = -2; j <= 2; j++) d += 'M' + pt([p[0] + j * 3 * k, p[1]]) + 'Q' + pt([p[0] + j * 6 * k, p[1] - 10 * k]) + ' ' + pt([p[0] + j * 4 * k + 3 * k, p[1] - 18 * k]); o += L(d, OL, 4 * k) + L(d, i % 2 ? '#3a7a4a' : '#5a8a3a', 2.2 * k); });
      o += limb('M40,232 C70,228 100,230 128,226', '#8a7a6a', 6) + limb('M92,229 L102,218', '#8a7a6a', 3);
      o += rock(c, 14, 240, 40, 16, '#5a5870') + rock(c, 360, 170, 24, 10, '#5a5870');
      return o + mist(c, 200, 40, '#d0d4ec', 0.2, 247) + vignette(c, '#e8ecff', '#10101e');
    },
    mystral_lake: function (c) {
      var o = avSky(c, '#1e1c48', '#4a4a88', '#a094c4') + stars(251, 24, 70) + moon(c, 160, 30, 9);
      o += farTrees(253, 124, '#2e2e62', 16, 60, 96) + farTrees(255, 130, '#26405a', 20, 34, 56);
      o += lake(c, 128, 200, '#5a6ab0', '#2a3a70', 257, 30) + F(pd([[154, 128], [166, 128], [176, 200], [144, 200]], true), '#e0f0ff', 0.14);
      o += mist(c, 150, 24, '#c0c8f0', 0.35, 261);
      // near shore curving up to a high right bank
      o += body(c, 'M-4,196 C60,190 130,190 190,180 C230,172 250,156 290,150 C330,144 370,146 404,142 L404,242 L-4,242 Z', '#2e5a4e', R(-4, 140, 408, 104, c.lg([[0, '#3e7a62', 0.5], [1, '#12281e', 0.85]])) + F('M-4,196 C60,190 130,190 190,180 C230,172 250,156 290,150 C330,144 370,146 404,142 L404,148 C370,152 330,150 294,156 C256,162 236,178 194,186 C130,196 60,196 -4,202 Z', '#5a9a7a', 0.7), 2);
      o += grass(263, 150, 238, '#1e3a30', 60, 0.6, 1.8, 1.1, 180, 404) + grass(265, 200, 238, '#1e3a30', 24, 0.6, 1.6, 1.1, 0, 180);
      for (var i = 0; i < 9; i++) { var t = i / 8; o += pawPrint(40 + t * 300 + (i % 2) * 6, 232 - t * 60 + (i % 2) * 5, 0.8 + (1 - t) * 0.5, '#142a20', 0.55); }
      o += bigTree(c, 10, 206, 18, TRUNK, 269) + bigTree(c, 392, 170, 14, TRUNKD, 271) + canopy(c, 273, 4, LEAF, 7);
      o += fern(c, 70, 206, 1.1) + fern(c, 140, 232, 1.3, '#2e8a66') + fern(c, 250, 176, 0.8) + fern(c, 372, 236, 1.2) + fern(c, 330, 160, 0.7, '#2e8a66');
      o += rock(c, 200, 190, 26, 10, '#5a6078') + rock(c, 30, 238, 36, 14, '#4a5068');
      o += limb('M218,214 C240,212 262,214 284,210', '#5a4050', 7) + limb('M246,213 L254,202', '#5a4050', 3);
      return o + wisps(275, 14, 60, 200, '#d0ffe8') + vignette(c, '#d8d0ff', '#08100c');
    },
    thistlefur_village: function (c) {
      var o = avSky(c, '#24204c', '#4a4a86', '#9a90c0') + cloud(120, 30, 1, 0.3, '#c8c0e8');
      o += farTrees(281, 120, '#2e2e62', 16, 60, 100) + farTrees(283, 128, '#26405a', 18, 36, 60);
      o += ground(c, 150, '#3e6a4e', '#1e3a2a');
      // the hillside rising to the right
      var hl = 'M-4,178 C60,172 130,160 180,140 C220,124 270,108 330,104 C360,102 390,104 404,106 L404,242 L-4,242 Z';
      o += body(c, hl, '#3e6e50', R(-4, 100, 408, 144, c.lg([[0, '#4e8a60', 0.3], [1, '#16301e', 0.85]])) + F('M-4,178 C60,172 130,160 180,140 C220,124 270,108 330,104 C360,102 390,104 404,106 L404,112 C380,110 350,110 330,110 C270,114 222,130 184,146 C134,166 60,178 -4,184 Z', '#6aaa7a', 0.6), 2);
      o += F('M120,242 C140,214 180,186 220,160 C250,142 280,128 300,118 L314,122 C290,134 262,150 236,168 C200,194 174,220 170,242 Z', '#7a6a4a', 0.7);
      o += furHut(c, 250, 124, 0.7) + furHut(c, 344, 112, 0.86) + furHut(c, 170, 148, 0.62);
      o += totem(c, 290, 134, 0.8) + totem(c, 206, 152, 0.7) + totem(c, 386, 118, 0.7);
      o += grass(285, 150, 238, '#1e3a24', 60, 0.6, 1.8, 1.1);
      o += campfire(c, 112, 196, 0.6) + bone(150, 206, 12, 0.3, 0.9) + skull(c, 84, 206, 0.7);
      for (var i = 0; i < 14; i++) { var r = rng(287 + i); o += thistle(c, r() * 400, 170 + r() * 70, 0.7 + r() * 0.6); }
      o += bigTree(c, 12, 190, 16, TRUNK, 289) + canopy(c, 291, 2, LEAF, 5);
      o += fern(c, 40, 236, 1.1) + fern(c, 230, 238, 0.9) + rock(c, 380, 240, 40, 14, '#4a5068');
      return o + vignette(c, '#d8d0ff', '#08100c');
    },
    the_howling_vale: function (c) {
      var o = avSky(c, '#0c1030', '#1c2858', '#3a4a80') + stars(301, 50, 100) + moon(c, 96, 46, 20);
      o += farTrees(303, 124, '#141c40', 16, 70, 110) + farTrees(305, 132, '#1a2a4a', 20, 40, 66);
      o += C(210, 150, 190, glow(c, '#8ad8ff', 0.22));
      o += ground(c, 140, '#26344e', '#101828');
      o += F('M-4,150 C80,144 200,146 300,140 C340,138 380,140 404,138 L404,146 C360,148 300,150 220,152 C120,154 60,152 -4,156 Z', '#3a5070', 0.7);
      o += den(c, 306, 160, 124, 60, '#4a4a64') + den(c, 110, 150, 80, 34, '#40405a');
      o += grass(307, 150, 238, '#162034', 50, 0.6, 1.8, 1.1) + pebbles(309, 160, 236, '#34405a', 16);
      o += bone(250, 176, 14, 0.3, 0.9) + bone(350, 178, 10, -0.5, 0.8) + skull(c, 276, 180, 0.7) + bone(160, 214, 16, 0.5, 1.1) + skull(c, 60, 210, 0.8);
      o += bigTree(c, 8, 212, 18, '#2e2446', 311) + bigTree(c, 396, 196, 12, '#2a2240', 313) + canopy(c, 315, 0, '#1e3a4e', 7);
      o += twistedTree(c, 200, 150, 0.6, '#1e1a30', '#2a4a5a');
      o += mist(c, 170, 34, '#8ab8e8', 0.3, 317) + mist(c, 226, 30, '#8ab8e8', 0.22, 319);
      return o + wisps(321, 22, 60, 220, '#c8f0ff') + vignette(c, '#c8d8ff', '#04060c');
    },
    satyrnaar: function (c) {
      var o = sky(c, '#141424', '#342640', '#5a4a58') + C(200, 110, 170, glow(c, FEL, 0.18));
      o += farTrees(331, 124, '#1e1628', 16, 60, 100);
      o += ground(c, 138, '#3a2a3a', '#1a1020');
      // broken night-elf arch, now satyr-held, with green runes
      var st = '#6a5a7a';
      o += P('M60,150 L60,90 C60,62 140,62 140,90 L140,150 L126,150 L126,94 C126,76 74,76 74,94 L74,112 L64,124 L74,132 L74,150 Z', c.cel(st), 2) + L('M60,90 C60,62 140,62 140,90', lt(st, 0.2), 1.4, 0.8);
      [[67, 104], [67, 130], [133, 100], [133, 124], [100, 72]].forEach(function (p) { o += C(p[0], p[1], 7, glow(c, FEL, 0.8)) + L('M' + pt([p[0] - 2, p[1] - 3]) + 'L' + pt([p[0] + 2, p[1]]) + 'L' + pt([p[0] - 2, p[1] + 3]), FELL, 1.4); });
      o += column(c, 330, 146, 16, 52, st, true) + column(c, 368, 144, 14, 34, dk(st, 0.1), true) + rock(c, 154, 150, 20, 8, st);
      o += E(220, 176, 44, 8, glow(c, FEL, 0.6)) + E(220, 176, 30, 5, '#2a8a2a', 1.2) + E(216, 175, 14, 2, FELL, 0, 0.7);
      o += E(90, 212, 30, 6, '#2a8a2a', 1.2) + E(88, 211, 12, 1.6, FELL, 0, 0.6) + C(90, 212, 40, glow(c, FEL, 0.4));
      o += grass(333, 142, 238, '#2a1a2a', 50, 0.6, 1.8, 1.1) + pebbles(335, 150, 236, '#4a3a4a', 14);
      o += twistedTree(c, 30, 214, 1.2) + twistedTree(c, 384, 180, 0.9, '#281c30', '#6a8a22') + twistedTree(c, 262, 140, 0.55, '#221828');
      o += skull(c, 300, 186, 0.7) + bone(160, 192, 14, -0.3, 0.9);
      o += mist(c, 160, 30, '#6a9a4a', 0.2, 337);
      return o + wisps(339, 18, 60, 220, '#b8ff80') + vignette(c, '#d0ffb0', '#06040a');
    },
    felfire_hill: function (c) {
      var o = sky(c, '#1a0810', '#4a1618', '#8a3a24') + C(200, 90, 200, glow(c, FEL, 0.16));
      o += hills(c, 341, 118, 22, '#2a1418', 40) + hills(c, 343, 132, 18, '#20100e', 36);
      o += felFlame(c, 60, 118, 0.5) + felFlame(c, 330, 124, 0.45);
      o += ground(c, 140, '#3e3032', '#1e1618') + L('M20,190 L60,184 L74,196 L120,190 M240,200 L280,192 L300,204 L350,196 M130,230 L170,222 L200,232 M300,160 L330,166 L360,158', '#2ec82a', 3, 0.8) + L('M20,190 L60,184 L74,196 L120,190 M240,200 L280,192 L300,204 L350,196 M130,230 L170,222 L200,232 M300,160 L330,166 L360,158', FELL, 1, 0.9);
      var hl = 'M60,160 C100,128 150,110 200,108 C250,110 300,128 340,160 Z';
      o += body(c, hl, '#2a2226', F('M200,108 C250,110 300,128 340,160 L270,160 C260,140 236,118 200,108 Z', '#141012', 0.6) + L('M120,140 L140,132 M250,124 L274,134', '#4a3a3a', 1.4), 2);
      // the demonic altar
      o += C(200, 96, 60, glow(c, FEL, 0.5)) + P('M162,120 L238,120 L230,110 L170,110 Z', c.cel('#3a3036'), 1.8) + P('M172,110 L228,110 L222,100 L178,100 Z', c.cel('#2e262c'), 1.8);
      [[166, 118], [234, 118], [178, 106], [222, 106]].forEach(function (p, i) { o += P(pd([[p[0] - 4, p[1]], [p[0] + (i % 2 ? 4 : -4), p[1] - 24 + i * 4], [p[0] + 4, p[1]]], true), c.cel('#1e1a1e'), 1.4); });
      o += E(200, 100, 18, 4, '#1a3a1a', 1.2) + L(ellD(200, 100, 14, 3), FEL, 1.4) + orb(c, 200, 78, 6, FEL);
      o += skull(c, 184, 116, 0.6) + skull(c, 216, 116, 0.6);
      var r = rng(345);
      for (var i = 0; i < 7; i++) o += rock(c, r() * 400, 150 + r() * 90, 20 + r() * 18, 12 + r() * 12, '#2a2226');
      o += P('M-4,242 L-4,196 L14,176 L30,200 L46,186 L56,242 Z', c.cel('#1e1a1c'), 2) + P('M404,242 L404,190 L386,168 L372,196 L356,182 L346,242 Z', c.cel('#1e1a1c'), 2);
      o += felFlame(c, 120, 164, 1.1) + felFlame(c, 104, 170, 0.7) + felFlame(c, 290, 170, 0.9) + felFlame(c, 30, 226, 1.5) + felFlame(c, 50, 232, 0.9) + felFlame(c, 372, 236, 1.6) + felFlame(c, 210, 214, 0.8) + felFlame(c, 160, 124, 0.7) + felFlame(c, 250, 126, 0.8);
      o += grass(347, 150, 238, '#3a2020', 20, 0.6, 1.6, 1);
      return o + wisps(349, 26, 40, 230, '#c8ff90') + vignette(c, '#ffd0a0', '#040204');
    },
    blackfathom_deeps: function (c) {
      var st = '#4a4668', o = R(0, 0, 400, 240, '#0e0e1e');
      o += brickWall(c, 0, 0, 400, 124, st, 351, 14) + R(0, 0, 400, 124, c.lg([[0, '#000', 0.5], [1, '#000', 0]]));
      [[70, 118, 64, 88], [200, 118, 76, 100], [330, 118, 64, 88]].forEach(function (a) {
        var x = a[0], y = a[1], w = a[2], h = a[3];
        o += P('M' + pt([x - w / 2 - 6, y]) + 'L' + pt([x - w / 2 - 6, y - h + w / 2]) + 'Q' + pt([x, y - h - w * 0.3]) + ' ' + pt([x + w / 2 + 6, y - h + w / 2]) + 'L' + pt([x + w / 2 + 6, y]) + 'Z', c.cel('#6a6488'), 2);
        o += P('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w / 2]) + 'Q' + pt([x, y - h - w * 0.2]) + ' ' + pt([x + w / 2, y - h + w / 2]) + 'L' + pt([x + w / 2, y]) + 'Z', c.lg([[0, '#060812'], [1, '#141a30']]), 1.8);
        o += moonMark(c, x, y - h - 2, 6, '#b8c0dc', 1.2);
      });
      o += C(200, 80, 34, glow(c, '#4ab8ff', 0.3));
      o += L('M30,0 C34,30 28,60 36,100 M150,0 C152,20 146,40 150,60 M264,0 C266,26 260,50 268,80 M372,0 C376,40 368,70 376,110', '#1a2a3a', 3, 0.6);
      o += L('M110,0 Q116,20 108,40 Q104,52 112,64 M290,0 Q296,24 288,44', '#2a5a4a', 2.4) + P(shag(110, 40, 5, 3, 5, 0.3, 353), '#3a7a5a', 1) + P(shag(290, 30, 5, 3, 5, 0.3, 355), '#3a7a5a', 1);
      o += column(c, 124, 124, 18, 96, '#5e5a7c') + column(c, 262, 124, 18, 60, '#5a5678', true) + column(c, 12, 124, 16, 110, '#56527a') + column(c, 376, 124, 16, 70, '#56527a', true);
      o += flagFloor(c, 124, 200, '#3a3a56', 357);
      o += R(0, 124, 400, 116, c.lg([[0, '#2a5a8a', 0.5], [1, '#1a3a6a', 0.55]]));
      o += F('M130,124 L144,124 L150,200 L124,200 Z', '#9ad8ff', 0.1) + F('M268,124 L282,124 L288,170 L262,170 Z', '#9ad8ff', 0.1);
      var r = rng(359), rp = '';
      for (var i = 0; i < 26; i++) { var y = 128 + r() * 108, w = 6 + (y - 124) * 0.3, x = r() * 400; rp += 'M' + pt([x - w, y]) + 'q' + n(w / 2) + ',-1.6 ' + n(w) + ',0'; }
      o += L(rp, '#9ad0f0', 1.2, 0.5);
      o += crystal(c, 40, 150, 1) + crystal(c, 368, 144, 0.9, '#6ae0ff') + crystal(c, 190, 128, 0.5) + crystal(c, 12, 236, 1.2, '#4ab8ff') + crystal(c, 230, 236, 0.6);
      o += rock(c, 90, 150, 22, 8, '#3a3a52') + rock(c, 310, 140, 18, 7, '#3a3a52');
      return o + wisps(361, 14, 20, 200, '#c8f4ff') + R(0, 0, 400, 240, c.rg([[0, '#6ad8ff', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    },
    blackfathom_depths: function (c) {
      var o = R(0, 0, 400, 240, '#0c0a12');
      // cavern wall
      o += F('M-4,130 L-4,0 L404,0 L404,130 Z', '#1a1624');
      var r = rng(371);
      for (var i = 0; i < 12; i++) { var x = r() * 400, y = 20 + r() * 90, w = 30 + r() * 40; o += F(shag(x, y, w, w * 0.5, 7, 0.25, 372 + i), i % 2 ? '#221c2e' : '#16121e', 0.9); }
      var st = ''; for (var j = 0; j < 14; j++) { var sx = j * 30 + r() * 12, sl = 10 + r() * 22; st += 'M' + pt([sx - 7, -2]) + 'L' + pt([sx, sl]) + 'L' + pt([sx + 7, -2]) + 'Z'; }
      o += P(st, '#262032', 1.4);
      o += cultBanner(c, 70, 30, 30, 64) + cultBanner(c, 300, 30, 30, 64);
      // the altar dais
      o += C(200, 96, 70, glow(c, '#9a50f0', 0.35));
      o += P('M130,130 L270,130 L256,118 L144,118 Z', c.cel('#3a3446'), 1.8) + P('M150,118 L250,118 L238,106 L162,106 Z', c.cel('#342e40'), 1.8);
      o += body(c, 'M178,106 L178,84 L222,84 L222,106 Z', '#1e1a26', L('M184,92 L216,92', '#4a3a6a', 1.4) + F('M204,82 L224,82 L224,108 L206,108 Z', '#000', 0.4), 1.8);
      o += P('M172,86 L228,86 L224,80 L176,80 Z', c.cel('#2a2432'), 1.6) + orb(c, 200, 66, 7, '#b070ff');
      o += candles(c, 150, 116, 0.8) + candles(c, 252, 116, 0.8);
      o += flagFloor(c, 128, 200, '#26222e', 373) + R(0, 128, 400, 10, '#000', 0, 0.4);
      // the black pool
      o += E(140, 152, 84, 13, c.rg([[0, '#000000'], [0.8, '#0a0812'], [1, '#2a2438']]), 2) + E(130, 149, 40, 3, '#6a4aa0', 0, 0.35) + L('M86,156 q14,-3 28,0 M160,154 q12,-2 24,0', '#8a6ac0', 1.1, 0.5);
      o += candles(c, 36, 160, 1) + candles(c, 350, 158, 0.9) + candles(c, 240, 170, 0.7) + candles(c, 24, 238, 1.2) + candles(c, 214, 236, 0.9);
      o += bone(300, 196, 14, 0.3, 1) + skull(c, 120, 210, 0.8);
      return o + wisps(375, 12, 40, 220, '#e0c8ff') + R(0, 0, 400, 240, c.rg([[0, '#b070ff', 0], [0.7, '#000', 0.14], [1, '#000', 0.6]]));
    }
  };

  // ============================================================
  //  ASHENVALE MOB PIECES
  // ============================================================
  function q0(p, ang, u) { return dirQ(p, ang)(u, 0); }
  function hoof(x, y, col) {
    return P('M' + n(x + 4) + ',' + n(y - 7) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 7) + ',' + n(y + 1) + ' C' + n(x - 8) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 6) + ' ' + n(x - 2) + ',' + n(y - 7) + ' Z', c_(col), 2) + L('M' + n(x - 1) + ',' + n(y - 3) + ' L' + n(x) + ',' + n(y + 1), OL, 1.2);
  }
  function trident(c, p, len, ang, col) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, '#6a5040', 3, 22);
    col = col || '#c8d4d8';
    var t = 'M' + pt(q(len, -7)) + 'L' + pt(q(len, 7)) + 'M' + pt(q(len, -7)) + 'L' + pt(q(len + 11, -8)) + 'M' + pt(q(len - 2, 0)) + 'L' + pt(q(len + 16, 0)) + 'M' + pt(q(len, 7)) + 'L' + pt(q(len + 11, 8));
    o += L(t, OL, 4.6) + L(t, col, 2.4);
    [[-8, 11], [0, 16], [8, 11]].forEach(function (b) { o += P(pd([q(len + b[1] + 5, b[0]), q(len + b[1] - 1, b[0] - 3.2), q(len + b[1], b[0]), q(len + b[1] - 1, b[0] + 3.2)], true), c.cel(col), 1.1); });
    return o;
  }
  function scimitar(c, p, len, ang, col, k) {
    var q = dirQ(p, ang); k = k || 1; col = col || '#b8c4cc';
    var o = L('M' + pt(q(-5, 0)) + 'L' + pt(q(4, 0)), OL, 5) + L('M' + pt(q(-5, 0)) + 'L' + pt(q(4, 0)), '#3a2a30', 3) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), OL, 4) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), '#a89060', 2);
    var d = 'M' + pt(q(5, -2.6 * k)) + 'Q' + pt(q(len * 0.6, -5 * k)) + ' ' + pt(q(len, 7 * k)) + 'Q' + pt(q(len * 0.55, 5 * k)) + ' ' + pt(q(5, 2.6 * k)) + 'Z';
    return o + P(d, c.cel(col), 1.5) + L('M' + pt(q(8, -1.6 * k)) + 'Q' + pt(q(len * 0.6, -3.4 * k)) + ' ' + pt(q(len - 3, 4 * k)), '#ffffff', 0.9, 0.7);
  }
  function waterOrb(c, p, r, col) {
    col = col || '#6ae8e0'; r = r || 1;
    var x = p[0], y = p[1];
    return C(x, y, 26 * r, glow(c, col, 0.6)) + C(x, y, 7 * r, c.rg([[0, '#ffffff'], [0.5, lt(col, 0.4)], [1, col]]), 1.5) +
      L('M' + pt([x - 11 * r, y + 2 * r]) + 'C' + pt([x - 10 * r, y - 10 * r]) + ' ' + pt([x + 8 * r, y - 13 * r]) + ' ' + pt([x + 11 * r, y - 2 * r]) + 'M' + pt([x + 10 * r, y + 4 * r]) + 'C' + pt([x + 6 * r, y + 12 * r]) + ' ' + pt([x - 8 * r, y + 12 * r]) + ' ' + pt([x - 12 * r, y + 6 * r]), dk(col, 0.35), 3.4 * r) +
      L('M' + pt([x - 11 * r, y + 2 * r]) + 'C' + pt([x - 10 * r, y - 10 * r]) + ' ' + pt([x + 8 * r, y - 13 * r]) + ' ' + pt([x + 11 * r, y - 2 * r]) + 'M' + pt([x + 10 * r, y + 4 * r]) + 'C' + pt([x + 6 * r, y + 12 * r]) + ' ' + pt([x - 8 * r, y + 12 * r]) + ' ' + pt([x - 12 * r, y + 6 * r]), lt(col, 0.5), 1.4 * r) +
      C(x - 14 * r, y - 8 * r, 1.6 * r, '#e8ffff', 0.8) + C(x + 13 * r, y + 10 * r, 1.3 * r, '#e8ffff', 0.8) + C(x + 4 * r, y - 16 * r, 1.2 * r, '#e8ffff', 0.8);
  }
  function felFire(c, p, s) { return C(p[0], p[1] - 6 * s, 24 * s, glow(c, FEL, 0.7)) + flame(c, p[0], p[1] + 4 * s, s, '#2ec82a', FELL); }
  function dagger(p, ang, len, blade) {
    var q = dirQ(p, ang); len = len || 20;
    return L('M' + pt(q(-4, 0)) + 'L' + pt(q(3, 0)), OL, 5) + L('M' + pt(q(-4, 0)) + 'L' + pt(q(3, 0)), '#3a2a22', 3) + L('M' + pt(q(4, -4.5)) + 'L' + pt(q(4, 4.5)), OL, 4) + L('M' + pt(q(4, -4.5)) + 'L' + pt(q(4, 4.5)), '#8a8a90', 2) +
      P(pd([q(5, -2.4), q(len * 0.7, -2), q(len, 0), q(len * 0.7, 2), q(5, 2.4)], true), c_(blade || '#c8ccd4'), 1.3) + L('M' + pt(q(6, 0)) + 'L' + pt(q(len * 0.8, 0)), '#ffffff', 0.8, 0.6);
  }
  // wavy ritual dagger
  function krisDagger(c, p, ang, len) {
    var q = dirQ(p, ang), o = L('M' + pt(q(-5, 0)) + 'L' + pt(q(3, 0)), OL, 5) + L('M' + pt(q(-5, 0)) + 'L' + pt(q(3, 0)), '#2a1a30', 3) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), OL, 4) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), '#8a60c0', 2);
    var d = 'M' + pt(q(5, -2.6)) + 'Q' + pt(q(len * 0.3, -5)) + ' ' + pt(q(len * 0.45, -1.4)) + 'Q' + pt(q(len * 0.6, 2)) + ' ' + pt(q(len * 0.75, -2)) + 'L' + pt(q(len, 2)) + 'Q' + pt(q(len * 0.72, 3)) + ' ' + pt(q(len * 0.6, 3.6)) + 'Q' + pt(q(len * 0.42, 5)) + ' ' + pt(q(len * 0.3, 2.4)) + 'L' + pt(q(5, 2.6)) + 'Z';
    return o + P(d, c.cel('#b8bcc8'), 1.3) + C(q(len * 0.8, 0)[0], q(len * 0.8, 0)[1], 5, glow(c, '#b070ff', 0.5));
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
  function totemStaff(c, top, bot, glowCol) {
    var d = 'M' + pt(top) + 'L' + pt(bot), o = limb(d, '#7a5434', 3.6) + L(d, '#a87a4a', 1, 0.6), x = top[0], y = top[1];
    o += orb(c, x, y - 24, 4.4, glowCol || '#7aff5a');
    o += C(x - 6, y - 15, 3, c.cel('#9a6a3a'), 1.2) + C(x + 6, y - 15, 3, c.cel('#9a6a3a'), 1.2);
    o += body(c, pd([[x - 7, y + 2], [x - 8, y - 15], [x + 8, y - 15], [x + 7, y + 2]], true), '#a8743e', C(x - 3, y - 9, 1.3, OL) + C(x + 3, y - 9, 1.3, OL) + E(x, y - 4, 3, 2, '#5a3a20') + F(pd([[x + 2, y - 16], [x + 9, y - 16], [x + 9, y + 3], [x + 2, y + 3]], true), '#000', 0.25), 1.5);
    o += L('M' + pt([x - 7, y + 2]) + 'L' + pt([x - 9, y + 12]) + 'M' + pt([x + 7, y + 2]) + 'L' + pt([x + 9, y + 10]), '#3a2a20', 0.9) + feather(c, x - 9, y + 11, PI / 2 + 0.2, 10, '#f0ece2', '#3a8a4a') + feather(c, x + 9, y + 9, PI / 2 - 0.2, 9, '#f0ece2', '#c8a030');
    return o;
  }
  // ---- biped rig (facing left; shared copy of art_hillsbrad.js) ----
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

  // ---- naga (serpent tail coiled on the ground, facing left) ----
  function nagaHeadM(c, x, y, o) {
    var sc = o.col, fin = o.fin, s = '';
    s += body(c, pd([[x - 6, y - 12], [x - 2, y - 25], [x + 4, y - 15], [x + 10, y - 27], [x + 14, y - 13], [x + 23, y - 21], [x + 20, y - 6], [x + 29, y - 4], [x + 16, y + 4], [x + 8, y - 4]], true), fin,
      L('M' + pt([x - 1, y - 14]) + 'L' + pt([x - 2, y - 22]) + 'M' + pt([x + 8, y - 12]) + 'L' + pt([x + 10, y - 24]) + 'M' + pt([x + 16, y - 8]) + 'L' + pt([x + 21, y - 18]), dk(fin, 0.35), 1.1), 1.8);
    var d = 'M' + pt([x + 10, y - 6]) + 'C' + pt([x + 8, y - 14]) + ' ' + pt([x - 4, y - 16]) + ' ' + pt([x - 10, y - 10]) + 'L' + pt([x - 20, y - 4]) + 'C' + pt([x - 23, y - 2]) + ' ' + pt([x - 23, y + 3]) + ' ' + pt([x - 20, y + 4]) + 'L' + pt([x - 18, y + 9]) + 'C' + pt([x - 14, y + 14]) + ' ' + pt([x - 4, y + 16]) + ' ' + pt([x + 4, y + 13]) + 'C' + pt([x + 10, y + 10]) + ' ' + pt([x + 12, y + 2]) + ' ' + pt([x + 10, y - 6]) + 'Z';
    s += body(c, d, sc, F(pd([[x + 2, y - 18], [x + 14, y - 18], [x + 14, y + 18], [x + 2, y + 18]], true), dk(sc, 0.25), 0.8) + F('M' + pt([x - 20, y + 5]) + 'L' + pt([x - 4, y + 7]) + 'L' + pt([x + 6, y + 10]) + 'L' + pt([x + 6, y + 20]) + 'L' + pt([x - 20, y + 20]) + 'Z', o.belly, 0.85) +
      C(x - 2, y - 10, 1.4, dk(sc, 0.3)) + C(x + 3, y - 7, 1.2, dk(sc, 0.3)) + C(x - 6, y - 8, 1, dk(sc, 0.3)), 2.2);
    s += P(pd([[x + 2, y - 2], [x + 17, y - 9], [x + 13, y + 1], [x + 19, y + 6], [x + 4, y + 5]], true), c.cel(fin), 1.5);
    s += L('M' + pt([x - 21, y + 4]) + 'L' + pt([x - 7, y + 6]), OL, 1.6) + P(pd([[x - 18, y + 4.4], [x - 17, y + 8], [x - 15.8, y + 4.6]], true), '#f4ecd6', 0.8) + P(pd([[x - 12, y + 5.2], [x - 11, y + 8.6], [x - 9.8, y + 5.4]], true), '#f4ecd6', 0.8);
    s += P('M' + pt([x - 14, y + 8]) + 'C' + pt([x - 18, y + 4]) + ' ' + pt([x - 20, y]) + ' ' + pt([x - 19, y - 4]) + 'C' + pt([x - 16, y]) + ' ' + pt([x - 13, y + 3]) + ' ' + pt([x - 11, y + 6]) + 'Z', c.cel('#f4ecd6'), 1);
    s += gEye(c, x - 9, y - 5, 1.5, o.eye || '#ffe040') + L('M' + pt([x - 15, y - 7]) + 'L' + pt([x - 3, y - 10]), OL, 2.2) + E(x - 20.5, y - 1, 1.2, 1, OL);
    var bb = 'M' + pt([x - 16, y + 11]) + 'Q' + pt([x - 21, y + 18]) + ' ' + pt([x - 15, y + 23]);
    return s + L(bb, OL, 3.2) + L(bb, fin, 1.4);
  }
  function nagaHeadF(c, x, y, o) {
    var sc = o.col, s = '', hc = o.hair || '#1e4a5a';
    s += body(c, 'M' + pt([x - 6, y - 12]) + 'C' + pt([x + 10, y - 20]) + ' ' + pt([x + 22, y - 6]) + ' ' + pt([x + 24, y + 12]) + 'C' + pt([x + 28, y + 30]) + ' ' + pt([x + 32, y + 40]) + ' ' + pt([x + 40, y + 50]) + 'C' + pt([x + 28, y + 48]) + ' ' + pt([x + 18, y + 36]) + ' ' + pt([x + 12, y + 20]) + 'C' + pt([x + 10, y + 12]) + ' ' + pt([x + 6, y + 4]) + ' ' + pt([x, y]) + 'Z', hc,
      L('M' + pt([x + 12, y - 8]) + 'C' + pt([x + 20, y + 4]) + ' ' + pt([x + 22, y + 24]) + ' ' + pt([x + 34, y + 44]) + 'M' + pt([x + 6, y - 6]) + 'C' + pt([x + 14, y + 8]) + ' ' + pt([x + 16, y + 26]) + ' ' + pt([x + 24, y + 38]), lt(hc, 0.25), 1.1, 0.8), 2);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, o.face || sc, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 16]) + 'L' + pt([x + 1, y + 16]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(o.face || sc, 0.22), 0.8) + C(x + 4, y + 6, 1, dk(sc, 0.3)) + C(x + 6, y + 2, 0.9, dk(sc, 0.3)), 2);
    s += P(pd([[x + 3, y - 1], [x + 17, y - 11], [x + 14, y - 1], [x + 20, y + 4], [x + 5, y + 5]], true), c.cel(o.fin), 1.4);
    s += gEye(c, x - 5, y - 1, 1.4, o.eye || '#aaffee') + L('M' + pt([x - 9, y - 5]) + 'L' + pt([x - 2, y - 6]), OL, 1.6) + L('M' + pt([x - 8, y + 7]) + 'Q' + pt([x - 5.5, y + 8.6]) + ' ' + pt([x - 3, y + 7]), '#6a1a3a', 1.4);
    s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 5]) + 'C' + pt([x + 2, y - 9]) + ' ' + pt([x - 4, y - 9]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 1.8);
    if (o.crown) s += o.crown(c, x, y);
    return s;
  }
  function naga(c, o) {
    var sc = o.col, bel = o.belly || '#e0d8a8', fin = o.fin || '#d8503a';
    var T = taper(o.tail || [[66, 80], [58, 98], [64, 110], [84, 114], [104, 111], [116, 100], [110, 90]], o.tw || 26, 4, 6);
    return biped(c, {
      skin: sc, shirt: o.torso || sc, sleeve: o.sleeve || sc, forearm: o.forearm, glove: sc, noLegs: true, shadow: false, armW: o.armW || 8.5, hipY: 84, neck: o.neck,
      torsoD: o.torsoD || 'M44,50 C50,43 78,43 84,50 L80,68 L74,86 L54,86 L48,68 Z',
      back: function (c) {
        var s = shadow(c, 82, 44) + (o.back ? o.back(c) : '');
        s += body(c, T.d, sc, F(ribbonBand(T, 0, 0.42), bel, 0.95) + L(bands(T, 3, 3), dk(sc, 0.3), 1.1, 0.8) + L(along(T, 0.42), dk(bel, 0.3), 1, 0.8) + F(ribbonBand(T, 0.75, 1), dk(sc, 0.25), 0.7), 2.4);
        var tip = T.s[T.s.length - 1];
        s += P(pd([[tip[0] - 3, tip[1] + 3], [tip[0] + 5, tip[1] - 13], [tip[0] + 11, tip[1] - 2], [tip[0] + 4, tip[1] + 5]], true), c.cel(fin), 1.4);
        return s + (o.back2 ? o.back2(c) : '');
      },
      chest: function (c) {
        return (o.female ? '' : L('M52,58 Q60,63 68,58 M54,68 Q60,71 66,68 M56,77 Q60,79 64,77', dk(sc, 0.3), 1.3)) + F('M54,62 L72,62 L70,86 L56,86 Z', bel, 0.55) + (o.chest ? o.chest(c) : '');
      },
      front: function (c) { return body(c, 'M49,80 L79,80 L81,90 L74,88 L70,96 L64,89 L58,97 L55,89 L47,92 Z', o.belt || '#6a4a3a', L('M50,83 L79,83', dk(o.belt || '#6a4a3a', 0.35), 1.1), 1.8) + (o.front ? o.front(c) : ''); },
      pads: o.pads, top: o.top,
      head: function (c, x, y) { return (o.female ? nagaHeadF : nagaHeadM)(c, x, y, o); }, hx: o.hx || 58, hy: o.hy || 32,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      tf: at(o.scale || 1, 64, 122)
    });
  }
  function shellPad(c, x, y, s, col) {
    var d = 'M' + pt([x - 11 * s, y + 5 * s]) + 'C' + pt([x - 12 * s, y - 8 * s]) + ' ' + pt([x + 10 * s, y - 10 * s]) + ' ' + pt([x + 12 * s, y + 4 * s]) + 'Q' + pt([x, y]) + ' ' + pt([x - 11 * s, y + 5 * s]) + 'Z';
    return body(c, d, col, L('M' + pt([x, y - 7 * s]) + 'L' + pt([x - 7 * s, y + 3 * s]) + 'M' + pt([x, y - 7 * s]) + 'L' + pt([x, y + 1 * s]) + 'M' + pt([x, y - 7 * s]) + 'L' + pt([x + 7 * s, y + 3 * s]), dk(col, 0.35), 1.1 * s), 1.8 * s);
  }
  function coralCrown(c, x, y) {
    var col = '#f07a6a', d = 'M' + pt([x - 7, y - 11]) + 'L' + pt([x - 11, y - 22]) + 'M' + pt([x - 9, y - 17]) + 'L' + pt([x - 15, y - 21]) + 'M' + pt([x, y - 13]) + 'L' + pt([x + 1, y - 29]) + 'M' + pt([x + 1, y - 21]) + 'L' + pt([x - 4, y - 26]) + 'M' + pt([x + 1, y - 24]) + 'L' + pt([x + 6, y - 28]) + 'M' + pt([x + 7, y - 11]) + 'L' + pt([x + 13, y - 22]) + 'M' + pt([x + 11, y - 18]) + 'L' + pt([x + 16, y - 18]);
    return L(d, OL, 4.8) + L(d, col, 2.6) + L(d, lt(col, 0.4), 0.9, 0.7) + L('M' + pt([x - 10, y - 10]) + 'Q' + pt([x, y - 15]) + ' ' + pt([x + 10, y - 10]), OL, 4) + L('M' + pt([x - 10, y - 10]) + 'Q' + pt([x, y - 15]) + ' ' + pt([x + 10, y - 10]), '#e8c8a0', 2) + C(x, y - 13, 1.8, '#6ae8e0', 0.8);
  }
  function serpentCrown(c, x, y) {
    var o = L('M' + pt([x - 11, y - 9]) + 'Q' + pt([x, y - 15]) + ' ' + pt([x + 11, y - 9]), OL, 5) + L('M' + pt([x - 11, y - 9]) + 'Q' + pt([x, y - 15]) + ' ' + pt([x + 11, y - 9]), '#e0b840', 2.8);
    [[-7, -1], [0, 0], [7, 1]].forEach(function (k, i) {
      var bx = x + k[0], by = y - 12 - (i === 1 ? 1 : 0), h = i === 1 ? 16 : 11, d = 'M' + pt([bx, by]) + 'C' + pt([bx + 4, by - h * 0.3]) + ' ' + pt([bx - 4, by - h * 0.6]) + ' ' + pt([bx, by - h]);
      o += L(d, OL, 4.6) + L(d, '#2a8a5a', 2.6) + E(bx - 2, by - h - 1, 3.4, 2.4, c.cel('#2a8a5a'), 1.2) + C(bx - 3, by - h - 1.4, 0.8, '#ff4040') + L('M' + pt([bx - 5, by - h]) + 'l-3,1', '#c02020', 0.8);
    });
    return o + C(x, y - 13, 1.8, '#c02040', 0.8);
  }

  // ---- furbolg (bear-folk biped, facing left) ----
  function furHead(c, x, y, o) {
    var fur = o.fur, mz = o.muzzle || lt(fur, 0.35), s = '', k = o.headK || 0.9;
    if (o.headBack) s += o.headBack(c);
    s += C(22, 49, 5.6, c.cel(dk(fur, 0.1)), 2) + C(22, 49, 2.4, dk(fur, 0.4));
    var hd = 'M42,62 C44,50 32,44 22,48 C14,50 10,56 10,62 L4,68 C0,72 1,79 6,81 L14,83 C20,89 36,89 42,83 C48,77 46,70 42,62 Z';
    s += body(c, hd, fur, F('M32,44 L52,44 L52,92 L36,92 C44,80 42,62 32,44 Z', dk(fur, 0.25), 0.7) + F('M1,72 C6,68 14,68 20,72 C22,78 20,84 14,86 L1,86 Z', mz, 0.95) +
      (o.paint ? L('M26,54 L30,64 M31,54 L34,62', o.paint, 2.2) : '') + L('M30,70 l3,3 M26,76 l3,2 M34,62 l3,2', dk(fur, 0.35), 1.1), 2.4);
    s += C(34, 50, 6, c.cel(fur), 2) + C(34, 50, 2.6, dk(fur, 0.45));
    s += E(3.6, 71, 3.4, 2.8, '#140c0a', 1.2);
    s += o.roar ? P('M4,80 C10,78 16,79 20,81 L16,88 C12,89 7,88 5,85 Z', '#4a1014', 1.3) + P('M7,80.4 L8,84 L9.4,80.6 Z M14,80.6 L15,84.4 L16.4,81 Z', '#f4ecd6', 0.7) : L('M5,80 Q10,83 18,81', OL, 1.4) + P('M9,81 L10,84.6 L11.4,81.4 Z', '#f4ecd6', 0.7);
    s += (o.eyeGlow ? gEye(c, 19, 62, 1.8, o.eyeGlow) : E(19, 62, 2.3, 2.1, o.eye || '#2a1a10', 1) + C(18.4, 61.4, 0.7, '#ffffff')) + L('M13,58 L25,55', OL, 2.4);
    if (o.eyeScar) s += L('M14,52 L24,70 M18,51 L27,66', lt(fur, 0.55), 1.6);
    s += P(pd([[36, 76], [32, 90], [39, 84], [42, 94], [46, 82]], true), c.cel(fur), 1.6);
    if (o.feathers) o.feathers.forEach(function (f, i) { s += feather(c, 34 + i * 3, 48 - i, -PI / 2 + 0.5 + i * 0.35, 13, '#f0ece2', f); });
    if (o.headTop) s += o.headTop(c);
    return G(s, 'matrix(' + k + ',0,0,' + k + ',' + n(x - 26 * k) + ',' + n(y - 66 * k) + ')');
  }
  function furbolg(c, o) {
    var fur = o.fur, fd = dk(fur, 0.22), rng2 = rng(o.seed || 5);
    var tex = ''; for (var i = 0; i < 12; i++) { var fx = 44 + rng2() * 38, fy = 52 + rng2() * 34; tex += 'M' + pt([fx, fy]) + 'q' + n(-1 - rng2() * 2) + ',3 ' + n(-1) + ',' + n(6 + rng2() * 2); }
    return biped(c, {
      skin: fur, shirt: fur, pants: o.pants || fd, sleeve: fur, glove: fur, boots: dk(fur, 0.35), feet: function (x, y, col) { return bearPaw(x, y, c_(col)); }, legW: 14, armW: 12, shadowR: o.shadowR || 38, hipY: 88, neck: false,
      torsoD: o.torsoD || 'M36,54 C38,38 84,34 92,50 C96,64 90,80 84,92 L46,92 C38,82 34,68 36,54 Z',
      back: function (c) { return (o.back ? o.back(c) : '') + P(shag(72, 50, 24, 16, 9, 0.24, o.seed || 5, -0.3), c.cel(dk(fur, 0.12)), 2); },
      chest: function (c) { return E(58, 74, 14, 14, lt(fur, 0.14), 0, 0.7) + L(tex, dk(fur, 0.3), 1.1, 0.85) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return body(c, 'M46,84 L84,84 L86,102 L78,98 L72,106 L66,98 L58,106 L54,98 L44,102 Z', o.loin || '#6a4a2a', L('M47,88 L85,88', dk(o.loin || '#6a4a2a', 0.4), 1.2), 1.8) + (o.front ? o.front(c) : ''); },
      head: function (c, x, y) { return furHead(c, x, y, o); }, hx: o.hx || 40, hy: o.hy || 40,
      near: o.near || [[44, 56], [32, 72], [24, 84]], far: o.far || [[84, 54], [96, 70], [98, 86]],
      nearHand: function (c, p) { return clawHand(p, fur, 1.25); }, farHand: function (c, p) { return clawHand(p, fd, 1.15); },
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, pads: o.pads, top: o.top,
      tf: at(o.scale || 1, 64, 122)
    });
  }
  function beadNecklace(x, y, w, cols) {
    var o = L('M' + pt([x - w, y]) + 'Q' + pt([x, y + w * 0.7]) + ' ' + pt([x + w, y]), '#3a2a1a', 1.1);
    for (var i = 0; i <= 6; i++) { var t = i / 6, bx = x - w + 2 * w * t, by = y + 4 * t * (1 - t) * w * 0.7 / 1; o += C(bx, by, 1.8, cols[i % cols.length], 0.8); }
    return o;
  }

  // ---- satyr (goat legs, horns, facing left) ----
  function satyrHead(c, x, y, o) {
    var sk = o.skin, s = '', hc = o.hair || '#2a1a24';
    var horn = function (dx, dy, col, far) {
      var pts = o.horns === 'swept' ? [[x - 2 + dx, y - 11 + dy], [x + 6 + dx, y - 22 + dy], [x + 18 + dx, y - 29 + dy], [x + 33 + dx, y - 31 + dy]] : [[x - 2 + dx, y - 11 + dy], [x + 3 + dx, y - 23 + dy], [x + 16 + dx, y - 25 + dy], [x + 22 + dx, y - 14 + dy], [x + 17 + dx, y - 4 + dy], [x + 11 + dx, y - 7 + dy]];
      var T = taper(pts, o.horns === 'swept' ? 8 : 10, o.horns === 'swept' ? 1.4 : 3, 5);
      return body(c, T.d, col, L(bands(T, 2, 2), dk(col, 0.35), 1.1) + (far ? '' : F(ribbonBand(T, 0, 0.35), lt(col, 0.15), 0.7)), 1.8);
    };
    s += horn(7, 2, dk(o.hornCol || '#3a2a2a', 0.2), true);
    s += P(shag(x + 9, y - 1, 11, 13, 7, 0.25, 21), c.cel(hc), 1.8);
    var d = 'M' + pt([x - 8, y - 9]) + 'C' + pt([x - 6, y - 15]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 5]) + 'C' + pt([x + 8, y + 12]) + ' ' + pt([x, y + 15]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 9, y + 12]) + ' ' + pt([x - 11, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'L' + pt([x - 16, y]) + 'L' + pt([x - 11, y - 3]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 3, y - 16], [x + 14, y - 16], [x + 14, y + 16], [x + 2, y + 16]], true), dk(sk, 0.22), 0.8) + (o.veins ? L('M' + pt([x - 2, y + 4]) + 'l3,4 M' + pt([x + 3, y - 10]) + 'l-2,4', o.veins, 1.2) : ''), 2);
    s += P('M' + pt([x - 10, y + 10]) + 'C' + pt([x - 9, y + 20]) + ' ' + pt([x - 5, y + 26]) + ' ' + pt([x - 2, y + 29]) + 'C' + pt([x - 1, y + 22]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x + 3, y + 12]) + 'Z', c.cel(hc), 1.4);
    s += P(pd([[x + 5, y - 3], [x + 22, y - 10], [x + 8, y + 4]], true), c.cel(sk), 1.6) + F(pd([[x + 8, y - 2], [x + 18, y - 8], [x + 9, y + 1]], true), dk(sk, 0.3), 0.8);
    s += gEye(c, x - 5, y - 3, 1.6, o.eye || FEL) + L('M' + pt([x - 11, y - 6]) + 'L' + pt([x - 1, y - 9]), OL, 2.2);
    s += L('M' + pt([x - 12, y + 6]) + 'L' + pt([x - 4, y + 6]), OL, 1.4) + P(pd([[x - 10, y + 6.4], [x - 9, y + 9.6], [x - 8, y + 6.6]], true), '#f4ecd6', 0.7) + E(x - 15, y - 0.6, 1, 0.8, OL);
    s += horn(0, 0, o.hornCol || '#3a2a2a', false);
    return s;
  }
  function satyr(c, o) {
    var sk = o.skin, fur = o.fur;
    return biped(c, {
      skin: sk, shirt: sk, pants: fur, sleeve: sk, glove: sk, boots: '#1e1418', digi: true, feet: hoof, legW: 11, armW: o.armW || 9, shadowR: 32, hipY: 84, neckCol: sk,
      torsoD: o.torsoD || 'M44,50 C50,42 78,42 84,50 L80,68 L76,86 L52,86 L48,68 Z', hx: o.hx || 56, hy: o.hy || 32,
      back: function (c) { var t = 'M76,84 C92,84 100,96 96,108'; return (o.back ? o.back(c) : '') + L(t, OL, 5) + L(t, sk, 2.6) + P(shag(96, 110, 4, 5, 5, 0.3, 31), c.cel(fur), 1.2); },
      shins: function (c) { return P(shag(76, 100, 7, 7, 6, 0.3, 33), c.cel(dk(fur, 0.18)), 1.4) + P(shag(62, 100, 8, 7, 6, 0.3, 35), c.cel(fur), 1.5); },
      chest: function (c) { return L('M52,56 Q60,62 68,56 M54,68 Q60,71 66,68 M56,77 Q60,79 64,77', dk(sk, 0.3), 1.3) + (o.veins ? L('M50,60 l6,6 l-2,6 M72,56 l-4,8 l3,6', o.veins, 1.3, 0.9) : '') + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return P(shag(64, 84, 18, 6, 9, 0.3, 37), c.cel(fur), 1.6) + (o.front ? o.front(c) : ''); },
      pads: o.pads, top: o.top,
      head: function (c, x, y) { return satyrHead(c, x, y, o); },
      near: o.near || [[48, 54], [36, 62], [26, 60]], far: o.far || [[80, 54], [94, 58], [100, 48]],
      nearHand: o.nearHand || function (c, p) { return clawHand(p, sk, 1.1, '#2a1a1a'); }, farHand: o.farHand || function (c, p) { return clawHand(p, dk(sk, 0.1), 1, '#2a1a1a'); },
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      tf: at(o.scale || 1, 64, 122)
    });
  }

  // ---- night elf head (Oreth) ----
  function neHead(c, x, y, o) {
    var sk = o.skin || '#8a78b8', hc = o.hairCol || '#2a4a5a', s = '';
    s += body(c, 'M' + pt([x - 4, y - 12]) + 'C' + pt([x + 12, y - 18]) + ' ' + pt([x + 20, y - 4]) + ' ' + pt([x + 20, y + 10]) + 'C' + pt([x + 22, y + 22]) + ' ' + pt([x + 24, y + 30]) + ' ' + pt([x + 28, y + 36]) + 'L' + pt([x + 12, y + 30]) + 'C' + pt([x + 10, y + 20]) + ' ' + pt([x + 8, y + 8]) + ' ' + pt([x, y]) + 'Z', hc, L('M' + pt([x + 10, y - 8]) + 'C' + pt([x + 16, y + 4]) + ' ' + pt([x + 16, y + 18]) + ' ' + pt([x + 22, y + 30]), lt(hc, 0.25), 1.1, 0.8), 2);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 15]) + ' ' + pt([x + 9, y - 16]) + ' ' + pt([x + 11, y - 6]) + 'L' + pt([x + 11, y + 5]) + 'C' + pt([x + 9, y + 12]) + ' ' + pt([x + 1, y + 15]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 12]) + ' ' + pt([x - 11, y + 8]) + ' ' + pt([x - 11, y + 3]) + 'L' + pt([x - 14, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 16]) + 'L' + pt([x + 1, y + 16]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.22), 0.8) + L('M' + pt([x - 7, y + 2]) + 'Q' + pt([x - 4, y + 5]) + ' ' + pt([x - 1, y + 2]), dk(sk, 0.3), 1.1), 2);
    s += P('M' + pt([x + 4, y - 2]) + 'C' + pt([x + 14, y - 8]) + ' ' + pt([x + 26, y - 18]) + ' ' + pt([x + 34, y - 26]) + 'C' + pt([x + 26, y - 12]) + ' ' + pt([x + 16, y - 1]) + ' ' + pt([x + 8, y + 5]) + 'Z', c.cel(sk), 1.6) + L('M' + pt([x + 8, y]) + 'C' + pt([x + 16, y - 5]) + ' ' + pt([x + 24, y - 12]) + ' ' + pt([x + 28, y - 18]), dk(sk, 0.3), 1, 0.8);
    s += gEye(c, x - 5, y - 2, 1.6, o.eye || '#f0f4ff') + L('M' + pt([x - 11, y - 5]) + 'L' + pt([x - 1, y - 7]) + 'L' + pt([x + 6, y - 12]), o.browCol || hc, 2);
    s += L('M' + pt([x - 9, y + 8]) + 'L' + pt([x - 3, y + 8]), OL, 1.3);
    if (o.beard) s += P('M' + pt([x - 10, y + 9]) + 'C' + pt([x - 10, y + 18]) + ' ' + pt([x - 6, y + 24]) + ' ' + pt([x - 3, y + 26]) + 'C' + pt([x - 1, y + 20]) + ' ' + pt([x + 2, y + 14]) + ' ' + pt([x + 4, y + 11]) + 'Z', c.cel(o.beard), 1.4);
    s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 11, y - 17]) + ' ' + pt([x + 10, y - 19]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 7, y - 6]) + 'C' + pt([x + 2, y - 10]) + ' ' + pt([x - 4, y - 10]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 1.8);
    if (o.circlet) s += L('M' + pt([x - 10, y - 9]) + 'Q' + pt([x, y - 13]) + ' ' + pt([x + 11, y - 9]), OL, 3.4) + L('M' + pt([x - 10, y - 9]) + 'Q' + pt([x, y - 13]) + ' ' + pt([x + 11, y - 9]), o.circlet, 1.6) + C(x - 3, y - 11.4, 1.6, '#c070ff', 0.8);
    return s;
  }
  // hooded cultist head: deep hood, shadowed face, glowing eyes
  function cultHead(c, x, y, o) {
    var hcol = o.hood || '#3a2a5a', sk = o.skin || '#d8a888', s = '';
    var hd = 'M' + pt([x - 15, y + 4]) + 'C' + pt([x - 20, y - 16]) + ' ' + pt([x - 2, y - 28]) + ' ' + pt([x + 10, y - 24]) + 'C' + pt([x + 24, y - 18]) + ' ' + pt([x + 24, y + 8]) + ' ' + pt([x + 18, y + 22]) + 'L' + pt([x + 4, y + 22]) + 'C' + pt([x + 6, y + 8]) + ' ' + pt([x + 4, y - 8]) + ' ' + pt([x - 2, y - 11]) + 'C' + pt([x - 8, y - 11]) + ' ' + pt([x - 12, y - 5]) + ' ' + pt([x - 15, y + 4]) + 'Z';
    s += body(c, hd, hcol, F('M' + pt([x + 8, y - 26]) + 'L' + pt([x + 26, y - 26]) + 'L' + pt([x + 26, y + 24]) + 'L' + pt([x + 10, y + 24]) + 'Z', dk(hcol, 0.4), 0.8) + L('M' + pt([x - 2, y - 22]) + 'Q' + pt([x + 8, y - 20]) + ' ' + pt([x + 15, y - 8]), lt(hcol, 0.2), 1.2, 0.7), 2.2);
    var fd = 'M' + pt([x - 14, y + 3]) + 'C' + pt([x - 12, y - 8]) + ' ' + pt([x - 4, y - 10]) + ' ' + pt([x + 4, y - 8]) + 'L' + pt([x + 5, y + 8]) + 'C' + pt([x + 3, y + 13]) + ' ' + pt([x - 3, y + 15]) + ' ' + pt([x - 7, y + 14]) + 'C' + pt([x - 11, y + 12]) + ' ' + pt([x - 13, y + 8]) + ' ' + pt([x - 14, y + 3]) + 'Z';
    s += body(c, fd, sk, F('M' + pt([x - 16, y - 12]) + 'L' + pt([x + 8, y - 12]) + 'L' + pt([x + 8, y + 3]) + 'L' + pt([x - 16, y + 2]) + 'Z', '#140a1e', 0.72) + F(pd([[x, y - 10], [x + 8, y - 10], [x + 8, y + 16], [x, y + 16]], true), '#000', 0.3), 1.6);
    s += gEye(c, x - 8, y - 1, 1.2, o.eye || '#c890ff') + gEye(c, x - 2, y - 1.4, 1, o.eye || '#c890ff') + L('M' + pt([x - 11, y + 8]) + 'L' + pt([x - 5, y + 9]), OL, 1.2);
    if (o.beard) s += P('M' + pt([x - 13, y + 6]) + 'C' + pt([x - 12, y + 16]) + ' ' + pt([x - 2, y + 18]) + ' ' + pt([x + 3, y + 9]) + 'C' + pt([x - 2, y + 12]) + ' ' + pt([x - 8, y + 12]) + ' ' + pt([x - 13, y + 6]) + 'Z', c.cel(o.beard), 1.3);
    return s;
  }
  function human(c, o) {
    var sk = o.skin || '#e8b890';
    return biped(c, {
      skin: sk, shirt: o.shirt, pants: o.pants, sleeve: o.sleeve, forearm: o.forearm, glove: o.glove || sk, boots: o.boots || '#3a2a1e', belt: o.belt, buckle: o.buckle,
      head: o.head, hx: o.hx || 60, hy: o.hy || 30, neckCol: o.neckCol || sk, neck: o.neck,
      torsoD: o.torsoD, legW: o.legW || 10, armW: o.armW || 8.5, shadowR: o.shadowR || 30, hipY: o.hipY, noLegs: o.noLegs, shadow: o.shadow,
      chest: o.chest, front: o.front, back: o.back, pads: o.pads, shins: o.shins, top: o.top,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      tf: o.tf || at(o.scale || 0.94, 64, 122), op: o.op
    });
  }
  function robeFront(c, robe, trim, x0, x1) {
    return body(c, 'M48,82 L80,82 L90,120 L74,118 L64,122 L54,118 L38,120 Z', robe, L('M64,84 L64,120', trim, 2) + L('M40,118 L54,116 L64,120 L74,116 L88,118', trim, 1.8) + F('M70,80 L96,80 L96,124 L76,124 Z', '#000', 0.25), 2);
  }

  // ---- bear (shared copy of art_hillsbrad.js) ----
  function bear(c, o) {
    var col = o.col, bel = o.belly || lt(col, 0.2), dcol = dk(col, 0.22), mz = o.muzzle || lt(col, 0.35), s = shadow(c, 62, 58);
    s += limb('M58,92 L56,106 L54,116', dcol, 13) + bearPaw(55, 121, dk(col, 0.35)) + limb('M104,86 L108,102 L106,116', dcol, 13) + bearPaw(107, 121, dk(col, 0.35));
    s += P('M114,64 C122,62 126,68 122,74 C120,72 117,70 114,70 Z', c.cel(col), 1.6);
    var bd = 'M26,76 C22,54 40,36 64,36 C90,32 116,46 120,68 C124,88 116,100 102,102 L46,102 C32,100 28,90 26,76 Z';
    var fl = '', r = rng(o.seed || 3);
    for (var i = 0; i < 14; i++) { var fx = 40 + r() * 76, fy = 44 + r() * 50; fl += 'M' + pt([fx, fy]) + 'q' + n(3 + r() * 2) + ',' + n(2 + r() * 2) + ' ' + n(4 + r() * 3) + ',' + n(6 + r() * 3); }
    s += body(c, bd, col, F('M20,88 C44,104 90,106 124,90 L124,110 L20,110 Z', bel, 0.8) + F('M84,34 C104,38 122,50 124,70 L124,100 L104,100 C114,82 108,56 84,34 Z', dk(col, 0.22), 0.8) + F('M40,44 C52,36 70,34 84,38 C70,40 56,44 46,52 Z', lt(col, 0.2), 0.6) + L(fl, dk(col, 0.3), 1.2, 0.8) +
      (o.grizzle ? L(fl.replace(/q/g, 'm-2,-3 q'), o.grizzle, 1.2, 0.8) : ''), 2.6);
    s += C(22, 49, 5.6, c.cel(dk(col, 0.1)), 2) + C(22, 49, 2.4, dk(col, 0.4));
    var hd = 'M42,62 C44,50 32,44 22,48 C14,50 10,56 10,62 L4,68 C0,72 1,79 6,81 L14,83 C20,89 36,89 42,83 C48,77 46,70 42,62 Z';
    s += body(c, hd, col, F('M32,44 L52,44 L52,92 L36,92 C44,80 42,62 32,44 Z', dk(col, 0.25), 0.7) + F('M1,72 C6,68 14,68 20,72 C22,78 20,84 14,86 L1,86 Z', mz, 0.95), 2.4);
    s += C(34, 50, 6, c.cel(col), 2) + C(34, 50, 2.6, dk(col, 0.45));
    s += E(3.6, 71, 3.4, 2.8, '#140c0a', 1.2) + L('M5,80 Q10,83 18,81', OL, 1.4);
    if (o.fangs) s += P('M8,80.6 L9,85 L10.6,81 Z M14,81.4 L15,85.6 L16.4,81.4 Z', '#f4ecd6', 0.8);
    s += (o.eyeGlow ? gEye(c, 19, 62, 1.8, o.eyeGlow) : E(19, 62, 2.2, 2, o.eye || '#2a1a10', 1) + C(18.4, 61.4, 0.7, '#ffffff')) + L(o.angry ? 'M13,59 L24,56' : 'M13,58 L24,57', OL, 2.2);
    s += limb('M44,90 L42,104 L42,116', col, 14) + bearPaw(42, 121, dk(col, 0.3)) + limb('M92,92 L96,104 L94,116', col, 14) + bearPaw(95, 121, dk(col, 0.3));
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- wolf (shared copy of art_hillsbrad.js) ----
  function wolf(c, o) {
    var col = o.col, bel = o.belly || lt(col, 0.35), mane = o.mane || dk(col, 0.15), s = shadow(c, 62, 54);
    var fl = dk(col, 0.22);
    if (o.aura) s += C(50, 72, 64, glow(c, o.aura, 0.35));
    s += limb('M58,88 L60,104 L56,116', fl, 8.5) + paw(56, 121, dk(col, 0.35)) + limb('M100,84 L108,98 L102,110 L102,116', fl, 8.5) + paw(102, 121, dk(col, 0.35));
    s += body(c, 'M104,66 C116,64 124,74 124,88 C124,96 120,102 116,104 C116,96 114,88 108,82 C104,78 100,74 104,66 Z', col, F('M114,84 C120,90 120,98 116,104 L126,104 L126,84 Z', dk(col, 0.3), 0.8) + F('M116,96 C118,100 118,102 116,104 L124,104 L124,94 Z', bel, 0.9), 2.2);
    var bd = 'M40,68 C44,56 70,54 94,58 C108,60 114,70 110,82 C106,92 92,94 76,93 C58,94 46,90 40,82 C38,76 38,72 40,68 Z';
    s += body(c, bd, col, F('M30,84 C52,96 92,96 118,84 L118,104 L30,104 Z', bel, 0.85) + F('M56,58 C76,54 98,56 106,64 C88,60 72,60 56,62 Z', lt(col, 0.2), 0.5) + F('M70,56 C82,54 96,56 104,62 L104,72 C92,66 80,64 70,66 Z', dk(col, 0.2), 0.6) + (o.scars ? L('M72,66 L84,76 M78,64 L90,74 M90,62 L98,70', o.scars, 1.6) : '') + (o.stripes ? L('M60,60 C62,70 60,80 62,88 M74,58 C76,68 74,80 76,90 M88,60 C90,70 88,80 90,90', o.stripes, 2, 0.6) : ''));
    if (o.spikes) s += P('M52,58 L56,46 L62,56 L68,44 L74,55 L82,44 L86,56 L94,48 L96,60 Z', c.cel(mane), 1.8);
    s += P('M36,52 L44,46 L46,52 L54,48 L54,56 L60,56 L56,64 L62,70 L54,74 L58,82 L48,82 L46,90 L40,82 Z', c.cel(mane), 2);
    s += P('M34,56 L32,38 L44,52 Z', c.cel(dk(col, 0.1)), 2);
    var hd = 'M46,58 C42,50 30,48 24,54 L10,64 C5,66 3,72 6,76 L16,80 C22,86 36,86 44,80 C50,74 50,64 46,58 Z';
    s += body(c, hd, col, F('M36,50 L56,50 L56,92 L40,92 C48,80 46,64 36,50 Z', dk(col, 0.25), 0.7) + F('M6,74 C14,80 26,84 40,82 L40,92 L4,92 Z', bel, 0.85) + F('M10,64 C16,60 22,57 30,56 L28,62 C20,62 14,64 10,66 Z', dk(col, 0.25), 0.7) + (o.faceScar ? L('M18,54 L30,72', o.scars || '#fff', 1.5) : ''));
    s += P('M40,54 L42,34 L52,54 Z', c.cel(col), 2) + P('M43,50 L44,40 L48,51 Z', '#3a2a2a', 0);
    s += E(5.5, 69, 3.2, 2.6, '#1a1210', 1.2);
    s += o.glow ? gEye(c, 21.5, 63.5, 1.9, o.glow) + L('M14,59 L28,62', OL, 2.4) : L('M16,60 L27,61', OL, 2.2) + E(21.5, 63.5, 2.4, 1.7, o.eye || '#f0c040', 1) + E(21, 63.5, 0.7, 1.3, OL);
    if (o.snarl) s += P('M5,75 L22,77 L18,82 L8,80 Z', '#4a1014', 1.2) + P('M8,75.6 L9.4,80.4 L11,76 Z M15,76.4 L16.4,81.4 L18,76.8 Z M11,80.6 L12,77.4 L13.4,80.8 Z', '#fff', 0.7) + L('M8,70 L14,68 M10,72 L16,70', dk(col, 0.5), 1);
    else s += L('M6,76 L22,78', OL, 1.4) + P('M10,76.4 L11,80 L12.5,76.8 Z', '#fff', 0.8) + P('M17,77.4 L18,80.6 L19.5,77.8 Z', '#fff', 0.8);
    s += limb('M48,84 L44,102 L44,116', col, 9.5) + paw(44, 121, dk(col, 0.35)) + limb('M92,82 L100,96 L94,108 L94,116', col, 9.5) + paw(94, 121, dk(col, 0.35));
    return o.tf ? G(s, o.tf, o.op) : s;
  }
  // ---- turtle (after art_barrens.js, with barnacles, coral and kelp options) ----
  function turtle(c, o) {
    var sh = o.shell, sk = o.skin, moss = o.moss, s = shadow(c, 70, 56), dsk = dk(sk, 0.22), top = o.tall ? 30 : 44;
    var foot = function (x, cc) { return P('M' + n(x - 7) + ',115 L' + n(x + 6) + ',115 L' + n(x + 7) + ',122 L' + n(x - 9) + ',122 Z', c.cel(cc), 1.8) + L('M' + n(x - 8) + ',122 l-3,1 M' + n(x - 4) + ',122 l-2,1.6 M' + n(x) + ',122 l-2,1.6', OL, 1.6); };
    s += limb('M50,98 L46,116', dsk, 11) + foot(46, dsk) + limb('M104,98 L110,116', dsk, 11) + foot(110, dsk);
    s += P('M114,100 L126,104 L114,108 Z', c.cel(sk), 1.6);
    if (o.coral) s += o.coral(c);
    var dome = 'M28,102 C28,' + (top + 26) + ' 50,' + top + ' 78,' + top + ' C106,' + top + ' 124,' + (top + 24) + ' 124,102 Z';
    var yk = (102 - top) / 58, Y = function (v) { return n(102 - (102 - v) * yk); };
    var sc = L('M52,' + Y(52) + ' L60,' + Y(74) + ' L50,102 M78,' + top + ' L78,' + Y(74) + ' M104,' + Y(52) + ' L96,' + Y(74) + ' L106,102 M60,' + Y(74) + ' L96,' + Y(74) + ' M36,' + Y(80) + ' L60,' + Y(74) + ' M96,' + Y(74) + ' L120,' + Y(82) + ' M78,' + Y(74) + ' L78,102', dk(sh, 0.35), 1.8);
    var bar = ''; if (o.barnacles) { var r = rng(9); for (var i = 0; i < 14; i++) bar += C(40 + r() * 76, top + 8 + r() * (94 - top - 8), 1.4 + r() * 1.6, o.barnacles, 1); }
    s += body(c, dome, sh, sc + F('M90,' + (top - 2) + ' C112,' + (top + 6) + ' 126,' + (top + 28) + ' 126,104 L100,104 C104,82 100,60 90,' + (top - 2) + ' Z', dk(sh, 0.28), 0.8) +
      F('M44,' + Y(60) + ' C54,' + Y(48) + ' 70,' + Y(44) + ' 82,' + Y(46) + ' C72,' + Y(50) + ' 60,' + Y(52) + ' 52,' + Y(64) + ' Z', lt(sh, 0.25), 0.6) +
      (moss ? E(70, Y(52), 12, 5, moss, 0, 0.95) + E(46, Y(70), 8, 5, moss, 0, 0.9) + E(100, Y(60), 9, 4, moss, 0, 0.9) + E(88, Y(86), 7, 4, moss, 0, 0.7) : '') + bar, 2.4);
    if (o.spikes !== false) [[64, 50, -0.35], [78, 44, 0], [94, 50, 0.35], [44, 72, -0.9], [112, 72, 0.9], [78, 70, 0], [60, 74, -0.4], [96, 74, 0.4]].forEach(function (k) {
      var a = k[2] - Math.PI / 2, L0 = o.spikeLen || 12, bx = k[0], by = +Y(k[1]) + 3, px = -Math.sin(a) * 4, py = Math.cos(a) * 4;
      s += P(pd([[bx + px, by + py], [bx + Math.cos(a) * L0, by + Math.sin(a) * L0], [bx - px, by - py]], true), c.cel(o.spike || '#d8ccaa'), 1.4);
    });
    if (o.kelp) s += o.kelp(c);
    s += body(c, 'M24,100 C44,108 108,108 128,100 L126,108 C108,114 44,114 26,108 Z', o.rim || '#c8b27a', L('M40,104 L42,110 M56,106 L57,112 M72,107 L72,113 M88,107 L88,113 M104,106 L103,112', dk(o.rim || '#c8b27a', 0.35), 1.2), 2);
    s += limb('M40,96 C32,92 28,88 24,86', sk, 13);
    var hd = 'M30,78 C24,74 12,74 6,80 L2,86 C2,88 4,90 6,90 L10,90 L14,88 C20,92 28,94 32,90 C36,86 36,82 30,78 Z';
    s += body(c, hd, sk, F('M20,70 L38,70 L38,96 L26,96 C32,88 30,78 20,70 Z', dsk, 0.7) + L('M14,78 l3,2 M22,76 l2,3' + (o.wrinkles ? ' M24,82 l4,1 M26,86 l4,0 M12,84 l3,1' : ''), dsk, 1.2), 2);
    s += P('M6,90 L14,88 C18,92 24,96 30,94 C26,100 16,102 8,98 C5,96 5,92 6,90 Z', c.cel(lt(sk, 0.1)), 1.8);
    s += P('M2,86 L8,86 L6,92 Z', c.cel('#e8dcb0'), 1.2) + P('M8,98 L10,93 L13,98 Z', c.cel('#e8dcb0'), 1);
    if (o.beard) s += P('M10,98 C12,106 18,110 22,112 C22,106 24,100 26,96 Z', c.cel(o.beard), 1.3);
    s += L('M12,78 L21,79', OL, 2.2) + (o.eyeGlow ? gEye(c, 17, 81, 1.8, o.eyeGlow) : C(17, 81, 2, o.eye || '#ff8a2a', 1) + C(16.6, 81, 0.8, OL)) + C(5, 81, 0.8, OL);
    s += limb('M40,100 L34,116', sk, 12) + foot(34, sk) + limb('M92,102 L96,116', sk, 12) + foot(96, sk);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- murloc (shared shape with art_redridge.js, plus chieftain regalia options) ----
  function tube(pts, w, col, sh) {
    var d = pd(pts);
    return L(d, OL, w + 4.5) + L(d, col, w) + (sh ? '<path transform="translate(' + n(w * 0.24) + ',' + n(w * 0.08) + ')" d="' + d + '" fill="none" stroke="' + sh + '" stroke-width="' + n(w * 0.36) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>' : '');
  }
  function murloc(c, o) {
    var f = o.skin, fd = dk(f, 0.28), fin = o.fin, out = '';
    var bd = 'M30,66 C28,50 42,40 58,42 C76,44 90,56 90,76 C90,94 80,108 62,108 C46,108 36,98 34,86 C33,80 31,72 30,66 Z';
    out += shadow(c, 62, 36);
    if (o.back) out += o.back(c);
    out += P('M66,98 C74,90 88,94 88,104 C88,112 80,114 74,112 Z', c.cel(fd), 2.2) + tube([[80, 108], [86, 116], [78, 120]], 6.5, fd) + P('M66,118 L82,118 L86,123 L62,123 Z', c.cel(dk(fin, 0.2)), 2);
    out += tube([[74, 76], [84, 88], [80, 96]], 5.5, fd);
    out += P('M54,43 L56,30 L63,39 L69,27 L74,41 L82,33 L84,49 L93,45 L91,62 C87,54 74,44 54,43 Z', c.cel(fin), 2.2) + L('M60,40 L57,33 M68,40 L69,31 M76,44 L81,37 M84,51 L91,48', dk(fin, 0.35), 1.2);
    out += body(c, bd, f, F('M36,82 C40,98 52,106 64,106 C72,106 80,100 80,92 C68,98 50,94 40,78 Z', o.belly, 0.9) +
      C(66, 56, 3, fd, 0, 0.6) + C(76, 62, 2.4, fd, 0, 0.6) + C(72, 72, 2, fd, 0, 0.5) + C(60, 50, 2, fd, 0, 0.5) + (o.marks ? o.marks(c) : ''), 2.2);
    out += P('M80,60 L92,56 L90,66 L96,68 L86,74 Z', c.cel(fin), 2);
    out += P('M27,67 C36,73 48,73 58,69 C56,79 50,88 40,88 C34,88 29.5,82 28.5,74 Z', c.cel('#7a1a22'), 2.2);
    out += F('M33,82 C37,86 45,86 50,82 C45,80 38,80 33,82 Z', '#d0566a', 0.9);
    out += F('M31,69 l2,4.5 l2,-4 z M36,70.5 l2,4.5 l2,-4.3 z M41,71 l2,4.5 l2,-4.5 z M46,70.5 l2,4.2 l2,-4.5 z M51,69.5 l1.8,4 l1.8,-4.4 z', '#f6f0dc');
    out += F('M36,87.5 l1.6,-3.5 l1.6,3.6 z M42,87.6 l1.6,-3.6 l1.6,3.4 z', '#f6f0dc');
    out += C(55, 47, 5.2, '#f2ecb0', 2) + C(53.5, 47.5, 2.2, '#140c08', 0);
    out += C(42, 51, 6.8, c.cel(o.eyeC || '#f6eeb8'), 2.2) + E(39.5, 51.5, 2, 3.6, '#140c08', 0) + C(40.8, 49, 1.1, '#fff', 0);
    out += L(o.angry ? 'M34,43 L48,48' : 'M35,44 L46,46', OL, 2.4);
    if (o.head) out += o.head(c);
    if (o.fItem) out += o.fItem(c);
    out += tube([[56, 80], [44, 90], [33, 92]], 5.5, f, fd);
    out += P('M34,88 L25,86 L27,90 L22,92 L28,94 L25,98 L34,96 Z', c.cel(lt(f, 0.1)), 1.8);
    if (o.front) out += o.front(c);
    out += P('M52,98 C60,88 76,92 78,102 C80,110 72,114 64,112 Z', c.cel(f), 2.2) + tube([[66, 108], [58, 115], [52, 119]], 7, f, fd) + P('M36,118 L56,118 L60,123 L32,123 L36,121 Z', c.cel(fin), 2.2) + L('M42,119 L40,123 M49,119 L48,123', dk(fin, 0.4), 1);
    return G(out, at(o.scale || 1, 62, 123));
  }
  // ---- hippogryph (eagle head and wings, deer body; facing left) ----
  function hWing(c, col, tip, tf) {
    var d = 'M62,64 C62,44 76,20 100,6 L108,6 C114,10 120,14 124,18 L118,22 C124,26 126,30 126,34 L118,36 C122,40 122,46 120,50 L110,50 C112,54 110,58 106,62 L96,62 C92,66 84,70 76,70 Z';
    var fl = 'M104,10 L110,48 M100,12 L98,58 M92,20 L86,64 M84,28 L76,68';
    return G(body(c, d, col, L(fl, dk(col, 0.35), 1.2) + F('M116,20 L126,34 L120,50 L110,50 L106,62 L96,62 L100,40 Z', tip, 0.9) + F('M70,52 C72,36 84,20 100,8 C88,22 80,36 78,54 Z', lt(col, 0.2), 0.6), 2.2), tf);
  }
  function talon(x, y, col) {
    var d = 'M' + pt([x - 2, y - 2]) + 'q-6,0 -8,4 M' + pt([x, y - 1]) + 'q-3,2 -4,5 M' + pt([x + 3, y - 1]) + 'q1,3 0,5';
    return C(x, y - 3, 4, c_(col), 1.6) + L(d, OL, 3.4) + L(d, '#2a2020', 1.6);
  }
  function hippogryph(c, o) {
    var bdc = o.body, hdc = o.head, wg = o.wing, tip = o.tip, leg = o.leg || '#d8a840', s = shadow(c, 66, 56);
    s += hWing(c, dk(wg, 0.2), dk(tip, 0.2), 'translate(-18,6)');
    s += limb('M100,86 L108,100 L102,112 L104,116', dk(bdc, 0.25), 7.5) + hoof(104, 121, '#3a2a2a');
    s += limb('M54,86 L52,100', dk(hdc, 0.2), 9) + limb('M52,100 L50,116', dk(leg, 0.2), 5) + talon(50, 121, dk(leg, 0.2));
    s += P('M110,74 C120,70 126,78 124,90 C122,98 118,104 114,106 C116,96 114,88 108,82 Z', c.cel(bdc), 2) + P('M114,78 L128,92 L118,90 L124,102 L112,94 Z', c.cel(tip), 1.6);
    var bd = 'M40,74 C44,62 66,58 90,60 C106,62 114,72 112,84 C110,94 98,98 82,96 C62,98 48,94 40,86 Z';
    s += body(c, bd, bdc, F('M30,86 C52,98 92,98 118,86 L118,104 L30,104 Z', lt(bdc, 0.15), 0.7) + F('M70,58 C84,56 100,58 108,66 L108,76 C96,68 84,66 70,68 Z', dk(bdc, 0.2), 0.6) + F('M34,58 L66,58 C62,70 60,84 64,100 L34,100 Z', hdc, 0.95) + L('M44,70 l6,4 M42,80 l7,3 M48,88 l6,2 M54,68 l5,5', dk(hdc, 0.25), 1.1));
    // neck and head
    s += body(c, 'M34,78 C28,66 24,54 26,42 L44,38 C46,52 52,64 60,72 Z', hdc, F('M40,36 L60,36 L60,80 L46,80 C44,64 44,50 40,36 Z', dk(hdc, 0.2), 0.7) + L('M32,52 l5,3 M30,62 l6,3 M36,70 l5,2', dk(hdc, 0.25), 1.1), 2.2);
    var ant = 'M34,22 L38,8 L36,0 M37,12 L45,8 M30,22 L28,10 L22,4 M29,14 L33,8';
    s += L(ant, OL, 4.4) + L(ant, '#e8e0c8', 2.2);
    var hd = 'M44,30 C44,18 32,14 22,18 C16,20 12,24 10,28 L14,34 C16,40 22,44 30,44 C38,44 44,38 44,30 Z';
    s += body(c, hd, hdc, F('M36,14 L52,14 L52,46 L36,46 C42,38 42,24 36,14 Z', dk(hdc, 0.22), 0.7) + P(pd([[40, 22], [50, 18], [46, 26], [54, 28], [46, 32], [52, 38], [42, 36]], true), c.cel(dk(hdc, 0.08)), 1.2), 2.2);
    s += P('M14,26 C8,26 2,30 0,38 C0,42 2,44 4,44 C4,40 6,36 10,36 L14,36 Z', c.cel(o.beak || '#e8b840'), 1.6);
    s += o.screech ? P('M10,38 L16,38 L14,46 C10,48 6,46 6,44 Z', c.cel(dk(o.beak || '#e8b840', 0.1)), 1.4) + P('M6,40 L12,38 L12,42 L8,44 Z', '#5a1018', 0.9) : '';
    s += gEye(c, 21, 28, 1.6, o.eye || '#ffc830') + L('M14,24 L28,26', OL, 2.6);
    s += limb('M92,88 L98,102 L92,112 L94,116', bdc, 8.5) + hoof(94, 121, '#2a1e1e');
    s += limb('M48,84 L42,100', hdc, 10) + limb('M42,100 L36,114', leg, 5.5) + talon(36, 120, leg);
    s += hWing(c, wg, tip, '');
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- hydra heads ----
  function hydraHead(c, x, y, s, o) {
    var sk = o.col, g = '', glw = o.eye || '#5affd8';
    g += P(pd([[x + 4, y - 8], [x + 12, y - 20], [x + 12, y - 8], [x + 22, y - 14], [x + 16, y - 2], [x + 22, y + 4], [x + 8, y + 4]], true), c.cel(o.fin || '#4a2a6a'), 1.6);
    var up = 'M' + pt([x + 10, y - 2]) + 'C' + pt([x + 8, y - 12]) + ' ' + pt([x - 6, y - 12]) + ' ' + pt([x - 14, y - 6]) + 'L' + pt([x - 26, y - 2]) + 'C' + pt([x - 29, y]) + ' ' + pt([x - 28, y + 4]) + ' ' + pt([x - 25, y + 4]) + 'L' + pt([x - 6, y + 3]) + 'C' + pt([x + 2, y + 6]) + ' ' + pt([x + 10, y + 6]) + ' ' + pt([x + 10, y - 2]) + 'Z';
    var lo = 'M' + pt([x - 2, y + 4]) + 'L' + pt([x - 22, y + 12]) + 'C' + pt([x - 24, y + 14]) + ' ' + pt([x - 22, y + 17]) + ' ' + pt([x - 19, y + 16]) + 'L' + pt([x + 6, y + 10]) + 'Z';
    g += P('M' + pt([x - 24, y + 3]) + 'L' + pt([x - 4, y + 3]) + 'L' + pt([x - 20, y + 13]) + 'Z', '#3a0a1a', 1.2);
    g += body(c, lo, dk(sk, 0.1), null, 1.8) + P(pd([[x - 18, y + 12], [x - 17, y + 8.6], [x - 15.4, y + 11.4], [x - 12, y + 10.4], [x - 11, y + 7], [x - 9.4, y + 9.6]], true), '#f4ecd6', 0.7);
    g += body(c, up, sk, F(pd([[x - 2, y - 14], [x + 14, y - 14], [x + 14, y + 8], [x - 2, y + 8]], true), dk(sk, 0.3), 0.7) + L('M' + pt([x - 20, y - 3]) + 'L' + pt([x - 6, y - 7]), lt(sk, 0.3), 1.2, 0.8), 2);
    g += P(pd([[x - 24, y + 4], [x - 23, y + 8], [x - 21.6, y + 4], [x - 17, y + 4], [x - 16, y + 7.6], [x - 14.8, y + 4]], true), '#f4ecd6', 0.7);
    g += gEye(c, x - 8, y - 5, 1.6, glw) + L('M' + pt([x - 14, y - 7]) + 'L' + pt([x - 2, y - 9]), OL, 2) + E(x - 26, y - 0.4, 1, 0.8, glw, 0, 0.9);
    return G(g, at(s, x, y));
  }
  function hydraNeck(c, pts, w0, w1, col, bel) {
    var T = taper(pts, w0, w1, 6), sp = '';
    for (var i = 3; i < T.s.length - 3; i += 3) { var p = T.b[i], q2 = T.b[i + 1], mx = (p[0] + q2[0]) / 2, my = (p[1] + q2[1]) / 2, dx = T.b[i][0] - T.a[i][0], dy = T.b[i][1] - T.a[i][1], d = Math.sqrt(dx * dx + dy * dy) || 1; sp += 'M' + pt(p) + 'L' + pt([mx + dx / d * 6, my + dy / d * 6]) + 'L' + pt(q2) + 'Z'; }
    return P(sp, c.cel('#4a2a6a'), 1.2) + body(c, T.d, col, F(ribbonBand(T, 0, 0.4), bel, 0.9) + L(bands(T, 2, 2), dk(col, 0.4), 1, 0.7) + F(ribbonBand(T, 0.72, 1), lt(col, 0.12), 0.6), 2.2);
  }

  function arm(c, pts, col, w, handCol) { return limb(pd(pts.slice(0, 2)), col, w) + limb(pd(pts.slice(1)), col, w - 1) + hand(pts[pts.length - 1], c.cel(handCol || col)); }
  function bigAxe(c, p, len, ang, edge) {
    var q = dirQ(p, ang), o = haft(c, p, len + 4, ang, '#3a2a2a', 4, 30);
    var bl = 'M' + pt(q(len - 16, -2)) + 'C' + pt(q(len - 24, -12)) + ' ' + pt(q(len - 26, -22)) + ' ' + pt(q(len - 22, -26)) + 'C' + pt(q(len - 8, -24)) + ' ' + pt(q(len + 6, -22)) + ' ' + pt(q(len + 10, -24)) + 'C' + pt(q(len + 8, -16)) + ' ' + pt(q(len + 4, -8)) + ' ' + pt(q(len + 2, -2)) + 'Z';
    o += P(bl, c.cel('#5a5a66'), 2) + L('M' + pt(q(len - 22, -25)) + 'C' + pt(q(len - 8, -23)) + ' ' + pt(q(len + 6, -21)) + ' ' + pt(q(len + 9, -23)), edge || FEL, 1.8) + C(q(len - 6, -23)[0], q(len - 6, -23)[1], 12, glow(c, edge || FEL, 0.45));
    o += P(pd([q(len - 6, 2), q(len - 4, 14), q(len + 2, 2)], true), c.cel('#4a4a56'), 1.4) + P(pd([q(len + 4, -3), q(len + 16, 0), q(len + 4, 3)], true), c.cel('#4a4a56'), 1.4);
    return o + R(q(len - 7, 0)[0] - 3.4, q(len - 7, 0)[1] - 3.4, 6.8, 6.8, c.cel('#2a2a32'), 1.2);
  }
  function fgHead(c, x, y) {
    var sk = '#8a3a2e', s = '';
    var hornF = taper([[x + 6, y - 10], [x + 14, y - 20], [x + 28, y - 25], [x + 40, y - 23]], 8, 1.5, 5), hornN = taper([[x - 2, y - 12], [x + 4, y - 24], [x + 18, y - 31], [x + 32, y - 32]], 9, 1.5, 5);
    s += body(c, hornF.d, '#3a2e2a', L(bands(hornF, 2, 2), '#1a1414', 1), 1.6);
    s += P('M' + pt([x + 6, y - 14]) + 'C' + pt([x + 16, y - 16]) + ' ' + pt([x + 22, y - 6]) + ' ' + pt([x + 30, y + 6]) + 'C' + pt([x + 22, y + 2]) + ' ' + pt([x + 16, y]) + ' ' + pt([x + 10, y - 2]) + 'Z', c.cel('#1a1418'), 1.6);
    var d = 'M' + pt([x - 9, y - 9]) + 'C' + pt([x - 8, y - 16]) + ' ' + pt([x + 9, y - 17]) + ' ' + pt([x + 11, y - 6]) + 'L' + pt([x + 12, y + 6]) + 'C' + pt([x + 10, y + 14]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 6, y + 15]) + 'C' + pt([x - 12, y + 13]) + ' ' + pt([x - 13, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'L' + pt([x - 15, y]) + 'L' + pt([x - 11, y - 3]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 3, y - 18], [x + 14, y - 18], [x + 14, y + 18], [x + 2, y + 18]], true), dk(sk, 0.25), 0.8) + F('M' + pt([x - 14, y - 6]) + 'L' + pt([x + 2, y - 8]) + 'L' + pt([x + 2, y - 4]) + 'L' + pt([x - 14, y - 2]) + 'Z', dk(sk, 0.35), 0.8), 2.2);
    s += P(pd([[x + 5, y - 3], [x + 18, y - 8], [x + 8, y + 4]], true), c.cel(sk), 1.4);
    s += gEye(c, x - 6, y - 3, 1.7, FEL) + L('M' + pt([x - 13, y - 6]) + 'L' + pt([x, y - 9]), OL, 2.6);
    s += L('M' + pt([x - 12, y + 7]) + 'L' + pt([x - 2, y + 7]), OL, 1.5) + P('M' + pt([x - 10, y + 8]) + 'C' + pt([x - 13, y + 2]) + ' ' + pt([x - 13, y - 2]) + ' ' + pt([x - 11, y - 4]) + 'C' + pt([x - 10, y]) + ' ' + pt([x - 8, y + 4]) + ' ' + pt([x - 7, y + 8]) + 'Z', c.cel('#f0e8d0'), 1) + P('M' + pt([x - 2, y + 8]) + 'C' + pt([x - 4, y + 3]) + ' ' + pt([x - 3, y]) + ' ' + pt([x - 1, y - 1]) + 'C' + pt([x, y + 3]) + ' ' + pt([x + 1, y + 5]) + ' ' + pt([x + 1, y + 8]) + 'Z', c.cel('#f0e8d0'), 1);
    s += body(c, hornN.d, '#4a3a34', L(bands(hornN, 2, 2), '#1a1414', 1) + F(ribbonBand(hornN, 0, 0.35), '#6a5a50', 0.8), 1.8);
    return s;
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    wrathtail_myrmidon: function (c) {
      return naga(c, {
        col: '#2a9a8a', belly: '#e0d8a8', fin: '#d8503a', belt: '#5a3a2a', eye: '#ffe040',
        pads: function (c) { return shellPad(c, 44, 50, 1, '#e8a87a'); },
        near: [[48, 54], [36, 64], [30, 70]], wNear: function (c, p) { return trident(c, p, 50, -PI / 2 - 0.1); },
        far: [[80, 54], [92, 64], [98, 76]]
      });
    },
    wrathtail_sea_witch: function (c) {
      var col = '#3a88b8';
      return naga(c, {
        col: col, face: lt(col, 0.18), belly: '#d8ecd8', fin: '#f07a8a', hair: '#123048', female: true, eye: '#aaffee', belt: '#2a4a6a', armW: 7.5, scale: 0.96, crown: coralCrown, neck: true,
        torsoD: 'M48,52 C52,46 74,46 80,52 L76,70 L72,86 L56,86 L52,70 Z',
        chest: function (c) { return shellPad(c, 58, 60, 0.62, '#f0b8a0') + shellPad(c, 70, 60, 0.58, '#e0a890') + L('M52,58 L76,58', OL, 1) + beadNecklace(64, 52, 9, ['#f07a8a', '#e8f0f0', '#6ae8e0']); },
        near: [[50, 54], [38, 48], [28, 40]], wNearFront: function (c, p) { return waterOrb(c, [p[0] - 4, p[1] - 10], 1.05); },
        far: [[78, 54], [90, 62], [96, 72]], wFar: function (c, p) { return C(p[0], p[1], 12, glow(c, '#6ae8e0', 0.6)); }
      });
    },
    ashenvale_bear: function (c) { return bear(c, { col: '#3e2c24', belly: '#5a4436', muzzle: '#9a806a', eye: '#e0a040', angry: true, fangs: true, seed: 5, tf: at(0.94, 64, 122) }); },
    ghostpaw_runner: function (c) { return wolf(c, { col: '#d0d4de', belly: '#f4f6fa', mane: '#a8b0c2', glow: '#bff4ff', aura: '#e0f4ff', tf: at(0.88, 64, 122), op: 0.88 }); },
    ghostpaw_alpha: function (c) { return wolf(c, { col: '#6e7a96', belly: '#a4aec4', mane: '#44506a', glow: '#6ae8ff', aura: '#5ad0ff', scars: '#d8f0ff', faceScar: true, snarl: true, spikes: true, stripes: '#8ae8ff', tf: at(1.02, 64, 122) }); },
    thistlefur_ursa: function (c) {
      return furbolg(c, {
        fur: '#8a5a34', muzzle: '#c8a078', paint: '#e8e0c8', seed: 7, loin: '#5a3a22', scale: 0.96,
        chest: function () { return L('M40,56 L82,90', OL, 5.4) + L('M40,56 L82,90', '#4a3020', 3.2) + C(52, 66, 2, '#ece4cc', 1) + C(62, 74, 2, '#ece4cc', 1); },
        front: function (c) { return thistle(c, 58, 90, 0.7); },
        near: [[48, 58], [36, 68], [24, 66]], wNear: function (c, p) { return club(c, p, 36, -PI / 2 - 0.3, '#6a4428', true); }
      });
    },
    thistlefur_shaman: function (c) {
      return furbolg(c, {
        fur: '#9a7e5e', muzzle: '#e8d4b0', seed: 9, feathers: ['#3a8ac8', '#c83a2a', '#e8c040'], loin: '#3a5a8a', eyeGlow: '#9aff6a', scale: 0.92,
        chest: function () { return beadNecklace(60, 56, 14, ['#e8e0c8', '#3a8ac8', '#c83a2a']); },
        near: [[44, 56], [34, 66], [28, 74]], wNear: function (c, p) { return totemStaff(c, [p[0] - 2, p[1] - 44], [p[0] + 2, p[1] + 46], '#7aff5a'); },
        far: [[84, 54], [96, 48], [102, 38]], wFar: function (c, p) { return orb(c, p[0] + 2, p[1] - 10, 5, '#7aff5a'); }
      });
    },
    ursal_the_mauler: function (c) {
      return furbolg(c, {
        fur: '#4a3424', muzzle: '#8a7058', seed: 11, eyeScar: true, roar: true, eyeGlow: '#ffb040', scale: 1.06, shadowR: 42, loin: '#2a1e14',
        headBack: function (c) { var a = 'M26,46 L22,26 L12,16 M23,32 L30,20 L32,10 M36,46 L40,28 L50,20 M40,34 L34,22'; return L(a, OL, 5.6) + L(a, '#ece4cc', 3.2); },
        headTop: function (c) { return P('M8,58 C8,44 22,38 34,40 C42,42 46,48 44,56 C38,52 30,50 22,52 C16,52 11,55 8,58 Z', c.cel('#ece4cc'), 2) + E(20, 50, 3, 2.4, OL) + E(32, 48, 3, 2.4, OL) + P('M10,56 L12,63 L15,56 L18,62 L21,55 Z', '#ece4cc', 1.1); },
        chest: function () { return L('M48,60 L60,74 M56,58 L68,72 M70,64 L78,78', '#d88a7a', 1.8) + boneRow(60, 54, 16); },
        near: [[48, 58], [34, 68], [22, 66]], wNear: function (c, p) { return club(c, p, 40, -PI / 2 - 0.32, '#5a3a24', true); }
      });
    },
    bleakheart_satyr: function (c) {
      return satyr(c, { skin: '#b0744e', fur: '#3a2420', hair: '#2a1a1a', horns: 'ram', hornCol: '#3a2a24', veins: '#7ae050', scale: 0.96, near: [[48, 54], [36, 48], [24, 42]], far: [[80, 54], [94, 56], [102, 46]] });
    },
    bleakheart_hellcaller: function (c) {
      return satyr(c, {
        skin: '#5a4a86', fur: '#1e1826', hair: '#141018', horns: 'swept', hornCol: '#d8c8a4', veins: '#6aff5a', armW: 8.5,
        back: function (c) { return C(60, 64, 60, glow(c, FEL, 0.3)); },
        chest: function (c) { return P('M78,48 L84,52 L56,86 L50,82 Z', c.cel('#2a1a2a'), 1.3) + C(66, 68, 2, FEL, 0.8) + C(60, 76, 1.6, FEL, 0.8); },
        front: function (c) { return body(c, 'M50,82 L80,82 L84,104 L76,100 L70,110 L64,100 L58,108 L54,100 L46,104 Z', '#2a1a2a', L('M52,86 L80,86', FEL, 1.2, 0.8), 1.8); },
        near: [[48, 54], [38, 64], [30, 70]], wNearFront: function (c, p) { return felFire(c, [p[0] - 2, p[1] - 8], 0.85); },
        far: [[80, 54], [92, 46], [98, 36]], wFar: function (c, p) { return felFire(c, [p[0], p[1] - 8], 0.7); }
      });
    },
    mannoroc_lasher: function (c) {
      var sk = '#b0302a', blk = '#221418', s = shadow(c, 64, 46);
      var T3 = taper([[88, 62], [104, 72], [114, 88], [112, 104], [102, 106]], 10, 2, 6);
      s += body(c, T3.d, dk(sk, 0.25), L(bands(T3, 3, 3), blk, 1.4, 0.85), 2);
      var T1 = taper([[84, 52], [98, 38], [106, 20], [98, 8], [88, 12], [90, 22]], 11, 2, 6);
      s += body(c, T1.d, dk(sk, 0.18), L(bands(T1, 3, 3), blk, 1.4, 0.85), 2);
      s += limb('M76,88 L86,100 L80,112 L82,116', '#1a1014', 13) + hoof(82, 121, '#0e0a0c');
      var bd = 'M34,58 C34,40 60,32 84,38 C100,42 104,60 96,76 L86,94 L50,94 C40,86 34,72 34,58 Z';
      s += body(c, bd, sk, F('M80,34 L110,34 L110,100 L84,100 C94,80 94,56 80,34 Z', dk(sk, 0.3), 0.8) + L('M46,62 Q54,68 62,62 M48,74 Q56,78 64,74 M52,84 Q58,86 64,84', dk(sk, 0.4), 1.4) + F('M44,60 C50,54 58,54 64,58 L66,94 L50,94 C44,86 42,72 44,60 Z', '#6a1a1a', 0.35), 2.4);
      s += body(c, 'M66,36 C86,30 104,42 100,62 C92,52 80,48 64,48 Z', blk, L('M72,40 L90,44', '#4a3a3a', 1.2), 2) + P('M58,38 L60,22 L67,35 L74,18 L79,34 L88,22 L88,40 Z', c.cel(blk), 1.8);
      s += limb('M58,88 L62,102 L54,112 L52,116', blk, 14) + hoof(52, 121, '#0e0a0c');
      s += body(c, 'M48,86 L88,86 L84,104 L72,98 L64,108 L56,98 L46,102 Z', '#2a1a1a', L('M50,90 L86,90', '#6a4a3a', 1.2), 1.8);
      // head: thrust forward and up, dark brow plate, huge upward tusks
      var hx = 0, hy = -3, hf = taper([[44, 34], [46, 22], [40, 14], [32, 14]], 7, 1.5, 5), hn = taper([[34, 34], [32, 22], [22, 14], [14, 18]], 8, 1.5, 5);
      s += body(c, 'M36,50 C40,40 54,38 62,44 L60,60 L40,62 Z', '#8a1e1e', null, 2);
      s += G(body(c, hf.d, '#b8a888', L(bands(hf, 2, 2), '#5a4a3a', 1), 1.6), 'translate(' + hx + ',' + hy + ')');
      var hd = body(c, 'M50,42 C48,30 32,28 22,34 L12,42 C8,46 10,54 16,56 L34,58 C44,58 52,52 50,42 Z', '#8a1e1e', F('M38,28 L56,28 L56,60 L42,60 C48,50 46,38 38,28 Z', '#5a1010', 0.7), 2.2);
      hd += body(c, 'M12,56 L40,56 C42,68 32,74 22,72 C14,70 10,62 12,56 Z', '#6a1616', L('M16,64 L34,66', '#3a0a0a', 1.2), 2);
      hd += P('M20,36 C28,28 42,28 50,38 L44,42 C38,36 28,36 22,42 Z', c.cel(blk), 1.6);
      hd += P('M16,58 C10,48 12,36 20,28 C20,38 20,48 22,58 Z', c.cel('#f0e8d0'), 1.4) + P('M32,59 C30,50 32,40 38,34 C37,42 37,50 38,59 Z', c.cel('#f0e8d0'), 1.4);
      hd += gEye(c, 26, 44, 2, '#ffcc30') + L('M18,40 L34,42', OL, 2.6) + E(10, 48, 1.3, 1, OL) + P('M18,57 L20,61 L22,57 Z M26,57.4 L28,61.6 L30,57.4 Z', '#f4ecd6', 0.8);
      s += G(hd, 'translate(' + hx + ',' + hy + ')') + G(body(c, hn.d, '#d0c0a0', L(bands(hn, 2, 2), '#5a4a3a', 1), 1.8), 'translate(' + hx + ',' + hy + ')');
      var T2 = taper([[46, 64], [32, 74], [22, 90], [22, 104], [32, 110], [40, 102]], 13, 2, 6);
      s += body(c, T2.d, sk, L(bands(T2, 3, 3), blk, 1.5, 0.85) + F(ribbonBand(T2, 0.7, 1), dk(sk, 0.3), 0.7), 2.2);
      return G(s, at(0.98, 64, 122));
    },
    felguard_sentry: function (c) {
      var sk = '#8a3a2e', ar = '#3a3a46';
      return biped(c, {
        skin: sk, shirt: ar, sleeve: sk, forearm: ar, pants: '#2a2228', boots: '#26222a', glove: ar, belt: '#1e1a1e', buckle: FEL, armW: 11, legW: 12, shadowR: 36, hipY: 88, neckCol: sk,
        torsoD: 'M38,50 C46,40 84,40 92,50 L86,70 L80,90 L48,90 L42,70 Z', hx: 56, hy: 32,
        back: function (c) { return body(c, 'M78,44 C92,38 104,48 100,60 L84,58 Z', ar, null, 2) + P('M94,42 L104,30 L100,46 Z', c.cel('#5a5a66'), 1.3); },
        chest: function (c) { return L('M42,62 L88,62 M44,74 L84,74', dk(ar, 0.4), 1.4) + P('M58,50 L72,50 L68,58 L65,70 L62,58 Z', c.cel('#26262e'), 1.3) + C(65, 56, 5, glow(c, FEL, 0.8)) + C(65, 56, 1.8, FELL); },
        front: function (c) { return body(c, 'M46,86 L82,86 L84,106 L66,110 L44,106 Z', ar, L('M64,86 L64,108 M46,96 L84,96', dk(ar, 0.4), 1.2) + L('M46,104 L66,108 L84,104', FEL, 1.2, 0.7), 1.8); },
        shins: function (c) { return P('M46,100 L58,100 L58,112 L46,112 Z', c.cel('#4a4a56'), 1.4) + P('M66,100 L78,100 L78,112 L66,112 Z', c.cel('#3e3e4a'), 1.4) + P('M50,100 L52,94 L55,100 Z', c.cel('#6a6a76'), 1); },
        pads: function (c) { return body(c, 'M28,52 C26,38 48,34 58,44 L56,58 C46,56 36,58 28,58 Z', '#4a4a56', L('M32,50 Q44,46 54,50', '#6a6a78', 1.2) + L('M32,55 Q44,51 54,55', FEL, 1, 0.7), 2) + P('M34,42 L28,26 L42,38 Z', c.cel('#5a5a66'), 1.3) + P('M44,38 L44,22 L52,36 Z', c.cel('#5a5a66'), 1.3); },
        head: function (c, x, y) { return fgHead(c, x, y); },
        near: [[48, 54], [42, 64], [40, 70]], wNear: function (c, p) { return bigAxe(c, p, 50, -PI / 2 - 0.16); },
        far: [[82, 54], [90, 68], [86, 82]],
        tf: at(1.0, 64, 122)
      });
    },
    sharptalon: function (c) { return hippogryph(c, { body: '#5a5aa8', head: '#e4e0f0', wing: '#4a4a9e', tip: '#2ea89a', screech: true, eye: '#ff9a30' }); },
    blackfathom_myrmidon: function (c) {
      var col = '#5a3a8a';
      return naga(c, {
        col: col, belly: '#c8b8d8', fin: '#3ad0c0', eye: '#6affe0', belt: '#2a2a3a',
        back2: function (c) { return arm(c, [[78, 70], [92, 78], [100, 88]], dk(col, 0.15), 7.5) + scimitar(c, [100, 88], 26, 0.3, '#a8b4bc'); },
        front: function (c) { return arm(c, [[52, 70], [40, 80], [30, 84]], col, 7.5) + scimitar(c, [30, 84], 28, PI + 0.3, '#b8c4cc', -1); },
        near: [[48, 54], [36, 46], [28, 38]], wNearFront: function (c, p) { return scimitar(c, p, 30, -PI / 2 - 0.5, '#b8c4cc'); },
        far: [[80, 54], [92, 44], [98, 32]], wFar: function (c, p) { return scimitar(c, p, 26, -PI / 2 + 0.3, '#98a4ac', -1); }
      });
    },
    twilight_acolyte: function (c) {
      var robe = '#3a2a5a', trim = '#8a8494';
      return human(c, {
        skin: '#d8a888', shirt: robe, sleeve: robe, pants: '#2a1e3e', boots: '#1e1624', glove: '#d8a888',
        head: function (c, x, y) { return cultHead(c, x, y, { hood: '#34264e', skin: '#d8a888', eye: '#c890ff' }); },
        chest: function (c) { return body(c, 'M46,50 L82,50 L78,62 L50,62 Z', '#5a5464', null, 1.4) + L(ellD(64, 72, 4.4, 4.4), '#0e0a12', 2.2) + L('M58,62 L54,88 M70,62 L74,88', trim, 1.6); },
        front: function (c) { return robeFront(c, robe, trim); },
        near: [[48, 54], [36, 62], [26, 64]], wNearFront: function (c, p) { return krisDagger(c, p, PI + 0.25, 22); },
        far: [[80, 54], [92, 62], [96, 72]], wFar: function (c, p) { return C(p[0], p[1], 10, glow(c, '#b070ff', 0.5)); },
        scale: 0.92
      });
    },
    aku_mai_snapjaw: function (c) { return turtle(c, { shell: '#3a5a5e', skin: '#6a7c70', spike: '#e8dcc0', rim: '#8a9a86', barnacles: '#c8c8b8', spikeLen: 15, eye: '#ffd040', tf: at(0.88, 64, 122) }); },
    ghamoo_ra: function (c) {
      return turtle(c, {
        shell: '#2e3e4e', skin: '#5a6a6a', tall: true, spikes: false, rim: '#6a7a70', barnacles: '#dcd8c8', moss: '#3a7a5a', wrinkles: true, beard: '#3a6a4a', eyeGlow: '#8ae8ff',
        coral: function (c) {
          var a = 'M56,40 L50,18 M52,26 L44,20 M52,24 L58,12 M94,40 L100,16 M98,24 L106,20 M99,20 L94,10 M76,34 L78,8 M77,20 L84,14';
          return L(a, OL, 6.4) + L(a, '#e86a7a', 4) + L(a, '#ff9aa8', 1.4, 0.7);
        },
        kelp: function (c) {
          var k = 'M36,98 Q34,106 38,112 M52,104 Q48,112 52,118 M100,104 Q104,112 100,118 M116,98 Q120,106 116,112';
          return L(k, OL, 4.6) + L(k, '#3a8a4a', 2.6);
        }
      });
    },
    lady_sarevess: function (c) {
      var col = '#4a4aa8';
      return naga(c, {
        col: col, face: lt(col, 0.2), belly: '#e0d0f0', fin: '#c040a0', hair: '#e0e4f4', female: true, eye: '#ff80e0', belt: '#b89030', armW: 7.5, scale: 1.04, crown: serpentCrown, neck: true, hy: 35,
        torsoD: 'M48,52 C52,46 74,46 80,52 L76,70 L72,86 L56,86 L52,70 Z',
        chest: function (c) { return body(c, 'M50,54 L78,54 L74,70 L54,70 Z', '#c8a040', L('M64,54 L64,70', '#8a6a20', 1.2), 1.6) + C(64, 60, 2.2, '#c040a0', 0.8); },
        pads: function (c) { return shellPad(c, 48, 52, 0.8, '#d8b048'); },
        near: [[50, 54], [38, 58], [26, 60]],
        wNearFront: function (c, p) {
          var bw = 'M' + pt([p[0] + 2, p[1] - 34]) + 'Q' + pt([p[0] - 16, p[1]]) + ' ' + pt([p[0] + 2, p[1] + 34]);
          return L('M' + pt([p[0] + 2, p[1] - 34]) + 'L' + pt([64, 60]) + 'L' + pt([p[0] + 2, p[1] + 34]), '#e8e4f0', 0.9) + L(bw, OL, 5.4) + L(bw, '#b8902a', 3.2) + L(bw, '#f0d070', 1, 0.7) +
            L('M64,60 L4,60', OL, 3) + L('M64,60 L4,60', '#c8b890', 1.4) + P('M0,60 L8,56 L7,60 L8,64 Z', c.cel('#d8dce8'), 1) + P('M60,60 L66,56 L64,60 L66,64 Z', '#c040a0', 0.8) + C(4, 60, 8, glow(c, '#ff80e0', 0.5));
        },
        far: [[80, 54], [72, 60], [64, 60]]
      });
    },
    gelihast: function (c) {
      var gold = '#e0b030';
      return murloc(c, {
        skin: '#3a4a7a', belly: '#aab8c4', fin: '#c8a030', eyeC: '#fff0b0', angry: true, scale: 1.1,
        marks: function () { return L('M64,50 L72,58 M70,46 L80,56 M76,68 L84,74', '#e8e0c8', 2); },
        back: function (c) { return body(c, 'M58,44 C76,40 96,56 98,80 C100,96 100,108 96,118 L90,110 L86,120 L80,112 L72,118 L70,100 Z', '#2a5a3a', L('M80,60 Q86,84 84,108 M90,66 Q94,88 92,110', '#1a3a26', 1.4), 2); },
        head: function (c) { return P('M34,44 L31,30 L38,36 L42,25 L46,35 L51,24 L54,35 L60,30 L59,42 Q46,38 34,44 Z', c.cel(gold), 1.8) + C(42, 38, 1.8, '#c02040', 0.8) + C(51, 36, 1.8, '#3ab0e0', 0.8) + L('M35,42 Q46,37 58,40', dk(gold, 0.35), 1.2); },
        fItem: function (c) {
          return limb('M30,122 L23,34', '#8a6a4a', 3.4) + P('M23,36 L17,28 L21,14 L27,26 L25,36 Z', c.cel('#ece4cc'), 1.6) + L('M22,18 L23,32', '#b8b0a0', 1) +
            L('M24,40 Q17,46 19,56 M25,42 Q31,48 29,58', OL, 3.4) + L('M24,40 Q17,46 19,56 M25,42 Q31,48 29,58', '#3a8a4a', 1.8) + skull(c, 24, 44, 0.55);
        }
      });
    },
    twilight_lord_kelris: function (c) {
      var robe = '#241a36', trim = '#9a5af0', sk = '#8a78b8';
      return human(c, {
        skin: sk, shirt: robe, sleeve: robe, pants: '#1a1428', boots: '#140e1e', glove: sk,
        head: function (c, x, y) { return neHead(c, x, y, { skin: sk, hairCol: '#2a5a5e', beard: '#2a5a5e', circlet: '#c8c8d8', eye: '#f0f4ff' }); },
        back: function (c) { return C(64, 64, 64, glow(c, '#9a40ff', 0.35)) + body(c, 'M72,44 C92,48 102,90 106,118 L80,118 Z', '#1a1228', L('M80,50 Q92,84 98,114', trim, 1.4, 0.8), 2); },
        chest: function (c) { return L('M58,48 L54,86 M70,48 L74,86', trim, 2) + P('M60,66 L68,66 L66,74 L62,74 Z', c.cel('#b070ff'), 1) + L(ellD(64, 56, 4, 4), '#0e0a12', 2); },
        front: function (c) { return robeFront(c, robe, trim); },
        pads: function (c) { return body(c, 'M32,52 C30,40 50,36 58,44 L56,58 C48,56 40,58 32,58 Z', '#2e2440', L('M36,50 Q46,46 54,50', trim, 1.2), 2) + P('M38,42 L32,28 L46,38 Z', c.cel('#4a3a5a'), 1.3); },
        near: [[48, 54], [36, 62], [26, 62]], wNearFront: function (c, p) { return shadowSwirl(c, [p[0] - 4, p[1] - 6], 1.15, '#a050f0'); },
        far: [[80, 54], [92, 44], [96, 32]], wFar: function (c, p) { return shadowSwirl(c, [p[0], p[1] - 8], 0.95, '#8a40e0'); },
        scale: 1.0
      });
    },
    aku_mai: function (c) {
      var sk = '#2a2838', bel = '#3e5a6e', s = C(64, 64, 64, glow(c, '#4ad8c8', 0.3));
      s += E(64, 116, 66, 12, c.rg([[0, '#1a3448'], [0.75, '#12263a', 0.9], [1, '#12263a', 0]])) + E(64, 114, 58, 8, '#16304a', 1.8) + L('M16,114 q12,-3 24,0 M84,112 q12,-3 24,0', '#6ab0d0', 1.2, 0.6);
      s += hydraNeck(c, [[94, 100], [106, 80], [108, 60], [100, 46]], 18, 12, dk(sk, 0.1), dk(bel, 0.15)) + hydraHead(c, 98, 42, 0.78, { col: dk(sk, 0.05) });
      s += body(c, 'M24,113 C26,90 48,78 72,78 C98,78 118,92 120,113 Z', sk, F('M84,76 L124,76 L124,116 L96,116 C104,98 98,84 84,76 Z', '#000', 0.35) + L('M40,100 Q60,92 80,98 M50,108 Q72,100 100,106', '#3a3a52', 1.4, 0.8), 2.4);
      s += P('M52,82 L56,70 L62,80 L70,66 L76,79 L86,68 L88,82 L98,76 L96,88 Z', c.cel('#4a2a6a'), 1.6);
      s += hydraNeck(c, [[74, 92], [72, 70], [64, 48], [56, 30]], 21, 13, sk, bel) + hydraHead(c, 54, 26, 0.95, { col: sk });
      s += hydraNeck(c, [[54, 102], [40, 90], [30, 74], [26, 60]], 19, 12, lt(sk, 0.05), bel) + hydraHead(c, 26, 56, 0.86, { col: lt(sk, 0.05) });
      s += L('M18,118 q14,5 30,1 M76,121 q16,2 34,-5', '#8ad0e8', 1.6, 0.8) + C(20, 116, 1.4, '#c8f0ff', 0, 0.8) + C(112, 114, 1.2, '#c8f0ff', 0, 0.8);
      return s;
    }
  };
  function boneRow(x, y, w) { var o = L('M' + (x - w) + ',' + y + ' Q' + x + ',' + (y + 10) + ' ' + (x + w) + ',' + y, '#c8c0b0', 1.2); for (var i = -2; i <= 2; i++) { var bx = x + i * w * 0.4, by = y + 5 - Math.abs(i) * 1.6; o += P('M' + n(bx - 1.6) + ',' + n(by) + ' L' + n(bx) + ',' + n(by + 7) + ' L' + n(bx + 1.6) + ',' + n(by) + ' Z', '#f0e8d4', 0.9); } return o; }

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#6a5a8a'), 2.5); }
  function phScene(c) { return avSky(c) + ground(c, 150, '#3e6a52', '#1e3a2a'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#6a5a8a"/></svg>'; }
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
