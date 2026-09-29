/* art_stranglethorn.js — The Vinewild zone art for Realm of Loner (contested, levels 30-35: Rebel Camp, Camp Skarn,
 * Wexley's Expedition, the Drayke Compound, Zuuldaia Ruins, Lake Omunde, Mokkari, Deepgold Company Base Camp, Umbaa Ruins).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Vinewild keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_wetlands.js; the raptor is the
 * art_wetlands.js adaptation of art_barrens.js; the goblin rig is a copy of art_stonetalon.js. The cat, jungle troll
 * and human rigs are new here.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix sv<counter>_).
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
  function Ctx() { this.p = 'sv' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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

  // ============================================================
  //  STRANGLETHORN PIECES
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
  // a troll face carved into a stone block (x, y = centre of the face)
  function carvedFace(c, x, y, s, col) {
    col = col || TST; var q = function (u, v) { return [x + u * s, y + v * s]; }, dd = dk(col, 0.5), o = '';
    o += body(c, pd([q(-20, -24), q(20, -24), q(22, 24), q(-22, 24)], true), col, F(pd([q(8, -26), q(24, -26), q(24, 26), q(10, 26)], true), dk(col, 0.25), 0.8) + L('M' + pt(q(-21, -17)) + 'L' + pt(q(21, -17)) + 'M' + pt(q(-21.6, 21)) + 'L' + pt(q(21.6, 21)), dk(col, 0.3), 0.9 * s), 1.8 * s);
    o += P(pd([q(-17, -14), q(-3, -8), q(3, -8), q(17, -14), q(17, -9), q(3, -3), q(-3, -3), q(-17, -9)], true), c.cel(lt(col, 0.1)), 1.3 * s);
    o += P(pd([q(-15, -6), q(-4, -2), q(-6, 2), q(-14, 0)], true), dd, 1 * s) + P(pd([q(15, -6), q(4, -2), q(6, 2), q(14, 0)], true), dd, 1 * s);
    o += P(pd([q(-3, -4), q(3, -4), q(5, 8), q(0, 10), q(-5, 8)], true), c.cel(lt(col, 0.06)), 1.2 * s);
    o += P(pd([q(-12, 12), q(12, 12), q(10, 19), q(-10, 19)], true), dd, 1 * s) + L('M' + pt(q(-6, 12)) + 'L' + pt(q(-6, 19)) + 'M' + pt(q(0, 12)) + 'L' + pt(q(0, 19)) + 'M' + pt(q(6, 12)) + 'L' + pt(q(6, 19)), lt(col, 0.1), 1 * s);
    o += P(pd([q(-12, 16), q(-18, 1), q(-8, 13)], true), c.cel('#d8d0b4'), 1.1 * s) + P(pd([q(12, 16), q(18, 1), q(8, 13)], true), c.cel('#c8c0a4'), 1.1 * s);
    return o;
  }
  // square troll pillar with a carved zigzag band; broken tops are jagged
  function tPillar(c, x, y, w, h, col, seed, broken) {
    col = col || TST; var r = rng(seed || 9);
    var top = broken ? [[0, 4 + r() * 6], [w * 0.3, -2], [w * 0.55, 6 + r() * 6], [w * 0.8, 1], [w, 8]] : null;
    var o = E(x + w / 2, y + 2, w * 0.8, 3.4, '#000', 0, 0.25) + stoneFace(c, x, y, w, h, col, 14, top);
    var zy = y - h * 0.55, z = 'M' + pt([x + 1, zy]);
    for (var i = 1; i <= 6; i++) z += 'L' + pt([x + w * i / 6, zy + (i % 2 ? -4 : 0)]);
    o += L(z, dk(col, 0.45), 1.6) + L('M' + pt([x, zy + 4]) + 'L' + pt([x + w, zy + 4]) + 'M' + pt([x, zy - 8]) + 'L' + pt([x + w, zy - 8]), dk(col, 0.4), 1.1);
    if (!broken) o += R(x - 4, y - h - 6, w + 8, 7, c.cel(lt(col, 0.05)), 1.6) + mossTop(x - 4, x + w + 4, y - h - 6, seed);
    else o += mossTop(x, x + w, y - h + 5, seed);
    return o;
  }
  function rubble(c, x, y, s, col, seed) {
    var r = rng(seed || 3), o = '';
    for (var i = 0; i < 4; i++) { var bx = x + (i - 1.5) * 12 * s + (r() - 0.5) * 4, bw = (10 + r() * 6) * s, bh = (6 + r() * 5) * s, tilt = (r() - 0.5) * 4; o += body(c, pd([[bx - bw / 2, y], [bx - bw / 2 + tilt, y - bh], [bx + bw / 2 + tilt, y - bh - 1], [bx + bw / 2, y]], true), i % 2 ? col : lt(col, 0.06), F(pd([[bx + bw * 0.15, y - bh - 3], [bx + bw, y - bh - 3], [bx + bw, y + 1], [bx + bw * 0.2, y + 1]], true), dk(col, 0.25), 0.8), 1.4); }
    return o + F('M' + pt([x - 20 * s, y - 2]) + 'q' + n(8 * s) + ',' + n(-6 * s) + ' ' + n(16 * s) + ',' + n(-4 * s) + 'l' + n(-2 * s) + ',' + n(5 * s) + 'Z', MOSS, 0.9);
  }
  // stepped troll temple with a central stair and a carved-face shrine on top (x = centre, y = base)
  function stepTemple(c, x, y, s, col, seed) {
    col = col || TST; var o = E(x, y + 3, 120 * s, 8 * s, '#000', 0, 0.25), by = y;
    [[110, 24], [86, 22], [64, 20], [44, 18]].forEach(function (t, i) {
      var hw = t[0] * s, th = t[1] * s, brk = i === 1 ? [[0, 0], [hw * 0.3, 0], [hw * 0.36, 8 * s], [hw * 0.5, 4 * s], [hw * 0.6, 0], [2 * hw, 0]] : i === 2 ? [[0, 0], [hw * 1.4, 0], [hw * 1.55, 7 * s], [hw * 1.75, 5 * s], [hw * 1.85, 10 * s], [2 * hw, 12 * s]] : null;
      o += stoneFace(c, x - hw, by, hw * 2, th, i % 2 ? col : lt(col, 0.05), 10, brk) + mossTop(x - hw, x + hw, by - th, (seed || 1) + i);
      by -= th;
    });
    var sw0 = 22 * s, sw1 = 14 * s, st = '', top = y - 84 * s;
    o += P(pd([[x - sw0, y], [x - sw1, top], [x + sw1, top], [x + sw0, y]], true), c.cel(lt(col, 0.12)), 1.6 * s);
    for (var j = 1; j < 14; j++) { var t = j / 14, yy = y - (y - top) * t, hw2 = sw0 + (sw1 - sw0) * t; st += 'M' + pt([x - hw2, yy]) + 'L' + pt([x + hw2, yy]); }
    o += L(st, dk(col, 0.35), 1 * s) + F(pd([[x + sw1 * 0.3, top], [x + sw1, top], [x + sw0, y], [x + sw0 * 0.3, y]], true), dk(col, 0.2), 0.6);
    o += stoneFace(c, x - 28 * s, top, 56 * s, 34 * s, col, 12) + P(pd([[x - 34 * s, top - 34 * s], [x + 34 * s, top - 34 * s], [x + 30 * s, top - 42 * s], [x - 30 * s, top - 42 * s]], true), c.cel(dk(col, 0.05)), 1.6 * s) + mossTop(x - 34 * s, x + 34 * s, top - 42 * s, (seed || 1) + 9);
    return o + carvedFace(c, x, top - 17 * s, 0.62 * s, lt(col, 0.04));
  }
  function skullSpike(c, x, y, h, s) {
    s = s || 1; var d = 'M' + pt([x, y]) + 'L' + pt([x, y - h]);
    return E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.25) + limb(d, '#6a4a2a', 2.6 * s) + P(pd([[x - 1.6 * s, y - h], [x, y - h - 11 * s], [x + 1.6 * s, y - h]], true), c.cel('#d8d0b8'), 0.9 * s) + skull(c, x, y - h + 1 * s, 1.1 * s);
  }
  // Scaldback war totem: carved wooden pole of stacked red-painted heads, feathers and a horned skull
  function warTotem(c, x, y, s, col) {
    col = col || BSRED; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 14 * s, 3 * s, '#000', 0, 0.28), wood = '#7a5230';
    o += body(c, pd([q(-6, 0), q(-5, -64), q(5, -64), q(6, 0)], true), wood, F(pd([q(2, -66), q(9, -66), q(9, 2), q(3, 2)], true), dk(wood, 0.3), 0.8), 1.8 * s);
    [[-14, 1], [-38, 0.9]].forEach(function (h) {
      var cy = y + h[0] * s, k = h[1] * s;
      o += body(c, pd([[x - 9 * k, cy - 10 * k], [x + 9 * k, cy - 10 * k], [x + 8 * k, cy + 8 * k], [x - 8 * k, cy + 8 * k]], true), col, F(pd([[x + 2 * k, cy - 12 * k], [x + 11 * k, cy - 12 * k], [x + 11 * k, cy + 10 * k], [x + 3 * k, cy + 10 * k]], true), dk(col, 0.3), 0.8), 1.6 * s);
      o += F(pd([[x - 7 * k, cy - 5 * k], [x - 1.5 * k, cy - 3 * k], [x - 6 * k, cy - 1 * k]], true), OL) + F(pd([[x + 7 * k, cy - 5 * k], [x + 1.5 * k, cy - 3 * k], [x + 6 * k, cy - 1 * k]], true), OL);
      o += R(x - 5 * k, cy + 2 * k, 10 * k, 4 * k, OL) + L('M' + pt([x - 5 * k, cy + 4 * k]) + 'L' + pt([x + 5 * k, cy + 4 * k]), '#f4ecd6', 1 * k);
      o += P(pd([[x - 5 * k, cy + 3 * k], [x - 9 * k, cy - 5 * k], [x - 3 * k, cy + 2 * k]], true), '#f4ecd6', 0.9 * k) + P(pd([[x + 5 * k, cy + 3 * k], [x + 9 * k, cy - 5 * k], [x + 3 * k, cy + 2 * k]], true), '#f4ecd6', 0.9 * k);
      o += L('M' + pt([x - 10 * k, cy - 10 * k]) + 'L' + pt([x + 10 * k, cy - 10 * k]), OL, 2.2 * k);
    });
    o += limb('M' + pt(q(-16, -54)) + 'L' + pt(q(16, -56)), wood, 2.6 * s) + feathers(x - 15 * s, y - 54 * s, [col, '#1a1009', '#e8d8a0'], 0.55 * s, -0.3) + feathers(x + 15 * s, y - 56 * s, [col, '#e8d8a0'], 0.55 * s, -0.1);
    o += P(pd([q(-7, -74), q(-15, -88), q(-3, -77)], true), c.cel('#e8dcc0'), 1 * s) + P(pd([q(7, -74), q(15, -88), q(3, -77)], true), c.cel('#e8dcc0'), 1 * s) + skull(c, x, y - 70 * s, 1.2 * s);
    return o;
  }
  function altar(c, x, y, s, col) {
    col = col || TST; var o = E(x, y + 2, 40 * s, 5 * s, '#000', 0, 0.3);
    o += stoneFace(c, x - 26 * s, y, 14 * s, 16 * s, dk(col, 0.05), 8) + stoneFace(c, x + 12 * s, y, 14 * s, 16 * s, dk(col, 0.05), 8);
    o += body(c, pd([[x - 34 * s, y - 16 * s], [x + 34 * s, y - 16 * s], [x + 30 * s, y - 25 * s], [x - 30 * s, y - 25 * s]], true), lt(col, 0.06), F(pd([[x + 4 * s, y - 27 * s], [x + 36 * s, y - 27 * s], [x + 36 * s, y - 14 * s], [x + 8 * s, y - 14 * s]], true), dk(col, 0.25), 0.8) + L('M' + pt([x - 30 * s, y - 20 * s]) + 'L' + pt([x + 30 * s, y - 20 * s]), dk(col, 0.35), 1), 1.8 * s);
    o += F('M' + pt([x - 10 * s, y - 25 * s]) + 'C' + pt([x - 2 * s, y - 26 * s]) + ' ' + pt([x + 8 * s, y - 25 * s]) + ' ' + pt([x + 10 * s, y - 22 * s]) + 'L' + pt([x + 8 * s, y - 12 * s]) + 'L' + pt([x + 6 * s, y - 16 * s]) + 'L' + pt([x + 3 * s, y - 10 * s]) + 'L' + pt([x, y - 17 * s]) + 'C' + pt([x - 5 * s, y - 20 * s]) + ' ' + pt([x - 10 * s, y - 22 * s]) + ' ' + pt([x - 10 * s, y - 25 * s]) + 'Z', '#7a1a14', 0.85);
    o += skull(c, x - 20 * s, y - 29 * s, 0.8 * s) + C(x + 22 * s, y - 34 * s, 10 * s, glow(c, '#ffb040', 0.5)) + R(x + 20 * s, y - 32 * s, 4 * s, 7 * s, '#e8dcc0', 0.9) + flame(c, x + 22 * s, y - 32 * s, 0.3 * s);
    return o;
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
  // original marks: rebel gold star over a chevron; Krugar black fang-crown; Drayke tan crossed blades
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
  // goblin-built zeppelin tower: tapering log lattice, a landing deck and a docking arm (x = centre, y = ground)
  function zepTower(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#6a4a2e', o = E(x, y + 3, 30 * s, 5 * s, '#000', 0, 0.3), br = '';
    o += limb('M' + pt(q(-20, 0)) + 'L' + pt(q(-9, -124)) + 'M' + pt(q(20, 0)) + 'L' + pt(q(9, -124)), wood, 4 * s);
    for (var i = 0; i < 5; i++) { var y0 = -i * 24, y1 = -(i + 1) * 24, w0 = 20 - 11 * i / 5, w1 = 20 - 11 * (i + 1) / 5; br += 'M' + pt(q(-w0, y0)) + 'L' + pt(q(w1, y1)) + 'M' + pt(q(w0, y0)) + 'L' + pt(q(-w1, y1)) + 'M' + pt(q(-w1, y1)) + 'L' + pt(q(w1, y1)); }
    o += limb(br, dk(wood, 0.1), 1.8 * s);
    o += P(pd([q(-20, -124), q(52, -124), q(50, -118), q(-18, -118)], true), c.cel('#7a5634'), 1.6 * s) + L('M' + pt(q(-18, -124)) + 'L' + pt(q(-18, -134)) + 'M' + pt(q(-4, -124)) + 'L' + pt(q(-4, -134)) + 'M' + pt(q(-20, -132)) + 'L' + pt(q(8, -132)), OL, 1.6 * s);
    o += limb('M' + pt(q(48, -118)) + 'L' + pt(q(14, -80)), wood, 2 * s) + limb('M' + pt(q(0, -124)) + 'L' + pt(q(0, -146)), '#3a3434', 2 * s) + flag(c, x, y - 124 * s, 26 * s, 0.7 * s, HRED, '#1a1009', hordeMark, true);
    return o + C(x + 50 * s, y - 128 * s, 8 * s, glow(c, '#ffc860', 0.6)) + C(x + 50 * s, y - 128 * s, 2.4 * s, '#ffe8a0', 1 * s);
  }
  // goblin zeppelin: patched ribbed envelope, fins, gondola and a spinning prop (x, y = envelope centre, nose left)
  function zeppelin(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, env = '#a85a34', o = '';
    var fin = function (v) { return P(pd([q(46, v * 4), q(70, v * 24), q(74, v * 22), q(64, v * 2)], true), c.cel('#7a3a22'), 1.5 * s); };
    o += fin(-1) + fin(1);
    o += L('M' + pt(q(-24, 16)) + 'L' + pt(q(-12, 30)) + 'M' + pt(q(24, 16)) + 'L' + pt(q(14, 30)) + 'M' + pt(q(0, 20)) + 'L' + pt(q(0, 30)), OL, 1 * s);
    var ed = 'M' + pt(q(-64, 0)) + 'C' + pt(q(-62, -18)) + ' ' + pt(q(-30, -22)) + ' ' + pt(q(0, -22)) + 'C' + pt(q(34, -22)) + ' ' + pt(q(60, -14)) + ' ' + pt(q(66, 0)) + 'C' + pt(q(60, 14)) + ' ' + pt(q(34, 22)) + ' ' + pt(q(0, 22)) + 'C' + pt(q(-30, 22)) + ' ' + pt(q(-62, 18)) + ' ' + pt(q(-64, 0)) + 'Z';
    var rb = '';
    [-40, -20, 0, 20, 40].forEach(function (u) { var hh = 22 * Math.sqrt(Math.max(0, 1 - (u / 66) * (u / 66))); rb += 'M' + pt(q(u, -hh)) + 'Q' + pt(q(u + 5, 0)) + ' ' + pt(q(u, hh)); });
    o += body(c, ed, env, L(rb, dk(env, 0.35), 1.1 * s) + F('M' + pt(q(-66, 6)) + 'C' + pt(q(-40, 26)) + ' ' + pt(q(40, 26)) + ' ' + pt(q(68, 4)) + 'L' + pt(q(68, 26)) + 'L' + pt(q(-66, 26)) + 'Z', dk(env, 0.3), 0.8) + R(x - 14 * s, y - 14 * s, 12 * s, 9 * s, '#c89a4a', 0) + L('M' + pt(q(-14, -14)) + 'l' + n(12 * s) + ',' + n(9 * s), dk(env, 0.4), 0.8 * s) + E(x - 40 * s, y - 10 * s, 10 * s, 3 * s, '#fff', 0, 0.3), 2 * s);
    o += P(pd([q(-16, 28), q(18, 28), q(14, 38), q(-12, 38)], true), c.cel('#6a4a2e'), 1.6 * s) + R(x - 8 * s, y + 30 * s, 5 * s, 4 * s, '#ffd27a', 0.8) + R(x + 2 * s, y + 30 * s, 5 * s, 4 * s, '#ffd27a', 0.8);
    return o + L('M' + pt(q(18, 33)) + 'L' + pt(q(24, 33)), OL, 1.6 * s) + E(x + 25 * s, y + 33 * s, 1.6 * s, 7 * s, '#c8c8c8', 1 * s, 0.8) + fin(0);
  }
  // hunting trophy on a plank: 'tiger' head or 'raptor' skull (x, y = plank centre)
  function trophy(c, x, y, s, kind) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = body(c, pd([q(-11, -12), q(11, -12), q(12, 6), q(0, 13), q(-12, 6)], true), '#7a4e2a', F(pd([q(3, -14), q(14, -14), q(14, 14), q(4, 14)], true), '#000', 0.25), 1.5 * s);
    if (kind === 'raptor') {
      o += P('M' + pt(q(8, -6)) + 'C' + pt(q(2, -12)) + ' ' + pt(q(-10, -10)) + ' ' + pt(q(-18, -2)) + 'L' + pt(q(-20, 2)) + 'L' + pt(q(-8, 4)) + 'L' + pt(q(6, 6)) + 'Z', c.cel(BONE), 1.4 * s) + C(q(-1, -4)[0], q(-1, -4)[1], 2.6 * s, OL) + E(q(-12, -2)[0], q(-12, -2)[1], 3 * s, 1.6 * s, OL);
      o += F(pd([q(-18, 2), q(-17, 5), q(-16, 2)], true) + pd([q(-13, 3), q(-12, 6), q(-11, 3)], true) + pd([q(-8, 4), q(-7, 7), q(-6, 4)], true), BONE) + P(pd([q(2, -9), q(8, -18), q(8, -8)], true), c.cel('#c83a2a'), 1 * s);
      return o;
    }
    var col = kind === 'white' ? '#f0eee6' : '#e07a24', st = '#1e120a';
    o += P(pd([q(-9, -6), q(-10, -16), q(-3, -9)], true), c.cel(col), 1.2 * s) + P(pd([q(9, -6), q(10, -16), q(3, -9)], true), c.cel(col), 1.2 * s);
    o += body(c, 'M' + pt(q(-10, -4)) + 'C' + pt(q(-10, -12)) + ' ' + pt(q(10, -12)) + ' ' + pt(q(10, -4)) + 'C' + pt(q(11, 4)) + ' ' + pt(q(6, 10)) + ' ' + pt(q(0, 10)) + 'C' + pt(q(-6, 10)) + ' ' + pt(q(-11, 4)) + ' ' + pt(q(-10, -4)) + 'Z', col, L('M' + pt(q(-3, -10)) + 'L' + pt(q(-2, -6)) + 'M' + pt(q(3, -10)) + 'L' + pt(q(2, -6)) + 'M' + pt(q(-10, -2)) + 'L' + pt(q(-6, -1)) + 'M' + pt(q(10, -2)) + 'L' + pt(q(6, -1)), st, 1.6 * s), 1.5 * s);
    o += E(x, y + 5 * s, 6 * s, 4.4 * s, '#f6ecd8', 1 * s) + P(pd([q(-2, 2), q(2, 2), q(0, 4.4)], true), '#3a2014', 0.6 * s) + L('M' + pt(q(-6, -3)) + 'L' + pt(q(-2, -2)) + 'M' + pt(q(6, -3)) + 'L' + pt(q(2, -2)), OL, 1.4 * s);
    return o + P(pd([q(-3, 8), q(-2, 12), q(-1, 8)], true) + pd([q(3, 8), q(2, 12), q(1, 8)], true), '#fff', 0.6 * s);
  }
  // rifle lying from butt (x0, y0) to muzzle (x1, y1)
  function rifle(c, x0, y0, x1, y1, s) {
    var dx = x1 - x0, dy = y1 - y0, m = [x0 + dx * 0.42, y0 + dy * 0.42], d = 'M' + pt(m) + 'L' + pt([x1, y1]);
    return L(d, OL, 3.4 * s) + L(d, '#4a4a52', 1.8 * s) + limb('M' + pt([x0, y0]) + 'L' + pt([x0 + dx * 0.5, y0 + dy * 0.5]), '#8a5428', 2.6 * s) + P(pd([[x0 - 3 * s, y0], [x0 + 3 * s, y0], [x0 + dx * 0.16 + 1.5 * s, y0 + dy * 0.16]], true), c.cel('#7a4a24'), 1 * s) + C(m[0], m[1], 1.3 * s, '#c8a040', 0.6 * s);
  }
  function rifleRack(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 1, 22 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt(q(-18, 0)) + 'L' + pt(q(-14, -30)) + 'M' + pt(q(18, 0)) + 'L' + pt(q(14, -30)), '#6a4a2a', 2.6 * s) + limb('M' + pt(q(-20, -26)) + 'L' + pt(q(20, -26)), '#7a5634', 2.4 * s);
    [-11, -3, 5, 13].forEach(function (u, i) { o += rifle(c, x + (u - 3) * s, y - 1 * s, x + (u + 4) * s, y - 40 * s - (i % 2) * 3 * s, s); });
    return o;
  }
  // tiger pelt stretched on a pole frame
  function peltFrame(c, x, y, s, col) {
    col = col || '#e07a24'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 1, 22 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt(q(-18, 0)) + 'L' + pt(q(-16, -46)) + 'M' + pt(q(18, 0)) + 'L' + pt(q(16, -46)) + 'M' + pt(q(-20, -42)) + 'L' + pt(q(20, -42)) + 'M' + pt(q(-18, -6)) + 'L' + pt(q(18, -6)), '#6a4a2a', 2.4 * s);
    var pd0 = 'M' + pt(q(-12, -38)) + 'L' + pt(q(-6, -34)) + 'L' + pt(q(6, -34)) + 'L' + pt(q(12, -38)) + 'L' + pt(q(10, -26)) + 'L' + pt(q(14, -14)) + 'L' + pt(q(8, -16)) + 'L' + pt(q(4, -10)) + 'L' + pt(q(-4, -10)) + 'L' + pt(q(-8, -16)) + 'L' + pt(q(-14, -14)) + 'L' + pt(q(-10, -26)) + 'Z';
    o += body(c, pd0, col, L('M' + pt(q(-8, -30)) + 'L' + pt(q(-2, -28)) + 'M' + pt(q(8, -30)) + 'L' + pt(q(2, -28)) + 'M' + pt(q(-9, -22)) + 'L' + pt(q(-2, -21)) + 'M' + pt(q(9, -22)) + 'L' + pt(q(2, -21)) + 'M' + pt(q(-6, -15)) + 'L' + pt(q(-1, -15)) + 'M' + pt(q(6, -15)) + 'L' + pt(q(1, -15)), '#1e120a', 2 * s) + L('M' + pt(q(0, -34)) + 'L' + pt(q(0, -11)), '#f6e8cc', 1.6 * s), 1.4 * s);
    return o + L('M' + pt(q(-12, -38)) + 'L' + pt(q(-16, -42)) + 'M' + pt(q(12, -38)) + 'L' + pt(q(16, -42)) + 'M' + pt(q(-14, -14)) + 'L' + pt(q(-17, -7)) + 'M' + pt(q(14, -14)) + 'L' + pt(q(17, -7)), '#c8b080', 0.9 * s);
  }
  // cooking spit over a fire
  function spit(c, x, y, s) {
    return campfire(c, x, y, s) + limb('M' + pt([x - 18 * s, y + 2]) + 'L' + pt([x - 16 * s, y - 24 * s]) + 'M' + pt([x + 18 * s, y + 2]) + 'L' + pt([x + 16 * s, y - 24 * s]), '#5a3e24', 2.2 * s) + limb('M' + pt([x - 20 * s, y - 22 * s]) + 'L' + pt([x + 20 * s, y - 22 * s]), '#6a4a2a', 1.8 * s) +
      E(x, y - 22 * s, 9 * s, 5 * s, c.cel('#a8502a'), 1.4 * s) + E(x - 2 * s, y - 24 * s, 4 * s, 1.6 * s, '#e8a060', 0, 0.8);
  }
  // bamboo prisoner cage
  function bambooCage(c, x, y, s) {
    var w = 34 * s, h = 36 * s, o = E(x, y + 2, w * 0.7, 4 * s, '#000', 0, 0.3), bar = '';
    o += F(pd([[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], true), '#1a1a10', 0.5);
    for (var i = 0; i <= 5; i++) bar += 'M' + pt([x - w / 2 + w * i / 5, y]) + 'L' + pt([x - w / 2 + w * i / 5, y - h - 3 * s]);
    var hz = 'M' + pt([x - w / 2 - 3 * s, y - h]) + 'L' + pt([x + w / 2 + 3 * s, y - h]) + 'M' + pt([x - w / 2 - 3 * s, y - 4 * s]) + 'L' + pt([x + w / 2 + 3 * s, y - 4 * s]) + 'M' + pt([x - w / 2 - 2 * s, y - h * 0.55]) + 'L' + pt([x + w / 2 + 2 * s, y - h * 0.55]);
    o += L(bar + hz, OL, 4.4 * s) + L(bar, '#b8a860', 2.4 * s) + L(hz, '#9a8a4a', 2.4 * s);
    var jt = ''; for (var k = 0; k <= 5; k++) jt += 'M' + pt([x - w / 2 + w * k / 5 - 1.2 * s, y - h * 0.3]) + 'l' + n(2.4 * s) + ',0M' + pt([x - w / 2 + w * k / 5 - 1.2 * s, y - h * 0.8]) + 'l' + n(2.4 * s) + ',0';
    o += L(jt, '#6a5a2a', 1 * s) + L('M' + pt([x - w / 2 - 2 * s, y - h + 2 * s]) + 'L' + pt([x - w / 2 + 3 * s, y - h - 3 * s]) + 'M' + pt([x + w / 2 + 2 * s, y - h + 2 * s]) + 'L' + pt([x + w / 2 - 3 * s, y - h - 3 * s]), '#6a5a3a', 1.2 * s);
    return o;
  }
  // block tower of a wooden fort (x = centre, y = ground)
  function fortTower(c, x, y, s, col, banner) {
    col = col || '#6a5236'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 24 * s, 4 * s, '#000', 0, 0.3), lg = '';
    o += body(c, pd([q(-16, 0), q(-16, -60), q(16, -60), q(16, 0)], true), col, F(pd([q(4, -62), q(18, -62), q(18, 2), q(6, 2)], true), dk(col, 0.3), 0.8), 1.8 * s);
    for (var j = 1; j < 10; j++) lg += 'M' + pt(q(-16, -j * 6)) + 'L' + pt(q(16, -j * 6));
    o += L(lg, dk(col, 0.35), 0.9 * s) + P(pd([q(-22, -60), q(22, -60), q(20, -68), q(-20, -68)], true), c.cel(lt(col, 0.08)), 1.6 * s);
    for (var k = -18; k < 18; k += 8) o += P(pd([q(k, -68), q(k + 2, -76), q(k + 4, -68)], true), c.cel(lt(col, 0.1)), 1.1 * s);
    o += R(x - 5 * s, y - 46 * s, 10 * s, 4 * s, '#12100c', 0.8) + C(x, y - 44 * s, 8 * s, glow(c, '#ffb040', 0.35));
    if (banner) o += body(c, pd([q(-12, -58), q(0, -58), q(0, -30), q(-6, -34), q(-12, -30)], true), banner, F(pd([q(-5, -58), q(1, -58), q(1, -30), q(-5, -30)], true), '#000', 0.25), 1.3 * s) + kurzenMark(x - 6 * s, y - 46 * s, 0.55 * s);
    return o;
  }
  // fort gate: two posts, a lintel with spikes, doors ajar
  function fortGate(c, x, y, s, col) {
    col = col || '#6a5236'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '';
    o += F(pd([q(-20, 0), q(-20, -40), q(20, -40), q(20, 0)], true), '#14120c');
    o += body(c, pd([q(-20, 0), q(-20, -38), q(-6, -36), q(-6, 0)], true), col, L('M' + pt(q(-15, -37)) + 'L' + pt(q(-15, 0)) + 'M' + pt(q(-10, -36.5)) + 'L' + pt(q(-10, 0)), dk(col, 0.35), 1 * s) + L('M' + pt(q(-20, -26)) + 'L' + pt(q(-6, -24)) + 'M' + pt(q(-20, -10)) + 'L' + pt(q(-6, -9)), '#3a3434', 2 * s), 1.6 * s);
    o += limb('M' + pt(q(-24, 2)) + 'L' + pt(q(-24, -48)) + 'M' + pt(q(24, 2)) + 'L' + pt(q(24, -48)), dk(col, 0.1), 5 * s) + limb('M' + pt(q(-28, -44)) + 'L' + pt(q(28, -44)), col, 4 * s);
    return o + skull(c, x, y - 50 * s, 0.9 * s);
  }
  // ---- goblin camp ----
  function stump(c, x, y, s) {
    var o = E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.25) + body(c, 'M' + pt([x - 8 * s, y]) + 'L' + pt([x - 7 * s, y - 10 * s]) + 'L' + pt([x + 7 * s, y - 10 * s]) + 'L' + pt([x + 8 * s, y]) + 'L' + pt([x + 12 * s, y + 1]) + 'L' + pt([x - 12 * s, y + 1]) + 'Z', '#7a5634', F(pd([[x + 2 * s, y - 12 * s], [x + 12 * s, y - 12 * s], [x + 12 * s, y + 2], [x + 3 * s, y + 2]], true), '#000', 0.25), 1.4 * s);
    return o + E(x, y - 10 * s, 7 * s, 2.4 * s, c.cel('#d8b884'), 1.2 * s) + L(ellD(x, y - 10 * s, 3.6 * s, 1.1 * s), '#a07a4a', 0.7 * s);
  }
  // corrugated-metal shack with a lean-to roof, patches, a stovepipe (x = left, y = ground)
  function shack(c, x, y, w, h, col, seed) {
    col = col || '#8a8a7e'; var r = rng(seed || 5), o = E(x + w / 2, y + 2, w * 0.62, 4, '#000', 0, 0.28), rb = '';
    for (var i = 3; i < w; i += 4) rb += 'M' + pt([x + i, y - h + (i / w) * 6]) + 'L' + pt([x + i, y]);
    o += body(c, pd([[x, y], [x, y - h], [x + w, y - h + 6], [x + w, y]], true), col, L(rb, dk(col, 0.28), 0.9) + R(x + w * 0.1, y - h * 0.8, w * 0.3, h * 0.3, '#b8663a', 0) + F(pd([[x + w * 0.66, y - h - 4], [x + w + 2, y - h - 4], [x + w + 2, y + 2], [x + w * 0.66, y + 2]], true), dk(col, 0.3), 0.8), 1.8);
    o += P(pd([[x - 6, y - h + 2], [x + w + 6, y - h + 9], [x + w + 6, y - h + 4], [x - 6, y - h - 4]], true), c.cel('#a8483a'), 1.6);
    o += R(x + w * 0.5, y - h * 0.62, w * 0.3, h * 0.62, '#2a2420', 1.4) + C(x + w * 0.56, y - h * 0.3, 1.2, '#c8a040');
    o += C(x + w * 0.25, y - h * 0.4, 10, glow(c, '#ffc860', 0.45)) + R(x + w * 0.16, y - h * 0.5, w * 0.18, h * 0.2, '#ffd27a', 1.2);
    o += limb('M' + pt([x + w * 0.2, y - h - 2]) + 'L' + pt([x + w * 0.2, y - h - 16]), '#4a4a50', 3.4) + smoke(x + w * 0.2, y - h - 18, 0.45, '#8a8a88', 0.5, -0.5);
    return o + L('M' + pt([x + 3, y - h * 0.9]) + 'l4,0 M' + pt([x + w - 6, y - h * 0.7]) + 'l3,0', '#c8c8c0', 1, 0.7 * r() + 0.3);
  }
  // pipe run through the given points, with flanges at each joint
  function pipeRun(c, pts, w, col) {
    col = col || '#8a7a5a'; var d = pd(pts), o = L(d, OL, w + 3.4) + L(d, col, w) + '<path transform="translate(0,' + n(-w * 0.22) + ')" d="' + d + '" fill="none" stroke="' + lt(col, 0.35) + '" stroke-width="' + n(w * 0.3) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>';
    pts.forEach(function (p, i) { if (i && i < pts.length - 1) o += C(p[0], p[1], w * 0.9, c.cel(dk(col, 0.1)), 1.2); });
    return o;
  }
  // lattice jib crane with a hook and a hanging crate (x = mast foot, y = ground)
  function crane(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, st = '#c89a2a', o = E(x, y + 2, 20 * s, 4 * s, '#000', 0, 0.3), lt2 = '';
    o += P(pd([q(-12, 0), q(-4, -8), q(4, -8), q(12, 0)], true), c.cel('#5a5a60'), 1.6 * s);
    var mast = 'M' + pt(q(-4, -8)) + 'L' + pt(q(-3, -96)) + 'M' + pt(q(4, -8)) + 'L' + pt(q(3, -96));
    for (var i = 0; i < 8; i++) lt2 += 'M' + pt(q(-4, -8 - i * 11)) + 'L' + pt(q(4, -19 - i * 11));
    var tip = q(-70, -110), boom = 'M' + pt(q(0, -92)) + 'L' + pt(tip) + 'M' + pt(q(0, -84)) + 'L' + pt(q(-68, -106));
    o += L(mast + boom, OL, 4.4 * s) + L(mast + boom, st, 2.4 * s) + L(lt2, OL, 2.6 * s) + L(lt2, dk(st, 0.1), 1.2 * s);
    o += L('M' + pt(q(0, -96)) + 'L' + pt(q(18, -60)) + 'M' + pt(q(0, -96)) + 'L' + pt(tip), '#2a2a2e', 0.9 * s) + P(pd([q(14, -60), q(26, -60), q(26, -48), q(14, -48)], true), c.cel('#5a5a60'), 1.4 * s);
    o += L('M' + pt(q(-68, -108)) + 'L' + pt(q(-68, -58)), '#2a2a2e', 1 * s) + L('M' + pt(q(-68, -58)) + 'q' + n(3 * s) + ',' + n(3 * s) + ' 0,' + n(6 * s) + 'q' + n(-3 * s) + ',' + n(1 * s) + ' ' + n(-3 * s) + ',' + n(-2 * s), OL, 1.8 * s);
    return o + L('M' + pt(q(-68, -52)) + 'L' + pt(q(-76, -44)) + 'M' + pt(q(-68, -52)) + 'L' + pt(q(-60, -44)), '#2a2a2e', 0.9 * s) + crate(c, x - 68 * s, y - 28 * s, 0.9 * s, '#b0804a');
  }
  function oilBarrel(c, x, y, s) { return E(x + 6 * s, y + 2, 14 * s, 3 * s, '#101014', 0, 0.55) + barrel(c, x, y, s, '#3e3e46') + R(x - 8 * s, y - 12 * s, 16 * s, 3 * s, '#e0b030', 0) + F(pd([[x - 3 * s, y - 12 * s], [x, y - 12 * s], [x - 3 * s, y - 9 * s], [x - 6 * s, y - 9 * s]], true) + pd([[x + 3 * s, y - 12 * s], [x + 6 * s, y - 12 * s], [x + 3 * s, y - 9 * s], [x, y - 9 * s]], true), '#1a1a1e'); }
  // timber-framed mine mouth cut into a bank (x = centre, y = ground)
  function mineMouth(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = F('M' + pt(q(-20, 0)) + 'L' + pt(q(-20, -26)) + 'Q' + pt(q(0, -40)) + ' ' + pt(q(20, -26)) + 'L' + pt(q(20, 0)) + 'Z', '#0e0c0a');
    o += C(x, y - 10 * s, 14 * s, glow(c, '#ffb040', 0.3));
    o += limb('M' + pt(q(-20, 2)) + 'L' + pt(q(-18, -32)) + 'M' + pt(q(20, 2)) + 'L' + pt(q(18, -32)), '#7a5634', 4.4 * s) + limb('M' + pt(q(-26, -32)) + 'L' + pt(q(26, -32)), '#8a6440', 4.8 * s);
    var tr = 'M' + pt(q(-6, -6)) + 'L' + pt(q(-14, 30)) + 'M' + pt(q(6, -6)) + 'L' + pt(q(14, 30)), sl = '';
    for (var i = 0; i < 6; i++) { var t = i / 5; sl += 'M' + pt(q(-7 - 8 * t, -4 + 34 * t)) + 'L' + pt(q(7 + 8 * t, -4 + 34 * t)); }
    return o + L(sl, '#5a4028', 2.4 * s) + L(tr, OL, 2.6 * s) + L(tr, '#8a8e96', 1.2 * s) + lantern2(c, x + 26 * s, y - 30 * s, s);
  }
  function lantern2(c, x, y, s) { return L('M' + pt([x, y - 2 * s]) + 'L' + pt([x, y + 3 * s]), OL, 1 * s) + C(x, y + 8 * s, 10 * s, glow(c, '#ffc860', 0.55)) + P(pd([[x - 3 * s, y + 3 * s], [x + 3 * s, y + 3 * s], [x + 3.4 * s, y + 11 * s], [x - 3.4 * s, y + 11 * s]], true), '#ffd27a', 1 * s); }
  // ---- night ----
  function moon(c, x, y, r) { return C(x, y, r * 4, glow(c, '#dfe8ff', 0.4)) + C(x, y, r, '#eef2fa') + C(x - r * 0.3, y - r * 0.2, r * 0.25, '#d0d8e8') + C(x + r * 0.35, y + r * 0.3, r * 0.18, '#d0d8e8') + C(x + r * 0.1, y - r * 0.5, r * 0.12, '#d8e0ee'); }
  function stars(seed, cnt, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(r() * 400, r() * (y1 || 100), 0.5 + r() * 0.8, '#f0f4ff', 0, 0.4 + r() * 0.5); return o; }
  function eyePair(c, x, y, s, col) { col = col || VOO; return C(x, y, 7 * s, glow(c, col, 0.55)) + F(pd([[x - 5 * s, y], [x - 2.5 * s, y - 1.4 * s], [x - 1 * s, y + 0.6 * s]], true) + pd([[x + 5 * s, y], [x + 2.5 * s, y - 1.4 * s], [x + 1 * s, y + 0.6 * s]], true), col); }
  function fireflies(seed, cnt, x0, x1, y0, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); o += C(x, y, 3, '#d8ff8a', 0, 0.18) + C(x, y, 0.9, '#f0ffc0', 0, 0.9); } return o; }

  // ============================================================
  //  SCENES
  // ============================================================
  function trophyWall(c, x, y, s) {
    var o = E(x, y + 2, 34 * s, 4 * s, '#000', 0, 0.26) + limb('M' + pt([x - 30 * s, y]) + 'L' + pt([x - 28 * s, y - 56 * s]) + 'M' + pt([x + 30 * s, y]) + 'L' + pt([x + 28 * s, y - 56 * s]), '#6a4a2a', 3.4 * s) + limb('M' + pt([x - 34 * s, y - 50 * s]) + 'L' + pt([x + 34 * s, y - 52 * s]), '#7a5634', 3 * s);
    o += P(pd([[x - 36 * s, y - 56 * s], [x, y - 68 * s], [x + 36 * s, y - 58 * s], [x + 30 * s, y - 54 * s], [x, y - 62 * s], [x - 30 * s, y - 52 * s]], true), c.cel('#b89a56'), 1.4 * s);
    return o + trophy(c, x - 18 * s, y - 36 * s, 0.9 * s, 'raptor') + trophy(c, x + 2 * s, y - 38 * s, 1 * s, 'tiger') + trophy(c, x + 22 * s, y - 34 * s, 0.85 * s, 'white') + trophy(c, x - 2 * s, y - 16 * s, 0.8 * s, 'raptor');
  }
  var SCENES = {
    rebel_camp: function (c) {
      var o = svSky(c) + sun(c, 296, 36, 12, '#fff2c0');
      o += farJungle(501, 116, '#78a47a', 16, 30, 52, 5) + haze(c, 110, 26, 0.35, '#eef0c4');
      o += farJungle(503, 138, '#4e7e50', 14, 30, 56, 3) + shafts(c, 505, 5, 0.22);
      o += floor(c, 150, '#8e7c4a', '#3e3620', 507);
      o += palisade(c, -4, 106, 158, 46, '#8a6a44', 509) + palisade(c, 248, 404, 156, 46, '#86683f', 511);
      o += watchTower(c, 352, 172, 0.95, '#b89a56', ALLY, rebelMark);
      o += tent(c, 58, 178, 0.95, '#dccc9e', ALLY) + tent(c, 176, 166, 0.78, '#cfbf90', GOLD);
      o += flag(c, 122, 180, 60, 1, ALLY, GOLD, rebelMark) + flag(c, 262, 172, 56, 0.9, ALLY, GOLD, rebelMark);
      o += campfire(c, 222, 202, 0.7) + crate(c, 292, 198, 0.9) + crate(c, 306, 206, 0.8, '#9a6a3a') + barrel(c, 150, 198, 0.8) + sack(c, 166, 202, 0.7) + rifleRack(c, 268, 218, 0.8);
      o += grass(513, 172, 238, '#4a5a2a', 40, 0.6, 1.4, 1.1) + pebbles(514, 180, 236, '#6a5a3a', 12);
      o += palm(c, 4, 238, 1.3, 20, PALM, 515) + fern(c, 384, 240, 1.3) + leafClump(c, 400, 230, 1.1, LEAF, true) + fern(c, 156, 246, 0.8, '#5a9a42');
      o += canopyTop(c, 517, '#264e2a', 18) + vines(c, 519, 6, 60, 400, 26, 70);
      return o + motes(521, 24, 0, 400, 30, 200) + vignette(c, '#fff8d0', '#0e140a');
    },
    grom_gol: function (c) {
      var o = svSky(c, '#78b0bc', '#d6d49c', '#f4c47a') + sun(c, 78, 64, 15, '#fff0b0') + cloud(170, 40, 1, 0.8, '#fff8e8') + cloud(40, 30, 0.7, 0.7, '#fff8e8');
      o += lake(c, 112, 180, '#72bcb4', '#2e7a82', 531, 30) + waves(533, 118, 176, 26);
      o += F('M-4,113 C20,108 44,110 70,112 L70,114 L-4,114 Z', '#6a9a86');
      o += body(c, 'M150,180 C168,146 206,120 262,112 C300,106 350,100 404,96 L404,180 Z', '#4e8a50', F('M150,180 C168,146 206,120 262,112 C300,106 350,100 404,96 L404,104 C350,108 300,114 262,120 C214,128 178,150 164,180 Z', '#6aa060', 0.7), 1.6);
      o += farJungle(535, 124, '#3e7244', 9, 26, 46, 3, 200, 420);
      o += zeppelin(c, 214, 54, 0.62);
      o += body(c, 'M-4,176 C60,168 130,172 200,166 C260,160 330,158 404,156 L404,242 L-4,242 Z', SAND, R(-4, 150, 408, 96, c.lg([[0, '#f0dca4', 0.4], [0.5, '#a88a50', 0.3], [1, '#5a4428', 0.85]])), 1.6);
      o += L('M-4,178 C60,170 130,174 196,168', '#f4f8f0', 2.2, 0.8);
      o += palisade(c, 170, 404, 164, 40, '#7a5634', 537, true);
      o += zepTower(c, 330, 176, 0.9);
      o += orcHut(c, 214, 182, 0.9, '#9a5a3a') + orcHut(c, 280, 190, 0.7, '#8a4e32');
      o += flag(c, 170, 196, 58, 1, HRED, '#1a1009', hordeMark, true) + flag(c, 392, 186, 50, 0.8, HRED, '#1a1009', hordeMark, true);
      o += campfire(c, 250, 212, 0.6) + barrel(c, 150, 210, 0.8, '#7a4a2a') + crate(c, 364, 212, 0.8) + skullSpike(c, 196, 214, 26, 0.8);
      o += pebbles(539, 190, 236, '#b8a070', 16) + driftwood(c, 40, 204, 50, -0.05, 0.9);
      o += palm(c, 30, 196, 1.15, -40, PALM, 541) + palm(c, 110, 190, 0.9, -24, '#62a040', 543) + fern(c, 392, 244, 1.2, LEAF) + leafClump(c, 6, 240, 1, LEAF);
      return o + motes(545, 14, 0, 400, 20, 180, '#fff4d0') + vignette(c, '#fff4d8', '#140e06');
    },
    nesingwary_camp: function (c) {
      var o = svSky(c, '#8cba98', '#d4da96', '#f0d88c') + sun(c, 120, 30, 11);
      o += farJungle(551, 114, '#7aa47a', 16, 30, 52, 4) + haze(c, 108, 24, 0.35, '#eef0c4');
      o += farJungle(553, 136, '#4a7a4c', 13, 30, 60, 4) + shafts(c, 555, 6, 0.24);
      o += floor(c, 148, '#8a7a4e', '#3a3420', 557);
      o += tent(c, 60, 172, 0.9, '#ece0c0', '#a88a50') + tent(c, 284, 164, 0.76, '#e4d8b4', '#a88a50');
      o += trophyWall(c, 176, 168, 1);
      o += rifleRack(c, 346, 190, 0.9) + peltFrame(c, 378, 214, 0.95) + crate(c, 120, 190, 0.8) + crate(c, 132, 198, 0.7, '#9a6a3a') + sack(c, 104, 198, 0.7);
      o += spit(c, 230, 206, 0.72) + barrel(c, 262, 214, 0.75);
      o += grass(559, 170, 238, '#4a5a2a', 40, 0.6, 1.4, 1.1) + pebbles(560, 176, 236, '#6a5a3a', 12);
      o += fern(c, 396, 246, 1.2) + leafClump(c, 12, 236, 1.2, LEAF) + fern(c, 30, 246, 1, '#5a9a42') + palm(c, 404, 214, 1.1, -26, PALM, 561);
      o += canopyTop(c, 563, '#264e2a', 20) + vines(c, 565, 7, 0, 330, 24, 76);
      return o + motes(567, 24, 0, 400, 30, 200) + vignette(c, '#fff8d0', '#0e140a');
    },
    kurzen_compound: function (c) {
      var o = svSky(c, '#6a8e70', '#a2ae80', '#c4b47c');
      o += farJungle(571, 114, '#5e8462', 16, 34, 56, 4) + haze(c, 108, 24, 0.3, '#d8dcb0');
      o += farJungle(573, 134, '#36603c', 14, 30, 60, 3);
      o += floor(c, 158, '#6e6038', '#2e2816', 575);
      o += palisade(c, -4, 170, 166, 58, '#6a5236', 577) + palisade(c, 230, 404, 166, 58, '#66503a', 579);
      o += fortGate(c, 200, 166, 1.2, '#6a5236');
      o += fortTower(c, 120, 172, 1, '#6e5438', KGRN) + fortTower(c, 300, 170, 1, '#6a5236', KGRN);
      o += flag(c, 30, 186, 60, 1, KGRN, '#c8b88a', kurzenMark) + flag(c, 370, 184, 58, 1, KGRN, '#c8b88a', kurzenMark);
      o += bambooCage(c, 70, 204, 1.05) + bambooCage(c, 250, 196, 0.8) + bambooCage(c, 340, 212, 0.95);
      o += brazier(c, 164, 214, 0.8) + crate(c, 110, 212, 0.9, '#7a5a34') + barrel(c, 128, 218, 0.8, '#5a4a30') + sack(c, 300, 222, 0.8, '#8a8a5a');
      o += grass(581, 176, 238, '#34401e', 36, 0.6, 1.4, 1.1) + pebbles(582, 180, 236, '#5a4e30', 12);
      o += fern(c, 8, 246, 1.25, '#3e7a36') + leafClump(c, 398, 238, 1.15, '#3e7a36', true) + fern(c, 206, 250, 0.8, '#3e7a36');
      o += canopyTop(c, 583, '#1e3e22', 24) + vines(c, 585, 8, 0, 400, 26, 84, '#3e6a2a');
      return o + motes(587, 12, 0, 400, 30, 180) + vignette(c, '#f0f0c8', '#080c06');
    },
    zuuldaia_ruins: function (c) {
      var o = svSky(c, '#86b49c', '#cad690', '#eed88a') + sun(c, 330, 30, 11);
      o += farJungle(601, 112, '#76a07a', 16, 30, 50, 4) + haze(c, 106, 24, 0.35, '#eef0c4');
      o += farJungle(603, 132, '#4a7a4c', 14, 30, 56, 3) + tPillar(c, 230, 132, 18, 46, '#8a9888', 605, true) + tPillar(c, 262, 132, 16, 36, '#869484', 606, true);
      o += floor(c, 140, '#7e7a48', '#34321c', 607);
      var T = taper([[430, 124], [320, 128], [220, 136], [130, 158], [40, 196], [-30, 236]], 14, 84, 6);
      o += F(taper([[430, 122], [320, 126], [220, 134], [130, 156], [40, 194], [-30, 234]], 22, 98, 6).d, '#5a5230', 0.9);
      o += body(c, T.d, '#4e9a90', F(ribbonBand(T, 0.62, 1), '#2e6a66', 0.8) + L(bands(T, 3, 2), '#b8ece0', 1.2, 0.6), 1.6) + L(along(T, 0.22), '#dcf6ee', 1.4, 0.6);
      o += carvedFace(c, 150, 150, 0.9, '#8a9a88') + mossTop(132, 170, 130, 608) + rubble(c, 100, 166, 0.9, '#8a9888', 609);
      o += tPillar(c, 26, 180, 24, 84, '#8c9a86', 611, true) + tPillar(c, 332, 170, 22, 78, '#8a9888', 612) + tPillar(c, 366, 176, 20, 58, '#86947f', 613, true);
      o += altar(c, 214, 196, 0.95) + warTotem(c, 170, 204, 0.85) + warTotem(c, 300, 186, 0.8) + skullSpike(c, 262, 200, 30, 0.8);
      o += rubble(c, 360, 206, 0.9, '#8a9888', 614) + grass(615, 176, 238, '#4a5a2a', 36, 0.6, 1.4, 1.1);
      o += reeds(c, 60, 210, 1, '#7a9a4a') + reeds(c, 112, 190, 0.8, '#7a9a4a') + fern(c, 392, 248, 1.25) + leafClump(c, 8, 244, 1.1, LEAF);
      o += canopyTop(c, 617, '#264e2a', 18) + vines(c, 619, 6, 0, 400, 24, 70);
      return o + motes(621, 18, 0, 400, 30, 200) + vignette(c, '#fff8d0', '#0e140a');
    },
    lake_nazferiti: function (c) {
      var o = svSky(c, '#8ab8a4', '#d0da98', '#f0dc92') + sun(c, 200, 44, 12) + cloud(300, 36, 0.8, 0.6, '#fff8e8');
      o += farJungle(631, 108, '#76a07a', 18, 28, 48, 5) + haze(c, 104, 22, 0.35, '#eef0c4');
      o += farJungle(633, 122, '#4a7a4c', 16, 24, 50, 4);
      o += lake(c, 120, 190, '#7ab8a8', '#2e6a62', 635, 34) + haze(c, 128, 14, 0.25, '#f0f4d8');
      o += reedLine(637, 128, '#4a6a3a', 60, 6, 14, -5, 405, 1.1);
      o += lily(c, 150, 146, 7, true) + lily(c, 168, 152, 5) + lily(c, 250, 132, 6) + lily(c, 90, 162, 8, true) + lily(c, 300, 140, 6) + lily(c, 40, 150, 6, true) + lily(c, 210, 150, 5);
      o += croc(c, 250, 140, 0.75, '#56703a') + croc(c, 120, 154, 0.95) + croc(c, 66, 178, 1.2);
      o += reeds(c, 180, 168, 0.9, REED) + reeds(c, 198, 164, 1, REED) + reeds(c, 346, 152, 0.8, REED) + reeds(c, 18, 146, 0.9, REED);
      o += body(c, 'M-4,188 C50,186 120,182 170,170 C210,160 250,154 300,154 C340,154 380,152 404,150 L404,242 L-4,242 Z', '#6a6038', R(-4, 148, 408, 98, c.lg([[0, '#8a7c4a', 0.5], [1, '#2e2616', 0.9]])) + F('M-4,188 C50,186 120,182 170,170 C210,160 250,154 300,154 C340,154 380,152 404,150 L404,156 C380,158 340,160 300,160 C250,160 210,166 172,176 C120,188 50,192 -4,194 Z', '#9a8c5a', 0.6), 1.6);
      o += nest(c, 150, 214, 1.1, 3) + nest(c, 250, 202, 0.8, 2) + pebbles(639, 194, 236, '#8a7a4e', 16) + grass(641, 190, 238, '#3e4a22', 30, 0.6, 1.4, 1.1);
      o += bone(96, 226, 14, 0.4, 0.9) + reeds(c, 84, 208, 1.2, REED) + reeds(c, 380, 204, 1.25, REED) + leafClump(c, 404, 244, 1.2, LEAF, true) + fern(c, 12, 248, 1.1);
      o += palm(c, 330, 186, 0.95, 30, PALM, 643) + canopyTop(c, 645, '#264e2a', 14) + vines(c, 647, 4, 0, 400, 20, 50);
      return o + motes(649, 16, 0, 400, 30, 200) + vignette(c, '#fff8d0', '#0e140a');
    },
    zul_kunda: function (c) {
      var o = svSky(c, '#7aa48c', '#bcc88a', '#dccc86');
      o += farJungle(661, 110, '#6a9470', 16, 30, 54, 4) + haze(c, 104, 22, 0.3, '#e6eac0');
      o += farJungle(663, 128, '#3e6a42', 14, 30, 58, 3);
      o += floor(c, 150, '#7a7446', '#2e2c18', 665);
      o += stepTemple(c, 200, 160, 0.95, '#8c9a86', 667);
      o += tPillar(c, 40, 172, 26, 92, '#8a9888', 669, true) + tPillar(c, 330, 168, 24, 86, '#8c9a86', 671) + tPillar(c, 374, 176, 20, 60, '#86947f', 672, true);
      o += skullSpike(c, 150, 184, 34, 0.9) + skullSpike(c, 250, 184, 34, 0.9) + skullSpike(c, 120, 204, 40, 1) + skullSpike(c, 282, 202, 40, 1) + skullSpike(c, 96, 176, 26, 0.7);
      o += torch(c, 176, 142, 0.8) + torch(c, 224, 142, 0.8);
      o += rubble(c, 100, 214, 1, '#8a9888', 673) + rubble(c, 320, 216, 0.9, '#8a9888', 674) + bone(160, 222, 16, 0.3, 0.9) + bone(236, 228, 14, -0.4, 0.8) + skull(c, 204, 226, 1);
      o += grass(675, 176, 238, '#3e4a22', 36, 0.6, 1.4, 1.1);
      o += fern(c, 390, 246, 1.25, '#447e38') + leafClump(c, 6, 240, 1.2, '#447e38') + canopyTop(c, 677, '#203e22', 18) + vines(c, 679, 7, 0, 400, 26, 80, '#3e6a2a');
      return o + motes(681, 14, 0, 400, 30, 200) + vignette(c, '#f8f4c8', '#0a0e06');
    },
    venture_base_camp: function (c) {
      var o = svSky(c, '#8aaa98', '#c8cc94', '#e8cc8c');
      o += smoke(90, 90, 1.5, '#6a6a64', 0.45, 0.6) + smoke(250, 80, 1.3, '#6a6a64', 0.4, 0.8);
      o += farJungle(691, 112, '#6e9670', 16, 30, 50, 4) + haze(c, 104, 22, 0.35, '#e8e4c0');
      o += body(c, 'M250,168 C262,130 300,104 350,98 C380,95 396,100 404,104 L404,168 Z', '#5e7a46', F('M250,168 C262,130 300,104 350,98 C380,95 396,100 404,104 L404,112 C380,108 350,108 318,118 C288,128 268,148 262,168 Z', '#7a9a58', 0.7) + R(250, 130, 160, 40, '#6a5638', 0.6), 1.6);
      o += farJungle(693, 130, '#3e6a42', 7, 24, 44, 2, 280, 420);
      o += floor(c, 152, '#7e6a46', '#34281a', 695);
      o += mineMouth(c, 336, 164, 1.1);
      o += pipeRun(c, [[30, 150], [30, 128], [130, 128], [130, 160]], 4, '#9a8a64') + pipeRun(c, [[180, 170], [240, 170], [240, 150], [300, 150]], 3.4, '#7a7a80');
      o += shack(c, 6, 170, 60, 40, '#8a8a7e', 697) + shack(c, 180, 162, 50, 34, '#7e8278', 698);
      o += crane(c, 150, 184, 0.9);
      o += oilBarrel(c, 250, 196, 0.9) + oilBarrel(c, 266, 202, 0.85) + oilBarrel(c, 90, 196, 0.8) + crate(c, 118, 206, 0.9, '#b0804a') + crate(c, 386, 200, 0.8);
      o += stump(c, 40, 214, 1) + stump(c, 214, 222, 0.9) + stump(c, 320, 232, 1.1) + stump(c, 170, 204, 0.7) + stump(c, 372, 222, 0.8);
      o += pebbles(699, 176, 236, '#5a4a30', 16) + L('M' + pt([0, 230]) + 'C100,216 200,226 300,214 C340,210 380,212 404,210', '#4a3a24', 2, 0.6);
      o += fern(c, 396, 248, 1.2, '#4a863a') + leafClump(c, 4, 244, 1.1, '#4a863a') + canopyTop(c, 700, '#264e2a', 14);
      return o + motes(701, 10, 0, 400, 30, 200, '#f0e8c0') + vignette(c, '#fff4d0', '#0e0c06');
    },
    balia_mah_ruins: function (c) {
      var o = sky(c, '#0a1422', '#172a3a', '#26403e') + stars(711, 50, 110) + moon(c, 306, 46, 14);
      o += farJungle(713, 118, '#16302a', 16, 30, 56, 5) + farJungle(715, 136, '#0f2420', 14, 30, 60, 3);
      o += F(pd([[250, -2], [330, -2], [300, 200], [214, 200]], true), c.lg([[0, '#c8dcff', 0.28], [1, '#c8dcff', 0.02]])) + F(pd([[340, -2], [380, -2], [390, 200], [344, 200]], true), c.lg([[0, '#c8dcff', 0.14], [1, '#c8dcff', 0]]));
      o += floor(c, 150, '#2e443a', '#0c1612', 717);
      o += F('M200,242 C220,200 240,170 262,152 L300,152 C300,180 310,210 330,242 Z', '#8aa0b8', 0.12);
      o += tPillar(c, 58, 170, 26, 104, '#4e5e62', 719, true) + tPillar(c, 150, 158, 22, 90, '#56666a', 720) + tPillar(c, 330, 162, 24, 96, '#52626a', 721, true) + tPillar(c, 236, 150, 16, 60, '#4a5a5e', 722, true);
      o += body(c, pd([[142, 70], [246, 84], [246, 96], [214, 92], [206, 98], [196, 90], [142, 82]], true), '#56666a', F(pd([[142, 78], [246, 92], [246, 98], [142, 84]], true), '#2e3a3e', 0.8) + L('M170,74 L170,86 M200,78 L200,90 M226,82 L226,94', '#2e3a3e', 1.1), 1.8) + mossTop(142, 246, 72, 726, '#3e6a34');
      o += vineSwag(c, 70, 72, 150, 76, 24, '#2e5a34') + vineSwag(c, 170, 86, 240, 96, 16, '#2e5a34') + vineSwag(c, 246, 96, 336, 74, 22, '#2e5a34');
      o += carvedFace(c, 200, 174, 0.7, '#4e5e62') + rubble(c, 120, 196, 1, '#4e5e62', 723) + rubble(c, 290, 200, 0.9, '#52626a', 724);
      o += eyePair(c, 34, 150, 1.3) + eyePair(c, 196, 138, 1) + eyePair(c, 376, 176, 1.3) + eyePair(c, 272, 118, 0.8);
      o += grass(725, 176, 238, '#16261e', 36, 0.6, 1.4, 1.1);
      o += fern(c, 390, 248, 1.3, '#23452e') + leafClump(c, 8, 240, 1.2, '#23452e') + fern(c, 150, 250, 0.9, '#23452e') + leafClump(c, 252, 176, 0.6, '#244632') + leafClump(c, 96, 180, 0.7, '#244632', true) + bigLeaf(c, 404, 200, 1.1, -PI + 0.5, '#1e3a28');
      o += canopyTop(c, 727, '#08140e', 20) + vines(c, 729, 6, 0, 270, 26, 84, '#20402a') + vines(c, 730, 1, 380, 400, 30, 70, '#20402a');
      return o + fireflies(731, 22, 0, 400, 60, 220) + vignette(c, '#b8c8ff', '#020406');
    }
  };
  // ---- goblin (Deepgold Company) — copy of the art_stonetalon.js rig, plus goggles, a dented hat and free limb sizes ----
  function gobHead(c, x, y, o) {
    var sk = o.skin || '#6aa84a', s = '';
    s += P('M' + pt([x + 8, y - 4]) + 'C' + pt([x + 18, y - 10]) + ' ' + pt([x + 26, y - 14]) + ' ' + pt([x + 32, y - 18]) + 'C' + pt([x + 28, y - 8]) + ' ' + pt([x + 20, y + 2]) + ' ' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 12, y - 2]) + 'C' + pt([x + 18, y - 6]) + ' ' + pt([x + 24, y - 10]) + ' ' + pt([x + 28, y - 14]) + 'C' + pt([x + 24, y - 6]) + ' ' + pt([x + 18, y]) + ' ' + pt([x + 12, y + 3]) + 'Z', '#c87a6a', 0.6);
    s += P('M' + pt([x - 6, y - 8]) + 'L' + pt([x - 16, y - 18]) + 'L' + pt([x - 2, y - 12]) + 'Z', c.cel(dk(sk, 0.15)), 1.6);
    var d = 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 17]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x + 12, y + 5]) + 'C' + pt([x + 10, y + 13]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 12, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 1, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.22), 0.8));
    s += P('M' + pt([x - 9, y - 1]) + 'C' + pt([x - 16, y - 1]) + ' ' + pt([x - 22, y + 3]) + ' ' + pt([x - 25, y + 6]) + 'C' + pt([x - 19, y + 7]) + ' ' + pt([x - 13, y + 7]) + ' ' + pt([x - 8, y + 5]) + 'Z', c.cel(lt(sk, 0.05)), 1.8);
    if (o.specs) s += L('M' + pt([x - 1, y - 4]) + 'L' + pt([x + 12, y - 7]), '#4a2e1a', 2.4) + C(x - 5, y - 4, 4.6, c.cel(o.specCol || '#c89a3a'), 1.4) + C(x - 5, y - 4, 3.1, o.lens || '#9ae8f4', 1) + C(x - 6.2, y - 5.2, 1, '#ffffff');
    else s += E(x - 5, y - 4, 3, 2.6, '#fff4c0', 1.2) + C(x - 6.2, y - 4, 1.2, OL);
    s += L('M' + pt([x - 11, y - 9.5]) + 'L' + pt([x - 1, y - 8.5]), OL, 2);
    if (o.grin) {
      s += P('M' + pt([x - 13, y + 8]) + 'Q' + pt([x - 6, y + 15]) + ' ' + pt([x + 3, y + 8]) + 'Q' + pt([x - 5, y + 10]) + ' ' + pt([x - 13, y + 8]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 11, y + 9]) + 'L' + pt([x + 1, y + 9]), '#f4ecd6', 1.6) + R(x - 7, y + 8.2, 2.6, 2.6, '#ffd040', 0.8);
    } else s += P('M' + pt([x - 12, y + 9]) + 'Q' + pt([x - 6, y + 13]) + ' ' + pt([x, y + 9]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 10, y + 9.6]) + 'L' + pt([x - 2, y + 9.6]), '#f4ecd6', 1.3);
    if (o.cigar) s += L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), OL, 3.6) + L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), '#7a4a2a', 2) + C(x - 21, y + 13.3, 1.3, '#ff8a3a') + smoke(x - 24, y + 6, 0.3, '#c8c8c8', 0.6, -1);
    var st = o.hatStyle || 'hard', hc = o.hat || '#e8b830';
    if (st === 'hard') {
      s += P('M' + pt([x - 16, y - 7]) + 'C' + pt([x - 8, y - 5]) + ' ' + pt([x + 10, y - 5]) + ' ' + pt([x + 17, y - 8]) + 'L' + pt([x + 15, y - 10]) + 'C' + pt([x + 6, y - 11]) + ' ' + pt([x - 8, y - 11]) + ' ' + pt([x - 15, y - 10]) + 'Z', c.cel(hc), 1.8);
      s += body(c, 'M' + pt([x - 12, y - 9]) + 'C' + pt([x - 12, y - 24]) + ' ' + pt([x + 12, y - 25]) + ' ' + pt([x + 13, y - 9]) + 'Z', hc, F('M' + pt([x + 3, y - 26]) + 'L' + pt([x + 14, y - 26]) + 'L' + pt([x + 14, y - 8]) + 'L' + pt([x + 5, y - 8]) + 'Z', dk(hc, 0.28), 0.8) + L('M' + pt([x, y - 23]) + 'L' + pt([x + 1, y - 10]), o.stripe || dk(hc, 0.3), 2.4), 2);
    } else if (st === 'cap') {
      s += body(c, 'M' + pt([x - 11, y - 7]) + 'C' + pt([x - 12, y - 22]) + ' ' + pt([x + 12, y - 23]) + ' ' + pt([x + 14, y - 6]) + 'L' + pt([x + 14, y + 4]) + 'L' + pt([x + 9, y + 4]) + 'L' + pt([x + 8, y - 6]) + 'Z', hc, F('M' + pt([x + 3, y - 24]) + 'L' + pt([x + 16, y - 24]) + 'L' + pt([x + 16, y + 6]) + 'L' + pt([x + 5, y + 6]) + 'Z', dk(hc, 0.3), 0.8) + L('M' + pt([x - 8, y - 12]) + 'Q' + pt([x, y - 16]) + ' ' + pt([x + 10, y - 13]), dk(hc, 0.4), 1.2), 1.8);
    } else {
      s += L('M' + pt([x - 2, y - 16]) + 'l-2,-6 M' + pt([x + 2, y - 17]) + 'l1,-6 M' + pt([x + 6, y - 15]) + 'l4,-5', OL, 2.6) + L('M' + pt([x - 2, y - 16]) + 'l-2,-6 M' + pt([x + 2, y - 17]) + 'l1,-6 M' + pt([x + 6, y - 15]) + 'l4,-5', o.hair || '#e8e0d0', 1.2);
    }
    if (o.goggles) s += L('M' + pt([x - 11, y - 12]) + 'L' + pt([x + 12, y - 15]), OL, 3) + L('M' + pt([x - 11, y - 12]) + 'L' + pt([x + 12, y - 15]), '#4a3a2a', 1.6) + C(x - 7, y - 13, 4.2, c.cel('#8a8680'), 1.4) + C(x - 7, y - 13, 2.8, o.goggles, 1) + C(x + 1, y - 14, 3.8, c.cel('#8a8680'), 1.4) + C(x + 1, y - 14, 2.5, o.goggles, 1) + C(x - 8, y - 14.2, 0.9, '#ffffff');
    if (o.dent) s += L('M' + pt([x - 4, y - 22]) + 'q2,3 5,1', dk(hc, 0.45), 1.3) + L('M' + pt([x - 8, y - 17]) + 'l3,-2', '#ffffff', 1, 0.6);
    return s;
  }
  function gob(c, o) {
    var sk = o.skin || '#6aa84a';
    var ho = { skin: sk, hat: o.hat, stripe: o.stripe, hatStyle: o.hatStyle, specs: o.specs, specCol: o.specCol, lens: o.lens, grin: o.grin, cigar: o.cigar, hair: o.hair, goggles: o.goggles, dent: o.dent };
    return biped(c, {
      skin: sk, shirt: o.shirt || '#b86a3a', pants: o.pants || '#5a4a3a', sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2a20', belt: o.belt || '#4a3420', buckle: o.buckle, glove: o.glove,
      hx: o.hx || 56, hy: o.hy || 32, hipY: 86, legW: o.legW || 10, armW: o.armW || 8.5, shadowR: o.shadowR || 30,
      torsoD: o.torsoD || 'M46,52 C52,46 76,46 82,52 L82,72 L80,88 L48,88 L46,72 Z',
      head: function (c, x, y) { return G(gobHead(c, x, y, ho), at(1.3, x, y + 6)); },
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, top: o.top,
      near: o.near || [[48, 56], [42, 70], [34, 80]], far: o.far || [[80, 56], [86, 70], [86, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, shins: o.shins,
      tf: at(o.scale || 0.84, 64, 122)
    });
  }

  // ============================================================
  //  STRANGLETHORN MOB PIECES
  // ============================================================
  // tapered stripe wedge from (x, y) along ang
  function wedge(x, y, len, ang, w) { var q = dirQ([x, y], ang); return pd([q(0, -w / 2), q(len * 0.5, -w * 0.36), q(len, 0), q(len * 0.5, w * 0.36), q(0, w / 2)], true); }
  function tipD(T, from) { var A = T.a.slice(from), B = T.b.slice(from).reverse(); return pd(A.concat(B), true); }
  // ---- big cat (facing left): shoulders high, head carried low and forward, S-curved tail ----
  // o: col, belly, stripe (colour), eye, glow (eye glows), open (snarl), headTf, lift (front paw raised), ruff, scars, rim, lean
  function cat(c, o) {
    var col = o.col, bel = o.belly || lt(col, 0.6), dcol = dk(col, 0.25), st = o.stripe, s = shadow(c, 64, 54);
    // far legs
    s += limb('M52,88 L48,104 L42,116', dcol, 9) + paw(42, 121, dk(col, 0.4)) + limb('M98,86 L110,100 L104,116', dcol, 9.5) + paw(104, 121, dk(col, 0.4));
    if (st) s += L('M46,100 l6,1 M48,108 l6,0 M106,98 l6,-2 M108,106 l6,0', st, 2.2);
    // tail
    var T = taper([[106, 70], [118, 66], [124, 52], [121, 40], [113, 34]], 8.5, 5, 5);
    s += body(c, T.d, col, (st ? L(bands(T, 4, 3), st, 2.8) : '') + F(tipD(T, 16), o.tailTip || (st ? st : dk(col, 0.5)), 0.95) + F(ribbonBand(T, 0.6, 1), dk(col, 0.22), 0.6), 2);
    // body
    var bd = 'M34,78 C34,62 46,54 60,58 C76,56 96,56 108,64 C118,72 116,88 106,94 C96,98 84,92 72,95 C58,97 42,96 36,88 Z';
    var stripes = '';
    if (st) {
      [[56, 52, 20, 0.08, 6], [65, 53, 24, -0.04, 6.4], [75, 53, 21, 0.1, 6], [85, 54, 24, -0.02, 6.4], [95, 56, 20, 0.12, 5.6], [104, 60, 16, 0.3, 5]].forEach(function (k) { stripes += wedge(k[0], k[1], k[2], PI / 2 + k[3], k[4]); });
      [[64, 98, 12, 0.1, 4.6], [80, 97, 12, -0.08, 4.6], [96, 96, 11, 0.12, 4.4]].forEach(function (k) { stripes += wedge(k[0], k[1], k[2], -PI / 2 + k[3], k[4]); });
    }
    s += body(c, bd, col, F('M28,88 C50,100 92,100 122,90 L122,106 L28,106 Z', bel, 0.9) + (st ? F(stripes, st) : '') + F('M60,54 C80,52 100,54 112,62 L114,74 C100,64 80,62 60,64 Z', lt(col, 0.18), o.rim ? 0 : 0.35) +
      F('M88,58 C104,60 116,68 118,80 L126,80 L126,56 Z', dk(col, 0.25), 0.7) + (o.scars ? L(o.scars, '#c0463e', 1.8) + L(o.scars, '#ffd0c0', 0.6, 0.7) : ''), 2.4);
    if (o.rim) s += L('M44,58 C52,54 60,56 66,58 C80,55 98,56 108,63', o.rim, 1.6, 0.9);
    // shoulder hump
    s += P('M40,72 C42,60 54,54 64,60 C56,62 50,66 48,76 Z', c.cel(col), 1.8) + (st ? F(wedge(48, 58, 12, PI / 2 + 0.3, 4.6), st) : '');
    // head group
    var h = '';
    if (o.ruff) h += P('M46,68 L56,60 L54,70 L62,70 L54,78 L60,86 L48,88 L44,76 Z', c.cel(dk(col, 0.06)), 1.8) + (st ? L('M52,66 L56,64 M52,76 L57,78', st, 1.8) : '');
    h += P('M28,70 C24,60 32,55 37,63 Z', c.cel(dk(col, 0.15)), 1.8);
    var hd = 'M46,74 C42,64 28,62 20,68 C14,72 10,74 7,77 C3,79 1,85 3,89 C5,94 11,97 18,96 C26,100 38,98 44,90 C48,84 49,79 46,74 Z';
    h += body(c, hd, col, F('M34,62 L54,62 L54,100 L40,100 C46,90 44,74 34,62 Z', dk(col, 0.25), 0.7) + F('M3,88 C8,96 18,100 30,98 L36,90 C26,92 16,90 7,83 Z', o.cheek || bel, 0.95) +
      (st ? F(wedge(27, 64, 8, PI / 2 + 0.2, 3.4) + wedge(33, 63, 9, PI / 2, 3.4) + wedge(39, 65, 8, PI / 2 - 0.3, 3.2) + wedge(44, 82, 12, PI - 0.1, 3.4) + wedge(44, 90, 10, PI + 0.15, 3), st) : '') + (o.faceScar ? L(o.faceScar, '#c0463e', 1.6) : ''), 2.2);
    h += P('M38,70 C37,58 47,57 48,68 Z', c.cel(col), 1.8) + P('M40.5,68 C40.5,62 45,62 45.5,67 Z', o.earIn || '#5a3020', 0);
    if (o.notch) h += F('M42,58 L44,63 L46,58 Z', '#6a8a4a', 0);
    h += P('M2,84 C2,78 10,76 15,79 C18,82 17,88 13,90 C8,92 2,89 2,84 Z', o.cheek || bel, 1.4) + P('M1,80.5 L7,79 L5.6,84 Z', o.nose || '#3a2014', 1.2);
    if (o.open) {
      h += P('M3,88 L28,90 C26,98 20,104 10,104 C6,102 4,96 3,88 Z', '#5a1414', 1.6) + F('M8,99 C12,97 20,97 24,96 C22,101 16,103 10,102 Z', '#c8505a');
      h += P('M5,88 L7,95 L9,88.4 Z', '#fff', 0.7) + P('M14,89 L15.6,95 L17.6,89.4 Z', '#fff', 0.7) + P('M9,103 L10.4,97.6 L12,103 Z', '#fff', 0.7) + P('M18,101.6 L19.4,96.6 L21,101 Z', '#fff', 0.7);
      h += P('M5,103 C10,106 20,106 28,98 L30,92 C26,100 18,103 8,102 Z', c.cel(o.cheek || bel), 1.4);
    } else h += L('M4,90 Q9,93 15,90', OL, 1.4) + P('M7,91 L8,95.4 L9.6,91.4 Z', '#fff', 0.8) + P('M12,91.2 L13,95.4 L14.6,91 Z', '#fff', 0.8);
    h += L(o.open ? 'M10,72 L24,76' : 'M11,73.5 L23.5,75', OL, 2.4);
    h += o.glow ? glowEye(c, 17.5, 78, 2.3, o.eye) + L('M13,78 L22,78.4', OL, 0.8) : E(17.5, 78, 3, 2.1, o.eye || '#f0c030', 1) + E(17, 78, 0.8, 1.7, OL);
    h += L('M11,86 l-10,-3 M11,88 l-10,2', '#ffffff', 0.8, 0.9);
    s += o.headTf ? G(h, o.headTf) : h;
    // near legs
    if (o.lift) s += limb('M46,88 L36,100 L28,102', col, 10) + G(paw(26, 107, dk(col, 0.35)), 'rotate(-30 26 105)');
    else s += limb('M46,88 L40,104 L26,116', col, 10) + paw(26, 121, dk(col, 0.35));
    s += limb('M92,88 L102,102 L92,116', col, 11) + paw(92, 121, dk(col, 0.35));
    if (st) s += L((o.lift ? 'M38,96 l6,2 M32,100 l4,4' : 'M40,100 l6,1 M36,108 l5,2') + ' M98,96 l6,-2 M100,104 l6,0', st, 2.2);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- jungle troll head (facing left): long hooked nose, swept ears, tall mohawk, big tusks ----
  function jtHead(c, x, y, o) {
    var sk = o.skin, s = '', pc = o.paintCol || BSRED;
    s += P('M' + pt([x + 6, y - 2]) + 'L' + pt([x + 32, y - 15]) + 'L' + pt([x + 27, y - 7]) + 'L' + pt([x + 10, y + 7]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 11, y - 1]) + 'L' + pt([x + 27, y - 11]) + 'L' + pt([x + 12, y + 3]) + 'Z', dk(sk, 0.3), 0.8);
    if (o.earring) s += L(ellD(x + 24, y - 6, 2.2, 2.6), OL, 2.4) + L(ellD(x + 24, y - 6, 2.2, 2.6), GOLD, 1.2);
    if (o.hair) s += P(pd([[x - 6, y - 12], [x - 12, y - 28], [x - 1, y - 20], [x + 1, y - 38], [x + 7, y - 21], [x + 15, y - 34], [x + 14, y - 16], [x + 24, y - 22], [x + 14, y - 5]], true), c.cel(o.hair), 2) + L('M' + pt([x - 2, y - 16]) + 'L' + pt([x + 1, y - 30]) + 'M' + pt([x + 7, y - 16]) + 'L' + pt([x + 13, y - 28]), dk(o.hair, 0.35), 1.1);
    var d = 'M' + pt([x - 6, y - 12]) + 'C' + pt([x, y - 17]) + ' ' + pt([x + 11, y - 14]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 11, y + 9]) + 'C' + pt([x + 8, y + 15]) + ' ' + pt([x, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'L' + pt([x - 12, y + 11]) + 'C' + pt([x - 14, y + 8]) + ' ' + pt([x - 13, y + 6]) + ' ' + pt([x - 11, y + 5]) +
      'L' + pt([x - 22, y + 6]) + 'C' + pt([x - 27, y + 6]) + ' ' + pt([x - 26, y + 1]) + ' ' + pt([x - 21, y - 1]) + 'L' + pt([x - 9, y - 5]) + 'Z';
    var paint = '';
    if (o.paint === 'stripes') paint = F(pd([[x - 14, y - 7], [x + 4, y - 8], [x + 5, y - 3], [x - 12, y - 1]], true) + pd([[x - 2, y + 3], [x + 8, y + 1], [x + 8, y + 4], [x - 1, y + 7]], true) + pd([[x + 1, y + 9], [x + 9, y + 7], [x + 8, y + 10], [x + 1, y + 12]], true), pc, 0.95);
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
      torsoD: o.torsoD, legW: o.legW || 10.5, armW: o.armW || 9, shadowR: o.shadowR || 32,
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
  function sabre(c, p, len, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-6, 0)) + 'L' + pt(q(4, 0)), '#3a2a1e', 3.2) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), OL, 4) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), GOLD, 2.2) + L('M' + pt(q(-6, 0)) + 'Q' + pt(q(-2, 7)) + ' ' + pt(q(4, 5)), GOLD, 1.2);
    var bl = 'M' + pt(q(5, -1.8)) + 'Q' + pt(q(len * 0.6, -3.6)) + ' ' + pt(q(len, -6)) + 'Q' + pt(q(len * 0.62, 1.4)) + ' ' + pt(q(5, 1.8)) + 'Z';
    return o + P(bl, c.cel('#c8ccd2'), 1.5) + L('M' + pt(q(8, -0.6)) + 'Q' + pt(q(len * 0.6, -1.8)) + ' ' + pt(q(len * 0.94, -5)), '#ffffff', 0.9, 0.8) + C(q(-6, 0)[0], q(-6, 0)[1], 1.8, c.cel(GOLD), 1);
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
  function voodoo(c, x, y, r, col) {
    col = col || VOO; r = r || 1;
    var d = 'M' + pt([x + 7 * r, y]) + 'C' + pt([x + 7 * r, y - 8 * r]) + ' ' + pt([x - 6 * r, y - 9 * r]) + ' ' + pt([x - 7 * r, y - 1 * r]) + 'C' + pt([x - 7 * r, y + 5 * r]) + ' ' + pt([x + 2 * r, y + 6 * r]) + ' ' + pt([x + 3 * r, y + 1 * r]) + 'C' + pt([x + 4 * r, y - 3 * r]) + ' ' + pt([x - 2 * r, y - 4 * r]) + ' ' + pt([x - 2 * r, y]);
    return C(x, y, 22 * r, glow(c, col, 0.65)) + L(d, dk(col, 0.45), 4 * r) + L(d, lt(col, 0.35), 1.8 * r) + C(x, y, 2.6 * r, '#f0ffe0') +
      C(x - 9 * r, y - 11 * r, 1.4 * r, lt(col, 0.3)) + C(x + 8 * r, y - 14 * r, 1.1 * r, lt(col, 0.3)) + skull(c, x + 1 * r, y - 17 * r, 0.45 * r);
  }
  function knuckles(c, p, sk) {
    var x = p[0], y = p[1];
    return C(x, y, 5.6, c.cel(sk), 2) + R(x - 7, y - 5, 5, 10, c.cel('#d8a830'), 1.3) + C(x - 5.6, y - 3, 1.3, '#fff0a0') + C(x - 5.6, y + 1, 1.3, '#fff0a0') + L('M' + pt([x - 8, y - 8]) + 'l-3,-2 M' + pt([x - 9, y]) + 'l-4,0 M' + pt([x - 8, y + 7]) + 'l-3,2', OL, 1.3, 0.8);
  }
  function bigWrench(c, p, len, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-8, 0)) + 'L' + pt(q(len - 6, 0)), '#9a9ea4', 4.4) + L('M' + pt(q(-6, -1)) + 'L' + pt(q(len - 8, -1)), '#e0e4ea', 1, 0.6) + limb('M' + pt(q(-10, 0)) + 'L' + pt(q(2, 0)), '#c83a2a', 5);
    var jaw = pd([q(len - 8, -5), q(len + 6, -9), q(len + 10, -5), q(len + 2, -2.4), q(len + 2, 2.4), q(len + 10, 5), q(len + 6, 9), q(len - 8, 5)], true);
    return o + P(jaw, c.cel('#b0b4ba'), 1.8) + L('M' + pt(q(len - 5, -3.4)) + 'L' + pt(q(len + 5, -7)), '#ffffff', 0.9, 0.6) + C(q(len - 4, 0)[0], q(len - 4, 0)[1], 1.6, '#5a5e64');
  }
  function oilRag(c, x, y) { return P('M' + pt([x, y]) + 'L' + pt([x + 7, y + 1]) + 'L' + pt([x + 6, y + 10]) + 'L' + pt([x + 3, y + 7]) + 'L' + pt([x + 1, y + 11]) + 'Z', c.cel('#c83a2a'), 1.1); }
  // leopard-style rosettes: broken dark rings with a warmer centre, as a mark hook
  function rosettes(seed, cnt, x0, y0, x1, y1, dark, mid, r0, r1) {
    return function () {
      var r = rng(seed), o = '';
      var d = '';
      for (var i = 0; i < cnt; i++) {
        var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (r0 || 2) + r() * ((r1 || 3.6) - (r0 || 2)), a0 = r() * PI * 2;
        o += E(x, y, rr * 1.05, rr * 0.85, mid, 0, 0.85);
        for (var k = 0; k < 3; k++) { var a = a0 + k * PI * 2 / 3, b = a + PI * 0.45; d += 'M' + pt([x + Math.cos(a) * rr * 1.3, y + Math.sin(a) * rr * 1.1]) + 'A' + n(rr * 1.3) + ',' + n(rr * 1.1) + ' 0 0,1 ' + pt([x + Math.cos(b) * rr * 1.3, y + Math.sin(b) * rr * 1.1]); }
      }
      o += L(d, dark, 1.7, 0.95);
      return o;
    };
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var BSKIN = '#4a8c80', SSKIN = '#687a8c', SHAIR = '#2a3450';
  var MOBS = {
    stranglethorn_tiger: function (c) {
      return cat(c, { col: '#e27626', belly: '#f8ecd4', cheek: '#faf2e2', stripe: '#1a0f08', eye: '#f0c030', tf: at(0.98, 64, 122) });
    },
    shadowmaw_panther: function (c) {
      return cat(c, { col: '#27252e', belly: '#34323e', cheek: '#3a3844', nose: '#0e0e12', earIn: '#4a4250', eye: VOO, glow: true, open: true, rim: '#7a7aa8', tailTip: '#16141a', tf: at(0.96, 64, 122) });
    },
    stranglethorn_raptor: function (c) {
      return raptor(c, { col: '#3e8a3a', stripe: '#1c4420', belly: '#ecd88a', crest: BSRED, bigCrest: true, eye: '#ffd040', talons: true, sickleK: 1.3 });
    },
    jungle_stalker: function (c) {
      var dkc = '#26282e', mid = '#a8a498';
      return G(raptor(c, {
        col: '#848c96', belly: '#dcdcd2', crest: '#ece4cc', eye: '#ff8a2a', open: true, talons: true, sickleK: 1.7,
        crestD: 'M40,32 L32,14 L43,24 L46,10 L52,24 L60,14 L59,28 L70,24 L62,35 L70,40 L46,42 Z',
        bodyMark: rosettes(41, 11, 44, 52, 90, 80, dkc, mid, 2.2, 3.8), tailMark: rosettes(43, 7, 86, 38, 122, 70, dkc, mid, 1.6, 2.8), neckMark: rosettes(45, 3, 34, 44, 52, 60, dkc, mid, 1.6, 2.4),
        headMark: rosettes(47, 2, 22, 32, 36, 40, dkc, mid, 1.2, 1.8), thighMark: rosettes(49, 3, 56, 70, 72, 84, dkc, mid, 1.6, 2.4)
      }), 'translate(-2,-1) ' + at(1.06, 64, 122));
    },
    bloodscalp_warrior: function (c) {
      return jTroll(c, {
        skin: BSKIN, hair: BSRED, paint: 'stripes', eye: '#ffcc30', earring: true, loin: '#6a3a24', loinTrim: BSRED,
        chest: function (c) { return F(wedge(48, 54, 16, 0.55, 4.4) + wedge(49, 63, 18, 0.35, 4.4) + wedge(50, 73, 16, 0.2, 4), BSRED, 0.9) + L('M80,50 L54,86', OL, 5.4) + L('M80,50 L54,86', '#5a3a22', 3.2) + skull(c, 68, 66, 0.5); },
        pads: function (c) { return body(c, 'M34,60 C32,48 54,44 58,54 L54,62 L38,64 Z', '#6a4428', L('M36,58 C44,52 52,52 56,56', BSRED, 1.6), 1.8) + P(pd([[38, 52], [34, 42], [42, 50]], true), c.cel(BONE), 1.1) + P(pd([[46, 48], [45, 38], [50, 47]], true), c.cel(BONE), 1.1); },
        top: function (c) { return L('M30,44 l6,-3 M27,40 l6,-3', BSRED, 2) + L('M89,70 l6,2 M90,78 l6,1', BSRED, 2); },
        near: [[46, 58], [34, 50], [26, 36]], wNear: function (c, p) { return axe(c, p, 32, -PI / 2 - 0.32, 15, '#a8acb2', false, '#5a3a22'); },
        far: [[80, 54], [90, 70], [94, 86]]
      });
    },
    bloodscalp_axe_thrower: function (c) {
      var tAxe = function (c, p, ang) { return axe(c, p, 13, ang, 8, '#b8bcc2', false, '#6a4428') + L('M' + pt(p) + 'l-2,6 M' + pt(p) + 'l3,6', BSRED, 1.4); };
      return jTroll(c, {
        skin: BSKIN, hair: BSRED, paint: 'stripes', eye: '#ffcc30', loin: '#7a4428', loinTrim: '#e8d8a0', armW: 8,
        headX: function (c, x, y) { return L('M' + pt([x - 7, y - 11]) + 'L' + pt([x + 12, y - 9]), OL, 3.4) + L('M' + pt([x - 7, y - 11]) + 'L' + pt([x + 12, y - 9]), '#e8d8a0', 1.8) + feathers(x + 12, y - 9, [BSRED, '#1a1009', '#e8d8a0'], 0.7, 0.6); },
        chest: function (c) {
          var o = F(wedge(50, 60, 14, 0.4, 4) + wedge(51, 70, 14, 0.25, 3.6), BSRED, 0.9) + L('M46,52 L80,84', OL, 5.6) + L('M46,52 L80,84', '#6a4428', 3.6);
          [[54, 60], [62, 67], [70, 75]].forEach(function (p) { o += P(pd([[p[0] - 1, p[1] - 2], [p[0] + 5, p[1] - 8], [p[0] + 8, p[1] - 3], [p[0] + 3, p[1] + 1]], true), c.cel('#b8bcc2'), 1.1); });
          return o;
        },
        near: [[46, 58], [32, 54], [20, 46]], wNearFront: function (c, p) { return tAxe(c, p, -PI / 2 - 0.25); },
        far: [[80, 54], [92, 46], [100, 32]], wFar: function (c, p) { return tAxe(c, p, -PI / 2 + 0.5); },
        tf: at(0.94, 64, 122)
      });
    },
    skullsplitter_warrior: function (c) {
      return jTroll(c, {
        skin: SSKIN, hair: SHAIR, paint: 'skull', eye: '#ffd040', loin: '#34343e', loinTrim: BONE, legW: 10.5, armW: 9.5,
        chest: function (c) { return ribPlate(c, 48, 56, 78, 78) },
        pads: function (c) { return bonePad(c, 80, 50, 10) + bonePad(c, 44, 56, 13) + skull(c, 44, 60, 0.7); },
        front: function (c) { return skull(c, 64, 88, 0.62) + bone(52, 96, 10, 1.3, 0.6) + bone(76, 96, 10, 1.8, 0.6); },
        top: function (c) { return L('M31,78 l6,-2 M29,84 l6,-2', '#f0ece0', 1.8) + L('M90,68 l6,1 M91,76 l6,1', '#f0ece0', 1.8); },
        near: [[46, 58], [36, 72], [30, 84]], wNear: function (c, p) { var ang = -PI / 2 - 0.16, q = dirQ(p, ang); return axe(c, p, 44, ang, 16, '#b8bcc0', true, '#4a3222') + P(pd([q(50, -2), q(60, 0), q(50, 2)], true), c.cel(BONE), 1.2); },
        far: [[80, 54], [90, 70], [92, 86]],
        tf: at(1.0, 64, 122)
      });
    },
    skullsplitter_witch_doctor: function (c) {
      return jTroll(c, {
        skin: '#6e8092', hair: SHAIR, paint: 'skull', eye: VOO, glow: true, loin: '#3a3a44', armW: 8,
        headX: function (c, x, y) {
          var o = '';
          ['#e8e4d8', '#3a7a3a', '#e8e4d8', '#6ad04a', '#e8e4d8'].forEach(function (col, i) { o += feather(c, x + 12, y - 12, -PI / 2 + 1.0 - i * 0.34, 27 - Math.abs(i - 2) * 2.5, col, i % 2 ? '#1a1009' : '#3a7a3a'); });
          return o + skull(c, x - 1, y - 14, 0.6) + bone(x - 18, y + 3, 7, 0.1, 0.45);
        },
        chest: function (c) { var o = L('M46,54 Q62,68 80,54', OL, 2.4) + L('M46,54 Q62,68 80,54', '#6a4a2a', 1); [[50, 58], [56, 62], [62, 63], [68, 62], [74, 58]].forEach(function (t, i) { o += P(pd([[t[0] - 1.6, t[1] - 1], [t[0], t[1] + 5], [t[0] + 1.6, t[1] - 1]], true), c.cel(i % 2 ? BONE : '#f4ecd6'), 0.8); }); return o + C(56, 72, 1.3, '#f0ece0') + C(64, 76, 1.3, '#f0ece0') + C(70, 72, 1.3, '#f0ece0'); },
        front: function (c) { var st = ''; for (var i = 0; i < 9; i++) st += 'M' + pt([48 + i * 3.6, 88]) + 'L' + pt([46 + i * 3.8, 108]); return body(c, 'M48,86 L80,86 L84,108 L44,108 Z', '#b8a060', L(st, '#7a6a34', 1.1), 1.6) + L('M48,88 L80,88', OL, 2.4); },
        far: [[80, 54], [92, 64], [98, 74]], wFar: function (c, p) { return skullStaff(c, [p[0] + 4, p[1] + 46], [p[0] - 3, p[1] - 44], VOO); },
        near: [[46, 58], [34, 66], [22, 62]], wNearFront: function (c, p) { return voodoo(c, p[0] - 6, p[1] - 12, 0.95, VOO); },
        tf: at(0.95, 64, 122)
      });
    },
    kurzen_commando: function (c) {
      var gr = '#4a6a34', sk = '#d8a078';
      return human(c, {
        skin: sk, hair: '#3a2a1a', hat: 'bandana', hatCol: '#3a5a2a', stubble: '#5a4a3a', camo: '#2e4a22',
        shirt: gr, sleeve: gr, forearm: sk, pants: '#3e5a2e', boots: '#241c14', belt: '#3a2a1a', buckle: '#8a8a70',
        chest: function (c) { return mottle(801, 10, 48, 50, 82, 86, '#2e4a22', '#6a8a4a', 2, 4)() + bandolier(80, 48, 50, 86, '#5a4028', 6) + R(52, 60, 8, 7, c.cel('#3e5a2e'), 1.2); },
        front: function (c) { return R(48, 86, 7, 8, c.cel('#4a3a24'), 1.2) + R(72, 86, 7, 8, c.cel('#4a3a24'), 1.2); },
        shins: function (c) { return mottle(803, 6, 48, 92, 78, 110, '#2e4424', '#5a7a44', 1.6, 3)() + L('M47,108 L58,108 M66,108 L78,108', '#241c14', 3); },
        near: [[48, 54], [38, 46], [32, 34]], wNear: function (c, p) { return machete(c, p, 32, -PI / 2 - 0.4); },
        far: [[80, 54], [88, 68], [88, 82]]
      });
    },
    kurzen_medicine_man: function (c) {
      var sk = '#c8906a';
      return human(c, {
        skin: sk, hair: '#2a1a10', hat: 'feathers', dots: '#f0ece0', shirt: sk, sleeve: sk, forearm: sk, pants: '#4a5a34', boots: '#3a2a1a', belt: '#5a3a22', buckle: '#c8a040',
        chest: function (c) {
          var o = F('M44,48 L56,48 L54,90 L44,90 Z', KGRN) + F('M72,46 L86,46 L86,90 L74,90 Z', dk(KGRN, 0.1)) + L('M56,48 L54,88 M72,46 L74,88', '#c8b88a', 1.2);
          o += L('M52,52 Q62,62 74,52', OL, 2.2) + L('M52,52 Q62,62 74,52', '#8a6a3a', 1);
          [[55, 55], [60, 58], [65, 58.4], [70, 56]].forEach(function (t) { o += P(pd([[t[0] - 1.4, t[1]], [t[0], t[1] + 4.6], [t[0] + 1.4, t[1]]], true), BONE, 0.7); });
          return o + C(62, 70, 1.4, '#f0ece0') + C(60, 76, 1.4, '#f0ece0') + C(66, 74, 1.4, '#f0ece0');
        },
        front: function (c) { return body(c, 'M56,88 L70,88 L68,104 L63,100 L58,104 Z', KGRN, '', 1.4) + vial(c, 50, 92, VOO) + vial(c, 76, 92, '#e84a3a') + vial(c, 82, 90, '#4aa8ff'); },
        near: [[48, 54], [38, 44], [34, 32]], wNearFront: function (c, p) { return flask(c, p[0] - 2, p[1] - 9, 0.9, VOO); },
        far: [[80, 54], [90, 66], [94, 80]], wFar: function (c, p) { var d = 'M' + pt([p[0] + 4, p[1] + 34]) + 'L' + pt([p[0] - 3, p[1] - 40]); return limb(d, '#7a5a36', 3) + feathers(p[0] - 3, p[1] - 38, ['#c83a2a', '#e8b830', '#3a8a3a'], 0.7, 0.4) + skull(c, p[0] - 3, p[1] - 42, 0.6); }
      });
    },
    colonel_kurzen: function (c) {
      var coat = '#6a6a42', sk = '#d49a78';
      return human(c, {
        skin: sk, hair: '#7a7670', hat: 'officer', hatCol: '#4a4a30', patch: true, tache: '#8a867e', stubble: '#6a6660', scar: true,
        shirt: coat, sleeve: coat, forearm: coat, glove: '#3a2a1e', pants: '#3a3a28', boots: '#1a1612', belt: '#2a2018', buckle: GOLD, legW: 11, shadowR: 36,
        back: function (c) { return body(c, 'M76,56 C88,64 92,86 94,110' + rag(94, 70, 110, 7, 11) + 'L72,60 Z', dk(coat, 0.12), F('M84,60 L100,60 L100,118 L86,118 Z', '#000', 0.25), 2); },
        chest: function (c) {
          return F('M58,48 L66,48 L62,88 L58,88 Z', dk(coat, 0.25)) + L('M52,48 L60,70 L56,88 M72,48 L66,70', dk(coat, 0.4), 1.4) + C(62, 60, 1.4, GOLD, 0.6) + C(62, 68, 1.4, GOLD, 0.6) + C(61, 76, 1.4, GOLD, 0.6) +
            L('M80,50 L50,84', OL, 6) + L('M80,50 L50,84', '#8a2a1e', 4) + P(pd([[70, 58], [74, 58], [74, 64], [72, 66], [70, 64]], true), c.cel(GOLD), 0.9) + R(70, 54, 4, 4, '#2a4a8a', 0.8) + L('M48,74 l6,4 M76,62 l5,-3', '#3a3a24', 1.2);
        },
        front: function (c) { return body(c, 'M46,82 L82,82 L86,108' + rag(86, 42, 108, 7, 5) + 'Z', coat, F('M68,80 L90,80 L90,112 L70,112 Z', dk(coat, 0.3), 0.8) + L('M64,84 L64,106', dk(coat, 0.35), 1.2), 1.8); },
        pads: function (c) { var ep = function (x, y, w) { var fr = ''; for (var i = 0; i < 5; i++) fr += 'M' + pt([x - w + i * w / 2, y + 2]) + 'l0,5'; return body(c, ellD(x, y, w, 4), GOLD, '', 1.6) + L(fr, OL, 2.4) + L(fr, '#e8c860', 1.2); }; return ep(80, 50, 7) + ep(46, 52, 9); },
        near: [[48, 54], [38, 44], [30, 34]], wNear: function (c, p) { return sabre(c, p, 36, -PI / 2 - 0.62); },
        far: [[80, 54], [90, 68], [84, 82]],
        tf: at(1.03, 64, 122)
      });
    },
    venture_mechanic: function (c) {
      var ov = '#e0b020';
      return gob(c, {
        skin: '#72b050', shirt: '#5a6a7a', sleeve: '#5a6a7a', forearm: '#72b050', pants: ov, hatStyle: 'none', hair: '#3a2a1a', goggles: '#9ae8f4', grin: true, boots: '#3a2a20', belt: '#8a5a24', buckle: '#c8c4bc', glove: '#8a6a3a',
        chest: function (c) { return P('M52,60 L78,60 L80,90 L50,90 Z', c.cel(ov), 1.6) + L('M54,60 L50,46 M76,60 L78,46', OL, 4.4) + L('M54,60 L50,46 M76,60 L78,46', ov, 2.6) + C(54, 61, 1.5, '#c8c4bc', 0.8) + C(76, 61, 1.5, '#c8c4bc', 0.8) + R(58, 66, 13, 9, c.cel(dk(ov, 0.12)), 1.2) + L('M62,66 L62,74', '#6a6a70', 1.4) + E(72, 82, 4, 2.4, '#3a3024', 0, 0.45) + E(56, 78, 2.4, 1.6, '#3a3024', 0, 0.4); },
        shins: function (c) { return L('M46,106 L58,106 M66,106 L78,106', dk(ov, 0.3), 1.6) + E(70, 100, 3, 2, '#3a3024', 0, 0.4); },
        near: [[48, 56], [38, 44], [32, 32]], wNear: function (c, p) { return bigWrench(c, p, 34, -PI / 2 - 0.3); },
        far: [[80, 56], [88, 68], [88, 80]], wFar: function (c, p) { return oilRag(c, p[0] - 2, p[1] + 2); },
        scale: 0.86
      });
    },
    venture_enforcer: function (c) {
      var sk = '#5e9a44', kn = function (c, p) { return knuckles(c, p, sk); };
      return gob(c, {
        skin: sk, shirt: '#8a3a2a', sleeve: sk, forearm: sk, pants: '#3a3a46', hat: '#9aa0a8', stripe: '#c83a2a', dent: true, cigar: true, grin: true, boots: '#2a2220', belt: '#2a2018', buckle: GOLD,
        torsoD: 'M40,52 C46,43 82,43 88,52 L88,72 L84,88 L46,88 L40,72 Z', legW: 12.5, armW: 11.5, shadowR: 36,
        chest: function (c) { return F('M40,48 L54,48 L52,90 L40,90 Z', '#5a3a24') + F('M76,46 L90,46 L90,90 L78,90 Z', dk('#5a3a24', 0.12)) + L('M54,48 L52,88 M76,46 L78,88', '#8a6a44', 1.2) + L('M56,50 Q64,58 74,50', OL, 3) + L('M56,50 Q64,58 74,50', '#c8a040', 1.4) + P(pd([[62, 55], [66, 55], [66, 61], [62, 61]], true), c.cel(GOLD), 1); },
        top: function (c) { return L('M36,62 l4,-3 M38,68 l3,-1', dk(sk, 0.4), 1.4); },
        near: [[46, 56], [34, 60], [24, 52]], nearHand: kn,
        far: [[82, 56], [94, 54], [96, 42]], farHand: kn,
        scale: 0.98
      });
    },
    sin_dall: function (c) {
      return cat(c, { col: '#e8d8ae', belly: '#faf4e2', cheek: '#fcf8ec', stripe: '#3a3028', tailTip: '#3a3430', eye: '#9ae4ff', glow: true, lift: true, earIn: '#8a6a60', nose: '#6a4a44', faceScar: 'M24,66 L34,80', tf: at(1.03, 64, 122) });
    },
    king_bangalash: function (c) {
      return cat(c, {
        col: '#f4f2ec', belly: '#ffffff', cheek: '#ffffff', stripe: '#141418', tailTip: '#141418', eye: '#ffb020', open: true, ruff: true, headTf: 'rotate(-14 44 86)', earIn: '#b07070', nose: '#9a5a5a',
        scars: 'M68,60 L78,78 M75,58 L85,76 M82,58 L90,72', faceScar: 'M20,66 L30,82 M26,64 L34,76', tf: 'translate(2,1) ' + at(1.05, 64, 122)
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
