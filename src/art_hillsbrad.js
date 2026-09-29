/* art_hillsbrad.js — Greymead Foothills zone art for Realm of Loner (Krugar, levels 24-30: Mourncross, the Greymead
 * fields, Blackhelm Keep, Kestrel Mine, the Vaskar foothills, Frostmouth Cave), plus a corner of Needlewood
 * (Ashwick Village) and the Greyhowl Keep dungeon (courtyard, great hall).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Greymead keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, the human head, the wolf and lioness rigs, the brick wall, torches and the flagstone floor are
 * shared copies of art_stonetalon.js / art_redridge.js / art_mulgore.js / art_barrens.js so the zones match.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix hb<counter>_).
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
  function Ctx() { this.p = 'hb' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  HILLSBRAD PIECES
  // ============================================================
  var PINE = '#2e5a3a', PINED = '#1f4030', GRASS = '#6a9a48', GRASSD = '#4a7432', STONE = '#9a968c', TIMBER = '#3e302c', SLATE = '#4a4658',
    FPURP = '#5a2a78', FBLK = '#1c1420', FBONE = '#d8d4b8', LGREEN = '#8aff6a', SYN_R = '#a01e1e', SYN_B = '#1a1618', SNOW = '#f2f6fa', SNOWS = '#c8d4e4';
  function hbSky(c, top, mid, bot) { return sky(c, top || '#6f8aaa', mid || '#aebccc', bot || '#e0e4e2'); }
  // the Vaskar range behind the hills: pale blue-grey peaks with big snowfields
  function alterac(c, seed, base, h0, h1) { return peaks(c, seed, base, h0, h1, '#9aa6be', SNOW, 50, 90) + peaks(c, seed + 1, base + 12, h0 * 0.5, h1 * 0.55, '#7e8aa4', '#e4eaf2', 40, 70); }
  // Reclaimed banner: black pole, purple swallowtail cloth with black borders and a pale hooked crest
  function fBanner(c, x, y, h, s) {
    s = s || 1;
    var top = y - h, bw = 16 * s, bh = h * 0.56, o = '';
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top - 6 * s]), '#2a2226', 2.4 * s) + limb('M' + pt([x - 3 * s, top]) + 'L' + pt([x + bw + 3 * s, top]), '#2a2226', 2 * s);
    o += P(pd([[x - 2 * s, top - 6 * s], [x, top - 13 * s], [x + 2 * s, top - 6 * s]], true), c.cel('#8a8a92'), 1.2 * s);
    var d = pd([[x, top], [x + bw, top], [x + bw, top + bh], [x + bw * 0.5, top + bh - 7 * s], [x, top + bh]], true);
    o += body(c, d, FPURP, F(pd([[x, top], [x + 3 * s, top], [x + 3 * s, top + bh], [x, top + bh]], true), FBLK) + F(pd([[x + bw - 3 * s, top], [x + bw, top], [x + bw, top + bh], [x + bw - 3 * s, top + bh]], true), FBLK) +
      F(pd([[x + bw * 0.6, top], [x + bw, top], [x + bw, top + bh], [x + bw * 0.62, top + bh]], true), '#000', 0.25), 1.5 * s);
    // crest: a downward hook-fang between two small bars
    var ex = x + bw / 2, ey = top + bh * 0.4;
    o += F(pd([[ex - 4.5 * s, ey - 5 * s], [ex + 4.5 * s, ey - 5 * s], [ex + 2.5 * s, ey + 1 * s], [ex, ey + 7 * s], [ex - 2.5 * s, ey + 1 * s]], true), FBONE) + F(pd([[ex - 1.4 * s, ey - 3 * s], [ex + 1.4 * s, ey - 3 * s], [ex, ey + 2 * s]], true), FBLK) +
      L('M' + pt([ex - 6 * s, ey - 8 * s]) + 'L' + pt([ex + 6 * s, ey - 8 * s]), FBONE, 1.4 * s);
    return o;
  }
  // green lantern: iron post with an arm and a sickly green lamp
  function gLantern(c, x, y, h, s, flip) {
    s = s || 1; var k = flip ? -1 : 1, top = y - h, lx = x - 10 * s * k;
    return E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25) + limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#2a2428', 2.4 * s) + limb('M' + pt([x, top + 2 * s]) + 'L' + pt([lx, top + 2 * s]), '#2a2428', 1.8 * s) +
      C(lx, top + 10 * s, 16 * s, glow(c, LGREEN, 0.6)) + L('M' + pt([lx, top + 2 * s]) + 'L' + pt([lx, top + 5 * s]), OL, 1.2 * s) + P(pd([[lx - 3.4 * s, top + 6 * s], [lx + 3.4 * s, top + 6 * s], [lx + 2.6 * s, top + 14 * s], [lx - 2.6 * s, top + 14 * s]], true), '#c8ffb0', 1.2 * s) +
      R(lx - 4 * s, top + 4.5 * s, 8 * s, 2 * s, '#2a2428', 1 * s) + C(lx, top + 10 * s, 1.6 * s, '#ffffff', 0, 0.8);
  }
  // Mourncross style house: dark timber frame, grey plaster, steep slate roof, green-lit windows
  function tmHouse(c, x, y, s, o) {
    o = o || {};
    var w = (o.w || 30) * s, h = (o.h || 30) * s, pl = o.wall || '#8a8290', rf = o.roof || SLATE, out = E(x, y + 2, w + 10 * s, 4 * s, '#000', 0, 0.26), ruin = o.ruin;
    var win = ruin ? '#141010' : (o.lit === false ? '#3a3a44' : '#b8ff9a');
    var wall = pd([[x - w, y], [x - w, y - h], [x + w, y - h], [x + w, y]], true);
    var beams = 'M' + pt([x - w, y - h * 0.5]) + 'L' + pt([x + w, y - h * 0.5]) + 'M' + pt([x - w * 0.34, y - h]) + 'L' + pt([x - w * 0.34, y]) + 'M' + pt([x + w * 0.34, y - h]) + 'L' + pt([x + w * 0.34, y]) + 'M' + pt([x - w, y - h * 0.5]) + 'L' + pt([x - w * 0.34, y - h]) + 'M' + pt([x + w * 0.34, y - h * 0.5]) + 'L' + pt([x + w, y - h]);
    out += body(c, wall, pl, L(beams, TIMBER, 2.6 * s) + F(pd([[x + w * 0.4, y - h - 2], [x + w + 2, y - h - 2], [x + w + 2, y + 2], [x + w * 0.4, y + 2]], true), dk(pl, 0.3), 0.8) +
      (ruin ? F(pd([[x - w * 0.9, y - h], [x - w * 0.3, y - h], [x - w * 0.5, y - h * 0.7], [x - w * 0.8, y - h * 0.66]], true), '#2a2020', 0.9) + E(x + w * 0.1, y - h * 0.3, 8 * s, 4 * s, '#3a3a34', 0, 0.5) : ''), 2 * s);
    out += L('M' + pt([x - w, y]) + 'L' + pt([x - w, y - h]) + 'M' + pt([x + w, y]) + 'L' + pt([x + w, y - h]), OL, 4.6 * s) + L('M' + pt([x - w, y]) + 'L' + pt([x - w, y - h]) + 'M' + pt([x + w, y]) + 'L' + pt([x + w, y - h]), TIMBER, 2.8 * s);
    // roof (steep, overhanging) + chimney
    if (!ruin && o.chimney !== false) out += body(c, pd([[x + w * 0.35, y - h - 12 * s], [x + w * 0.35, y - h - 34 * s], [x + w * 0.7, y - h - 34 * s], [x + w * 0.7, y - h - 6 * s]], true), '#6a6470', null, 1.6 * s) + smoke(x + w * 0.52, y - h - 40 * s, 0.8 * s, '#8a8a90', 0.55, 0.8);
    var roof = pd([[x - w - 8 * s, y - h + 3 * s], [x - 2 * s, y - h - 36 * s], [x + 2 * s, y - h - 36 * s], [x + w + 8 * s, y - h + 3 * s]], true), rsh = F(pd([[x + 1 * s, y - h - 38 * s], [x + w + 10 * s, y - h + 5 * s], [x + 10 * s, y - h + 5 * s]], true), dk(rf, 0.35), 0.8);
    for (var i = 1; i < 5; i++) rsh += L('M' + pt([x - w - 8 * s + i * 5.4 * s, y - h + 3 * s - i * 7.6 * s]) + 'L' + pt([x + w + 8 * s - i * 5.4 * s, y - h + 3 * s - i * 7.6 * s]), dk(rf, 0.3), 1 * s, 0.8);
    if (ruin) rsh += F(pd([[x - 18 * s, y - h - 6 * s], [x - 8 * s, y - h - 22 * s], [x + 2 * s, y - h - 14 * s], [x + 8 * s, y - h - 24 * s], [x + 16 * s, y - h - 4 * s], [x + 2 * s, y - h + 4], [x - 12 * s, y - h + 4]], true), '#0e0c0c');
    out += body(c, roof, rf, rsh, 2.2 * s);
    if (ruin) for (var k = 0; k < 4; k++) out += limb('M' + pt([x - 14 * s + k * 8 * s, y - h - 2 * s]) + 'L' + pt([x - 11 * s + k * 7 * s + (k % 2 ? 3 : -2) * s, y - h - (20 - k * 2) * s]), '#3a2a24', 1.4 * s);
    // windows + door
    [[x - w * 0.72, y - h * 0.88], [x + w * 0.52, y - h * 0.88], [x - w * 0.72, y - h * 0.42]].forEach(function (p) {
      if (!ruin && o.lit !== false) out += C(p[0] + 4 * s, p[1] + 4 * s, 12 * s, glow(c, LGREEN, 0.4));
      out += R(p[0], p[1], 8 * s, 8 * s, win, 1.4 * s) + L('M' + pt([p[0] + 4 * s, p[1]]) + 'l0,' + n(8 * s) + 'M' + pt([p[0], p[1] + 4 * s]) + 'l' + n(8 * s) + ',0', TIMBER, 1.1 * s);
    });
    out += ruin ? P(pd([[x - 2 * s, y], [x - 2 * s, y - 14 * s], [x + 11 * s, y - 14 * s], [x + 11 * s, y]], true), '#0e0a0a', 1.6 * s) :
      P('M' + pt([x - 2 * s, y]) + 'L' + pt([x - 2 * s, y - 12 * s]) + 'Q' + pt([x + 4.5 * s, y - 18 * s]) + ' ' + pt([x + 11 * s, y - 12 * s]) + 'L' + pt([x + 11 * s, y]) + 'Z', c.cel('#4a3428'), 1.6 * s) + C(x + 8 * s, y - 6 * s, 1 * s, '#c8c060');
    if (ruin) out += rock(c, x + w + 6 * s, y + 2, 12 * s, 6 * s, STONE) + rock(c, x - w - 4 * s, y + 2, 9 * s, 5 * s, STONE);
    return out;
  }
  // windmill: tapering dark timber tower, a cap, four lattice sails
  function windmill(c, x, y, s, rot) {
    rot = rot == null ? 0.35 : rot;
    var o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.28), h = 92 * s, bw = 20 * s, tw = 12 * s;
    var d = pd([[x - bw, y], [x - tw, y - h], [x + tw, y - h], [x + bw, y]], true), planks = '';
    for (var i = 1; i < 9; i++) { var yy = y - h * i / 9, ww = bw + (tw - bw) * i / 9; planks += 'M' + pt([x - ww, yy]) + 'L' + pt([x + ww, yy]); }
    o += body(c, d, '#5a4a44', L(planks, '#3a2e2a', 1.1 * s, 0.9) + F(pd([[x + 3 * s, y - h - 2], [x + tw + 4 * s, y - h - 2], [x + bw + 4 * s, y + 2], [x + 5 * s, y + 2]], true), '#000', 0.3), 2 * s);
    o += P(pd([[x - 6 * s, y], [x - 6 * s, y - 14 * s], [x + 6 * s, y - 14 * s], [x + 6 * s, y]], true), '#1e1616', 1.6 * s);
    o += R(x - 4 * s, y - h * 0.62, 8 * s, 9 * s, '#b8ff9a', 1.4 * s) + C(x, y - h * 0.58, 12 * s, glow(c, LGREEN, 0.4));
    o += P(pd([[x - tw - 6 * s, y - h + 2 * s], [x - tw - 2 * s, y - h - 14 * s], [x, y - h - 22 * s], [x + tw + 2 * s, y - h - 14 * s], [x + tw + 6 * s, y - h + 2 * s]], true), c.cel(SLATE), 2 * s);
    var hx = x - 4 * s, hy = y - h - 4 * s, L2 = 58 * s;
    for (var k = 0; k < 4; k++) {
      var a = rot + k * PI / 2, q = dirQ([hx, hy], a), lat = '';
      var sail = pd([q(10 * s, 2 * s), q(L2, 2 * s), q(L2, 12 * s), q(12 * s, 11 * s)], true);
      for (var j = 1; j < 5; j++) lat += 'M' + pt(q(10 * s + (L2 - 10 * s) * j / 5, 2 * s)) + 'L' + pt(q(10 * s + (L2 - 10 * s) * j / 5, 11.5 * s));
      lat += 'M' + pt(q(11 * s, 7 * s)) + 'L' + pt(q(L2, 7 * s));
      o += P(sail, '#8a8278', 1.4 * s) + F(sail, '#d8d0c0', 0.35) + L(lat, '#3a2e2a', 1 * s) + limb('M' + pt(q(0, 0)) + 'L' + pt(q(L2 + 2 * s, 0)), '#4a3a32', 2.4 * s);
    }
    return o + C(hx, hy, 4.4 * s, c.cel('#6a6470'), 1.6 * s);
  }
  // bat roost: tall timber frame with a covered perch; bats hang from the beam and circle above
  function batRoost(c, x, y, s) {
    var o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.26), h = 64 * s;
    o += limb('M' + pt([x - 18 * s, y]) + 'L' + pt([x - 12 * s, y - h]) + 'M' + pt([x + 18 * s, y]) + 'L' + pt([x + 12 * s, y - h]) + 'M' + pt([x - 16 * s, y - h * 0.3]) + 'L' + pt([x + 15 * s, y - h * 0.62]) + 'M' + pt([x + 16 * s, y - h * 0.3]) + 'L' + pt([x - 15 * s, y - h * 0.62]), TIMBER, 3 * s);
    o += limb('M' + pt([x - 24 * s, y - h]) + 'L' + pt([x + 24 * s, y - h]), TIMBER, 3.2 * s);
    o += P(pd([[x - 26 * s, y - h - 2 * s], [x, y - h - 22 * s], [x + 26 * s, y - h - 2 * s]], true), c.cel(SLATE), 1.8 * s);
    o += fBanner(c, x + 20 * s, y - h + 2 * s, 30 * s, 0.7 * s);
    [-16, -6, 6].forEach(function (bx, i) { o += bat(x + bx * s, y - h + 4 * s, 0.8 * s, true); });
    return o;
  }
  // a bat: hanging (folded) or flying silhouette
  function bat(x, y, s, hang) {
    if (hang) return L('M' + pt([x, y - 1 * s]) + 'L' + pt([x, y + 2 * s]), OL, 1.2 * s) + P('M' + pt([x - 3 * s, y + 2 * s]) + 'C' + pt([x - 5 * s, y + 8 * s]) + ' ' + pt([x - 3 * s, y + 14 * s]) + ' ' + pt([x, y + 16 * s]) + 'C' + pt([x + 3 * s, y + 14 * s]) + ' ' + pt([x + 5 * s, y + 8 * s]) + ' ' + pt([x + 3 * s, y + 2 * s]) + 'Z', '#3a2c34', 1.2 * s) + C(x - 1.2 * s, y + 13 * s, 0.7 * s, '#ffcc40');
    var d = 'M' + pt([x, y]) + 'Q' + pt([x - 6 * s, y - 7 * s]) + ' ' + pt([x - 16 * s, y - 4 * s]) + 'Q' + pt([x - 12 * s, y - 1 * s]) + ' ' + pt([x - 12 * s, y + 3 * s]) + 'Q' + pt([x - 8 * s, y]) + ' ' + pt([x - 5 * s, y + 3 * s]) + 'Q' + pt([x - 3 * s, y]) + ' ' + pt([x, y + 3 * s]) +
      'Q' + pt([x + 3 * s, y]) + ' ' + pt([x + 5 * s, y + 3 * s]) + 'Q' + pt([x + 8 * s, y]) + ' ' + pt([x + 12 * s, y + 3 * s]) + 'Q' + pt([x + 12 * s, y - 1 * s]) + ' ' + pt([x + 16 * s, y - 4 * s]) + 'Q' + pt([x + 6 * s, y - 7 * s]) + ' ' + pt([x, y]) + 'Z';
    return F(d, '#2a2028', 0.9);
  }
  // wheat field band: golden rows receding, with a scatter of heads
  function wheatField(c, x0, x1, y0, y1, seed, col) {
    col = col || '#d8b04a';
    var d = pd([[x0 + 6, y0], [x1 - 6, y0], [x1, y1], [x0, y1]], true), rows = '', heads = '', r = rng(seed || 9);
    for (var i = 1; i < 8; i++) { var t = i / 8, yy = y0 + (y1 - y0) * t * t; rows += 'M' + pt([x0 + 6 * (1 - t), yy]) + 'L' + pt([x1 - 6 * (1 - t), yy]); }
    for (var j = 0; j < (x1 - x0) * (y1 - y0) / 60; j++) { var hx = x0 + r() * (x1 - x0), hy = y0 + r() * (y1 - y0), k = 0.6 + (hy - y0) / (y1 - y0 || 1) * 1.4; heads += 'M' + pt([hx, hy]) + 'l' + n(-0.6 * k) + ',' + n(-4 * k); }
    return body(c, d, col, R(x0, y0, x1 - x0, y1 - y0, c.lg([[0, lt(col, 0.1), 0], [1, dk(col, 0.25), 0.8]])) + L(rows, dk(col, 0.28), 1.2, 0.8) + L(heads, lt(col, 0.35), 1.2, 0.9), 1.6);
  }
  // foreground wheat stalks with heavy heads
  function wheatStalks(c, x, y, s, cnt, seed) {
    var r = rng(seed || 3), st = '', hd = '';
    for (var i = 0; i < cnt; i++) {
      var bx = x + (i - cnt / 2) * 4 * s + (r() - 0.5) * 3 * s, lean = (r() - 0.5) * 8 * s, h = (24 + r() * 10) * s, tx = bx + lean, ty = y - h;
      st += 'M' + pt([bx, y]) + 'Q' + pt([bx + lean * 0.3, y - h * 0.6]) + ' ' + pt([tx, ty]);
      hd += P('M' + pt([tx, ty + 1 * s]) + 'C' + pt([tx - 3 * s, ty - 3 * s]) + ' ' + pt([tx - 2 * s, ty - 9 * s]) + ' ' + pt([tx + lean * 0.1, ty - 12 * s]) + 'C' + pt([tx + 2 * s, ty - 9 * s]) + ' ' + pt([tx + 3 * s, ty - 3 * s]) + ' ' + pt([tx, ty + 1 * s]) + 'Z', c.cel('#e0b84a'), 1 * s);
    }
    return L(st, OL, 3 * s) + L(st, '#c8a040', 1.4 * s) + hd;
  }
  // scarecrow: post and crossbar, sack head with a straw hat, patched shirt, straw hands
  function scarecrow(c, x, y, s) {
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, y - 62 * s]), '#6a4a2a', 3.2 * s) + limb('M' + pt([x - 26 * s, y - 44 * s]) + 'L' + pt([x + 26 * s, y - 44 * s]), '#6a4a2a', 2.8 * s);
    var sh = pd([[x - 24 * s, y - 48 * s], [x + 24 * s, y - 48 * s], [x + 24 * s, y - 40 * s], [x + 11 * s, y - 40 * s], [x + 12 * s, y - 18 * s], [x + 6 * s, y - 22 * s], [x + 2 * s, y - 16 * s], [x - 3 * s, y - 22 * s], [x - 8 * s, y - 17 * s], [x - 11 * s, y - 40 * s], [x - 24 * s, y - 40 * s]], true);
    o += body(c, sh, '#8a5a4a', R(x - 6 * s, y - 36 * s, 8 * s, 7 * s, '#4a6a8a', 0.8 * s) + L('M' + pt([x - 6 * s, y - 36 * s]) + 'l8,7', '#2a3a4a', 0.8) + F(pd([[x + 4 * s, y - 50 * s], [x + 26 * s, y - 50 * s], [x + 26 * s, y - 14 * s], [x + 6 * s, y - 14 * s]], true), '#000', 0.25), 1.6 * s);
    [[-26, -44], [26, -44], [-2, -17]].forEach(function (p, i) { var px = x + p[0] * s, py = y + p[1] * s, k = i === 2 ? 0 : (p[0] < 0 ? -1 : 1); o += L('M' + pt([px, py]) + 'l' + n((k * 4 - 1) * s) + ',' + n(-3 * s) + 'M' + pt([px, py]) + 'l' + n(k * 5 * s) + ',' + n(1 * s) + 'M' + pt([px, py]) + 'l' + n((k * 4 + 1) * s) + ',' + n(4 * s), '#d8b050', 1.4 * s); });
    o += P('M' + pt([x - 8 * s, y - 50 * s]) + 'C' + pt([x - 10 * s, y - 62 * s]) + ' ' + pt([x + 10 * s, y - 62 * s]) + ' ' + pt([x + 8 * s, y - 50 * s]) + 'Q' + pt([x, y - 46 * s]) + ' ' + pt([x - 8 * s, y - 50 * s]) + 'Z', c.cel('#d8c088'), 1.6 * s) +
      L('M' + pt([x - 4 * s, y - 56 * s]) + 'l2,1.5 M' + pt([x + 1 * s, y - 56 * s]) + 'l2,1.5 M' + pt([x - 4 * s, y - 51.5 * s]) + 'L' + pt([x + 4 * s, y - 51.5 * s]), OL, 1.2 * s);
    o += P(pd([[x - 18 * s, y - 60 * s], [x + 18 * s, y - 60 * s], [x + 12 * s, y - 62 * s], [x + 7 * s, y - 72 * s], [x - 7 * s, y - 72 * s], [x - 12 * s, y - 62 * s]], true), c.cel('#d8b050'), 1.6 * s) + L('M' + pt([x - 8 * s, y - 64 * s]) + 'L' + pt([x + 8 * s, y - 64 * s]), '#8a3a2a', 2 * s);
    return o + E(x + 10 * s, y - 78 * s, 5 * s, 2.4 * s, '#1a1618') + P('M' + pt([x + 6 * s, y - 78 * s]) + 'L' + pt([x + 2 * s, y - 80 * s]) + 'L' + pt([x + 6 * s, y - 76 * s]) + 'Z', '#d8a030', 0.8 * s);
  }
  // human farmhouse: stone ground floor, whitewashed timber upper storey, thatched roof
  function farmhouse(c, x, y, s, o) {
    o = o || {};
    var w = 38 * s, h = 36 * s, stone = STONE, pl = '#e8dcc0', th = o.roof || '#b8904a', out = E(x, y + 2, 50 * s, 5 * s, '#000', 0, 0.26);
    out += smoke(x + 22 * s, y - h - 40 * s, s, '#b0aaa0', 0.6, 0.8) + body(c, pd([[x + 16 * s, y - h - 10 * s], [x + 17 * s, y - h - 36 * s], [x + 27 * s, y - h - 36 * s], [x + 26 * s, y - h - 6 * s]], true), stone, null, 1.8 * s);
    var jn = '';
    for (var j = 1; j < 3; j++) { var jy = y - h * 0.5 * j / 3; jn += 'M' + pt([x - w, jy]) + 'L' + pt([x + w, jy]); for (var q = -3; q <= 3; q++) jn += 'M' + pt([x + (q * 11 + (j % 2 ? 5 : 0)) * s, jy]) + 'l0,' + n(h * 0.5 / 3); }
    out += body(c, pd([[x - w, y], [x - w, y - h * 0.5], [x + w, y - h * 0.5], [x + w, y]], true), stone, L(jn, dk(stone, 0.3), 0.9 * s, 0.8) + F(pd([[x + w * 0.45, y - h], [x + w + 2, y - h], [x + w + 2, y + 2], [x + w * 0.45, y + 2]], true), dk(stone, 0.28), 0.7), 2 * s);
    var beams = 'M' + pt([x - w, y - h]) + 'L' + pt([x - w, y - h * 0.5]) + 'M' + pt([x - w * 0.33, y - h]) + 'L' + pt([x - w * 0.33, y - h * 0.5]) + 'M' + pt([x + w * 0.33, y - h]) + 'L' + pt([x + w * 0.33, y - h * 0.5]) + 'M' + pt([x + w, y - h]) + 'L' + pt([x + w, y - h * 0.5]) + 'M' + pt([x - w, y - h * 0.5]) + 'L' + pt([x - w * 0.33, y - h]) + 'M' + pt([x + w * 0.33, y - h * 0.5]) + 'L' + pt([x + w, y - h]);
    out += body(c, pd([[x - w - 3 * s, y - h * 0.5], [x - w - 3 * s, y - h], [x + w + 3 * s, y - h], [x + w + 3 * s, y - h * 0.5]], true), pl, L(beams, '#5a3a24', 2.4 * s) + F(pd([[x + w * 0.45, y - h - 2], [x + w + 6 * s, y - h - 2], [x + w + 6 * s, y - h * 0.5 + 2], [x + w * 0.45, y - h * 0.5 + 2]], true), dk(pl, 0.25), 0.8), 2 * s);
    var roof = 'M' + pt([x - w - 12 * s, y - h + 3 * s]) + 'Q' + pt([x - w * 0.5, y - h - 14 * s]) + ' ' + pt([x - 3 * s, y - h - 32 * s]) + 'L' + pt([x + 3 * s, y - h - 32 * s]) + 'Q' + pt([x + w * 0.5, y - h - 14 * s]) + ' ' + pt([x + w + 12 * s, y - h + 3 * s]) + 'Z', thl = '';
    for (var i = -4; i <= 4; i++) thl += 'M' + pt([x + i * 1.2 * s, y - h - 30 * s]) + 'L' + pt([x + i * 11 * s, y - h + 2 * s]);
    out += body(c, roof, th, L(thl, dk(th, 0.28), 1 * s, 0.8) + F(pd([[x + 2 * s, y - h - 34 * s], [x + w + 14 * s, y - h + 5 * s], [x + 12 * s, y - h + 5 * s]], true), dk(th, 0.28), 0.8), 2.2 * s);
    out += R(x - w * 0.82, y - h * 0.9, 9 * s, 9 * s, '#5a6a7a', 1.6 * s) + R(x + w * 0.46, y - h * 0.9, 9 * s, 9 * s, '#5a6a7a', 1.6 * s) + R(x - w * 0.75, y - h * 0.4, 8 * s, 8 * s, '#5a6a7a', 1.4 * s);
    return out + P(pd([[x - 8 * s, y], [x - 8 * s, y - 15 * s], [x + 6 * s, y - 15 * s], [x + 6 * s, y]], true), c.cel('#7a4a2a'), 1.6 * s) + C(x + 3 * s, y - 7 * s, 1 * s, '#e0b848');
  }
  function haystack(c, x, y, s) {
    var d = 'M' + pt([x - 16 * s, y]) + 'C' + pt([x - 18 * s, y - 14 * s]) + ' ' + pt([x - 8 * s, y - 28 * s]) + ' ' + pt([x, y - 28 * s]) + 'C' + pt([x + 8 * s, y - 28 * s]) + ' ' + pt([x + 18 * s, y - 14 * s]) + ' ' + pt([x + 16 * s, y]) + 'Z';
    return E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.24) + body(c, d, '#d8b050', L('M' + pt([x - 10 * s, y - 8 * s]) + 'l4,-5 M' + pt([x - 2 * s, y - 16 * s]) + 'l4,-4 M' + pt([x + 6 * s, y - 6 * s]) + 'l4,-5 M' + pt([x - 8 * s, y - 20 * s]) + 'l3,-3', '#9a7a2a', 1 * s) + F(pd([[x + 3 * s, y - 30 * s], [x + 20 * s, y - 30 * s], [x + 20 * s, y + 2], [x + 6 * s, y + 2]], true), '#8a6a2a', 0.5), 1.6 * s);
  }
  // Black Ledger banner: black cloth, red diagonal band, red ring; black-and-red pole wrap
  function sBanner(c, x, y, h, s, torn) {
    s = s || 1;
    var top = y - h, bw = 18 * s, bh = h * 0.56, o = '';
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top - 5 * s]), '#4a3226', 2.4 * s) + limb('M' + pt([x - 3 * s, top]) + 'L' + pt([x + bw + 3 * s, top]), '#4a3226', 2 * s);
    var bot = torn ? [[x + bw, top + bh * 0.8], [x + bw * 0.75, top + bh], [x + bw * 0.5, top + bh * 0.84], [x + bw * 0.25, top + bh * 1.02], [x, top + bh * 0.9]] : [[x + bw, top + bh], [x + bw * 0.5, top + bh * 0.8], [x, top + bh]];
    var d = pd([[x, top], [x + bw, top]].concat(bot), true);
    o += body(c, d, SYN_B, F(pd([[x, top + bh * 0.2], [x + bw * 0.25, top], [x + bw, top + bh * 0.62], [x + bw, top + bh * 0.9], [x, top + bh * 0.5]], true), SYN_R) + F(pd([[x + bw * 0.6, top], [x + bw, top], [x + bw, top + bh], [x + bw * 0.62, top + bh]], true), '#000', 0.3), 1.5 * s);
    o += L(ellD(x + bw * 0.5, top + bh * 0.4, 4.2 * s, 4.2 * s), '#e0d8c8', 1.6 * s);
    return o;
  }
  // castle tower: square keep tower with crenels (or a broken top), slit windows
  function tower(c, x, y, w, h, col, o) {
    o = o || {};
    var out = E(x + w / 2, y + 1, w * 0.7, 4, '#000', 0, 0.25), top = o.broken ? [[0, 8], [w * 0.2, -2], [w * 0.36, 10], [w * 0.55, 4], [w * 0.7, 16], [w * 0.86, 10], [w, 22]] : null;
    out += stoneFace(c, x, y, w, h, col, 8, top);
    if (!o.broken) out += crenels(c, x - 2, x + w + 2, y - h, col, Math.max(4, w / 7));
    for (var i = 0; i < (o.slits || 2); i++) out += arrowSlit(x + w * (0.3 + 0.4 * (i % 2)), y - h * (0.35 + 0.3 * Math.floor(i / 2) + (i % 2) * 0.08), o.slitCol);
    if (o.roof) out += P(pd([[x - 4, y - h + 1], [x + w / 2, y - h - o.roof], [x + w + 4, y - h + 1]], true), c.cel(o.roofCol || '#3a3a4a'), 1.8) + F(pd([[x + w / 2, y - h - o.roof], [x + w + 4, y - h + 1], [x + w * 0.56, y - h + 1]], true), '#000', 0.3);
    return out;
  }
  // mine entrance in a hillside: rock mound, timber frame, dark mouth, lamp
  function mineMouth(c, x, y, s) {
    var o = '', w = 26 * s, h = 34 * s;
    o += P('M' + pt([x - w - 6 * s, y]) + 'L' + pt([x - w - 6 * s, y - h + 4 * s]) + 'Q' + pt([x, y - h - 10 * s]) + ' ' + pt([x + w + 6 * s, y - h + 4 * s]) + 'L' + pt([x + w + 6 * s, y]) + 'Z', c.lg([[0, '#050404'], [0.7, '#141010'], [1, '#2a221c']]), 1.8 * s);
    o += limb('M' + pt([x - w, y]) + 'L' + pt([x - w + 1 * s, y - h]) + 'M' + pt([x + w, y]) + 'L' + pt([x + w - 1 * s, y - h]), '#7a5634', 4.4 * s) + limb('M' + pt([x - w - 6 * s, y - h]) + 'L' + pt([x + w + 6 * s, y - h]), '#8a6440', 4.8 * s);
    o += L('M' + pt([x - w + 2 * s, y - h * 0.62]) + 'L' + pt([x - w + 8 * s, y - h + 2 * s]) + 'M' + pt([x + w - 2 * s, y - h * 0.62]) + 'L' + pt([x + w - 8 * s, y - h + 2 * s]), '#5a3e24', 2.6 * s);
    o += L('M' + pt([x - 10 * s, y - h]) + 'L' + pt([x - 10 * s, y - h + 6 * s]), OL, 1.2 * s) + C(x - 10 * s, y - h + 10 * s, 14 * s, glow(c, '#ffc040', 0.6)) + R(x - 13 * s, y - h + 6 * s, 6 * s, 8 * s, '#ffd060', 1.2 * s) + R(x - 13.6 * s, y - h + 5 * s, 7.2 * s, 2 * s, '#4a3a2a', 1 * s);
    return o;
  }
  // rails receding into the mine: two converging lines + sleepers
  function rails(c, x0, y0, x1, y1, w0, w1) {
    var o = '', k = 9, sl = '';
    for (var i = 0; i <= k; i++) { var t = i / k, tt = t * t, x = x0 + (x1 - x0) * tt, y = y0 + (y1 - y0) * tt, w = w0 + (w1 - w0) * tt; sl += 'M' + pt([x - w * 1.3, y]) + 'L' + pt([x + w * 1.3, y]); }
    o += L(sl, OL, 4.4) + L(sl, '#7a5634', 2.6);
    var ra = 'M' + pt([x0 - w0, y0]) + 'L' + pt([x1 - w1, y1]) + 'M' + pt([x0 + w0, y0]) + 'L' + pt([x1 + w1, y1]);
    return o + L(ra, OL, 3.6) + L(ra, '#8a8e96', 1.6);
  }
  function oreChunk(c, x, y, r, col) { return P(pd([[x - r, y], [x - r * 0.7, y - r * 0.8], [x + r * 0.1, y - r], [x + r, y - r * 0.4], [x + r * 0.8, y]], true), c.cel(col), 1.2) + F(pd([[x - r * 0.4, y - r * 0.6], [x, y - r * 0.9], [x + r * 0.2, y - r * 0.5]], true), '#ffffff', 0.6); }
  function orePile(c, x, y, s, ore) {
    var o = E(x, y + 1, 22 * s, 3.4 * s, '#000', 0, 0.26), r = rng(Math.round(x * 3 + y));
    o += P('M' + pt([x - 22 * s, y]) + 'Q' + pt([x - 14 * s, y - 16 * s]) + ' ' + pt([x, y - 18 * s]) + 'Q' + pt([x + 14 * s, y - 16 * s]) + ' ' + pt([x + 22 * s, y]) + 'Z', c.cel('#7a746c'), 1.6 * s);
    for (var i = 0; i < 6; i++) o += oreChunk(c, x + (r() - 0.5) * 30 * s, y - 2 * s - r() * 12 * s, (3 + r() * 2.4) * s, i % 3 ? '#8a847a' : (ore || '#4a8ad8'));
    return o;
  }
  function mineCart(c, x, y, s, ore) {
    var o = E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.3);
    o += C(x - 10 * s, y - 3 * s, 4 * s, c.cel('#4a4a50'), 1.4 * s) + C(x + 10 * s, y - 3 * s, 4 * s, c.cel('#4a4a50'), 1.4 * s);
    var d = pd([[x - 17 * s, y - 20 * s], [x + 17 * s, y - 20 * s], [x + 13 * s, y - 5 * s], [x - 13 * s, y - 5 * s]], true);
    if (ore) for (var i = 0; i < 5; i++) o += oreChunk(c, x - 11 * s + i * 5.5 * s, y - 20 * s + (i % 2) * 1.5 * s, 4 * s, i % 2 ? '#8a847a' : ore);
    o += body(c, d, '#6a5a4a', L('M' + pt([x - 15 * s, y - 14 * s]) + 'L' + pt([x + 15 * s, y - 14 * s]), '#3a3230', 1.6 * s) + F(pd([[x + 4 * s, y - 22 * s], [x + 20 * s, y - 22 * s], [x + 16 * s, y - 3 * s], [x + 4 * s, y - 3 * s]], true), '#000', 0.25) + C(x - 12 * s, y - 17 * s, 0.9 * s, '#c8c4bc') + C(x + 12 * s, y - 17 * s, 0.9 * s, '#c8c4bc'), 1.6 * s);
    return o;
  }
  function lanternPost(c, x, y, h, s) {
    var top = y - h;
    return E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25) + limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#6a4a2a', 2.6 * s) + limb('M' + pt([x, top + 2 * s]) + 'L' + pt([x - 10 * s, top + 2 * s]), '#6a4a2a', 2 * s) +
      C(x - 9 * s, top + 12 * s, 12 * s, glow(c, '#ffc040', 0.6)) + L('M' + pt([x - 9 * s, top + 2 * s]) + 'L' + pt([x - 9 * s, top + 7 * s]), OL, 1.2 * s) + R(x - 12 * s, top + 7 * s, 6 * s, 8 * s, '#ffd060', 1.2 * s) + R(x - 12.6 * s, top + 6 * s, 7.2 * s, 2 * s, '#4a3a2a', 1 * s);
  }
  // big rocky mound with a den/cave hole
  function den(c, x, y, w, h, col, snowy) {
    col = col || '#7e7a74';
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.7]) + ' ' + pt([x - w * 0.2, y - h]) + ' ' + pt([x, y - h]) + 'C' + pt([x + w * 0.24, y - h]) + ' ' + pt([x + w * 0.52, y - h * 0.6]) + ' ' + pt([x + w / 2, y]) + 'Z';
    var o = E(x, y + 2, w * 0.6, 5, '#000', 0, 0.25) + body(c, d, col, F(pd([[x + w * 0.1, y - h - 2], [x + w * 0.6, y - h - 2], [x + w * 0.6, y + 2], [x + w * 0.2, y + 2]], true), dk(col, 0.28), 0.8) +
      L('M' + pt([x - w * 0.36, y - h * 0.46]) + 'L' + pt([x - w * 0.2, y - h * 0.5]) + 'M' + pt([x + w * 0.18, y - h * 0.7]) + 'L' + pt([x + w * 0.32, y - h * 0.62]), dk(col, 0.35), 1.3), 2);
    if (snowy) o += F('M' + pt([x - w * 0.46, y - h * 0.5]) + 'C' + pt([x - w * 0.3, y - h * 1.04]) + ' ' + pt([x + w * 0.26, y - h * 1.04]) + ' ' + pt([x + w * 0.46, y - h * 0.46]) + 'C' + pt([x + w * 0.2, y - h * 0.64]) + ' ' + pt([x - w * 0.1, y - h * 0.62]) + ' ' + pt([x - w * 0.46, y - h * 0.5]) + 'Z', SNOW, 0.95);
    o += P('M' + pt([x - w * 0.22, y]) + 'C' + pt([x - w * 0.24, y - h * 0.5]) + ' ' + pt([x + w * 0.2, y - h * 0.56]) + ' ' + pt([x + w * 0.22, y]) + 'Z', c.lg([[0, '#0a0808'], [1, '#221a14']]), 1.8);
    return o;
  }
  function icicles(x0, x1, y, seed, len) {
    var r = rng(seed || 5), d = '';
    for (var x = x0; x < x1; x += 5 + r() * 5) { var l = (len || 14) * (0.4 + r() * 0.8); d += 'M' + pt([x - 2.4, y]) + 'L' + pt([x + 0.4, y + l]) + 'L' + pt([x + 2.6, y]) + 'Z'; }
    return P(d, '#dff0ff', 1.1) + F(d, '#ffffff', 0.35);
  }
  // Greyhowl Keep silhouette on its cliff (distant, few outlines)
  function keepOnCliff(c, x, y, s, lit) {
    var o = '', st = '#3a3a48', st2 = '#2c2c38';
    o += F('M' + pt([x - 70 * s, y + 60 * s]) + 'L' + pt([x - 58 * s, y + 6 * s]) + 'L' + pt([x - 40 * s, y]) + 'L' + pt([x + 44 * s, y - 2 * s]) + 'L' + pt([x + 62 * s, y + 8 * s]) + 'L' + pt([x + 74 * s, y + 60 * s]) + 'Z', '#2e3230');
    o += F('M' + pt([x + 20 * s, y + 60 * s]) + 'L' + pt([x + 44 * s, y - 2 * s]) + 'L' + pt([x + 62 * s, y + 8 * s]) + 'L' + pt([x + 74 * s, y + 60 * s]) + 'Z', '#222624');
    o += F(pd([[x - 44 * s, y], [x - 44 * s, y - 24 * s], [x + 40 * s, y - 24 * s], [x + 40 * s, y]], true), st) + F(pd([[x + 10 * s, y], [x + 10 * s, y - 24 * s], [x + 40 * s, y - 24 * s], [x + 40 * s, y]], true), st2);
    for (var i = -44; i < 40; i += 8) o += F(pd([[x + i * s, y - 24 * s], [x + i * s, y - 28 * s], [x + (i + 4) * s, y - 28 * s], [x + (i + 4) * s, y - 24 * s]], true), st);
    [[-40, 50, 9], [-6, 72, 11], [30, 58, 9]].forEach(function (t) {
      var tx = x + t[0] * s, th = t[1] * s, tw = t[2] * s;
      o += F(pd([[tx - tw, y], [tx - tw, y - th], [tx + tw, y - th], [tx + tw, y]], true), st) + F(pd([[tx + tw * 0.2, y], [tx + tw * 0.2, y - th], [tx + tw, y - th], [tx + tw, y]], true), st2) +
        F(pd([[tx - tw - 2 * s, y - th], [tx, y - th - tw * 2.2], [tx + tw + 2 * s, y - th]], true), '#22222c');
      if (lit) o += C(tx - tw * 0.3, y - th * 0.6, 7 * s, glow(c, '#ffc860', 0.6)) + R(tx - tw * 0.3 - 1.4 * s, y - th * 0.6 - 3 * s, 2.8 * s, 5 * s, '#ffd878');
    });
    return o;
  }
  // wooden watchtower on four legs with a hooded roof
  function watchtower(c, x, y, s, ruin) {
    var o = E(x, y + 2, 22 * s, 4 * s, '#000', 0, 0.26), h = 70 * s, wd = '#5a4636';
    o += limb('M' + pt([x - 16 * s, y]) + 'L' + pt([x - 11 * s, y - h]) + 'M' + pt([x + 16 * s, y]) + 'L' + pt([x + 11 * s, y - h]) + 'M' + pt([x - 14 * s, y - h * 0.25]) + 'L' + pt([x + 13 * s, y - h * 0.62]) + 'M' + pt([x + 14 * s, y - h * 0.25]) + 'L' + pt([x - 13 * s, y - h * 0.62]), wd, 3 * s);
    o += body(c, pd([[x - 16 * s, y - h], [x - 16 * s, y - h - 14 * s], [x + 16 * s, y - h - 14 * s], [x + 16 * s, y - h]], true), wd, L('M' + pt([x - 16 * s, y - h - 7 * s]) + 'L' + pt([x + 16 * s, y - h - 7 * s]) + 'M' + pt([x - 6 * s, y - h]) + 'L' + pt([x - 6 * s, y - h - 14 * s]) + 'M' + pt([x + 5 * s, y - h]) + 'L' + pt([x + 5 * s, y - h - 14 * s]), dk(wd, 0.35), 1.2 * s), 1.8 * s);
    o += limb('M' + pt([x - 14 * s, y - h - 14 * s]) + 'L' + pt([x - 14 * s, y - h - 28 * s]) + 'M' + pt([x + 14 * s, y - h - 14 * s]) + 'L' + pt([x + 14 * s, y - h - 28 * s]), wd, 2.2 * s);
    var roof = ruin ? pd([[x - 20 * s, y - h - 27 * s], [x - 4 * s, y - h - 44 * s], [x + 2 * s, y - h - 36 * s], [x + 8 * s, y - h - 40 * s], [x + 20 * s, y - h - 27 * s]], true) : pd([[x - 20 * s, y - h - 27 * s], [x, y - h - 46 * s], [x + 20 * s, y - h - 27 * s]], true);
    return o + P(roof, c.cel('#4a4040'), 1.8 * s) + F(pd([[x, y - h - 46 * s], [x + 20 * s, y - h - 27 * s], [x + 4 * s, y - h - 27 * s]], true), '#000', 0.3);
  }
  // wolf-head sigil (profile, facing left) for banners
  function wolfSigil(x, y, s, col) {
    return F(pd([[x - 8 * s, y - 1 * s], [x - 3 * s, y - 3 * s], [x - 1 * s, y - 8 * s], [x + 1 * s, y - 4 * s], [x + 3 * s, y - 9 * s], [x + 5 * s, y - 3 * s], [x + 7 * s, y + 1 * s], [x + 6 * s, y + 7 * s], [x + 2 * s, y + 5 * s], [x - 1 * s, y + 3 * s], [x - 6 * s, y + 2 * s]], true), col);
  }
  // long hanging banner (dungeon walls): dark blue with silver trim and a wolf-head sigil
  function wolfBanner(c, x, y, w, h, col, trim) {
    col = col || '#2a3050'; trim = trim || '#a8acb8';
    var d = pd([[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h - w * 0.4], [x, y + h]], true);
    return limb('M' + pt([x - 4, y]) + 'L' + pt([x + w + 4, y]), '#4a3a2a', 2.2) + body(c, d, col, L(pd([[x + 3, y + 2], [x + 3, y + h - 3], [x + w / 2, y + h - w * 0.4 - 3], [x + w - 3, y + h - 3], [x + w - 3, y + 2]]), trim, 1.3) + F(pd([[x + w * 0.62, y], [x + w, y], [x + w, y + h], [x + w * 0.62, y + h]], true), '#000', 0.3), 1.6) +
      wolfSigil(x + w / 2, y + h * 0.4, w / 18, trim);
  }
  function candelabra(c, x, y, s) {
    var o = C(x, y - 20 * s, 26 * s, glow(c, '#ffc860', 0.45)), g = '#b89a48';
    o += limb('M' + pt([x, y]) + 'L' + pt([x, y - 16 * s]) + 'M' + pt([x - 9 * s, y - 12 * s]) + 'Q' + pt([x, y - 6 * s]) + ' ' + pt([x + 9 * s, y - 12 * s]), g, 1.6 * s) + P(pd([[x - 5 * s, y], [x + 5 * s, y], [x + 2 * s, y - 3 * s], [x - 2 * s, y - 3 * s]], true), c.cel(g), 1 * s);
    [-9, 0, 9].forEach(function (dx) { var cy = y - (dx ? 12 : 16) * s; o += R(x + dx * s - 1.6 * s, cy - 7 * s, 3.2 * s, 7 * s, '#f0e8d0', 0.9 * s) + flame(c, x + dx * s, cy - 7 * s, 0.32 * s); });
    return o;
  }
  // cobbled courtyard floor from yH down
  function cobbles(c, yH, col, seed) {
    var o = R(-2, yH, 404, 242 - yH, c.lg([[0, dk(col, 0.4)], [1, col]])), d = '', r = rng(seed || 4);
    for (var j = 0; j < 9; j++) {
      var t = j / 9, y = yH + (242 - yH) * t * t, hh = (242 - yH) * ((j + 1) * (j + 1) - j * j) / 81, w = 8 + t * 22;
      d += 'M-2,' + n(y) + 'L402,' + n(y);
      for (var x = -((j * 7) % w); x < 400; x += w * (0.8 + r() * 0.4)) d += 'M' + pt([x, y]) + 'l0,' + n(hh);
    }
    return o + L(d, dk(col, 0.5), 1, 0.75);
  }
  function moon(c, x, y, r) { return C(x, y, r * 4, glow(c, '#dfe8ff', 0.4)) + C(x, y, r, '#eef2ff') + C(x + r * 0.3, y - r * 0.2, r * 0.25, '#cdd6ea') + C(x - r * 0.35, y + r * 0.3, r * 0.18, '#cdd6ea'); }
  function stars(seed, cnt, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(r() * 400, r() * (y1 || 90), 0.5 + r() * 0.8, '#ffffff', 0, 0.5 + r() * 0.4); return o; }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    tarren_mill: function (c) {
      var o = hbSky(c, '#667e9e', '#a6b4c6', '#dcdcd6') + cloud(90, 40, 1.1, 0.75, '#e8ecf0') + cloud(300, 30, 0.9, 0.7, '#e8ecf0');
      o += alterac(c, 11, 118, 44, 84);
      o += hills(c, 13, 136, 16, '#7a9a6e', 50) + farPines(15, 138, '#34523e', 24, 10, 20);
      o += ground(c, 150, GRASS, GRASSD);
      // the town hill
      var hl = 'M-4,186 C40,160 100,134 170,132 C240,130 300,146 340,164 C360,172 384,176 404,178 L404,242 L-4,242 Z';
      o += body(c, hl, '#6e9446', R(-4, 150, 408, 94, c.lg([[0, '#6e9446', 0], [1, '#3a5a26', 0.85]])) + F('M-4,186 C40,160 100,134 170,132 C240,130 300,146 340,164 C360,172 384,176 404,178 L404,184 C360,182 330,172 300,160 C260,146 220,140 170,140 C110,140 50,160 -4,194 Z', '#8ab05a', 0.7), 2);
      // road up into town
      o += F('M150,242 C160,214 176,190 196,166 C204,156 214,146 222,140 L236,142 C228,152 222,164 216,176 C204,200 200,220 206,242 Z', '#a8906a', 0.8);
      o += grass(17, 160, 238, '#4a6a2e', 70, 0.6, 1.8, 1.1) + flowers(19, 170, 236, ['#e8e0f0', '#c8a0e0'], 20);
      o += tmHouse(c, 262, 150, 0.52, { roof: '#4e4a5c' }) + windmill(c, 196, 136, 0.72, 0.5) + tmHouse(c, 118, 146, 0.56, { roof: '#443e52' });
      o += tmHouse(c, 60, 176, 0.72, { roof: SLATE, wall: '#7e7684' }) + tmHouse(c, 312, 172, 0.66, { wall: '#847c88' });
      o += batRoost(c, 372, 196, 0.86);
      o += fBanner(c, 170, 196, 54, 1) + fBanner(c, 250, 200, 54, 1) + fBanner(c, 18, 212, 50, 0.9);
      o += gLantern(c, 136, 210, 46, 1) + gLantern(c, 280, 214, 46, 1, true);
      o += barrel(c, 112, 214, 0.9, '#4a3a34') + crate(c, 92, 218, 0.9, '#6a5444') + barrel(c, 318, 220, 0.8, '#4a3a34');
      o += bat(300, 70, 1.1) + bat(336, 52, 0.8) + bat(92, 84, 0.7);
      o += tufts(c, [[30, 236, 1], [380, 238, 1], [240, 236, 0.8]], '#5a8a3a');
      return o + vignette(c, '#e8e0ff', '#10140a');
    },
    hillsbrad_fields: function (c) {
      var o = hbSky(c, '#6c90b8', '#b0c6d8', '#e6eae4') + sun(c, 320, 40, 10) + cloud(120, 36, 1, 0.8) + cloud(250, 56, 0.7, 0.7);
      o += alterac(c, 21, 116, 40, 76);
      o += hills(c, 23, 132, 16, '#8aae6a', 46) + hills(c, 25, 144, 14, '#76a058', 40);
      o += farPines(27, 146, '#3a6040', 14, 10, 18, 250, 420);
      o += ground(c, 148, '#78a452', '#4e7a34');
      o += wheatField(c, 150, 330, 148, 164, 29) + wheatField(c, -10, 120, 150, 168, 31, '#c8a84a');
      o += F('M-4,200 C60,192 110,182 150,170 C170,164 190,160 204,156 L214,158 C200,164 180,172 164,180 C120,196 60,210 -4,216 Z', '#b8a07a', 0.75);
      o += farmhouse(c, 96, 172, 0.74) + haystack(c, 164, 176, 0.8) + haystack(c, 184, 170, 0.6);
      o += fence(c, 210, 404, 166, 14, '#9a7a52', 20);
      o += wheatField(c, 226, 412, 174, 244, 33);
      o += grass(35, 172, 238, '#4a7432', 50, 0.6, 1.8, 1.1, 0, 210) + flowers(37, 176, 238, ['#f0e070', '#ffffff', '#e87a6a'], 14);
      o += scarecrow(c, 318, 204, 0.78);
      o += stoneWall(c, -6, 226, 150, 214, 12, '#9a9a8e', 39);
      o += wheatStalks(c, 384, 242, 1.1, 8, 41) + wheatStalks(c, 250, 242, 0.9, 5, 43);
      o += tufts(c, [[20, 240, 1], [180, 238, 0.9]], '#5a8a3a');
      return o + vignette(c, '#fff8e8', '#142008');
    },
    durnholde_keep: function (c) {
      var o = hbSky(c, '#5e7090', '#98a6b8', '#ccd0cc') + cloud(70, 44, 1.2, 0.7, '#d8dce2') + cloud(290, 28, 1, 0.7, '#d8dce2');
      o += alterac(c, 51, 112, 36, 70);
      o += hills(c, 53, 138, 14, '#6e8e5a', 44);
      o += ground(c, 150, '#7a9058', '#4e6034');
      var st = '#8e8a84';
      // broken curtain wall and the dark gate gap
      o += stoneFace(c, 60, 156, 100, 50, st, 8, [[0, 4], [20, -2], [34, 10], [52, 2], [70, 16], [86, 8], [100, 18]]);
      o += stoneFace(c, 236, 154, 80, 54, dk(st, 0.05), 8, [[0, 12], [16, 2], [34, 8], [50, -2], [66, 6], [80, 0]]);
      o += P('M160,156 L160,118 Q198,92 236,118 L236,156 Z', c.lg([[0, '#0e0c0c'], [1, '#2a2420']]), 1.8) + L('M160,118 Q198,92 236,118', OL, 5) + L('M160,118 Q198,92 236,118', lt(st, 0.1), 2.6);
      o += tower(c, 20, 162, 46, 108, st, { broken: true, slits: 3 }) + tower(c, 302, 160, 50, 118, dk(st, 0.08), { slits: 4 });
      o += sBanner(c, 90, 146, 46, 1, true) + sBanner(c, 262, 146, 46, 1) + sBanner(c, 318, 66, 36, 0.9);
      o += rock(c, 156, 164, 22, 10, st) + rock(c, 240, 162, 18, 8, st) + rock(c, 60, 172, 20, 9, dk(st, 0.1));
      o += grass(55, 160, 238, '#4e6034', 50, 0.6, 1.6, 1) + pebbles(57, 166, 236, '#6a6a60', 16);
      // Black Ledger camp in the yard
      o += P('M104,196 L128,166 L152,196 Z', c.cel('#6a1e1e'), 1.8) + P('M122,196 L128,182 L134,196 Z', '#1a1010', 1.4) + P('M280,190 L300,164 L320,190 Z', c.cel('#2a2226'), 1.8) + P('M295,190 L300,178 L305,190 Z', '#0e0a0a', 1.2);
      o += campfire(c, 206, 208, 0.62) + crate(c, 46, 214, 1, '#6a4a2e') + barrel(c, 70, 216, 1, '#5a3a24') + crate(c, 356, 210, 0.9, '#6a4a2e') + sBanner(c, 378, 224, 44, 0.9);
      o += rock(c, 16, 240, 40, 16, dk(st, 0.12)) + tufts(c, [[160, 236, 0.9], [250, 238, 0.8]], '#5a7a3a');
      return o + vignette(c, '#e8ecf4', '#100c08');
    },
    azurelode_mine: function (c) {
      var o = hbSky(c, '#6a88ac', '#aabcd0', '#e0e2dc') + sun(c, 60, 36, 9) + cloud(160, 30, 0.9, 0.7);
      o += alterac(c, 61, 110, 40, 70);
      o += hills(c, 63, 136, 16, '#7a9a66', 44);
      o += ground(c, 150, '#7e9458', '#56663a');
      // the rocky hillside the mine is cut into
      var hs = '#8a8278', hd = 'M120,170 C140,120 180,70 250,50 C300,38 360,44 404,60 L404,190 Z';
      o += body(c, hd, hs, F('M300,40 C340,40 380,46 404,58 L404,192 L320,184 C340,140 330,90 300,40 Z', dk(hs, 0.25), 0.8) + L('M170,120 L210,110 M200,86 L240,80 M260,70 L290,66 M150,150 L180,140', dk(hs, 0.3), 1.4, 0.8) +
        F('M120,170 C140,120 180,70 250,50 C230,64 200,90 180,120 C168,140 156,156 150,172 Z', lt(hs, 0.15), 0.7) + F('M180,64 C210,50 240,44 262,46 L252,56 C230,58 204,66 186,76 Z', '#7a9a58', 0.8), 2.2);
      o += pine(c, 330, 66, 0.5, PINED) + pine(c, 372, 72, 0.6);
      o += mineMouth(c, 262, 166, 1.3);
      o += rails(c, 262, 168, 196, 242, 5, 16);
      o += mineCart(c, 250, 180, 0.8, '#4a8ad8') + mineCart(c, 220, 222, 1.2, '#5a9ae8');
      o += orePile(c, 110, 200, 1.1) + orePile(c, 360, 214, 1.2, '#3a7ac8') + orePile(c, 318, 180, 0.7);
      o += lanternPost(c, 176, 196, 50, 1) + lanternPost(c, 336, 196, 46, 0.9);
      o += crate(c, 40, 206, 1, '#8a6440') + crate(c, 56, 212, 0.9) + barrel(c, 150, 214, 0.9);
      o += grass(65, 160, 238, '#56663a', 50, 0.6, 1.6, 1) + pebbles(67, 170, 236, '#6a645a', 20);
      o += rock(c, 390, 240, 40, 16, hs) + tufts(c, [[20, 238, 1], [140, 238, 0.8]], '#6a8a3a');
      return o + vignette(c, '#f4f0e8', '#141008');
    },
    alterac_foothills: function (c) {
      var o = hbSky(c, '#6a84a8', '#b0bed0', '#e8ecf0') + cloud(260, 30, 1.1, 0.75);
      o += peaks(c, 71, 132, 70, 116, '#a4aec4', SNOW, 60, 100) + peaks(c, 73, 146, 40, 70, '#8a94aa', '#e8eef6', 50, 80);
      o += farPines(75, 150, '#2e4a3a', 20, 14, 26);
      o += hills(c, 77, 160, 18, '#6e8058', 50) + ground(c, 168, '#6e8456', '#4a5a38');
      o += F('M40,242 C80,220 130,196 190,180 C220,172 250,168 280,166 L300,168 C260,176 230,184 206,194 C160,212 130,228 120,242 Z', '#9a8a6a', 0.7);
      o += grass(79, 170, 238, '#4a5a34', 60, 0.6, 1.8, 1.1) + pebbles(81, 174, 236, '#6a6a60', 20);
      o += snowRock(c, 60, 172, 80, 40, '#8a867e') + snowRock(c, 110, 166, 40, 20, '#7a766e');
      o += den(c, 300, 186, 130, 62, '#7e7870', true) + bone(262, 196, 12, 0.3, 0.9) + bone(336, 198, 10, -0.5, 0.8) + skull(c, 286, 200, 0.7);
      o += pine(c, 16, 196, 1.0, PINE, true) + pine(c, 392, 190, 0.9, PINED, true) + pine(c, 176, 170, 0.6, PINE, true) + pine(c, 214, 164, 0.5, PINED, true);
      o += rock(c, 150, 214, 30, 14, '#7a766e') + rock(c, 380, 236, 36, 14, '#6e6a62');
      o += tufts(c, [[40, 238, 1], [220, 238, 0.8]], '#6a7a44');
      return o + vignette(c, '#f0f6ff', '#10140c');
    },
    growless_cave: function (c) {
      var o = hbSky(c, '#7a8aa4', '#b8c4d2', '#e8ecf2');
      o += peaks(c, 81, 120, 50, 90, '#b4bed2', SNOW, 50, 80);
      // cliff face above the cave
      var cf = '#7a7c86', cd = 'M-4,172 L-4,60 C40,50 80,70 120,58 C170,44 220,62 270,54 C320,46 370,64 404,58 L404,176 Z';
      o += body(c, cd, cf, F('M300,50 C340,48 380,60 404,56 L404,180 L320,176 C340,130 330,90 300,50 Z', dk(cf, 0.25), 0.8) + L('M40,90 L60,120 M100,80 L110,110 M230,80 L240,120 M330,90 L350,130', dk(cf, 0.35), 1.6, 0.8) +
        F('M-4,60 C40,50 80,70 120,58 C170,44 220,62 270,54 C320,46 370,64 404,58 L404,72 C360,78 320,62 270,68 C220,76 170,58 120,72 C80,84 40,64 -4,76 Z', SNOW) + F('M-4,76 C40,64 80,84 120,72 L120,78 C80,90 40,70 -4,82 Z', SNOWS, 0.8), 2.2);
      // the cave mouth
      o += P('M110,176 C108,130 140,100 190,98 C240,98 272,130 270,176 Z', c.cel('#6a6c76'), 2.2);
      o += P('M126,176 C126,138 152,114 190,112 C228,114 254,138 254,176 Z', c.lg([[0, '#06080c'], [0.7, '#12161e'], [1, '#262a34']]), 2);
      o += icicles(132, 250, 116, 83, 16) + F('M110,120 C130,94 160,86 190,86 C230,86 262,100 276,124 C250,108 220,100 190,100 C160,100 132,108 110,120 Z', SNOW, 0.95);
      o += C(190, 150, 30, glow(c, '#8ab0ff', 0.25));
      o += ground(c, 172, '#e6ecf4', '#b8c6d8');
      o += F('M-4,178 C60,172 120,180 190,176 C260,172 330,180 404,174 L404,184 C330,190 260,182 190,186 C120,190 60,182 -4,188 Z', SNOWS, 0.7) + F('M-4,216 C80,206 160,214 240,208 C300,204 360,210 404,206 L404,242 L-4,242 Z', '#f6f9fc', 0.8);
      o += snowRock(c, 70, 190, 44, 22, '#7a7c86') + snowRock(c, 330, 188, 50, 24, '#72747e');
      o += bone(160, 196, 14, 0.2, 1) + bone(220, 200, 12, -0.6, 0.9) + skull(c, 196, 194, 0.9) + bone(250, 214, 16, 0.5, 1.1) + bone(128, 222, 12, -0.2, 1);
      o += pine(c, 20, 206, 1.1, PINED, true) + pine(c, 390, 200, 1.0, PINE, true);
      var r = rng(85), fl = '';
      for (var i = 0; i < 60; i++) fl += C(r() * 400, r() * 236, 0.7 + r() * 1.2, '#ffffff', 0, 0.8);
      return o + fl + vignette(c, '#f4f8ff', '#0a1020');
    },
    pyrewood_village: function (c) {
      var o = hbSky(c, '#4a5460', '#8a949c', '#b8bcbc');
      o += F('M-4,110 C60,96 140,104 200,98 C260,92 340,102 404,94 L404,140 L-4,140 Z', '#5a6468', 0.7);
      o += keepOnCliff(c, 318, 70, 0.95, true);
      o += mist(c, 112, 40, '#b8c0c4', 0.5, 91);
      o += farPines(93, 132, '#26342e', 30, 20, 40) + farPines(95, 142, '#1e2a26', 22, 16, 30);
      // the gate road winding up toward the keep
      o += F('M170,242 C180,210 210,186 250,168 C280,154 300,132 304,118 L312,118 C312,134 296,158 266,176 C232,196 214,216 214,242 Z', '#6a6258', 0.85);
      o += ground(c, 146, '#46523e', '#2a3224');
      o += F('M170,242 C180,210 210,186 250,168 C266,160 280,150 290,146 L304,146 C290,156 276,166 262,176 C232,196 214,216 214,242 Z', '#6e665a', 0.85);
      o += grass(97, 150, 238, '#2e3a26', 60, 0.6, 1.8, 1.1) + pebbles(99, 160, 236, '#4a4a44', 14);
      o += tmHouse(c, 210, 158, 0.5, { ruin: true, wall: '#7a7068', roof: '#4a4448' }) + watchtower(c, 360, 170, 0.62, false);
      o += tmHouse(c, 78, 176, 0.72, { ruin: true, wall: '#80766c', roof: '#46424a' });
      o += fence(c, 130, 196, 190, 12, '#5a4a3a', 16) + fence(c, 250, 330, 184, 12, '#5a4a3a', 16);
      o += pine(c, 12, 210, 1.2, '#22382e') + pine(c, 150, 184, 0.6, '#26402f') + pine(c, 396, 206, 1.1, '#22382e');
      o += deadTree(c, 300, 200, 0.8, '#2e2824') + rock(c, 120, 222, 26, 10, '#5a5a56');
      o += mist(c, 200, 50, '#c8ccd0', 0.35, 101);
      return o + vignette(c, '#d8e0e8', '#06080a');
    },
    shadowfang_courtyard: function (c) {
      var o = sky(c, '#0c1222', '#1e2a44', '#34405c') + stars(111, 40, 70) + moon(c, 64, 34, 12);
      var st = '#4e4c56';
      // outer wall and flanking towers
      o += brickWall(c, 0, 50, 400, 118, st, 113, 12) + R(0, 50, 400, 68, c.lg([[0, '#000', 0], [1, '#000', 0.35]])) + crenels(c, 0, 400, 50, st, 8) + L('M0,50 L400,50', OL, 2);
      o += tower(c, 6, 118, 56, 108, dk(st, 0.1), { roof: 40, roofCol: '#26263a', slits: 3, slitCol: '#ffc860' }) + tower(c, 340, 118, 56, 116, dk(st, 0.1), { roof: 44, roofCol: '#26263a', slits: 3, slitCol: '#ffc860' });
      // gatehouse
      o += stoneFace(c, 150, 118, 100, 96, lt(st, 0.04), 9) + crenels(c, 148, 252, 22, lt(st, 0.04), 7);
      o += P('M170,118 L170,72 Q200,48 230,72 L230,118 Z', c.lg([[0, '#040408'], [1, '#141420']]), 2) + bars(c, 170, 118, 60, 42, '#3a3e48') + L('M170,72 Q200,48 230,72', OL, 5) + L('M170,72 Q200,48 230,72', '#6a6874', 2.4);
      o += arrowSlit(184, 40, '#ffc860') + arrowSlit(216, 40, '#ffc860');
      o += wolfBanner(c, 90, 62, 18, 40) + wolfBanner(c, 292, 62, 18, 40);
      o += torch(c, 156, 86, 1) + torch(c, 244, 86, 1);
      o += cobbles(c, 118, '#4a4852', 115);
      o += R(0, 118, 400, 10, '#000', 0, 0.4);
      o += deadTree(c, 44, 182, 1.2, '#1e1a1a') + deadTree(c, 128, 124, 0.7, '#221c1c') + deadTree(c, 314, 124, 0.62, '#221c1c');
      o += E(120, 200, 34, 5, '#3a4a64', 0, 0.6) + E(116, 199, 16, 2, '#8aa0c8', 0, 0.4) + E(300, 224, 30, 4, '#3a4a64', 0, 0.5);
      o += rock(c, 18, 236, 34, 12, '#3e3c44') + rock(c, 388, 236, 30, 12, '#3e3c44');
      o += mist(c, 150, 30, '#8a94b0', 0.22, 117);
      return o + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.7, '#000', 0.1], [1, '#000', 0.5]]));
    },
    shadowfang_hall: function (c) {
      var st = '#4a444c', o = R(0, 0, 400, 240, '#141014');
      o += brickWall(c, 0, 0, 400, 124, st, 121, 13);
      o += R(0, 0, 400, 16, c.lg([[0, '#08060a'], [1, '#1e1a1e']])) + L('M0,16 L400,16', OL, 3);
      [40, 150, 260].forEach(function (x) { o += P(pd([[x - 6, 0], [x + 6, 0], [x + 8, 24], [x - 8, 24]], true), c.cel('#3e2e26'), 1.6); });
      // tall moonlit windows and banners
      [[46, 88, 22, 60], [116, 88, 22, 60]].forEach(function (w) {
        o += archWin(w[0], w[1], w[2] + 8, w[3] + 6, c.cel('#5e5864'), 1.8) + archWin(w[0], w[1], w[2], w[3], c.lg([[0, '#9ab0d8'], [1, '#3a4a70']]), 1.6) + L('M' + pt([w[0], w[1]]) + 'L' + pt([w[0], w[1] - w[3] + 2]) + 'M' + pt([w[0] - w[2] / 2, w[1] - w[3] * 0.5]) + 'L' + pt([w[0] + w[2] / 2, w[1] - w[3] * 0.5]), '#2a2a34', 2);
        o += F(pd([[w[0] - w[2] / 2, w[1]], [w[0] + w[2] / 2, w[1]], [w[0] + w[2] + 30, 170], [w[0] - 10, 170]], true), '#9ab0e0', 0.08);
      });
      o += wolfBanner(c, 170, 24, 22, 58) + wolfBanner(c, 232, 24, 22, 58, '#4a1e2a', '#c8b070');
      // wainscot
      o += R(0, 98, 400, 26, c.cel('#3a2a22'), 0) + L('M0,98 L400,98', OL, 2.4) + L('M0,101 L400,101', '#6a4a36', 1.4);
      for (var x = 12; x < 400; x += 34) o += R(x, 105, 26, 15, '#2e221c', 1);
      // stairs climbing to the tower door on the right
      o += P('M290,124 L404,124 L404,20 L372,20 Z', '#1a1418', 0);
      for (var i = 0; i < 9; i++) { var sx = 290 + i * 10, sy = 124 - i * 11; o += P(pd([[sx, sy], [404, sy], [404, sy - 11], [sx + 10, sy - 11]], true), c.cel(i % 2 ? '#5a525a' : '#625a62'), 1.4) + L('M' + pt([sx + 10, sy - 11]) + 'L' + pt([404, sy - 11]), lt(st, 0.2), 1, 0.7); }
      o += P('M362,25 L362,-4 L404,-4 L404,25 Z', '#0a080a', 0) + P('M366,25 L366,0 Q382,-10 398,0 L398,25 Z', c.cel('#5a3a24'), 1.8) + L('M374,4 L374,24 M382,0 L382,24 M390,4 L390,24', '#3a2416', 1.2) + C(372, 14, 1.4, '#c8b070');
      o += torch(c, 350, 50, 0.9);
      // floor + carpet
      o += flagFloor(c, 124, 200, '#4a4448', 123);
      o += F('M170,124 L230,124 L300,242 L100,242 Z', '#5a1a24', 0.9) + L('M178,124 L112,242 M222,124 L288,242', '#c8a048', 1.6, 0.8);
      // the long banquet table along the back wall
      o += R(10, 108, 244, 6, c.cel('#6a4428'), 1.6);
      o += P('M8,112 L256,112 L256,126 L240,122 L220,127 L200,122 L180,127 L160,122 L140,127 L120,122 L100,127 L80,122 L60,127 L40,122 L20,127 L8,124 Z', c.cel('#8a2a34'), 1.6);
      o += limb('M20,124 L20,134 M244,124 L244,134', '#4a2e1c', 2.6);
      [[36, 108], [64, 108], [92, 108], [196, 108], [224, 108]].forEach(function (p) { o += E(p[0], p[1] - 1, 7, 2, '#d8d0c0', 1); });
      o += E(118, 106, 10, 4, c.cel('#b89a48'), 1.2) + C(118, 102, 3.4, '#a83a2a', 1) + E(170, 106, 8, 3, c.cel('#c8c0b0'), 1);
      o += candelabra(c, 50, 108, 0.9) + candelabra(c, 144, 108, 1) + candelabra(c, 236, 108, 0.9);
      // chandelier
      o += L('M200,0 L200,30', OL, 2) + P('M176,32 L224,32 L218,38 L182,38 Z', c.cel('#6a5a3a'), 1.4);
      [-20, -7, 7, 20].forEach(function (dx) { o += R(200 + dx - 1.4, 26, 2.8, 6, '#f0e8d0', 0.8) + flame(c, 200 + dx, 26, 0.3); });
      o += C(200, 30, 40, glow(c, '#ffc860', 0.3));
      o += barrel(c, 380, 200, 1.1, '#4a2e1c') + crate(c, 24, 214, 1, '#5a3a24');
      return o + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function paw(x, y, col) { return P('M' + n(x + 4) + ',' + n(y - 5) + ' C' + n(x + 6) + ',' + n(y) + ' ' + n(x + 4) + ',' + n(y + 1.5) + ' ' + n(x) + ',' + n(y + 1.5) + ' L' + n(x - 7) + ',' + n(y + 1.5) + ' C' + n(x - 9) + ',' + n(y + 1.5) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 4) + ' Z', col, 2) + L('M' + n(x - 3) + ',' + n(y - 1) + ' l0,2.5 M' + n(x - 6) + ',' + n(y - 1) + ' l0,2.5', OL, 1); }
  // clawed digitigrade foot (worgen)
  function clawToes(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) +
      L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-3,0.6 M' + n(x - 7) + ',' + n(y + 1.4) + ' l-3,0.6', '#efe6cf', 1.3);
  }
  // wide bear paw with pale claws
  function bearPaw(x, y, col) {
    return P('M' + pt([x + 7, y - 7]) + 'C' + pt([x + 9, y - 1]) + ' ' + pt([x + 7, y + 1.5]) + ' ' + pt([x + 2, y + 1.5]) + 'L' + pt([x - 9, y + 1.5]) + 'C' + pt([x - 12, y + 1.5]) + ' ' + pt([x - 12, y - 4]) + ' ' + pt([x - 7, y - 6]) + 'Z', col, 2) +
      L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', OL, 3) + L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', '#efe6cf', 1.3);
  }
  // hand with three hooked claws (worgen / yeti)
  function clawHand(p, col, k) {
    k = k || 1;
    var d = 'M' + pt([p[0] - 3 * k, p[1] + 2 * k]) + 'q' + n(-5 * k) + ',' + n(2 * k) + ' ' + n(-6 * k) + ',' + n(7 * k) + 'M' + pt([p[0] - 1 * k, p[1] + 4 * k]) + 'q' + n(-3 * k) + ',' + n(3 * k) + ' ' + n(-3 * k) + ',' + n(8 * k) + 'M' + pt([p[0] + 2 * k, p[1] + 4 * k]) + 'q' + n(-1 * k) + ',' + n(4 * k) + ' ' + n(0) + ',' + n(8 * k);
    return C(p[0], p[1], 5 * k, c_(col), 2) + L(d, OL, 3.6 * k) + L(d, '#f0e8d8', 1.6 * k);
  }
  // ---- biped rig (facing left; shared copy of art_redridge.js, plus noLegs) ----
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

  // ---- human head (facing left, 3/4): many hats ----
  function hbHead(c, x, y, o) {
    var sk = o.skin || '#e8b890', s = '', hc = o.hairCol || '#5a3a22', hat = o.hat;
    if (hat === 'fullhelm') return fullHelm(c, x, y, o);
    if (o.pony) s += P('M' + pt([x + 8, y - 8]) + 'C' + pt([x + 18, y - 8]) + ' ' + pt([x + 20, y + 4]) + ' ' + pt([x + 16, y + 18]) + 'C' + pt([x + 14, y + 8]) + ' ' + pt([x + 12, y + 2]) + ' ' + pt([x + 8, y]) + 'Z', c.cel(hc), 1.6) + R(x + 13, y + 1, 5, 3, c.cel(o.ribbon || '#2a2a3a'), 1);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    if (o.jaw) d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 15]) + ' ' + pt([x + 9, y - 16]) + ' ' + pt([x + 11, y - 6]) + 'L' + pt([x + 12, y + 6]) + 'C' + pt([x + 10, y + 14]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 6, y + 15]) + 'C' + pt([x - 11, y + 13]) + ' ' + pt([x - 12, y + 8]) + ' ' + pt([x - 11, y + 3]) + 'L' + pt([x - 14, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 16]) + 'L' + pt([x + 1, y + 16]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8) +
      (o.dirt ? E(x - 6, y + 6, 4, 2.4, '#5a4030', 0, 0.35) + E(x + 2, y - 8, 3, 2, '#5a4030', 0, 0.3) : '') + (o.gaunt ? L('M' + pt([x - 6, y + 3]) + 'Q' + pt([x - 3, y + 6]) + ' ' + pt([x - 1, y + 3]), dk(sk, 0.35), 1.2) : ''), 2);
    if (hat !== 'hood' && hat !== 'cowl') s += E(x + 5, y + 1, 2.4, 3.4, c.cel(sk), 1.4);
    s += o.glowEye ? gEye(c, x - 5, y - 1, 1.5, o.glowEye) : C(x - 5, y - 1, 1.6, '#1a1009');
    s += L(o.angry ? 'M' + pt([x - 9, y - 4]) + 'L' + pt([x - 2, y - 6]) : 'M' + pt([x - 8, y - 5]) + 'L' + pt([x - 2, y - 4.5]), o.browCol || (o.hat === 'hood' ? OL : hc), 1.9);
    if (o.scar) s += L('M' + pt([x - 7, y - 9]) + 'L' + pt([x - 1, y + 4]), dk(sk, 0.4), 1.3) + L('M' + pt([x - 6, y - 5]) + 'l2,-1 M' + pt([x - 4, y - 1]) + 'l2,-1', dk(sk, 0.4), 1);
    s += o.open ? P('M' + pt([x - 9, y + 6]) + 'Q' + pt([x - 6, y + 11]) + ' ' + pt([x - 2, y + 6]) + 'Z', '#3a1010', 1.1) : L('M' + pt([x - 8, y + 7]) + 'L' + pt([x - 3, y + 7]), OL, 1.3);
    if (o.stubble) s += F('M' + pt([x - 10, y + 3]) + 'C' + pt([x - 9, y + 11]) + ' ' + pt([x, y + 13]) + ' ' + pt([x + 8, y + 7]) + 'L' + pt([x + 8, y + 3]) + 'C' + pt([x + 2, y + 8]) + ' ' + pt([x - 4, y + 8]) + ' ' + pt([x - 10, y + 3]) + 'Z', '#4a3a30', 0.35);
    if (o.beard) s += P('M' + pt([x - 9, y + 5]) + 'C' + pt([x - 8, y + (o.longBeard ? 22 : 16)]) + ' ' + pt([x + 2, y + (o.longBeard ? 24 : 17)]) + ' ' + pt([x + 8, y + 7]) + 'L' + pt([x + 6, y + 4]) + 'C' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 9]) + ' ' + pt([x - 9, y + 5]) + 'Z', c.cel(o.beard), 1.6);
    if (o.mous) s += P('M' + pt([x - 3, y + 4]) + 'C' + pt([x - 8, y + 3]) + ' ' + pt([x - 14, y + 5]) + ' ' + pt([x - 16, y + 11]) + 'C' + pt([x - 12, y + 8]) + ' ' + pt([x - 8, y + 8]) + ' ' + pt([x - 4, y + 8]) + 'C' + pt([x, y + 8]) + ' ' + pt([x + 3, y + 8]) + ' ' + pt([x + 5, y + 11]) + 'C' + pt([x + 5, y + 5]) + ' ' + pt([x + 1, y + 3]) + ' ' + pt([x - 3, y + 4]) + 'Z', c.cel(o.mous), 1.4);
    var hcol = o.hatCol;
    if (hat === 'straw') {
      hcol = hcol || '#d8b458';
      s += body(c, 'M' + pt([x - 10, y - 8]) + 'C' + pt([x - 11, y - 21]) + ' ' + pt([x + 10, y - 22]) + ' ' + pt([x + 11, y - 8]) + 'Z', hcol, L('M' + pt([x - 8, y - 14]) + 'L' + pt([x + 10, y - 15]) + 'M' + pt([x - 6, y - 18]) + 'L' + pt([x + 8, y - 19]), dk(hcol, 0.25), 0.9) + F(pd([[x + 3, y - 24], [x + 12, y - 24], [x + 12, y - 6], [x + 3, y - 6]], true), dk(hcol, 0.25), 0.7), 1.8);
      s += L('M' + pt([x - 10, y - 10]) + 'L' + pt([x + 11, y - 10]), OL, 3.6) + L('M' + pt([x - 10, y - 10]) + 'L' + pt([x + 11, y - 10]), o.band || '#8a3a2a', 2);
      s += body(c, 'M' + pt([x - 23, y - 5]) + 'C' + pt([x - 14, y - 1]) + ' ' + pt([x + 14, y - 2]) + ' ' + pt([x + 23, y - 7]) + 'C' + pt([x + 16, y - 11]) + ' ' + pt([x - 16, y - 11]) + ' ' + pt([x - 23, y - 5]) + 'Z', hcol, L('M' + pt([x - 18, y - 6]) + 'L' + pt([x - 14, y - 4]) + 'M' + pt([x - 8, y - 6]) + 'L' + pt([x - 4, y - 3]) + 'M' + pt([x + 4, y - 6]) + 'L' + pt([x + 8, y - 3]) + 'M' + pt([x + 14, y - 7]) + 'L' + pt([x + 18, y - 5]), dk(hcol, 0.3), 0.9), 1.8);
    } else if (hat === 'cap') {
      hcol = hcol || '#6a4a2a';
      s += body(c, 'M' + pt([x - 10, y - 5]) + 'C' + pt([x - 11, y - 17]) + ' ' + pt([x + 10, y - 19]) + ' ' + pt([x + 13, y - 6]) + 'L' + pt([x + 9, y - 4]) + 'C' + pt([x + 2, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 10, y - 5]) + 'Z', hcol, F(pd([[x + 3, y - 20], [x + 14, y - 20], [x + 14, y - 3], [x + 4, y - 3]], true), dk(hcol, 0.28), 0.75) + L('M' + pt([x - 6, y - 12]) + 'Q' + pt([x + 2, y - 16]) + ' ' + pt([x + 10, y - 12]), dk(hcol, 0.35), 1), 1.8);
      s += P('M' + pt([x - 9, y - 6]) + 'L' + pt([x - 19, y - 4]) + 'C' + pt([x - 17, y - 8]) + ' ' + pt([x - 13, y - 10]) + ' ' + pt([x - 8, y - 10]) + 'Z', c.cel(dk(hcol, 0.15)), 1.6);
      s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 11, y - 11]) + ' ' + pt([x - 8, y - 12]) + ' ' + pt([x - 4, y - 8]) + 'Z', c.cel(hc), 1.2);
    } else if (hat === 'hood') {
      hcol = hcol || '#222026';
      var hd = 'M' + pt([x - 14, y + 2]) + 'C' + pt([x - 18, y - 16]) + ' ' + pt([x - 2, y - 26]) + ' ' + pt([x + 10, y - 22]) + 'C' + pt([x + 22, y - 16]) + ' ' + pt([x + 22, y + 6]) + ' ' + pt([x + 16, y + 18]) + 'L' + pt([x + 6, y + 18]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 4, y - 8]) + ' ' + pt([x - 2, y - 11]) + 'C' + pt([x - 8, y - 11]) + ' ' + pt([x - 12, y - 6]) + ' ' + pt([x - 14, y + 2]) + 'Z';
      s += body(c, hd, hcol, F('M' + pt([x + 8, y - 24]) + 'L' + pt([x + 24, y - 24]) + 'L' + pt([x + 24, y + 20]) + 'L' + pt([x + 10, y + 20]) + 'Z', dk(hcol, 0.4), 0.8) + L('M' + pt([x - 2, y - 20]) + 'Q' + pt([x + 8, y - 18]) + ' ' + pt([x + 14, y - 8]), lt(hcol, 0.2), 1.2, 0.7), 2.2);
      s += P('M' + pt([x - 14, y + 1]) + 'L' + pt([x - 10, y + 2]) + 'C' + pt([x - 4, y + 1]) + ' ' + pt([x + 2, y]) + ' ' + pt([x + 6, y]) + 'L' + pt([x + 7, y + 8]) + 'C' + pt([x + 5, y + 13]) + ' ' + pt([x - 1, y + 15]) + ' ' + pt([x - 6, y + 14]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 13, y + 8]) + ' ' + pt([x - 14, y + 1]) + 'Z', c.cel(o.mask || '#2e2a30'), 1.6) +
        L('M' + pt([x - 13, y + 2]) + 'C' + pt([x - 4, y + 1.4]) + ' ' + pt([x + 2, y + 0.6]) + ' ' + pt([x + 6, y + 0.6]), o.maskTrim || SYN_R, 1.6);
    } else if (hat === 'helm') {
      hcol = hcol || '#6a6e76';
      s += P('M' + pt([x + 2, y - 4]) + 'L' + pt([x + 11, y - 4]) + 'L' + pt([x + 11, y + 9]) + 'L' + pt([x + 5, y + 12]) + 'Z', c.cel(hcol), 1.6);
      s += body(c, 'M' + pt([x - 12, y - 3]) + 'C' + pt([x - 13, y - 21]) + ' ' + pt([x + 11, y - 22]) + ' ' + pt([x + 13, y - 3]) + 'Z', hcol, F(pd([[x + 3, y - 24], [x + 14, y - 24], [x + 14, y - 2], [x + 3, y - 2]], true), dk(hcol, 0.35), 0.8) + L('M' + pt([x - 8, y - 14]) + 'Q' + pt([x - 2, y - 19]) + ' ' + pt([x + 4, y - 18]), '#ffffff', 1.2, 0.5), 2);
      s += L('M' + pt([x - 13, y - 3]) + 'L' + pt([x + 13, y - 3]), OL, 4.4) + L('M' + pt([x - 13, y - 3]) + 'L' + pt([x + 13, y - 3]), dk(hcol, 0.15), 2.4) + R(x - 10, y - 4, 3, 10, c.cel(hcol), 1.2);
      if (o.crest) s += P('M' + pt([x - 2, y - 19]) + 'C' + pt([x + 6, y - 28]) + ' ' + pt([x + 18, y - 24]) + ' ' + pt([x + 22, y - 12]) + 'C' + pt([x + 16, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 6, y - 14]) + 'Z', c.cel(o.crest), 1.5);
    } else if (hat === 'miner') {
      hcol = hcol || '#7a5a36';
      s += body(c, 'M' + pt([x - 11, y - 5]) + 'C' + pt([x - 12, y - 20]) + ' ' + pt([x + 10, y - 21]) + ' ' + pt([x + 12, y - 5]) + 'Z', hcol, F(pd([[x + 3, y - 22], [x + 13, y - 22], [x + 13, y - 4], [x + 3, y - 4]], true), dk(hcol, 0.3), 0.8) + L('M' + pt([x, y - 20]) + 'L' + pt([x + 1, y - 6]), dk(hcol, 0.3), 2), 1.8);
      s += P('M' + pt([x - 15, y - 5]) + 'C' + pt([x - 8, y - 3]) + ' ' + pt([x + 10, y - 3]) + ' ' + pt([x + 15, y - 5]) + 'L' + pt([x + 13, y - 8]) + 'L' + pt([x - 13, y - 8]) + 'Z', c.cel(dk(hcol, 0.1)), 1.6);
      s += F(pd([[x - 12, y - 15], [x - 40, y - 26], [x - 40, y - 2], [x - 12, y - 11]], true), '#fff4b0', 0.22) + C(x - 13, y - 13, 9, glow(c, '#fff2a0', 0.9));
      s += R(x - 14, y - 17, 7, 8, c.cel('#8a8a90'), 1.3) + C(x - 13.6, y - 13, 2.6, '#fffbe0', 1);
    } else if (hat === 'hard') {
      hcol = hcol || '#c88a2a';
      s += P('M' + pt([x - 19, y - 6]) + 'C' + pt([x - 10, y - 3]) + ' ' + pt([x + 12, y - 3]) + ' ' + pt([x + 19, y - 7]) + 'L' + pt([x + 16, y - 10]) + 'L' + pt([x - 16, y - 10]) + 'Z', c.cel(dk(hcol, 0.08)), 1.8);
      s += body(c, 'M' + pt([x - 12, y - 9]) + 'C' + pt([x - 13, y - 25]) + ' ' + pt([x + 12, y - 26]) + ' ' + pt([x + 13, y - 9]) + 'Z', hcol, F(pd([[x + 3, y - 27], [x + 14, y - 27], [x + 14, y - 8], [x + 4, y - 8]], true), dk(hcol, 0.28), 0.8) + L('M' + pt([x, y - 24]) + 'L' + pt([x + 1, y - 10]), lt(hcol, 0.3), 2.6), 2);
    } else if (hat === 'bald') {
      s += E(x + 1, y - 11, 6, 2.6, lt(sk, 0.25), 0, 0.6) + P('M' + pt([x + 6, y - 6]) + 'C' + pt([x + 10, y - 7]) + ' ' + pt([x + 11, y - 2]) + ' ' + pt([x + 10, y + 2]) + 'L' + pt([x + 8, y - 2]) + 'Z', c.cel(hc), 1);
    } else if (hat === 'cowl') {
      hcol = hcol || '#5a2a8a';
      var cw = 'M' + pt([x - 13, y + 4]) + 'C' + pt([x - 18, y - 14]) + ' ' + pt([x - 6, y - 28]) + ' ' + pt([x + 6, y - 28]) + 'L' + pt([x + 28, y - 36]) + 'L' + pt([x + 17, y - 20]) + 'C' + pt([x + 23, y - 10]) + ' ' + pt([x + 22, y + 8]) + ' ' + pt([x + 16, y + 20]) + 'L' + pt([x + 6, y + 20]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 4, y - 8]) + ' ' + pt([x - 2, y - 12]) + 'C' + pt([x - 8, y - 12]) + ' ' + pt([x - 11, y - 5]) + ' ' + pt([x - 13, y + 4]) + 'Z';
      s += body(c, cw, hcol, F('M' + pt([x + 8, y - 30]) + 'L' + pt([x + 30, y - 38]) + 'L' + pt([x + 30, y + 22]) + 'L' + pt([x + 10, y + 22]) + 'Z', dk(hcol, 0.35), 0.8), 2.2) +
        L('M' + pt([x - 13, y + 4]) + 'C' + pt([x - 11, y - 5]) + ' ' + pt([x - 8, y - 12]) + ' ' + pt([x - 2, y - 12]) + 'C' + pt([x + 4, y - 8]) + ' ' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y + 20]), o.trim || '#d8b048', 2.2);
    } else if (hat !== 'none') {
      s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 4]) + 'C' + pt([x + 3, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 2);
    }
    return s;
  }
  // closed great-helm over an undead face: glowing eye slit, cheek plates, a small crest
  function fullHelm(c, x, y, o) {
    var col = o.hatCol || '#4a4a56', s = '';
    s += P('M' + pt([x + 2, y - 18]) + 'C' + pt([x + 12, y - 30]) + ' ' + pt([x + 24, y - 26]) + ' ' + pt([x + 28, y - 16]) + 'C' + pt([x + 20, y - 20]) + ' ' + pt([x + 12, y - 20]) + ' ' + pt([x + 8, y - 14]) + 'Z', c.cel(o.crest || '#5a2430'), 1.5);
    var d = 'M' + pt([x - 12, y - 6]) + 'C' + pt([x - 13, y - 20]) + ' ' + pt([x + 10, y - 23]) + ' ' + pt([x + 13, y - 8]) + 'L' + pt([x + 13, y + 10]) + 'C' + pt([x + 8, y + 15]) + ' ' + pt([x - 2, y + 16]) + ' ' + pt([x - 8, y + 13]) + 'L' + pt([x - 15, y + 6]) + 'L' + pt([x - 14, y - 2]) + 'Z';
    s += body(c, d, col, F(pd([[x + 3, y - 24], [x + 16, y - 24], [x + 16, y + 18], [x + 3, y + 18]], true), dk(col, 0.35), 0.8) + L('M' + pt([x - 14, y + 2]) + 'L' + pt([x + 13, y + 3]) + 'M' + pt([x - 2, y - 20]) + 'L' + pt([x - 4, y + 14]), dk(col, 0.3), 1.2) + L('M' + pt([x - 8, y - 15]) + 'Q' + pt([x - 2, y - 19]) + ' ' + pt([x + 4, y - 19]), '#ffffff', 1.2, 0.45), 2.2);
    s += P(pd([[x - 14, y - 4], [x + 2, y - 5], [x + 2, y - 1], [x - 14, y]], true), '#0a0a0c', 1.2) + E(x - 7, y - 2.5, 7, 3.4, glow(c, o.glowEye || '#8aff6a', 0.9)) + E(x - 7, y - 2.5, 3, 1, lt(o.glowEye || '#8aff6a', 0.5));
    for (var i = 0; i < 3; i++) s += R(x - 12 + i * 3.4, y + 4, 1.6, 4, '#0a0a0c');
    return s;
  }
  function human(c, o) {
    var sk = o.skin || '#e8b890';
    return biped(c, {
      skin: sk, shirt: o.shirt, pants: o.pants, sleeve: o.sleeve, forearm: o.forearm, glove: o.glove || sk, boots: o.boots || '#3a2a1e', belt: o.belt, buckle: o.buckle,
      head: o.head || function (c, x, y) { return hbHead(c, x, y, o.h || {}); }, hx: o.hx || 60, hy: o.hy || 30, neckCol: o.neckCol || sk, neck: o.neck,
      torsoD: o.torsoD, legW: o.legW || 10, armW: o.armW || 8.5, shadowR: o.shadowR || 30, hipY: o.hipY, noLegs: o.noLegs, shadow: o.shadow,
      chest: o.chest, front: o.front, back: o.back, pads: o.pads, shins: o.shins, top: o.top,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      tf: o.tf || at(o.scale || 0.94, 64, 122), op: o.op
    });
  }

  // ---- weapons and tools (grip at p, pointing along ang) ----
  function pitchfork(c, p, len, ang) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, '#9a7248', 3.2, 18);
    var t = 'M' + pt(q(len, -6)) + 'L' + pt(q(len, 6)) + 'M' + pt(q(len, -6)) + 'L' + pt(q(len + 14, -6.4)) + 'M' + pt(q(len, 0)) + 'L' + pt(q(len + 16, 0)) + 'M' + pt(q(len, 6)) + 'L' + pt(q(len + 14, 6.4));
    return o + L(t, OL, 4.4) + L(t, '#a8acb4', 2.2) + L('M' + pt(q(len - 3, -2)) + 'L' + pt(q(len + 1, 2)), OL, 3);
  }
  function scythe(c, p, len, ang, flip) {
    var q = dirQ(p, ang), k = flip ? -1 : 1, o = haft(c, p, len, ang, '#8a6440', 3.2, 16);
    o += limb('M' + pt(q(len * 0.45, 0)) + 'L' + pt(q(len * 0.45, 7 * k)), '#8a6440', 2.4);
    var bl = 'M' + pt(q(len + 2, 1 * k)) + 'Q' + pt(q(len + 6, 16 * k)) + ' ' + pt(q(len - 12, 34 * k)) + 'Q' + pt(q(len - 4, 18 * k)) + ' ' + pt(q(len - 5, 1 * k)) + 'Z';
    return o + P(bl, c.cel('#b8bcc4'), 1.8) + L('M' + pt(q(len + 1, 6 * k)) + 'Q' + pt(q(len + 2, 18 * k)) + ' ' + pt(q(len - 9, 30 * k)), '#ffffff', 1, 0.6);
  }
  function dagger(p, ang, len, blade) {
    var q = dirQ(p, ang); len = len || 20;
    return L('M' + pt(q(-4, 0)) + 'L' + pt(q(3, 0)), OL, 5) + L('M' + pt(q(-4, 0)) + 'L' + pt(q(3, 0)), '#3a2a22', 3) + L('M' + pt(q(4, -4.5)) + 'L' + pt(q(4, 4.5)), OL, 4) + L('M' + pt(q(4, -4.5)) + 'L' + pt(q(4, 4.5)), '#8a8a90', 2) +
      P(pd([q(5, -2.4), q(len * 0.7, -2), q(len, 0), q(len * 0.7, 2), q(5, 2.4)], true), c_(blade || '#c8ccd4'), 1.3) + L('M' + pt(q(6, 0)) + 'L' + pt(q(len * 0.8, 0)), '#ffffff', 0.8, 0.6);
  }
  function sword(p, len, ang, blade, s) {
    var x = p[0], y = p[1], a = ang, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca; s = s || 1;
    var tip = [x + ca * len, y + sa * len], b0 = [x + ca * 7, y + sa * 7];
    var d = 'M' + pt([b0[0] + px * 3 * s, b0[1] + py * 3 * s]) + 'L' + pt([tip[0] + px * 2.5 * s, tip[1] + py * 2.5 * s]) + 'Q' + pt([tip[0] + ca * 4, tip[1] + sa * 4]) + ' ' + pt([tip[0] - px * 3 * s, tip[1] - py * 3 * s]) + 'L' + pt([b0[0] - px * 3 * s, b0[1] - py * 3 * s]) + 'Z';
    var o = P(d, c_(blade || '#c8ccd2'), 1.8) + L('M' + pt([b0[0] + ca * 2, b0[1] + sa * 2]) + 'L' + pt([tip[0] - ca * 4, tip[1] - sa * 4]), '#ffffff', 1, 0.6);
    o += L('M' + pt([x + ca * 6 + px * 7, y + sa * 6 + py * 7]) + 'L' + pt([x + ca * 6 - px * 7, y + sa * 6 - py * 7]), OL, 5) + L('M' + pt([x + ca * 6 + px * 7, y + sa * 6 + py * 7]) + 'L' + pt([x + ca * 6 - px * 7, y + sa * 6 - py * 7]), '#6a1a1a', 2.6) +
      L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), OL, 5) + L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), '#2a1a14', 2.6) + C(x - ca * 7, y - sa * 7, 2.2, c_('#a8a8b0'), 1.2);
    return o;
  }
  function rapier(c, p, len, ang) {
    var q = dirQ(p, ang), o = '';
    o += L('M' + pt(q(5, 0)) + 'L' + pt(q(len, 0)), OL, 3.6) + L('M' + pt(q(5, 0)) + 'L' + pt(q(len, 0)), '#dce4ec', 1.8);
    o += L('M' + pt(q(-5, 0)) + 'L' + pt(q(3, 0)), OL, 5) + L('M' + pt(q(-5, 0)) + 'L' + pt(q(3, 0)), '#3a2a22', 3) + C(q(-6, 0)[0], q(-6, 0)[1], 2, c.cel('#c8b060'), 1);
    o += L('M' + pt(q(4, -8)) + 'L' + pt(q(4, 8)), OL, 3.6) + L('M' + pt(q(4, -8)) + 'L' + pt(q(4, 8)), '#c8b060', 1.8);
    return o + P('M' + pt(q(3, -6)) + 'Q' + pt(q(10, 0)) + ' ' + pt(q(3, 6)) + 'Z', c.cel('#b8a858'), 1.3);
  }
  function pickaxe(c, p, len, ang) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, '#8a6440', 3.4, 12);
    var hd = 'M' + pt(q(len - 2, -2)) + 'Q' + pt(q(len + 4, -10)) + ' ' + pt(q(len - 4, -22)) + 'Q' + pt(q(len + 2, -10)) + ' ' + pt(q(len - 6, -2)) + 'L' + pt(q(len - 6, 2)) + 'Q' + pt(q(len + 2, 8)) + ' ' + pt(q(len - 2, 16)) + 'Q' + pt(q(len + 4, 8)) + ' ' + pt(q(len - 2, 2)) + 'Z';
    return o + P(hd, c.cel('#8a8e96'), 1.8) + R(q(len - 4, 0)[0] - 3, q(len - 4, 0)[1] - 3, 6, 6, c.cel('#5a5a60'), 1.2);
  }
  function hammer(c, p, len, ang, hw, col, spike) {
    var q = dirQ(p, ang), o = haft(c, p, len + 3, ang, '#5a3a24', 3.8);
    o += P(pd([q(len - hw * 0.7, -hw), q(len + hw * 0.7, -hw), q(len + hw * 0.7, hw * 0.8), q(len - hw * 0.7, hw * 0.8)], true), c.cel(col || '#8a8e96'), 2) + L('M' + pt(q(len - hw * 0.7, -hw * 0.3)) + 'L' + pt(q(len + hw * 0.7, -hw * 0.3)), dk(col || '#8a8e96', 0.35), 1.2) + L('M' + pt(q(len - hw * 0.5, -hw * 0.7)) + 'L' + pt(q(len - hw * 0.5, hw * 0.5)), lt(col || '#8a8e96', 0.4), 1, 0.6);
    if (spike) o += P(pd([q(len - 2.4, hw * 0.8), q(len, hw * 0.8 + spike), q(len + 2.4, hw * 0.8)], true), c.cel('#b8bcc0'), 1.2) + P(pd([q(len + hw * 0.7, -2), q(len + hw * 0.7 + spike * 0.6, 0), q(len + hw * 0.7, 2)], true), c.cel('#b8bcc0'), 1.2);
    return o;
  }
  function cleaver(c, p, len, ang, bw) {
    var x = p[0], y = p[1], ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca;
    var q = function (u, v) { return [x + ca * u + px * v, y + sa * u + py * v]; };
    var o = limb('M' + pt(q(-10, 0)) + 'L' + pt(q(len * 0.52, 0)), '#6a4428', 3.6) + L('M' + pt(q(-2, -3)) + 'L' + pt(q(0, 3)) + 'M' + pt(q(3, -3)) + 'L' + pt(q(5, 3)) + 'M' + pt(q(8, -3)) + 'L' + pt(q(10, 3)), '#3a2a1a', 1.4);
    var d = pd([q(len * 0.44, 2.5), q(len, 2.5), q(len + 1, -2), q(len - 1, -bw - 1), q(len * 0.66, -bw), q(len * 0.56, -bw + 1.5), q(len * 0.46, -bw * 0.5)], true);
    o += P(d, c.cel('#a0a6ac'), 2) + L('M' + pt(q(len * 0.5, -bw * 0.52)) + 'L' + pt(q(len * 0.66, -bw + 0.8)) + 'L' + pt(q(len - 2, -bw)), '#ffffff', 1.1, 0.6) + L('M' + pt(q(len * 0.46, 1.5)) + 'L' + pt(q(len - 1, 1.5)), '#5a5e64', 1.4);
    o += C(q(len * 0.86, -3)[0], q(len * 0.86, -3)[1], 1.9, '#2a1a10', 1) + E(q(len * 0.66, -bw * 0.4)[0], q(len * 0.66, -bw * 0.4)[1], 3.4, 2.2, '#a01818', 0, 0.8) + E(q(len * 0.9, 0)[0], q(len * 0.9, 0)[1], 2, 1.4, '#a01818', 0, 0.8);
    return o;
  }
  // mage staff: dark wood, a hooked crescent head cupping a glowing orb
  function mageStaff(c, top, bot, col) {
    var d = 'M' + pt(top) + 'L' + pt(bot), o = limb(d, '#3a2a30', 3.6) + L(d, '#6a5060', 1, 0.6);
    o += P('M' + pt([top[0] - 2, top[1] + 2]) + 'C' + pt([top[0] - 14, top[1] - 4]) + ' ' + pt([top[0] - 12, top[1] - 20]) + ' ' + pt([top[0] + 2, top[1] - 22]) + 'C' + pt([top[0] - 6, top[1] - 16]) + ' ' + pt([top[0] - 8, top[1] - 6]) + ' ' + pt([top[0] + 2, top[1] - 2]) + 'Z', c.cel('#c8a848'), 1.4);
    return o + orb(c, top[0] + 1, top[1] - 11, 4.6, col || '#b060ff');
  }
  // swirling violet shadow bolt in a hand
  function shadowSwirl(c, p, r, col) {
    col = col || '#a050f0'; r = r || 1;
    var d = 'M' + pt([p[0] + 8 * r, p[1]]) + 'C' + pt([p[0] + 8 * r, p[1] - 9 * r]) + ' ' + pt([p[0] - 7 * r, p[1] - 10 * r]) + ' ' + pt([p[0] - 8 * r, p[1] - 1 * r]) + 'C' + pt([p[0] - 8 * r, p[1] + 6 * r]) + ' ' + pt([p[0] + 2 * r, p[1] + 7 * r]) + ' ' + pt([p[0] + 4 * r, p[1] + 1 * r]) + 'C' + pt([p[0] + 5 * r, p[1] - 3 * r]) + ' ' + pt([p[0] - 2 * r, p[1] - 5 * r]) + ' ' + pt([p[0] - 3 * r, p[1] - 1 * r]);
    return C(p[0], p[1] - 2 * r, 24 * r, glow(c, col, 0.7)) + L(d, dk(col, 0.4), 4.4 * r) + L(d, lt(col, 0.35), 2 * r) + C(p[0], p[1] - 1 * r, 3 * r, '#f0d8ff');
  }
  // spinning portal disc behind a caster
  function portal(c, x, y, rx, ry, col) {
    var o = E(x, y, rx * 1.5, ry * 1.5, glow(c, col, 0.55)), r = rng(Math.round(x + y));
    o += E(x, y, rx, ry, c.rg([[0, '#1a0a2a'], [0.6, dk(col, 0.4)], [1, col]]), 0);
    for (var i = 0; i < 4; i++) { var a = i * PI / 2 + 0.4, k = 0.4 + i * 0.15; o += L('M' + pt([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]) + 'Q' + pt([x + Math.cos(a + 1) * rx * (k + 0.3), y + Math.sin(a + 1) * ry * (k + 0.3)]) + ' ' + pt([x + Math.cos(a + 2) * rx * 0.95, y + Math.sin(a + 2) * ry * 0.95]), lt(col, 0.4), 1.6, 0.8); }
    for (var j = 0; j < 7; j++) o += C(x + (r() - 0.5) * rx * 1.8, y + (r() - 0.5) * ry * 1.8, 1 + r(), '#f0d8ff', 0, 0.8);
    return o;
  }
  function manacle(c, p, s) {
    s = s || 1;
    return R(p[0] - 5 * s, p[1] - 3 * s, 10 * s, 6 * s, c.cel('#5a5e66'), 1.4 * s) + C(p[0] - 5 * s, p[1] + 3 * s, 1.1 * s, '#c8ccd4');
  }

  // ---- worgen (Needlewood / Greyhowl, facing left) ----
  function worgenHead(c, x, y, o) {
    var fur = o.fur, mane = o.mane || dk(fur, 0.3), s = '';
    s += P(pd([[x + 2, y - 12], [x + 16, y - 16], [x + 14, y - 8], [x + 26, y - 4], [x + 18, y + 3], [x + 27, y + 12], [x + 14, y + 13], [x + 18, y + 22], [x + 2, y + 16]], true), c.cel(mane), 2);
    s += P(pd([[x + 2, y - 10], [x + 10, y - 28], [x + 14, y - 8]], true), c.cel(dk(fur, 0.15)), 2);
    var d = 'M' + pt([x + 12, y - 4]) + 'C' + pt([x + 12, y - 14]) + ' ' + pt([x + 2, y - 18]) + ' ' + pt([x - 8, y - 14]) + 'L' + pt([x - 16, y - 9]) + 'L' + pt([x - 28, y - 6]) + 'C' + pt([x - 32, y - 5]) + ' ' + pt([x - 33, y + 1]) + ' ' + pt([x - 30, y + 3]) + 'L' + pt([x - 28, y + 9]) +
      'C' + pt([x - 22, y + 14]) + ' ' + pt([x - 10, y + 16]) + ' ' + pt([x - 2, y + 15]) + 'C' + pt([x + 6, y + 15]) + ' ' + pt([x + 12, y + 8]) + ' ' + pt([x + 12, y - 4]) + 'Z';
    s += body(c, d, fur, F(pd([[x + 2, y - 20], [x + 16, y - 20], [x + 16, y + 18], [x + 1, y + 18]], true), dk(fur, 0.25), 0.8) + F('M' + pt([x - 32, y + 3]) + 'L' + pt([x - 10, y + 6]) + 'L' + pt([x + 2, y + 10]) + 'L' + pt([x + 2, y + 20]) + 'L' + pt([x - 32, y + 20]) + 'Z', o.muzzle || lt(fur, 0.2), 0.85) +
      F('M' + pt([x - 28, y - 6]) + 'L' + pt([x - 16, y - 9]) + 'L' + pt([x - 8, y - 10]) + 'L' + pt([x - 16, y - 5]) + 'L' + pt([x - 28, y - 2]) + 'Z', dk(fur, 0.2), 0.7), 2.2);
    // mouth: open snarl with fangs
    s += P(pd([[x - 30, y + 3], [x - 12, y + 5], [x - 27, y + 9]], true), '#4a1014', 1.2) + P(pd([[x - 28, y + 3.4], [x - 26.6, y + 7], [x - 25.4, y + 3.6]], true), '#f4ecd6', 0.8) + P(pd([[x - 20, y + 4.2], [x - 19, y + 7.6], [x - 17.6, y + 4.6]], true), '#f4ecd6', 0.8) + P(pd([[x - 25, y + 8], [x - 24, y + 5.2], [x - 23, y + 7.6]], true), '#f4ecd6', 0.7);
    s += E(x - 31, y - 3, 2.6, 2.2, '#140c0c', 1);
    s += gEye(c, x - 9, y - 6, 1.6, o.eye || '#ffd040') + L('M' + pt([x - 15, y - 8]) + 'L' + pt([x - 3, y - 11]), OL, 2.4);
    s += P(pd([[x - 6, y + 11], [x - 12, y + 20], [x - 3, y + 15], [x + 1, y + 22], [x + 5, y + 12]], true), c.cel(fur), 1.6);
    s += P(pd([[x - 4, y - 12], [x - 1, y - 31], [x + 6, y - 11]], true), c.cel(fur), 2) + F(pd([[x - 2, y - 13], [x - 0.6, y - 25], [x + 3, y - 13]], true), o.earIn || '#6a4a4a', 0.9);
    if (o.scar) s += L('M' + pt([x - 14, y - 16]) + 'L' + pt([x - 6, y + 2]), lt(fur, 0.5), 1.4);
    if (o.hood) {
      var hd = 'M' + pt([x - 16, y - 7]) + 'C' + pt([x - 16, y - 24]) + ' ' + pt([x + 4, y - 32]) + ' ' + pt([x + 16, y - 24]) + 'C' + pt([x + 28, y - 14]) + ' ' + pt([x + 28, y + 10]) + ' ' + pt([x + 22, y + 26]) + 'L' + pt([x + 4, y + 26]) + 'C' + pt([x + 6, y + 14]) + ' ' + pt([x + 2, y + 2]) + ' ' + pt([x - 3, y - 7]) + 'C' + pt([x - 8, y - 12]) + ' ' + pt([x - 13, y - 10]) + ' ' + pt([x - 16, y - 7]) + 'Z';
      s += body(c, hd, o.hood, F(pd([[x + 8, y - 32], [x + 30, y - 32], [x + 30, y + 28], [x + 10, y + 28]], true), dk(o.hood, 0.4), 0.8) + L('M' + pt([x - 16, y - 7]) + 'C' + pt([x - 13, y - 10]) + ' ' + pt([x - 8, y - 12]) + ' ' + pt([x - 3, y - 7]) + 'C' + pt([x + 2, y + 2]) + ' ' + pt([x + 6, y + 14]) + ' ' + pt([x + 4, y + 26]), o.hoodTrim || lt(o.hood, 0.3), 1.8), 2.2);
      s += gEye(c, x - 9, y - 5, 1.8, o.eye || '#c080ff');
    }
    return s;
  }
  function worgen(c, o) {
    var fur = o.fur, rag = o.rag || '#5a4a3a';
    return biped(c, {
      skin: fur, shirt: fur, pants: rag, sleeve: fur, glove: fur, boots: dk(fur, 0.2), digi: true, feet: clawToes, legW: o.legW || 12, armW: o.armW || 10.5, shadowR: o.shadowR || 36, hipY: 86, neck: false,
      torsoD: o.torsoD || 'M38,50 C42,38 82,36 90,48 L84,68 L78,88 L52,88 L46,70 Z', hx: o.hx || 48, hy: o.hy || 36,
      back: function (c) { return (o.back ? o.back(c) : '') + P(shag(70, 46, 22, 14, 8, 0.28, o.seed || 5, -0.3), c.cel(o.mane || dk(fur, 0.3)), 2); },
      chest: function (c) {
        return (o.bare !== false ? L('M50,56 Q58,62 66,56 M52,70 Q58,72 64,70 M54,78 Q58,80 62,78', dk(fur, 0.35), 1.4) + L('M44,52 l-2,6 M48,60 l-3,5 M76,52 l3,6', lt(fur, 0.25), 1.2, 0.8) : '') + (o.chest ? o.chest(c) : '');
      },
      front: function (c) { return body(c, 'M50,84 L80,84 L82,98 L76,94 L72,102 L66,95 L60,103 L55,95 L48,99 Z', rag, L('M52,88 L78,88', dk(rag, 0.35), 1.2) + F('M68,82 L86,82 L86,104 L70,104 Z', dk(rag, 0.3), 0.7), 1.8) + (o.front ? o.front(c) : ''); },
      pads: o.pads, top: o.top,
      head: function (c, x, y) { return worgenHead(c, x, y, { fur: fur, mane: o.mane, eye: o.eye, hood: o.hood, hoodTrim: o.hoodTrim, muzzle: o.muzzle, scar: o.scar }); },
      near: o.near || [[44, 54], [32, 70], [22, 82]], far: o.far || [[82, 52], [96, 66], [100, 82]],
      nearHand: o.nearHand || function (c, p) { return clawHand(p, fur, 1.1); }, farHand: o.farHand || function (c, p) { return clawHand(p, dk(fur, 0.1), 1.05); },
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      tf: at(o.scale || 1, 64, 122)
    });
  }

  // ---- bear (quadruped, facing left) ----
  function bear(c, o) {
    var col = o.col, bel = o.belly || lt(col, 0.2), dcol = dk(col, 0.22), mz = o.muzzle || lt(col, 0.35), s = shadow(c, 62, 58);
    s += limb('M58,92 L56,106 L54,116', dcol, 13) + bearPaw(55, 121, dk(col, 0.35)) + limb('M104,86 L108,102 L106,116', dcol, 13) + bearPaw(107, 121, dk(col, 0.35));
    s += P('M114,64 C122,62 126,68 122,74 C120,72 117,70 114,70 Z', c.cel(col), 1.6);
    var bd = 'M26,76 C22,54 40,36 64,36 C90,32 116,46 120,68 C124,88 116,100 102,102 L46,102 C32,100 28,90 26,76 Z';
    var fl = '', r = rng(o.seed || 3);
    for (var i = 0; i < 14; i++) { var fx = 40 + r() * 76, fy = 44 + r() * 50; fl += 'M' + pt([fx, fy]) + 'q' + n(3 + r() * 2) + ',' + n(2 + r() * 2) + ' ' + n(4 + r() * 3) + ',' + n(6 + r() * 3); }
    s += body(c, bd, col, F('M20,88 C44,104 90,106 124,90 L124,110 L20,110 Z', bel, 0.8) + F('M84,34 C104,38 122,50 124,70 L124,100 L104,100 C114,82 108,56 84,34 Z', dk(col, 0.22), 0.8) + F('M40,44 C52,36 70,34 84,38 C70,40 56,44 46,52 Z', lt(col, 0.2), 0.6) + L(fl, dk(col, 0.3), 1.2, 0.8) +
      (o.grizzle ? L(fl.replace(/q/g, 'm-2,-3 q'), o.grizzle, 1.2, 0.8) : '') + (o.scars ? L('M70,50 L86,66 M76,46 L92,62 M98,56 L108,72', o.scars, 1.8) : ''), 2.6);
    // head
    s += C(22, 49, 5.6, c.cel(dk(col, 0.1)), 2) + C(22, 49, 2.4, dk(col, 0.4));
    var hd = 'M42,62 C44,50 32,44 22,48 C14,50 10,56 10,62 L4,68 C0,72 1,79 6,81 L14,83 C20,89 36,89 42,83 C48,77 46,70 42,62 Z';
    s += body(c, hd, col, F('M32,44 L52,44 L52,92 L36,92 C44,80 42,62 32,44 Z', dk(col, 0.25), 0.7) + F('M1,72 C6,68 14,68 20,72 C22,78 20,84 14,86 L1,86 Z', mz, 0.95) + (o.face ? o.face(c) : ''), 2.4);
    s += C(34, 50, 6, c.cel(col), 2) + C(34, 50, 2.6, dk(col, 0.45));
    s += E(3.6, 71, 3.4, 2.8, '#140c0a', 1.2) + L('M5,80 Q10,83 18,81', OL, 1.4);
    if (o.fangs) s += P('M8,80.6 L9,85 L10.6,81 Z M14,81.4 L15,85.6 L16.4,81.4 Z', '#f4ecd6', 0.8);
    s += (o.eyeGlow ? gEye(c, 19, 62, 1.8, o.eyeGlow) : E(19, 62, 2.2, 2, o.eye || '#2a1a10', 1) + C(18.4, 61.4, 0.7, '#ffffff')) + L(o.angry ? 'M13,59 L24,56' : 'M13,58 L24,57', OL, 2.2);
    if (o.eyeScar) s += L('M14,52 L24,70', lt(col, 0.55), 1.8);
    s += limb('M44,90 L42,104 L42,116', col, 14) + bearPaw(42, 121, dk(col, 0.3)) + limb('M92,92 L96,104 L94,116', col, 14) + bearPaw(95, 121, dk(col, 0.3));
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- mountain lion (shared copy of art_barrens.js lioness) ----
  function lioness(c, o) {
    var col = o.col, bel = o.belly || '#f0dcb0', dcol = dk(col, 0.22), s = shadow(c, 64, 54);
    s += limb('M50,90 L40,104 L30,116', dcol, 8) + paw(30, 121, dk(col, 0.4)) + limb('M100,84 L114,98 L104,114', dcol, 9) + paw(104, 121, dk(col, 0.4));
    if (o.cougar) { var tl = 'M110,76 C124,76 128,60 122,46 C120,40 116,38 113,40'; s += L(tl, OL, 9) + L(tl, col, 5.2) + L('M121,50 C120,43 117,40 113,40', dk(col, 0.6), 5.2); }
    else s += L('M110,76 C122,82 126,98 120,110', OL, 7) + L('M110,76 C122,82 126,98 120,110', col, 3.6) + P('M117,106 C118,112 124,116 126,112 C126,106 124,104 121,104 Z', c.cel(dk(col, 0.55)), 1.5);
    var bd = 'M36,84 C38,72 50,64 62,68 C76,64 98,62 110,70 C118,76 118,88 110,94 C102,98 88,92 74,94 C58,97 42,95 36,88 Z';
    s += body(c, bd, col, F('M28,90 C52,102 92,102 122,90 L122,106 L28,106 Z', bel, 0.9) + F('M64,64 C82,62 100,62 110,68 C94,66 80,66 64,70 Z', lt(col, 0.2), 0.55) + F('M88,62 C100,62 112,66 116,76 L116,82 C108,72 98,68 86,68 Z', dk(col, 0.18), 0.6) +
      L('M72,74 C76,80 76,86 74,92 M84,72 C88,80 88,86 86,92', dk(col, 0.2), 1.3, 0.8));
    s += P('M46,76 C48,66 58,62 66,68 C60,70 54,74 52,80 Z', c.cel(col), 1.8);
    var hd = 'M44,80 C42,70 32,66 22,68 C14,70 10,74 8,78 C4,80 2,86 4,90 C6,95 12,97 18,96 C26,99 38,96 43,90 C46,87 46,84 44,80 Z';
    s += P('M24,72 C20,62 28,58 32,64 Z', c.cel(dk(col, 0.1)), 1.8);
    s += body(c, hd, col, F('M32,64 L52,64 L52,100 L38,100 C44,90 42,76 32,64 Z', dk(col, 0.25), 0.7) + F('M4,90 C10,96 20,99 32,97 L32,104 L2,104 Z', bel, 0.9) + L('M8,79 C14,75 22,74 30,76', dk(col, 0.2), 1.2, 0.8) + (o.mark ? L('M10,82 C14,86 16,90 14,94', dk(col, 0.5), 1.6) : ''));
    s += P('M32,70 C31,58 42,57 44,68 Z', c.cel(o.cougar ? dk(col, 0.45) : col), 1.8) + P('M35,68 C35,62 40,62 41,67 Z', '#3a2418', 0);
    s += P('M3,86 C3,80 10,78 15,81 C18,84 17,90 13,92 C8,94 3,91 3,86 Z', bel, 1.4) + P('M2,81 L8,79.6 L6.6,84.6 Z', '#3a2014', 1.2);
    if (o.cougar) s += P('M4,90 C8,88 14,88 18,90 L15,96 C11,98 7,97 4,94 Z', '#4a1014', 1.3) + P('M6.4,90 L7.6,94.6 L9,90.2 Z M13.6,90 L14.6,94.4 L16,90.4 Z', '#fff', 0.8) + E(4, 86, 2.6, 2, '#2a1a12', 0, 0.8) + E(9, 86.6, 2, 1.4, '#2a1a12', 0, 0.6);
    else s += L('M5,91 Q10,94 16,91', OL, 1.4) + P('M8,91.6 L9,96 L10.6,92 Z', '#fff', 0.8) + P('M13,92 L14,96 L15.4,91.6 Z', '#fff', 0.8);
    s += L(o.cougar ? 'M12,74 L24,78' : 'M12,75 L24,76.5', OL, 2.4) + E(18.5, 78.6, 3, 2.1, o.eye || '#c8e060', 1) + E(17.8, 78.6, 0.8, 1.6, OL) + L('M16,81 L12,85', dk(col, 0.55), 1.2);
    s += limb('M46,90 L40,104 L24,116', col, 9.5) + paw(24, 121, dk(col, 0.4)) + limb('M92,88 L104,102 L92,116', col, 10.5) + paw(92, 121, dk(col, 0.4));
    return s;
  }
  // ---- wolf (shared copy of art_mulgore.js, plus glowing eyes, bared fangs and a spiked ruff) ----
  function wolf(c, o) {
    var col = o.col, bel = o.belly || lt(col, 0.35), mane = o.mane || dk(col, 0.15), s = shadow(c, 62, 54);
    var fl = dk(col, 0.22);
    if (o.aura) s += C(40, 70, 60, glow(c, o.aura, 0.25));
    s += limb('M58,88 L60,104 L56,116', fl, 8.5) + paw(56, 121, dk(col, 0.35)) + limb('M100,84 L108,98 L102,110 L102,116', fl, 8.5) + paw(102, 121, dk(col, 0.35));
    s += body(c, 'M104,66 C116,64 124,74 124,88 C124,96 120,102 116,104 C116,96 114,88 108,82 C104,78 100,74 104,66 Z', col, F('M114,84 C120,90 120,98 116,104 L126,104 L126,84 Z', dk(col, 0.3), 0.8) + F('M116,96 C118,100 118,102 116,104 L124,104 L124,94 Z', bel, 0.9), 2.2);
    var bd = 'M40,68 C44,56 70,54 94,58 C108,60 114,70 110,82 C106,92 92,94 76,93 C58,94 46,90 40,82 C38,76 38,72 40,68 Z';
    s += body(c, bd, col, F('M30,84 C52,96 92,96 118,84 L118,104 L30,104 Z', bel, 0.85) + F('M56,58 C76,54 98,56 106,64 C88,60 72,60 56,62 Z', lt(col, 0.2), 0.5) + F('M70,56 C82,54 96,56 104,62 L104,72 C92,66 80,64 70,66 Z', dk(col, 0.2), 0.6) + (o.scars ? L('M72,66 L84,76 M78,64 L90,74', lt(col, 0.4), 1.6) : ''));
    if (o.spikes) s += P('M52,58 L56,46 L62,56 L68,44 L74,55 L82,44 L86,56 L94,48 L96,60 Z', c.cel(mane), 1.8);
    s += P('M36,52 L44,46 L46,52 L54,48 L54,56 L60,56 L56,64 L62,70 L54,74 L58,82 L48,82 L46,90 L40,82 Z', c.cel(mane), 2);
    s += P('M34,56 L32,38 L44,52 Z', c.cel(dk(col, 0.1)), 2);
    var hd = 'M46,58 C42,50 30,48 24,54 L10,64 C5,66 3,72 6,76 L16,80 C22,86 36,86 44,80 C50,74 50,64 46,58 Z';
    s += body(c, hd, col, F('M36,50 L56,50 L56,92 L40,92 C48,80 46,64 36,50 Z', dk(col, 0.25), 0.7) + F('M6,74 C14,80 26,84 40,82 L40,92 L4,92 Z', bel, 0.85) + F('M10,64 C16,60 22,57 30,56 L28,62 C20,62 14,64 10,66 Z', dk(col, 0.25), 0.7));
    s += P('M40,54 L42,34 L52,54 Z', c.cel(col), 2) + P('M43,50 L44,40 L48,51 Z', '#3a2a2a', 0);
    s += E(5.5, 69, 3.2, 2.6, '#1a1210', 1.2);
    s += o.glow ? gEye(c, 21.5, 63.5, 1.9, o.glow) + L('M14,59 L28,62', OL, 2.4) : L('M16,60 L27,61', OL, 2.2) + E(21.5, 63.5, 2.4, 1.7, o.eye || '#f0c040', 1) + E(21, 63.5, 0.7, 1.3, OL);
    if (o.snarl) s += P('M5,75 L22,77 L18,82 L8,80 Z', '#4a1014', 1.2) + P('M8,75.6 L9.4,80.4 L11,76 Z M15,76.4 L16.4,81.4 L18,76.8 Z M11,80.6 L12,77.4 L13.4,80.8 Z', '#fff', 0.7) + L('M8,70 L14,68 M10,72 L16,70', dk(col, 0.5), 1);
    else s += L('M6,76 L22,78', OL, 1.4) + P('M10,76.4 L11,80 L12.5,76.8 Z', '#fff', 0.8) + P('M17,77.4 L18,80.6 L19.5,77.8 Z', '#fff', 0.8);
    s += limb('M48,84 L44,102 L44,116', col, 9.5) + paw(44, 121, dk(col, 0.35)) + limb('M92,82 L100,96 L94,108 L94,116', col, 9.5) + paw(94, 121, dk(col, 0.35));
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- yeti (shaggy biped, horns, long arms; facing left) ----
  function yeti(c, o) {
    var fur = o.fur, fd = dk(fur, 0.2), face = o.face, s = shadow(c, 64, 42);
    if (o.back) s += o.back(c);
    s += limb('M84,54 L98,76 L100,96', fd, 15) + P(shag(96, 72, 9, 8, 6, 0.3, 11), c.cel(fd), 1.6) + clawHand([100, 100], dk(fur, 0.25), 1.4);
    s += limb('M74,90 L78,112', fd, 16) + E(80, 118, 11, 5, c.cel(dk(fur, 0.3)), 2) + L('M72,121 l-3,0.8 M76,122 l-3,0.8', '#efe6cf', 1.4);
    s += limb('M52,90 L48,112', fur, 17) + E(44, 118, 12, 5.5, c.cel(dk(fur, 0.2)), 2) + L('M34,121 l-3,0.8 M38,122 l-3,0.8 M42,122.4 l-3,0.8', '#efe6cf', 1.4);
    var td = shag(66, 70, 34, 30, 11, 0.12, o.seed || 3, 0.2), fl = '', r = rng(o.seed || 3);
    for (var i = 0; i < 16; i++) { var fx = 40 + r() * 52, fy = 46 + r() * 46; fl += 'M' + pt([fx, fy]) + 'q' + n(-1 - r() * 2) + ',' + n(3) + ' ' + n(-1) + ',' + n(6 + r() * 3); }
    s += body(c, td, fur, E(56, 80, 16, 18, lt(fur, 0.18), 0, 0.8) + F('M80,36 L104,36 L104,104 L84,104 C94,84 92,56 80,36 Z', dk(fur, 0.22), 0.8) + L(fl, dk(fur, 0.28), 1.2, 0.85) + (o.chest ? o.chest(c) : ''), 2.4);
    s += P(shag(72, 48, 26, 15, 8, 0.2, (o.seed || 3) + 1, -0.2), c.cel(fur), 2) + F(shag(78, 50, 16, 10, 6, 0.2, 9), dk(fur, 0.15), 0.6);
    // head
    var hx = o.hx || 44, hy = o.hy || 38;
    if (o.horns) s += o.horns(c, hx, hy, true);
    s += body(c, shag(hx + 2, hy, 17, 16, 9, 0.16, (o.seed || 3) + 2, 0.3), fur, F('M' + pt([hx + 6, hy - 20]) + 'L' + pt([hx + 22, hy - 20]) + 'L' + pt([hx + 22, hy + 20]) + 'L' + pt([hx + 8, hy + 20]) + 'Z', dk(fur, 0.2), 0.7), 2);
    var fd2 = 'M' + pt([hx - 12, hy - 6]) + 'C' + pt([hx - 10, hy - 14]) + ' ' + pt([hx + 4, hy - 14]) + ' ' + pt([hx + 6, hy - 6]) + 'L' + pt([hx + 6, hy + 6]) + 'C' + pt([hx + 2, hy + 14]) + ' ' + pt([hx - 10, hy + 16]) + ' ' + pt([hx - 18, hy + 11]) + 'C' + pt([hx - 22, hy + 6]) + ' ' + pt([hx - 20, hy]) + ' ' + pt([hx - 12, hy - 6]) + 'Z';
    s += body(c, fd2, face, F(pd([[hx - 2, hy - 16], [hx + 8, hy - 16], [hx + 8, hy + 16], [hx - 2, hy + 16]], true), dk(face, 0.25), 0.7) + E(hx - 14, hy + 6, 7, 5, lt(face, 0.15), 0, 0.8), 2);
    s += E(hx - 20, hy + 3, 2.6, 2, '#141418', 1);
    s += (o.eyeGlow ? gEye(c, hx - 8, hy - 3, 1.7, o.eyeGlow) : E(hx - 8, hy - 3, 2.2, 2, '#fff8e0', 1) + C(hx - 8.6, hy - 3, 1, OL)) + L(o.angry ? 'M' + pt([hx - 14, hy - 5]) + 'L' + pt([hx - 1, hy - 9]) : 'M' + pt([hx - 13, hy - 7]) + 'L' + pt([hx - 2, hy - 8]), OL, 2.6);
    if (o.roar) s += P('M' + pt([hx - 20, hy + 7]) + 'C' + pt([hx - 16, hy + 5]) + ' ' + pt([hx - 8, hy + 5]) + ' ' + pt([hx - 4, hy + 7]) + 'C' + pt([hx - 6, hy + 14]) + ' ' + pt([hx - 16, hy + 16]) + ' ' + pt([hx - 20, hy + 7]) + 'Z', '#5a1018', 1.4) +
      P(pd([[hx - 18, hy + 7], [hx - 16.6, hy + 12], [hx - 15.2, hy + 7]], true), '#f4ecd6', 0.9) + P(pd([[hx - 9, hy + 6.4], [hx - 7.6, hy + 11.6], [hx - 6.2, hy + 6.6]], true), '#f4ecd6', 0.9) + P(pd([[hx - 14, hy + 14.6], [hx - 13, hy + 10.6], [hx - 12, hy + 14.4]], true), '#f4ecd6', 0.8);
    else s += L('M' + pt([hx - 19, hy + 9]) + 'Q' + pt([hx - 13, hy + 11]) + ' ' + pt([hx - 7, hy + 9]), OL, 1.5) + P(pd([[hx - 17, hy + 9.4], [hx - 16.4, hy + 5], [hx - 15, hy + 9.6]], true), '#f4ecd6', 0.8);
    if (o.horns) s += o.horns(c, hx, hy, false);
    s += limb('M46,56 L32,76 L26,96', fur, 16) + P(shag(33, 74, 10, 9, 6, 0.3, 13), c.cel(fur), 1.6) + clawHand([25, 100], dk(fur, 0.15), 1.5);
    return o.tf ? G(s, o.tf) : s;
  }
  function yetiHornsSmall(c, x, y, farSide) {
    if (farSide) return P('M' + pt([x + 8, y - 12]) + 'C' + pt([x + 14, y - 22]) + ' ' + pt([x + 24, y - 20]) + ' ' + pt([x + 22, y - 10]) + 'C' + pt([x + 18, y - 14]) + ' ' + pt([x + 14, y - 12]) + ' ' + pt([x + 12, y - 8]) + 'Z', c.cel('#b8ae98'), 1.6);
    return P('M' + pt([x - 2, y - 13]) + 'C' + pt([x + 2, y - 24]) + ' ' + pt([x + 12, y - 26]) + ' ' + pt([x + 14, y - 16]) + 'C' + pt([x + 9, y - 19]) + ' ' + pt([x + 5, y - 17]) + ' ' + pt([x + 4, y - 11]) + 'Z', c.cel('#d8d0b8'), 1.6);
  }
  function yetiHornsBig(c, x, y, farSide) {
    var col = farSide ? '#8a7a60' : '#b8a47e';
    var d = farSide ? 'M' + pt([x + 8, y - 12]) + 'C' + pt([x + 18, y - 28]) + ' ' + pt([x + 36, y - 22]) + ' ' + pt([x + 34, y - 6]) + 'C' + pt([x + 33, y + 2]) + ' ' + pt([x + 26, y + 4]) + ' ' + pt([x + 24, y - 2]) + 'C' + pt([x + 28, y - 4]) + ' ' + pt([x + 28, y - 12]) + ' ' + pt([x + 22, y - 14]) + 'C' + pt([x + 18, y - 16]) + ' ' + pt([x + 14, y - 12]) + ' ' + pt([x + 13, y - 8]) + 'Z' :
      'M' + pt([x - 4, y - 12]) + 'C' + pt([x - 2, y - 32]) + ' ' + pt([x + 22, y - 36]) + ' ' + pt([x + 26, y - 18]) + 'C' + pt([x + 28, y - 8]) + ' ' + pt([x + 20, y - 4]) + ' ' + pt([x + 16, y - 8]) + 'C' + pt([x + 20, y - 12]) + ' ' + pt([x + 18, y - 22]) + ' ' + pt([x + 10, y - 22]) + 'C' + pt([x + 4, y - 22]) + ' ' + pt([x + 2, y - 16]) + ' ' + pt([x + 3, y - 10]) + 'Z';
    return body(c, d, col, farSide ? '' : L('M' + pt([x + 2, y - 20]) + 'l3,2 M' + pt([x + 8, y - 26]) + 'l2,3 M' + pt([x + 16, y - 27]) + 'l0,3 M' + pt([x + 22, y - 22]) + 'l-3,2', dk(col, 0.35), 1.2), 1.8);
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    hillsbrad_farmer: function (c) {
      var sk = '#e8b890', den = '#4a6a9a';
      return human(c, {
        skin: sk, shirt: '#e4d8b8', sleeve: '#e4d8b8', pants: den, boots: '#3a2616',
        h: { skin: sk, hat: 'straw', beard: '#8a5a30', hairCol: '#8a5a30' },
        chest: function (c) { return F('M52,62 L76,62 L78,92 L50,92 Z', den) + L('M52,62 L52,48 M76,62 L78,48', OL, 4.4) + L('M52,62 L52,48 M76,62 L78,48', den, 2.6) + C(54, 64, 1.4, '#e0c060', 0.8) + C(74, 64, 1.4, '#e0c060', 0.8) + R(58, 68, 10, 7, dk(den, 0.15), 0.9) + L('M58,56 L62,60 L66,56', dk('#e4d8b8', 0.3), 1.1); },
        near: [[48, 54], [40, 66], [34, 76]], wNear: function (c, p) { return pitchfork(c, p, 54, -PI / 2 - 0.08); },
        far: [[80, 54], [86, 68], [82, 82]], scale: 0.94
      });
    },
    hillsbrad_peasant: function (c) {
      var sk = '#dca880';
      return human(c, {
        skin: sk, shirt: '#5a7a3a', sleeve: '#5a7a3a', forearm: sk, pants: '#7a6a52', boots: '#4a3422', belt: '#4a3020', buckle: '#a89878',
        h: { skin: sk, hat: 'cap', hatCol: '#8a6a48', hairCol: '#c89048', stubble: true },
        chest: function (c) { return P('M52,48 L74,48 L63,62 Z', c.cel('#b83a2a'), 1.4) + L('M56,64 l0,20 M70,64 l0,20', dk('#5a7a3a', 0.3), 1.1) + R(64, 70, 8, 7, '#6a8a4a', 1); },
        near: [[48, 54], [38, 50], [28, 48]], wNear: function (c, p) { return scythe(c, p, 40, -PI / 2 + 0.35, true); },
        far: [[80, 54], [86, 68], [84, 82]], scale: 0.9
      });
    },
    syndicate_rogue: function (c) {
      var sk = '#d8a880', lea = '#2a262c';
      return human(c, {
        skin: sk, shirt: lea, sleeve: lea, pants: '#1e1c22', boots: '#141216', glove: '#1a181c', belt: '#3a2a22', buckle: '#8a8a90',
        h: { skin: sk, hat: 'hood', hatCol: '#1e1c22', mask: '#2a2630', maskTrim: SYN_R, angry: true },
        back: function (c) { return body(c, 'M70,44 C88,46 96,70 98,104 L84,100 L76,108 L68,98 Z', '#1a181c', F('M84,44 L100,44 L100,108 L86,108 Z', '#000', 0.3), 2); },
        chest: function (c) { return P('M76,48 L82,52 L54,88 L48,86 Z', c.cel(SYN_R), 1.3) + L('M50,60 L78,60', dk(lea, 0.4), 1.2) + R(70, 78, 7, 7, '#3a2a22', 1); },
        shins: function () { return L('M49,104 L57,104 M68,106 L76,106', '#4a3a30', 2); },
        near: [[48, 54], [36, 62], [26, 64]], wNearFront: function (c, p) { return dagger(p, PI + 0.3, 22); },
        far: [[80, 54], [92, 62], [98, 70]], wFar: function (c, p) { return dagger(p, 1.9, 18); },
        scale: 0.92
      });
    },
    syndicate_mercenary: function (c) {
      var sk = '#e0a880', mail = '#7a2224';
      return human(c, {
        skin: sk, shirt: mail, sleeve: mail, forearm: '#5a5e66', pants: '#3a3036', boots: '#2a2224', glove: '#4a4a50', belt: '#2a1a14', buckle: '#c8a048',
        torsoD: 'M42,50 C48,43 80,43 86,50 L84,70 L80,88 L48,88 L44,70 Z', armW: 10, legW: 11,
        h: { skin: sk, hat: 'helm', hatCol: '#5a5e68', beard: '#2a1a14', crest: SYN_R, angry: true },
        chest: function (c) {
          var rings = '';
          for (var yy = 52; yy < 88; yy += 5) for (var xx = 44; xx < 86; xx += 5) rings += 'M' + (xx + (yy % 10 ? 2.5 : 0)) + ',' + yy + ' l2,0';
          return L(rings, dk(mail, 0.4), 1.4, 0.9) + body(c, 'M56,50 L72,50 L74,98 L64,102 L54,98 Z', SYN_B, L('M56,52 L56,96 M72,52 L72,96', SYN_R, 1.6), 1.6) + L(ellD(64, 66, 4, 4), SYN_R, 2);
        },
        pads: function (c) { return body(c, 'M34,50 C34,40 52,38 58,46 L56,58 C48,56 40,58 34,56 Z', '#5a5e68', L('M38,48 L54,48', '#ffffff', 1, 0.4), 2) + C(46, 46, 1.2, '#c8ccd4'); },
        near: [[48, 54], [38, 46], [30, 40]], wNear: function (c, p) { return sword(p, 38, -PI / 2 - 0.45, '#b8bcc4', 1.1); },
        far: [[80, 54], [88, 70], [88, 84]], scale: 0.98
      });
    },
    hillsbrad_miner: function (c) {
      var sk = '#dca070';
      return human(c, {
        skin: sk, shirt: '#6a7a8a', sleeve: '#6a7a8a', forearm: sk, pants: '#5a4a3a', boots: '#3a2a1a', glove: '#6a4a2a', belt: '#3a2618', buckle: '#a8a090',
        h: { skin: sk, hat: 'miner', dirt: true, mous: '#5a3a22', hairCol: '#5a3a22' },
        chest: function (c) { return F('M46,50 L56,50 L58,88 L50,88 Z', '#7a5634') + F('M72,50 L82,50 L78,88 L70,88 Z', '#7a5634') + E(64, 74, 4, 3, '#4a3a30', 0, 0.35); },
        near: [[48, 54], [42, 44], [36, 36]], wNear: function (c, p) { return pickaxe(c, p, 42, -PI / 2 - 0.6); },
        far: [[80, 54], [88, 70], [88, 84]], wFar: function (c, p) { return oreChunk(c, p[0] + 2, p[1] + 8, 5, '#4a8ad8'); },
        scale: 0.92
      });
    },
    gray_bear: function (c) { return bear(c, { col: '#7e7c7c', belly: '#a4a09c', muzzle: '#b8b0a4', tf: at(0.88, 64, 122), seed: 3 }); },
    mountain_lion: function (c) { return lioness(c, { col: '#a87a50', belly: '#f2e4cc', mark: true, cougar: true }); },
    cave_yeti: function (c) { return yeti(c, { fur: '#e4e8ee', face: '#8aa4c0', horns: yetiHornsSmall, seed: 3, tf: at(0.88, 64, 122) }); },
    ferocious_yeti: function (c) {
      return yeti(c, {
        fur: '#9a948a', face: '#3a3a44', horns: yetiHornsBig, roar: true, angry: true, eyeGlow: '#ffb030', seed: 8,
        chest: function () { return L('M50,60 L60,74 M56,58 L66,72', '#d88a7a', 1.6); }
      });
    },
    moonrage_worgen: function (c) { return worgen(c, { fur: '#8a8c90', mane: '#5a5c62', rag: '#6a5a44', eye: '#ffd040', seed: 5, scale: 0.94, near: [[44, 54], [30, 66], [18, 72]], far: [[82, 52], [96, 62], [104, 74]] }); },
    big_samras: function (c) {
      return bear(c, { col: '#6a5a4a', belly: '#8a7a68', muzzle: '#d8d0c4', grizzle: '#d0c8bc', scars: '#e0a090', eyeScar: true, angry: true, fangs: true, eyeGlow: '#ffb040', seed: 7 });
    },
    foreman_bonds: function (c) {
      var sk = '#e0a880';
      return human(c, {
        skin: sk, shirt: '#d8d0c0', sleeve: '#d8d0c0', forearm: sk, pants: '#4a4a58', boots: '#2a2018', belt: '#3a2618', buckle: '#d8b048', armW: 10, legW: 12,
        torsoD: 'M42,50 C48,43 80,43 86,50 C90,64 88,80 82,90 L46,90 C40,80 38,64 42,50 Z',
        h: { skin: sk, hat: 'hard', hatCol: '#c88a2a', mous: '#c8c0b8', hairCol: '#9a948c', jaw: true, angry: true },
        chest: function (c) { return F('M42,50 L54,48 L56,90 L46,90 C40,80 38,64 42,50 Z', '#6a4a2e') + F('M74,48 L86,50 C90,64 88,80 82,90 L72,90 Z', '#6a4a2e') + C(55, 62, 1.3, '#d8b048') + C(55, 74, 1.3, '#d8b048') + R(76, 58, 6, 8, '#5a3a22', 1) + L('M78,56 L80,52', '#c8c4bc', 1.4); },
        near: [[48, 54], [36, 50], [26, 46]], wNear: function (c, p) { return hammer(c, p, 32, -PI / 2 - 0.5, 10, '#6a6e76'); },
        far: [[80, 54], [90, 68], [88, 82]], scale: 1.02
      });
    },
    shadowfang_moonwalker: function (c) {
      var liv = '#2a3050', sil = '#a8acb8';
      return worgen(c, {
        fur: '#6e6258', mane: '#4a3e36', rag: liv, eye: '#f09a30', seed: 9, scale: 0.98,
        chest: function (c) { return body(c, 'M52,48 L76,48 L78,96 L72,92 L68,100 L62,92 L56,98 L50,92 Z', liv, L('M54,50 L54,90 M74,50 L74,90', sil, 1.3) + wolfSigil(64, 66, 0.9, sil) + F('M68,46 L82,46 L82,100 L70,100 Z', '#000', 0.3), 1.8); },
        pads: function (c) { return body(c, 'M28,50 C28,40 46,38 54,46 L52,58 C44,56 36,58 28,56 Z', '#3a3a4a', L('M32,50 L50,50', sil, 1.2), 2); },
        near: [[44, 54], [30, 62], [18, 58]], far: [[82, 52], [94, 40], [92, 26]]
      });
    },
    shadowfang_darksoul: function (c) {
      var vi = '#4a2a6a';
      return worgen(c, {
        fur: '#3a3638', mane: '#262224', rag: '#3a1e52', hood: vi, hoodTrim: '#a070e0', eye: '#d090ff', seed: 13, scale: 0.96, bare: false,
        back: function (c) { return C(56, 64, 64, glow(c, '#9a50ff', 0.3)); },
        chest: function (c) { return body(c, 'M50,50 L78,50 L80,98 L48,98 Z', vi, L('M64,52 L64,96', '#a070e0', 1.4) + F('M68,48 L86,48 L86,100 L70,100 Z', '#000', 0.3) + boneCharm(64, 58), 1.8); },
        near: [[44, 54], [32, 64], [22, 70]], wNearFront: function (c, p) { return shadowSwirl(c, [p[0] - 6, p[1] - 8], 1.1); },
        far: [[82, 52], [94, 62], [98, 74]], wFar: function (c, p) { return C(p[0], p[1], 10, glow(c, '#b070ff', 0.6)); }
      });
    },
    haunted_servitor: function (c) {
      var sk = '#c8e8f4', coat = '#4e7a98', sh = '#d8f0ff';
      return human(c, {
        skin: sk, shirt: coat, sleeve: coat, pants: coat, glove: '#e8f8ff', noLegs: true, shadow: false,
        h: { skin: sk, hat: 'bald', hairCol: '#e0f0f8', glowEye: '#e8ffff', open: true, gaunt: true },
        back: function (c) { return C(64, 70, 62, glow(c, '#9ad8ff', 0.35)) + E(64, 122, 22, 5, '#9ad8ff', 0, 0.25) + body(c, 'M68,76 C82,84 90,100 88,114 L76,108 Z', dk(coat, 0.2), null, 1.6); },
        front: function (c) { return body(c, 'M50,84 L80,84 C84,98 80,108 70,114 C64,118 58,120 50,118 C56,112 58,106 55,100 C51,96 48,90 50,84 Z', coat, F('M50,100 L90,100 L90,122 L40,122 Z', '#bfe8ff', 0.5), 1.8) + L('M56,104 C60,110 58,116 52,118', '#e8faff', 1.2, 0.7); },
        chest: function (c) { return F('M56,50 L72,50 L66,74 L62,74 Z', sh) + P('M59,51 L64,54 L69,51 L69,57 L64,54 L59,57 Z', '#1e2a36', 1) + C(64, 62, 1, '#1e2a36') + C(64, 68, 1, '#1e2a36'); },
        near: [[48, 54], [40, 66], [34, 72]], wNearFront: function (c, p) { return R(p[0] - 1.6, p[1] - 16, 3.2, 12, '#f0f8ff', 0.8) + flame(c, p[0], p[1] - 16, 0.45, '#6ad0ff', '#e8ffff'); },
        far: [[80, 54], [92, 50], [98, 42]], wFar: function (c, p) { return E(p[0] - 2, p[1] - 5, 14, 3, c.cel('#c8d4e0'), 1.4) + P('M' + pt([p[0] - 8, p[1] - 7]) + 'C' + pt([p[0] - 10, p[1] - 16]) + ' ' + pt([p[0] + 2, p[1] - 16]) + ' ' + pt([p[0], p[1] - 7]) + 'Z', c.cel('#d8e4f0'), 1.2); },
        tf: at(0.94, 64, 114), op: 0.86
      });
    },
    rethilgore: function (c) {
      var fur = '#2a282c';
      return worgen(c, {
        fur: fur, mane: '#18161a', rag: '#3a3a40', eye: '#ff4a2a', seed: 17, scale: 1.04, scar: true, legW: 13, armW: 12, hy: 38,
        torsoD: 'M34,48 C38,34 86,32 94,46 L88,68 L80,90 L50,90 L42,70 Z',
        chest: function (c) { var ch = ''; for (var i = 0; i < 9; i++) ch += '<ellipse cx="' + n(40 + i * 5) + '" cy="' + n(48 + i * 5) + '" rx="3" ry="2" fill="none" stroke="#8a8e96" stroke-width="1.6" transform="rotate(40,' + n(40 + i * 5) + ',' + n(48 + i * 5) + ')"/>'; return L('M40,48 L82,90', OL, 5) + ch; },
        front: function (c) { return L(ellD(74, 92, 5, 5), OL, 3) + L(ellD(74, 92, 5, 5), '#c8a048', 1.6) + L('M72,96 l-1,6 M76,96 l1,7 M74,97 l0,5', '#c8a048', 1.6); },
        nearHand: function (c, p) { return manacle(c, [p[0] + 5, p[1] - 5], 1.1) + clawHand(p, fur, 1.2); },
        farHand: function (c, p) { return manacle(c, [p[0] + 3, p[1] - 5], 1) + chain(p[0] + 6, p[1] - 2, 22, 1, '#8a8e96') + clawHand(p, dk(fur, 0.1), 1.1); }
      });
    },
    razorclaw: function (c) {
      var sk = '#d8a080';
      return human(c, {
        skin: sk, shirt: '#8a8278', sleeve: '#8a8278', forearm: sk, pants: '#4a3a30', boots: '#2a2018', armW: 12, legW: 13, hipY: 90, shadowR: 38,
        torsoD: 'M40,48 C48,38 82,38 90,48 C98,62 98,84 86,94 L44,94 C32,84 32,62 40,48 Z',
        h: { skin: sk, hat: 'bald', hairCol: '#4a3a30', jaw: true, stubble: true, scar: true, angry: true, open: true },
        front: function (c) { return body(c, 'M46,58 L82,58 L88,110 L40,110 Z', '#e0d8c4', E(56, 74, 6, 4, '#a01818', 0, 0.8) + E(70, 88, 5, 7, '#a01818', 0, 0.75) + E(52, 98, 4, 3, '#a01818', 0, 0.7) + C(78, 70, 2, '#a01818', 0, 0.8) + F('M72,56 L92,56 L92,112 L76,112 Z', '#000', 0.2), 1.8) + L('M46,58 L44,48 M82,58 L84,48', '#c8c0ac', 2); },
        near: [[46, 52], [34, 44], [26, 40]], wNear: function (c, p) { return cleaver(c, p, 34, -PI / 2 - 0.5, 15); },
        far: [[84, 52], [96, 68], [96, 84]], wFar: function (c, p) { return L('M' + pt([p[0], p[1] + 4]) + 'L' + pt([p[0], p[1] + 14]) + 'Q' + pt([p[0], p[1] + 22]) + ' ' + pt([p[0] - 6, p[1] + 20]), OL, 4) + L('M' + pt([p[0], p[1] + 4]) + 'L' + pt([p[0], p[1] + 14]) + 'Q' + pt([p[0], p[1] + 22]) + ' ' + pt([p[0] - 6, p[1] + 20]), '#a8acb4', 2); },
        scale: 1.04
      });
    },
    baron_silverlaine: function (c) {
      var sk = '#b8ccd4', coat = '#4a5878', gold = '#a89a60';
      return human(c, {
        skin: sk, shirt: coat, sleeve: coat, pants: '#3a4458', boots: '#22283a', glove: '#d8e4ec',
        h: { skin: sk, hairCol: '#e4ecf2', pony: true, ribbon: '#2a3450', glowEye: '#9af0ff', gaunt: true, mous: '#e4ecf2' },
        back: function (c) { return C(64, 70, 62, glow(c, '#9af0ff', 0.3)) + body(c, 'M70,80 L92,114 L80,116 L72,108 Z', dk(coat, 0.15), null, 1.6) + body(c, 'M58,80 L44,114 L54,116 L62,106 Z', dk(coat, 0.1), null, 1.6); },
        chest: function (c) { return L('M58,48 L54,88 M70,48 L74,88', gold, 2.2) + P('M58,46 L70,46 L66,62 L64,64 L62,62 Z', '#eef6fa', 1.2) + L('M60,52 l8,0 M60,56 l7,0', '#b8c8d0', 1) + C(76, 64, 1.3, gold) + C(76, 72, 1.3, gold) + C(76, 80, 1.3, gold); },
        shins: function () { return L('M48,108 L58,108 M68,110 L78,110', '#6a7488', 2.4); },
        near: [[48, 54], [36, 62], [24, 64]], wNearFront: function (c, p) { return rapier(c, p, 52, PI + 0.12); },
        far: [[80, 54], [92, 46], [96, 36]],
        front: function (c) { return E(64, 118, 26, 4, '#9af0ff', 0, 0.3) + L('M40,116 q6,-6 12,0 M70,118 q6,-6 12,0', '#bff4ff', 1.4, 0.6); },
        op: 0.92, scale: 0.98
      });
    },
    commander_springvale: function (c) {
      var pl = '#3a3a46', tab = '#5a2430';
      return human(c, {
        skin: '#8a9a8a', shirt: pl, sleeve: pl, forearm: '#4a4a56', pants: '#2e2e38', boots: '#26262e', glove: pl, belt: '#2a1a14', buckle: '#a89048', armW: 10, legW: 11,
        torsoD: 'M40,50 C46,42 82,42 88,50 L84,70 L80,88 L48,88 L44,70 Z', neckCol: pl,
        h: { hat: 'fullhelm', hatCol: '#44444e', crest: tab, glowEye: '#8aff6a' },
        chest: function (c) {
          var rays = '';
          for (var i = 0; i < 8; i++) { var a = i * PI / 4; rays += 'M' + pt([64 + Math.cos(a) * 4, 68 + Math.sin(a) * 4]) + 'L' + pt([64 + Math.cos(a) * 8, 68 + Math.sin(a) * 8]); }
          return body(c, 'M54,54 L74,54 L76,100 L64,104 L52,100 Z', tab, F('M68,52 L80,52 L80,106 L70,106 Z', '#000', 0.3) + C(64, 68, 3.4, '#b8a060', 0, 0.75) + L(rays, '#b8a060', 1.4, 0.75) + L('M56,82 L60,88 M70,78 L66,86', dk(tab, 0.4), 1.2), 1.8) + L('M46,60 L54,60 M76,60 L84,60', lt(pl, 0.2), 1.2);
        },
        pads: function (c) { return body(c, 'M30,52 C28,38 50,34 60,44 L58,58 C48,56 38,58 30,58 Z', '#44444e', L('M34,50 Q44,46 56,50', lt(pl, 0.35), 1.2) + L('M34,55 Q44,51 56,55', dk(pl, 0.3), 1.2), 2) + P('M40,40 L36,28 L46,38 Z', c.cel('#6a6a76'), 1.3); },
        near: [[48, 54], [38, 46], [30, 40]], wNear: function (c, p) { return C(q0(p, -PI / 2 - 0.4, 32)[0], q0(p, -PI / 2 - 0.4, 32)[1], 16, glow(c, '#8aff6a', 0.35)) + hammer(c, p, 32, -PI / 2 - 0.4, 9, '#5a5e68', 6); },
        far: [[80, 54], [88, 70], [88, 84]], scale: 1.02
      });
    },
    fenrus: function (c) { return wolf(c, { col: '#2e2a2e', belly: '#4a4448', mane: '#18161a', glow: '#ff5a2a', snarl: true, spikes: true, scars: true, aura: '#ff4020' }); },
    arugal: function (c) {
      var sk = '#dcd0c8', robe = '#5a2a8a', gold = '#d8b048';
      return human(c, {
        skin: sk, shirt: robe, sleeve: robe, forearm: dk(robe, 0.1), pants: '#3a1a5a', boots: '#2a1a30', glove: sk,
        h: { skin: sk, hat: 'cowl', hatCol: '#4a2272', trim: gold, beard: '#c8c4c0', longBeard: true, glowEye: '#e0b0ff' },
        back: function (c) { return portal(c, 76, 58, 44, 50, '#9a40e0') + body(c, 'M76,46 C92,50 100,90 104,118 L78,118 Z', '#3a1a5a', null, 2); },
        front: function (c) { return body(c, 'M48,82 L80,82 L92,120 L74,118 L64,122 L54,118 L36,120 Z', robe, L('M64,84 L64,120', gold, 2) + L('M38,118 L54,116 L64,120 L74,116 L90,118', gold, 1.8) + F('M70,80 L96,80 L96,124 L76,124 Z', '#000', 0.25), 2); },
        chest: function (c) { return L('M58,48 L54,86 M70,48 L74,86', gold, 2) + P('M60,74 L68,74 L66,80 L62,80 Z', c.cel('#b060ff'), 1); },
        near: [[48, 54], [38, 66], [30, 74]], wNear: function (c, p) { return mageStaff(c, [p[0] - 4, p[1] - 52], [p[0] + 4, p[1] + 46], '#c070ff'); },
        far: [[80, 54], [94, 48], [100, 36]], wFar: function (c, p) { return shadowSwirl(c, [p[0], p[1] - 10], 1.1, '#b060ff'); },
        scale: 0.98
      });
    }
  };
  function q0(p, ang, u) { return dirQ(p, ang)(u, 0); }
  function boneCharm(x, y) { return L('M' + (x - 8) + ',' + y + ' Q' + x + ',' + (y + 7) + ' ' + (x + 8) + ',' + y, '#c8c0b0', 1.1) + P('M' + n(x - 1.4) + ',' + n(y + 3) + ' L' + n(x) + ',' + n(y + 9) + ' L' + n(x + 1.4) + ',' + n(y + 3) + ' Z', '#f0e8d4', 0.9); }

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#7a8a6a'), 2.5); }
  function phScene(c) { return sky(c, '#6f8aa8', '#a8b8c8', '#dde2e2') + ground(c, 150, '#6a8a44', '#46602e'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#7a8a6a"/></svg>'; }
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
