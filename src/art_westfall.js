/* art_westfall.js — Longfield zone art for Realm of Loner (Accord, levels 10-15: Warrick's Rise, Tuck's Pumpkin Farm,
 * Wenham Farm, the Copperseam Mine, the Hartwell Farm, the Saltstrand and the Flint Hills).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Longfield keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix wf<counter>_).
 * Palette: warm late-afternoon sky, golden-brown dry farmland, wheat, grey Grey Hood cloth, grey-blue sea to the west.
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
  function Ctx() { this.p = 'wf' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function rot(a, x, y) { return 'rotate(' + n(a) + ',' + n(x) + ',' + n(y) + ')'; }
  function limb(d, col, w) { return L(d, OL, w + 4.5) + L(d, col, w); }
  function tube(pts, w, col, sh) {
    var d = pd(pts);
    return L(d, OL, w + 4.5) + L(d, col, w) +
      (sh ? '<path transform="translate(' + n(w * 0.24) + ',' + n(w * 0.08) + ')" d="' + d + '" fill="none" stroke="' + sh + '" stroke-width="' + n(w * 0.36) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>' : '');
  }
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
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  // many-pointed star (used for the sun crest and gear teeth)
  function star(cx, cy, k, r0, r1) {
    var d = '';
    for (var i = 0; i < k * 2; i++) { var a = -PI / 2 + PI * i / k, r = i % 2 ? r1 : r0; d += (i ? 'L' : 'M') + pt([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return d + 'Z';
  }

  // ---------- palette ----------
  var GROUND = '#c8a24e', GROUND2 = '#9a7434', GRASSD = '#8a6428', GRASSL = '#ecd080', WHEAT = '#e0b24a', DUST = '#e2c890';
  var WOOD = '#8a5a32', WOODW = '#8e7456', STONE = '#b0a288', ROOF = '#8a4632', PLASTER = '#e2d2aa', BEAM = '#5a3a24';
  var SW_BLUE = '#2e56a8', SW_GOLD = '#e8c048', DEF_RED = '#8a8e93', DEF_HOOD = '#6b6f74', SEA = '#6a8ca4';

  // ============================================================
  //  SCENE PIECES
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 5, glow(c, col || '#ffe6a8', 0.55)) + C(x, y, r, lt(col || '#ffe6a8', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#fff0d0', 0.14], [0.5, '#fff0d0', 0], [1, bot || '#3a1e08', 0.22]])); }
  // warm late-afternoon light washing in from one side
  function warmth(c, left) { return R(0, 0, 400, 240, c.lg([[0, '#ffb060', left ? 0.16 : 0], [1, '#ffb060', left ? 0 : 0.16]], 0, 0, 1, 0)); }
  function cloud(x, y, s, op) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, '#fff8ec', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', '#f0c8a0', 0.85);
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
    col = col || '#c0a044';
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
  // dusty road narrowing into the distance; cx = where it meets the horizon
  function road(c, y, w1, w2, col, op, cx, bx) {
    cx = cx == null ? 200 : cx; bx = bx == null ? 200 : bx;
    return F('M' + (cx - w1) + ',' + y + ' C' + (cx - w1) + ',' + (y + 30) + ' ' + (bx - w2) + ',210 ' + (bx - w2) + ',242 L' + (bx + w2) + ',242 C' + (bx + w2) + ',210 ' + (cx + w1) + ',' + (y + 30) + ' ' + (cx + w1) + ',' + y + ' Z', col, op == null ? 0.55 : op);
  }
  function ruts(y0, cx, bx, w1, w2, col) {
    var d = '';
    [-0.45, 0.45].forEach(function (k) { d += 'M' + pt([cx + w1 * k, y0]) + 'C' + pt([cx + w1 * k, y0 + 30]) + ' ' + pt([bx + w2 * k, 210]) + ' ' + pt([bx + w2 * k, 242]); });
    return L(d, col, 1.4, 0.45);
  }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x - w * 0.05, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.5]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.08, y - h - 2]) + 'C' + pt([x + w * 0.36, y - h * 0.8]) + ' ' + pt([x + w * 0.4, y - h * 0.3]) + ' ' + pt([x + w * 0.3, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.85) +
      E(x - w * 0.2, y - h * 0.7, w * 0.12, h * 0.1, lt(col, 0.25), 0, 0.6), 1.8);
  }
  function smoke(x, y, s, seed, col, len) {
    var r = rng(seed || 4), o = '', k = len || 6;
    for (var i = 0; i < k; i++) { var t = i / (k - 1), sx = x + t * 46 * s + r() * 5, sy = y - t * 60 * s - r() * 5, rr = (5 + t * 12) * s; o += C(sx, sy, rr, i % 2 ? (col || '#8a8680') : lt(col || '#8a8680', 0.15), 0, 0.72 - t * 0.5); }
    return o;
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 14 * s, 50 * s, glow(c, '#ffb040', 0.45)) + E(x, y + 2 * s, 20 * s, 5 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = PI * i / 6; o += rock(c, x - 18 * s * Math.cos(a), y + 2 * s + 2.5 * s * Math.sin(a), 7 * s, 5 * s, '#8a8070'); }
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 12 * s, y - 6 * s]), '#6a4424', 3.4 * s) + limb('M' + pt([x + 14 * s, y]) + 'L' + pt([x - 10 * s, y - 7 * s]), '#7a5030', 3.4 * s);
    return o + flame(c, x - 6 * s, y - 2 * s, 0.9 * s) + flame(c, x + 6 * s, y - 2 * s, 0.85 * s) + flame(c, x, y, 1.35 * s);
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
  // Grey Hood crate: a grey cloth tied over the lid
  function defCrate(c, x, y, s) {
    return crate(c, x, y, s, '#9a6a3a') + P('M' + pt([x - 11 * s, y - 16 * s]) + 'L' + pt([x + 3 * s, y - 17 * s]) + 'L' + pt([x + 4 * s, y - 8 * s]) + 'L' + pt([x, y - 10 * s]) + 'L' + pt([x - 4 * s, y - 6 * s]) + 'L' + pt([x - 7 * s, y - 11 * s]) + 'L' + pt([x - 11 * s, y - 9 * s]) + 'Z', c.cel(DEF_RED), 1.3 * s);
  }
  function sack(c, x, y, s, col) {
    col = col || '#c8aa76';
    var d = 'M' + pt([x - 9 * s, y]) + 'C' + pt([x - 12 * s, y - 8 * s]) + ' ' + pt([x - 8 * s, y - 16 * s]) + ' ' + pt([x - 3 * s, y - 17 * s]) + 'L' + pt([x - 4 * s, y - 21 * s]) + 'L' + pt([x + 4 * s, y - 21 * s]) + 'L' + pt([x + 3 * s, y - 17 * s]) + 'C' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 12 * s, y - 8 * s]) + ' ' + pt([x + 9 * s, y]) + 'Z';
    return E(x, y + 1, 11 * s, 2.4 * s, '#000', 0, 0.22) + body(c, d, col, F('M' + pt([x + 2 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y + 2]) + 'L' + pt([x + 3 * s, y + 2]) + 'Z', dk(col, 0.25), 0.8) + L('M' + pt([x - 4 * s, y - 17 * s]) + 'L' + pt([x + 4 * s, y - 17 * s]), '#6a4a2a', 1.6 * s), 1.5 * s);
  }
  function fence(c, x1, x2, y, h, col, step) {
    col = col || WOODW;
    var o = '', posts = '';
    for (var x = x1; x <= x2; x += (step || 18)) posts += 'M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - h);
    var rl = 'M' + x1 + ',' + n(y - h * 0.7) + ' L' + x2 + ',' + n(y - h * 0.72) + ' M' + x1 + ',' + n(y - h * 0.3) + ' L' + x2 + ',' + n(y - h * 0.32);
    o += L(posts + rl, OL, 5) + L(rl, lt(col, 0.1), 2) + L(posts, col, 2.6);
    return o;
  }
  function brokenFence(c, x1, x2, y, s, seed) {
    var r = rng(seed || 5), o = '', wood = WOODW, step = 22 * s;
    for (var x = x1; x <= x2; x += step) {
      var lean = (r() - 0.5) * 18;
      if (r() < 0.15) continue;
      o += G(limb('M' + pt([x, y]) + 'L' + pt([x, y - 16 * s]), dk(wood, 0.1), 3 * s), rot(lean, x, y));
      if (x + step <= x2 && r() > 0.25) {
        var y1 = y - 12 * s + (r() - 0.5) * 3, y2 = y - 12 * s + (r() - 0.5) * 3;
        if (r() < 0.35) o += limb('M' + pt([x, y1]) + 'L' + pt([x + step * 0.5, y1 + 8 * s]), wood, 2.2 * s);
        else o += limb('M' + pt([x, y1]) + 'L' + pt([x + step, y2]), wood, 2.2 * s);
        if (r() > 0.4) o += limb('M' + pt([x, y - 5 * s]) + 'L' + pt([x + step, y - 5 * s + (r() - 0.5) * 3]), wood, 2.2 * s);
      }
    }
    return o;
  }
  function pumpkin(c, x, y, s, rotten) {
    var col = rotten ? '#9a7a3a' : '#e07a24', o = E(x, y + 1, 10 * s, 2.6 * s, '#000', 0, 0.28);
    o += body(c, 'M' + pt([x - 10 * s, y - 5 * s]) + 'C' + pt([x - 10 * s, y - 13 * s]) + ' ' + pt([x + 10 * s, y - 13 * s]) + ' ' + pt([x + 10 * s, y - 5 * s]) + 'C' + pt([x + 10 * s, y + 1]) + ' ' + pt([x - 10 * s, y + 1]) + ' ' + pt([x - 10 * s, y - 5 * s]) + 'Z', col,
      L('M' + pt([x - 3 * s, y - 12 * s]) + 'Q' + pt([x - 7 * s, y - 5 * s]) + ' ' + pt([x - 3 * s, y]) + 'M' + pt([x + 3 * s, y - 12 * s]) + 'Q' + pt([x + 7 * s, y - 5 * s]) + ' ' + pt([x + 3 * s, y]), dk(col, 0.35), 1.1 * s) +
      E(x - 5 * s, y - 8 * s, 2.4 * s, 1.4 * s, lt(col, 0.35), 0, 0.7) + (rotten ? E(x + 4 * s, y - 3 * s, 3 * s, 2 * s, '#4a4a2a', 0, 0.9) : ''), 1.6 * Math.max(0.6, s));
    o += limb('M' + pt([x, y - 11 * s]) + 'L' + pt([x + 2 * s, y - 15 * s]), '#5a6a2a', 1.3 * s);
    return o;
  }
  function vines(seed, y0, y1, x0, x1, cnt) {
    var r = rng(seed), d = '', lv = '';
    for (var i = 0; i < cnt; i++) {
      var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 10 + r() * 14;
      d += 'M' + pt([x, y]) + 'q' + n(w * 0.5) + ',' + n(-4 - r() * 3) + ' ' + n(w) + ',' + n(r() * 3 - 1);
      lv += E(x + w * 0.3, y - 2, 2.6, 1.6, '#6a8a2e', 0) + E(x + w * 0.8, y - 1, 2.2, 1.4, '#5a7a28', 0);
    }
    return L(d, '#4a6a22', 1.2, 0.8) + lv;
  }
  // wheat field band: bumpy ear line on top, stalk texture, lighter ears along the crest
  function wheatBand(c, seed, x0, x1, y, h, col, k) {
    k = k || 1; col = col || WHEAT;
    // ends that stop on screen slope down into a rounded mound instead of a hard vertical edge
    var t0 = x0 > -2, t1 = x1 < 402, span = Math.min(h * 1.6, (x1 - x0) * 0.4);
    var drop = function (px) { var a = t0 ? Math.max(0, 1 - (px - x0) / span) : 0, b = t1 ? Math.max(0, 1 - (x1 - px) / span) : 0, m = Math.max(a, b); return h * 0.85 * m * m; };
    var r = rng(seed), d = 'M' + pt([x0, y + h]) + 'L' + pt([x0, y + drop(x0)]), x = x0, heads = '';
    while (x < x1) { var w = (3 + r() * 3) * k, hh = (3 + r() * 4) * k, xe = Math.min(x + w, x1), yd = drop(xe), ym = drop(x + w / 2); d += 'Q' + pt([x + w / 2, y + ym - hh]) + ' ' + pt([xe, y + yd]); if (r() > 0.35) heads += E(x + w / 2, y + ym - hh * 0.4, 1.3 * k, 2.6 * k, lt(col, 0.35), 0, 0.9); x += w; }
    x = x1;
    d += 'L' + pt([x, y + h]) + 'Z';
    var tex = '';
    for (var i = 0; i < (x1 - x0) / (2.6 * k); i++) { var tx = x0 + r() * (x1 - x0), ty = y + r() * h * 0.8; tex += 'M' + pt([tx, ty]) + 'l' + n((r() - 0.5) * 2 * k) + ',' + n((4 + r() * 5) * k); }
    return body(c, d, col, L(tex, dk(col, 0.3), 0.9 * k, 0.7) + heads + F('M' + pt([x0 - 2, y + h * 0.55]) + 'L' + pt([x + 2, y + h * 0.5]) + 'L' + pt([x + 2, y + h + 2]) + 'L' + pt([x0 - 2, y + h + 2]) + 'Z', dk(col, 0.22), 0.6), 1.5 * k);
  }
  // single foreground wheat clump: outlined stalks with ears
  function wheatClump(c, x, y, s, col) {
    col = col || WHEAT;
    var o = E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.18), st = '', ears = '';
    [[-9, -26, -0.35], [-4, -32, -0.15], [1, -35, 0.05], [6, -30, 0.25], [10, -24, 0.4]].forEach(function (q) {
      var tx = x + q[0] * s, ty = y + q[1] * s;
      st += 'M' + pt([x + q[0] * 0.3 * s, y]) + 'Q' + pt([x + q[0] * 0.6 * s, y + q[1] * 0.5 * s]) + ' ' + pt([tx, ty]);
      ears += G(E(tx, ty - 4 * s, 2.4 * s, 6 * s, c.cel(col), 1.2 * s) + L('M' + pt([tx - 2 * s, ty - 7 * s]) + 'l' + n(-2 * s) + ',' + n(-3 * s) + 'M' + pt([tx + 2 * s, ty - 7 * s]) + 'l' + n(2 * s) + ',' + n(-3 * s), dk(col, 0.25), 0.8 * s), rot(q[2] * 57, tx, ty));
    });
    return o + L(st, OL, 3.2 * s) + L(st, dk(col, 0.1), 1.4 * s) + ears;
  }
  // Kingsmere-style farmhouse: stone ground floor, half-timbered upper, steep shingle roof
  function farmhouse(c, x, y, s, o) {
    o = o || {};
    var plaster = o.wall || PLASTER, beam = BEAM, roofc = o.roof || ROOF, stone = o.stone || STONE, out = '', ruin = o.ruin;
    var win = ruin ? '#2a1a12' : (o.lit ? '#ffd46a' : '#5a6a7a');
    out += E(x, y + 2, 50 * s, 5 * s, '#000', 0, 0.26);
    var w = 38 * s, h = 38 * s;
    var inner = '';
    // chimney + smoke
    if (!ruin) inner += smoke(x + 22 * s, y - h - 44 * s, s, 11, '#b0aaa0', 5);
    inner += body(c, 'M' + pt([x + 16 * s, y - h - 14 * s]) + 'L' + pt([x + 17 * s, y - h - 38 * s]) + 'L' + pt([x + 27 * s, y - h - 38 * s]) + 'L' + pt([x + 26 * s, y - h - 8 * s]) + 'Z', stone, F('M' + pt([x + 22 * s, y - h - 40 * s]) + 'L' + pt([x + 30 * s, y - h - 40 * s]) + 'L' + pt([x + 30 * s, y - h]) + 'L' + pt([x + 22 * s, y - h]) + 'Z', dk(stone, 0.28), 0.8), 1.8 * s);
    // stone ground floor
    var wall = 'M' + pt([x - w, y]) + 'L' + pt([x - w, y - h * 0.5]) + 'L' + pt([x + w, y - h * 0.5]) + 'L' + pt([x + w, y]) + 'Z';
    var joints = '';
    for (var j = 1; j < 3; j++) { var jy = y - h * 0.5 * j / 3; joints += 'M' + pt([x - w, jy]) + 'L' + pt([x + w, jy]); for (var q = -3; q <= 3; q++) joints += 'M' + pt([x + (q * 11 + (j % 2 ? 5 : 0)) * s, jy]) + 'l0,' + n(h * 0.5 / 3); }
    inner += body(c, wall, stone, F('M' + pt([x + w * 0.45, y - h]) + 'L' + pt([x + w + 2, y - h]) + 'L' + pt([x + w + 2, y + 2]) + 'L' + pt([x + w * 0.45, y + 2]) + 'Z', dk(stone, 0.28), 0.7) + L(joints, dk(stone, 0.3), 0.9 * s, 0.8), 2 * s);
    // timber upper storey (overhangs)
    var up = 'M' + pt([x - w - 4 * s, y - h * 0.5]) + 'L' + pt([x - w - 4 * s, y - h]) + 'L' + pt([x + w + 4 * s, y - h]) + 'L' + pt([x + w + 4 * s, y - h * 0.5]) + 'Z';
    var beams = L('M' + pt([x - w - 4 * s, y - h * 0.5]) + 'L' + pt([x + w + 4 * s, y - h * 0.5]) + 'M' + pt([x - w, y - h]) + 'L' + pt([x - w, y - h * 0.5]) + 'M' + pt([x - w * 0.33, y - h]) + 'L' + pt([x - w * 0.33, y - h * 0.5]) + 'M' + pt([x + w * 0.33, y - h]) + 'L' + pt([x + w * 0.33, y - h * 0.5]) + 'M' + pt([x + w, y - h]) + 'L' + pt([x + w, y - h * 0.5]) +
      'M' + pt([x - w, y - h * 0.5]) + 'L' + pt([x - w * 0.33, y - h]) + 'M' + pt([x + w * 0.33, y - h * 0.5]) + 'L' + pt([x + w, y - h]), beam, 2.6 * s);
    var ush = F('M' + pt([x + w * 0.45, y - h - 2]) + 'L' + pt([x + w + 6 * s, y - h - 2]) + 'L' + pt([x + w + 6 * s, y - h * 0.5 + 2]) + 'L' + pt([x + w * 0.45, y - h * 0.5 + 2]) + 'Z', dk(plaster, 0.25), 0.8);
    if (ruin) ush += F('M' + pt([x - w * 0.9, y - h]) + 'L' + pt([x - w * 0.4, y - h]) + 'L' + pt([x - w * 0.55, y - h * 0.78]) + 'L' + pt([x - w * 0.8, y - h * 0.72]) + 'Z', '#3a2a20', 0.9) + E(x + w * 0.2, y - h * 0.75, 10 * s, 5 * s, '#4a3a2a', 0, 0.45);
    inner += body(c, up, plaster, ush + beams, 2 * s);
    // steep roof
    var roof = 'M' + pt([x - w - 12 * s, y - h + 2 * s]) + 'L' + pt([x - 2 * s, y - h - 34 * s]) + 'L' + pt([x + 2 * s, y - h - 34 * s]) + 'L' + pt([x + w + 12 * s, y - h + 2 * s]) + 'Z';
    var rsh = F('M' + pt([x + 2 * s, y - h - 36 * s]) + 'L' + pt([x + w + 14 * s, y - h + 4 * s]) + 'L' + pt([x + 12 * s, y - h + 4 * s]) + 'Z', dk(roofc, 0.3), 0.8);
    for (var i = 1; i < 5; i++) rsh += L('M' + pt([x - w - 12 * s + i * 5 * s, y - h + 2 * s - i * 7 * s]) + 'L' + pt([x + w + 12 * s - i * 5 * s, y - h + 2 * s - i * 7 * s]), dk(roofc, 0.3), 1 * s, 0.8);
    if (ruin) rsh += F('M' + pt([x - 22 * s, y - h - 6 * s]) + 'L' + pt([x - 10 * s, y - h - 22 * s]) + 'L' + pt([x + 2 * s, y - h - 14 * s]) + 'L' + pt([x + 8 * s, y - h - 22 * s]) + 'L' + pt([x + 18 * s, y - h - 6 * s]) + 'L' + pt([x + 4 * s, y - h]) + 'L' + pt([x - 14 * s, y - h]) + 'Z', '#1e140e');
    inner += body(c, roof, roofc, rsh, 2.2 * s);
    if (ruin) for (var k = 0; k < 4; k++) inner += limb('M' + pt([x - 16 * s + k * 9 * s, y - h - 2 * s]) + 'L' + pt([x - 12 * s + k * 8 * s + (k % 2 ? 3 : -2) * s, y - h - (20 - k * 2) * s]), '#4a3424', 1.4 * s);
    // windows + door
    var win1 = R(x - w * 0.82, y - h * 0.92, 9 * s, 9 * s, win, 1.6 * s), win2 = R(x + w * 0.46, y - h * 0.92, 9 * s, 9 * s, win, 1.6 * s);
    inner += win1 + win2 + L('M' + pt([x - w * 0.82 + 4.5 * s, y - h * 0.92]) + 'l0,' + n(9 * s) + 'M' + pt([x + w * 0.46 + 4.5 * s, y - h * 0.92]) + 'l0,' + n(9 * s), BEAM, 1.2 * s);
    if (o.lit && !ruin) inner += C(x - w * 0.82 + 4.5 * s, y - h * 0.88, 14 * s, glow(c, '#ffc860', 0.4)) + C(x + w * 0.46 + 4.5 * s, y - h * 0.88, 14 * s, glow(c, '#ffc860', 0.4));
    inner += R(x - w * 0.75, y - h * 0.4, 8 * s, 8 * s, win, 1.4 * s);
    if (ruin) inner += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#140e0a', 1.6 * s) + P('M' + pt([x + 6 * s, y]) + 'L' + pt([x + 12 * s, y - 2 * s]) + 'L' + pt([x + 9 * s, y - 14 * s]) + 'L' + pt([x + 6 * s, y - 15 * s]) + 'Z', c.cel('#6a4a30'), 1.4 * s);
    else inner += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', c.cel('#6a4428'), 1.6 * s) + C(x + 3 * s, y - 7 * s, 1 * s, '#e0b848');
    // broken corner rubble
    if (ruin) inner += rock(c, x + w + 6 * s, y + 2, 14 * s, 7 * s, stone) + rock(c, x - w - 4 * s, y + 2, 10 * s, 6 * s, stone);
    return out + inner;
  }
  // big red barn, gambrel roof; burnt = charred with a broken roof and smoke
  function barn(c, x, y, s, o) {
    o = o || {};
    var burnt = o.burnt, wood = burnt ? '#4a3228' : (o.col || '#a4442e'), trim = burnt ? '#6a5a4a' : '#ece2cc', roofc = burnt ? '#2a201a' : '#5a3a2e', out = '';
    out += E(x, y + 2, 50 * s, 5 * s, '#000', 0, 0.26);
    var wall = 'M' + pt([x - 36 * s, y]) + 'L' + pt([x - 36 * s, y - 38 * s]) + 'L' + pt([x - 24 * s, y - 56 * s]) + 'L' + pt([x, y - 66 * s]) + 'L' + pt([x + 24 * s, y - 56 * s]) + 'L' + pt([x + 36 * s, y - 38 * s]) + 'L' + pt([x + 36 * s, y]) + 'Z';
    var planks = '';
    for (var i = -3; i <= 3; i++) planks += L('M' + pt([x + i * 10 * s, y - 70 * s]) + 'L' + pt([x + i * 10 * s, y]), dk(wood, 0.3), 1.1 * s);
    planks += F('M' + pt([x + 12 * s, y - 70 * s]) + 'L' + pt([x + 40 * s, y - 70 * s]) + 'L' + pt([x + 40 * s, y + 2]) + 'L' + pt([x + 12 * s, y + 2]) + 'Z', dk(wood, 0.3), 0.8);
    if (burnt) planks += F('M' + pt([x - 20 * s, y - 60 * s]) + 'L' + pt([x - 4 * s, y - 64 * s]) + 'L' + pt([x + 6 * s, y - 48 * s]) + 'L' + pt([x - 8 * s, y - 40 * s]) + 'L' + pt([x - 22 * s, y - 46 * s]) + 'Z', '#120c08') + E(x - 26 * s, y - 20 * s, 8 * s, 10 * s, '#1a120c', 0, 0.6) + E(x + 26 * s, y - 28 * s, 6 * s, 9 * s, '#1a120c', 0, 0.6);
    out += body(c, wall, wood, planks, 2 * s);
    // hay loft door
    out += P('M' + pt([x - 7 * s, y - 42 * s]) + 'L' + pt([x - 7 * s, y - 54 * s]) + 'L' + pt([x + 7 * s, y - 54 * s]) + 'L' + pt([x + 7 * s, y - 42 * s]) + 'Z', burnt ? '#120c08' : '#3a2a20', 1.4 * s);
    if (!burnt) out += F('M' + pt([x - 6 * s, y - 42 * s]) + 'L' + pt([x - 6 * s, y - 46 * s]) + 'Q' + pt([x, y - 49 * s]) + ' ' + pt([x + 6 * s, y - 45 * s]) + 'L' + pt([x + 6 * s, y - 42 * s]) + 'Z', '#e8c860');
    // big door with X brace
    out += body(c, 'M' + pt([x - 15 * s, y]) + 'L' + pt([x - 15 * s, y - 28 * s]) + 'L' + pt([x + 15 * s, y - 28 * s]) + 'L' + pt([x + 15 * s, y]) + 'Z', burnt ? '#1e1410' : dk(wood, 0.15),
      L('M' + pt([x - 15 * s, y]) + 'L' + pt([x + 15 * s, y - 28 * s]) + 'M' + pt([x + 15 * s, y]) + 'L' + pt([x - 15 * s, y - 28 * s]) + 'M' + pt([x - 15 * s, y - 28 * s]) + 'L' + pt([x + 15 * s, y - 28 * s]) + 'M' + pt([x, y]) + 'L' + pt([x, y - 28 * s]), trim, 2.4 * s), 1.8 * s);
    // roof edges (gambrel)
    var eave = 'M' + pt([x - 40 * s, y - 35 * s]) + 'L' + pt([x - 26 * s, y - 57 * s]) + 'L' + pt([x, y - 68 * s]) + 'L' + pt([x + 26 * s, y - 57 * s]) + 'L' + pt([x + 40 * s, y - 35 * s]);
    if (burnt) out += limb('M' + pt([x - 40 * s, y - 35 * s]) + 'L' + pt([x - 26 * s, y - 57 * s]) + 'L' + pt([x - 8 * s, y - 64 * s]), roofc, 3.6 * s) + limb('M' + pt([x + 10 * s, y - 64 * s]) + 'L' + pt([x + 26 * s, y - 57 * s]) + 'L' + pt([x + 34 * s, y - 44 * s]), roofc, 3.6 * s) +
      limb('M' + pt([x - 4 * s, y - 62 * s]) + 'L' + pt([x - 14 * s, y - 44 * s]), '#3a2a20', 2 * s) + limb('M' + pt([x + 6 * s, y - 60 * s]) + 'L' + pt([x + 12 * s, y - 46 * s]), '#3a2a20', 2 * s);
    else out += limb(eave, roofc, 4 * s) + L(eave, lt(roofc, 0.2), 1.2 * s, 0.7);
    if (burnt) {
      out += smoke(x - 6 * s, y - 66 * s, s * 1.2, 21, '#6a6660', 7);
      out += C(x - 4 * s, y - 40 * s, 3 * s, '#ff8a2a', 0, 0.8) + C(x + 20 * s, y - 8 * s, 2 * s, '#ff8a2a', 0, 0.8) + C(x - 24 * s, y - 6 * s, 2.4 * s, '#ffb040', 0, 0.8);
    }
    return out;
  }
  // wooden windmill on a stone base with four canvas sails
  function windmill(c, x, y, s, o) {
    o = o || {};
    var st = o.stone || STONE, wd = o.wood || '#9a7a52', out = '';
    out += E(x, y + 2, 36 * s, 5 * s, '#000', 0, 0.26);
    var tw = 'M' + pt([x - 24 * s, y]) + 'L' + pt([x - 16 * s, y - 84 * s]) + 'L' + pt([x + 16 * s, y - 84 * s]) + 'L' + pt([x + 24 * s, y]) + 'Z';
    var sh = F('M' + pt([x + 4 * s, y - 86 * s]) + 'L' + pt([x + 26 * s, y - 86 * s]) + 'L' + pt([x + 26 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', dk(wd, 0.3), 0.85);
    for (var i = 1; i < 12; i++) sh += L('M' + pt([x - 30 * s, y - i * 7 * s]) + 'L' + pt([x + 30 * s, y - i * 7 * s]), dk(wd, 0.28), 0.9 * s, 0.7);
    sh += F('M' + pt([x - 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y + 2]) + 'L' + pt([x - 30 * s, y + 2]) + 'Z', st) + F('M' + pt([x + 6 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', dk(st, 0.28), 0.85) + L('M' + pt([x - 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y - 22 * s]), OL, 1.4 * s) + L('M' + pt([x - 30 * s, y - 11 * s]) + 'L' + pt([x + 30 * s, y - 11 * s]), dk(st, 0.3), 1 * s);
    out += body(c, tw, wd, sh, 2 * s);
    out += P('M' + pt([x - 7 * s, y]) + 'L' + pt([x - 7 * s, y - 16 * s]) + 'Q' + pt([x, y - 22 * s]) + ' ' + pt([x + 7 * s, y - 16 * s]) + 'L' + pt([x + 7 * s, y]) + 'Z', c.cel('#5a3a24'), 1.6 * s);
    out += R(x - 6 * s, y - 56 * s, 7 * s, 9 * s, '#2a1a12', 1.4 * s);
    // cap
    out += body(c, 'M' + pt([x - 21 * s, y - 82 * s]) + 'Q' + pt([x - 16 * s, y - 106 * s]) + ' ' + pt([x, y - 110 * s]) + 'Q' + pt([x + 16 * s, y - 106 * s]) + ' ' + pt([x + 21 * s, y - 82 * s]) + 'Z', o.cap || ROOF, F('M' + pt([x + 2 * s, y - 112 * s]) + 'L' + pt([x + 24 * s, y - 112 * s]) + 'L' + pt([x + 24 * s, y - 80 * s]) + 'L' + pt([x + 6 * s, y - 80 * s]) + 'Z', dk(ROOF, 0.3), 0.8) + L('M' + pt([x - 18 * s, y - 90 * s]) + 'Q' + pt([x, y - 94 * s]) + ' ' + pt([x + 18 * s, y - 90 * s]) + 'M' + pt([x - 12 * s, y - 100 * s]) + 'Q' + pt([x, y - 103 * s]) + ' ' + pt([x + 12 * s, y - 100 * s]), dk(ROOF, 0.3), 1 * s), 2 * s);
    if (o.broken) out += P('M' + pt([x + 4 * s, y - 104 * s]) + 'L' + pt([x + 12 * s, y - 98 * s]) + 'L' + pt([x + 9 * s, y - 92 * s]) + 'L' + pt([x + 15 * s, y - 86 * s]) + 'L' + pt([x + 4 * s, y - 88 * s]) + 'L' + pt([x + 1 * s, y - 96 * s]) + 'Z', '#1e1812', 1.2 * s) + limb('M' + pt([x + 5 * s, y - 100 * s]) + 'L' + pt([x + 11 * s, y - 90 * s]), '#4a3424', 1.2 * s) +
      L('M' + pt([x - 10 * s, y - 70 * s]) + 'L' + pt([x - 6 * s, y - 60 * s]) + 'L' + pt([x - 11 * s, y - 50 * s]) + 'L' + pt([x - 7 * s, y - 40 * s]), OL, 1.4 * s) + F('M' + pt([x + 6 * s, y - 40 * s]) + 'L' + pt([x + 14 * s, y - 38 * s]) + 'L' + pt([x + 12 * s, y - 28 * s]) + 'L' + pt([x + 5 * s, y - 30 * s]) + 'Z', '#2a1e16', 0.9);
    // sails
    var hx = x - 4 * s, hy = y - 90 * s, a0 = o.a0 == null ? -0.55 : o.a0, len0 = 64 * s, sail = o.sail || '#ece2c8';
    for (var k = 0; k < 4; k++) {
      // o.broken: per-sail length fraction (0 = gone, < 0.6 = bare snapped arm, else a torn sail)
      var lf = o.broken ? o.broken[k] : 1, len = len0 * lf;
      if (lf <= 0) continue;
      var a = a0 + k * PI / 2, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca, e = [hx + ca * len, hy + sa * len];
      if (lf < 0.6) {
        out += limb('M' + pt([hx, hy]) + 'L' + pt(e), '#6a4a30', 2.6 * s) + P(pd([[e[0] - px * 2.4 * s, e[1] - py * 2.4 * s], [e[0] + ca * 5 * s, e[1] + sa * 5 * s], [e[0] + ca * 2 * s + px * 1 * s, e[1] + sa * 2 * s + py * 1 * s], [e[0] + ca * 6 * s + px * 3 * s, e[1] + sa * 6 * s + py * 3 * s], [e[0] + px * 2.4 * s, e[1] + py * 2.4 * s]], true), '#6a4a30', 1 * s);
        continue;
      }
      var sd = 'M' + pt([hx + ca * 12 * s + px * 2 * s, hy + sa * 12 * s + py * 2 * s]) + 'L' + pt([e[0] + px * 2 * s, e[1] + py * 2 * s]) + 'L' + pt([e[0] + px * 13 * s, e[1] + py * 13 * s]) + 'L' + pt([hx + ca * 14 * s + px * 13 * s, hy + sa * 14 * s + py * 13 * s]) + 'Z';
      if (o.broken) {
        // ragged canvas: the outer end is torn away in a zigzag and a hole is punched through the middle
        var tA = len * 0.62, tB = len * 0.5;
        sd = 'M' + pt([hx + ca * 12 * s + px * 2 * s, hy + sa * 12 * s + py * 2 * s]) + 'L' + pt([hx + ca * tA + px * 2 * s, hy + sa * tA + py * 2 * s]) + 'L' + pt([hx + ca * (tB + 4 * s) + px * 6 * s, hy + sa * (tB + 4 * s) + py * 6 * s]) + 'L' + pt([hx + ca * (tA - 2 * s) + px * 9 * s, hy + sa * (tA - 2 * s) + py * 9 * s]) + 'L' + pt([hx + ca * tB + px * 13 * s, hy + sa * tB + py * 13 * s]) + 'L' + pt([hx + ca * 14 * s + px * 13 * s, hy + sa * 14 * s + py * 13 * s]) + 'Z';
      }
      out += P(sd, c.cel(sail), 1.4 * s);
      if (o.broken) out += F(pd([[hx + ca * 22 * s + px * 5 * s, hy + sa * 22 * s + py * 5 * s], [hx + ca * 30 * s + px * 4 * s, hy + sa * 30 * s + py * 4 * s], [hx + ca * 28 * s + px * 10 * s, hy + sa * 28 * s + py * 10 * s], [hx + ca * 21 * s + px * 9 * s, hy + sa * 21 * s + py * 9 * s]], true), '#2a2420', 0.85);
      var lat = '';
      for (var j = 1; j < 6; j++) { var t = 12 * s + (len - 12 * s) * j / 6; lat += 'M' + pt([hx + ca * t + px * 2 * s, hy + sa * t + py * 2 * s]) + 'L' + pt([hx + ca * t + px * 13 * s, hy + sa * t + py * 13 * s]); }
      lat += 'M' + pt([hx + ca * 12 * s + px * 13 * s, hy + sa * 12 * s + py * 13 * s]) + 'L' + pt([e[0] + px * 13 * s, e[1] + py * 13 * s]);
      out += L(lat, '#6a4a2e', 1.2 * s) + limb('M' + pt([hx, hy]) + 'L' + pt(e), '#7a5434', 2.6 * s);
    }
    out += C(hx, hy, 4.4 * s, c.cel('#5a3a24'), 1.6 * s);
    return out;
  }
  // scarecrow on a post: patched shirt, sack head, floppy hat, straw
  function scarecrow(c, x, y, s) {
    var o = E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.22), straw = '#ecc85a';
    o += limb('M' + pt([x, y]) + 'L' + pt([x, y - 52 * s]), '#7a5434', 3 * s) + limb('M' + pt([x - 22 * s, y - 38 * s]) + 'L' + pt([x + 22 * s, y - 38 * s]), '#7a5434', 2.6 * s);
    // straw tufts at the sleeve ends
    [-1, 1].forEach(function (k) { o += P('M' + pt([x + k * 20 * s, y - 42 * s]) + 'L' + pt([x + k * 30 * s, y - 44 * s]) + 'L' + pt([x + k * 26 * s, y - 38 * s]) + 'L' + pt([x + k * 31 * s, y - 34 * s]) + 'L' + pt([x + k * 20 * s, y - 34 * s]) + 'Z', c.cel(straw), 1.2 * s); });
    var sh = 'M' + pt([x - 21 * s, y - 42 * s]) + 'L' + pt([x + 21 * s, y - 42 * s]) + 'L' + pt([x + 21 * s, y - 34 * s]) + 'L' + pt([x + 9 * s, y - 34 * s]) + 'L' + pt([x + 10 * s, y - 16 * s]) + 'L' + pt([x + 4 * s, y - 19 * s]) + 'L' + pt([x, y - 14 * s]) + 'L' + pt([x - 4 * s, y - 19 * s]) + 'L' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x - 9 * s, y - 34 * s]) + 'L' + pt([x - 21 * s, y - 34 * s]) + 'Z';
    o += body(c, sh, '#6a7a9a', R(x - 2 * s, y - 36 * s, 8 * s, 8 * s, '#a86a4a', 0) + L('M' + pt([x - 2 * s, y - 36 * s]) + 'l' + n(8 * s) + ',0 l0,' + n(8 * s), '#e8dcc0', 0.8 * s) + F('M' + pt([x + 4 * s, y - 44 * s]) + 'L' + pt([x + 24 * s, y - 44 * s]) + 'L' + pt([x + 24 * s, y - 12 * s]) + 'L' + pt([x + 4 * s, y - 12 * s]) + 'Z', '#3a4a6a', 0.45), 1.6 * s);
    o += P('M' + pt([x - 3 * s, y - 18 * s]) + 'L' + pt([x - 1 * s, y - 10 * s]) + 'L' + pt([x + 2 * s, y - 17 * s]) + 'Z', straw, 1 * s);
    // sack head
    o += C(x, y - 50 * s, 8 * s, c.cel('#d8b87a'), 1.6 * s) + L('M' + pt([x - 5 * s, y - 43 * s]) + 'L' + pt([x + 5 * s, y - 43 * s]), '#6a4a2a', 1.6 * s);
    o += L('M' + pt([x - 5 * s, y - 53 * s]) + 'l' + n(3 * s) + ',' + n(3 * s) + 'm' + n(-3 * s) + ',0 l' + n(3 * s) + ',' + n(-3 * s) + 'M' + pt([x + 1 * s, y - 53 * s]) + 'l' + n(3 * s) + ',' + n(3 * s) + 'm' + n(-3 * s) + ',0 l' + n(3 * s) + ',' + n(-3 * s) + 'M' + pt([x - 4 * s, y - 46 * s]) + 'l' + n(8 * s) + ',0', OL, 1 * s);
    // floppy hat
    o += P('M' + pt([x - 14 * s, y - 55 * s]) + 'Q' + pt([x, y - 59 * s]) + ' ' + pt([x + 14 * s, y - 54 * s]) + 'L' + pt([x + 12 * s, y - 57 * s]) + 'Q' + pt([x, y - 61 * s]) + ' ' + pt([x - 12 * s, y - 58 * s]) + 'Z', c.cel('#7a5a36'), 1.4 * s) +
      P('M' + pt([x - 7 * s, y - 57 * s]) + 'C' + pt([x - 7 * s, y - 68 * s]) + ' ' + pt([x + 7 * s, y - 69 * s]) + ' ' + pt([x + 7 * s, y - 57 * s]) + 'Z', c.cel('#7a5a36'), 1.4 * s);
    return o;
  }
  // stone watchtower of the Farmers' Watch
  function watchtower(c, x, y, s) {
    var st = '#b8ab90', o = E(x, y + 2, 34 * s, 5 * s, '#000', 0, 0.25);
    var bw = 22 * s, tw = 17 * s, h = 96 * s, top = y - h;
    var d = pd([[x - bw, y], [x - tw, top + 12 * s], [x + tw, top + 12 * s], [x + bw, y]], true);
    var sh = F('M' + pt([x + 4 * s, top]) + 'L' + pt([x + bw + 4, top]) + 'L' + pt([x + bw + 4, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', dk(st, 0.28), 0.85), jn = '';
    for (var j = 1; j < 10; j++) { var jy = y - j * 9 * s; jn += 'M' + pt([x - bw - 2, jy]) + 'L' + pt([x + bw + 2, jy]); for (var q = -2; q <= 2; q++) jn += 'M' + pt([x + (q * 9 + (j % 2 ? 4.5 : 0)) * s, jy]) + 'l0,' + n(9 * s); }
    sh += L(jn, dk(st, 0.32), 0.9 * s, 0.8);
    o += body(c, d, st, sh, 2 * s);
    // corbel band + parapet with merlons
    o += R(x - tw - 5 * s, top + 6 * s, (tw + 5 * s) * 2, 7 * s, c.cel(dk(st, 0.05)), 1.8 * s);
    for (var k = 0; k < 5; k++) o += R(x - tw - 5 * s + k * ((tw + 5 * s) * 2 - 6 * s) / 4, top - 3 * s, 6 * s, 10 * s, c.cel(st), 1.6 * s);
    // flagpole + pennant
    o += limb('M' + pt([x + 2 * s, top - 2 * s]) + 'L' + pt([x + 2 * s, top - 24 * s]), '#6a4a2a', 1.8 * s);
    o += P('M' + pt([x + 2 * s, top - 23 * s]) + 'Q' + pt([x + 14 * s, top - 22 * s]) + ' ' + pt([x + 26 * s, top - 16 * s]) + 'Q' + pt([x + 14 * s, top - 15 * s]) + ' ' + pt([x + 2 * s, top - 11 * s]) + 'Z', c.cel(SW_BLUE), 1.4 * s) + L('M' + pt([x + 4 * s, top - 17 * s]) + 'Q' + pt([x + 14 * s, top - 18 * s]) + ' ' + pt([x + 22 * s, top - 16 * s]), SW_GOLD, 1.2 * s);
    // hanging banner on the face
    var bx = x - 7 * s, by = top + 13 * s, bwid = 14 * s, bh = 34 * s;
    o += P('M' + pt([bx - bwid / 2, by]) + 'L' + pt([bx + bwid / 2, by]) + 'L' + pt([bx + bwid / 2, by + bh]) + 'L' + pt([bx, by + bh - 6 * s]) + 'L' + pt([bx - bwid / 2, by + bh]) + 'Z', c.cel(SW_BLUE), 1.6 * s) +
      L('M' + pt([bx - bwid / 2 + 2 * s, by + 2 * s]) + 'L' + pt([bx - bwid / 2 + 2 * s, by + bh - 3 * s]) + 'M' + pt([bx + bwid / 2 - 2 * s, by + 2 * s]) + 'L' + pt([bx + bwid / 2 - 2 * s, by + bh - 3 * s]), SW_GOLD, 1 * s) + sunCrest(c, bx, by + 13 * s, 5 * s);
    // arrow slits + door
    o += R(x + 7 * s, top + 26 * s, 3 * s, 10 * s, '#1a1009') + R(x + 8 * s, top + 52 * s, 3 * s, 10 * s, '#1a1009');
    o += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 16 * s]) + 'Q' + pt([x, y - 24 * s]) + ' ' + pt([x + 8 * s, y - 16 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z', c.cel('#6a4428'), 1.8 * s) + L('M' + pt([x - 4 * s, y - 19 * s]) + 'L' + pt([x - 4 * s, y]) + 'M' + pt([x + 4 * s, y - 19 * s]) + 'L' + pt([x + 4 * s, y]), '#3a2414', 1 * s);
    return o;
  }
  // gold sun crest (a rayed disc) for Kingsmere banners
  function sunCrest(c, x, y, r) {
    return P(star(x, y, 9, r, r * 0.72), SW_GOLD, Math.max(0.6, r * 0.18)) + C(x, y, r * 0.52, dk(SW_GOLD, 0.25)) + C(x - r * 0.18, y - r * 0.1, r * 0.12, OL) + C(x + r * 0.18, y - r * 0.1, r * 0.12, OL);
  }
  function banner(c, x, y, h, s) {
    var o = E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25), top = y - h;
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#6a4a2a', 2.2 * s) + limb('M' + pt([x - 9 * s, top + 3 * s]) + 'L' + pt([x + 9 * s, top + 3 * s]), '#6a4a2a', 1.8 * s) + C(x, top - 1 * s, 2 * s, SW_GOLD, 1 * s);
    var bw = 16 * s, bh = 30 * s, by = top + 4 * s;
    o += P('M' + pt([x - bw / 2, by]) + 'L' + pt([x + bw / 2, by]) + 'L' + pt([x + bw / 2 + 1 * s, by + bh]) + 'L' + pt([x, by + bh - 7 * s]) + 'L' + pt([x - bw / 2 - 1 * s, by + bh]) + 'Z', c.cel(SW_BLUE), 1.6 * s) +
      F('M' + pt([x + 2 * s, by]) + 'L' + pt([x + bw / 2, by]) + 'L' + pt([x + bw / 2 + 1 * s, by + bh]) + 'L' + pt([x + 2 * s, by + bh - 6 * s]) + 'Z', dk(SW_BLUE, 0.3), 0.6) +
      L('M' + pt([x - bw / 2, by + 4 * s]) + 'L' + pt([x + bw / 2, by + 4 * s]), SW_GOLD, 1.2 * s) + sunCrest(c, x, by + 14 * s, 5 * s);
    return o;
  }
  // canvas A-frame militia tent, blue trim
  function tent(c, x, y, s, col) {
    col = col || '#e6dcc2';
    var o = E(x + 8 * s, y + 2, 34 * s, 5 * s, '#000', 0, 0.24);
    // side roof receding right
    o += body(c, 'M' + pt([x, y - 36 * s]) + 'L' + pt([x + 30 * s, y - 32 * s]) + 'L' + pt([x + 50 * s, y - 2 * s]) + 'L' + pt([x + 24 * s, y]) + 'Z', dk(col, 0.12), F('M' + pt([x + 18 * s, y - 36 * s]) + 'L' + pt([x + 54 * s, y - 36 * s]) + 'L' + pt([x + 54 * s, y + 2]) + 'L' + pt([x + 34 * s, y + 2]) + 'Z', dk(col, 0.3), 0.6) + L('M' + pt([x + 8 * s, y - 24 * s]) + 'L' + pt([x + 38 * s, y - 20 * s]), dk(col, 0.3), 1 * s), 1.8 * s);
    // front face
    o += body(c, 'M' + pt([x - 26 * s, y]) + 'L' + pt([x, y - 38 * s]) + 'L' + pt([x + 24 * s, y]) + 'Z', col, R(x - 30 * s, y - 8 * s, 60 * s, 4 * s, SW_BLUE) + F('M' + pt([x + 2 * s, y - 40 * s]) + 'L' + pt([x + 26 * s, y + 2]) + 'L' + pt([x + 10 * s, y + 2]) + 'Z', dk(col, 0.2), 0.7), 1.8 * s);
    o += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 1 * s, y - 22 * s]) + 'L' + pt([x + 7 * s, y]) + 'Z', '#2a2018', 1.4 * s);
    o += L('M' + pt([x, y - 38 * s]) + 'L' + pt([x, y - 44 * s]), OL, 2.2 * s) + P('M' + pt([x, y - 44 * s]) + 'L' + pt([x + 9 * s, y - 42 * s]) + 'L' + pt([x, y - 40 * s]) + 'Z', SW_BLUE, 1 * s);
    o += L('M' + pt([x - 26 * s, y]) + 'L' + pt([x - 34 * s, y + 2]) + 'M' + pt([x + 24 * s, y]) + 'L' + pt([x + 30 * s, y + 3]), '#5a4a3a', 0.9 * s);
    return o;
  }
  // earthen hill with a mine mouth, timber frame and lanterns
  function mineHill(c, x, y, s) {
    var o = '', hc = '#a67a48';
    var hill = 'M' + pt([x - 130 * s, y + 4]) + 'C' + pt([x - 110 * s, y - 60 * s]) + ' ' + pt([x - 40 * s, y - 96 * s]) + ' ' + pt([x + 10 * s, y - 94 * s]) + 'C' + pt([x + 60 * s, y - 92 * s]) + ' ' + pt([x + 100 * s, y - 50 * s]) + ' ' + pt([x + 120 * s, y + 4]) + 'Z';
    var str = '';
    for (var i = 1; i < 5; i++) str += 'M' + pt([x - 130 * s, y - i * 18 * s]) + 'Q' + pt([x, y - i * 18 * s + 8]) + ' ' + pt([x + 130 * s, y - i * 18 * s - 4]);
    o += body(c, hill, hc, F('M' + pt([x + 26 * s, y - 96 * s]) + 'C' + pt([x + 76 * s, y - 80 * s]) + ' ' + pt([x + 104 * s, y - 44 * s]) + ' ' + pt([x + 124 * s, y + 6]) + 'L' + pt([x + 50 * s, y + 6]) + 'Z', dk(hc, 0.28), 0.8) + L(str, dk(hc, 0.22), 1.6, 0.6) +
      F('M' + pt([x - 118 * s, y - 40 * s]) + 'C' + pt([x - 80 * s, y - 92 * s]) + ' ' + pt([x + 30 * s, y - 104 * s]) + ' ' + pt([x + 80 * s, y - 70 * s]) + 'L' + pt([x + 90 * s, y - 62 * s]) + 'C' + pt([x + 40 * s, y - 88 * s]) + ' ' + pt([x - 50 * s, y - 86 * s]) + ' ' + pt([x - 106 * s, y - 32 * s]) + 'Z', '#c8a456', 0.9) +
      pebbles(9, y - 50 * s, y, '#6a4a2a', 14, x - 110 * s, x + 110 * s), 2.2);
    o += grass(19, y - 90 * s, y - 60 * s, '#8a6a2a', 30, 0.6, 1, 1, x - 90 * s, x + 70 * s);
    // mouth
    o += P('M' + pt([x - 20 * s, y + 2]) + 'L' + pt([x - 20 * s, y - 34 * s]) + 'Q' + pt([x, y - 46 * s]) + ' ' + pt([x + 20 * s, y - 34 * s]) + 'L' + pt([x + 20 * s, y + 2]) + 'Z', c.lg([[0, '#0e0806'], [1, '#2a1a10']]), 2);
    o += C(x, y - 10 * s, 10 * s, glow(c, '#ffb040', 0.35));
    o += limb('M' + pt([x - 22 * s, y + 2]) + 'L' + pt([x - 22 * s, y - 40 * s]), WOOD, 5 * s) + limb('M' + pt([x + 22 * s, y + 2]) + 'L' + pt([x + 22 * s, y - 40 * s]), WOOD, 5 * s) + limb('M' + pt([x - 29 * s, y - 40 * s]) + 'L' + pt([x + 29 * s, y - 40 * s]), '#7a4e2a', 5.5 * s);
    o += L('M' + pt([x - 26 * s, y - 22 * s]) + 'L' + pt([x - 18 * s, y - 38 * s]) + 'M' + pt([x + 26 * s, y - 22 * s]) + 'L' + pt([x + 18 * s, y - 38 * s]), dk(WOOD, 0.3), 2 * s);
    o += hangLantern(c, x - 28 * s, y - 34 * s, s) + hangLantern(c, x + 28 * s, y - 34 * s, s);
    return o;
  }
  function hangLantern(c, x, y, s) {
    return C(x, y + 6 * s, 12 * s, glow(c, '#ffc040', 0.6)) + L('M' + pt([x, y - 4 * s]) + 'L' + pt([x, y + 1 * s]), OL, 1.2 * s) + R(x - 3 * s, y + 1 * s, 6 * s, 8 * s, '#ffd060', 1.2 * s) + R(x - 3.6 * s, y, 7.2 * s, 2 * s, '#4a3a2a', 1 * s);
  }
  function lanternPost(c, x, y, h, s) {
    var top = y - h;
    return E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25) + limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#6a4a2a', 2.6 * s) + limb('M' + pt([x, top + 2 * s]) + 'L' + pt([x - 10 * s, top + 2 * s]), '#6a4a2a', 2 * s) + hangLantern(c, x - 9 * s, top + 6 * s, s);
  }
  function rails(x0, y0, x1, y1, w0, w1) {
    var d = 'M' + pt([x0 - w0, y0]) + 'L' + pt([x1 - w1, y1]) + 'M' + pt([x0 + w0, y0]) + 'L' + pt([x1 + w1, y1]), ties = '';
    for (var i = 0; i <= 8; i++) { var t = i / 8, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, w = (w0 + (w1 - w0) * t) * 1.4; ties += 'M' + pt([x - w, y]) + 'L' + pt([x + w, y]); }
    return L(ties, '#5a3a22', 3) + L(d, OL, 3) + L(d, '#8a8680', 1.4);
  }
  function minecart(c, x, y, s) {
    var d = 'M' + pt([x - 16 * s, y - 20 * s]) + 'L' + pt([x + 16 * s, y - 20 * s]) + 'L' + pt([x + 12 * s, y - 4 * s]) + 'L' + pt([x - 12 * s, y - 4 * s]) + 'Z';
    var o = E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.25);
    [[x - 6 * s, y - 22 * s, 6], [x + 4 * s, y - 23 * s, 7], [x + 10 * s, y - 21 * s, 5]].forEach(function (g) { o += C(g[0], g[1], g[2] * s, c.cel('#7a7068'), 1.4 * s); });
    o += C(x + 2 * s, y - 24 * s, 2 * s, '#e0b848');
    o += body(c, d, '#6a625a', L('M' + pt([x - 14 * s, y - 14 * s]) + 'L' + pt([x + 14 * s, y - 14 * s]), '#4a4440', 1.4 * s), 1.8 * s);
    o += C(x - 8 * s, y - 3 * s, 3.6 * s, c.cel('#4a4440'), 1.4 * s) + C(x + 8 * s, y - 3 * s, 3.6 * s, c.cel('#4a4440'), 1.4 * s);
    return o;
  }
  // plank shack with a grey cloth door (Grey Hood hideout)
  function shack(c, x, y, s) {
    var wd = '#8a6a48', o = E(x, y + 2, 30 * s, 4 * s, '#000', 0, 0.24);
    var d = 'M' + pt([x - 24 * s, y]) + 'L' + pt([x - 24 * s, y - 26 * s]) + 'L' + pt([x + 24 * s, y - 30 * s]) + 'L' + pt([x + 24 * s, y]) + 'Z', pl = '';
    for (var i = -2; i <= 2; i++) pl += 'M' + pt([x + i * 9 * s, y - 32 * s]) + 'L' + pt([x + i * 9 * s + (i % 2) * 1, y]);
    o += body(c, d, wd, L(pl, dk(wd, 0.35), 1 * s) + F('M' + pt([x + 8 * s, y - 34 * s]) + 'L' + pt([x + 28 * s, y - 34 * s]) + 'L' + pt([x + 28 * s, y + 2]) + 'L' + pt([x + 8 * s, y + 2]) + 'Z', dk(wd, 0.3), 0.7), 1.8 * s);
    o += P('M' + pt([x - 30 * s, y - 24 * s]) + 'L' + pt([x + 30 * s, y - 32 * s]) + 'L' + pt([x + 28 * s, y - 36 * s]) + 'L' + pt([x - 28 * s, y - 29 * s]) + 'Z', c.cel('#5a4a3a'), 1.6 * s);
    o += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 18 * s]) + 'L' + pt([x + 6 * s, y - 19 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#1e140e', 1.4 * s) + P('M' + pt([x - 8 * s, y - 18 * s]) + 'L' + pt([x + 6 * s, y - 19 * s]) + 'L' + pt([x + 5 * s, y - 6 * s]) + 'L' + pt([x + 1 * s, y - 9 * s]) + 'L' + pt([x - 3 * s, y - 4 * s]) + 'L' + pt([x - 8 * s, y - 8 * s]) + 'Z', c.cel(DEF_RED), 1.2 * s);
    return o;
  }
  // coast pieces
  function sea(c, yH, yS, seed) {
    var o = R(-2, yH, 404, yS - yH + 10, c.lg([[0, '#9ab4c4'], [0.35, SEA], [1, '#4e6e88']]));
    var r = rng(seed || 3), d = '';
    for (var i = 0; i < 26; i++) { var y = yH + 3 + r() * (yS - yH - 4), x = r() * 400, w = 6 + (y - yH) * 0.5; d += 'M' + pt([x, y]) + 'q' + n(w * 0.5) + ',' + n(-1.5) + ' ' + n(w) + ',0'; }
    o += L(d, '#dce8ee', 1, 0.55);
    o += E(110, yH + 4, 90, 2, '#fff4d8', 0, 0.35);
    return o;
  }
  function surf(c, pts, seed) {
    var d = 'M' + pt(pts[0]);
    for (var i = 1; i < pts.length; i++) d += 'L' + pt(pts[i]);
    var r = rng(seed || 7), foam = '';
    pts.forEach(function (p, i) { if (i && r() > 0.3) foam += E(p[0] - 4, p[1] - 1, 5 + r() * 5, 1.4, '#ffffff', 0, 0.8); });
    return L(d, '#f4f8f8', 4, 0.85) + L(d, '#ffffff', 1.6) + foam;
  }
  function driftwood(c, x, y, s, ang) {
    var col = '#bcae90', d = 'M' + pt([x - 22 * s, y]) + 'L' + pt([x + 22 * s, y - 3 * s]);
    return E(x, y + 2, 24 * s, 2.6 * s, '#000', 0, 0.2) + G(limb(d, col, 5 * s) + limb('M' + pt([x + 8 * s, y - 2 * s]) + 'L' + pt([x + 16 * s, y - 10 * s]), col, 2.4 * s) + limb('M' + pt([x - 10 * s, y]) + 'L' + pt([x - 18 * s, y - 7 * s]), col, 2 * s) + L('M' + pt([x - 16 * s, y - 1 * s]) + 'L' + pt([x + 14 * s, y - 3 * s]), dk(col, 0.3), 1 * s, 0.8), rot(ang || 0, x, y));
  }
  function shell(x, y, s, col) {
    col = col || '#f0d8c8';
    return P('M' + pt([x, y]) + 'L' + pt([x - 4 * s, y - 4 * s]) + 'Q' + pt([x, y - 7 * s]) + ' ' + pt([x + 4 * s, y - 4 * s]) + 'Z', col, 1 * s) + L('M' + pt([x, y]) + 'L' + pt([x - 2 * s, y - 5 * s]) + 'M' + pt([x, y]) + 'L' + pt([x + 2 * s, y - 5 * s]), dk(col, 0.3), 0.6 * s);
  }
  function seaweed(x, y, s) {
    return L('M' + pt([x - 8 * s, y]) + 'q' + n(4 * s) + ',' + n(-3 * s) + ' ' + n(8 * s) + ',0 t' + n(8 * s) + ',0', '#4a6a2a', 2 * s, 0.9) + L('M' + pt([x - 4 * s, y + 1]) + 'q' + n(3 * s) + ',' + n(-2 * s) + ' ' + n(7 * s) + ',' + n(-1 * s), '#6a8a3a', 1.4 * s, 0.9);
  }
  // murloc hut: tall reed-and-kelp cone with sticks and a hide flap
  function murlocHut(c, x, y, s, col) {
    col = col || '#9a8660';
    var o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.24);
    o += limb('M' + pt([x - 3 * s, y - 54 * s]) + 'L' + pt([x - 12 * s, y - 68 * s]), '#6a5a44', 1.8 * s) + limb('M' + pt([x + 3 * s, y - 54 * s]) + 'L' + pt([x + 10 * s, y - 70 * s]), '#6a5a44', 1.8 * s) + limb('M' + pt([x, y - 54 * s]) + 'L' + pt([x + 1 * s, y - 72 * s]), '#6a5a44', 1.6 * s);
    var d = 'M' + pt([x - 24 * s, y]) + 'C' + pt([x - 24 * s, y - 24 * s]) + ' ' + pt([x - 12 * s, y - 50 * s]) + ' ' + pt([x - 3 * s, y - 58 * s]) + 'L' + pt([x + 3 * s, y - 58 * s]) + 'C' + pt([x + 12 * s, y - 50 * s]) + ' ' + pt([x + 24 * s, y - 24 * s]) + ' ' + pt([x + 24 * s, y]) + 'Z';
    var reeds = '';
    for (var i = -4; i <= 4; i++) reeds += 'M' + pt([x + i * 5.4 * s, y]) + 'Q' + pt([x + i * 4 * s, y - 30 * s]) + ' ' + pt([x + i * 0.6 * s, y - 56 * s]);
    var bands = 'M' + pt([x - 22 * s, y - 16 * s]) + 'Q' + pt([x, y - 12 * s]) + ' ' + pt([x + 22 * s, y - 16 * s]) + 'M' + pt([x - 16 * s, y - 36 * s]) + 'Q' + pt([x, y - 32 * s]) + ' ' + pt([x + 16 * s, y - 36 * s]);
    o += body(c, d, col, L(reeds, dk(col, 0.3), 1 * s) + L(bands, '#5a6a2e', 2.4 * s) + F('M' + pt([x + 6 * s, y - 60 * s]) + 'C' + pt([x + 16 * s, y - 46 * s]) + ' ' + pt([x + 26 * s, y - 24 * s]) + ' ' + pt([x + 26 * s, y + 2]) + 'L' + pt([x + 10 * s, y + 2]) + 'C' + pt([x + 12 * s, y - 24 * s]) + ' ' + pt([x + 10 * s, y - 44 * s]) + ' ' + pt([x + 6 * s, y - 60 * s]) + 'Z', dk(col, 0.25), 0.8), 1.8 * s);
    // kelp drape
    o += P('M' + pt([x - 14 * s, y - 40 * s]) + 'Q' + pt([x - 4 * s, y - 36 * s]) + ' ' + pt([x + 6 * s, y - 42 * s]) + 'L' + pt([x + 4 * s, y - 30 * s]) + 'L' + pt([x, y - 34 * s]) + 'L' + pt([x - 6 * s, y - 28 * s]) + 'L' + pt([x - 8 * s, y - 34 * s]) + 'L' + pt([x - 14 * s, y - 30 * s]) + 'Z', c.cel('#5a7a34'), 1.2 * s);
    // door
    o += P('M' + pt([x - 8 * s, y + 1]) + 'L' + pt([x - 8 * s, y - 12 * s]) + 'Q' + pt([x, y - 22 * s]) + ' ' + pt([x + 8 * s, y - 12 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'Z', '#20180e', 1.6 * s);
    o += P('M' + pt([x + 2 * s, y - 18 * s]) + 'Q' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 8 * s, y + 1]) + 'L' + pt([x + 3 * s, y + 1]) + 'Q' + pt([x + 4 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 18 * s]) + 'Z', c.cel('#b89a70'), 1.2 * s);
    return o;
  }
  function fishRack(c, x, y, s) {
    var o = E(x, y + 1, 16 * s, 2 * s, '#000', 0, 0.2);
    o += limb('M' + pt([x - 12 * s, y]) + 'L' + pt([x - 10 * s, y - 26 * s]), '#7a6a4e', 2 * s) + limb('M' + pt([x + 12 * s, y]) + 'L' + pt([x + 10 * s, y - 26 * s]), '#7a6a4e', 2 * s) + limb('M' + pt([x - 14 * s, y - 24 * s]) + 'L' + pt([x + 14 * s, y - 24 * s]), '#7a6a4e', 1.8 * s);
    [-6, 2].forEach(function (k, i) {
      var fx = x + k * s, fy = y - 22 * s;
      o += L('M' + pt([fx, fy]) + 'l0,' + n(3 * s), OL, 0.8 * s) + P('M' + pt([fx, fy + 3 * s]) + 'C' + pt([fx - 3.5 * s, fy + 6 * s]) + ' ' + pt([fx - 3 * s, fy + 12 * s]) + ' ' + pt([fx, fy + 14 * s]) + 'C' + pt([fx + 3 * s, fy + 12 * s]) + ' ' + pt([fx + 3.5 * s, fy + 6 * s]) + ' ' + pt([fx, fy + 3 * s]) + 'Z', c.cel(i ? '#8aa0b0' : '#c8a070'), 1 * s) + P('M' + pt([fx, fy + 14 * s]) + 'L' + pt([fx - 3 * s, fy + 18 * s]) + 'L' + pt([fx + 3 * s, fy + 18 * s]) + 'Z', i ? '#8aa0b0' : '#c8a070', 0.9 * s);
    });
    return o;
  }
  // wrecked boat lying on its side, ribs showing, broken mast with a torn sail
  function wreck(c, x, y, s) {
    var wd = '#7a5a3e', o = E(x, y + 3, 60 * s, 6 * s, '#000', 0, 0.26);
    // broken mast and sail behind
    o += limb('M' + pt([x + 6 * s, y - 20 * s]) + 'L' + pt([x + 36 * s, y - 76 * s]), '#6a4a30', 3.2 * s);
    o += P('M' + pt([x + 30 * s, y - 64 * s]) + 'L' + pt([x + 56 * s, y - 50 * s]) + 'L' + pt([x + 50 * s, y - 40 * s]) + 'L' + pt([x + 46 * s, y - 44 * s]) + 'L' + pt([x + 42 * s, y - 32 * s]) + 'L' + pt([x + 36 * s, y - 38 * s]) + 'L' + pt([x + 22 * s, y - 44 * s]) + 'Z', c.cel('#d8ccb0'), 1.4 * s) + L('M' + pt([x + 30 * s, y - 56 * s]) + 'L' + pt([x + 46 * s, y - 46 * s]), '#9a8a70', 1 * s);
    var hull = 'M' + pt([x - 56 * s, y - 24 * s]) + 'C' + pt([x - 44 * s, y - 4 * s]) + ' ' + pt([x - 10 * s, y + 4]) + ' ' + pt([x + 26 * s, y]) + 'C' + pt([x + 40 * s, y - 4 * s]) + ' ' + pt([x + 50 * s, y - 16 * s]) + ' ' + pt([x + 54 * s, y - 30 * s]) + 'C' + pt([x + 30 * s, y - 26 * s]) + ' ' + pt([x - 10 * s, y - 24 * s]) + ' ' + pt([x - 56 * s, y - 24 * s]) + 'Z';
    var pl = '';
    for (var i = 1; i < 4; i++) pl += 'M' + pt([x - 54 * s + i * 4 * s, y - 24 * s + i * 6 * s]) + 'C' + pt([x - 30 * s, y - 20 * s + i * 7 * s]) + ' ' + pt([x + 10 * s, y - 20 * s + i * 6 * s]) + ' ' + pt([x + 50 * s - i * 3 * s, y - 28 * s + i * 7 * s]);
    var hole = 'M' + pt([x - 16 * s, y - 20 * s]) + 'L' + pt([x - 2 * s, y - 22 * s]) + 'L' + pt([x + 6 * s, y - 12 * s]) + 'L' + pt([x - 4 * s, y - 4 * s]) + 'L' + pt([x - 14 * s, y - 8 * s]) + 'Z';
    o += body(c, hull, wd, L(pl, dk(wd, 0.35), 1.2 * s) + F('M' + pt([x - 60 * s, y - 8 * s]) + 'L' + pt([x + 60 * s, y - 12 * s]) + 'L' + pt([x + 60 * s, y + 6]) + 'L' + pt([x - 60 * s, y + 6]) + 'Z', dk(wd, 0.3), 0.7) + F(hole, '#1a120c') + L('M' + pt([x - 12 * s, y - 20 * s]) + 'L' + pt([x - 10 * s, y - 6 * s]) + 'M' + pt([x - 4 * s, y - 21 * s]) + 'L' + pt([x - 3 * s, y - 5 * s]), '#8a6a4a', 2 * s) + E(x + 36 * s, y - 14 * s, 8 * s, 4 * s, '#4a6a3a', 0, 0.5), 2 * s);
    // gunwale rim
    o += limb('M' + pt([x - 56 * s, y - 24 * s]) + 'C' + pt([x - 10 * s, y - 24 * s]) + ' ' + pt([x + 30 * s, y - 26 * s]) + ' ' + pt([x + 54 * s, y - 30 * s]), '#9a7650', 2.4 * s);
    // exposed ribs sticking up from the far side
    for (var k = 0; k < 4; k++) { var rx = x - 40 * s + k * 16 * s; o += limb('M' + pt([rx, y - 24 * s]) + 'Q' + pt([rx + 2 * s, y - 36 * s]) + ' ' + pt([rx + 8 * s, y - 42 * s + (k % 2) * 4 * s]), '#8a6a48', 2 * s); }
    return o;
  }
  // flat footprints of a harvest golem (three splayed iron toes)
  function golemPrint(x, y, s, ang) {
    return G(E(x, y, 5 * s, 2.2 * s, '#5a3a1a', 0, 0.45) + L('M' + pt([x - 4 * s, y - 1 * s]) + 'l' + n(-4 * s) + ',' + n(-2 * s) + 'M' + pt([x - 4 * s, y]) + 'l' + n(-5 * s) + ',0 M' + pt([x - 4 * s, y + 1 * s]) + 'l' + n(-4 * s) + ',' + n(2 * s), '#5a3a1a', 1.4 * s, 0.5), rot(ang || 0, x, y));
  }

  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  // Tallgrass lean-to: crossed poles, ragged hide, skull on top
  function gnollTent(c, x, y, s, hide, bare) {
    hide = hide || '#9a7a52';
    var o = E(x, y + 1, 30 * s, 5 * s, '#000', 0, 0.22);
    o += limb('M' + pt([x - 26 * s, y]) + 'L' + pt([x + 8 * s, y - 50 * s]), '#6a4a2a', 2.6 * s) + limb('M' + pt([x + 26 * s, y]) + 'L' + pt([x - 8 * s, y - 50 * s]), '#6a4a2a', 2.6 * s);
    var d = 'M' + pt([x - 2 * s, y - 42 * s]) + 'L' + pt([x + 3 * s, y - 42 * s]) + 'L' + pt([x + 24 * s, y - 2 * s]) + 'L' + pt([x + 18 * s, y + 1]) + 'L' + pt([x + 14 * s, y - 4 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'L' + pt([x + 3 * s, y - 16 * s]) + 'L' + pt([x - 4 * s, y - 16 * s]) + 'L' + pt([x - 9 * s, y + 1]) + 'L' + pt([x - 14 * s, y - 5 * s]) + 'L' + pt([x - 19 * s, y + 1]) + 'L' + pt([x - 24 * s, y - 3 * s]) + 'Z';
    o += body(c, d, hide, E(x - 10 * s, y - 20 * s, 5 * s, 4 * s, dk(hide, 0.2), 0, 0.8) + E(x + 12 * s, y - 14 * s, 4 * s, 3 * s, dk(hide, 0.2), 0, 0.8) + F('M' + pt([x + 1 * s, y - 44 * s]) + 'L' + pt([x + 28 * s, y - 44 * s]) + 'L' + pt([x + 28 * s, y + 2]) + 'L' + pt([x + 10 * s, y + 2]) + 'Z', dk(hide, 0.28), 0.8) +
      L('M' + pt([x - 12 * s, y - 24 * s]) + 'l3,2 M' + pt([x + 8 * s, y - 30 * s]) + 'l-2,3', dk(hide, 0.45), 1.2 * s), 1.8 * s);
    o += F('M' + pt([x - 4 * s, y - 16 * s]) + 'L' + pt([x + 3 * s, y - 16 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'L' + pt([x - 9 * s, y + 1]) + 'Z', '#2a1a10');
    if (!bare) o += skull(c, x, y - 52 * s, 0.9 * s);
    return o;
  }
  // bare dead tree, forked limbs
  function deadTree(c, x, y, s, col) {
    col = col || '#6e5a48';
    var o = E(x, y + 2, 20 * s, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt([x - 2 * s, y - 44 * s]) + 'L' + pt([x - 18 * s, y - 62 * s]) + 'L' + pt([x - 28 * s, y - 62 * s]), col, 3 * s) + limb('M' + pt([x - 14 * s, y - 58 * s]) + 'L' + pt([x - 14 * s, y - 72 * s]), col, 2 * s);
    o += limb('M' + pt([x + 2 * s, y - 46 * s]) + 'L' + pt([x + 12 * s, y - 70 * s]) + 'L' + pt([x + 20 * s, y - 76 * s]), col, 3 * s) + limb('M' + pt([x + 10 * s, y - 64 * s]) + 'L' + pt([x + 2 * s, y - 78 * s]), col, 1.8 * s);
    o += limb('M' + pt([x + 2 * s, y - 28 * s]) + 'L' + pt([x + 20 * s, y - 38 * s]) + 'L' + pt([x + 26 * s, y - 48 * s]), col, 2.6 * s) + limb('M' + pt([x - 3 * s, y - 22 * s]) + 'L' + pt([x - 14 * s, y - 30 * s]), col, 2 * s);
    var tr = 'M' + pt([x - 6 * s, y]) + 'C' + pt([x - 3 * s, y - 18 * s]) + ' ' + pt([x - 6 * s, y - 34 * s]) + ' ' + pt([x - 2 * s, y - 48 * s]) + 'L' + pt([x + 3 * s, y - 48 * s]) + 'C' + pt([x + 4 * s, y - 32 * s]) + ' ' + pt([x + 7 * s, y - 16 * s]) + ' ' + pt([x + 8 * s, y]) + 'Z';
    o += body(c, tr, col, F('M' + pt([x + 1 * s, y - 50 * s]) + 'L' + pt([x + 10 * s, y - 50 * s]) + 'L' + pt([x + 10 * s, y + 2]) + 'L' + pt([x + 2 * s, y + 2]) + 'Z', dk(col, 0.3), 0.8) + L('M' + pt([x - 2 * s, y - 10 * s]) + 'l1,' + n(-10 * s), dk(col, 0.4), 1 * s), 1.8 * s);
    return o;
  }
  function pike(c, x, y, h, s) { return limb('M' + pt([x, y]) + 'L' + pt([x, y - h]), '#6a4a2a', 2.2 * s) + skull(c, x, y - h - 3 * s, 0.9 * s); }

  // ---- Gull Point Quarry / Fenwick / the Rustfield pieces ----
  var QSTONE = '#bca47a', RUST = '#9a5430', ASH = '#4a423c';
  // cut stone block with a lit top face
  function stoneBlock(c, x, y, w, h, col, noShadow) {
    col = col || QSTONE;
    var d = pd([[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], true);
    return (noShadow ? '' : E(x, y + 1, w * 0.62, 2.4, '#000', 0, 0.22)) + body(c, d, col, R(x - w / 2 - 1, y - h - 1, w + 2, h * 0.3, lt(col, 0.25)) + F(pd([[x + w * 0.2, y - h - 2], [x + w / 2 + 2, y - h - 2], [x + w / 2 + 2, y + 2], [x + w * 0.2, y + 2]], true), dk(col, 0.28), 0.8) +
      L('M' + pt([x - w * 0.32, y - h * 0.45]) + 'l' + n(w * 0.22) + ',' + n(h * 0.12), dk(col, 0.35), 1, 0.8), 1.6);
  }
  // one terrace of the quarry wall: lit top lip, cut vertical face with strata and drill marks
  function ledge(c, x0, x1, y, h, col, seed) {
    col = col || QSTONE;
    var r = rng(seed || 3), d = pd([[x0, y + h], [x0 + 8, y], [x1, y - 2], [x1, y + h]], true), marks = '';
    for (var i = 0; i < (x1 - x0 - 20) / 13; i++) { var mx = x0 + 18 + i * 13 + r() * 5, my = y + 7 + r() * 3; marks += 'M' + pt([mx, my]) + 'l0,' + n(h * (0.35 + r() * 0.35)) + 'M' + pt([mx + 3, my + 2]) + 'l0,' + n(h * (0.25 + r() * 0.3)); }
    var strata = 'M' + pt([x0 + 5, y + h * 0.48]) + 'L' + pt([x1 + 2, y + h * 0.44]) + 'M' + pt([x0 + 2, y + h * 0.78]) + 'L' + pt([x1 + 2, y + h * 0.75]);
    var shade = F(pd([[x0 + 8, y], [x1 + 2, y - 2], [x1 + 2, y + 4], [x0 + 6, y + 5]], true), lt(col, 0.3)) +
      F(pd([[x0 + 4, y + 5], [x1 + 2, y + 4], [x1 + 2, y + 11], [x0 + 3, y + 11]], true), dk(col, 0.32), 0.55) +
      L(strata, dk(col, 0.25), 1.2, 0.75) + L(marks, dk(col, 0.38), 1, 0.6) +
      F(pd([[x0 - 2, y + h * 0.4], [x0 + 12, y + 4], [x0 + 16, y + h + 2], [x0 - 2, y + h + 2]], true), lt(col, 0.12), 0.7) +
      F(pd([[x1 - 70, y - 4], [x1 + 4, y - 4], [x1 + 4, y + h + 2], [x1 - 40, y + h + 2]], true), dk(col, 0.2), 0.55);
    return body(c, d, col, shade, 2) + pebbles(seed || 3, y - 1, y + 2, dk(col, 0.3), 8, x0 + 12, x1);
  }
  // side-on mine track: two rails and slanted sleepers
  function sideTrack(x0, y0, x1, y1) {
    var ties = '', k = Math.round((x1 - x0) / 9);
    for (var i = 0; i <= k; i++) { var t = i / k, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; ties += 'M' + pt([x - 2, y + 4]) + 'L' + pt([x + 1, y - 1]); }
    var d = 'M' + pt([x0, y0]) + 'L' + pt([x1, y1]) + 'M' + pt([x0, y0 + 3]) + 'L' + pt([x1, y1 + 3]);
    return L(ties, OL, 4) + L(ties, '#6a4a2e', 2) + L(d, OL, 2.6) + L(d, '#9a9690', 1.1);
  }
  // wooden jib crane: A-frame mast, long boom (dir -1 = left), rope and a hanging load
  function crane(c, x, y, s, dir, drop, load) {
    dir = dir || -1;
    var top = [x, y - 52 * s], tip = [x + dir * 52 * s, y - 62 * s], back = [x - dir * 12 * s, y - 46 * s], o = E(x, y + 1, 14 * s, 2.4 * s, '#000', 0, 0.22);
    o += limb('M' + pt([x + 11 * s, y]) + 'L' + pt(top), dk(WOOD, 0.18), 3 * s) + limb('M' + pt([x - 11 * s, y]) + 'L' + pt(top), WOOD, 3 * s);
    o += limb('M' + pt([x - 7 * s, y - 18 * s]) + 'L' + pt([x + 7 * s, y - 18 * s]) + 'M' + pt([x - 4 * s, y - 34 * s]) + 'L' + pt([x + 4 * s, y - 34 * s]), '#7a5030', 2 * s);
    o += L('M' + pt([x, y - 60 * s]) + 'L' + pt(tip) + 'M' + pt([x, y - 60 * s]) + 'L' + pt(back), OL, 1.1 * s);
    o += limb('M' + pt(back) + 'L' + pt(tip), '#9a6a3a', 3.2 * s) + limb('M' + pt(top) + 'L' + pt([x, y - 62 * s]), WOOD, 2.4 * s);
    o += R(back[0] - 6 * s, back[1] - 1 * s, 12 * s, 9 * s, c.cel('#7a7268'), 1.4 * s) + C(x, y - 26 * s, 5 * s, c.cel('#6a4a2a'), 1.4 * s) + L('M' + pt([x - 5 * s, y - 26 * s]) + 'l' + n(10 * s) + ',0 M' + pt([x, y - 31 * s]) + 'l0,' + n(10 * s), '#3a2616', 1 * s);
    var ly = tip[1] + (drop || 30) * s;
    o += L('M' + pt(tip) + 'L' + pt([tip[0], ly - 9 * s]) + 'L' + pt([tip[0] - 6 * s, ly - 5 * s]) + 'M' + pt([tip[0], ly - 9 * s]) + 'L' + pt([tip[0] + 6 * s, ly - 5 * s]), OL, 1.2 * s);
    o += load === 'bucket' ? P(pd([[tip[0] - 7 * s, ly - 5 * s], [tip[0] + 7 * s, ly - 5 * s], [tip[0] + 5 * s, ly + 5 * s], [tip[0] - 5 * s, ly + 5 * s]], true), c.cel('#8a6a44'), 1.3 * s) + C(tip[0] - 2 * s, ly - 6 * s, 2.6 * s, c.cel('#9a8e7a'), 1 * s) + C(tip[0] + 3 * s, ly - 6 * s, 2.2 * s, c.cel('#a89a80'), 1 * s)
      : stoneBlock(c, tip[0], ly + 5 * s, 16 * s, 10 * s, null, true);
    o += C(tip[0], tip[1], 2.6 * s, c.cel('#5a5a5e'), 1 * s);
    return o;
  }
  // timber scaffold: posts, two plank decks, X-braces and a ladder
  function scaffold(c, x0, x1, y, h, s) {
    var posts = '', br = '', o = '', k = Math.max(2, Math.round((x1 - x0) / (20 * s)));
    for (var i = 0; i <= k; i++) { var px = x0 + (x1 - x0) * i / k; posts += 'M' + pt([px, y]) + 'L' + pt([px, y - h]); if (i < k) { var qx = x0 + (x1 - x0) * (i + 1) / k; br += 'M' + pt([px, y]) + 'L' + pt([qx, y - h / 2]) + 'M' + pt([qx, y]) + 'L' + pt([px, y - h / 2]); } }
    o += L(br, OL, 3.4 * s) + L(br, '#7a5434', 1.4 * s) + L(posts, OL, 4.6 * s) + L(posts, WOOD, 2.4 * s);
    [y - h / 2, y - h].forEach(function (py) { o += R(x0 - 4 * s, py - 1.5 * s, x1 - x0 + 8 * s, 3.4 * s, c.cel('#a47a4a'), 1.3 * s); });
    var lx = x0 + (x1 - x0) * 0.62, ld = 'M' + pt([lx, y]) + 'L' + pt([lx + 4 * s, y - h / 2]) + 'M' + pt([lx + 7 * s, y]) + 'L' + pt([lx + 11 * s, y - h / 2]), rungs = '';
    for (var j = 1; j < 5; j++) { var t = j / 5; rungs += 'M' + pt([lx + 4 * s * t, y - h / 2 * t]) + 'L' + pt([lx + 7 * s + 4 * s * t, y - h / 2 * t]); }
    return o + L(ld + rungs, OL, 3 * s) + L(ld + rungs, '#9a7048', 1.2 * s);
  }
  // Grey Hood banner: grey cloth, ragged hem, black crossed daggers
  function defBanner(c, x, y, h, s) {
    var o = E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25), top = y - h, bw = 16 * s, bh = 30 * s, by = top + 4 * s;
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#4a3424', 2.2 * s) + limb('M' + pt([x - 10 * s, top + 3 * s]) + 'L' + pt([x + 10 * s, top + 3 * s]), '#4a3424', 1.8 * s) + P(pd([[x - 2 * s, top], [x, top - 6 * s], [x + 2 * s, top]], true), '#8a8a90', 1 * s);
    o += P('M' + pt([x - bw / 2, by]) + 'L' + pt([x + bw / 2, by]) + 'L' + pt([x + bw / 2 + 1 * s, by + bh]) + 'L' + pt([x + 4 * s, by + bh - 5 * s]) + 'L' + pt([x + 1 * s, by + bh + 2 * s]) + 'L' + pt([x - 3 * s, by + bh - 6 * s]) + 'L' + pt([x - bw / 2 - 1 * s, by + bh - 1 * s]) + 'Z', c.cel(DEF_RED), 1.6 * s) +
      F('M' + pt([x + 3 * s, by]) + 'L' + pt([x + bw / 2, by]) + 'L' + pt([x + bw / 2 + 1 * s, by + bh]) + 'L' + pt([x + 4 * s, by + bh - 5 * s]) + 'Z', dk(DEF_RED, 0.32), 0.6) +
      L('M' + pt([x - 4.5 * s, by + 6 * s]) + 'L' + pt([x + 4.5 * s, by + 20 * s]) + 'M' + pt([x + 4.5 * s, by + 6 * s]) + 'L' + pt([x - 4.5 * s, by + 20 * s]), '#1e1210', 2.4 * s) +
      L('M' + pt([x - 5 * s, by + 15 * s]) + 'l' + n(3 * s) + ',' + n(-2 * s) + 'M' + pt([x + 5 * s, by + 15 * s]) + 'l' + n(-3 * s) + ',' + n(-2 * s), '#1e1210', 1.6 * s);
    return o;
  }
  // broken, burned Fenwick town hall: stone hall, charred timber storey, caved roof and a snapped bell tower
  function townHall(c, x, y, s) {
    var st = '#8e8676', pl = '#8a7a64', rf = '#4a3028', o = E(x, y + 2, 72 * s, 6 * s, '#000', 0, 0.28);
    var w = 58 * s, h1 = 30 * s, h2 = 24 * s, eave = y - h1 - h2, ridge = eave - 36 * s;
    // bell tower rising behind the ridge, top snapped off in a jagged break
    var tx = x - 6 * s, tw = 12 * s, tb = eave - 10 * s, tt = ridge - 34 * s;
    var tower = pd([[tx - tw, tb], [tx - tw, tt + 10 * s], [tx - tw + 6 * s, tt], [tx - 3 * s, tt + 9 * s], [tx + 3 * s, tt + 3 * s], [tx + tw, tt + 15 * s], [tx + tw, tb]], true), tj = '';
    for (var j = 1; j < 7; j++) tj += 'M' + pt([tx - tw, tb - j * 8 * s]) + 'L' + pt([tx + tw, tb - j * 8 * s]);
    o += body(c, tower, st, L(tj, dk(st, 0.3), 0.9 * s, 0.8) + F(pd([[tx + 3 * s, tt - 2], [tx + tw + 2, tt - 2], [tx + tw + 2, tb + 2], [tx + 3 * s, tb + 2]], true), dk(st, 0.3), 0.8) + E(tx - 4 * s, tt + 16 * s, 8 * s, 10 * s, '#2a2018', 0, 0.55), 2 * s);
    o += P('M' + pt([tx - 6 * s, tt + 38 * s]) + 'L' + pt([tx - 6 * s, tt + 26 * s]) + 'Q' + pt([tx, tt + 19 * s]) + ' ' + pt([tx + 6 * s, tt + 26 * s]) + 'L' + pt([tx + 6 * s, tt + 38 * s]) + 'Z', '#140e0a', 1.4 * s);
    // stone ground floor
    var joints = '';
    for (var k = 1; k < 3; k++) { var jy = y - h1 * k / 3; joints += 'M' + pt([x - w, jy]) + 'L' + pt([x + w, jy]); for (var q = -5; q <= 5; q++) joints += 'M' + pt([x + (q * 11 + (k % 2 ? 5 : 0)) * s, jy]) + 'l0,' + n(h1 / 3); }
    o += body(c, pd([[x - w, y], [x - w, y - h1], [x + w, y - h1], [x + w, y]], true), st, F(pd([[x + w * 0.5, y - h1 - 2], [x + w + 2, y - h1 - 2], [x + w + 2, y + 2], [x + w * 0.5, y + 2]], true), dk(st, 0.28), 0.75) + L(joints, dk(st, 0.3), 0.9 * s, 0.8) + E(x - w * 0.6, y - h1 * 0.4, 12 * s, 9 * s, '#2a2018', 0, 0.45), 2 * s);
    // charred timber upper storey with burnt-through gaps
    var up = pd([[x - w - 4 * s, y - h1], [x - w - 4 * s, eave], [x + w + 4 * s, eave], [x + w + 4 * s, y - h1]], true), bm = 'M' + pt([x - w - 4 * s, y - h1]) + 'L' + pt([x + w + 4 * s, y - h1]);
    for (var b = 0; b <= 6; b++) { var bx = x - w + b * w / 3; bm += 'M' + pt([bx, eave]) + 'L' + pt([bx, y - h1]); if (b < 6 && b % 2 === 0) bm += 'M' + pt([bx, y - h1]) + 'L' + pt([bx + w / 3, eave]); }
    o += body(c, up, pl, F(pd([[x + w * 0.5, eave - 2], [x + w + 6 * s, eave - 2], [x + w + 6 * s, y - h1 + 2], [x + w * 0.5, y - h1 + 2]], true), dk(pl, 0.3), 0.8) + L(bm, '#2e2018', 2.6 * s) +
      F(pd([[x + w * 0.1, eave], [x + w * 0.45, eave], [x + w * 0.38, eave + 12 * s], [x + w * 0.22, eave + 16 * s], [x + w * 0.12, eave + 8 * s]], true), '#140e0a') + E(x - w * 0.5, eave + 10 * s, 14 * s, 8 * s, '#2a2018', 0, 0.6), 2 * s);
    // wide roof, caved in on the right with bare burnt rafters
    var roof = pd([[x - w - 12 * s, eave + 2 * s], [x - 2 * s, ridge], [x + 2 * s, ridge], [x + w + 12 * s, eave + 2 * s]], true), rsh = F(pd([[x + 2 * s, ridge - 2], [x + w + 14 * s, eave + 4 * s], [x + 14 * s, eave + 4 * s]], true), dk(rf, 0.3), 0.8);
    for (var i = 1; i < 5; i++) rsh += L('M' + pt([x - w - 12 * s + i * 11 * s, eave + 2 * s - i * 7 * s]) + 'L' + pt([x + w + 12 * s - i * 11 * s, eave + 2 * s - i * 7 * s]), dk(rf, 0.3), 1 * s, 0.8);
    rsh += F(pd([[x + 10 * s, ridge + 8 * s], [x + 30 * s, ridge + 14 * s], [x + 44 * s, eave - 2 * s], [x + 26 * s, eave + 2 * s], [x + 14 * s, eave - 6 * s], [x + 4 * s, eave]], true), '#140e0a');
    o += body(c, roof, rf, rsh, 2.2 * s);
    for (var r2 = 0; r2 < 4; r2++) o += limb('M' + pt([x + 10 * s + r2 * 9 * s, eave]) + 'L' + pt([x + 14 * s + r2 * 8 * s, ridge + 10 * s + r2 * 5 * s]), '#3a2a1e', 1.4 * s);
    // arched doorway with a fallen door, dark windows with scorch above
    o += P('M' + pt([x - 12 * s, y]) + 'L' + pt([x - 12 * s, y - 18 * s]) + 'Q' + pt([x, y - 28 * s]) + ' ' + pt([x + 12 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y]) + 'Z', '#140e0a', 1.8 * s) + P(pd([[x + 12 * s, y], [x + 20 * s, y - 2 * s], [x + 16 * s, y - 20 * s], [x + 12 * s, y - 18 * s]], true), c.cel('#5a3e2a'), 1.4 * s);
    [-0.78, -0.45, 0.4, 0.74].forEach(function (f) { var wx = x + w * f; o += R(wx - 4 * s, y - h1 * 0.78, 8 * s, 10 * s, '#1a120c', 1.4 * s) + F(pd([[wx - 4 * s, y - h1 * 0.78], [wx, y - h1 * 1.02], [wx + 4 * s, y - h1 * 0.78]], true), '#2a2018', 0.6); });
    [-0.7, 0.62].forEach(function (f) { var wx = x + w * f; o += R(wx - 5 * s, eave + 7 * s, 10 * s, 10 * s, '#1a120c', 1.4 * s); });
    o += defBanner(c, x - w * 0.3, y - h1 + 2 * s, 24 * s, 0.7 * s).replace(/^<ellipse[^>]*\/>/, '');
    o += rock(c, x + w + 4 * s, y + 2, 16 * s, 8 * s, st) + rock(c, x - w - 2 * s, y + 2, 12 * s, 6 * s, st);
    return o;
  }
  // rocky hill at the back of Fenwick with the timbered mine shaft into the Smugglers' Deep
  function shaftHill(c, x, y, s) {
    var hc = '#806c50', o = '';
    var hill = 'M' + pt([x - 92 * s, y + 4]) + 'C' + pt([x - 72 * s, y - 40 * s]) + ' ' + pt([x - 30 * s, y - 64 * s]) + ' ' + pt([x + 6 * s, y - 62 * s]) + 'C' + pt([x + 46 * s, y - 60 * s]) + ' ' + pt([x + 78 * s, y - 34 * s]) + ' ' + pt([x + 94 * s, y + 4]) + 'Z', str = '';
    for (var i = 1; i < 4; i++) str += 'M' + pt([x - 92 * s, y - i * 15 * s]) + 'Q' + pt([x, y - i * 15 * s + 6]) + ' ' + pt([x + 92 * s, y - i * 15 * s - 3]);
    o += body(c, hill, hc, F('M' + pt([x + 18 * s, y - 64 * s]) + 'C' + pt([x + 56 * s, y - 52 * s]) + ' ' + pt([x + 80 * s, y - 28 * s]) + ' ' + pt([x + 96 * s, y + 6]) + 'L' + pt([x + 36 * s, y + 6]) + 'Z', dk(hc, 0.3), 0.8) + L(str, dk(hc, 0.25), 1.4, 0.6) +
      F('M' + pt([x - 80 * s, y - 28 * s]) + 'C' + pt([x - 56 * s, y - 60 * s]) + ' ' + pt([x + 10 * s, y - 70 * s]) + ' ' + pt([x + 50 * s, y - 50 * s]) + 'L' + pt([x + 56 * s, y - 44 * s]) + 'C' + pt([x + 20 * s, y - 60 * s]) + ' ' + pt([x - 40 * s, y - 58 * s]) + ' ' + pt([x - 70 * s, y - 22 * s]) + 'Z', '#9a8662', 0.85) +
      pebbles(191, y - 40 * s, y, '#4a3a2a', 12, x - 80 * s, x + 80 * s), 2);
    o += grass(193, y - 60 * s, y - 36 * s, '#5a4a30', 18, 0.4, 0.6, 1, x - 60 * s, x + 50 * s);
    o += rock(c, x - 58 * s, y + 2, 20 * s, 12 * s, '#8a7a64') + rock(c, x + 60 * s, y + 2, 16 * s, 10 * s, '#8a7a64');
    o += P('M' + pt([x - 18 * s, y + 2]) + 'L' + pt([x - 18 * s, y - 30 * s]) + 'Q' + pt([x, y - 42 * s]) + ' ' + pt([x + 18 * s, y - 30 * s]) + 'L' + pt([x + 18 * s, y + 2]) + 'Z', c.lg([[0, '#0a0604'], [1, '#22140c']]), 2);
    o += C(x, y - 8 * s, 12 * s, glow(c, '#ffb040', 0.3)) + rails(x, y + 1, x - 6 * s, y + 12 * s, 3 * s, 7 * s);
    o += limb('M' + pt([x - 20 * s, y + 2]) + 'L' + pt([x - 20 * s, y - 36 * s]), WOOD, 5 * s) + limb('M' + pt([x + 20 * s, y + 2]) + 'L' + pt([x + 20 * s, y - 36 * s]), WOOD, 5 * s) + limb('M' + pt([x - 27 * s, y - 36 * s]) + 'L' + pt([x + 27 * s, y - 36 * s]), '#6a4424', 5.5 * s);
    o += L('M' + pt([x - 24 * s, y - 18 * s]) + 'L' + pt([x - 16 * s, y - 34 * s]) + 'M' + pt([x + 24 * s, y - 18 * s]) + 'L' + pt([x + 16 * s, y - 34 * s]), dk(WOOD, 0.3), 2 * s);
    return o + hangLantern(c, x - 26 * s, y - 31 * s, s) + hangLantern(c, x + 26 * s, y - 31 * s, s);
  }
  // charred beam lying on the ground, glowing at one end
  function charBeam(c, x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return E(x, y + 3 * s, len * 0.52, 3 * s, '#000', 0, 0.2) + limb(d, '#3a2a20', 5 * s) + L('M' + pt([x - ca * 0.8, y - sa * 0.8 - 1.2 * s]) + 'L' + pt([x + ca * 0.6, y + sa * 0.6 - 1.2 * s]), '#5a4434', 1.2 * s, 0.8) + C(x + ca, y + sa, 2.4 * s, '#ff8a2a', 0, 0.85) + C(x + ca, y + sa, 7 * s, glow(c, '#ff8a2a', 0.5));
  }
  // flat grey overcast cloud bank
  function overcast(c, seed) {
    var r = rng(seed || 5), o = '';
    [['#8a9098', 26, 0.9], ['#9ca2a6', 44, 0.85], ['#aeb0ae', 64, 0.7]].forEach(function (b) {
      var d = 'M-10,' + (b[1] - 30), x = -10;
      while (x < 410) { var w = 30 + r() * 30; d += 'Q' + pt([x + w / 2, b[1] + 4 + r() * 10]) + ' ' + pt([x + w, b[1] - 2 + r() * 4]); x += w; }
      d += 'L410,' + (b[1] - 30) + 'Z';
      o += F(d, b[0], b[2]);
    });
    return F('M-10,-10 L410,-10 L410,24 C300,30 100,30 -10,24 Z', '#7a828c', 0.9) + o;
  }
  // a crow: black body, wings, beak (or in flight when fly is set)
  function crow(x, y, s, fly) {
    if (fly) return L('M' + pt([x - 7 * s, y - 2 * s]) + 'Q' + pt([x - 3 * s, y - 5 * s]) + ' ' + pt([x, y]) + 'Q' + pt([x + 3 * s, y - 5 * s]) + ' ' + pt([x + 7 * s, y - 2 * s]), '#1e1a18', 1.8 * s);
    return P('M' + pt([x - 5 * s, y - 4 * s]) + 'C' + pt([x - 5 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 8 * s]) + ' ' + pt([x + 4 * s, y - 4 * s]) + 'L' + pt([x + 9 * s, y]) + 'L' + pt([x + 2 * s, y]) + 'C' + pt([x - 2 * s, y]) + ' ' + pt([x - 4 * s, y - 1 * s]) + ' ' + pt([x - 5 * s, y - 4 * s]) + 'Z', '#221e1c', 1 * s) +
      C(x - 4 * s, y - 8 * s, 2.6 * s, '#221e1c', 1 * s) + P(pd([[x - 6 * s, y - 9 * s], [x - 10 * s, y - 7.6 * s], [x - 6 * s, y - 7 * s]], true), '#6a5a3a', 0.6 * s) + C(x - 4.8 * s, y - 8.6 * s, 0.6 * s, '#e0d0a0');
  }
  // rusted harvest golem wreckage: 'head' (half-buried helm), 'gear', 'arm' (limb with a scythe), 'hull' (split shell with straw)
  function golemScrap(c, kind, x, y, s) {
    var rs = RUST, o = E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.24);
    if (kind === 'head') {
      var hd = 'M' + pt([x - 16 * s, y]) + 'C' + pt([x - 18 * s, y - 14 * s]) + ' ' + pt([x - 8 * s, y - 24 * s]) + ' ' + pt([x + 2 * s, y - 24 * s]) + 'C' + pt([x + 14 * s, y - 24 * s]) + ' ' + pt([x + 20 * s, y - 12 * s]) + ' ' + pt([x + 18 * s, y]) + 'Z';
      o += body(c, hd, rs, F(pd([[x + 4 * s, y - 26 * s], [x + 22 * s, y - 26 * s], [x + 22 * s, y + 2], [x + 8 * s, y + 2]], true), dk(rs, 0.35), 0.8) + L('M' + pt([x - 2 * s, y - 24 * s]) + 'L' + pt([x - 3 * s, y]), dk(rs, 0.4), 1.4 * s) +
        L('M' + pt([x - 10 * s, y - 8 * s]) + 'l1,' + n(7 * s) + 'M' + pt([x + 8 * s, y - 10 * s]) + 'l0,' + n(9 * s), '#5a2a14', 1.4 * s, 0.7) + E(x + 6 * s, y - 16 * s, 5 * s, 3 * s, '#6a7a5a', 0, 0.5), 2 * s);
      o += P(pd([[x - 16 * s, y - 10 * s], [x + 6 * s, y - 13 * s], [x + 6 * s, y - 6 * s], [x - 15 * s, y - 4 * s]], true), '#1a0e08', 1.6 * s) + E(x - 7 * s, y - 8 * s, 3 * s, 1.4 * s, '#4a3020');
      o += rivets([[x - 12 * s, y - 2 * s], [x - 2 * s, y - 2 * s], [x + 10 * s, y - 2 * s]], '#b89a80');
      o += F(pd([[x - 20 * s, y + 1], [x - 12 * s, y - 3 * s], [x, y - 1 * s], [x + 14 * s, y - 3 * s], [x + 22 * s, y + 1]], true), '#7a6a4a');
    } else if (kind === 'gear') {
      o += G(P(star(x, y - 8 * s, 10, 14 * s, 10.5 * s), c.cel('#7a5a3a'), 1.8 * s) + C(x, y - 8 * s, 7 * s, dk('#7a5a3a', 0.15), 1.4 * s) + C(x, y - 8 * s, 3 * s, '#2a1a10', 1.2 * s) + L('M' + pt([x + 3 * s, y - 20 * s]) + 'l' + n(3 * s) + ',' + n(7 * s) + 'l' + n(-2 * s) + ',' + n(5 * s), OL, 1.2 * s), rot(14, x, y - 8 * s));
      o += F(pd([[x - 18 * s, y + 1], [x - 10 * s, y - 2 * s], [x + 8 * s, y - 1 * s], [x + 18 * s, y + 1]], true), '#7a6a4a');
    } else if (kind === 'arm') {
      o += G(scythe(c, [x - 10 * s, y - 4 * s], 26 * s, -0.2, 26 * s, -1, '#8a8a84', '#5a3a26'), rot(-8, x, y));
      o += tube([[x + 26 * s, y - 4 * s], [x + 8 * s, y - 6 * s], [x - 8 * s, y - 4 * s]], 7 * s, rs, dk(rs, 0.3)) + C(x + 8 * s, y - 6 * s, 4 * s, c.cel(dk(rs, 0.15)), 1.4 * s) + C(x - 8 * s, y - 4 * s, 4.6 * s, c.cel('#6a5a50'), 1.6 * s);
      o += L('M' + pt([x + 26 * s, y - 4 * s]) + 'q' + n(5 * s) + ',' + n(-4 * s) + ' ' + n(8 * s) + ',' + n(2 * s) + 'M' + pt([x + 27 * s, y - 2 * s]) + 'q' + n(4 * s) + ',' + n(3 * s) + ' ' + n(7 * s) + ',' + n(4 * s), '#3a3430', 1.2 * s);
    } else {
      var sh = 'M' + pt([x - 22 * s, y]) + 'C' + pt([x - 24 * s, y - 18 * s]) + ' ' + pt([x - 10 * s, y - 30 * s]) + ' ' + pt([x + 6 * s, y - 28 * s]) + 'L' + pt([x + 2 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y - 16 * s]) + 'L' + pt([x + 4 * s, y - 8 * s]) + 'L' + pt([x + 14 * s, y]) + 'Z';
      o += strawBits(c, [[x + 4 * s, y - 10 * s, -0.4, 10 * s], [x + 8 * s, y - 4 * s, 0.2, 9 * s]], '#b0a070');
      o += body(c, sh, rs, F(pd([[x - 26 * s, y - 8 * s], [x + 16 * s, y - 10 * s], [x + 16 * s, y + 2], [x - 26 * s, y + 2]], true), dk(rs, 0.3), 0.7) + L('M' + pt([x - 20 * s, y - 12 * s]) + 'C' + pt([x - 12 * s, y - 14 * s]) + ' ' + pt([x - 2 * s, y - 14 * s]) + ' ' + pt([x + 6 * s, y - 13 * s]), dk(rs, 0.4), 1.4 * s) + E(x - 12 * s, y - 20 * s, 4 * s, 2 * s, lt(rs, 0.3), 0, 0.6), 2 * s);
      o += rivets([[x - 18 * s, y - 10 * s], [x - 10 * s, y - 12 * s], [x - 2 * s, y - 12 * s]], '#b89a80');
    }
    return o;
  }

  // ---- Kingsmere pieces: the Market Ward, the bank / auction hall, the Hall of Banners gate ----
  // white stone, blue slate roofs, blue-and-gold sun banners, clear daylight. Most pieces are drawn at unit
  // scale around a base point and placed with G(piece, at(s, x, y)), so distant copies get thinner outlines.
  var SWS = '#ebe5d6', SWR = '#3a62b4', SWI = '#34343e', SWP = '#f2e8cf', SWB = '#5a3a24', SWST = '#d4d0c6';
  function circD(x, y, r) { return 'M' + pt([x - r, y]) + 'a' + n(r) + ',' + n(r) + ' 0 1,0 ' + n(2 * r) + ',0a' + n(r) + ',' + n(r) + ' 0 1,0 ' + n(-2 * r) + ',0Z'; }
  // round-topped opening; x,y = top-left of its box
  function archD(x, y, w, h) { var r = w / 2; return 'M' + pt([x, y + h]) + 'L' + pt([x, y + r]) + 'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + pt([x + w, y + r]) + 'L' + pt([x + w, y + h]) + 'Z'; }
  // masonry courses (and staggered joints when brick > 0) over a box
  function courses(x0, x1, y0, y1, step, col, w, op, brick) {
    var d = '', row = 0;
    for (var y = y1 - step; y > y0 + 0.5; y -= step, row++) {
      d += 'M' + pt([x0, y]) + 'L' + pt([x1, y]);
      if (brick) for (var x = x0 + (row % 2 ? brick / 2 : brick); x < x1 - 1; x += brick) d += 'M' + pt([x, y]) + 'l0,' + n(step);
    }
    return d ? L(d, col, w || 0.9, op == null ? 0.7 : op) : '';
  }
  function swSky(c) { return sky(c, '#3f7cc8', '#98c2e6', '#e8eef0') + sun(c, 348, 40, 10, '#fff4cc'); }
  function swHaze(c, y) { return R(0, 0, 400, y, c.lg([[0, '#e6eef8', 0], [0.55, '#e6eef8', 0.12], [1, '#e6eef8', 0.36]])); }
  // hanging sun banner: rod, blue cloth with gold trim, swallowtail hem, gold crest
  function swHangBanner(c, x, y, w, h, sw) {
    sw = sw || 1.6;
    var hw = w / 2, d = pd([[x - hw, y], [x + hw, y], [x + hw, y + h], [x, y + h - w * 0.45], [x - hw, y + h]], true);
    var trim = 'M' + pt([x - hw, y + h * 0.1]) + 'L' + pt([x + hw, y + h * 0.1]) + 'M' + pt([x - hw * 0.7, y + h * 0.1]) + 'L' + pt([x - hw * 0.7, y + h - w * 0.2]) + 'M' + pt([x + hw * 0.7, y + h * 0.1]) + 'L' + pt([x + hw * 0.7, y + h - w * 0.2]);
    return L('M' + pt([x - hw - 2, y]) + 'L' + pt([x + hw + 2, y]), OL, sw * 1.9) + C(x - hw - 2, y, sw * 1.1, SW_GOLD) + C(x + hw + 2, y, sw * 1.1, SW_GOLD) +
      body(c, d, SW_BLUE, F(pd([[x + hw * 0.3, y - 1], [x + hw + 1, y - 1], [x + hw + 1, y + h + 1], [x + hw * 0.3, y + h]], true), dk(SW_BLUE, 0.32), 0.6) + L(trim, SW_GOLD, Math.max(0.6, w * 0.07)), sw) +
      sunCrest(c, x, y + h * 0.42, w * 0.3);
  }
  // tower: stone shaft, corbel ring, blue cone roof, gold finial
  function swTower(c, x, y, w, h, rh, o) {
    o = o || {};
    var st = o.stone || SWS, rf = o.roof || SWR, sw = o.sw || 1.8, top = y - h, hw = w / 2, out = '';
    out += body(c, pd([[x - hw, y], [x - hw, top], [x + hw, top], [x + hw, y]], true), st,
      courses(x - hw, x + hw, top, y, 9, dk(st, 0.2), 0.8, 0.6, w > 20 ? 10 : 0) + F(pd([[x + hw * 0.35, top - 2], [x + hw + 2, top - 2], [x + hw + 2, y + 2], [x + hw * 0.35, y + 2]], true), dk(st, 0.2), 0.75), sw);
    if (!o.noWin) { out += P(archD(x - 2.4, top + h * 0.18, 4.8, 9), '#2a3656', sw * 0.6); if (h > 56) out += P(archD(x - 2.4, top + h * 0.5, 4.8, 9), '#2a3656', sw * 0.6); }
    out += R(x - hw - 2.5, top - 4, w + 5, 5, c.cel(dk(st, 0.05)), sw * 0.8);
    var rb = top - 3, tip = rb - rh, rw = hw + 5, tl = '';
    for (var i = 1; i < 4; i++) { var ty = rb - rh * i / 4, tw = rw * (1 - i / 4); tl += 'M' + pt([x - tw, ty]) + 'L' + pt([x + tw, ty]); }
    out += body(c, pd([[x - rw, rb], [x, tip], [x + rw, rb]], true), rf, F(pd([[x + 1, tip - 2], [x + rw + 3, rb + 2], [x + 1, rb + 2]], true), dk(rf, 0.3), 0.75) + L(tl, dk(rf, 0.35), 0.9, 0.8), sw);
    var fin = 'M' + pt([x, tip]) + 'L' + pt([x, tip - 8]);
    return out + L(fin, OL, 2.6) + L(fin, SW_GOLD, 1.1) + C(x, tip - 8.5, 1.8, SW_GOLD, 0.9);
  }
  // Kingsmere Keep: long hall with merlons, three central towers rising behind it, two corner towers
  function swKeep(c, x, y, o) {
    o = o || {};
    var st = o.stone || '#dedbd2', q = { stone: st, roof: o.roof || '#4a6ebc', sw: 1.5 }, out = '';
    out += swTower(c, x - 30, y - 30, 16, 50, 34, q) + swTower(c, x + 30, y - 30, 16, 50, 34, q) + swTower(c, x, y - 40, 24, 60, 48, q);
    var win = '';
    for (var i = -3; i <= 3; i++) if (i) win += P(archD(x + i * 12 - 3, y - 36, 6, 14), '#2a3656', 1.1);
    out += body(c, pd([[x - 50, y], [x - 50, y - 44], [x + 50, y - 44], [x + 50, y]], true), st, courses(x - 50, x + 50, y - 44, y, 8, dk(st, 0.2), 0.7, 0.6, 12) + F(pd([[x + 16, y - 46], [x + 52, y - 46], [x + 52, y + 2], [x + 16, y + 2]], true), dk(st, 0.18), 0.7), 1.5);
    for (var m = 0; m < 11; m++) out += R(x - 50 + m * 9.5, y - 49, 5, 6, c.cel(st), 1.1);
    out += win + swHangBanner(c, x, y - 44, 10, 26, 1.2);
    return out + swTower(c, x - 58, y, 14, 48, 22, q) + swTower(c, x + 58, y, 14, 48, 22, q);
  }
  // Cathedral of Light: gabled facade with a rose window, lean-to aisles, a tall spire behind
  function swCathedral(c, x, y, o) {
    o = o || {};
    var st = o.stone || '#e4e1d8', rf = o.roof || '#4a6ebc', out = '';
    out += swTower(c, x, y - 60, 16, 44, 72, { stone: st, roof: rf, sw: 1.5 });
    [-1, 1].forEach(function (k) {
      var x0 = x + k * 16, x1 = x + k * 38, lo = Math.min(x0, x1), hi = Math.max(x0, x1);
      out += body(c, pd([[x0, y], [x0, y - 42], [x1, y - 34], [x1, y]], true), st, courses(lo, hi, y - 42, y, 8, dk(st, 0.2), 0.7, 0.6) + (k > 0 ? F(pd([[x0, y - 44], [x1 + 2, y - 44], [x1 + 2, y + 2], [x0, y + 2]], true), dk(st, 0.18), 0.7) : ''), 1.5);
      out += P(pd([[x0, y - 40], [x0, y - 52], [x1 + k * 3, y - 36], [x1 + k * 3, y - 32]], true), c.cel(rf), 1.5);
      out += P(archD(x + k * 27 - 3, y - 28, 6, 16), '#3a5aa0', 1.1);
    });
    out += body(c, pd([[x - 18, y], [x - 18, y - 62], [x, y - 86], [x + 18, y - 62], [x + 18, y]], true), st, courses(x - 18, x + 18, y - 86, y, 8, dk(st, 0.2), 0.7, 0.6, 9) + F(pd([[x + 6, y - 90], [x + 20, y - 90], [x + 20, y + 2], [x + 6, y + 2]], true), dk(st, 0.16), 0.7), 1.6);
    var sp = '';
    for (var i = 0; i < 8; i++) { var a = i * PI / 4; sp += 'M' + pt([x, y - 52]) + 'L' + pt([x + Math.cos(a) * 9, y - 52 + Math.sin(a) * 9]); }
    out += C(x, y - 52, 11, c.cel(dk(st, 0.08)), 1.4) + C(x, y - 52, 9, c.lg([[0, '#a8d8ff'], [0.5, '#4a7ad0'], [1, '#b04a6a']]), 1.2) + L(sp, dk(st, 0.25), 1.2) + C(x, y - 52, 2.4, SW_GOLD, 0.8);
    out += P(archD(x - 8, y - 26, 16, 26), c.cel('#6a4428'), 1.6) + L('M' + pt([x, y - 18]) + 'L' + pt([x, y]), '#3a2414', 1.1);
    [-18, 18].forEach(function (dx) { out += P(pd([[x + dx - 3, y - 60], [x + dx, y - 78], [x + dx + 3, y - 60]], true), c.cel(st), 1.2) + C(x + dx, y - 79, 1.4, SW_GOLD, 0.6); });
    return out;
  }
  // far rooftops: pale walls with blue gables, overlapping left to right
  function swRoofline(c, seed, x0, x1, base, s) {
    var r = rng(seed), o = '', x = x0, st = '#e2ded6', rf = '#5a7cc4';
    while (x < x1) {
      var w = (13 + r() * 10) * s, h = (10 + r() * 12) * s, rh = (9 + r() * 9) * s, cx = x + w / 2, top = base - h;
      o += P(pd([[x, base], [x, top], [x + w, top], [x + w, base]], true), c.cel(st), 1.1) + R(cx - 1.5 * s, top + h * 0.3, 3 * s, 4 * s, '#3a4a6a');
      o += P(pd([[x - 2 * s, top + 1], [cx, top - rh], [x + w + 2 * s, top + 1]], true), c.cel(rf), 1.1);
      x += w * (0.7 + r() * 0.3);
    }
    return o;
  }
  // hanging shop sign on an iron bracket; kind = mug | anvil | potion | bread | sword (a picture, never lettering)
  function swSign(c, x, y, kind, flip) {
    var k = flip ? -1 : 1, bx = x + k * 11, o = '', g = SW_GOLD, sy = y + 9;
    o += limb('M' + pt([x, y]) + 'L' + pt([x + k * 19, y]), SWI, 1.4) + L('M' + pt([x, y + 8]) + 'L' + pt([x + k * 10, y]), SWI, 1.3);
    o += L('M' + pt([bx - 5, y]) + 'L' + pt([bx - 5, y + 3]) + 'M' + pt([bx + 5, y]) + 'L' + pt([bx + 5, y + 3]), OL, 1);
    o += R(bx - 8, y + 3, 16, 13, c.cel('#a8743e'), 1.4, 1.5) + R(bx - 6, y + 5, 12, 9, '#3a2a1e');
    if (kind === 'mug') o += R(bx - 3, sy - 2, 5, 6, g, 0.7) + L('M' + pt([bx + 2, sy - 1]) + 'q3,0 3,2 q0,2 -3,2', g, 1) + E(bx - 0.5, sy - 2.4, 3, 1.2, '#fff4d8');
    else if (kind === 'anvil') o += P(pd([[bx - 5, sy - 2], [bx + 5, sy - 2], [bx + 3, sy], [bx + 1, sy], [bx + 2, sy + 3], [bx - 3, sy + 3], [bx - 2, sy], [bx - 3, sy]], true), g, 0.6);
    else if (kind === 'potion') o += C(bx, sy + 1, 3, '#c04ad0', 0.7) + R(bx - 1, sy - 4, 2, 3, g, 0.5);
    else if (kind === 'bread') o += E(bx, sy, 5, 2.8, '#e0a850', 0.7) + L('M' + pt([bx - 2, sy - 2]) + 'l1,3 M' + pt([bx + 1, sy - 2]) + 'l1,3', '#8a5a2a', 0.8);
    else o += L('M' + pt([bx - 4, sy + 4]) + 'L' + pt([bx + 4, sy - 4]), '#e0e4ea', 1.4) + L('M' + pt([bx - 4, sy + 1]) + 'L' + pt([bx - 1, sy + 4]), g, 1.2);
    return o;
  }
  // city house / shop: white stone ground floor, half-timbered upper storey, steep blue slate roof
  function swHouse(c, x, y, o) {
    o = o || {};
    var w = o.w || 34, h1 = o.h1 || 30, h2 = o.h2 || 26, rh = o.rh || 38, st = o.stone || SWS, pl = o.wall || SWP, rf = o.roof || SWR, out = '';
    var eave = y - h1 - h2, ow = w + 4, rw = ow + 8, rt = eave - rh;
    out += E(x, y + 2, w + 14, 5, '#000', 0, 0.2);
    if (o.chimney) out += body(c, pd([[x + w * 0.35, eave - rh * 0.2], [x + w * 0.35, rt + rh * 0.12], [x + w * 0.35 + 10, rt + rh * 0.12], [x + w * 0.35 + 10, eave - rh * 0.1]], true), '#c4bcaa', R(x + w * 0.35 - 2, rt + rh * 0.12 - 1, 14, 4, dk('#c4bcaa', 0.2)), 1.6);
    // stone ground floor
    out += body(c, pd([[x - w, y], [x - w, y - h1], [x + w, y - h1], [x + w, y]], true), st, courses(x - w, x + w, y - h1, y, h1 / 3, dk(st, 0.22), 0.9, 0.7, 12) + F(pd([[x + w * 0.5, y - h1 - 2], [x + w + 2, y - h1 - 2], [x + w + 2, y + 2], [x + w * 0.5, y + 2]], true), dk(st, 0.2), 0.75), 2);
    // timber upper storey, overhanging
    var nb = o.bays || 3, bm = 'M' + pt([x - ow, y - h1]) + 'L' + pt([x + ow, y - h1]) + 'M' + pt([x - ow, eave]) + 'L' + pt([x + ow, eave]), bw = (2 * ow - 4) / nb;
    for (var b = 0; b <= nb; b++) bm += 'M' + pt([x - ow + 2 + bw * b, eave]) + 'L' + pt([x - ow + 2 + bw * b, y - h1]);
    bm += 'M' + pt([x - ow + 2, y - h1]) + 'L' + pt([x - ow + 2 + bw, eave]) + 'M' + pt([x + ow - 2, y - h1]) + 'L' + pt([x + ow - 2 - bw, eave]);
    out += body(c, pd([[x - ow, y - h1], [x - ow, eave], [x + ow, eave], [x + ow, y - h1]], true), pl, F(pd([[x + w * 0.5, eave - 2], [x + ow + 2, eave - 2], [x + ow + 2, y - h1 + 2], [x + w * 0.5, y - h1 + 2]], true), dk(pl, 0.22), 0.75) + L(bm, SWB, 2.4), 2);
    var win = o.lit ? '#ffd98a' : '#3a4e78';
    for (var q = 1; q < nb - 1 || (nb < 3 && q < nb); q++) {
      var wx = x - ow + 2 + bw * q + bw / 2;
      if (nb < 3) wx = x;
      out += R(wx - 5, eave + h2 * 0.2, 10, h2 * 0.5, win, 1.5) + L('M' + pt([wx, eave + h2 * 0.2]) + 'l0,' + n(h2 * 0.5), SWB, 1.1) + R(wx - 7, eave + h2 * 0.7, 14, 4, c.cel('#8a5a32'), 1.2) + C(wx - 3, eave + h2 * 0.7 - 0.5, 2, '#e05a6a', 0.7) + C(wx + 2, eave + h2 * 0.7 - 1, 2, '#f0c848', 0.7);
      if (nb < 3) break;
    }
    // roof: front gable or side slope with a dormer
    var rd, rs, tl = '';
    if (o.gable) { rd = pd([[x - rw, eave + 3], [x, rt], [x + rw, eave + 3]], true); rs = F(pd([[x + 1, rt - 2], [x + rw + 3, eave + 5], [x + 1, eave + 5]], true), dk(rf, 0.3), 0.8); }
    else { rd = pd([[x - rw, eave + 3], [x - rw * 0.55, rt], [x + rw * 0.55, rt], [x + rw, eave + 3]], true); rs = F(pd([[x + rw * 0.25, rt - 2], [x + rw * 0.55 + 1, rt - 2], [x + rw + 3, eave + 5], [x + rw * 0.45, eave + 5]], true), dk(rf, 0.3), 0.8); }
    for (var t = eave - 3, row = 0; t > rt + 2; t -= 6, row++) { tl += 'M' + pt([x - rw - 2, t]) + 'L' + pt([x + rw + 2, t]); for (var tx = x - rw + (row % 2 ? 3 : 0); tx < x + rw; tx += 7) tl += 'M' + pt([tx, t]) + 'l0,6'; }
    out += body(c, rd, rf, L(tl, dk(rf, 0.32), 0.8, 0.7) + rs, 2.2);
    if (o.gable) out += P(archD(x - 4, eave - rh * 0.5, 8, 11), win, 1.3);
    else out += P(pd([[x - 8, eave - rh * 0.25], [x - 8, eave - rh * 0.55], [x, eave - rh * 0.8], [x + 8, eave - rh * 0.55], [x + 8, eave - rh * 0.25]], true), c.cel(pl), 1.6) + R(x - 4, eave - rh * 0.55, 8, 7, win, 1.1) + P(pd([[x - 11, eave - rh * 0.5], [x, eave - rh * 0.86], [x + 11, eave - rh * 0.5]], true), c.cel(rf), 1.4);
    // ground floor: arched door + shop window
    var dx = x + (o.doorX == null ? -w * 0.45 : o.doorX), sx = x + (o.doorX == null ? w * 0.3 : -o.doorX * 0.7);
    out += P(archD(dx - 7, y - 23, 14, 23), c.cel('#6a4428'), 1.8) + L('M' + pt([dx - 7, y - 9]) + 'l14,0 M' + pt([dx - 7, y - 16]) + 'l14,0', SWI, 1.1) + C(dx + 4, y - 11, 1.1, SW_GOLD);
    out += P(archD(sx - 11, y - 23, 22, 17), o.lit === 2 ? '#ffd98a' : '#e8c878', 1.6) + L('M' + pt([sx, y - 23]) + 'l0,17 M' + pt([sx - 11, y - 12]) + 'l22,0', SWB, 1.2) + R(sx - 13, y - 7, 26, 3, c.cel(dk(st, 0.1)), 1.2);
    if (o.awning) out += P(pd([[sx - 15, y - 26], [sx + 15, y - 26], [sx + 17, y - 19], [sx - 17, y - 19]], true), c.cel(o.awning), 1.4) + L('M' + pt([sx - 7, y - 26]) + 'l-1,7 M' + pt([sx, y - 26]) + 'l0,7 M' + pt([sx + 7, y - 26]) + 'l1,7', lt(o.awning, 0.6), 2.2, 0.9);
    if (o.sign) out += swSign(c, x + (o.flip ? -ow : ow), y - h1 - 5, o.sign, o.flip);
    if (o.banner != null) out += swHangBanner(c, x + o.banner, eave + 2, 11, h2 + 12, 1.5);
    return out;
  }
  // market stall: counter with goods, two posts, striped scalloped awning
  function swStall(c, x, y, o) {
    o = o || {};
    var c1 = o.c1 || SW_BLUE, c2 = o.c2 || '#f4ecd8', w = 26, out = E(x, y + 2, 32, 4, '#000', 0, 0.22), post = '#7a5030';
    out += limb('M' + pt([x - w + 4, y - 18]) + 'L' + pt([x - w + 4, y - 55]) + 'M' + pt([x + w - 4, y - 18]) + 'L' + pt([x + w - 4, y - 55]), dk(post, 0.25), 2);
    // goods on the counter
    var g = '', r = rng(o.seed || 7);
    if (o.goods === 'cloth') [[-15, '#b82d31'], [-5, '#3a8a5a'], [5, '#e8c048'], [15, '#6a4ab0']].forEach(function (b) { g += R(x + b[0] - 4.5, y - 29, 9, 9, c.cel(b[1]), 1.2) + E(x + b[0], y - 29, 4.5, 1.6, lt(b[1], 0.3), 1); });
    else if (o.goods === 'bottles') for (var i = 0; i < 7; i++) { var bx = x - 18 + i * 6, col = ['#c04ad0', '#3aa0d8', '#e05a3a', '#5ac05a'][i % 4]; g += R(bx - 2.2, y - 26, 4.4, 6, col, 1) + R(bx - 1, y - 30, 2, 4, '#e8e0cc', 0.8); }
    else for (var j = 0; j < 12; j++) { var fx = x - 19 + (j % 6) * 7.6, fy = y - 22 - Math.floor(j / 6) * 5 - (j % 6 > 1 && j % 6 < 4 ? 1 : 0), fc = ['#d84a3a', '#e8a030', '#8ac040', '#e8d050'][Math.floor(r() * 4)]; g += C(fx, fy, 3.2, c.cel(fc), 1); }
    out += g;
    out += body(c, pd([[x - w, y], [x - w, y - 18], [x + w, y - 18], [x + w, y]], true), '#9a6a3c', L('M' + pt([x - w, y - 9]) + 'L' + pt([x + w, y - 9]), dk('#9a6a3c', 0.35), 1.1) + F(pd([[x + w * 0.4, y - 20], [x + w + 2, y - 20], [x + w + 2, y + 2], [x + w * 0.4, y + 2]], true), dk('#9a6a3c', 0.3), 0.7), 1.8);
    var sc = 'M' + pt([x - w + 1, y - 18]) + 'L' + pt([x + w - 1, y - 18]) + 'L' + pt([x + w - 1, y - 12]);
    for (var k = 0; k < 5; k++) { var ax = x + w - 1 - k * (2 * w - 2) / 5; sc += 'Q' + pt([ax - (w - 1) / 5, y - 6]) + ' ' + pt([ax - (2 * w - 2) / 5, y - 12]); }
    out += P(sc + 'Z', c.cel(c1), 1.3) + R(x - w - 2, y - 21, 2 * w + 4, 3.5, c.cel('#c89a5c'), 1.4);
    out += limb('M' + pt([x - w, y]) + 'L' + pt([x - w, y - 47]) + 'M' + pt([x + w, y]) + 'L' + pt([x + w, y - 47]), post, 2.6);
    // striped awning with a scalloped front edge
    var ns = 6, aw = pd([[x - w - 6, y - 45], [x - w + 2, y - 60], [x + w - 2, y - 60], [x + w + 6, y - 45]], true), st = '', sl = '';
    for (var s = 0; s < ns; s++) {
      var t0 = s / ns, t1 = (s + 1) / ns, tx0 = x - w + 2 + (2 * w - 4) * t0, tx1 = x - w + 2 + (2 * w - 4) * t1, bx0 = x - w - 6 + (2 * w + 12) * t0, bx1 = x - w - 6 + (2 * w + 12) * t1;
      if (s % 2) st += F(pd([[bx0, y - 44], [tx0, y - 61], [tx1, y - 61], [bx1, y - 44]], true), c1);
      sl += P('M' + pt([bx0, y - 45]) + 'Q' + pt([(bx0 + bx1) / 2, y - 37]) + ' ' + pt([bx1, y - 45]) + 'Z', s % 2 ? c.cel(c1) : c.cel(c2), 1.3);
    }
    out += body(c, aw, c2, st + F(pd([[x - w - 8, y - 50], [x + w + 8, y - 50], [x + w + 8, y - 43], [x - w - 8, y - 43]], true), '#000', 0.12) + F(pd([[x + w * 0.5, y - 62], [x + w + 8, y - 62], [x + w + 8, y - 43], [x + w * 0.6, y - 43]], true), '#000', 0.14), 1.8);
    return out + sl;
  }
  // iron street lamp
  function swLamp(c, x, y, h) {
    var top = y - h, o = E(x, y + 1, 7, 2, '#000', 0, 0.25);
    o += P(pd([[x - 5, y], [x - 3, y - 6], [x + 3, y - 6], [x + 5, y]], true), c.cel('#3a3a44'), 1.4) + limb('M' + pt([x, y - 6]) + 'L' + pt([x, top + 10]), '#3a3a46', 2.2);
    o += C(x, top + 4, 14, glow(c, '#ffd070', 0.45)) + P(pd([[x - 5, top + 10], [x - 6, top], [x + 6, top], [x + 5, top + 10]], true), '#ffe08a', 1.4) + L('M' + pt([x, top]) + 'L' + pt([x, top + 10]), '#3a3a46', 1);
    return o + P(pd([[x - 7.5, top], [x, top - 6], [x + 7.5, top]], true), c.cel('#3a3a44'), 1.4) + C(x, top - 7, 1.5, SW_GOLD, 0.6) + R(x - 5.5, top + 9, 11, 2.5, '#3a3a44', 1);
  }
  // canal band: far coping, water with ripples, near coping
  function swCanal(c, y0, y1, seed) {
    var o = R(-2, y0 - 3, 404, 4, c.cel('#d8d0bc'), 1.2) + R(-2, y0, 404, y1 - y0, c.lg([[0, '#86b2d4'], [1, '#4a78a8']])), r = rng(seed || 3), d = '';
    for (var i = 0; i < 22; i++) { var yy = y0 + 2 + r() * (y1 - y0 - 3), xx = r() * 400, w = 6 + r() * 8; d += 'M' + pt([xx, yy]) + 'q' + n(w / 2) + ',-1.2 ' + n(w) + ',0'; }
    return o + L(d, '#e8f4fa', 0.9, 0.6) + R(-2, y1 - 1, 404, 4, c.cel('#e0d8c4'), 1.3);
  }
  // paved street: flagstone courses widening toward the viewer, joints converging on (vx, vy)
  function swStreet(c, y0, vx, vy, top, bot) {
    var o = R(-2, y0, 404, 242 - y0, c.lg([[0, top || '#dcd3be'], [1, bot || '#bfb398']])), d = '', f = (y0 - vy) / (240 - vy);
    for (var k = -12; k <= 12; k++) d += 'M' + pt([vx + k * 40 * f, y0]) + 'L' + pt([vx + k * 40, 240]);
    for (var i = 1; i <= 9; i++) { var y = y0 + (240 - y0) * Math.pow(i / 9, 1.7); d += 'M-2,' + n(y) + 'L402,' + n(y); }
    return o + L(d, '#948870', 0.9, 0.45);
  }
  // column: stepped base, fluted shaft, capital with a gold ring
  function swPillar(c, x, top, base, w, col) {
    col = col || '#f2eee4';
    var hw = w / 2, fl = '', o = E(x, base + 1, w * 0.8, 3, '#000', 0, 0.25);
    for (var i = 1; i < 4; i++) fl += 'M' + pt([x - hw + w * i / 4, top + 14]) + 'L' + pt([x - hw + w * i / 4, base - 12]);
    o += body(c, pd([[x - hw, base - 10], [x - hw, top + 12], [x + hw, top + 12], [x + hw, base - 10]], true), col, L(fl, dk(col, 0.22), 1.1, 0.8) + F(pd([[x + hw * 0.3, top], [x + hw + 2, top], [x + hw + 2, base], [x + hw * 0.3, base]], true), dk(col, 0.2), 0.7), 2);
    o += R(x - hw - 5, base - 10, w + 10, 5, c.cel(dk(col, 0.04)), 1.8) + R(x - hw - 8, base - 5, w + 16, 6, c.cel(dk(col, 0.1)), 1.8);
    o += R(x - hw - 2, top + 9, w + 4, 4, c.cel(SW_GOLD), 1.4) + R(x - hw - 7, top + 2, w + 14, 7, c.cel(dk(col, 0.04)), 1.8) + R(x - hw - 10, top - 3, w + 20, 5, c.cel(dk(col, 0.1)), 1.8);
    return o;
  }
  // round vault door in a stone ring, gold bolts and a spoked wheel
  function vaultDoor(c, x, y, r) {
    var o = C(x, y, r + 8, c.cel('#a49c8c'), 2.2), bolts = '', sp = '', knobs = '';
    o += R(x - r - 13, y - r * 0.6, 13, 13, c.cel('#5a5c66'), 1.6) + R(x - r - 13, y + r * 0.6 - 13, 13, 13, c.cel('#5a5c66'), 1.6);
    for (var i = 0; i < 16; i++) { var a = i * PI / 8; bolts += C(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, 1.7, '#d8b04a', 0.8); }
    for (var j = 0; j < 6; j++) { var b = j * PI / 3 + PI / 6, p = [x + Math.cos(b) * r * 0.5, y + Math.sin(b) * r * 0.5]; sp += 'M' + pt([x, y]) + 'L' + pt(p); knobs += C(p[0], p[1], 2.8, c.cel(SW_GOLD), 1.2); }
    o += body(c, circD(x, y, r), '#9ea4ae', F('M' + pt([x + r * 0.2, y - r * 1.1]) + 'L' + pt([x + r * 1.1, y - r * 1.1]) + 'L' + pt([x + r * 1.1, y + r * 1.1]) + 'L' + pt([x - r * 0.6, y + r * 1.1]) + 'Z', '#3a404a', 0.25) + L(circD(x, y, r * 0.8), '#6a707a', 1.6) + bolts, 2.4);
    o += L(circD(x, y, r * 0.66), SW_GOLD, 2.4) + L(circD(x, y, r * 0.66), OL, 0.6, 0.5) + L(sp, OL, 5) + L(sp, SW_GOLD, 2.6) + knobs + C(x, y, r * 0.26, c.cel(SW_GOLD), 1.6) + sunCrest(c, x, y, r * 0.18);
    return o;
  }
  // stone hero statue on a stepped plinth; kind 0 = knight with a planted sword, 1 = robed mage with a staff
  function swStatue(c, x, y, kind, flip) {
    var st = SWST, pl = '#bcb4a4', o = E(x, y + 1, 30, 4, '#000', 0, 0.25), f = '', b = y - 40, sh = dk(st, 0.18);
    o += body(c, pd([[x - 24, y], [x - 24, y - 10], [x + 24, y - 10], [x + 24, y]], true), pl, F(pd([[x + 8, y - 12], [x + 26, y - 12], [x + 26, y + 2], [x + 8, y + 2]], true), dk(pl, 0.25), 0.7), 1.8);
    o += body(c, pd([[x - 18, y - 10], [x - 18, y - 34], [x + 18, y - 34], [x + 18, y - 10]], true), pl, R(x - 12, y - 30, 24, 16, 'none', 1) + F(pd([[x + 6, y - 36], [x + 20, y - 36], [x + 20, y - 8], [x + 6, y - 8]], true), dk(pl, 0.25), 0.7), 1.8);
    o += R(x - 22, y - 40, 44, 6, c.cel(lt(pl, 0.1)), 1.6);
    if (kind === 1) {
      f += limb('M' + pt([x + 17, b - 1]) + 'L' + pt([x + 17, b - 104]), dk(st, 0.08), 2.6) + C(x + 17, b - 108, 5, c.cel(st), 1.6) + L('M' + pt([x + 12, b - 104]) + 'q5,-12 10,0', OL, 1.4);
      f += body(c, 'M' + pt([x - 12, b - 74]) + 'C' + pt([x - 16, b - 50]) + ' ' + pt([x - 20, b - 20]) + ' ' + pt([x - 20, b]) + 'L' + pt([x + 20, b]) + 'C' + pt([x + 20, b - 20]) + ' ' + pt([x + 16, b - 50]) + ' ' + pt([x + 12, b - 74]) + 'Z', st,
        L('M' + pt([x, b - 50]) + 'L' + pt([x - 1, b]) + 'M' + pt([x - 8, b - 40]) + 'Q' + pt([x - 10, b - 20]) + ' ' + pt([x - 12, b]) + 'M' + pt([x - 13, b - 48]) + 'L' + pt([x + 13, b - 48]), sh, 1.2) + F(pd([[x + 5, b - 76], [x + 22, b - 76], [x + 22, b + 2], [x + 7, b + 2]], true), sh, 0.7), 1.8);
      f += tube([[x - 12, b - 70], [x - 16, b - 56], [x - 13, b - 44]], 5.5, st) + tube([[x + 12, b - 70], [x + 16, b - 62], [x + 17, b - 56]], 5.5, st) + C(x - 13, b - 43, 3.2, st, 1.5) + C(x + 17, b - 56, 3.2, st, 1.5);
      f += P('M' + pt([x - 9, b - 76]) + 'C' + pt([x - 11, b - 92]) + ' ' + pt([x + 11, b - 92]) + ' ' + pt([x + 9, b - 76]) + 'Z', c.cel(dk(st, 0.08)), 1.6) + E(x, b - 82, 5, 6, c.cel(st), 1.4) + L('M' + pt([x - 2, b - 80]) + 'q2,6 4,0', sh, 1);
    } else {
      f += body(c, 'M' + pt([x - 14, b - 74]) + 'C' + pt([x - 22, b - 44]) + ' ' + pt([x - 24, b - 12]) + ' ' + pt([x - 21, b]) + 'L' + pt([x + 21, b]) + 'C' + pt([x + 24, b - 12]) + ' ' + pt([x + 22, b - 44]) + ' ' + pt([x + 14, b - 74]) + 'Z', dk(st, 0.12), '', 1.8);
      f += tube([[x - 7, b - 34], [x - 7.5, b - 5]], 9.5, st) + tube([[x + 7, b - 34], [x + 7.5, b - 5]], 9.5, st) + P(pd([[x - 14, b], [x - 13, b - 7], [x - 2, b - 7], [x - 1, b]], true), c.cel(st), 1.4) + P(pd([[x + 1, b], [x + 2, b - 7], [x + 13, b - 7], [x + 14, b]], true), c.cel(st), 1.4) + L('M' + pt([x - 11, b - 20]) + 'l7,0 M' + pt([x + 4, b - 20]) + 'l7,0', sh, 1.2);
      f += body(c, pd([[x - 13, b - 50], [x + 13, b - 50], [x + 16, b - 22], [x - 16, b - 22]], true), st, L('M' + pt([x, b - 50]) + 'L' + pt([x, b - 22]), sh, 1.2) + F(pd([[x + 5, b - 52], [x + 18, b - 52], [x + 18, b - 20], [x + 6, b - 20]], true), sh, 0.7), 1.8);
      f += body(c, 'M' + pt([x - 13, b - 50]) + 'C' + pt([x - 15, b - 62]) + ' ' + pt([x - 14, b - 72]) + ' ' + pt([x - 9, b - 76]) + 'L' + pt([x + 9, b - 76]) + 'C' + pt([x + 14, b - 72]) + ' ' + pt([x + 15, b - 62]) + ' ' + pt([x + 13, b - 50]) + 'Z', st, L('M' + pt([x - 8, b - 66]) + 'Q' + pt([x, b - 60]) + ' ' + pt([x + 8, b - 66]), sh, 1.2) + F(pd([[x + 4, b - 78], [x + 16, b - 78], [x + 16, b - 48], [x + 5, b - 48]], true), sh, 0.7), 1.8);
      f += R(x - 14, b - 53, 28, 5, c.cel(dk(st, 0.08)), 1.4);
      // sword planted point-down, hands on the pommel
      f += P(pd([[x - 2.6, b - 48], [x + 2.6, b - 48], [x + 2, b - 6], [x, b - 1], [x - 2, b - 6]], true), c.cel(lt(st, 0.1)), 1.4) + R(x - 10, b - 52, 20, 4, c.cel(st), 1.4) + R(x - 1.8, b - 60, 3.6, 8, st, 1.2);
      f += tube([[x - 16, b - 70], [x - 14, b - 60], [x - 4, b - 58]], 6, st) + tube([[x + 16, b - 70], [x + 14, b - 60], [x + 4, b - 58]], 6, st) + C(x - 3, b - 58, 3.6, c.cel(st), 1.4) + C(x + 3, b - 58, 3.6, c.cel(st), 1.4) + C(x, b - 63, 2.4, c.cel(st), 1.2);
      f += E(x - 15, b - 72, 8, 6, c.cel(st), 1.6) + E(x + 15, b - 72, 8, 6, c.cel(st), 1.6);
      f += R(x - 3, b - 80, 6, 5, st, 1.2) + P('M' + pt([x - 7, b - 78]) + 'C' + pt([x - 8, b - 90]) + ' ' + pt([x + 8, b - 90]) + ' ' + pt([x + 7, b - 78]) + 'Z', c.cel(st), 1.5) + L('M' + pt([x - 5, b - 84]) + 'L' + pt([x + 5, b - 84]), OL, 1.2) + limb('M' + pt([x, b - 88]) + 'Q' + pt([x + 4, b - 96]) + ' ' + pt([x + 10, b - 94]), st, 2.4);
    }
    return o + (flip ? G(f, 'matrix(-1,0,0,1,' + n(2 * x) + ',0)') : f);
  }
  // Ambermoor oak: trunk and a merged, outlined canopy with cel shading
  function oak(c, x, y, s, col) {
    col = col || '#4a8a3a';
    var blobs = [[-26, -58, 22], [0, -80, 28], [26, -60, 22], [-12, -42, 18], [14, -42, 18]], outl = '', fill = '', cd = '', dark = '', lite = '';
    blobs.forEach(function (b) {
      var bx = x + b[0] * s, by = y + b[1] * s, r = b[2] * s;
      outl += C(bx, by, r + 2 * s, OL); fill += C(bx, by, r, col); cd += circD(bx, by, r);
      dark += C(bx + 6 * s, by + 7 * s, r * 0.8, dk(col, 0.25)); lite += C(bx - 7 * s, by - 8 * s, r * 0.42, lt(col, 0.22));
    });
    var o = E(x, y + 1, 30 * s, 5 * s, '#000', 0, 0.22);
    o += body(c, pd([[x - 7 * s, y], [x - 5 * s, y - 50 * s], [x + 5 * s, y - 50 * s], [x + 8 * s, y]], true), '#6a4a2e', F(pd([[x + 1 * s, y - 52 * s], [x + 9 * s, y - 52 * s], [x + 9 * s, y + 2], [x + 2 * s, y + 2]], true), '#3e2a1a', 0.6), 1.8 * s);
    return o + outl + fill + '<g clip-path="url(#' + c.clip(cd) + ')">' + dark + lite + '</g>';
  }
  function bush(c, x, y, s, col) {
    col = col || '#4e8a3a';
    var blobs = [[-12, -8, 10], [0, -13, 12], [12, -8, 10]], outl = '', fill = '', cd = '', dark = '';
    blobs.forEach(function (b) { var bx = x + b[0] * s, by = y + b[1] * s, r = b[2] * s; outl += C(bx, by, r + 1.6 * s, OL); fill += C(bx, by, r, col); cd += circD(bx, by, r); dark += C(bx + 4 * s, by + 5 * s, r * 0.8, dk(col, 0.25)); });
    return E(x, y + 1, 22 * s, 3 * s, '#000', 0, 0.2) + outl + fill + '<g clip-path="url(#' + c.clip(cd) + ')">' + dark + '</g>';
  }
  // city wall with merlons, masonry and a damp line at the foot
  function swWall(c, x0, x1, top, base) {
    var st = '#e2dccd', o = body(c, pd([[x0, base], [x0, top], [x1, top], [x1, base]], true), st, courses(x0, x1, top, base, 9, dk(st, 0.2), 0.8, 0.6, 16) + R(x0, base - 7, x1 - x0, 7, dk(st, 0.2), 0) + R(x0, top, x1 - x0, 4, lt(st, 0.3)), 1.8);
    for (var x = x0 + 2; x < x1 - 4; x += 13) o += R(x, top - 7, 7, 8, c.cel(st), 1.4);
    return o;
  }
  // the great gatehouse (unit scale, base at y): two tall towers, gate block, open arch with a raised portcullis
  function swGatehouse(c, x, y) {
    var st = SWS, o = '', q = { stone: st, sw: 2 };
    o += swTower(c, x - 54, y, 36, 96, 40, q) + swTower(c, x + 54, y, 36, 96, 40, q);
    o += body(c, pd([[x - 38, y], [x - 38, y - 96], [x + 38, y - 96], [x + 38, y]], true), st, courses(x - 38, x + 38, y - 96, y, 9, dk(st, 0.2), 0.8, 0.6, 14) + F(pd([[x + 16, y - 98], [x + 40, y - 98], [x + 40, y + 2], [x + 16, y + 2]], true), dk(st, 0.16), 0.6), 2);
    for (var m = 0; m < 6; m++) o += R(x - 38 + m * 13.4, y - 104, 8, 9, c.cel(st), 1.5);
    // arch surround with voussoirs, then the bright city beyond
    var vs = '';
    for (var i = 0; i <= 8; i++) { var a = PI + i * PI / 8; vs += 'M' + pt([x + Math.cos(a) * 22, y - 50 + Math.sin(a) * 22]) + 'L' + pt([x + Math.cos(a) * 29, y - 50 + Math.sin(a) * 29]); }
    o += P(archD(x - 29, y - 79, 58, 79), c.cel(dk(st, 0.06)), 2) + L(vs, dk(st, 0.3), 1.1);
    var op = archD(x - 22, y - 72, 44, 72), inner = R(x - 24, y - 74, 48, 76, c.lg([[0, '#fff6de'], [0.7, '#eadcbc'], [1, '#cdbf9e']]));
    inner += swRoofline(c, 211, x - 26, x + 26, y - 18, 0.8) + R(x - 24, y - 18, 48, 20, c.lg([[0, '#d8ccb0'], [1, '#bcae90']])) + swHangBanner(c, x - 12, y - 44, 7, 18, 1) + swHangBanner(c, x + 12, y - 44, 7, 18, 1);
    var bars = '';
    for (var b2 = -18; b2 <= 18; b2 += 6) bars += 'M' + pt([x + b2, y - 74]) + 'L' + pt([x + b2, y - 60]);
    inner += L(bars, OL, 3.4) + L(bars, '#4a4a54', 1.6) + L('M' + pt([x - 22, y - 64]) + 'L' + pt([x + 22, y - 64]), '#4a4a54', 2.2);
    for (var b3 = -18; b3 <= 18; b3 += 6) inner += P(pd([[x + b3 - 1.6, y - 61], [x + b3, y - 56], [x + b3 + 1.6, y - 61]], true), '#4a4a54', 0.8);
    inner += F(pd([[x - 24, y - 74], [x + 24, y - 74], [x + 24, y - 60], [x - 24, y - 52]], true), '#000', 0.18);
    o += '<g clip-path="url(#' + c.clip(op) + ')">' + inner + '</g>' + L(op.replace(/Z$/, ''), OL, 2);
    // crest medallion over the arch, banners on the towers
    o += C(x, y - 88, 8.5, c.cel(dk(st, 0.08)), 1.8) + C(x, y - 88, 6.5, SW_BLUE, 1) + sunCrest(c, x, y - 88, 5);
    o += swHangBanner(c, x - 54, y - 88, 20, 52, 1.8) + swHangBanner(c, x + 54, y - 88, 20, 52, 1.8);
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  function wfSky(c, sx, sy) { return sky(c, '#5a8cc2', '#b4c8cc', '#f4d8a2') + sun(c, sx, sy, 10); }
  function wfGround(c, y) { return ground(c, y, GROUND, GROUND2); }
  var SCENES = {
    sentinel_hill: function (c) {
      var o = wfSky(c, 64, 52) + cloud(150, 44, 1.1) + cloud(330, 30, 0.8) + cloud(40, 84, 0.6, 0.8);
      o += hills(c, 3, 146, 12, '#c8b48c', 50) + hills(c, 5, 152, 10, '#bca270', 70);
      // the hill
      var hl = 'M120,164 C160,132 204,104 256,100 C304,96 346,120 380,152 L404,164 Z';
      o += body(c, hl, '#c4a052', F('M280,94 C330,104 370,130 404,160 L404,166 L300,166 C310,140 300,112 280,94 Z', dk('#c4a052', 0.22), 0.7) + grass(7, 104, 160, '#9a7430', 60, 0.5, 1, 1, 150, 380) + F('M160,140 C200,112 236,104 262,104 C230,112 200,126 176,146 Z', lt('#c4a052', 0.2), 0.6), 2);
      o += banner(c, 216, 112, 44, 0.8) + banner(c, 312, 110, 44, 0.8);
      o += watchtower(c, 264, 106, 0.9);
      o += wfGround(c, 160);
      o += road(c, 160, 16, 70, DUST, 0.6, 240, 196) + ruts(160, 240, 196, 16, 70, '#9a7a44');
      o += grass(11, 162, 238, GRASSD, 130, 0.6, 1.8, 1.1) + grass(13, 164, 238, GRASSL, 70, 0.6, 1.6, 1) + pebbles(15, 168, 236, '#8a6a3a', 14);
      // the inn (lit) and militia tents
      o += farmhouse(c, 74, 166, 0.66, { lit: 1 });
      o += tent(c, 156, 170, 0.62) + tent(c, 336, 172, 0.72, '#ece2cc');
      o += campfire(c, 206, 182, 0.72);
      o += fence(c, 110, 136, 176, 12);
      o += barrel(c, 22, 206, 1.1) + crate(c, 40, 208, 1) + barrel(c, 380, 212, 1.1) + crate(c, 362, 214, 1);
      o += tufts(c, [[12, 230, 1.1], [390, 234, 1.1], [150, 234, 0.8], [270, 236, 0.9]]);
      return o + warmth(c, true) + vignette(c);
    },
    furlbrow_farm: function (c) {
      var o = wfSky(c, 330, 46) + cloud(90, 40, 1) + cloud(230, 60, 0.8, 0.85);
      // Ambermoor's green treeline far to the east (left)
      o += hills(c, 21, 150, 14, '#8aa870', 22) + hills(c, 23, 152, 8, '#c4b080', 60);
      o += wfGround(c, 156);
      o += road(c, 156, 12, 90, DUST, 0.6, 118, 206) + ruts(156, 118, 206, 12, 90, '#9a7a44');
      o += grass(31, 158, 238, GRASSD, 130, 0.6, 1.8, 1.1) + grass(33, 160, 238, GRASSL, 60, 0.6, 1.6, 1);
      // pumpkin patch rows (dark earth)
      o += F('M232,164 L404,160 L404,196 L300,200 Z', '#7a5a34', 0.5) + F('M-4,172 L96,170 L60,206 L-4,208 Z', '#7a5a34', 0.5);
      o += vines(35, 164, 196, 240, 400, 20) + vines(37, 172, 204, 0, 90, 12);
      o += farmhouse(c, 300, 164, 0.86, { ruin: 1, roof: '#7a4a36' });
      o += brokenFence(c, 214, 400, 176, 1, 7);
      o += pumpkin(c, 236, 186, 0.9) + pumpkin(c, 260, 192, 1.1) + pumpkin(c, 330, 188, 1) + pumpkin(c, 372, 192, 1.2, true) + pumpkin(c, 290, 184, 0.8);
      o += pumpkin(c, 20, 196, 1.1) + pumpkin(c, 50, 188, 0.9) + pumpkin(c, 72, 182, 0.7, true);
      o += pumpkin(c, 350, 226, 1.4) + pumpkin(c, 30, 232, 1.3);
      // blank signpost at the road
      o += limb('M150,176 L150,146', '#6a4a2a', 2.6) + P('M136,150 L164,148 L168,153 L164,157 L136,158 Z', c.cel('#a07a4a'), 1.6);
      o += tufts(c, [[110, 230, 0.9], [300, 236, 0.9], [396, 206, 1]]);
      return o + warmth(c, false) + vignette(c);
    },
    saldean_farm: function (c) {
      var o = wfSky(c, 70, 44) + cloud(200, 36, 1.2) + cloud(350, 58, 0.8);
      o += hills(c, 41, 146, 12, '#c8b48c', 50) + hills(c, 43, 150, 8, '#b8a070', 70);
      o += wfGround(c, 154);
      // wheat fields in the back band
      o += wheatBand(c, 45, -4, 404, 152, 18, '#d8aa44', 0.8);
      o += farmhouse(c, 104, 160, 0.82, { lit: 1 });
      o += barn(c, 306, 160, 0.9);
      o += wheatBand(c, 47, 150, 260, 164, 12, WHEAT, 0.9);
      o += scarecrow(c, 204, 170, 0.62);
      o += road(c, 168, 14, 60, DUST, 0.55, 150, 200);
      o += grass(51, 168, 238, GRASSD, 110, 0.6, 1.8, 1.1) + grass(53, 170, 238, GRASSL, 60, 0.6, 1.6, 1);
      o += fence(c, 0, 60, 184, 13) + fence(c, 340, 400, 186, 13);
      o += wheatBand(c, 55, -4, 58, 202, 40, WHEAT, 1.2) + wheatBand(c, 57, 346, 404, 206, 36, WHEAT, 1.2);
      o += sack(c, 250, 186, 0.8) + sack(c, 262, 188, 0.7);
      o += wheatClump(c, 70, 236, 1.1) + wheatClump(c, 330, 238, 1.1) + tufts(c, [[160, 236, 0.8]]);
      return o + warmth(c, true) + vignette(c);
    },
    jangolode_mine: function (c) {
      var o = wfSky(c, 336, 40) + cloud(250, 50, 0.9, 0.85) + cloud(380, 80, 0.6, 0.8);
      o += hills(c, 61, 150, 12, '#c4b088', 60);
      o += mineHill(c, 112, 166, 1);
      o += wfGround(c, 162);
      o += F('M40,168 C120,160 300,160 380,170 C400,196 380,232 300,238 C200,244 80,240 30,222 C10,202 20,172 40,168 Z', '#a07a4a', 0.4);
      o += grass(63, 164, 238, GRASSD, 60, 0.6, 1.8, 1.1, 0, 60) + grass(64, 164, 238, GRASSD, 70, 0.6, 1.8, 1.1, 320, 400) + pebbles(65, 170, 236, '#6a4a2a', 22);
      o += rails(112, 168, 58, 242, 3, 13);
      o += minecart(c, 82, 208, 1.05);
      o += shack(c, 300, 168, 0.9);
      o += lanternPost(c, 250, 180, 40, 0.9);
      o += defCrate(c, 344, 190, 1) + defCrate(c, 366, 192, 1.1) + defCrate(c, 356, 176, 0.9) + barrel(c, 322, 194, 1);
      o += crate(c, 172, 180, 0.8) + sack(c, 186, 182, 0.7);
      o += rock(c, 20, 236, 38, 16, '#9a8468') + tufts(c, [[392, 230, 1.1], [150, 236, 0.8]]);
      return o + warmth(c, false) + vignette(c);
    },
    molsen_farm: function (c) {
      var o = wfSky(c, 180, 40) + cloud(60, 36, 1) + cloud(290, 30, 1.1) + cloud(380, 74, 0.6, 0.8);
      o += hills(c, 71, 146, 10, '#c8b48c', 50);
      o += wfGround(c, 150);
      o += wheatBand(c, 73, -4, 404, 150, 16, '#d6a840', 0.7);
      o += barn(c, 86, 162, 0.88, { burnt: 1 });
      o += windmill(c, 318, 162, 0.92);
      // big wheat fields either side, trampled path in the middle
      o += wheatBand(c, 75, -4, 150, 170, 30, WHEAT, 1) + wheatBand(c, 77, 256, 404, 168, 30, WHEAT, 1);
      o += F('M150,168 C170,170 236,170 256,168 L300,242 L110,242 Z', '#b08a48', 0.7);
      o += grass(81, 170, 238, GRASSD, 70, 0.6, 1.6, 1.1, 120, 290);
      // golem tracks leading up the path
      [[196, 176, 0.6, -20], [214, 184, 0.7, -16], [192, 194, 0.8, -24], [220, 206, 0.9, -14], [186, 218, 1, -26], [226, 232, 1.1, -12]].forEach(function (g) { o += golemPrint(g[0], g[1], g[2], g[3]); });
      o += wheatBand(c, 83, -4, 96, 206, 40, WHEAT, 1.25) + wheatBand(c, 85, 312, 404, 210, 36, WHEAT, 1.25);
      o += wheatClump(c, 112, 234, 1.1) + wheatClump(c, 296, 236, 1.05);
      o += L('M150,172 L140,180 M256,170 L266,178', '#8a6a2a', 1.6, 0.8);
      return o + warmth(c, true) + vignette(c);
    },
    the_longshore: function (c) {
      var o = sky(c, '#5a8cc2', '#b8cad0', '#f6dcaa') + sun(c, 90, 70, 11, '#ffdca0') + cloud(220, 40, 1) + cloud(60, 30, 0.7, 0.85);
      // cliffs to the east (right)
      o += body(c, 'M300,146 C316,120 336,104 360,100 C380,96 396,104 406,110 L406,160 L300,160 Z', '#a88a62', F('M370,98 C390,102 404,110 406,114 L406,160 L376,160 C384,136 382,114 370,98 Z', dk('#a88a62', 0.28), 0.8) + L('M312,132 Q350,128 406,132 M320,146 Q360,142 406,146', dk('#a88a62', 0.25), 1.4, 0.7) + F('M330,108 C346,100 366,96 384,98 C370,102 350,106 336,114 Z', '#c8b060', 0.8), 2);
      o += sea(c, 136, 164, 5);
      // sand
      var sand = 'M-4,166 C60,160 140,164 210,158 C250,154 290,156 320,152 L404,150 L404,242 L-4,242 Z';
      o += P(sand, c.lg([[0, '#ecd6a0'], [0.4, '#dcc088'], [1, '#c4a46a']]), 0);
      o += F('M-4,166 C60,160 140,164 210,158 C250,154 290,156 320,152 L404,150 L404,158 L320,160 C290,164 250,162 210,166 C140,172 60,168 -4,174 Z', '#b09868', 0.55);
      o += surf(c, [[-4, 165], [40, 162], [90, 163], [140, 162], [190, 159], [240, 156], [290, 155], [330, 152]], 9);
      o += surf(c, [[20, 152], [70, 150], [120, 152], [170, 149], [220, 150]], 11).replace(/opacity="0.85"/, 'opacity="0.5"');
      o += pebbles(91, 176, 236, '#a88a5a', 20) + grass(93, 184, 238, '#a89a50', 40, 0.5, 1.2, 1, 300, 400);
      o += wreck(c, 70, 184, 0.9);
      o += murlocHut(c, 300, 172, 0.72) + murlocHut(c, 358, 176, 0.92, '#8a7a58') + fishRack(c, 330, 186, 0.8);
      o += driftwood(c, 206, 176, 0.7, -4) + driftwood(c, 30, 230, 1.1, 6) + driftwood(c, 370, 232, 1, -8);
      o += shell(150, 200, 1) + shell(260, 222, 1.2, '#f4e4d0') + shell(120, 228, 1.1) + seaweed(170, 214, 1) + seaweed(290, 206, 0.9);
      o += rock(c, 236, 180, 20, 10, '#9a8c7a') + rock(c, 390, 204, 26, 14, '#9a8c7a');
      return o + warmth(c, true) + vignette(c, '#fff0d8', '#2a1a0a');
    },
    dagger_hills: function (c) {
      var o = sky(c, '#6090c0', '#c0c8c0', '#f0d09a') + sun(c, 334, 46, 10, '#ffdca0') + cloud(170, 40, 1) + cloud(40, 62, 0.7, 0.85);
      // the sea glimpsed far to the west (left)
      o += R(-2, 132, 150, 24, c.lg([[0, '#9ab4c4'], [1, SEA]])) + L('M4,138 q8,-1.5 16,0 M40,142 q9,-1.5 18,0 M76,137 q8,-1.5 16,0 M18,148 q10,-1.5 20,0', '#e4eef2', 1, 0.6);
      o += F('M60,156 C90,136 130,124 170,128 C210,116 260,112 300,120 C340,114 380,118 404,124 L404,170 L60,170 Z', '#b89a70');
      o += F('M60,156 C90,136 130,124 170,128 C150,132 120,142 96,158 Z', lt('#b89a70', 0.15), 0.7);
      // a dust devil swirling on the far slopes
      o += G(dustDevilArt(c), 'matrix(0.44,0,0,0.44,256,84)', 0.95);
      // rolling brown hills, outlined
      o += body(c, 'M-4,166 C30,160 70,152 116,148 C150,150 184,140 222,134 C266,128 310,138 346,134 C372,132 392,136 404,138 L404,176 L-4,176 Z', '#a8844e',
        F('M300,130 C340,132 380,134 404,138 L404,176 L330,176 C340,160 330,142 300,130 Z', dk('#a8844e', 0.22), 0.7) + F('M20,150 C60,140 96,140 120,148 C90,146 56,150 30,160 Z', lt('#a8844e', 0.2), 0.6) + grass(95, 136, 170, '#7a5a2a', 50, 0.5, 1, 1), 2);
      o += ground(c, 164, '#bc9450', '#8a6632');
      o += road(c, 164, 14, 70, '#d4b480', 0.55, 200, 190);
      o += grass(97, 166, 238, '#7a5a26', 110, 0.6, 1.8, 1.1) + grass(99, 168, 238, '#dcc080', 50, 0.6, 1.6, 1) + pebbles(101, 172, 236, '#7a5a34', 20);
      o += gnollTent(c, 250, 166, 0.62, '#a08058');
      o += gnollTent(c, 84, 172, 0.95, null, true) + gnollTent(c, 326, 174, 1.05, '#8a6a46');
      o += pike(c, 282, 176, 24, 0.9);
      // bonfire
      o += campfire(c, 200, 186, 1.05) + flame(c, 200, 176, 1.1);
      o += bone(130, 206, 14, 0.3, 1) + bone(272, 214, 16, -0.4, 1.1) + skull(c, 300, 200, 0.9) + bone(170, 222, 12, 0.9, 0.9);
      o += deadTree(c, 22, 206, 1.05) + deadTree(c, 384, 202, 0.95, '#62503f');
      o += rock(c, 356, 240, 40, 16, '#9a8468') + tuft(c, 60, 236, 0.9, '#b09040') + tuft(c, 250, 238, 0.8, '#b09040');
      return o + warmth(c, false) + vignette(c, '#fff0d8', '#2a1406');
    },
    gold_coast_quarry: function (c) {
      var o = wfSky(c, 70, 58) + cloud(170, 40, 1) + cloud(300, 26, 0.8, 0.85) + cloud(40, 92, 0.55, 0.8);
      // the Great Sea to the west, a far headland
      o += sea(c, 124, 164, 13);
      o += F('M-4,126 C20,116 52,114 84,125 L84,127 L-4,127 Z', '#8aa0ae', 0.85);
      // quarry wall: dry grass crest, then three cut terraces stepping down toward the pit floor
      o += body(c, 'M178,92 C180,84 190,74 204,70 C230,62 256,62 290,64 C330,60 372,58 404,60 L404,92 L178,92 Z', '#b09a58', F('M320,58 C360,58 390,58 404,60 L404,90 L330,90 C340,78 334,66 320,58 Z', dk('#b09a58', 0.2), 0.7) + grass(117, 62, 86, '#7a6a30', 30, 0.5, 0.9, 1, 190, 400), 2);
      o += ledge(c, 184, 404, 82, 30, '#c0a87e', 121) + ledge(c, 152, 404, 110, 28, '#b8a078', 123) + ledge(c, 120, 404, 136, 28, '#b09872', 125);
      // low cliff edge on the sea side
      o += body(c, 'M-4,142 C12,136 30,134 46,138 L58,166 L-4,166 Z', '#b09872', F('M-4,142 C12,136 30,134 46,138 L44,142 C30,139 12,140 -4,146 Z', lt('#b09872', 0.28), 0.9) + L('M2,152 L50,150 M0,160 L54,158', dk('#b09872', 0.25), 1.1, 0.7), 2);
      o += scaffold(c, 236, 276, 110, 28, 1) + crane(c, 334, 84, 0.86, -1, 34) + crane(c, 22, 140, 0.56, 1, 40, 'bucket');
      o += ground(c, 160, '#d0b688', '#a4885c');
      o += F('M60,166 C140,160 280,160 360,168 C392,196 360,236 280,240 C180,246 70,240 40,220 C20,200 30,172 60,166 Z', '#e0caa0', 0.35);
      o += pebbles(127, 166, 238, '#8a7050', 26) + pebbles(129, 170, 236, '#f0e0c0', 16) + grass(131, 170, 238, '#9a7a44', 50, 0.6, 1.6, 1.1, 0, 90) + grass(133, 170, 238, '#9a7a44', 40, 0.6, 1.6, 1.1, 330, 400);
      // track along the foot of the wall with two ore carts
      o += sideTrack(196, 170, 404, 166) + minecart(c, 268, 171, 0.9) + minecart(c, 344, 169, 0.95);
      // cut blocks waiting to be hauled
      o += stoneBlock(c, 136, 172, 20, 12) + stoneBlock(c, 156, 174, 18, 11, '#b09a72') + stoneBlock(c, 146, 161, 18, 11, '#c4ae84');
      // Grey Hood contraband
      o += defCrate(c, 30, 196, 1.05) + defCrate(c, 52, 200, 1) + defCrate(c, 40, 181, 0.9) + barrel(c, 12, 204, 1) + defCrate(c, 384, 208, 1.1) + barrel(c, 366, 212, 1.05);
      o += stoneBlock(c, 206, 238, 26, 10, '#b8a078') + rock(c, 310, 240, 34, 12, '#a8906a') + tufts(c, [[96, 236, 0.8], [260, 238, 0.8]], '#b09a50');
      return o + warmth(c, true) + vignette(c);
    },
    moonbrook: function (c) {
      var o = sky(c, '#6a7280', '#aa9884', '#e2a470') + sun(c, 74, 64, 9, '#ffc890');
      // smoke hanging over the town
      o += smoke(96, 132, 1.5, 141, '#5a5450', 7) + smoke(318, 118, 1.7, 143, '#4e4844', 8) + F('M-10,20 C80,10 160,34 240,20 C300,10 360,24 410,16 L410,-10 L-10,-10 Z', '#5a5654', 0.55);
      o += hills(c, 145, 144, 12, '#9a8a6e', 50) + hills(c, 147, 150, 8, '#86765a', 70);
      // the mine at the back of town: the way into the Smugglers' Deep
      o += shaftHill(c, 204, 152, 0.7) + defBanner(c, 232, 150, 30, 0.6);
      o += ground(c, 150, '#a88e5c', '#6c583a');
      o += road(c, 152, 10, 66, '#c0a878', 0.5, 204, 196) + ruts(152, 204, 196, 10, 66, '#7a6444');
      o += E(120, 196, 40, 6, ASH, 0, 0.35) + E(300, 206, 46, 6, ASH, 0, 0.3) + E(210, 228, 60, 7, ASH, 0, 0.22);
      o += grass(151, 158, 238, '#6a5a36', 90, 0.6, 1.6, 1.1) + grass(153, 160, 238, '#b09a60', 30, 0.6, 1.4, 1) + pebbles(155, 164, 236, '#4a3a2a', 22);
      // burned homes and the broken town hall
      o += farmhouse(c, 142, 154, 0.5, { ruin: 1, wall: '#8a7a66', roof: '#4a3028', stone: '#8a8274' });
      o += townHall(c, 314, 162, 0.8);
      o += farmhouse(c, 64, 166, 0.82, { ruin: 1, wall: '#867660', roof: '#44302a', stone: '#868070' });
      o += smoke(84, 96, 0.9, 149, '#4e4844', 6) + flame(c, 44, 150, 0.7) + flame(c, 296, 106, 0.8) + flame(c, 356, 150, 0.6);
      o += defBanner(c, 118, 178, 48, 0.8) + defBanner(c, 250, 180, 46, 0.8);
      // fallen charred timbers, rubble, a Grey Hood crate
      o += charBeam(c, 26, 222, 50, 0.25, 1) + charBeam(c, 44, 232, 40, -0.3, 0.9) + charBeam(c, 372, 230, 44, -0.2, 1);
      o += rock(c, 12, 206, 22, 10, '#8a8274') + rock(c, 392, 214, 20, 10, '#8a8274') + defCrate(c, 356, 204, 1) + barrel(c, 384, 200, 0.9, '#5a3a24');
      o += C(160, 214, 1.6, '#ff9a3a', 0, 0.8) + C(248, 222, 1.4, '#ff9a3a', 0, 0.8) + C(330, 188, 1.6, '#ffb040', 0, 0.8);
      return o + R(0, 0, 400, 240, c.lg([[0, '#ff8a3a', 0], [1, '#ff8a3a', 0.12]])) + vignette(c, '#ffe0c0', '#1a0e06');
    },
    the_dead_acre: function (c) {
      var o = sky(c, '#6c7682', '#9ea2a0', '#c2b89e') + C(290, 54, 30, glow(c, '#f0ecd8', 0.35)) + overcast(c, 161);
      o += crow(120, 62, 1, 1) + crow(142, 54, 0.8, 1) + crow(252, 78, 0.7, 1);
      o += hills(c, 163, 146, 10, '#948a70', 50) + hills(c, 165, 150, 8, '#827a62', 70);
      o += ground(c, 150, '#9a8a66', '#6a5c40');
      // dead wheat as far as the eye can see
      o += wheatBand(c, 167, -4, 404, 150, 16, '#958a6e', 0.7);
      o += deadTree(c, 186, 162, 0.55, '#5e5850');
      o += windmill(c, 316, 162, 0.9, { broken: [1, 0.35, 0, 0.8], a0: -0.25, sail: '#a8a292', wood: '#7a6c5a', cap: '#5a4238', stone: '#9a9486' });
      o += wheatBand(c, 169, -4, 150, 170, 28, '#a09276', 1) + wheatBand(c, 171, 256, 404, 168, 28, '#a09276', 1);
      o += F('M150,168 C170,170 236,170 256,168 L300,242 L110,242 Z', '#8a7a58', 0.7);
      o += grass(173, 170, 238, '#5a4e38', 70, 0.6, 1.6, 1.1, 120, 290) + pebbles(175, 176, 236, '#5a4e3a', 16, 120, 290);
      o += golemScrap(c, 'hull', 218, 178, 0.55) + golemScrap(c, 'gear', 170, 186, 0.6);
      o += brokenFence(c, 262, 400, 180, 1, 177);
      // the snapped-off sail lying against the mill
      o += G(limb('M352,170 L398,150', '#6a5a48', 2.4) + L('M356,168 L362,178 M364,165 L370,175 M372,161 L378,171 M380,158 L386,168 M388,154 L394,164 M362,178 L396,163', '#5a4a3a', 1.2) + P('M366,174 L380,168 L376,160 L364,166 Z', c.cel('#a8a292'), 1.2), 'translate(-6,14)');
      o += deadTree(c, 36, 204, 1.12, '#5a524a') + crow(24, 145, 1) + crow(62, 124, 0.9);
      o += wheatBand(c, 179, -4, 82, 208, 36, '#a09276', 1.25) + wheatBand(c, 181, 326, 404, 210, 34, '#a09276', 1.25);
      o += golemScrap(c, 'head', 68, 232, 0.9) + golemScrap(c, 'arm', 350, 234, 0.9);
      o += tufts(c, [[150, 236, 0.8], [276, 238, 0.8]], '#8a7a58');
      return o + F('M0,0 L400,0 L400,240 L0,240 Z', '#8a9aa8', 0.1) + vignette(c, '#e8e8e0', '#1a1410');
    },
    // ---- Kingsmere ----
    stormwind: function (c) {
      var o = swSky(c) + cloud(64, 44, 1) + cloud(212, 22, 0.75, 0.9) + cloud(250, 74, 0.5, 0.8);
      // the cathedral spire (left) and Kingsmere Keep (right) over the far rooftops
      o += G(swCathedral(c, 96, 132), at(0.74, 96, 132)) + G(swKeep(c, 296, 132), at(0.8, 296, 132));
      o += swRoofline(c, 201, -10, 410, 136, 1) + swHaze(c, 150);
      // a canal crossing the far end of the street
      o += swCanal(c, 136, 147, 203);
      o += swStreet(c, 148, 200, 124);
      o += P(pd([[160, 149], [160, 144], [186, 143], [186, 149]], true), c.cel('#e6dece'), 1.1) + P(pd([[214, 149], [214, 143], [240, 144], [240, 149]], true), c.cel('#e6dece'), 1.1) + L('M166,148 l0,-4 M172,148 l0,-4 M178,148 l0,-4 M222,148 l0,-4 M228,148 l0,-4 M234,148 l0,-4', '#a89e8a', 1, 0.8);
      o += pebbles(205, 156, 238, '#aa9e84', 26, 140, 330) + pebbles(207, 160, 238, '#f2ecde', 14, 150, 320);
      // side streets of shops, back to front
      o += G(swHouse(c, 146, 151, { gable: 1, bays: 2, lit: 1 }), at(0.42, 146, 151)) + G(swHouse(c, 254, 151, { gable: 1, bays: 2, roof: '#34579e' }), at(0.42, 254, 151));
      o += G(swLamp(c, 172, 156, 34), at(0.62, 172, 156)) + G(swLamp(c, 228, 156, 34), at(0.62, 228, 156));
      o += G(swHouse(c, 104, 162, { sign: 'mug', lit: 2, chimney: 1, banner: -16 }), at(0.62, 104, 162));
      o += G(swHouse(c, 296, 164, { gable: 1, sign: 'potion', flip: 1, awning: '#b8434a', lit: 1 }), at(0.64, 296, 164));
      o += G(swStall(c, 138, 172, { goods: 'fruit', c1: '#c8424a', seed: 11 }), at(0.6, 138, 172));
      o += G(swStall(c, 262, 176, { goods: 'cloth', c1: SW_BLUE }), at(0.68, 262, 176));
      o += G(swHouse(c, 22, 184, { sign: 'anvil', chimney: 1, bays: 4, lit: 1 }), at(1.02, 22, 184));
      o += G(swHouse(c, 382, 186, { gable: 1, sign: 'bread', flip: 1, banner: -18, lit: 2, rh: 44 }), at(1.06, 382, 186));
      o += banner(c, 322, 196, 56, 0.9);
      o += G(swStall(c, 352, 216, { goods: 'bottles', c1: '#6a4ab0', c2: '#f0e4c8' }), at(0.92, 352, 216));
      // foreground props at the edges
      o += barrel(c, 10, 212, 1.1) + crate(c, 12, 232, 1.1) + sack(c, 390, 236, 1) + crate(c, 372, 238, 1.05);
      return o + vignette(c, '#ffffff', '#1e2230');
    },
    stormwind_bank: function (c) {
      var wall0 = '#ede5d3', wall1 = '#cdc2aa', o = R(0, 0, 400, 240, c.lg([[0, wall0], [1, wall1]]));
      o += courses(0, 400, 34, 132, 12, dk(wall1, 0.2), 0.8, 0.5, 30);
      // vaulted ceiling with gold ribs
      var rib = 'M-4,40 Q50,4 100,34 Q150,0 200,26 Q250,0 300,34 Q350,4 404,40';
      o += P('M-4,-4 L404,-4 L404,40 Q350,4 300,34 Q250,0 200,26 Q150,0 100,34 Q50,4 -4,40 Z', c.lg([[0, '#7a6e5c'], [1, '#a4987f']]), 1.8) + L(rib, SW_GOLD, 2.2, 0.9) + L('M100,-4 L100,30 M300,-4 L300,30 M200,-4 L200,22', '#6a5e4c', 3);
      // tall stained-glass windows
      [100, 300].forEach(function (wx) {
        o += P(archD(wx - 21, 38, 42, 94), c.cel(dk(wall1, 0.12)), 2) + P(archD(wx - 16, 44, 32, 84), c.lg([[0, '#dff2ff'], [0.55, '#7ab8ee'], [1, '#2e62b0']]), 1.6);
        o += L('M' + wx + ',48 L' + wx + ',128 M' + (wx - 16) + ',84 L' + (wx + 16) + ',84', dk(wall1, 0.3), 2) + sunCrest(c, wx, 64, 6) + C(wx, 106, 26, glow(c, '#ffffff', 0.25));
      });
      // the vault: recessed arch and a round steel door
      o += P(archD(146, 26, 108, 106), c.lg([[0, dk(wall1, 0.22)], [1, dk(wall1, 0.36)]]), 2) + courses(148, 252, 60, 132, 12, dk(wall1, 0.45), 0.8, 0.5, 24);
      o += vaultDoor(c, 200, 84, 38);
      // wall sconces either side of the vault
      [134, 266].forEach(function (sx) { o += C(sx, 84, 22, glow(c, '#ffc060', 0.5)) + limb('M' + (sx - 4) + ',100 L' + sx + ',96 L' + (sx + 4) + ',100', '#4a3a2a', 1.8) + P('M' + (sx - 6) + ',94 L' + (sx + 6) + ',94 L' + (sx + 4) + ',99 L' + (sx - 4) + ',99 Z', c.cel(SW_GOLD), 1.3) + flame(c, sx, 94, 0.6); });
      // back pillars with banners
      o += swPillar(c, 46, 30, 136, 24) + swPillar(c, 354, 30, 136, 24);
      o += swHangBanner(c, 46, 50, 18, 60, 1.6) + swHangBanner(c, 354, 50, 18, 60, 1.6);
      // the long counter: marble top, dark wood front with gold-framed panels
      o += R(44, 133, 312, 38, c.lg([[0, '#6e452a'], [1, '#48291a']]), 2);
      for (var pi = 0; pi < 6; pi++) { var px = 52 + pi * 50.6; o += L(pd([[px, 140], [px + 44, 140], [px + 44, 165], [px, 165]], true), SW_GOLD, 1.4, 0.9); if (pi % 2) o += sunCrest(c, px + 22, 152, 5); else o += C(px + 22, 152, 3.2, SW_GOLD, 1); }
      o += R(44, 133, 312, 3, SW_GOLD) + R(38, 126, 324, 8, c.lg([[0, '#fbf8f0'], [1, '#d6cfbf']]), 1.8) + L('M60,128 q10,2 20,0 M170,129 q12,2 24,0 M290,128 q10,2 20,0', '#b8aa98', 0.9, 0.7) + R(40, 168, 320, 5, '#3a2416', 1.4);
      // on the counter: coin stacks, a ledger, scales, a strongbox
      [[82, 0], [90, 1], [86, 2]].forEach(function (cs, i) { for (var k = 0; k < 3 + i; k++) o += E(cs[0] + i * 1, 125 - k * 2.2 - cs[1] * 0, 4.2, 1.6, c.cel(SW_GOLD), 0.9); });
      o += P('M132,126 L152,126 L154,121 L134,121 Z', c.cel('#7a2a2a'), 1.3) + L('M143,121 L144,126', '#e8dcc0', 1) + L('M134,122.5 L153,122.5', '#f2e8d2', 0.8);
      o += limb('M268,126 L268,108', '#8a6a2a', 1.4) + limb('M258,110 L278,110', '#8a6a2a', 1.4) + L('M258,110 L255,118 M258,110 L261,118 M278,110 L275,118 M278,110 L281,118', '#6a5020', 0.8) + E(258, 118, 5, 1.6, c.cel(SW_GOLD), 1) + E(278, 118, 5, 1.6, c.cel(SW_GOLD), 1);
      o += R(302, 114, 20, 12, c.cel('#6a4428'), 1.4) + R(302, 112, 20, 4, c.cel('#7a5032'), 1.3) + R(310, 116, 4, 5, SW_GOLD, 0.8);
      // marble floor in perspective, a blue runner down the middle
      var vy = 118, rows = [171, 177, 185, 196, 211, 231, 258];
      o += R(0, 171, 400, 69, '#e6dfcf');
      for (var ri = 0; ri < rows.length - 1; ri++) for (var k = -9; k < 9; k++) {
        if ((ri + k) % 2 === 0) continue;
        var ya = rows[ri], yb = rows[ri + 1], fa = (ya - vy) / (240 - vy), fb = (yb - vy) / (240 - vy);
        o += F(pd([[200 + k * 44 * fa, ya], [200 + (k + 1) * 44 * fa, ya], [200 + (k + 1) * 44 * fb, yb], [200 + k * 44 * fb, yb]], true), '#cfc4ac');
      }
      o += R(0, 171, 400, 12, c.lg([[0, '#000', 0.25], [1, '#000', 0]]));
      o += P('M178,171 L222,171 L254,242 L146,242 Z', c.lg([[0, '#2a58a8'], [1, '#1e4488']]), 1.6) + L('M183,171 L154,242 M217,171 L246,242', SW_GOLD, 1.6);
      o += E(200, 206, 120, 18, c.rg([[0, '#fff8e0', 0.3], [1, '#fff8e0', 0]]));
      // front pillars framing the hall
      o += swPillar(c, 10, -6, 238, 34) + swPillar(c, 390, -6, 238, 34);
      o += swHangBanner(c, 10, 30, 22, 70, 1.8) + swHangBanner(c, 390, 30, 22, 70, 1.8);
      // crates of goods for the auction house
      o += crate(c, 340, 222, 1.25) + crate(c, 366, 230, 1.35) + crate(c, 352, 202, 1.15, '#b8844a') + barrel(c, 318, 232, 1.2) + sack(c, 388, 238, 1.1);
      o += crate(c, 34, 198, 1) + sack(c, 52, 200, 0.9);
      return o + vignette(c, '#fff4dc', '#2a1a0a');
    },
    stormwind_gate: function (c) {
      var o = swSky(c) + cloud(70, 34, 1) + cloud(250, 20, 0.7, 0.9) + cloud(380, 64, 0.55, 0.85);
      // the city beyond the walls
      o += G(swCathedral(c, 96, 104), at(0.5, 96, 104)) + G(swKeep(c, 312, 102), at(0.56, 312, 102)) + swHaze(c, 110);
      o += swWall(c, -4, 404, 96, 152) + swTower(c, 28, 152, 26, 78, 30) + swTower(c, 372, 152, 26, 78, 30);
      o += swGatehouse(c, 200, 152);
      // the moat, and the long bridge running out toward Ambermoor
      o += R(-2, 150, 404, 56, c.lg([[0, '#7aa6cc'], [0.5, '#5a8ab8'], [1, '#3e6c9c']])) + F('M-2,150 L402,150 L402,158 L-2,158 Z', '#dde6ea', 0.35);
      var r = rng(221), rp = '';
      for (var i = 0; i < 26; i++) { var yy = 160 + r() * 42, xx = r() * 400, w = 6 + (yy - 150) * 0.3; rp += 'M' + pt([xx, yy]) + 'q' + n(w / 2) + ',-1.4 ' + n(w) + ',0'; }
      o += L(rp, '#e8f4fa', 1, 0.6);
      var ex = function (y) { return 178 - 68 * (y - 152) / 50; };
      o += P(pd([[178, 152], [222, 152], [400 - ex(206), 206], [ex(206), 206]], true), c.lg([[0, '#e2dac8'], [1, '#cfc4ac']]), 0);
      var dj = '';
      for (var k = -5; k <= 5; k++) dj += 'M' + pt([200 + k * 4, 152]) + 'L' + pt([200 + k * 17, 206]);
      [158, 166, 176, 190].forEach(function (y) { dj += 'M' + pt([ex(y), y]) + 'L' + pt([400 - ex(y), y]); });
      o += L(dj, '#9a8e76', 0.8, 0.45);
      [-1, 1].forEach(function (k) {
        var X = function (y) { return k < 0 ? ex(y) : 400 - ex(y); }, h = function (y) { return 4 + (y - 152) * 0.2; };
        o += P(pd([[X(152), 152], [X(152), 152 - h(152)], [X(206), 206 - h(206)], [X(206), 206]], true), c.cel('#d8d0be'), 1.6);
        o += P(pd([[X(152), 152 - h(152)], [X(152) + k * 3, 152 - h(152)], [X(206) + k * 10, 206 - h(206)], [X(206), 206 - h(206)]], true), '#f2ece0', 1.4);
        // balusters on the inner face
        var bl = '';
        for (var t = 0.1; t < 0.95; t += 0.1) { var yb = 152 + 54 * t; bl += 'M' + pt([X(yb), yb - 1]) + 'L' + pt([X(yb), yb - h(yb) + 2]); }
        o += L(bl, '#a89e8a', 1.2, 0.8);
      });
      // hero statues on piers along the bridge, far pair then near pair
      o += G(swStatue(c, 164, 164, 1, false), at(0.4, 164, 164)) + G(swStatue(c, 236, 164, 0, true), at(0.4, 236, 164));
      o += G(swStatue(c, 138, 184, 0, false), at(0.62, 138, 184)) + G(swStatue(c, 262, 184, 1, true), at(0.62, 262, 184));
      // the near bank: Ambermoor grass either side of the road
      o += R(-2, 204, 404, 5, c.cel('#c8bea8'), 1.6) + R(-2, 208, 404, 34, c.lg([[0, '#78a848'], [1, '#4e7a2e']]));
      o += P(pd([[ex(206), 206], [400 - ex(206), 206], [400 - ex(242), 242], [ex(242), 242]], true), c.lg([[0, '#d6ccb4'], [1, '#bcae90']]), 0);
      o += L('M' + pt([ex(206), 206]) + 'L' + pt([ex(242), 242]) + 'M' + pt([400 - ex(206), 206]) + 'L' + pt([400 - ex(242), 242]) + 'M' + pt([ex(220), 220]) + 'L' + pt([400 - ex(220), 220]) + 'M' + pt([200, 206]) + 'L200,242', '#9a8e76', 0.9, 0.45);
      o += grass(223, 210, 238, '#3e6a26', 60, 0.6, 1.5, 1.1, 0, 70) + grass(225, 210, 238, '#3e6a26', 60, 0.6, 1.5, 1.1, 330, 400) + grass(227, 212, 238, '#a8d06a', 24, 0.6, 1.4, 1, 0, 60) + grass(228, 212, 238, '#a8d06a', 24, 0.6, 1.4, 1, 340, 400);
      o += swLamp(c, 96, 212, 44) + swLamp(c, 304, 212, 44);
      // Ambermoor's forest crowding in at the edges
      o += oak(c, -10, 226, 1.45, '#3f7e34') + oak(c, 414, 230, 1.5, '#447f36') + bush(c, 34, 236, 1.1) + bush(c, 368, 238, 1.2, '#4a8436');
      return o + vignette(c, '#ffffff', '#162010');
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function hoofs(x, y, col) { return P('M' + n(x - 5) + ',' + n(y - 5) + ' L' + n(x + 5) + ',' + n(y - 5) + ' L' + n(x + 4.5) + ',' + n(y + 1) + ' L' + n(x - 5.5) + ',' + n(y + 1) + ' Z', col || '#2d2420', 2) + L('M' + n(x - 0.5) + ',' + n(y - 3) + ' L' + n(x - 0.5) + ',' + n(y + 1), OL, 1.2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function sword(p, len, ang, blade, s) {
    var x = p[0], y = p[1], a = ang, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca; s = s || 1;
    var tip = [x + ca * len, y + sa * len], b0 = [x + ca * 7, y + sa * 7];
    var d = 'M' + pt([b0[0] + px * 3 * s, b0[1] + py * 3 * s]) + 'L' + pt([tip[0] + px * 2.5 * s, tip[1] + py * 2.5 * s]) + 'Q' + pt([tip[0] + ca * 4, tip[1] + sa * 4]) + ' ' + pt([tip[0] - px * 3 * s, tip[1] - py * 3 * s]) + 'L' + pt([b0[0] - px * 3 * s, b0[1] - py * 3 * s]) + 'Z';
    var o = P(d, c_(blade || '#c8ccd2'), 1.8) + L('M' + pt([b0[0] + ca * 2, b0[1] + sa * 2]) + 'L' + pt([tip[0] - ca * 4, tip[1] - sa * 4]), '#ffffff', 1, 0.6);
    o += L('M' + pt([x + ca * 6 + px * 6, y + sa * 6 + py * 6]) + 'L' + pt([x + ca * 6 - px * 6, y + sa * 6 - py * 6]), OL, 5) + L('M' + pt([x + ca * 6 + px * 6, y + sa * 6 + py * 6]) + 'L' + pt([x + ca * 6 - px * 6, y + sa * 6 - py * 6]), '#8a8a90', 2.6) +
      L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), OL, 5) + L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), '#5a3a22', 2.6);
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
  // fishing / trapping net: a sagging mesh between two points with cork or lead weights on the lower edge
  function net(c, a, b, drop, col, wt) {
    col = col || '#c8b890';
    var mx = (a[0] + b[0]) / 2, my = Math.max(a[1], b[1]) + drop;
    var outline = 'M' + pt(a) + 'Q' + pt([mx, my]) + ' ' + pt(b);
    var mesh = '', i, t, u, x, y;
    for (i = 1; i < 6; i++) {
      t = i / 6; u = 1 - t;
      x = u * u * a[0] + 2 * u * t * mx + t * t * b[0]; y = u * u * a[1] + 2 * u * t * my + t * t * b[1];
      var tx = a[0] + (b[0] - a[0]) * t, ty = a[1] + (b[1] - a[1]) * t;
      mesh += 'M' + pt([tx, ty]) + 'L' + pt([x, y]);
    }
    for (i = 1; i < 4; i++) {
      var k = i / 4, qy = my * k + Math.max(a[1], b[1]) * (1 - k);
      mesh += 'M' + pt([a[0] + (mx - a[0]) * k * 0.3, a[1] + (qy - a[1]) * k]) + 'Q' + pt([mx, a[1] + (my - a[1]) * k * 1.6]) + ' ' + pt([b[0] + (mx - b[0]) * k * 0.3, b[1] + (qy - b[1]) * k]);
    }
    var ws = '';
    for (i = 1; i < 6; i++) { t = i / 6; u = 1 - t; x = u * u * a[0] + 2 * u * t * mx + t * t * b[0]; y = u * u * a[1] + 2 * u * t * my + t * t * b[1]; ws += C(x, y + 1, 2.2, c_(wt || '#7a7a80'), 1.2); }
    return L(outline + mesh, OL, 3) + L(outline + mesh, col, 1.3) + ws;
  }

  // a net gathered in one fist and hanging open below it, weights along the hem
  function netHang(c, p, w, h, col, wt, lean) {
    col = col || '#d0c090'; lean = lean || 0;
    var x = p[0], y = p[1], bl = [x - w / 2 + lean, y + h], br = [x + w / 2 + lean, y + h * 0.92], bm = [x + lean, y + h + 6];
    var hem = 'M' + pt(bl) + 'Q' + pt(bm) + ' ' + pt(br), outline = 'M' + pt([x - 2, y]) + 'L' + pt(bl) + 'Q' + pt(bm) + ' ' + pt(br) + 'L' + pt([x + 2, y]) + 'Z';
    var cords = '', i, t, u, hx, hy, pts = [];
    for (i = 0; i <= 6; i++) { t = i / 6; u = 1 - t; hx = u * u * bl[0] + 2 * u * t * bm[0] + t * t * br[0]; hy = u * u * bl[1] + 2 * u * t * bm[1] + t * t * br[1]; pts.push([hx, hy]); if (i && i < 6) cords += 'M' + pt([x, y + 2]) + 'Q' + pt([x + (hx - x) * 0.4, y + h * 0.5]) + ' ' + pt([hx, hy]); }
    for (i = 1; i <= 3; i++) { var k = i / 4, sag = 3 + i * 1.5; cords += 'M' + pt([x + (bl[0] - x) * k, y + (bl[1] - y) * k]) + 'Q' + pt([x + lean * k, y + h * k + sag]) + ' ' + pt([x + (br[0] - x) * k, y + (br[1] - y) * k]); }
    var ws = pts.map(function (q) { return C(q[0], q[1] + 1.5, 2.3, c_(wt || '#7a7a80'), 1.2); }).join('');
    return F(outline, col, 0.22) + L('M' + pt([x - 2, y]) + 'L' + pt(bl) + hem + 'L' + pt([x + 2, y]) + cords, OL, 3.2) + L('M' + pt([x - 2, y]) + 'L' + pt(bl) + hem + 'L' + pt([x + 2, y]) + cords, col, 1.4) + ws;
  }

  // ---- biped rig (facing left) ----
  function biped(c, o) {
    var s = '', sk = o.skin, shirt = o.shirt || sk, pants = o.pants || sk, sleeve = o.sleeve || shirt;
    var legW = o.legW || 10.5, armW = o.armW || 9;
    s += shadow(c, 64, o.shadowR || 32);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 54], [88, 70], [88, 86]];
    s += limb(pd(far.slice(0, 2)), sleeve, armW) + limb(pd(far.slice(1)), o.forearm || sleeve, armW - 1);
    if (o.wFar) s += o.wFar(c, far[far.length - 1]);
    s += (o.farHand ? o.farHand(c, far[far.length - 1]) : hand(far[far.length - 1], c.cel(o.glove || sk)));
    var hipY = o.hipY || 86, toe = o.feet || boot;
    var kneeF = o.digi ? 'M68,' + hipY + ' L77,100 L71,112 L74,116' : 'M68,' + hipY + ' L71,103 L72,113';
    var kneeN = o.digi ? 'M56,' + hipY + ' L62,100 L54,112 L52,116' : 'M56,' + hipY + ' L53,103 L52,113';
    s += limb(kneeF, dk(pants, 0.18), legW) + toe(73, 121, o.boots || dk(pants, 0.3));
    s += limb(kneeN, pants, legW) + toe(52, 121, o.boots || dk(pants, 0.3));
    if (o.shins) s += o.shins(c);
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,40 L92,40 L92,106 L70,106 C74,78 72,58 68,40 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
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
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- Grey Hood ----
  // hooded head with the grey Grey Hood scarf over nose and mouth (facing left)
  function defiasHead(c, x, y, o) {
    var sk = o.skin || '#e4b48a', hood = o.hood || DEF_HOOD, mask = o.mask || DEF_RED, s = '';
    // hood back / cowl hanging behind the neck
    if (!o.bandana) s += P('M' + pt([x - 4, y - 14]) + 'C' + pt([x + 6, y - 20]) + ' ' + pt([x + 18, y - 14]) + ' ' + pt([x + 17, y + 2]) + 'L' + pt([x + 20, y + 20]) + 'L' + pt([x + 6, y + 18]) + 'L' + pt([x + 2, y + 4]) + 'Z', c.cel(dk(hood, 0.12)), 2);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8));
    // eye + angry brow
    s += E(x - 5, y - 3, 2.2, 1.7, '#ffffff', 1) + C(x - 5.6, y - 3, 1.1, OL);
    s += L('M' + pt([x - 9, y - 7.5]) + 'L' + pt([x - 1, y - 5]), OL, 2.2);
    // mask over nose and mouth, knot at the back
    s += body(c, 'M' + pt([x - 14, y + 0.5]) + 'L' + pt([x + 10, y - 1]) + 'L' + pt([x + 10, y + 5]) + 'C' + pt([x + 8, y + 11]) + ' ' + pt([x + 2, y + 15]) + ' ' + pt([x - 4, y + 14]) + 'L' + pt([x - 9, y + 13]) + 'C' + pt([x - 11, y + 9]) + ' ' + pt([x - 12, y + 5]) + ' ' + pt([x - 14, y + 0.5]) + 'Z', mask,
      L('M' + pt([x - 11, y + 5]) + 'Q' + pt([x - 4, y + 7]) + ' ' + pt([x + 4, y + 5]) + 'M' + pt([x - 8, y + 10]) + 'Q' + pt([x - 2, y + 11]) + ' ' + pt([x + 4, y + 9]), dk(mask, 0.35), 1) + F('M' + pt([x + 2, y - 2]) + 'L' + pt([x + 12, y - 2]) + 'L' + pt([x + 12, y + 16]) + 'L' + pt([x, y + 16]) + 'Z', dk(mask, 0.3), 0.7), 1.8);
    s += P('M' + pt([x + 9, y + 1]) + 'L' + pt([x + 17, y + 3]) + 'L' + pt([x + 15, y + 8]) + 'Z', c.cel(mask), 1.4) + P('M' + pt([x + 9, y + 2]) + 'L' + pt([x + 18, y + 9]) + 'L' + pt([x + 13, y + 11]) + 'Z', c.cel(dk(mask, 0.1)), 1.4);
    if (o.bandana) {
      // no hood: an ear, a head-hugging bandana knotted at the back with two tails
      var bd = o.bandana;
      s += E(x + 5, y + 0.5, 2.6, 3.4, c.cel(sk), 1.4) + L('M' + pt([x + 4.4, y - 1]) + 'q1,1.5 0,3', dk(sk, 0.35), 0.9);
      s += P('M' + pt([x + 11, y - 7]) + 'L' + pt([x + 21, y - 4]) + 'L' + pt([x + 19, y + 1]) + 'Z', c.cel(dk(bd, 0.12)), 1.4) + P('M' + pt([x + 11, y - 6]) + 'L' + pt([x + 18, y + 6]) + 'L' + pt([x + 14, y + 7]) + 'Z', c.cel(dk(bd, 0.2)), 1.4);
      s += body(c, 'M' + pt([x - 11, y - 5]) + 'C' + pt([x - 12, y - 16]) + ' ' + pt([x + 2, y - 20]) + ' ' + pt([x + 10, y - 13]) + 'C' + pt([x + 13, y - 10]) + ' ' + pt([x + 13, y - 5]) + ' ' + pt([x + 12, y - 1]) + 'C' + pt([x + 9, y - 5]) + ' ' + pt([x + 4, y - 7]) + ' ' + pt([x - 2, y - 7]) + 'C' + pt([x - 6, y - 7]) + ' ' + pt([x - 9, y - 6]) + ' ' + pt([x - 11, y - 5]) + 'Z', bd,
        F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 15, y - 20]) + 'L' + pt([x + 15, y]) + 'L' + pt([x + 6, y - 4]) + 'C' + pt([x + 8, y - 10]) + ' ' + pt([x + 6, y - 16]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(bd, 0.3), 0.75) + L('M' + pt([x - 6, y - 13]) + 'Q' + pt([x, y - 17]) + ' ' + pt([x + 6, y - 15]), lt(bd, 0.25), 1, 0.7) + C(x - 1, y - 11, 1, dk(bd, 0.4), 0, 0.8) + C(x + 5, y - 12, 1, dk(bd, 0.4), 0, 0.8), 2);
      s += C(x + 12, y - 5, 2.6, c.cel(dk(bd, 0.1)), 1.4);
      return s;
    }
    // hood front: frames the face, open to the left
    s += body(c, 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 13, y - 17]) + ' ' + pt([x, y - 22]) + ' ' + pt([x + 9, y - 18]) + 'C' + pt([x + 15, y - 14]) + ' ' + pt([x + 16, y - 4]) + ' ' + pt([x + 14, y + 6]) + 'L' + pt([x + 8, y + 4]) + 'C' + pt([x + 8, y - 4]) + ' ' + pt([x + 4, y - 10]) + ' ' + pt([x - 3, y - 10]) + 'C' + pt([x - 7, y - 9]) + ' ' + pt([x - 10, y - 7]) + ' ' + pt([x - 12, y - 4]) + 'Z', hood,
      F('M' + pt([x + 4, y - 24]) + 'L' + pt([x + 18, y - 24]) + 'L' + pt([x + 18, y + 8]) + 'L' + pt([x + 9, y + 8]) + 'C' + pt([x + 10, y - 6]) + ' ' + pt([x + 8, y - 16]) + ' ' + pt([x + 4, y - 24]) + 'Z', dk(hood, 0.3), 0.75) + L('M' + pt([x - 8, y - 12]) + 'Q' + pt([x, y - 17]) + ' ' + pt([x + 8, y - 14]), lt(hood, 0.2), 1, 0.7), 2);
    return s;
  }
  function defias(c, o) {
    var pants = o.pants || '#4b3a2b';
    return biped(c, {
      skin: o.skin || '#e4b48a', shirt: o.torso || '#8d8474', pants: pants, sleeve: o.sleeve || '#8d8474', forearm: o.forearm, glove: o.glove || '#4a3526', boots: o.boots || '#2a211a', belt: o.belt || '#2b2018', buckle: o.buckle,
      head: function (c, x, y) { return defiasHead(c, x, y, o); }, hx: 60, hy: 30, neckCol: o.neckCol || o.hood || DEF_HOOD, torsoD: o.torsoD, nearHand: o.nearHand, farHand: o.farHand,
      chest: function (c) { return (o.vest ? P('M48,50 L58,48 L62,88 L50,88 Z', c.cel(o.vest), 1.4) + P('M72,48 L80,50 L78,88 L68,88 Z', c.cel(dk(o.vest, 0.1)), 1.4) : '') + (o.chest ? o.chest(c) : ''); },
      back: o.back, front: o.front, pads: function (c) { return (o.armband ? R(43, 60, 10, 5, o.armband, 1.4) : '') + (o.pads ? o.pads(c) : ''); },
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, top: o.top, tf: o.tf, armW: o.armW || 9, legW: o.legW || 10.5, shadowR: o.shadowR || 30
    });
  }
  function dagger(p, ang, s) { return sword(p, 18 * (s || 1), ang, '#d0d4da', 0.8); }
  function leatherPad(c, x, y, col, trim) { return body(c, 'M' + pt([x - 10, y + 4]) + 'C' + pt([x - 10, y - 6]) + ' ' + pt([x + 10, y - 7]) + ' ' + pt([x + 11, y + 4]) + 'Z', col, trim ? L('M' + pt([x - 8, y + 2]) + 'C' + pt([x - 6, y - 3]) + ' ' + pt([x + 6, y - 4]) + ' ' + pt([x + 9, y + 2]), trim, 1.4) : '', 2) + C(x, y - 1, 1.3, '#9a9aa0', 0.8); }

  // ---- mireling (marsh newt: frilled collar, round eyes on top of the head, long tail, webbed hands and feet; facing left, shared with the other zone packs) ----
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

  // ---- goretusk boar (shaggy, facing left) ----
  function goretusk(c, o) {
    var col = o.col, mane = o.mane, tk = o.tusk || 1, s = shadow(c, 64, 50), legFar = dk(col, 0.25);
    s += limb('M54,92 L56,106 L55,116', legFar, 10) + hoofs(55, 122) + limb('M104,90 L108,104 L106,116', legFar, 10) + hoofs(106, 122);
    s += L('M114,76 C123,70 127,80 120,83 C115,84 117,76 122,76', OL, 4.5) + L('M114,76 C123,70 127,80 120,83 C115,84 117,76 122,76', col, 2) + P('M121,82 L126,88 L119,86 Z', dk(mane, 0.1), 1);
    var bd = 'M34,70 C38,56 64,50 90,54 C110,58 120,70 116,86 C112,98 94,100 74,99 C54,100 40,98 34,90 C30,84 30,76 34,70 Z';
    var shag = '', r = rng(o.seed || 3);
    for (var i = 0; i < 26; i++) { var x = 40 + r() * 74, y = 62 + r() * 30; shag += 'M' + pt([x, y]) + 'l' + n(3 + r() * 2) + ',' + n(4 + r() * 3); }
    s += body(c, bd, col, F('M24,88 C50,102 90,102 122,90 L122,104 L24,104 Z', dk(col, 0.3), 0.85) + F('M44,60 C64,54 94,54 110,62 C92,60 64,60 44,68 Z', lt(col, 0.2), 0.5) + L(shag, dk(col, 0.35), 1.2, 0.8) + (o.scars ? L('M72,66 L82,78 M78,64 L88,76', lt(col, 0.45), 1.6) : ''));
    // shaggy belly fringe
    s += P('M40,92 L44,100 L48,94 L53,102 L58,95 L64,103 L70,96 L76,103 L82,96 L88,102 L94,95 L100,100 L104,92 C90,98 60,98 40,92 Z', c.cel(dk(col, 0.18)), 1.6);
    // long bristly mane along the spine
    var md = 'M38,66 L36,50 L46,58 L48,42 L56,54 L62,38 L68,52 L76,38 L80,52 L90,40 L92,54 L102,46 L102,58 L112,56 L108,66 C92,58 60,56 38,66 Z';
    s += body(c, md, mane, L('M48,56 L50,48 M62,52 L63,44 M76,52 L77,44 M90,54 L92,46', lt(mane, 0.25), 1, 0.8), 2);
    var hd = 'M50,58 C40,57 28,64 22,72 L14,80 C10,84 10,92 14,95 L24,97 C32,99 44,97 52,90 C56,82 56,66 50,58 Z';
    s += body(c, hd, col, F('M14,92 C26,96 42,96 54,86 L56,100 L10,100 Z', dk(col, 0.3), 0.85) + F('M30,66 C38,60 46,58 50,60 C44,62 36,66 30,72 Z', lt(col, 0.2), 0.5));
    // brow tuft + ear
    s += P('M26,70 L28,60 L34,66 L38,56 L42,64 L48,58 L50,66 C42,64 34,66 26,70 Z', c.cel(mane), 1.8);
    s += P('M42,60 L46,46 L53,60 Z', c.cel(dk(col, 0.1)), 2) + P('M45,58 L47,51 L50,58 Z', '#8a4a3a', 0);
    // chin beard
    s += P('M22,96 L24,104 L28,98 L32,106 L36,98 L42,104 L44,95 C36,98 28,98 22,96 Z', c.cel(mane), 1.6);
    s += E(13, 88, 4.6, 7, c.cel(o.snout || '#a87a6a'), 2) + E(12, 86, 1, 1.6, OL) + E(12, 91, 1, 1.6, OL);
    s += C(32, 76, 2.4, o.eye || '#ff6a2a', 1.2) + C(31.6, 75.6, 0.8, '#fff', 0) + L('M25,71 L38,75', OL, 2.4);
    var t = 2.2 * tk;
    s += P('M' + pt([24, 93]) + 'C' + pt([22 - 4 * t, 92]) + ' ' + pt([19 - 4 * t, 86 - 4 * t]) + ' ' + pt([21 - 2 * t, 80 - 6 * t]) + 'C' + pt([22, 86]) + ' ' + pt([24, 88]) + ' ' + pt([29, 90]) + 'Z', c.cel('#f4ecd6'), 1.8);
    s += L('M16,95 C22,97 30,96 36,93', OL, 1.4);
    s += limb('M44,90 L42,106 L42,116', col, 11) + hoofs(42, 122) + limb('M96,88 L100,104 L98,116', col, 11) + hoofs(98, 122);
    return G(s, at(o.scale || 1, 64, 122));
  }

  // ---- fleshripper (vulture, facing left) ----
  function vulture(c, o) {
    var br = o.col || '#4a3a32', wg = o.wing || '#3a2e2a', ruff = '#e2dccc', skin = o.head || '#cc5a44', leg = '#b8a494', s = shadow(c, 64, 36);
    // far wing, half-spread up and back
    var fw = 'M72,58 C80,40 92,22 112,8 L110,18 L120,14 L114,26 L124,24 L114,36 L122,38 L110,46 L114,52 L102,56 C94,60 88,64 84,70 Z';
    s += body(c, fw, dk(wg, 0.1), L('M80,60 C90,46 100,32 112,18 M86,64 C96,54 106,44 116,34', dk(wg, 0.45), 1.2) + F('M100,4 L128,4 L128,60 L108,60 C112,40 108,22 100,4 Z', dk(wg, 0.3), 0.7), 2.2);
    // tail
    s += body(c, 'M84,88 L112,104 L110,110 L104,106 L104,114 L96,108 L92,114 L82,100 Z', dk(br, 0.15), L('M88,96 L106,108 M86,100 L96,110', dk(br, 0.45), 1.2), 2);
    s += limb('M74,92 L78,110 L77,117', leg, 3.6) + L('M77,117 L70,121 M77,117 L74,122 M77,117 L82,121', OL, 2.6);
    var bd = 'M44,64 C48,50 64,44 78,50 C92,56 94,76 88,90 C82,100 64,102 54,94 C46,86 42,76 44,64 Z';
    var sc = '';
    for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) sc += 'M' + pt([52 + j * 10 + (i % 2) * 5, 60 + i * 9]) + 'q3,4 6,0';
    s += body(c, bd, br, L(sc, lt(br, 0.25), 1.1, 0.8) + F('M72,48 C86,52 94,66 92,82 L100,82 L100,42 Z', dk(br, 0.3), 0.8));
    s += limb('M58,94 L56,110 L55,117', leg, 3.8) + L('M55,117 L47,121 M55,117 L51,122.5 M55,117 L60,121', OL, 2.8);
    // near wing, half-spread, ragged primaries
    var nw = 'M62,62 C52,48 36,30 14,16 L20,26 L8,24 L18,34 L6,36 L18,42 L10,48 L24,50 L22,56 C32,58 42,66 52,76 Z';
    s += body(c, nw, wg, L('M56,66 C46,54 32,40 18,28 M50,70 C42,62 32,54 20,46', dk(wg, 0.45), 1.2) + F('M36,40 C44,48 52,56 58,64 L52,66 C46,60 40,54 32,48 Z', lt(wg, 0.18), 0.7) + F('M-4,10 L22,10 L26,60 L-4,60 Z', dk(wg, 0.3), 0.6), 2.2);
    // white ruff
    s += P('M40,52 L44,46 L48,50 L52,44 L56,50 L61,46 L62,54 L66,58 L60,60 L62,66 L54,64 L50,70 L46,64 L40,66 L42,60 L36,58 Z', c.cel(ruff), 1.8);
    // bare neck + bald red head (low, forward)
    s += L('M46,58 C38,58 32,62 30,68', OL, 9) + L('M46,58 C38,58 32,62 30,68', skin, 5.4);
    var hx = 26, hy = 66;
    s += body(c, 'M' + pt([hx + 8, hy + 6]) + 'C' + pt([hx + 2, hy + 8]) + ' ' + pt([hx - 6, hy + 5]) + ' ' + pt([hx - 7, hy - 1]) + 'C' + pt([hx - 8, hy - 7]) + ' ' + pt([hx - 2, hy - 11]) + ' ' + pt([hx + 4, hy - 10]) + 'C' + pt([hx + 10, hy - 8]) + ' ' + pt([hx + 12, hy - 1]) + ' ' + pt([hx + 8, hy + 6]) + 'Z', skin,
      L('M' + pt([hx - 2, hy - 8]) + 'q3,2 6,0 M' + pt([hx + 2, hy + 4]) + 'q3,1 5,-1', dk(skin, 0.35), 1) + F('M' + pt([hx + 4, hy - 12]) + 'L' + pt([hx + 14, hy - 12]) + 'L' + pt([hx + 14, hy + 8]) + 'L' + pt([hx + 6, hy + 8]) + 'Z', dk(skin, 0.25), 0.8), 1.8);
    // hooked beak
    s += P('M' + pt([hx - 6, hy - 4]) + 'C' + pt([hx - 12, hy - 5]) + ' ' + pt([hx - 18, hy - 2]) + ' ' + pt([hx - 19, hy + 5]) + 'C' + pt([hx - 18, hy + 8]) + ' ' + pt([hx - 16, hy + 8]) + ' ' + pt([hx - 15, hy + 5]) + 'C' + pt([hx - 12, hy + 3]) + ' ' + pt([hx - 9, hy + 4]) + ' ' + pt([hx - 5, hy + 4]) + 'Z', c.cel('#e6d8a8'), 1.8);
    s += P('M' + pt([hx - 18, hy + 3]) + 'C' + pt([hx - 19, hy + 6]) + ' ' + pt([hx - 18, hy + 8]) + ' ' + pt([hx - 16, hy + 8]) + 'L' + pt([hx - 15.5, hy + 5]) + 'Z', '#3a2a1a', 0);
    s += L('M' + pt([hx - 7, hy - 7]) + 'L' + pt([hx + 1, hy - 5]), OL, 2.4) + C(hx - 3, hy - 3, 1.9, '#ffd040', 1) + C(hx - 3.4, hy - 3, 0.8, OL);
    return G(s, at(o.scale || 1, 64, 122));
  }

  // ---- harvest golems ----
  function strawBits(c, list, col) {
    col = col || '#ecc85a';
    var o = '';
    // each tuft: a filled fan of three straw spikes bursting out of a seam
    list.forEach(function (q) {
      var x = q[0], y = q[1], a = q[2], l = q[3] || 8, w = l * 0.32, px = -Math.sin(a), py = Math.cos(a), d = 'M' + pt([x + px * w, y + py * w]);
      [[0.45, 0.85], [0, 1], [-0.45, 0.8]].forEach(function (s, i) {
        var b = a + s[0], tx = x + Math.cos(b) * l * s[1], ty = y + Math.sin(b) * l * s[1];
        d += 'L' + pt([tx, ty]);
        if (i < 2) { var b2 = a + s[0] - 0.22; d += 'L' + pt([x + Math.cos(b2) * l * 0.45, y + Math.sin(b2) * l * 0.45]); }
      });
      d += 'L' + pt([x - px * w, y - py * w]) + 'Z';
      o += P(d, c_(col), 1.2) + L('M' + pt([x, y]) + 'L' + pt([x + Math.cos(a) * l * 0.7, y + Math.sin(a) * l * 0.7]), dk(col, 0.3), 0.8);
    });
    return o;
  }
  function rivets(list, col) { return list.map(function (p) { return C(p[0], p[1], 1.3, col || '#c8c4bc', 0.8); }).join(''); }
  function ironFoot(x, y, col) { return P('M' + pt([x + 6, y - 6]) + 'L' + pt([x + 7, y + 1]) + 'L' + pt([x - 12, y + 1]) + 'L' + pt([x - 10, y - 5]) + 'Z', c_(col), 2) + L('M' + pt([x - 12, y + 1]) + 'l-3,-2 M' + pt([x - 6, y + 1]) + 'l-2,-3', OL, 1.6); }
  function scythe(c, p, len, ang, bladeLen, bend, col, haft) {
    var x = p[0], y = p[1], ca = Math.cos(ang), sa = Math.sin(ang), top = [x + ca * len, y + sa * len], bot = [x - ca * 12, y - sa * 12];
    var o = limb('M' + pt(bot) + 'L' + pt(top), haft || '#6a4a2a', 3.4) + L('M' + pt(bot) + 'L' + pt(top), lt(haft || '#6a4a2a', 0.3), 1, 0.6);
    // blade sweeps from the haft top to the left (bend = -1) then curls down
    var bx = top[0], by = top[1], k = bend || -1, bl = bladeLen;
    var d = 'M' + pt([bx + 2, by - 3]) + 'C' + pt([bx + k * bl * 0.4, by - 10]) + ' ' + pt([bx + k * bl * 0.9, by - 6]) + ' ' + pt([bx + k * bl, by + bl * 0.34]) + 'C' + pt([bx + k * bl * 0.72, by + 2]) + ' ' + pt([bx + k * bl * 0.35, by + 2]) + ' ' + pt([bx + 1, by + 4]) + 'Z';
    o += P(d, c.cel(col || '#b8bcc0'), 1.8) + L('M' + pt([bx + k * 4, by - 3]) + 'C' + pt([bx + k * bl * 0.4, by - 7]) + ' ' + pt([bx + k * bl * 0.8, by - 4]) + ' ' + pt([bx + k * bl * 0.94, by + bl * 0.24]), '#ffffff', 1, 0.6);
    o += R(bx - 3, by - 4, 6, 8, c.cel('#5a5a5e'), 1.4);
    return o;
  }
  function harvestWatcher(c) {
    var wd = '#9a7448', ir = '#6a6a70', sack = '#caa870', s = shadow(c, 64, 32);
    // far arm: pole with a three-tine pitchfork claw
    s += tube([[80, 54], [88, 70], [90, 84]], 6, dk(wd, 0.2)) + C(88, 70, 3.6, c.cel(ir), 1.4);
    s += L('M88,84 L84,98 M90,84 L90,100 M92,84 L96,98', OL, 4.2) + L('M88,84 L84,98 M90,84 L90,100 M92,84 L96,98', '#9a9aa0', 2) + R(85, 82, 10, 4, c.cel(ir), 1.4);
    // legs: wooden posts with iron knee joints and plate feet
    s += tube([[68, 86], [72, 103], [72, 114]], 7, dk(wd, 0.2)) + C(72, 103, 4, c.cel(ir), 1.4) + ironFoot(74, 121, dk(ir, 0.2));
    s += tube([[56, 86], [52, 103], [52, 114]], 7.5, wd, dk(wd, 0.3)) + C(52, 103, 4.2, c.cel(ir), 1.4) + ironFoot(54, 121, ir);
    s += strawBits(c, [[52, 108, 2.4, 6], [72, 108, 0.6, 6]]);
    // torso: wooden planks bound with iron hoops, straw spilling out
    var td = 'M44,52 C48,44 78,44 84,52 L84,84 C80,92 50,92 44,84 Z';
    s += body(c, td, wd, L('M54,46 L54,90 M64,45 L64,92 M74,46 L74,90', dk(wd, 0.35), 1.2) + F('M70,40 L92,40 L92,96 L72,96 C76,78 74,58 70,40 Z', dk(wd, 0.3), 0.8) + F('M50,62 L60,60 L58,72 L50,72 Z', '#2a1a10', 0.9), 2.4);
    s += strawBits(c, [[52, 66, 3.4, 7], [56, 64, 2.6, 6]]);
    s += R(42, 56, 44, 5, c.cel(ir), 1.8) + R(42, 78, 44, 5, c.cel(ir), 1.8) + rivets([[48, 58.5], [64, 58.5], [80, 58.5], [48, 80.5], [64, 80.5], [80, 80.5]]);
    s += strawBits(c, [[46, 88, 2.2, 8], [58, 91, 1.8, 7], [72, 91, 1.4, 7], [82, 88, 0.9, 8]]);
    // neck rope + sack head with glowing eye slit
    var hx = 58, hy = 28;
    // ragged burlap collar flaring out below the cinch
    s += body(c, 'M' + pt([hx - 14, hy + 12]) + 'L' + pt([hx + 14, hy + 12]) + 'L' + pt([hx + 20, hy + 24]) + 'L' + pt([hx + 13, hy + 21]) + 'L' + pt([hx + 8, hy + 27]) + 'L' + pt([hx + 2, hy + 21]) + 'L' + pt([hx - 4, hy + 27]) + 'L' + pt([hx - 9, hy + 21]) + 'L' + pt([hx - 16, hy + 25]) + 'Z', dk(sack, 0.08), F('M' + pt([hx + 4, hy + 10]) + 'L' + pt([hx + 22, hy + 10]) + 'L' + pt([hx + 22, hy + 28]) + 'L' + pt([hx + 6, hy + 28]) + 'Z', dk(sack, 0.3), 0.7), 1.8);
    // lumpy sack head, bunched and tied at the crown with straw bursting out
    s += strawBits(c, [[hx - 1, hy - 17, -2.1, 11], [hx + 3, hy - 18, -1.3, 11], [hx + 6, hy - 16, -0.7, 9]]);
    s += body(c, 'M' + pt([hx - 4, hy - 13]) + 'L' + pt([hx - 7, hy - 21]) + 'L' + pt([hx - 1, hy - 18]) + 'L' + pt([hx + 3, hy - 23]) + 'L' + pt([hx + 6, hy - 18]) + 'L' + pt([hx + 12, hy - 20]) + 'L' + pt([hx + 9, hy - 12]) + 'Z', sack, '', 1.6);
    var hd = 'M' + pt([hx - 13, hy + 2]) + 'C' + pt([hx - 16, hy - 6]) + ' ' + pt([hx - 10, hy - 14]) + ' ' + pt([hx - 3, hy - 13]) + 'C' + pt([hx + 2, hy - 15]) + ' ' + pt([hx + 12, hy - 14]) + ' ' + pt([hx + 13, hy - 4]) + 'C' + pt([hx + 15, hy + 4]) + ' ' + pt([hx + 11, hy + 12]) + ' ' + pt([hx + 4, hy + 12]) + 'L' + pt([hx - 8, hy + 12]) + 'C' + pt([hx - 12, hy + 10]) + ' ' + pt([hx - 14, hy + 6]) + ' ' + pt([hx - 13, hy + 2]) + 'Z';
    var weave = '';
    for (var wi = -3; wi <= 4; wi++) weave += 'M' + pt([hx + wi * 3.2, hy - 13]) + 'l' + n(0.6) + ',' + n(25);
    for (var wj = 0; wj < 6; wj++) weave += 'M' + pt([hx - 14, hy - 10 + wj * 4]) + 'l28,' + n(-1);
    s += body(c, hd, sack, L(weave, dk(sack, 0.18), 0.6, 0.7) + F('M' + pt([hx + 4, hy - 16]) + 'L' + pt([hx + 16, hy - 16]) + 'L' + pt([hx + 16, hy + 14]) + 'L' + pt([hx + 6, hy + 14]) + 'C' + pt([hx + 9, hy + 4]) + ' ' + pt([hx + 8, hy - 6]) + ' ' + pt([hx + 4, hy - 16]) + 'Z', dk(sack, 0.28), 0.8) +
      R(hx + 5, hy - 8, 6, 6, '#a8804a', 0) + L('M' + pt([hx + 5, hy - 8]) + 'l6,0 l0,6 l-6,0 z', '#6a4a2a', 0.8, 0.9), 2.2);
    // torn, glowing eye slit + stitched grin
    s += C(hx - 6, hy - 2, 15, glow(c, '#ffb020', 0.6));
    s += P('M' + pt([hx - 13, hy - 3]) + 'L' + pt([hx - 8, hy - 6]) + 'L' + pt([hx - 5, hy - 4]) + 'L' + pt([hx + 1, hy - 6]) + 'L' + pt([hx + 1, hy - 1]) + 'L' + pt([hx - 5, hy]) + 'L' + pt([hx - 9, hy - 1]) + 'L' + pt([hx - 13, hy + 1]) + 'Z', '#2a1006', 1.4);
    s += F('M' + pt([hx - 11.5, hy - 2.2]) + 'L' + pt([hx - 8, hy - 4.4]) + 'L' + pt([hx - 5, hy - 2.6]) + 'L' + pt([hx - 0.5, hy - 4.2]) + 'L' + pt([hx - 0.5, hy - 2]) + 'L' + pt([hx - 5, hy - 1.2]) + 'L' + pt([hx - 9, hy - 2]) + 'Z', '#ffd040');
    s += L('M' + pt([hx - 12, hy + 6]) + 'Q' + pt([hx - 5, hy + 9]) + ' ' + pt([hx + 2, hy + 6]), OL, 1.4) + L('M' + pt([hx - 10, hy + 5]) + 'l1,3 M' + pt([hx - 6, hy + 6]) + 'l1,3 M' + pt([hx - 2, hy + 6]) + 'l0,3 M' + pt([hx + 1, hy + 5]) + 'l-1,3', OL, 1);
    // rope cinch at the neck
    s += R(hx - 12, hy + 9, 25, 5, c.cel('#7a5a32'), 1.6) + L('M' + pt([hx - 8, hy + 9]) + 'l-2,5 M' + pt([hx - 2, hy + 9]) + 'l-2,5 M' + pt([hx + 4, hy + 9]) + 'l-2,5 M' + pt([hx + 10, hy + 9]) + 'l-2,5', '#4a3420', 0.9) +
      P('M' + pt([hx + 12, hy + 11]) + 'L' + pt([hx + 20, hy + 19]) + 'L' + pt([hx + 16, hy + 20]) + 'Z', '#7a5a32', 1.2) + P('M' + pt([hx + 12, hy + 11]) + 'L' + pt([hx + 16, hy + 22]) + 'L' + pt([hx + 12, hy + 22]) + 'Z', '#7a5a32', 1.2);
    // near arm: pole ending in a scythe
    s += scythe(c, [32, 80], 44, -1.45, 34, -1, '#c0c4c8', '#6a4a2a');
    s += tube([[48, 54], [40, 70], [32, 80]], 6.5, wd, dk(wd, 0.3)) + C(40, 70, 3.8, c.cel(ir), 1.4) + C(32, 80, 4.6, c.cel(ir), 1.8);
    s += strawBits(c, [[44, 52, -2.6, 7], [84, 52, -0.4, 7]]);
    return s;
  }
  // o: hull, iron, rivet, eye / eyeGlow / eyeCore, grille, blade, scale; farArm(c) replaces the raised scythe arm,
  // hullX(c) adds marks inside the hull clip, extra(c) draws on top. No options = the red Grim Harvester.
  function reaperRig(c, o) {
    o = o || {};
    var red = o.hull || '#b0402c', ir = o.iron || '#5a5658', dir = dk(ir, 0.25), rv = o.rivet || '#e0d0b8', s = shadow(c, 64, 54);
    // exhaust stack + smoke
    s += C(104, 10, 6, '#8a8680', 0, 0.55) + C(112, 4, 5, '#a09c96', 0, 0.45) + C(96, 6, 4.4, '#9a9690', 0, 0.5);
    s += body(c, 'M92,34 L94,14 L102,14 L102,36 Z', ir, '', 1.8) + R(91, 11, 13, 5, c.cel(dir), 1.6);
    // far arm with raised scythe
    if (o.farArm) s += o.farArm(c, red, ir);
    else s += tube([[94, 50], [108, 40], [112, 24]], 9, dk(ir, 0.1)) + C(108, 40, 5, c.cel(dk(red, 0.15)), 1.8) + G(scythe(c, [112, 24], 10, -1.3, 36, -1, o.blade || '#c4c8cc', '#4a4448'), rot(22, 112, 24));
    // legs: thick pistons, clawed iron feet
    s += tube([[80, 90], [90, 104], [88, 114]], 12, dk(ir, 0.15)) + C(90, 104, 6, c.cel(dk(red, 0.15)), 1.8) + ironFoot(91, 121, dir) + P('M98,118 L104,122 L96,122 Z', '#8a8a90', 1.2);
    s += tube([[48, 90], [40, 104], [42, 114]], 13, ir, dk(ir, 0.3)) + C(40, 104, 6.5, c.cel(red), 1.8) + ironFoot(44, 121, ir) + P('M30,118 L24,122 L33,122 Z', '#8a8a90', 1.2);
    // big red riveted hull
    var hull = 'M30,56 C32,38 56,30 76,32 C98,34 108,48 106,66 C104,86 94,98 70,98 C46,98 30,88 30,72 Z';
    s += body(c, hull, red, F('M84,30 C100,36 110,52 108,70 C106,88 96,98 80,100 L112,100 L112,30 Z', dk(red, 0.35), 0.85) +
      L('M32,64 C50,60 84,60 106,62 M36,84 C54,80 84,80 102,82 M68,32 L66,98', dk(red, 0.4), 1.6) + F('M40,44 C50,36 64,34 74,36 C62,40 50,44 44,52 Z', lt(red, 0.3), 0.6) +
      E(52, 90, 10, 3, '#5a2a1a', 0, 0.5) + L('M58,64 l1,10 M86,64 l-1,12 M44,66 l0,8', '#6a3a22', 1.4, 0.7) + (o.hullX ? o.hullX(c, red) : ''), 2.6);
    s += rivets([[36, 62], [48, 60], [60, 60], [74, 60], [88, 60], [100, 61], [40, 82], [54, 80], [80, 80], [94, 80], [66, 40], [66, 50], [66, 70], [66, 88]], rv);
    // chest grille + gear
    s += R(40, 66, 20, 12, '#2a1a14', 1.6) + L('M44,66 L44,78 M48,66 L48,78 M52,66 L52,78 M56,66 L56,78', '#8a8a90', 1.4) + C(50, 72, 12, glow(c, o.grille || '#ff6a2a', 0.4));
    s += P(star(90, 48, 9, 9, 7), c.cel('#8a8a90'), 1.6) + C(90, 48, 3.4, dir, 1.2);
    s += strawBits(c, [[32, 74, 3.3, 9], [34, 88, 2.4, 9], [104, 84, 0.3, 8], [86, 96, 1.4, 8], [50, 98, 1.9, 7]]);
    // head: domed iron helm sunk into the shoulders, burlap hood flap, glowing eye
    var hx = 54, hy = 28;
    s += P('M' + pt([hx + 6, hy - 12]) + 'C' + pt([hx + 20, hy - 16]) + ' ' + pt([hx + 30, hy - 6]) + ' ' + pt([hx + 30, hy + 10]) + 'L' + pt([hx + 20, hy + 14]) + 'Z', c.cel('#b8986a'), 1.8) + L('M' + pt([hx + 16, hy - 12]) + 'L' + pt([hx + 22, hy + 10]), '#7a5a34', 1);
    var hd = 'M' + pt([hx - 16, hy + 6]) + 'C' + pt([hx - 18, hy - 8]) + ' ' + pt([hx - 8, hy - 18]) + ' ' + pt([hx + 4, hy - 18]) + 'C' + pt([hx + 16, hy - 18]) + ' ' + pt([hx + 22, hy - 6]) + ' ' + pt([hx + 20, hy + 8]) + 'L' + pt([hx + 16, hy + 16]) + 'L' + pt([hx - 12, hy + 16]) + 'Z';
    s += body(c, hd, dk(red, 0.1), F('M' + pt([hx + 6, hy - 20]) + 'L' + pt([hx + 24, hy - 20]) + 'L' + pt([hx + 24, hy + 18]) + 'L' + pt([hx + 10, hy + 18]) + 'C' + pt([hx + 14, hy + 4]) + ' ' + pt([hx + 12, hy - 10]) + ' ' + pt([hx + 6, hy - 20]) + 'Z', dk(red, 0.4), 0.8) + L('M' + pt([hx - 2, hy - 18]) + 'L' + pt([hx - 3, hy + 16]), dk(red, 0.4), 1.4) + F('M' + pt([hx - 10, hy - 10]) + 'C' + pt([hx - 6, hy - 15]) + ' ' + pt([hx, hy - 16]) + ' ' + pt([hx + 4, hy - 15]) + 'C' + pt([hx - 2, hy - 12]) + ' ' + pt([hx - 6, hy - 8]) + ' ' + pt([hx - 8, hy - 4]) + 'Z', lt(red, 0.3), 0.6), 2.4);
    s += rivets([[hx - 12, hy + 12], [hx - 2, hy + 12], [hx + 10, hy + 12], [hx + 16, hy - 4]], rv);
    // visor slit with a burning eye
    s += C(hx - 6, hy, 22, glow(c, o.eyeGlow || '#ff4a1a', 0.6)) + P('M' + pt([hx - 18, hy - 2]) + 'L' + pt([hx + 6, hy - 5]) + 'L' + pt([hx + 6, hy + 3]) + 'L' + pt([hx - 17, hy + 5]) + 'Z', '#1a0a06', 1.8);
    s += E(hx - 8, hy + 0.2, 6, 2.6, o.eye || '#ff6a2a') + E(hx - 9, hy - 0.2, 3, 1.4, o.eyeCore || '#ffe080');
    s += L('M' + pt([hx - 18, hy - 7]) + 'L' + pt([hx + 4, hy - 10]), OL, 2.6);
    // jaw grate
    s += R(hx - 14, hy + 8, 22, 6, '#2a1a14', 1.4) + L('M' + pt([hx - 10, hy + 8]) + 'l0,6 M' + pt([hx - 5, hy + 8]) + 'l0,6 M' + pt([hx, hy + 8]) + 'l0,6 M' + pt([hx + 5, hy + 8]) + 'l0,6', '#9a9aa0', 1.2);
    // near arm: huge scythe sweeping in front
    s += scythe(c, [24, 86], 48, -1.36, 30, -1, o.nearBlade || '#d0d4d8', '#4a4448');
    s += tube([[40, 54], [30, 70], [24, 84]], 11, ir, dk(ir, 0.3)) + C(40, 54, 9, c.cel(red), 2.2) + C(30, 70, 5.5, c.cel(dk(red, 0.1)), 1.8) + R(17, 80, 14, 10, c.cel(dir), 1.8);
    s += rivets([[36, 50], [44, 50], [40, 58]], rv);
    if (o.extra) s += o.extra(c, red, ir);
    return G(s, at(o.scale || 1.02, 64, 122));
  }
  function foeReaper(c) { return reaperRig(c); }

  // ---- Tallgrass gnoll: same head as art.js riverpaw_gnoll / hogger (ported, drawn facing right, then mirrored) ----
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
  function spikedClub(c, p, len, ang, w) {
    var x = p[0], y = p[1], ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca, bot = [x - ca * 10, y - sa * 10], top = [x + ca * len, y + sa * len];
    var d = 'M' + pt([bot[0] + px * 3, bot[1] + py * 3]) + 'L' + pt([top[0] + px * w, top[1] + py * w]) + 'Q' + pt([top[0] + ca * w * 1.2, top[1] + sa * w * 1.2]) + ' ' + pt([top[0] - px * w, top[1] - py * w]) + 'L' + pt([bot[0] - px * 3, bot[1] - py * 3]) + 'Z';
    var o = '', sp = '';
    [[0.5, 1], [0.62, -1], [0.74, 1], [0.86, -1], [0.97, 1], [0.8, 1], [0.56, -1]].forEach(function (q) {
      var t = q[0], cx = x + ca * len * t, cy = y + sa * len * t, ww = 3 + (w - 3) * t, sx = cx + px * q[1] * ww, sy = cy + py * q[1] * ww;
      sp += P(pd([[sx - ca * 2.4, sy - sa * 2.4], [sx + px * q[1] * 6, sy + py * q[1] * 6], [sx + ca * 2.4, sy + sa * 2.4]], true), c.cel('#b8bcc0'), 1.2);
    });
    sp += P(pd([[top[0] + ca * w - px * 2, top[1] + sa * w - py * 2], [top[0] + ca * (w + 7), top[1] + sa * (w + 7)], [top[0] + ca * w + px * 2, top[1] + sa * w + py * 2]], true), c.cel('#b8bcc0'), 1.2);
    o += sp + body(c, d, '#7a5234', L('M' + pt([x + ca * len * 0.3 + px, y + sa * len * 0.3 + py]) + 'L' + pt([top[0] - ca * 4 + px * w * 0.4, top[1] - sa * 4 + py * w * 0.4]), '#a87a52', 1.2, 0.7) + L('M' + pt([x + ca * len * 0.45 - px * 4, y + sa * len * 0.45 - py * 4]) + 'L' + pt([x + ca * len * 0.45 + px * 4, y + sa * len * 0.45 + py * 4]) + 'M' + pt([x + ca * len * 0.7 - px * 5, y + sa * len * 0.7 - py * 5]) + 'L' + pt([x + ca * len * 0.7 + px * 5, y + sa * len * 0.7 + py * 5]), '#4a3020', 1.4), 2);
    o += L('M' + pt([x - ca * 3 - px * 4, y - sa * 3 - py * 4]) + 'L' + pt([x - ca * 3 + px * 4, y - sa * 3 + py * 4]), '#3a2a1a', 2);
    return o;
  }
  function riverpawBrute(c) {
    var fur = '#a8783e', mane = '#4a2e18', iron = '#7c838b';
    return biped(c, {
      skin: fur, shirt: dk(fur, 0.06), pants: '#5a3e26', sleeve: fur, glove: fur, boots: dk(fur, 0.25), feet: toes2, digi: true,
      legW: 12, armW: 11.5, hipY: 88, shadowR: 38, belt: '#3a2a1e', buckle: '#e8dcc0', neck: false,
      torsoD: 'M36,60 C38,44 70,38 88,48 L92,70 L86,92 L48,92 L40,76 Z',
      back: function (c) { return P('M58,44 L66,34 L70,44 L80,36 L82,48 L92,44 L90,56 C80,48 68,44 58,48 Z', c.cel(mane), 1.8) + spikedClub(c, [28, 86], 46, -1.9, 7.5); },
      chest: function (c) {
        return F('M50,90 L84,90 L82,100 L76,96 L70,104 L64,96 L58,104 L52,96 Z', '#5a3e26') +
          P('M42,60 L74,54 L80,80 L50,86 Z', c.cel(iron), 2) + L('M48,64 L72,60 M52,76 L76,72', dk(iron, 0.35), 1.2) + L('M58,62 l6,10', lt(iron, 0.4), 1.2) +
          C(46, 64, 1.3, '#d8d0c0', 0.8) + C(72, 58, 1.3, '#d8d0c0', 0.8) + C(52, 82, 1.3, '#d8d0c0', 0.8) + C(76, 78, 1.3, '#d8d0c0', 0.8) +
          L('M76,50 L86,88', '#3a2a1e', 3.4) + L('M40,56 L50,52', '#3a2a1e', 3);
      },
      front: function (c) { return body(c, 'M52,92 L80,92 L78,106 L72,102 L66,110 L60,102 L54,106 Z', '#6a4a2e', L('M54,96 L78,96', '#3a2a1e', 1.2), 1.8); },
      pads: function (c) {
        var sp = P('M' + pt([40, 48]) + 'L' + pt([34, 34]) + 'L' + pt([46, 44]) + 'Z', c.cel('#d8d0c0'), 1.4) + P('M' + pt([48, 44]) + 'L' + pt([48, 30]) + 'L' + pt([54, 44]) + 'Z', c.cel('#d8d0c0'), 1.4) + P('M' + pt([56, 46]) + 'L' + pt([62, 34]) + 'L' + pt([62, 48]) + 'Z', c.cel('#d8d0c0'), 1.4);
        return body(c, 'M84,58 C84,48 96,46 98,56 L96,64 Z', '#6a4a2e', '', 1.8) + sp + body(c, 'M36,58 C36,42 62,40 64,56 L60,62 L40,64 Z', iron, L('M40,56 C44,50 56,48 62,54', dk(iron, 0.35), 1.2) + C(50, 52, 1.4, '#d8d0c0', 0.8), 2);
      },
      head: function (c, x, y) { return gnollHead(c, x, y, 12, { skin: fur, mane: mane, eyeC: '#ffd03a' }); }, hx: 44, hy: 38,
      near: [[48, 60], [38, 74], [28, 86]], far: [[84, 58], [94, 72], [94, 88]],
      tf: at(1.08, 64, 122)
    });
  }

  // ---- dust devil: whirling funnel of sand with debris and two glowing eyes ----
  function dustDevilArt(c, o) {
    o = o || {};
    var sand = '#cdb080', grey = '#a8a090', s = '';
    var xl = function (y) { return 20 + (y - 24) / 92 * 38; }, xr = function (y) { return 108 - (y - 24) / 92 * 40; };
    // ground dust skirt
    s += body(c, 'M36,122 C28,122 26,114 34,112 C34,104 46,102 50,108 C54,100 70,100 74,108 C80,102 94,104 92,112 C100,112 100,122 92,122 Z', lt(sand, 0.08), F('M60,100 L104,100 L104,124 L66,124 Z', dk(sand, 0.2), 0.6), 2);
    // outer swirl streaks behind
    s += L('M8,62 C14,48 30,40 46,40 M100,86 C112,80 118,68 114,56 M16,94 C22,86 34,82 44,84', OL, 4.4) + L('M8,62 C14,48 30,40 46,40 M100,86 C112,80 118,68 114,56 M16,94 C22,86 34,82 44,84', lt(sand, 0.25), 2);
    // funnel
    var fd = 'M18,24 C22,50 48,88 56,112 C58,118 66,118 68,112 C76,88 102,52 110,22 C96,32 34,34 18,24 Z';
    var bands = '', dark = '';
    for (var i = 0; i < 8; i++) {
      var y = 32 + i * 11, a = xl(y) - 2, b = xr(y) + 2, m = (a + b) / 2;
      var seg = 'M' + pt([a, y - 2]) + 'Q' + pt([m - 6, y + 7]) + ' ' + pt([b, y + 1]);
      if (i % 2) dark += seg; else bands += seg;
    }
    s += body(c, fd, sand, L(bands, lt(sand, 0.35), 2.4, 0.9) + L(dark, dk(sand, 0.28), 2, 0.8) + F('M74,20 C98,32 112,24 112,24 C104,54 80,90 70,118 L60,118 C72,86 86,50 74,20 Z', dk(sand, 0.22), 0.7) + L('M28,40 C40,60 52,84 58,106', grey, 1.4, 0.6), 2.4);
    // spinning rim at the top
    s += E(64, 24, 46, 9, c.cel(lt(sand, 0.1)), 2.2) + E(66, 24, 36, 5.5, dk(sand, 0.3)) + L('M30,24 C44,30 84,30 100,22', lt(sand, 0.4), 1.6, 0.8);
    // debris orbiting
    s += C(14, 44, 3.4, c.cel('#8a8070'), 1.4) + C(104, 44, 2.6, c.cel('#8a8070'), 1.2) + C(92, 96, 2.4, c.cel('#8a8070'), 1.2) + C(30, 76, 2, c.cel('#9a8a70'), 1);
    s += limb('M112,66 L120,60', '#7a5a36', 1.6) + limb('M20,102 L26,96 L25,92', '#7a5a36', 1.4);
    s += P('M110,30 C114,26 120,28 118,32 C116,36 110,36 110,30 Z', c.cel('#b89a4a'), 1) + P('M6,76 C8,70 14,70 13,75 C12,80 6,80 6,76 Z', c.cel('#9aa050'), 1);
    // eyes
    s += P('M42,40 L58,44 L57,50 L44,48 Z', '#2a1a0e', 1.4) + P('M66,44 L82,40 L80,48 L68,50 Z', '#2a1a0e', 1.4);
    s += glowEye(c, 51, 46, 2.6, '#fff0a0') + glowEye(c, 74, 45.5, 2.4, '#fff0a0');
    s += L('M40,37 L58,42 M84,37 L66,42', OL, 2.6);
    return s;
  }

  // ---- gear for the quarry / Fenwick Grey Hood ----
  function pickaxe(c, p, len, ang, hw) {
    var x = p[0], y = p[1], ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca, bot = [x - ca * 10, y - sa * 10], top = [x + ca * len, y + sa * len];
    hw = hw || 16;
    var q = function (u, v) { return [top[0] + px * u + ca * v, top[1] + py * u + sa * v]; };
    var o = limb('M' + pt(bot) + 'L' + pt(top), '#7a5434', 3.4) + L('M' + pt(bot) + 'L' + pt(top), lt('#7a5434', 0.3), 1, 0.6);
    var A = q(hw, -6), B = q(-hw, -6);
    var d = 'M' + pt(A) + 'Q' + pt(q(hw * 0.55, 5)) + ' ' + pt(q(0, 5)) + 'Q' + pt(q(-hw * 0.55, 5)) + ' ' + pt(B) + 'Q' + pt(q(-hw * 0.5, -0.5)) + ' ' + pt(q(0, -1.5)) + 'Q' + pt(q(hw * 0.5, -0.5)) + ' ' + pt(A) + 'Z';
    o += P(d, c.cel('#9a9ea4'), 1.8) + L('M' + pt(q(hw * 0.7, 0.5)) + 'Q' + pt(q(0, 4)) + ' ' + pt(q(-hw * 0.7, 0.5)), '#ffffff', 0.9, 0.55);
    return o + P(pd([q(-3, -3.5), q(3, -3.5), q(3, 4), q(-3, 4)], true), c.cel('#5a5a5e'), 1.4);
  }
  // miner's hard hat with a candle lamp on the front (x, y = Grey Hood head centre)
  function minerHat(c, x, y) {
    var col = '#a07c42', o = '';
    o += body(c, 'M' + pt([x - 13, y - 8]) + 'C' + pt([x - 15, y - 21]) + ' ' + pt([x - 4, y - 26]) + ' ' + pt([x + 2, y - 26]) + 'C' + pt([x + 10, y - 26]) + ' ' + pt([x + 17, y - 20]) + ' ' + pt([x + 16, y - 8]) + 'Z', col,
      F(pd([[x + 5, y - 28], [x + 18, y - 28], [x + 18, y - 6], [x + 7, y - 6]], true), dk(col, 0.3), 0.8) + L('M' + pt([x + 1, y - 26]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 2, y - 8]), dk(col, 0.35), 1.4) + E(x - 6, y - 19, 4, 2, lt(col, 0.4), 0, 0.6) + E(x + 8, y - 14, 3, 1.6, '#e8d8b0', 0, 0.45), 2);
    o += P('M' + pt([x - 19, y - 8]) + 'C' + pt([x - 10, y - 11]) + ' ' + pt([x + 12, y - 11]) + ' ' + pt([x + 20, y - 7]) + 'C' + pt([x + 12, y - 5]) + ' ' + pt([x - 10, y - 5]) + ' ' + pt([x - 19, y - 8]) + 'Z', c.cel(dk(col, 0.12)), 1.8);
    o += C(x - 17, y - 17, 13, glow(c, '#ffd060', 0.6)) + R(x - 20, y - 21, 7, 8, c.cel('#6a6258'), 1.4) + C(x - 16.5, y - 17, 2.4, '#ffe890', 1) + flame(c, x - 16.5, y - 21.5, 0.32);
    return o;
  }
  // bare fist wearing spiked brass knuckles (spikes point left, at the foe)
  function spikedFist(c, p, skin) {
    var x = p[0], y = p[1], br = '#c8a04a';
    var o = C(x + 1, y, 5.8, c.cel(skin), 2) + L('M' + pt([x + 1, y - 5]) + 'l2,2 M' + pt([x + 3, y + 3]) + 'l2,1', dk(skin, 0.35), 1);
    o += P(pd([[x - 3, y - 6.5], [x - 7, y - 6], [x - 7.5, y + 6], [x - 3, y + 6.5]], true), c.cel(br), 1.5);
    [-4, 0, 4].forEach(function (k) { o += P(pd([[x - 7, y + k - 1.8], [x - 12.5, y + k], [x - 7, y + k + 1.8]], true), c.cel('#d8d4c8'), 1.1); });
    return o;
  }
  // coiled leather whip from the fist, lash cracking out in front
  function whip(c, p) {
    var x = p[0], y = p[1];
    var hd = 'M' + pt([x + 2, y + 5]) + 'L' + pt([x - 2, y - 9]), lash = 'M' + pt([x - 2, y - 9]) + 'C' + pt([x - 12, y - 22]) + ' ' + pt([x - 25, y - 12]) + ' ' + pt([x - 21, y + 6]) + 'C' + pt([x - 18, y + 20]) + ' ' + pt([x - 6, y + 28]) + ' ' + pt([x - 13, y + 44]);
    return L(lash, OL, 4.6) + L(lash, '#6a4428', 2.2) + L(lash, '#9a6a40', 0.8, 0.7) + P(pd([[x - 13, y + 44], [x - 18, y + 48], [x - 12, y + 50], [x - 16, y + 53]], false), 'none', 1.2) + limb(hd, '#3a2418', 3.4) + L('M' + pt([x + 1, y + 1]) + 'l-2,-1.5 M' + pt([x, y - 3]) + 'l-2,-1.5', '#b08a50', 1.1);
  }
  // rapier: slim blade, cup guard, knuckle bow
  function rapier(c, p, len, ang) {
    var x = p[0], y = p[1], ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca, gold = '#d8b050';
    var q = function (u, v) { return [x + ca * u + px * v, y + sa * u + py * v]; };
    var o = P(pd([q(6, 1.9), q(len - 5, 0.8), q(len, 0), q(len - 5, -0.8), q(6, -1.9)], true), c_('#dce0e6'), 1.3) + L('M' + pt(q(8, 0)) + 'L' + pt(q(len - 7, 0)), '#ffffff', 0.8, 0.6);
    var qd = 'M' + pt(q(5, 8)) + 'L' + pt(q(5, -8)), bow = 'M' + pt(q(5, -7)) + 'Q' + pt(q(-3, -11)) + ' ' + pt(q(-9, -2));
    o += L('M' + pt(q(-8, 0)) + 'L' + pt(q(4, 0)), OL, 5) + L('M' + pt(q(-8, 0)) + 'L' + pt(q(4, 0)), '#3a2418', 2.6);
    o += L(qd + bow, OL, 3.8) + L(qd + bow, gold, 1.6) + C(q(5, 0)[0], q(5, 0)[1], 4, c_('#c89a40'), 1.6) + C(q(-9, 0)[0], q(-9, 0)[1], 2.6, c_(gold), 1.3);
    return o;
  }
  // highwayman's wide-brimmed hat (x, y = Grey Hood head centre), band and a pale grey plume
  function brimHat(c, x, y, col, band) {
    var o = P('M' + pt([x + 8, y - 20]) + 'C' + pt([x + 18, y - 28]) + ' ' + pt([x + 28, y - 26]) + ' ' + pt([x + 32, y - 20]) + 'C' + pt([x + 26, y - 22]) + ' ' + pt([x + 18, y - 20]) + ' ' + pt([x + 12, y - 15]) + 'Z', c.cel(DEF_RED), 1.4);
    o += body(c, 'M' + pt([x - 11, y - 11]) + 'C' + pt([x - 12, y - 22]) + ' ' + pt([x - 6, y - 27]) + ' ' + pt([x + 1, y - 25]) + 'C' + pt([x + 6, y - 28]) + ' ' + pt([x + 14, y - 25]) + ' ' + pt([x + 14, y - 11]) + 'Z', col,
      F(pd([[x + 4, y - 30], [x + 16, y - 30], [x + 16, y - 9], [x + 6, y - 9]], true), dk(col, 0.35), 0.8) + F(pd([[x - 12, y - 16], [x + 15, y - 15], [x + 15, y - 11], [x - 12, y - 11]], true), band) + L('M' + pt([x - 4, y - 24]) + 'Q' + pt([x - 2, y - 18]) + ' ' + pt([x - 5, y - 16]), lt(col, 0.25), 1, 0.7), 2);
    o += P('M' + pt([x - 25, y - 7]) + 'C' + pt([x - 16, y - 14]) + ' ' + pt([x + 18, y - 16]) + ' ' + pt([x + 31, y - 10]) + 'C' + pt([x + 26, y - 7]) + ' ' + pt([x + 14, y - 9]) + ' ' + pt([x + 4, y - 9]) + 'C' + pt([x - 6, y - 9]) + ' ' + pt([x - 16, y - 5]) + ' ' + pt([x - 25, y - 7]) + 'Z', c.cel(dk(col, 0.05)), 2);
    return o + L('M' + pt([x - 20, y - 9]) + 'C' + pt([x - 8, y - 12]) + ' ' + pt([x + 14, y - 13]) + ' ' + pt([x + 26, y - 10]), lt(col, 0.2), 1, 0.6);
  }
  // curved scythe blade bolted straight onto a forearm (flip -1 curls the tip the other way)
  function armBlade(c, base, ang, len, flip, col) {
    var L0 = len, d = 'M-2,-4 C' + n(L0 * 0.45) + ',-10 ' + n(L0 * 0.86) + ',-6 ' + n(L0) + ',' + n(L0 * 0.3) + ' C' + n(L0 * 0.72) + ',1 ' + n(L0 * 0.36) + ',4 -2,5 Z';
    var hi = 'M3,-4 C' + n(L0 * 0.45) + ',-8 ' + n(L0 * 0.8) + ',-4.5 ' + n(L0 * 0.94) + ',' + n(L0 * 0.2);
    var edge = 'M' + n(L0 * 0.2) + ',3 C' + n(L0 * 0.5) + ',2 ' + n(L0 * 0.76) + ',1 ' + n(L0 * 0.95) + ',' + n(L0 * 0.26);
    var s = P(d, c.cel(col || '#b8bcc0'), 1.8) + L(hi, '#ffffff', 1, 0.55) + L(edge, lt(col || '#b8bcc0', 0.45), 1, 0.9) + R(-5, -6, 9, 12, c.cel('#3a3c42'), 1.4) + C(-0.5, 0, 1.4, '#9aa29a', 0.8);
    return G(s, 'translate(' + n(base[0]) + ',' + n(base[1]) + ') rotate(' + n(ang * 180 / PI) + ') scale(1,' + (flip || 1) + ')');
  }
  function harvestReaper(c) {
    var ir = '#464a52', dir = dk(ir, 0.3), grn = '#8cff5a', cloth = '#3a3e36', steel = '#aeb8b4', rv = '#9aa498', s = shadow(c, 64, 56);
    // twin stacks puffing sickly smoke
    s += C(96, 12, 5.4, '#7a8a78', 0, 0.55) + C(104, 6, 4.4, '#8a9a88', 0, 0.45) + C(110, 14, 4, '#7a8a78', 0, 0.45);
    s += body(c, 'M88,40 L89,20 L97,20 L97,42 Z', ir, '', 1.8) + R(87, 17, 11, 5, c.cel(dir), 1.6);
    s += body(c, 'M99,46 L100,28 L106,28 L106,48 Z', ir, '', 1.6) + R(98, 25, 9, 4, c.cel(dir), 1.4);
    // far arm raised, its blade curling forward over the shoulder
    s += tube([[90, 54], [104, 50], [108, 36]], 9, dk(ir, 0.12)) + C(104, 50, 5, c.cel(dir), 1.8);
    s += armBlade(c, [108, 38], -1.72, 30, -1, dk(steel, 0.08));
    // legs: long pistons, wide stance, clawed feet
    s += tube([[80, 92], [94, 104], [90, 115]], 11, dk(ir, 0.18)) + C(94, 104, 5.4, c.cel(dir), 1.8) + ironFoot(92, 121, dir) + P('M99,118 L106,122 L97,122 Z', '#8a8a90', 1.2);
    s += tube([[50, 92], [38, 104], [42, 115]], 12, ir, dk(ir, 0.3)) + C(38, 104, 6, c.cel(dk(ir, 0.1)), 1.8) + ironFoot(44, 121, ir) + P('M30,118 L23,122 L32,122 Z', '#8a8a90', 1.2);
    // tattered burlap cloak hanging behind the chassis
    s += body(c, 'M44,42 C58,34 88,36 98,48 C104,66 108,88 112,108 L104,102 L100,112 L92,102 L86,110 L80,100 L72,106 C70,80 58,60 44,42 Z', cloth,
      L('M86,50 C92,70 96,86 100,104 M76,52 C82,70 84,86 86,104', dk(cloth, 0.4), 1.2) + F('M92,40 L116,40 L116,114 L100,114 C100,86 98,62 92,40 Z', dk(cloth, 0.3), 0.8), 2);
    // hull: tall iron barrel, plate seams, green furnace grille
    var hull = 'M36,54 C36,40 54,34 68,34 C86,34 96,42 96,58 L94,84 C92,96 80,102 66,102 C50,102 40,96 38,86 Z';
    s += body(c, hull, ir, F('M80,32 C94,38 100,52 98,70 L96,104 L104,104 L104,32 Z', dk(ir, 0.35), 0.85) + L('M37,68 C54,64 80,64 95,66 M38,86 C54,82 80,82 94,84 M68,34 L66,102', dk(ir, 0.45), 1.6) +
      F('M44,44 C52,38 62,36 70,38 C60,42 50,46 46,54 Z', lt(ir, 0.3), 0.6) + L('M76,72 l6,8 M50,90 l8,-3 M84,46 l-3,9', lt(ir, 0.35), 1, 0.6) + E(58, 96, 10, 3, '#1e2a1a', 0, 0.5), 2.6);
    s += rivets([[42, 66], [54, 64], [80, 64], [90, 65], [44, 84], [56, 82], [80, 82], [90, 83], [67, 44], [67, 54], [66, 74], [66, 92]], rv);
    s += C(52, 76, 16, glow(c, grn, 0.5)) + R(42, 70, 20, 12, '#0c160a', 1.6) + R(44, 72, 16, 8, '#3a9a2a') + F('M46,74 L58,74 L58,78 L46,78 Z', '#b8ff90', 0.8) + L('M46,70 L46,82 M50,70 L50,82 M54,70 L54,82 M58,70 L58,82', '#5a6a5a', 1.6);
    // head: pointed iron cowl-helm, a single green eye in the dark opening
    var hx = 52, hy = 32;
    s += body(c, 'M' + pt([hx - 15, hy + 12]) + 'C' + pt([hx - 18, hy - 2]) + ' ' + pt([hx - 10, hy - 16]) + ' ' + pt([hx + 4, hy - 22]) + 'L' + pt([hx + 12, hy - 24]) + 'C' + pt([hx + 16, hy - 14]) + ' ' + pt([hx + 21, hy - 2]) + ' ' + pt([hx + 19, hy + 14]) + 'Z', dk(ir, 0.05),
      F(pd([[hx + 6, hy - 26], [hx + 24, hy - 26], [hx + 24, hy + 16], [hx + 10, hy + 16]], true), dk(ir, 0.4), 0.8) + L('M' + pt([hx + 2, hy - 20]) + 'C' + pt([hx + 8, hy - 8]) + ' ' + pt([hx + 10, hy + 2]) + ' ' + pt([hx + 10, hy + 14]), dk(ir, 0.45), 1.4) + F('M' + pt([hx - 12, hy - 2]) + 'C' + pt([hx - 10, hy - 10]) + ' ' + pt([hx - 4, hy - 16]) + ' ' + pt([hx + 2, hy - 18]) + 'C' + pt([hx - 4, hy - 12]) + ' ' + pt([hx - 8, hy - 6]) + ' ' + pt([hx - 9, hy]) + 'Z', lt(ir, 0.3), 0.6), 2.4);
    s += C(hx - 7, hy + 2, 24, glow(c, grn, 0.55)) + P('M' + pt([hx - 15, hy + 11]) + 'C' + pt([hx - 16, hy]) + ' ' + pt([hx - 10, hy - 9]) + ' ' + pt([hx, hy - 10]) + 'C' + pt([hx + 3, hy - 2]) + ' ' + pt([hx + 2, hy + 8]) + ' ' + pt([hx - 1, hy + 12]) + 'Z', '#0a0c08', 1.8);
    s += E(hx - 7, hy - 1, 5, 3.2, '#4ade3a') + E(hx - 8, hy - 1.4, 2.4, 1.6, '#eaffc0') + L('M' + pt([hx - 15, hy - 6]) + 'L' + pt([hx + 1, hy - 8]), OL, 2.6);
    s += L('M' + pt([hx - 12, hy + 6]) + 'L' + pt([hx - 1, hy + 6]) + 'M' + pt([hx - 12, hy + 9]) + 'L' + pt([hx - 1, hy + 9]), '#6a7a6a', 1.2);
    // near arm: spiked pauldron, forearm thrust forward, blade sweeping down in front
    s += armBlade(c, [20, 76], 1.8, 36, -1, steel);
    s += tube([[42, 58], [30, 70], [20, 76]], 11, ir, dk(ir, 0.3)) + C(30, 70, 5.5, c.cel(dk(ir, 0.1)), 1.8) + R(12, 71, 12, 10, c.cel(dir), 1.8);
    s += P('M30,54 L22,40 L36,48 Z', c.cel('#8a8e94'), 1.4) + P('M40,48 L40,32 L47,46 Z', c.cel('#8a8e94'), 1.4) + C(42, 56, 10, c.cel(dk(ir, 0.02)), 2.2) + F('M36,50 C40,47 46,47 48,50 C44,50 40,52 38,54 Z', lt(ir, 0.35), 0.7) + rivets([[37, 60], [47, 60], [42, 64]], rv);
    return G(s, at(1.04, 64, 122));
  }
  // butcher's cleaver on a short haft: broad blade on the far side (v < 0), notched edge, hanging hole
  function cleaver(c, p, len, ang, bw) {
    var x = p[0], y = p[1], ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca;
    var q = function (u, v) { return [x + ca * u + px * v, y + sa * u + py * v]; };
    var o = limb('M' + pt(q(-10, 0)) + 'L' + pt(q(len * 0.52, 0)), '#6a4428', 3.6) + L('M' + pt(q(-2, -3)) + 'L' + pt(q(0, 3)) + 'M' + pt(q(3, -3)) + 'L' + pt(q(5, 3)) + 'M' + pt(q(8, -3)) + 'L' + pt(q(10, 3)), '#3a2a1a', 1.4);
    var d = pd([q(len * 0.44, 2.5), q(len, 2.5), q(len + 1, -2), q(len - 1, -bw - 1), q(len * 0.66, -bw), q(len * 0.56, -bw + 1.5), q(len * 0.46, -bw * 0.5)], true);
    o += P(d, c.cel('#a0a6ac'), 2) + L('M' + pt(q(len * 0.5, -bw * 0.52)) + 'L' + pt(q(len * 0.66, -bw + 0.8)) + 'L' + pt(q(len - 2, -bw)), '#ffffff', 1.1, 0.6) + L('M' + pt(q(len * 0.46, 1.5)) + 'L' + pt(q(len - 1, 1.5)), '#5a5e64', 1.4);
    o += F(pd([q(len * 0.74, -bw - 0.2), q(len * 0.78, -bw + 2.4), q(len * 0.82, -bw - 0.2)], true), '#c8b07a') + C(q(len * 0.86, -3)[0], q(len * 0.86, -3)[1], 1.9, '#2a1a10', 1) + E(q(len * 0.6, -4)[0], q(len * 0.6, -4)[1], 2.6, 1.8, '#7a4a2a', 0, 0.55);
    return o;
  }
  function brashclaw(c) {
    var fur = '#94602e', mane = '#2a180c', iron = '#6a7078', brass = '#c89a40', flag = '#c8a262';
    return biped(c, {
      skin: fur, shirt: dk(fur, 0.06), pants: '#4a3420', sleeve: fur, glove: fur, boots: dk(fur, 0.25), feet: toes2, digi: true,
      legW: 12.5, armW: 12, hipY: 88, shadowR: 40, belt: '#2e2016', buckle: '#e8dcc0', neck: false,
      torsoD: 'M34,60 C36,44 70,38 90,48 L94,70 L88,92 L48,92 L38,76 Z',
      back: function (c) {
        // trophy banner on a pole strapped to the back: hide flag with red claw slashes
        var o = limb('M86,70 L95,15', '#5a3a22', 2.8) + C(95, 14, 2.2, brass, 1.2);
        o += body(c, 'M95,18 L116,20 L115,42 L110,38 L106,46 L102,39 L97,44 Z', flag, L('M102,23 L99,36 M107,23 L104,37 M112,24 L109,36', '#8a2a1a', 2.2) + F('M108,16 L118,16 L118,46 L108,46 Z', dk(flag, 0.3), 0.6), 1.8);
        o += P('M58,44 L66,34 L70,44 L80,36 L82,48 L92,44 L90,56 C80,48 68,44 58,48 Z', c.cel(mane), 1.8);
        return o + cleaver(c, [31, 86], 48, -1.74, 12.5);
      },
      chest: function (c) {
        return F('M50,90 L86,90 L84,100 L78,96 L72,104 L66,96 L60,104 L54,96 Z', '#4a3420') +
          P('M40,60 L76,54 L82,82 L48,88 Z', c.cel(iron), 2) + L('M46,64 L74,60 M50,78 L78,74', dk(iron, 0.35), 1.2) + L('M56,62 l6,12', lt(iron, 0.4), 1.2) +
          C(45, 64, 1.5, brass, 0.8) + C(73, 58, 1.5, brass, 0.8) + C(51, 84, 1.5, brass, 0.8) + C(78, 79, 1.5, brass, 0.8) +
          P('M72,48 L84,50 L60,92 L50,90 Z', c.cel('#7a2a1e'), 1.6) + L('M74,52 L56,88', dk('#7a2a1e', 0.35), 1);
      },
      front: function (c) { return body(c, 'M50,92 L82,92 L80,108 L74,104 L68,112 L62,104 L56,110 Z', '#5a3e26', L('M52,96 L80,96', '#2e2016', 1.2), 1.8) + skull(c, 62, 88, 0.62); },
      pads: function (c) {
        var o = body(c, 'M84,58 C84,46 98,44 100,56 L98,64 Z', '#5a3e26', L('M86,54 C90,50 96,50 98,54', brass, 1.2), 1.8);
        // big layered iron pauldron, brass rim, trophy skull
        o += P('M32,56 L26,40 L38,50 Z', c.cel('#d8d0c0'), 1.4) + P('M42,50 L40,34 L48,48 Z', c.cel('#d8d0c0'), 1.4);
        o += body(c, 'M30,64 C26,44 62,36 68,56 L64,66 L36,68 Z', iron, L('M32,60 C38,52 56,48 66,58', brass, 2.2) + L('M34,54 C40,46 54,44 62,50', dk(iron, 0.35), 1.2) + F('M36,48 C42,44 50,43 56,45 C48,46 42,48 38,52 Z', lt(iron, 0.4), 0.7), 2.2);
        return o + L('M31,65 L65,64', brass, 2) + C(40, 62, 1.4, '#efe6cf', 0.8) + C(58, 61, 1.4, '#efe6cf', 0.8) + skull(c, 50, 56, 0.62);
      },
      head: function (c, x, y) { return gnollHead(c, x, y, 12, { skin: fur, mane: mane, eyeC: '#ff5a2a' }); }, hx: 44, hy: 38,
      near: [[48, 60], [38, 74], [31, 86]], far: [[84, 58], [94, 72], [94, 88]],
      top: function (c) {
        // crude sergeant's helmet: dented iron cap, brass rim, one bent horn; the ear pokes through
        var o = body(c, 'M31,29 C30,18 42,13 50,15 C57,17 60,24 59,31 Z', iron, F('M50,12 L62,12 L62,32 L52,32 C55,24 54,18 50,12 Z', dk(iron, 0.35), 0.8) + L('M40,18 l3,5 l-1,4', dk(iron, 0.45), 1.2) + F('M36,20 C40,16 46,15 50,16 C44,18 40,20 38,24 Z', lt(iron, 0.4), 0.7), 2);
        o += P('M29,28 L60,30 L60,33.5 L29,31.5 Z', c.cel(brass), 1.6) + C(36, 30, 1, '#6a4a1a') + C(46, 30.8, 1, '#6a4a1a') + C(55, 31.6, 1, '#6a4a1a');
        o += P('M35,22 C30,17 26,14 23,9 C30,11 35,14 40,19 Z', c.cel('#e0d4b8'), 1.6) + L('M30,15 l3,-1.5 M27,12 l3,-1', dk('#e0d4b8', 0.35), 1);
        o += P(pd([[49, 26], [52, 11], [57, 27]], true), fur, 2) + F(pd([[51, 24], [52, 15], [54.5, 24]], true), '#8a4a44', 0.8);
        return o + L('M20,39 L27,46', '#e8c8a0', 1.3, 0.9);
      },
      tf: at(1.07, 64, 122)
    });
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    young_goretusk: function (c) { return goretusk(c, { col: '#6e5040', mane: '#3a2618', snout: '#a87866', tusk: 0.85, scale: 0.8, seed: 5 }); },
    goretusk: function (c) { return goretusk(c, { col: '#5e4234', mane: '#2e1c12', snout: '#9a6a5a', tusk: 1.35, scars: true, scale: 1.02, seed: 9, eye: '#ff4a1a' }); },
    fleshripper: function (c) { return vulture(c, { col: '#4a3a32', wing: '#3a2e2a', head: '#cc5a44' }); },
    harvest_watcher: function (c) { return harvestWatcher(c); },
    defias_trapper: function (c) {
      return defias(c, {
        torso: '#7a6450', sleeve: '#8d8474', vest: '#6a4a2f', pants: '#4b3a2b', armband: DEF_RED,
        chest: function () { return L('M50,52 L78,84', '#3a2a1a', 2.4); },
        back: function (c) { return E(84, 84, 9, 7, c.cel('#b8a878'), 1.6) + E(84, 84, 5, 3.6, 'none', 1.2); },
        near: [[48, 54], [38, 66], [28, 72]],
        wNearFront: function (c, p) { return netHang(c, [p[0], p[1] + 2], 30, 42, '#d8c898', '#6a6a70', -6); }
      });
    },
    defias_smuggler: function (c) {
      return defias(c, {
        hood: '#6b6f74', torso: '#5a4a3a', sleeve: '#6a5a48', pants: '#3e3228', boots: '#241a14', belt: '#2b2018',
        back: function (c) {
          // cloak hanging behind + a sack slung over the far shoulder
          return body(c, 'M50,46 C66,40 84,44 88,52 C94,72 96,96 98,114 L88,110 L80,115 L72,110 L62,114 C62,90 58,66 50,46 Z', '#6a5038', F('M84,48 C92,70 96,94 100,116 L86,116 C84,92 82,70 78,48 Z', dk('#6a5038', 0.35), 0.6), 2.2) +
            G(sack(c, 96, 58, 1.25, '#c0a070'), rot(-24, 96, 58));
        },
        chest: function () { return L('M80,48 L52,86', '#4a3a28', 3.2); },
        near: [[48, 54], [38, 68], [30, 76]],
        wNear: function (c, p) { return dagger(p, -2.3, 1.1); }
      });
    },
    defias_pathstalker: function (c) {
      return defias(c, {
        hood: '#56595e', mask: '#7c8085', torso: '#3e302a', sleeve: '#4a3a30', vest: '#2a201c', pants: '#2e2620', boots: '#1a1410', belt: '#1a1410', buckle: '#c8c0a8', glove: '#2a1e18',
        pads: function (c) { return leatherPad(c, 80, 52, '#3a2c24', DEF_RED) + leatherPad(c, 48, 52, '#4a3a2e', DEF_RED); },
        chest: function () { return L('M50,54 L78,86 M78,54 L52,86', '#1e1612', 2.2); },
        near: [[48, 54], [38, 68], [30, 74]], far: [[80, 54], [90, 62], [96, 54]],
        wNear: function (c, p) { return sword(p, 30, -2.25, '#d0d4da', 0.9); },
        wFar: function (c, p) { return sword(p, 28, -1.2, '#b8bcc2', 0.85); },
        tf: at(1.04, 64, 122)
      });
    },
    murloc_coastrunner: function (c) {
      return mireling(c, {
        skin: '#8aa452', belly: '#ece0b0', fin: '#d8904a', scale: 0.98,
        fItem: function (c) { return spear(c, [22, 40], [36, 118], 14, '#c8c0a8', '#8a6a44'); }
      });
    },
    murloc_tidehunter: function (c) {
      return mireling(c, {
        skin: '#5e7e8e', belly: '#cadad2', fin: '#6a5a9a', eyeC: '#f0f0c0', scale: 1.1,
        marks: function () { return L('M58,58 l6,6 M66,54 l6,6 M74,60 l5,5', '#3a5464', 2, 0.7); },
        back: function (c) { return net(c, [58, 38], [96, 70], 14, '#c8c0a0', '#e0a040'); },
        front: function (c) { return netHang(c, [27, 92], 26, 26, '#e0d8b8', '#e0a040', -4); }
      });
    },
    foe_reaper: function (c) { return foeReaper(c); },
    riverpaw_brute: function (c) { return riverpawBrute(c); },
    dust_devil: function (c) { return shadow(c, 64, 34) + dustDevilArt(c); },
    defias_digger: function (c) {
      var dust = '#e8dcc0';
      return defias(c, {
        hood: '#73777c', torso: '#9a8a6e', sleeve: '#9a8a6e', forearm: '#e4b48a', pants: '#6a5840', boots: '#3a2e22', belt: '#3a2a1c', glove: '#5a4430',
        back: function (c) { return G(sack(c, 92, 70, 1.05, '#a89066'), rot(-14, 92, 70)) + C(90, 50, 3.4, c.cel('#8a8070'), 1.2) + C(96, 51, 2.8, c.cel('#9a9080'), 1.1); },
        chest: function () { return L('M78,48 L52,86', '#5a4430', 3) + E(56, 62, 6, 3, dust, 0, 0.55) + E(72, 78, 5, 2.4, dust, 0, 0.5) + E(62, 84, 7, 2, dust, 0, 0.45); },
        near: [[48, 54], [40, 66], [34, 74]],
        wNear: function (c, p) { return pickaxe(c, p, 38, -1.95, 15); },
        top: function (c) { return minerHat(c, 60, 30) + E(52, 104, 4, 2.4, dust, 0, 0.5) + E(70, 106, 4, 2.2, dust, 0, 0.45) + E(34, 76, 3.4, 2, dust, 0, 0.5); }
      });
    },
    defias_overseer: function (c) {
      var apron = '#5a3a26';
      return defias(c, {
        bandana: DEF_RED, neckCol: '#d8a47c', skin: '#d8a47c', torso: '#7a6a58', sleeve: '#7a6a58', pants: '#3e3226', boots: '#241a14', belt: '#2b2018', glove: '#3a2a1e', armW: 10, legW: 11.5, shadowR: 36,
        torsoD: 'M42,50 C50,44 78,44 86,50 L88,72 C88,84 84,90 80,90 L48,90 C44,90 40,84 40,72 Z',
        front: function (c) {
          var d = 'M49,54 L79,54 L82,108 L46,108 Z';
          return L('M52,56 L56,46 M76,56 L72,46', '#2e2016', 2.6) + body(c, d, apron, F('M68,50 L86,50 L86,110 L72,110 C74,90 72,70 68,50 Z', dk(apron, 0.3), 0.8) +
            L('M50,58 L78,58 M47,104 L81,104', lt(apron, 0.2), 1, 0.7) + P('M54,74 L68,74 L68,86 L54,86 Z', dk(apron, 0.12), 1.2) + L('M58,74 l0,-5', '#b8b0a0', 1.6) + E(64, 96, 6, 3, '#3a2616', 0, 0.5) + C(50, 57, 1.2, '#c8c0a8', 0.6) + C(78, 57, 1.2, '#c8c0a8', 0.6), 2) +
            L('M46,74 L42,78 M82,74 L86,78', '#2e2016', 2);
        },
        near: [[48, 54], [40, 46], [34, 38]],
        wNearFront: function (c, p) { return whip(c, p); },
        far: [[82, 54], [90, 68], [82, 78]],
        tf: 'matrix(1.14,0,0,1.06,' + n(64 - 64 * 1.14) + ',' + n(122 - 122 * 1.06) + ')'
      });
    },
    defias_knuckleduster: function (c) {
      var skin = '#d6a078';
      return defias(c, {
        skin: skin, torso: '#5a4636', sleeve: skin, forearm: skin, vest: '#3e2e22', pants: '#443428', boots: '#221a14', belt: '#241a12', buckle: '#d8b050', armW: 11, legW: 12, shadowR: 34,
        torsoD: 'M40,50 C48,43 80,43 88,50 L86,70 L82,88 L46,88 L42,70 Z',
        chest: function () { return L('M52,50 L50,86 M76,50 L78,86', '#2a1e16', 1.6); },
        near: [[46, 56], [32, 64], [24, 54]], far: [[82, 54], [94, 62], [92, 48]],
        nearHand: function (c, p) { return spikedFist(c, p, skin); },
        farHand: function (c, p) { return spikedFist(c, p, dk(skin, 0.08)); },
        pads: function (c) { return R(40, 58, 12, 5, DEF_RED, 1.4); },
        tf: 'matrix(1.12,0,0,0.98,' + n(64 - 64 * 1.12) + ',' + n(122 - 122 * 0.98) + ')'
      });
    },
    defias_highwayman: function (c) {
      var coat = '#4a3830';
      return defias(c, {
        bandana: DEF_HOOD, neckCol: '#e4b48a', torso: coat, sleeve: coat, pants: '#3a2e26', boots: '#1e1612', belt: '#1e1612', buckle: '#d8b050', glove: '#2a1e18',
        back: function (c) { return body(c, 'M48,76 L84,74 C88,90 92,104 94,116 L84,112 L78,117 L70,112 L62,116 C60,104 54,90 48,76 Z', dk(coat, 0.1), L('M72,80 L74,112 M82,80 L88,112', dk(coat, 0.45), 1.2) + F('M78,72 L98,72 L98,120 L86,120 C86,104 82,88 78,72 Z', dk(coat, 0.3), 0.7), 2); },
        chest: function (c) { return P('M56,48 L72,48 L64,64 Z', '#ddd0b4', 1.4) + P('M58,50 L64,58 L70,50 L66,62 L62,62 Z', c.cel(DEF_RED), 1) + P('M50,50 L58,48 L64,66 L56,74 Z', c.cel(lt(coat, 0.12)), 1.4) + P('M72,48 L80,50 L74,72 L66,66 Z', c.cel(dk(coat, 0.05)), 1.4) + C(56, 78, 1.4, '#d8b050', 0.8) + C(57, 84, 1.4, '#d8b050', 0.8); },
        front: function (c) { return body(c, 'M47,84 L62,86 L62,111 C56,114 47,114 40,110 Z', coat, L('M54,88 C54,96 52,104 50,112', dk(coat, 0.45), 1.2) + F('M58,84 L66,84 L66,116 L58,116 Z', dk(coat, 0.3), 0.7), 1.8); },
        near: [[48, 54], [38, 64], [28, 68]],
        wNear: function (c, p) { return rapier(c, p, 46, -1.98); },
        top: function (c) { return G(brimHat(c, 60, 30, '#2e2622', DEF_RED), rot(-5, 60, 22)); }
      });
    },
    rusty_harvest_golem: function (c) {
      return reaperRig(c, {
        hull: '#a45a2e', iron: '#6a5c52', rivet: '#c8a888', eye: '#ffb030', eyeGlow: '#ff9a20', eyeCore: '#fff0a0', grille: '#ff9a30', nearBlade: '#a8a49a', scale: 0.92,
        farArm: function (c, red, ir) {
          // snapped off at the elbow: torn plate, dangling wires, a spark
          return tube([[94, 50], [104, 42]], 9, dk(ir, 0.1)) + P('M100,36 L106,34 L104,38 L110,38 L106,42 L110,46 L102,48 Z', c.cel(dk(red, 0.1)), 1.6) +
            L('M106,42 C112,48 112,54 108,60 M104,44 C106,52 102,56 100,62', OL, 2.4) + L('M106,42 C112,48 112,54 108,60', '#c8a040', 1) + L('M104,44 C106,52 102,56 100,62', '#8a3a2a', 1) +
            P(star(110, 34, 4, 4.6, 1.4), '#ffe070', 0.8) + C(110, 34, 6, glow(c, '#ffd040', 0.6));
        },
        hullX: function (c, red) {
          // bolted-on repair plates, rust streaks, a punched hole leaking straw
          return P('M74,66 L96,65 L96,78 L75,79 Z', c.cel('#7a7068'), 1.4) + P('M36,42 L52,38 L54,50 L38,53 Z', c.cel('#8a6a3a'), 1.4) + P('M84,84 L98,82 L96,92 L86,94 Z', c.cel('#6a6860'), 1.2) +
            L('M48,62 l1,9 M78,62 l0,12 M100,63 l-1,9 M60,82 l1,8 M92,82 l0,7', '#5a2a14', 1.6, 0.8) + E(84, 44, 6, 4, '#1a0e08', 1.2);
        },
        extra: function (c) {
          return rivets([[76, 68], [94, 67], [76, 77], [94, 76], [38, 45], [50, 41], [40, 51], [86, 86], [95, 84]], '#d8d0c0') + strawBits(c, [[84, 44, -0.8, 9], [86, 46, 0.2, 8]]) +
            E(44, 26, 3, 1.6, '#5a2a14', 0, 0.7) + L('M60,20 l1,6 M70,26 l0,5', '#5a2a14', 1.4, 0.7);
        }
      });
    },
    harvest_reaper: function (c) { return harvestReaper(c); },
    sergeant_brashclaw: function (c) { return brashclaw(c); }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#a88a5a'), 2.5); }
  function phScene(c) { return sky(c, '#5a8cc2', '#b4c8cc', '#f4d8a2') + ground(c, 156, GROUND, GROUND2); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#a88a5a"/></svg>'; }
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
