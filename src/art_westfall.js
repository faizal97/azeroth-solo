/* art_westfall.js — Westfall zone art for Azeroth Solo (Alliance, levels 10-15: Sentinel Hill, Furlbrow's Pumpkin Farm,
 * Saldean's Farm, the Jangolode Mine, the Molsen Farm, the Longshore and the Dagger Hills).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Westfall keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix wf<counter>_).
 * Palette: warm late-afternoon sky, golden-brown dry farmland, wheat, red Defias cloth, grey-blue sea to the west.
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
  // many-pointed star (used for a lion-head crest and gear teeth)
  function star(cx, cy, k, r0, r1) {
    var d = '';
    for (var i = 0; i < k * 2; i++) { var a = -PI / 2 + PI * i / k, r = i % 2 ? r1 : r0; d += (i ? 'L' : 'M') + pt([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return d + 'Z';
  }

  // ---------- palette ----------
  var GROUND = '#c8a24e', GROUND2 = '#9a7434', GRASSD = '#8a6428', GRASSL = '#ecd080', WHEAT = '#e0b24a', DUST = '#e2c890';
  var WOOD = '#8a5a32', WOODW = '#8e7456', STONE = '#b0a288', ROOF = '#8a4632', PLASTER = '#e2d2aa', BEAM = '#5a3a24';
  var SW_BLUE = '#2e56a8', SW_GOLD = '#e8c048', DEF_RED = '#b82d31', DEF_HOOD = '#a3252a', SEA = '#6a8ca4';

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
  // Defias crate: a red cloth tied over the lid
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
  // Stormwind-style farmhouse: stone ground floor, half-timbered upper, steep shingle roof
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
    var st = STONE, wd = '#9a7a52', out = '';
    out += E(x, y + 2, 36 * s, 5 * s, '#000', 0, 0.26);
    var tw = 'M' + pt([x - 24 * s, y]) + 'L' + pt([x - 16 * s, y - 84 * s]) + 'L' + pt([x + 16 * s, y - 84 * s]) + 'L' + pt([x + 24 * s, y]) + 'Z';
    var sh = F('M' + pt([x + 4 * s, y - 86 * s]) + 'L' + pt([x + 26 * s, y - 86 * s]) + 'L' + pt([x + 26 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', dk(wd, 0.3), 0.85);
    for (var i = 1; i < 12; i++) sh += L('M' + pt([x - 30 * s, y - i * 7 * s]) + 'L' + pt([x + 30 * s, y - i * 7 * s]), dk(wd, 0.28), 0.9 * s, 0.7);
    sh += F('M' + pt([x - 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y + 2]) + 'L' + pt([x - 30 * s, y + 2]) + 'Z', st) + F('M' + pt([x + 6 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', dk(st, 0.28), 0.85) + L('M' + pt([x - 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y - 22 * s]), OL, 1.4 * s) + L('M' + pt([x - 30 * s, y - 11 * s]) + 'L' + pt([x + 30 * s, y - 11 * s]), dk(st, 0.3), 1 * s);
    out += body(c, tw, wd, sh, 2 * s);
    out += P('M' + pt([x - 7 * s, y]) + 'L' + pt([x - 7 * s, y - 16 * s]) + 'Q' + pt([x, y - 22 * s]) + ' ' + pt([x + 7 * s, y - 16 * s]) + 'L' + pt([x + 7 * s, y]) + 'Z', c.cel('#5a3a24'), 1.6 * s);
    out += R(x - 6 * s, y - 56 * s, 7 * s, 9 * s, '#2a1a12', 1.4 * s);
    // cap
    out += body(c, 'M' + pt([x - 21 * s, y - 82 * s]) + 'Q' + pt([x - 16 * s, y - 106 * s]) + ' ' + pt([x, y - 110 * s]) + 'Q' + pt([x + 16 * s, y - 106 * s]) + ' ' + pt([x + 21 * s, y - 82 * s]) + 'Z', ROOF, F('M' + pt([x + 2 * s, y - 112 * s]) + 'L' + pt([x + 24 * s, y - 112 * s]) + 'L' + pt([x + 24 * s, y - 80 * s]) + 'L' + pt([x + 6 * s, y - 80 * s]) + 'Z', dk(ROOF, 0.3), 0.8) + L('M' + pt([x - 18 * s, y - 90 * s]) + 'Q' + pt([x, y - 94 * s]) + ' ' + pt([x + 18 * s, y - 90 * s]) + 'M' + pt([x - 12 * s, y - 100 * s]) + 'Q' + pt([x, y - 103 * s]) + ' ' + pt([x + 12 * s, y - 100 * s]), dk(ROOF, 0.3), 1 * s), 2 * s);
    // sails
    var hx = x - 4 * s, hy = y - 90 * s, a0 = o.a0 == null ? -0.55 : o.a0, len = 64 * s, sail = o.sail || '#ece2c8';
    for (var k = 0; k < 4; k++) {
      var a = a0 + k * PI / 2, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca, e = [hx + ca * len, hy + sa * len];
      var sd = 'M' + pt([hx + ca * 12 * s + px * 2 * s, hy + sa * 12 * s + py * 2 * s]) + 'L' + pt([e[0] + px * 2 * s, e[1] + py * 2 * s]) + 'L' + pt([e[0] + px * 13 * s, e[1] + py * 13 * s]) + 'L' + pt([hx + ca * 14 * s + px * 13 * s, hy + sa * 14 * s + py * 13 * s]) + 'Z';
      out += P(sd, c.cel(sail), 1.4 * s);
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
  // stone watchtower of the People's Militia
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
      L('M' + pt([bx - bwid / 2 + 2 * s, by + 2 * s]) + 'L' + pt([bx - bwid / 2 + 2 * s, by + bh - 3 * s]) + 'M' + pt([bx + bwid / 2 - 2 * s, by + 2 * s]) + 'L' + pt([bx + bwid / 2 - 2 * s, by + bh - 3 * s]), SW_GOLD, 1 * s) + lionCrest(c, bx, by + 13 * s, 5 * s);
    // arrow slits + door
    o += R(x + 7 * s, top + 26 * s, 3 * s, 10 * s, '#1a1009') + R(x + 8 * s, top + 52 * s, 3 * s, 10 * s, '#1a1009');
    o += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 16 * s]) + 'Q' + pt([x, y - 24 * s]) + ' ' + pt([x + 8 * s, y - 16 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z', c.cel('#6a4428'), 1.8 * s) + L('M' + pt([x - 4 * s, y - 19 * s]) + 'L' + pt([x - 4 * s, y]) + 'M' + pt([x + 4 * s, y - 19 * s]) + 'L' + pt([x + 4 * s, y]), '#3a2414', 1 * s);
    return o;
  }
  // gold lion-head crest (sun-maned disc) for Stormwind banners
  function lionCrest(c, x, y, r) {
    return P(star(x, y, 9, r, r * 0.72), SW_GOLD, Math.max(0.6, r * 0.18)) + C(x, y, r * 0.52, dk(SW_GOLD, 0.25)) + C(x - r * 0.18, y - r * 0.1, r * 0.12, OL) + C(x + r * 0.18, y - r * 0.1, r * 0.12, OL);
  }
  function banner(c, x, y, h, s) {
    var o = E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25), top = y - h;
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#6a4a2a', 2.2 * s) + limb('M' + pt([x - 9 * s, top + 3 * s]) + 'L' + pt([x + 9 * s, top + 3 * s]), '#6a4a2a', 1.8 * s) + C(x, top - 1 * s, 2 * s, SW_GOLD, 1 * s);
    var bw = 16 * s, bh = 30 * s, by = top + 4 * s;
    o += P('M' + pt([x - bw / 2, by]) + 'L' + pt([x + bw / 2, by]) + 'L' + pt([x + bw / 2 + 1 * s, by + bh]) + 'L' + pt([x, by + bh - 7 * s]) + 'L' + pt([x - bw / 2 - 1 * s, by + bh]) + 'Z', c.cel(SW_BLUE), 1.6 * s) +
      F('M' + pt([x + 2 * s, by]) + 'L' + pt([x + bw / 2, by]) + 'L' + pt([x + bw / 2 + 1 * s, by + bh]) + 'L' + pt([x + 2 * s, by + bh - 6 * s]) + 'Z', dk(SW_BLUE, 0.3), 0.6) +
      L('M' + pt([x - bw / 2, by + 4 * s]) + 'L' + pt([x + bw / 2, by + 4 * s]), SW_GOLD, 1.2 * s) + lionCrest(c, x, by + 14 * s, 5 * s);
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
  // plank shack with a red cloth door (Defias hideout)
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
  // Riverpaw lean-to: crossed poles, ragged hide, skull on top
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
      // Elwynn's green treeline far to the east (left)
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

  // ---- Defias ----
  // hooded head with the red Defias mask over nose and mouth (facing left)
  function defiasHead(c, x, y, o) {
    var sk = o.skin || '#e4b48a', hood = o.hood || DEF_HOOD, mask = o.mask || DEF_RED, s = '';
    // hood back / cowl hanging behind the neck
    s += P('M' + pt([x - 4, y - 14]) + 'C' + pt([x + 6, y - 20]) + ' ' + pt([x + 18, y - 14]) + ' ' + pt([x + 17, y + 2]) + 'L' + pt([x + 20, y + 20]) + 'L' + pt([x + 6, y + 18]) + 'L' + pt([x + 2, y + 4]) + 'Z', c.cel(dk(hood, 0.12)), 2);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8));
    // eye + angry brow
    s += E(x - 5, y - 3, 2.2, 1.7, '#ffffff', 1) + C(x - 5.6, y - 3, 1.1, OL);
    s += L('M' + pt([x - 9, y - 7.5]) + 'L' + pt([x - 1, y - 5]), OL, 2.2);
    // mask over nose and mouth, knot at the back
    s += body(c, 'M' + pt([x - 14, y + 0.5]) + 'L' + pt([x + 10, y - 1]) + 'L' + pt([x + 10, y + 5]) + 'C' + pt([x + 8, y + 11]) + ' ' + pt([x + 2, y + 15]) + ' ' + pt([x - 4, y + 14]) + 'L' + pt([x - 9, y + 13]) + 'C' + pt([x - 11, y + 9]) + ' ' + pt([x - 12, y + 5]) + ' ' + pt([x - 14, y + 0.5]) + 'Z', mask,
      L('M' + pt([x - 11, y + 5]) + 'Q' + pt([x - 4, y + 7]) + ' ' + pt([x + 4, y + 5]) + 'M' + pt([x - 8, y + 10]) + 'Q' + pt([x - 2, y + 11]) + ' ' + pt([x + 4, y + 9]), dk(mask, 0.35), 1) + F('M' + pt([x + 2, y - 2]) + 'L' + pt([x + 12, y - 2]) + 'L' + pt([x + 12, y + 16]) + 'L' + pt([x, y + 16]) + 'Z', dk(mask, 0.3), 0.7), 1.8);
    s += P('M' + pt([x + 9, y + 1]) + 'L' + pt([x + 17, y + 3]) + 'L' + pt([x + 15, y + 8]) + 'Z', c.cel(mask), 1.4) + P('M' + pt([x + 9, y + 2]) + 'L' + pt([x + 18, y + 9]) + 'L' + pt([x + 13, y + 11]) + 'Z', c.cel(dk(mask, 0.1)), 1.4);
    // hood front: frames the face, open to the left
    s += body(c, 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 13, y - 17]) + ' ' + pt([x, y - 22]) + ' ' + pt([x + 9, y - 18]) + 'C' + pt([x + 15, y - 14]) + ' ' + pt([x + 16, y - 4]) + ' ' + pt([x + 14, y + 6]) + 'L' + pt([x + 8, y + 4]) + 'C' + pt([x + 8, y - 4]) + ' ' + pt([x + 4, y - 10]) + ' ' + pt([x - 3, y - 10]) + 'C' + pt([x - 7, y - 9]) + ' ' + pt([x - 10, y - 7]) + ' ' + pt([x - 12, y - 4]) + 'Z', hood,
      F('M' + pt([x + 4, y - 24]) + 'L' + pt([x + 18, y - 24]) + 'L' + pt([x + 18, y + 8]) + 'L' + pt([x + 9, y + 8]) + 'C' + pt([x + 10, y - 6]) + ' ' + pt([x + 8, y - 16]) + ' ' + pt([x + 4, y - 24]) + 'Z', dk(hood, 0.3), 0.75) + L('M' + pt([x - 8, y - 12]) + 'Q' + pt([x, y - 17]) + ' ' + pt([x + 8, y - 14]), lt(hood, 0.2), 1, 0.7), 2);
    return s;
  }
  function defias(c, o) {
    var pants = o.pants || '#4b3a2b';
    return biped(c, {
      skin: o.skin || '#e4b48a', shirt: o.torso || '#8d8474', pants: pants, sleeve: o.sleeve || '#8d8474', forearm: o.forearm, glove: o.glove || '#4a3526', boots: o.boots || '#2a211a', belt: o.belt || '#2b2018', buckle: o.buckle,
      head: function (c, x, y) { return defiasHead(c, x, y, o); }, hx: 60, hy: 30, neckCol: o.hood || DEF_HOOD,
      chest: function (c) { return (o.vest ? P('M48,50 L58,48 L62,88 L50,88 Z', c.cel(o.vest), 1.4) + P('M72,48 L80,50 L78,88 L68,88 Z', c.cel(dk(o.vest, 0.1)), 1.4) : '') + (o.chest ? o.chest(c) : ''); },
      back: o.back, front: o.front, pads: function (c) { return (o.armband ? R(43, 60, 10, 5, o.armband, 1.4) : '') + (o.pads ? o.pads(c) : ''); },
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, top: o.top, tf: o.tf, armW: o.armW || 9, legW: 10.5, shadowR: o.shadowR || 30
    });
  }
  function dagger(p, ang, s) { return sword(p, 18 * (s || 1), ang, '#d0d4da', 0.8); }
  function leatherPad(c, x, y, col, trim) { return body(c, 'M' + pt([x - 10, y + 4]) + 'C' + pt([x - 10, y - 6]) + ' ' + pt([x + 10, y - 7]) + ' ' + pt([x + 11, y + 4]) + 'Z', col, trim ? L('M' + pt([x - 8, y + 2]) + 'C' + pt([x - 6, y - 3]) + ' ' + pt([x + 6, y - 4]) + ' ' + pt([x + 9, y + 2]), trim, 1.4) : '', 2) + C(x, y - 1, 1.3, '#9a9aa0', 0.8); }

  // ---- murloc (same family shape as the Elwynn murlocs, facing left) ----
  function murloc(c, o) {
    var f = o.skin, fd = dk(f, 0.28), fin = o.fin, out = '';
    var bd = 'M30,66 C28,50 42,40 58,42 C76,44 90,56 90,76 C90,94 80,108 62,108 C46,108 36,98 34,86 C33,80 31,72 30,66 Z';
    out += shadow(c, 62, 32);
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
    out += L('M35,44 L46,46', OL, 2);
    if (o.fItem) out += o.fItem(c);
    out += tube([[56, 80], [44, 90], [33, 92]], 5.5, f, fd);
    out += P('M34,88 L25,86 L27,90 L22,92 L28,94 L25,98 L34,96 Z', c.cel(lt(f, 0.1)), 1.8);
    if (o.front) out += o.front(c);
    out += P('M52,98 C60,88 76,92 78,102 C80,110 72,114 64,112 Z', c.cel(f), 2.2) + tube([[66, 108], [58, 115], [52, 119]], 7, f, fd) + P('M36,118 L56,118 L60,123 L32,123 L36,121 Z', c.cel(fin), 2.2) + L('M42,119 L40,123 M49,119 L48,123', dk(fin, 0.4), 1);
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
  function foeReaper(c) {
    var red = '#b0402c', ir = '#5a5658', dir = dk(ir, 0.25), s = shadow(c, 64, 54);
    // exhaust stack + smoke
    s += C(104, 10, 6, '#8a8680', 0, 0.55) + C(112, 4, 5, '#a09c96', 0, 0.45) + C(96, 6, 4.4, '#9a9690', 0, 0.5);
    s += body(c, 'M92,34 L94,14 L102,14 L102,36 Z', ir, '', 1.8) + R(91, 11, 13, 5, c.cel(dir), 1.6);
    // far arm with raised scythe
    s += tube([[94, 50], [108, 40], [112, 24]], 9, dk(ir, 0.1)) + C(108, 40, 5, c.cel(dk(red, 0.15)), 1.8);
    s += G(scythe(c, [112, 24], 10, -1.3, 36, -1, '#c4c8cc', '#4a4448'), rot(22, 112, 24));
    // legs: thick pistons, clawed iron feet
    s += tube([[80, 90], [90, 104], [88, 114]], 12, dk(ir, 0.15)) + C(90, 104, 6, c.cel(dk(red, 0.15)), 1.8) + ironFoot(91, 121, dir) + P('M98,118 L104,122 L96,122 Z', '#8a8a90', 1.2);
    s += tube([[48, 90], [40, 104], [42, 114]], 13, ir, dk(ir, 0.3)) + C(40, 104, 6.5, c.cel(red), 1.8) + ironFoot(44, 121, ir) + P('M30,118 L24,122 L33,122 Z', '#8a8a90', 1.2);
    // big red riveted hull
    var hull = 'M30,56 C32,38 56,30 76,32 C98,34 108,48 106,66 C104,86 94,98 70,98 C46,98 30,88 30,72 Z';
    s += body(c, hull, red, F('M84,30 C100,36 110,52 108,70 C106,88 96,98 80,100 L112,100 L112,30 Z', dk(red, 0.35), 0.85) +
      L('M32,64 C50,60 84,60 106,62 M36,84 C54,80 84,80 102,82 M68,32 L66,98', dk(red, 0.4), 1.6) + F('M40,44 C50,36 64,34 74,36 C62,40 50,44 44,52 Z', lt(red, 0.3), 0.6) +
      E(52, 90, 10, 3, '#5a2a1a', 0, 0.5) + L('M58,64 l1,10 M86,64 l-1,12 M44,66 l0,8', '#6a3a22', 1.4, 0.7), 2.6);
    s += rivets([[36, 62], [48, 60], [60, 60], [74, 60], [88, 60], [100, 61], [40, 82], [54, 80], [80, 80], [94, 80], [66, 40], [66, 50], [66, 70], [66, 88]], '#e0d0b8');
    // chest grille + gear
    s += R(40, 66, 20, 12, '#2a1a14', 1.6) + L('M44,66 L44,78 M48,66 L48,78 M52,66 L52,78 M56,66 L56,78', '#8a8a90', 1.4) + C(50, 72, 12, glow(c, '#ff6a2a', 0.4));
    s += P(star(90, 48, 9, 9, 7), c.cel('#8a8a90'), 1.6) + C(90, 48, 3.4, dir, 1.2);
    s += strawBits(c, [[32, 74, 3.3, 9], [34, 88, 2.4, 9], [104, 84, 0.3, 8], [86, 96, 1.4, 8], [50, 98, 1.9, 7]]);
    // head: domed iron helm sunk into the shoulders, burlap hood flap, glowing eye
    var hx = 54, hy = 28;
    s += P('M' + pt([hx + 6, hy - 12]) + 'C' + pt([hx + 20, hy - 16]) + ' ' + pt([hx + 30, hy - 6]) + ' ' + pt([hx + 30, hy + 10]) + 'L' + pt([hx + 20, hy + 14]) + 'Z', c.cel('#b8986a'), 1.8) + L('M' + pt([hx + 16, hy - 12]) + 'L' + pt([hx + 22, hy + 10]), '#7a5a34', 1);
    var hd = 'M' + pt([hx - 16, hy + 6]) + 'C' + pt([hx - 18, hy - 8]) + ' ' + pt([hx - 8, hy - 18]) + ' ' + pt([hx + 4, hy - 18]) + 'C' + pt([hx + 16, hy - 18]) + ' ' + pt([hx + 22, hy - 6]) + ' ' + pt([hx + 20, hy + 8]) + 'L' + pt([hx + 16, hy + 16]) + 'L' + pt([hx - 12, hy + 16]) + 'Z';
    s += body(c, hd, dk(red, 0.1), F('M' + pt([hx + 6, hy - 20]) + 'L' + pt([hx + 24, hy - 20]) + 'L' + pt([hx + 24, hy + 18]) + 'L' + pt([hx + 10, hy + 18]) + 'C' + pt([hx + 14, hy + 4]) + ' ' + pt([hx + 12, hy - 10]) + ' ' + pt([hx + 6, hy - 20]) + 'Z', dk(red, 0.4), 0.8) + L('M' + pt([hx - 2, hy - 18]) + 'L' + pt([hx - 3, hy + 16]), dk(red, 0.4), 1.4) + F('M' + pt([hx - 10, hy - 10]) + 'C' + pt([hx - 6, hy - 15]) + ' ' + pt([hx, hy - 16]) + ' ' + pt([hx + 4, hy - 15]) + 'C' + pt([hx - 2, hy - 12]) + ' ' + pt([hx - 6, hy - 8]) + ' ' + pt([hx - 8, hy - 4]) + 'Z', lt(red, 0.3), 0.6), 2.4);
    s += rivets([[hx - 12, hy + 12], [hx - 2, hy + 12], [hx + 10, hy + 12], [hx + 16, hy - 4]], '#e0d0b8');
    // visor slit with a burning eye
    s += C(hx - 6, hy, 22, glow(c, '#ff4a1a', 0.6)) + P('M' + pt([hx - 18, hy - 2]) + 'L' + pt([hx + 6, hy - 5]) + 'L' + pt([hx + 6, hy + 3]) + 'L' + pt([hx - 17, hy + 5]) + 'Z', '#1a0a06', 1.8);
    s += E(hx - 8, hy + 0.2, 6, 2.6, '#ff6a2a') + E(hx - 9, hy - 0.2, 3, 1.4, '#ffe080');
    s += L('M' + pt([hx - 18, hy - 7]) + 'L' + pt([hx + 4, hy - 10]), OL, 2.6);
    // jaw grate
    s += R(hx - 14, hy + 8, 22, 6, '#2a1a14', 1.4) + L('M' + pt([hx - 10, hy + 8]) + 'l0,6 M' + pt([hx - 5, hy + 8]) + 'l0,6 M' + pt([hx, hy + 8]) + 'l0,6 M' + pt([hx + 5, hy + 8]) + 'l0,6', '#9a9aa0', 1.2);
    // near arm: huge scythe sweeping in front
    s += scythe(c, [24, 86], 48, -1.36, 30, -1, '#d0d4d8', '#4a4448');
    s += tube([[40, 54], [30, 70], [24, 84]], 11, ir, dk(ir, 0.3)) + C(40, 54, 9, c.cel(red), 2.2) + C(30, 70, 5.5, c.cel(dk(red, 0.1)), 1.8) + R(17, 80, 14, 10, c.cel(dir), 1.8);
    s += rivets([[36, 50], [44, 50], [40, 58]], '#e0d0b8');
    return G(s, at(1.02, 64, 122));
  }

  // ---- Riverpaw gnoll: same head as art.js riverpaw_gnoll / hogger (ported, drawn facing right, then mirrored) ----
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
        hood: '#6a5038', torso: '#5a4a3a', sleeve: '#6a5a48', pants: '#3e3228', boots: '#241a14', belt: '#2b2018',
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
        hood: '#8e1c22', mask: '#b82d31', torso: '#3e302a', sleeve: '#4a3a30', vest: '#2a201c', pants: '#2e2620', boots: '#1a1410', belt: '#1a1410', buckle: '#c8c0a8', glove: '#2a1e18',
        pads: function (c) { return leatherPad(c, 80, 52, '#3a2c24', DEF_RED) + leatherPad(c, 48, 52, '#4a3a2e', DEF_RED); },
        chest: function () { return L('M50,54 L78,86 M78,54 L52,86', '#1e1612', 2.2); },
        near: [[48, 54], [38, 68], [30, 74]], far: [[80, 54], [90, 62], [96, 54]],
        wNear: function (c, p) { return sword(p, 30, -2.25, '#d0d4da', 0.9); },
        wFar: function (c, p) { return sword(p, 28, -1.2, '#b8bcc2', 0.85); },
        tf: at(1.04, 64, 122)
      });
    },
    murloc_coastrunner: function (c) {
      return murloc(c, {
        skin: '#8aa452', belly: '#ece0b0', fin: '#d8904a', scale: 0.98,
        fItem: function (c) { return spear(c, [22, 40], [36, 118], 14, '#c8c0a8', '#8a6a44'); }
      });
    },
    murloc_tidehunter: function (c) {
      return murloc(c, {
        skin: '#5e7e8e', belly: '#cadad2', fin: '#6a5a9a', eyeC: '#f0f0c0', scale: 1.1,
        marks: function () { return L('M58,58 l6,6 M66,54 l6,6 M74,60 l5,5', '#3a5464', 2, 0.7); },
        back: function (c) { return net(c, [58, 38], [96, 70], 14, '#c8c0a0', '#e0a040'); },
        front: function (c) { return netHang(c, [27, 92], 26, 26, '#e0d8b8', '#e0a040', -4); }
      });
    },
    foe_reaper: function (c) { return foeReaper(c); },
    riverpaw_brute: function (c) { return riverpawBrute(c); },
    dust_devil: function (c) { return shadow(c, 64, 34) + dustDevilArt(c); }
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
