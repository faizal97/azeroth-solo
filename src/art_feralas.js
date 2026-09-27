/* art_feralas.js — Feralas zone art for Azeroth Solo (contested, levels 44-50: Feathermoon Stronghold, Camp Mojache,
 * the Frayfeather Highlands, Woodpaw Hills, the Gordunni Outpost, the Forgotten Coast, the Lower Wilds) plus the gate of
 * Maraudon in Desolace.
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Feralas keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_stranglethorn.js (itself after
 * art_wetlands.js / art_ashenvale.js). The redwoods, elven ruins, tauren camp, Desolace pieces and every mob rig
 * (hippogryph, gnoll, ogre, naga, wolf, treant, harpy, bear) are new here.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix fr<counter>_).
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
  function Ctx() { this.p = 'fr' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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

  // ============================================================
  //  SHARED JUNGLE-STYLE PIECES (copies of art_stranglethorn.js)
  // ============================================================
  var PINE = '#2e5a3a';
  var MOSS = '#5e8a36', MOSSD = '#3e6428', REED = '#8a9a4a', STONE = '#8a9686', MUDD = '#3e3428',
    TST = '#8c9a86', LEAF = '#4a8e3a', PALM = '#5c9c3c', TRUNK = '#8a6a44', SAND = '#dcc48c',
    ALLY = '#2a4a8a', GOLD = '#d8b040', HRED = '#a8241a', KGRN = '#2e4626', BONE = '#e0d6bc', BSRED = '#c8281e', VOO = '#7aff5a';
  function haze(c, y, h, op, col) { return mist(c, y, h, col || '#c8d0c8', op || 0.3, Math.round(y * 3)); }
  function svSky(c, top, mid, bot) { return sky(c, top || '#8ab69a', mid || '#cdd790', bot || '#f2dc8c'); }
  function bez(p0, p1, p2, p3, t) { var u = 1 - t; return [0, 1].map(function (a) { return u * u * u * p0[a] + 3 * u * u * t * p1[a] + 3 * u * t * t * p2[a] + t * t * t * p3[a]; }); }
  // almond leaf path from (x, y): side 1 = right-down, -1 = left-down, 0 = straight down
  function leafD(x, y, side, len) {
    var a = side ? (side > 0 ? 0.5 : PI - 0.5) : PI / 2, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, px = -Math.sin(a) * len * 0.35, py = Math.cos(a) * len * 0.35;
    return 'M' + pt([x, y]) + 'Q' + pt([(x + ex) / 2 + px, (y + ey) / 2 + py]) + ' ' + pt([ex, ey]) + 'Q' + pt([(x + ex) / 2 - px, (y + ey) / 2 - py]) + ' ' + pt([x, y]) + 'Z';
  }
  function starD(x, y, r, k) { var d = ''; for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * (k || 0.45) : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return d + 'Z'; }
  // humid golden light shafts falling through the canopy
  function shafts(c, seed, cnt, op, col, y1) {
    var r = rng(seed), o = ''; y1 = y1 || 200;
    for (var i = 0; i < cnt; i++) { var x = 10 + r() * 360, w = 10 + r() * 22, sk = 30 + r() * 30; o += F(pd([[x, -2], [x + w, -2], [x + w + sk, y1], [x + sk - w * 0.3, y1]], true), c.lg([[0, col || '#fff4c0', op || 0.3], [1, col || '#fff4c0', 0]])); }
    return o;
  }
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  // far jungle: a lumpy canopy silhouette with a few palms poking out (no outlines)
  function farJungle(seed, y, col, cnt, h0, h1, palms, x0, x1) {
    var part = x0 != null, a0 = part ? x0 : -20, a1 = part ? x1 : 420, r = rng(seed), o = part ? '' : R(-2, y - h0 * 0.5, 404, h0 * 0.5 + 10, col);
    for (var i = 0; i < cnt; i++) { var x = a0 + (a1 - a0) * (i + r() * 0.7) / cnt, h = h0 + r() * (h1 - h0), w = 12 + r() * 14; o += E(x, y - h * 0.62, w, h * 0.46, col) + E(x - w * 0.7, y - h * 0.42, w * 0.8, h * 0.34, col) + E(x + w * 0.8, y - h * 0.36, w * 0.7, h * 0.3, col); }
    for (var k = 0; k < (palms || 0); k++) {
      var px = a0 + 30 + r() * (a1 - a0 - 60), ph = h1 * (1.15 + r() * 0.5), lean = (r() - 0.5) * 18, tx = px + lean, ty = y - ph;
      o += L('M' + pt([px, y]) + 'Q' + pt([px + lean * 0.2, y - ph * 0.5]) + ' ' + pt([tx, ty]), col, 2.4);
      for (var f = 0; f < 6; f++) { var a = -PI + f * PI / 5 + (r() - 0.5) * 0.3, len = 14 + r() * 6; o += F(taper([[tx, ty], [tx + Math.cos(a) * len * 0.55, ty + Math.sin(a) * len * 0.4 - 3], [tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.3 + len * 0.35]], 5, 0.4, 4).d, col); }
    }
    return o;
  }
  // dark leafy canopy mass framing the top edge
  function canopyTop(c, seed, col, depth) {
    var r = rng(seed), d = depth || 22, o = ''; col = col || '#244a26';
    o += R(-2, -2, 404, d * 0.5, col);
    for (var i = 0; i < 12; i++) { var x = -10 + 420 * (i + r() * 0.6) / 12, ry = d * (0.5 + r() * 0.6); o += E(x, 0, 26 + r() * 14, ry, i % 2 ? col : lt(col, 0.06)); }
    for (var k = 0; k < 16; k++) o += F(leafD(r() * 400, d * (0.4 + r() * 0.7), k % 3 - 1, 8 + r() * 6), k % 2 ? lt(col, 0.14) : lt(col, 0.07));
    return o;
  }
  // hanging vines from the top edge, with leaves
  function vines(c, seed, cnt, x0, x1, l0, l1, col) {
    var r = rng(seed), d = '', lv = ''; col = col || '#4a7a2e';
    for (var i = 0; i < cnt; i++) {
      var x = x0 + (x1 - x0) * (i + r() * 0.8) / cnt, len = l0 + r() * (l1 - l0), sw = (r() - 0.5) * 16;
      var p0 = [x, -4], p1 = [x + sw, len * 0.35], p2 = [x - sw, len * 0.65], p3 = [x + sw * 0.4, len];
      d += 'M' + pt(p0) + 'C' + pt(p1) + ' ' + pt(p2) + ' ' + pt(p3);
      for (var k = 1; k < 6; k++) { var b = bez(p0, p1, p2, p3, k / 6); lv += leafD(b[0], b[1], k % 2 ? 1 : -1, 5 + r() * 2.5); }
      lv += leafD(p3[0], p3[1], 0, 6);
    }
    return L(d, OL, 3.4) + L(d, col, 1.6) + P(lv, c.cel(lt(col, 0.12)), 0.9);
  }
  // one drooping vine between two points
  function vineSwag(c, x0, y0, x1, y1, sag, col) {
    col = col || '#4a7a2e'; var p0 = [x0, y0], p3 = [x1, y1], p1 = [x0 + (x1 - x0) * 0.3, Math.max(y0, y1) + sag], p2 = [x0 + (x1 - x0) * 0.7, Math.max(y0, y1) + sag], lv = '';
    var d = 'M' + pt(p0) + 'C' + pt(p1) + ' ' + pt(p2) + ' ' + pt(p3);
    for (var k = 1; k < 8; k++) { var b = bez(p0, p1, p2, p3, k / 8); lv += leafD(b[0], b[1], k % 2 ? 1 : -1, 5.5); }
    return L(d, OL, 3.4) + L(d, col, 1.6) + P(lv, c.cel(lt(col, 0.12)), 0.9);
  }
  // outlined palm: curved ringed trunk, crown of serrated fronds, coconuts
  function palm(c, x, y, s, lean, col, seed) {
    col = col || PALM; lean = lean || 0;
    var r = rng(seed || Math.round(x * 3 + y)), h = 96 * s, tx = x + lean * s, ty = y - h;
    var T = taper([[x, y], [x + lean * 0.15 * s, y - h * 0.35], [x + lean * 0.6 * s, y - h * 0.75], [tx, ty]], 10 * s, 5 * s, 6);
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    var fr = function (a, len, cc) {
      var p1 = [tx + Math.cos(a) * len * 0.5, ty + Math.sin(a) * len * 0.5 - len * 0.12], p2 = [tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.5 + len * 0.3];
      var F1 = taper([[tx, ty], p1, p2], 11 * s, 1 * s, 5);
      return body(c, F1.d, cc, L(bands(F1, 1, 1), dk(cc, 0.38), 0.9 * s) + F(ribbonBand(F1, 0.55, 1), dk(cc, 0.2), 0.7), 1.3 * s) + L(along(F1, 0.5), lt(cc, 0.25), 0.8 * s, 0.8);
    };
    [-2.6, -1.6, -0.6].forEach(function (a) { o += fr(a + (r() - 0.5) * 0.2, (40 + r() * 8) * s, dk(col, 0.2)); });
    o += body(c, T.d, TRUNK, L(bands(T, 3, 2), dk(TRUNK, 0.4), 1.2 * s) + F(ribbonBand(T, 0.55, 1), dk(TRUNK, 0.3), 0.8), 1.6 * s);
    o += C(tx - 3 * s, ty + 4 * s, 3.4 * s, c.cel('#6a4a24'), 1.2 * s) + C(tx + 3 * s, ty + 5 * s, 3.4 * s, c.cel('#7a5428'), 1.2 * s) + C(tx, ty + 7 * s, 3.2 * s, c.cel('#5a3e20'), 1.2 * s);
    [-3.0, -2.1, -1.1, -0.2, 0.3].forEach(function (a) { o += fr(a + (r() - 0.5) * 0.2, (42 + r() * 10) * s, col); });
    return o;
  }
  // giant fern: a fan of arching serrated fronds
  function fern(c, x, y, s, col, seed) {
    col = col || LEAF; var r = rng(seed || Math.round(x * 5 + y * 7)), o = E(x, y + 1, 22 * s, 3.4 * s, '#000', 0, 0.22), fr = [];
    for (var i = 0; i < 7; i++) fr.push([-PI + 0.25 + i * (PI - 0.5) / 6 + (r() - 0.5) * 0.15, (26 + r() * 10) * s * (i === 0 || i === 6 ? 0.9 : 1)]);
    [0, 6, 1, 5, 2, 4, 3].forEach(function (k, j) {
      var a = fr[k][0], len = fr[k][1], cc = j < 2 ? dk(col, 0.18) : j < 4 ? col : lt(col, 0.07);
      var T = taper([[x, y], [x + Math.cos(a) * len * 0.45, y + Math.sin(a) * len * 0.8], [x + Math.cos(a) * len, y + Math.sin(a) * len * 0.55 + len * 0.3]], 8 * s, 0.6 * s, 5);
      o += body(c, T.d, cc, L(bands(T, 1, 1), dk(cc, 0.4), 0.8 * s), 1.2 * s) + L(along(T, 0.5), lt(cc, 0.3), 0.7 * s, 0.8);
    });
    return o;
  }
  // broad banana / elephant-ear leaf growing from (x, y) along ang
  function bigLeaf(c, x, y, s, ang, col) {
    col = col || LEAF; var q = dirQ([x, y], ang), Ln = 44 * s, Wd = 15 * s;
    var d = 'M' + pt(q(6 * s, 0)) + 'C' + pt(q(Ln * 0.3, -Wd)) + ' ' + pt(q(Ln * 0.85, -Wd * 0.9)) + ' ' + pt(q(Ln, 0)) + 'C' + pt(q(Ln * 0.85, Wd * 0.9)) + ' ' + pt(q(Ln * 0.3, Wd)) + ' ' + pt(q(6 * s, 0)) + 'Z';
    var v = '';
    for (var i = 1; i < 6; i++) { var u = Ln * (0.12 + i * 0.13), k = Wd * 0.75 * (1 - i * 0.1); v += 'M' + pt(q(u, 0)) + 'L' + pt(q(u + 8 * s, -k)) + 'M' + pt(q(u, 0)) + 'L' + pt(q(u + 8 * s, k)); }
    var half = pd([q(4 * s, 0), q(Ln + 2, 0), q(Ln, Wd * 1.2), q(4 * s, Wd * 1.2)], true);
    return limb('M' + pt([x, y]) + 'L' + pt(q(8 * s, 0)), dk(col, 0.2), 2.4 * s) + body(c, d, col, F(half, dk(col, 0.22), 0.8) + L(v, dk(col, 0.35), 0.9 * s), 1.5 * s) + L('M' + pt(q(7 * s, 0)) + 'L' + pt(q(Ln * 0.92, 0)), lt(col, 0.3), 1.1 * s, 0.85);
  }
  function leafClump(c, x, y, s, col, flip) {
    var k = flip ? -1 : 1;
    return bigLeaf(c, x, y, s, -PI / 2 - 0.9 * k, dk(col || LEAF, 0.12)) + bigLeaf(c, x, y, s * 1.1, -PI / 2 - 0.25 * k, col) + bigLeaf(c, x, y, s * 0.9, -PI / 2 + 0.5 * k, lt(col || LEAF, 0.06));
  }
  // jungle floor with a lit top edge and leaf litter
  function floor(c, y, top, bot, seed) {
    var r = rng(seed || 4), o = body(c, 'M-4,' + n(y) + ' C80,' + n(y - 4) + ' 160,' + n(y + 3) + ' 240,' + n(y - 2) + ' C300,' + n(y - 6) + ' 360,' + n(y + 2) + ' 404,' + n(y - 3) + ' L404,242 L-4,242 Z', top,
      R(-4, y - 8, 408, 250 - y, c.lg([[0, lt(top, 0.12), 0.4], [1, bot, 0.9]])), 1.8), lv = '';
    for (var i = 0; i < 26; i++) { var yy = y + 6 + r() * (236 - y), sz = 2 + (yy - y) / (240 - y) * 4; lv += 'M' + pt([r() * 400, yy]) + 'l' + n(sz) + ',' + n(-sz * 0.4) + 'l' + n(sz * 0.6) + ',' + n(sz * 0.7) + 'Z'; }
    return o + F(lv, dk(top, 0.25), 0.7);
  }
  function lily(c, x, y, r, flower) {
    var d = 'M' + pt([x, y]) + 'L' + pt([x + r * 0.9, y - r * 0.2]) + 'A' + n(r) + ',' + n(r * 0.4) + ' 0 1,1 ' + pt([x + r * 0.9, y + r * 0.12]) + 'Z';
    return P(d, c.cel('#5a9a3a'), 1.1) + (flower ? C(x - r * 0.2, y - r * 0.2, r * 0.3, '#f4b8d0', 0.9) + C(x - r * 0.2, y - r * 0.25, r * 0.12, '#ffe070') : '');
  }
  // crocodile lurking at the surface, head to the left (y = water line)
  function croc(c, x, y, s, col) {
    col = col || '#4e6a34'; s = s || 1; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x + 8 * s, y + 1, 44 * s, 3.4 * s, '#14261e', 0, 0.35);
    o += P(pd([q(-6, 0), q(0, -4), q(14, -5), q(30, -4), q(44, -1.5), q(52, 0)], true), c.cel(col), 1.4 * s);
    for (var i = 0; i < 6; i++) o += P(pd([q(3 + i * 7, -3.8), q(6 + i * 7, -8), q(9 + i * 7, -4)], true), c.cel(dk(col, 0.18)), 1 * s);
    o += P('M' + pt(q(-2, 0)) + 'L' + pt(q(-30, 0)) + 'C' + pt(q(-35, 0)) + ' ' + pt(q(-35, -4.6)) + ' ' + pt(q(-30, -5)) + 'L' + pt(q(-13, -5.4)) + 'C' + pt(q(-9, -10)) + ' ' + pt(q(-2, -10)) + ' ' + pt(q(1, -4)) + 'Z', c.cel(col), 1.5 * s);
    o += E(x - 7 * s, y - 8 * s, 2.6 * s, 2 * s, '#e8c840', 1 * s) + E(x - 7.3 * s, y - 8 * s, 0.6 * s, 1.6 * s, OL) + C(x - 31 * s, y - 5 * s, 1.3 * s, dk(col, 0.4));
    o += L('M' + pt(q(-29, -1.6)) + 'L' + pt(q(-9, -1.6)), OL, 1 * s) + F(pd([q(-26, -1.6), q(-25, 0.6), q(-24, -1.6)], true) + pd([q(-20, -1.6), q(-19, 0.6), q(-18, -1.6)], true) + pd([q(-14, -1.6), q(-13, 0.6), q(-12, -1.6)], true), '#f4ecd6');
    return o + L('M' + pt(q(-44, 2)) + 'q' + n(8 * s) + ',' + n(-3 * s) + ' ' + n(16 * s) + ',0M' + pt(q(46, 3)) + 'q' + n(8 * s) + ',' + n(-3 * s) + ' ' + n(16 * s) + ',0', '#e0f0e8', 1.1 * s, 0.7);
  }
  // ---- troll ruins ----
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
  // ---- camps ----
  // canvas ridge tent seen from the front-left (x = front pole, y = ground)
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
  // cooking spit over a fire
  function spit(c, x, y, s) {
    return campfire(c, x, y, s) + limb('M' + pt([x - 18 * s, y + 2]) + 'L' + pt([x - 16 * s, y - 24 * s]) + 'M' + pt([x + 18 * s, y + 2]) + 'L' + pt([x + 16 * s, y - 24 * s]), '#5a3e24', 2.2 * s) + limb('M' + pt([x - 20 * s, y - 22 * s]) + 'L' + pt([x + 20 * s, y - 22 * s]), '#6a4a2a', 1.8 * s) +
      E(x, y - 22 * s, 9 * s, 5 * s, c.cel('#a8502a'), 1.4 * s) + E(x - 2 * s, y - 24 * s, 4 * s, 1.6 * s, '#e8a060', 0, 0.8);
  }
  // ---- night ----
  function moon(c, x, y, r) { return C(x, y, r * 4, glow(c, '#dfe8ff', 0.4)) + C(x, y, r, '#eef2fa') + C(x - r * 0.3, y - r * 0.2, r * 0.25, '#d0d8e8') + C(x + r * 0.35, y + r * 0.3, r * 0.18, '#d0d8e8') + C(x + r * 0.1, y - r * 0.5, r * 0.12, '#d8e0ee'); }
  function stars(seed, cnt, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(r() * 400, r() * (y1 || 100), 0.5 + r() * 0.8, '#f0f4ff', 0, 0.4 + r() * 0.5); return o; }
  function eyePair(c, x, y, s, col) { col = col || VOO; return C(x, y, 7 * s, glow(c, col, 0.55)) + F(pd([[x - 5 * s, y], [x - 2.5 * s, y - 1.4 * s], [x - 1 * s, y + 0.6 * s]], true) + pd([[x + 5 * s, y], [x + 2.5 * s, y - 1.4 * s], [x + 1 * s, y + 0.6 * s]], true), col); }
  function fireflies(seed, cnt, x0, x1, y0, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); o += C(x, y, 3, '#d8ff8a', 0, 0.18) + C(x, y, 0.9, '#f0ffc0', 0, 0.9); } return o; }
  // irregular spot blobs for mottled hides, as a mark hook
  function mottle(seed, cnt, x0, y0, x1, y1, dark, light, r0, r1) {
    return function () {
      var r = rng(seed), o = '';
      for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (r0 || 1.6) + r() * ((r1 || 3.4) - (r0 || 1.6)); o += F(shag(x, y, rr * 1.2, rr, 5, 0.3, seed + i * 7), i % 3 === 2 ? light : dark, 0.85); }
      return o;
    };
  }

  // ============================================================
  //  FERALAS PIECES
  // ============================================================
  var BARK = '#8e4a30', FERN = '#4e8a36', FOL = '#3a6a2e', MISTC = '#dfe6c8', ELF = '#9284b4', MOONC = '#e6eeff', NELF = '#4a3a8e', NTRIM = '#c8c0f0',
    HIDE = '#c09060', TAUR = '#b0402a', TTEAL = '#3a8a8a', DES = '#8e887e', MARA = '#b45aff', COR = '#e0707a', NST = '#6e8e8a', OGR = '#9a3a24';
  function frSky(c, top, mid, bot) { return sky(c, top || '#9cbaa0', mid || '#d8dcae', bot || '#f0e2aa'); }
  function rain(seed, cnt, col, op, y0, y1) { var r = rng(seed), d = ''; y0 = y0 || 0; y1 = y1 || 240; for (var i = 0; i < cnt; i++) { var x = r() * 440 - 20, y = y0 + r() * (y1 - y0), l = 6 + r() * 9; d += 'M' + pt([x, y]) + 'l' + n(-l * 0.28) + ',' + n(l); } return L(d, col || '#e8eef4', 0.8, op || 0.5); }
  // crescent, horns up
  function crescentD(x, y, r) { return 'M' + pt([x - r, y - r * 0.25]) + 'A' + n(r) + ',' + n(r) + ' 0 0,0 ' + pt([x + r, y - r * 0.25]) + 'A' + n(r * 0.86) + ',' + n(r * 0.62) + ' 0 0,1 ' + pt([x - r, y - r * 0.25]) + 'Z'; }
  function moonMark(x, y, s) { return F(crescentD(x, y + 3 * s, 6 * s), MOONC) + C(x, y - 3.5 * s, 1.6 * s, MOONC); }
  // giant redwood trunk running off the top edge: flared buttress roots, fluted bark, a lit edge (x = centre, y = ground)
  function redwood(c, x, y, w, col, seed, top) {
    col = col || BARK; var r = rng(seed || Math.round(x * 7 + 3)), hw = w / 2, tw = hw * 0.8, ty = top == null ? -6 : top;
    var d = 'M' + pt([x - hw * 1.9, y + 3]) + 'C' + pt([x - hw * 1.1, y]) + ' ' + pt([x - hw * 1.02, y - w * 0.3]) + ' ' + pt([x - hw, y - w * 0.8]) + 'L' + pt([x - tw, ty]) + 'L' + pt([x + tw, ty]) + 'L' + pt([x + hw, y - w * 0.8]) + 'C' + pt([x + hw * 1.02, y - w * 0.3]) + ' ' + pt([x + hw * 1.1, y]) + ' ' + pt([x + hw * 1.9, y + 3]) + 'Z';
    var gr = '', k = Math.max(3, Math.round(w / 7));
    for (var i = 1; i < k; i++) {
      var f = -1 + 2 * i / k, g = 'M' + pt([x + f * hw * 1.5, y + 2]);
      for (var yy = y - 8; yy > ty - 8; yy -= 14) { var half = tw + (hw - tw) * Math.max(0, (yy - ty) / (y - ty)); g += 'L' + pt([x + f * half * 0.92 + (r() - 0.5) * 2.2, yy]); }
      gr += g;
    }
    var shade = F(pd([[x + hw * 0.2, ty - 2], [x + tw + 4, ty - 2], [x + hw + 4, y - w * 0.8], [x + hw * 2, y + 5], [x + hw * 0.4, y + 5]], true), dk(col, 0.36), 0.8);
    var lit = L('M' + pt([x - hw * 0.72, y - 6]) + 'L' + pt([x - tw * 0.72, ty]), lt(col, 0.32), Math.max(1.2, w * 0.06), 0.75);
    var knot = r() < 0.7 ? E(x - hw * 0.2, y - w * 1.6 - r() * 30, w * 0.08 + 1, w * 0.12 + 1.5, dk(col, 0.45), 0, 0.9) : '';
    return E(x, y + 3, hw * 2.3, 4 + w * 0.06, '#000', 0, 0.28) + body(c, d, col, L(gr, dk(col, 0.42), Math.max(1, w * 0.04), 0.9) + shade + lit + knot, 2);
  }
  // misty silhouette trunks for the far forest (no outline)
  function farTrunks(seed, y, col, cnt, w0, w1, x0, x1) {
    var r = rng(seed), d = ''; x0 = x0 == null ? -10 : x0; x1 = x1 == null ? 410 : x1;
    for (var i = 0; i < cnt; i++) { var x = x0 + (x1 - x0) * (i + 0.2 + r() * 0.6) / cnt, w = w0 + r() * (w1 - w0); d += pd([[x - w * 0.95, y + 3], [x - w / 2, y - w * 0.7], [x - w * 0.4, -4], [x + w * 0.4, -4], [x + w / 2, y - w * 0.7], [x + w * 0.95, y + 3]], true); }
    return F(d, col);
  }
  // high green-gold foliage clouds between the trunks (no outline)
  function crowns(seed, cnt, y0, y1, col, hi) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = r() * 420 - 10, y = y0 + r() * (y1 - y0), w = 24 + r() * 26; o += F(shag(x, y, w, w * 0.45, 7, 0.22, seed + i), col) + (hi ? F(shag(x - w * 0.2, y - w * 0.12, w * 0.55, w * 0.22, 6, 0.25, seed + i + 50), hi, 0.8) : ''); }
    return o;
  }
  function mushroom(c, x, y, s, col) {
    col = col || '#d8a050';
    return limb('M' + pt([x, y]) + 'L' + pt([x - 0.5 * s, y - 6 * s]), '#efe4c8', 2.2 * s) + P('M' + pt([x - 6 * s, y - 5 * s]) + 'C' + pt([x - 6 * s, y - 11 * s]) + ' ' + pt([x + 6 * s, y - 11 * s]) + ' ' + pt([x + 6 * s, y - 5 * s]) + 'Z', c.cel(col), 1.2 * s) + C(x - 2 * s, y - 8 * s, 0.9 * s, '#fff4d8') + C(x + 2.4 * s, y - 7 * s, 0.7 * s, '#fff4d8');
  }
  function roots(c, x, y, s, col) {
    col = col || BARK; var d = 'M' + pt([x - 30 * s, y + 2]) + 'C' + pt([x - 20 * s, y - 8 * s]) + ' ' + pt([x - 6 * s, y - 10 * s]) + ' ' + pt([x + 4 * s, y - 6 * s]) + 'C' + pt([x + 14 * s, y - 10 * s]) + ' ' + pt([x + 26 * s, y - 6 * s]) + ' ' + pt([x + 34 * s, y + 2]) + 'Z';
    return body(c, d, col, F(pd([[x + 4 * s, y - 12 * s], [x + 36 * s, y - 12 * s], [x + 36 * s, y + 4], [x + 8 * s, y + 4]], true), dk(col, 0.3), 0.8) + L('M' + pt([x - 20 * s, y - 4 * s]) + 'Q' + pt([x - 8 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 4 * s]), lt(col, 0.25), 1.2 * s, 0.8), 1.6 * s);
  }
  // ---- night-elf stone ----
  // column: tapering fluted shaft, curled leaf capital, crescent finial; broken ones end in a jag with moss (x = centre, y = base)
  function elfColumn(c, x, y, w, h, col, seed, broken) {
    col = col || ELF; var hw = w / 2, top = y - h, o = E(x, y + 2, w * 1.1, 3.4, '#000', 0, 0.25);
    o += body(c, pd([[x - hw * 1.35, y], [x - hw * 1.35, y - 6], [x + hw * 1.35, y - 6], [x + hw * 1.35, y]], true), lt(col, 0.04), F(pd([[x + hw * 0.3, y - 8], [x + hw * 1.5, y - 8], [x + hw * 1.5, y + 2], [x + hw * 0.3, y + 2]], true), dk(col, 0.28), 0.8), 1.6);
    var sh = broken ? pd([[x - hw, y - 6], [x - hw * 0.84, top + 10], [x - hw * 0.4, top + 3], [x - hw * 0.05, top + 11], [x + hw * 0.4, top], [x + hw * 0.84, top + 7], [x + hw, y - 6]], true) : pd([[x - hw, y - 6], [x - hw * 0.84, top + 8], [x + hw * 0.84, top + 8], [x + hw, y - 6]], true);
    var fl = ''; for (var i = -1; i <= 1; i++) fl += 'M' + pt([x + i * hw * 0.5, y - 7]) + 'L' + pt([x + i * hw * 0.42, top + 10]);
    o += body(c, sh, col, L(fl, dk(col, 0.3), 1.1) + F(pd([[x + hw * 0.3, top - 4], [x + hw + 2, top - 4], [x + hw + 2, y], [x + hw * 0.36, y]], true), dk(col, 0.3), 0.8) + L('M' + pt([x - hw * 0.72, y - 8]) + 'L' + pt([x - hw * 0.62, top + 10]), lt(col, 0.3), 1.2, 0.7), 1.6);
    if (!broken) {
      o += P('M' + pt([x - hw * 0.9, top + 9]) + 'C' + pt([x - hw * 2, top + 7]) + ' ' + pt([x - hw * 2.3, top - 3]) + ' ' + pt([x - hw * 1.5, top - 6]) + 'C' + pt([x - hw * 1.3, top - 1]) + ' ' + pt([x - hw * 0.6, top]) + ' ' + pt([x, top + 2]) + 'C' + pt([x + hw * 0.6, top]) + ' ' + pt([x + hw * 1.3, top - 1]) + ' ' + pt([x + hw * 1.5, top - 6]) + 'C' + pt([x + hw * 2.3, top - 3]) + ' ' + pt([x + hw * 2, top + 7]) + ' ' + pt([x + hw * 0.9, top + 9]) + 'Z', c.cel(lt(col, 0.1)), 1.5);
      o += P(crescentD(x, top - 5, Math.max(4, hw * 0.9)), c.cel('#d8d4f0'), 1.2);
    } else o += mossTop(x - hw * 0.8, x + hw * 0.8, top + 10, seed, '#5e8a3e');
    return o;
  }
  // pointed moon-arch between two columns; broken arches lose their right half
  function elfArch(c, x, y, w, h, col, seed, broken) {
    col = col || ELF; var hw = w / 2, top = y - h, o = '';
    var pts = [[x - hw, top + 6], [x - hw * 0.62, top - h * 0.3], [x, top - h * 0.46], [x + hw * 0.62, top - h * 0.3], [x + hw, top + 6]];
    var T = taper(broken ? pts.slice(0, 3).concat([[x + hw * 0.18, top - h * 0.36]]) : pts, 11, 9, 6);
    o += body(c, T.d, lt(col, 0.05), F(ribbonBand(T, 0.6, 1), dk(col, 0.25), 0.8) + L(bands(T, 4, 3), dk(col, 0.3), 1), 1.6);
    if (!broken) o += P(crescentD(x, top - h * 0.46 - 8, 6), c.cel('#d8d4f0'), 1.2);
    o += elfColumn(c, x - hw, y, 12, h, col, seed) + elfColumn(c, x + hw, y, 12, broken ? h * 0.6 : h, col, (seed || 1) + 1, broken);
    return o;
  }
  // tall night-elf tower: tapering walls, glowing arched windows, a sweeping leaf roof and crescent spire (x = centre, y = base)
  function elfTower(c, x, y, w, h, col, roof) {
    col = col || ELF; roof = roof || '#4e3e86'; var hw = w / 2, top = y - h, o = E(x, y + 2, w * 0.8, 4, '#000', 0, 0.25);
    var d = pd([[x - hw, y], [x - hw * 0.82, top], [x + hw * 0.82, top], [x + hw, y]], true);
    o += body(c, d, col, F(pd([[x + hw * 0.2, top - 2], [x + hw + 2, top - 2], [x + hw + 2, y + 2], [x + hw * 0.3, y + 2]], true), dk(col, 0.28), 0.8) + L('M' + pt([x - hw * 0.5, y]) + 'L' + pt([x - hw * 0.4, top]) + 'M' + pt([x + hw * 0.5, y]) + 'L' + pt([x + hw * 0.4, top]), dk(col, 0.2), 1, 0.8) + L('M' + pt([x - hw, top + h * 0.34]) + 'L' + pt([x + hw, top + h * 0.34]) + 'M' + pt([x - hw, top + h * 0.7]) + 'L' + pt([x + hw, top + h * 0.7]), dk(col, 0.3), 1.4), 1.8);
    [[0.2, 0.36], [0.55, 0.3]].forEach(function (wv) { var wy = top + h * wv[0] + 12, ww = w * wv[1] * 0.5; o += C(x, wy - 6, ww * 3, glow(c, '#d8d0ff', 0.45)) + archWin(x, wy, ww, 14, '#e4dcff', 1.2) + L('M' + pt([x, wy]) + 'L' + pt([x, wy - 10]), '#8a7ac8', 0.9); });
    var rw = hw * 1.5, rh = w * 1.3;
    o += P('M' + pt([x - rw, top + 5]) + 'C' + pt([x - rw * 0.7, top - 4]) + ' ' + pt([x - rw * 0.3, top - rh * 0.4]) + ' ' + pt([x, top - rh]) + 'C' + pt([x + rw * 0.3, top - rh * 0.4]) + ' ' + pt([x + rw * 0.7, top - 4]) + ' ' + pt([x + rw, top + 5]) + 'C' + pt([x + rw * 0.5, top]) + ' ' + pt([x - rw * 0.5, top]) + ' ' + pt([x - rw, top + 5]) + 'Z', c.cel(roof), 1.8);
    o += F('M' + pt([x, top - rh]) + 'C' + pt([x + rw * 0.3, top - rh * 0.4]) + ' ' + pt([x + rw * 0.7, top - 4]) + ' ' + pt([x + rw, top + 5]) + 'C' + pt([x + rw * 0.6, top + 1]) + ' ' + pt([x + rw * 0.2, top]) + ' ' + pt([x + 1, top]) + 'Z', dk(roof, 0.3), 0.8) + L('M' + pt([x - rw * 0.55, top + 1]) + 'C' + pt([x - rw * 0.3, top - rh * 0.3]) + ' ' + pt([x - 3, top - rh * 0.7]) + ' ' + pt([x - 1, top - rh + 4]), lt(roof, 0.3), 1.1, 0.8);
    return o + limb('M' + pt([x, top - rh]) + 'L' + pt([x, top - rh - 8]), '#b8b0d8', 1.6) + P(crescentD(x, top - rh - 10, 5), c.cel('#e0dcf8'), 1.1);
  }
  // smooth wall with leaf-shaped merlons (x0..x1 at ground y)
  function elfWall(c, x0, x1, y, h, col) {
    col = col || ELF; var o = body(c, pd([[x0, y], [x0, y - h], [x1, y - h], [x1, y]], true), col, L('M' + pt([x0, y - h * 0.5]) + 'L' + pt([x1, y - h * 0.5]), dk(col, 0.25), 1.2) + F(pd([[x0, y - h * 0.18], [x1, y - h * 0.18], [x1, y + 2], [x0, y + 2]], true), dk(col, 0.2), 0.7), 1.8), m = '';
    for (var x = x0 + 4; x < x1 - 6; x += 14) m += 'M' + pt([x, y - h + 1]) + 'C' + pt([x, y - h - 5]) + ' ' + pt([x + 3, y - h - 8]) + ' ' + pt([x + 5, y - h - 11]) + 'C' + pt([x + 7, y - h - 8]) + ' ' + pt([x + 10, y - h - 5]) + ' ' + pt([x + 10, y - h + 1]) + 'Z';
    return P(m, c.cel(lt(col, 0.08)), 1.3) + o;
  }
  // long violet banner hanging from a wall top, with a crescent (x = centre, y = top)
  function elfBanner(c, x, y, w, h) {
    var d = pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x, y + h + w * 0.6], [x - w / 2, y + h]], true);
    return body(c, d, NELF, L(pd([[x - w / 2 + 2, y + 2], [x - w / 2 + 2, y + h]]) + pd([[x + w / 2 - 2, y + 2], [x + w / 2 - 2, y + h]]), NTRIM, 1.2) + F(pd([[x + w * 0.1, y], [x + w / 2 + 1, y], [x + w / 2 + 1, y + h + w], [x + w * 0.1, y + h + w]], true), '#000', 0.25), 1.4) + moonMark(x, y + h * 0.4, w / 14) + R(x - w / 2 - 2, y - 2, w + 4, 3.4, c.cel('#c8c0e8'), 1);
  }
  // curved night-elf lamp post with a hanging moon-lantern (x = foot, y = ground)
  function moonLamp(c, x, y, s) {
    var d = 'M' + pt([x, y]) + 'C' + pt([x - 1 * s, y - 30 * s]) + ' ' + pt([x + 2 * s, y - 46 * s]) + ' ' + pt([x - 10 * s, y - 52 * s]) + 'C' + pt([x - 16 * s, y - 54 * s]) + ' ' + pt([x - 20 * s, y - 48 * s]) + ' ' + pt([x - 18 * s, y - 44 * s]);
    var lx = x - 18 * s, ly = y - 36 * s;
    return E(x, y + 1, 7 * s, 2 * s, '#000', 0, 0.3) + C(lx, ly, 22 * s, glow(c, '#cfd8ff', 0.6)) + limb(d, '#8a7ab0', 2.4 * s) + L('M' + pt([lx, ly - 8 * s]) + 'L' + pt([lx, ly - 5 * s]), OL, 1 * s) + P(pd([[lx - 4.6 * s, ly - 3 * s], [lx, ly - 7 * s], [lx + 4.6 * s, ly - 3 * s], [lx + 3.4 * s, ly + 5 * s], [lx, ly + 8 * s], [lx - 3.4 * s, ly + 5 * s]], true), '#eef2ff', 1.1 * s) + C(lx, ly + 1 * s, 2 * s, '#ffffff') + P(pd([[lx - 5.6 * s, ly - 3 * s], [lx, ly - 8 * s], [lx + 5.6 * s, ly - 3 * s]], true), c.cel('#8a7ab0'), 1 * s);
  }
  // ---- tauren camp ----
  // tall hide tent on long crossed poles with painted bands (x = centre, y = ground)
  function tTent(c, x, y, s, hide, paint) {
    hide = hide || HIDE; paint = paint || TAUR; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 40 * s, 5 * s, '#000', 0, 0.26);
    var hwAt = function (v) { return 5 + 29 * (v + 52) / 52; };
    o += limb(pd([q(-4, -48), q(-14, -68)]) + pd([q(4, -48), q(12, -70)]) + pd([q(0, -48), q(-1, -72)]), '#6a4a2a', 1.9 * s);
    var d = 'M' + pt(q(-34, 0)) + 'L' + pt(q(-5, -52)) + 'L' + pt(q(5, -52)) + 'L' + pt(q(34, 0)) + 'C' + pt(q(20, 4)) + ' ' + pt(q(-20, 4)) + ' ' + pt(q(-34, 0)) + 'Z';
    var band = function (v0, v1, col) { return F(pd([q(-hwAt(v0), v0), q(hwAt(v0), v0), q(hwAt(v1), v1), q(-hwAt(v1), v1)], true), col); };
    var zz = 'M' + pt(q(-hwAt(-30), -30)); for (var i = 1; i <= 8; i++) { var u = -hwAt(-30) + i * 2 * hwAt(-30) / 8; zz += 'L' + pt(q(u, i % 2 ? -34 : -30)); }
    o += body(c, d, hide, band(-14, -20, paint) + band(-36, -39, TTEAL) + L(zz, '#f0e4c8', 1.6 * s) + L('M' + pt(q(-12, -2)) + 'L' + pt(q(-2, -50)) + 'M' + pt(q(14, -1)) + 'L' + pt(q(3, -50)), dk(hide, 0.3), 0.9 * s) +
      F(pd([q(6, -54), q(40, -54), q(40, 6), q(14, 6)], true), dk(hide, 0.25), 0.75), 1.8 * s);
    o += P(pd([q(-10, 1), q(-2, -24), q(4, 1.5)], true), '#2a1a10', 1.2 * s) + P(pd([q(-2, -24), q(4, 1.5), q(12, 0)], true), c.cel(lt(hide, 0.12)), 1.1 * s);
    return o;
  }
  // carved totem: bull face, a painted eye block and spread wings at the top (x = foot, y = ground)
  function tTotem(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#8a5a36', o = E(x, y + 2, 12 * s, 3 * s, '#000', 0, 0.28);
    o += body(c, pd([q(-5, 0), q(-5, -70), q(5, -70), q(5, 0)], true), wood, F(pd([q(1.5, -72), q(7, -72), q(7, 2), q(1.5, 2)], true), dk(wood, 0.3), 0.8), 1.6 * s);
    // bull face
    o += body(c, pd([q(-8, -8), q(8, -8), q(7, -26), q(-7, -26)], true), '#a86a40', F(pd([q(2, -28), q(10, -28), q(10, -6), q(2, -6)], true), dk('#a86a40', 0.3), 0.8), 1.4 * s) + P(pd([q(-7, -24), q(-15, -32), q(-9, -22)], true) + pd([q(7, -24), q(15, -32), q(9, -22)], true), c.cel('#efe4c8'), 1 * s) +
      F(pd([q(-5, -19), q(-1.5, -18), q(-5, -16)], true) + pd([q(5, -19), q(1.5, -18), q(5, -16)], true), OL) + R(x - 3.5 * s, y - 13 * s, 7 * s, 3 * s, TAUR, 0.8 * s);
    // eye block
    o += body(c, pd([q(-7, -30), q(7, -30), q(7, -46), q(-7, -46)], true), TTEAL, F(pd([q(2, -48), q(9, -48), q(9, -28), q(2, -28)], true), dk(TTEAL, 0.3), 0.8), 1.4 * s) + P(ellD(x, y - 38 * s, 4.4 * s, 3 * s), '#f0e4c8', 0.9 * s) + C(x, y - 38 * s, 1.6 * s, OL);
    // wings
    var wg = function (k) { return pd([q(0, -58), q(k * 22, -66), q(k * 24, -60), q(k * 18, -58), q(k * 20, -54), q(k * 12, -53), q(k * 13, -49), q(k * 4, -52)], true); };
    o += P(wg(-1), c.cel('#c85a3a'), 1.3 * s) + P(wg(1), c.cel('#b04a2e'), 1.3 * s) + L('M' + pt(q(-20, -63)) + 'L' + pt(q(-4, -56)) + 'M' + pt(q(20, -63)) + 'L' + pt(q(4, -56)), '#f0e4c8', 1 * s);
    o += body(c, ellD(x, y - 62 * s, 6 * s, 8 * s), '#d8b060', P(pd([q(-2, -62), q(-7, -60), q(-2, -58)], true), '#e8a030', 0.7 * s), 1.4 * s) + C(x - 2.4 * s, y - 64 * s, 1 * s, OL);
    return o + feathers(x + 5 * s, y - 50 * s, ['#f0e4c8', TAUR], 0.6 * s, 0.1);
  }
  // great war drum: hide head, laced sides, painted band and two beaters (x = centre, y = ground)
  function drum(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 3, 30 * s, 5 * s, '#000', 0, 0.3), wood = '#7a4a2a';
    o += limb(pd([q(-20, 0), q(-16, -10)]) + pd([q(20, 0), q(16, -10)]), '#5a3a22', 3 * s);
    var sd = 'M' + pt(q(-22, -36)) + 'L' + pt(q(-19, -8)) + 'C' + pt(q(-12, -2)) + ' ' + pt(q(12, -2)) + ' ' + pt(q(19, -8)) + 'L' + pt(q(22, -36)) + 'Z';
    var lace = 'M' + pt(q(-20, -32)); for (var i = 1; i <= 10; i++) lace += 'L' + pt(q(-20 + i * 4, i % 2 ? -12 : -32));
    o += body(c, sd, wood, R(x - 24 * s, y - 24 * s, 48 * s, 5 * s, TAUR) + L(lace, '#e8dcc0', 1.1 * s) + F(pd([q(6, -40), q(26, -40), q(26, 2), q(8, 2)], true), dk(wood, 0.3), 0.75), 1.8 * s);
    o += body(c, ellD(x, y - 36 * s, 22 * s, 6 * s), '#e8d8b0', E(x - 6 * s, y - 37 * s, 9 * s, 2.4 * s, '#fff8e8', 0, 0.6) + C(x, y - 36 * s, 5 * s, TTEAL, 0, 0.8), 1.8 * s);
    o += limb(pd([q(10, -40), q(30, -58)]), '#c8a070', 2.2 * s) + C(x + 30 * s, y - 58 * s, 3 * s, c.cel('#e8dcc0'), 1 * s) + limb(pd([q(-8, -40), q(-24, -60)]), '#c8a070', 2.2 * s) + C(x - 24 * s, y - 60 * s, 3 * s, c.cel('#e8dcc0'), 1 * s);
    return o;
  }
  function kodoSkull(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; };
    return E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.25) + P('M' + pt(q(-6, -12)) + 'C' + pt(q(-16, -18)) + ' ' + pt(q(-24, -14)) + ' ' + pt(q(-26, -4)) + 'C' + pt(q(-20, -10)) + ' ' + pt(q(-14, -10)) + ' ' + pt(q(-6, -6)) + 'Z', c.cel('#e8e0c8'), 1.2 * s) + P('M' + pt(q(6, -12)) + 'C' + pt(q(16, -18)) + ' ' + pt(q(24, -14)) + ' ' + pt(q(26, -4)) + 'C' + pt(q(20, -10)) + ' ' + pt(q(14, -10)) + ' ' + pt(q(6, -6)) + 'Z', c.cel('#d8d0b8'), 1.2 * s) +
      P('M' + pt(q(-9, -12)) + 'C' + pt(q(-8, -18)) + ' ' + pt(q(8, -18)) + ' ' + pt(q(9, -12)) + 'L' + pt(q(6, 0)) + 'L' + pt(q(-6, 0)) + 'Z', c.cel('#f0e8d4'), 1.4 * s) + E(x - 4 * s, y - 10 * s, 2.2 * s, 2.6 * s, OL) + E(x + 4 * s, y - 10 * s, 2.2 * s, 2.6 * s, OL) + L('M' + pt(q(-3, -3)) + 'L' + pt(q(3, -3)), dk('#e8e0c8', 0.4), 1 * s);
  }
  // ---- gnoll camp ----
  // hide lean-to: two forked poles, a sagging ragged hide (x = left pole, y = ground)
  function leanTo(c, x, y, s, hide) {
    hide = hide || '#8a5a3a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x + 22 * s, y + 2, 36 * s, 4 * s, '#000', 0, 0.26);
    o += P(pd([q(-4, 0), q(2, -34), q(40, -30), q(52, 0)], true), '#2a1a12', 1.2 * s);
    var d = 'M' + pt(q(-2, -36)) + 'L' + pt(q(44, -32)) + 'L' + pt(q(56, 2)) + rag(56 * s + x, 18 * s + x, y + 2, -8 * s, Math.round(x)) + 'L' + pt(q(10, -12)) + 'Z';
    o += body(c, d, hide, L('M' + pt(q(8, -32)) + 'L' + pt(q(26, -2)) + 'M' + pt(q(24, -33)) + 'L' + pt(q(40, -2)), dk(hide, 0.3), 1 * s) + F(pd([q(30, -40), q(60, -40), q(60, 4), q(40, 4)], true), dk(hide, 0.25), 0.8) + mottle(Math.round(x + 1), 5, x + 12 * s, y - 28 * s, x + 40 * s, y - 8 * s, dk(hide, 0.35), lt(hide, 0.2), 1.4 * s, 2.4 * s)(), 1.6 * s);
    return o + limb(pd([q(0, 0), q(-2, -42)]) + pd([q(44, -2), q(46, -38)]), '#6a4a2e', 2.4 * s) + L('M' + pt(q(-2, -42)) + 'l-3,-4 M' + pt(q(-2, -42)) + 'l3,-5 M' + pt(q(46, -38)) + 'l-3,-5 M' + pt(q(46, -38)) + 'l3,-4', '#6a4a2e', 1.6 * s);
  }
  // antlered deer skull on a stake, hung with feathers and bones (x = foot, y = ground)
  function boneTotem(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 1, 7 * s, 2 * s, '#000', 0, 0.28);
    o += limb(pd([q(0, 0), q(0, -52)]), '#6a4a2e', 2.8 * s) + limb(pd([q(-12, -40), q(12, -42)]), '#6a4a2e', 2 * s);
    var ant = 'M' + pt(q(-3, -58)) + 'L' + pt(q(-10, -70)) + 'L' + pt(q(-16, -72)) + 'M' + pt(q(-8, -66)) + 'L' + pt(q(-8, -76)) + 'M' + pt(q(3, -58)) + 'L' + pt(q(10, -70)) + 'L' + pt(q(16, -72)) + 'M' + pt(q(8, -66)) + 'L' + pt(q(8, -76));
    o += L(ant, OL, 4 * s) + L(ant, '#e8e0c8', 2 * s);
    o += P('M' + pt(q(-6, -58)) + 'C' + pt(q(-7, -64)) + ' ' + pt(q(7, -64)) + ' ' + pt(q(6, -58)) + 'L' + pt(q(2, -44)) + 'L' + pt(q(-2, -44)) + 'Z', c.cel('#f0e8d4'), 1.2 * s) + E(x - 2.6 * s, y - 56 * s, 1.6 * s, 2 * s, OL) + E(x + 2.6 * s, y - 56 * s, 1.6 * s, 2 * s, OL);
    o += L('M' + pt(q(-11, -40)) + 'L' + pt(q(-11, -32)) + 'M' + pt(q(11, -42)) + 'L' + pt(q(11, -30)), '#6a5a3a', 0.9 * s) + feathers(x - 11 * s, y - 32 * s, ['#c8b890', '#6a3a2a'], 0.5 * s, -0.2) + bone(x + 11 * s, y - 28 * s, 7 * s, 1.5, 0.5 * s);
    return o;
  }
  // pelt-drying frame (x = centre, y = ground)
  function dryRack(c, x, y, s, col) {
    col = col || '#9a6a44'; var q = function (u, v) { return [x + u * s, y + v * s]; };
    var o = E(x, y + 1, 22 * s, 3 * s, '#000', 0, 0.25) + limb(pd([q(-18, 0), q(-16, -40)]) + pd([q(18, 0), q(16, -40)]), '#5a3e26', 2.4 * s) + limb(pd([q(-20, -38), q(20, -38)]), '#6a4a2e', 2 * s);
    [[-9, 22, col], [7, 26, dk(col, 0.15)]].forEach(function (p) { var px = x + p[0] * s, h = p[1] * s; o += body(c, 'M' + pt([px - 6 * s, y - 38 * s]) + 'L' + pt([px + 6 * s, y - 38 * s]) + 'C' + pt([px + 8 * s, y - 38 * s + h * 0.5]) + ' ' + pt([px + 5 * s, y - 38 * s + h]) + ' ' + pt([px, y - 38 * s + h]) + 'C' + pt([px - 5 * s, y - 38 * s + h]) + ' ' + pt([px - 8 * s, y - 38 * s + h * 0.5]) + ' ' + pt([px - 6 * s, y - 38 * s]) + 'Z', p[2], F(pd([[px + 1, y - 40 * s], [px + 9 * s, y - 40 * s], [px + 9 * s, y], [px + 1, y]], true), '#000', 0.2), 1.3 * s); });
    return o;
  }
  // ---- ogre outpost ----
  // big domed ogre hut: hide panels over tusk ribs, a crude door and a skull (x = centre, y = ground)
  function ogreHut(c, x, y, s, hide) {
    hide = hide || '#8a6a4a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 3, 56 * s, 6 * s, '#000', 0, 0.28);
    var d = 'M' + pt(q(-52, 0)) + 'C' + pt(q(-52, -40)) + ' ' + pt(q(-26, -62)) + ' ' + pt(q(0, -62)) + 'C' + pt(q(26, -62)) + ' ' + pt(q(52, -40)) + ' ' + pt(q(52, 0)) + 'Z';
    var seams = 'M' + pt(q(-30, -2)) + 'C' + pt(q(-34, -30)) + ' ' + pt(q(-20, -54)) + ' ' + pt(q(-4, -61)) + 'M' + pt(q(26, -2)) + 'C' + pt(q(30, -30)) + ' ' + pt(q(20, -52)) + ' ' + pt(q(6, -61)) + 'M' + pt(q(-50, -22)) + 'C' + pt(q(-20, -30)) + ' ' + pt(q(20, -30)) + ' ' + pt(q(50, -22));
    o += body(c, d, hide, L(seams, dk(hide, 0.35), 1.2 * s) + mottle(Math.round(x), 8, x - 44 * s, y - 50 * s, x + 44 * s, y - 6 * s, dk(hide, 0.2), lt(hide, 0.15), 2 * s, 4 * s)() + F(pd([q(14, -66), q(56, -66), q(56, 4), q(24, 4)], true), dk(hide, 0.3), 0.75), 2 * s);
    [[-40, -8, -0.5], [40, -8, 0.5], [-22, -44, -0.3], [22, -44, 0.3]].forEach(function (t) { var b = q(t[0], t[1]), a = -PI / 2 + t[2] * 2; o += P(pd([[b[0] - 3 * s, b[1]], [b[0] + Math.cos(a) * 16 * s, b[1] + Math.sin(a) * 16 * s], [b[0] + 3 * s, b[1]]], true), c.cel('#ece2c8'), 1.2 * s); });
    o += P('M' + pt(q(-14, 0)) + 'L' + pt(q(-14, -28)) + 'C' + pt(q(-14, -36)) + ' ' + pt(q(14, -36)) + ' ' + pt(q(14, -28)) + 'L' + pt(q(14, 0)) + 'Z', '#1e140e', 1.6 * s) + P(pd([q(-16, -30), q(16, -30), q(16, -26), q(-16, -26)], true), c.cel('#5a3e26'), 1.2 * s);
    return o + skull(c, x, y - 40 * s, 1.3 * s) + limb(pd([q(-60, 2), q(-60, -38)]), '#5a3e26', 3 * s) + skull(c, x - 60 * s, y - 40 * s, 0.9 * s);
  }
  // crude Gordunni war banner: stitched hide on a spear with a red hand print (x = pole, y = ground)
  function ogreBanner(c, x, y, h, s) {
    var ty = y - h, o = E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.3) + limb(pd([[x, y], [x, ty - 8 * s]]), '#5a3e24', 3 * s) + P(pd([[x - 3 * s, ty - 8 * s], [x, ty - 20 * s], [x + 3 * s, ty - 8 * s]], true), c.cel('#b8b4a8'), 1.2 * s);
    var d = pd([[x + 1, ty], [x + 26 * s, ty + 2 * s], [x + 24 * s, ty + 32 * s], [x + 18 * s, ty + 28 * s], [x + 12 * s, ty + 36 * s], [x + 6 * s, ty + 30 * s], [x + 1, ty + 34 * s]], true);
    o += body(c, d, '#c8b08a', F(pd([[x + 16 * s, ty - 2], [x + 30 * s, ty - 2], [x + 30 * s, ty + 40 * s], [x + 16 * s, ty + 40 * s]], true), '#000', 0.2), 1.5 * s);
    var hx = x + 13 * s, hy = ty + 16 * s;
    o += F(ellD(hx, hy + 2 * s, 5 * s, 6 * s), OGR) + F(pd([[hx - 5 * s, hy - 1], [hx - 7 * s, hy - 9 * s], [hx - 4 * s, hy - 9 * s], [hx - 2.5 * s, hy - 3]], true) + pd([[hx - 1.5 * s, hy - 3], [hx - 1.5 * s, hy - 12 * s], [hx + 1.5 * s, hy - 12 * s], [hx + 1.5 * s, hy - 3]], true) + pd([[hx + 2.5 * s, hy - 3], [hx + 4 * s, hy - 10 * s], [hx + 7 * s, hy - 9 * s], [hx + 5 * s, hy]], true) + pd([[hx + 4 * s, hy + 3 * s], [hx + 10 * s, hy], [hx + 10 * s, hy + 3 * s], [hx + 5 * s, hy + 6 * s]], true), OGR);
    return o;
  }
  function cauldron(c, x, y, s) {
    var o = C(x, y - 20 * s, 30 * s, glow(c, '#ffa040', 0.35)) + campfire(c, x, y + 2 * s, 0.5 * s);
    o += body(c, 'M' + pt([x - 16 * s, y - 20 * s]) + 'C' + pt([x - 18 * s, y - 4 * s]) + ' ' + pt([x + 18 * s, y - 4 * s]) + ' ' + pt([x + 16 * s, y - 20 * s]) + 'Z', '#3a3a3e', F(pd([[x + 4 * s, y - 22 * s], [x + 20 * s, y - 22 * s], [x + 20 * s, y], [x + 6 * s, y]], true), '#000', 0.3), 1.8 * s) + E(x, y - 20 * s, 16 * s, 3.4 * s, '#4a4a50', 1.6 * s) + E(x, y - 20 * s, 13 * s, 2.4 * s, '#7a8a3a');
    return o + smoke(x, y - 22 * s, 0.6 * s, '#c8c8b8', 0.45, 0.4);
  }
  // ---- naga ruins ----
  // spiral shell spire with barnacles and coral (x = centre, y = base)
  function shellSpire(c, x, y, w, h, col, seed, broken) {
    col = col || NST; var r = rng(seed || 7), hw = w / 2, top = broken ? y - h * 0.7 : y - h, o = E(x, y + 2, w, 3.6, '#000', 0, 0.25);
    var d = broken ? pd([[x - hw, y], [x - hw * 0.4, top + 8], [x - hw * 0.1, top], [x + hw * 0.1, top + 9], [x + hw * 0.38, top + 4], [x + hw, y]], true) : 'M' + pt([x - hw, y]) + 'C' + pt([x - hw * 0.8, y - h * 0.4]) + ' ' + pt([x - hw * 0.2, y - h * 0.8]) + ' ' + pt([x, top]) + 'C' + pt([x + hw * 0.2, y - h * 0.8]) + ' ' + pt([x + hw * 0.8, y - h * 0.4]) + ' ' + pt([x + hw, y]) + 'Z';
    var sp = ''; for (var i = 1; i < 9; i++) { var t = i / 9, yy = y - (y - top) * t, hh = hw * (1 - t * 0.85); sp += 'M' + pt([x - hh, yy + 6 * (1 - t)]) + 'Q' + pt([x, yy - 4]) + ' ' + pt([x + hh, yy - 2 - 4 * (1 - t)]); }
    var bar = ''; for (var k = 0; k < 7; k++) bar += C(x + (r() - 0.5) * w * 0.8, y - r() * h * 0.5, 1 + r() * 1.4, lt(col, 0.35), 0.8);
    o += body(c, d, col, L(sp, dk(col, 0.35), 1.4) + F(pd([[x + hw * 0.1, top - 2], [x + hw + 2, top - 2], [x + hw + 2, y + 2], [x + hw * 0.3, y + 2]], true), dk(col, 0.28), 0.8) + bar, 1.8);
    o += coral(c, x - hw * 0.7, y, 0.7, COR, seed) + (w > 20 ? coral(c, x + hw * 0.6, y, 0.55, '#d8a060', (seed || 1) + 3) : '');
    return o;
  }
  function coral(c, x, y, s, col, seed) {
    var r = rng(seed || 3), d = '';
    for (var i = 0; i < 4; i++) { var a = -PI / 2 + (i - 1.5) * 0.45, l = (10 + r() * 6) * s, mx = x + Math.cos(a) * l * 0.5, my = y + Math.sin(a) * l * 0.5; d += 'M' + pt([x, y]) + 'L' + pt([mx, my]) + 'L' + pt([x + Math.cos(a) * l, y + Math.sin(a) * l]) + 'M' + pt([mx, my]) + 'L' + pt([mx + Math.cos(a - 0.7) * l * 0.4, my + Math.sin(a - 0.7) * l * 0.4]); }
    return L(d, OL, 4 * s + 1) + L(d, col, 2.2 * s + 0.4);
  }
  function kelp(c, x, y, s, col) {
    col = col || '#4a6a3a'; var d = 'M' + pt([x, y]) + 'C' + pt([x - 6 * s, y - 10 * s]) + ' ' + pt([x + 6 * s, y - 18 * s]) + ' ' + pt([x - 2 * s, y - 28 * s]) + 'M' + pt([x + 4 * s, y]) + 'C' + pt([x + 10 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 16 * s]) + ' ' + pt([x + 8 * s, y - 22 * s]);
    return L(d, OL, 4 * s) + L(d, col, 2 * s);
  }
  // naga arch: two coral-crusted pillars and a curling fin-shaped lintel (x = centre, y = base)
  function nagaGate(c, x, y, w, h, col, seed) {
    col = col || NST; var hw = w / 2, top = y - h, o = '';
    var T = taper([[x - hw - 4, top + 8], [x - hw * 0.5, top - 10], [x + hw * 0.3, top - 8], [x + hw + 6, top - 20], [x + hw + 12, top - 30]], 12, 4, 6);
    o += shellSpire(c, x - hw, y, 16, h + 6, col, seed) + shellSpire(c, x + hw, y, 16, h * 0.9, col, (seed || 1) + 2);
    o += body(c, T.d, lt(col, 0.05), L(bands(T, 3, 2), dk(col, 0.35), 1.2) + F(ribbonBand(T, 0.6, 1), dk(col, 0.25), 0.8), 1.6) + C(x - hw * 0.2, top - 6, 3.6, c.cel('#e8f0ff'), 1.1) + C(x - hw * 0.2, top - 6, 8, glow(c, '#9ae8ff', 0.4));
    return o;
  }
  // ---- highlands ----
  // hippogryph nest of branches on a crag, with eggs and shed feathers (x = centre, y = nest rim)
  function bigNest(c, x, y, s) {
    var o = nest(c, x, y, 2.1 * s, 3) + feather(c, x + 26 * s, y + 4 * s, 0.3, 14 * s, '#8aa0c0', '#3a4a6a') + feather(c, x - 30 * s, y + 3 * s, 2.6, 12 * s, '#c89a5a', '#6a4a2a');
    return o;
  }
  // distant hippogryph in flight (silhouette, facing left)
  function flyer(x, y, s, col, flap) {
    var k = flap ? -1 : 1, d = ellD(x, y, 9 * s, 3 * s) + 'M' + pt([x - 8 * s, y - 1 * s]) + 'L' + pt([x - 13 * s, y - 2 * s]) + 'L' + pt([x - 14 * s, y]) + 'L' + pt([x - 8 * s, y + 1 * s]) + 'Z' +
      'M' + pt([x + 8 * s, y]) + 'L' + pt([x + 15 * s, y - 2 * s]) + 'L' + pt([x + 15 * s, y + 2 * s]) + 'Z' +
      'M' + pt([x - 4 * s, y - 1 * s]) + 'Q' + pt([x, y - 10 * s * k]) + ' ' + pt([x + 10 * s, y - 16 * s * k]) + 'Q' + pt([x + 6 * s, y - 6 * s * k]) + ' ' + pt([x + 4 * s, y - 1 * s]) + 'Z';
    return F(d, col);
  }
  // ---- Desolace ----
  function cracks(seed, y0, y1, col, cnt) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), s = 0.6 + (y - y0) / (y1 - y0), l = (8 + r() * 12) * s; d += 'M' + pt([x, y]) + 'l' + n(l * 0.5) + ',' + n(-1 - r() * 2) + 'l' + n(l * 0.5) + ',' + n(r() * 3) + 'M' + pt([x + l * 0.5, y - 1]) + 'l' + n(r() * 4) + ',' + n(-3 * s); }
    return L(d, col, 1, 0.7);
  }
  // rock face with the great cave mouth of Maraudon: purple light, crystals, a vine lintel (x = centre, y = cave floor)
  function caveMouth(c, x, y, w, h) {
    var hw = w / 2, o = '';
    var cliff = 'M' + pt([x - hw * 2.2, y + 4]) + 'L' + pt([x - hw * 1.9, y - h * 1.3]) + 'L' + pt([x - hw * 1.2, y - h * 1.6]) + 'L' + pt([x - hw * 0.4, y - h * 1.5]) + 'L' + pt([x + hw * 0.3, y - h * 1.75]) + 'L' + pt([x + hw * 1.2, y - h * 1.55]) + 'L' + pt([x + hw * 2.1, y - h * 1.35]) + 'L' + pt([x + hw * 2.3, y + 4]) + 'Z';
    o += body(c, cliff, '#7e786e', F(pd([[x + hw * 0.4, y - h * 1.8], [x + hw * 2.4, y - h * 1.8], [x + hw * 2.4, y + 6], [x + hw * 0.8, y + 6]], true), '#4a463e', 0.55) + L('M' + pt([x - hw * 1.6, y - h * 1.1]) + 'L' + pt([x - hw * 1.3, y - h * 0.4]) + 'M' + pt([x + hw * 1.5, y - h * 1.2]) + 'L' + pt([x + hw * 1.7, y - h * 0.3]) + 'M' + pt([x - hw * 0.8, y - h * 1.4]) + 'L' + pt([x - hw * 0.9, y - h * 1.15]), '#4e4a42', 1.4) + F(pd([[x - hw * 2.2, y - h * 1.3], [x + hw * 2.3, y - h * 1.35], [x + hw * 2.3, y - h * 1.2], [x - hw * 2.2, y - h * 1.18]], true), '#a8a298', 0.5), 2);
    var mouth = 'M' + pt([x - hw, y + 1]) + 'C' + pt([x - hw * 1.04, y - h * 0.7]) + ' ' + pt([x - hw * 0.6, y - h]) + ' ' + pt([x, y - h]) + 'C' + pt([x + hw * 0.6, y - h]) + ' ' + pt([x + hw * 1.04, y - h * 0.7]) + ' ' + pt([x + hw, y + 1]) + 'Z';
    o += C(x, y - h * 0.4, w * 1.3, glow(c, MARA, 0.55));
    o += P(mouth, c.rg([[0, '#f0c8ff'], [0.35, '#9a3ae0'], [0.75, '#3a1454'], [1, '#1a0a24']]), 2.2);
    o += F('M' + pt([x - hw * 0.5, y + 1]) + 'C' + pt([x - hw * 0.4, y - h * 0.4]) + ' ' + pt([x + hw * 0.4, y - h * 0.4]) + ' ' + pt([x + hw * 0.5, y + 1]) + 'Z', '#e8b0ff', 0.35);
    [[-0.78, 0.2, 1.1], [-0.62, 0.05, 0.8], [0.7, 0.15, 1.2], [0.84, 0.02, 0.8], [-0.2, 0.9, -0.9], [0.25, 0.92, -0.7]].forEach(function (k) {
      var bx = x + hw * k[0], by = y - h * k[1], l = 12 * Math.abs(k[2]), up = k[2] > 0 ? -1 : 1;
      o += P(pd([[bx - 3.4, by], [bx - 1, by + up * l], [bx + 3.4, by]], true), c.cel('#c890ff'), 1.2) + F(pd([[bx - 1.4, by], [bx - 0.6, by + up * l * 0.8], [bx + 0.6, by]], true), '#f4e4ff', 0.8);
    });
    var vine = 'M' + pt([x - hw * 1.1, y - h * 0.9]) + 'C' + pt([x - hw * 0.5, y - h * 1.18]) + ' ' + pt([x + hw * 0.5, y - h * 1.18]) + ' ' + pt([x + hw * 1.1, y - h * 0.9]);
    var lv = ''; for (var i = 1; i < 10; i++) { var b = bez([x - hw * 1.1, y - h * 0.9], [x - hw * 0.5, y - h * 1.18], [x + hw * 0.5, y - h * 1.18], [x + hw * 1.1, y - h * 0.9], i / 10); lv += leafD(b[0], b[1], i % 2 ? 1 : -1, 6); }
    o += L(vine, OL, 6) + L(vine, '#5a6a3a', 3.4) + P(lv, c.cel('#7a8a4a'), 0.9);
    o += L('M' + pt([x - hw * 0.9, y - h * 0.86]) + 'C' + pt([x - hw * 0.94, y - h * 0.5]) + ' ' + pt([x - hw * 0.8, y - h * 0.3]) + ' ' + pt([x - hw * 0.86, y - h * 0.1]) + 'M' + pt([x + hw * 0.92, y - h * 0.84]) + 'C' + pt([x + hw * 0.88, y - h * 0.6]) + ' ' + pt([x + hw * 0.98, y - h * 0.4]) + ' ' + pt([x + hw * 0.9, y - h * 0.24]), '#5a6a3a', 2.2);
    return o + motes(Math.round(x), 16, x - hw, x + hw, y - h, y, '#f0d0ff');
  }
  // centaur tent: a squat hide yurt on a pole frame, horse-tail standard and a skull (x = centre, y = ground)
  function cTent(c, x, y, s, hide) {
    hide = hide || '#9a7a56'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 36 * s, 4 * s, '#000', 0, 0.28);
    var d = 'M' + pt(q(-32, 0)) + 'L' + pt(q(-28, -20)) + 'C' + pt(q(-20, -34)) + ' ' + pt(q(-8, -40)) + ' ' + pt(q(0, -40)) + 'C' + pt(q(8, -40)) + ' ' + pt(q(20, -34)) + ' ' + pt(q(28, -20)) + 'L' + pt(q(32, 0)) + 'Z';
    o += body(c, d, hide, R(x - 34 * s, y - 22 * s, 68 * s, 5 * s, '#6a3a2a') + L('M' + pt(q(-14, -1)) + 'L' + pt(q(-10, -38)) + 'M' + pt(q(12, -1)) + 'L' + pt(q(9, -38)), dk(hide, 0.3), 1 * s) + F(pd([q(8, -44), q(36, -44), q(36, 4), q(14, 4)], true), dk(hide, 0.28), 0.75) + mottle(Math.round(x * 3), 5, x - 26 * s, y - 34 * s, x + 20 * s, y - 4 * s, dk(hide, 0.3), lt(hide, 0.2), 1.6 * s, 3 * s)(), 1.8 * s);
    o += P(pd([q(-8, 0), q(-4, -18), q(4, -18), q(8, 0)], true), '#20140c', 1.2 * s) + limb(pd([q(-2, -38), q(-4, -54)]) + pd([q(2, -38), q(6, -52)]), '#5a3e26', 1.8 * s);
    return o;
  }
  function horseTail(c, x, y, h, s, col) {
    col = col || '#3a2a20'; var ty = y - h, d = 'M' + pt([x, ty + 4 * s]) + 'C' + pt([x - 4 * s, ty + 12 * s]) + ' ' + pt([x - 2 * s, ty + 22 * s]) + ' ' + pt([x - 6 * s, ty + 30 * s]) + 'L' + pt([x - 1 * s, ty + 26 * s]) + 'L' + pt([x + 1 * s, ty + 32 * s]) + 'L' + pt([x + 3 * s, ty + 24 * s]) + 'C' + pt([x + 4 * s, ty + 16 * s]) + ' ' + pt([x + 2 * s, ty + 10 * s]) + ' ' + pt([x + 1 * s, ty + 4 * s]) + 'Z';
    return E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.3) + limb(pd([[x, y], [x, ty]]), '#6a4a2e', 2.4 * s) + P(pd([[x - 2.4 * s, ty], [x, ty - 10 * s], [x + 2.4 * s, ty]], true), c.cel('#c8c4b8'), 1 * s) + skull(c, x, ty + 1 * s, 0.7 * s) + P(d, c.cel(col), 1.2 * s);
  }
  function mesas(c, seed, base, col, cnt) {
    var r = rng(seed), o = '', x = -30;
    for (var i = 0; i < cnt; i++) { var w = 40 + r() * 60, h = 14 + r() * 26, t = w * (0.2 + r() * 0.2); o += F(pd([[x, base + 2], [x + t, base - h], [x + w - t, base - h], [x + w, base + 2]], true), col) + F(pd([[x + w * 0.5, base - h], [x + w - t, base - h], [x + w, base + 2], [x + w * 0.6, base + 2]], true), dk(col, 0.12), 0.8); x += w * (0.7 + r() * 0.5); if (x > 430) break; }
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    feathermoon_stronghold: function (c) {
      var o = sky(c, '#2a2e5e', '#6a5e94', '#e0a8a0') + stars(1101, 40, 90) + moon(c, 318, 40, 13) + cloud(120, 56, 0.9, 0.35, '#b8a8d8') + cloud(250, 74, 0.7, 0.3, '#d8b0c0');
      o += farPines(1103, 114, '#3a3a60', 16, 22, 40, -10, 130) + farPines(1104, 114, '#40406a', 10, 12, 20, 360, 410) + hills(c, 1105, 116, 6, '#3a3a5e', 30);
      o += lake(c, 112, 190, '#8a82b4', '#2e2e5a', 1107, 34) + F(pd([[296, 112], [340, 112], [352, 190], [284, 190]], true), c.lg([[0, '#e8ecff', 0.35], [1, '#e8ecff', 0]]));
      // island and fortress
      o += body(c, 'M150,156 C160,140 200,134 260,134 C310,134 350,140 368,156 C340,162 180,162 150,156 Z', '#5a5a6e', F('M150,156 C170,150 330,150 368,156 L368,162 L150,162 Z', '#2e2e3e', 0.6), 1.8);
      o += F('M156,160 C200,168 320,168 364,160 L364,178 C320,184 200,184 156,178 Z', '#6a5aa0', 0.25);
      o += elfWall(c, 168, 356, 146, 18, '#8a7cae') + elfTower(c, 196, 144, 20, 50, '#9486ba') + elfTower(c, 330, 144, 18, 40, '#8e80b4');
      o += elfTower(c, 262, 140, 30, 62, '#9a8cc0', '#56448e') + elfBanner(c, 230, 130, 10, 18) + elfBanner(c, 294, 130, 10, 18);
      o += C(262, 120, 40, glow(c, '#cfc8ff', 0.25));
      // shore and pier in front
      o += body(c, 'M-4,192 C60,184 140,186 210,192 C280,198 340,190 404,186 L404,242 L-4,242 Z', '#8a8274', R(-4, 180, 408, 64, c.lg([[0, '#b8ae98', 0.5], [1, '#2a2620', 0.9]])), 1.6);
      o += L('M-4,194 C60,186 140,188 206,194', '#e8ecff', 1.6, 0.6);
      var pier = pd([[250, 196], [372, 150], [384, 152], [274, 204]], true);
      o += body(c, pier, '#7a6a8a', L('M270,190 L282,196 M294,182 L306,188 M318,173 L330,179 M342,164 L354,170', dk('#7a6a8a', 0.35), 1.2), 1.6) + limb('M262,202 L262,214 M378,151 L378,162', '#5a4a6a', 3);
      o += moonLamp(c, 238, 206, 1.1) + moonLamp(c, 376, 154, 0.7) + flag(c, 60, 200, 64, 1.1, NELF, NTRIM, moonMark) + flag(c, 180, 198, 52, 0.85, NELF, NTRIM, moonMark);
      o += grass(1109, 196, 238, '#3e3e4a', 30, 0.6, 1.4, 1.1) + pebbles(1110, 200, 236, '#5e5a52', 12);
      o += redwood(c, -6, 238, 34, '#6a3e36', 1111) + fern(c, 30, 244, 1.1, '#3e5a4a') + fern(c, 396, 246, 1.2, '#3e5a4a') + fern(c, 150, 250, 0.8, '#44604e');
      return o + fireflies(1113, 12, 0, 400, 150, 230) + vignette(c, '#c8c8ff', '#06060e');
    },
    camp_mojache: function (c) {
      var o = frSky(c, '#a8c4a0', '#e0dca8', '#f4e2a8');
      o += farTrunks(1201, 150, '#9aa88a', 14, 10, 18) + haze(c, 120, 60, 0.5, MISTC) + farTrunks(1203, 152, '#6e7a5a', 9, 16, 26);
      o += crowns(1205, 14, 0, 40, '#5a7a44', '#8aa058') + shafts(c, 1207, 6, 0.32, '#fff4c8', 210);
      o += floor(c, 150, '#8e8a4e', '#3e3a20', 1209);
      o += tTent(c, 70, 176, 1, HIDE, TAUR) + tTent(c, 322, 168, 0.86, '#b08458', TTEAL) + tTent(c, 150, 160, 0.62, '#c49a6a', TAUR);
      o += tTotem(c, 240, 172, 1) + tTotem(c, 380, 190, 0.8) + drum(c, 196, 196, 0.9) + kodoSkull(c, 120, 206, 1);
      o += campfire(c, 276, 200, 0.7) + crate(c, 30, 204, 0.8, '#9a6a3a') + sack(c, 44, 210, 0.7) + barrel(c, 360, 214, 0.8, '#7a4a2a');
      o += grass(1211, 172, 238, '#4a5a2a', 40, 0.6, 1.4, 1.1) + pebbles(1212, 180, 236, '#6a5a3a', 12);
      o += redwood(c, 12, 190, 40, BARK, 1213) + redwood(c, 392, 184, 34, '#86452e', 1214) + fern(c, 46, 246, 1.2, FERN) + fern(c, 372, 248, 1.2, FERN) + fern(c, 170, 250, 0.8, '#5a9a42');
      o += canopyTop(c, 1215, '#2e4e24', 20) + vines(c, 1217, 4, 40, 380, 24, 60, '#4a6a2a');
      return o + motes(1219, 26, 0, 400, 30, 200) + vignette(c, '#fff8d0', '#0e140a');
    },
    frayfeather_highlands: function (c) {
      var o = frSky(c, '#86b6d4', '#cfe2d4', '#eee8c0') + sun(c, 90, 40, 12, '#fff8e0') + cloud(190, 36, 1.1, 0.85) + cloud(330, 52, 0.8, 0.8) + cloud(40, 70, 0.6, 0.7);
      o += flyer(250, 30, 1.1, '#5a6a8a', true) + flyer(290, 44, 0.8, '#6a7a96') + flyer(150, 70, 0.6, '#7a88a0', true);
      o += farPines(1301, 120, '#8aa4a0', 22, 26, 46, -10, 150) + farPines(1302, 122, '#98aca4', 10, 14, 24, 330, 410);
      o += hills(c, 1303, 124, 18, '#a8b884', 50) + hills(c, 1305, 140, 20, '#8aa05e', 40, 1.4);
      // crag with the big nest
      o += body(c, 'M232,168 L240,130 L256,104 L276,96 L300,100 L316,116 L326,142 L336,168 Z', '#8a8a7e', F('M290,98 L316,116 L326,142 L336,168 L300,168 L304,130 Z', '#5e5e56', 0.8) + L('M252,120 L262,150 M280,104 L286,128', '#6a6a60', 1.2) + F('M240,130 L256,104 L276,96 L270,110 L254,124 Z', '#aaa89a', 0.7), 1.8);
      o += bigNest(c, 280, 100, 0.9);
      o += body(c, 'M-4,160 C80,150 170,158 240,162 C300,166 360,158 404,154 L404,242 L-4,242 Z', '#94a852', R(-4, 150, 408, 94, c.lg([[0, '#c8d078', 0.4], [1, '#3e4a1e', 0.9]])), 1.6);
      o += rock(c, 60, 176, 34, 18, '#9a9a8c') + rock(c, 196, 170, 20, 10, '#9a9a8c') + mossRock(c, 380, 190, 30, 16, '#8a8a80');
      o += grass(1307, 164, 238, '#5a6a2a', 60, 0.6, 1.6, 1.1) + flowers(1308, 168, 236, ['#f0e070', '#e8a0c8', '#fff4e8', '#a0b8f0'], 40);
      o += tufts(c, [[20, 226, 1.2], [360, 232, 1.3], [140, 238, 1], [250, 222, 0.8]], '#7a9a3a');
      o += feather(c, 110, 214, 0.2, 16, '#8aa0c0', '#3a4a6a') + feather(c, 320, 228, 2.8, 14, '#c89a5a', '#6a4a2a');
      return o + vignette(c, '#ffffff', '#141a08');
    },
    woodpaw_hills: function (c) {
      var o = frSky(c, '#98b4a0', '#dcd8a4', '#f0d49a') + sun(c, 320, 50, 11, '#fff0c0') + cloud(120, 40, 0.9, 0.7, '#fff8e8');
      o += farPines(1401, 124, '#9aa88e', 22, 28, 50, 170, 420) + farPines(1402, 126, '#a8b098', 8, 14, 24, -10, 120);
      o += hills(c, 1403, 132, 26, '#90a060', 60) + hills(c, 1405, 150, 22, '#7a8a4a', 48, 1.4);
      o += floor(c, 158, '#8a7a4a', '#3a3020', 1407);
      o += leanTo(c, 40, 180, 1, '#8a5a3a') + leanTo(c, 250, 170, 0.8, '#7a4e32') + dryRack(c, 170, 176, 0.9, '#a06a44');
      o += boneTotem(c, 140, 196, 1) + boneTotem(c, 360, 188, 0.85) + spit(c, 220, 204, 0.75);
      o += bone(96, 214, 16, 0.3, 0.9) + skull(c, 304, 214, 0.9) + bone(318, 222, 12, -0.6, 0.8) + sack(c, 110, 208, 0.7, '#a08a5a');
      o += grass(1409, 170, 238, '#4a5226', 40, 0.6, 1.4, 1.1) + pebbles(1410, 176, 236, '#6a5a3a', 14);
      o += redwood(c, 398, 196, 30, BARK, 1411) + fern(c, 18, 246, 1.2, FERN) + fern(c, 388, 248, 1.1, FERN) + tufts(c, [[190, 234, 1], [300, 238, 1.1]], '#6a8a3a');
      return o + motes(1413, 12, 0, 400, 40, 200) + vignette(c, '#fff4d0', '#0e0c06');
    },
    gordunni_outpost: function (c) {
      var o = frSky(c, '#8aa894', '#c8cc9c', '#e0cc96');
      o += farTrunks(1501, 146, '#8a9a82', 12, 10, 16) + haze(c, 124, 50, 0.45, MISTC) + farTrunks(1503, 148, '#5e6a4e', 8, 14, 24);
      o += crowns(1505, 12, 0, 40, '#4e6a3e', '#7a9050');
      o += floor(c, 150, '#7e7a48', '#34301c', 1507);
      o += elfArch(c, 150, 170, 60, 56, '#8e84a8', 1509) + elfColumn(c, 60, 176, 14, 66, '#8a80a4', 1511, true) + elfColumn(c, 224, 162, 12, 40, '#8a80a4', 1512, true);
      o += rubble(c, 96, 180, 0.9, '#8a80a4', 1513) + rubble(c, 206, 176, 0.7, '#8a80a4', 1514);
      o += ogreHut(c, 326, 176, 1, '#8a6a4a') + ogreBanner(c, 250, 200, 60, 1) + ogreBanner(c, 40, 208, 56, 0.9);
      o += cauldron(c, 200, 206, 0.9) + barrel(c, 370, 212, 0.9, '#6a4a2a') + crate(c, 390, 220, 0.8) + skull(c, 120, 216, 1) + bone(136, 222, 16, 0.5, 0.9);
      o += grass(1515, 176, 238, '#3e4a22', 36, 0.6, 1.4, 1.1) + pebbles(1516, 180, 236, '#5a4e30', 12);
      o += redwood(c, 4, 216, 36, '#80402c', 1517) + fern(c, 380, 250, 1.2, FERN) + fern(c, 150, 250, 0.9, FERN) + mushroom(c, 30, 226, 1.1) + mushroom(c, 40, 230, 0.8);
      o += canopyTop(c, 1519, '#243e20', 18) + vines(c, 1521, 5, 0, 400, 24, 70, '#3e6a2a');
      return o + motes(1523, 14, 0, 400, 30, 200) + vignette(c, '#f8f4c8', '#0a0e06');
    },
    the_forgotten_coast: function (c) {
      var o = sky(c, '#7e8a92', '#aab4b4', '#cfd2c8') + cloud(90, 40, 1.3, 0.5, '#e0e4e4') + cloud(280, 30, 1.1, 0.45, '#d8dcdc');
      o += hills(c, 1601, 110, 22, '#8a969a', 40) + haze(c, 108, 20, 0.5, '#dce0dc');
      o += lake(c, 110, 176, '#8a989c', '#4a5a60', 1603, 36) + waves(1605, 116, 172, 40, '#e0e8e8');
      o += shellSpire(c, 250, 150, 22, 70, NST, 1607) + shellSpire(c, 290, 146, 14, 46, '#648480', 1608, true) + nagaGate(c, 350, 160, 50, 58, NST, 1609);
      o += rock(c, 250, 152, 40, 8, '#5a6a6a') + rock(c, 350, 162, 80, 8, '#5a6a6a') + L('M220,152 q10,-3 20,0 M320,162 q12,-3 24,0 M372,162 q10,-3 20,0', '#e8f0f0', 1.2, 0.8);
      o += body(c, 'M-4,174 C60,168 130,172 210,180 C270,186 340,184 404,178 L404,242 L-4,242 Z', '#aaa290', R(-4, 170, 408, 74, c.lg([[0, '#d0c8b4', 0.4], [1, '#3e3a30', 0.85]])), 1.6);
      o += L('M-4,176 C60,170 130,174 206,182 C270,188 340,186 404,180', '#f0f4f4', 2, 0.7) + L('M0,182 C60,176 120,180 180,186', '#e8eef0', 1.2, 0.5);
      o += redwood(c, 22, 190, 30, '#7a4a3a', 1611) + redwood(c, 70, 176, 18, '#7e5040', 1612) + fern(c, 50, 200, 1, '#4e6e4a');
      o += driftwood(c, 150, 212, 56, -0.08, 1) + kelp(c, 230, 222, 1) + kelp(c, 330, 214, 0.9) + coral(c, 300, 230, 0.9, COR, 1613) + pebbles(1614, 190, 236, '#7a7468', 16);
      o += rock(c, 390, 220, 36, 20, '#6e7474') + rock(c, 370, 228, 20, 10, '#7e8484');
      return o + rain(1615, 90, '#e8eef4', 0.4) + vignette(c, '#e8eef0', '#0a0c0c');
    },
    lower_wilds: function (c) {
      var o = frSky(c, '#8aa890', '#c8d09a', '#e4d8a0');
      o += farTrunks(1701, 150, '#a4ac92', 12, 10, 16) + haze(c, 110, 80, 0.55, MISTC) + farTrunks(1703, 152, '#7a8468', 8, 18, 28);
      o += shafts(c, 1705, 7, 0.34, '#fff4c8', 220);
      // a treant walking far between the trunks
      o += G(F('M0,0 L-6,-30 C-14,-36 -16,-50 -8,-58 C-4,-66 8,-66 12,-58 C20,-52 18,-38 10,-30 L6,0 L2,-10 Z M-6,-30 L-16,-18 M10,-30 L20,-14', '#6e7a5e') + L('M-6,-28 L-16,-16 M9,-28 L20,-12', '#6e7a5e', 3) + L('M-4,-60 L-10,-74 L-17,-78 M-10,-74 L-8,-84 M8,-60 L15,-72 L22,-74 M15,-72 L15,-82', '#6e7a5e', 3) + E(-17, -80, 7, 4, '#6e7a5e') + E(-6, -86, 6, 4, '#6e7a5e') + E(20, -78, 7, 4, '#6e7a5e') + E(14, -86, 5, 3.4, '#6e7a5e') + C(-1, -46, 1.4, '#e8ff9a') + C(5, -46, 1.4, '#e8ff9a'), 'translate(146,150) scale(1.1)', 0.9);
      o += eyePair(c, 270, 142, 1, '#ffd060') + eyePair(c, 300, 146, 0.8, '#ffd060');
      o += floor(c, 150, '#6e7a42', '#2a301a', 1707);
      o += redwood(c, 206, 158, 26, '#8a4a34', 1709) + redwood(c, 330, 160, 34, '#86452e', 1710);
      o += roots(c, 90, 190, 1.2) + mushroom(c, 80, 190, 1.2, '#e0b050') + mushroom(c, 100, 192, 0.9, '#d89040');
      o += grass(1711, 170, 238, '#3a4a22', 40, 0.6, 1.4, 1.1) + pebbles(1712, 178, 236, '#5a5030', 10);
      o += redwood(c, 24, 238, 58, BARK, 1713) + redwood(c, 392, 238, 48, '#8a4830', 1714) + fern(c, 80, 250, 1.3, FERN) + fern(c, 340, 250, 1.3, '#5a9a42') + fern(c, 200, 252, 0.9, FERN);
      o += canopyTop(c, 1715, '#2a4a22', 22) + crowns(1716, 6, 0, 20, '#3a5a2a', '#6a8a3a') + vines(c, 1717, 5, 60, 360, 30, 80, '#4a6a2a');
      return o + motes(1719, 28, 0, 400, 30, 210) + vignette(c, '#fff8d0', '#0a0e06');
    },
    maraudon_gate: function (c) {
      var o = sky(c, '#8e8c98', '#bdb6ae', '#d8ccb8') + sun(c, 60, 50, 10, '#f4ead8') + cloud(250, 34, 1, 0.4, '#e4dcd0');
      o += mesas(c, 1801, 118, '#a8a094', 9) + haze(c, 116, 16, 0.4, '#e0d8cc');
      o += hills(c, 1803, 130, 30, '#9a9286', 50);
      o += caveMouth(c, 214, 150, 76, 58);
      o += body(c, 'M-4,242 L-4,80 L20,70 L40,90 L56,110 L76,140 L96,170 L120,242 Z', '#7a746a', F('M20,70 L40,90 L56,110 L76,140 L96,170 L120,242 L80,242 L60,170 L40,120 Z', '#56524a', 0.7) + L('M10,100 L24,130 M30,150 L44,180', '#5a564e', 1.4), 2);
      o += body(c, 'M404,242 L404,90 L380,84 L360,110 L340,150 L330,190 L310,242 Z', '#80796e', F('M404,90 L380,84 L372,110 L360,160 L354,242 L404,242 Z', '#56524a', 0.6), 2);
      o += body(c, 'M-4,176 C80,160 170,152 240,154 C300,156 350,166 404,174 L404,242 L-4,242 Z', DES, R(-4, 150, 408, 94, c.lg([[0, '#c0b8a8', 0.35], [1, '#3a362e', 0.85]])), 1.6);
      o += F('M170,156 C200,152 240,152 262,156 C250,176 280,210 300,242 L130,242 C150,210 180,180 170,156 Z', '#c8a0e8', 0.12);
      o += cracks(1805, 170, 236, '#5a544a', 22) + pebbles(1806, 172, 236, '#6a645a', 16);
      o += cTent(c, 80, 184, 1, '#9a7a56') + cTent(c, 330, 186, 0.9, '#8a6e50') + horseTail(c, 128, 196, 50, 1) + horseTail(c, 290, 196, 46, 0.9, '#5a3a24');
      o += deadTree(c, 380, 214, 1.1, '#4e463c') + deadTree(c, 30, 214, 0.9, '#4e463c') + skull(c, 176, 222, 1) + bone(196, 228, 18, 0.2, 1) + bone(260, 218, 14, -0.8, 0.8);
      o += campfire(c, 36, 226, 0.5) + rock(c, 240, 232, 26, 12, '#7a746a') + rock(c, 130, 236, 18, 8, '#8a8478');
      o += grass(1807, 190, 238, '#6a6448', 16, 0.6, 1.2, 1);
      return o + motes(1809, 14, 0, 400, 60, 220, '#e8e0d4') + vignette(c, '#f4ece0', '#0e0c0a');
    }
  };

  // ============================================================
  //  FERALAS MOB PIECES
  // ============================================================
  function hoof(x, y, col) { return P(pd([[x - 5, y - 7], [x + 4, y - 7], [x + 6, y + 1], [x - 7, y + 1]], true), c_(col || '#3a2a22'), 1.8) + L('M' + pt([x - 1, y - 5]) + 'L' + pt([x - 1, y + 1]), OL, 1); }
  // bird foot: three toes forward, one back, dark claws
  function talons(x, y, col, k) {
    k = k || 1; var d = 'M' + pt([x, y - 3 * k]) + 'L' + pt([x - 10 * k, y]) + 'M' + pt([x, y - 3 * k]) + 'L' + pt([x - 5 * k, y + 1]) + 'M' + pt([x, y - 3 * k]) + 'L' + pt([x + 1 * k, y + 1]) + 'M' + pt([x, y - 3 * k]) + 'L' + pt([x + 6 * k, y - 1 * k]);
    var cl = 'M' + pt([x - 10 * k, y]) + 'l-2.4,2 M' + pt([x - 5 * k, y + 1]) + 'l-2,2 M' + pt([x + 1 * k, y + 1]) + 'l-1,2.2 M' + pt([x + 6 * k, y - 1 * k]) + 'l2,1.6';
    return L(d, OL, 5 * k) + L(d, col, 2.4 * k) + L(cl, OL, 2.4 * k);
  }
  // feathered wing in local space: root (0,0), reaching along +x, leading edge on -y, fingered primaries
  function wing(c, col, tip, cov, lines) {
    var d = 'M0,-6 C12,-16 30,-20 50,-16 C62,-14 76,-12 90,-6 L84,0 L91,5 L80,6 L86,13 L74,12 L78,20 L66,17 L68,26 L56,21 L56,30 L46,24 L44,32 L34,25 L30,31 L22,24 L16,28 L10,20 L2,17 Z';
    var cv = 'M2,-4 C14,-13 30,-16 50,-12 C60,-10 68,-8 74,-6 L70,2 L60,4 L52,10 L42,8 L34,14 L24,10 L14,14 L6,8 Z';
    return body(c, d, col, F(pd([[58, -22], [98, -22], [98, 36], [52, 36], [58, 2]], true), tip, 0.95) + F('M20,12 L60,8 L98,4 L98,40 L10,40 Z', dk(col, 0.25), 0.55) +
      L(lines || 'M50,-12 L56,24 M58,-10 L66,20 M66,-8 L76,16 M74,-6 L84,10 M40,-12 L44,28 M30,-12 L32,26 M20,-10 L20,22', dk(col, 0.45), 1.1) + P(cv, cov || lt(col, 0.14), 1.2), 2.2);
  }
  function scimitar(c, p, len, ang, col) {
    col = col || '#c8ccd4'; var q = dirQ(p, ang);
    var bl = 'M' + pt(q(4, -2.4)) + 'C' + pt(q(len * 0.5, -4)) + ' ' + pt(q(len * 0.85, -2)) + ' ' + pt(q(len + 2, 6)) + 'C' + pt(q(len * 0.8, 6)) + ' ' + pt(q(len * 0.45, 5)) + ' ' + pt(q(4, 2.4)) + 'Z';
    return limb('M' + pt(q(-7, 0)) + 'L' + pt(q(2, 0)), '#4a2a3a', 3) + P(bl, c.cel(col), 1.6) + L('M' + pt(q(8, -1.2)) + 'C' + pt(q(len * 0.5, -2.4)) + ' ' + pt(q(len * 0.8, -1)) + ' ' + pt(q(len - 2, 3)), '#ffffff', 0.9, 0.7) + P(pd([q(2, -5.5), q(4.5, -5.5), q(4.5, 5.5), q(2, 5.5)], true), c.cel('#d8b040'), 1.1);
  }
  function trident(c, bot, top, col) {
    var dx = top[0] - bot[0], dy = top[1] - bot[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux, q = function (u, v) { return [top[0] + ux * u + px * v, top[1] + uy * u + py * v]; };
    var pr = 'M' + pt(q(0, -7)) + 'L' + pt(q(0, 7)) + 'M' + pt(q(0, -7)) + 'L' + pt(q(12, -7)) + 'M' + pt(q(0, 7)) + 'L' + pt(q(12, 7)) + 'M' + pt(q(0, 0)) + 'L' + pt(q(16, 0));
    return limb('M' + pt(bot) + 'L' + pt(top), '#6a4a3a', 2.8) + L(pr, OL, 5) + L(pr, col || '#e0b848', 2.6) + P(pd([q(11, -9.5), q(17, -7), q(11, -4.5)], true) + pd([q(11, 4.5), q(17, 7), q(11, 9.5)], true) + pd([q(15, -2.5), q(22, 0), q(15, 2.5)], true), c.cel(col || '#e0b848'), 1.1) + C(top[0], top[1], 2.6, c.cel('#e8f4ff'), 1);
  }
  // ---- hippogryph (new rig): standing or rearing on the hind legs, wings folded or spread; facing left ----
  function eHead(c, x, y, o) {
    var hc = o.head, bk = o.beak || '#e8c050', s = '';
    if (o.antlers) {
      var an = 'M' + pt([x + 1, y - 12]) + 'L' + pt([x - 3, y - 26]) + 'L' + pt([x - 11, y - 33]) + 'M' + pt([x - 2, y - 22]) + 'L' + pt([x + 5, y - 32]) + 'L' + pt([x + 3, y - 42]) + 'M' + pt([x + 4, y - 30]) + 'L' + pt([x + 11, y - 36]);
      var af = 'M' + pt([x + 8, y - 11]) + 'L' + pt([x + 14, y - 25]) + 'L' + pt([x + 23, y - 31]) + 'M' + pt([x + 14, y - 22]) + 'L' + pt([x + 12, y - 35]) + 'M' + pt([x + 20, y - 29]) + 'L' + pt([x + 29, y - 27]);
      s += L(af, OL, 5) + L(af, dk(o.antlers, 0.15), 2.6) + L(an, OL, 5.4) + L(an, o.antlers, 3) + L('M' + pt([x - 2, y - 25]) + 'L' + pt([x - 9, y - 32]), lt(o.antlers, 0.4), 1, 0.8);
    }
    s += P(pd([[x + 3, y - 11], [x + 22, y - 19], [x + 14, y - 8], [x + 27, y - 6], [x + 14, y - 1], [x + 23, y + 7], [x + 8, y + 5]], true), c.cel(o.crest || dk(hc, 0.12)), 1.6);
    var hd = 'M' + pt([x + 10, y + 6]) + 'C' + pt([x + 13, y - 4]) + ' ' + pt([x + 6, y - 14]) + ' ' + pt([x - 3, y - 14]) + 'C' + pt([x - 10, y - 13]) + ' ' + pt([x - 13, y - 8]) + ' ' + pt([x - 14, y - 3]) + 'L' + pt([x - 13, y + 4]) + 'C' + pt([x - 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x + 10, y + 6]) + 'Z';
    s += body(c, hd, hc, F(pd([[x + 2, y - 16], [x + 16, y - 16], [x + 16, y + 14], [x + 4, y + 14]], true), dk(hc, 0.22), 0.75) + F(pd([[x - 14, y - 7], [x - 3, y - 7], [x + 8, y - 3], [x + 3, y + 1], [x - 13, y + 1]], true), o.mask || dk(hc, 0.3), 0.9) + (o.headMark || ''), 2.2);
    if (o.open) s += F(pd([[x - 12, y + 1], [x - 23, y + 2], [x - 23, y + 10], [x - 11, y + 6]], true), '#5a1018') + P('M' + pt([x - 12, y + 3]) + 'L' + pt([x - 24, y + 10]) + 'C' + pt([x - 22, y + 13]) + ' ' + pt([x - 16, y + 12]) + ' ' + pt([x - 10, y + 7]) + 'Z', c.cel(dk(bk, 0.1)), 1.5) + F(pd([[x - 20, y + 6], [x - 13, y + 4], [x - 14, y + 7]], true), '#c8505a');
    else s += P('M' + pt([x - 12, y + 2]) + 'L' + pt([x - 21, y + 5]) + 'C' + pt([x - 19, y + 8]) + ' ' + pt([x - 14, y + 8]) + ' ' + pt([x - 10, y + 6]) + 'Z', c.cel(dk(bk, 0.1)), 1.5);
    s += P('M' + pt([x - 11, y - 8]) + 'C' + pt([x - 18, y - 9]) + ' ' + pt([x - 25, y - 4]) + ' ' + pt([x - 26, y + 3]) + 'C' + pt([x - 26, y + 7]) + ' ' + pt([x - 24, y + 8]) + ' ' + pt([x - 23, y + 5]) + 'C' + pt([x - 22, y + 2]) + ' ' + pt([x - 18, y + 1]) + ' ' + pt([x - 11, y + 2]) + 'Z', c.cel(bk), 1.6) + C(x - 16, y - 4, 0.9, OL) + L('M' + pt([x - 12, y - 8]) + 'L' + pt([x - 12, y + 2]), dk(bk, 0.35), 1);
    return s + gEye(c, x - 6, y - 4, 1.7, o.eye || '#ffc830') + L('M' + pt([x - 13, y - 9]) + 'L' + pt([x + 1, y - 7]), OL, 2.6);
  }
  function eLeg(c, pts, fcol, lcol) {
    var e = pts[2];
    return limb(pd(pts.slice(0, 2)), fcol, 9) + limb(pd(pts.slice(1)), lcol, 5) + L('M' + pt(lerp2(pts[1], e, 0.35)) + 'l3,0 M' + pt(lerp2(pts[1], e, 0.6)) + 'l3,0', dk(lcol, 0.4), 1) + talons(e[0], e[1] + 3, lcol);
  }
  function hippo(c, o) {
    var bc = o.body, hc = o.head, wc = o.wing, tp = o.tip, lg = o.leg || '#d8b040', s = shadow(c, 70, 52), fr = '';
    s += limb('M100,84 L110,100 L106,114', dk(bc, 0.25), 8) + hoof(106, 120, '#2e221c');
    var fw = o.rear ? 'translate(60,62) rotate(-128) scale(0.9,-0.9)' : 'translate(60,60) rotate(-34) scale(0.78)';
    var nw = o.rear ? 'translate(66,64) rotate(-66)' : 'translate(64,64) rotate(-10) scale(0.86)';
    fr += G(wing(c, dk(wc, 0.18), dk(tp, 0.15), dk(wc, 0.05)), fw);
    fr += feather(c, 108, 78, -0.2, 26, dk(bc, 0.1), tp) + feather(c, 108, 80, 0.3, 24, bc, tp) + feather(c, 108, 82, 0.75, 20, dk(bc, 0.15), tp);
    fr += eLeg(c, o.rear ? [[54, 86], [44, 98], [34, 96]] : [[56, 86], [54, 100], [52, 115]], dk(hc, 0.18), dk(lg, 0.15));
    var bd = 'M42,78 C44,66 62,60 86,62 C104,63 114,72 112,84 C110,94 98,98 82,97 C64,98 50,94 44,88 Z';
    fr += body(c, bd, bc, F('M30,86 C52,98 92,100 118,86 L118,104 L30,104 Z', lt(bc, 0.14), 0.75) + F('M70,58 C86,56 102,60 110,68 L110,78 C98,70 86,68 70,70 Z', dk(bc, 0.2), 0.6) + (o.bodyMark || ''), 2.4);
    fr += P('M38,66 L64,60 C60,72 60,84 64,98 L57,93 L54,100 L49,91 L42,95 L42,86 Z', c.cel(hc), 2);
    fr += body(c, 'M36,82 C28,70 24,56 26,44 L44,40 C46,54 52,64 62,72 Z', hc, F('M40,36 L60,36 L60,84 L46,84 C44,66 44,52 40,36 Z', dk(hc, 0.2), 0.7) + L('M31,54 l5,3 M29,63 l6,3 M35,71 l5,2', dk(hc, 0.25), 1.1), 2.2);
    fr += P(pd([[43, 42], [52, 44], [47, 50], [56, 54], [50, 58], [58, 64], [52, 66]], true), c.cel(dk(hc, 0.06)), 1.2);
    fr += eHead(c, 30, 32, o);
    fr += eLeg(c, o.rear ? [[48, 86], [34, 94], [24, 90]] : [[48, 86], [42, 100], [38, 115]], hc, lg);
    fr += G(wing(c, wc, tp), nw);
    s += o.rear ? G(fr, 'rotate(24 92 90)') : fr;
    s += limb('M90,86 L100,102 L94,114', bc, 9) + hoof(94, 120, '#3a2a22') + L('M84,80 C90,78 98,82 100,90', dk(bc, 0.3), 1.2);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- Woodpaw gnoll (new head: big round hyena ears, dark mask, a black mane down the back) ----
  function gwHead(c, x, y, o) {
    var f = o.fur, s = '', mane = o.mane || '#2e1a10';
    s += P(pd([[x - 2, y - 12], [x + 3, y - 22], [x + 7, y - 12], [x + 13, y - 20], [x + 14, y - 8], [x + 22, y - 12], [x + 19, y], [x + 27, y + 1], [x + 20, y + 8], [x + 26, y + 14], [x + 12, y + 12]], true), c.cel(mane), 1.8);
    s += P('M' + pt([x + 8, y - 8]) + 'C' + pt([x + 8, y - 20]) + ' ' + pt([x + 18, y - 26]) + ' ' + pt([x + 21, y - 18]) + 'C' + pt([x + 22, y - 12]) + ' ' + pt([x + 17, y - 7]) + ' ' + pt([x + 12, y - 5]) + 'Z', c.cel(dk(f, 0.15)), 1.8);
    var hd = 'M' + pt([x + 11, y + 2]) + 'C' + pt([x + 11, y - 10]) + ' ' + pt([x + 1, y - 14]) + ' ' + pt([x - 8, y - 10]) + 'L' + pt([x - 22, y - 3]) + 'C' + pt([x - 27, y - 1]) + ' ' + pt([x - 27, y + 5]) + ' ' + pt([x - 23, y + 6]) + 'L' + pt([x - 10, y + 10]) + 'C' + pt([x - 2, y + 14]) + ' ' + pt([x + 9, y + 12]) + ' ' + pt([x + 11, y + 2]) + 'Z';
    s += body(c, hd, f, F(pd([[x + 2, y - 16], [x + 14, y - 16], [x + 14, y + 16], [x + 4, y + 16]], true), dk(f, 0.25), 0.75) + F(pd([[x - 28, y - 4], [x - 8, y - 9], [x - 4, y - 2], [x - 10, y + 4], [x - 28, y + 3]], true), o.mask || '#3a2014', 0.9) +
      C(x + 3, y - 6, 1.6, dk(f, 0.45)) + C(x + 7, y + 1, 1.4, dk(f, 0.45)) + C(x - 1, y + 4, 1.3, dk(f, 0.45)) + F('M' + pt([x - 22, y + 6]) + 'L' + pt([x - 6, y + 8]) + 'L' + pt([x + 4, y + 16]) + 'L' + pt([x - 22, y + 16]) + 'Z', o.cream || '#d8b48a', 0.8), 2.2);
    if (o.open) s += P('M' + pt([x - 20, y + 5]) + 'L' + pt([x - 22, y + 13]) + 'C' + pt([x - 16, y + 17]) + ' ' + pt([x - 6, y + 15]) + ' ' + pt([x - 2, y + 10]) + 'Z', c.cel(dk(f, 0.1)), 1.6) + F(pd([[x - 20, y + 5.6], [x - 4, y + 9], [x - 8, y + 12], [x - 20, y + 10]], true), '#5a1014') +
      P(pd([[x - 19, y + 5], [x - 18, y + 9], [x - 16.6, y + 5.4]], true) + pd([[x - 13, y + 6], [x - 12, y + 10], [x - 10.6, y + 6.6]], true) + pd([[x - 17, y + 11], [x - 16, y + 7.6], [x - 14.6, y + 11]], true), '#f4ecd6', 0.7);
    else s += L('M' + pt([x - 22, y + 5]) + 'L' + pt([x - 8, y + 8]), OL, 1.5) + P(pd([[x - 19, y + 5.4], [x - 18, y + 9], [x - 16.6, y + 5.8]], true), '#f4ecd6', 0.7);
    s += E(x - 25.5, y + 0.5, 2.4, 2, '#140c08', 1);
    s += P('M' + pt([x + 1, y - 9]) + 'C' + pt([x - 3, y - 22]) + ' ' + pt([x + 7, y - 30]) + ' ' + pt([x + 12, y - 23]) + 'C' + pt([x + 14, y - 17]) + ' ' + pt([x + 10, y - 11]) + ' ' + pt([x + 6, y - 8]) + 'Z', c.cel(f), 1.9) + F('M' + pt([x + 3, y - 11]) + 'C' + pt([x + 1, y - 20]) + ' ' + pt([x + 7, y - 25]) + ' ' + pt([x + 10, y - 21]) + 'C' + pt([x + 11, y - 17]) + ' ' + pt([x + 8, y - 13]) + ' ' + pt([x + 6, y - 11]) + 'Z', '#5a3024', 0.9);
    s += (o.glow ? gEye(c, x - 8, y - 4, 1.6, o.glow) : E(x - 8, y - 4, 2.2, 1.6, o.eye || '#ffd040', 1) + E(x - 8.3, y - 4, 0.6, 1.2, OL)) + L('M' + pt([x - 14, y - 7]) + 'L' + pt([x - 2, y - 8]), OL, 2.4);
    return s + (o.headX ? o.headX(c, x, y) : '');
  }
  function gnollW(c, o) {
    var f = o.fur, sp = dk(f, 0.42);
    return biped(c, {
      skin: f, shirt: f, sleeve: f, pants: f, digi: true, feet: toes2, boots: dk(f, 0.3), glove: f, neck: false, hipY: 88, legW: 10, armW: 8.5, shadowR: 34,
      torsoD: 'M40,56 C44,44 72,42 82,50 L82,68 L78,90 L50,90 L46,72 Z',
      back: o.back,
      chest: function (c) { return F('M44,58 C50,52 62,54 66,60 L62,84 L50,84 Z', o.cream || '#d8b48a', 0.7) + mottle(o.seed || 31, 9, 60, 50, 82, 86, sp, sp, 1.6, 2.6)() + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return body(c, 'M48,86 L80,86 L82,96' + rag(82, 46, 100, 8, o.seed || 5) + 'Z', o.loin || '#5a4028', L('M50,88 L80,88', dk(o.loin || '#5a4028', 0.4), 1.2), 1.6) + (o.front ? o.front(c) : ''); },
      pads: function (c) { return P(pd([[44, 50], [52, 38], [60, 44], [66, 36], [72, 44], [80, 40], [84, 52], [74, 50], [60, 52]], true), c.cel(o.mane || '#2e1a10'), 1.6) + (o.pads ? o.pads(c) : ''); },
      shins: function (c) { return mottle((o.seed || 31) + 5, 5, 50, 96, 78, 112, sp, sp, 1.2, 2)(); },
      head: function (c) { return gwHead(c, 44, 42, o); },
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, top: o.top,
      tf: o.tf || at(0.96, 64, 122)
    });
  }
  // bark shoulder guard with leaves (Woodpaw)
  function barkPad(c, x, y, r) {
    var d = 'M' + pt([x - r, y + r * 0.4]) + 'C' + pt([x - r, y - r * 0.8]) + ' ' + pt([x + r, y - r * 0.9]) + ' ' + pt([x + r * 1.1, y + r * 0.3]) + 'L' + pt([x + r * 0.6, y + r * 0.1]) + 'L' + pt([x + r * 0.2, y + r * 0.5]) + 'L' + pt([x - r * 0.3, y + r * 0.1]) + 'Z';
    return body(c, d, '#7a5236', L('M' + pt([x - r * 0.6, y - r * 0.2]) + 'L' + pt([x - r * 0.2, y + r * 0.3]) + 'M' + pt([x, y - r * 0.6]) + 'L' + pt([x + r * 0.2, y + r * 0.3]) + 'M' + pt([x + r * 0.6, y - r * 0.4]) + 'L' + pt([x + r * 0.7, y + r * 0.1]), '#4a3020', 1), 1.6) + P(leafD(x - r * 0.4, y - r * 0.7, -1, r * 0.9), c.cel('#5a8a34'), 1) + P(leafD(x, y - r * 0.8, 1, r * 0.8), c.cel('#6a9a3a'), 1);
  }
  function rattle(c, p, ang, col) {
    var q = dirQ(p, ang), g = q(16, 0);
    return C(g[0], g[1], 12, glow(c, col || '#c8ff6a', 0.55)) + limb('M' + pt(q(-4, 0)) + 'L' + pt(q(12, 0)), '#8a6a44', 2.4) + body(c, ellD(g[0], g[1], 5.4, 5.4), '#c8a060', L('M' + pt([g[0] - 5, g[1]]) + 'L' + pt([g[0] + 5, g[1]]), '#7a4a2a', 1.4), 1.6) +
      bone(q(20, -4)[0], q(20, -4)[1], 7, ang + 1.2, 0.5) + bone(q(21, 5)[0], q(21, 5)[1], 7, ang - 1.1, 0.5) + L('M' + pt(q(12, 3)) + 'l2,6 M' + pt(q(12, -3)) + 'l-1,6', '#e8dcc0', 1.2);
  }
  // ---- Gordunni ogre (new rig: pear body, small head low on the chest, stubby legs) ----
  function oHead(c, x, y, o) {
    var sk = o.skin, s = '';
    s += P(pd([[x + 8, y - 4], [x + 18, y - 9], [x + 14, y + 4]], true), c.cel(dk(sk, 0.08)), 1.6);
    if (o.knot) s += P('M' + pt([x - 2, y - 13]) + 'C' + pt([x, y - 22]) + ' ' + pt([x + 10, y - 24]) + ' ' + pt([x + 12, y - 18]) + 'C' + pt([x + 8, y - 18]) + ' ' + pt([x + 6, y - 14]) + ' ' + pt([x + 6, y - 11]) + 'Z', c.cel(o.hair || '#1e1a18'), 1.6) + R(x + 1, y - 16, 5, 4, c.cel('#c8a040'), 1);
    var hd = 'M' + pt([x + 12, y + 2]) + 'C' + pt([x + 13, y - 10]) + ' ' + pt([x + 4, y - 16]) + ' ' + pt([x - 4, y - 15]) + 'C' + pt([x - 12, y - 14]) + ' ' + pt([x - 15, y - 8]) + ' ' + pt([x - 15, y - 2]) + 'L' + pt([x - 17, y + 5]) + 'C' + pt([x - 18, y + 13]) + ' ' + pt([x - 10, y + 17]) + ' ' + pt([x, y + 17]) + 'C' + pt([x + 8, y + 17]) + ' ' + pt([x + 12, y + 11]) + ' ' + pt([x + 12, y + 2]) + 'Z';
    s += body(c, hd, sk, F(pd([[x + 3, y - 18], [x + 16, y - 18], [x + 16, y + 20], [x + 4, y + 20]], true), dk(sk, 0.25), 0.75) + F('M' + pt([x - 18, y + 8]) + 'C' + pt([x - 10, y + 12]) + ' ' + pt([x, y + 12]) + ' ' + pt([x + 8, y + 8]) + 'L' + pt([x + 8, y + 20]) + 'L' + pt([x - 18, y + 20]) + 'Z', lt(sk, 0.12), 0.7) + (o.faceX ? o.faceX(c, x, y) : ''), 2.2);
    s += P('M' + pt([x - 16, y - 3]) + 'C' + pt([x - 12, y - 10]) + ' ' + pt([x - 1, y - 10]) + ' ' + pt([x + 5, y - 6]) + 'L' + pt([x + 4, y - 3]) + 'C' + pt([x - 2, y - 6]) + ' ' + pt([x - 11, y - 6]) + ' ' + pt([x - 15, y]) + 'Z', c.cel(dk(sk, 0.28)), 1.3);
    s += (o.glow ? gEye(c, x - 10, y - 1, 1.5, o.glow) + gEye(c, x - 2, y - 1.4, 1.3, o.glow) : C(x - 10, y - 1, 1.8, o.eye || '#ffe060', 0.9) + C(x - 2, y - 1.4, 1.6, o.eye || '#ffe060', 0.9) + C(x - 10.4, y - 1, 0.7, OL) + C(x - 2.4, y - 1.4, 0.6, OL));
    s += E(x - 16, y + 3.5, 3.4, 2.8, c.cel(dk(sk, 0.08)), 1.3);
    s += L('M' + pt([x - 17, y + 10]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 2, y + 13]) + ' ' + pt([x + 4, y + 10]), OL, 1.8) + P(pd([[x - 15, y + 10.5], [x - 16, y + 3], [x - 12, y + 9.6]], true), '#f0e8d0', 1) + P(pd([[x - 6, y + 11.4], [x - 5.6, y + 4.4], [x - 2.4, y + 10.8]], true), '#f0e8d0', 1);
    if (o.earring) s += L(ellD(x + 13, y + 5, 2, 2.6), OL, 2.2) + L(ellD(x + 13, y + 5, 2, 2.6), '#d8b040', 1);
    return s + (o.hat ? o.hat(c, x, y) : '');
  }
  function ogreFoot(x, y, col) { return P('M' + pt([x + 8, y - 8]) + 'L' + pt([x + 9, y + 1]) + 'L' + pt([x - 12, y + 1]) + 'C' + pt([x - 14, y - 4]) + ' ' + pt([x - 10, y - 8]) + ' ' + pt([x - 4, y - 8]) + 'Z', c_(col), 2) + L('M' + pt([x - 8, y - 2]) + 'l0,3 M' + pt([x - 3, y - 1]) + 'l0,2.4', OL, 1.1); }
  function ogre(c, o) {
    var sk = o.skin, dsk = dk(sk, 0.2), s = shadow(c, 66, 46), fh = o.far || [[94, 50], [104, 70], [100, 88]], nh = o.near || [[42, 52], [30, 68], [26, 58]];
    if (o.back) s += o.back(c);
    s += limb(pd(fh.slice(0, 2)), o.farSleeve || dsk, 14) + limb(pd(fh.slice(1)), dsk, 13);
    if (o.wFar) s += o.wFar(c, fh[2]);
    s += C(fh[2][0], fh[2][1], 6.4, c.cel(dsk), 2);
    if (!o.robe) s += limb('M78,96 L82,110 L82,116', dsk, 17) + ogreFoot(84, 121, dk(sk, 0.3)) + limb('M54,96 L50,110 L50,116', sk, 18) + ogreFoot(50, 121, dk(sk, 0.22));
    var bd = 'M32,72 C28,52 42,36 64,34 C88,32 104,46 106,66 C108,86 100,100 84,104 L50,104 C38,100 32,88 32,72 Z';
    s += body(c, bd, o.shirt || sk, F('M40,76 C46,64 70,62 86,72 C94,86 88,102 70,104 C54,104 42,96 40,76 Z', lt(o.shirt || sk, 0.12), 0.7) + F('M78,30 C98,36 110,52 110,70 L110,108 L86,108 C100,92 100,56 78,30 Z', dk(o.shirt || sk, 0.25), 0.8) + (o.chest ? o.chest(c) : ''), 2.6);
    if (o.front) s += o.front(c);
    if (o.head2) s += o.head2(c);
    s += oHead(c, o.hx || 44, o.hy || 32, o);
    if (o.pads) s += o.pads(c);
    if (o.wNear) s += o.wNear(c, nh[2]);
    s += limb(pd(nh.slice(0, 2)), o.nearSleeve || sk, 15) + limb(pd(nh.slice(1)), sk, 13.5) + C(nh[2][0], nh[2][1], 7, c.cel(sk), 2) + L('M' + pt([nh[2][0] - 5, nh[2][1] - 2]) + 'l4,1 M' + pt([nh[2][0] - 5, nh[2][1] + 2]) + 'l4,0', OL, 1.1);
    if (o.wNearFront) s += o.wNearFront(c, nh[2]);
    if (o.top) s += o.top(c);
    return G(s, o.tf || at(1, 64, 122));
  }
  function spikedClub(c, p, len, ang) {
    var q = dirQ(p, ang), col = '#7a5434', o = haft(c, p, len * 0.5, ang, '#5a3a22', 4.4, 8);
    var hd = 'M' + pt(q(len * 0.36, -4)) + 'C' + pt(q(len * 0.66, -9)) + ' ' + pt(q(len + 2, -11)) + ' ' + pt(q(len + 4, 0)) + 'C' + pt(q(len + 2, 11)) + ' ' + pt(q(len * 0.66, 9)) + ' ' + pt(q(len * 0.36, 4)) + 'Z';
    [[0.6, -8, -1], [0.8, -10, -1], [0.98, -7, -1], [0.7, 9, 1], [0.9, 10, 1], [1.05, 2, 1]].forEach(function (k) { var b = q(len * k[0], k[1]); o += L('M' + pt(b) + 'L' + pt(q(len * k[0] + 2, k[1] + k[2] * 6)), OL, 3.2) + L('M' + pt(b) + 'L' + pt(q(len * k[0] + 2, k[1] + k[2] * 6)), '#b8bcc4', 1.4); });
    return o + body(c, hd, col, L('M' + pt(q(len * 0.55, -7)) + 'L' + pt(q(len * 0.55, 7)) + 'M' + pt(q(len * 0.85, -9)) + 'L' + pt(q(len * 0.85, 9)), '#5a5a62', 3) + F(pd([q(len * 0.3, 1), q(len + 6, 1), q(len + 6, 12), q(len * 0.3, 12)], true), dk(col, 0.3), 0.7), 2);
  }
  // ---- Hatecrest naga (new rig on the shared biped: S-coiled tail with a dorsal frill, sail-crested heads) ----
  function nHeadM(c, x, y, o) {
    var sc = o.col, fin = o.fin, s = '';
    s += P(pd([[x - 5, y - 10], [x - 8, y - 27], [x + 1, y - 17], [x + 3, y - 34], [x + 9, y - 17], [x + 16, y - 31], [x + 16, y - 13], [x + 27, y - 20], [x + 21, y - 5], [x + 31, y - 3], [x + 16, y + 3], [x + 8, y - 3]], true), c.cel(fin), 1.8) +
      L('M' + pt([x - 2, y - 12]) + 'L' + pt([x - 6, y - 24]) + 'M' + pt([x + 5, y - 12]) + 'L' + pt([x + 3, y - 30]) + 'M' + pt([x + 11, y - 10]) + 'L' + pt([x + 15, y - 27]) + 'M' + pt([x + 15, y - 5]) + 'L' + pt([x + 25, y - 17]), dk(fin, 0.4), 1.2);
    if (o.crown) s += o.crown(c, x, y);
    var hd = 'M' + pt([x + 10, y - 4]) + 'C' + pt([x + 8, y - 12]) + ' ' + pt([x - 4, y - 14]) + ' ' + pt([x - 10, y - 9]) + 'L' + pt([x - 22, y - 4]) + 'C' + pt([x - 26, y - 2]) + ' ' + pt([x - 26, y + 3]) + ' ' + pt([x - 22, y + 4]) + 'L' + pt([x - 16, y + 6]) + 'C' + pt([x - 12, y + 12]) + ' ' + pt([x - 2, y + 14]) + ' ' + pt([x + 6, y + 11]) + 'C' + pt([x + 11, y + 8]) + ' ' + pt([x + 12, y + 2]) + ' ' + pt([x + 10, y - 4]) + 'Z';
    s += P('M' + pt([x - 17, y + 4]) + 'L' + pt([x - 22, y + 13]) + 'C' + pt([x - 16, y + 17]) + ' ' + pt([x - 6, y + 16]) + ' ' + pt([x, y + 10]) + 'Z', c.cel(dk(sc, 0.1)), 1.6) + F(pd([[x - 17, y + 4.4], [x - 1, y + 8], [x - 6, y + 12], [x - 19, y + 10]], true), '#4a0e20');
    s += body(c, hd, sc, F(pd([[x + 1, y - 18], [x + 14, y - 18], [x + 14, y + 16], [x + 2, y + 16]], true), dk(sc, 0.25), 0.8) + C(x - 3, y - 9, 1.4, dk(sc, 0.35)) + C(x + 2, y - 6, 1.2, dk(sc, 0.35)) + C(x - 8, y - 7, 1, dk(sc, 0.35)) + L('M' + pt([x - 22, y - 1]) + 'L' + pt([x - 10, y - 5]), lt(sc, 0.3), 1.1, 0.8), 2.2);
    s += P(pd([[x - 20, y + 4], [x - 19, y + 9], [x - 17.6, y + 4.4]], true) + pd([[x - 13, y + 5], [x - 12, y + 10], [x - 10.6, y + 5.6]], true) + pd([[x - 18, y + 12], [x - 17, y + 8], [x - 15.6, y + 12]], true), '#f4ecd6', 0.7);
    s += P(pd([[x + 2, y - 2], [x + 16, y - 9], [x + 13, y + 1], [x + 19, y + 6], [x + 4, y + 5]], true), c.cel(fin), 1.4);
    var bb = 'M' + pt([x - 14, y + 13]) + 'Q' + pt([x - 19, y + 21]) + ' ' + pt([x - 13, y + 27]) + 'M' + pt([x - 8, y + 14]) + 'Q' + pt([x - 10, y + 22]) + ' ' + pt([x - 4, y + 26]);
    s += L(bb, OL, 3.2) + L(bb, fin, 1.5);
    return s + gEye(c, x - 9, y - 5, 1.6, o.eye || '#ffe040') + L('M' + pt([x - 16, y - 7]) + 'L' + pt([x - 3, y - 10]), OL, 2.4) + E(x - 22.5, y - 0.6, 1.2, 1, OL);
  }
  function nHeadF(c, x, y, o) {
    var sc = o.col, hc = o.hair, s = '';
    [[[x + 4, y - 10], [x + 18, y - 4], [x + 24, y + 12], [x + 36, y + 26]], [[x + 2, y - 6], [x + 12, y + 4], [x + 14, y + 20], [x + 24, y + 36]], [[x + 6, y - 12], [x + 24, y - 12], [x + 34, y - 2], [x + 44, y + 6]]].forEach(function (pp, i) {
      var T = taper(pp, 10, 2.4, 6), cc = i === 1 ? dk(hc, 0.15) : hc;
      s += body(c, T.d, cc, L(along(T, 0.5), lt(cc, 0.3), 1, 0.8) + C(pp[3][0], pp[3][1], 2, o.fin), 1.6);
    });
    s += P(pd([[x - 6, y - 12], [x - 6, y - 24], [x, y - 15], [x + 4, y - 27], [x + 8, y - 15], [x + 14, y - 22], [x + 13, y - 9]], true), c.cel(o.fin), 1.6);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, o.face || sc, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 16]) + 'L' + pt([x + 1, y + 16]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(o.face || sc, 0.22), 0.8) + C(x + 4, y + 6, 1, dk(sc, 0.3)) + C(x + 6, y + 2, 0.9, dk(sc, 0.3)), 2);
    s += P(pd([[x + 3, y - 1], [x + 18, y - 12], [x + 15, y - 2], [x + 22, y + 3], [x + 5, y + 5]], true), c.cel(o.fin), 1.4);
    s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 5]) + 'C' + pt([x + 2, y - 9]) + ' ' + pt([x - 4, y - 9]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 1.8);
    s += C(x - 1, y - 11, 2, c.cel('#f4f0ff'), 0.9) + L('M' + pt([x - 8, y - 9]) + 'Q' + pt([x - 1, y - 13]) + ' ' + pt([x + 7, y - 9]), '#e0b848', 1.4);
    return s + gEye(c, x - 5, y - 1, 1.5, o.eye || '#aaffee') + L('M' + pt([x - 9, y - 5]) + 'L' + pt([x - 1, y - 6.4]), OL, 1.8) + L('M' + pt([x - 8, y + 7]) + 'Q' + pt([x - 5.5, y + 8.6]) + ' ' + pt([x - 3, y + 7]), '#4a0e2a', 1.4);
  }
  function nagaH(c, o) {
    var sc = o.col, bel = o.belly || '#f0c890', fin = o.fin || '#e8a040';
    var T = taper(o.tail || [[66, 82], [58, 98], [44, 108], [50, 119], [82, 120], [106, 112], [118, 96], [114, 78]], o.tw || 26, 4, 6);
    return biped(c, {
      skin: sc, shirt: o.torso || sc, sleeve: o.sleeve || sc, forearm: o.forearm, glove: sc, noLegs: true, shadow: false, armW: o.armW || 8.5, hipY: 84, neck: o.neck,
      torsoD: o.torsoD || 'M44,50 C50,43 78,43 84,50 L80,68 L74,86 L54,86 L48,68 Z',
      back: function (c) {
        var s = shadow(c, 80, 46) + (o.back ? o.back(c) : ''), sp = '';
        for (var i = 4; i < T.s.length - 3; i += 3) { var p0 = T.b[i], p1 = T.b[i + 2], m = lerp2(p0, p1, 0.5), dx = T.b[i + 1][0] - T.a[i + 1][0], dy = T.b[i + 1][1] - T.a[i + 1][1], dd = Math.sqrt(dx * dx + dy * dy) || 1; sp += 'M' + pt(p0) + 'L' + pt([m[0] + dx / dd * 7, m[1] + dy / dd * 7]) + 'L' + pt(p1) + 'Z'; }
        s += P(sp, c.cel(fin), 1.2);
        s += body(c, T.d, sc, F(ribbonBand(T, 0, 0.4), bel, 0.95) + L(bands(T, 3, 3), dk(bel, 0.35), 1.1, 0.8) + F(ribbonBand(T, 0.72, 1), dk(sc, 0.28), 0.75) + L(along(T, 0.56), lt(sc, 0.25), 1, 0.7), 2.4);
        var tip = T.s[T.s.length - 1];
        s += P(pd([[tip[0] - 3, tip[1] + 3], [tip[0] - 4, tip[1] - 14], [tip[0] + 4, tip[1] - 6], [tip[0] + 10, tip[1] - 14], [tip[0] + 8, tip[1] + 2]], true), c.cel(fin), 1.4);
        return s + (o.back2 ? o.back2(c) : '');
      },
      chest: function (c) { return (o.female ? '' : L('M52,58 Q60,63 68,58 M54,68 Q60,71 66,68 M56,77 Q60,79 64,77', dk(sc, 0.3), 1.3)) + F('M54,62 L72,62 L70,86 L56,86 Z', bel, 0.5) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return body(c, 'M49,80 L79,80 L81,90 L74,88 L70,96 L64,89 L58,97 L55,89 L47,92 Z', o.belt || '#3a2a4a', L('M50,83 L79,83', o.beltTrim || '#e0b848', 1.4), 1.8) + (o.front ? o.front(c) : ''); },
      pads: o.pads, top: o.top,
      head: function (c, x, y) { return (o.female ? nHeadF : nHeadM)(c, x, y, o); }, hx: o.hx || 58, hy: o.hy || 32,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      tf: o.tf || at(o.scale || 1, 64, 122)
    });
  }
  function shellPad(c, x, y, r, col) {
    var d = 'M' + pt([x - r, y + r * 0.3]) + 'C' + pt([x - r, y - r]) + ' ' + pt([x + r, y - r]) + ' ' + pt([x + r, y + r * 0.3]) + 'Z', rib = '';
    for (var i = 0; i < 5; i++) { var a = PI + i * PI / 4; rib += 'M' + pt([x, y + r * 0.3]) + 'L' + pt([x + Math.cos(a) * r * 0.9, y + r * 0.3 + Math.sin(a) * r * 1.1]); }
    return body(c, d, col || '#e8c8a0', L(rib, dk(col || '#e8c8a0', 0.35), 1.1), 1.6);
  }
  function waterOrb(c, x, y, r) {
    var sw = 'M' + pt([x + r * 0.7, y]) + 'C' + pt([x + r * 0.7, y - r * 0.8]) + ' ' + pt([x - r * 0.6, y - r * 0.9]) + ' ' + pt([x - r * 0.7, y - r * 0.1]) + 'C' + pt([x - r * 0.7, y + r * 0.6]) + ' ' + pt([x + r * 0.2, y + r * 0.7]) + ' ' + pt([x + r * 0.3, y + r * 0.1]);
    return C(x, y, r * 2.6, glow(c, '#6ad8ff', 0.6)) + C(x, y, r, c.rg([[0, '#f0ffff'], [0.5, '#8ae4ff'], [1, '#2a8ad0']]), 1.6) + L(sw, '#ffffff', 1.4, 0.9) +
      P('M' + pt([x - r * 1.6, y - r * 0.9]) + 'q-2,3 0,4 q2,-1 0,-4Z', '#aaf0ff', 0.8) + P('M' + pt([x + r * 1.4, y - r * 1.3]) + 'q-2,3 0,4 q2,-1 0,-4Z', '#aaf0ff', 0.8) + P('M' + pt([x + r * 0.2, y + r * 1.6]) + 'q-2,3 0,4 q2,-1 0,-4Z', '#aaf0ff', 0.8);
  }
  // ---- Longtooth runner: wolf in full gallop, long sabre fangs (new rig, facing left) ----
  function runWolf(c, o) {
    var col = o.col, bel = o.belly || lt(col, 0.4), sad = o.saddle || dk(col, 0.3), dcol = dk(col, 0.22), s = shadow(c, 70, 48);
    var leg = function (d, cc, w, p) { return limb(d, cc, w) + E(p[0], p[1], 5, 3.4, c.cel(dk(cc, 0.25)), 1.8); };
    s += leg('M92,78 L100,96 L112,108 L118,116', dcol, 8, [118, 119]);
    s += leg('M52,82 L46,96 L36,100', dcol, 7.5, [33, 101]);
    s += body(c, taper([[104, 70], [114, 66], [124, 58], [127, 50]], 14, 4, 5).d, col, F('M112,60 L130,48 L130,72 Z', dk(col, 0.3), 0.7) + F('M120,52 L130,44 L130,56 Z', bel, 0.9), 2);
    var bd = 'M36,70 C40,58 64,54 88,58 C104,60 110,68 108,78 C106,86 94,88 78,86 C60,88 46,86 38,80 Z';
    s += body(c, bd, col, F('M30,80 C52,92 92,92 116,80 L116,100 L30,100 Z', bel, 0.85) + F('M56,54 C74,52 96,54 108,66 C94,62 76,62 58,64 Z', sad, 0.9) + L('M62,66 l4,6 M74,64 l4,7 M86,64 l3,6', dk(col, 0.35), 1.2), 2.4);
    s += P('M38,56 L48,50 L50,56 L58,52 L58,60 L64,62 L58,68 L62,74 L54,76 L54,84 L44,82 Z', c.cel(dk(col, 0.1)), 2);
    s += P('M34,56 L46,44 L44,58 Z', c.cel(dk(col, 0.15)), 1.8) + P('M38,56 L52,48 L48,60 Z', c.cel(col), 1.8) + P('M42,55 L49,50 L47,57 Z', '#3a2a2a', 0);
    var hd = 'M42,62 C38,54 28,52 20,56 L6,62 C2,64 1,68 4,70 L16,71 C22,76 34,76 40,70 C44,68 44,65 42,62 Z';
    s += P('M6,70 L20,72 L36,72 L32,79 C24,82 13,80 7,75 Z', c.cel(dk(col, 0.1)), 1.8) + F('M8,70.6 L34,72 L30,76 L10,74 Z', '#4a1014');
    s += body(c, hd, col, F('M32,50 L50,50 L50,80 L36,80 C42,72 42,60 32,50 Z', dk(col, 0.25), 0.7) + F('M8,62 C14,60 22,58 30,58 L28,62 C20,62 14,63 9,65 Z', dk(col, 0.3), 0.7) + F('M4,70 C12,72 24,74 38,72 L38,80 L4,80 Z', bel, 0.85));
    s += E(4.5, 64.6, 3, 2.4, '#1a1210', 1.2) + (o.glow ? gEye(c, 21, 60.5, 1.8, o.glow) : E(21, 60.5, 2.4, 1.5, o.eye || '#f0c040', 1) + E(20.6, 60.5, 0.7, 1.1, OL)) + L('M14,57 L28,58', OL, 2.4);
    s += P('M9,69 L10.4,80 L13,69.4 Z M17,70 L18.6,79 L21,70.4 Z', c.cel('#f8f2e0'), 0.9) + P('M24,73 L25,70.4 L26.6,73.4 Z M29,73 L30,70.6 L31.4,73.2 Z', '#f4ecd6', 0.6) + L('M8,62 L12,64 M12,60 L16,62', dk(col, 0.5), 1);
    s += leg('M50,78 L32,84 L16,84', col, 8.5, [12, 84]);
    s += leg('M90,80 L106,88 L118,92 L126,94', col, 8.5, [127, 95]);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- Wandering forest walker: treant (new rig) ----
  function treant(c, o) {
    var bk = o.bark || '#6a4a30', fol = o.leaf || '#4a7a2e', eye = o.eye || '#e8ff7a', s = shadow(c, 64, 44);
    var br = function (d, w, col) { return limb(d, col || bk, w) + L(d, lt(col || bk, 0.2), w * 0.3, 0.6); };
    s += F(shag(68, 26, 50, 26, 10, 0.3, 91), dk(fol, 0.3)) + F(shag(96, 34, 20, 14, 6, 0.3, 93), dk(fol, 0.35));
    s += br('M82,48 L100,36 L110,20', 8) + br('M104,30 L118,28', 4) + br('M108,24 L106,12', 3.4) + br('M110,20 L120,14', 3);
    s += br('M76,94 L86,108 L86,116', 12, dk(bk, 0.2)) + L('M86,116 L78,121 M86,116 L86,122 M86,116 L96,121', OL, 5.4) + L('M86,116 L78,121 M86,116 L86,122 M86,116 L96,121', dk(bk, 0.2), 3);
    var tr = 'M44,98 C40,80 40,58 44,40 C50,34 76,34 84,40 C88,58 88,80 84,98 C74,104 54,104 44,98 Z', gr = '';
    for (var i = 0; i < 5; i++) gr += 'M' + pt([48 + i * 8, 100]) + 'C' + pt([46 + i * 8, 80]) + ' ' + pt([50 + i * 8, 60]) + ' ' + pt([47 + i * 8, 40]);
    s += body(c, tr, bk, L(gr, dk(bk, 0.4), 1.4) + F('M70,34 L92,34 L92,104 L74,104 C80,80 78,56 70,34 Z', dk(bk, 0.3), 0.8) + E(52, 86, 7, 4, o.moss || '#6a8a3a', 0, 0.9) + E(78, 62, 5, 3, o.moss || '#6a8a3a', 0, 0.8) + E(48, 50, 4, 6, o.moss || '#6a8a3a', 0, 0.8), 2.4);
    s += P('M46,52 C52,46 62,46 68,50 C62,52 54,54 46,58 Z', c.cel(dk(bk, 0.15)), 1.6);
    s += F(ellD(52, 58, 5, 4), '#140c06') + F(ellD(64, 58, 4.4, 3.6), '#140c06') + gEye(c, 52, 58, 2, eye) + gEye(c, 64, 58, 1.8, eye);
    s += P('M50,72 C54,68 64,68 68,72 C64,78 54,78 50,72 Z', '#140c06', 1.4) + L('M52,72 L66,72', eye, 0.8, 0.5) + L('M50,66 L46,62 M68,66 L72,62', dk(bk, 0.45), 1.3);
    s += br('M56,94 L46,110 L42,116', 13) + L('M42,116 L32,121 M42,116 L42,122 M42,116 L52,122', OL, 6) + L('M42,116 L32,121 M42,116 L42,122 M42,116 L52,122', bk, 3.4);
    s += mushroom(c, 80, 96, 0.9, '#d89040') + mushroom(c, 86, 98, 0.6, '#e0b050');
    s += body(c, shag(62, 20, 42, 22, 9, 0.28, 97), fol, F(shag(52, 12, 22, 10, 7, 0.3, 98), lt(fol, 0.2), 0.9) + F(shag(88, 28, 14, 8, 5, 0.3, 99), dk(fol, 0.25), 0.8) + motes(95, 10, 30, 100, 4, 36, o.bloom || '#f0e08a'), 2.2);
    s += br('M46,48 L32,64 L24,80', 8) + br('M28,72 L16,74', 3.4) + br('M24,80 L14,86', 3) + br('M24,80 L22,90', 3) + br('M26,78 L30,90', 2.6);
    s += P(leafD(18, 72, -1, 7), c.cel(lt(fol, 0.1)), 1) + P(leafD(106, 12, 1, 7), c.cel(lt(fol, 0.1)), 1);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- Sister Rathtalon: black-winged harpy matriarch, crouched with wings raised (new rig, facing left) ----
  function harpyR(c, o) {
    var sk = o.skin, wc = o.wing, tp = o.tip, lg = o.leg || '#b8a060', s = shadow(c, 64, 40);
    s += G(wing(c, dk(wc, 0.1), dk(tp, 0.1), lt(wc, 0.04)), 'translate(74,52) rotate(-40) scale(0.86)');
    s += feather(c, 70, 90, 0.5, 26, dk(wc, 0.05), tp) + feather(c, 70, 92, 0.9, 24, wc, tp) + feather(c, 70, 90, 0.1, 22, dk(wc, 0.1), tp);
    s += limb('M70,86 L84,100', wc, 11) + limb('M84,100 L78,116', lg, 5) + talons(78, 121, lg, 1.1);
    var tr = 'M48,52 C52,44 72,44 78,52 L76,70 L72,90 L54,90 L50,70 Z';
    s += body(c, tr, sk, F('M66,42 L86,42 L86,92 L68,92 C74,76 72,58 66,42 Z', dk(sk, 0.25), 0.8) + F('M48,66 L78,64 L78,94 L48,94 Z', wc, 1) + L('M50,70 l4,4 l4,-4 l4,4 l4,-4 l4,4 l4,-4', lt(wc, 0.25), 1.1) + (o.chest ? o.chest(c) : ''), 2.4);
    s += limb('M58,86 L46,100', wc, 12) + limb('M46,100 L54,116', lg, 5.4) + talons(54, 121, lg, 1.2);
    // head and hair
    var hx = 58, hy = 34, hc = o.hair;
    [[[hx + 4, hy - 10], [hx + 22, hy - 16], [hx + 38, hy - 12], [hx + 50, hy - 20]], [[hx + 6, hy - 6], [hx + 22, hy - 2], [hx + 34, hy + 8], [hx + 46, hy + 8]], [[hx + 6, hy - 2], [hx + 16, hy + 8], [hx + 22, hy + 22], [hx + 32, hy + 30]]].forEach(function (pp, i) {
      var T = taper(pp, 13, 2, 6); s += body(c, T.d, i === 1 ? dk(hc, 0.2) : hc, L(along(T, 0.5), lt(hc, 0.3), 1, 0.8), 1.8);
    });
    s += R(hx - 3, hy + 8, 9, 7, c.cel(sk), 1.8);
    var d = 'M' + pt([hx - 9, hy - 8]) + 'C' + pt([hx - 8, hy - 14]) + ' ' + pt([hx + 8, hy - 15]) + ' ' + pt([hx + 10, hy - 6]) + 'L' + pt([hx + 10, hy + 4]) + 'C' + pt([hx + 9, hy + 10]) + ' ' + pt([hx + 2, hy + 13]) + ' ' + pt([hx - 4, hy + 12]) + 'C' + pt([hx - 8, hy + 11]) + ' ' + pt([hx - 10, hy + 7]) + ' ' + pt([hx - 10, hy + 3]) + 'L' + pt([hx - 13, hy + 1]) + 'L' + pt([hx - 10, hy - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([hx + 3, hy - 16]) + 'L' + pt([hx + 14, hy - 16]) + 'L' + pt([hx + 14, hy + 16]) + 'L' + pt([hx + 1, hy + 16]) + 'C' + pt([hx + 6, hy + 6]) + ' ' + pt([hx + 6, hy - 6]) + ' ' + pt([hx + 3, hy - 16]) + 'Z', dk(sk, 0.22), 0.8) + F(pd([[hx - 9, hy + 1], [hx + 2, hy - 1], [hx + 2, hy + 1.6], [hx - 9, hy + 3]], true), o.paint || '#a01820', 0.9), 2);
    s += P(pd([[hx + 4, hy - 4], [hx + 16, hy - 12], [hx + 10, hy + 2]], true), c.cel(sk), 1.4);
    s += P('M' + pt([hx - 10, hy - 4]) + 'C' + pt([hx - 12, hy - 16]) + ' ' + pt([hx + 10, hy - 20]) + ' ' + pt([hx + 12, hy - 4]) + 'L' + pt([hx + 6, hy - 7]) + 'L' + pt([hx + 2, hy - 4]) + 'L' + pt([hx - 2, hy - 8]) + 'L' + pt([hx - 6, hy - 4]) + 'Z', c.cel(hc), 1.8);
    s += gEye(c, hx - 5, hy - 1, 1.5, o.eye || '#ff3a3a') + L('M' + pt([hx - 10, hy - 5]) + 'L' + pt([hx - 1, hy - 3]), OL, 2);
    s += P(pd([[hx - 9, hy + 6], [hx - 2, hy + 7], [hx - 4, hy + 10]], true), '#4a0e1a', 1.1) + P(pd([[hx - 8, hy + 6.4], [hx - 7.4, hy + 8.4], [hx - 6.6, hy + 6.6]], true), '#fff', 0.5);
    if (o.necklace) s += o.necklace(c);
    s += G(wing(c, wc, tp, lt(wc, 0.1)), 'translate(48,56) rotate(-142) scale(0.8,-0.8)');
    s += limb('M50,56 L40,60', sk, 7) + clawHand([36, 58], sk, 0.9, '#e8e0d0');
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- Old Grizzlegut: a huge old bear reared on the hind legs (new rig, facing left) ----
  function bearUp(c, o) {
    var col = o.col, bel = o.belly || lt(col, 0.2), gz = o.grizzle || '#c8baa4', mz = o.muzzle || lt(col, 0.35), dcol = dk(col, 0.22), s = shadow(c, 66, 50);
    s += limb('M84,50 L102,36 L108,22', dcol, 14) + bearPaw(110, 20, dk(col, 0.3)).replace(/translate/, '');
    s += limb('M80,96 L88,110 L90,116', dcol, 16) + bearPaw(92, 121, dk(col, 0.35));
    var bd = 'M34,98 C26,78 28,52 42,38 C52,28 76,26 88,38 C102,52 104,82 96,100 C88,112 46,114 34,98 Z', fl = '', r = rng(o.seed || 5);
    for (var i = 0; i < 16; i++) { var fx = 40 + r() * 56, fy = 40 + r() * 60; fl += 'M' + pt([fx, fy]) + 'q' + n(2 + r() * 2) + ',' + n(3 + r() * 2) + ' ' + n(2 + r() * 3) + ',' + n(7 + r() * 3); }
    var gzd = 'M44,38 C54,26 78,24 90,38 C98,46 100,56 100,62 L94,58 L92,64 L86,56 L82,62 L76,52 L72,58 L66,48 L60,54 L56,44 L50,50 Z';
    s += body(c, bd, col, F('M48,62 C56,56 72,56 80,62 C86,78 84,100 72,108 C60,110 50,104 46,92 C42,80 44,68 48,62 Z', bel, 0.85) + F('M80,30 C98,40 108,62 104,90 L104,112 L86,112 C98,92 98,56 80,30 Z', dk(col, 0.25), 0.8) + L(fl, dk(col, 0.3), 1.2, 0.8) + F(gzd, gz, 0.9) + L(fl.replace(/q/g, 'm0,-40 q'), lt(gz, 0.2), 1, 0.6) + (o.scars || ''), 2.6);
    if (o.arrow) s += o.arrow(c);
    s += limb('M50,98 L44,110 L44,116', col, 17) + bearPaw(44, 121, dk(col, 0.3));
    // head, roaring
    var hx = 40, hy = 30;
    s += C(hx + 16, hy - 11, 4.4, c.cel(dk(col, 0.1)), 2) + C(hx + 16, hy - 11, 1.8, dk(col, 0.45));
    s += P('M' + pt([hx - 18, hy + 6]) + 'L' + pt([hx - 22, hy + 18]) + 'C' + pt([hx - 16, hy + 24]) + ' ' + pt([hx - 4, hy + 24]) + ' ' + pt([hx + 4, hy + 16]) + 'Z', c.cel(mz), 1.8) + F(pd([[hx - 18, hy + 7], [hx + 2, hy + 12], [hx - 4, hy + 18], [hx - 19, hy + 15]], true), '#4a1014');
    s += P(pd([[hx - 16, hy + 16], [hx - 15, hy + 11], [hx - 13.4, hy + 16]], true) + pd([[hx - 8, hy + 17], [hx - 7, hy + 12.4], [hx - 5.4, hy + 17]], true), '#f4ecd6', 0.7);
    var hd = 'M' + pt([hx + 16, hy + 4]) + 'C' + pt([hx + 18, hy - 8]) + ' ' + pt([hx + 8, hy - 16]) + ' ' + pt([hx - 2, hy - 14]) + 'C' + pt([hx - 8, hy - 13]) + ' ' + pt([hx - 12, hy - 8]) + ' ' + pt([hx - 14, hy - 4]) + 'L' + pt([hx - 22, hy - 2]) + 'C' + pt([hx - 27, hy]) + ' ' + pt([hx - 27, hy + 7]) + ' ' + pt([hx - 22, hy + 8]) + 'L' + pt([hx - 12, hy + 8]) + 'C' + pt([hx - 4, hy + 14]) + ' ' + pt([hx + 10, hy + 14]) + ' ' + pt([hx + 16, hy + 4]) + 'Z';
    s += body(c, hd, col, F(pd([[hx + 6, hy - 18], [hx + 20, hy - 18], [hx + 20, hy + 16], [hx + 8, hy + 16]], true), dk(col, 0.25), 0.7) + F(pd([[hx - 28, hy - 4], [hx - 12, hy - 5], [hx - 8, hy + 9], [hx - 28, hy + 9]], true), mz, 0.95) + F('M' + pt([hx - 12, hy - 12]) + 'C' + pt([hx - 2, hy - 18]) + ' ' + pt([hx + 12, hy - 16]) + ' ' + pt([hx + 16, hy - 4]) + 'L' + pt([hx + 8, hy - 6]) + 'L' + pt([hx + 4, hy - 2]) + 'L' + pt([hx, hy - 8]) + 'L' + pt([hx - 6, hy - 4]) + 'Z', gz, 0.8) + (o.faceScar || ''), 2.4);
    s += C(hx + 6, hy - 13, 4.6, c.cel(col), 2) + C(hx + 6, hy - 13, 2, dk(col, 0.45));
    s += E(hx - 25, hy + 1, 3.2, 2.6, '#140c0a', 1.2) + L('M' + pt([hx - 14, hy - 7]) + 'L' + pt([hx - 2, hy - 4]), OL, 2.6) + E(hx - 8, hy - 3, 2.2, 1.8, o.eye || '#e8a040', 1) + C(hx - 8.4, hy - 3.2, 0.7, OL) + (o.cloudy ? E(hx - 8, hy - 3, 2.2, 1.8, '#dfe6ea', 0, 0.75) : '') + L('M' + pt([hx - 20, hy - 4]) + 'L' + pt([hx - 16, hy - 6]), dk(col, 0.4), 1);
    s += limb('M46,58 L30,62 L16,54', col, 15) + bearPaw(14, 54, dk(col, 0.3));
    return o.tf ? G(s, o.tf) : s;
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var HCOL = '#a4386a', HBEL = '#f0c890', HFIN = '#e89a3a';
  var MOBS = {
    frayfeather_skystormer: function (c) {
      return hippo(c, { rear: true, open: true, body: '#6a7a94', head: '#ccd8e6', mask: '#46546e', crest: '#8a9ab4', wing: '#5a6c8c', tip: '#26324c', beak: '#e8c450', leg: '#d8b040', eye: '#ffd24a', tf: 'translate(-8,4) ' + at(0.8, 64, 122) });
    },
    frayfeather_stagwing: function (c) {
      return hippo(c, { body: '#b88048', head: '#ecd8ae', mask: '#8a5a32', crest: '#c8a070', wing: '#9a6434', tip: '#4a2e1a', beak: '#d8a040', leg: '#c8a040', eye: '#ffb030', antlers: '#ece0c4',
        headMark: C(20, 26, 1.3, '#a07040') + C(26, 22, 1.1, '#a07040') + C(34, 30, 1.2, '#a07040'), bodyMark: C(80, 70, 2, '#f4e8c8', 0, 0.8) + C(90, 74, 1.8, '#f4e8c8', 0, 0.8) + C(98, 70, 1.6, '#f4e8c8', 0, 0.8) + C(86, 80, 1.6, '#f4e8c8', 0, 0.8), tf: 'translate(-6,4) ' + at(0.86, 64, 122) });
    },
    woodpaw_reaver: function (c) {
      return gnollW(c, {
        fur: '#98482a', cream: '#d8b088', mane: '#2e1a10', open: true, eye: '#ffcc30', loin: '#4a3424', seed: 31,
        chest: function (c) { return L('M80,50 L50,84', OL, 5.4) + L('M80,50 L50,84', '#5a3a22', 3.2) + C(66, 66, 3, c.cel('#c8b890'), 1.1); },
        pads: function (c) { return barkPad(c, 44, 56, 11) + barkPad(c, 80, 52, 8); },
        near: [[48, 58], [36, 48], [30, 34]], wNear: function (c, p) { return axe(c, p, 34, -PI / 2 - 0.28, 17, '#a8acb2', false, '#4a3222'); },
        far: [[80, 54], [90, 70], [92, 84]], tf: at(0.97, 64, 122)
      });
    },
    woodpaw_mystic: function (c) {
      return gnollW(c, {
        fur: '#a4583a', cream: '#dcc098', mane: '#3a2014', glow: '#c8ff6a', loin: '#5a6a34', seed: 37,
        headX: function (c, x, y) { var o = ''; ['#6a9a3a', '#e8dcc0', '#c83a2a', '#e8dcc0', '#4a7a2e'].forEach(function (col, i) { o += feather(c, x + 6, y - 12, -PI / 2 + 0.9 - i * 0.32, 22 - Math.abs(i - 2) * 2, col, i % 2 ? '#1a1009' : '#3a6a2a'); }); return o + L('M' + pt([x - 6, y - 11]) + 'L' + pt([x + 12, y - 9]), OL, 3.6) + L('M' + pt([x - 6, y - 11]) + 'L' + pt([x + 12, y - 9]), '#5a8a34', 2) + skull(c, x + 2, y - 12, 0.45); },
        back: function (c) { return body(c, 'M74,50 C88,58 94,82 96,108' + rag(96, 70, 108, 8, 9) + 'L70,56 Z', '#4e7a2e', F('M84,56 L100,56 L100,114 L86,114 Z', '#000', 0.25) + P(leafD(88, 70, 1, 8) + leafD(84, 86, -1, 8) + leafD(92, 96, 1, 7), c.cel('#6a9a3a'), 0.9), 2); },
        chest: function (c) { var o = L('M46,56 Q62,70 80,56', OL, 2.4) + L('M46,56 Q62,70 80,56', '#6a4a2a', 1); [[52, 61], [58, 64], [64, 65], [70, 63], [75, 60]].forEach(function (t) { o += P(pd([[t[0] - 1.6, t[1] - 1], [t[0], t[1] + 5], [t[0] + 1.6, t[1] - 1]], true), c.cel('#ece2c8'), 0.8); }); return o; },
        pads: function (c) { return barkPad(c, 46, 56, 9); },
        near: [[48, 58], [34, 60], [22, 52]], wNearFront: function (c, p) { return rattle(c, p, -PI / 2 - 0.9); },
        far: [[80, 54], [92, 46], [98, 32]], wFar: function (c, p) { return rattle(c, p, -PI / 2 + 0.2); }, tf: at(0.94, 64, 122)
      });
    },
    gordunni_ogre: function (c) {
      var sk = '#8a9a74';
      return ogre(c, {
        skin: sk, knot: true, hair: '#1e1a18', earring: true,
        chest: function (c) {
          var o = '';
          [[44, 44, 12], [56, 42, 12], [68, 42, 12], [80, 44, 12]].forEach(function (p, i) { o += body(c, pd([[p[0], p[1]], [p[0] + p[2], p[1] - 1], [p[0] + p[2] - 1, p[1] + 34], [p[0] + 1, p[1] + 36]], true), i % 2 ? '#8a6440' : '#7a5838', L('M' + pt([p[0] + 4, p[1] + 8]) + 'l3,2 M' + pt([p[0] + 6, p[1] + 20]) + 'l2,3', '#4a3220', 1), 1.6); });
          return o + L('M40,54 L92,50 M40,72 L92,70', OL, 5) + L('M40,54 L92,50 M40,72 L92,70', '#5a3e28', 3) + C(50, 53, 1.4, '#c8ccd4', 0.6) + C(84, 51, 1.4, '#c8ccd4', 0.6) + C(50, 71, 1.4, '#c8ccd4', 0.6) + C(84, 70, 1.4, '#c8ccd4', 0.6);
        },
        front: function (c) { return body(c, 'M40,92 L96,92 L98,106' + rag(98, 38, 108, 8, 4) + 'Z', '#6a4a30', L('M40,95 L96,95', '#3a2a1a', 2.2) + L('M52,96 L50,108 M66,96 L66,110 M80,96 L82,108', dk('#6a4a30', 0.35), 1.2), 1.8) + skull(c, 68, 100, 0.55); },
        pads: function (c) { return body(c, 'M28,58 C24,44 44,36 56,46 L52,58 L34,62 Z', '#8a8e96', L('M32,52 C38,46 48,44 54,48', '#5a5e66', 1.6) + C(38, 52, 1.3, '#d8dce4') + C(48, 48, 1.3, '#d8dce4'), 2) + P(pd([[34, 46], [28, 34], [40, 42]], true) + pd([[44, 42], [44, 30], [50, 40]], true), c.cel('#c8ccd4'), 1.2); },
        near: [[42, 56], [28, 72], [20, 66]], wNear: function (c, p) { return spikedClub(c, p, 38, -PI / 2 - 0.36); },
        far: [[94, 50], [104, 70], [100, 88]], tf: 'translate(0,1) ' + at(1.02, 64, 122)
      });
    },
    gordunni_mage_lord: function (c) {
      var sk = '#869a7a', robe = '#8a2a24', trim = '#e0b040';
      return ogre(c, {
        skin: sk, robe: true, shirt: robe, farSleeve: dk(robe, 0.15), nearSleeve: robe, hx: 40, hy: 34, glow: '#ffb040',
        hat: function (c, x, y) { return P(pd([[x - 14, y - 10], [x - 4, y - 32], [x + 2, y - 26], [x + 12, y - 12]], true), c.cel('#5a1a18'), 1.8) + L('M' + pt([x - 13, y - 11]) + 'L' + pt([x + 11, y - 13]), trim, 2) + P(pd([[x - 3, y - 26], [x - 9, y - 38], [x + 1, y - 30]], true), c.cel('#ece2c8'), 1.1); },
        head2: function (c) { return G(oHead(c, 76, 22, { skin: dk(sk, 0.08), glow: '#ffb040', knot: true, hair: '#2a2220', earring: true }), 'rotate(10 76 22)'); },
        back: function (c) { return body(c, 'M36,96 L100,96 L104,118 C84,124 50,124 30,118 Z', dk(robe, 0.2), L('M38,114 C60,120 84,120 102,114', trim, 2), 2); },
        chest: function (c) { return F('M58,36 L70,36 L66,104 L58,104 Z', dk(robe, 0.3)) + L('M58,36 L58,104 M70,36 L66,104', trim, 1.6) + L('M36,78 L100,70', OL, 6) + L('M36,78 L100,70', '#e8c860', 3.4) + skull(c, 64, 60, 0.6) + C(54, 90, 1.4, trim) + C(76, 88, 1.4, trim); },
        front: function (c) { return body(c, 'M34,92 L100,90 L104,116 C84,122 52,122 30,116 Z', robe, F('M72,88 L106,88 L106,120 L76,120 Z', dk(robe, 0.3), 0.8) + L('M32,112 C56,118 82,118 102,112', trim, 2.2) + L('M60,94 L58,118', dk(robe, 0.4), 1.2), 2) + R(46, 114, 12, 6, c.cel(dk(sk, 0.2)), 1.6) + R(78, 114, 12, 6, c.cel(dk(sk, 0.25)), 1.6); },
        pads: function (c) { return body(c, 'M28,56 C26,44 44,38 56,46 L52,56 L34,60 Z', trim, L('M32,52 C38,46 48,44 54,48', dk(trim, 0.35), 1.4), 1.8) + bone(34, 48, 10, 0.6, 0.6) + bone(46, 44, 10, 0.9, 0.6); },
        near: [[42, 54], [30, 66], [20, 58]], wNearFront: function (c, p) { return C(p[0] - 6, p[1] - 10, 16, glow(c, '#ff9a30', 0.7)) + flame(c, p[0] - 6, p[1] - 4, 0.75, '#ff6a1a', '#ffe070'); },
        far: [[94, 50], [104, 68], [102, 84]], wFar: function (c, p) { var d = 'M' + pt([p[0] + 6, p[1] + 36]) + 'L' + pt([p[0] - 2, p[1] - 70]); return limb(d, '#5a3a24', 4) + skull(c, p[0] - 2, p[1] - 70, 0.9) + C(p[0] - 2, p[1] - 78, 12, glow(c, '#ff9a30', 0.6)) + flame(c, p[0] - 2, p[1] - 76, 0.5, '#ff6a1a', '#ffe070'); },
        tf: 'translate(0,1) ' + at(0.98, 64, 122)
      });
    },
    hatecrest_warrior: function (c) {
      return nagaH(c, {
        col: HCOL, belly: HBEL, fin: HFIN, eye: '#ffe040', belt: '#3a2240',
        pads: function (c) { return shellPad(c, 80, 50, 8, '#e8b8a0') + shellPad(c, 44, 52, 11, '#f0c8b0'); },
        chest: function (c) { return L('M80,48 L52,84', OL, 5) + L('M80,48 L52,84', '#5a3a2a', 3) + C(68, 64, 2.4, c.cel('#f0f0ff'), 1); },
        near: [[46, 56], [36, 46], [30, 34]], wNear: function (c, p) { return scimitar(c, p, 34, -PI / 2 - 0.5); },
        far: [[80, 54], [92, 64], [96, 76]], wFar: function (c, p) { var d = 'M' + pt([p[0] - 12, p[1]]) + 'C' + pt([p[0] - 12, p[1] - 16]) + ' ' + pt([p[0] + 14, p[1] - 16]) + ' ' + pt([p[0] + 14, p[1]]) + 'C' + pt([p[0] + 14, p[1] + 14]) + ' ' + pt([p[0] - 12, p[1] + 14]) + ' ' + pt([p[0] - 12, p[1]]) + 'Z'; var rib = ''; for (var i = 0; i < 6; i++) { var a = i * PI / 3; rib += 'M' + pt([p[0] + 1, p[1]]) + 'L' + pt([p[0] + 1 + Math.cos(a) * 12, p[1] + Math.sin(a) * 12]); } return body(c, d, '#e8b890', L(rib, '#a8604a', 1.3), 2) + C(p[0] + 1, p[1], 3, c.cel('#d8a040'), 1.2); },
        tf: at(0.98, 64, 122)
      });
    },
    hatecrest_siren: function (c) {
      return nagaH(c, {
        female: true, col: '#b84478', face: '#c8588a', hair: '#4a1a52', belly: HBEL, fin: '#f0b050', eye: '#9afff0', belt: '#2a3a6a', beltTrim: '#9ae0ff', armW: 7.5,
        chest: function (c) { return F('M50,54 C54,50 62,54 64,58 C60,62 54,62 50,58 Z M64,58 C66,54 74,52 78,56 C74,62 68,62 64,58 Z', '#e8c090') + L('M50,56 C58,60 70,60 78,56', '#e0b848', 1.4) + C(64, 58, 1.8, c.cel('#f4f0ff'), 0.9); },
        pads: function (c) { return shellPad(c, 44, 52, 8, '#f0c8b0'); },
        far: [[80, 54], [90, 64], [92, 76]], wFar: function (c, p) { return trident(c, [p[0] + 6, p[1] + 40], [p[0] - 4, p[1] - 56]); },
        near: [[46, 56], [34, 62], [22, 56]], wNearFront: function (c, p) { return waterOrb(c, p[0] - 6, p[1] - 8, 6); },
        tf: at(0.96, 64, 122)
      });
    },
    longtooth_runner: function (c) { return runWolf(c, { col: '#5a5e68', belly: '#b8bcc4', saddle: '#34363e', eye: '#f0c040', tf: 'translate(-2,0) ' + at(0.96, 64, 122) }); },
    wandering_forest_walker: function (c) { return treant(c, { bark: '#6e4c32', leaf: '#4a7e30', eye: '#e8ff6a', moss: '#6e9a3a', tf: 'translate(0,2) ' + at(0.98, 64, 122) }); },
    sister_rathtalon: function (c) {
      return harpyR(c, {
        skin: '#a896b8', wing: '#2e2838', tip: '#6e4aa6', hair: '#16141c', eye: '#ff3030', paint: '#b01822', leg: '#b8a060',
        necklace: function (c) { var o = L('M52,48 Q64,58 76,48', OL, 2.2) + L('M52,48 Q64,58 76,48', '#6a4a2a', 1); [[56, 52], [61, 54.6], [66, 55], [71, 53]].forEach(function (t) { o += P(pd([[t[0] - 1.4, t[1]], [t[0], t[1] + 5], [t[0] + 1.4, t[1]]], true), '#ece2c8', 0.7); }); return o + skull(c, 64, 60, 0.4); },
        tf: 'translate(0,2) ' + at(0.92, 64, 122)
      });
    },
    old_grizzlegut: function (c) {
      return bearUp(c, {
        col: '#6e4a30', belly: '#8e6a4a', grizzle: '#c8b89c', muzzle: '#b0967a', cloudy: true, seed: 7,
        scars: L('M70,64 L80,82 M76,62 L86,78', '#e8d8c0', 1.6) + L('M50,70 L58,84', '#e8d8c0', 1.4),
        faceScar: L('M22,18 L30,34', '#e8d8c0', 1.4),
        arrow: function (c) { return limb('M84,46 L98,34', '#8a6a44', 2) + feathers(98, 34, ['#e8e0d0', '#c83a2a'], 0.5, 2.2) + limb('M76,58 L90,52', '#7a5a3a', 1.8) + L('M90,52 l3,-3 M90,52 l3,1', '#e8e0d0', 1.4); },
        tf: 'translate(0,1) ' + at(1.02, 64, 122)
      });
    },
    lord_shalzaru: function (c) {
      var sc = '#8e2a5c', blade = function (c, p, ang) { return scimitar(c, p, 30, ang, '#d8dce8'); };
      return nagaH(c, {
        col: sc, belly: '#f0c080', fin: '#f0b040', eye: '#ffe860', belt: '#2a1a3a', tw: 30,
        tail: [[66, 82], [56, 98], [40, 110], [46, 121], [82, 121], [110, 114], [124, 96], [120, 74]],
        crown: function (c, x, y) { return P(pd([[x - 10, y - 10], [x - 12, y - 22], [x - 6, y - 15], [x - 2, y - 26], [x + 2, y - 15], [x + 8, y - 24], [x + 9, y - 12]], true), c.cel('#e8c040'), 1.6) + C(x - 2, y - 15, 1.6, '#9af0ff', 0.7) + C(x - 12, y - 22, 1.2, '#f4f0ff', 0.6) + C(x - 2, y - 26, 1.2, '#f4f0ff', 0.6) + C(x + 8, y - 24, 1.2, '#f4f0ff', 0.6); },
        pads: function (c) { return shellPad(c, 80, 48, 10, '#e8c050') + shellPad(c, 44, 50, 13, '#f0d060'); },
        chest: function (c) { return L('M46,60 Q62,74 82,60', OL, 3) + L('M46,60 Q62,74 82,60', '#e8c040', 1.6) + C(64, 68, 3, c.cel('#9af0ff'), 1.1) + C(64, 68, 7, glow(c, '#9af0ff', 0.5)); },
        back2: function (c) { var p = [100, 84]; return limb('M80,64 L94,78', dk(sc, 0.2), 7.5) + limb('M94,78 L100,84', dk(sc, 0.2), 6.5) + blade(c, p, 0.3) + hand(p, c.cel(dk(sc, 0.2))); },
        near: [[46, 56], [36, 42], [34, 28]], wNear: function (c, p) { return blade(c, p, -PI / 2 - 0.35); },
        far: [[80, 54], [94, 44], [100, 30]], wFar: function (c, p) { return blade(c, p, -PI / 2 + 0.3); },
        top: function (c) { var p = [20, 74]; return limb('M50,66 L34,74', sc, 7.5) + limb('M34,74 L20,74', sc, 6.5) + blade(c, p, -PI + 0.2) + hand(p, c.cel(sc)); },
        tf: 'translate(0,2) ' + at(1.06, 64, 122)
      });
    }
  };
  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#4a7a4a'), 2.5); }
  function phScene(c) { return svSky(c) + ground(c, 150, '#6e7a44', '#2e3a1e'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#4a7a4a"/></svg>'; }
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
