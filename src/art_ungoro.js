/* art_ungoro.js — Greenmaw Crater zone art for Realm of Loner (contested, levels 48-54: a prehistoric jungle in a volcanic
 * crater; Marshal's Refuge, Steamcrack Springs, Tooth Run, the Hive Scar, Smokeplume Ridge, the Blacktar Pits
 * and the Marshlands; bloodpetals, dinosaurs, pterrordax, Krizzik silithid, fire and lava elementals, tar creatures,
 * gorillas, the rare queen-guard Rex Scorchtail and the devilsaur King Stomp).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Greenmaw keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers and the jungle pieces (canopy, vines, palms, ferns, big leaves, floor, tents, flags) are shared copies of
 * art_stranglethorn.js. The crater walls, volcanoes, tree ferns, crystals, hot springs, tar pits, lava, the Krizzik
 * hive and every mob are new here. The Krizzik are deliberately apart from the amber Hivecrawler of Sirocco:
 * violet-black chitin, lime venom glow, green-tinted wings.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix ug<counter>_).
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
  function Ctx() { this.p = 'ug' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function mist(c, y, h, col, op, seed) {
    var r = rng(seed || 5), o = R(-2, y - h / 2, 404, h, c.lg([[0, col, 0], [0.5, col, op], [1, col, 0]]));
    for (var i = 0; i < 5; i++) o += E(r() * 400, y + (r() - 0.5) * h * 0.4, 40 + r() * 40, h * 0.22, col, 0, op * 0.8);
    return o;
  }
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
  // ---- biped rig (facing left; shared copy of art_ashenvale.js) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  // ---- shared copies (art_wetlands.js / art_redridge.js / art_barrens.js) ----
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function birdFoot(x, y, col, big) {
    var k = big ? 1.25 : 1;
    return L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), OL, 5) + L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), col, 2.2);
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
  function waves(seed, y0, y1, cnt, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 6 + t * 16, x = r() * 400; d += 'M' + pt([x - w, y]) + 'q' + n(w / 2) + ',' + n(-2 - t * 2) + ' ' + n(w) + ',0'; }
    return L(d, col || '#e8f0ec', 1.1, 0.7);
  }
  // irregular spot blobs for mottled hides, as a mark hook
  function mottle(seed, cnt, x0, y0, x1, y1, dark, light, r0, r1) {
    return function () {
      var r = rng(seed), o = '';
      for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (r0 || 1.6) + r() * ((r1 || 3.4) - (r0 || 1.6)); o += F(shag(x, y, rr * 1.2, rr, 5, 0.3, seed + i * 7), i % 3 === 2 ? light : dark, 0.85); }
      return o;
    };
  }

  function haze(c, y, h, op, col) { return mist(c, y, h, col || '#c8d0c8', op || 0.3, Math.round(y * 3)); }
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

  // ============================================================
  //  UN'GORO: palette
  // ============================================================
  var MOSS = '#5e9a3a', MOSSD = '#3e6a28', REED = '#8aa24a', STONE = '#8a8478', MUDD = '#3e3226',
    LEAF = '#3e9a44', PALM = '#4a9e3a', TRUNK = '#7a5a3a', GOLD = '#d8b040', BONE = '#ece0c2';
  var FERN = '#3e9e48', FERND = '#27703a', CLIFF = '#a8603e', TAR = '#1c171b', LAVA = '#ff7a1a', LAVAY = '#ffd84a',
    BASALT = '#3e3434', HIVE = '#5a3c6e', VENOM = '#b8ff4a', SPRING = '#46cfc4', TRAV = '#efe2c2', EXPL = '#2a7a8a';

  // ============================================================
  //  UN'GORO SCENE PIECES (new here)
  // ============================================================
  // the crater wall on the horizon: a ragged mesa line with strata and gullies (sw 0 = no outline, for distance)
  function craterRim(c, seed, base, hMin, hMax, col, sw) {
    var r = rng(seed), p = [], x = -30;
    while (x < 440) { p.push([x, base - hMin - r() * (hMax - hMin)]); x += 14 + r() * 28; }
    var d = 'M-30,' + n(base + 60) + p.map(function (q) { return 'L' + pt(q); }).join('') + 'L440,' + n(base + 60) + 'Z';
    var st = '', gl = '';
    for (var k = 1; k <= 4; k++) { var yy = base - hMax * k / 5; st += 'M-30,' + n(yy); for (var xx = -30; xx <= 440; xx += 20) st += 'L' + pt([xx, yy + Math.sin(xx * 0.05 + k * 1.7 + seed) * 2.5]); }
    for (var j = 0; j < 16; j++) { var gx = r() * 400, gy = base - hMin * (0.3 + r() * 0.8); gl += 'M' + pt([gx, gy]) + 'l' + n((r() - 0.5) * 4) + ',' + n(10 + r() * 22); }
    var shade = L(st, dk(col, 0.16), 1.3, 0.7) + L(gl, dk(col, 0.24), 2, 0.6) + R(-30, base - hMin, 470, hMin + 60, c.lg([[0, dk(col, 0.2), 0], [1, dk(col, 0.3), 0.7]]));
    return body(c, d, col, shade, sw || 0) + L('M' + p.map(pt).join('L'), lt(col, 0.3), 1.5, 0.8);
  }
  // cone volcano with a glowing crater, lava streaks and a smoke plume
  function volcano(c, x, base, w, h, col, sw, plume, lavaN) {
    var lip = base - h, r = rng(Math.round(x * 3 + h));
    var d = 'M' + pt([x - w / 2, base]) + 'C' + pt([x - w * 0.3, base - h * 0.3]) + ' ' + pt([x - w * 0.14, lip + h * 0.12]) + ' ' + pt([x - w * 0.09, lip]) + 'L' + pt([x - w * 0.03, lip + 3]) + 'L' + pt([x + w * 0.03, lip + 2]) + 'L' + pt([x + w * 0.09, lip]) +
      'C' + pt([x + w * 0.14, lip + h * 0.12]) + ' ' + pt([x + w * 0.3, base - h * 0.3]) + ' ' + pt([x + w / 2, base]) + 'Z';
    var gul = '';
    for (var i = 0; i < 7; i++) { var t = (i + 0.5) / 7, gx = x - w * 0.08 + w * 0.16 * t; gul += 'M' + pt([gx, lip + 4]) + 'Q' + pt([gx + (t - 0.5) * w * 0.3, base - h * 0.45]) + ' ' + pt([gx + (t - 0.5) * w * 0.8, base]); }
    var shade = F('M' + pt([x + w * 0.02, lip - 2]) + 'L' + pt([x + w * 0.6, lip - 2]) + 'L' + pt([x + w * 0.6, base + 4]) + 'L' + pt([x + w * 0.14, base + 4]) + 'C' + pt([x + w * 0.1, base - h * 0.4]) + ' ' + pt([x + w * 0.04, lip + h * 0.3]) + ' ' + pt([x + w * 0.02, lip - 2]) + 'Z', dk(col, 0.25), 0.85) + L(gul, dk(col, 0.3), 1.2, 0.6);
    var o = body(c, d, col, shade, sw || 0);
    for (var k = 0; k < (lavaN == null ? 3 : lavaN); k++) {
      var sx = x + (k - ((lavaN == null ? 3 : lavaN) - 1) / 2) * w * 0.035, len = h * (0.35 + r() * 0.4), pts = [[sx, lip + 1]], py = lip + 1, px = sx;
      for (var m = 0; m < 4; m++) { py += len / 4; px += (k - ((lavaN == null ? 3 : lavaN) - 1) / 2) * w * 0.012 + (r() - 0.5) * 4; pts.push([px, py]); }
      var T = taper(pts, Math.max(2.2, w * 0.022), 0.6, 4);
      o += L(along(T, 0.5), '#ff5a10', w * 0.03 + 4, 0.25) + F(T.d, LAVA) + L(along(T, 0.5), LAVAY, 0.9, 0.9);
    }
    o += E(x, lip + 1, w * 0.09, 3, '#ff9a2a', 0, 0.95) + C(x, lip, w * 0.22, glow(c, '#ff7a20', 0.55));
    if (plume) {
      for (var j = 0; j < 9; j++) { var tt = j / 8; o += C(x + tt * w * 0.5 * plume + (r() - 0.5) * 8, lip - 6 - tt * h * 1.3, (5 + tt * 22) * (w / 200 + 0.4), j < 2 ? '#7a6a66' : '#9a908c', 0, 0.75 * (1 - tt * 0.55)); }
      o += C(x, lip - 6, w * 0.07, '#ff8a3a', 0, 0.4);
    }
    return o;
  }
  // a near crater wall as a big cliff block (x0 = left edge at the ground line yb), strata, ledges with moss
  function cliffWall(c, x0, yb, col, seed, right) {
    var r = rng(seed || 9), pts = [], y = yb, x = x0, k = right ? -1 : 1;
    while (y > -10) { pts.push([x, y]); y -= 14 + r() * 22; x += k * (r() * 16 - 3); }
    pts.push([x, -4]);
    var edge = right ? 404 : -4;
    var d = 'M' + pt([edge, yb + 4]) + 'L' + pts.map(pt).join('L') + 'L' + pt([edge, -4]) + 'Z';
    var st = '', moss = '';
    for (var j = 1; j < 9; j++) { var sy = yb - j * (yb / 9) + (r() - 0.5) * 6; st += 'M' + pt([x0 - 60, sy]) + 'Q' + pt([x0 + k * 60, sy + (r() - 0.5) * 10]) + ' ' + pt([x0 + k * 200, sy + (r() - 0.5) * 8]); }
    pts.forEach(function (p, i) { if (i && i % 2 === 0) moss += 'M' + pt([p[0] - 1, p[1]]) + 'q' + n(k * 8) + ',-4 ' + n(k * 18) + ',0 q' + n(-k * 8) + ',3 ' + n(-k * 18) + ',0Z'; });
    // right-hand wall: its lit face is the left edge, darker further in; left-hand wall: its inner face is in shade
    var shade = L(st, dk(col, 0.2), 1.3, 0.75) + F(pd(right ? [[pts[0][0] + 26, yb + 6], [404, yb + 6], [404, -6], [x + 26, -6]] : [[x0 - 26, yb + 6], [x0 + 40, yb + 6], [x + 40, -6], [x - 26, -6]], true), dk(col, 0.22), 0.8) +
      R(-4, yb - 40, 408, 46, c.lg([[0, '#000', 0], [1, '#000', 0.25]]));
    return body(c, d, col, shade, 2) + F(moss, MOSS, 0.95);
  }
  // cave mouth cut into a cliff (x = centre, y = floor)
  function caveMouth(c, x, y, w, h) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w / 2, y - h * 0.7]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w / 2, y - h * 0.7]) + ' ' + pt([x + w / 2, y]) + 'Z';
    var rim = 'M' + pt([x - w / 2 - 6, y]) + 'C' + pt([x - w / 2 - 6, y - h * 0.76]) + ' ' + pt([x - w * 0.32, y - h - 7]) + ' ' + pt([x, y - h - 7]) + 'C' + pt([x + w * 0.32, y - h - 7]) + ' ' + pt([x + w / 2 + 6, y - h * 0.76]) + ' ' + pt([x + w / 2 + 6, y]) + 'Z';
    return P(rim, c.cel('#8a5238'), 2) + P(d, c.lg([[0, '#0e0a0a'], [0.7, '#2a1a14'], [1, '#4a2c1c']]), 2) + C(x + w * 0.12, y - h * 0.3, w * 0.5, glow(c, '#ffb050', 0.4)) +
      lantern(c, x + w * 0.12, y - h * 0.46, 0.9) + L('M' + pt([x - w * 0.4, y - h * 0.62]) + 'C' + pt([x - w * 0.25, y - h * 0.9]) + ' ' + pt([x, y - h * 0.94]) + ' ' + pt([x + w * 0.2, y - h * 0.88]), lt('#8a5238', 0.3), 1.4, 0.8);
  }
  function lantern(c, x, y, s) {
    return C(x, y, 14 * s, glow(c, '#ffc060', 0.6)) + L('M' + pt([x, y - 5 * s]) + 'l0,-5', OL, 1 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 8 * s, '#ffd070', 1.2 * s, 1) + R(x - 3.6 * s, y - 6.4 * s, 7.2 * s, 2 * s, c.cel('#5a4a3a'), 1 * s) + R(x - 3.6 * s, y + 3 * s, 7.2 * s, 1.6 * s, c.cel('#5a4a3a'), 1 * s);
  }
  // explorers' lookout: a timber tower with a canvas roof and a ladder (x = centre, y = ground)
  function lookout(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#8a6440', o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.25);
    o += limb('M' + pt(q(-14, 0)) + 'L' + pt(q(-10, -72)) + 'M' + pt(q(14, 0)) + 'L' + pt(q(10, -72)), dk(wood, 0.1), 3.6 * s);
    o += limb('M' + pt(q(-13, -8)) + 'L' + pt(q(11, -36)) + 'M' + pt(q(13, -8)) + 'L' + pt(q(-11, -36)) + 'M' + pt(q(-11, -40)) + 'L' + pt(q(10, -66)) + 'M' + pt(q(11, -40)) + 'L' + pt(q(-10, -66)), wood, 1.8 * s);
    o += limb('M' + pt(q(4, 0)) + 'L' + pt(q(6, -70)) + 'M' + pt(q(12, 0)) + 'L' + pt(q(13, -70)), '#6a4a2c', 1.6 * s);
    for (var i = 1; i < 9; i++) o += L('M' + pt(q(4.2 + i * 0.25, -i * 8)) + 'L' + pt(q(12.2 + i * 0.1, -i * 8)), OL, 2.6 * s) + L('M' + pt(q(4.2 + i * 0.25, -i * 8)) + 'L' + pt(q(12.2 + i * 0.1, -i * 8)), '#a47a4a', 1.2 * s);
    o += P(pd([q(-18, -70), q(18, -70), q(18, -76), q(-18, -76)], true), c.cel(wood), 1.6 * s);
    o += P(pd([q(-17, -76), q(-17, -88), q(17, -88), q(17, -76)], true), 'none', 0) + limb('M' + pt(q(-16, -76)) + 'L' + pt(q(-16, -96)) + 'M' + pt(q(16, -76)) + 'L' + pt(q(16, -96)), wood, 2 * s) + limb('M' + pt(q(-17, -85)) + 'L' + pt(q(17, -85)), wood, 1.6 * s);
    o += body(c, pd([q(-24, -94), q(0, -108), q(24, -94), q(20, -91), q(0, -102), q(-20, -91)], true), '#d8c496', L('M' + pt(q(-12, -98)) + 'L' + pt(q(-10, -93)) + 'M' + pt(q(12, -98)) + 'L' + pt(q(10, -93)), dk('#d8c496', 0.3), 0.9 * s), 1.6 * s);
    o += flag(c, x + 1 * s, y - 106 * s, 18 * s, 0.55 * s, EXPL, '#e8dcc0', compassMark, true);
    return o;
  }
  // explorers' mark: a four-point compass star in a ring
  function compassMark(x, y, s) {
    return L(ellD(x, y, 5.4 * s, 5.4 * s), '#e8dcc0', 1.1 * s) + F(pd([[x, y - 8 * s], [x + 1.8 * s, y - 1.8 * s], [x + 8 * s, y], [x + 1.8 * s, y + 1.8 * s], [x, y + 8 * s], [x - 1.8 * s, y + 1.8 * s], [x - 8 * s, y], [x - 1.8 * s, y - 1.8 * s]], true), '#f4ecd4');
  }
  // prehistoric tree fern: a shaggy trunk and a crown of serrated arching fronds
  function frondD(T, tooth) {
    var A = [], B = [];
    for (var i = 0; i < T.s.length; i++) {
      var a = T.a[i], b = T.b[i], dx = a[0] - b[0], dy = a[1] - b[1], d = Math.sqrt(dx * dx + dy * dy) || 1, k = (i % 2 && i < T.s.length - 2) ? tooth : 0;
      A.push([a[0] + dx / d * k, a[1] + dy / d * k]); B.push([b[0] - dx / d * k, b[1] - dy / d * k]);
    }
    return pd(A.concat(B.reverse()), true);
  }
  function frond(c, p0, a, len, s, cc, droop) {
    var p1 = [p0[0] + Math.cos(a) * len * 0.5, p0[1] + Math.sin(a) * len * 0.5 - len * 0.2], p2 = [p0[0] + Math.cos(a) * len, p0[1] + Math.sin(a) * len * 0.3 + len * (droop == null ? 0.3 : droop)];
    var T = taper([p0, p1, p2], 11 * s, 1 * s, 9);
    return body(c, frondD(T, 2.6 * s), cc, F(ribbonBand(T, 0.55, 1), dk(cc, 0.22), 0.8), 1.2 * s) + L(along(T, 0.5), dk(cc, 0.35), 1 * s, 0.9);
  }
  function treeFern(c, x, y, s, lean, col, seed) {
    col = col || FERN; lean = lean || 0;
    var r = rng(seed || Math.round(x * 7 + y * 3)), h = 92 * s, tx = x + lean * s, ty = y - h, bark = '#5a3e2a';
    var T = taper([[x, y], [x + lean * 0.2 * s, y - h * 0.4], [x + lean * 0.7 * s, y - h * 0.8], [tx, ty]], 12 * s, 8 * s, 6);
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25), stubs = '';
    [-2.9, -2.2, -0.9, -0.2].forEach(function (a) { o += frond(c, [tx, ty], a + (r() - 0.5) * 0.2, (40 + r() * 8) * s, s, dk(col, 0.22), 0.5); });
    for (var i = 1; i < T.s.length - 1; i++) { var m = lerp2(T.a[i], T.b[i], i % 2 ? 0.3 : 0.7); stubs += 'M' + pt([m[0] - 2.4 * s, m[1] + 1 * s]) + 'L' + pt([m[0], m[1] - 3 * s]) + 'L' + pt([m[0] + 2.4 * s, m[1] + 1 * s]) + 'Z'; }
    o += body(c, T.d, bark, F(stubs, dk(bark, 0.4), 0.9) + F(ribbonBand(T, 0.6, 1), dk(bark, 0.3), 0.8), 1.6 * s);
    [-3.1, -2.55, -1.95, -1.25, -0.6, 0.05].forEach(function (a) { o += frond(c, [tx, ty], a + (r() - 0.5) * 0.2, (42 + r() * 10) * s, s, col); });
    o += L('M' + pt([tx, ty]) + 'q' + n(1 * s) + ',' + n(-8 * s) + ' ' + n(5 * s) + ',' + n(-9 * s) + 'q' + n(3 * s) + ',' + n(1 * s) + ' ' + n(1 * s) + ',' + n(3 * s), OL, 3.4 * s) + L('M' + pt([tx, ty]) + 'q' + n(1 * s) + ',' + n(-8 * s) + ' ' + n(5 * s) + ',' + n(-9 * s) + 'q' + n(3 * s) + ',' + n(1 * s) + ' ' + n(1 * s) + ',' + n(3 * s), lt(col, 0.2), 1.6 * s);
    return o;
  }
  // glowing crystal shards (Greenmaw power crystals)
  function shard(c, x, y, len, wd, ang, col) {
    var q = dirQ([x, y], ang), d = pd([q(0, -wd / 2), q(len * 0.78, -wd / 2), q(len, 0), q(len * 0.78, wd / 2), q(0, wd / 2)], true);
    return P(d, lt(col, 0.25), 0) + F(pd([q(0, 0), q(len, 0), q(len * 0.78, wd / 2), q(0, wd / 2)], true), dk(col, 0.22), 0.95) +
      L('M' + pt(q(len * 0.1, -wd * 0.24)) + 'L' + pt(q(len * 0.7, -wd * 0.24)), '#ffffff', Math.max(0.6, wd * 0.14), 0.8) + P(d, 'none', 1.3);
  }
  function crystals(c, x, y, s, col) {
    var o = C(x, y - 12 * s, 30 * s, glow(c, col, 0.6)) + E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.25);
    [[-0.6, 15, 5], [0.55, 13, 4.6], [-0.22, 27, 7.4], [0.22, 21, 6.2]].forEach(function (t) { o += shard(c, x + t[0] * 8 * s, y, t[1] * s, t[2] * s, -PI / 2 + t[0], col); });
    return o + rock(c, x - 9 * s, y + 1, 9 * s, 5 * s, '#6a5a50') + rock(c, x + 10 * s, y + 1, 8 * s, 4 * s, '#5e5048');
  }
  function steam(x, y, s, op, lean) {
    var r = rng(Math.round(x * 11 + y * 3)), o = '';
    lean = lean == null ? 1 : lean;
    for (var i = 0; i < 7; i++) { var t = i / 6; o += C(x + t * 14 * s * lean + (r() - 0.5) * 6 * s, y - t * 52 * s, (5 + t * 11) * s, '#f6faf4', 0, (op || 0.55) * (1 - t * 0.75)); }
    return o;
  }
  // hot spring: a travertine basin with a scalloped front lip, turquoise water, ripples and steam
  function hotPool(c, x, y, rx, ry, seed) {
    var r = rng(seed || 5), o = E(x, y + ry * 0.6 + 5, rx + 10, ry + 6, '#000', 0, 0.18), lip = 'M' + pt([x - rx - 6, y]);
    for (var i = 0; i <= 10; i++) { var t = i / 10, a = PI - t * PI, lx = x + Math.cos(a) * (rx + 6), ly = y + Math.sin(a) * (ry + 4); lip += 'L' + pt([lx, ly]) + (i % 2 ? 'l0,' + n(4 + r() * 5) + 'l2,' + n(-(4 + r() * 5)) : ''); }
    o += P(lip + 'L' + pt([x + rx + 6, y]) + 'Z', c.cel(dk(TRAV, 0.06)), 1.6) + F(lip + 'L' + pt([x + rx + 6, y]) + 'Z', '#d8964a', 0.25);
    o += E(x, y, rx + 6, ry + 4, c.cel(TRAV), 1.6) + E(x, y + 1, rx + 2, ry + 1.5, '#d89a52', 0, 0.55);
    o += E(x, y, rx, ry, c.lg([[0, '#1a7e8a'], [0.55, SPRING], [1, lt(SPRING, 0.35)]]), 1.3);
    var rp = '';
    for (var k = 0; k < 4; k++) { var px = x + (r() - 0.5) * rx * 1.2, py = y + (r() - 0.5) * ry * 0.9, w = rx * (0.12 + r() * 0.12); rp += 'M' + pt([px - w, py]) + 'q' + n(w) + ',' + n(-2) + ' ' + n(w * 2) + ',0'; }
    return o + E(x - rx * 0.3, y - ry * 0.35, rx * 0.35, ry * 0.2, '#eaffff', 0, 0.5) + L(rp, '#dffcff', 1, 0.8) + C(x + rx * 0.2, y + ry * 0.1, 1.6, '#eaffff', 0, 0.8) + C(x - rx * 0.4, y + ry * 0.2, 1.2, '#eaffff', 0, 0.8);
  }
  // black bubbling tar pit
  function tarPit(c, x, y, rx, ry, seed) {
    var r = rng(seed || 3), o = E(x, y + 2, rx + 8, ry + 4, '#4a3c2e', 0, 0.85) + E(x, y, rx, ry, c.lg([[0, '#0c090b'], [0.7, TAR], [1, '#2e282e']]), 1.8);
    o += L('M' + pt([x - rx * 0.62, y - ry * 0.3]) + 'Q' + pt([x - rx * 0.1, y - ry * 0.72]) + ' ' + pt([x + rx * 0.45, y - ry * 0.45]), '#a8a8c8', 1.5, 0.45);
    for (var i = 0; i < Math.max(3, Math.round(rx / 12)); i++) {
      var a = r() * PI * 2, d = Math.sqrt(r()) * 0.7, bx = x + Math.cos(a) * rx * d, by = y + Math.sin(a) * ry * d, br = 1.6 + r() * 3.4 * Math.min(1.4, rx / 40);
      o += (i % 3 === 2 ? L(ellD(bx, by, br * 1.9, br * 0.6), '#5a5464', 1, 0.8) : C(bx, by, br, c.cel('#302a32'), 1) + C(bx - br * 0.35, by - br * 0.35, br * 0.3, '#d8d8ec', 0, 0.75));
    }
    return o;
  }
  // bleached devilsaur-style skull half sunk in the ground, facing left
  function dinoSkull(c, x, y, s, col) {
    col = col || BONE; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 38 * s, 5 * s, '#000', 0, 0.25);
    var d = 'M' + pt(q(30, 0)) + 'C' + pt(q(33, -18)) + ' ' + pt(q(20, -32)) + ' ' + pt(q(4, -30)) + 'C' + pt(q(-10, -28)) + ' ' + pt(q(-26, -20)) + ' ' + pt(q(-36, -10)) + 'L' + pt(q(-38, -2)) + 'L' + pt(q(-32, 0)) + 'Z';
    o += body(c, d, col, F(pd([q(8, -36), q(36, -36), q(36, 4), q(14, 4)], true), dk(col, 0.22), 0.85) + L('M' + pt(q(-30, -12)) + 'C' + pt(q(-14, -22)) + ' ' + pt(q(4, -26)) + ' ' + pt(q(22, -24)), dk(col, 0.28), 1 * s), 2 * s);
    o += E(x + 8 * s, y - 17 * s, 6 * s, 7 * s, '#2a1e16', 1.4 * s) + P(pd([q(-16, -10), q(-4, -18), q(-2, -8)], true), '#2a1e16', 1.2 * s) + E(x - 27 * s, y - 11 * s, 2.6 * s, 2 * s, '#2a1e16', 1 * s);
    var th = '';
    for (var i = 0; i < 6; i++) th += pd([q(-33 + i * 5, -1.5), q(-31 + i * 5, 5), q(-29 + i * 5, -1.5)], true);
    o += P(th, c.cel(lt(col, 0.1)), 1 * s) + F(ellD(x, y + 1, 36 * s, 3 * s), '#5a4a30', 0.7);
    return o;
  }
  // arching ribs of some huge beast (x = middle, y = ground)
  function ribs(c, x, y, s, col, k) {
    col = col || BONE; k = k || 6; var o = E(x, y + 2, 60 * s, 5 * s, '#000', 0, 0.2);
    o += limb('M' + pt([x - 56 * s, y - 8 * s]) + 'Q' + pt([x, y - 26 * s]) + ' ' + pt([x + 56 * s, y - 6 * s]), col, 5 * s);
    for (var i = 0; i < k; i++) {
      var t = i / (k - 1), bx = x - 44 * s + t * 86 * s, by = y - 8 * s - Math.sin(t * PI) * 10 * s - 6 * s, h = (48 - Math.abs(t - 0.5) * 30) * s;
      o += limb('M' + pt([bx, by]) + 'C' + pt([bx - 14 * s, by - h * 0.2]) + ' ' + pt([bx - 22 * s, by - h * 0.7]) + ' ' + pt([bx - 9 * s, by - h]), i % 2 ? col : dk(col, 0.08), 3.8 * s);
    }
    return o;
  }
  // a big three-toed footprint pressed into the mud, seen in perspective
  function print(x, y, s, col, tilt) {
    col = col || '#56431f'; tilt = tilt || 0; var o = '', cl = '';
    [-0.62, 0, 0.62].forEach(function (t, i) {
      var a = -PI / 2 + t + tilt, len = 20 * s * (i === 1 ? 1.2 : 0.9), ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len * 0.5;
      var T = taper([[x, y], [(x + ex) / 2, (y + ey) / 2], [ex, ey]], 11 * s, 5 * s, 4);
      o += T.d; cl += pd([[ex - 2.2 * s, ey + 0.6 * s], [ex + Math.cos(a) * 6 * s, ey + Math.sin(a) * 3 * s], [ex + 2.2 * s, ey + 0.6 * s]], true);
    });
    o += ellD(x, y + 2 * s, 11 * s, 5 * s);
    return G(F(o + cl, lt(col, 0.5), 0.8), 'translate(0,' + n(-2 * s) + ')') + F(o + cl, col, 0.9) + F(ellD(x, y + 4 * s, 10 * s, 2 * s), dk(col, 0.4), 0.6);
  }
  // snapped tree trunk with a splintered top
  function snapped(c, x, y, s, col) {
    col = col || '#6a4a30';
    var d = 'M' + pt([x - 8 * s, y]) + 'L' + pt([x - 7 * s, y - 30 * s]) + 'L' + pt([x - 3 * s, y - 38 * s]) + 'L' + pt([x - 1 * s, y - 31 * s]) + 'L' + pt([x + 3 * s, y - 44 * s]) + 'L' + pt([x + 5 * s, y - 32 * s]) + 'L' + pt([x + 8 * s, y - 28 * s]) + 'L' + pt([x + 9 * s, y]) + 'Z';
    return E(x, y + 1, 13 * s, 3 * s, '#000', 0, 0.25) + body(c, d, col, F(pd([[x + 2 * s, y - 46 * s], [x + 12 * s, y - 46 * s], [x + 12 * s, y + 2], [x + 3 * s, y + 2]], true), dk(col, 0.3), 0.8) +
      L('M' + pt([x - 4 * s, y - 4 * s]) + 'L' + pt([x - 4 * s, y - 26 * s]) + 'M' + pt([x + 5 * s, y - 6 * s]) + 'L' + pt([x + 5 * s, y - 22 * s]), dk(col, 0.4), 1 * s) + F(pd([[x - 3 * s, y - 38 * s], [x - 1 * s, y - 31 * s], [x + 3 * s, y - 44 * s], [x + 2 * s, y - 30 * s], [x - 2 * s, y - 28 * s]], true), '#e8c890', 0.9), 1.6 * s);
  }
  // ---- Krizzik hive pieces ----
  function chitinSpire(c, x, y, s, bend, col) {
    col = col || HIVE; bend = bend || 0;
    var T = taper([[x, y], [x + bend * 0.15 * s, y - 32 * s], [x + bend * 0.55 * s, y - 64 * s], [x + bend * s, y - 90 * s]], 30 * s, 2 * s, 6), holes = '';
    for (var i = 0; i < 3; i++) { var m = lerp2(T.a[4 + i * 4] || T.a[4], T.b[4 + i * 4] || T.b[4], 0.45); holes += E(m[0], m[1], 3 * s * (1 - i * 0.2), 2 * s * (1 - i * 0.2), '#1a1020', 1 * s) + E(m[0], m[1] + 0.6 * s, 1.8 * s * (1 - i * 0.2), 1 * s, VENOM, 0, 0.9); }
    return E(x, y + 2, 20 * s, 4 * s, '#000', 0, 0.28) + body(c, T.d, col, L(bands(T, 2, 2), dk(col, 0.4), 1.3 * s) + F(ribbonBand(T, 0.6, 1), dk(col, 0.3), 0.85) + L(along(T, 0.22), lt(col, 0.3), 1.4 * s, 0.8), 1.8 * s) + holes;
  }
  // hive dome built of overlapping chitin plates with a glowing arched mouth
  function hiveDome(c, x, y, w, h, col) {
    col = col || HIVE; var o = E(x, y + 3, w * 0.6, 6, '#000', 0, 0.3), sc = '';
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.8]) + ' ' + pt([x - w * 0.2, y - h]) + ' ' + pt([x, y - h]) + 'C' + pt([x + w * 0.2, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.8]) + ' ' + pt([x + w / 2, y]) + 'Z';
    for (var row = 0; row < 5; row++) { var yy = y - h * (0.12 + row * 0.18), hw = w * 0.5 * Math.sqrt(Math.max(0, 1 - Math.pow((y - yy) / h, 2))); for (var xx = x - hw; xx < x + hw; xx += 16) sc += 'M' + pt([xx, yy]) + 'q8,7 16,0'; }
    o += body(c, d, col, L(sc, dk(col, 0.38), 1.3) + F(pd([[x + w * 0.1, y - h - 4], [x + w * 0.6, y - h - 4], [x + w * 0.6, y + 4], [x + w * 0.2, y + 4]], true), dk(col, 0.28), 0.85), 2);
    var ah = h * 0.46, aw = w * 0.2, ad = 'M' + pt([x - aw, y]) + 'C' + pt([x - aw, y - ah * 0.8]) + ' ' + pt([x - aw * 0.5, y - ah]) + ' ' + pt([x, y - ah]) + 'C' + pt([x + aw * 0.5, y - ah]) + ' ' + pt([x + aw, y - ah * 0.8]) + ' ' + pt([x + aw, y]) + 'Z';
    o += C(x, y - ah * 0.4, aw * 2.2, glow(c, VENOM, 0.45)) + P(ad, c.lg([[0, '#0e0814'], [0.7, '#2a3a1a'], [1, '#6a9a2a']]), 1.8);
    [[-0.34, 0.6], [0.3, 0.5], [0.05, 0.82]].forEach(function (t) { var hx = x + t[0] * w, hy = y - t[1] * h; o += E(hx, hy, 4, 3, '#1a1020', 1.1) + E(hx, hy + 1, 2.4, 1.3, VENOM, 0, 0.9); });
    return o + P('M' + pt([x - aw * 0.6, y - ah * 0.98]) + 'l2,0 l-0.6,10 q-0.8,2 -1.4,0Z M' + pt([x + aw * 0.5, y - ah * 0.92]) + 'l2,0 l-0.6,7 q-0.8,2 -1.4,0Z', VENOM, 0.8);
  }
  // cluster of glowing Krizzik egg pods
  function eggPods(c, x, y, s) {
    var o = C(x, y - 8 * s, 26 * s, glow(c, VENOM, 0.4)) + E(x, y + 1, 18 * s, 3.4 * s, '#000', 0, 0.25);
    [[-10, 7, 11], [9, 6, 10], [0, 8, 15], [-3, 5, 7], [14, 4, 6]].forEach(function (e, i) {
      var ex = x + e[0] * s, rx = e[1] * s, ry = e[2] * s, ey = y - ry * 0.9;
      o += E(ex, ey, rx, ry, c.lg([[0, '#f4ffc0'], [0.6, '#c8e86a'], [1, '#7a9a2a']]), 1.3 * s) + E(ex + rx * 0.1, ey + ry * 0.15, rx * 0.4, ry * 0.5, '#6a7a2a', 0, 0.55) + E(ex - rx * 0.35, ey - ry * 0.45, rx * 0.22, ry * 0.2, '#ffffff', 0, 0.7);
    });
    return o;
  }
  // ---- lava pieces ----
  function lavaRiver(c, pts, w0, w1) {
    var T = taper(pts, w0, w1, 6), r = rng(Math.round(pts[0][0] * 7 + pts[0][1])), cr = '';
    for (var i = 2; i < T.s.length - 2; i += 3) { var m = lerp2(T.a[i], T.b[i], 0.2 + r() * 0.6); cr += ellD(m[0], m[1], 2 + r() * 2.4, 1 + r()); }
    return L(along(T, 0.5), '#ff5a10', (w0 + w1) / 2 + 12, 0.22) + P(T.d, '#c8401a', 1.6) + F(ribbonBand(T, 0.14, 0.86), LAVA) + L(along(T, 0.5), LAVAY, Math.max(1.2, w1 * 0.4 + 1), 0.95) + F(cr, '#5a2a1a', 0.8);
  }
  function lavaPool(c, x, y, rx, ry) {
    return C(x, y, rx * 1.4, glow(c, '#ff6a1a', 0.5)) + E(x, y + 1.5, rx + 5, ry + 3, c.cel(BASALT), 1.6) + E(x, y, rx, ry, c.lg([[0, LAVAY], [0.5, '#ffa030'], [1, '#e8501a']]), 1.4) +
      L('M' + pt([x - rx * 0.6, y]) + 'q' + n(rx * 0.3) + ',-3 ' + n(rx * 0.6) + ',0 M' + pt([x + rx * 0.05, y + ry * 0.4]) + 'q' + n(rx * 0.2) + ',-2 ' + n(rx * 0.4) + ',0', '#fff4b0', 1.2, 0.9) + F(ellD(x + rx * 0.4, y - ry * 0.2, rx * 0.16, ry * 0.2) + ellD(x - rx * 0.2, y + ry * 0.3, rx * 0.12, ry * 0.16), '#6a2a14', 0.85);
  }
  function lavaCracks(seed, y0, y1, cnt) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), s = 0.6 + (y - y0) / (y1 - y0 || 1); d += 'M' + pt([x, y]) + 'l' + n(8 * s) + ',' + n(2 * s) + 'l' + n(6 * s) + ',' + n(-2 * s) + 'l' + n(9 * s) + ',' + n(1.5 * s) + 'M' + pt([x + 8 * s, y + 2 * s]) + 'l' + n(2 * s) + ',' + n(5 * s); }
    return L(d, '#ff5a10', 5, 0.25) + L(d, '#ff9a2a', 1.6) + L(d, LAVAY, 0.6, 0.9);
  }
  // ---- marsh pieces ----
  // giant closed flower bud on a tall stalk
  function giantBud(c, x, y, s, col, lean) {
    col = col || '#c8508a'; lean = lean || 0; var tx = x + lean * s, ty = y - 64 * s, o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt([x, y]) + 'C' + pt([x, y - 26 * s]) + ' ' + pt([tx - lean * 0.3 * s, ty + 24 * s]) + ' ' + pt([tx, ty + 6 * s]), '#4e8a36', 4.4 * s);
    o += bigLeaf(c, x, y, 0.6 * s, -PI / 2 - 1, '#4a8e3a') + bigLeaf(c, x, y, 0.55 * s, -PI / 2 + 0.9, '#3e7e32');
    var d = 'M' + pt([tx, ty + 8 * s]) + 'C' + pt([tx - 14 * s, ty + 4 * s]) + ' ' + pt([tx - 12 * s, ty - 14 * s]) + ' ' + pt([tx + 2 * s, ty - 26 * s]) + 'C' + pt([tx + 12 * s, ty - 14 * s]) + ' ' + pt([tx + 14 * s, ty + 4 * s]) + ' ' + pt([tx, ty + 8 * s]) + 'Z';
    o += body(c, d, col, L('M' + pt([tx + 1 * s, ty + 7 * s]) + 'Q' + pt([tx - 4 * s, ty - 8 * s]) + ' ' + pt([tx + 2 * s, ty - 24 * s]) + 'M' + pt([tx + 3 * s, ty + 6 * s]) + 'Q' + pt([tx + 10 * s, ty - 6 * s]) + ' ' + pt([tx + 3 * s, ty - 22 * s]), dk(col, 0.35), 1.1 * s) + F(pd([[tx + 3 * s, ty - 28 * s], [tx + 16 * s, ty - 28 * s], [tx + 16 * s, ty + 10 * s], [tx + 4 * s, ty + 10 * s]], true), dk(col, 0.25), 0.8), 1.6 * s);
    return o + P('M' + pt([tx - 9 * s, ty + 4 * s]) + 'Q' + pt([tx - 4 * s, ty + 12 * s]) + ' ' + pt([tx, ty + 8 * s]) + 'Q' + pt([tx + 4 * s, ty + 12 * s]) + ' ' + pt([tx + 9 * s, ty + 4 * s]) + 'Q' + pt([tx, ty + 6 * s]) + ' ' + pt([tx - 9 * s, ty + 4 * s]) + 'Z', c.cel('#5a9a3e'), 1.2 * s);
  }
  // pitcher plant: a striped tube with a lid
  function pitcher(c, x, y, s, col) {
    col = col || '#9ab83a'; var o = E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.22);
    var d = 'M' + pt([x - 5 * s, y]) + 'C' + pt([x - 12 * s, y - 10 * s]) + ' ' + pt([x - 11 * s, y - 30 * s]) + ' ' + pt([x - 8 * s, y - 40 * s]) + 'L' + pt([x + 8 * s, y - 40 * s]) + 'C' + pt([x + 9 * s, y - 28 * s]) + ' ' + pt([x + 10 * s, y - 10 * s]) + ' ' + pt([x + 5 * s, y]) + 'Z';
    o += body(c, d, col, L('M' + pt([x - 7 * s, y - 34 * s]) + 'Q' + pt([x - 8 * s, y - 16 * s]) + ' ' + pt([x - 3 * s, y - 3 * s]) + 'M' + pt([x, y - 38 * s]) + 'L' + pt([x, y - 2 * s]) + 'M' + pt([x + 6 * s, y - 34 * s]) + 'Q' + pt([x + 7 * s, y - 16 * s]) + ' ' + pt([x + 3 * s, y - 3 * s]), '#a8283a', 1.4 * s) + F(pd([[x + 2 * s, y - 42 * s], [x + 12 * s, y - 42 * s], [x + 12 * s, y + 2], [x + 3 * s, y + 2]], true), dk(col, 0.28), 0.8), 1.5 * s);
    o += E(x, y - 40 * s, 8.4 * s, 2.6 * s, c.cel('#c8384a'), 1.3 * s) + E(x, y - 39.6 * s, 6 * s, 1.5 * s, '#3a1018');
    return o + P('M' + pt([x + 2 * s, y - 42 * s]) + 'C' + pt([x + 4 * s, y - 52 * s]) + ' ' + pt([x + 16 * s, y - 54 * s]) + ' ' + pt([x + 14 * s, y - 44 * s]) + 'Z', c.cel(lt(col, 0.05)), 1.3 * s);
  }
  function lilyPad(c, x, y, r, flower) {
    var d = 'M' + pt([x, y]) + 'L' + pt([x + r * 0.9, y - r * 0.2]) + 'A' + n(r) + ',' + n(r * 0.4) + ' 0 1,1 ' + pt([x + r * 0.9, y + r * 0.12]) + 'Z';
    return P(d, c.cel('#4e9a3a'), 1.1) + (flower ? C(x - r * 0.2, y - r * 0.25, r * 0.3, '#f8a8c8', 0.9) + C(x - r * 0.2, y - r * 0.3, r * 0.12, '#ffe070') : '');
  }

  // ============================================================
  //  SCENES (400x240)
  // ============================================================
  var SCENES = {
    marshals_refuge: function (c) {
      var o = sky(c, '#86bcb2', '#e0dcae', '#f2c48c') + sun(c, 92, 42, 10, '#fff4d0') + cloud(170, 38, 0.8, 0.7) + cloud(60, 60, 0.55, 0.6);
      o += volcano(c, 70, 124, 130, 54, '#9a7e70', 0, 0.6, 2) + craterRim(c, 11, 130, 30, 52, '#b88a6c');
      o += farJungle(21, 152, '#5e8e5a', 16, 16, 30, 3, 0, 250) + haze(c, 140, 30, 0.35, '#ece6c8');
      o += cliffWall(c, 236, 178, '#a2603e', 31, true) + vines(c, 33, 5, 250, 400, 24, 70, '#4a8a2e');
      o += caveMouth(c, 322, 178, 64, 76);
      o += floor(c, 172, '#b8945e', '#7e6038', 5) + pebbles(8, 180, 236, '#8a6a40', 18);
      o += L('M150,240 C170,214 210,196 300,184', '#caa876', 16, 0.6) + L('M150,240 C170,214 210,196 300,184', '#d8ba88', 8, 0.5);
      o += lookout(c, 50, 182, 1);
      o += tent(c, 116, 184, 0.72, '#dccba0', EXPL) + tent(c, 196, 176, 0.58, '#cfbd92');
      o += flag(c, 264, 184, 64, 1, EXPL, '#e8dcc0', compassMark);
      o += crystals(c, 380, 186, 0.9, '#6aff9a') + crystals(c, 234, 190, 0.5, '#ff7a6a');
      o += crate(c, 284, 196, 0.9) + crate(c, 302, 198, 0.8, '#98683a') + crate(c, 292, 182, 0.7) + barrel(c, 350, 198, 0.9) + sack(c, 270, 202, 0.8);
      o += campfire(c, 168, 208, 0.8);
      o += treeFern(c, 8, 240, 1.25, 14, FERN, 3) + fern(c, 60, 240, 0.9, LEAF, 4) + leafClump(c, 396, 242, 0.9, LEAF, true);
      return o + vignette(c);
    },
    golakka_hot_springs: function (c) {
      var o = sky(c, '#78b6ae', '#cde0b0', '#eed8a2') + sun(c, 300, 40, 9, '#fffae0') + cloud(110, 36, 0.7, 0.65);
      o += volcano(c, 336, 120, 120, 50, '#8e766a', 0, 0.5, 2) + craterRim(c, 12, 124, 28, 56, '#a8826c');
      o += farJungle(22, 146, '#4e8a5a', 18, 18, 34, 2) + haze(c, 136, 28, 0.35, '#e8f0dc');
      o += treeFern(c, 40, 166, 0.72, -8, dk(FERN, 0.12), 5) + treeFern(c, 356, 162, 0.66, 10, dk(FERN, 0.12), 6) + treeFern(c, 250, 158, 0.5, 6, dk(FERN, 0.2), 7);
      o += floor(c, 160, '#5e9a44', '#34642c', 7);
      o += hotPool(c, 100, 174, 46, 10, 3) + hotPool(c, 342, 176, 30, 8, 4) + hotPool(c, 226, 190, 74, 15, 5);
      o += steam(96, 170, 0.8, 0.55, 0.6) + steam(340, 172, 0.6, 0.5, -0.6) + steam(206, 186, 1, 0.55, 0.8) + steam(252, 188, 0.9, 0.5, -0.5);
      o += crystals(c, 160, 178, 0.55, '#6ab8ff') + rock(c, 300, 196, 20, 11, STONE) + mossRock(c, 36, 196, 24, 12, STONE);
      o += tufts(c, [[150, 214, 0.9], [230, 224, 1], [310, 230, 1.1], [22, 226, 1]], MOSS);
      o += fern(c, 180, 238, 0.9, LEAF, 8) + leafClump(c, 4, 244, 1, LEAF) + leafClump(c, 398, 244, 0.95, dk(LEAF, 0.05), true) + mist(c, 172, 24, '#f4faf4', 0.28, 9);
      return o + vignette(c);
    },
    terror_run: function (c) {
      var o = sky(c, '#8ab4a0', '#dcd6a2', '#f0c890') + sun(c, 320, 46, 10, '#fff2c8') + cloud(220, 34, 0.9, 0.65);
      o += volcano(c, 96, 126, 150, 62, '#8e7266', 0, 0.8, 3) + craterRim(c, 13, 128, 30, 50, '#ae846a');
      o += farJungle(23, 150, '#577f4e', 18, 16, 32, 3) + haze(c, 138, 26, 0.3, '#ece6c8');
      o += treeFern(c, 330, 160, 0.6, 8, dk(FERN, 0.16), 9) + snapped(c, 262, 160, 0.7) + snapped(c, 140, 158, 0.55, '#5e4430');
      o += floor(c, 156, '#a8985a', '#6a5e34', 3) + pebbles(9, 166, 236, '#7a6c40', 16);
      o += ribs(c, 290, 172, 0.85) + dinoSkull(c, 96, 186, 1.05);
      o += print(166, 222, 1.1, 0, -0.5) + print(214, 204, 0.95, 0, -0.6) + print(252, 188, 0.8, 0, -0.7) + print(290, 176, 0.65, 0, -0.8) + print(330, 212, 1, 0, 0.3) + print(62, 234, 1.2, 0, 0.2);
      o += bone(200, 176, 18, 0.3, 1) + bone(56, 214, 22, -0.4, 1.2) + bone(370, 214, 16, 0.8, 1);
      o += treeFern(c, 0, 240, 1.3, 16, FERN, 10) + fern(c, 392, 240, 1.1, LEAF, 11) + tufts(c, [[120, 232, 1], [292, 236, 1.1]], MOSS);
      return o + vignette(c);
    },
    the_slithering_scar: function (c) {
      var o = sky(c, '#b8866a', '#e2ae74', '#d88a58') + sun(c, 210, 30, 8, '#fff0c0');
      o += craterRim(c, 14, 116, 20, 40, '#9a6660') + craterRim(c, 15, 140, 20, 44, '#8a5458');
      o += cliffWall(c, 92, 176, '#7a4648', 41) + cliffWall(c, 318, 176, '#744044', 42, true);
      o += floor(c, 164, '#a8785a', '#6a4638', 6) + pebbles(10, 172, 236, '#7a5040', 16);
      o += hiveDome(c, 206, 172, 150, 86);
      o += chitinSpire(c, 112, 180, 0.8, -12) + chitinSpire(c, 300, 178, 0.9, 16) + chitinSpire(c, 330, 186, 0.55, 22) + chitinSpire(c, 84, 190, 0.5, -18);
      o += eggPods(c, 150, 206, 0.9) + eggPods(c, 356, 212, 0.8) + E(250, 204, 18, 4, VENOM, 1, 0.8) + E(246, 203, 7, 1.4, '#f4ffc0', 0, 0.7);
      o += bone(60, 222, 20, 0.5, 1) + skull(c, 42, 214, 0.9);
      o += motes(12, 18, 60, 340, 110, 220, VENOM);
      return o + vignette(c, '#ffe0c0', '#2a1020');
    },
    fire_plume_ridge: function (c) {
      var o = sky(c, '#3a1c22', '#8a3a2c', '#e8783a');
      o += craterRim(c, 16, 150, 24, 44, '#5a3430');
      // the Fire Plume: a volcano with a column of fire and lava
      var vx = 220, vl = 150 - 104;
      o += C(vx, vl, 120, glow(c, '#ff6a1a', 0.5));
      o += F(taper([[vx, vl + 4], [vx - 4, vl - 20], [vx + 3, vl - 44], [vx - 2, vl - 60]], 22, 6, 6).d, '#e8501a', 0.9) + F(taper([[vx, vl + 4], [vx - 3, vl - 20], [vx + 2, vl - 40], [vx - 1, vl - 52]], 12, 3, 6).d, LAVAY, 0.95);
      o += flame(c, vx - 2, vl + 2, 2.6, '#ff5a1a', '#ffc040') + smoke(vx + 10, vl - 56, 2.2, '#3a2a2a', 0.55, 1.4);
      o += volcano(c, vx, 150, 300, 104, '#4a3634', 2, 0, 5);
      o += lavaRiver(c, [[208, 70], [196, 100], [170, 130], [150, 152]], 5, 12) + lavaRiver(c, [[236, 74], [252, 104], [280, 132], [300, 152]], 4, 10);
      o += floor(c, 162, '#4a3a36', '#221a1a', 13) + lavaCracks(17, 172, 236, 14);
      o += lavaRiver(c, [[-10, 180], [60, 186], [130, 186], [190, 180], [236, 172]], 8, 13) + lavaPool(c, 340, 186, 34, 8);
      o += rock(c, 90, 212, 30, 16, BASALT) + rock(c, 380, 220, 26, 14, dk(BASALT, 0.1)) + rock(c, 270, 186, 18, 9, BASALT);
      o += snapped(c, 30, 196, 0.8, '#2a2020') + snapped(c, 300, 176, 0.5, '#2a2020');
      o += motes(18, 26, 0, 400, 20, 230, '#ffb040');
      return o + vignette(c, '#ffd0a0', '#1a0808');
    },
    lakkari_tar_pits: function (c) {
      var o = sky(c, '#94a292', '#d6cc9e', '#e2b482') + sun(c, 90, 44, 9, '#fff2c8') + cloud(250, 40, 0.8, 0.55, '#e8e0d0');
      o += volcano(c, 300, 124, 150, 60, '#8a7064', 0, 1, 3) + craterRim(c, 17, 128, 26, 50, '#a8806a');
      o += farJungle(24, 150, '#607a50', 14, 12, 26, 2) + haze(c, 138, 26, 0.35, '#e8e0c8');
      o += floor(c, 156, '#a08e68', '#665640', 19) + pebbles(11, 166, 236, '#6a5a40', 14);
      o += tarPit(c, 82, 172, 50, 10, 4) + tarPit(c, 332, 168, 44, 9, 5) + tarPit(c, 204, 198, 112, 22, 6);
      o += G(ribs(c, 214, 196, 0.8, '#d8ccac'), '') + F(ellD(214, 199, 86, 8), TAR) + L('M140,196 Q214,190 290,196', '#8a8aa8', 1.2, 0.35);
      o += dinoSkull(c, 336, 170, 0.6, '#ccc0a0') + F(ellD(336, 172, 26, 3.6), TAR);
      o += deadTreeU(c, 36, 178, 0.9) + deadTreeU(c, 384, 172, 0.75);
      o += bone(140, 226, 20, 0.2, 1.1) + bone(300, 230, 18, -0.6, 1) + bone(40, 216, 16, 0.9, 1);
      o += tufts(c, [[120, 234, 1], [270, 236, 1], [370, 228, 0.9]], '#8a8a3a') + smoke(210, 186, 0.6, '#6a625a', 0.3, 0.5);
      return o + vignette(c);
    },
    the_marshlands: function (c) {
      var o = sky(c, '#86b6a6', '#c6dcb8', '#e0e2b0') + sun(c, 110, 44, 9, '#fffae0');
      o += craterRim(c, 18, 130, 26, 48, '#9a8a74') + farJungle(25, 150, '#4e7e5a', 20, 16, 34, 3) + haze(c, 140, 30, 0.45, '#e4f0e0');
      o += treeFern(c, 60, 158, 0.6, -6, dk(FERN, 0.2), 12) + treeFern(c, 300, 156, 0.62, 8, dk(FERN, 0.2), 13);
      o += floor(c, 158, '#5a7a44', '#3a5230', 21) + lake(c, 166, 204, '#6aa294', '#2e5e52', 7, 24);
      o += lilyPad(c, 120, 182, 9, true) + lilyPad(c, 180, 192, 7) + lilyPad(c, 270, 178, 8, true) + lilyPad(c, 330, 196, 10) + lilyPad(c, 60, 196, 7);
      o += giantBud(c, 30, 180, 1.35, '#c8508a', -4) + giantBud(c, 238, 172, 1.0, '#a860c8', 6) + giantBud(c, 150, 160, 0.6, '#d86a9a', -3) + pitcher(c, 356, 176, 1.2) + pitcher(c, 386, 180, 0.9, '#8aa83a') + leafClump(c, 290, 176, 0.8, LEAF, true);
      o += reeds(c, 150, 168, 1, REED, 3) + reeds(c, 316, 170, 0.9, REED, 4) + reeds(c, 96, 206, 1.1, REED, 5);
      o += body(c, 'M-4,204 C80,198 180,208 280,202 C330,198 380,204 404,200 L404,242 L-4,242 Z', '#5e7e46', R(-4, 196, 408, 50, c.lg([[0, '#8aa25a', 0.3], [1, '#2e4424', 0.9]])), 1.8);
      o += mist(c, 190, 26, '#f0f6ee', 0.4, 14) + tufts(c, [[140, 226, 1], [250, 232, 1.1], [330, 222, 1]], MOSS);
      o += leafClump(c, 2, 244, 1.1, LEAF) + fern(c, 396, 242, 1.1, FERN, 15) + mist(c, 150, 20, '#f0f6ee', 0.3, 16);
      return o + vignette(c);
    }
  };
  // bare, blackened tree over the tar
  function deadTreeU(c, x, y, s) {
    var col = '#4a3a30', o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'C' + pt([x - 2 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 34 * s]) + ' ' + pt([x + 1 * s, y - 50 * s]), col, 5 * s);
    o += limb('M' + pt([x + 1 * s, y - 30 * s]) + 'C' + pt([x - 8 * s, y - 36 * s]) + ' ' + pt([x - 14 * s, y - 44 * s]) + ' ' + pt([x - 20 * s, y - 56 * s]) + 'M' + pt([x + 2 * s, y - 40 * s]) + 'C' + pt([x + 10 * s, y - 44 * s]) + ' ' + pt([x + 16 * s, y - 52 * s]) + ' ' + pt([x + 18 * s, y - 62 * s]), col, 2.8 * s);
    o += limb('M' + pt([x - 12 * s, y - 44 * s]) + 'L' + pt([x - 6 * s, y - 56 * s]) + 'M' + pt([x + 12 * s, y - 50 * s]) + 'L' + pt([x + 22 * s, y - 52 * s]), col, 1.6 * s);
    return o + F(ellD(x, y - 1, 7 * s, 2.4 * s), TAR, 0.9);
  }

  // ============================================================
  //  MOB PIECES (all facing left, ground at y 122)
  // ============================================================
  // stout dinosaur leg with a round foot and toenails
  function stumpLeg(c, top, bot, w, col) {
    var o = limb('M' + pt(top) + 'L' + pt(bot), col, w), fx = bot[0], fy = bot[1] + 1;
    o += P('M' + pt([fx - w * 0.72, fy + 1]) + 'C' + pt([fx - w * 0.78, fy - 6]) + ' ' + pt([fx + w * 0.7, fy - 6]) + ' ' + pt([fx + w * 0.62, fy + 1]) + 'Z', c.cel(dk(col, 0.08)), 2);
    for (var i = 0; i < 3; i++) o += E(fx - w * 0.5 + i * w * 0.34, fy - 0.6, 1.8, 1.4, '#f0e6cc', 0.9);
    return o;
  }
  // thorned vine whip along a list of points
  function vineWhip(c, pts, w0, col) {
    var T = taper(pts, w0, 1.2, 6), th = '';
    for (var i = 2; i < T.s.length - 1; i += 3) { var a = T.a[i], b = T.b[i], dx = a[0] - b[0], dy = a[1] - b[1], d = Math.sqrt(dx * dx + dy * dy) || 1; th += pd([lerp2(a, T.s[i], 0.2), [a[0] + dx / d * 4, a[1] + dy / d * 4], lerp2(a, T.s[Math.min(i + 1, T.s.length - 1)], 0.1)], true); }
    return P(th, c.cel('#e8d8a0'), 1) + body(c, T.d, col, F(ribbonBand(T, 0.55, 1), dk(col, 0.25), 0.8) + L(along(T, 0.25), lt(col, 0.3), 1, 0.7), 1.8);
  }
  // radial flower head with a toothed maw (x, y = centre)
  function flowerHead(c, x, y, r, petal, tip) {
    var o = '', k = 7;
    for (var i = 0; i < k; i++) {
      var a = -PI / 2 + i * PI * 2 / k + 0.2, q = dirQ([x, y], a), d = 'M' + pt(q(r * 0.3, -r * 0.2)) + 'C' + pt(q(r * 0.7, -r * 0.55)) + ' ' + pt(q(r * 1.15, -r * 0.35)) + ' ' + pt(q(r * 1.25, 0)) + 'C' + pt(q(r * 1.15, r * 0.35)) + ' ' + pt(q(r * 0.7, r * 0.55)) + ' ' + pt(q(r * 0.3, r * 0.2)) + 'Z';
      o += body(c, d, i % 2 ? petal : dk(petal, 0.1), F(pd([q(r * 0.95, -r), q(r * 1.4, -r), q(r * 1.4, r), q(r * 0.95, r)], true), tip, 0.9) + L('M' + pt(q(r * 0.4, 0)) + 'L' + pt(q(r * 1.05, 0)), dk(petal, 0.35), 1), 1.6);
    }
    o += C(x, y, r * 0.52, c.cel('#e8c040'), 1.8) + C(x, y, r * 0.34, '#4a0e18', 1.4);
    var th = '';
    for (var j = 0; j < 8; j++) { var b = j * PI / 4, p0 = [x + Math.cos(b) * r * 0.34, y + Math.sin(b) * r * 0.34], p1 = [x + Math.cos(b + 0.2) * r * 0.16, y + Math.sin(b + 0.2) * r * 0.16], p2 = [x + Math.cos(b + 0.4) * r * 0.34, y + Math.sin(b + 0.4) * r * 0.34]; th += pd([p0, p1, p2], true); }
    return o + F(th, '#fff6e0') + C(x - r * 0.1, y - r * 0.1, r * 0.08, '#c83a4a');
  }
  // Krizzik insect pieces
  var GOR = '#5e4a9a', GORD = '#2e2250', GORL = '#9a86d0';
  function bugLeg(c, pts, col, w) { var e = pts[pts.length - 1]; return limb(pd(pts), col, w || 2.6) + L('M' + pt(e) + 'l-3,1', OL, 2); }
  function bugEye(c, x, y, rx, ry) { return C(x, y, rx * 3, glow(c, VENOM, 0.6)) + E(x, y, rx, ry, c.lg([[0, '#f4ffb0'], [0.5, VENOM], [1, '#4a8a1a']]), 1.4) + C(x - rx * 0.3, y - ry * 0.35, rx * 0.25, '#ffffff', 0, 0.9); }
  function mandibles(c, x, y, s, col) {
    return P('M' + pt([x + 2 * s, y - 2 * s]) + 'C' + pt([x - 8 * s, y - 4 * s]) + ' ' + pt([x - 14 * s, y + 2 * s]) + ' ' + pt([x - 12 * s, y + 8 * s]) + 'L' + pt([x - 9 * s, y + 4 * s]) + 'L' + pt([x - 7 * s, y + 6 * s]) + 'C' + pt([x - 7 * s, y + 2 * s]) + ' ' + pt([x - 2 * s, y + 1 * s]) + ' ' + pt([x + 2 * s, y + 2 * s]) + 'Z', c.cel(col), 1.5) +
      P('M' + pt([x + 3 * s, y + 3 * s]) + 'C' + pt([x - 4 * s, y + 6 * s]) + ' ' + pt([x - 6 * s, y + 13 * s]) + ' ' + pt([x - 2 * s, y + 17 * s]) + 'L' + pt([x - 1 * s, y + 12 * s]) + 'L' + pt([x + 2 * s, y + 13 * s]) + 'C' + pt([x + 1 * s, y + 9 * s]) + ' ' + pt([x + 3 * s, y + 7 * s]) + ' ' + pt([x + 6 * s, y + 6 * s]) + 'Z', c.cel(dk(col, 0.12)), 1.4);
  }
  // scythe forearm from an elbow along ang
  function scythe(c, p, ang, len, col, blade) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(0, 0)) + 'L' + pt(q(len * 0.5, 0)), col, 5);
    var d = 'M' + pt(q(len * 0.45, -3)) + 'C' + pt(q(len * 0.8, -6)) + ' ' + pt(q(len * 1.05, -2)) + ' ' + pt(q(len * 1.2, 8)) + 'C' + pt(q(len * 0.95, 3)) + ' ' + pt(q(len * 0.75, 3)) + ' ' + pt(q(len * 0.45, 4)) + 'Z';
    return o + body(c, d, blade, F(pd([q(len * 0.45, 1), q(len * 1.3, 1), q(len * 1.3, 10), q(len * 0.45, 10)], true), dk(blade, 0.3), 0.85), 1.6) + L('M' + pt(q(len * 0.55, -3)) + 'C' + pt(q(len * 0.85, -5)) + ' ' + pt(q(len * 1.02, -1)) + ' ' + pt(q(len * 1.12, 5)), '#ffffff', 0.9, 0.6);
  }
  // silithid warrior rig: insect abdomen and legs behind, reared torso, scythe arms, head (o: col, dcol, blade, crest, scale)
  function gorishiWarrior(c, o) {
    var col = o.col, dcol = o.dcol, bl = o.blade, s = shadow(c, 66, o.shadowR || 38);
    // far legs + far scythe
    s += bugLeg(c, [[84, 90], [102, 96], [110, 121]], dk(dcol, 0.1), 3.4) + bugLeg(c, [[72, 92], [80, 104], [78, 121]], dk(dcol, 0.1), 3.4);
    s += limb('M58,56 L66,40', dk(col, 0.25), 5) + scythe(c, [66, 40], -PI / 2 - 0.55, 30, dk(col, 0.25), dk(bl, 0.15));
    if (o.wings) s += G(P('M74,58 C86,40 106,36 114,46 C106,58 90,66 78,68 Z', o.wings, 1.4) + L('M78,64 C90,54 102,48 110,46', dk(o.wings, 0.3), 0.9), '', 0.85);
    // abdomen
    var A = taper([[70, 80], [90, 76], [108, 80], [118, 92], [114, 104]], 32, 10, 6);
    s += body(c, A.d, col, L(bands(A, 4, 4), dcol, 2.6) + F(ribbonBand(A, 0.55, 1), dk(col, 0.3), 0.85) + L(along(A, 0.18), lt(col, 0.3), 1.4, 0.8) + (o.abdMark ? o.abdMark(A) : ''), 2.2);
    // near legs
    s += bugLeg(c, [[66, 92], [58, 104], [60, 121]], col, 3.8) + bugLeg(c, [[80, 94], [90, 106], [92, 121]], col, 3.8);
    // reared thorax
    var Tx = taper([[70, 88], [62, 72], [56, 56], [52, 46]], 26, 16, 6);
    s += body(c, Tx.d, col, L(bands(Tx, 4, 3), dcol, 2) + F(ribbonBand(Tx, 0.6, 1), dk(col, 0.3), 0.85), 2.2);
    s += P('M60,60 L66,52 L64,64 Z M64,72 L72,66 L68,76 Z', c.cel(o.spike || lt(col, 0.2)), 1.2);
    if (o.back) s += o.back(c);
    // head
    s += limb('M40,34 C36,24 30,18 20,18', dcol, 1.6) + limb('M46,32 C46,22 42,14 32,10', dcol, 1.6);
    s += body(c, ellD(42, 44, 13, 11), col, F('M44,32 L58,32 L58,58 L46,58 Z', dk(col, 0.3), 0.8), 2.2);
    if (o.crest) s += o.crest(c);
    s += bugEye(c, 37, 41, 5, 4.4) + mandibles(c, 32, 50, 1, dk(bl, 0.05));
    // near scythe
    s += limb('M52,60 L40,70', col, 6) + scythe(c, [40, 70], -PI / 2 - 1.0, 36, col, bl);
    if (o.lowArms) s += limb('M60,76 L48,86', dk(col, 0.1), 4.4) + scythe(c, [48, 86], -PI - 0.25, 24, dk(col, 0.1), dk(bl, 0.1));
    return G(s, at(o.scale || 1, 64, 122));
  }
  // flame shape: several tongues rising from a base (x = centre, y = base, w, h)
  function flameBody(x, y, w, h, seed, k) {
    var r = rng(seed), d = 'M' + pt([x - w / 2, y]), n0 = k || 5;
    for (var i = 0; i < n0; i++) {
      var t0 = i / n0, t1 = (i + 0.5) / n0, t2 = (i + 1) / n0, hh = h * (0.55 + 0.45 * Math.sin(t1 * PI)) * (0.8 + r() * 0.3);
      var xa = x - w / 2 + w * t1, xb = x - w / 2 + w * t2;
      d += 'Q' + pt([x - w / 2 + w * t0 - 2, y - hh * 0.6]) + ' ' + pt([xa - w * 0.06, y - hh]) + 'Q' + pt([xa + w * 0.02, y - hh * 0.55]) + ' ' + pt([xb, y - h * 0.3 * (0.6 + r() * 0.5) * (i < n0 - 1 ? 1 : 0)]);
    }
    return d + 'L' + pt([x + w / 2, y]) + 'Q' + pt([x, y + h * 0.12]) + ' ' + pt([x - w / 2, y]) + 'Z';
  }
  // tar dribble hanging from a point
  function drip(x, y, len, w) { return 'M' + pt([x - w, y]) + 'L' + pt([x + w, y]) + 'L' + pt([x + w * 0.6, y + len]) + 'Q' + pt([x, y + len + w * 1.8]) + ' ' + pt([x - w * 0.6, y + len]) + 'Z'; }

  // ============================================================
  //  MOBS (128x128)
  // ============================================================
  var MOBS = {
    bloodpetal_lasher: function (c) {
      var g = '#5a9e3a', s = shadow(c, 66, 30);
      s += vineWhip(c, [[76, 80], [96, 66], [108, 46], [100, 30], [90, 34]], 6, dk(g, 0.15));
      // root legs
      [['M70,92 C78,100 84,108 90,121', dk(g, 0.3)], ['M58,94 C56,104 50,112 44,121', dk(g, 0.25)], ['M64,96 C66,106 66,114 68,121', g], ['M74,94 C84,102 96,110 104,120', g]].forEach(function (l) { s += limb(l[0], '#7a6a34', 4.6); });
      s += body(c, ellD(66, 84, 18, 15), g, F('M50,90 C60,100 76,100 84,88 L86,102 L48,102 Z', dk(g, 0.3), 0.8) + E(60, 78, 6, 3, lt(g, 0.3), 0, 0.6), 2.2);
      s += bigLeaf(c, 56, 86, 0.36, PI + 0.5, dk(g, 0.05)) + bigLeaf(c, 76, 86, 0.34, -0.4, g);
      s += limb('M62,72 C60,60 54,52 46,46', g, 7);
      s += flowerHead(c, 42, 38, 20, '#d8284a', '#ff8aa0');
      s += vineWhip(c, [[56, 80], [40, 82], [24, 74], [14, 62], [16, 52]], 7, g);
      return G(s, at(1.06, 64, 122));
    },
    ungoro_thunderer: function (c) {
      var col = '#6e8e48', bel = '#cfc486', pl = '#d8602a', s = shadow(c, 66, 50);
      s += stumpLeg(c, [84, 88], [92, 118], 11, dk(col, 0.25)) + stumpLeg(c, [42, 90], [48, 118], 10, dk(col, 0.25));
      // far plates
      [[42, 58, 9], [60, 48, 12], [80, 48, 12], [98, 56, 9]].forEach(function (p) { s += P(pd([[p[0] - p[2] * 0.7, p[1] + 6], [p[0] - p[2] * 0.5, p[1] - p[2] * 0.6], [p[0] + 3, p[1] - p[2] * 1.3], [p[0] + p[2] * 0.7, p[1] - p[2] * 0.3], [p[0] + p[2] * 0.6, p[1] + 6]], true), c.cel(dk(pl, 0.25)), 1.6); });
      // tail with spikes
      var Tl = taper([[96, 76], [110, 72], [120, 62], [124, 50]], 20, 5, 6);
      [[114, 60, -1.9], [118, 54, -1.2], [122, 50, -2.4], [125, 46, -0.8]].forEach(function (k) { var q = dirQ([k[0], k[1]], k[2]); s += P(pd([q(0, -2.6), q(15, 0), q(0, 2.6)], true), c.cel('#ece2c4'), 1.3); });
      s += body(c, Tl.d, col, F(ribbonBand(Tl, 0.55, 1), bel, 0.9), 2);
      // body
      var bd = 'M30,80 C32,62 52,52 72,52 C92,52 106,64 104,82 C100,98 80,102 62,100 C46,100 32,94 30,80 Z';
      s += body(c, bd, col, F('M28,86 C44,100 80,104 108,86 L108,108 L28,108 Z', bel, 0.95) + L('M44,64 L48,74 M58,58 L60,70 M74,56 L74,68 M88,60 L86,72', dk(col, 0.3), 3) + F('M76,48 L112,48 L112,98 L88,100 C100,86 96,64 76,48 Z', dk(col, 0.22), 0.7), 2.4);
      // near plates
      [[36, 64, 9], [52, 54, 13], [70, 50, 15], [88, 52, 13], [102, 62, 9]].forEach(function (p, i) { s += body(c, pd([[p[0] - p[2] * 0.7, p[1] + 6], [p[0] - p[2] * 0.5, p[1] - p[2] * 0.6], [p[0] + 3, p[1] - p[2] * 1.3], [p[0] + p[2] * 0.7, p[1] - p[2] * 0.3], [p[0] + p[2] * 0.6, p[1] + 6]], true), i % 2 ? pl : lt(pl, 0.06), L('M' + pt([p[0] - p[2] * 0.3, p[1] + 4]) + 'L' + pt([p[0] + 2, p[1] - p[2] * 0.9]), '#f4a040', 1.4), 1.8); });
      // neck + small head low at the left
      s += body(c, 'M40,76 C30,78 24,84 20,90 L30,98 C36,92 42,88 48,86 Z', col, F('M20,92 L30,98 L40,90 Z', bel, 0.9), 2);
      s += body(c, 'M26,84 C18,82 8,86 6,94 C6,99 12,101 20,100 C26,100 32,96 32,90 Z', col, F('M6,96 C12,100 22,100 30,96 L30,104 L4,104 Z', bel, 0.9) + L('M8,97 L20,97', OL, 1.2), 2);
      s += E(18, 89, 2, 1.8, '#ffe070', 1) + C(18, 89, 0.8, OL) + E(8, 91, 0.9, 0.7, OL);
      s += stumpLeg(c, [48, 90], [42, 118], 12, col) + stumpLeg(c, [90, 90], [84, 118], 13, col);
      return G(s, at(1, 64, 122));
    },
    ungoro_stomper: function (c) {
      var col = '#9a8458', bel = '#d8c89a', fr = '#c84a32', s = shadow(c, 66, 50);
      s += stumpLeg(c, [88, 90], [96, 118], 12, dk(col, 0.25)) + stumpLeg(c, [52, 92], [58, 118], 11, dk(col, 0.25));
      var Tl = taper([[100, 78], [114, 80], [124, 90]], 18, 4, 5);
      s += body(c, Tl.d, col, F(ribbonBand(Tl, 0.55, 1), bel, 0.9), 2);
      var bd = 'M40,78 C40,58 62,48 84,52 C104,56 114,70 110,86 C106,100 86,104 66,102 C50,100 40,92 40,78 Z';
      s += body(c, bd, col, F('M38,88 C54,104 90,106 114,88 L114,110 L38,110 Z', bel, 0.95) + F('M84,48 L120,48 L120,100 L96,102 C108,86 104,64 84,48 Z', dk(col, 0.22), 0.7) + C(70, 64, 2.4, dk(col, 0.25)) + C(82, 60, 2, dk(col, 0.25)) + C(94, 66, 2.2, dk(col, 0.25)), 2.4);
      // frill
      var fd = '', k = 9;
      for (var i = 0; i <= k; i++) { var a = -PI * 0.95 + i * PI * 0.9 / k, rr = i % 2 ? 26 : 30; fd += (i ? 'L' : 'M') + pt([44 + Math.cos(a) * rr, 70 + Math.sin(a) * rr]); }
      fd += 'L50,84 L34,84 Z';
      s += body(c, fd, fr, E(44, 58, 16, 10, '#f0d8a0', 0, 0.35) + C(30, 52, 3, '#f4e4b8') + C(42, 46, 3.2, '#f4e4b8') + C(56, 48, 3, '#f4e4b8') + C(64, 58, 2.6, '#f4e4b8') + F('M52,40 L78,40 L78,86 L54,86 Z', dk(fr, 0.25), 0.7), 2.2);
      for (var j = 0; j <= k; j += 2) { var b = -PI * 0.95 + j * PI * 0.9 / k; s += P(pd([[44 + Math.cos(b) * 27, 70 + Math.sin(b) * 27], [44 + Math.cos(b) * 35, 70 + Math.sin(b) * 35], [44 + Math.cos(b + 0.08) * 28, 70 + Math.sin(b + 0.08) * 28]], true), c.cel('#ece2c4'), 1.1); }
      // head: beak face low-left
      var hs = body(c, 'M46,72 C36,68 24,72 16,80 L6,92 C4,96 8,100 12,99 L22,98 C30,100 42,98 48,90 Z', col, F('M8,96 C18,100 34,100 46,92 L46,104 L6,104 Z', bel, 0.9) + L('M12,94 L24,93', OL, 1.2), 2.4);
      hs += P('M12,90 L4,93 L10,99 Z', c.cel('#4a3a2a'), 1.4);
      // horns
      hs += body(c, 'M30,72 C24,62 14,54 2,50 C10,58 18,66 24,76 Z', '#ece2c4', F('M2,50 C12,58 18,66 24,76 L28,74 Z', dk(BONE, 0.2), 0.7), 1.6);
      hs += body(c, 'M38,70 C34,60 28,52 20,46 C24,56 28,64 32,74 Z', dk('#ece2c4', 0.08), '', 1.5);
      hs += P('M16,82 L10,70 L22,80 Z', c.cel('#ece2c4'), 1.4);
      hs += E(30, 80, 2.2, 1.9, '#ffe070', 1) + C(30, 80, 0.9, OL) + L('M26,76 L34,78', OL, 1.6);
      s += G(hs, at(1.2, 12, 96));
      s += stumpLeg(c, [56, 92], [50, 118], 13, col) + stumpLeg(c, [94, 92], [88, 118], 14, col);
      return G(s, at(1, 64, 122));
    },
    frenzied_pterrordax: function (c) {
      var col = '#c8683a', mem = '#e8a060', s = E(62, 121, 22, 4, '#000', 0, 0.22);
      // far wing
      s += body(c, 'M70,56 C80,40 96,24 122,14 C118,26 116,38 112,50 C104,48 96,52 90,60 C84,58 76,60 70,62 Z', dk(mem, 0.15), L('M76,56 C88,42 102,30 120,16', OL, 3) + L('M90,58 C96,46 104,36 116,26', dk(mem, 0.35), 1), 2);
      // tail + legs
      s += limb('M86,70 L108,78', col, 3.4) + P('M106,76 L114,74 L112,82 Z', c.cel(dk(col, 0.1)), 1.2);
      s += limb('M78,74 L84,90 L80,96', dk(col, 0.1), 3.4) + limb('M70,76 L72,92 L66,98', col, 3.6) + L('M80,96 l-4,2 M80,96 l-2,4 M66,98 l-4,1 M66,98 l-1,4', OL, 1.6);
      // body
      s += body(c, ellD(70, 66, 18, 11), col, F('M54,70 C62,80 80,80 88,68 L90,82 L52,82 Z', lt(mem, 0.2), 0.9) + F('M74,52 L92,52 L92,80 L80,80 C86,70 84,60 74,52 Z', dk(col, 0.25), 0.7), 2.2);
      // near wing, big and spread up-left
      var wd = 'M62,60 C52,40 36,22 8,10 C12,24 14,36 20,48 C28,50 36,56 40,64 C46,62 56,64 62,68 Z';
      s += body(c, wd, mem, L('M24,48 C30,36 34,26 30,18 M40,62 C46,48 48,36 44,26', dk(mem, 0.3), 1.1) + F('M8,10 L40,30 L62,62 L62,70 L40,66 C34,58 26,52 20,48 Z', dk(mem, 0.14), 0.6), 2);
      s += L('M60,60 C50,40 34,22 8,10', OL, 4.2) + L('M60,60 C50,40 34,22 8,10', col, 2.2) + L('M20,20 l-3,-4 M22,22 l-5,-1', OL, 1.6);
      // neck + head with open beak and back crest
      s += limb('M56,62 C48,58 42,54 36,54', col, 7);
      s += P('M36,48 C44,40 54,34 66,32 C58,40 52,46 44,52 Z', c.cel('#b82a1e'), 1.6);
      s += body(c, 'M44,50 C38,46 30,46 24,50 L4,54 L24,56 C30,60 40,60 44,56 Z', col, F('M24,56 L44,56 L44,60 L24,60 Z', lt(mem, 0.1), 0.8), 2);
      s += P('M26,57 L6,62 C10,64 20,64 28,62 Z', c.cel(dk(col, 0.1)), 1.6) + P('M24,56 L8,56 L26,58 Z', '#5a1a14', 0.8) + P('M12,55.4 L13,57.6 L14,55.6 Z M18,55.8 L19,58 L20,56 Z', '#fff', 0.5);
      s += E(34, 51, 2.4, 2, '#ff4a2a', 1) + C(33.6, 51, 0.9, OL) + L('M29,48 L38,49', OL, 1.8);
      return G(s, at(1, 64, 122));
    },
    gorishi_wasp: function (c) {
      var col = GOR, dcol = GORD, wing = '#d6f2c0', s = shadow(c, 62, 22);
      s += G(P('M66,50 C70,24 90,6 112,8 C114,24 98,42 72,56 Z', wing, 1.4), '', 0.5) + L('M70,52 C82,34 96,18 108,12', dk(wing, 0.45), 0.9, 0.7);
      // abdomen held back and up, stinger drops down
      var A = taper([[72, 64], [90, 58], [106, 60], [116, 70], [118, 84]], 26, 5, 6);
      s += body(c, A.d, col, L(bands(A, 4, 4), VENOM, 2.4) + F(ribbonBand(A, 0.55, 1), dk(col, 0.3), 0.85) + L(along(A, 0.2), lt(col, 0.35), 1.4, 0.8), 2.2);
      var e = A.s[A.s.length - 1];
      s += P(pd([[e[0] - 3, e[1] - 1], [e[0] - 1, e[1] + 14], [e[0] + 3, e[1] - 1]], true), c.cel('#2a1a3a'), 1.5) + C(e[0] - 1, e[1] + 15, 2.4, glow(c, VENOM, 0.8)) + C(e[0] - 1, e[1] + 15, 1.1, VENOM);
      // dangling legs
      s += bugLeg(c, [[58, 72], [52, 88], [56, 102]], dk(dcol, 0.05), 2.3) + bugLeg(c, [[66, 74], [70, 90], [66, 104]], dk(dcol, 0.05), 2.3);
      s += body(c, ellD(62, 64, 14, 11), col, F('M52,68 C60,78 72,76 76,66 L78,80 L50,80 Z', dk(col, 0.3), 0.8) + L('M50,58 Q62,52 74,58', GORL, 1.8), 2.2);
      s += bugLeg(c, [[54, 72], [44, 84], [42, 98]], GORL, 2.4) + bugLeg(c, [[62, 74], [60, 90], [52, 102]], GORL, 2.4) + bugLeg(c, [[70, 72], [80, 86], [82, 100]], GORL, 2.4);
      // near wings
      s += G(P('M62,50 C56,20 66,0 82,0 C92,12 82,34 66,56 Z', wing, 1.5) + P('M68,54 C78,34 96,26 110,30 C104,44 86,54 70,58 Z', wing, 1.3), '', 0.7) + L('M64,52 C66,32 72,16 80,4 M66,40 L76,32 M72,54 C86,42 98,36 106,32', dk(wing, 0.45), 0.9, 0.8);
      // head
      s += limb('M36,46 C30,34 24,28 16,26', dcol, 1.6) + limb('M42,44 C40,32 38,24 30,16', dcol, 1.6);
      s += body(c, ellD(40, 58, 12, 10), col, F('M42,46 L54,46 L54,70 L44,70 Z', dk(col, 0.3), 0.8), 2.2);
      s += bugEye(c, 36, 55, 5.2, 4.6) + mandibles(c, 31, 62, 0.75, '#e8e0c0');
      return G(s, at(1, 64, 122));
    },
    gorishi_reaver: function (c) {
      return gorishiWarrior(c, { col: GOR, dcol: GORD, blade: '#e2dcf0', spike: GORL, lowArms: true, scale: 1.02,
        abdMark: function (A) { return L(along(A, 0.5), VENOM, 1.6, 0.8); },
        crest: function (c) { return P('M46,34 L54,20 L56,34 Z M52,38 L64,28 L60,42 Z', c.cel(GORL), 1.4); } });
    },
    rex_ashil: function (c) {
      var RED = '#c8283a';
      return gorishiWarrior(c, { col: '#3e2c62', dcol: '#1a1230', blade: '#f0d890', spike: '#e8c050', lowArms: true, scale: 1.08, shadowR: 44, wings: '#cdb8ec',
        abdMark: function (A) { return F(ribbonBand(A, 0.1, 0.34), RED, 0.9) + L(bands(A, 4, 4), '#e8c050', 1.2); },
        back: function (c) { return P('M56,56 C50,44 58,34 70,36 C74,46 70,56 62,62 Z', c.cel(RED), 1.6) + P('M64,70 C62,60 72,54 80,58 C82,66 76,72 70,74 Z', c.cel(dk(RED, 0.1)), 1.5); },
        crest: function (c) {
          var o = '';
          [[40, 34, -2.3, 16], [46, 32, -1.9, 22], [52, 34, -1.45, 20], [56, 40, -1.0, 15]].forEach(function (k) { var q = dirQ([k[0], k[1]], k[2]); o += P(pd([q(0, -3.6), q(k[3], 0), q(0, 3.6)], true), c.cel(k[3] > 18 ? '#e8c050' : RED), 1.4); });
          return o + C(46, 36, 2.6, c.cel(RED), 1);
        } });
    },
    fire_plume_elemental: function (c) {
      var s = C(62, 70, 58, glow(c, '#ff7a1a', 0.45)) + E(62, 122, 26, 5, '#ff7a1a', 0, 0.35) + shadow(c, 62, 22);
      // far arm
      s += F(taper([[76, 58], [90, 54], [98, 42], [96, 32]], 11, 3, 5).d, '#c8401a') ;
      // body: a tail of flame twisting down to the ground, a torso of tongues on top
      var Tl = taper([[60, 76], [70, 92], [60, 106], [66, 120]], 34, 6, 6);
      s += P(Tl.d, '#e8481a', 2.2) + F(ribbonBand(Tl, 0.2, 0.8), '#ff9a2a') + L(along(Tl, 0.5), '#ffe070', 3, 0.9);
      s += P(flameBody(60, 84, 58, 76, 3, 6), '#e8481a', 2.2) + F(flameBody(60, 82, 42, 62, 5, 5), '#ff9a2a') + F(flameBody(58, 80, 24, 42, 7, 4), '#ffe070');
      s += F(ellD(58, 58, 11, 12), '#fff6c0', 0.85);
      // rock bits orbiting
      [[26, 76, 5], [100, 84, 4], [92, 22, 3.6], [34, 36, 3]].forEach(function (b) { s += P(pd([[b[0] - b[2], b[1]], [b[0] - b[2] * 0.4, b[1] - b[2]], [b[0] + b[2], b[1] - b[2] * 0.6], [b[0] + b[2] * 0.8, b[1] + b[2] * 0.7], [b[0] - b[2] * 0.3, b[1] + b[2]]], true), c.cel('#4a3434'), 1.2) + L('M' + pt([b[0] - b[2] * 0.3, b[1] - b[2] * 0.3]) + 'l' + n(b[2] * 0.8) + ',' + n(b[2] * 0.4), '#ffb040', 0.9); });
      // near arm reaching forward
      var Ar = taper([[50, 60], [36, 64], [24, 58], [16, 48]], 12, 3, 5);
      s += P(Ar.d, '#e8481a', 2) + F(ribbonBand(Ar, 0.25, 0.75), '#ffb030');
      s += flame(c, 16, 50, 0.7, '#ff7a1a', '#ffe070');
      // face: dark slit eyes with white-hot centres
      s += P('M44,42 L56,46 L54,50 L44,47 Z', '#5a1408', 1) + P('M62,46 L72,42 L72,47 L63,50 Z', '#5a1408', 1) + L('M47,46 L54,48 M64,48 L70,45', '#ffffff', 1.4);
      s += P('M50,58 Q58,62 66,58 Q58,66 50,58 Z', '#5a1408', 0.9);
      return G(s + motes(31, 10, 20, 110, 10, 110, '#ffd070'), at(1, 64, 122));
    },
    lava_surger: function (c) {
      var rk = '#3e3436', s = C(64, 80, 48, glow(c, '#ff6a1a', 0.3)) + shadow(c, 64, 38);
      var crack = function (d) { return L(d, '#ff5a10', 4.4, 0.35) + L(d, '#ffa030', 1.8) + L(d, LAVAY, 0.7, 0.9); };
      // far arm + fist
      s += P('M84,56 L96,62 L98,78 L88,80 Z', c.cel(dk(rk, 0.2)), 2) + P(shag(96, 90, 11, 10, 5, 0.18, 4), c.cel(dk(rk, 0.2)), 2) + crack('M92,86 l4,4 l4,-2');
      // legs
      s += P('M52,96 L46,120 L60,121 L64,98 Z', c.cel(dk(rk, 0.15)), 2) + P('M70,98 L72,121 L86,120 L82,96 Z', c.cel(rk), 2) + crack('M50,106 l4,4 M76,104 l3,6');
      // torso boulder with a molten core
      var td = 'M36,62 C34,46 48,34 66,34 C86,34 96,48 94,66 C92,86 80,100 64,100 C48,100 38,84 36,62 Z';
      s += body(c, td, rk, F('M72,30 L100,30 L100,104 L74,104 C88,84 86,52 72,30 Z', '#000', 0.3) + C(62, 70, 16, glow(c, '#ffa030', 0.9)) + F(shag(62, 70, 10, 11, 6, 0.3, 9), '#ffb040') + F(shag(62, 70, 5, 6, 5, 0.3, 11), '#fff0a0') +
        crack('M44,52 l8,6 l-2,8 M82,50 l-6,8 l4,6 M50,86 l8,-4 l6,4 M76,86 l-4,6'), 2.6);
      // shoulder boulders
      s += P(shag(84, 48, 12, 10, 5, 0.16, 5), c.cel(lt(rk, 0.05)), 2.2) + crack('M80,44 l6,4');
      // head
      s += P(shag(56, 28, 12, 10, 5, 0.16, 6), c.cel(lt(rk, 0.08)), 2.2) + P('M44,26 L54,28 L52,32 L45,30 Z', LAVAY, 1) + P('M58,28 L66,25 L66,30 L59,32 Z', LAVAY, 1) + C(52, 28, 8, glow(c, '#ffb040', 0.6)) + L('M48,36 L62,36', '#ff8a2a', 1.6);
      // near arm + big fist dripping lava
      s += P('M44,54 L28,64 L24,80 L36,80 Z', c.cel(rk), 2) + P(shag(28, 90, 14, 12, 5, 0.18, 7), c.cel(lt(rk, 0.04)), 2.2) + crack('M20,88 l6,4 l6,-3 M26,96 l4,-4');
      s += P(drip(24, 100, 8, 2.2) + drip(34, 99, 5, 1.8), '#ff8a2a', 1.2) + P(shag(34, 44, 9, 8, 5, 0.16, 8), c.cel(rk), 2) + crack('M32,42 l4,4');
      return G(s + motes(41, 8, 16, 110, 20, 110, '#ffb040'), at(1.02, 64, 122));
    },
    tar_beast: function (c) {
      var t = '#352f3e', s = E(64, 121, 40, 6, TAR, 0, 0.9) + shadow(c, 64, 40);
      var gloss = function (d, w) { return L(d, '#8a88a8', w || 1.8, 0.55); };
      // far arm
      s += P('M84,50 C98,54 104,72 102,92 C101,100 96,104 92,100 C92,86 90,70 80,62 Z', c.cel(dk(t, 0.2)), 2.2) + P(drip(96, 100, 12, 3), dk(t, 0.2), 1.6);
      // body mass
      var bd = 'M30,120 C24,100 26,74 34,56 C40,38 56,28 72,30 C90,32 100,48 98,70 C96,90 98,106 104,120 C88,124 44,124 30,120 Z';
      s += body(c, bd, t, F('M76,28 L110,28 L110,124 L86,124 C96,100 92,56 76,28 Z', '#000', 0.35) + gloss('M40,58 C44,46 54,38 64,36') + gloss('M36,86 C34,78 35,70 38,64', 1.4) + E(50, 44, 6, 3, '#b8b8d8', 0, 0.35) + L('M100,70 C98,90 99,106 104,118', '#7a8ad8', 2.4, 0.7), 2.4);
      // head lump with glowing eyes and a gaping mouth
      s += P('M34,44 C30,30 40,20 52,22 C62,24 66,34 62,44 C58,52 40,54 34,44 Z', c.cel(lt(t, 0.04)), 2.2) + gloss('M38,32 C42,26 48,24 54,25', 1.4);
      s += C(42, 34, 3, glow(c, '#ffd84a', 0.8)) + E(42, 34, 2.4, 1.8, '#ffd84a', 1) + C(54, 34, 3, glow(c, '#ffd84a', 0.8)) + E(54, 34, 2.2, 1.7, '#ffd84a', 1);
      s += P('M40,42 C44,48 54,48 58,42 C56,52 44,54 40,42 Z', '#0a0608', 1.2) + P(drip(44, 50, 6, 1.4), t, 1);
      // near arm dragging a fist of tar
      s += P('M38,58 C24,64 16,82 16,100 C16,108 22,112 28,108 C28,92 32,78 44,70 Z', c.cel(t), 2.2) + gloss('M24,74 C20,82 19,90 19,96', 1.2);
      s += P(drip(22, 108, 10, 3) + drip(30, 106, 6, 2), t, 1.6) + P(drip(60, 118, 3, 3) + drip(80, 118, 2, 2.6), t, 1.2);
      // bubbles on the skin
      [[66, 60, 3], [74, 86, 2.4], [48, 96, 2.6]].forEach(function (b) { s += C(b[0], b[1], b[2], c.cel('#3a3444'), 1) + C(b[0] - b[2] * 0.35, b[1] - b[2] * 0.35, b[2] * 0.3, '#d8d8ec', 0, 0.8); });
      return G(s, at(1.02, 64, 122));
    },
    tar_lurker: function (c) {
      var t = '#312b36', s = E(64, 121, 50, 6, TAR, 0, 0.9) + shadow(c, 64, 50);
      // bones stuck in its back, behind the mass
      s += limb('M70,58 C72,40 80,30 90,24', '#d8ccac', 4) + limb('M84,62 C88,46 98,38 108,36', '#ccc0a0', 3.6) + limb('M58,62 C56,46 60,36 66,30', '#d8ccac', 3.4);
      // low wide mass
      var bd = 'M12,118 C10,100 18,82 30,72 C44,58 70,52 90,58 C108,64 120,84 120,120 C90,124 40,124 12,118 Z';
      s += body(c, bd, t, F('M88,52 L124,52 L124,124 L98,124 C110,100 104,72 88,52 Z', '#000', 0.35) + L('M26,84 C36,70 52,62 70,60', '#9a98c0', 2, 0.6) + L('M96,62 C110,70 118,90 118,116', '#7a8ad8', 2.4, 0.7) + E(46, 70, 7, 3, '#b8b8d8', 0, 0.35), 2.4);
      // ribs arching out of its flank, a skull half swallowed
      s += ribs(c, 84, 94, 0.36, '#d8ccac', 5);
      s += dinoSkull(c, 70, 76, 0.42, '#e0d4b4') + P(drip(62, 76, 7, 1.6) + drip(74, 76, 5, 1.4), t, 1);
      s += bone(100, 104, 20, -0.9, 0.9) + bone(40, 108, 16, 0.5, 0.8);
      // head: a dripping maw low at the front
      s += P('M12,96 C8,84 16,74 28,74 C38,74 44,82 42,92 C40,100 20,104 12,96 Z', c.cel(lt(t, 0.04)), 2.2);
      s += P('M10,96 C16,104 30,106 40,96 C36,110 18,112 10,96 Z', '#0a0608', 1.3) + P('M16,99 L18,103 L20,100 Z M24,101 L25,105 L27,101 Z M32,100 L33,104 L35,99 Z', '#e8dcc0', 0.6);
      s += C(24, 84, 3, glow(c, '#ff5a2a', 0.8)) + E(24, 84, 2.4, 1.6, '#ff6a3a', 1) + C(34, 83, 3, glow(c, '#ff5a2a', 0.8)) + E(34, 83, 2.2, 1.5, '#ff6a3a', 1);
      s += P(drip(20, 106, 8, 2.4) + drip(36, 104, 6, 2), t, 1.4);
      return G(s, at(1, 64, 122));
    },
    ungoro_gorilla: function (c) {
      var fur = '#3a3538', silver = '#b8b6b0', skin = '#5e4c46', s = shadow(c, 64, 44);
      // far arm (knuckles down) and far leg
      s += limb('M60,56 L52,86 L50,114', dk(fur, 0.2), 13) + P(shag(50, 116, 8, 6, 4, 0.2, 3), c.cel(dk(skin, 0.1)), 2);
      s += limb('M92,78 L104,96 L98,116', dk(fur, 0.2), 14) + P('M90,118 C90,112 104,112 106,118 L106,121 L90,121 Z', c.cel(dk(skin, 0.1)), 2);
      // body: massive shoulders sloping down to the hips
      var bd = 'M34,60 C34,40 52,28 72,30 C92,32 110,48 112,72 C114,90 104,100 90,100 C74,100 60,92 50,84 C40,78 34,70 34,60 Z';
      s += body(c, bd, fur, F('M56,34 C72,26 96,34 106,52 C98,48 86,46 76,50 C68,46 60,42 56,34 Z', silver, 0.95) + F('M74,50 C88,44 104,52 110,70 C100,64 90,62 82,62 Z', silver, 0.8) +
        L('M62,40 l4,4 M72,34 l3,5 M84,36 l2,5 M96,44 l1,5', dk(silver, 0.3), 1.2) + F('M90,30 L118,30 L118,102 L92,102 C106,86 104,52 90,30 Z', '#000', 0.25), 2.4);
      // near leg
      s += limb('M84,84 L78,102 L86,116', fur, 15) + P('M76,118 C76,112 92,112 94,118 L94,121 L76,121 Z', c.cel(skin), 2);
      // head low and forward: brow ridge, leathery face, open mouth
      s += body(c, 'M20,46 C18,32 28,22 40,22 C50,22 56,30 56,42 C56,54 46,62 36,62 C26,62 20,56 20,46 Z', fur, F('M44,18 L60,18 L60,64 L46,64 C54,52 52,30 44,18 Z', '#000', 0.25) + E(38, 24, 8, 4, dk(fur, 0.2), 0, 0.8), 2.2);
      s += body(c, 'M20,40 C20,34 28,32 36,34 C42,36 44,44 42,50 C40,58 30,60 24,56 C20,52 20,46 20,40 Z', skin, F('M34,32 L48,32 L48,60 L36,60 C42,50 40,40 34,32 Z', dk(skin, 0.25), 0.7), 1.8);
      s += P('M18,36 C22,30 34,30 42,34 L40,38 C32,35 24,36 20,39 Z', c.cel(dk(fur, 0.1)), 1.6);
      s += E(26, 38.6, 1.6, 1.3, '#e8c060', 0.8) + E(34, 39, 1.6, 1.3, '#e8c060', 0.8) + E(24, 44, 1.2, 1, OL) + E(29, 44.4, 1.2, 1, OL);
      s += P('M22,50 C26,48 34,48 38,50 C36,57 26,57 22,50 Z', '#3a1010', 1.2) + P('M24,50.4 L25,53.6 L26.4,50.6 Z M34.6,50.6 L35.6,53.6 L36.8,50.4 Z', '#f4ecd6', 0.6);
      // near arm, huge forearm down to the knuckles
      s += limb('M46,56 L36,86 L34,112', fur, 15) + L('M44,62 L38,84', dk(fur, 0.3), 1.2) + P(shag(34, 115, 10, 7, 4, 0.2, 5), c.cel(skin), 2) + L('M28,116 l0,4 M34,117 l0,4 M40,116 l0,4', OL, 1.2);
      return G(s, at(1.02, 64, 122));
    },
    bloodpetal_trapper: function (c) {
      var g = '#6aa83a', inn = '#d8384a', s = shadow(c, 70, 36);
      // base leaves
      s += bigLeaf(c, 74, 118, 0.62, PI + 0.3, dk(g, 0.15)) + bigLeaf(c, 76, 118, 0.6, -0.25, dk(g, 0.1));
      // a small second trap bud behind
      s += limb('M84,116 C92,96 98,80 96,64', dk(g, 0.2), 5) + P('M90,64 C88,52 96,44 104,48 C108,56 104,64 96,66 Z', c.cel(dk(g, 0.15)), 1.8) + L('M91,62 L102,50', inn, 1.6);
      // thick stalk
      s += limb('M74,120 C80,98 78,80 64,68', g, 11) + L('M76,112 C80,96 78,82 68,72', lt(g, 0.25), 2, 0.7);
      // the trap: upper and lower lobes gaping to the left, red inside, spines on the rims
      var up = 'M66,66 C58,44 40,32 18,34 C12,36 10,42 16,44 C30,46 44,54 56,70 Z';
      var lo = 'M64,72 C54,84 38,94 18,94 C12,94 10,88 16,86 C30,82 44,78 58,66 Z';
      var spines = function (p0, p1, p2, p3, dir) {
        var d = '';
        for (var i = 1; i < 9; i++) { var b = bez(p0, p1, p2, p3, i / 9), b2 = bez(p0, p1, p2, p3, i / 9 + 0.04); d += 'M' + pt(b) + 'L' + pt([b[0] - 2 + (b2[0] - b[0]), b[1] + dir * 7]); }
        return d;
      };
      s += P('M58,68 C44,58 30,48 18,42 L18,88 C30,84 44,78 58,68 Z', '#6a0e1c', 1.4);
      var sp1 = spines([56, 70], [44, 54], [30, 46], [16, 44], 1), sp2 = spines([58, 66], [44, 78], [30, 82], [16, 86], -1);
      s += L(sp1 + sp2, OL, 3.2) + L(sp1 + sp2, '#f4ecc8', 1.4);
      s += body(c, up, g, F('M16,44 C30,46 44,54 56,70 L50,70 C40,58 28,50 16,48 Z', inn, 0.95) + E(40, 42, 8, 3, lt(g, 0.3), 0, 0.6) + C(34, 40, 1.6, dk(g, 0.3)) + C(46, 44, 1.4, dk(g, 0.3)), 2.2);
      s += body(c, lo, dk(g, 0.06), F('M16,86 C30,82 44,78 58,66 L60,72 C46,84 30,90 16,90 Z', inn, 0.95) + F('M20,94 L66,94 L66,100 L20,100 Z', dk(g, 0.3), 0.8), 2.2);
      s += P(drip(30, 88, 8, 1.4) + drip(40, 84, 5, 1.2), '#c8e888', 0.8);
      return G(s, at(1.04, 64, 122));
    },
    king_mosh: function (c) {
      var col = '#8a8a90', red = '#b8282a', bel = '#d4d0c8', s = shadow(c, 64, 56);
      // far leg
      s += limb('M84,74 L96,96 L88,112', dk(col, 0.25), 11) + birdFoot(88, 119, dk(col, 0.4), true);
      // tail
      var Tl = taper([[92, 58], [108, 54], [120, 46], [126, 34]], 26, 4, 6);
      s += body(c, Tl.d, col, F(ribbonBand(Tl, 0, 0.35), red, 0.95) + F(ribbonBand(Tl, 0.6, 1), bel, 0.85), 2.2);
      // body
      var bd = 'M40,56 C44,40 64,34 82,38 C98,42 104,56 100,70 C96,84 80,90 64,88 C50,86 38,74 40,56 Z';
      s += body(c, bd, col, F('M40,58 C44,42 62,34 82,38 C92,40 98,46 100,52 C84,46 62,46 40,58 Z', red, 0.95) + L('M54,48 L50,60 M66,44 L62,58 M78,44 L76,58 M90,48 L88,60', dk(red, 0.3), 2.4) +
        F('M38,70 C48,86 72,92 98,76 L98,96 L38,96 Z', bel, 0.9) + F('M84,34 L106,34 L106,90 L84,90 C98,76 98,52 84,34 Z', dk(col, 0.25), 0.6), 2.4);
      // tiny arm
      s += limb('M44,70 L36,78 L32,76', col, 4) + L('M32,76 l-3,-2 M32,76 l-3,2', OL, 1.6);
      // huge head with open jaws, lunging low-left
      s += body(c, 'M50,54 C44,64 38,70 30,74 L40,84 C48,78 54,72 60,64 Z', col, F('M30,76 L40,84 L50,74 Z', bel, 0.8), 2.2);
      var hs = '';
      hs += P('M40,62 C34,72 24,80 8,82 L2,80 C0,78 2,74 6,74 C18,72 28,66 34,58 Z', c.cel(col), 2) + F('M4,80 C14,80 26,76 36,66 L38,70 C28,80 16,84 4,82 Z', bel, 0.9);
      hs += P('M2,58 L36,58 C36,64 30,70 18,73 C10,74 4,70 2,64 Z', '#5a1414', 1.4) + F('M8,66 C16,66 26,63 34,60 C30,68 20,71 12,70 Z', '#c8505a', 0.95);
      hs += P('M6,73 L8,68 L10,73 Z M13,72.6 L15,67 L17,72 Z M20,71.4 L22,66 L24,70.4 Z M27,68.6 L29,63.6 L31,67 Z', '#fff4e0', 0.7);
      var hd = 'M50,40 C44,30 28,28 14,32 L2,38 C-2,42 -2,50 2,56 L2,58 L36,60 C44,62 52,56 54,50 Z';
      hs += body(c, hd, col, F('M14,28 C26,24 42,26 50,34 C40,34 28,36 16,40 Z', red, 0.95) + L('M26,30 l2,6 M36,30 l1,6', dk(red, 0.3), 1.8) + F('M40,24 L58,24 L58,64 L44,64 C52,52 50,36 40,24 Z', dk(col, 0.25), 0.7) + F('M0,52 C10,56 24,58 36,58 L36,64 L0,64 Z', bel, 0.85), 2.4);
      hs += P('M3,57.6 L5,62.4 L7,57.8 Z M10,58 L12,63.4 L14,58.2 Z M17,58.4 L19,63.6 L21,58.6 Z M24,58.8 L26,63.4 L28,59 Z', '#fff4e0', 0.7);
      hs += P('M24,36 L40,34 L38,39 L26,40 Z', c.cel(dk(red, 0.2)), 1.4) + E(33, 41, 2.6, 2, '#ffd23a', 1) + E(32.6, 41, 0.8, 1.6, OL) + E(5, 42, 1.2, 0.9, OL);
      s += hs;
      // near leg: huge thigh, shin, clawed foot
      s += body(c, ellD(66, 74, 16, 15), col, F('M58,62 C62,58 70,58 76,62 L72,70 L60,70 Z', red, 0.6) + F('M70,56 L86,56 L86,92 L72,92 C80,82 80,64 70,56 Z', dk(col, 0.25), 0.7), 2.2);
      s += limb('M68,84 L78,102 L64,114', col, 12) + birdFoot(64, 121, dk(col, 0.35), true) + P('M52,120 L48,114 L56,118 Z M58,121 L55,115 L62,119 Z', c.cel('#f4ecd6'), 1);
      return G(s, at(1.02, 66, 122));
    }
  };
  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(FERN), 2.5); }
  function phScene(c) { return sky(c, '#86bcb2', '#e0dcae', '#f2c48c') + ground(c, 150, '#5e9a44', '#34642c'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#3e9e48"/></svg>'; }
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
